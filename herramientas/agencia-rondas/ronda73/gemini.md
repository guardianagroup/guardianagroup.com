# Ronda 73 · Gemini (Argon) · 28 Oct 2026, 11:57–12:50

Conversación «Llamadas urgentes y grupales cifradas». La primera respuesta trajo solo el bloque A; B, C y D llegaron al pedirlos («Te has quedado en el bloque A…»). Resumen fiel; lo entrecomillado es literal.

## A. Llamada urgente
- Fondo físico: para despertar un dispositivo con el navegador cerrado hace falta un canal permanente con el sistema, que en una web controlan Google (FCM), Apple (APNs) o Mozilla. Si se va la luz, solo queda el móvil con datos.
- **Web Push «ciego»:** la suscripción viaja por el canal encriptado; quien llama encripta el aviso (aes128gcm, RFC 8291) y el servidor firma VAPID y lo entrega sin guardar el endpoint. Android funciona con el navegador cerrado salvo fabricantes con ahorro agresivo (Xiaomi, Huawei, Samsung); iOS 16.4+ solo como web en la pantalla de inicio («si el usuario solo usa una pestaña normal de Safari, no existe PushManager»); escritorio solo con el navegador en marcha.
- Lo que ven Google/Apple/Mozilla: el identificador del dispositivo, la clave VAPID de guardianagroup.com, la hora exacta y la IP del móvil; no el contenido.
- **Móvil como timbre** (PWA solo para avisos, vinculada con QR, sin historial ni claves de sesión): resuelve el corte de luz si el móvil pasa a datos.
- **SMS / llamada / correo:** llegan a casi cualquier teléfono, pero el operador o el proveedor ven el grafo social; si lo envía nuestro servidor, rompe «sin cuenta».
- **UnifiedPush / ntfy:** exigen una app nativa para despertar el móvil; en iOS pasan por Apple igualmente.
- **Límite crítico:** una notificación web no es una llamada del sistema (sin CallKit ni ConnectionService): suena 1–2 s, no un timbre continuo de 30 s.

## B. Añadir a alguien
- **Malla por nuestro coturn para 3–4**, con bajada automática de calidad al entrar más gente (N=2: 720p a 1,5 Mb/s; N=3: 480p a ~0,6 Mb/s; N=4: 360–480p a ~0,45 Mb/s), para que la subida de cada uno siga en torno a 1,5 Mb/s. Con SFU, el servidor terminaría DTLS y vería las cabeceras RTP aunque el contenido vaya con SFrame.
- **Sesiones por pares, no MLS** (para 3–4 la ganancia de MLS es nula y añade mucha complejidad). Punto clave: las ofertas y respuestas SDP, con la huella `a=fingerprint` del certificado DTLS, viajan dentro del canal encriptado y firmado de cada pareja, así el servidor no puede sustituir el certificado para escuchar. *(Nota de GUARDIANA: ya es así en las llamadas de dos: la señalización va por el canal encriptado de la conversación.)*
- **Enlace:** secreto en el fragmento `#`; **abrir la página no consume el enlace** (las vistas previas de WhatsApp, Telegram o iMessage lo abren solas): solo se activa al pulsar «Entrar a la llamada»; 5 minutos y un solo uso; los de dentro ven «Carlos quiere unirse · Código de seguridad: 42» con Aceptar / Rechazar; un código corto (SAS) derivado de las claves para confirmarlo de viva voz; quien entra no ve nada anterior; al salir alguien, se rotan las claves.
- **Tráfico:** salida del TURN = N(N−1) flujos. Su tabla: 2 personas 720p, 1,35 GB/h; 3 a 720p, 4,05 GB/h; 3 a 480p, 1,62 GB/h; 4 a 720p, 8,1 GB/h; 4 a 480p, 2,7 GB/h; 4 solo voz, 0,22 GB/h. *(Sin comprobar: «con 2 vCPU puede reenviar entre 250 y 400 Mbps… 40–60 llamadas simultáneas de 4»; y «en Hetzner Alemania… 1,00 € sin IVA por cada TB extra».)*

## C. Experiencia
- Aviso urgente: botón «🔔 Recibir avisos de este contacto»; en iPhone, dos líneas para añadir a la pantalla de inicio; en el ordenador, una tarjeta «¿Y si apagas el ordenador o se va la luz? → Usar mi móvil como timbre (escanear QR)»; interruptores «Permitir timbre urgente (3 avisos seguidos)» y «Silenciar avisos normales de 23:00 a 07:00»; al llamar a alguien desconectado: «Aviso normal» o «TIMBRE URGENTE» (3 avisos en los segundos 0, 8 y 16); en el móvil, «🚨 URGENTE · GUARDIANA — Tu contacto te busca con urgencia» → al tocar, «Contestar ahora».
- Añadir: «➕ Añadir persona» en la botonera; en el ordenador copia el enlace («válido por 5 minutos y para 1 sola persona»); en el móvil, menú de compartir; la persona escribe su nombre y pulsa «Entrar a la llamada»; los de dentro aceptan; nota en el chat: «Carlos se ha unido a la llamada. Por privacidad, no puede ver nada de lo hablado o escrito antes de este momento».

## D. Riesgos y promesas
- Google y Apple saben que un dispositivo recibió un aviso de GUARDIANA a una hora exacta.
- Enlace robado: un solo uso y el código corto lo delatan.
- En llamadas de 3–4, prioridad absoluta al audio y un botón «Modo solo voz».
- Reputación: una web no puede saltarse «No molestar», el modo Sueño ni el interruptor de silencio del iPhone; venderlo como «despertador infalible» destruiría la confianza. Fabricantes Android que cierran el navegador en segundo plano.
- Legal: no llamarlo «sistema de emergencias» ni «línea de socorro» (en telecomunicaciones reguladas obligaría a conectar con 123 en Colombia / 112 en Europa); llamarlo «Aviso prioritario entre contactos» o «Timbre urgente», con el aviso de que depende de cobertura, batería y permisos. El endpoint es dato personal seudonimizado: que solo lo guarde el otro contacto y el servidor lo tenga en memoria el tiempo de firmar.
- No prometer → decir: «Te despertaremos como una llamada normal» → «3 avisos de alta prioridad; de noche, tu teléfono tiene que tener sonido y no estar en Silencio o No molestar»; «ni Apple ni Google se enteran» → «el contenido va encriptado; para despertar el móvil hay que pasar por el canal del sistema, que ve la hora»; «funciona en iPhone sin hacer nada» → «en iPhone hay que añadirla a la pantalla de inicio»; «grupos para todas las personas que quieras» → «hasta 4 personas».
