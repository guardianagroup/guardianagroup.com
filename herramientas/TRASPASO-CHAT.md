# GUARDIANA · Traspaso para un chat nuevo de Claude

Actualizado el sábado 24 de octubre de 2026 a las 21:25, hora de Bogotá, al cerrar la tercera cuenta del día. Copia de seguridad: todo está en GitHub con su historial completo. Al cerrar, `main` iba en `80affc7` (más el commit que hará el workflow de empresas al terminar) y `web-idiomas` en el commit de este documento. Desde esta sesión no se pueden subir etiquetas de git: el proxy lo rechaza. Lo escribe la sesión anterior (Claude Opus 5.5) para que la siguiente siga el trabajo sin perder nada. **Pega este documento entero en el chat nuevo.**

## Estado al cerrar esta cuenta (24 Oct 2026, 21:25, Bogotá) — EMPIEZA POR AQUÍ

**Cuenta nueva desde las 19:35** (la tercera del día). GitHub conectado con `add_repo` (`access: push`): clon de trabajo en `/home/claude/guardianagroup.com` (rama `web-idiomas`, clonado con `--depth 1 --branch web-idiomas`) y `main` en el worktree `/home/claude/wt-main`. Ojo: con el clon de una sola rama, `git fetch origin main` no actualiza `origin/main`; usa `git fetch origin +main:refs/remotes/origin/main`. Navegador integrado: `seed` Cheaper Inference (Playground de Astra, `gpt-6-astra`, saldo ~6,5 US$), `tab-1` ChatGPT («Alta»), `tab-2` Gemini (4 Argon; el selector de modelo a veces no se ve), `tab-3` Nominatim (para `fetch` a Nominatim y a Overpass) y `tab-4` guardianagroup.com/orbita/. El dueño inicia las sesiones; tú nunca escribes claves. Al leer el Playground, quédate solo con el texto entre «ASSISTANT OUTPUT» y «Response headers» o «request.js», y borra todo lo que empiece por `ci_live_`.

**Publicado hoy en esta cuenta, en las dos ramas** (`web-idiomas` daa9b4a, `main` 67e520c; antes `main` 34256f8 y 516445e):
- **Ronda 26b terminada** (notas: `agencia-rondas/ronda26/notas-26b.md`): Astra hizo los lotes 5–8; ChatGPT y Gemini, el resto. Entran TMX5 (Telmex, San José del Cabo–Mazatlán, con Claude y el comunicado de Telmex), WARF (India–Maldivas), PENBAL-5 (Gavà–Ses Covetes, con Claude y el documento de Defensa) y Sorsogon–Samar. Descartados con fuente: Lanka Bell (es la llegada de FALCON), Mazatlán–La Paz, Mozambique Festoon (RTI: dañado), Hawaiki Nui 1 (en proyecto). Quedan 17 cables de una sola voz (lista en las notas) y 27 «solo lo nombra» en total.
- **Revisión completa del planeta** (orden del dueño, 20:02–20:31: «que todo llegue de punto a punta bien»):
  - **H2HE** iba por Zhuhai cruzando Lantau: quitada Zhuhai (ninguna fuente la da).
  - **10 duplicados unidos** con `ALIAS` y `NOMBRE` en `cables_agencia.py` (AU-Aleutian(s), Mariana-Guam, TGN-WE, HIFN, Jayabaya, Dos Continentes, Gulf of California/Pichilingue, Cook Strait, Avassa, Amerigo Vespucci/Bonaire–Curaçao).
  - **Trazado con la costa fina** (clase `Fina`, `herramientas/fuentes/tierra-ne10m.png`, Natural Earth 10m a 0,025°): rodea islas y penínsulas, corta en la costa los extremos que entraban tierra adentro y lleva a la costa los que se quedaban en el mar. Tierra pisada por dentro: de 60.135 km a 9.130 km.
  - **Cables a medias en OpenStreetMap:** si una pieza acaba en mar abierto (función `sueltos`), se dibuja el cable entero de la agencia; `OSM_ES` une piezas con nombre de segmento («ECFS 6.3», «Flag Atlantic South», «Hibernia 'D'»…). Las piezas sin nombre que acaban en el mar dejan de dibujarse. Extremos sueltos: de 100 a 12 (6 son plataformas).
  - **Retirados quitados** (`RETIRADOS`): TAT-9, TAT-11, TAT-12/13, TAT-14, CANTAT-3 y SEA-ME-WE 2 (Wikipedia).
  - **Herramientas nuevas:** `revisa_extremos.py` (extremos en mar abierto), `revisa_tierra.py` (tramos que pisan tierra; necesita los geojson de Natural Earth: `git clone --depth 1 --filter=blob:none --sparse https://github.com/nvkelso/natural-earth-vector` y `sparse-checkout set --no-cone /geojson/ne_10m_land.geojson /geojson/ne_10m_minor_islands.geojson`) y `tierra_16k.py`.
- **Mapa gris con la costa precisa** (dueño, 20:28, Lewis no salía): teselas `orbita/static/tierra/tierra-16k/` (Natural Earth 10m, como dia-16k) que `orbita.js` usa dentro de la «zona» (`uZonaT`, unidad 5). `orbita.js?v=20261025s`.
- **Fichas de empresas:** revisión 1 publicada (`agencia-rondas/empresas/decisiones.py` → `revision-1.json`, 45 empresas, 8 fotos; `copiar()` admite `sede`, `sede_pais` y `cc`); el workflow escribió `orbita/datos/empresas.json` y las fotos. **Diseño aprobado por el dueño (20:27)** y programado en ESPEJO: en la lista de empresas, las que tienen ficha llevan «›» y abren la ficha (`OrbitaCapas.abreFicha`; foto con crédito, dirección y de qué registro sale, datos, mapa pequeño recortado de dia-16k sin texto debajo —el dueño no quiere el texto de la NASA ahí—, «Verla en Órbita», «Copiar ficha», «Guardar PDF»). Créditos y fuentes en `terminos.html` §6 (`#fotos`, `#empresas`). Versiones: `capas.js?v=20261025z`, `espejo.js?v=20261025l`, `idioma.js?v=20261025s`, `orbita.css?v=20261025u`.
- Arreglo: `preparaNiveles` y `fibraVisible` ya no fallan si la fibra no ha cargado (error «reading 'corr'»).

**A medias al cerrar (21:25)**
1. **Plataformas petrolíferas (encargo del dueño, 21:08: nombre, información y foto al pulsar):** todo en `agencia-rondas/ronda29/plataformas.md` (10 plataformas comprobadas, pasos). `cables_agencia.py` ya tiene `OSM_PRIORIDAD`; estaba corriendo de nuevo (con `lugares_capas.py`) para devolver las piezas de Tampnet. Si `orbita/datos/cables.json` no está guardado con ese cambio, vuelve a ejecutarlo partiendo del publicado: `git show origin/main:orbita/datos/cables.json > orbita/datos/cables.json` (ojo: el publicado ya no tiene las piezas de Tampnet; si hace falta, parte de `git show 3e28b7c:orbita/datos/cables.json`), después `python3 herramientas/cables_agencia.py && python3 herramientas/lugares_capas.py`. Prometí al dueño captura de diseño antes de publicar las plataformas.
2. **Ronda 28, fibra de las 24 islas pequeñas** (notas: `agencia-rondas/ronda28/notas.md`): ChatGPT respondió el lote a (guardado en `fibra-agencia/chatgpt-troncales-islas-28a.json`). Gemini estaba respondiendo el lote a en el chat «Fibras de islas caribeñas»: guárdalo como `fibra-agencia/gemini-troncales-islas-28a.json`. Falta el lote b (`pregunta-islas-b.txt`) con las dos voces, el cruce de lo que solo da una voz (Astra de 2 en 2), añadir AX, AS, BQ, GG, IM, JE, MP, PM y SJ a `PEQUENOS` en `fibra_tierra.py`, y el proceso de los cables por tierra (más abajo).

**Cuánto falta para el 100 % (lo que se le dijo al dueño a las 21:00)**
- Cables submarinos: el 99,7 % de los extremos llegan a tierra. Faltan 6 extremos sueltos (APRICOT, Taiwán–Kinmen 2, FLAG Europe-Asia, UK-Ireland Crossing 2, Baltic Sea Submarine Cable y 2 sin nombre) y los cables de una sola voz.
- Cables por tierra: 202 de 235 territorios posibles (de 244 con pueblos; sin troncal posible: VA, PN, GS, TF, CC, CX, NF, NU, SH). Faltan las 24 islas de la ronda 28 y 9 por radioenlaces (ronda 27, plan aprobado: GL, ER, FK, TO, KI, TV, MH, NR, PW, y las rutas de bolsa como dato curioso).
- Ficha de empresa: falta llevarla a Radiografías, ZERO y sus PDF.
- Se estimaron 8–10 horas con la agencia.

**Cuarta cuenta (desde las 22:10):** nombres de país arreglados y publicados (22:21, `capas.js?v=20261026a`): letra de texto 600 11 px con espaciado 0,9 px, blanco 0,8 con halo oscuro como las ciudades, píxel entero, anchos medidos y guardados (`ANCHO_PAIS`). Captura de antes y después enviada. Pregunta del dueño (22:17) sobre «Otros centros de datos… con menos de cinco en el mapa»: se le explicó (menos de 5 centros de datos de esa compañía en el mapa) y se le propuso el texto «De compañías con 1 a 4 centros de datos en el mapa, o sin operador conocido»; esperando su sí (el texto está en `capas.js` hacia la línea 2107 y como clave en `idioma.js` y `static/i18n/*.json`).

**Cuarta cuenta, avance (23:05):**
- Publicado «Otros centros de datos» / «Grandes operadores» con texto nuevo en 42 idiomas (dueño «si», 22:25).
- **Plataformas (ronda 29) publicadas** (23:00, `capas.js?v=20261026c`, `idioma.js?v=20261026b`): 10 en `puntos-extra.json` (`clase: "plataforma"`, `gas: true` en Troll A, Sleipner A y Draupner S), cuadradito desde ×3, nombre desde ×8, ficha propia en `fichaEstacion`; fotos de 7 (revisión 2, `fotos.py copiar` admite candidata propia en la revisión); créditos y fuentes en `terminos.html` §6 (`#fotos`, `#plataformas`). Sin foto libre: Grane, Inspirer, Draupner (el dueño, 22:43, pide buscarlas con la agencia: pregunta enviada a Gemini en otra pestaña; solo licencias libres). Los nombres de bases y antenas usan ahora el halo de las ciudades.
- **Ronda 28: 18 islas publicadas** (de 202 a 220): AG AS AX BL BQ DM GD GG IM JE LC MF MP SJ SX TC VC VG. Respuestas en `fibra-agencia/{chatgpt,gemini}-troncales-islas-28{a,b}.json`; pueblos nuevos en `SITIOS` (Nominatim); `situa()` prueba «St» antes que «Saint». Faltan AI, KN, MS, CK, WF y PM: confirmación cruzada enviada (preguntas en `ronda28/pregunta-cruce-para-*.txt`); sus respuestas irán a `fibra-agencia/<voz>-troncales-islas-28c.json`.
- **Ronda 30, extremos sueltos:** pregunta en `ronda30/pregunta-extremos.txt`; Gemini respondió (`ronda30/gemini-extremos.json`: APRICOT en construcción, FLAG Europe-Asia retirado según Gemini, UK-Ireland Crossing 2 llega a Ballinesker, Taiwán–Kinmen 2 a Taichung, Sirri va a la plataforma Nasr). Falta la segunda voz (ChatGPT).
- **Ronda 27 (radioenlaces):** preguntas listas en `ronda27/pregunta-radio-paises.txt` y `pregunta-radio-bolsa.txt`, sin enviar.
- **23:20:** ronda 28c publicada (AI, KN, MS, CK, WF por confirmación cruzada): **225 territorios**. San Pedro y Miquelón (PM) se queda fuera: solo lo da Gemini; ChatGPT no lo respalda y Astra devolvió `[]`. Grane ya tiene foto (recorte del original; `fotos.py` admite `recorte` en la revisión). Preguntas en marcha: ChatGPT extremos (chat «Verificar cables submarinos en servicio», `/c/6adcf466-6a48-83e9-9a4c-d82da2498b09`), ChatGPT radioenlaces (`/c/6add8012-02dc-83e8-915d-e3a21c710e81`), ChatGPT colores (`/c/6add808d-3df8-83ea-b7b4-673547b78be7`), Gemini radioenlaces (`/app/ce6f3fc8a444ca39`) y Gemini colores (pestaña aparte). La pregunta de colores está en `ronda31/pregunta-colores.txt`. En el navegador integrado solo cabe una pestaña de ChatGPT: al cambiar de chat, la respuesta sigue generándose en el servidor.
- **Encargos nuevos del dueño:** revisión de colores y diseño con la agencia (22:54, enseñarle propuestas antes de cambiar nada); al acabar el mapa al 100 %, poner su ordenador a hibernar (22:50).

**Estado al guardar (25 Oct, 08:10; el dueño: «guarda» y «seguimos trabajando hasta tener el 100 % del mapa»)**
- **Ronda 30 publicada** en las dos ramas (`main` y `web-idiomas` 3894970): Taiwán–Kinmen 2 llega ya a Taichung y UK-Ireland Crossing 2 a Ballinesker (`EXTIENDE` en `cables_agencia.py`); fuera los tramos sin nombre de Sirri y del principio de Tonga Cable (`SIN_NOMBRE_FUERA`); «Eastern Light Sweden-Finland I» = «Eastern Light» (`ALIAS`). Quedan **8 extremos en el mar**: 5 son plataformas del mar del Norte sin plataforma conocida (Norsea Coms 2.337, 56.697; Tampnet 3.39, 56.284 = Valhall a 0,7 km; 2.466, 59.2 y 3.724, 60.646 = Troll A; Sleipnir-Grane 2.429, 59.106) y 3 con las voces en desacuerdo: APRICOT S6 (Gemini «en construcción», ChatGPT «en servicio», ambas: unidad de ramificación hacia Minamiboso–Agat/Tuas), FLAG Europe-Asia en Aqaba (Gemini «retirado», ChatGPT «en servicio», ambas: une con la troncal Suez–Jeddah) y Baltic Sea Submarine Cable (ambas: hacia Estocolmo, sin trazado). Respuestas en `ronda30/{gemini,chatgpt}-extremos.json`.
- **Ronda 27, radioenlaces: respuestas de ChatGPT y Gemini guardadas** (`radio-agencia/{chatgpt,gemini}-radio-1.json`). Generador nuevo `herramientas/radio_agencia.py` (reutiliza `fibra_agencia.py`) → `orbita/datos/radioenlaces.json`: **11 tramos** con dos voces (ER 6, GL 4, TO 1), solo en `web-idiomas` (nada lo dibuja todavía). `pueblos_fibra.py` ya busca también los pueblos de `radio-agencia` (publicado en `main`; workflow `pueblos-cables` corrido a las 00:30). Faltan por situar en `SITIOS` (Nominatim, estaba a medias): GL Kulusuk, Siorapaluk, Saqqaq, Kullorsuaq, Qassiarsuk, Narsarsuaq, Alluitsup Paa, Aappilattoq; ER Nefasit, Ghinda, Elabered, Hagaz, Haykota/Haikota, Tessenei/Teseney, Adi Quala, Gelalo, Tio, Nakfa, Adi Tekelezan, Segheneyti, Senafe, Himbirti, Mai Dima, Foro; FK Mount Pleasant, Goose Green, Port Howard, Fox Bay; TO Angaha; KI Buariki, Takarano, Taburao, Rawanawi/Rawannawi, Tebwangetua; PW Ollei, Orukei, Ngeremasch; MH Ine, Kwajalein, Ebeye. Después: volver a correr `radio_agencia.py`, **captura de diseño para el dueño** (línea punteada, capa o clase «Radioenlaces», ficha «Radioenlace de microondas · trazado aproximado») y solo entonces programarlo en `capas.js`.
- Ruta de la bolsa (Chicago–Nueva York, Londres–Fráncfort): pregunta enviada a Gemini (nueva conversación, pestaña `tab-5`), falta leerla y preguntar a ChatGPT (`ronda27/pregunta-radio-bolsa.txt`).
- **Ronda 31, colores:** Gemini respondió (`ronda31/gemini-colores.json`, 9 propuestas: escalonar el brillo de la paleta para daltónicos, atenuar las luces nocturnas bajo los cables, rombos para los puntos de intercambio, rojo de cortes hacia magenta, otro símbolo para bases/estaciones, diferenciar «aproximado» y «previsto», borde oscuro en la fibra por tierra, `prefers-reduced-motion`, atenuar el resto al pasar el ratón). Falta leer la de ChatGPT (`/c/6add808d-3df8-83ea-b7b4-673547b78be7`), cruzarlas y enseñar al dueño solo lo que digan las dos, con captura, antes de cambiar nada.
- San Pedro y Miquelón: sin segunda voz (solo Gemini).
- **08:10–08:50 (25 Oct):** radioenlaces programados en `capas.js` (clase `radio` de `CLASES.fibra`, `RADIO_COL`, `cargaRadio`, `pintaRadio`, `buscaRadio`, `fichaRadio`; solo en `web-idiomas`, commit 8dccbd3) con 17 tramos (ER, GL, FK, KI, PW, TO; pueblos en `SITIOS`). **Captura enviada al dueño, esperando su sí** para publicar: falta subir versiones de `capas.js` e `idioma.js`, correr `herramientas/agencia-rondas/ronda27/textos_radio.py <raíz del repo>` (textos en 42 idiomas; copia en este traspaso si se pierde: las claves son «Radioenlaces», «Cadenas de microondas de torre en torre…», «Radioenlace de microondas», el párrafo «Aquí internet viaja por el aire…» y «radioenlaces de microondas, punteados, donde no hay fibra») y llevar a `main` `capas.js`, `idioma.js`, `i18n/*.json`, `index.html` y `radioenlaces.json`, más una línea en `terminos.html` §6. MH fuera (Wikipedia: Kwajalein–Ebeye va por HANTRU-1, no por radio); TV y NR sin troncal. Ruta de la bolsa: Gemini respondió (`radio-agencia/gemini-radio-bolsa.json`); ChatGPT pensando en `/c/6add8012-02dc-83e8-915d-e3a21c710e81`.
  - **Publicado:** APRICOT entero (Yilan–Minamiboso–Agat, `ANADE` en `cables_agencia.py`) y el ramal de FLAG en Aqaba unido a la troncal (`EXTIENDE`). `revisa_extremos.py` cuenta aparte plataformas y uniones a mitad de cable: **quedan 2 extremos en el mar** (Norsea Coms, sin plataforma conocida en OpenStreetMap; Baltic Sea Submarine Cable, sin punto de llegada publicado).
  - **Colores:** propuesta de 7 ajustes en los que coinciden Gemini y ChatGPT enviada al dueño (aproximado/previsto, rombos para intercambio, triángulo/hexágono para estaciones/bases, borde oscuro en el planeta en color, «×» en los cortes, `prefers-reduced-motion`, ciudades en gris). Esperando cuáles quiere; captura de cada uno antes de publicar. Ojo: si los previstos pasan a puntos, distinguirlos de los radioenlaces (estos son blancos; los previstos, del color de su capacidad).
  - Los 17 cables de una sola voz de la ronda 26b ya pasaron por todas las voces; no entran (regla de las dos voces).
- **09:20:** publicada la plataforma **Judy** (Harbour Energy, 56.697, 2.337; helis.com + Harbour Energy), donde termina Norsea Coms. `revisa_extremos.py`: **queda 1 extremo en el mar** (Baltic Sea Submarine Cable, 19.655, 59.794: ninguna fuente publica dónde llega en Suecia). Radioenlaces: 19 tramos (17 + las dos rutas de la bolsa, Aurora–Mahwah y Slough–Fráncfort, reducidas a sus extremos por el gran círculo; `radio_agencia.py` fija Aurora en Illinois). Al publicarlos, traducir también la clave nueva «Cadenas de microondas de torre en torre: donde no hay fibra entre pueblos, y las rutas rápidas de la bolsa.», el párrafo de la bolsa («Por aquí viajan las órdenes de bolsa…») y «Latencia publicada» (el guion `ronda27/textos_radio.py` aún tiene la frase vieja en los otros idiomas).
- **Para el 100 %:** radioenlaces (9 países), San Pedro y Miquelón, los 3 extremos en desacuerdo (pedir tercera voz a Astra), las 5 plataformas sin identificar y los 17 cables de una sola voz de la ronda 26b. Después, hibernar el ordenador del dueño (computer use) como pidió.

**Aviso del dueño (21:22), hecho a las 22:21:** «el nombre del país está como que no se ve muy bien. Sin embargo, las ciudades se ven en alta calidad». Los nombres de país (mapa gris) los pinta `capas.js` (bloque de las cajas de países, hacia la línea 760: `cx.font = '600 10px "IBM Plex Mono"…'`, `fillStyle` gris translúcido y sin halo), mientras que las ciudades (`ciudades.js`) usan 12 px de la letra de texto, blanco y con halo (`conHalo`). Arreglo propuesto: el mismo tratamiento que las ciudades (tamaño 11–12 px, más opacidad, halo oscuro, posición redondeada al píxel) sin perder su estilo de mayúsculas espaciadas. Enséñale captura antes y después.

**25 Oct, 09:45 — radioenlaces publicados** (dueño, 08:38: «Publica todo lo que esté confirmado y tú veas conveniente»): `main` acfc794, `capas.js?v=20261026d`, `idioma.js?v=20261026c`, 19 tramos, textos en 42 idiomas, `terminos.html` §6 `#radioenlaces`. Comprobado en guardianagroup.com (Groenlandia, captura enviada). **El mapa tiene ya todo lo que dos voces confirman**; fuera, por falta de segunda voz o de dato público: el extremo del Baltic Sea Submarine Cable en Suecia, San Pedro y Miquelón, Marshall, Tuvalu, Nauru y los 17 cables de una sola voz.
**Ronda 31 (diseño), en curso:** hechos en local (sin publicar al escribir esto): `prefers-reduced-motion` (`QUIETO` en `capas.js`: sin luces que recorren los cables ni vaivén de las rayas), hexágono para las bases polares y triángulo para las estaciones terrenas (`pintaEstaciones`), previstos en puntos de su color (`setLineDash([0.1, 4.4])`, como ya mostraba la leyenda), punto de ciudad en gris `176,186,198` (`ciudades.js`). No se hace: la «×» de los cortes (Órbita los tiene apagados, `data-cortes="0"`), el borde oscuro bajo todos los cables (coste de dibujo) y lo que solo propone una voz. Ojo: la propuesta de rombo para los puntos de intercambio partía de una descripción mía equivocada (son anillos blancos, y los rombos ya son las estaciones de llegada de OpenStreetMap), así que no se cambia.

**Lo siguiente, por orden:** (0) los nombres de país (aviso de las 21:22); (1) plataformas petrolíferas; (2) ronda 28 (islas); (3) radioenlaces (ronda 27, captura antes de programar); (4) los 6 extremos sueltos; (5) ficha de empresa en Radiografías, ZERO y PDF; (6) «Lo siguiente» de siempre: captura de diseño de Países, línea del tiempo, comparativa de los 11 diarios, Measurement Lab, términos nuevos, páginas antiguas del programa, idiomas de Órbita y los ⬜ de la revisión de Órbita.

**Esperando una orden del dueño:** publicar la portada nueva («publícala») y activar para todos el móvil, la tablet y la app.

## Estado anterior (24 Oct 2026, 18:20, al 90 % de uso)

**Todo está guardado y publicado** en las dos ramas (`web-idiomas` y `main`). GitHub se conectó a esta cuenta a las 18:04 (en una cuenta nueva: claude.ai → Ajustes → Conectores → GitHub, y después `add_repo` con `access: push`; el clon de trabajo es `/home/claude/web`, `main` en el worktree `/home/claude/wt-main`).

**Hecho en esta cuenta (17:26–18:20)**
- **Ronda 26, cables por tierra: de 190 a 202 países** (1.346.946 km, 468 tramos de la agencia). Entran Gibraltar, Liechtenstein, Maldivas, Islas Salomón, San Marino, Samoa, Islas Feroe, Barbados, Bermudas, Curazao, Micronesia (Pohnpei) y Sáhara Occidental. Notas: `herramientas/agencia-rondas/ronda26/notas.md`. Publicado y comprobado en guardianagroup.com/orbita/ (captura de Samoa enviada al dueño).
  - Los 190 de antes incluían ya Mónaco, Vanuatu y Seychelles: el dueño dijo «Si» (15:57) a conservar los tramos cortos de ciudades-Estado e islas pequeñas (`PEQUENOS` en `fibra_tierra.py`, ≥ 0,5 km).
  - Astra solo responde a la fibra de islas con la pregunta que admite «aproximado» (`pregunta-fibra-aprox*.txt`) y de 2 en 2 países (con 4 se queda sin tokens razonando).
  - Coordenadas nuevas en `SITIOS` (`fibra_agencia.py`), de Nominatim, Wikidata y GeoNames. Nominatim da 429 si se pasa de ~1 petición cada 1,5–2 s; Wikidata (`wbsearchentities` + `wbgetentities`, `origin=*`) no tiene ese problema.
- **Sin cables por tierra todavía:** Tonga (ninguna ruta con dos voces), Malvinas, Groenlandia y Eritrea (ninguna voz da fibra entre pueblos: radioenlaces), Antártida y Tierras Australes (no hay pueblos). Yap (Nimar–Colonia) está confirmado pero mide 0,4 km y se queda fuera. Si se quiere más, la vía es Tonga con otra voz (Gemini).
- **Ronda 26b, cables submarinos de una sola voz (36):** Astra hecha en los lotes 1–4. Entra Bonaire–Curaçao Cable System (Gemini + Astra; `cables-agencia/astra-confirma-r26-2.json`, lo procesará `cables_agencia.py`). Descartados tras comprobarlo: ESAT-1 (retirado en 2024) y ADONES (no consta en servicio). **Faltan los lotes 5–8** (`ronda26/lotes-cables.json`, notas en `ronda26/notas-26b.md`), y después ejecutar `cables_agencia.py`.
- **Fichas de empresas:** la búsqueda (run del 24 Oct, 21:33Z) dejó `orbita/datos/empresas-candidatas.json` (64 emparejadas, 57 sin emparejar). Revisión hecha a medias: fotos (8 aceptadas) y direcciones de 47 empresas decididas, con GLEIF (registro LEI) como voz oficial nueva. Todo en `herramientas/agencia-rondas/empresas/notas-revision.md`. **Falta:** las coordenadas, que `copiar()` admita corregir `sede`, escribir `revision-1.json`, lanzar `empresas.yml` con `modo=copiar` y la captura de diseño para el dueño.

**La agencia ahora:** ChatGPT («Alta», chat «Rutas terrestres de fibra en servicio») y Astra 6 (Playground de platform.cheaperinference.com, `gpt-6-astra`, máx. 4.096 tokens; saldo ~7 US$ a las 17:30, ~0,11 US$ por petición). Gemini no estaba abierto. Pestañas del navegador integrado al cerrar: `seed` ChatGPT, `tab-2` Cheaper Inference (Playground), `tab-3` GitHub, `tab-5` herramienta (geonames.org, usada para Nominatim/Wikidata/GLEIF con `fetch`), `tab-6` guardianagroup.com/orbita/. Al leer el Playground, extrae solo el texto entre «ASSISTANT OUTPUT» y «Response headers»: el resto de la página muestra parte de la clave de API, que nunca se copia.

**Lo siguiente, por orden:** (1) lotes 5–8 de la ronda 26b con Astra y `cables_agencia.py`; (2) terminar las fichas de empresas (pasos de `notas-revision.md`); (3) **tramo nuevo aprobado por el dueño a las 18:43: radioenlaces** — troncales de microondas de los países sin fibra (Groenlandia, Eritrea, Malvinas, Pacífico) y las rutas de microondas de la bolsa como dato curioso; plan completo en `herramientas/agencia-rondas/ronda27/plan-radioenlaces.md` (captura de diseño antes de programar); (4) avisar al dueño de que el mapa está al 100 % de lo que se puede confirmar y pasar a «Lo siguiente» (captura de diseño de Países, línea del tiempo, etc.).

## Estado anterior (24 Oct 2026, 15:52, al 96 % de uso) — empieza por aquí

**Todo está subido y publicado.** No queda nada sin guardar en local. Lo de más abajo («Estado anterior», «Lo que quedó a medias») es de las 14:30 y vale como referencia de cómo funcionan las cosas; lo vigente es esta sección.

**Hecho y publicado en esta cuenta (14:20–15:45)**
- **Ronda 24c:** Gemini confirma 59 de los 61 cables de una sola voz → **435 cables submarinos de la agencia**.
- **Fotos en las fichas de Órbita:** 29 fotos revisadas una a una, con crédito en la ficha y en `terminos.html` §6. El dueño aprobó el diseño (14:46).
- **Rondas 25, 25b y 25c, cables por tierra:** **187 países**, 1.346.245 km, 445 tramos de la agencia.
  - Ronda 25: entran Guinea-Bisáu, Santo Tomé y Comoras.
  - Ronda 25b: entran Andorra, Macao, Guam, Islas Vírgenes de EE. UU., Islas Caimán, Guadalupe, Martinica, Reunión y Guayana Francesa.
  - Ronda 25c (confirmación cruzada, 15:45–15:50): ChatGPT confirma 8 rutas de Gemini (`chatgpt-troncales-territorios-2.json`) y Gemini una de ChatGPT (`gemini-troncales-territorios-2.json`). Entran Hong Kong, Singapur, Aruba, Mayotte, Polinesia Francesa y Bahamas.
- **Fichas de empresas (punto 6 de «Lo siguiente»):** la herramienta está hecha y su primera búsqueda estaba en marcha al cerrar (ver abajo).

**Lo que falta para el mapa «al 100 %»**
- **Sin cables por tierra todavía:**
  - Curazao, Samoa, Tonga e Islas Salomón: ninguna voz confirma la ruta de la otra. Astra 6 tampoco (15:56, devolvió `[]`; notas en `agencia-rondas/ronda25/notas-25c.md`).
  - Mónaco (3,1 km) y Vanuatu (3,4 km): sus tramos sí están confirmados por dos voces, pero `fibra_tierra.py` quita las líneas de menos de 5 km. Lo mismo pasa con Seychelles. **Pregunta hecha al dueño (15:45), sin respuesta todavía:** ¿se hace una excepción para las ciudades-Estado y las islas pequeñas? Si dice que sí, baja el límite para esos países en `fibra_tierra.py` (línea `if k < 5:`).
  - Eritrea: usa radioenlaces, no fibra.
  - Sáhara Occidental y otros territorios pequeños.
- **Siguiente paso:** Gemini se quedó en el modelo Flash-Lite (su límite del modelo potente se renueva a las 17:47 del 24 de octubre) y solo confirmó Mónaco. Después de las 17:47, pídele con el modelo potente que confirme las rutas de ChatGPT de Curazao (Blue Bay–Boka Sami) y Samoa (Fagali'i–Apia), y pide a ChatGPT y a Gemini rutas nuevas de Tonga e Islas Salomón. Las respuestas anteriores están en `herramientas/fibra-agencia/*-troncales-territorios-*.json` y `*-troncales-islas-1.json`. Después, el proceso de los cables por tierra de más abajo.
- **Pueblos sin situar:** solo Fox Town (BS), Havensight y Red Hook (VI). Los demás de esta ronda ya están en `SITIOS` (`fibra_agencia.py`), con coordenadas de OpenStreetMap: Nominatim y Overpass, pedidos con `fetch` desde la pestaña de Wikimedia Commons del navegador integrado.
- **Cables submarinos:** quedan 36 que nombra una sola voz (lista «solo lo nombra» de `cables_agencia.py`). Necesitan una segunda voz.

**En marcha al cerrar: fichas de empresas con su sede**
- **Qué hay:** `herramientas/empresas.py` y su workflow `.github/workflows/empresas.yml`, con dos modos: `buscar` y `copiar`.
- **Run en marcha:** el `40129919220` (modo `buscar`, lanzado a las 15:25 en `main`). Al terminar, guarda `orbita/datos/empresas-candidatas.json` en `main` y sube el artefacto `hojas-empresas`: hojas de contacto con las fotos candidatas numeradas, que nunca se publican.
- **Qué busca:** 121 empresas (las 100 de `espejo.json` y las 49 páginas de `empresas/`, juntas; la página «X» es «X Corp.»).
  - Empareja cada empresa con su elemento de Wikidata por el dominio de su web, o por el mismo nombre, siendo empresa, en el mismo país.
  - Recoge la sede (P159 y sus calificadores), la dirección según varias voces, el año de fundación, la matriz, el sector, los empleados, la bolsa y la Wikipedia.
    - Las voces de la dirección son Wikidata, la SEC (EDGAR, por P5531), SIRENE (Francia, por P1616), el registro de corredores de datos de California (CPPA, `registry.csv`, por dominio o nombre) y OpenStreetMap (Overpass, junto a la sede).
  - Fotos candidatas, con licencia, autor y GPS:
    - la P18 de la empresa y la del edificio de la sede;
    - los edificios que ocupa (P466);
    - los archivos de Commons cuyo nombre o categoría dice sede, oficina o edificio;
    - los archivos con GPS a menos de 150 m de la dirección.
  - Propone una dirección: la de un registro oficial, o una en la que coincidan dos voces (mismo número y misma calle).
- **Si el run falla:** mira el error con `gh run view 40129919220 --log-failed -R guardianagroup/guardianagroup.com`, arregla `empresas.py`, publícalo en `main` y relánzalo con `gh workflow run empresas.yml --ref main`.
  - A las 16:00 llevaba más de 30 minutos, probablemente por OpenStreetMap (Overpass), que puede ir lento. El workflow corta a los 90 minutos (hacia las 16:58) y, si corta, no guarda nada.
  - En `main` ya está una versión más robusta (commit `b9cf010`): pregunta a OpenStreetMap como mucho 20 minutos en total y cada fuente va aparte, de modo que una que falle no hace perder las demás. Si el run en marcha falla o corta, basta con relanzarlo.
- **Pasos siguientes**
  1. `git fetch origin` y trae `orbita/datos/empresas-candidatas.json` a `web-idiomas`. Descarga las hojas con `gh run download <id> -n hojas-empresas -D <carpeta temporal>` y míralas una a una con Read.
  2. **Revisión una a una.**
     - Foto: solo si es el edificio real de la sede, sin personas, sin logotipos y sin productos.
     - Dirección: solo si la da un registro oficial o la confirman dos voces.
     - Escribe `herramientas/agencia-rondas/empresas/revision-1.json` con este formato: `{"empresas": {"Criteo": {"foto": "<nombre exacto del archivo en Commons>" o null, "que_foto": "Sede de Criteo en París", "direccion": {"texto": "…", "voces": ["sirene", "wikidata"], "fuente": "…", "oficial": true} o null, "lonlat": [lon, lat]}}}`.
     - Las de `sin_emparejar`: busca a mano su elemento de Wikidata y añádelo a `FORZADAS` en `empresas.py`, con el motivo.
  3. Publica la revisión en `main` y lanza `gh workflow run empresas.yml --ref main -f modo=copiar`. Escribe `orbita/datos/empresas.json` y `orbita/static/fotos/empresa-*.jpg`; tráelos a `web-idiomas`.
  4. **Captura de diseño para que el dueño la apruebe antes de programar.** La ficha de empresa lleva la foto de la sede con su crédito, la dirección con su fuente, un mapa pequeño, los datos y las fuentes. Dónde va:
     - **Órbita, ESPEJO** (`orbita/static/espejo.js`, la lista `#espejo-lista`): al pulsar una empresa, su ficha.
     - **Páginas `empresas/*.html`**: un bloque «Sede» con la foto y la dirección. Esas páginas no tienen generador en este repositorio: se parchean con un script entre marcadores. Tienen versión en `en/` y `pt/`; nunca copies `en/` ni `pt/` de `web-idiomas` a `main`.
     - **ZERO** (`orbita/zero/index.html`, una demostración con empresas inventadas «· ejemplo»): `pintaFicha` y el informe PDF `informe()`, que tiene la columna «País · sede». El programa de escritorio ya no existe (§1), así que solo la web.
     - **Radiografías:** nombran empresas en el texto; se añadirían enlaces a sus fichas, si el dueño lo aprueba.
     - **PDF:** el de la ficha de Órbita (`capas.js`, botón `.pdf`, clase `imprime-ficha`), el informe de ZERO (`informe()`) y «El viaje de tus datos» (`viaje.js`). Llevan la foto con su crédito y la dirección.
  5. Crédito de cada foto en `terminos.html` §6 (`#fotos`), como las de Órbita.
- **Datos útiles en el repositorio del programa** `guardianagroup/guardiana` (público; aquí solo se puede leer):
  - `crates/lists/data/fichas.json`: las 49 fichas de empresa (qué hace, cómo gana dinero, sanciones, filtraciones…).
  - `crates/lists/data/corredores.txt`: el registro de California, con 603 inscripciones (8 de octubre de 2026).

**La agencia ahora:** Gemini (Argon), ChatGPT («Alta»), Astra 6 (Playground de platform.cheaperinference.com, modelo `gpt-6-astra`, máximo 4.096 tokens) y Claude. Kimi y Grok están fuera.

**Pestañas del navegador integrado al cerrar**
- `seed`: Gemini, chat de los territorios.
- `tab-1`: ChatGPT, chat «Redes de fibra terrestre».
- `tab-2`: Cheaper Inference.
- `tab-9`: Wikimedia Commons, para pedir con `fetch` a Nominatim y a Wikidata.
- `tab-10`: guardianagroup.com.

**Sin empezar, de «Lo siguiente»:** los puntos 2 (captura de diseño de Países, línea del tiempo, «Verlo en Órbita» y ficha de país), 3 (comparativa de los 11 diarios), 4 (ficha de país, línea del tiempo y Measurement Lab) y 7 (propuesta «Cómo funciona internet»); los ⬜ de `qa/revision-orbita-2026-10-24.md`; los términos nuevos; las páginas antiguas que todavía hablan del programa; y los idiomas de Órbita.

## Estado anterior (24 Oct 2026, 14:30, al 98 % de uso de la cuenta anterior)

**Ramas:** `main` (la web en vivo) y `web-idiomas` están al día. `web-idiomas` tiene además este documento y las preguntas de Kimi.

**En vivo en guardianagroup.com/orbita/**
- **Cables por tierra:** 169 países y 1.345.669 km, en `orbita/datos/fibra-tierra.json`. Al empezar la noche eran 93 países.
  - 421 tramos salen de la agencia, confirmados al menos por dos voces de siete: Astra 6, ChatGPT («Alta» e «Investigación avanzada»), Gemini, Grok, Kimi y Claude comprobando fuentes oficiales. El resto viene de OpenStreetMap y AfTerFibre.
  - En los países sin fuentes abiertas valen los tramos aproximados. El dueño, a las 9:00: «Lo más aproximado posible ok».
  - Siria, Yemen y Palestina entran con redes «en servicio parcial».
  - Corea del Norte se queda en el mapa. El dueño, a las 8:02: «Añádela si».
- **Países sin cables por tierra todavía**
  - Eritrea: usa radioenlaces, no fibra.
  - Guinea-Bisáu: su red troncal está en licitación.
  - Islas y territorios pequeños: HK, SG, MO, MC, AD, GU, VI, KY, AW, CW, GP, MQ, RE, YT, GF, EH, KM, PF, VU, SB, WS, TO, BS y otros.
- **Cables submarinos:** 550 cables enteros (los grupos de `lugares-capas.json`; la ficha del botón puede contar alguno más), cada llegada con el nombre de su pueblo (GeoNames cities500). Al empezar la noche eran 445.
  - `orbita/datos/cables-agencia.json` guarda los 381 cables de la agencia.
  - Los cables que solo nombra una voz no se muestran, a propósito. La ronda 24 los confirma con una segunda voz (ver «Lo que quedó a medias»).
- **Antártida:** dos voces coinciden: la investigación profunda de ChatGPT y Astra 6 (`ronda23/astra-antartida.txt`).
  - No llega ningún cable submarino en servicio. Nueva Zelanda–McMurdo y Chile–isla Rey Jorge son proyectos o estudios.
  - Las bases salen a internet por satélite: Starlink en McMurdo y Rothera; ANARESAT y Starlink en Casey, Davis y Mawson; TDRSS, DSCS e Iridium en el Polo Sur.
  - Sobre la fibra entre bases, Astra no lo confirma ni lo descarta: hay redes locales, como la de IceCube en el Polo Sur. En la ficha no hay que decir que no existe.
  - Las fichas de país solo salen al pulsar el nombre del país, y los nombres solo se ven con el planeta gris («limpio»). La Antártida está entre los centros de país de `orbita.js` (constante `P`), así que su ficha se abre igual que las demás. En local no se pudo probar, porque la clase `limpio` la pone la propia página.
  - Ya está en su ficha (`orbita/datos/paises.json`, «AQ», con «Datos verificados»), solo con lo que dicen las dos voces: ningún cable submarino y salida por satélite, con Starlink en McMurdo y ANARESAT en las bases australianas.

**Cómo deciden los generadores (cambios de esta noche)**
- **`herramientas/fibra_agencia.py`** lee `herramientas/fibra-agencia/<voz>-troncales-*.json`; la voz es el prefijo del nombre. Un tramo entra por uno de tres niveles:
  - `ok`: dos voces con el mismo operador;
  - `ok2`: dos voces con operadores distintos; se dibuja sin nombre ni operador;
  - `ok3`: solo en los países de `APROX` (BH, BN, BZ, CU, DO, HT, JM, KP, KW, LB, LS, NP, PS, QA, RW, SY, TL, XK, YE, SR, TT, PR, GW, SZ, ER, CV, MU, MT, BS, GT, PA, SS), si el camino mide como mucho 2,5 veces la recta más 150 km. Se dibuja en recta y sin nombre.
- **Más reglas de `fibra_agencia.py`**
  - Las ciudades del otro lado de la frontera se buscan a menos de 800 km de la ciudad anterior de la ruta, o de la siguiente si la ruta empieza al otro lado (función `fuera`).
  - Los nombres se buscan en `ALIAS`, en `SITIOS` (coordenadas puestas a mano, como Nimule, en Sudán del Sur) y en `herramientas/fuentes/pueblos-fibra.tsv`.
  - Solo entran los estados que empiezan por «en servicio», «operativo» o «in service» y no dicen «no verificad».
- **`herramientas/cables_agencia.py`**
  - Voces: chatgpt, gemini, grok, claude, astra y kimi.
  - Junta cada llegada con el grupo más cercano a menos de 120 km.
  - Nunca une dos llegadas de una misma voz que estén a más de 5 km: así los cables cortos dentro de un país conservan sus dos extremos.
  - Si dos voces o más coinciden, ignora el desacuerdo sobre el país de frontera.
- **`herramientas/lugares_capas.py`** (función `lugar_cable`)
  - Elige el pueblo más cercano a menos de 20 km, salvo que una ciudad de más de 50.000 habitantes esté a menos de 1,5 veces esa distancia (como mínimo, 6 km): entonces gana la ciudad.
  - Si no hay pueblo, usa la ciudad de más de 15.000 habitantes más cercana a menos de 80 km.
  - Quita los números de distrito: «Marseille 02» queda en Marseille.
- **El workflow `.github/workflows/pueblos-cables.yml`** se lanza a mano y los lunes a las 05:41 UTC. Descarga GeoNames cities500 y guarda en `main` lo que escriben tres scripts:
  - `pueblos_cables.py` → `orbita/static/tierra/pueblos-cables.tsv`;
  - `lugares_capas.py` → `orbita/datos/lugares-capas.json`;
  - `pueblos_fibra.py` → `herramientas/fuentes/pueblos-fibra.tsv`.

**Proceso de los cables por tierra (después de cada respuesta)**
1. Guarda la respuesta en `herramientas/fibra-agencia/<voz>-troncales-<n>.json` y el texto bruto en la carpeta de su ronda.
2. Publica esos archivos en `main`, porque el workflow los lee de allí.
3. Lanza `gh workflow run pueblos-cables.yml --ref main` y espera a que acabe.
4. En `web-idiomas`: `git checkout origin/main -- herramientas/fuentes/pueblos-fibra.tsv orbita/datos/lugares-capas.json`.
5. Ejecuta `python3 herramientas/fibra_agencia.py`, que escribe `herramientas/fuentes/fibra-agencia.json`. Si falta una ciudad, añádela a `ALIAS` o a `SITIOS`.
6. Ejecuta `python3 herramientas/fibra_tierra.py --sin-ofds --fuentes <carpeta temporal>`, que clona AfTerFibre y escribe `orbita/datos/fibra-tierra.json`.
7. Revisa los países y los km, y publica `fibra-agencia.json` y `fibra-tierra.json` en las dos ramas.

**Proceso de los cables submarinos**
1. Guarda la respuesta en `herramientas/cables-agencia/<voz>-*.json`.
2. Ejecuta `python3 herramientas/cables_agencia.py`, que tarda unos 3 minutos y actualiza `orbita/datos/cables.json` y `cables-agencia.json`.
3. Publica `cables.json`, `cables-agencia.json` y la carpeta `herramientas/cables-agencia` en las dos ramas.
4. Lanza `gh workflow run pueblos-cables.yml --ref main`. Busca los pueblos de las llegadas nuevas y rehace `lugares-capas.json` en `main`.
5. Trae a `web-idiomas` `orbita/datos/lugares-capas.json`, `orbita/static/tierra/pueblos-cables.tsv` y `herramientas/fuentes/pueblos-fibra.tsv`.

**Lo que quedó a medias**
- **Revisión de Astra 6 por continentes (ronda 23): terminada** el 24 de octubre a las 11:41. Todas las tandas de `ronda23/tandas.md` están procesadas y publicadas (registro al final del §11). Resultado: 169 países (entró Nueva Caledonia), 1.345.645 km y 420 tramos de la agencia. Astra no dio rutas para MU, ST, SC, SB ni VU.
- **Kimi** (kimi.ai): la cuenta gratuita se satura en la hora punta de China. A las 12:30–12:45 seguía saturado: respondía «Muchas personas están chateando con Kimi en este momento» y ofrecía una suscripción de pago, que es decisión del dueño. Las 13 preguntas siguen sin hacer. Truco: pega el texto con un evento `paste` en el editor y vacía antes el borrador, que Kimi guarda. Sus preguntas están en `herramientas/agencia-rondas/kimi-pendientes/`. Quedan 13 por hacer:
  - `q-A3`: trazados aproximados de los países sin datos. La respuesta va a `herramientas/fibra-agencia/kimi-troncales-3.json`.
  - `q-B1` a `q-B5`: troncales en servicio. Las respuestas van a `kimi-troncales-4.json` hasta `-8.json`.
  - `q-C-<región>` (siete regiones): cables submarinos que faltan. Las respuestas van a `herramientas/cables-agencia/kimi-faltan-<región>.json`.
  - `q-A1` y `q-A2` ya están respondidas: `kimi-troncales-1.json` y `-2.json`.
  - `save.py` comprueba el hash del texto copiado y lo guarda como JSON.
- **Gemini:** tanda 9 hecha a las 12:44 (`gemini-troncales-10.json`, procesada y publicada). Respondió Nicaragua y Chad, pero no Corea del Norte ni Cabo Verde. La página tenía puesto el modelo Flash-Lite: para lo difícil, mejor uno más potente.
- **Grok:** le faltan las tandas 8 y 9. Su límite semanal se renueva el 27 de octubre.
- **Cables submarinos que solo nombra una voz:** 131. Son 64 de ChatGPT, 55 de Gemini, 9 de Claude, 2 de Astra y 1 de Grok; `cables_agencia.py` los lista con «solo lo nombra».
  - **Ronda 24, parada a las 12:30:** hechos los lotes 1–7. Astra solo confirmó 3 cables de 56, ya publicados (352 cables de la agencia). En los lotes 3–7 devolvió `[]`, quizá por prudencia, porque se le piden fuentes oficiales. Quedan los lotes 8–17 de `herramientas/agencia-rondas/ronda24/lotes.json`, mejor con otra voz (Gemini, Kimi o ChatGPT).
  - Sus respuestas van a `herramientas/cables-agencia/astra-confirma-<n>.json`. Mira cuáles existen y sigue por el primer lote que falte.
  - Después, el proceso de los cables submarinos.
  - Los 2 que propuso Astra necesitan otra voz.
  - **Ronda 24b, terminada a las 13:55:** ChatGPT, con razonamiento «High», confirmó 33 de los 67 cables y ya están publicados. Ahora hay 381 cables de la agencia y 550 cables enteros con sus pueblos. ChatGPT devolvió «JaKa2LaDeMa» sin su paréntesis: hay que comprobar que case con la propuesta original. Algunas respuestas traen km = 0 o fuentes poco relacionadas, como EESF-3; están en `ronda24/` para revisarlas.
  - **Ronda 24c, parada a las 14:30 sin ningún lote hecho** (el dueño cerró la cuenta al 98 %): Gemini, con su modelo más potente, debe confirmar los 61 cables de una sola voz que propuso ChatGPT, en 8 lotes (`ronda24/lotes-gemini.json`). Las respuestas van a `herramientas/cables-agencia/gemini-confirma-<n>.json` y se procesan con el proceso de los cables submarinos. Para escribir en Gemini: fija un Range dentro del editor, usa `execCommand` línea a línea, envía con `button.send-button` y lee el último `model-response`.

**Lo siguiente que pidió el dueño, por tramos**

> «Primero terminar todo el mapa de países completo con cables… Lo quiero al 100 % y después el resto de cosas. Así vamos cerrando por tramos todo.»

1. **Cerrar el mapa al 100 %** con lo de arriba.
2. **Captura de diseño para que el dueño la apruebe antes de programar** (respondió «Ok si»). El plan que aceptó:
   - un botón nuevo, **«Países»**, con tres vistas: Velocidad (Measurement Lab), Conectividad (Banco Mundial, CC BY 4.0) y Cortes;
   - la **línea del tiempo** dentro de la ficha de cada cable, para compartir en **foto y vídeo** (7:53: «Foto y video»);
   - un botón **«Verlo en Órbita»** en Radiografías;
   - la **ficha de país** ampliada.
3. **Comparativa de los 11 diarios** (la portada dice «Abrimos once diarios digitales»): con su metodología, el derecho de respuesta de cada diario antes de publicar y un paquete de prensa.
4. **Programar la ficha de país y la línea del tiempo**, y después el **mapa de calidad** (Measurement Lab).
5. **Fotos en las fichas** (dueño, 24 de octubre, 12:53: «Cuando toquemos centro de datos, quiero que en la información te aparezca una foto, si es que la hay. Y en los cables, en los satélites también, todo lo que podamos tener foto»). La foto sale en la ficha de cada centro de datos, cable (estación de llegada o barco cablero), satélite y, si se puede, base o estación terrestre. Solo cuando haya una foto real del elemento; si no la hay, la ficha queda como está.
   - **Fuentes posibles:**
     - Wikimedia Commons y Wikidata: la imagen P18 de cada elemento, buscando los satélites por su número NORAD (P377) y los cables y los centros por nombre y coordenadas;
     - NASA y ESA para satélites, de dominio público o con licencia abierta;
     - fotos que publiquen los propios operadores con licencia que permita reutilizarlas.
     Nada de submarinecablemap.com, TeleGeography ni PeeringDB.
   - **Comprobación:** la foto tiene que ser de ese elemento concreto. Hay que cruzarla por su identificador o su nombre y ubicación, con la regla de las dos voces cuando haya dudas.
   - **Privacidad, por coherencia con GUARDIANA:** copiar las miniaturas a `guardianagroup.com`, con su licencia, en vez de enlazarlas a Wikimedia u otros sitios. Así ninguna visita avisa a terceros.
   - **Licencias:** cada foto lleva autor y licencia en `terminos.html` (sección 6), y en la ficha un crédito pequeño.
   - **Cómo hacerlo:** un workflow de GitHub busca las fotos, porque desde la consola no hay acceso a esas webs. Guarda un `orbita/datos/fotos.json` (id del elemento, archivo, autor, licencia y enlace a la fuente) y las miniaturas comprimidas en `orbita/static/fotos/`. Las fichas de `capas.js` las muestran con carga diferida.
   - **Primer paso, hecho el 24 de octubre a las 14:20:** el workflow `.github/workflows/fotos.yml` ejecuta `herramientas/fotos.py`, a mano. Busca fotos de Wikimedia Commons con licencia libre, con autor y licencia:
     - satélites, por su número NORAD;
     - centros de datos, por los elementos de Wikidata ya enlazados en `puntos.json`;
     - bases, por nombre y a menos de 60 km;
     - cables submarinos, por nombre.
     Las guarda en `orbita/datos/fotos-candidatas.json`, que la web aún no usa.
   - **Resultado de la primera búsqueda (14:30):** 59 candidatas: 18 bases, 19 centros de datos, 9 satélites y 13 cables. Hay que revisarlas una a una:
     - **Bases:** buenas, por ejemplo McMurdo, Polo Sur y Rothera.
     - **Centros de datos:** algunas fotos son la sede de la empresa, no el centro de datos.
     - **Satélites:** algunas son ilustraciones; la de AZERSPACE 2 es una foto de una persona en una feria y no sirve. Hay que descartar toda foto con personas.
     - **Cables:** son mapas de ruta, no fotos.
   - **Siguientes pasos:**
     1. revisar las candidatas;
     2. copiar las miniaturas elegidas a `orbita/static/fotos/`;
     3. hacer la captura del diseño de la ficha con foto y que el dueño la apruebe;
     4. mostrarlas en las fichas de `capas.js` y en los PDF, con crédito en la ficha y en `terminos.html`.
   - **También en los PDF** (dueño, 13:52: «para que se pueda ver en el documento y se pueda sacar por PDF, todo, el máximo que podáis»). El informe descargable debe llevar las fotos con su crédito.
   - **Antes de programar:** captura del diseño de la ficha con foto, para que el dueño la apruebe.
6. **Fichas de empresas de datos con su sede** (dueño, 24 de octubre, 14:42): «cuando detectamos en Radiografías, en ZERO o en Órbita… una empresa de datos o de subastas, de telemetrías… incorporemos la foto de la empresa, si es que está por el edificio, dónde está la dirección de la sede principal o todo lo que se pueda saber. Para que la persona que decida imprimir el PDF tenga el máximo de información».
   - Para cada empresa que vende, compra o subasta datos (y telemetría, publicidad, etc.): foto real de su **sede** (Wikimedia Commons con licencia libre, copiada a `guardianagroup.com`, con autor y licencia), **dirección de la sede principal** y todo lo verificable (año de fundación, matriz, país, a qué se dedica, sanciones públicas).
   - Fuentes: Wikidata (P159 sede, P6375 dirección, P18 o la foto del edificio de la sede, P571, P749), el registro de corredores de datos de California (CPPA, ya en `corredores.txt`), OpenStreetMap. Nada de PeeringDB ni TeleGeography. Sin logotipos.
   - Mismo método que las fotos de Órbita: un workflow las busca, se revisan una a una (solo fotos reales del edificio, sin personas) y se guardan en un JSON con crédito. Que salga en las fichas de Radiografías, ZERO y Órbita y en sus PDF.
   - **Estado a las 15:45:** `herramientas/empresas.py` y `empresas.yml` hechos; la primera búsqueda estaba en marcha. Los pasos siguientes están en «Estado al cerrar esta cuenta», al principio.
7. **Propuesta, pendiente de que el dueño la apruebe:** una explicación «Cómo funciona internet» en Órbita, sobre las capas que ya existen: tu equipo → la antena o el wifi → la red de tu operador → las troncales por tierra → los puntos de intercambio y los centros de datos → los cables submarinos → el servidor de la web. El dueño preguntó (13:56) de dónde «sale» internet. Se podría añadir una capa con las copias de los servidores raíz del DNS, si su licencia lo permite.

**Lo que el dueño encargó a Astra 6** (todo en `herramientas/agencia-rondas/`)
- **Ronda 20**
  - El navegador con la calidad de Brave y Tor: `astra-navegador.md` y `astra-anonimato.md`.
  - La tecnología cuántica: `astra-cuantica.md`.
  - El hardware: `astra-hardware.md`.
  - El cifrado máximo para chat y voz: `astra-comunicaciones.md`.
  - GUARDIANA sin descargar nada: `astra-sin-descarga.md`.
  - ZERO: `astra-zero.md`.
  - El buscador: `astra-buscador.md`.
  - Ideas nuevas: `astra-ideas.md`.
  - Hoja de ruta: `astra-hoja-de-ruta.md`.
- **Ronda 21**
  - Publicidad viral para llegar a un millón de usuarios sin dinero: `astra-viral-estrategia.md` y `astra-viral-calendario.md`.
  - Qué añadir a Órbita: `astra-orbita.md`.
- **Ronda 22:** la investigación profunda de ChatGPT por continentes (`chatgpt-ip-*.md` y `.json`). Sus tramos, cruzados con otra voz, sumaron 31 (commit 232fcda).

## Primeros pasos de la cuenta nueva

1. **GitHub**
   - Conecta GitHub con permiso de escritura en `guardianagroup/guardianagroup.com`.
   - Clona el repositorio y trabaja en la rama `web-idiomas`.
   - Usa un worktree aparte para `main`: `git worktree add ../wt-main --detach origin/main` (ver §3).
2. **El ordenador del dueño**
   - Enlaza el chat con su ordenador desde la app de escritorio de Claude.
   - Las voces de la agencia (ChatGPT, Gemini y Astra 6, en platform.cheaperinference.com; Kimi y Grok ya no) se usan desde el **navegador integrado** de esa app, con las sesiones del dueño.
   - Si alguna sesión no está abierta, pídele al dueño que la abra. Tú nunca escribes contraseñas ni claves.
3. **Lectura:** este documento entero; después, `herramientas/TRASPASO.md` y `herramientas/agencia-rondas/qa/revision-orbita-2026-10-24.md`.
4. **Primera tarea:** a las 15:45 todo lo guardado estaba procesado y publicado. Sigue por lo que dice «Estado al cerrar esta cuenta», al principio: el resultado del workflow de empresas y la ronda de confirmación cruzada de los territorios. La ronda 24c y las fotos de Órbita ya están hechas.
5. **La ronda 23 de Astra está terminada.** Si vuelves a preguntarle algo, hazlo en tandas pequeñas.
   - Astra corta a 4.096 tokens, contando el razonamiento.
   - El Playground no guarda la conversación: si una respuesta se corta, pregunta solo por los países que faltaron.
6. **Las demás voces**, y después de cada respuesta, el proceso de arriba:
   - Kimi: las preguntas de `kimi-pendientes`, fuera de la hora punta de China;
   - Grok: las tandas 8 y 9, desde el 27 de octubre.
7. **Cuando el mapa esté al 100 %**, avisa al dueño y sigue con «Lo siguiente», empezando por la captura de diseño.
8. **Revisión de Órbita:** quedan los ⬜ de `qa/revision-orbita-2026-10-24.md`:
   - ZERO en el móvil;
   - los solapes de T1 en horizontal y de M1;
   - la entrada a GUARDIANA OS en el móvil;
   - las muestras de «Afinar» en M1;
   - el atrás del navegador en la lista de cercanos, el espejo y la pregunta de ubicación;
   - el resto del texto en inglés, y el portugués.
9. **Términos nuevos:** ver §7, punto 1.
10. **Móvil, tablet y app instalable:** siguen en prueba hasta que el dueño diga lo contrario.
11. **Hibernación:** no pongas su ordenador en hibernación salvo que lo vuelva a pedir.
12. **Cada 10 minutos**, guarda, sube a GitHub y publica en la web (orden del dueño, 23:42).

## 0. Antes de empezar (para el Claude que lee esto)

**El dueño**
- Es Fran, de GUARDIANA GROUP S.A.S. (Cartagena, Colombia).
- Escríbele **siempre en español**, en pocas líneas y sin pegar código en el chat.
- Enséñale una captura de cada cambio y avísale cuando esté publicado.

**Permisos**
- El dueño dijo el 23 de octubre a las 23:29: «Ya te digo que sí de antemano a todos los permisos, entonces no me preguntes».
- El mandato general es «todo lo que te parezca bien y a la agencia… adelante».
- Aun así, propón antes de hacer un cambio grande.

**Uso de la cuenta**
- El dueño mira el porcentaje de uso semanal; Claude no puede verlo.
- Cuando él avise de que se acaba (alrededor del 92 %), guarda todo en el repositorio y actualiza este documento.

**Repositorio**
- Es `guardianagroup/guardianagroup.com` en GitHub, y es **público**.
- Para publicar hace falta permiso de escritura: conecta GitHub en esta cuenta con acceso a ese repositorio. Sin él solo se puede leer.
- Ramas: **`web-idiomas`** es la de trabajo; **`main`** es la web en vivo, servida por GitHub Pages.

**Qué leer después**
- `herramientas/TRASPASO.md`, en la rama `web-idiomas`: la historia completa del 22 y el 23 de octubre (§1 a §20), con reglas, datos y decisiones.
- `herramientas/agencia-rondas/`: las consultas a la agencia (rondas 9 a 23), la revisión de Órbita (`qa/`), las preguntas pendientes de Kimi (`kimi-pendientes/`), los borradores de términos y las notas de la ley colombiana (`terminos-ley/ley.md`).

## 1. Qué es GUARDIANA hoy

**El programa de escritorio ya no existe como producto**
- El programa para Windows y Mac ya no se vende ni se descarga (decisión del dueño, 23 de octubre, 22:54).
- Todo funcionará desde la web, con una suscripción web cobrada por **Dodo Payments**, cuando la empresa tenga el **NIT**.
- **Hoy no se cobra nada y no queda ningún enlace de pago en la web**:
  - `comprar.html`, `instalar.html`, `activar.html` y sus versiones en `en/` (buy, install, activate) y `pt/` (comprar, instalar, ativar) son páginas «muy pronto desde la web».
  - Esas páginas ofrecen tres tarjetas: Radiografías (gratis), Órbita (gratis) y ZERO (en demostración).
  - Los botones de planes y descarga de la portada antigua (`es/index.html`, `pt/index.html`) dicen «Próximamente» / «Em breve», con la nota «En construcción… no se cobra nada».
  - El dueño insiste: «no quiero que se le pueda cobrar a nadie porque no está terminado».

**Portada**
- La portada en vivo es `index.html` de `main`, que redirige a `/orbita/`.
- La portada nueva está lista en `/nueva/`, en 42 idiomas. Pasa a ser la portada **solo cuando el dueño diga «publícala»**.

**Órbita** (`/orbita/`, no indexada)
- Es un planeta 3D con cuatro capas: Cables submarinos, Cables por tierra, Centros de datos y Satélites.
- También tiene:
  - ciudades que aparecen al acercar;
  - **Mi conexión**, que mide 33 centros de datos;
  - **El viaje de tus datos**, un informe solo para PC;
  - Radiografías;
  - ESPEJO «Con / Sin GUARDIANA»;
  - **ZERO**, el navegador, en demostración.

**Radiografías** (`/radiografias/`): informes sobre qué ve de ti cada web y a quién habla.

## 2. Reglas fijas del dueño (no negociables)

**Privacidad y cuentas**
- Nunca muestres el nombre real de la fundadora; en los mockups se usa «Marta Ortega».
- Las cuentas de ChatGPT, Grok, Gemini, Kimi y Cheaper Inference muestran el nombre o el correo real del dueño: **nunca los repitas**. Nunca envíes su correo a servicios ajenos.
- Nunca copies ni repitas claves de API; la de Cheaper Inference empieza por «ci_live_».
- Nunca escribas claves ni contraseñas, y no inicies sesión ni crees cuentas: eso lo hace el dueño.
- Cheaper Inference, los modelos DeepSeek y Kimi (Moonshot) pueden guardar datos en China: comparte con ellos solo información del producto, nunca datos personales.

**Contenido**
- Sin código en el chat.
- No inventes cifras. Los datos de demostración van etiquetados como tal.
- No prometas protección absoluta.
- Sin marcas reales de terceros en los mockups; usa dominios `.example`.
- Colores: fondo #06080C, acento #9CC3E4, texto #F4F6F8. El coral #E07A6C es solo para cortes y el ámbar #F0C77F para dinero.

**Datos y fuentes**
- Nada «no verificado» a la vista. Las fichas dicen «Datos verificados»; las fuentes y licencias van **solo** en `terminos.html` (sección 6). Si un dato no se sabe, se omite la fila.
- **Prohibido usar submarinecablemap.com o TeleGeography** como fuente. **PeeringDB no se puede usar.**
- En Mi conexión y el informe, los arcos no son nunca la ruta real de los paquetes: se presentan como «conexiones medidas, trayectorias ilustrativas». **Nunca conviertas ms en km.**

**Agencia y publicación**
- **Regla de la agencia:** solo se publica lo que confirman al menos dos voces. Claude, comprobando contra textos oficiales, cuenta como una.
- Publica cada cambio en las **dos ramas**, `web-idiomas` y `main`.
- **Nunca copies `index.html`, `instalar.html`, `en/`, `pt/` ni `descargas/` de `web-idiomas` a `main`**: allí tienen descargas activas.

**Producto**
- Todo lo nuevo, en 42 idiomas.
- Todo lo del mapa, a máxima resolución, también al hacer zoom. El nivel que pide es «calidad tipo Apple».
- «El viaje de tus datos» es solo para PC.
- **El móvil nuevo (M1), la tablet nueva (T1) y la app instalable siguen en prueba hasta que el dueño diga lo contrario** (23:27).
- **El futuro motor de búsqueda «para el navegador y para el hardware»** se hará con **Astra 6** (modelo `gpt-6-astra` en platform.cheaperinference.com) además de la agencia, porque «es de lo más potente».

## 3. Cómo publicar (el procedimiento que funciona)

**Pasos**
1. Haz commit en `web-idiomas` y `git push origin web-idiomas`.
2. Usa un worktree aparte para `main`, por ejemplo `git worktree add ../wt-main --detach origin/main`. Antes de cada publicación: `git -C ../wt-main fetch origin && git -C ../wt-main checkout --detach origin/main`.
3. Comprueba que `main` tiene la base: `git diff --quiet origin/main <commit>^ -- <ficheros>`.
4. Copia los ficheros: `git checkout <commit> -- <ficheros>`. Después haz commit y `git push origin HEAD:main`.
5. Comprueba el despliegue con `gh run list -R guardianagroup/guardianagroup.com -L 1` (unos 30 s) y mira la web en el navegador. Desde la consola no se llega a guardianagroup.com.

**Cuidados**
- Cuando cambies un `.js` o un `.css` de Órbita, sube su `?v=` en `orbita/index.html`. Hoy: `capas.js` y `orbita.css` en `20261025r`; `idioma.js`, `orbita.js` y `viaje.js` en `20261025q`; `ciudades.js` en `20261025n`; `conexion.js` en `20261025l`; el resto en `20261025k`.
- Haz siempre commit antes de cambiar de rama: se perdió trabajo dos veces con un `reset --hard`.
- El workflow `datos-orbita.yml` regenera `orbita/datos` en `main`. Después de cada ejecución, trae esos datos a `web-idiomas` con `git checkout origin/main -- orbita/datos`.
- El workflow `pueblos-cables.yml` escribe en `main` los pueblos (`orbita/static/tierra/pueblos-cables.tsv` y `herramientas/fuentes/pueblos-fibra.tsv`) y `orbita/datos/lugares-capas.json`. Tráelos igual.
- No dejes archivos sin guardar en git al acabar: los agentes escriben en `herramientas/agencia-rondas`, `fibra-agencia` y `cables-agencia`. Haz commit y push a menudo.

**Pruebas en local**
- `python3 -m http.server`.
- Playwright con Chromium en modo swiftshader, un solo navegador a la vez.
- El aviso de ubicación se cierra esperando a que se vea «Ahora no» y pulsándolo.

## 4. Lo publicado hasta el 23 de octubre (`main` 05e3005, 23:45; lo posterior está al principio y en el §11)

**Portada nueva `/nueva/`** (commit 13b3e09)
- Más satélites trabajando a distintas alturas, igual en móvil, tablet y ordenador.
- El planeta de la sección Órbita es igual que el de arriba.
- Titular: «¿Sabes a dónde **viajan** tus datos y quién los compra?».
- Frase dorada: «Tú pones los datos. Otros comercian con ellos.».
- Textos: «Abrimos once diarios digitales» y «La infraestructura de internet, en un solo mapa.».
- En 42 idiomas, con una imagen nueva para compartir.

**Órbita** (commits 0b9296b y 63a7f03)
- **Cables**
  - Los submarinos van por colores de capacidad, los mismos que los cables por tierra: dorado y grueso con halo, más de 100 Tbit/s; lavanda, de 20 a 100; verde agua, menos de 20; gris, no publicada. El grosor se mantiene.
  - Los tramos que acaban en el mar se difuminan; es un hueco de OpenStreetMap. Su ficha dice: «En los datos abiertos (OpenStreetMap) este cable está trazado solo hasta donde se apaga la línea».
  - El botón se llama «Cables por tierra».
- **Ciudades al acercar** (ronda 16; ChatGPT, Gemini, Grok y Astra a favor)
  - Datos: Natural Earth (dominio público), 7.295 lugares, en `orbita/datos/ciudades.json` y `orbita/static/ciudades.js`.
  - Niveles: capitales y ciudades de más de 5 millones al ver un continente, de más de 1 millón al ver una región, y más pequeñas al acercarse.
  - Como máximo 60 nombres en ordenador y 25 en móvil.
- **Informe «El viaje de tus datos» rehecho**
  - Planeta realista.
  - Brújula profesional.
  - Gráfica «A qué velocidad viajaron tus datos», en porcentaje de la luz. El dueño: «Enhorabuena… se ve mucho mejor».
  - «El más lejano» se elige ya por km.
- **Mi conexión**
  - Las líneas crecen despacio y llevan datos de ida y vuelta.
  - Los 33 centros medidos, con su nombre en el idioma de la página.
- **Arreglos**
  - La X ya no saca de Órbita a la portada.
  - «Medir desde fuera» funciona.
  - La ficha de cable o país ya no se corta en el móvil.
  - El planeta gira hacia la derecha.
  - La rueda del ratón baja el informe.
  - Las X van en una caja.

**Compra y descarga** (commits 6993ec8 y 05e3005): todo en «muy pronto» / «Próximamente», como se describe en el §1.

## 5. En prueba (no activarlo para todos hasta que lo diga el dueño)

- Se ve con `guardianagroup.com/orbita/?movil=nuevo`, y se quita con `?movil=antes`.
- **Qué incluye**
  - El móvil M1 y la tablet T1.
  - La app instalable: `manifest.webmanifest`, `sw.js` (red primero, con `offline.html` sin conexión), `orbita/static/app.js` y los iconos.
- **La app**
  - En Android la instala Chrome.
  - En iPhone y iPad hay una guía de dos pasos.
  - En Windows, con Chrome o Edge, sale el botón «Instalar app».
  - Dentro de la app instalada siempre se ve lo nuevo.
- El interruptor está en el script del principio de `orbita/index.html`, con sessionStorage `guardiana-m2`.
- Cuando el dueño diga «actívalo para todos»:
  - pon lo nuevo por defecto y deja `?movil=antes` para volver a lo anterior;
  - añade el manifest y el registro del service worker también a la portada;
  - sube versiones y publica.

## 6. LO PRIMERO AHORA (orden del dueño, 23 de octubre, 23:29–23:32)

> «Lo primero que tienes que hacer es acabar la página web modo ordenador… Hasta que no esté al 100 % con el tema de cables submarinos, cables troncales, cables terrestres, absolutamente todo lo que falta… Ponte a trabajar.»

**Estado el 24 de octubre a las 10:05:** el punto 1 está hecho. Del punto 2 están hechos la errata, el gris y la revisión sistemática (quedan sus ⬜). Los datos siguen: ver el principio de este documento.

**1. Fichas al pasar el ratón por los cuatro botones de capas** (23:32)
- Hoy sale el aviso nativo del navegador, muy largo y rectangular.
- El dueño quiere «un cuadrado bien diseñado, y los cuatro… más o menos el mismo tamaño».
- El texto está en `orbita/static/capas.js`: la función que monta los textos de las capas pone `b.title = txt` en `#capas [data-capa]`, y en `orbita/index.html` hay un `title` fijo.
- Sustitúyelo por una ficha propia de unos 300 × 300 px:
  - nombre de la capa;
  - la cifra grande (cables con nombre, km de fibra y países, centros de datos, satélites);
  - una frase;
  - la leyenda de colores o de clases con sus cuentas (las del panel de clases: `#sub-vista`, `#fibra-vista`, `#puntos-vista`, `#sat-vista`);
  - «Datos verificados» y un dato curioso.
- Solo con ratón; en pantallas táctiles, nada.
- **Estado:** ver el final de este documento.

**2. Cables al 100 %**
- **Errata «Souh America-1» → «South America-1»**
  - Está en `orbita/datos/cables.json` y en `orbita/datos/lugares-capas.json`.
  - Corrígela también en el generador (`herramientas/lugares_capas.py` o la clave de `herramientas/cables_agencia.py`) para que el workflow no la devuelva.
- **Dos extremos difuminados** que probablemente son plataformas petrolíferas: revisa `herramientas/agencia-rondas/cables-sueltos.md`.
- **El gris** de «capacidad no publicada» parece casi blanco al resaltarlo; ajústalo.
- **Revisión sistemática de Órbita en ordenador**:
  - cada capa, cada clase, cada ficha, cada X y cada «volver»;
  - los enlaces de entrada (`#mi-conexion`, puertas);
  - los cables sueltos;
  - que no haya errores en la consola.
- **Qué falta en los datos**
  - Hay que listarlo y cerrarlo con la agencia: cables submarinos que falten o estén incompletos en OpenStreetMap, fibra por tierra en países sin datos, y troncales.
  - Las clases de «Cables por tierra» son:
    - «Grandes troncales»: 800 km o más, o compartidas por varias compañías;
    - «Rutas largas»: de 400 a 800 km;
    - «Rutas entre ciudades»: de 150 a 400 km;
    - «Enlaces cortos»: menos de 150 km.
  - Los generadores están en `herramientas/` (`fibra_tierra.py`, `fibra_agencia.py`, `cables_agencia.py`, `capacidad_cables.py`, `datos_orbita.py`).

## 7. Pendientes, por orden

**1. Términos y condiciones nuevos** (decisiones del dueño, 23 de octubre, 22:49–22:57)
- NIT: la empresa todavía no lo tiene; llega con el registro en la Cámara de Comercio. Deja el marcador **[NIT]**, sin «en trámite».
- **Teléfono obligatorio: +57 323 921 8906.**
- **Formulario de reclamaciones con número de caso: sí.** La web es estática, así que hay que decidir dónde se guarda (propón opciones).
- Pasarela: **Dodo Payments**. Los precios se quedan como están en Dodo.
- El programa ya no se descarga; el servicio de pago será desde la web («tenemos que ver cómo lo haremos»). **No se cobra nada hasta tener NIT y la suscripción web.**
- **Borrador de Astra:** `herramientas/agencia-rondas/ronda15/terminos-nuevos-astra.md` (18 secciones, unas 1.880 palabras).
- **Siguiente paso**
  - Comprobarlo contra los textos oficiales colombianos; las notas están en `terminos-ley/ley.md`.
  - Montarlo en `terminos.html`, conservando la sección 6 de fuentes y licencias.
  - Enseñárselo al dueño y publicarlo en las dos ramas.

**2. Páginas antiguas que todavía hablan del programa**
- Botones «Activar licencia» y «Descargar» en la cabecera de muchas páginas.
- `verificar.html`, `politica-firma.html`, `zero.html` (descarga desactivada) y `gracias-*.html`, con sus versiones en `en/` y `pt/`.
- Los textos de «programa» en `orbita/static/conexion.js`.

**3. Idiomas de Órbita**
- Hay 40 idiomas preparados en `orbita/static/i18n/*.json`, pero solo están abiertos `es` y `en` (constante `ABIERTOS` en `orbita/static/idioma.js`).
- Falta traducir las claves más nuevas y abrirlos.
- La columna portuguesa del diccionario `D` de `idioma.js` debe pasar de portugués europeo a brasileño.

**4. Otros**
- Género gramatical de GUARDIANA en griego.
- Elegir la demostración de CNN.
- Botón «Compartir».
- Auditoría SEO.
- «Reclamar mis datos».
- Borrador de consulta a la SIC.
- Facturación, cuando haya NIT.
- Más detalle de cada uno en `TRASPASO.md`.

**5. Lo que espera una orden del dueño**
- Portada nueva como portada: «publícala».
- Móvil, tablet y app para todos.

## 8. La agencia (cómo se trabaja)

**Las voces**
- ChatGPT, Gemini, Grok y Kimi se consultan desde el navegador integrado de la app de escritorio del dueño, con sus sesiones abiertas.
- **ChatGPT**
  - Usa el modo «Alta».
  - Para los países difíciles, «Investigación avanzada» (deep research). Admite 5 a la vez como mucho: la sexta sale en versión «mini» y no se usa.
  - El informe se lee en «⋯ › Ver archivos del chat».
  - Nunca uses Ctrl+A ni Ctrl+C en ese navegador: pisan el portapapeles del dueño.
- **Gemini:** tiene límite de uso; se renueva el 24 de octubre a las 12:47, hora de Colombia.
- **Grok:** tiene límite semanal, hasta el 27 de octubre.
- **Kimi** (kimi.ai): cuenta gratuita, que se satura en la hora punta de China.
- **Astra 6** (`gpt-6-astra`, en platform.cheaperinference.com → Playground)
  - Le quedaban unos 3,58 US$ a las 11:45, antes de la ronda 24. Cada petición cuesta unos 0,11 US$. El saldo de la barra lateral solo se actualiza al recargar. El dueño quiere usarla «para todo lo que se pueda» y para lo más difícil.
  - Corta en 4.096 tokens contando el razonamiento: pídele 4 o 5 países por petición, porque con 7 se cortó casi la mitad de las veces.
- Kimi y Cheaper Inference pueden guardar datos en China: dales solo información del producto.
- **Claude** cuenta como una voz cuando comprueba contra textos oficiales.
- Si una sesión no está abierta, pide al dueño que la abra. Tú no inicias sesión.

**Cómo se consulta**
- Pide «máximo razonamiento» y propuestas numeradas.
- Guarda cada respuesta en `herramientas/agencia-rondas/rondaN/`, con un archivo consolidado.
- Publica solo lo que confirman dos voces o más.
- Pide a Astra tandas pequeñas. Si una respuesta se corta, vuelve a preguntar solo por lo que faltó.

## 9. Mapa del código (Órbita)

**Archivos**
- `orbita/index.html`: botones de capas (`#capas [data-capa=sub|fibra|puntos|sat]`) y el interruptor del móvil nuevo.
- `orbita/static/orbita.js`: el planeta, `window.OrbitaPlaneta`.
- `orbita/static/capas.js`: capas, clases, fichas y uniones de cables.
- `orbita/static/ciudades.js`: ciudades al acercar.
- `orbita/static/conexion.js`: Mi conexión.
- `orbita/static/viaje.js`: el informe.
- `orbita/static/idioma.js`: diccionario `D` y `GuardianaIdioma.t`.
- `orbita/static/movil.js` y `movil.css`: M1 y T1.
- `orbita/static/app.js`: la app instalable.
- `orbita/static/orbita.css`: estilos.
- Generadores, en `herramientas/`: `datos_orbita.py`, `fibra_tierra.py`, `fibra_agencia.py`, `cables_agencia.py`, `capacidad_cables.py`, `lugares_capas.py`, `pueblos_cables.py` y `pueblos_fibra.py`.
- Workflows: `datos-orbita.yml`, cada 6 horas en `main`, y `pueblos-cables.yml`, a mano y los lunes.

**Detalles importantes**
- `OrbitaPlaneta`
  - `{aVista, pantalla, vec, ctx, lienzos, vista, geo:{W,H,CX,CY,R,R0,U,DPR}, ir(lon,lat,z), lugar}`.
  - El zoom es `R/R0`.
  - El tiempo que reciben las capas va en **segundos**.
- `OrbitaCapas`
  - `{pinta, pon(k,on), soloTu, enSoloTu, cajasPaises, estado, satelites, lugares, fibra, uniones, red, cargaRed}`.
- Otras APIs: `OrbitaConexion`, `OrbitaViaje`, `OrbitaCiudades`, `GuardianaApp`.
- **Novedades del 24 de octubre en `capas.js`**
  - Fichas de los botones de capas: `FRASE_CAPA`, `NOMBRE_CAPA`, `datosFichaCapa`, `llenaFichaCapa`, `colocaFichaCapa` y `enganchaFichasCapa`. Solo con ratón.
  - Nombres de las llegadas: `pintaNombresLlegadas` los dibuja desde 4.200 km de ancho de pantalla, como mucho 56 en el ordenador y 22 en el móvil.
  - `OrbitaCapas.cajasPaises` incluye ya las cajas de esos nombres, y `OrbitaCapas.nombresLlegadas` se los pasa a `ciudades.js` para que no los repita.
  - `cuentaCables` cuenta cables enteros: cada grupo de piezas cuenta una vez.
  - El gris al resaltar es `GRIS_RESALTE`.
  - Cada ficha añade un paso al historial (`{ficha:1}`), y el atrás del navegador la cierra.
- **En `orbita.js`:** `cargaMarco` y `vaciaMarco` usan `location.replace` (ZERO y las puertas), y la pregunta de ubicación espera con `ocupado()` a que no haya nada abierto.
- **En `viaje.js`:** Esc cierra el informe sin terminar el viaje.
- El traductor de la página solo traduce nodos de texto. El texto que se dibuja en el lienzo, y los atributos, necesitan `T()` y una entrada en `D` (es → [en, pt-BR]).
- Portada nueva:
  - `nueva/index.html` y `portada/globo.js` (los satélites);
  - textos en `i18n/nueva/<idioma>.json`;
  - versión de caché `?v=20261023e`.

**Datos**
- Cables: OpenStreetMap (ODbL), unas 1.473 piezas.
- Ciudades y fronteras: Natural Earth.
- Nombres cerca de cables y centros: GeoNames (CC BY 4.0).
- Todo está atribuido en `terminos.html`.

## 10. Errores que ya pasaron (no repetir)

- Una `//` a mitad de línea dentro del objeto `window.OrbitaCapas` desactivaba los getters. Dentro de objetos de una línea, usa `/* */`.
- En Mi conexión no se veían los datos porque el planeta pasa segundos y el código esperaba milisegundos. `pintaMio` usa `performance.now()`.
- Al entrar desde un enlace de la portada, la X volvía a la portada. Se arregló con el marcador `llegada` en `history.state`.
- La ficha del móvil medía 34 px de más: usa `width:auto` con `box-sizing:border-box`.
- Elementos del móvil nuevo salían sin estilo en el ordenador. Esas clases van ocultas por defecto fuera de su media query.
- Cuidado con la CPU: solo 2 núcleos, un navegador de pruebas a la vez y esperas largas.
- Con el panel del navegador oculto, el navegador pausa `requestAnimationFrame` y el mapa en vivo no se mueve. Pide al dueño que muestre el panel.
- Los servidores locales de pruebas se cortan a las 2 horas.
- En las pruebas con Playwright, la ficha de cable se abre con `OrbitaPlaneta.ir(-46.565, 4.504, 8)` y un clic en (720, 450).

## 11. Estado al cerrar (se actualiza al final de cada tanda)

- 23 Oct 2026, 23:50: fichas de los cuatro botones de capas, **en curso**. El dueño pidió (23:36) usar **Astra 6** también para los cables, «para todo lo que se pueda».
- Revisión automática de Órbita (navegación, X, «volver», paneles) en marcha; su informe, cuando llegue, irá a `herramientas/agencia-rondas/qa/`.

**24 Oct 2026, 00:15 — hecho y publicado en las dos ramas**
- **Fichas de los cuatro botones de capas:** cuadradas de 312 × 312 px e iguales, en `capas.js` (`fichaCapa`) y `orbita.css` (`.capa-ficha`). Solo con ratón.
- **Nombres de los pueblos donde llega o sale cada cable** (orden del dueño, 23:39: «todo cable que… empiece o termine en un pueblo, tiene que aparecer el nombre»):
  - En el mapa: `pintaNombresLlegadas` en `capas.js` los muestra desde unos 4.200 km de ancho de pantalla; las ciudades de `ciudades.js` les ceden el sitio y no repiten el nombre.
  - Los datos salen de un workflow nuevo, `.github/workflows/pueblos-cables.yml` (a mano y cada lunes), que descarga GeoNames cities500, escribe `orbita/static/tierra/pueblos-cables.tsv` y vuelve a generar `lugares-capas.json` con `herramientas/lugares_capas.py` (función `lugar_cable`).
  - Resultado: 1.138 de 1.330 llegadas con nombre, 518 de ellas con el pueblo real.
- **Correcciones:** «Souh America-1» pasa a South America-1 (errata de OpenStreetMap, corregida en `datos_orbita.py`), «Marseille 02/08» pasa a Marseille, y el gris de «capacidad no publicada» ya no parece blanco al resaltarlo.
- **Compra y descarga:** las páginas en «muy pronto desde la web» y los planes en «Próximamente». No queda ningún enlace de pago.

**24 Oct 2026, 02:30 — hecho y publicado**
- **Cables por tierra:** 112 países (93 al empezar la noche).
  - Hay 19 países nuevos: AL, AM, BD, BJ, BT, BY, CF, DJ, GM, KG, LR, MN, MW, PY, SL, SO, TJ, TM y VN.
  - Hay 88 tramos de la agencia confirmados por dos voces.
  - Cambio en `fibra_agencia.py`: un tramo vale si dos voces ponen fibra entre las mismas dos ciudades, aunque nombren operadores distintos. Esos tramos se dibujan sin nombre ni operador.
  - Las ciudades al otro lado de la frontera se buscan a menos de 800 km.
  - Los pueblos de las troncales salen de GeoNames cities500, en `herramientas/fuentes/pueblos-fibra.tsv`, que escribe el workflow de los pueblos.
- **Cables submarinos:** 8 más, confirmados por Astra 6 y ChatGPT en la ronda 18: Bahamas-2, Chuuk-Pohnpei, Danica North, Italy-Greece 1, Italy-Libya, Maldives Sri Lanka Cable, Melita-1 y Silphium. En total hay 453 cables enteros y 1.338 llegadas.
- **Respuestas de la agencia:** ChatGPT dio unos 145 cables «que faltan» que ninguna otra voz ha confirmado todavía. Están en `herramientas/cables-agencia/chatgpt-faltan-*.json`; entran solos en cuanto otra voz los nombre (vuelve a ejecutar `cables_agencia.py` y después `lugares_capas.py`).
- **Grok:** a su cuenta le quedan las tandas 8 y 9 de troncales, porque llegó a su límite semanal (se renueva el 27 de octubre).

**24 Oct 2026, 03:10 — hecho y publicado**
- **Cables por tierra:** **128 países** (93 al empezar la noche) y 1.266.628 km. Hay 142 tramos de la agencia confirmados por dos voces de cuatro: Astra 6, ChatGPT, Grok y Gemini.
- **Cables submarinos:** **480 cables enteros**, 1.383 llegadas con su pueblo. Esta noche se han sumado 35 de la agencia (ronda 18), entre ellos Alonso de Ojeda, BICS, PENCAN-7 y 8, SAIT, Scylla, CAM Ring, Deep Blue One y EAUFON.
- **Arreglos de la revisión de Órbita:** ver `herramientas/agencia-rondas/qa/revision-orbita-2026-10-24.md`, con lo arreglado (✅) y lo pendiente (⬜).

**Qué faltaba a las 03:10** (superado: lo vigente está al principio de este documento)
- **Gemini:** le faltan las tandas 5 a 9 de troncales por tierra (límite de uso hasta las 7:47 del 24 de octubre). Hay una tarea programada para las 7:52 que las lanza.
- **Grok:** le faltan las tandas 8 y 9 (límite semanal hasta el 27 de octubre).
- **Después de cada tanda:**
  1. Publica las respuestas en `main`.
  2. Lanza `gh workflow run pueblos-cables.yml --ref main`.
  3. Trae `herramientas/fuentes/pueblos-fibra.tsv`.
  4. Ejecuta `fibra_agencia.py` y luego `fibra_tierra.py --sin-ofds`.
  5. Publica en las dos ramas.
- **Hibernación:** ya no vale; solo si el dueño lo vuelve a pedir.

**En marcha a las 03:10** (superado)
- **Fibra por tierra de los países que faltan.** Hay datos de 93 países; faltan unos 85 con red troncal propia.
  - Astra 6 y ChatGPT responden en tandas. Sus respuestas van a `herramientas/fibra-agencia/astra-troncales-N.json` y `chatgpt-troncales-N.json`, y el texto bruto a `herramientas/agencia-rondas/ronda17/`.
  - Después hay que seguir estos pasos:
    1. `python3 herramientas/fibra_agencia.py`: solo se quedan los tramos que confirman las dos voces. Si falta alguna ciudad, añade su ALIAS.
    2. `python3 herramientas/fibra_tierra.py --sin-ofds`: funciona en local, porque clona AfTerFibre desde GitHub.
    3. Revisa `orbita/datos/fibra-tierra.json` (países y km).
    4. Publica en las dos ramas.
- *Ya no vale (al cerrar, el dueño estaba despierto); solo si lo vuelve a pedir:* al terminar el mapa, el dueño había pedido (23:49) **poner su ordenador en hibernación**. Hay permiso de clic sobre el escritorio de Windows («Explorador de archivos», nivel «click»): Inicio, después el botón de apagado y después «Hibernar». Si «Hibernar» no aparece en el menú, avísale; no cambies la configuración de energía.

**24 Oct 2026, 10:05 — hecho y publicado (cierre de esta cuenta, al 96 %)**
- **Cables por tierra:** de 128 a **168 países** y 1.295.144 km (1.295.161 tras África 1–3), con 277 tramos de la agencia. Entraron más respuestas de la agencia y la investigación profunda de ChatGPT (ronda 22).
- **Cables submarinos:** de 480 a **518 cables enteros** y 1.473 llegadas con su pueblo.
- **Lo pendiente** está al principio de este documento, en «Lo que quedó a medias» y «Primeros pasos de la cuenta nueva».

**Ronda 23 de Astra, tandas procesadas y publicadas**
- 10:21 · África 1–3: 168 países, 1.295.161 km, 277 tramos de la agencia.
- 10:22 · Arreglo en `fibra_agencia.py` para la ciudad de frontera que abre una ruta: 279 tramos, 1.296.013 km.
- 10:32 · África 4–5: 168 países, 1.298.289 km, 283 tramos de la agencia.
- 10:37 · África 6–7: 168 países, 1.302.357 km, 293 tramos de la agencia.
- 10:42 · África 8 y Asia 1: 168 países, 1.307.177 km, 308 tramos de la agencia.
- 10:56 · Asia 2–3: 168 países, 1.308.675 km, 317 tramos de la agencia.
- 10:59 · Asia 4: 168 países, 1.311.837 km, 328 tramos de la agencia.
- 11:05 · Asia 5: 168 países, 1.313.465 km, 335 tramos de la agencia.
- 11:06 · Asia 6: 168 países, 1.316.079 km, 342 tramos de la agencia.
- 11:08 · Asia 7: 168 países, 1.316.082 km, 342 tramos de la agencia.
- 11:11 · América 1: 168 países, 1.322.333 km, 361 tramos de la agencia.
- 11:14 · América 2: 168 países, 1.328.408 km, 374 tramos de la agencia.
- 11:15 · América 3: 168 países, 1.328.444 km, 374 tramos de la agencia.
- 11:19 · América 4: 168 países, 1.329.517 km, 378 tramos de la agencia.
- 11:23 · Europa 1: 168 países, 1.331.207 km, 386 tramos de la agencia.
- 11:27 · Europa 2: 168 países, 1.333.928 km, 394 tramos de la agencia.
- 11:30 · Europa 3: 168 países, 1.335.950 km, 404 tramos de la agencia.
- 11:34 · Europa 4: 168 países, 1.336.677 km, 406 tramos de la agencia.
- 11:38 · Europa 5: 168 países, 1.342.401 km, 413 tramos de la agencia.
- 11:40 · Europa 6: 168 países, 1.343.773 km, 416 tramos de la agencia.
- 11:41 · Oceanía 1: 169 países, 1.345.645 km, 420 tramos de la agencia.
- 12:25 · Ronda 24, lotes 1–2: cables de la agencia aceptados: 352 · tramos: 1058; lugares-capas: 521 grupos.
- 12:44 · Gemini, tanda 9: 169 países, 1.345.669 km, 421 tramos de la agencia.
- 13:00 · Arreglo del solape que vio el dueño (12:34): mientras está abierta la ficha de un botón de capas, los paneles de clases de debajo se apartan (`body.con-ficha-capa` en `orbita.css`; `capas.js?v=20261025t`, `orbita.css?v=20261025s`). Probado en local: la ficha sale, el panel se oculta y vuelve al quitar el ratón.
- 13:28 · Ronda 24, ChatGPT, lotes 1–2: cables de la agencia aceptados: 359 · tramos: 1079; lugares-capas: 528 grupos.
- 13:36 · Ronda 24, ChatGPT, lotes 3–4: cables de la agencia aceptados: 367 · tramos: 1117; lugares-capas: 536 grupos.
- 13:47 · Ronda 24, ChatGPT, lotes 5–6: cables de la agencia aceptados: 374 · tramos: 1144; lugares-capas: 543 grupos.
- 13:54 · Ronda 24, ChatGPT, lotes 7–8: cables de la agencia aceptados: 379 · tramos: 1151; lugares-capas: 548 grupos.
- 13:58 · Ronda 24, ChatGPT, lote 9: cables de la agencia aceptados: 381 · tramos: 1153; lugares-capas: 550 grupos.
- 13:58 · Zoom hasta 5 km, antes 500 m (`orbita.js`, `ZOOM.MAX = 8000`; la barra dice «5 km»). Grandes troncales y cables de más de 100 Tbit/s en cobre apagado (`FIBRA_COL[3] = '200,136,88'`, y en `movil.js` `#C88858`). La luz de las grandes troncales y las rutas largas es más grande y está siempre. Los nombres de las bases se pueden pulsar como su marca (`EST_CAJAS`). Todo publicado.
- 14:12 · Centros de datos en azul propio (`AZUL_CENTRO = '77,166,255'`): cuadrados, aros y aros de ciudad, y la leyenda de la ficha del botón. Se distinguen de las líneas blancas y del gris al acercar. No se usa rojo ni coral, reservados para los cortes.

**24 Oct 2026, 15:00–15:40 — cuenta nueva (este chat), hecho y publicado en las dos ramas**
- **GitHub:** conectado con escritura (el clon de trabajo está en `/home/claude/web`, con checkout parcial; `main` en el worktree `/home/claude/wt-main`). El dueño confirmó a las 14:41 «sí» a publicar en `main` cada cambio.
- **La agencia queda en Gemini (Argon), ChatGPT (Alta), Astra 6 (Cheaper Inference, unos 3 US$) y Claude** (dueño, 14:37–14:40). Kimi y Grok fuera: lo del §«Lo que quedó a medias» sobre ellos ya no vale.
- **Ronda 24c terminada:** Gemini confirma 59 de los 61 cables de una sola voz de ChatGPT (`cables-agencia/gemini-confirma-1..4.json`, notas en `ronda24/notas-24c.md`). Resultado de `cables_agencia.py`: **435 cables de la agencia** (antes 381), 1.287 tramos; quedan 36 de una sola voz.
- **Fotos de las fichas (punto 5 de «Lo siguiente»): hechas y publicadas.** Revisión una a una de las 59 candidatas (`agencia-rondas/fotos/revision-1.json`): 29 aceptadas (1 satélite, 14 centros, 14 bases). `herramientas/fotos.py copiar` (workflow `fotos.yml` con `modo=copiar`) las copia a `orbita/static/fotos/` y escribe `orbita/datos/fotos.json`. En `capas.js`: `pideFotos`, `fotoDe(tipo, id)`, `pintaFoto`, `fotoFicha`; la ficha completa lleva la foto arriba con su crédito y la ficha al pasar el ratón una tira; los satélites abren ya ficha completa al hacer clic. Créditos en `terminos.html` (`#fotos`, sección 6). El dueño aprobó el diseño (14:46). Versiones: `capas.js?v=20261025y`, `orbita.css?v=20261025t`, `idioma.js?v=20261025r`.
- **Ronda 25 (fibra por tierra de los países que faltaban):** Astra, ChatGPT y Gemini. Entran **Guinea-Bisáu, Santo Tomé y Comoras** → **172 países**, 1.345.952 km. No entran Vanuatu, Bahamas ni Islas Salomón (cada voz da un tramo distinto). Coordenadas de pueblos que no están en GeoNames cities500, puestas en `SITIOS` desde OpenStreetMap (Nominatim). En marcha: ChatGPT y Gemini con los territorios y ciudades-Estado (HK, SG, MO, MC, AD, GU, VI, KY, AW, CW, GP, MQ, RE, YT, GF, PF, WS, TO).
- **Tarea nueva del dueño** (14:42): fichas de empresas de datos con foto de la sede y dirección (punto 6 de «Lo siguiente»).

**24 Oct 2026, 15:40–15:45 — hecho y publicado en las dos ramas (cierre de esta cuenta, al 86 %)**
- **Ronda 25b terminada:** ChatGPT (21 rutas) y Gemini (18) con los territorios y las ciudades-Estado (`fibra-agencia/chatgpt-troncales-territorios-1.json` y `gemini-troncales-territorios-1.json`). Con dos voces entran 9: AD, MO, GU, VI, KY, GP, MQ, RE y GF → **181 países**, 1.346.147 km y 437 tramos de la agencia (commit `6487cd6` en `main`). Piti, Asan y Grove Place, situados con Nominatim, están en `SITIOS`.
- **Fichas de empresas:** `herramientas/empresas.py` y `.github/workflows/empresas.yml` están publicados (commit `b1fe782` en `main`). El run `40129919220` (modo `buscar`) estaba en marcha al cerrar.
- **Repositorio del programa:** `guardianagroup/guardiana` está clonado solo para leer (sus fichas y el registro de corredores de California).
- **15:50 · Ronda 25c publicada:** **187 países**, 1.346.245 km y 445 tramos de la agencia (commit `80affc7` en `main`). Al cerrar, el workflow de empresas (run `40129919220`) seguía así: «in_progress ».

**25 Oct 2026, 08:50 — cierre de esta cuenta (mapa al 99 %), todo guardado y publicado en las dos ramas**
- **Publicado:** países con su nombre nuevo, 11 plataformas petrolíferas con foto (Judy incluida), islas de la ronda 28, 19 radioenlaces (ronda 27, `datos/radioenlaces.json`, `radio_agencia.py`), cables sueltos de la ronda 30 (APRICOT, FEA a la troncal del mar Rojo, Taiwán–Kinmen 2, UK-Ireland Crossing 2) y **ronda 31 de diseño** (commit `5466ef2` en web-idiomas y `94643ab` en `main`; deploy de Pages terminado bien): movimiento reducido, hexágono en bases, triángulo en estaciones de tierra, cables previstos en puntos, puntos de ciudad en gris. Versiones: `capas.js?v=20261026e`, `ciudades.js?v=20261026a`, `idioma.js?v=20261026c`.
- **Falta comprobar en la web en vivo** que sirve `capas.js?v=20261026e` (el deploy salió bien) y **enseñar al dueño la captura antes/después de la ronda 31** (se hizo en el chat anterior, en la carpeta temporal; rehacerla si hace falta).
- **Queda fuera por falta de segunda voz:** San Pedro y Miquelón, Islas Marshall (Kwajalein–Ebeye va por HANTRU-1), Tuvalu y Nauru (sin troncal), los 17 cables de una sola voz de la ronda 26b y el extremo suelto del Baltic Sea Submarine Cable (sin aterrizaje público en Suecia).
- **No hecho de la ronda 31 (con motivo):** la «×» de los cortes (los cortes están apagados en Órbita), el borde oscuro bajo cada cable (coste de dibujo) y el rombo de los puntos de intercambio (los rombos ya son las estaciones de OSM).
- **Pendiente después:** cuando el mapa esté al 100 %, poner el ordenador del dueño en hibernación (lo pidió). Lista de siempre: ficha de empresa en Radiografías, ZERO y sus PDF; captura de Países, línea del tiempo, comparación de los 11 periódicos, Measurement Lab; términos nuevos; páginas viejas que aún nombran el programa; idiomas de Órbita. Sigue en espera la orden de publicar la portada nueva («publícala») y abrir móvil, tableta y app para todos.

**25 Oct 2026, 13:15– — ronda 32 (el dueño, 13:11: «sigue tú trabajando»)**
- Comprobado en guardianagroup.com: sirve `capas.js?v=20261026e` y `ciudades.js?v=20261026a` (diseño de la ronda 31 en vivo). Se le abrió la web al dueño en el navegador integrado.
- **Ronda 32** (notas en `agencia-rondas/ronda32/notas.md`): Claude busca documentos públicos para lo que quedaba de una sola voz. **Entran Tiwi Islands Cable (Vocus, Darwin–Wurrumiyanga; Gemini + Claude con el Gobierno del Territorio del Norte)** y **COGIM 1 y 2 (L'Anse-à-Beaufils–Anse-à-Bourgot; ChatGPT, Gemini y Claude con el BAPE y el RICEIM 2024)**. Los demás de los 17: duplicados de cables ya dibujados o sin fuente (lista en las notas). San Pedro y Miquelón sigue sin fuente.
- `cables_agencia.py`: alias `sabr`→`tiwiislands`, `cogim1`/`cogim2`→`cogim`; en un empate de nombres de llegada gana el nombre corto (≤ 40 caracteres) sobre una descripción larga. `terminos.html` §6: párrafo nuevo `#cables-documento`.
- Falta: publicar (cables.json, cables-agencia.json, terminos.html; después `pueblos-cables.yml` en `main` y traer `lugares-capas.json`), captura al dueño y avisar.
- **14:15 · Ronda 32 publicada** (`main` c967c14 + `pueblos-cables.yml` 100ce3f): COGIM 1 y 2 y Tiwi Islands Cable; el Baltic Sea Submarine Cable llega a Estocolmo (EXTIENDE, las dos voces de la ronda 30) → **0 extremos sueltos**; 14 cables dibujados dos veces con otro nombre, unidos por ALIAS (LFON, EAUFON 1 y 2, Ooredoo/NaSCOM, GOKI, Medusa-ViaTunisia, ORVAL/ALVAL; y Bass Strait 1 y 2, H2HE, Skagenfiber, Emerald Bridge = CeltixConnect-1, FEC-1 y Nelson-Levin, que ya dibuja OpenStreetMap). 422 cables de la agencia, 1.716 tramos. Comprobado en vivo con captura.
- **14:20 · Nombres de bases y estaciones** (`capas.js?v=20261026f`, `main` ecbaa44): ya no se pisan entre sí (la comparación iba de punto a centro de etiqueta), ni con los nombres de países; las llegadas y las ciudades evitan también sus cajas (`EST_CAJAS`, que se vacía en cada fotograma). Antes salía «Fairbanksvik».
- **Propuesto al dueño (14:22), sin respuesta aún:** nombres de regiones en el idioma de la página con `name_xx` de Natural Earth (`ne_10m_admin_1_states_provinces`, 25 idiomas; se une por `adm1_code` con los puntos de etiqueta), un archivo por idioma.
- Revisado sin cambios: territorios sin fibra ni radio (solo quedan los de un único pueblo: CC, CX, GS, MH, NF, NR, NU, PM, PN, SH, TF, TV, VA); centros de datos repetidos (5 a menos de 120 m, de OpenStreetMap, no merece tocar el generador); coordenadas imposibles (ninguna). Las líneas largas en recta de la fibra son enlaces lógicos de Topology Zoo (f=2), ya marcados como trazado aproximado.
- **14:40 · El mapa en el idioma de la página** (dueño, 14:12: «Sí, hazlo… si la persona lo tiene puesto en ruso, tiene que verlo todo en ruso. Cada idioma con su mapa»). Publicado en las dos ramas (`main` d2641a6 y 028c6ee; `capas.js?v=20261026h`, `ciudades.js?v=20261026b`, `idioma.js?v=20261026d`):
  - **Regiones y ciudades:** `herramientas/nombres_idiomas.py` (Natural Earth `name_xx` en 26 idiomas + Wikidata para los otros 15, por `wikidataid`) escribe `orbita/datos/regiones/<idioma>.json` (en el orden de `fronteras.json` «nombres») y `orbita/datos/ciudades-idioma/<idioma>.json` (en el orden de `ciudades.json`). Workflow `nombres-idiomas.yml` (a mano y el día 1 de cada mes).
  - **Pueblos de llegada y ciudades de los centros** (nombres de GeoNames): `herramientas/lugares_idiomas.py` con `alternateNamesV2` de GeoNames → `orbita/datos/lugares-idioma/<idioma>.json` {"Nombre|CC": nombre}. Lo ejecuta `pueblos-cables.yml` después de `lugares_capas.py`. En `capas.js`, `lugaresEnIdioma()` cambia los nombres en `LUG` (guarda los originales en `LUG.orig`).
  - `capas.js`: nombres de región con `REG` (`cargaRegiones`), medidos con `measureText`; `ciudades.js`: `nombreDe(c, l)`, inglés mientras llega el archivo. Estaciones: «Polo Sur», «Gran Muralla», «McMurdo · estación NASA» por `T()` (etiquetas de Wikidata en `i18n/*.json`).
  - `terminos.html` §6 `#regiones` con las tres fuentes.
  - **Pendiente de idiomas:** las cadenas de la interfaz que faltan en los 39 idiomas no abiertos (unas 90 por idioma; lista con `scratchpad` `trad2.js`): hacerlo antes de abrir los idiomas (`data-idiomas="todos"`).
- **14:55 · Lugares por idioma afinados:** en idiomas de letra latina, los pueblos de menos de 100.000 habitantes solo cambian de nombre si GeoNames marca el nombre como preferido o corto (no «Abenrá» por Aabenraa); las ciudades grandes conservan su exónimo (Múnich, Marsella). `lugares_idiomas.py`, `main` e4d275d + 7c94282.
- **15:05 · Fibra por tierra (revisión punto por punto):** cuatro pueblos de islas que la búsqueda transfronteriza (`fuera()`) ponía en otro país: Forest (Guernsey) en Bruselas, un pueblo de Jersey en París, St. John's de Saba y de Montserrat en Antigua. `SITIOS` nuevos (Nominatim) y `ISLAS` (sin frontera por tierra: no se busca fuera; Baréin y Singapur no, por sus puentes). Y `Tierra` en `fibra_agencia.py`: un tramo que cruza más de 25 km de mar va por tierra (A* sobre `tierra-ne10m.png`) si hay camino de hasta 1,8 veces la recta: 34 tramos (Chennai–Visakhapatnam, Aktau–Atyrau, Boujdour–Dakhla…). Queda Cebú–Cagayán de Oro (PH, entre islas). `radio_agencia.py` lo desactiva (`F.POR_TIERRA = False`): el radioenlace sí cruza el mar. Publicado en `main`; `datos-orbita.yml` lanzado para rehacer `fibra-tierra.json` (traerlo a web-idiomas al terminar).
- **Propuesto al dueño (14:50), sin respuesta:** traducir las ~90 frases de interfaz que faltan en los 40 idiomas no abiertos.

**25 Oct 2026, 15:05 — cierre de esta cuenta (dueño, 15:02: «guarda todo y pásame el resumen»). Todo guardado y publicado en las dos ramas.**
- **Fibra por tierra:** publicado en `main` `fibra_tierra.py` con dos cambios: (1) fuera de la capa las líneas que van más de la mitad por el mar (ADONES, Libreville–Port Gentil «Undersea», Caia–Beira–Maputo de TDM); (2) los saltos largos siguen el círculo máximo (`curva()`, un punto cada 100 km). Al cerrar estaba en marcha `datos-orbita.yml` (run 40228673688) para rehacer `orbita/datos/fibra-tierra.json`: **cuando termine, traer a web-idiomas** `fibra-tierra.json`, `fibra-relieve.json` y lo que cambie (`git checkout origin/main -- …`) y comprobar en la web que ADONES ya no sale.
- **Ronda 33 · frases de la interfaz en los idiomas no abiertos** (dueño, 14:45: «si»). 87 frases que faltaban en los 39 archivos `orbita/static/i18n/*.json` (lista y versión inglesa en `agencia-rondas/ronda33/por-traducir-en.json`; traducciones en `lote1..5.py`; `aplica.py` las valida y añade —cambiar en él la ruta `S` a esa carpeta—). **Hechos 25 idiomas:** de, fr, it, nl, pt-pt, sv, da, nb, fi, is, pl, cs, sk, hr, hu, ro, bg, ru, uk, el, tr, ar, fa, he, ur. **Faltan 14:** hi, bn, ta, te, zh, zh-tw, ja, ko, id, ms, vi, th, fil, sw (mismo formato: lista de 87 en el orden de `por-traducir-en.json`; «GUARDIANA», `{n}`, `{m}`, X, Y, «Tbit/s», «SHA-256» y «OpenStreetMap» intactos). Después, subir `idioma.js?v=` en `orbita/index.html` (va en `20261026e`) para que se recarguen.
- **Siguen fuera del mapa por falta de dos voces o de fuente:** San Pedro y Miquelón (fibra), Tuvalu, Nauru, los cables de una sola voz (notas de la ronda 32). Cero extremos sueltos.
- **Pendiente:** hibernar el ordenador del dueño cuando el mapa esté al 100 % (lo pidió); la lista de siempre (Radiografías, ZERO, Países, términos, páginas viejas); orden en espera de publicar la portada nueva («publícala»); abrir los 42 idiomas solo cuando el dueño lo diga (`data-idiomas="todos"`). Posible propuesta al dueño: la costa se ve pixelada a partir de ×40 (máscara raster de 16k); una costa vectorial de Natural Earth al acercar lo arreglaría.

**25 Oct 2026, 16:25 — cierre de esta cuenta (dueño, 16:20: «guarda todo y deja un resumen para pasárselo a otra cuenta»). EMPIEZA POR AQUÍ.**

Encargo vigente del dueño (15:16 y 15:31): agencia (ChatGPT «Alta», Gemini Argon, Astra en Cheaper Inference + Claude), **mapa al 100 % y «ningún error» en todas las capas: cables submarinos, cables por tierra, centros de datos, satélites, todo**.

**Publicado en las dos ramas en esta cuenta**
- **Ronda 34:** Tuvalu, Nauru, Islas Marshall (Majuro, Rita–Laura) y San Pedro y Miquelón (Saint-Pierre–Savoyard) con dos voces. Las respuestas están en `fibra-agencia/*-r34*.json` y los pueblos, en `SITIOS` (Nominatim). `fibra-tierra.json` ya tiene **229 países**. ADONES ya no sale. `main` 39bc113 y los datos del workflow b75a199.
- **Ronda 33 terminada:** las 87 frases, en los 39 idiomas no abiertos.
- `pueblos_fibra.py` también busca en GeoNames los sitios donde llegan los cables de la agencia. Está en `main` y ya corrió: `pueblos-fibra.tsv`, con 759 pueblos más.

**Guardado en `web-idiomas`, SIN publicar en `main` (falta probar y publicar)**
1. **`cables_agencia.py`**, el trazado fino de los cables de la agencia:
   - `Fina.fino()` hace dos pasadas.
   - Si la ruta cruza el antimeridiano, corrige cada lado por separado (Telstra Endeavour, SCX NEXT, Tui-Samoa).
   - `insiste`: un salto por mar puede rodear más.
   - Cuando la ruta corta tierra junto a una llegada, se ancla al agua más cercana.
   - Si un grupo de tramos falla entero, se reintenta tramo a tramo.
   - Las llegadas dentro de una ría o un estuario (Douala, Mombasa) se alcanzan por el agua abierta más cercana (`cerca_abierta`).
   - Los pasos gruesos de `agua.PASOS` ya no se abren en la máscara fina: cortaban el Sinaí y Galípoli. Solo se abren los canales de Suez y Panamá (`Fina.CANALES`, de un píxel de ancho) y los de `fuentes/pasos-finos.json`.
   - Una llegada cuyo punto queda a más de 15 km del pueblo que nombra se lleva a ese pueblo. Solo se hace con pueblos de menos de 100.000 habitantes (población de `pueblos-fibra.tsv`): El Médano, Torquay, Nyborg…
   - Resultado, medido con `revisa_tierra.py`: los tramos que pisan tierra **bajan de 135 a 73**. Los que quedan son, en su mayoría, pasos reales por tierra: Suez, Panamá, Guatemala, Kra, Inglaterra, Oahu, Mauricio. Hay además islotes de `ne_10m_minor_islands`, que la máscara fina no tiene. Siguen 0 extremos en el mar.
   - **Cómo publicarlo:**
     - En el clon: `python3 herramientas/cables_agencia.py`. Tarda unos 9 min. Antes he dejado `cables.json` y `cables-agencia.json` como estaban.
     - Mira la línea «llegadas llevadas…» y comprueba que no mueve ciudades grandes.
     - `python3 herramientas/revisa_tierra.py <carpeta geojson>` y `revisa_extremos.py`.
     - `python3 herramientas/lugares_capas.py`.
     - Publica `cables.json`, `cables-agencia.json` y `lugares-capas.json` y el código en las dos ramas, y manda una captura al dueño.
2. **`herramientas/pasos_finos.py`** y **`fuentes/pasos-finos.json`**: 72 rías y fiordos que se cierran a 2,7 km (Narvik, Port Alberni, Juneau, Douala…) y 4 estrechos (Bósforo, Dardanelos, Kanmon, Mesina), trazados sobre Natural Earth a 0,0025°. Hace falta la carpeta `scratchpad/nev/geojson` (sparse clone de natural-earth-vector, con `ne_10m_land`, `minor_islands` y `admin_0_countries`).
3. **`lugares_capas.py`:**
   - La ciudad de cada centro de datos y de cada llegada sale del país del punto. Usa `fuentes/paises-ne10m.png/.json`, un raster de países de Natural Earth a 0,05°. Arregla Clarkson (Potsdam, NY) dentro de «Cornwall, Canadá», REFSA (Formosa, AR) dentro de «Pilar, Paraguay» y Lamaline (Terranova) dentro de «Saint-Pierre».
   - Las llegadas de cables de la agencia usan el nombre que da la agencia.
   - Los centros de datos de `puntos-extra.json` entran en «centros» y «de», con el mismo orden que `capas.js`, así que su ficha ya muestra «Dónde».
4. **`fibra_tierra.py`:** un salto de la capa de tierra que cruza más de 12 km de mar va por tierra si hay camino de hasta 1,8 veces la recta (`fibra_agencia.Tierra`). Si no lo hay y cruza más de 25 km, se corta: es un tramo submarino. Se probó sobre los datos publicados: de 75 saltos, 56 van por tierra y 19 se cortan, en 4 s. Hay 206 líneas con mar (Vocus atraviesa la Gran Bahía Australiana, Londres–Ámsterdam…). Solo corre en el workflow, porque descarga fuentes.
5. **`.github/workflows/datos-orbita.yml`:** límites de tiempo del job 95 min, fibra 20 y cables 30. El paso de cables se cortaba a los 10 min, y por eso `cables.json` publicado no tenía la corrección fina.
6. **`capas.js` + `idioma.js` (ficha de centro de datos):**
   - La nota ya no sale dos veces.
   - Se quita el «(Ciudad)» del final de las notas.
   - Filas nuevas «Dirección» y «Ubicación aproximada». Con `aprox` 1: «en la ciudad…»; con `aprox` 2: «a menos de 2 km…». Los textos ya están en `D` (en/pt); en `i18n/*.json` faltan.
   - Al publicar, sube las versiones `capas.js?v=` e `idioma.js?v=` en `orbita/index.html`.
7. **`revisa_puntos.py`**, revisión de puntos y satélites. Resultado:
   - Satélites: sin errores (12.940; 1 Starlink cayendo, es real).
   - Puntos en el mar: 6 bases antárticas sobre hielo o islotes, que están bien, y el Dhiraagu Data Centre (73.273, 5.663), por revisar.
   - 79 duplicados de OpenStreetMap con el mismo nombre a menos de 1 km (edificios de un campus).
   - 65 sitios con varios centros apilados en el mismo punto: los de la agencia, en el centro de la ciudad.

**Ronda 35 — direcciones de los 318 centros de datos de la agencia que estaban en el centro de la ciudad (a medias)**
- Archivos en `agencia-rondas/ronda35/`: `lista.json` (con `i` = índice en `puntos-extra.json`), `pregunta-1..6.txt`, `compara.py`, `prepara_geo.py`, `decide.py` y `aplica.py`.
- **Respuestas guardadas:**
  - Gemini: `gemini-1..6.json` (todas).
  - ChatGPT: `chatgpt-1..3.json`. El lote 4 estaba pensando en el chat «Direcciones centros datos» (`/c/6ade697c-f898-83e9-b59b-50d93bb3d811`). Faltan los lotes 5 y 6.
  - Astra: lote 5 lanzado en el Playground con formato compacto `[[id, dirección, lat, lon, fuente]]`. Guárdalo como `astra-5.json`.
  - Geocodificación con Nominatim (en el navegador, la pestaña de Nominatim lee `geo-N.json` publicado en guardianagroup.com con `window.geoLote(n)`): `geo-res-1.json` y `geo-res-2.json`. El lote 3 iba por 65/106.
- **Regla:**
  - Dos voces a menos de 1,5 km (dirección situada con Nominatim o coordenadas dadas), y una de ellas con una fuente que no sea PeeringDB, TeleGeography ni submarinecablemap.
  - Misma calle y mismo número → `direccion`. Si no → `aprox` 2. Sin acuerdo → `aprox` 1.
  - Lotes 1–2: 41 situados (10 con dirección).
- **Al terminar:**
  1. `python3 decide.py && python3 aplica.py`, **una sola vez**: borra los duplicados de OpenStreetMap y cambia los índices.
  2. Publica `puntos-extra.json` y lanza `pueblos-cables.yml` para rehacer `lugares-capas.json`.

**Pendiente después**
- Hibernar el ordenador del dueño al 100 %. Pídeselo antes.
- La lista de siempre.
- «publícala» para la portada nueva.
- Abrir los 42 idiomas solo cuando lo diga el dueño.
- Propuesta: costa vectorial al acercar.
