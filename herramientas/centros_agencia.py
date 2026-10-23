#!/usr/bin/env python3
"""Centros de datos reconstruidos por la agencia (22 Oct 2026, 19:50; el dueño: «centros de datos primero»; las bases
comerciales no se pueden usar por licencia; OpenStreetMap solo tiene una parte).

Lee herramientas/centros-agencia/<voz>-*.json ([{nombre, operador, ciudad, pais, lat, lon, desde, nota}]) y mete en
orbita/datos/puntos-extra.json (tipo «datos», marcados con "agencia": true) los que nombran al menos dos voces en el
mismo país a menos de 30 km (o una sola voz si están en herramientas/centros-agencia/confirmados.txt). Lo que
OpenStreetMap ya tiene (puntos.json, tipo datos) con el mismo nombre o el mismo código del mismo operador en la zona
no se duplica (ver repetido()).
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
    # vetoes by the third voice (Claude): what the other two confirm but is wrong or already on the map under another name
    vetos = {}
    p = os.path.join(CARPETA, 'vetados.txt')
    if os.path.exists(p):
        for l in open(p, encoding='utf-8'):
            l, _, por_que = l.partition('#')
            if '|' in l: n, cc = l.split('|', 1); vetos[clave(n.strip(), cc.strip())] = por_que.strip() or 'vetado'
    # what the map already has
    extra_p = os.path.join(DATOS, 'puntos-extra.json')
    extra = json.load(open(extra_p, encoding='utf-8'))
    mano = [q for q in extra.get('puntos', []) if not (q.get('tipo') == 'datos' and q.get('agencia'))]
    # what the map already has, as (name, lat, lon, operator), names and operators reduced to letters and digits.
    # 22 Oct 2026: a centre is a duplicate only when it is the same centre (same name, or the same code of the same
    # operator) in the same area — never just because it falls near another one: the agency often gives the city's
    # coordinates, and several real centres share them (Equinix ST1…ST4 in Santiago)
    norm = lambda s: re.sub(r'[^a-z0-9]', '', (s or '').lower())
    ocupados = [(norm(q.get('nombre')), num(q.get('lat')), num(q.get('lon')), norm(q.get('operador'))) for q in mano if q.get('tipo') == 'datos']
    try:
        osm = json.load(open(os.path.join(DATOS, 'puntos.json'), encoding='utf-8'))
        c = osm['campos']; il, ia, it, inn, iop = c.index('lon'), c.index('lat'), c.index('tipo'), c.index('nombre'), c.index('operador')
        ocupados += [(norm(q[inn]), q[ia], q[il], norm(q[iop])) for q in osm['puntos'] if q[it] == 'datos']
    except Exception:  # noqa: BLE001
        pass

    def repetido(nombre, operador, lat, lon, solo=False):
        kn = norm(nombre)
        palabras = re.findall(r'[A-Za-z0-9]+', nombre or '')
        codigo = norm(palabras[-1]) if palabras and re.search(r'\d', palabras[-1]) else ''
        marca = norm((operador or nombre or '').split('/')[0].split()[0]) if (operador or nombre) else ''
        cifra = (re.search(r'(\d+)\s*[a-zA-Z]?\s*$', nombre or '') or [None, ''])[1]
        for n, a, b, op in ocupados:
            if a is None or b is None: continue
            d = km(lat, lon, a, b)
            if d > 40: continue
            if kn and n == kn: return True
            corto = min((kn, n), key=len)
            if len(corto) >= 6 and re.search(r'\d', corto) and (kn in n or n in kn): return True   # «Centro de datos Ascenty Querétaro 1»
            mismo = marca and (marca in n or marca in op)
            if mismo and codigo and len(codigo) >= 3 and codigo in n: return True
            if mismo and any(len(t) >= 3 and re.search(r'\d', t) and t in n for t in map(norm, palabras)): return True  # «KIO MEX4 Interlomas» = «KIO MEX4»
            if mismo and cifra and d <= 25 and re.search(r'(?<!\d)' + cifra + r'[a-z]?$', n): return True  # «Ascenty SP1» = «Ascenty São Paulo 1»
            if solo and mismo and d <= 8 and not re.search(r'\d', n): return True  # «Ascenty Infraestrutura de Data Centers» (Maracanaú) = «Ascenty Fortaleza 1», el único de Ascenty allí
        return False
    # how many centres of each operator the agency places in each city (to know when one is the only one there)
    marcaDe = lambda s: norm(((s or '').split('/')[0].split() or [''])[0])
    porCiudad = {}
    for rs in por.values():
        c0 = rs[0][1]; op0 = next((c.get('operador') for _, c in rs if c.get('operador')), c0.get('nombre'))
        kk = (marcaDe(op0), norm(next((c.get('ciudad') for _, c in rs if c.get('ciudad')), '')))
        porCiudad[kk] = porCiudad.get(kk, 0) + 1
    salida, descartes = [], []
    for k, rs in sorted(por.items()):
        voces = {v for v, _ in rs}
        if k in vetos:
            descartes.append((k, 'vetado: ' + vetos[k])); continue
        if len(voces) < 2 and k not in conf:
            descartes.append((k, 'solo lo nombra ' + ', '.join(voces))); continue
        lats = [num(c['lat']) for _, c in rs]; lons = [num(c['lon']) for _, c in rs]
        lat, lon = statistics.median(lats), statistics.median(lons)
        if max(km(lat, lon, a, b) for a, b in zip(lats, lons)) > 30:
            descartes.append((k, 'las voces lo sitúan a más de 30 km')); continue
        # 22 Oct 2026: the mean of a building and a city centre is neither (Telehouse North Two would land in
        # Shoreditch). Building-level coordinates (5+ decimals) win; otherwise those of the voice that wrote the list
        # with the addresses (ChatGPT)
        dec = lambda v: len(str(v).split('.')[1]) if '.' in str(v) else 0
        fino = [(c['lat'], c['lon']) for _, c in rs if min(dec(c['lat']), dec(c['lon'])) >= 5]
        prim = [(c['lat'], c['lon']) for v, c in rs if v == 'chatgpt']
        if fino: lat, lon = num(fino[0][0]), num(fino[0][1])
        elif prim: lat, lon = num(prim[0][0]), num(prim[0][1])
        if False:
            descartes.append((k, 'las voces lo sitúan a más de 30 km')); continue
        nombre = max((c['nombre'] for _, c in rs), key=len)
        ops = [c.get('operador') for _, c in rs if c.get('operador')]
        ciudad0 = norm(next((c.get('ciudad') for _, c in rs if c.get('ciudad')), ''))
        if repetido(nombre, ops[0] if ops else '', lat, lon, solo=porCiudad.get((marcaDe(ops[0] if ops else nombre), ciudad0), 0) <= 1):
            descartes.append((k, 'ya está en el mapa')); continue
        desde = [int(c['desde']) for _, c in rs if num(c.get('desde'))]
        notas = [c.get('nota') for _, c in rs if c.get('nota')]
        q = {'lon': round(lon, 4), 'lat': round(lat, 4), 'tipo': 'datos', 'nombre': nombre, 'operador': ops[0] if ops else '', 'agencia': True, 'voces': sorted(voces)}
        if desde and (len(set(desde)) == 1 or k in conf): q['desde'] = str(desde[0])
        ciudad = next((c.get('ciudad') for _, c in rs if c.get('ciudad')), '')
        nota = max(notas, key=len) if notas else ''
        if ciudad and ciudad.lower() not in nota.lower(): nota = (nota + ' ' if nota else '') + '(' + ciudad + ')'
        if nota: q['nota'] = nota.strip()
        salida.append(q)
    extra['puntos'] = mano + salida
    json.dump(extra, open(extra_p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('centros de datos de la agencia aceptados:', len(salida), '· descartados:', len(descartes))
    for k, por_que in descartes[:40]:
        print('  ', k, '·', por_que)
    if len(descartes) > 40: print('   … y', len(descartes) - 40, 'más')


if __name__ == '__main__':
    main()
