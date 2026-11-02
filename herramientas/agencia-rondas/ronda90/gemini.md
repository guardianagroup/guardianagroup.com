# Ronda 90 · lo que respondió Gemini (modo «Gemini Argon», 2 nov 2026, 14:27–14:31)

Resumen fiel de su respuesta (la pregunta, en `pregunta.md`); entre corchetes, lo que Claude comprobó después (`claude.md`).

1. **iPhone en segundo plano.** La cámara se pausa al instante (la pista de vídeo pasa a «muda»; sigue «viva»). Micrófono y
   audio que llega siguen, con la sesión de audio de Safari; mientras hay audio, la pestaña no se suspende y la conexión TURN y
   el Worker de la capa siguen. Sin audio activo, iOS congela la pestaña entre 5 y 30 s. Al volver: WebKit reactiva la cámara
   solo (evento «unmute»); a veces el `<video>` se queda congelado y basta `play()` al volver a estar visible. Si otra app tomó la
   cámara, la pista acaba («ended»): hay que pedir la cámara otra vez y cambiarla con `replaceTrack` (la transformación del
   emisor se conserva). Si la conexión cayó, reinicio de ICE.
2. **Imagen flotante.** `requestPictureInPicture()`: Safari iOS 13.4 (iPhone desde iOS 14) y Chrome Android 105, con un toque en
   un botón; funciona con un `<video>` de WebRTC que se esté reproduciendo. La entrada automática al salir («enterpictureinpicture»,
   Chrome 120) es solo de escritorio; en el teléfono no hay entrada automática salvo con el vídeo a pantalla completa (Android).
   [Comprobado: la tabla de compatibilidad da Chrome Android 105 y Safari iOS 13.4; el artículo de Chrome sobre la entrada
   automática habla solo de escritorio, Chrome 120.]
3. **Compartir la pantalla del teléfono.** Según Gemini, ni Safari iOS (tampoco iOS 27) ni Chrome Android. [En contra: el
   explorador de funciones de la web da «Safari on iOS 27»; los responsables de MDN lo confirmaron con su prueba en Safari iOS
   27.0 (BrowserStack) y hay un informe en un iPhone real; Apple no lo ha anunciado. Chrome Android: no, en las dos fuentes.]
4. **Llamada de teléfono que entra.** iOS: las pistas pasan a «mudas» y el vídeo que llega se pausa; si la llamada dura más de
   ~30 s, la conexión suele caer; al volver, a veces el micrófono queda «ended» o el contexto de audio «interrupted». Android:
   el micrófono se silencia y vuelve solo al colgar. Recuperación al volver: reanudar el audio, pedir de nuevo lo que acabó,
   `play()` y reinicio de ICE.
5. **Para que no se corte y se pueda volver a llamar.** Wake Lock; `audioSession.type = "play-and-record"`; TURN por UDP y por
   TLS en el 443; reinicio de ICE a los 2,5 s de un corte, con la conexión de señal reabierta primero; tras cambiar una pista o
   reiniciar ICE, pedir una imagen clave; no cerrar la sala al colgar: cerrar solo la conexión y ofrecer «Volver a llamar» en la
   misma página; `pageshow` con `persisted` para reconectar.
