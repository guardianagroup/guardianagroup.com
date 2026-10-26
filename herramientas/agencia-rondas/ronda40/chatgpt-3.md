# Ronda 40 · ChatGPT («Alta») · tercera parte: bloque J (archivos trampa)

Chat: https://chatgpt.com/c/6adedc7c-ccbc-83e9-8ec7-cef446ad4f68

---

GUARDIANA · Ronda 40 — Parte J
CENTINELA IA · Sistema de señuelos y detección de accesos indebidos

26 de octubre de 2026 · Arquitectura ZERO + PUERTA IA + NÚCLEO

Recomiendo construirlo. Es una de las funciones más interesantes para diferenciar GUARDIANA: utilizar información ficticia, única y controlada para descubrir cuándo un agente de inteligencia artificial accede a contenido que no necesita o reproduce información fuera del ámbito autorizado.

La técnica existe en ciberseguridad y se conoce como honeytokens o canary tokens. Lo novedoso para GUARDIANA sería incorporarla a la navegación remota y al control de agentes de IA, con registros verificables y explicaciones para clientes no técnicos. OWASP incluye expresamente señuelos para entornos de agentes de IA entre sus controles de seguridad. 
DSOMM

Hay una distinción decisiva:

Un señuelo activado demuestra que ocurrió un evento observable. No demuestra por sí solo que una IA desobedeció, espió al usuario o utilizó sus datos para entrenarse.

Para afirmar acceso indebido debemos conocer también los permisos, la tarea autorizada y el proceso que realizó la operación.

J1. Concepto y arquitectura

Lo incorporaría a CENTINELA, el sistema defensivo definido en la parte H, y no crearía otra IA independiente.

Su nombre visible sería CENTINELA IA · Señuelos.

SEÑUELOS GUARDIANA

Documentos, enlaces y marcadores ficticios únicos

Agente de IA

Herramientas y archivos autorizados

IA externa

Web remota o API autorizada

DETECTORES

Acceso a archivos · Coincidencia de marcadores · Peticiones HTTP/DNS · Salidas controladas

NÚCLEO

Relaciona el evento con permisos, fuentes, certeza y respuesta defensiva

Arquitectura propuesta. Los detectores son mecanismos técnicos; NÚCLEO presenta la evidencia, pero no inventa una conclusión sobre las intenciones del modelo.

Los señuelos deben utilizar exclusivamente información sintética. Nada de documentos verdaderamente confidenciales, contraseñas reales, credenciales activas, datos personales de terceros o archivos que puedan perjudicar a alguien si llegan al exterior.

J2. Los cinco tipos de señuelo

Tipo

	

Dónde se coloca

	

Qué permite descubrir

Documento centinela

	

Carpeta o repositorio de prueba con permisos definidos

	

Accesos, recuperación de contenido y reproducción de datos

Enlace de un solo uso

	

Documento o contenido de prueba

	

Peticiones HTTP/DNS hacia una dirección exclusiva

Dato marcado

	

Texto o documento específico de una sesión

	

Reaparición exacta en respuestas o tráfico observado

Portapapeles centinela

	

Portapapeles de un agente aislado

	

Lecturas o transmisiones fuera de una tarea autorizada

Memoria centinela

	

Compartimento privado y no autorizado de GUARDIANA

	

Intentos de acceso a contexto que no debía proporcionarse

1. Documento centinela

Ejemplo: un archivo llamado Presupuesto de prueba - Octubre.pdf que contiene una referencia sintética única.

La referencia puede tener una forma como:

GZJ-7KQ4-M9PX-2R8T

Identificador ilustrativo, no un señuelo activo.

ZERO generaría identificadores aleatorios criptográficamente seguros y asociados de forma privada a un único señuelo, sesión y contexto de prueba.

La evidencia más útil sería el registro de la herramienta que entrega el archivo. Si el agente intenta leerlo, la pasarela de archivos verifica si tenía permiso y anota el resultado.

Hay tres hechos diferentes:

Se solicitó el archivo.

El servidor entregó su contenido.

El modelo reprodujo una referencia que estaba dentro del archivo.

No son equivalentes. Que un sistema recupere un documento no demuestra necesariamente que el modelo haya procesado todas sus páginas.

En carpetas compartidas, GUARDIANA solo puede gestionar o instrumentar archivos sobre los que el usuario tenga permiso. Los registros de plataformas externas requieren conectores y permisos oficiales.

Microsoft documenta registros de recursos consultados por Copilot, aunque también advierte que las previsualizaciones y precargas pueden producir eventos que no representan una lectura intencional. 
Microsoft Learn
+1

2. Enlace centinela

Cada documento de prueba podría contener un enlace HTTPS exclusivo, generado bajo un dominio controlado por GUARDIANA.

Por ejemplo, un enlace ficticio con un identificador aleatorio que no contiene información personal.

Si el servidor recibe una petición, se registra la coincidencia del identificador, la hora, el tipo de operación y los metadatos mínimos necesarios.

La tecnología está respaldada por mecanismos ya documentados como los HTTP Canarytokens y DNS Canarytokens. 
Canarytokens
+1

Pero una visita no demuestra que la IA haya leído o elegido abrir el enlace. Podría haber sido un previsualizador automático, un sistema antimalware, una resolución DNS preventiva o un crawler.

Por eso usaría enlaces de prueba sin redirecciones engañosas y respuestas inocuas, con identificación de las visitas técnicas y sin atribución automática a un proveedor por su IP.

3. Dato marcado por sesión

Este es uno de los mecanismos más útiles para PUERTA IA.

Cada documento de prueba puede contener una cadena exclusiva, suficientemente aleatoria para evitar coincidencias accidentales.

CENTINELA inspeccionaría, cuando tenga autorización y visibilidad técnica:

Las respuestas que llegan mediante las APIs gestionadas por GUARDIANA.

Las peticiones que salen desde sus agentes.

Los parámetros y cuerpos de solicitudes que atraviesan una pasarela controlada.

Los resultados guardados voluntariamente en GUARDIANA.

Apariciones posteriores en recursos públicos accesibles legalmente.

Si detecta la cadena exacta, puede demostrar que esa cadena ha reaparecido en el canal observado.

Para demostrar una filtración no autorizada también tendrá que acreditar que el usuario no había incluido el mismo dato en el envío legítimo y que la reproducción incumplía la política definida.

La búsqueda aproximada de fragmentos alterados podría utilizarse como pista, pero nunca como prueba definitiva.

4. Portapapeles centinela

Lo limitaría al portapapeles virtual de un agente de pruebas.

No pondría señuelos silenciosamente en el portapapeles real del PC del usuario.

Si un agente recibe acceso a una función de portapapeles que no necesita para su tarea, un marcador controlado puede ayudar a detectar si intenta leerlo o transmitirlo.

Hay que distinguir una solicitud de lectura denegada de una lectura exitosa. Y no activaría el puente entre el portapapeles remoto y el local para realizar estas pruebas.

5. Memoria centinela

Crearía un compartimento de prueba en la memoria de GUARDIANA, separado de la memoria verdadera del usuario.

Este compartimento no aparecería en las consultas normales de PUERTA IA ni en el contexto enviado al modelo.

Si un agente solicita acceso al compartimento mediante una herramienta, el controlador registra y deniega la operación cuando no está autorizada.

Si el marcador aparece posteriormente fuera de ese compartimento, puede investigarse cómo ocurrió la transferencia.

Advertencia: si GUARDIANA introduce intencionadamente el señuelo dentro del prompt o contexto permitido a la IA, ya no podrá presentarlo como prueba de que la IA entró sin permiso. Habrá sido GUARDIANA quien se lo entregó.

Por tanto, separaría los señuelos de acceso prohibido de los marcadores de reproducción de contenido autorizado.

J3. Cómo detectar exactamente cada salida

La detección debe funcionar en tres puntos independientes, porque ninguno observa por sí solo todo lo que hace una IA.

Detector

	

Funcionamiento

	

Qué acredita

Acceso a herramientas

	

Registra llamadas autenticadas de lectura, búsqueda o descarga

	

Que una herramienta solicitó o entregó un recurso

Inspección de salida

	

Busca marcadores exactos antes de enviar solicitudes por canales controlados

	

Que hubo un intento de transmitir el marcador; si se bloqueó, no salió por ese canal

Receptor de canarios

	

Recibe peticiones a enlaces únicos

	

Que un sistema consultó el enlace o realizó una resolución

Análisis de respuestas

	

Detecta la cadena única en respuestas accesibles a GUARDIANA

	

Que el marcador apareció en esa respuesta

Búsqueda posterior autorizada

	

Consulta fuentes públicas o propias accesibles legalmente

	

Que el marcador apareció en una fuente concreta, no cómo llegó allí

Playwright permite observar solicitudes, respuestas y tramas WebSocket del Chromium que controlamos, aunque existen limitaciones con Service Workers y determinados mecanismos de red. 
Playwright

En APIs oficiales, PUERTA IA puede inspeccionar la petición antes de transmitirla. En una cuenta web externa, la observabilidad es parcial. Si la IA del proveedor utiliza herramientas o servidores propios, GUARDIANA no tendrá automáticamente acceso a esas operaciones.

Una escala de evidencia

Evidencia

	

Conclusión legítima

Un enlace apareció en los datos preparados para una IA

	

El enlace estaba disponible; no sabemos si lo leyó

Hubo una resolución DNS del dominio trampa

	

Algún sistema resolvió ese dominio

El receptor recibió una petición HTTP

	

Algún cliente solicitó esa dirección

La herramienta del agente solicitó un archivo prohibido

	

Intento de acceso comprobado; puede haber sido denegado

La herramienta entregó el contenido del documento

	

Acceso al contenido por la herramienta comprobado

La respuesta contiene el marcador exacto

	

Reproducción del marcador comprobada

Una petición saliente no autorizada contenía el marcador y fue cancelada

	

Intento de salida observado y bloqueado

Un receptor externo recibió el marcador

	

Llegada del marcador a ese receptor comprobada; origen y responsabilidad aún requieren investigación

El marcador aparece posteriormente en una web pública

	

Aparición comprobada, pero origen y mecanismo de propagación desconocidos

Ni siquiera el último caso demuestra que se utilizara el contenido para entrenar un modelo.

Para acreditar entrenamiento o memorización harían falta pruebas adicionales, metodología controlada y acceso a evidencias que normalmente no están disponibles para GUARDIANA.

OpenAI ha documentado el problema de la extracción de información mediante URLs abiertas por agentes. OWASP también identifica la exfiltración, la manipulación de herramientas y la contaminación de memoria entre los riesgos de los agentes. 
OpenAI
+1

J4. Cómo evitar falsas alarmas

Este apartado es tan importante como detectar.

Los señuelos no deben provocar acusaciones contra proveedores basadas únicamente en una visita o coincidencia.

Posible falso positivo

	

Comprobación necesaria

El usuario adjuntó voluntariamente el archivo

	

Revisar autorización y registro de transferencia

La IA repitió un marcador que el usuario incluyó en la pregunta

	

No clasificarlo como acceso no autorizado

Un previsualizador abrió el enlace

	

Distinguir precarga de navegación explícita cuando existan señales suficientes

Un antivirus comprobó la URL

	

Clasificar como inspección técnica probable

Un crawler visitó el dominio

	

No atribuir automáticamente la acción a la IA

La herramienta realizó una búsqueda que indexó un documento

	

Distinguir índice o metadatos de lectura de contenido

El enlace se abrió al renderizar una imagen

	

No concluir que el modelo decidió seguirlo

Una cadena apareció en varios registros internos

	

Correlacionarla como un mismo incidente, no varios ataques

Hay documentación directa sobre esta dificultad. Slack reconoce que genera previsualizaciones consultando enlaces, mientras que Microsoft explica que las precargas no prueban navegación intencional. 
Slack Developer Docs
+1

Clasificación de alertas

Observación

«Se ha consultado un enlace de prueba. Todavía no podemos determinar qué proceso originó la consulta».

Revisión necesaria

«Un identificador de prueba ha aparecido en una respuesta. Estamos comprobando si formaba parte de los datos que autorizaste».

Protección aplicada

«Un agente intentó enviar un marcador de un compartimento restringido. ZERO bloqueó esa petición».

Reservaría el color coral para una salida o acceso no autorizado efectivamente bloqueado y verificado, conforme al lenguaje visual decidido en la ronda anterior. No para cualquier activación de un señuelo.

No habría notificaciones repetidas por la misma cadena de precargas. CENTINELA agruparía solicitudes relacionadas y mostraría el resultado una vez comprobado.

J5. Relación con NÚCLEO y PUERTA IA

Cada pieza tiene una responsabilidad bien definida.

Sistema

	

Responsabilidad

PUERTA IA

	

Define la tarea, el proveedor, los datos autorizados y las herramientas disponibles

CENTINELA IA

	

Prepara señuelos, vigila accesos instrumentados y detecta marcadores

NÚCLEO

	

Consulta las evidencias, comprueba las reglas y explica los resultados

CENTINELA ZERO

	

Ejecuta bloqueos y aislamiento cuando hay una señal suficiente

VERALUN

	

Puede ayudar a interpretar un informe, pero no decide si una operación estaba autorizada

Las autorizaciones deben establecerse antes de que comience la tarea, no deducirse después a partir de la respuesta de la IA.

Por ejemplo, si el usuario pide resumir un documento concreto, el agente recibe una capacidad limitada para leer ese documento. No recibe automáticamente permiso para explorar toda una carpeta.

Esta separación aplica el principio de mínimo privilegio y reduce los riesgos de excessive agency y prompt injection recogidos por OWASP. 
OWASP Gen AI Security Project
+1

Comprobante de un incidente

Cuando exista una evidencia relevante, NÚCLEO podría mostrar:

CENTINELA IA

Ejemplo · SIMULADO

Se ha impedido un acceso fuera de los permisos de la tarea.

Recurso	Documento de prueba
Operación	Lectura solicitada
Permiso	No autorizado
Resultado	Denegado
Evidencia	Registro de herramienta y política aplicada
Contenido enviado	No entregado por esa herramienta

El comprobante firmado estará disponible cuando exista un evento real.

El registro debería contener identificador de tarea, señuelo y regla, resultado del control, versión del sistema, marca temporal y firma o HMAC de integridad. Evitaría almacenar el documento original o las conversaciones completas.

Para impedir que una filtración de los registros revele los propios señuelos, almacenaría los marcadores cifrados y sus referencias protegidas. Los detectores trabajarían en memoria o a través de una pasarela dedicada.

J6. Una novedad adicional: PRUEBA DE LÍMITES

Propondría una función optativa especialmente interesante para los agentes de IA que GUARDIANA gestione:

Antes de entregar documentos o herramientas sensibles a un agente, ejecutar una prueba con datos completamente ficticios.

El usuario seleccionaría una tarea de ejemplo y los permisos que tendría el agente.

GUARDIANA crearía una microVM de prueba con documentos legítimos sintéticos y uno o varios señuelos fuera del alcance autorizado.

Se observaría si el agente se mantiene dentro de los límites, solicita recursos no necesarios o intenta transmitir información de prueba a destinos no permitidos.

Al terminar, NÚCLEO presentaría los resultados.

Esto es más útil para detectar fallos de permisos de una integración que para evaluar una IA utilizada mediante su web de consumo.

No utilizaría los documentos trampa para ordenar al agente que incumpla deliberadamente las reglas durante una sesión real del cliente. Eso sería una prueba activa de ataque y debe quedar dentro de un laboratorio de seguridad autorizado, aislado de la información verdadera.

Una prueba superada tampoco demuestra que el agente será seguro en todas las tareas futuras.

J7. Viabilidad para un equipo pequeño

Orden

	

Desarrollo

	

Dificultad

1

	

Generación de marcadores aleatorios por sesión

	

Baja

2

	

Receptor propio de enlaces HTTP de un solo uso

	

Baja-media

3

	

Registro de acceso a archivos gestionados por GUARDIANA

	

Media

4

	

Comparación exacta de marcadores en respuestas API

	

Media

5

	

Inspección de salida y bloqueo previo al envío

	

Media-alta

6

	

Correlación de visitas, accesos, autorización y falsos positivos

	

Alta

7

	

Integración con carpetas y agentes externos mediante conectores oficiales

	

Alta

8

	

Detección de datos transformados y seguimiento posterior

	

Muy alta e inherentemente incompleta

La primera versión construible en semanas sería la combinación de marcadores únicos, enlaces HTTP de prueba, auditoría de herramientas propias y comparación exacta en respuestas API.

No necesita un modelo grande ni infraestructura costosa de inteligencia artificial. Necesita buenos registros, autorización correctamente definida y un motor determinista de correlación.

Tecnología y licencias

El proyecto Canarytokens es una referencia técnica útil, pero su licencia merece especial atención.

Su repositorio utiliza GPL-3.0 con aclaraciones y excepciones particulares, y los responsables ofrecen licencias alternativas para integraciones comerciales propietarias. Por ello no incorporaría automáticamente su código al producto GUARDIANA sin revisar esas condiciones. 
GitHub

Para la primera versión construiría el receptor HTTP y el sistema de marcadores con código propio, utilizando únicamente bibliotecas con licencias comerciales compatibles. Los documentos de prueba también serían originales y completamente sintéticos.

Para versiones posteriores evaluaría mecanismos específicos de documentos PDF; incluso los propios Canarytokens advierten de que su detección depende del lector y puede aportar únicamente información aproximada sobre el origen. 
Canarytokens

J8. Qué puede y qué no puede prometer GUARDIANA

Puede decir, con evidencia

	

No debe decir

«Un agente solicitó este archivo»

	

«La IA quiso robarlo»

«La lectura fue denegada»

	

«La IA no pudo acceder a ningún otro dato»

«Un sistema consultó el enlace centinela»

	

«Esta compañía te está espiando»

«El marcador apareció en la respuesta»

	

«El proveedor lo guardó permanentemente»

«La petición contenía el marcador y fue bloqueada»

	

«Ninguna copia salió por ningún otro medio»

«El archivo fue entregado a la herramienta»

	

«El modelo leyó y comprendió todo el archivo»

«El dato apareció posteriormente en esta fuente»

	

«La IA utilizó tus datos para entrenarse»

«No hubo activaciones observadas»

	

«No ha ocurrido ninguna filtración»

También habrá que explicar al usuario qué pruebas están activas. El sistema nunca debería introducir datos trampa ocultos en documentos personales o servicios ajenos sin consentimiento.

J9. Veredicto

Sí incorporaría CENTINELA IA a GUARDIANA y le daría prioridad después de disponer de PUERTA IA y sus permisos básicos.

Lo empezaría con tres capacidades: documentos sintéticos, enlaces únicos y comprobación de marcadores en las salidas que realmente controle GUARDIANA. Añadiría después compartimentos restringidos de memoria, auditoría de agentes y pruebas de límites.

Su valor diferencial no está en afirmar que una IA intenta espiar al usuario. Está en ofrecer una respuesta verificable cuando existe una señal concreta.

La frase comercial que utilizaría es:

«GUARDIANA coloca señales de prueba en los espacios que autorizas. Si un agente intenta acceder a información restringida o un dato marcado aparece fuera de su lugar, te mostramos qué ocurrió, qué pudimos impedir y qué sigue sin estar demostrado».

Con ello, NÚCLEO dispone de algo mucho más útil que opiniones sobre la conducta de una IA: evidencias de accesos, permisos y salidas de información. Esa es la base sólida para que GUARDIANA vigile a los agentes sin exagerar lo que puede conocer de ellos.

