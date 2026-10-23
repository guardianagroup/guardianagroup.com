# Traspaso de Órbita · 22 de octubre de 2026, 16:40 (hora de Bogotá)

Documento para que otra sesión de Claude siga el trabajo exactamente donde quedó. Léelo entero antes de tocar nada.
El dueño es Fran (GUARDIANA GROUP S.A.S., Cartagena). **Siempre en español.** Lo último que dijo: «Sí a todo; no hace falta
que me preguntes más si te doy permiso». Avísale cuando algo quede listo, en pocas líneas, sin pegar código en el chat.
Publica cada cambio en cuanto esté («ves actualizando todo… para que yo y mi amigo lo podamos ir viendo»).

## 1. Reglas fijas del dueño (no negociables)
- No mostrar nunca el nombre real de la fundadora: en mockups se usa «Marta Ortega».
- No pegar código en el chat; no inventar cifras (los datos de demostración, etiquetados como tal); no prometer protección absoluta.
- Sin marcas reales de terceros en mockups (dominios `.example`). Colores: fondo #06080C, acento #9CC3E4, texto #F4F6F8; rojo #E07A6C solo para cortes.
- «Primer nivel de agencia» y «ponte en la piel del cliente»: calidad tipo Apple; el objetivo es «superar a Google Earth en datos».
- **Todo lo que esté en el mapa, a máxima resolución, también al hacer zoom.**
- **No decir las fuentes en Órbita** (nada de OpenStreetMap, Natural Earth, ETOPO… en pantalla): las fichas dicen «Datos verificados»;
  las atribuciones de licencia van solo en `terminos.html` (sección 6). Prohibido usar submarinecablemap.com / TeleGeography como fuente.
- Regla de la agencia: **solo entra lo que confirman al menos dos voces** (ChatGPT, Grok, Claude; Gemini se niega). Nada «no verificado» a la vista del cliente.
- Nada de «no verificado» ni huecos en fichas: si no se sabe, se omite la fila.
- Idiomas: solo español e inglés activos en la web (`ABIERTOS = ['es','en']` en `orbita/static/idioma.js`); los 42 están traducidos en `orbita/static/i18n/*.json`
  salvo las claves más nuevas (ver §6).
- Órbita vive en `guardianagroup.com/orbita/` como página **no listada** (meta noindex) para que el dueño y su amigo (pueblo cerca de Praga, Chequia) la vean.
  **Nadie puede descargar nada de la web pública («todo próximamente»)**: en `main` los botones de descarga de `index.html`, `instalar.html`, `en/`, `pt/`
  y `zero` están desactivados (`is-off`, `data-off`) y la carpeta `descargas/` se eliminó de `main` (sigue en `web-idiomas`).
  **No copiar nunca `index.html`, `instalar.html`, `en/`, `pt/` ni `descargas/` de `web-idiomas` a `main`** sin volver a desactivarlos.
- **«El viaje de tus datos» es solo para PC** («solo versión PC descargable, de momento»; en el móvil irá en la aplicación): los botones aparecen
  solo si `!(pointer:coarse) && innerWidth >= 900`, y el vídeo solo se graba fuera de pantallas táctiles.
- Nunca presentar los arcos como la ruta real de los paquetes: en pantalla y en el informe va siempre «conexiones medidas, trayectorias ilustrativas».
  Nunca traducir los ms de más en «kilómetros de rodeo» (la razón ×N y los «+X ms sobre el mínimo» sí).

## 2. Repositorio y cómo publicar (procedimiento que funciona)
- Repo `guardianagroup/guardianagroup.com`. GitHub Pages sirve la rama `main`. Se trabaja en la rama **`web-idiomas`** (push autorizado).
- El workflow `.github/workflows/datos-orbita.yml` corre en `main` (por horario y con `gh workflow run datos-orbita.yml --ref main`) y regenera
  `orbita/datos` (OSM, fibra, relieve ETOPO) con commit a `main`. **Después de cada ejecución**, traer sus datos a `web-idiomas`:
  `git fetch origin main && git checkout origin/main -- orbita/datos && git commit`, para no pisarlos en la siguiente publicación.
- **Siempre `git commit` en `web-idiomas` antes de cambiar de rama** (se perdió trabajo dos veces por un `reset --hard`: la segunda, 22 Oct 20:00, al publicar
  solo unos archivos con otros cambios sin guardar: el `reset --hard` borró los modificados y el `git add -A` de main se llevó los no seguidos).
  Antes de `git checkout main`, comprobar `test -z "$(git status --porcelain)"`; si no está limpio, commit primero.
- Publicar (el merge de historias no relacionadas está bloqueado; esto es lo que funciona):
  ```
  git add -A && git commit -m "…" && git push origin web-idiomas
  git checkout main && git fetch origin main && git reset --hard origin/main
  git checkout web-idiomas -- orbita herramientas terminos.html .github/workflows/datos-orbita.yml
  git add -A && git commit -m "Publicar …" && git push origin main && git checkout web-idiomas
  ```
- **Caché**: todos los `static/*.js|css` de `orbita/index.html` llevan `?v=20261023i` (esquema `2026102<día><letra>`). Sube la letra en cada publicación (siguiente: `23j`, luego `23k`…).
- Comprobar el despliegue: `gh run list --repo guardianagroup/guardianagroup.com --limit 1` hasta `completed success` (1–3 min).
  Desde el contenedor **no se puede** hacer curl a guardianagroup.com, overpass-api.de ni NOAA (proxy); se comprueba con el navegador integrado
  (pestaña `tab-7` = guardianagroup.com/orbita/?v=X; `tab-6` es una pestaña del dueño, no tocar) y desde `javascript_tool`: `OrbitaPlaneta.ir(lon, lat, zoom)`, `OrbitaConexion.abre(true)`,
  `OrbitaConexion.medirRutas()` (≈40 s), `OrbitaViaje.empieza()`, `OrbitaViaje.informe()`. `OrbitaPlaneta.ir()` no hace caso durante la animación de entrada:
  esperar unos segundos. Pulsar «Ahora no» del aviso al cargar.
- Commits: terminar con `Co-Authored-By: Claude … <noreply@anthropic.com>` y la línea `Claude-Session:` que dé el sistema.

## 3. Estado de Órbita hoy (todo publicado en guardianagroup.com/orbita/, versión 23i; la 23j será la siguiente)
- Planeta WebGL con mapa 16K en teselas; modo «limpio» desde ×4 (agua negra, tierra gris, datos en blanco, sin luces).
- **Zoom hasta ×80.000 (500 m de altura nominal)**, suavizado logarítmico, doble clic por pasos. Indicador de altura a la derecha, encima de los botones
  (`#altura`, 40.000 km → 500 m). Desde ×8 (`body.hondo`) desaparecen los botones de capas y el filtro de satélites. Latitud hasta ±89,5° al acercarse.
  **Límite real**: el fondo (costas) es de 1–2 km de resolución; los puntos son precisos.
- Capas: Cables submarinos (OSM filtrado + agencia **278 confirmados** (más los que OSM ya tenía), trazado aproximado punteado), Fibra por tierra (6.695 tramos, 90 países; se desvanece
  por debajo de ~100 km de altura), Centros de datos (1.903 lugares, cuadrado blanco con anillo sutil al acercarse), Satélites (tiempo real).
- **Cables por potencia** (`orbita/datos/cables-capacidad.json`, 62 cables: 24 gigantes ≥ 100 Tbit/s, 28 grandes ≥ 20): gigantes en blanco, más gruesos y
  con halo (énfasis que crece con el zoom, `kq`), grandes en acero brillante, el resto regional; fila «Capacidad: X Tbit/s · N pares · troncal gigante/grande/regional».
- **Profundidad y altitud** (`cables-relieve.json`, 1.243 tramos; `fibra-relieve.json`, 5.039): generadas por el workflow con `herramientas/relieve.py`
  (ETOPO 2022 60s, en caché del runner). Fila «Profundidad del fondo bajo este tramo: máxima · media · % en plataforma · % en llanura abisal» y
  «Altitud del terreno: hasta · media». Clave de cada tramo = `n_puntos:Σ(round(lon·1000)+round(lat·1000))`, la misma en `relieve.py` y `claveRelieve` (capas.js).
- Fronteras, nombres de regiones, **nombres de país** desde ×2,2 con **ficha de país** (`fichaPais`; `datos/paises.json`: **175 países, todos verificados** (Claude escribe, ChatGPT corrige → `confirmado:true`; respuestas en
  `herramientas/paises-agencia/`). Lotes 5–12 hechos (22 Oct, 18:30–19:50; respuestas en `herramientas/paises-agencia/chatgpt-paises-5..12.json`). **Faltan** (lote 13, el último útil): VU, SB, PF, NC, FM, MO, LI, AD, MC, SM, GL, FO, AW, CW, GI, BM, KY, MQ, GP, RE. Procedimiento exacto en §6.2.
- **Polos**: 34 estaciones en `datos/puntos-extra.json` (tipo `estacion`, `cargaEstaciones`/`EST`), visibles con la capa de cables, ficha al pasar el ratón.
  5 cables previstos punteados en `datos/cables-previstos.json` con toda la información del proyecto. Incidencias en `datos/cables-notas.json` (20 claves).
- **Ficha completa** (`panel()` en capas.js): al pasar el ratón, resumen; al hacer clic, panel lateral `#ficha-panel` con resumen, «Qué significa para ti»,
  secciones desplegables, «Copiar ficha» y «Guardar PDF». Modelos para estación, previsto, país, centro, cable, fibra (`modelo(tipo, titulo, filas, pie, plan)`).
- **Rutas por el cable (22 Oct 2026, 18:13, dueño: «deben de llegar por el cable… es mucho más real»)**: `orbita/static/red.js` construye un grafo con las
  líneas de cables submarinos + fibra terrestre que capas.js expone (`OrbitaCapas.red` = {sub, tierra, fibra}; `OrbitaCapas.cargaRed()` las carga aunque las
  capas estén apagadas; celdas de 0,22°, celdas vecinas unidas con penalización), Dijkstra con montículo binario, `OrbitaRed.camino(a,b)` → {pts, acc, km} o
  null si no hay camino o si el camino es > 2,2× la recta + 300 km (entonces arco directo, p. ej. Cartagena–Bogotá, sin fibra terrestre en el mapa);
  `OrbitaRed.muestrea(ruta, n)`. conexion.js: `trayecto(p,a,b,n)` (caché `CAMINOS`), `pantalla()`, `camino()`; `porSatelite()` si el operador medido desde fuera
  es Starlink/Viasat/Hughes/OneWeb… → primer tramo sube al satélite (LEO ×1,09 a escala; GEO ×1,35 «no a escala») con etiqueta. viaje.js `arcoPantalla` usa el
  mismo trayecto; el informe también. Textos honestos: «trayectos por los cables del mapa… el cable exacto que usó tu conexión no se conoce desde fuera».
  Prueba sin navegador: `node scratchpad/prueba-red.js` (Cartagena→Fráncfort ×1,21, Sídney ×1,26, Singapur ×1,11; 200 ms en total).
- **Rendimiento (23h, 19:10)**: `aVista` en orbita.js cachea los senos/cosenos de la vista (`VC`); capas.js tiene `campo(p,G)` (casquete visible: dirección `d`, ángulo `ang`, `todo` si cabe el planeta entero), `capsDe(l)` (casquetes por tramos de 24 vértices, cacheados en `l.caps`/`l.cap`), `veCap`, y `pintaLineas`/`pintaFibra`/`pintaPuntos`/`posiciones`/`pintaExtremos`/`pintaLuz` saltan lo que no toca el casquete. De 162 ms a ~10 ms por fotograma a ×300 sobre París.
- **Rueda sobre paneles** (18:16): la rueda solo hace zoom si el objetivo es un canvas o el body; sobre cualquier panel, desplaza el panel.
- **«Mi conexión»** (conexion.js) con **«Por dónde viajan tus datos»**: mide desde el navegador la ida y vuelta a 33 regiones AWS (`NUBES`) y al borde más cercano
  (Cloudflare `cdn-cgi/trace`, `colo=` → tabla IATA); `fetch(no-cors, cache:no-store)` sin `redirect:'manual'` (rompe); calentamiento + 3 sondas, mínimo;
  mínimo físico = 2·km/200 ms. Dibuja los arcos (los 3 mejores brillantes, pulso a ms×20). Desde el PC del dueño: borde BOG ~70 ms, Ohio 74, Virginia 64–84…
- **«El viaje de tus datos»** (viaje.js, nuevo hoy; solo PC): secuencia automática sobre el planeta — intro, **constelación** (los 32 arcos aparecen del más
  cercano al más lejano mientras la cámara gira 40°, etiquetas sin choques), un **vuelo por continente** (el más rápido de cada uno, ≤ 6: cámara al punto medio
  del arco, estela con cabeza brillante, contadores km/ms, **carrera contra la luz**: un segundo punto marca dónde iría la luz en línea recta y «la luz ya habría
  llegado»; al llegar «La luz en línea recta tardaría X ms · tus datos han tardado +Y ms sobre ese mínimo (×Z)»), y **final** con el planeta girando despacio,
  «Así viajan tus datos», cifras y la escala humana («en lo que dura un parpadeo (unos 150 ms) tus datos van y vuelven de N de ellos»).
  Botones: «Guardar el viaje (PDF)», «Descargar vídeo (N MB)», «Verlo otra vez», «Volver a Órbita». Esc sale.
  - **Vídeo**: `canvas.captureStream(30)` + MediaRecorder (mp4/avc1 si lo hay, si no webm) sobre un lienzo que compone estrellas+tierra+rutas y los textos del HUD
    (`cuadroGrabado`, enganchado en `window.OrbitaDespues`, que orbita.js llama tras `pintaRutas`). ≈ 11–13 MB por viaje. Descarga con `<a download>`.
  - **Informe** (`informe()`): artículo `#informe` a pantalla completa — **dos caras del planeta** (ortográfico centrado en ti + la cara opuesta, arcos elevados
    recortados en el horizonte), cifras, **brújula de tiempos** (rumbo real, raíz cuadrada de los ms, anillos 50/100/200/400), «Qué significa» / «Cómo se ha medido»,
    **la luz contra la realidad** (barras mínimo vs medido), **distancia frente a tiempo** (dispersión con la línea del mínimo físico), tabla, pie
    «Son tus datos y de nadie más…». «Guardar PDF» = `window.print()` con `body.imprime-informe` (el usuario elige «Guardar como PDF»).
  - Durante el viaje capas.js no pinta nombres de país (`soloTu && body.viaje`); el marcador de casa y su etiqueta son los de orbita.js (no duplicar;
    conexion.js tampoco pone etiqueta «Tú», solo el pulso; las etiquetas brillantes buscan línea libre ±14/±28 px).
- **Arreglos de UX del dueño (22 Oct, 17:50–18:10, versiones 23a–23e)**: tarjeta «Ahora mismo» fija al tocar el punto (`fija()`, ‹ atrás), indicador de altura
  despegado del borde (`5+90·log`), el planeta no vuelve a girar solo tras tocarlo (`manual`), cables previstos se iluminan al pasar (`previstoMarcado`),
  anillo «circulito» en los extremos de cables/fibra/llegadas desde ×4 (`pintaExtremos`), mapa **siempre de día** (`SIEMPRE_DIA`, uniforme `uSiempreDia`),
  el filtro de satélites no marca lo de detrás (`UI_ENCIMA`), centros de datos apiñados en abanico desde ×60 (`posiciones`/`ABANICO`, celdas 4 px),
  el panel completo se abre junto al clic y entero (`abrePanel(m,x,y)`, `.suelto`), fibra terrestre por rango (`rangoFibra`: ≥600 km troncal / ≥250 / local, grosores).
- Puerta ZERO abre la demo `zero/?orbita=1&entrada=0`; el programa puede mandar `postMessage({tipo:'orbita-ruta', ruta:[…]})` para pintar su traceroute real
  (`OrbitaConexion.ruta`).

## 4. La agencia (cómo se trabaja con ChatGPT, Grok, Gemini)
- Pestañas del navegador integrado: ChatGPT (`seed`; **chat nuevo «Guion visual 3D»** https://chatgpt.com/c/6ada79f7-4158-83e9-af6b-27be8adcf2b9 — el anterior
  «Lista cables submarinos África» llegó al límite de longitud; cuadro `#prompt-textarea` o `[contenteditable=true]`), Grok (`tab-3`, conversación «Verificación
  independiente de cables submarinos», modo Expert, cuadro `ref_247`), Gemini (`tab-1`; **se niega a casi todo**, no contar con él).
  Para escribir: enfocar y `document.execCommand('insertText', false, texto)` desde `javascript_tool`, luego tecla Return. Para leer respuestas largas con la
  pestaña en segundo plano `innerText` se agota: traer la pestaña al frente (`tabs_select`) y recorrer nodos de texto con un TreeWalker a partir del marcador del prompt;
  en Grok, las líneas que empiezan por `[{"nombre"` o los bloques `pre, code`.
- Esquema JSON por cable: `{"nombre","llegadas":[{"lugar","pais","lat","lon"}],"anio","km","duenos":[],"fuentes":[]}`.
  Respuestas en `herramientas/cables-agencia/<voz>-<zona>-<n>.json` (voces por prefijo: `chatgpt`, `grok`, `claude`, `gemini`). Comprobadas a mano: `confirmados.txt`.
- Cruce: `python3 herramientas/cables_agencia.py && python3 herramientas/lugares_capas.py && python3 herramientas/capacidad_cables.py` (3–5 min) →
  `orbita/datos/cables-agencia.json`, `cables.json`, `lugares-capas.json`, `cables-capacidad.json`. Imprime «aceptados» y «solo lo nombra X» (pendientes).
- Capacidades: `herramientas/cables-capacidad/<voz>-*.json` (`[{nombre, tbps, pares, fuente}]`, nombre exacto del grupo de `lugares-capas.json`); mayoría de voces
  dentro del 30 % (dos de tres bastan) o `cables-capacidad/confirmados.txt`. Hay claude (49), chatgpt (75), grok (17+40+36+36). Las discrepancias (p. ej. SEA-ME-WE 4: chatgpt 4,6 / grok 122) se quedan fuera hasta una tercera voz.
- Estado: **278 cables confirmados**; **34 de una sola voz** (lista en la salida de `cables_agencia.py`). Tandas de Grok `grok-verifica-1..9` cruzadas (Grok a veces responde un objeto por línea o varios seguidos sin corchetes: quitar saltos de línea, insertar comas entre `}{` y envolver en `[]`; descartar las llegadas con coordenadas «de país»). Quedan 34 de una sola voz (muchos son alias o ramales).
  Desde hoy `clave()` ignora las palabras genéricas (submarine, subsea, cable, system, fiber, network, project, domestic…): «KetchCan1» y
  «KetchCan1 Submarine Fiber Cable System» son el mismo cable. Añadidos alias EIG, GBI, OAC.
- Ideas de la agencia para el viaje ya aplicadas: aparición progresiva de arcos con giro de cámara (Grok), carrera de dos pulsos luz/medido y escala humana del
  milisegundo (Grok, ChatGPT), leyenda permanente «conexiones medidas, trayectorias ilustrativas» y dispersión km/ms con la línea de la fibra (ChatGPT).
  También la gráfica de ms de más por continente (ChatGPT), ya en el informe.
- Licencias comprobadas: **PeeringDB no se puede usar** (AUP), IXPDB sin licencia clara, OONI solo no comercial, Ookla/Cloudflare Radar/OpenCellID no comerciales.
  Sí: ETOPO/GEBCO/USGS/Banco Mundial/RIPE Atlas/M-Lab.

## 4b. Tarjeta «Ahora mismo» (datos-curiosos.js), noticias y «¿Sabías que…?» (22 Oct 2026, 17:15–17:30)
- El dueño pidió: rankings (los que más y los que menos), que los datos se renueven siempre, noticias relacionadas con GUARDIANA/datos/comunicaciones
  «siempre, siempre al día», arrancar con «¿Sabías que…?», y una investigación profunda de cables (dueños, alquiler, costes, antiguos/modernos, proyectos,
  públicos/privados, torres) como datos curiosos: «eso es oro puro».
- Hecho: la tarjeta baraja los datos en cada vuelta (`rellena()`), entrelaza los del equipo, y la mitad de los del mundo llevan la etiqueta «¿SABÍAS QUE…?».
  Rankings calculados del mapa: país con más cables / centros de datos, empresa que opera más cables, países con un solo cable, cable más potente, tramo más
  hondo, más largo, más antiguo, más moderno, países con 10G. Del equipo: «países que más datos reciben de tu equipo» (medido; en la web, EJEMPLO).
  **No existe ranking verificable de «países que compran/venden datos»: no se inventa**; lo honesto es a dónde van los datos del propio equipo.
- `orbita/datos/noticias.json`: noticias con dos fuentes (campos fecha, tema, es/en/pt, fuentes); en pantalla «NOTICIA · ¿SABÍAS QUE…?» y «Noticia verificada · dos fuentes».
  **Tarea programada «Noticias Órbita (GUARDIANA)»** (id `trig_016bgAVZovsMq3wBuUESmpqN`, cada día a las 7:41 de Bogotá, aprobación automática): una sesión
  nueva clona el repo, busca noticias de la semana, exige dos fuentes, añade a noticias.json y publica en web-idiomas y main. El dueño no tiene que hacer nada.
- `orbita/datos/sabias.json`: **121 «¿Sabías que…?» verificados** (lote 1: 35; lote 2: 40 — dueños, IRU, antiguos, costes, públicos/privados, Egipto, cortes, barcos, torres, centros de datos; historia: 19 — primer cable 1850, 1858/1866, 1861, 1870, 1872, 1902, 1943, 1956, 1964, 1985, 1988, 1989, 1996; lote 3: 27 — satélites, 5G, fabricantes, récords, DNS, tráfico, energía, latencia). Verificaciones en `herramientas/sabias-agencia/*-verificacion.txt` (ChatGPT redacta 40 → `herramientas/sabias-agencia/chatgpt-sabias-1.json`; Grok verifica →
  `grok-sabias-1-verificacion.txt`; entran los que pasan, `voces: [chatgpt, grok]`). Tarjeta: `sabia()` (fijo, etiqueta «¿SABÍAS QUE…?») y `noticia()` (más nuevas,
  más probables) en cada vuelta. Lotes 2 y 3 e historia hechos. Siguientes lotes posibles: cables por región (África, Pacífico, Ártico), centros de datos récord por país, fibra terrestre (RailTel, Lumen, China Telecom),
  ciberseguridad de la infraestructura (cortes, reparaciones), espacio (estaciones terrenas, Deep Space Network).
- La **tarea de noticias ya se ejecutó una vez a mano** (sesión cse_01QJZrcY2qdxAmghLwn69sei): 11 noticias. Tras cada ejecución diaria hay que traer
  `orbita/datos/noticias.json` de origin/main a web-idiomas (`git checkout origin/main -- orbita/datos/noticias.json`).
- Lo de la subasta (quién paga por los datos) NO va en el viaje 3D: será un capítulo aparte del informe cuando se genere desde el programa (dueño de acuerdo, 17:10).

## 4c. Puntos de intercambio (IXP) por la agencia
- `herramientas/ixp-agencia/chatgpt-ixp-1.json` (212 IXP de ChatGPT) y `grok-ixp-1..4.json` (las cuatro tandas verificadas por Grok): **160 IXP de la agencia**
  ya en `puntos-extra.json`. **Lote 2 hecho**: `chatgpt-ixp-2.json` (82) + `grok-ixp-5.json` y `grok-ixp-6.json` (Grok en dos tandas de 41, formato una línea JSON por IXP
  con `estado`; Claude dejó «no verificado» RUDAKI-IX, PITER-IX Kiev e ixFabric Kyiv) → **225 IXP de la agencia**. Grok con tandas >45 falla («no pudo terminar»); pedir en dos mitades.
- **Centros de datos por la agencia (nuevo, 22 Oct 19:50)**: `herramientas/centros_agencia.py` (copia de ixp_agencia.py: lee `herramientas/centros-agencia/<voz>-*.json`
  `[{nombre, operador, ciudad, pais, lat, lon, desde, nota}]`, ≥2 voces en el mismo país a <30 km, no duplica OSM a <600 m, escribe tipo `datos` con `agencia:true` en
  puntos-extra.json). **Primera lista ya guardada**: `herramientas/centros-agencia/chatgpt-centros-1.json` (130 centros de América Latina, ChatGPT; coordenadas a nivel de ciudad, nota vacía).
  **Hecho (22 Oct 20:10, Opus)**: Grok verificó las 130 en 4 tandas (la 3.ª de 42 falló; en dos de 21 sí) → **95 centros de América Latina** en el mapa;
  35 descartados (30 ya estaban en OSM, comprobado uno a uno; Cirion RIO2 y KIO MER2 «no verificado»). La regla de duplicados ya no usa la distancia
  (la agencia da a menudo las coordenadas de la ciudad): mismo nombre, mismo código del mismo operador, o el único de ese operador en esa ciudad (ver `repetido()`).
  **Europa hecha (22 Oct 21:00)**: `chatgpt-centros-2.json` (121) y `-3.json` (85) + `grok-centros-2.json`/`-3.json` → **169 centros de la agencia** en total.
  Método que funciona: (1) ChatGPT da la lista; (2) simular con una copia (CARPETA/DATOS a una carpeta temporal, la misma lista como «grok») para ver
  cuáles NO están ya en el mapa; (3) mirar a mano lo que OSM tiene en cada ciudad (nombres antiguos: Interxion, Lamda Hellix, Telepoint, DEAC/Delska,
  Euclyde→nLighten…) y vetar duplicados en `herramientas/centros-agencia/vetados.txt` («nombre|país  # motivo»; Claude como tercera voz);
  (4) mandar a Grok solo los que quedan, en tandas de 23; (5) correr el script y publicar. Coordenadas: gana la de edificio (≥5 decimales), si no la de ChatGPT.
  **Hecho también (22 Oct 21:50)**: Norteamérica (`chatgpt-centros-4` + `grok-centros-4`), Asia y Oriente Medio (`-5`), África y Oceanía (`-6`)
  → **314 centros de la agencia**. Pendiente: tanda Asia-2 (China, Rusia, Asia central, Sudeste asiático restante) ya pedida a ChatGPT en el chat
  «Verificar fichas de infraestructura» https://chatgpt.com/c/6ada832b-0b94-83e8-ab23-e58008ece741 (recoger, guardar como `chatgpt-centros-7.json`, mismo método).
  La pestaña tab-1/seed ahora tiene otro chat (evaluación de seguridad); volver a esos chats por su URL.
  Procedimiento de verificación: pedir a Grok (tab `seed`) la verificación en tandas de ≤21 con el formato «una línea JSON por centro {nombre, ciudad, pais, lat, lon, estado}» (estado ok / cerrado /
  no existe / es otra cosa / no verificado; pedir lat/lon del edificio si las conoce), guardar en `grok-centros-1.json` (claves en español; Grok a veces responde con
  name/city/country: convertir), correr `python3 herramientas/centros_agencia.py`, publicar. Después, la misma lista para Europa, Norteamérica, Asia, África y Oceanía.
  Comprobar antes que capas.js pinta los `datos` de puntos-extra con su ficha (operador, desde, nota): buscar `agencia` en capas.js. `python3 herramientas/ixp_agencia.py` cruza por país+nombre (≥2 voces, <60 km), descarta los que
  Grok marca «es otra cosa» (p. ej. Equinix Ashburn/Paris no son IXP neutrales), evita duplicar los de OSM y los escritos a mano, y escribe en `datos/puntos-extra.json`
  tipo `intercambio` con `agencia: true`. capas.js ya los pinta con la capa de centros de datos.

## 5. Porcentaje de «mapa completo» (estimación dada al dueño)
Cables submarinos ~70 % · llegadas ~80 % · centros de datos ~25–35 % · puntos de intercambio <1 % · fibra terrestre ~45 % · satélites ~95 % · polos ~90 %.
Conjunto ~55 % (puntos de intercambio ya ~40 % con los 160 de la agencia). Orden acordado: (1) centros de datos, (2) puntos de intercambio, (3) terminar cables con la agencia, (4) fibra de países grandes.

## 6. Pendiente inmediato (por orden) — escrito para Opus 5.5 (22 Oct 2026, 19:50; el dueño cambia de modelo para ahorrar Fable)
6.1 **Antes de nada**: `git status`; si hay cambios sin publicar, publicar (§2). Nada quedó a medias en el navegador (la lista de centros de datos ya está guardada, §4c).
6.2 **Fichas de país, procedimiento exacto** (lo que se hizo en los lotes 5–12): en `tab-5` (chat «Verificar fichas de infraestructura») escribir en el cuadro
    «Pregunta a ChatGPT» (`find` → ref) con `form_input`, clic y Return: «Gracias. Mismo esquema y reglas para 15 fichas más: XX, YY… Devuelve SOLO el JSON.»
    Esperar 2–4 min (poll con `javascript_tool`: innerText de `main` desde el último «ChatGPT dijo», JSON entre el primer `{` y el último `}`; en segundo plano el
    innerText se corta mientras genera, esperar a que termine). Guardar la respuesta tal cual en `herramientas/paises-agencia/chatgpt-paises-N.json`, revisar como
    segunda voz (Claude): quitar las fechas de 2026 y los lanzamientos que solo dé ChatGPT (sustituir por «en despliegue inicial» / «sin lanzamiento comercial
    generalizado»), quitar `novedades` salvo las que no lleven fecha, quitar frases que citen «Internet Society Pulse 2026», y fusionar en `orbita/datos/paises.json`
    con `confirmado:true, voces:['chatgpt','claude']` y una línea en `nota`. Publicar en las dos ramas.
6.3 Centros de datos por la agencia (§4c), país por país empezando por América Latina y Europa; después IXP y centros de Asia.
6.4 Lo demás como estaba (abajo). Las traducciones a los otros 39 idiomas siguen siendo lo último.
1. Que el dueño pruebe «El viaje de tus datos» en su PC (Mi conexión → Medir rutas → «Ver el viaje en 3D» → «Descargar vídeo» y «Guardar el viaje (PDF)»)
   y afinar lo que pida. Posible: sonido; elegir resolución del vídeo.
2. **Ficha de país**: **hecho, 195 países y territorios** (lote 13 el 22 Oct 20:00). Antes: seguir por tandas de 15 (ahora ChatGPT escribe en el chat «Verificar fichas de infraestructura»
   https://chatgpt.com/c/6ada832b-0b94-83e8-ab23-e58008ece741 y Claude revisa como segunda voz; guardar en `herramientas/paises-agencia/chatgpt-paises-N.json` y fusionar).
   Campos: `movil`, `operadores`, `fija`, `diez` (10G), `troncales`, `intercambio`, `novedades`.
3. Capacidades: pedir a Grok el resto de la lista; cables de una sola voz: **20** (`grok-verifica-10/11.json` resolvieron SPCS, Austral, MARS, Latvia–Sweden 1, Circe South,
   Qatar–UAE, AU-West, ITAL-CRO, NO-UK/Englandskabelen vía alias). Grok falla con >10 cables de golpe → tandas de 8, exigiendo lat/lon de la localidad de amarre.
4. Centros de datos: `datos_orbita.py` hace ahora dos consultas Overpass (telecom=* y building/office/industrial/man_made=data_center, ~1.300 edificios más).
   El workflow tiene entrada `forzar` (`gh workflow run datos-orbita.yml --ref main -f forzar=true`) que vuelve a descargar los puntos; el push a main NO dispara el workflow
   (solo la rama orbita-datos). **Hecho** (run 39868036356, 22:52Z): overpass-api.de dio 502 y respondió un espejo; 4.467 puntos (4.388 datos: los 1.139
   edificios se fundieron casi todos con los nodos telecom; +50 nombres nuevos, ninguno perdido). `orbita/datos/puntos.log` guarda la salida. Ya traído a web-idiomas.
5. Puntos de intercambio: hecho (160). Siguiente: pedir a ChatGPT/Grok IXP de África y Asia central que faltan.
6. Traducir a los 39 idiomas restantes las claves nuevas (solo en es/en/pt dentro de `idioma.js`): polos, incidencias, país, capacidad, profundidad, rutas,
   ficha completa, viaje e informe.
7. Capas futuras propuestas por la agencia: terremotos (USGS), regiones de nube, latencia RIPE Atlas, DNSSEC por país, caídas conocidas.
8. Costas finas para el zoom profundo (opcional, grande): teselas vectoriales de OSM land polygons generadas en el workflow.

## 7. Archivos clave
`orbita/index.html` · `orbita/static/orbita.js` (planeta, zoom, altura, API `OrbitaPlaneta`, gancho `OrbitaDespues`) · `orbita/static/capas.js` (capas, fichas,
panel completo, país, estaciones, notas, potencia, relieve) · `orbita/static/conexion.js` (Mi conexión, rutas) · `orbita/static/viaje.js` (viaje, vídeo, informe)
· `orbita/static/idioma.js` + `i18n/` · `orbita/static/orbita.css` · `orbita/datos/*.json` · `herramientas/cables_agencia.py`, `lugares_capas.py`,
`capacidad_cables.py`, `relieve.py`, `datos_orbita.py`, `fibra_tierra.py`, `cables-agencia/*.json`, `cables-capacidad/*.json`, `informes-agencia-polar.md`.

## 7. Sesión del 22 Oct 2026, 21:00–21:50 (Fable 5.1 de nuevo): cambios de Órbita y documento de estrategia
- **Clic + zoom**: un clic (sin arrastrar) en el planeta guarda el punto (`foco` en orbita.js, `geoDe()` = inversa de `pantalla`); cada zoom de entrada
  (rueda, pellizco, +, teclado, doble clic) pone `meta` hacia ese punto y la vista se desliza allí. Arrastrar o volver a ×1 olvida el foco. (v=…j)
- **Fibra por niveles** (capas.js `preparaNiveles`/`fundidoNivel`/`fibraVisible`): nivel 3 (≥800 km o corredor con ≥4 compañías y ≥250 km) siempre;
  2 (≥400 km o ≥3 compañías y ≥150 km) desde ×1,5; 1 (≥150 km) desde ×2,6; 0 (resto) desde ×6; cada nivel se funde al entrar. De lejos, una línea por
  corredor. `buscaFibra` solo elige entre lo dibujado. Nota de la capa actualizada (es/en/pt). (v=…k, …l)
- **Barra de capas**: ya no desaparece en `hondo` (≥×8): se queda difuminada y se enciende al pasar el ratón (orbita.css). (v=…k)
- **Llegadas**: «cable sin nombre» → «cable, nombre no publicado» / «+N». (v=…m)
- **Documento de estrategia** (Claude Docs): «GUARDIANA: las puertas de tu equipo» https://claude.ai/artifact/JVYczV8kMrHGuYXxaKfjPf — tesis de las diez
  puertas, familia de seis piezas (ZERO, VIGÍA, RADIOGRAFÍA, ÓRBITA, SECURE, TRANSPARENCIA), doce servicios nuevos, capa anti-suplantación, reglas de ZERO,
  viralidad, calendario propuesto y lo que dijo la agencia (chats: ChatGPT https://chatgpt.com/c/6adabe5b-3dbc-83e8-8a92-736412839b21 ·
  Grok https://grok.com/c/d2e135ed-cd4f-429c-abd4-d4749bf04786). El dueño lo está leyendo; sus comentarios llegan como comentarios del documento.
- Pendiente de la noche: tanda Asia-2 de centros de datos (pedida a ChatGPT en «Verificar fichas de infraestructura»); el dueño pidió además que el
  navegador ZERO sea «el que más para» (reglas en el documento) y la anti-suplantación en SECURE (órdenes firmadas, verificación en persona, Sello).

## 8. Para Opus (22 Oct 2026, 21:50; Fable se agota): lo último publicado y lo que queda a medias
Publicado esta noche (versiones `?v=20261023j…q`): zoom hacia el clic; fibra por niveles con fundido; barra de capas siempre visible (difuminada, viva al
pasar el ratón); «cable, nombre no publicado»; cursor de flecha y mano solo sobre lo que tiene ficha (`body.mano`, `pintaMano()` en capas.js);
**troncales gigantes ya no blancas**: núcleo azul acento (`ACERO`) pintado sin brillo aditivo (`opaco()`), halo azul claro (`CLARO`); todo resaltado
(cable, llegada, previsto, fibra) en su propio color con halo (`resalta()`), nunca blanco. Pendiente de comprobar en pantalla tras el último deploy (×5,5
sobre Portugal): si aún se ven blancas, bajar la alfa del halo o el ancho; el dueño dijo «los azules muy logrados, los blancos no me gustan».

**Siguiente tarea pedida (21:48): desplegables de clasificación en cada botón de capa** («le da cable submarinos y se le abre un desplegable y los
clasificamos; fibra por tierra lo mismo; centros de datos lo mismo; satélites igual»). Ya existe el patrón para satélites: `#sat-vista` cuelga bajo el
botón (pintaVista/enganchaVista en capas.js, con botón «—» para plegar y el botón de la capa lo vuelve a desplegar). Hacer lo mismo, genérico, para:
- **Cables submarinos** (`estado.subClases`): troncal gigante (≥100 Tbit/s), troncal grande (≥20), cable regional (con capacidad publicada), sin
  capacidad publicada, trazado aproximado (los discontinuos, `capas.sub.aprox`), previstos (`PREV`). Aplicar en el bucle de dibujo (porPotencia: separar
  ex[0] en «regional con dato» y «sin dato»), en `pintaLuz`, en `buscaCable`/`buscaPrevisto` (no elegir lo oculto). Contador por clase junto al nombre.
- **Fibra por tierra** (`estado.fibraClases`): troncal principal (nivel 3), largo recorrido (2), nacional (1), regional (0), en construcción (`x.obra`).
  Aplicar en `fibraVisible` (meter las clases en la clave de caché `paso`) y en el bucle de `pintaFibra`.
- **Centros de datos** (`estado.puntosClases`): centros de datos (PT.p), puntos de intercambio (PT.ix), estaciones polares y terrestres (EST), y un
  interruptor «solo grandes operadores» (≥5 centros en el mapa, `PT.porOp`). Aplicar en `posiciones`/`pintaPuntos`, `pintaEstaciones`, `buscaPunto`,
  `buscaEstacion`, y en los centros de la agencia (`q.extra`).
- **Satélites**: ya está (órbitas + vista); unificar el estilo de la tarjeta con las nuevas (misma clase CSS `.sat-vista`, renombrar a `.capa-vista`).
Reglas: todo encendido por defecto; la última clase encendida no se puede apagar (se apaga la capa); guardar en `guarda()`; textos en es/en/pt
(idioma.js); la tarjeta se cierra con «—» y al pulsar fuera no se cierra (como la de satélites); la nota de la capa (`pintaNota`) dice qué se muestra.

### 8.1 Hecho después (22 Oct 21:55, versiones …r y …s) y lo que pidió el dueño al final
- **Desplegables de clasificación: hechos** (`CLASES`, `TEXTOS_CLASES`, `enganchaClases`/`pintaClases` en capas.js; tarjetas `#sub-vista`, `#fibra-vista`,
  `#puntos-vista` con la misma clase CSS `.sat-vista.capa-vista`). Una sola tarjeta abierta a la vez; ninguna al llegar; se abre al pulsar el botón de la
  capa; «—» la pliega. Filtros aplicados en dibujo y en selección (veSub/veFibra/vePunto). Satélites sigue con su tarjeta propia (`#sat-vista`).
  Falta: comprobar en móvil (<760 px la tarjeta no se recoloca) y el contador de «Solo grandes operadores» (cuenta operadores, no centros).
- **Doble clic**: pasos 2,5 → 5 → 10 → 25 → 80…; va al punto del clic. Funcionaba ya (probado con doble clic real); el dueño quizá no había recargado.
- **Puertas de sección** (ZERO/Radiografías/Comunicaciones): desaparecen a partir de ×3 (`body.explorando`) y vuelven al alejar.
- **Nombres de país**: solo con el planeta «limpio» (gris), nunca con el planeta en color (`pintaPaises` sale si `!esLimpio()`).
- **Pedido pendiente (21:53): datos curiosos en «¿Sabías que…?»**: cuántos km de cable submarino hay en el mundo, cuántos de fibra por tierra,
  cuánto pesarían juntos, cuánto han costado aproximadamente. Lo del mapa ya está (242.193 km de cable submarino medidos en el mapa, 1.897.837 km de
  fibra por tierra en el mapa: `FT.d.medida`). Lo del mundo real (km totales, peso, coste) hay que pedirlo a la agencia (ChatGPT + Grok, ≥2 voces,
  sin fuentes en pantalla) y meterlo en `orbita/datos/sabias.json` con el mismo formato que los 121 que hay; nunca inventar cifras.

## 9. Sesión del 22 Oct 2026, 22:05–22:45 (Opus 5.5), versiones 23y → 24b
- **Desplegables compactos**: solo nombre y cuenta; la explicación va en el `title` (al pasar el ratón). CSS `.capa-vista/.sat-vista .orb button .d {display:none}`.
- **Interruptores verde/rojo** (al final de orbita.css, bloque «22:21»): el `<i>` de cada botón con `aria-pressed` es una pista con bola; encendido
  `--si: 95,203,147` con ✓, apagado `--no: 224,122,108` con ✕ (SVG en data URI). Barra 23×13, tarjetas 26×15. Deben ir AL FINAL del CSS (las reglas
  viejas del punto azul tienen la misma especificidad).
- **Satélites**: la última órbita encendida ya se puede apagar → `pon('sat', false)` y las órbitas vuelven a {geo} para la próxima vez.
- **Borde del planeta**: el halo empezaba de golpe en r=1 (`r>1.?…:0.`) y dejaba una muesca oscura escalonada; ahora `d0=max(r-1,0)` continuo. Mapas con
  mipmaps + anisótropo (`mipea()`), y el sombreador usa `texture2DGradEXT` con gradientes sin costura (`fract(uv.x+.5)`) si hay OES_standard_derivatives +
  EXT_shader_texture_lod (`MIP`); si no, como antes. Comprobado sin GPU (swiftshader): antes/después en el borde.
- **Zoom anclado** (orbita.js `ancla`, `anclaEn`, `fijaAncla` tras `avanzaVista`): doble clic y rueda (al acercar, con el puntero sobre el planeta) dejan
  el punto bajo el puntero quieto mientras dura el zoom (8 iteraciones lon/lat por cuadro). Los botones +/teclado siguen yendo al `foco` del clic.
- **Ficha completa**: `encajaPanel()` (capas.js) sube la ficha suelta al desplegar secciones y limita su `max-height` a la pantalla.
  «Qué significa para ti» → **«En la práctica»**; frase del país nueva (es/en/pt).
- **ZERO**: `zero/index.html` llama `layout()` nada más definirlo (antes solo tras montar WebGL: se veía el escenario 1440×900 sin escalar, «de lado»).
  En `body.pantalla` la sección entra con un fundido limpio (sin escala ni desplazamiento) y `.altura` desaparece al instante al entrar en una puerta.
- **Ubicación** (ChatGPT y Grok coinciden; chat ChatGPT «Redacción UX de privacidad» https://chatgpt.com/c/6adad5c8-6f30-83e9-af18-2870cab2663c,
  Grok https://grok.com/c/21a76627-5150-49d5-a01f-873b64655859): sin «no investigamos» (suena defensivo). Kicker «TU UBICACIÓN, TU DECISIÓN» y texto
  «Es opcional: Órbita funciona sin ella…». El chat viejo de ChatGPT «Verificar fichas de infraestructura» llegó al máximo de longitud: usar chats nuevos.
- **«¿Sabías que…?»**: 5 datos nuevos en verificación con las dos voces (99 % del tráfico internacional; >500 cables y ~1,7 M km según la ONU 2026;
  ~2 cm de diámetro / ~5 cm blindado; ~650 kg/km ligero, >2 t/km doble blindaje; Amitié 400 Tbit/s).
- Pendiente: Asia-2 de centros de datos (42 candidatos) con Grok en dos tandas de 21; IXP de África y Asia; cables de una sola voz (20); capacidades;
  fibra de países grandes; traducciones a los otros idiomas al final.

## 10. Sesión del 22 Oct 2026, 22:45–23:30 (Opus 5.5): agencia sin pedir permiso («sigue trabajando»)
- **Semáforo**: al encender una capa, todas sus clases en verde (`pon()`); la tarjeta solo se cierra cuando TODOS sus interruptores están en rojo
  (`todasApagadas`); «Solo las grandes compañías» pasó a ser la clase «Compañías pequeñas» (`CLASES.puntos.pequenos`, verde = se ve; en gris si
  «Centros de datos» está apagado: `cuentaEn`). Satélites: al encender, las tres órbitas.
- **Centros de datos Asia-2**: 42 confirmados (ChatGPT `chatgpt-centros-7` + Grok `grok-centros-7`) → **356 de la agencia**. Grok rellena con 5
  decimales las coordenadas de la ciudad: Claude las dejó a 3 decimales en el archivo de Grok cuando eran el centro de la ciudad (si no, ganarían como
  «edificio» en `centros_agencia.py`).
- **Cables: un cable, un grupo** (`lugares_capas.py` agrupa con `cables_agencia.clave`; `compacta` quita tildes): «ACE» = «Africa Coast to Europe (ACE)»,
  «Sam-1» = «South America-1 (SAm-1)», «EIG», «H2HE», «PCCS», «PLCN», «SJC», «BRUS/BRUSA», «ÍRIS/IRIS», «Amitié» (OSM «AMITIE»)… → 467 → **450 cables**.
  Nombre del grupo unido: el de la agencia; si no, el más largo. Alias nuevos: `australtroncalaustral→austral`, `mauritiusandrodrigues→mars`.
- **Una sola voz**: Grok (`grok-verifica-12.json`) confirmó FOA y MARS (ya estaban con otro nombre: unidos por alias); ALASIA, Elektra-GC1 y Leif Erikson
  no existen (proyectos); Rioja y ESAT-1 retirados; SFS-4, SFL, EESF-3 sin verificar; Balticconnector FOC, Tampnet, C-Lion1, Eastern Light, Baltica,
  AU-East/West ya están en el mapa con otro nombre. Pendiente solo North Sea Connect (pedido a ChatGPT junto con capacidades).
- **Capacidades**: Grok `grok-capacidad-6`, ChatGPT `chatgpt-capacidad-2` (Amitié 400) y `-3` (38 cables); la 2.ª tanda de ChatGPT (39) en el chat
  «Verificación de cables submarinos» https://chatgpt.com/c/6adadd4e-67ac-83ea-a97b-383cc11c0ff1.
- **IXP África y Asia**: ChatGPT dio 70 nuevos (`chatgpt-ixp-3.json`, chat https://chatgpt.com/c/6adada8b-f2b0-83e8-a872-203b6b08837b); Grok verifica en dos
  tandas de 35 (`grok-ixp-7.json` hecho: 33 ok, LANIC «es otra cosa», GIBIRIX «no verificado»).
- **Hecho después (23:20–23:40)**: IXP de la agencia **256** (`grok-ixp-7/8.json`); capacidades **113 cables** (32 gigantes ≥100 Tbit/s, 42 grandes)
  con `chatgpt-capacidad-3/4.json`; discrepancias que siguen fuera hasta una tercera voz: SEA-ME-WE 4, ACE, MainOne, AEC-1, FA-1, BBG, EAC, MENA,
  Japan-US, FALCON, HAWK, FNAL, MAYA-1, Americas-II, Svalbard, CANTAT 3, PPC-1, AKORN, AU-West.
- **Vista previa para el amigo de Praga** (artefacto privado «GUARDIANA · Órbita», https://claude.ai/artifact/2ofNX33VVYed7qwqDxSrqa, compartido por el
  dueño): se reconstruye con `python3 herramientas/vista_previa.py <carpeta>` y se publica con la herramienta Artifact (mismo `url`, `root` = carpeta,
  `files` = las rutas; `ciudades.tsv` con contentType text/plain; solo hay que mandar los archivos que cambian, los demás se conservan). Versión 13.

## 11. Cierre de la noche del 22→23 Oct 2026 (Opus 5.5): cables previstos, traducciones y copia
- **Cables previstos**: `datos/cables-previstos.json` pasa a 19 (14 nuevos con `chatgpt-previstos-1.json` + Grok): Candle, Humboldt, Sol, Synapse,
  AUG East, ALC, I-AM, I-2SEA, APX East/West, Hawaiki Nui 1, Honomoana, Umoja, Pisces. Fase y año solo donde coinciden las dos voces; sin km.
- **Traducciones**: los 190 textos nuevos de `idioma.js` están ya en los 39 `static/i18n/<código>.json` (791 claves cada uno, 0 vacías).
  Clave nueva `máxima` para la línea «Altitud del terreno: máxima N m · media N m» (antes usaba «hasta», que en varios idiomas solo vale para «hasta destino»).
  `idioma.js` pide el fichero de idioma con la versión de la página (`?v=…`), para que nadie lea traducciones viejas de la caché.
  Siguen abiertos al público solo **es** y **en** (decisión del dueño); los otros 40 se abren con `data-idiomas="todos"` en `<html>`.
  Las plantillas «p» (frases con números) ya estaban traducidas; no se tocaron.
- **Versión** de Órbita: `v=20261024h` (la siguiente, `i`). Vista previa del amigo: **versión 15**.
- **Copia del proyecto** para pasarlo a otra nube: zip de la rama `web-idiomas` sin `descargas/` ni `v/` (enviado al dueño en el chat). Todo está también
  en GitHub, en las dos ramas.
- **Lo que queda** (por orden): tercera voz para las 19 capacidades en discrepancia; fibra terrestre de los países grandes; más centros de datos e IXP
  por regiones (Asia, África); revisar con el dueño cuándo abrir los 40 idiomas.

## 12. Mañana del 23 Oct 2026 (Opus 5.5): capacidades, fibra de países grandes y viaje en 3D a la vista
- **Capacidades**: tercera voz con fuentes (Claude, `cables-capacidad/claude-capacidad-2.json`, cada cifra con URL del operador, el fabricante,
  la FCC o prensa del sector; nada de TeleGeography). 113 → **127 cables** (SEA-ME-WE 4 122, Firmina 240, BBG 55, MainOne 10, HAWK 20, PPC-1 12…).
  Siguen fuera, sin acuerdo: CANTAT 3, Americas-II, ACE (12,8 en servicio; los 30 de Ciena están anunciados, no terminados), MAYA-1, FNAL, FA-1,
  AEC-1, MENA. Gemini no llegó a contestar la ronda de capacidades.
- **Fibra de países grandes**: no hay datos abiertos con trazados para ninguno (informe en el chat; OFDS sin licencia). Nueva herramienta
  `herramientas/fibra_agencia.py`: ChatGPT, Grok y Gemini dan las troncales por país como lista ordenada de ciudades
  (`herramientas/fibra-agencia/<voz>-troncales-N.json`); un tramo entra solo si otra voz da la misma operadora por esas dos ciudades sin rodeo
  (≤ 1,35 × la recta + 60 km); se dibuja ciudad a ciudad (GeoNames) con el detalle de la voz más precisa. Sale `herramientas/fuentes/fibra-agencia.json`,
  que `fibra_tierra.py` añade como 5.ª fuente, al final (no mueve las líneas anteriores). Hoy: **24 tramos, 27.020 km** en RU, KZ, IN, IR, SA, EG, TH,
  PH, PE, CO, EC, BO, AR. Faltan por acuerdo: Brasil, México, Indonesia y Chile (las voces no coinciden en operadora o ciudades).
- **Viaje en 3D** (dueño: «está muy escondido»; ChatGPT y Grok de acuerdo con su propuesta): encabeza el panel «Mi conexión» en ordenador, con
  «Ver el viaje en 3D» que mide primero si hace falta y despega solo; «Guardar el viaje (PDF)» aparece al lado cuando ya hay medida. «Ver / No ver»
  pasa a una × de cierre (y Escape, que no cierra el panel si se está saliendo del viaje). Frases nuevas traducidas a los 42 idiomas.
- Versión `v=20261024k` (la siguiente, `l`). Vista previa del amigo: **versión 16**.
- **Tarjetas de capas** (08:11–08:13, dueño): nunca se cierran solas. Con todo en rojo la capa se apaga en el mapa y su botón también, pero la
  tarjeta sigue abierta (`VACIA[k]` en capas.js) hasta que la persona la pliega con «—»; encender una luz en esa tarjeta vuelve a encender la capa
  solo con lo que está en verde. Lo mismo en satélites (`VACIA.sat`). Centros: «Centros de grandes compañías» (5 o más en el mapa) y «Centros de
  compañías pequeñas» son luces independientes. Probado midiendo los píxeles del lienzo `#rutas`: con todo en rojo no queda nada dibujado.
- **Cables** (08:16): «Cables en proyecto» y «Ruta estimada» en discontinuo con vaivén (`lineDashOffset` sinusoidal). «Ruta estimada» encendida sola
  muestra todos los trazados aproximados; con potencias encendidas filtra dentro de ellas. Las llegadas solo se pintan si se ve uno de sus cables.
- **Ficha arrastrable** (08:17): en ordenador se arrastra desde cualquier zona que no sea botón o título de sección; la posición elegida se conserva
  para las siguientes fichas de la visita (`posUsuario`). En el robot sin GPU los clics sobre el planeta no abren fichas (fotogramas lentos):
  para probar, abrir la ficha inyectando una llamada a `abreModelo`.
- Versión `v=20261024n` (la siguiente, `o`). Vista previa del amigo: **versión 17**.

## 13. Mañana del 23 Oct 2026, 09:00–10:15 (Opus 5.5): nombres, «¿Sabías que…?», viaje nuevo y PDF directo
- **Nombres de las cuatro tarjetas** (revisados con ChatGPT y Grok): «Cables submarinos» (Autopistas entre continentes · Grandes rutas · Cables
  regionales · Capacidad no publicada · Trazado aproximado · Cables en proyecto), «Fibra por tierra» (Grandes troncales · Rutas largas · Rutas
  entre ciudades · Enlaces cortos · En construcción), «Puntos de red» (Grandes operadores · Otros centros de datos · Puntos de intercambio · Bases y
  antenas), «Satélites» (Órbita geoestacionaria…). Cada luz con su explicación al pasar el ratón.
- **«¿Sabías que…?»**: flechas ‹ ›, los puntos muestran su dato al pasar por encima, y en cuanto la persona toca la tarjeta deja de pasar sola
  para siempre (clase `fijo`). **Clic en el planeta** pliega las tarjetas de capas sin cambiar nada; el botón de plegar es «Minimizar» con su icono.
- **Fibra de Brasil y México** por acuerdo de voces: `fuentes/fibra-agencia.json` con **30 tramos, 35.526 km**. **Capacidades**: tanda 7 de Grok
  guardada; la de ChatGPT salió vacía la primera vez y a la segunda dio 15 (`chatgpt-capacidad-5.json`): **131 cables** con capacidad
  (nuevos por acuerdo: H2H Express 307, ALVAL/ORVAL 40, FARICE-1 10, Tata TGN-Western Europe 3,84 Tbit/s).
- **Viaje en 3D rehecho** (dueño, 09:24 y 09:26): sin el primer barrido rápido. 1) Todas las líneas salen a la vez y despacio (cada pulso tarda su
  ida y vuelta real × 22, entre 1,8 y 7,5 s); 2) repaso por continentes, del más cercano al más lejano, con sus destinos nombrados; 3) **ejemplo de
  satélite**: el dato sube a un satélite geoestacionario y baja **en otro continente**. El continente propio sale del país (`P().pais`, tabla
  `CONT_PAIS` en viaje.js; antes se tomaba del destino medido más cercano y Colombia salía como Norteamérica → bajaba en São Paulo). El destino es
  uno medido de otro continente que un mismo satélite ve junto a la persona (≤ 66° del punto bajo el satélite: más de 15° sobre el horizonte); el
  satélite se coloca sobre el ecuador donde la peor de las dos elevaciones es la más alta; la cámara se elige por búsqueda (`encuadre`) para que el
  satélite quede fuera del borde del planeta, nunca entre los contadores. Se dibuja el anillo de la órbita geoestacionaria (mitad cercana más
  viva), «Tú · <lugar>» en el origen y «<destino> · <continente>» al llegar. Satélite a 1,7 radios (real: 6,6) → rótulo «no a escala».
  Desde Colombia: Ciudad del Cabo (África), satélite sobre el Atlántico; desde España: Ciudad del Cabo; desde México: São Paulo.
- **PDF directo** (dueño: «la pantalla se queda bloqueada»): ya no se usa el diálogo de imprimir. El informe se fotografía con html2canvas 1.4.1
  (MIT, servido desde `static/vendor/`, licencia al lado, atribución en terminos.html), se corta en páginas A4 por los bordes de los bloques y se
  escribe como PDF de imágenes con un escritor propio (`pdfDeImagenes`). Probado: descarga real, PDF válido de 3 páginas A4, ~1,1 MB.
  Arreglado de paso: un comentario se había tragado la línea de la cabecera del informe (salía sin título, lugar ni fecha) y el clon que se
  fotografía no tenía `box-sizing: border-box` (se cortaba el borde derecho).
- **Traducciones**: los 5 textos nuevos del viaje y del PDF, «borde de internet más cercano» (también en inglés y portugués; salía en español) y
  las letras de la brújula E/S/O (en alemán la «O» de Oeste se leía como Ost) en los 39 idiomas; en suajili la brújula pasa a N/E/S/W.
- Versión `v=20261024t`; luego `u` (10:20): repaso con zoom máximo ×1,8 (un destino solo llevaba ×2,6 y el planeta llenaba la pantalla),
  banda oscura suave bajo los contadores (también en el vídeo) y el rótulo del satélite encima de él cuando no cabe a la derecha. Luego `v` (10:55): en el resumen final del viaje el planeta se puede
  arrastrar y acercar (dueño, 10:43). Causa: la regla CSS `.viaje{position:fixed;pointer-events:none}` también se aplicaba a `body.viaje`, y el
  `pointer-events` se hereda: toda la página dejaba de responder al ratón. Ahora las reglas del HUD cuelgan de `#viaje`; durante el espectáculo
  `body.viaje:not(.viaje-fin) #escena` sigue sin responder (manda la cámara) y en el final vuelven la barra de zoom y la altura. La siguiente, `w`.

## 14. 23 Oct 2026, 11:00–12:40 (Opus 5.5): ESPEJO «Con / Sin GUARDIANA» en Órbita, versión `w`
- **Qué es** (dueño, 10:27: «dos botones… con guardiana y sin guardiana… sin guardiana, que sería un bombardeo»; 11:05: «sobre todo diarios
  deportivos»): dos botones bajo el planeta. «Sin GUARDIANA» deja el planeta limpio y dibuja, desde ti, un arco a cada empresa con la que conecta
  el navegador al abrir la portada de once diarios, con pulsos continuos (más dominios, más pulsos). «Con GUARDIANA» es la MISMA medición con las
  reglas de GUARDIANA: lo de publicidad, rastreo y medición se repliega en rojo contra un anillo alrededor de ti; lo funcional, el grupo
  editorial y el consentimiento siguen. Lo dice la pantalla: no es una medición del equipo del visitante. Arcos al PAÍS DE LA SEDE de cada empresa
  (nunca una ruta de datos). Panel izquierdo: tres cifras, filtro por diario, barras por país; lista de empresas a demanda; método y «Datos verificados».
- **Medición** (`herramientas/espejo/medicion-2026-10-23.json`): panel de navegación de la app de escritorio (Chromium sin bloqueadores),
  desde Colombia, cookies aceptadas cuando la web las pidió (API de Didomi/Usercentrics/OneTrust o botón). Se recorre la portada, se esperan
  10 s y se apunta cada host de Resource Timing (búfer ampliado a 100.000) y de los iframes. **Ojo**: una versión intermedia leyó también
  `script[src]`, `img[src]` y `link[href]` del DOM y metía hosts que no se cargan (alternates hreflang, scripts bloqueados hasta consentimiento
  por Ketch, android-app://): se descartó y se volvió a medir solo con Resource Timing + iframes. Unión de 1 o 2 visitas por web. Webs: Marca,
  AS (edición Colombia), Sport, L'Équipe, Gazzetta, Kicker, Sky Sports, ESPN (edición Colombia), CBS Sports, Fox Sports, El Tiempo.
  Resultado: **172 dominios de terceros**; mundodeportivo.com está bloqueado en el panel. Las web de alto riesgo piden aprobación por carga y por acción.
- **Empresa y país, regla de dos voces** (`construye.py`): votan ChatGPT y Grok (todas), Claude donde discrepan (con fuente cuando no es obvio,
  p. ej. Ipsos–Dotmetrics, eyeo–Blockthrough, LiveRamp–privacymanager.io, Mathilde-ads de ADL Digital Lab) y Gemini cuando responda
  (rehusó dos veces: «Soy un modelo de lenguaje…»; tercer intento con el modelo Argon en curso). Criterio: la EMPRESA QUE OPERA el servicio
  (Sky y no Comcast, Brightcove y no Bending Spoons, RCS y no Cairo), país de su sede. Hoy: **153 de 172 dominios con empresa, 100 empresas,
  16 países, 89 dominios cortables**. Los 19 sin dos voces cuentan en «dominios de otras empresas», no se dibujan y nunca se cortan.
  Para regenerar: `python3 herramientas/espejo/construye.py` (escribe `orbita/datos/espejo.json` y lista lo que falta).
- **Código**: `orbita/static/espejo.js` (modo limpio con `OrbitaCapas.soloTu(true, pinta)`; abanico de arcos que se abre hacia arriba y de lado;
  cámara que encuadra; cierra con Esc, con la ×, al abrir «Mi conexión», una puerta o el viaje), estilos al final de `orbita.css`.
  **Trampa evitada**: el HUD no puede llamarse `.espejo` porque el body lleva `en-espejo`… y la primera versión puso `body.espejo` y la regla `.espejo{position:fixed;…}` le cayó al body (en el móvil, `backdrop-filter` en el body descolocaba todo). Ahora: body `en-espejo`, HUD `.espejo-hud`.
  Textos en español en el DOM; inglés y portugués en `idioma.js` (los otros 39 idiomas, pendientes: están cerrados).
- **terminos.html §6**: describe la medición y su regla. Versión `x` (12:45): por debajo de 960 px de ancho el panel pasa a ser una tarjeta
  compacta arriba (a 808 px tapaba medio planeta) y en ventanas bajas se ocultan las barras por país para que el método y «Datos verificados» se
  vean. La siguiente, `y`.
- **Consulta (ronda 3)**: Brave/DuckDuckGo/Tor y el nombre ZEROSS (doc «GUARDIANA sin instalar nada», sección «Igual o mejor que Brave,
  DuckDuckGo y Tor», y «Lo que no existe todavía en el mundo» con el escaneo mundial). zeross.tech = Zeroday Security Solutions (comprobado).

## 15. 23 Oct 2026, 12:15–12:50 (Opus 5.5): ESPEJO por cables y satélites, la frase bajo el planeta, naming. Versión `y`
- **ESPEJO sin «misiles»** (dueño, 12:22: «todo debe ser por cableada o satélites… combínalo»): los pulsos de cada empresa viajan al país de su
  sede por el camino más corto de los cables submarinos y la fibra del mapa (`OrbitaRed.camino`, el mismo que usa el viaje); una de cada seis
  empresas (por `semilla(nombre)`) y los países sin camino en el mapa van por satélite. Las empresas de un país comparten el trayecto: se ve
  tráfico. Mientras la red del mapa carga, abanico de arcos. **El satélite es el del viaje** (dueño, 12:35: «el mismo satélite que tenemos en
  la órbita»): dibujo `dibujoSatelite`, 1,7 radios, cinturón geoestacionario y colocación donde el peor de los dos ángulos es menor (≤ 66°),
  rótulo «Órbita geoestacionaria · no a escala». En pantalla y en terminos.html: trayectos ilustrativos, no la ruta real de cada dato.
- **La frase** (dueño, 12:18 y 12:36, eligió la nº 3 de Gemini): «Entiende cada conexión. Decide tu propio rumbo.» Bajo el planeta, una vez por
  visita, palabra a palabra en orden de lectura (de derecha a izquierda en árabe, hebreo, persa y urdu porque se encienden en el orden del
  texto), con la luz de los títulos de la web (palabras en espera atenuadas, nunca invisibles; la que se lee brilla un momento); unos 7 s y se
  va. Espera a que se cierre la pregunta de ubicación (si la interrumpe, vuelve a empezar después) y se aparta si se abre ESPEJO, una puerta,
  «Mi conexión» o el viaje. `static/frase.js`; mientras está, se oculta el «¿Qué pasa al abrir un diario deportivo?».
- **Gemini** contesta si se le pide «sin buscar en la web» y con 3.1 Pro: su búsqueda falla y devuelve «Solo soy un modelo de lenguaje…».
- **Naming de la IA (ronda 4)**: Gemini → Prisma (descartado: Palo Alto Networks vende Prisma Access/Cloud, ciberseguridad), Sonar, Lumina; ZEROSS
  descartado («cero» = nulidad). Grok → Umbral (choca con Umbral Trade, otro proyecto del fundador), Vigía, VAELIS. ChatGPT, en curso.
- **Ideas del dueño para más adelante**: ESPEJO también en tiempo real y como resumen de las últimas horas (12:25); al entrar al navegador, un
  espectáculo: una habitación, una puerta, una jaula especial en medio y todo se sella al entrar (12:34), con el generador de vídeo cuando lleguemos.

## 16. 23 Oct 2026, 12:47–13:10 (Opus 5.5): la frase con la letra de la web y en el centro exacto del hueco. Versión `z`
- **Letra** (dueño, 12:47: «con el mismo tipo de letra de la web»): Instrument Serif, la de los titulares de la web, servida desde
  `orbita/static/fonts/InstrumentSerif-Regular.woff` (convertida del TTF de Google Fonts, licencia OFL al lado). Se carga antes de que se
  encienda la primera palabra. Ruso, ucraniano, búlgaro, griego, vietnamita, chino y japonés usan las mismas serifas de reserva que la web.
- **Sitio** (dueño, 12:53: «justo en el medio, donde acaba el planeta y la zona de abajo… visualmente tiene que ser perfecto»): se mide en cada
  pantalla. Techo = borde del planeta + su halo (1,04 R); suelo = lo primero que haya debajo en el centro (la cápsula Sin/Con GUARDIANA).
  La banda óptica de las letras (de lo alto de las mayúsculas a la última línea base, medida con marcas de línea base) queda en el centro
  exacto: comprobado en 11 tamaños, la misma distancia arriba y abajo (±0,1 px). El ancho evita las tarjetas de al lado (el «¿Sabías qué?»
  en portátiles de 1280–1366). Una línea mientras quepa a ≥ 24 px; si no, una frase por línea (nunca parte una frase salvo en pantallas
  muy estrechas). Si no cabe (móvil en horizontal), no sale. Si la persona hace zoom, se va; si cambia el tamaño de la ventana, se recoloca.
- **Rankings del «¿Sabías qué?»**: un primer puesto compartido se dice compartido («BT y Arelion operan más cables submarinos que ninguna otra
  empresa del mapa: 11 cada una»), no como un ganador.
- **Starlink a 0**: la descarga de CelesTrak de las 22:55Z del 22 oct llegó vacía para Starlink y el mapa dijo «0 satélites Starlink» hasta la
  siguiente. La tarjeta ya no sale con un grupo vacío, y `herramientas/datos_orbita.py` conserva las filas de la descarga anterior de un grupo
  que llega vacío (con su propia fecha, `grupos[].descargado`, hasta 3 días; después lo deja fuera). Si no llega nada nuevo, no escribe.
  La nota de la capa de satélites fecha con el grupo más antiguo. Probado con descargas simuladas (todo vacío, solo Starlink vacío, Starlink
  de hace 5 días).
- terminos.html: créditos de los tipos de letra de Órbita (OFL 1.1).
- **Flechas del «¿Sabías qué?»** (dueño, 13:20: «una flecha a la derecha y otra a la izquierda, de diseño, bien bonita… que al pasar
  por encima el mouse cambie a la mano»): dos botones redondos de cristal (32 px) con un chevron fino en SVG que se inclina hacia donde va;
  al pasar, brillo azul y mano; al pulsar, se hunden. Se crean una vez (el que está bajo el ratón no parpadea al cambiar de tarjeta) y son
  botones de verdad para lectores de pantalla («Anterior» / «Siguiente»). Los puntos van en una sola línea entre ellas (se estrechan en
  vez de saltar de línea) y la tarjeta actual es una barrita encendida. Versión `20261025a`.

## 17. 23 Oct 2026, 13:20–13:45 (Opus 5.5): agencia, rondas 5 y 6, y lo que decidió el dueño
- **Ronda 6 (estructura)**: las cuatro voces (ChatGPT, Grok, Gemini, Claude) proponen Órbita como portada y quitar descargas, instalación y
  licencias; paneles sobre el planeta; esta semana solo la parte visual, el servidor después. Radiografías con puerta propia: ChatGPT, Grok y
  Claude (Gemini la quería dentro del navegador y del DNS). Orden: ChatGPT y Grok ponen ZERO primero; Claude, Radiografías (lo gratis engancha).
- **Ronda 5 (nombre)**: VERALUN, la única que nadie puso la última. ZERVELA suena a «cerveza» (los tres); VERIGIA a «verija» (RAE: ingle;
  vulgar en Puerto Rico y Santo Domingo). Nuevas: VELARIA (Grok) y AVIZOR (Gemini; ya es marca de líquidos para lentillas).
- **Decisiones del dueño (13:40)**: 1) guardianagroup.com abre Órbita directamente; la presentación pasa a «Conocer GUARDIANA», sin descargas;
  2) Radiografías con puerta propia; 3) orden Radiografías, ZERO, Comunicaciones; 4) la IA se llama **VERALUN** (antes de invertir en
  logotipo o voz: búsqueda profesional de marca en SIC, EUIPO, USPTO e INPI, clases 9 y 42, y dominios).
- El perfil DNS no se llamará «Vigía» en público: hay una marca VIGIA registrada en EE. UU. (clase 42, software de redes con IA).
- Grok, con el panel del navegador oculto, a veces deja la respuesta en blanco o cortada: recargar la conversación la muestra entera.

## 18. 23 Oct 2026, 13:45–14:45 (Opus 5.5): Órbita es la portada, Radiografías primero y cables sin cruzar tierra. Versión `20261025b`
- **Portada** (decisión del dueño): en `main`, `index.html` es una página mínima que lleva a `/orbita/` conservando `?lang=` y `#puerta`;
  `en/index.html` lleva a `/orbita/?lang=en`. La presentación de antes vive en **`/conocer.html`** («Conocer GUARDIANA»): es la portada de
  `main` con los botones de descarga cambiados por «Empezar» (→ Órbita), «Una descarga» → «Sin instalar nada» y el paso «Instálalo» →
  «Empieza». **El resto del texto aún habla del programa (navegador para Windows, binario firmado, planes): hay que reescribirlo con la
  agencia.** `/es/` y `/pt/` (landings antiguas) siguen igual. `sitemap.xml`: `/orbita/` y `/conocer.html` en lugar de `/`. En
  `web-idiomas`, `index.html` sigue siendo la portada multilingüe (no copiarla a `main`).
- **Radiografías** (`static/radiografias.js`): puerta propia y la primera (Radiografías, ZERO, Comunicaciones). Panel a la izquierda (en el
  móvil, hoja desde abajo) con «Tú» (abre «Mi conexión»), «Una web» (los 11 diarios medidos: abre ESPEJO en ese diario;
  `OrbitaEspejo.abre(modo, sitio)`) y «Tus aparatos» (próximamente). `#radiografias` abre la puerta; Esc y × vuelven.
  `window.OrbitaPuertas.abre(id)` abre cualquier puerta por su nombre.
- **«Empezar»**: no cabe en la cabecera de un portátil, así que aparece **bajo el planeta cuando se va la frase**, en el centro exacto del
  mismo hueco (`window.OrbitaHueco()`, evento `guardiana-frase-fin`), y lleva a Radiografías. Se va para siempre en cuanto la persona
  empieza algo (puerta, ESPEJO, Mi conexión, viaje o zoom); `localStorage.guardiana_empezado`.
- **Cabecera**: «Conocer GUARDIANA» bajo la marca (lleva `?lang=`). La barra de capas centrada chocaba con «Ver mi conexión» entre 1100 y
  ~1430 px (1280 y 1366): ahora se mide y, si choca, baja a su propia línea (`body.capas-abajo`).
- **Cables por tierra** (dueño, 14:20, con captura de un «cable» recto de Marsella a Karachi por Turquía e Irán: «¿es un error? revisa
  todo»): era SEA-ME-WE 6 de la agencia. `herramientas/cables_agencia.py` trazaba por mar con A* sobre `agua.png` (20 km por píxel), que
  cierra Suez y el golfo de Suez, el golfo de Aqaba, los estrechos turcos y Panamá; sin ruta, caía en una recta «por tierra» de cualquier
  longitud. Ahora: esos pasos se abren solo para trazar (`Agua.PASOS`); si una ruta corta tierra se repite con máscara más estricta; los
  tramos se densifican cada 150 km (el planeta dibuja círculos máximos, que en saltos largos se curvan y cortaban cabos: Curie en Baja
  California); y una recta por tierra solo se acepta si cruza ≤ 400 km (Egipto, Panamá, Guatemala). Lo demás no se dibuja y la ficha dice
  «Un tramo por tierra sin dibujar» (SAm-1 y SAC Las Toninas → Valparaíso; SMPCS Packet-2 Jayapura → Merauke). Revisión completa de los
  1 487 tramos: de 30 tramos con tierra sospechosa quedan solo los cruces reales de Egipto y Guatemala. La profundidad de los tramos nuevos
  llega con la siguiente pasada del workflow (relieve.py).

## 19. 23 Oct 2026, 14:37–14:50 (Opus 5.5): cables sueltos, la medida real y fuera la pregunta del diario. Versión `20261025c`
- **Cable «que no comunica con nada»** (dueño, 14:37, al este de Dominica): «ECFS 6.1», un trozo del Eastern Caribbean Fiber System que
  OpenStreetMap tiene suelto en mar abierto. `datos_orbita.py` ya quita los trozos con los dos extremos sueltos (`quita_sueltos`): sin
  tierra a 30 km, sin ciudad a 25 km, sin estación de aterrizaje, sin empalme a 5 km y sin otro trozo de su sistema a 20 km; si no tiene
  nombre, es un «umbilical», es de una petrolera o es un trozo perdido de un sistema dibujado en otra parte. Fuera 14 (ECFS 6.1, Lanis 3,
  Solveig Umbilical y 11 sin nombre, casi todos enlaces de plataformas). Se quedan los enlaces con nombre entre islas pequeñas que la
  máscara no ve (Fehmarn Belt, Flores–Corvo).
- **La medida** («km de cable submarino en el mapa» del «¿Sabías qué?»): sumaba también lo que se descartaba (en desuso, eléctricos, por
  tierra). Ahora cuenta solo lo dibujado: 214 707 km de OpenStreetMap (antes 242 193).
- **Abajo, sin «¿Qué pasa al abrir un diario deportivo?»** (dueño, 14:39: «tiene que ser sobre sus datos»): quedan los dos botones; el panel
  sigue explicando qué se midió al abrirlo.
