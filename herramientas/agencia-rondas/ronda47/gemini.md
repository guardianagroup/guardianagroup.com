# Ronda 47 · Gemini (Argon, con web) · resumen fiel

Chat nuevo en gemini.google.com/app (tab-1), 26 Oct 2026, 17:15–17:20 Bogotá. ~14.000 caracteres.

**Tesis:** «No existe ninguna forma honesta, técnica ni comercial de que google.com funcione sin reCAPTCHA desde una celda remota en un centro de datos. Para navegar por Google con normalidad, el tráfico tiene que salir de la propia conexión residencial/móvil de la persona o ir por una API oficial.»

## A. Por qué la celda siempre chocará (SEGURO)
- ASN de Hetzner (AS24940), como OVH/DigitalOcean/AWS, catalogado «hosting» en MaxMind, IPinfo, Google y Cloudflare: la confianza más baja posible.
- Señales honestas de automatización: `navigator.webdriver = true`, sin plugins propietarios de Chrome, huella TLS (JA3/JA4) y HTTP/2 distinta a un Chrome de consumidor.
- Sin cookies de reputación (NID, SID, desafíos superados): una celda limpia nace sin historial.
- Política de Google: prohíbe el acceso automatizado a sus resultados HTML; ofrece Programmable Search / Custom Search JSON (100/día gratis, 5 USD/1.000 — DISCREPA con ChatGPT ronda 46: cerrada a nuevos clientes) y no tiene listas blancas de IP para navegadores remotos de terceros.

## B.1 Programa local
- Con la base existente y el motor Node, en local las webs ven la IP residencial real y una pila TLS legítima: desaparecen /sorry/, 418 y el bloqueo de as.com.
- **WebView2:** `WebResourceRequested` funciona pero pausa cada petición y cruza IPC al proceso anfitrión (150 peticiones → latencia perceptible). Mejor: **sesión CDP nativa** (`CallDevToolsProtocolMethodAsync`, `GetDevToolsProtocolEventReceiver`). Observar: `Network.requestWillBeSent`/`responseReceived` (no detiene el hilo de red; fluidez 100 % de Edge). Cortar: `Network.setBlockedURLs` con los patrones elegidos (o `Fetch.enable` con patrones solo para dominios cortados), dentro del binario de Chromium sin IPC. Sensores: `AddScriptToExecuteOnDocumentCreatedAsync` antes del primer script, igual que en Playwright.
- **WKWebView (macOS):** sensores con `WKUserContentController.addUserScript` atDocumentStart (equivalente); cortar con `WKContentRuleListStore` (bytecode nativo, rapidísimo; formato más rígido; 150.000 reglas por lista, varias listas); **observar todas las subpeticiones en vivo no tiene API pública** (WKURLSchemeHandler solo esquemas propios) → para el panel en vivo en Mac, **Electron** (Chromium completo + CDP + Node) es más sólido.
- Google en WebView2/Electron sobre IP doméstica: sin captchas (WebView2 comparte motor y UA de Edge; en Electron sugiere quitar el token «Electron/x.y.z» del UA — nota de Claude: preferible no tocar el UA). **Muro del login de Google (2021):** accounts.google.com bloqueado en vistas embebidas («este navegador o aplicación no es seguro»); no afecta a buscar ni navegar sin cuenta; solo al iniciar sesión en Gmail/cuenta dentro de ZERO. Otros delegan OAuth al navegador del sistema (loopback 127.0.0.1 o esquema propio), que autentica la app pero no inyecta la sesión de google.com; en Electron con UA limpio «suele» permitir el login web, zona gris que Google puede endurecer.

## B.2 Extensión (MV3)
- El usuario sigue en su navegador (sesión de Google iniciada, contraseñas, cero captchas) y abre el panel lateral (`chrome.sidePanel`). Observar: `chrome.webRequest` en solo lectura (onBeforeRequest, onCompleted, onErrorOccurred), sin permisos de bloqueo; empresas.js en el service worker o en el sidePanel para que no se duerma. Cortar bajo demanda: límites MV3 330.000 estáticas (fondo global compartido) y 30.000 dinámicas + 5.000 de sesión; al pulsar «Cortar esta empresa» se añade una regla dinámica/de sesión al instante; «escudo EasyList completo» como ruleset estático precompilado (como uBO Lite). Sensores: `chrome.scripting.registerContentScripts` con `runAt: "document_start"` y **`world: "MAIN"`** (para medir Canvas, AudioContext, WebRTC en el mismo ámbito que la página).
- Se pierde frente a MV2: inspección de cabeceras en vuelo y decisión dinámica en JS, modificación del cuerpo, filtrado HTML, CNAME uncloaking. Firefox mantiene webRequestBlocking en MV3; la arquitectura «Observar + corte por decisión del usuario» encaja al 100 % en MV3 de Chrome.
- Tiendas: AMO 0 USD, 24 h–5 días; Chrome Web Store 5 USD de registro (Edge 0), con `<all_urls>` y `webRequest` revisión manual profunda, **1–3 semanas** la primera vez. Pedir solo permisos necesarios, justificar que todo se procesa en local sin exfiltrar historial, política de privacidad clara.

## B.3 Híbrido = hacia donde converge la industria
- DuckDuckGo (vistas del sistema + protección local), Brave (bloquea en cliente, ventanas Tor para lo extremo), Cloudflare/Kasm (aislamiento remoto solo para enlaces sospechosos o redes de alto riesgo).
- Para GUARDIANA: el día a día (Google, prensa, bancos, vídeo) en local (programa o extensión): 60 fps, sonido directo, 0 € de servidor, cero captchas. La celda remota + ULTRA pasa a ser lo que la hace única: **«Abrir en celda sellada (aislamiento total)»** para enlaces dudosos, inspección sin tocar la RAM ni la IP del equipo, actas desde un entorno neutro. La web pública sin instalar sigue como escaparate y laboratorio (móvil, curiosos): pegar cualquier URL y radiografiarla en la celda; buscador que no bloquee centros de datos (Bing directo o frontal propio por API de Brave/Google CSE).

## B.4 Navegador propio: no viable hoy
- Compilar Chromium: máquinas de 64 GB, horas; parches de seguridad cada 10–15 días; certificados EV; Widevine no se concede a forks pequeños; 4–8 ingenieros C++ y cientos de miles de euros al año. «Trampa mortal de mantenimiento.»
- Alternativa realista: WebView2 (10–30 MB, Chromium del sistema actualizado por Windows) o **Electron** (Chromium + Node, 90–120 MB; `webContents.debugger` = mismo CDP en Windows/Mac/Linux; corre los .js del motor en el proceso principal).

## C. Matriz (resumen)
| | Programa local | Extensión | Híbrido | Web remota pura |
|---|---|---|---|---|
| Qué ve la web | IP real (Tor si ULTRA) + Chrome/Edge real | IP real + su navegador con sus cookies | IP real en normal; Hetzner en celda sellada; Tor en ULTRA | Hetzner AS24940 + Chromium Linux |
| Google | 100 % normal (fricción solo login OAuth embebido) | 100 % normal con su cuenta | 100 % en local; en web sin instalar, API | /sorry/ |
| Pierde | aislamiento físico por defecto | celda sellada, descargas retenidas, independencia del navegador | nada | a quien quiera google.com/as.com |
| Gana | 60 fps, audio/vídeo, 0 €, Arti, descargas y actas en local | adopción sin fricción, 0 €, sin OAuth/DRM | todo | cero instalación |
| Tiendas | ninguno (distribución directa) | revisión manual 1–3 semanas; cumple políticas (no inyecta anuncios ni altera resultados) | bajo | ninguno |
| Tiempo (1 dev) | **1–2 semanas** (reactivar base + motor Node por CDP local) | 2–3 semanas + 1–3 de revisión | 1–2 semanas fase 1 | 2–3 días (Bing/API) |

## D. Plan de 2 semanas
1. **Programa local (semanas 1–2): «Google de primera y sin captchas».** Conectar el motor Node al WebView local por CDP (WebView2: `Network.enable`, `Page.addScriptToEvaluateOnNewDocument` para sensores, `Network.setBlockedURLs`/`Fetch.enable` para cortes; o Electron con `webContents.debugger` para Windows y Mac con el mismo código). Página de inicio google.com. Descargas retenidas y acta en local (`DownloadStarting` / `will-download`).
2. **Web remota (días 1–3): «que nadie vea un captcha al probar la web».** Opción A (0 €, 1 h): Bing por defecto con aviso honesto «Estás en una celda remota aislada en Núremberg; para Google sin captchas, abre ZERO en tu equipo». Opción B (2–3 días): caja de búsqueda propia con API (Brave/Google CSE), resultados en HTML propio, al pulsar la celda navega y radiografía.
3. **Extensión MV3 (semana 3 en adelante), en paralelo:** empresas.js + cortes.js + sensores.js + HTML del panel (sidePanel + webRequest + declarativeNetRequest).
