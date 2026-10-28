Ronda 73 · GUARDIANA Comunicaciones · llamada urgente y añadir a alguien a la llamada (28 Oct 2026, 11:55). Máximo razonamiento.

Eres parte de la agencia de GUARDIANA (empresa colombiana de privacidad). Responde en español, en bloques numerados y concretos. No inventes: fuente oficial o «no lo sé». Nada de promesas absolutas.

HECHOS (código actual):
1. Comunicaciones es una web: sin instalar nada, sin cuenta, sin teléfono ni correo. Encriptación de extremo a extremo (ECDH P-256 + ML-KEM en híbrido; sesión blindada con P-384 + ML-KEM-1024 y ML-DSA-87). El relé (WebSocket, un servidor en Núremberg, 2 vCPU y 4 GB, 20 TB de tráfico al mes) solo ve la sala y bytes.
2. Llamadas y videollamadas: WebRTC siempre por nuestro TURN (coturn, mismo servidor), así nadie ve la IP del otro. Probado hoy entre Bogotá y Praga: 171 ms de ida y vuelta, 720p.
3. Una conversación a la vez, entre dos personas; la identidad vive en el navegador (IndexedDB), sin varios dispositivos.
4. Hoy una llamada solo llega si la página está abierta (en cualquier pestaña) y conectada. No hay notificaciones.

LO QUE PIDE EL DUEÑO (literal):
- «Imagínate que yo con mi amigo quiero hablar a las 3 de la mañana por una cosa súper urgente, y él a lo mejor ha cerrado la página o se le ha ido la luz de casa… ¿de qué forma podría contactar con él y decirle que necesito hablar con él? Quiero que lo analicéis profundamente.»
- «Si estamos en llamada y queremos añadir a alguien, que lo hagamos de forma muy fácil: que le enviemos un enlace o algo donde se pueda meter automáticamente. Sobre todo que sea muy fácil.»

PREGUNTAS (4 bloques):
A. Llamada urgente. Compara con sus límites reales por plataforma y lo que ve cada tercero: (1) notificaciones Web Push (service worker + VAPID): la suscripción viaja por el canal encriptado y quien llama encripta el aviso (RFC 8291), así el relé solo firma y reenvía sin guardar quién es quién; Android con el navegador cerrado, iPhone solo con la web añadida a la pantalla de inicio, ordenador solo con el navegador abierto; (2) el móvil como «timbre» enlazado a la conversación solo para avisos (si se va la luz, solo queda el móvil con datos); (3) un aviso fuera de GUARDIANA (SMS, correo, otra app) y lo que cuesta en privacidad; (4) otra que conozcas (UnifiedPush, ntfy…). ¿Cuál recomiendas? Cómo evitar abusos (avisos a las 3 de la mañana sin permiso), «urgente» frente a normal, horas de silencio, y qué decirle a la persona con honestidad.
B. Añadir a alguien a la llamada. Arquitectura para 3–4 personas (malla por TURN) frente a un servidor de medios con encriptación de extremo a extremo (SFrame / Insertable Streams); acuerdo de claves de grupo (sesiones por pares frente a MLS, RFC 9420); cómo entrar por enlace sin bajar la seguridad (verificar a cada persona nueva, aprobación de los que ya están, que no vea lo anterior); ancho de banda y coste aproximado con nuestro servidor (si no lo sabes, dilo).
C. La experiencia más sencilla para las dos cosas: botones, textos y pasos, en ordenador y en móvil.
D. Riesgos (seguridad, legales, reputación) y lo que NO se debe prometer.
