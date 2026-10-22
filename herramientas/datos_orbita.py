#!/usr/bin/env python3
"""Real data for Órbita's planet, downloaded to our own site so visitors never contact a third party.

- Communication satellites: orbital elements (GP/OMM) from CelesTrak, every 6 hours.
  CelesTrak updates them a few times a day; we never ask for the same data more than once per update.
- Submarine cables: OpenStreetMap (ODbL, © OpenStreetMap contributors), once a week.

Only the standard library. Writes orbita/datos/satelites.json and orbita/datos/cables.json.
"""
import json, math, os, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'orbita', 'datos')
UA = 'GUARDIANA-Orbita/1.0 (+https://guardianagroup.com; data mirrored for privacy)'

# CelesTrak group, name shown on screen. Only constellations that carry communications or data.
GRUPOS = [
    ('starlink', 'Starlink'), ('oneweb', 'OneWeb'), ('kuiper', 'Kuiper'),
    ('qianfan', 'Qianfan'), ('hulianwang', 'Guowang'),
    ('iridium-NEXT', 'Iridium'), ('globalstar', 'Globalstar'), ('orbcomm', 'Orbcomm'),
    ('ses', 'SES'), ('intelsat', 'Intelsat'), ('eutelsat', 'Eutelsat'), ('telesat', 'Telesat'),
]
CAMPOS = ['EPOCH', 'MEAN_MOTION', 'ECCENTRICITY', 'INCLINATION', 'RA_OF_ASC_NODE', 'ARG_OF_PERICENTER',
          'MEAN_ANOMALY', 'BSTAR', 'MEAN_MOTION_DOT', 'MEAN_MOTION_DDOT']


def baja(url, datos=None, intentos=3, espera=300):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, data=datos, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=espera) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            print(f'  fallo {i + 1}/{intentos} en {url[:90]}: {e}', file=sys.stderr)
            time.sleep(10 * (i + 1))
    return None


def satelites():
    vistos, filas, grupos = set(), [], []
    for gid, nombre in GRUPOS:
        cuerpo = baja('https://celestrak.org/NORAD/elements/gp.php?' + urllib.parse.urlencode({'GROUP': gid, 'FORMAT': 'json'}))
        try:
            lista = json.loads(cuerpo) if cuerpo else []
        except ValueError:
            print(f'  {gid}: respuesta no es JSON: {cuerpo[:120]!r}', file=sys.stderr)
            lista = []
        n = 0
        for o in lista:
            cat = o.get('NORAD_CAT_ID')
            if cat in vistos or not all(k in o for k in CAMPOS):
                continue
            vistos.add(cat); n += 1
            filas.append([len(grupos), o.get('OBJECT_NAME', ''), cat] + [o[k] for k in CAMPOS] + [o.get('OBJECT_ID', ''), '', ''])
        # 22 Oct 2026 (owner: «más información de cada uno, siempre real»): the launch date and launch site of each
        # satellite, from CelesTrak's satellite catalogue (SATCAT) for the same group
        cat_sat = baja('https://celestrak.org/satcat/records.php?' + urllib.parse.urlencode({'GROUP': gid, 'FORMAT': 'json'}))
        try:
            reg = {r.get('NORAD_CAT_ID'): r for r in (json.loads(cat_sat) if cat_sat else [])}
        except ValueError:
            reg = {}
        for f in filas:
            if f[0] == len(grupos) and f[2] in reg:
                r = reg[f[2]]
                f[-2] = r.get('LAUNCH_DATE') or ''
                f[-1] = r.get('LAUNCH_SITE') or ''
        print(f'{gid}: {n} (catálogo: {len(reg)})')
        grupos.append({'id': gid, 'nombre': nombre, 'n': n})
        time.sleep(2)
    if not filas:
        print('Sin satélites: no se escribe nada.', file=sys.stderr)
        return False
    salida = {
        'fuente': 'CelesTrak (celestrak.org), elementos orbitales GP',
        'descargado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'grupos': grupos,
        'campos': ['grupo', 'nombre', 'norad'] + CAMPOS + ['cospar', 'lanzado', 'sitio'],
        'sat': filas,
    }
    with open(os.path.join(RAIZ, 'satelites.json'), 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
    print('satélites en total:', len(filas))
    return True


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(min(1, math.sqrt(h)))


def simplifica(p, tol):
    """Douglas-Peucker on lon/lat, in degrees: enough for a planet a few hundred pixels across."""
    if len(p) < 3:
        return p
    a, b = p[0], p[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy) or 1e-12
    i, dmax = 0, -1
    for k in range(1, len(p) - 1):
        d = abs(dy * p[k][0] - dx * p[k][1] + b[0] * a[1] - b[1] * a[0]) / L
        if d > dmax:
            i, dmax = k, d
    if dmax <= tol:
        return [a, b]
    return simplifica(p[:i + 1], tol)[:-1] + simplifica(p[i:], tol)


def wikidata_cables(ids):
    """For the cables OpenStreetMap links to Wikidata: length (P2043), date in service (P729) or inception (P571),
    owners (P127) and operators (P137), with their names. Only what Wikidata states; nothing guessed."""
    if not ids:
        return {}

    def lote(qs, props):
        u = 'https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode(
            {'action': 'wbgetentities', 'ids': '|'.join(qs), 'props': props, 'languages': 'es|en|pt', 'format': 'json'})
        b = baja(u, espera=60)
        try:
            return json.loads(b).get('entities', {}) if b else {}
        except ValueError:
            return {}

    def valor(c):
        try:
            return c['mainsnak']['datavalue']['value']
        except (KeyError, TypeError):
            return None

    ent = {}
    for i in range(0, len(ids), 50):
        ent.update(lote(ids[i:i + 50], 'claims|labels'))
        time.sleep(1)
    out, otros = {}, set()
    for q, e in ent.items():
        if not isinstance(e, dict):
            continue
        cl, d = e.get('claims', {}), {}
        for c in cl.get('P2043', []):
            v = valor(c)
            if isinstance(v, dict) and 'amount' in v:
                n, u = float(v['amount']), v.get('unit', '')
                if u.endswith('/Q11573'):
                    n /= 1000.0
                elif not u.endswith('/Q828224'):
                    continue
                d['km'] = round(n)
                break
        for p in ('P729', 'P571'):
            for c in cl.get(p, []):
                v = valor(c)
                if isinstance(v, dict) and v.get('time', '')[1:5].isdigit():
                    d['anio'] = int(v['time'][1:5])
                    break
            if 'anio' in d:
                break
        for p, k in (('P127', 'duenos'), ('P137', 'operan')):
            qs = [valor(c).get('id') for c in cl.get(p, []) if isinstance(valor(c), dict) and valor(c).get('id')]
            if qs:
                d[k] = qs
                otros.update(qs)
        if d:
            out[q] = d
    nombres = {}
    otros = sorted(otros)
    for i in range(0, len(otros), 50):
        for q, e in lote(otros[i:i + 50], 'labels').items():
            lab = e.get('labels', {}) if isinstance(e, dict) else {}
            for l in ('es', 'en', 'pt'):
                if l in lab:
                    nombres[q] = lab[l]['value']
                    break
        time.sleep(1)
    for d in out.values():
        for k in ('duenos', 'operan'):
            if k in d:
                d[k] = [nombres[q] for q in d[k] if q in nombres]
    print('wikidata:', len(out), 'cables con datos')
    return out


def cables():
    q = '''[out:json][timeout:900];
(
  way["communication"="line"]["submarine"="yes"];
  way["telecom"="line"]["submarine"="yes"];
  way["communication"="line"]["location"="underwater"];
  way["telecom"="line"]["location"="underwater"];
  way["communication"="line"]["location"="submarine"];
  way["telecom"="line"]["location"="submarine"];
  way["seamark:type"="cable_submarine"]["seamark:cable_submarine:category"~"telephone|telegraph|telecom|fibre|fiber|communication|data",i];
  way["seamark:type"="cable_submarine"]["communication"];
  way["seamark:type"="cable_submarine"]["telecom"];
);
out tags geom;'''
    cuerpo = None
    for servidor in ('https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'):
        cuerpo = baja(servidor, urllib.parse.urlencode({'data': q}).encode())
        if cuerpo:
            break
    if not cuerpo:
        print('Sin cables: no se escribe nada.', file=sys.stderr)
        return False
    d = json.loads(cuerpo)
    out, nombres, total = [], set(), 0.0
    for e in d.get('elements', []):
        g = e.get('geometry') or []
        if len(g) < 2:
            continue
        p = [[round(x['lon'], 3), round(x['lat'], 3)] for x in g]
        largo = sum(km(p[i], p[i + 1]) for i in range(len(p) - 1))
        total += largo
        t = e.get('tags', {})
        # only cables in service: nothing disused, abandoned, removed, historic or with an end date
        if any(k in t for k in ('disused', 'abandoned', 'historic', 'removed', 'razed', 'end_date', 'disused:communication', 'abandoned:communication')) \
                or t.get('operational_status') in ('closed', 'abandoned', 'disused') or t.get('lifecycle') in ('disused', 'abandoned'):
            continue
        if t.get('power') or 'power' in (t.get('seamark:cable_submarine:category') or '').lower():
            continue
        n = t.get('name') or t.get('name:en') or t.get('seamark:name') or ''
        if any(x in n.lower() for x in ('telegraph', 'telégrafo', 'telegrafo', '1865', '1866', '1858')):
            continue
        if n:
            nombres.add(n.strip())
        # split where a way crosses the antimeridian, so no line runs across the whole planet
        tramo = [p[0]]
        trozos = []
        for a, b in zip(p, p[1:]):
            if abs(b[0] - a[0]) > 180:
                trozos.append(tramo); tramo = [b]
            else:
                tramo.append(b)
        trozos.append(tramo)
        for tr in trozos:
            s = simplifica(tr, 0.05)
            if len(s) >= 2:
                fila = {'n': n, 'o': t.get('operator', ''), 'l': s}
                # owner, 22 Oct 2026: «el año de la construcción, los kilómetros… todos los datos que sepamos»
                anio = (t.get('start_date') or '')[:4]
                if anio.isdigit(): fila['y'] = int(anio)
                if t.get('owner'): fila['d'] = t['owner']
                if t.get('website'): fila['web'] = t['website']
                if t.get('wikidata', '').startswith('Q'): fila['w'] = t['wikidata']
                out.append(fila)
    wiki = wikidata_cables(sorted({c['w'] for c in out if c.get('w')}))
    salida = {
        'fuente': 'OpenStreetMap',
        'licencia': 'ODbL 1.0 · © colaboradores de OpenStreetMap',
        'descargado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'medida': {'tramos': len(out), 'cables_con_nombre': len(nombres), 'km': round(total)},
        'wikidata': wiki,
        'cables': out,
    }
    with open(os.path.join(RAIZ, 'cables.json'), 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
    print('cables:', salida['medida'])
    return True


def overpass(q):
    for servidor in ('https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'):
        cuerpo = baja(servidor, urllib.parse.urlencode({'data': q}).encode(), 1, 240)
        if cuerpo:
            try:
                return json.loads(cuerpo)
            except ValueError:
                print('  Overpass: respuesta no es JSON', file=sys.stderr)
    return None


def puntos():
    """Where the internet touches the ground (owner, 20 Oct 2026): cable landing stations, data centres and
    internet exchange points mapped in OpenStreetMap. Partial coverage, said on screen."""
    d = overpass('''[out:json][timeout:220];
(
  nwr["telecom"="cable_landing_station"];
  nwr["telecom"="data_center"];
  nwr["telecom"="internet_exchange"];
);
out tags center;''')
    if not d:
        print('Sin puntos: no se escribe nada.', file=sys.stderr)
        return False
    out, vistos, cuenta = [], set(), {'aterrizaje': 0, 'datos': 0, 'intercambio': 0}
    for e in d.get('elements', []):
        t = e.get('tags', {})
        c = e.get('center') or ({'lat': e['lat'], 'lon': e['lon']} if 'lat' in e else None)
        if not c or any(k in t for k in ('disused', 'abandoned', 'removed', 'razed', 'end_date')):
            continue
        tipo = 'aterrizaje' if t.get('telecom') == 'cable_landing_station' else 'intercambio' if t.get('telecom') == 'internet_exchange' else 'datos'
        clave = (tipo, round(c['lon'], 3), round(c['lat'], 3))
        if clave in vistos:
            continue
        vistos.add(clave); cuenta[tipo] += 1
        out.append([round(c['lon'], 3), round(c['lat'], 3), tipo, t.get('name') or t.get('name:en') or '', t.get('operator', '')])
    salida = {
        'fuente': 'OpenStreetMap',
        'licencia': 'ODbL 1.0 · © colaboradores de OpenStreetMap',
        'descargado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'medida': cuenta,
        'campos': ['lon', 'lat', 'tipo', 'nombre', 'operador'],
        'puntos': out,
    }
    with open(os.path.join(RAIZ, 'puntos.json'), 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
    print('puntos:', cuenta)
    return True


CAJAS = {  # south, west, north, east: one light query per region instead of one for the whole planet
    'america_norte': (5, -170, 75, -50), 'america_sur': (-57, -95, 15, -30), 'europa': (34, -25, 72, 45),
    'africa': (-36, -20, 38, 55), 'asia_oeste': (0, 45, 60, 100), 'asia_este': (-12, 100, 60, 180), 'oceania': (-50, 110, 0, 180),
}


def tierra_borrador():
    """Land fibre that OpenStreetMap knows, with a name or an operator, written as a DRAFT (tierra-borrador.json)
    so it can be reviewed before it is shown: coverage is known to be partial. One query per region."""
    out, total, regiones, vistos = [], 0.0, {}, set()
    for reg, (s_, w, n, e) in CAJAS.items():
        b = f'({s_},{w},{n},{e})'
        d = overpass(f'''[out:json][timeout:200];
(
  way["telecom"="line"]["name"]{b};
  way["telecom"="line"]["operator"]{b};
  way["communication"="line"]["name"]{b};
);
out tags geom;''')
        if not d:
            regiones[reg] = 'sin respuesta'
            continue
        k = 0
        for el in d.get('elements', []):
            t = el.get('tags', {})
            if el.get('id') in vistos or t.get('submarine') == 'yes' or t.get('location') in ('underwater', 'submarine'):
                continue
            g = el.get('geometry') or []
            if len(g) < 2:
                continue
            p = [[round(x['lon'], 3), round(x['lat'], 3)] for x in g]
            largo = sum(km(p[i], p[i + 1]) for i in range(len(p) - 1))
            if largo < 5:
                continue
            vistos.add(el.get('id')); total += largo; k += 1
            out.append({'n': t.get('name', ''), 'o': t.get('operator', ''), 'km': round(largo), 'l': simplifica(p, 0.03)})
        regiones[reg] = k
        print('fibra de tierra', reg, k)
        time.sleep(5)
    if not out:
        print('Sin fibra de tierra: no se escribe nada.', file=sys.stderr)
        return False
    salida = {
        'fuente': 'OpenStreetMap', 'licencia': 'ODbL 1.0 · © colaboradores de OpenStreetMap', 'borrador': True,
        'descargado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'medida': {'tramos': len(out), 'km': round(total), 'regiones': regiones}, 'cables': out,
    }
    with open(os.path.join(RAIZ, 'tierra-borrador.json'), 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
    print('fibra de tierra (borrador):', salida['medida'])
    return True


def medir_tierra():
    """How much of the land fibre OpenStreetMap knows: counts only, saved in indice.json so anyone can read it."""
    medida = {}
    for q in ('way["telecom"="line"]["name"];', 'way["communication"="line"]["name"];', 'way["telecom"="line"]["operator"];',
              'way["telecom"="line"];', 'relation["route"="fiber"];', 'relation["type"="route"]["route"="fibre"];'):
        cuerpo = baja('https://overpass-api.de/api/interpreter', urllib.parse.urlencode({'data': '[out:json][timeout:200];' + q + 'out count;'}).encode(), 1, 240)
        try:
            medida[q] = json.loads(cuerpo)['elements'][0]['tags']
        except Exception as e:  # noqa: BLE001
            medida[q] = 'sin respuesta: ' + str(e)[:120]
        print('medida tierra', q, medida[q])
    return medida


def indice(medida=None):
    """orbita/datos/indice.json: which layers exist (so the page asks only for files that are there) and, when
    measured, how much land fibre OpenStreetMap knows."""
    ruta = os.path.join(RAIZ, 'indice.json')
    try:
        with open(ruta, encoding='utf-8') as f:
            previo = json.load(f)
    except Exception:  # noqa: BLE001
        previo = {}
    salida = {
        'capas': {c: os.path.exists(os.path.join(RAIZ, a)) for c, a in (('sub', 'cables.json'), ('tierra', 'tierra.json'), ('sat', 'satelites.json'), ('puntos', 'puntos.json'))},
        'medida_tierra_osm': medida if medida else previo.get('medida_tierra_osm'),
    }
    if medida:
        salida['medida_tierra_fecha'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    elif previo.get('medida_tierra_fecha'):
        salida['medida_tierra_fecha'] = previo['medida_tierra_fecha']
    with open(ruta, 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    os.makedirs(RAIZ, exist_ok=True)
    que = sys.argv[1:] or ['satelites', 'cables']
    ok = True
    if 'satelites' in que:
        ok = satelites() and ok
    if 'cables' in que:
        ruta = os.path.join(RAIZ, 'cables.json')
        viejo = True
        try:
            with open(ruta, encoding='utf-8') as f:
                antes = datetime.strptime(json.load(f)['descargado'], '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
            viejo = (datetime.now(timezone.utc) - antes).total_seconds() > 6.5 * 86400
        except Exception:  # noqa: BLE001
            pass
        viejo = viejo or 'forzar' in que
        if viejo:
            ok = cables() and ok
    if 'puntos' in que:
        try:
            with open(os.path.join(RAIZ, 'puntos.json'), encoding='utf-8') as f:
                antes = datetime.strptime(json.load(f)['descargado'], '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
            viejo = (datetime.now(timezone.utc) - antes).total_seconds() > 6.5 * 86400
        except Exception:  # noqa: BLE001
            viejo = True
        if viejo or 'forzar' in que:
            puntos()
    if 'tierra' in que:
        tierra_borrador()
    indice(medir_tierra() if 'medir' in que else None)
    sys.exit(0 if ok else 1)
