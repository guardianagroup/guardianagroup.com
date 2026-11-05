#!/usr/bin/env python3
"""Rastreo SEO local de todas las páginas .html del sitio (sin herramientas/, marca/, descargas/, extension/, zero-motor/).
Uso: python3 -I rastreo.py <raíz> > rastreo.json
"""
import json, os, re, sys, html as H
from urllib.parse import urlsplit, unquote

RAIZ = os.path.abspath(sys.argv[1])
FUERA = ('herramientas/', 'marca/', 'descargas/', 'extension/', 'zero-motor/', '.git/', 'node_modules/', 'v/')
DOMINIO = 'https://guardianagroup.com'

RE_TAG = re.compile(r'<(meta|link|script|img|h1|a|title|html|body|picture|source|iframe|video|noscript)\b([^>]*)>', re.I)
RE_ATTR = re.compile(r'([a-zA-Z_:\-][\w:\-\.]*)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))')


def attrs(s):
    d = {}
    for m in RE_ATTR.finditer(s):
        d[m.group(1).lower()] = H.unescape(m.group(2) if m.group(2) is not None else (m.group(3) if m.group(3) is not None else m.group(4) or ''))
    return d


def paginas():
    out = []
    for carpeta, dirs, archivos in os.walk(RAIZ):
        rel = os.path.relpath(carpeta, RAIZ).replace(os.sep, '/')
        rel = '' if rel == '.' else rel + '/'
        if rel.startswith(FUERA):
            dirs[:] = []
            continue
        for a in archivos:
            if a.endswith('.html'):
                out.append(rel + a)
    return sorted(out)


def resuelve(ref, rel):
    """Devuelve la ruta local (relativa a la raíz) de un enlace interno, o None si es externo/otro."""
    ref = ref.strip()
    if not ref or ref.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:', 'blob:')):
        return None
    u = urlsplit(ref)
    if u.scheme or u.netloc:
        if (u.scheme in ('http', 'https')) and u.netloc in ('guardianagroup.com', 'www.guardianagroup.com'):
            p = u.path
        else:
            return None
    else:
        p = u.path
        if not p:
            return None
    if not p.startswith('/'):
        base = os.path.dirname(rel)
        p = os.path.normpath(os.path.join('/' + base, p)).replace(os.sep, '/')
    p = unquote(p)
    if p.endswith('/'):
        p += 'index.html'
    p = p.lstrip('/')
    return p


def existe(p):
    return os.path.exists(os.path.join(RAIZ, p))


def analiza(rel):
    s = open(os.path.join(RAIZ, rel), encoding='utf-8', errors='replace').read()
    r = {'pagina': rel, 'bytes': len(s.encode('utf-8'))}
    head_end = s.lower().find('</head>')
    head = s[:head_end] if head_end > 0 else s[:20000]
    sin_scripts = re.sub(r'<script\b[^>]*>.*?</script\s*>', '', s, flags=re.S | re.I)
    sin_estilos = re.sub(r'<style\b[^>]*>.*?</style\s*>', '', sin_scripts, flags=re.S | re.I)
    sin_comentarios = re.sub(r'<!--.*?-->', '', sin_estilos, flags=re.S)
    m = re.search(r'<html\b([^>]*)>', s, re.I)
    ha = attrs(m.group(1)) if m else {}
    r['lang'] = ha.get('lang', '')
    r['data_idiomas'] = bool(ha.get('data-idiomas'))
    m = re.search(r'<title[^>]*>(.*?)</title>', head, re.I | re.S)
    r['title'] = H.unescape(m.group(1).strip()) if m else ''
    r['title_len'] = len(r['title'])
    metas = {}
    links = []
    for mt in re.finditer(r'<(meta|link)\b([^>]*)>', head, re.I):
        a = attrs(mt.group(2))
        if mt.group(1).lower() == 'meta':
            k = (a.get('name') or a.get('property') or a.get('http-equiv') or '').lower()
            if k:
                metas.setdefault(k, []).append(a.get('content', ''))
        else:
            links.append(a)
    r['description'] = (metas.get('description') or [''])[0]
    r['description_len'] = len(r['description'])
    r['robots'] = (metas.get('robots') or [''])[0]
    r['noindex'] = 'noindex' in r['robots'].lower()
    r['theme_color'] = (metas.get('theme-color') or [''])[0]
    r['viewport'] = bool(metas.get('viewport'))
    r['refresh'] = (metas.get('refresh') or [''])[0]
    r['og'] = {k[3:]: v[0] for k, v in metas.items() if k.startswith('og:')}
    r['twitter'] = {k[8:]: v[0] for k, v in metas.items() if k.startswith('twitter:')}
    r['canonical'] = ''
    r['hreflang'] = {}
    r['preload'] = []
    r['stylesheets'] = []
    r['icon'] = False
    r['manifest'] = False
    for a in links:
        rels = (a.get('rel') or '').lower().split()
        if 'canonical' in rels:
            r['canonical'] = a.get('href', '')
        if 'alternate' in rels and a.get('hreflang'):
            r['hreflang'][a['hreflang']] = a.get('href', '')
        if 'preload' in rels:
            r['preload'].append({'as': a.get('as', ''), 'href': a.get('href', '')})
        if 'stylesheet' in rels:
            r['stylesheets'].append(a.get('href', ''))
        if 'icon' in rels or 'apple-touch-icon' in rels:
            r['icon'] = True
        if 'manifest' in rels:
            r['manifest'] = True
    # scripts en head: bloqueantes
    r['scripts_head_bloqueantes'] = []
    r['scripts_head_inline'] = 0
    for ms in re.finditer(r'<script\b([^>]*)>', head, re.I):
        a = attrs(ms.group(1))
        if a.get('src'):
            if 'async' not in a and 'defer' not in a and a.get('type', '') != 'module':
                r['scripts_head_bloqueantes'].append(a['src'])
        else:
            if a.get('type', '').lower() not in ('application/ld+json', 'application/json'):
                r['scripts_head_inline'] += 1
    # JSON-LD
    r['jsonld'] = []
    for mj in re.finditer(r'<script\b[^>]*type\s*=\s*["\']application/ld\+json["\'][^>]*>(.*?)</script>', s, re.I | re.S):
        try:
            d = json.loads(mj.group(1))
            items = d.get('@graph', [d]) if isinstance(d, dict) else d
            for it in items:
                if isinstance(it, dict):
                    r['jsonld'].append(it.get('@type', '?'))
        except Exception as e:
            r['jsonld'].append('ERROR:' + str(e)[:60])
    # h1
    h1s = re.findall(r'<h1\b[^>]*>(.*?)</h1>', sin_comentarios, re.I | re.S)
    r['h1'] = [re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h)).strip()[:120] for h in h1s]
    r['h1_n'] = len(h1s)
    # imágenes
    imgs = [attrs(mi.group(1)) for mi in re.finditer(r'<img\b([^>]*)>', sin_comentarios, re.I)]
    r['img_n'] = len(imgs)
    r['img_sin_alt'] = [i.get('src', '')[:100] for i in imgs if 'alt' not in i]
    r['img_lazy'] = sum(1 for i in imgs if i.get('loading', '').lower() == 'lazy')
    r['img_sin_dim'] = sum(1 for i in imgs if not (i.get('width') and i.get('height')))
    # redirección por JS
    r['js_redirect'] = bool(re.search(r'location\.(replace|href|assign)\s*[\(=]', head))
    # enlaces internos rotos
    rotos = set()
    n_enlaces = 0
    for ma in re.finditer(r'<a\b([^>]*)>', sin_comentarios, re.I):
        a = attrs(ma.group(1))
        href = a.get('href', '')
        p = resuelve(href, rel)
        if p is None:
            continue
        n_enlaces += 1
        if not existe(p):
            rotos.add(href)
    r['enlaces_internos'] = n_enlaces
    r['enlaces_rotos'] = sorted(rotos)
    # recursos rotos (img, script, link)
    rec_rotos = set()
    for mr in re.finditer(r'<(img|script|link|source|video|iframe)\b([^>]*)>', sin_comentarios, re.I):
        a = attrs(mr.group(2))
        for k in ('src', 'href', 'srcset'):
            v = a.get(k)
            if not v:
                continue
            for cand in ([x.strip().split()[0] for x in v.split(',') if x.strip()] if k == 'srcset' else [v]):
                p = resuelve(cand, rel)
                if p and not existe(p):
                    rec_rotos.add(cand[:100])
    r['recursos_rotos'] = sorted(rec_rotos)
    # fuentes
    r['fuentes_externas'] = bool(re.search(r'fonts\.(googleapis|gstatic)\.com|cdnjs|jsdelivr|unpkg', s, re.I))
    r['font_face'] = len(re.findall(r'@font-face', s))
    # texto visible aproximado (palabras)
    texto = re.sub(r'<[^>]+>', ' ', sin_comentarios)
    r['palabras'] = len(re.findall(r'\w+', texto))
    # palabras vetadas en el texto visible y en metas
    vet = ['auditada', 'certificada', 'CNSA 2.0', 'anónima', '100 % seguro', '100% seguro', 'imposible', 'nadie puede', 'los primeros', 'garantizamos', 'cifrad']
    r['vetadas'] = sorted({v for v in vet if re.search(re.escape(v), texto + ' ' + r['title'] + ' ' + r['description'], re.I)})
    return r


if __name__ == '__main__':
    res = [analiza(p) for p in paginas()]
    json.dump(res, sys.stdout, ensure_ascii=False, indent=1)
