# Pruebas de GUARDIANA Comunicaciones (teléfono simulado)

Playwright + Chromium emulando un iPhone (393 × 793, táctil, «instalada» con navigator.standalone).
Desde la raíz del repositorio, en dos terminales:

    node zero-motor/pruebas/rele.js 8794
    python3 -m http.server 8080 --bind 127.0.0.1

Después, desde esta carpeta:

- `node revision2.js` — todas las pantallas del teléfono (inicio, idiomas, «Invitar a chat» en un toque con navigator.share simulado, chat, menú ⋯, clip, contactos, llamadas, videollamada con 5 botones, guía). Capturas en `revision2/`.
- `node dos.js salida [teclado|voz|video|colgar]` — dos teléfonos: teclado, tonos, voz (2 pistas de audio: voz + muda), videollamada partida.
- `node altavoz.js` — altavoz o auricular: las dos salidas del iPhone simuladas (con la regla del toque); la voz y los silencios que fijan la salida van juntos, vuelven a empezar tras conectar y tras cada cambio, y el botón dice la verdad.
- `node contactos.js` — guardar contactos, volver, llamar desde la lista, recargas.
- `node tirar.js` — tirar para actualizar (solo el ✓, sin palabra).
- `node web.js` — la página en el ordenador y en el navegador del teléfono.
- `node ingles.js` — textos nuevos en inglés.
- `python3 hoja.py salida.png 360 a.png b.png …` — junta capturas en una hoja.
