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

## Fases 3 a 6 (plan.md)
- Mantener pulsado (Responder · Reenviar · Información · Borrar; sin «Copiar», por la regla del 28 Oct 15:17) y deslizar para
  responder con cita.
- Notas de voz con onda real y velocidad 1× / 1,5× / 2×; fotos con hueco reservado y vista previa.
- Hojas con salida animada y arrastre para cerrar.
