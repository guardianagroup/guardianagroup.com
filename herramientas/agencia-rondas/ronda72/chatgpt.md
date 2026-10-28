# Ronda 72 · ChatGPT (GPT-6, esfuerzo «Alta») · 28 Oct 2026, 11:31–11:35

Chat «Prueba Antes Y Después». Texto copiado de la respuesta; se quitan solo las marcas de cita del navegador («MDN +1», «Prebid +1»…).

---

Ronda 72 · GUARDIANA ZERO
Cómo demostrar lo que sucede con los datos antes y después de navegar con ZERO
28 de octubre de 2026 · Evaluación técnica, comercial y jurídica

## A. Ver las subastas reales sin instalar nada

### 1. La conclusión técnica
Sí existen formas de enseñar subastas reales del navegador de una persona sin instalar una extensión. Pero no existe una vía web universal que permita a GUARDIANA inspeccionar todas las subastas de cualquier otra página abierta por esa persona.

La limitación fundamental es la política de mismo origen (Same-Origin Policy). Una página de guardianagroup.com no puede entrar libremente en el JavaScript, las cookies ni las peticiones de marca.com o elmundo.es. Esta separación es una protección de seguridad del navegador; no recomiendo intentar eludirla.

Por tanto, tenemos que distinguir tres pruebas:
- Conexión real: qué información puede conocer una página sobre el dispositivo y la conexión de la persona.
- Subasta real: qué solicitudes, participantes y pujas conseguimos observar dentro de la página original.
- Protección de ZERO: qué solicitudes y transmisiones observa, bloquea o permite el navegador remoto.

Las tres pueden formar una experiencia conjunta. No deben confundirse.

### 2. Opción A1: marcador de análisis Prebid.js (recomendada como prueba avanzada)
Un marcador especial, o bookmarklet, ejecuta una pequeña función JavaScript cuando la persona lo activa estando en una web. Funcionamiento: en GUARDIANA se ofrece «Crear marcador de análisis»; la persona guarda el marcador; abre una página que utilice Prebid.js; pulsa el marcador; aparece un panel sobre esa misma web con las subastas observables; puede descargar un archivo local e importarlo voluntariamente en GUARDIANA para compararlo con ZERO.

La documentación oficial confirma que pbjs.getEvents() devuelve los eventos emitidos desde que cargó la página, incluyendo auctionInit, bidRequested, bidResponse, auctionEnd y bidWon.

Ventajas: no requiere extensión, aplicación ni cuenta; permite consultar eventos de una sesión auténtica con la conexión de la persona; y puede funcionar sin transmitir los resultados a GUARDIANA.

Limitaciones importantes:
- CSP: una web puede impedir la ejecución del código javascript: del marcador. No hay garantía universal de funcionamiento.
- Safari: requiere pruebas específicas en macOS y iOS.
- Móvil: guardar y activar marcadores JavaScript puede resultar incómodo o no funcionar según navegador y versión.
- Prebid: debe estar disponible una instancia accesible de Prebid.js. Algunas webs utilizan otro nombre global, un ámbito privado o no utilizan Prebid.
- Subastas en servidor: el marcador solo observa la información expuesta al cliente.
- Google: no revela todas las subastas de Google Ad Manager, Google Ads o AdX.
- Marcos externos: no puede leer libremente el contenido de iframes de otro origen.

Mi decisión: desarrollar este marcador como función experimental, comenzando por Chrome y Edge de escritorio, y validar cada navegador y sitio antes de declararlo compatible. El panel debe limitarse a leer los eventos y mostrar resultados; no debe llamar a requestBids(), recargar anuncios ni modificar el consentimiento. Tampoco debe presentar los eventos acumulados como una captura necesariamente completa.

Corrección técnica: noBid no aparece como evento en la lista oficial de getEvents() consultada. Prebid sí documenta getNoBids(). Revisaría el sensor actual para comprobar de dónde sale su evento denominado noBid. *(Nota de GUARDIANA: el sensor lee `noBids` del objeto de auctionEnd, no de un evento noBid.)*

### 3. Opción A2: «Lo que Internet ve de ti» (mi primera prioridad)
Es la opción más universal, comprensible y fácil de integrar dentro de GUARDIANA. Propongo una sección gratuita «Comprueba tu exposición», con dos columnas: Tu navegador habitual y Dentro de ZERO (conexión observada / IP pública o de salida, ubicación aproximada según la IP, navegador e idioma, cookies). La misma página de diagnóstico se abre directamente y dentro de la celda de ZERO; cada instancia registra lo que efectivamente puede observar.

Puede demostrar: diferencia entre IP doméstica y salida de ZERO; ubicación aproximada asociada; diferencias en información expuesta por el navegador; ausencia de acceso directo a cookies de otros dominios; separación de entornos.

No puede demostrar: el contenido de todas las cookies e identificadores de terceros, las subastas de una web ajena, cuánto vale comercialmente una persona o que todas las empresas publicitarias recibieron determinada información. Tampoco debe afirmarse que reproduce exactamente lo que observará cualquier tercero.

Decisión: construirla primero. Funciona como explicación visual y prueba repetible, incluso en webs sin Prebid.

### 4. Opción A3: GUARDIANA organiza su propia subasta
Viable como demostración técnica, pero no como prueba principal de privacidad. Demostración controlada: enseña cómo funciona una petición, pero sus valores no serían precios de mercado. Subasta comercial real: exigiría inventario publicitario legítimo, acuerdos con compradores y bases jurídicas. Instalar Prebid.js no garantiza demanda. No recomiendo generar tráfico publicitario de prueba para producir pujas reales artificialmente. Decisión: dejarla como aula educativa y etiquetarla claramente como demostración.

### 5. Opción A4: diagnóstico manual del navegador o colaboración con editores
Herramientas de desarrollador: exportar un HAR y analizarlo localmente, con redacción previa de datos confidenciales. Difícil para personas no técnicas; un HAR puede contener cookies y cabeceras de autorización: no debe subirse sin depuración. A medio plazo, colaborar con editores que autoricen una integración de diagnóstico. Google Publisher Tag documenta eventos como slotRequested, slotResponseReceived y slotRenderEnded, que no equivalen a una lista completa de ofertas y precios internos de Google.

### 6. Comparativa y decisión
| Vía | Subastas auténticas de webs ajenas | Sin instalar | Decisión |
|---|---|---|---|
| Marcador Prebid | Sí, parcialmente | Sí, guardar marcador | Desarrollar |
| Diagnóstico de exposición | No | Sí | Prioridad 1 |
| Subasta de GUARDIANA | No demuestra subastas ajenas | Sí | Educativa |
| Herramientas de desarrollo | Peticiones visibles, no todas las pujas | Sí | Avanzada |
| Editor colaborador | Mayor acceso en su propia web | Sí | Proyecto posterior |

Recomendación: diagnóstico de exposición + marcador Prebid opcional + mediciones reales dentro de ZERO. Satisface «no instalar»; no satisface «verlo todo desde una única pestaña de GUARDIANA», porque el propio navegador impide esa lectura.

## B. Cómo enseñar un antes y un después honesto

### 7. Dos comparaciones diferentes
- Comparación 1: «Tu navegador frente a ZERO» (misma URL, mismo momento aproximado). Muestra diferencias reales, pero no permite atribuir automáticamente todas las diferencias a ZERO: si el navegador recibe tres pujas y ZERO ninguna, no sabemos si influyeron la IP del centro de datos, el historial, el consentimiento, la demanda o los filtros antifraude.
- Comparación 2: «ZERO observando frente a ZERO protegiendo». Observar: registrar sin bloquear; Proteger: registrar qué intenta la página y qué interrumpe ZERO antes de enviarlo. No cambiar automáticamente el consentimiento para fabricar la diferencia. Priorizar esta evidencia de bloqueo real, no depender de conseguir ofertas con CPM.

### 8. Qué medir
Solicitudes de puja Prebid (postores invocados); peticiones de red observadas; respuestas con oferta; CPM y moneda; bidWon; campos observables de la petición; solicitudes bloqueadas por ZERO; anuncios renderizados.

Distinciones obligatorias: bidRequested no prueba por sí solo que la empresa recibió la solicitud, ni que guardó los datos (hay que contrastar la petición de red). El CPM no representa el precio de los datos personales: 2 € CPM es un valor por mil impresiones. El precio puede estar agrupado en escalones (price buckets). Nunca «Tus datos valen X euros»; sí «Oferta publicitaria observada: X CPM, moneda Y», solo cuando exista.

### 9. Cómo evitar conclusiones falsas
Misma URL canónica; hora y ventana de observación (sin afirmar simultaneidad perfecta); consentimiento documentado (no equiparar «aceptar anuncios» con «aceptar seguimiento personalizado»); estado de cada entorno; visitas legítimas (sin recargas automáticas ni impresiones creadas); resultados incompletos visibles (CSP, antirrobot, falta de Prebid, timeout → «No observable», nunca un cero inventado); separación por subasta y espacio; repetición voluntaria. Tres estados en la interfaz: Observado / No observado (no prueba que no ocurriera) / No verificable.

### 10. Las pruebas de Praga
Se invocaron 18 postores; no se observaron ofertas; al permitir anuncios aumentaron las subastas; siguieron sin pujas. La hipótesis del centro de datos es plausible, pero no está demostrada (no lo sé con los datos actuales). Mantener no disfrazar la conexión ni reintentar de forma automatizada. No convertirlo en «18 empresas compraron tus datos» ni «ZERO evitó 18 ventas»; sí «el sensor observó 18 participantes solicitados y ninguna oferta durante aquella medición».

## C. Documento descargable y comprobable

### 11. Nombre
**GUARDIANA · Informe de exposición y protección.** Subtítulo: «Observaciones de una sesión de navegación y comparación entre entornos». Botón: «Descargar mi informe».

### 12. Contenido mínimo
Identificación de la medición (identificador aleatorio, fecha, hora UTC, ventana); entornos (versión del sensor, navegador, región de salida, método de captura); webs (dominios y rutas depuradas); consentimiento (estado, sin la cadena TCF completa); subastas (participantes, respuestas, pujas con CPM y moneda cuando se observen); protecciones (lo que ZERO registró, bloqueó o permitió y cómo lo verificó); limitaciones; comprobación (huellas, firma, clave pública, sello de tiempo). Explicar el origen de cada cifra; una captura aportada por el usuario no tiene el mismo nivel de comprobación que un evento capturado por ZERO.

### 13. Verificable sin datos de más
PDF y, opcionalmente, paquete de evidencias: JSON canónico (RFC 8785), huella SHA-256 del JSON y del PDF en un manifiesto, firma del manifiesto con clave de GUARDIANA (clave pública publicada), sello de tiempo RFC 3161 (opcionalmente cualificado; eIDAS art. 41). Una firma prueba integridad y vínculo con la clave, no que el sensor observara todo correctamente; un sello prueba la existencia de una huella en un momento, no el instante de cada evento. Minimizar: generar en el navegador; no conservar eventos ni PDF en servidores; no incorporar cookies, tokens, valores EID, URL privadas ni cadenas TCF completas; no publicar informes por enlaces; enviar al sellado solo la huella; claves protegidas y rotación publicada; verificador local. Lo importado desde el navegador local, etiquetado como «Datos proporcionados desde el navegador local; origen no verificado independientemente por GUARDIANA».

## D. Riesgos legales y reputacionales

### 14. Riesgos y medidas
- RGPD y ePrivacy: IP, identificadores y registros pueden ser datos personales (arts. 5 y 6 RGPD; art. 5.3 ePrivacy).
- IAB TCF: el TJUE (C-604/22) confirmó que una TC String puede ser dato personal; no almacenar ni transferir cadenas completas; no modificar señales TCF.
- Términos de las webs: no sé si AS, Marca y El Mundo permiten todas las modalidades; revisar individualmente; no eludir bloqueos antirrobot.
- Prebid.js: Apache 2.0; usar su API pública no significa que Prebid avale GUARDIANA.
- Reputación: no convertir una medición parcial en una acusación pública («esta empresa robó tus datos»). Publicar hechos observados con sus fuentes y límites.

### 15. Frase para la web
«Descubre qué ocurre cuando navegas. Compara lo que las webs pueden conocer de tu conexión con lo que observan al acceder desde ZERO. Cuando una página lo permite, GUARDIANA muestra solicitudes publicitarias, empresas participantes, ofertas registradas y conexiones que ZERO ha bloqueado. Todo se basa en observaciones reales, sin inventar pujas ni precios. Algunas operaciones publicitarias no son visibles y los resultados pueden variar entre visitas. Explora la diferencia. Comprueba los resultados. Descarga tu informe.»

### Decisión final
Tres entregas: 1) «Comprueba tu exposición» (sin instalación, comparación real de conexiones); 2) «Qué ha hecho ZERO» (cada bloqueo con su registro técnico, destino y momento); 3) «Subastas de tu navegador» (marcador experimental y exportación voluntaria). Las tres alimentan un único Informe de exposición y protección. «Menos promesas, más pruebas comprobables.»
