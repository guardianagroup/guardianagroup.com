# Ronda 22 · ChatGPT, Investigación avanzada (deep research) · troncales terrestres de Oceanía y la Antártida

**Pregunta** (enviada tal cual en un chat nuevo de chatgpt.com con la herramienta «Investigación avanzada» activada, el 24 de octubre de 2026; no hizo preguntas aclaratorias; propuso un plan con cuenta atrás y se pulsó «Empezar» sin editarlo; según ChatGPT, «Investigación completada en 6m · 39 citas · 259 búsquedas»):

> Investigación profunda, en español: para TODOS los países de Oceanía y la Antártida (AU, NZ, PG, FJ, SB, VU, NC, PF, WS, TO, FM, KI, MH, PW y la Antártida), documenta las principales rutas troncales de fibra óptica TERRESTRE de larga distancia (más de 100 km) que estén en servicio hoy, como listas ORDENADAS de las ciudades por las que pasan, con el operador, el año y la fuente primaria (operador, regulador, Banco Mundial, UIT, bancos de desarrollo, ONU u otra fuente oficial). Da prioridad a las zonas difíciles: conflictos, zonas remotas, islas y desiertos. Distingue bien lo que está en servicio de lo que está en proyecto, en construcción, destruido o funcionando por radioenlaces y no por fibra. No uses submarinecablemap.com, TeleGeography ni PeeringDB. Como mucho unas 8 rutas por país, las más importantes. Al final del informe, pon un único bloque JSON (un array) con solo las rutas en servicio, con objetos así: {"nombre": "...", "operador": "...", "pais": "código ISO alfa-2", "ciudades": ["Ciudad A", "Ciudad B"], "estado": "en servicio", "fuente": "URL y lo que dice"}, con nombres de ciudades en inglés como en GeoNames. Para la Antártida, explica si existe fibra óptica terrestre entre bases o algún cable submarino que llegue, y cómo se conectan hoy las bases (satélite, radioenlaces), con fuentes.

Informe copiado sin editar del documento del informe que guarda la propia página (Archivos del chat). Las marcas internas de cita de ChatGPT se han sustituido por el enlace Markdown que el propio ChatGPT da para cada una; el resto del texto es literal.

---

# Rutas troncales terrestres de fibra óptica de larga distancia en Oceanía y la Antártida

## Criterio, alcance y nivel de certeza

El inventario se limita a **fibra óptica terrestre de larga distancia, con un recorrido superior a 100 km, y que esté en servicio a 24 de octubre de 2026**. No cuento como ruta terrestre los cables submarinos entre islas, los enlaces de microondas, VSAT/LEO, redes FTTH locales ni proyectos anunciados pero aún no operativos. Tampoco he usado SubmarineCableMap, TeleGeography ni PeeringDB como fuentes.

En varios pequeños Estados insulares, el resultado correcto es **“0 rutas calificadas verificadas”**, no porque no haya fibra en absoluto, sino porque las fuentes primarias muestran fibra de acceso/local, cables submarinos o radioenlaces, y no documentan una ruta terrestre continua de más de 100 km. Esa distinción es especialmente importante en Samoa, Kiribati, Micronesia, Islas Salomón y la Antártida. En Australia y Nueva Zelanda, donde la red es extensa, he priorizado corredores para los que el operador o una entidad pública permite reconstruir razonablemente el recorrido; no convierto una simple línea estilizada de un mapa comercial en una secuencia de ciudades no respaldada por la fuente.

Para el campo **“año”**, uso el año de puesta en servicio cuando está publicado. Cuando la fuente primaria sólo da un hito posterior —por ejemplo una gran ampliación de capacidad— lo indico explícitamente en vez de inventar la fecha original de RFS.

## Australia y Nueva Zelanda

### Australia — AU

Australia es, con mucha diferencia, el país del conjunto con más fibra troncal terrestre interurbana verificable. Vocus declara una red nacional de aproximadamente 51.000 km que conecta capitales, centros regionales y zonas remotas; además, su red intercapital conecta todas las capitales continentales. ([vocus.com.au](https://www.vocus.com.au/about-vocus/our-network/australia?utm_source=chatgpt.com))

| Ruta troncal en servicio | Ciudades, en orden | Operador | Año verificable | Evidencia primaria |
|---|---|---|---|---|
| **Project Horizon** | **Perth → Geraldton → Meekatharra → Newman → Port Hedland** | Vocus | **2026** | Vocus encendió la red extremo a extremo en junio de 2026. La describe como 2.000 km de fibra Perth–Port Hedland, por el Mid West y Pilbara; su ficha actual identifica expresamente Geraldton, Meekatharra y Newman como nodos del corredor. ([vocus.com.au](https://www.vocus.com.au/news/vocus-lights-up-horizon?utm_source=chatgpt.com)) |
| **Sydney–Melbourne** | **Sydney → Melbourne** | Vocus | **2001–2003** | Una historia corporativa de Vocus sitúa la construcción inicial de las rutas Melbourne–Sydney y Melbourne–Adelaide en 2001–2003; ambas forman hoy parte de la red troncal nacional en servicio. ([vocus.com.au](https://www.vocus.com.au/about-vocus/careers/why-work-for-us/stories/Rocky-Cartelli?utm_source=chatgpt.com)) |
| **Melbourne–Adelaide** | **Melbourne → Adelaide** | Vocus | **2001–2003** | Misma construcción inicial documentada por el operador y continuidad dentro del backbone nacional actual. ([vocus.com.au](https://www.vocus.com.au/about-vocus/careers/why-work-for-us/stories/Rocky-Cartelli?utm_source=chatgpt.com)) |
| **Terabit Territory, eje Darwin–Adelaide** | **Darwin → Adelaide** | Vocus | **≤2021; gran upgrade en 2021** | Vocus identifica expresamente su “Terabit Territory intercapital fibre backbone from Darwin to Adelaide and Brisbane” y dice que lo amplió en 2021 con un aumento de capacidad de 25 veces. ([vocus.com.au](https://www.vocus.com.au/news/darwins-first-international-data-connection-goes-live?utm_source=chatgpt.com)) |
| **Terabit Territory, eje Darwin–Brisbane** | **Darwin → Brisbane** | Vocus | **≤2021; gran upgrade en 2021** | La misma fuente del operador confirma el troncal desde Darwin hacia Brisbane y Adelaide; no publica en esa página la fecha RFS original, por lo que 2021 debe interpretarse como año de ampliación, no de construcción inicial. ([vocus.com.au](https://www.vocus.com.au/news/darwins-first-international-data-connection-goes-live?utm_source=chatgpt.com)) |

**Zona difícil destacada — Mid West/Pilbara.** Horizon es el caso más claro de una nueva ruta terrestre de 2026 por un territorio remoto, árido y expuesto a ciclones, inundaciones y calor extremo. Vocus dice que la fibra se enterró hasta aproximadamente un metro y que los equipos de transmisión remotos se alojan en bóvedas ambientales con energía solar/baterías donde no hay red eléctrica. ([vocus.com.au](https://www.vocus.com.au/news/vocus-lights-up-horizon?utm_source=chatgpt.com)) El trazado más detallado publicado por un primer cliente de la red añade **Mullewa** y **Cue** entre Geraldton y Meekatharra; sin embargo, para el bloque final mantengo la secuencia más conservadora que aparece directamente en la ficha del operador. ([hancockprospecting.com.au](https://www.hancockprospecting.com.au/minings-new-workforce-bargain/?utm_source=chatgpt.com))

También sigue en servicio la infraestructura del **Regional Backbone Blackspots Program (RBBP)**: Vocus/Nextgen construyó cerca de 6.000 km de nueva fibra con DWDM hacia zonas desatendidas como Geraldton, Darwin, Emerald/Longreach, Broken Hill, Victor Harbor y South West Gippsland; la obra empezó en febrero de 2010, se terminó en unos 18 meses y Vocus sigue ofreciendo servicios RBBP. ([vocus.com.au](https://www.vocus.com.au/about-vocus/our-network/australia/regional-backbone-blackspots-program?utm_source=chatgpt.com)) No he convertido cada ramal RBBP en una ruta independiente en el JSON porque la fuente pública actual identifica destinos y puntos de servicio, pero no proporciona para todos ellos una secuencia textual suficientemente precisa de ciudades intermedias.

**No confundir con proyectos de 2026.** La nueva plataforma ADIP de Vocus, incluido el nuevo Sydney–Melbourne ducted route y el anunciado Brisbane–Darwin, es infraestructura futura: el nuevo Sydney–Melbourne está previsto para servicio en **2029**, por lo que no debe mezclarse con el Sydney–Melbourne histórico actualmente operativo. ([vocus.com.au](https://www.vocus.com.au/news/%24100m-vocus-cable-splashes-down-in-indian-ocean?utm_source=chatgpt.com))

### Nueva Zelanda — NZ

REANNZ, empresa de la Corona, opera la red nacional de investigación y educación. Su informe 2025 la describe como un backbone nacional que cubre también ubicaciones rurales y remotas; en junio de 2025 había terminado la renovación de la plataforma de routing en 28 PoP y mantenía **100 Gbps de capacidad troncal nacional**. ([reannz.co.nz](https://www.reannz.co.nz/assets/Uploads/Annual-Reports/REANNZ-Annual-Report-311025-DIGI.pdf)) El mapa oficial 2025 muestra dos ejes longitudinales de alta capacidad, aunque advierte que sus líneas son indicativas y no representan la ruta física exacta. ([reannz.co.nz](https://www.reannz.co.nz/assets/Uploads/Annual-Reports/REANNZ-Annual-Report-311025-DIGI.pdf))

REANNZ no debe interpretarse necesariamente como dueño de cada hilo físico: sus informes explican que la red se construye sobre **servicios comerciales de transmisión óptica**; la fase de nueva conectividad nacional se completó en abril de 2023 con One NZ como nuevo socio. ([reannz.co.nz](https://www.reannz.co.nz/assets/Uploads/Annual-Reports/2021-REANNZ-Annual-Report.pdf?utm_source=chatgpt.com))

| Ruta troncal en servicio | Ciudades, en orden | Operador de red | Año verificable | Evidencia primaria |
|---|---|---|---|---|
| **REANNZ South Island backbone** | **Invercargill → Dunedin → Christchurch** | REANNZ, sobre transporte óptico comercial | **2019, upgrade nacional; vigente en 2025** | REANNZ informó en 2019 que había completado la actualización del backbone que se extiende desde Invercargill hasta Northland y que el camino principal de South Island desde Dunedin operaba a 100 Gbps; el mapa de 2025 conserva el eje troncal de South Island. ([reannz.co.nz](https://www.reannz.co.nz/assets/Uploads/Annual-Reports/2019-REANNZ-Annual-Report_FINAL.pdf?utm_source=chatgpt.com)) |
| **REANNZ North Island backbone, eje principal** | **Wellington → Palmerston North → Hamilton → Auckland → Mangawhai** | REANNZ, sobre transporte óptico comercial | **2019, upgrade; vigente en 2025** | En 2019 REANNZ confirmó que ambos lados de su red North Island funcionaban a 100 Gbps y que se había añadido una segunda conexión Hamilton–Wellington; documentos de REANNZ identifican PoP en Palmerston North, y el mapa oficial actual mantiene el backbone hacia Auckland y el extremo norte. ([reannz.co.nz](https://www.reannz.co.nz/assets/Uploads/Annual-Reports/2019-REANNZ-Annual-Report_FINAL.pdf?utm_source=chatgpt.com)) |

No he unido Christchurch y Wellington en una sola “ruta terrestre”: cualquier continuidad entre South Island y North Island cruza Cook Strait mediante infraestructura submarina, por lo que, bajo la definición solicitada, es más correcto separar los segmentos terrestres de ambas islas.

## Melanesia

### Papúa Nueva Guinea — PG

**Resultado: 0 rutas terrestres >100 km que pueda certificar como fibra continua en servicio con una fuente primaria actual.** Esto es un resultado importante, porque una lectura superficial de “national backbone” llevaría fácilmente a clasificar radioenlaces como fibra.

El **PNG Telecommunications Blueprint**, publicado por el Department of Information and Communications Technology en octubre de 2026, dice que el corredor de **Momase hacia Madang y Lae es actualmente principalmente un corredor terrestre de microondas**, y añade expresamente que los tramos candidatos a futura fibra todavía no han sido implementados. Para las islas, describe partes de New Britain enlazadas mediante una **larga cadena de microondas**, con New Ireland y Manus sin una fuerte conexión terrestre al mainland. ([ict.gov.pg](https://www.ict.gov.pg/wp-content/uploads/2026/10/PNG-Telecommunications-Blueprint-Final-Document-v19-1.pdf))

La misma fuente señala que en Highlands la fibra es una inversión de largo plazo a considerar y que existen “missing links”; es decir, no autoriza a reinterpretar toda la cadena Hela/Southern Highlands–Mount Hagen–Goroka–Lae como fibra. ([ict.gov.pg](https://www.ict.gov.pg/wp-content/uploads/2026/10/PNG-Telecommunications-Blueprint-Final-Document-v19-1.pdf)) El Blueprint distingue explícitamente fibra, microwave y LEO como tecnologías diferentes para cerrar los huecos del backbone. ([ict.gov.pg](https://www.ict.gov.pg/wp-content/uploads/2026/10/PNG-Telecommunications-Blueprint-Final-Document-v19-1.pdf))

Por ello he excluido de la lista de fibra tanto el corredor costero de Momase como la cadena insular y los tramos cuya tecnología no está inequívocamente identificada como fibra operativa.

### Fiji — FJ

Fiji sí tiene dos corredores que superan el filtro con evidencia razonablemente sólida.

| Ruta troncal en servicio | Ciudades, en orden | Operador | Año | Evidencia primaria |
|---|---|---|---|---|
| **Savusavu–Labasa Fibre Project** | **Savusavu → Seaqaqa → Labasa** | Telecom Fiji | **2025** | Telecom Fiji confirmó el 24 de marzo de 2025 la finalización del proyecto: un enlace terrestre subterráneo de **102 km**, desde Savusavu, pasando por Seaqaqa, hasta Labasa. En 2026 lo describió como un backbone permanente y resistente al clima que redujo dependencia de microondas. ([telecom.com.fj](https://www.telecom.com.fj/telecom-fiji-knowledge/telecom-fiji-completes-savusavu-to-labasa-fibre-project-strengthening-connectivity-in-the-north/?utm_source=chatgpt.com)) |
| **Queen's Road fibre corridor** | **Suva → Navua → Sigatoka → Nadi → Lautoka** | Telecom Fiji | **≤2018 documentado en servicio** | Telecom Fiji informó en 2018 que su red óptica existente superaba 1.500 km y cubría principalmente el **Queen's Road corridor**; la secuencia indicada sigue el corredor principal de ciudades del eje sur-occidental de Viti Levu. ([telecom.com.fj](https://www.telecom.com.fj/telecom-fiji-knowledge/telecom-fiji-rolls-out-fiber-to-the-home-ftth-and-expands-fiber-network-coverage-throughout-fiji/?utm_source=chatgpt.com)) |

El nuevo Savusavu–Labasa es especialmente relevante porque **antes el norte dependía mucho más de microondas**: Telecom Fiji describe el nuevo trazado subterráneo como una mejora de resiliencia de Vanua Levu y señala operación óptica inicialmente a 10 Gbps, posteriormente escalada a 100 Gbps. ([telecom.com.fj](https://www.telecom.com.fj/telecom-fiji-knowledge/telecom-fiji-wins-infrastructure-initiative-of-the-year-at-asian-telecom-awards-2026/?utm_source=chatgpt.com))

Como control del umbral, el ramal **Rakiraki–Korovou**, aunque es fibra terrestre en servicio, fue descrito por el operador como de aproximadamente **90 km**, de modo que queda fuera de este inventario por no superar 100 km. ([telecom.com.fj](https://www.telecom.com.fj/telecom-fiji-knowledge/telecom-fiji-rolls-out-fiber-to-the-home-ftth-and-expands-fiber-network-coverage-throughout-fiji/?utm_source=chatgpt.com))

### Islas Salomón — SB

**Resultado: 0 rutas terrestres >100 km verificadas.** Our Telekom ofrece fibra de distribución en **Honiara, Auki, Noro y Taro**, pero eso no demuestra una ruta terrestre continua que una esas ciudades: están repartidas entre distintas islas. ([ourtelekom.com.sb](https://www.ourtelekom.com.sb/business/business-broadband/?utm_source=chatgpt.com))

La propia compañía explica que Taro/Noro y Gizo/Munda recibieron conectividad de fibra mediante el **sistema submarino doméstico**, mientras Honiara/Guadalcanal y Malaita también se enlazan al sistema submarino. ([ourtelekom.com.sb](https://www.ourtelekom.com.sb/western-solomons-now-on-fibre-optic-cable/?utm_source=chatgpt.com)) Cuando ese sistema sufrió daños, Our Telekom documentó desvíos mediante **satélite y microondas**, evidencia adicional de que esos saltos insulares no son rutas terrestres de fibra. ([ourtelekom.com.sb](https://www.ourtelekom.com.sb/telekom-restores-services-and-ensures-ongoing-service-restoration-efforts/?utm_source=chatgpt.com))

### Vanuatu — VU

**Resultado: 0 rutas terrestres >100 km verificadas en fuente primaria.** La documentación oficial de inversión de Vanuatu identifica como infraestructuras fundamentales el e-government broadband network y el **cable submarino de fibra**, operativo desde enero de 2014. ([investvanuatu.vu](https://investvanuatu.vu/industries/information-and-communication-technology/?utm_source=chatgpt.com)) La documentación del regulador, al describir el diseño del acceso nacional, señala que gran parte de la extensión hacia usuarios/islas se planteaba mediante tecnología inalámbrica enlazada a los backbones y, cuando eso no fuera posible, mediante satélite. ([trbr.vu](https://www.trbr.vu/attachments/article/333/challenges_facing_vanuatu_in_assuring_universal_access_to_communications_services.pdf?utm_source=chatgpt.com))

Esto no significa que Vanuatu carezca de fibra terrestre local; significa que no localicé una fuente primaria que permita afirmar una **ruta terrestre continua de más de 100 km, con ciudades ordenadas**, sin mezclar fibra, radio y tramos submarinos.

### Nueva Caledonia — NC

**Resultado: 0 rutas >100 km incorporadas con el estándar de prueba exigido.** OPT-NC documenta FTTH en numerosas communes a lo largo de Grande Terre —entre ellas Nouméa, Dumbéa, Mont-Dore, Païta, La Foa, Bourail, Koné, Koumac, Poindimié, Pouembout y otras—, lo que confirma una implantación territorial amplia de fibra de acceso. ([office.opt.nc](https://office.opt.nc/fr/actualites/fibre-optique-cap-du-50-000eme-client-fibre-atteint?utm_source=chatgpt.com)) OPT también mantiene centros técnicos en Bourail, Canala, Houaïlou, Koumac, La Foa, Poindimié, Pouembout y Koné. ([office.opt.nc](https://office.opt.nc/fr/nous-connaitre/domaines-d-activites/telecommunications/centres-techniques?utm_source=chatgpt.com))

Sin embargo, esas fuentes no son suficientes por sí solas para afirmar que la secuencia **Nouméa–Païta–La Foa–Bourail–Koné–Koumac** sea un único troncal óptico terrestre continuo de larga distancia. Como el encargo exige separar acceso de backbone, no lo añado al JSON.

## Polinesia

### Polinesia Francesa — PF

**Resultado: 0 rutas terrestres >100 km verificadas.** La Direction générale de l'économie documentó que Nuku Hiva y Hiva Oa se conectaron directamente mediante el sistema **submarino Natitua**, que Taiohae y Atuona recibieron FTTH local, y que otras islas del archipiélago se integraron mediante enlaces de **faisceaux hertziens/microondas** modernizados. ([service-public.pf](https://www.service-public.pf/dgen/category/actualites-2/page/4/?utm_source=chatgpt.com))

La combinación “submarino entre islas + FTTH local + radioenlaces” no equivale a un troncal terrestre >100 km, por lo que no he agregado ninguna ruta de PF.

### Samoa — WS

**Resultado: 0 rutas terrestres >100 km en servicio verificadas; gran parte del backhaul fuera de Apia sigue siendo microondas.** El documento de proyecto del Banco Mundial para *Digitally Connected and Resilient Samoa* afirma que ampliar la fibra fija **más allá de Apia**, tanto en Upolu como en Savai'i, es todavía una necesidad. Según la actualización del MCIT utilizada por el Banco Mundial, sólo alrededor del **30 % de las torres celulares** estaban conectadas por fibra, principalmente alrededor del centro de Apia, mientras el resto dependía de microondas. ([documents.worldbank.org](https://documents.worldbank.org/curated/en/099093024135596945/pdf/BOSIB15001ec5e06b1a71c1222b66294a4f.pdf))

La misma fuente describe el Samoa National Broadband Highway como la intranet gubernamental que conecta agencias críticas **dentro de Apia** y trata la extensión del actual sistema de fibra como parte de las inversiones futuras. ([documents.worldbank.org](https://documents.worldbank.org/curated/en/099093024135596945/pdf/BOSIB15001ec5e06b1a71c1222b66294a4f.pdf)) Por tanto, no es correcto convertir la cobertura móvil nacional de Samoa en una supuesta ruta nacional de fibra.

### Tonga — TO

**Resultado: 0 rutas terrestres >100 km verificadas.** Fuentes del Banco Mundial documentan el cable de 827 km Tonga–Fiji como **submarino**. ([worldbank.org](https://www.worldbank.org/en/news/press-release/2013/08/21/high-speed-broadband-goes-live-in-tonga?utm_source=chatgpt.com)) Otra documentación sectorial señala una infraestructura óptica de backbone en Tongatapu, pero los enlaces de larga distancia hacia Vava'u y Ha'apai se realizan mediante cable submarino doméstico, no mediante una carretera terrestre de fibra. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/473751557713173311/pdf/Tonga-Digital-Government-Support-Project.pdf?utm_source=chatgpt.com))

Dado que no encontré una ruta terrestre de Tongatapu cuya longitud documentada supere los 100 km, no la fuerzo dentro del umbral.

## Micronesia

### Estados Federados de Micronesia — FM

**Resultado: 0 rutas terrestres >100 km verificadas.** La documentación más reciente del Banco Mundial, de 2026, trata la continuación del despliegue de fibra en **Pohnpei, Yap y Kosrae** como despliegues insulares/locales, no como un troncal terrestre que atraviese el país. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099082426054041050/pdf/P518944-5a595caf-3bb8-4025-bb38-137533e11d23.pdf?utm_source=chatgpt.com)) Fuentes de FSM Telecommunications describen la infraestructura FTTH de Yap y la conectividad externa/interinsular mediante sistemas submarinos. ([fsmtc.fm](https://www.fsmtc.fm/sites/default/files/files/Yap%20%20FTTH%20%20RFP%282%29.pdf?utm_source=chatgpt.com))

Por tanto, aun existiendo FTTH y fibra de acceso en varios estados, no hay una ruta terrestre continua >100 km suficientemente documentada para el inventario.

### Kiribati — KI

**Resultado: 0 rutas terrestres >100 km en servicio.** El plan ministerial 2025–2028 es especialmente claro: BwebwerikiNet gestiona/planifica FTTP en **South Tarawa**, los sistemas submarinos Southern Cross NEXT y East Micronesia Cable System, y el **Outer Islands Network**, que es infraestructura **inalámbrica**; el programa de acceso universal usa asimismo VSAT, Wi‑Fi y Starlink para comunidades remotas. ([mict.gov.ki](https://www.mict.gov.ki/sites/default/files/publications/MSP%202025-28_FINAL_19%20June%202025.pdf))

El propio plan todavía presenta varias obras —FTTH de Kiritimati/Tarawa, landing facilities y parte de los sistemas submarinos— como objetivos de construcción 2025–2028, con porcentajes de avance, de modo que tampoco deben confundirse con fibra terrestre de larga distancia ya operativa. ([mict.gov.ki](https://www.mict.gov.ki/sites/default/files/publications/MSP%202025-28_FINAL_19%20June%202025.pdf))

### Islas Marshall — MH

**Resultado: 0 rutas terrestres >100 km verificadas.** Las cuentas oficiales de la National Telecommunications Authority describen la gran inversión de fibra como el proyecto de cable que enlaza **Kwajalein y Majuro con Guam**; se trata de conectividad submarina, no de un troncal terrestre de >100 km. ([rmioag.com](https://www.rmioag.com/wp-content/uploads/2020/02/MINTA_fs18-Final-May-2-2019.pdf?utm_source=chatgpt.com)) La NTA mantiene instalaciones y servicios en Majuro y Ebeye, pero su información pública no documenta una ruta terrestre continua que cumpla el umbral. ([nta.mh](https://www.nta.mh/contact-us/?utm_source=chatgpt.com))

### Palau — PW

**Resultado: 0 rutas terrestres >100 km verificadas.** La página vigente de PNCC describe su red como conectada al mundo mediante el **international fiber optic cable** de Palau. ([pnccpalau.com](https://www.pnccpalau.com/business/internet?utm_source=chatgpt.com)) ADB documenta igualmente la conectividad de alta capacidad del país como resultado del proyecto regional de **cable submarino**. ([blogs.adb.org](https://blogs.adb.org/blog/new-fiber-optic-connection-brings-broadband-internet-palau?utm_source=chatgpt.com))

No encontré en las fuentes primarias una ruta terrestre interurbana continua >100 km con una secuencia publicable de ciudades; por tanto no convierto la presencia de fibra de acceso en Babeldaob/Koror en una ruta troncal larga.

## Antártida

Para **Antártida (AQ)**, la respuesta es distinta de la de cualquier país del Pacífico: **no hay una ruta terrestre de fibra óptica de >100 km entre bases que pueda documentarse como infraestructura troncal operativa, ni encontré un cable submarino de telecomunicaciones operativo que llegue actualmente al continente**.

La mejor evidencia oficial sobre el segundo punto es la propia NSF: su **Antarctic Subsea Science and Telecommunications Cable** sigue descrito como un **concepto cuya viabilidad se está explorando**, destinado eventualmente a conectar McMurdo Station con Invercargill o Sydney. La NSF emitió una RFI y habla de un sistema “proposed”; no de un cable listo para servicio. ([nsf.gov](https://www.nsf.gov/od/opp/ant/antarctic-subsea-cable?utm_source=chatgpt.com)) Por tanto, no debe representarse como una ruta existente.

Sí existe **fibra dentro de bases o instalaciones científicas**, pero son tramos locales. Por ejemplo, la Australian Antarctic Division documentó la instalación de fibra entre el operations building de Casey y el edificio ANARESAT. ([antarctica.gov.au](https://www.antarctica.gov.au/news/stations/casey/2013/this-week-at-casey-8-february-2013/?utm_source=chatgpt.com)) Eso no es una conexión entre estaciones y está muy por debajo del umbral de 100 km.

La conectividad fuera del continente sigue basándose fundamentalmente en **satélite**. El portal actual del U.S. Antarctic Program dice explícitamente que la infraestructura satelital es la que proporciona comunicaciones off-continent en las estaciones USAP; describe acceso satelital en McMurdo, ventanas limitadas de satélite en South Pole y conexión satelital de Palmer. ([usap.gov](https://www.usap.gov/technology/?utm_source=chatgpt.com)) Para la temporada **2026–2027**, USAP confirma además que el terminal Starlink de McMurdo continúa operativo después de aproximadamente dos años, usando enlaces inter-satélite para encaminar tráfico hacia un punto de acceso en Sydney. ([usap.gov](https://www.usap.gov/sciencesupport/scienceplanningsummaries/2026_2027/results.cfm?ID=1668&formAction=detail&utm_source=chatgpt.com))

Las estaciones australianas también han dependido de satélite: la Australian Antarctic Division describe ANARESAT y, específicamente para Davis, una antena que transmite hacia un satélite geoestacionario antes de regresar a una estación terrestre australiana. ([antarctica.gov.au](https://www.antarctica.gov.au/magazine/issue-2-spring-2001/feature/australia-continues-as-telecommunications-innovator/?utm_source=chatgpt.com))

En consecuencia, el esquema actual puede resumirse como **fibra/Ethernet local dentro de algunas bases + satélite para el backhaul de larga distancia + radio para comunicaciones operacionales/locales o de campo cuando corresponde**, pero no existe evidencia oficial de una malla fija de fibra terrestre interbase o de radioenlaces continentales que funcione como sustituto de un backbone de fibra. La única gran iniciativa de fibra hacia el continente localizada en las fuentes oficiales sigue siendo la propuesta submarina a McMurdo. ([nsf.gov](https://www.nsf.gov/od/opp/ant/antarctic-subsea-cable?utm_source=chatgpt.com))

## Resultado consolidado y JSON de rutas en servicio

Aplicando estrictamente el filtro de **más de 100 km + terrestre + fibra + actualmente en servicio + recorrido suficientemente verificable**, el conjunto sólido se concentra en **Australia, Nueva Zelanda y Fiji**. Los demás territorios del encargo tienen fibra local o metropolitana, submarina, despliegues aún en curso o una dependencia importante de microondas/satélite, pero no una ruta terrestre >100 km que pueda documentarse sin mezclar tecnologías. En particular, el Blueprint de PNG de 2026 y el proyecto del Banco Mundial para Samoa muestran por qué “backbone de telecomunicaciones” no puede tratarse automáticamente como sinónimo de “fibra terrestre”. ([ict.gov.pg](https://www.ict.gov.pg/wp-content/uploads/2026/10/PNG-Telecommunications-Blueprint-Final-Document-v19-1.pdf))

El JSON siguiente contiene **sólo las rutas que clasifico como en servicio**. Para Nueva Zelanda, las secuencias representan los principales PoP urbanos del backbone indicativo de REANNZ, no la geometría exacta de cada ducto; el propio mapa del operador advierte que sus líneas son indicativas. ([reannz.co.nz](https://www.reannz.co.nz/assets/Uploads/Annual-Reports/REANNZ-Annual-Report-311025-DIGI.pdf))

```json
[
  {
    "nombre": "Project Horizon",
    "operador": "Vocus",
    "pais": "AU",
    "ciudades": ["Perth", "Geraldton", "Meekatharra", "Newman", "Port Hedland"],
    "estado": "en servicio",
    "fuente": "https://www.vocus.com.au/about-vocus/our-network/australia/horizon-cable — Vocus describe una red terrestre de fibra de 2.000 km de Perth a Port Hedland vía Geraldton, Meekatharra y Newman; https://www.vocus.com.au/news/vocus-lights-up-horizon — Vocus confirmó que Horizon quedó iluminada extremo a extremo en junio de 2026."
  },
  {
    "nombre": "Vocus Sydney–Melbourne backbone",
    "operador": "Vocus",
    "pais": "AU",
    "ciudades": ["Sydney", "Melbourne"],
    "estado": "en servicio",
    "fuente": "https://www.vocus.com.au/about-vocus/our-network/australia — Vocus documenta su actual backbone nacional de fibra que conecta las capitales continentales; la historia corporativa de Vocus sitúa Melbourne–Sydney entre las rutas construidas en la fase inicial de 2001–2003."
  },
  {
    "nombre": "Vocus Melbourne–Adelaide backbone",
    "operador": "Vocus",
    "pais": "AU",
    "ciudades": ["Melbourne", "Adelaide"],
    "estado": "en servicio",
    "fuente": "https://www.vocus.com.au/about-vocus/our-network/australia — Vocus documenta su actual backbone nacional de fibra que conecta las capitales continentales; la historia corporativa de Vocus sitúa Melbourne–Adelaide entre las rutas construidas en la fase inicial de 2001–2003."
  },
  {
    "nombre": "Terabit Territory Darwin–Adelaide",
    "operador": "Vocus",
    "pais": "AU",
    "ciudades": ["Darwin", "Adelaide"],
    "estado": "en servicio",
    "fuente": "https://www.vocus.com.au/news/darwins-first-international-data-connection-goes-live — Vocus identifica expresamente su Terabit Territory intercapital fibre backbone de Darwin a Adelaide y Brisbane y señala que fue ampliado con 25 veces más capacidad en 2021."
  },
  {
    "nombre": "Terabit Territory Darwin–Brisbane",
    "operador": "Vocus",
    "pais": "AU",
    "ciudades": ["Darwin", "Brisbane"],
    "estado": "en servicio",
    "fuente": "https://www.vocus.com.au/news/darwins-first-international-data-connection-goes-live — Vocus identifica expresamente su Terabit Territory intercapital fibre backbone de Darwin a Adelaide y Brisbane y señala que fue ampliado con 25 veces más capacidad en 2021."
  },
  {
    "nombre": "REANNZ South Island backbone",
    "operador": "REANNZ (sobre servicios ópticos comerciales; One NZ es socio de conectividad nacional desde 2023)",
    "pais": "NZ",
    "ciudades": ["Invercargill", "Dunedin", "Christchurch"],
    "estado": "en servicio",
    "fuente": "https://www.reannz.co.nz/assets/Uploads/Annual-Reports/REANNZ-Annual-Report-311025-DIGI.pdf — El informe anual 2025 muestra el backbone nacional de 100 Gbps en South Island y confirma que la red sigue plenamente operativa; informes anteriores de REANNZ documentan que el backbone nacional se extiende desde Invercargill y que el eje principal de South Island desde Dunedin fue actualizado a 100 Gbps."
  },
  {
    "nombre": "REANNZ North Island backbone",
    "operador": "REANNZ (sobre servicios ópticos comerciales; One NZ es socio de conectividad nacional desde 2023)",
    "pais": "NZ",
    "ciudades": ["Wellington", "Palmerston North", "Hamilton", "Auckland", "Mangawhai"],
    "estado": "en servicio",
    "fuente": "https://www.reannz.co.nz/assets/Uploads/Annual-Reports/REANNZ-Annual-Report-311025-DIGI.pdf — El mapa oficial 2025 muestra el backbone nacional de 100 Gbps a través de North Island hacia Auckland/Northland; REANNZ había documentado en 2019 ambos ejes de North Island a 100 Gbps y una segunda conexión Hamilton–Wellington. El mapa advierte que las líneas son indicativas."
  },
  {
    "nombre": "Savusavu–Labasa Fibre Project",
    "operador": "Telecom Fiji",
    "pais": "FJ",
    "ciudades": ["Savusavu", "Seaqaqa", "Labasa"],
    "estado": "en servicio",
    "fuente": "https://www.telecom.com.fj/telecom-fiji-knowledge/telecom-fiji-completes-savusavu-to-labasa-fibre-project-strengthening-connectivity-in-the-north/ — Telecom Fiji confirmó en marzo de 2025 la finalización del enlace terrestre subterráneo de 102 km Savusavu–Seaqaqa–Labasa; https://www.telecom.com.fj/telecom-fiji-knowledge/telecom-fiji-wins-infrastructure-initiative-of-the-year-at-asian-telecom-awards-2026/ — en 2026 lo describe como backbone permanente y operativo del norte de Fiji."
  },
  {
    "nombre": "Queen's Road fibre corridor",
    "operador": "Telecom Fiji",
    "pais": "FJ",
    "ciudades": ["Suva", "Navua", "Sigatoka", "Nadi", "Lautoka"],
    "estado": "en servicio",
    "fuente": "https://www.telecom.com.fj/telecom-fiji-knowledge/telecom-fiji-rolls-out-fiber-to-the-home-ftth-and-expands-fiber-network-coverage-throughout-fiji/ — Telecom Fiji indicó en 2018 que su red óptica existente superaba 1.500 km y cubría principalmente el corredor de Queen's Road; la secuencia de ciudades corresponde al corredor principal Suva–Lautoka."
  }
]
```
