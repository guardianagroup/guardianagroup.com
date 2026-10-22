# Traspaso de Órbita · 22 de octubre de 2026, 14:40 (hora de Bogotá)

Documento para que otra sesión de Claude siga el trabajo exactamente donde quedó. Léelo entero antes de tocar nada.
El dueño es Fran (GUARDIANA GROUP S.A.S., Cartagena). **Siempre en español.** Lo último que dijo: «Sí a todo; no hace falta
que me preguntes más si te doy permiso». Avísale cuando algo quede listo, en pocas líneas, sin pegar código en el chat.

## 1. Reglas fijas del dueño (no negociables)
- No mostrar nunca el nombre real de la fundadora: en mockups se usa «Marta Ortega».
- No pegar código en el chat; no inventar cifras (los datos de demostración, etiquetados como tal); no prometer protección absoluta.
- Sin marcas reales de terceros en mockups (dominios `.example`). Colores: fondo #06080C, acento #9CC3E4, texto #F4F6F8; rojo #E07A6C solo para cortes.
- «Primer nivel de agencia» y «ponte en la piel del cliente»: calidad tipo Apple; el objetivo es «superar a Google Earth en datos».
- **No decir las fuentes en Órbita** (nada de OpenStreetMap, Natural Earth, etc. en pantalla): las fichas dicen «Datos verificados»;
  las atribuciones de licencia van solo en `terminos.html` (sección 6). Prohibido usar submarinecablemap.com / TeleGeography como fuente.
- Regla de la agencia: **solo entra lo que confirman al menos dos voces** (ChatGPT, Grok, Claude, Gemini). Nada «no verificado» a la vista del cliente.
- Nada de «no verificado» ni huecos en fichas: si no se sabe, se omite la fila.
- Idiomas: solo español e inglés activos en la web (`ABIERTOS = ['es','en']` en `orbita/static/idioma.js`); los 42 están traducidos en `orbita/static/i18n/*.json`
  salvo las claves más nuevas (ver §6).
- La web pública `guardianagroup.com` sigue siendo la anterior (portada + botón de descarga beta activo para su amigo). Órbita vive en
  `guardianagroup.com/orbita/` como página **no listada** (meta noindex) para que el dueño y su amigo (pueblo cerca de Praga, Chequia) la vean.
  Cuando el dueño diga, hay que desactivar los botones de descarga de `index.html` en `main`.

## 2. Repositorio y cómo publicar (procedimiento que funciona)
- Repo `guardianagroup/guardianagroup.com`. GitHub Pages sirve la rama `main`. Se trabaja en la rama **`web-idiomas`** (push autorizado).
- La rama `orbita-datos` y el workflow `.github/workflows/datos-orbita.yml` (corre también en `main` por horario) regeneran `orbita/datos`.
- **Siempre `git commit` en `web-idiomas` antes de cambiar de rama** (se perdió trabajo una vez por un `reset --hard`).
- Publicar (el merge de historias no relacionadas está bloqueado; esto es lo que funciona):
  ```
  git add -A && git commit -m "…" && git push origin web-idiomas
  git checkout main && git fetch origin main && git reset --hard origin/main
  git checkout web-idiomas -- orbita herramientas        # (y index.html/terminos.html solo si cambiaron)
  git add -A && git commit -m "Publicar …" && git push origin main && git checkout web-idiomas
  ```
- **Caché**: todos los `static/*.js|css` de `orbita/index.html` llevan `?v=20261022u`. Sube la letra en cada publicación (siguiente: `v`).
- Comprobar el despliegue: `gh run list --repo guardianagroup/guardianagroup.com --limit 1` hasta `completed success` (1–3 min).
  Desde el contenedor **no se puede** hacer curl a guardianagroup.com ni a overpass-api.de (proxy); se comprueba con el navegador integrado
  (pestaña de guardianagroup.com/orbita/?r=X) y `OrbitaPlaneta.ir(lon, lat, zoom)` desde la consola JS.
- Commits: terminar con `Co-Authored-By: Claude … <noreply@anthropic.com>` y la línea `Claude-Session:` que dé el sistema.

## 3. Estado de Órbita hoy (todo publicado en guardianagroup.com/orbita/, versión u)
- Planeta WebGL con mapa 16K en teselas; modo «limpio» desde ×4 (agua negra, tierra gris, datos en blanco, sin luces).
- **Zoom hasta ×80.000 (500 m de altura nominal)**, suavizado en escala logarítmica, doble clic por pasos (1,5 · 4 · 8 · 20 · 80 · 400 · 2.000 · 10.000 · máx).
  Indicador de altura a la derecha, encima de los botones (`#altura`, 40.000 km → 500 m, en metros por debajo de 10 km).
  Desde ×8 (`body.hondo`) desaparecen los botones de capas y el filtro de satélites. Límite de latitud ±75° a ×1 y hasta ±89,5° al acercarse (polos alcanzables).
  **Límite real**: el fondo (costas) es de 1–2 km de resolución; los puntos son precisos. Próximo paso posible: costas finas por teselas (OSM land polygons).
- Capas: Cables submarinos (OSM filtrado 1.190 + agencia **199 confirmados**, trazado aproximado punteado), Fibra por tierra (6.695 tramos, 90 países,
  por niveles; se desvanece por debajo de ~100 km de altura porque va de ciudad a ciudad), Centros de datos (1.903 lugares, 4.493 edificios, cuadrado blanco
  con anillo sutil al acercarse; clic en zona densa abre lista `lista-cerca`), Satélites (tiempo real).
- Fronteras Natural Earth (`datos/fronteras.json`), nombres de regiones muy cerca, **nombres de país** desde ×2,2 con **ficha de país** al pasar el ratón
  (`fichaPais` en capas.js; datos en `datos/paises.json`: CZ, ES, CO, US, CN, DE, FR, GB, JP, KR, todos `confirmado:false` → pie «Datos en verificación»).
- **Polos**: 34 estaciones (bases antárticas y estaciones terrenas de satélite) en `datos/puntos-extra.json` (tipo `estacion`), cargadas aparte
  (`cargaEstaciones`, variable `EST`) y visibles con la capa de cables; ficha al pasar el ratón con tipo, programa, desde, personal, cómo se conecta,
  por dónde salen los datos, antenas, enlaces locales, novedades. 5 cables previstos punteados en `datos/cables-previstos.json`
  (Chile–Antártida, McMurdo–NZ, Polar Express, Far North Fiber, PolarConnect) con promotor, qué, para cuándo, coste, capacidad, estudio, amarres.
- Ficha de cable: origen/destino/paradas, año, km, distancias punto a punto, dueños, operador, e **incidencias conocidas** (`datos/cables-notas.json`:
  Svalbard 2022, Tonga 2022/2024, C-Lion 1 y BCS East-West 2024, mar Rojo 2024 y 2025, Costa de Marfil 2024, EASSy 2024, SHEFA-2 2022, Balticconnector 2023).
- «Mi conexión» (conexion.js): datos del propio visitante, Ver/No ver, planeta en modo solo-tú. Puerta ZERO abre la demo `zero/?orbita=1&entrada=0`.
- Descargas beta 1.0.46 (Windows ES/EN/PT, Mac) en `/descargas/1.0.46/`, enlazadas desde `/instalar.html#descargar` y la portada.

## 4. La agencia (cómo se trabaja con ChatGPT, Grok, Gemini)
- Pestañas del navegador integrado: ChatGPT (`seed`, conversación «Lista cables submarinos África», cuadro `#prompt-textarea` o `[contenteditable=true]`),
  Grok (`tab-3`, conversación «Verificación independiente de cables submarinos», modo Expert), Gemini (`tab-1`; **se niega a casi todo desde hoy**, no contar con él).
  Para escribir en los cuadros: enfocar y `document.execCommand('insertText', false, texto)` desde `javascript_tool`, luego tecla Return.
  Para leer respuestas largas: `document.body.innerText.split('\n').filter(l => l.trim().startsWith('[{"nombre"'))` y coger la última.
- Esquema JSON por cable: `{"nombre","llegadas":[{"lugar","pais","lat","lon"}],"anio","km","duenos":[],"fuentes":[]}`.
  Las respuestas se guardan en `herramientas/cables-agencia/<voz>-<zona>-<n>.json` (voces: `chatgpt`, `grok`, `claude`, `gemini`; la voz la da el prefijo del archivo).
- Cruce: `python3 herramientas/cables_agencia.py && python3 herramientas/lugares_capas.py` (3–5 min) → `orbita/datos/cables-agencia.json`, `cables.json`,
  `lugares-capas.json`. Imprime «aceptados» y la lista «solo lo nombra X» (una sola voz: pendientes de confirmar).
- Estado: 199 cables confirmados; **145 todavía con una sola voz** (lista en `/tmp/.../scratchpad/solos_nombres.txt`, se regenera con el script).
- **En curso ahora mismo**:
  - Grok: verificando los 84 cables de una sola voz; tandas 1 y 2 guardadas (`grok-verifica-1.json`, `-2.json`); le pedí «continúa con el resto»
    (Mediterráneo, Atlántico/Caribe, Pacífico). Cuando responda: guardar como `grok-verifica-3.json` (y 4…), cruzar, publicar.
  - ChatGPT: tanda «Rusia, mar Negro, Golfo Pérsico, sur de Asia (hasta 40 cables)». Cuando responda: guardar como `chatgpt-rusia-golfo-1.json`, cruzar, publicar.
- Licencias comprobadas hoy: **PeeringDB no se puede usar** (su AUP prohíbe reproducir y uso comercial); IXPDB (Euro-IX) sin licencia clara → no usar.
  Los puntos de intercambio se hacen con la agencia (hechos públicos) y OSM (`telecom=internet_exchange`).

## 5. Porcentaje de «mapa completo» (estimación dada al dueño)
Cables submarinos ~65 % · llegadas ~80 % · centros de datos ~25–35 % · puntos de intercambio <1 % · fibra terrestre ~45 % · satélites ~95 % · polos ~90 %.
Conjunto ~50–55 %. Orden de prioridad acordado: (1) centros de datos, (2) puntos de intercambio, (3) terminar cables con la agencia, (4) fibra de países grandes.

## 6. Pendiente inmediato (por orden)
1. Recoger las respuestas de Grok y ChatGPT (ver §4), guardar, cruzar, publicar (subir `?v=`).
2. **Ficha de país**: verificar con la agencia los 10 países de `datos/paises.json` (pedir a ChatGPT y Grok que confirmen o corrijan cada campo;
   cuando dos voces coincidan, poner `confirmado:true`) y añadir países nuevos por tandas (toda Europa, América Latina, Asia). Campos: `movil`,
   `operadores`, `fija`, `diez` (10G), `troncales`, `intercambio`, `novedades`. Lo que el mapa ya sabe (cables y centros de datos por país) se calcula solo.
3. Centros de datos: ampliar la consulta Overpass de `herramientas/datos_orbita.py` (`puntos()`) con `building=data_center`, `office=data_center`,
   `industrial=data_center`, `man_made=data_center` (probar en el workflow de GitHub; desde el contenedor no hay acceso a Overpass).
4. Puntos de intercambio por la agencia (nombre, ciudad, país, desde cuándo, operador) → `datos/puntos-extra.json` tipo `intercambio`.
5. Traducir a los 39 idiomas restantes las claves nuevas de hoy (están solo en es/en/pt dentro de `idioma.js`): «Quién lo quiere hacer», «Qué quieren hacer»,
   «Para cuándo», «Capacidad prevista», «Coste», «Estudio», «Amarres previstos», «Cómo se conecta», «Por dónde salen los datos», «Antenas», «Personal», «Desde»,
   «Enlaces locales», «Novedades», «Incidencias conocidas», «Datos en verificación», «Ninguno con nombre en el mapa», «Red móvil», «Operadores»,
   «Fibra al hogar», «Troncales», «Intercambio de internet», y las etiquetas «40.000 km / 500 m» del indicador de altura.
6. Costas finas para el zoom profundo (opcional, grande): teselas vectoriales de OSM land polygons generadas en el workflow.
7. Cuando el dueño avise: quitar el botón de descarga de `index.html` en `main`. Artefacto de vista previa https://claude.ai/artifact/2ofNX33VVYed7qwqDxSrqa (v11) desfasado; no es necesario.

## 7. Archivos clave
`orbita/index.html` · `orbita/static/orbita.js` (planeta, zoom, altura, API `OrbitaPlaneta`) · `orbita/static/capas.js` (capas, fichas, país, estaciones, notas)
· `orbita/static/conexion.js` · `orbita/static/idioma.js` + `i18n/` · `orbita/static/orbita.css` · `orbita/datos/*.json` · `herramientas/cables_agencia.py`,
`lugares_capas.py`, `datos_orbita.py`, `fibra_tierra.py`, `fibra_zoo.py`, `cables-agencia/*.json`, `informes-agencia-polar.md`.
