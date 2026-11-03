# Ronda 93 · 3 nov 2026 · Ultra: Comunicaciones con el máximo de privacidad (para Gemini)

Hola, Gemini. Somos el equipo de GUARDIANA, un programa de privacidad para Windows. Incluye antivirus, VPN, el navegador ZERO, Órbita (que enseña adónde van tus datos) y Comunicaciones: chat, archivos, llamadas y videollamadas encriptados de extremo a extremo.

Necesitamos tu mejor análisis, a fondo y con espíritu crítico. Si algo de lo que planeamos es débil, inútil o arriesgado, dilo.

Lo que pide el dueño (3 nov, 00:20): «No olvides empezar ya la versión ultra. A ver qué diferencia va a tener con blindada, sobre todo en cuanto a mejora de todo. Sobre todo de privacidad y que no puedan espiarnos. Máximo nivel que seas capaz de hacer.»

Ya lo había pedido el 2 nov: «la que tiene el mosaico, la máxima tecnología de encriptación que se pueda hallar, la voz distorsionada… y no sé qué cosas más le pudiéramos meter».

## Cómo está hoy la Blindada (gratis, publicada)
- **Dónde funciona:** es una web estática (GitHub Pages). Funciona en el navegador del PC y del móvil, sin cuentas ni teléfonos. En el PC también funciona dentro de ZERO, nuestro navegador sobre WebView2.
- **Identidad y claves:** se crean en el propio equipo con ECDSA P-256 y ECDH P-256, con las claves privadas no exportables (Web Crypto).
- **Acuerdo de claves:** es híbrido, ECDH P-256 + ML-KEM-768 (FIPS 203, con @noble/post-quantum servida desde nuestro sitio). Hay presentaciones firmadas y triple ECDH, con HKDF-SHA256.
- **Mensajes:** van con AES-256-GCM y una clave distinta por mensaje, con cadenas HMAC; la anterior se olvida.
- **Archivos:** viajan en trozos de 192 KB autenticados uno a uno.
- **Invitación:** es un código de 9 cifras, de un solo uso, que caduca a los 10 minutos y con intentos limitados. El relé guarda un sobre cerrado con clave PBKDF2 de 300.000 iteraciones.
- **El relé (servidor nuestro):**
  - No guarda nombres ni claves.
  - Sí ve qué conexiones comparten una sala y cuántos bytes mueven.
  - Guarda los mensajes para quien no está conectado, como mucho 7 días, en un sobre híbrido firmado.
- **Llamadas:**
  - WebRTC siempre por nuestro TURN, así que nadie ve la IP del otro.
  - DTLS-SRTP con Opus.
  - Si los dos navegadores admiten Encoded Transforms, llevan además una capa postcuántica cuya clave cambia cada 2 minutos.
- **Verificación:** número de seguridad de 60 cifras. En la Blindada no se ve en pantalla salvo que lo pidas.
- **Móviles viejos:** si un móvil no admite la capa postcuántica, la llamada sigue sin ella y lo dice.

## Lo que ya anunciamos para Ultra (de pago, con la suscripción Plus, «próximamente»)
- **Acuerdo de claves:** ECDH P-384 + ML-KEM-1024, con HKDF-SHA-384.
- **Firmas:** ECDSA P-384 y ML-DSA-87 sobre toda la negociación.
- **Identidad:** nueva en cada sesión.
- **Invitación:** de 256 bits, solo por enlace o QR.
- **Claves:** se renuevan cada 5 minutos.
- **Tamaño de los mensajes:** se rellenan a múltiplos de 1 KB.
- **En la llamada:**
  - el código de seguridad está siempre a la vista;
  - mosaico, difuminado y voz distorsionada se hacen en el equipo antes de encriptar, con una nota honesta de lo que la voz distorsionada protege y lo que no.
- **Comprobante de entrega:** con doble firma, ECDSA P-384 + ML-DSA-87.

## Reglas que no se pueden saltar
- Solo afirmaciones que se puedan comprobar. Ni «auditada», ni «certificada», ni «conformidad CNSA 2.0», ni «anónima». Sin cifras inventadas y sin promesas absolutas como «imposible de espiar».
- La seguridad no puede depender de esconder cómo funciona.
- Ningún truco para engañar a sistemas de detección de terceros.
- Si algo solo puede hacerse en el PC (en ZERO o en el servicio de GUARDIANA, que tiene permisos de administrador) y no en el móvil, dilo. Cada lado debe tener lo máximo que permita su aparato, y la llamada tiene que decir por qué.
- Los relés nos cuestan dinero por cada byte que pasa. Tenemos servidores en Helsinki, Núremberg y Miami.

## Lo que te pedimos

### 1. Quién podría espiar
Haz una lista de amenazas realista y, para cada una, qué haría Ultra que no hace la Blindada. Incluye al menos:
- la red y la Wi-Fi;
- nuestro propio relé y quien lo aloja;
- nuestra web, porque si alguien cambia el JavaScript que servimos, lo cambia para todos (¿cómo protegemos la entrega del código?: firmar la web, ejecutar Ultra solo desde el programa instalado con el código sellado, Subresource Integrity, un manifiesto firmado…);
- el otro aparato;
- el propio PC o móvil: malware, keyloggers, apps que usan el micrófono o la cámara, captura de pantalla, el teclado del sistema, las notificaciones;
- alguien que mira la pantalla.

### 2. Metadatos
El relé sabe quién habla con quién (por conexión), cuándo y cuánto. ¿Qué medidas reales lo reducen, y qué cuesta cada una? Por ejemplo:
- relleno a tamaño fijo;
- tráfico de cobertura a ritmo constante;
- Opus en bitrate constante, para que el tamaño de los paquetes no delate lo que se dice;
- dos relés de operadores o países distintos, como el doble salto de nuestra VPN;
- pasar la llamada por la VPN de GUARDIANA;
- Tor.

Ordénalas por protección real frente a coste.

### 3. Criptografía
¿Está bien lo anunciado, o sobra o falta algo? Piensa en:
- un ratchet postcuántico continuo, en la línea del que Signal publicó en 2025, frente a renovar cada 5 minutos;
- la seguridad tras un compromiso;
- que las claves vivan solo en memoria;
- la verificación: una frase corta para leer en voz alta en cada llamada, al estilo de ZRTP, frente al número de 60 cifras;
- la negabilidad frente al comprobante con doble firma: ¿choca una cosa con la otra?, ¿deberían ser dos opciones?

### 4. El aparato
¿Qué puede hacer de verdad el programa en el PC durante una llamada Ultra? Por ejemplo:
- avisar si otra app está usando el micrófono o la cámara;
- impedir que se capture la ventana (SetWindowDisplayAffinity con WDA_EXCLUDEFROMCAPTURE);
- comprobar antes de la llamada que el antivirus no ve nada raro;
- no dejar rastros en el disco.

¿Y qué se puede hacer en un móvil desde el navegador?

### 5. Vídeo y voz
- Mosaico, difuminado y fondo: qué protege cada cosa.
- La voz distorsionada: qué técnica es razonable, y qué no protege. ¿Tiene sentido además quitar el ruido de fondo, que delata dónde estás?
- Los metadatos de las fotos y archivos que se envían (EXIF, ubicación): ¿limpiarlos siempre en Ultra?

### 6. Prioridades
Divide el trabajo en tres fases:
- **Ultra 1:** lo que se puede hacer y comprobar en días.
- **Ultra 2:** semanas.
- **Más adelante.**

Para cada medida, di:
- qué protege;
- qué no protege;
- si funciona en PC, en móvil o en los dos;
- si cuesta dinero de servidor.

### 7. Cómo contarlo
- **La diferencia con la Blindada:** explícasela a una persona sin conocimientos técnicos en 5 a 7 frases cortas, verdaderas y comprobables.
- **Lo que nunca debemos prometer:** dínoslo también.

Responde en español, ordenado por apartados.
