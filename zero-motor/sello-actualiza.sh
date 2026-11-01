#!/usr/bin/env bash
# GUARDIANA · el sello en los servidores (1 Nov 2026). Dueño, 16:21–16:30: «sellar la página web… del máximo nivel posible».
#
# Lo ejecuta el usuario zero cada 15 minutos (zero-actualiza.timer; lo instala zero-motor/instalar.sh). Trae la última versión
# de la rama y solo la pone si su publicación vigente (sello/) lleva la firma del dueño, comprobada con las llaves instaladas
# en el servidor (no con las que trae la versión), no es anterior a la última aplicada y su zero-motor/ es exactamente el
# firmado. Sin firma válida, el motor se queda en la versión que tiene y lo dice en el diario (journalctl -u zero-actualiza).
# Después, root (sello-aplica.sh) lo vuelve a comprobar por su cuenta antes de reiniciar o reinstalar nada.
#
# Uso: sello-actualiza.sh <carpeta del repositorio> <rama> <carpeta base>
set -euo pipefail
DIR="$1"; RAMA="$2"; BASE="$3"
COMPRUEBA=/usr/local/lib/guardiana/sello.js
LLAVES=/etc/guardiana/sello-llaves.json
cd "$DIR"
git fetch -q --depth 1 origin "$RAMA"
nuevo=$(git rev-parse FETCH_HEAD)
[ "$nuevo" = "$(git rev-parse HEAD)" ] && exit 0
corto=${nuevo:0:7}
# el árbol entero: ni enlaces ni submódulos, y ningún archivo de paquetes fuera de zero-motor/ (el motor solo usa los suyos)
if git ls-tree -r --full-tree "$nuevo" | awk '$1=="120000"||$1=="160000"{e=1} END{exit !e}'; then
  echo "la versión $corto trae enlaces o submódulos: se queda la actual"; exit 0
fi
if git ls-tree -r --name-only --full-tree "$nuevo" | grep -Eq '(^|/)node_modules(/|$)|(^|/)\.npmrc$|^package(-lock)?\.json$'; then
  echo "la versión $corto trae archivos de paquetes fuera de lugar: se queda la actual"; exit 0
fi
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
if ! git archive "$nuevo" zero-motor sello 2>/dev/null | tar -x -C "$tmp" 2>/dev/null || [ ! -f "$tmp/sello/actual.json" ]; then
  echo "la versión $corto no trae una publicación sellada: se queda la actual"; exit 0
fi
minimo=$(cat /var/lib/guardiana/sello-seq 2>/dev/null || echo 0)
if ! r=$(env -u SELLO_ORIGEN -u SELLO_RP SELLO_LLAVES="$LLAVES" SELLO_MINIMO="$minimo" node "$COMPRUEBA" servidor "$tmp" zero-motor); then
  echo "la versión $corto no lleva una firma válida del dueño ($r): se queda la actual"; exit 0
fi
cambia=1; git diff-tree -r --quiet HEAD "$nuevo" -- zero-motor orbita/datos && cambia=0
reinstala=1; git diff-tree -r --quiet HEAD "$nuevo" -- zero-motor/instalar.sh zero-motor/sello.js zero-motor/sello-actualiza.sh zero-motor/sello-aplica.sh sello/llaves.json && reinstala=0
git checkout -q -f "$nuevo"
rm -f "$BASE/.cambio" "$BASE/.reinstala" "$BASE/.sello"
if [ "$reinstala" = 1 ]; then touch "$BASE/.reinstala"; echo "versión firmada $corto con instalador o sello nuevos: se reinstala ($r)"
elif [ "$cambia" = 1 ]; then touch "$BASE/.cambio"; echo "motor en la versión firmada $corto ($r)"
else touch "$BASE/.sello"; echo "versión firmada $corto sin cambios para el motor ($r)"; fi
