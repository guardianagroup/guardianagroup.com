#!/usr/bin/env python3
"""Ronda 35 · direcciones de los centros de datos de la agencia (25 Oct 2026).

Compara las voces (chatgpt-N.json, gemini-N.json, astra-N.json: [[id, dirección, lat, lon, fuente], …]) y escribe
acuerdos.json: para cada id, si dos voces dan la misma calle (mismo nombre de calle y, si las dos lo dan, el mismo número
o uno a menos de 40 portales) o las mismas coordenadas (a menos de 1 km), la dirección acordada y quién la da.
No se acepta un acuerdo cuyas voces solo citan PeeringDB, TeleGeography o submarinecablemap (regla del dueño).
Después, geocodifica.js (en el navegador, Nominatim) sitúa cada dirección acordada.
"""
import glob, json, math, os, re, unicodedata, collections

AQUI = os.path.dirname(os.path.abspath(__file__))
PROHIBIDAS = ('peeringdb', 'telegeography', 'submarinecablemap')


def km(a, b):
    la1, la2 = math.radians(a[0]), math.radians(b[0])
    d = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(math.radians(b[1] - a[1]) / 2) ** 2
    return 12742 * math.asin(min(1, math.sqrt(d)))


def pliega(s):
    return unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()


GEN = {'rua', 'avenida', 'av', 'calle', 'street', 'st', 'road', 'rd', 'drive', 'dr', 'alameda', 'avenue', 'ave', 'boulevard',
       'blvd', 'ul', 'strasse', 'str', 'weg', 'lane', 'way', 'place', 'rue', 'chemin', 'via', 'viale', 'piazza', 'travessa', 'jalan',
       'jl', 'lot', 'plot', 'no', 'de', 'do', 'da', 'dos', 'das', 'del', 'la', 'el', 'the', 'and', 'doutor', 'presbitero',
       'municipal', 'parque', 'industrial', 'distrito', 'zona', 'km', 'sn', 'esquina', 'con', 'setor', 'quadra', 'lote', 'norte',
       'sul', 'areas', 'isoladas', 'comercial', 'conjunto', 'trecho', 'bloco', 'centro', 'city', 'park', 'business', 'free',
       'zone', 'area', 'district', 'building', 'tower', 'floor', 'piso', 'edificio', 'predio'}
VIA = {'rodovia', 'highway', 'autopista', 'carretera', 'estrada', 'expressway', 'motorway', 'autoroute', 'route', 'national',
       'nacional', 'federal', 'panamericana', 'hwy'}


def calle(d):
    """(street words, highway?, number) of an address: the words of its first part, and its first number"""
    p = pliega(d).split(',')
    primera = p[0]
    if len(p) > 1 and not re.search(r'[a-z]{3}', re.sub(r'\d', '', primera)): primera = p[0] + ' ' + p[1]
    num = re.search(r'(?<![\d-])(\d{1,5})(?![\d]|-\d)', pliega(d))
    pal = set(re.findall(r'[a-z]{3,}', primera))
    return pal - GEN - VIA, bool(pal & VIA), int(num.group(1)) if num else None


def misma_calle(d1, d2):
    if not d1 or not d2: return False
    (p1, v1, n1), (p2, v2, n2) = calle(d1), calle(d2)
    if not p1 or not p2: return False
    corta = min(len(p1), len(p2))
    if len(p1 & p2) < (corta - 1 if corta >= 3 else corta): return False
    if n1 is not None and n2 is not None and abs(n1 - n2) > 40: return False
    # a highway runs for hundreds of km: only the same km marker places a building on it
    if (v1 or v2) and (n1 is None or n2 is None or abs(n1 - n2) > 2): return False
    return True


def limpia(f):
    return any(x not in pliega(f) for x in PROHIBIDAS) and not all(t.strip() and any(x in pliega(t) for x in PROHIBIDAS) for t in re.split(r'[;/]', f or '') if t.strip())


def main():
    voces = collections.defaultdict(dict)
    for f in sorted(glob.glob(os.path.join(AQUI, '*-[0-9]*.json'))):
        voz = os.path.basename(f).split('-')[0]
        if voz not in ('chatgpt', 'gemini', 'astra'): continue
        for x in json.load(open(f, encoding='utf-8')):
            voces[x[0]][voz] = {'dir': x[1], 'lat': x[2], 'lon': x[3], 'fuente': x[4] if len(x) > 4 else ''}
    lista = json.load(open(os.path.join(AQUI, 'lista.json'), encoding='utf-8'))
    acuerdos, sin = {}, []
    for i, x in enumerate(lista, 1):
        v = voces.get(i, {})
        nombres = list(v)
        mejor = None
        for a in range(len(nombres)):
            for b in range(a + 1, len(nombres)):
                A, B = v[nombres[a]], v[nombres[b]]
                if not (limpia(A['fuente']) or limpia(B['fuente'])): continue
                cerca = A['lat'] is not None and B['lat'] is not None and km((A['lat'], A['lon']), (B['lat'], B['lon'])) < 1.0
                calle_ok = misma_calle(A['dir'], B['dir'])
                if calle_ok or cerca:
                    # the address of the voice whose source is not a forbidden one, the more detailed if both
                    dirs = sorted([A, B], key=lambda q: (limpia(q['fuente']), len(q['dir'] or '')), reverse=True)
                    coords = [(q['lat'], q['lon']) for q in (A, B) if q['lat'] is not None]
                    mejor = {'voces': [nombres[a], nombres[b]], 'dir': dirs[0]['dir'], 'por': 'calle' if calle_ok else 'coordenadas',
                             'coords': coords, 'nombre': x['nombre']}
                    break
            if mejor: break
        if mejor: acuerdos[i] = mejor
        elif len(v) >= 2: sin.append(i)
    json.dump(acuerdos, open(os.path.join(AQUI, 'acuerdos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('con respuesta de dos voces o más:', sum(1 for i in voces if len(voces[i]) >= 2), '· acuerdos:', len(acuerdos), '· sin acuerdo:', len(sin))
    print('sin acuerdo:', sin)


if __name__ == '__main__':
    main()
