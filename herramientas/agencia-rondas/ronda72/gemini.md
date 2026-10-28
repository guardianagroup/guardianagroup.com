# Ronda 72 · Gemini (Argon, nivel de razonamiento «Alto») · 28 Oct 2026, 11:33–11:40

Conversación «GUARDIANA ZERO: Análisis y Pruebas de Subastas Publicitarias». Texto copiado de la respuesta.

---

## 1. Bloque A · Vías reales para ver las subastas del navegador de la persona sin instalar extensión

Existe una frontera técnica infranqueable definida por la Same-Origin Policy (RFC 6454 / especificación HTML de WHATWG): ninguna página abierta en guardianagroup.com tiene permiso del navegador para leer la memoria JavaScript (window.pbjs) ni el tráfico de red de otra pestaña o iframe de distinto dominio (como elmundo.es o as.com). Solo existen vías donde el usuario ejecuta una acción en esa pestaña o donde se mide la exposición de su conexión en el propio dominio de GUARDIANA.

**(a) Marcador local (bookmarklet) que lee pbjs.getEvents().** El usuario arrastra un botón a su barra de marcadores; al abrir elmundo.es en su navegador normal y pulsarlo, el código se ejecuta en esa página, lee window.pbjs.getEvents() (o recorre window._pbjsGlobals) y dibuja un panel local (en un Shadow DOM aislado) o genera un resumen en el portapapeles, sin enviar datos a ningún servidor.
Límites: CSP (aunque la mayoría de navegadores permiten ejecutar un javascript: activado manualmente desde marcadores, connect-src y script-src bloquearán cargar scripts externos o enviar los datos a GUARDIANA: todo el código debe ir autocontenido en el marcador); móvil y Safari (no se puede arrastrar; hay que guardar una página, editar la URL y luego invocarla escribiendo su nombre: casi nadie lo completa); webs sin Prebid en cliente y subastas en servidor / Google (no ve Prebid Server S2S, ni Amazon TAM/UAM, ni la subasta interna de Google Ad Manager / AdX, que oculta el precio ganador).

**(b) Página de contraste en GUARDIANA (sin precios de terceros).** Pantalla dividida: a la izquierda, lo que entrega el navegador de la persona al conectarse (IP doméstica, ISP/ASN, ubicación aproximada, cabeceras y Client Hints, huella de pantalla/WebGL, estado de almacenamiento); a la derecha, la web elegida en ZERO con su conexión (ASN Hetzner, Núremberg, navegador limpio) y las peticiones bidRequested reales que acaban en 0 pujas.
Límites: no muestra los CPM que habrían pujado en el navegador local, ni las cookies de terceros ya guardadas (SOP y particionado de cookies, CHIPS, ITP).

**(c) Subasta Prebid propia (descartada).** Para recibir pujas reales, cada SSP (Magnite, Xandr, PubMatic, Index Exchange) exige dar de alta el dominio como soporte con inventario real. Disparar subastas sin anuncios reales que vender incumple los contratos (tráfico artificial sin intención de impresión) y vulnera el límite de no generar subastas ni impresiones falsas.

**(d) Inspector local de HAR o volcado de consola.** El usuario copia `copy(pbjs.getEvents())` o guarda el .har y lo suelta en GUARDIANA, que lo procesa en local (FileReader, sin subirlo). Límites: no sirve en móviles y requiere herramientas de desarrollador.

**Recomendación:** combinar (b) como experiencia principal inmediata (100 % de las visitas, móvil incluido, cero instalaciones) + (a) como comprobación avanzada en escritorio, con un botón «Comprobar con mi conexión en mi pestaña» que genera un resumen que el usuario pega en GUARDIANA para el documento comparativo.

## 2. Bloque B · Antes y después honesto

**Qué medir (de pbjs.getEvents()):** auctionInit y total de bidRequested; empresas llamadas (códigos de bidder); señal de consentimiento TCF v2.2 (gdprConsent, gdprApplies, consentString; si se midió tras «Aceptar», «Rechazar» o antes de interactuar); identificadores enviados (userId / userIdAsEids: nombres de proveedores, lleno o vacío, sin copiar el valor); respuestas: bidResponse con precio, noBid, bidWon, CPM bruto y moneda.

**Qué NO decir:**
- «Han vendido tus datos por X euros»: en OpenRTB y Prebid el CPM es el precio por 1.000 impresiones; 1,50 € CPM = 0,0015 € por impresión, y paga a la vez el espacio, el formato, la temática y, cuando existe, el perfil.
- «Se han cobrado todas las pujas»: no se suman; como máximo gana una por hueco, y la ganadora de Prebid puede perder después frente a AdX en el servidor de anuncios del medio.
- «En ZERO las empresas no saben qué página se ha abierto»: bidRequested demuestra que se les envió la URL de la noticia; la diferencia es que reciben la IP del servidor y un navegador vacío que se destruye al cerrar, y no pueden vincular la lectura a la persona.

**Evitar conclusiones falsas:** igualar el consentimiento («sin aceptar en ambos» y «aceptando en ambos»); explicar por qué en ZERO hay 0 pujas incluso aceptando (navegador sin historial ni identificadores, eids: 0; conexión de centro de datos, Hetzner AS24940: según las guías de tráfico inválido —MRC IVT, listas de IP de centros de datos de TAG— los compradores descartan pujar en rangos de servidores); advertir la variación entre cargas (frequency capping, presupuestos, timeouts de ~1.000 ms) y mostrar la hora exacta de cada lectura.

## 3. Bloque C · Documento descargable

**Nombre:** «Acta Técnica de Contraste en Subastas Web · GUARDIANA ZERO» (o «Informe de Exposición en Subastas Publicitarias — Antes y Después»).

**Contenido mínimo:** identificador (UUID v4), fecha y hora UTC (ISO 8601) de ambas mediciones, URL analizada y versión del sensor; condiciones de simetría (consentimiento TCF en A y en B); tabla comparativa (origen de red: doméstico con IP ocultada / centro de datos; auctionInit; bidRequested con lista de empresas; proveedores de ID activos solo por nombre; pujas con precio; CPM máximo y su equivalente por impresión); nota metodológica y límites.

**Comprobable sin datos de más:** poda antes de crear el archivo (art. 5.1.c RGPD): fuera la IP real, las cookies, el tcString bruto y los valores de eids; solo conteos, nombres y estados. JSON canónico (RFC 8785) y SHA-256 con WebCrypto. Firma separada por origen: el motor de ZERO firma (ECDSA P-256) el hash y la hora de la parte medida en ZERO, con clave pública publicada; la parte del navegador del usuario lleva su hash y la nota «Datos extraídos localmente en el navegador del usuario; GUARDIANA solo rubrica de origen la mitad ejecutada en su propio servidor ZERO». Sello de tiempo RFC 3161 opcional enviando solo el hash.

## 4. Bloque D · Riesgos y frase para la web

- RGPD y ePrivacy (art. 5.3): el marcador lee por acción voluntaria del propio usuario para su propia consulta. Para no ser responsable del tratamiento de esos identificadores, nunca enviar valores de eids ni cookies a GUARDIANA: cruce y PDF en el navegador del cliente.
- IAB TCF v2.2: no modificar ni inyectar cadenas; en las pruebas «permitiendo anuncios», que sea la persona quien pulse «Aceptar» dentro de ZERO.
- Términos de los medios y bloqueos antirrobot: prohíben la extracción automatizada masiva; la defensa de ZERO es que es un navegador remoto usado en vivo por una persona, que no falsea su red ni salta barreras (no usa proxies domésticos ante el muro de as.com).
- Prebid.js (Apache 2.0): leer pbjs.getEvents() es lícito. El riesgo es reputacional: exagerar precios o atribuir el 0 a un «bloqueo mágico» sin mencionar navegador limpio e IP de centro de datos; explicarlo con transparencia convierte esa limitación en una prueba de honestidad.

**Frase:** «Qué estás viendo en tiempo real: cuando abres un medio en tu navegador habitual, la página convoca en milisegundos una subasta publicitaria (Prebid.js) entre decenas de empresas enviándoles la dirección de lo que lees, tu ubicación aproximada y, si aceptaste el aviso de privacidad, tus identificadores de seguimiento para que pujen por mostrarte un anuncio (el precio CPM indica cuánto ofrecen por cada 1.000 impresiones de ese espacio, no un pago directo por tus datos aislados). Dentro de GUARDIANA ZERO, la página se abre en un navegador limpio y efímero alojado en un servidor remoto en Alemania: las empresas siguen recibiendo el aviso de subasta de la página, pero al encontrarse con una conexión de centro de datos y un navegador sin historial ni identificadores personales, no pueden asociar la lectura a tu conexión real y las pujas sobre tu sesión caen a cero. No alteramos los precios ni simulamos resultados; los importes, el número de empresas y las respuestas varían en cada carga según la web, tu decisión en el aviso de cookies y el momento del día.»
