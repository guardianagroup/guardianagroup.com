# Ronda 76 · Claude · El chat de GUARDIANA, a la altura de Apple

**Diagnóstico (sacado del código).** `app.css` y `componentes.css` suman **86 colores hex** y **31 tamaños de letra**, y casi todos los controles llevan un borde de 1 px. Las burbujas reales son `#24405A` / `#1A2129`, no `#22394F` / `#1B212A`. Existen los estilos `.gc-flecha-respuesta` y `.gc-respondiendo`, pero `app.js` no tiene «Responder» ni menú al mantener pulsado. Las hojas se cierran de golpe, con un `display:none`. De todo eso sale la «botonería».

## A. Sistema visual

### A1. Paleta: 25 fichas en lugar de 86 colores

| Ficha | Valor | Uso (y a qué sustituye) |
|---|---|---|
| `--g-fondo` | `#06080C` | fondo de la app y del chat |
| `--g-barra` | `#0A0D12` | cabecera, compositor y pestañas |
| `--g-capa` | `#141A22` | hojas, listas agrupadas y campo de escribir |
| `--g-capa-2` | `#1C232D` | menús, controles sobre una capa y fila pulsada |
| `--g-velo` | `rgba(0,0,0,.5)` | detrás de las hojas y los menús |
| `--g-raya` | `rgba(255,255,255,.09)` | separadores de 0,5 px |
| `--g-texto` | `#F4F6F8` | principal (sustituye a #E8ECF1, #DBE9F4, #DCE5ED y #E1E7ED) |
| `--g-texto-2` | `#A3AEBA` | secundario, 8,9:1 sobre el fondo (sustituye a #A9B3BE, #9FB3C4, #AEB9C5 y #A9BCCB) |
| `--g-texto-3` | `#6F7B88` | terciario y marcadores, 4,6:1 |
| `--g-texto-4` | `#47515D` | desactivado y flechas › |
| `--g-acento` | `#9CC3E4` | todo lo que se toca y la marca |
| `--g-acento-pulsado` | `#84AFD6` | sustituye a #8AB4DA y #6F9FC8 |
| `--g-acento-tinte` | `rgba(156,195,228,.14)` | fondos tintados |
| `--g-sobre-acento` | `#06080C` | texto sobre el acento |
| `--g-mia` | `#24405A` | burbuja propia (el texto da 9,9:1) |
| `--g-mia-pulsada` | `#2D4D6B` | burbuja propia mientras se mantiene pulsada |
| `--g-suya` | `#1A2129` | burbuja ajena (15:1) |
| `--g-suya-pulsada` | `#232B35` | burbuja ajena mientras se mantiene pulsada |
| `--g-meta-mia` | `rgba(235,242,248,.62)` | hora y ✓ en las propias |
| `--g-meta-suya` | `#8D98A4` | hora en las ajenas (5,5:1) |
| `--g-leido` | `#62C6FF` | ✓✓ leído (5,6:1 sobre la burbuja propia) |
| `--g-ok` | `#5CC98A` | en línea y verificado (sustituye a #6CCBA5) |
| `--g-aviso` | `#F0C77F` | atención (sustituye a #E0B66A y #E8C77A) |
| `--g-alerta` | `#E07A6C` | error, borrar, colgar y llamada perdida (sustituye a #E0705F, #FF3B30, #E9998D y #F09A8E) |
| `--g-alerta-tinte` | `rgba(224,122,108,.16)` | fondos de error |

**Reglas de color.** El acento es el único color para lo que se toca. El verde solo significa «en línea» o «verificado». El rojo, solo error, borrar, colgar o llamada perdida. El ámbar, solo atención.

### A2. Tipografía (Plex Sans; Plex Mono solo para cifras)

| Elemento | px / interlineado | Peso | Espaciado |
|---|---|---|---|
| Título grande (Chats, Ajustes) | 30/36 | 600 | −0,02em |
| Nombre en la cabecera, título de hoja | 17/22 | 600 | −0,01em |
| Subtítulo de la cabecera | 13/16 | 400 | 0 |
| Mensaje en el teléfono / en el PC | 17/23 · 15/21 | 400 | −0,01em |
| Cita: autor / texto | 13/16 · 14/19 | 600 / 400 | 0 |
| Hora y ✓ | 11/13 tnum | 400 | +0,01em |
| Separador de fecha | 12/16 | 600 | +0,02em |
| Lista: nombre / línea 2 / hora | 17/22 · 15/20 · 14/18 tnum | 600 / 400 / 400 | −0,01em |
| Contador | 13/20 tnum | 600 | 0 |
| Botones (principal y de texto) | 17/22 | 600 | −0,01em |
| Fila de menú o de ajustes | 17/22 | 400 | −0,01em |
| Nota al pie | 13/18 | 400 | 0 |
| Pestañas | 10/12 | 500 | +0,01em |
| Mono: duración / temporizador / Número | 12/16 · 15/20 · 28/34 | 500 | Número +0,04em |

Ningún texto por debajo de 11 px ni en peso 300; la HIG desaconseja Light. Si el Plex Sans que se sirve no trae `tnum`, la hora va en Plex Mono.

### A3. Rejilla, radios, sombras y bordes
- **Rejilla de 4 px:** 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32. Margen lateral en el teléfono: **16 px siempre** (hoy hay 14, 18 y 20).
- **Alturas:** 44 como mínimo para tocar · 50 el botón principal · 52 las filas de menú y ajustes · 76 las filas de chat.
- **Radios:** burbuja 18 · unión dentro de un grupo 6 · esquina de la cola 4 · campo 19 · hoja 20 · menú 14 · lista agrupada 12.
- **Sombras, solo dos:**
  - `--g-sombra-flota: 0 12px 32px rgba(0,0,0,.55), 0 0 0 .5px rgba(255,255,255,.08)`, para menús;
  - `--g-sombra-alza: 0 8px 20px rgba(0,0,0,.45)`, para la burbuja levantada.
  - Ningún resplandor de color.
- **Bordes:** ninguno en los controles. Separadores de 0,5 px en `--g-raya`. El foco solo se marca con `:focus-visible`: 2 px #9CC3E4, separado 2 px.

### A4. Iconos
- Un solo juego, dibujado en una rejilla de 24 y con extremos redondos.
- El grosor depende del tamaño en pantalla, para que todos se vean iguales: 28 px → 1,6 · 24 → 1,75 · 20 → 2 · 16 → 2,25. Hoy hay siete grosores distintos.
- Tamaños: cabecera 24 · compositor 24 · pestañas 26 · filas 22 · dentro de una burbuja 18.
- Versión rellena solo para lo activo o la acción principal: enviar, play, pestaña elegida y botones de llamada.

### A5. Cómo quitar la «botonería»
1. **Un solo botón relleno por pantalla** (la HIG pide «uno o dos destacados por vista»). `.boton.principal` y `.grande.principal`: alto 50, radio 14, sin borde ni sombra; pulsado #84AFD6.
2. **Lo secundario es texto en acento, sin caja.** `:where(.boton)` sin `principal` → `border:0; background:none; color:#9CC3E4`. En las hojas, «Listo» va arriba a la derecha.
3. **Las opciones son listas agrupadas.** `.ajustes` → fondo `--g-capa`, radio 12; `.ajuste` → 52 px, sin borde, raya de 0,5 px desde el texto; icono en un cuadrado de 30 px con radio 8. Interruptor nativo `<input type="checkbox" switch>` (Safari 17.4+) con `accent-color:#9CC3E4`: forma y vibración de iOS sin código.
4. **Iconos de barra sin círculo.** `.gc-redondo`, `.gc-cab-boton` y `.contacto-b`: solo el glifo, con una zona de 44×44; al pulsar, el glifo baja a opacidad .45.
5. **El toque se nota con luz, no con borde.** Una fila se aclara al instante con `rgba(255,255,255,.07)`; un botón redondo baja a escala .92.
6. **Sin hover en el teléfono.** Todo `:hover` va dentro de `@media (hover:hover) and (pointer:fine)`, y se quita el `translateY(-2px)` de `.grande:hover`.

## B. El chat, pieza a pieza

**Cabecera** (`.gc-cabecera`)
- 52 px más la zona segura, fondo `--g-barra` y raya inferior de 0,5 px.
- Flecha ‹ en acento con los no leídos de otros chats («‹ 3»).
- Avatar de 36 px con la **inicial** de la persona; el candado pasa a una insignia de 14 px en su esquina.
- Nombre 17/22 600 con el punto de 8 px #5CC98A. Debajo, solo si ocurre: «escribiendo…» o «grabando audio…», en #9CC3E4.
- A la derecha: vídeo, teléfono y ⋯, con 44 px de zona cada uno.

**Burbujas** (`.gc-burbuja`)
- Texto 17/23, relleno 7 × 12 px, ancho máximo 80 %. Sin borde en ningún tamaño de pantalla: en el PC todavía lo llevan.
- Grupo = mismo autor con menos de 5 minutos entre mensajes (`pintaMensaje` ya lo calcula). 2 px de separación dentro del grupo y 8 px entre grupos.
- Radios de las propias (las suyas, en espejo):
  - sola o última del grupo: 18 18 4 18, con cola;
  - primera del grupo: 18 18 6 18;
  - intermedia: 18 6 6 18.
- La cola va solo en la última del grupo. `pintaMensaje` le pone la clase `.gc-cola` y se la quita a la anterior cuando llega una `.gc-sigue`:

```css
.gc-burbuja.gc-cola::before{content:"";position:absolute;bottom:0;right:-5px;width:9px;height:14px;background:inherit;
 -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 9 14'%3E%3Cpath d='M0 0c0 7 2.6 11.6 9 14-4 .5-7-.3-9-2.2z'/%3E%3C/svg%3E") 0 0/9px 14px no-repeat}
.gc-suya.gc-cola::before{right:auto;left:-5px;transform:scaleX(-1)}
```

- **Hora y ✓ en la misma línea que el texto cuando caben** (como en WhatsApp):
  - se quitan el `float` de `.gc-meta` y el `::after` de limpieza;
  - `.gc-meta{position:absolute;right:10px;bottom:6px}`;
  - al final del texto se deja un hueco invisible: `.gc-texto::after{content:"";display:inline-block;width:62px}` en las propias y 40 px en las suyas;
  - si en la última línea no queda sitio, el hueco baja solo a una línea nueva.

**✓** (`TICK1`, `TICK2` y `RELOJ` en app.js). Caja de 16×11, trazo 1,5, extremos redondos.
- Reloj: círculo de radio 4,5 y agujas `M5.5 3v2.7l1.8 1.1`.
- ✓: `M1 6.2l3.1 3.1 6.5-6.7`.
- ✓✓: el anterior más `M7.2 8.4l.9.9 6.5-6.7`, en gris (`--g-meta-mia`).
- **✓✓ leído:** la misma forma en **#62C6FF**, trazo 1,7. Propongo azul porque se distingue del gris también para quien confunde rojo y verde, que son el 8 % de los hombres. Si el dueño quiere seguir con el verde que pidió, #5CC98A da 5,2:1.
- Fallo: círculo de 14 px #E07A6C con «!». Al tocar la burbuja: «Reintentar» o «Borrar».

**Separador de fecha** (`.gc-fecha`)
- Píldora sin borde: `rgba(20,26,34,.92)`, radio 10, texto 12/16 600 #A3AEBA.
- `position:sticky; top:8px`, para que la fecha se quede arriba al desplazar.
- Textos: «Hoy», «Ayer», el día de la semana y, a partir de una semana, la fecha.

**Notas de voz** (`.gc-voz`)
- **Onda:** 32 barras de 2 px con 2 px de hueco, de 3 a 22 px de alto y radio 1.
  - Sin oír: `rgba(244,246,248,.38)` en las propias, `rgba(163,174,186,.45)` en las suyas.
  - Ya oído: #F4F6F8 en las propias, #9CC3E4 en las suyas.
- **Datos:** 32 valores de `g.barras` (ya se calcula al grabar), dentro de los metadatos cifrados.
- **Rendimiento:** la onda como `-webkit-mask-image` sobre `.gc-voz-barra`; el avance sigue siendo `.gc-voz-prog` con `scaleX`, sin repintar.
- **Velocidad:** píldora de 34×24 (zona de 44), 12 px 600, que alterna «1×», «1,5×» y «2×» con `playbackRate` y `preservesPitch`.
- Al acabar una nota, empieza la siguiente sin oír.

**Fotos**
- Relleno de 3 px en la burbuja, radio 15 en la imagen y como mucho 260×340.
- `width` y `height` se ponen **antes** de cargar, con la proporción que viaja en los metadatos; si no, el chat salta al llegar la foto.
- Mientras carga: miniatura de 24 px con `blur(14px)` fijo y un anillo de 44 px con una × para cancelar. Después, fundido de 200 ms.
- La hora va encima de la foto, en una píldora `rgba(0,0,0,.45)`.

**Tarjetas de llamada** (`.gc-llam`)
- Fuera los círculos de 38 px de `.gc-llam-ico` y de `.gc-llam-otra`.
- En su lugar, un glifo de 20 px con flecha: ↗ o ↙ en #5CC98A; ↙ en #E07A6C si es perdida.
- Título 15/20 600 y detalle 13/18 #A3AEBA.
- Toda la tarjeta sirve para devolver la llamada, como en WhatsApp.

**«escribiendo…»**
- En la cabecera, siempre, con un fundido de 150 ms.
- En la lista solo si se está abajo: burbuja suya de 54×34 con cola y tres puntos de 6 px #8D98A4.

**Compositor** (`.gc-compositor`)
- Fondo `--g-barra`, raya superior de 0,5 px y abajo `max(6px, env(safe-area-inset-bottom))`.
- `#adjuntar`: un «+» de 24 px en acento, como en WhatsApp para iPhone.
- `.gc-campo`: alto 38, letra 16/20 (con menos de 16 el iPhone acerca la página), radio 19, fondo `--g-capa`, raya de 0,5 px. El texto de ejemplo dice «Mensaje», en #6F7B88. Crece hasta 6 líneas.
- A la derecha, un hueco fijo de 44×44 con dos botones uno encima del otro:
  - `#grabar`: micrófono de 24 px sin círculo;
  - `#enviar`: círculo de **34 px** #9CC3E4 con el avión relleno de 18 px en #06080C.
  - Se quitan los 46 px y la sombra azul. Al cambiar de uno a otro, nada se mueve.
- Al responder, encima del campo aparece `.gc-respondiendo`: raya de 3 px en acento, autor 13/16 600 y extracto de una línea.

**Grabación** (`.grabando`, `#grabar.pulsando`, `.grab-candado`). La lógica ya está; solo cambia lo visual:
- micrófono a 70 px (`scale(1.6)`) con aro `0 0 0 6px rgba(156,195,228,.16)` y sin sombra negra;
- punto rojo de 10 px que late de 1 a .35 en 1.000 ms, y el tiempo en Plex Mono 15/20;
- «‹ Desliza para cancelar» se desvanece (1 − dx/120) y cancela a los 120 px; el candado fija la grabación a los 80 px.

**Menú al mantener pulsado** (nuevo)
- Se abre tras 400 ms con el dedo quieto; si se mueve más de 8 px, es que está desplazando. Las burbujas llevan `touch-action:pan-y`.
- Mientras espera, la burbuja baja a .97. Al abrirse vibra, aparece el velo, la burbuja sube a 1,02 con `--g-sombra-alza` y el menú sale pegado a ella.
- Menú: 240 px, radio 14, fondo #1C232D opaco, filas de 44 a 17/22 y el icono de 20 px a la derecha.
- Orden: **Responder · Reenviar · Copiar · Información · Borrar**, con lo destructivo al final y en rojo, como pide la HIG.
  - **«Copiar» choca con lo que pidió el dueño el 28 de octubre a las 15:17** («que no se pueda copiar nada»). Hay que preguntarle; mientras, no aparece.
  - Reenviar, solo a otros chats de GUARDIANA.
  - Borrar ofrece «Borrar para mí» y «Borrar también en su teléfono», con esta nota: «Se borrará cuando su app reciba el aviso; si ya lo copió o lo capturó, eso no se deshace».
- **Deslizar a la derecha para responder:**
  - la burbuja sigue al dedo con resistencia: dx × 0,6, hasta 72 px;
  - a los 56 px, vibración y modo respuesta;
  - solo arranca si |dx| > 1,5·|dy|.
- La cita (`.gc-cita`) lleva una raya de 3 px en acento y como mucho 2 líneas. Al tocarla, el chat salta al original y lo ilumina 600 ms. El mensaje cifrado tiene que llevar `cita:{id, autor, extracto}`.

**Contador y «Mis chats»** (`.contactos-*`)
- Lista a todo el ancho, sin la tarjeta con borde de `.contactos-filas`. Título grande «Chats».
- Fila de 76 px: avatar de 52 (punto verde de 12 px solo si está en línea), nombre 17/22 600 y una segunda línea 15/20 que dice qué hay de nuevo sin mostrar el contenido («Nota de voz · 0:12», «Llamada perdida» en rojo). A la derecha, la hora (en acento si hay no leídos) y el contador. Raya de 0,5 px desde x = 84.
- Contador: píldora de 20 px, 13/20 600, fondo #9CC3E4 y texto #06080C. **El mismo color en todos**: hoy hay acento en `.contacto-n` y verde en `.fila-n` y `.mis-n`.
- Los dos círculos de 46 px de llamar y videollamar en cada fila pasan a acciones al deslizar a la izquierda: Llamar · Vídeo · Eliminar. Si el dueño quiere seguir viéndolos, que sean un único glifo de 22 px sin fondo.

## C. Movimiento y tacto

**Curvas:**
- `--g-ios: cubic-bezier(.32,.72,0,1)` para hojas y pantallas, como el muelle de iOS pero sin rebote;
- `--g-sale: cubic-bezier(.2,.8,.2,1)` para lo que aparece;
- `--g-muelle: cubic-bezier(.34,1.56,.64,1)` para vueltas pequeñas, de 8 px o 8 % de escala como mucho;
- `--g-entra: cubic-bezier(.4,0,1,1)` para lo que se va.

| Qué | ms | Curva | Cambio |
|---|---|---|---|
| Burbuja recibida | 220 | sale | opacidad 0→1, Y 8→0, escala .98→1 |
| Burbuja enviada | 260 | ios | Y 16→0, escala .94→1, opacidad .4→1 |
| ✓ → ✓✓ / gris → leído | 180 / 250 | sale / ease | se dibuja el segundo trazo / cambia el color |
| Micrófono ↔ enviar | 160 / 100 | muelle / entra | escala .6↔1 y opacidad |
| Abrir hoja | 380 | ios | Y 100 %→0; velo de 0 a .5 en 300 |
| Cerrar hoja | 240 | entra | Y→100 %; al arrastrar, se cierra pasado el 30 % o a más de 0,5 px/ms |
| Menú contextual | 220 / 150 | sale / entra | escala .92→1 y opacidad, desde la burbuja |
| Pulsar un botón redondo | 90 / 200 | sale / muelle | escala .92 y vuelta (`.pulsado` ≥ 120 ms) |
| Pulsar una fila | 0 / 250 | — / ease | fondo |
| Lista → chat | 350 (atrás 300) | ios | X 100 %→0; la pantalla anterior va a −25 % con opacidad .7 |
| Foto cargada · contador nuevo | 200 | ease · muelle | fundido · escala .6→1 |

Solo se animan `transform` y `opacity`. Para que la hoja tenga salida: `.gc-cerrando` y, al acabar la animación (`animationend`), se quita `.gc-abierta`.

**Vibración.** Una sola función, `toque()`, que en el iPhone usa el interruptor nativo (iOS 17.4+, siempre dentro de un gesto; ya lo hace `haptico()`) y en Android `navigator.vibrate` (8 ms, 15 ms o `[12,60,12]` si hay error).
- **Sí vibra:** al empezar a grabar, al fijar la grabación, al cancelarla, al llegar al umbral de responder, al abrir el menú contextual, con cada cifra del teclado de «Llamar» y al conectar o colgar una llamada.
- **No vibra:** al enviar, al recibir, al escribir, al desplazar, al abrir hojas ni con los botones normales. La HIG pide no abusar y que los hápticos sean opcionales, así que va un interruptor «Vibración» en Ajustes.

**Qué NO animar**
1. El historial al abrir un chat: tiene que aparecer ya abajo, sin cascada.
2. Alto del campo, anchos, márgenes, `top` o `left`.
3. `filter`: el modo discreto anima un desenfoque en **cada** mensaje (`.lienzo .gc-mensajes>li`). Mejor una sola capa u opacidad.
4. Bucles en reposo: el halo blindado (`gcHalo 7s steps(210)`) repinta el chat entero 30 veces por segundo; basta con un barrido de 1,2 s al entrar. Lo mismo con `gcReflejo`.
5. `backdrop-filter` sobre contenido que se desplaza.
6. `prefers-reduced-motion`: solo fundidos de 120 ms, pero se mantienen los puntos de «escribiendo…» y el punto de grabación, porque informan. Hoy la regla `*{animation:none!important}` también los apaga.

## D. Prioridades

**Las 10 mejoras, en orden**
1. **Fichas de A1–A2 en `:root` y limpieza:** de 86 colores a 25, de 31 tamaños a 12, sin bordes ni brillos.
2. **Burbujas:** grupos, cola, la hora dentro con su hueco, 17/23 y las ✓ nuevas.
3. **Compositor:** glifos sin círculo, campo de 38 y «Enviar» de 34 en el mismo hueco que el micrófono.
4. **Mantener pulsado, deslizar para responder y citas.** Es lo que falta para que «funcione como WhatsApp».
5. **El inicio pasa a ser «Chats»**, con una barra de pestañas **Chats · Llamar · Ajustes** (49 px + zona segura, glifo de 26, rótulo 10/12). El Número GUARDIANA va en «Llamar» y en Ajustes, «¿Cómo funciona?» en Ajustes, y se quita la pila de botones de 62 px.
6. **Hojas** con salida y arrastre para cerrar; Ajustes como lista agrupada.
7. **Notas de voz** con onda real y velocidad 1× / 1,5× / 2×.
8. **Fotos:** hueco reservado, vista previa difuminada, anillo de carga.
9. **Cabecera viva, fecha fija arriba** y un botón «↓ 3» de 36 px cuando hay mensajes nuevos más abajo.
10. **Rendimiento.** Medir en el iPhone 13 con Web Inspector (Timelines → Rendering Frames): ningún fotograma de más de 16,7 ms al desplazar ni al enviar.

**5 cosas que restan calidad y hay que quitar**
1. **Bordes de 1 px** en `.grande`, `.ajuste`, `:where(.boton)`, `.gc-fecha`, `.gc-linea-llamada`, `.contactos-filas` y las burbujas en el PC.
2. **Brillos y sombras de color, y el «levantarse» al pasar el dedo:** `.grande.principal`, la sombra azul de `#enviar`, `.pro-tarjeta.destacada`, `.multas-b` y `.grande:hover`. En modo oscuro se eleva con superficies más claras, no con resplandor.
3. **La pila de cuatro botones iguales de 62 px en el inicio.** La HIG pide distinguir las opciones «por estilo, no por tamaño».
4. **Etiquetas en Plex Mono, en MAYÚSCULAS y muy espaciadas** («TU NÚMERO GUARDIANA», «ENCRIPTACIÓN POSTCUÁNTICA»), y el título del inicio en peso 300.
5. **El punto rojo para «no conectado»** (#E0705F). El rojo es para errores y para colgar. Propuesta: sin punto, como en WhatsApp e iMessage. Necesita el visto bueno del dueño, que lo pidió así el 29 de octubre.

**Textos.** El lema del inicio, «Lo que digas aquí no lo puede leer nadie más, ni nosotros», es una promesa absoluta. Mejor: «Encriptado de extremo a extremo: ni siquiera GUARDIANA tiene las claves para leerlo».

### Fuentes
- [Apple HIG · Typography](https://developer-mdn.apple.com/design/human-interface-guidelines/foundations/typography)
- [Apple HIG · Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons.md)
- [Apple HIG · Context menus](https://developer.apple.com/design/human-interface-guidelines/context-menus.md)
- [Apple HIG · Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics.md)
- [WebKit · An HTML Switch Control](https://webkit.org/blog/15054/an-html-switch-control/)
- [ios-haptics (npm)](https://npmjs.com/package/ios-haptics)
