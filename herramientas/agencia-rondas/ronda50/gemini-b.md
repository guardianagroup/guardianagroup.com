# Gemini (chat «Arquitectura de ZERO: Google sin Captcha») — ronda 50b, E–K. Copia del texto de la página (las fichas de fuente aparecen como «Nombre + 1»). Ojo: trae cifras y nombres sin fuente comprobable (precios de Grounding y de Hetzner, «gemini-3.8-flash», licencia de CrUX, tamaños de índice, rDNS «zero-relay»): no usar sin verificar.

El aislamiento en servidor combinado con canales oficiales de búsqueda y avisos transparentes permite cumplir las decisiones del dueño sin romper vuestros límites éticos ni pagar servidores gigantescos.

## E. Capar Tor en ULTRA y bloqueo de contenido ilegal o peligroso

Hechos comprobables

Filtro en el proxy SOCKS delante de Tor: Filtrar en vuestro propio proxy SOCKS5 (exigiendo SOCKS5h, donde Chromium envía el nombre de dominio en texto al proxy local y no una IP resuelta) es la forma correcta de bloquear todo *.onion salvo vuestra lista blanca.

Fugas que debéis cerrar en el Chromium de la celda:
- UDP / QUIC y WebRTC: SOCKS5 de Tor solo transporta flujos TCP (CONNECT). Si Chromium intenta abrir QUIC (HTTP/3 sobre UDP) o STUN/TURN de WebRTC, el tráfico saldrá directo por la interfaz de red de Hetzner saltándose Tor. Hay que arrancar Chromium con --disable-quic, --webrtc-ip-handling-policy=disable_non_proxied_udp y --force-webrtc-ip-handling-policy, además de reglas de cortafuegos (nftables/iptables) para el usuario Linux de la celda que bloqueen cualquier salida que no vaya al puerto local de vuestro SOCKS.
- Fugas de DNS y pre-resolución: Pasar --host-resolver-rules="MAP * ~NOTFOUND , EXCLUDE 127.0.0.1" junto con --proxy-server="socks5://127.0.0.1:PUERTO" obliga a Chromium a no resolver jamás DNS por su cuenta.

Listas legítimas para empresas (condiciones reales):
- Abuso sexual infantil (CSAM): La IWF (Internet Watch Foundation, Reino Unido) y Project Arachnid (C3P, Canadá) ofrecen listas de URLs y hashes, pero exigen membresía o acuerdo formal verificando que sois proveedor de servicios de internet/tecnología. Alternativa inmediata y gratuita en infraestructura: usar como upstream de resolución en vuestro filtro Cloudflare for Families (1.1.1.3) o Quad9 (9.9.9.9), que bloquean dominios de malware y CSAM/adultos en la capa DNS.
- Malware: URLhaus (abuse.ch) publica volcados CSV/JSON y zonas DNS RPZ actualizados cada 5 minutos; requiere crear cuenta para obtener Auth-Key y dispone de licencia/API comercial a través de abuse.ch. [URLhaus - Abuse.ch + 1]
- Phishing y Malware comercial: Google Web Risk API es la versión comercial de Safe Browsing (autorizada para uso empresarial; la API de Safe Browsing normal prohíbe el uso comercial). OpenPhish exige licencia de pago para uso comercial; PhishTank permite descarga con clave gratuita, aunque con menor frecuencia de actualización.

Opinión (Diseño y texto en pantalla)

El filtro debe actuar en vuestro proxy SOCKS local combinando la lista RPZ de URLhaus, Google Web Risk (o 1.1.1.3) y el bloqueo de .onion. [URLhaus - Abuse.ch]

Texto honesto para el cliente: «ULTRA enruta tu navegación web por la red Tor para proteger tu privacidad frente a las páginas que visitas. Por ley y ética de GUARDIANA, el acceso a servicios ocultos (.onion no verificados), abuso infantil, distribución de malware y estafas conocidas está bloqueado en nuestro nodo de salida.»

## F. Webs que rechazan la IP del servidor o de Tor (ej. prensa española)

Hechos comprobables

Grupos editoriales y muros como Akamai, DataDome o Cloudflare bloquean rangos completos de centros de datos (AS24940 de Hetzner) y nodos de salida de Tor. Sin proxies residenciales ni técnicas de engaño (stealth), ningún ajuste del navegador remoto evitará ese bloqueo si el editor ha decidido rechazar todo el ASN del centro de datos.

Desplegar un segundo nodo en un proveedor menos saturado (un ISP de tránsito o cloud regional con menor historial de abuso que Hetzner) reduce el porcentaje de bloqueos, pero sigue catalogado como hosting.

Opinión (Recomendación y texto en pantalla)

No prometáis que la celda remota abre el 100 % de las webs que bloquean centros de datos. Combinad tres medidas honestas:
- Identificación pública del nodo: Configurar el DNS inverso (rDNS) de vuestra IP como zero-relay.guardianagroup.com, alojar en esa IP una página explicando qué es el aislamiento de navegador de GUARDIANA con un buzón abuse@guardianagroup.com y registrar vuestras IPs en los formularios de falsos positivos de Cloudflare y Akamai.
- Detección automática del bloqueo en puerta.js: Cuando la celda reciba un código 403, 418 o el texto conocido de bloqueo por red, mostrar una tarjeta limpia sobre el visor con dos botones:
  - Texto exacto: «Esta web bloquea las conexiones procedentes de centros de datos y redes de aislamiento como ZERO. No es un fallo de tu conexión.»
  - Botón 1: «Leer versión de archivo / caché limpia» (si existe en Internet Archive).
  - Botón 2: «Abrir fuera de ZERO (en mi navegador normal, sin aislamiento)» usando rel="noopener noreferrer".

## G. Celda sellada: verdades, riesgos residuales e indicadores en vivo

Hechos comprobables

Lo que sí es verdad: Como al navegador del cliente solo llegan tramas JPEG por WebSocket y eventos JSON de coordenadas, ningún código JavaScript, WebAssembly ni exploit de renderizado de la web visitada se ejecuta en la CPU o RAM del cliente.

Riesgos reales que sí quedan:
- Descargas llevadas al PC: Si el usuario descarga un ejecutable o PDF malicioso desde la celda a su ordenador y lo abre localmente, se infectará.
- Ingeniería social y phishing: Si la persona escribe su contraseña bancaria o semilla cripto en una web falsa dentro de la celda, el atacante la roba igual.
- Portapapeles e hipervínculos externos: Un script que intente inyectar comandos en el portapapeles (pastejacking) si tenéis sincronización automática de portapapeles sin limpiar.
- Escape en el servidor: Un fallo crítico en Chromium + kernel de Linux afectaría a vuestro servidor en Hetzner, no al PC del cliente.

Opinión (Acción automática y 6 indicadores verificables)

Acción defendible:
- Avisar (Ámbar): Ante petición de permisos sensibles (cámara, micrófono, portapapeles) o redirección sospechosa.
- Sellar (congelar teclado/ratón en la celda): Si se dispara una descarga no solicitada (drive-by download) o se toca un dominio de phishing/malware conocido.
- Destruir y emitir acta: Si uno de vuestros señuelos plantados (cookie, localStorage o token trampa) intenta salir en los parámetros o cuerpo de una petición hacia un servidor externo.

| Indicador | Texto exacto en pantalla | Normal (Verde) | Alerta (Ámbar / Coral + Acción) |
|---|---|---|---|
| 1. Canal de vídeo | Pantalla aislada: Solo recibes imagen (JPEG) · 0 scripts de la web en tu equipo | Flujo exclusivo de tramas de imagen por el socket. | Coral (Sellar): Intento de abrir protocolo externo (mailto:, tel:, esquema personalizado). |
| 2. Trampa de señuelos | Señuelos de intrusión: 4 plantados en la celda · Intactos | Ninguna petición saliente contiene la huella de los señuelos. | Coral (Destruir): Un script ha leído y enviado un señuelo fuera · Celda destruida. |
| 3. Aduana de archivos | Descargas: Retenidas en el servidor · Ningún archivo ha tocado tu disco | 0 descargas iniciadas por la página. | Ámbar (Sellar si fue sin clic): La web intentó descargar [nombre.ext] · Retenido en celda. |
| 4. Portapapeles | Portapapeles: Desconectado de la página (requiere tu permiso manual) | Sin acceso de lectura/escritura desde el DOM remoto. | Ámbar: La página intentó leer o sobrescribir tu portapapeles · Bloqueado. |
| 5. Red y reputación | Destinos verificados: N dominios consultados · 0 en listas de malware/phishing | Ningún dominio coincide con URLhaus o Web Risk. | Coral (Sellar): Petición a dominio catalogado como malicioso · Cortada. |
| 6. Memoria al cerrar | Rastro al salir: Contexto efímero en RAM · Borrado total al cerrar | Perfil temporal aislado en curso. | Verde confirmado al destruir: Contexto borrado · Comprobante SHA-256 emitido. |

## H. 7 ideas novedosas y honestas para ZERO (realizables por un equipo pequeño)

1. Visor de archivos en «Cámara de Plomo»: Al hacer clic en un PDF, Word o ZIP sospechoso, nunca se descarga al PC del usuario; se abre dentro de una segunda celda efímera sin acceso a internet para leerlo solo por imagen (elimina el riesgo de macros y exploits de visores).
2. Modo «Guante Blanco» para Phishing (Bloqueo de teclado en dominios nuevos): Si el dominio visitado tiene menos de 30 días de antigüedad (vía RDAP/WHOIS) o imita a un banco, ZERO bloquea la entrada de teclado en campos <input type="password"> hasta que la persona pulse conscientemente «Confío en este dominio».
3. Viaje en el tiempo de la sesión (Tira forense de 30 segundos): Como ya generáis fotogramas JPEG y registro de red, guardar los últimos 30 segundos en memoria de la celda permite al usuario rebobinar para ver exactamente qué redirección invisible o qué anuncio malicioso saltó antes de un bloqueo. [URLhaus - Abuse.ch]
4. Destripador de enlaces acortados antes de entrar: Al pegar un enlace (bit.ly, enlaces de correo o SMS), ZERO recorre la cadena de redirecciones sin cargar el HTML y enseña el árbol de saltos, país de destino y dueño de la red antes de renderizar la página.
5. Comparador de «Doble Mirada» (IP Directa vs. Tor): Un botón que toma una captura de cómo se ve una web o el precio de un vuelo/hotel desde Alemania frente a cómo se ve por otra ruta, destapando discriminación de precios o censura geográfica.
6. Extractor de texto limpio («Solo la letra»): Un botón que extrae el artículo en texto plano purificado desde el DOM de la celda y lo pasa al cliente, permitiendo copiar texto con garantía matemática de que no lleva caracteres ocultos ni código.
7. Recibo criptográfico de inspección web (Acta de visita): Un botón que genera un PDF/JSON firmado por GUARDIANA con la captura de pantalla, fecha exacta NTP, cadena de certificados TLS del sitio visitado y lista de rastreadores detectados (útil para denuncias de consumo o pruebas legales).

## I. Buscador propio de GUARDIANA («las webs más visitadas de cada país»)

Hechos comprobables

Licencias de listas de dominios más visitados:
- Cloudflare Radar: Sus listas y endpoints API tienen licencia CC BY-NC 4.0 (No Comercial). No podéis usarlas legalmente en un producto comercial sin permiso expreso de Cloudflare.
- Chrome UX Report (CrUX): Publicado por Google en BigQuery y API con segmentación por país (top 1.000, 10.000, etc.) bajo licencia abierta permisiva (Apache 2.0 en sus herramientas y datos públicos consultables). [Google for Developers]
- Tranco (tranco-list.eu) y Cisco Umbrella / Majestic Million: Listas agregadas gratuitas utilizables con atribución, aunque Tranco es global y no desglosa tráfico real por país como CrUX. [clapleads.com]

Cómo llenar el índice de forma legítima:
- Common Crawl: Vuelca miles de millones de páginas al mes en AWS S3 de forma abierta y gratuita. Podéis descargar solo los índices CDX/Columnar (Parquet) filtrando los 5.000 dominios principales de cada país (según CrUX) y extraer únicamente esos archivos WARC sin tener que rastrear la web vosotros mismos.
- RSS y Sitemaps propios: Para titulares del día, leer los sitemap-news.xml y canales RSS públicos de esos medios respetando siempre robots.txt y declarando un User-Agent: GuardianaSearchBot/1.0 (+https://guardianagroup.com/bot).

Qué pasa con las webs que bloquean rastreadores desconocidos: Muchos medios bloquean en robots.txt o por WAF a cualquier bot que no sea Googlebot o Bingbot. Para esas webs, vuestro rastreador propio no podrá entrar honestamente, aunque muchas sí aparecen en Common Crawl o publican sus titulares por RSS.

Opinión (Motor, tamaño, coste y comparación)
- Motor recomendado: Meilisearch o Tantivy / Quickwit (escritos en Rust, consumen una fracción de la RAM de OpenSearch).
- Tamaño, servidor y plazo de una V1: Indexar títulos, descripciones y primeros párrafos de 5 millones de páginas (p. ej. 1.000 páginas clave de las 5.000 webs más visitadas de España, Colombia y México) ocupa entre 15 y 30 GB en disco y corre con fluidez en un solo servidor Hetzner de 16–32 GB de RAM (menos de 40 EUR/mes). Un desarrollador puede montar el pipeline (CrUX + Common Crawl filtrado + RSS + Meilisearch) en 2 a 3 semanas.
- Qué resuelve bien y qué no: Resuelve muy bien búsquedas navegacionales («banco santander», «el tiempo bogotá», «boe», «wikipedia») y titulares recientes vía RSS. Resuelve mal preguntas largas específicas (long-tail), foros pequeños, errores técnicos de programación, mapas locales o páginas internas profundas.

Comparativa rápida:
- Motores abiertos (Stract, Marginalia, YaCy, Mwmbl): Stract (código abierto en Rust sobre Common Crawl) y Marginalia son excelentes referencias técnicas, pero están enfocados en blogs/web independiente en inglés.
- Metabuscadores (SearXNG): Raspan HTML de Google/Brave/Bing; chocan contra vuestros límites de no raspar ni sufrir bloqueos de IP.
- Índices por API (Brave Search API, Mojeek API): Tienen miles de millones de páginas ya indexadas y cobran por consulta (~3–5 USD / 1.000 búsquedas) sin gasto de servidores de indexación. [Scavio]

## J. Google sin ese captcha tan largo (Prioridad del dueño)

Hechos comprobables

Fin de la búsqueda web completa en CSE: Google retiró la opción de «Buscar en toda la web» para motores nuevos y cerrará definitivamente la Custom Search JSON API el 1 de enero de 2027. Los motores nuevos de Programmable Search Engine están limitados a dominios específicos. [Custom Search JSON API | Google for Developers]

¿Es legítimo usar el Programmable Search Element oficial de Google en la página de ZERO? Sí, con límites estrictos:
- El Search Element (cse.js) se ejecuta en el navegador real del usuario (con su IP doméstica), muestra anuncios de Google (por lo que es gratuito) y no pide reCAPTCHA.
- Restricción legal y técnica: Para motores nuevos solo permite buscar dentro de los hasta 50 dominios que defináis por motor. Además, los Términos de Servicio de Google prohíben modificar o raspar el bloque de resultados, aunque la API oficial del componente (linkTarget o callbacks de clic) permite capturar la URL clicada para abrirla en vuestra ventana/celda. Crear un motor por país o categoría (ej. «Prensa y Servicios de España - Top 50», «Colombia - Top 50») cumple las reglas siempre que no automatices ni ocultes los anuncios de Google.

Alternativas oficiales de Google hoy (octubre de 2026):
- Grounding with Google Search en Gemini API: Oficial y abierto a cualquier desarrollador. Incluye 5.000 búsquedas gratis al mes (compartidas en modelos Gemini 3 y 4) y luego cuesta 14 USD por cada 1.000 consultas. Devuelve una respuesta sintetizada más los enlaces web reales (url_citation) y sugerencias de búsqueda de Google. [Google Cloud]
- Vertex AI Search (Web Search para empresas): Requiere contrato y aprobación comercial con Google Cloud.

¿Qué reduce el reCAPTCHA de google.com dentro de la celda de forma honesta?
- Conservar la cookie de sesión en la celda: Si el usuario resuelve el reCAPTCHA una sola vez al abrir la celda, Google deposita una cookie de confianza (NID / AEC / token de verificación). Si mantenéis esa cookie viva mientras dure la sesión del usuario en esa misma IP fija de Hetzner y desactiváis la precarga de enlaces de Chromium (para no disparar peticiones fantasma en segundo plano), Google no vuelve a pedir captcha en las siguientes búsquedas de esa sesión.

Opinión (Orden recomendado para tener Google ya)
1. Para toda la web sin captcha: Integrar Brave Search API (1.000 gratis/mes, luego 5 USD / 1.000) o Gemini API con Google Search Grounding (5.000 gratis/mes, mostrando los enlaces citados de Google) en la barra superior de ZERO: cuando el usuario hace clic en un resultado, se abre en la celda.
2. Para portales principales gratis con el sello de Google: Poner pestañas con el Google Search Element oficial por país (los 50 dominios principales de España, Colombia, etc.) corriendo en el navegador del cliente y abriendo los clics en la celda.
3. Si el usuario entra a google.com dentro de la celda: Conservar las cookies NID/AEC durante toda su sesión para que, si resuelve un reto al principio, no tenga que repetirlo en cada búsqueda.

## K. Redes sociales e IAs (ChatGPT, Gemini, Claude) sin bloqueos ni captchas

Hechos comprobables
- El problema de las IAs (chatgpt.com, claude.ai) en la celda: OpenAI y Anthropic usan protección agresiva de Cloudflare Turnstile que penaliza simultáneamente AS24940 (Hetzner) y navigator.webdriver = true (Playwright), entrando en bucle infinito aunque un humano haga clic en la casilla.
- El riesgo grave de iniciar sesión en redes sociales (Instagram, X, Facebook, LinkedIn) desde la celda: Si un usuario en Colombia o España mete su usuario y contraseña de Instagram o Facebook desde la IP de un servidor de Hetzner en Núremberg (o desde Tor), los sistemas antifraude de Meta/X detectan un viaje imposible y una IP de centro de datos, lo que bloquea preventivamente la cuenta del usuario exigiéndole verificación por SMS, selfie de vídeo o cambiándole la contraseña.

Opinión (Qué es viable y honesto hacer)
- Para las IAs (ChatGPT, Gemini, Claude) — Interfaz propia por API oficial dentro de ZERO: En lugar de cargar chatgpt.com dentro del navegador remoto, poned una pestaña nativa «IA Privada en ZERO» conectada a las APIs oficiales de OpenAI, Google Gemini y Anthropic (con modelos rápidos y económicos como gemini-3.8-flash o gpt-4o-mini). Ventajas: Cero Cloudflare, cero captchas, respuesta instantánea en texto, y OpenAI/Google/Anthropic solo ven la clave API corporativa de GUARDIANA, nunca la IP ni la cuenta personal del usuario.
- Para las Redes Sociales:
  - Consultas públicas sin cuenta: Permitir ver perfiles o publicaciones públicas en la celda, o a través de vuestro buscador.
  - Inicio de sesión con cuenta personal: Mostrar un aviso honesto antes de que escriban su contraseña en la celda: «Aviso de protección de tu cuenta: Estás navegando desde un servidor aislado en Alemania. Si inicias sesión con tu cuenta personal en redes sociales o bancos desde aquí, esa plataforma verá una conexión desde otro país en un centro de datos y podría bloquear tu cuenta por precaución. Para entrar en tus cuentas personales, te recomendamos abrirlas en tu navegador habitual.»
