# Ronda 74 · Móvil y tableta, detalle del chat, avisos con la página minimizada y varias conversaciones · cruce

28 Oct 2026, 13:30–14:35 (Bogotá). Voces: ChatGPT (GPT-6, «High», el máximo; A–G, H y J), Gemini (Argon «Alto»; A–G, H e I; J no entró por el límite de uso) y GPT-6 Astra (A, H e I). DeepSeek V4 Pro gastó todo su presupuesto en razonar y no respondió. Pregunta: `pregunta.md` (y los añadidos del dueño de 13:27 a 13:56).

**En una frase:** GUARDIANA tiene que parecer una aplicación de mensajería, no un panel técnico: una fila de cabecera con «⋯», la seguridad a un toque, llamadas limpias, señales de chat que significan exactamente lo que pasó y varias conversaciones a la vez, sin que una toque a las demás.

## Lo que se hizo (código, 28 Oct 2026)
1. **Móvil:** cabecera en una fila (candado, nombre corto, estado de una línea, llamar, videollamar, «⋯»); «⋯» con Cambiar el nombre, Seguridad y verificación, Modo discreto, Avisos y Terminar (con su confirmación); tocar el nombre abre la seguridad; sin la franja repetida; sin la barra de arriba dentro de la conversación; campos a 16 px (sin zoom en el iPhone).
2. **Llamada:** tiempo solo con la llamada contestada; al recibir, «Tu voz: Natural ▾» plegada (en la blindada sigue abierta, para proteger la cara antes de contestar); calidad corta («Conexión: excelente» con un punto de color; los datos técnicos al tocarla); Wake Lock.
3. **Chat:** leído en verde #5CC98A y solo si el mensaje se ve (pestaña delante y con foco, sin la llamada en grande ni una hoja encima, la burbuja en pantalla); «escribiendo…» y «grabando audio…» en una burbuja a la izquierda (cada 3 s como mucho, fin a los 3,5 s, caduca a los 6 s); llamadas al lado de quien llamó, con colores de la agencia y «Volver a llamar»; agrupar hasta 5 minutos; privacidad recíproca para el leído y el escribiendo.
4. **Minimizada:** número en el título que alterna, punto en el icono, `setAppBadge` si está instalada y, con permiso, el aviso del sistema sin el contenido; la llamada entrante, fija hasta contestar. El permiso se pide con una tira en la conversación (solo en el ordenador).
5. **Navegadores internos:** aviso sin bloquear con «Copiar enlace», instrucción para abrir fuera y «Continuar aquí» (en Android, «Abrir en Chrome»).
6. **Tableta:** VIGILANCIA cerrada (la información sigue en el escudo).
7. **Varias conversaciones (J):** lista a la izquierda en el ordenador y como pantalla en el móvil; una nueva no borra las demás; avisos dentro de la app de las otras; borrador por conversación; una sola llamada a la vez («ocupado» para las demás, sin decir con quién); llamada atada a su conversación; alias local; terminar solo la elegida; todas se recuperan al recargar. Un WebSocket compartido para el lanzamiento (el relé ve que la misma conexión está en varias salas; separar conexiones, después y medido). Límite provisional: 8.

## Lo que no se hizo (o se deja para después)
- Service worker y avisos en Android/iPhone con la página cerrada (Web Push): ronda 73.
- «Llenar pantalla» en el vídeo, gesto para pasar a pequeño, View Transitions, manifiesto e «Añadir a la pantalla de inicio».
- Proteger el gesto «Atrás» con el historial (Gemini).
- Quitar «SELLADA» de la cabecera (Astra y ChatGPT lo cuestionan): lo pidió el dueño; queda a su decisión.
- Botón «2 mensajes nuevos ↓» al leer arriba (Astra).

## Correcciones de GUARDIANA a las voces
- Gemini propone rellenar las señales de control a un tamaño fijo «de 256 bytes» para que el relé no distinga un «escribiendo» de un mensaje: no se ha hecho; hoy un «escribiendo…» es más corto que un mensaje y el relé ve tiempos y tamaños (ChatGPT y Astra lo dicen).
- Gemini da por hecho que una notificación ilumina la barra de tareas de Windows; Astra: «no existe una API web general para obligar a que una ventana minimizada salte». Se dice al dueño así.
