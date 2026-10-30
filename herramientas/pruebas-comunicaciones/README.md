# Pruebas de GUARDIANA Comunicaciones (teléfono simulado)

Playwright + Chromium emulando un iPhone (393 × 793, táctil, «instalada» con navigator.standalone).
Desde la raíz del repositorio, en dos terminales:

    node zero-motor/pruebas/rele.js 8794
    python3 -m http.server 8080 --bind 127.0.0.1

Después, desde esta carpeta:

- `node revision2.js` — todas las pantallas del teléfono (inicio, idiomas, «Invitar a chat» en un toque con navigator.share simulado, chat, menú ⋯, clip, contactos, llamadas, videollamada con 5 botones, guía). Capturas en `revision2/`.
- `node dos.js salida [teclado|voz|video|colgar]` — dos teléfonos: teclado, tonos, voz (2 pistas de audio: voz + muda), videollamada partida.
- `node altavoz.js` — altavoz o auricular: las dos salidas del iPhone simuladas (con la regla del toque); la voz y los silencios que fijan la salida van juntos, vuelven a empezar tras conectar y tras cada cambio, y el botón dice la verdad.
- `node whatsapp.js` — «Invitar a chat» en el iPhone: la hoja «WhatsApp» / «Otra app», el enlace whatsapp:// con la invitación, la ida y vuelta a WhatsApp, el chat con ese enlace, qué pasa si WhatsApp no se abre, y Android sin hoja.
- `node instalar.js` — «¿Añadir GUARDIANA a tu pantalla de inicio?» tras aceptar una invitación: Android (con y sin el aviso del navegador), «Ahora no», el ordenador y el iPhone (sin pregunta).
- `node enviar.js` — el botón de enviar: en el sitio del micrófono, del mismo tamaño, de color, lejos del teclado y con respuesta al pulsarlo.
- `node actualiza.js` — la actualización sola: con una versión nueva simulada, espera a que no haya nada a medias, se recarga, vuelve al mismo chat y no entra en bucle.
- `node tipos.js` — chat normal y chat blindado: la hoja de invitar, los enlaces «#i=» y «#b=», el marco y el velo del blindado, los números al escribir, «Voz grave» y «Mosaico» solo con la llamada en marcha, y la tecla de captura en el ordenador.
- `node contactos.js` — guardar contactos, volver, llamar desde la lista, recargas.
- `node tirar.js` — tirar para actualizar (solo el ✓, sin palabra).
- `node web.js` — la página en el ordenador y en el navegador del teléfono.
- `node ingles.js` — textos nuevos en inglés.
- `python3 hoja.py salida.png 360 a.png b.png …` — junta capturas en una hoja.
- `node ../csp-comprueba.js` (desde la raíz: `node herramientas/csp-comprueba.js`) — la Content-Security-Policy de toda la web, página a página, en Chromium: cero violaciones y cero manejadores en línea. Antes, si cambió algún script escrito dentro de una página (también en m/, e/ y Comunicaciones), `python3 herramientas/csp-hashes.py` recalcula los hashes de script-src; si no, el navegador deja ese script sin ejecutar.
