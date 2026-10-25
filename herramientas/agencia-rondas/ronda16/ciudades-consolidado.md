# Ronda 16 · Ciudades al hacer zoom en Órbita · consolidado (23-10-2026)

Voces:
- **C** = ChatGPT (esfuerzo de razonamiento «High», el máximo del selector; pensó 40 s; citó fuentes).
- **G** = Gemini (3.1 Pro, nivel de razonamiento «Alto»).
- **K** = Grok (Expert; 25 s; 70 fuentes).
- **CI** = gpt-6-astra en el playground de Cheaper Inference, la pestaña que el fundador llamó «OmniRoute». El playground no tiene control de razonamiento y limita la salida a 4.096 tokens; la respuesta llegó completa.
- **Cl** = Claude, solo donde comprobé el dato en una fuente oficial (ver abajo).

Regla del sitio: solo se publica lo que confirman al menos 2 voces. [2+] = 2 o más voces · [1] = 1 voz (no publicar; decide el fundador).
Respuestas literales: `ciudades-chatgpt.md`, `ciudades-gemini.md`, `ciudades-grok.md`, `ciudades-cheaperinference.md`.

## ¿Se hace?
[2+] **Sí**: C, G, K y CI (4 de 4). Las ciudades sirven para orientarse; el protagonista sigue siendo la infraestructura.

## 1) Fuente de datos y licencia
1. [2+] Dos fuentes: Natural Earth populated places para la vista lejana y media, GeoNames para el zoom cercano (C, G, K). CI empieza solo con GeoNames y deja Natural Earth como «alternativa más ligera, adecuada para escalas globales».
2. [2+] Natural Earth es de dominio público: no hace falta pedir permiso ni citar, aunque se sugiere «Made with Natural Earth» (C, G, K, CI, Cl). CI propone citarla igualmente por transparencia.
3. [2+] GeoNames tiene licencia CC BY 4.0, así que hay que citarlo (C, G, K, CI). Cl no pudo abrir la página oficial de GeoNames y no cuenta como voz aquí.
4. [2+] Cita: «GeoNames (CC BY 4.0)», con enlace a la fuente y a la licencia, y diciendo que los datos se filtraron o adaptaron (C, K, CI, Cl). Según la licencia, basta un enlace a una página que reúna esa información (Cl).
5. [2+] La cita va en una página «Fuentes y licencias» enlazada desde Órbita (C, CI). G propone un «Acerca de» o una marca de agua en una esquina.
6. [2+] Indicar la fecha de descarga o de actualización de los datos (C, CI).
7. [2+] Preparar los datos en nuestro servidor y servir un formato compacto. Nunca el volcado completo ni llamadas a la API de GeoNames desde el navegador (C, G, K, CI).
8. [2+] Para el zoom cercano, cities15000 (G, K, CI; C lo usa de 150 a 30 km). No cargar cities1000 por defecto (C, K, CI). cities5000 solo si las pruebas lo justifican (CI), filtrado (K) o por debajo de 30 km (C).
9. [2+] Los ficheros de GeoNames incluyen también capitales y sedes administrativas aunque no lleguen al umbral de población (K, CI). cities15000 tiene unas 25 000 ciudades (C, K).
10. [1] Solo una voz: cities5000 ≈ 50 000 y cities1000 ≈ 130 000 registros; tamaños comprimidos de 3,2, 5,5 y 11 MB; actualizar cada trimestre (C). ne_10m ≈ 7 300 lugares y ne_110m ≈ 243 (K).

## 2) Qué ciudades salen en cada nivel de zoom
1. [2+] Los niveles se definen por distancia real, no por pasos de la rueda: altura de la cámara en km (C) o anchura de tierra visible (CI).
2. [2+] Con el planeta entero a la vista, ninguna etiqueta (C por encima de 8 000 km, CI). G y K ya muestran las ciudades más grandes.
3. [2+] Primero las capitales y después por población (C, G, K, CI).
4. [2+] Vista lejana: capitales nacionales o destacadas y ciudades de más de 5 millones (C de 8 000 a 2 500 km, G, CI con más de 3 000 km de ancho).
5. [2+] Vista media: ciudades de más de 1 millón (C de 2 500 a 700 km, G, CI de 800 a 3 000 km).
6. [2+] Vista regional: más de 100 000 habitantes (C de 700 a 150 km, K, CI de 200 a 800 km).
7. [2+] Vista cercana: alrededor de 15 000 habitantes (C de 150 a 30 km, G, K, CI por debajo de 200 km).
8. [2+] Para las ciudades de Natural Earth, usar su propio rango para decidir a qué zoom aparecen (K con SCALERANK; Cl: desde la v4.0, NE trae min_zoom, min_label y max_label pensados para mapas web).
9. [2+] Límite fijo de etiquetas a la vez: unas 60 en ordenador (C, K, CI; G dice 30–40) y unas 24–25 en móvil (C, CI; K dice 40–60 y G 30–40).
10. [2+] Evitar que las etiquetas se pisen: comprobar choques en pantalla con cajas (bounding boxes, AABB, quadtree o rejilla) y ocultar la de menor prioridad (C, G, K, CI). Separación mínima de unos 8 px (C con 6–8, CI con 8).
11. [2+] Las etiquetas ya visibles no saltan al girar, y las capitales también ceden si no caben (C, CI). K da «prioridad absoluta» a las capitales.
12. [2+] Transiciones o fundidos cortos al cambiar de nivel (C con 180–250 ms, K, CI).
13. [2+] No dibujar las ciudades del otro lado del planeta ni las ilegibles junto al horizonte (C, G, K, CI).

## 3) Estilo visual
1. [2+] Punto pequeño en el color de acento #9CC3E4, sin iconos ni rellenos (C, G, K). CI discrepa: punto discreto de 3–4 px y el acento solo para la ciudad seleccionada. Tamaño de 2–3 px (C, K); 3 px es el valor en que coinciden C, K y CI.
2. [2+] Etiqueta en #F4F6F8 (C, G, K, CI), con la misma letra de la interfaz y sin negritas decorativas (G, K, CI; CI pide peso 400–500). C propone Inter con Noto Sans de respaldo.
3. [2+] Tamaño de letra: las cuatro voces coinciden en 12 px (C 11–13 con mínimo 12 en móvil, G y K 10–12, CI 12–14). Mínimo de 12 px (C en móvil, CI).
4. [2+] Opacidad del texto en torno al 85–90 % (C 70–90 %, CI 85–95 %); los puntos, más tenues que el texto (CI; G y K también los bajan).
5. [2+] Jerarquía: las capitales un poco más marcadas (C y K con tamaño u opacidad, CI con un pequeño aro).
6. [2+] Un halo oscuro #06080C detrás del texto para que se lea sobre los cables (G, CI).
7. [2+] El mismo estilo de día y de noche, ajustando solo el halo o el contraste (C, K, CI). No imitar luces de ciudad (C, CI). G proponía «puntos de luz» de noche y queda fuera.
8. [2+] Letra que cubra todos los alfabetos de los 42 idiomas (C con Noto Sans; CI con soporte de escritura de derecha a izquierda y sin descargar todas las fuentes al principio).
9. [2+] La letra crece un poco con el zoom, con un mínimo y un máximo (G, K).

## 4) Rendimiento en móvil
1. [2+] Nada de un fichero gigante: datos filtrados y comprimidos (C, G, K, CI).
2. [2+] Teselas por zoom y por zona, cargadas solo cuando hacen falta: la parte visible más un margen (C, G, K, CI). Cada tesela de 100 KB o menos (C con 20–50 KB, CI con 100 KB como máximo).
3. [2+] Texto dibujado en WebGL con atlas de glifos o SDF, sin miles de elementos HTML (C, G, CI; K también admite etiquetas HTML encima).
4. [2+] No recalcular la colocación de etiquetas en cada fotograma (C: solo cuando la cámara cambia bastante; CI: como mucho unas 10 veces por segundo).
5. [2+] En móvil, unas 24–25 etiquetas por fotograma (C, CI; K dice 40–60).
6. [2+] Si el aparato va justo, recortar primero las ciudades (las secundarias o todas), nunca los cables ni los centros de datos (C, K).
7. [1] Solo una voz: un índice inicial de 200 KB o menos, caché y cancelar las descargas al cambiar de región (CI); 1–2 MB en total, todos los puntos en una sola llamada de dibujo y medir en un móvil de gama media real (K).

## 5) Idioma de los nombres
1. [2+] El nombre en el idioma de la página si existe la traducción y, si no, el nombre local (C, G, K, CI).
2. [2+] Traducciones de los nombres alternativos de GeoNames (C, G, K, CI) y de Wikidata (C, G, K). Los datos de Wikidata son CC0 (C, Cl).
3. [2+] No habrá traducción de todo en los 42 idiomas: se acepta abiertamente que algunos nombres queden sin traducir y no se finge que la cobertura es completa (C, K, CI).
4. [2+] Nada de traducciones ni transliteraciones inventadas o hechas con IA (C, CI).
5. [2+] La etiqueta lleva un solo nombre y el nombre local va en la ficha (C, K, CI). G pone los dos en la etiqueta.
6. [1] Natural Earth ya trae nombres traducidos. Empezaron en la v4.0 por los lugares poblados y desde la v4.1 cubren 21 idiomas (Cl, notas oficiales; ninguna otra voz lo dice expresamente).
7. [1] Cruzar las fuentes por identificador estable (C). Enviar al navegador solo los idiomas que necesita (CI).

## 6) Interacción
1. [2+] Primera versión: solo etiquetas, sin ficha al tocar (CI; G: las ciudades no se tocan, salvo doble toque para acercar). C pone la ficha desde el principio; para K es opcional.
2. [2+] Cuando haya ficha: nombre, país e «infraestructura registrada cercana» ya documentada en Órbita (C, CI; K lo ve opcional; G lo hace solo con el acercamiento).
3. [2+] Que estar cerca no parezca estar conectado: no dar a entender que un cable pasa por una ciudad, ni que el punto de la ciudad marca la ubicación exacta de una instalación (C, CI).
4. [2+] Algo discreto y sin ventanas grandes (C, G, K, CI). Zona táctil de al menos 44 px (C, CI).
5. [2+] La interacción nunca pide ni muestra la ubicación del visitante (C, G, K, CI).
6. [1] Solo CI: indicar en la ficha el radio y la fuente, foco accesible con teclado y no bloquear el giro del planeta.

## 7) Honestidad y riesgos
1. [2+] Solo ciudades reales tal como vienen de la fuente: nada inventado, nada completado con IA y nada corregido a mano sin fuente (C, K, CI).
2. [2+] Las poblaciones son estimaciones y pueden estar desactualizadas: aviso discreto de «datos aproximados», con la fuente y la fecha (C, K, CI).
3. [2+] Privacidad: la capa funciona sin geolocalización, sin pedir permisos y sin GPS; no se geolocaliza por IP ni se centra el planeta en la ciudad del visitante (C, G, K, CI).
4. [2+] Territorios, capitales y nombres en disputa: una política neutral y coherente según la fuente (C, G, K, CI).
5. [1] Botón «Ir a mi ubicación» (solo G): C, K y CI no lo quieren, así que no se hace. Un enlace para avisar de errores (solo CI).

## 8) Qué NO hacer
1. [2+] No llenar el planeta de nombres ni tapar cables, satélites o centros de datos: las ciudades van por debajo de la infraestructura (C, G, K, CI).
2. [2+] Nada de calles, edificios, 3D, fotos, pines ni iconos realistas (C, G, K, CI).
3. [2+] No descargar el catálogo mundial completo ni mostrar por defecto pueblos de 1 000 habitantes (C, K, CI; G: «no cargar un JSON gigante»).
4. [2+] Nada de destellos, luces intermitentes ni efectos de videojuego (C, CI).
5. [2+] No usar fuentes sin licencia clara, por ejemplo etiquetas de Google Maps, ni depender de un servicio de mapas externo en cada movimiento (C, K).
6. [2+] No rastrear al visitante ni personalizar según dónde está (C, G, K, CI).
7. [1] No mezclar las etiquetas con los colores de los cables ni convertir cada punto en un botón vacío (CI). Ningún selector nuevo en la barra: un interruptor «Ciudades» en las opciones del mapa, encendido por defecto (C).

## Desacuerdos que quedan
- **Color del punto:** C, G y K lo quieren en el acento #9CC3E4; CI reserva el acento para la ciudad seleccionada. Mayoría: acento.
- **Opacidad del punto:** G 30–40 %; K 60–90 %; en el ejemplo de C, del 65 al 100 %; CI, por debajo del texto.
- **Hasta dónde bajar:** C llega a más de 5 000 habitantes, y a 1 000 en un «detalle avanzado»; G y CI se quedan en cities15000 (CI deja cities5000 para «si las pruebas lo justifican»); K, cities15000 o cities5000 filtrado.
- **Fuente única o doble:** C, G y K usan Natural Earth y GeoNames; CI, solo GeoNames, con Natural Earth como alternativa.
- **Al tocar:** C pone la ficha desde el principio; CI la deja para después; G solo hace zoom con doble toque; K la deja opcional.
- **Nombre local:** G lo pone debajo de la etiqueta; C, K y CI, solo en la ficha.
- **Resueltos por la cuarta voz:**
  - El límite de etiquetas en móvil queda en unas 24–25 (C, CI).
  - Con el planeta entero a la vista, ninguna etiqueta (C, CI).
  - Las capitales también ceden si no caben (C, CI).
  - Nada de luces de ciudad de noche (C, CI, K).
  - El halo oscuro detrás del texto pasa a 2 voces (G, CI).

## Verificaciones de Claude (fuentes oficiales)
- Natural Earth, términos de uso (naturalearthdata.com/about/terms-of-use): todo es de dominio público, «No permission is needed», citar «is unnecessary» y la cita sugerida es «Made with Natural Earth». Sin garantía de exactitud.
- Natural Earth, notas de la v4.0 (naturalearthdata.com/?p=4995): los lugares poblados traen nombres en 7 idiomas, y los datos ganan las propiedades min_zoom, min_label y max_label para mapas web, junto al scalerank de siempre, que viene de la cartografía impresa. Notas de la v4.1 (?p=5010): la traducción de nombres pasa a 21 idiomas y se añade ne_id para enlazar con Wikidata.
- Wikidata, licencias (wikidata.org/wiki/Wikidata:Licensing): los datos estructurados son CC0.
- CC BY 4.0, texto legal (creativecommons.org/licenses/by/4.0/legalcode.txt), § 3(a)(1): citar al autor, avisar de la licencia, enlazar e indicar si se modificó. § 3(a)(2): basta un enlace a una página con esa información.
- GeoNames: no pude abrir su página oficial. geonames.org redirige de https a http y download.geonames.org bloquea los robots. Que es CC BY 4.0 lo afirman C, G, K y CI, pero yo no lo he comprobado.

## Plan recomendado (máx. 12 líneas)
1. Sí (4 de 4): una capa «Ciudades» discreta que aparece al acercar; la infraestructura sigue mandando.
2. Datos: GeoNames cities15000 (CC BY 4.0) para cerca y Natural Earth (dominio público) para lejos y medio; nada de cities1000 por defecto.
3. Prepararlos en nuestro servidor, en teselas pequeñas por zoom, cargadas solo para la parte visible; sin llamar a la API de GeoNames.
4. Niveles por distancia real: planeta entero sin etiquetas → capitales y más de 5 M → más de 1 M → más de 100 000 → unos 15 000; capitales primero.
5. Etiquetas sin pisarse (cajas en pantalla, unos 8 px de separación), estables al girar, con fundido entre niveles y nada detrás del planeta.
6. Límite fijo de etiquetas: unas 60 en ordenador y 24–25 en móvil; la colocación no se recalcula en cada fotograma.
7. Estilo: punto de 2–3 px en #9CC3E4; texto #F4F6F8 de 12 px con la letra de la interfaz y halo #06080C; capitales algo más marcadas; igual de día y de noche.
8. Idioma: el nombre en el idioma de la página (nombres alternativos de GeoNames y Wikidata, que es CC0); si falta, el nombre local; nada inventado.
9. Primera versión sin ficha al tocar. Más adelante, una ficha mínima con la infraestructura cercana y el aviso de que estar cerca no es estar conectado.
10. Cita en «Fuentes y licencias»: «GeoNames (CC BY 4.0), filtrado y adaptado por GUARDIANA», con enlaces, la fecha de los datos y «Made with Natural Earth».
11. Aviso de «poblaciones aproximadas»; nada de ubicación del visitante; neutralidad en nombres disputados; nada de calles, edificios, iconos ni destellos.
12. En una línea: sí, con GeoNames cities15000 y Natural Earth en teselas que se cargan al acercar, capitales primero, 60/25 etiquetas como máximo y cero ubicación del visitante.
