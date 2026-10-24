#!/usr/bin/env python3
"""GUARDIANA · Órbita: the towns where the submarine cables reach land.

Owner, 23 Oct 2026, 23:39: «todo cable que llegue o termine, o sea, que empiece o termine en un pueblo, tiene que
aparecer el nombre… no hace falta todos los pueblos del mundo, si solamente donde llega el cable y donde sale».

The city list that travels with Órbita (GeoNames cities15000) only knows places of 15,000 people or more, so a cable
that lands in a small town took the name of the nearest big one. This reads GeoNames cities500 (CC BY 4.0,
https://download.geonames.org/export/dump/cities500.zip: every populated place of more than 500 people and every seat
of an administrative division) and keeps only the places less than 25 km from the end of a cable in
orbita/datos/cables.json. It writes orbita/static/tierra/pueblos-cables.tsv (name, country, latitude, longitude,
population), which lugares_capas.py uses to name each landing. Districts of a city (PPLX) and historical, abandoned or
destroyed places are left out.

Run by .github/workflows/pueblos-cables.yml (the download is not reachable from every machine):
    python3 herramientas/pueblos_cables.py /tmp/geonames/cities500.txt
"""
import collections, json, math, os, sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'orbita')
RADIO_KM = 25
FUERA = {'PPLX', 'PPLH', 'PPLQ', 'PPLW', 'PPLCH'}

def km(la1, lo1, la2, lo2):
    p1, p2 = math.radians(la1), math.radians(la2)
    dp, dl = p2 - p1, math.radians(lo2 - lo1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371.0 * 2 * math.asin(min(1.0, math.sqrt(a)))

def extremos():
    cab = json.load(open(os.path.join(RAIZ, 'datos', 'cables.json'), encoding='utf-8'))
    out = []
    for s in cab['cables']:
        for lo, la in (s['l'][0], s['l'][-1]):
            out.append((la, lo))
    # the planned cables name their landings too (datos/cables-previstos.json), when the file is there
    try:
        pv = json.load(open(os.path.join(RAIZ, 'datos', 'cables-previstos.json'), encoding='utf-8'))
        for c in pv.get('cables', []):
            for l in c.get('llegadas', []) or []:
                if isinstance(l, (list, tuple)) and len(l) >= 2 and all(isinstance(x, (int, float)) for x in l[:2]):
                    out.append((l[1], l[0]))
    except (OSError, ValueError):
        pass
    return out

def main(ruta):
    celdas = collections.defaultdict(list)
    for la, lo in extremos():
        celdas[(math.floor(la), math.floor(lo))].append((la, lo))
    def cerca(la, lo):
        for i in (-1, 0, 1):
            for j in (-1, 0, 1):
                for la2, lo2 in celdas.get((math.floor(la) + i, (math.floor(lo) + j + 180) % 360 - 180), ()):
                    if km(la, lo, la2, lo2) <= RADIO_KM:
                        return True
        return False
    lugares, vistos = [], set()
    with open(ruta, encoding='utf-8') as f:
        for l in f:
            c = l.rstrip('\n').split('\t')
            if len(c) < 15 or c[6] != 'P' or c[7] in FUERA:
                continue
            la, lo = float(c[4]), float(c[5])
            if not cerca(la, lo):
                continue
            clave = (c[1], c[8], round(la, 3), round(lo, 3))
            if clave in vistos:
                continue
            vistos.add(clave)
            lugares.append((c[1], c[8], round(la, 4), round(lo, 4), int(c[14] or 0)))
    lugares.sort(key=lambda x: (-x[4], x[0]))
    destino = os.path.join(RAIZ, 'static', 'tierra', 'pueblos-cables.tsv')
    with open(destino, 'w', encoding='utf-8') as f:
        f.write('# GeoNames cities500, CC BY 4.0, https://www.geonames.org — solo los lugares a menos de %d km del extremo de un cable: nombre, país, lat, lon, población\n' % RADIO_KM)
        for n, cc, la, lo, pob in lugares:
            f.write(f'{n}\t{cc}\t{la}\t{lo}\t{pob}\n')
    print(f'{len(lugares)} lugares junto a los extremos de los cables → {destino}')

if __name__ == '__main__':
    if len(sys.argv) < 2 or not os.path.exists(sys.argv[1]):
        sys.exit('uso: pueblos_cables.py /ruta/a/cities500.txt')
    main(sys.argv[1])
