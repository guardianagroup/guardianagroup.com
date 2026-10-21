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


def baja(url, datos=None, intentos=3):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, data=datos, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=300) as r:
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
            filas.append([len(grupos), o.get('OBJECT_NAME', ''), cat] + [o[k] for k in CAMPOS])
        print(f'{gid}: {n}')
        grupos.append({'id': gid, 'nombre': nombre, 'n': n})
        time.sleep(2)
    if not filas:
        print('Sin satélites: no se escribe nada.', file=sys.stderr)
        return False
    salida = {
        'fuente': 'CelesTrak (celestrak.org), elementos orbitales GP',
        'descargado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'grupos': grupos,
        'campos': ['grupo', 'nombre', 'norad'] + CAMPOS,
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


def cables():
    q = '''[out:json][timeout:900];
(
  way["communication"="line"]["submarine"="yes"];
  way["telecom"="line"]["submarine"="yes"];
  way["communication"="line"]["location"="underwater"];
  way["telecom"="line"]["location"="underwater"];
  way["communication"="line"]["location"="submarine"];
  way["telecom"="line"]["location"="submarine"];
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
        n = t.get('name') or t.get('name:en') or ''
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
                out.append({'n': n, 'o': t.get('operator', ''), 'l': s})
    salida = {
        'fuente': 'OpenStreetMap',
        'licencia': 'ODbL 1.0 · © colaboradores de OpenStreetMap',
        'descargado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'medida': {'tramos': len(out), 'cables_con_nombre': len(nombres), 'km': round(total)},
        'cables': out,
    }
    with open(os.path.join(RAIZ, 'cables.json'), 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
    print('cables:', salida['medida'])
    return True


def medir_tierra():
    """How much of the land fibre OpenStreetMap knows: counts only (no data saved)."""
    for q in ('way["telecom"="line"]["name"];', 'way["communication"="line"]["name"];', 'way["telecom"="line"]["operator"];',
              'relation["route"="fiber"];', 'relation["type"="route"]["route"="fibre"];'):
        cuerpo = baja('https://overpass-api.de/api/interpreter', urllib.parse.urlencode({'data': '[out:json][timeout:900];' + q + 'out count;'}).encode(), 2)
        try:
            print('medida tierra', q, json.loads(cuerpo)['elements'][0]['tags'])
        except Exception as e:  # noqa: BLE001
            print('medida tierra', q, 'sin respuesta', e)


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
    if 'medir' in que:
        medir_tierra()
    sys.exit(0 if ok else 1)
