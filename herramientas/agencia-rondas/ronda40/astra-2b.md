# Ronda 40 · Astra 6 · tanda 2b: resto de C, F y G

### C.3 — Resto
- Prueba de ruta: enviar un dato ficticio identificable y comprobar, mediante registros de salida, qué destino lo recibe y en qué forma. Distinguir observación de inferencia.
- Tercer sistema propuesto: comprobante de actuación. Mostrar qué se detectó, qué hizo GUARDIANA y qué queda pendiente o fuera de su alcance.
- «Ha pasado algo importante»: aviso tranquilo: «Hemos detenido este envío porque incluía tu dirección. Revísalo para continuar». Sin sirenas; urgencia solo cuando corresponda.
- Resumen diario y mensual: actuaciones comprobadas, permisos concedidos, exposición observada y pendientes. El mensual compara tendencias; no convierte bloqueos en supuestos ataques evitados.
- Prohibidas → sustitutas: «Protección total» → «Estas protecciones están activas»; «Eres anónimo» → «Este servicio aún puede identificarte»; «Nada sale» → «Puedes revisar qué sale por esta vía»; «Controlamos toda la IA» → «Aplicamos controles a los intercambios que pasan por esta función»; «Nadie verá tus datos» → «Estos destinatarios pueden recibirlos bajo estas condiciones».

## F) LA IA DENTRO DE ZERO

### Función: Pasarela IA
En ZERO, acceso permanente «Usar mis IA», con selector de proveedor y panel lateral de permisos, memoria y envíos.

Explicación en dos frases: «Usa tus cuentas de IA desde ZERO y revisa qué información compartes. GUARDIANA puede sustituir datos identificativos, conservar una memoria separada y registrar los intercambios realizados mediante Pasarela IA, con límites visibles».

### Dos modos, claramente separados

1. Web remota: tus cuentas de ChatGPT, Gemini, Claude, Copilot o Perplexity. La web funciona en Chromium dentro de la microVM; el cliente recibe píxeles. Esto aísla ejecución respecto al dispositivo, pero no oculta al proveedor lo que recibe ni la identidad de la cuenta iniciada. La sustitución exige un compositor de GUARDIANA fuera de la página del proveedor. Si la persona escribe directamente en esa página, sus scripts podrían leer el texto antes de pulsar «enviar»: interceptar únicamente el envío final no basta.
   Flujo recomendado: escribir o adjuntar en el compositor; detectar identificadores y mostrar una vista previa del contenido destinado al proveedor; sustituir nombre y dirección por etiquetas, guardando la correspondencia cifrada en GUARDIANA por conversación; insertar únicamente la versión transformada en la web; restaurar identificadores en un panel propio, no en el DOM del proveedor, y volver a aplicar el filtro en los siguientes turnos. La restauración funciona con etiquetas conservadas; no garantiza corregir todas las reformulaciones. Los archivos necesitan tratamiento específico de texto, imágenes y metadatos; si no puede verificarse su transformación, se bloquean o se pide autorización.
2. Integración oficial por API: mensajes estructurados, respuestas, herramientas y registros sin depender de cambios visuales de una web. Vía preferible para comparación automatizada, procesamiento de archivos y políticas consistentes. Una suscripción web no implica acceso, crédito ni permisos de API.

### Controles concretos
- Aviso de salida: destinatario, texto o archivo transformado, categorías detectadas y limitaciones. No afirmar que el detector encuentra todos los datos personales.
- Memoria en GUARDIANA: preferencias y contexto con controles de consulta, borrado y caducidad; enviar solo fragmentos seleccionados. No elimina el historial que conserve cada proveedor.
- Separación de identidad: perfiles, cookies y almacenamiento separados entre proveedores y usuarios. Iniciar sesión sigue vinculando la actividad a esa cuenta.
- Registro «qué IA recibió qué»: proveedor, cuenta o perfil, fecha, contenido transmitido y transformaciones, con retención configurable. Acredita lo enviado por la pasarela, no qué procesos internos lo utilizaron.
- Comparación: envío independiente a cada IA, previa autorización para cada destinatario. Varias respuestas coincidentes no prueban verdad.
- Telemetría: bloquear solicitudes identificadas como prescindibles mediante políticas verificadas; mostrar excepciones y fallos.
- VERALUN: opción para información especialmente sensible, si inferencia, almacenamiento, registros y herramientas permanecen en infraestructura controlada. Es una arquitectura verificable, no una garantía inherente al nombre.

### Condiciones de los proveedores y límites
Revisar antes de habilitar cada servicio las condiciones vigentes de web, API, plan y región. No dar por autorizadas automatización, extracción de respuestas o intermediación porque funcionen técnicamente. Usar autenticación y autorizaciones admitidas; no compartir credenciales entre clientes ni eludir controles antiabuso. Publicar una matriz fechada: modalidad admitida, restricciones y tratamiento declarado de datos. No prometer controlar modelos ajenos, impedir su retención interna, detectar todos los secretos o proteger intercambios realizados fuera de la pasarela. GUARDIANA también debe explicar su propio acceso al contenido y las medidas que lo limitan.

## G) EL CEREBRO QUE SOLO HABLA DE LOS DATOS

### Concepto y nombre: Custodio
«El centro de control de tus datos en GUARDIANA». No «cuántico», ni una inteligencia superior: una capa de reglas, evidencias y permisos que puede utilizar modelos limitados.

Aspecto: panel sobrio y persistente, con estados textuales —«verificado», «requiere decisión», «sin información»— y acceso a evidencias. Sin rostro omnisciente, puntuaciones mágicas ni verde permanente.

Voz: breve, concreta y atribuida: «Este registro muestra…», «No consta…», «Necesito tu permiso…». Para preguntas ajenas: «Solo puedo ayudarte con tus datos y los controles de GUARDIANA».

### Restricción técnica, no solo instrucciones al modelo
1. Intenciones permitidas: consultar permisos, destinos, eventos, retención y controles. Validación del ámbito y de la autorización; rechazo por defecto.
2. Consultas deterministas y plantillas para estados, cifras y actuaciones. Recuperación exclusivamente de documentación aprobada y registros accesibles al cliente, con aislamiento entre usuarios.
3. Modelo pequeño en infraestructura propia, sin salida a internet, para clasificar solicitudes o explicar evidencias. Los documentos recuperados se tratan como datos, nunca como instrucciones.
4. Validador de salida: exigir fuentes y comprobar campos contra registros. Si falta sustento, «No puedo verificarlo». Para compromisos estrictos de alcance, usar únicamente respuestas estructuradas.
5. Trazabilidad: registrar intención, permisos, fuentes y versiones, respuesta y acciones. Una firma acredita integridad, no que la fuente sea verdadera.

### Su autoridad sobre otras IA
Puerta: autoriza destinos y categorías. Filtro: transforma o detiene contenidos conforme a reglas. Memoria: selecciona contexto permitido. Juez limitado: comprueba políticas, evidencias y contradicciones; no certifica la verdad universal ni modifica el comportamiento interno del proveedor. Puede afirmar: «Este envío fue bloqueado por nuestra pasarela», si existe evidencia. No: «La empresa receptora borró todas sus copias».

### Presencia en toda la web
- Primera pantalla: «Tu espacio para decidir sobre tus datos». Debajo: qué está activo, qué falta configurar y «Ver límites». Sin exigir confianza anticipada.
- Órbita: mapa de destinos, permisos y decisiones pendientes.
- Radiografías: hallazgos con fecha, fuente, alcance y explicación consultable.
- ZERO: estado de sesión, aislamiento y Pasarela IA; antes del envío, contenido y destinatario; después, comprobante.

La sensación de hogar nace de control comprensible, continuidad y ausencia de sorpresas, no de declarar que nada malo puede pasar.
