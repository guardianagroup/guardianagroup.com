#!/usr/bin/env python3
"""Huellas SHA-256 de los archivos que sirve Comunicaciones (28 Oct 2026; OWASP ASVS 5.0, integridad del código).

Escribe orbita/comunicaciones/huellas.txt en el formato de `sha256sum`, con rutas relativas a la raíz del sitio, para
que cualquiera compare lo que le ha llegado al navegador con lo publicado en el repositorio:

    python3 herramientas/huellas.py          # regenerar (hacerlo en cada versión que cambie un archivo)
    sha256sum -c orbita/comunicaciones/huellas.txt   # comprobar desde la raíz de una copia del sitio

Límite: una lista servida por el mismo servidor no protege de un servidor comprometido; su valor está en poder
compararla con el historial público del repositorio, que nadie puede reescribir sin dejar rastro.
"""
import hashlib, os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARPETAS = ['orbita/comunicaciones']
SUELTOS = ['orbita/static/idioma.js', 'obras.js']
EXT = ('.js', '.css', '.html', '.json', '.svg', '.woff2')
SALIDA = 'orbita/comunicaciones/huellas.txt'


def archivos():
    out = []
    for c in CARPETAS:
        for d, _, fs in os.walk(os.path.join(RAIZ, c)):
            for f in fs:
                r = os.path.relpath(os.path.join(d, f), RAIZ).replace(os.sep, '/')
                if r.endswith(EXT) and r != SALIDA:
                    out.append(r)
    out += [s for s in SUELTOS if os.path.exists(os.path.join(RAIZ, s))]
    return sorted(set(out))


def main():
    lineas = []
    for r in archivos():
        h = hashlib.sha256(open(os.path.join(RAIZ, r), 'rb').read()).hexdigest()
        lineas.append(f'{h}  {r}')
    open(os.path.join(RAIZ, SALIDA), 'w', encoding='utf-8').write('\n'.join(lineas) + '\n')
    print(len(lineas), 'archivos →', SALIDA)


if __name__ == '__main__':
    main()
