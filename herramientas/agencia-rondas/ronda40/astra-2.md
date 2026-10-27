# Ronda 40 · Astra 6 · tanda 2: C (cortado en «Prueba de ruta»); F y G no llegaron

## Decisión de producto

- ZERO no debe vender “detectamos a quien te espía”. Debe vender: “Te enseñamos qué intentó hacer la web, qué decisión tomó ZERO y qué podemos demostrar”.
- La diferencia no sería otro contador de rastreadores: sería un registro de decisiones con pruebas, conectado con Radiografías y Órbita.
- Límite esencial: el navegador remoto protege el dispositivo frente a parte del contenido web, pero desplaza confianza hacia GUARDIANA. Nuestra infraestructura procesa la sesión y puede acceder a datos en uso. No convierte automáticamente ZERO en equivalente a Tor Browser.
- La demostración actual debe seguir rotulada como demostración. Los ejemplos nunca se mezclan con sucesos reales, ni alimentan estadísticas de protección.

# C) Seguridad explicada en vivo

## 1. Primero: instrumentación, no narración inventada

ZERO necesita observar, dentro de cada microVM:

- Red: solicitudes, respuestas, redirecciones, TLS, DNS y decisiones de bloqueo.
- Chromium: permisos, cookies, almacenamiento, llamadas a determinadas API y descargas.
- Salida de la microVM: destinos y rutas permitidas, incluidas las restricciones de ULTRA.
- Cliente web: únicamente sus propias conexiones y permisos. No puede inspeccionar todo el PC ni el resto del navegador del usuario.

Para cobertura sólida, no basta una extensión ni inyectar JavaScript: hacen falta instrumentación de Chromium y controles de red externos al navegador. Deben cubrir pestañas, marcos, trabajadores y conexiones como WebSocket o WebRTC.

### Tres certezas, sin confundirlas con gravedad

- Comprobado: observamos una operación o una decisión concreta.
- Probable: observamos señales compatibles con una finalidad, no esa finalidad demostrada.
- Estimado: procedencia de una inferencia, como geolocalizar una IP.

Cada suceso separa: Hecho observado · Interpretación · Acción de ZERO · Límite.

Ejemplo: que un dominio figure en una lista está comprobado; que esa petición concreta pretendiera identificar a la persona puede no estarlo.

## 2. Catálogo de sucesos

Comparativa orientativa: B = Brave; D = navegador DuckDuckGo para escritorio; T = Tor Browser. Las prestaciones dependen de versión, sistema y ajustes. Antes de publicar comparaciones comerciales, hay que comprobarlas con versiones identificadas y pruebas reproducibles. No afirmar que los demás “no explican nada”: ya ofrecen paneles y avisos.

| Suceso | Detección y certeza | Frase exacta para la persona | Brave / DuckDuckGo / Tor |
|---|---|---|---|
| Petición de rastreo bloqueada | El motor cancela una solicitud que coincide con una regla. Comprobado: bloqueo y coincidencia; no necesariamente intención de esa solicitud. | «ZERO bloqueó una conexión a {dominio}, incluido en nuestra lista de rastreo.» | B: Shields bloquea y muestra elementos. D: bloquea rastreadores y muestra protecciones. T: no ofrece un bloqueador general equivalente de serie; prioriza aislamiento y anonimización. |
| Posible huella digital | Instrumentar lecturas de canvas, WebGL, audio y otras superficies. Una llamada aislada puede ser legítima. Comprobado: acceso; probable: fingerprinting. | «Esta web consultó características del navegador que podrían servir para reconocerlo. No demuestra por sí solo que te esté identificando.» | B: altera o limita determinadas superficies. D: incorpora defensas contra fingerprinting. T: busca uniformidad entre usuarios y restringe superficies. Ninguno detecta toda técnica posible. |
| Lectura del portapapeles | Registrar una llamada real de lectura y la decisión de permiso, no una simple consulta de disponibilidad. Comprobado. | «La web intentó leer el portapapeles de la sesión. ZERO lo impidió.» | B/D: permisos y restricciones del motor. T: restricciones según API y configuración. Normalmente no lo presentan como un historial de seguridad. |
| Solicitud de micrófono o cámara | Interceptar la solicitud de captura y comprobar si existe un puente autorizado al dispositivo. Comprobado. | «La web pidió usar el micrófono. ZERO no le dio acceso.» | B/D: avisos y controles de permisos. T: superficies multimedia restringidas; WebRTC está deshabilitado en Tor Browser. |
| Formulario que enviaría datos sin cifrar | Examinar el destino final de un envío HTTP, también si se realiza mediante JavaScript. Detenerlo antes de salir. Comprobado. | «Este formulario enviaría tus datos sin cifrado HTTPS. Hemos detenido el envío.» | B/D: advertencias y mejoras a HTTPS, con diferencias por motor. T: modo HTTPS-Only y avisos del navegador. |
| Salida fuera de la ruta ULTRA | Política de denegación en la microVM y pasarela; observar intentos DNS, TCP y UDP fuera de Tor. Comprobado. | «Una conexión intentó salir fuera de la ruta ULTRA. La bloqueamos.» | B: la ventana Tor es una función separada y no equivale a Tor Browser. D: no ofrece navegación Tor integrada equivalente. T: configura el tráfico de navegación para Tor, sin narrar normalmente cada intento impedido. |
| Descarga con amenaza conocida | Retener el archivo en la nube; comprobar firmas, reputación y, cuando corresponda, análisis aislado. Comprobado: resultado del detector; la clasificación puede equivocarse. | «El detector ha marcado este archivo como malware conocido. No lo hemos entregado a tu PC.» | B: dispone de protección de navegación/descargas. D: la cobertura debe comprobarse por versión y motor. T: advierte del riesgo de abrir archivos externos; no ofrece una garantía equivalente de análisis antimalware. |
| Phishing conocido | Coincidencia con una fuente de amenazas autorizada, con versión y fecha. Comprobado: inclusión en la fuente, no infalibilidad. | «Esta dirección figura en una fuente de phishing conocido. ZERO ha detenido la apertura.» | B: avisos mediante protección contra sitios peligrosos. D: protección frente a sitios maliciosos, según versión. T: no debe suponerse una cobertura equivalente a Safe Browsing. |
| Cookie de terceros impedida | Registrar Set-Cookie o escritura desde un contexto de terceros y la decisión efectiva del almacén de cookies. Comprobado. | «Un servicio de otra web intentó guardar una cookie aquí. ZERO la rechazó.» | B/D: limitan cookies de terceros. T: utiliza aislamiento por sitio; aislar no equivale a rechazar todas las cookies. |
| Posible subasta de anuncios | Reconocer una petición y campos compatibles con puja publicitaria. Puede estar oculta tras un servidor o un formato opaco. Probable: participación en subasta. | «Esta petición parece participar en una subasta de anuncios. ZERO la bloqueó. No podemos ver quién habría pujado.» | B/D: bloquean parte de la infraestructura mediante protección antirrastreo. T: no bloquea toda publicidad ni ofrece un monitor completo de subastas. |
| Redirecciones encadenadas | Registrar redirecciones HTTP y navegaciones automáticas, con su iniciador. Comprobado: recorrido; probable: rastreo por rebote, si hay señales. | «Antes de llegar aquí, la navegación pasó por {dominios}. Algunos pasos podrían usarse para rastrear.» | B: dispone de defensas frente a determinadas técnicas de rebote. D: elimina ciertos parámetros de seguimiento y aplica otras defensas. T: el aislamiento reduce vínculos, pero no elimina todas las redirecciones. |
| Certificado no válido | Resultado del verificador TLS: caducidad, nombre incorrecto, cadena no confiable, etc. Comprobado. | «No pudimos verificar el certificado de esta web: {motivo}. No hemos abierto la conexión.» | B/D/T: advertencias y bloqueos del motor. Un certificado válido tampoco acredita que el negocio sea honesto. |
| Identificador repetido entre webs | Detectar un mismo valor significativo en solicitudes de contextos distintos. Excluir constantes comunes; conservar preferentemente una representación protegida. Comprobado: repetición; probable: enlace de visitas. | «El mismo identificador apareció al visitar estas dos webs. Podría servir para relacionar tus visitas.» | B/D: bloqueos, aislamiento y limpieza de determinados enlaces. T: aislamiento y Nueva identidad, sin impedir la vinculación si se reutiliza una cuenta o un identificador explícito. |
| Destino situado en un país | Relacionar la IP realmente usada con una base de geolocalización. CDN y anycast introducen incertidumbre. Estimado. | «La IP de destino se sitúa aproximadamente en {país}. Esto no indica dónde se guardarán tus datos.» | B/D: no es un aviso ordinario por solicitud. T: muestra países del circuito; no son necesariamente el país del servidor final ni del almacenamiento. |
| Dato personal dirigido a un tercero | Inspección transitoria de URL, cabeceras y cuerpos legibles antes de enviarlos. Comparación exacta con un dato conocido o detector de patrones. Comprobado para coincidencia exacta; probable para inferencia. | «Esta petición incluía tu correo y se dirigía a {dominio}. ZERO la detuvo antes de enviarla.» | B/D: pueden bloquear el destino o mecanismos conocidos; no debe atribuírseles una inspección semántica universal de todos los envíos. T: Tor no elimina datos personales del contenido. |
| Contenido inseguro dentro de una web HTTPS | Detectar y bloquear contenido activo HTTP en una página HTTPS. Comprobado. | «Esta página intentó cargar un componente sin cifrar. ZERO lo bloqueó.» | B/D/T: los motores ya bloquean determinadas clases de contenido mixto. La diferencia propuesta es explicarlo y documentarlo. |

### Límites que acompañan al catálogo

- Portapapeles local: la web remota no debe recibirlo automáticamente. Pegar, copiar o transferir archivos exige una acción explícita.
- Datos personales: el cifrado realizado por la propia aplicación antes de enviar, formatos desconocidos y canales encubiertos pueden impedir la detección.
- Publicidad: ver una petición no revela toda la distribución posterior de datos entre empresas.
- País y empresa: dominio, operador técnico, propietario corporativo y ubicación son entidades distintas. Si no hay evidencia, mostrar «empresa no verificada».
- Ataques: una violación de permisos, una llamada a canvas o un certificado caducado no demuestran que exista un atacante.

## 3. Tres sistemas diferenciadores

### A. Recibo de corte

Cada bloqueo importante permite abrir un recibo: qué intentó salir o ejecutarse; qué se impidió y en qué punto; regla, fuente y versión utilizadas; qué podría seguir ocurriendo; enlace al registro y exportación al PDF. No inventar el contrafactual: «habría permitido una conexión» es defendible; «habrían robado tu identidad» no.

### B. Prueba de ruta

En ULTRA: la red solo permite las rutas previstas; no depende de que Chromium “se porte bien”. Si cae Tor, … (cortado por el límite de 4.096 tokens)
