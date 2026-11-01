#!/usr/bin/env bash
# GUARDIANA · el sello en los servidores (1 Nov 2026): lo que hace root después de una actualización del usuario zero
# (ExecStartPost de zero-actualiza.service): reiniciar el motor o reinstalarlo. Antes lo comprueba otra vez por su cuenta,
# con su propio comprobador y las llaves instaladas (los dos de root), sobre una copia que saca él: sin firma válida del
# dueño no reinicia ni reinstala nada. La reinstalación usa el instalador de esa copia comprobada.
set -euo pipefail
B=/opt/guardiana; D=$B/web
COMPRUEBA=/usr/local/lib/guardiana/sello.js
LLAVES=/etc/guardiana/sello-llaves.json
SEQ=/var/lib/guardiana/sello-seq
NODE=$(command -v node)
[ -f "$B/.reinstala" ] || [ -f "$B/.cambio" ] || exit 0
reinstala=0; [ -f "$B/.reinstala" ] && reinstala=1
rm -f "$B/.reinstala" "$B/.cambio"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
mkdir "$tmp/v"
if ! sudo -u zero git -C "$D" archive --format=tar HEAD zero-motor sello > "$tmp/v.tar" 2>/dev/null; then
  echo "aplica: la versión del disco no trae sello: no se toca nada"; exit 0
fi
tar -x --no-same-owner --no-same-permissions -f "$tmp/v.tar" -C "$tmp/v"
if [ -n "$(find "$tmp/v" ! -type f ! -type d -print -quit)" ]; then
  echo "aplica: la versión del disco trae algo que no es un archivo: no se toca nada"; exit 0
fi
if ! r=$(env -i PATH=/usr/bin:/bin SELLO_LLAVES="$LLAVES" SELLO_MINIMO="$(cat "$SEQ" 2>/dev/null || echo 0)" "$NODE" "$COMPRUEBA" servidor "$tmp/v" zero-motor); then
  echo "aplica: la versión del disco no lleva una firma válida del dueño ($r): no se toca nada"; exit 0
fi
seq=$(printf '%s' "$r" | sed -n 's/.*"seq":\([0-9]*\).*/\1/p')
[ -n "$seq" ] && echo "$seq" > "$SEQ"
echo "aplica: publicación $seq firmada por el dueño ($r)"
if [ "$reinstala" = 1 ]; then
  ZERO_SELLADO=1 ZERO_FUENTE="$tmp/v" bash "$tmp/v/zero-motor/instalar.sh" "$(cat /etc/guardiana/dominio)"
else
  systemctl restart zero-motor
fi
