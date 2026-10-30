#!/usr/bin/env bash
# GUARDIANA · Comunicaciones · puente en Rusia (30 Oct 2026).
#
# Por qué existe (dueño, 30 Oct 2026, 09:10–09:23): con su hijo en Moscú el chat funciona, pero las fotos y la videollamada
# no. Desde junio de 2025 las redes rusas cortan a unos 16 KB las conexiones hacia los grandes alojamientos extranjeros:
# pasan los mensajes cortos y se quedan a medias las fotos, el audio y el vídeo. La conexión entre dos servidores de centro de
# datos no sufre ese corte, así que quien está en Rusia entra por este servidor, dentro de Rusia, y este lo reenvía al
# servidor principal.
#
# Qué hace, y nada más:
#   · https://ru.guardianagroup.com/com y /salud → https://motor.guardianagroup.com (Caddy, certificado automático).
#     Todo viaja ya cifrado de extremo a extremo: aquí no se abre ni se guarda nada. Sin registros de acceso. La dirección
#     de la persona no se pasa al servidor principal.
#   · el puerto 3478 (udp y tcp) del relé de llamadas → motor.guardianagroup.com:3478 (nginx, solo reenvío). Las
#     credenciales de llamada las da y las comprueba el servidor principal; aquí no hay ninguna clave.
#
# Uso, como root en un Ubuntu 24.04 recién creado (el registro DNS A de ru.guardianagroup.com ya apuntando a este servidor):
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
# que no arranquen solos al instalarse: los dos querrían el puerto 80 y la instalación fallaría; se arrancan abajo, ya configurados
printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d; chmod 755 /usr/sbin/policy-rc.d
trap 'rm -f /usr/sbin/policy-rc.d' EXIT
apt-get install -y -q curl ca-certificates caddy nginx libnginx-mod-stream unattended-upgrades
rm -f /usr/sbin/policy-rc.d

paso "Caddy: https://$PUENTE → https://$MOTOR (solo /com y /salud)"
cat > /etc/caddy/Caddyfile <<EOF
# GUARDIANA · puente en Rusia. Solo reenvía el relé de Comunicaciones; nada más se sirve desde aquí.
$PUENTE {
	header -Server
	@rele path /com /com/* /salud
	handle @rele {
		reverse_proxy https://$MOTOR {
			header_up Host {upstream_hostport}
			# la dirección de la persona se queda aquí: no se pasa al servidor principal
			header_up -X-Forwarded-For
			header_up -X-Real-IP
			transport http {
				tls_server_name $MOTOR
			}
		}
	}
	handle {
		respond 404
	}
}
EOF
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null
systemctl enable -q caddy
systemctl restart caddy

paso "nginx: el relé de llamadas (3478 udp y tcp) → $MOTOR:3478"
# nginx solo como reenvío de puertos: sin web (Caddy ya tiene el 80 y el 443) y sin registros
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/nginx.conf <<EOF
# GUARDIANA · puente en Rusia: reenvío del relé de llamadas (TURN). No hay web aquí; la sirve Caddy.
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
error_log /var/log/nginx/error.log crit;

events { worker_connections 4096; }

stream {
	access_log off;
	# udp: una sesión por equipo; se cierra tras 15 min sin tráfico (una llamada nunca está tanto en silencio)
	server {
		listen 3478 udp reuseport;
		proxy_pass $MOTOR:3478;
		proxy_timeout 15m;
	}
	server {
		listen 3478;
		proxy_pass $MOTOR:3478;
		proxy_timeout 1h;
	}
}
EOF
nginx -t -q
systemctl enable -q nginx
systemctl restart nginx

paso "Cortafuegos"
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; ufw allow 443/udp >/dev/null
  ufw allow 3478/tcp >/dev/null; ufw allow 3478/udp >/dev/null
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
  rojo "Caddy aún no tiene el certificado de $PUENTE."
  rojo "  ¿El registro DNS A de $PUENTE apunta ya a la IP de este servidor? Caddy lo vuelve a intentar solo."
  rojo "  Registro de Caddy: journalctl -u caddy -n 50"
fi
