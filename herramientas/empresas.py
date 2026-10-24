#!/usr/bin/env python3
"""Company cards with their headquarters (owner, 24 Oct 2026, 14:42: «Cuando detectamos en Radiografías o en ZERO o en
Órbita, en cualquier sitio, una empresa de datos o de subastas, de telemetrías… incorporemos la foto de la empresa, si es
que está por el edificio, que pongamos dónde está la dirección de la sede principal o todo lo que se pueda saber. Para que
la persona que decida imprimir el PDF tenga el máximo de información»).

Which companies: the ones in orbita/datos/espejo.json (each with its domains and the country of its headquarters, already
checked by two voices) and the ones with a card in empresas/ (name, «Sede» and website).

    python3 herramientas/empresas.py          # buscar: orbita/datos/empresas-candidatas.json, and contact sheets in hojas/
    python3 herramientas/empresas.py copiar   # the reviewed ones: orbita/datos/empresas.json and orbita/static/fotos/empresa-*.jpg

buscar writes down, for each company, only what a source states, and which source («voz») said it:
- Wikidata (CC0). An item is the company only when its official website (P856) is one of the company's domains, or when it
  is a business with exactly that name in that country (or the item named in FORZADAS). From it: headquarters (P159) with
  its street address (P6375 or P969, also as qualifiers of P159), postcode and coordinates; official name (P1448), founded
  (P571), parent (P749), industry (P452), employees (P1128), website (P856), stock exchange and ticker (P414, P249).
- Official registers, when Wikidata gives the company's number there: the SEC's EDGAR (P5531: the «business address» the
  company itself files) and France's SIRENE (P1616: its «siège»); and California's register of data brokers (CPPA,
  registry.csv: the address the broker itself declared), matched by its website.
- OpenStreetMap (ODbL): an office or building with the company's name next to its headquarters, with its address.
- Photos: the item's image (P18), the image of its headquarters building (when P159 is a building, or a building whose
  occupant, P466, is the company) and the Wikimedia Commons files whose name or category says they show its
  headquarters, offices or building. Only free licences (CC0, CC BY, CC BY-SA, public domain), never logos, maps or
  drawings; with author, licence and, when the photo has it, its own GPS position and its distance to the headquarters.
  They are candidates: each photo is looked at before the site shows it (the real building, without people), with the
  contact sheets left in hojas/ (the workflow uploads them as an artifact; they are never published).
An address is suggested when an official register gives it, or when two voices agree on it (same number and street).

copiar reads the review (herramientas/agencia-rondas/empresas/revision-*.json), copies each chosen photo as a JPEG of
640 px at most to orbita/static/fotos/ (never hot-linked: no visit tells Wikimedia anything) and writes
orbita/datos/empresas.json. Runs in .github/workflows/empresas.yml, because the console here cannot reach these sites."""
import csv
import glob
import html
import io
import json
import math
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

UA = 'GUARDIANA-Orbita/1.0 (https://guardianagroup.com; fichas de empresas de datos)'
UA_SEC = 'GUARDIANA guardianagroup.com datos@guardianagroup.com'  # EDGAR asks for a name and a contact in the User-Agent
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATOS = os.path.join(RAIZ, 'orbita', 'datos')
FOTOS = os.path.join(RAIZ, 'orbita', 'static', 'fotos')
REVISION = os.path.join(RAIZ, 'herramientas', 'agencia-rondas', 'empresas')
PAGINAS = os.environ.get('EMPRESAS_PAGINAS') or os.path.join(RAIZ, 'empresas')
HOJAS = os.environ.get('EMPRESAS_HOJAS') or os.path.join(RAIZ, 'hojas')
WD = 'https://www.wikidata.org/w/api.php'
COMMONS = 'https://commons.wikimedia.org/w/api.php'
LIBRES = ('cc0', 'cc by', 'cc-by', 'public domain', 'pd', 'dominio público')
NO_FOTO = re.compile(r'logo|wordmark|icon|emblem|\.svg$|\.gif$|\.pdf$|\.tiff?$|\.webm$|\.og[gv]$|banner|screenshot|captura|'
                     r'\bmaps?\b|mapa|diagram|chart|graph|interface|sticker|badge|font|poster|cartel', re.I)
SEDE = re.compile(r'headquarter|head ?office|\bhq\b|si[eè]ge|hauptsitz|zentrale|\bsede\b|hoofdkantoor|kantoor|\boffices?\b|'
                  r'\bbureaux?\b|building|campus|\btower\b|\btorre\b|edificio|geb[aä]ude|\btour\b', re.I)
EDIFICIO = re.compile(r'building|campus|skyscraper|tower|headquarters|office|complex|structure|high-rise|business park|edifice', re.I)
# Wikidata classes of businesses (the item is a company, not a product or a person with the same name)
EMPRESA = {'Q4830453', 'Q783794', 'Q891723', 'Q6881511', 'Q1058914', 'Q161726', 'Q658255', 'Q18388277', 'Q167037',
           'Q219577', 'Q1331793', 'Q1589009', 'Q2085381', 'Q155076', 'Q3152824', 'Q1137109', 'Q43229'}
# a company whose Wikidata item the name and website do not find (checked by hand, with the reason)
FORZADAS = {}
# the same company under two names (empresas/ page → espejo.json)
MISMA = {'X': 'X Corp.'}
PAISES_ES = {'estados unidos': 'US', 'china': 'CN', 'polonia': 'PL', 'india': 'IN', 'noruega': 'NO', 'chequia': 'CZ',
             'canadá': 'CA', 'canada': 'CA', 'rusia': 'RU', 'israel': 'IL', 'reino unido': 'GB', 'francia': 'FR',
             'dinamarca': 'DK', 'alemania': 'DE', 'españa': 'ES', 'países bajos': 'NL', 'irlanda': 'IE', 'japón': 'JP',
             'singapur': 'SG', 'suecia': 'SE', 'italia': 'IT', 'bélgica': 'BE', 'portugal': 'PT', 'austria': 'AT',
             'suiza': 'CH', 'colombia': 'CO', 'eslovenia': 'SI', 'luxemburgo': 'LU', 'corea del sur': 'KR'}
GENERICAS = {'street', 'strasse', 'avenue', 'road', 'calle', 'carrera', 'viale', 'boulevard', 'blvd', 'suite', 'floor',
             'floors', 'level', 'place', 'plaza', 'drive', 'lane', 'north', 'south', 'east', 'west', 'unit', 'building',
             'tower', 'court', 'square', 'parkway', 'highway', 'route', 'avenida', 'paseo', 'piso', 'planta', 'etage',
             'stock', 'straat', 'gasse', 'platz', 'allee', 'chemin', 'quai', 'cours', 'impasse', 'united', 'states',
             'america', 'kingdom', 'france', 'germany', 'spain', 'inc', 'llc', 'ltd', 'corp', 'the', 'and', 'des', 'del',
             'los', 'las', 'les', 'der', 'die', 'das', 'cedex', 'county', 'city', 'state', 'district', 'province'}


def pide(url, datos=None, intentos=4, ua=UA, crudo=False, espera=120):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, data=datos, headers={'User-Agent': ua, 'Accept': '*/*' if crudo else 'application/json'})
            with urllib.request.urlopen(req, timeout=espera) as r:
                b = r.read()
                return b if crudo else json.loads(b)
        except urllib.error.HTTPError as e:
            if e.code in (400, 401, 403, 404, 410) or i == intentos - 1:
                raise
            time.sleep(6 * (i + 1))
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(6 * (i + 1))


def wd(params):
    return pide(WD + '?' + urllib.parse.urlencode(dict(params, format='json')))


def entidades(qs, props='claims|labels', idiomas='es|en'):
    out = {}
    qs = [q for q in dict.fromkeys(qs) if q]
    for k in range(0, len(qs), 50):
        r = wd({'action': 'wbgetentities', 'ids': '|'.join(qs[k:k + 50]), 'props': props, 'languages': idiomas})
        out.update(r.get('entities') or {})
        time.sleep(0.3)
    return out


def sparql(q):
    return pide('https://query.wikidata.org/sparql', urllib.parse.urlencode({'query': q, 'format': 'json'}).encode())['results']['bindings']


def pliega(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', s)


def km(a, b):  # (lon, lat)
    lo1, la1, lo2, la2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))


def dominio(url):
    h = (urllib.parse.urlparse(url if '//' in url else '//' + url).hostname or '').lower()
    return h[4:] if h.startswith('www.') else h


def base(h):
    p = (h or '').split('.')
    if len(p) >= 3 and p[-2] in ('co', 'com', 'org', 'net', 'gov', 'ac', 'or', 'ne') and len(p[-1]) == 2:
        return '.'.join(p[-3:])
    return '.'.join(p[-2:])


def valor(c):
    try:
        return c['mainsnak']['datavalue']['value']
    except (KeyError, TypeError):
        return None


def vigentes(cl, p):
    """the claims of p that have not ended (no P582), preferred rank first, never deprecated ones"""
    cs = [c for c in cl.get(p, []) if c.get('rank') != 'deprecated' and not (c.get('qualifiers') or {}).get('P582')]
    return sorted(cs, key=lambda c: c.get('rank') != 'preferred')


def ids(cl, p):
    return [v['id'] for v in (valor(c) for c in vigentes(cl, p)) if isinstance(v, dict) and v.get('id')]


def calif(c, p):
    for q in (c.get('qualifiers') or {}).get(p, []):
        v = (q.get('datavalue') or {}).get('value')
        if v is not None:
            return v
    return None


def etiqueta(e, idiomas=('es', 'en')):
    lab = (e or {}).get('labels') or {}
    for i in idiomas:
        if lab.get(i):
            return lab[i]['value']
    return next((v['value'] for v in lab.values()), '')


def texto(v):
    if isinstance(v, dict) and v.get('text'):
        return v['text']
    return v if isinstance(v, str) else ''


def lonlat(v):
    if isinstance(v, dict) and 'latitude' in v:
        return [round(v['longitude'], 5), round(v['latitude'], 5)]
    return None


def iso(qs, cache):
    falta = [q for q in qs if q not in cache]
    if falta:
        for q, e in entidades(falta, 'claims').items():
            cache[q] = next((valor(c) for c in (e.get('claims') or {}).get('P297', []) if isinstance(valor(c), str)), '')
    return [cache[q] for q in qs if cache.get(q)]


def empresas():
    """name → {cc, dominios, web, slug, sede_texto}: espejo.json and the cards in empresas/"""
    espejo = json.load(open(os.path.join(DATOS, 'espejo.json'), encoding='utf-8'))
    out = {n: {'cc': cc, 'dominios': set()} for n, cc in (espejo.get('empresas') or {}).items()}
    for d, v in (espejo.get('dominios') or {}).items():
        n = (v or {}).get('empresa')
        if n in out:
            out[n]['dominios'].add(base(d))
    if os.path.isdir(PAGINAS):
        for f in sorted(os.listdir(PAGINAS)):
            if not f.endswith('.html') or f == 'index.html':
                continue
            h = open(os.path.join(PAGINAS, f), encoding='utf-8').read()
            m = re.search(r'<h1>([^<]+)</h1>', h)
            if not m:
                continue
            n = html.unescape(m.group(1)).strip()
            web = re.search(r'Su web</h2><p><a href="([^"]+)"', h)
            sede = re.search(r'Sede: <b>([^<]+)</b>', h)
            dom = base(dominio(web.group(1))) if web else ''
            k = MISMA.get(n) or next((x for x in out if pliega(x) == pliega(n)), None) \
                or next((x for x in out if dom and dom in out[x]['dominios']), None)
            e = out.setdefault(k or n, {'cc': '', 'dominios': set()})
            e['slug'] = f[:-5]
            if web:
                e['web'] = web.group(1)
                e['dominios'].add(dom)
            if sede:
                e['sede_texto'] = html.unescape(sede.group(1))
                if not e['cc']:
                    pais = e['sede_texto'].rsplit(',', 1)[-1].strip().lower()
                    e['cc'] = PAISES_ES.get(pais, '')
    return out


def empareja(nombre, e, cache):
    """the Wikidata item of the company: (qid, entity, how), or (None, None, '')"""
    if nombre in FORZADAS:
        q = FORZADAS[nombre]
        return q, entidades([q], 'claims|labels|aliases|sitelinks').get(q), 'forzada'
    cands = []
    for idioma in ('en', 'es'):
        r = wd({'action': 'wbsearchentities', 'search': nombre, 'language': idioma, 'uselang': idioma, 'type': 'item', 'limit': 8})
        cands += [b['id'] for b in r.get('search') or [] if b['id'] not in cands]
    if not cands:
        return None, None, ''
    ents = entidades(cands, 'claims|labels|aliases|sitelinks', 'es|en')
    for q in cands:  # its official website is one of its domains: the strongest match
        cl = (ents.get(q) or {}).get('claims') or {}
        webs = {base(dominio(v)) for v in (valor(c) for c in cl.get('P856', [])) if isinstance(v, str)}
        if webs & e['dominios']:
            return q, ents[q], 'web'
    for q in cands:  # a business with exactly that name, in that country
        en = ents.get(q) or {}
        cl = en.get('claims') or {}
        nombres = {pliega(x['value']) for x in (en.get('labels') or {}).values()}
        nombres |= {pliega(a['value']) for al in (en.get('aliases') or {}).values() for a in al}
        if pliega(nombre) not in nombres:
            continue
        if not (set(ids(cl, 'P31')) & EMPRESA or any(p in cl for p in ('P452', 'P1128', 'P414', 'P1454'))):
            continue
        if e.get('cc'):
            paises = set(iso(ids(cl, 'P17'), cache))
            if e['cc'] not in paises:
                for h in entidades(ids(cl, 'P159')[:3], 'claims').values():
                    paises |= set(iso(ids(h.get('claims') or {}, 'P17'), cache))
            if e['cc'] not in paises:
                continue
        return q, en, 'nombre'
    return None, None, ''


def direccion_wd(c_o_item, cl_q=None):
    """street address of a P159 claim (qualifiers) or of an item's claims: (text, postcode)"""
    if cl_q is None:  # a P159 claim
        t = texto(calif(c_o_item, 'P6375')) or texto(calif(c_o_item, 'P969'))
        return t, texto(calif(c_o_item, 'P281'))
    t = next((texto(valor(c)) for c in vigentes(cl_q, 'P6375') if texto(valor(c))), '') \
        or next((texto(valor(c)) for c in vigentes(cl_q, 'P969') if texto(valor(c))), '')
    cp = next((texto(valor(c)) for c in vigentes(cl_q, 'P281') if texto(valor(c))), '')
    return t, cp


def datos_wd(q, en, cache):
    cl = en.get('claims') or {}
    d = {'wikidata': q, 'etiqueta': etiqueta(en, ('en', 'es')), 'direcciones': [], 'fotos': [], '_refs': set()}
    of = next((texto(valor(c)) for c in vigentes(cl, 'P1448') if texto(valor(c))), '')
    if of:
        d['nombre_oficial'] = of
    sl = en.get('sitelinks') or {}
    for w in ('eswiki', 'enwiki'):
        if sl.get(w):
            d['wikipedia'] = 'https://%s.wikipedia.org/wiki/%s' % (w[:2], urllib.parse.quote(sl[w]['title'].replace(' ', '_')))
            break
    sedes = [c for c in vigentes(cl, 'P159') if isinstance(valor(c), dict)]
    if sedes:
        s = sedes[0]
        d['_sede'] = valor(s)['id']
        d['_refs'].add(d['_sede'])
        t, cp = direccion_wd(s)
        if t:
            d['direcciones'].append({'voz': 'wikidata', 'texto': t, 'cp': cp})
        ll = lonlat(calif(s, 'P625'))
        if ll:
            d['lonlat'], d['precisa'] = ll, True
    t, cp = direccion_wd(None, cl)
    if t and not any(x['texto'] == t for x in d['direcciones']):
        d['direcciones'].append({'voz': 'wikidata', 'texto': t, 'cp': cp})
    ll = next((lonlat(valor(c)) for c in vigentes(cl, 'P625') if lonlat(valor(c))), None)
    if ll and 'lonlat' not in d:
        d['lonlat'], d['precisa'] = ll, True
    for c in cl.get('P571', []):
        v = valor(c)
        if isinstance(v, dict) and re.match(r'[+-]\d{4}', v.get('time', '')):
            a = int(v['time'][1:5])
            d['fundada'] = min(a, d.get('fundada', 9999))
    m = ids(cl, 'P749')
    if m:
        d['_matriz'] = m[0]; d['_refs'].add(m[0])
    s = ids(cl, 'P452')[:2]
    if s:
        d['_sector'] = s; d['_refs'].update(s)
    emp = []
    for c in cl.get('P1128', []):
        v = valor(c)
        if isinstance(v, dict) and v.get('amount'):
            t = calif(c, 'P585')
            emp.append((t.get('time', '') if isinstance(t, dict) else '', float(v['amount'])))
    if emp:
        t, n = max(emp)
        d['empleados'] = {'n': int(n)}
        if re.match(r'[+-]\d{4}', t):
            d['empleados']['anio'] = int(t[1:5])
    webs = [valor(c) for c in vigentes(cl, 'P856') if isinstance(valor(c), str)]
    if webs:
        d['web_wd'] = webs[0]
    bolsa = []
    for c in vigentes(cl, 'P414'):
        v = valor(c)
        if isinstance(v, dict) and v.get('id'):
            bolsa.append((v['id'], texto(calif(c, 'P249'))))
            d['_refs'].add(v['id'])
    if bolsa:
        d['_bolsa'] = bolsa
    for c in vigentes(cl, 'P18'):
        a = valor(c)
        if isinstance(a, str) and not NO_FOTO.search(a):
            d['fotos'].append({'archivo': a, 'origen': 'empresa (P18)'})
    cat = next((valor(c) for c in cl.get('P373', []) if isinstance(valor(c), str)), '')
    if cat:
        d['_categoria'] = cat
    for p, k in (('P5531', '_cik'), ('P1616', '_siren')):
        v = next((valor(c) for c in cl.get(p, []) if isinstance(valor(c), str)), '')
        if v:
            d[k] = v
    return d


def sedes_y_nombres(todas, cache):
    """labels, headquarters buildings and their photos, addresses and coordinates"""
    refs = sorted({r for d in todas.values() for r in d['_refs']})
    ents = entidades(refs, 'claims|labels', 'es|en')
    clases, lugares = set(), set()
    for d in todas.values():
        h = ents.get(d.get('_sede')) or {}
        clases.update(ids(h.get('claims') or {}, 'P31'))
        lugares.update(ids(h.get('claims') or {}, 'P131')[:1])
    nom_clases = {q: etiqueta(e, ('en',)) for q, e in entidades(sorted(clases), 'labels', 'en').items()}
    ents_lug = entidades(sorted(lugares), 'labels', 'es|en')
    for d in todas.values():
        if d.get('_sede'):
            h = ents.get(d['_sede']) or {}
            hc = h.get('claims') or {}
            es_edificio = any(EDIFICIO.search(nom_clases.get(c, '')) for c in ids(hc, 'P31'))
            ll = next((lonlat(valor(c)) for c in vigentes(hc, 'P625') if lonlat(valor(c))), None)
            if es_edificio:
                d['edificio'] = etiqueta(h)
                lug = ids(hc, 'P131')
                d['sede'] = etiqueta(ents_lug.get(lug[0])) if lug else ''
                t, cp = direccion_wd(None, hc)
                if t and not any(x['texto'] == t for x in d['direcciones']):
                    d['direcciones'].append({'voz': 'wikidata', 'texto': t, 'cp': cp, 'de': d['edificio']})
                if ll and not d.get('precisa'):
                    d['lonlat'], d['precisa'] = ll, True
                for c in vigentes(hc, 'P18'):
                    a = valor(c)
                    if isinstance(a, str) and not NO_FOTO.search(a):
                        d['fotos'].append({'archivo': a, 'origen': 'edificio de la sede: ' + d['edificio']})
            else:
                d['sede'] = etiqueta(h)
                if ll and 'lonlat' not in d:
                    d['lonlat'], d['precisa'] = ll, False
            d['sede_pais'] = (iso(ids(hc, 'P17'), cache) or [''])[0]
        if d.get('_matriz'):
            d['matriz'] = etiqueta(ents.get(d['_matriz']))
        if d.get('_sector'):
            d['sector'] = [x for x in (etiqueta(ents.get(s)) for s in d['_sector']) if x]
        if d.get('_bolsa'):
            d['bolsa'] = [(etiqueta(ents.get(b), ('en', 'es')) + (': ' + t if t else '')) for b, t in d['_bolsa']]


def ocupantes(todas):
    """buildings whose occupant (P466) is the company, near its headquarters"""
    por_q = {d['wikidata']: d for d in todas.values()}
    qs = sorted(por_q)
    for k in range(0, len(qs), 60):
        q = ('SELECT ?c ?b ?bLabel ?img ?coord WHERE { VALUES ?c { %s } ?b wdt:P466 ?c; wdt:P18 ?img. OPTIONAL { ?b wdt:P625 ?coord } '
             'SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". } }' % ' '.join('wd:' + x for x in qs[k:k + 60]))
        try:
            filas = sparql(q)
        except Exception as ex:
            print('ocupantes: error', ex); continue
        for f in filas:
            d = por_q.get(f['c']['value'].rsplit('/', 1)[-1])
            a = urllib.parse.unquote(f['img']['value'].rsplit('/', 1)[-1]).replace('_', ' ')
            if not d or NO_FOTO.search(a):
                continue
            m = re.match(r'Point\(([-\d.eE]+) ([-\d.eE]+)\)', (f.get('coord') or {}).get('value', ''))
            if m and d.get('lonlat') and km(d['lonlat'], (float(m.group(1)), float(m.group(2)))) > 40:
                continue  # one of its buildings, but not at its headquarters
            d['fotos'].append({'archivo': a, 'origen': 'edificio que ocupa: ' + f.get('bLabel', {}).get('value', '')})
        time.sleep(1)


def sin_sufijo(n):
    return re.sub(r'[,.]?\s+(inc\.?|llc|l\.l\.c\.|ltd\.?|limited|s\.a\.?|s\.a\.s\.?|se|ag|gmbh|plc|corporation|corp\.?|company|co\.|'
                  r'n\.v\.|b\.v\.|s\.l\.|s\.p\.a\.|a/s|ab|oy|as|holdings?|group)$', '', n.strip(), flags=re.I).strip()


def commons(todas):
    """Wikimedia Commons files whose name, or whose category, says they show the company's headquarters or offices"""
    for n, d in todas.items():
        vistos = {f['archivo'] for f in d['fotos']}
        nombres = {x for x in (sin_sufijo(n), sin_sufijo(d.get('etiqueta', ''))) if len(pliega(x)) >= 3}
        for nom in sorted(nombres, key=len, reverse=True)[:1]:
            corto = len(pliega(nom)) < 5
            for s in ('intitle:"%s" headquarters' % nom, 'intitle:"%s" office' % nom, 'intitle:"%s" building' % nom,
                      'intitle:"%s" campus' % nom):
                try:
                    r = pide(COMMONS + '?' + urllib.parse.urlencode({'action': 'query', 'list': 'search', 'srsearch': s,
                                                                     'srnamespace': 6, 'srlimit': 20, 'format': 'json'}))
                except Exception as ex:
                    print('commons: error', n, ex); continue
                for x in (r.get('query') or {}).get('search') or []:
                    t = x['title'][5:]
                    pt = pliega(t)
                    if t in vistos or NO_FOTO.search(t) or not SEDE.search(t):
                        continue
                    if corto and not re.search(r'(^|[^a-z])' + re.escape(nom.lower()) + r'([^a-z]|$)', t.lower()):
                        continue
                    if pliega(nom) not in pt:
                        continue
                    vistos.add(t)
                    d['fotos'].append({'archivo': t, 'origen': 'Commons: nombre del archivo'})
                time.sleep(0.4)
        # photos taken right at its address (geotagged files within 150 m) whose name says the company or the street
        ll = d.get('lonlat_dir') or (d['lonlat'] if d.get('precisa') else None)
        if ll:
            calle = {w for w in re.findall(r'[a-z]{5,}', pliega_espacios((d.get('direccion_sugerida') or {}).get('texto', '')))} - GENERICAS
            calle -= set(re.findall(r'[a-z]{4,}', pliega_espacios(d.get('sede', ''))))
            try:
                r = pide(COMMONS + '?' + urllib.parse.urlencode({'action': 'query', 'list': 'geosearch', 'gscoord': '%f|%f' % (ll[1], ll[0]),
                                                                 'gsradius': 150, 'gsnamespace': 6, 'gslimit': 50, 'format': 'json'}))
            except Exception as ex:
                print('geosearch: error', n, ex); r = {}
            for x in (r.get('query') or {}).get('geosearch') or []:
                a = x['title'][5:]
                fa = pliega_espacios(a)
                if a in vistos or NO_FOTO.search(a):
                    continue
                if any(pliega(nom) in pliega(a) for nom in nombres if len(pliega(nom)) >= 5) or any(w in fa for w in calle):
                    vistos.add(a)
                    d['fotos'].append({'archivo': a, 'origen': 'Commons: a %d m de la dirección' % round(x.get('dist', 0))})
            time.sleep(0.4)
        cat = d.get('_categoria')
        if not cat:
            continue
        try:
            r = pide(COMMONS + '?' + urllib.parse.urlencode({'action': 'query', 'list': 'categorymembers', 'cmtitle': 'Category:' + cat,
                                                             'cmtype': 'file|subcat', 'cmlimit': 200, 'format': 'json'}))
        except Exception as ex:
            print('categoría: error', n, ex); continue
        for x in (r.get('query') or {}).get('categorymembers') or []:
            t = x['title']
            if t.startswith('File:'):
                a = t[5:]
                if a not in vistos and not NO_FOTO.search(a) and SEDE.search(a):
                    vistos.add(a); d['fotos'].append({'archivo': a, 'origen': 'Commons: categoría ' + cat})
            elif t.startswith('Category:') and SEDE.search(t[9:]):
                try:
                    s = pide(COMMONS + '?' + urllib.parse.urlencode({'action': 'query', 'list': 'categorymembers', 'cmtitle': t,
                                                                     'cmtype': 'file', 'cmlimit': 12, 'format': 'json'}))
                except Exception:
                    continue
                for y in (s.get('query') or {}).get('categorymembers') or []:
                    a = y['title'][5:]
                    if a not in vistos and not NO_FOTO.search(a):
                        vistos.add(a); d['fotos'].append({'archivo': a, 'origen': 'Commons: ' + t})
                time.sleep(0.4)
        time.sleep(0.4)


def licencias(todas):
    """author, licence, size and GPS of every photo; only free licences stay"""
    titulos = sorted({'File:' + f['archivo'] for d in todas.values() for f in d['fotos']})
    meta = {}
    for k in range(0, len(titulos), 50):
        try:
            r = pide(COMMONS + '?' + urllib.parse.urlencode({'action': 'query', 'titles': '|'.join(titulos[k:k + 50]), 'prop': 'imageinfo',
                                                             'iiprop': 'url|size|extmetadata', 'iiurlwidth': 640, 'format': 'json'}))
        except Exception as ex:
            print('licencias: error', ex); continue
        q = r.get('query') or {}
        normal = {x['to']: x['from'] for x in q.get('normalized') or []}
        for pg in (q.get('pages') or {}).values():
            ii = (pg.get('imageinfo') or [{}])[0]
            em = ii.get('extmetadata') or {}
            v = lambda c: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', html.unescape((em.get(c) or {}).get('value', '') or ''))).strip()
            m = {'autor': re.sub(r'^(Creator|User|Usuario):', '', v('Artist')).strip()[:120], 'licencia': v('LicenseShortName'),
                 'url_licencia': v('LicenseUrl'), 'miniatura': ii.get('thumburl', ''), 'pagina': ii.get('descriptionurl', ''),
                 'ancho': ii.get('width'), 'alto': ii.get('height'), 'descripcion': v('ImageDescription')[:240],
                 'fecha': v('DateTimeOriginal')[:10]}
            try:
                m['gps'] = [round(float(v('GPSLongitude')), 5), round(float(v('GPSLatitude')), 5)]
            except ValueError:
                pass
            t = pg.get('title', '')
            meta[t[5:]] = m
            if t in normal:
                meta[normal[t][5:]] = m
        time.sleep(1)
    for d in todas.values():
        buenas = []
        for f in d['fotos']:
            m = meta.get(f['archivo'])
            if not m or not m['licencia'] or not m['miniatura'] or not m['licencia'].lower().startswith(LIBRES):
                continue
            if (m.get('ancho') or 0) < 400:
                continue  # too small to be a photo of the building
            f.update(m)
            if f.get('gps') and d.get('lonlat'):
                f['km_sede'] = round(km(f['gps'], d['lonlat']), 2)
            buenas.append(f)
        d['fotos'] = buenas[:8]


def sec(d):
    try:
        j = pide('https://data.sec.gov/submissions/CIK%010d.json' % int(re.sub(r'\D', '', d['_cik'])), ua=UA_SEC)
    except Exception as ex:
        print('SEC: error', d.get('etiqueta'), ex); return
    b = (j.get('addresses') or {}).get('business') or {}
    calle = ', '.join(x for x in (b.get('street1'), b.get('street2')) if x)
    if not calle:
        return
    lugar = ' '.join(x for x in (b.get('city'), b.get('stateOrCountry') if not b.get('stateOrCountryDescription') else b.get('stateOrCountryDescription'), b.get('zipCode')) if x)
    d['direcciones'].append({'voz': 'sec', 'oficial': True, 'texto': calle + ', ' + lugar, 'cp': b.get('zipCode') or '', 'quien': j.get('name', ''),
                             'fuente': 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=%s' % re.sub(r'\D', '', d['_cik'])})


def sirene(d):
    siren = re.sub(r'\D', '', d['_siren'])
    try:
        j = pide('https://recherche-entreprises.api.gouv.fr/search?' + urllib.parse.urlencode({'q': siren, 'per_page': 1}))
    except Exception as ex:
        print('SIRENE: error', d.get('etiqueta'), ex); return
    r = next((x for x in j.get('results') or [] if x.get('siren') == siren), None)
    s = (r or {}).get('siege') or {}
    if not s.get('adresse'):
        return
    x = {'voz': 'sirene', 'oficial': True, 'texto': s['adresse'], 'cp': s.get('code_postal') or '', 'quien': r.get('nom_complet', ''),
         'fuente': 'https://annuaire-entreprises.data.gouv.fr/entreprise/' + siren}
    try:
        x['lonlat'] = [round(float(s['longitude']), 5), round(float(s['latitude']), 5)]
    except (KeyError, TypeError, ValueError):
        pass
    d['direcciones'].append(x)


def cppa():
    """California's register of data brokers: base domain or folded name → (name, address)"""
    try:
        b = pide('https://cppa.ca.gov/data_broker_registry/registry.csv', crudo=True)
    except Exception as ex:
        print('CPPA: error', ex); return {}
    filas = list(csv.reader(io.StringIO(b.decode('utf-8-sig', 'replace'))))
    if not filas:
        return {}
    cab = [h.strip().lower() for h in filas[0]]

    def col(*pal, sin=('email', 'e-mail', 'web', 'url', 'site', 'phone')):
        return next((i for i, h in enumerate(cab) if any(p in h for p in pal) and not any(s in h for s in sin)), None)
    i_calle = col('street', 'address')
    i_ciudad, i_estado, i_cp, i_pais = col('city'), col('state', sin=('statement', 'email', 'web')), col('zip', 'postal'), col('country')
    print('CPPA: columnas', {'calle': i_calle, 'ciudad': i_ciudad, 'estado': i_estado, 'cp': i_cp, 'pais': i_pais})
    out = {}
    for f in filas[1:]:
        g = lambda i: (f[i].strip() if i is not None and i < len(f) else '')
        if not g(0):
            continue
        partes = [g(i_calle), g(i_ciudad), ' '.join(x for x in (g(i_estado), g(i_cp)) if x), g(i_pais)]
        t = ', '.join(x for x in partes if x)
        if not g(i_calle):
            continue
        x = {'voz': 'cppa', 'oficial': True, 'texto': t, 'cp': g(i_cp), 'quien': g(0), 'fuente': 'https://cppa.ca.gov/data_broker_registry/'}
        for k in (base(dominio(g(2))) if g(2) else '', pliega(g(0)), pliega(g(1))):
            if k and k not in out:
                out[k] = x
    print('CPPA:', len(filas) - 1, 'inscripciones')
    return out


def osm(n, d):
    """an office or building with the company's name next to its headquarters, with its address (OpenStreetMap, ODbL)"""
    if not d.get('lonlat'):
        return
    nom = sin_sufijo(d.get('etiqueta') or n)
    if len(pliega(nom)) < 3:
        return
    # a backslash for the regex, written twice for the Overpass string («Media.net» → "^Media\\.net")
    rx = '^' + re.sub(r'([\\.^$|()\[\]{}*+?])', r'\\\\\1', nom).replace('"', '') + '([ ,.-]|$)'
    r = 1500 if d.get('precisa') else 20000
    lo, la = d['lonlat']
    q = ('[out:json][timeout:45];(nwr["name"~"%s",i]["office"](around:%d,%f,%f);nwr["name"~"%s",i]["building"](around:%d,%f,%f););'
         'out tags center 12;' % (rx, r, la, lo, rx, r, la, lo))
    try:
        j = pide('https://overpass-api.de/api/interpreter', urllib.parse.urlencode({'data': q}).encode(), intentos=2, espera=60)
    except Exception as ex:
        print('OSM: error', n, ex); return
    for el in (j.get('elements') or [])[:12]:
        t = el.get('tags') or {}
        if t.get('shop') or t.get('amenity') or not (t.get('addr:street') or t.get('addr:full')):
            continue
        calle = t.get('addr:full') or ' '.join(x for x in (t.get('addr:housenumber'), t.get('addr:street')) if x)
        lugar = ' '.join(x for x in (t.get('addr:postcode'), t.get('addr:city')) if x)
        c = el.get('center') or ({'lat': el['lat'], 'lon': el['lon']} if 'lat' in el else None)
        x = {'voz': 'osm', 'texto': calle + (', ' + lugar if lugar else ''), 'cp': t.get('addr:postcode', ''), 'quien': t.get('name', ''),
             'fuente': 'https://www.openstreetmap.org/%s/%s' % (el.get('type'), el.get('id'))}
        if c:
            x['lonlat'] = [round(c['lon'], 5), round(c['lat'], 5)]
        d['direcciones'].append(x)
        if sum(1 for y in d['direcciones'] if y['voz'] == 'osm') >= 3:
            break


def piezas(t, cp, ciudad):
    f = unicodedata.normalize('NFKD', (t or '').lower()).encode('ascii', 'ignore').decode()
    f = re.sub(r'\bone\b', '1', f)
    nums = set(re.findall(r'\b\d+[a-z]?\b', f)) - {re.sub(r'\D', '', cp or '')} - {cp or ''}
    pal = set(re.findall(r'[a-z]{4,}', f)) - GENERICAS - set(re.findall(r'[a-z]{4,}', pliega_espacios(ciudad)))
    return nums, pal


def pliega_espacios(s):
    return unicodedata.normalize('NFKD', (s or '').lower()).encode('ascii', 'ignore').decode()


def acuerdan(a, b, ciudad):
    na, pa = piezas(a['texto'], a.get('cp'), ciudad)
    nb, pb = piezas(b['texto'], b.get('cp'), ciudad)
    return bool(na & nb) and bool(pa & pb)


def sugiere(d):
    """the address to show: an official register's, or one two voices agree on; with the voices that confirm it"""
    dirs = d['direcciones']
    for a in sorted(dirs, key=lambda x: ('sec', 'sirene', 'cppa', 'wikidata', 'osm').index(x['voz'])):
        otras = [b['voz'] for b in dirs if b is not a and b['voz'] != a['voz'] and acuerdan(a, b, d.get('sede', ''))]
        if a.get('oficial') or otras:
            return {'texto': a['texto'], 'voces': [a['voz']] + sorted(set(otras)), 'oficial': bool(a.get('oficial')), 'fuente': a.get('fuente', '')}
    return None


def hojas(todas):
    """contact sheets to look at every candidate photo (numbered as in empresas-candidatas.json)"""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print('sin Pillow: no hay hojas'); return
    os.makedirs(HOJAS, exist_ok=True)
    try:
        letra = ImageFont.truetype('DejaVuSans.ttf', 13)
    except OSError:
        letra = ImageFont.load_default()
    fotos = [(n, f) for n, d in sorted(todas.items()) for f in d['fotos']]
    W, H, PIE, COLS, FILAS = 320, 240, 40, 4, 3
    for k in range(0, len(fotos), COLS * FILAS):
        hoja = Image.new('RGB', (COLS * W, FILAS * (H + PIE)), (16, 18, 22))
        dib = ImageDraw.Draw(hoja)
        for i, (n, f) in enumerate(fotos[k:k + COLS * FILAS]):
            x, y = (i % COLS) * W, (i // COLS) * (H + PIE)
            try:
                im = Image.open(io.BytesIO(pide(f['miniatura'], crudo=True))).convert('RGB')
                im.thumbnail((W - 6, H - 6))
                hoja.paste(im, (x + (W - im.width) // 2, y + (H - im.height) // 2))
            except Exception as ex:
                dib.text((x + 8, y + 8), 'sin imagen: %s' % ex, fill=(220, 120, 110), font=letra)
            dib.text((x + 6, y + H + 3), ('#%d %s' % (f['n'], n))[:44], fill=(232, 236, 241), font=letra)
            extra = f['origen'][:30] + (' · %.1f km' % f['km_sede'] if 'km_sede' in f else '')
            dib.text((x + 6, y + H + 20), extra[:46], fill=(169, 179, 190), font=letra)
            time.sleep(0.2)
        hoja.save(os.path.join(HOJAS, 'hoja-%02d.jpg' % (k // (COLS * FILAS) + 1)), 'JPEG', quality=80)
    print('hojas:', math.ceil(len(fotos) / (COLS * FILAS)))


def buscar():
    lista = empresas()
    print('empresas:', len(lista))
    cache, todas, sin = {}, {}, []
    for n, e in sorted(lista.items()):
        try:
            q, en, como = empareja(n, e, cache)
        except Exception as ex:
            print('error con', n, ex); q = None
        if not q:
            sin.append(n); continue
        d = datos_wd(q, en, cache)
        d.update({'nombre': n, 'cc': e.get('cc', ''), 'emparejada': como})
        for k in ('slug', 'web', 'sede_texto'):
            if e.get(k):
                d[k] = e[k]
        d['_dominios'] = e['dominios']
        todas[n] = d
        time.sleep(0.3)
    print('emparejadas', len(todas), 'de', len(lista), '· sin emparejar:', ', '.join(sin))
    sedes_y_nombres(todas, cache)
    ocupantes(todas)
    reg = cppa()
    for n, d in todas.items():
        if d.get('_cik'):
            sec(d); time.sleep(0.3)
        if d.get('_siren'):
            sirene(d); time.sleep(0.3)
        x = next((reg[k] for k in sorted(d['_dominios']) + [pliega(n), pliega(d.get('etiqueta', ''))] if k and k in reg), None)
        if x:
            d['direcciones'].append(dict(x))
        osm(n, d)
        time.sleep(1.2)
        d['direccion_sugerida'] = s = sugiere(d)
        if s:  # where that address is, when one of the voices that give it says so
            ll = next((x['lonlat'] for x in d['direcciones'] if x.get('lonlat') and x['voz'] in s['voces'] and
                       (x['texto'] == s['texto'] or acuerdan(x, s, d.get('sede', '')))), None)
            if ll:
                d['lonlat_dir'] = ll
    commons(todas)
    licencias(todas)
    k = 0
    for n in sorted(todas):
        for f in todas[n]['fotos']:
            k += 1
            f['n'] = k
    hojas(todas)
    for d in todas.values():
        for x in [c for c in d if c.startswith('_')]:
            d.pop(x)
    json.dump({'nota': 'Fichas de empresas (dueño, 24 Oct 2026): candidatas sin revisar. Cada dato lleva la voz que lo dice '
                       '(Wikidata, SEC, SIRENE, registro de corredores de California, OpenStreetMap). Las fotos se revisan una a una '
                       'con las hojas de contacto antes de mostrarse; la web solo usa orbita/datos/empresas.json.',
               'generado': time.strftime('%Y-%m-%dT%H:%MZ', time.gmtime()), 'sin_emparejar': sin, 'empresas': todas},
              open(os.path.join(DATOS, 'empresas-candidatas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('con dirección sugerida:', sum(1 for d in todas.values() if d.get('direccion_sugerida')),
          '· con foto candidata:', sum(1 for d in todas.values() if d['fotos']), '· fotos:', k)


def copiar():
    """the review (herramientas/agencia-rondas/empresas/revision-*.json) → orbita/datos/empresas.json and the photos"""
    from PIL import Image
    cand = json.load(open(os.path.join(DATOS, 'empresas-candidatas.json'), encoding='utf-8'))['empresas']
    rev = {}
    for r in sorted(glob.glob(os.path.join(REVISION, 'revision-*.json'))):
        rev.update(json.load(open(r, encoding='utf-8')).get('empresas') or {})
    os.makedirs(FOTOS, exist_ok=True)
    out = {}
    for n, r in sorted(rev.items()):
        c = cand.get(n)
        if not c:
            print('sin candidata:', n); continue
        e = {k: c[k] for k in ('cc', 'slug', 'web', 'wikidata', 'wikipedia', 'nombre_oficial', 'sede', 'sede_pais', 'edificio',
                               'fundada', 'matriz', 'sector', 'empleados', 'bolsa') if c.get(k)}
        if not e.get('web') and c.get('web_wd'):
            e['web'] = c['web_wd']
        d = r.get('direccion')
        if d:
            e['direccion'] = {k: d[k] for k in ('texto', 'voces', 'fuente', 'oficial') if d.get(k)}
        ll = r.get('lonlat') or c.get('lonlat_dir') or c.get('lonlat')
        if ll:
            e['lonlat'] = ll
        a = r.get('foto')
        f = next((x for x in c.get('fotos') or [] if x['archivo'] == a), None) if a else None
        if f:
            clave = 'empresa-' + (pliega(n) or 'x')
            try:
                im = Image.open(io.BytesIO(pide(f['miniatura'], crudo=True))).convert('RGB')
                if im.width > 640:
                    im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
                im.save(os.path.join(FOTOS, clave + '.jpg'), 'JPEG', quality=82, optimize=True, progressive=True)
                e['foto'] = {'archivo': clave + '.jpg', 'ancho': im.width, 'alto': im.height, 'autor': f.get('autor', ''),
                             'licencia': f.get('licencia', ''), 'url_licencia': f.get('url_licencia', ''), 'pagina': f.get('pagina', ''),
                             'que': r.get('que_foto') or f.get('origen', '')}
            except Exception as ex:
                print('no se pudo bajar la foto de', n, ex)
            time.sleep(1)
        out[n] = e
    json.dump({'nota': 'Fichas de empresas (dueño, 24 Oct 2026): sede, dirección y foto del edificio, revisadas una a una '
                       '(herramientas/agencia-rondas/empresas/). La dirección sale de un registro oficial o la confirman dos voces; '
                       'las fotos son copias en guardianagroup.com de Wikimedia Commons con licencia libre, con su crédito.',
               'generado': time.strftime('%Y-%m-%dT%H:%MZ', time.gmtime()), 'empresas': out},
              open(os.path.join(DATOS, 'empresas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('fichas', len(out), '· con foto', sum(1 for e in out.values() if e.get('foto')), '· con dirección', sum(1 for e in out.values() if e.get('direccion')))


if __name__ == '__main__':
    copiar() if 'copiar' in sys.argv[1:] else buscar()
