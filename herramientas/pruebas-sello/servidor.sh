#!/usr/bin/env bash
# Prueba del sello en un servidor simulado (este contenedor, como root): el motor solo pasa a versiones firmadas.
# Solo en una máquina de pruebas desechable: crea y borra /opt/guardiana, /etc/guardiana, /usr/local/lib/guardiana y un
# usuario «zero». Nunca en un servidor de verdad (se niega si ve uno).
# Uso: bash herramientas/pruebas-sello/servidor.sh <raíz del repositorio>
set -uo pipefail
REPO="$1"
if [ -f /etc/guardiana/zero.env ] || systemctl is-active -q zero-motor 2>/dev/null; then echo "esto es un servidor de verdad: no"; exit 2; fi
H=$(cd "$(dirname "$0")" && pwd)
P=$(mktemp -d)
T=$P/trabajo; REM=/srv/prueba-remoto.git; FAKE=$P/fakebin
ok=0; mal=0
comprueba() { if eval "$1"; then ok=$((ok+1)); else mal=$((mal+1)); echo "FALLO: $2"; fi; }

# --- limpieza y preparación ---
rm -rf "$REM" /opt/guardiana /usr/local/lib/guardiana /etc/guardiana /var/lib/guardiana
id zero >/dev/null 2>&1 || useradd --system --home-dir /opt/guardiana --shell /usr/sbin/nologin zero
mkdir -p "$FAKE"; printf '#!/bin/sh\necho "systemctl $*" >> %s/systemctl.log\n' "$P" > "$FAKE/systemctl"; chmod 755 "$FAKE/systemctl"
mkdir -p "$T/zero-motor" "$T/orbita/datos" "$T/herramientas"
cp "$REPO/zero-motor/sello.js" "$REPO/zero-motor/sello-actualiza.sh" "$REPO/zero-motor/sello-aplica.sh" "$T/zero-motor/"
cp "$REPO/herramientas/sello.py" "$T/herramientas/"
printf '#!/usr/bin/env bash\necho "instalar v1 SELLADO=${ZERO_SELLADO:-} FUENTE=${ZERO_FUENTE:+sí} $*" >> %s/instalar.log\n' "$P" > "$T/zero-motor/instalar.sh"
echo "console.log('motor v1')" > "$T/zero-motor/motor.js"
echo '{"n":1}' > "$T/orbita/datos/x.json"; echo '<p>web</p>' > "$T/index.html"
cd "$T" && git init -q -b main && git config user.name prueba && git config user.email prueba@localhost
python3 herramientas/sello.py llave "$(node "$H/firma-sintetica.js" nueva "$P")" >/dev/null
publica() { # $1: nota. Los cambios ya están hechos en $T
  git -C "$T" add -A
  (cd "$T" && python3 herramientas/sello.py preparar --nota "$1" --servidores >/dev/null) || return 1
  local seq; seq=$(python3 -c "import json;print(json.load(open('$T/sello/pendiente.json'))['seq'])")
  (cd "$T" && python3 herramientas/sello.py firma "$(node "$H/firma-sintetica.js" firma "sello/publicaciones/$seq.doc.json" "$P" "$seq")" >/dev/null) || return 1
  git -C "$T" add -A && git -C "$T" commit -qm "publicación $seq" && git -C "$T" push -q origin main
}
sinfirma() { git -C "$T" add -A && git -C "$T" commit -qm "$1" && git -C "$T" push -q origin main; }
git -C "$T" add -A && git -C "$T" commit -qm inicio
git clone -q --bare "$T" "$REM" && git -C "$REM" config uploadpack.allowFilter true && git -C "$REM" config uploadpack.allowAnySHA1InWant true
chmod -R a+rX "$REM"; git config --system --add safe.directory "$REM"; git -C "$T" remote add origin "$REM"
publica "primera"

# --- el servidor: como lo deja instalar.sh ---
mkdir -p /opt/guardiana /usr/local/lib/guardiana /etc/guardiana /var/lib/guardiana; chown zero:zero /opt/guardiana
sudo -u zero git clone -q --depth 1 --filter=blob:none --sparse --branch main "file://$REM" /opt/guardiana/web
sudo -u zero git -C /opt/guardiana/web sparse-checkout set zero-motor orbita/datos
for f in sello.js sello-actualiza.sh sello-aplica.sh; do install -m 755 "$T/zero-motor/$f" /usr/local/lib/guardiana/; done
install -m 644 "$T/sello/llaves.json" /etc/guardiana/sello-llaves.json
echo 1 > /var/lib/guardiana/sello-seq; echo motor.prueba > /etc/guardiana/dominio
vuelta() { # una vuelta del temporizador: actualiza (zero) y aplica (root)
  A=$(sudo -u zero bash /usr/local/lib/guardiana/sello-actualiza.sh /opt/guardiana/web main /opt/guardiana 2>&1)
  B=$(PATH="$FAKE:$PATH" bash /usr/local/lib/guardiana/sello-aplica.sh 2>&1)
}
cabeza() { sudo -u zero git -C /opt/guardiana/web rev-parse HEAD; }
remoto() { git -C "$REM" rev-parse main; }

# 1) versión firmada con cambio en el motor: se pone y se reinicia
echo "console.log('motor v2')" > "$T/zero-motor/motor.js"; publica "motor v2"
vuelta; comprueba '[ "$(cabeza)" = "$(remoto)" ] && [[ $A == *"versión firmada"* ]]' "1 la versión firmada se pone ($A)"
comprueba '[[ $B == *"publicación 2 firmada"* ]] && grep -q "restart zero-motor" "$P/systemctl.log"' "1 root lo comprueba y reinicia ($B)"
comprueba '[ "$(cat /var/lib/guardiana/sello-seq)" = 2 ]' "1 queda la publicación 2 como mínima"
# 2) cambio en el motor sin firma: no se pone
antes=$(cabeza); echo "console.log('motor sin firma')" > "$T/zero-motor/motor.js"; sinfirma "sin firma"
vuelta; comprueba '[ "$(cabeza)" = "$antes" ] && [[ $A == *"no lleva una firma válida"* ]]' "2 sin firma no se pone ($A)"
git -C "$T" revert --no-edit HEAD >/dev/null && git -C "$T" push -q origin main
# 3) solo datos (fuera de lo firmado): se pone y el motor se reinicia para leerlos
: > "$P/systemctl.log"; echo '{"n":2}' > "$T/orbita/datos/x.json"; sinfirma "datos"
vuelta; comprueba '[ "$(cabeza)" = "$(remoto)" ] && grep -q restart "$P/systemctl.log"' "3 los datos llegan ($A | $B)"
# 4) una llave añadida sin firma: no se pone
antes=$(cabeza)
python3 - "$T/sello/llaves.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1])); k = dict(d['llaves'][0]); k['id'] = 'otra'; d['llaves'].append(k); json.dump(d, open(sys.argv[1], 'w'))
PY
sinfirma "llave sin firma"; vuelta
comprueba '[ "$(cabeza)" = "$antes" ] && [[ $A == *"no son las firmadas"* ]]' "4 una llave sin firma no vale ($A)"
git -C "$T" revert --no-edit HEAD >/dev/null && git -C "$T" push -q origin main
# 5) volver a una publicación anterior: no se pone
antes=$(cabeza); git -C "$T" show HEAD~6:zero-motor/motor.js > "$T/zero-motor/motor.js" 2>/dev/null || echo "console.log('motor v1')" > "$T/zero-motor/motor.js"
printf '{"seq":1}\n' > "$T/sello/actual.json"; sinfirma "vuelta atrás"; vuelta
comprueba '[ "$(cabeza)" = "$antes" ] && [[ $A == *"anterior a la aplicada"* ]]' "5 no se vuelve atrás ($A)"
git -C "$T" revert --no-edit HEAD >/dev/null && git -C "$T" push -q origin main
# 6) un enlace en cualquier parte del árbol: no se pone
antes=$(cabeza); ln -s index.html "$T/enlace.html"; sinfirma "enlace"; vuelta
comprueba '[ "$(cabeza)" = "$antes" ] && [[ $A == *"enlaces o submódulos"* ]]' "6 un enlace no vale ($A)"
git -C "$T" rm -q enlace.html && git -C "$T" commit -qm "sin enlace" && git -C "$T" push -q origin main
# 7) instalador nuevo firmado: root reinstala con la copia comprobada
: > "$P/instalar.log"; sed -i 's/instalar v1/instalar v2/' "$T/zero-motor/instalar.sh"; publica "instalador v2"; vuelta
comprueba 'grep -q "instalar v2 SELLADO=1 FUENTE=sí motor.prueba" "$P/instalar.log"' "7 reinstala con la copia firmada ($A | $B | $(cat "$P/instalar.log"))"
comprueba '[ "$(cat /var/lib/guardiana/sello-seq)" = 3 ]' "7 queda la publicación 3"
# 7b) una publicación firmada que solo cambia la web: el motor no se reinicia, pero su número queda apuntado
: > "$P/systemctl.log"; echo '<p>web nueva</p>' > "$T/index.html"; publica "solo la web"; vuelta
comprueba '[ "$(cat /var/lib/guardiana/sello-seq)" = 4 ] && [ ! -s "$P/systemctl.log" ]' "7b solo la web: se apunta la nº 4 sin reiniciar ($A | $B)"
# 8) zero cambia el instalador en el disco y pide reinstalar: root ejecuta el firmado, no el del disco
: > "$P/instalar.log"; sudo -u zero sed -i 's/instalar v2/instalar MANIPULADO/' /opt/guardiana/web/zero-motor/instalar.sh
sudo -u zero touch /opt/guardiana/.reinstala; B=$(PATH="$FAKE:$PATH" bash /usr/local/lib/guardiana/sello-aplica.sh 2>&1)
comprueba 'grep -q "instalar v2" "$P/instalar.log" && ! grep -q MANIPULADO "$P/instalar.log"' "8 root ejecuta el instalador firmado ($B | $(cat "$P/instalar.log"))"
sudo -u zero git -C /opt/guardiana/web checkout -q -- zero-motor/instalar.sh
# 9) zero hace un commit propio y pide reinstalar: root no ejecuta nada
: > "$P/instalar.log"; sudo -u zero bash -c 'cd /opt/guardiana/web && echo "echo malo" >> zero-motor/instalar.sh && git -c user.name=z -c user.email=z@z commit -qam propio && touch /opt/guardiana/.reinstala'
B=$(PATH="$FAKE:$PATH" bash /usr/local/lib/guardiana/sello-aplica.sh 2>&1)
comprueba '[ ! -s "$P/instalar.log" ] && [[ $B == *"no lleva una firma válida"* ]]' "9 un commit sin firma no se ejecuta ($B)"
git config --system --unset-all safe.directory "^/srv/prueba-remoto\.git$" || true
rm -rf "$P" "$REM" /opt/guardiana /usr/local/lib/guardiana /etc/guardiana /var/lib/guardiana; userdel zero 2>/dev/null
echo "pruebas del servidor sellado: $ok OK, $mal fallos"
