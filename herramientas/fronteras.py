#!/usr/bin/env python3
"""GUARDIANA · Órbita: country borders and the states or provinces inside them, to tell places apart when zoomed in.

Owner, 22 Oct 2026: «estoy en Estados Unidos y me cuesta mucho precisar entre unos y otros… quiero que me salgan
como divididos los estados». Source: Natural Earth (public domain), from its GitHub mirror
(nvkelso/natural-earth-vector): the 1:50m country boundary lines, the 1:10m state and province lines, and the
1:10m label points of those regions.

Output: orbita/datos/fronteras.json
  paises    [[lon, lat], …] lines, simplified to about 0.03°
  regiones  the same for states and provinces, simplified to about 0.02°
  nombres   [lon, lat, name, country code, rank] for every region (rank 2 = the big ones first), for the page to write
Usage: python3 herramientas/fronteras.py [folder with the three GeoJSON files]   (without it, clones the mirror)
"""
import json, os, subprocess, sys, tempfile

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'orbita', 'datos')
ARCHIVOS = ['ne_50m_admin_0_boundary_lines_land', 'ne_10m_admin_1_states_provinces_lines', 'ne_10m_admin_1_label_points']

def simplifica(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    dmax, idx = 0, 0
    dx, dy = b[0] - a[0], b[1] - a[1]
    n = (dx * dx + dy * dy) ** 0.5
    for i in range(1, len(pts) - 1):
        p = pts[i]
        d = abs(dx * (a[1] - p[1]) - (a[0] - p[0]) * dy) / n if n else ((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2) ** 0.5
        if d > dmax: dmax, idx = d, i
    if dmax > tol: return simplifica(pts[:idx + 1], tol)[:-1] + simplifica(pts[idx:], tol)
    return [a, b]

def lineas(geo, tol):
    out = []
    for f in geo['features']:
        g = f.get('geometry') or {}
        partes = [g['coordinates']] if g.get('type') == 'LineString' else g.get('coordinates', []) if g.get('type') == 'MultiLineString' else []
        for l in partes:
            l = simplifica([(round(x, 3), round(y, 3)) for x, y in l], tol)
            if len(l) >= 2: out.append([[x, y] for x, y in l])
    return out

def main():
    carpeta = sys.argv[1] if len(sys.argv) > 1 else None
    if not carpeta:
        carpeta = tempfile.mkdtemp()
        subprocess.run(['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--sparse', 'https://github.com/nvkelso/natural-earth-vector', carpeta], check=True)
        subprocess.run(['git', '-C', carpeta, 'sparse-checkout', 'set', '--no-cone'] + ['/geojson/%s.geojson' % a for a in ARCHIVOS], check=True)
        carpeta = os.path.join(carpeta, 'geojson')
    lee = lambda n: json.load(open(os.path.join(carpeta, n + '.geojson'), encoding='utf-8'))
    paises = lineas(lee(ARCHIVOS[0]), 0.03)
    regiones = lineas(lee(ARCHIVOS[1]), 0.02)
    # the label file holds several points per region (one per map scale): keep the best-ranked one of each
    mejor = {}
    for f in lee(ARCHIVOS[2])['features']:
        p = f.get('properties') or {}; g = f.get('geometry') or {}
        if g.get('type') != 'Point': continue
        n = p.get('name') or p.get('name_en') or ''
        cc = (p.get('iso_a2') or p.get('adm0_a3') or '')[:2]
        if not n: continue
        k = (p.get('adm1_code') or (n, cc)); sr = p.get('scalerank') or 99
        if k not in mejor or sr < mejor[k][0]: mejor[k] = (sr, [round(g['coordinates'][0], 2), round(g['coordinates'][1], 2), n, cc, sr])
    nombres = [v[1] for v in mejor.values()]
    out = {'fuente': 'Natural Earth (dominio público): fronteras 1:50m, estados y provincias 1:10m.', 'paises': paises, 'regiones': regiones, 'nombres': nombres}
    os.makedirs(RAIZ, exist_ok=True)
    with open(os.path.join(RAIZ, 'fronteras.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print('fronteras:', len(paises), 'líneas de países,', len(regiones), 'de regiones,', len(nombres), 'nombres;', os.path.getsize(os.path.join(RAIZ, 'fronteras.json')) // 1024, 'KB')

if __name__ == '__main__':
    main()
