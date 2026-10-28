# Ronda 72 · Antes y después de las subastas, sin instalar nada · cruce

28 Oct 2026, 11:30–11:50 (Bogotá). Voces: ChatGPT (GPT-6, «Alta»; `chatgpt.md`) y Gemini (Argon, «Alto»; `gemini.md`). Astra no entró: saldo de Cheaper Inference 2,03 $ («too low to cover requests»). Pregunta: `pregunta.md`.

Origen: prueba real del dueño con un amigo en Praga dentro de ZERO (elmundo.es, marca.com, as.com): subastas sí (18 empresas en una), pujas cero, también al permitir anuncios. El dueño: «tendría que haber alguna prueba real de conectar o desconectar… ¿no hay forma de hacerlo sin extensión?… que sea todo desde ahí» y un documento descargable.

**En una frase:** desde guardianagroup.com no se pueden leer las subastas de otra web abierta en el navegador de la persona (política de mismo origen); sin instalar nada, lo honesto es una página «Comprueba tu exposición» (tu conexión real frente a la de la burbuja, también en móvil) más un marcador opcional en el ordenador que lee las subastas de la web abierta, y un informe firmado sin datos personales.

## Lo que dicen las dos voces (coinciden)
1. **No hay vía web universal**: la política de mismo origen lo impide y no se debe intentar eludir.
2. **Prioridad 1: página de contraste / «Comprueba tu exposición»**: dos columnas (tu navegador / dentro de ZERO), medidas de verdad en los dos entornos; funciona en móvil y en webs sin Prebid. No enseña precios.
3. **Marcador (bookmarklet) como prueba avanzada de escritorio**: lee `pbjs.getEvents()` en la web abierta, panel local, sin enviar nada; todo el código dentro del marcador (CSP); en móvil casi nadie lo completa; no ve Prebid Server, Amazon TAM ni la subasta de Google AdX. Solo leer: nunca `requestBids()`, recargar anuncios ni tocar el consentimiento.
4. **Subasta propia de GUARDIANA: no** (Gemini: incumple los contratos de los SSP, tráfico sin intención de impresión; ChatGPT: solo aula educativa, nunca prueba).
5. **Volcado de consola / HAR**: solo para técnicos; procesado en local; un HAR puede llevar cookies y cabeceras.
6. **Qué no decir**: «tus datos valen X €» (el CPM es por mil impresiones; 1,50 € CPM = 0,0015 € por impresión); sumar pujas; «18 empresas compraron tus datos»; «ZERO evitó 18 ventas»; «en ZERO no saben qué página lees» (la URL sí viaja en la petición).
7. **Comparar en igualdad**: mismo estado de consentimiento en los dos lados, hora de cada lectura, variación entre cargas; estados «Observado / No observado / No verificable»; un cero solo si se midió.
8. **El cero de ZERO tiene dos causas posibles** (centro de datos y navegador sin identificadores): decirlo así, sin atribuirlo a un «bloqueo mágico». ChatGPT: la hipótesis es plausible, no demostrada.
9. **Documento**: JSON canónico (RFC 8785) + SHA-256 + firma de la parte medida por ZERO + sello de tiempo RFC 3161 opcional (solo la huella); sin IP, cookies, valores de eids ni cadena TCF completa; generado en el navegador; lo aportado desde el navegador de la persona, marcado como «no verificado por GUARDIANA».
10. **Legal**: RGPD/ePrivacy (la TC String puede ser dato personal, TJUE C-604/22); no modificar señales TCF; revisar términos de cada medio; reputación: no acusar a empresas concretas.

## Diferencias
- Nombre del documento: ChatGPT «Informe de exposición y protección»; Gemini «Acta técnica de contraste en subastas web». Se propone el de ChatGPT (más claro; ninguno usa «certificado»).
- ChatGPT añade una segunda comparación: **«ZERO observando» frente a «ZERO protegiendo»** (la evidencia de bloqueo real no depende de que haya pujas). Gemini no la menciona.
- Frase para la web: la de ChatGPT es más prudente; la de Gemini («las pujas sobre tu sesión caen a cero») es casi absoluta: no usar tal cual.

## Propuesta (pendiente del dueño; después del lanzamiento)
1. «Comprueba tu exposición» en la web (sin instalar, móvil incluido).
2. «Qué ha hecho ZERO»: cada corte con su registro (destino, hora) en el informe que ya hace ZERO.
3. «Subastas de tu navegador»: marcador experimental (Chrome y Edge de escritorio) y, completa, la extensión.
4. Un único «Informe de exposición y protección» descargable y comprobable.

## Hecho hoy, relacionado
- ZERO: el aviso del muro antirrobot (as.com) sale en el centro, «Esta web no se ha abierto», con «Actualizar» (recarga una vez cuando la persona lo pulsa) y «Abrir fuera de ZERO». Sin reintentos automáticos ni disfraz de la conexión (coincide con las dos voces).
