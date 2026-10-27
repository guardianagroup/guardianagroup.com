# Gemini — ronda 52, parte 1 (A–E completa). Resumen fiel de su texto (27 Oct 2026, 08:45 Bogotá).

Principio: «preguntar o pulsar, nunca buscar en menús». NÚCLEO es una capa transversal que mantiene el contexto entre Órbita, ZERO y Comunicaciones.

A) Diseño
- Órbita: barra centrada bajo el planeta (máx. 680 px), fondo #06080C al 90 % con desenfoque y borde acento; la respuesta se despliega hacia arriba (máx. 45 % de alto) sin tapar el ecuador; si hay coordenadas, el planeta gira y hace zoom y resalta el punto o arco en #9CC3E4.
- ZERO: cápsula flotante en la barra de control, fuera de la imagen remota: «NÚCLEO · Leyendo esta sesión (X cortes)»; Ctrl+Espacio / Cmd+K abre un cajón; cada dato lleva un botón que abre la Radiografía y resalta la fila.
- Comunicaciones: icono «NÚCLEO · Modo Guía» en la cabecera, separado de la caja del chat; aviso fijo de que no accede al chat ni a los archivos.
- Primer contacto: placeholder «Pregunta a NÚCLEO qué pasa en el planeta, qué ve ZERO en tu sesión o cómo funciona GUARDIANA…»; tres píldoras: «¿Qué se está cortando ahora mismo en el planeta?», «¿Qué ha intentado leer mi equipo en ZERO?», «¿Cómo funciona la burbuja de ZERO y qué se guarda?».
- Fuera de tema: «Solo puedo responder sobre tres cosas: los datos de tu sesión actual en ZERO, la infraestructura del mapa de Órbita y el funcionamiento de GUARDIANA…».
- Respuestas: frase de síntesis (máx. 3 líneas) + tarjetas de evidencia (cabecera de categoría, clave-valor, sello de hora, fuente) con botones «Ver en el planeta» y «Abrir en Radiografía».
- Móvil: barra fija inferior de 56 px que sube a media pantalla o casi completa. Accesibilidad: contraste #F4F6F8/#06080C y #9CC3E4/#06080C (da ratios 18,3:1 y 10,4:1, sin comprobar aquí), aria-live polite, teclado.

B) Datos
- ZERO: resumen JSON de la Radiografía enviado en la petición; nunca imágenes, lo que se escribe en las páginas ni la IP del cliente.
- Órbita: catálogo en RAM y flujo EN DIRECTO por WebSocket/SSE; sin identificar al usuario de cada corte.
- Web: manual técnico verificado de GUARDIANA en local.
- Conservación: nada en disco (sin historial ni logs del cuerpo de las peticiones); RAM solo mientras responde; historial visual en la pestaña del cliente; ventana de EN DIRECTO de unos 50 eventos que se reinicia cada 24 h.

C) Técnica
- Descarta modelos de origen chino (Qwen, DeepSeek) por prudencia. Recomienda Mistral-7B-Instruct-v0.3 (Apache 2.0) o Ministral-8B-Instruct-2410; alternativas Llama-3.2-3B-Instruct (licencia comunitaria Llama 3.2) y EuroLLM-9B-Instruct (Apache 2.0). (Nota de Claude: Ministral-8B-Instruct-2410 se publicó con la «Mistral Research License», no Apache: comprobar antes de usarlo.)
- llama.cpp (MIT) con GGUF Q4_K_M, sin salida a internet.
- Servidor: 8–16 vCPU dedicadas, 16–32 GB de RAM (mejor DDR5). Latencias que da como orientativas (sin fuente única): 8–18 tokens/s con 7B y 20–35 con 3B.
- Temas en tres capas: clasificador determinista → reglas actuales de NÚCLEO (sin gastar CPU) → modelo con gramática GBNF que devuelve JSON con «tema_valido».
- Antiinvención: solo datos del JSON, temperatura 0; el modelo no escribe cifras ni nombres en las tarjetas (los pone el servidor); verificación posterior de cifras y nombres; si falla, respuesta de reglas.
- Idiomas: es/en ya; para el resto, glosario oficial en el prompt o EuroLLM. Coste: fijo del servidor, sin coste por pregunta; caché de respuestas de Órbita y de funcionamiento; límite por sesión.

D) Fase 1 publicable ya, sin modelo: barra bajo el planeta y acceso en ZERO y Comunicaciones; reglas actuales + datos de ZERO + EN DIRECTO de Órbita + índice de respuestas verificadas; autocompletado y píldoras («subasta» → tarjeta de pujas; nombre de país → el planeta va allí). Fase 2: servidor CPU con el modelo para preguntas abiertas.

E) Riesgos: picos de CPU (si la cola pasa de 3 s, responden las reglas); confusión en Comunicaciones (botón de ayuda separado); matices del modelo (el comprobante manda). Propone textos de privacidad (corto y detallado) en los que NÚCLEO corre en un servidor propio en la UE, no envía preguntas ni datos a terceros y no guarda historial.

# Gemini — parte 2 (F–H). Resumen fiel.

F) Inicio: entra directo a NÚCLEO (recepcionista, guía y mando único). Centro: anillo de ondas de voz/datos en #9CC3E4 que late al hablar, con la silueta tenue del planeta detrás; barra con micrófono «Hablar con NÚCLEO» y campo de texto; tres tarjetas de acceso directo (abrir una web en ZERO, ver cortes de hoy en Órbita, crear sala cifrada). Saludo: «Bienvenido a GUARDIANA. Soy NÚCLEO. Dime por voz o por escrito qué necesitas…». Botón «Mantén o pulsa para hablar» y selector de voz Activada/Silencio. Transiciones sin recargar: Órbita (el planeta pasa al frente y gira; NÚCLEO baja a su barra), ZERO (abre el visor y queda acoplada leyendo la sesión), Comunicaciones (explica y se desconecta del canal).
G) Voz: descarta SpeechRecognition del navegador (en la mayoría envía el audio a la nube). Reconocimiento: whisper.cpp o faster-whisper con Whisper base/small (MIT) en nuestro servidor, por frases; o en el navegador con Vosk (Apache 2.0) o Whisper-tiny con Transformers.js (descarga de 40–75 MB). Síntesis: Piper con voces es_ES-davefx-medium / es_ES-sharvard-medium y en_US-lessac-medium / en_GB-alba-medium; para idiomas sin voz Piper, speechSynthesis solo con voces localService. (Nota de Claude: el Piper original rhasspy/piper es MIT, el nuevo piper1-gpl es GPL y cada voz tiene su propia licencia: comprobar cada voz.)
H) Barato: 4 vCPU y 8 GB como suelo (sistema 0,8 GB + modelo 3B Q4 2,2 GB + voz 0,8 GB + Órbita y margen 1,5 GB). Modelos: Salamandra-2B-Instruct (BSC, España, Apache 2.0), Llama-3.2-3B-Instruct (licencia comunitaria, «Built with Llama») o Phi-3.5-mini-instruct (MIT). Pierde concurrencia (cola si 4–5 preguntan a la vez), fluidez en idiomas menos comunes y preguntas encadenadas; lo compensan las reglas y la caché.

# Gemini — parte 3 (visión del dueño). Resumen fiel.
1) Entrada: 0–0,8 s vacío negro sin menús · 0,8–2,2 s chispa #9CC3E4 que teje una red neuronal 3D viva (nodos y sinapsis); debajo emerge el buscador (texto + hablar en vivo + nota de voz) · 2,2–4 s saludo por la hora local (06–11:59 días, 12–19:59 tardes, 20–05:59 noches): «[Buenos días…], bienvenido a esta experiencia de tus datos. ¿Qué deseas hacer?», en pantalla y en voz tras el primer toque (el navegador lo exige). Placeholder: «Habla en directo, envía una nota de voz o escribe qué deseas hacer…». Tres accesos: «Usar el navegador aislado (ZERO)», «Saber datos del planeta: cableado, satélites, cortes (Órbita)», «Ir a Comunicaciones cifradas».
2) Deriva sin otra página: navegar → el cerebro se va a la barra y se abre la burbuja con la web; planeta → el cerebro se funde con el centro y nace el planeta que gira al punto pedido; Comunicaciones → abre la sala y explica cómo conectar; «¿quién me sigue?» / «hazme el PDF» → lee la Radiografía, explica con voz y tarjeta y genera el PDF. Botón único «⬅ Volver a NÚCLEO» / «➡ Ir a tu sesión…» arriba a la izquierda; un orbe neuronal flotante para hablar desde cualquier sitio (pulsar o mantener la barra espaciadora).
3) Sola: mover el planeta, abrir ZERO con una web, leer la Radiografía, resúmenes y PDF, abrir Comunicaciones. Confirma: destruir una burbuja, salir de una sala con algo en curso, dirección dudosa dicha por voz, primer permiso de micrófono.
4) Voz: «Hablar» con detección de silencio (1,2 s) y «Nota de voz» (mantener, cancelar, enviar). Responde en voz y texto si le hablas; en texto con «Escuchar» si escribes, o voz siempre con el interruptor. Audio solo a nuestro servidor en la UE (whisper.cpp) o transcrito en el navegador (WebAssembly); se borra al transcribir.
5) Ya, sin IA grande: entrada con red neuronal en el navegador y saludo con 3 audios pregrabados con Piper; reglas actuales + detector de intenciones para abrir secciones, mover el planeta y lanzar el PDF; voz con whisper.cpp + Piper en un servidor de 4 vCPU / 8 GB.
