# Ronda 22 · ChatGPT, Investigación avanzada (deep research) · troncales terrestres de América Latina y el Caribe

**Pregunta** (enviada tal cual en un chat nuevo de chatgpt.com con la herramienta «Investigación avanzada» activada, el 24 de octubre de 2026; no hizo preguntas aclaratorias y arrancó sola con su plan; según ChatGPT, «Investigación completada en 11m · 35 citas · 327 búsquedas»):

> Investigación profunda, en español: para TODOS los países de América Latina y el Caribe (AR, BO, BR, CL, CO, CR, CU, DO, EC, SV, GT, HT, HN, JM, MX, NI, PA, PY, PE, PR, TT, UY, VE, BZ, GY, SR y las demás islas del Caribe), documenta las principales rutas troncales de fibra óptica TERRESTRE de larga distancia (más de 100 km) que estén en servicio hoy, como listas ORDENADAS de las ciudades por las que pasan, con el operador, el año y la fuente primaria (operador, regulador, Banco Mundial, UIT, bancos de desarrollo, ONU u otra fuente oficial). Da prioridad a las zonas difíciles: conflictos, zonas remotas, islas y desiertos. Distingue bien lo que está en servicio de lo que está en proyecto, en construcción, destruido o funcionando por radioenlaces y no por fibra. No uses submarinecablemap.com, TeleGeography ni PeeringDB. Como mucho unas 8 rutas por país, las más importantes. Al final del informe, pon un único bloque JSON (un array) con solo las rutas en servicio, con objetos así: {"nombre": "...", "operador": "...", "pais": "código ISO alfa-2", "ciudades": ["Ciudad A", "Ciudad B"], "estado": "en servicio", "fuente": "URL y lo que dice"}, con nombres de ciudades en inglés como en GeoNames.

Informe copiado sin editar del documento del informe que guarda la propia página (Archivos del chat). Las marcas internas de cita de ChatGPT se han sustituido por el enlace Markdown que el propio ChatGPT da para cada una; el resto del texto es literal.

---

# Rutas troncales terrestres de fibra óptica de América Latina y el Caribe

## Criterio, fuentes y grado de certeza

Este inventario aplica un criterio deliberadamente estricto: cuento solamente infraestructura **terrestre** —fibra enterrada, aérea, ADSS u OPGW sobre redes eléctricas— cuyo corredor completo supera aproximadamente 100 km. No cuento cables submarinos, anillos metropolitanos, FTTH/GPON de acceso, radioenlaces ni proyectos que todavía no tengan evidencia de operación. Cuando una red combina fibra y microondas, no presupongo que el tramo sea óptico. Tampoco he utilizado SubmarineCableMap, TeleGeography ni PeeringDB.

Para evitar una falsa precisión, distingo dos niveles de evidencia. **A** significa que una fuente primaria u oficial publica explícitamente los tramos, nodos o un mapa de la ruta. **B** significa que la fuente oficial confirma la red y sus nodos/cobertura, pero la cadena de ciudades que presento es una síntesis conservadora de los nodos principales; no debe interpretarse como una polilínea GIS exhaustiva ni como prueba de que no existan derivaciones intermedias. Cuando la fuente no da el año de puesta en servicio, empleo `≤año` para indicar “ya estaba oficialmente documentada como operativa en ese año”, o `n/d` si ni siquiera eso permite reconstruir una fecha razonable.

Esto produce una diferencia importante entre **“el país tiene mucha fibra”** y **“puedo demostrar una determinada ruta >100 km, en el orden de ciudades pedido, y que siga en servicio”**. Por ejemplo, México tiene miles de kilómetros iluminados de CFE TEIT, Brasil tiene una extensa red Telebras y Belice tiene una red DigiNet de fibra; sin embargo, si la fuente pública no permite identificar con suficiente seguridad una cadena de ciudades, no fabrico esa cadena para rellenar el inventario. El IFT informó que la red de CFE tenía 25.582 km y 155 macrosegmentos en la documentación de la Red Troncal, y una resolución más reciente señala 11.996 km de fibra CFE TEIT habilitada e iluminada; la solicitud regulatoria de Belize Telemedia describe DigiNet como la red de fibra más desarrollada de Belice. ([ift.org.mx](https://www.ift.org.mx/sites/default/files/conocenos/pleno/sesiones/acuerdoliga/vppift210618463acc.pdf))

## América del Sur

| País | Ruta terrestre de larga distancia; ciudades/nodos principales en orden | Operador | Año | Evidencia y situación |
|---|---|---|---:|---|
| **Argentina (AR)** | **Buenos Aires → Rosario → Córdoba** — corredor central de REFEFO | ARSAT | ≤2023 | **B, en servicio.** El Gobierno argentino informó 34.500 km desplegados de REFEFO, atravesando más de 1.000 localidades; ARSAT remite además a su portal de datos abiertos para las localidades conectadas. La cadena indicada es una síntesis de nodos principales, no una enumeración de cada localidad de paso. ([argentina.gob.ar](https://www.argentina.gob.ar/noticias/el-ministerio-de-cultura-firmo-un-contrato-con-ar-sat-para-el-desarrollo-de-una-plataforma)) |
| **Bolivia (BO)** | **Desaguadero → La Paz → Oruro → Cochabamba → Santa Cruz de la Sierra → Puerto Quijarro** | ENTEL Bolivia | ≤2025 | **B, en servicio.** ENTEL describe su aporte a un corredor terrestre que enlaza Lurín, Perú, con Puerto Quijarro, Bolivia, y una red nacional superior a 44.000 km; un estudio oficial de UIT documentó la fibra entre La Paz, Oruro, Cochabamba y Santa Cruz, además de Potosí, Sucre y Tarija. ([institucional.entel.bo](https://institucional.entel.bo/inicio3.0/index.php/sala-de-prensa/noticias)) |
| **Brasil (BR)** | **No incluyo una cadena de ciudades en el JSON estricto.** | Telebras y otros | — | Telebras documentó en su informe anual una **red terrestre nacional de unos 32.000 km**, principalmente OPGW, y su mapa diferencia en azul las rutas operativas de las planeadas. La fuente de topología detallada que pude verificar es de 2020; no la considero suficientemente reciente para certificar en 2026, ciudad por ciudad, qué corredor concreto sigue en servicio sin cambios. ([telebras.com.br](https://www.telebras.com.br/wp-content/uploads/2021/06/Relat%C3%B3rio-Anual-de-Gest%C3%A3o-2020_vs-CA_25.05.2021.pdf)) |
| **Chile (CL)** | **Tortel → Cochrane → Puerto Bertrand → Puerto Río Tranquilo → Bahía Murta → Cerro Castillo → El Blanco → Coyhaique** — FOA Aysén, eje principal | Silica Networks Chile | 2021 | **A, en servicio.** SUBTEL clasifica las troncales terrestres de Aysén como **“EN OPERACIÓN”**, informa más de 617 km y fecha el inicio de la etapa de operación el 4 de noviembre de 2021. El mapa oficial permite distinguir el eje principal y sus derivaciones hacia Chile Chico, Puerto Ingeniero Ibáñez y Balmaceda. ([subtel.gob.cl](https://www.subtel.gob.cl/wp-content/uploads/2025/10/Informe_Nacional_3er_Trim_2025_Ver_rev_LF.pdf)) |
| **Chile (CL)** | **Puerto Montt → Alerce → Ensenada → Ralún → Cochamó → Puelo → Contao → El Manzano → Pichicolo → Río Negro → Hualaihué** — FOA Los Lagos | Silica Networks Chile | 2022 | **A, en servicio.** SUBTEL registra más de 247 km y señala que la etapa de operación comenzó el 7 de marzo de 2022; el mismo informe identifica operadores que ya usan capacidad de la infraestructura. ([subtel.gob.cl](https://www.subtel.gob.cl/wp-content/uploads/2025/10/Informe_Nacional_3er_Trim_2025_Ver_rev_LF.pdf)) |
| **Colombia (CO)** | **Bogotá → Bucaramanga → Cúcuta** — corredor PNFO | Azteca Comunicaciones Colombia / PNFO | 2012–2014 | **B, en servicio.** MinTIC informa que el Proyecto Nacional de Fibra Óptica instaló más de 19.000 km y llegó inicialmente a 788 municipios; el diagnóstico oficial más reciente consultado sitúa a Azteca con presencia en unas 910 cabeceras/municipios y señala que alrededor del 96 % de las cabeceras municipales tiene conexión a la red nacional de fibra. La secuencia aquí es de nodos troncales principales. ([mintic.gov.co](https://www.mintic.gov.co/portal/715/w3-propertyvalue-118085.html)) |
| **Colombia (CO)** | **Bogotá → Villavicencio → Granada → San José del Guaviare** — corredor oriental PNFO | Azteca Comunicaciones Colombia / PNFO | 2012–2014 | **B, en servicio.** Es el corredor remoto que puede sostenerse conservadoramente con la cobertura PNFO; no lo prolongué hasta Inírida o Mitú porque el propio MinTIC las identifica entre las zonas sin conexión nacional de transporte/fibra y el PNCAV ha recurrido a microondas en territorios amazónicos y de la Orinoquía. ([mintic.gov.co](https://mintic.gov.co/micrositios/PlanConectividadDigital/870/articles-399394_documento.pdf)) |
| **Ecuador (EC)** | **Pomasqui → Tulcán** | CELEC EP / Transelectric | n/d | **A, en servicio en la documentación operacional de CELEC.** CELEC registra intervenciones sobre el OPGW del enlace **Pomasqui–Tulcán**, lo que identifica directamente la ruta óptica. ([buzon.celec.gob.ec](https://buzon.celec.gob.ec/VIATICOS/TRANSELECTRIC/MENA%20TRUJILLO%20ALFONSO%20PATRICIO%20-%20AMBATO%20%20%20IBARRA%20-%20%2025%20AL%2030%20DE%20OCTUBRE%202021.pdf)) |
| **Ecuador (EC)** | **La Concordia → Quinindé → Esmeraldas** | CELEC EP / Transelectric | n/d | **A, en servicio.** CELEC documenta mantenimiento de OPGW en **La Concordia–Quinindé** y **Quinindé–Esmeraldas**, formando un corredor terrestre continuo superior a 100 km hacia la costa norte. ([buzon.celec.gob.ec](https://buzon.celec.gob.ec/VIATICOS/TRANSELECTRIC/MENDOZA%20SOLORZANO%20BOSCO%20DAVID%20-%20GUAYAQUIL%20%20%20MACHALA%20%20-%202%20AL%2011%20DE%20AGOSTO%202022.pdf)) |
| **Guyana (GY)** | **Ninguna ruta añadida al inventario estricto.** | — | — | La bibliografía institucional/regional disponible confirma infraestructura de telecomunicaciones en Guyana, pero la fuente oficial de ruta terrestre >100 km con cadena de ciudades y estado operativo actual no quedó suficientemente determinada en esta revisión. Un estudio del BID que trata expresamente a Guyana es demasiado antiguo para usarlo como prueba de estado en 2026. ([publications.iadb.org](https://publications.iadb.org/publications/english/document/Promoting-Investment-in-Information-and-Communications-Technologies-in-the-Caribbean.pdf)) |
| **Paraguay (PY)** | **Ayolas → Villa Hayes** — OPGW del corredor de transmisión de 500 kV | ANDE | n/d | **A/B.** La documentación de ANDE del corredor Ayolas–Villa Hayes especifica la infraestructura OPGW asociada a la línea, de unos 300 km. La infraestructura eléctrica es real, pero no encontré en la fuente consultada una fecha inequívoca de alta comercial de servicios de telecomunicaciones; por ello la mantengo fuera del JSON más estricto. ([ande.gov.py](https://www.ande.gov.py/documentos/ANALISISAMBIENTALYSOCIALPR-L1058.pdf)) |
| **Perú (PE)** | **Lima → Chimbote → Trujillo → Chiclayo → Piura → Tumbes** — RDNFO, corredor norte | PRONATEL / Estado peruano | 2016 | **B, en servicio.** La RDNFO tiene aproximadamente 13.400–13.500 km, cientos de nodos y alcanza las capitales regionales; PRONATEL confirma que el Estado seguía operándola provisionalmente en 2025. La lista muestra los grandes nodos urbanos del eje norte y omite nodos distritales intermedios. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/437961622100426604/pdf/Peru-Digital-Infrastructure-Initiative.pdf)) |
| **Perú (PE)** | **Lima → Huancayo → Huancavelica → Ayacucho → Abancay → Cusco** — RDNFO, corredor centro-sur andino | PRONATEL / Estado peruano | 2016 | **B, en servicio.** Mismo criterio: es una síntesis de capitales/nodos del dorsal, cuya operación provisional por PRONATEL seguía vigente en 2025. ([pronatel.gob.pe](https://www.pronatel.gob.pe/des2025/informe_i000026_17102025.pdf)) |
| **Suriname (SR)** | **Ninguna ruta >100 km con traza troncal verificable añadida.** | Telesur | — | Telesur ofrece actualmente fibra y en 2026 seguía profundizando su transformación digital, pero las fuentes disponibles que pude verificar describen principalmente acceso/FTTx e interconexión internacional, no una cadena terrestre nacional de ciudades >100 km que pueda separar limpiamente de la red de acceso. ([telesur.sr](https://www.telesur.sr/internet/)) |
| **Uruguay (UY)** | **Montevideo → Atlántida → Maldonado** — corredor oriental | Antel | ≤2026 | **A/B, en servicio.** En octubre de 2026 Antel informó cortes físicos en la **red nacional de transporte de fibra** sobre Ruta 9 y la Interbalnearia, incluido un punto próximo a Atlántida, que afectaron el acceso internacional ligado a Maldonado. Eso proporciona una confirmación excepcionalmente reciente de que el corredor óptico oriental sigue activo. ([antel.com.uy](https://antel.com.uy/institucional/sala-de-prensa/comunicados/cortes-en-troncales-de-fibra-afectan-servicio-de-internet)) |
| **Venezuela (VE)** | **Ninguna cadena concreta certificada como actual en el JSON.** | CANTV | — | CONATEL documentó el proyecto histórico de más de 6.600–7.000 km de transporte óptico asignado a CANTV y planes posteriores de expansión, pero los documentos 2025–2031 mezclan red existente con nuevas metas y despliegues, incluida Guayana Esequiba. Sin una traza actual inequívoca, no convierto esos objetivos en rutas “en servicio”. ([conatel.gob.ve](https://conatel.gob.ve/wp-content/uploads/2024/08/Informe-Anual-Ano-2009.pdf)) |

La zona remota más clara fuera de las rutas anteriores es **Vaca Díez, Beni**: ENTEL anunció en octubre de 2025 la terminación y puesta en servicio de **235 km** de fibra subterránea, divididos en los tramos Sheraton–Mariposas–Cayuses–Triángulo y Riberalta–Rosario del Yata–Guayaramerín. Es un caso importante de conectividad amazónica, pero no lo convierto artificialmente en una sola ruta lineal >100 km porque la fuente describe dos segmentos separados y no proporciona longitud individual de cada uno. ([institucional.entel.bo](https://institucional.entel.bo/inicio3.0/index.php/sala-de-prensa/noticias?start=36))

## México y Centroamérica

La infraestructura regional más fácil de documentar con precisión es la fibra de **REDCA sobre las torres de la línea SIEPAC**. ENATREL identifica a REDCA como la red centroamericana de telecomunicaciones instalada sobre SIEPAC y señala su operación Guatemala–Panamá; EPR publica las secciones, longitudes y fechas de entrada de la línea, mientras que SUTEL identifica expresamente en Costa Rica los enlaces de fibra REDCA. EPR sigue describiendo el primer circuito como infraestructura comercial en operación; el segundo circuito que aparece en documentos de 2026 es una ampliación y **no** lo mezclo con la fibra ya operativa. ([enatrel.gob.ni](https://www.enatrel.gob.ni/redca-comenzara-a-operar-con-toda-su-capacidad/))

| País | Ruta terrestre de larga distancia; ciudades/nodos en orden | Operador | Año | Evidencia y situación |
|---|---|---|---:|---|
| **México (MX)** | **No publico una cadena de ciudades como si estuviera demostrada.** | CFE TEIT / CFE; además redes privadas | — | El IFT documenta 155 macrosegmentos y 25.582 km de la fibra CFE aportable a la Red Troncal; una resolución de 2025 señala que CFE TEIT tenía **11.996 km habilitados e iluminados**. El propio expediente contiene un mapa, pero la información textual consultable no da una lista ordenada de ciudades por macrosegmento. Es preferible omitir rutas concretas que inferirlas de presencia comercial de operadores. ([ift.org.mx](https://www.ift.org.mx/sites/default/files/conocenos/pleno/sesiones/acuerdoliga/vppift210618463acc.pdf)) |
| **Belize (BZ)** | **Sin ruta >100 km de ciudades suficientemente documentada.** | Belize Telemedia / Digi | — | La solicitud de licencia presentada ante la PUC en 2024 confirma una extensa infraestructura de fibra DigiNet, pero no publica en el texto recuperable una cadena troncal de ciudades que permita cumplir el estándar de este inventario. ([puc.bz](https://www.puc.bz/wp-content/uploads/2024/11/BTL-Application-for-Telecommunications-Licence-Individual-Class-Licence.pdf)) |
| **Guatemala (GT)** | **Guatemala City / Guate Norte → Panaluya → El Florido** | REDCA, sobre SIEPAC/EPR | 2015 | **A, en servicio.** EPR da Guate Norte–Panaluya = 109,91 km y Panaluya–El Florido = 73,46 km; el corredor suma más de 180 km. Guate Norte se normaliza a Guatemala City en la lista de ciudades. ([eprsiepac.com](https://eprsiepac.com/linea-siepac/)) |
| **El Salvador (SV)** | **Ahuachapán → Nejapa → corredor de 15 de Septiembre** | REDCA, sobre SIEPAC/EPR | 2015 | **A, en servicio.** La ruta nacional completa publicada por EPR es frontera Guatemala–Ahuachapán–Nejapa–15 de Septiembre–frontera Honduras, con **287,65 km**. “15 de Septiembre” es el nombre de la subestación, no una ciudad; por ello el JSON conserva sólo ciudades/localidades claramente normalizables. ([eprsiepac.com](https://eprsiepac.com/linea-siepac/)) |
| **Honduras (HN)** | **El Florido → San Buenaventura** | REDCA, sobre SIEPAC/EPR | 2015 | **A, en servicio.** EPR publica 141 km entre ambos nodos. ([eprsiepac.com](https://eprsiepac.com/linea-siepac/)) |
| **Honduras (HN)** | **frontera con El Salvador → Aguacaliente → frontera con Nicaragua** | REDCA, sobre SIEPAC/EPR | 2015 | **A, en servicio.** EPR publica 54,39 km desde la frontera salvadoreña a Aguacaliente y 60,68 km desde allí a Nicaragua, más de 115 km en conjunto. La fuente nombra fronteras y subestación, no dos ciudades terminales inequívocas; por eso este segundo corredor no lo fuerzo a nombres urbanos en el JSON. ([eprsiepac.com](https://eprsiepac.com/linea-siepac/)) |
| **Nicaragua (NI)** | **Ciudad Sandino → Ticuantepe**, dentro del corredor Honduras–Costa Rica | REDCA, sobre SIEPAC/EPR | 2015 | **A/B, en servicio.** El segmento nicaragüense completo tiene **305,64 km**: frontera Honduras–Sandino 144,88 km; Sandino–Ticuantepe 64,78 km; Ticuantepe–frontera Costa Rica 125,98 km. El JSON enumera los nodos urbanos interiores y la fuente conserva los extremos fronterizos. ([eprsiepac.com](https://eprsiepac.com/linea-siepac/)) |
| **Costa Rica (CR)** | **Cañas → Parrita → Palmar Norte → Río Claro** | REDCA, sobre SIEPAC/EPR | 2014–2015 | **A, en servicio.** SUTEL enumera directamente los enlaces de fibra REDCA: Ticuantepe–Cañas, Cañas–Parrita, Parrita–Palmar Norte, Palmar Norte–Río Claro y Río Claro–Veladero. EPR da 159,24 km para Cañas–Parrita y 130,56 km para Parrita–Palmar Norte, de modo que el corredor indicado supera holgadamente el umbral. ([plataformadocumental.sutel.go.cr](https://plataformadocumental.sutel.go.cr/rnt/DocView.aspx?dbid=0&id=672179)) |
| **Panamá (PA)** | **Paso Canoas / frontera de Costa Rica → Veladero** | REDCA, sobre SIEPAC/EPR | 2014–2015 | **A/B, en servicio.** EPR publica **150,2 km** desde la frontera costarricense hasta Veladero; SUTEL describe el enlace regional como Río Claro–Veladero. “Paso Canoas” se usa únicamente para normalizar el punto fronterizo a una localidad reconocible. ([eprsiepac.com](https://eprsiepac.com/linea-siepac/)) |

Nicaragua también tiene una red nacional propia de ENATREL, separable conceptualmente de REDCA: la empresa describe transporte por fibra DWDM/IP-MPLS y distingue explícitamente sus servicios de radioenlace; documentos de expansión informaron más de 2.000 km ADSS y decenas de nodos. No obstante, al no disponer aquí de una lista oficial ordenada de tramos >100 km tan precisa como la de SIEPAC, no dupliqué las rutas nicaragüenses. ([enatrel.gob.ni](https://www.enatrel.gob.ni/nicaragua-mas-cerca-de-contar-con-mayor-conectividad-digital/))

## Caribe hispano y grandes islas

| País o territorio | Ruta / situación | Operador | Año | Evidencia y situación |
|---|---|---|---:|---|
| **Cuba (CU)** | **Sandino → Pinar del Río → San Cristóbal → Artemisa → San José de las Lajas → Matanzas → Santa Clara → Placetas → Sancti Spíritus → Ciego de Ávila** | ETECSA | 2012 o antes | **A/B, en servicio.** Una publicación técnica de la propia ETECSA muestra el mapa del “Backbone nacional” con esos nodos y una red de transporte SDH soportada en fibra; otra publicación de ETECSA señala que se había culminado el dorsal nacional y desplegado SDH/DWDM. La topología es histórica, pero la red nacional continúa siendo la infraestructura de transporte de ETECSA. ([revistatono.etecsa.cu](https://www.revistatono.etecsa.cu/tono/article/download/91/158/306)) |
| **Cuba (CU), Oriente** | **Ciego de Ávila → Camagüey → Las Tunas → Holguín → Bayamo → Santiago de Cuba → Guantánamo** | ETECSA | — | **No lo incluyo en el JSON estricto.** El mapa histórico sí muestra el dorsal oriental, pero tras el huracán Melissa ETECSA informó en noviembre de 2025 cortes de fibra en Granma y Santiago y la interrupción de **las dos vías de fibra hacia Guantánamo**, donde se habilitó una alternativa por radioenlace. Sin una fuente posterior que confirme explícitamente la restauración integral de esa cadena concreta, sería incorrecto llamarla íntegramente “en servicio hoy”. ([revistatono.etecsa.cu](https://www.revistatono.etecsa.cu/tono/article/download/91/158/306)) |
| **República Dominicana (DO)** | **Santo Domingo → Santiago de los Caballeros** — RNFO | ETED | ≤2020; red vigente en 2026 | **B, en servicio.** INDOTEL informó que ETED presentó su Red Nacional de Fibra Óptica a los prestadores; en 2026 ETED sigue describiendo la RNFO como infraestructura nacional que opera y moderniza. La cadena indicada representa los dos grandes nodos del corredor central, no todas las subestaciones. ([indotel.gob.do](https://indotel.gob.do/wp-content/uploads/2022/10/memorias-2019-2020.pdf)) |
| **Haiti (HT)** | **No certifico ninguna ruta >100 km como puramente óptica y operativa hoy.** | Natcom / Digicel | — | Esta exclusión es importante. CONATEL documentó daños severos en la fibra de Natcom y Digicel sobre Route Nationale 2 y hacia Jérémie tras Matthew. El Banco Mundial señaló posteriormente que las redes troncales de fibra habían quedado interrumpidas en algunas zonas y que, donde era necesario, se dependía de tecnologías inalámbricas; además describe enlaces de estaciones base por **radio o fibra**, según disponibilidad. Un proyecto posterior contempló unos 200 km adicionales de fibra, pero era inversión/proyecto, no prueba de una ruta existente. ([conatel.gouv.ht](https://www.conatel.gouv.ht/node/273)) |
| **Jamaica (JM)** | **Kingston → Spanish Town → May Pen → Mandeville → Savanna-la-Mar → Montego Bay** — Government/National Broadband backbone | Gobierno de Jamaica con NWA, eGov y fibra de C&W/Digicel/JPS y otros | 2022 | **B, en servicio.** En 2021 el Gobierno ya había extendido su huella de fibra a St Catherine, Clarendon, Manchester, Westmoreland y St James. En 2022 informó que el 95 % del backbone de emergencia previsto estaba terminado, que todas las Municipal Corporations estaban ya conectadas por fibra y que las alianzas daban acceso a más de **630 km de fibra**. El orden urbano sigue el corredor de capitales municipales del sur y oeste; no implica que cada metro de fibra siga exactamente la carretera principal. ([mset.gov.jm](https://www.mset.gov.jm/2021/10/01/statement-to-parliament-update-on-the-national-broadband-plan/)) |
| **Puerto Rico (PR)** | **Ninguna ruta actual incluida.** | PRITS / operadores privados | — | La actuación primaria reciente que pude verificar de PRITS es un **RFI** para desplegar fibra a unas 1.229 intersecciones semaforizadas; por definición es una consulta/proyecto, no una ruta existente que deba presentarse como “en servicio”. ([prits.pr.gov](https://www.prits.pr.gov/rfi-and-rfq)) |
| **Trinidad and Tobago (TT)** | **Ninguna ruta terrestre individual >100 km documentada con los requisitos pedidos.** | TSTT y otros | — | TSTT confirma que despliega y opera redes de fibra y radio, pero la fuente corporativa disponible no publica una ruta troncal terrestre >100 km con ciudades ordenadas; no convierto una red nacional de acceso/metro en una ruta de larga distancia. ([tstt.co.tt](https://www.tstt.co.tt/corporate-history)) |

El caso haitiano ilustra por qué no es seguro inferir “fibra” a partir de mera cobertura móvil. El Banco Mundial afirma expresamente que las estaciones de los dos grandes operadores se enlazan por radio o, cuando es posible, por fibra instalada en las rutas principales, y que desastres anteriores dejaron partes del backbone dependientes de tecnología inalámbrica. Por tanto, una línea en un mapa de cobertura 3G/4G no constituye prueba de una troncal óptica terrestre. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/127181606851449191/pdf/Haiti-Digital-Acceleration-Project.pdf))

## Islas pequeñas y territorios del Caribe

Para las islas siguientes, **“sin ruta” no significa “sin fibra”**. Significa solamente que no hallé una **ruta terrestre individual >100 km**, con una secuencia de ciudades y estado de servicio demostrables al nivel exigido. Los proyectos CARCIP, por ejemplo, desplegaron nuevas redes nacionales de fibra en Saint Lucia, Saint Vincent and the Grenadines y Grenada, y la UIT ya documentaba una red de fibra “island-wide” en Saint Lucia; eso no convierte automáticamente esas redes insulares en un corredor terrestre de más de 100 km. ([ctu.int](https://ctu.int/caribbean-regional-communications-infrastructure-project/))

| Jurisdicciones cubiertas | Resultado de la búsqueda |
|---|---|
| **Antigua and Barbuda (AG), Bahamas (BS), Barbados (BB), Dominica (DM), Grenada (GD), Saint Kitts and Nevis (KN), Saint Lucia (LC), Saint Vincent and the Grenadines (VC)** | No incorporo una ruta >100 km. Fuentes regionales del BID, ONU/UIT y organismos caribeños documentan infraestructura y backbones nacionales, pero no una cadena terrestre >100 km que cumpla simultáneamente longitud, ciudades ordenadas y operación actual. ([publications.iadb.org](https://publications.iadb.org/publications/english/document/Promoting-Investment-in-Information-and-Communications-Technologies-in-the-Caribbean.pdf)) |
| **Anguilla (AI), Aruba (AW), British Virgin Islands (VG), Cayman Islands (KY), Curaçao (CW), Montserrat (MS), Turks and Caicos Islands (TC), U.S. Virgin Islands (VI)** | No encontré en las fuentes primarias/regionales revisadas una ruta terrestre individual >100 km con la evidencia requerida; por ello no hay objetos para estas jurisdicciones en el JSON. Los estudios caribeños revisados tratan redes nacionales y conectividad internacional, no una ruta terrestre larga que pueda documentarse como la solicitada. ([publications.iadb.org](https://publications.iadb.org/publications/english/document/Promoting-Investment-in-Information-and-Communications-Technologies-in-the-Caribbean.pdf)) |
| **Guadeloupe (GP), Martinique (MQ), Saint Barthélemy (BL), Saint Martin (MF), Sint Maarten (SX), Bonaire/Sint Eustatius/Saba (BQ)** | Mismo resultado: no se añade una ruta >100 km. La ausencia en el inventario no afirma que carezcan de fibra, sino que no se cumple el filtro de troncal terrestre larga con trazado oficial verificable. ([repositorio.cepal.org](https://repositorio.cepal.org/server/api/core/bitstreams/9c7f04bd-6e76-4ebc-8738-a3e656eae822/content)) |
| **Bermuda (BM)** | La incluyo sólo por completitud de las agrupaciones telecom “Caribbean/Atlantic”; geográficamente no está en el mar Caribe. No encontré una ruta terrestre >100 km que cumpla el criterio, por lo que tampoco figura en el JSON. |
| **French Guiana (GF)** | Territorio continental sudamericano, no isla caribeña. No obtuve en las fuentes primarias revisadas una cadena terrestre de ciudades suficientemente actual y explícita para incorporarla sin especulación. |

Un caso que merece atención especial es **The Bahamas**: que un Estado sea archipelágico no permite sumar tramos submarinos entre islas para superar 100 km. El requisito del usuario es terrestre, por lo que cada tramo insular tendría que superar el umbral por sí mismo; las fuentes regionales consultadas no documentaron uno con los requisitos necesarios. El mismo principio se aplica a Turks and Caicos, British Virgin Islands, U.S. Virgin Islands, Antigua and Barbuda y Saint Kitts and Nevis. ([publications.iadb.org](https://publications.iadb.org/publications/english/document/Promoting-Investment-in-Information-and-Communications-Technologies-in-the-Caribbean.pdf))

## Exclusiones decisivas: proyecto, construcción, daños y radio

**Chile.** El informe de SUBTEL usado para FOA diferencia con claridad los sistemas **“EN OPERACIÓN”** de iniciativas que todavía estaban en implementación. Por ello conté FOA Aysén y Los Lagos, pero no convertí automáticamente otros proyectos como la Fibra Óptica Nacional en rutas operativas sin una confirmación posterior de puesta en servicio. ([subtel.gob.cl](https://www.subtel.gob.cl/wp-content/uploads/2025/10/Informe_Nacional_3er_Trim_2025_Ver_rev_LF.pdf))

**Colombia.** El hecho de que el PNFO llegue a la enorme mayoría de cabeceras no significa que todos los municipios amazónicos estén conectados por fibra. La documentación de MinTIC distingue el PNFO del **Proyecto Nacional de Conectividad de Alta Velocidad**, que utiliza soluciones de microondas en territorios difíciles, y sigue identificando sitios como Inírida y Mitú entre las zonas sin conexión nacional de transporte comparable. Tampoco conté el Plan de Fibra Óptica para Amazonía mientras la fuente lo presentara como proyecto aprobado y no como red ya en servicio. ([mintic.gov.co](https://mintic.gov.co/micrositios/PlanConectividadDigital/870/articles-399394_documento.pdf))

**Haiti.** Route Nationale 2 y la ruta hacia Jérémie tuvieron fibra de Natcom y Digicel, pero CONATEL documentó daños de Matthew y el Banco Mundial advirtió que en distintos puntos del backbone se recurría a inalámbrico. Que el Banco Mundial haya previsto financiar extensiones de unos 200 km de fibra tampoco demuestra que esos 200 km estuvieran ya operativos. Por eso Haití queda fuera del bloque de rutas en servicio, en lugar de presentar como fibra una ruta que puede contener radioenlaces o secciones todavía vulnerables. ([conatel.gouv.ht](https://www.conatel.gouv.ht/node/273))

**Cuba.** En Oriente existe una topología óptica histórica perfectamente visible en el mapa de ETECSA, pero el huracán Melissa provocó en 2025 cortes de fibra en Granma y Santiago de Cuba y dejó a Guantánamo sin sus dos vías de fibra, con una solución alternativa por radio. Al no disponer de una fuente posterior de ETECSA que confirme explícitamente la restauración de todos esos tramos, el JSON retiene el dorsal occidental-central y excluye el corredor oriental afectado. ([revistatono.etecsa.cu](https://www.revistatono.etecsa.cu/tono/article/download/91/158/306))

**Centroamérica.** REDCA/SIEPAC es distinto de la ampliación del sistema. EPR publica en 2026 actuaciones para un **segundo circuito**; esas obras/tender no son la razón por la que aparecen Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica y Panamá en el inventario. Lo que cuento es la fibra del primer SIEPAC/REDCA, que lleva años en explotación comercial. ([eprsiepac.com](https://eprsiepac.com/))

**México, Puerto Rico y Suriname.** En México hay prueba contemporánea de miles de kilómetros iluminados, pero no una lista oficial de macrosegmentos en formato suficientemente legible para reconstruir responsablemente las ciudades; en Puerto Rico la actuación de PRITS recuperada es un RFI, por lo que es proyecto; y en Suriname la oferta actual de Telesur demuestra fibra de acceso, no por sí sola una troncal terrestre >100 km. Los tres casos se omiten del JSON antes que confundir “hay fibra” con “esta ruta larga exacta está en servicio”. ([ift.org.mx](https://www.ift.org.mx/sites/default/files/conocenos/pleno/sesiones_pleno/acuerdo_liga/vp_150125_8_confidencial_acc_0.pdf))

## JSON final

```json
[
  {
    "nombre": "REFEFO – corredor central Buenos Aires–Rosario–Córdoba",
    "operador": "ARSAT",
    "pais": "AR",
    "ciudades": ["Buenos Aires", "Rosario", "Córdoba"],
    "estado": "en servicio",
    "fuente": "https://www.arsat.com.ar/ — ARSAT mantiene la Red Federal de Fibra Óptica; el Gobierno argentino informó en 2023 34,500 km desplegados y más de 1,000 localidades atravesadas. La secuencia es una síntesis de nodos principales de REFEFO, no una lista exhaustiva de localidades intermedias."
  },
  {
    "nombre": "ENTEL dorsal oeste–este Desaguadero–Puerto Quijarro",
    "operador": "ENTEL Bolivia",
    "pais": "BO",
    "ciudades": ["Desaguadero", "La Paz", "Oruro", "Cochabamba", "Santa Cruz de la Sierra", "Puerto Quijarro"],
    "estado": "en servicio",
    "fuente": "https://www.entel.bo/ — ENTEL documenta su red terrestre nacional de más de 44,000 km y el corredor que conecta Lurín, Perú, con Puerto Quijarro, Bolivia; la UIT documenta como principales ciudades de la fibra boliviana La Paz, Oruro, Cochabamba y Santa Cruz."
  },
  {
    "nombre": "FOA Aysén – eje principal",
    "operador": "Silica Networks Chile",
    "pais": "CL",
    "ciudades": ["Tortel", "Cochrane", "Puerto Bertrand", "Puerto Río Tranquilo", "Bahía Murta", "Cerro Castillo", "El Blanco", "Coyhaique"],
    "estado": "en servicio",
    "fuente": "https://www.subtel.gob.cl/ — SUBTEL, informe nacional de proyectos FDT 3T 2025: FOA Aysén tiene más de 617 km, figura EN OPERACIÓN y la etapa de operación comenzó el 4-Nov-2021; el mapa oficial muestra estos POIIT sobre el eje principal."
  },
  {
    "nombre": "FOA Los Lagos",
    "operador": "Silica Networks Chile",
    "pais": "CL",
    "ciudades": ["Puerto Montt", "Alerce", "Ensenada", "Ralún", "Cochamó", "Puelo", "Contao", "El Manzano", "Pichicolo", "Río Negro", "Hualaihué"],
    "estado": "en servicio",
    "fuente": "https://www.subtel.gob.cl/ — SUBTEL, informe nacional de proyectos FDT 3T 2025: FOA Los Lagos supera 247 km y su etapa de operación comenzó el 7-Mar-2022; el documento publica el mapa y las localidades de la troncal."
  },
  {
    "nombre": "PNFO – corredor Bogotá–Cúcuta",
    "operador": "Azteca Comunicaciones Colombia",
    "pais": "CO",
    "ciudades": ["Bogotá", "Bucaramanga", "Cúcuta"],
    "estado": "en servicio",
    "fuente": "https://www.mintic.gov.co/ — MinTIC documenta más de 19,000 km instalados por el Proyecto Nacional de Fibra Óptica, inicialmente 788 municipios, y en documentación más reciente atribuye a Azteca presencia en alrededor de 910 municipios; la secuencia es una síntesis de nodos troncales principales."
  },
  {
    "nombre": "PNFO – corredor oriental Bogotá–San José del Guaviare",
    "operador": "Azteca Comunicaciones Colombia",
    "pais": "CO",
    "ciudades": ["Bogotá", "Villavicencio", "Granada", "San José del Guaviare"],
    "estado": "en servicio",
    "fuente": "https://www.mintic.gov.co/ — MinTIC confirma la cobertura nacional del PNFO y distingue las zonas amazónicas que todavía dependen de otras soluciones; la cadena indicada es una síntesis conservadora del corredor de fibra hasta San José del Guaviare y no se prolonga a Inírida o Mitú."
  },
  {
    "nombre": "CELEC OPGW Pomasqui–Tulcán",
    "operador": "CELEC EP / Transelectric",
    "pais": "EC",
    "ciudades": ["Pomasqui", "Tulcán"],
    "estado": "en servicio",
    "fuente": "https://www.celec.gob.ec/ — CELEC documenta trabajos operacionales y de reparación sobre el cable OPGW del enlace Pomasqui–Tulcán, identificando expresamente esta ruta de fibra."
  },
  {
    "nombre": "CELEC OPGW La Concordia–Quinindé–Esmeraldas",
    "operador": "CELEC EP / Transelectric",
    "pais": "EC",
    "ciudades": ["La Concordia", "Quinindé", "Esmeraldas"],
    "estado": "en servicio",
    "fuente": "https://www.celec.gob.ec/ — CELEC documenta mantenimiento de los enlaces OPGW La Concordia–Quinindé y Quinindé–Esmeraldas, formando un corredor óptico terrestre continuo superior a 100 km."
  },
  {
    "nombre": "RDNFO – corredor norte",
    "operador": "PRONATEL / Estado peruano",
    "pais": "PE",
    "ciudades": ["Lima", "Chimbote", "Trujillo", "Chiclayo", "Piura", "Tumbes"],
    "estado": "en servicio",
    "fuente": "https://www.pronatel.gob.pe/ — PRONATEL mantiene la operación provisional de la Red Dorsal Nacional de Fibra Óptica; documentos oficiales/Banco Mundial describen aproximadamente 13,400–13,500 km, cientos de nodos y conexión de capitales regionales. La lista contiene los grandes nodos del eje norte."
  },
  {
    "nombre": "RDNFO – corredor centro-sur andino",
    "operador": "PRONATEL / Estado peruano",
    "pais": "PE",
    "ciudades": ["Lima", "Huancayo", "Huancavelica", "Ayacucho", "Abancay", "Cusco"],
    "estado": "en servicio",
    "fuente": "https://www.pronatel.gob.pe/ — PRONATEL confirma que el Estado seguía operando provisionalmente la RDNFO en 2025; la secuencia resume nodos regionales del corredor andino y omite nodos distritales intermedios."
  },
  {
    "nombre": "ANTEL – corredor oriental Montevideo–Maldonado",
    "operador": "Antel",
    "pais": "UY",
    "ciudades": ["Montevideo", "Atlántida", "Maldonado"],
    "estado": "en servicio",
    "fuente": "https://www.antel.com.uy/ — Antel informó en octubre de 2026 cortes físicos de su red nacional de transporte de fibra sobre Ruta 9 y la Interbalnearia, incluido un punto cerca de Atlántida, que afectaron el acceso internacional asociado a Maldonado; ello confirma la operación actual del corredor."
  },
  {
    "nombre": "REDCA/SIEPAC Guatemala – Guate Norte–El Florido",
    "operador": "REDCA",
    "pais": "GT",
    "ciudades": ["Guatemala City", "Panaluya", "El Florido"],
    "estado": "en servicio",
    "fuente": "https://www.eprsiepac.com/ — EPR publica Guate Norte–Panaluya 109.91 km y Panaluya–El Florido 73.46 km; ENATREL identifica a REDCA como operador/administrador de la fibra instalada sobre SIEPAC y documenta su operación regional. Guate Norte se normaliza a Guatemala City."
  },
  {
    "nombre": "REDCA/SIEPAC El Salvador – corredor oeste–este",
    "operador": "REDCA",
    "pais": "SV",
    "ciudades": ["Ahuachapán", "Nejapa"],
    "estado": "en servicio",
    "fuente": "https://www.eprsiepac.com/ — EPR publica la ruta nacional frontera Guatemala–Ahuachapán–Nejapa–15 de Septiembre–frontera Honduras, total 287.65 km. El array enumera sólo localidades urbanas inequívocas; 15 de Septiembre es una subestación."
  },
  {
    "nombre": "REDCA/SIEPAC Honduras – El Florido–San Buenaventura",
    "operador": "REDCA",
    "pais": "HN",
    "ciudades": ["El Florido", "San Buenaventura"],
    "estado": "en servicio",
    "fuente": "https://www.eprsiepac.com/ — EPR publica un tramo El Florido–San Buenaventura de 141 km; la fibra de REDCA utiliza la infraestructura SIEPAC y está en explotación regional."
  },
  {
    "nombre": "REDCA/SIEPAC Nicaragua – corredor nacional",
    "operador": "REDCA",
    "pais": "NI",
    "ciudades": ["Ciudad Sandino", "Ticuantepe"],
    "estado": "en servicio",
    "fuente": "https://www.eprsiepac.com/ — EPR publica para Nicaragua 305.64 km: frontera Honduras–Sandino 144.88 km, Sandino–Ticuantepe 64.78 km y Ticuantepe–frontera Costa Rica 125.98 km. El array contiene los nodos urbanos interiores de la ruta."
  },
  {
    "nombre": "REDCA/SIEPAC Costa Rica – Cañas–Río Claro",
    "operador": "REDCA",
    "pais": "CR",
    "ciudades": ["Cañas", "Parrita", "Palmar Norte", "Río Claro"],
    "estado": "en servicio",
    "fuente": "https://sutel.go.cr/ — SUTEL enumera expresamente como enlaces de fibra REDCA Ticuantepe–Cañas, Cañas–Parrita, Parrita–Palmar Norte, Palmar Norte–Río Claro y Río Claro–Veladero; EPR da 159.24 km Cañas–Parrita y 130.56 km Parrita–Palmar Norte."
  },
  {
    "nombre": "REDCA/SIEPAC Panamá – frontera Costa Rica–Veladero",
    "operador": "REDCA",
    "pais": "PA",
    "ciudades": ["Paso Canoas", "Veladero"],
    "estado": "en servicio",
    "fuente": "https://www.eprsiepac.com/ — EPR publica 150.2 km entre la frontera de Costa Rica y Veladero; Paso Canoas se usa para normalizar el extremo fronterizo a la localidad correspondiente."
  },
  {
    "nombre": "ETECSA – dorsal occidental-central",
    "operador": "ETECSA",
    "pais": "CU",
    "ciudades": ["Sandino", "Pinar del Río", "San Cristóbal", "Artemisa", "San José de las Lajas", "Matanzas", "Santa Clara", "Placetas", "Sancti Spíritus", "Ciego de Ávila"],
    "estado": "en servicio",
    "fuente": "https://www.revistatono.etecsa.cu/tono/article/download/91/158/306 — Revista Técnica de ETECSA muestra el mapa del Backbone nacional soportado por una amplia red de cable de fibra óptica; publicaciones posteriores de ETECSA describen la culminación del dorsal nacional SDH/DWDM. Se excluye del objeto el corredor oriental afectado por cortes de Melissa en 2025 por falta de una confirmación posterior de restauración integral."
  },
  {
    "nombre": "ETED Red Nacional de Fibra Óptica – Santo Domingo–Santiago",
    "operador": "Empresa de Transmisión Eléctrica Dominicana (ETED)",
    "pais": "DO",
    "ciudades": ["Santo Domingo", "Santiago de los Caballeros"],
    "estado": "en servicio",
    "fuente": "https://eted.gob.do/eted-impulsa-la-modernizacion-del-sistema-nacional-de-transmision-e-infraestructura-de-fibra-optica-fortaleciendo-la-inversion-en-talento-humano/ — ETED confirma en 2026 que mantiene y moderniza su infraestructura nacional de transmisión y fibra; INDOTEL documentó previamente la presentación de la Red Nacional de Fibra Óptica de ETED a los operadores. La lista muestra los principales extremos urbanos del corredor."
  },
  {
    "nombre": "Government of Jamaica National Broadband Backbone – corredor sur y oeste",
    "operador": "Government of Jamaica / NWA / eGov Jamaica, con infraestructura aportada por operadores y utilities",
    "pais": "JM",
    "ciudades": ["Kingston", "Spanish Town", "May Pen", "Mandeville", "Savanna-la-Mar", "Montego Bay"],
    "estado": "en servicio",
    "fuente": "https://www.mset.gov.jm/wp-content/uploads/2022/05/MSET-Sectoral-Presentation-Full.pdf — El Gobierno informó en 2022 que 95% del backbone previsto estaba completado, todas las Municipal Corporations estaban conectadas por fibra y las alianzas público-privadas daban acceso a más de 630 km de fibra. La secuencia resume los principales nodos municipales del corredor sur-oeste."
  }
]
```
