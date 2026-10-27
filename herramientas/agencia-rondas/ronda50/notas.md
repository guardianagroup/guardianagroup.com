# Ronda 50 · notas de Claude (26 Oct 2026, 22:05 Bogotá)

Voces: ChatGPT («Alta»; A–D y E–I), Gemini (A–D y E–K) y Astra 6 (A–D, E–H, I–K). Regla: solo se aplica lo que confirman al menos dos.

## Lo que confirman dos o más voces

- **Velocidad de Tor (A, las tres):** demonio siempre encendido con circuitos ya hechos; Tor al día y Conflux si está; no forzar guardas ni quitar saltos; afinar el screencast (último cuadro gana, sin atrasos); Miami mejora el ratón y la pantalla, no Tor. **No prometer «velocidad normal»** y medir p50/p95 antes de dar cifras.
- **Brave por .onion (B):** dirección oficial (ChatGPT la confirma en la ayuda de Brave). No garantiza que no haya comprobación (las tres).
- **Búsqueda sin captcha (C, las tres):** la vía honesta es un **canal oficial** (API o elemento oficial) para buscar y la celda para visitar. Respaldo: que la persona pulse la comprobación. La extensión, lo último.
- **Tor capado (E, las tres):** el SOCKS propio con lista blanca de .onion vale, **pero no basta**: también hay que impedir localhost, redes privadas y metadatos del proveedor, y cerrar UDP/QUIC/WebRTC. Lo ideal es un cortafuegos que obligue a pasar por el filtro. Bloquear .onion no hace legal toda la web normal, y hay que decirlo.
  - **Hecho hoy:** `filtro-red.js` en todas las celdas, para localhost, privadas, enlace local y .onion.
  - **Pendiente:** cortafuegos por usuario y celda en microVM.
- **Listas (E):** IWF solo con membresía (ChatGPT, Gemini, Astra). URLhaus con clave y uso comercial a confirmar (las tres). Google Web Risk es la vía comercial; Safe Browsing gratuito no es para uso comercial (ChatGPT, Gemini, Astra). No hay lista global de «mercados ilegales» (ChatGPT, Astra).
- **Webs que rechazan la celda (F, las tres):**
  - un **aviso claro + botón «Abrir fuera de ZERO»**, diciendo que fuera no hay protección;
  - una página pública del nodo con contacto de abuso y rDNS;
  - pedir acceso a los editores (ChatGPT, Astra).
  - Una segunda salida sirve solo para tener redundancia, nunca para saltarse bloqueos.
  - No existe forma honesta de abrir todas las webs dentro de la celda.
- **Celda sellada (G):**
  - solo llegan imágenes, así que la exposición del PC baja mucho (las tres);
  - un contexto de Playwright no es una frontera de seguridad: hace falta microVM o contenedor duro por celda (ChatGPT, Astra);
  - quedan riesgos: descargas sacadas, phishing, portapapeles y escape en el servidor (las tres);
  - sellar ante señales graves y destruir si falla el aislamiento o la salida (ChatGPT, Astra; Gemini: destruir si sale un señuelo);
  - indicadores solo con evidencia real.
- **Ideas (H) con dos o más voces:**
  - aduana de descargas con exportación consciente;
  - recibo o acta firmada de la sesión;
  - identidad del sitio siempre visible y freno al phishing en webs nuevas o que imitan;
  - «cortar y empezar limpio»;
  - mostrar el viaje de un enlace o conexión antes de entrar.
- **Buscador propio curado (I, las tres):**
  - viable como colección explícita, no como sustituto de Google;
  - Tranco CC BY 4.0, global (Astra, Gemini);
  - Cloudflare Radar CC BY-NC, que no vale para uso comercial (Astra, Gemini);
  - para empezar, Meilisearch o Typesense (Astra, Gemini);
  - respetar robots.txt y no disfrazar el rastreador.
  - Sin cifras de servidor hasta medir.
- **Google (J, Astra y Gemini):**
  - el **Search Element oficial por país**, limitado a su colección, es legítimo, con aviso de privacidad;
  - no tocar anuncios ni atribución;
  - abrir los resultados orgánicos en la celda es aceptable por mecanismos del elemento;
  - combinar cajas para rehacer una búsqueda general necesita confirmación de Google (Astra), así que se queda una caja por país;
  - preguntar a Google por la web completa: **hecho**, con el formulario «Web Search Products Interest Form» enviado desde hola@guardianagroup.com con la caja de España.
- **Redes e IAs (K, Gemini y Astra):** las IAs, por API oficial en interfaz propia (el dueño quitó PUERTA IA: no se rehace sin que lo pida). Para redes sociales, **aviso antes de iniciar sesión**: puede haber verificaciones o bloqueos por entrar desde un centro de datos de otro país. Se ofrece abrirlas fuera de ZERO.

## Discrepancias o sin confirmar (no usar)
- Licencia de CrUX: Astra dice CC BY 4.0 y Gemini «Apache 2.0»; hay que verificarla en la fuente.
- Precios de Grounding, «gemini-3.8-flash», latencias y tamaños de servidor de Gemini: sin fuente.
- Cloudflare for Families o Quad9 como filtro DNS (solo Gemini).
