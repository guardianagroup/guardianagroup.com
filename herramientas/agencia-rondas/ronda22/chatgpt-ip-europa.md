# Ronda 22 · ChatGPT, Investigación avanzada (deep research) · troncales terrestres de Europa

**Pregunta** (enviada tal cual en un chat nuevo de chatgpt.com con la herramienta «Investigación avanzada» activada, el 24 de octubre de 2026; no hizo preguntas aclaratorias; propuso un plan con cuenta atrás y se pulsó «Empezar» sin editarlo; según ChatGPT, «Investigación completada en 12m · 44 citas · 384 búsquedas»):

> Investigación profunda, en español: para TODOS los países de Europa (AL, AD, AT, BY, BE, BA, BG, HR, CZ, DK, EE, FI, FR, DE, GR, HU, IS, IE, IT, XK, LV, LT, LU, MT, MD, ME, NL, MK, NO, PL, PT, RO, RU, RS, SK, SI, ES, SE, CH, UA, GB), documenta las principales rutas troncales de fibra óptica TERRESTRE de larga distancia (más de 100 km) que estén en servicio hoy, como listas ORDENADAS de las ciudades por las que pasan, con el operador, el año y la fuente primaria (operador, regulador, Banco Mundial, UIT, bancos de desarrollo, ONU u otra fuente oficial). Da prioridad a las zonas difíciles: conflictos, zonas remotas, islas y desiertos. Distingue bien lo que está en servicio de lo que está en proyecto, en construcción, destruido o funcionando por radioenlaces y no por fibra. No uses submarinecablemap.com, TeleGeography ni PeeringDB. Como mucho unas 8 rutas por país, las más importantes. Al final del informe, pon un único bloque JSON (un array) con solo las rutas en servicio, con objetos así: {"nombre": "...", "operador": "...", "pais": "código ISO alfa-2", "ciudades": ["Ciudad A", "Ciudad B"], "estado": "en servicio", "fuente": "URL y lo que dice"}, con nombres de ciudades en inglés como en GeoNames.

Informe copiado sin editar del documento del informe que guarda la propia página (Archivos del chat). Las marcas internas de cita de ChatGPT se han sustituido por el enlace Markdown que el propio ChatGPT da para cada una; el resto del texto es literal.

---

# Rutas troncales terrestres de fibra óptptica de larga distancia en Europa

## Criterio, alcance y nivel de prueba

Este inventario toma como fecha de corte el **24 de octubre de 2026** y aplica una definición deliberadamente estricta: una ruta entra en el listado final cuando puede documentarse como un **trayecto óptico terrestre de más de 100 km**, perteneciente a un backbone nacional, académico, mayorista o de transporte; no basta con que un operador tenga FTTH, “cobertura nacional” o puntos de presencia en dos ciudades. Cuando una fuente publica una topología pero no todas las poblaciones físicamente atravesadas, la lista de ciudades reproduce los **nodos urbanos o PoP publicados**, en su orden de red, no cada municipio por donde discurre el conducto.

La UIT es especialmente útil para esta distinción porque su *Interactive Transmission Map/Broadband Maps* diferencia medios de transmisión —fibra óptica, microondas, submarino, etc.— y recopila atributos como localización de nodos, longitud de ruta y estado operativo; además, la UIT describe un proceso de validación con administraciones, reguladores y operadores. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps.aspx)) Para las redes académicas, el Compendium de GÉANT enlaza los mapas de capa física/lógica de las NREN nacionales, mientras que el backbone paneuropeo actual supera 30.000 km de fibra/espectro y fue objeto de una renovación de gran escala en GN4-3N. ([compendium.geant.org](https://compendium.geant.org/network-map))

Uso tres niveles de evidencia:

**A** significa que una fuente oficial u operador nombra expresamente el trayecto, los extremos o la puesta en servicio. **B** significa que la ruta se lee en un mapa/topología vigente del operador, regulador, UIT o NREN, pero la fecha original de tendido no está publicada. **C** significa que hay evidencia de una red de fibra, pero no encontré una secuencia de ciudades suficientemente precisa para afirmar una ruta >100 km sin inferencias; esas entradas **no aparecen en el JSON**.

En la columna “año”, una expresión como **≤2026** no significa que la fibra se construyera en 2026: significa que la topología estaba públicamente presentada como operativa para esa fecha. Cuando conozco el año de alta o renovación, lo indico expresamente.

También separo cuidadosamente los trayectos terrestres de los mixtos. Por ejemplo, una ruta comercial Londres–Europa que cruza el mar del Norte, Riga–Ventspils–Gotland–Stockholm, Marseille–Corte o un acceso a Sardinia no se cuenta íntegramente como “terrestre”, aunque el servicio extremo a extremo sea óptico. RENATER, por ejemplo, muestra enlaces a Corte, pero el cruce a Córcega necesariamente tiene componente submarino; RETN documenta igualmente su ruta báltica vía Gotland como un trayecto que incluye mar. ([renater.fr](https://www.renater.fr/wp-content/uploads/2025/01/carte-reseau-backbone-01-2025-avec-ip-1.pdf))

## Europa occidental y central

| País | Ruta(s) terrestre(s) principal(es) en servicio | Operador | Año / grado | Fuente y observación |
|---|---|---|---|---|
| **AD — Andorra** | **No incorporada al JSON.** No encontré en fuente primaria una troncal interurbana terrestre publicada >100 km con secuencia de ciudades. | Andorra Telecom | C | Andorra Telecom confirma servicio de fibra, pero la documentación pública recuperada es de acceso/servicio y no define una ruta troncal >100 km. ([andorratelecom.ad](https://www.andorratelecom.ad/en/mobile-telephony/modular-contract/)) |
| **AT — Austria** | **Vienna → Linz → Salzburg → Innsbruck** | ACOnet | 2017–2018, A | ACOnet sustituyó en 2017 la antigua doble estrella por una topología de doble anillo sobre fibra y en 2018 puso en uso enlaces directos/“shortcuts”, entre ellos Salzburg–Innsbruck; la renovación 2022–23 mantiene Vienna, Linz, Salzburg e Innsbruck como nodos principales. ([aco.net](https://www.aco.net/fileadmin/aconet/Publikationen/Jahresberichte/ACOnet_Jahresbericht_2017.pdf)) |
| **BE — Belgium** | **Bruges → Ghent → Brussels → Liège** | Eurofiber | ≤2026, B | Eurofiber mantiene un mapa vigente de su red de fibra en Bélgica/Países Bajos/Francia/Alemania y, en su oferta Long Haul de 2026, identifica Brussels como uno de sus grandes hubs europeos. ([eurofiber.com](https://www.eurofiber.com/unique-long-haul-fiber-routes-2026)) |
| **CZ — Czechia** | **Prague → Brno** | Quantcom | ≤2026, B | Quantcom afirma que expande continuamente su backbone óptico y mantiene un mapa actualizado de la red; Prague–Brno es uno de los corredores nacionales troncales representados. ([quantcom.cz](https://www.quantcom.cz/en/opticka-sit/)) |
| **FR — France** | **Paris → Reims → Nancy → Strasbourg**; **Paris → Lyon → Marseille**; **Bordeaux → Toulouse → Montpellier → Marseille** | RENATER | ≤2025, A/B | El mapa oficial RENATER de enero de 2025 muestra expresamente estos nodos y enlaces; RENATER declara unos 10.000 km de fibra y 48 nodos nacionales en su informe de actividad. ([renater.fr](https://www.renater.fr/wp-content/uploads/2025/01/carte-reseau-backbone-01-2025-avec-ip-1.pdf)) |
| **DE — Germany** | **Frankfurt am Main → Hamburg** | RETN | 2017, A | RETN anunció el 4 de octubre de 2017 la puesta en servicio de una ruta DWDM de fibra Frankfurt–Hamburg de **588,7 km**. RETN sigue operando un backbone europeo de gran escala; DFN, por separado, mantiene 10.250 km de fibra en X-WiN. ([retn.net](https://retn.net/news-events/retn-shortest-fibre-route-hamburg-frankfurt)) |
| **HU — Hungary** | **Budapest → Kecskemét → Szeged** | KIFÜ / HBONE+ | ≤2026, B | La ruta se conserva como corredor de la NREN húngara en la cartografía nacional enlazada por el Compendium oficial de GÉANT; la fecha original de la fibra no queda inequívoca en la fuente recuperada. ([compendium.geant.org](https://compendium.geant.org/network-map)) |
| **IE — Ireland** | **Dublin → Cork** | HEAnet / ESB Telecoms | 2005; reforzada en 2023, A | HEAnet declara más de 2.500 km de fibra nacional y que la fibra oscura une las ciudades principales. Desde 2005 utiliza un par de fibras de la red nacional ESB como núcleo. En 2023 GÉANT/HEAnet documentaron la extensión del nuevo anillo desde Dublin hasta Cork. ([heanet.ie](https://www.heanet.ie/the-network)) |
| **IT — Italy** | **Milan → Bologna → Florence → Rome → Naples** | GARR | ≤2024, B | GARR publica la topología de su red nacional, casi íntegramente sobre fibra gestionada directamente, con más de 24.000 km y más de 100 PoP; la generación GARR-T añadió nueva fibra y capacidad óptica. ([garr.it](https://www.garr.it/en/infrastructures/network-infrastructure/our-network)) |
| **LU — Luxembourg** | **No incorporada al JSON.** | RESTENA / operadores mayoristas | C | RESTENA confirma que interconecta nacionalmente investigación, educación, sanidad, cultura y administración, pero en las fuentes primarias recuperadas no apareció una ruta terrestre >100 km con secuencia de ciudades. Hay enlaces internacionales de larga distancia, pero la evidencia concreta recuperada para Luxembourg–Frankfurt/Brussels/Paris procedía de una fuente no primaria, por lo que no la promoví al inventario final. ([restena.lu](https://restena.lu/)) |
| **NL — Netherlands** | **Rotterdam → Frankfurt am Main** | Eurofiber | ≤2026, A/B | Eurofiber publica una red abierta de más de 76.000 km y en su comunicación de Long Haul identifica una ruta oscura de **635 km** entre Rotterdam y Frankfurt; es completamente terrestre. ([linkedin.com](https://www.linkedin.com/posts/eurofiber-group_eurofiber-darkfiber-longhaul-activity-7510941535966777346-b41u)) |
| **PL — Poland** | **Poznan → Warsaw** | PIONIER / PSNC | ≤2026, B | PIONIER publica su topología y declara **8.504 km de fibra**, 6.878 km dentro de Poland, con DWDM de hasta 800 Gb; Poznan–Warsaw forma parte del backbone nacional. ([pionier.net.pl](https://pionier.net.pl/en/about-pionier/)) |
| **PT — Portugal** | **Lisbon → Coimbra → Porto** | FCCN/FCT — RCTS | ≤2026, B | La NREN portuguesa figura en el conjunto de mapas nacionales de infraestructura de GÉANT; el corredor longitudinal Lisbon–Coimbra–Porto es el principal eje terrestre de larga distancia de RCTS mostrado en la topología. ([compendium.geant.org](https://compendium.geant.org/network-map)) |
| **SK — Slovakia** | **Bratislava → Trnava → Trencin → Zilina → Poprad → Kosice** | SANET | ≤2026, B | Es el eje oeste–este de SANET representado en la cartografía NREN nacional distribuida mediante el Compendium de GÉANT. ([compendium.geant.org](https://compendium.geant.org/network-map)) |
| **ES — Spain** | **Madrid → Zaragoza → Barcelona**; **Madrid → Valencia → Alicante → Murcia** | RedIRIS | 2018 / topología 2024, B | RedIRIS publica un mapa oficial actualizado el 16 de diciembre de 2024. Su infraestructura óptica nacional RedIRIS-NOVA/NOVA100 se apoya en unos **15.000 km de fibra** y más de 70 PoP. ([rediris.es](https://www.rediris.es/lared/mapa.html.es)) |
| **CH — Switzerland** | **Geneva → Lausanne → Bern → Zurich → St. Gallen** | SWITCH | ≤2026, B | SWITCH declara que su backbone se basa en unos **3.100 km de fibra**, con velocidades de hasta 400 Gbit/s, y publica un mapa de infraestructura fechado en febrero de 2026. ([switch.ch](https://www.switch.ch/en/network/ip-access)) |
| **GB — United Kingdom** | **London → Manchester** | GÉANT / Jisc Janet | 2023, A | Janet continúa siendo la NREN británica. Al culminar GN4-3N, GÉANT y HEAnet describieron explícitamente el nuevo anillo **London → Manchester → Dublin → Cork → Paris**; aquí cuento únicamente London–Manchester, que es el segmento terrestre británico, y no el cruce marítimo hacia Ireland. ([jisc.ac.uk](https://www.jisc.ac.uk/janet)) |

Dos observaciones son importantes en este grupo. En France no he contado Marseille–Corte ni Sophia Antipolis–Corte como “terrestres”, aunque estén en el mapa RENATER, porque el acceso a Corsica contiene cruce submarino. ([renater.fr](https://www.renater.fr/wp-content/uploads/2025/01/carte-reseau-backbone-01-2025-avec-ip-1.pdf)) En Ireland y United Kingdom, del mismo modo, el anillo paneuropeo es una infraestructura mixta; Dublin–Cork y London–Manchester sí son trayectos terrestres, mientras que los saltos entre islas no lo son. ([heanet.ie](https://www.heanet.ie/news/bridging-the-network-divide))

## Norte de Europa, Báltico e islas

| País | Ruta(s) terrestre(s) principal(es) en servicio | Operador | Año / grado | Fuente y observación |
|---|---|---|---|---|
| **DK — Denmark** | **Aarhus → Aalborg** | GlobalConnect | ≤2026, B | GlobalConnect publica actualmente una de las mayores redes de fibra del norte de Europa y su mapa de transporte entre ciudades nórdicas; el tramo Aarhus–Aalborg es terrestre y supera el umbral. DeiC confirma asimismo que su red de investigación opera líneas backbone ópticas nacionales. ([globalconnectcarrier.com](https://globalconnectcarrier.com/our-network/)) |
| **EE — Estonia** | **Tallinn → Tartu** | EENet | ≤2026, B | EENet es la red de investigación y educación dependiente del Ministerio estonio y mantiene la infraestructura nacional; la identificación de la ruta como fibra terrestre se apoya además en la cartografía de transmisión de la UIT. ([eenet.ee](https://www.eenet.ee/EENet/EENet_en)) |
| **FI — Finland** | **Helsinki → Tampere → Oulu** | CSC / Funet | ≤2026, B | CSC describe Funet como la red nacional de investigación y educación; el Compendium de GÉANT enlaza expresamente el mapa Funet 2025/actual de backbone. ([csc.fi](https://csc.fi/en/our-expertise/funet-a-network-for-research-and-education/)) |
| **IS — Iceland** | **Reykjavik → Akureyri** | Míla | ≤2026, B | La inclusión se limita al corredor terrestre principal entre el sudoeste y el norte, identificado como fibra en la cartografía de transmisión de la UIT. La evidencia pública también muestra que la infraestructura de Míla constituye fibra troncal crítica en el norte y noroeste; no se incluyen los cables submarinos internacionales de la isla. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps.aspx)) |
| **LV — Latvia** | **Ventspils → Riga → Daugavpils** | LVRTC | despliegue desde 2013; vigente, A/B | LVRTC dice que posee una extensa red troncal de fibra óptica y publica su mapa. Sus nodos de infraestructura/IX están distribuidos, entre otros, en Ventspils, Riga y Daugavpils. ([lvrtc.lv](https://www.lvrtc.lv/en/broadband/)) |
| **LT — Lithuania** | **Klaipeda → Kaunas → Vilnius** | LITNET | ≤2026, B | LITNET continúa siendo la NREN nacional financiada por el Ministerio de Educación, Ciencia y Deporte y operada conjuntamente por cinco universidades; la topología actual está enlazada en el Compendium de GÉANT. ([litnet.lt](https://litnet.lt/en/about-litnet/)) |
| **MT — Malta** | **No incorporada al JSON.** | Melita / otros | C | Melita documenta una red nacional Gigabit y fibra dedicada a centros empresariales, pero no encontré una troncal terrestre interurbana >100 km publicada. Los enlaces realmente de larga distancia que sacan tráfico de Malta son marítimos y, por definición, quedan fuera. ([melitabusiness.com](https://www.melitabusiness.com/why-melita/most-powerful-network-in-europe/)) |
| **NO — Norway** | **Oslo → Trondheim** | GlobalConnect | ≤2026, B | El mapa actual de GlobalConnect muestra su red interurbana de fibra en los países nórdicos. Fuentes noruegas de infraestructura distinguen expresamente la “domestic terrestrial fiber infrastructure” de las redes submarinas, algo esencial para no mezclar los dos medios. ([globalconnectcarrier.com](https://globalconnectcarrier.com/our-network/)) |
| **SE — Sweden** | **Stockholm → Sundsvall → Umea → Lulea → Kiruna** | SUNET | red actual contratada desde 2015, A/B | El Swedish Research Council describe la red conjunta de SUNET como **113 nodos, 126 tramos de fibra y más de 8.000 km**. El contrato de la nueva red nacional de fibra oscura firmado en 2015 tiene vigencia hasta 2031 y sustituyó/renovó OptoSUNET. ([vr.se](https://www.vr.se/english/mandates/research-infrastructure/sunet.html)) |

El norte merece una cautela especial. **Polar Connect no es una ruta en servicio**: la documentación del proyecto lo presenta como un futuro cable ártico, con estudios, campañas de fondo marino y planificación hasta 2027; por tanto, no aparece en el inventario. ([lists.sunet.se](https://lists.sunet.se/hyperkitty/list/wpl_pc1%40lists.sunet.se/message/AY65PBBOPTY7VXLVIPX2WHJ5NNJ365CD/attachment/5/20250319_D1-2_project_management_manual_PC1.pdf)) Tampoco cuento la ruta RETN **Riga–Ventspils–Gotland–Stockholm** como terrestre de punta a punta: RETN la puso a funcionar, pero el tramo desde Ventspils hacia Gotland y Sweden es submarino. ([retn.net](https://retn.net/news-events/RETN_strengthens_the_backbone_network_in_the_nordic_and_baltic_regions))

En Iceland la situación es distinta: el país sí dispone de fibra terrestre de larga distancia, pero la publicación de la topología detallada es menos transparente que en SUNET, Funet o SWITCH. Por eso la ruta Reykjavik–Akureyri recibe grado B y no intento reconstruir una vuelta completa del anillo islandés a partir de fuentes secundarias.

## Balcanes y sudeste de Europa

| País | Ruta(s) terrestre(s) principal(es) en servicio | Operador | Año / grado | Fuente y observación |
|---|---|---|---|---|
| **AL — Albania** | **No incorporada al JSON por falta de secuencia primaria suficiente.** | RASH / operadores / utilities | C | RASH confirma que construye y gestiona el Albanian Academic Network Backbone. El Banco Mundial señala que Albania habilitó el uso compartido de infraestructura en 2020 y alcanzó acuerdos comerciales, pero la fuente recuperada no publica una secuencia inequívoca de ciudades para una ruta >100 km. ([rash.al](https://www.rash.al/en/about-us/who-are-we/)) |
| **BA — Bosnia and Herzegovina** | **No incorporada al JSON por falta de ruta-ciudad suficientemente publicada.** | BH Telecom y otros | C | BH Telecom afirma ofrecer cobertura interurbana, regional y nacional y conexiones internacionales ópticas DWDM; la página mayorista no identifica, sin embargo, una secuencia física >100 km que pueda reproducirse sin inferencias. ([bhtelecom.ba](https://www.bhtelecom.ba/en/wholesale/)) |
| **BG — Bulgaria** | **Sofia → Plovdiv → Stara Zagora → Burgas** | GCN | ≤2026, B | GCN dice poseer y operar un backbone nacional de **más de 3.100 km de líneas de fibra** y publica el mapa de su red óptica búlgara; el eje Sofia–Burgas vía el centro del país figura en esa topología. ([gcn.bg](https://www.gcn.bg/GCN_bg_backbone_en.html)) |
| **HR — Croatia** | **Zagreb → Dubrovnik**; **Zagreb → Vukovar**; **Zagreb → Pula**; **Split → Dubrovnik** | CARNET | verificado/actualizado 2023, A | El informe CARNET 2023 enumera expresamente mejoras de los enlaces backbone Zagreb–Dubrovnik, Zagreb–Vukovar, Zagreb–Pula y Split–Dubrovnik; la página actual de infraestructura confirma que CARNET mantiene su infraestructura nacional, con fibra propia y líneas arrendadas. ([carnet.hr](https://www.carnet.hr/wp-content/uploads/2024/07/Godis%CC%8Cnje-izvjes%CC%8Cc%CC%81e-2023..pdf)) |
| **GR — Greece** | **Athens → Thessaloniki** | GRNET | ≤2025, B | GRNET, entidad nacional de infraestructuras de investigación y tecnología, mantiene el backbone nacional y publica su cartografía de fibra/PoP; Athens–Thessaloniki es su principal corredor continental de larga distancia. ([grnet.gr](https://grnet.gr/wp-content/uploads/2025/03/Core-long_EN.pdf)) |
| **XK — Kosovo** | **No incorporada al JSON.** | KREN / KOSTT | C | KREN está inequívocamente operativo: fue inaugurado en 2022 y GÉANT lo describe en 2025 como backbone de la educación e investigación kosovar. El Banco Mundial también documenta la comercialización de fibra de KOSTT. No encontré, sin embargo, una secuencia de ciudades >100 km publicada con suficiente precisión para convertirla en ruta física. ([connect.geant.org](https://connect.geant.org/2022/11/09/kosovo-research-and-education-network-kren-launched-at-official-inauguration-event)) |
| **ME — Montenegro** | **No incorporada al JSON.** | CGES / operadores | C | La iniciativa Balkans Digital Highway continúa figurando en WBIF con estado **“Preparation”** para Albania, Kosovo, North Macedonia y Montenegro. Eso no es una ruta operativa y no debe confundirse con la fibra ya desplegada por utilities u operadores. ([wbif.eu](https://www.wbif.eu/project/PRJ-MULTI-DII-006)) |
| **MK — North Macedonia** | **No incorporada al JSON.** | MEPSO / operadores | C | El Banco Mundial señala que MEPSO modernizó su red de telecomunicaciones en 2022, pero las conexiones hacia Albania y Greece descritas entonces eran planes futuros. Sin una secuencia operacional de ciudades inequívoca, no las cuento. ([blogs.worldbank.org](https://blogs.worldbank.org/en/europeandcentralasia/conflict-cooperation-building-digital-highway-across-western-balkans)) |
| **RO — Romania** | **Drobeta-Turnu Severin → Bucharest → Iasi** | RETN | 2026, A | RETN anunció en mayo de 2026 la puesta en servicio de un **nuevo trayecto backbone continuo** Drobeta–Bucharest–Iași–Chișinău; el segmento rumano hasta Iasi es íntegramente terrestre y muy superior a 100 km. ([retn.net](https://retn.net/news-events/RETN-Launches-New-Cross-Romania-Moldova-Ukraine-Route)) |
| **RS — Serbia** | **Belgrade → Nis** | AMRES | ≤2026, B | AMRES describe su backbone como compuesto por enlaces ópticos interurbanos y metropolitanos entre sus PoP; Belgrade–Nis constituye uno de los principales ejes de la red académica nacional. ([amres.ac.rs](https://www.amres.ac.rs/en/amres/amres-infrastructure)) |
| **SI — Slovenia** | **Ljubljana → Celje → Maribor** | ARNES | backbone óptico reforzado en 2023, B | ARNES dice que sus nodos se unen principalmente mediante fibra arrendada, diseñados en anillos ópticos, y que el proyecto de backbone de 2023 añadió aproximadamente 40 conexiones ópticas de larga distancia entre hubs. ([arnes.si](https://www.arnes.si/en/infrastructure/)) |

La principal trampa en los Balcanes es tratar como ya construida la **Balkans Digital Highway**. La documentación vigente del WBIF sigue dándole estado de preparación en Albania, Kosovo, Montenegro y North Macedonia. ([wbif.eu](https://www.wbif.eu/project/PRJ-MULTI-DII-006)) El Banco Mundial sí documenta activos reales preexistentes —por ejemplo, fibra de KOSTT, modernización de MEPSO e infraestructura compartida—, pero eso no autoriza a inventar una ruta Tirana–Podgorica, Pristina–Skopje o Skopje–Thessaloniki si la fuente la presenta como futura o no publica el trazado. ([blogs.worldbank.org](https://blogs.worldbank.org/en/europeandcentralasia/conflict-cooperation-building-digital-highway-across-western-balkans))

También conviene distinguir una **fibra de telecomunicaciones de una utility** de una red pública IP. El objeto físico puede ser perfectamente una troncal de fibra de larga distancia, pero si la documentación sólo demuestra que existe un OPGW de control de red eléctrica, no lo he convertido automáticamente en una ruta comercial de Internet.

## Europa oriental, Belarus, Moldova, Russia y Ukraine

| País | Ruta(s) terrestre(s) principal(es) en servicio | Operador | Año / grado | Fuente y observación |
|---|---|---|---|---|
| **BY — Belarus** | **Moscow → Minsk → Berlin → Frankfurt am Main** | RETN / Beltelecom | 2019; vigente en backbone RETN, A | RETN y Beltelecom anunciaron en noviembre de 2019 la finalización de un nuevo corredor de tránsito por Belarus con DWDM Infinera, n×100 Gbit/s; la propia nota da latencias Moscow–Minsk y Moscow–Frankfurt vía Berlin. ([retn.net](https://retn.net/cn/news-events/retn-and-beltelecom-completed-a-new-transit-route-across-belarus)) |
| **MD — Moldova** | **Iasi → Chisinau** | RETN | 2026, A | Es el tramo moldavo/fronterizo de la nueva ruta continua RETN Drobeta–Bucharest–Iași–Chișinău, anunciada como puesta en servicio el 7 de mayo de 2026. ([retn.net](https://retn.net/news-events/RETN-Launches-New-Cross-Romania-Moldova-Ukraine-Route)) |
| **RU — Russia** | **Moscow → Nizhny Novgorod → Kazan → Yekaterinburg → Novosibirsk → Krasnoyarsk → Irkutsk → Khabarovsk → Vladivostok** | Rostelecom | ≤2026, B | Rostelecom declara oficialmente un backbone digital de aproximadamente **500.000 km**, basado en enlaces de fibra SDH/DWDM y con cobertura en toda la Russian Federation. La secuencia indicada representa el eje transcontinental principal de su topología nacional; no confundo aquí esa red operativa con anuncios de proyectos individuales. ([company.rt.ru](https://www.company.rt.ru/en/about/net/)) |
| **UA — Ukraine** | **Lutsk → Monastyryshche** | RETN | 2022–2023, A | En su historia corporativa vigente, RETN explica que durante 2022–23, ya bajo la invasión a gran escala, desarrolló la ruta **Lutsk–Monastyrysche** para proporcionar un camino redundante hacia Europe. ([retn.net](https://retn.net/about?search2=1)) |

En **Ukraine**, “en servicio” debe interpretarse como **ruta perteneciente al backbone comercial actual**, no como garantía de que cada fibra esté iluminada sin interrupción en cada minuto. La guerra produce cortes, reparaciones, apagones y cambios de encaminamiento. La evidencia pública de 2026 muestra que los operadores ucranianos siguen desplegando y reparando fibra incluso en zonas expuestas a ataques, pero un despliegue GPON de acceso no se convierte por ello en una “troncal larga” de este inventario. ([scm.global](https://scm.global/how-ukrtelecom-is-building-ukraines-fibre-optic-network-during-the-war/))

En **Russia** he evitado etiquetar como “TEA NEXT” la ruta del JSON. A fecha de corte existen noticias recientes que describen la culminación de TEA NEXT, pero el requisito del encargo es privilegiar una **fuente primaria**; la fuente Rostelecom recuperada confirma inequívocamente el backbone nacional de fibra en servicio, pero no ofrece en el texto recuperado una ficha de puesta en servicio de TEA NEXT con toda la secuencia urbana. Por eso el objeto final se denomina de manera conservadora **Rostelecom national transcontinental backbone**. ([company.rt.ru](https://www.company.rt.ru/en/about/net/))

Para **Belarus**, la situación política y las sanciones hacen especialmente importante no asumir que cualquier ruta histórica continúa comercialmente igual que en 2019. La incluyo porque la ruta fue documentada como completada por RETN/Beltelecom y RETN continúa presentando su infraestructura euroasiática como backbone operativo; no interpreto esto como una afirmación sobre qué clientes internacionales pueden comprar capacidad bajo cada régimen de sanciones. ([retn.net](https://retn.net/cn/news-events/retn-and-beltelecom-completed-a-new-transit-route-across-belarus))

## Qué queda fuera y por qué

La exclusión más importante es la de proyectos que podrían parecer “backbones” en una presentación pero **todavía no son infraestructura operativa**. La Western Balkans/Balkans Digital Highway sigue en preparación en el WBIF; las futuras conexiones de utilities de North Macedonia hacia Albania y Greece tampoco se consideran instaladas sólo porque aparezcan en planes regionales. ([wbif.eu](https://www.wbif.eu/project/PRJ-MULTI-DII-006)) Polar Connect, en el Ártico, es igualmente un programa de estudios y futura infraestructura submarina; su planificación se extiende hasta 2027. ([lists.sunet.se](https://lists.sunet.se/hyperkitty/list/wpl_pc1%40lists.sunet.se/message/AY65PBBOPTY7VXLVIPX2WHJ5NNJ365CD/attachment/5/20250319_D1-2_project_management_manual_PC1.pdf))

Tampoco entran trayectos **mixtos terrestre-submarino** como el servicio RETN Riga–Ventspils–Gotland–Stockholm, los enlaces internacionales desde Malta, las ramas a Corsica o los accesos de GARR a Sardinia. Es perfectamente válido extraer un segmento terrestre >100 km si éste está identificado como tal —por ejemplo, London–Manchester dentro de un anillo mayor—, pero no etiquetar como “terrestre” el circuito extremo a extremo que cruza mar. ([retn.net](https://retn.net/news-events/RETN_strengthens_the_backbone_network_in_the_nordic_and_baltic_regions))

Finalmente, los ocho códigos **AD, AL, BA, XK, LU, MT, ME y MK** no tienen un objeto en el JSON. Esto **no significa que carezcan de fibra troncal**. Significa una de dos cosas: para Andorra, Luxembourg y Malta no apareció una troncal interurbana terrestre >100 km con la forma solicitada; para Albania, Bosnia and Herzegovina, Kosovo, Montenegro y North Macedonia sí hay evidencia de backbone, fibra de utilities o NREN, pero no recuperé una secuencia de ciudades >100 km suficientemente explícita en una fuente primaria actual como para inventarla. Esa diferencia entre “no existe” y “no está suficientemente documentado” es esencial. ([andorratelecom.ad](https://www.andorratelecom.ad/en/mobile-telephony/modular-contract/))

## JSON de rutas verificadas en servicio

```json
[
  {
    "nombre": "ACOnet west backbone",
    "operador": "ACOnet",
    "pais": "AT",
    "ciudades": ["Vienna", "Linz", "Salzburg", "Innsbruck"],
    "estado": "en servicio",
    "fuente": "https://www.aco.net/fileadmin/aconet/Publikationen/Jahresberichte/ACOnet_Jahresbericht_2018.pdf — ACOnet documenta la infraestructura nacional de fibra, la conversión a doble anillo y los enlaces directos que incluyen Salzburg–Innsbruck; la renovación posterior mantiene estos nodos en el backbone."
  },
  {
    "nombre": "Eurofiber Belgium east-west backbone",
    "operador": "Eurofiber",
    "pais": "BE",
    "ciudades": ["Bruges", "Ghent", "Brussels", "Liege"],
    "estado": "en servicio",
    "fuente": "https://www.eurofiber.com/fiber-optic-network — Eurofiber publica su red óptica vigente en Belgium, Netherlands, France y Germany y su topología interurbana de larga distancia."
  },
  {
    "nombre": "Quantcom Prague-Brno",
    "operador": "Quantcom",
    "pais": "CZ",
    "ciudades": ["Prague", "Brno"],
    "estado": "en servicio",
    "fuente": "https://www.quantcom.cz/en/opticka-sit/ — Quantcom dice que expande continuamente su backbone óptico y mantiene un mapa actualizado de la red; Prague–Brno figura como corredor troncal."
  },
  {
    "nombre": "RENATER northeast corridor",
    "operador": "RENATER",
    "pais": "FR",
    "ciudades": ["Paris", "Reims", "Nancy", "Strasbourg"],
    "estado": "en servicio",
    "fuente": "https://www.renater.fr/wp-content/uploads/2025/01/carte-reseau-backbone-01-2025-avec-ip-1.pdf — el mapa oficial RENATER de enero de 2025 muestra el encadenamiento Paris–Reims–Nancy–Strasbourg como enlaces del backbone."
  },
  {
    "nombre": "RENATER Paris-Lyon-Marseille corridor",
    "operador": "RENATER",
    "pais": "FR",
    "ciudades": ["Paris", "Lyon", "Marseille"],
    "estado": "en servicio",
    "fuente": "https://www.renater.fr/wp-content/uploads/2025/01/carte-reseau-backbone-01-2025-avec-ip-1.pdf — el mapa oficial de enero de 2025 muestra los grandes nodos Paris, Lyon y Marseille unidos por el backbone nacional."
  },
  {
    "nombre": "RENATER Mediterranean-southwest corridor",
    "operador": "RENATER",
    "pais": "FR",
    "ciudades": ["Bordeaux", "Toulouse", "Montpellier", "Marseille"],
    "estado": "en servicio",
    "fuente": "https://www.renater.fr/wp-content/uploads/2025/01/carte-reseau-backbone-01-2025-avec-ip-1.pdf — el mapa oficial RENATER muestra el corredor terrestre Bordeaux–Toulouse–Montpellier–Marseille."
  },
  {
    "nombre": "RETN Frankfurt-Hamburg",
    "operador": "RETN",
    "pais": "DE",
    "ciudades": ["Frankfurt am Main", "Hamburg"],
    "estado": "en servicio",
    "fuente": "https://retn.net/news-events/retn-shortest-fibre-route-hamburg-frankfurt — RETN anunció el 4 de octubre de 2017 el lanzamiento de una ruta DWDM de fibra Frankfurt–Hamburg de 588.7 km."
  },
  {
    "nombre": "HBONE+ Budapest-Szeged corridor",
    "operador": "KIFU / HBONE+",
    "pais": "HU",
    "ciudades": ["Budapest", "Kecskemet", "Szeged"],
    "estado": "en servicio",
    "fuente": "https://compendium.geant.org/network-map — el Compendium oficial de GÉANT enlaza el mapa vigente de la NREN húngara; la topología muestra el eje Budapest–Kecskemet–Szeged."
  },
  {
    "nombre": "HEAnet Dublin-Cork backbone",
    "operador": "HEAnet",
    "pais": "IE",
    "ciudades": ["Dublin", "Cork"],
    "estado": "en servicio",
    "fuente": "https://www.heanet.ie/the-network — HEAnet declara un backbone nacional de más de 2,500 km de fibra y fibra oscura entre las principales ciudades; https://www.heanet.ie/news/bridging-the-network-divide documenta la extensión de la nueva ruta GÉANT desde Dublin hasta Cork."
  },
  {
    "nombre": "GARR north-south mainland backbone",
    "operador": "GARR",
    "pais": "IT",
    "ciudades": ["Milan", "Bologna", "Florence", "Rome", "Naples"],
    "estado": "en servicio",
    "fuente": "https://www.garr.it/en/infrastructures/network-infrastructure/our-network — GARR publica su red nacional de más de 24,000 km, casi enteramente sobre fibra gestionada directamente, y el mapa del backbone muestra el eje Milan–Bologna–Florence–Rome–Naples."
  },
  {
    "nombre": "Eurofiber Rotterdam-Frankfurt",
    "operador": "Eurofiber",
    "pais": "NL",
    "ciudades": ["Rotterdam", "Frankfurt am Main"],
    "estado": "en servicio",
    "fuente": "https://www.eurofiber.com/unique-long-haul-fiber-routes-2026 — Eurofiber presenta sus rutas Long Haul en servicio entre grandes hubs; su comunicación de la ruta Rotterdam–Frankfurt la describe como un trayecto de fibra oscura de aproximadamente 635 km."
  },
  {
    "nombre": "PIONIER Poznan-Warsaw",
    "operador": "PIONIER / PSNC",
    "pais": "PL",
    "ciudades": ["Poznan", "Warsaw"],
    "estado": "en servicio",
    "fuente": "https://pionier.net.pl/en/about-pionier/ — PIONIER publica su mapa y declara 8,504 km de fibra, de los que 6,878 km están en Poland; Poznan y Warsaw forman parte del backbone óptico nacional."
  },
  {
    "nombre": "RCTS Lisbon-Porto spine",
    "operador": "FCCN/FCT - RCTS",
    "pais": "PT",
    "ciudades": ["Lisbon", "Coimbra", "Porto"],
    "estado": "en servicio",
    "fuente": "https://compendium.geant.org/network-map — el directorio oficial de GÉANT enlaza el mapa actual de la NREN portuguesa; su eje terrestre principal une Lisbon, Coimbra y Porto."
  },
  {
    "nombre": "SANET west-east backbone",
    "operador": "SANET",
    "pais": "SK",
    "ciudades": ["Bratislava", "Trnava", "Trencin", "Zilina", "Poprad", "Kosice"],
    "estado": "en servicio",
    "fuente": "https://compendium.geant.org/network-map — el Compendium oficial de GÉANT enlaza la topología vigente de SANET; el backbone oeste-este atraviesa los nodos Bratislava–Trnava–Trencin–Zilina–Poprad–Kosice."
  },
  {
    "nombre": "RedIRIS Madrid-Barcelona corridor",
    "operador": "RedIRIS",
    "pais": "ES",
    "ciudades": ["Madrid", "Zaragoza", "Barcelona"],
    "estado": "en servicio",
    "fuente": "https://www.rediris.es/lared/mapa.html.es — mapa oficial de infraestructura RedIRIS actualizado el 16/12/2024, que muestra el corredor Madrid–Zaragoza–Barcelona."
  },
  {
    "nombre": "RedIRIS Mediterranean southeast corridor",
    "operador": "RedIRIS",
    "pais": "ES",
    "ciudades": ["Madrid", "Valencia", "Alicante", "Murcia"],
    "estado": "en servicio",
    "fuente": "https://www.rediris.es/lared/mapa.html.es — mapa oficial de infraestructura RedIRIS actualizado el 16/12/2024, con la ruta terrestre desde Madrid hacia Valencia, Alicante y Murcia."
  },
  {
    "nombre": "Switch LAN Lake Geneva-Zurich-St Gallen backbone",
    "operador": "SWITCH",
    "pais": "CH",
    "ciudades": ["Geneva", "Lausanne", "Bern", "Zurich", "St. Gallen"],
    "estado": "en servicio",
    "fuente": "https://www.switch.ch/en/network/ip-access — SWITCH declara unos 3,100 km de fibra y publica el mapa de su backbone fechado en febrero de 2026."
  },
  {
    "nombre": "GÉANT-Janet London-Manchester",
    "operador": "GÉANT / Jisc Janet",
    "pais": "GB",
    "ciudades": ["London", "Manchester"],
    "estado": "en servicio",
    "fuente": "https://www.heanet.ie/news/bridging-the-network-divide — GÉANT y HEAnet documentan la ruta completada London–Manchester–Dublin–Cork; London–Manchester es el segmento terrestre británico."
  },
  {
    "nombre": "GlobalConnect Jutland backbone",
    "operador": "GlobalConnect",
    "pais": "DK",
    "ciudades": ["Aarhus", "Aalborg"],
    "estado": "en servicio",
    "fuente": "https://globalconnectcarrier.com/our-network/ — GlobalConnect publica su red actual de fibra entre los principales hubs y ciudades del norte de Europa; el corredor Aarhus–Aalborg es terrestre."
  },
  {
    "nombre": "EENet Tallinn-Tartu",
    "operador": "EENet",
    "pais": "EE",
    "ciudades": ["Tallinn", "Tartu"],
    "estado": "en servicio",
    "fuente": "https://www.eenet.ee/EENet/EENet_en — EENet, unidad de infraestructura del Ministerio de Educación e Investigación de Estonia, opera la infraestructura nacional de educación e investigación; la cartografía UIT clasifica el corredor Tallinn–Tartu como transmisión óptica terrestre."
  },
  {
    "nombre": "Funet Helsinki-Oulu spine",
    "operador": "CSC / Funet",
    "pais": "FI",
    "ciudades": ["Helsinki", "Tampere", "Oulu"],
    "estado": "en servicio",
    "fuente": "https://csc.fi/en/our-expertise/funet-a-network-for-research-and-education/ — CSC confirma la operación de Funet como red nacional de investigación; el mapa Funet vigente enlazado por GÉANT representa el eje Helsinki–Tampere–Oulu."
  },
  {
    "nombre": "Mila Reykjavik-Akureyri terrestrial trunk",
    "operador": "Mila",
    "pais": "IS",
    "ciudades": ["Reykjavik", "Akureyri"],
    "estado": "en servicio",
    "fuente": "https://bbmaps.itu.int/bbmaps/ — el mapa oficial de transmisión de la UIT distingue la ruta óptica terrestre islandesa de las conexiones submarinas y muestra el corredor principal Reykjavik–Akureyri."
  },
  {
    "nombre": "LVRTC west-east backbone",
    "operador": "LVRTC",
    "pais": "LV",
    "ciudades": ["Ventspils", "Riga", "Daugavpils"],
    "estado": "en servicio",
    "fuente": "https://www.lvrtc.lv/en/broadband/ — LVRTC declara y cartografía una extensa red troncal de fibra óptica nacional; sus nodos de infraestructura incluyen Ventspils, Riga y Daugavpils."
  },
  {
    "nombre": "LITNET Klaipeda-Vilnius spine",
    "operador": "LITNET",
    "pais": "LT",
    "ciudades": ["Klaipeda", "Kaunas", "Vilnius"],
    "estado": "en servicio",
    "fuente": "https://litnet.lt/en/about-litnet/ — LITNET confirma que opera la red nacional de investigación y educación; su topología vigente enlazada por GÉANT muestra el eje Klaipeda–Kaunas–Vilnius."
  },
  {
    "nombre": "GlobalConnect Oslo-Trondheim",
    "operador": "GlobalConnect",
    "pais": "NO",
    "ciudades": ["Oslo", "Trondheim"],
    "estado": "en servicio",
    "fuente": "https://globalconnectcarrier.com/our-network/ — el mapa actual de GlobalConnect muestra su infraestructura terrestre de fibra de larga distancia entre los principales hubs nórdicos, incluido el eje Oslo–Trondheim."
  },
  {
    "nombre": "SUNET northern spine",
    "operador": "SUNET",
    "pais": "SE",
    "ciudades": ["Stockholm", "Sundsvall", "Umea", "Lulea", "Kiruna"],
    "estado": "en servicio",
    "fuente": "https://www.vr.se/english/mandates/research-infrastructure/sunet.html — el Swedish Research Council declara que SUNET dispone de 113 nodos, 126 secciones de fibra y más de 8,000 km; el backbone nacional incluye el eje hacia el extremo norte."
  },
  {
    "nombre": "GCN Sofia-Burgas backbone",
    "operador": "GCN",
    "pais": "BG",
    "ciudades": ["Sofia", "Plovdiv", "Stara Zagora", "Burgas"],
    "estado": "en servicio",
    "fuente": "https://www.gcn.bg/GCN_bg_backbone_en.html — GCN afirma poseer y operar un backbone nacional de más de 3,100 km de líneas de fibra y publica el mapa de la red óptica búlgara."
  },
  {
    "nombre": "CARNET Zagreb-Dubrovnik",
    "operador": "CARNET",
    "pais": "HR",
    "ciudades": ["Zagreb", "Dubrovnik"],
    "estado": "en servicio",
    "fuente": "https://www.carnet.hr/carnet-infrastructure/ — CARNET opera la infraestructura nacional; su informe 2023 enumera explícitamente la mejora del enlace interurbano Zagreb–Dubrovnik."
  },
  {
    "nombre": "CARNET Zagreb-Vukovar",
    "operador": "CARNET",
    "pais": "HR",
    "ciudades": ["Zagreb", "Vukovar"],
    "estado": "en servicio",
    "fuente": "https://www.carnet.hr/carnet-infrastructure/ — CARNET opera la infraestructura nacional; el informe 2023 identifica el enlace backbone Zagreb–Vukovar entre los enlaces actualizados."
  },
  {
    "nombre": "CARNET Zagreb-Pula",
    "operador": "CARNET",
    "pais": "HR",
    "ciudades": ["Zagreb", "Pula"],
    "estado": "en servicio",
    "fuente": "https://www.carnet.hr/carnet-infrastructure/ — CARNET opera la infraestructura nacional; el informe 2023 identifica expresamente la actualización del enlace Zagreb–Pula."
  },
  {
    "nombre": "CARNET Split-Dubrovnik",
    "operador": "CARNET",
    "pais": "HR",
    "ciudades": ["Split", "Dubrovnik"],
    "estado": "en servicio",
    "fuente": "https://www.carnet.hr/carnet-infrastructure/ — CARNET opera la infraestructura nacional y su informe 2023 enumera el enlace interurbano Split–Dubrovnik entre los enlaces backbone mejorados."
  },
  {
    "nombre": "GRNET Athens-Thessaloniki backbone",
    "operador": "GRNET",
    "pais": "GR",
    "ciudades": ["Athens", "Thessaloniki"],
    "estado": "en servicio",
    "fuente": "https://grnet.gr/wp-content/uploads/2025/03/Core-long_EN.pdf — la presentación institucional 2025 de GRNET documenta su infraestructura nacional y topología backbone; Athens–Thessaloniki constituye el principal eje continental."
  },
  {
    "nombre": "RETN Romania east-west backbone",
    "operador": "RETN",
    "pais": "RO",
    "ciudades": ["Drobeta-Turnu Severin", "Bucharest", "Iasi"],
    "estado": "en servicio",
    "fuente": "https://retn.net/news-events/RETN-Launches-New-Cross-Romania-Moldova-Ukraine-Route — RETN anunció el 7 de mayo de 2026 el lanzamiento de una ruta backbone continua Drobeta–Bucharest–Iasi–Chisinau."
  },
  {
    "nombre": "AMRES Belgrade-Nis backbone",
    "operador": "AMRES",
    "pais": "RS",
    "ciudades": ["Belgrade", "Nis"],
    "estado": "en servicio",
    "fuente": "https://www.amres.ac.rs/en/amres/amres-infrastructure — AMRES describe su backbone como una red de enlaces ópticos interurbanos entre sus PoP; Belgrade–Nis es uno de sus ejes nacionales de larga distancia."
  },
  {
    "nombre": "ARNES Ljubljana-Maribor backbone",
    "operador": "ARNES",
    "pais": "SI",
    "ciudades": ["Ljubljana", "Celje", "Maribor"],
    "estado": "en servicio",
    "fuente": "https://www.arnes.si/en/infrastructure/ — ARNES confirma que sus nodos backbone se interconectan mediante fibra arrendada y se organizan en bucles ópticos; el eje Ljubljana–Celje–Maribor forma parte de esa infraestructura."
  },
  {
    "nombre": "RETN-Beltelecom Belarus transit route",
    "operador": "RETN / Beltelecom",
    "pais": "BY",
    "ciudades": ["Moscow", "Minsk", "Berlin", "Frankfurt am Main"],
    "estado": "en servicio",
    "fuente": "https://retn.net/cn/news-events/retn-and-beltelecom-completed-a-new-transit-route-across-belarus — RETN y Beltelecom anunciaron en 2019 la finalización de un nuevo corredor DWDM por Belarus; la nota especifica Moscow–Minsk y Moscow–Frankfurt via Berlin."
  },
  {
    "nombre": "RETN Iasi-Chisinau",
    "operador": "RETN",
    "pais": "MD",
    "ciudades": ["Iasi", "Chisinau"],
    "estado": "en servicio",
    "fuente": "https://retn.net/news-events/RETN-Launches-New-Cross-Romania-Moldova-Ukraine-Route — RETN puso en servicio en mayo de 2026 el nuevo backbone continuo Drobeta–Bucharest–Iasi–Chisinau; Iasi–Chisinau es su tramo terrestre de acceso a Moldova."
  },
  {
    "nombre": "Rostelecom national transcontinental backbone",
    "operador": "Rostelecom",
    "pais": "RU",
    "ciudades": ["Moscow", "Nizhny Novgorod", "Kazan", "Yekaterinburg", "Novosibirsk", "Krasnoyarsk", "Irkutsk", "Khabarovsk", "Vladivostok"],
    "estado": "en servicio",
    "fuente": "https://www.company.rt.ru/en/about/net/ — Rostelecom declara un backbone digital de aproximadamente 500,000 km basado en enlaces de fibra SDH/DWDM y con alcance a toda la Russian Federation; la secuencia corresponde al principal corredor transcontinental de su topología."
  },
  {
    "nombre": "RETN Lutsk-Monastyryshche",
    "operador": "RETN",
    "pais": "UA",
    "ciudades": ["Lutsk", "Monastyryshche"],
    "estado": "en servicio",
    "fuente": "https://retn.net/about — en su cronología corporativa vigente RETN indica que durante 2022–2023 desarrolló la ruta Lutsk–Monastyrysche para proporcionar un camino redundante de Ukraine hacia Europe."
  }
]
```
