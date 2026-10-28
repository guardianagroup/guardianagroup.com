# Ronda 73 · DeepSeek V4 Pro (Cheaper Inference, playground, 4.096 tokens de salida) · 28 Oct 2026, 11:58–12:10

Voz de sustitución de Astra 6, que no pudo entrar por saldo (2,03 $; el dueño lo recarga). La primera respuesta se cortó en el bloque B por el límite de tokens; la continuación (B desde el punto 2, C y D) va abajo cuando llegue.

## Primera parte (texto copiado)

**A. Llamada urgente**

1. **Notificaciones Web Push (service worker + VAPID).** Cada navegador generaría una suscripción (endpoint + claves) que se guarda en IndexedDB y se comparte, encriptada de extremo a extremo, con el contacto. El emisor encripta el aviso según RFC 8291 dentro del canal blindado. El relé solo firma con las claves VAPID y reenvía el blob al servicio Push del navegador (FCM, APNs, Mozilla).
   - Qué ve cada tercero: el relé, solo un blob encriptado que firma; el servicio Push, el endpoint, la IP del servidor que envía, la hora y el tamaño, sin poder leer el contenido.
   - Límites: Android con el navegador cerrado, llega y despierta el service worker; iPhone, solo como web añadida a la pantalla de inicio; ordenador, solo con el navegador abierto.
   - No garantiza llegar si la persona no cumple esos requisitos.
2. **Móvil como «timbre».** Un segundo dispositivo (p. ej. un teléfono antiguo) mantiene la página abierta y conectada por WebSocket con datos móviles; si se va la luz, sigue conectado y recibe un ping que activa un tono. El relé ve un dispositivo más. Exige un terminal dedicado y batería; si el único móvil se apaga, no funciona.
3. **Aviso fuera de GUARDIANA (SMS, correo, otra app).** Exige un identificador externo; el servidor u operador conoce número o correo y hora; rompe «sin teléfono ni correo». No recomendado como canal principal.
4. **UnifiedPush / ntfy.** UnifiedPush solo en Android y con un distribuidor instalado; ntfy, técnico y su servidor ve el tópico. Ambos exigen instalar algo fuera de la web.

**Recomendación:** Web Push, por ser lo más cercano a «sin instalar nada». Comunicarlo así: «Esta función funciona en Android incluso con el navegador cerrado; en iPhone solo si has añadido la web a la pantalla de inicio; en ordenador solo con el navegador abierto. Si tu contacto no cumple estas condiciones, el aviso no llegará».

**Abusos y silencio:** permiso explícito por contacto («Permitir avisos urgentes de [nombre]»); si no está activado, no se envía; horario de silencio global (p. ej. 22:00–07:00) con aviso silencioso o bloqueo; el urgente con icono y color rojo y la pregunta «vas a enviar un aviso prioritario, ¿estás seguro?».

**B. Añadir a alguien (inicio)**

1. **Malla con TURN obligatorio** para 3–4: con 3 personas, 6 flujos; a 720p (~1–2 Mb/s por flujo), 6–12 Mb/s en el servidor, «muy por debajo de los 20 TB mensuales». Encriptación de extremo a extremo con sesiones por pares (ECDH P-256 + ML-KEM, como ahora); sin clave de grupo. Sin SFU: para grupos tan pequeños la malla es más simple y conserva el modelo por pares.
2. «Descartamos MLS (RFC 9420) en este momento porque añade una capa de complejidad est…» *(cortado por el límite)*

*Nota de GUARDIANA: «6–12 Mb/s… muy por debajo de los 20 TB» mezcla velocidad y volumen; a 12 Mb/s de salida son unos 5,4 GB por hora.*
