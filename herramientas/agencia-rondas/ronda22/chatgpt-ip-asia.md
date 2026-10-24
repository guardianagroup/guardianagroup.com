# Ronda 22 · ChatGPT, Investigación avanzada (deep research) · troncales terrestres de Asia y Oriente Medio

**Pregunta** (enviada tal cual en un chat nuevo de chatgpt.com con la herramienta «Investigación avanzada» activada, el 24 de octubre de 2026; no hizo preguntas aclaratorias y arrancó sola con su plan; según ChatGPT, «Investigación completada en 10m · 49 citas · 580 búsquedas»):

> Investigación profunda, en español: para TODOS los países de Asia y Oriente Medio (AF, AM, AZ, BH, BD, BT, BN, KH, CN, CY, GE, IN, ID, IR, IQ, IL, JP, JO, KZ, KW, KG, LA, LB, MY, MV, MN, MM, NP, KP, OM, PK, PS, PH, QA, SA, SG, KR, LK, SY, TW, TJ, TH, TL, TR, TM, AE, UZ, VN, YE), documenta las principales rutas troncales de fibra óptica TERRESTRE de larga distancia (más de 100 km) que estén en servicio hoy, como listas ORDENADAS de las ciudades por las que pasan, con el operador, el año y la fuente primaria (operador, regulador, Banco Mundial, UIT, bancos de desarrollo, ONU u otra fuente oficial). Da prioridad a las zonas difíciles: conflictos, zonas remotas, islas y desiertos. Distingue bien lo que está en servicio de lo que está en proyecto, en construcción, destruido o funcionando por radioenlaces y no por fibra. No uses submarinecablemap.com, TeleGeography ni PeeringDB. Como mucho unas 8 rutas por país, las más importantes. Al final del informe, pon un único bloque JSON (un array) con solo las rutas en servicio, con objetos así: {"nombre": "...", "operador": "...", "pais": "código ISO alfa-2", "ciudades": ["Ciudad A", "Ciudad B"], "estado": "en servicio", "fuente": "URL y lo que dice"}, con nombres de ciudades en inglés como en GeoNames.

Informe copiado sin editar del documento del informe que guarda la propia página (Archivos del chat). Las marcas internas de cita de ChatGPT se han sustituido por el enlace Markdown que el propio ChatGPT da para cada una; el resto del texto es literal.

---

# Rutas troncales terrestres de fibra óptica de larga distancia en Asia y Oriente Medio

## Alcance, criterios y grado de evidencia

**Corte de la investigación: 24 de octubre de 2026.** Revisé los 49 países y territorios solicitados: AF, AM, AZ, BH, BD, BT, BN, KH, CN, CY, GE, IN, ID, IR, IQ, IL, JP, JO, KZ, KW, KG, LA, LB, MY, MV, MN, MM, NP, KP, OM, PK, PS, PH, QA, SA, SG, KR, LK, SY, TW, TJ, TH, TL, TR, TM, AE, UZ, VN y YE.

El criterio es deliberadamente estricto. Considero **ruta troncal terrestre** un enlace de transmisión óptica interurbano cuyo recorrido o separación entre terminales supera claramente 100 km. No cuento FTTH/GPON urbano, longitud agregada de una red nacional, cable submarino, radioenlace/microondas ni una ruta futura. Cuando la fuente primaria solo publica los **terminales** de un corredor y no los emplazamientos intermedios, mantengo únicamente esos terminales en la lista; no “relleno” ciudades a partir de carreteras, ferrocarriles u OpenStreetMap. Esa precaución es importante porque una ruta lógica IP/DWDM no siempre coincide con la zanja o el OPGW físico.

La metodología coincide con la de la UIT para su cartografía de transmisión terrestre: la UIT recopila propietario, trazado, longitud y estado —operacional, en construcción, planificado o propuesto— de redes de transmisión de larga distancia. ESCAP mantiene asimismo cartografía de redes troncales terrestres ópticas y, por separado, inalámbricas, distinción importante en países montañosos y en conflicto. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Documents/InteractiveTransmissionMaps/ASP/NewRFI_2014/CollectionMissingData_TransmissionMap_Powertel.pdf))

Uso tres niveles prácticos:

**Confirmada** significa que una fuente primaria/oficial permite identificar una ruta o al menos sus terminales y que hay evidencia de explotación. **Backbone confirmado, trazado no publicable** significa que la fibra troncal existe, incluso con miles de kilómetros, pero la documentación primaria localizada no permite reconstruir honestamente una secuencia de ciudades. **No admitida** significa que la ruta está proyectada/en construcción, es submarina o radio, está suspendida/destruida, no supera con seguridad 100 km, o su estado actual no puede verificarse.

Un dato especialmente importante: una cifra como “35.000 km de backbone” **no equivale** a 35.000 km de una única ruta terrestre. Por eso varios países con redes nacionales extensas no generan una entrada en el JSON.

## Asia meridional y Asia central

| País | Principales rutas / resultado | Operador y año | Evaluación |
|---|---|---|---|
| **AF — Afghanistan** | **No incorporo hoy el conocido “anillo nacional” como ruta confirmada.** Afghan Telecom sigue ofreciendo un *National Backbone*, y MCIT documenta que Afghan Telecom y DABS acordaron utilizar fibra OPGW de la red eléctrica para ampliar y redundar el backbone. Sin embargo, las restricciones sobre fibra introducidas desde 2025 y las órdenes de 2026 que afectaron ampliaciones/reparaciones impiden certificar, con una fuente primaria actual, que toda la cadena Kabul–Ghazni–Kandahar–Herat–norte–Kabul esté operativa extremo a extremo. ([mcit.gov.af](https://mcit.gov.af/en/node/6942)) | Afghan Telecom / MCIT; red histórica, estado por corredor incierto en 2026 | **No admitida al JSON por incertidumbre operacional.** No confundo enlaces todavía existentes físicamente con servicio verificablemente activo. |
| **BD — Bangladesh** | **Dhaka → Chattogram**; **Dhaka → Sylhet**; el mismo backbone redundante llega desde Dhaka a los demás distritos/divisional headquarters. BTCL declara expresamente una red de transmisión redundante de Dhaka a los 64 distritos. ([xn--j5b5azb0a2a4bbb.xn--54b7fta0cc](https://xn--j5b5azb0a2a4bbb.xn--54b7fta0cc/uploads/other/pdf_20221130_193645.pdf)) | BTCL; **≤2022** documentada, con ampliaciones posteriores | **Confirmadas por terminales.** No publico ciudades intermedias porque BTCL no las da en la fuente. En 2024 BTCL seguía contratando nueva fibra “all over Bangladesh”, lo que es ampliación y no prueba de que las rutas anteriores estuvieran fuera de servicio. ([bppa.gov.bd](https://www.bppa.gov.bd/advertisement-works/details-85342.html)) |
| **BT — Bhutan** | **Thimphu → Phuntsholing** y **Thimphu → Gelephu**. El caso oficial de ESCAP sobre co-despliegue eléctrico dice que se construyeron enlaces STM-16 de fibra redundantes utilizando fibras oscuras de Bhutan Power Corporation; GovTech confirma además que el Government Intranet óptico se extendió a los 20 Dzongkhags. ([unescap.org](https://www.unescap.org/sites/default/files/ICT%20Co-Deployment%20with%20the%20Electricity%20Infrastructure%2C%20The%20Case%20of%20Bhutan.pdf)) | GovTech/Bhutan Telecom sobre BPC; **año exacto de alta no publicado en la fuente localizada** | **Confirmadas.** Son especialmente relevantes por el terreno himalayo y porque la fibra sigue corredores de infraestructura eléctrica. |
| **IN — India** | RailTel mantiene una red óptica nacional siguiendo los derechos de vía ferroviarios: la fuente oficial ya documentaba ~45.000 km y ~4.500 estaciones, y la información comercial posterior supera 60.000 km de fibra. ([railtel.in](https://www.railtel.in/blog/index.php?Itemid=473&catid=94&id=79%3Arailtel-infrastructure-capabilities&option=com_content&view=article)) | RailTel; explotación nacional desde los años 2000 | **Backbone confirmado, trazado no publicable con el nivel exigido.** No convierto automáticamente itinerarios ferroviarios como Delhi–Mumbai o Delhi–Kolkata en “ruta física de fibra” sin una fuente primaria que publique esa secuencia óptica. |
| **KZ — Kazakhstan** | **Almaty ↔ Astana** y **Astana ↔ Aktobe**, como enlaces del núcleo de tres nodos principales. La presentación corporativa de Kazakhtelecom describe tres nodos principales —Astana, Almaty y Aktobe— interconectados con canales de hasta 6×100 Gb/s y un backbone de más de 16.000 km. En 2024 la empresa seguía ampliando canales DWDM y modernizando el backbone, con puertos de 100 Gb/s en Astana, Almaty, Aktobe y otros centros regionales. ([telecom.kz](https://telecom.kz/media/upload/49/2018/07/19/5f4240bf4e2aeeb1d7a5e53321bed7da.pdf)) | Kazakhtelecom; **≤2018**, modernizado 2020–2024 | **Confirmadas a nivel de enlaces de núcleo**, no como inventario de repetidores intermedios. |
| **KG — Kyrgyzstan** | El corredor histórico de fibra **Bishkek → Kant → Ivanovka → Tokmok → Kemin** fue construido dentro del proyecto de modernización de Chui/TAE y concluido en 2000. La propia Kyrgyztelecom distingue que otras partes del primer proyecto eran radio SDH, detalle que evita confundir radio con fibra. Hoy la compañía ofrece FOCL nacional y, tras Digital CASA, declara más de 3.000 km adicionales de fibra y más de 30 nodos de backbone. ([kt.kg](https://kt.kg/en/about-company/history/)) | Kyrgyztelecom; **2000**, ampliaciones 2023–2025 | **Ruta histórica de fibra verificada**, pero no la incorporo al JSON porque la documentación primaria localizada no proporciona una longitud de trazado que permita demostrar con suficiente margen el umbral estricto de >100 km. |
| **MV — Maldives** | **Ninguna ruta terrestre >100 km.** La infraestructura nacional que une las islas es un backbone de fibra **submarina**; la UIT documenta la finalización de un backbone submarino nacional de más de 1.000 km en 2012 y otro sistema posterior. ([itu.int](https://www.itu.int/en/ITU-D/LDCs/Documents/2017/Country%20Profiles/Country%20Profile_Maldives.pdf)) | Operadores nacionales; backbone submarino desde 2012 | **Excluido por definición.** Una longitud nacional de >1.000 km no se convierte en ruta terrestre porque los tramos entre islas están bajo el mar. |
| **NP — Nepal** | **Lamahi → Kohalpur — 110 km.** Nepal Telecom declara explícitamente que extendió la red óptica del East-West Highway desde Lamahi a Kohalpur con una distancia de ruta de 110 km; el East-West Highway Optical Fiber Project había comenzado en 2003. ([cms.ntc.net.np](https://cms.ntc.net.np/storage/media/ognk6MK9oU9K6Syx5WTaBz42pKEt6V5Hf68eDpJi.pdf)) | Nepal Telecom; **2007** para este tramo | **Confirmada** y particularmente útil porque la propia fuente da tecnología, terminales y longitud, sin necesidad de estimarla. |
| **PK — Pakistan** | PTCL dispone de una extensa red óptica de larga distancia; documentación oficial/sectorial sitúa el *core OFC* por encima de 23.000 km, y Nokia describe la red de PTCL como extendida “from Khyber to Karachi”. ([unescap.org](https://www.unescap.org/sites/default/files/Item%207%20Pakistan-OFC%20and%20Infrastructure%20Snapshot.pdf)) | PTCL | **Backbone confirmado, secuencia de ciudades insuficiente.** “Khyber” es una región y no una ciudad GeoNames; convertirlo en Peshawar y añadir Multan/Lahore/Islamabad sería una inferencia que no introduzco en el JSON. |
| **LK — Sri Lanka** | SLT mantiene un National Backbone Network óptico de alcance nacional. La documentación de SLT identifica un **Central Ring de 670 km** como existente, mientras que en la misma lámina los Southern, East-Uva Central y North-East Central rings aparecían como **proposed**; informes posteriores describen el NBN como red principal nacional de fibra y más de 100 Gb/s. ([slt.lk](https://www.slt.lk/sites/default/files/downloads/documentries/Empowering%20Society%20with%20ICT.pdf)) | Sri Lanka Telecom; NBN operativo desde la década de 2010 | **Central Ring: en servicio; otros anillos de aquella lámina: no los trato como operativos por esa fuente.** No reconstruyo la secuencia del Central Ring a partir de la posición visual de ciudades sin una tabla primaria de trazado. |
| **TJ — Tajikistan** | En 2025 el Gobierno anunció la instalación de **108 km de fibra hacia China**. La longitud supera el criterio, pero la fuente oficial disponible a través de información gubernamental no publica una pareja inequívoca de ciudades GeoNames para el tramo. ([trade.gov](https://www.trade.gov/country-commercial-guides/tajikistan-information-and-communication-technologies-ict)) | Tojiktelecom/Gobierno; **2025** | **Fibra >100 km confirmada; trazado urbano insuficiente para JSON.** |
| **TM — Turkmenistan** | Turkmentelecom enumera como sistemas internacionales de fibra ya existentes **Ashgabat–Guchan**, **Serhetabat–Herat**, **Kerki–Akina**, **Turkmenabat–Alat** y **Dashoguz–Gurlen**, entre otros. En la misma nota, las nuevas líneas Garabogaz–Teymir Baba y Etrek–Kummet Kovus se describen como planes de construcción. ([telecom.tm](https://telecom.tm/en/news/6703?offset=3032)) | Turkmentelecom; sistemas existentes **≤2023** | **No introduzco ninguna en JSON:** son rutas transfronterizas y la fuente no desglosa cuántos kilómetros del tramo *dentro de Turkmenistan* superan 100 km. Las dos nuevas líneas mencionadas eran proyecto, no servicio. |
| **UZ — Uzbekistan** | La documentación de desarrollo registra una gran expansión de la red óptica de Uztelecom, de 36.600 km en 2019 a 81.700 km en 2021; la empresa continúa modernizando su red en 2026. ([adb.org](https://www.adb.org/sites/default/files/publication/1027176/private-sector-green-transformation-uzbekistan.pdf)) | Uztelecom | **Backbone confirmado, trazado de ciudades no publicado con suficiente precisión.** No genero artificialmente Tashkent–Samarkand–Bukhara–Nukus a partir de la geografía vial. |

Un patrón importante en esta región es que los países montañosos publican con bastante claridad la **existencia** de fibra pero no necesariamente la topología física. Bhutan y Nepal son excepciones útiles: sus fuentes oficiales llegan al nivel de pareja de ciudades o longitud concreta. Kyrgyzstan también es instructivo porque la historia oficial separa explícitamente el backbone de **radio SDH** de las FOCL, evitando atribuir fibra a tramos que eran radio. ([unescap.org](https://www.unescap.org/sites/default/files/ICT%20Co-Deployment%20with%20the%20Electricity%20Infrastructure%2C%20The%20Case%20of%20Bhutan.pdf))

## Asia oriental y sudoriental

| País | Principales rutas / resultado | Operador y año | Evaluación |
|---|---|---|---|
| **BN — Brunei** | UNN declara más de 5.000 km de fibra nacional y mantiene infraestructura en Bandar Seri Begawan, Bangar, Tutong y Kuala Belait. ([unn.com.bn](https://unn.com.bn/services-fixed)) | Unified National Networks (UNN) | **Backbone confirmado, pero no una ruta >100 km con secuencia física publicada.** No convierto la sucesión geográfica Bandar Seri Begawan–Tutong–Kuala Belait en ruta troncal sin prueba topológica. |
| **KH — Cambodia** | CFOCN declara **23.000+ km de backbone FOC** y 2.000+ km de metro duct en todo el país; el regulador camboyano mantiene a CFOCN como operador licenciado. ([pfocn.com](https://www.pfocn.com/group-business.html)) | CFOCN; red desde 2006 y ampliada después | **Backbone terrestre nacional confirmado**, pero la página primaria no entrega el orden de ciudades de cada corredor. El proyecto AIIB de ampliación tampoco debe confundirse automáticamente con tramos ya operativos. ([aiib.org](https://www.aiib.org/en/projects/approved/2019/_download/cambodia/Non-Technical-Summary-of-EIA-English.pdf)) |
| **CN — China** | **Shanghai → Guangzhou.** China Telecom documenta la primera red troncal terrestre completa con fibra G.654.E entre Shanghai y Guangzhou, dentro de su enorme backbone óptico nacional; otras publicaciones de la compañía enumeran nodos OTN nacionales, pero no convierto esa lista de nodos en rutas físicas adicionales. ([chinatelecom-h.com](https://www.chinatelecom-h.com/en/ir/report/csr2022/csr2022_07.pdf)) | China Telecom; **2022** documentada | **Confirmada por terminales.** Intermedios no publicados en la fuente citada. |
| **ID — Indonesia** | Palapa Ring East fue inaugurado en 2019. El operador del proyecto distingue **4.555 km submarinos** y **2.448 km de cable terrestre**, además de 52 torres, para alcanzar zonas de NTT, West Papua y Papua inaccesibles por carretera. ([moratelindo.co.id](https://www.moratelindo.co.id/pengumuman-10.html)) | PT Palapa Timur Telematika/Moratelindo; **2019** | **Backbone terrestre >100 km confirmado, pero sin secuencia pública de ciudades en la fuente localizada.** No mezclo los 2.448 km terrestres con los 4.555 km submarinos. |
| **JP — Japan** | **Tokyo → Nagoya → Osaka.** NTT utiliza este corredor como referencia explícita de sus sistemas ópticos de larga distancia y describe los actuales sistemas WDM que soportan la principal arteria Tokyo–Nagoya–Osaka. ([group.ntt](https://group.ntt/en/newsrelease/2025/08/12/250812a.html)) | NTT; **operativo y documentado en 2025** | **Confirmada.** No trato los ensayos de una nueva generación óptica como si sustituyeran el hecho de que el corredor WDM existente ya está en servicio. |
| **KP — North Korea** | **Ninguna ruta incorporada.** Las fuentes UIT disponibles permiten confirmar la presencia histórica de infraestructura de telecomunicaciones, pero no proporcionan una topología de fibra de larga distancia, por ciudades, cuyo estado operativo pueda verificarse en 2026. ([itu.int](https://www.itu.int/dms_pub/itu-s/opb/pol/s-pol-broadband.18-2017-pdf-e.pdf)) | Ministry of Posts and Telecommunications | **No verificable bajo el estándar de esta investigación.** No uso mapas comerciales ni fuentes de inteligencia secundaria para rellenar Pyongyang–Sinuiju–etc. |
| **KR — South Korea** | El backbone KOREN conecta diez centros, entre ellos Seoul, Suwon, Pangyo, Daejeon, Jeonju, Gwangju, Daegu, Busan y Chuncheon. Para el continente, los dos corredores principales que pueden expresarse a nivel de nodos son **Seoul → Suwon → Daejeon → Daegu → Busan** y **Daejeon → Jeonju → Gwangju**. Jeju queda fuera de esas listas porque su acceso no es una ruta terrestre peninsular. ([koren.kr](https://koren.kr/en/network)) | KOREN/KREONET; red actual de alta capacidad | **Confirmadas a nivel de nodos de backbone.** La lista no pretende enumerar cada repetidor o ducto físico. |
| **LA — Laos** | Lao Telecom informa de más de 32.000 km de fibra, incluyendo unos **4.705 km de backbone DWDM de 100 Gb/s**; fuentes oficiales laosianas confirman operación nacional de la empresa. ([facebook.com](https://www.facebook.com/Laotel/posts/comming-soon-laotel-laotelecom-%E0%BA%A5%E0%BA%B2%E0%BA%A7%E0%BB%82%E0%BA%97%E0%BA%A5%E0%BA%B0%E0%BA%84%E0%BA%BB%E0%BA%A1%E0%BA%9E%E0%BA%B2%E0%BA%97%E0%BB%88%E0%BA%BD%E0%BA%A7-laotelecom24thanniversary-%E0%BA%A5%E0%BA%B2%E0%BA%A7%E0%BB%82%E0%BA%97%E0%BA%A5/3465104733566472/)) | Lao Telecom | **Backbone >100 km confirmado, pero secuencias de ciudades insuficientes.** No invento Vientiane–Luang Prabang–Boten o Vientiane–Pakse sin mapa primario de ruta. |
| **MY — Malaysia** | El corredor terrestre internacional **VSTN** de VNPT entró en operación en 2025 y enlaza, entre otros puntos oficiales, **Cyberjaya → Johor Bahru** antes de Singapore; ambos son emplazamientos de IDC explícitamente identificados en la documentación del lanzamiento. TM, por separado, mantiene el mayor backbone de fibra de Malaysia. ([en.vietnamplus.vn](https://en.vietnamplus.vn/vnpt-launches-first-direct-overland-fibre-optic-route-linking-vietnam-to-singapore-post323998.vnp)) | VNPT/VSTN sobre infraestructura terrestre asociada; **2025** | **Confirmada por terminales en Malaysia.** Es una ruta internacional terrestre, no un cable submarino. |
| **MN — Mongolia** | El Ministerio/regulador documentó **43.018 km de fibra** nacional y una ruta óptica de unos **1.000 km desde la frontera sur hasta la frontera norte**; todos los aimags estaban conectados por fibra. ([itu.int](https://www.itu.int/en/ITU-D/Regional-Presence/AsiaPacific/Documents/Events/2019/Aug-MIIT/1.8BROADBAND%20INFRASTRUCTURE%20DEVELOPMENT%20IN%20MONGOLIA.pdf)) | ICN Company, Mobicom Networks, Gemnet, MT Networks | **Ruta larga confirmada, ciudades insuficientes.** No sustituyo “south border–north border” por Zamyn-Üüd–Ulaanbaatar–Darkhan–Sükhbaatar sin una secuencia primaria explícita. |
| **MM — Myanmar** | MFOCN declara actualmente **35.000+ km de backbone FOC** y 4.000+ km de metro. MPT continúa ofreciendo servicios de fibra en numerosas regiones. ([pfocn.com](https://www.pfocn.com/group-business.html)) | MFOCN/MPT | **Backbone confirmado; ninguna ruta incorporada al JSON.** En el contexto de guerra civil no es prudente deducir que una cadena histórica Muse–Mandalay–Yangon, por ejemplo, esté íntegramente operativa hoy sin certificación de corredor. |
| **PH — Philippines** | **Laoag → Quezon City — 1.245 km.** La fase uno del National Fiber Backbone se lanzó en abril de 2024; el National Digital Connectivity Plan de DICT dice expresamente que se extiende 1.245 km desde Laoag hasta Quezon City y activa 28 nodos. En junio de 2026 DICT adjudicó el contrato de operación y mantenimiento de esa fase ya completada. ([cms-cdn.e.gov.ph](https://cms-cdn.e.gov.ph/DICT/pdf/LATEST%20PUBLICATION%20NDCP_bda86f60-7dd4-4cf9-be58-c25275508074.pdf)) | DICT; **2024**, O&M vigente en 2026 | **Confirmada y en servicio.** En cambio, las fases 4 y 5 de Mindanao, anunciadas en 2025 para Butuan–Cagayan de Oro–Bukidnon–Zamboanga–Davao y >1.000 km, eran entonces construcción; no las cuento como servicio por ese anuncio. ([dict.gov.ph](https://dict.gov.ph/news-and-updates/22730)) |
| **SG — Singapore** | **Ninguna ruta terrestre interurbana >100 km identificable.** Singapore dispone de una red nacional de fibra muy densa, pero una red metropolitana/nacional agregada no satisface por sí sola el criterio de una ruta troncal terrestre interurbana >100 km. | Operadores múltiples | **Sin entrada JSON.** Tampoco cuento los cables internacionales que parten de Singapore, porque sus grandes distancias son submarinas o transfronterizas fuera del territorio. |
| **TW — Taiwan** | **Taipei → Hsinchu → Taichung → Tainan.** TWAREN/NCHC publica esos cuatro core nodes en el backbone, actualmente a 400 Gb/s y con enlaces de mayor capacidad en partes de la red. La construcción de TWAREN se completó a finales de 2003 y el servicio comenzó en 2004. ([nchc.org.tw](https://www.nchc.org.tw/Page?itemid=59&mid=110)) | NCHC/TWAREN; **2004**, posteriormente actualizado | **Confirmada** como principal eje norte–sur del backbone académico nacional. |
| **TH — Thailand** | National Telecom mantiene infraestructura nacional y centros troncales en Bangkok, Chiang Mai, Khon Kaen y Hat Yai; VSTN atraviesa Thailand por tierra desde 2025. ([ntdatacenter.net](https://www.ntdatacenter.net/data-center/nt-chiang-mai/)) | National Telecom / participantes de VSTN | **No publico una secuencia >100 km** porque la fuente primaria localizada de VSTN solo identifica con claridad el punto de Bangkok, no todos los puntos de paso tailandeses. |
| **TL — Timor-Leste** | El Gobierno/DNIC gestiona red de fibra terrestre para conectar entidades gubernamentales y municipios; los proyectos nacionales de conectividad alcanzan cientos de instituciones. La nueva conexión internacional que entró en servicio en 2026 es, en cambio, **submarina** y no entra en este estudio. ([en.tatoli.tl](https://en.tatoli.tl/2024/06/08/timor-lestes-submarine-cable-a-promise-of-high-speed-connection-for-economic-prosperity/10/)) | DNIC/Gobierno | **Fibra terrestre confirmada, pero sin una ruta >100 km por ciudades publicada en fuente primaria.** |
| **VN — Vietnam** | Viettel documenta que su infraestructura troncal comenzó con dos cables ópticos en el eje **North–South**, uno asociado al corredor 1A y otro a la línea eléctrica de 500 kV. En 2025 VNPT puso además en operación VSTN, una ruta terrestre internacional de unos 3.900 km que parte de su centro técnico de Da Nang hacia Laos, Thailand, Malaysia y Singapore. ([en.qdnd.vn](https://en.qdnd.vn/economy/military-businesses/viettel-networks-develops-from-simple-fiber-optic-cables-537294)) | Viettel; VNPT/VSTN | **Corredores claramente en servicio, pero no añado una lista Hanoi–Vinh–Da Nang–Nha Trang–Ho Chi Minh City porque esa secuencia precisa no aparece en la fuente primaria capturada.** |

Indonesia, Myanmar y Timor-Leste ilustran por qué “isla” no equivale automáticamente a “submarino”: sí hay largos tramos **terrestres** dentro de islas grandes, pero las fuentes públicas a menudo dan kilómetros agregados y no una secuencia de ciudades. En Indonesia, la separación oficial entre 2.448 km terrestres y 4.555 km submarinos del Palapa Ring East permite afirmar que existe una gran red terrestre en Papua/NTT, pero no justificar una ruta urbana inventada. ([moratelindo.co.id](https://www.moratelindo.co.id/pengumuman-10.html))

## Cáucaso y Oriente Medio

| País | Principales rutas / resultado | Operador y año | Evaluación |
|---|---|---|---|
| **AM — Armenia** | OVIO declara fibra en Yerevan, Abovyan, Charentsavan, Hrazdan, Vanadzor, Gyumri, Ashtarak, Sevan, Dilijan, Ijevan, Kapan, Alaverdi, Kajaran y otras ciudades. ([ovio.am](https://ovio.am/en/about-us)) | OVIO | **Backbone/fibra interurbana confirmada, topología física no publicada.** No genero una cadena Yerevan–Hrazdan–Sevan–Dilijan–Vanadzor solo por proximidad geográfica. |
| **AZ — Azerbaijan** | AzerTelecom es operador nacional de backbone; documentación oficial ECO/UIT señala que la fibra de Aztelecom cubre las principales regiones y ciudades y conecta Baku hacia las fronteras rusa, iraní y occidental con Georgia/Türkiye mediante varios anillos. ([azertelecom.az](https://www.azertelecom.az/en/)) | Aztelecom/AzerTelecom | **Backbone de larga distancia confirmado, pero secuencia urbana insuficiente.** El nuevo enlace trans-Caspio con Kazakhstan es submarino y queda fuera. |
| **BH — Bahrain** | Batelco posee un backbone nacional e internacional y BNET/QNBN-equivalentes han extendido fibra nacional, pero no localicé una ruta terrestre interurbana >100 km con terminales de ciudad publicada. ([batelco.com](https://www.batelco.com/global/internet-services/)) | Batelco / BNET | **Sin ruta que cumpla el criterio.** No uso kilómetros agregados de FTTH como “long-haul”. |
| **CY — Cyprus** | Cyta mantiene red de fibra que cubre los principales centros chipriotas. ([cyta.com.cy](https://www.cyta.com.cy/cyta-fiber/en)) | Cyta | **Backbone confirmado, pero no una topología física >100 km suficientemente documentada.** Por eso no convierto Nicosia–Limassol–Paphos en una ruta sin fuente de trazado. |
| **GE — Georgia** | Silknet documenta una red de fibra nacional, pero la documentación pública localizada no permite separar con suficiente precisión un corredor físico de larga distancia de su red lógica/acceso. ([silknet.com](https://silknet.com/en/personal/internet/products/optic)) | Silknet | **Sin ruta JSON.** |
| **IR — Iran** | Iran dispone de un operador troncal nacional y extensas redes ópticas, pero no encontré en las fuentes primarias accesibles una publicación actual que permita certificar, por ciudades y estado 2026, corredores como Tehran–Isfahan–Shiraz o Tehran–Mashhad. | Telecommunications Infrastructure Company | **No verificable al nivel requerido; no se infiere.** |
| **IQ — Iraq** | Documentación de la ONU ya señalaba backbone de fibra para emplazamientos en Baghdad/BIAP, Kirkuk, Basra, Mosul y Erbil. ([ungm.org](https://www.ungm.org/Public/Notice/11140)) | ITPC y operadores iraquíes | **No lo elevo a ruta 2026.** La fuente acredita infraestructura, pero no un trazado urbano continuo actual ni el estado de cada tramo en el entorno de seguridad iraquí. |
| **IL — Israel** | **Metula → Eilat.** Bezeq anunció en 2020 una red avanzada de fibra que cubriría el país “from Metula in the North to Eilat in the South”, por las fronteras y el interior; la cobertura nacional de fibra ha continuado ampliándose. ([ir.bezeq.co.il](https://ir.bezeq.co.il/news-releases/news-release-details/bezeq-launches-fiber-optic-plan/)) | Bezeq; **2020** lanzamiento del despliegue nacional | **Confirmada por terminales nacionales.** No inserto Haifa, Tel Aviv o Beersheba como pasos físicos aunque sean ciudades probables del sistema, porque la declaración citada no especifica esa ruta de ductos. |
| **JO — Jordan** | El National Broadband Network es una infraestructura de fibra activa que conecta departamentos gubernamentales de las governorates con oficinas centrales en Amman. La documentación de mantenimiento identifica infraestructura ya implementada en **Amman, Aqaba y la región norte —Irbid, Ramtha, Mafraq—**. ([modee.gov.jo](https://www.modee.gov.jo/En/Pages/National_Broadband_Network_Program)) | Ministry of Digital Economy and Entrepreneurship / NBN | **Backbone largo confirmado, pero no publico Irbid–Amman–Aqaba como una sola ruta física porque la fuente describe regiones/partes de la red, no una cadena continua.** |
| **KW — Kuwait** | Existe una extensa infraestructura nacional de fibra/FTTH, pero no localicé una fuente primaria que publique una ruta troncal terrestre >100 km por ciudades. | Ministry of Communications y operadores | **Sin entrada JSON.** |
| **LB — Lebanon** | Ogero mantiene la infraestructura fija nacional y continúa el despliegue de fibra. ([ogero.gov.lb](https://www.ogero.gov.lb/)) | Ogero | **No incorporo Tripoli–Beirut–Sidon–Tyre sin mapa primario actual**, especialmente después de los daños e interrupciones asociados al conflicto de 2023–2025. |
| **OM — Oman** | **Muscat → Salalah.** La documentación de Ciena sobre la red de Omantel señala que su huella de fibra interconecta los cable landing stations y data centres, incluidos **MC1 Muscat** y **Equinix SN1 Salalah**, formando un backbone resiliente a través de Oman. ([ciena.com](https://www.ciena.com/about/newsroom/press-releases/omantel-and-ciena-collaborate-to-serve-the-digital-backbone-of-omans-ai-and-cloud-economy)) | Omantel; **≤2025** | **Confirmada por terminales.** No añado Duqm como paso intermedio sin fuente que lo declare parte de ese mismo trayecto físico. |
| **PS — Palestine** | Paltel mantiene fibra para interconectar entidades y sucursales en West Bank y Gaza; fuentes del Banco Mundial también describen fibras troncales entre ciudades palestinas. ([bop.ps](https://www.bop.ps/en/about/news/193)) | Paltel | **No incorporo una ruta en 2026.** La destrucción y las interrupciones de Gaza hacen especialmente inseguro extrapolar un trazado anterior; en West Bank la fuente primaria localizada tampoco publica el orden físico Jenin–Nablus–Ramallah–Hebron. |
| **QA — Qatar** | QNBN mantiene una red nacional de fibra desde 2011 y cobertura en diversas partes del país. ([qnbn.qa](https://qnbn.qa/)) | Qatar National Broadband Network | **No localicé un corredor >100 km por ciudades que pueda demostrarse sin inferencia.** |
| **SA — Saudi Arabia** | stc tiene una **red terrestre DWDM en vivo** en la que Nokia y stc transportaron 1 Tb/s sobre **850 km** en enero de 2025. La fuente es excepcionalmente clara sobre tecnología, longitud y que se trataba de la red terrestre *live*. ([nokia.com](https://www.nokia.com/newsroom/nokia-and-stc-group-set-middle-east-record-with-1tbps-data-center-connectivity-across-850km-network/)) | stc Group; **2025** | **Ruta >100 km inequívocamente en servicio, pero no entra en JSON porque stc/Nokia no publicaron las ciudades terminales del ensayo.** Asignarle Riyadh–Jeddah sería especulación. |
| **SY — Syria** | **Ninguna ruta incorporada como “en servicio hoy”.** Las fuentes de 2026 describen reconstrucción y nuevas redes —incluido un programa de miles de kilómetros— y también cortes de cables existentes; estos anuncios son proyecto/reparación, no prueba de una ruta troncal continua activa. ([barq.moct.gov.sy](https://barq.moct.gov.sy/)) | Syrian Telecom / nuevos concesionarios | **Estado conflictivo; excluido.** Una ruta histórica Damascus–Homs–Hama–Aleppo no se presupone operativa solo porque exista físicamente. |
| **TR — Türkiye** | **Istanbul → Ankara.** Nokia documenta ensayos de capacidad de larga distancia sobre la **red DWDM en vivo de Türk Telekom** en el corredor Istanbul–Ankara; Türk Telekom declara además la mayor huella de fibra del país, superior al medio millón de kilómetros. ([nokia.com](https://www.nokia.com/customer-success/turk-telekom-and-nokia-broke-new-ground-in-turkey-with-1-terabit-speed-connection/)) | Türk Telekom; operativa en la década de 2020 | **Confirmada.** El ensayo prueba que la ruta óptica subyacente ya estaba viva; no trato la nueva velocidad ensayada como fecha de construcción del cable. |
| **AE — United Arab Emirates** | **Abu Dhabi → Dubai → Fujairah.** El mapa oficial de conectividad de e& identifica las principales localizaciones terrestres —Abu Dhabi, Dubai, Fujairah y Al Ain— y la red troncal nacional; e& confirma una red óptica end-to-end/DWDM de alta capacidad en UAE. ([eand.com](https://www.eand.com/content/dam/eand/assets/docs/carrier-and-wholesale/connectivity-map.pdf)) | e& UAE / Etisalat | **Confirmada a nivel de backbone cartografiado.** Fujairah es especialmente relevante como punto de concentración de landing stations, pero la ruta aquí registrada es el backhaul **terrestre** dentro de UAE, no los cables submarinos que salen de Fujairah. |
| **YE — Yemen** | **Ninguna ruta admitida en 2026.** El Logistics Cluster de la ONU informó en junio de 2026 que conectividad en **Hodeidah, Ibb y Sana'a permanecía suspendida**, mientras que Al Mukalla se estaba reforzando mediante **cobertura inalámbrica**. ([reliefweb.int](https://reliefweb.int/report/yemen/yemen-conflict-ltc-situation-report-telecoms-area-115-reporting-period-may-2026)) | PTC/TeleYemen y otros | **Excluido deliberadamente.** Una ruta rota/suspendida no es “en servicio”, y una mejora inalámbrica no es fibra. |

El resultado más llamativo de Oriente Medio es Saudi Arabia: tenemos una de las pruebas primarias más fuertes de toda la investigación —**850 km, DWDM terrestre, red en vivo**— pero no una pareja de ciudades. En un inventario orientado a GIS sería un error asignarla a Riyadh–Jeddah simplemente porque esa distancia “parece encajar”. ([nokia.com](https://www.nokia.com/newsroom/nokia-and-stc-group-set-middle-east-record-with-1tbps-data-center-connectivity-across-850km-network/))

## Zonas difíciles, proyectos y falsos positivos que quedan fuera

Las exclusiones son tan importantes como las rutas incluidas.

**Afghanistan** conserva una infraestructura troncal óptica, pero la política desde 2025–2026 hizo que el estado efectivo variara provincialmente; el acuerdo Afghan Telecom–DABS acredita fibra troncal y redundancia, no que cada tramo histórico del anillo esté actualmente pasando tráfico. Por eso no convierto el conocido trazado histórico del anillo en una entrada “en servicio” sin validación primaria actual. ([mcit.gov.af](https://mcit.gov.af/en/node/6942))

**Myanmar, Syria, Palestine/Gaza y Yemen** son los casos en los que más fácilmente un mapa histórico produciría falsos positivos. En Myanmar hay decenas de miles de kilómetros de backbone físico, pero el operador no publica en la fuente localizada un estado corredor por corredor en medio de la guerra. En Syria se anuncian redes nuevas y reparaciones; eso es distinto de servicio actual. En Yemen, la ONU proporciona incluso el contraejemplo explícito de hubs suspendidos y mejora por **wireless** en Al Mukalla. ([pfocn.com](https://www.pfocn.com/group-business.html))

**Indonesia, Philippines, Maldives y Timor-Leste** exigen separar fibra terrestre de submarina. Palapa Ring East contiene ambas y el operador publica por separado 2.448 km terrestres y 4.555 km submarinos. En Philippines la fase 1 Laoag–Quezon City sí está terminada y bajo O&M, mientras que las fases 4/5 de Mindanao fueron anunciadas en 2025 como nueva construcción. Maldives tiene un backbone nacional largo, pero es esencialmente submarino entre islas. Timor-Leste activó una nueva conexión internacional submarina en 2026, que tampoco transforma automáticamente sus enlaces terrestres internos en una ruta >100 km publicable. ([moratelindo.co.id](https://www.moratelindo.co.id/pengumuman-10.html))

También excluí proyectos transfronterizos cuya condición en la fuente era inequívocamente futura. Turkmentelecom, por ejemplo, distinguía sus enlaces internacionales existentes de las nuevas líneas Garabogaz–Teymir Baba y Etrek–Kummet Kovus que **se planeaba construir**. ([telecom.tm](https://telecom.tm/en/news/6703?offset=3032))

Finalmente, **radioenlace no cuenta como fibra**. La historia oficial de Kyrgyztelecom es particularmente útil porque explica que su primer proyecto combinó un anillo troncal digital **radio-relay SDH** con determinadas FOCL; solo estas últimas se consideran aquí. En Yemen, la expansión inalámbrica de Mukalla queda fuera por la misma razón. ([kt.kg](https://kt.kg/en/about-company/history/))

## Balance de cobertura y fiabilidad

De los 49 países estudiados, hay tres situaciones distintas. En un grupo relativamente pequeño —Bangladesh, Bhutan, China, Japan, Kazakhstan, Nepal, Philippines, South Korea, Taiwan, Israel, Oman, Türkiye y UAE— las fuentes permiten llegar a una ruta o corredor por ciudades con suficiente precisión como para estructurarlo. En otros —India, Indonesia, Cambodia, Laos, Mongolia, Myanmar, Pakistan, Sri Lanka, Jordan, Saudi Arabia y varios más— la existencia y longitud del backbone están bien documentadas, pero las fuentes públicas primarias no revelan el recorrido ciudad por ciudad. Y en los casos de conflicto o redes predominantemente submarinas, aplicar un filtro estricto elimina rutas que aparecerían sin dificultad en bases de datos comerciales.

Esto significa que **la ausencia de una entrada JSON no significa “este país no tiene fibra troncal”**. Significa, más precisamente, “no encontré una ruta >100 km, terrestre, operativa hoy y con ciudades suficientemente documentadas por las fuentes permitidas para expresarla sin inventar topología”. Esa distinción explica, por ejemplo, por qué Saudi Arabia —con una prueba directa de 850 km de DWDM terrestre vivo— no aparece en el bloque: la fuente no revela sus terminales. ([nokia.com](https://www.nokia.com/newsroom/nokia-and-stc-group-set-middle-east-record-with-1tbps-data-center-connectivity-across-850km-network/))

También conviene interpretar los años con cuidado. Cuando una fuente proporciona una puesta en servicio concreta, la uso —Nepal 2007, Philippines 2024, Taiwan 2004—; cuando solo demuestra que la ruta ya existía en una fecha determinada, el informe usa “≤ año” o “documentada en año” en lugar de inventar una fecha de construcción.

El bloque siguiente aplica todavía un filtro adicional: contiene únicamente rutas que considero **en servicio** y para las que existe una secuencia de ciudades defendible. En los casos en que la fuente primaria solo revela dos terminales, el array contiene exclusivamente esos terminales; no he interpolado ciudades. Las URL son de la fuente primaria/oficial utilizada o, cuando el organismo no mantiene un enlace profundo estable, de su repositorio oficial acompañado por la descripción exacta del documento citado.

## Datos estructurados

```json
[
  {
    "nombre": "BTCL Dhaka–Chattogram trunk",
    "operador": "Bangladesh Telecommunications Company Limited (BTCL)",
    "pais": "BD",
    "ciudades": ["Dhaka", "Chattogram"],
    "estado": "en servicio",
    "fuente": "https://xn--j5b5azb0a2a4bbb.xn--54b7fta0cc/uploads/other/pdf_20221130_193645.pdf — BTCL declara una red de transmisión redundante y fiable desde Dhaka hacia los 64 distritos, incluidos los divisional headquarters como Chattogram; la fuente no publica los nodos físicos intermedios."
  },
  {
    "nombre": "BTCL Dhaka–Sylhet trunk",
    "operador": "Bangladesh Telecommunications Company Limited (BTCL)",
    "pais": "BD",
    "ciudades": ["Dhaka", "Sylhet"],
    "estado": "en servicio",
    "fuente": "https://xn--j5b5azb0a2a4bbb.xn--54b7fta0cc/uploads/other/pdf_20221130_193645.pdf — BTCL declara su red de transmisión redundante desde Dhaka hacia todos los distritos y cita Sylhet entre los principales divisional headquarters; no se añaden ciudades intermedias que la fuente no especifica."
  },
  {
    "nombre": "Thimphu–Phuntsholing redundant optical link",
    "operador": "GovTech/Bhutan telecommunications network over Bhutan Power Corporation dark fibre",
    "pais": "BT",
    "ciudades": ["Thimphu", "Phuntsholing"],
    "estado": "en servicio",
    "fuente": "https://www.unescap.org/sites/default/files/ICT%20Co-Deployment%20with%20the%20Electricity%20Infrastructure%2C%20The%20Case%20of%20Bhutan.pdf — ESCAP documenta un enlace redundante STM-16 de fibra óptica entre Thimphu y Phuentsholing construido utilizando fibra oscura de Bhutan Power Corporation."
  },
  {
    "nombre": "Thimphu–Gelephu redundant optical link",
    "operador": "GovTech/Bhutan telecommunications network over Bhutan Power Corporation dark fibre",
    "pais": "BT",
    "ciudades": ["Thimphu", "Gelephu"],
    "estado": "en servicio",
    "fuente": "https://www.unescap.org/sites/default/files/ICT%20Co-Deployment%20with%20the%20Electricity%20Infrastructure%2C%20The%20Case%20of%20Bhutan.pdf — ESCAP dice que se construyó otro enlace redundante STM-16 de fibra óptica entre Thimphu y Gelephu utilizando fibra oscura de BPC."
  },
  {
    "nombre": "China Telecom Shanghai–Guangzhou G.654.E terrestrial backbone",
    "operador": "China Telecom",
    "pais": "CN",
    "ciudades": ["Shanghai", "Guangzhou"],
    "estado": "en servicio",
    "fuente": "https://www.chinatelecom-h.com/ — el informe corporativo de sostenibilidad/CSR de China Telecom citado en el informe documenta la primera red troncal terrestre completa con fibra G.654.E que conecta Shanghai y Guangzhou; la fuente citada no enumera los emplazamientos intermedios."
  },
  {
    "nombre": "NTT Tokyo–Nagoya–Osaka long-haul optical corridor",
    "operador": "NTT",
    "pais": "JP",
    "ciudades": ["Tokyo", "Nagoya", "Osaka"],
    "estado": "en servicio",
    "fuente": "https://group.ntt/en/newsrelease/ — documentación técnica oficial de NTT de 2025 usa explícitamente el corredor Tokyo–Nagoya–Osaka al describir los sistemas WDM ópticos de larga distancia existentes y la evolución del backbone."
  },
  {
    "nombre": "Kazakhtelecom Almaty–Astana core link",
    "operador": "Kazakhtelecom",
    "pais": "KZ",
    "ciudades": ["Almaty", "Astana"],
    "estado": "en servicio",
    "fuente": "https://telecom.kz/media/upload/49/2018/07/19/5f4240bf4e2aeeb1d7a5e53321bed7da.pdf — Kazakhtelecom identifica Almaty, Astana y Aktobe como sus tres nodos principales de backbone interconectados por canales de hasta 6x100 Gb/s; https://ar2024.telecom.kz/en/innovation-and-new-technologies.html confirma ampliación y modernización actual de los canales DWDM del backbone."
  },
  {
    "nombre": "Kazakhtelecom Astana–Aktobe core link",
    "operador": "Kazakhtelecom",
    "pais": "KZ",
    "ciudades": ["Astana", "Aktobe"],
    "estado": "en servicio",
    "fuente": "https://telecom.kz/media/upload/49/2018/07/19/5f4240bf4e2aeeb1d7a5e53321bed7da.pdf — la documentación corporativa identifica Astana, Almaty y Aktobe como los tres nodos principales del backbone de datos; https://ar2024.telecom.kz/en/innovation-and-new-technologies.html confirma que el backbone y sus canales DWDM continuaban modernizándose en 2024."
  },
  {
    "nombre": "VSTN Malaysia Cyberjaya–Johor Bahru terrestrial segment",
    "operador": "VNPT / VSTN",
    "pais": "MY",
    "ciudades": ["Cyberjaya", "Johor Bahru"],
    "estado": "en servicio",
    "fuente": "https://en.vietnamplus.vn/ — el anuncio oficial de lanzamiento de VSTN en 2025 describe una ruta terrestre internacional de aproximadamente 3,900 km y enumera como puntos de la ruta los IDC de Cyberjaya y Johor Bahru antes de Singapore."
  },
  {
    "nombre": "East-West Highway optical fibre Lamahi–Kohalpur",
    "operador": "Nepal Telecom",
    "pais": "NP",
    "ciudades": ["Lamahi", "Kohalpur"],
    "estado": "en servicio",
    "fuente": "https://cms.ntc.net.np/storage/media/ognk6MK9oU9K6Syx5WTaBz42pKEt6V5Hf68eDpJi.pdf — Nepal Telecom Annual Report 2007 dice explícitamente que la red óptica del East-West Highway se extendió de Lamahi a Kohalpur con una distancia de ruta de 110 km."
  },
  {
    "nombre": "DICT National Fiber Backbone Phase One",
    "operador": "Department of Information and Communications Technology (DICT)",
    "pais": "PH",
    "ciudades": ["Laoag", "Quezon City"],
    "estado": "en servicio",
    "fuente": "https://cms-cdn.e.gov.ph/DICT/pdf/LATEST%20PUBLICATION%20NDCP_bda86f60-7dd4-4cf9-be58-c25275508074.pdf — el National Digital Connectivity Plan dice que NFB Phase One, lanzado en abril de 2024, se extiende 1,245 km desde Laoag hasta Quezon City y activa 28 nodos; en 2026 DICT adjudicó su operación y mantenimiento."
  },
  {
    "nombre": "KOREN Seoul–Busan mainland backbone corridor",
    "operador": "KOREN",
    "pais": "KR",
    "ciudades": ["Seoul", "Suwon", "Daejeon", "Daegu", "Busan"],
    "estado": "en servicio",
    "fuente": "https://www.koren.kr/ — la documentación oficial de KOREN identifica su backbone de alta velocidad y los nodos Seoul, Suwon, Pangyo, Daejeon, Daegu y Busan entre las diez ciudades conectadas; la lista aquí conserva los principales nodos urbanos del corredor continental y no incluye Jeju."
  },
  {
    "nombre": "KOREN Daejeon–Gwangju mainland backbone corridor",
    "operador": "KOREN",
    "pais": "KR",
    "ciudades": ["Daejeon", "Jeonju", "Gwangju"],
    "estado": "en servicio",
    "fuente": "https://www.koren.kr/ — la topología/nodos publicados por KOREN incluyen Daejeon, Jeonju y Gwangju dentro del backbone nacional de alta velocidad."
  },
  {
    "nombre": "TWAREN north-south core backbone",
    "operador": "National Center for High-performance Computing (NCHC) / TWAREN",
    "pais": "TW",
    "ciudades": ["Taipei", "Hsinchu", "Taichung", "Tainan"],
    "estado": "en servicio",
    "fuente": "https://www.nchc.org.tw/ — NCHC documenta un backbone TWAREN de 400 Gb/s que interconecta los cuatro core nodes Taipei, Hsinchu, Taichung y Tainan; TWAREN empezó a operar en 2004 y ha sido actualizado posteriormente."
  },
  {
    "nombre": "Bezeq national north-south fibre corridor",
    "operador": "Bezeq",
    "pais": "IL",
    "ciudades": ["Metula", "Eilat"],
    "estado": "en servicio",
    "fuente": "https://ir.bezeq.co.il/news-releases/news-release-details/bezeq-launches-fiber-optic-plan/ — Bezeq describe su red avanzada de fibra como una red que cubre el país desde Metula en el norte hasta Eilat en el sur, por las fronteras y el interior; solo se consignan los terminales expresamente publicados."
  },
  {
    "nombre": "Omantel Muscat–Salalah fibre backbone",
    "operador": "Omantel",
    "pais": "OM",
    "ciudades": ["Muscat", "Salalah"],
    "estado": "en servicio",
    "fuente": "https://www.ciena.com/about/newsroom/press-releases/ — la comunicación oficial Ciena/Omantel de 2025 señala que la huella de fibra de Omantel interconecta landing stations y data centres, incluidos MC1 Muscat y Equinix SN1 Salalah, creando un backbone resiliente a través de Oman."
  },
  {
    "nombre": "Türk Telekom Istanbul–Ankara DWDM corridor",
    "operador": "Türk Telekom",
    "pais": "TR",
    "ciudades": ["Istanbul", "Ankara"],
    "estado": "en servicio",
    "fuente": "https://www.nokia.com/newsroom/ — la comunicación técnica oficial de Nokia y Türk Telekom citada en el informe documenta el corredor Istanbul–Ankara sobre la red DWDM en vivo de Türk Telekom durante pruebas ópticas de larga distancia."
  },
  {
    "nombre": "e& UAE Abu Dhabi–Dubai–Fujairah terrestrial backbone",
    "operador": "e& UAE / Etisalat",
    "pais": "AE",
    "ciudades": ["Abu Dhabi", "Dubai", "Fujairah"],
    "estado": "en servicio",
    "fuente": "https://www.etisalat.ae/en/footer/about-us/media-centre.html — e& documenta una red óptica nacional end-to-end basada en OXC/DWDM; su mapa oficial de conectividad citado en el informe sitúa Abu Dhabi, Dubai y Fujairah como puntos principales del backbone terrestre. No se cuentan aquí los sistemas submarinos que aterrizan en Fujairah."
  }
]
```
