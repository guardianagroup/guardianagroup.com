# Modelo: gpt-6-astra (Cheaper Inference, Playground) — ronda 50, A–D (con la nota de prioridad web). Texto entre «ASSISTANT OUTPUT» y «Response headers».

## A. Velocidad de ULTRA

Hechos comprobables

- Hay dos recorridos distintos: persona ↔ celda, para controlar y ver Chromium, y celda ↔ destino por Tor, para cargar contenido. Optimizar uno no elimina el otro.
- Los 165 ms que aportáis son el RTT Bogotá–Núremberg: una interacción que necesite enviar una orden y recibir su efecto visual ya soporta aproximadamente ese coste de red, además del procesamiento y la transmisión de imagen. No es una medición de Tor.
- Conflux, incorporado en la serie Tor 0.4.8, permite distribuir tráfico entre circuitos compatibles. Puede mejorar rendimiento y mitigar circuitos lentos; no elimina los saltos ni garantiza mejorar el tiempo hasta el primer byte. Fuente: documentación y notas de versión de [Tor](https://www.torproject.org/).
- Un servicio .onion evita el nodo de salida, pero utiliza circuitos y un punto de encuentro. No es necesariamente más rápido que HTTPS por una salida.
- Chromium sobre SOCKS Tor no ofrece automáticamente las protecciones de Tor Browser. Debéis comprobar DNS, WebRTC y cualquier conexión directa.

Opinión / implementación recomendada

1. Actualizar Tor a una versión estable mantenida; comprobar soporte y uso efectivo de Conflux, sin prometer milagros.
2. Mantener el demonio conectado y dejar actuar su construcción anticipada de circuitos. No lanzar NEWNYM por consulta ni construir circuitos constantemente.
3. Conservar la selección normal de guardas. No elegir sistemáticamente guardas “cercanas” ni reducir saltos: compromete el modelo de privacidad y puede empeorar estabilidad.
4. Reutilizar conexiones y aprovechar HTTP/2 cuando el destino lo negocie. Caché por usuario/sesión, respetando cabeceras; no compartir contenido privado entre personas.
5. Separar sesiones Tor entre usuarios; no sacrificar aislamiento para ganar rendimiento.
6. En screencast: ajustar resolución, calidad JPEG y frecuencia; descartar imágenes atrasadas y aplicar contrapresión. Priorizar mostrar lo reciente, no acumular fotogramas.
7. Comparar Miami y Núremberg con pruebas reales. Miami puede mejorar el control desde Bogotá, pero no garantiza mejores circuitos Tor.
8. Evaluar Arti por compatibilidad y operación, no como acelerador garantizado.

Latencia realista: con vuestra única medición no se puede dar un tiempo fiable de carga Tor. Medid percentiles de entrada→imagen, primer byte y carga útil, con circuitos fríos/calientes. Prometed mejoras medidas, no “velocidad normal” ni un máximo universal.

## B. Brave y buscadores .onion

Hecho / límite de verificación: no dispongo aquí de acceso en vivo para comprobar disponibilidad, tarifas o comprobaciones a fecha de hoy.

- No puedo afirmar que la dirección de Brave indicada esté actualmente operativa, sea la oficialmente publicada o esté libre de comprobaciones. Validarla exige una referencia vigente de Brave —por ejemplo, su web HTTPS u Onion-Location— y pruebas desde vuestra celda. Un anuncio antiguo no basta.
- DuckDuckGo tiene un onion oficial conocido, pero vuestro 418 demuestra que no os resulta usable en esa prueba; no demuestra una indisponibilidad universal.
- Ahmia publica acceso onion desde [ahmia.fi](https://ahmia.fi/), pero busca servicios onion: no sustituye a un buscador general.

No ofrecería una lista de “oficiales y usables hoy” sin verificarlos. Ser onion no implica estar exento de controles antibot.

## C. Orden recomendado de a–e

### 1. b: API oficial + resultados propios + visitas por Tor

Es la solución principal: funciona íntegramente desde GUARDIANA, sin extensión ni programa adicional.

El backend consulta la API con vuestra clave; ZERO presenta resultados y abre los destinos mediante Tor. Una API contratada evita depender del desafío interactivo de la web pública, aunque puede devolver límites, errores o suspender credenciales.

El buscador recibe la consulta y conoce vuestra cuenta. Si no enviáis identificadores del usuario, no recibe automáticamente su IP; eso no hace anónima la consulta, que puede contener datos personales.

Si la API sale directamente, etiquetadlo explícitamente: “Búsqueda mediante API de GUARDIANA; navegación por Tor”. No anunciéis que todo sale por Tor. Consultar la API mediante Tor requiere verificar aceptación y rendimiento.

Coste y términos: fuente oficial: [Brave Search API](https://brave.com/search/api/). No puedo verificar su tarifa vigente y no daré una cifra como cotización. Presupuestad consultas facturables × tarifa, más infraestructura. Confirmad por escrito derechos para mostrar resultados a vuestros usuarios, atribución, retención/caché y eventual redistribución. Mostrar resultados en una aplicación no equivale a poder almacenar indefinidamente o revender el feed.

### 2. d: comprobación manual como respaldo

Honesta y compatible con vuestro canal web. Conservad cookies dentro de la sesión y durante el plazo permitido. No garantiza ausencia de nuevos desafíos. Coste: interacción humana y soporte; respetar términos del buscador.

### 3. a: onion oficial, si se valida

Ruta adicional, no garantía contractual de disponibilidad ni de ausencia de captcha. Coste operativo propio; siguen aplicando los términos del sitio.

### 4. e: acuerdo comercial

Contactaría primero al buscador. Privacy Pass y agentes firmados solo sirven donde estén admitidos; no son pases universales. Cloudflare no puede autorizaros globalmente frente a las decisiones de cada cliente. Una lista de permitidos para vuestra IP directa no cubre las salidas Tor. Precio: negociación.

### 5. c: extensión

Última opción: expone la IP personal al buscador y tampoco garantiza cero captcha. Automatizar o extraer su web puede incumplir términos.

## D. Alternativa mejor

Opinión: ofrecer búsqueda contractual con proveedor principal y respaldo autorizado, ambos accesibles desde la web. Si fallan, mostrar error o alternativa explícita, nunca evadir controles.

La promesa sostenible es “búsqueda sin captcha interactivo mediante canal oficial”, no “cualquier buscador y cualquier web sin captcha”.
