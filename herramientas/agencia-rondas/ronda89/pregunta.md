# Ronda 89 · 1 nov 2026 · la radiografía local y «IA en tu PC»

Dueño, 22:36 y 22:43: el navegador de GUARDIANA es detectado como robot; pide captchas; webs de PRISA (AS, El País) lo
cierran; quiere ver más datos de precios en las subastas. 23:01: «Necesito soluciones para que el navegador de guardiana
funcione normal y detecte muchos datos, entre ellos subastas de datos, telemetrías, rastreadores etc… eso es nuestras
radiografías. Y una cosa más, cómo hacemos para vigilar a las IA y dar ese servicio al cliente». 23:02: «Confío en ti».
23:21: «Lo del navegador si no puedes solucionarlo de alguna manera, habrá que no hacerlo».

Lo que no se hace, decidido antes de preguntar: disimular que es un robot (quitar señales de automatización, parches
«stealth», proxies residenciales, resolver captchas). Eso se descartó el 1 nov a las 22:50 y no se vuelve a abrir.

Dos encargos a Gemini (modo Tarea), con fuentes enlazadas y sin cifras inventadas:

1. **Radiografía local.** Hoy la radiografía de una web la hace un motor en servidores de GUARDIANA (Playwright en
   Chromium), y una web ve un visitante de centro de datos. Propuesta: que el programa instalado abra un Chromium en el PC
   del cliente, con su conexión, y observe lo que la página hace (CDP: red, almacenamiento, llamadas a APIs de huella).
   Preguntas: (a) qué datos de subastas se pueden leer desde dentro de la página sin tocar nada: Prebid.js
   (`pbjs.getBidResponses`, `getAllWinningBids`, `getEvents`), Google Ad Manager / GPT (`googletag.pubads()` y sus
   eventos `slotRenderEnded` con `advertiserId`, `campaignId`, CPM no), Amazon TAM (`apstag`), OpenRTB en peticiones
   (`/openrtb2/auction`), `sellers.json`/`ads.txt` para saber quién vende; qué CPM se ve y cuál no; (b) listas abiertas
   de rastreadores y su licencia exacta (DuckDuckGo Tracker Radar, Disconnect, EasyPrivacy, uBlock/AdGuard filters,
   WhoTracks.me de Ghostery, CNAME cloaking de AdGuard, UID2/ID5/LiveRamp/Criteo sync endpoints); (c) cómo leer el
   consentimiento TCF v2.2 (`__tcfapi`) y compararlo con lo que la página envía de verdad; (d) qué huella digital se
   puede contar (canvas, audio, fuentes, WebGL, `navigator` props) enganchando desde CDP `Runtime.addBinding` o
   `Page.addScriptToEvaluateOnNewDocument`, sin cambiar lo que la web ve; (e) qué hacen hoy Blacklight (The Markup),
   Privacy Badger, Ghostery, DuckDuckGo, Brave Shields y webXray, y qué no hace ninguno; (f) riesgos legales y de
   servicio: observar sin interferir; nunca enviar la radiografía fuera del PC sin que el cliente lo pida.
2. **«IA en tu PC».** Vigilar qué asistentes de IA hay en el equipo y qué hacen, para avisar al cliente, sin leer el
   contenido (va encriptado y no se abre). Preguntas: (a) qué programas y extensiones contar (Copilot, Recall, Click to
   Do, Gemini en Chrome, ChatGPT de escritorio, Claude de escritorio, Cursor, Windsurf, Copilot en Office, Notion AI,
   Grammarly, Zoom AI Companion, Teams Copilot, extensiones con permisos de lectura de pestañas); (b) cómo saber desde
   Windows, con fuentes, qué usa micrófono, cámara y pantalla (CapabilityAccessManager ConsentStore en el registro,
   `LastUsedTimeStart/Stop`), lectura de otras ventanas (UI Automation, `SetWindowsHookEx`, ETW), portapapeles
   (`AddClipboardFormatListener`), y Recall (si está activo, dónde guarda, cuánto ocupa, cómo se desactiva: política
   `DisableAIDataAnalysis`); (c) destinos de red de los servicios de IA (OpenAI, Anthropic, Google, Microsoft Copilot,
   Meta, Mistral, xAI, DeepSeek, Perplexity) con sus dominios publicados y cómo distinguirlos de otro tráfico del mismo
   fabricante; (d) qué dice la ley (RGPD, AI Act, LOPDGDD) y qué pueden prometer de verdad: vigilar, avisar, cortar con
   la VPN o el cortafuegos; nunca «bloquea la IA»; (e) qué hace nadie todavía y GUARDIANA podría hacer primero, medible.

El texto completo de las respuestas queda en la cuenta de Gemini del dueño. Aquí van el resumen (gemini.md) y la revisión
de Claude (claude.md); las decisiones, en decisiones.md.
