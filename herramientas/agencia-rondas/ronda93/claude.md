# Ronda 93 · lo que piensa Claude, antes de leer a Gemini

## La idea de fondo
Ultra no puede ser solo «la Blindada con números más grandes». P-384 y ML-KEM-1024 son los parámetros más altos de los estándares, pero P-256 y ML-KEM-768 ya no son el punto débil. Lo que de verdad separa a Ultra está en cuatro sitios que la Blindada no cubre:
1. la entrega del código;
2. la seguridad tras un compromiso;
3. los metadatos (tamaño y ritmo);
4. el propio aparato.

## Por amenaza

### Nuestra web sirve el código (el mayor riesgo real de una app web)
Quien controle la cuenta de GitHub, el DNS o Pages podría servir un JavaScript que filtre claves. A todos y sin que se note.

**Ultra en el PC:** solo se ejecuta desde el programa. El código va dentro de GUARDIANA y se comprueba con la firma del dueño (el proyecto «sello»). Nada se baja de la web en caliente.

**Ultra en el móvil:** no hay app instalada.
- Un Service Worker con las huellas fijadas y un manifiesto firmado ayuda tras la primera carga.
- No es una garantía, porque el navegador puede saltárselo. Se dice así, y se enseña la huella del código para quien quiera compararla.

### Seguridad tras un compromiso
Hoy hay cadena simétrica (HMAC) y no hay ratchet de Diffie-Hellman. Si alguien roba el estado de la sesión un momento, lee lo que viene después hasta la siguiente sesión.

**Ultra:** Double Ratchet con DH, más un ratchet postcuántico (KEM) en la línea del Triple Ratchet/SPQR que publicó Signal en 2025. Cada vez que el otro contesta hay claves nuevas, y no solo cada 5 minutos.

Es lo más difícil de hacer bien, así que va a Ultra 2, con pruebas de interoperabilidad y vectores.

### Metadatos en el relé y en la red
- **Voz a ritmo constante (Opus CBR):** obligatoria en Ultra. Con bitrate variable, el tamaño de los paquetes delata frases; está publicado desde 2008. Cuesta casi nada.
- **Mensajes a tamaño fijo:** un solo tamaño, por ejemplo 4 KB, mejor que múltiplos de 1 KB. Así el relé no distingue un «sí» de un párrafo.
- **Tráfico de cobertura en el chat:** mientras la conversación está abierta, paquetes falsos a ritmo fijo, para que no se sepa cuándo escribes. Cuesta bytes de relé, pero pocos.
- **Dos relés de empresas distintas** (Hetzner y Vultr, cada persona entra por uno):
  - Ningún proveedor ve las dos IP.
  - Los dos relés son nuestros, así que protege frente a una orden o un ataque a un solo proveedor, no frente a nosotros.
  - Duplica el tráfico. Ultra 2.
- **Con la VPN de GUARDIANA puesta,** el relé ve la IP del servidor VPN y no la tuya. Se puede ofrecer «Ultra por la VPN», que en el PC es gratis de hacer.
- **Tor** no sirve para la voz (UDP). Para el chat, más adelante, con el Tor de ZERO.

### El propio PC, con el programa
- **Ventana fuera de capturas:** SetWindowDisplayAffinity con WDA_EXCLUDEFROMCAPTURE en la ventana de Ultra. Capturas, grabadores y compartir pantalla la ven en negro. No impide una cámara apuntando a la pantalla.
- **Quién usa el micrófono y la cámara:** el servicio lee el registro de consentimientos de Windows (CapabilityAccessManager), que dice qué app los usa ahora. Durante la llamada avisa: «Otra app está usando el micrófono: X». Es real y comprobable.
- **Antes de llamar:** se comprueba el estado del antivirus (protección en tiempo real, detecciones recientes) y si hay certificados raíz nuevos. No se puede prometer detectar un keylogger.
- **Sin rastros:** solo en memoria. Sin IndexedDB, perfil efímero de WebView2 y nada de historial.
- **Corrector ortográfico desactivado** en los campos de Ultra, porque el «corrector mejorado» de Chromium puede mandar el texto fuera. Se apaga también el autocompletado.
- **Notificaciones** sin contenido.

### El móvil, desde el navegador
No puede impedir capturas ni ver otras apps. Sí puede:
- guardar solo en memoria;
- desactivar el corrector;
- usar CBR, relleno y la capa postcuántica si el navegador la admite;
- enseñar las palabras de verificación.

La llamada enseña el nivel de cada lado. Por ejemplo: «Tu lado: PC con GUARDIANA. Su lado: móvil, sin protección contra capturas».

### La otra persona
No hay técnica contra quien graba con otro aparato. Se dice.

## Verificación
- **Palabras al empezar cada llamada:** 4 palabras del español leídas en voz alta, al estilo ZRTP. Se usan mucho más que 60 cifras.
- **El número de 60 cifras y el QR** se quedan para comprobar en persona.
- **Nota honesta:** las voces clonadas con IA debilitan la comprobación por voz.

## Negabilidad frente al comprobante firmado
Chocan: una firma sobre la conversación sirve como prueba contra quien firmó.
- **Por defecto,** Ultra es negable: la autenticación va con MAC dentro de la sesión, sin firmas sobre el contenido.
- **El comprobante con doble firma** es una opción explícita para cada envío, que ven los dos. Es lo útil para despachos y clínicas.

## Vídeo y voz
- **Mosaico o difuminado de la cara y fondo cambiado:** ocultan la cara y el lugar. No ocultan la ropa, los gestos ni lo que se dice.
- **Voz:** cambio de tono y de formantes en un AudioWorklet, con parámetros al azar en cada llamada. Dificulta que te reconozca de oído quien no sabe qué filtro usas. No sirve contra un análisis forense ni contra un sistema entrenado para ello.
- **Quitar el ruido de fondo** con RNNoise (abierto, en WASM): las campanas o los anuncios delatan dónde estás. Barato y útil.
- **Metadatos de las fotos:**
  - Las imágenes se vuelven a codificar sin EXIF ni ubicación, siempre en Ultra (y debería hacerse también en la Blindada).
  - En PDF y Office se avisa de que pueden llevar el nombre del autor.

## Fases

**Ultra 1 (días), en la web:**
- un modo propio con P-384, ML-KEM-1024 y ML-DSA-87;
- identidad nueva en cada sesión;
- invitación de 256 bits por enlace o QR;
- palabras de verificación y código siempre a la vista;
- Opus CBR;
- mensajes de tamaño fijo;
- fotos sin EXIF;
- solo en memoria;
- corrector apagado;
- notificaciones sin contenido;
- comprobante firmado opcional;
- el nivel de cada lado en la llamada;
- voz cambiada;
- difuminado del vídeo entero (la cara con seguimiento, en Ultra 2).

**Ultra 1 (días), en el PC (1.0.56):**
- la ventana fuera de capturas;
- el aviso de micrófono y cámara;
- la comprobación antes de llamar.

**Ultra 2 (semanas):**
- Double Ratchet con ratchet postcuántico;
- tráfico de cobertura;
- dos relés;
- Ultra servido desde el programa con el código sellado;
- RNNoise;
- mosaico que sigue la cara.

**Más adelante:**
- chat por Tor;
- revisión externa del código (sin decir «auditada» hasta que exista y se publique);
- builds reproducibles.

## Cómo contarlo (borrador)
- Ultra usa los parámetros más altos de los estándares de encriptación de hoy, también los postcuánticos.
- Cada llamada estrena identidad y claves. Viven solo en la memoria y cambian durante la conversación.
- Al empezar, leéis en voz alta unas palabras: si coinciden, nadie se ha puesto en medio.
- El tamaño y el ritmo de lo que envías no delatan lo que dices: todo va a tamaño fijo y la voz a ritmo constante.
- Tu cara, tu voz y tu fondo pueden ir cambiados antes de encriptarse, en tu propio equipo.
- En el PC con GUARDIANA, la ventana no sale en capturas y te avisa si otra app usa el micrófono o la cámara.
- Las fotos salen sin la ubicación ni los datos del aparato.

## Lo que nunca prometer
- «Imposible de espiar», «irrompible», «anónimo», «nadie puede…».
- Que la voz cambiada impide identificarte.
- Protección frente a un aparato ya infectado o frente a otra cámara.
- Capturas imposibles en el móvil.
- Que los dos relés protegen frente a nosotros.
