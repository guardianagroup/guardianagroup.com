#!/usr/bin/env python3
"""GUARDIANA · Órbita: the narrow waters that close at the scale of the cable tracer's land mask (25 Oct 2026).

Revisión completa del dueño («No puede haber ningún error»): on Natural Earth 10m land rasterised at 0.025° (about
2.7 km, herramientas/fuentes/tierra-ne10m.png) a fjord, an inlet or an estuary narrower than a couple of pixels is shut,
so a cable that lands at its head (Narvik, Port Alberni, Douala, Juneau) cannot be traced out to sea and its line runs
over the land. This finds every landing whose nearest water is such a closed pocket and traces, on the same Natural
Earth land drawn ten times finer (0.0025°, about 270 m) in a box around it, the way by water from the landing to the
open sea. The ways are saved to herramientas/fuentes/pasos-finos.json, and cables_agencia.py opens them in its mask
(one pixel wide, so no isthmus is cut).

Usage: python3 herramientas/pasos_finos.py <folder with ne_10m_land.geojson and ne_10m_minor_islands.geojson>
Run it again when landings are added (cables-agencia.json, cables.json).
"""
import collections, heapq, json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
P = 0.025          # the tracer's mask
F = 0.0025         # the fine grid for the passages
ABIERTO = 6000     # a water pocket bigger than this (pixels of the coarse mask, ~44,000 km²) is the open sea


def km(la1, lo1, la2, lo2):
    p = math.pi / 180
    a = math.sin((la2 - la1) * p / 2) ** 2 + math.cos(la1 * p) * math.cos(la2 * p) * math.sin((lo2 - lo1) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(min(1, a)))


class Gruesa:
    def __init__(self):
        from PIL import Image
        Image.MAX_IMAGE_PIXELS = None
        im = Image.open(os.path.join(AQUI, 'fuentes', 'tierra-ne10m.png')).convert('L')
        self.W, self.H = im.size
        self.m = im.tobytes()

    def px(self, lo, la):
        return int(((lo + 180) % 360) / P) % self.W, min(self.H - 1, max(0, int((90 - la) / P)))

    def agua(self, x, y):
        return self.m[y * self.W + (x % self.W)] < 128

    def bolsa(self, x, y):
        """the water pixels connected to (x, y), up to ABIERTO; None when it is bigger (the open sea)"""
        vistos, cola = {(x, y)}, collections.deque([(x, y)])
        while cola:
            cx, cy = cola.popleft()
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
                nx, ny = (cx + dx) % self.W, cy + dy
                if 0 <= ny < self.H and (nx, ny) not in vistos and self.agua(nx, ny):
                    vistos.add((nx, ny)); cola.append((nx, ny))
                    if len(vistos) > ABIERTO: return None
        return vistos

    def agua_cerca(self, lo, la, r_km=6):
        x0, y0 = self.px(lo, la)
        mejor, dm = None, 1e9
        r = int(r_km / (111 * P)) + 1
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                x, y = (x0 + dx) % self.W, y0 + dy
                if 0 <= y < self.H and self.agua(x, y):
                    d = dx * dx + dy * dy
                    if d < dm: mejor, dm = (x, y), d
        return mejor


class Fina:
    """Natural Earth land drawn at 0.0025° inside a box, from the polygons whose bounds touch it"""
    def __init__(self, carpeta):
        self.polis = []
        for f in ('ne_10m_land.geojson', 'ne_10m_minor_islands.geojson'):
            for ft in json.load(open(os.path.join(carpeta, f), encoding='utf-8'))['features']:
                g = ft['geometry']
                for p in (g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]):
                    xs = [q[0] for q in p[0]]; ys = [q[1] for q in p[0]]
                    self.polis.append(((min(xs), min(ys), max(xs), max(ys)), p))

    def caja(self, lo0, la0, lo1, la1):
        from PIL import Image, ImageDraw
        w, h = int((lo1 - lo0) / F) + 1, int((la1 - la0) / F) + 1
        im = Image.new('1', (w, h), 0); d = ImageDraw.Draw(im)
        xy = lambda an: [((x - lo0) / F, (la1 - y) / F) for x, y in an]
        for (a, b, c, e), p in self.polis:
            if c < lo0 or a > lo1 or e < la0 or b > la1: continue
            d.polygon(xy(p[0]), fill=1)
            for hueco in p[1:]: d.polygon(xy(hueco), fill=0)
        return im.load(), w, h


def simplifica(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; n = math.hypot(dx, dy)
    dmax, k = 0.0, 0
    for i in range(1, len(pts) - 1):
        q = pts[i]
        d = abs(dx * (a[1] - q[1]) - (a[0] - q[0]) * dy) / n if n else math.hypot(q[0] - a[0], q[1] - a[1])
        if d > dmax: dmax, k = d, i
    if dmax > tol: return simplifica(pts[:k + 1], tol)[:-1] + simplifica(pts[k:], tol)
    return [a, b]


def llegadas():
    out = {}
    ag = json.load(open(os.path.join(RAIZ, 'orbita', 'datos', 'cables-agencia.json'), encoding='utf-8'))
    for c in ag['cables']:
        for L in c['llegadas']:
            out[(round(L['lon'], 2), round(L['lat'], 2))] = '%s (%s)' % (L['lugar'], L['cc'])
    cab = json.load(open(os.path.join(RAIZ, 'orbita', 'datos', 'cables.json'), encoding='utf-8'))
    for s in cab['cables']:
        if s.get('src') == 'agencia': continue
        for lo, la in (s['l'][0], s['l'][-1]):
            out.setdefault((round(lo, 2), round(la, 2)), s.get('n') or 'OSM')
    return out


# straits narrower than the tracer's pixel that whole oceans' cables pass through: the way by water between two points,
# traced on the fine grid (the Suez and Panama canals are narrower still and stay hand-drawn in cables_agencia.py)
ESTRECHOS = {'Bósforo': ((29.16, 41.26), (28.97, 40.97)), 'Dardanelos': ((26.80, 40.47), (26.10, 39.98)),
             'Kanmon': ((130.86, 33.93), (131.05, 33.93)), 'Messina': ((15.63, 38.30), (15.60, 38.10))}


def estrecho(fino, a, b):
    lo0, lo1 = min(a[0], b[0]) - 0.3, max(a[0], b[0]) + 0.3
    la0, la1 = min(a[1], b[1]) - 0.3, max(a[1], b[1]) + 0.3
    m, w, h = fino.caja(lo0, la0, lo1, la1)
    geo = lambda x, y: (lo0 + (x + 0.5) * F, la1 - (y + 0.5) * F)
    pix = lambda p: (int((p[0] - lo0) / F), int((la1 - p[1]) / F))
    ini, fin = pix(a), pix(b)
    if m[ini] or m[fin]: return None
    dist = {ini: 0.0}; de = {ini: None}; cola = [(0.0, ini)]
    while cola:
        d, (x, y) = heapq.heappop(cola)
        if (x, y) == fin: break
        if d > dist.get((x, y), 1e18): continue
        for dx, dy, c in ((1, 0, 1), (-1, 0, 1), (0, 1, 1), (0, -1, 1), (1, 1, 1.4142), (1, -1, 1.4142), (-1, 1, 1.4142), (-1, -1, 1.4142)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not m[nx, ny]:
                nd = d + c
                if nd < dist.get((nx, ny), 1e18): dist[(nx, ny)] = nd; de[(nx, ny)] = (x, y); heapq.heappush(cola, (nd, (nx, ny)))
    if fin not in de: return None
    cam, q = [], fin
    while q is not None: cam.append(geo(*q)); q = de[q]
    return [[round(x, 4), round(y, 4)] for x, y in simplifica(cam[::-1], F * 1.5)]


def main():
    G = Gruesa(); fino = Fina(sys.argv[1])
    ruta = os.path.join(AQUI, 'fuentes', 'pasos-finos.json')
    pasos = json.load(open(ruta, encoding='utf-8'))['pasos'] if os.path.exists(ruta) else {}
    for nombre, (a, b) in ESTRECHOS.items():
        if nombre in pasos: continue
        c = estrecho(fino, a, b)
        if c: pasos[nombre] = c; print('  estrecho:', nombre, len(c), 'puntos')
        else: print('  estrecho sin paso a esta escala:', nombre)
    hechos, cerradas, sin_salida = 0, 0, []
    vistas = set()
    for (lo, la), nombre in sorted(llegadas().items()):
        a = G.agua_cerca(lo, la)
        if not a or a in vistas: continue
        bolsa = G.bolsa(*a)
        if bolsa is None: continue
        vistas |= bolsa
        cerradas += 1
        clave = '%s %.2f,%.2f' % (nombre, lo, la)
        if any(abs(p[0][0] - lo) < 0.05 and abs(p[0][1] - la) < 0.05 for p in pasos.values()): continue
        # the fine box: around the landing, growing until a way out is found
        camino = None
        for r in (0.6, 1.2, 2.0):
            rl = r / max(0.25, math.cos(math.radians(la)))
            lo0, lo1, la0, la1 = lo - rl, lo + rl, la - r * 0.6, la + r * 0.6
            m, w, h = fino.caja(lo0, la0, lo1, la1)
            geo = lambda x, y: (lo0 + (x + 0.5) * F, la1 - (y + 0.5) * F)
            # start: the fine water pixel nearest to the landing
            sx, sy = int((lo - lo0) / F), int((la1 - la) / F)
            ini = None
            for rr in range(0, 40):
                for dx in range(-rr, rr + 1):
                    for dy in (-rr, rr) if abs(dx) != rr else range(-rr, rr + 1):
                        x, y = sx + dx, sy + dy
                        if 0 <= x < w and 0 <= y < h and not m[x, y]: ini = (x, y); break
                    if ini: break
                if ini: break
            if not ini: break
            # goal: a fine water pixel whose coarse pixel is open water (outside the pocket)
            def meta(x, y):
                glo, gla = geo(x, y); gx, gy = G.px(glo, gla)
                return G.agua(gx, gy) and (gx, gy) not in bolsa
            dist = {ini: 0.0}; de = {ini: None}; cola = [(0.0, ini)]; fin = None
            while cola:
                d, (x, y) = heapq.heappop(cola)
                if d > dist.get((x, y), 1e18): continue
                if meta(x, y):
                    # a few pixels beyond, so the passage reaches well into the open water
                    fin = (x, y); break
                for dx, dy, c in ((1, 0, 1), (-1, 0, 1), (0, 1, 1), (0, -1, 1), (1, 1, 1.4142), (1, -1, 1.4142), (-1, 1, 1.4142), (-1, -1, 1.4142)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and not m[nx, ny]:
                        nd = d + c
                        if nd < dist.get((nx, ny), 1e18): dist[(nx, ny)] = nd; de[(nx, ny)] = (x, y); heapq.heappush(cola, (nd, (nx, ny)))
            if fin:
                cam, q = [], fin
                while q is not None: cam.append(geo(*q)); q = de[q]
                camino = simplifica(cam[::-1], F * 1.5)
                break
        if camino:
            pasos[clave] = [[round(x, 4), round(y, 4)] for x, y in camino]
            hechos += 1
            print('  paso abierto: %s · %d puntos · %.0f km' % (clave, len(camino), sum(km(a[1], a[0], b[1], b[0]) for a, b in zip(camino, camino[1:]))))
        else:
            sin_salida.append(clave)
    json.dump({'fuente': 'Natural Earth 10m (dominio público), trazado a 0,0025° por herramientas/pasos_finos.py', 'pasos': pasos},
              open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('llegadas en agua cerrada a la escala del trazador:', cerradas, '· pasos nuevos:', hechos, '· sin salida (lagos, rías cerradas también en Natural Earth):', len(sin_salida))
    for s in sin_salida[:40]: print('   ', s)


if __name__ == '__main__':
    main()
