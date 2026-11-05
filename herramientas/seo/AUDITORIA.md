# Auditoría SEO de guardianagroup.com · 5 de noviembre de 2026

Base auditada: `main` en `c99ef16d` (1.0.56 publicada). Rastreo local de las 291 páginas `.html` del repositorio (fuera `herramientas/`, `marca/`, `descargas/`, `extension/`, `zero-motor/`), con un script propio (`herramientas/seo/pruebas/rastreo.py`), más pruebas en Chromium (Playwright) con los agentes de usuario reales de Googlebot y Bingbot. Todas las cifras de este documento salen de esas pruebas; no hay ninguna estimada.

## 1. Lo más importante, en orden

### 1.1 Google y Bing móviles ven una web que redirige al aviso «solo PC» (hallazgo crítico)
Desde el 1 de noviembre, `marco/marco.js` y `marco/entrada.js` (cargados en el `<head>` de 245 páginas, antes de pintar nada) detienen la carga y hacen `location.replace('/solo-pc/')` cuando el agente de usuario parece un teléfono o una tableta. El rastreador principal de Google es el **móvil** (indexación *mobile-first* para todas las webs desde 2023) y su agente de usuario contiene «Android» y «Mobile», así que entra en esa condición. La página `/solo-pc/` lleva `noindex`.

Prueba hecha en local con Playwright (`herramientas/seo/pruebas/googlebot.js`, resultados en `googlebot.txt`):

| Agente | `/` | `/zero.html` | `/casos.html` | `/radiografias/` | `/en/cases.html` | `/pt/casos.html` | `/privacidad.html` |
|---|---|---|---|---|---|---|---|
| Googlebot Smartphone | → `/solo-pc/?l=es` (9 palabras) | → `/solo-pc/` | → `/solo-pc/` | → `/solo-pc/` | → `/solo-pc/?l=en` | → `/solo-pc/?l=pt` | se queda (4 387 palabras) |
| Bingbot móvil | → `/solo-pc/` | → `/solo-pc/` | → `/solo-pc/` | → `/solo-pc/` | → `/solo-pc/` | → `/solo-pc/` | se queda |
| Googlebot de escritorio | se queda (1 621 palabras) | se queda (1 128) | se queda (1 331) | se queda (544) | se queda (1 196) | se queda (1 359) | se queda |

Google trata una redirección por JavaScript como cualquier otra redirección: la página se registra como «Página con redirección» y el destino, al llevar `noindex`, no entra en el índice. Solo se salvan las páginas legales (privacidad, términos, contacto, política de firma), que `marco.js` deja pasar. Mientras esto siga así, el resto del trabajo SEO (sitemap, datos estructurados, títulos) no puede dar fruto en Google ni en Bing. Corregirlo cambia una decisión expresa del dueño («desde el móvil no se pueda abrir»), así que no se ha tocado: está en `PLAN.md` como decisión n.º 1, con dos opciones.

Nota: una excepción por agente de usuario (dejar pasar a Googlebot y bloquear a las personas) sería «redirección engañosa» según las políticas de Google (lo que ve el buscador no es lo que ve la persona que pulsa el resultado) y puede acabar en sanción manual. No es una opción.

### 1.2 Presencia real en los buscadores hoy
- Desde este entorno no se puede abrir Google ni Bing directamente (el proxy deniega la conexión, y la petición a Bing quedó sin autorizar). Con el buscador del sistema (cuatro consultas: `site:guardianagroup.com`, `"guardianagroup.com"`, `GUARDIANA navegador ZERO radiografías "guardianagroup"` y una de radiografías) **no apareció ninguna página de guardianagroup.com**; sí aparecen los *pull requests* del repositorio `github.com/guardianagroup/guardiana` (1.0.31 a 1.0.45). Es decir: hoy la marca se encuentra por GitHub, no por la web.
- Los dos archivos `googlea37076ee8a01cb59.html` y `googlec2bfc24ef6ae7e20.html` son dos verificaciones de Search Console (dos propiedades o dos cuentas). `bb17ba6ecb3c743017273b41551112b5.txt` es la **clave de IndexNow** (commit `0b9326f1`, 9 Oct 2026); vale para Bing, Yandex, Seznam, Naver y DuckDuckGo (a través de Bing).
- Lo que diga Search Console (páginas indexadas, «Página con redirección», «Excluida por noindex») solo lo puede ver el dueño: pasos en `GUIA-DUENO.md`.

### 1.3 Solo hay portada en español para los buscadores
`en/index.html` y `pt/index.html` son redirecciones con `noindex` hacia `/?lang=en` y `/?lang=pt`; la portada (`index.html`, 494 KB, 1 645 palabras) cambia de idioma en el cliente con JavaScript y declara 42 idiomas en `data-idiomas`. Google indexa una sola dirección, `/`, en español; las 41 traducciones de la portada y de Órbita no existen para ningún buscador. Lo mismo pasa con `/orbita/comunicaciones/` (una sola URL; en escritorio sin idioma guardado el DOM se pinta en inglés: el rastreador de escritorio vio un `h1` en inglés con 116 palabras visibles). Decisión en `PLAN.md` (n.º 2).

## 2. Rastreo de las páginas (estado en `c99ef16d`, antes de los cambios)

| Dato | Valor |
|---|---|
| Páginas `.html` rastreadas | 291 (109 `lang=es`, 89 `en`, 85 `pt`/`pt-BR`, 6 otros, 2 sin `lang`: los archivos de verificación) |
| Con `noindex` | 41 (404, gracias ×7, activar ×3, comprar ×3, instalar ×3, redirecciones de idioma ×10, Órbita, m/, e/, chat/, firma, solo-pc, nueva/, obras, offline, 2 radiografías antiguas) |
| Indexables | 250 (248 sin contar los dos archivos de verificación) |
| Sin `canonical` | 7 (los 2 de verificación, `orbita/zero/`, `orbita/multas/`, `orbita/comunicaciones/verificar/`, `orbita/zero/privacidad-extension.html`, `orbita/static/demo-web.html`) → **corregido** |
| Sin `description` | 4 (verificación ×2, `orbita/zero/`, `demo-web`) → **corregido** |
| Sin `hreflang` | 10 (portada, `inicio/`, 6 de Órbita, verificación ×2). 238 páginas ya llevaban es/en/pt + x-default. La portada no puede llevarlo (no hay portada en/pt indexable) |
| Sin JSON-LD | 19 indexables, entre ellas la **portada** → portada corregida (Organization, WebSite, WebPage, SoftwareApplication 1.0.56) |
| JSON-LD con migas de pan hacia `/es/`, `/en/`, `/pt/` (redirecciones `noindex`) | 55 páginas → **corregido** (apuntan a `/`) |
| `WebSite` (`#web`) referenciado y no definido | 23 páginas lo referencian; solo lo definía `nueva/` (noindex) → definido en la portada |
| Sin `og:image` / sin `twitter:card` | 8 / 8 (las mismas de Órbita + `inicio/`) → corregido en las de Órbita; `inicio/` tiene canonical a `/` y no cuenta |
| `title` > 60 caracteres | 28 (de 61 a 98; las radiografías de recibos) → **27 acortados** (`orbita/zero/privacidad-extension` también) |
| `description` > 155 | 18 (de 158 a 344) → **todas acortadas** |
| Títulos repetidos | 2 («GUARDIANA»: `inicio/` y `orbita/comunicaciones/`), ninguna descripción repetida |
| `h1` ≠ 1 | `orbita/multas/` (0: todo lo pinta JavaScript, el HTML tiene 2 palabras), `orbita/comunicaciones/` (2), `privacidad-extension` (2: es + en en la misma página) |
| Enlaces internos rotos | **0** (4 182 enlaces comprobados) · Recursos rotos (img/script/css): **0** |
| Imágenes sin `alt` | **0** (17 imágenes en páginas indexables; 3 con `loading="lazy"`) → 3 más con lazy en la portada |
| Letras de Google o CDN | 0 (las 9 páginas que nombran `fonts.gstatic.com` lo hacen como dato de una radiografía, no lo cargan) |
| Palabras vetadas en texto visible | «nadie puede» en `orbita/comunicaciones/` (ya anotado en TRASPASO-5NOV) y en `politica-firma.html`; «No garantizamos seguridad total» en términos (negación, correcto); «suite CNSA 2.0» (nombra los algoritmos, no dice «conforme»); «sociedad anónima» (forma jurídica); «los primeros recibos» (fecha). Sin cambios: es contenido |
| `theme-color` | faltaba en 3 páginas de Órbita → puesto |
| `<link rel="icon">` | faltaba en la portada (Google toma el favicon de la portada; el `.ico` tiene 16/32/48 px) → puesto, más `icon-192.png` |
| Scripts bloqueantes en el `<head>` | `/marco/marco.js` (4,3 KB) en 244 páginas y `entrada.js` en la portada: a propósito (deben correr antes de pintar); coste medido ≈ 0 ms en local |
| Página más pesada | `index.html` 494 KB de HTML (lleva es/en/pt dentro); `orbita/zero/` 364 KB |

## 3. sitemap.xml y robots.txt
- Antes: 214 direcciones, todas con `lastmod 2026-10-28` (la fecha del commit del sitemap, no la de cada página), sin hreflang. Faltaban 34 indexables; de ellas, 28 las dejó fuera el dueño el 28 Oct (guías del DNS ×18, por dentro ×3, comprobar un recibo ×3, zero.html ×3; `inicio/` tiene canonical a `/`). Las 18 guías del DNS están **huérfanas**: ninguna página las enlaza, y hablan del producto anterior («tu PC, guardián DNS de la casa»; los términos ya lo cuentan en pasado).
- Ahora: 219 direcciones (entran política de firma es/en/pt, verificar un comprobante y privacidad de la extensión), `lastmod` del último commit de cada archivo en `origin/main` (de 2026-10-30 a 2026-11-05) y 846 `xhtml:link` hreflang. Lo genera `herramientas/sitemap.py`; hay que ejecutarlo en cada publicación.
- `robots.txt`: permitía todo salvo `/marca/` y `/herramientas/`. Ahora también excluye `/zero-motor/` (código del servidor) y `/descargas/` (tres MSI de 63 MB que gastan el ancho de banda de GitHub Pages), declara `Googlebot-Image` y explica por qué el `noindex` va en la página. Aviso: `zero.html` (es/en/pt) carga `/marca/guardiana-simbolo.svg`, que robots.txt bloquea; es decorativo (`alt=""`), Search Console lo listará como «recurso bloqueado». Se respeta la regla del dueño sobre `/marca/`.
- 404: `404.html` con `noindex`, 16 KB, redirige por JS a la portada si procede. Correcto para GitHub Pages (devuelve 404 real).

## 4. Core Web Vitals en local (escritorio 1350×940, Chromium sin GPU, caché apagada; `herramientas/seo/pruebas/cwv.js`)
Lighthouse no se pudo instalar (el registro de npm está denegado por el proxy, 403), así que se midió con las API del navegador (`largest-contentful-paint`, `layout-shift`, `longtask`). El servidor es local: el TTFB real en GitHub Pages será mayor; TBT con GPU por software es peor que en un PC normal.

| Página | FCP | LCP | elemento LCP | CLS antes → después | TBT | tareas largas | KB | peticiones |
|---|---|---|---|---|---|---|---|---|
| `/` (portada) | 232 ms | 232 ms | la frase «¿Sabes a dónde van tus datos?» | 0,001 → 0,000 | **4 367 ms** | 30 | **10 775** | 21 |
| `/instalar.html` | 136 | 136 | párrafo | 0,001 → 0,001 | 0 | 0 | 238 | 10 |
| `/orbita/` (noindex) | 1 272 | 4 016 | h1 de NÚCLEO | 0,000 | 259 | 4 | 7 231 | 60 |
| `/zero.html` | 376 | 376 | párrafo `.lead` | **0,145 → 0,000** | 150 | 2 | 222 | 9 |
| `/como-funciona.html` | 136 | 136 | párrafo | 0,010 → 0,000 | 3 | 1 | 240 | 10 |
| `/casos.html` | 264 | 264 | h1 | **0,543 → 0,000** | 314 | 3 | 276 | 10 |
| `/en/index.html` → `/?lang=en` | 452 | 452 | la frase en inglés | 0,004 → 0,000 | 3 812 | 35 | 10 781 | 23 |
| `/pt/index.html` → `/?lang=pt` | 612 | 612 | la frase en portugués | 0,005 → 0,005 | 4 215 | 26 | 10 781 | 22 |
| `/en/cases.html` | 192 | 192 | h1 | 0,037 → 0,000 | 123 | 2 | 274 | 10 |
| `/pt/casos.html` | 236 | 236 | h1 | 0,087 → 0,000 | 128 | 2 | 276 | 10 |
| `/radiografias/` | 152 | 152 | h1 | 0,023 → 0,000 | 0 | 1 | 223 | 10 |

- **CLS**: el salto de `casos.html` (0,54, muy por encima del 0,1 que Google admite) y el de `zero.html` (0,145) eran el cambio de letra (`font-display: swap`): la página se pintaba con la letra de reserva y saltaba al llegar Schibsted Grotesk, Hanken Grotesk e Instrument Serif. Con la precarga de las tres letras (commit `c31fd613`) el CLS en local es 0,000 en todas las páginas interiores. Con red lenta (1,6 Mb/s, CPU ×4) queda un salto residual de 0,05 (casos) porque la letra sigue llegando después del primer pintado; la cura completa sería `font-display: optional` o una letra de reserva con `size-adjust`, que es una decisión de diseño (PLAN.md).
- **El planeta de la portada**: 9,7 MB de texturas JPEG (`earth.jpg` 0,66 MB, `earth-8k.jpg` 2,5 MB, `earth-day.jpg` 1,0 MB, `earth-clouds.jpg` 1,8 MB, `earth-day-8k.jpg` 3,7 MB; las 8K se piden cuando la GPU admite 8192 px, que es casi siempre) y 26–30 tareas largas (4,1–4,4 s de bloqueo, en parte por la GPU por software del entorno). No afecta al LCP (que es texto y llega en 0,2–0,6 s) ni al CLS (los lienzos están fijos), pero sí al INP y al consumo de datos: Google mide el INP en visitas reales (CrUX) y 4 s de hilo principal ocupado al cargar es un riesgo claro. Propuesta en PLAN.md: texturas en WebP/AVIF (sin perder resolución) y cargar las 8K después de la primera interacción o del primer desplazamiento.
- `/orbita/`: 7,2 MB y 60 peticiones, LCP 4 s; es `noindex`, no cuenta para el SEO, pero sí para quien entra desde la portada.
- INP no se puede medir sin interacción real; el proxy es el TBT.

## 5. Datos estructurados que ya había (y están bien)
Organization (`#org`, con `legalName` GUARDIANA GROUP S.A.S., correo público y sede en Bocagrande; en 100+ páginas), Article (radiografías, casos, negocio de tus datos), CollectionPage + ItemList (radiografías, empresas, guías), BreadcrumbList, WebPage, WebApplication (zero.html). Todo JSON válido (0 errores de parseo en 291 páginas). No hay FAQPage: ninguna página tiene preguntas y respuestas visibles en formato de FAQ; no se ha inventado ninguna.

## 6. Accesibilidad que afecta al SEO
- Contraste declarado en la portada: texto principal 19,6:1, secundario 9,1:1, rótulos 5,0:1 (`:root` de `index.html`); `a:focus-visible` y `button:focus-visible` con contorno de 2 px en acento. Correcto.
- Los lienzos del planeta llevan `aria-hidden`; las imágenes decorativas `alt=""`. Correcto.
- `orbita/multas/` no tiene contenido en el HTML (2 palabras): para un lector de pantalla y para Google todo depende del JavaScript. Google lo renderiza, pero más tarde y con menos garantías.

## 7. Palabras clave realistas por página (sin volúmenes: no hay datos propios de búsqueda)
Se proponen por lo que cada página dice de verdad y por cómo lo busca la gente; el dueño puede contrastarlas en Search Console («Rendimiento › Consultas») a las 4–6 semanas de estar indexada la web.
- Portada: «navegador que corta rastreadores», «ver conexiones de una web», «programa privacidad Windows», «mensajes encriptados sin cuenta», «mapa de cables submarinos» (es); «browser that blocks trackers», «see where your data goes» (en); «navegador que bloqueia rastreadores», «mapa dos cabos submarinos» (pt).
- `zero.html` / `orbita/zero/`: «navegador aislado», «navegador remoto», «abrir webs sin que vean mi IP», «navegador que enseña a quién se conecta una web» (es); «remote browser isolation for home», «browser that shows trackers» (en).
- `orbita/comunicaciones/`: «llamadas encriptadas sin cuenta», «enviar archivos encriptados sin registro», «videollamada sin cuenta» (es/en/pt).
- `casos.html` / `orbita/multas/`: «multas por privacidad», «multa RGPD TikTok», «sanciones protección de datos 2026» (es); «GDPR fines list» (en); «multas LGPD» (pt).
- `radiografias/*`: «qué datos envía Chrome», «Brave vs Chrome rastreo», «qué servicios consulta ChatGPT», «a dónde se conecta una IA» (es); «what data does Chrome send», «AI agent network activity» (en).
- `negocio-de-tus-datos.html`: «subasta de datos personales», «real-time bidding explicado», «quién compra mis datos» (es).
- `empresas/*`: el nombre de cada empresa + «qué hace con mis datos» / «rastreador» (es/en/pt).
- `como-funciona.html`: «cómo funciona GUARDIANA», «VPN postcuántica» (solo cuando la VPN salga de Órbita a la web pública; hoy la página habla de ZERO, Comunicaciones y Órbita), «antivirus» (hoy «próximamente»: no conviene posicionar lo que no se puede probar).
- Lo que no conviene perseguir hoy: «antivirus gratis», «VPN gratis», «mejor antivirus»: dominados por marcas con miles de enlaces, y GUARDIANA no puede decir «auditada», «certificada» ni «100 % seguro».

## 8. Lo que queda sin hacer (y por qué)
- Lighthouse y Core Web Vitals de campo: imposible desde este entorno; el dueño puede ver PageSpeed Insights (`https://pagespeed.web.dev/`) con la web publicada.
- Comprobación de la web en vivo (`guardianagroup.com`): el proxy la deniega (403); todo se ha medido sobre el worktree.
- hreflang y datos estructurados de la portada en inglés y portugués: dependen de que existan `/en/` y `/pt/` como páginas (decisión n.º 2).
- «nadie puede» en Comunicaciones y política de firma: contenido, pendiente del encargo de traducción ya anotado.
