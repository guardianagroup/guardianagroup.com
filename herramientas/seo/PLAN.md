# Plan SEO de guardianagroup.com · lo que necesita decisión del dueño · 5 de noviembre de 2026

Nada de lo que sigue está hecho: cada punto cambia una decisión anterior, el diseño, el contenido o cuesta dinero. Las cifras de coste son las que publican los propios proveedores en sus páginas de precios (se indica cuáles hay que confirmar); no hay ninguna estimación de visitas ni de posiciones, porque no hay datos propios con los que justificarla.

## Decisión 1 · El aviso «solo PC» y los buscadores (urgente: sin esto, lo demás no sirve)
**Hecho comprobado** (AUDITORIA.md §1.1): el rastreador móvil de Google y el de Bing, que son los principales, ven cada página redirigida a `/solo-pc/`, que lleva `noindex`. Solo las páginas legales escapan. Mientras siga así, ni la portada, ni ZERO, ni las radiografías, ni las multas entrarán en el índice de Google.

Opciones, de la que menos cambia a la que más:
- **A. Las páginas de lectura se pueden leer en el teléfono; la aplicación sigue siendo solo PC.** `marco.js` deja de redirigir en las páginas informativas (portada, ZERO, cómo funciona, casos, radiografías, empresas, el negocio de tus datos, legales) y en ellas muestra arriba una franja fija: «GUARDIANA se usa en el PC. Aquí puedes leer qué hace». La redirección se mantiene en Órbita, ZERO (la aplicación), Comunicaciones, `/m/`, `/e/`, `/chat/`, `/inicio/`. Coste: una tarde de trabajo. Efecto: Google ve lo mismo que una persona; la web vuelve a ser indexable. Es la opción que recomiendo: leer no es «usar GUARDIANA», y la regla del 1 Nov («que se utilice solo en el PC») se sigue cumpliendo.
- **B. Todo igual que hoy, pero sin redirigir: la pantalla «solo PC» se pone encima de la página** (la página queda debajo, sin poder usarse). Google ve el contenido y la pantalla. Riesgo: Google penaliza en el móvil las «pantallas intrusivas» que tapan el contenido al llegar desde un resultado; la web se indexaría, pero con desventaja en el móvil. Coste: una mañana.
- **C. Dejarlo como está.** Entonces la web solo puede aspirar a aparecer por las páginas legales, por GitHub y por la marca escrita tal cual. Hay que saberlo antes de invertir nada en SEO.
- Lo que **no** se puede hacer: dejar pasar a Googlebot y bloquear a las personas. Google lo llama «redirección engañosa» y lo sanciona a mano.

## Decisión 2 · Portada y Órbita en inglés y portugués para los buscadores (y los otros 39 idiomas)
Hoy `/en/` y `/pt/` son redirecciones `noindex` a `/?lang=en` y `/?lang=pt`; la portada se traduce en el navegador y Google solo ve la versión en español. Las 42 traducciones (portada e interfaz de Órbita) son invisibles para cualquier buscador.
- **A. Tres portadas pre-renderizadas** (`/`, `/en/`, `/pt/`): el mismo `index.html` generado tres veces con los textos de cada idioma ya en el HTML (los textos en/pt ya están dentro de `index.html`, `herramientas/idiomas.py` conoce las claves). Con `hreflang` es/en/pt + x-default en las tres y en el sitemap. Coste: un día de trabajo más la revisión de dos voces. Efecto: la web puede aparecer en búsquedas en inglés y portugués, que es donde más gente busca «browser isolation», «encrypted calls», «rastreadores».
- **B. Las 42 portadas pre-renderizadas** (`/fr/`, `/de/`, `/ja/`…) con el mismo generador: los JSON de `i18n/portada/` ya existen. Coste: medio día más que A, pero cada idioma nuevo es una página más que mantener y revisar en cada cambio de la portada (hoy ese trabajo lo hace el navegador). Efecto: presencia en 42 mercados, pero con textos que ninguna voz humana ha revisado en 39 de ellos; en SEO una traducción floja posiciona peor que no estar.
- **C. Como hoy.** Español para los buscadores; el resto, para quien ya está dentro.
- Recomendación: A ahora; B solo para los idiomas en los que haya alguien que pueda revisar la traducción (y entonces idioma a idioma).

## Decisión 3 · Páginas que hoy son indexables pero están fuera del sitemap (coherencia)
El 28 Oct se dejaron fuera del sitemap las guías del DNS (18 páginas, huérfanas, del producto anterior), «por dentro» (3), «comprobar un recibo» (3) y `zero.html` (3). Siguen siendo indexables (no llevan `noindex`) y, salvo las guías, están enlazadas desde otras páginas, así que Google puede indexarlas igual.
- **A. Las guías del DNS, fuera de verdad**: `noindex` (o borrarlas: hablan de un producto que los términos ya cuentan en pasado). Coste: minutos. Recomendado.
- **B. `zero.html`, «por dentro» y «comprobar un recibo»: decidir si entran al sitemap o reciben `noindex`.** `zero.html` es la mejor página de la web para «navegador aislado» y está enlazada desde los términos: recomiendo que entre. «Por dentro» describe el globo del programa de escritorio (ya publicado en la 1.0.56): recomiendo que entre si el texto está al día; si no, `noindex` hasta reescribirla.
- **C. `instalar.html` (es/en/pt)**: lleva `noindex` desde el 28 Oct («nadie puede descargar»), pero la 1.0.56 ya se descarga desde la portada. Si la descarga es pública, la página de instalación debería ser indexable (es la que la gente busca con «descargar GUARDIANA»).

## Decisión 4 · Velocidad de la portada (el planeta)
La portada descarga 9,7 MB de texturas JPEG y mantiene el hilo principal ocupado unos 2,7–4,4 s al cargar (medido sin GPU; en un PC normal será menos, pero el INP de Google se mide en visitas reales). No afecta al LCP ni al CLS. Opciones, compatibles entre sí:
- **A. Las mismas texturas en WebP (sin perder resolución)**: suele reducir el peso a la mitad o menos (se confirma al convertir; no se promete una cifra). Coste: una hora y comprobar en pantalla que el planeta se ve igual. Sin cambio de diseño.
- **B. Cargar las texturas 8K solo después del primer desplazamiento o de 3 s de reposo**: la primera pintura usa `earth.jpg` (0,66 MB), que ya es lo que se ve en los primeros segundos. Coste: una hora. Riesgo: un salto visible de nitidez si se hace mal; hay que verlo en pantalla.
- **C. Dejar el planeta como está** y aceptar el riesgo en INP.
- Aparte, y sin decisión del dueño salvo el visto bueno: `font-display: optional` o letras de reserva con `size-adjust` para quitar el salto residual con red lenta (AUDITORIA.md §4).

## Decisión 5 · Blog o guías nuevas (contenido que sí puede posicionar)
Las radiografías son el mejor activo SEO de la web: son mediciones propias, con fecha y método, que nadie más tiene. Hoy hay 15 en español (10 en inglés y 10 en portugués), todas de septiembre de 2026. Propuesta: una radiografía nueva cada dos semanas (navegadores, IA, periódicos, aplicaciones de Windows, tiendas), publicada en los tres idiomas y anunciada por IndexNow el mismo día; y tres guías de fondo que respondan a lo que la gente busca de verdad: «qué es el RTB y quién puja por ti», «qué ve una web de tu equipo», «cómo saber a qué se conecta un programa en Windows». Coste: tiempo del dueño o de la agencia (dos voces por pieza). Efecto esperado: son las únicas páginas con las que se puede competir por búsquedas informativas sin enlaces externos; lo demás (producto, descarga) depende de la marca.

## Decisión 6 · Enlaces y menciones (sin comprar nada)
- Lo legítimo y gratuito: el repositorio público (`github.com/guardianagroup`, que ya aparece en los buscadores) con el enlace a la web en la descripción y el README; una entrada en directorios de software libre que aceptan proyectos GPL (AlternativeTo, F-Droid no aplica, Softpedia revisa el instalador: todos gratuitos); la ficha de la extensión ZERO en la tienda del navegador cuando exista; menciones en prensa de Cartagena y Colombia sobre privacidad (la página de casos, con las multas, es el gancho); responder en foros de privacidad (r/privacy, foros en español) solo cuando aporte, con la radiografía como prueba.
- Lo que **no** hay que hacer: directorios de pago, enlaces comprados, «paquetes SEO», redes de blogs, comentarios con enlace. Google los detecta y la sanción tarda meses en levantarse.
- Coste: tiempo. Efecto: es lo único que mueve las búsquedas de marca y de producto; sin enlaces, una web nueva tarda meses en salir de la segunda página.

## Decisión 7 · Google Business Profile (ficha de empresa)
GUARDIANA GROUP S.A.S. tiene sede publicada (Bocagrande, Cartagena). Una ficha de Google Business Profile da presencia en el mapa y en la búsqueda de marca, y es gratuita. Requisitos: una dirección donde se atienda al público o una «empresa de servicios en la zona» (sin dirección visible), teléfono o correo, y una verificación (vídeo o carta). Decisión: ¿se quiere aparecer como empresa local en Cartagena? Para un programa que se descarga, la ficha ayuda sobre todo a la búsqueda de la marca y a la confianza (reseñas); no a las búsquedas de producto. Coste: 0 €, media hora, más la verificación. Riesgo: la ficha pide un nombre de empresa y una dirección públicos, y abre las reseñas públicas.

## Decisión 8 · Nombre y marca en los buscadores
«Guardiana» y «Guardian Group» tienen mucha competencia: los buscadores devuelven hoy aseguradoras y consultoras llamadas Guardian Group (AUDITORIA.md §1.2). Para la búsqueda de marca conviene fijar siempre la forma completa «GUARDIANA · guardianagroup.com» en títulos, en el README de GitHub y en las fichas (ya está en `og:site_name` y en el JSON-LD). La búsqueda profesional de marca ya anotada para VERALUN (SIC, EUIPO, USPTO, INPI) debería cubrir también «GUARDIANA» en las clases 9 y 42 antes de invertir en campañas con el nombre. Coste: el de la búsqueda de marca (lo fija el despacho; no se inventa aquí).

## Decisión 9 · Vídeo
Hay cuatro vídeos en `/v/` (qué es, web, «mientras dormía»). Un canal propio (YouTube o PeerTube, con el vídeo también en la web con `VideoObject` en JSON-LD) da una segunda puerta de entrada y resultados de vídeo en Google. Decisión: ¿se publican en YouTube con la cuenta de la empresa? Coste: 0 €, una hora por vídeo (título, descripción, subtítulos en es/en/pt). Nota: la regla «nada de terceros en la web» se respeta si el vídeo se sirve desde la propia web y YouTube solo es otra copia.

## Calendario de los 90 primeros días (si se aprueban las decisiones 1 y 2)
- **Semana 1**: fundir la rama `seo` (dos voces); decisión 1 aplicada; Search Console verificada, sitemap enviado, 10 direcciones pedidas a mano; Bing Webmaster importado de Search Console; IndexNow con las 219 direcciones (`GUIA-DUENO.md`); Yandex Webmaster si se quiere Rusia.
- **Semanas 2–3**: portadas `/en/` y `/pt/` pre-renderizadas con hreflang; guías del DNS fuera; `instalar.html` indexable si la descarga es pública; texturas del planeta en WebP.
- **Semanas 3–6**: primera radiografía nueva (y cada dos semanas una); README de GitHub con enlace y descripción; fichas en directorios de software libre; vídeos publicados.
- **Semana 6**: primera lectura de Search Console («Páginas»: cuántas indexadas, cuántas «con redirección» o «excluidas»; «Rendimiento»: consultas reales) y corrección de lo que salga.
- **Semanas 7–12**: guías de fondo (RTB, qué ve una web, a qué se conecta un programa); ficha de empresa si se decidió; segunda lectura de Search Console a los 90 días y revisión de palabras clave con datos reales (hasta entonces, nada de volúmenes).
