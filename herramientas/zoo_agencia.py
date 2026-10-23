#!/usr/bin/env python3
"""GUARDIANA · Órbita · the agency's review of the land backbones that come from The Internet Topology Zoo.

Why (23 Oct 2026, 14:47–15:05): the owner asked whether the map is «100 %»; Claude found that the Zoo, gathered around
2010–2011, also holds maps of networks that no longer exist, and the card said for instance «Operador: NSF · Según el mapa
de la red de 2011» when NSFNET closed in 1995. The owner approved: «Troncales antiguas… quitar o limpiar las redes que ya no
existen… se revisa con la agencia, red por red».

The review (herramientas/zoo-agencia/):
  · Historical map collections, out: the maps the Zoo took from nthelp.com (the 1990s: ChatGPT «1988–2003, sobre todo los
    noventa», Grok «1995–1999», Claude «los noventa») and from isp-planet.com (ChatGPT «1999–2005», Grok «2000–2011», Claude
    «1999–2004»), and maps dated before 2005. Their dates cannot be trusted and many of those networks are gone.
  · The other 144 networks, each classified by three voices (Claude, ChatGPT and Grok, each on its own; Claude's file was
    written before reading the others, with one self-correction noted in it): «existe», «absorbida» (and who has it today),
    «desaparecida» or «no_se». Two voices decide:
      existe       → stays, under its proper name;
      absorbida    → stays; the operator shown is today's owner when two voices name the same one, and the card adds
                     «Red en el mapa: <name> (<year>)»; without two voices on the owner, no operator is shown and the card
                     says the network no longer operates under that name;
      desaparecida, no_se, or no two voices alike → out: nothing unverified is drawn.

Writes herramientas/zoo-agencia/decisiones.json, which fibra_tierra.py reads (so the workflow keeps applying it), and with
--aplica rewrites orbita/datos/fibra-tierra.json in place with the same rules, so the map changes now.

Usage: python3 herramientas/zoo_agencia.py [--aplica]
"""
import json
import os
import re
import sys
import unicodedata
from collections import Counter

AQUI = os.path.dirname(os.path.abspath(__file__))
CARPETA = os.path.join(AQUI, 'zoo-agencia')
SALIDA = os.path.join(CARPETA, 'decisiones.json')
FIBRA = os.path.join(AQUI, '..', 'orbita', 'datos', 'fibra-tierra.json')

# maps from the historical collections (source of each map in the Zoo's own metadata), and maps dated before 2005
HISTORICOS = {
    'nthelp.com (años noventa)': ['UUNET', 'GlobalCenter', 'GoodNet', 'InternetMCI', 'IBM', 'DIGEX', 'ANS', 'Sprint', 'AGIS', 'CRL',
                                  'GridNet', 'CWIX', 'BBNplanet', 'PsiNet', 'Compuserve', 'NSF', 'ATMnet', 'Savvis', 'NapNet',
                                  'DataXchange', 'iSTAR', 'Epoch', 'Netrail', 'GetNet'],
    'isp-planet.com (hacia 1999–2005)': ['BTN', 'Xspedius', 'Electric Lightwave', 'Tecove (level3)', 'Bell Canada', 'Bell South',
                                         'Quest', 'Oxford', 'Sago'],
    'mapa de 2001': ['Gambia'],
}

# today's owner, one name for each company however a voice wrote it (first match wins)
DUENOS = [
    (r'\blumen\b|level ?3|centurylink', 'Lumen Technologies'), (r'uniti|windstream', 'Uniti (Windstream)'),
    (r'\bexa\b', 'EXA Infrastructure'), (r'deutsche telekom|t-mobile|magyar telekom|slovak telekom', 'Deutsche Telekom'),
    (r'\bgtt\b', 'GTT Communications'), (r'zayo', 'Zayo'), (r'internet2', 'Internet2'), (r'aptum', 'Aptum Technologies'),
    (r'\btpg\b', 'TPG Telecom'), (r'vocus', 'Vocus'), (r'segra', 'Segra'), (r'televisa|izzi', 'Grupo Televisa'),
    (r'bluebird', 'Bluebird Network'), (r'\bnova\b|united group', 'Nova (United Group)'), (r'kif', 'KIFÜ'),
    (r'\bsunet\b', 'SUNET'), (r'\bsurf\b', 'SURF'), (r'aureon', 'Aureon'), (r'reannz', 'REANNZ'), (r'nict|\bjgn\b', 'NICT (JGN)'),
    (r'\bdeic\b', 'DeiC'), (r'liberty', 'Liberty Latin America'), (r'eunetworks', 'euNetworks'), (r'\bsikt\b', 'Sikt'),
    (r'\bbso\b', 'BSO'), (r'\bote\b', 'OTE'), (r'stackpath', 'StackPath'), (r'shentel', 'Shentel'), (r'lumos', 'Lumos'),
    (r'spirit', 'Spirit Communications'), (r'earthlink', 'EarthLink'), (r'cogeco', 'Cogeco'), (r'telus', 'Telus'),
    (r'\bbell\b', 'Bell Canada'), (r'cetin', 'CETIN'), (r'quantcom', 'Quantcom'), (r'v\.?tal', 'V.tal'),
    (r'\bbt\b', 'BT'), (r'highwinds', 'Highwinds'),
]

# the networks that still exist, under the name they go by (the Zoo wrote several by hand)
NOMBRES = {
    'Canerie': 'CANARIE', 'NORDU': 'NORDUnet', 'TelecomSerbia': 'Telekom Srbija', 'ATT North America': 'AT&T',
    'BizNetworks': 'Biznet', 'Heanet': 'HEAnet', 'Sinet': 'SINET', 'Cernet': 'CERNET', 'Renater': 'RENATER', 'RedIris': 'RedIRIS',
    'GRnet': 'GRNET', 'Carnet': 'CARNET', 'Restena': 'RESTENA', 'Cynet': 'CYNET', 'Zamren': 'ZAMREN', 'Sanren': 'SANReN',
    'Myren': 'MYREN', 'Renam': 'RENAM', 'MARNET': 'MARnet', 'AARNET': 'AARNet', 'BELNET': 'Belnet', 'EEnet': 'EENet',
    'Uninett': 'Sikt (Uninett)', 'Colt Telecom': 'Colt', 'peer1': 'Peer 1',
}


def dueno(texto):
    t = unicodedata.normalize('NFKC', (texto or '')).lower()
    if not t.strip():
        return None
    for patron, nombre in DUENOS:
        if re.search(patron, t):
            return nombre
    return t.strip()


def voces():
    """{n: {'red': name, voz: (estado, owner)}} from the three files."""
    g = json.load(open(os.path.join(CARPETA, 'chatgpt-zoo-1.json'), encoding='utf-8'))
    k = json.load(open(os.path.join(CARPETA, 'grok-zoo-1.json'), encoding='utf-8'))
    c = json.load(open(os.path.join(CARPETA, 'claude-zoo-1.json'), encoding='utf-8'))
    por = {}
    for r in g['redes']:
        por[r['n']] = {'red': r['red'], 'chatgpt': (r['estado'], dueno(r.get('hoy')))}
    for r in k['redes']:
        por[r[0]]['grok'] = (r[1], dueno(r[2]))
    for r in c['redes']:
        por[r[0]]['claude'] = (r[1], dueno(r[2]))
    return por


def decide():
    dec = {}
    for motivo, redes in HISTORICOS.items():
        for red in redes:
            dec[red] = {'accion': 'quita', 'motivo': 'Mapa de una colección histórica: ' + motivo}
    for n, v in sorted(voces().items()):
        red = v['red']
        vs = {x: v[x] for x in ('claude', 'chatgpt', 'grok') if x in v}
        cuenta = Counter(e for e, _ in vs.values())
        estado, cuantos = cuenta.most_common(1)[0]
        votos = {x: e + (' → ' + o if o else '') for x, (e, o) in vs.items()}
        if cuantos < 2 or estado in ('no_se', 'desaparecida'):
            dec[red] = {'accion': 'quita', 'motivo': 'Sin dos voces que confirmen que sigue operando' if estado != 'desaparecida' or cuantos < 2 else 'Dos voces: desaparecida', 'voces': votos}
            continue
        if estado == 'existe':
            dec[red] = {'accion': 'deja', 'operador': NOMBRES.get(red, red), 'voces': votos}
            continue
        # absorbida: today's owner only when two voices name the same company
        duenos = Counter(o for _, o in vs.values() if o)
        hoy, n_hoy = (duenos.most_common(1)[0] if duenos else (None, 0))
        dec[red] = {'accion': 'deja', 'operador': hoy if n_hoy >= 2 else '', 'red': red, 'voces': votos}
    return dec


def aplica(dec, lineas_zoo_f):
    """The same rules on the published file: the Zoo's lines (source index f) are kept, renamed or dropped."""
    d = json.load(open(FIBRA, encoding='utf-8'))
    salida, quitadas, km_quitados = [], Counter(), 0
    for x in d['lineas']:
        if x['f'] != lineas_zoo_f:
            salida.append(x); continue
        red = x.get('red') or x['o']
        r = dec.get(red)
        if not r or r['accion'] == 'quita':
            quitadas[red] += 1; km_quitados += x.get('km', 0); continue
        if r.get('red'):
            x['red'] = r['red']; x['n'] = ''; x['o'] = r.get('operador', '')
        else:
            if x['n'] == x['o']:
                x['n'] = r['operador']
            x['o'] = r['operador']
        salida.append(x)
    d['lineas'] = salida
    paises = sorted({x['cc'] for x in salida if x.get('cc')})
    d['medida'] = {'lineas': len(salida), 'km': sum(x.get('km', 0) for x in salida), 'paises': paises}
    for i, f in enumerate(d['fuentes']):
        f['km'] = sum(x.get('km', 0) for x in salida if x['f'] == i)
    json.dump(d, open(FIBRA, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    return quitadas, km_quitados, d['medida']


def main():
    dec = decide()
    res = {'nota': 'Revisión de la agencia GUARDIANA (Claude, ChatGPT y Grok, 23 Oct 2026) de las redes de The Internet Topology Zoo: '
                   'fuera los mapas de colecciones históricas y las redes que dos voces no confirman; las absorbidas, con su dueño '
                   'de hoy cuando dos voces lo nombran igual. La lee fibra_tierra.py.',
           'redes': dec}
    json.dump(res, open(SALIDA, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    c = Counter('quita' if r['accion'] == 'quita' else ('absorbida' if r.get('red') else 'existe') for r in dec.values())
    print('redes:', len(dec), dict(c))
    print('absorbidas con dueño de hoy:', sorted((k, r['operador']) for k, r in dec.items() if r.get('red') and r['operador']))
    print('absorbidas sin dueño acordado:', sorted(k for k, r in dec.items() if r.get('red') and not r['operador']))
    if '--aplica' in sys.argv:
        d = json.load(open(FIBRA, encoding='utf-8'))
        f = next(i for i, x in enumerate(d['fuentes']) if 'Topology Zoo' in x.get('n', ''))
        q, km, med = aplica(dec, f)
        print('líneas quitadas:', sum(q.values()), '·', km, 'km ·', len(q), 'redes')
        print('medida nueva:', {'lineas': med['lineas'], 'km': med['km'], 'paises': len(med['paises'])})


if __name__ == '__main__':
    main()
