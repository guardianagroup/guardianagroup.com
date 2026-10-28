# Ronda 74 · ChatGPT (GPT-6, esfuerzo «High», el máximo) · 28 Oct 2026, 13:30–14:15

Chat «Revisar experiencia móvil». Tres respuestas: la pregunta (A–G), el bloque H (detalle del chat) y el bloque J (varias conversaciones). Resumen fiel; lo entrecomillado es literal.

## A–G (móvil y tableta)
- Decisión: «GUARDIANA debe parecer una aplicación profesional de comunicaciones, no un panel técnico de ciberseguridad».
- Cabecera en 390 px: volver, nombre sin cortar, estado compacto, Llamada y Videollamada visibles, «⋯». Modo discreto y «Terminar» dentro de «⋯»; la seguridad, tocando el nombre. «Terminar» con confirmación («¿Terminar y borrar la conversación?… no se puede deshacer»), sin prometer el borrado de copias del otro.
- Quitar la franja repetida; «verificación criptográfica superada» no es «identidad verificada»: no mezclarlas («SELLADA» no debe sugerir identidad comprobada).
- Llamada: fuera la línea técnica (ms, resolución, fps) de la vista principal; «Tu voz» fuera de la llamada entrante; vídeo entero (contain) por defecto; el tiempo solo con la llamada contestada; botones de 48 px o más; «Colgar» siempre visible.
- Segundo plano en iPhone/Android: «No lo sé» para GUARDIANA; hay fallos documentados en WebKit; no prometer llamadas con la pantalla bloqueada. Wake Lock: hoy, con tratamiento de errores.
- Navegadores internos: nada garantizado; detectar sin bloquear, aviso «Para llamar, mejor desde tu navegador» con «Copiar enlace», «Cómo abrir» y «Continuar aquí»; no fingir que un botón abre Safari o Chrome.
- Tableta: VIGILANCIA cerrada por defecto. Teclado: campo a 16 px, sin `maximum-scale`, `interactive-widget` solo vale en Android; `visualViewport` en iPhone con cuidado.
- App sin instalar: `theme-color` #06080C, zonas seguras, `overscroll-behavior` donde toque; manifiesto opcional y sin pedirlo en la primera visita; un service worker solo con recursos públicos.

## H (detalle del chat)
- Llamadas al lado de quien llamó; textos (saliente, entrante, sin respuesta, perdida, rechazada, cancelada, interrumpida); mm:ss y h:mm:ss; colores: contestada azul, perdida y rechazada coral, cancelada gris, comunicando e interrumpida ámbar.
- Tics: verde #5CC98A solo para leído («no usaría el azul de marca para leído»). «Leído» solo con la pestaña visible, la conversación delante, el mensaje en pantalla (umbral propio: 50 % o 120 px, 500 ms), sin la llamada en grande ni una hoja encima.
- «Escribiendo…»: burbuja a la izquierda al final, no en la cabecera; renovar cada 3 s, parar a los 2,5 s sin escribir, el receptor lo quita a los 5,5 s; no mandar texto parcial ni pulsaciones.
- Agrupar hasta 5 minutos; separadores «Hoy», «Ayer», fecha.
- Privacidad: ajustes recíprocos («Confirmaciones de lectura» e «Indicadores de actividad»), activados de entrada; nada de «En línea» ni «Última vez».

## J (varias conversaciones)
- «Sí a varias conversaciones simultáneas en el mismo navegador»; la regla: crear o unirse nunca termina ni toca otra.
- Ordenador: lista a la izquierda (280–320 px); móvil: lista y chat en dos pantallas («‹» vuelve a la lista); sin vista previa del texto («Nuevo mensaje», «Archivo recibido», «Videollamada perdida»); alias locales («Conversación 1», «Cambiar nombre»), que no viajan.
- Mensaje de otra sala: contador y aviso dentro de la app (4 s), sin cambiar de chat. Una sola llamada activa por navegador; la otra sala recibe «No disponible» sin revelar nada.
- Un WebSocket compartido para el lanzamiento («el relé puede relacionar salas por esa conexión»); separar conexiones, después y medido. Límite provisional: 5 salas.
- Terminar solo la sala elegida, con confirmación fiel a lo ocurrido; conservar la conversación creada antes de la actualización. Lista de pruebas (tres salas, blindada en segundo plano, llamada desde otra sala, recarga, red).
