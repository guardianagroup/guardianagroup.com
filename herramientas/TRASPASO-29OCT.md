# GUARDIANA · Traspaso del 29 Oct 2026, 08:55 (hora de Bogotá)

Para pegar en una conversación nueva de Claude. Léelo entero antes de tocar nada.

## 0. Cómo trabajar con el dueño
- **Háblale siempre en español.** Es el dueño de GUARDIANA (GUARDIANA GROUP S.A.S.). Su nombre, sus correos y sus claves no se escriben en ningún sitio.
- Lo que quiere de Comunicaciones: «que parezca una app nativa: minimalista, profesional, con armonía visual y tan fácil que la use una persona de 60 años». «Implementa tú y publica directamente.»
- **En una cuenta nueva, lo primero:** conecta GitHub (claude.ai → Ajustes → Conectores → GitHub) y añade el repositorio con permiso de escritura (`add_repo` con `access: push`). Sin eso no se puede publicar.
- Propón antes de hacer un cambio grande. De cada cambio, enséñale una captura y avísale cuando esté publicado, en una o dos líneas y sin pegar código.
- Reglas fijas, al pie de la letra:
  - «Tú nunca escribes claves. De la página de Astra copia solo el texto entre "ASSISTANT OUTPUT" y "Response headers"». Quita todo lo que empiece por `ci_live_`.
  - «No se repiten nombres, correos ni claves del dueño».
  - «Nunca copies index.html, instalar.html, en/, pt/ ni descargas/ de web-idiomas a main».
  - «Solo se publica lo que confirman dos voces».
  - «Nada de submarinecablemap.com, TeleGeography ni PeeringDB».
  - «No se inventan cifras».
  - «Las fuentes van en terminos.html §6».
  - «Enséñale una captura de cada cambio y avísale cuando esté publicado».
  - «Propón antes de hacer un cambio grande».

## 1. Dónde está todo
- Repositorio público: github.com/guardianagroup/guardianagroup.com (AGPL-3.0; ver LICENCIAS.md). GitHub Pages publica la rama `main` en guardianagroup.com con cada push (se ve en las ejecuciones «pages build and deployment»).
- **La rama `web-idiomas`** es la web en 42 idiomas y **no se publica**. Desde la tarde del 28 Oct, lo de Comunicaciones solo está en `main` (main tiene 334 commits que no están en web-idiomas). No mezcles las dos ramas sin leer antes TRASPASO-CHAT.md.
- En `main` entran commits automáticos («Órbita: datos reales actualizados»): haz `git pull --rebase` antes de cada push y trae `main` a las ramas `wip/` antes de publicarlas.
- Lee también estos documentos: `herramientas/TRASPASO-CHAT.md` (Comunicaciones hasta el 28 Oct), `herramientas/TRASPASO.md` (Órbita), `herramientas/CRIPTOGRAFIA.md` (inventario criptográfico) y `herramientas/pruebas-comunicaciones/README.md` (pruebas).
- **Comunicaciones** (chat, videollamadas y archivos encriptados de extremo a extremo) vive en `orbita/comunicaciones/`. Los archivos principales son `index.html`, `app.js`, `app.css`, `llamada.js`, `rele.js`, `cripto.js`, `pq-mlkem.js`, `pq-cnsa.js`, `viaje.js`/`viaje.css` y `verificar/`. Las traducciones están en `orbita/static/idioma.js`, en el bloque de Comunicaciones, como líneas `"frase": ["en", "pt"],`.
- **El relé** está en `zero-motor/` (`comunicaciones.js`, `ws.js`, `servidor.js`) y corre en motor.guardianagroup.com. Se actualiza solo desde `main` cada 15 minutos. Solo pasa bytes cifrados.
- **Las llamadas** van por los TURN de GUARDIANA en Núremberg y Miami (`GuardianaRele.MOTORES`). `eligeServidorLlamadas()` en app.js hoy solo mide el de Miami.

## 2. Cómo se publica
1. Sube la versión `?v=` en `orbita/comunicaciones/index.html`. app.css va también en `verificar/index.html`. idioma.js va en 5 páginas: comunicaciones, verificar, zero, orbita/index.html y multas.
2. Ejecuta `python3 herramientas/huellas.py`. huellas.txt cubre rele.js y otros archivos, así que nunca lo ejecutes con cambios ajenos sin guardar.
3. Haz el commit en español, citando al dueño con la hora. Termina con «…; huellas al día.» y las líneas de autoría.
4. `git pull --rebase` y `git push`.
5. Comprueba el despliegue con `gh api "repos/guardianagroup/guardianagroup.com/actions/runs?per_page=1"`.
6. Manda la captura al dueño.

Versiones en main: app.css, app.js y llamada.js `20261030i`; idioma.js `20261029p68`; viaje `20261029a`; componentes.css `20261028m`.

## 3. Pruebas locales
- Desde la raíz del repo, arranca:
  - el relé: `node zero-motor/pruebas/rele.js 8794`
  - la web: `python3 -m http.server 8080 --bind 127.0.0.1`
- Luego ejecuta `node herramientas/pruebas-comunicaciones/<prueba>.js` (recarga.js admite `RETRASO=<ms>`, 450 por defecto). Todas pasaban en main: dos, contactos, revision2, llamando, viaje-movil, whatsapp, instalar, enviar, actualiza, tipos, tirar, ingles…
- Las pruebas usan Playwright con Chromium imitando un iPhone (393×793) y simulan `navigator.standalone` y `navigator.share`. `hoja.py` junta capturas.

## 4. Hecho y publicado (main, último commit 081cdf8b)
- **WhatsApp:** las invitaciones abren WhatsApp directamente (`whatsapp://send?text=`), así que ya no tardan 5 minutos. Quien invita entra al chat y espera allí («Invitación enviada»).
- **Solo videollamada** (`SOLO_VIDEO`). Las llamadas de voz y el botón «Altavoz» están quitados por ahora; el código queda guardado (`ELIGE_SALIDA = false` en llamada.js).
- **Inicio con dos botones**, «Invitar a chat» y «Contactos». Contactos tiene su propia pantalla con «‹». Los contactos guardados se quedan, y en el teléfono solo una conversación sin guardar.
- **App instalada:** arriba a la izquierda, el candado de GUARDIANA y «GUARDIANA».
- **Instalar:** en Android y PC, tras aceptar una invitación, sale la pregunta «¿Añadir GUARDIANA a tu pantalla de inicio?» con Sí/No. En PC hay además el botón «Instalar en este ordenador». En iPhone no se puede.
- **Al invitar se elige chat normal o chat blindado.**
  - El blindado va en champán con el marco de espejo.
  - Va velado hasta mantenerlo pulsado; lo que se escribe se ve en números y las fotos borrosas hasta tocarlas.
  - Al salir de la app se vela. En PC, la tecla de captura y salir de la ventana tapan la pantalla con «Modo blindado · No se puede capturar».
  - En la videollamada blindada, ya conectada, salen dos botones: «Voz grave» y «Mosaico». En el normal no hay efectos.
- **Hoja de invitar:** WhatsApp, «Otras apps» y «Cancelar».
- **Botón de enviar** como el de WhatsApp: 46 px, se nota al tocarlo y vibra, y queda lejos de la barra del ✓ del teclado de iOS 26.
- **Actualización sola:** al volver a la app y cada 10 minutos, si hay versión nueva se recarga en un buen momento y vuelve al mismo chat.
- **Tirar para actualizar,** con solo el ✓ verde.

### Cifrado (y cómo se puede decir)
- **Normal:** ECDH P-256 + ML-KEM-768 híbrido, identidad fija y enlaces `#i=`.
- **Blindado:** ECDH P-384 + ML-KEM-1024, firmas ECDSA P-384 + ML-DSA-87, claves renovadas cada 5 minutos, identidad nueva en cada sesión y enlaces `#b=`.
- **Llamadas:** WebRTC con DTLS-SRTP, siempre por el TURN (nadie ve la IP del otro). El audio y el vídeo NO son postcuánticos.
- **Cómo decirlo:** se dice «algoritmos de la suite CNSA 2.0», nunca «conforme» ni «certificada»; nada de «recuperación tras compromiso».

## 5. A medias: guardado en ramas, sin publicar
- **`wip/recarga-sin-saltos`** (encargo del dueño, 08:38: «al actualizar… arriba me aparece un momento desconectado y se mueve la parte de arriba»).
  - **Ya hecho:**
    - `arranque.js` en `<head>`: la app se ve como app desde el primer fotograma y la pantalla queda tapada hasta que app.js la descubre con `revela()`.
    - El título de la barra ya está en el HTML (`.barra-web` y `.barra-app`), y `#rele` empieza oculto, así que no sale «Desconectado» al cargar.
    - Estados «quietos» (`quietoTodas`, `quietoConv`, `lineasPrevias`, `guardaPantalla`): no parpadean «Sin conexión», «No conectado» ni «Conectando…» al recargar, en cortes cortos o cuando recarga el otro.
    - Tirar para actualizar vuelve a la misma pantalla (`gcom-volver`).
    - Prueba nueva: `recarga.js`.
  - **Falla:** quedan 3 comprobaciones de recarga.js. El seguro de 3 s de arranque.js salta antes de que llegue app.js (la prueba retrasa los scripts 450 ms).
  - **Arreglo:** guardar ese temporizador en `window.gcomArranque` y que app.js lo cancele nada más empezar. Después, pasar todas las pruebas, subir versiones (j), ejecutar huellas, publicar y mandar captura.
  - En la misma rama, `orbita/comunicaciones/marcas/whatsapp/` tiene los glifos OFICIALES de WhatsApp. El dueño bajó el zip del Brand Resource Center de Meta y aceptó sus condiciones.
- **`wip/baul-contactos`:** el baúl cifrado de contactos en el relé.
  - `zero-motor/baul.js`, los mensajes `baul-lee` y `baul-pon`, y `baulLee`/`baulPon` en rele.js.
  - Falta terminar sus pruebas.

## 6. Pendiente, en este orden
1. **Terminar y publicar la recarga sin saltos** (sección 5).
2. **Botón de WhatsApp con el logotipo oficial** (el dueño insistió a las 08:43).
   - Usa el SVG de `marcas/whatsapp/` tal cual, con `<img>`, en `#invitar-wa`: el glifo blanco sobre el verde #25D366 o el glifo verde solo. Mantén la palabra «WhatsApp» con la misma letra que el resto.
   - Normas de Meta: no cambiar ni el diseño ni los colores; no combinarlo con otros logos ni con palabras genéricas; que no sea lo más destacado de la pantalla; que no sugiera patrocinio.
   - Añade la nota de marca en LICENCIAS.md (marca de WhatsApp LLC, fuera de la AGPL) y en terminos.html §6.
   - No dibujes ni copies el logo a mano.
3. **«¿Cómo funciona?»** (dueño, 08:24 y 08:41).
   - Un botón igual que «Contactos», debajo de él en el inicio, que abre su propia pantalla con «‹».
   - Texto nuevo, pensado para un cliente que lo lee por primera vez y se queda tranquilo:
     - Qué es el chat normal y qué es el blindado.
     - La tecnología, en palabras sencillas.
     - Sin registro: ni teléfono, ni correo, ni cuenta.
     - Sin instalar nada: la web vive en el navegador, no puede leer contactos, fotos ni otras apps, y no deja nada corriendo a escondidas.
     - El relé no lee ni guarda mensajes.
     - Código abierto (AGPL, repositorio público) y verificable (página verificar y huellas).
   - Sé honesto con el malware: GUARDIANA no añade riesgo ni deja nada legible, pero no protege un teléfono ya infectado por otra vía.
   - Hoy es `<section class="pro" id="pro">` (index.html, ~líneas 155–286), que se abre con `#como-btn` (app.js).
   - Hay que quitar lo viejo: la tarjeta «Llamadas de voz» y el «código de 9 cifras» en el móvil.
   - Traducciones en y pt.
4. **Videollamada perfecta** (dueño, 08:42).
   - Que elija sola Núremberg o Miami por menor latencia para los dos.
   - Con poca cobertura, sin saltos:
     - `degradationPreference` y `contentHint 'motion'`: bajar la resolución antes que congelar.
     - FEC de Opus y prioridad alta al audio.
     - `restartIce()` al cambiar de wifi a datos o al pasar a 'disconnected'.
     - TURN por TCP/TLS 443 de reserva.
5. **Informe de seguridad al colgar** (dueño, 08:29), para los dos y en normal y blindado, con «Ver» y «Descargar».
   - Contenido: duración, DTLS-SRTP de extremo a extremo, siempre por el relé (IP oculta), servidor usado, «chequeo continuo» (huella DTLS intercambiada dentro del canal cifrado, calidad) y si se usó Voz grave o Mosaico.
   - Firmado por los dos equipos como el comprobante de archivos y comprobable en `orbita/comunicaciones/verificar/`.
6. **«Descargar» en el comprobante de entrega** de fotos y documentos (dueño, 08:30). Ya existen «Entrega custodiada» y «Llegó a su destino intacto».
7. **Contactos en todos los equipos con llave de acceso y Face ID** (opción 2, aprobada el 28 Oct a las 20:54). Se parte de `wip/baul-contactos`.
   - Llave de acceso WebAuthn con PRF (iOS 18+; Safari necesita un toque).
   - Sal SHA-256("GUARDIANA contactos v1") y HKDF → clave, id y token de escritura.
   - Blob cifrado en el relé (/opt/guardiana/datos-com).
   - Identidades blindadas exportables: P-384 PKCS8 sellada con `reposo` y ML-DSA.
   - Fusión con lápidas; volver a entrar en las salas al recuperar la visibilidad (caso «sustituido»).
   - «Traer mis contactos» en Contactos. Los contactos antiguos necesitan una invitación nueva.
8. **Notificaciones web push con el globo rojo** (iPhone 16.4+ con la app en la pantalla de inicio, Android y PC).
   - VAPID en el relé, `setAppBadge` y contenido cifrado de extremo a extremo.
   - Para las llamadas, avisos repetidos. Sonar como una llamada de verdad necesitaría una app nativa (CallKit).
9. **Explicarle al dueño, en dos o tres líneas, qué es el relé (el servidor de Núremberg):** qué hace (pasa los paquetes cifrados entre los dos equipos y, en las llamadas, oculta la IP de cada uno) y qué no puede hacer (leer ni guardar mensajes). Lo de los mensajes tardíos ya se respondió y arregló.
10. **Llamadas de voz por el auricular o el altavoz en iPhone.** En pausa por decisión del dueño: «ya lo solucionaremos».
11. **Órbita, revisión punto por punto de todo el mapa** (a medias, prioridad baja): cables (extremos, tramos por tierra, duplicados), fibra por tierra, radioenlaces, centros de datos, satélites, estaciones, plataformas y nombres; arreglar lo que salga. El detalle está en TRASPASO.md.

## 7. Decisiones del dueño que hay que respetar
- Vídeo a pantalla partida por defecto.
- Ticks de leído en verde.
- Marco de espejo, champán en el blindado.
- Textos mínimos.
- La etiqueta GUARDIANA de arriba no hace nada.
- Tirar para actualizar sin la palabra «Actualizado».

## 8. Límites ya explicados al dueño (no prometer otra cosa)
- El teclado del teléfono no se puede sustituir, y la barra del ✓ sobre el teclado de iOS 26 no se puede quitar.
- El iPhone no deja que una web se añada sola a la pantalla de inicio.
- En el móvil no se pueden bloquear las capturas de pantalla.
- Con la app cerrada, una web no puede sonar como una llamada.
- La encriptación no impide que quien recibe guarde copias ni protege un equipo ya comprometido.
