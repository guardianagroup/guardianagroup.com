# GUARDIANA ZERO · extensión del navegador (Chrome, Edge, Brave) · 26 Oct 2026

Qué es: ZERO dentro del navegador de la persona. La web la abre su propio Chrome/Edge/Brave desde su conexión (Google, as.com y todo con normalidad); ZERO observa cada conexión, la clasifica con las mismas listas y la misma base de empresas que el motor de la celda, y lo enseña en el panel lateral. Por defecto **Observar** (no corta nada); la persona corta por empresa (Permitir/Cortar) o sube a **Normal** (listas públicas) o **Estricto** (toda otra empresa). Nada sale del equipo.

## Carpeta
- `zero/`: fuentes de la extensión (manifest MV3, `fondo.js` motor, `panel.*` panel lateral, `relevo.js`).
- `construir.py`: construye `dist/zero/` (copia el motor de `zero-motor/` convertido a módulos, los sensores, las listas, los datos de empresas, las reglas declarativas, los 42 idiomas y los iconos) y deja `dist/guardiana-zero-<versión>.zip`. `dist/` no se sube al repositorio.

## Probarla hoy (sin tienda)
1. `python3 extension/construir.py` (necesita las listas en `zero-motor/listas/*.txt`: `construye_listas.py`).
2. Chrome → `chrome://extensions` → activar «Modo de desarrollador» → «Cargar descomprimida» → carpeta `extension/dist/zero` (o descomprimir el zip).
3. Abrir cualquier web y pulsar el icono de ZERO: se abre el panel lateral.

## Cómo funciona por dentro
- `webRequest.onBeforeRequest` (solo lectura) → `cortes.decide()` (EasyList/EasyPrivacy/uBO) + `empresas.atribuye()` → sucesos «visto» por empresa y país.
- `webRequest.onErrorOccurred` con `ERR_BLOCKED_BY_CLIENT` = evidencia de corte (el suceso pasa a «cortado»). Tres estados honestos: visto / cortado con evidencia / coincide con un rastreador conocido.
- Cortes: `declarativeNetRequest`. Nivel Normal = conjunto estático `reglas/normal.json` (≤29.000 reglas `||dominio^` derivadas de EasyPrivacy, uBO privacy, EasyList y uBO filters; excepciones `@@` como `allow`); `reglas/malware.json` (uBO badware) siempre activo; Estricto = regla de sesión «bloquear toda tercera parte salvo main_frame»; Permitir/Cortar por empresa = reglas de sesión `allow`/`block` sobre los dominios conocidos de esa empresa (base de GUARDIANA + los vistos en la sesión).
- Sensores: `sensores.js` (mundo principal, `document_start`, todos los marcos) → `window.postMessage` → `relevo.js` (mundo aislado) → `chrome.runtime.sendMessage` → `fondo.js`.
- Panel: pide `estado` de la pestaña activa cada 2 s y cuando el motor avisa (`cambio`); idioma con `static/idioma.js` (42 idiomas; solo es/en abiertos).

## Publicar
- Chrome Web Store: cuenta de desarrollador (5 USD una vez), ficha con descripción, capturas 1280×800, categoría «Privacidad y seguridad», política de privacidad `https://guardianagroup.com/orbita/zero/privacidad-extension.html`, justificación de permisos (webRequest: observar; declarativeNetRequest: cortar lo que elige la persona; host_permissions: en cualquier web; scripting: sensores; sidePanel/tabs/storage/webNavigation: panel y memoria local). Sin código remoto. Como «comerciante» Google verifica al editor (organización: certificado de registro de la empresa).
- Edge Add-ons: mismo zip. Firefox: pendiente (MV3 con webRequestBlocking; adaptar manifest y `sidebar_action`).

## Límites conocidos (v0.1)
- Las reglas estáticas son un subconjunto de las listas (solo `||dominio^` con tipos y third-party; sin `domain=`, `redirect`, `removeparam`, cosméticos). Observar usa las listas completas para detectar.
- Otras extensiones o los escudos de Brave pueden cortar por su cuenta: el panel marca «cortado» cuando el navegador lo bloqueó, sin decir quién.
- Sin acta sellada, descargas retenidas ni ULTRA: eso queda en la celda remota o en el programa de escritorio.
