Ronda 80 · notas (30 Oct 2026) · «Que funcione como un teléfono, sin instalar nada»

Voces: Claude (claude.md) y Astra 6 (astra.md; la pregunta larga se quedó sin salida: el máximo del playground es 4.096 tokens
y los gastó razonando; se repitió con una pregunta corta).

En lo que coinciden las dos voces
- Web móvil con aspecto de app, sin instalar; nada de «Añadir a la pantalla de inicio».
- Honestidad con el iPhone: con la página cerrada no suena ni avisa (Astra: «En iPhone, mantén esta página abierta para recibir»).
- Contra el spam, sin cuentas: ningún directorio, los dos se añaden, códigos de un solo uso, límite de intentos.
- Contra la suplantación: comprobación visible (palabras o QR) y huella de la sesión.

En lo que no coinciden
- Número GUARDIANA en el móvil. Astra: retirarlo hasta la app de la tienda. Claude: mantenerlo en el navegador, porque es lo
  que hace que Comunicaciones «funcione como un teléfono», anclado a una llave de acceso (Face ID) para que no se pierda.

Ideas nuevas
- Astra · «Cabina»: durante una videollamada en el PC, el teléfono escanea un QR y presta su cámara y su micrófono (mejor imagen
  que la cámara del portátil), sin instalar nada.
- Claude · la línea anclada a Face ID: con la extensión PRF de WebAuthn, una llave de acceso devuelve siempre el mismo secreto;
  de él sale la llave que cifra el número y los contactos. Sin cuenta y sin copia en el servidor: si Safari borra los datos de la
  web o se cambia de teléfono, Face ID devuelve la línea.

Comprobaciones (30 Oct 2026)
- PRF: Safari 18+ e iOS con el llavero de iCloud (iOS 18.0–18.3 tuvieron fallos corregidos en 18.4); Chrome, Edge y Samsung
  Internet en Android con el Gestor de contraseñas de Google; Chrome 132+ en macOS; Chrome/Edge 147+ en Windows; Firefox 139+
  (macOS), 148+ (Windows), 149+ (Android). Fuente: Corbado, «Passkeys & WebAuthn PRF», actualizado el 29 Sep 2026
  (https://www.corbado.com/blog/passkeys-prf-webauthn).
- Safari borra los datos guardados por las webs (IndexedDB, almacenamiento local) tras 7 días de uso de Safari sin visitarlas;
  las webs añadidas a la pantalla de inicio quedan fuera. WebKit, «Full Third-Party Cookie Blocking and More», 24 Mar 2020
  (https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/); comprobar que sigue igual en iOS 26 antes de
  decirlo en la web.

Propuesta al dueño: «Tu línea GUARDIANA» (Número GUARDIANA en el navegador + Face ID + Tarjeta QR), con la Cabina de Astra
como función del PC. Pendiente de su decisión.
