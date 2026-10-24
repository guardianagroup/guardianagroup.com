# Ronda 22 · ChatGPT, Investigación avanzada (deep research) · troncales terrestres de 8 países difíciles

**Pregunta** (enviada tal cual en un chat nuevo de chatgpt.com con la herramienta «Investigación avanzada» activada, el 24 de octubre de 2026; no hizo preguntas aclaratorias y arrancó con un plan de 5 pasos; según ChatGPT, «Investigación completada en 7m · 26 citas · 239 búsquedas»):

> Investigación profunda, en español: para cada uno de estos países difíciles — Eritrea (ER), Guinea-Bisáu (GW), Corea del Norte (KP), Somalia (SO), República Centroafricana (CF), Chad (TD), Siria (SY) y Yemen (YE) — documenta las rutas troncales de fibra óptica TERRESTRE de larga distancia (más de 100 km) que estén en servicio hoy, como listas ORDENADAS de las ciudades por las que pasan, con el operador, el año y la fuente (operador, regulador, Banco Mundial, UIT, BAD, ONU u otra fuente primaria). Distingue bien lo que está en servicio de lo que está en proyecto, en construcción, destruido por la guerra o funcionando por radioenlaces y no por fibra. No uses submarinecablemap.com, TeleGeography ni PeeringDB. Al final del informe, pon un único bloque JSON (un array) con solo las rutas en servicio, con objetos así: {"nombre": "...", "operador": "...", "pais": "código ISO alfa-2", "ciudades": ["Ciudad A", "Ciudad B"], "estado": "en servicio", "fuente": "URL y lo que dice"}, con nombres de ciudades en inglés como en GeoNames.

Informe copiado sin editar del documento del informe que guarda la propia página (Archivos del chat). Las marcas internas de cita de ChatGPT se han sustituido por el enlace Markdown que el propio ChatGPT da para cada una; el resto del texto es literal.

---

# Rutas troncales terrestres de fibra óptica de larga distancia en ocho países de documentación difícil

## Alcance, criterio y nivel de certeza

Tomé **“ruta troncal terrestre de larga distancia”** como un corredor de fibra óptica físicamente terrestre —incluido OPGW sobre líneas eléctricas— cuyo recorrido verificable supera aproximadamente **100 km**. No cuento redes metropolitanas, FTTH, tramos puramente submarinos ni radioenlaces/microondas. Cuando una fuente sólo demuestra dos extremos, no invento localidades intermedias; cuando una fuente o mapa oficial/multilateral permite reconstruir el corredor, las ciudades se dan en orden geográfico.

Para **“en servicio hoy”** apliqué un criterio conservador: una ruta entra en el JSON final sólo cuando existe evidencia de puesta en servicio/operación y no encontré evidencia posterior de retirada permanente. En países donde la fuente más reciente a nivel de ruta es anterior a 2026, lo señalo expresamente. En Siria, por ejemplo, hay confirmaciones operativas de 2026; en Corea del Norte, en cambio, existe una topología histórica bastante clara, pero no una fuente primaria reciente que permita afirmar responsablemente que cada corredor continúa operativo hoy.

Hay una distinción importante en **Guinea-Bissáu**: el OPGW de OMVG está físicamente terminado, comisionado y forma parte de una red eléctrica operativa, pero la **comercialización de la capacidad óptica excedente para telecomunicaciones** seguía siendo una actividad separada y retrasada. Por ello lo clasifico como fibra troncal **en servicio como infraestructura OPGW**, no como prueba de que exista ya un producto mayorista abierto al mercado. El Banco Mundial dice explícitamente que las líneas llevan “a corresponding fiber optic cable”, que Guinea-Bissáu terminó la puesta en servicio en marzo de 2024 y que la comercialización del exceso de fibra seguía pendiente. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099122224101536812/pdf/P146830-acb9ba83-2bc3-43c4-8743-38881c02b40d.pdf?utm_source=chatgpt.com))

## Eritrea y Somalia

**Eritrea — ER**

No pude certificar ninguna ruta terrestre interurbana de fibra de **más de 100 km** que satisfaga simultáneamente los criterios de recorrido, operador y servicio actual. EriTel sí afirma oficialmente que opera una red de núcleo de fibra “end-to-end” en **Asmara** y **Massawa**, pero la formulación se refiere a los núcleos de esas ciudades, no confirma que el corredor Asmara–Massawa sea una fibra terrestre continua y operativa. EriTel añade que pretende migrar a fibra los núcleos de otras ciudades importantes, lo que refuerza la necesidad de no transformar una red urbana en una supuesta troncal interurbana. ([eritel.com.er](https://eritel.com.er/contents.php?id=1029&utm_source=chatgpt.com))

El diagnóstico del Banco Mundial sobre el Cuerno de África tampoco aporta un corredor terrestre eritreo actual: describe a **EriTel** como monopolio estatal y menciona conversaciones para extender hacia Eritrea una red troncal regional, es decir, una actuación futura y no una ruta que pueda contarse como ya operativa. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/233431634259568617/pdf/Overview-of-Digital-Development-in-the-Horn-of-Africa.pdf))

**Resultado ER:** **ninguna ruta >100 km certificable** con las fuentes públicas primarias/multilaterales localizadas. Esto no significa que sea físicamente imposible que EriTel utilice fibra interurbana; significa que no hay base documental suficiente para introducir una ruta concreta en el inventario “en servicio”.

**Somalia — SO**

Aquí sí hay dos dominios regionales de fibra terrestre bien documentados. El Banco Mundial señala que la red troncal doméstica continúa fragmentada, con excepciones claras en **Somaliland —SomCable—**, partes de **Puntland —Golis—** y el área metropolitana de Mogadishu. También afirma que gran parte del centro y sur seguía dependiendo de microondas y que los enlaces hacia la frontera de Kenya no constituían todavía una troncal de fibra nacional continua. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/IDU105f167fa1085214f8b1919f141249b1e8fae.pdf))

| Estado | Ruta y ciudades en orden | Operador | Año verificable | Evidencia |
|---|---|---|---|---|
| **En servicio** | **Borama → Hargeisa → Berbera** | SomCable | existente a más tardar en **2017**; cobertura actual confirmada por el operador | Un estudio del Banco Mundial/PPIAF describe expresamente la red terrestre existente de SomCable que conecta **Berbera, Hargeisa y Borama** hacia Djibouti. La web del propio SomCable sigue declarando cobertura de fibra en Borama, Hargeisa y Berbera. ([ppiaf.org](https://www.ppiaf.org/sites/default/files/documents/2017-01/Strategy_and_PPP_Options_ICT_Broadband_Somalia__Final_3_Feb_.pdf?utm_source=chatgpt.com)) |
| **En servicio** | **Hargeisa → Burao** | SomCable | ampliación documentada posteriormente a la red inicial; existente en el diagnóstico reciente | El Banco Mundial describe la extensión de la red de SomCable hacia el este; el operador enumera **Burco/Burao** entre las ciudades cubiertas. No extiendo esta ruta hasta Las Anod porque la fuente multilateral dice que el cruce de la zona disputada alrededor de Las Anod impedía completar aquella continuidad. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/IDU105f167fa1085214f8b1919f141249b1e8fae.pdf)) |
| **En servicio** | **Bosaso → Garowe → Galkayo** | Golis Telecom | existente a más tardar en **2021** | El Banco Mundial dice que **Golis had laid fiber in Puntland reaching Galkayo** y su mapa marca como existente la dorsal de Puntland; la secuencia Bosaso–Garowe–Galkayo corresponde a los principales nodos documentados del corredor. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/IDU105f167fa1085214f8b1919f141249b1e8fae.pdf)) |

Para no sobredimensionar la red somalí, no cuento como operativas las grandes rutas nacionales **Mogadishu–Garowe/Galkayo**, **Mogadishu–Kismayo–frontera de Kenya**, **Burao–Las Anod–Garowe** ni los corredores interiores propuestos por EARDIP. El Banco Mundial los describe como enlaces faltantes/prioritarios, y el Ministerio somalí seguía indicando que el país carecía de una troncal nacional integrada; los documentos de EARDIP plantean miles de kilómetros de fibra **nueva**, no una red ya existente. ([moct.gov.so](https://moct.gov.so/en/wp-content/uploads/2023/12/2_CS-Firm_Terms_of_Reference_for_the_Technical_Feasibility_StudyWBcomments.pdf?utm_source=chatgpt.com))

Tampoco convierto el antiguo sistema de microondas de los operadores somalíes en “fibra”: las fuentes distinguen explícitamente ambos medios. Esa distinción es especialmente importante en el centro y sur del país. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/IDU105f167fa1085214f8b1919f141249b1e8fae.pdf))

## Guinea-Bissáu, República Centroafricana y Chad

**Guinea-Bissáu — GW**

La ruta más sólida es el corredor **OMVG**, construido como OPGW/fibra asociada a la interconexión eléctrica de 225 kV. El Banco Mundial establece que el proyecto construyó una red eléctrica de aproximadamente 1.671 km acompañada por cable de fibra, y documenta que los trabajos en Guinea-Bissáu terminaron en noviembre de 2023 para **Saltinho–Bambadinca–Mansoa** y en diciembre de 2023 para **Mansoa–Tanaff**. La puesta en servicio de la infraestructura de Guinea-Bissáu terminó en **marzo de 2024**. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099122224101536812/pdf/P146830-acb9ba83-2bc3-43c4-8743-38881c02b40d.pdf?utm_source=chatgpt.com))

**Ruta certificada:** **Saltinho → Bambadinca → Mansoa → Tanaff**. Tanaff es el nodo fronterizo del lado senegalés empleado por la documentación del proyecto; el tramo guineense constituye una sección superior a 100 km. En la fase de puesta en servicio, la operación temporal de la infraestructura de Guinea y Guinea-Bissáu fue encomendada a **Electricité de Guinée, EDG**; paralelamente, OMVG creó **SOGESART** para asumir la gestión de los activos. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099122224101536812/pdf/P146830-acb9ba83-2bc3-43c4-8743-38881c02b40d.pdf?utm_source=chatgpt.com))

El punto delicado es comercial: el mismo documento dice que el estudio para comercializar la **capacidad óptica excedente** seguía retrasado y que su segunda fase debía continuar en 2025. Por tanto, la clasificación correcta es **OPGW físicamente comisionado y operativo**, no “servicio mayorista de fibra comercial plenamente demostrado”. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099122224101536812/pdf/P146830-acb9ba83-2bc3-43c4-8743-38881c02b40d.pdf?utm_source=chatgpt.com))

No cuento como ruta actual el antiguo proyecto WARCIP de unos pocos decenas de kilómetros alrededor de Bissau: además de no alcanzar por sí solo el umbral de 100 km, los documentos originales lo trataban como construcción del enlace faltante hacia el punto de aterrizaje. Tampoco confundo con una nueva contratación de backbone nacional posterior al OMVG. Las referencias históricas del Banco Mundial sí señalaban que Orange-Bissau obtenía conectividad a través de redes terrestres del grupo Orange vía Senegal/Guinea, pero no aportan una secuencia interurbana dentro de Guinea-Bissáu suficientemente precisa para añadir otra ruta >100 km al inventario actual. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/458681468202151802/pdf/PIDISDS-CON-Print-P155876-10-02-2015-1443802798189.pdf))

**República Centroafricana — CF**

La situación cambió materialmente con la entrada en servicio del proyecto **Central African Backbone, componente RCA**. La Comisión Europea informó de la inauguración y puesta en operación en Bangui en febrero de **2023** de aproximadamente **935 km** de fibra terrestre y subfluvial conectando la República Centroafricana con Camerún y la República del Congo. El Banco Africano de Desarrollo también describe la llegada de la fibra desde 2023 y una red del orden de 900 km que conecta el país con ambos vecinos. ([international-partnerships.ec.europa.eu](https://international-partnerships.ec.europa.eu/news-and-events/stories/centrafrique-installer-la-fibre-optique-pour-un-reseau-internet-fiable-et-rapide_en?utm_source=chatgpt.com))

La documentación gubernamental del proyecto y comunicaciones oficiales permiten separar dos ejes de larga distancia:

| Estado | Ruta y ciudades en orden | Operador/gestor verificable | Año | Evidencia |
|---|---|---|---|---|
| **En servicio** | **Bangui → Boali → Bossembele → Yaloke → Bossemptele → Baoro → Carnot → Berberati → Gamboula** | CAB-RCA / Estado centroafricano, bajo el Ministerio competente en telecomunicaciones; no identifico un concesionario comercial distinto sin una fuente primaria inequívoca | **2023** | El eje principal oficial parte de Bangui y sigue esas localidades hacia la frontera camerunesa; la red nacional fue inaugurada y declarada operativa en 2023. ([facebook.com](https://www.facebook.com/PresidenceCentrafriqueOfficiel/posts/le-pr%C3%A9sident-touadera-a-lance-ce-matin-le-projet-de-la-dorsale-a-fibre-optique-d/1623753427700809/?utm_source=chatgpt.com)) |
| **En servicio** | **Berberati → Nola → Salo** | CAB-RCA / Estado centroafricano | **2023** | Es el ramal meridional del mismo backbone hacia la conexión con Congo; forma parte de la infraestructura inaugurada/puesta en operación. ([international-partnerships.ec.europa.eu](https://international-partnerships.ec.europa.eu/news-and-events/stories/centrafrique-installer-la-fibre-optique-pour-un-reseau-internet-fiable-et-rapide_en?utm_source=chatgpt.com)) |

La palabra “operador” requiere aquí una cautela: las fuentes primarias revisadas son inequívocas sobre **propiedad/proyecto, terminación y puesta en explotación**, pero no me permiten atribuir con la misma seguridad la operación comercial de 2026 a una empresa privada determinada. Por eso el JSON conserva como operador/gestor **CAB-RCA / Estado centroafricano** en vez de inventar un concesionario. El informe de terminación del BAD confirma que se trata del proyecto CAB-RCA ya ejecutado, no de un simple trazado conceptual. ([afdb.org](https://www.afdb.org/sites/default/files/documents/projects-and-operations/rca_-_projet_central_africa_backbone_cab_-_rapport_dachevement_de_projet.pdf?utm_source=chatgpt.com))

**Chad — TD**

El diagnóstico de economía digital del Banco Mundial es excepcionalmente preciso: su tabla de infraestructura distingue explícitamente **“In service”** de **“Planned”**, proporciona longitudes, años y gestores, y reproduce un mapa de ARCEP en el que verde significa fibra en servicio. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf?utm_source=chatgpt.com))

**Ruta meridional — en servicio:** **N'Djamena → Guelendeng → Bongor → Kelo → Moundou → Mbaïkoro → Kagpal**. Es el segmento chadiano de la dorsal N'Djamena–M'Béré. El Banco Mundial da **870 km** para la infraestructura N'Djamena–M'Béré y **610 km** para N'Djamena–Kagpal, enumera uno por uno Guelendeng, Bongor, Kelo, Moundou, M'Baikoro y Kagpal, y la clasifica **in service**. Fue comisionada en **2011** y estaba gestionada por **Sotel Tchad** en la tabla de infraestructura. La fuente aclara que ya no se utilizaba como salida internacional principal, pero sí para **transmisión doméstica**: sigue siendo, por tanto, una fibra troncal en servicio y no un enlace muerto. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf))

**Ruta oriental — en servicio:** **N'Djamena → Djermaya → Massaguet → Moito → Bokoro → Bitkine → Mongo → Mangalme → Oum Hadjer → Abeche → Farchana → Adre**. El Banco Mundial da **1.142 km**, **24 pares**, gestor **Sudachad** y estado **in service**; el texto sitúa su puesta en servicio inicial en 2018, mientras la tabla utiliza **2019** como año de completion. Las comunicaciones chadianas de la inauguración enumeran las grandes ciudades del corredor, entre ellas Massaguet, Mongo, Oum Hadjer, Abeche y Adre. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf))

Sudachad recibió en 2018 una concesión de 20 años para gestionar, operar y mantener activos públicos de fibra y el Banco Mundial la describe como gestora de la dorsal oriental y principal infraestructura de banda ancha del país. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf))

No elevo automáticamente a “en servicio hoy” los corredores que ese mismo diagnóstico marcaba **planned**: **Massaguet–Massakory–N'Gouri–Mao–Rig-Rig–Daboua** del proyecto transahariano y **Doba–Sarh–Am Timan–Abeche** del PMICE. La tabla los separa explícitamente de los enlaces operativos. Existen publicaciones posteriores de Sudachad sobre nuevas inauguraciones hacia Iriba, pero, al no disponer en las fuentes recuperadas de una ficha primaria completa con fecha, itinerario integral y estado de cada sección, esas expansiones no se incorporan al JSON conservador. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf?utm_source=chatgpt.com))

## Corea del Norte

**Corea del Norte — KP**

Este es el caso en el que la separación entre **“históricamente documentado”** y **“verificado hoy”** resulta más importante.

La reconstrucción técnica más detallada localizada describe los siguientes corredores históricos:

| Ruta histórica | Fecha histórica | Estado documental |
|---|---:|---|
| **Pyongyang → Hamhung** | **septiembre de 1995** | fibra de unos **300 km**, seis centrales automáticas; instalada tras el acuerdo DPRK–UNDP de 1990 |
| **Pyongyang → Sinuiju** | **febrero de 1998** | fibra de unos **400 km**, con extensión por North Pyongan |
| **Hamhung → Chongjin → Rason** | operativa hacia **2000** | prolongación de la red oriental hacia Rajin-Sonbong/Rason |
| Pyongyang → Nampo | 2001 | fibra, pero el recorrido es inferior al umbral de 100 km y no se cuenta |
| Rason → Hunchun, China | 1995 | unos 95 km según la fuente; queda por debajo del umbral solicitado |

La misma investigación afirma que hacia 2000 las líneas Pyongyang–Hamhung, Pyongyang–Sinuiju y Hamhung–Rajin-Sonbong figuraban como **operational optical fiber telecom lines**, y que para 2002 la red troncal enlazaba las ciudades y condados principales. Atribuye la construcción y administración principalmente al **Ministry of Posts and Telecommunications**, su Central Optical Fiber Technical Management Office y las oficinas provinciales. ([nautilus.org](https://www.nautilus.org/wp-content/uploads/2011/12/DPRK_Digital_Transformation.pdf?utm_source=chatgpt.com))

Pero esa fuente es una investigación de Nautilus, no una publicación operativa contemporánea del operador o de la UIT. No localicé una fuente primaria reciente que confirme, tramo por tramo, que esas mismas fibras físicas continúan en servicio en **2026**, ni que permita separar una ruta original de sucesivos reemplazos. Por tanto, **no incluyo ninguna ruta de KP en el JSON final**. Hacerlo convertiría una topología histórica muy plausible en una afirmación contemporánea no demostrada.

La ausencia del JSON no implica ausencia de telecomunicaciones nacionales. Significa únicamente que el estándar de evidencia exigido para “esta fibra concreta está en servicio hoy” no se alcanza con documentación primaria pública accesible.

## Siria y Yemen

**Siria — SY**

Siria ofrece la mejor evidencia de actualidad del conjunto porque en 2026 la Syrian Telecommunications Company ha comunicado repetidamente averías y **restauraciones de cables ópticos interurbanos**, lo que permite comprobar físicamente que ciertos corredores continúan transportando tráfico.

**Damascus → Homs — en servicio.** En mayo de **2026**, tras reparar una avería, el Ministerio describió el “optical route linking Damascus and Homs” como uno de los ejes más importantes de la red nacional y explicó que transporta comunicaciones e Internet entre la capital y las provincias centrales, septentrionales y costeras. Es claramente una ruta superior a 100 km. El operador de la infraestructura fija es la **Syrian Telecommunications Company**, que la UIT seguía identificando como operador de los nodos internacionales de Damascus y Aleppo en su lista de 2024. ([sana.sy](https://sana.sy/locals/2489298/?utm_source=chatgpt.com))

El año original de construcción de ese cable no aparece en las fuentes primarias recientes recuperadas; por ello el “año” que puedo dar de forma responsable es **2026 como verificación/restauración operativa**, no como fecha de primera instalación. Ya en enero de 2025 el Ministerio había informado del corte y reparación de **dos rutas ópticas** sobre la carretera Damascus–Homs, lo que además demuestra redundancia física en ese corredor. ([sana.sy](https://sana.sy/locals/2184911/?utm_source=chatgpt.com))

**Homs → Tiyas → Palmyra → Deir ez-Zor — en servicio.** En marzo de 2026, la Dirección de Telecomunicaciones de Deir ez-Zor informó de la caída total del servicio provincial por una avería del **cable óptico que alimenta la provincia**, localizada entre **Palmyra y la T4**; en abril, las cuadrillas de Homs y Deir ez-Zor repararon dos cortes del mismo cable y el servicio fijo, móvil e Internet volvió progresivamente. La secuencia de la troncal desde el oeste es Homs–Tiyas/T4–Palmyra–Deir ez-Zor; su extensión supera holgadamente 100 km. ([sana.sy](https://sana.sy/governorates/dayer-al-zoor/2431357/?utm_source=chatgpt.com))

No clasifico esas averías como “ruta destruida por la guerra”: las fuentes de 2026 documentan explícitamente su **reparación y retorno al servicio**. Lo mismo vale para el cable Damascus–Daraa, cuya reparación devolvió íntegramente el servicio a Daraa y As-Suwayda en marzo de 2026; sin embargo, no lo incorporo porque la documentación recuperada no da una longitud física inequívoca que permita asegurar el criterio >100 km sin apoyarse sólo en estimaciones de carretera. ([sana.sy](https://sana.sy/locals/2416006/?utm_source=chatgpt.com))

Tampoco convierto en una nueva ruta >100 km la rehabilitación **As-Safira–Kuweires**: el propio Ministerio informó que ese tramo rehabilitado mide sólo **18 km**. En Raqqa y Deir ez-Zor continúan además trabajos de rehabilitación de infraestructura dañada durante la guerra, por lo que no debe confundirse “servicio restablecido en una localidad” con una troncal nacional completa ya reconstruida. ([sana.sy](https://sana.sy/governorates/alrakkah/2382684/?utm_source=chatgpt.com))

**Yemen — YE**

Hay abundante evidencia de una **gran red nacional de fibra**, pero insuficiente para convertirla en un inventario fiable de corredores actuales ciudad por ciudad en 2026. El estudio de daños del Banco Mundial calculó **12.181 km de cable de fibra óptica** antes/durante el conflicto y unos **158 km dañados** hasta marzo de 2018; subraya que las redes móviles dependen del backbone nacional. También señala que **Dhamar** está sobre la carretera principal y probablemente se beneficiaba de la troncal de PTC que corre paralela a ella. Precisamente la palabra “likely” impide utilizar ese pasaje como prueba topológica exacta de una ruta. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/490981607970828629/pdf/Yemen-Dynamic-Needs-Assessment-Phase-3-2020-Update.pdf?utm_source=chatgpt.com))

La **Public Telecommunications Corporation, PTC** sigue ofreciendo oficialmente servicios sobre fibra y Yemen 4G desde Sana'a, pero sus páginas públicas localizadas no publican una matriz actual de rutas interurbanas con extremos, longitud y estado operacional que permita separar las fibras efectivamente activas de las dañadas, desviadas o rehabilitadas durante la guerra. ([ptc.gov.ye](https://ptc.gov.ye/?utm_source=chatgpt.com))

Por el mismo motivo, no cuento como red activa el corredor **Aden–Taiz** de 140 km que aparece en documentos del Banco Mundial de 2014: aquellos documentos decían que las obras de la nueva carretera **incluirían ductos para un nuevo cable de backbone**, es decir, describían una infraestructura propuesta dentro de un proyecto vial, no una constatación de que ese cable esté hoy instalado y operativo. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/348231468170075040/pdf/RP15920V10REVI00Box385213B00PUBLIC0.pdf?utm_source=chatgpt.com))

**Resultado YE:** no hay ninguna ruta que incluya en el JSON bajo el estándar de prueba exigido. Esto es una decisión de evidencia, no una afirmación de que Yemen carezca de fibra interurbana.

## Resultado consolidado y JSON

El conjunto de mayor confianza queda así: **Somalia** aporta las dorsales regionales de SomCable y Golis; **Guinea-Bissáu**, el OPGW operativo de OMVG; **República Centroafricana**, los dos ejes del CAB-RCA inaugurado en 2023; **Chad**, las dorsales meridional y oriental declaradas “in service”; y **Siria**, dos ejes cuya actividad queda confirmada por reparaciones y restablecimientos de 2026. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/IDU105f167fa1085214f8b1919f141249b1e8fae.pdf))

Quedan fuera deliberadamente **Eritrea, Corea del Norte y Yemen**: en los tres casos hay evidencia de fibra —y en KP incluso una topología histórica bastante detallada—, pero no suficiente evidencia primaria contemporánea y a nivel de ruta para sostener la afirmación más fuerte que pidió la consulta: **“esta troncal terrestre >100 km está en servicio hoy”**. ([eritel.com.er](https://eritel.com.er/contents.php?id=1029&utm_source=chatgpt.com))

```json
[
  {
    "nombre": "SomCable western Somaliland terrestrial backbone",
    "operador": "SomCable",
    "pais": "SO",
    "ciudades": ["Borama", "Hargeisa", "Berbera"],
    "estado": "en servicio",
    "fuente": "https://www.ppiaf.org/sites/default/files/documents/2017-01/Strategy_and_PPP_Options_ICT_Broadband_Somalia__Final_3_Feb_.pdf ; el estudio del Banco Mundial/PPIAF describe la red terrestre existente de SomCable que conecta Berbera, Hargeisa y Borama hacia Djibouti. https://somcable.com/ ; el operador mantiene a Borama, Hargeisa y Berbera entre las ciudades cubiertas por su red de fibra."
  },
  {
    "nombre": "SomCable Hargeisa-Burao backbone",
    "operador": "SomCable",
    "pais": "SO",
    "ciudades": ["Hargeisa", "Burao"],
    "estado": "en servicio",
    "fuente": "https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/IDU105f167fa1085214f8b1919f141249b1e8fae.pdf ; el Banco Mundial documenta la extensión hacia el este de la red de SomCable en Somaliland. https://somcable.com/ ; SomCable incluye Burco/Burao entre las ciudades cubiertas por su red de fibra."
  },
  {
    "nombre": "Golis Puntland backbone",
    "operador": "Golis Telecom",
    "pais": "SO",
    "ciudades": ["Bosaso", "Garowe", "Galkayo"],
    "estado": "en servicio",
    "fuente": "https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/IDU105f167fa1085214f8b1919f141249b1e8fae.pdf ; el Banco Mundial señala que Golis tendió fibra en Puntland hasta Galkayo y representa el corredor como fibra existente en su mapa de backbone."
  },
  {
    "nombre": "OMVG Guinea-Bissau OPGW backbone",
    "operador": "OMVG/SOGESART; EDG fue el operador temporal documentado en la puesta en servicio",
    "pais": "GW",
    "ciudades": ["Saltinho", "Bambadinca", "Mansoa", "Tanaff"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/099122224101536812/pdf/P146830-acb9ba83-2bc3-43c4-8743-38881c02b40d.pdf ; el Banco Mundial dice que la interconexión de 225 kV lleva un cable de fibra correspondiente, que Saltinho-Bambadinca-Mansoa terminó en noviembre de 2023, Mansoa-Tanaff en diciembre de 2023 y que la puesta en servicio de la infraestructura de Guinea-Bissau terminó en marzo de 2024. La capacidad óptica excedente para telecomunicaciones seguía pendiente de comercialización."
  },
  {
    "nombre": "CAB-RCA western backbone to Cameroon",
    "operador": "CAB-RCA / Gobierno de la República Centroafricana, Ministerio competente en telecomunicaciones",
    "pais": "CF",
    "ciudades": ["Bangui", "Boali", "Bossembele", "Yaloke", "Bossemptele", "Baoro", "Carnot", "Berberati", "Gamboula"],
    "estado": "en servicio",
    "fuente": "https://www.gouv.cf/les-grands-dossiers/55/projet-dorsale-fibre-optique-dafrique-centrale-composante-rca ; página oficial del proyecto CAB-RCA y sus interconexiones. https://www.afdb.org/fr/success-stories/avec-larrivee-de-la-fibre-optique-la-centrafrique-entre-de-plain-pied-dans-lere-du-numerique-74042 ; el BAD informa que desde 2023 aproximadamente 900 km de fibra conectan la RCA con Camerún y Congo; fuentes oficiales de la inauguración enumeran el eje Bangui-Boali-Bossembele-Yaloke-Bossemptele-Baoro-Carnot-Berberati hacia Gamboula."
  },
  {
    "nombre": "CAB-RCA southern backbone to Congo",
    "operador": "CAB-RCA / Gobierno de la República Centroafricana, Ministerio competente en telecomunicaciones",
    "pais": "CF",
    "ciudades": ["Berberati", "Nola", "Salo"],
    "estado": "en servicio",
    "fuente": "https://www.gouv.cf/les-grands-dossiers/55/projet-dorsale-fibre-optique-dafrique-centrale-composante-rca ; el Gobierno describe el componente RCA del Central African Backbone y las interconexiones regionales. https://www.afdb.org/fr/success-stories/avec-larrivee-de-la-fibre-optique-la-centrafrique-entre-de-plain-pied-dans-lere-du-numerique-74042 ; el BAD confirma la entrada en servicio desde 2023 de la red que conecta también con la República del Congo."
  },
  {
    "nombre": "Chad Southern Backbone, N'Djamena-Kagpal section",
    "operador": "Sotel Tchad",
    "pais": "TD",
    "ciudades": ["N'Djamena", "Guelendeng", "Bongor", "Kelo", "Moundou", "Mbaïkoro", "Kagpal"],
    "estado": "en servicio",
    "fuente": "https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf ; el Banco Mundial clasifica N'Djamena-M'Béré como 'In service', completion 2011 y gestión Sotel Tchad, y detalla el tramo de 610 km N'Djamena-Kagpal por Guelendeng, Bongor, Kelo, Moundou y M'Baikoro. Aclara que actualmente se usa para transmisión doméstica aunque ya no como salida internacional principal."
  },
  {
    "nombre": "Chad Eastern Backbone N'Djamena-Adre",
    "operador": "Sudachad",
    "pais": "TD",
    "ciudades": ["N'Djamena", "Djermaya", "Massaguet", "Moito", "Bokoro", "Bitkine", "Mongo", "Mangalme", "Oum Hadjer", "Abeche", "Farchana", "Adre"],
    "estado": "en servicio",
    "fuente": "https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf ; el Banco Mundial clasifica la dorsal N'Djamena-Adré de 1.142 km como 'In service', con cable de 24 pares y gestión Sudachad; el texto sitúa su commissioning en 2018 y la tabla completion en 2019. Fuentes institucionales chadianas de la puesta en servicio enumeran Djermaya, Massaguet, Moito, Bokoro, Bitkine, Mongo, Mangalme, Oum Hadjer, Abeche, Farchana y Adre."
  },
  {
    "nombre": "Damascus-Homs optical backbone",
    "operador": "Syrian Telecommunications Company",
    "pais": "SY",
    "ciudades": ["Damascus", "Homs"],
    "estado": "en servicio",
    "fuente": "https://sana.sy/locals/2489298/ ; en mayo de 2026 la agencia oficial SANA, citando al sector de telecomunicaciones, informó de la reparación y retorno a la normalidad del 'optical route linking Damascus and Homs' y lo calificó como uno de los ejes principales de la red que transporta tráfico hacia las provincias centrales, septentrionales y costeras."
  },
  {
    "nombre": "Homs-Palmyra-Deir ez-Zor optical backbone",
    "operador": "Syrian Telecommunications Company",
    "pais": "SY",
    "ciudades": ["Homs", "Tiyas", "Palmyra", "Deir ez-Zor"],
    "estado": "en servicio",
    "fuente": "https://sana.sy/governorates/dayer-al-zoor/2431357/ ; en marzo de 2026 la Dirección de Telecomunicaciones de Deir ez-Zor identificó como causa de la caída provincial una avería en el cable óptico alimentador entre Palmyra y la estación T4. https://sana.sy/locals/2453699/ ; en abril de 2026 las cuadrillas de Homs y Deir ez-Zor repararon dos cortes entre Palmyra y T4 y restablecieron progresivamente las comunicaciones, demostrando que la troncal seguía en operación."
  }
]
```
