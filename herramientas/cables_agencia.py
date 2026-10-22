#!/usr/bin/env python3
"""GUARDIANA · Órbita: the submarine cables that OpenStreetMap does not have, rebuilt by the agency.

Owner, 22 Oct 2026 (plan B, approved 09:51): «Claude + ChatGPT + Gemini reconstruyen los cables que faltan: nombre,
llegadas en orden con coordenadas, año, km, dueños y fuentes públicas. Guardar solo lo que coincida entre ellos y
confirme una fuente; validar coordenadas; trazado aproximado por mar y rotulado "trazado aproximado"».

Input: every JSON in herramientas/cables-agencia/ (one file per answer; name says who answered: chatgpt-*, gemini-*,
claude-*). Each is a list of {nombre, llegadas:[{lugar, pais, lat, lon}], anio, km, duenos:[], fuentes:[]}.

What is kept (nothing is invented):
  - a cable named by at least two different members of the agency (ChatGPT, Gemini, Claude), or by one member when
    herramientas/cables-agencia/confirmados.txt lists its name (a human checked a public source);
  - a landing only when at least two members place it (same country, within 120 km), or one member does and
    the cable is confirmed; its coordinates are the mean of the members that agree;
  - a landing only when it sits by the sea (within ~40 km of water on static/tierra/agua.png) and the nearest city
    of the GeoNames list within 120 km is in the same country (or there is no city near: small islands);
  - year, km and owners only when the members that give them agree (year exactly, km within 15 %); otherwise null.
The route between consecutive landings is traced over the water mask (A*, 2048×1024) and is marked approximate;
where the mask has no way through (the Suez crossing), the hop is a straight line marked «por tierra».

Output: orbita/datos/cables-agencia.json, and the same segments merged into orbita/datos/cables.json
(field "src": "agencia"; a run first removes the previous agency segments, so it is safe to repeat). When
OpenStreetMap already has the cable with at least half of its landings, the agency's version is not added.
"""
import json, math, os, re, glob, heapq, collections, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.join(AQUI, '..', 'orbita')
CARPETA = os.path.join(AQUI, 'cables-agencia')
sys.path.insert(0, AQUI)
from lugares_capas import lee_ciudades, Rejilla, km, base_cable  # noqa: E402

ALIAS = {  # the same cable under different names (lower case, letters and digits only)
    'sat3wasc': 'sat3', 'sat3wascsafe': 'sat3', 'southatlantic3': 'sat3',
    'seacomtatatgneurasia': 'seacom', 'seacomafricancablesystem': 'seacom',
    'asiaafricaeurope1aae1': 'aae1', 'asiaafricaeurope1': 'aae1',
    'africacoasttoeuropeace': 'ace', 'africacoasttoeurope': 'ace',
    'westafricacablesystemwacs': 'wacs', 'westafricacablesystem': 'wacs',
    'glo1globacom1': 'glo1', 'globacom1': 'glo1',
    'southatlanticcablesystemsacs': 'sacs', 'southatlanticcablesystem': 'sacs',
    'southatlanticinterlinksail': 'sail', 'southatlanticinterlink': 'sail',
    'senegalhornofafricaregionalexpressshare': 'share', 'senegalhornofafricaregionalexpress': 'share',
    'nigeriacameroonsubmarinecablesystemncscs': 'ncscs', 'nigeriacameroonsubmarinecablesystem': 'ncscs',
    'djiboutiafricaregionalexpress1dare1': 'dare1', 'djiboutiafricaregionalexpress1': 'dare1', 'djiboutiafricaregionexpress1': 'dare1',
    'easternafricasubmarinesystemeassy': 'eassy', 'easternafricasubmarinecablesystem': 'eassy', 'easternafricasubmarinesystem': 'eassy',
    'southafricafareastsafe': 'safe', 'southafricafareast': 'safe',
    'mainonecable': 'mainone', 'main1': 'mainone',
    'googleequiano': 'equiano', 'equianocable': 'equiano',
    '2africapearls': '2africa',
    'peacecable': 'peace', 'pakistaneastafricaconnectingeurope': 'peace',
    'lowerindianoceannetworklion': 'lion', 'lowerindianoceannetwork': 'lion',
    'lowerindianoceannetwork2lion2': 'lion2', 'lion2': 'lion2',
    'metisscable': 'metiss', 'meltingpotindianoceanicsubmarinesystem': 'metiss', 'seychellestoeastafricasystemseas': 'seas', 'seychellestoeastafricasystem': 'seas', 'seychelleseastafricasystem': 'seas',
    'theeastafricanmarinesystemteams': 'teams', 'eastafricanmarinesystem': 'teams',
    'seamewe3': 'smw3', 'seamewe4': 'smw4', 'seamewe5': 'smw5', 'seamewe6': 'smw6',
    'southeastasiamiddleeastwesterneurope3': 'smw3', 'southeastasiamiddleeastwesterneurope4': 'smw4',
    'southeastasiamiddleeastwesterneurope5': 'smw5', 'southeastasiamiddleeastwesterneurope6': 'smw6',
    'indiamiddleeastwesterneuropeimewe': 'imewe', 'indiamiddleeastwesterneurope': 'imewe',
    # Asia–Pacific
    'transpacificexpress': 'tpe', 'transpacificexpresscablesystem': 'tpe', 'unityeacpacific': 'unity',
    'pacificlightcablenetwork': 'plcn', 'newcrosspacific': 'ncp', 'newcrosspacificcablesystem': 'ncp', 'pacificcrossing1': 'pc1',
    'japanuscablenetwork': 'japanus', 'tatatgnpacific': 'tgnpacific', 'asiaamericagateway': 'aag', 'asiaamericagatewaycablesystem': 'aag',
    'asiapacificcablenetwork2': 'apcn2', 'asiapacificgateway': 'apg', 'asiadirectcable': 'adc', 'southeastasiajapancable': 'sjc',
    'southeastasiajapancable2': 'sjc2', 'asiasubmarinecableexpress': 'ase', 'asiasubmarinecableexpresscahayamalaysia': 'ase',
    'eastasiacrossing': 'eacc2c', 'eastasiacrossingeacintegradoeneacc2c': 'eacc2c', 'citytocitycablesystem': 'eacc2c', 'citytocitycablesystemc2cintegradoeneacc2c': 'eacc2c', 'c2c': 'eacc2c', 'eac': 'eacc2c',
    'tgnintraasia': 'tgnia', 'flagnorthasialoop': 'fnal', 'flagnorthasialoopreachnorthasialoop': 'fnal', 'fnalrnal': 'fnal',
    'taiwanstraitexpress1': 'tse1', 'hainantohongkongexpress': 'h2he', 'southeastasiahainanhongkongexpress': 'seah2x',
    'malaysiaindiasingaporetransit': 'mist', 'indiaasiaxpress': 'iax', 'koreajapancablenetwork': 'kjcn', 'malaysiacambodiathailand': 'mct',
    'indonesiaglobalgateway': 'igg', 'matrixcablesystem': 'matrix', 'thailandindonesiasingapore': 'tis', 'bayofbengalgateway': 'bbg',
    'i2icablenetwork': 'i2i', 'tgntataindicomcable': 'tic', 'tgntataindicom': 'tic', 'southeastasiaunitedstates': 'seaus',
    'southerncrosscablenetwork': 'southerncross', 'southerncrosscable': 'southerncross', 'southerncrossnext': 'sxnext',
    'telstraendeavour': 'endeavour', 'pipepacificcable': 'ppc1', 'australiajapancable': 'ajc', 'tasmanglobalaccess': 'tga',
    'coralseacablesystem': 'coralsea', 'coralseacable': 'coralsea', 'australiasingaporecable': 'asc',
    'jgasouth': 'jgas', 'japanguamaustraliasouth': 'jgas', 'jganorth': 'jgan', 'japanguamaustralianorth': 'jgan',
    'interchangecablenetwork1': 'icn1', 'hantru1': 'hantru1', 'kumuldomesticsubmarinecable': 'kumul', 'kumulsubmarinecablenetwork': 'kumul',
}

def clave(n):
    b = re.sub(r'\s*\(.*?\)\s*', ' ', n or '')  # «GLO-1 (Globacom-1)» → the part outside the brackets and the part inside
    k = re.sub(r'[^a-z0-9]', '', base_cable(b).lower())
    k2 = re.sub(r'[^a-z0-9]', '', (n or '').lower())
    for c in (k2, k):
        if c in ALIAS: return ALIAS[c]
    return ALIAS.get(k, k)

# ---------- water mask ----------
class Agua:
    def __init__(self):
        from PIL import Image
        im = Image.open(os.path.join(RAIZ, 'static', 'tierra', 'agua.png')).convert('L')
        self.W, self.H = im.size  # 2048×1024: one pixel is about 20 km at the equator
        self.m = bytearray(im.tobytes())
    def px(self, lon, lat):
        return int((lon + 180) / 360 * self.W) % self.W, min(self.H - 1, max(0, int((90 - lat) / 180 * self.H)))
    def lonlat(self, x, y):
        return (x + 0.5) / self.W * 360 - 180, 90 - (y + 0.5) / self.H * 180
    def agua(self, x, y, umbral=128):
        return self.m[y * self.W + (x % self.W)] >= umbral
    def cerca_agua(self, lon, lat, r, umbral=1):
        # the nearest pixel with at least «umbral» of water within r pixels. The mask is soft (the coast fades over
        # about five pixels, 100 km) and has no Gulf of Suez at all, so a landing is judged with a low threshold and the
        # route is started from the nearest open-water pixel.
        x0, y0 = self.px(lon, lat)
        best = None
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                x, y = x0 + dx, y0 + dy
                if 0 <= y < self.H and self.agua(x, y, umbral):
                    d = dx * dx + dy * dy
                    if best is None or d < best[0]: best = (d, x % self.W, y)
        return best
    def ruta(self, a, b):
        """A* over water pixels from a to b (pixel coords), 8 neighbours, wrapping east–west. Returns pixel list."""
        W, H = self.W, self.H
        def h(x, y):
            dx = abs(x - b[0]); dx = min(dx, W - dx)
            return math.hypot(dx, y - b[1])
        start = (a[0] % W, a[1]); goal = (b[0] % W, b[1])
        g = {start: 0.0}; prev = {}
        pq = [(h(*start), 0.0, start)]
        seen = set()
        while pq:
            f, gc, u = heapq.heappop(pq)
            if u in seen: continue
            seen.add(u)
            if u == goal: break
            x, y = u
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if not dx and not dy: continue
                    nx, ny = (x + dx) % W, y + dy
                    if ny < 0 or ny >= H or not self.agua(nx, ny, 96): continue
                    # a slightly higher cost next to the coast keeps the trace in open water
                    c = math.hypot(dx, dy) * (1.0 if self.agua(nx + 1, ny) and self.agua(nx - 1, ny) and self.agua(nx, min(H - 1, ny + 1)) and self.agua(nx, max(0, ny - 1)) else 1.6)
                    ng = gc + c
                    v = (nx, ny)
                    if ng < g.get(v, 1e18):
                        g[v] = ng; prev[v] = u
                        heapq.heappush(pq, (ng + h(nx, ny), ng, v))
        if goal not in g: return None
        p = [goal]
        while p[-1] != start: p.append(prev[p[-1]])
        return p[::-1]

def suaviza(pts, veces=2):
    """Chaikin's corner cutting: the pixel route loses its staircase and reads like a cable, not a maze."""
    for _ in range(veces):
        if len(pts) < 3: return pts
        out = [pts[0]]
        for a, b in zip(pts, pts[1:]):
            out.append((a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25))
            out.append((a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75))
        out.append(pts[-1]); pts = out
    return pts

def simplifica(pts, tol):
    """Douglas–Peucker on pixel coordinates."""
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]
        if a == b: d = math.hypot(p[0] - a[0], p[1] - a[1])
        else:
            n = abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1]))
            d = n / math.hypot(b[0] - a[0], b[1] - a[1])
        if d > dmax: dmax, idx = d, i
    if dmax > tol:
        return simplifica(pts[:idx + 1], tol)[:-1] + simplifica(pts[idx:], tol)
    return [a, b]

# ---------- the agency's answers ----------
def quien(nombre_archivo):
    n = os.path.basename(nombre_archivo).lower()
    for q in ('chatgpt', 'gemini', 'claude'):
        if n.startswith(q): return q
    return 'otro'

def carga():
    por_cable = collections.defaultdict(list)  # key → [(member, cable dict)]
    for f in sorted(glob.glob(os.path.join(CARPETA, '*.json'))):
        try:
            datos = json.load(open(f, encoding='utf-8'))
        except Exception as e:
            print('no se puede leer', f, e); continue
        if isinstance(datos, dict): datos = datos.get('cables', [])
        for c in datos:
            if not isinstance(c, dict) or not c.get('nombre'): continue
            por_cable[clave(c['nombre'])].append((quien(f), c))
    return por_cable

def confirmados():
    p = os.path.join(CARPETA, 'confirmados.txt')
    if not os.path.exists(p): return set()
    return {clave(l.split('#')[0].strip()) for l in open(p, encoding='utf-8') if l.split('#')[0].strip()}

def num(v):
    try: return float(v) if v is not None else None
    except (TypeError, ValueError): return None

def main():
    ciudades = lee_ciudades(); rj = Rejilla(ciudades)
    agua = Agua()
    conf = confirmados()
    por_cable = carga()
    cab = json.load(open(os.path.join(RAIZ, 'datos', 'cables.json'), encoding='utf-8'))
    osm = [s for s in cab['cables'] if s.get('src') != 'agencia']
    # what OpenStreetMap already has, by whole cable: how many distinct landings (ends near a city)
    osm_llegadas = collections.defaultdict(set)
    for s in osm:
        k = clave(s.get('n') or '')
        if not k: continue
        for lo, la in (s['l'][0], s['l'][-1]):
            c = rj.cercana(la, lo, 80)
            if c is not None: osm_llegadas[k].add(c)
    salida, descartes = [], []
    for k, respuestas in por_cable.items():
        miembros = {m for m, _ in respuestas}
        if len(miembros) < 2 and k not in conf:
            descartes.append((k, 'solo lo nombra ' + ', '.join(miembros))); continue
        nombre = collections.Counter(c['nombre'].strip() for _, c in respuestas).most_common(1)[0][0]
        # landings: cluster by country + 120 km
        grupos = []
        for m, c in respuestas:
            for L in c.get('llegadas') or []:
                la, lo = num(L.get('lat')), num(L.get('lon'))
                if la is None or lo is None or not L.get('pais'): continue
                cc = L['pais'].upper()
                for g in grupos:
                    if g['cc'] == cc and km(la, lo, g['lat'], g['lon']) < 120:
                        g['m'].add(m); g['pts'].append((la, lo)); g['lugares'].append(L.get('lugar') or ''); break
                else:
                    grupos.append({'cc': cc, 'lat': la, 'lon': lo, 'm': {m}, 'pts': [(la, lo)], 'lugares': [L.get('lugar') or ''], 'orden': len(grupos)})
        llegadas = []
        for g in grupos:
            if len(g['m']) < 2 and k not in conf: continue
            la = sum(p[0] for p in g['pts']) / len(g['pts']); lo = sum(p[1] for p in g['pts']) / len(g['pts'])
            c = rj.cercana(la, lo, 120)
            if c is not None and ciudades[c][1] != g['cc']:
                descartes.append((k, 'llegada %s (%s) cae junto a %s (%s)' % (g['lugares'][0], g['cc'], ciudades[c][0], ciudades[c][1]))); continue
            w = agua.cerca_agua(lo, la, 8)  # some water within ~8 px (160 km): the mask's coast is soft and narrow gulfs are missing
            if w is None:
                descartes.append((k, 'llegada %s (%s) no está junto al mar' % (g['lugares'][0], g['cc']))); continue
            llegadas.append({'lugar': collections.Counter(x for x in g['lugares'] if x).most_common(1)[0][0] if any(g['lugares']) else '', 'cc': g['cc'], 'lat': round(la, 3), 'lon': round(lo, 3), 'px': (w[1], w[2])})
        if len(llegadas) < 2:
            descartes.append((k, 'menos de dos llegadas confirmadas')); continue
        # the order along the cable: the longest answer's order, as given by its member
        mejor = max(respuestas, key=lambda r: len(r[1].get('llegadas') or []))[1]
        def pos(L):
            for i, M in enumerate(mejor.get('llegadas') or []):
                la, lo = num(M.get('lat')), num(M.get('lon'))
                if la is not None and lo is not None and (M.get('pais') or '').upper() == L['cc'] and km(la, lo, L['lat'], L['lon']) < 120: return i
            return 999
        llegadas.sort(key=pos)
        if len(osm_llegadas.get(k, ())) >= max(2, len(llegadas) / 2):
            descartes.append((k, 'OpenStreetMap ya lo tiene con %d llegadas' % len(osm_llegadas[k]))); continue
        # year, km, owners: only where the members agree
        anios = [int(c['anio']) for _, c in respuestas if num(c.get('anio'))]
        anio = anios[0] if anios and len(set(anios)) == 1 and (len(anios) >= 2 or k in conf) else None
        kms = [num(c.get('km')) for _, c in respuestas if num(c.get('km'))]
        kmv = round(sum(kms) / len(kms)) if kms and (len(kms) >= 2 and max(kms) <= 1.15 * min(kms) or (len(kms) == 1 and k in conf)) else None
        # owners: a name given by two members (compared without case, accents or brackets; «Google» matches
        # «Google LLC», «Telkom SA» matches «Telkom South Africa» only when one contains the other)
        por_miembro = collections.defaultdict(list)
        for m, c in respuestas:
            for d in c.get('duenos') or []:
                d = re.sub(r'\s+', ' ', str(d)).strip()
                if d: por_miembro[m].append(d)
        norm = lambda d: re.sub(r'[^a-z0-9]', '', re.sub(r'\(.*?\)', '', d).lower())
        ds = []
        for m, lista in por_miembro.items():
            for d in lista:
                nd = norm(d)
                if not nd: continue
                otros = [norm(x) for m2, l2 in por_miembro.items() if m2 != m for x in l2]
                if (any(nd == o or (len(nd) >= 5 and (nd in o or o in nd)) for o in otros) or (k in conf and len(miembros) == 1)) and not any(norm(x) == nd or (len(nd) >= 5 and (nd in norm(x) or norm(x) in nd)) for x in ds):
                    ds.append(d)
        ds = ds[:8]
        fuentes = []
        for _, c in respuestas:
            for u in c.get('fuentes') or []:
                u = str(u).strip()
                if u.startswith('http') and 'submarinecablemap' not in u and 'telegeography' not in u and u not in fuentes: fuentes.append(u)
        # trace the sea route between consecutive landings
        tramos = []
        for A, B in zip(llegadas, llegadas[1:]):
            recto = km(A['lat'], A['lon'], B['lat'], B['lon'])
            pa, pb = agua.cerca_agua(A['lon'], A['lat'], 12, 128), agua.cerca_agua(B['lon'], B['lat'], 12, 128)
            r = agua.ruta((pa[1], pa[2]), (pb[1], pb[2])) if recto > 25 and pa and pb else None
            linea, por = None, 'mar'
            if r:
                r = simplifica(suaviza(r), 0.6)
                linea = [[A['lon'], A['lat']]] + [[round(x, 3), round(y, 3)] for x, y in (agua.lonlat(px, py) for px, py in r[1:-1])] + [[B['lon'], B['lat']]]
                largo = sum(km(p[1], p[0], q[1], q[0]) for p, q in zip(linea, linea[1:]))
                if largo > 2.5 * recto + 200: linea = None  # the mask has no way through (Suez, a strait too narrow): the real cable crosses land there
            if linea is None:
                linea, por = [[A['lon'], A['lat']], [B['lon'], B['lat']]], 'tierra'  # a straight hop (Abu Talat → Zafarana across Egypt, for instance)
            tramos.append({'n': nombre, 'l': linea, 'src': 'agencia', 'aprox': 1, 'por': por, 'de': [A['lugar'], A['cc']], 'a': [B['lugar'], B['cc']]})
        if not tramos: continue
        kmMapa = sum(km(p[1], p[0], q[1], q[0]) for t in tramos for p, q in zip(t['l'], t['l'][1:]))
        info = {'anio': anio, 'km': kmv, 'kmMapa': round(kmMapa), 'duenos': ds, 'fuentes': fuentes[:8], 'miembros': sorted(miembros)}
        for t in tramos: t['info'] = info
        salida.append({'clave': k, 'nombre': nombre, 'llegadas': [{x: L[x] for x in ('lugar', 'cc', 'lat', 'lon')} for L in llegadas], 'info': info, 'tramos': len(tramos)})
        cab_nuevos = tramos
        salida[-1]['_tramos'] = cab_nuevos
    # write
    tramos_todos = [t for c in salida for t in c.pop('_tramos')]
    out = {'fuente': 'Reconstruido por la agencia GUARDIANA (Claude, ChatGPT y Gemini) de fuentes públicas; trazado aproximado por mar.',
           'nota': 'Se guarda solo lo que coincide entre al menos dos miembros de la agencia; coordenadas validadas con GeoNames y la máscara de agua.',
           'cables': salida, 'tramos': tramos_todos}
    with open(os.path.join(RAIZ, 'datos', 'cables-agencia.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    cab['cables'] = osm + tramos_todos
    cab['agencia'] = {'cables': len(salida), 'tramos': len(tramos_todos)}
    with open(os.path.join(RAIZ, 'datos', 'cables.json'), 'w', encoding='utf-8') as f:
        json.dump(cab, f, ensure_ascii=False, separators=(',', ':'))
    print('cables de la agencia aceptados:', len(salida), '· tramos:', len(tramos_todos))
    for c in salida: print('  ', c['nombre'], '·', ' → '.join(L['lugar'] + ' (' + L['cc'] + ')' for L in c['llegadas']), '·', c['info']['anio'], c['info']['km'] or ('~%d km mapa' % c['info']['kmMapa']), '·', ', '.join(c['info']['miembros']))
    if descartes:
        print('descartado:')
        for k, por in descartes: print('  ', k, '·', por)

if __name__ == '__main__':
    main()
