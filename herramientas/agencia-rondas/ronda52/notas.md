# Ronda 52 · NÚCLEO como eje de GUARDIANA · notas de Claude (27 Oct 2026, 09:05 Bogotá)

Voces: ChatGPT (Alta), Gemini y Astra, cada una con su propuesta (`chatgpt.md`, `gemini.md`, `astra.md`). Pedido del dueño: propuestas de cada una sobre diseño e implementación; visión de las 08:42 (pantalla negra, nace NÚCLEO, saludo por la hora, «¿Qué deseas hacer?», lleva a ZERO / Órbita / Comunicaciones, voz o chat en toda la web, ella hace los PDF).

## Coinciden las tres
- Entrada: negro, un punto que se convierte en red neuronal (NÚCLEO), saludo por la hora local, «Bienvenido a esta experiencia de tus datos. ¿Qué deseas hacer?», tres accesos (ZERO, Órbita, Comunicaciones) y un campo para escribir, hablar o mandar una nota de voz. Se puede saltar; sin movimiento si el sistema lo pide; el saludo suena solo tras activar la voz.
- Deriva por frases a acciones reales; «Volver» e «Inicio»; NÚCLEO sigue en toda la web como botón u orbe pequeño para texto y voz.
- Sola: abrir secciones, abrir una web en ZERO, mover el planeta y sus capas, resumir y hacer el PDF con el generador que ya existe. Pide confirmación para enviar, conectar con un código, destruir, borrar y el micrófono.
- Voz: pulsar para hablar y notas de voz; reconocimiento con whisper.cpp + Whisper base (MIT) en nuestro servidor (o en el navegador); nunca SpeechRecognition del navegador por defecto (puede mandar el audio fuera); respuesta siempre escrita y voz opcional; el audio se borra al transcribir.
- Primera versión publicable ya sin IA generativa: reglas, intenciones y datos que ya existen. Después la voz y un modelo pequeño en un servidor aparte.
- Cerrada: solo GUARDIANA, la web y los datos; respuesta fija fuera de tema; sin historial de conversaciones.

## Coinciden dos
- Servidor barato de 4 vCPU y 8 GB (ChatGPT, Gemini).
- Síntesis con Piper (Astra, Gemini); ChatGPT propone Kokoro-82M.

## Sin acuerdo (decide el dueño)
- Modelo: Qwen (ChatGPT Qwen3-1.7B, Astra Qwen2.5-1.5B; Apache 2.0, origen chino pero corre en nuestro servidor) frente a modelos europeos o de EE. UU. (Gemini: Salamandra-2B, Llama-3.2-3B, Phi-3.5-mini; ChatGPT: Ministral 3B si se evitan los chinos).
- Permiso antes de leer los datos de ZERO (ChatGPT lo pide; las otras no).
- Prueba: ChatGPT recomienda 3 días; Astra, configurable de 24 a 72 h.

## A tener en cuenta
- Reglamento europeo de IA, artículo 50 (ChatGPT): avisar de que NÚCLEO usa IA.
- No prometer «ningún rastro» ni «todos tus datos en Europa» sin matizar.
