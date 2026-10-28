Ronda 71 · GUARDIANA · Comunicaciones en modo ataque: competición mundial de seguridad (27 Oct 2026, 23:05). Máximo razonamiento.

Eres parte de la agencia de GUARDIANA (empresa colombiana de privacidad; Comunicaciones es su chat y envío de archivos encriptado de extremo a extremo, en el navegador, sin instalar nada, sin cuenta, sin teléfono ni correo). El dueño: «Imagina que es una competición a nivel mundial de seguridad y tenéis que ganar»; «sin pruebas de terceros, solo vosotros»; «algo único»; «debemos igualar a Threema, Session y Matrix/Element o superarlas en algo». Tu papel: equipo rojo experto. Responde en español, en bloques numerados y concretos. No inventes: fuente oficial o «no lo sé». Nada de promesas absolutas. Fuentes prohibidas: submarinecablemap.com, TeleGeography y PeeringDB.

HECHOS (código actual; Web Crypto del navegador + @noble/post-quantum 0.7.1 servida desde el propio sitio):
1. Identidad por equipo: ECDSA P-256 (firma) + ECDH P-256 (acuerdo), no exportables, en IndexedDB. Huella = SHA-256(firmaPub‖acuerdoPub). Número de seguridad: 60 cifras de SHA-256("GUARDIANA número de seguridad\n" + las dos huellas ordenadas).
2. Invitación: semilla aleatoria de 32 bytes. Sala del relé = SHA-256("GUARDIANA sala\n"‖semilla) (el relé la ve). Clave de presentación = HKDF(semilla, "presentación"); PSK = HKDF(semilla, "psk de sesión").
3. Se comparte con un código de 9 cifras: la semilla se encripta (AES-GCM) con una clave PBKDF2-SHA256 (300.000 iteraciones, sal aleatoria de 16 bytes) derivada del código, y ese «sobre» (con su sal) queda en el relé 10 minutos y un solo uso; el relé limita las búsquedas. (Existe también el enlace #i=<semilla> en el fragmento; hoy no se muestra.)
4. Sesión (v3 híbrida): cada lado manda una presentación encriptada con la clave de presentación: identidad, efímera ECDH P-256, época aleatoria de 16 bytes y firma ECDSA sobre la transcripción (quien responde firma también la huella y la efímera de quien inicia). Quien inicia (huella menor) añade una clave ML-KEM-768 nueva; quien responde encapsula; una segunda firma ECDSA cubre los campos ML-KEM. IKM = DH(efA,efB)‖DH(idA,efB)‖DH(efA,idB)‖ss_ML-KEM‖PSK; sal = sala; info = etiqueta + huellas + efímeras + SHA-256(ek) + SHA-256(ct). Salen 96 bytes: cadena A→B, cadena B→A y hash de sesión (32 bytes en los datos asociados de cada mensaje; 8 en la cabecera).
5. Cada reconexión crea una sesión nueva. Dentro de una sesión: cadena HMAC-SHA-256 por sentido (clave por mensaje; hasta 256 saltadas), AES-256-GCM con nonce = número de mensaje. Épocas no repetibles (64). Si la conversación ya tuvo sesión postcuántica, una sin ella se para hasta que la persona lo acepte.
6. La identidad del otro queda fijada al primer contacto (TOFU): otra identidad en la misma sala se rechaza. Verificar el número de seguridad es opcional.
7. Archivos: trozos de 192 KB con AES-256-GCM y una clave aleatoria propia del archivo (enviada dentro de la sesión); AAD = tipo+id+índice; longitud exacta; ventana de 12 trozos y acuses cada 4; sin límite de tamaño (a disco en Chrome/Edge). Comprobante de entrega e integridad: registro JSON canónico firmado con ECDSA P-256 por los dos equipos (SHA-256 del archivo calculado en los dos lados, tipos, tiempos, velocidades, latencias, cronología, huellas); se verifica en una página estática sin enviar nada.
8. Relé (Núremberg, Hetzner): WebSocket con TLS; tramas [1][sala][para][carga]→[2][sala][de][carga]; sin buzón (los dos deben estar conectados); 8 por sala; 8 MB/s por conexión; ve IP, sala, tamaños y tiempos. Código abierto (AGPL) y autoinstalable con una orden. La página se sirve desde GitHub Pages, con CSP y solo scripts del propio dominio.

LO QUE SE PUBLICA ESTA NOCHE («Sesión blindada»; solo entre dos equipos con la versión actual):
a) Invitación solo por enlace o QR con la semilla completa (256 bits, en el fragmento): sin código de 9 cifras ni sobre en el relé.
b) Verificación obligatoria y mutua del número de seguridad antes de cualquier contenido; bloqueo si cambia una identidad.
c) Renovación periódica de la sesión (efímeras ECDH + ML-KEM nuevas cada pocos minutos) para recuperar la seguridad tras un compromiso.
d) Relleno: mensajes a tamaños fijos; el último trozo de cada archivo, completo.
e) Identidad postcuántica: clave ML-DSA-65 por equipo (guardada encriptada con la clave local no exportable), dentro de la huella y del número de seguridad de la blindada; el comprobante lleva doble firma ECDSA + ML-DSA-65 de cada equipo.
f) Relé sin el límite de 8 MB/s para las salas blindadas y ventana mayor.
g) Al terminar: borrado de claves y un informe de cierre con lo que se borró y lo que no se puede garantizar.
h) Red de nodos de dos saltos (nueva): el navegador entra por un nodo y la sala vive en otro; el primero ve la IP pero no la sala; el segundo, la sala pero no la IP. Los dos nodos los opera GUARDIANA, en países distintos.
i) Llamadas de voz (normal y blindada) con cambio de voz opcional en el propio navegador; audio WebRTC solo por el relé TURN, con la señalización dentro del canal encriptado.

LO QUE TE PIDO:
A) Ataca lo actual: los 8 ataques más serios que harías (relé malicioso, quien tiene la invitación, navegador, servidor web, comprobante falsificado, repetición, metadatos…). Para cada uno: escenario paso a paso, gravedad (crítica/alta/media/baja), si la blindada (a–i) lo cierra y el arreglo concreto si no.
B) Ataca el diseño de la blindada (a–i): errores, órdenes de operaciones peligrosos, compatibilidad, y cómo hacerlo bien (qué se firma, qué entra en el HKDF, cuándo se borra cada clave; cómo construir bien el circuito de dos saltos con WebSocket; qué protege de verdad un cambio de voz y qué no).
C) El código de 9 cifras de la sesión normal: ¿cuánto cuesta romperlo fuera de línea con el sobre del relé, con números? ¿Qué harías?
D) Comparación honesta con Signal, Threema, Session y Matrix/Element (datos oficiales o «no lo sé»): dónde igualamos, dónde superamos y dónde perdemos (tabla breve). ¿Qué tres cosas únicas y verificables nos harían ganar, construibles en semanas?
E) Propiedades del protocolo de Signal (confidencialidad futura, recuperación tras compromiso, autenticación, negabilidad…) y requisitos de OWASP ASVS 5.0 nivel 3 que apliquen: cuáles cumplimos hoy, cuáles con la blindada y cuáles no (tabla breve).

Nota de envío (23:06–23:09): ChatGPT recibió la versión sin h) ni i) (se le preguntan aparte); Gemini, con h); Astra (Playground, 4.096 tokens de salida), con h) e i).
