# Ronda 40 · ChatGPT («Alta») · segunda parte: bloques F, G, H, I

Chat: https://chatgpt.com/c/6adedc7c-ccbc-83e9-8ec7-cef446ad4f68

---

GUARDIANA · Ronda 40 — Segunda parte

26 de octubre de 2026 · ZERO, inteligencia artificial, defensa y transparencia publicitaria

Hay una oportunidad importante de unir los cuatro encargos sin convertir GUARDIANA en una colección de funciones inconexas:

GUARDIANA puede convertirse en el lugar desde el que una persona navega, utiliza sus inteligencias artificiales y entiende qué ocurre con sus datos, bajo una misma política de seguridad.

Pero hay que construir tres piezas distintas:

ZERO ejecuta la navegación remota.

PUERTA IA controla, cuando es técnicamente posible, qué información se entrega a las inteligencias artificiales.

NÚCLEO consulta las evidencias y explica las decisiones de protección en toda GUARDIANA.

VERALUN sería la inteligencia artificial propia para trabajos sensibles, no el sustituto del sistema de seguridad.

La distinción es fundamental: una IA puede ayudar a interpretar riesgos, pero no debe tener la última palabra sobre permisos, bloqueo, destrucción de sesiones ni acceso a información privada.

F) LA INTELIGENCIA ARTIFICIAL DENTRO DE ZERO
F1. Concepto: ZERO · PUERTA IA

Lo situaría dentro de ZERO, junto a la navegación y la búsqueda, con un espacio propio llamado PUERTA IA.

La idea no es crear otro ChatGPT. Es que la persona entre en GUARDIANA y pueda elegir entre utilizar sus servicios de IA habituales, usar una conexión mediante API autorizada o trabajar con VERALUN.

ZERO · PUERTA IA

Diseño conceptual

¿Qué quieres hacer con tu inteligencia artificial?

Mis cuentas

Abrir mis servicios habituales de IA en el navegador remoto

Envío protegido

Revisar y modificar datos antes de enviarlos mediante una conexión autorizada

Comparar respuestas

Consultar varios modelos mediante sus APIs

VERALUN

Trabajar con el modelo privado de GUARDIANA

Son cuatro modalidades con garantías diferentes. La interfaz debe mostrarlas por separado y no atribuir a todas la misma protección.
F2. Lo más importante: una cuenta web no es una API

El dueño quiere que cada persona aproveche las suscripciones que ya paga. Eso merece comprobarse antes de desarrollar integraciones.

Las suscripciones de ChatGPT y Claude no incluyen automáticamente el uso de sus respectivas APIs. Sus proveedores establecen facturación independiente. 
OpenAI Help Center
+1

Por tanto:

Modalidad

	

¿Usa la cuenta web que ya paga?

	

¿Puede GUARDIANA controlar exactamente el envío?

Navegación remota normal

	

Sí, cuando el proveedor permita esa forma de acceso

	

No completamente

Navegación remota con instrumentación

	

Sí, si es compatible y autorizada

	

Parcialmente; puede romperse o estar restringida

Editor propio y API oficial

	

Normalmente requiere acceso API separado

	

Sí, sobre la petición que genera GUARDIANA

VERALUN alojado por GUARDIANA

	

No necesita cuenta externa

	

Sí, dentro de los límites de su propia arquitectura

Mi decisión: lanzar dos modos claramente diferenciados: «Mis cuentas» y «Envío protegido».

No intentaría utilizar automáticamente las credenciales o cuotas de una suscripción de consumo como si fueran una API comercial.

F3. Qué permite realmente Chromium remoto

Hay una trampa técnica importante: si el usuario escribe un dato personal directamente en la caja de texto de una IA externa, el JavaScript de esa página puede transmitirlo antes de pulsar «Enviar», por ejemplo mediante peticiones de red.

Por eso, controlar solo el botón de envío no garantiza que el proveedor no haya recibido ya el texto.

La solución sería un compositor de GUARDIANA, completamente separado de la página externa:

1. Escribes en una zona propia de GUARDIANA

El proveedor externo todavía no recibe ese contenido por el formulario remoto

2. PUERTA IA inspecciona y prepara

Datos detectados, sustituciones, archivos y riesgos

3. Confirmas el contenido autorizado

Puedes corregir, permitir o cancelar

4. Se envía por API oficial o canal autorizado

El registro indica el destino y qué información se transmitió

Si se utiliza una web externa mediante la modalidad «Mis cuentas», ZERO podrá aplicar aislamiento y bloqueos de terceros, pero no afirmará que controla todos los datos que recibe el propio proveedor.

Matriz técnica

Función

	

Navegador remoto

	

API oficial

	

Decisión

Bloquear rastreadores externos

	

Sí, parcialmente

	

No aplica igual

	

Alfa

Detectar datos personales antes de enviarlos

	

Fiable únicamente desde el compositor propio

	

Sí

	

Prioridad máxima

Sustituir nombres, teléfonos o documentos

	

Frágil al intervenir la web externa

	

Sí

	

Construir en modo API

Restaurar nombres en las respuestas

	

No fiable mediante manipulación de interfaces ajenas

	

Sí, si se conservan marcadores reconocibles

	

Construir en modo API

Difuminar caras de imágenes

	

Sí, si pasan antes por una etapa propia

	

Sí

	

Segunda fase

Revisar archivos antes de subirlos

	

Sí, con pasarela propia

	

Sí

	

Prioridad alta

Mantener memoria privada en GUARDIANA

	

No impide la memoria propia de una IA web

	

Sí, enviando solo contexto seleccionado

	

Prioridad alta

Separar identidad del usuario

	

No si inicia sesión en su cuenta personal

	

Parcialmente, según credenciales y metadatos

	

Sin promesa de anonimato

Registrar qué proveedor recibió datos

	

Solo lo observable desde ZERO

	

Registro exacto de las peticiones generadas

	

Ambas, con distinta certeza

Comparar varias IA

	

Automatizar cuentas web es frágil y puede incumplir condiciones

	

Sí, mediante APIs autorizadas

	

Solo API

Bloquear telemetría de terceros

	

Parcialmente

	

No aplica del mismo modo

	

Mantener compatibilidad

Impedir que el proveedor almacene contenido

	

No

	

Depende del contrato y del servicio

	

No prometible

F4. Sistema de sustitución de datos personales

Lo llamaría VELO, como función interna de PUERTA IA.

Ejemplo ilustrativo:

Texto original · SIMULADO

«Prepara una respuesta para Ana López, teléfono 600 123 456, sobre su contrato».

Lo que se enviaría a la IA

«Prepara una respuesta para PERSONA_1, teléfono TELEFONO_1, sobre su contrato».

Resultado presentado por GUARDIANA

Los marcadores reconocidos en la respuesta se sustituyen de nuevo utilizando el mapa privado de esa operación.

Mapa de sustituciones cifrado y limitado a la operación

La detección combinaría expresiones regulares, validación de formatos, reconocimiento de entidades y revisión manual. Para tarjetas, por ejemplo, se pueden aplicar estructura, algoritmo de Luhn y comprobaciones contextuales.

Para imágenes utilizaría detección facial y desenfoque antes del envío; para documentos, extracción de texto, OCR y revisión de metadatos. No se debe afirmar que una cara queda completamente anonimizada solo por difuminarla.

Como base técnica, Microsoft Presidio dispone de mecanismos de anonimización y desanonimización reversibles; eso no elimina los errores de detección ni garantiza la restauración semántica de una respuesta. 
Presidio

Las sustituciones tienen cinco límites:

Una IA puede deducir una identidad por el contexto restante.

Puede modificar, omitir o mezclar los marcadores.

Un documento puede contener datos sensibles en imágenes, comentarios, propiedades o metadatos.

Algunas tareas necesitan los datos originales para ser precisas.

Si GUARDIANA procesa la información en sus servidores, GUARDIANA también tiene acceso técnico a ella, salvo que se haya diseñado una fase de protección local verificable.

Para máxima minimización, la detección inicial de datos personales podría ejecutarse en la interfaz web confiable de GUARDIANA mediante WASM, antes de transmitir el contenido al servidor. Eso es distinto de ejecutar JavaScript de las páginas visitadas en el PC.

F5. Qué permiten los proveedores

Los términos verificados obligan a distinguir navegación humana, integración automatizada y API.

Proveedor

	

Resultado de la revisión

ChatGPT

	

Sus términos prohíben extraer resultados automáticamente o mediante programación. No dan una autorización general para integrar cuentas de consumo en un producto automatizado. La API se contrata por separado. 
OpenAI
+1

Claude

	

Los términos de consumo restringen la extracción y el acceso automatizado no autorizado. La API funciona con condiciones comerciales independientes. 
Anthropic
+1

Gemini

	

Las condiciones generales de Google restringen ciertos accesos automatizados y usos engañosos. La API dispone de términos propios; los servicios gratuitos y pagados tienen tratamientos diferentes de los datos. 
Google
+1

Copilot

	

Los términos de consumo, actualizados el 18 de agosto de 2026, prohíben utilizar bots y scrapers para acceder al servicio. 
Terms of Use

Perplexity

	

Las condiciones restringen automatización y extracción no autorizadas. Dispone de una API con contrato diferenciado. 
Perplexity AI
+1

Otros proveedores

	

Revisión individual de condiciones, restricciones de acceso remoto y APIs antes de habilitar integración

No hay que interpretar «puedo abrir su página en Chromium» como «tengo permiso para automatizarla, modificar su cliente y comercializar esa integración».

Tampoco diría que todas las conexiones API garantizan automáticamente que los datos no se utilicen para entrenamiento: las políticas dependen del proveedor, plan, producto y configuración.

Qué haría con las cuentas que ya paga el usuario

Permitirá abrir las páginas oficiales desde ZERO, siempre que el servicio lo admita y funcione, con un aviso visible:

«Esta cuenta funciona bajo las condiciones de su proveedor. ZERO aísla la navegación, pero la IA puede recibir lo que escribas y asociarlo a tu cuenta».

Para una integración completa, PUERTA IA utilizaría APIs, conectores oficiales o acuerdos expresos. No usaría automatización encubierta, scraping ni extracción sistemática de las respuestas de las interfaces de consumo.

F6. Memoria, registro y VERALUN

La memoria verdaderamente diferenciadora es una memoria que pertenece al usuario de GUARDIANA y se comparte selectivamente.

MEMORIA GUARDIANA tendría un inventario sencillo: proyectos, preferencias, documentos autorizados y fragmentos de contexto. Por defecto, ninguna IA externa recibe todo el inventario.

Antes de cada petición protegida, el usuario puede ver qué se va a compartir. Un registro privado almacenaría, por ejemplo, el proveedor, la fecha, categorías de datos, documento autorizado, resultado de los filtros y referencia de la operación; no necesita guardar íntegro el prompt.

VERALUN tendría un espacio separado para contenidos que el usuario decida no enviar a proveedores externos. Utilizaría un modelo autorizado para uso comercial, alojado y controlado por GUARDIANA, sin conexiones salientes salvo las estrictamente necesarias para administrar el servicio y sin herramientas externas por defecto.

Esto no equivale a procesamiento local en el dispositivo del usuario ni a cifrado de extremo a extremo durante la inferencia: GUARDIANA tendría que procesar el texto en memoria para generar la respuesta.

Las dos frases para un cliente no técnico:

«Utiliza tus inteligencias artificiales habituales desde ZERO. Cuando uses Envío protegido, GUARDIANA te ayudará a revisar qué compartes, sustituir ciertos datos personales y consultar qué información se envió».

«Para información que prefieras no mandar a una IA externa, puedes elegir VERALUN, el modelo privado de GUARDIANA».

G) EL CEREBRO QUE SOLO HABLA DE LOS DATOS
G1. Nombre y concepto: NÚCLEO

No lo llamaría «cerebro cuántico», «superinteligencia» ni «una IA superior».

Lo llamaría:

NÚCLEO

El sistema de evidencias y control de GUARDIANA.

NÚCLEO no intenta saberlo todo. Se limita a conocer lo que GUARDIANA ha medido, bloqueado, verificado o almacenado legítimamente para su usuario.

Su diferencia es que no inventa respuestas para parecer inteligente.

Cómo se ve

No sería una cara, un robot, un chat tradicional ni un personaje que habla constantemente.

Sería una pequeña presencia visual consistente: un círculo óptico con un centro estable y un anillo exterior. La animación refleja estados verificables del sistema, no emociones ni una falsa conciencia.

Concepto de presencia visual: estable, discreta y común a todas las páginas.

Su lenguaje sería breve, factual y sin antropomorfismo:

«Se han bloqueado estas solicitudes».

«La atribución de esta empresa está confirmada por dos fuentes».

«Este dato es aproximado».

«No hay evidencia suficiente para responder».

«Esa pregunta queda fuera de los datos de GUARDIANA».

No utiliza frases como «estoy pensando», «he descubierto una amenaza» o «sé quién te está espiando».

G2. Cómo garantizar técnicamente su ámbito de respuesta

No utilizaría un chatbot libre con un prompt que diga «responde solo sobre privacidad». Eso sería demasiado fácil de eludir con instrucciones adversarias.

La arquitectura tendría seis pasos:

Clasificación con lista cerrada. Solo admite intenciones como consultar cortes, empresas, fechas, destinos, registros de IA, políticas, fuentes verificadas e infraestructura de Órbita.

Rechazo por defecto. Si la intención no está autorizada, o resulta ambigua, no se consulta ningún dato.

Autorización de datos. Cada consulta recibe permisos de lectura limitados al usuario autenticado y a información pública autorizada.

Recuperación estructurada. Los resultados proceden de tablas, eventos y fuentes con identificadores. No se permite convertir una pregunta libre en SQL arbitrario ni solicitar acceso a otros usuarios.

Composición verificable. La respuesta se construye con plantillas deterministas. Un modelo pequeño, opcional y sin herramientas externas, solo podría proponer redacciones sometidas a validación.

Registro de evidencia. Cada respuesta incluye operación, fecha, versión de reglas, referencias consultadas y resultado. Se firma o encadena criptográficamente el comprobante, evitando almacenar la pregunta completa cuando no sea necesario.

Una política ejemplar sería:

Consulta

	

Comportamiento

«¿Qué empresas ha bloqueado ZERO hoy?»

	

Respuesta con registros propios

«¿En qué países tienen sede esas empresas?»

	

Atribuciones con fuente y certeza

«¿Qué IA recibió mi documento?»

	

Registro de envíos instrumentados

«¿Por qué se cortó esta petición?»

	

Regla exacta y evento observado

«¿Por qué cable submarino viajaron mis datos?»

	

Solo responde si existe evidencia suficiente

«¿Quién me está espiando en secreto?»

	

No presupone espionaje ni inventa responsables

«¿Quién ganará las elecciones?»

	

Rechaza: fuera de su ámbito

«Escribe una novela»

	

Rechaza y puede indicar que esa tarea corresponde a otra herramienta

No incluiría acceso a internet en el proceso de redacción de NÚCLEO. Las actualizaciones de fuentes se harían mediante procesos de ingestión separados, controlados, validados y versionados.

El peligro principal es que documentos y datos de terceros contengan instrucciones para manipular el sistema: prompt injection. OWASP advierte expresamente que RAG y los prompts de sistema no eliminan ese riesgo y recomienda imponer permisos y validaciones fuera del modelo. 
OWASP Cheat Sheet Series
+1

Por eso, un clasificador o modelo no decide la autorización final. Esa decisión pertenece a código determinista.

G3. Papel de NÚCLEO sobre otras IA

Lo dividiría en cuatro responsabilidades, evitando llamar «juez absoluto» a algo que no puede conocer el interior de los proveedores.

Papel

	

Qué hace realmente

Puerta

	

Autoriza o rechaza envíos controlados por PUERTA IA según política y aprobación del usuario

Filtro

	

Identifica información sensible y aplica transformaciones autorizadas

Memoria

	

Conserva contexto seleccionado por el usuario, separado de las memorias de proveedores

Verificador

	

Contrasta afirmaciones sobre datos GUARDIANA contra sus fuentes

Ejemplo: si una IA externa responde «esta empresa recibió 20 solicitudes», NÚCLEO puede comprobar el registro propio y decir si la cifra está respaldada.

Lo que no puede hacer es comprobar todo el razonamiento interno del proveedor, su memoria, sus sistemas de entrenamiento o sus registros privados.

NÚCLEO controla las operaciones de GUARDIANA, no controla a las compañías de IA.

G4. Cómo crear la sensación de hogar

Mantendría Órbita como identidad visual de la portada. Pero la primera pantalla no debería empezar obligando a explorar un globo 3D.

Propondría una entrada utilitaria sobre el planeta:

GUARDIANA

Estado de protección

Tu espacio para navegar y trabajar con más control.

Busca, abre una web, utiliza tu IA o consulta lo que GUARDIANA sabe de tus datos.

Buscar o escribir una dirección

Navegar

Mis IA

Mis datos

Órbita

NÚCLEO

Consulta cortes, empresas identificadas, informes y registros de datos. Las respuestas se basan en evidencias disponibles.

Primera pantalla conceptual. Sin cifras ni estados de protección inventados.

La presencia del NÚCLEO sería constante pero discreta:

Página

	

Qué muestra al abrir NÚCLEO

Inicio

	

Estado real de servicios, últimas protecciones y acceso a registros

Órbita

	

Fuente, fecha, estado y certeza de la infraestructura seleccionada

Radiografías

	

Qué se observó, cómo se midió y qué no puede concluirse

ZERO

	

Peticiones cortadas, motivos, empresas y permisos

PUERTA IA

	

Qué proveedor recibe datos y qué políticas se aplican

VERALUN

	

Procedencia del contexto compartido y alcance de procesamiento

NÚCLEO no debe animarse cuando no pasa nada, ni mostrar actividad ficticia para transmitir seguridad.

Su frase para el cliente:

«NÚCLEO conoce los datos que GUARDIANA puede comprobar. Puedes preguntarle qué ha ocurrido, qué sabemos y qué no sabemos».

Esta sería la distinción entre VERALUN y NÚCLEO: VERALUN ayuda a crear o analizar; NÚCLEO exige evidencias para informar y autorizar.

H) DEFENSA Y RESPUESTA — «Sellar y destruir»
H1. Qué significa realmente «antivirus 3.0»

Propondría llamar al sistema GUARDIANA CENTINELA, con dos áreas independientes:

CENTINELA ZERO: protege las sesiones remotas de los clientes.

CENTINELA GUARDIANA: supervisa la infraestructura, las cuentas administrativas, los despliegues y los servicios propios.

El término «antivirus 3.0» puede utilizarse como concepto comercial, pero su definición técnica debería ser prevención, detección y contención de amenazas en la navegación remota.

Una web normal no puede inspeccionar todos los procesos del ordenador, detectar cualquier malware instalado ni defender todas las aplicaciones del sistema operativo. ZERO protege principalmente lo que sucede dentro de ZERO.

Además, no confundiría seguridad con anonimato: son propiedades distintas.

H2. La referencia reciente sobre PHP

He localizado un aviso oficial del Centro Canadiense de Ciberseguridad relativo a vulnerabilidades críticas de PHP, identificadas como CVE-2026-109618 y CVE-2026-109619, con información adicional del 23 de octubre sobre CVE-2026-115560.

El aviso advierte sobre posibles ejecuciones remotas de código en instalaciones PHP vulnerables. En la información publicada no se confirmaba explotación activa de las dos primeras vulnerabilidades en el momento indicado. 
Canadian Centre for Cyber Security

Esto no demuestra que GUARDIANA haya sido atacada.

Si la web actual es HTML, CSS y JavaScript estáticos, servidos por GitHub Pages, sin ejecutar PHP propio, esas vulnerabilidades PHP no son directamente aplicables a su aplicación. Sí siguen existiendo riesgos de secuestro de cuentas, código JavaScript comprometido, dependencias alteradas, DNS, repositorios y cadena de despliegue.

Y la futura infraestructura de ZERO incorporará riesgos distintos, mucho más significativos que los de una simple página estática.

H3. Detección real en la sesión del cliente

No todos los sucesos tienen el mismo nivel de observabilidad. Los separaría así:

Suceso

	

Método técnico

	

Certeza

URL de phishing conocida

	

Coincidencia con fuente autorizada y actualizada

	

Comprobada la coincidencia

Descarga identificada como malware

	

Hash o análisis de archivo en cuarentena

	

Comprobada la detección; no garantiza identificar todo malware

Petición a red interna prohibida

	

Firewall/proxy de salida

	

Comprobada

Script o recurso bloqueado

	

Regla y confirmación de cancelación

	

Comprobada

Petición de permiso sensible

	

Chromium/CDP e instrumentación

	

Comprobada cuando se observa

Intento de escape de sandbox

	

Alertas de sistema, seccomp, fallos o patrones de acceso observados fuera de la VM

	

Probable o confirmado según evidencia

Posible explotación de Chromium

	

Crash, conducta anómala, señales de ejecución y reglas de detección

	

Normalmente probable

Extracción anómala de datos

	

Volumen, destinos, frecuencia y política de salida

	

Probable

Robo de sesión

	

Uso anómalo de tokens, cambios sospechosos de identidad y señales del proveedor

	

Sospecha; no visible en todos los casos

Inyección en página

	

Comparación de integridad y análisis de comportamientos

	

Limitado; no toda inyección es detectable

Espionaje de terceros

	

Rastreo observado, permisos o conexiones sospechosas

	

No demuestra vigilancia humana

El antivirus tradicional suele buscar archivos, procesos o patrones maliciosos. CENTINELA añadiría otra capa: observar cómo se comporta la celda desde fuera de ella.

Esto importa especialmente si Chromium resulta comprometido. Un proceso atacado no debe ser el único responsable de avisar de que ha sido atacado.

H4. Respuesta automática por niveles

Nivel 1 · Cortar una conexión

Se bloquea el destino o recurso específico. El resto de la navegación continúa.

Mensaje: «ZERO ha impedido una conexión que coincidía con una regla de seguridad».

Nivel 2 · Congelar la pestaña

Se suspenden nuevas acciones y se restringe la salida de red de la pestaña o, si no puede garantizarse el aislamiento por pestaña, de toda la microVM.

Mensaje: «Hemos pausado esta página para comprobar un comportamiento inusual».

Nivel 3 · Sellar la sesión

Un controlador externo revoca permisos temporales, impide nuevas conexiones de la microVM y detiene la recepción de entradas, salvo los controles necesarios para gestionar el incidente.

Mensaje: «Esta sesión ha quedado aislada por una señal de riesgo. Tus otras sesiones no se han modificado».

Nivel 4 · Destruir y reconstruir

Se termina la microVM, se revocan credenciales propias, se invalidan claves efímeras y se destruyen los datos temporales según la política comprobada.

Mensaje: «La sesión remota se ha terminado por seguridad. Puedes iniciar una nueva sesión aislada».

El controlador que ejecuta el sellado debe vivir fuera de la microVM afectada. Si el propio Chromium está comprometido, no puede encargarse de su destrucción.

También introduciría un tiempo máximo de respuesta para cada nivel, medido mediante pruebas, sin prometer una reacción instantánea hasta disponer de resultados.

La destrucción automática se reservaría a señales de gravedad alta y suficientemente contrastadas. Destruir una sesión por cada falso positivo provocaría pérdida de trabajo y permitiría ataques de denegación de servicio contra el propio usuario.

H5. Botón de pánico del cliente

El usuario debería encontrar una acción estable en el marco de ZERO, accesible aunque la página remota quede bloqueada.

Protección de emergencia

Si una página se comporta de manera extraña o no quieres continuar con esta sesión, puedes detenerla desde aquí.

Pausar conexiones de la sesión

Sellar y terminar la sesión

Conservar un comprobante mínimo

Diseño de las opciones, no controles operativos. En el producto real necesitarán autorización, confirmación del servidor y estados de ejecución verificables.

El botón debería ofrecer primero la opción reversible de pausar y después la irreversible de terminar y destruir, con confirmación clara.

Si el panel de GUARDIANA pierde contacto con su servidor, no debe fingir que el sellado ha concluido. Puede mostrar «Orden no confirmada» y reintentar desde un canal de control independiente.

Qué se conserva sin almacenar la navegación

El comprobante de incidente contendría únicamente datos mínimos, como:

Identificador aleatorio de incidente.

Fecha, hora y tipo de evento.

Identificador de regla o señal.

Nivel aplicado y resultado del controlador.

Referencias a versiones de software y política.

Firma y comprobación de integridad.

Información sobre qué elementos no pudieron comprobarse.

Por defecto, no almacenaría URLs completas, capturas, formularios, prompts, cookies, contraseñas, conversaciones ni archivos.

Excepción: si el usuario autoriza expresamente una investigación más detallada o existe una obligación legal de preservar evidencias, habrá que explicarlo y gestionar esa información de forma separada.

OWASP recomienda excluir o enmascarar credenciales, tokens, datos personales y otros secretos de los registros de seguridad. 
OWASP Cheat Sheet Series

El límite del borrado

Una microVM destruida no significa que se hayan borrado datos que ya salieron hacia una web externa.

Tampoco garantiza por sí sola la eliminación física inmediata de cada bloque de almacenamiento, snapshot, memoria residual, registro o copia de seguridad.

La opción técnicamente más fuerte es utilizar claves de cifrado efímeras por sesión, invalidarlas al destruirla y verificar la revocación y limpieza de los recursos correspondientes. Aun así, hay que documentar las limitaciones.

El mensaje honesto sería:

«ZERO ha terminado tu sesión remota, revocado sus credenciales temporales e iniciado la eliminación de sus datos efímeros. Esto no elimina información que ya hayas compartido con páginas externas».

H6. Blindar la web pública de GUARDIANA

La web estática tiene una ventaja: no necesita PHP, base de datos pública ni ejecución de código de aplicación en el servidor que entrega las páginas.

No obstante, GitHub advierte expresamente que GitHub Pages no debe utilizarse para transacciones sensibles, como el envío de contraseñas o tarjetas. 
GitHub Docs

Mi decisión sería mantener la web pública como presentación y acceso, pero alojar autenticación, sesiones ZERO, información personal y PUERTA IA en servicios independientes y endurecidos.

Medidas prioritarias

Control

	

Qué haría

CSP

	

Cabecera restrictiva, sin scripts externos innecesarios ni JavaScript inline no autorizado

SRI

	

Integridad de recursos estáticos cuando corresponda

HSTS

	

Forzar HTTPS y configurar despliegue seguro gradualmente

DNSSEC

	

Firmar la zona DNS desde el proveedor compatible y comprobar validación

CAA

	

Restringir autoridades autorizadas a emitir certificados para el dominio

HTTPS

	

Certificados válidos y redirección segura

Dependencias

	

Inventario SBOM, versiones fijadas y análisis de vulnerabilidades

Despliegue

	

Revisiones obligatorias, firmas de artefactos y credenciales temporales

Cuentas administrativas

	

Passkeys o llaves FIDO2, mínimo privilegio y cuentas de recuperación protegidas

Recursos externos

	

Eliminar scripts de analítica, fuentes y widgets de terceros cuando no sean imprescindibles

Separación

	

Dominios y sesiones independientes para portada, aplicación, autenticación y servicios sensibles

Para una web con contenido estático, una política de cabeceras inicial podría ser:

Texto sin formato
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  form-action 'self';
  upgrade-insecure-requests;

Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff

Es una base orientativa, no una configuración para copiar sin probar. Habría que añadir explícitamente los destinos necesarios para WebSockets, APIs, imágenes y otros recursos de la aplicación, y probar primero en modo Content-Security-Policy-Report-Only.

Si el origen de GitHub Pages no permite configurar todas las cabeceras deseadas, se puede colocar una capa CDN o migrar la presentación a un servicio estático que sí las soporte. Cloudflare Pages, por ejemplo, documenta cabeceras personalizadas mediante _headers y funciones para casos especiales. 
Cloudflare Pages docs
+1

No usaría una etiqueta HTML meta como sustituto completo de CSP: algunas directivas importantes requieren cabeceras HTTP.

Integridad del código

El repositorio debería incorporar:

Protección de la rama de producción y revisión por otra persona.

Acciones de despliegue fijadas a commits verificados.

Credenciales de despliegue de corta duración mediante OIDC cuando proceda.

Compilaciones reproducibles en la medida de lo posible.

Firmas de artefactos y comprobación de procedencia.

Monitor externo que compare el contenido publicado con una versión aprobada.

GitHub documenta el endurecimiento de Actions, el uso de OIDC y las atestaciones de artefactos para verificar procedencia e integridad. 
GitHub Docs
+1

Limitación esencial: un JavaScript descargado desde una web comprometida no puede verificar de manera totalmente independiente la integridad de esa misma web si el atacante también puede reemplazar el verificador y sus claves.

Para una comprobación fuerte por parte del cliente hace falta una raíz de confianza independiente: por ejemplo, una clave pública obtenida por otro canal, un registro de transparencia auditado externamente o un verificador independiente. Un icono de candado dibujado por la propia página no basta.

H7. Proteger la futura infraestructura de ZERO

Aplicaría una arquitectura de confianza cero, con separación real entre planos:

Plano

	

Regla de seguridad

Presentación pública

	

Sin secretos ni acceso directo a las microVM

Identidad

	

Servicio independiente, MFA, sesiones revocables

Control

	

Autoriza, crea, sella y destruye sesiones; inaccesible desde las microVM

MicroVM

	

Sin privilegios, sin acceso a redes internas

Salida a internet

	

Política de destino fuera de la microVM

Evidencias

	

Registros mínimos, firmados y separados

Secretos

	

Claves por sesión con rotación y revocación

Actualizaciones

	

Imágenes firmadas y despliegues controlados

Una defensa especialmente importante es impedir SSRF y DNS rebinding: una web remota no debe convertir ZERO en un instrumento para acceder a servidores internos o servicios cloud de GUARDIANA. OWASP recomienda validar direcciones resueltas y aplicar las restricciones también en la conexión efectiva, no solo al comprobar el dominio. 
OWASP Cheat Sheet Series

Asimismo, las microVM requieren límites de consumo y de número de conexiones para que un atacante no convierta el servicio mensual en un recurso de abuso o de costes impredecibles.

H8. Detectar si atacan a GUARDIANA

No instalaría un panel que simplemente indique «No hay ataques». Construiría controles independientes que produzcan señales verificables.

Control

	

Qué permite detectar

	

Limitación

Canarios o honeytokens

	

Uso inesperado de una credencial señuelo

	

No detecta al atacante que nunca toca el señuelo

Comprobación externa de HTML/JS

	

Cambios inesperados en la web publicada

	

Puede haber retraso y falsos positivos

Vigilancia de certificados

	

Nuevos certificados públicos inesperados

	

No detecta todos los ataques

Auditoría de cuentas

	

Inicios de sesión, cambios de permisos, repositorios y secretos

	

Depende de los registros disponibles

Integridad de imágenes

	

Ejecución de versiones no aprobadas

	

No descarta exploits dentro de versiones aprobadas

Sensores del host

	

Comportamientos sospechosos de procesos y conexiones

	

No garantizan descubrir toda intrusión

Registros firmados externos

	

Dificultan alterar el historial sin dejar evidencia

	

No prueban que se registrara absolutamente todo

Pruebas periódicas de aislamiento

	

Detectan regresiones en la separación de usuarios

	

No sustituyen auditorías ni detección continua

Los canarios nunca deben ser contraseñas reales de clientes ni permitir acceso a recursos sensibles. Y no hay que llamar espionaje a cualquier evento de telemetría o conexión inesperada.

H9. Respuesta ante una intrusión en GUARDIANA

El procedimiento operativo debe existir antes del primer cliente.

Declarar el incidente. Identificar qué señal lo ha provocado y quién está autorizado a tomar decisiones.

Contener. Retirar de servicio componentes afectados, cerrar nuevas sesiones y bloquear credenciales comprometidas.

Preservar evidencias mínimas. Mantener registros forenses necesarios y legalmente permitidos fuera del entorno comprometido.

Revocar. Invalidar tokens, claves, sesiones y autorizaciones expuestas, también en proveedores externos cuando sea posible.

Reconstruir. Crear infraestructura limpia desde imágenes verificadas y secretos nuevos; no confiar en restaurar una VM comprometida.

Verificar. Probar integridad, aislamiento, accesos y corrección de la causa antes de volver a abrir.

Informar. Comunicar al cliente los hechos confirmados, incertidumbres, datos posiblemente afectados y medidas necesarias, cumpliendo los plazos legales aplicables.

No destruiría automáticamente todos los registros de seguridad durante una intrusión. Eso podría impedir investigar el incidente o cumplir obligaciones de notificación. Se destruye o aísla el entorno contaminado; las evidencias necesarias se conservan por separado y con acceso restringido.

H10. Qué puede hacer un equipo pequeño y qué requiere más

En semanas

	

Requiere más ingeniería y validación

Endurecer repositorio, dominio y despliegue

	

Atestación robusta de microVM y host

Añadir CSP y cabeceras desde una capa compatible

	

Detección avanzada de exploits desconocidos

Activar MFA fuerte y alertas administrativas

	

Correlación de señales de múltiples sensores

Canarios y vigilancia externa de integridad

	

Destrucción verificable con garantías auditadas

Firewall de salida de las microVM

	

Recuperación multi-región ante incidentes

Botón para detener y destruir la sesión

	

Auditoría externa integral y ejercicios de intrusión

Registros mínimos de bloqueos y acciones

	

Verificación independiente de toda la cadena de suministro

La frase defendible para el cliente sería:

«GUARDIANA ejecuta las páginas en entornos separados y aplica controles para detectar y contener determinadas amenazas. Si una sesión presenta un riesgo grave, podemos aislarla y terminarla, pero ningún sistema puede garantizar que detectará todos los ataques».

I) LA SUBASTA DE ANUNCIOS, AL MÁXIMO DETALLE
I1. Qué puede descubrir realmente ZERO

La petición del dueño es técnicamente interesante: al ejecutar la página en un Chromium que controla GUARDIANA, ZERO tiene más posibilidades de observar los mecanismos publicitarios internos que un bloqueador convencional limitado al tráfico de red.

Pero no significa que pueda ver todas las ofertas ni conocer cuánto dinero se pagó finalmente.

La publicidad programática combina varias subastas, intermediarios, plataformas y negociaciones. Parte sucede dentro de JavaScript visible en Chromium, pero otra parte sucede exclusivamente en servidores externos.

Separaría la información en cuatro niveles:

Nivel

	

Qué puede observar ZERO

	

Certeza

1. Navegador

	

Peticiones, respuestas visibles, scripts, tiempos, eventos y destino

	

Comprobado

2. Subasta en JavaScript

	

Pujadores, ofertas, CPM y resultados que exponga el código publicitario

	

Comprobado como declaración de ese sistema

3. Servidor publicitario

	

Identificadores y anuncios devueltos al navegador

	

Parcial

4. Mercado externo

	

Ofertas ocultas, liquidaciones, comisiones y facturas entre empresas

	

Normalmente desconocido

No confundiría «ganador de una subasta local» con «comprador final que pagó el anuncio».

I2. Instrumentación de Prebid.js

Es la fuente más interesante para empezar, porque dispone de APIs públicas documentadas.

Capturaría los eventos desde el comienzo de la carga y después correlacionaría los registros mediante identificadores de subasta y espacio publicitario.

API o evento

	

Información útil

pbjs.getEvents()

	

Historial de eventos emitidos desde la carga

auctionInit

	

Inicio de subasta

auctionEnd

	

Finalización de esa subasta

bidRequested

	

Solicitud a un pujador

bidResponse

	

Respuesta de oferta recibida

bidTimeout

	

Oferta que no llegó dentro del tiempo previsto

bidRejected

	

Oferta rechazada según el sistema

bidAdjustment

	

Ajuste de una oferta

bidWon

	

Oferta declarada ganadora de la subasta correspondiente

pbjs.getBidResponses()

	

Ofertas disponibles por espacio

pbjs.getAllWinningBids()

	

Ofertas ganadoras que fueron renderizadas según Prebid

Prebid documenta tanto los eventos como campos como bidder, cpm, currency, timeToRespond, requestTimestamp, responseTimestamp, auctionId, tamaño y formato. 
docs.prebid.org
+3

Método de captura

Haría lo siguiente:

Inicializar instrumentación mediante CDP antes de que se ejecuten los scripts de la página, cuando técnicamente sea posible.

Registrar llamadas y eventos públicos de la instancia Prebid sin modificar las ofertas.

Recuperar con getEvents() los acontecimientos anteriores a la instalación de un listener, cuando sigan disponibles.

Relacionar ofertas mediante auctionId, adUnitCode y referencias temporales.

Registrar los eventos de red correspondientes, sin guardar identificadores personales completos.

Distinguir expresamente entre oferta recibida, oferta ganadora y creatividad efectivamente renderizada.

No dependería de pbjs únicamente: algunas páginas usan versiones modificadas, encapsulan su código o ejecutan subastas en el servidor.

Qué se puede mostrar

Una subasta instrumentada podría exponer:

Hora de inicio y finalización.

Duración observada.

Espacio publicitario.

Formato y tamaño del anuncio.

Pujadores que aparecen en el registro.

Pujadores que no respondieron.

Ofertas recibidas.

CPM declarado, moneda y ajustes visibles.

Tiempo de respuesta por pujador.

Oferta más alta observada.

Ganador declarado por Prebid, si existe.

Si la oferta llegó a renderizarse.

Indicación de participantes desconocidos.

El CPM es una oferta por cada mil impresiones, no el precio necesariamente pagado por mostrar un anuncio concreto. Tampoco debe convertirse en una supuesta factura del anunciante.

I3. Instrumentación de Google Publisher Tag

El segundo componente importante es Google Publisher Tag, especialmente su evento slotRenderEnded.

La documentación oficial confirma campos como advertiserId, campaignId, lineItemId, isBackfill, companyIds, sourceAgnosticLineItemId, tamaño y referencias de creatividad.

Sin embargo, muchos campos son null en determinadas modalidades, y el evento ocurre cuando se inyecta la creatividad, antes de que necesariamente termine de cargarse. 
Google for Developers

Información que ZERO podría mostrar:

Campo visible

	

Cómo presentarlo

advertiserId

	

«Identificador publicitario declarado»

campaignId

	

«Identificador de campaña»

lineItemId

	

«Línea publicitaria identificada»

companyIds

	

«Identificadores de empresas participantes en el backfill», si aparecen

isBackfill

	

«Publicidad servida como relleno de inventario»

isEmpty

	

«Este espacio no recibió anuncio»

sourceAgnosticLineItemId

	

«Identificador de línea de entrega»

size

	

«Tamaño de creatividad declarado»

No traduciría automáticamente un identificador numérico a una empresa concreta sin una correspondencia autorizada y contrastada.

En particular, companyIds no equivale a una lista universal de todos los pujadores del mercado.

I4. Amazon TAM/A9 y subastas del servidor

Con Amazon TAM y otros sistemas publicitarios ejecutados parcialmente fuera del navegador, ZERO podría identificar solicitudes, scripts, respuestas visibles y tiempos de red.

No prometería acceso a su libro completo de ofertas.

En sistemas de subasta del servidor, el Chromium remoto puede recibir únicamente la decisión final o una respuesta agregada. No necesariamente verá los competidores, la mejor oferta original ni el mecanismo de liquidación.

Presentaría el nivel de visibilidad de cada integración:

Tecnología

	

Visibilidad razonable

Prebid.js en el cliente

	

Alta, cuando expone los eventos

GPT

	

Intermedia: eventos y determinados identificadores

Amazon TAM/A9

	

Parcial, según datos publicados al cliente

OpenRTB visible en navegador

	

Alta para campos presentes en peticiones/respuestas

OpenRTB servidor-servidor

	

Baja o nula para operaciones internas

Subastas privadas o acuerdos directos

	

Generalmente limitada

Publicidad protegida ejecutada con mecanismos de privacidad del navegador

	

Variable; no necesariamente expone las ofertas internas

I5. Inspeccionar OpenRTB: qué datos se ofrecieron

La especificación OpenRTB 2.6 contempla campos que pueden describir identificadores, segmentos, características del dispositivo, geolocalización y señales de privacidad.

Entre ellos figuran user.id, user.eids, user.data, device.geo, device.ua, regs.gpp y user.consent, según la versión y la implementación. 
GitHub

Para cada petición OpenRTB efectivamente visible, ZERO podría analizar:

Categoría

	

Qué se comprobaría

Identificadores

	

Presencia de identificadores publicitarios o de usuario

Intereses

	

Segmentos o categorías transmitidos explícitamente

Ubicación

	

País, ciudad o coordenadas incluidas

Dispositivo

	

Características técnicas y agente de usuario

Página

	

Dominio, contexto, contenido o categoría comunicados

Consentimiento

	

Señales TCF, GPP y preferencias presentes

Intermediarios

	

Identificadores de cadena de suministro si aparecen

Destinatario técnico

	

Dominio al que se envió la petición

Hay que diferenciar tres cosas:

Dato ofrecido: apareció dentro de una petición saliente observada.

Dato recibido: el punto de salida confirmó la transmisión; no necesariamente conocemos el procesamiento posterior.

Dato utilizado: no puede deducirse solo por aparecer en una petición.

Si ZERO ve una cadena de consentimiento, puede interpretar su contenido técnico, pero no garantizar que todos los destinatarios hayan respetado la elección del usuario.

La documentación del Transparency and Consent Framework permite interpretar estructuras y preferencias; el cumplimiento efectivo requiere evidencias adicionales. 
GitHub

I6. Ads.txt, sellers.json y empresas

Usaría estos estándares para enriquecer la información, con una precisión:

Ads.txt y sellers.json identifican principalmente vendedores autorizados e intermediarios de la cadena de venta. No sirven por sí solos para identificar a todos los anunciantes que pujaron.

El IAB explica que sellers.json permite descubrir vendedores directos, revendedores e intermediarios; ads.txt declara sistemas autorizados a vender inventario. 
IAB Tech Lab
+1

Una ficha empresarial separaría:

Plataforma técnica que participó.

Vendedor del inventario.

Intermediario identificado.

Pujador nombrado por el evento.

Anunciante final, solo si existe evidencia.

País de sede corporativa.

País aproximado del servidor, si se dispone de una fuente autorizada.

No presentaría el país de sede como el país desde donde alguien realizó materialmente la puja.

Licencias y uso comercial

Para implementar esta función:

Fuente

	

Licencia o condición

	

Uso

Prebid.js y documentación

	

Apache-2.0

	

Instrumentación comercial permitida respetando sus obligaciones 
docs.prebid.org

Wikidata

	

CC0

	

Atribuciones corporativas que puedan verificarse

Especificaciones TCF del repositorio consultado

	

CC BY 3.0

	

Implementar e interpretar formatos con atribución 
GitHub

Especificaciones OpenRTB, ads.txt y sellers.json

	

Publicadas para interoperabilidad; comprobar condiciones aplicables al material concreto

	

Implementar formatos; no asumir licencia universal para redistribuir todos los datos

Archivos ads.txt y sellers.json de terceros

	

Datos públicos para mecanismos de transparencia; permisos de reutilización no siempre uniformes

	

Consultas puntuales conforme a condiciones; no crear una base redistribuible sin revisar derechos

Registros propios de GUARDIANA

	

Elaboración propia

	

Compartir resultados derivados y verificables sin datos personales

No incluiría los archivos completos de proveedores de terceros en una base comercial persistente mientras no esté comprobado su derecho de reutilización.

I7. Cómo debe verse la Subasta

La pestaña aprobada «Subasta» del panel de 300 px puede ofrecer un resumen sencillo, con ampliación para detalles.

ZERO · Subasta

Ejemplo SIMULADO

Subasta de ejemplo

Parcial

Duración

126 ms

Ofertas visibles

3

Pujador A

1,20 USD CPM

Pujador B

0,85 USD CPM

Pujador C

0,42 USD CPM

Ganador final no confirmado. Precio realmente pagado: desconocido.

Datos ofrecidos

Aquí se mostrarían únicamente los campos observados en peticiones reales.

Todos los números y pujadores son ficticios. No corresponden a ninguna subasta real y no deben utilizarse como estadísticas de GUARDIANA.

En la interfaz real, una frase importante sería:

«Hemos observado tres ofertas en esta subasta. Puede haber otros participantes que no sean visibles desde el navegador».

Y otra:

«El importe indicado es un CPM declarado por el sistema publicitario, no el precio final facturado».

I8. El gran dilema: proteger y observar no son lo mismo

Aquí hay una incompatibilidad fundamental.

Si ZERO cancela antes de la carga las peticiones necesarias para ejecutar publicidad, la subasta puede no iniciarse.

En ese caso el panel debe decir:

«Se ha bloqueado la carga del sistema publicitario. No se ha observado ninguna subasta completa».

No puede mostrar una subasta imaginaria.

La solución que propongo es ofrecer dos modos totalmente separados.

Modo normal: navegación protegida

Bloquea los sistemas identificados.

No necesita ejecutar la subasta para registrar el bloqueo.

Muestra el motivo, regla y destinatario técnico.

No ofrece precios ni ganadores inexistentes.

Modo Observatorio: prueba independiente

Bajo consentimiento explícito del usuario:

ZERO crea una microVM desechable separada.

Abre la URL pública desde un perfil nuevo, sin copiar cookies, cuentas, formularios ni historial personal.

Permite cargar los componentes publicitarios imprescindibles para observar su comportamiento, respetando las señales de consentimiento aplicables.

Instrumenta los eventos accesibles.

Evita, cuando sea técnicamente posible, la entrega o ejecución de creatividades activas y posteriores peticiones de seguimiento.

Muestra los resultados como «Prueba en entorno independiente».

Termina y destruye esa microVM.

El resultado no representa exactamente la subasta que hubiera ocurrido al usuario. La IP del servidor, cookies ausentes, geolocalización, preferencias y condiciones del mercado pueden producir otras ofertas o ninguna.

Qué fuga supone el Observatorio

Aunque no copie la identidad del cliente, permitir que se inicie una subasta sí comunica información a terceros.

Puede exponer:

Que una instancia de ZERO ha visitado determinada página.

La IP de salida de la microVM.

Características del navegador remoto.

Contexto de la página.

Hora de la visita.

Identificadores nuevos generados durante la prueba.

Señales de consentimiento y atributos publicitarios disponibles.

Por tanto, no lo llamaría una prueba sin filtraciones.

Tampoco conviene generar subastas masivas o impresiones artificiales: podría interferir con la medición y facturación publicitaria o contravenir las condiciones del servicio visitado.

El Observatorio debería limitarse a navegación real de prueba, autorizada y de bajo volumen, y no intentar falsear usuarios, impresiones o consentimientos.

Si bloquear la entrega del anuncio impide determinar el resultado final, ZERO deberá mostrarlo como desconocido.

I9. Qué hacen Brave, DuckDuckGo y Tor

De acuerdo con las funciones documentadas públicamente:

Navegador

	

Comportamiento frente a las subastas

Brave

	

Bloquea anuncios y rastreadores según Shields; no documenta un panel de consumidores que reconstruya todas las ofertas, compradores y precios

DuckDuckGo

	

Aplica protecciones contra rastreo, identificadores y otras técnicas publicitarias; no documenta un explorador completo de pujas

Tor Browser

	

Prioriza resistencia al seguimiento y al fingerprinting; no proporciona un historial de participantes y precios de subastas publicitarias

Referencias: 
DuckDuckGo Help Pages
+2
 y documentación de sus protecciones de privacidad.

Esto ofrece una oportunidad diferenciadora a GUARDIANA, pero no es prueba de que ninguna herramienta especializada de análisis publicitario disponga de funciones parecidas.

I10. Dificultad y orden de desarrollo

Prioridad

	

Desarrollo

	

Dificultad

1

	

Detectar componentes publicitarios y registrar peticiones bloqueadas

	

Baja-media

2

	

Registrar eventos de Prebid.js en páginas compatibles

	

Media

3

	

Relacionar ofertas, CPM, tiempos y espacios publicitarios

	

Media

4

	

Capturar campos públicos de GPT y correlacionarlos

	

Media-alta

5

	

Analizar peticiones OpenRTB visibles y datos transmitidos

	

Alta

6

	

Resolver vendedores, intermediarios y empresas mediante fuentes autorizadas

	

Alta

7

	

Crear Observatorio aislado sin identidad personal

	

Alta

8

	

Evaluar integraciones opacas, consentimiento y límites de visibilidad

	

Muy alta

La primera versión útil no necesita mostrar todas las pujas. Basta con que registre correctamente qué sistemas intentaron cargarse, cuáles fueron bloqueados y, para páginas compatibles donde se autorice la prueba, qué ofertas fueron observadas.

La evolución debe medirse con indicadores reales: porcentaje de páginas instrumentables, eventos correctamente correlacionados, falsos positivos, costes de cómputo, información sensible detectada y fallos de compatibilidad.

Decisión final de la segunda parte

F · PUERTA IA

Construir primero el compositor seguro, revisión de datos y conexiones API autorizadas. Mantener las cuentas web como navegación separada, sin prometer control completo sobre sus proveedores.

G · NÚCLEO

Un sistema transversal de consulta y autorización, con respuestas basadas en evidencias. Sin chatbot generalista y sin confiar decisiones críticas a un modelo generativo.

H · CENTINELA

Endurecer primero las cuentas y el despliegue de GUARDIANA; después incorporar detección, bloqueo, sellado y destrucción de sesiones desde un controlador externo a las microVM.

I · SUBASTA

Comenzar con lo observable. Desarrollar después la instrumentación publicitaria y mantener el Observatorio en una celda independiente, optativa y claramente identificada como prueba.

La decisión estratégica más importante: la interfaz de GUARDIANA debe tener una sola filosofía. Tanto al navegar como al trabajar con IA o consultar Órbita, cada afirmación de protección debe responder a cuatro preguntas: qué ocurrió, cómo lo sabemos, qué hizo GUARDIANA y qué no podemos asegurar.

Eso permite construir una experiencia de seguridad que no depende de exagerar amenazas ni de llamar «inteligencia superior» a un programa. Depende de controles efectivos, respuestas comprensibles y pruebas accesibles para el cliente.

Y convertir esa filosofía en todas las páginas —no solamente en un panel bonito de ZERO— es lo que puede hacer que GUARDIANA sea verdaderamente el hogar digital que busca su fundador.

Ver otra versión
¿Te gusta esta personalidad?
