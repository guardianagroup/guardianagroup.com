#!/usr/bin/env python3
"""Que cada cable llegue a tierra (25 Oct 2026, 19:01, dueño: «cuando hago bastante zoom, los cables no llegan a tierra»).

Con la costa de OpenStreetMap (costa_osm.py, teselas de 1°) se ve que muchos cables acaban unos cientos de metros o unos
kilómetros antes de la orilla: los de la agencia, porque su trazado por mar se hizo sobre una máscara de 2,4 km; los de
OpenStreetMap, porque el tramo submarino a veces se corta en la playa de otra forma. Esto mira cada extremo de
orbita/datos/cables.json: si está en el agua a menos de 8 km de tierra y no es la unión con otro trozo del mismo cable,
lo alarga en línea recta hasta el punto de la orilla más cercano (una recta hasta el punto más cercano nunca cruza tierra)
y 25 m tierra adentro. Lo que ya está en tierra no se toca, así que se puede pasar las veces que haga falta.

Uso: python3 herramientas/llegadas_tierra.py [--prueba]   (--prueba: solo cuenta, no escribe)
Va después de cables_agencia.py y antes de lugares_capas.py.
"""
import json, math, os, sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CABLES = os.path.join(RAIZ, 'orbita', 'datos', 'cables.json')
COSTA = os.path.join(RAIZ, 'orbita', 'static', 'tierra', 'costa-osm')
MAX_M = 8000      # más lejos, el dato abierto se acaba en el mar: no se inventa el resto
DENTRO_M = 25     # un poco tierra adentro, para que se vea que toca tierra
UNION_M = 300     # otro trozo del mismo cable tan cerca: es una unión, no una llegada


class Costa:
    def __init__(self, carpeta):
        self.d = carpeta
        i = json.load(open(os.path.join(carpeta, 'indice.json')))
        self.T, self.A, self.L = set(i['teselas']), set(i['agua']), set(i['tierra'])
        self.cache = {}

    @staticmethod
    def clave(c, f):
        return '%d_%d' % (c % 360, f)

    def anillos(self, c, f):
        k = self.clave(c, f)
        if k in self.cache: return self.cache[k]
        x0, y1 = (c % 360) - 180, 90 - f
        rs = []
        if k in self.L:
            rs = [[(x0, y1), (x0 + 1, y1), (x0 + 1, y1 - 1), (x0, y1 - 1)]]
        elif k in self.T:
            for r in json.load(open(os.path.join(self.d, k + '.json')))['r']:
                ix, iy = r[0], r[1]; pts = [(x0 + ix / 1e5, y1 - iy / 1e5)]
                for i in range(2, len(r), 2):
                    ix += r[i]; iy += r[i + 1]; pts.append((x0 + ix / 1e5, y1 - iy / 1e5))
                rs.append(pts)
        self.cache[k] = rs
        return rs

    def conocida(self, x, y):
        c, f = int(math.floor(x + 180)), int(math.floor(90 - y))
        k = self.clave(c, f)
        return k in self.T or k in self.A or k in self.L

    def en_tierra(self, x, y):
        c, f = int(math.floor(x + 180)), int(math.floor(90 - y))
        w = 0
        for pts in self.anillos(c, f):
            n = len(pts)
            for i in range(n):
                (ax, ay), (bx, by) = pts[i], pts[(i + 1) % n]
                if (ay > y) != (by > y):
                    if ax + (y - ay) * (bx - ax) / (by - ay) > x: w += 1 if by > ay else -1
        return w != 0

    def orilla(self, x, y):
        """(metros, (lon, lat)) del punto de costa más cercano en la celda y sus vecinas"""
        c, f = int(math.floor(x + 180)), int(math.floor(90 - y))
        k = math.cos(math.radians(y)); best, bp = 1e18, None
        for dc in (-1, 0, 1):
            for df in (-1, 0, 1):
                if not 0 <= f + df < 180: continue
                for pts in self.anillos(c + dc, f + df):
                    n = len(pts)
                    for i in range(n):
                        (ax, ay), (bx, by) = pts[i], pts[(i + 1) % n]
                        # x unwrapped around the point (cells across the antimeridian)
                        ax += 360 * round((x - ax) / 360); bx += 360 * round((x - bx) / 360)
                        dx, dy = (bx - ax) * k, by - ay; L = dx * dx + dy * dy
                        t = 0 if L == 0 else max(0, min(1, ((x - ax) * k * dx + (y - ay) * dy) / L))
                        px, py = ax + t * (bx - ax), ay + t * (by - ay)
                        d = ((px - x) * k) ** 2 + (py - y) ** 2
                        if d < best: best, bp = d, (px, py)
        return (math.sqrt(best) * 111320 if bp else None), bp


def m_entre(a, b):
    k = math.cos(math.radians((a[1] + b[1]) / 2))
    return math.hypot((a[0] - b[0]) * k, a[1] - b[1]) * 111320


def main():
    prueba = '--prueba' in sys.argv
    if not os.path.exists(os.path.join(COSTA, 'indice.json')):
        print('Sin costa de OpenStreetMap (costa_osm.py): no se toca nada.'); return
    costa = Costa(COSTA)
    cab = json.load(open(CABLES, encoding='utf-8'))
    cs = cab['cables']
    nombre = lambda s: (s.get('w') or (s.get('n') or '').strip().lower())
    extremos = [(i, j, s['l'][0] if j == 0 else s['l'][-1]) for i, s in enumerate(cs) if len(s.get('l') or []) >= 2 for j in (0, 1)]
    por_celda = {}
    for e in extremos: por_celda.setdefault((round(e[2][0], 1), round(e[2][1], 1)), []).append(e)
    cuenta = {'en tierra': 0, 'alargados': 0, 'lejos del agua (>8 km)': 0, 'uniones': 0, 'sin costa medida': 0}
    largos = []
    for i, j, q in extremos:
        s = cs[i]
        if not costa.conocida(q[0], q[1]): cuenta['sin costa medida'] += 1; continue
        if costa.en_tierra(q[0], q[1]): cuenta['en tierra'] += 1; continue
        vecinos = [e for dx in (-0.1, 0, 0.1) for dy in (-0.1, 0, 0.1) for e in por_celda.get((round(q[0] + dx, 1), round(q[1] + dy, 1)), [])]
        m, p = costa.orilla(q[0], q[1])
        if m is None or m > MAX_M: cuenta['lejos del agua (>8 km)'] += 1; continue
        # two pieces of one cable meeting at sea are joined on the page (capas.js); within 2 km of the shore both go to it
        if m > 2000 and any(e[0] != i and nombre(cs[e[0]]) and nombre(cs[e[0]]) == nombre(s) and m_entre(e[2], q) <= UNION_M for e in vecinos):
            cuenta['uniones'] += 1; continue
        if m < 2: cuenta['en tierra'] += 1; continue  # already on the shore line
        # 25 m inland, along the same direction
        k = math.cos(math.radians(p[1])); dx, dy = (p[0] - q[0]) * k, p[1] - q[1]; L = math.hypot(dx, dy) or 1e-12
        paso = DENTRO_M / 111320
        dentro = (p[0] + dx / L * paso / k, p[1] + dy / L * paso)
        if not costa.en_tierra(*dentro): dentro = p
        nuevo = [[round(p[0], 5), round(p[1], 5)], [round(dentro[0], 5), round(dentro[1], 5)]]
        if nuevo[0] == nuevo[1]: nuevo = nuevo[:1]
        if j == 1: s['l'] = s['l'] + nuevo
        else: s['l'] = nuevo[::-1] + s['l']
        cuenta['alargados'] += 1; largos.append(m)
    largos.sort()
    print(cuenta, '· metros añadidos: mediana', round(largos[len(largos) // 2]) if largos else 0, '· máximo', round(largos[-1]) if largos else 0)
    if not prueba:
        with open(CABLES, 'w', encoding='utf-8') as f:
            json.dump(cab, f, ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    main()
