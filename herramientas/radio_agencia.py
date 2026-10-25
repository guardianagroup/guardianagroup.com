#!/usr/bin/env python3
"""GUARDIANA · Órbita: the microwave radio chains of the countries with no land fibre (round 27, approved by the owner on
24 Oct 2026, 18:43: «Añade las troncales de los países que no tienen fibra… Groenlandia, Eritrea, Malvinas, Pacífico, y
las rutas de bolsa como dato curioso»).

The same two-voice rule as the land fibre (fibra_agencia.py, whose matching, SITIOS and ALIAS it reuses): a stretch between
two towns enters only when two voices of the agency name it, each on its own. The answers live in
herramientas/radio-agencia/<voz>-radio-*.json (same format as fibra-agencia: nombre, operador, pais, ciudades, estado,
fuente; the stock-exchange routes add «dato»). Writes orbita/datos/radioenlaces.json, drawn by capas.js as dotted lines
(«trazado aproximado»: the voices name the towns the chain passes, not the towers).

The stock-exchange routes (files *-radio-bolsa.json) keep only their two ends: the voices name dozens of small towns along
the corridor, several of them with namesakes in other states (Rochester, Warren, Plymouth…), and these networks run almost
on the great circle between the exchanges anyway. Their towers are not drawn.

Usage: python3 herramientas/radio_agencia.py"""
import glob, json, math, os, shutil, sys, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import fibra_agencia as F  # noqa: E402

ORIGEN = os.path.join(AQUI, 'radio-agencia')
F.SALIDA = os.path.join(os.path.dirname(AQUI), 'orbita', 'datos', 'radioenlaces.json')
# every radio chain is an approximate path between towns, so the looser test of the countries without open sources applies
F.APROX = set(F.APROX) | {'GL', 'ER', 'FK', 'TO', 'KI', 'TV', 'MH', 'NR', 'PW', 'US', 'GB', 'DE', 'BE', 'NL', 'FR'}
# the CME data centre is in Aurora, Illinois (not Aurora, Colorado, the larger namesake)
F.SITIOS[('US', 'aurora')] = (-88.239, 41.795)
# a microwave hop between islands does cross the sea: no land routing (fibra_agencia.Tierra)
F.POR_TIERRA = False


def gran_circulo(a, b, paso=100):
    """points every «paso» km along the great circle from a to b (lon, lat)"""
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    d = 2 * math.asin(math.sqrt(math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2))
    n = max(1, int(d * 6371 // paso))
    out = []
    for i in range(n + 1):
        f = i / n
        if d == 0: out.append(list(a)); continue
        A, B = math.sin((1 - f) * d) / math.sin(d), math.sin(f * d) / math.sin(d)
        x = A * math.cos(la1) * math.cos(lo1) + B * math.cos(la2) * math.cos(lo2)
        y = A * math.cos(la1) * math.sin(lo1) + B * math.cos(la2) * math.sin(lo2)
        z = A * math.sin(la1) + B * math.sin(la2)
        out.append([round(math.degrees(math.atan2(y, x)), 3), round(math.degrees(math.atan2(z, math.hypot(x, y))), 3)])
    return out


if __name__ == '__main__':
    tmp = tempfile.mkdtemp(prefix='radio-')
    try:
        for f in glob.glob(os.path.join(ORIGEN, '*.json')):
            d = json.load(open(f, encoding='utf-8'))
            if f.endswith('-radio-bolsa.json'):
                for r in d: r['ciudades'] = [r['ciudades'][0], r['ciudades'][-1]] if len(r.get('ciudades') or []) >= 2 else r.get('ciudades')
            json.dump(d, open(os.path.join(tmp, os.path.basename(f)), 'w', encoding='utf-8'), ensure_ascii=False)
        F.CARPETA = tmp
        F.main()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    d = json.load(open(F.SALIDA, encoding='utf-8'))
    # the curiosities of the stock-exchange routes travel with their line (a voice's «dato», when both voices name the route)
    datos = {}
    for f in sorted(os.listdir(ORIGEN)):
        if f.endswith('.json'):
            for r in json.load(open(os.path.join(ORIGEN, f), encoding='utf-8')):
                if r.get('dato'): datos.setdefault(r.get('nombre', ''), r['dato'])
    for x in d['lineas']:
        if x.get('n') in datos: x['dato'] = datos[x['n']]
        # long hops follow the great circle, so the planet never draws them as a chord through the Earth
        l = x['l']; x['l'] = [p for i, (a, b) in enumerate(zip(l, l[1:])) for p in (gran_circulo(a, b) if i == 0 else gran_circulo(a, b)[1:])] or l
    d['fuente'] = {'n': 'Agencia GUARDIANA (dos voces)', 'lic': 'GUARDIANA', 'url': '', 'fecha': '2026-10-25',
                   'nota': 'Cadenas troncales de radioenlaces de microondas que dos voces de la agencia confirman por separado, entre localidades: '
                           'trazado aproximado, la posición de cada torre no es pública.'}
    json.dump(d, open(F.SALIDA, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('radioenlaces:', len(d['lineas']), 'tramos')
