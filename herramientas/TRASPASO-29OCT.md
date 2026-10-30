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

---

# Añadido a las 11:45 (29 Oct 2026), sesión de la tarde

## 9. Hecho y publicado hoy (main, commits a1f43758 → d34dab2e → b74a60a9)
- **Pantalla de inicio**: botón «¿Por qué?» como pastilla con la palabra (sin icono «?»), titular «Encriptación de categoría
  gubernamental para mensajes, llamadas y archivos», lema con «nadie más, ni nosotros», «Tus datos, bajo tu control» traducido,
  ✓ azul al tirar para actualizar, tarjeta al compartir (og-comunicaciones.jpg), `?app=1` abre sola la guía de instalar.
- **Teclado**: con `html.con-teclado` la barra de arriba se oculta y la cabecera del chat se compacta (CSS, app.css).
- **Blindado** (app.js, llamada.js, index.html, app.css): lo que llega va **velado** (`m.velado`, burbuja `.gc-velada` con
  Mostrar/Descartar; control `descartado`); **tiempo en pantalla** (`m.archivo.vida` = 'una' | 30 | 60 | 300; visor `#visor`;
  controles `visto` y `borra`; `borrarPendientes` si la otra persona no está); **alarma** (`alarma(c, por)`, `ALARMA_INCIDENCIAS = 2`,
  control `alarma`, pantalla `#alarma`); **paquete «todo o nada»** (AES-CTR con clave de un uso, `paq`, control `paquete` con la
  pieza final = clave ⊕ SHA-256 de las piezas; `abrePaquete` en memoria o segunda pasada en disco; `completaRecepcion`);
  **número de seguridad en la llamada** (ZRTP: P-256 con compromiso en la oferta, revelación `sas`, ligado a las huellas DTLS;
  `#ll-sas` grande 40 s y píldora `#ll-sas-mini`; `o.sasOk` → `marcaVerificada`, `o.sasMal` → alarma en blindado / cuelga en normal).
- **WhatsApp**: al volver no se abre el chat; se abre cuando la otra persona entra (`R.on('llega')`).
- **Avisos con la app cerrada**: `zero-motor/avisos.js` (Web Push sin dependencias, VAPID en `datos-com/avisos/vapid.json`),
  mensajes `avisos`/`despierta` en el relé (ya en producción: `/salud` → `com.avisos`), `orbita/comunicaciones/sw.js` (scope
  `/orbita/comunicaciones/`, CSP `worker-src 'self'`), app.js: `puedePush`, `registraSW`, `suscribeAvisos`, `sincronizaAvisos`
  (en 'hola' y en `pintaLista`), `despierta(c, tipo)` al escribir/llamar a quien no está, `despiertaLlamada` (la llamada
  empieza sola al entrar, 45 s), hoja `#h-avisos` una vez, `?desde=aviso&sala=…` abre esa conversación. Comunicaciones usa
  siempre el relé de Núremberg (una sola clave VAPID).
- **Tonos**: timbre de madera F#5–D5, tono de red 425 Hz con armónico, aviso de mensaje de una nota (`urlTono`, `tonoWeb`, `avisaSonido`).
- **Velocidad**: VENTANA 24 / VENTANA_B 48; relé RITMO_BPS 16 MB/s, RAFAGA 64 MB (normal).
- **Letra**: IBM Plex Sans variable, un archivo por alfabeto + `fonts/IBMPlexSans-cyrillic.woff2` (ruso y checo ya con Plex).
  El dueño decidió (11:11) quedarse con Plex. Espécimen y estudio de alternativas en el scratchpad de la sesión (no en el repo).
- **Comodidad visual** en el teléfono: burbujas 16 px/1,45, filas 16 px, nada por debajo de 13 px (final de app.css).
- Versiones: app.css o, app.js o, llamada.js o, idioma.js p74. Pruebas nuevas: `blindado.js`, `avisos.js`.

## 10. En marcha al escribir esto
- **42 idiomas en Comunicaciones**: faltaban ≈403 claves en 37 idiomas (`i18n/<code>.json`, el checo y el ruso están al día).
  Se tradujeron por tandas (archivos `<code>.add.json` en el scratchpad) y se funden con un script; después `data-idiomas="todos"`
  en comunicaciones/index.html y subir `?v` de idioma.js. Comprobación: ningún texto en español en una captura en cada idioma.
- **Cuadro comparativo** en «¿Por qué?» (WhatsApp, Signal, Telegram, iMessage): hechos con fuentes en `comparativa/hechos.json`;
  solo lo confirmado con fuente (regla de las dos voces); fuentes en terminos.html §6.
- **Ultra** (de pago; normal y blindado gratis, dueño 11:15): propuesta enviada (doble camino por capas con los dos relés, puzle
  repartido, cadencia constante, salas rotativas, 1 TB, prepago sin cuenta). Esperando el sí.
- Después: participante en llamada/videollamada y chats de grupo (dueño 10:18–10:19), iPad con diseño de PC (10:53, «después»).

## 11. Decisiones nuevas del dueño (29 Oct, tarde)
- Normal y blindado gratis; Ultra de pago (11:15). Nada de mandar números por otro canal: la comprobación es el número de la
  llamada (10:14–10:16). No añadir en Comunicaciones lo que no se pueda explicar con datos comprobables.

## 12. Tramo 4 (13:30, publicado en main: 3abfe7cc) — «solo el chat normal, minimalista»
- Dueño, 12:50–12:59: «el modo blindado en la aplicación pon próximamente y que solamente se puede utilizar el modo normal, que es
  minimalista todo… el chat normal básico, como lo tiene WhatsApp… ya luego seguiremos con los demás».
- **Indicadores** en app.js: `BLINDADO_ACTIVO = false`, `ULTRA = false`, `extrasB(c) = BLINDADO_ACTIVO && esB(c)`. Con ellos se apagan
  en pantalla (sin tocar el protocolo): velo de llegada, modo discreto, tiempo en pantalla, alarma, paquete todo-o-nada, voz e
  imagen protegidas en la llamada (`o.blindada`), número de seguridad en la llamada (`o.sas` en llamada.js, `pintaSas`), recibos
  (`recibo()`), viaje del archivo (`abreSiToca`, botón «Ver el viaje»), comprobante de custodia (anuncio `v: 0` y `listoCarga`),
  sello «Completo y autenticado», «Borrar en los dos». Las sesiones blindadas que ya existan siguen con sus claves.
- **Hoja de invitar**: `#tipo-blindado` con `aria-disabled` y «Próximamente» (clase `.pronto`); en el ordenador `#nueva-blindada`
  solo avisa. Para reactivar el blindado: `BLINDADO_ACTIVO = true`, quitar `aria-disabled`/`.pronto` en index.html, y volver a
  activar las pruebas `blindado.js` y `tipos.js` (hoy se omiten solas si el botón está apagado).
- **Mismo chat por identidad** (`fundeConContacto(c)`, llamado en `recibePresentacion` cuando `nueva`): en el normal la huella de la
  otra persona es la de su equipo (YO), igual en todas sus conversaciones; si coincide con una conversación anterior, el chat nuevo
  hereda alias/contacto/verificada, los registros `msg` y `arch` pasan a su `conv`, y las viejas se quitan (sin «destruir» a nadie).
  En el blindado no se puede (identidad nueva por sesión, a propósito). Prueba: `mismo-chat.js`.
- **Vuelta de WhatsApp**: en `visibilitychange` (hidden) se abre el chat de la invitación (`esperaEnChat`); nota «Invitación enviada.
  En cuanto la otra persona la abra, el chat empieza aquí.» (`li.gc-espera` en `pintaTodos`).
- **Nota de voz**: `preload='auto'` + `load()` y sin cambiar `navigator.audioSession.type` al reproducir (primer toque en iPhone).
- **sw.js**: ya no llama a `setAppBadge/clearAppBadge` en el mensaje `cierra` (hacía caer el renderer de Chromium headless en las
  pruebas: «Target crashed»). La insignia la pone la página.
- **Guía con invitación en Safari**: `#h-completa` con `.guia-inv` y `#guia-safari` («Seguir en Safari»); `guiaSeguir` en app.js.
- Idiomas abiertos: `data-idiomas="es en pt ru cs"` (los otros 12 ya traducidos siguen cerrados; dueño 12:17: «deja de publicar más
  idiomas»). Versiones: app.css q, app.js q, llamada.js q, viaje b, idioma.js p76, sw 29c.
- Pendiente con el dueño: foto del iPhone «como si quisiera grabar audio» en la llamada; comprobar avisos Android y audio
  iPhone→iPhone en real; recordarle que su iPhone 16 va en Safari (abrir desde el icono).

## 13. Tramo 5 (13:45, main: 3aecc970) — invitación mínima, «Chat fuerte», altavoz, H.264 baseline
- **Enlace corto**: `ORIGEN_INV = origin + '/chat/'` (app.js); `chat/index.html` (raíz del repo) pasa a `/orbita/comunicaciones/` con el
  mismo fragmento `#i=`/`#b=` (location.replace) y lleva las etiquetas OG mínimas (sin imagen). Texto: «Invitación a GUARDIANA».
- **«Chat fuerte»** (hoja de invitar) y «Fuerte» (cuadro de versiones): dueño 13:19 («normal» suena débil). Claves nuevas en es/en/pt/ru/cs.
- **Altavoz** (llamada.js): `ELIGE_SALIDA = true` otra vez (botón `#ll-altavoz`; voz → auricular, vídeo → altavoz; solo si el iPhone
  enseña las dos salidas por `enumerateDevices`). WebKit: `setSinkId` al receptor quita `DefaultToSpeaker` y pone modo VoiceChat
  (AudioSessionIOS.mm). Si al dueño no le cambia la salida, volver a `false` (y queda el aviso «Suena por el altavoz…»).
- **Vídeo iPhone → Android en negro** (13:09): `prefiereCodecs('compatible')` pone primero H.264 42e0… con packetization-mode=1, luego VP8,
  y los perfiles High/Main detrás. Sin poder probarlo aquí: confirmar con el dueño.
- Cabecera del chat en espera: línea vacía (sin «Invitación enviada»); nota `li.gc-espera` dentro del chat. La nota «Mensajes y
  llamadas encriptados…» no se repite al fundir chats.
- El aviso «Cámara grabando / ¿Dejar de grabar?» de su foto es el del propio iOS al tocar la pastilla roja de la cámara: no es nuestro.
- Pruebas: whatsapp.js (enlace corto) y llamando.js (guía «Seguir en Safari») al día. Versiones: app.js s, llamada.js r, idioma.js p77.
- (14:07–14:20, main 2dcb6a04 y 42206a16) Tarjeta «Comunicando» «pegada» arriba en el iPhone: Safari deja la pintura vieja en una lista
  con `mask-image`; en el teléfono la lista va sin máscara y con dos velos fijos (`.conv .lienzo::before/::after`, max-width 760).
  El marco de espejo y el escudo de las filas, solo con `extrasB`. Al tocar «Conexión» en la llamada se ve «envío WxH@fps CÓDEC ·
  recibo …» (codecCorto en llamada.js) para diagnosticar el negro iPhone → Android. Si con H.264 42e01f sigue en negro, el siguiente
  paso es VP8 primero entre teléfonos (`pesos` en prefiereCodecs).

## 14. Tramo 6 (14:30–15:05, main 35f2ddb1 y 07ba01b9) — avisos en segundo plano, eliminar chats, espera en el chat
- **Presencia** (relé y página): la página manda `{t:'presencia', fuera:1|0}` al ocultarse/volver (visibilitychange, pagehide,
  pageshow, y al reconectar). En el relé, `c.fuera`: cada trama entregada a una conexión «fuera» dispara `avisos.avisaA(sala, avisoId,
  'mensaje')` (Web Push a esa suscripción, silencio 20 s). Los demás miembros reciben `{t:'presencia', sala, quien, fuera}` →
  `c.suFuera` en app.js; `llama()` despierta con push a quien está fuera (`despierta(c,'llamada',true)`). «Ahora no» de los avisos
  dura 6 h (`gcom-avisos = 'no:<t>'`).
- **Eliminar chats**: `pideEliminar(c)` (hoja `#h-eliminar`, «¿Eliminar el chat con …?»), «Editar»/«Listo» en Contactos
  (`editaContactos`, botón `.contacto-quita`), mantener pulsado 550 ms una fila, y «⋯ → Eliminar chat» (`#cm-eliminar` siempre;
  `#cm-terminar` oculto). Hace `destruye(c, true)`: se borra en los dos teléfonos.
- **Espera de quien invita**: `esperaEnChat` ya no exige `c.compartido` (tras recargar o con el menú de compartir fallido, nunca la
  pantalla «Invitar · Compartir enlace»). Nota `li.gc-espera` arriba con «Volver a enviar» (`reenvia(c)` → hoja `#h-invitar` con
  `reenvioId`: WhatsApp u «Otras apps» con el mismo enlace). Las invitaciones enviadas que esperan salen en Contactos.
- **Última pantalla**: `gcom-ultima` en localStorage al ocultarse; al arrancar en los 15 min siguientes se vuelve al chat o a
  Contactos (también lo mira arranque.js para no enseñar el inicio entretanto).
- **iPhone en Safari con invitación**: sin la guía delante (dueño 14:31); `gcomGuiaInvitacion` queda sin usar. Idea pendiente para
  proponer: «traspaso» del chat de Safari a la app (semilla nueva S2 por el canal cifrado + start_url / código de 9 cifras).
- Actualización sola: `miraVersion` cada 3 min con la app a la vista, a los 20 s de abrir y al volver (si pasaron 15 s).
- Pruebas: `eliminar.js` (nueva). Versiones: app.js y, app.css u, arranque.js k, rele.js n, idioma.js p80.

## 15. Tramo 7 (15:10–15:50, main 5479e71d → f06fdd5d → 601df8c1) — llamadas y avisos coordinados
- **Llamadas** (llamada.js): `seFue()/volvio()` (la llamada no se cuelga si la conexión del otro con el relé parpadea; sonando, 12 s de
  margen; la oferta se reenvía con `ultimaOferta` al volver la sesión); `plat` en la oferta y VP8 entre iPhone y Android, H.264 entre
  iPhones (`prefiereCodecs(perfil, vp8)`); 1080p en el teléfono (`VIDEO` por `TEL_UA`); `salidaDeSiempre()` (videollamada siempre por el
  altavoz, `setSinkId('')` al empezar con imagen y al colgar); `auricularPrevio()` (`gcom-auricular` en localStorage, se aplica ANTES de
  `medios()`); `giraCamara()` (botón `#ll-girar`, clase `.trasera` sin espejo); «Sonando…» (acto `sonando`); SIN_RESPUESTA 60 s;
  reconexión 30 s; Wake Lock con imagen; tocar «Encriptada de extremo a extremo» enseña el detalle (`.ver-calidad`, códec que va y viene).
- **Avisos**: relé `entrega()` → `avisos.avisa(sala, de.avisoId, 'mensaje')` si el receptor está `fuera` o lleva >25 s sin señal;
  `presencia` también al entrar en la sala (los dos sentidos); página: `avisosFirma=''` en cada `hola` (reenvía la suscripción);
  sw.js d: siempre `showNotification` (si no, iOS pone «Notificación»); página retira el aviso si ese chat está a la vista;
  `avisaSonido()` solo con la app a la vista y suelta el AudioContext (evita el reproductor «(1) GUARDIANA» en la pantalla bloqueada).
- **Estado**: `pareceEnLinea` y la cabecera tratan `suFuera` como «No conectado»; `presencia` repinta al momento.
- **Chat fuerte**: `revisaEnvio` envía directo si `!extrasB(c)` (sin hoja «Tapar»); nota de voz: `voz:1` al recibir, sin «Guardar»,
  `recibido` incluye `leido` en tarjetaArchivo, `.gc-archivo-voz .gc-voz` con ancho propio, truco `currentTime=1e101` para WebM sin
  duración. «Mis chats» (`#ver-contactos`, `#contactos-t`). Tarjeta de llamada con clase `llam-aviso` (no `aviso`).
- Estudio WhatsApp/Telegram: /tmp/…/scratchpad/llamadas-estudio.md (prioridades 1–10; hechas 1 parcial, 2, 3, 5 parcial, 7 parcial).
  Pendiente: mala red → solo voz (4), botones Contestar/Rechazar en el aviso de llamada de Android (1), colgar con pulsación larga (7),
  «Devolver llamada» desde el aviso (8).

## 16. Tramo 8 (15:52–17:40, main a38b6365 → e0f339c9 → f0fc47ae) — iPhone de una sola vez, avisos en orden, Ajustes
- **Diagnóstico clave (16:05–16:11)**: en el iPhone, Safari y la app de la pantalla de inicio guardan cada uno sus cosas, y Safari no
  puede avisar con la app cerrada. La mujer del dueño abría el enlace en Safari → chat en Safari, app vacía, sin avisos.
- **Flujo iPhone (17:04, «de una sola vez»)**: en Safari con `#i=`/`#b=` y `!comoApp()` → `muestraIOS(true)` + la guía `#h-completa`
  (`gcomGuiaInvitacion`) sale sola a los 350 ms, en modo `con-invitacion`: sin «Seguir en Safari» ni «Entendido»; el manifiesto se
  sustituye por un data: con `start_url: /orbita/comunicaciones/?app=1&inv=i=…#i=…` (el arranque entiende `?inv=` y el fragmento) y la
  URL de la página se reescribe igual (`history.replaceState`) por si el iPhone toma esa. Detrás, `#paso-ios` con «Ver cómo se añade» y,
  discreto, `#ios-safari` («Usar en Safari, sin avisos» → `aceptaEnlaceYa`). Guía: «pulsa» (17:16). Prueba: `iphone.js`.
  Quitados (17:28): modo día, botón del sol, `#pegar-inv` («Tengo una invitación»).
- **Avisos**: tramas `0x11` = merecen aviso (solo `enviaCola`: texto y anuncio de archivo); `rele.js` manda `{t:'hola', marca:1}` y solo usa
  `0x11` si el relé contestó `marca:1`; el relé avisa en `entrega()` con `avisa || !de.marca` (compatibilidad en los dos sentidos
  mientras se actualizan). `rele.js` reenvía la última suscripción (`subUlt`) nada más abrir, antes de cualquier trama (si no,
  `de.avisoId` era null y el aviso podía volver al remitente). `avisa()` devuelve `{avisados, silenciados}`; «no tiene los avisos
  activados» solo con los dos a 0. `topic` por sala y tipo. `suFuera=false` en `cerrado`/`sala`. `avisaFuera` usa la misma etiqueta que
  sw.js (`gcom-mensaje-<sala16>`): un solo aviso por mensaje. `retiraAvisos` vale sin `controller` (`swReg.active`). Presencia inicial
  = `document.visibilityState` (página que nace oculta). `preguntaAvisos` respeta `gcom-avisos='off'` (Ajustes).
- **Insignia (16:07)**: `pintaInsignia()` = suma de `noLeidos` de `vivas()`; se llama en `pintaLista`, `marcaLeidos`, `retiraAvisos`,
  `vuelve`, `pintaTitulo`. sw.js e: `insignia()` solo sin cliente visible (y en `notificationclick` solo si no hay ventana).
- **Puntito (16:01)**: `#cpunto` junto al nombre (`.gc-punto.en` verde / rojo); en el móvil `#cconfianza` queda vacía y `:empty{display:none}`;
  filas: `.fila-av.no-linea` / `.contacto-av.no-linea` rojo; sin «En línea»/«No conectado» escritos.
- **Ajustes (16:02 idea de Nathalie; 17:11 tuerca)**: `#ajustes-btn` (barra) y `#cm-ajustes` (⋯) → hoja `#h-ajustes`: `#aj-avisos`
  (interruptor: on → `activaAvisos`/`suscribeAvisos(true)`; off → `quitaAvisos` + `gcom-avisos='off'`; estado: bloqueados en el
  teléfono / solo app instalada), `#aj-sonido` (`gcom-sonido`, `pref('sonido')` en `avisaSonido`), `#aj-anadir`, `#aj-version`
  (`miraVersion(true)` → `actualizaYa()`).
- **Inicio (17:01)**: los tres botones iguales (regla final de app.css: 62 px, 17.5 px, margin-top 0).
- **Revisión independiente** (/tmp/…/scratchpad/revision-29oct.md, 25 hallazgos): hechos 1–6, 8–11, 14–18, 21, 22, 25; quedan 7, 12,
  13, 19, 20, 23, 24 (tarea #75).
- Pruebas nuevas/al día: iphone.js; contactos, recarga (puntito), llamando, altavoz, instalar, viaje-movil (omitida sin Ultra) usan
  `#ios-safari` por `evaluate`. altavoz.js ya fallaba antes (setSinkId no real en Chromium sin cabeza).
- Versiones: app.js 31d, app.css 31e, rele.js 31b, llamada.js 31d, arranque.js 30l, sw.js e, idioma.js p84; relé: `marca` en el saludo.

## 17. Tramo 9 (17:40–17:55, main dc78946b) — timbre clásico, «Llamada perdida», detalles
- **Timbre** (llamada.js `urlTono`): `TIMBRE='clasico'` (dueño 17:46, de tres muestras: campana, marimba, clásico; las otras dos siguen en el
  código por si cambia de idea); 44,1 kHz, eco de sala y `tanh`; se preparan al arrancar (`setTimeout` 3,5 s). Saliente: 425 Hz.
- **«Llamada perdida» en el teléfono**: `despierta(c,'llamada')` anota `c.avisoLlamadaEn`; en `anotaLlamada` (saliente sin `fin`) y al agotar
  `despiertaLlamada`, `R.despiertaA(sala,'fin')`; relé: tipo `fin` (ttl 120, mismo topic `gcom-l-…` que la llamada); sw.js f: cierra
  `gcom-llamada-<sala16>` y enseña «Llamada perdida · toca para devolver la llamada» (tag `gcom-perdida-…`).
- Ajustes: filas de 76 px y `small` con `min-height:2.7em` (17:43). «Grado gubernamental» (17:47; clave nueva en idioma.js, ru y cs; los demás
  JSON no se tocan: no están abiertos). «De momento, el chat fuerte» (17:48).
- Revisión: 7, 12, 13, 19, 20, 23 hechos; queda 24 (enviaControl async).
- Versiones: app.js 31e, app.css 31f, llamada.js 31e, sw.js f, idioma.js p85.

## 18. Tramo 10 (17:55–20:30) — el chat se muda de Safari a la app, chat temporal, «Descargar GUARDIANA», GUARDIANA entera en el PC
- **Ronda 72 de la agencia** (herramientas/agencia-rondas/ronda72/): en el iPhone no hay «un paso» sin App Store. Hallazgo clave: la política
  `manifest-src 'self'` bloqueaba el manifiesto propio (blob:) y Safari usaba el de siempre → `manifest-src 'self' blob: data:` y el
  manifiesto lo crea `arranque.js` antes de que Safari lea ninguno (WebKit lee el primero y no lo relee). La semilla, solo en el fragmento.
- **Traspaso** (app.js, bloque «traspaso de Safari a la app»; dueño 18:56–19:04 y 20:02: «se invita únicamente al chat… luego ya la persona
  lo añade a inicio»): la invitación abre el chat en Safari sin «¿Aceptas?»; Safari guarda una llave de 32 bytes (`gcom-traspaso`) que va
  en la `start_url` del manifiesto (`?app=1#t=…`) y se la manda por el canal encriptado a quien invitó, que abre una sala oculta; la app
  añadida arranca con `#t=`, entra en esa sala y quien invitó funde los dos chats (`fundeTraspaso`: nombre, contacto, todo lo hablado);
  Safari recibe `traspasado` y enseña «Tu chat ya está en la app». Prueba: traspaso.js.
- **La barra azul** (dueño 19:13–20:12): solo con el chat ya empezado, fina (44 px), justo encima de donde se escribe; la guía, desplegable,
  con los símbolos del iPhone: Safari (iOS 26–27) «el botón de abajo» → Compartir → «Añadir a pantalla de inicio», flecha amarilla abajo a
  la derecha; Chrome del iPhone: Compartir → «Añadir…», flecha arriba a la derecha (`navegadorIOSDetalle`). Pendiente: las capturas del
  Safari de Nathalie (iOS 27.2) para dibujar el botón igualito. Fuera «Ya tengo GUARDIANA» (dueño 20:05).
- **Chat temporal** (dueño 19:46): en el navegador del móvil (iPhone siempre; Android mientras no está instalada) se borra a los 10 minutos
  sin usarlo (toques, mensajes, llamadas; `gcom-temporal-uso`) en los dos lados (`destruir`); quien invitó recibe `temporal`/`guardado` y lo
  borra él también si la otra persona lleva 10 minutos fuera (`caducaSuyos`). Despedida «Chat borrado» con «Descargar GUARDIANA». Línea
  dentro del chat; para borrar a mano, «Eliminar» del menú. OJO: ya existía `caducaTemporal(c, m)` (archivos del blindado): la del chat se
  llama `caducaChatTemporal`. Prueba: temporal.js.
- **Android** (dueño 20:14): igual que el iPhone: el enlace abre el chat sin preguntar (también dentro de la app del móvil) y la barra azul
  instala con un toque; al instalar (`appinstalled`) los chats dejan de ser temporales (`gcom-app-instalada`). El ordenador sigue con
  «¿Aceptas?» y los 9 números (19:48). Prueba: instalar.js al día.
- **Avisos por defecto** (dueño 20:11): en la app, el primer toque pide el permiso (`armaAvisosAlToque`): un solo «Permitir».
- **«Descargar GUARDIANA»** (dueño 19:36): en la portada (cabecera, junto a «Entrar» y en el cierre). Móvil → `/orbita/comunicaciones/?instalar`
  (iPhone: pantalla `#paso-descargar` con la guía de su navegador; Android: «Instalar» del sistema). Ordenador → la ventana de instalar
  del navegador aquí mismo, o cómo hacerlo (Chrome/Edge, Safari del Mac, otros); ya instalada, dónde está el icono. Prueba: descargar.js.
- **PC = GUARDIANA entera** (dueño 19:41–19:52): en el ordenador, Comunicaciones, la portada y NÚCLEO enlazan `/manifest.webmanifest`
  (abre NÚCLEO, alcance `/`); en el móvil, el de Comunicaciones. Tras instalar, «GUARDIANA ya está en tu ordenador» (`#h-instalada`).
  El dueño tiene instalada la app vieja (solo Comunicaciones): desinstalarla (⋮ › Desinstalar) e instalar la nueva desde la portada.
- **Siguiente (tarea #80)**: programa instalable para PC a partir de «Guardiana ZERO», misma interfaz que la web, cuadro comparativo en la
  web; sin firmar de momento, luego Certum a nombre de GUARDIANA GROUP. Pasar por la agencia antes.
- Versiones: app.js 31f, app.css 31g, arranque.js 31b, idioma.js p86 (ru y cs al día).
