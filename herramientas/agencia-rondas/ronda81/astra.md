Ronda 81 · Astra 6 (gpt-6-astra, Cheaper Inference) · la web en el teléfono, como una aplicación

a) Estructura de la app móvil
Barra inferior fija, 5 pestañas exactas: Núcleo · Radiografías · Órbita · Comunicaciones · Más.
- Núcleo: centro con tarjetas: ZERO, Radiografías, Órbita, Comunicaciones, Relato. ZERO indica: «Solo explicación en móvil. Programa para Windows».
- Radiografías: qué ve de ti una web y a quién habla.
- Órbita: mapa de cables, fibra y centros de datos.
- Comunicaciones: subpestañas Chats · Llamar · Ajustes.
- Más: ZERO, Relato, Privacidad, Escritorio.

Primera apertura: Núcleo, sin splash ni portada larga. Cabecera compacta: GUARDIANA y «Privacidad para profesionales y empresas».
Al volver: restaurar última pestaña, subpestaña y scroll. Si se abrió desde un enlace, ir a esa pantalla. El botón atrás cierra subpantallas antes de cambiar de pestaña. No simular app instalada.

b) Portada larga en teléfono
No es pantalla de entrada. Pasa a Relato, accesible desde Núcleo y Más. Una columna, capítulos plegables, planeta ligero en CSS/SVG, imágenes diferidas, barra de progreso y botón Volver a Núcleo. En Núcleo, tarjeta discreta: Leer el relato. Nunca abrir automáticamente.

c) 8 detalles que la hacen sentir app
1. Barra inferior real: fija, 56 px, respeta safe-area, desaparece con teclado.
2. Cabecera compacta: título, back nativo, sin menús hamburguesa innecesarios.
3. Transiciones cortas: 180–220 ms, fundido/deslizamiento; respetar movimiento reducido.
4. Gestos: swipe horizontal entre pestañas principales; atrás del sistema; pull-to-refresh solo en listas.
5. Estado persistente: conservar scroll, pestaña, formularios y borradores.
6. Carga por bloques: esqueletos en tarjetas y listas; nunca spinner a pantalla completa.
7. Estados vacíos exactos: «No hay chats todavía», «No hay llamadas todavía», «No hay datos de órbita», «No se pudo cargar. Reintentar», «Sin conexión. Mostrando lo guardado».
8. Respuesta táctil: zonas de 44 px, estados pulsados, hojas inferiores en vez de modales, avisos «Guardado», «Copiado». Usar dvh, IBM Plex Sans autoalojada o system-ui.

d) Errores típicos
Meter la web de PC encogida; portada larga como inicio; splash falso; intentar ocultar barras de Safari/Chrome; pedir «Añadir a la pantalla de inicio»; fuentes externas; vídeos/animaciones pesadas; hover como único estado; modales apilados; back roto; objetivos táctiles pequeños; scroll horizontal; tab bar tapada por el teclado; no recordar estado; cargar todo antes de mostrar Núcleo.
