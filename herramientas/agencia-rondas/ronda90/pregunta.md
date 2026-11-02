# Ronda 90 · 2 nov 2026 · la llamada en el teléfono (para Gemini)

Dueño, 14:11–14:25: «en caso de que se pierda la llamada en el móvil por cualquier cosa, una llamada entrante, lo que sea, quiero
que siempre se quede en segundo plano y que vuelva la llamada»; «si solo la minimizo y me voy a otra, no quiero que se cuelgue»;
«que yo siga viendo a mi amigo en pequeño, en la pantalla, lo pueda mover donde yo quiera»; «que él vea lo que yo estoy viendo en
mi pantalla»; «háblalo con la gente… Ayúdate con Gemini… ya sé que es una tarea difícil».

Texto que se le pasa a Gemini:

> Contexto: GUARDIANA Comunicaciones es una web (sin app de tienda) con videollamadas WebRTC encriptadas de extremo a extremo,
> por servidores TURN propios, con una capa postcuántica en Chromium (RTCRtpScriptTransform). Una videollamada del PC se pasa al
> teléfono con un código QR: el teléfono abre una página en Safari (iOS) o Chrome (Android), sin instalar nada.
> Necesito respuestas verificadas, con enlace a la fuente oficial (WebKit, Chromium, MDN, Apple, Google) y la versión desde la que
> funciona; separa lo verificado de lo que no lo esté.
> 1. Safari en iPhone (iOS 18 a 27): si la persona sale a otra app o bloquea la pantalla durante una videollamada WebRTC, ¿qué se
>    pausa (cámara, micrófono, audio que llega, JavaScript, la conexión) y cuánto tarda? ¿Cómo se recupera al volver (eventos,
>    volver a pedir la cámara, reinicio de ICE)?
> 2. Imagen flotante en el teléfono (ver a la otra persona en pequeño, movible, mientras se usa otra app): en Safari iOS,
>    requestPictureInPicture / webkitSetPresentationMode y el atributo autopictureinpicture con un vídeo cuyo srcObject es un
>    MediaStream de WebRTC; en Chrome Android, requestPictureInPicture y la entrada automática al salir (Media Session
>    «enterpictureinpicture»). ¿Qué funciona hoy y desde qué versión?
> 3. Compartir la pantalla del teléfono desde la web: getDisplayMedia en Safari iOS 27 (¿existe? ¿captura la pantalla entera o
>    solo la página?) y en Chrome Android.
> 4. Una llamada de teléfono normal que entra durante la videollamada (iOS y Android): ¿qué les pasa a las pistas y cómo se
>    recupera la videollamada al colgar esa llamada?
> 5. ¿Qué más harías para que la llamada no se corte nunca y, si se corta o se cuelga, se pueda volver a llamar con la misma
>    página abierta?
