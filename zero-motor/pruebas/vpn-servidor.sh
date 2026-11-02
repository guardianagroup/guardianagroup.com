#!/usr/bin/env bash
# GUARDIANA · prueba de verdad de zero-motor/vpn.sh y de su paso por el 443 de instalar.sh, en un Ubuntu con systemd
# (.github/workflows/vpn-servidor.yml; 2 Nov 2026, antes de llevar la VPN a Helsinki).
#
# 1. vpn.sh como en el servidor: compila el alta del commit fijado y monta WireGuard, las reglas de red, Unbound y el
#    servicio. Se comprueba lo que deja: servicios, direcciones, permisos, y que el servidor sigue resolviendo como antes.
# 2. Equipos de prueba, cada uno en su espacio de red, con su alta y su túnel con todo dentro: tráfico, resolutor, salida a
#    internet; y lo que no debe pasar (los servicios del propio servidor, las redes privadas, un equipo a otro).
# 3. Una segunda ejecución de vpn.sh sin cortes, y un reinicio del alta sin que nadie pierda su túnel ni su dirección.
# 4. El 443 compartido con la configuración que escribe instalar.sh (nginx reparte por nombre y por ALPN; Caddy con
#    certificados locales de prueba): el alta con el cliente de verdad, que no manda ALPN, por https; el TURN-TLS sigue
#    yendo a coturn; y con el alta parada, Caddy responde 503 sin apuntar a nadie en el diario.
#
# Llaves de prueba, hechas aquí y tiradas con la máquina. Necesita sudo, dig y ncat.
set -euo pipefail
cd "$(dirname "$0")/../.."
T="${RUNNER_TEMP:-$(mktemp -d)}"
URL_LOCAL=http://127.0.0.1:8793/vpn/alta
# con pipefail, «orden | grep -q» falla si grep sale antes de que la orden termine de escribir: se lee todo primero
tiene() { local patron="$1"; shift; grep -qE -- "$patron" <<< "$("$@" 2>&1 || true)"; }

ok() { printf '✓ %s\n' "$*"; }
falla() { printf '::error title=vpn-servidor::%s\n' "$*"; exit 1; }
alta_responde() {
  for _ in $(seq 1 30); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$URL_LOCAL")" = 422 ] && return 0
    sleep 1
  done
  return 1
}
# Un equipo de prueba: su espacio de red ($1), unido al servidor por un cable virtual (192.168.$3.0/24), su alta por $2 y su
# túnel con todo dentro, como el programa (el resolutor, el del túnel). Escribe su dirección en el túnel.
equipo() {
  local n="$1" url="$2" r="$3" d
  sudo ip netns add "$n"
  sudo ip link add "h-$n" type veth peer name "c-$n"
  sudo ip link set "c-$n" netns "$n"
  sudo ip addr add "192.168.$r.1/24" dev "h-$n"
  sudo ip link set "h-$n" up
  sudo ip -n "$n" addr add "192.168.$r.2/24" dev "c-$n"
  sudo ip -n "$n" link set "c-$n" up
  sudo ip -n "$n" link set lo up
  alta_prueba "$url" > "$T/$n.ini" 2> "$T/$n.err" || { cat "$T/$n.err" >&2; return 1; }
  d=$(sed -n 's/^Address = //p' "$T/$n.ini")
  grep -v -E '^(Address|DNS|MTU) = ' "$T/$n.ini" | sed -E "s#^Endpoint = .*#Endpoint = 192.168.$r.1:51820#" > "$T/$n.conf"
  sudo ip -n "$n" link add wg0 type wireguard
  sudo ip netns exec "$n" wg setconf wg0 "$T/$n.conf"
  sudo ip -n "$n" addr add "$d" dev wg0
  sudo ip -n "$n" link set wg0 mtu 1420 up
  sudo ip -n "$n" route add default dev wg0
  sudo mkdir -p "/etc/netns/$n"
  echo "nameserver 10.66.0.1" | sudo tee "/etc/netns/$n/resolv.conf" > /dev/null
  echo "${d%/32}"
}
llega() { sudo ip netns exec "$1" ping -c 2 -W 3 10.66.0.1 > /dev/null; }

# ── 1. vpn.sh, la primera vez ───────────────────────────────────────────────────────────────────────────────────────
# Docker (de la imagen de GitHub) deja el reenvío del cortafuegos en DROP; el servidor no tiene Docker
sudo iptables -P FORWARD ACCEPT
getent hosts github.com > /dev/null || falla "la máquina de prueba no resuelve nombres ni antes de empezar"
if ! sudo VPN_NOMBRE=prueba.guardianagroup.com timeout 50m bash zero-motor/vpn.sh; then
  sudo tail -n 60 /var/log/guardiana-vpn-compilacion.log || true
  falla "vpn.sh no terminó bien"
fi
for s in guardiana-wg0 guardiana-vpn-red unbound guardiana-vpn-alta; do
  systemctl -q is-active "$s" || falla "$s no está activo"
done
tiene 'inet 10\.66\.0\.1/16' ip -4 addr show wg0 || falla "wg0 sin 10.66.0.1/16"
[ "$(sudo wg show wg0 listen-port)" = 51820 ] || falla "wg0 no escucha en 51820"
sudo nft list table inet guardiana_vpn > /dev/null || falla "sin la tabla de reglas del túnel"
ok "vpn.sh: wg0 en 10.66.0.1/16 y UDP 51820, reglas, Unbound y el alta, activos"
getent hosts github.com > /dev/null || falla "tras vpn.sh, el servidor ya no resuelve nombres"
if tiene '127\.0\.0\.1' resolvectl dns; then falla "Unbound se ha puesto de resolutor del propio servidor"; fi
ok "el servidor sigue resolviendo como antes (Unbound no se ha metido en su DNS)"
escucha=$(sudo ss -Hulpn 'sport = :53' | awk '/unbound/ {print $4}' | sort -u | tr '\n' ' ')
[ "$escucha" = "10.66.0.1:53 " ] || falla "Unbound escucha en: $escucha"
# recién arrancado, Unbound tarda un poco en su primera respuesta (la raíz y DNSSEC): hasta 30 segundos
resuelve() {
  local i
  for i in $(seq 1 10); do
    tiene '^[0-9.]+$' "$@" +short +time=3 +tries=1 example.com A && return 0
    sleep 1
  done
  "$@" example.com A >&2 || true
  return 1
}
if ! resuelve dig @10.66.0.1; then
  ip route get 10.66.0.1 >&2 || true
  sudo journalctl -u unbound -n 20 --no-pager >&2 || true
  falla "Unbound no resuelve"
fi
ok "Unbound solo en 10.66.0.1:53, y resuelve"
[ "$(sudo stat -c '%a %U' /etc/guardiana/vpn/servidor.key)" = "600 root" ] || falla "la llave del servidor no es 600 de root"
[ "$(stat -c '%U %a' /usr/local/bin/guardiana-tunel-servidor)" = "root 755" ] || falla "el programa del alta no es de root"
[ "$(cat /var/lib/guardiana-vpn/compilado)" = "$(sed -n 's/^COMMIT="\(.*\)"$/\1/p' zero-motor/vpn.sh)" ] \
  || falla "el commit apuntado no es el fijado"
pgrep -u gvpn > /dev/null && falla "quedan procesos de gvpn tras compilar"
ok "llave 600 de root, programa de root, commit fijado apuntado por root, nada de gvpn vivo"
systemd-analyze security --no-pager guardiana-vpn-alta | tail -n 1

# ── 2. equipos de prueba ────────────────────────────────────────────────────────────────────────────────────────────
sudo -u gvpn -H bash -euo pipefail -c 'cd ~/src && CARGO_TARGET_DIR=~/target ~/.cargo/bin/cargo build -q --release --locked -p guardiana-tunel --example alta_prueba'
sudo install -m 755 /opt/guardiana-vpn/target/release/examples/alta_prueba /usr/local/bin/alta_prueba
sudo pkill -KILL -u gvpn 2> /dev/null || true

u1=$(equipo e1 "$URL_LOCAL" 71) || falla "el alta de e1 no salió"
llega e1 || falla "e1 no llega al servidor por el túnel"
tiene '[[:space:]][A-Za-z0-9+/]{43}=' sudo wg show wg0 preshared-keys || falla "el par no tiene llave postcuántica"
ok "e1 ($u1): alta postcuántica y túnel"
resuelve sudo ip netns exec e1 dig @10.66.0.1 || falla "e1 no resuelve por el túnel"
c=$(sudo ip netns exec e1 curl -sS --max-time 20 -o /dev/null -w '%{http_code}' https://example.com/) || true
[[ "$c" =~ ^(200|30[0-9])$ ]] || falla "e1 no sale a internet por el túnel ($c)"
sudo ip netns exec e1 curl -sS --max-time 60 -o "$T/grande.html" https://github.com/ || falla "e1: una página grande no llega (¿MTU?)"
ok "e1 resuelve con Unbound y sale a internet por el túnel ($(wc -c < "$T/grande.html") bytes de una página grande)"

# lo que no debe pasar: un servicio del propio servidor, su red, el servicio de metadatos de la nube y docker0
sudo python3 -m http.server 9999 --bind 0.0.0.0 > /dev/null 2>&1 &
sleep 2
curl -s -o /dev/null --max-time 3 http://127.0.0.1:9999/ || falla "el servicio de prueba no arrancó"
yo=$(ip -4 route get 1.1.1.1 | sed -n 's/.* src \([0-9.]*\).*/\1/p')
for destino in "http://10.66.0.1:9999/" "http://$yo:9999/" "http://169.254.169.254/" "http://172.17.0.1:9999/"; do
  if sudo ip netns exec e1 curl -s -o /dev/null --max-time 4 "$destino"; then falla "desde el túnel se llega a $destino"; fi
done
ok "desde el túnel no se llega a los servicios del servidor ni a redes privadas"

u2=$(equipo e2 "$URL_LOCAL" 72) || falla "el alta de e2 no salió"
[ "$u2" != "$u1" ] || falla "dos equipos con la misma dirección"
llega e2 || falla "e2 no llega al servidor"
if sudo ip netns exec e2 ping -c 2 -W 2 "$u1" > /dev/null 2>&1; then falla "un equipo llega a otro por el túnel"; fi
ok "e2 ($u2): su propia dirección, y no ve a e1"

# ── 3. segunda ejecución y reinicio del alta ───────────────────────────────────────────────────────────────────────
antes=$(systemctl show -p MainPID --value guardiana-vpn-alta)
sudo VPN_NOMBRE=prueba.guardianagroup.com timeout 10m bash zero-motor/vpn.sh > /dev/null || falla "la segunda ejecución de vpn.sh falló"
[ "$(systemctl show -p MainPID --value guardiana-vpn-alta)" = "$antes" ] || falla "la segunda ejecución reinició el alta sin cambios"
llega e1 && llega e2 || falla "tras la segunda ejecución, un equipo sin túnel"
ok "segunda ejecución: nada reiniciado y los túneles siguen"

sudo systemctl restart guardiana-vpn-alta
alta_responde || falla "el alta no vuelve tras reiniciarse"
u3=$(equipo e3 "$URL_LOCAL" 73) || falla "el alta de e3 no salió"
[ "$u3" != "$u1" ] && [ "$u3" != "$u2" ] || falla "tras reiniciar el alta, dio una dirección ocupada ($u3)"
for e in e1 e2 e3; do llega "$e" || falla "tras el reinicio del alta, $e sin túnel"; done
[ "$(sudo wg show wg0 peers | wc -l)" = 3 ] || falla "pares en wg0: $(sudo wg show wg0 peers | wc -l)"
ok "reinicio del alta: los tres siguen, cada uno con su dirección ($u1, $u2, $u3)"

# ── 4. el 443 compartido de instalar.sh ────────────────────────────────────────────────────────────────────────────
printf '#!/bin/sh\nexit 101\n' | sudo tee /usr/sbin/policy-rc.d > /dev/null
sudo chmod 755 /usr/sbin/policy-rc.d
sudo apt-get install -y -qq nginx libnginx-mod-stream > /dev/null
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
sudo apt-get update -qq && sudo apt-get install -y -qq caddy > /dev/null
sudo rm -f /usr/sbin/policy-rc.d /etc/nginx/sites-enabled/default

# nginx.conf tal cual lo escribe instalar.sh
awk '/^    cat > \/etc\/nginx\/nginx.conf <<.EOF.$/{f=1;next} f&&/^EOF$/{exit} f' zero-motor/instalar.sh | sudo tee /etc/nginx/nginx.conf > /dev/null
sudo nginx -t -q || falla "nginx no acepta la configuración de instalar.sh"
# los dos Caddyfile de instalar.sh (Caddy directo y el 443 compartido), con el bloque de la VPN; el segundo, con certificados
# locales de prueba en lugar de los de Let's Encrypt
VPN_CADDY=$(awk '/^    VPN_CADDY=.$/{f=1;next} f&&/^}.$/{print "}";exit} f' zero-motor/instalar.sh)
SITIOS=motor-hel.guardianagroup.com
PUERTO=8792
for n in 1 2; do
  awk -v n="$n" '/cat > \/etc\/caddy\/Caddyfile <<EOF$/{k++; if(k==n){f=1;next}} f&&/^EOF$/{exit} f' zero-motor/instalar.sh > "$T/plantilla$n"
  eval "cat <<FIN
$(cat "$T/plantilla$n")
FIN" > "$T/Caddyfile$n"
  grep -q 'vpn.guardianagroup.com {' "$T/Caddyfile$n" || falla "el Caddyfile $n no lleva el bloque de la VPN"
  caddy validate --config "$T/Caddyfile$n" --adapter caddyfile > /dev/null 2>&1 || falla "Caddy no acepta el Caddyfile $n de instalar.sh"
done
ok "nginx y los dos Caddyfile de instalar.sh, aceptados"
sed '0,/^{$/s//{\n\tlocal_certs/' "$T/Caddyfile2" | sudo tee /etc/caddy/Caddyfile > /dev/null
echo "127.0.0.1 vpn.guardianagroup.com motor-hel.guardianagroup.com" | sudo tee -a /etc/hosts > /dev/null
# coturn de mentira en 5349: apunta lo que le llega
ncat -lk 127.0.0.1 5349 > "$T/coturn.bin" &
sudo systemctl restart caddy
sudo systemctl restart nginx
raiz=/var/lib/caddy/.local/share/caddy/pki/authorities/local/root.crt
for _ in $(seq 1 30); do sudo test -f "$raiz" && break; sleep 1; done
sudo cp "$raiz" /usr/local/share/ca-certificates/caddy-prueba.crt
sudo update-ca-certificates > /dev/null 2>&1
for _ in $(seq 1 30); do
  [ "$(curl -s --no-alpn -o /dev/null -w '%{http_code}' https://vpn.guardianagroup.com/)" = 404 ] && break
  sleep 1
done

c=$(curl -s --no-alpn -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' https://vpn.guardianagroup.com/vpn/alta)
[ "$c" = 422 ] || falla "sin ALPN, por el 443 compartido, el alta da $c (se esperaba 422 del alta)"
c=$(curl -s -o /dev/null -w '%{http_code}' https://vpn.guardianagroup.com/)
[ "$c" = 404 ] || falla "fuera de /vpn/alta da $c (se esperaba 404)"
u4=$(equipo e4 https://vpn.guardianagroup.com/vpn/alta 74) || falla "el alta de verdad por https (nginx → Caddy → alta) no salió"
llega e4 || falla "e4 sin túnel"
ok "el alta con el cliente del programa (sin ALPN), por https y el 443 compartido: e4 ($u4) con su túnel"

tam() { stat -c %s "$T/coturn.bin"; }
t0=$(tam)
timeout 5 openssl s_client -connect 127.0.0.1:443 -servername motor-hel.guardianagroup.com < /dev/null > /dev/null 2>&1 || true
sleep 1
t1=$(tam)
[ "$t1" -gt "$t0" ] || falla "el TURN-TLS (sin ALPN, con el nombre del motor) ya no llega a coturn"
for sni in vpn.guardianagroup.com motor-hel.guardianagroup.com; do
  tiene 'Verify return code: 0' timeout 5 openssl s_client -connect 127.0.0.1:443 -servername "$sni" -alpn http/1.1 \
    -verify_return_error < /dev/null || falla "con ALPN, $sni no llega a Caddy"
done
tiene 'Verify return code: 0' timeout 5 openssl s_client -connect 127.0.0.1:443 -servername vpn.guardianagroup.com \
  -verify_return_error < /dev/null || falla "sin ALPN, vpn.guardianagroup.com no llega a Caddy"
sleep 1
[ "$(tam)" = "$t1" ] || falla "algo que debía ir a Caddy ha ido a coturn"
ok "el TURN-TLS sigue yendo a coturn; la web y el alta, a Caddy"

desde=$(date '+%Y-%m-%d %H:%M:%S')
sudo systemctl stop guardiana-vpn-alta
c=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' https://vpn.guardianagroup.com/vpn/alta)
[ "$c" = 503 ] || falla "con el alta parada da $c (se esperaba 503)"
sleep 2
if sudo journalctl -u caddy --since "$desde" -o cat --no-pager | grep -E 'http\.log\.error|remote_ip|client_ip'; then
  falla "Caddy apuntó en el diario la petición de alguien"
fi
sudo systemctl start guardiana-vpn-alta
alta_responde || falla "el alta no vuelve"
for e in e1 e2 e3 e4; do llega "$e" || falla "$e sin túnel tras parar y volver a arrancar el alta"; done
ok "con el alta parada, 503 sin apuntar a nadie; al volver, los cuatro siguen con su túnel"

# ── el diario y la salud del alta ──────────────────────────────────────────────────────────────────────────────────
if sudo journalctl -u guardiana-vpn-alta -o cat --no-pager | grep -E '([0-9]{1,3}\.){3}[0-9]{1,3}'; then
  falla "el alta escribió direcciones en el diario"
fi
[ "$(systemctl show -p NRestarts --value guardiana-vpn-alta)" = 0 ] || falla "el alta se ha caído y vuelto a arrancar solo"
ok "el alta no escribe direcciones y no se ha caído ni una vez"
