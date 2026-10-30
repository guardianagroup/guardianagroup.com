#!/usr/bin/env bash
# GUARDIANA · Comunicaciones · puente en Rusia (30 Oct 2026).
#
# Por qué existe (dueño, 30 Oct 2026, 09:10–09:23): con su hijo en Moscú el chat funciona, pero las fotos y la videollamada
# no. Desde junio de 2025 las redes rusas cortan a unos 16 KB las conexiones hacia los grandes alojamientos extranjeros:
# pasan los mensajes cortos y se quedan a medias las fotos, el audio y el vídeo. Quien está en Rusia entra por este
# servidor, dentro de Rusia, y este lo reenvía al servidor principal.
#
# Qué hace, y nada más: reenvía bytes, sin abrir nada (nginx en modo «stream»).
#   · 443/tcp y 80/tcp → el servidor principal. El TLS de ru.guardianagroup.com lo termina el servidor principal (Caddy saca allí
#     su certificado, con la validación que pasa por el 80 de aquí): este servidor no tiene certificado ni claves y no ve ni
#     las direcciones de las salas. Y además todo va ya cifrado de extremo a extremo.
#   · 3478 udp y tcp (relé de llamadas, TURN) → el servidor principal. Las credenciales de llamada las da y las comprueba el
#     servidor principal; aquí no hay ninguna clave.
#   · Sin registros de acceso.
#
# Uso, como root en un Ubuntu 24.04 recién creado (el registro DNS A de ru.guardianagroup.com apuntando ya a este servidor, y
# el servidor principal con ru.guardianagroup.com en /etc/guardiana/alias):
#   curl -fsSL https://guardianagroup.com/zero-motor/puente-ru.sh | bash
# Se puede volver a ejecutar sin miedo: deja la misma configuración.
set -euo pipefail

PUENTE="${1:-ru.guardianagroup.com}"
MOTOR="${2:-motor.guardianagroup.com}"

rojo() { printf '\033[31m%s\033[0m\n' "$*" >&2; }
paso() { printf '\n\033[36m▸ %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { rojo "Ejecuta como root (sudo -i)."; exit 1; }
command -v apt-get >/dev/null || { rojo "Este instalador es para Ubuntu/Debian (apt)."; exit 1; }
[[ "$PUENTE" =~ ^[a-z0-9.-]+$ && "$MOTOR" =~ ^[a-z0-9.-]+$ ]] || { rojo "Nombre no válido."; exit 1; }

paso "Paquetes (de los repositorios de Ubuntu)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
# que nginx no arranque solo al instalarse con su web de ejemplo en el 80: se arranca abajo, ya configurado
printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d; chmod 755 /usr/sbin/policy-rc.d
trap 'rm -f /usr/sbin/policy-rc.d' EXIT
apt-get install -y -q curl ca-certificates nginx libnginx-mod-stream unattended-upgrades
rm -f /usr/sbin/policy-rc.d

paso "nginx: 80, 443 y 3478 (udp y tcp) → $MOTOR, sin abrir nada"
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/nginx.conf <<EOF
# GUARDIANA · puente en Rusia: solo reenvío de bytes hacia $MOTOR. Sin web, sin certificados, sin registros.
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
error_log /var/log/nginx/error.log crit;

events { worker_connections 8192; }

stream {
	access_log off;
	# la web y el relé de mensajes (TLS de extremo a extremo hasta el servidor principal)
	server { listen 443; proxy_pass $MOTOR:443; proxy_timeout 1h; }
	# la validación del certificado de $PUENTE (la pide Caddy en el servidor principal)
	server { listen 80; proxy_pass $MOTOR:80; proxy_timeout 1m; }
	# el relé de llamadas: udp, una sesión por equipo (se cierra tras 15 min sin tráfico), y tcp
	server { listen 3478 udp reuseport; proxy_pass $MOTOR:3478; proxy_timeout 15m; }
	server { listen 3478; proxy_pass $MOTOR:3478; proxy_timeout 1h; }
}
EOF
nginx -t -q
systemctl enable -q nginx
systemctl restart nginx

paso "Cortafuegos"
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; ufw allow 3478/tcp >/dev/null; ufw allow 3478/udp >/dev/null
  echo "  ufw: 80, 443 y 3478 abiertos"
else
  echo "  ufw no está activo: no se toca"
fi

paso "Comprobación"
ok=1
for i in $(seq 1 30); do
  if curl -fsS -m 5 "https://$PUENTE/salud" >/dev/null 2>&1; then ok=0; break; fi
  sleep 4
done
if [ $ok -eq 0 ]; then
  printf '\n\033[32m✓ Puente listo: https://%s → %s (mensajes, fotos y llamadas)\033[0m\n' "$PUENTE" "$MOTOR"
else
  rojo "Aún no responde https://$PUENTE/salud."
  rojo "  ¿El registro DNS A de $PUENTE apunta ya a la IP de este servidor? ¿Tiene el servidor principal $PUENTE en /etc/guardiana/alias?"
  rojo "  El certificado lo saca el servidor principal en cuanto el DNS apunta aquí; se puede volver a ejecutar este comando."
fi
