# Ronda 73 · Llamada urgente y añadir a alguien a la llamada · cruce

28 Oct 2026, 11:55–12:40 (Bogotá). Voces: ChatGPT (GPT-6, «Alta»; `chatgpt.md`, completa), DeepSeek V4 Pro (sustituye a Astra por saldo; `deepseek.md`, cortada en el bloque B por el límite de 4.096 tokens) y Gemini (Argon; `gemini.md`, completa en dos mensajes). Pregunta: `pregunta.md`.

Origen (dueño, durante una videollamada de prueba Bogotá–Praga): «a las 3 de la mañana… él ha cerrado la página o se le ha ido la luz… ¿cómo podría contactar con él?»; y su amigo: «añadir a alguien a la llamada… con un enlace… muy fácil».

**En una frase:** una web cerrada no se puede despertar sola; lo honesto es un **aviso urgente por Web Push** que cada persona autoriza antes (y un **móvil «timbre»** para cuando se va la luz), y para el grupo, **llamadas de hasta cuatro en malla por nuestro TURN** con **entrada por enlace de un solo uso, aprobación y verificación**. Todo para después del lanzamiento.

## Lo que dicen las voces (coinciden)
1. **Web Push es la vía principal** (service worker + VAPID + RFC 8291): la suscripción viaja por el canal encriptado, quien llama encripta el aviso y el servidor solo lo firma y entrega. Límites reales: Android llega con el navegador cerrado; iPhone solo con la web añadida a la pantalla de inicio (iOS 16.4+); ordenador solo con el navegador en marcha; ordenador apagado o sin internet, nada.
2. **Lo que ve cada tercero:** el servicio Push (Google, Apple, Mozilla) ve la suscripción, la hora y el tamaño, no el contenido; nuestro servidor ve el destino del aviso en el momento de enviarlo. **VAPID no encripta**, autentica. No decir «nadie sabe con quién hablas».
3. **Si se va la luz, solo queda el móvil con datos:** un «timbre» vinculado con un QR. Hoy la identidad vive solo en el navegador del ordenador: el timbre avisa, pero para hablar hay que volver al ordenador, salvo que se haga multidispositivo bien hecho (sin copiar claves privadas).
4. **SMS, correo u otra app:** solo opcionales y por iniciativa de la persona; rompen «sin teléfono ni correo» si los gestiona GUARDIANA.
5. **UnifiedPush / ntfy:** no son universales (Android con distribuidor; iOS pasa por Apple). Más adelante, para avanzados.
6. **Antiabuso y descanso:** permiso explícito por contacto para avisos urgentes; horas de silencio (ChatGPT 23:00–08:00, DeepSeek 22:00–07:00) con las urgencias nocturnas desactivadas de entrada; límites (ChatGPT: 2 en 30 min, 5 en 24 h); sin repeticiones automáticas; «Urgency: high» no salta el «No molestar» del sistema. Gemini: una notificación web suena 1–2 s; **no es un timbre continuo de 30 s** como una llamada del sistema (sin CallKit en una web).
7. **Grupo de 3–4: malla por TURN** con sesiones por pares (A–C y B–C nuevas; C no recibe nada de A–B). SFU con SFrame y MLS, solo si hay que escalar.
8. **Entrar por enlace:** el enlace es una solicitud, no un pase: secreto en el fragmento `#`, caducidad corta, un solo uso; todos aprueban; verificación del código de identidad; solo medios desde que entra; nada de lo anterior.

## Lo que añade Gemini (y se adopta)
- **Bajar la calidad al entrar más gente** (3 → 480p, 4 → 360–480p) para que la subida de cada uno no pase de ~1,5 Mb/s; audio con prioridad y botón «Modo solo voz».
- **Las vistas previas de los chats no gastan el enlace:** solo se activa al pulsar «Entrar a la llamada».
- **Código corto de seguridad** (dos cifras derivadas de las claves) para confirmarlo de viva voz al entrar.
- **La señalización por el canal encriptado impide que el servidor cambie el certificado DTLS** (ya es así en las llamadas de dos).
- **Nombre y texto legal:** «Aviso prioritario entre contactos» o «Timbre urgente», nunca «emergencias» (eso obligaría a conectar con el 123 / 112).
- Sin comprobar (no se usan): «coturn con 2 vCPU reenvía 250–400 Mbps (40–60 llamadas de 4)» y «1,00 € por TB extra en Hetzner».

## Correcciones que aplica GUARDIANA
- DeepSeek dice que las sesiones de la llamada usarían «ECDH P-256 + ML-KEM, como ahora»: no. El audio y el vídeo van con DTLS-SRTP de WebRTC; lo dice ChatGPT y ya lo dice la web («el audio no es postcuántico»).
- DeepSeek compara «6–12 Mb/s» con «20 TB al mes»: velocidad y volumen. A 12 Mb/s de salida son unos 5,4 GB por hora.
- **Privacidad (ChatGPT):** el TURN ve las IP, puertos, tiempos y volumen aunque no guarde nada: tiene que constar en la política de privacidad. **Ya consta** en el borrador de `legales` (privacidad.html): «Pasan siempre por el servidor de llamadas de GUARDIANA, que ve las direcciones IP de los dos, las horas y el volumen, no el audio ni la imagen, y está configurado sin registros.»

## Medido hoy (para las cuentas)
- Videollamada real Bogotá–Praga, 12 min 25 s: 499,6 MB enviados y 117,4 MB recibidos desde Bogotá; por el servidor, unos 0,64 GB de salida (≈ 3,1 GB por hora). Con 20 TB incluidos (Hetzner solo cuenta la salida), unas 6.500 horas al mes de videollamadas como esa.
- Fórmula de ChatGPT para el grupo en malla: salida del TURN = N(N−1) × flujo. Con 1,55 Mb/s por flujo: 2 → 1,4 GB/h; 3 → 4,2 GB/h; 4 → 8,4 GB/h. Capacidad simultánea del servidor de 2 vCPU: **no medida** (las voces dicen «no lo sé»).

## Propuesta (pendiente del dueño; después del lanzamiento)
1. Avisos Web Push encriptados (normal y urgente), con permiso por contacto, horas de silencio y estados honestos («enviado al servicio de avisos», no «le está sonando»).
2. Llamadas de hasta cuatro: botón «Añadir persona» → enlace de un uso → «Solicitar entrada» → «Aceptar / Rechazar» con el código de identidad.
3. Timbre en el móvil (vincular con QR), primero solo para avisar.
4. Medir la capacidad real del servidor antes de abrir las llamadas de grupo.
