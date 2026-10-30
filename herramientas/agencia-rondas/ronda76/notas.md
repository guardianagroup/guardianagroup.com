# Ronda 76 · notas · el chat a la altura de Apple

Dueño, 30 Oct 2026, 00:09: «un chat espectacular, a la altura de Apple… que no parezca botonería»; 00:34: «aplica todo a vuestro
gusto… confío en vosotros».

Voces: voz independiente (claude.md, completa). Astra: pregunta enviada a las 00:13 en el Playground; su respuesta se recoge en
astra.md en cuanto el ordenador del dueño vuelva a estar conectado, y lo que difiera se ajusta.

## Fase 1 (preparada en diseno.css, que se cargará después de app.css; plan completo en plan.md)
- Fichas de color y medida en `:root` (`--g-*`).
- Burbujas sin borde, 17/23 en el teléfono, grupos con radios 18/6/4 y la cola solo en la última (con `:has()`), hora y ✓ dentro
  en la línea del texto (hueco invisible al final), ✓✓ leído en azul #62C6FF, entrada con movimiento solo para las nuevas.
- Fecha en píldora sin borde, fija arriba al desplazar.
- Compositor: glifos sin círculo en acento, campo de 38 px, «Enviar» como círculo de 34 dentro de su hueco de 44.
- Botones: uno relleno por pantalla; los secundarios, texto en acento sin caja; sin bordes ni brillos; sin hover en táctil.
- Ajustes como lista agrupada del iPhone.

## Fases 2 a 6 (plan.md)
- Pestañas abajo: Chats · Llamar · Ajustes (aprobado por el dueño, 00:34).
- Mantener pulsado (Responder · Reenviar · Información · Borrar; sin «Copiar», por la regla del 28 Oct 15:17) y deslizar para
  responder con cita.
- Notas de voz con onda real y velocidad 1× / 1,5× / 2×; fotos con hueco reservado y vista previa.
- Hojas con salida animada y arrastre para cerrar.
