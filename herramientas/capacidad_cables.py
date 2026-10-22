#!/usr/bin/env python3
"""Capacidad de los cables submarinos (owner, 22 Oct 2026: «los que llevan tantos terabytes, los más potentes, en otro
color… un ramal diferente por potencia»).

Lee las respuestas de la agencia en herramientas/cables-capacidad/<voz>-*.json ([{nombre, tbps, pares, fuente}]) y
escribe orbita/datos/cables-capacidad.json, con una entrada por NOMBRE DE GRUPO tal como aparece en
orbita/datos/lugares-capas.json (así capas.js no tiene que reproducir la clave de cables_agencia.py).

Regla de la agencia: una capacidad entra cuando la dan al menos dos voces y coinciden dentro de un 30 %, o cuando la da
una sola voz y el cable está en herramientas/cables-capacidad/confirmados.txt (comprobado a mano). Se guarda la mediana.
"""
import glob, json, os, re, statistics, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
from cables_agencia import clave  # noqa: E402

CARPETA = os.path.join(AQUI, 'cables-capacidad')


def quien(f):
    n = os.path.basename(f).lower()
    for q in ('chatgpt', 'gemini', 'claude', 'grok'):
        if n.startswith(q): return q
    return 'otro'


def num(v):
    try:
        v = float(v)
        return v if v > 0 else None
    except (TypeError, ValueError):
        return None


def main():
    por = {}
    for f in sorted(glob.glob(os.path.join(CARPETA, '*.json'))):
        try:
            datos = json.load(open(f, encoding='utf-8'))
        except Exception as e:  # noqa: BLE001
            print('no se puede leer', f, e); continue
        for c in datos:
            if not isinstance(c, dict) or not c.get('nombre'): continue
            t = num(c.get('tbps'))
            if t is None: continue
            por.setdefault(clave(c['nombre']), []).append((quien(f), t, num(c.get('pares')), c.get('fuente') or ''))
    conf = set()
    p = os.path.join(CARPETA, 'confirmados.txt')
    if os.path.exists(p):
        conf = {clave(l.split('#')[0].strip()) for l in open(p, encoding='utf-8') if l.split('#')[0].strip()}
    lug = json.load(open(os.path.join(RAIZ, 'orbita', 'datos', 'lugares-capas.json'), encoding='utf-8'))
    salida, descartes = {}, []
    for g in lug.get('grupos', []):
        nombre = g[0]; k = clave(nombre)
        r = por.get(k)
        if not r: continue
        voces = {}
        for v, t, pares, fu in r:
            voces.setdefault(v, []).append((t, pares, fu))
        ts = [max(x[0] for x in xs) for xs in voces.values()]  # one figure per voice: its latest (highest) upgrade
        if len(ts) >= 2:
            # the largest group of voices that agree within 30 % wins (two of three agreeing is enough)
            mejor = None
            for v in ts:
                grupo = [u for u in ts if v / 1.3 <= u <= v * 1.3]
                if len(grupo) >= 2 and (mejor is None or len(grupo) > len(mejor)): mejor = grupo
            if mejor is None and k not in conf:
                descartes.append((nombre, 'las voces no coinciden: ' + ', '.join('%s=%g' % (v, max(x[0] for x in xs)) for v, xs in voces.items()))); continue
            t = statistics.median(mejor or ts)
        elif k in conf:
            t = ts[0]
        else:
            descartes.append((nombre, 'solo lo da ' + ', '.join(voces))); continue
        pares = [x[1] for xs in voces.values() for x in xs if x[1]]
        salida[nombre] = {'tbps': round(t, 2) if t < 10 else round(t), 'pares': int(statistics.median(pares)) if pares else None, 'voces': sorted(voces)}
    out = {
        'nota': 'Capacidad de diseño (Tbit/s) y pares de fibra por cable, reconstruida por la agencia GUARDIANA (consenso de dos voces o comprobación a mano). Umbrales del mapa: gigante ≥ 100 Tbit/s, grande ≥ 20 Tbit/s.',
        'umbrales': {'gigante': 100, 'grande': 20},
        'cables': salida,
    }
    with open(os.path.join(RAIZ, 'orbita', 'datos', 'cables-capacidad.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print('capacidades aceptadas:', len(salida), '· gigantes:', sum(1 for v in salida.values() if v['tbps'] >= 100), '· grandes:', sum(1 for v in salida.values() if 20 <= v['tbps'] < 100))
    for n, por_que in descartes[:60]:
        print('  ', n, '·', por_que)
    if len(descartes) > 60: print('   … y', len(descartes) - 60, 'más')


if __name__ == '__main__':
    main()
