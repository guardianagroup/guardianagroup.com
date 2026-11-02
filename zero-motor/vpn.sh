#!/usr/bin/env bash
# GUARDIANA · la VPN en este servidor (2 Nov 2026; dueño, 10:40: «Utilizamos el de Helsinki. Conéctalo ya»).
# La llama instalar.sh en el servidor de Helsinki (o donde exista /etc/guardiana/vpn), como root. Idempotente y sin
# cortes: al volver a ejecutarse no toca la llave del servidor ni la interfaz wg0 con sus equipos conectados, y solo
# reinicia lo que ha cambiado (el alta, si cambia su programa o su servicio; Unbound, si cambia su configuración). Las
# reglas de red se vuelven a cargar de una vez, sin un momento sin ellas.
#
# - WireGuard del núcleo: wg0, UDP 51820, red 10.66.0.0/16; el servidor y su resolutor en 10.66.0.1. La llave privada se
#   genera aquí la primera vez y no sale de esta máquina.
# - El alta de GUARDIANA (crates/tunel-servidor del programa, compilado aquí desde el commit fijado abajo, del repositorio
#   público): escucha solo en 127.0.0.1:8793, detrás de Caddy en https://vpn.guardianagroup.com/vpn/alta. Sin registros: los
#   equipos viven en la memoria del núcleo y se quitan tras 24 horas sin uso; el servicio no escribe nada en disco. Al
#   arrancar toma los equipos que wg0 ya tiene, así que un reinicio no deja a nadie sin túnel ni da su dirección a otro.
#   Con lo mínimo: solo puede cambiar los pares de WireGuard y hablar con este mismo servidor.
# - Unbound en 10.66.0.1, solo para la red del túnel: DNSSEC y sin registro de consultas.
# - Salida a internet con NAT. Puerto 25 cerrado (contra el spam). Desde el túnel no se llega a redes privadas ni a los
#   servicios de este servidor (salvo su resolutor), un equipo no ve a otro, y hay un tope de conexiones nuevas por equipo.
# - El programa lo compila un usuario sin privilegios (gvpn). root no sigue ningún camino que gvpn pueda cambiar: lee lo
#   compilado a través de gvpn, lo comprueba y lo instala él; y apunta qué commit instaló en una carpeta suya.
#
# Prueba de verdad (sistema, túnel, NAT, resolutor, aislamiento, segunda ejecución y reinicio del alta):
# .github/workflows/vpn-servidor.yml.
set -euo pipefail

NOMBRE="${VPN_NOMBRE:-vpn.guardianagroup.com}"
REPO_PROG="https://github.com/guardianagroup/guardiana.git"
# el programa del servidor: este commit exacto de la rama antivirus-vpn (docs/VPN.md del programa)
COMMIT="44397927a202cbf7ab9d0358da778c18b150b4c8"
VB=/opt/guardiana-vpn
ESTADO=/var/lib/guardiana-vpn
BIN=/usr/local/bin/guardiana-tunel-servidor
LLAVE=/etc/guardiana/vpn/servidor.key
RED=/etc/guardiana/vpn/red.nft
UNIDADES=/etc/systemd/system

rojo() { printf '\033[31m%s\033[0m\n' "$*" >&2; }
paso() { printf '  · %s\n' "$*"; }

# Deja en $1 lo que llega por la entrada si es distinto de lo que ya hay. Sale bien (0) si lo ha cambiado.
escribe() {
  local destino="$1" nuevo
  nuevo=$(mktemp)
  cat > "$nuevo"
  if [ -f "$destino" ] && cmp -s "$nuevo" "$destino"; then rm -f "$nuevo"; return 1; fi
  install -m "${2:-644}" "$nuevo" "$destino"
  rm -f "$nuevo"
}

[ "$(id -u)" = 0 ] || { rojo "vpn.sh: hace falta root"; exit 1; }
# la carpeta de la VPN, lo primero: con ella, el actualizador de este servidor vuelve a ejecutar vpn.sh cuando cambie, aunque
# esta primera vez la compilación falle (memoria, la red)
install -d -m 700 /etc/guardiana/vpn

paso "Paquetes: WireGuard, Unbound, nftables y lo necesario para compilar"
# el paquete de Unbound se ofrece como resolutor del propio servidor (unbound-resolvconf, con 127.0.0.1): aquí no, que
# solo escucha en el túnel y el servidor tiene que seguir resolviendo como siempre (sus actualizaciones, sus certificados)
systemctl mask unbound-resolvconf.service >/dev/null 2>&1 || true
DEBIAN_FRONTEND=noninteractive apt-get install -y -q wireguard-tools unbound nftables build-essential pkg-config git curl \
  ca-certificates >/var/log/guardiana-vpn-paquetes.log 2>&1
if command -v resolvconf >/dev/null 2>&1; then resolvconf -d lo.unbound >/dev/null 2>&1 || true; fi

paso "El programa del alta (commit ${COMMIT:0:7}), compilado por un usuario sin privilegios"
id gvpn >/dev/null 2>&1 || useradd --system --create-home --home-dir "$VB" --shell /usr/sbin/nologin gvpn
install -d -o gvpn -g gvpn -m 755 "$VB"
install -d -o root -g root -m 755 "$ESTADO"
nuevo_bin=0
if [ ! -x "$BIN" ] || [ "$(cat "$ESTADO/compilado" 2>/dev/null || true)" != "$COMMIT" ]; then
  if ! timeout 40m sudo -u gvpn -H bash -euo pipefail -c '
    cd "$HOME"
    if [ ! -x "$HOME/.cargo/bin/cargo" ]; then
      curl -sSf --proto "=https" --tlsv1.2 https://sh.rustup.rs -o rustup-init.sh
      sh rustup-init.sh -y -q --profile minimal --default-toolchain stable --no-modify-path
      rm -f rustup-init.sh
    fi
    rm -rf src && mkdir src && cd src
    git init -q
    git fetch -q --depth 1 "'"$REPO_PROG"'" "'"$COMMIT"'"
    git checkout -q FETCH_HEAD
    [ "$(git rev-parse HEAD)" = "'"$COMMIT"'" ] || { echo "el commit no es el fijado" >&2; exit 1; }
    CARGO_TARGET_DIR="$HOME/target" "$HOME/.cargo/bin/cargo" build -q --release --locked -j 2 \
      -p guardiana-tunel-servidor --bin guardiana-tunel-servidor
  ' >/var/log/guardiana-vpn-compilacion.log 2>&1; then
    pkill -KILL -u gvpn 2>/dev/null || true
    rojo "vpn.sh: no se pudo compilar (/var/log/guardiana-vpn-compilacion.log)"
    exit 1
  fi
  # nada de lo que arrancó la compilación (los guiones de compilación de las dependencias) sigue vivo
  pkill -KILL -u gvpn 2>/dev/null || true
  # lo compilado se lee como gvpn (si fuera un enlace a otro archivo, gvpn no podría leerlo), con un tope de tamaño, y
  # root lo escribe en su sitio
  nuevo=$(mktemp /usr/local/bin/.guardiana-tunel-servidor.XXXXXX)
  if ! sudo -u gvpn cat "$VB/target/release/guardiana-tunel-servidor" | head -c 268435456 > "$nuevo" \
     || [ "$(head -c 4 "$nuevo" | od -An -tx1 | tr -d ' \n')" != "7f454c46" ]; then
    rm -f "$nuevo"
    rojo "vpn.sh: lo compilado no se pudo leer o no es un programa"
    exit 1
  fi
  chmod 755 "$nuevo"
  mv -f "$nuevo" "$BIN"
  echo "$COMMIT" > "$ESTADO/compilado"
  nuevo_bin=1
fi

paso "La llave del servidor (se queda en esta máquina)"
install -d -m 700 /etc/guardiana/vpn
if [ ! -s "$LLAVE" ]; then (umask 077; wg genkey > "$LLAVE"); fi
chmod 600 "$LLAVE"

paso "El túnel: wg0, UDP 51820, 10.66.0.1/16"
escribe "$UNIDADES/guardiana-wg0.service" <<EOF || true
[Unit]
Description=GUARDIANA · VPN: la interfaz WireGuard (wg0)
After=network-online.target
Wants=network-online.target
Before=unbound.service guardiana-vpn-alta.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/sh -c 'ip link show wg0 >/dev/null 2>&1 || ip link add wg0 type wireguard; wg set wg0 private-key $LLAVE listen-port 51820; ip addr replace 10.66.0.1/16 dev wg0; ip link set wg0 up'
ExecStop=/bin/sh -c 'ip link del wg0 2>/dev/null || true'

[Install]
WantedBy=multi-user.target
EOF

paso "Reenvío de paquetes"
echo "net.ipv4.ip_forward = 1" > /etc/sysctl.d/91-guardiana-vpn.conf
sysctl -q -p /etc/sysctl.d/91-guardiana-vpn.conf

paso "Reglas de red del túnel (nftables, tabla propia)"
SALIDA=$(ip route show default | awk '{print $5; exit}')
[ -n "$SALIDA" ] || { rojo "vpn.sh: no encuentro la interfaz de salida"; exit 1; }
red_nueva=0
if escribe "$RED" 600 <<'EOF'; then red_nueva=1; fi
# GUARDIANA · VPN (zero-motor/vpn.sh). Solo la red del túnel; no toca nada más del servidor. Se carga de una vez (nft -f):
# la tabla se borra y se vuelve a crear en la misma transacción.
table inet guardiana_vpn
delete table inet guardiana_vpn
table inet guardiana_vpn {
	set privadas {
		type ipv4_addr
		flags interval
		elements = { 0.0.0.0/8, 10.0.0.0/8, 100.64.0.0/10, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12,
		             192.0.0.0/24, 192.168.0.0/16, 198.18.0.0/15, 224.0.0.0/4, 240.0.0.0/4 }
	}
	set nuevas {
		type ipv4_addr
		flags dynamic
		timeout 1m
	}
	chain entrada {
		type filter hook input priority filter - 5; policy accept;
		iifname "wg0" ip daddr 10.66.0.1 udp dport 53 accept
		iifname "wg0" ip daddr 10.66.0.1 tcp dport 53 accept
		iifname "wg0" ip daddr 10.66.0.1 icmp type echo-request limit rate 5/second accept
		iifname "wg0" drop
	}
	chain paso {
		type filter hook forward priority filter - 5; policy accept;
		# el tamaño de los segmentos TCP, al del túnel (si no, algunas webs se quedan colgadas)
		oifname "wg0" tcp flags & (syn | rst) == syn tcp option maxseg size set rt mtu
		iifname "wg0" oifname "wg0" drop
		iifname "wg0" ip daddr @privadas drop
		iifname "wg0" tcp dport 25 drop
		iifname "wg0" ct state new add @nuevas { ip saddr limit rate over 60/second burst 200 packets } drop
		iifname "wg0" accept
		oifname "wg0" ct state established,related accept
		oifname "wg0" drop
	}
	chain salida_nat {
		type nat hook postrouting priority srcnat; policy accept;
		# solo lo que sale a internet; no lo que va por el túnel ni lo que el servidor se manda a sí mismo (por lo, que
		# si no tomaría otra dirección del servidor y Unbound la rechazaría)
		ip saddr 10.66.0.0/16 oifname != { "wg0", "lo" } masquerade
	}
}
EOF
nft -c -f "$RED"
escribe "$UNIDADES/guardiana-vpn-red.service" <<EOF || true
[Unit]
Description=GUARDIANA · VPN: reglas de red del túnel
After=guardiana-wg0.service
Requires=guardiana-wg0.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/sbin/nft -f $RED
ExecReload=/usr/sbin/nft -f $RED
ExecStop=/usr/sbin/nft delete table inet guardiana_vpn

[Install]
WantedBy=multi-user.target
EOF

paso "El resolutor del túnel (Unbound en 10.66.0.1)"
dns_nuevo=0
if escribe /etc/unbound/unbound.conf.d/guardiana-vpn.conf <<'EOF'; then dns_nuevo=1; fi
# GUARDIANA · VPN (zero-motor/vpn.sh): solo para la red del túnel. Sin registro de consultas.
server:
	interface: 10.66.0.1
	ip-freebind: yes
	access-control: 0.0.0.0/0 refuse
	access-control: 10.66.0.0/16 allow
	do-ip6: no
	hide-identity: yes
	hide-version: yes
	qname-minimisation: yes
	harden-glue: yes
	harden-dnssec-stripped: yes
	prefetch: yes
	verbosity: 0
	log-queries: no
	log-replies: no
	log-local-actions: no
	log-servfail: no
EOF
unbound-checkconf >/dev/null

paso "El servicio del alta (solo en 127.0.0.1:8793; sin registros; con lo mínimo)"
alta_nueva=0
if escribe "$UNIDADES/guardiana-vpn-alta.service" <<EOF; then alta_nueva=1; fi
[Unit]
Description=GUARDIANA · VPN: el alta de los equipos
After=network-online.target guardiana-wg0.service
Requires=guardiana-wg0.service

[Service]
ExecStart=$BIN --punto $NOMBRE:51820 --interfaz wg0 --escucha 127.0.0.1:8793 --dns 10.66.0.1
DynamicUser=yes
# solo puede cambiar los pares de WireGuard (y lo que esa capacidad deja; el resto, cerrado aquí abajo)
AmbientCapabilities=CAP_NET_ADMIN
CapabilityBoundingSet=CAP_NET_ADMIN
NoNewPrivileges=yes
# solo habla con este mismo servidor: Caddy le trae las altas; nada puede salir de aquí hacia fuera
IPAddressDeny=any
IPAddressAllow=localhost
RestrictAddressFamilies=AF_INET AF_NETLINK AF_UNIX
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateIPC=yes
ProtectProc=invisible
ProcSubset=pid
DevicePolicy=closed
ProtectKernelModules=yes
ProtectKernelTunables=yes
ProtectKernelLogs=yes
ProtectControlGroups=yes
ProtectClock=yes
ProtectHostname=yes
RestrictNamespaces=yes
RestrictRealtime=yes
RestrictSUIDSGID=yes
LockPersonality=yes
MemoryDenyWriteExecute=yes
SystemCallArchitectures=native
SystemCallFilter=@system-service
SystemCallFilter=~@privileged
SystemCallErrorNumber=EPERM
UMask=0077
# ni volcados de memoria (llevarían llaves de los equipos) ni salida: nada a disco
LimitCORE=0
StandardOutput=null
StandardError=journal
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable -q guardiana-wg0 guardiana-vpn-red guardiana-vpn-alta unbound
systemctl start guardiana-wg0
if systemctl -q is-active guardiana-vpn-red; then
  # reglas nuevas: de una vez (nft -f es una sola transacción), sin parar el servicio
  if [ "$red_nueva" = 1 ]; then nft -f "$RED"; fi
else
  systemctl start guardiana-vpn-red
fi
if [ "$dns_nuevo" = 1 ] || ! systemctl -q is-active unbound; then systemctl restart unbound; fi
if [ "$nuevo_bin" = 1 ] || [ "$alta_nueva" = 1 ]; then
  # el alta vuelve a arrancar y toma los equipos conectados (Estado::adopta): nadie pierde su túnel
  systemctl restart guardiana-vpn-alta
else
  systemctl start guardiana-vpn-alta
fi

paso "Cortafuegos del sistema (si ufw está activo): UDP 51820, el resolutor y la salida del túnel"
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  ufw allow 51820/udp >/dev/null
  ufw allow in on wg0 to 10.66.0.1 port 53 >/dev/null
  ufw route allow in on wg0 out on "$SALIDA" >/dev/null
fi

for i in $(seq 1 20); do
  if curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' http://127.0.0.1:8793/vpn/alta | grep -qE '^(400|422)$'; then
    paso "El alta responde en 127.0.0.1:8793"
    exit 0
  fi
  sleep 1
done
rojo "vpn.sh: el alta no responde (journalctl -u guardiana-vpn-alta -n 50)"
exit 1
