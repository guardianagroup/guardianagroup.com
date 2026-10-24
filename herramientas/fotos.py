#!/usr/bin/env python3
"""Candidate photos for Órbita's cards (owner, 24 Oct 2026, 12:53 and 14:06: «cuando toquemos centro de datos… que aparezca
una foto, si es que la hay… los cables, en los satélites también… todo lo que se pueda»).

Only Wikimedia Commons files with a free licence (CC0, CC BY, CC BY-SA or public domain), each with its author and licence:
- satellites: by their NORAD number (Wikidata P377), an exact match;
- data centres: the Wikidata items already linked to the map's buildings (puntos.json, «wikidata.edificios»);
- polar bases and ground stations: by name, accepted only when the Wikidata item lies less than 60 km from the base;
- submarine cables: Wikidata's submarine communications cables whose name (or an alias) is the map's name.

Writes orbita/datos/fotos-candidatas.json. The site does not show them yet: the card design waits for the owner's approval,
and the chosen thumbnails will be copied to guardianagroup.com (never hot-linked, so no visit tells a third party).
Runs in .github/workflows/fotos.yml, because the console here cannot reach Wikidata or Commons."""
import json
import math
import os
import re
import time
import unicodedata
import urllib.parse
import urllib.request

UA = 'GUARDIANA-Orbita/1.0 (https://guardianagroup.com; fotos de las fichas del mapa)'
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATOS = os.path.join(RAIZ, 'orbita', 'datos')
LIBRES = ('cc0', 'cc by', 'cc-by', 'public domain', 'pd', 'dominio público')


def pide(url, datos=None, intentos=4):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, data=datos, headers={'User-Agent': UA, 'Accept': 'application/json'})
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(6 * (i + 1))


def sparql(q):
    return pide('https://query.wikidata.org/sparql', urllib.parse.urlencode({'query': q, 'format': 'json'}).encode())['results']['bindings']


def pliega(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', s)


def qid(url):
    return url.rsplit('/', 1)[-1]


def archivo(url):  # P18 comes as …/Special:FilePath/<name>
    return urllib.parse.unquote(url.rsplit('/', 1)[-1]).replace('_', ' ')


def km(a, b):  # (lat, lon)
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))


def satelites():
    s = json.load(open(os.path.join(DATOS, 'satelites.json'), encoding='utf-8'))
    c = s['campos']
    i_n, i_nom = c.index('norad'), c.index('nombre')
    nuestros = {}
    for x in s['sat']:
        try:
            nuestros[int(x[i_n])] = x[i_nom]
        except (TypeError, ValueError):
            pass
    out = {}
    for f in sparql('SELECT ?s ?norad ?img WHERE { ?s wdt:P377 ?norad; wdt:P18 ?img. }'):
        try:
            n = int(f['norad']['value'])
        except ValueError:
            continue
        if n in nuestros and n not in out:
            out[n] = {'tipo': 'satelite', 'id': n, 'nombre': nuestros[n], 'wikidata': qid(f['s']['value']), 'archivo': archivo(f['img']['value'])}
    return list(out.values())


def centros():
    p = json.load(open(os.path.join(DATOS, 'puntos.json'), encoding='utf-8'))
    qs = sorted(((p.get('wikidata') or {}).get('edificios') or {}).keys())
    out, vistos = [], set()
    for k in range(0, len(qs), 150):
        vals = ' '.join('wd:' + q for q in qs[k:k + 150])
        q = 'SELECT ?q ?qLabel ?img WHERE { VALUES ?q { %s } ?q wdt:P18 ?img. SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". } }' % vals
        for f in sparql(q):
            i = qid(f['q']['value'])
            if i in vistos:
                continue
            vistos.add(i)
            out.append({'tipo': 'centro', 'id': i, 'nombre': f.get('qLabel', {}).get('value', ''), 'wikidata': i, 'archivo': archivo(f['img']['value'])})
        time.sleep(1)
    return out


def estaciones():
    todas = json.load(open(os.path.join(DATOS, 'puntos-extra.json'), encoding='utf-8'))['puntos']
    out = []
    for x in [e for e in todas if e.get('tipo') == 'estacion']:
        nom = x['nombre'].split(' (')[0].split(' / ')[0]
        r = pide('https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode({'action': 'wbsearchentities', 'search': nom, 'language': 'en', 'limit': 7, 'format': 'json'}))
        ids = [s['id'] for s in r.get('search', [])]
        if ids:
            q = 'SELECT ?q ?img ?c WHERE { VALUES ?q { %s } ?q wdt:P18 ?img; wdt:P625 ?c. }' % ' '.join('wd:' + i for i in ids)
            for f in sparql(q):
                m = re.match(r'Point\(([-\d.eE]+) ([-\d.eE]+)\)', f['c']['value'])
                if m and km((x['lat'], x['lon']), (float(m.group(2)), float(m.group(1)))) <= 60:
                    out.append({'tipo': 'estacion', 'id': x['nombre'], 'nombre': x['nombre'], 'wikidata': qid(f['q']['value']), 'archivo': archivo(f['img']['value'])})
                    break
        time.sleep(1)
    return out


def cables():
    L = json.load(open(os.path.join(DATOS, 'lugares-capas.json'), encoding='utf-8'))
    nombres = {}
    for g in L.get('grupos') or []:
        if g and isinstance(g[0], str):
            nombres.setdefault(pliega(g[0]), g[0])
    q = ('SELECT ?c ?cLabel ?alt ?img WHERE { ?cls rdfs:label "submarine communications cable"@en. ?c wdt:P31 ?cls; wdt:P18 ?img. '
         'OPTIONAL { ?c skos:altLabel ?alt. FILTER(LANG(?alt) = "en") } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }')
    out = {}
    for f in sparql(q):
        for etiqueta in (f.get('cLabel', {}).get('value'), f.get('alt', {}).get('value')):
            k = pliega(etiqueta)
            if k and k in nombres and k not in out:
                out[k] = {'tipo': 'cable', 'id': nombres[k], 'nombre': nombres[k], 'wikidata': qid(f['c']['value']), 'archivo': archivo(f['img']['value'])}
    return list(out.values())


def licencias(fotos):
    titulos = sorted({'File:' + f['archivo'] for f in fotos})
    meta = {}
    for k in range(0, len(titulos), 50):
        r = pide('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({
            'action': 'query', 'titles': '|'.join(titulos[k:k + 50]), 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 640, 'format': 'json'}))
        q = r.get('query') or {}
        normal = {n['to']: n['from'] for n in q.get('normalized') or []}
        for pg in (q.get('pages') or {}).values():
            ii = (pg.get('imageinfo') or [{}])[0]
            em = ii.get('extmetadata') or {}
            v = lambda c: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', (em.get(c) or {}).get('value', ''))).strip()
            datos = {'autor': v('Artist'), 'licencia': v('LicenseShortName'), 'url_licencia': v('LicenseUrl'), 'miniatura': ii.get('thumburl', ''), 'pagina': ii.get('descriptionurl', '')}
            t = pg.get('title', '')
            meta[t[5:]] = datos
            if t in normal:
                meta[normal[t][5:]] = datos
        time.sleep(1)
    out = []
    for f in fotos:
        m = meta.get(f['archivo'])
        if not m or not m['licencia'] or not m['miniatura'] or not m['licencia'].lower().startswith(LIBRES):
            continue
        f.update(m)
        out.append(f)
    return out


def main():
    fotos = []
    for nombre, fn in (('satélites', satelites), ('centros de datos', centros), ('bases y estaciones', estaciones), ('cables submarinos', cables)):
        try:
            r = fn()
            print(nombre, len(r), 'con foto en Wikidata')
            fotos += r
        except Exception as e:  # one source failing must not stop the others
            print(nombre, 'error:', e)
    fotos = licencias(fotos)
    cuentas = {}
    for f in fotos:
        cuentas[f['tipo']] = cuentas.get(f['tipo'], 0) + 1
    print('con licencia libre:', cuentas)
    json.dump({
        'nota': 'Fotos candidatas para las fichas de Órbita (dueño, 24 Oct 2026). Solo Wikimedia Commons con licencia libre, con autor y licencia. '
                'Aún no se muestran: falta aprobar el diseño de la ficha con foto; las miniaturas elegidas se copiarán a guardianagroup.com.',
        'generado': time.strftime('%Y-%m-%dT%H:%MZ', time.gmtime()), 'cuentas': cuentas, 'fotos': fotos,
    }, open(os.path.join(DATOS, 'fotos-candidatas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
