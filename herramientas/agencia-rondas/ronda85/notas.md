# Ronda 85 · notas (30 Oct 2026) · la web en el teléfono, como una app nativa

Voces: Astra 6 (astra.md) y una voz de diseño independiente (claude.md, con sus iconos dibujados).

## Lo que coinciden las dos voces (se aplica)
- Barra de pestañas fija abajo con etiquetas siempre visibles: Inicio · Comunicaciones · Radiografías · Órbita. Tocar la activa
  sube al principio. Nada de menú hamburguesa ni doble navegación.
- Transiciones cortas entre páginas (View Transitions entre documentos): fundido entre pestañas; entrada lateral corta hacia una
  página de dentro; con prefers-reduced-motion, nada.
- Respuesta al toque inmediata (:active propio, sin el resaltado gris), zonas de 44 px, campos de 16 px, sin bloquear el zoom,
  safe-area y dvh.
- El relato de la portada, en tarjetas con desplazamiento nativo (scroll-snap), asomando la siguiente, sin avance automático.
- Órbita entra directa al planeta (sin NÚCLEO), con sus hojas por encima de la barra; nada de WebGL en Inicio.
- Comunicaciones conserva su propia barra (Chats · Llamar · Ajustes).
- Evitar: promesas absolutas, cifras sin fuente, dos botones principales distintos, pantallas de carga con logo.

## Donde no coinciden y qué se eligió
- Cabecera. Astra: título grande que se encoge (iOS). Diseño: barra pequeña fija, porque en Android el título grande parece un
  iOS de imitación. Se hace lo que satisface a las dos: barra pequeña fija y transparente; el título de la página va en el
  contenido (28–30 px) y, cuando se va por arriba, aparece centrado en la barra.
- Barra de pestañas. Diseño: sólida (#080B10), sin cristal (sobre negro no se aprecia y gasta encima del planeta). Se toma.
- Inicio. Astra: Comunicaciones como tarjeta principal y accesos a Radiografías y Órbita. Diseño: relato, última radiografía y
  una lista «Más». Se hace: antetítulo y titular, el relato en 5 tarjetas, Comunicaciones (lo que se usa en el teléfono) y la
  lista «Más» (ZERO, Cómo funciona, Idioma, Términos, Privacidad). La «última radiografía» con datos reales, para otra fase.
- Iconos: Inicio, Comunicaciones y Radiografías de la voz de diseño; Órbita, el planeta con su órbita de Astra.
- Relato: las frases de la voz de diseño, sin el «30 milisegundos» ni los «100 milisegundos» de la portada (no tienen fuente en
  terminos.html §6); la subasta lleva su fuente (Irish Council for Civil Liberties, 16 de mayo de 2022).

## Pendiente (para proponer al dueño)
- Comunicaciones en el iPhone: quitar del todo «Añadir a la pantalla de inicio» obliga a aceptar invitaciones en Safari (ronda 72
  lo desaconsejaba: sin avisos con la página cerrada y con el borrado de Safari a los 7 días). Decisión del dueño.
- Cabecera de Comunicaciones en el teléfono: «¿Por qué?», el engranaje e «ES» a Ajustes (voz de diseño).
- «Grado gubernamental» en la bienvenida de Comunicaciones: la voz de diseño lo marca como adjetivo que no se puede demostrar.
- Radiografías: filtros como control segmentado fijo; tarjeta «Última radiografía» en Inicio con datos del mismo origen.
