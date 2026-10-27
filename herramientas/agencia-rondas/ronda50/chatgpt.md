# ChatGPT (esfuerzo «Alta», chat «Cambiar arquitectura ZERO») — ronda 50, A–D. Pensó 1 min 51 s. Copia del texto de la página (las fichas de fuente aparecen como «Nombre +1»).

Ronda 50 · ZERO ULTRA: Tor rápido y búsquedas sin CAPTCHA

Veredicto (26 de octubre de 2026): la solución más sólida es Brave Search API para buscar y Tor para visitar los resultados. Así se elimina el CAPTCHA del buscador sin eludir ningún control. Los sitios visitados todavía podrán pedir verificaciones.

## A. Acelerar Tor sin sacrificar anonimato

Hechos comprobables: Tor añade circuitos y latencia; no puede garantizar la velocidad de una conexión directa. Tor Metrics publica mediciones reales de descarga, latencia y construcción de circuitos. [Tor Metrics +1]

Mi recomendación técnica, por prioridad:

- Precalentar Tor: mantener el demonio iniciado, con bootstrap completado y circuitos disponibles antes de abrir ULTRA.
- Conflux: utilizar una versión actualizada de C Tor y comprobar si Conflux está habilitado y negociado. Puede mejorar el rendimiento mediante circuitos múltiples; no elimina la latencia. Para servicios .onion, su soporte continúa figurando como planificado. [mail-archive.com +1]
- No seleccionar guardas manualmente: Tor elige guardas estables por razones de seguridad. No forzar nodos supuestamente rápidos ni reducir saltos. [Acerca de Tor — Tor]
- Servidores próximos: probar Miami frente a Núremberg desde Colombia. La mejora afectaría al tramo usuario-servidor; la salida Tor puede continuar estando lejos.
- Optimizar screencast: evitar enviar fotogramas idénticos, mantener una sola imagen pendiente, descartar fotogramas antiguos y adaptar resolución/calidad. Considerar vídeo WebRTC para sesiones largas.
- Reutilizar conexiones: HTTP/2 y conexiones persistentes donde sean compatibles. Caché de recursos públicos con aislamiento entre usuarios; nunca compartir cookies ni contenidos privados.
- Arti: experimentar, pero no migrar por una supuesta mejora de velocidad. Tor Project advierte que todavía puede rendir peor que C Tor. [Arti]

Latencia realista: los 165 ms Bogotá–Núremberg ya medidos son el RTT de vuestro transporte, antes del tiempo adicional de Tor, del servidor de destino y de la renderización. No dispongo de mediciones suficientes para dar una cifra fiable de ULTRA. Hay que medir p50/p95 de navegación, no prometer «velocidad normal».

## B. ¿Brave Search .onion evita verificaciones?

No está garantizado.

Brave confirma oficialmente esta dirección: search.brave4u7jddbv7cyviptqjc7jusxh72uik7zt6adtckl5f4nwy2v72qd.onion

Es un servicio onion auténtico y evita el nodo de salida. Pero Brave documenta sus CAPTCHA y mecanismos de prueba de trabajo. Eso también puede afectar a usuarios de Tor. No he verificado una búsqueda funcional desde vuestra celda hoy. [Brave Help Center +2]

Otros servicios documentados:
- DuckDuckGo: tiene onion oficial según Tor Project, aunque vuestro resultado 418 lo descarta operativamente por ahora. [Tor Browser — Tor]
- Ahmia: ofrece versión onion, especializada en buscar servicios onion, no la web general. [Ahmia]

No he confirmado otros buscadores generales .onion que permitan prometer acceso sin CAPTCHA en octubre de 2026.

## C. Evaluación de las cinco ideas

| Idea | Veredicto | CAPTCHA |
|---|---|---|
| a) Brave .onion | Mantener como opción experimental | Posible |
| b) API oficial + visitas Tor | Primera elección | Sin CAPTCHA web en la búsqueda |
| c) Buscar localmente | Segunda elección; requiere extensión | Puede aparecer |
| d) Comprobación manual | Respaldo | La persona debe resolverla |
| e) Privacy Pass / acuerdos | Investigar en paralelo | Sin garantías |

Costes y condiciones verificadas

- Brave Search API: 5 USD por 1.000 consultas, con 5 USD mensuales de crédito. La licencia permite utilizar resultados en aplicaciones cliente, pero los términos del 1 de septiembre de 2026 prohíben redistribuirlos, revenderlos y almacenarlos salvo transitoriamente, entre otras restricciones. Para almacenamiento persistente hacen falta derechos contractuales específicos. Conviene obtener confirmación escrita del uso comercial previsto. [API +1]
- Mojeek API: desde 2 GBP por 1.000 consultas, impuestos excluidos. Ofrece planes para productos de búsqueda, derechos de almacenamiento y resultados JSON. Es un segundo proveedor interesante. [mojeek.com]

En la opción b, Brave recibe la consulta y la identidad contractual de GUARDIANA, no directamente la IP del usuario. GUARDIANA sí puede conocer la búsqueda. No debe anunciarse anonimato absoluto.

La opción c revela consulta e IP al buscador. La opción d requiere sesiones aisladas por usuario; resolver una verificación no garantiza desbloqueo permanente.

Privacy Pass puede reducir comprobaciones en servicios participantes, pero no es un pase universal. Web Bot Auth permite identificar agentes firmados, aunque Cloudflare y cada sitio conservan sus políticas de acceso. Un acuerdo o lista permitida podría ayudar, pero no garantiza la aceptación de un navegador remoto interactivo. [Cloudflare Privacy Pass docs +1]

## D. Una solución adicional

Propuesta propia: separar definitivamente los dos transportes.

- Buscador integrado de ZERO
- Buscar: Brave API o Mojeek API mediante conexión oficial
- Visitar: Chromium remoto por Tor, con circuitos aislados
- Resultados dentro de ZERO; la visita no expone la IP del usuario al destino

Añadiría búsqueda sin precarga de resultados, sin enviar el texto consultado a servicios de analítica y sin compartir cachés privados. También verificaría DNS, WebRTC y conexiones que puedan escapar del proxy Tor.

Decisión final: implantar Brave API + Tor, contratar Mojeek como alternativa si las condiciones encajan y probar Brave .onion sin depender de él.

Esto permite ofrecer búsquedas integradas sin CAPTCHA web, con autorización del proveedor. No permite prometer que todas las páginas visitadas mediante Tor estarán libres de comprobaciones. Esa limitación debe quedar clara en GUARDIANA.
