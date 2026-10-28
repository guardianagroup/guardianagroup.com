# Ronda 69 · Órbita: el mapa de las amenazas · cruce

27 Oct 2026, 17:54–20:10 (Bogotá). Voces: ChatGPT («Alta», con web; `chatgpt.md`), Gemini (Argon; `gemini.md`), Astra 6 (Cheaper Inference; `astra.md`) y Claude (licencias comprobadas en las páginas oficiales; `claude-fuentes.md`). Pregunta: `pregunta.md`. Notas escritas a las 20:20.

## Lo que dicen las cuatro voces (coinciden)

1. **Sí a una capa «AMENAZAS» en Órbita; no a un ranking de «países más peligrosos» ni de «países que roban datos».** No existe una respuesta mundial fiable a «dónde se roban más datos».
2. **El país del servidor no es el del delincuente** (VPN, equipos comprometidos, alquiler de servidores). Mensaje fijo: «La ubicación de la infraestructura no identifica al responsable». Categoría «Ubicación desconocida».
3. **Capas separadas que nunca se mezclan:** infraestructura de malware, suplantaciones (phishing), actividad observada, impacto denunciado (denuncias y filtraciones) y lo que ZERO ha detectado. Astra añade la capacidad de respuesta de cada país (ITU, NCSI), con permiso.
4. **Gratis no significa reutilizable:**
   - Cloudflare Radar: los datos de la API son CC BY-NC (no valen para un producto de pago); los gráficos insertables, CC BY 4.0;
   - Kaspersky y Check Point: no;
   - Shadowserver: licencia para uso comercial;
   - OpenPhish: consentimiento escrito;
   - HIBP: CC BY 4.0, sin país de las víctimas;
   - ITU GCI: CC BY-NC-SA 3.0 IGO, con permiso escrito.
5. **Cada ficha dice** qué se cuenta, dónde, cuándo, con qué cobertura y qué no permite concluir. Cifras absolutas y tasas con denominadores compatibles. «Sin datos» se distingue de «sin detecciones».
6. **Diseño:** una entrada «AMENAZAS» y una capa cada vez, sin arcos ni explosiones, ficha en lenguaje claro y «Ver las fuentes». En el móvil, búsqueda y lista; el globo es opcional.
7. **La capa propia de ZERO** es lo más diferenciador: el país del servidor de las webs que ZERO detuvo, agregado. Nunca IP de usuarios, URL completas ni historiales, y con umbrales mínimos. No son «víctimas por país»: ZERO sale a internet desde nuestro servidor.
8. **Ley:** Ley 1581 y RGPD, canal de corrección y retirada, y no señalar a las empresas de alojamiento como cómplices.

## Donde discrepan

- **abuse.ch:** Gemini dice «CC0, uso comercial libre». Claude comprobó que **solo Feodo Tracker es CC0** (y hoy está vacío); URLhaus, ThreatFox y MalwareBazaar pueden requerir una suscripción comercial con Spamhaus.
- **Spamhaus:** Gemini y Astra la tratan como de pago o con permiso. Claude comprobó que **DROP es «free for any use»**, citando a Spamhaus (una descarga por hora como máximo); DBL sí requiere suscripción.
- **Primera fuente externa:** DShield (ChatGPT), abuse.ch (Gemini) o negociar una fuente principal (Astra). DShield y PhishTank siguen por comprobar; el registro de PhishTank está cerrado temporalmente.
- **Normalizar por habitantes:** Gemini sí; Astra, no para URL maliciosas («riesgo personal» inventado).
- **Colores:** los de Gemini no son los de GUARDIANA. ChatGPT propone coral para lo confirmado, ámbar para los avisos y gris para «sin datos suficientes», que encaja con la paleta.
- **Coste «0 US$»** (Gemini): depende de las licencias. Los demás: datos casi gratis con fuentes compatibles; el desarrollo, por medir.
- **Cuándo publicar la capa de ZERO:** días 4–6 (Gemini), semanas 2–4 (ChatGPT) o aparte, tras una revisión de privacidad (Astra).

## Propuesta de Claude

- **Empezar solo con fuentes de licencia comprobada:**
  - Phishing.Database (MIT, conservando el aviso);
  - Spamhaus DROP (con atribución);
  - el catálogo de HIBP (CC BY 4.0) como contexto, sin países;
  - los gráficos insertables de Cloudflare Radar (CC BY 4.0);
  - la capa agregada de ZERO.

  País estimado con IP2Location LITE (con atribución).
- **Pedir permiso por escrito:** DShield, PhishTank, abuse.ch (cotización con Spamhaus) y los datos de Cloudflare Radar.
- **Frases:** «País con más indicadores observados en esta fuente y periodo»; nunca «el país más peligroso».
- **Decide el dueño:** aprobar «AMENAZAS» con capas separadas, empezar con estas fuentes y la de ZERO, y no comprar licencias todavía.
