#!/usr/bin/env bash
# ZERO · instalador del motor en un servidor propio (Ubuntu 22.04/24.04 o Debian 12, como root).
#
# Deja el motor (zero-motor/servidor.js) corriendo como servicio en 127.0.0.1:8792, detrás de Caddy con certificado TLS
# automático en https://<dominio> (WebSocket wss://<dominio>/sesion), con Tor para la ruta ULTRA y Chromium de Playwright.
#
# Uso (en la consola del servidor, como root):
#   curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | bash -s -- motor.guardianagroup.com
#
# Antes: el registro DNS A del dominio debe apuntar a la IP pública del servidor y los puertos 80 y 443 deben estar libres.
# Es idempotente: se puede volver a ejecutar para actualizar. No toca /etc/guardiana/zero.env si ya existe.
set -euo pipefail

DOMINIO="${1:-motor.guardianagroup.com}"
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
apt-get install -y -q curl git ca-certificates gnupg tor debian-keyring debian-archive-keyring apt-transport-https

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

paso "Playwright $PLAYWRIGHT_VERSION y Chromium"
cd "$DIR/zero-motor"
[ -f package.json ] || sudo -u zero npm init -y >/dev/null
sudo -u zero npm install --no-audit --no-fund --save-exact "playwright@$PLAYWRIGHT_VERSION" >/dev/null
sudo -u zero env PLAYWRIGHT_BROWSERS_PATH="$NAVEGADORES" npx --yes playwright install chromium >/dev/null
npx --yes playwright install-deps chromium >/dev/null

paso "Configuración ($ENVF)"
if [ ! -f "$ENVF" ]; then
  cat > "$ENVF" <<EOF
# ZERO · motor · configuración. Lo lee el servicio zero-motor (systemctl restart zero-motor tras cambiar algo).
ZERO_PUBLICO=https://$DOMINIO
ZERO_ORIGENES=https://guardianagroup.com,https://www.guardianagroup.com
# Celdas vivas a la vez (cada una es un Chromium con hasta 8 pestañas; unos 300–600 MB cada una)
ZERO_MAX_SESIONES=4
ZERO_MIN_SIN_MIRAR=30
ZERO_MAX_HORAS=12
# Ruta ULTRA (salida por Tor). Déjalo vacío para no ofrecer ULTRA.
ZERO_TOR_PROXY=socks5://127.0.0.1:9050
PLAYWRIGHT_BROWSERS_PATH=$NAVEGADORES
NODE_ENV=production
# PUERTA IA · claves de proveedor (las pone el dueño; nunca se enseñan ni salen del servidor). Sin clave, ese proveedor no se ofrece.
ZERO_OPENAI_KEY=
ZERO_GEMINI_KEY=
ZERO_ANTHROPIC_KEY=
# Proveedor compatible con la API de OpenAI (p. ej., Cheaper Inference): dirección base, clave y modelo
ZERO_COMPAT_URL=
ZERO_COMPAT_KEY=
ZERO_COMPAT_MODEL=
EOF
  chmod 640 "$ENVF"; chown root:zero "$ENVF"
  echo "  creado (edítalo para poner las claves de PUERTA IA)"
else
  echo "  ya existe: no se toca"
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

paso "Arrancando el motor"
systemctl daemon-reload
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
