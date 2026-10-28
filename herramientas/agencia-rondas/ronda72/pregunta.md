Ronda 72 · GUARDIANA ZERO · ver de verdad el antes y el después de las subastas, sin instalar nada (28 Oct 2026, 11:30). Máximo razonamiento.

Eres parte de la agencia de GUARDIANA (empresa colombiana de privacidad). Responde en español, en bloques numerados y concretos. No inventes: fuente oficial o «no lo sé». Nada de promesas absolutas.

HECHOS (medidos hoy):
1. ZERO abre cada web en un Chromium que corre en un servidor (Hetzner, Núremberg); la persona solo recibe la imagen. Un sensor lee los eventos de Prebid.js de la página (auctionInit, bidRequested, noBid, auctionEnd, bidWon): qué empresas recibieron la petición de puja, qué llevaba cada una (página, consentimiento TCF, identificadores eids/userId, geo, segmentos, idioma, navegador) y las pujas con el CPM que declaran.
2. Prueba real hoy, una persona en Praga, dentro de ZERO, en elmundo.es, marca.com y as.com: subastas sí (por ejemplo, 18 empresas pedidas en una), pujas cero. Al permitir los anuncios se multiplican las subastas, pero sigue sin pujar nadie. Hipótesis: conexión de centro de datos (filtros de tráfico inválido) y navegador sin historial ni identificadores.
3. as.com (PRISA) a veces rechaza la burbuja con un muro antirrobot; al recargar, entra. ZERO no disfraza la conexión ni reintenta solo.
4. Existe una extensión ZERO (MV3, sin publicar) que lee lo mismo en el navegador de la persona, con su conexión real: ahí sí se verían pujas y precios.

LO QUE PIDE EL DUEÑO (literal): «Para que la persona sepa que esto pasa, tendría que haber alguna prueba real de conectar o desconectar… que vean con realidad de lo que le estamos librando»; «¿No hay forma de hacerlo sin extensión?… que sea todo desde ahí y se pueda ver». Y un documento descargable con el antes y el después.

LÍMITES: nada de simular pujas ni inventar precios; no esquivar filtros antifraude ni hacer pasar el servidor por una conexión doméstica; no generar subastas ni impresiones falsas; RGPD y ePrivacy; no usar «certificado» ni «certificada».

PREGUNTAS (4 bloques):
A. Sin instalar nada: ¿qué vías reales hay para que la persona vea las subastas de SU navegador desde la web? Valora cada una con sus límites (CSP, móvil, Safari, webs sin Prebid, subastas en servidor o de Google): (a) un marcador (bookmarklet) que, en la web abierta en su navegador, lee pbjs.getEvents() y lo enseña en un panel local, sin enviar nada; (b) una página de GUARDIANA que enseña lo que cualquier web ve de su conexión (IP y ubicación aproximada, navegador, idioma, cookies e identificadores) frente a lo que ve de la burbuja, sin precios; (c) que GUARDIANA haga su propia subasta Prebid de demostración, con consentimiento; (d) otra que conozcas. ¿Cuál recomiendas y por qué?
B. Cómo presentar el antes y el después honesto (misma web, mismo momento, dos navegadores): qué medir, qué no decir (el CPM no es el precio de los datos) y cómo evitar conclusiones falsas (variación entre cargas, consentimiento distinto, frecuencia).
C. El documento descargable: nombre (sin «certificado»), contenido mínimo y cómo hacerlo comprobable (huella, firma, sello de tiempo) sin guardar datos personales de más.
D. Riesgos legales o de reputación (RGPD, IAB TCF, términos de las webs, Prebid) y la frase exacta que pondrías en la web.
