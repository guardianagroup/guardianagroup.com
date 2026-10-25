#!/usr/bin/env python3
"""GUARDIANA · Órbita: the microwave radio chains of the countries with no land fibre (round 27, approved by the owner on
24 Oct 2026, 18:43: «Añade las troncales de los países que no tienen fibra… Groenlandia, Eritrea, Malvinas, Pacífico, y
las rutas de bolsa como dato curioso»).

The same two-voice rule as the land fibre (fibra_agencia.py, whose matching, SITIOS and ALIAS it reuses): a stretch between
two towns enters only when two voices of the agency name it, each on its own. The answers live in
herramientas/radio-agencia/<voz>-radio-*.json (same format as fibra-agencia: nombre, operador, pais, ciudades, estado,
fuente; the stock-exchange routes add «dato»). Writes orbita/datos/radioenlaces.json, drawn by capas.js as dotted lines
(«trazado aproximado»: the voices name the towns the chain passes, not the towers).

Usage: python3 herramientas/radio_agencia.py"""
import json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import fibra_agencia as F  # noqa: E402

F.CARPETA = os.path.join(AQUI, 'radio-agencia')
F.SALIDA = os.path.join(os.path.dirname(AQUI), 'orbita', 'datos', 'radioenlaces.json')
# every radio chain is an approximate path between towns, so the looser test of the countries without open sources applies
F.APROX = set(F.APROX) | {'GL', 'ER', 'FK', 'TO', 'KI', 'TV', 'MH', 'NR', 'PW', 'US', 'GB', 'DE', 'BE', 'NL', 'FR'}

if __name__ == '__main__':
    F.main()
    d = json.load(open(F.SALIDA, encoding='utf-8'))
    # the curiosities of the stock-exchange routes travel with their line (a voice's «dato», when both voices name the route)
    datos = {}
    for f in sorted(os.listdir(F.CARPETA)):
        if f.endswith('.json'):
            for r in json.load(open(os.path.join(F.CARPETA, f), encoding='utf-8')):
                if r.get('dato'): datos.setdefault(r.get('nombre', ''), r['dato'])
    for x in d['lineas']:
        if x.get('n') in datos: x['dato'] = datos[x['n']]
    d['fuente'] = {'n': 'Agencia GUARDIANA (dos voces)', 'lic': 'GUARDIANA', 'url': '', 'fecha': '2026-10-25',
                   'nota': 'Cadenas troncales de radioenlaces de microondas que dos voces de la agencia confirman por separado, entre localidades: '
                           'trazado aproximado, la posición de cada torre no es pública.'}
    json.dump(d, open(F.SALIDA, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('radioenlaces:', len(d['lineas']), 'tramos')
