# Ronda 60 · El servicio de control de IA · cruce

27 Oct 2026, 15:15–15:35 (Bogotá). Voces: ChatGPT («High», con web; `chatgpt.md`) y Gemini (Argon; `gemini.md`). Claude comprobó las condiciones de las API en las páginas oficiales. Pregunta: `pregunta.md`.

## Lo que dicen las dos voces (se hace así)

1. **Sí hace falta**, y se construye sobre **PUERTA IA**, que ya existe. Ni IA propia desde cero ni GPU todavía: la GPU, cuando haya demanda medible.
2. **Dónde:** una **quinta tarjeta en NÚCLEO**, y un acceso desde ZERO cuando alguien abra una web de IA. Esconderlo dentro de ZERO haría que mucha gente no supiera que existe.
3. **Cómo funciona:** la persona escribe; **antes de salir**, se detectan y se tapan sus datos (nombres, documentos, cuentas, tarjetas, teléfonos, correos, direcciones y su lista «Mis datos»); ve qué se va a tapar antes de enviarlo; sale a una IA de pago por API (sin entrenamiento) con las claves de GUARDIANA, **sin que ella necesite cuenta** en OpenAI, Google ni Anthropic; la respuesta vuelve con sus datos puestos **solo en su pantalla**; queda un comprobante (a qué proveedor, cuántos datos se taparon), y el historial, solo en su equipo.
4. **La primera versión, solo texto**, con cuotas y topes duros por código de activación. Después: documentos (sin macros, revisión de malware en una celda aislada, metadatos), defensas contra instrucciones escondidas, reglas para empresas, más proveedores, y la IA alojada por GUARDIANA.
5. **Pago:** incluido en la suscripción (ZERO + Comunicaciones) **con cuota** y freno de gasto; una cuota pequeña en la prueba de 3 días (ChatGPT, 10 consultas; Gemini, 15).
6. **Lo que no se puede prometer:** «100 % anónimo», «nadie puede robar tus datos», «todo queda dentro de GUARDIANA» mientras se usen IA externas. El tapado es **seudonimización**: un caso muy concreto se puede reconocer aunque no vaya el nombre.
7. **Leyes (mapa):** responsable de lo que GUARDIANA decide; encargado cuando una empresa trae datos de sus clientes; Ley 1581 y RGPD; firmar el contrato de encargado (DPA) de cada proveedor; Ley de IA de la UE: decir que es IA y qué proveedor responde.

## Comprobado por Claude (páginas oficiales, 27 Oct 2026)

- **OpenAI (API):** «data sent to the OpenAI API is not used to train or improve OpenAI models» salvo que se acepte; registros de vigilancia de abusos «hasta 30 días»; retención cero (ZDR) solo con aprobación previa; la Responses API guarda 30 días el estado salvo `store=false`. (developers.openai.com/api/docs/guides/your-data)
- **Anthropic (API y productos comerciales):** borra entradas y salidas «dentro de 30 días», con excepciones (Files API, acuerdos, infracciones de uso hasta 2 años, obligaciones legales; los «Covered Models» exigen retención limitada y revisión); retención cero por acuerdo. Esa página no dice si se entrena con la API: las dos voces dicen que no; queda por comprobar en sus condiciones comerciales. (privacy.claude.com, artículo 7996866)
- **Gemini API:** guarda 55 días las peticiones y respuestas para vigilar abusos, sin usarlas para entrenar más que los modelos de esa vigilancia (ai.google.dev/gemini-api/docs/usage-policies). Lo del nivel gratuito (que sí puede usar los datos) lo dice Gemini; no se ha abierto esa página.
- No se usan las tarifas por modelo que dieron las voces (Gemini citó modelos antiguos; ChatGPT, sin comprobar): el orden de magnitud que coincide es que una consulta normal con un modelo económico cuesta fracciones de céntimo de dólar.

## Donde discrepan

- **Nombre:** ChatGPT, **CONTROL IA** (las palabras del dueño); Gemini, **IA Protegida**. Las dos incluyen «IA Protegida» y «Puerta IA» en su lista.
- **Primer proveedor:** ChatGPT, OpenAI (`store=false` y pedir ZDR); Gemini, OpenAI o Anthropic, o Mistral (UE) como bandera europea.
- **Cuota:** ChatGPT, 100 consultas al mes; Gemini, 50 al día con modelo rápido. Propuestas, no medidas.

## Propuesta de Claude al dueño

1. Hacerlo: quinta tarjeta en NÚCLEO («Control IA» o «IA Protegida»), con acceso desde ZERO.
2. Primera versión: solo texto, el tapado y el destapado en el navegador de la persona, vista previa de lo que se tapa, una IA de pago sin entrenamiento (OpenAI, sin almacenamiento de estado y pidiendo retención cero), sin cuenta del proveedor, historial solo en el equipo, comprobante y cuotas con tope duro.
3. Incluido en el pago de ZERO y Comunicaciones, con cuota; cuota pequeña en los 3 días gratis.
4. Frase honesta: «Trabaja con inteligencia artificial sin entregar tus datos: los tapamos antes de enviarlos y ves qué sale y a quién.»
5. Antes de abrirlo al público: pruebas con nombres y documentos reales de varios países, que nada de una persona aparezca en la sesión de otra, que ningún registro guarde texto, y las condiciones y la privacidad del servicio publicadas.
