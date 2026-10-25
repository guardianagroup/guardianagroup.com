#!/usr/bin/env python3
"""GUARDIANA · Órbita · land fibre backbones confirmed by the agency (owner, 22–23 Oct 2026: «fibra terrestre de los
países grandes»; agency rule: only what two voices confirm).

There is no open map of land fibre for Russia, India, Brazil, Argentina… so two voices (ChatGPT and Grok) were asked,
separately and with the same prompt, for each country's main long-distance backbones as an ORDERED list of the cities
each route passes through. Their answers are in herramientas/fibra-agencia/<voz>-*.json ([{nombre, operador, pais,
ciudades[], estado, fuente}]).

A stretch between two consecutive cities of one voice is kept only when the OTHER voice gives a route of the same
operator in the same country that also passes through both cities, without a detour (its path between them is at most
1.35 × the straight line + 60 km). Cities are placed with GeoNames (orbita/static/tierra/ciudades.tsv, CC BY 4.0).
Stretches are drawn as straight lines between cities, like the Topology Zoo: operators do not publish exact routes.

Writes herramientas/fuentes/fibra-agencia.json, which fibra_tierra.py adds to orbita/datos/fibra-tierra.json.
Usage: python3 herramientas/fibra_agencia.py
"""
import glob, json, math, os, re, sys, unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
CARPETA = os.path.join(AQUI, 'fibra-agencia')
SALIDA = os.path.join(AQUI, 'fuentes', 'fibra-agencia.json')

# Spanish / local names the voices use → the GeoNames name (folded). Only what the answers actually needed.
ALIAS = {
    'hargeisa': 'hargeysa', 'gomel': 'homyel', 'grodno': 'hrodna', 'darkhan': 'darhan', 'khorog': 'khorugh',  # round 17
    'phuentsholing': 'phuntsholing', 'sainshand': 'saynshand',
    'moscu': 'moscow', 'sanpetersburgo': 'saintpetersburg', 'nizhninovgorod': 'nizhniynovgorod', 'nizhnynovgorod': 'nizhniynovgorod',
    'ekaterimburgo': 'yekaterinburg', 'ekaterinburgo': 'yekaterinburg', 'ekaterinburg': 'yekaterinburg', 'yekaterimburgo': 'yekaterinburg',
    'vladivostok': 'vladivostok', 'jabarovsk': 'khabarovsk', 'novosibirsk': 'novosibirsk', 'omsk': 'omsk', 'krasnoyarsk': 'krasnoyarsk',
    'irkutsk': 'irkutsk', 'chita': 'chita', 'samara': 'samara', 'kazan': 'kazan', 'rostovdelDon': 'rostovnadonu', 'rostovdeldon': 'rostovnadonu',
    'rostovnadonu': 'rostovnadonu', 'rostov': 'rostovnadonu', 'nuevadelhi': 'newdelhi', 'delhi': 'delhi', 'bombay': 'mumbai', 'calcuta': 'kolkata',
    'madras': 'chennai', 'bangalore': 'bengaluru', 'sanpablo': 'saopaulo', 'saopaulo': 'saopaulo', 'riodejaneiro': 'riodejaneiro',
    'brasilia': 'brasilia', 'belem': 'belem', 'ciudaddemexico': 'mexicocity', 'cdmx': 'mexicocity', 'mexicodf': 'mexicocity',
    'elcairo': 'cairo', 'cairo': 'cairo', 'alejandria': 'alexandria', 'asuan': 'aswan', 'luxor': 'luxor', 'teheran': 'tehran',
    'riad': 'riyadh', 'riyad': 'riyadh', 'yeda': 'jeddah', 'jidda': 'jeddah', 'lameca': 'makkah', 'meca': 'makkah', 'medina': 'medina',
    'dammam': 'dammam', 'bangkok': 'bangkok', 'manila': 'manila', 'yakarta': 'jakarta', 'astana': 'astana', 'nursultan': 'astana',
    'almaty': 'almaty', 'almaata': 'almaty', 'nizhnynovgorod2': 'nizhniynovgorod', 'uralsk': 'oral', 'petropavlovsk': 'petropavl',
    'oskemen': 'ustkamenogorsk', 'mecca': 'makkah', 'medina': 'madinah', 'jazan': 'jizan', 'balkhash': 'balqash', 'solo': 'surakarta',
    'legazpi': 'legaspi', 'merak': 'cilegon', 'qassim': 'buraydah', 'aljowf': 'sakakah', 'aljouf': 'sakakah', 'mansoura': 'almansurah',
    'ayutthaya': 'phranakhonsiayutthaya', 'cebu': 'cebucity', 'tiumen': 'tyumen', 'jantimansisk': 'khantymansiysk', 'noviurengoi': 'novyyurengoy', 'salejard': 'salekhard', 'jamismushait': 'khamismushait', 'alkhobar': 'khobar', 'laredo': 'nuevolaredo', 'karaganda': 'karagandy', 'rasghareb': 'rasgharib', 'coca': 'puertofranciscodeorellana', 'leon': 'leondelosaldama', 'sanfernandodelvalledecatamarca': 'catamarca', 'santodomingo': 'santodomingodeloscolorados', 'damanhour': 'damanhur', 'bogota': 'bogota', 'lima': 'lima', 'quito': 'quito', 'guayaquil': 'guayaquil',
    'lapaz': 'lapaz', 'santacruzdelasierra': 'santacruzdelasierra', 'santacruz': 'santacruzdelasierra', 'santiago': 'santiago',
    'santiagodechile': 'santiago', 'buenosaires': 'buenosaires', 'cordoba': 'cordoba', 'tashkent': 'tashkent',
}

# Towns below GeoNames' 15 000 inhabitants (border posts, junctions) that the voices name: (country, folded name) → (lon, lat)
SITIOS = {
    ('SS', 'nimule'): (32.06, 3.60),  # 24 Oct 2026: the border town on the Juba–Uganda backbone (four voices name it; not in GeoNames cities500)
    ('EG', 'benisuef'): (31.10, 29.07), ('SA', 'hofuf'): (49.59, 25.38), ('KZ', 'dostyk'): (82.48, 45.25), ('EG', 'zafarana'): (32.65, 29.11),
    ('EG', 'marsaalam'): (34.89, 25.07), ('IR', 'bazargan'): (44.39, 39.39), ('IR', 'khosravi'): (45.46, 34.38), ('IN', 'hazira'): (72.65, 21.10),
    ('IN', 'vijaipur'): (77.17, 24.47), ('SA', 'majmaah'): (45.35, 25.90), ('BO', 'pisiga'): (-68.65, -19.25), ('BO', 'puertosuarez'): (-57.80, -18.96),
    ('BO', 'desaguadero'): (-69.04, -16.57), ('AR', 'lascuevas'): (-70.05, -32.81), ('CL', 'diegodealmagro'): (-70.05, -26.37),
    ('ID', 'labuhanmaringgai'): (105.81, -5.30), ('PH', 'daraga'): (123.69, 13.15), ('PH', 'sanmanuel'): (120.67, 16.06),
    ('PH', 'mexico'): (120.72, 15.06), ('AR', 'riogrande'): (-67.71, -53.79), ('AR', 'tolhuin'): (-67.19, -54.51), ('PE', 'lurin'): (-76.87, -12.27),
    ('PE', 'puquio'): (-74.13, -14.70), ('PE', 'huanuco'): (-76.24, -9.93), ('SA', 'haql'): (34.94, 29.29), ('BO', 'puertoquijarro'): (-57.77, -17.78),
    ('PE', 'lamerced'): (-75.33, -11.06), ('TH', 'sadao'): (100.42, 6.64), ('RU', 'kyakhta'): (106.45, 50.35),
    # 24 Oct 2026 (ronda 25, países isla): coordinates from OpenStreetMap (Nominatim), not in GeoNames cities500
    ('GW', 'ilonde'): (-15.736, 11.900), ('GW', 'bissalanca'): (-15.672, 11.899), ('GW', 'saltinho'): (-14.687, 11.618),
    ('SN', 'tanaff'): (-15.428, 12.656), ('SN', 'mpack'): (-16.236, 12.461), ('ST', 'santana'): (6.707, 0.262),
    ('KM', 'iconi'): (43.238, -11.745), ('KM', 'hahaya'): (43.271, -11.564), ('KM', 'voidjou'): (43.263, -11.650), ('KM', 'mkazi'): (43.266, -11.732),
    ('VU', 'mele'): (168.263, -17.697), ('VU', 'blacksands'): (168.297, -17.712),
    ('BS', 'crossingrocks'): (-77.197, 26.124), ('BS', 'eightmilerock'): (-78.806, 26.541),
    # round 25b (territories), from OpenStreetMap (Nominatim): villages of Guam and a quarter of Saint Croix
    ('GU', 'piti'): (144.693, 13.461), ('GU', 'asan'): (144.718, 13.469), ('VI', 'groveplace'): (-64.821, 17.726),
    # round 25c (cross confirmation of the territories), from OpenStreetMap (Nominatim and Overpass)
    ('HK', 'chaiwan'): (114.238, 22.266),
    ('SG', 'ayerrajah'): (103.759, 1.312), ('SG', 'taiseng'): (103.888, 1.344), ('SG', 'tuas'): (103.632, 1.278),
    ('SG', 'downtowncore'): (103.856, 1.287),
    ('MC', 'fontvieille'): (7.418, 43.728), ('MC', 'lacondamine'): (7.422, 43.734), ('MC', 'larvotto'): (7.434, 43.747),
    ('CW', 'bluebay'): (-68.981, 12.139), ('CW', 'bokasami'): (-68.998, 12.146), ('CW', 'nieuwpoort'): (-68.830, 12.052),
    ('AW', 'savaneta'): (-69.950, 12.453),
    ('PF', 'papenoo'): (-149.430, -17.530), ('PF', 'taravao'): (-149.314, -17.726),
    ('WS', 'fagalii'): (-171.737, -13.844), ('WS', 'faleolo'): (-172.019, -13.827), ('WS', 'aleipata'): (-171.467, -14.018),
    ('SB', 'whiteriver'): (159.922, -9.425), ('SB', 'pointcruz'): (159.958, -9.426), ('SB', 'ranadi'): (160.001, -9.428),
    ('SB', 'henderson'): (160.050, -9.429),
    ('BS', 'hawksbill'): (-78.735, 26.511),
    ('KY', 'sevenmilebeach'): (-81.381, 19.339), ('KY', 'southsound'): (-81.357, 19.271),
    # round 26 (24 Oct 2026), from OpenStreetMap (Nominatim): the three places of earlier answers still without coordinates
    ('BS', 'foxtown'): (-77.791, 26.920), ('VI', 'havensight'): (-64.922, 18.330), ('VI', 'redhook'): (-64.852, 18.326),
    # round 26: the towns of San Marino, Samoa, Tonga and Honiara that the voices name (OpenStreetMap, Nominatim)
    ('SB', 'kukum'): (159.979, -9.435),
    ('SM', 'dogana'): (12.489, 43.981), ('SM', 'serravalle'): (12.480, 43.970), ('SM', 'domagnano'): (12.469, 43.948),
    ('SM', 'borgomaggiore'): (12.447, 43.941), ('SM', 'acquaviva'): (12.419, 43.946), ('SM', 'gualdicciolo'): (12.408, 43.951),
    ('TO', 'sopu'): (-175.219, -21.127),
    ('WS', 'vaivasetai'): (-171.749, -13.846), ('WS', 'vaitele'): (-171.816, -13.826), ('WS', 'leulumoega'): (-171.961, -13.827),
    ('WS', 'satapuala'): (-171.985, -13.832), ('WS', 'tuasivi'): (-172.178, -13.669), ('WS', 'sapapalii'): (-172.199, -13.688),
    ('WS', 'salelologa'): (-172.219, -13.743), ('WS', 'faleasiu'): (-171.926, -13.811),
    ('SM', 'rovereta'): (12.512, 43.990), ('SM', 'falciano'): (12.502, 43.980), ('SB', 'lengakiki'): (159.946, -9.420),
    ('BB', 'holetown'): (-59.637, 13.186), ('BB', 'speightstown'): (-59.642, 13.250), ('BB', 'hastings'): (-59.599, 13.075),
    ('BB', 'worthing'): (-59.581, 13.071), ('BB', 'oistins'): (-59.542, 13.063), ('BB', 'warrens'): (-59.608, 13.140),
    ('BB', 'carlton'): (-59.639, 13.222), ('BB', 'sixroads'): (-59.477, 13.118),
    ('BM', 'somersetvillage'): (-64.870, 32.296), ('BM', 'flattsvillage'): (-64.739, 32.321), ('BM', 'stgeorges'): (-64.677, 32.381),
    ('FM', 'colonia'): (138.122, 9.516), ('FM', 'kolonia'): (158.209, 6.964), ('FM', 'palikir'): (158.163, 6.921),
    ('FO', 'strendur'): (-6.761, 62.109), ('FO', 'kolbeinagjogv'): (-6.786, 62.110), ('FO', 'morskranes'): (-6.838, 62.131),
    ('LI', 'balzers'): (9.506, 47.069), ('LI', 'triesen'): (9.527, 47.107), ('LI', 'schaan'): (9.510, 47.166),
    ('LI', 'nendeln'): (9.543, 47.197), ('LI', 'eschen'): (9.523, 47.213), ('LI', 'gamprin'): (9.510, 47.219),
    ('LI', 'ruggell'): (9.526, 47.240), ('LI', 'mauren'): (9.542, 47.220), ('LI', 'schaanwald'): (9.570, 47.217),
    ('LI', 'triesenberg'): (9.543, 47.119), ('LI', 'malbun'): (9.608, 47.103),
    ('MV', 'maradhoo'): (73.119, -0.668), ('MV', 'maradhoofeydhoo'): (73.126, -0.673), ('MV', 'gan'): (73.156, -0.691),
    # from Wikidata (P625), where Nominatim had no settlement: Addu's districts, two towns of Curaçao and Catalan Bay
    ('MV', 'hithadhoo'): (73.089, -0.603), ('MV', 'feydhoo'): (73.135, -0.682),
    ('CW', 'janthiel'): (-68.873, 12.079), ('CW', 'sintmichiel'): (-68.996, 12.142), ('GI', 'catalanbay'): (-5.341, 36.139),
    ('FM', 'nimar'): (138.120, 9.519),  # GeoNames «Nimaar», Weloy (Yap), from its search page
    # the villages of Streymoy and Eysturoy (Faroe Islands), from Wikidata (P625); keys as pliega() folds them (ø, ð drop out)
    ('FO', 'tjrnuvik'): (-7.147, 62.290), ('FO', 'haldarsvik'): (-7.092, 62.276), ('FO', 'langasandur'): (-7.054, 62.237),
    ('FO', 'streymnes'): (-7.031, 62.191), ('FO', 'hvalvik'): (-7.035, 62.187), ('FO', 'hosvik'): (-6.940, 62.155),
    ('FO', 'kollafjrur'): (-6.906, 62.118), ('FO', 'kaldbaksbotnur'): (-6.912, 62.066), ('FO', 'hoyvik'): (-6.759, 62.026),
    ('FO', 'leirvik'): (-6.706, 62.211), ('FO', 'norragta'): (-6.741, 62.201), ('FO', 'syrugta'): (-6.756, 62.186),
    ('FO', 'sldarfjrur'): (-6.753, 62.159), ('FO', 'glyvrar'): (-6.724, 62.131), ('FO', 'saltangara'): (-6.717, 62.117),
    ('FO', 'runavik'): (-6.719, 62.109), ('FO', 'toftir'): (-6.737, 62.093),
    # Western Sahara's towns on the N1 (Wikidata); Tah is the first town across the northern line, in Tarfaya province
    ('EH', 'daoura'): (-12.991, 27.464), ('EH', 'elargoub'): (-15.858, 23.611), ('EH', 'birgandouz'): (-16.469, 21.616),
    ('EH', 'guerguerat'): (-16.959, 21.426), ('EH', 'tah'): (-12.956, 27.672),
    # round 28a (24 Oct 2026): Caribbean villages and quarters from Nominatim (OpenStreetMap), not in GeoNames cities500
    ('BL', 'public'): (-62.851, 17.905), ('BL', 'corossol'): (-62.856, 17.909), ('BL', 'colombier'): (-62.867, 17.918),
    ('BL', 'lorient'): (-62.827, 17.906), ('BL', 'camaruche'): (-62.818, 17.908), ('BL', 'vitet'): (-62.813, 17.904),
    ('BL', 'marigot'): (-62.810, 17.909), ('BL', 'grandculdesac'): (-62.802, 17.907), ('BL', 'petitculdesac'): (-62.792, 17.906),
    ('BL', 'toiny'): (-62.797, 17.899), ('BL', 'saintjean'): (-62.837, 17.902), ('BL', 'ansedescayes'): (-62.847, 17.911),
    ('BL', 'flamands'): (-62.857, 17.919),
    ('BQ', 'hato'): (-68.292, 12.180), ('BQ', 'noordsalina'): (-68.274, 12.177), ('BQ', 'terakora'): (-68.263, 12.139),
    ('BQ', 'windwardside'): (-63.232, 17.629), ('BQ', 'zionshill'): (-63.229, 17.639),
    # 25 Oct 2026 (revisión punto por punto): Saint Johns (Saba) was placed in St. John's, Antigua, and Forest (Guernsey) in
    # Forest, Brussels, by the cross-border search; both from OpenStreetMap (Nominatim)
    ('BQ', 'stjohns'): (-63.244, 17.621), ('GG', 'forest'): (-2.593, 49.431),
    ('GD', 'grandanse'): (-61.757, 12.024),
    ('KN', 'bath'): (-62.626, 17.130), ('KN', 'frigatebay'): (-62.689, 17.279), ('KN', 'cockleshellbay'): (-62.634, 17.227),
    ('KN', 'tabernacle'): (-62.774, 17.388), ('KN', 'mannings'): (-62.548, 17.165),
    ('MF', 'baieorientale'): (-63.026, 18.088), ('MF', 'friarsbay'): (-63.076, 18.092), ('MF', 'bellevue'): (-63.087, 18.059),
    ('MS', 'littlebay'): (-62.204, 16.798), ('MS', 'woodlands'): (-62.219, 16.762), ('MS', 'davyhill'): (-62.205, 16.795),
    ('MS', 'geralds'): (-62.194, 16.795), ('MS', 'salem'): (-62.220, 16.751),
    ('SX', 'simpsonbay'): (-63.097, 18.040), ('SX', 'pointblanche'): (-63.036, 18.019), ('SX', 'mahoreef'): (-63.124, 18.047),
    ('SX', 'maho'): (-63.124, 18.047), ('SX', 'lowlands'): (-63.129, 18.050), ('SX', 'culdesac'): (-63.064, 18.033),
    ('VC', 'arnosvale'): (-61.214, 13.142), ('VC', 'owia'): (-61.144, 13.376), ('VC', 'troumaca'): (-61.257, 13.282),
    ('VC', 'mesopotamia'): (-61.167, 13.167),
    ('AG', 'fiveislandsvillage'): (-61.884, 17.118), ('DM', 'canefield'): (-61.389, 15.338), ('DM', 'coulibistrie'): (-61.451, 15.460),
    ('DM', 'loubiere'): (-61.373, 15.275), ('LC', 'choc'): (-60.978, 14.030), ('LC', 'rodneybay'): (-60.953, 14.075),
    # round 28b (24 Oct 2026): villages, parishes and quarters from Nominatim (OpenStreetMap); a parish without a village of
    # its name sits at the parish's centre
    ('TC', 'grancebay'): (-72.179, 21.795), ('TC', 'gracebay'): (-72.179, 21.795), ('TC', 'leewardpalms'): (-72.155, 21.810),
    ('TC', 'leeward'): (-72.155, 21.810), ('TC', 'thompsoncove'): (-72.250, 21.787), ('TC', 'longbay'): (-72.161, 21.779),
    ('TC', 'backsalina'): (-71.141, 21.458),
    ('VG', 'seacowsbay'): (-64.633, 18.408), ('VG', 'westend'): (-64.703, 18.388), ('VG', 'eastend'): (-64.557, 18.441),
    ('VG', 'parhamtown'): (-64.571, 18.439), ('VG', 'carrotbay'): (-64.672, 18.410), ('VG', 'savannahbay'): (-64.420, 18.463),
    ('VG', 'southsound'): (-64.390, 18.483),
    ('AS', 'laulii'): (-170.654, -14.286), ('AS', 'poloa'): (-170.832, -14.319), ('AS', 'tula'): (-170.566, -14.253),
    ('MP', 'susupe'): (145.710, 15.158), ('MP', 'chalankanoa'): (145.717, 15.138), ('MP', 'sanantonio'): (145.695, 15.128),
    ('MP', 'puertorico'): (145.735, 15.225), ('MP', 'tanapag'): (145.757, 15.242), ('MP', 'sinapalo'): (145.231, 14.167),
    ('MP', 'oleai'): (145.714, 15.174), ('MP', 'sanroque'): (145.773, 15.248), ('MP', 'capitolhill'): (145.752, 15.211),
    ('MP', 'kagman'): (145.775, 15.172), ('MP', 'marpoheights'): (145.638, 14.980),
    ('CK', 'aroa'): (-159.816, -21.254), ('CK', 'rutaki'): (-159.811, -21.255), ('CK', 'arorangi'): (-159.826, -21.228),
    ('CK', 'nikao'): (-159.812, -21.208), ('CK', 'ngatangiia'): (-159.730, -21.243), ('CK', 'muri'): (-159.733, -21.255),
    ('CK', 'titikaveka'): (-159.754, -21.271),
    ('WF', 'vele'): (-178.077, -14.312), ('WF', 'kolia'): (-178.097, -14.308), ('WF', 'vailala'): (-176.202, -13.222),
    ('WF', 'akaaka'): (-176.171, -13.275), ('WF', 'nuku'): (-178.163, -14.291), ('WF', 'vaisei'): (-178.170, -14.276),
    ('GG', 'vale'): (-2.523, 49.496), ('GG', 'cobo'): (-2.589, 49.478), ('GG', 'vazon'): (-2.609, 49.468),
    ('GG', 'stmartin'): (-2.556, 49.437), ('GG', 'stpierreduboi'): (-2.641, 49.440), ('GG', 'stpierredubois'): (-2.641, 49.440),
    ('JE', 'stlawrence'): (-2.142, 49.215), ('JE', 'stpeter'): (-2.184, 49.213), ('JE', 'staubin'): (-2.171, 49.187),
    ('JE', 'stbrelade'): (-2.200, 49.193), ('JE', 'stclement'): (-2.056, 49.174), ('JE', 'grouville'): (-2.052, 49.184),
    ('JE', 'stmartin'): (-2.052, 49.218), ('JE', 'gorey'): (-2.032, 49.199),
    ('IM', 'unionmills'): (-4.523, 54.170), ('IM', 'glenvine'): (-4.553, 54.177), ('IM', 'stjohns'): (-4.637, 54.199),
    ('IM', 'portstmary'): (-4.739, 54.077),
    ('SJ', 'nybyen'): (15.588, 78.201), ('SJ', 'hotellneset'): (15.488, 78.249), ('SJ', 'adventdalen'): (15.895, 78.197),
    ('PM', 'savoyard'): (-56.240, 46.764), ('PM', 'langlade'): (-56.318, 46.848),
    ('WF', 'hihifo'): (-176.199, -13.240),  # Nominatim gives Hihifo's airfield, in the district's centre
    # round 27 (25 Oct 2026): the towns of the radio chains (radio_agencia.py), from Nominatim (OpenStreetMap)
    ('GL', 'kulusuk'): (-37.187, 65.576), ('GL', 'siorapaluk'): (-70.633, 77.785), ('GL', 'saqqaq'): (-51.943, 70.011),
    ('GL', 'kullorsuaq'): (-57.220, 74.579), ('GL', 'qassiarsuk'): (-45.517, 61.155), ('GL', 'narsarsuaq'): (-45.424, 61.156),
    ('GL', 'alluitsuppaa'): (-45.569, 60.463), ('GL', 'aappilattoq'): (-44.285, 60.151),
    ('ER', 'nefasit'): (39.064, 15.334), ('ER', 'ghinda'): (39.091, 15.445), ('ER', 'elabered'): (38.628, 15.709),
    ('ER', 'hagaz'): (38.271, 15.703), ('ER', 'haykota'): (37.081, 15.184), ('ER', 'haikota'): (37.081, 15.184),
    ('ER', 'tessenei'): (36.660, 15.109), ('ER', 'teseney'): (36.660, 15.109), ('ER', 'adiquala'): (38.834, 14.634),
    ('ER', 'tio'): (40.959, 14.690), ('ER', 'nakfa'): (38.477, 16.666), ('ER', 'aditekelezan'): (38.778, 15.565),
    ('ER', 'segheneyti'): (39.189, 15.053), ('ER', 'senafe'): (39.424, 14.702), ('ER', 'himberti'): (38.736, 15.255),
    ('ER', 'himbirti'): (38.736, 15.255), ('ER', 'foro'): (39.622, 15.263),
    ('FK', 'mountpleasant'): (-58.450, -51.820), ('FK', 'goosegreen'): (-58.973, -51.828), ('FK', 'porthoward'): (-59.521, -51.611),
    ('FK', 'foxbay'): (-60.071, -51.956),
    ('TO', 'angaha'): (-174.957, -21.363), ('TO', 'ohonua'): (-174.956, -21.341),
    ('KI', 'buariki'): (172.955, 1.609), ('KI', 'rawannawi'): (173.263, 2.052), ('KI', 'rawanawi'): (173.263, 2.052),
    ('KI', 'tebwangetua'): (173.040, 0.938),
    ('PW', 'ollei'): (134.614, 7.719), ('PW', 'orukei'): (134.718, 8.083), ('PW', 'ngeremasch'): (134.132, 6.903),
    ('PW', 'kayangel'): (134.719, 8.082),
    ('MH', 'ine'): (171.698, 6.985), ('MH', 'kwajalein'): (167.735, 8.720), ('MH', 'ebeye'): (167.737, 8.784),
    # round 34 (25 Oct 2026): the villages of Fongafale (Tuvalu), Nauru's districts and Majuro's islets, from Nominatim
    # (OpenStreetMap); Djarrit is also called Rita, Te Kavatoetoe also Kavatoetoe; Teone is placed at its church
    ('TV', 'vaiaku'): (179.195, -8.525), ('TV', 'alapi'): (179.195, -8.523), ('TV', 'senala'): (179.198, -8.517),
    ('TV', 'fakaifou'): (179.201, -8.517), ('TV', 'teone'): (179.197, -8.506), ('TV', 'tekavatoetoe'): (179.188, -8.533),
    ('TV', 'kavatoetoe'): (179.188, -8.533),
    ('NR', 'boe'): (166.916, -0.542), ('NR', 'aiwo'): (166.913, -0.533), ('NR', 'denigomodu'): (166.917, -0.524),
    ('NR', 'nibok'): (166.921, -0.517), ('NR', 'uaboe'): (166.925, -0.513), ('NR', 'baiti'): (166.933, -0.515),
    ('NR', 'buada'): (166.926, -0.534), ('NR', 'meneng'): (166.940, -0.545), ('NR', 'anibare'): (166.951, -0.531),
    ('NR', 'ijuw'): (166.952, -0.519), ('NR', 'anabar'): (166.951, -0.514), ('NR', 'anetan'): (166.944, -0.511),
    ('NR', 'ewa'): (166.938, -0.512),
    ('MH', 'djarrit'): (171.363, 7.123), ('MH', 'rita'): (171.363, 7.123), ('MH', 'uliga'): (171.376, 7.105),
    ('MH', 'delap'): (171.383, 7.091), ('MH', 'rairok'): (171.322, 7.076), ('MH', 'ajeltake'): (171.171, 7.075),
    ('MH', 'woja'): (171.099, 7.101),
}

POR_TIERRA = True  # radio_agencia.py turns it off: a microwave hop does cross the sea
PARECIDO = 1.35  # the other voice's path between two cities may be this much longer than the straight line (+ 60 km)


def pliega(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', s)


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(min(1, math.sqrt(h)))


def ciudades():
    """(country, folded name) → (lon, lat); the file is sorted by population, so the first match is the big city."""
    idx, idx_div = {}, {}
    for linea in open(os.path.join(RAIZ, 'orbita', 'static', 'tierra', 'ciudades.tsv'), encoding='utf-8'):
        if linea.startswith('#'): continue
        p = linea.rstrip('\n').split('\t')
        if len(p) < 5: continue
        try: lon, lat = float(p[4]), float(p[3])
        except ValueError: continue
        idx.setdefault((p[1], pliega(p[0])), (lon, lat))
        idx_div.setdefault((p[1], pliega(p[2])), (lon, lat))
    # 24 Oct 2026: the smaller towns the routes pass through, and the English names the voices use, from GeoNames
    # cities500 (pueblos_fibra.py, run by the workflow); the big cities above keep their place
    ruta = os.path.join(AQUI, 'fuentes', 'pueblos-fibra.tsv')
    if os.path.exists(ruta):
        for linea in open(ruta, encoding='utf-8'):
            if linea.startswith('#'): continue
            p = linea.rstrip('\n').split('\t')
            if len(p) < 4: continue
            try: idx.setdefault((p[1], p[0]), (float(p[3]), float(p[2])))
            except ValueError: continue
    return idx, idx_div


# islands with no land border: a town of theirs that is not found is never looked for in another country
ISLAS = {'GG', 'JE', 'IM', 'BQ', 'AW', 'CW', 'KY', 'VG', 'VI', 'AI', 'MS', 'KN', 'AG', 'DM', 'LC', 'VC', 'GD', 'BB', 'TT', 'BM',
         'TC', 'BS', 'FO', 'MT', 'MV', 'MU', 'SC', 'KM', 'CV', 'ST', 'PM', 'FK', 'SH', 'AX', 'YT', 'RE', 'GP', 'MQ', 'IS', 'JM',
         'CK', 'NU', 'TO', 'WS', 'AS', 'FJ', 'PF', 'NC', 'WF', 'TV', 'KI', 'NR', 'MH', 'FM', 'PW', 'GU', 'MP'}  # not Bahrain or Singapore: bridges to Saudi Arabia and Malaysia carry fibre


def fuera(nombre, previo, idx, cc=''):
    """A town across the border (routes that reach the first city on the other side: Minsk–Warsaw, Hanoi–Vientiane):
    the same name in another country, only when it is less than 800 km from the route's previous town, and never for
    an island with no land border (Forest, Guernsey, is not Forest, Brussels)."""
    if not previo or cc in ISLAS: return None
    mejor, dm = None, 800.0
    for k in {pliega(nombre), pliega(re.split(r'[(/,]', nombre)[0])}:
        k = ALIAS.get(k, k)
        for (c, n), q in idx.items():
            if n != k: continue
            d = km(previo, q)
            if d < dm: mejor, dm = q, d
    return mejor


# the countries where no open source has land fibre: approximate stretches that two voices agree on are allowed there
APROX = {'BH', 'BN', 'BZ', 'CU', 'DO', 'HT', 'JM', 'KP', 'KW', 'LB', 'LS', 'NP', 'PS', 'QA', 'RW', 'SY', 'TL', 'XK', 'YE',
         'SR', 'TT', 'PR', 'GW', 'SZ', 'ER', 'CV', 'MU', 'MT', 'BS', 'GT', 'PA', 'SS'}


def situa(nombre, cc, idx, idx_div):
    base = re.split(r'[(/,]', nombre)[0]
    # «Saint George's» and «St. George's» are the same town (round 28, 24 Oct 2026): the short form is tried first
    claves = []
    for k in (pliega(nombre), pliega(base)):
        for v in (re.sub(r'^saint', 'st', k), k):
            if v not in claves: claves.append(v)
    for k in claves:
        k = ALIAS.get(k, k)
        if (cc, k) in SITIOS: return SITIOS[(cc, k)]
        for t in (idx, idx_div):
            if (cc, k) in t: return t[(cc, k)]
    # «Angeles» = «Angeles City», «Tuxtla Gutierrez» = «Tuxtla»: the most populous city whose name starts the same way
    k = pliega(base)
    if len(k) >= 5:
        for (c, n), p in idx.items():
            if c == cc and len(n) >= 5 and (n.startswith(k) or k.startswith(n)): return p
    return None


def mismo_operador(a, b):
    fa, fb = pliega(a), pliega(b)
    if not fa or not fb: return False
    if fa in fb or fb in fa: return True
    # «PJSC Rostelecom» vs «Atlas / Rostelecom»; «National Informatics Centre / NKN» vs «… (NIC)»: share a word of 5+ letters
    # that is not a generic one
    gen = {'national', 'nacional', 'telecom', 'telecomunicaciones', 'telecommunication', 'telecommunications', 'company', 'corporation',
           'corporacion', 'network', 'networks', 'limited', 'comunicaciones', 'group', 'grupo', 'gobierno', 'fibra', 'fiber', 'fibre',
           'optica', 'optical', 'backbone', 'troncal', 'rede', 'bolivia', 'colombia', 'chile', 'india', 'peru', 'egypt', 'saudi', 'arabia',
           'iran', 'brasil', 'brazil', 'argentina', 'mexico', 'indonesia', 'thailand', 'philippines', 'ecuador', 'russia', 'kazakhstan'}
    pal = lambda x: {pliega(w) for w in re.split(r'[^\w]+', unicodedata.normalize('NFKD', x or '')) if len(pliega(w)) >= 4} - gen
    return bool(pal(a) & pal(b))


class Tierra:
    """25 Oct 2026 (revisión punto por punto: Chennai–Visakhapatnam, Aktau–Atyrau or Cebu–Cagayan drawn straight across
    the sea): a stretch between two towns that crosses more than 25 km of open sea follows the land instead, on the
    Natural Earth 10m land mask (herramientas/fuentes/tierra-ne10m.png, 0.025° a pixel), when a way over land exists that
    is at most 1.8 times the straight line. The trace stays approximate (the exact route is not public), but it no
    longer runs over water. A stretch with no way over land (between islands) keeps its straight line."""
    PASO = 0.025

    def __init__(self):
        from PIL import Image
        Image.MAX_IMAGE_PIXELS = None
        im = Image.open(os.path.join(AQUI, 'fuentes', 'tierra-ne10m.png')).convert('1')
        self.W, self.H = im.size; self.px = im.load(); self.hechos = 0

    def es(self, x, y): return self.px[x % self.W, min(self.H - 1, max(0, y))] > 0
    def pix(self, p): return int((p[0] + 180) / self.PASO), int((90 - p[1]) / self.PASO)
    def geo(self, x, y): return (round(-180 + (x + 0.5) * self.PASO, 3), round(90 - (y + 0.5) * self.PASO, 3))

    def mar(self, A, B):
        """the longest run of open sea (km) on the straight line A–B"""
        d = km(A, B); n = max(2, int(d / 1.5)); run = peor = 0.0
        for i in range(n):
            f = (i + 0.5) / n; x, y = self.pix((A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f))
            if self.es(x, y): run = 0.0
            else: run += d / n; peor = max(peor, run)
        return peor

    def ruta(self, A, B):
        import heapq
        (ax, ay), (bx, by) = self.pix(A), self.pix(B)
        m = 40 + int(max(abs(ax - bx), abs(ay - by)) * 0.3)
        x0, x1, y0, y1 = min(ax, bx) - m, max(ax, bx) + m, min(ay, by) - m, max(ay, by) + m
        recta = math.hypot(ax - bx, ay - by); tope = recta * 1.8 + 8
        dist, de, h = {(ax, ay): 0.0}, {}, [(recta, 0.0, (ax, ay))]
        while h:
            _, g, (x, y) = heapq.heappop(h)
            if (x, y) == (bx, by): break
            if g > dist.get((x, y), 1e18) or g > tope: continue
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if not dx and not dy: continue
                    nx, ny = x + dx, y + dy
                    if not (x0 <= nx <= x1 and y0 <= ny <= y1): continue
                    if (nx, ny) != (bx, by) and not self.es(nx, ny): continue
                    ng = g + (1.4142 if dx and dy else 1.0)
                    if ng < dist.get((nx, ny), 1e18):
                        dist[(nx, ny)] = ng; de[(nx, ny)] = (x, y); heapq.heappush(h, (ng + math.hypot(nx - bx, ny - by), ng, (nx, ny)))
        if (bx, by) not in de: return None
        cam, q = [], (bx, by)
        while q != (ax, ay): cam.append(q); q = de[q]
        cam = [self.geo(*q) for q in reversed(cam[1:])]
        return simplifica([A] + cam + [B], 0.04)

    def corrige(self, l):
        out = [l[0]]
        for A, B in zip(l, l[1:]):
            r = self.ruta(A, B) if self.mar(A, B) > 25 else None
            if r: out.extend(r[1:]); self.hechos += 1
            else: out.append(B)
        return out


def simplifica(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; n = math.hypot(dx, dy)
    dmax, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        q = pts[i]
        d = abs(dx * (a[1] - q[1]) - (a[0] - q[0]) * dy) / n if n else math.hypot(q[0] - a[0], q[1] - a[1])
        if d > dmax: dmax, idx = d, i
    if dmax > tol: return simplifica(pts[:idx + 1], tol)[:-1] + simplifica(pts[idx:], tol)
    return [a, b]


def camino(pts, i, j):
    if i > j: i, j = j, i
    return sum(km(pts[k], pts[k + 1]) for k in range(i, j))


def main():
    idx, idx_div = ciudades()
    voces = {}
    for f in sorted(glob.glob(os.path.join(CARPETA, '*.json'))):
        voz = os.path.basename(f).split('-')[0].lower()
        for r in json.load(open(f, encoding='utf-8')):
            cc = (r.get('pais') or '').upper()[:2]
            # «en servicio parcial» or «en servicio; expansión en desarrollo» still is fibre in service (owner, 24 Oct 2026, 09:00:
            # «lo más aproximado posible»); «no verificado» or planned is not
            est = (r.get('estado') or 'en servicio').lower().strip()
            if not est.startswith(('en servicio', 'operativo', 'in service')) or 'no verificad' in est: continue
            nombres = r.get('ciudades') or []
            res = [situa(c, cc, idx, idx_div) for c in nombres]
            # a town across the border is looked for near the previous placed town, or near the next one when it opens
            # the route (Somalia's «Djibouti–Hargeisa–Berbera»)
            for i, c in enumerate(nombres):
                if res[i] is not None: continue
                ref = next((res[j] for j in range(i - 1, -1, -1) if res[j] is not None), None)
                if ref is None: ref = next((res[j] for j in range(i + 1, len(res)) if res[j] is not None), None)
                res[i] = fuera(c, ref, idx, cc)
            pts, nom, sin = [], [], []
            for c, p in zip(nombres, res):
                if p is None: sin.append(c); continue
                if pts and p == pts[-1]: continue
                pts.append(p); nom.append(c)
            if sin: print('  sin situar (%s, %s, %s): %s' % (voz, cc, r.get('nombre'), ', '.join(sin)))
            voces.setdefault(voz, []).append({'n': r.get('nombre') or '', 'o': r.get('operador') or '', 'cc': cc, 'pts': pts, 'nom': nom})
    if len(voces) < 2:
        print('hacen falta dos voces; hay', list(voces)); return

    candidatos = []
    for voz, rutas in voces.items():
        otras = [r for v, rs in voces.items() if v != voz for r in rs]
        for r in rutas:
            ok, ok2, ok3 = [], [], []  # per stretch: None, or the points to draw from A to B (ok: same operator; ok2: another one; ok3: approximate)
            for a in range(len(r['pts']) - 1):
                A, B = r['pts'][a], r['pts'][a + 1]
                recta = km(A, B)
                bien = bien2 = bien3 = None
                for o in otras:
                    if o['cc'] != r['cc']: continue
                    if A in o['pts'] and B in o['pts']:
                        i, j = o['pts'].index(A), o['pts'].index(B)
                        # 24 Oct 2026 (owner, 07:43: «en esos países intenta ponerlos en el mapa según los datos aproximados»): in
                        # the countries with no other source, two voices that both put A and B on the national backbone confirm an
                        # approximate A–B stretch even when their paths between them differ more (up to 2.5 × the straight line)
                        if r['cc'] in APROX and bien3 is None and camino(o['pts'], i, j) <= recta * 2.5 + 150: bien3 = [A, B]
                        if camino(o['pts'], i, j) <= recta * PARECIDO + 60:
                            # both voices put fibre between A and B; the more detailed voice draws it
                            sub = o['pts'][i:j + 1] if i < j else o['pts'][j:i + 1][::-1]
                            sub = sub if len(sub) > 2 else [A, B]
                            if mismo_operador(o['o'], r['o']): bien = sub; break
                            if bien2 is None: bien2 = sub
                ok.append(bien); ok2.append(None if bien else bien2); ok3.append(None if (bien or bien2) else bien3)
            # contiguous confirmed stretches become polylines. 24 Oct 2026 (round 17): two voices that both put long-
            # distance fibre between the same two cities confirm the stretch even when they name different operators
            # («Government of Rwanda» and «RDB»); such a stretch is drawn without a name or an operator, since those
            # are what the voices do not agree on.
            for lista, neutra in ((ok, False), (ok2, True), (ok3, True)):
                tramo = []
                for a, b in enumerate(lista):
                    if b:
                        if not tramo: tramo = [r['pts'][a]]
                        tramo.extend(b[1:])
                    else:
                        if len(tramo) >= 2: candidatos.append(dict(r, l=tramo, n='' if neutra else r['n'], o='' if neutra else r['o'], neutra=neutra))
                        tramo = []
                if len(tramo) >= 2: candidatos.append(dict(r, l=tramo, n='' if neutra else r['n'], o='' if neutra else r['o'], neutra=neutra))

    # both voices confirm the same stretch: keep it once, the finer drawing first
    candidatos.sort(key=lambda c: (c.get('neutra', False), -len(c['l'])))  # the ones with an agreed operator first
    hechos, lineas, usados = [], [], set()
    for c in candidatos:
        nuevo, tramo = [], [c['l'][0]]
        for A, B in zip(c['l'], c['l'][1:]):
            par = frozenset((A, B))
            ya = par in usados  # a route that doubles back over a stretch it already drew
            usados.add(par)
            for h in ([] if ya else hechos):
                if h['cc'] == c['cc'] and A in h['l'] and B in h['l'] and camino(h['l'], h['l'].index(A), h['l'].index(B)) <= km(A, B) * PARECIDO + 60:
                    ya = True; break
            if ya:
                if len(tramo) >= 2: nuevo.append(tramo)
                tramo = [B]
            else:
                tramo.append(B)
        if len(tramo) >= 2: nuevo.append(tramo)
        for t in nuevo:
            x = {'n': c['n'], 'o': c['o'], 'cc': c['cc'], 'l': [[round(p[0], 3), round(p[1], 3)] for p in t]}
            hechos.append({'cc': c['cc'], 'l': t}); lineas.append(x)

    try:
        if not POR_TIERRA: raise ImportError('radioenlaces: el aire cruza el mar')
        tierra = Tierra()
        for x in lineas: x['l'] = [[round(p[0], 3), round(p[1], 3)] for p in tierra.corrige([tuple(p) for p in x['l']])]
        print('tramos llevados por tierra en vez de cruzar el mar:', tierra.hechos)
    except (ImportError, OSError) as e:
        print('sin máscara de tierra, los tramos quedan en línea recta:', e)
    tot = sum(sum(km(p, q) for p, q in zip(x['l'], x['l'][1:])) for x in lineas)
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump({'fuente': {'n': 'Agencia GUARDIANA (dos voces)', 'lic': 'GUARDIANA', 'url': '', 'fecha': '2026-10-23',
                              'nota': 'Troncales que dos voces de la agencia confirman por separado, entre ciudades, en línea recta: la ruta exacta no es pública.'},
                   'lineas': lineas}, f, ensure_ascii=False, indent=0)
    por = {}
    for x in lineas: por[x['cc']] = por.get(x['cc'], 0) + 1
    print('fibra de la agencia:', len(lineas), 'tramos ·', round(tot), 'km ·', dict(sorted(por.items())))


if __name__ == '__main__':
    main()
