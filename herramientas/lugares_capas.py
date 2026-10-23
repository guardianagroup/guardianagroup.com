#!/usr/bin/env python3
"""GUARDIANA · Órbita: the city of every data centre and of both ends of every submarine cable.

Owner, 22 Oct 2026: «cuando la persona se vaya moviendo por el mapa… que le salga la ciudad donde está el cable…
y en los centros de datos también. Si en una ciudad hay varios centros de datos, que se vea claro».

Reads orbita/datos/puntos.json and orbita/datos/cables.json (OpenStreetMap, ODbL) and the city list that already
travels with Órbita (orbita/static/tierra/ciudades.tsv, GeoNames cities15000, CC BY 4.0), and writes
orbita/datos/lugares-capas.json:

  centros  one entry per city: [lon, lat, city, country, number of data centres, [[operator, n], …]]
           (lon/lat is the centre of its data centres; a data centre farther than 50 km from any city of 15,000
           people keeps its own place and no city name)
  de       for every data centre of puntos.json (in order, only type «datos»), the index of its entry in «centros»
  cables   one entry per cable segment, in the order of cables.json: [city A, country A, city B, country B]
           (the nearest city within 80 km of each end; empty when there is none)
  grupos   whole cables (owner, 22 Oct 2026: «decir de dónde va a dónde va, si lo sabemos con certeza»): the segments of
           OpenStreetMap that carry the same cable name once its segment label is removed («SEA-ME-WE3 SEG 10.4»,
           «SEA ME WE3-S10.3», «CANTAT 3 F4», «AC1 Seg. C»…): [name, [[city, country, lon], …]] with every city where
           one of its segments reaches land, west to east
  g        for every segment, the index of its whole cable in «grupos» (-1 when it has no name)
  llegadas where cables reach land: [lon, lat, city, country, [indices of the segments that end there]]
           (ends closer than about 5 km are one landing)

Nothing is invented: a name only appears when a real city is near enough. Run it again whenever the data is refreshed.
"""
import json, math, os, re, collections

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'orbita')

def lee_ciudades():
    out = []
    with open(os.path.join(RAIZ, 'static', 'tierra', 'ciudades.tsv'), encoding='utf-8') as f:
        for l in f:
            if not l.strip() or l.startswith('#'):
                continue
            n, cc, adm, la, lo = l.rstrip('\n').split('\t')
            out.append((n, cc, float(la), float(lo)))
    return out

def km(la1, lo1, la2, lo2):
    p1, p2 = math.radians(la1), math.radians(la2)
    dp, dl = p2 - p1, math.radians(lo2 - lo1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371.0 * 2 * math.asin(min(1.0, math.sqrt(a)))

class Rejilla:
    """Cities in 1-degree cells, for a quick nearest search."""
    def __init__(self, ciudades):
        self.c = collections.defaultdict(list)
        for i, (n, cc, la, lo) in enumerate(ciudades):
            self.c[(int(math.floor(la)), int(math.floor(lo)))].append(i)
        self.ciudades = ciudades
    def cercana(self, la, lo, max_km):
        mejor, dm = None, max_km
        r = 1 + int(max_km / 111) + 1
        for i in range(-r, r + 1):
            for j in range(-r, r + 1):
                for k in self.c.get((int(math.floor(la)) + i, (int(math.floor(lo)) + j + 180) % 360 - 180), ()):
                    n, cc, la2, lo2 = self.ciudades[k]
                    d = km(la, lo, la2, lo2)
                    if d < dm:
                        mejor, dm = k, d
        return mejor

def base_cable(n):
    b = (n or '').strip()
    b = re.sub(r'[\s\-\u2013]*(?:seg(?:ment(?:o)?)?\.?)\s*[\w.]+$', '', b, flags=re.I)
    b = re.sub(r'[\s\-]+S\d+(?:\.\d+)?[A-Z]?$', '', b)
    b = re.sub(r'\s+FC?\d+(?:,\s*F\d+)*$', '', b)
    b = re.sub(r'\s+-\s+Phase\s*\d+$', '', b, flags=re.I)
    return b.strip(' -\u2013')

def main():
    ciudades = lee_ciudades()
    rj = Rejilla(ciudades)
    pts = json.load(open(os.path.join(RAIZ, 'datos', 'puntos.json'), encoding='utf-8'))
    c = pts['campos']; il, ia, it, io = c.index('lon'), c.index('lat'), c.index('tipo'), c.index('operador')
    grupos = collections.OrderedDict()
    claves = []
    for p in pts['puntos']:
        if p[it] != 'datos':
            continue
        k = rj.cercana(p[ia], p[il], 50)
        clave = ('c', k) if k is not None else ('p', round(p[il], 2), round(p[ia], 2))
        claves.append(clave)
        g = grupos.setdefault(clave, {'lon': 0.0, 'lat': 0.0, 'n': 0, 'ops': collections.Counter()})
        g['lon'] += p[il]; g['lat'] += p[ia]; g['n'] += 1
        if p[io]:
            g['ops'][p[io]] += 1
    centros = []
    orden = {}
    for clave, g in grupos.items():
        orden[clave] = len(orden)
        nombre, cc = ('', '')
        if clave[0] == 'c':
            nombre, cc = ciudades[clave[1]][0], ciudades[clave[1]][1]
        centros.append([round(g['lon'] / g['n'], 3), round(g['lat'] / g['n'], 3), nombre, cc, g['n'], [[o, k] for o, k in g['ops'].most_common(4)]])
    # keep the order of «grupos» so «de» can point into it (the biggest first is done in the page)
    de = [orden[k] for k in claves]
    cab = json.load(open(os.path.join(RAIZ, 'datos', 'cables.json'), encoding='utf-8'))
    extremos = []
    llegadas = collections.OrderedDict()
    for idx, s in enumerate(cab['cables']):
        for (lo, la) in (s['l'][0], s['l'][-1]):
            k = (round(lo / 0.05), round(la / 0.05))
            g = llegadas.setdefault(k, {'lo': lo, 'la': la, 'seg': []})
            if idx not in g['seg']:
                g['seg'].append(idx)
        a, b = s['l'][0], s['l'][-1]
        if s.get('src') == 'agencia':  # the agency names the landing itself (cables_agencia.py)
            extremos.append([s['de'][0], s['de'][1], s['a'][0], s['a'][1]]); continue
        ka, kb = rj.cercana(a[1], a[0], 80), rj.cercana(b[1], b[0], 80)
        fila = []
        for k in (ka, kb):
            fila += [ciudades[k][0], ciudades[k][1]] if k is not None else ['', '']
        extremos.append(fila)
    # whole cables
    # 22 Oct 2026: one cable, one group — the agency's key (cables_agencia.clave: aliases, accents, generic words) joins
    # «ACE» (OpenStreetMap) with «Africa Coast to Europe (ACE)» (agency), «Sam-1» with «South America-1 (SAm-1)»…
    from cables_agencia import clave as clave_cable  # here, not at the top: cables_agencia imports this module
    claves_g, grupos_c, g_de = {}, [], []
    for idx, s in enumerate(cab['cables']):
        b = base_cable(s.get('n'))
        k0 = re.sub(r'[^a-z0-9]', '', b.lower())
        if not k0:
            g_de.append(-1); continue
        k = clave_cable(b) or k0
        if k not in claves_g:
            claves_g[k] = len(grupos_c); grupos_c.append({'nombres': collections.Counter(), 'lugares': {}, 'km': 0.0, 'anios': [], 'duenos': [], 'operan': [], 'web': '', 'wiki': [], 'k0': set(), 'nombreAg': ''})
        gi = claves_g[k]; g_de.append(gi)
        grupos_c[gi]['nombres'][b] += 1; grupos_c[gi]['k0'].add(k0)
        if s.get('src') == 'agencia' and not grupos_c[gi]['nombreAg']: grupos_c[gi]['nombreAg'] = b
        G = grupos_c[gi]
        G['km'] += sum(km(p[1], p[0], q[1], q[0]) for p, q in zip(s['l'], s['l'][1:]))
        if s.get('y'): G['anios'].append(s['y'])
        for campo, k in (('d', 'duenos'), ('o', 'operan')):
            v = s.get(campo)
            if v and v not in G[k]: G[k].append(v)
        if s.get('web') and not G['web']: G['web'] = s['web']
        if s.get('w') and s['w'] not in G['wiki']: G['wiki'].append(s['w'])
        if s.get('src') == 'agencia': G['agencia'] = s.get('info') or {}
        e = extremos[idx]
        for (lo, la), (c, cc) in zip((s['l'][0], s['l'][-1]), ((e[0], e[1]), (e[2], e[3]))):
            if c and (c, cc) not in grupos_c[gi]['lugares']:
                grupos_c[gi]['lugares'][(c, cc)] = (lo, la)
    wiki = cab.get('wikidata', {})
    def info(g):
        # Wikidata first (what the cable's own record states), then OpenStreetMap's tags, then the length drawn on the map
        i = {}
        w = [wiki[q] for q in g['wiki'] if q in wiki]
        # A cable is never shorter than the line drawn for it on the map (OSM draws it straighter than it lies):
        # a Wikidata length under 60 % of the drawn one is a wrong record (CANTAT 3 says 270 km), so it is not shown.
        kms = [x['km'] for x in w if x.get('km') and x['km'] >= 0.6 * g['km']]
        if kms: i['km'] = max(kms)
        else: i['kmMapa'] = round(g['km'])
        anios = [x['anio'] for x in w if x.get('anio')] or g['anios']
        if anios: i['anio'] = min(anios)
        duenos = [n for x in w for n in x.get('duenos', [])] or g['duenos']
        if duenos: i['duenos'] = list(dict.fromkeys(duenos))[:6]
        operan = [n for x in w for n in x.get('operan', [])] or g['operan']
        if operan: i['operan'] = list(dict.fromkeys(operan))[:4]
        if g['web']: i['web'] = g['web']
        ag = g.get('agencia')
        if ag:  # rebuilt by the agency from public sources: its own figures, and the route is approximate
            i['aprox'] = 1
            if ag.get('anio'): i['anio'] = ag['anio']
            if ag.get('km'): i['km'] = ag['km']; i.pop('kmMapa', None)
            if ag.get('duenos'): i['duenos'] = ag['duenos'][:6]
            if ag.get('fuentes'): i['fuentes'] = ag['fuentes'][:6]
            if ag.get('sinTrazar'): i['sinTrazar'] = ag['sinTrazar']  # hops not drawn: they would cross hundreds of km of land
        return i
    # each landing with its longitude and latitude (owner, 22 Oct 2026: «la distancia punto a punto» in the card)
    # the name: as before; when two names were joined, the agency's (the full one), else the longest («SEA-ME-WE 4»)
    nombreDe = lambda g: g['nombres'].most_common(1)[0][0] if len(g['k0']) <= 1 else (g['nombreAg'] or max(g['nombres'], key=lambda n: (len(n), g['nombres'][n])))
    grupos_out = [[nombreDe(g), [[c, cc, round(lo, 2), round(la, 2)] for (c, cc), (lo, la) in sorted(g['lugares'].items(), key=lambda x: x[1][0])], info(g)] for g in grupos_c]
    out = {
        'fuente': 'Centros de datos y cables: OpenStreetMap (ODbL); cables que faltan en OpenStreetMap, reconstruidos por la agencia GUARDIANA de fuentes públicas (trazado aproximado). Ciudades: GeoNames cities15000 (CC BY 4.0).',
        'generado_desde': {'puntos': pts.get('descargado'), 'cables': cab.get('descargado')},
        'centros': centros,
        'de': de,
        'cables': extremos,
        'grupos': grupos_out,
        'g': g_de,
        'llegadas': [[round(g['lo'], 3), round(g['la'], 3)] + list((lambda k: [ciudades[k][0], ciudades[k][1]] if k is not None else ['', ''])(rj.cercana(g['la'], g['lo'], 80))) + [g['seg']] for g in llegadas.values()],
    }
    with open(os.path.join(RAIZ, 'datos', 'lugares-capas.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    con = sum(1 for x in centros if x[2])
    print(f'{len(centros)} lugares con centros de datos ({con} con ciudad); mayores:', sorted([(x[4], x[2], x[3]) for x in centros], reverse=True)[:8])
    print('llegadas de cables:', len(out['llegadas']), '· cables enteros:', len(grupos_out), '· ejemplos:', [(g[0], [x[0] for x in g[1]]) for g in grupos_out if len(g[1]) >= 2][:6])
    print('cables con ciudad en algún extremo:', sum(1 for e in extremos if e[0] or e[2]), 'de', len(extremos))

if __name__ == '__main__':
    main()
