# Ronda 76 · notas · el chat a la altura de Apple

Dueño, 30 Oct 2026, 00:09: «un chat espectacular, a la altura de Apple… que no parezca botonería»; 00:34: «aplica todo a vuestro
gusto… confío en vosotros».

Voces: voz independiente (claude.md, completa). Astra: pregunta enviada a las 00:13 en el Playground; su respuesta se recoge en
astra.md en cuanto el ordenador del dueño vuelva a estar conectado, y lo que difiera se ajusta.

## Las tres propuestas (00:58) y la elección
Se enseñaron tres capas sobre la app real, con las mismas pantallas: A · Tinta (burbujas con cola, leído en azul vivo),
B · Sello (esquinas moderadas, sin cola, hilo fino en las ajenas, leído en el acento) y C · Lámina (burbujas sin fondo,
separadas por rayas). Recomendación de la agencia: B, por ser la que mejor casa con «privacidad, no ocio» y con el encargo
(«botones rectangulares, esquinas moderadas»). El dueño eligió B a las 01:05 («Ok si»).

## Fase 1 (hecha, diseno.css «Sello», cargada después de app.css; plan completo en plan.md)
- Fichas de color y medida en `:root` (`--g-*`).
- Burbujas sin borde ni cola, 17/23 en el teléfono, radio 12 y 4 en las esquinas que se tocan dentro de un grupo (con
  `:has()`), hilo de 0,5 px en las ajenas, hora y ✓ dentro en la línea del texto (hueco invisible al final; si no cabe,
  baja sola), ✓✓ leído en el acento, entrada con movimiento solo para las nuevas (clase `g-nueva`, mensajes de menos de 4 s).
- Fecha en píldora sin borde, fija arriba al desplazar.
- Compositor: glifos sin círculo en acento, campo de 38 px con radio 10, «Enviar» como cuadrado redondeado dentro de su
  hueco de 44.
- Botones: uno relleno por pantalla; los secundarios, texto en acento sin caja; sin bordes ni brillos; sin hover en táctil.
- Ajustes como lista agrupada del iPhone; la lista de chats a todo el ancho, filas de 72 px con raya fina.

## Fase 2 (hecha): pestañas Chats · Llamar · Ajustes (aprobado por el dueño, 00:34)
- Solo en el móvil con Número GUARDIANA (`modoPestanas()`); en el chat y en la bienvenida no hay pestañas.
- «Chats» es el inicio: título grande, buscador (filtra por nombre), «+» (abre «Llamar»); «Editar» sigue.
- «Llamar»: Tu Número GUARDIANA arriba (compartir), el campo y el teclado.
- «Ajustes»: la hoja de siempre, con «¿Cómo funciona?» y «¿Por qué?» como filas (antes, botones del inicio).
- Pruebas adaptadas: con pestañas no hay flecha atrás en Chats ni engranaje arriba (numero.js, iphone.js); el botón grande
  del inicio sin número se llama `#ver-contactos-inicio` (contactos, eliminar, voz, dos, mismo-chat).

## Fase 3 (hecha, 2288b9e2)
- Mantener pulsado un mensaje (o clic derecho / la flechita al pasar el ratón en el PC): Responder · Reenviar · Guardar ·
  Información · Borrar; sin «Copiar» (regla del 28 Oct, 15:17). Deslizar a la derecha responde. La cita va cifrada dentro del
  mensaje («cita»: id, de, texto). «↓ nuevos» con el número. La inicial del nombre en el avatar de la cabecera.

## Fase 4 y acabados del dueño (30 Oct, 07:57–08:24)
- Notas de voz: onda real (44 barras guardadas con el mensaje), 1× · 1,5× · 2×, la onda en el centro exacto del ▶, ‖ al instante.
- Fotos: medidas en el anuncio (w, h) y hueco reservado; la foto sola, hora en la esquina, descarga abajo a la izquierda; visor.
- «Llamar»: sin título, tu número en una fila con compartir, el número marcado sin caja y centrado (medido en píxeles), botón
  verde redondo; el teclado se ajusta al alto (ajustaTeclado, teclas de 52 a 78 px).
- Chats sin «Editar»: mantener pulsado o deslizar a la izquierda → «Eliminar» / «Quitar».
- Idioma a la derecha; pestañas a tercios y centradas en alto; en el PC, los iconos de la barra de escribir alineados por su dibujo.
- Diferencia móvil / PC (dueño, 07:57): el mismo aspecto; cambia el manejo (pestañas y gestos en el móvil; columnas, ratón,
  Intro y Esc en el PC).

## Avisos al teléfono (dueño, 08:27: «máxima precisión y detalle»)
- Teléfono congelado sin decir «fuera»: si un texto no tiene acuse a los 4 s, se avisa igual (vigilaAcuse).
- El aviso dice el nombre que tú le pusiste (leído en tu teléfono; el servidor no lo sabe): «Fran · 3 mensajes nuevos».
- Prueba: avisos-precision.js (en el chat, en la lista, en segundo plano, congelado, cerrada; el texto del aviso).

## Pendiente
- Fase 5: información del chat en una hoja; estados vacíos, de error y de conexión. Fase 6: auditoría a 393/430/768/1.100/1.440.
- Grupos (chat y llamadas de tres o más): propuesta; el dueño la pidió para probar con su hijo y un amigo (08:33).
