# Ronda 40 · ChatGPT (GPT, razonamiento «Alta», con búsqueda web) · bloques A–E

Chat: https://chatgpt.com/c/6adedc7c-ccbc-83e9-8ec7-cef446ad4f68

---

GUARDIANA ZERO — Ronda 40

Investigación técnica y competitiva · 25 de octubre de 2026 · Primera plataforma: PC

Decisión principal: ZERO debe convertirse en un navegador remoto que no solo bloquee rastreadores y aísle contenido peligroso, sino que explique al usuario, con pruebas, qué intentó hacer cada página, qué consiguió impedir y qué quedó fuera de su protección.

La oportunidad es real, pero la diferencia no puede ser simplemente «navegar en la nube». Esa tecnología ya existe. La ventaja debe estar en combinar aislamiento, prevención, transparencia verificable y una experiencia comprensible para cualquier persona.

Hay tres condiciones fundamentales:

No confundir intento con ataque. Que una página consulte información del navegador no demuestra que alguien esté atacando al usuario.

No confundir bloqueo con protección absoluta. Evitar una petición no significa impedir todos los posibles canales de seguimiento.

No confundir seguridad del dispositivo con privacidad frente a GUARDIANA. Las páginas se ejecutarán en los servidores de ZERO, pero esos servidores procesarán contenido, sesiones y, potencialmente, información sensible. Habrá que minimizar ese acceso y documentarlo.

A) MOTOR — Primera versión real
A1. Pantalla remota: CDP primero, WebRTC después
Arquitectura inicial propuesta. El cliente sí ejecuta el código de la interfaz ZERO, pero no el JavaScript de las páginas remotas.

Elección inicial: CDP Screencast por WebSocket seguro.

Usaría Chromium controlado por Playwright, con CDP para transmitir imágenes JPEG del área visible y eventos de ratón y teclado en sentido contrario.

Por qué:

Evita desarrollar desde el primer día una infraestructura completa de vídeo y audio.

Permite sincronizar navegación, capturas y eventos de seguridad con el mismo proceso.

Facilita la depuración con un equipo pequeño.

El protocolo CDP ya contempla Page.startScreencast y confirmaciones mediante Page.screencastFrameAck. 
DevTools Protocol
+1

Configuración orientativa para pruebas, no rendimiento garantizado:

Parámetro

	

Propuesta alfa

Imágenes

	

JPEG

Calidad

	

65–75, ajustable

Cuadros por segundo

	

Objetivo 10–15 activos

Pestaña inactiva

	

0–1 FPS según necesidad

Resolución

	

Adaptativa al área visible

Entrada

	

Eventos autenticados y secuenciados

Transporte

	

WSS entre cliente y pasarela

La pasarela debe poseer el control de CDP. El navegador del cliente jamás recibe un puerto CDP, un token reutilizable de la microVM ni acceso al proceso Chromium.

Cuándo pasar a WebRTC: cuando las pruebas con usuarios reales demuestren problemas de fluidez, latencia, vídeo o necesidad de audio.

WebRTC permite utilizar códecs de vídeo y mecanismos de control de congestión más apropiados para transmitir una experiencia gráfica continua. Lo implementaría tras medir latencia de interacción, consumo de ancho de banda y costes por usuario activo.

La conexión multimedia cliente-servidor debe utilizar una pasarela controlada; no debe reutilizar el WebRTC de las páginas visitadas. Son dos funciones distintas.

Importante: CDP es la herramienta de control, no el aislamiento de seguridad. Y CDP Screencast no constituye un servicio completo de escritorio remoto: habrá que resolver expresamente audio, portapapeles, selección de texto, IME, accesibilidad, descargas y comportamiento del cursor.

A2. Intercepción y bloqueo

No construiría un bloqueador completamente nuevo. Construiría un motor ZERO que aplica reglas existentes y registra evidencias originales.

Defensa

	

Implementación inicial

	

Por qué

Peticiones de rastreo

	

browserContext.route() y route.abort()

	

Cortar antes de descargar el recurso

Cookies de terceros

	

Bloqueo desde Chromium y separación de almacenamiento

	

Evitar identificadores compartidos

Scripts de seguimiento

	

Reglas por URL, dominio y tipo de recurso

	

Impedir su ejecución cuando se identifican

Huella digital

	

Denegar APIs no necesarias; instrumentar algunas consultas

	

Reducir superficie de identificación

WebRTC de páginas

	

Desactivado inicialmente

	

Evitar comunicaciones directas y fugas de IP

Referer

	

Política restrictiva y modificación controlada

	

Reducir datos del origen enviados a terceros

Parámetros de seguimiento

	

Eliminar identificadores conocidos de URLs

	

Reducir propagación de identificadores

HTTPS

	

Intentar HTTPS primero; advertir o bloquear HTTP

	

Evitar transmitir contenido sin cifrar

Elementos publicitarios

	

Filtrado cosmético de DOM y CSS

	

Ocultar espacios vacíos sin contar falsos cortes

Scriptlets

	

Compatibilidad progresiva con reglas soportadas

	

Neutralizar comportamientos concretos

Avisos de cookies

	

Rechazo explícito en gestores compatibles

	

No confundir cerrar un aviso con rechazar

Suplantación y malware

	

Comparación contra fuentes autorizadas

	

Interrumpir accesos a URLs conocidas

Una decisión técnica importante: Playwright puede dejar fuera de determinadas rutas las peticiones gestionadas por Service Workers. Para la alfa los desactivaría con serviceWorkers: 'block', documentando las incompatibilidades. Además, usaría un control de salida de red independiente de Playwright, porque el filtrado de peticiones no equivale a un cortafuegos completo. 
Playwright
+1

El filtrado cosmético tampoco equivale a cancelar una transferencia: ocultar un anuncio que ya se descargó debe registrarse como «elemento ocultado», no como «petición impedida».

Listas, datos y licencias verificadas

Fuente

	

Licencia o condiciones

	

Decisión ZERO

EasyList

	

Dual GPL-3.0-o-posterior / CC BY-SA 3.0-o-posterior, salvo excepciones

	

Usar

EasyPrivacy

	

Misma familia de licencias del repositorio EasyList

	

Usar

EasyList Cookie

	

Verificar los ficheros concretos y sus excepciones bajo la licencia del repositorio

	

Usar para reglas compatibles

uBlock Origin uAssets

	

GPL-3.0

	

Usar reglas compatibles

HaGeZi

	

GPL-3.0 para listas publicadas; comprobar restricciones de fuentes anteriores

	

Candidato para segunda capa

PhishTank

	

Condiciones propias; permiten uso comercial de los datos, no licencia abierta estándar

	

Usar respetando límites

Wikidata

	

CC0 para datos estructurados

	

Usar para entidades

Tracker Radar

	

CC BY-NC-SA 4.0

	

No usar sin licencia comercial

Disconnect

	

CC BY-NC-SA 4.0

	

No usar sin licencia comercial

OpenPhish

	

Uso comercial prohibido sin consentimiento escrito

	

No usar en alfa

URLhaus

	

API comunitaria con restricciones para usos empresariales; opción comercial

	

Solo con autorización adecuada

Peter Lowe

	

Permite combinar/publicar la lista; licencia comercial estandarizada no identificada

	

Solicitar confirmación

Base GUARDIANA

	

Datos propios, procedencia documentada; CC0 solo para la parte verdaderamente propia o compatible

	

Utilizar

Fuentes de licencias y condiciones: 
EasyList
+10

Precaución jurídica: que una lista GPL o CC BY-SA permita actividad comercial no significa que pueda integrarse sin obligaciones. Hay atribución, conservación de licencias y posibles exigencias de compartir modificaciones o adaptaciones. Se necesita un inventario de versiones, procedencia y obligaciones antes de desplegar.

Para evitar licencias incompatibles, no utilizaría un agregado de listas sin comprobar sus fuentes originales.

Implementación del motor

La arquitectura de bloqueo debe tener cuatro niveles:

Política de red: bloquea destinos internos, salidas no autorizadas y conexiones no web.

Motor de filtros: decide si una petición HTTP debe continuar, modificarse o cancelarse.

Instrumentación del navegador: observa permisos, navegación, APIs sensibles y algunos comportamientos JavaScript.

Motor de evidencias: registra lo que realmente pasó, sin convertir cada observación en un ataque.

Cada registro guardaría, como mínimo, session_id, tab_id, timestamp, event_type, decision, rule_id, list_version, evidence_type y confidence.

No guardaría indiscriminadamente URLs completas: pueden contener identificadores personales, contraseñas temporales y tokens. Las evidencias sensibles deben tratarse en memoria y redactarse antes de llegar al historial.

A3. Saber quién está detrás de cada corte

Recomiendo crear GUARDIANA ATLAS, una base propia de atribución de empresas.

No basta con hacer una consulta Whois y asignar el resultado como propietario: un dominio puede pertenecer a una filial, a un proveedor tecnológico, a un intermediario o a un servicio de alojamiento.

Cada dominio tendrá atributos separados:

Campo

	

Significado

Dominio solicitado

	

Destino técnico observado

Empresa atribuida

	

Propietario u operador contrastado

Empresa matriz

	

Grupo empresarial, si está confirmado

País de sede

	

Domicilio corporativo acreditado

País del servidor

	

Ubicación técnica, solo si está verificada

Propósito

	

Publicidad, analítica, seguridad, etc.

Certeza

	

Confirmado, probable o desconocido

Fuentes

	

Referencias públicas concretas

Revisión

	

Fecha y versión de los datos

Partiría de las 100 empresas que GUARDIANA pueda confirmar con dos fuentes independientes y de hechos estructurados CC0 de Wikidata. No incorporaría Tracker Radar ni Disconnect indirectamente mediante copias o derivados para evitar sus restricciones comerciales.

Regla clave: el país de sede no es necesariamente el país al que viajan los datos. ZERO debe presentar ambos por separado.

También diferenciaría «finalidad habitual del servicio» de «uso demostrado en esta página». Identificar una empresa de analítica no demuestra qué datos recibió.

A4. Hacer viable una suscripción de uso mensual

El problema no es únicamente ejecutar Chromium; es evitar consumir una microVM completa durante horas sin actividad.

La arquitectura debe permitir usar ZERO cualquier día del mes sin prometer recursos de cómputo ilimitados.

Estado

	

Comportamiento

Activo

	

Navegación y transmisión normales

Sin cambios visuales

	

Transmitir únicamente cuando aparezcan nuevos cuadros útiles

Pestaña secundaria

	

Pausar representación y limitar tareas

Cliente desconectado brevemente

	

Mantener sesión durante una tolerancia configurable

Inactividad prolongada

	

Suspender o terminar la microVM según política

Retorno del usuario

	

Restaurar sesión cuando sea posible; recrear contexto en otros casos

Cierre definitivo

	

Destruir la VM y sus datos efímeros

Aplicaría inicialmente un límite operativo configurable de pestañas, por ejemplo cinco activas, y mediría la demanda real antes de establecer una política definitiva.

Añadiría medidas concretas:

Solo transmitir la pestaña enfocada.

Compresión adaptativa a la calidad de conexión.

No procesar continuamente pestañas ocultas.

Guardar marcadores y preferencias aparte de la VM.

Prohibir minería, automatización abusiva y explotación del servicio como proxy.

Aplicar límites de CPU, RAM, tráfico y conexiones concurrentes, sin convertir el plan mensual en una bolsa de horas.

Reutilizar imágenes base del sistema, nunca perfiles contaminados de otros clientes.

Destruir archivos temporales y secretos al terminar.

Separar las credenciales de autenticación de la sesión remota de los datos de navegación.

La suspensión real exige cuidado. Firecracker permite snapshots y reanudación, pero no garantiza que las conexiones de red sobrevivan intactas. El estado suspendido, además, puede contener cookies y secretos en memoria: hay que cifrarlo, limitar su vida útil y controlar su eliminación. 
GitHub

No intentaría conservar un navegador vivo durante treinta días. Conservaría la continuidad útil del servicio, diferenciando explícitamente el modo persistente del modo efímero.

A5. Aislamiento mínimo aceptable

Para una alfa accesible a terceros, no aceptaría un Chromium ejecutado sin sandbox dentro de un contenedor compartido.

El mínimo sería:

MicroVM separada por sesión, con kernel y sistema mínimos.

Chromium con su sandbox activada, sin --no-sandbox.

Proceso no privilegiado; sin acceso al host ni montaje de sockets de administración.

Firecracker Jailer o medidas equivalentes de contención.

Salida de red controlada por firewall/proxy externo a Chromium.

Prohibición de acceso a metadatos cloud, loopback del host, redes privadas, sockets Unix, servicios administrativos y direcciones especiales.

DNS controlado, con bloqueo de resoluciones internas y comprobación contra DNS rebinding.

CDP privado e inaccesible desde la red pública.

Autenticación, límites de entrada y control de propietario de cada sesión.

Navegador y sistema base actualizados, con proceso de parcheo urgente.

Subidas, descargas y portapapeles cerrados inicialmente, hasta contar con pasarelas seguras.

El Jailer de Firecracker proporciona mecanismos adicionales de aislamiento, pero exige que el operador configure correctamente permisos, rutas y recursos. 
GitHub

Pruebas obligatorias antes de una afirmación pública de seguridad:

Prueba

	

Resultado exigido

Fuga de IP por WebRTC/STUN

	

La página no obtiene la IP del cliente

DNS

	

Las páginas no pueden alcanzar resolutores o redes prohibidas

SSRF y DNS rebinding

	

Imposible acceder a destinos internos mediante navegación

Aislamiento entre usuarios

	

No hay acceso a cookies, almacenamiento ni sesiones ajenas

Acceso CDP

	

No permite controlar otra sesión ni saltarse la pasarela

Archivos y clipboard

	

No hay transferencia local sin autorización expresa

Caída de VM o proceso

	

No deja una sesión reutilizable ni secretos accesibles

Reinicio y suspensión

	

Estado propio recuperado; ningún dato cruzado

Navegador comprometido

	

Intento de alcanzar el host y sus servicios bloqueado en las pruebas

Fugas por enlaces y formularios

	

Reglas medidas con tráfico real y resultados documentados

Haría pruebas con herramientas de fingerprinting, DNS/WebRTC, sitios de prueba maliciosos inofensivos, pruebas de segregación multiusuario y una auditoría externa antes del lanzamiento general.

La afirmación pública defendible, una vez verificada, sería:

«Las páginas que visitas se ejecutan en un entorno remoto aislado. Nuestro sistema intenta impedir que su código llegue a tu dispositivo y aplica controles de red y privacidad verificables».

No diría que eso elimina todas las vulnerabilidades ni que el usuario es imposible de identificar.

B) SEGURIDAD — Brave, DuckDuckGo y Tor
B1. Qué puede igualar ZERO

La comparación se basa en las defensas documentadas de Brave Browser, DuckDuckGo Browser y Tor Browser. 
Brave
+3

Defensa

	

Situación de ZERO

Bloqueo de anuncios y rastreadores conocidos

	

Igualable con motor de filtrado completo

Cookies de terceros

	

Igualable mediante bloqueo o partición

Limpieza de URLs

	

Igualable

Restricción del Referer

	

Igualable

HTTPS prioritario

	

Igualable

Protección contra phishing conocido

	

Igualable con inteligencia actualizada

Avisos de cookies

	

Igualable parcialmente, según cada web

Protección contra fingerprinting

	

Inicialmente inferior a Brave y Tor; requiere trabajo específico

Protección contra CNAME cloaking

	

Igualable mediante resolución y atribución DNS controladas

Protección contra bounce tracking

	

Requiere máquina de estados para redirecciones e identificadores

Niveles de seguridad restrictivos

	

Igualables parcialmente; pueden romper webs

Sesiones y almacenamiento separados

	

Igualable, con aislamiento adicional por microVM

Global Privacy Control

	

Igualable como señal; su cumplimiento depende del receptor

Circuitos y defensas de anonimato Tor

	

No igualables simplemente usando Chromium remoto

No lanzaría ZERO afirmando paridad completa desde la primera alfa. La meta inicial razonable es igualar el bloqueo básico y añadir aislamiento remoto más explicaciones que los navegadores convencionales no suelen presentar con ese nivel de detalle.

B2. Dónde supera a los navegadores locales por arquitectura

Frente a la ejecución convencional de páginas en un navegador local, ZERO tiene dos ventajas estructurales:

1. Contención fuera del dispositivo. Una página maliciosa intenta explotar el Chromium remoto, no el motor de representación local del cliente.

2. Separación de la IP del cliente. En condiciones normales, el destino ve la IP de salida del servidor ZERO, no la conexión residencial del usuario. Esto debe comprobarse frente a WebRTC, descargas, redirecciones y otros canales.

Pero esas ventajas no son exclusivas en el mercado: Cloudflare Browser Isolation y Kasm, por ejemplo, también ejecutan contenido web lejos del equipo. 
Cloudflare One docs
+1

B3. Dónde no alcanza a Tor

Hay que tratar Tor como referencia de anonimato, no únicamente de bloqueo publicitario.

Tor Browser utiliza mecanismos orientados a reducir la singularidad de la huella, aislar sitios, cambiar circuitos, utilizar la red Tor y reducir funciones peligrosas mediante sus niveles de seguridad. 
Navegador Tor — Tor
+2

ZERO, por sí solo, no proporciona:

Anonimato frente a GUARDIANA. El servicio conoce la cuenta y la conexión desde la que se accede, salvo que se diseñen mecanismos adicionales de separación.

Las garantías arquitectónicas de Tor. Una ruta de salida por Tor desde la nube no convierte automáticamente la experiencia Chromium en Tor Browser.

Protección contra identificación voluntaria. Si el usuario inicia sesión en una cuenta personal, esa web puede reconocerlo.

Defensa completa ante correlación de tráfico. Un adversario con suficiente capacidad de observación puede estudiar patrones entre entradas y salidas.

Compatibilidad universal con anonimato reforzado. Una huella homogénea, JavaScript desactivado o Tor pueden romper servicios.

Mantendría el modo ULTRA, pero con una etiqueta clara:

«Conexión mediante Tor desde los servidores ZERO. No equivale a utilizar Tor Browser directamente».

Además, la ruta Tor debe aislar circuitos por sitio cuando sea apropiado y verificarse contra fugas de DNS, WebRTC y conexiones fuera del proxy.

B4. Cuatro sistemas posibles gracias a la ejecución remota

1. Celdas desechables por sitio

Cada sitio de alto riesgo puede abrirse en una microVM propia, con identidad, almacenamiento y red separados.

Protege: frente a contaminación de sesiones y parte del movimiento lateral entre sitios. No protege: contra la identificación por cuentas, errores de configuración o ataques a la infraestructura compartida.

Para el cliente: «Esta página se ha abierto en un espacio separado del resto de tu navegación».

2. Cámara de descontaminación

Los enlaces y archivos sospechosos se abren en una celda independiente. Se puede mostrar una vista remota sin entregar directamente el archivo original.

Protege: reduce la exposición a contenido activo. No protege: contra información engañosa, errores del visor o archivos posteriormente liberados sin análisis.

Para el cliente: «Puedes examinar este contenido en un entorno separado antes de descargarlo».

3. Huella compartida ZERO

Un conjunto homogéneo de resoluciones, idiomas expuestos, fuentes, hardware virtual y APIs reduce diferencias entre navegadores remotos.

Protege: frente a algunas técnicas de fingerprinting. No protege: contra identificación por IP, sesiones, comportamiento, propiedades residuales o un perfil poco frecuente.

Para el cliente: «ZERO reduce ciertos detalles que permiten distinguir un navegador de otro».

No prometería una huella literalmente idéntica para todos hasta demostrarlo con pruebas estadísticas.

4. Centinela de salida

Un componente fuera de la microVM controla los destinos de las conexiones y puede bloquear intentos hacia redes privadas, servicios prohibidos o indicadores de amenaza conocidos.

Protege: reduce la capacidad de una página comprometida para conectarse con determinados destinos. No protege: contra todos los servidores desconocidos ni contra comunicaciones maliciosas mezcladas con tráfico aparentemente legítimo.

Para el cliente: «Se ha impedido una conexión que incumplía las reglas de seguridad de esta sesión».

Orden recomendado: centinela y cámara de descontaminación primero; celdas separadas para sitios de riesgo después; huella compartida avanzada cuando existan suficientes mediciones.

C) LA EXPERIENCIA DE SEGURIDAD EN VIVO

Este es el corazón comercial de ZERO: convertir decisiones técnicas en información útil y verificable.

El objetivo no es inundar la pantalla con alertas. Es que el usuario pueda responder tres preguntas:

¿Qué ha intentado hacer esta página? ¿Qué ha impedido ZERO? ¿Qué información podría seguir quedando expuesta?

C1. Catálogo de sucesos detectables

Convenciones:

Comprobado: se ha observado directamente el evento técnico y su resultado.

Probable: existen señales de un comportamiento, pero no se conoce con certeza su intención.

Estimado: interpretación o aproximación, que debe indicarse explícitamente.

La columna de competidores usa B = Brave, D = DuckDuckGo y T = Tor. Describe el comportamiento general o la protección equivalente, no garantiza el resultado en todas sus versiones y plataformas.

Rastreo, publicidad e identificación

Suceso y detección

	

Certeza

	

Frase exacta para el cliente

	

Competidores

Rastreador cortado. Regla coincidente y cancelación efectiva de petición

	

Comprobado

	

«ZERO ha impedido una conexión con un rastreador conocido».

	

B y D bloquean e informan en paneles; T reduce rastreo, con menos detalle por petición

Cookie de terceros rechazada. Evento de política de cookies y rechazo

	

Comprobado

	

«Se ha rechazado una cookie de otra empresa».

	

B y D protegen; T utiliza aislamiento y restricciones de cookies

Consulta para huella digital. Instrumentación de Canvas, WebGL, Audio u otras APIs

	

Comprobada la llamada; intención probable

	

«Esta página ha consultado datos del navegador que también pueden servir para identificarlo».

	

B y D mitigan; T resiste fingerprinting sin presentar cada consulta

Parámetro de seguimiento eliminado. Comparación antes/después de URL

	

Comprobado

	

«ZERO ha retirado un identificador de este enlace».

	

B y D ofrecen limpieza; T reduce rastreo por otros mecanismos

Redirecciones encadenadas. Cadena de navegación observada por CDP

	

Comprobada la cadena; propósito probable

	

«Este enlace ha pasado por varios destinos antes de abrir la página».

	

B bloquea ciertos rebotes; D aplica varias protecciones de enlaces; T limita vinculación entre sitios

CNAME asociado a un tercero. Resolución DNS y clasificación propia contrastada

	

Confirmado si hay prueba de atribución

	

«Un subdominio de esta web utiliza infraestructura de otra empresa».

	

B y D tienen defensas contra algunas formas de seguimiento encubierto; T aísla sitios

Solicitud publicitaria. Reglas de filtrado o identificación de componente publicitario

	

Comprobada la solicitud; finalidad clasificada

	

«Se ha detectado una solicitud relacionada con publicidad. ZERO la ha bloqueado».

	

B y D bloquean publicidad/rastreo; T no equivale a un bloqueador integral de anuncios

Subasta de anuncios. Eventos visibles del sistema de pujas o solicitudes reconocibles

	

Comprobado si hay evento explícito; probable si hay indicios indirectos

	

«Esta página ha iniciado un proceso publicitario. No podemos ver necesariamente todas las ofertas».

	

B y D pueden bloquear componentes; T limita seguimiento, sin mostrar un libro de pujas

Seguimiento entre webs. Identificador reutilizado en un destino tercero

	

Comprobada la reutilización; propósito probable

	

«Se ha detectado un identificador que podría relacionar visitas a distintas páginas».

	

Los tres aplican defensas, con diferentes mecanismos

Permisos e intentos de acceso

Suceso y detección

	

Certeza

	

Frase exacta para el cliente

	

Competidores

Micrófono solicitado. Llamada observada a getUserMedia o petición de permiso

	

Comprobado, si se instrumenta

	

«La página ha solicitado usar el micrófono remoto. ZERO no ha concedido acceso».

	

B/D/T aplican permisos; no todos muestran un historial detallado

Cámara solicitada. Instrumentación de permisos multimedia

	

Comprobado

	

«La página ha solicitado una cámara. El acceso permanece bloqueado».

	

Los tres usan controles de permisos

Portapapeles remoto. Llamada observada a API de lectura o intento de pegado

	

Comprobado si se observa

	

«La página ha solicitado leer el portapapeles del navegador remoto. ZERO lo ha denegado».

	

B/D/T usan protecciones de permisos del navegador

Conexión WebRTC de la página. Intento de crear conexión o negociación, observado mediante instrumentación

	

Comprobado el intento

	

«La página ha intentado iniciar una conexión directa. ZERO la mantiene desactivada».

	

B controla exposición de IP; D tiene protecciones dependientes de plataforma; T restringe vías de fuga

Ubicación solicitada. API de geolocalización o permiso

	

Comprobado

	

«Esta página ha pedido tu ubicación. ZERO no la ha proporcionado».

	

Los tres disponen de controles de geolocalización

La distinción entre portapapeles remoto y portapapeles del PC es esencial. Una página remota no debe tener acceso directo al portapapeles local por ningún puente de la aplicación. Una acción voluntaria de pegar datos es otra cosa.

Amenazas, transporte y datos

Suceso y detección

	

Certeza

	

Frase exacta para el cliente

	

Competidores

Phishing conocido. Coincidencia de URL con fuente comercialmente autorizada

	

Comprobada la coincidencia; amenaza según la fuente

	

«Esta dirección figura en una lista de posibles páginas fraudulentas. Hemos detenido la navegación».

	

B/D/T ofrecen protecciones contra destinos maliciosos de distinto alcance

Malware conocido. URL o hash coincidente con fuente autorizada

	

Comprobada la coincidencia

	

«Esta descarga coincide con un indicador de amenaza conocido. Se ha bloqueado».

	

B y D incluyen defensas de navegación/descargas; T prioriza aislamiento y restricciones

Descarga desconocida. Evento de descarga, tipo de archivo y política

	

Comprobado

	

«Se ha retenido este archivo para comprobarlo antes de entregártelo».

	

Los navegadores locales suelen aplicar avisos y comprobaciones

Certificado inválido. Error de validación TLS

	

Comprobado

	

«No se ha podido comprobar la identidad cifrada de este sitio. La conexión se ha detenido».

	

Los tres advierten o bloquean según el error

Formulario por HTTP. Acción o solicitud HTTP observada antes del envío

	

Comprobado si hay interceptación efectiva

	

«Este formulario enviaría información sin cifrado HTTPS. ZERO ha impedido el envío».

	

Los tres disponen de avisos o políticas de transporte seguro

Conexión prohibida a red interna. Firewall de salida y registro de denegación

	

Comprobado

	

«Una conexión hacia una dirección interna ha sido detenida por seguridad».

	

Los navegadores locales tienen varias restricciones; el aislamiento remoto permite una política de red independiente

Destino empresarial identificado. Dominio y atribución empresarial contrastados

	

Confirmada la atribución, no necesariamente el uso de datos

	

«Se ha observado una conexión con infraestructura atribuida a esta empresa».

	

B/D identifican algunos rastreadores; T no ofrece generalmente un registro corporativo equivalente

País de conexión. IP de destino con geolocalización autorizada y documentada

	

Estimado, salvo ubicación verificada

	

«La ubicación aproximada de este servidor figura como [país]. No equivale a la sede de la empresa».

	

No suele detallarse por conexión en sus paneles de privacidad

Preferencia GPC enviada. Inspección de cabecera y señal JavaScript

	

Comprobado el envío

	

«ZERO ha comunicado tu preferencia de no compartir o vender datos. La web debe aplicarla conforme a las normas que le correspondan».

	

B/D pueden emitir la señal; el cumplimiento no es verificable solo por enviarla

Los eventos de red, de seguridad de conexión y de sistemas de subasta pueden instrumentarse utilizando CDP y, cuando estén disponibles, las APIs del componente publicitario. Eso no permite observar todas las operaciones internas de una subasta ni todos los comportamientos de un script. 
DevTools Protocol
+3

Una precisión imprescindible

Cuando una API de fingerprinting haya sido interceptada, ZERO puede confirmar que se invocó, pero no debe afirmar automáticamente que existe una persona espiando al usuario.

También hay intentos invisibles para los sensores: scripts ofuscados, comunicaciones dentro de canales permitidos y comportamientos del servidor. La ausencia de sucesos no demuestra ausencia de amenazas.

C2. La interfaz de PC

Conservaría exactamente la estructura aprobada: página web a la izquierda y panel de 300 px a la derecha, con barra de cristal.

No añadiría ventanas emergentes por cada evento.

ZERO · Navegación protegida

Vista conceptual · SIMULADO

https://ejemplo.test

Contenido web remoto

Lo que ZERO corta

7

Solicitudes bloqueadas

4 rastreadores

2 anuncios

1 conexión

En directo

Rastreador cortado

Permiso denegado

Maqueta explicativa: los números y sucesos son inventados y no corresponden a ninguna navegación real. En PC, el panel derecho conservaría sus 300 px aprobados.
Organización propuesta

Mantendría las pestañas actuales, añadiendo una dedicada al significado de los acontecimientos:

Ahora

Empresas

Subasta

Protecciones

El hilo principal se actualiza con sucesos reales, agrupados y sin hacer saltar la interfaz cada vez que llega una petición.

Señales visuales:

Verde: protección aplicada con resultado confirmado.

Ámbar: información que exige atención, incertidumbre o consentimiento.

Coral: reservado a una amenaza o conexión de riesgo efectivamente bloqueada.

La interfaz nunca debe usar coral para un evento meramente sospechoso o no clasificado.

El momento «ha pasado algo importante»

En lugar de una alarma roja y un sonido:

Aparece una pequeña notificación dentro del panel.

Se mantiene visible brevemente, sin tapar la página.

Explica qué ocurrió, qué hizo ZERO y qué limitación existe.

Ofrece «Ver detalles» y no exige interacción si el riesgo ya se ha contenido.

Ejemplo de texto, solo para utilizar ante un bloqueo real:

ZERO ha detenido una navegación sospechosa. La dirección aparece en una fuente de seguridad consultada por ZERO. No se ha abierto la página. Puedes revisar el motivo.

Si una descarga, permiso o transferencia requiere una decisión, el sistema sí puede interrumpir el flujo para solicitar consentimiento explícito.

C3. Resumen diario y mensual

El informe debe demostrar actividad de seguridad, no vender una cantidad imaginaria de datos salvados.

Tu Radiografía de ZERO

Ejemplo sin datos reales

Solicitudes bloqueadas

—

Empresas identificadas

—

Enlaces limpiados

—

Alertas de riesgo contenidas

—

Qué ha hecho ZERO

Aquí aparecerán únicamente decisiones ejecutadas y confirmadas. Las clasificaciones probables y las estimaciones se mostrarán por separado.

El usuario elige si conserva un resumen local de eventos o un historial privado cifrado para consultas posteriores.

El PDF mensual incluiría versión de listas, reglas aplicadas, hechos confirmados, estimaciones, excepciones y posibles errores. La generación del PDF no debe enviar URLs personales a un servicio externo no imprescindible.

No contaría como cortes las peticiones que nunca llegaron a intentarse, los espacios publicitarios ocultados, las reglas duplicadas ni los recursos hipotéticos de una página que no se abrió.

C4. Qué no decir nunca

Prohibido

	

Sustitución defendible

«Alguien te está espiando ahora mismo»

	

«Se ha detectado una solicitud clasificada como seguimiento»

«Hemos bloqueado un hacker»

	

«Se ha bloqueado una conexión que coincide con una regla de seguridad»

«Tu IP es imposible de conocer»

	

«La web utiliza la IP de salida de ZERO, salvo posibles identificaciones por otros medios»

«Tus datos nunca salen»

	

«Estas peticiones concretas fueron bloqueadas»

«Nadie puede acceder a tu navegación»

	

«Aplicamos controles de acceso y retención que documentamos»

«Esta empresa ha vendido tus datos»

	

«Esta empresa opera un servicio clasificado como publicidad o seguimiento»

«Se han impedido 50 robos de datos»

	

«Se han bloqueado 50 solicitudes»

«La subasta se ha vendido por X dólares»

	

«Se han observado eventos publicitarios; su resultado económico puede ser desconocido»

«Anonimato total»

	

«Medidas para reducir la identificación, con limitaciones»

«ZERO te protege de todo»

	

«ZERO reduce riesgos concretos; ninguno de sus controles es infalible»

La credibilidad de GUARDIANA dependerá tanto de contar lo que bloquea como de reconocer lo que no puede observar.

D) VEREDICTO — Las cinco primeras actuaciones

Para un equipo pequeño, este es el orden que seguiría. No intentaría construir las cinco novedades más ambiciosas antes de conseguir que el navegador básico sea seguro, utilizable y medible.

MicroVM real con navegación aislada

Montar Chromium dentro de Firecracker o equivalente, con controles de red independientes, autenticación y destrucción de sesión.

Deja de ser demostración: el contenido de páginas reales se ejecuta en una máquina remota aislada.

Pantalla real y control desde PC

CDP Screencast por WSS, ratón, teclado, navegación, pestañas e inactividad. Una sesión por usuario, sin compartir perfil.

Deja de ser demostración: la persona puede entrar en ZERO y navegar por páginas reales sin instalar software.

Bloqueador real con fuentes autorizadas

EasyList, EasyPrivacy, reglas compatibles de uAssets, política de cookies y primera capa antiphishing. Cada bloqueo tendrá identificador de regla y resultado técnico.

Deja de ser demostración: los contadores corresponden a peticiones efectivamente interceptadas y canceladas.

Panel de seguridad en vivo y ATLAS

Vincular cada evento real al dominio, empresa y propósito cuando exista evidencia suficiente. Incorporar certezas, fuentes, hora y motivo del bloqueo.

Deja de ser demostración: «Lo que ZERO corta» deja de contener empresas inventadas y muestra hechos observados.

Descargas controladas, informes y pruebas externas

Añadir controles de transferencias, navegación sospechosa, informes basados en evidencias y una batería de pruebas de aislamiento, privacidad y rendimiento.

Deja de ser demostración: ZERO puede ofrecer una alfa a usuarios reales con un alcance de protección explícito y comprobado.

No activaría todas las funcionalidades en producción a la vez. Cada bloque necesita pruebas funcionales y de seguridad antes de exponerse a usuarios.

La paridad profunda en huella digital, navegación ULTRA, compatibilidad compleja y suspensión avanzada queda después de esta primera secuencia, no antes de ella.

E) NOVEDAD — Investigación competitiva y cinco oportunidades
E1. Qué ofrecen realmente los otros navegadores

La revisión se apoya principalmente en la documentación de sus desarrolladores y proveedores, disponible a 25 de octubre de 2026.

Navegadores para consumidores

Navegador

	

Capacidades relevantes

	

Lectura para ZERO

Brave

	

Shields, bloqueo de rastreadores, cookies, defensas de fingerprinting, partición y mitigación de rebotes

	

Rival a igualar en protección cotidiana y facilidad de uso 
Brave

DuckDuckGo

	

Bloqueo de rastreadores, protección CNAME, limpieza de enlaces, fingerprinting, GPC, controles de cookies y borrado rápido

	

Rival importante en privacidad explicada de forma sencilla 
DuckDuckGo Help Pages

Tor Browser

	

Tor, aislamiento por sitio, resistencia a huellas, identidades y circuitos, niveles de seguridad

	

Referencia en anonimato y reducción de identificación 
Tor Browser
+2

Mullvad Browser

	

Diseño de huella común con Tor Project, aislamiento y bloqueo con uBlock Origin, sin utilizar obligatoriamente Tor

	

Referencia para construir una identidad de navegador menos singular 
Mullvad VPN

Firefox

	

Enhanced Tracking Protection y Total Cookie Protection, con partición del almacenamiento

	

Una referencia importante para aislamiento entre sitios 
Firefox Help

Vivaldi

	

Bloqueo integrado de rastreadores y anuncios, excepciones por sitio y listas configurables

	

Gran control para el usuario, aunque menos centrado en explicar una cadena de evidencias 
Vivaldi Browser Help

Opera

	

Bloqueo de anuncios, rastreadores, minería de criptomonedas y VPN integrada para el navegador

	

Privacidad ofrecida como función accesible y práctica 
Opera Help
+1

Arc

	

Interfaz orientada a organización, espacios y experiencia de navegación

	

Referencia de diseño, no de privacidad avanzada documentada

Dato actualizado: Arc ha anunciado su cierre para el 22 de diciembre de 2026 y su sustitución por Dia. Desde el 22 de octubre de 2026 ya no se permiten nuevas cuentas Arc. 
arc.net
+1

Navegadores remotos y empresariales

Aquí está la competencia tecnológica más cercana a ZERO.

Proveedor

	

Qué ofrece

	

Qué significa para GUARDIANA

Cloudflare Browser Isolation

	

Navegación remota, políticas de seguridad, controles de portapapeles, archivos, teclado y navegación de riesgo; representación mediante instrucciones gráficas

	

Ya existe una alternativa madura al aislamiento local 
Cloudflare One docs
+1

Menlo Security

	

Aislamiento cloud, prevención de phishing y malware, DLP y representación adaptativa sin depender únicamente de píxeles

	

Referencia en ingeniería de rendimiento y compatibilidad 
Menlo Security

Island

	

Navegador empresarial con prevención de fugas, protección ante phishing, controles de impresión/archivos y análisis de actividad

	

Una parte considerable de las políticas de datos ya existe comercialmente 
island.io

Kasm

	

Navegadores remotos desechables, streaming visual, restricciones y entornos aislados sin instalación local

	

Demuestra que la arquitectura básica de ZERO no es inédita 
Kasm Workspaces

Ericom Shield

	

Aislamiento remoto, phishing, bloqueo y navegación de solo lectura según políticas

	

La vista segura de una web sospechosa tampoco es una idea nueva; su trayectoria está ligada a la integración de Ericom con Cradlepoint/Ericsson 
Ericom Software
+1

Talon / Prisma Access Browser

	

Navegador empresarial reforzado e integrado en controles corporativos de seguridad y datos

	

No es un navegador remoto de píxeles equivalente; compite en protección y controles de actividad 
Palo Alto Networks
+1

Resultado de la investigación

No he encontrado documentación pública que demuestre que alguno de estos proveedores reúna exactamente la experiencia de ZERO propuesta a continuación: evidencias individualizadas para consumidores, explicación en lenguaje natural, cartografía de atribución verificable, comparación contrafactual privada y comprobación del cierre de sesiones.

Eso no demuestra que ninguno lo haga internamente, en una versión privada o mediante integraciones. La exclusividad mundial solo podría afirmarse después de una auditoría competitiva más exhaustiva. Lo defendible es desarrollar combinaciones diferenciadas y después contrastarlas con productos reales.

E2. Cinco novedades que desarrollaría
1. ZERO TESTIGO

Dificultad: media-alta

Cada bloqueo tendría su propia prueba técnica.

No bastaría con mostrar «rastreador bloqueado». ZERO correlacionaría la decisión de Chromium con el control de salida de red. Si ambos puntos permiten comprobar la interrupción, generaría una evidencia técnica firmada y redactada, con la regla, su versión y el resultado.

Comprobante de protección

Petición

Cancelada

Regla

Verificada

Salida de red

No observada en punto controlado

Evidencia

Firmada

Modelo de comprobante · SIMULADO. Una firma acreditaría el origen e integridad del registro, no que el sistema sea infalible.

Por qué no está extendido en navegadores de consumo: exige correlacionar sensores, mantener reglas versionadas, reducir datos personales y explicar técnicamente cada resultado. Los bloqueadores suelen priorizar rendimiento y simplicidad.

Para el cliente: «No tienes que creer un contador: puedes comprobar qué regla se aplicó y qué resultado registró ZERO».

Para GUARDIANA: una base auditable para generar confianza, localizar falsos positivos y publicar pruebas reproducibles de las protecciones.

2. ZERO UMBRAL

Dificultad: alta

Una última barrera antes de ciertas transferencias sensibles.

El navegador inspeccionaría, dentro de la microVM, operaciones de salida seleccionadas: envío de formularios, transferencias a dominios nuevos, cargas de archivos o patrones de datos sensibles claramente reconocibles.

La primera versión podría identificar datos estructurados comunes, como posibles números de tarjeta, documentos identificativos o credenciales en lugares inesperados, sin guardar su contenido. El usuario decidiría si continúa.

Lo novedoso que buscaría: no sería simplemente DLP empresarial. Sería una explicación personal, comprensible y controlada por el propio usuario, no por el administrador de una organización.

Por qué es difícil: existen falsos positivos, cifrado dentro de aplicaciones, canales alternativos de JavaScript y problemas de privacidad al inspeccionar contenido. Island y Cloudflare ya cuentan con controles relacionados; la novedad tendría que estar en la experiencia y en su tratamiento mínimo de datos. 
island.io
+1

Para el cliente: «Antes de enviar esta información, ZERO te explica el destino y te permite decidir».

Para GUARDIANA: una función de valor cotidiano que puede resultar más relevante que bloquear otro rastreador publicitario.

Límite: no puede garantizar que se detecten todas las filtraciones. Nunca debe anunciar que ha impedido un robo de datos por bloquear únicamente un formulario.

3. ZERO ESPEJO

Dificultad: media-alta

Enseñar qué cambia realmente cuando funciona la protección.

Cuando el usuario quiera comprender una web, ZERO podría abrir una segunda microVM completamente separada y sin identidad personal, para realizar una comparación controlada.

Con ZERO

Perfil protegido

Solicitudes autorizadas y rechazadas, medidas en esta visita.

Prueba aislada

Perfil sin identidad

Cargas observadas con protecciones modificadas solo en el entorno de prueba.

El sistema mostraría diferencias reales: solicitudes, recursos, empresas identificadas y posibles cambios funcionales.

Por qué es poco habitual: duplica trabajo de navegación, puede generar tráfico adicional, exige anonimizar la prueba y dos ejecuciones nunca son perfectamente idénticas. Menlo ya emplea el concepto de navegador gemelo remoto, pero aquí se propone una comparación visible de políticas para el consumidor, no simplemente la réplica para aislar contenido. 
Menlo Security

Para el cliente: «Puedes ver qué diferencia produce ZERO en una prueba independiente, sin utilizar tus cuentas personales».

Para GUARDIANA: una demostración comercial medible y especialmente útil para explicar la privacidad.

Límite imprescindible: no reproducir sesiones autenticadas, cookies, búsquedas personales, formularios ni tokens del usuario en el gemelo. Y nunca afirmar que la comparación representa exactamente lo que hubiera ocurrido en su sesión real.

4. ZERO ÓRBITA DE DATOS

Dificultad: media

Convertir la infraestructura de internet en una explicación de cada decisión.

Esta novedad aprovecha un activo que GUARDIANA ya está desarrollando: Órbita.

Al pulsar una petición, ZERO podría mostrar la conexión entre la página actual, el dominio solicitado, la empresa atribuida y, cuando exista evidencia suficiente, la ubicación aproximada del destino.

El usuario podría abrir la ficha de empresa, ver las fuentes y entender por qué una regla ha considerado una petición como publicidad, analítica o seguimiento.

Por qué no es una función típica de navegador: requiere combinar sensores de navegación, atribución empresarial, fuentes de telecomunicaciones y una experiencia cartográfica propia. Los navegadores convencionales no tienen esa necesidad de producto.

Para el cliente: «Esta conexión se dirigía a un dominio atribuido a una empresa identificada. Aquí tienes su finalidad conocida y las fuentes».

Para GUARDIANA: integración directa entre ZERO, Órbita y Radiografías. Una ventaja de producto que es más difícil de copiar que un contador de bloqueos.

Límite: el mapa no puede afirmar que una petición atravesó un cable submarino, satélite o centro de datos concreto sin datos de ruta suficientes. Una ubicación estimada debe aparecer como estimada, y las rutas desconocidas, como desconocidas.

5. ZERO DESAPARECE

Dificultad: alta

Demostrar hasta donde sea posible cómo termina y se elimina una sesión.

El usuario pulsaría «Destruir mi sesión».

ZERO cerraría el navegador, destruiría la microVM, revocaría sus credenciales temporales y eliminaría o invalidaría las claves de cifrado de sus volúmenes efímeros.

El sistema generaría un comprobante firmado de las operaciones ejecutadas, acompañado de la política de retención aplicable y de las limitaciones de la verificación.

Cierre verificable de sesión

Proceso terminado

Credenciales de sesión revocadas

Claves temporales invalidadas

Estados ilustrativos, no operaciones ejecutadas. Las comprobaciones reales deberán estar respaldadas por registros auditables.

Por qué no es habitual para el consumidor: los proveedores de aislamiento ya usan entornos desechables, pero no es corriente presentar el ciclo de destrucción como una función personal auditable. Hacerlo rigurosamente exige una arquitectura de secretos, backups y retención adecuada.

Para el cliente: «La sesión remota ha terminado y estas son las operaciones de eliminación que ZERO puede acreditar».

Para GUARDIANA: confianza, diferenciación y una promesa de privacidad mucho más concreta que «no te rastreamos».

Límite fundamental: un comprobante firmado por el propio operador no prueba por sí solo que no existan copias, registros o accesos anteriores. La transparencia deberá complementarse con arquitectura documentada y auditorías independientes. Nunca se debe afirmar un borrado absoluto sin prueba suficiente.

E3. Cómo priorizar las cinco novedades

Valor diferencial frente a dificultad de desarrollo

1
2
3
4
5
3
3.5
4
4.5
5
3: Valor diferencial 5
5: Valor diferencial 5
4: Valor diferencial 4
3: Valor diferencial 5
4: Valor diferencial 4

Puntuaciones de criterio estratégicas propuestas por este análisis, no resultados de pruebas ni métricas de mercado.

Evaluación cualitativa, no datos medidos. La dificultad real dependerá de la infraestructura disponible y del nivel de auditoría exigido.

Las dos que más priorizaría una vez completado el motor básico son ZERO TESTIGO y ZERO ÓRBITA DE DATOS. Comparten evidencias, empresas, reglas y fuentes con capacidades que GUARDIANA necesita igualmente.

UMBRAL tiene posiblemente un valor mayor en momentos críticos, pero exige mucha más ingeniería para evitar errores peligrosos.

ESPEJO es atractivo para explicar el producto públicamente, pero no debe ser necesario para proteger una navegación normal.

DESAPARECE es importante para construir confianza, aunque su comprobación rigurosa es más compleja que la animación de cerrar y destruir una sesión.

E4. Qué posicionamiento elegiría

No presentaría ZERO como «otro navegador que bloquea más anuncios».

Tampoco competiría con Tor afirmando que ofrece más anonimato, ni con los grandes proveedores empresariales afirmando que ha inventado el aislamiento remoto.

Lo presentaría como:

ZERO — El navegador que te explica su protección.
Navega desde un entorno remoto aislado. Comprueba las conexiones que ZERO bloquea, entiende quién está detrás de los dominios identificados y conoce los límites reales de tu privacidad.

Esa promesa es compatible con el producto que se está diseñando, aunque solo deberá publicarse como capacidad disponible cuando se hayan implementado y probado sus componentes.

La ventaja estratégica más interesante para GUARDIANA no es que el usuario vea muchos sucesos. Es que pueda ver la acción, entender el motivo y consultar su evidencia, sin necesitar conocimientos técnicos.

Conclusión de la ronda 40: mantendría el diseño aprobado del navegador. No añadiría más espectáculo visual. Toda la inversión siguiente debería destinarse a hacer real el motor, observable la protección y auditable la información que se muestra. Ese es el camino más sólido para que ZERO se diferencie por confianza y utilidad, en lugar de depender de afirmaciones que otros navegadores también pueden hacer.

