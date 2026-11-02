# Ronda 90 · lo que comprobó Claude (2 nov 2026)

- **Imagen flotante (API de vídeo):** Chrome Android desde 105; Safari iOS desde 13.4.
  Fuente: <https://web-platform-dx.github.io/web-features-explorer/features/picture-in-picture.json>.
- **Entrada automática en imagen flotante para videollamadas:** Chrome 120 de escritorio; exige el manejador
  «enterpictureinpicture» de Media Session y estar usando la cámara o el micrófono; abre la ventana sin foco y la cierra al
  volver a la pestaña. No habla de Android. Fuente: <https://developer.chrome.com/blog/automatic-picture-in-picture>.
- **Compartir pantalla (getDisplayMedia):** escritorio sí (Chrome 72, Safari 13…); Chrome Android no; Safari iOS 27 sí según el
  explorador de funciones (<https://web-platform-dx.github.io/web-features-explorer/features/screen-capture/>) y según la
  prueba de MDN en Safari iOS 27.0, con un informe en un iPhone real
  (<https://github.com/mdn/browser-compat-data/issues/30654>, <https://github.com/bigbluebutton/bigbluebutton/issues/26200>).
  Apple no lo ha anunciado y Gemini dice que no: se ofrece solo si el navegador lo tiene (el botón no sale si no) y no se
  promete en público hasta probarlo en un iPhone de verdad.
- **Lo que ya hace Comunicaciones** (llamada.js): Wake Lock, `audioSession` «play-and-record», TURN por UDP y TLS 443, reinicio
  de ICE con reintentos durante un minuto (desde hoy), comprobación del relé al cortarse.
