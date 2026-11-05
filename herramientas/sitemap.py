#!/usr/bin/env python3
"""sitemap.xml a partir de las páginas reales de la web (5 Nov 2026; SEO).

Entran las páginas .html que no llevan <meta name="robots" content="noindex"> y cuyo <link rel="canonical"> es su propia
dirección (o no tienen), menos las excluidas abajo. Cada una lleva:
  - lastmod: la fecha del último commit que cambió el archivo, contada desde la referencia que se pase (por defecto HEAD;
    al generarlo en una rama de trabajo, pasar origin/main para que la fecha diga cuándo cambió de verdad la página).
  - xhtml:link hreflang: los <link rel="alternate" hreflang> de la propia página, solo hacia páginas que existen y entran.

    python3 herramientas/sitemap.py                  # escribe sitemap.xml (lastmod según HEAD)
    python3 herramientas/sitemap.py origin/main      # lastmod según origin/main
    python3 herramientas/sitemap.py --solo-ver       # lo imprime sin escribir

Hay que volver a ejecutarlo en cada publicación que añada, quite o cambie páginas.
"""
import html as H, os, re, subprocess, sys
from xml.sax.saxutils import escape

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOM = 'https://guardianagroup.com/'
FUERA = ('herramientas/', 'marca/', 'descargas/', 'extension/', 'zero-motor/', '.git/', 'node_modules/', 'v/')
# Decisión del dueño (5 Nov 2026, tras la auditoría SEO; PLAN.md, decisión 3): el índice y el sitemap dicen lo mismo.
# Las guías del DNS (18 páginas huérfanas del producto anterior) llevan «noindex» en la página y por eso no entran;
# zero.html, «por dentro» y «comprobar un recibo» entran (es/en/pt), e instalar también (la 1.0.56 ya se descarga desde la
# portada). Antes (28 Oct 2026, commit 8d0c3c70) todas esas páginas quedaban fuera del sitemap sin «noindex», y Google
# podía indexarlas igual por los enlaces. Aquí solo queda lo que no es una página de verdad.
# La aplicación (lo que se USA, no se LEE) va a /solo-pc/ en el teléfono (marco/marco.js) y el rastreador principal de
# Google es el móvil: fuera del sitemap, para que no salgan como «página con redirección». Se entra por zero.html,
# como-funciona.html y la portada (5 nov 2026).
EXCLUIDAS = {'index-anterior.html', 'orbita/index.html', 'orbita/zero/index.html', 'orbita/comunicaciones/index.html',
             'orbita/comunicaciones/verificar/index.html'}
EXCLUIDAS_CARPETAS = ()

OPCIONES = {'--solo-ver'}
raras = [a for a in sys.argv[1:] if a.startswith('--') and a not in OPCIONES]
if raras:
    sys.exit('opción desconocida: ' + ' '.join(raras) + ' (solo --solo-ver)')
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
REF = ARGS[0] if ARGS else 'HEAD'
SOLO_VER = '--solo-ver' in sys.argv
RE_ATTR = re.compile(r'([a-zA-Z_:\-][\w:\-\.]*)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))')


def attrs(s):
    return {m.group(1).lower(): H.unescape(m.group(2) if m.group(2) is not None else (m.group(3) if m.group(3) is not None else m.group(4) or ''))
            for m in RE_ATTR.finditer(s)}


def paginas():
    out = []
    for carpeta, dirs, archivos in os.walk(RAIZ):
        rel = os.path.relpath(carpeta, RAIZ).replace(os.sep, '/')
        rel = '' if rel == '.' else rel + '/'
        if rel.startswith(FUERA):
            dirs[:] = []
            continue
        for a in archivos:
            if a.endswith('.html') and not (rel == '' and a.startswith('google')):
                out.append(rel + a)
    return sorted(out)


def url_de(p):
    return DOM + (p[:-len('index.html')] if p.endswith('index.html') else p)


def ruta_de(u):
    if not u.startswith(DOM):
        return None
    p = u[len(DOM):]
    return p + 'index.html' if (p == '' or p.endswith('/')) else p


def cabecera(p):
    s = open(os.path.join(RAIZ, p), encoding='utf-8', errors='replace').read()
    i = s.lower().find('</head>')
    head = s[:i] if i > 0 else s[:20000]
    noindex, canonical, hreflang = False, '', []
    for m in re.finditer(r'<(meta|link)\b([^>]*)>', head, re.I):
        a = attrs(m.group(2))
        if m.group(1).lower() == 'meta':
            if (a.get('name') or '').lower() == 'robots' and 'noindex' in a.get('content', '').lower():
                noindex = True
        else:
            rels = (a.get('rel') or '').lower().split()
            if 'canonical' in rels:
                canonical = a.get('href', '')
            if 'alternate' in rels and a.get('hreflang'):
                hreflang.append((a['hreflang'], a.get('href', '')))
    return noindex, canonical, hreflang


def lastmod(p):
    return subprocess.run(['git', 'log', '-1', '--format=%cI', REF, '--', p], cwd=RAIZ, capture_output=True, text=True).stdout.strip()


def main():
    entran = {}
    for p in paginas():
        if p in EXCLUIDAS or p.startswith(EXCLUIDAS_CARPETAS):
            continue
        noindex, canonical, hreflang = cabecera(p)
        if noindex or (canonical and canonical != url_de(p)):
            continue
        entran[p] = hreflang
    lineas = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    n_alt = 0
    for p in sorted(entran, key=url_de):
        u = url_de(p)
        alts = [(l, h) for l, h in entran[p] if ruta_de(h) in entran and url_de(ruta_de(h)) == h]
        s = '  <url><loc>%s</loc>' % escape(u)
        lm = lastmod(p)
        if lm:
            s += '<lastmod>%s</lastmod>' % lm
        if any(h == u for _, h in alts) and any(h != u for _, h in alts):
            for l, h in alts:
                s += '<xhtml:link rel="alternate" hreflang="%s" href="%s"/>' % (escape(l), escape(h))
                n_alt += 1
        lineas.append(s + '</url>')
    lineas.append('</urlset>')
    salida = '\n'.join(lineas) + '\n'
    if SOLO_VER:
        sys.stdout.write(salida)
    else:
        open(os.path.join(RAIZ, 'sitemap.xml'), 'w', encoding='utf-8').write(salida)
    print('páginas en el sitemap: %d · enlaces hreflang: %d · lastmod según %s' % (len(entran), n_alt, REF), file=sys.stderr)


if __name__ == '__main__':
    main()
