# Ronda 40 · Gemini (4 Argon, «Alto») · segunda parte: bloques H, I, J

Chat: https://gemini.google.com/app/7cafd878b80babbd

---

H) QUE NO NOS ATAQUEN; Y SI NOS ATACAN, SELLAR Y DESTRUIR («EL ANTIVIRUS 3.0»)
Por qué el «Antivirus 3.0» ya no es un programa que busca virus en tu disco duro

El antivirus antiguo (1.0 y 2.0) espera a que el código malicioso entre en el ordenador del cliente e intenta reconocerlo comparándolo con una lista de virus conocidos. Si el virus es nuevo (ataque de día cero), el antivirus falla y el ordenador queda infectado.

El Antivirus 3.0 de ZERO cambia las reglas físicas: ningún código de ninguna página web ni ningún archivo descargado se ejecuta jamás en el ordenador del cliente. Todo ocurre dentro de una máquina virtual efímera en nuestros servidores, vigilada desde fuera del sistema operativo invitado. Si una web trae un ataque nuevo que nadie en el mundo ha visto antes, lo único que toca es una celda desechable que podemos congelar, sellar y destruir en milisegundos.

PLANO 1: La sesión del cliente en ZERO (Detección, Respuesta Gradual y Botón de Pánico)
1. Detección en vivo de ataque o espionaje dentro de la celda de ZERO

Vigilamos la sesión desde fuera del navegador (para que un atacante que rompa Chromium no pueda apagar las cámaras de vigilancia) con seis sensores de código abierto:

Amenaza o espionaje	Cómo se detecta técnicamente en vivo	Herramienta / Licencia	Certeza
Exploits contra el navegador (caída o corrupción de memoria en V8/Blink)	Vigilancia del proceso de renderizado de Chromium mediante CDP (Inspector.targetCrashed) y captura de señales del kernel (SIGSEGV, SIGILL, SIGABRT, fallos de asignación de memoria de pila) en el contenedor.	Kernel Linux / gVisor (runsc, Apache 2.0) + CDP	Comprobado
Intentos de salir de la celda (Sandbox Escape)	Cualquier llamada al sistema (syscall) no habitual en un navegador (intentar ejecutar /bin/sh, execve, montar sistemas de archivos mount, usar ptrace o cargar módulos de kernel).	Falco o Cilium Tetragon (eBPF, Apache 2.0) + perfil seccomp-bpf	Comprobado
Descargas con malware o código oculto	Retención del archivo en la carpeta temporal en RAM (tmpfs) antes de mostrárselo al usuario. Análisis instantáneo de la cabecera real del archivo (magic bytes), reglas de estructura y firmas conocidas sin ejecutarlo.	YARA (BSD-3-Clause) + ClamAV (GPLv2) + URLhaus (CC0)	Comprobado (si coincide con firma) / Probable (si oculta extensión doble, ej. factura.pdf.exe)
Robo de sesión e inyección (XSS / secuestro de cookies)	Detección de scripts de terceros que intentan leer document.cookie, localStorage de autenticación o reenviar tokens de autorización (Bearer) hacia un dominio distinto al de la página principal.	Hooks de CDP (Network.requestWillBeSent + Page.addScriptToEvaluateOnNewDocument)	Comprobado (el intento de envío cruzado)
Escaneo de red interna o conexiones salientes anómalas	Intentos desde la web de conectar a puertos no web (SSH 22, SMB 445, RDP 3389), a direcciones locales (127.0.0.1, 192.168.x.x) o apertura súbita de más de 50 conexiones hacia servidores desconocidos.	Firewall nftables (GPLv2) con registro de paquetes rechazados (NFT_LOG)	Comprobado
Secuestro de procesador (Cryptojacking / abuso silencioso)	Una pestaña mantiene la CPU virtual al >85% durante más de 8 segundos ejecutando WebAssembly o WebWorkers sin que el usuario esté reproduciendo vídeo ni interactuando.	Métricas de Performance.getMetrics en CDP + cgroups v2	Probable (comportamiento anómalo verificado)
2. Respuesta automática gradual en 4 niveles (de bisturí a destrucción total)
Nivel 1: CORTE DE HILO (1 ms)      ──► Corta solo la petición o el script malicioso. El cliente sigue leyendo la página.
Nivel 2: CONGELACIÓN DE PESTAÑA    ──► Pausa el proceso de esa pestaña (SIGSTOP) y pone un cristal de aviso encima.
Nivel 3: SELLADO DE CELDA (10 ms)  ──► Corta el cable de red virtual (eth0 down). Nada entra ni sale de la máquina.
Nivel 4: INCINERACIÓN Y BORRADO    ──► Mata la microVM, sobrescribe la RAM (tmpfs) y destruye la llave efímera.

Nivel 1 · Cortar la conexión sospechosa (Automático en <1 ms): Para phishing conocido, scripts que intentan robar tokens hacia otro dominio o intentos de leer la red local. Se aborta el socket TCP/TLS concreto; el resto de la sesión sigue intacta.

Nivel 2 · Congelar la pestaña (Automático en <20 ms): Si una pestaña dispara un pico anómalo de CPU (cryptojacking), intenta descargar un ejecutable sin clic del usuario o provoca un cierre brusco del motor gráfico (targetCrashed), ZERO envía SIGSTOP al proceso de esa pestaña concreta, congela su imagen en pantalla con un velo ámbar y mantiene el resto de pestañas a salvo.

Nivel 3 · Sellar la sesión (Automático en <10 ms ante anomalía grave): Si el sensor eBPF/seccomp detecta que el proceso del navegador intenta ejecutar un comando del sistema operativo (/bin/sh, lectura de archivos fuera de su carpeta), el orquestador desconecta en el acto la tarjeta de red virtual del contenedor (ip link set veth0 down). La sesión queda sellada al vacío: aunque hubiese un virus dentro, ya no tiene cable por el que enviar ningún dato al atacante.

Nivel 4 · Destruir la microVM con borrado comprobado (Crypto-Shredding en RAM): Inmediatamente después del sellado (o al pulsar el Botón de Pánico), el orquestador ejecuta tres pasos verificables:

Muerte del proceso: kill -9 al hipervisor/contenedor de esa sesión.

Destrucción criptográfica (Crypto-Shredding): La carpeta temporal de la sesión vive sobre un bloque en memoria RAM cifrado con una clave efímera generada al abrir la sesión (dm-crypt en RAM con clave aleatoria de 256 bits que nunca toca el disco). Al sobrescribir con ceros esos 32 bytes de clave en memoria y desmontar el volumen tmpfs, toda la memoria de la sesión se vuelve matemáticamente irrecuperable en menos de 5 milisegundos.

Aprovisionamiento limpio: Se entrega al cliente una máquina virtual nueva recién salida del pool limpio.

3. El «Botón de Pánico» del cliente (Qué hace, qué muestra y qué conserva sin guardar su navegación)

Dónde está: Siempre visible en la esquina superior derecha de la barra de cristal de ZERO, con el icono de un escudo de cierre rápido: [ SELLAR Y DESTRUIR ] (atajo de teclado: pulsar dos veces seguidas la tecla Esc o Ctrl + Espacio).

Qué hace al pulsarlo: Ejecuta en el acto los Niveles 3 y 4 (corta la red de la máquina virtual en 10 ms, destruye la máquina, borra la llave de memoria RAM y limpia el lienzo de la pantalla del cliente).

Qué se conserva para que el cliente lo entienda SIN guardar su navegación:

En el servidor de GUARDIANA no se guarda nada (ni la URL que estaba viendo, ni lo que escribió).

Solo para los ojos del cliente (enviado por el WebSocket al navegador de su PC un instante antes de destruir la máquina y guardado únicamente en la memoria temporal de su pantalla hasta que él la cierre), se muestra una Ficha Forense de Cierre:

SESIÓN SELLADA Y DESTRUIDA (#94812)

Motivo: Activado por ti [o: Cierre automático de seguridad — Esta página intentó ejecutar un comando no permitido en el navegador].

Qué hemos hecho: Hemos cortado internet a la máquina virtual en 8 milisegundos y hemos destruido su memoria RAM (0 bytes conservados).

Estado de tu ordenador: Intacto. El código de la página nunca llegó a tu equipo; todo ocurrió en la celda desechable de nuestros servidores.

Resumen de la amenaza bloqueada: Intento de conexión hacia [País] bloqueado · 1 archivo retenido y destruido.
[ Estrenar máquina limpia ahora ] · [ Descargar este recibo en PDF ]

PLANO 2: Blindar a la propia GUARDIANA (Web, Infraestructura de ZERO y Equipo)
1. Por qué el ataque a páginas PHP de esta semana no puede ocurrir en la web de GUARDIANA (y qué sí debemos corregir hoy)

La ventaja actual: Los ataques masivos a páginas web con PHP (como inyecciones en WordPress, subida de webshells .php o fallos de ejecución remota en PHP-CGI) ocurren porque el servidor web ejecuta código dinámico en cada visita. Como la web actual de GUARDIANA es 100% estática (archivos HTML, CSS y JS puros sin PHP ni base de datos), es físicamente inmune a cualquier ataque contra PHP: no hay intérprete PHP que engañar.

El punto débil actual que hay que corregir esta misma semana: Al estar alojada en GitHub Pages, GitHub no permite configurar cabeceras HTTP de seguridad estrictas (Content-Security-Policy, Permissions-Policy, X-Frame-Options personalizados).

Solución en 48 horas: Poner delante o migrar los archivos estáticos a un servidor estático endurecido (por ejemplo, Caddy o Nginx en un servidor de solo lectura con sistema de archivos inmutable, o un borde estático con reglas de cabeceras firmadas) donde controlamos el 100% de las cabeceras de respuesta.

2. Endurecimiento total de la web de GUARDIANA (Lista de control técnica)

Cabecera Content-Security-Policy (CSP) de cerrojo total:

default-src 'none'; script-src 'self' 'sha256-...'; style-src 'self' 'sha256-...'; img-src 'self' data:; font-src 'self'; connect-src 'self' wss://zero.guardianagroup.com; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests;

Qué logra: Incluso si alguien descubriera un fallo para inyectar código HTML en la página, el navegador del visitante se negará a ejecutar cualquier script que no lleve la huella criptográfica (sha256) exacta aprobada por GUARDIANA y se negará a enviar datos a cualquier servidor externo.

Cero recursos de terceros y Subresource Integrity (SRI):

Prohibido cargar fuentes de Google Fonts, iconos de CDNs externas o scripts de analítica. Todo vive dentro del dominio de GUARDIANA y cada etiqueta <script> y <link> lleva su atributo integrity="sha384-...".

Cabeceras de aislamiento de navegador del cliente:

Strict-Transport-Security: max-age=63072000; includeSubDomains; preload (HSTS).

Cross-Origin-Opener-Policy: same-origin y Cross-Origin-Embedder-Policy: require-corp (aísla la pestaña de GUARDIANA en un proceso exclusivo dentro del ordenador del cliente para que otras pestañas que tenga abiertas en su PC no puedan medirla).

Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=(), payment=() (apaga por orden del servidor cualquier permiso innecesario).

Blindaje del dominio (DNSSEC + CAA):

Activar DNSSEC en el registrador de guardianagroup.com (impide que un proveedor de internet falsifique la dirección IP de GUARDIANA) y publicar un registro DNS CAA que autorice únicamente a nuestra entidad emisora a crear certificados TLS para nuestro dominio.

3. Detección continua de ataques y espionaje contra nuestros servidores y equipo

Señuelos y Canarios en nuestra infraestructura (Honeypots internos):

En la web pública se colocan rutas trampa invisibles para personas pero buscadas por atacantes (/wp-login.php, /.env, /admin/config.php, /api/v1/debug). El primer paquete IP que toque cualquiera de esas rutas queda bloqueado automáticamente en el firewall de borde (nftables / CrowdSec, licencia MIT) durante 30 días y envía una alerta al equipo.

En los servidores de ZERO y en el repositorio de código se colocan llaves canario (archivos que parecen credenciales de servidor pero no tienen permisos reales y avisan en menos de 1 segundo si alguien intenta usarlas desde cualquier lugar del mundo, usando arquitectura Canarytokens, licencia BSD-3-Clause).

Servidores de solo lectura y Atestación de integridad:

Los servidores que ejecutan las microVMs de ZERO arrancan con un sistema operativo de raíz en solo lectura (read-only rootfs con dm-verity). Si un atacante lograra entrar y quisiera instalar un programa espía en el servidor, no puede escribir en el disco del sistema, y cualquier cambio en los bytes del sistema detiene el servidor al instante.

Registros de seguridad con sellado criptográfico hacia delante (Forward Secure Sealing):

Los registros de salud de los servidores (nunca de lo que navegan los clientes, sino de quién entra por SSH o despliega código) se guardan con systemd-journald --setup-keys (FSS, licencia LGPL-2.1). Cada minuto el registro se sella criptográficamente: si un intruso entrara al servidor e intentara borrar la línea del registro donde se ve que entró, la cadena criptográfica se rompe y delata la manipulación.

Cuentas del equipo blindadas:

Prohibidas las contraseñas por SMS o correo para el equipo técnico: acceso a servidores y a GitHub obligatorio con llave física FIDO2 / Passkey y firma criptográfica de cada cambio de código (git commit -S con clave Ed25519).

4. Cómo responder si atacan a GUARDIANA (Sellar, Revocar y Reconstruir desde cero)

Protocolo de «Tierra Quemada» en 1 comando: Como ningún servidor de ZERO guarda datos de sesiones pasadas en su disco duro, si un servidor muestra cualquier anomalía en los sensores Falco/Tetragon o en los canarios:

Sellar: El balanceador desconecta ese servidor del tráfico público y corta su salida a internet.

Revocar: Se invalidan automáticamente los certificados internos de ese nodo.

Reconstruir desde cero: Se destruye el servidor entero por API del proveedor de infraestructura y se levanta uno nuevo limpio desde la imagen base firmada en menos de 3 minutos.

5. Qué puede verificar el propio cliente para fiarse de nosotros

Publicar en [guardianagroup.com/verificacion.txt](https://guardianagroup.com/verificacion.txt) (y mostrar en un clic dentro de El Núcleo) el Manifiesto de Integridad Firmado de la versión actual de la web: la huella SHA-256 exacta del código que está corriendo en su pantalla, la fecha de compilación y el enlace directo a nuestro código abierto auditable (bajo licencia AGPL-3.0/GPL-3.0). El propio navegador del cliente comprueba automáticamente al abrir la página que el código que ha recibido coincide bit a bit con el manifiesto público firmado.

6. Qué es realista en semanas vs. qué requiere más tiempo, y la frase honesta

En 1 a 3 semanas (Equipo pequeño):

Poner todas las cabeceras de seguridad (CSP, SRI, HSTS, COOP/COEP), DNSSEC y CAA en guardianagroup.com.

Activar los niveles 1, 3 y 4 en ZERO (corte de petición, sellado de red, destrucción de contenedor en RAM) y el Botón de Pánico con recibo limpio en pantalla.

Colocar los señuelos web (/.env, /wp-admin) + llave canario de alerta inmediata y chequeo de descargas con YARA/URLhaus.

En 2 a 3 meses (Segunda fase):

Sensores de kernel eBPF completos (Falco/Tetragon) con reglas afinadas para cada syscall, servidores con raíz dm-verity firmada en hardware (TPM) y compilaciones reproducibles verificadas por terceros.

La frase honesta para el cliente:

«Ningún sistema del mundo es invulnerable, por eso en ZERO no confiamos en que los ataques no existan: hacemos que la web se ejecute lejos de tu ordenador, vigilamos la celda en tiempo real y, ante cualquier anomalía o cuando tú pulses el botón de pánico, sellamos la conexión y destruimos la máquina virtual en milisegundos sin que nada llegue a tu equipo.»

I) LA SUBASTA DE ANUNCIOS, AL MÁXIMO DETALLE
1. Cómo capturar de verdad cada subasta desde nuestro Chromium y con qué certeza

Como la página web se ejecuta dentro del Chromium que controla ZERO en nuestro servidor, podemos hacer algo que ninguna extensión de navegador hace: escuchar la sala de máquinas de la subasta desde dentro de la memoria de la página (window) y desde los cables de red (CDP Network) al mismo tiempo.

Inyectamos mediante Page.addScriptToEvaluateOnNewDocument un colector invisible antes de que cargue la web que escucha las cinco fuentes reales de la subasta publicitaria:

[Web abierta en ZERO]
   ├── 1. Prebid.js (window.pbjs) ─────────► Captura todos los pujadores, cada puja en $$, tiempos (ms), tamaños y ganador.
   ├── 2. Google Publisher Tag (googletag) ► Captura ID de anunciante, campaña, línea de pedido y si fue subasta abierta (isBackfill).
   ├── 3. Amazon TAM / UAM (apstag) ───────► Captura las peticiones a c.amazon-adsystem.com/e/dtb/bid y sus huecos.
   ├── 4. Red OpenRTB (CDP Network POST) ──► Lee el JSON que sale a Rubicon, Criteo, OpenX, PubMatic e Index Exchange.
   └── 5. Cadena de Identidad (TCF + sellers.json + ads.txt) ► Traduce los números crípticos al nombre legal y país de cada empresa.

Tabla técnica de lo que capturamos y el grado exacto de certeza de cada dato
Dato de la subasta	De dónde lo extrae ZERO exactamente	Grado de certeza	Por qué tiene ese grado de certeza
Duración exacta de la subasta (en milisegundos)	Diferencia entre auctionInit.timestamp y auctionEnd.timestamp en window.pbjs, y propiedad timeToRespond de cada pujador.	Comprobado	Medido directamente por el reloj del navegador en la máquina de ZERO.
Lista de empresas que entraron en la puja (participantes)	Array bidderRequests de Prebid.js + peticiones de red salientes a endpoints RTB + decodificación de IDs con sellers.json y la lista oficial IAB TCF Global Vendor List.	Comprobado	Queda registrado cada servidor y cada empresa convocada a pujar en esa carga de página.
Todas las pujas individuales y la puja ganadora (en Prebid / Header Bidding)	Llamadas a pbjs.getBidResponses() y pbjs.getAllWinningBids(). Extrae bidderCode, cpm (ej. 1.85), currency (USD/EUR), size (300x250) y adomain (dominio de la marca que compra el anuncio).	Comprobado (declarado en la puja)	Es el importe exacto que el servidor del pujador ofrece en el código de la página para ganar el hueco. (Se aclara al cliente que es el precio de puja declarado por cada 1.000 impresiones, no una factura bancaria).
Ganador final del hueco cuando decide el servidor de Google (Google Ad Manager / GPT)	Evento googletag.pubads().addEventListener('slotRenderEnded', e => ...). Extrae advertiserId, campaignId, lineItemId, sourceAgnosticCreativeId y el booleano isBackfill (true = subasta abierta en tiempo real; false = campaña contratada).	Comprobado (quién ganó y tipo de venta) / Oculto en servidor (el precio interno si gana Google AdX)	Si gana un pujador de Prebid, sabemos el precio exacto; si en el último milisegundo gana la subasta interna cerrada de los servidores de Google (AdX), Google no envía el precio en texto claro al navegador, por lo que ZERO dice con honestidad: «Adjudicado en subasta interna de Google (precio cerrado en su servidor)».
Qué datos del usuario se ofrecieron en la papeleta de la subasta	Inspección del cuerpo JSON (postData) en las peticiones HTTP POST de OpenRTB (user.ext.eids, device.w/h, device.ua, site.page, site.cat, regs.ext.gdpr_consent, coordenadas geo).	Comprobado	ZERO tiene en su memoria el paquete exacto de bytes que los scripts de la página intentaron enviar a los pujadores.
Quién es el intermediario real y en qué país está su sede	Cruce del archivo público /ads.txt de la web visitada + archivo público sellers.json de la plataforma publicitaria (estándar IAB Tech Lab, uso público) + vendor-list.json de IAB Europe + Wikidata (CC0).	Comprobado (sede legal de la empresa) / Estimado (país físico del servidor receptor por IP)	Permite distinguir si quien vende tu hueco es el periódico directamente (DIRECT) o un revendedor externo (RESELLER), con su razón social y país real.
2. Qué se muestra al cliente en la pestaña «Subasta» y con qué frases honestas

En el panel derecho de 300 px de ZERO, al pulsar la pestaña «Subasta», el cliente ve una radiografía clara y ordenada de lo que acaba de ocurrir en esa página:

Cabecera de la Subasta:

Tiempo total: 184 milisegundos · Huecos subastados en esta página: 4 espacios de anuncio · Empresas en la puja: 14 empresas en 5 países.

Tarjeta del Ganador y las Pujas (por cada hueco):

Ganador del hueco superior (728x90): Criteo S.A. (Sede: Francia 🇫🇷 · respondió en 112 ms).

Puja ganadora declarada: $2,40 USD CPM (equivalente a $0,0024 USD por mostrar este anuncio una vez en tu pantalla).

Marca anunciante detectada (adomain): booking.com (Comprobado en la respuesta de puja).

Otras empresas que pujaron y perdieron en este mismo hueco:

2º Magnite / Rubicon Project (EE. UU. 🇺🇸): pujó $1,95 USD CPM (140 ms).

3º Index Exchange (Canadá 🇨🇦): pujó $1,40 USD CPM (98 ms).

4º PubMatic (EE. UU. 🇺🇸): pujó $0,85 USD CPM (165 ms).

5º OpenX (EE. UU. 🇺🇸): Sin oferta (No-Bid en 179 ms).

Qué datos iban dentro de la papeleta de subasta (Lo que se vendía):

Una lista clara con iconos de verificación:

«Dirección exacta del artículo que estás leyendo (Comprobado)».

«Tamaño de pantalla, idioma y modelo de sistema operativo (Engañado por ZERO: vieron nuestro servidor clónico, no tu PC)».

«3 identificadores de rastreo entre webs (ID5, SharedID, CriteoID) (Neutralizados por ZERO: sin historial previo)».

«Cadena de permisos TCF con 142 empresas reclamando "interés legítimo" (Comprobado)».

Frase honesta obligatoria al pie de la pestaña:

«Importes extraídos en directo de las respuestas técnicas de los pujadores en esta página. El precio indica la oferta bruta declarada en la subasta (en dólares/euros por cada 1.000 visualizaciones), no una factura final. En ZERO los pujadores solo han visto los datos clónicos de nuestra celda aislada y la carga final del anuncio ha sido cortada.»

3. El gran dilema y la solución: El «Modo Observatorio» (La Subasta en Jaula de Cristal)

El dilema técnico real: Si ZERO corta de raíz el dominio prebid.js o securepubads.g.doubleclick.net antes de que se descargue (como hace un bloqueador tradicional), la subasta nunca llega a celebrarse y la pestaña «Subasta» solo podría mostrar: «Subasta bloqueada antes de empezar (0 datos de pujas)».

La solución exclusiva de ZERO: «Subasta en Celda Fantasma» (Modo Observatorio):

Como el navegador corre en un contenedor aislado en la nube sin ninguna cookie personal del cliente, sin su IP doméstica y con la huella clónica idéntica de ZERO, dejamos que el script de subasta (Prebid.js / OpenRTB) haga su pregunta de precios durante esos 200 milisegundos usando la identidad vacía del contenedor fantasma.

Nuestro sensor lee todas las ofertas, precios, empresas participantes y ganadores cuando vuelven al navegador.

En el instante exacto en que termina la puja (auctionEnd), ZERO corta la entrega visual del anuncio, bloquea los píxeles de confirmación (bidWon / píxeles de seguimiento) y limpia el hueco de la página.

Además, el cliente tiene un interruptor arriba en la pestaña «Subasta» con dos posiciones claras:

[ Cortar antes de empezar ]: Bloquea los scripts en el milisegundo cero (máxima velocidad; no hay puja).

[ Radiografiar la puja en celda fantasma ]: Deja que pujen por el navegador fantasma sin tus datos, te enseña quién pujó y cuánto ofreció, y corta el anuncio al final.

Qué fuga supone dejar correr la puja en la celda fantasma (Transparencia total):

Qué NO se fuga jamás: Ni la IP del cliente, ni su ubicación real, ni el modelo de su ordenador, ni sus cookies de otras webs, ni su identidad.

Qué SÍ ven los pujadores en ese segundo: Ven que algún usuario conectado desde la dirección IP del servidor de GUARDIANA acaba de abrir ese artículo del periódico en un navegador Linux genérico sin historial previo. Es decir: saben que alguien en ZERO leyó esa noticia, pero no pueden saber quién eres ni relacionarlo con ninguna otra página que visites.

4. Qué hacen hoy Brave, DuckDuckGo y Tor con esto

Brave y DuckDuckGo: Bloquean la descarga de los scripts publicitarios por lista (EasyList). Como matan el script antes de que se ejecute, no pueden leer window.pbjs ni las respuestas OpenRTB: el usuario solo ve un número frío de «anuncios bloqueados» y jamás sabe quién pujaba por él, desde qué países ni cuánto dinero se ofrecía.

Tor Browser: No incluye un bloqueador de anuncios por defecto (confía en el aislamiento de estado y en NoScript según el nivel de seguridad). Tampoco lee ni muestra jamás los datos de la subasta.

Resultado: Ningún navegador del mercado actual muestra en vivo la subasta publicitaria traducida al ciudadano.

5. Dificultad y orden de construcción

Semana 1 (Dificultad Baja): Captura en vivo de window.pbjs (Prebid.js) y window.googletag (Google Publisher Tag) mediante script inyectado en CDP + cruce con la lista pública vendor-list.json de IAB TCF y ads.txt. (Cubre de golpe más del 75% de los periódicos y grandes portales del mundo).

Semana 2 (Dificultad Media): Decodificación de peticiones de red OpenRTB (POST JSON) + cruce con los archivos públicos sellers.json y Wikidata para mostrar la razón social y el país de cada intermediario.

Semana 3 (Dificultad Media): Implementación del interruptor «Cortar antes de empezar / Radiografiar en celda fantasma» con corte quirúrgico del renderizado final del anuncio.

J) VIGILAR A LA IA CON ARCHIVOS TRAMPA (LOS SEÑUELOS DEL NÚCLEO)
1. Arquitectura de los 4 Señuelos («Trampas de Cristal» para vigilar a la IA)

Cuando una persona utiliza desde ZERO una inteligencia artificial externa (ChatGPT, Claude, Gemini, Perplexity, Copilot) o un agente de IA (esos sistemas nuevos que navegan por páginas, leen carpetas o ejecutan tareas por ti), El Núcleo despliega automáticamente a su alrededor cuatro tipos de señuelos invisibles para el usuario pero irresistibles para un sistema que intente curiosear fuera de su tarea:

┌─────────────────────────────────────────────────────────────────────────────┐
│                   CELDA DE ZERO VIGILADA POR EL NÚCLEO                      │
│                                                                             │
│  [1. Archivos Trampa]   Carpeta /Documentos con "Claves_Reserva_2026.pdf"   │
│  (Vigilados en kernel   Si el proceso de la IA lo abre sin clic del         │
│   con Linux fanotify)   usuario ──► ALERTA COMPROBADA EN 1 MILISEGUNDO.     │
│                                                                             │
│  [2. Trampa de Pestaña  Portapapeles y pestañas ocultas con código único    │
│   y Portapapeles]       `ZERO-CLIP-8841`. Si un script lo lee sin que tú    │
│                         pulses "Pegar" ──► ALERTA COMPROBADA.               │
│                                                                             │
│  [3. Enlace Canario]    URL única: https://cnry.guardianagroup.com/s/99f1   │
│                         Si el servidor de la IA entra a ese enlace por      │
│                         detrás ──► CAZADO CON SU IP Y HORA EXACTA.          │
│                                                                             │
│  [4. Huella de Agua]    Código único de sesión en datos sustituidos.        │
│                         Si reaparece en otra red o respuesta ──► DETECTADO. │
└─────────────────────────────────────────────────────────────────────────────┘

Señuelo 1: Archivos Trampa en la carpeta de la sesión (Honeyfiles vigilados por el kernel de Linux)

Cómo funciona: En el sistema de archivos virtual de la máquina de ZERO (/home/zero/Documentos y /Descargas) se colocan automáticamente 3 archivos trampa que el usuario no ve ni tiene por qué tocar (por ejemplo: Credenciales_Internas_Backup.pdf, Extracto_Privado_2026.xlsx, Notas_Confidenciales.txt). Dentro llevan un código único de esa sesión (ZERO-FILE-CNRY-[ID]).

Cómo se detecta: Un vigilante en el kernel de Linux fuera del navegador (fanotify / inotify o Falco) observa exclusivamente esos 3 archivos. Si una página web, una extensión o un agente de IA intenta abrir o leer uno de esos archivos sin que el usuario lo haya seleccionado, salta la alarma en el acto y el kernel bloquea la lectura antes de entregar el contenido.

Señuelo 2: Trampa de Portapapeles, Almacenamiento y Pestañas Vecinas

Cómo funciona: Mientras el usuario no haya copiado nada propio, el portapapeles de la celda contiene un texto trampa invisible y el almacenamiento local (localStorage / campos ocultos autocompletables del navegador) contiene una ficha señuelo.

Cómo se detecta: Si el código de la página de la IA llama a navigator.clipboard.readText() o intenta leer campos de formulario ocultos sin que el usuario haya pulsado Ctrl+V o el botón «Pegar», el interceptor CDP de ZERO registra la lectura no autorizada, no le entrega ningún dato real y avisa al cliente en el panel derecho.

Señuelo 3: Enlaces Trampa de Uso Único (Canary URLs para cazar robots de IA por detrás)

Cómo funciona: Muchas inteligencias artificiales actuales (cuando les das un documento o un enlace, o cuando actúan como agentes) envían sus propios robots desde sus centros de datos en Estados Unidos o Europa para descargar y leer enlaces que encuentran dentro de tus textos sin avisarte. ZERO incluye dentro de los archivos trampa (o como enlace señuelo oculto en un documento de prueba) una dirección web única para esa sesión: [https://sello.guardianagroup.com/v/](https://sello.guardianagroup.com/v/)[token-unico-de-sesion].

Cómo se detecta: Ninguna persona humana conoce ni pulsa jamás ese enlace. Si el servidor de GUARDIANA recibe una visita a esa dirección, queda demostrado al 100% que la inteligencia artificial ha sacado ese enlace de la conversación y ha mandado un servidor externo a abrirlo. Además, nuestro servidor registra al instante la dirección IP exacta, la empresa propietaria del centro de datos (por ejemplo, OpenAI, Anthropic, Microsoft o Google), el país y el segundo exacto en que entró.

Señuelo 4: Datos Marcados por Sesión (Watermarking y trazadores sintéticos)

Cómo funciona: Cuando la Cámara IA (Bloque F) sustituye datos personales por códigos o cuando el usuario sube una tabla grande de trabajo para que la IA la resuma, ZERO puede insertar (si el usuario activa el modo de auditoría) una línea testigo inofensiva o una marca invisible de caracteres Unicode de ancho cero (\u200B, \u200C) que codifica el número de sesión.

Cómo se detecta: El inspector de red CDP (Network.requestWillBeSent y WebSocketFrameSent) y el observador de respuestas analizan cada paquete que sale de la página de la IA hacia dominios secundarios. Si ese dato marcado intenta viajar hacia un servidor de terceros distinto al chat principal o reaparece donde no debe, queda registrado con prueba exacta.

2. Qué se puede afirmar con certeza y qué NO
Lo que SÍ podemos afirmar al 100% (Comprobado)	Lo que NO podemos afirmar nunca (y no debemos prometer)

1. «Esta página o agente de IA ha intentado leer tu portapapeles sin que tú pulsaras pegar.»

2. «El agente de IA ha intentado abrir el archivo trampa [Nombre] que no formaba parte de tu encargo.»

3. «Los servidores de [Empresa de IA] en [País] han accedido por su cuenta al enlace trampa incluido en el archivo a las 23:42:10.»

4. «La web de la IA ha intentado enviar el texto de tu consulta a un servidor secundario de [Empresa tercera].»

	

❌ No podemos afirmar que el proveedor haya metido tu texto en el entrenamiento de su futuro modelo (porque el entrenamiento de modelos ocurre meses después dentro de superordenadores cerrados a los que ningún navegador tiene acceso).

❌ No podemos saber qué hace el proveedor de IA con un texto una vez que tú decides enviárselo sin filtro a su servidor principal (salvo que ese servidor visite uno de nuestros enlaces trampa).

3. Cómo se le cuenta al cliente sin alarmismo (Frases exactas en español)

Cuando salta un señuelo, El Núcleo lo muestra en el panel derecho de 300 px y sobre la Cámara IA con serenidad y precisión:

Si la IA o su web intenta leer el portapapeles sin permiso:

🟡 «Aviso del Núcleo: la página de [Nombre de la IA] ha intentado leer el contenido de tu portapapeles sin que tú hayas pulsado pegar. Ha topado con nuestro señuelo de seguridad y no ha visto ningún dato tuyo.»

Si un agente de IA intenta abrir un archivo trampa que no le pediste:

🔴 «Acción detenida: el agente de [Nombre de la IA] ha intentado abrir por su cuenta el archivo de control "[Nombre]" que no formaba parte de tu tarea. El Núcleo le ha bloqueado el paso.»

Si los servidores de la IA visitan un enlace trampa por detrás:

🟡 «Comprobado por enlace señuelo: tras recibir tu mensaje, un servidor externo de [Empresa / País] ha intentado abrir por su cuenta un enlace interno de control a las [Hora]. Esto confirma que esta IA envía robots propios a explorar los enlaces que encuentra en tus textos.»

4. Cómo evitar los Falsos Positivos (La «Puerta del Gesto Humano»)

El mayor peligro de un sistema de archivos trampa es asustar al cliente por error si fue el propio cliente quien adjuntó todos los archivos de una carpeta o pulsó «Pegar». ZERO elimina los falsos positivos con tres reglas técnicas estrictas:

Los archivos trampa son invisibles en el selector del usuario: Cuando el cliente abre la ventana para subir un archivo suyo a la IA, la interfaz de ZERO filtra y oculta los 3 archivos trampa de su vista. Como el cliente humano no los ve en su lista, el cliente nunca puede seleccionarlos por accidente; solo un proceso automático o un agente que escanee la carpeta por código tropezará con ellos.

La «Puerta del Gesto Humano» (Trusted User Gesture Gate): Como en ZERO cada clic de ratón y cada tecla (Ctrl+V) pasan primero por nuestro servidor antes de llegar al navegador, sabemos con certeza absoluta si el usuario acaba de pulsar «Pegar» en los últimos 500 milisegundos.

Si el usuario pulsó Ctrl+V hace 100 ms y la web lee el portapapeles → Es legítimo (ZERO entrega el texto real del usuario y no salta ninguna alerta).

Si el usuario no ha tocado el teclado ni el menú contextual y la web lee el portapapeles por su cuenta → Es lectura furtiva comprobada (ZERO entrega el señuelo y muestra el aviso).

Los enlaces trampa tienen prohibida la entrada de buscadores públicos (robots.txt + token de sesión de 128 bits): Así ningún buscador general de internet puede entrar por casualidad en un enlace trampa; solo puede entrar quien haya leído el interior de esa sesión privada.

5. Dificultad y orden de implementación

Paso 1 — Trampa de Portapapeles y Almacenamiento en CDP (Dificultad Baja · 3 días): Interceptar navigator.clipboard.readText() cruzado con el reloj de eventos de teclado/ratón del servidor (Input.dispatchKeyEvent). Cero falsos positivos y funciona desde el primer día en todas las webs de IA.

Paso 2 — Enlaces Canario de Sesión Única (Dificultad Baja · 4 días): Un microservicio ligero en Go/Node de 100 líneas en guardianagroup.com que genera URLs únicas por sesión y, cuando recibe una petición HTTP, consulta el país/empresa de la IP en la base local RIR/Wikidata y empuja el aviso en vivo por WebSocket al panel derecho de ZERO.

Paso 3 — Archivos Trampa en el contenedor con fanotify (Dificultad Media · 1–2 semanas): Colocar los documentos señuelo en el directorio del contenedor de ZERO y conectar el vigilante de eventos de archivo de Linux al hilo cronológico del Núcleo, necesario cuando el usuario utilice agentes de navegación o subida de carpetas completas.

Gemini es una IA y puede cometer errores.
