# Ronda 72 · Claude (voz independiente, hechos comprobados) · Invitar a un chat en el iPhone

29 oct 2026. Revisado en fuentes de Apple/WebKit, W3C, web.dev, Google, Capacitor y en el código fuente de WebKit. [P] = lo probasteis vosotros. «No lo sé» = no hallé fuente fiable y hay que probarlo en un iPhone.

## 0. Respuesta corta

1. En el iPhone, sin App Store, no se puede hacer en un solo paso. Los menús de Safari («Compartir» → «Agregar a inicio») no se pueden pulsar desde la página. Apple obliga además a que el permiso de avisos salga de un toque dentro de la app.
2. Mínimo realista:
   - Caso a: **7 toques** en iOS 16.4–18 y **8–9** en iOS 26/27 con el diseño compacto de Safari.
   - Caso b: **4–5 toques** y un gesto para ir a la pantalla de inicio.
3. Con una app nativa (opción C), el caso b baja a **1 toque**, y el caso a pasa a ser una instalación normal de la App Store.

## 1. Las 6 preguntas de hecho

**1.1. ¿Qué URL usa la app al arrancar? ¿Conserva ?… y #…? ¿Cuándo lee el manifiesto?**
- **URL de arranque.** Usa la `start_url` del manifiesto si es válida y del mismo origen. Si no hay manifiesto o la `start_url` no vale, usa la URL de la página: es lo que manda la especificación W3C (borrador del 26-oct-2026).
- **Pruebas de que usa la `start_url`:**
  - GitLab (oct-2023): el diálogo mostraba y usaba la `start_url` y no la página en la que estaba el usuario.
  - Un fallo abierto el 10-oct-2026 con **iOS 27.0.1**: una `start_url` relativa se resolvió contra la URL del manifiesto, y el icono abrió `/` en vez de la página con token.
  - firt.dev (13-oct-2026): `start_url` soportada desde iOS 11.3.
  - Hasta iOS 26/27 no veo ningún cambio en esto. Las notas de Safari 26 y 27 no tocan `start_url`.
- **Consulta (?…) y fragmento (#…).** El paso de la especificación que procesa la `start_url` no borra ninguno de los dos. Que iOS los conserve no lo encontré documentado en ninguna versión: **no lo sé** para 17, 18, 26 y 27 por separado. Vuestra prueba [P] dice que sí en el iPhone que usasteis. Hay que repetirla en cada versión.
- **Cuándo lee el manifiesto.** Lo leí en el código de WebKit (`DocumentLoader::loadApplicationManifest`):
  - Toma el **primer** `<link rel="manifest">` que sea hijo directo de `<head>` en el momento de la primera petición.
  - Mientras siga cargada la misma página, reutiliza ese resultado y no lo vuelve a leer, aunque cambiéis el `<link>` después.
  - No sé en qué momento exacto lo pide Safari por primera vez. Un indicio de 2021: Safari descarga el icono justo al tocar «Compartir», no al cargar la página.
  - Conclusión práctica: poned el `<link>` una sola vez, al principio, sin ningún manifiesto estático antes, y no lo cambiéis.
- **Manifiestos blob: y data:.**
  - El cargador de WebKit trata `data:` como del mismo origen (`sameOriginDataURLFlag`) y no bloquea `blob:`.
  - Sí aplica la CSP. Si tenéis `manifest-src` o `default-src 'self'`, hay que permitir `blob:` o `data:`.
  - Las URL relativas del manifiesto se resuelven contra la URL del propio manifiesto. En un blob o data no funcionan, así que `start_url`, `scope`, `id` e iconos tienen que ser **absolutos**.
- **Ojo con `id`.** Si el manifiesto no trae `id`, la especificación usa la `start_url` como `id`. En iOS el `id` identifica la app y se sincroniza con los modos de concentración entre dispositivos (WebKit, 2023). Hay que poner un **`id` fijo** sin la invitación.

**1.2. ¿Comparte almacenamiento con Safari? ¿Y entre dos iconos?**
- **Con Safari:** no, en ninguna versión reciente:
  - WebKit: «the website data of home screen web applications is kept isolated from Safari».
  - Bug 181849: «by design».
  - firt.dev (13-oct-2026): «Storage shared with Browser ❌».
- **Única excepción:** desde iOS 17.2, al añadir el icono Safari **copia las cookies una sola vez** (notas de Safari 17.2). No copia IndexedDB ni localStorage.
- **Riesgo grave para el chat que quedó en Safari:** Safari borra todo lo que guarda la web (IndexedDB, localStorage…) tras 7 días de uso del navegador sin visitarla. Las apps de la pantalla de inicio están exentas. El chat de la esposa en Safari puede desaparecer.
- **Entre dos iconos:** Apple dice que iOS admite varias copias de la misma web «with different identities», por ejemplo con cuentas distintas de trabajo y personal (WebKit, feb-2023). Eso implica almacenamiento separado. No hallé una frase oficial explícita sobre IndexedDB, pero vuestra prueba [P] coincide.

**1.3. ¿La hoja de `navigator.share()` incluye «Agregar a inicio»?**
- **No**, según el código y la documentación. El `WKShareSheet` de WebKit solo pasa texto, URL y archivos, nunca la vista web. Apple documenta que, para ofrecer «Agregar a inicio» como app web, la `WKWebView` tiene que ir en los `activityItems`, y que `SFAddToHomeScreenActivityItem` es «only available to web browsers».
- Un repositorio público lo confirma (28-sep-2026): «the system share sheet… does not include Add to Home Screen».
- No lo probé en un iPhone.

**1.4. ¿Puede un enlace abrir una PWA ya instalada?**
- **iOS: no.** firt.dev (13-oct-2026): «Link Capturing ❌ — Only a push message can open an installed PWA». Las notas de Safari 26 y 27 no traen nada nuevo.
- **Android con WebAPK: sí.** Registra filtros para las URL de su `scope` y abre la app en vez de Chrome (web.dev). Coincide con vuestra prueba [P].

**1.5. ¿Una PWA en iOS puede leer el portapapeles sin que la persona confirme «Pegar»?**
- Siempre hace falta un toque de la persona; sin él, la promesa se rechaza.
- Dentro de ese toque, WebKit concede la lectura **sin la burbuja «Pegar»** solo si el contenido lo escribió una página del **mismo origen** (blog de WebKit, 2020). En cualquier otro caso sale la burbuja «Pegar».
- **No lo sé:**
  - si Safari → app de inicio cuenta como «mismo origen» (las dos son guardianagroup.com, pero son procesos distintos);
  - si iOS 16+ mostraría además su alerta de sistema «Permitir pegar».
- Se comprueba en 5 minutos en un iPhone.

**1.6. App nativa mínima: enlaces universales, enlace diferido y guía 4.2**
- **Enlaces universales.** Apple: permiten «send small amounts of data directly to your app without using a third-party server».
  - El archivo `apple-app-site-association` lo descarga la CDN de Apple al instalar (iOS 14+), no enlace por enlace.
  - Las reglas pueden filtrar por fragmento (`"#"`), así que el `#i=` llega a la app sin pasar por ningún servidor.
  - WhatsApp está en la lista de apps donde los enlaces universales «work correctly all the time» (Branch).
  - Capacitor recibe el enlace en el evento `appUrlOpen`.
- **Enlace diferido sin servidor.** Apple no tiene una API oficial para eso. Opciones:
  1. **Tocar el enlace otra vez** tras instalar. El enlace universal ya abre la app y la semilla no sale del iPhone.
  2. **Portapapeles.** La página copia la invitación antes de ir a la tienda, y la app la lee con `UIPasteControl` (iOS 16+), que pega «without a user prompt». Si se lee por código, sale la alerta «Permitir pegar».
  3. **Banner inteligente (Smart App Banner) con `app-argument`.** Al acabar la descarga, el banner pasa a «Abrir» y abre la app «preserving the user's content». Solo funciona si la persona vuelve a Safari. Ponerlo por JavaScript con el `#`: no lo sé.
  4. **App Clip.** Puede dejar la semilla en el contenedor compartido (App Group) o en el llavero, y la app completa la recoge (iOS 15.4+). Que el fragmento llegue en la URL que abre el App Clip: no lo sé. Tamaño máximo: 15 MB, o 100 MB en iOS 17+ con condiciones.
  5. **Páginas de producto personalizadas con enlace profundo** (iOS 18+): como máximo 70 y fijas. No sirven para una semilla por invitación.
  6. **Android:** el Install Referrer de Google Play pasa por Google (registra marcas de tiempo «client- and server-side»), así que no sirve para la semilla. Leer el portapapeles con la app en primer plano sí, y desde Android 12 aparece un aviso flotante (toast).
- **Guía 4.2 (literal):** «Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or "app-like," it doesn't belong on the App Store.» La 4.2.2 excluye «web clippings».
- **Guía 1.2:** las apps con contenido de usuarios deben ofrecer filtrar, denunciar, bloquear y un contacto publicado. La guía añade que «random or anonymous chat» «do not belong on the App Store». Hay que explicar en la revisión que el chat es solo por invitación.

## 2. Caso a): no tiene GUARDIANA (iPhone)

Flujo (es el vuestro, afinado):
1. **WhatsApp.** Mensaje: «Ana te invita a hablar en privado por GUARDIANA: guardianagroup.com/chat/#i=…». **Toque 1:** el enlace.
2. **Safari, página de GUARDIANA** (sin aceptar nada todavía).
   - Encima, en grande: «Ana te espera. Pon GUARDIANA en tu pantalla y ya está».
   - Instrucciones con dibujos, adaptadas a la versión. Se detecta por `Version/2x` porque en iOS 26 la parte del sistema del navegador (user agent) quedó congelada en «18_6».
   - Debajo, el escudo con el texto «¿Ya tienes este escudo en tu pantalla? Toca aquí» (es el caso b).
3. **iOS 16.4–18:**
   - **Toque 2:** botón Compartir, abajo en el centro.
   - **Toque 3:** «Agregar a inicio». Puede hacer falta deslizar la lista hacia arriba.
   - **Toque 4:** «Agregar», arriba a la derecha.
4. **iOS 26/27 con diseño compacto:**
   - **Toque 2:** «•••», abajo a la derecha.
   - **Toque 3:** «Compartir».
   - **Toque 3b:** si no aparece, «Más» o deslizar.
   - **Toque 4:** «Agregar a inicio».
   - Dejar encendido «Abrir como app web».
   - **Toque 5:** «Agregar».
   - El texto exacto de los botones puede variar con el idioma y la versión.
5. **Pantalla de inicio.** **Toque:** el escudo GUARDIANA.
6. **App GUARDIANA.** El chat con Ana ya está dentro, abierto por la `start_url`. Un solo botón grande: «Avisarme cuando Ana escriba». **Toque.**
7. **Alerta del sistema:** «"GUARDIANA" quiere enviarte notificaciones» → **toque «Permitir»**. Listo.

Total:
- iOS 16.4–18: **7 toques**, y quizá un deslizamiento.
- iOS 26/27 compacto: **8–9 toques**.

El toque de «Avisarme» no se puede quitar: Apple exige que el permiso salga de una interacción directa (blog de WebKit, 16-feb-2023).

**Qué puede fallar y cómo evitarlo**

**En el iPhone de la persona**
1. **«Abrir como app web» apagado (iOS 26+).** Se crea un marcador que abre Safari. La página detecta si está dentro de la app con `display-mode: standalone` o `navigator.standalone`. Si no lo está, no acepta y dice: «Bórralo y vuelve a añadirlo con el interruptor encendido».
2. **No encuentra el icono.** Que la página diga dónde aparece y dé el plan B: deslizar hacia abajo en la pantalla de inicio y escribir «guardiana».
3. **Navegador predeterminado distinto de Safari.** WhatsApp abriría Chrome o Firefox. Desde iOS 16.4 esos navegadores pueden ofrecer «Agregar a inicio», pero los pasos cambian, y no sé si respetan el manifiesto dinámico. Detectarlo y mostrar sus pasos, o pedir que copie el enlace a Safari.
4. **Pulsa «No permitir».** No se puede volver a preguntar. Mostrar en la app «Ajustes → Notificaciones → GUARDIANA → Permitir notificaciones».
5. **Vuelve a tocar el enlace después** y crea un segundo icono. La página de Safari calcula la sala derivada (el relé ya la conoce) y pregunta al relé si la invitación ya se aceptó. Si es así, muestra: «Ya la tienes en tu app GUARDIANA: ábrela desde el escudo». Además, la página que quedó abierta en Safari puede hacer esa consulta al volver a primer plano y decir «Listo, puedes cerrar esto».

**En el manifiesto y la `start_url`**
1. **El manifiesto dinámico no se toma.** No incluyáis ningún `<link rel=manifest>` estático en /chat/. Insertad uno solo, al principio, sin cambiarlo después, con URL absolutas y con la CSP ajustada (punto 1.1). Mantened también la URL de la página igual a la `start_url`: si iOS cae en la URL de la página, sigue funcionando.
2. **La semilla viaja en la consulta (?…).** Esa parte se envía al servidor en cada arranque. Dejad solo `?app=1` y la semilla únicamente en `#i=`. Si `inv` deriva de la semilla, quitadlo.
3. **`id` por defecto.** Poned `"id": "https://guardianagroup.com/chat/"` fijo, para que la invitación no forme parte de la identidad de la app (que se sincroniza con los modos de concentración). No sé cómo trata iOS dos iconos con el mismo `id` y el mismo nombre: probadlo.
4. **La app reabre la `start_url` en un arranque en frío.** Aceptar la invitación tiene que ser idempotente. Tras aceptarla, quitad el `#` con `history.replaceState`.
5. **La semilla queda guardada en el icono** (su URL). Haced que la semilla sea de **un solo uso**: tras el primer contacto, las claves se renuevan (por ejemplo, con un intercambio X25519 autenticado por la semilla). Así, una semilla vieja ya no sirve.
6. **Almacenamiento.** Llamad a `navigator.storage.persist()` en el primer arranque. WebKit lo concede por heurística a las apps de la pantalla de inicio.

## 3. Caso b): ya tiene GUARDIANA y le llega otra invitación

Flujo:
1. **WhatsApp.** **Toque 1:** el enlace (se abre Safari; no hay forma de evitarlo en iOS).
2. **Safari.** Una sola decisión, con dibujo: «¿Ya tienes este escudo en tu pantalla?». Si Safari recuerda que este iPhone ya lo instaló (marca local, sin secreto), ese botón aparece como principal. **Toque 2:** «Sí, ya lo tengo».
   - Ese mismo toque copia la invitación al portapapeles con `navigator.clipboard.writeText` dentro del gesto.
   - La pantalla cambia a: «Hecho. Sal de Safari (desliza desde abajo) y toca el escudo GUARDIANA».
   - Debajo, el plan B en grande: «Si no funciona, en la app toca "Tengo un número" y escribe 482 913 557».
3. **Pantalla de inicio.** Gesto para salir de Safari. **Toque 3:** el escudo.
4. **App.** Arriba de «Mis chats», siempre visible: «Abrir invitación de WhatsApp». **Toque 4.**
5. Si iOS concede la lectura por ser del mismo origen, el chat se abre ya. Si no, aparece la burbuja «Pegar» junto al dedo: **toque 5**. Luego «Nuevo chat con Pedro» se abre.
6. Las notificaciones ya estaban permitidas.

Total: **4–5 toques y un gesto**.

**Qué puede fallar y cómo evitarlo**
1. **Toca fuera de la burbuja «Pegar».** WebKit rechaza la lectura si se toca en otra parte o se cambia de app. La app dice «Vuelve a tocar el botón y luego "Pegar"».
2. **Copió otra cosa entre medias.** La app no reconoce el formato y ofrece el número de 9 cifras.
3. **Elige «No, primera vez» y ya la tenía.** Se crea un segundo icono con el chat dentro. Dad en cada app un botón «Pasar este chat a mi otra GUARDIANA»: copia, abrir el otro icono, «Abrir invitación».
4. **El portapapeles lo leen otras apps** si la persona pega en ellas. Borradlo tras importar escribiendo una cadena vacía, y que la invitación caduque.
5. **La marca «ya instalado» de Safari se pierde** tras 7 días de uso sin visitar la web (ITP). Es solo una ayuda; la pregunta con dibujo sigue estando.

**Rescate inmediato del caso real (esposa)**
Hacedlo hoy, por el borrado de 7 días: abrir guardianagroup.com/chat en Safari → «Pasar este chat a la app» (copia) → abrir el escudo → «Abrir invitación» → «Pegar» (si aparece). Son 4–5 toques. Después, Safari borra su copia.

## 4. Evaluación de las opciones

**A) Seguir como PWA y afinar el flujo**
- **Pros:**
  - Cuesta 0 USD y sirve hoy.
  - Para el caso a no necesita portapapeles ni código.
  - En Android ya funciona perfecto.
- **Contras:**
  - Fiabilidad de la `start_url`: en iOS se usa la del manifiesto (pruebas desde iOS 17 hasta iOS 27.0.1). Que conserve la consulta y el fragmento solo lo probasteis vosotros [P], sin documentación, y hay que verificarlo en 17, 18, 26 y 27.
  - Manifiesto blob/data: lo toma si está bien puesto (código de WebKit; punto 1.1), pero cuándo lo lee Safari no está documentado.
  - Pasos ocultos en los menús de Safari, que cambian con cada iOS (en el 26, «Compartir» se movió al menú «•••»).
  - El caso b siempre pasa por Safari y el portapapeles.
- **Coste:** 0 USD; solo horas de desarrollo.
- **Plazo:** 2–5 días, más una tarde de pruebas en iPhones con iOS 17, 18, 26 y 27.

**B) Código corto que se escribe dentro de la app**
- **Pros:**
  - En el caso b nunca se pasa por Safari ni por el portapapeles.
  - Funciona igual en iPhone, Android y ordenador.
- **Contras:**
  - Escribir 9 cifras y cambiar entre WhatsApp y la app es duro a los 60 años: unos 12 toques.
  - En el caso a no ahorra nada: hay que instalar igual.
  - Los 10 minutos de validez chocan con WhatsApp, que se lee horas después.
  - **Seguridad:** un sobre PBKDF2 con 10^9 posibilidades se puede atacar sin conexión. Quien vea el sobre en el relé puede probarlas todas con GPU, en horas o días según las iteraciones. Si se usa, que sea con un **PAKE** (SPAKE2 o CPace, como magic-wormhole: «attackers… get only a single guess»). Con PAKE, el código puede durar más sin regalar la semilla.
- **Coste:** 0 USD.
- **Plazo:** 1–2 semanas con PAKE. Plan B, no camino principal.

**C) App nativa mínima (Capacitor) en App Store y Google Play**
- **Pros:**
  - Caso b: **1 toque**, porque el enlace de WhatsApp abre la app directamente y el `#` no sale del iPhone.
  - Caso a: instalar desde la tienda es un flujo conocido, y la invitación pasa por `UIPasteControl` (1 toque, sin alerta) o tocando el enlace otra vez.
  - Un solo almacenamiento, sin el borrado de 7 días.
  - Avisos nativos más fiables.
- **Contras:**
  - Riesgo de rechazo por la guía 4.2 si es solo un envoltorio. Hay que darle cosas de app: avisos nativos (APNs), CallKit para las llamadas, llavero o Secure Enclave para las claves.
  - Guía 1.2: añadir denunciar y bloquear, y explicar que el chat es solo por invitación.
  - Cada actualización pasa por revisión.
  - Apple ve quién instala la app, pero no la semilla.
- **Coste:**
  - Apple: 99 USD/año. Como empresa, además, número D-U-N-S.
  - Google Play: 25 USD, pago único.
  - Hace falta un Mac.
- **Plazo:**
  - Desarrollo: 3–6 semanas.
  - Revisión de Apple: el 50 % en menos de 24 h y el 90 % en menos de 48 h.
  - Una cuenta **personal** de Google Play creada después del 13-nov-2023 necesita 12 probadores durante 14 días seguidos. No vi si las cuentas de empresa están exentas.
  - Realista: 1–2 meses, contando un posible rechazo.

**D) Otras ideas**
1. **QR dentro de la app** (lector con la cámara y una librería JS). Si están juntos, el que ya tiene la app escanea y entra sin pasar por Safari: 2 toques. Coste: 1–3 días. Muy buena idea para encuentros en persona.
2. **App Clip.** El chat se ve en 2 toques sin instalar, y luego pasa a la app completa por el App Group. Requiere hacer antes la C. Además, no sé si recibe el `#`. Complejo: es para más adelante.
3. **Portapapeles automático.** Sin un toque, imposible en iOS. Con un toque, quizá sin la burbuja «Pegar» (punto 1.5). Ya está dentro del flujo propuesto.
4. **Cookies copiadas al instalar** (iOS 17.2+). Las cookies viajan al servidor, así que **no** sirven para la semilla.
5. **`share_target`, atajos o abrir la PWA desde un enlace.** No existen en iOS (punto 1.4).
6. **Un solo icono para siempre** (sin invitación en la `start_url`, todo por el portapapeles). Evita duplicados, pero añade un toque en el caso a. No compensa.

## 5. Recomendación para hoy (sin App Store)

Opción A con una sola pregunta con dibujo en Safari («¿Ya tienes este escudo?»). No → «Agregar a inicio» con manifiesto data: puesto una vez, `id` fijo y semilla solo en `#`.
Sí → un toque copia la invitación y el botón fijo «Abrir invitación» de la app la pega (9 cifras de plan B).
Y rescatar hoy el chat de la esposa: Safari lo borra tras 7 días de uso sin visitar la web.

## 6. Recomendación para el futuro

App nativa mínima (Capacitor) con enlaces universales, avisos nativos y CallKit, para pasar la guía 4.2.
Quien ya la tiene entra con 1 toque; quien no, la instala y recibe la invitación con el botón «Pegar» del sistema o tocando el enlace otra vez, sin servidor.
Pasar el código de 9 cifras a PAKE.

## 7. Pendiente de probar en iPhones reales (iOS 17, 18, 26 y 27)

1. Que la `start_url` conserve `?app=1` y `#i=` en cada versión.
2. Manifiesto data: o blob: con CSP y URL absolutas, y si funciona cambiar el `<link>` después de que Safari haya pedido el manifiesto. Debería fallar: no lo hagáis.
3. Si la lectura del mismo origen de Safari → app de inicio evita la burbuja «Pegar», y si sale la alerta «Permitir pegar».
4. Si `navigator.share()` muestra «Agregar a inicio». Lo esperado es que no.
5. Qué pasa con dos iconos con el mismo `id` y el mismo nombre.

## Fuentes

**Apple**
- https://developer.apple.com/documentation/safari-release-notes/safari-16_4-release-notes
- https://developer.apple.com/documentation/safari-release-notes/safari-17_2-release-notes
- https://developer.apple.com/documentation/safari-release-notes/safari-26-release-notes
- https://developer.apple.com/documentation/safari-release-notes/safari-27-release-notes
- https://developer.apple.com/documentation/safariservices/sfaddtohomescreenactivityitem
- https://developer.apple.com/documentation/uikit/uipastecontrol
- https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content
- https://developer.apple.com/documentation/xcode/supporting-associated-domains
- https://developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners
- https://developer.apple.com/documentation/appclip/sharing-data-between-your-app-clip-and-your-full-app
- https://developer.apple.com/documentation/appclip/choosing-the-right-functionality-for-your-app-clip
- https://developer.apple.com/documentation/appclip/supporting-invocations-from-your-website-and-the-messages-app
- https://developer.apple.com/app-store/custom-product-pages/
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/programs/enroll/
- https://developer.apple.com/distribute/app-review/

**WebKit (blog, bugs y código fuente)**
- https://webkit.org/?p=16993 (News from WWDC25: WebKit in Safari 26 beta, 9-jun-2025)
- https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/
- https://webkit.org/blog/13966/webkit-features-in-safari-16-4/
- https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- https://webkit.org/blog/14403/updates-to-storage-policy/
- https://webkit.org/blog/10855/async-clipboard-api/
- https://webkit.org/tracking-prevention/
- https://bugs.webkit.org/show_bug.cgi?id=181849
- https://github.com/WebKit/WebKit/blob/main/Source/WebCore/loader/DocumentLoader.cpp
- https://github.com/WebKit/WebKit/blob/main/Source/WebCore/loader/ApplicationManifestLoader.cpp
- https://github.com/WebKit/WebKit/blob/main/Source/WebKit/UIProcess/Cocoa/WKShareSheet.mm

**Especificaciones y documentación de Google, Android y Capacitor**
- https://www.w3.org/TR/appmanifest/
- https://web.dev/articles/webapks
- https://developer.android.com/google/play/installreferrer
- https://developer.android.com/privacy-and-security/risks/secure-clipboard-handling
- https://support.google.com/googleplay/android-developer/answer/6112435
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://capacitorjs.com/docs/guides/deep-links

**Otras fuentes**
- https://firt.dev/notes/pwa-ios/ (actualizada el 13-oct-2026)
- https://gitlab.com/gitlab-org/gitlab/-/issues/427560
- https://github.com/webstonehq/tuxedo/issues/175 (iOS 27.0.1, 10-oct-2026)
- https://naildrivin5.com/blog/2023/08/24/braindump-of-pwa-on-ios.html
- https://krausefx.com/blog/ios-privacy-safari-share-button
- https://github.com/mozilla-mobile/firefox-ios/discussions/13281
- https://github.com/madskristensen/Home-town-week/pull/13
- https://help.branch.io/using-branch/docs/universal-links
- https://magic-wormhole.readthedocs.io/en/latest/welcome.html
- https://heise.de/-10749652
- https://github.com/mnaimfaizy/myorganiser/issues/1132
- https://community.glideapps.com/t/ios-26-add-to-home-screen-workflow-change/84599
- https://www.ithinkdiff.com/add-web-app-bookmark-iphone-home-screen-ios-26/
- https://nielsleenheer.com/articles/2025/the-user-agent-string-of-safari-on-ios-26-and-macos-26/
- https://openpwa.net/reference/installation/ios-add-to-home-screen/
- https://tolinku.com/blog/ios-paste-permission-deferred-links/
