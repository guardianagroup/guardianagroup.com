#!/bin/bash
# Copia a main un commit ya empujado a web-idiomas: solo los archivos de ese commit (git show --name-only), con
# comprobación de que main tiene la versión anterior de cada uno, y nunca las rutas prohibidas.
# uso: publica.sh <commit>   (web-idiomas en /home/claude/web y main en /home/claude/wt-main; ajusta las rutas si cambian)
set -euo pipefail
C=$(git -C /home/claude/web rev-parse "$1")
cd /home/claude/wt-main
git fetch -q origin
mapfile -t F < <(git show --name-only --format= "$C" | sed '/^$/d')
[ ${#F[@]} -gt 0 ] || { echo "SIN ARCHIVOS"; exit 1; }
for f in "${F[@]}"; do
  case "$f" in
    instalar.html|en/*|pt/*|descargas/*|*i18n/nueva/*) echo "PROHIBIDO: $f"; exit 1;;
  esac
  if git cat-file -e "$C~1:$f" 2>/dev/null; then
    a=$(git rev-parse "$C~1:$f"); b=$(git rev-parse "origin/main:$f" 2>/dev/null || echo NO)
    [ "$a" = "$b" ] || { echo "DIFIERE EN MAIN: $f"; exit 1; }
  else
    if git cat-file -e "origin/main:$f" 2>/dev/null; then echo "YA EXISTE EN MAIN: $f"; exit 1; fi
    echo "NUEVO: $f"
  fi
done
git checkout -q --detach origin/main
git checkout "$C" -- "${F[@]}"
git commit -q -F <(git log -1 --format=%B "$C")
git push -q origin HEAD:main
echo "main: $(git rev-parse --short HEAD) · ${#F[@]} archivos"
