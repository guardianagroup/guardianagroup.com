#!/usr/bin/env python3
"""Ronda 35 · lleva las decisiones a orbita/datos/puntos-extra.json (25 Oct 2026).

Cada centro de datos de lista.json (los de la agencia que estaban en el centro de la ciudad):
  · dos voces dan la misma dirección y OpenStreetMap la sitúa → se mueve ahí, con «direccion», sin «aprox»;
  · dos voces lo ponen en la misma zona (a menos de 1,5 km) → se mueve ahí, «aprox»: 2 (a menos de 2 km);
  · sin acuerdo → se queda donde estaba, «aprox»: 1 (solo se sabe la ciudad).
Después, un centro de la agencia que queda a menos de 1 km de uno de OpenStreetMap con el mismo nombre se quita: el de
OpenStreetMap es el edificio.
"""
import json, os, re, unicodedata, math

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
EXTRA = os.path.join(RAIZ, 'orbita', 'datos', 'puntos-extra.json')


def km(a, b):
    la1, la2 = math.radians(a[1]), math.radians(b[1])
    d = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(math.radians(b[0] - a[0]) / 2) ** 2
    return 12742 * math.asin(min(1, math.sqrt(d)))


def pliega(s):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower())


def main():
    lista = json.load(open(os.path.join(AQUI, 'lista.json'), encoding='utf-8'))
    dec = json.load(open(os.path.join(AQUI, 'decisiones.json'), encoding='utf-8'))
    E = json.load(open(EXTRA, encoding='utf-8'))
    P = E['puntos']
    n = {'direccion': 0, 'zona': 0, 'ciudad': 0}
    for k, x in enumerate(lista, 1):
        p = P[x['i']]
        assert p['nombre'] == x['nombre'], (p['nombre'], x['nombre'])
        d = dec.get(str(k))
        if d and d['precision'].startswith('direccion'):
            p['lon'], p['lat'] = round(d['lon'], 5), round(d['lat'], 5)
            p['direccion'] = d['dir']; p.pop('aprox', None); p['ronda'] = 35; n['direccion'] += 1
        elif d:
            p['lon'], p['lat'] = round(d['lon'], 5), round(d['lat'], 5)
            p['aprox'] = 2; p.pop('direccion', None); p['ronda'] = 35; n['zona'] += 1
        else:
            p['aprox'] = 1; p.pop('direccion', None); n['ciudad'] += 1
    # an agency data centre on top of OpenStreetMap's own building of the same name
    osm = json.load(open(os.path.join(RAIZ, 'orbita', 'datos', 'puntos.json'), encoding='utf-8'))['puntos']
    fuera = []
    for i, p in enumerate(P):
        if p.get('tipo') != 'datos': continue
        a = pliega(p['nombre'])
        for q in osm:
            if q[2] != 'datos': continue
            b = pliega(q[3])
            if len(a) >= 6 and len(b) >= 6 and (a in b or b in a) and km((p['lon'], p['lat']), (q[0], q[1])) < 1.5:
                fuera.append((i, p['nombre'], q[3])); break
    for i, a, b in sorted(fuera, reverse=True):
        del P[i]
    json.dump(E, open(EXTRA, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('dirección confirmada:', n['direccion'], '· zona (a menos de 2 km):', n['zona'], '· solo la ciudad:', n['ciudad'])
    print('quitados por estar ya en OpenStreetMap:', [(a, b) for _, a, b in fuera])


if __name__ == '__main__':
    main()
