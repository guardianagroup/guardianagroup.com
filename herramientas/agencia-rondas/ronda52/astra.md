# Astra (gpt-6-astra, Cheaper Inference Playground) — ronda 52, parte 1 (A–D, cortada en D por el límite de 4096 tokens). Resumen fiel de su texto (27 Oct 2026, 08:40 Bogotá).

Idea: NÚCLEO como capa común de consulta, explicación y navegación, no un chatbot que ocupe la web. Tres principios: los datos los calcula el sistema y el modelo los explica; NÚCLEO acompaña las pantallas, no las sustituye; «en directo» siempre con hora y estado.

A) Diseño
- Entrada principal bajo el planeta de Órbita + acceso «NÚCLEO» en la cabecera de las tres secciones que abre el mismo panel lateral; sabe en qué sección estás («Estás consultando: ZERO · sesión actual»).
- Sin cara animada ni esfera que compita con el planeta; estados con texto e icono, no solo color.
- Órbita: barra «Pregunta a NÚCLEO · Tus datos, el mapa y cómo funciona GUARDIANA»; sugerencias; botón «Ver en el planeta» que centra y resalta; no mover el planeta solo por eventos entrantes; un corte de ZERO no se dibuja como rotura de un cable.
- Tarjeta de respuesta: resumen, dato, alcance, hora del dato, «Ver datos usados», acción (ver en el planeta, abrir Radiografía filtrada, ir al ajuste). Si falta información: «No tengo un registro que permita confirmar eso».
- ZERO: panel desde la cabecera; enlaces a la Radiografía filtrada construidos por el servidor; precios solo si constan.
- Comunicaciones: discreto; «No tengo acceso al contenido de tus comunicaciones cifradas»; nunca resume chats ni analiza archivos.
- Primer contacto breve: «Soy NÚCLEO. Te ayudo a entender tus datos, explorar Órbita y usar GUARDIANA…». Sin memoria entre visitas.
- Móvil: barra bajo el planeta, NÚCLEO a pantalla completa, alternar Respuesta/Mapa. Accesibilidad: objetivo WCAG 2.2 AA sujeto a auditoría, teclado, alternativa textual al planeta, reducir movimiento, botón «Pausar actualizaciones».

B) Datos
- Adaptadores → eventos normalizados → servicio de contexto → respuesta; SSE o el transporte existente; el modelo solo se ejecuta al explicar, no por cada evento.
- Entradas: ZERO (conexiones, cortes, empresas, países, publicidad, pujas, intentos, cookies resumidas, burbuja), Órbita (elementos, eventos, cifras, selección), web (sección, idioma, documentación aprobada), Comunicaciones (solo documentación y estados mínimos).
- Excluir contraseñas, valores de cookies, tokens, cabeceras y parámetros sensibles de URL. País de conexión ≠ país de almacenamiento.
- Conservación propuesta: conversación en memoria, se borra al cerrar o tras 30 min de inactividad (máximo 24 h); registros técnicos 7 días sin preguntas ni respuestas; métricas agregadas 30 días; nada para entrenar.

C) Técnica
- Modelo: mistralai/Mistral-Nemo-Instruct-2407 (12.000 millones de parámetros, Apache 2.0), cuantizado a 4 bits con llama.cpp.
- Servidor de partida: 16 vCPU (mejor dedicadas), 64 GB de RAM, 100 GB NVMe, UE; contexto unos 4.000 tokens; una generación a la vez con cola.
- Latencia sin medir: primer texto del orden de 2–10 s, respuesta breve 10–40 s (orientativo). Cifras y comprobantes aparecen al momento por la vía determinista.
- Temas: clasificador de intención con tres ámbitos, herramientas de solo lectura con esquemas cerrados, autorización en el servidor, sin internet ni SQL libre; respuesta fija fuera de tema.
- Antiinvención: el servidor calcula; el modelo recibe hechos con referencias; salida con esquema y validador de cifras y referencias.
- Idiomas: generación libre primero en es/en; resto tras evaluación. Coste: sin precio sin cotización.

D) Primera versión (cortada): NÚCLEO común todavía basado en reglas, barra bajo el planeta, acceso desde ZERO y Comunicaciones, reutilizar respuestas y comprobantes de ZERO…

# Astra — parte 2 (D–H, con lo nuevo del dueño: NÚCLEO como inicio, voz, barato). Resumen fiel.

D) v1: NÚCLEO es la pantalla de inicio y la puerta a Órbita, ZERO y Comunicaciones; chat con reglas e intenciones concretas (datos, mapa, abrir sección, funcionamiento), plantillas y consultas autorizadas al servidor, sin modelo; cada resultado con dato, hora y comprobante; accesos directos visibles (no obligar a conversar); es/en; voz opcional. Después: modelo pequeño para entender preguntas y redactar; el servidor calcula y autoriza.
E) Riesgos: datos antiguos (fuente y fecha visibles), datos de otro cliente (autorización por consulta), instrucciones maliciosas en documentos, audio expuesto, proveedor incompatible, saturación (cola y vuelta a reglas). Textos: «NÚCLEO te ayuda con tus datos, el mapa de Órbita y el funcionamiento de GUARDIANA. Puede equivocarse: consulta la fuente indicada.» Antes del micrófono: «Al activar el micrófono, enviaremos tu voz a nuestro servidor para transcribirla, sin servicios externos de reconocimiento. Puedes usar el chat.» El aviso completo de privacidad debe cubrir responsable, finalidades, base jurídica, alojamiento, conservación de audio/chat/registros y derechos.
F) Inicio: fondo negro, NÚCLEO en el centro: «NÚCLEO · ¿Qué necesitas hacer hoy? · Consulta tus datos, explora Órbita o accede a tus comunicaciones», entrada «Escribe tu pregunta…», botones Enviar · Hablar, estado del micrófono siempre visible (Desactivado / Escuchando / Procesando, con Detener); debajo Órbita · ZERO · Comunicaciones. Pregunta breve si es ambiguo; «Volver a NÚCLEO» en cada sección.
G) Voz: reconocimiento whisper.cpp + Whisper base multilingüe (MIT) en nuestro servidor (o WebAssembly en el navegador); síntesis eSpeak NG (GPL-3.0) y más adelante Piper (motor GPL-3.0; cada voz con su licencia). Pulsar para hablar, sin escucha continua; corregir la transcripción antes de enviar. No fiarse de SpeechRecognition del navegador para privacidad (algunos usan servicios remotos).
H) Barato: Qwen/Qwen2.5-1.5B-Instruct (Apache 2.0) con llama.cpp Q4_K_M; servidor dedicado de 2 vCPU y 4 GB para texto, 8 GB si también hace voz; pierde calidad en preguntas complejas; lo más barato sigue siendo reglas y plantillas. Sin precios ni latencias.

# Astra — parte 3 (visión del dueño: pantalla negra, nace NÚCLEO, saludo, deriva). Texto casi completo.

1) Entrada: 0–1 s fondo #06080C y un punto #9CC3E4 en el centro · 1–2 s el punto se convierte en una pequeña red neuronal luminosa, sin destellos; debajo «NÚCLEO · GUARDIANA» · 2–3 s la red se contrae y aparece el buscador: «Buenos días, bienvenido a esta experiencia de tus datos» (o «Buenas tardes» / «Buenas noches» según la hora del dispositivo) · 3–4 s «¿Qué deseas hacer?», campo «Escribe, habla o adjunta una nota de voz», botón «Ir →» · 4 s tres accesos: «Navegar con ZERO» · «Explorar el planeta» · «Abrir Comunicaciones». Se puede saltar; no se repite al volver; con movimiento reducido aparece directamente el buscador; el saludo se oye solo con la voz activada.
2) Frases → acción: «Abre ejemplo.com» → ZERO con esa web · «Quiero ver cables submarinos» → Órbita con esa capa · «Muéstrame los satélites sobre España» → centra y activa satélites (con fecha de los datos) · «¿Dónde hay cortes?» → panel EN DIRECTO · «Quiero hablar con otra persona» → Comunicaciones y pregunta si crear invitación o meter código · «Hazme un resumen de esto» → resumen de la vista · «Volver» / «Ir al inicio». Barra compacta en toda la web con texto, micrófono, «Ir →», «← Volver» e «Inicio»; voz al pulsar el micrófono, sin escucha permanente; si es ambiguo, pregunta.
3) Hace sola: abrir web en ZERO, mover Órbita y capas, abrir Comunicaciones sin conectar, resumir la vista y generar PDF. Pide confirmación: conectar con un código, enviar archivos o informes, borrar, cerrar con trabajo pendiente, acciones con coste. No lee chats ni archivos cifrados.
4) Voz: pulsar micrófono («Grabando…») o adjuntar nota; transcripción editable; respuesta siempre escrita con «Escuchar respuestas»; whisper.cpp + Whisper base y Piper/eSpeak NG en servidor propio. Aviso: «Tu audio se enviará al servidor de GUARDIANA para transcribirlo. No escuchamos en segundo plano.» Borrado del audio tras procesarlo; no prometer «ningún rastro».
5) Mínimo ya: entrada, saludo y barra persistente; reglas de acciones, dominios, lugares y capas; conectores reales; resúmenes por plantilla y PDF; voz propia y confirmaciones; prueba configurable de 24–72 h. Reserva: «Todavía no sé resolver esa petición. Puedo abrir una web, explorar Órbita, abrir Comunicaciones o preparar un informe de esta vista.»
