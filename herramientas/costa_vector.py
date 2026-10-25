#!/usr/bin/env python3
"""La costa en vectores para el planeta gris de Órbita al acercar (25 Oct 2026, dueño: «sí» a la costa nítida).

La máscara de tierra de 16K (tierra_16k.py) tiene píxeles de unos 2,4 km: desde ×40 la costa se ve en escalera. Esto
corta los polígonos de tierra de Natural Earth 10m (ne_10m_land y ne_10m_minor_islands, dominio público) en teselas de
10° × 10° y los guarda como anillos de enteros (1e-4 grados, en diferencias), para que orbita.js pinte la máscara de la
ventana visible a la resolución de la pantalla.

Uso: python3 herramientas/costa_vector.py <carpeta con los geojson de Natural Earth>
Escribe orbita/static/tierra/costa/<columna>_<fila>.json (columna 0 = 180° O, fila 0 = 90° N) e indice.json.
"""
import json, os, sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SALIDA = os.path.join(RAIZ, 'orbita', 'static', 'tierra', 'costa')
T = 10          # grados por tesela
Q = 10000       # enteros por grado


def recorta(anillo, x0, y0, x1, y1):
    """Sutherland-Hodgman contra el rectángulo; vale para pintar con la regla par-impar"""
    def corta(pts, dentro, cruce):
        out = []
        if not pts: return out
        prev = pts[-1]
        for p in pts:
            if dentro(p):
                if not dentro(prev): out.append(cruce(prev, p))
                out.append(p)
            elif dentro(prev):
                out.append(cruce(prev, p))
            prev = p
        return out
    def en_x(x):
        return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))
    def en_y(y):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)
    p = anillo
    p = corta(p, lambda q: q[0] >= x0, en_x(x0))
    p = corta(p, lambda q: q[0] <= x1, en_x(x1))
    p = corta(p, lambda q: q[1] >= y0, en_y(y0))
    p = corta(p, lambda q: q[1] <= y1, en_y(y1))
    return p


def anillos(geo):
    for f in geo['features']:
        g = f['geometry']
        if not g: continue
        polis = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates'] if g['type'] == 'MultiPolygon' else []
        for poli in polis:
            for r in poli:
                yield [(float(x), float(y)) for x, y in r]


def main():
    carpeta = sys.argv[1]
    todos = []
    for n in ('ne_10m_land.geojson', 'ne_10m_minor_islands.geojson'):
        todos += list(anillos(json.load(open(os.path.join(carpeta, n), encoding='utf-8'))))
    teselas = {}
    for r in todos:
        xs = [p[0] for p in r]; ys = [p[1] for p in r]
        c0, c1 = int((min(xs) + 180) // T), int((max(xs) + 180) // T)
        f0, f1 = int((90 - max(ys)) // T), int((90 - min(ys)) // T)
        for c in range(max(0, c0), min(360 // T - 1, c1) + 1):
            for f in range(max(0, f0), min(180 // T - 1, f1) + 1):
                x0, x1 = c * T - 180, (c + 1) * T - 180
                y1, y0 = 90 - f * T, 90 - (f + 1) * T
                p = recorta(r, x0, y0, x1, y1)
                if len(p) < 3: continue
                ent, ux, uy = [], None, None
                for x, y in p:
                    ix, iy = round((x - x0) * Q), round((y1 - y) * Q)
                    if (ix, iy) == (ux, uy): continue
                    if ux is None: ent += [ix, iy]
                    else: ent += [ix - ux, iy - uy]
                    ux, uy = ix, iy
                if len(ent) >= 6: teselas.setdefault((c, f), []).append(ent)
    os.makedirs(SALIDA, exist_ok=True)
    for f in os.listdir(SALIDA):
        if f.endswith('.json'): os.remove(os.path.join(SALIDA, f))
    total = 0
    for (c, f), rs in teselas.items():
        s = json.dumps({'r': rs}, separators=(',', ':'))
        total += len(s)
        open(os.path.join(SALIDA, '%d_%d.json' % (c, f)), 'w').write(s)
    json.dump({'fuente': 'Natural Earth 10m (ne_10m_land, ne_10m_minor_islands), dominio público', 'grados': T, 'escala': Q,
               'teselas': sorted('%d_%d' % k for k in teselas)}, open(os.path.join(SALIDA, 'indice.json'), 'w'), separators=(',', ':'))
    print('teselas:', len(teselas), '· tamaño total:', round(total / 1e6, 1), 'MB · mayor:', max(len(json.dumps({'r': v})) for v in teselas.values()) // 1000, 'kB')


if __name__ == '__main__':
    main()
