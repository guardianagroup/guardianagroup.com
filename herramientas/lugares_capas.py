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
  llegadas where cables reach land: [lon, lat, city, country, [indices of the segments that end there]]
           (ends closer than about 5 km are one landing)

Nothing is invented: a name only appears when a real city is near enough. Run it again whenever the data is refreshed.
"""
import json, math, os, collections

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
        ka, kb = rj.cercana(a[1], a[0], 80), rj.cercana(b[1], b[0], 80)
        fila = []
        for k in (ka, kb):
            fila += [ciudades[k][0], ciudades[k][1]] if k is not None else ['', '']
        extremos.append(fila)
    out = {
        'fuente': 'Centros de datos y cables: OpenStreetMap (ODbL). Ciudades: GeoNames cities15000 (CC BY 4.0).',
        'generado_desde': {'puntos': pts.get('descargado'), 'cables': cab.get('descargado')},
        'centros': centros,
        'de': de,
        'cables': extremos,
        'llegadas': [[round(g['lo'], 3), round(g['la'], 3)] + list((lambda k: [ciudades[k][0], ciudades[k][1]] if k is not None else ['', ''])(rj.cercana(g['la'], g['lo'], 80))) + [g['seg']] for g in llegadas.values()],
    }
    with open(os.path.join(RAIZ, 'datos', 'lugares-capas.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    con = sum(1 for x in centros if x[2])
    print(f'{len(centros)} lugares con centros de datos ({con} con ciudad); mayores:', sorted([(x[4], x[2], x[3]) for x in centros], reverse=True)[:8])
    print('llegadas de cables:', len(out['llegadas']))
    print('cables con ciudad en algún extremo:', sum(1 for e in extremos if e[0] or e[2]), 'de', len(extremos))

if __name__ == '__main__':
    main()
