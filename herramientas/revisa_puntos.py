#!/usr/bin/env python3
"""Revisión de los puntos y los satélites de Órbita (25 Oct 2026, encargo del dueño: «No puede haber ningún error»).

  python3 herramientas/revisa_puntos.py <carpeta con ne_10m_admin_0_countries.geojson>

Mira:
  · centros de datos, puntos de intercambio, estaciones y plataformas: en el mar (máscara Natural Earth 10m, a más de
    3 km de la costa), en un país distinto del que dice su nombre o su ficha, y duplicados (mismo nombre a menos de 1 km,
    o el mismo punto exacto con dos nombres);
  · satélites: elementos imposibles (excentricidad ≥ 1, movimiento medio fuera de rango), los que ya están cayendo
    (más de 16,3 vueltas al día), los elementos viejos (más de 30 días) y los NORAD repetidos;
  · ciudades: nombres vacíos y ciudades en el mar.
No cambia nada: escribe lo que encuentra.
"""
import json, math, os, sys, collections, datetime

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
DATOS = os.path.join(RAIZ, 'orbita', 'datos')


def km(a, b):
    la1, la2 = math.radians(a[1]), math.radians(b[1])
    d = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(math.radians(b[0] - a[0]) / 2) ** 2
    return 12742 * math.asin(min(1, math.sqrt(d)))


class Tierra:
    PASO = 0.025

    def __init__(self):
        from PIL import Image
        Image.MAX_IMAGE_PIXELS = None
        im = Image.open(os.path.join(AQUI, 'fuentes', 'tierra-ne10m.png')).convert('1')
        self.W, self.H = im.size; self.px = im.load()

    def es(self, lon, lat, r=0):
        x, y = int((lon + 180) / self.PASO), int((90 - lat) / self.PASO)
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                if self.px[(x + dx) % self.W, min(self.H - 1, max(0, y + dy))] > 0: return True
        return False


class Paises:
    """country polygons rasterised at 0.05° (≈5 km): each pixel holds the index of its country"""
    PASO = 0.05

    def __init__(self, ruta):
        from PIL import Image, ImageDraw
        g = json.load(open(ruta, encoding='utf-8'))
        self.W, self.H = int(360 / self.PASO), int(180 / self.PASO)
        im = Image.new('I', (self.W, self.H), 0); dr = ImageDraw.Draw(im)
        self.cc = ['']
        for f in g['features']:
            p = f['properties']
            c = p.get('ISO_A2_EH') or p.get('ISO_A2') or ''
            if c in ('-99', ''): c = p.get('WB_A2') or p.get('ADM0_A3', '')[:2]
            self.cc.append(c); i = len(self.cc) - 1
            geo = f['geometry']
            polys = geo['coordinates'] if geo['type'] == 'MultiPolygon' else [geo['coordinates']]
            for poly in polys:
                anillo = [((x + 180) / self.PASO, (90 - y) / self.PASO) for x, y in poly[0]]
                if len(anillo) >= 3: dr.polygon(anillo, fill=i)
        self.px = im.load()

    # Natural Earth draws these territories inside the country they belong to (Guadeloupe inside France, Svalbard inside
    # Norway); «-99» is a place with no ISO code (Northern Cyprus, Somaliland, Kosovo): any code is accepted there
    DENTRO = {'GP': 'FR', 'MQ': 'FR', 'GF': 'FR', 'RE': 'FR', 'YT': 'FR', 'SJ': 'NO', 'BV': 'NO', 'BQ': 'NL', 'CX': 'AU', 'CC': 'AU',
              'UM': 'US', 'IC': 'ES', 'EA': 'ES', 'XK': 'RS'}

    def vale(self, cc, s):
        return not s or cc in s or self.DENTRO.get(cc) in s or '-99' in s

    def en(self, lon, lat, r=0):
        x, y = int((lon + 180) / self.PASO), int((90 - lat) / self.PASO)
        s = set()
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                v = self.px[(x + dx) % self.W, min(self.H - 1, max(0, y + dy))]
                if v: s.add(self.cc[v])
        return s


def main():
    tierra = Tierra()
    paises = Paises(os.path.join(sys.argv[1], 'ne_10m_admin_0_countries.geojson')) if len(sys.argv) > 1 and os.path.isdir(sys.argv[1]) else None
    errores = collections.defaultdict(list)

    # ── points
    P = json.load(open(os.path.join(DATOS, 'puntos.json'), encoding='utf-8'))
    E = json.load(open(os.path.join(DATOS, 'puntos-extra.json'), encoding='utf-8'))
    todos = [('puntos', i, p[0], p[1], p[2], p[3], p[4] if len(p) > 4 else '', '') for i, p in enumerate(P['puntos'])]
    todos += [('extra', i, p['lon'], p['lat'], p.get('clase') or p['tipo'], p['nombre'], p.get('operador', ''), p.get('pais', ''))
              for i, p in enumerate(E['puntos'])]
    for f, i, lon, lat, tipo, nom, op, cc in todos:
        if not (-180 <= lon <= 180 and -90 <= lat <= 90):
            errores['punto fuera del planeta'].append((f, i, tipo, nom, lon, lat)); continue
        if tipo == 'plataforma': continue
        if not tierra.es(lon, lat, 1):  # more than ~3 km from any land pixel
            errores['punto en el mar'].append((f, i, tipo, nom, op, lon, lat))
    # duplicates
    por_nombre = collections.defaultdict(list)
    for t in todos: por_nombre[(t[4], t[5].strip().lower())].append(t)
    for (tipo, n), ts in por_nombre.items():
        if not n or len(ts) < 2: continue
        for a in range(len(ts)):
            for b in range(a + 1, len(ts)):
                if km(ts[a][2:4], ts[b][2:4]) < 1:
                    errores['duplicado (mismo nombre a menos de 1 km)'].append((ts[a][0], ts[a][1], ts[b][0], ts[b][1], tipo, ts[a][5]))
    exactos = collections.defaultdict(list)
    for t in todos: exactos[(round(t[2], 4), round(t[3], 4), t[4])].append(t)
    for k, ts in exactos.items():
        if len(ts) > 1 and len({t[5] for t in ts}) > 1:
            errores['mismo sitio exacto, varios nombres'].append((k, [t[5] for t in ts]))

    # ── country check: lugares-capas «centros» carry a country code
    if paises:
        L = json.load(open(os.path.join(DATOS, 'lugares-capas.json'), encoding='utf-8'))
        for c in L['centros']:
            lon, lat, nombre, cc = c[0], c[1], c[2], c[3]
            if not cc: continue
            s = paises.en(lon, lat, 3)
            if not paises.vale(cc, s):
                errores['centro de datos con el país equivocado'].append((nombre, cc, sorted(s), lon, lat))
        for c in L['llegadas']:
            lon, lat, nombre, cc = c[0], c[1], c[2], c[3]
            if not cc: continue
            s = paises.en(lon, lat, 4)
            if not paises.vale(cc, s):
                errores['llegada de cable con el país equivocado'].append((nombre, cc, sorted(s), lon, lat))
        for p in E['puntos']:
            cc = p.get('pais')
            if not cc: continue
            s = paises.en(p['lon'], p['lat'], 3)
            if not paises.vale(cc, s):
                errores['punto extra con el país equivocado'].append((p['nombre'], cc, sorted(s)))

    # ── cities
    C = json.load(open(os.path.join(DATOS, 'ciudades.json'), encoding='utf-8'))
    for c in C['c']:
        if not c[4]: errores['ciudad sin nombre'].append(c[:4])
        elif not tierra.es(c[0], c[1], 2): errores['ciudad en el mar'].append((c[4], c[0], c[1]))

    # ── satellites
    S = json.load(open(os.path.join(DATOS, 'satelites.json'), encoding='utf-8'))
    k = {n: i for i, n in enumerate(S['campos'])}
    ahora = datetime.datetime.fromisoformat(S['descargado'].replace('Z', '+00:00')).replace(tzinfo=None)
    vistos = collections.Counter(s[k['norad']] for s in S['sat'])
    for n, v in vistos.items():
        if v > 1: errores['satélite repetido'].append((n, v))
    grupos = [g['nombre'] for g in S['grupos']]
    viejo = collections.Counter(); cayendo = collections.Counter()
    for s in S['sat']:
        mm, e = s[k['MEAN_MOTION']], s[k['ECCENTRICITY']]
        if not (0.9 <= mm <= 17) or not (0 <= e < 1) or not (0 <= s[k['INCLINATION']] <= 180):
            errores['satélite con elementos imposibles'].append((s[k['nombre']], s[k['norad']], mm, e))
        if mm > 16.3: cayendo[grupos[s[k['grupo']]]] += 1
        ep = datetime.datetime.fromisoformat(s[k['EPOCH']][:19])
        if (ahora - ep).days > 30: viejo[grupos[s[k['grupo']]]] += 1
    if cayendo: errores['satélites ya cayendo (>16,3 vueltas/día), por grupo'].append(dict(cayendo))
    if viejo: errores['satélites con elementos de más de 30 días, por grupo'].append(dict(viejo))

    for t, l in errores.items():
        print('\n## %s: %d' % (t, len(l)))
        for x in (l if '--todo' in sys.argv else l[:60]): print('  ', x)
    if not errores: print('sin errores')


if __name__ == '__main__':
    main()
