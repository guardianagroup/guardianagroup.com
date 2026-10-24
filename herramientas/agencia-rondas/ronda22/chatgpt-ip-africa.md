# Ronda 22 · ChatGPT, Investigación avanzada (deep research) · troncales terrestres de África

**Pregunta** (enviada tal cual en un chat nuevo de chatgpt.com con la herramienta «Investigación avanzada» activada, el 24 de octubre de 2026; no hizo preguntas aclaratorias y arrancó sola con su plan; según ChatGPT, «Investigación completada en 10m · 50 citas · 269 búsquedas»):

> Investigación profunda, en español: para TODOS los países de África (DZ, AO, BJ, BW, BF, BI, CV, CM, CF, TD, KM, CG, CD, CI, DJ, EG, GQ, ER, SZ, ET, GA, GM, GH, GN, GW, KE, LS, LR, LY, MG, MW, ML, MR, MU, MA, MZ, NA, NE, NG, RW, ST, SN, SC, SL, SO, ZA, SS, SD, TZ, TG, TN, UG, ZM, ZW), documenta las principales rutas troncales de fibra óptica TERRESTRE de larga distancia (más de 100 km) que estén en servicio hoy, como listas ORDENADAS de las ciudades por las que pasan, con el operador, el año y la fuente primaria (operador, regulador, Banco Mundial, UIT, bancos de desarrollo, ONU u otra fuente oficial). Da prioridad a las zonas difíciles: conflictos, zonas remotas, islas y desiertos. Distingue bien lo que está en servicio de lo que está en proyecto, en construcción, destruido o funcionando por radioenlaces y no por fibra. No uses submarinecablemap.com, TeleGeography ni PeeringDB. Como mucho unas 8 rutas por país, las más importantes. Al final del informe, pon un único bloque JSON (un array) con solo las rutas en servicio, con objetos así: {"nombre": "...", "operador": "...", "pais": "código ISO alfa-2", "ciudades": ["Ciudad A", "Ciudad B"], "estado": "en servicio", "fuente": "URL y lo que dice"}, con nombres de ciudades en inglés como en GeoNames.

Informe copiado sin editar del documento del informe que guarda la propia página (Archivos del chat). Las marcas internas de cita de ChatGPT se han sustituido por el enlace Markdown que el propio ChatGPT da para cada una; el resto del texto es literal.

---

# Rutas troncales terrestres de fibra óptica de larga distancia en África

## Criterio de investigación y cómo leer los resultados

Este inventario cubre los 54 países solicitados y toma como fecha de corte el **24 de octubre de 2026**. He aplicado un criterio deliberadamente más estricto que el de muchos mapas comerciales: una ruta sólo se trata como **“en servicio”** cuando existe evidencia de una fuente primaria u oficial —operador, regulador, ministerio, UIT, Banco Mundial, Banco Africano de Desarrollo u otra institución pública— de que la infraestructura terrestre existe y está operativa. La base metodológica de la UIT es especialmente útil porque sus mapas de transmisión registran longitud de ruta, nodos, tecnología, capacidad y estado operacional a partir de datos de operadores y administraciones, y la UIT publica qué conjuntos de datos fueron sometidos a validación. ([itu.int](https://www.itu.int/en/ITU-D/Regional-Presence/Europe/Documents/Events/2016/Broadband%20Mapping/Ponder%20ITU%20Interactive%20Transmission%20Maps_Apr2016_compressed.pdf))

**“Año”** significa el año de puesta en servicio cuando la fuente lo dice expresamente. Cuando no existe una fecha pública de inauguración, uso **“≤AAAA”**, que significa “consta operativa a más tardar en ese año”; no lo presento como año de construcción. Para un troncal antiguo cuya existencia se confirma en una fuente reciente, indico ambos datos cuando es útil.

Las ciudades son **nodos principales**, no cada repetidor, central o aldea atravesada. Las listas están en orden geográfico de la ruta y los nombres se normalizan al uso inglés de GeoNames. No he considerado enlaces submarinos entre islas, radioenlaces de microondas ni redes metropolitanas cortas. Los cables OPGW de líneas eléctricas sólo cuentan cuando hay evidencia de que funcionan como infraestructura de telecomunicaciones, no por el mero hecho de contener fibras.

La expresión **“en servicio hoy” no implica una prueba óptica en tiempo real el 24 de octubre de 2026**: significa que la última fuente oficial disponible describe la ruta o red como operativa y que no encontré una fuente oficial posterior que documente su retirada o destrucción. Esta distinción es esencial en Sudán, Libia, Mali, Burkina Faso, Níger, Somalia, Etiopía y otros lugares expuestos a guerra o sabotaje. Las fuentes preconflicto, por sí solas, no bastan para declarar una ruta actual.

También mantuve fuera del inventario estricto los proyectos que las propias fuentes describen como “planned”, “under construction”, “proposed”, “to be built” o equivalentes. Un ejemplo especialmente claro es Chad: el diagnóstico digital del Banco Mundial separa expresamente las rutas **N'Djamena–M'Béré y N'Djamena–Adré, “in service”**, de Daboua–N'Djamena y Doba–Sarh–Am Timan–Abéché, que todavía figuraban como planificadas. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf))

## Norte de África y Sahel

**DZ — Algeria.** La ruta de mayor interés es la **dorsal transahariana**, terminada por Argelia a lo largo de unos 2.548 km desde la capital hasta la frontera con Níger. La secuencia de nodos principales es **Algiers → Ghardaia → In Salah → Tamanrasset → In Guezzam**; existe además un ramal occidental hacia Tindouf y la frontera mauritana. La fuente ministerial argelina describe como completado el tramo Algiers–In Guezzam, y fuentes oficiales argelinas documentaron posteriormente la puesta en servicio de la interconexión con Níger. Operador/infraestructura: **Algérie Télécom / Estado argelino**; año: **≤2022** para la ruta internacional plenamente enlazada. ([mpt.gov.dz](https://www.mpt.gov.dz/major-files/trans-saharan-fiber-optic-backbone/))

**EG — Egypt.** Telecom Egypt declara actualmente **12 rutas terrestres diversificadas** entre sus estaciones de amarre y el interior del país. Entre los ejes largos inequívocos del sistema están **Alexandria → Cairo → Suez** y **Port Said → Cairo → Suez**; ambos superan ampliamente 100 km y forman parte del corredor terrestre Mediterráneo–mar Rojo. Operador: **Telecom Egypt**; año: **≤2026** como evidencia de explotación actual, aunque las rutas son anteriores. La UIT también ha validado conjuntos de red de TE Data/Telecom Egypt y de las redes ferroviaria y eléctrica egipcias. ([te.eg](https://www.te.eg/interactivemap/))

**LY — Libya.** La UIT dispone de datos de las redes de **LPTIC** y de la **General Electricity Company of Libya**, y LPTIC sigue describiendo una infraestructura nacional de fibra. Sin embargo, no encontré en el corpus oficial reciente una confirmación tramo por tramo, posterior a las perturbaciones del conflicto, que permita afirmar con el estándar exigido que un recorrido como **Tripoli → Misrata → Sirte → Benghazi → Tobruk** está íntegramente disponible hoy. Por ello **no lo incorporo al JSON de rutas en servicio**, aunque la red física de fibra existe. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**MA — Morocco.** El Banco Mundial estimaba ya en cerca de **25.000 km** la red troncal de fibra de Maroc Telecom, frente a redes más pequeñas de los otros operadores, y la UIT validó datos de **Maroc Telecom, ONCF, ONEE y Finetis**. Los grandes corredores son coherentes con **Casablanca–Rabat–Tangier**, **Casablanca–Marrakesh–Agadir** y el eje oriental hacia **Fes–Oujda**, pero la documentación primaria recuperada no ofrece una lista contemporánea, nodo por nodo y con estado operacional de cada uno. Para evitar convertir un mapa general en una falsa precisión, los dejo como **red existente pero no suficientemente verificada tramo a tramo para el JSON estricto**. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/194961592448114381/pdf/Morocco-Infrastructure-Review.pdf))

**TN — Tunisia.** La UIT ha validado infraestructura de fibra de **STEG** y de **SNCFT**, lo que confirma redes terrestres de larga distancia asociadas a corredores eléctricos y ferroviarios. El eje **Tunis → Sousse → Sfax → Gabès** es el gran corredor longitudinal relevante, pero la fuente primaria recuperada no permite fechar y comprobar cada tramo como ruta telecom operativa en 2026; queda por tanto fuera del JSON estricto. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**MR — Mauritania.** La documentación oficial de WARCIP es extraordinariamente útil para distinguir lo existente de lo que todavía era obra. Ya constaba la fibra **Nouakchott → Nouadhibou** hacia Marruecos; Mauritel estaba desplegando **Nouakchott → Aleg → Sangrava → Kiffa → Aioun → Kobeni**, mientras que WARCIP proyectaba **Nouakchott → Atar → Choum** (531 km), **Rosso → Boghé → Kaédi → Sélibaby → Kiffa** (723 km) y **Aioun → Néma** (280 km). La UIT posteriormente incorporó WARCIP entre los conjuntos validados de Mauritania. Aun así, al no disponer aquí de un acta reciente de aceptación operacional de cada ramal, sólo considero firmemente establecida la histórica **Nouakchott → Nouadhibou**; los otros corredores se mantienen fuera del JSON conservador. ([mtnima.gov.mr](https://mtnima.gov.mr/wp-content/uploads/2024/06/Rapport-definitif-PAR-WARCIP.pdf))

**ML — Mali.** La UIT validó redes de **Orange Mali y Sotelma**. Existen troncales históricas desde Bamako hacia Kayes/Senegal, Sikasso/Côte d’Ivoire y Ségou–Mopti y más al norte; sin embargo, la situación de seguridad en el centro y norte hace inadecuado inferir que un mapa antiguo equivale a disponibilidad actual. No encontré una fuente primaria reciente que certifique de extremo a extremo los tramos de más de 100 km en las zonas de conflicto, por lo que **no incluyo ninguna ruta maliense en el JSON**. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**BF — Burkina Faso.** La UIT validó datos del ministerio, **Onatel** y **Telecel**, por lo que la existencia de una red troncal de fibra está bien establecida. La documentación recuperada no permite, sin embargo, certificar en 2026 el estado de los ejes que atraviesan zonas de fuerte inseguridad, especialmente hacia Dori y el este. En consecuencia, no convierto los corredores históricos **Ouagadougou–Bobo-Dioulasso**, **Ouagadougou–Kaya** o **Ouagadougou–Fada N'Gourma** en rutas “hoy en servicio” sin una fuente más reciente. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**NE — Niger.** La UIT validó redes de **Airtel, Atlantic Telecom, SahelCom y Sonitel**. La infraestructura troncal del eje Niamey–Dosso–Maradi–Zinder y las conexiones hacia Argelia y Chad son relevantes, pero la documentación oficial que recuperé mezcla redes existentes con ampliaciones transaharianas todavía planificadas. Además, el diagnóstico de Chad seguía clasificando el tramo Chad–Níger **Daboua–N'Djamena** como proyecto. No incluyo una secuencia nigerina en el JSON sin un estado actual inequívoco. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**TD — Chad.** Es uno de los países para los que la documentación primaria es más precisa. El Banco Mundial registra como **“in service”** la dorsal sur **N'Djamena → Guelendeng → Bongor → Kelo → Moundou → M'Baikoro → Kagpal → M'Béré**, de unos 870 km contando el sistema completo, gestionada por **Sotel Tchad** y puesta en servicio en **2011**. La fuente detalla incluso las distancias parciales y el ramal M'Baikoro–Doba. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf))

La segunda gran ruta chadiana es la dorsal este **N'Djamena → Abéché → Adré**, **1.142 km**, gestionada por **Sudachad**, terminada en **2019** y explícitamente clasificada como **“in service”**. Es además la principal infraestructura de banda ancha del este. En cambio, **Massaget–N'Guigmi/Níger** y **Doba–Sarh–Am Timan–Abéché** figuraban aún como proyectos y se excluyen. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf))

**SD — Sudan.** El diagnóstico digital del Banco Mundial de 2022 documentaba, antes de la guerra iniciada en 2023, rutas terrestres de fibra hacia **Egypt, South Sudan, Ethiopia y Chad**, y la UIT tenía redes de Canar, SETCO y Zain. Esa evidencia **no es suficiente para declarar en 2026 un corredor de extremo a extremo operativo**, dada la destrucción y las interrupciones sufridas durante la guerra. Por tanto, estas rutas se registran como **preconflicto/no reconfirmadas**, no como servicio actual en el JSON. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Digital-Economy-RepSudan-jun22.pdf))

## África occidental

**BJ — Benin.** La UIT informó en su evaluación de banda ancha de África de 2025 que la **dorsal nacional ya conectaba 50 municipios a lo largo de aproximadamente 2.550 km**; otras localidades estaban todavía previstas para ampliación. La principal espina longitudinal puede resumirse por sus nodos mayores como **Cotonou → Bohicon → Dassa-Zoumé → Parakou → Kandi → Malanville**. La infraestructura procede de la red estatal de Benin Telecom y su reorganización posterior; la UIT había validado tanto Benin Telecom como Phase 3. Año: **≤2025** como evidencia inequívoca de servicio. ([itu.int](https://www.itu.int/dms_pub/itu-s/opb/pol/S-POL-BROADBAND.32-2025-PDF-E.pdf))

**CV — Cabo Verde.** No incorporo ninguna ruta terrestre >100 km. La UIT tiene datos de **Cabo Verde Telecom**, pero el transporte entre las distintas islas es necesariamente submarino; dentro de cada isla no encontré una troncal terrestre interurbana individual que satisfaga de forma clara el umbral >100 km usado aquí. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**CI — Côte d’Ivoire.** ANSUT continúa identificando oficialmente una infraestructura nacional de fibra y localidades/subprefecturas servidas. El **Réseau National Haut Débit** incluye el importante eje interior **Abidjan → Yamoussoukro → Bouaké → Korhogo**, además de corredores occidentales, pero la página pública recuperada no suministra una tabla reciente de estado operacional por tramo. Por ese motivo, no lo traslado al JSON estricto como si dispusiéramos de telemetría de 2026. ([ansut.ci](https://ansut.ci/))

**GM — The Gambia.** Aquí la evidencia es particularmente sólida. La UIT documentaba ya un backbone óptico de **Gamtel** que recorría unos **500 km** desde Greater Banjul hasta **Basse Santa Su**. Posteriormente, ECOWAN instaló unos **817 km** de fibra, incluyendo un corredor de North Bank de **Banjul → Barra → Farafenni → Basse Santa Su** y otro hacia el este por South Bank, **Banjul → Brikama → Soma → Bansang → Fatoto**. ([itu.int](https://www.itu.int/ITU-D/treg/Events/Seminars/2003/Gambia/Gambia_Africell.pdf))

La prueba de que ECOWAN no es sólo infraestructura instalada sino utilizada es reciente: documentación del Banco Mundial informa que **15 operadores utilizaban la fibra ECOWAN en 2024**. Por tanto, ambos grandes ejes se aceptan como en servicio. Operador mayorista/infraestructura: **Gamtel/ECOWAN**; año: red histórica Gamtel **≤2003**, ECOWAN **≤2018**, uso comercial confirmado en **2024**. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099111224180038021/pdf/BOSIB-e21850b4-ef74-45b2-8282-8be2ee21d3ba.pdf))

**GH — Ghana.** El **Eastern Corridor Fiber Optic Backbone**, impulsado por el Gobierno y NITA, es una de las rutas mejor identificables. La documentación oficial describe una dorsal de aproximadamente **1.100 km**, con 10 secciones y 11 nodos DWDM entre **Accra y Bawku**. Sus nodos principales pueden ordenarse como **Accra → Ho → Hohoe → Nkwanta → Yendi → Tamale → Bolgatanga → Bawku**. Operador/gestor público: **NITA / Government of Ghana**; puesta en servicio del proyecto: **2015**. ([moc.gov.gh](https://moc.gov.gh/eastern-corridor-fiber-optic-backbone/))

**GN — Guinea.** Éste es un caso donde conviene resistirse a cifras aparentemente impresionantes. El Banco Mundial señala que se construyeron unos **4.432–4.500 km** de backbone nacional, pero que **a junio de 2021 todavía no estaba operativo**; otra evaluación hablaba de lanzamiento “inminente”. No encontré una confirmación primaria posterior suficientemente clara de entrada plena en explotación. En consecuencia, **no lo trato como ruta en servicio**. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099120523052096112/pdf/P17725202bc2da09a0a76a08a9a3e998ceb.pdf))

**GW — Guinea-Bissau.** Una nota de política del Banco Mundial de 2023 señalaba expresamente que el país **aún carecía de un backbone nacional de fibra óptica**. Existe fibra OPGW en la infraestructura eléctrica OMVG, incluida en el corredor Bissau–Mansôa–Bambadinca–Saltinho, pero no encontré evidencia suficiente de que esa fibra estuviera explotándose como una troncal pública de telecomunicaciones de larga distancia. Por ello se excluye. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099648212012363315/pdf/IDU078756441076ad043af08dbe0a2eb6ca2b3ef.pdf))

**LR — Liberia.** El Gobierno reportó en 2026 unos **167 km de fibra desplegada** en partes de Greater Monrovia y Nimba County. La longitud total supera el umbral, pero la publicación no demuestra que los 167 km constituyan **un único trayecto continuo >100 km** con ciudades ordenables. Tampoco convierto automáticamente el OPGW de CLSG en una ruta telecom comercial: la documentación histórica de CLSG prueba el diseño de fibra sobre la línea eléctrica, pero no basta para el estándar operacional aplicado aquí. Se excluye del JSON. ([mfdp.gov.lr](https://mfdp.gov.lr/uploads/documents/2026/08/f64f5bdd-7c1e-4424-9484-df6aa0da0752-arrest-agenda-for-inclusive-development-progress-r.pdf))

**NG — Nigeria.** La UIT ha validado redes de **Glo, Phase 3, MTN, MLTC y del Ministerio de Comunicaciones**, confirmando una gran malla nacional de fibra. Sin embargo, las cartas y el inventario de validación no proporcionan en texto una lista actualizada por tramo que permita atribuir inequívocamente, por ejemplo, el eje Lagos–Abuja–Kano a un operador y un año concreto sin apoyarse en fuentes comerciales secundarias. Antes que inventar esa asociación, **dejo Nigeria fuera del JSON de alta confianza**, aunque no hay duda de que posee múltiples backbones terrestres >100 km. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**SN — Senegal.** La UIT validó formalmente los datos de red de **Sonatel**, y la carta de validación indica que el conjunto fue considerado actual/correcto en el proceso de la UIT. Los grandes corredores históricos incluyen Dakar hacia Saint-Louis y Dakar hacia Tambacounda/Kidira, pero la evidencia recuperada no proporciona una actualización tramo a tramo de 2026. Los mantengo como backbone existente, pero fuera del JSON conservador. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Documents/InteractiveTransmissionMaps/AFR/NewRFI_2014/151020_Senegal_Sonatel.pdf))

**SL — Sierra Leone.** La evaluación del Banco Mundial documentaba una red terrestre inicialmente de unos **660 km** desde Freetown hacia las fronteras de Liberia y Guinea, pasando por 28 ciudades, y una expansión posterior que llevaba el core nacional a unos **1.010 km**. Los dos grandes ejes son **Freetown → Bo → Kenema → Zimmi** hacia Liberia y **Freetown → Makeni → Kambia/Gbalamuya** hacia Guinea. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/185761624271466646/pdf/Sierra-Leone-Digital-Economy-Diagnostic.pdf))

La confirmación más reciente es especialmente fuerte: una presentación de **Leonecom ante la UIT en 2025** describe aproximadamente **1.630 km de fibra subterránea**, cobertura de más del 85 % de los distritos y fronteras de Guinea y Liberia. Operador: **Leonecom**, socio privado encargado de supervisar la National Fibre Backbone Network; año: red inicial **≤2021**, red ampliada confirmada en **2025**. ([itu.int](https://www.itu.int/en/ITU-T/Workshops-and-Seminars/qos/20250701/Documents/3-%20NFB.pdf))

**TG — Togo.** Fuentes del Banco Mundial informan en 2025 de más de **4.130 km de infraestructura de fibra** desplegada en el país, y la UIT había validado Phase 3 Telecom. El eje lógico nacional de larga distancia es **Lomé → Atakpamé → Sokodé → Kara → Dapaong**. No obstante, la fuente recuperada de 2025 da la magnitud agregada y no asigna explícitamente cada tramo a un operador; por ese motivo no lo incluyo en el JSON de máxima confianza. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099032525165025703/pdf/P180966-3a152e78-8b7b-4cdd-b140-6668708c7672.pdf))

## África central

**CM — Cameroon.** CAMTEL dispone de una amplia infraestructura nacional e internacional de fibra; el Banco Mundial señala además unos **8.000 km** desplegados por Viettel/Camtel Mobile y otras redes públicas. El gran corredor septentrional conecta la costa y Yaoundé con las regiones del norte y Chad, pero la fuente recuperada no enumera en una sola ruta operativa y actual todos los nodos **Douala/Yaoundé–Bertoua–Ngaoundéré–Garoua–Maroua–Kousseri**. Se reconoce la existencia del backbone, pero se excluye del JSON para evitar una reconstrucción excesivamente inferencial. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099954002202322330/pdf/IDU-885a8837-2245-464b-928c-9460306b08dd.pdf))

**CF — Central African Republic.** Éste es un cambio importante respecto de la situación de hace una década, cuando la transmisión de larga distancia era esencialmente satelital y el CAB era todavía un proyecto. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/483061468202143608/pdf/T77250TAN0P108101Official0Use0Only1.pdf)) El proyecto CAB-CAR terminó en **septiembre de 2023** tras instalar la **primera dorsal nacional de fibra**, de alrededor de **900 km**. El eje principal anunciado y construido fue **Bangui → Baoro → Carnot → Berbérati**, con ramales posteriores hacia las fronteras de Cameroon y Republic of the Congo. Operador/propietario institucional: **Government of the Central African Republic / CAB-CAR**; año: **2023**. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/283361648600399938/pdf/Central-African-Republic-Public-Sector-Digital-Governance-Project.pdf))

No considero, por separado, los antiguos planes de Berbérati–Gamboula o Berbérati–Bayanga/Bomassa como rutas operativas completas sin prueba equivalente de puesta en servicio: la fuente de 2018 los describía todavía en futuro. ([samenacouncil.org](https://www.samenacouncil.org/samena_daily_news?news=67695))

**CG — Republic of the Congo.** El **Projet de Couverture Nationale (PCN)** es uno de los casos mejor documentados: el Banco Mundial describe alrededor de **3.000 km de backbone de fibra**, que conecta **Pointe-Noire → Dolisie → Brazzaville → Oyo → Ouesso**, más bucles metropolitanos. La red es operada y comercializada por **Congo Telecom**. ([documents.worldbank.org](https://documents.worldbank.org/curated/en/099630005112275398/pdf/P175592002d4590208e3c034a9c0a165ad.pdf))

Es importante no confundir esta situación actual con la fase anterior del CAB: documentación de 2011 señalaba que Oyo–Ouesso iba inicialmente a usar microondas, mientras se esperaba fibra sobre la infraestructura eléctrica. La fuente posterior ya describe explícitamente la red PCN de fibra hasta Ouesso, por lo que el corredor sí se acepta actualmente como terrestre óptico. Año: **≤2022**, con despliegues iniciados anteriormente. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/123451468204842891/pdf/616460PAD0P1220e0only0900BOX358354B.pdf))

**CD — Democratic Republic of the Congo.** La República Democrática del Congo formó parte de CAB5 y dispone de fibra de SCPT y redes privadas, incluido el corredor occidental **Muanda–Matadi–Kinshasa** y redes en el sureste. Sin embargo, los resultados primarios recuperados en esta investigación no proporcionan una tabla reciente de estado y operador por tramo que permita certificar esas rutas al 24 de octubre de 2026 con el mismo estándar que Congo o Chad. Se excluyen del JSON. ([ieg.worldbankgroup.org](https://ieg.worldbankgroup.org/reports/cameroon-chad-central-african-republic-sao-tome-and-principe-internet-and-mobile))

**GQ — Equatorial Guinea.** La infraestructura de banda ancha del territorio continental ha avanzado y el Banco Mundial está trabajando con el país en una nueva estrategia digital, pero no encontré una fuente primaria que certifique actualmente una ruta terrestre >100 km con secuencia de nodos y operador —por ejemplo Bata–Mongomo/Ebebiyin—. Las conexiones entre Bioko y Río Muni son submarinas y, por definición, no entran aquí. No se incluye ruta. ([itweb.africa](https://itweb.africa/article/world-bank-proposes-equatorial-guineas-digital-economy-map/DZQ58MV8klpvzXy2))

**GA — Gabon.** CAB4 construyó infraestructura terrestre y la interconexión Congo–Gabon está en funcionamiento; el Banco Mundial documentó que el tráfico transfronterizo comenzó a intercambiarse después de resolverse problemas de infraestructura del lado congoleño. Sin embargo, la fuente recuperada no da suficiente detalle actualizado para convertir de forma segura el eje gabonés **Libreville–Franceville–Lekoko** en una lista completa de ciudades con operador y año de cada tramo. Lo dejo fuera del JSON estricto. ([worldbank.org](https://www.worldbank.org/en/news/feature/2018/04/09/congo-gabon-toward-regional-digital-integration))

**ST — São Tomé and Príncipe.** CAB2 mejoró la conectividad internacional del país, pero las dos islas principales son demasiado pequeñas para que la documentación revisada revele una **única troncal terrestre interurbana >100 km**; el salto entre São Tomé y Príncipe es submarino. No hay ruta que satisfaga el criterio. ([ieg.worldbankgroup.org](https://ieg.worldbankgroup.org/reports/cameroon-chad-central-african-republic-sao-tome-and-principe-internet-and-mobile))

## África oriental, Cuerno e islas del Índico

**BI — Burundi.** El **Burundi Backbone System (BBS)** creó unos **1.250 km de fibra**, conectando las 17 provincias y puntos fronterizos con Rwanda y Tanzania. Dos ejes largos representativos son **Bujumbura → Kayanza → Ngozi → Kirundo → Kobero** hacia el nordeste y **Bujumbura → Rumonge → Makamba → Mugina** hacia Tanzania. Operador: **Burundi Backbone System (BBS)**; año: **≤2014** para la entrada en explotación de la red nacional. El Banco Mundial la describe como una red mayorista open-access, no como un proyecto pendiente. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/674601544534500678/pdf/Main-Report.pdf))

**DJ — Djibouti.** Djibouti es un gran nodo internacional, pero la investigación recuperó mucha más documentación sobre estaciones submarinas que sobre la secuencia exacta de su fibra terrestre interior. El corredor de salida hacia Ethiopia existe, pero no publico **Djibouti → Ali Sabieh → Dikhil/Galafi** como ruta certificada porque la fuente primaria recuperada no enumera sus nodos y estado en esa forma. Queda fuera del JSON. El informe del Banco Mundial sobre los enlaces que faltan analiza expresamente las redes terrestres de Djibouti y Ethiopia. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099450206282323160/pdf/IDU00f2d51f40fd4a04e630b0b60d27b1a4f548b.pdf))

**ER — Eritrea.** No encontré evidencia primaria actual suficiente para una troncal terrestre >100 km que pudiera calificarse responsablemente como operativa. Los estudios regionales han propuesto repetidamente nuevos enlaces internacionales para Eritrea; una propuesta histórica incluso contemplaba un sistema Djibouti–Eritrea–Somaliland, lo que no debe confundirse con infraestructura ya operativa. No se incluye ninguna ruta. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/571071468194354658/pdf/917830WP0Horn00Box385358B00PUBLIC0.pdf))

**ET — Ethiopia.** La UIT validó formalmente el conjunto de datos de **Ethio Telecom**, lo que confirma una extensa red terrestre. El corredor más crítico es el oriental desde Addis Ababa hacia Djibouti, pero la carta de validación no lista en texto la secuencia **Addis Ababa → Adama → Awash → Dire Dawa → Dewele**. Dado que la situación de varias regiones etíopes también ha estado afectada por conflictos y cortes, lo mantengo fuera del JSON estricto en ausencia de una fuente primaria 2026 que certifique el tramo completo. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Documents/InteractiveTransmissionMaps/AFR/NewRFI_2014/1511_AFR_Nov%202015%20Ethio%20Telecom.pdf))

**KE — Kenya.** La **National Optic Fibre Backbone Infrastructure (NOFBI)** es una infraestructura pública consolidada; el Auditor General de Kenya dispone incluso de una auditoría específica de su implementación. El gran eje de transporte nacional **Mombasa → Nairobi → Nakuru → Eldoret → Malaba** constituye la columna vertebral hacia Uganda. Operador/propietario: **ICT Authority / Government of Kenya**, con explotación integrada con operadores nacionales; año: fases I–II **≤2016**. ([oagkenya.go.ke](https://www.oagkenya.go.ke/wp-content/uploads/2022/08/Implementation-of-National-Optic-Fibre-Backbone-Infrastructure-Project.pdf))

No considero **Eldoret–Nadapal** como operativo sólo porque aparece en documentación del Kenya Digital Economy Acceleration Project: esa fuente se refiere explícitamente a trabajos/construcción de un cable de alta capacidad sobre la carretera Eldoret–Nadapal, por lo que no debe mezclarse con NOFBI ya desplegado. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099082323151540728/pdf/P170941018efda0a09bc409f7e56a1b6fa.pdf))

**RW — Rwanda.** RISA documenta un **backbone nacional de aproximadamente 6.000 km** financiado con recursos públicos. Los grandes ejes permiten identificar **Kigali → Muhanga → Huye → Rusizi** hacia el suroeste y **Kigali → Musanze → Rubavu** hacia el noroeste. Operador/propietario institucional: **Government of Rwanda / RISA**; año de evidencia operativa: **≤2021**. La misma fuente distingue esta fibra nacional de la red móvil 4G de KTRN, por lo que no deben confundirse ambas infraestructuras. ([risa.gov.rw](https://www.risa.gov.rw/index.php?eID=dumpFile&f=65375&t=f&token=3539531ff978f107e3ab03cc5ceaac74b1e0b713))

**SO — Somalia.** La fragmentación regional de la red importa mucho. El Banco Mundial señala que Somaliland dispone de un backbone terrestre relativamente bien desarrollado gestionado por **Somcable**, mientras que en Puntland **Golis** mantiene fibra en **Bosaso, Garowe y Galkayo**; grandes partes del resto del país siguen dependiendo de radioenlaces de microondas o satélite. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099500006282221939/pdf/P1775040e575fc036094170aca16ab29e5f.pdf))

Por ello se acepta **Bosaso → Garowe → Galkayo**, operador **Golis Telecom**, como la ruta terrestre larga mejor documentada. También es razonable identificar el backbone de Somaliland entre **Berbera → Hargeisa → Borama**, gestionado por **Somcable**, aunque la fuente del Banco Mundial describe la red regional más que una ruta única. Año: evidencia de red **≤2022**. En cambio, el viejo proyecto **Mogadishu–Kismayo–Kenya** de 2014 era una propuesta y no se cuenta como construido. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/571071468194354658/pdf/917830WP0Horn00Box385358B00PUBLIC0.pdf))

**SS — South Sudan.** El Banco Mundial es explícito: South Sudan **carece de un backbone doméstico operacional nacional** y depende de la ruta de fibra desde **Juba hacia Uganda**, además de satélite y microondas. La única ruta que cumple razonablemente el criterio es, por tanto, **Juba → Nimule → Uganda border**, de más de 100 km. Año de evidencia: **≤2023**. No atribuyo en el informe principal una concesión exclusiva de toda la infraestructura a un único operador porque la fuente recuperada no lo hace de manera inequívoca. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099450206282323160/pdf/IDU00f2d51f40fd4a04e630b0b60d27b1a4f548b.pdf))

**TZ — Tanzania.** El **National ICT Broadband Backbone (NICTBB)** sigue siendo una infraestructura nacional activa; en octubre de 2026 TTCL continuaba refiriéndose públicamente al **Mkongo wa Taifa**, el backbone nacional. Dos de sus corredores troncales principales son **Dar es Salaam → Morogoro → Dodoma → Singida → Shinyanga → Mwanza** y **Dar es Salaam → Morogoro → Iringa → Mbeya → Tunduma**. Operador: **TTCL / NICTBB**; las grandes fases nacionales entraron en servicio alrededor de **2010–2012**, con explotación confirmada por TTCL en 2026. ([ttcl.co.tz](https://www.ttcl.co.tz/))

**UG — Uganda.** La **National Backbone Infrastructure (NBI)** es una red operada como infraestructura pública nacional y sigue bajo mantenimiento y expansión: el presupuesto ministerial 2025/26 prevé supervisión de activos, licencias de subsistemas y nuevas extensiones, lo que confirma que no es un proyecto abandonado. ([ict.go.ug](https://ict.go.ug/site/documents/ministerial-policy-statement-mps-20252026.pdf))

Los ejes troncales principales son **Kampala → Jinja → Mbale → Busia**, **Kampala → Masaka → Mbarara → Kabale** y **Kampala → Luwero → Gulu → Arua**. Operador/gestor: **NITA-U**; año: despliegue por fases desde finales de la década de 2000, con explotación nacional documentada durante la década de 2010 y mantenimiento confirmado en **2025/26**. Las extensiones adicionales de 6.000 km previstas en el presupuesto son **futuras** y no se suman a las rutas actuales. ([ict.go.ug](https://ict.go.ug/site/documents/ministerial-policy-statement-mps-20252026.pdf))

**KM — Comoros.** La UIT posee datos de **Comoros Telecom**, pero ninguna de las islas ofrece una ruta terrestre interurbana individual de >100 km identificada en la documentación oficial revisada; los enlaces entre islas son submarinos o inalámbricos y no entran en este inventario. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**MG — Madagascar.** Existen redes terrestres largas y una infraestructura nacional de fibra, pero en la documentación primaria recuperada no apareció una fuente suficientemente precisa y reciente que permitiera certificar el estado 2026 de recorridos como Antananarivo–Toamasina o Antananarivo–Fianarantsoa–Toliara sin recurrir a mapas comerciales secundarios. Para respetar la exigencia de fuente primaria, no los incorporo al JSON. Las evaluaciones regionales sí confirman una mejora sustancial de la conectividad digital de Madagascar. ([tresor.economie.gouv.fr](https://www.tresor.economie.gouv.fr/Articles/56deef87-76b9-4007-bdd0-b4c3cc94e6e7/files/81d4d090-a52f-4075-bdd3-664d43b5f889))

**MU — Mauritius.** No identifiqué una ruta troncal terrestre interurbana individual >100 km respaldada por fuente primaria. Las redes nacionales de fibra existen, pero una circunvalación o suma de enlaces metropolitanos no debe convertirse artificialmente en una “ruta de larga distancia” sólo para superar el umbral. No se incluye.

**SC — Seychelles.** No aparece ninguna ruta terrestre >100 km; las islas habitadas son pequeñas y la conectividad interinsular relevante no es terrestre. No se incluye.

## África austral

**AO — Angola.** Angola dispone de extensas redes troncales de fibra y aparece integrada en redes panafricanas terrestres, pero las fuentes primarias recuperadas en esta investigación no entregaron una secuencia contemporánea de ciudades con operador y estado para ejes como Luanda–Benguela–Lubango. Para no sustituir esa ausencia por un mapa comercial, no introduzco una ruta angoleña en el JSON. La iniciativa IDEA del Banco Mundial confirma que Angola sigue ampliando su infraestructura digital, pero esa expansión futura tampoco puede confundirse con una ruta ya operativa concreta. ([worldbank.org](https://www.worldbank.org/en/brief/2024/06/13/overview))

**BW — Botswana.** **BoFiNet** es el operador nacional mayorista de fibra y mantiene actualmente un mapa de cobertura de su red. Dos grandes corredores terrestres pueden resumirse como **Gaborone → Palapye → Francistown → Nata → Kasane** y **Gaborone → Kanye/Kang → Ghanzi → Maun**. La infraestructura troncal procede en buena medida de los activos nacionales transferidos desde BTC a BoFiNet; año: **≤2013/14** para la estructura BoFiNet, con cobertura operativa confirmada actualmente. ([bofinet.co.bw](https://www.bofinet.co.bw/))

**SZ — Eswatini.** La UIT validó la red de **Swaziland Post and Telecommunications Corporation**, hoy EPTC, y el país posee además fibra de la compañía eléctrica. Sin embargo, el nuevo proyecto de fibra sobre líneas eléctricas que aparece en fuentes recientes no debe contarse automáticamente como ya terminado. No encontré una fuente primaria que permita certificar de extremo a extremo en 2026 una ruta >100 km con sus nodos ordenados; queda fuera del JSON. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**LS — Lesotho.** Existen redes nacionales y enlaces de fibra con South Africa, pero la documentación primaria recuperada no permite identificar con suficiente precisión una única ruta >100 km operativa, operador y año —por ejemplo los corredores Maseru–Butha-Buthe o Maseru–Quthing—. No se publica una secuencia especulativa.

**MW — Malawi.** La infraestructura óptica nacional incluye redes de telecomunicaciones y fibra en el sistema eléctrico, pero las fuentes recuperadas se centraban principalmente en nuevas inversiones de Digital Malawi y no ofrecían una lista actual de rutas con nodos. Dado que un proyecto de expansión no es evidencia de un tramo ya operativo, no incluyo un eje Blantyre–Lilongwe–Mzuzu sin una fuente primaria más específica. ([worldbank.org](https://www.worldbank.org/en/brief/2024/06/13/overview))

**MZ — Mozambique.** Mozambique posee fibra terrestre longitudinal, pero las fuentes oficiales recientes consultadas enfatizan todavía la desigualdad de capacidad entre Maputo y las regiones del centro/norte, sin publicar una tabla contemporánea de rutas y operadores. El eje Maputo–Beira–Nampula no se introduce como una sola ruta certificada por inferencia. ([trade.gov](https://www.trade.gov/country-commercial-guides/mozambique-digital-economy))

**NA — Namibia.** Es uno de los inventarios mejor documentados del continente. Telecom Namibia describe una **red nacional superior a 13.000 route-km** y confirma que su infraestructura digital cubre todo el país. ([telecom.na](https://www.telecom.na/downloads/reports/2022-2023/Annual-Report-2022-23.pdf))

La **Omaheke ring** sigue la secuencia **Windhoek → Omitara → Witvlei → Gobabis → Buitepos → Otjinene → Grootfontein → Otavi → Otjiwarongo → Omaruru → Karibib → Okahandja → Windhoek**. La **Kunene ring** recorre **Otjiwarongo → Otavi → Grootfontein → Tsumeb → Oshivelo → Omuthiya → Ondangwa → Oshakati → Outapi → Ruacana → Kamanjab → Outjo → Otjiwarongo**. La **Southern backbone ring** hace **Windhoek → Gobabis → Aranos → Stampriet → Maltahöhe → Aus → Keetmanshoop → Mariental → Rehoboth → Windhoek**. Todas son de **Telecom Namibia**; estaban en servicio en **2008/09**, con ampliaciones DWDM posteriores y una red nacional aún activa en 2022/23. ([telecom.na](https://www.telecom.na/downloads/reports/2008-09/Network-Operations.pdf))

Además, Telecom Namibia documentó fibra nueva **Henties Bay–Kamanjab (504 km)**, **Tsumeb–Oshakati (267 km)** y **Karasburg–Velloorsdrift (138 km)** terminada durante 2008/09. Son rutas válidas por longitud, aunque para evitar saturar el país con ramales secundarios no las incorporo todas al JSON. ([telecom.na](https://www.telecom.na/downloads/reports/2008-09/Network-Operations.pdf))

**ZA — South Africa.** Broadband Infraco disponía ya de aproximadamente **12.250 km** de fibra nacional en 2011 y posteriormente se citaban unos **13.600 km de long-distance fibre**, dedicada precisamente a servicios mayoristas de larga distancia. Los grandes ejes nacionales unen **Johannesburg → Bloemfontein → Cape Town** y **Johannesburg → Durban**, además de numerosos ramales fronterizos. ([gov.za](https://www.gov.za/news/statement-chairperson-infrastructure-development-cluster-and-minister-transport-mr-sibusiso-0))

La existencia actual de una extensa red nacional también está corroborada por operadores privados: Liquid Intelligent Technologies describe en 2026 una red panafricana de más de **116.000 km**, con backbone protegido y centros clave en Johannesburg y Cape Town. Para el JSON, no obstante, atribuyo los dos corredores seleccionados a **Broadband Infraco**, porque la fuente gubernamental identifica inequívocamente su función de larga distancia. Año: **≤2011**. ([za.liquid.tech](https://za.liquid.tech/about-us/our-network/))

**ZM — Zambia.** La UIT validó redes de **Zamtel, CEC y del ministerio**, y el país está atravesado por importantes rutas de fibra regionales. Sin embargo, los documentos recuperados no asignan con suficiente precisión, en un inventario contemporáneo, secuencias como Lusaka–Copperbelt–Solwezi o Lusaka–Livingstone a un operador y año de servicio. Quedan fuera del JSON para mantener el estándar homogéneo. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

**ZW — Zimbabwe.** TelOne proporciona documentación particularmente concreta. En 2017 completó **Bulawayo → Beitbridge** y **Harare → Masvingo** como enlaces backbone de fibra, actualizó **Gweru → Masvingo**, mejoró **Bulawayo → Victoria Falls** y actualizó el corredor de nodos **Mutare → Harare → Bulawayo → Plumtree**. ([telone.co.zw](https://www.telone.co.zw/Content/Uploads/Reports/d4b8d95a-9f4f-4c6a-85ad-5b91910b4528.pdf))

En 2021 TelOne seguía invirtiendo en el backbone, aumentando la capacidad del corredor **Harare–Bulawayo–Beitbridge** en 200G; sus cuentas también describen los préstamos utilizados para los proyectos de fibra **Mutare–Harare** y **Harare–Bulawayo**, además de un arrendamiento de backhaul Harare–Kariba. Esto proporciona una buena confirmación de continuidad operacional, no sólo de construcción histórica. Operador: **TelOne**; año de las rutas principales: **2017 o anterior**, actividad confirmada en **2021**. ([telone.co.zw](https://www.telone.co.zw/Content/Uploads/reports/e1e27f22-035d-40e6-88bb-f825b25bc66a.pdf))

## Qué queda fuera y por qué

El hallazgo más importante no es que los países omitidos carezcan necesariamente de fibra. En muchos casos ocurre lo contrario: **la existencia de una red nacional es indudable, pero la documentación pública no permite convertirla honradamente en una lista ordenada de ciudades, operador, año y estado actual**. La propia página de validación de la UIT muestra redes de operadores en Benin, Burkina Faso, Ethiopia, Ghana, Kenya, Liberia, Mali, Niger, Nigeria, Senegal, South Africa, Eswatini, Togo, Uganda, Zambia y Zimbabwe, así como Algeria, Comoros, Egypt, Libya, Mauritania, Morocco, Somalia, Sudan y Tunisia. ([itu.int](https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx))

Los casos más sensibles son los de conflicto. **Sudan** tenía múltiples corredores terrestres internacionales antes de 2023, pero una fuente prebélica no demuestra continuidad en 2026. **Mali, Burkina Faso y Niger** disponen de fibra nacional, pero una cartografía anterior a los cambios de seguridad no permite certificar los segmentos remotos. En **Somalia**, por el contrario, el Banco Mundial permite separar la fibra comprobada de Golis/Somcable de las numerosas zonas que siguen distribuyendo capacidad principalmente por microondas o satélite. ([thedocs.worldbank.org](https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Digital-Economy-RepSudan-jun22.pdf))

También hay falsos positivos de proyecto: en **South Sudan** la fuente dice expresamente que no existe un backbone doméstico nacional operativo, aunque sí el corredor Juba–Uganda; en **Guinea** el gran backbone construido todavía figuraba como no operativo en la última evidencia precisa recuperada; en **Guinea-Bissau** el Banco Mundial seguía señalando la ausencia de backbone nacional; y en **Chad** las nuevas dorsales hacia Niger y por Sarh–Am Timan–Abéché estaban claramente separadas de las rutas ya en servicio. ([documents1.worldbank.org](https://documents1.worldbank.org/curated/en/099450206282323160/pdf/IDU00f2d51f40fd4a04e630b0b60d27b1a4f548b.pdf))

Por último, **Cabo Verde, Comoros, São Tomé and Príncipe y Seychelles** no producen una ruta terrestre interurbana individual >100 km en la evidencia revisada; no cuento como “terrestre” los saltos submarinos entre islas. El mismo criterio conservador impide inflar artificialmente Mauritius mediante la suma de bucles metropolitanos.

## Datos estructurados de las rutas aceptadas como en servicio

El siguiente array contiene **sólo las rutas que considero suficientemente respaldadas como operativas**, no los proyectos, las rutas únicamente históricas/preconflicto ni los casos donde sólo pude demostrar la existencia agregada de una red. En los casos en que una fuente reciente confirma la red y una fuente anterior del mismo operador da el trazado detallado, la cadena `fuente` menciona ambas funciones.

```json
[
  {
    "nombre": "Trans-Saharan Fibre Backbone - Algeria southbound spine",
    "operador": "Algérie Télécom / Government of Algeria",
    "pais": "DZ",
    "ciudades": ["Algiers", "Ghardaia", "In Salah", "Tamanrasset", "In Guezzam"],
    "estado": "en servicio",
    "fuente": "https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx ; la UIT documenta redes terrestres argelinas; el Ministerio argelino de telecomunicaciones documentó como completada la dorsal transahariana de aproximadamente 2,548 km entre Algiers e In Guezzam y posteriormente se puso en servicio la interconexión con Niger."
  },
  {
    "nombre": "Telecom Egypt Alexandria-Cairo-Suez terrestrial crossing",
    "operador": "Telecom Egypt",
    "pais": "EG",
    "ciudades": ["Alexandria", "Cairo", "Suez"],
    "estado": "en servicio",
    "fuente": "https://bbmaps.itu.int/bbmaps/ ; https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx ; Telecom Egypt mantiene una infraestructura nacional de rutas terrestres diversificadas y la UIT valida la red TE Data/Telecom Egypt."
  },
  {
    "nombre": "Telecom Egypt Port Said-Cairo-Suez terrestrial crossing",
    "operador": "Telecom Egypt",
    "pais": "EG",
    "ciudades": ["Port Said", "Cairo", "Suez"],
    "estado": "en servicio",
    "fuente": "https://bbmaps.itu.int/bbmaps/ ; https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx ; Telecom Egypt declara múltiples rutas terrestres diversificadas entre sus puntos de llegada y el interior, y la UIT valida su red terrestre."
  },
  {
    "nombre": "Chad Southern Backbone",
    "operador": "Sotel Tchad",
    "pais": "TD",
    "ciudades": ["N'Djamena", "Guelendeng", "Bongor", "Kelo", "Moundou", "M'Baikoro", "Kagpal", "M'Béré"],
    "estado": "en servicio",
    "fuente": "https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf ; el diagnóstico digital del Banco Mundial clasifica N'Djamena-M'Béré, 870 km, como 'In service', gestionada por Sotel Tchad y completada en 2011, y enumera los nodos intermedios del tramo sur."
  },
  {
    "nombre": "Chad Eastern Backbone",
    "operador": "Sudachad",
    "pais": "TD",
    "ciudades": ["N'Djamena", "Abéché", "Adré"],
    "estado": "en servicio",
    "fuente": "https://thedocs.worldbank.org/en/doc/61714f214ed04bcd6e9623ad0e215897-0400012021/related/Chad-country-diagnostic.pdf ; el Banco Mundial clasifica N'Djamena-Adré, 1,142 km, como 'In service', completada en 2019 y gestionada por Sudachad."
  },
  {
    "nombre": "Benin north-south national backbone",
    "operador": "State backbone / SBIN, legacy Benin Telecom infrastructure",
    "pais": "BJ",
    "ciudades": ["Cotonou", "Bohicon", "Dassa-Zoumé", "Parakou", "Kandi", "Malanville"],
    "estado": "en servicio",
    "fuente": "https://bbmaps.itu.int/bbmaps/ ; https://www.itu.int/en/ITU-D/Technology/Pages/InteractiveTransmissionMaps_EndValidation.aspx ; la UIT valida Benin Telecom y su informe State of Broadband in Africa 2025 describe una dorsal nacional activa de aproximadamente 2,550 km que conecta 50 municipios."
  },
  {
    "nombre": "ECOWAN North Bank / Banjul-Basse corridor",
    "operador": "Gamtel / ECOWAN",
    "pais": "GM",
    "ciudades": ["Banjul", "Barra", "Farafenni", "Basse Santa Su"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/674601544534500678/pdf/Main-Report.pdf ; el Banco Mundial describe ECOWAN y la red nacional de Gambia, incluida la fibra de Banjul a Basse; documentación posterior del Banco Mundial registra operadores utilizando ECOWAN en 2024."
  },
  {
    "nombre": "ECOWAN South Bank / Banjul-Fatoto corridor",
    "operador": "Gamtel / ECOWAN",
    "pais": "GM",
    "ciudades": ["Banjul", "Brikama", "Soma", "Bansang", "Fatoto"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/674601544534500678/pdf/Main-Report.pdf ; el Banco Mundial describe el despliegue ECOWAN de aproximadamente 817 km, con cobertura longitudinal hasta el extremo oriental del país; la red registra uso mayorista posterior."
  },
  {
    "nombre": "Eastern Corridor Fiber Optic Backbone",
    "operador": "NITA / Government of Ghana",
    "pais": "GH",
    "ciudades": ["Accra", "Ho", "Hohoe", "Nkwanta", "Yendi", "Tamale", "Bolgatanga", "Bawku"],
    "estado": "en servicio",
    "fuente": "https://moc.gov.gh/eastern-corridor-fiber-optic-backbone/ ; el Ministerio de Comunicaciones de Ghana describe el Eastern Corridor Fiber Optic Backbone; documentación oficial del Gobierno/Banco Mundial registra unos 1,100 km, 10 secciones y 11 nodos DWDM entre Accra y Bawku."
  },
  {
    "nombre": "Sierra Leone backbone to Liberia border",
    "operador": "Leonecom / National Fibre Backbone Network",
    "pais": "SL",
    "ciudades": ["Freetown", "Bo", "Kenema", "Zimmi"],
    "estado": "en servicio",
    "fuente": "https://www.itu.int/en/ITU-T/Workshops-and-Seminars/qos/20250701/Documents/3-%20NFB.pdf ; Leonecom presentó ante la UIT en 2025 una red nacional de aproximadamente 1,630 km que alcanza las fronteras de Liberia y Guinea; el Banco Mundial documenta el enlace Freetown-Zimmi como parte del backbone nacional."
  },
  {
    "nombre": "Sierra Leone backbone to Guinea border",
    "operador": "Leonecom / National Fibre Backbone Network",
    "pais": "SL",
    "ciudades": ["Freetown", "Makeni", "Kambia", "Gbalamuya"],
    "estado": "en servicio",
    "fuente": "https://www.itu.int/en/ITU-T/Workshops-and-Seminars/qos/20250701/Documents/3-%20NFB.pdf ; Leonecom informa a la UIT de aproximadamente 1,630 km de fibra subterránea y cobertura de más del 85% de los distritos; el backbone nacional llega a la frontera de Guinea."
  },
  {
    "nombre": "CAB-CAR national backbone",
    "operador": "Government of the Central African Republic / CAB-CAR",
    "pais": "CF",
    "ciudades": ["Bangui", "Baoro", "Carnot", "Berbérati"],
    "estado": "en servicio",
    "fuente": "https://www.afdb.org/en/news-and-events/multimedia/video/success-story-arrival-fiber-optics-brings-central-african-republic-digital-age-82978 ; https://etradeforall.org/news/young-people-central-african-republic-can-now-enter-digital-professions-thanks-fibre-optic ; el proyecto CAB-CAR terminó en septiembre de 2023 e instaló la primera dorsal nacional, de alrededor de 900 km; el trazado principal conecta Bangui y Berbérati vía Baoro y Carnot."
  },
  {
    "nombre": "Projet de Couverture Nationale - Pointe-Noire to Ouesso",
    "operador": "Congo Telecom",
    "pais": "CG",
    "ciudades": ["Pointe-Noire", "Dolisie", "Brazzaville", "Oyo", "Ouesso"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/099630005112275398/pdf/P175592002d4590208e3c034a9c0a165ad.pdf ; el Banco Mundial describe el PCN como unos 3,000 km de backbone de fibra que conecta Pointe-Noire, Dolisie, Brazzaville, Oyo y Ouesso, operado y comercializado por Congo Telecom."
  },
  {
    "nombre": "Burundi Backbone System north-eastern spine",
    "operador": "Burundi Backbone System",
    "pais": "BI",
    "ciudades": ["Bujumbura", "Kayanza", "Ngozi", "Kirundo", "Kobero"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/674601544534500678/pdf/Main-Report.pdf ; el Banco Mundial describe BBS como un backbone de fibra de aproximadamente 1,250 km que conecta las 17 provincias y dispone de puntos fronterizos hacia Rwanda y Tanzania."
  },
  {
    "nombre": "Burundi Backbone System southern spine",
    "operador": "Burundi Backbone System",
    "pais": "BI",
    "ciudades": ["Bujumbura", "Rumonge", "Makamba", "Mugina"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/674601544534500678/pdf/Main-Report.pdf ; el Banco Mundial documenta BBS como red mayorista open-access de 1,250 km, con cobertura nacional y salida terrestre hacia Tanzania."
  },
  {
    "nombre": "NOFBI Northern Corridor",
    "operador": "ICT Authority / Government of Kenya",
    "pais": "KE",
    "ciudades": ["Mombasa", "Nairobi", "Nakuru", "Eldoret", "Malaba"],
    "estado": "en servicio",
    "fuente": "https://www.oagkenya.go.ke/wp-content/uploads/2022/08/Implementation-of-National-Optic-Fibre-Backbone-Infrastructure-Project.pdf ; la Auditoría General de Kenya documenta la implementación de NOFBI como red pública nacional; el corredor Mombasa-Nairobi-Uganda es el principal eje terrestre nacional."
  },
  {
    "nombre": "Rwanda national backbone south-western spine",
    "operador": "Government of Rwanda / RISA",
    "pais": "RW",
    "ciudades": ["Kigali", "Muhanga", "Huye", "Rusizi"],
    "estado": "en servicio",
    "fuente": "https://www.risa.gov.rw/index.php?eID=dumpFile&f=65375&t=f&token=3539531ff978f107e3ab03cc5ceaac74b1e0b713 ; RISA documenta el despliegue de aproximadamente 6,000 km de backbone nacional de fibra financiado públicamente."
  },
  {
    "nombre": "Rwanda national backbone north-western spine",
    "operador": "Government of Rwanda / RISA",
    "pais": "RW",
    "ciudades": ["Kigali", "Musanze", "Rubavu"],
    "estado": "en servicio",
    "fuente": "https://www.risa.gov.rw/index.php?eID=dumpFile&f=65375&t=f&token=3539531ff978f107e3ab03cc5ceaac74b1e0b713 ; RISA confirma una red troncal nacional de aproximadamente 6,000 km con cobertura nacional."
  },
  {
    "nombre": "Golis Puntland fibre backbone",
    "operador": "Golis Telecom",
    "pais": "SO",
    "ciudades": ["Bosaso", "Garowe", "Galkayo"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/099500006282221939/pdf/P1775040e575fc036094170aca16ab29e5f.pdf ; el Banco Mundial dice que partes de Puntland, específicamente Bosaso, Garowe y Galkayo, cuentan con backbone terrestre de fibra gestionado por Golis, mientras otras regiones siguen dependiendo de microondas o satélite."
  },
  {
    "nombre": "Somcable Somaliland backbone",
    "operador": "Somcable",
    "pais": "SO",
    "ciudades": ["Berbera", "Hargeisa", "Borama"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/099500006282221939/pdf/P1775040e575fc036094170aca16ab29e5f.pdf ; el Banco Mundial describe Somaliland como una región con un backbone terrestre de fibra relativamente bien desarrollado gestionado por Somcable."
  },
  {
    "nombre": "South Sudan Juba-Uganda terrestrial fibre route",
    "operador": "South Sudan-Uganda international fibre corridor",
    "pais": "SS",
    "ciudades": ["Juba", "Nimule"],
    "estado": "en servicio",
    "fuente": "https://documents1.worldbank.org/curated/en/099450206282323160/pdf/IDU00f2d51f40fd4a04e630b0b60d27b1a4f548b.pdf ; el Banco Mundial afirma que South Sudan carece de un backbone doméstico operacional y depende de la ruta de fibra desde Juba hacia Uganda; Nimule es el nodo fronterizo del corredor."
  },
  {
    "nombre": "NICTBB Central-Western Corridor",
    "operador": "TTCL / National ICT Broadband Backbone",
    "pais": "TZ",
    "ciudades": ["Dar es Salaam", "Morogoro", "Dodoma", "Singida", "Shinyanga", "Mwanza"],
    "estado": "en servicio",
    "fuente": "https://www.ttcl.co.tz/ ; TTCL continúa explotando y promocionando en 2026 el Mkongo wa Taifa, el National ICT Broadband Backbone; este corredor forma parte de la dorsal nacional desplegada por fases."
  },
  {
    "nombre": "NICTBB Southern Corridor",
    "operador": "TTCL / National ICT Broadband Backbone",
    "pais": "TZ",
    "ciudades": ["Dar es Salaam", "Morogoro", "Iringa", "Mbeya", "Tunduma"],
    "estado": "en servicio",
    "fuente": "https://www.ttcl.co.tz/ ; TTCL confirma en 2026 la explotación del backbone nacional Mkongo wa Taifa, del que el eje Dar es Salaam-Mbeya-Tunduma es una ruta troncal terrestre."
  },
  {
    "nombre": "Uganda NBI Eastern Corridor",
    "operador": "NITA-U",
    "pais": "UG",
    "ciudades": ["Kampala", "Jinja", "Mbale", "Busia"],
    "estado": "en servicio",
    "fuente": "https://ict.go.ug/site/documents/ministerial-policy-statement-mps-20252026.pdf ; el Ministerio de ICT de Uganda mantiene y supervisa los activos de la National Backbone Infrastructure en 2025/26 y separa la red existente de los 6,000 km adicionales planificados."
  },
  {
    "nombre": "Uganda NBI South-Western Corridor",
    "operador": "NITA-U",
    "pais": "UG",
    "ciudades": ["Kampala", "Masaka", "Mbarara", "Kabale"],
    "estado": "en servicio",
    "fuente": "https://ict.go.ug/site/documents/ministerial-policy-statement-mps-20252026.pdf ; la National Backbone Infrastructure es una red operativa cuyos activos, subsistemas y capacidad siguen bajo mantenimiento y gestión pública."
  },
  {
    "nombre": "Uganda NBI Northern-West Nile Corridor",
    "operador": "NITA-U",
    "pais": "UG",
    "ciudades": ["Kampala", "Luwero", "Gulu", "Arua"],
    "estado": "en servicio",
    "fuente": "https://ict.go.ug/site/documents/ministerial-policy-statement-mps-20252026.pdf ; el presupuesto ministerial 2025/26 confirma la operación, mantenimiento y extensión de la National Backbone Infrastructure."
  },
  {
    "nombre": "BoFiNet North-East Corridor",
    "operador": "BoFiNet",
    "pais": "BW",
    "ciudades": ["Gaborone", "Palapye", "Francistown", "Nata", "Kasane"],
    "estado": "en servicio",
    "fuente": "https://www.bofinet.co.bw/ ; BoFiNet mantiene actualmente la red nacional mayorista y su mapa de cobertura de fibra; los activos nacionales de backbone fueron transferidos desde BTC a BoFiNet."
  },
  {
    "nombre": "BoFiNet Western-North-West Corridor",
    "operador": "BoFiNet",
    "pais": "BW",
    "ciudades": ["Gaborone", "Kang", "Ghanzi", "Maun"],
    "estado": "en servicio",
    "fuente": "https://www.bofinet.co.bw/ ; la cobertura actual de BoFiNet muestra la extensión nacional del backbone de fibra, incluida la ruta hacia el oeste y Maun."
  },
  {
    "nombre": "Telecom Namibia Omaheke Ring",
    "operador": "Telecom Namibia",
    "pais": "NA",
    "ciudades": ["Windhoek", "Omitara", "Witvlei", "Gobabis", "Buitepos", "Otjinene", "Grootfontein", "Otavi", "Otjiwarongo", "Omaruru", "Karibib", "Okahandja", "Windhoek"],
    "estado": "en servicio",
    "fuente": "https://www.telecom.na/downloads/reports/2008-09/Network-Operations.pdf ; Telecom Namibia enumera esta secuencia como Omaheke SDH/fibre ring; https://www.telecom.na/downloads/reports/2022-2023/Annual-Report-2022-23.pdf confirma que la red digital nacional continúa operativa y supera 13,000 route-km."
  },
  {
    "nombre": "Telecom Namibia Kunene Ring",
    "operador": "Telecom Namibia",
    "pais": "NA",
    "ciudades": ["Otjiwarongo", "Otavi", "Grootfontein", "Tsumeb", "Oshivelo", "Omuthiya", "Ondangwa", "Oshakati", "Outapi", "Ruacana", "Kamanjab", "Outjo", "Otjiwarongo"],
    "estado": "en servicio",
    "fuente": "https://www.telecom.na/downloads/reports/2008-09/Network-Operations.pdf ; Telecom Namibia describe expresamente la Kunene ring y sus nodos; el informe 2022/23 confirma la continuidad de la red nacional de más de 13,000 route-km."
  },
  {
    "nombre": "Telecom Namibia Southern Backbone Ring",
    "operador": "Telecom Namibia",
    "pais": "NA",
    "ciudades": ["Windhoek", "Gobabis", "Aranos", "Stampriet", "Maltahöhe", "Aus", "Keetmanshoop", "Mariental", "Rehoboth", "Windhoek"],
    "estado": "en servicio",
    "fuente": "https://www.telecom.na/downloads/reports/2008-09/Network-Operations.pdf ; Telecom Namibia describe el Southern backbone ring y sus nodos y upgrades de fibra; https://www.telecom.na/downloads/reports/2022-2023/Annual-Report-2022-23.pdf confirma la red nacional actual."
  },
  {
    "nombre": "Broadband Infraco Johannesburg-Cape Town backbone",
    "operador": "Broadband Infraco",
    "pais": "ZA",
    "ciudades": ["Johannesburg", "Bloemfontein", "Cape Town"],
    "estado": "en servicio",
    "fuente": "https://www.gov.za/news/statement-chairperson-infrastructure-development-cluster-and-minister-transport-mr-sibusiso-0 ; el Gobierno de South Africa informó que Broadband Infraco disponía de aproximadamente 12,250 km de fibra nacional, posteriormente citada como una red de larga distancia de alrededor de 13,600 km que conecta los principales centros."
  },
  {
    "nombre": "Broadband Infraco Johannesburg-Durban backbone",
    "operador": "Broadband Infraco",
    "pais": "ZA",
    "ciudades": ["Johannesburg", "Durban"],
    "estado": "en servicio",
    "fuente": "https://www.gov.za/news/statement-chairperson-infrastructure-development-cluster-and-minister-transport-mr-sibusiso-0 ; Broadband Infraco opera una red nacional de fibra de larga distancia; documentos de política del Gobierno identifican Johannesburg, Cape Town y Durban como los principales corredores de larga distancia."
  },
  {
    "nombre": "TelOne Bulawayo-Beitbridge backbone",
    "operador": "TelOne",
    "pais": "ZW",
    "ciudades": ["Bulawayo", "Beitbridge"],
    "estado": "en servicio",
    "fuente": "https://www.telone.co.zw/Content/Uploads/Reports/d4b8d95a-9f4f-4c6a-85ad-5b91910b4528.pdf ; TelOne declara que completó el Bulawayo-Beitbridge optic fibre backbone link en 2017; https://www.telone.co.zw/Content/Uploads/reports/e1e27f22-035d-40e6-88bb-f825b25bc66a.pdf documenta posteriores upgrades de capacidad del backbone."
  },
  {
    "nombre": "TelOne Harare-Masvingo backbone",
    "operador": "TelOne",
    "pais": "ZW",
    "ciudades": ["Harare", "Masvingo"],
    "estado": "en servicio",
    "fuente": "https://www.telone.co.zw/Content/Uploads/Reports/d4b8d95a-9f4f-4c6a-85ad-5b91910b4528.pdf ; TelOne declara completado en 2017 el Harare-Masvingo backbone optic fibre link."
  },
  {
    "nombre": "TelOne Mutare-Harare-Bulawayo-Plumtree backbone",
    "operador": "TelOne",
    "pais": "ZW",
    "ciudades": ["Mutare", "Harare", "Bulawayo", "Plumtree"],
    "estado": "en servicio",
    "fuente": "https://www.telone.co.zw/Content/Uploads/Reports/d4b8d95a-9f4f-4c6a-85ad-5b91910b4528.pdf ; TelOne documenta el upgrade de nodos del corredor Mutare-Harare-Bulawayo-Plumtree; https://www.telone.co.zw/Content/Uploads/reports/e1e27f22-035d-40e6-88bb-f825b25bc66a.pdf documenta financiación específica de los proyectos de fibra Mutare-Harare y Harare-Bulawayo."
  },
  {
    "nombre": "TelOne Bulawayo-Victoria Falls backbone",
    "operador": "TelOne",
    "pais": "ZW",
    "ciudades": ["Bulawayo", "Victoria Falls"],
    "estado": "en servicio",
    "fuente": "https://www.telone.co.zw/Content/Uploads/Reports/d4b8d95a-9f4f-4c6a-85ad-5b91910b4528.pdf ; TelOne enumera el Bulawayo-Victoria Falls backbone link entre las rutas nacionales actualizadas durante su programa de modernización."
  }
]
```
