# Ronda 93 · respuesta de Gemini (4 Argon, razonamiento «Alto»), resumida fielmente

Conversación: gemini.google.com/app/6b6ef7c5118b73cf. Título que le puso Gemini: «Auditoría criptográfica y hoja de ruta para Ultra». La respuesta completa tiene 24.759 caracteres.

**Idea central:** Ultra no es poner números más grandes, sino cerrar lo que el cifrado no cubre:
1. el aparato;
2. la entrega del JavaScript;
3. los metadatos del relé;
4. la huella biométrica (cara, voz y entorno).

## 1. Amenazas, y qué haría Ultra en cada una

### La Wi-Fi y el proveedor de internet
- Relleno del chat en bloques de 1 KB.
- Opus con `cbr=1` y `usedtx=0`.
- En el PC, la llamada va por la VPN de GUARDIANA antes de llegar al TURN.

### Nuestro relé y el alojamiento
- Sin buzón de 7 días: cero almacenamiento, los mensajes solo pasan en memoria mientras los dos están conectados.
- Doble relé entre países: A entra por Miami y B por Helsinki, así que ningún servidor ve las dos IP.

### Nuestra web
Es el punto más crítico. SRI no basta si cambian el HTML.
- **PC:** paquete local sellado, con firma ML-DSA-87 + Ed25519 que comprueba el programa antes de abrir WebView2.
- **Móvil:** un Service Worker que fija un manifiesto firmado en el primer uso. Gemini dice que «bloquea» las actualizaciones sin firma.

### El otro aparato
- Identidad nueva solo en memoria en cada sesión.
- Mensajes que se autodestruyen.
- **Cero rebaja:** si el otro aparato no admite la capa postcuántica (RTCRtpScriptTransform), la llamada Ultra se bloquea.

### El propio aparato
**En el PC:**
- la ventana fuera de las capturas;
- vigilar el micrófono y la cámara;
- WebView2 sin disco;
- un teclado en pantalla aleatorio.

**En el móvil:**
- autocomplete y spellcheck apagados;
- notificaciones sin texto;
- tapar la pantalla al pasar a segundo plano.

### Quien mira la pantalla
- Lectura discreta: los mensajes van difuminados y solo se revela el que está bajo el dedo o el ratón.
- Mosaico.
- Tecla de pánico (Esc) que vacía la memoria y cierra.

## 2. Metadatos (protección frente a coste)

| Medida | Protección | Coste en el relé | Cuándo |
|---|---|---|---|
| Relleno a 1 KB | alta | despreciable | ya |
| Invitación de 256 bits en el fragmento | alta | nulo | ya |
| Opus CBR sin DTX | alta | bajo | ya |
| Por la VPN | muy alta | medio | alta en el PC |
| Doble relé | muy alta | medio | alta |
| Cobertura constante | media | muy alto | descartar en vídeo; solo un latido de 1 KB cada 5 s en el chat |
| Tor | — | — | solo para texto |

- **Archivos:** basta con rellenar el último trozo.
- **Cifra que da Gemini, no comprobada:** «~14 MB más por hora» con CBR. No usar en público.

## 3. Criptografía
- **Lo anunciado:** P-384 + ML-KEM-1024 + ML-DSA-87 y HKDF-SHA-384 es sólido.
- **Error conceptual: el comprobante con doble firma.**
  - Rompe la negabilidad: crea una prueba de no repudio.
  - Pesa mucho: ML-DSA-87 son 4.627 bytes por firma.
  - Por defecto, el recibo debe ir autenticado con la clave simétrica de la sesión.
  - La firma legal, como botón opcional: «Solicitar recibo con firma legal».
- **Medios:** renovar cada 60 s, mejor que cada 5 min, con un intercambio híbrido nuevo dentro del transform.
- **Chat:** ratchet por turno (inspirado en SPQR).
  - ECDH P-384 en cada cambio de turno.
  - ML-KEM-1024 en cada turno o cada 60 s, unos 3,1 KB solo en ese mensaje.
  - Así hay seguridad tras un compromiso.
- **Claves solo en memoria:** nada de IndexedDB ni localStorage, y `extractable: false`. Los Uint8Array de @noble se borran con `fill(0)` justo después de usarlos.
- **Verificación:** 4 palabras en español de una lista de 2.048 sin ambigüedad fonética (44 bits sacados del hash de la negociación). Las 60 cifras siguen visibles, aunque «nadie lee 60 números».
- **Invitación:** el secreto va siempre detrás de `#`, que el navegador no envía al servidor.

## 4. El aparato
- Cada participante lleva un indicador de su nivel: «Entorno blindado en PC» o «Navegador móvil».
- **En el PC:**
  - `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)`, que deja en negro las capturas y grabadores en modo usuario.
  - ConsentStore del micrófono y la webcam (`LastUsedTimeStop = 0`), con aviso y un botón para cortar.
  - WebView2 con `IsInPrivateModeEnabled` y el portapapeles limpio al cerrar.
  - Antes de llamar: el antivirus activo, «ningún proceso sin firmar con un gancho WH_KEYBOARD_LL», y los certificados raíz.
- **En el móvil:** no se puede impedir una captura ni ver otras apps; hay que decirlo sin rodeos.
  - `visibilitychange` y `blur`: tapar la pantalla antes de la miniatura de apps recientes.
  - Destruir las claves al pasar a segundo plano fuera de una llamada.
  - `no-store`.
  - WakeLock.
  - Sin teclado predictivo.

## 5. Vídeo, voz y archivos
- **El difuminado normal es reversible** con deconvolución y redes que reconstruyen caras. Hay que usar mosaico irreversible:
  - reducir la imagen a unos 28×21 bloques;
  - color medio con un poco de ruido en cada fotograma;
  - escalar con bordes duros.
- **Fondo negro** recortando la silueta.
- **Voz:** el cambio de tono simple se invierte en segundos. Hay que combinar:
  - deformación de formantes y tono con una ligera variación al azar;
  - un paso banda de 300 a 3.000 Hz;
  - RNNoise y un corte por debajo de 100 Hz, porque el zumbido de la red eléctrica (50 Hz en Europa, 60 Hz en América) delata la zona.
- **Nota honesta que propone Gemini:** «oculta el timbre… frente a sistemas de reconocimiento vocal y desconocidos, pero no oculta tu acento, tu vocabulario, tus muletillas ni tu ritmo».
- **EXIF:** obligatorio en Ultra.
  - Redibujar la imagen o reconstruir el archivo sin EXIF, GPS, marca y modelo, fecha, ICC ni miniaturas.
  - Renombrar el archivo con un nombre neutro y quitar las fechas.
  - En Office y PDF, limpiar las cabeceras o avisar.

## 6. Fases según Gemini
- **Ultra 1 (días):**
  - criptografía alta en memoria;
  - invitación de 256 bits en el fragmento y QR;
  - relleno a 1 KB, Opus CBR y sin buzón;
  - 4 palabras y las 60 cifras;
  - mosaico irreversible y EXIF.
- **Ultra 2 (semanas):**
  - en el PC: anticaptura y monitor de micrófono y cámara;
  - código sellado en local (en el móvil, con el Service Worker);
  - voz por formantes y quitar el ruido y los 50/60 Hz;
  - doble relé.
- **Más adelante:** el ratchet por turno y el teclado en pantalla.
- **Cifra que da Gemini, no comprobada:** «15 a 100 ms» de latencia por el doble relé.

## 7. Cómo contarlo, según Gemini
**Frases:**
- La Blindada protege el contenido; Ultra protege también tu cara, tu voz, tu aparato y los rastros.
- Cada charla tiene una identidad que vive solo en memoria y desaparece al cerrar, sin guardar nada en los servidores ni en el disco.
- Mosaico irreversible y voz transformada con el ruido de fondo quitado, «para que nadie pueda identificar…».
- Fotos sin GPS, fecha ni modelo.
- 4 palabras: «tienes la certeza de que nadie se ha interpuesto».
- En Windows, sin capturas y con aviso del micrófono y la cámara.

**Lo que nunca prometer:**
- «imposible de espiar» ni «100 % anónima»;
- que la voz hace imposible saber quién eres;
- que el bloqueo de capturas funciona en el móvil;
- «certificada», «auditada» ni «conformidad CNSA 2.0/NIST».
