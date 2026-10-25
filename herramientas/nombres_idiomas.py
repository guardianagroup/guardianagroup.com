#!/usr/bin/env python3
"""GUARDIANA · Órbita: the names on the map in the visitor's language — states and provinces, and cities.

Owner, 25 Oct 2026, 14:12, on the region names that showed in English whatever the page's language («Northern
Ostrobothnia», «West Pomeranian»): «Sí, hazlo… si la persona lo tiene puesto en ruso, tiene que verlo todo en ruso. Cada
idioma con su mapa».

Sources, both open:
  · Natural Earth (public domain): the name of each region (ne_10m_admin_1_states_provinces, joined by adm1_code to the
    label points that fronteras.py turned into fronteras.json «nombres») and of each city (ne_10m_populated_places, the
    places of ciudades.json) in 26 languages (name_es, name_ru…).
  · Wikidata (CC0), the labels of each item (Natural Earth's «wikidataid»), for the page's languages Natural Earth does
    not carry (Bulgarian, Czech, Danish, Finnish, Filipino, Croatian, Icelandic, Malay, Norwegian, Romanian, Slovak,
    Swahili, Tamil, Telugu, Thai) and wherever its name is empty. Only with --wikidata (needs the network: the workflow).

Output, one file per language, loaded by the page only for its own language:
  orbita/datos/regiones/<language>.json        {"n": [name or null, …]}  in the order of fronteras.json «nombres»
  orbita/datos/ciudades-idioma/<language>.json {"n": [name or null, …]}  in the order of ciudades.json «c»
(null: the name already in fronteras.json, or the local name in ciudades.json, is right).

Usage: python3 herramientas/nombres_idiomas.py <folder with the Natural Earth GeoJSON files> [--wikidata]
"""
import json, math, os, sys, time, urllib.parse, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
DATOS = os.path.join(AQUI, '..', 'orbita', 'datos')

# the page's languages (idioma.js) → the Natural Earth field (lower case), and the Wikidata label code
IDIOMAS = {
    'es': ('name_es', 'es'), 'en': ('name_en', 'en'), 'pt': ('name_pt', 'pt-br'), 'pt-pt': ('name_pt', 'pt'),
    'ar': ('name_ar', 'ar'), 'bg': (None, 'bg'), 'bn': ('name_bn', 'bn'), 'cs': (None, 'cs'), 'da': (None, 'da'),
    'de': ('name_de', 'de'), 'el': ('name_el', 'el'), 'fa': ('name_fa', 'fa'), 'fi': (None, 'fi'), 'fil': (None, 'tl'),
    'fr': ('name_fr', 'fr'), 'he': ('name_he', 'he'), 'hi': ('name_hi', 'hi'), 'hr': (None, 'hr'), 'hu': ('name_hu', 'hu'),
    'id': ('name_id', 'id'), 'is': (None, 'is'), 'it': ('name_it', 'it'), 'ja': ('name_ja', 'ja'), 'ko': ('name_ko', 'ko'),
    'ms': (None, 'ms'), 'nb': (None, 'nb'), 'nl': ('name_nl', 'nl'), 'pl': ('name_pl', 'pl'), 'ro': (None, 'ro'),
    'ru': ('name_ru', 'ru'), 'sk': (None, 'sk'), 'sv': ('name_sv', 'sv'), 'sw': (None, 'sw'), 'ta': (None, 'ta'),
    'te': (None, 'te'), 'th': (None, 'th'), 'tr': ('name_tr', 'tr'), 'uk': ('name_uk', 'uk'), 'ur': ('name_ur', 'ur'),
    'vi': ('name_vi', 'vi'), 'zh': ('name_zh', 'zh-hans'), 'zh-tw': ('name_zht', 'zh-hant'),
}
# Wikidata codes tried after the first one, in order (a Portuguese label is better than none in Brazilian Portuguese)
OTRAS = {'pt-br': ['pt'], 'pt': ['pt-br'], 'zh-hans': ['zh-cn', 'zh'], 'zh-hant': ['zh-tw', 'zh-hk', 'zh'], 'nb': ['no', 'nn'], 'tl': ['fil']}


def lee(carpeta, n):
    return json.load(open(os.path.join(carpeta, n + '.geojson'), encoding='utf-8'))


def minus(p):
    return {k.lower(): v for k, v in (p or {}).items()}


def etiquetas(carpeta):
    """The best-ranked label point of each region, as fronteras.py chooses them, with its adm1_code."""
    mejor = {}
    for f in lee(carpeta, 'ne_10m_admin_1_label_points')['features']:
        p = f.get('properties') or {}; g = f.get('geometry') or {}
        if g.get('type') != 'Point': continue
        n = p.get('name') or p.get('name_en') or ''
        cc = (p.get('iso_a2') or p.get('adm0_a3') or '')[:2]
        if not n: continue
        k = (p.get('adm1_code') or (n, cc)); sr = p.get('scalerank') or 99
        if k not in mejor or sr < mejor[k][0]: mejor[k] = (sr, [round(g['coordinates'][0], 2), round(g['coordinates'][1], 2), n, cc, sr])
    return list(mejor.keys()), [v[1] for v in mejor.values()]


def regiones(carpeta):
    """[(base name, properties of its region or None)] in the order of fronteras.json «nombres»."""
    claves, nombres = etiquetas(carpeta)
    fr = json.load(open(os.path.join(DATOS, 'fronteras.json'), encoding='utf-8'))['nombres']
    if nombres != fr:
        sys.exit('los puntos de etiqueta de Natural Earth ya no son los de fronteras.json: ejecuta antes fronteras.py')
    pol = {}
    for f in lee(carpeta, 'ne_10m_admin_1_states_provinces')['features']:
        p = minus(f.get('properties'))
        if p.get('adm1_code'): pol[p['adm1_code']] = p
    return [(n[2], pol.get(k) if isinstance(k, str) else None) for k, n in zip(claves, nombres)]


def ciudades(carpeta):
    """[(local name, properties of the Natural Earth place or None)] in the order of ciudades.json «c»: the same
    coordinates, or else the same local name within 0.2°."""
    D = json.load(open(os.path.join(DATOS, 'ciudades.json'), encoding='utf-8')); C = D['campos']
    iLon, iLat, iNom = C.index('lon'), C.index('lat'), C.index('nombre')
    por_xy, por_nom = {}, {}
    for f in lee(carpeta, 'ne_10m_populated_places')['features']:
        p = minus(f.get('properties')); g = (f.get('geometry') or {}).get('coordinates') or [0, 0]
        por_xy.setdefault((round(g[0], 3), round(g[1], 3)), p)
        por_nom.setdefault(p.get('name') or '', []).append((g[0], g[1], p))
    out, sin = [], 0
    for c in D['c']:
        p = por_xy.get((round(c[iLon], 3), round(c[iLat], 3)))
        if p is None:
            cand = [(math.hypot(x - c[iLon], y - c[iLat]), q) for x, y, q in por_nom.get(c[iNom], [])]
            cand = [t for t in cand if t[0] < 0.2]
            p = min(cand, key=lambda t: t[0])[1] if cand else None
        if p is None: sin += 1
        out.append((c[iNom], p))
    print('ciudades:', len(out), '· sin pareja en Natural Earth:', sin)
    return out


def wikidata(qids, codigos):
    """{qid: {code: label}} from wbgetentities, 50 items a call."""
    out, qids = {}, sorted(set(q for q in qids if q and str(q).startswith('Q')))
    for i in range(0, len(qids), 50):
        url = 'https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode({
            'action': 'wbgetentities', 'ids': '|'.join(qids[i:i + 50]), 'props': 'labels', 'languages': '|'.join(codigos), 'format': 'json'})
        for intento in range(4):
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'GUARDIANA-Orbita/1.0 (https://guardianagroup.com; datos@guardianagroup.com)'})
                d = json.load(urllib.request.urlopen(req, timeout=60)); break
            except Exception as e:  # noqa: BLE001
                print('wikidata: reintento', intento + 1, e, file=sys.stderr); time.sleep(5 * (intento + 1))
        else:
            continue
        for q, e in (d.get('entities') or {}).items():
            out[q] = {c: v['value'] for c, v in (e.get('labels') or {}).items()}
        time.sleep(0.3)
    return out


def escribe(carpeta_salida, filas, wd):
    os.makedirs(carpeta_salida, exist_ok=True)
    resumen = {}
    for lang, (campo, cwd) in IDIOMAS.items():
        n, puestos = [], 0
        for base, p in filas:
            v = ((p or {}).get(campo) or '').strip() if campo else ''
            q = (p or {}).get('wikidataid')
            if not v and q in wd:
                lab = wd[q]
                v = next((lab[c] for c in [cwd] + OTRAS.get(cwd, []) if lab.get(c)), '').strip()
            if v and v != base: n.append(v); puestos += 1
            else: n.append(None)
        with open(os.path.join(carpeta_salida, lang + '.json'), 'w', encoding='utf-8') as f:
            json.dump({'n': n}, f, ensure_ascii=False, separators=(',', ':'))
        resumen[lang] = puestos
    return resumen


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    carpeta, con_wd = sys.argv[1], '--wikidata' in sys.argv
    reg, ciu = regiones(carpeta), ciudades(carpeta)
    wd = {}
    if con_wd:
        cods = sorted({c for _, (_, w) in IDIOMAS.items() for c in [w] + OTRAS.get(w, [])})
        wd = wikidata([p.get('wikidataid') for _, p in reg + ciu if p], cods)
        print('wikidata:', len(wd), 'elementos con etiquetas')
    print('regiones:', len(reg), '· nombres propios por idioma:', escribe(os.path.join(DATOS, 'regiones'), reg, wd))
    print('ciudades:', len(ciu), '· nombres propios por idioma:', escribe(os.path.join(DATOS, 'ciudades-idioma'), ciu, wd))


if __name__ == '__main__':
    main()
