#!/usr/bin/env python3
"""GUARDIANA · Órbita · land backbones from The Internet Topology Zoo (University of Adelaide, CC BY 4.0).

The Zoo (http://www.topology-zoo.org · Knight, Nguyen, Falkner, Bowden & Roughan, IEEE JSAC 2011) holds some 260
real networks, traced by hand from the maps each operator published: research networks (GÉANT, Internet2, DFN…),
carriers (Cogent, Level 3, Tata, Telstra…), governments. Each node is a city with Latitude/Longitude and Country;
each edge a link between two of them. Operators do not publish the exact route, so every link here is a straight
line between the two cities, and the page says so.

Reads every .gml and .graphml found under the directory given (the Zoo ships both; GitHub mirrors usually keep the
GML files) and writes herramientas/fuentes/topology-zoo.json, which fibra_tierra.py picks up through zoo():

  {'fuente': {n, lic, url, fecha, nota, km}, 'lineas': [{n, o, cc, anio, obra, l: [[lon,lat],[lon,lat]]}, …]}

What stays out: networks typed Testbed or whose layer is not a data network (ARPA, telephone), maps older than 1995,
external nodes (Internal 0: other people's networks), hyperedge nodes, nodes without coordinates, wireless and
planned links, links over 3000 km, and links whose straight line runs mostly over the sea (a submarine hop, which
cables.json already covers). The input is untrusted data: it is only parsed, never executed.

Usage: python3 -I herramientas/fibra_zoo.py DIR_CON_GML [--salida FICHERO]
"""
import glob, json, os, re, sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fibra_tierra import Agua, km  # noqa: E402

SALIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes', 'topology-zoo.json')
FUENTE = {'n': 'The Internet Topology Zoo (Universidad de Adelaida)', 'lic': 'CC BY 4.0', 'url': 'http://www.topology-zoo.org',
          'nota': 'Enlaces entre ciudades de redes troncales reales, en línea recta: la ruta exacta no es pública.'}
MAX_KM = 3000       # longer than this is not one land link
MAX_MAR = 0.2       # share of sampled points at sea beyond which the link is a submarine hop
ANIO_MIN = 1995     # ARPANET and the like are history, not today's fibre
CAPAS_FUERA = {'arpa', 'telephone'}
ENLACES_FUERA = ('wireless', 'microwave', 'satellite', 'radio')

# Country names as the Zoo writes them → ISO 3166-1 alpha-2 (the page names countries in each language)
PAISES = {
    'Albania': 'AL', 'Algeria': 'DZ', 'Antigua and Barbuda': 'AG', 'Argentina': 'AR', 'Armenia': 'AM', 'Australia': 'AU',
    'Austria': 'AT', 'Bahamas': 'BS', 'Barbados': 'BB', 'Belarus': 'BY', 'Belgium': 'BE', 'Belize': 'BZ', 'Bolivia': 'BO',
    'Bonaire, Saint Eustatius and Saba': 'BQ', 'Bosnia and Herzegovina': 'BA', 'Brazil': 'BR', 'Brunei': 'BN',
    'Bulgaria': 'BG', 'Canada': 'CA', 'Cayman Islands': 'KY', 'Chile': 'CL', 'China': 'CN', 'Colombia': 'CO',
    'Costa Rica': 'CR', 'Croatia': 'HR', 'Curacao': 'CW', 'Cyprus': 'CY', 'Czech Republic': 'CZ', 'Denmark': 'DK',
    'Dominica': 'DM', 'Dominican Republic': 'DO', 'Ecuador': 'EC', 'Egypt': 'EG', 'El Salvador': 'SV', 'Estonia': 'EE',
    'Fiji': 'FJ', 'Finland': 'FI', 'France': 'FR', 'Gambia': 'GM', 'Georgia': 'GE', 'Germany': 'DE', 'Gibraltar': 'GI',
    'Greece': 'GR', 'Grenada': 'GD', 'Guadeloupe': 'GP', 'Guam': 'GU', 'Guatemala': 'GT', 'Guyana': 'GY', 'Honduras': 'HN',
    'Hong Kong': 'HK', 'Hungary': 'HU', 'Iceland': 'IS', 'India': 'IN', 'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ',
    'Ireland': 'IE', 'Israel': 'IL', 'Italy': 'IT', 'Jamaica': 'JM', 'Japan': 'JP', 'Jordan': 'JO', 'Kazakhstan': 'KZ',
    'Kenya': 'KE', 'Kosovo': 'XK', 'Kuwait': 'KW', 'Latvia': 'LV', 'Lebanon': 'LB', 'Libya': 'LY', 'Liechtenstein': 'LI',
    'Lithuania': 'LT', 'Luxembourg': 'LU', 'Macau': 'MO', 'Macedonia': 'MK', 'North Macedonia': 'MK', 'Malaysia': 'MY',
    'Malta': 'MT', 'Martinique': 'MQ', 'Mexico': 'MX', 'Moldova': 'MD', 'Mongolia': 'MN', 'Montenegro': 'ME',
    'Morocco': 'MA', 'Myanmar [Burma]': 'MM', 'Myanmar': 'MM', 'Netherlands': 'NL', 'New Zealand': 'NZ', 'Nicaragua': 'NI',
    'Nigeria': 'NG', 'Norway': 'NO', 'Oman': 'OM', 'Pakistan': 'PK', 'Panama': 'PA', 'Paraguay': 'PY', 'Peru': 'PE',
    'Philippines': 'PH', 'Poland': 'PL', 'Portugal': 'PT', 'Puerto Rico': 'PR', 'Qatar': 'QA', 'Romania': 'RO',
    'Russia': 'RU', 'Saint Martin': 'MF', 'Saint Vincent and the Grenadines': 'VC', 'Saudi Arabia': 'SA', 'Serbia': 'RS',
    'Singapore': 'SG', 'Slovakia': 'SK', 'Slovenia': 'SI', 'South Africa': 'ZA', 'South Korea': 'KR', 'Spain': 'ES',
    'Sri Lanka': 'LK', 'Suriname': 'SR', 'Svalbard and Jan Mayen': 'SJ', 'Sweden': 'SE', 'Switzerland': 'CH', 'Syria': 'SY',
    'Taiwan': 'TW', 'Thailand': 'TH', 'Trinidad and Tobago': 'TT', 'Tunisia': 'TN', 'Turkey': 'TR',
    'Turks and Caicos Islands': 'TC', 'U.S. Virgin Islands': 'VI', 'Ukraine': 'UA', 'United Arab Emirates': 'AE',
    'United Kingdom': 'GB', 'United States': 'US', 'Uruguay': 'UY', 'Venezuela': 'VE', 'Vietnam': 'VN', 'Zambia': 'ZM',
}


def valor(s):
    s = s.strip()
    if s.startswith('"') and s.endswith('"'):
        return s[1:-1]
    try:
        return float(s) if '.' in s else int(s)
    except ValueError:
        return s


def lee_gml(ruta):
    """A small reader for the Zoo's GML: graph attributes, nodes and edges, each a dict of its keys."""
    g, nodos, aristas = {}, [], []
    pila = []
    with open(ruta, encoding='utf-8', errors='replace') as f:
        for linea in f:
            t = linea.strip()
            if not t:
                continue
            m = re.match(r'^(\w+)\s*\[$', t)
            if m:
                k = m.group(1)
                if k == 'graph':
                    pila.append(g)
                elif k == 'node' and len(pila) == 1:
                    nodos.append({}); pila.append(nodos[-1])
                elif k == 'edge' and len(pila) == 1:
                    aristas.append({}); pila.append(aristas[-1])
                else:
                    pila.append({})  # nested blocks (stats, graphics…) are ignored
                continue
            if t == ']':
                if pila:
                    pila.pop()
                continue
            m = re.match(r'^(\w+)\s+(.*)$', t)
            if m and pila:
                pila[-1][m.group(1)] = valor(m.group(2))
    return g, nodos, aristas


def lee_graphml(ruta):
    """The same three things from the Zoo's GraphML (keys declared with <key attr.name=…>)."""
    ns = {'g': 'http://graphml.graphdrawing.org/xmlns'}
    raiz = ET.parse(ruta).getroot()
    nombres = {k.get('id'): k.get('attr.name') for k in raiz.findall('g:key', ns)}
    def datos(el):
        return {nombres.get(d.get('key'), d.get('key')): valor(d.text or '') for d in el.findall('g:data', ns)}
    gr = raiz.find('g:graph', ns)
    if gr is None:
        return {}, [], []
    g = datos(gr)
    nodos = []
    for n in gr.findall('g:node', ns):
        d = datos(n); d['id'] = valor(n.get('id')); nodos.append(d)
    aristas = []
    for e in gr.findall('g:edge', ns):
        d = datos(e); d['source'] = valor(e.get('source')); d['target'] = valor(e.get('target')); aristas.append(d)
    return g, nodos, aristas


def anio_de(g):
    y = str(g.get('DateYear') or '').strip()
    if re.fullmatch(r'(19|20)\d\d', y):
        return int(y)
    m = re.search(r'((?:19|20)\d\d)', str(g.get('LastAccess') or ''))
    return int(m.group(1)) if m else 0


def red_valida(g):
    if str(g.get('Type') or '').strip().lower() == 'testbed':
        return False
    if str(g.get('Layer') or '').strip().lower() in CAPAS_FUERA:
        return False
    a = anio_de(g)
    return not (a and a < ANIO_MIN)


def lineas_de(ruta, agua, cuenta):
    g, nodos, aristas = (lee_graphml if ruta.lower().endswith('.graphml') else lee_gml)(ruta)
    red = str(g.get('Network') or g.get('label') or os.path.splitext(os.path.basename(ruta))[0]).strip()
    if not red_valida(g):
        cuenta['redes fuera'] += 1
        return red, []
    pos, pais = {}, {}
    for n in nodos:
        if 'id' not in n or n.get('Internal', 1) == 0 or n.get('hyperedge') == 1:
            continue
        la, lo = n.get('Latitude'), n.get('Longitude')
        if not isinstance(la, (int, float)) or not isinstance(lo, (int, float)) or (la == 0 and lo == 0):
            continue
        if not (-90 <= la <= 90 and -180 <= lo <= 180):
            continue
        pos[n['id']] = [round(float(lo), 4), round(float(la), 4)]
        pais[n['id']] = PAISES.get(str(n.get('Country') or '').strip(), '')
    anio = anio_de(g)
    out = []
    for e in aristas:
        a, b = e.get('source'), e.get('target')
        if a not in pos or b not in pos or a == b or pos[a] == pos[b]:
            cuenta['enlaces sin ciudad'] += 1; continue
        st = str(e.get('LinkStatus') or '').lower()
        if 'future' in st or 'plan' in st:
            cuenta['enlaces previstos'] += 1; continue
        tipo = str(e.get('LinkType') or '').lower()
        if any(w in tipo for w in ENLACES_FUERA):
            cuenta['enlaces por radio'] += 1; continue
        if km(pos[a], pos[b]) > MAX_KM:
            cuenta['enlaces de más de 3000 km'] += 1; continue
        if agua.parte_en_mar([pos[a], pos[b]]) > MAX_MAR:
            cuenta['enlaces por el mar'] += 1; continue
        cc = pais[a] if pais[a] == pais[b] else ''
        out.append({'n': red, 'o': red, 'cc': cc, 'anio': anio, 'obra': False, 'l': [pos[a], pos[b]]})
    return red, out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__); sys.exit(1)
    salida = sys.argv[sys.argv.index('--salida') + 1] if '--salida' in sys.argv else SALIDA
    ficheros = sorted(glob.glob(os.path.join(args[0], '**', '*.gml'), recursive=True) +
                      glob.glob(os.path.join(args[0], '**', '*.graphml'), recursive=True))
    agua = Agua()
    cuenta = {k: 0 for k in ('redes fuera', 'enlaces sin ciudad', 'enlaces previstos', 'enlaces por radio',
                             'enlaces de más de 3000 km', 'enlaces por el mar', 'enlaces repetidos')}
    vistos, lineas, redes = {}, [], set()
    for f in ficheros:
        try:
            red, ls = lineas_de(f, agua, cuenta)
        except Exception as e:
            print('no se pudo leer', os.path.basename(f), '·', e); continue
        for x in ls:
            # the same link in two maps of one operator (two years of GÉANT, say) is one link; the newest wins
            k = (tuple(sorted(map(tuple, x['l']))), re.sub(r'[^a-z0-9]', '', x['o'].lower()))
            if k in vistos:
                cuenta['enlaces repetidos'] += 1
                if x['anio'] > lineas[vistos[k]]['anio']:
                    lineas[vistos[k]] = x
                continue
            vistos[k] = len(lineas)
            lineas.append(x)
        if ls:
            redes.add(red)
    tot = round(sum(km(x['l'][0], x['l'][1]) for x in lineas))
    fuente = dict(FUENTE, fecha=datetime.now(timezone.utc).strftime('%Y-%m-%d'), km=tot)
    os.makedirs(os.path.dirname(salida), exist_ok=True)
    with open(salida, 'w', encoding='utf-8') as f:
        json.dump({'fuente': fuente, 'redes': sorted(redes), 'lineas': lineas}, f, ensure_ascii=False, separators=(',', ':'))
    print('Topology Zoo:', len(ficheros), 'ficheros,', len(redes), 'redes,', len(lineas), 'enlaces,', tot, 'km,',
          len({x['cc'] for x in lineas if x['cc']}), 'países →', salida)
    for k, v in cuenta.items():
        if v: print('  ', k + ':', v)


if __name__ == '__main__':
    main()
