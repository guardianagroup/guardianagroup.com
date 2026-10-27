#!/usr/bin/env bash
# ZERO · instalador del motor en un servidor propio (Ubuntu 22.04/24.04 o Debian 12, como root).
#
# Deja el motor (zero-motor/servidor.js) corriendo como servicio en 127.0.0.1:8792, detrás de Caddy con certificado TLS
# automático en https://<dominio> (WebSocket wss://<dominio>/sesion), con Tor para la ruta ULTRA y Chromium de Playwright.
# Desde el 26 Oct 2026 también el relé de Comunicaciones (wss://<dominio>/com) y coturn (llamadas por el relé, puerto 3478).
#
# Uso (en la consola del servidor, como root):
#   curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | bash -s -- motor.guardianagroup.com
#
# Antes: el registro DNS A del dominio debe apuntar a la IP pública del servidor y los puertos 80 y 443 deben estar libres.
# Es idempotente: se puede volver a ejecutar para actualizar. No toca /etc/guardiana/zero.env si ya existe.
set -euo pipefail

DOMINIO="${1:-motor.guardianagroup.com}"
REGION="${2:-${ZERO_REGION:-}}"
if [ -z "$REGION" ]; then case "$DOMINIO" in motor.guardianagroup.com) REGION="Europa · Núremberg";; motor-am.guardianagroup.com) REGION="América · Miami";; esac; fi
RAMA="${ZERO_RAMA:-main}"
REPO="${ZERO_REPO:-https://github.com/guardianagroup/guardianagroup.com.git}"
BASE=/opt/guardiana
DIR="$BASE/web"
NAVEGADORES="$BASE/ms-playwright"
ENVF=/etc/guardiana/zero.env
PUERTO=8792
NODE_MAYOR=22
PLAYWRIGHT_VERSION="${ZERO_PLAYWRIGHT:-1.56.0}"

rojo() { printf '\033[31m%s\033[0m\n' "$*" >&2; }
paso() { printf '\n\033[36m▸ %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { rojo "Ejecuta como root (sudo -i)."; exit 1; }
command -v apt-get >/dev/null || { rojo "Este instalador es para Ubuntu/Debian (apt)."; exit 1; }
[[ "$DOMINIO" =~ ^[a-z0-9.-]+$ ]] || { rojo "Dominio no válido: $DOMINIO"; exit 1; }

paso "Comprobando puertos 80 y 443"
if [ -z "${ZERO_SIN_PROXY:-}" ] && ! dpkg -s caddy >/dev/null 2>&1; then
  for p in 80 443; do
    if ss -ltn "( sport = :$p )" | grep -q ":$p"; then
      rojo "El puerto $p ya está en uso por otro programa (nginx, apache, otra web…)."
      rojo "Usa otro servidor o avísanos para configurar el motor detrás de ese programa."
      exit 1
    fi
  done
fi

paso "Paquetes del sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q curl git ca-certificates gnupg python3 tor debian-keyring debian-archive-keyring apt-transport-https

paso "Node.js $NODE_MAYOR"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAYOR}.x" | bash -
  apt-get install -y -q nodejs
fi
node -v

paso "Caddy (TLS automático)"
if ! dpkg -s caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q
  apt-get install -y -q caddy
fi

paso "Usuario de servicio «zero»"
id zero >/dev/null 2>&1 || useradd --system --home-dir "$BASE" --shell /usr/sbin/nologin zero
mkdir -p "$BASE" "$NAVEGADORES" /etc/guardiana
chown zero:zero "$BASE" "$NAVEGADORES"

paso "Código del motor ($REPO, rama $RAMA)"
if [ -d "$DIR/.git" ]; then
  sudo -u zero git -C "$DIR" fetch -q --depth 1 origin "$RAMA"
  sudo -u zero git -C "$DIR" checkout -q -f FETCH_HEAD
else
  sudo -u zero git clone -q --depth 1 --filter=blob:none --sparse --branch "$RAMA" "$REPO" "$DIR"
  sudo -u zero git -C "$DIR" sparse-checkout set zero-motor orbita/datos
fi
sudo -u zero git -C "$DIR" log -1 --format='  versión %h · %cd' --date=short

paso "Listas de filtros (EasyList y uBlock Origin, desde sus repositorios)"
LSRC="$BASE/listas-src"
mkdir -p "$LSRC"; chown zero:zero "$LSRC"
cat > "$BASE/actualizar-listas.sh" <<EOF
#!/usr/bin/env bash
# Reconstruye las listas de filtros de ZERO desde EasyList y uAssets y reinicia el motor si cambiaron.
set -e
for r in easylist/easylist uBlockOrigin/uAssets; do
  n=\${r##*/}
  if [ -d "$LSRC/\$n/.git" ]; then git -C "$LSRC/\$n" pull -q --ff-only || true
  else git clone -q --depth 1 "https://github.com/\$r" "$LSRC/\$n"; fi
done
antes=\$(cat "$DIR"/zero-motor/listas/*.txt 2>/dev/null | sha256sum)
python3 "$DIR/zero-motor/listas/construye_listas.py" "$LSRC"
despues=\$(cat "$DIR"/zero-motor/listas/*.txt | sha256sum)
[ "\$antes" != "\$despues" ] && [ -n "\${ZERO_REINICIA:-}" ] && systemctl restart zero-motor || true
EOF
chmod 755 "$BASE/actualizar-listas.sh"
sudo -u zero bash "$BASE/actualizar-listas.sh"
cat > /etc/systemd/system/zero-listas.service <<EOF
[Unit]
Description=GUARDIANA ZERO · actualización semanal de las listas de filtros
[Service]
Type=oneshot
User=zero
ExecStart=/usr/bin/bash $BASE/actualizar-listas.sh
ExecStartPost=+/bin/systemctl restart zero-motor
EOF
cat > /etc/systemd/system/zero-listas.timer <<EOF
[Unit]
Description=GUARDIANA ZERO · listas de filtros cada semana
[Timer]
OnCalendar=Mon 05:10
RandomizedDelaySec=1h
Persistent=true
[Install]
WantedBy=timers.target
EOF

paso "Actualización automática del motor (cada 15 min desde la rama $RAMA)"
echo "$DOMINIO" > /etc/guardiana/dominio
cat > "$BASE/actualizar-motor.sh" <<EOF
#!/usr/bin/env bash
# Trae la última versión del motor desde el repositorio; deja una marca si cambió (el servicio reinicia o reinstala).
set -e
cd "$DIR"
antes=\$(git rev-parse HEAD)
inst_antes=\$(sha256sum zero-motor/instalar.sh | cut -c1-16)
git fetch -q --depth 1 origin "$RAMA"
git checkout -q -f FETCH_HEAD
despues=\$(git rev-parse HEAD)
inst_despues=\$(sha256sum zero-motor/instalar.sh | cut -c1-16)
rm -f "$BASE/.cambio" "$BASE/.reinstala"
if [ "\$inst_antes" != "\$inst_despues" ]; then touch "$BASE/.reinstala"; echo "instalador nuevo: se reinstala"
elif [ "\$antes" != "\$despues" ]; then touch "$BASE/.cambio"; echo "motor actualizado: \$antes → \$despues"; fi
EOF
chmod 755 "$BASE/actualizar-motor.sh"
cat > /etc/systemd/system/zero-actualiza.service <<EOF
[Unit]
Description=GUARDIANA ZERO · actualización del motor desde el repositorio
[Service]
Type=oneshot
User=zero
ExecStart=/usr/bin/bash $BASE/actualizar-motor.sh
ExecStartPost=+/bin/bash -c 'if [ -f $BASE/.reinstala ]; then rm -f $BASE/.reinstala; bash $DIR/zero-motor/instalar.sh "\$(cat /etc/guardiana/dominio)"; elif [ -f $BASE/.cambio ]; then rm -f $BASE/.cambio; systemctl restart zero-motor; fi'
EOF
cat > /etc/systemd/system/zero-actualiza.timer <<EOF
[Unit]
Description=GUARDIANA ZERO · comprobar el repositorio cada 15 minutos
[Timer]
OnBootSec=10min
OnUnitActiveSec=15min
[Install]
WantedBy=timers.target
EOF

paso "Playwright $PLAYWRIGHT_VERSION y Chromium"
cd "$DIR/zero-motor"
[ -f package.json ] || sudo -u zero npm init -y >/dev/null
sudo -u zero npm install --no-audit --no-fund --save-exact "playwright@$PLAYWRIGHT_VERSION" >/dev/null
sudo -u zero env PLAYWRIGHT_BROWSERS_PATH="$NAVEGADORES" npx --yes playwright install chromium >/dev/null
npx --yes playwright install-deps chromium >/dev/null

paso "Configuración ($ENVF)"
RAM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 4096)
MAX_SES=$(( (RAM_MB - 700) / 600 )); [ "$MAX_SES" -lt 1 ] && MAX_SES=1; [ "$MAX_SES" -gt 8 ] && MAX_SES=8
if [ -f "$ENVF" ] && [ -n "$REGION" ]; then
  if grep -q '^ZERO_REGION=' "$ENVF"; then sed -i "s|^ZERO_REGION=.*|ZERO_REGION=$REGION|" "$ENVF"; else echo "ZERO_REGION=$REGION" >> "$ENVF"; fi
fi
if [ ! -f "$ENVF" ]; then
  cat > "$ENVF" <<EOF
# ZERO · motor · configuración. Lo lee el servicio zero-motor (systemctl restart zero-motor tras cambiar algo).
ZERO_PUBLICO=https://$DOMINIO
ZERO_ORIGENES=https://guardianagroup.com,https://www.guardianagroup.com
# Celdas vivas a la vez (cada una es un Chromium con hasta 8 pestañas; unos 300–600 MB cada una); calculado por la RAM
ZERO_MAX_SESIONES=$MAX_SES
ZERO_MIN_SIN_MIRAR=30
ZERO_MAX_HORAS=12
# Dónde está este motor (lo enseña la página: «navegas desde…»). Ej.: Europa · Núremberg | América · Miami
ZERO_REGION=$REGION

# Ruta ULTRA (salida por Tor). Déjalo vacío para no ofrecer ULTRA.
ZERO_TOR_PROXY=socks5://127.0.0.1:9050
PLAYWRIGHT_BROWSERS_PATH=$NAVEGADORES
NODE_ENV=production
EOF
  chmod 640 "$ENVF"; chown root:zero "$ENVF"
  echo "  creado"
else
  echo "  ya existe: no se toca"
fi

# Comunicaciones (26 Oct 2026): el relé de chat/llamadas/archivos vive dentro del motor (wss://<dominio>/com) y las
# llamadas pasan por coturn en este servidor para que ningún extremo vea la dirección del otro. Credenciales de vida
# corta firmadas con TURN_SECRETO (en $ENVF, generado aquí una vez). Sin coturn, el relé sigue pero sin llamadas.
paso "Comunicaciones: servicio de llamadas (coturn)"
if grep -q '^TURN_SECRETO=' "$ENVF"; then
  TURN_SECRETO=$(sed -n 's/^TURN_SECRETO=//p' "$ENVF" | head -1)
else
  TURN_SECRETO=$(openssl rand -hex 32)
  printf '\n# Comunicaciones · llamadas por el relé (coturn): secreto compartido con /etc/turnserver.conf. No se enseña.\nTURN_SECRETO=%s\nTURN_HOST=%s\nTURN_PUERTO=3478\n' "$TURN_SECRETO" "$DOMINIO" >> "$ENVF"
fi
grep -q '^TURN_HOST=' "$ENVF" || echo "TURN_HOST=$DOMINIO" >> "$ENVF"
apt-get install -y -q coturn > /var/log/guardiana-coturn-instalacion.log 2>&1 || { apt-get update -q >/dev/null 2>&1 || true; apt-get install -y -q coturn >> /var/log/guardiana-coturn-instalacion.log 2>&1 || true; }
chmod 644 /var/log/guardiana-coturn-instalacion.log 2>/dev/null || true
if command -v turnserver >/dev/null 2>&1; then
  cat > /etc/turnserver.conf <<EOF
# GUARDIANA · Comunicaciones · relé de llamadas. Generado por zero-motor/instalar.sh (se reescribe al reinstalar).
listening-port=3478
fingerprint
use-auth-secret
static-auth-secret=$TURN_SECRETO
realm=$DOMINIO
stale-nonce=600
min-port=49160
max-port=49999
no-multicast-peers
no-cli
no-tlsv1
no-tlsv1_1
no-rfc5780
no-stun-backward-compatibility
response-origin-only-with-rfc5780
user-quota=12
total-quota=400
max-bps=1500000
# ningún registro de direcciones: el relé no guarda quién habla con quién
log-file=/dev/null
no-stdout-log
simple-log
# el relé solo lleva a direcciones públicas: nunca a redes internas ni a este servidor
denied-peer-ip=0.0.0.0-0.255.255.255
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=100.64.0.0-100.127.255.255
denied-peer-ip=127.0.0.0-127.255.255.255
denied-peer-ip=169.254.0.0-169.254.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.0.0.0-192.0.0.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=198.18.0.0-198.19.255.255
denied-peer-ip=::1
denied-peer-ip=64:ff9b::-64:ff9b::ffff:ffff
denied-peer-ip=fc00::-fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
denied-peer-ip=fe80::-febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff
EOF
  chmod 640 /etc/turnserver.conf; chown root:turnserver /etc/turnserver.conf 2>/dev/null || true
  if [ -f /etc/default/coturn ]; then sed -i 's/^#\?TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn; grep -q '^TURNSERVER_ENABLED=1' /etc/default/coturn || echo 'TURNSERVER_ENABLED=1' >> /etc/default/coturn; fi
  systemctl enable -q coturn 2>/dev/null || true
  systemctl restart coturn || rojo "  coturn no arranca: journalctl -u coturn -n 30 (el relé sigue, sin llamadas)"
  sleep 2; { systemctl is-active coturn; systemctl status coturn --no-pager -n 15 2>&1 | sed -E 's/[0-9]{1,3}(\.[0-9]{1,3}){3}/IP/g'; } > /var/log/guardiana-coturn-estado.log 2>&1 || true; chmod 644 /var/log/guardiana-coturn-estado.log 2>/dev/null || true
  if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
    ufw allow 3478/tcp >/dev/null; ufw allow 3478/udp >/dev/null; ufw allow 49160:49999/udp >/dev/null
  fi
  echo "  coturn en $DOMINIO:3478 (udp y tcp), relé 49160–49999/udp"
else
  rojo "  coturn no se pudo instalar: Comunicaciones funcionará sin llamadas"
fi

paso "Servicio systemd zero-motor"
cat > /etc/systemd/system/zero-motor.service <<EOF
[Unit]
Description=GUARDIANA ZERO · motor (celdas Chromium)
After=network-online.target tor.service
Wants=network-online.target

[Service]
User=zero
Group=zero
WorkingDirectory=$DIR
EnvironmentFile=$ENVF
ExecStart=/usr/bin/node zero-motor/servidor.js $PUERTO
Restart=always
RestartSec=3
LimitNOFILE=65536
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true

[Install]
WantedBy=multi-user.target
EOF

paso "Caddy: https://$DOMINIO → 127.0.0.1:$PUERTO"
if [ -z "${ZERO_SIN_PROXY:-}" ]; then
  cat > /etc/caddy/Caddyfile <<EOF
$DOMINIO {
	encode zstd gzip
	header -Server
	reverse_proxy 127.0.0.1:$PUERTO
}
EOF
  systemctl enable -q caddy
  systemctl restart caddy
fi

paso "Tor (para ULTRA)"
systemctl enable -q tor
systemctl restart tor

if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  paso "Cortafuegos ufw: abriendo 80 y 443"
  ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null
fi

# 26 Oct 2026: la celda salía a internet por la IPv6 del servidor (Google la trataba peor que la IPv4 fija de Hetzner, y el
# dominio del motor solo tiene registro A). Se apaga IPv6 en las interfaces de red (no en lo: ::1 sigue) para que todo salga
# por la IPv4 fija. Para conservar IPv6: ZERO_IPV6=1 bash instalar.sh <dominio>.
if [ -z "${ZERO_IPV6:-}" ]; then
  paso "Salida a internet solo por la IPv4 fija"
  SYSF=/etc/sysctl.d/90-zero-ipv4.conf
  { echo "# ZERO: salir solo por IPv4 (ver zero-motor/instalar.sh)"; echo "net.ipv6.conf.default.disable_ipv6 = 1"
    for i in /sys/class/net/*; do n=$(basename "$i"); [ "$n" = lo ] && continue; echo "net.ipv6.conf.$n.disable_ipv6 = 1"; done; } > "$SYSF"
  sysctl -q -p "$SYSF" || true
else
  rm -f /etc/sysctl.d/90-zero-ipv4.conf
fi

paso "Arrancando el motor"
systemctl daemon-reload
systemctl enable -q zero-listas.timer; systemctl start zero-listas.timer
systemctl enable -q zero-actualiza.timer; systemctl start zero-actualiza.timer
systemctl enable -q zero-motor
systemctl restart zero-motor
for i in $(seq 1 20); do
  sleep 1
  if curl -fsS "http://127.0.0.1:$PUERTO/salud" >/dev/null 2>&1; then break; fi
done
if ! curl -fsS "http://127.0.0.1:$PUERTO/salud"; then
  rojo "El motor no responde. Mira el registro: journalctl -u zero-motor -n 50"
  exit 1
fi
echo

if [ -z "${ZERO_SIN_PROXY:-}" ]; then
  paso "Comprobando el certificado TLS de https://$DOMINIO (puede tardar hasta un minuto)"
  ok=
  for i in $(seq 1 30); do
    sleep 2
    if curl -fsS --max-time 5 "https://$DOMINIO/salud" >/dev/null 2>&1; then ok=1; break; fi
  done
  if [ -n "$ok" ]; then
    echo "  https://$DOMINIO/salud responde."
  else
    rojo "  https://$DOMINIO todavía no responde: comprueba que el DNS A de $DOMINIO apunta a este servidor y que los puertos 80/443 están abiertos."
    rojo "  Registro de Caddy: journalctl -u caddy -n 50"
  fi
fi

cat <<EOF

Listo. El motor corre como servicio (zero-motor) y arranca solo al reiniciar.
  Estado:      systemctl status zero-motor
  Registro:    journalctl -u zero-motor -f
  Claves IA:   nano $ENVF  →  systemctl restart zero-motor
  Actualizar:  bash $DIR/zero-motor/instalar.sh $DOMINIO

Página de ZERO conectada a este motor:
  https://guardianagroup.com/orbita/zero/?orbita=0&motor=wss://$DOMINIO
EOF
