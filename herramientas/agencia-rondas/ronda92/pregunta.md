# Ronda 92 · 2 nov 2026 · Comunicaciones en dos versiones (Blindada y Ultra) y qué sigue gratis (para Gemini)

Dueño, 17:01: «También necesito que en la versión de llamadas, actualmente esta es la llamada, digamos, blindada, que ya es
buena, pero ahora quiero que hagas la versión ultra, ¿sí? Que es la que tiene el mosaico, que es la que tiene, por ejemplo,
más tecnología de encriptación, la máxima que se pueda hallar, no se puede hacer ya más seguro, que tenga la voz
distorsionada, y no sé qué cosas más le pudiéramos meter. Esto de los números, esto de que cuando abrimos vemos unos números
y tal, quiero que lo dejes para la versión ultra. En la versión, digamos, que será la blindada, que es la normal, no quiero
que esté ese servicio… Solo hay dos modelos, el blindado y el ultra. El blindado es el gratis… Quiero que sea gratis junto
con órbita. Y… vamos a darle 7 días gratis a la gente. Ya veremos, son 3 días o 7… Cuando se acaben los 3 o 7 días de
prueba, quiero que sigan funcionando algunas cosas. La VPN, no. Las llamadas, comunicaciones, sí, pero solamente con
blindada… La ultra ya tiene que ser con la suscripción… el resto que puede funcionar todo para que la gente vea los datos.
El navegador, sí, también quiero que lo dejes gratis… lo que realmente vamos a dejar es de pago, va a ser la VPN, las
llamadas ultra y, bueno, a ver qué más. Háblalo con Gemini y a ver qué me recomiendas».

Estado de hoy (leído en `orbita/comunicaciones/index.html`, `llamada.js`, `medios-pq.js` y `voz.js`; detalle en `claude.md`):
la web anuncia tres versiones (Fuerte y Blindado gratis, Ultra de pago, «prepago por horas, día o mes, sin cuenta»);
llamadas WebRTC encriptadas de extremo a extremo por los relés TURN de GUARDIANA; capa postcuántica en audio y vídeo con
llave que cambia cada 2 minutos; número de seguridad de la llamada de 4 dígitos y código grande y rojo que cambia con la
llave, con «Coinciden / No coinciden»; mosaico y voz más grave en la videollamada blindada; paso del PC al teléfono; envío
de archivos y recibo de entrega previsto para Ultra. Prueba de 7 días sin tarjeta y 30 días de reembolso (`terminos.html`).

## Lo que se le mandó a Gemini

**1) Modo «Tarea», modelo Argon, 17:2x** (conversación en la cuenta del dueño). Contestó los puntos 1 a 4 y se cortó por el
límite de uso antes del 5. Texto exacto:

> Contexto: GUARDIANA es un programa para Windows con una sola cuota mensual (Comunicaciones, Antivirus, navegador ZERO, VPN
> y Órbita). Comunicaciones hoy (web y programa): llamadas y videollamadas WebRTC encriptadas de extremo a extremo
> (DTLS-SRTP), siempre por los relés TURN propios de GUARDIANA; encima, una capa postcuántica en el audio y el vídeo
> (RTCRtpScriptTransform con AES-256-GCM; la llave sale de la sesión del chat, con ML-KEM-768, o ML-KEM-1024 en la
> blindada) cuya llave cambia cada 2 minutos; un número de seguridad de la llamada de 4 cifras (con compromiso previo y
> atado a las huellas DTLS) y un código grande y rojo en el centro de la pantalla que cambia con la llave cada 2 minutos,
> con «Coinciden / No coinciden», para que las dos personas comprueben de viva voz que nadie se ha puesto en medio; mosaico
> y voz más grave en la videollamada blindada, hechos en el equipo antes de encriptar; la llamada pasa del PC al teléfono;
> envío de archivos, con recibo de entrega previsto para Ultra. Hoy la web anuncia tres versiones (Fuerte y Blindado,
> gratis; Ultra, de pago).
>
> El dueño quiere solo dos: «Blindada», gratis (la llamada de hoy), y «Ultra», de pago: con mosaico, «la máxima encriptación
> que se pueda hallar», voz distorsionada «y no sé qué cosas más le pudiéramos meter». Quiere quitar «los números» de la
> Blindada y dejarlos solo en Ultra. Prueba gratis de 3 o 7 días; al acabar seguirían funcionando las llamadas Blindada, el
> navegador ZERO y los datos de Órbita; no la VPN ni las llamadas Ultra. De pago: «la VPN, las llamadas ultra y, bueno, a
> ver qué más».
>
> Necesito respuestas con fuentes enlazadas y la fecha en que las leíste; separa lo comprobado de lo que no; nada de
> promesas absolutas ni de marketing.
>
> 1. ¿Qué va en Blindada (gratis) y qué en Ultra (pago)?
>
> 2. El coste honesto de quitar la verificación de la Blindada: sin comparar un código, un relé o el servidor de
> señalización podría ponerse en medio sin que se note. Alternativas: una verificación discreta dentro de «Seguridad de la
> llamada» en la Blindada y el código grande y rojo que cambia en Ultra; continuidad de claves con aviso si cambian; otras.
> ¿Cuál recomiendas y cómo se explica sin asustar ni engañar?
>
> 3. Tecnología real y comprobable para que Ultra sea lo más seguro posible, sin marketing: intercambio híbrido
> postcuántico, renovación de llaves, SFrame (RFC 9605) y MLS (RFC 9420) para grupos, minimizar metadatos (relleno, audio a
> tasa constante frente a las fugas de la tasa variable, dos relés de operadores o países distintos), distorsión de voz en
> el equipo, avisos contra la grabación (qué se puede detectar y qué no, en Windows y en el navegador) y protección de la
> pantalla contra capturas en el programa de Windows. ¿Qué tienen ya Signal, WhatsApp, Threema, Wire, Element, Zoom y
> FaceTime?
>
> 4. Qué protege de verdad un cambiador de voz y qué no (reconocimiento automático de quien habla, si el cambio de tono se
> puede deshacer, acento, contenido).
>
> 5. Prueba gratis de 3 o 7 días: ¿qué convierte mejor y qué es justo? Fuentes con datos (informes del sector) y lo que
> dicen las leyes de consumo (UE y España, Colombia, EE. UU.) sobre pruebas, renovación automática y baja.
>
> 6. ¿Qué debe seguir funcionando al acabar la prueba? Valora la idea del dueño, incluido qué hacer con el Antivirus.
>
> 7. Estructura de precios, con fuentes: precios de competidores que unen VPN, antivirus y mensajería, y si conviene un
> precio aparte para Ultra.

**2) Modo «Chat», modelo 3.5 Flash-Lite (el único disponible tras el límite), 17:4x**, en una conversación nueva para los
puntos 5 a 7 (la de Tarea no admite ese modelo). Texto exacto:

> Contexto: GUARDIANA es un programa para Windows con una sola cuota mensual: Comunicaciones (llamadas y chat encriptados de
> extremo a extremo), Antivirus, navegador ZERO, VPN y Órbita (la pantalla que enseña con quién habla el ordenador). El dueño
> quiere dos versiones de las llamadas: «Blindada», gratis, y «Ultra», de pago (mosaico, voz distorsionada, la encriptación
> más fuerte y el código de seguridad grande en pantalla). Hoy la prueba de GUARDIANA dura 7 días, no pide tarjeta y hay 30
> días de reembolso sin preguntas; la pasarela de pago es Dodo Payments. Precio publicado hoy de GUARDIANA «Plus» (todo el
> programa): Latinoamérica 2,49 US$/mes o 23,90 US$/año; Europa 4,49 €/mes o 43,10 €/año; Reino Unido 3,99 £/mes; resto del
> mundo 4,99 US$/mes o 47,90 US$/año.
>
> Necesito respuestas con fuentes enlazadas y la fecha en que las leíste; separa lo comprobado de lo que no; nada de
> promesas absolutas ni de marketing.
>
> 1. Prueba gratis de 3 o 7 días: ¿qué convierte mejor y qué es justo? Fuentes con datos (informes del sector) y lo que
> dicen las leyes de consumo (UE y España, Colombia, EE. UU.) sobre pruebas, renovación automática y baja.
>
> 2. ¿Qué debe seguir funcionando al acabar la prueba? Valora la idea del dueño: llamadas Blindada sí, Ultra no, VPN no,
> navegador ZERO sí, datos de Órbita sí. ¿Y el Antivirus?
>
> 3. Estructura de precios, con fuentes: precios de competidores que unen VPN, antivirus y mensajería, y si conviene un
> precio aparte para Ultra.
