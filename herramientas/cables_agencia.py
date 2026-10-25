#!/usr/bin/env python3
"""GUARDIANA · Órbita: the submarine cables that OpenStreetMap does not have, rebuilt by the agency.

Owner, 22 Oct 2026 (plan B, approved 09:51): «Claude + ChatGPT + Gemini reconstruyen los cables que faltan: nombre,
llegadas en orden con coordenadas, año, km, dueños y fuentes públicas. Guardar solo lo que coincida entre ellos y
confirme una fuente; validar coordenadas; trazado aproximado por mar y rotulado "trazado aproximado"».

Input: every JSON in herramientas/cables-agencia/ (one file per answer; name says who answered: chatgpt-*, gemini-*,
claude-*, grok-*, astra-*). Each is a list of {nombre, llegadas:[{lugar, pais, lat, lon}], anio, km, duenos:[], fuentes:[]}.

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
import unicodedata
import json, math, os, re, glob, heapq, collections, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.join(AQUI, '..', 'orbita')
CARPETA = os.path.join(AQUI, 'cables-agencia')
sys.path.insert(0, AQUI)
from lugares_capas import lee_ciudades, Rejilla, km, base_cable  # noqa: E402

ALIAS = {  # the same cable under different names (lower case, letters and digits only)
    'australtroncalaustral': 'austral',  # «Fibra Óptica Austral (FOA), Troncal Submarina Austral» = «Fibra Óptica Austral (troncal submarina)»
    'mauritiusandrodrigues': 'mars', 'mauritiusandrodriguessubmarinecablesystem': 'mars',  # 22 Oct 2026: MARS under its long name
    'cabosanlucasmazatlan': 'tmx5', 'tmx5': 'tmx5',  # 24 Oct 2026 (ronda 26b): Gemini's «Cabo San Lucas-Mazatlán» is Telmex's TMX5 (San José del Cabo–Mazatlán, in service 23-9-2025)
    # 24 Oct 2026, 20:20 (owner: «Chequéalo todo»): the same cable under two names was drawn twice; same landings, year and owner
    'aualeutian': 'alaskaunitedaleutians', 'aualeutians': 'alaskaunitedaleutians',
    'easternlightswedenfinlandi': 'easternlight',  # 25 Oct 2026: «Eastern Light Sweden-Finland I» is the same system as «Eastern Light» (Stockholm–Helsinki)
    'marianasguamcable': 'marianaguam', 'marianasguam': 'marianaguam',
    'tatatgnwesterneurope': 'tgnwesterneurope',
    'hawaiiislandfibrenetworkhifn': 'hawaiianislands',
    'jakartasurabayacablesystemjayabaya': 'jayabaya', 'jakartasurabaya': 'jayabaya',
    'doscontinentesiii': 'doscontinentesi',
    'pichilinguetopolobampo': 'gulfofcalifornia',  # Megacable's La Paz–Topolobampo (2019)
    'transcookstraitcableaquatronics': 'cookstraittelecommunications', 'transcookstrait': 'cookstraittelecommunications',  # Transpower, Oteranga Bay–Fighting Bay
    'comorosdomesticsubmarinecablesystem': 'avassa', 'comoros': 'avassa',  # the Comoros domestic cable is Avassa (Comores Câbles)
    # ACM (the Dutch regulator) counts two Bonaire–Curaçao cables, Jerry Newton and Amerigo Vespucci (part Telbo); a third
    # «Bonaire-Curaçao Cable System» (Telbo) is not listed apart, so it joins Amerigo Vespucci instead of drawing a third line
    'bonairecuracaocablesystem': 'amerigovespucci', 'bonairecuracao': 'amerigovespucci',
    'baltichighwayclion1': 'clion1', 'baltichighway': 'clion1',  # Cinia's C-Lion1 (Helsinki–Rostock), «Baltic Highway» in one answer
    'denmarkpoland2baltica': 'baltica', 'denmarkpoland2': 'baltica',
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
    'wacswestafricacablesystem': 'wacs', 'aceafricacoasttoeurope': 'ace', 'glo1': 'glo1', 'safesouthafricafareast': 'safe', 'eassyeasternafricasubmarinecablesystem': 'eassy', 'teamstheeastafricanmarinesystem': 'teams', 'theeastafricanmarinesystem': 'teams', 'peacepakistaneastafricaconnectingeurope': 'peace', 'sacssouthatlanticcablesystem': 'sacs', 'sailsouthatlanticinterlink': 'sail', 'lionlowerindianoceannetwork': 'lion', 'lion2lowerindianoceannetwork2': 'lion2',
    'hawaikicable': 'hawaiki', 'pipepacificcable1': 'ppc1', 'pipepacificcable1ppc1': 'ppc1', 'coralseacablesystemcs2': 'coralsea', 'australiasingaporecableasc': 'asc',
    'tongacablesystem': 'tongacable', 'manatuaonepolynesiacable': 'manatua', 'southerncrosscablenetworksccn': 'southerncross',
    # Americas
    'atlanticcrossing1': 'ac1', 'atlanticcrossing1ac1': 'ac1', 'yellowatlanticcrossing2': 'yellow', 'atlanticcrossing2': 'yellow', 'ac2': 'yellow',
    'flagatlantic1': 'fa1', 'flagatlantic1fa1': 'fa1', 'tatatgnatlantic': 'tgnatlantic', 'gttexpress': 'exaexpress', 'gttexpresshiberniaexpress': 'exaexpress', 'hiberniaexpress': 'exaexpress',
    'gttatlantic': 'exanorth', 'gttatlantichiberniaatlantic': 'exanorth', 'hiberniaatlantic': 'exanorth', 'hibernianorth': 'exanorth', 'hiberniasouth': 'exasouth', 'exaatlanticnorth': 'exanorth', 'exaatlanticsouth': 'exasouth',
    'darwinjakartasingaporeenlacenuevoentrenwcsyasc': 'darwinjakartasingapore', 'djsc': 'darwinjakartasingapore',
    'havfrueaec2': 'havfrue', 'aec2': 'havfrue', 'havfrueamericaeuropeconnect2': 'havfrue', 'americaeuropeconnect1': 'aec1', 'americaeuropeconnect1aec1': 'aec1', 'americaeuropeconnect': 'aec1', 'aeconnect': 'aec1',
    'arcos': 'arcos1', 'americasii': 'americas2', 'americas2': 'americas2', 'pacificcaribbeancablesystem': 'pccs', 'pacificcaribbeancablesystempccs': 'pccs',
    'sam1southamerica1': 'sam1', 'southamerica1': 'sam1', 'southamericancrossingsaclan': 'sac', 'southamericancrossing': 'sac', 'saclan': 'sac', 'sac': 'sac',
    'panamericancrossing': 'pac', 'panamericancrossingpac': 'pac', 'panamericanpanam': 'panam', 'panamerican': 'panam', 'panam': 'panam',
    'easterncaribbeanfibersystem': 'ecfs', 'easterncaribbeanfibersystemecfs': 'ecfs', 'southerncaribbeanfiber': 'scf', 'southerncaribbeanfiberscf': 'scf',
    'colombiafloridasubseafiber': 'cfx1', 'colombiafloridasubseafibercfx1': 'cfx1', 'colombiafloridaxpress': 'cfx1',
    'globalcaribbeannetwork': 'gcn', 'globalcaribbeannetworkgcn': 'gcn', 'surinameguyanasubmarinecablesystem': 'sgscs', 'surinameguyanasubmarinecablesystemsgscs': 'sgscs',
    'challengerbermuda1': 'cb1', 'challengerbermuda1cb1': 'cb1', 'cbuscaribbeanbermudaus': 'cbus', 'caribbeanbermudaus': 'cbus',
    'basslinktelecomsdetelecomunicaciones': 'basslink', 'englandskabelen': 'nouk', 'italcro': 'italycroatia', 'amricamvil1': 'amx1', 'americamovil1': 'amx1', 'basslinktelecoms': 'basslink', 'bcsnorthphase1': 'bcsnorth', 'hibernia': 'exanorth', 'acsalaskaoregon': 'akorn',
    'brus': 'brusa', 'europeindiagateway': 'eig', 'gulfbridgeinternational': 'gbi', 'gulfbridgeinternationalcablesystem': 'gbi', 'omanaustraliacable': 'oac',
    'akornalaskaoregonnetwork': 'akorn', 'alaskaoregonnetwork': 'akorn', 'quintillionsubseacable': 'quintillion', 'alaskaunitedaueastyauwest': 'alaskaunited',
}

# words that say what the thing is, not which one it is: «KetchCan1» and «KetchCan1 Submarine Fiber Cable System» are the same cable
# 24 Oct 2026, 20:40: OpenStreetMap names some cables by segment («ECFS 6.3», «Flag Atlantic South», «Hibernia 'D'»); these
# are the agency cables they belong to, so that the same cable is not drawn twice (one OSM piece ending in the sea)
OSM_ES = {'americas2d': 'americas2', 'americas2l': 'americas2',
          'ecfs1c': 'ecfs', 'ecfs2': 'ecfs', 'ecfs45': 'ecfs', 'ecfs63': 'ecfs', 'ecfs7': 'ecfs',
          'hiberniaa': 'exanorth', 'hiberniac': 'exanorth', 'hiberniad': 'exasouth',  # Hibernia Atlantic is today EXA North and South
          'flagatlanticnorth': 'fa1', 'flagatlanticsouth': 'fa1', 'flagatlanticinterlink': 'fa1',
          'tataatlanticnorth': 'tgnatlantic', 'tataatlanticsouth': 'tgnatlantic',
          'tatawesterneuropeukportugal': 'tgnwesterneurope', 'tatawesterneuropeukspain': 'tgnwesterneurope',
          'farice': 'farice1', 'easternlightswedenfinlandi': 'easternlight', 'eacd': 'eacc2c', 'sjc2hk': 'sjc2'}


def sueltos(osm, fina, lejos=15, junto=8):
    """indices of OpenStreetMap segments with an end in open sea: over water on the fine coast, more than «lejos» km from
    land, and no other OSM segment end within «junto» km (the next piece or a branching unit). Such a segment is a cable
    traced only in part in the open data (owner, 24 Oct 2026, 20:28: «terminan ahí, como en el mar»)."""
    celdas = collections.defaultdict(list)
    for i, s_ in enumerate(osm):
        for e in (s_['l'][0], s_['l'][-1]): celdas[(int(e[0] * 10), int(e[1] * 10))].append((i, e))
    def vecino(i, e):
        cx, cy = int(e[0] * 10), int(e[1] * 10)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for j, f in celdas[(cx + dx, cy + dy)]:
                    if (j != i or f is not e) and km(e[1], e[0], f[1], f[0]) < junto: return True
        return False
    def lejos_de_tierra(lo, la):
        for r in range(1, int(lejos / (111 * fina.P)) + 2):
            d = r * fina.P
            for k in range(0, 360, 15):
                a = math.radians(k)
                if fina.tierra(lo + d * math.cos(a) / max(0.2, math.cos(math.radians(la))), la + d * math.sin(a)): return False
        return True
    out = set()
    for i, s_ in enumerate(osm):
        for e in (s_['l'][0], s_['l'][-1]):
            if not fina.tierra(*e) and not vecino(i, e) and lejos_de_tierra(*e):
                out.add(i); break
    return out


# 24 Oct 2026, 20:45 (owner: «revisión completa de todo el planeta»): cables that are no longer in service and were still
# drawn (from OpenStreetMap pieces without an end date, or an agency answer). Source: Wikipedia, «Transatlantic
# communications cable» and «List of international submarine communications cables» (24 Oct 2026).
RETIRADOS = {'tat9f5': 'TAT-9, retirado en 2004', 'tat11f4': 'TAT-11, retirado en 2003', 'tat12': 'TAT-12/13, retirado en 2008',
             'tat13': 'TAT-12/13, retirado en 2008', 'tat12interlink': 'TAT-12/13, retirado en 2008', 'tat14': 'TAT-14, retirado en 2020',
             'cantat3': 'CANTAT-3, fuera de servicio normal desde 2010 (solo plataformas petrolíferas)',
             'seamewe2': 'SEA-ME-WE 2, dado de baja'}

# 24 Oct 2026, 21:10 (owner: «los cables que terminan en plataformas petrolíferas… que aparezca el nombre de la plataforma»):
# the offshore networks of the North Sea are kept as OpenStreetMap draws them, platform by platform; the agency's
# simplified versions of them (Kårstø–Lowestoft, Aberdeen–Stavanger) are not drawn on top
OSM_PRIORIDAD = {'tampnet', 'tampnet3', 'tampnetnorthsea', 'norseacoms', 'norseacom1', 'sleipnirgranefoc', 'cns'}

# 25 Oct 2026 (round 30: «los extremos sueltos»; two voices, agencia-rondas/ronda30/{chatgpt,gemini}-extremos.json):
# OpenStreetMap pieces whose loose end both voices place on land go on to that landing (the added stretch follows the sea
# with the fine coast; its exact route is not public); by the piece's name: (loose end, landing, why)
EXTIENDE = {
    '臺金二號海纜': ((118.917, 24.418), (120.505, 24.258), 'Taiwán–Kinmen 2 llega a Taichung (puerto), según las dos voces (MODA y el condado de Kinmen)'),
    'UK-Ireland Crossing 2': ((-6.104, 52.305), (-6.358, 52.398), 'llega a Ballinesker (Curracloe, Wexford), según las dos voces (informe SEA8 del Reino Unido)'),
}
# unnamed pieces that end in open sea and that neither voice identifies as a telecom cable (Sirri), or that repeat the
# start of a cable the agency already draws (Tonga Cable, Nuku'alofa–Suva): by one of their ends
SIN_NOMBRE_FUERA = {(54.626, 25.748): 'cable sin nombre de Sirri (Irán): ninguna voz lo identifica',
                    (-175.605, -20.961): 'tramo sin nombre de Tonga: es el principio de Tonga Cable, ya dibujado entero'}

# the name shown for a cable that goes by several names (ALIAS), when the most common answer is not its real name
NOMBRE = {'tmx5': 'TMX5', 'amerigovespucci': 'Amerigo Vespucci', 'gulfofcalifornia': 'Gulf of California Cable',
          'cookstraittelecommunications': 'Cook Strait Telecommunications Cable',
          'alaskaunitedaleutians': 'Alaska United Aleutians (AU-Aleutians)', 'avassa': 'Avassa',
          'jayabaya': 'Jakarta-Surabaya Cable System (JAYABAYA)', 'doscontinentesi': 'Dos Continentes I y II',
          'marianaguam': 'Mariana-Guam Cable', 'tgnwesterneurope': 'TGN-Western Europe',
          'hawaiianislands': 'Hawaiian Islands Fiber Network (HIFN)'}

GENERICAS = re.compile(r'\b(?:submarine|submarino|submarina|subsea|undersea|cable|cables|system|sistema|fiber|fibre|fibra|optic|optica|óptica|project|proyecto|network|domestic|doméstico|domestica|secciones|operativas|slt)\b', re.I)
# 22 Oct 2026: accents folded first («ÍRIS» and «IRIS» are one cable)
compacta = lambda x: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', x or '').encode('ascii', 'ignore').decode().lower())
def generica(k):
    """The same stripping on a compact key (for the alias targets, which have no word boundaries)."""
    for w in ('submarine', 'subsea', 'cablesystem', 'fibersystem', 'cable', 'system', 'fiber', 'fibre', 'network', 'project', 'domestic'):
        k = k.replace(w, '')
    return k

def clave(n):
    b = re.sub(r'\s*\(.*?\)\s*', ' ', n or '')  # «GLO-1 (Globacom-1)» → the part outside the brackets and the part inside
    if ' / ' in b: b = b.split(' / ')[0]  # «Amitié / America Europe Connect-3» → the first of the names it goes by
    k = compacta(base_cable(b))
    k2 = compacta(n)
    for c in (k2, k):
        if c in ALIAS: return generica(ALIAS[c]) or ALIAS[c]
    k3 = generica(compacta(GENERICAS.sub(' ', base_cable(b))))  # «Skagenfiber West» and «Skagen Fiber West» are one
    if len(k3) >= 3:
        if k3 in ALIAS: return generica(ALIAS[k3]) or ALIAS[k3]
        return k3
    return ALIAS.get(k, k)

# ---------- water mask ----------
class Agua:
    def __init__(self):
        from PIL import Image
        im = Image.open(os.path.join(RAIZ, 'static', 'tierra', 'agua.png')).convert('L')
        self.W, self.H = im.size  # 2048×1024: one pixel is about 20 km at the equator
        self.m = bytearray(im.tobytes())
        self.abre_pasos()
    # 23 Oct 2026 (owner, on a straight «cable» from Marseille to Karachi across Turkey and Iran: «¿ese cable submarino es
    # un error? revisa todo»): at 20 km a pixel the mask closes the Gulf of Suez and the Suez crossing, the Bosphorus and
    # the Dardanelles, and Panama, so a hop through them found no sea route and fell back to a straight line over land.
    # For tracing only (the planet's own water is not touched), those passages are opened along their real course:
    # the cables there cross Egypt and Panama by land or go through the Turkish straits, a few tens of km either way.
    PASOS = {
        'Suez y golfo de Suez': [(32.32, 31.32), (32.30, 31.00), (32.28, 30.60), (32.35, 30.30), (32.55, 29.95), (32.62, 29.60), (32.95, 29.05), (33.45, 28.45), (33.85, 27.95), (34.20, 27.70)],
        'Bósforo, Mármara y Dardanelos': [(29.15, 41.30), (29.05, 41.10), (28.98, 40.98), (28.60, 40.85), (28.00, 40.75), (27.40, 40.60), (26.85, 40.45), (26.60, 40.30), (26.38, 40.12), (26.15, 39.95), (25.90, 39.85)],
        'Panamá': [(-79.95, 9.55), (-79.92, 9.30), (-79.85, 9.15), (-79.68, 9.02), (-79.55, 8.90), (-79.45, 8.70)],
        'Golfo de Aqaba': [(35.00, 29.52), (34.92, 29.10), (34.72, 28.60), (34.50, 28.10), (34.42, 27.85)],
    }
    def abre_pasos(self):
        for linea in self.PASOS.values():
            for (lo1, la1), (lo2, la2) in zip(linea, linea[1:]):
                x1, y1 = self.px(lo1, la1); x2, y2 = self.px(lo2, la2)
                n = max(abs(x2 - x1), abs(y2 - y1), 1)
                for j in range(n + 1):
                    x = round(x1 + (x2 - x1) * j / n); y = round(y1 + (y2 - y1) * j / n)
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            if 0 <= y + dy < self.H: self.m[(y + dy) * self.W + ((x + dx) % self.W)] = 255
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
    def ruta(self, a, b, umbral=96):
        """A* over water pixels from a to b (pixel coords), 8 neighbours, wrapping east–west. Returns pixel list.
        «umbral»: how much water a pixel needs to be crossed (the coast is soft: higher keeps narrow land closed)."""
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
                    if ny < 0 or ny >= H or not self.agua(nx, ny, umbral): continue
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

class Fina:
    """24 Oct 2026, 20:20 (owner, on H2HE drawn from Zhuhai across Lantau: «Chequéalo todo»): the 20 km mask lets a
    traced route cut across islands, deltas and peninsulas, and a landing given as an inland city pulls the line inland.
    After tracing, each route is checked on Natural Earth 10m land (public domain, rasterised at 0.025°, about 2.7 km:
    herramientas/fuentes/tierra-ne10m.png): a stretch over land inside the route is traced again by sea on this finer grid
    when the sea way round is reasonable (otherwise it is a real crossing by land, as at Suez, Panama or Guatemala, and is
    kept), and a route that ends inland is cut where it reaches the coast."""
    P = 0.025

    def __init__(self, agua):
        from PIL import Image
        Image.MAX_IMAGE_PIXELS = None  # our own 14400×7200 mask
        im = Image.open(os.path.join(AQUI, 'fuentes', 'tierra-ne10m.png')).convert('L')
        self.W, self.H = im.size
        self.m = bytearray(im.tobytes())  # 255 land, 0 water
        for linea in agua.PASOS.values():  # the same passages the tracing opens (Suez, the Turkish straits, Panama, Aqaba)
            for (lo1, la1), (lo2, la2) in zip(linea, linea[1:]):
                x1, y1 = self.px(lo1, la1); x2, y2 = self.px(lo2, la2)
                n = max(abs(x2 - x1), abs(y2 - y1), 1)
                for j in range(n + 1):
                    x = round(x1 + (x2 - x1) * j / n); y = round(y1 + (y2 - y1) * j / n)
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            if 0 <= y + dy < self.H: self.m[(y + dy) * self.W + ((x + dx) % self.W)] = 0
        self.cambios = collections.Counter()

    def px(self, lo, la):
        return int(((lo + 180) % 360) / self.P) % self.W, min(self.H - 1, max(0, int((90 - la) / self.P)))

    def tierra(self, lo, la):
        x, y = self.px(lo, la)
        return self.m[y * self.W + x] > 127

    def muestras(self, linea, paso=1.5):
        """[(lon, lat, km from the start, over land)] every «paso» km along the line (straight in lon/lat per hop)"""
        out, pos = [], 0.0
        for (lo1, la1), (lo2, la2) in zip(linea, linea[1:]):
            if lo2 - lo1 > 180: lo2 -= 360
            elif lo1 - lo2 > 180: lo2 += 360
            d = km(la1, lo1, la2, lo2); n = max(1, int(d / paso))
            for j in range(n):
                f = j / n; lo = lo1 + (lo2 - lo1) * f; la = la1 + (la2 - la1) * f
                lo = ((lo + 180) % 360) - 180
                out.append((lo, la, pos + d * f, self.tierra(lo, la)))
            pos += d
        lo, la = linea[-1]
        out.append((lo, la, pos, self.tierra(lo, la)))
        return out

    def astar(self, a, b, margen_km=120):
        """the shortest way by water between two water points on the fine grid, inside their box plus a margin"""
        (x1, y1), (x2, y2) = self.px(*a), self.px(*b)
        if abs(x2 - x1) > self.W / 2: return None  # across the antimeridian: not worth it
        mg = int(margen_km / (111 * self.P)) + 4
        X0, X1 = max(0, min(x1, x2) - mg), min(self.W - 1, max(x1, x2) + mg)
        Y0, Y1 = max(0, min(y1, y2) - mg), min(self.H - 1, max(y1, y2) + mg)
        if (X1 - X0 + 1) * (Y1 - Y0 + 1) > 1500000: return None
        ancho = X1 - X0 + 1
        agua = lambda x, y: self.m[y * self.W + x] < 128
        if not agua(x1, y1) or not agua(x2, y2): return None
        inicio, fin = (y1 - Y0) * ancho + (x1 - X0), (y2 - Y0) * ancho + (x2 - X0)
        h = lambda i: (lambda dx, dy: max(dx, dy) + 0.4142 * min(dx, dy))(abs(i % ancho + X0 - x2), abs(i // ancho + Y0 - y2))
        g = {inicio: 0.0}; de = {inicio: None}; cola = [(h(inicio), inicio)]; vistos = set()
        while cola:
            _, i = heapq.heappop(cola)
            if i == fin: break
            if i in vistos: continue
            vistos.add(i)
            x, y = i % ancho + X0, i // ancho + Y0
            for dx, dy, c in ((1, 0, 1), (-1, 0, 1), (0, 1, 1), (0, -1, 1), (1, 1, 1.4142), (1, -1, 1.4142), (-1, 1, 1.4142), (-1, -1, 1.4142)):
                nx, ny = x + dx, y + dy
                if X0 <= nx <= X1 and Y0 <= ny <= Y1 and agua(nx, ny):
                    j = (ny - Y0) * ancho + (nx - X0); ng = g[i] + c
                    if ng < g.get(j, 1e18):
                        g[j] = ng; de[j] = i; heapq.heappush(cola, (ng + h(j), j))
        if fin not in de: return None
        pts, i = [], fin
        while i is not None:
            pts.append((i % ancho + X0 + 0.5, i // ancho + Y0 + 0.5)); i = de[i]
        pts.reverse()
        pts = simplifica(pts, 0.45)
        return [[round(px * self.P - 180, 4), round(90 - py * self.P, 4)] for px, py in pts]

    def corrige(self, linea, nombre=''):
        if len(linea) < 2: return linea
        m = self.muestras(linea)
        total = m[-1][2]
        # 1. the ends: a route that runs inland at either end stops where it reaches the coast
        def primera_agua(seq):
            for i, s in enumerate(seq):
                if not s[3]: return i
            return None
        i0 = primera_agua(m); i1 = primera_agua(m[::-1])
        if i0 is None or i1 is None: return linea  # all over land on this grid (a tiny island or a lake): leave it
        ini = m[i0] if m[i0][2] > 3 else m[0]
        fin = m[len(m) - 1 - i1] if total - m[len(m) - 1 - i1][2] > 3 else m[-1]
        if ini is not m[0]: self.cambios['extremo en la costa'] += 1
        if fin is not m[-1]: self.cambios['extremo en la costa'] += 1
        m = [s for s in m if ini[2] <= s[2] <= fin[2]]
        if len(m) < 2: return linea
        # an end left out at sea (a landing placed offshore) reaches the nearest coast, if there is one within 40 km
        def costa(lo, la):
            for r in range(1, int(40 / (111 * self.P)) + 2):
                d = r * self.P
                for k in range(0, 360, 10):
                    a = math.radians(k); lo2 = lo + d * math.cos(a) / max(0.2, math.cos(math.radians(la))); la2 = la + d * math.sin(a)
                    if self.tierra(lo2, la2): return (lo2, la2)
            return None
        for lado in (0, -1):
            e = m[lado]
            if not e[3]:
                c = costa(e[0], e[1])
                if c and km(e[1], e[0], c[1], c[0]) > 3:
                    q = (c[0], c[1], e[2], True)
                    if lado == 0: m.insert(0, q)
                    else: m.append(q)
                    self.cambios['extremo en el mar llevado a la costa'] += 1
        # 2. stretches over land inside the route, grouped when they are close (a string of islands, a bay): each group
        # is traced again by sea between water points before and after it, when the way round is reasonable
        runs, k = [], 1
        while k < len(m):
            if m[k][3]:
                a = k
                while k < len(m) and m[k][3]: k += 1
                if m[min(k, len(m) - 1)][2] - m[a][2] >= 3 and k < len(m): runs.append([a, k])
            k += 1
        grupos = []
        for r in runs:
            if grupos and m[r[0]][2] - m[grupos[-1][1]][2] < 150: grupos[-1][1] = r[1]
            else: grupos.append(list(r))
        out, ultimo = [], 0
        for a0, b0 in grupos:
            if sum(1 for q in m[a0:b0] if q[3]) * 1.5 < 5: continue
            # water points about 40 km before and after the group
            a = a0
            while a > ultimo and (m[a][3] or m[a0][2] - m[a][2] < 40): a -= 1
            b = b0
            while b < len(m) - 1 and (m[b][3] or m[b][2] - m[b0][2] < 40): b += 1
            if m[a][3] or m[b][3]: continue
            recto = km(m[a][1], m[a][0], m[b][1], m[b][0])
            hecho = None
            for margen in (max(120, 0.5 * recto), max(300, 1.0 * recto)):
                r = self.astar((m[a][0], m[a][1]), (m[b][0], m[b][1]), margen)
                if not r: continue
                largo = sum(km(p[1], p[0], q[1], q[0]) for p, q in zip(r, r[1:]))
                # kept only when it really has less land than the stretch it replaces (in narrow fjords the simplified
                # path can cut corners)
                antes = sum(1.5 for q in m[a:b + 1] if q[3])
                if largo <= 3 * recto + 150 and sum(1.5 for q in self.muestras(r) if q[3]) < antes: hecho = r
                break
            if hecho:
                out += [[round(q[0], 4), round(q[1], 4)] for q in m[ultimo:a]] + hecho
                ultimo = b + 1
                self.cambios['rodea tierra por mar'] += 1
            else:
                self.cambios['paso por tierra que se queda (real o sin mar alrededor)'] += 1
        out += [[round(q[0], 4), round(q[1], 4)] for q in m[ultimo:]]
        out = [list(p) for p in simplifica([tuple(p) for p in out], 0.01)]
        # 3. still over land inside (the coarse route took a way that is closed at this scale, the Kanmon Strait or Cook
        # Inlet): the whole hop is traced again by sea on the fine grid, if that way is reasonable
        def dentro(l):
            mm = self.muestras(l); t = mm[-1][2]
            return sum(1.5 for x in mm if x[3] and 3 < x[2] < t - 3)
        resto = dentro(out)
        if resto > 10:
            a, b = out[0], out[-1]
            recto = km(a[1], a[0], b[1], b[0])
            for margen in (max(150, 0.35 * recto), max(300, 0.8 * recto)):  # a wider box when the way round is long (south of Kyushu)
                r = self.astar((a[0], a[1]), (b[0], b[1]), margen)
                if not r: continue
                largo = sum(km(p[1], p[0], q[1], q[0]) for p, q in zip(r, r[1:]))
                if largo > 2.5 * recto + 250: break
                r = [list(a)] + r[1:-1] + [list(b)]
                if dentro(r) < resto:
                    self.cambios['tramo entero trazado de nuevo por mar'] += 1
                    return r
                break
            self.cambios['sigue pisando tierra'] += 1
        return out


def tierra_en(agua, linea, bordes=40):
    """(longest stretch over land inside the line, total km over land) for a lon/lat line, following the great circle
    between its points every ~10 km. The first and last «bordes» km are the landing itself and do not count."""
    pts, pos = [], 0.0
    for (lo1, la1), (lo2, la2) in zip(linea, linea[1:]):
        d = km(la1, lo1, la2, lo2); n = max(1, int(d / 10))
        a1, b1, a2, b2 = map(math.radians, (la1, lo1, la2, lo2))
        u = (math.cos(a1) * math.cos(b1), math.cos(a1) * math.sin(b1), math.sin(a1)); v = (math.cos(a2) * math.cos(b2), math.cos(a2) * math.sin(b2), math.sin(a2))
        ang = math.acos(max(-1.0, min(1.0, sum(p * q for p, q in zip(u, v)))))
        for j in range(n + (1 if (lo2, la2) == tuple(linea[-1]) else 0)):
            f = j / n
            if ang < 1e-9: w = u
            else:
                f0, f1 = math.sin((1 - f) * ang) / math.sin(ang), math.sin(f * ang) / math.sin(ang)
                w = tuple(f0 * p + f1 * q for p, q in zip(u, v))
            lo, la = math.degrees(math.atan2(w[1], w[0])), math.degrees(math.asin(max(-1.0, min(1.0, w[2]))))
            x, y = agua.px(lo, la)
            pts.append((pos + d * f, agua.agua(x, y, 128)))
        pos += d
    larga = total = 0.0; ini = None
    for i, (k, w) in enumerate(pts):
        dentro = bordes < k < pos - bordes
        if not w and dentro and ini is None: ini = k
        if (w or not dentro) and ini is not None:
            larga = max(larga, k - ini); total += k - ini; ini = None
    return larga, total

def densa(linea, paso=150):
    """Points every «paso» km at most, straight on the map: the planet draws each hop as a great circle, which over a
    long hop bows away from the traced route and can cut across a cape (Baja California on Curie, 23 Oct 2026)."""
    out = [linea[0]]
    for (lo1, la1), (lo2, la2) in zip(linea, linea[1:]):
        if lo2 - lo1 > 180: lo2 -= 360
        elif lo1 - lo2 > 180: lo2 += 360
        n = int(km(la1, lo1, la2, lo2) // paso)
        for j in range(1, n + 1):
            f = j / (n + 1); lo = lo1 + (lo2 - lo1) * f
            out.append([round(((lo + 180) % 360) - 180, 3), round(la1 + (la2 - la1) * f, 3)])
        out.append([round(((lo2 + 180) % 360) - 180, 3), round(la2, 3)])
    return out

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
    for q in ('chatgpt', 'gemini', 'claude', 'grok', 'astra', 'kimi'):  # kimi: Kimi (Moonshot AI), a voice since 24 Oct 2026  # astra: GPT-6 Astra (Cheaper Inference), a voice since 23 Oct 2026
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
    fina = Fina(agua)
    conf = confirmados()
    por_cable = carga()
    cab = json.load(open(os.path.join(RAIZ, 'datos', 'cables.json'), encoding='utf-8'))
    osm = [s for s in cab['cables'] if s.get('src') != 'agencia']
    fuera = [s for s in osm if clave(s.get('n') or '') in RETIRADOS]
    if fuera: print('tramos de cables retirados que dejan de dibujarse:', len(fuera), '·', ', '.join(sorted({s.get('n') for s in fuera})))
    osm = [s for s in osm if clave(s.get('n') or '') not in RETIRADOS]
    cerca = lambda e, q: abs(e[0] - q[0]) < 0.01 and abs(e[1] - q[1]) < 0.01
    quitar = [s for s in osm if not s.get('n') and any(cerca(e, q) for e in (s['l'][0], s['l'][-1]) for q in SIN_NOMBRE_FUERA)]
    if quitar: print('tramos sin nombre que dejan de dibujarse (ronda 30):', len(quitar))
    osm = [s for s in osm if not any(s is q for q in quitar)]
    for s in osm:
        x = EXTIENDE.get(s.get('n') or '')
        if not x: continue
        suelto, destino, por = x
        for fin in (-1, 0):
            if cerca(s['l'][fin], suelto):
                tramo = densa(fina.corrige([list(suelto), list(destino)], s['n']))
                s['l'] = s['l'] + tramo[1:] if fin == -1 else tramo[::-1][:-1] + s['l']
                s['ext'] = por
                print('extremo suelto llevado a tierra:', s['n'], '·', por)
    # what OpenStreetMap already has, by whole cable: how many distinct landings (ends near a city)
    osm_llegadas = collections.defaultdict(set)
    for s in osm:
        k = clave(s.get('n') or '')
        if not k: continue
        for lo, la in (s['l'][0], s['l'][-1]):
            c = rj.cercana(la, lo, 80)
            if c is not None: osm_llegadas[k].add(c)
    # OSM cables traced only in part (an end in open sea): the agency's whole cable is drawn instead, even if OSM has
    # half of its landings
    i_sueltos = sueltos(osm, fina)
    claves_sueltas = {OSM_ES.get(clave(osm[i].get('n') or ''), clave(osm[i].get('n') or '')) for i in i_sueltos if osm[i].get('n')}
    print('tramos de OpenStreetMap que acaban en mar abierto:', len(i_sueltos), '· con nombre:', sum(1 for i in i_sueltos if osm[i].get('n')))
    salida, descartes = [], []
    for k, respuestas in por_cable.items():
        if k in RETIRADOS:
            descartes.append((k, 'retirado: ' + RETIRADOS[k])); continue
        if k in OSM_PRIORIDAD:
            descartes.append((k, 'OpenStreetMap lo dibuja con sus plataformas')); continue
        miembros = {m for m, _ in respuestas}
        if len(miembros) < 2 and k not in conf:
            descartes.append((k, 'solo lo nombra ' + ', '.join(miembros))); continue
        nombre = NOMBRE.get(k) or collections.Counter(c['nombre'].strip() for _, c in respuestas).most_common(1)[0][0]
        # landings: cluster by country + 120 km
        grupos = []
        for m, c in respuestas:
            for L in c.get('llegadas') or []:
                la, lo = num(L.get('lat')), num(L.get('lon'))
                if la is None or lo is None or not L.get('pais'): continue
                cc = L['pais'].upper()
                # 24 Oct 2026: the NEAREST group within 120 km, and never one where this same member already put another
                # landing (a short cable inside one country, Malta–Gozo or St. Thomas–St. Croix, keeps its two ends)
                cerca = [(km(la, lo, g['lat'], g['lon']), i) for i, g in enumerate(grupos) if g['cc'] == cc]
                cerca = [(d, i) for d, i in cerca if d < 120 and (m not in grupos[i]['m'] or d < 5)]
                if cerca:
                    g = grupos[min(cerca)[1]]
                    g['m'].add(m); g['pts'].append((la, lo)); g['lugares'].append(L.get('lugar') or '')
                else:
                    grupos.append({'cc': cc, 'lat': la, 'lon': lo, 'm': {m}, 'pts': [(la, lo)], 'lugares': [L.get('lugar') or ''], 'orden': len(grupos)})
        # 24 Oct 2026: a cable joined from two names (ALIAS) can bring the same landing twice from one member, a few km
        # apart («La Paz» and «La Paz, Baja California Sur»); two groups with the same place name within 30 km are one
        base = lambda t: re.sub(r'[^a-z]', '', unicodedata.normalize('NFKD', re.split(r'[,(]', t or '')[0]).encode('ascii', 'ignore').decode().lower())
        i = 0
        while i < len(grupos):
            j = i + 1
            while j < len(grupos):
                g, h = grupos[i], grupos[j]
                if g['cc'] == h['cc'] and km(g['lat'], g['lon'], h['lat'], h['lon']) < 30 and {base(x) for x in g['lugares'] if x} & {base(x) for x in h['lugares'] if x}:
                    g['m'] |= h['m']; g['pts'] += h['pts']; g['lugares'] += h['lugares']; del grupos[j]
                else: j += 1
            i += 1
        llegadas = []
        for g in grupos:
            if len(g['m']) < 2 and k not in conf: continue
            la = sum(p[0] for p in g['pts']) / len(g['pts']); lo = sum(p[1] for p in g['pts']) / len(g['pts'])
            c = rj.cercana(la, lo, 120)
            # a border town (Taba by Eilat, Vanimo by Jayapura) is kept when two members put it in its own country
            if c is not None and ciudades[c][1] != g['cc'] and len(g['m']) < 2:
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
        if k not in claves_sueltas and len(osm_llegadas.get(k, ())) >= max(2, len(llegadas) / 2):
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
        tramos, sin_trazar = [], []
        for A, B in zip(llegadas, llegadas[1:]):
            recto = km(A['lat'], A['lon'], B['lat'], B['lon'])
            pa, pb = agua.cerca_agua(A['lon'], A['lat'], 12, 128), agua.cerca_agua(B['lon'], B['lat'], 12, 128)
            linea, por, mejor = None, 'mar', None
            if recto > 25 and pa and pb:
                # 23 Oct 2026: the soft coast let some routes cut across narrow land (Baja California, the coast of
                # Ecuador); a route that does is traced again over a stricter mask, and the one with least land is kept
                for umbral in (96, 150, 200):
                    r = agua.ruta((pa[1], pa[2]), (pb[1], pb[2]), umbral)
                    if not r: continue
                    r = simplifica(suaviza(r), 0.6)
                    cand = densa([[A['lon'], A['lat']]] + [[round(x, 3), round(y, 3)] for x, y in (agua.lonlat(px, py) for px, py in r[1:-1])] + [[B['lon'], B['lat']]])
                    largo = sum(km(p[1], p[0], q[1], q[0]) for p, q in zip(cand, cand[1:]))
                    if largo > 2.5 * recto + 200: break  # no way through by sea, even with the passages open
                    t = tierra_en(agua, cand)[0]
                    if mejor is None or t < mejor[0]: mejor = (t, cand)
                    if t <= 60: break
                if mejor: linea = mejor[1]
            if linea is None:
                # A straight hop only where the cable really crosses a little land (Abu Talat → Zafarana in Egypt,
                # Panama, Guatemala…); a hop that would run hundreds of kilometres over land is left out, never
                # drawn as a submarine cable where there is none.
                recta = [[A['lon'], A['lat']], [B['lon'], B['lat']]]
                if tierra_en(agua, recta)[1] <= 400: linea, por = recta, 'tierra'
                else:
                    sin_trazar.append('%s (%s) → %s (%s)' % (A['lugar'], A['cc'], B['lugar'], B['cc'])); continue
            if not any(abs(q[0] - p[0]) > 180 for p, q in zip(linea, linea[1:])):  # not across the antimeridian
                linea = densa(fina.corrige(linea, nombre))
            tramos.append({'n': nombre, 'l': linea, 'src': 'agencia', 'aprox': 1, 'por': por, 'de': [A['lugar'], A['cc']], 'a': [B['lugar'], B['cc']]})
        if sin_trazar: descartes.append((k, 'tramos sin trazar (cruzarían cientos de km de tierra): ' + '; '.join(sin_trazar)))
        if not tramos: continue
        kmMapa = sum(km(p[1], p[0], q[1], q[0]) for t in tramos for p, q in zip(t['l'], t['l'][1:]))
        info = {'anio': anio, 'km': kmv, 'kmMapa': round(kmMapa), 'duenos': ds, 'fuentes': fuentes[:8], 'miembros': sorted(miembros)}
        if sin_trazar: info['sinTrazar'] = len(sin_trazar)
        for t in tramos: t['info'] = info
        salida.append({'clave': k, 'nombre': nombre, 'llegadas': [{x: L[x] for x in ('lugar', 'cc', 'lat', 'lon')} for L in llegadas], 'info': info, 'tramos': len(tramos)})
        cab_nuevos = tramos
        salida[-1]['_tramos'] = cab_nuevos
    # write
    tramos_todos = [t for c in salida for t in c.pop('_tramos')]
    out = {'fuente': 'Reconstruido por la agencia GUARDIANA (Claude, ChatGPT, Grok y Gemini) de fuentes públicas; trazado aproximado por mar.',
           'nota': 'Se guarda solo lo que coincide entre al menos dos miembros de la agencia; coordenadas validadas con GeoNames y la máscara de agua.',
           'cables': salida, 'tramos': tramos_todos}
    with open(os.path.join(RAIZ, 'datos', 'cables-agencia.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    # 24 Oct 2026, 20:30 (owner, on Havfrue fading out in the Atlantic north of Scotland): when the agency draws a whole
    # cable that OpenStreetMap has only in pieces (fewer than half its landings), the pieces go: the same cable was drawn
    # twice and the OSM piece ended in the middle of the sea
    claves_agencia = {c['clave'] for c in salida}
    ck = lambda s_: OSM_ES.get(clave(s_.get('n') or ''), clave(s_.get('n') or ''))
    sin_nombre = [osm[i] for i in i_sueltos if not osm[i].get('n')]
    if sin_nombre:
        print('tramos sin nombre que acaban en mar abierto y dejan de dibujarse:', len(sin_nombre))
    ids_fuera = {id(x) for x in sin_nombre}
    osm = [s_ for s_ in osm if id(s_) not in ids_fuera]
    piezas = [s_ for s_ in osm if s_.get('n') and ck(s_) in claves_agencia]
    if piezas:
        print('piezas de OpenStreetMap que deja de dibujar porque la agencia tiene el cable entero:', len(piezas), '·',
              ', '.join(sorted({s_.get('n') for s_ in piezas})))
    osm = [s_ for s_ in osm if not (s_.get('n') and ck(s_) in claves_agencia)]
    cab['cables'] = osm + tramos_todos
    cab['agencia'] = {'cables': len(salida), 'tramos': len(tramos_todos)}
    with open(os.path.join(RAIZ, 'datos', 'cables.json'), 'w', encoding='utf-8') as f:
        json.dump(cab, f, ensure_ascii=False, separators=(',', ':'))
    print('cables de la agencia aceptados:', len(salida), '· tramos:', len(tramos_todos))
    print('trazado con la costa fina (Natural Earth 10m):', dict(fina.cambios))
    for c in salida: print('  ', c['nombre'], '·', ' → '.join(L['lugar'] + ' (' + L['cc'] + ')' for L in c['llegadas']), '·', c['info']['anio'], c['info']['km'] or ('~%d km mapa' % c['info']['kmMapa']), '·', ', '.join(c['info']['miembros']))
    if descartes:
        print('descartado:')
        for k, por in descartes: print('  ', k, '·', por)

if __name__ == '__main__':
    main()
