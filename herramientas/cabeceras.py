#!/usr/bin/env python3
"""Blindaje de la web estática (26 Oct 2026, ronda 40 H; dueño: «quiero que esté blindada al máximo»).

GitHub Pages no deja poner cabeceras HTTP, así que lo que se puede hacer desde la propia página va en <meta>:
- Content-Security-Policy: solo recursos de la propia web (más las tres direcciones que «Ver mi conexión» mide), nada de
  objetos ni marcos ajenos, formularios solo a la propia web, y todo por HTTPS. Los scripts y estilos escritos dentro de
  las páginas se permiten ('unsafe-inline') porque la web tiene 851 scripts y 679 estilos así; lo que la política corta de
  verdad es cualquier script, imagen, fuente o conexión hacia otro dominio que alguien lograra colar.
- Referrer-Policy: al salir a otra web, solo el origen (guardianagroup.com), nunca la página concreta.
Solo se toca lo que falta: 268 páginas ya tenían la política estándar y 271 el referrer «no-referrer».
Lo que no se puede por <meta> (HSTS, X-Frame-Options/frame-ancestors, Permissions-Policy, COOP) necesita un servicio
delante de GitHub Pages: queda anotado en el traspaso.

Uso: python3 herramientas/cabeceras.py [raíz del repo]   (idempotente: actualiza las etiquetas si ya existen)
"""
import os, re, sys

RAIZ = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FUERA = ('v/', 'descargas/', 'node_modules/', '.git/', 'zero-motor/', 'herramientas/')

# La política estándar de la web (ya estaba en 268 páginas): nada que no sea de la propia web, sin objetos, sin formularios.
CSP_ESTANDAR = ("default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; "
                "font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'")
# Órbita: además mide «Ver mi conexión» contra tres servicios, dibuja en WebGL/canvas (blob:) y abre ZERO en un marco propio.
CSP_ORBITA = ("default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
              "font-src 'self'; connect-src 'self' https://speed.cloudflare.com https://ipinfo.io https://*.amazonaws.com; "
              "media-src 'self' blob:; worker-src 'self' blob:; frame-src 'self'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests")
# ZERO: la demo, más la conexión con el motor (en pruebas, el propio equipo; en producción, un servicio de guardianagroup.com).
CSP_ZERO = ("default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
            "font-src 'self'; connect-src 'self' wss://*.guardianagroup.com ws://127.0.0.1:* ws://localhost:*; media-src 'self' blob:; "
            "base-uri 'none'; form-action 'none'")
META_REF = '<meta name="referrer" content="no-referrer">'

RE_CSP = re.compile(r'<meta http-equiv="Content-Security-Policy"[^>]*>', re.I)
RE_REF = re.compile(r'<meta name="referrer"[^>]*>', re.I)
RE_CHARSET = re.compile(r'(<meta charset=["\']?utf-8["\']?\s*/?>)', re.I)


def politica(rel):
    if rel.endswith('orbita/index.html'): return CSP_ORBITA
    if rel.endswith('orbita/zero/index.html'): return CSP_ZERO
    return CSP_ESTANDAR


def trata(ruta, rel):
    s = open(ruta, encoding='utf-8').read()
    o = s
    m = RE_CHARSET.search(s)
    if not m:
        return 'sin charset'
    anade = ''
    if not RE_CSP.search(s): anade += '\n<meta http-equiv="Content-Security-Policy" content="%s">' % politica(rel)
    if not RE_REF.search(s): anade += '\n' + META_REF
    if anade:
        s = s[:m.end()] + anade + s[m.end():]
    if s != o:
        open(ruta, 'w', encoding='utf-8').write(s)
        return 'puesto'
    return 'igual'


def main():
    n = {'puesto': 0, 'igual': 0, 'sin charset': 0}
    for carpeta, dirs, archivos in os.walk(RAIZ):
        rel = os.path.relpath(carpeta, RAIZ).replace(os.sep, '/') + '/'
        if rel.startswith(FUERA) or '/.git/' in rel or rel.startswith('./.git'):
            dirs[:] = []
            continue
        for a in archivos:
            if a.endswith('.html') and not a.startswith('google'):
                r = trata(os.path.join(carpeta, a), os.path.join(rel, a))
                n[r] += 1
                if r == 'puesto': print('puesto:', os.path.join(rel, a))
    print(n)


if __name__ == '__main__':
    main()
