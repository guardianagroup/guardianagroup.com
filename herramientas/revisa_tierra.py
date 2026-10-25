#!/usr/bin/env python3
"""GUARDIANA · Órbita: which submarine cable segments run over land, measured on Natural Earth 10m land (about 2 km).

Owner, 24 Oct 2026, 20:02, on H2HE drawn from Zhuhai to Hong Kong across Lantau: «Verifica si es correcto que llega hasta
ahí… Chequéalo todo». The agency's sea routes are traced on a 20 km mask (agua.png), which misses narrow land; this check
uses the 1:10m coastline instead.

Usage: python3 revisa_tierra.py <folder with ne_10m_land.geojson and ne_10m_minor_islands.geojson> [--osm]
Prints, per cable, the longest stretch over land that does not touch the ends of the segment (a cable crossing an island
or a peninsula) and the stretch at each end (a landing placed far inland). Only the agency's segments unless --osm.
"""
import json, math, os, sys
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
PASO = 0.02  # degrees per pixel (~2 km)
W, H = int(360 / PASO), int(180 / PASO)


def mapa(carpeta):
    im = Image.new('1', (W, H), 0)
    d = ImageDraw.Draw(im)
    def xy(anillo): return [((lo + 180) / PASO, (90 - la) / PASO) for lo, la in anillo]
    for f in ('ne_10m_land.geojson', 'ne_10m_minor_islands.geojson'):
        for ft in json.load(open(os.path.join(carpeta, f), encoding='utf-8'))['features']:
            g = ft['geometry']
            polis = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
            for p in polis:
                d.polygon(xy(p[0]), fill=1)
                for hueco in p[1:]: d.polygon(xy(hueco), fill=0)
    return im.load()


def km(la1, lo1, la2, lo2):
    p = math.pi / 180
    a = math.sin((la2 - la1) * p / 2) ** 2 + math.cos(la1 * p) * math.cos(la2 * p) * math.sin((lo2 - lo1) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(min(1, a)))


def tramos_tierra(px, linea):
    """[(start km, end km, touches start, touches end)] of the stretches over land, sampled every ~1 km"""
    pts, pos = [], 0.0
    for (lo1, la1), (lo2, la2) in zip(linea, linea[1:]):
        if lo2 - lo1 > 180: lo2 -= 360
        elif lo1 - lo2 > 180: lo2 += 360
        dk = km(la1, lo1, la2, lo2); n = max(1, int(dk))
        for j in range(n):
            f = j / n; lo = lo1 + (lo2 - lo1) * f; la = la1 + (la2 - la1) * f
            x = int(((lo + 180) % 360) / PASO) % W; y = min(H - 1, max(0, int((90 - la) / PASO)))
            pts.append((pos + dk * f, px[x, y]))
        pos += dk
    lo, la = linea[-1]
    pts.append((pos, px[int(((lo + 180) % 360) / PASO) % W, min(H - 1, max(0, int((90 - la) / PASO)))]))
    out, ini = [], None
    for k, t in pts:
        if t and ini is None: ini = k
        if not t and ini is not None: out.append((ini, k)); ini = None
    if ini is not None: out.append((ini, pos))
    return [(a, b, a <= 0.5, b >= pos - 0.5) for a, b in out], pos


def main():
    px = mapa(sys.argv[1])
    cab = json.load(open(os.path.join(AQUI, '..', 'orbita', 'datos', 'cables.json'), encoding='utf-8'))
    todos = '--osm' in sys.argv
    filas = []
    for s in cab['cables']:
        if s.get('src') != 'agencia' and not todos: continue
        t, largo = tramos_tierra(px, s['l'])
        medio = max([b - a for a, b, i, f in t if not i and not f] or [0])
        ini = max([b - a for a, b, i, f in t if i] or [0]); fin = max([b - a for a, b, i, f in t if f] or [0])
        if medio > 8 or ini > 25 or fin > 25:
            filas.append((max(medio, ini, fin), s.get('n') or '?', s.get('src') or 'osm', s.get('por', ''), round(medio), round(ini), round(fin),
                          round(largo), s.get('de'), s.get('a'), s['l'][0], s['l'][-1]))
    filas.sort(reverse=True)
    print(len(filas), 'tramos con tierra (en medio > 8 km, o un extremo > 25 km tierra adentro)')
    for f in filas:
        print('%-45s %-8s %-6s medio %4d · inicio %3d · final %3d · largo %5d · %s → %s' % (f[1][:45], f[2], f[3], f[4], f[5], f[6], f[7], f[8] or f[10], f[9] or f[11]))


if __name__ == '__main__':
    main()
