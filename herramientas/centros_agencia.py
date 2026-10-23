#!/usr/bin/env python3
"""Centros de datos reconstruidos por la agencia (22 Oct 2026, 19:50; el dueño: «centros de datos primero»; las bases
comerciales no se pueden usar por licencia; OpenStreetMap solo tiene una parte).

Lee herramientas/centros-agencia/<voz>-*.json ([{nombre, operador, ciudad, pais, lat, lon, desde, nota}]) y mete en
orbita/datos/puntos-extra.json (tipo «datos», marcados con "agencia": true) los que nombran al menos dos voces en el
mismo país a menos de 30 km (o una sola voz si están en herramientas/centros-agencia/confirmados.txt). Lo que
OpenStreetMap ya tiene (puntos.json, tipo datos) a menos de 600 m o con el mismo nombre no se duplica.
"""
import glob, json, math, os, re, statistics

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
DATOS = os.path.join(RAIZ, 'orbita', 'datos')
CARPETA = os.path.join(AQUI, 'centros-agencia')


def quien(f):
    n = os.path.basename(f).lower()
    for q in ('chatgpt', 'gemini', 'claude', 'grok'):
        if n.startswith(q): return q
    return 'otro'


def clave(nombre, pais):
    k = re.sub(r'[^a-z0-9]', '', (nombre or '').lower())
    for w in ('datacenter', 'datacentre', 'centrodedatos', 'campus', 'site'):
        k = k.replace(w, '')
    return (pais or '').upper() + ':' + k


def km(a, b, c, d):
    f1, f2 = math.radians(a), math.radians(c); dl = math.radians(d - b)
    h = math.sin((f2 - f1) / 2) ** 2 + math.cos(f1) * math.cos(f2) * math.sin(dl / 2) ** 2
    return 2 * 6371 * math.asin(min(1, math.sqrt(h)))


def num(v):
    try:
        v = float(v); return v
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
            if not isinstance(c, dict) or not c.get('nombre') or not c.get('pais'): continue
            if num(c.get('lat')) is None or num(c.get('lon')) is None: continue
            if str(c.get('estado') or '').lower().startswith(('no existe', 'cerrado', 'fuera', 'no verificado', 'es otra cosa')): continue
            por.setdefault(clave(c['nombre'], c['pais']), []).append((quien(f), c))
    conf = set()
    p = os.path.join(CARPETA, 'confirmados.txt')
    if os.path.exists(p):
        for l in open(p, encoding='utf-8'):
            l = l.split('#')[0].strip()
            if '|' in l: n, cc = l.split('|', 1); conf.add(clave(n.strip(), cc.strip()))
    # what the map already has
    extra_p = os.path.join(DATOS, 'puntos-extra.json')
    extra = json.load(open(extra_p, encoding='utf-8'))
    mano = [q for q in extra.get('puntos', []) if not (q.get('tipo') == 'datos' and q.get('agencia'))]
    ocupados = [(q.get('nombre', ''), num(q.get('lat')), num(q.get('lon'))) for q in mano if q.get('tipo') == 'datos']
    try:
        osm = json.load(open(os.path.join(DATOS, 'puntos.json'), encoding='utf-8'))
        c = osm['campos']; il, ia, it, inn = c.index('lon'), c.index('lat'), c.index('tipo'), c.index('nombre')
        ocupados += [(q[inn], q[ia], q[il]) for q in osm['puntos'] if q[it] == 'datos']
    except Exception:  # noqa: BLE001
        pass
    salida, descartes = [], []
    for k, rs in sorted(por.items()):
        voces = {v for v, _ in rs}
        if len(voces) < 2 and k not in conf:
            descartes.append((k, 'solo lo nombra ' + ', '.join(voces))); continue
        lats = [num(c['lat']) for _, c in rs]; lons = [num(c['lon']) for _, c in rs]
        lat, lon = statistics.median(lats), statistics.median(lons)
        if max(km(lat, lon, a, b) for a, b in zip(lats, lons)) > 30:
            descartes.append((k, 'las voces lo sitúan a más de 30 km')); continue
        nombre = max((c['nombre'] for _, c in rs), key=len)
        kn = re.sub(r'[^a-z0-9]', '', nombre.lower())
        if any((re.sub(r'[^a-z0-9]', '', (n or '').lower()) == kn and kn) or (a is not None and km(lat, lon, a, b) < 0.6) for n, a, b in ocupados):
            descartes.append((k, 'ya está en el mapa')); continue
        ops = [c.get('operador') for _, c in rs if c.get('operador')]
        desde = [int(c['desde']) for _, c in rs if num(c.get('desde'))]
        notas = [c.get('nota') for _, c in rs if c.get('nota')]
        q = {'lon': round(lon, 4), 'lat': round(lat, 4), 'tipo': 'datos', 'nombre': nombre, 'operador': ops[0] if ops else '', 'agencia': True, 'voces': sorted(voces)}
        if desde and (len(set(desde)) == 1 or k in conf): q['desde'] = str(desde[0])
        ciudad = next((c.get('ciudad') for _, c in rs if c.get('ciudad')), '')
        nota = max(notas, key=len) if notas else ''
        if ciudad and ciudad.lower() not in nota.lower(): nota = (nota + ' ' if nota else '') + '(' + ciudad + ')'
        if nota: q['nota'] = nota.strip()
        salida.append(q)
        ocupados.append((nombre, lat, lon))
    extra['puntos'] = mano + salida
    json.dump(extra, open(extra_p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('centros de datos de la agencia aceptados:', len(salida), '· descartados:', len(descartes))
    for k, por_que in descartes[:40]:
        print('  ', k, '·', por_que)
    if len(descartes) > 40: print('   … y', len(descartes) - 40, 'más')


if __name__ == '__main__':
    main()
