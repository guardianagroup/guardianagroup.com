#!/usr/bin/env python3
"""Ronda 35 · decide la posición de cada centro de datos (25 Oct 2026).

Para cada voz, sus posiciones posibles: la dirección que da, situada con Nominatim (OpenStreetMap; geo-res-N.json, solo
resultados de calle o de edificio), y las coordenadas que escribe. Dos voces están de acuerdo cuando una posición de cada
una cae a menos de 1,5 km de una de la otra, y al menos una de las dos cita una fuente que no es PeeringDB, TeleGeography
ni submarinecablemap (regla del dueño). La posición final: la de un edificio situado por Nominatim que esté de acuerdo,
o el punto medio de las dos que lo están.
Escribe decisiones.json: {id: {nombre, lat, lon, voces, dir, precision}}.
"""
import glob, json, math, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
from compara import limpia, km, misma_calle  # noqa: E402


def main():
    lista = json.load(open(os.path.join(AQUI, 'lista.json'), encoding='utf-8'))
    voces = {}
    for f in glob.glob(os.path.join(AQUI, '*-[0-9].json')):
        voz = os.path.basename(f).split('-')[0]
        if voz not in ('chatgpt', 'gemini', 'astra'): continue
        for x in json.load(open(f, encoding='utf-8')):
            voces.setdefault(x[0], {})[voz] = {'dir': x[1], 'pos': [], 'fuente': x[4] if len(x) > 4 else ''}
            if x[2] is not None and x[3] is not None: voces[x[0]][voz]['pos'].append((x[2], x[3], 'dada'))
    for f in glob.glob(os.path.join(AQUI, 'geo-res-*.json')):
        for i, voz, la, lo, rango in json.load(open(f, encoding='utf-8')):
            if la is None or rango < 25 or i not in voces or voz not in voces[i]: continue
            voces[i][voz]['pos'].append((la, lo, 'edificio' if rango >= 30 else 'calle'))
    out = {}
    for i, v in sorted(voces.items()):
        nombres = sorted(v); mejor = None
        for a in range(len(nombres)):
            for b in range(a + 1, len(nombres)):
                A, B = v[nombres[a]], v[nombres[b]]
                if not (limpia(A['fuente']) or limpia(B['fuente'])): continue
                for p in A['pos']:
                    for q in B['pos']:
                        d = km((p[0], p[1]), (q[0], q[1]))
                        if d <= 1.5 and (mejor is None or d < mejor[0]): mejor = (d, nombres[a], nombres[b], p, q, A, B)
        if not mejor: continue
        d, va, vb, p, q, A, B = mejor
        edif = [r for r in (p, q) if r[2] == 'edificio']
        if edif: la, lo, prec = edif[0][0], edif[0][1], 'edificio'
        else: la, lo, prec = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 'calle' if 'calle' in (p[2], q[2]) else 'coordenadas'
        dirs = sorted([A, B], key=lambda r: (limpia(r['fuente']), len(r['dir'] or '')), reverse=True)
        # the address is shown only when both voices give the same one; otherwise both put the building in the same
        # area (less than 1.5 km apart) and the point is marked as approximate, within 2 km
        igual = misma_calle(A['dir'], B['dir'])
        out[i] = {'nombre': lista[i - 1]['nombre'], 'lat': round(la, 5), 'lon': round(lo, 5), 'voces': [va, vb],
                  'dir': dirs[0]['dir'] if igual else '', 'precision': ('direccion-' + prec) if igual else 'zona', 'acuerdo_km': round(d, 2)}
    json.dump(out, open(os.path.join(AQUI, 'decisiones.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    con = sum(1 for i in voces if len(voces[i]) >= 2)
    print('con dos voces o más:', con, '· situados con acuerdo:', len(out))
    for i, x in out.items(): print(' ', i, x['nombre'], '|', x['precision'], x['acuerdo_km'], 'km |', (x['dir'] or '')[:70])


if __name__ == '__main__':
    main()
