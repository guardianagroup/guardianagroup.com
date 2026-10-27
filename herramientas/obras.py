#!/usr/bin/env python3
"""GUARDIANA · poner o quitar el «en construcción» en todas las páginas de la web.

Dueño, 27 Oct 2026, 09:29: «Pon toda la web que nadie la pueda utilizar, ponla en construcción».
Uso:  python3 herramientas/obras.py pon   [carpeta]   → añade /obras.js (y su <noscript>) al principio de cada página
      python3 herramientas/obras.py quita [carpeta]   → lo quita y la web vuelve a abrirse
No toca /obras.html, los archivos de verificación de Google, la extensión ni el motor de ZERO.
"""
import pathlib
import re
import subprocess
import sys

LINEA = '<script src="/obras.js"></script><noscript><meta http-equiv="refresh" content="0;url=/obras.html"></noscript>'
FUERA = re.compile(r'^(obras\.html|google[0-9a-f]+\.html|extension/|zero-motor/|node_modules/)')


def paginas(raiz):
    r = subprocess.run(['git', 'ls-files', '*.html'], cwd=raiz, capture_output=True, text=True, check=True)
    return [p for p in r.stdout.split('\n') if p and not FUERA.match(p)]


def pon(texto):
    if 'src="/obras.js"' in texto:
        return texto
    for patron in (r'<meta\s+charset=[^>]*>', r'<head(\s[^>]*)?>', r'<!doctype[^>]*>'):
        m = re.search(patron, texto, re.I)
        if m:
            return texto[:m.end()] + LINEA + texto[m.end():]
    return LINEA + texto


def quita(texto):
    return texto.replace(LINEA, '')


def main():
    modo = sys.argv[1] if len(sys.argv) > 1 else ''
    raiz = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '.')
    if modo not in ('pon', 'quita'):
        sys.exit(__doc__)
    cambia = 0
    for p in paginas(raiz):
        f = raiz / p
        t = f.read_text(encoding='utf-8')
        n = pon(t) if modo == 'pon' else quita(t)
        if n != t:
            f.write_text(n, encoding='utf-8')
            cambia += 1
    print(modo, cambia, 'páginas')


if __name__ == '__main__':
    main()
