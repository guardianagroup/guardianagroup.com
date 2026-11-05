#!/usr/bin/env python3
"""Portadas en inglés y en portugués para los buscadores (5 Nov 2026; plan SEO, decisión 2, opción A del dueño).

index.html es la única fuente: lleva los textos en español en la página y los de inglés y portugués dentro del diccionario
`const I={…}` (los otros 39 idiomas viven en i18n/portada/). Hasta hoy /en/ y /pt/ eran redirecciones «noindex» a
/?lang=…, y la portada se traducía en el navegador: ningún buscador veía la versión inglesa ni la portuguesa.

Esta herramienta genera en/index.html y pt/index.html a partir de index.html, con todo ya en su idioma dentro del HTML:
  - <html lang> propio; cada texto visible del cuerpo (y los atributos aria-label, alt y title) traducido con el mismo
    diccionario y las mismas reglas que usa la página en el navegador (se salta script, style, svg, canvas, noscript,
    data-live, #phrase, #ms-cap, #rec-n); la frase inicial (#phrase) montada como la monta phrase(); el código del
    selector (ES → EN/PT). NUNCA se inventa una traducción: un texto sin entrada en el diccionario se queda en español y
    se avisa en la salida.
  - title, description, Open Graph y Twitter en su idioma (los títulos salen del propio diccionario; las descripciones,
    de META, ≤ 155 caracteres), canonical absoluto propio, los mismos cuatro hreflang (es, en, pt, x-default → es) que
    lleva index.html, og:locale, y el JSON-LD con la página (WebPage) y el programa en su idioma (inLanguage).
  - enlaces internos a la página equivalente del idioma cuando existe (se lee el hreflang de la página española enlazada;
    el ancla se conserva solo si existe en la página de destino) y a la española cuando no; los data-l-en/data-l-pt y
    data-lang-q de la página, resueltos como los resuelve aplica().
  - rutas de recursos absolutas (globo.jpg, earth*.jpg en CSS y JS…) para que funcionen desde /en/ y /pt/.
  - el guion de idioma de la página adaptado: la página ya está en su idioma; elegir otro en el selector o llegar con
    «?lang=otro» lleva a su dirección (/, /en/, /pt/ o /?lang=xx para los otros 39), sin redirecciones automáticas por
    el idioma del navegador y sin bucles (/en/ y /pt/ solo salen de sí mismas con «?lang=» de otro idioma).
  - la Content-Security-Policy con los hashes de sus propios scripts (los mismos que calcula csp-hashes.py; después,
    csp-hashes.py no cambia nada).

Es idempotente: siempre parte de index.html; si lo generado no cambia, no escribe.

PROCEDIMIENTO · después de cada cambio de index.html (texto, diccionario, scripts, planeta, cabecera):
    python3 herramientas/portadas.py .                 # genera en/index.html y pt/index.html (avisa de lo no traducido)
    python3 herramientas/csp-hashes.py .               # debe decir «igual» para las tres portadas
    python3 herramientas/huellas.py .
    node herramientas/csp-comprueba.js . --solo '^(index\\.html|en/index\\.html|pt/index\\.html)$'
    python3 herramientas/sitemap.py                    # /en/ y /pt/ con hreflang
  Y mirar las tres en pantalla. Se puede ver sin escribir: python3 herramientas/portadas.py . --solo-ver

Si index.html cambia de forma (los puntos de anclaje del guion de idioma: PARCHES), la herramienta se detiene y lo dice:
hay que actualizar PARCHES, nunca editar en/index.html ni pt/index.html a mano.
"""
import html as H, importlib.util, json, os, re, sys

RAIZ = os.path.abspath(next((a for a in sys.argv[1:] if not a.startswith('--')), os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')))
SOLO_VER = '--solo-ver' in sys.argv
DOM = 'https://guardianagroup.com/'
FUENTE = 'index.html'

# Lo que no está en el diccionario de la página (metadatos para los buscadores). En portugués, la portada dice «criptografado»
# (las doce frases traducidas del cuerpo, y pt/como-funciona y pt/privacidade): aquí lo mismo, por coherencia de la página;
# el programa en portugués dice «encriptado»; una sola forma es decisión del dueño. Nunca «cifrado».
META = {
    'en': {
        'description': "Explore the internet's infrastructure, see what each website connects to in the ZERO browser and send encrypted messages and files. Windows, no account.",
        'og_description': "Explore the internet's infrastructure, see what each website connects to in the ZERO browser and send encrypted messages and files. Español · English · Português.",
        'og_image_alt': 'Planet Earth from space under the words: See the connections. Decide what to cut.',
        'app': "A program for Windows: the ZERO browser, which opens each website away from your computer and shows its connections; Communications, with end-to-end encrypted messages, calls and files; and Orbit, the map of the internet's infrastructure. No account. Includes a 7-day trial with all its features.",
        'offer': 'Free download with a 7-day trial of all its features. Nothing is charged today.',
    },
    'pt': {
        'description': 'Explore a infraestrutura da internet, veja as conexões de cada site no navegador ZERO e envie mensagens e arquivos criptografados. Windows, sem conta.',
        'og_description': 'Explore a infraestrutura da internet, veja as conexões de cada site no navegador ZERO e envie mensagens e arquivos criptografados. Español · English · Português.',
        'og_image_alt': 'O planeta Terra visto do espaço sob as palavras: Veja as conexões. Decida o que cortar.',
        'app': 'Um programa para Windows: o navegador ZERO, que abre cada site longe do seu computador e mostra as suas conexões; o Comunicações, com mensagens, chamadas e arquivos criptografados de ponta a ponta; e a Órbita, o mapa da infraestrutura da internet. Sem conta. Inclui 7 dias de teste com todas as funções.',
        'offer': 'Download gratuito com 7 dias de teste de todas as funções. Hoje não se cobra nada.',
    },
}
# código · carpeta · html lang (el de DATO en la página) · og:locale · nombre (para los comentarios)
PAGINAS = {
    'en': {'ruta': 'en/index.html', 'url': DOM + 'en/', 'tag': 'en', 'locale': 'en_US', 'nombre': 'inglés'},
    'pt': {'ruta': 'pt/index.html', 'url': DOM + 'pt/', 'tag': 'pt-BR', 'locale': 'pt_BR', 'nombre': 'portugués'},
}
LOCALES = {'es': 'es_CO', 'en': 'en_US', 'pt': 'pt_BR'}
IX = {'en': 0, 'pt': 1}

# Los mismos saltos que hace la página en el navegador (walk() del guion de idioma).
SALTA_ETIQUETAS = {'script', 'style', 'svg', 'canvas', 'noscript'}
SALTA_IDS = {'phrase', 'lightp', 'ms-cap', 'rec-n'}
VACIAS = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
ATRIBUTOS = ('aria-label', 'alt', 'title')
EXT_RECURSOS = r'(?:jpe?g|png|webp|avif|gif|svg|json|mp4|webm|woff2?|css|js|ico|webmanifest)'

TOKEN = re.compile(r'<!--.*?-->'
                   r'|<(script|style)\b[^>]*>.*?</\1\s*>'
                   r'|<[a-zA-Z][^\s>/]*(?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+))?)*\s*/?>'
                   r'|</[a-zA-Z][^>]*>'
                   r'|[^<]+', re.S)
RE_ATTR = re.compile(r'(\s)([a-zA-Z_:\-][\w:\-\.]*)(\s*=\s*)("([^"]*)"|\'([^\']*)\')')
RE_ATTR_TODOS = re.compile(r'\s([a-zA-Z_:\-][\w:\-\.]*)(?:\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+)))?')

# Parches del guion de idioma para la página generada: cada «antes» debe aparecer exactamente una vez en index.html.
# {l} es el código del idioma y {nombre} su nombre; las llaves son las del propio JavaScript.
PARCHES = [
    ("let cur='es';", "let cur='{l}';"),
    ("if(!first||l!=='es') phrase(l);", "if(!first||l!=='{l}') phrase(l);"),
    ("  if(meta) meta.setAttribute('content',window.__x('meta'));\n",
     "  /* portada generada: la descripción para los buscadores está escrita en la página */\n"),
    ("function setLang(l, first){\n"
     "  if(!ok(l)) l='en';\n"
     "  if(!first&&PAG[l]){ try{ localStorage.setItem('guardiana-lang',l); }catch(_){} location.assign(PAG[l]+location.hash); return; }\n"
     "  if(IX[l]!=null||l==='es') return aplica(l, first);\n"
     "  const H=document.documentElement; if(first) H.classList.add('i18n-espera');\n"
     "  const t=setTimeout(()=>H.classList.remove('i18n-espera'),2500);\n"
     "  carga(l).then(()=>{ clearTimeout(t); aplica(l, first); }).catch(()=>{ clearTimeout(t); aplica(first?'en':cur, first); });\n"
     "}\n",
     "function setLang(l, first){\n"
     "  // portada generada por herramientas/portadas.py: esta página está en {nombre}; otro idioma es otra dirección\n"
     "  if(!ok(l)) l='en';\n"
     "  if(l!=='{l}'){ try{ localStorage.setItem('guardiana-lang',l); localStorage.setItem('guardiana-lang-chosen','1'); }catch(_){} location.assign((PAG[l]||'/?lang='+l)+location.hash); return; }\n"
     "  return aplica(l, first);\n"
     "}\n"),
    ("let l0='en';", "let l0='{l}';"),
    ("  if(q&&ok(q)) l0=q; else if(chosen&&st&&ok(st)) l0=st; else if(nav==='en'&&porZona) l0=porZona; else if(nav) l0=nav; else if(porZona) l0=porZona;\n",
     "  // portada en {nombre}: el idioma es el de la dirección; con «?lang=» de otro idioma, el <head> ya ha salido hacia su portada\n"),
]
# El guion del <head> de index.html (/?lang=en → /en/, también el idioma elegido a mano) y el de la portada generada.
CABEZA_ES = re.compile(r"<script>\(function\(\)\{try\{var P=\{en:'/en/',pt:'/pt/'\},q=new URLSearchParams\(location\.search\)\.get\('lang'\)[^<]*</script>")
CABEZA = ("<script>(function(){try{var q=new URLSearchParams(location.search).get('lang');if(q&&q!=='{l}'){var P={en:'/en/',pt:'/pt/'};"
          "try{window.stop();}catch(_){}location.replace((P[q]||'/?lang='+q)+location.hash);}}catch(e){}})();</script>")


def carga_csp():
    """Las funciones de csp-hashes.py (mismo cálculo de hashes, misma política)."""
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'csp-hashes.py')
    spec = importlib.util.spec_from_file_location('csp_hashes', ruta)
    mod = importlib.util.module_from_spec(spec)
    argv, sys.argv = sys.argv, [ruta]
    try:
        spec.loader.exec_module(mod)
    finally:
        sys.argv = argv
    return mod


def norm(t):
    return re.sub(r'\s+', ' ', t).strip()


def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def esc_attr(t):
    return esc(t).replace('"', '&quot;')


def atributos(tag):
    """Los atributos de una etiqueta (los que no llevan valor, como data-live, valen '')."""
    i = tag.find(' ')
    if i < 0:
        return {}
    cuerpo = tag[i:-2] if tag.endswith('/>') else tag[i:-1]
    return {m.group(1).lower(): H.unescape(m.group(2) if m.group(2) is not None else m.group(3) if m.group(3) is not None else m.group(4) or '')
            for m in RE_ATTR_TODOS.finditer(cuerpo)}


def pon_attr(tag, nombre, valor):
    """Cambia (o añade) un atributo, con el valor entre comillas dobles."""
    def rep(m):
        return m.group(0) if m.group(2).lower() != nombre else '%s%s%s"%s"' % (m.group(1), m.group(2), m.group(3), esc_attr(valor))
    if re.search(r'\s%s\s*=' % re.escape(nombre), tag, re.I):
        return RE_ATTR.sub(rep, tag)
    i = len(tag) - 2 if tag.endswith('/>') else len(tag) - 1
    return tag[:i] + ' %s="%s"' % (nombre, esc_attr(valor)) + tag[i:]


def cabecera_pagina(rel):
    """hreflang y las anclas (id=) de una página de la web."""
    ruta = os.path.join(RAIZ, rel)
    if not os.path.isfile(ruta):
        return None, set()
    s = open(ruta, encoding='utf-8', errors='replace').read()
    alts = {}
    for m in re.finditer(r'<link\b[^>]*>', s[:s.lower().find('</head>') if '</head>' in s.lower() else 20000], re.I):
        a = atributos(m.group(0))
        if 'alternate' in (a.get('rel') or '').lower().split() and a.get('hreflang'):
            alts[a['hreflang'].lower()] = a.get('href', '')
    ids = set(re.findall(r'\sid="([^"]+)"', s))
    return alts, ids


def ruta_local(href):
    """La página del repositorio a la que lleva un enlace interno (sin ancla ni consulta), o None."""
    if href.startswith(DOM):
        href = '/' + href[len(DOM):]
    if not href.startswith('/'):
        return None
    p = href.split('#')[0].split('?')[0]
    return p[1:] + 'index.html' if p.endswith('/') else p[1:]


class Portada:
    def __init__(self, fuente, I, l, csp):
        self.s, self.I, self.l, self.csp = fuente, I, l, csp
        self.D = I['d']
        self.ix = IX[l]
        self.pag = PAGINAS[l]
        self.sin = []       # textos del cuerpo sin traducción (se quedan en español)
        self.enlaces = {}   # href español → href del idioma
        self.avisos = []
        self.cache = {}
        # nombres (con y sin extensión) de las imágenes que viven en la raíz de la web: las texturas del planeta y el globo
        self.raiz_imagenes = set()
        for f in os.listdir(RAIZ):
            if re.search(r'\.(?:jpe?g|png|webp|avif)$', f) and re.match(r'^(earth|globo)\b', f):
                self.raiz_imagenes.update({f, f.rsplit('.', 1)[0]})

    # ---- textos ----
    def tr(self, es):
        """La traducción de un texto, conservando su espacio inicial y final; None si no hay."""
        k = norm(es)
        if not k or k not in self.D:
            return None
        e = self.D[k][self.ix]
        if not e:
            return None
        if norm(e) in self.D and self.D[norm(e)][self.ix] != norm(e):
            self.avisos.append('el texto traducido «%s» coincide con una clave española distinta: en el navegador se volvería a traducir' % e[:60])
        lead = re.match(r'\s*', es).group(0)
        tail = re.search(r'\s*$', es).group(0)
        return lead + e + tail

    def texto(self, raw):
        if not raw.strip():
            return raw
        t = self.tr(H.unescape(raw))
        if t is None:
            k = norm(H.unescape(raw))
            # nombres propios, códigos y cifras no se traducen; lo demás sin entrada en el diccionario se avisa
            if (re.search(r'[A-Za-zÀ-ÿ]{3,}', k) and k not in ('GUARDIANA', 'NÚCLEO', 'ZERO', 'Cartagena') and not re.match(r'^[A-Z0-9\-]+$', k)
                    and not re.search(r'\.example$', k) and k not in self.sin):
                self.sin.append(k)
            return raw
        return esc(t)

    # ---- enlaces ----
    def enlace(self, href, tag):
        """El enlace equivalente en este idioma: data-l-xx si el <a> lo trae; si no, el hreflang de la página española."""
        a = atributos(tag)
        propio = a.get('data-l-' + self.l)
        if propio:
            return propio
        if href in ('/', '/index.html'):
            return '/' + self.l + '/'
        rel = ruta_local(href)
        if rel is None or rel == '':
            return href
        if rel in self.cache:
            alts, ids = self.cache[rel]
        else:
            alts, ids = self.cache[rel] = cabecera_pagina(rel)
        if alts is None:
            self.avisos.append('enlace a una página que no existe: ' + href)
            return href
        destino = alts.get(self.l)
        if not destino or ruta_local(destino) == rel:
            return href
        if destino.startswith(DOM):
            destino = '/' + destino[len(DOM):]
        rel2 = ruta_local(destino)
        if rel2 is None or not os.path.isfile(os.path.join(RAIZ, rel2)):
            self.avisos.append('la página %s declara un hreflang %s que no existe: %s' % (rel, self.l, destino))
            return href
        ancla = href.split('#')[1] if '#' in href else ''
        if ancla:
            ids2 = self.cache.setdefault(rel2, cabecera_pagina(rel2))[1]
            if ancla in ids2:
                destino += '#' + ancla
            else:
                self.avisos.append('el ancla #%s de %s no existe en %s: enlace sin ancla' % (ancla, href, destino))
        self.enlaces[href] = destino
        return destino

    # ---- etiquetas del cuerpo ----
    def etiqueta(self, tag, nombre):
        a = atributos(tag)
        for at in ATRIBUTOS:
            v = a.get(at)
            if v and norm(v) in self.D:
                t = self.tr(v)
                if t is not None:
                    tag = pon_attr(tag, at, t)
        if nombre == 'a' and 'href' in a:
            href = a['href']
            if 'data-href' in a and a['data-href'] == 'install':
                nuevo = self.I['install'].get(self.l) or self.I['install']['en']
            elif 'data-lang-q' in a:
                p, _, q = href.partition('?')
                qs = [x for x in q.split('&') if x and not x.startswith('lang=')] + ['lang=' + self.l]
                nuevo = p + '?' + '&'.join(qs)
            else:
                nuevo = self.enlace(href, tag)
            if nuevo != href:
                self.enlaces[href] = nuevo
                if 'data-l-en' in a and 'data-l-es' not in a:
                    tag = pon_attr(tag, 'data-l-es', href)
                tag = pon_attr(tag, 'href', nuevo)
        for at in ('src', 'poster'):
            v = a.get(at)
            if v and not re.match(r'^(?:/|#|[a-z]+:)', v, re.I):
                tag = pon_attr(tag, at, '/' + v)
        if a.get('srcset'):
            partes = [x.strip() for x in a['srcset'].split(',')]
            nuevas = [('/' + x if x and not re.match(r'^(?:/|[a-z]+:)', x, re.I) else x) for x in partes]
            if nuevas != partes:
                tag = pon_attr(tag, 'srcset', ', '.join(nuevas))
        return tag

    def frase(self):
        """#phrase tal como lo monta phrase() en la página: una palabra por <span>, la última y la destacada con sus clases."""
        w, hi = self.I['phrase'][self.l], self.I['hi'][self.l]
        out = []
        for i, x in enumerate(w):
            last = i == len(w) - 1
            delay = ('%.2f' % (.15 + .14 * i + (.08 if last else 0))).lstrip('0')
            out.append('<span class="w%s" style="animation-delay:%ss">%s</span>' % (' g-light' if i == hi else '', delay, esc(x)))
        return ' '.join(out)

    # ---- scripts y estilos ----
    def script(self, bloque):
        bloque = re.sub(r'''(['"`])([A-Za-z0-9_\-]+\.%s)\1''' % EXT_RECURSOS, r'\1/\2\1', bloque)
        # los mapas del planeta se piden también por su nombre sin extensión (load('earth', …) pide earth.webp y earth.jpg)
        return re.sub(r'''(['"`])(%s)\1''' % '|'.join(map(re.escape, sorted(self.raiz_imagenes, key=len, reverse=True))), r'\1/\2\1', bloque) if self.raiz_imagenes else bloque

    def estilo(self, bloque):
        return re.sub(r'url\((\s*[\'"]?)(?!\s*[\'"]?(?:/|#|[a-z]+:))', r'url(\1/', bloque, flags=re.I)

    # ---- la cabecera ----
    def cabeza(self, head):
        l, p, I, m = self.l, self.pag, self.I, META[self.l]
        titulo = I['title'][l]
        if len(titulo) > 60 or len(m['description']) > 155:
            raise SystemExit('%s: título (%d) o descripción (%d) demasiado largos' % (l, len(titulo), len(m['description'])))
        head = re.sub(r'<title>[^<]*</title>', '<title>%s</title>' % esc(titulo), head, count=1)
        head = pon_meta(head, 'name', 'description', m['description'])
        head = pon_meta(head, 'property', 'og:title', titulo)
        head = pon_meta(head, 'property', 'og:description', m['og_description'])
        head = pon_meta(head, 'property', 'og:url', p['url'])
        head = pon_meta(head, 'property', 'og:image:alt', m['og_image_alt'])
        head = pon_meta(head, 'name', 'twitter:title', titulo)
        head = pon_meta(head, 'name', 'twitter:description', m['description'])
        head = pon_meta(head, 'property', 'og:locale', p['locale'])
        otros = [LOCALES[x] for x in ('es', 'en', 'pt') if x != l]
        n = [0]

        def alt(mm):
            n[0] += 1
            return '<meta property="og:locale:alternate" content="%s">' % otros[n[0] - 1] if n[0] <= len(otros) else ''
        head = re.sub(r'<meta property="og:locale:alternate" content="[^"]*">', alt, head)
        if n[0] != len(otros):
            raise SystemExit('og:locale:alternate: esperaba %d, hay %d' % (len(otros), n[0]))
        head, k = re.subn(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % p['url'], head)
        if k != 1:
            raise SystemExit('canonical: %d' % k)
        for hl, u in (('es', DOM), ('en', DOM + 'en/'), ('pt', DOM + 'pt/'), ('x-default', DOM)):
            if '<link rel="alternate" hreflang="%s" href="%s">' % (hl, u) not in head:
                raise SystemExit('index.html no lleva el hreflang %s → %s' % (hl, u))
        head, k = CABEZA_ES.subn(lambda mm: CABEZA.replace('{l}', l), head)
        if k != 1:
            raise SystemExit('no encuentro el guion «?lang=» del <head> de index.html (%d)' % k)
        head = re.sub(r'<script type="application/ld\+json">(.*?)</script>', lambda mm: '<script type="application/ld+json">%s</script>' % self.jsonld(mm.group(1)), head, count=1, flags=re.S)
        # recursos relativos también en los estilos y guiones de la cabecera
        head = re.sub(r'<style\b[^>]*>.*?</style\s*>', lambda mm: self.estilo(mm.group(0)), head, flags=re.S)
        head = re.sub(r'<script\b[^>]*>.*?</script\s*>', lambda mm: mm.group(0) if 'ld+json' in mm.group(0)[:60] else self.script(mm.group(0)), head, flags=re.S)
        head = head.replace('<meta charset="utf-8">',
                            '<meta charset="utf-8">\n<!-- GENERADA por herramientas/portadas.py a partir de index.html (la fuente única): no editar a mano. '
                            'Portada de GUARDIANA en %s para quien la lee y para los buscadores. -->' % p['nombre'], 1)
        return head

    def jsonld(self, txt):
        d = json.loads(txt)
        l, p, m = self.l, self.pag, META[self.l]
        titulo = self.I['title'][l]
        for g in d['@graph']:
            t = g.get('@type')
            if t == 'WebSite':
                g['description'] = m['description']
            elif t == 'WebPage':
                g['@id'] = p['url'] + '#page'
                g['url'] = p['url']
                g['name'] = titulo
                g['description'] = m['description']
                g['inLanguage'] = l
            elif t == 'SoftwareApplication':
                g['description'] = m['app']
                g['installUrl'] = self.I['install'].get(l) or g.get('installUrl')
                if 'offers' in g and 'description' in g['offers']:
                    g['offers']['description'] = m['offer']
                for campo in ('softwareHelp',):
                    if campo in g:
                        rel = ruta_local(g[campo])
                        alts, _ = self.cache.setdefault(rel, cabecera_pagina(rel)) if rel else (None, None)
                        if alts and alts.get(l):
                            g[campo] = alts[l]
        return json.dumps(d, ensure_ascii=False, separators=(',', ':'))

    # ---- todo ----
    def genera(self):
        s = self.s
        i_head, i_body = s.index('<head>'), s.index('<body')
        html_tag = s[:i_head]
        html_tag, k = re.subn(r'<html lang="es"', '<html lang="%s"' % self.pag['tag'], html_tag)
        if k != 1:
            raise SystemExit('<html lang="es"> no encontrado')
        cab = self.cabeza(s[i_head:i_body])
        cuerpo = self.cuerpo(s[i_body:])
        for antes, despues in PARCHES:
            despues = despues.replace('{l}', self.l).replace('{nombre}', self.pag['nombre'])
            if cuerpo.count(antes) != 1:
                raise SystemExit('el punto de anclaje del guion de idioma no aparece exactamente una vez en index.html (actualizar PARCHES):\n' + antes[:160])
            cuerpo = cuerpo.replace(antes, despues)
        out = html_tag + cab + cuerpo
        for mm in re.finditer(r'''(?:src|srcset|poster|href)="([^"/#][^"]*)"|url\(\s*['"]?([A-Za-z0-9_\-][^'")]*)''', out):
            v = (mm.group(1) or mm.group(2) or '').split('?')[0].split(',')[0].strip()
            if v and not re.match(r'^[a-z]+:', v) and v not in ('install',) and os.path.exists(os.path.join(RAIZ, v)):
                self.avisos.append('ruta relativa a un archivo de la raíz, que desde /%s/ no se encontraría: %s' % (self.l, mm.group(0)[:80]))
        # la política: los hashes de los scripts de ESTA página (los de index.html no valen: el guion de idioma cambia)
        hashes, av = self.csp.hashes_de(out)
        self.avisos += av
        m = self.csp.RE_CSP.search(out)
        if not m:
            raise SystemExit('sin Content-Security-Policy')
        out = out[:m.start(1)] + self.csp.politica_nueva(m.group(1), hashes) + out[m.end(1):]
        return out

    def cuerpo(self, s):
        out = []
        pila = []        # (nombre, se salta su texto)
        en_frase = False
        for m in TOKEN.finditer(s):
            t = m.group(0)
            if en_frase:  # el contenido de #phrase se vuelve a montar entero en su idioma
                if t.startswith('</p'):
                    out.append(self.frase())
                    out.append(t)
                    en_frase = False
                elif re.match(r'<p\b', t):
                    out.append(t)
                continue
            if t.startswith('<!--'):
                out.append(t)
            elif t.startswith('<script'):
                out.append(self.script(t))
            elif t.startswith('<style'):
                out.append(self.estilo(t))
            elif t.startswith('</'):
                nombre = re.match(r'</([a-zA-Z][^\s>]*)', t).group(1).lower()
                for i in range(len(pila) - 1, -1, -1):
                    if pila[i][0] == nombre:
                        del pila[i:]
                        break
                out.append(t)
            elif t.startswith('<'):
                nombre = re.match(r'<([a-zA-Z][^\s>/]*)', t).group(1).lower()
                a = atributos(t)
                salta = nombre in SALTA_ETIQUETAS or 'data-live' in a or a.get('id') in SALTA_IDS or bool(pila and pila[-1][1])
                if not (nombre in VACIAS or t.endswith('/>')):
                    pila.append((nombre, salta))
                out.append(self.etiqueta(t, nombre))
                if a.get('id') == 'phrase':
                    en_frase = True
            else:
                if pila and pila[-1][0] == 'span' and out and 'id="idi-c"' in out[-1]:
                    out.append(self.l.upper())
                elif pila and pila[-1][1]:
                    out.append(t)
                else:
                    out.append(self.texto(t))
        return ''.join(out)


def pon_meta(head, attr, nombre, valor):
    """Cambia una <meta> de la cabecera; si index.html no la lleva, la pone tras el <title> (y lo dice)."""
    pat = re.compile(r'<meta %s="%s" content="[^"]*">' % (attr, re.escape(nombre)))
    linea = '<meta %s="%s" content="%s">' % (attr, nombre, esc_attr(valor))
    nuevo, k = pat.subn(linea, head)
    if k > 1:
        raise SystemExit('meta %s: aparece %d veces en index.html' % (nombre, k))
    if k == 0:
        print('   aviso: index.html no lleva <meta %s="%s">: se añade tras el <title>' % (attr, nombre))
        i = head.index('</title>') + len('</title>')
        nuevo = head[:i] + '\n' + linea + head[i:]
    return nuevo


def main():
    s = open(os.path.join(RAIZ, FUENTE), encoding='utf-8').read()
    a = s.index('const I={')
    I = json.loads(s[a + 8:s.index('\n', a)].rstrip(';'))
    csp = carga_csp()
    for l in ('en', 'pt'):
        p = Portada(s, I, l, csp)
        out = p.genera()
        ruta = os.path.join(RAIZ, PAGINAS[l]['ruta'])
        antes = open(ruta, encoding='utf-8').read() if os.path.exists(ruta) else None
        estado = 'igual' if antes == out else ('nueva' if antes is None else 'cambiada')
        if estado != 'igual' and not SOLO_VER:
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            open(ruta, 'w', encoding='utf-8').write(out)
        print('%s: %s (%d KB) · enlaces cambiados: %d · textos sin traducción: %d' % (PAGINAS[l]['ruta'], estado, len(out.encode('utf-8')) // 1024, len(p.enlaces), len(p.sin)))
        for k in p.sin:
            print('   sin traducción (se queda en español): «%s»' % (k[:110] + ('…' if len(k) > 110 else '')))
        for v in p.avisos:
            print('   aviso: ' + v)


if __name__ == '__main__':
    main()
