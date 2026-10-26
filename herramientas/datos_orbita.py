#!/usr/bin/env python3
"""Real data for Órbita's planet, downloaded to our own site so visitors never contact a third party.

- Communication satellites: orbital elements (GP/OMM) from CelesTrak every 6 hours, replaced by the operators' own
  ephemerides (SupGP) where CelesTrak publishes them; launch date and site from the satellite catalogue (SATCAT).
  CelesTrak updates GP every 2 hours; we never ask for the same data more than once per update.
- Submarine cables: OpenStreetMap (ODbL, © OpenStreetMap contributors), once a week.

Only the standard library. Writes orbita/datos/satelites.json and orbita/datos/cables.json.
"""
import collections, json, math, os, re, sys, time, urllib.parse, urllib.request
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
    # A group whose download comes back empty keeps its rows from the last download, with that download's date, for up
    # to 3 days (22 Oct 2026, 22:55Z: Starlink came back empty and the map said «0 Starlink satellites» until the next
    # update). Older than that, the orbits are too stale to draw and the group is left out.
    campos = ['grupo', 'nombre', 'norad'] + CAMPOS + ['cospar', 'lanzado', 'sitio', 'origen']
    ahora = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    guardados, fecha_prev = {}, {}
    if pc == campos:
        ids = [x.get('id') for x in previo.get('grupos', [])]
        for r in previo.get('sat', []):
            if isinstance(r[0], int) and 0 <= r[0] < len(ids):
                guardados.setdefault(ids[r[0]], []).append(r)
        fecha_prev = {x.get('id'): x.get('descargado') or previo.get('descargado', '') for x in previo.get('grupos', [])}

    def reciente(fecha):
        try:
            t = datetime.strptime(fecha or '', '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
        except ValueError:
            return False
        return (datetime.now(timezone.utc) - t).total_seconds() <= 3 * 86400

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
        guardado = False
        if not mias and guardados.get(gid) and reciente(fecha_prev.get(gid)):
            for r in guardados[gid]:
                if r[2] in vistos:
                    continue
                vistos.add(r[2]); f = list(r); f[0] = g; filas.append(f); mias[r[2]] = f
            guardado = True
            print(f'  {gid}: la descarga llegó vacía; se conservan los {len(mias)} de la descarga de {fecha_prev.get(gid)}', file=sys.stderr)
        # the operator's own orbit, when CelesTrak publishes it and it is newer
        if gid in SUPGP and mias and not guardado:
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
        if pide_cat and not guardado:
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
        grupos.append({'id': gid, 'nombre': nombre, 'n': len(mias), 'descargado': fecha_prev.get(gid, '') if guardado else ahora})
        time.sleep(2)
    if not filas or not any(x['descargado'] == ahora for x in grupos):
        print('Sin satélites nuevos: no se escribe nada.', file=sys.stderr)
        return False
    salida = {
        'fuente': 'CelesTrak (celestrak.org), elementos orbitales GP y SupGP (efemérides de los operadores)',
        'descargado': ahora,
        'catalogo_descargado': ahora if pide_cat else previo.get('catalogo_descargado', ''),
        'grupos': grupos,
        'campos': campos,
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

# 23 Oct 2026 (owner, on a short cable east of Dominica: «un cable submarino cortito que no comunica con nada; mira
# a ver si es real o hay un error»): «ECFS 6.1» is a piece of the Eastern Caribbean Fiber System that OpenStreetMap
# has on its own in open sea, joined to none of the other ECFS pieces. Such pieces go: a way whose two ends touch
# nothing — no land within 30 km (water mask), no city within 25 km (GeoNames), no landing station, no other way's end
# within 5 km and no piece of its own system within 20 km — when it is unnamed, an umbilical or an oil company's
# (platform links), or a stray piece of a system mapped elsewhere. A named link on its own stays (Fehmarn Belt or the
# Azores, whose small islands the 20 km mask does not show).
PETROLERAS = ('chevron', 'lundin', 'equinor', 'shell', 'bp ', 'bp exploration', 'petrocom', 'aker bp', 'conocophillips', 'totalenergies', 'exxon', 'woodside', 'petrobras', 'aramco', 'adnoc')

def sistema(n):
    """The cable system a way belongs to: its name without segment numbers, letters, «seg», «branch» or brackets."""
    n = re.sub(r'\(.*?\)', '', (n or '').lower())
    n = re.sub(r"\b(seg(ment)?|s\d+(\.\d+)*|\d+(\.\d+)*(/\d+)?|[a-z]'?|branch|ramal|tramo)\b", ' ', n)
    return re.sub(r'[^a-z]', '', n).replace('souh', 'south')

def quita_sueltos(out):
    global _AGUA
    if _AGUA is None:
        try:
            from fibra_tierra import Agua
            _AGUA = Agua()
        except Exception as e:
            print('sin máscara de agua para los cables:', e); _AGUA = False
    if not _AGUA or not getattr(_AGUA, 'm', None): return out
    lugares = collections.defaultdict(list)  # cities and landing stations in half-degree cells
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from lugares_capas import lee_ciudades
        for n, cc, la, lo in lee_ciudades(): lugares[(int((lo + 180) // 0.5) % 720, int((la + 90) // 0.5))].append((lo, la))
    except Exception as e:
        print('sin ciudades para los cables sueltos:', e)
    try:
        P = json.load(open(os.path.join(RAIZ, 'puntos.json'), encoding='utf-8')); c = P['campos']
        for x in P['puntos']:
            if x[c.index('tipo')] == 'aterrizaje':
                lo, la = x[c.index('lon')], x[c.index('lat')]; lugares[(int((lo + 180) // 0.5) % 720, int((la + 90) // 0.5))].append((lo, la))
    except Exception:
        pass
    celda = lambda p: (int((p[0] + 180) // 0.5) % 720, int((p[1] + 90) // 0.5))
    def cerca(rejilla, p, r):
        gx, gy = celda(p)
        return any(km(p, q[1] if isinstance(q[0], int) else q) <= r for dx in (-1, 0, 1) for dy in (-1, 0, 1) for q in rejilla.get(((gx + dx) % 720, gy + dy), ()))
    extremos, vertices = collections.defaultdict(list), collections.defaultdict(list)
    for i, f in enumerate(out):
        for p in (f['l'][0], f['l'][-1]): extremos[celda(p)].append((i, p))
        for p in f['l']: vertices[celda(p)].append((i, p))
    sistemas = collections.Counter(sistema(f['n']) for f in out if sistema(f['n']))
    def tierra_cerca(p, r_km=30):
        rp = int(r_km / 19.5) + 1
        return any(not _AGUA.mar(p[0] + dx * 0.176, p[1] + dy * 0.176) for dx in range(-rp, rp + 1) for dy in range(-rp, rp + 1))
    def atado(i, p):
        if abs(p[0]) >= 179.8 or tierra_cerca(p) or cerca(lugares, p, 25): return True
        gx, gy = celda(p); si = sistema(out[i]['n'])
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for j, q in extremos.get(((gx + dx) % 720, gy + dy), ()):
                    if j != i and km(p, q) <= 5: return True
                if si:
                    for j, q in vertices.get(((gx + dx) % 720, gy + dy), ()):
                        if j != i and sistema(out[j]['n']) == si and km(p, q) <= 20: return True
        return False
    quedan, fuera = [], []
    for i, f in enumerate(out):
        if not atado(i, f['l'][0]) and not atado(i, f['l'][-1]):
            n, o, si = f['n'] or '', (f.get('o') or '').lower(), sistema(f['n'])
            if not n or 'umbilical' in n.lower() or any(x in o for x in PETROLERAS) or sistemas[si] > 1:
                fuera.append(n or '(sin nombre)'); continue
        quedan.append(f)
    if fuera: print('cables sueltos en mar abierto, fuera:', len(fuera), '·', ', '.join(sorted(set(fuera))))
    return quedan

def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(min(1, math.sqrt(h)))


def simplifica_cerca(p, cerca_km=40, fino=0.0002, grueso=0.05):
    """25 Oct 2026: the planet now opens to about 20 km of height (≈ 10 m a pixel), and Douglas-Peucker at 0.05° (5 km)
    cut the last kilometres of a cable straight across bays and capes. The first and last 40 km keep their shape (20 m);
    the open sea stays simple."""
    if len(p) < 3:
        return p
    acc, i = 0.0, 0
    while i < len(p) - 1 and acc < cerca_km:
        acc += km(p[i], p[i + 1]); i += 1
    acc, j = 0.0, len(p) - 1
    while j > i and acc < cerca_km:
        acc += km(p[j - 1], p[j]); j -= 1
    return simplifica(p[:i + 1], fino) + simplifica(p[i:j + 1], grueso)[1:] + simplifica(p[j:], fino)[1:]


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
    for servidor in ('https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'):
        cuerpo = baja(servidor, urllib.parse.urlencode({'data': q}).encode())
        if cuerpo:
            break
    if not cuerpo:
        print('Sin cables: no se escribe nada.', file=sys.stderr)
        return False
    d = json.loads(cuerpo)
    out, nombres = [], set()
    for e in d.get('elements', []):
        g = e.get('geometry') or []
        if len(g) < 2:
            continue
        # 25 Oct 2026, 19:01 (owner, close in: «los cables no llegan a tierra»): 5 decimals (1 m), not 3 (110 m)
        p = [[round(x['lon'], 5), round(x['lat'], 5)] for x in g]
        largo = sum(km(p[i], p[i + 1]) for i in range(len(p) - 1))
        t = e.get('tags', {})
        # only cables in service: nothing disused, abandoned, removed, historic or with an end date
        if any(k in t for k in ('disused', 'abandoned', 'historic', 'removed', 'razed', 'end_date', 'disused:communication', 'abandoned:communication')) \
                or t.get('operational_status') in ('closed', 'abandoned', 'disused') or t.get('lifecycle') in ('disused', 'abandoned'):
            continue
        if t.get('power') or 'power' in (t.get('seamark:cable_submarine:category') or '').lower():
            continue
        n = t.get('name') or t.get('name:en') or t.get('seamark:name') or ''
        n = re.sub(r'\bSouh\b', 'South', n)  # a typo in OpenStreetMap («Souh America-1»; 23 Oct 2026)
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
            s = simplifica_cerca(tr)
            if len(s) >= 2:
                fila = {'n': n, 'o': t.get('operator', ''), 'l': s}
                # owner, 22 Oct 2026: «el año de la construcción, los kilómetros… todos los datos que sepamos»
                anio = (t.get('start_date') or '')[:4]
                if anio.isdigit(): fila['y'] = int(anio)
                if t.get('owner'): fila['d'] = t['owner']
                if t.get('website'): fila['web'] = t['website']
                if t.get('wikidata', '').startswith('Q'): fila['w'] = t['wikidata']
                out.append(fila)
    out = quita_sueltos(out)
    # 23 Oct 2026: the length counts only what the map draws (it used to add the disused, power and land ways it left out)
    total = sum(km(a, b) for f in out for a, b in zip(f['l'], f['l'][1:]))
    nombres = {f['n'].strip() for f in out if f['n']}
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
    for servidor in ('https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'):
        cuerpo = baja(servidor, urllib.parse.urlencode({'data': q}).encode(), 1, 240)
        if cuerpo:
            try:
                return json.loads(cuerpo)
            except ValueError:
                print('  Overpass: respuesta no es JSON', file=sys.stderr)
    return None


CAMPUS_KM = 0.6


def junta_campus(salida):
    """25 Oct 2026, 20:27 (owner, on Abilene: «me salen 39… toco y me dice centro de datos sin nombre y me aparece una
    lista enorme»): OpenStreetMap maps some campuses building by building, with no name. Data centres with no name, of
    the same operator (or none), less than 600 m from each other, become one point that says how many buildings it has
    («edificios» in its extra)."""
    P, X = salida['puntos'], salida['extra']
    while len(X) < len(P): X.append(0)
    idx = [i for i, p in enumerate(P) if p[2] == 'datos' and not (p[3] or '').strip() and not (X[i] or {}).get('w')]
    padre = {i: i for i in idx}
    def raiz(i):
        while padre[i] != i:
            padre[i] = padre[padre[i]]; i = padre[i]
        return i
    orden = sorted(idx, key=lambda i: P[i][1])
    for a in range(len(orden)):
        i = orden[a]
        for b in range(a + 1, len(orden)):
            j = orden[b]
            if P[j][1] - P[i][1] > CAMPUS_KM / 111: break
            if (P[i][4] or '') == (P[j][4] or '') and km((P[i][0], P[i][1]), (P[j][0], P[j][1])) <= CAMPUS_KM:
                padre[raiz(i)] = raiz(j)
    grupos = {}
    for i in idx: grupos.setdefault(raiz(i), []).append(i)
    fuera = set()
    for g in grupos.values():
        if len(g) < 2: continue
        g.sort(); k = g[0]
        P[k][0] = round(sum(P[i][0] for i in g) / len(g), 3); P[k][1] = round(sum(P[i][1] for i in g) / len(g), 3)
        x = dict(X[k] or {})
        for i in g[1:]:
            for c, v in (X[i] or {}).items(): x.setdefault(c, v)
        x['edificios'] = sum((X[i] or {}).get('edificios', 1) for i in g)
        X[k] = x; fuera.update(g[1:])
    salida['puntos'] = [p for i, p in enumerate(P) if i not in fuera]
    salida['extra'] = [x for i, x in enumerate(X) if i not in fuera]
    if isinstance(salida.get('medida'), dict) and 'datos' in salida['medida']:
        salida['medida']['datos'] = sum(1 for p in salida['puntos'] if p[2] == 'datos')
    print('campus juntados:', sum(1 for g in grupos.values() if len(g) >= 2), '· edificios quitados de la lista:', len(fuera))
    nombra_campus(salida)


def nombra_campus(salida):
    """25 Oct 2026 (ronda 38 de la agencia): the operator and name of a campus OpenStreetMap leaves unnamed, confirmed by
    two voices (herramientas/fuentes/campus-operadores.json); applied to the nearest unnamed campus within 1.5 km."""
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes', 'campus-operadores.json')
    if not os.path.exists(ruta): return
    try: lista = json.load(open(ruta, encoding='utf-8')).get('campus', [])
    except (OSError, ValueError): return
    P, X = salida['puntos'], salida['extra']
    puestos = 0
    for c in lista:
        if any(p[2] == 'datos' and p[3] == c['nombre'] and km((c['lon'], c['lat']), (p[0], p[1])) < 1.5 for p in P): continue  # already named (idempotent)
        mejor, dm = None, 1.5
        for i, p in enumerate(P):
            if p[2] != 'datos' or (p[3] or '').strip(): continue
            d = km((c['lon'], c['lat']), (p[0], p[1]))
            if d < dm: mejor, dm = i, d
        if mejor is None: continue
        P[mejor][3] = c['nombre']; P[mejor][4] = c['operador']
        x = dict(X[mejor] or {}); x['nota'] = x.get('nota') or 'Operador confirmado por la agencia GUARDIANA con dos fuentes públicas'; x['fuentes'] = c.get('fuentes', [])
        X[mejor] = x; puestos += 1
    print('campus con operador (ronda 38):', puestos, 'de', len(lista))


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
    # 22 Oct 2026: the buildings tagged as data centres without the telecom tag, in a second, lighter query
    # (about 1,300 more; if Overpass is slow with this one, the first set is still saved)
    d2 = overpass('''[out:json][timeout:220];
(
  nwr["building"="data_center"];
  nwr["office"="data_center"];
  nwr["industrial"="data_center"];
  nwr["man_made"="data_center"];
);
out tags center;''')
    if d2 and d2.get('elements'):
        print('edificios data_center sin etiqueta telecom:', len(d2['elements']))
        d['elements'] = list(d.get('elements', [])) + list(d2['elements'])
    else:
        print('Sin la segunda consulta de centros de datos (edificios).', file=sys.stderr)
    out, extra, vistos, cuenta = [], [], set(), {'aterrizaje': 0, 'datos': 0, 'intercambio': 0}
    mismos = {}
    for e in d.get('elements', []):
        t = e.get('tags', {})
        c = e.get('center') or ({'lat': e['lat'], 'lon': e['lon']} if 'lat' in e else None)
        if not c or any(k in t for k in ('disused', 'abandoned', 'removed', 'razed', 'end_date')):
            continue
        tipo = 'aterrizaje' if t.get('telecom') == 'cable_landing_station' else 'intercambio' if t.get('telecom') == 'internet_exchange' else 'datos'
        # the same building can be a node (telecom=data_center) and an outline (building=data_center): one entry
        nombre = (t.get('name') or t.get('name:en') or '').strip().lower()
        claves = [(tipo, round(c['lon'], 3), round(c['lat'], 3))]
        if any(k in vistos for k in claves):
            continue
        # 25 Oct 2026 (revisa_puntos: 79 buildings of one campus, same name, less than 1 km apart, split by the 0.01°
        # grid): one point per name within 1 km
        if nombre and any(km((c['lon'], c['lat']), q) < 1 for q in mismos.get((tipo, nombre), ())):
            continue
        vistos.update(claves); cuenta[tipo] += 1
        if nombre: mismos.setdefault((tipo, nombre), []).append((c['lon'], c['lat']))
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
    junta_campus(salida)
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
