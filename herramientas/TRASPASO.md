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
- **Siempre `git commit` en `web-idiomas` antes de cambiar de rama** (se perdió trabajo una vez por un `reset --hard`).
- Publicar (el merge de historias no relacionadas está bloqueado; esto es lo que funciona):
  ```
  git add -A && git commit -m "…" && git push origin web-idiomas
  git checkout main && git fetch origin main && git reset --hard origin/main
  git checkout web-idiomas -- orbita herramientas terminos.html .github/workflows/datos-orbita.yml
  git add -A && git commit -m "Publicar …" && git push origin main && git checkout web-idiomas
  ```
- **Caché**: todos los `static/*.js|css` de `orbita/index.html` llevan `?v=20261023g` (esquema `2026102<día><letra>`). Sube la letra en cada publicación (siguiente: `23h`, luego `23i`…).
- Comprobar el despliegue: `gh run list --repo guardianagroup/guardianagroup.com --limit 1` hasta `completed success` (1–3 min).
  Desde el contenedor **no se puede** hacer curl a guardianagroup.com, overpass-api.de ni NOAA (proxy); se comprueba con el navegador integrado
  (pestaña `tab-7` = guardianagroup.com/orbita/?v=X; `tab-6` es una pestaña del dueño, no tocar) y desde `javascript_tool`: `OrbitaPlaneta.ir(lon, lat, zoom)`, `OrbitaConexion.abre(true)`,
  `OrbitaConexion.medirRutas()` (≈40 s), `OrbitaViaje.empieza()`, `OrbitaViaje.informe()`. `OrbitaPlaneta.ir()` no hace caso durante la animación de entrada:
  esperar unos segundos. Pulsar «Ahora no» del aviso al cargar.
- Commits: terminar con `Co-Authored-By: Claude … <noreply@anthropic.com>` y la línea `Claude-Session:` que dé el sistema.

## 3. Estado de Órbita hoy (todo publicado en guardianagroup.com/orbita/, versión 23g)
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
- Fronteras, nombres de regiones, **nombres de país** desde ×2,2 con **ficha de país** (`fichaPais`; `datos/paises.json`: **70 países, todos verificados** (Claude escribe, ChatGPT corrige → `confirmado:true`; respuestas en
  `herramientas/paises-agencia/`). Lote 6 pedido a ChatGPT el 22 Oct 18:40: UY, PY, BO, VE, CR, PA, DO, CU, GT, HN, SV, PR, JM, TT, IS → recoger en tab-5, revisar como segunda voz (quitar fechas de 2026 que solo dé una voz), fusionar).
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
- `orbita/datos/sabias.json`: **35 «¿Sabías que…?» verificados** (ChatGPT redacta 40 → `herramientas/sabias-agencia/chatgpt-sabias-1.json`; Grok verifica →
  `grok-sabias-1-verificacion.txt`; entran los que pasan, `voces: [chatgpt, grok]`). Tarjeta: `sabia()` (fijo, etiqueta «¿SABÍAS QUE…?») y `noticia()` (más nuevas,
  más probables) en cada vuelta. **Lote 2 de 40 pedido a ChatGPT el 22 Oct 18:42** (chat «Investigación cables submarinos», pestaña `seed`): estaciones de amarre,
  IRU, cables más antiguos/retirados, costes publicados, públicos/privados, Egipto, sabotajes, barcos cableros, torres (Indus, China Tower, SBA, Crown Castle),
  centros de datos récord → recoger, verificar con Grok (tab-3), añadir a sabias.json.
- La **tarea de noticias ya se ejecutó una vez a mano** (sesión cse_01QJZrcY2qdxAmghLwn69sei): 11 noticias. Tras cada ejecución diaria hay que traer
  `orbita/datos/noticias.json` de origin/main a web-idiomas (`git checkout origin/main -- orbita/datos/noticias.json`).
- Lo de la subasta (quién paga por los datos) NO va en el viaje 3D: será un capítulo aparte del informe cuando se genere desde el programa (dueño de acuerdo, 17:10).

## 4c. Puntos de intercambio (IXP) por la agencia
- `herramientas/ixp-agencia/chatgpt-ixp-1.json` (212 IXP de ChatGPT) y `grok-ixp-1..4.json` (las cuatro tandas verificadas por Grok): **160 IXP de la agencia**
  ya en `puntos-extra.json`. `python3 herramientas/ixp_agencia.py` cruza por país+nombre (≥2 voces, <60 km), descarta los que
  Grok marca «es otra cosa» (p. ej. Equinix Ashburn/Paris no son IXP neutrales), evita duplicar los de OSM y los escritos a mano, y escribe en `datos/puntos-extra.json`
  tipo `intercambio` con `agencia: true`. capas.js ya los pinta con la capa de centros de datos.

## 5. Porcentaje de «mapa completo» (estimación dada al dueño)
Cables submarinos ~70 % · llegadas ~80 % · centros de datos ~25–35 % · puntos de intercambio <1 % · fibra terrestre ~45 % · satélites ~95 % · polos ~90 %.
Conjunto ~55 % (puntos de intercambio ya ~40 % con los 160 de la agencia). Orden acordado: (1) centros de datos, (2) puntos de intercambio, (3) terminar cables con la agencia, (4) fibra de países grandes.

## 6. Pendiente inmediato (por orden)
1. Que el dueño pruebe «El viaje de tus datos» en su PC (Mi conexión → Medir rutas → «Ver el viaje en 3D» → «Descargar vídeo» y «Guardar el viaje (PDF)»)
   y afinar lo que pida. Posible: sonido; elegir resolución del vídeo.
2. **Ficha de país**: 70 verificados; seguir por tandas de 15 (ahora ChatGPT escribe en el chat «Verificar fichas de infraestructura»
   https://chatgpt.com/c/6ada832b-0b94-83e8-ab23-e58008ece741 y Claude revisa como segunda voz; guardar en `herramientas/paises-agencia/chatgpt-paises-N.json` y fusionar).
   Campos: `movil`, `operadores`, `fija`, `diez` (10G), `troncales`, `intercambio`, `novedades`.
3. Capacidades: pedir a Grok el resto de la lista; cables de una sola voz (34, casi todos alias o ramales): seguir con Grok/ChatGPT por tandas.
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
