#!/usr/bin/env python3
"""GUARDIANA · Órbita: cable ends that stop in open sea (owner, 24 Oct 2026, 20:31: «que todo llegue a los puntos correctos»).
An end is «en el mar» when it is over water on Natural Earth 10m (herramientas/fuentes/tierra-ne10m.png), more than
«lejos» km from any land, and no other segment end (of any cable) is within 8 km (a branching unit or the next piece).
Usage: python3 revisa_extremos.py [lejos_km]"""
import json, math, os, sys, collections
from PIL import Image
AQUI = os.path.dirname(os.path.abspath(__file__))
Image.MAX_IMAGE_PIXELS = None
im = Image.open(os.path.join(AQUI, 'fuentes', 'tierra-ne10m.png')).convert('L'); W, H = im.size; M = im.tobytes(); P = 360 / W
def tierra(lo, la):
    x = int(((lo + 180) % 360) / P) % W; y = min(H - 1, max(0, int((90 - la) / P))); return M[y * W + x] > 127
def dist_tierra(lo, la, maxkm=60):
    for r in range(1, int(maxkm / 2.7) + 1):
        for k in range(0, 360, 10):
            a = math.radians(k); d = r * P
            if tierra(lo + d * math.cos(a) / max(0.2, math.cos(math.radians(la))), la + d * math.sin(a)): return r * 2.7
    return maxkm
def km(la1, lo1, la2, lo2):
    p = math.pi / 180; a = math.sin((la2 - la1) * p / 2) ** 2 + math.cos(la1 * p) * math.cos(la2 * p) * math.sin((lo2 - lo1) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(min(1, a)))
lejos = float(sys.argv[1]) if len(sys.argv) > 1 else 15
cab = json.load(open(os.path.join(AQUI, '..', 'orbita', 'datos', 'cables.json'), encoding='utf-8'))['cables']
celdas = collections.defaultdict(list)
for i, s in enumerate(cab):
    for e in (s['l'][0], s['l'][-1]): celdas[(int(e[0] * 10), int(e[1] * 10))].append((i, e))
# every vertex of every cable, to tell an end that joins another cable mid-way (a branching unit on its trunk)
vert = collections.defaultdict(list)
for j, s_ in enumerate(cab):
    for q in s_['l']: vert[(int(q[0] * 10), int(q[1] * 10))].append((j, q))
def en_otro(i, e):
    cx, cy = int(e[0] * 10), int(e[1] * 10)
    return any(j != i and km(e[1], e[0], q[1], q[0]) < 2 for dx in (-1, 0, 1) for dy in (-1, 0, 1) for j, q in vert[(cx + dx, cy + dy)])
def vecino(i, e):
    cx, cy = int(e[0] * 10), int(e[1] * 10)
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for j, f in celdas[(cx + dx, cy + dy)]:
                if (j != i or f is not e) and km(e[1], e[0], f[1], f[0]) < 8: return True
    return False
# 25 Oct 2026: an end at an offshore platform (the map's own, datos/puntos-extra.json, or OpenStreetMap's Ringhorne and the
# second Grane jacket) is where the cable really ends: counted apart, within 8 km
PLAT = [(q['lon'], q['lat'], q['nombre']) for q in json.load(open(os.path.join(AQUI, '..', 'orbita', 'datos', 'puntos-extra.json'), encoding='utf-8'))['puntos'] if q.get('clase') == 'plataforma']
PLAT += [(2.448, 59.265, 'Ringhorne (OpenStreetMap)')]
en_plat = []
out = []
for i, s in enumerate(cab):
    for e in (s['l'][0], s['l'][-1]):
        if tierra(*e) or vecino(i, e) or en_otro(i, e): continue
        d = dist_tierra(*e)
        if d <= lejos: continue
        pl = min(PLAT, key=lambda q: km(e[1], e[0], q[1], q[0]))
        if km(e[1], e[0], pl[1], pl[0]) < 8: en_plat.append((s.get('n') or '?', pl[2], e)); continue
        out.append((s.get('n') or '?', s.get('src') or 'osm', round(d), e))
por = collections.defaultdict(list)
for n, src, d, e in out: por[(n, src)].append((d, e))
print(len(out), 'extremos en mar abierto (a más de %d km de tierra, sin otro tramo cerca), en %d cables' % (lejos, len(por)))
for (n, src), v in sorted(por.items(), key=lambda x: -max(d for d, _ in x[1])):
    print('  %-45s %-8s %s' % (n[:45], src, '; '.join('%s km en %s' % (d, e) for d, e in v)))
print(len(en_plat), 'extremos en una plataforma:', '; '.join('%s en %s' % (n, p) for n, p, _ in en_plat))
