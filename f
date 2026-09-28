#!/bin/bash
# GUARDIANA · atajo para el Mac de publicación (28 sep 2026): en Terminal basta con
#   curl -sLo f guardianagroup.com/f; bash f
# Baja el guion de firma de la versión en curso (rama mac del código) y lo ejecuta. No firma nada
# por sí mismo ni sube nada: lo que hace está en firmar-1.0.1, que se puede leer antes.
set -e
cd "$HOME"
curl -fsSL -o firmar "https://github.com/guardianagroup/guardiana/raw/mac/firmar-1.0.1"
exec bash firmar
