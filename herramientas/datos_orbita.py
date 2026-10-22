#!/usr/bin/env python3
"""Real data for Órbita's planet, downloaded to our own site so visitors never contact a third party.

- Communication satellites: orbital elements (GP/OMM) from CelesTrak every 6 hours, replaced by the operators' own
  ephemerides (SupGP) where CelesTrak publishes them; launch date and site from the satellite catalogue (SATCAT).
  CelesTrak updates GP every 2 hours; we never ask for the same data more than once per update.
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


# Operator ephemerides republished by CelesTrak as «supplemental GP» (SupGP): more precise than the radar-derived GP
# (CelesTrak measured about 0.9 km of error against 7.5 km for GPS), and they follow each manoeuvre sooner.
SUPGP = {'starlink': 'starlink', 'oneweb': 'oneweb', 'kuiper': 'kuiper', 'iridium-NEXT': 'iridium', 'ses': 'ses',
         'intelsat': 'intelsat', 'telesat': 'telesat', 'orbcomm': 'orbcomm'}


def satelites():
    """Satellites, their orbit and their launch. CelesTrak asks for each data set at most once per update (GP every
    2 hours, the satellite catalogue once or twice a day): the catalogue is asked again only after 12 hours."""
    previo = {}
    try:
        with open(os.path.join(RAIZ, 'satelites.json'), encoding='utf-8') as f:
            previo = json.load(f)
    except (OSError, ValueError):
        pass
    pc = previo.get('campos', [])
    lanz_prev = {}
    if 'lanzado' in pc:
        il, isit, inor = pc.index('lanzado'), pc.index('sitio'), pc.index('norad')
        lanz_prev = {r[inor]: (r[il], r[isit]) for r in previo.get('sat', []) if r[il]}
    pide_cat = True
    try:
        t0 = datetime.strptime(previo.get('catalogo_descargado', ''), '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
        pide_cat = (datetime.now(timezone.utc) - t0).total_seconds() > 12 * 3600
    except ValueError:
        pass

    vistos, filas, grupos, sup_n = set(), [], [], {}
    for gid, nombre in GRUPOS:
        cuerpo = baja('https://celestrak.org/NORAD/elements/gp.php?' + urllib.parse.urlencode({'GROUP': gid, 'FORMAT': 'json'}))
        try:
            lista = json.loads(cuerpo) if cuerpo else []
        except ValueError:
            print(f'  {gid}: respuesta no es JSON: {cuerpo[:120]!r}', file=sys.stderr)
            lista = []
        g = len(grupos)
        mias = {}
        for o in lista:
            cat = o.get('NORAD_CAT_ID')
            if cat in vistos or not all(k in o for k in CAMPOS):
                continue
            vistos.add(cat)
            fila = [g, o.get('OBJECT_NAME', ''), cat] + [o[k] for k in CAMPOS] + [o.get('OBJECT_ID', ''), '', '', '']
            filas.append(fila); mias[cat] = fila
        # the operator's own orbit, when CelesTrak publishes it and it is newer
        if gid in SUPGP and mias:
            cs = baja('https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?' + urllib.parse.urlencode({'FILE': SUPGP[gid], 'FORMAT': 'json'}), intentos=2)
            try:
                sup = json.loads(cs) if cs else []
            except ValueError:
                sup = []
            n = 0
            for o in sup if isinstance(sup, list) else []:
                f = mias.get(o.get('NORAD_CAT_ID'))
                if not f or not all(k in o for k in CAMPOS):
                    continue
                if str(o['EPOCH']) >= str(f[3]):
                    f[3:3 + len(CAMPOS)] = [o[k] for k in CAMPOS]
                    f[-1] = 'op'; n += 1
            sup_n[gid] = n
            time.sleep(2)
        # launch date and site (SATCAT): asked again only every 12 hours, otherwise kept from the last download
        reg = {}
        if pide_cat:
            cat_sat = baja('https://celestrak.org/satcat/records.php?' + urllib.parse.urlencode({'GROUP': gid, 'FORMAT': 'json'}), intentos=2)
            try:
                reg = {r.get('NORAD_CAT_ID'): r for r in (json.loads(cat_sat) if cat_sat else [])}
            except ValueError:
                reg = {}
            time.sleep(2)
        for cat, f in mias.items():
            r = reg.get(cat)
            if r:
                f[-3], f[-2] = r.get('LAUNCH_DATE') or '', r.get('LAUNCH_SITE') or ''
            elif cat in lanz_prev:
                f[-3], f[-2] = lanz_prev[cat]
        print(f'{gid}: {len(mias)} · órbita del operador: {sup_n.get(gid, 0)} · catálogo: {len(reg) if pide_cat else "guardado"}')
        grupos.append({'id': gid, 'nombre': nombre, 'n': len(mias)})
        time.sleep(2)
    if not filas:
        print('Sin satélites: no se escribe nada.', file=sys.stderr)
        return False
    ahora = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    salida = {
        'fuente': 'CelesTrak (celestrak.org), elementos orbitales GP y SupGP (efemérides de los operadores)',
        'descargado': ahora,
        'catalogo_descargado': ahora if pide_cat else previo.get('catalogo_descargado', ''),
        'grupos': grupos,
        'campos': ['grupo', 'nombre', 'norad'] + CAMPOS + ['cospar', 'lanzado', 'sitio', 'origen'],
        'sat': filas,
    }
    with open(os.path.join(RAIZ, 'satelites.json'), 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
    print('satélites en total:', len(filas), '· con órbita del operador:', sum(sup_n.values()))
    return True


_AGUA = None
def en_tierra(p):
    """Share of a line (sampled every ~10 km) that is on land, by the water mask Órbita ships; 0 when no mask."""
    global _AGUA
    if _AGUA is None:
        try:
            from fibra_tierra import Agua
            _AGUA = Agua()
        except Exception as e:
            print('sin máscara de agua para los cables:', e); _AGUA = False
    if not _AGUA or not getattr(_AGUA, 'm', None): return 0.0
    n = t = 0
    for a, b in zip(p, p[1:]):
        k = max(1, int(km(a, b) / 10))
        for j in range(k):
            f = j / k; n += 1
            if not _AGUA.mar(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f): t += 1
    return t / n if n else 0.0

def junto_al_mar(p):
    """True when some point of the line is within about 30 km of the sea (a landing stretch of a real cable)."""
    if not _AGUA or not getattr(_AGUA, 'm', None): return True
    return any(_AGUA.mar(x + dx, y + dy) for x, y in p for dx in (-0.3, 0, 0.3) for dy in (-0.3, 0, 0.3))

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


def wikidata_centros(edificios, empresas):
    """Data centres and the companies that run them, as Wikidata states them (CC0): for a building, when it opened
    (P571/P729), owner (P127), operator (P137), floor area (P2046) and power (P2109); for a company, its country (P17),
    founding year (P571), parent company (P749) and headquarters (P159). Only stated values; nothing guessed."""
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

    def todos(qs, props='claims|labels'):
        ent = {}
        for i in range(0, len(qs), 50):
            ent.update(lote(qs[i:i + 50], props))
            time.sleep(1)
        return ent

    def anio(cl, ps):
        for p in ps:
            for c in cl.get(p, []):
                v = valor(c)
                if isinstance(v, dict) and v.get('time', '')[1:5].isdigit():
                    return int(v['time'][1:5])
        return None

    def ids(cl, p):
        return [valor(c).get('id') for c in cl.get(p, []) if isinstance(valor(c), dict) and valor(c).get('id')]

    def cantidad(cl, p, unidades):
        for c in cl.get(p, []):
            v = valor(c)
            if isinstance(v, dict) and 'amount' in v:
                u = v.get('unit', '').rsplit('/', 1)[-1]
                if u in unidades:
                    return float(v['amount']) * unidades[u]
        return None

    def etiqueta(e):
        lab = e.get('labels', {}) if isinstance(e, dict) else {}
        for l in ('es', 'en', 'pt'):
            if l in lab:
                return lab[l]['value']
        return ''

    otros, ed, em = set(), {}, {}
    for q, e in todos(edificios).items():
        if not isinstance(e, dict):
            continue
        cl, d = e.get('claims', {}), {}
        a = anio(cl, ('P729', 'P571', 'P1619'))
        if a:
            d['desde'] = a
        for p, k in (('P127', 'duenos'), ('P137', 'operan')):
            v = ids(cl, p)
            if v:
                d[k] = v; otros.update(v)
        m2 = cantidad(cl, 'P2046', {'Q25343': 1, 'Q35852': 10000, 'Q712226': 1e6})   # m², hectare, km²
        if m2:
            d['m2'] = round(m2)
        mw = cantidad(cl, 'P2109', {'Q25236': 1e-6, 'Q6982035': 1})  # watt, megawatt (other units are skipped, not guessed)
        if mw:
            d['mw'] = round(mw, 1)
        if d:
            ed[q] = d
    for q, e in todos(empresas).items():
        if not isinstance(e, dict):
            continue
        cl, d = e.get('claims', {}), {'n': etiqueta(e)}
        a = anio(cl, ('P571',))
        if a:
            d['fundada'] = a
        for p, k in (('P17', 'pais'), ('P749', 'matriz'), ('P159', 'sede')):
            v = ids(cl, p)
            if v:
                d[k] = v[0]; otros.add(v[0])
        em[q] = d
    # names of everything referred to, and the ISO code of each country
    nombres, iso = {}, {}
    for q, e in todos(sorted(otros)).items():
        if not isinstance(e, dict):
            continue
        nombres[q] = etiqueta(e)
        for c in e.get('claims', {}).get('P297', []):
            v = valor(c)
            if isinstance(v, str):
                iso[q] = v
    for d in ed.values():
        for k in ('duenos', 'operan'):
            if k in d:
                d[k] = [nombres[q] for q in d[k] if nombres.get(q)]
    for d in em.values():
        if 'pais' in d:
            d['pais'] = iso.get(d['pais']) or nombres.get(d['pais'], '')
        for k in ('matriz', 'sede'):
            if k in d:
                d[k] = nombres.get(d[k], '')
    print('wikidata centros:', len(ed), 'edificios,', len(em), 'empresas')
    return {'edificios': ed, 'empresas': em}


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
        # 22 Oct 2026 (owner, with a friend: «en el medio de Alemania aparecen cables submarinos»): OpenStreetMap
        # also tags short river or canal crossings and some land fibre as «underwater»; a way that runs mostly over
        # land is not a submarine cable. A named one longer than 150 km is kept (the Suez land crossing of real
        # systems, for example); the rest go.
        if en_tierra(p) > 0.6 and not (n and (largo >= 150 or junto_al_mar(p))):
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
  nwr["building"="data_center"];
  nwr["office"="data_center"];
  nwr["industrial"="data_center"];
  nwr["man_made"="data_center"];
  nwr["telecom"="internet_exchange"];
);
out tags center;''')
    if not d:
        print('Sin puntos: no se escribe nada.', file=sys.stderr)
        return False
    out, extra, vistos, cuenta = [], [], set(), {'aterrizaje': 0, 'datos': 0, 'intercambio': 0}
    for e in d.get('elements', []):
        t = e.get('tags', {})
        c = e.get('center') or ({'lat': e['lat'], 'lon': e['lon']} if 'lat' in e else None)
        if not c or any(k in t for k in ('disused', 'abandoned', 'removed', 'razed', 'end_date')):
            continue
        tipo = 'aterrizaje' if t.get('telecom') == 'cable_landing_station' else 'intercambio' if t.get('telecom') == 'internet_exchange' else 'datos'
        # the same building can be a node (telecom=data_center) and an outline (building=data_center): one entry
        nombre = (t.get('name') or t.get('name:en') or '').strip().lower()
        claves = [(tipo, round(c['lon'], 3), round(c['lat'], 3))] + ([(tipo, nombre, round(c['lon'], 2), round(c['lat'], 2))] if nombre else [])
        if any(k in vistos for k in claves):
            continue
        vistos.update(claves); cuenta[tipo] += 1
        out.append([round(c['lon'], 3), round(c['lat'], 3), tipo, t.get('name') or t.get('name:en') or '', t.get('operator', '')])
        # 22 Oct 2026 (owner: «de los centros de datos, quiero saberlo todo: dueño, año, tecnologías…»): every tag
        # OpenStreetMap has that says something real about the building, kept as written there
        x = {}
        for k, n in (('owner', 'dueno'), ('start_date', 'desde'), ('website', 'web'), ('contact:website', 'web'), ('building:levels', 'plantas'),
                     ('height', 'alto'), ('addr:city', 'ciudad'), ('wikidata', 'w'), ('operator:wikidata', 'ow'), ('brand', 'marca'),
                     ('operator:type', 'tipoop'), ('telecom:medium', 'medio'), ('data_center:tier', 'tier'), ('tier', 'tier'), ('pue', 'pue'),
                     ('power', 'potencia'), ('capacity', 'capacidad'), ('description', 'nota'), ('name:es', 'nes'), ('name:en', 'nen')):
            v = t.get(k)
            if v and n not in x and len(v) < 160:
                x[n] = v
        extra.append(x or 0)
    salida = {
        'fuente': 'OpenStreetMap',
        'licencia': 'ODbL 1.0 · © colaboradores de OpenStreetMap',
        'descargado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'medida': cuenta,
        'campos': ['lon', 'lat', 'tipo', 'nombre', 'operador'],
        'puntos': out,
        'extra': extra,
    }
    # what Wikidata (CC0) states about the buildings and about the companies that run them
    try:
        wd = wikidata_centros(sorted({x['w'] for x in extra if x and x.get('w')}), sorted({x['ow'] for x in extra if x and x.get('ow')}))
        salida['wikidata'] = wd
    except Exception as e:  # noqa: BLE001
        print('wikidata centros: fallo', e, file=sys.stderr)
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
