#!/usr/bin/env python3
"""GUARDIANA · Órbita · land fibre backbones confirmed by the agency (owner, 22–23 Oct 2026: «fibra terrestre de los
países grandes»; agency rule: only what two voices confirm).

There is no open map of land fibre for Russia, India, Brazil, Argentina… so two voices (ChatGPT and Grok) were asked,
separately and with the same prompt, for each country's main long-distance backbones as an ORDERED list of the cities
each route passes through. Their answers are in herramientas/fibra-agencia/<voz>-*.json ([{nombre, operador, pais,
ciudades[], estado, fuente}]).

A stretch between two consecutive cities of one voice is kept only when the OTHER voice gives a route of the same
operator in the same country that also passes through both cities, without a detour (its path between them is at most
1.35 × the straight line + 60 km). Cities are placed with GeoNames (orbita/static/tierra/ciudades.tsv, CC BY 4.0).
Stretches are drawn as straight lines between cities, like the Topology Zoo: operators do not publish exact routes.

Writes herramientas/fuentes/fibra-agencia.json, which fibra_tierra.py adds to orbita/datos/fibra-tierra.json.
Usage: python3 herramientas/fibra_agencia.py
"""
import glob, json, math, os, re, sys, unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
CARPETA = os.path.join(AQUI, 'fibra-agencia')
SALIDA = os.path.join(AQUI, 'fuentes', 'fibra-agencia.json')

# Spanish / local names the voices use → the GeoNames name (folded). Only what the answers actually needed.
ALIAS = {
    'hargeisa': 'hargeysa', 'gomel': 'homyel', 'grodno': 'hrodna', 'darkhan': 'darhan', 'khorog': 'khorugh',  # round 17
    'phuentsholing': 'phuntsholing', 'sainshand': 'saynshand',
    'moscu': 'moscow', 'sanpetersburgo': 'saintpetersburg', 'nizhninovgorod': 'nizhniynovgorod', 'nizhnynovgorod': 'nizhniynovgorod',
    'ekaterimburgo': 'yekaterinburg', 'ekaterinburgo': 'yekaterinburg', 'ekaterinburg': 'yekaterinburg', 'yekaterimburgo': 'yekaterinburg',
    'vladivostok': 'vladivostok', 'jabarovsk': 'khabarovsk', 'novosibirsk': 'novosibirsk', 'omsk': 'omsk', 'krasnoyarsk': 'krasnoyarsk',
    'irkutsk': 'irkutsk', 'chita': 'chita', 'samara': 'samara', 'kazan': 'kazan', 'rostovdelDon': 'rostovnadonu', 'rostovdeldon': 'rostovnadonu',
    'rostovnadonu': 'rostovnadonu', 'rostov': 'rostovnadonu', 'nuevadelhi': 'newdelhi', 'delhi': 'delhi', 'bombay': 'mumbai', 'calcuta': 'kolkata',
    'madras': 'chennai', 'bangalore': 'bengaluru', 'sanpablo': 'saopaulo', 'saopaulo': 'saopaulo', 'riodejaneiro': 'riodejaneiro',
    'brasilia': 'brasilia', 'belem': 'belem', 'ciudaddemexico': 'mexicocity', 'cdmx': 'mexicocity', 'mexicodf': 'mexicocity',
    'elcairo': 'cairo', 'cairo': 'cairo', 'alejandria': 'alexandria', 'asuan': 'aswan', 'luxor': 'luxor', 'teheran': 'tehran',
    'riad': 'riyadh', 'riyad': 'riyadh', 'yeda': 'jeddah', 'jidda': 'jeddah', 'lameca': 'makkah', 'meca': 'makkah', 'medina': 'medina',
    'dammam': 'dammam', 'bangkok': 'bangkok', 'manila': 'manila', 'yakarta': 'jakarta', 'astana': 'astana', 'nursultan': 'astana',
    'almaty': 'almaty', 'almaata': 'almaty', 'nizhnynovgorod2': 'nizhniynovgorod', 'uralsk': 'oral', 'petropavlovsk': 'petropavl',
    'oskemen': 'ustkamenogorsk', 'mecca': 'makkah', 'medina': 'madinah', 'jazan': 'jizan', 'balkhash': 'balqash', 'solo': 'surakarta',
    'legazpi': 'legaspi', 'merak': 'cilegon', 'qassim': 'buraydah', 'aljowf': 'sakakah', 'aljouf': 'sakakah', 'mansoura': 'almansurah',
    'ayutthaya': 'phranakhonsiayutthaya', 'cebu': 'cebucity', 'tiumen': 'tyumen', 'jantimansisk': 'khantymansiysk', 'noviurengoi': 'novyyurengoy', 'salejard': 'salekhard', 'jamismushait': 'khamismushait', 'alkhobar': 'khobar', 'laredo': 'nuevolaredo', 'karaganda': 'karagandy', 'rasghareb': 'rasgharib', 'coca': 'puertofranciscodeorellana', 'leon': 'leondelosaldama', 'sanfernandodelvalledecatamarca': 'catamarca', 'santodomingo': 'santodomingodeloscolorados', 'damanhour': 'damanhur', 'bogota': 'bogota', 'lima': 'lima', 'quito': 'quito', 'guayaquil': 'guayaquil',
    'lapaz': 'lapaz', 'santacruzdelasierra': 'santacruzdelasierra', 'santacruz': 'santacruzdelasierra', 'santiago': 'santiago',
    'santiagodechile': 'santiago', 'buenosaires': 'buenosaires', 'cordoba': 'cordoba', 'tashkent': 'tashkent',
}

# Towns below GeoNames' 15 000 inhabitants (border posts, junctions) that the voices name: (country, folded name) → (lon, lat)
SITIOS = {
    ('SS', 'nimule'): (32.06, 3.60),  # 24 Oct 2026: the border town on the Juba–Uganda backbone (four voices name it; not in GeoNames cities500)
    ('EG', 'benisuef'): (31.10, 29.07), ('SA', 'hofuf'): (49.59, 25.38), ('KZ', 'dostyk'): (82.48, 45.25), ('EG', 'zafarana'): (32.65, 29.11),
    ('EG', 'marsaalam'): (34.89, 25.07), ('IR', 'bazargan'): (44.39, 39.39), ('IR', 'khosravi'): (45.46, 34.38), ('IN', 'hazira'): (72.65, 21.10),
    ('IN', 'vijaipur'): (77.17, 24.47), ('SA', 'majmaah'): (45.35, 25.90), ('BO', 'pisiga'): (-68.65, -19.25), ('BO', 'puertosuarez'): (-57.80, -18.96),
    ('BO', 'desaguadero'): (-69.04, -16.57), ('AR', 'lascuevas'): (-70.05, -32.81), ('CL', 'diegodealmagro'): (-70.05, -26.37),
    ('ID', 'labuhanmaringgai'): (105.81, -5.30), ('PH', 'daraga'): (123.69, 13.15), ('PH', 'sanmanuel'): (120.67, 16.06),
    ('PH', 'mexico'): (120.72, 15.06), ('AR', 'riogrande'): (-67.71, -53.79), ('AR', 'tolhuin'): (-67.19, -54.51), ('PE', 'lurin'): (-76.87, -12.27),
    ('PE', 'puquio'): (-74.13, -14.70), ('PE', 'huanuco'): (-76.24, -9.93), ('SA', 'haql'): (34.94, 29.29), ('BO', 'puertoquijarro'): (-57.77, -17.78),
    ('PE', 'lamerced'): (-75.33, -11.06), ('TH', 'sadao'): (100.42, 6.64), ('RU', 'kyakhta'): (106.45, 50.35),
}

PARECIDO = 1.35  # the other voice's path between two cities may be this much longer than the straight line (+ 60 km)


def pliega(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', s)


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(min(1, math.sqrt(h)))


def ciudades():
    """(country, folded name) → (lon, lat); the file is sorted by population, so the first match is the big city."""
    idx, idx_div = {}, {}
    for linea in open(os.path.join(RAIZ, 'orbita', 'static', 'tierra', 'ciudades.tsv'), encoding='utf-8'):
        if linea.startswith('#'): continue
        p = linea.rstrip('\n').split('\t')
        if len(p) < 5: continue
        try: lon, lat = float(p[4]), float(p[3])
        except ValueError: continue
        idx.setdefault((p[1], pliega(p[0])), (lon, lat))
        idx_div.setdefault((p[1], pliega(p[2])), (lon, lat))
    # 24 Oct 2026: the smaller towns the routes pass through, and the English names the voices use, from GeoNames
    # cities500 (pueblos_fibra.py, run by the workflow); the big cities above keep their place
    ruta = os.path.join(AQUI, 'fuentes', 'pueblos-fibra.tsv')
    if os.path.exists(ruta):
        for linea in open(ruta, encoding='utf-8'):
            if linea.startswith('#'): continue
            p = linea.rstrip('\n').split('\t')
            if len(p) < 4: continue
            try: idx.setdefault((p[1], p[0]), (float(p[3]), float(p[2])))
            except ValueError: continue
    return idx, idx_div


def fuera(nombre, previo, idx):
    """A town across the border (routes that reach the first city on the other side: Minsk–Warsaw, Hanoi–Vientiane):
    the same name in another country, only when it is less than 800 km from the route's previous town."""
    if not previo: return None
    mejor, dm = None, 800.0
    for k in {pliega(nombre), pliega(re.split(r'[(/,]', nombre)[0])}:
        k = ALIAS.get(k, k)
        for (c, n), q in idx.items():
            if n != k: continue
            d = km(previo, q)
            if d < dm: mejor, dm = q, d
    return mejor


# the countries where no open source has land fibre: approximate stretches that two voices agree on are allowed there
APROX = {'BH', 'BN', 'BZ', 'CU', 'DO', 'HT', 'JM', 'KP', 'KW', 'LB', 'LS', 'NP', 'PS', 'QA', 'RW', 'SY', 'TL', 'XK', 'YE',
         'SR', 'TT', 'PR', 'GW', 'SZ', 'ER', 'CV', 'MU', 'MT', 'BS', 'GT', 'PA', 'SS'}


def situa(nombre, cc, idx, idx_div):
    base = re.split(r'[(/,]', nombre)[0]
    for k in (pliega(nombre), pliega(base)):
        k = ALIAS.get(k, k)
        if (cc, k) in SITIOS: return SITIOS[(cc, k)]
        for t in (idx, idx_div):
            if (cc, k) in t: return t[(cc, k)]
    # «Angeles» = «Angeles City», «Tuxtla Gutierrez» = «Tuxtla»: the most populous city whose name starts the same way
    k = pliega(base)
    if len(k) >= 5:
        for (c, n), p in idx.items():
            if c == cc and len(n) >= 5 and (n.startswith(k) or k.startswith(n)): return p
    return None


def mismo_operador(a, b):
    fa, fb = pliega(a), pliega(b)
    if not fa or not fb: return False
    if fa in fb or fb in fa: return True
    # «PJSC Rostelecom» vs «Atlas / Rostelecom»; «National Informatics Centre / NKN» vs «… (NIC)»: share a word of 5+ letters
    # that is not a generic one
    gen = {'national', 'nacional', 'telecom', 'telecomunicaciones', 'telecommunication', 'telecommunications', 'company', 'corporation',
           'corporacion', 'network', 'networks', 'limited', 'comunicaciones', 'group', 'grupo', 'gobierno', 'fibra', 'fiber', 'fibre',
           'optica', 'optical', 'backbone', 'troncal', 'rede', 'bolivia', 'colombia', 'chile', 'india', 'peru', 'egypt', 'saudi', 'arabia',
           'iran', 'brasil', 'brazil', 'argentina', 'mexico', 'indonesia', 'thailand', 'philippines', 'ecuador', 'russia', 'kazakhstan'}
    pal = lambda x: {pliega(w) for w in re.split(r'[^\w]+', unicodedata.normalize('NFKD', x or '')) if len(pliega(w)) >= 4} - gen
    return bool(pal(a) & pal(b))


def camino(pts, i, j):
    if i > j: i, j = j, i
    return sum(km(pts[k], pts[k + 1]) for k in range(i, j))


def main():
    idx, idx_div = ciudades()
    voces = {}
    for f in sorted(glob.glob(os.path.join(CARPETA, '*.json'))):
        voz = os.path.basename(f).split('-')[0].lower()
        for r in json.load(open(f, encoding='utf-8')):
            cc = (r.get('pais') or '').upper()[:2]
            # «en servicio parcial» or «en servicio; expansión en desarrollo» still is fibre in service (owner, 24 Oct 2026, 09:00:
            # «lo más aproximado posible»); «no verificado» or planned is not
            est = (r.get('estado') or 'en servicio').lower().strip()
            if not est.startswith(('en servicio', 'operativo', 'in service')) or 'no verificad' in est: continue
            nombres = r.get('ciudades') or []
            res = [situa(c, cc, idx, idx_div) for c in nombres]
            # a town across the border is looked for near the previous placed town, or near the next one when it opens
            # the route (Somalia's «Djibouti–Hargeisa–Berbera»)
            for i, c in enumerate(nombres):
                if res[i] is not None: continue
                ref = next((res[j] for j in range(i - 1, -1, -1) if res[j] is not None), None)
                if ref is None: ref = next((res[j] for j in range(i + 1, len(res)) if res[j] is not None), None)
                res[i] = fuera(c, ref, idx)
            pts, nom, sin = [], [], []
            for c, p in zip(nombres, res):
                if p is None: sin.append(c); continue
                if pts and p == pts[-1]: continue
                pts.append(p); nom.append(c)
            if sin: print('  sin situar (%s, %s, %s): %s' % (voz, cc, r.get('nombre'), ', '.join(sin)))
            voces.setdefault(voz, []).append({'n': r.get('nombre') or '', 'o': r.get('operador') or '', 'cc': cc, 'pts': pts, 'nom': nom})
    if len(voces) < 2:
        print('hacen falta dos voces; hay', list(voces)); return

    candidatos = []
    for voz, rutas in voces.items():
        otras = [r for v, rs in voces.items() if v != voz for r in rs]
        for r in rutas:
            ok, ok2, ok3 = [], [], []  # per stretch: None, or the points to draw from A to B (ok: same operator; ok2: another one; ok3: approximate)
            for a in range(len(r['pts']) - 1):
                A, B = r['pts'][a], r['pts'][a + 1]
                recta = km(A, B)
                bien = bien2 = bien3 = None
                for o in otras:
                    if o['cc'] != r['cc']: continue
                    if A in o['pts'] and B in o['pts']:
                        i, j = o['pts'].index(A), o['pts'].index(B)
                        # 24 Oct 2026 (owner, 07:43: «en esos países intenta ponerlos en el mapa según los datos aproximados»): in
                        # the countries with no other source, two voices that both put A and B on the national backbone confirm an
                        # approximate A–B stretch even when their paths between them differ more (up to 2.5 × the straight line)
                        if r['cc'] in APROX and bien3 is None and camino(o['pts'], i, j) <= recta * 2.5 + 150: bien3 = [A, B]
                        if camino(o['pts'], i, j) <= recta * PARECIDO + 60:
                            # both voices put fibre between A and B; the more detailed voice draws it
                            sub = o['pts'][i:j + 1] if i < j else o['pts'][j:i + 1][::-1]
                            sub = sub if len(sub) > 2 else [A, B]
                            if mismo_operador(o['o'], r['o']): bien = sub; break
                            if bien2 is None: bien2 = sub
                ok.append(bien); ok2.append(None if bien else bien2); ok3.append(None if (bien or bien2) else bien3)
            # contiguous confirmed stretches become polylines. 24 Oct 2026 (round 17): two voices that both put long-
            # distance fibre between the same two cities confirm the stretch even when they name different operators
            # («Government of Rwanda» and «RDB»); such a stretch is drawn without a name or an operator, since those
            # are what the voices do not agree on.
            for lista, neutra in ((ok, False), (ok2, True), (ok3, True)):
                tramo = []
                for a, b in enumerate(lista):
                    if b:
                        if not tramo: tramo = [r['pts'][a]]
                        tramo.extend(b[1:])
                    else:
                        if len(tramo) >= 2: candidatos.append(dict(r, l=tramo, n='' if neutra else r['n'], o='' if neutra else r['o'], neutra=neutra))
                        tramo = []
                if len(tramo) >= 2: candidatos.append(dict(r, l=tramo, n='' if neutra else r['n'], o='' if neutra else r['o'], neutra=neutra))

    # both voices confirm the same stretch: keep it once, the finer drawing first
    candidatos.sort(key=lambda c: (c.get('neutra', False), -len(c['l'])))  # the ones with an agreed operator first
    hechos, lineas, usados = [], [], set()
    for c in candidatos:
        nuevo, tramo = [], [c['l'][0]]
        for A, B in zip(c['l'], c['l'][1:]):
            par = frozenset((A, B))
            ya = par in usados  # a route that doubles back over a stretch it already drew
            usados.add(par)
            for h in ([] if ya else hechos):
                if h['cc'] == c['cc'] and A in h['l'] and B in h['l'] and camino(h['l'], h['l'].index(A), h['l'].index(B)) <= km(A, B) * PARECIDO + 60:
                    ya = True; break
            if ya:
                if len(tramo) >= 2: nuevo.append(tramo)
                tramo = [B]
            else:
                tramo.append(B)
        if len(tramo) >= 2: nuevo.append(tramo)
        for t in nuevo:
            x = {'n': c['n'], 'o': c['o'], 'cc': c['cc'], 'l': [[round(p[0], 3), round(p[1], 3)] for p in t]}
            hechos.append({'cc': c['cc'], 'l': t}); lineas.append(x)

    tot = sum(sum(km(p, q) for p, q in zip(x['l'], x['l'][1:])) for x in lineas)
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump({'fuente': {'n': 'Agencia GUARDIANA (dos voces)', 'lic': 'GUARDIANA', 'url': '', 'fecha': '2026-10-23',
                              'nota': 'Troncales que dos voces de la agencia confirman por separado, entre ciudades, en línea recta: la ruta exacta no es pública.'},
                   'lineas': lineas}, f, ensure_ascii=False, indent=0)
    por = {}
    for x in lineas: por[x['cc']] = por.get(x['cc'], 0) + 1
    print('fibra de la agencia:', len(lineas), 'tramos ·', round(tot), 'km ·', dict(sorted(por.items())))


if __name__ == '__main__':
    main()
