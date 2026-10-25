#!/usr/bin/env python3
"""Fichas de empresas, revisión 1 (24 Oct 2026): las decisiones de notas-revision.md, en datos.

Escribe revision-1.json a partir de estas decisiones, de las candidatas (orbita/datos/empresas-candidatas.json) y de
las coordenadas de coordenadas.json (Nominatim/OSM/SIRENE). Uso: python3 decisiones.py
"""
import json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.join(AQUI, '..', '..', '..')

CPPA = 'https://cppa.ca.gov/data_broker_registry/'
def gleif(lei): return 'https://search.gleif.org/#/record/' + lei

# nombre → (dirección, voces, oficial, fuente o None para la de la voz oficial de las candidatas, buscar en Nominatim)
DIR = {
    '33Across': ('228 Park Avenue South PMB 74008, New York, NY 10003, EE. UU.', ['cppa'], True, CPPA, '228 Park Avenue South, New York, NY 10003'),
    'Adobe': ('345 Park Avenue, San José, CA 95110, EE. UU.', ['sec', 'wikidata', 'osm'], True, None, None),
    'Amazon': ('410 Terry Avenue North, Seattle, WA 98109, EE. UU.', ['sec', 'wikidata'], True, None, '410 Terry Avenue North, Seattle'),
    'Amplitude': ('201 Third Street, Suite 200, San Francisco, CA 94103, EE. UU.', ['gleif'], True, gleif('984500EZ87C703978858'), '201 3rd Street, San Francisco'),
    'Automattic': ('60 29th Street #343, San Francisco, CA 94110, EE. UU.', ['gleif'], True, gleif('254900SC9UVUIZP1CH08'), '60 29th Street, San Francisco'),
    'Brightcove': ('281 Summer Street, Boston, MA 02210, EE. UU.', ['sec'], True, None, '281 Summer Street, Boston'),
    'Chartbeat': ('826 Broadway, 6th Floor, New York, NY 10003, EE. UU.', ['sec'], True, None, '826 Broadway, New York'),
    'Cloudflare': ('101 Townsend Street, San Francisco, CA 94107, EE. UU.', ['sec', 'osm'], True, None, None),
    'Comscore': ('11950 Democracy Drive, Suite 600, Reston, VA 20190, EE. UU.', ['sec', 'cppa'], True, None, '11950 Democracy Drive, Reston'),
    'Contentsquare': ('7 rue de Madrid, 75008 París, Francia', ['sirene'], True, None, None),
    'Criteo': ('32 rue Blanche, 75009 París, Francia', ['sirene', 'wikidata', 'osm'], True, None, None),
    'Equativ': ('44-48 rue de Châteaudun, 75009 París, Francia', ['sirene'], True, None, None),
    'Fox Corporation': ('1211 Avenue of the Americas, New York, NY 10036, EE. UU.', ['gleif', 'wikidata'], True, gleif('549300DDU6FDRBIELS05'), '1211 Avenue of the Americas, New York'),
    'Google': ('1600 Amphitheatre Parkway, Mountain View, CA 94043, EE. UU.', ['sec', 'wikidata'], True, None, '1600 Amphitheatre Parkway, Mountain View'),
    'HubSpot': ('2 Canal Park, Cambridge, MA 02141, EE. UU.', ['sec', 'osm'], True, None, None),
    'Ipsos': ('35 rue du Val de Marne, 75013 París, Francia', ['sirene', 'wikidata'], True, None, '35 Rue du Val de Marne, Paris'),
    'LiveRamp': ('225 Bush Street, 17th Floor, San Francisco, CA 94104, EE. UU.', ['cppa'], True, CPPA, '225 Bush Street, San Francisco'),
    'Magnite': ('1250 Broadway, 9th Floor, New York, NY, EE. UU.', ['sec'], True, None, '1250 Broadway, New York'),
    'Media.net': ('2701 Aurora Towers, Dubai Internet City, Dubái, Emiratos Árabes Unidos', ['cppa'], True, CPPA, 'Aurora Tower, Dubai Internet City'),
    'Meta': ('1 Meta Way, Menlo Park, CA 94025, EE. UU.', ['sec'], True, None, '1 Hacker Way, Menlo Park'),
    'Microsoft': ('One Microsoft Way, Redmond, WA 98052, EE. UU.', ['sec', 'wikidata'], True, None, None),
    'Nielsen': ('675 Avenue of the Americas, New York, NY 10010, EE. UU.', ['sec', 'cppa'], True, None, '675 Avenue of the Americas, New York'),
    'OpenX': ('35 N. Lake Avenue, Suite 240, Pasadena, CA 91101, EE. UU.', ['cppa'], True, CPPA, '35 North Lake Avenue, Pasadena'),
    'Oracle': ('2300 Oracle Way, Austin, TX 78741, EE. UU.', ['sec'], True, None, '2300 Oracle Way, Austin'),
    'Outbrain': ('111 West 19th Street, New York, NY 10011, EE. UU.', ['sec', 'cppa'], True, None, '111 West 19th Street, New York'),
    'PRISA': ('Gran Vía 32, 28013 Madrid, España (domicilio social)', ['gleif', 'wikidata'], True, gleif('959800U3NGPXSCQHQW54'), 'Gran Vía 32, Madrid'),
    'Prensa Ibérica': ("Av. de la Gran Via de l'Hospitalet 163-167, 08908 L'Hospitalet de Llobregat, España", ['gleif'], True, gleif('959800LZ8UVL4ZQMG292'), "Avinguda de la Gran Via 163, L'Hospitalet de Llobregat"),
    'Qualtrics': ('333 West River Park Drive, Provo, UT 84604, EE. UU.', ['sec', 'osm'], True, None, None),
    'Quantcast': ('201 Third Street, Second Floor, San Francisco, CA 94103, EE. UU.', ['sec'], True, None, '201 3rd Street, San Francisco'),
    'RTB House': ('ul. Złota 61/101, 00-819 Varsovia, Polonia', ['gleif', 'wikidata'], True, gleif('984500F644Z2FD680C94'), 'Złota 61, Warszawa'),
    'Salesforce': ('Salesforce Tower, 415 Mission Street, 3rd Floor, San Francisco, CA 94105, EE. UU.', ['sec', 'wikidata'], True, None, '415 Mission Street, San Francisco'),
    'Seedtag': ('Calle del Marqués de Valdeiglesias 6, 28004 Madrid, España', ['gleif'], True, gleif('959800WQLK1D7CYTM157'), 'Calle del Marqués de Valdeiglesias 6, Madrid'),
    'Seznam.cz': ('Radlická 3294/10, 150 00 Praga 5, Chequia', ['gleif'], True, gleif('3157008DY7NRFD22D743'), 'Radlická 3294/10, Praha'),
    'Shopify': ("151 O'Connor Street, Ground Floor, Ottawa, ON K2P 2L8, Canadá", ['sec'], True, None, "151 O'Connor Street, Ottawa"),
    'Sky': ('Grant Way, Isleworth, Middlesex TW7 5QD, Reino Unido', ['companies_house', 'wikidata'], True, 'https://find-and-update.company-information.service.gov.uk/company/02906991', 'Grant Way, Isleworth'),
    'Snap': ('3000 31st Street, Santa Monica, CA 90405, EE. UU.', ['sec'], True, None, '3000 31st Street, Santa Monica'),
    'Sovrn': ('1600 Pearl Street, Suite 200, Boulder, CO 80302, EE. UU.', ['cppa'], True, CPPA, '1600 Pearl Street, Boulder'),
    'Taboola': ('16 Madison Square West, 7th Floor, New York, NY 10010, EE. UU.', ['sec', 'cppa'], True, None, '16 Madison Square West, New York'),
    'Teads': ('111 West 19th Street, New York, NY 10011, EE. UU.', ['cppa'], True, CPPA, '111 West 19th Street, New York'),
    'Tealium': ('9605 Scranton Road, San Diego, CA 92121, EE. UU.', ['gleif'], True, gleif('25490022SLQK4828KO50'), '9605 Scranton Road, San Diego'),
    'The Trade Desk': ('42 N. Chestnut Street, Ventura, CA 93001, EE. UU.', ['sec'], True, None, '42 North Chestnut Street, Ventura'),
    'The Walt Disney Company': ('500 South Buena Vista Street, Burbank, CA 91521, EE. UU.', ['sec', 'wikidata'], True, None, '500 South Buena Vista Street, Burbank'),
    'TripleLift': ('53 West 23rd Street, 12th Floor, New York, NY, EE. UU.', ['wikidata', 'cppa'], True, CPPA, '53 West 23rd Street, New York'),
    'Unidad Editorial': ('Avenida de San Luis 25, 28033 Madrid, España', ['gleif'], True, gleif('959800PSK3FFF8EYX760'), 'Avenida de San Luis 25, Madrid'),
    'Zeta Global': ('3 Park Avenue, 33rd Floor, New York, NY 10016, EE. UU.', ['sec', 'cppa'], True, None, '3 Park Avenue, New York'),
}
# Paramount: la candidata (Q159846) es Paramount Pictures, no la matriz; queda fuera hasta corregir el emparejamiento.

# coordenadas tomadas de la voz OSM/SIRENE de la candidata cuando su dirección es la decidida
DE_VOZ = {'Adobe': ('osm', '345 Park'), 'Cloudflare': ('osm', '101 Townsend'), 'Contentsquare': ('sirene', '7 RUE DE MADRID'),
          'Criteo': ('osm', '32 Rue Blanche'), 'Equativ': ('sirene', '44-48'), 'HubSpot': ('osm', '2 Canal Park'),
          'Qualtrics': ('osm', '333 West River'), 'Microsoft': ('osm', 'One Microsoft Way')}

# sede corregida (Wikidata está desfasado)
SEDE = {'33Across': {'sede': 'Nueva York', 'sede_pais': 'US'}, 'Magnite': {'sede': 'Nueva York', 'sede_pais': 'US'},
        'Media.net': {'sede': 'Dubái', 'sede_pais': 'AE', 'cc': 'AE'}, 'Oracle': {'sede': 'Austin', 'sede_pais': 'US'}}

FOTO = {  # archivo exacto de Commons → qué se ve
    'Adobe': ('Adobe HQ.JPG', 'Sede de Adobe en San José (California)'),
    'Fox Corporation': ('1211 Avenue of the Americas.jpg', 'Sede de Fox Corporation, 1211 Avenue of the Americas (Nueva York)'),
    'Meta': ('Facebook Offices Menlo Park California (34183281176).jpg', 'Campus de la sede de Meta en Menlo Park (California)'),
    'Microsoft': ('Aerial Microsoft West Campus August 2009.jpg', 'Campus de la sede de Microsoft en Redmond (Washington)'),
    'PRISA': ('Edificio en Gran Vía 32 Madrid.png', 'Gran Vía 32 (Madrid), domicilio social de PRISA'),
    'Qualtrics': ('Qualtrics headquarters (29230813277).jpg', 'Sede de Qualtrics en Provo (Utah)'),
    'Salesforce': ('Salesforce Tower 2020.jpg', 'Salesforce Tower, sede de Salesforce en San Francisco'),
    'Sky': ('Aerial view of Sky campus in 2011.jpg', 'Campus de Sky en Isleworth (Londres)'),
}


def main():
    cand = json.load(open(os.path.join(RAIZ, 'orbita', 'datos', 'empresas-candidatas.json'), encoding='utf-8'))['empresas']
    coords = json.load(open(os.path.join(AQUI, 'coordenadas.json'), encoding='utf-8')) if os.path.exists(os.path.join(AQUI, 'coordenadas.json')) else {}
    out = {}
    for n in sorted(set(DIR) | set(FOTO)):
        c = cand.get(n)
        if not c:
            print('sin candidata:', n); continue
        r = {}
        if n in FOTO:
            r['foto'], r['que_foto'] = FOTO[n]
        if n in DIR:
            texto, voces, oficial, fuente, _ = DIR[n]
            if not fuente:
                of = [d for d in c.get('direcciones') or [] if d['voz'] in voces and d.get('oficial') and d.get('fuente')]
                fuente = of[0]['fuente'] if of else None
            r['direccion'] = {'texto': texto, 'voces': voces, 'fuente': fuente, 'oficial': oficial}
            ll = None
            if n in DE_VOZ:
                voz, trozo = DE_VOZ[n]
                ll = next((d['lonlat'] for d in c.get('direcciones') or [] if d['voz'] == voz and trozo.lower() in d.get('texto', '').lower() and d.get('lonlat')), None)
            ll = ll or coords.get(n)
            if ll: r['lonlat'] = [round(ll[0], 5), round(ll[1], 5)]
            else: print('sin coordenadas:', n)
        r.update(SEDE.get(n, {}))
        out[n] = r
    json.dump({'nota': 'Revisión 1 de las fichas de empresas (24 Oct 2026). Fotos: solo el edificio real de la sede, sin personas ni '
                       'logotipos. Dirección: registro oficial (SEC, SIRENE, GLEIF, CPPA, Companies House) o dos voces.',
               'empresas': out}, open(os.path.join(AQUI, 'revision-1.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('revisión:', len(out), '· con dirección', sum('direccion' in r for r in out.values()), '· con foto', sum('foto' in r for r in out.values()),
          '· con coordenadas', sum('lonlat' in r for r in out.values()))


if __name__ == '__main__':
    main()
