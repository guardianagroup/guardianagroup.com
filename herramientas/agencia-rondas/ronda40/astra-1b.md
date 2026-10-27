# Ronda 40 · Astra 6 · tanda 1b: continuación de B y el veredicto D

### B) SEGURIDAD — continuación

Criterio: los veredictos describen capacidades del diseño, no funciones de ZERO ya verificadas. «Iguala» exige implementación y pruebas; «supera por naturaleza» se limita a la separación respecto al dispositivo. Brave, DuckDuckGo y Tor varían según versión, plataforma y configuración. Aquí, DuckDuckGo significa su navegador.

| Protección | Frente a Brave, DuckDuckGo y Tor | Veredicto para ZERO y motivo |
|---|---|---|
| Huella digital | Brave introduce variaciones en ciertos atributos; DuckDuckGo limita técnicas conocidas; Tor busca uniformidad entre usuarios. | Iguala, condicionado. Puede uniformar el entorno remoto y ocultar características locales. No garantiza una huella idéntica: influyen versiones, viewport, idioma, sesiones y comportamiento. Ser remoto no basta. |
| Aislamiento de primera parte / partición | Los tres incorporan barreras al seguimiento entre sitios, con mecanismos y coberturas distintos. | Iguala, si se implementa. Una microVM por pestaña separa pestañas, pero no necesariamente los terceros dentro de ella. Hace falta particionar estado por sitio superior y controlar excepciones. |
| Letterboxing | Tor limita la singularidad del tamaño visible mediante dimensiones agrupadas y márgenes. No es una prestación equivalente general de Brave o DuckDuckGo. | Iguala. ZERO puede usar resoluciones remotas agrupadas y escalar la imagen localmente. Redimensionar el Chromium remoto siguiendo exactamente la ventana del cliente reintroduciría información. |
| Niveles de seguridad de Tor | Tor ofrece niveles que restringen JavaScript y otras funciones; Brave y DuckDuckGo no reproducen ese modelo exacto. | No puede dar equivalencia directa con Tor. Chromium puede tener perfiles restrictivos, pero no hereda las garantías ni el endurecimiento de Tor Browser. |
| Ocultación de IP y circuito Tor | Brave y DuckDuckGo no ocultan por sí solos la IP en navegación ordinaria. Brave dispone de ventanas Tor en determinadas plataformas; no equivalen a Tor Browser. Tor usa circuitos de varios saltos. | Iguala la ocultación ante el sitio, si no hay fugas; no puede dar circuito Tor sin integrarlo. El sitio ve la salida remota; GUARDIANA puede conocer la conexión del cliente. |
| Bloqueo de scripts | Brave permite bloquear scripts; Tor combina NoScript y niveles de seguridad. DuckDuckGo bloquea rastreadores, no todo JavaScript. | Iguala, con políticas reales. Ejecutar scripts lejos protege el dispositivo, pero no impide seguimiento, fraude o acciones dentro de una sesión autenticada. |
| Malware y descargas | Los navegadores locales emplean sandbox y diversas comprobaciones; Tor no convierte las descargas en inocuas. | Supera por naturaleza en separación del dispositivo, si solo llegan píxeles. Un exploit web afecta inicialmente al entorno remoto. Exportar archivos reabre el riesgo; también deben protegerse cliente, hipervisor y canal de imagen. |
| Anti-phishing | Brave y DuckDuckGo ofrecen protecciones contra sitios maliciosos; Tor no debe tratarse como un filtro equivalente. | Iguala, si añade detección y avisos. La distancia no impide entregar contraseñas a un impostor. Una página fraudulenta sigue siéndolo en imagen. |
| Cookies | Los tres restringen cookies o seguimiento entre sitios de distintas maneras. | Iguala. Necesita reglas para terceros, partición, caducidad y borrado. Una VM desechable no ayuda si el perfil se restaura indefinidamente. |
| Referer | Sus motores y políticas limitan información de procedencia según contexto; no eliminan toda referencia. | Iguala. Puede reducirla o suprimirla, con posibles incompatibilidades. Debe hacerlo dentro del navegador, antes del envío HTTPS. |
| Parámetros de URL | Brave y DuckDuckGo eliminan determinados parámetros de seguimiento; Tor no ofrece una limpieza universal. | Iguala. Requiere reglas mantenidas y excepciones: borrar cualquier parámetro puede romper enlaces y autenticación. |
| Debouncing / rebotes | Brave incorpora mitigaciones específicas; DuckDuckGo tiene defensas contra seguimiento mediante redirecciones, según plataforma. Tor no elimina todo rebote. | Iguala. Puede saltar intermediarios conocidos y purgar su estado; debe distinguirlos de pagos, acceso federado y redirecciones legítimas. |
| CNAME cloaking | Brave y DuckDuckGo tienen defensas específicas con alcance dependiente de plataforma. Tor no es un bloqueador equivalente de estos rastreadores. | Iguala. El backend puede inspeccionar cadenas DNS y aplicar reglas. El aislamiento remoto no identifica por sí solo un rastreador disfrazado de subdominio propio. |
| Almacenamiento efímero de terceros | Brave incluye mecanismos efímeros; DuckDuckGo y Tor combinan bloqueo, partición y borrado, sin equivalencia exacta. | Iguala. Debe limitar cookies, almacenamiento y otros estados de terceros por sitio y duración. Destruir la pestaña no controla lo ya transmitido. |
| GPC | Brave y DuckDuckGo permiten emitir esta señal. No debe presumirse una configuración equivalente en Tor. | Iguala. Emitir cabecera y propiedad JavaScript coherentes es viable. GPC expresa una preferencia con efectos jurídicos donde corresponda; no bloquea técnicamente al receptor. |

### Tres sistemas novedosos apoyados en la ejecución remota

No son técnicas universalmente exclusivas de ZERO; lo distintivo es ofrecerlas sin ejecutar la web potencialmente hostil en el dispositivo.

1. Pestaña-celda desechable
- Protege: limita persistencia y propagación entre pestañas mediante microVM, perfil y permisos separados; destrucción al cerrar.
- No protege: datos ya enviados, abuso de cuentas ni escapes del aislamiento. Compartir perfiles o credenciales debilita la separación.
- Frase al cliente: «Cada pestaña trabaja en un entorno remoto separado que se elimina al terminar».

2. Cámara de inspección de enlaces y archivos
- Protege: abre contenido sospechoso en otra celda, sin cookies ni credenciales de la sesión, entregando una vista rasterizada; el original queda retenido hasta una exportación explícita.
- No protege: engaños visibles, malware no detectado ni archivos posteriormente ejecutados en local. Abrir un enlace también puede confirmar al remitente que fue visitado.
- Frase al cliente: «Puedes inspeccionar contenido sospechoso sin abrir el original en tu equipo».

3. Flota de apariencia común y salida compartida
- Protege: desacopla la huella del hardware local y dificulta asociar una IP de salida con un único cliente; exige configuraciones agrupadas y evitar filtraciones locales.
- No protege: identificación por cuenta, comportamiento, correlación temporal o registros del operador. No promete anonimato Tor.
- Frase al cliente: «La web ve un entorno remoto estandarizado y una salida compartida, no directamente tu dispositivo».

### D) VEREDICTO

1. Cerrar y comprobar la frontera cliente–web. Auditar canal de píxeles, cliente, portapapeles, audio, permisos, descargas y conexiones directas.
   Pasa a ser real: «la web corre fuera» se convierte en un límite técnico verificable, no en una pantalla remota.
2. Implantar microVM y ciclo de vida por pestaña. Probar separación de perfiles, red interna, secretos, almacenamiento y destrucción; documentar persistencias voluntarias.
   Pasa a ser real: «desechable» significa ausencia comprobada de estado reutilizado, con excepciones explícitas.
3. Controlar entradas peligrosas y exportaciones. Desplegar cámara de inspección, advertencias anti-phishing y exportación deliberada de originales.
   Pasa a ser real: la protección no termina cuando aparece un enlace o una descarga.
4. Construir la privacidad verificable. Partición, limpieza de URLs, controles de rastreo, GPC, resoluciones agrupadas y pruebas de fugas; medir uniformidad sin afirmar identidad total.
   Pasa a ser real: la tabla deja de describir posibilidades y muestra funciones comprobadas.
5. Reducir y demostrar la confianza exigida al operador. Minimizar registros, fijar retención, restringir accesos, auditar infraestructura y publicar límites y resultados.
   Pasa a ser real: ZERO deja de limitarse a trasladar el riesgo al servidor y ofrece controles verificables sobre ese nuevo punto de confianza.
