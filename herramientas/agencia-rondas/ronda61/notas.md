# Ronda 61 · El buscador propio («un Google, pero de GUARDIANA») · cruce

27 Oct 2026, 15:20–16:40 (Bogotá). Voces: Gemini (Argon; `gemini.md`) y ChatGPT («Alta», con web; `chatgpt.md`). Claude comprobó en páginas oficiales lo marcado. Pregunta: `pregunta.md`.

## Lo que dicen las dos voces (se hace así)

1. **Híbrido**: un índice propio pequeño (las webs importantes de cada país) y una API contratada para el resto. Un índice de toda internet no es posible para un equipo pequeño.
2. **Los resultados se abren en ZERO**, cada uno con su Radiografía; sin registro de búsquedas, sin perfil y sin publicidad personalizada; las búsquedas salen desde el servidor de GUARDIANA, nunca con la IP de la persona.
3. **Primero dentro de ZERO**, como buscador por defecto cuando funcione bien, sin quitar Google, Brave ni Tor; **después, una página pública** (Gemini, ya; ChatGPT, cuando esté probado).
4. **Rastreador propio y educado** (robots.txt, RFC 9309, un nombre propio) y **Meilisearch** para empezar.
5. **«100 % limpio y 0 virus» no se puede decir.** Lo cierto: la web se ejecuta en un servidor de GUARDIANA, no en el equipo; no protege de lo que uno se descarga y abre fuera, de dar la contraseña en una página falsa ni de cuentas robadas.
6. **Los rankings**: Similarweb y Semrush, solo con contrato; Tranco, no comercial por defecto; CrUX, por bloques y no del 1 al 100.
7. **Leyes (mapa):** robots.txt, art. 15 de la Directiva 2019/790 (prensa: solo extractos muy breves), derecho al olvido (Google Spain, C-131/12), DSA (lo duro, a partir de 45 millones de usuarios en la UE), Ley 1581 y RGPD.
8. **Nombre:** «GUARDIANA Busca» (Gemini) o «GUARDIANA BUSCAR» (ChatGPT): el mismo nombre en esencia.

## Comprobado por Claude (páginas oficiales, 27 Oct 2026)

- **Cloudflare Radar: CC BY-NC 4.0** (no comercial). Gemini dijo CC BY: es un error. Para «las 100 más visitadas por país» con sus datos hace falta su permiso.
- **Bing Search APIs: retiradas el 11 de agosto de 2025** (Microsoft Learn, ciclo de vida).
- **Google Custom Search JSON API:** cerrada a clientes nuevos y con fin previsto en 2027 (varias fuentes; la página de Google no se abrió).
- **Mojeek** (su página de la API): Startup 2 £ y Business 3 £ por 1.000 consultas; Startup solo guarda en caché una hora; guardan 90 días, con retención cero a petición.
- **Brave** (su página de precios): gratis 2.000 al mes; Base 3 US$ y Pro 5 US$ por 1.000; con derecho a guardar resultados, 26–45 US$ por 1.000. (ChatGPT citó 5 US$ con 5 de crédito; un medio dice que quitaron el nivel gratis: hay que confirmarlo al contratar.)

## Donde discrepan

- **Cuántos países al empezar:** Gemini, 20 países (2.000 dominios); ChatGPT, 5 mercados (Colombia, España, México, Argentina y Brasil; 500 dominios).
- **De dónde sale la lista:** Gemini, CrUX por país; ChatGPT, una selección propia («las 100 más relevantes», no «las más visitadas») con Majestic Million (CC BY 3.0) como candidatas, hasta tener un ranking con licencia.
- **Proveedor:** Gemini, Brave; ChatGPT, Mojeek primero y Brave de reserva.
- **Listas de amenazas:** Gemini, URLhaus y ThreatFox (abuse.ch) y malware-filter, y PhishTank no; ChatGPT, Google Web Risk primero, PhishTank sí y URLhaus con su API comercial. Sin comprobar: no se decide nada aquí.
- **Coste:** Gemini, ~200–370 US$/mes con la API; ChatGPT, ~30 €/mes de servidores más lo que cueste la API.

## Propuesta de Claude al dueño

1. Hacer **GUARDIANA Busca** híbrido, primero dentro de ZERO (sin quitar los otros buscadores).
2. Empezar por **5 países** (Colombia, España, México, Argentina y Brasil) con una selección propia de webs importantes; no decir «las más visitadas» hasta tener datos con licencia (o pedir permiso a Cloudflare).
3. API para el resto: **Mojeek** (más barata y con retención cero a petición) y Brave de reserva; contratar solo cuando el índice propio funcione.
4. Frase honesta: «Busca sin que te perfilen y abre cada resultado en ZERO, lejos de tu equipo. Ningún navegador protege de todo.»
5. Decide el dueño: el nombre, los países, el proveedor y el presupuesto al mes.
