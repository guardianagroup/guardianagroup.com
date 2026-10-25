# Revisión de las fichas de empresas (24 Oct 2026, 18:00–18:20; terminada a las 20:15 en la cuenta nueva)

**20:15:** `revision-1.json` escrito con `decisiones.py` (45 empresas, 8 fotos, 45 direcciones con coordenadas). Coordenadas en `coordenadas.json`: Nominatim (1 petición cada 2,2 s) o la voz OSM/SIRENE cuando coincide con la dirección decidida. Media.net va al punto de Dubai Internet City (Nominatim no tiene Aurora Tower). Paramount queda fuera hasta corregir su emparejamiento. `copiar()` ya admite `sede`, `sede_pais` y `cc` en la revisión.

Candidatas: `orbita/datos/empresas-candidatas.json` (64 emparejadas, 57 sin emparejar; run del 24 Oct 21:33Z).

## Fotos revisadas una a una (53 de las 198 candidatas tenían nombre plausible; vistas en el navegador integrado)
**Aceptadas** (edificio real de la sede, sin personas ni logotipos):
- Adobe → `Adobe HQ.JPG` (torres de San José, de lejos)
- Fox Corporation → `1211 Avenue of the Americas.jpg`
- Meta → `Facebook Offices Menlo Park California (34183281176).jpg` (campus de 1 Hacker Way / 1 Meta Way, desde el agua)
- Microsoft → `Aerial Microsoft West Campus August 2009.jpg` (dominio público)
- PRISA → `Edificio en Gran Vía 32 Madrid.png` (domicilio social; ojo: la sede operativa según LEI es Miguel Yuste 40)
- Qualtrics → `Qualtrics headquarters (29230813277).jpg`
- Salesforce → `Salesforce Tower 2020.jpg`
- Sky → `Aerial view of Sky campus in 2011.jpg` (dominio público)
**Descartadas:** con logotipo (Adobe 0/1/5/6, Google, Meta HQ con letrero, Microsoft Building 92, PRISA Tres Cantos, Quantcast, Seznam, Yahoo, Disney Alameda, Paramount, ByteDance «markings», GfK —logo rojo pequeño—, Qualtrics 0); interiores o personas (Dailymotion, Sovrn, HubSpot, Cloudflare, Automattic, Pinterest Tour); no es la sede actual (Oracle Redwood → hoy Austin; X/Twitter San Francisco → hoy Bastrop; Amazon Doppler/Lab126; ByteDance Xiamen; Disney con personajes); calles o placas cerca de la dirección (Contentsquare, Equativ, Ipsos); nombres sin relación (Nielsen, Opera, Piano, Snap, Amplitude).

## Direcciones (regla: registro oficial o dos voces)
Decididas (texto → voces):
- 33Across → CPPA 2026: 228 Park Avenue South PMB 74008, New York NY 10003 (la SEC da 460 W 34th St, antigua; Wikidata dice Sunnyvale, mal). Sede: Nueva York.
- Adobe → 345 Park Ave, San Jose CA 95110 (SEC + Wikidata + OSM).
- Amazon → 410 Terry Avenue North, Seattle WA 98109 (SEC + Wikidata).
- Amplitude → 201 Third Street, Suite 200, San Francisco CA 94103 (GLEIF/LEI 984500EZ87C703978858, sede).
- Automattic → 60 29th St #343, San Francisco CA 94110 (GLEIF 254900SC9UVUIZP1CH08; la de la SEC, 132 Hawthorne, es antigua).
- Brightcove → 281 Summer Street, Boston MA 02210 (SEC).
- Chartbeat → 826 Broadway, 6th Floor, New York NY 10003 (SEC).
- Cloudflare → 101 Townsend St, San Francisco CA 94107 (SEC + OSM).
- Comscore → 11950 Democracy Drive, Suite 600, Reston VA 20190 (SEC + CPPA).
- Contentsquare → 7 Rue de Madrid, 75008 Paris (SIRENE).
- Criteo → 32 Rue Blanche, 75009 Paris (SIRENE + Wikidata + OSM; la SEC da Luxemburgo por el traslado del domicilio legal).
- Equativ → 44-48 Rue de Châteaudun, 75009 Paris (SIRENE).
- Fox Corporation → 1211 Avenue of the Americas, New York NY 10036 (GLEIF 549300DDU6FDRBIELS05 + Wikidata).
- Google → 1600 Amphitheatre Parkway, Mountain View CA 94043 (SEC + Wikidata).
- HubSpot → 2 Canal Park, Cambridge MA 02141 (SEC + OSM).
- Ipsos → 35 Rue du Val de Marne, 75013 Paris (SIRENE + Wikidata).
- LiveRamp → 225 Bush Street, 17th Floor, San Francisco CA 94104 (CPPA).
- Magnite → 1250 Broadway, 9th Floor, New York NY (SEC; la CPPA da Los Ángeles). Sede: Nueva York.
- Media.net → 2701 Aurora Towers, Dubai Internet City, Dubái (CPPA). País AE.
- Meta → 1 Meta Way, Menlo Park CA 94025 (SEC).
- Microsoft → One Microsoft Way, Redmond WA 98052 (SEC + Wikidata).
- Nielsen → 675 Avenue of the Americas, New York NY 10010 (SEC + CPPA/eXelate).
- OpenX → 35 N. Lake Avenue, Suite 240, Pasadena CA 91101 (CPPA 2026; la SEC es antigua).
- Oracle → 2300 Oracle Way, Austin TX 78741 (SEC).
- Outbrain → 111 West 19th Street, New York NY 10011 (SEC + CPPA, como «Teads Holding Co.»: Outbrain compró Teads en 2025 y cambió de nombre).
- Paramount → la candidata (Q159846) es Paramount Pictures; la matriz es Paramount Skydance Corporation, sede 1515 Broadway, New York NY 10036 (GLEIF 529900B6VAJG54Y9QF02). Revisar el emparejamiento (FORZADAS) antes de usarla.
- PRISA → Gran Vía 32, 28013 Madrid (domicilio social, LEI 959800U3NGPXSCQHQW54 + Wikidata); sede operativa LEI: Miguel Yuste 40, 28037 Madrid.
- Prensa Ibérica → Av. de la Gran Via de l'Hospitalet 163-167, 08908 L'Hospitalet de Llobregat (GLEIF 959800LZ8UVL4ZQMG292).
- Qualtrics → 333 West River Park Drive, Provo UT 84604 (SEC + OSM).
- Quantcast → 201 Third Street, Second Floor, San Francisco CA 94103 (SEC).
- RTB House → ul. Złota 61/101, 00-819 Warszawa (GLEIF 984500F644Z2FD680C94 + Wikidata).
- Salesforce → Salesforce Tower, 415 Mission Street, 3rd Floor, San Francisco CA 94105 (SEC + Wikidata).
- Seedtag → Marqués de Valdeiglesias 6, 28004 Madrid (GLEIF 959800WQLK1D7CYTM157).
- Seznam.cz → Radlická 3294/10, 150 00 Praha 5 (GLEIF 3157008DY7NRFD22D743).
- Shopify → 151 O'Connor Street, Ground Floor, Ottawa ON K2P 2L8 (SEC; Wikidata/OSM dicen 150 Elgin St).
- Sky → Grant Way, Isleworth, Middlesex TW7 5QD (Companies House, Sky UK Limited 02906991, + Wikidata).
- Snap → 3000 31st Street, Santa Monica CA 90405 (SEC).
- Sovrn → 1600 Pearl Street, Suite 200, Boulder CO 80302 (CPPA 2026; la SEC es antigua).
- Taboola → 16 Madison Square West, 7th Floor, New York NY 10010 (SEC + CPPA).
- Teads → 111 West 19th Street, New York NY 10011 (CPPA).
- Tealium → 9605 Scranton Road, San Diego CA 92121 (GLEIF 25490022SLQK4828KO50).
- The Trade Desk → 42 N. Chestnut Street, Ventura CA 93001 (SEC).
- The Walt Disney Company → 500 South Buena Vista Street, Burbank CA 91521 (SEC + Wikidata).
- TripleLift → 53 West 23rd Street, 12th Floor, New York NY (Wikidata + CPPA).
- Unidad Editorial → Avenida de San Luis 25, 28033 Madrid (GLEIF 959800PSK3FFF8EYX760).
- Zeta Global → 3 Park Avenue, 33rd Floor, New York NY 10016 (SEC + CPPA).
Sin dirección (no hay registro oficial ni dos voces, o el dato no cuadra): Adform (LEI caducado: Silkegade 3B, Copenhague), ByteDance, Dailymotion (LEI caducado; mirar SIRENE), Echobox, GfK (OSM: Sophie-Germain-Straße 3-5, Núremberg; falta segunda voz: Impressum o registro), InMobi, Integral Ad Science (LEI caducado), JW Player, Opera (LEI caducado: Vitaminveien 4, Oslo), Piano (LEI caducado), Pinterest, RCS MediaGroup, Reddit, Tapad (la CPPA mezcla Costa Mesa con Illinois), Twipe, X Corp., Yahoo, Yandex.

**GLEIF (registro LEI, oficial)** se consulta desde cualquier pestaña del navegador: `https://api.gleif.org/api/v1/fuzzycompletions?field=entity.legalName&q=<nombre>` y `https://api.gleif.org/api/v1/lei-records/<LEI>` (CORS abierto). Solo valen los registros «ISSUED»; los «LAPSED» pueden estar desfasados. Merece la pena añadirlo como voz en `empresas.py`.

## Pasos que faltan
1. Coordenadas (`lonlat`) de cada dirección aceptada: Nominatim desde el navegador, como mucho 1 petición cada 2 s (devuelve 429 si se insiste), o la `lonlat` de la voz OSM/SIRENE cuando la hay.
2. `copiar()` en `empresas.py` copia `sede` de Wikidata sin poder corregirla (33Across, Magnite, Taboola): añadir que `revision-*.json` pueda traer `sede`, `sede_pais` y `cc`.
3. Escribir `herramientas/agencia-rondas/empresas/revision-1.json` (formato en el traspaso), publicarlo en `main` y lanzar `gh workflow run empresas.yml --ref main -f modo=copiar`.
4. Captura del diseño de la ficha de empresa para que el dueño la apruebe (ver traspaso, punto 4).
