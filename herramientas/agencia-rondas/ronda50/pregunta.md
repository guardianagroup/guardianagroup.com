# Ronda 50 · ZERO · Tor lo más rápido posible y búsqueda sin captcha, de forma honesta (26 Oct 2026, 21:15 Bogotá)

Contexto:
- ZERO es un navegador remoto: Chromium (Playwright) en una celda de un servidor de GUARDIANA (Hetzner, Núremberg; quizá otro en Miami). La persona lo maneja desde una página web y ve la pantalla por CDP screencast (JPEG) sobre WebSocket. Ida y vuelta medida Bogotá ↔ Núremberg: unos 165 ms.
- Modo ULTRA: el tráfico de la celda sale por Tor (demonio tor en el mismo servidor, por SOCKS). Para buscar en ULTRA usábamos DuckDuckGo por .onion: responde 418 (bloqueado). Fuera de Tor, desde la IP del servidor: Google pide reCAPTCHA (casilla), Brave enseña «Verificando que no eres un bot» con un botón, Bing y Qwant funcionan.
- Lo que pide el dueño: (1) Brave y Tor dentro del navegador, sin DuckDuckGo; (2) Tor «lo más rápido posible, ideal a la velocidad normal de una web»; (3) que no pidan captcha: «inventad una forma humana de hacerlo, pero hay que hacerlo; es un servicio que hay que dar sí o sí desde este navegador».
- Límites que NO se tocan: nada de sigilo (agente de usuario falso, ocultar la automatización, huellas falsas), nada de resolver captchas de forma automática, nada de rotar IPs ni proxies residenciales, nada de saltarse muros de Cloudflare. Sí vale: canales oficiales y de pago, que la persona resuelva ella misma una comprobación, identificarnos de forma honesta, acuerdos con los buscadores, hacer parte del trabajo en el equipo de la persona.
- Ideas que tenemos (valóralas con honestidad):
  a) Brave Search por su .onion oficial (search.brave4u7jddbv7cyviptqjc7jusxh72uik7zt6adtckl5f4nwy2v72qd.onion, anunciada por Brave en 2021): sin nodo de salida.
  b) «Buscar por canal oficial, visitar por Tor»: la consulta va a la API oficial de un buscador (p. ej. Brave Search API) desde el servidor de GUARDIANA, por Tor o no, con nuestra clave; ZERO pinta los resultados; el clic abre la web en la celda por Tor. El buscador ve la clave de GUARDIANA, no a la persona.
  c) Buscar desde el equipo de la persona (extensión): la consulta la hace su navegador con su IP (persona real, normalmente sin captcha) y solo la visita va por Tor (pierde anonimato frente al buscador).
  d) Que la persona pulse ella misma la comprobación del buscador dentro de la celda y conservar esa sesión el tiempo que el buscador permita.
  e) Privacy Pass / tokens de Cloudflare; Web Bot Auth o «agentes firmados» (identificarnos con firma HTTP); pedir a Brave o a Cloudflare una lista de permitidos para nuestros nodos, con página pública del nodo, rDNS y abuse@.

Preguntas (responde en español, concreto, máximo 900 palabras; separa «hecho comprobable» de «opinión»; no inventes cifras: si das una, di de dónde sale):
A. Velocidad de Tor: ¿qué podemos hacer, de forma legítima, para que navegar en ULTRA se acerque a una web normal? (Conflux, servicios .onion frente a nodos de salida, circuitos precalentados, elección de guardas, Arti, HTTP/2, caché, ajustes del screencast, ubicación del servidor…). ¿Qué latencia es realista y qué NO debemos prometer?
B. ¿Brave Search por .onion pide comprobación? ¿Qué buscadores tienen hoy un .onion oficial y usable?
C. De las ideas a–e, ¿cuál es la forma honesta y «humana» de dar búsqueda sin captcha en ZERO, también en modo Tor? Orden recomendado, coste aproximado (con fuente) y riesgos de términos de uso de cada una (p. ej. lo que permiten los términos de la API de Brave sobre mostrar resultados, guardarlos o revenderlos).
D. ¿Alguna forma mejor, dentro de los límites, que no se nos haya ocurrido?
