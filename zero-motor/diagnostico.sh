#!/usr/bin/env bash
# ZERO · diagnóstico de un servidor antes de instalar el motor (solo lee; no cambia nada; no muestra claves).
# Uso: curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/diagnostico.sh | bash
echo "== Sistema"; (. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME") ; uname -m
echo "== Memoria y disco"; free -h | sed -n 1,2p; df -h / | sed -n 2p
echo "== Puertos en escucha (programa)"; ss -ltnpH 2>/dev/null | awk '{print $4, $6}' | sed 's/users:((//; s/,.*//' | sort -u
echo "== Servicios de interés"; for s in caddy nginx apache2 docker tor zero-motor rele; do systemctl is-active "$s" >/dev/null 2>&1 && echo "$s: activo" || true; done
echo "== Node"; command -v node >/dev/null && node -v || echo "sin node"
echo "== Carpetas"; ls -d /opt/* /etc/caddy /etc/nginx /srv/* 2>/dev/null | tr '\n' ' '; echo
echo "== Dirección pública"; curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I
echo
