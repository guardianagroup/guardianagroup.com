# Ronda 45 · Gemini (Argon, con web) · 26 Oct 2026 · chat app/10f65cb82f2d6978

Resumen fiel (texto largo; marcas SEGURO/PROBABLE del propio Gemini).

## A. Qué miran los buscadores
Capas: red y cabeceras HTTP (coste cero) → huella TLS/HTTP2 → entorno JS/PoW. «HeadlessChrome» en una IP de Hetzner activa el bloqueo en la primera capa.
- User-Agent «HeadlessChrome» y Sec-CH-UA (SEGURO): Chromium headless lo incluye; reglas de WAF (OWASP CRS, Cloudflare/Fastly/Akamai) le dan puntuación de bot máxima antes de ejecutar JS.
- navigator.webdriver=true (SEGURO): W3C WebDriver, NavigatorAutomationInformation; lo expone cualquier navegador bajo Playwright/Puppeteer/Selenium con --enable-automation; su propósito es informar de que el navegador está automatizado.
- Reputación IP/ASN (SEGURO): MaxMind/IPinfo clasifican Hetzner AS24940, OVH AS16276, DigitalOcean AS14061, AWS AS16509 como Hosting/DCH; los buscadores penalizan de entrada.
- Huella de render (SEGURO): WEBGL_debug_renderer_info muestra SwiftShader/llvmpipe (máquina virtual sin GPU); faltan fuentes de escritorio si solo hay fonts-liberation.
- TLS JA3/JA4 y HTTP/2 (SEGURO): con un Chromium real coinciden con un navegador real; no es el vector de fallo.
- Volumen por IP y sin cookies previas (SEGURO): celdas efímeras sin cookies de confianza (AEC/NID de Google) desde la misma IPv4 disparan el limitador.
Respuestas: DuckDuckGo 418 (I'm a teapot) en el borde por UA/reputación, sin servir captcha; sospecha intermedia → anomaly.js; con HeadlessChrome corta también en /html/ y /lite/. Google 429 / redirección a /sorry/index con reCAPTCHA («unusual traffic»); en Hetzner a veces bloqueo directo. Brave: PoW + captcha de arrastre en canvas cuando ASN de centro de datos o webdriver. Bing: Turnstile/Arkose o resultados vacíos (shadowblocking, PROBABLE). Startpage: bloqueo por IP de hosting («Why is my IP blocked?»). Qwant: captcha o 429. Ecosia: hereda filtros de Bing/Google. Yandex: SmartCaptcha. Baidu: wappass captcha y login. Naver: 403/captcha en verticales (PROBABLE).

## B. Cómo lo hacen los navegadores remotos legítimos
- Kasm Workspaces, Browserling, Mighty, Puffin (SEGURO): navegador CON CABEZA sobre display virtual (KasmVNC: Xorg :1 en RAM + VNC por WebSocket; repos kasmtech/workspaces-images); Chrome/Chromium normal, sin --headless ni WebDriver; Browserling inyecta ratón/teclado a nivel de SO (X11/Win32), no por CDP con flags de automatización.
- Cloudflare Browser Isolation (NVR, Chromium en el borde, intercepta Skia), Menlo, Ericom, Amazon WorkSpaces Web (SEGURO/PROBABLE): presentan una sesión estándar, sin HeadlessChrome ni webdriver.
- Island, Talon, Edge for Business: navegadores de empresa locales o Hyper-V local (IP y GPU del usuario).
- Opera Mini/Turbo (SEGURO): proxies de compresión explícitos, UA propio y X-Forwarded-For.
- UA (SEGURO): todos los remotos interactivos modernos presentan un Chrome de escritorio estándar («Mozilla/5.0 (X11; Linux x86_64) … Chrome/130.0.0.0 Safari/537.36»); ninguno «HeadlessChrome». No mandan X-Forwarded-For/Via (salvo Opera Mini): el objetivo es no revelar la IP real.
- IP de centro de datos (SEGURO): Kasm autoalojado en Hetzner/DO es tratado como centro de datos, pero como usa Chrome con cabeza, DDG deja buscar o muestra su rompecabezas y Google muestra reCAPTCHA que el usuario resuelve. Cloudflare/Menlo/Zscaler: rangos publicados y peering; aun así Cloudflare advierte de captchas por IP compartida y vende IPs de egreso dedicadas o salida por el firewall del cliente. Privacy Pass (RFC 9576/9578): tokens de «humano» solo con emisores reconocidos (Apple, Cloudflare).

## C. Lo legítimo y lo que no
- Chromium con cabeza manejado por una persona, sin HeadlessChrome ni webdriver: SEGURO, completamente legítimo. Esos flags existen para señalar scripts automatizados; en ZERO quien mueve el ratón es una persona (equivale a RDP/VNC). El error de arquitectura actual: Playwright mete --headless y --enable-automation porque es un framework de pruebas; al dejarlos, ZERO «declara falsamente» ser un script sin pantalla.
- Línea roja: legítimo = headed sobre Xvfb o headless:false quitando --enable-automation; ilegítimo = falsificar la huella (decir Mac con GPU Apple siendo Linux en Hetzner; stealth plugins), resolver captchas automáticamente (2Captcha, CapSolver), rotar proxies residenciales de botnets, extraer resultados sin usuario.
- Términos de Google/Bing/DDG/Brave (SEGURO): prohíben acceso automatizado; no prohíben que un humano use un navegador alojado en un servidor. Hetzner: navegar desde un VPS (VPN personal, Kasm) es uso normal.
- Cabecera X-GUARDIANA-ZERO (SEGURO): no evita nada y puede empeorar (cabecera no estándar altera la huella). Publicar rangos, rDNS (p. ej. egress-nue-01.motor.guardianagroup.com), página informativa en la IP y abuse@: buena ciudadanía, no desactiva reglas automáticas.
- Whitelists: Cloudflare Verified Bots solo para bots; Google ISP Portal/Geofeed (RFC 8805) solo para dueños de ASN/prefijos (Hetzner), no para IPs de VPS; IAB listas para métricas publicitarias; DDG y Brave sin formularios de whitelisting.

## D. Alternativas y plan
- Arreglar la celda (headed en Xvfb, headless:false, ignoreDefaultArgs ['--enable-automation'], --disable-blink-features=AutomationControlled, fuentes fonts-liberation/noto/dejavu): SEGURO, DDG deja de dar 418 de inmediato en la mayoría de IPs limpias de Hetzner; Brave reduce captchas y, si sale, la persona lo arrastra y la cookie dura la celda.
- Brave Search API (SEGURO): gratis hasta 2.000 consultas/mes (1/s), plan Base 3 USD por 1.000; sin captcha. Bing API: retirada en 2023, precios prohibitivos. DDG: sin API de resultados web. Google PSE JSON: 100/día gratis, 5 USD/1.000, tope 10.000/día, restricciones de interfaz. Kagi: API cerrada; Mojeek: ~£1.50–2.00/1.000, menos relevancia en español. SearXNG en la misma IP: mismos bloqueos.
- Proxies residenciales (Bright Data, Oxylabs, IPRoyal): NO (SDKs en apps gratuitas, contra los principios de GUARDIANA). IP de «ISP empresarial»: 150–500 USD/mes. Servidor en casa del dueño: no (latencia +300 ms, IP personal expuesta y quemada).
- DDG .onion con 418 vía Tor: porque enviaba UA HeadlessChrome por el circuito Tor; Tor Browser presenta Firefox ESR estándar.
- Plan: Paso 1 (0 €, hoy): Chromium con cabeza sin flags de automatización + fuentes. Paso 2 (0 € hasta 2.000/mes, luego 3 USD/1.000): barra de búsqueda nativa de ZERO con Brave Search API; clic abre en la celda; google/ddg manuales siguen posibles. Paso 3 (~1,20 €/mes por IP): IP de salida separada con página informativa y abuse@.

## E. Texto de pantalla
«Por qué este buscador te pide confirmación (o bloquea la consulta). Qué está pasando: navegas desde una celda aislada de GUARDIANA ZERO en un centro de datos, no desde tu casa; la web ve la IP de nuestro servidor, nunca la tuya. Por qué: muchos programas automáticos usan servidores para extraer información en masa; el buscador solo ve que llega desde un servidor y no puede saber que detrás estás tú, así que comprueba por precaución. Qué puedes hacer: si ves un rompecabezas o casilla, resuélvelo con el ratón (el buscador lo recuerda mientras dure la celda); si no te deja avanzar, usa el buscador integrado de ZERO (conexión oficial, sin verificaciones) y abre los enlaces aquí dentro.»
