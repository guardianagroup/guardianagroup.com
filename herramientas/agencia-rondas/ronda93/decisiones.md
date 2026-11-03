# Ronda 93 · decisiones (Claude + Gemini) · Ultra

## En lo que coinciden las dos voces (va a Ultra)
- **Criptografía:** P-384 + ML-KEM-1024 + ML-DSA-87 con HKDF-SHA-384.
- **Identidad:** nueva en cada sesión y solo en memoria. Claves no exportables; los arrays postcuánticos se borran con ceros tras usarlos (dicho como «se borran», no como garantía, porque JavaScript puede copiar memoria).
- **Invitación:** de 256 bits, detrás de `#` (el servidor nunca la ve) o por QR. Adiós al código de 9 cifras en Ultra.
- **4 palabras para leer en voz alta en cada llamada,** más el código siempre visible.
  - Lista de 2.048 palabras en español sin ambigüedad: candidata, la lista española de BIP-39 (libre; comprobar su licencia y atribuirla).
  - Nota honesta: una voz clonada con IA debilita la comprobación de oído.
- **Tamaño y ritmo:** voz con Opus en ritmo constante y sin silencios (`cbr=1`, `usedtx=0`). Chat en bloques de 1 KB con un latido de relleno mientras la conversación está abierta. Archivos con el último trozo relleno.
- **Recibo:** negable por defecto, autenticado con la clave de la sesión. El recibo con doble firma pasa a ser opcional y explícito, para despachos y clínicas.
- **Mosaico irreversible en vez de difuminado** (el difuminado normal se puede revertir) y fondo negro recortando la silueta. Hay que quitar «difuminado» de lo anunciado.
- **Voz cambiada de verdad:** formantes, tono con variación al azar y paso banda, más quitar el ruido de fondo (RNNoise) y el zumbido eléctrico, que delata la zona.
  - Nota honesta, la nuestra, que es más prudente que la de Gemini: no oculta el acento, el vocabulario, las muletillas ni el ritmo.
  - Tampoco engaña a un sistema de reconocimiento preparado para ello.
- **Fotos y archivos:** fotos sin EXIF ni GPS, nombres neutros y sin fechas. En PDF y Office, aviso de que pueden llevar el nombre del autor.
- **En el PC, con el programa:**
  - la ventana fuera de las capturas;
  - aviso si otra app usa el micrófono o la cámara;
  - WebView2 sin disco;
  - comprobación antes de llamar (antivirus y certificados raíz);
  - Ultra ejecutado desde el programa con el código sellado.
- **En el móvil:**
  - tapar la pantalla al cambiar de app;
  - borrar las claves en segundo plano fuera de una llamada;
  - sin teclado predictivo;
  - notificaciones sin texto;
  - WakeLock.
- **El nivel de cada lado,** a la vista: «PC con GUARDIANA» o «navegador del móvil».
- **Doble relé** entre dos proveedores y países (Hetzner y Vultr), o la VPN de GUARDIANA en el PC.
- **Tor:** solo para el chat, más adelante.

## Donde no coinciden, y lo que se decide
- **Buzón de 7 días:** Gemini lo quita en Ultra y Claude no lo había tocado. Se quita: en Ultra, nada se guarda en nuestros servidores; los mensajes pasan solo si los dos están conectados. Se dice así.
- **Sin rebaja (Gemini):** si un aparato no admite la capa postcuántica de la llamada, Ultra no empieza y ofrece seguir en la Blindada, diciendo por qué. Encaja con «Ultra es el máximo»; la Blindada sigue siendo la que se adapta a cada teléfono.
- **Renovar las claves de la llamada:** cada minuto (Gemini), no cada 5 (lo anunciado). Va en Ultra 1, porque es el mecanismo de la capa de hoy, más rápido.
- **Ratchet continuo del chat (seguridad tras un compromiso):** Claude lo pone en Ultra 2 y Gemini «más adelante». Va en Ultra 2: la Blindada no tiene ratchet de Diffie-Hellman, y es la mejora criptográfica que más cuenta.
- **Service Worker en el móvil:** Gemini dice que «bloquea» el código sin firma. No es así: el navegador puede sustituir el Service Worker desde el servidor. En el móvil no se promete; se enseña la huella del código. La garantía de código sellado es solo para el PC con el programa.
- **Teclado en pantalla aleatorio y buscar «ganchos de teclado»:** no hay forma oficial de listar ganchos WH_KEYBOARD_LL, así que no se promete. El teclado en pantalla, como mucho, más adelante.
- **Lectura discreta y tecla de pánico (Gemini):** sí, baratas y útiles. Van a Ultra 1.
- **Cifras de Gemini («~14 MB por hora», «15 a 100 ms»):** no se publican sin medirlas nosotros.

## Fases
- **Ultra 1, en la web (días):**
  - criptografía alta en memoria;
  - invitación de 256 bits;
  - 4 palabras y código visible;
  - sin buzón;
  - CBR y bloques de 1 KB con latido;
  - claves de la llamada renovadas cada minuto;
  - sin rebaja;
  - recibo negable, con el firmado como opción;
  - mosaico irreversible y fondo negro;
  - fotos sin EXIF y nombres neutros;
  - lectura discreta y tecla de pánico;
  - medidas del móvil;
  - el nivel de cada lado.

  Además, cambiar el texto «próximamente» de la web a lo que de verdad tendrá.
- **Ultra 2 (semanas):**
  - en el PC (programa 1.0.56 o 1.0.57): anticaptura, aviso de micrófono y cámara, perfil sin disco, comprobación previa y código sellado;
  - voz por formantes con RNNoise y corte eléctrico;
  - doble relé;
  - ratchet continuo del chat.
- **Más adelante:** chat por Tor; revisión externa (sin decir «auditada» hasta que exista y se publique); builds reproducibles.
