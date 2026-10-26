# Ronda 40 · Gemini (4 Argon, razonamiento «Alto») · bloques A–G

Chat: https://gemini.google.com/app/7cafd878b80babbd

---

Gemini ha dicho
A) MOTOR (Primera versión real en semanas sobre Chromium + Playwright/CDP)
1. Transmisión de pantalla al principio y paso a WebRTC

Arranque inmediato (Semanas 1–3): CDP Page.startScreencast sobre WebSocket binario (wss://).

Qué hacer: Ejecutar Chromium en contenedor con framebuffer virtual (Xvfb o modo headless nativo con GPU por software SwiftShader/llvmpipe), capturar los fotogramas mediante el protocolo nativo de Chrome DevTools (Page.startScreencast en formato JPEG/WebP, calidad 80) y enviarlos por un WebSocket binario al <canvas> del cliente. Los eventos de ratón, rueda y teclado viajan por el mismo WebSocket hacia Input.dispatchMouseEvent, Input.dispatchWheelEvent e Input.dispatchKeyEvent.

Por qué: Un equipo pequeño lo pone en producción en días sin compilar Chromium ni mantener servidores multimedia STUN/TURN complejos. Para leer prensa, buscar, rellenar formularios y usar herramientas web es nítido y consume muy poca RAM en el servidor.

Cuándo pasar a WebRTC (Fase 2):

Disparador técnico: Pasar a WebRTC en dos casos: 1) cuando el cliente necesite audio o reproduzca vídeo continuo (detectado cuando hay un elemento <video> activo o cuando startScreencast supera los 20 cuadros por segundo sostenidos durante más de 3 segundos), o 2) cuando el desplazamiento (scroll) requiera latencia inferior a 60 ms a 30–60 fps.

Cómo dar el salto: Capturar el framebuffer X11/PipeWire y el audio virtual PulseAudio con GStreamer (arquitectura tipo Neko/KasmVNC) codificando en H.264/VP9 hacia un servidor pion/webrtc (en Go) o coturn propio, manteniendo el canal de datos (RTCDataChannel) para teclado y ratón.

2. Intercepción y corte en el servidor + Listas abiertas con licencia comercial

Cómo interceptar y cortar sin ahogar el servidor:

Peticiones de red: No evaluar listas de 100.000 reglas en JavaScript puro dentro de page.route() de Playwright por cada petición, porque el paso de mensajes IPC añade latencia. Usar @cliqz/adblocker-playwright (motor compilado en Rust/TypeScript de Ghostery, licencia MPL 2.0) conectado a Fetch.enable / Network.setBlockedURLs de CDP, complementado con un resolver DNS local en el contenedor (Unbound o proxy DNS en Go) que corta dominios en el nivel DNS antes siquiera de abrir el socket TCP.

Cookies de terceros: Arrancar Chromium con --test-type --block-third-party-cookies y activar el particionado de almacenamiento (ThirdPartyStoragePartitioning). Además, en las cabeceras de respuesta interceptadas de dominios cruzados, purgar cualquier cabecera Set-Cookie.

Scripts, filtrado cosmético y scriptlets: Inyectar mediante Page.addScriptToEvaluateOnNewDocument los scriptlets de desactivación de rastreadores y las hojas de estilo de ocultación cosmética (CSS injection) antes de que se construya el DOM de la página.

Huella digital (Fingerprinting): No aleatorizar la huella en cada clic (eso marca al navegador como sospechoso ante sistemas antifraude), sino uniformizarla en el servidor: todas las sesiones de ZERO en PC exponen exactamente el mismo sistema operativo (Linux x86_64), las mismas fuentes preinstaladas en el contenedor, el mismo navigator.hardwareConcurrency (4 núcleos), navigator.deviceMemory (8 GB), el mismo renderizador WebGL virtual y un recorte determinista en lectura masiva de Canvas y AudioContext.

WebRTC: Forzar en políticas de arranque de Chromium --force-webrtc-ip-handling-policy=disable_non_proxied_udp y WebRtcIPHandlingPolicy: disable_non_proxied_udp. Además, como el navegador se ejecuta en el servidor de GUARDIANA, la IP real del hogar del cliente no existe en ninguna interfaz de red de la máquina virtual.

Referer: En cada petición saliente hacia un dominio distinto (cross-origin), recortar la cabecera Referer únicamente al origen base o eliminarla si va a dominios publicitarios (Referrer-Policy: strict-origin).

Parámetros de seguimiento en la URL: En el evento de navegación antes de abrir la petición, limpiar de la URL los parámetros conocidos (utm_source, utm_medium, utm_campaign, fbclid, gclid, dclid, msclkid, mc_eid, yclid, igshid, _hsenc, _hsmi, twclid, ttclid).

HTTPS obligatorio: Activar el modo HTTPS-Only en la configuración del perfil de Chromium y reescribir cualquier petición principal http:// a https://, deteniendo la carga con aviso en pantalla si el servidor destino no soporta cifrado TLS.

Rechazo automático de avisos de cookies: Inyectar en el inicio de carga las reglas de Consent-O-Matic para detectar las plataformas de gestión de consentimiento (OneTrust, Quantcast, Cookiebot, Didomi, TrustArc) y pulsar automáticamente el botón de «Rechazar todo» o guardar solo las cookies estrictamente necesarias en menos de 300 ms.

Listas abiertas verificadas y su licencia exacta (criba legal para uso comercial):

Lista / Base de datos	Propósito en ZERO	Licencia exacta	¿Uso comercial permitido?	Condición técnica / legal a cumplir
Ghostery @cliqz/adblocker + WhoTracks.me	Motor de bloqueo, scriptlets y base de datos de rastreadores	MPL 2.0 (motor) y CC BY 4.0 (datos WhoTracks.me)	SÍ	Atribuir a Ghostery / WhoTracks.me en la página de créditos legales de GUARDIANA.
EasyList y EasyPrivacy	Corte de publicidad y rastreadores generales	Doble licencia: GPLv3+ o CC BY-SA 3.0	SÍ	Cargar las listas como archivos de datos externos, atribuir a los autores de EasyList y mantener cualquier mejora a la lista bajo la misma licencia.
uBlock Origin (uAssets)	Filtros de rastreo, scriptlets y filtrado cosmético	GPLv3	SÍ	Cargar como archivo de reglas externo y mantener las listas modificadas bajo GPLv3 con atribución.
Disconnect Tracking Protection	Clasificación de rastreadores por categoría y bloqueo	GPLv3	SÍ	Uso comercial permitido manteniendo el archivo de lista bajo GPLv3 y citando a Disconnect.
Peter Lowe's Blocklist	Lista de servidores de anuncios y seguimiento	CC BY 2.0	SÍ	Uso comercial permitido incluyendo atribución visible a Peter Lowe en los créditos de datos.
ClearURLs (data.min.json)	Reglas de limpieza de parámetros de rastreo en URLs	LGPL-3.0	SÍ	Uso comercial permitido cargando el JSON de reglas como librería/recurso externo con atribución.
Consent-O-Matic	Rechazo automático de banners de cookies (CMPs)	MIT	SÍ	Uso comercial libre manteniendo el aviso de copyright original (Universidad de Aarhus).
URLhaus (abuse.ch)	Dominios y URLs de malware y cargas maliciosas activas	CC0 1.0 (Dominio Público)	SÍ	Sin restricciones; uso comercial 100% libre.
PhishStats / CertStream	Detección de dominios de phishing y certificados recién emitidos	MIT / Público	SÍ	Uso comercial libre.
⚠️ DuckDuckGo Tracker Radar (Repositorio público)	Datos de rastreadores de DuckDuckGo	CC BY-NC-ND 4.0	NO (sin contrato)	Aviso crítico: Su licencia pública prohíbe expresamente el uso comercial (NC). No usar en producción comercial salvo que se firme acuerdo con DuckDuckGo; usar WhoTracks.me (CC BY 4.0) + Disconnect (GPLv3) en su lugar.
⚠️ OpenPhish / PhishTank (Feeds gratuitos)	Listas de phishing	Propietaria (Free Tier no comercial)	NO (en plan gratuito)	El feed gratuito de OpenPhish prohíbe el uso comercial. Usar URLhaus (CC0) + heurística de certificados CertStream (MIT), o pagar licencia comercial si se desea OpenPhish.
3. Cómo saber de cada corte la empresa, el país de su sede y el propósito

Se construye en el servidor un diccionario indexado en memoria RAM (dominio_raiz -> {empresa, pais_iso, pais_nombre, proposito, fuente_verificada}) que responde en menos de 0,1 milisegundos por cada petición cortada, alimentado por cuatro capas legales:

Disconnect entities.json (Licencia GPLv3): Agrupa miles de dominios técnicos crípticos (por ejemplo, 2mdn.net, doubleclick.net, googlesyndication.com o fbcdn.net) bajo el nombre real de su empresa matriz.

WhoTracks.me de Ghostery (Licencia CC BY 4.0): Asigna a cada dominio y empresa su categoría técnica real (advertising → Publicidad, site_analytics → Seguimiento/Analítica, essential/cdn → Infraestructura, social_media → Rastreador social, customer_interaction → Grabación de sesión/Chat).

Wikidata vía volcado SPARQL (Licencia CC0 1.0 - Dominio Público): Cruza el nombre de la empresa matriz con su entidad en Wikidata para extraer de forma auditable la propiedad P17 (país de la sede legal) y P159 (ciudad de la sede central).

Base propia de GUARDIANA de las 100 mayores empresas de rastreo confirmadas por dos voces (Propiedad 100% de GUARDIANA): Tabla auditada internamente donde cada una de las 100 empresas con mayor volumen de tráfico mundial está verificada por dos fuentes documentales directas: 1) su política de privacidad o aviso legal oficial y 2) su registro mercantil público (SEC EDGAR en EE. UU., registros mercantiles europeos o registros estatales equivalentes). Si un dominio bloqueado no está en ninguna de las cuatro tablas, ZERO nunca inventa la empresa: muestra el dominio técnico real y rotula Empresa matriz no declarada · País del servidor estimado por registro de red (RIR).

4. Cómo hacer viable que una persona lo use todo el mes (coste de servidor controlado)

Para que una suscripción mensual plana sea rentable sin cobrar por horas, el servidor nunca debe mantener una máquina virtual quemando CPU cuando el usuario no está interactuando:

Tasa de cuadros elástica ( de 24 fps a 0 fps en reposo): Si la página termina de cargar y no hay cambios visuales en el DOM ni movimiento de ratón durante 2 segundos, el motor detiene el envío de fotogramas (0 fps). El cliente sigue viendo en su pantalla el último fotograma nítido en alta resolución con consumo de red y CPU de vídeo igual a cero. En cuanto mueve el ratón o pulsa una tecla, vuelve a 24 fps en menos de 40 ms.

Congelación de pestañas en segundo plano (Tab Freezing): Toda pestaña que no sea la pestaña visible en ese instante y no esté reproduciendo audio se congela a los 45 segundos mediante Page.setLifecycleEventsEnabled y descarte de memoria de Chromium (MemorySaverMode).

Límite de pestañas vivas en RAM (máximo 6 pestañas activas): El usuario puede tener 30 pestañas en su barra visual, pero solo las 6 más recientes están cargadas en la RAM de Chromium. De la 7ª en adelante, ZERO guarda la URL, la posición del scroll y una captura de pantalla ligera (35 KB en WebP), liberando el proceso. Al hacer clic en ella, se recarga al instante.

Pausa de CPU en frío (SIGSTOP a los 3 minutos): Si el usuario minimiza la ventana de ZERO (document.visibilityState === 'hidden') o no toca ratón ni teclado durante 3 minutos, el orquestador congela el contenedor/microVM a nivel de sistema operativo (SIGSTOP o pausa de vCPU en Firecracker). El consumo de CPU cae al 0,0%.

Hibernación a disco NVMe a los 12 minutos: Si la inactividad llega a 12 minutos, se guarda el estado de la sesión (pestañas abiertas y cookies de sesión cifradas en memoria temporal con una clave que solo tiene el navegador del cliente en su RAM local) y se destruye la microVM, liberando el 100% de la RAM del servidor. Cuando el cliente vuelve a mirar la pantalla, una microVM precalentada (warm pool que arranca en 120 ms) restaura la pestaña activa en menos de 1,5 segundos.

Ahorro colateral del propio bloqueo: Al cortar anuncios de vídeo, scripts de puja publicitaria y rastreadores antes de descargarlos, Chromium consume de media un 40% menos de RAM y CPU que un navegador sin filtro.

5. Aislamiento mínimo aceptable para una Alfa y pruebas de fuga obligatorias

Aislamiento mínimo para salir en Alfa:

Nunca usar Docker estándar compartiendo el kernel de Linux desnudo entre distintos clientes. El mínimo aceptable para la Alfa es ejecutar cada sesión de usuario dentro de un contenedor aislado por gVisor (runsc) o una microVM Firecracker / Kata Containers, con un kernel virtual propio por sesión.

Sistema de archivos efímero en RAM (tmpfs): El contenedor arranca sobre una imagen base de solo lectura (read-only rootfs). El perfil de Chromium (/tmp y /home/zero) se monta en memoria RAM volátil (tmpfs con límite duro de tamaño) y se destruye al cerrar la sesión.

Jaula de red (nftables / iptables): El contenedor solo puede hablar por los puertos 80 y 443 (o a través del nodo Tor en modo ULTRA) hacia internet público. Tiene bloqueado por firewall de kernel cualquier acceso a redes privadas (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8 fuera de su loopback) y a la dirección de metadatos del proveedor cloud (169.254.169.254).

Sandbox interno de Chromium activo: Chromium debe correr con su propio sandbox activado (nunca usar --no-sandbox en producción; asignar un perfil seccomp-bpf específico para permitir los user namespaces de Chromium dentro de gVisor/Firecracker).

Las 5 pruebas de fuga que hay que aprobar al 100% antes de hablar en público:

Prueba de fuga de IP y WebRTC/STUN: Abrir desde ZERO páginas de auditoría de red y lanzar peticiones WebRTC STUN, WebSockets y consultas DNS únicas. Criterio de éxito: La IP doméstica del cliente no debe aparecer jamás en ningún campo; solo debe verse la IP del nodo de salida de ZERO (o del nodo de salida Tor en modo ULTRA).

Prueba de salto a red interna (SSRF): Abrir en ZERO una página de prueba que intente cargar mediante fetch(), <img> y redirecciones HTTP recursos en http://localhost:9222 (el puerto CDP), [http://169.254.169.254/latest/meta-data/](http://169.254.169.254/latest/meta-data/) y otras IPs de la red de servidores de GUARDIANA. Criterio de éxito: 100% de conexiones rechazadas en el acto; el puerto CDP nunca es accesible desde dentro del navegador.

Prueba de contaminación entre sesiones (Cross-User Bleed): Dos usuarios A y B navegan simultáneamente en el mismo servidor físico. El usuario A inicia sesión en una web, copia texto al portapapeles y descarga un archivo. Criterio de éxito: El usuario B tiene visibilidad cero sobre la RAM, caché, cookies, DNS, portapapeles y procesos del usuario A.

Prueba de amnesia post-cierre: Tras cerrar la pestaña de ZERO, auditar el disco y la memoria del servidor anfitrión buscando el nombre de los dominios visitados por el usuario o el texto que tecleó. Criterio de éxito: Cero bytes presentes en disco o logs del sistema.

Prueba de homogeneidad de huella (Fingerprinting Test): Entrar en ZERO desde tres equipos radicalmente distintos (un Mac con pantalla Retina en España, un PC Windows en Colombia y un portátil Linux). Pasar las baterías de AmIUnique y CreepJS dentro de ZERO. Criterio de éxito: Las tres sesiones deben devolver exactamente el mismo identificador de hardware, fuentes, Canvas y WebGL.

B) SEGURIDAD AL NIVEL DE BRAVE, DUCKDUCKGO Y TOR
1. Comparativa honesta frente a Brave, DuckDuckGo y Tor Browser
Navegador de referencia	Qué defensas iguala ZERO	En qué los supera ZERO por ser remoto	Qué NO puede dar ZERO (y por qué)
Brave	Bloqueo de anuncios y rastreadores en red y cosmético, limpieza de parámetros de URL, bloqueo de cookies de terceros, HTTPS obligatorio, ocultación de avisos de cookies y corte de CNAME cloaking.	Ejecución fuera del equipo: En Brave, el código JavaScript y las imágenes de la web se ejecutan en el procesador del cliente (un fallo de día cero en Chromium infecta su ordenador). En ZERO, el código nunca toca el equipo del cliente. Además, Brave normal enseña la IP real del hogar del usuario a cada web; ZERO la oculta siempre.	Rendimiento nativo sin vídeo y carteras USB directas: ZERO no puede dar 144 fps sin compresión para videojuegos pesados en el navegador ni conexión directa por cable USB a una billetera física sin pasar por el puente del navegador local.
DuckDuckGo Browser	Bloqueo previo de rastreadores conocidos, cifrado forzado, bloqueo de avisos de cookies y botón de borrado instantáneo («Fire Button»).	Motor propio aislado frente a WebView del sistema: DuckDuckGo usa el motor preinstalado del sistema operativo del usuario (WebKit en Mac/iOS, WebView2 en Windows) y expone la IP real del usuario a las webs que visita. ZERO oculta la IP, unifica la huella del sistema operativo y destruye una máquina virtual entera al borrar la sesión.	Escudo para otras aplicaciones instaladas en el móvil/PC: El navegador DuckDuckGo en Android incluye una VPN local que filtra rastreadores de otras apps instaladas en el teléfono. ZERO vive en la web y protege todo lo que haces dentro de ZERO, no lo que hacen otras aplicaciones instaladas fuera.
Tor Browser	Huella digital idéntica para todos los usuarios (tamaño de lienzo fijo, mismas fuentes, mismo hardware reportado), aislamiento de estado por sitio (First-Party Isolation) y salida por la red Tor de 3 saltos en el modo ULTRA.	Velocidad en uso diario y resistencia a exploits locales: Cuando se descubre un fallo en Firefox para descubrir la IP real de un usuario de Tor Browser, el atacante lee la tarjeta de red del ordenador de la víctima. En ZERO, incluso si un atacante rompiera el navegador en modo ULTRA, solo vería el contenedor efímero en el servidor de GUARDIANA, jamás el PC del cliente.	Anonimato de entrada frente a la propia GUARDIANA: En Tor Browser instalado en tu PC, el primer nodo conoce tu IP pero no qué web visitas, y el último ve la web pero no tu IP. En ZERO, como la página se dibuja en un servidor de GUARDIANA para enviarte los píxeles, tienes que confiar en la arquitectura sin registros (Zero-Logs) de GUARDIANA en el momento en que la sesión está viva en RAM.
2. Cinco «Sistemas Novedosos» exclusivos de la arquitectura remota de ZERO
Sistema 1: Camuflaje de Multitud (Huella Clónica Colectiva)

Cómo funciona: Como el navegador no corre en el ordenador del cliente sino en un contenedor estándar de GUARDIANA, ZERO presenta exactamente las mismas especificaciones de pantalla interna, tarjeta gráfica virtual, fuentes tipográficas, batería (siempre enchufado al 100%) y sistema de audio para todos los suscriptores del mundo.

Qué protege: Anula el seguimiento por huella digital del dispositivo (device fingerprinting). Una web no puede saber si estás conectado desde un MacBook, un PC de sobremesa o un portátil antiguo.

Qué no protege: No impide que una web sepa quién eres si tú inicias sesión en ella con tu nombre de usuario y contraseña o escribes tus datos personales en un formulario.

Cómo se explica al cliente en una frase: «Para cualquier web que visites, tu ordenador es idéntico al de todos los demás usuarios de ZERO: no pueden distinguir tu equipo del resto.»

Sistema 2: Visor de Cristal (Apertura de Archivos y Enlaces en Celda Desechable)

Cómo funciona: Cuando el cliente hace clic en un archivo descargable (PDF, Word, Excel, imagen) o en un enlace sospechoso, el archivo jamás se descarga a su ordenador. Se desvía a una segunda microVM efímera sin conexión a internet que convierte el documento en páginas de imagen limpias (píxeles puros) y se las muestra al cliente en pantalla. Si el cliente necesita descargarlo, ZERO reconstruye un PDF nuevo a partir de las imágenes limpias, destruyendo cualquier código o macro oculta.

Qué protege: Neutraliza virus ocultos en documentos PDF, macros maliciosas de Office y descargas trampa (drive-by downloads).

Qué no protege: No impide que el texto visual de un documento falso intente engañarte (por ejemplo, una factura falsa con un número de cuenta bancario cambiado).

Cómo se explica al cliente en una frase: «Hemos abierto este archivo en una celda aislada de nuestros servidores: tú lees su contenido con total nitidez, pero el archivo original nunca toca tu ordenador.»

Sistema 3: Freno de Teclado y Portapapeles en Vivo (Anti-Exfiltración Silenciosa)

Cómo funciona: Miles de webs usan scripts de grabación de sesión (session replay como Hotjar, FullStory o Yandex Metrica) que envían a sus servidores cada letra que escribes en un formulario en tiempo real, incluso si te arrepientes, lo borras y nunca pulsas el botón «Enviar». Como en ZERO las teclas viajan primero del cliente a nuestro servidor, ZERO retiene el texto escrito en una caja protegida o bloquea las peticiones de red que intentan transmitir el contenido de un <input> antes de que ocurra un evento real de envío (submit) iniciado por el usuario. Igualmente, el portapapeles de la web está vacío por defecto hasta que el usuario autoriza pegar.

Qué protege: Impide que las webs graben en secreto lo que escribes en formularios antes de enviarlos y bloquea la lectura furtiva de tu portapapeles.

Qué no protege: Cuando pulsas voluntariamente el botón «Enviar» o «Comprar» en un formulario, los datos que hay en ese formulario sí se entregan a la web que estás visitando.

Cómo se explica al cliente en una frase: «Esta web intentaba leer lo que escribías antes de que pulsaras enviar; ZERO ha protegido tus teclas hasta que tú decidas mandarlas.»

Sistema 4: Detector de Disfraces DNS en Servidor (Desenmascaramiento CNAME)

Cómo funciona: Para esquivar a los bloqueadores normales, muchas empresas de rastreo piden a los periódicos y tiendas que creen un subdominio falso (por ejemplo, datos.tienda.com) que en realidad redirige en secreto (mediante un registro DNS CNAME) a los servidores del rastreador. En Chrome y navegadores basados en extensiones, el navegador oculta ese registro CNAME y el bloqueador no puede verlo. Como ZERO resuelve el DNS en su propio servidor Linux antes de que Chromium abra la conexión, inspecciona toda la cadena DNS, descubre el disfraz y corta la petición además de explicárselo al usuario.

Qué protege: Corta los rastreadores de terceros que se disfrazan de primera parte para robar las cookies de tu sesión.

Qué no protege: No puede cortar los datos que el dueño de la web decida reenviar por detrás desde su propio servidor privado horas después (server-side tracking).

Cómo se explica al cliente en una frase: «Un rastreador de [Empresa] se hacía pasar por parte oficial de esta web para no ser detectado; lo hemos descubierto al comprobar su dirección real y lo hemos cortado.»

Sistema 5: Incinerador de Máquina (Destrucción Física de Sesión en 1 Clic)

Cómo funciona: En cualquier navegador tradicional, «borrar datos de navegación» solo borra archivos de una carpeta, dejando rastros en la caché del sistema operativo, memoria RAM o sockets abiertos. En ZERO, el botón de quemar sesión mata el proceso del kernel virtual, destruye el disco en memoria RAM (tmpfs) y te asigna en menos de 2 segundos una máquina virtual recién creada desde cero con un nodo de salida distinto.

Qué protege: Elimina de raíz cualquier persistencia local, supercookies en memoria, identificadores de sesión y cualquier intento de infección que hubiera ocurrido durante la navegación.

Qué no protege: No borra los correos o mensajes que ya hayas enviado y guardado dentro de la cuenta de una web externa antes de destruir la máquina.

Cómo se explica al cliente en una frase: «Al pulsar aquí no solo borras el historial: destruimos por completo el ordenador virtual donde estabas navegando y estrenas uno nuevo.»

C) LA EXPERIENCIA DE SEGURIDAD EXPLICADA EN VIVO
1. Catálogo de 13 sucesos verificables en vivo
Grupo 1: Vigilancia comercial y publicidad
#	Suceso	Cómo se detecta técnicamente en ZERO	Certeza	Frase exacta para el cliente en español (sin alarmismo)	Qué hacen Brave, DuckDuckGo y Tor
1	Rastreo cortado	Intercepción en CDP (Fetch/Network) o DNS de una petición hacia un dominio clasificado en WhoTracks.me / EasyPrivacy / Disconnect.	Comprobado	«Hemos cortado una conexión de [Empresa] ([País]) que intentaba registrar tu visita a esta página.»	Brave y DDG: Lo bloquean en silencio y suman +1 a un contador numérico sin explicar qué hacía en ese momento. Tor: No bloquea rastreadores por lista por defecto (usa NoScript/aislamiento).
2	Intento de identificarte entre webs (Cookie de 3º / Sincronización de ID)	Detección de cabeceras Set-Cookie en dominios cruzados, píxeles 1x1 con parámetros de ID largos (uid=, partner_id=) o resolución DNS CNAME que apunta a un dominio de rastreo externo.	Comprobado	«[Empresa] ha intentado colocar o leer una etiqueta para reconocerte cuando pases de esta web a otra. ZERO la ha bloqueado.»	Brave, DDG y Tor: Bloquean o aíslan la cookie en silencio; ninguno explica al usuario qué empresa intentaba cruzar su identidad ni detecta visualmente el engaño por CNAME.
3	Subasta de anuncios en directo	Detección en red de peticiones a endpoints OpenRTB / Prebid (openx, rubiconproject, adnxs, criteo, pubmatic) o inspección en el DOM del objeto global window.pbjs (Prebid.js) leyendo los postores activos.	Comprobado (existencia de puja y empresas) / Estimado (si se muestra valor medio de categoría)	«Al abrir esta página, [N] empresas publicitarias han intentado pujar en milisegundos por mostrarte anuncios según tu visita. ZERO ha detenido la subasta.»	Brave y DDG: Cortan las peticiones de red como un anuncio más; el usuario jamás se entera de que ha ocurrido una subasta sobre él. Tor: No la identifica.
Grupo 2: Sondeo de tu equipo y de lo que haces
#	Suceso	Cómo se detecta técnicamente en ZERO	Certeza	Frase exacta para el cliente en español (sin alarmismo)	Qué hacen Brave, DuckDuckGo y Tor
4	Intento de huella digital (Fingerprinting)	Hook en Page.addScriptToEvaluateOnNewDocument que detecta cuando un script externo llama a HTMLCanvasElement.toDataURL sin interacción del usuario, lee WEBGL_debug_renderer_info, genera ondas en OfflineAudioContext o mide más de 20 fuentes seguidas.	Comprobado (la lectura técnica) / Probable (que sea para perfilado único)	«Un programa dentro de esta web ha medido la tarjeta gráfica y las letras del navegador para intentar distinguir tu ordenador. ZERO le ha entregado la huella idéntica que compartimos todos los usuarios.»	Brave y Tor: Aplican defensas técnicas (ruido o bloqueo), pero en silencio o con un icono técnico oculto en un submenú. DDG: Corta el script solo si el dominio está en su lista.
5	Grabación de pantalla y teclado en vivo (Session Replay)	Detección de scripts conocidos de grabación (Hotjar, FullStory, Clarity, LogRocket, Mouseflow, Yandex Metrica) o detección de un MutationObserver + envío periódico de coordenadas de ratón/teclas no enviadas por WebSocket/POST.	Comprobado (si es proveedor conocido) / Probable (por heurística de eventos)	«Esta web incluía una herramienta de [Empresa] diseñada para grabar dónde mueves el ratón y lo que escribes en pantalla. ZERO la ha desconectado.»	Brave y DDG: Cortan algunos si están en EasyPrivacy, pero si la web los carga desde su propio dominio o no están en la lista, dejan grabar las teclas. Tor: No los distingue.
6	Intento de leer portapapeles, micrófono, cámara o ubicación	Interceptación en CDP de llamadas a navigator.clipboard.readText(), navigator.mediaDevices.getUserMedia() y navigator.geolocation.getCurrentPosition().	Comprobado	«Esta página ha solicitado leer [tu portapapeles / tu ubicación / tu micrófono]. ZERO ha denegado el acceso automáticamente.»	Todos: Muestran un cartel genérico del navegador («Esta web quiere usar tu ubicación: Permitir/Bloquear») sin explicar si el intento vino de un script oculto sin que tú tocaras nada.
Grupo 3: Maniobras de red y jurisdicciones
#	Suceso	Cómo se detecta técnicamente en ZERO	Certeza	Frase exacta para el cliente en español (sin alarmismo)	Qué hacen Brave, DuckDuckGo y Tor
7	Web que intenta abrir conexiones directas o ver tu IP	Detección de instanciación de RTCPeerConnection con servidores STUN externos o intentos de conexión fetch/WebSocket a direcciones IP locales (127.0.0.1, 192.168.x.x).	Comprobado	«La web ha intentado abrir un canal directo para consultar la dirección de tu red local. Como navegas desde el servidor de ZERO, tu red real nunca ha estado a su alcance.»	Brave y DDG: Si el usuario no cambia ajustes avanzados o si un script escanea puertos locales no listados, la IP real del usuario sigue expuesta a la web. Tor: Desactiva WebRTC.
8	Redirecciones encadenadas de seguimiento	Seguimiento de la cadena de respuestas HTTP 301/302/307 o meta refresh en el evento request.redirectedFrom() de CDP cuando un clic pasa por 2 o más dominios intermediarios antes de llegar a la web final, o limpieza de parámetros en el salto.	Comprobado	«Antes de llevarte a la página que has pulsado, el enlace intentaba hacerte pasar por [N] empresas intermediarias ([Lista]) para anotar tu clic. Hemos limpiado el camino.»	Todos: Siguen las redirecciones que no estén bloqueadas en su lista sin informar jamás al usuario de por cuántas manos ha pasado su clic antes de abrirse la página.
9	Petición a un país concreto distinto al de la web	Cruce del país de la sede de la empresa tercera (Wikidata/WhoTracks.me) o geolocalización del bloque IP en registros RIR públicos (ARIN, RIPE, LACNIC, APNIC, AFRINIC — licencias públicas abiertas) cuando difiere de la jurisdicción de la web visitada.	Comprobado (sede legal de la empresa) / Estimado (ubicación física del servidor por IP)	«Aunque estás visitando una web de [País A], esta intentaba enviar datos en segundo plano a servidores situados en [País B] ([Empresa]). Conexión cortada.»	Ninguno de los tres informa al usuario de a qué países están viajando las peticiones secundarias de la página que tiene abierta.
Grupo 4: Amenazas directas y fallos de seguridad
#	Suceso	Cómo se detecta técnicamente en ZERO	Certeza	Frase exacta para el cliente en español (sin alarmismo)	Qué hacen Brave, DuckDuckGo y Tor
10	Formulario que enviaría datos sin cifrar	Inspección del DOM al hacer foco en un <input type="password"> o tarjeta/texto dentro de una página http:// o en un <form action="http://..."> dentro de una web HTTPS (mixed form).	Comprobado	«Atención antes de escribir: el formulario de esta página no tiene candado de cifrado. Si envías datos aquí, viajarán abiertos por internet.»	Todos: Ponen un icono pequeño de «No seguro» en la barra de direcciones (que mucha gente ignora) o avisan tarde cuando ya has pulsado enviar.
11	Certificado dudoso o caducado	Evento Security.certificateError o inspección de SecurityDetails en CDP (certificado caducado, nombre de dominio no coincidente, emisor autofirmado o TLS 1.0/1.1 obsoleto).	Comprobado	«Hemos detenido la entrada a esta web porque su acreditación de seguridad está caducada o no coincide con su nombre oficial. Puede tratarse de un fallo técnico de la web o de una suplantación.»	Todos: Muestran una pantalla de error llena de jerga técnica (NET::ERR_CERT_AUTHORITY_INVALID) que el usuario medio no entiende.
12	Phishing o web maliciosa conocida	Coincidencia del dominio o URL en URLhaus (CC0) / PhishStats (MIT), o detección de dominio con similitud tipográfica (homograph/Levenshtein) a un banco/servicio grande cuyo certificado TLS fue emitido hace menos de 48 horas.	Comprobado (si está en lista de malware verificado) / Probable (si es alerta por dominio recién creado parecido a otro)	«Hemos pausado la carga: esta dirección figura en los registros públicos de páginas fraudulentas [o: fue creada hace menos de 48 horas imitando el nombre de otra web].»	Brave: Usa Google Safe Browsing (enviando prefijos de hash). DDG y Tor: No explican cuándo un dominio acaba de ser registrado ayer para imitar a un banco.
13	Descarga peligrosa o archivo externo	Evento Page.downloadWillBegin en CDP. Se analiza la extensión, el tipo MIME real (magic bytes) y el hash SHA-256 sin que el archivo salga jamás del contenedor del servidor.	Comprobado	«Esta web ha iniciado la descarga del archivo "[Nombre]". Lo hemos retenido en nuestra celda aislada para que no toque tu ordenador: puedes verlo en pantalla como imagen segura o descartarlo.»	Brave, DDG y Tor: Descargan el archivo directamente al disco duro del ordenador del cliente (o preguntan dónde guardarlo en su PC), dejando el riesgo en manos del usuario.
2. Cómo se muestra en la interfaz de PC

El panel derecho de 300 px («Lo que ZERO corta») en vivo:

Arriba (Resumen de un vistazo): El contador grande de cortes de la página actual, el número de empresas y banderas/nombres de países detectados, y las 4 barras horizontales («Para qué»: Publicidad, Rastreador, Seguimiento, Huella digital) alimentadas en tiempo real cada vez que CDP intercepta un evento.

En el centro (Hilo cronológico vivo): Una lista limpia donde cada suceso entra suavemente sin hacer saltar lo que el usuario está leyendo. Cada fila muestra: [Punto de color] · Hora exacta (23:18:04) · Nombre de la empresa y País · Frase de 1 línea en español llano. Al hacer clic en cualquier fila, se despliega la ficha técnica verificable (Dominio técnico cortado, Tipo de petición, Fuente de datos: WhoTracks.me / Wikidata, Grado de certeza: Comprobado).

Señales de intensidad (Verde / Ámbar / Coral — solo para cortes y defensas):

🟢 Verde (Cortado en seco): Rastreadores, anuncios, cookies de terceros, subastas publicitarias y lecturas de portapapeles que ZERO ha bloqueado antes de que salieran datos. Transmite calma: «Ya nos hemos encargado nosotros».

🟡 Ámbar (Disfrazado o neutralizado por aislamiento): Intentos de huella digital (donde la web no se puede bloquear sin romper la página, pero ZERO le ha entregado la huella clónica del servidor) o redirecciones de seguimiento que ZERO ha limpiado para dejarte pasar al destino.

🔴 Coral (Corte crítico o decisión necesaria): Phishing conocido detenido, certificado roto, descarga retenida en la celda aislada o formulario sin cifrar donde el usuario acaba de hacer clic para escribir.

El momento «Ha pasado algo importante» sin asustar:

Prohibido usar sirenas, pantallas rojas parpadeantes o iconos de calaveras.

Cuando ocurre un suceso Coral (por ejemplo, el usuario hace clic en una contraseña dentro de una web sin cifrar o un enlace intenta descargar un archivo .exe), se despliega una tarjeta serena en la parte superior del panel de 300 px (y un velo translúcido de cristal sobre la web si es un bloqueo de phishing) con tres líneas fijas:

Qué ha pasado: «Esta página intenta descargar un programa ejecutable a tu equipo.»

Por qué estás a salvo: «El archivo se ha quedado retenido en el servidor de ZERO; tu ordenador no lo ha recibido.»

Qué quieres hacer: Botón principal [Descartar archivo y seguir navegando] · Botón secundario [Inspeccionar en celda aislada].

El resumen del día y del mes con lo evitado:

Al abrir una nueva pestaña o al pulsar el botón PDF del panel derecho, ZERO genera un informe limpio (sin guardar qué webs privadas visitó el usuario si él no quiere, contando solo los cortes agregados en su contador de sesión/mes):

«Hoy en ZERO: 342 rastreadores cortados · 28 empresas detenidas en 6 países · 4 subastas publicitarias frenadas · 2 documentos abiertos en celda aislada · 0 archivos ejecutados en tu ordenador.»

Qué NO decir NUNCA (Lista negra de frases prohibidas en ZERO):

❌ Nunca decir: «Estás 100% protegido», «Eres totalmente anónimo» o «Eres invisible en internet».

❌ Nunca decir: «¡Peligro! Te están hackeando» ni llamar «ciberataque» o «espionaje de Estado» a un rastreador publicitario normal.

❌ Nunca inventar el dinero exacto que valen los datos de una persona (si se menciona el volumen de una subasta, rotular siempre Estimado según categoría publicitaria).

❌ Nunca atribuir un dominio desconocido a una empresa o país al azar: si un dominio solo tiene dirección IP sin empresa verificada, decir siempre Empresa no declarada · Servidor ubicado en [País según registro IP] (Estimado).

D) VEREDICTO (Las 5 cosas que haría primero, por orden)

Levantar el contenedor Chromium + Screencast por WebSocket + Bloqueador de red real en el servidor (@cliqz/adblocker + EasyList/EasyPrivacy/Peter Lowe/URLhaus).

Qué pasa de demo a real: La barra de búsqueda deja de abrir una maqueta fija; el cliente navega por cualquier web real de internet desde un servidor aislado y el contador de cortes del panel derecho cuenta peticiones reales bloqueadas al vuelo.

Conectar en memoria la tabla de atribución de empresas y países (WhoTracks.me CC BY 4.0 + Disconnect GPLv3 + Wikidata CC0 + 100 empresas verificadas por dos voces).

Qué pasa de demo a real: Desaparece para siempre el rótulo · ejemplo / SIMULADO de la lista de empresas, países y barras «para qué»: cada nombre de empresa, sede y propósito que ve el cliente corresponde al tráfico real de la web que tiene abierta.

Inyectar los sensores en vivo del navegador (detector de subastas Prebid/RTB, detector de huella Canvas/WebGL, freno de portapapeles, formularios sin cifrar y rechazo automático de cookies con Consent-O-Matic).

Qué pasa de demo a real: La pestaña «Subasta» y el hilo cronológico dejan de ser una animación de diseño y pasan a narrar en directo, con frases claras en español, las pujas publicitarias y los intentos reales de medir el equipo en cada página.

Activar el motor de ahorro mensual (bajada automática a 0 fps en reposo, congelación de pestañas en segundo plano, pausa a los 3 minutos e incinerador de sesión) y superar las 5 pruebas de fuga.

Qué pasa de demo a real: ZERO pasa de ser un prototipo que consumiría demasiada CPU a un producto comercialmente viable los 30 días del mes y verificado contra fugas de IP, DNS y WebRTC.

Integrar la celda aislada de descargas (conversión de PDF/documentos a píxeles en el servidor) y el generador real del Informe PDF.

Qué pasa de demo a real: Las descargas dejan de ser un riesgo para el PC del cliente y el botón «PDF» del panel derecho entrega un acta auditable con los cortes reales de su sesión.

E) NOVEDAD (Investigación del mercado y 5 funciones inéditas)
Panorama actual verificado

Navegadores de consumo: Brave (Brave Shields en Rust, almacenamiento efímero de terceros, SugarCoat, Brave Leo), DuckDuckGo (Tracker Radar, Duck Player, App Tracking Protection), Tor Browser y Mullvad Browser (unificación de huella, Letterboxing, First-Party Isolation, circuitos Tor en el caso de Tor), Firefox (Total Cookie Protection), Vivaldi, Opera y Arc (Fuentes: Documentación técnica de Brave Shields, repositorio duckduckgo/tracker-radar, especificación de diseño de Tor Browser y documentación de Mullvad Browser). Limitación común: Todos ejecutan el código de la web dentro del ordenador del cliente y cortan cosas en silencio sin explicar qué está ocurriendo.

Navegadores remotos empresariales (RBI): Cloudflare Browser Isolation (transmisión de comandos vectoriales/WebRTC), Menlo Security (Adaptive Clientless Rendering y desactivación de documentos CDR), Island, Talon (Palo Alto Networks), Kasm Workspaces y Ericom (Zscaler) (Fuentes: Documentación arquitectónica de Cloudflare Zero Trust Browser Isolation, Menlo Security Isolation Core y KasmVNC). Limitación común: Están diseñados para que el departamento informático de una gran empresa vigile y restrinja a sus propios empleados; cuestan miles de dólares en licencias corporativas y jamás le explican al usuario qué rastreadores o subastas intentan espiarle desde la web.

5 cosas que ninguno hace y que ZERO puede hacer de verdad con esta arquitectura
1. El «Doble Espejo» (Comparación en directo «Con ZERO / Sin ZERO» en dos máquinas paralelas)

Qué es: Un botón en el panel de 300 px llamado «Ver qué habría pasado sin ZERO». Al pulsarlo, nuestro servidor abre durante 5 segundos esa misma dirección web en un segundo contenedor efímero sin escudos (sin tocar jamás el equipo del usuario) y le muestra una comparativa visual e instantánea: a la izquierda su web limpia en ZERO; a la derecha una radiografía con los anuncios, los avisos de cookies y la lista exacta de las 40 o 60 conexiones ocultas que habrían entrado en su ordenador si hubiera usado un navegador corriente.

Por qué nadie lo hace: Un navegador normal instalado en tu PC (Brave, Firefox, DuckDuckGo) no puede abrir una copia de la web sin protección para comparar porque metería de verdad todas esas cookies, rastreadores y posibles virus dentro de tu propio ordenador. ZERO sí puede porque ocurre en una segunda celda desechable en la nube que se destruye a los 5 segundos.

Qué le aporta al cliente: Ve con sus propios ojos, sin ningún riesgo, de qué le está librando su suscripción en su periódico o tienda habitual.

Qué le aporta a GUARDIANA: El argumento de venta y retención más potente posible (la persona comprueba al instante la diferencia entre navegar a pelo y navegar en ZERO) y vídeos virales reales para redes sociales.

Dificultad: Baja-Media (2 semanas; es levantar un segundo contexto de Playwright sin filtros durante 5 segundos, capturar su HAR de red y su imagen, y destruir el contenedor).

2. «Pasaporte de Sesión» (Coartada geográfica, horaria y lingüística 100% coherente)

Qué es: Cuando un usuario usa una VPN o Tor en otros navegadores y sale a internet por Suiza o Alemania, su navegador sigue diciendo internamente que su reloj está en hora de Colombia o España y que su teclado e idioma son en español. Los sistemas de vigilancia y antibots (Cloudflare, Akamai, bancos, buscadores) detectan esa contradicción en 10 milisegundos, saben que oculta su conexión y lo bloquean con CAPTCHAs infinitos. En ZERO, como controlamos la máquina virtual entera, cuando la sesión sale por un país (por ejemplo, Suiza), el contenedor de ZERO ajusta automáticamente su reloj del sistema (TZ=Europe/Zurich), su configuración regional (de-CH) y sus cabeceras de idioma para que coincidan al 100% con un ciudadano local de ese país, mientras ofrece traducir la página al español para el cliente.

Por qué nadie lo hace: Los navegadores locales toman la hora y la configuración regional del sistema operativo del usuario o, como Tor, fuerzan a todo el mundo a UTC e inglés de EE. UU. (lo cual también los delata cuando salen por un nodo europeo o asiático). Los RBI empresariales no buscan proteger la privacidad ciudadana.

Qué le aporta al cliente: Navega con privacidad sin sufrir el castigo constante de páginas rotas o CAPTCHAs interminables, y puede ver precios de vuelos o servicios tal como los ve de verdad un residente de ese país.

Qué le aporta a GUARDIANA: Resuelve la mayor molestia práctica de usar navegadores ultraseguros (que muchas webs te bloqueen la entrada por parecer anómalo).

Dificultad: Baja (1 semana; es pasar los parámetros locale y timezoneId a browser.newContext() en Playwright sincronizados con el país de la IP de salida del contenedor).

3. El «Escáner de la Subasta» traducido al ciudadano (Inspección OpenRTB / Prebid en vivo)

Qué es: Antes de bloquear el script de subasta publicitaria (Prebid.js / gpt.js), un scriptlet de ZERO en el servidor intercepta en memoria la papeleta de subasta que la web acaba de preparar y se la traduce al cliente en la pestaña «Subasta»: qué empresas pujaban (Criteo, Rubicon, AppNexus, Index Exchange), en qué países están sus servidores, cuántos huecos de pantalla vendían y qué etiquetas temáticas de la página iban adjuntas en la puja.

Por qué nadie lo hace: Los bloqueadores tradicionales (uBlock, Brave, DuckDuckGo) simplemente cortan la descarga del archivo prebid.js en la red; al no dejar que se forme el paquete de puja en una jaula controlada, nunca saben qué iba dentro ni pueden contárselo al usuario.

Qué le aporta al cliente: Por primera vez entiende cómo funciona el negocio oculto de internet: ve con nombres y apellidos cómo una web intenta subastar su atención en menos de 200 milisegundos.

Qué le aporta a GUARDIANA: Convierte la pestaña «Subasta» aprobada en el diseño en una función real única en el mundo, imposible de copiar por un simple bloqueador de anuncios.

Dificultad: Media (2–3 semanas; requiere interceptar las llamadas a pbjs.que y las peticiones JSON salientes a endpoints RTB conocidas, leer sus campos y abortar el envío de red real).

4. La «Esclusa de Enlaces» para WhatsApp, SMS y Correo (Detonación segura antes de abrir)

Qué es: Un buzón directo en la portada de ZERO donde el cliente pega cualquier enlace sospechoso que le hayan enviado por WhatsApp, SMS o correo electrónico («Tu paquete de Correos está retenido», «Factura pendiente», «Mira esta foto»). Antes de mostrárselo, ZERO abre ese enlace en una celda aislada durante 3 segundos, recorre todos los saltos ocultos, comprueba cuándo se creó el dominio, verifica si imita a un banco o empresa de mensajería, retiene cualquier descarga automática y le presenta al cliente una ficha clara: «Este enlace corto pasa por 3 países y termina en una web creada ayer que imita a un banco. Te mostramos una fotografía de la página sin ningún peligro para ti».

Por qué nadie lo hace: Los navegadores normales solo te dejan pegar un enlace para abrirlo directamente en tu equipo. Las herramientas de análisis como urlscan.io o VirusTotal son para informáticos, están llenas de códigos incomprensibles y publican tu enlace en abierto para todo internet.

Qué le aporta al cliente: Un lugar cotidiano al que acudir cada vez que duda de un mensaje en su teléfono o correo, explicado para cualquier persona de la familia.

Qué le aporta a GUARDIANA: Convierte a ZERO en un hábito diario (incluso cuando la persona está mirando el móvil o su correo, entra en GUARDIANA para comprobar enlaces dudosos).

Dificultad: Baja-Media (2 semanas; combina el motor de Playwright, la traza de redirecciones CDP, consulta de antigüedad de certificado TLS y captura de pantalla).

5. «Acta de Destrucción» de Sesión (Recibo verificable de limpieza)

Qué es: Cuando el cliente termina de hacer una gestión delicada (banca, salud, consultas legales, uso de IA) y cierra ZERO o pulsa el botón de quemar sesión, el sistema no solo cierra la pestaña: destruye la máquina virtual y le muestra en pantalla (con opción de descarga en PDF) un Acta de Cierre de Sesión firmada por el servidor de GUARDIANA: «Sesión #84920 finalizada a las 23:40 UTC. Máquina virtual destruida. Memoria RAM liberada (0 bytes conservados). 184 rastreadores bloqueados durante la sesión».

Por qué nadie lo hace: En un navegador normal nunca se destruye ninguna máquina; en los navegadores empresariales (Cloudflare, Menlo) los registros se guardan para que el jefe de seguridad de la empresa audite al empleado, justo lo contrario de lo que busca un ciudadano que valora su privacidad.

Qué le aporta al cliente: La certeza psicológica y técnica al terminar: sabe exactamente cuándo se ha cerrado y destruido el entorno donde estuvo trabajando.

Qué le aporta a GUARDIANA: Cierra el círculo de la experiencia de seguridad desde que entra (entrada de cine) hasta que se va (acta de destrucción limpia).

Dificultad: Baja (1 semana; conectando el retorno del comando de destrucción del contenedor/microVM con un recibo firmado criptográficamente sin incluir el historial de URLs).

F) LA INTELIGENCIA ARTIFICIAL DENTRO DE ZERO
1. Nombre de la función y sitio en la interfaz

Nombre de la función: CÁMARA IA (subtítulo en la interfaz: «Tus inteligencias artificiales, bajo tu control»).

Sitio en la interfaz de PC:

En la barra de cristal superior de ZERO: Un botón directo junto al selector de buscadores y al botón ULTRA llamado CÁMARA IA, desde el cual el cliente abre con un clic sus cuentas habituales (ChatGPT, Claude, Gemini, Perplexity, Copilot) o VERALUN (la IA privada de GUARDIANA).

Activación automática inteligente: En cuanto el cliente abre cualquier dirección de una IA conocida (chatgpt.com, claude.ai, gemini.google.com, perplexity.ai, copilot.microsoft.com), el panel derecho de 300 px («Lo que ZERO corta») añade automáticamente arriba una pestaña activa llamada «Escudo IA» y envuelve la caja de escritura de la IA con un borde sutil de cristal de GUARDIANA.

2. Cómo protege ZERO al usuario mientras usa SUS cuentas de IA
[Cliente escribe en ZERO] 
   │  "Redacta un contrato para Francisco Salvatierra (DNI 12345678Z, tel +34 600112233)"
   ▼
[FILTRO EN EL SERVIDOR DE ZERO (En memoria RAM efímera)]
   ├── 1. Detecta datos personales y avisa al cliente antes de salir.
   ├── 2. Sustituye: "Francisco Salvatierra" → [PERSONA_1] | "12345678Z" → [DOC_1] | "+34 600..." → [TEL_1]
   └── 3. Guarda la llave ([PERSONA_1] = Francisco...) SOLO en la RAM de ZERO.
   │
   ▼  (Lo que viaja a OpenAI / Google / Anthropic)
[Web de ChatGPT / Claude / Gemini]
   │  Recibe: "Redacta un contrato para [PERSONA_1] (DNI [DOC_1], tel [TEL_1])"
   │  Responde: "REUNIDOS: De una parte, D. [PERSONA_1], con documento [DOC_1]..."
   ▼
[RESTAURADOR DE ZERO EN EL DOM ANTES DE ENVIAR PÍXELES]
   ├── Sustituye en vivo [PERSONA_1] → "Francisco Salvatierra" en la pantalla.
   ▼
[Pantalla del Cliente]
   Lee el contrato completo con su nombre, DNI y teléfono reales, sin que la IA externa los haya visto jamás.

Sustitución y restauración automática de datos personales (Pseudonimización en el vuelo):

Como la página web de ChatGPT, Claude o Gemini se ejecuta dentro del Chromium controlado por ZERO en nuestro servidor, un script inyectado por CDP vigila la caja de texto donde escribe el usuario.

Antes de que el mensaje salga hacia el servidor de la IA externa, un motor local ejecutado en nuestra máquina (combinación de reglas exactas para teléfonos, correos, números de tarjeta de crédito por algoritmo de Luhn, IBAN, documentos de identidad y direcciones IP + un modelo ligero de reconocimiento de entidades GLiNER / spaCy que corre en local sin salir a internet en menos de 25 ms) detecta nombres propios, empresas y direcciones.

Cambia los datos reales por marcadores ([PERSONA_1], [EMPRESA_1], [TELÉFONO_1], [TARJETA_1]) y envía el texto limpio a la IA. Cuando la IA va escribiendo su respuesta en pantalla, un MutationObserver de ZERO en el navegador remoto vuelve a cambiar [PERSONA_1] por el nombre real antes de mandar la imagen al cliente.

Para imágenes y fotografías: Si el usuario adjunta una foto a una IA externa, ZERO borra automáticamente en el servidor todos los metadatos ocultos EXIF (coordenadas GPS exactas de dónde se tomó la foto, modelo de móvil y fecha) y ofrece un botón de 1 clic para difuminar las caras detectadas localmente con OpenCV antes de que la imagen suba a la IA.

Aviso previo antes de enviar («Semáforo de Salida»):

Si el usuario pega un texto o documento que contiene datos sensibles, antes de que salga hacia la IA aparece sobre la caja de texto una tarjeta clara:

«ZERO ha detectado en tu mensaje: 1 nombre, 1 teléfono y 1 correo electrónico.»

Botones: [Enviar ocultando mis datos (Recomendado)] · [Pasar esta consulta a VERALUN privado] · [Enviar sin cambios].

Memoria y contexto que se quedan en GUARDIANA:

En vez de guardar su historial de vida o los datos de su empresa en la «Memoria» de ChatGPT o Claude, el cliente tiene en el panel derecho una pestaña «Mi Contexto en GUARDIANA» (cifrado con su llave). Con un clic puede adjuntar ese contexto a cualquier IA ya filtrado de datos personales, de modo que si mañana cambia de ChatGPT a Claude o a VERALUN, su memoria es suya y no está secuestrada por ningún proveedor.

Separación de identidad de red y corte de telemetría de los portales de IA:

Las webs de ChatGPT, Claude o Perplexity cargan decenas de scripts de seguimiento y telemetría de terceros (Datadog, Segment, Intercom, Statsig, Sentry, Cloudflare Insights) además de ver tu IP doméstica y la huella de tu ordenador. Dentro de ZERO, la IA externa nunca ve tu dirección IP real ni tu ordenador, y ZERO corta todos los rastreadores analíticos secundarios de la página de la IA sin romper el chat.

Registro auditable («Qué IA ha visto qué»):

En el panel derecho de 300 px queda anotado en tiempo real: «En esta sesión con ChatGPT: 6 mensajes enviados · 9 datos personales sustituidos por códigos antes de salir · 7 rastreadores de telemetría de la web cortados».

Comparar varias IA a la vez y desvío a VERALUN para lo más sensible:

El usuario puede abrir la Vista Doble de Cámara IA: escribe su consulta una sola vez en la barra de ZERO, el filtro limpia los datos personales y ZERO la escribe simultáneamente en las dos pestañas donde el usuario tenga abiertas sus cuentas (por ejemplo, ChatGPT a la izquierda y Claude a la derecha) o en VERALUN, para que compare las respuestas lado a lado.

Cuando el documento es un secreto industrial, médico o legal que ni siquiera con nombres cambiados debe salir a empresas de EE. UU. o terceros países, un botón cambia en el acto a VERALUN (ejecutado bajo control de GUARDIANA sin guardar ni entrenar con la conversación).

3. Qué es posible con el navegador remoto, qué requiere API, Condiciones de Uso (ToS) y qué NO prometer
Aspecto	Realidad técnica y legal verificada
Qué es 100% posible con el navegador remoto (sin pagar API de terceros)	Todo lo que ocurre en la página web de la IA que el cliente ya usa (sea su cuenta gratuita o de pago): interceptar el texto antes de pulsar enviar, cambiar nombres/teléfonos por códigos y restaurarlos al recibir la respuesta, limpiar metadatos EXIF y caras de las fotos antes de subirlas, cortar la telemetría (Segment/Datadog) de la web de la IA, ocultar la IP y huella del PC del usuario, y pegar la misma pregunta en dos pestañas abiertas por el usuario.
Qué requiere API (o servidores propios)	VERALUN (la IA propia de GUARDIANA) corre sobre motores controlados por nosotros/API privada sin retención. En cambio, para que el cliente use sus cuentas personales de ChatGPT, Claude o Gemini sin coste extra para GUARDIANA, debe hacerlo a través de las páginas web dentro de ZERO, porque la suscripción que el cliente ya paga a ChatGPT Plus o Claude Pro no da una clave API gratuita, sino acceso web.
Qué permiten y qué prohíben las Condiciones de Uso (ToS) de los proveedores	OpenAI, Anthropic y Google prohíben el scraping masivo por bots automatizados y prohíben compartir una sola cuenta entre múltiples personas. No prohíben que un usuario humano use un navegador con bloqueador de rastreadores ni que redacte o cambie sus datos personales por pseudónimos antes de enviar su propio mensaje. Clave técnica para no ser bloqueados por Cloudflare Turnstile: en ZERO es el propio usuario quien navega e inicia sesión en su pestaña; nuestro filtro actúa como un asistente de escritura sobre su caja de texto en el instante en que él decide pulsar enviar, nunca como un robot desatendido.
Qué NO se puede prometer nunca	

1. No prometer anonimato de cuenta si el cliente inicia sesión con su correo personal: Si el usuario entra en ChatGPT poniendo su cuenta nombre.apellido@gmail.com y pagando con su tarjeta en OpenAI, hay que explicarle con honestidad que OpenAI sabe quién es el dueño de esa cuenta (lo que ZERO oculta es su IP, su ordenador y los datos privados dentro de los textos y archivos que filtre). Si quiere que la IA no sepa ni siquiera qué cuenta es, debe usar VERALUN o servicios que no pidan cuenta.

2. No prometer que el detector automático acierta el 100% de las veces en textos confusos: Un detector automático puede pasar por alto un apodo o un dato escrito de forma inusual; por eso ZERO muestra siempre el «Semáforo de Salida» para que la persona vea y confirme en 1 segundo qué palabras van a quedar ocultas antes de que el mensaje salga.

Cómo se explica a un cliente no técnico en dos frases:

«Entra desde ZERO en tus cuentas de ChatGPT, Claude o Gemini como haces todos los días, pero con nuestro filtro en medio: antes de que tu consulta salga hacia ellos, ZERO cambia tus nombres, teléfonos y datos privados por códigos falsos y vuelve a poner los datos reales en tu pantalla cuando te responden. Así aprovechas toda la potencia de tus inteligencias artificiales sin regalarles tu vida privada, tus documentos ni el rastro de tu ordenador.»

G) EL CEREBRO QUE SOLO HABLA DE LOS DATOS Y EL HOGAR GUARDIANA
1. Cómo llamarlo sin engañar y cuál es su metáfora

Qué NO prometer ni usar en el nombre: No llamarlo «Cerebro Cuántico». Si no utiliza un procesador cuántico físico real, usar la palabra «cuántico» incumple la regla de oro de GUARDIANA («nada que no se pueda verificar») y daría munición a cualquier experto o competidor para acusar a la marca de exageración comercial.

Nombre propuesto: EL NÚCLEO (o EL AUDITOR DE GUARDIANA).

Por qué no parece una IA ni un chatbot:

Cómo se ve: No es un muñeco, ni un robot, ni una burbuja de chat abajo a la derecha que saluda diciendo «¡Hola! ¿En qué te ayudo hoy?». Es un panel de control óptico integrado en la parte superior central de GUARDIANA: un anillo o línea de precisión que muestra en vivo el latido de los datos verificados y una única ranura sobria que dice: Pregúntale al Núcleo sobre tus datos.

Cómo habla: No conversa, no da consejos de vida, no cuenta chistes, no escribe textos creativos ni opina. Habla como un notario técnico claro y directo: frases cortas, cifras exactas comprobadas y siempre con el origen del dato debajo.

Por qué el cliente lo percibe como algo superior que gobierna a la IA: Porque mientras las inteligencias artificiales normales (ChatGPT, Gemini, Claude) son habladoras, a veces inventan cosas y quieren quedarse con tus datos, El Núcleo está por encima de ellas vigilándolas, cortándoles el paso cuando intentan ver de más y hablando únicamente con pruebas verificadas.

2. Cómo se garantiza técnicamente que SOLO responde sobre los datos (Arquitectura de Invención Cero)

Para garantizar al 100% que El Núcleo jamás responda a preguntas ajenas (recetas, política, deberes, charla general) ni invente una sola cifra, no se conecta la pregunta del cliente a un modelo de lenguaje libre. Se construye una tubería cerrada de 4 pasos que corre íntegramente en los servidores de GUARDIANA sin conexión a internet exterior:

[Pregunta del cliente]
       │
       ▼
[PASO 1: Clasificador de Intención de Lista Blanca (5 únicas categorías permitidas)]
       ├── ¿No pertenece a los datos de GUARDIANA / del cliente? 
       │      └──► RECHAZO EN 5 ms (Respuesta fija, sin tocar ningún modelo generativo).
       │
       ├── ¿Sí pertenece a una de las 5 categorías de datos?
       ▼
[PASO 2: Traductor a Consulta Estructurada (SQL / JSON sobre las tablas reales)]
       │   Lee únicamente:
       │   1. Tabla de cortes y sucesos de su sesión en ZERO.
       │   2. Tabla de retenciones de la Cámara IA (qué ha visto cada IA).
       │   3. Tabla de Radiografías de las webs consultadas.
       │   4. Base de datos verificada de infraestructura de Órbita.
       │   5. Estado de aislamiento de su máquina remota.
       ▼
[PASO 3: Generador de Respuesta por Plantilla Auditada + Modelo Local Restringido]
       │   (Modelo pequeño local de 3B parámetros autoalojado con gramática forzada GBNF 
       │    que tiene prohibido emitir números o nombres que no estén en el JSON recuperado).
       ▼
[PASO 4: Sello de Verificación]
       └── Añade siempre al pie: [Fuente exacta · Hora · Grado de certeza: Comprobado / Estimado]

Cómo responde cuando le preguntan sobre los datos (Ejemplo real):

Pregunta del cliente: «¿Quién ha intentado seguirme hoy y qué ha visto ChatGPT de mí?»

Respuesta del Núcleo:

Corte de seguimiento hoy (Comprobado): 47 peticiones bloqueadas en 3 páginas visitadas. Las empresas con más intentos han sido Alphabet Inc. (Estados Unidos, 19 cortes), Criteo S.A. (Francia, 11 cortes) y Meta Platforms Inc. (Estados Unidos, 6 cortes).
Vigilancia sobre IA externas (Comprobado): Has enviado 3 consultas a ChatGPT. El Núcleo ha retenido 2 nombres propios y 1 número de teléfono antes de que salieran de GUARDIANA y ha bloqueado 5 conexiones de telemetría de su web.
Fuente: Registro en memoria de tu sesión #9042 · Datos de empresas: WhoTracks.me (CC BY 4.0) y Wikidata (CC0).

Cómo rechaza todo lo demás (Respuesta exacta por defecto):

Pregunta del cliente: «¿Quién ganó el partido de ayer?» o «Escríbeme un correo para mi jefe».

Respuesta instantánea del Núcleo:

«El Núcleo solo responde con datos comprobados sobre tu seguridad, tus cortes en ZERO, las radiografías de las webs, las rutas de Órbita y nuestro control sobre las inteligencias artificiales. Para redactar textos o hacer consultas generales con protección de datos, abre la Cámara IA dentro de ZERO.»

3. Qué papel tiene sobre las otras IA y qué puede decir con certeza

Sus 4 funciones de mando sobre las IA de terceros (ChatGPT, Gemini, Claude, etc.):

Puerta: Ninguna IA externa se abre ni recibe una sola tecla sin pasar por el contenedor vigilado por El Núcleo.

Filtro: Es quien ejecuta el cambio de nombres, teléfonos y documentos reales por códigos [PERSONA_1] antes de que salgan hacia la IA externa.

Memoria: Guarda en el espacio privado del usuario los datos y contextos que el usuario no quiere regalar a los servidores de las grandes tecnológicas.

Juez: Mide y muestra al cliente el comportamiento de la web de cada IA (cuántos rastreadores de telemetría carga la página de esa IA, a qué países envía datos y cuántos datos personales ha intentado recibir en el mes).

Qué puede decir con certeza y qué no:

Con certeza (Comprobado): Peticiones cortadas en la sesión, dominios bloqueados, empresa matriz y país de su sede legal registrados en las bases abiertas, parámetros de seguimiento borrados de la URL, datos sustituidos antes de ir a una IA externa, estado del certificado TLS de la web y cables/centros de datos verificados en Órbita.

Con etiqueta obligatoria (Estimado / Probable): La ubicación física de un servidor cuando solo se conoce por su registro de red IP, el propósito de un script nuevo ofuscado que no está en listas pero ejecuta lecturas de huella digital, y la ruta intermedia exacta entre dos países cuando las operadoras no publican sus saltos internos.

Cómo se enseña al cliente en una frase:

«El Núcleo no es una inteligencia artificial para charlar: es el vigilante que controla a las inteligencias artificiales y te responde únicamente con datos comprobados de lo que ocurre con tu privacidad.»

4. Cómo se traduce en la Primera Pantalla («Tu hogar desde el minuto uno») y en cada página
La Primera Pantalla al entrar en guardianagroup.com (El Hogar)

Cuando la persona entra cada mañana en GUARDIANA, no ve un folleto comercial: entra directamente en su hogar de navegación y trabajo, limpio, sereno y vivo desde el primer segundo:

Arriba del todo (La Banda del Núcleo — Seguridad desde el segundo uno):

Una línea de cristal sobria con luz verde serena que le confirma su estado real sin que tenga que tocar nada:

🟢 EL NÚCLEO · Tu sesión está aislada en un servidor limpio de GUARDIANA · Tu ordenador e IP están ocultos · 0 rastreadores activos

A la derecha de esa misma banda, la caja directa: «Pregunta al Núcleo sobre tus datos...».

En el centro (La Entrada de Cine y la Barra Única de Cristal):

La red neuronal se transforma suavemente en la barra central de cristal con el selector de buscadores sin logotipos y el botón ULTRA.

Debajo de la barra, tres puertas claras de 1 clic para lo que cualquier persona hace todos los días en internet:

[ 1. Navegar y Buscar en ZERO ] (La web nunca toca tu equipo).

[ 2. Abrir mis Inteligencias Artificiales blindadas ] (Usa ChatGPT, Claude, Gemini o VERALUN sin entregar tus datos personales).

[ 3. Comprobar una web o enlace sospechoso ] (Haz una Radiografía o abre un enlace de WhatsApp/correo en celda aislada antes de entrar).

Abajo (Tu Resumen Vivo):

Tres contadores limpios de su actividad protegida: «Este mes en tu hogar GUARDIANA: [X] rastreadores cortados · [Y] empresas detenidas · [Z] datos personales ocultados a las IA».

La presencia del Núcleo en las tres piezas de GUARDIANA
Pieza de GUARDIANA	Qué hace y qué dice El Núcleo en esa pantalla
En ÓRBITA (El planeta 3D con la infraestructura verificada)	El Núcleo conecta el mapa físico del mundo con la vida real del cliente. Cuando el usuario gira el planeta o toca un país o ruta verificada, El Núcleo le muestra arriba: «En lo que llevas de semana, ZERO ha cortado 64 intentos de enviar datos de tu navegación hacia servidores situados en este país ([Nombre del país]), pertenecientes a [N] empresas».
En RADIOGRAFÍAS (Qué ve de ti cada web)	Cuando el cliente escribe el nombre de una web para examinarla antes de entrar, El Núcleo encabeza el resultado con un veredicto claro y accionable: «Radiografía comprobada: esta web intenta conectar con 19 empresas de publicidad y seguimiento en 3 países al abrirse. [Botón: Abrir ahora en ZERO con estas 19 conexiones ya cortadas]».
En ZERO (El navegador remoto y la Cámara IA)	El Núcleo preside la parte superior del panel derecho de 300 px («Lo que ZERO corta») y la Cámara IA. Va narrando en tiempo real cada corte en español sencillo, vigila lo que el usuario escribe a las inteligencias artificiales para cambiar sus datos reales por códigos antes de salir, y responde en el acto a cualquier pregunta sobre lo que esa página o esa IA ha intentado hacer durante la sesión.

Gemini es una IA y puede cometer errores.
