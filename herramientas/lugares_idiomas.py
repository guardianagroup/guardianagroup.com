#!/usr/bin/env python3
"""GUARDIANA · Órbita: the towns where cables land and the cities of the data centres, in the visitor's language.

Owner, 25 Oct 2026, 14:12: «si la persona lo tiene puesto en ruso, tiene que verlo todo en ruso. Cada idioma con su mapa».
Those places carry their GeoNames name (lugares_capas.py, from cities15000 and cities500: «London», «Helsinki»), so the
Spanish page said «London» and the Russian one «Helsinki». GeoNames itself (CC BY 4.0) publishes each place's names in
other languages (alternateNamesV2): this keeps, for every place on the map, its name in each of the page's languages.

Each place of lugares-capas.json (landings, data-centre cities and the landings listed for each cable) is matched to its
GeoNames record by name, country and position (the nearest one under 0.3°). For each language: the name GeoNames marks
as preferred, else a short name, else the first one, never a colloquial or historic one; in the languages written in
Latin letters only a preferred or short name (the GeoNames name already reads there).

Output: orbita/datos/lugares-idioma/<language>.json  {"n": {"Name|CC": "name in that language", …}}, only the names
that differ. The page loads only its own language.

Usage: python3 herramientas/lugares_idiomas.py <cities500.txt> <alternateNamesV2.txt>
"""
import collections, json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
DATOS = os.path.join(AQUI, '..', 'orbita', 'datos')
SALIDA = os.path.join(DATOS, 'lugares-idioma')

# the page's languages → GeoNames language codes, in order of preference
IDIOMAS = {
    'es': ['es'], 'en': ['en'], 'pt': ['pt-BR', 'pt'], 'pt-pt': ['pt-PT', 'pt'], 'ar': ['ar'], 'bg': ['bg'], 'bn': ['bn'],
    'cs': ['cs'], 'da': ['da'], 'de': ['de'], 'el': ['el'], 'fa': ['fa'], 'fi': ['fi'], 'fil': ['fil', 'tl'], 'fr': ['fr'],
    'he': ['he', 'iw'], 'hi': ['hi'], 'hr': ['hr'], 'hu': ['hu'], 'id': ['id'], 'is': ['is'], 'it': ['it'], 'ja': ['ja'],
    'ko': ['ko'], 'ms': ['ms'], 'nb': ['nb', 'no'], 'nl': ['nl'], 'pl': ['pl'], 'ro': ['ro'], 'ru': ['ru'], 'sk': ['sk'],
    'sv': ['sv'], 'sw': ['sw'], 'ta': ['ta'], 'te': ['te'], 'th': ['th'], 'tr': ['tr'], 'uk': ['uk'], 'ur': ['ur'],
    'vi': ['vi'], 'zh': ['zh-CN', 'zh-Hans', 'zh'], 'zh-tw': ['zh-TW', 'zh-Hant', 'zh-HK', 'zh'],
}


LATINAS = {'es', 'en', 'pt', 'pt-pt', 'fr', 'de', 'it', 'nl', 'sv', 'da', 'nb', 'fi', 'is', 'pl', 'tr', 'id', 'vi', 'cs', 'ro', 'hu',
           'sk', 'hr', 'ms', 'fil', 'sw'}


def lugares():
    """{(name, cc): (lon, lat)} of every place name the map shows."""
    d = json.load(open(os.path.join(DATOS, 'lugares-capas.json'), encoding='utf-8'))
    out = {}
    for c in d.get('centros', []): out.setdefault((c[2], c[3]), (c[0], c[1]))
    for l in d.get('llegadas', []):
        if l[2]: out.setdefault((l[2], l[3]), (l[0], l[1]))
    for g in d.get('grupos', []):
        for q in g[1]: out.setdefault((q[0], q[1]), (q[2], q[3]))
    return out


def main():
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    quiero = lugares()
    print('lugares en el mapa:', len(quiero))
    nombres = collections.defaultdict(list)  # (name, cc) → [(gid, lon, lat)]
    for linea in open(sys.argv[1], encoding='utf-8'):
        p = linea.rstrip('\n').split('\t')
        if len(p) < 9: continue
        k = (p[1], p[8])
        if k in quiero:
            try: nombres[k].append((p[0], float(p[5]), float(p[4])))
            except ValueError: pass
    gid_de = {}
    for k, (lo, la) in quiero.items():
        cand = [(math.hypot(x - lo, y - la), g) for g, x, y in nombres.get(k, [])]
        cand = [c for c in cand if c[0] < 0.3]
        if cand: gid_de[k] = min(cand)[1]
    print('con su ficha de GeoNames:', len(gid_de))
    codigos = {c for v in IDIOMAS.values() for c in v}
    gids = set(gid_de.values())
    alt = collections.defaultdict(lambda: collections.defaultdict(list))  # gid → code → [(rank, name)]
    for linea in open(sys.argv[2], encoding='utf-8'):
        p = linea.rstrip('\n').split('\t')
        if len(p) < 4 or p[1] not in gids or p[2] not in codigos: continue
        pref, corto = (p[4] if len(p) > 4 else '') == '1', (p[5] if len(p) > 5 else '') == '1'
        coloq, hist = (p[6] if len(p) > 6 else '') == '1', (p[7] if len(p) > 7 else '') == '1'
        if coloq or hist or not p[3].strip(): continue
        lst = alt[p[1]][p[2]]; lst.append((0 if pref else 1 if corto else 2, len(lst), p[3].strip()))
    os.makedirs(SALIDA, exist_ok=True)
    resumen = {}
    for lang, cods in IDIOMAS.items():
        n = {}
        for k, g in gid_de.items():
            for c in cods:
                v = alt.get(g, {}).get(c)
                # in a language written in Latin letters the GeoNames name already reads, so only a name GeoNames marks as
                # preferred or short replaces it (not an old exonym: «Bolduque» for 's-Hertogenbosch, «Abenrá» for Aabenraa)
                if v and lang in LATINAS: v = [x for x in v if x[0] < 2]
                if v:
                    nombre = min(v)[2]
                    if nombre != k[0]: n[k[0] + '|' + k[1]] = nombre
                    break
        with open(os.path.join(SALIDA, lang + '.json'), 'w', encoding='utf-8') as f:
            json.dump({'n': n}, f, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
        resumen[lang] = len(n)
    print('lugares · nombres propios por idioma:', resumen)


if __name__ == '__main__':
    main()
