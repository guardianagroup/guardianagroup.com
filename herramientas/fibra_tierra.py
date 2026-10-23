#!/usr/bin/env python3
"""GUARDIANA · Órbita · the main land fibre backbones (owner, 22 Oct 2026: «las redes troncales de tierra, las
principales, habría que marcarlas… búscalo por todo internet»).

Operators almost never publish their exact routes, so there is no open world map of land fibre. This tool joins
every open source we found, keeps what each one says about itself, and writes orbita/datos/fibra-tierra.json:

  1. AfTerFibre (Steve Song, NSRC): African terrestrial fibre, CC BY 4.0.
     https://github.com/stevesong/afterfibre-kml  ·  https://afterfiber.nsrc.org
  2. OFDS public data (Open Telecoms Data, Internet Society project): national backbones in the Open Fibre Data
     Standard, digitised from the operators' own public maps. Approximate routes; the repository states no licence
     yet, so these lines are marked «licencia por confirmar» and can be left out with --sin-ofds.
     https://github.com/Open-Telecoms-Data/OFDS-public-data
  3. OpenStreetMap (ODbL): named or operated land telecom lines of 50 km or more, from tierra-borrador.json
     (written by datos_orbita.py).
  4. The Internet Topology Zoo (University of Adelaide, CC BY 4.0): city-to-city links of real backbones world
     wide (GÉANT, Cogent, Tata…), as straight lines, from herramientas/fuentes/topology-zoo.json written by
     fibra_zoo.py (committed, because the Zoo's site is not reachable from every runner).
     http://www.topology-zoo.org
  5. The GUARDIANA agency: big countries' backbones that two voices confirm separately, city to city, from
     herramientas/fuentes/fibra-agencia.json written by fibra_agencia.py.

Every line keeps its source; nothing is drawn where no source has data. Planned and metro lines are left out:
only long-distance fibre that the source gives as built (or does not qualify).

Usage: python3 herramientas/fibra_tierra.py [--sin-ofds] [--fuentes DIR]
"""
import glob, json, math, os, re, subprocess, sys
from datetime import datetime, timezone

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'orbita')
DATOS = os.path.join(RAIZ, 'datos')
REPOS = {
    'afterfibre': 'https://github.com/stevesong/afterfibre-kml.git',
    'ofds': 'https://github.com/Open-Telecoms-Data/OFDS-public-data.git',
}

# OFDS folders are English country names; ISO 3166-1 alpha-2 for the page (it names countries in each language)
PAISES = {
    'Angola': 'AO', 'Australia': 'AU', 'Botswana': 'BW', 'Brazil': 'BR', 'Burundi': 'BI', 'Cameroon': 'CM',
    'Canada': 'CA', 'Congo_Republic': 'CG', 'Congo': 'CG', 'Costa_Rica': 'CR', 'Cote_dIvoire': 'CI', 'DRC': 'CD',
    'Gabon': 'GA', 'Georgia': 'GE', 'Guinea': 'GN', 'Kenya': 'KE', 'Mozambique': 'MZ', 'Namibia': 'NA',
    'New_Zealand': 'NZ', 'Nicaragua': 'NI', 'Niger': 'NE', 'Nigeria': 'NG', 'Panama': 'PA', 'Philippines': 'PH',
    'Romania': 'RO', 'Rwanda': 'RW', 'South_Africa': 'ZA', 'Sudan': 'SD', 'Tajikistan': 'TJ', 'Tanzania': 'TZ',
    'Togo': 'TG', 'Uganda': 'UG', 'Venezuela': 'VE', 'Zambia': 'ZM', 'Zimbabwe': 'ZW', 'Algeria': 'DZ',
    'Ethiopia': 'ET', 'Ghana': 'GH', 'Libya': 'LY', 'Madagascar': 'MG', 'Mali': 'ML', 'Mauritania': 'MR',
    'Morocco': 'MA', 'Senegal': 'SN', 'Somalia': 'SO',
}


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(min(1, math.sqrt(h)))


def largo(l):
    return sum(km(p, q) for p, q in zip(l, l[1:]))


def simplifica(l, tol=0.02):
    """Douglas–Peucker in degrees (0.02° ≈ 2 km): the page draws a planet, not a street map."""
    if len(l) < 3:
        return l
    a, b = l[0], l[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    n = math.hypot(dx, dy) or 1e-12
    dmax, imax = 0, 0
    for i in range(1, len(l) - 1):
        p = l[i]
        d = abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / n if n > 1e-12 else math.hypot(p[0] - a[0], p[1] - a[1])
        if d > dmax:
            dmax, imax = d, i
    if dmax <= tol:
        return [a, b]
    return simplifica(l[:imax + 1], tol)[:-1] + simplifica(l[imax:], tol)


def lineas_de(geom):
    if not geom:
        return []
    if geom['type'] == 'LineString':
        return [geom['coordinates']]
    if geom['type'] == 'MultiLineString':
        return geom['coordinates']
    return []


def redondea(l):
    out = []
    for p in l:
        q = [round(p[0], 3), round(p[1], 3)]
        if not out or out[-1] != q:
            out.append(q)
    return out


def trae(nombre, dirfuentes):
    d = os.path.join(dirfuentes, nombre)
    if not os.path.isdir(d):
        subprocess.run(['git', 'clone', '-q', '--depth', '1', REPOS[nombre], d], check=True)
    fecha = subprocess.run(['git', '-C', d, 'log', '-1', '--format=%cs'], capture_output=True, text=True).stdout.strip()
    return d, fecha


def campo(desc, clave):
    # «Name:» is also the end of «Phase Name:», so the operator's Name must not follow «Phase »
    pre = r'(?<!Phase )' if clave == 'Name' else ''
    m = re.search(pre + clave + r':\s*([^\n]*?)\s*(?=(?<!Phase )Name:|Phase Name:|Cable type:|ISO2:|ISO3:|Source URL:|Notes:|\n|$)', desc or '')
    return m.group(1).strip() if m else ''


def estado_de(fase):
    f = (fase or '').lower()
    if 'plan' in f or 'propos' in f:
        return 'plan'
    if 'construct' in f or 'progress' in f:
        return 'obra'
    if 'metro' in f:
        return 'metro'
    return 'ok'


def afterfibre(d):
    out = []
    for f in sorted(glob.glob(os.path.join(d, '**', '*.geojson'), recursive=True)):
        pais_dir = os.path.relpath(f, d).split(os.sep)[0]
        for ft in json.load(open(f, encoding='utf-8'))['features']:
            p = {k.lower(): v for k, v in (ft.get('properties') or {}).items()}
            desc = p.get('description') or ''
            iso = (campo(desc, 'ISO2') or '').strip().upper()[:2]
            cc = iso if re.fullmatch(r'[A-Z]{2}', iso or '') else PAISES.get(pais_dir, '')
            for l in lineas_de(ft.get('geometry')):
                out.append({'n': (p.get('name') or '').strip(), 'o': campo(desc, 'Name'), 'cc': cc,
                            'e': estado_de(campo(desc, 'Phase Name')), 'l': [c[:2] for c in l]})
    return out


def ofds(d):
    out = []
    for f in sorted(glob.glob(os.path.join(d, '*', '*', '*ofds-spans*.geojson'))):
        rel = os.path.relpath(f, d).split(os.sep)
        cc = PAISES.get(rel[0], '')
        red = rel[1].replace('_', ' ')
        for ft in json.load(open(f, encoding='utf-8'))['features']:
            p = ft.get('properties') or {}
            prov = p.get('networkProviders') or []
            op = (prov[0].get('name') if prov and isinstance(prov[0], dict) else '') or red
            st = (p.get('status') or '').lower()
            e = 'plan' if st in ('planned', 'inactive', 'decommissioned') else 'obra' if 'construction' in st else 'ok'
            for l in lineas_de(ft.get('geometry')):
                out.append({'n': (p.get('name') or '').strip(), 'o': op, 'cc': cc, 'e': e, 'l': [c[:2] for c in l], 'red': red})
    return out


class Agua:
    """The water mask Órbita already ships (static/tierra/agua.png, 2048×1024): is this point at sea?"""
    def __init__(self):
        try:
            from PIL import Image
            im = Image.open(os.path.join(DATOS, '..', 'static', 'tierra', 'agua.png')).convert('L')
            self.W, self.H = im.size
            self.m = im.tobytes()
        except Exception as e:  # without Pillow the land test is skipped (it only ever drops lines)
            print('sin máscara de agua:', e); self.m = None
    def mar(self, lon, lat):
        if not self.m: return False
        x = int((lon + 180) / 360 * self.W) % self.W; y = min(self.H - 1, max(0, int((90 - lat) / 180 * self.H)))
        return self.m[y * self.W + x] >= 128
    def parte_en_mar(self, l):
        # sample the line every ~20 km so a long straight hop over a bay counts for what it is
        if not self.m: return 0.0
        n = mar = 0
        for a, b in zip(l, l[1:]):
            pasos = max(1, int(km(a, b) / 20))
            for i in range(pasos):
                t = i / pasos
                n += 1; mar += self.mar(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
        return mar / max(1, n)


def osm():
    """OpenStreetMap's telecom lines on land. Owner, 22 Oct 2026: «si dice fibra por tierra y me sale en el mar, no sé»:
    a line that runs mostly over the sea is a submarine cable tagged as a line (FLAG Europe-Asia, for instance), and
    one whose name is a submarine cable of cables.json is the same cable twice; both stay out of this layer."""
    p = os.path.join(DATOS, 'tierra-borrador.json')
    if not os.path.exists(p):
        return [], ''
    d = json.load(open(p, encoding='utf-8'))
    agua = Agua()
    sub = set()
    try:
        for c in json.load(open(os.path.join(DATOS, 'cables.json'), encoding='utf-8')).get('cables', []):
            k = re.sub(r'[^a-z0-9]', '', (c.get('n') or '').lower())
            if len(k) >= 4: sub.add(k)
    except Exception: pass
    out, fuera = [], 0
    for c in d.get('cables', []):
        k = re.sub(r'[^a-z0-9]', '', (c.get('n') or '').lower())
        if (len(k) >= 4 and any(k == s or k in s for s in sub)) or agua.parte_en_mar(c['l']) > 0.2:
            fuera += 1; continue
        out.append({'n': c.get('n', ''), 'o': c.get('o', ''), 'cc': '', 'e': 'ok', 'l': c['l']})
    if fuera: print('OpenStreetMap: fuera', fuera, 'líneas que van por el mar o son cables submarinos')
    return out, (d.get('descargado') or '')[:10]


def zoo():
    """The Internet Topology Zoo, already reduced by fibra_zoo.py to herramientas/fuentes/topology-zoo.json:
    {'fuente': {…}, 'lineas': [{n, o, cc, anio, obra, l}, …]}. Nothing if the file is not there."""
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes', 'topology-zoo.json')
    if not os.path.exists(p):
        return [], None
    try:
        d = json.load(open(p, encoding='utf-8'))
    except Exception as e:
        print('Topology Zoo: no se pudo leer', p, '·', e); return [], None
    # the agency's review, network by network (zoo_agencia.py, 23 Oct 2026): historical maps and networks that two voices
    # do not confirm stay out; absorbed ones carry today's owner (when two voices name the same one) and the map's network
    dec = {}
    pd = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'zoo-agencia', 'decisiones.json')
    if os.path.exists(pd):
        try:
            dec = json.load(open(pd, encoding='utf-8')).get('redes') or {}
        except Exception as e:
            print('Topology Zoo: no se pudo leer la revisión de la agencia ·', e)
    out, fuera = [], 0
    for c in d.get('lineas', []):
        l = c.get('l') or []
        if len(l) < 2 or not all(isinstance(q, list) and len(q) >= 2 for q in l):
            continue
        x = {'n': c.get('n', ''), 'o': c.get('o', ''), 'cc': c.get('cc', '') or '', 'e': 'obra' if c.get('obra') else 'ok', 'l': [q[:2] for q in l]}
        if c.get('anio'):
            x['anio'] = c['anio']
        if dec:
            r = dec.get(x['o'])
            if not r or r.get('accion') != 'deja':  # a network the agency has not confirmed is not drawn
                fuera += 1; continue
            if r.get('red'):
                x['red'], x['n'], x['o'] = r['red'], '', r.get('operador', '')
            else:
                if x['n'] == x['o']:
                    x['n'] = r.get('operador', x['o'])
                x['o'] = r.get('operador', x['o'])
        out.append(x)
    if fuera:
        print('Topology Zoo: fuera', fuera, 'enlaces de redes históricas o sin confirmar por dos voces')
    f = d.get('fuente') or {}
    fuente = {'n': f.get('n') or 'The Internet Topology Zoo (Universidad de Adelaida)', 'lic': f.get('lic') or 'CC BY 4.0',
              'url': f.get('url') or 'http://www.topology-zoo.org', 'fecha': f.get('fecha') or '',
              'nota': f.get('nota') or 'Enlaces entre ciudades de redes troncales reales, en línea recta: la ruta exacta no es pública.'}
    return out, fuente


def mismo(a, b):
    s = lambda x: re.sub(r'[^a-z0-9]', '', (x or '').lower())
    a, b = s(a), s(b)
    return bool(a and b and (a in b or b in a))


def main():
    sin_ofds = '--sin-ofds' in sys.argv
    dirf = sys.argv[sys.argv.index('--fuentes') + 1] if '--fuentes' in sys.argv else os.path.join(os.environ.get('RUNNER_TEMP', '/tmp'), 'fibra-fuentes')
    os.makedirs(dirf, exist_ok=True)

    fuentes, lineas = [], []
    da, fa = trae('afterfibre', dirf)
    fuentes.append({'n': 'AfTerFibre (Steve Song, NSRC)', 'lic': 'CC BY 4.0', 'url': 'https://afterfiber.nsrc.org', 'fecha': fa,
                    'nota': 'Rutas trazadas a partir de los mapas que publica cada operadora; aproximadas.'})
    af = afterfibre(da)
    for x in af:
        x['f'] = 0
    lineas += af

    if not sin_ofds:
        do, fo = trae('ofds', dirf)
        fuentes.append({'n': 'Open Fibre Data Standard · datos públicos (Open Telecoms Data)', 'lic': 'por confirmar',
                        'url': 'https://github.com/Open-Telecoms-Data/OFDS-public-data', 'fecha': fo,
                        'nota': 'Digitalizado de los mapas públicos de cada operadora; los puntos de presencia son aproximados y los trazados entre ellos, orientativos.'})
        ya = {(x['cc'], x['o']) for x in af}
        for x in ofds(do):
            # the same network already in AfTerFibre (CC BY 4.0) keeps that version
            if any(cc == x['cc'] and (mismo(o, x['o']) or mismo(o, x['red'])) for cc, o in ya):
                continue
            x['f'] = len(fuentes) - 1
            x.pop('red', None)
            lineas.append(x)

    ol, fosm = osm()
    if ol:
        fuentes.append({'n': 'OpenStreetMap', 'lic': 'ODbL 1.0 · © colaboradores de OpenStreetMap', 'url': 'https://www.openstreetmap.org/copyright', 'fecha': fosm,
                        'nota': 'Solo líneas de telecomunicación con nombre u operador y 50 km o más.'})
        for x in ol:
            if largo(x['l']) >= 50:
                x['f'] = len(fuentes) - 1
                lineas.append(x)

    zl, fz = zoo()
    if zl:
        fuentes.append(fz)
        for x in zl:
            x['f'] = len(fuentes) - 1
            lineas.append(x)

    # 5. the agency's backbones (two voices, see fibra_agencia.py): last, so earlier lines keep their place
    pa = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes', 'fibra-agencia.json')
    if os.path.exists(pa):
        dag = json.load(open(pa, encoding='utf-8'))
        if dag.get('lineas'):
            fuentes.append(dag['fuente'])
            for c in dag['lineas']:
                lineas.append({'n': c['n'], 'o': c['o'], 'cc': c['cc'], 'e': 'ok', 'l': c['l'], 'f': len(fuentes) - 1})

    salida, tot, paises, por_f = [], 0.0, set(), {}
    for x in lineas:
        if x['e'] in ('plan', 'metro'):
            continue
        l = redondea(simplifica(x['l']))
        if len(l) < 2:
            continue
        k = largo(x['l'])
        if k < 5:
            continue
        tot += k
        if x['cc']:
            paises.add(x['cc'])
        por_f[x['f']] = por_f.get(x['f'], 0) + k
        r = {'n': x['n'], 'o': x['o'], 'cc': x['cc'], 'f': x['f'], 'km': round(k), 'l': l}
        if x['e'] == 'obra':
            r['obra'] = 1
        if x.get('anio'):
            r['anio'] = x['anio']
        if x.get('red'):
            r['red'] = x['red']  # the network in the map, now part of another company (the card says so)
        salida.append(r)

    for i, f in enumerate(fuentes):
        f['km'] = round(por_f.get(i, 0))
    res = {
        'generado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ'),
        'fuentes': fuentes,
        'medida': {'lineas': len(salida), 'km': round(tot), 'paises': sorted(paises)},
        'lineas': salida,
    }
    with open(os.path.join(DATOS, 'fibra-tierra.json'), 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, separators=(',', ':'))
    print('fibra de tierra:', len(salida), 'líneas,', round(tot), 'km,', len(paises), 'países')
    for i, f in enumerate(fuentes):
        print('  ', f['n'], '·', f['lic'], '·', f['km'], 'km')


if __name__ == '__main__':
    main()
