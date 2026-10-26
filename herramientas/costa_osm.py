#!/usr/bin/env python3
"""La costa de OpenStreetMap para el zoom cercano de Órbita (25 Oct 2026, 19:01, dueño: «los cables no llegan a tierra.
Hay que ser más preciso»).

Natural Earth 10m (costa_vector.py) se queda corta de cerca: en Cartagena no tiene Bocagrande ni Tierra Bomba y las
llegadas de los cables, bien puestas, caen en el agua. Esto corta los polígonos de tierra de OpenStreetMap
(land-polygons-split-4326, osmdata.openstreetmap.de, ODbL · © colaboradores de OpenStreetMap) en teselas de 1° × 1°
alrededor de los cables, sus llegadas y los centros de datos, simplificados a unos 9 m (un píxel con el zoom máximo,
unos 20 km de altura), y los guarda como anillos de enteros (1e-5 grados, en diferencias), como costa_vector.py.

Además mide cada llegada contra esa costa: herramientas/fuentes/llegadas-costa.json dice cuáles caen en el agua y a
cuántos metros de tierra.

Uso: python3 herramientas/costa_osm.py <carpeta de land-polygons-split-4326>
Escribe orbita/static/tierra/costa-osm/<columna>_<fila>.json (columna 0 = 180° O, fila 0 = 90° N, de 1°) e indice.json
(con «agua» y «tierra»: las celdas sin costa, enteras de mar o de tierra).
"""
import json, math, os, sys, time

import shapefile  # pyshp
from shapely.geometry import Polygon, MultiPolygon, Point, box, shape
from shapely.ops import unary_union
from shapely.geometry.polygon import orient
from shapely import affinity

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DATOS = os.path.join(RAIZ, 'orbita', 'datos')
SALIDA = os.path.join(RAIZ, 'orbita', 'static', 'tierra', 'costa-osm')
INFORME = os.path.join(RAIZ, 'herramientas', 'fuentes', 'llegadas-costa.json')
Q = 100000        # enteros por grado (1,1 m)
TOL = 0.0001      # grados (~11 m: un píxel con el zoom máximo en una pantalla de 1440 × 900)


def celda(lon, lat):
    return (int(math.floor(lon + 180)) % 360, min(179, max(0, int(math.floor(90 - lat)))))


def celdas_pedidas():
    pedidas, puntos = set(), []
    def pon(lon, lat, r=1):
        c, f = celda(lon, lat)
        for dc in range(-r, r + 1):
            for df in range(-r, r + 1):
                if 0 <= f + df < 180: pedidas.add(((c + dc) % 360, f + df))
    def linea(l):
        for (x0, y0), (x1, y1) in zip(l, l[1:]):
            n = max(1, int(max(abs(x1 - x0), abs(y1 - y0)) / 0.25))
            for i in range(n + 1):
                pon(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 0)
    lc = json.load(open(os.path.join(DATOS, 'lugares-capas.json'), encoding='utf-8'))
    for q in lc['llegadas']:
        pon(q[0], q[1]); puntos.append({'lon': q[0], 'lat': q[1], 'lugar': q[2], 'cc': q[3], 'de': 'llegada'})
    for q in lc['centros']:
        pon(q[0], q[1], 0)
    for c in json.load(open(os.path.join(DATOS, 'cables.json'), encoding='utf-8'))['cables']:
        if len(c['l']) > 1: linea(c['l'])
    ag = json.load(open(os.path.join(DATOS, 'cables-agencia.json'), encoding='utf-8'))
    for t in ag['tramos']:
        l = t['l']
        if len(l) > 1: linea(l)
        for i, q in ((0, l[0]), (1, l[-1])):
            pon(q[0], q[1])
            lado = t.get('de') if i == 0 else t.get('a')
            puntos.append({'lon': q[0], 'lat': q[1], 'lugar': (lado or ['', ''])[0], 'cc': (lado or ['', ''])[1], 'de': 'agencia', 'cable': t.get('n', '')})
    try:
        for c in json.load(open(os.path.join(DATOS, 'cables-previstos.json'), encoding='utf-8'))['cables']:
            l = c.get('l') or []
            if len(l) > 1: linea(l)
    except Exception:
        pass
    return pedidas, puntos


def anillos_enteros(g, x0, y1):
    """anillos exteriores en sentido antihorario y huecos en horario (para pintar con «nonzero»)"""
    out = []
    polis = [g] if isinstance(g, Polygon) else list(g.geoms) if hasattr(g, 'geoms') else []
    for p in polis:
        if not isinstance(p, Polygon) or p.is_empty: continue
        p = orient(p, 1.0)
        for r in [p.exterior] + list(p.interiors):
            ent, ux, uy = [], None, None
            for x, y in list(r.coords)[:-1]:
                ix, iy = round((x - x0) * Q), round((y1 - y) * Q)
                if (ix, iy) == (ux, uy): continue
                if ux is None: ent += [ix, iy]
                else: ent += [ix - ux, iy - uy]
                ux, uy = ix, iy
            if len(ent) >= 6: out.append(ent)
    return out


def main():
    carpeta = sys.argv[1]
    shp = [os.path.join(carpeta, f) for f in os.listdir(carpeta) if f.endswith('.shp')][0]
    pedidas, puntos = celdas_pedidas()
    print('celdas pedidas:', len(pedidas), '· puntos a medir:', len(puntos), flush=True)
    t0 = time.time()
    por_celda = {}
    lector = shapefile.Reader(shp)
    n = 0
    for i, s in enumerate(lector.iterShapes()):
        bx0, by0, bx1, by1 = s.bbox
        c0, f1 = celda(bx0, by0); c1, f0 = celda(bx1 - 1e-9, by1 - 1e-9)
        if bx1 - bx0 > 180: continue
        hit = [(c, f) for c in range(c0, c1 + 1) for f in range(f0, f1 + 1) if (c % 360, f) in pedidas]
        if not hit: continue
        g = shape(s.__geo_interface__)
        if not g.is_valid: g = g.buffer(0)
        for k in hit: por_celda.setdefault((k[0] % 360, k[1]), []).append(g)
        n += 1
    print('polígonos usados:', n, 'en', round(time.time() - t0), 's', flush=True)

    os.makedirs(SALIDA, exist_ok=True)
    for f in os.listdir(SALIDA):
        if f.endswith('.json'): os.remove(os.path.join(SALIDA, f))
    teselas, agua, tierra, total, mayor = [], [], [], 0, (0, '')
    geos = {}
    for (c, f) in sorted(pedidas):
        x0, y1 = c - 180, 90 - f
        caja = box(x0, y1 - 1, x0 + 1, y1)
        gs = por_celda.get((c, f))
        k = '%d_%d' % (c, f)
        if not gs: agua.append(k); continue
        g = unary_union([x.intersection(caja) for x in gs])
        g = g.buffer(0)
        if g.is_empty: agua.append(k); continue
        if g.area >= caja.area * 0.999999 and len(getattr(g, 'interiors', [])) == 0 and isinstance(g, Polygon): tierra.append(k); geos[(c, f)] = g; continue
        geos[(c, f)] = g
        gs2 = g.simplify(TOL, preserve_topology=True)
        rs = anillos_enteros(gs2, x0, y1)
        if not rs: agua.append(k); continue
        s = json.dumps({'r': rs}, separators=(',', ':'))
        open(os.path.join(SALIDA, k + '.json'), 'w').write(s)
        teselas.append(k); total += len(s); mayor = max(mayor, (len(s), k))
    json.dump({'fuente': 'OpenStreetMap, land-polygons-split-4326 (osmdata.openstreetmap.de) · ODbL 1.0 · © colaboradores de OpenStreetMap',
               'grados': 1, 'escala': Q, 'tolerancia_grados': TOL, 'teselas': teselas, 'agua': agua, 'tierra': tierra},
              open(os.path.join(SALIDA, 'indice.json'), 'w'), separators=(',', ':'))
    print('teselas con costa:', len(teselas), '· de agua:', len(agua), '· de tierra:', len(tierra),
          '· tamaño total:', round(total / 1e6, 1), 'MB · mayor:', mayor[1], mayor[0] // 1000, 'kB', flush=True)

    # each landing against the coast: on land, or how far from it
    inf = []
    for p in puntos:
        c, f = celda(p['lon'], p['lat'])
        g = geos.get((c, f))
        pt = Point(p['lon'], p['lat'])
        if g is not None and g.contains(pt):
            p['tierra'] = True; p['m'] = 0
        else:
            k = math.cos(math.radians(p['lat']))
            cerca = [geos[(cc % 360, ff)] for cc in range(c - 1, c + 2) for ff in range(f - 1, f + 2) if (cc % 360, ff) in geos]
            d = None
            for gg in cerca:
                ga = affinity.scale(gg, xfact=k, yfact=1, origin=(p['lon'], p['lat']))
                dd = ga.distance(pt) * 111320
                d = dd if d is None else min(d, dd)
            p['tierra'] = False; p['m'] = round(d) if d is not None else None
        inf.append(p)
    os.makedirs(os.path.dirname(INFORME), exist_ok=True)
    json.dump({'nota': 'Cada llegada de cable contra la costa de OpenStreetMap: «tierra» o metros hasta la orilla.',
               'llegadas': inf}, open(INFORME, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    enagua = [p for p in inf if not p['tierra']]
    print('llegadas en tierra:', len(inf) - len(enagua), '· en el agua:', len(enagua),
          '· a más de 200 m:', sum(1 for p in enagua if (p['m'] or 1e9) > 200), flush=True)


if __name__ == '__main__':
    main()
