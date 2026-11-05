# Guía clic a clic para el dueño · dar de alta guardianagroup.com en los buscadores

Todo lo de esta guía lo haces tú con tu sesión; nadie más necesita tus claves. Antes de empezar, la rama `seo` tiene que estar fundida en `main` y publicada (si no, Google verá el sitemap antiguo). Orden recomendado: 1 → 2 → 3 → 4; el 5 solo si quieres Rusia. Tiempo total: unos 40 minutos.

**Aviso previo, para que no te lleves un susto**: mientras siga la redirección del móvil al aviso «solo PC» (AUDITORIA.md §1.1, PLAN.md decisión 1), Search Console marcará casi todas las páginas como «Página con redirección» y no las indexará. Date de alta igual (así tendrás los datos), pero la cifra de páginas indexadas no subirá hasta que se decida eso.

---

## 1. Google Search Console (15 min)

### 1.1 Entrar y comprobar si la propiedad ya está verificada
1. Abre `https://search.google.com/search-console` e inicia sesión con la cuenta de Google de la empresa.
2. Arriba a la izquierda, en el desplegable de propiedades, mira si aparece **guardianagroup.com** (propiedad de dominio) o **https://guardianagroup.com/** (prefijo de URL). En la web hay dos archivos de verificación, `googlea37076ee8a01cb59.html` y `googlec2bfc24ef6ae7e20.html`, así que lo normal es que ya haya una o dos propiedades verificadas con esta cuenta o con otra.
   - Si aparece: salta al punto 1.3.
   - Si no aparece: punto 1.2.

### 1.2 Añadir la propiedad (solo si no aparece)
1. En el desplegable de propiedades, pulsa **«Añadir propiedad»**.
2. Elige la tarjeta de la derecha, **«Prefijo de URL»**, escribe `https://guardianagroup.com/` y pulsa **«Continuar»**.
3. En «Verificar la propiedad» elige el método **«Archivo HTML»**. Google te enseña un nombre de archivo `googleXXXXXXXXXXXXXXXX.html`.
   - Si el nombre es `googlea37076ee8a01cb59.html` o `googlec2bfc24ef6ae7e20.html`, ya está en la web: pulsa **«Verificar»**.
   - Si es otro nombre, no lo descargues tú al repositorio: dime el nombre exacto del archivo (solo el nombre; no contiene nada secreto) y lo añado a la rama. Cuando esté publicado, vuelve aquí y pulsa **«Verificar»**.
4. Verás «Propiedad verificada». Pulsa **«Ir a la propiedad»**.

### 1.3 Enviar el sitemap
1. Menú de la izquierda → **«Sitemaps»** (dentro de «Indexación»).
2. En «Añadir un sitemap» escribe `sitemap.xml` (solo eso; la dirección completa queda `https://guardianagroup.com/sitemap.xml`) y pulsa **«Enviar»**.
3. En la tabla de abajo debe aparecer con «Estado: Correcto» y «Páginas descubiertas: 219». Si pone «No se ha podido obtener», espera una hora y recarga; si sigue así, dímelo.

### 1.4 Pedir la indexación de las 10 páginas principales (una a una)
1. Arriba del todo hay una barra «Inspeccionar cualquier URL de https://guardianagroup.com/». Pega la primera dirección y pulsa Intro.
2. Espera a que diga «La URL no está en Google» (es normal al principio) o «La URL está en Google».
3. Pulsa **«Solicitar indexación»**. Google comprueba la página en directo (medio minuto) y responde «Indexación solicitada». Pulsa **«Aceptar»**.
4. Repite con cada una. Google no publica la cifra exacta de peticiones que admite al día por propiedad; si sale «Cuota superada», sigue mañana.

Las 10 direcciones, por orden:
1. `https://guardianagroup.com/`
2. `https://guardianagroup.com/como-funciona.html`
3. `https://guardianagroup.com/orbita/zero/`
4. `https://guardianagroup.com/orbita/comunicaciones/`
5. `https://guardianagroup.com/casos.html`
6. `https://guardianagroup.com/radiografias/`
7. `https://guardianagroup.com/negocio-de-tus-datos.html`
8. `https://guardianagroup.com/empresas/`
9. `https://guardianagroup.com/en/cases.html`
10. `https://guardianagroup.com/pt/casos.html`

Al inspeccionar la portada, pulsa también **«Probar URL publicada»** y luego **«Ver página probada»** → pestaña **«Captura de pantalla»**: si ves la pantalla «GUARDIANA solamente está disponible en versión PC» en lugar del planeta, es la prueba, en tu pantalla, del hallazgo 1.1 de la auditoría (Google prueba con el rastreador móvil).

### 1.5 Qué mirar cada semana
- **«Páginas»** (Indexación › Páginas): arriba, «Indexadas» frente a «No indexadas». En la tabla de abajo, las razones: «Página con redirección» (hoy será la mayoría: es la redirección del móvil), «Excluida por la etiqueta noindex» (correcto: son gracias, activar, comprar, instalar, Órbita, redirecciones de idioma), «Rastreada: actualmente sin indexar» (Google la vio y aún no la considera; normal las primeras semanas), «Descubierta: actualmente sin indexar» (la conoce por el sitemap y aún no la ha visitado).
- **«Experiencia»** → **«Métricas web principales»**: aparece vacío hasta que haya suficientes visitas reales de Chrome (puede tardar meses en una web nueva). Mientras, mide tú con `https://pagespeed.web.dev/` pegando `https://guardianagroup.com/`: mira LCP, CLS e INP en «Diagnosticar problemas de rendimiento» (es lo que no he podido medir desde aquí).
- **«Rendimiento»**: a partir de la cuarta semana, pestaña «Consultas»: qué escribe la gente para llegar. Es el único dato de palabras clave real; con él se revisan las propuestas de AUDITORIA.md §7.
- **«Mejoras»** (abajo a la izquierda): «Rutas de exploración» (las migas de pan) y «Datos estructurados» deben salir sin errores. Si sale algún aviso, copia el texto y dímelo.
- **«Enlaces»**: «Sitios web con más enlaces»: hoy serán GitHub y poco más; es la cifra que la decisión 6 del PLAN quiere mover.

---

## 2. Bing Webmaster Tools (10 min; también alimenta DuckDuckGo, Yahoo y Ecosia)
1. Abre `https://www.bing.com/webmasters` y pulsa **«Iniciar sesión»** (vale una cuenta Microsoft, Google o Facebook; usa la de la empresa).
2. En la primera pantalla elige la tarjeta de la izquierda: **«Importar tus sitios desde GSC»** (Google Search Console) → **«Importar»**. Autoriza el acceso de lectura a Search Console con la misma cuenta de Google del punto 1. Marca `https://guardianagroup.com/` y pulsa **«Importar»**. Se verifica sola y trae el sitemap.
   - Si prefieres no enlazar las dos cuentas: tarjeta de la derecha, **«Agregar tu sitio manualmente»**, escribe `https://guardianagroup.com/`, pulsa **«Agregar»** y en «Verificar» elige **«Archivo XML»** (`BingSiteAuth.xml`): dime el contenido que te enseña (es un identificador público, no una clave) y lo añado a la rama; después pulsa **«Verificar»**.
3. Menú de la izquierda → **«Mapas del sitio»** → botón **«Enviar mapa del sitio»** → `https://guardianagroup.com/sitemap.xml` → **«Enviar»**.
4. Menú → **«Inspección de URL»**: pega `https://guardianagroup.com/` y pulsa **«Inspeccionar»**; si no está indexada, **«Solicitar indexación»**. Bing permite hasta 10 al día por sitio; usa la misma lista del punto 1.4.
5. Menú → **«IndexNow»**: debe decir que la clave está detectada (`bb17ba6ecb3c743017273b41551112b5`). Si dice que no encuentra la clave, comprueba en el navegador que `https://guardianagroup.com/bb17ba6ecb3c743017273b41551112b5.txt` muestra exactamente ese texto.

---

## 3. IndexNow (2 min; avisa a Bing, Yandex, Seznam, Naver y, a través de Bing, a DuckDuckGo)
La clave ya existe en la web desde el 9 de octubre: `https://guardianagroup.com/bb17ba6ecb3c743017273b41551112b5.txt` (archivo cuyo nombre y contenido son la clave; no es secreta). No hace falta generar otra.

**Opción A, con el formulario (sin instalar nada):** en Bing Webmaster Tools → **«IndexNow»** → **«Enviar URL»** (Submit URLs): pega las direcciones (una por línea; puedes pegar las del campo `urlList` de `herramientas/seo/indexnow.json`, que se regenera con `python3 herramientas/indexnow.py .`) y pulsa **«Enviar»**.

**Opción B, con una orden (desde la carpeta del repositorio de la web, en un PC con Python 3; Windows: PowerShell; Mac/Linux: Terminal):**
```
python3 herramientas/indexnow.py . --envia
```
(lee las direcciones del `sitemap.xml` publicado y la clave de la raíz, y manda el aviso). Si prefieres curl en PowerShell, escribe `curl.exe` (en PowerShell `curl` a secas es otro programa):
```
curl.exe -X POST "https://api.indexnow.org/indexnow" -H "Content-Type: application/json; charset=utf-8" --data-binary "@herramientas/seo/indexnow.json" -w "HTTP %{http_code}"
```
Respuesta correcta: `HTTP 200` o `HTTP 202`. Si sale `403`, la clave del archivo no coincide con la de la web (dímelo); `422`, alguna dirección no es del dominio; `429`, demasiadas peticiones, espera una hora.

Para una sola página (por ejemplo, una radiografía nueva), basta con abrir en el navegador:
`https://api.indexnow.org/indexnow?url=https://guardianagroup.com/radiografias/&key=bb17ba6ecb3c743017273b41551112b5`

A partir de ahora, cada publicación que añada o cambie páginas debería avisar así el mismo día (lo puedo dejar automatizado en el workflow de publicación si lo apruebas: es una sola petición HTTP, sin claves secretas).

---

## 4. Yandex Webmaster (5 min; solo si interesa Rusia y los países de habla rusa)
1. Abre `https://webmaster.yandex.com/` e inicia sesión con una cuenta de Yandex (se crea con un correo cualquiera).
2. Pulsa **«+ Add site»** (o el botón «Add site» de la portada), escribe `https://guardianagroup.com` y pulsa **«Add»**.
3. Verificación: elige la pestaña **«Meta tag»**: te enseña una línea `<meta name="yandex-verification" content="…">`. Dime esa línea (el contenido es un identificador público) y la añado a la portada; cuando esté publicada, pulsa **«Check»**. (La pestaña «HTML file» también vale: dime el nombre del archivo.)
4. Menú de la izquierda → **«Indexing»** → **«Sitemap files»** → pega `https://guardianagroup.com/sitemap.xml` → **«Add»**.
5. Yandex también lee IndexNow (punto 3): no hace falta nada más. Los avisos de Yandex sobre «mobile» se refieren al mismo problema de la decisión 1.

---

## 5. Lo que NO hay que hacer (y lo que te ofrecerán por correo en cuanto la web aparezca)
- **No pagues** directorios «premium», «envíos a 500 buscadores», «paquetes de 1 000 enlaces», reseñas ni artículos patrocinados con enlace sin marcar: Google los detecta, y una sanción manual tarda meses en levantarse. Los únicos buscadores que importan en los mercados de GUARDIANA son Google, Bing (y lo que bebe de Bing), Yandex, Naver (Corea) y Seznam (Chequia), y todos se cubren con los puntos 1 a 4, gratis.
- No instales ningún «plugin SEO», rastreador ni analítica de terceros en la web: la web no carga nada de otros dominios, y eso es parte de su propuesta (y de la política de seguridad de contenido de cada página).
- No cambies la dirección de las páginas (`.html`, carpetas) sin redirección: cada cambio de dirección vuelve a empezar su historial en Google.
- No pidas la indexación de páginas con `noindex` (gracias, activar, comprar, instalar, Órbita): Google las rechaza y gastas la cuota.
- No contestes a correos que digan «tu web no está indexada, paga para arreglarlo»: lo ves gratis en Search Console › Páginas.

---

## 6. Cómo saber que ha funcionado
- A los 2–3 días: en Search Console › Sitemaps, «Páginas descubiertas: 219». En Bing › Mapas del sitio, «Procesado».
- A las 2–4 semanas: en Google, buscar `site:guardianagroup.com` debe listar páginas de la web (hoy no lista ninguna). Si la decisión 1 no se ha tomado, lo normal es que solo salgan las legales.
- A las 6 semanas: Search Console › Rendimiento › Consultas con las primeras búsquedas reales. Es el momento de revisar las palabras clave (AUDITORIA.md §7) con datos y no con suposiciones.
