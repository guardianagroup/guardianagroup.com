# Pruebas de GUARDIANA Comunicaciones (teléfono simulado)

**Desde el 1 nov 2026, el teléfono va a /solo-pc/.** GUARDIANA funciona solo en el PC (marco/marco.js): en un teléfono o una
tableta, la página se para y lleva al aviso /solo-pc/; solo se abre allí lo que trae la llave de «Pasar al teléfono» (`#llevar=`).
Por eso, las pruebas que abren Comunicaciones en un teléfono simulado (iPhone o Android) acaban en ese aviso en el primer paso y
quedan fuera de la batería hasta que se pasen al PC o se retiren (comprobado el 5 nov 2026: con cada una, el servidor sirve
/solo-pc/ y la prueba no llega a ninguna comprobación):
acabados, actualiza, altavoz, avisos, avisos-precision, buzon, contactos, cuatro, dos, eliminar, enviar, idiomas, instalar, iphone,
llamada-corte, llamando, mismo-chat, numero-llamada, onda-fotos, pc-grupo, pc-menu, pc-vista, pq, recarga, reenvio, responder,
revision2, temporal, tirar, traspaso, tres, viaje-movil, voz, voz-gestos, voz-grabar y whatsapp. Y en parte (algunas
comprobaciones sí pasan, las del teléfono no): descargar, numero, ruta y web.

`llevar.js` se pasa con `B_PC=1` (B en un PC; sin eso, B es un iPhone y acaba en /solo-pc/): `B_PC=1 node llevar.js`.

La batería que vale hoy, en el PC: ultra, ultra-codigo, blindado, tipos, codigo-grande, rota, llevar (con `B_PC=1`), llevar-ultra, monitor-ultra,
enviar-llamada, voz-ultra,
vigia, recupera, flotante-sola, portada, volver-pc y pantalla (compartir pantalla en el PC; su último paso, con un Android, sigue
pasando), llevar-orden y volver-ut (estas dos, pasar la llamada a teléfonos con cuatro navegadores: con la máquina muy cargada
pueden agotar el tiempo o tirar Chromium; repetidas con menos carga, el 5 nov, 10/10 y 8/8).

Playwright + Chromium emulando un iPhone (393 × 793, táctil, «instalada» con navigator.standalone).
Desde la raíz del repositorio, en dos terminales:

    node zero-motor/pruebas/rele.js 8794
    python3 -m http.server 8080 --bind 127.0.0.1

Después, desde esta carpeta:

- `node revision2.js` — todas las pantallas del teléfono (inicio, idiomas, «Invitar a chat» en un toque con navigator.share simulado, chat, menú ⋯, clip, contactos, llamadas, videollamada con 5 botones, guía). Capturas en `revision2/`.
- `node dos.js salida [teclado|voz|video|colgar]` — dos teléfonos: teclado, tonos, voz (2 pistas de audio: voz + muda), videollamada partida.
- `node altavoz.js` — altavoz o auricular: las dos salidas del iPhone simuladas (con la regla del toque); la voz y los silencios que fijan la salida van juntos, vuelven a empezar tras conectar y tras cada cambio, y el botón dice la verdad.
- `node whatsapp.js` — «Invitar a chat» en el iPhone: la hoja «WhatsApp» / «Otra app», el enlace whatsapp:// con la invitación, la ida y vuelta a WhatsApp, el chat con ese enlace, qué pasa si WhatsApp no se abre, y Android sin hoja.
- `node instalar.js` — «¿Añadir GUARDIANA a tu pantalla de inicio?» tras aceptar una invitación: Android (con y sin el aviso del navegador), «Ahora no», el ordenador y el iPhone (sin pregunta).
- `node enviar.js` — el botón de enviar: en el sitio del micrófono, del mismo tamaño, de color, lejos del teclado y con respuesta al pulsarlo.
- `node enviar-llamada.js` — «Enviar» en la llamada del teléfono (foto sin datos ocultos, ubicación con confirmación y archivo), del teléfono al PC, del PC al teléfono y entre dos teléfonos (iPhone 390 × 844 y Android 412 × 915), sin colgar; al terminar, nada guardado en los teléfonos. Capturas en `enviar-llamada/`.
- `node codigo-grande.js` — el código de seguridad de la llamada en las dos versiones: en la Blindada, ni la tarjeta roja ni la píldora; el código, en «Seguridad de esta llamada» (en el teléfono al que se pasó la llamada lo abre el título). En Ultra (desde el 15 nov 2026; en local, `?plan=plus` hace de programa con Plus), la tarjeta roja del código en el centro de las dos pantallas al empezar y al cambiar la llave, con las 4 palabras plegadas arriba, iguales en los dos; «Coinciden» la pliega con ✓; «No coinciden» cuelga y borra la conversación en los dos; y la llamada Ultra no se pasa al teléfono.
- `node actualiza.js` — la actualización sola: con una versión nueva simulada, espera a que no haya nada a medias, se recarga, vuelve al mismo chat y no entra en bucle.
- `node tipos.js` — las dos versiones al invitar: fuera del programa, Ultra apagada en la hoja con su motivo («Solo desde el programa GUARDIANA, con Plus») y el botón del inicio que lo explica; con `?plan=plus`, Ultra elegible; los enlaces «#i=» y «#b=», el marco y el velo de Ultra, los números al escribir, «Voz cambiada» y «Mosaico» solo con la llamada en marcha, y la tecla de captura en el ordenador.
- `node ultra.js` — Ultra 1 (3 Nov 2026), de punta a punta con `?plan=plus` (o la pasarela del programa simulada): la puerta (GET /api/plan), la invitación (desde el 15 nov, en el PC, con el código de 16 caracteres; el enlace de 256 bits en el fragmento, para quien lo recibe), las 4 palabras y el nivel de cada lado, bloques de 1 KB con latido, sin buzón, sin rebaja, recibo negable y comprobante firmado a petición, fotos sin EXIF y nombres neutros, nada en IndexedDB tras recargar, pánico con Esc, la pantalla táctil (tapada y claves borradas a los 15 s) y, en la llamada, cbr=1/usedtx=0 en cada sección de audio, paquetes del mismo tamaño y la clave cada minuto.
- `node ultra-codigo.js` — la invitación Ultra también con un código de 16 caracteres (6 nov 2026; diseño en `ULTRA-CODIGO.md`). Levanta su propio relé (el de zero-motor, en este proceso, puerto 8795 o `RELE_PUERTO`) para ver lo que guarda; solo hace falta la web en el 8080. Comprueba el formato, que el relé guarda un buzón de 9 cifras (de PBKDF2 y HKDF, calculado aparte en Node) y un sobre que en Node abre con el código y da la semilla del enlace, que el código no aparece en nada de lo que recibe el relé, «Usar un código» también tras «Copiar enlace», la entrada con minúsculas, espacios y O por 0, las cuatro palabras y los mensajes, el código usado, uno inventado, lo pegado (con y sin código, en ancho completo), la Blindada de 9 cifras (un solo código, y uno nuevo tras un corte), el aviso sin la capa postcuántica (en la casilla; con el enlace, el de siempre), un código forzado que empieza por 9 cifras (ningún «busca» con ellas) y lo escrito mientras se comprueba, que con el enlace solo no llega ningún «invita» (tampoco al reconectarse), el código caducado, cancelado, perdido tras un corte o recogido sin que nadie entre («Nuevo código» a los 30 s) y dos invitaciones que piden código a la vez. Capturas en `ultra-codigo/`.
- `node fotos-editor.js` — el editor de fotos (15 nov 2026), entre dos PCs: «Foto» abre el editor (texto con color y fondo, mover, dibujar,
  deshacer, comentario), la foto llega editada (JPEG) con el comentario debajo; sin «Responder» en las fotos; «Editar» en el visor; «Documento»
  directo; varias fotos con su comentario cada una; y el modo «Listo» de la hoja del blindado, con «Tapar».
- `node salir-los-dos.js` — el chat privado (15 nov 2026): al salir los dos (al inicio, a otra conversación o cerrando la pestaña) y sin nada por ver, el chat se borra en los dos equipos, en memoria y en el disco; con un mensaje sin ver no se borra; con la otra persona fuera de línea, la orden espera firmada en su buzón y, al volver a abrir GUARDIANA, el chat no llega a verse ni un momento; si la otra persona sigue dentro, una recarga no lo borra; y un mensaje que espera en el buzón se enseña al volver y no se borra hasta verse. 21 comprobaciones.
- `node monitor-ultra.js` — la llamada Ultra del 15 nov 2026, PC ↔ PC en videollamada y PC ↔ teléfono (tamaño de teléfono) en voz: «Voz cambiada» y
  «Mosaico» puestos de serie y a la vista encima de la barra (un toque los quita o los pone); la tarjeta roja del código en el centro de las dos
  pantallas al empezar y al cambiar la llave, con las 4 palabras plegadas arriba; el Monitor de seguridad siempre a la vista (abierto en el PC,
  plegado en una línea en el teléfono) con sus filas reales: encriptado, capa postcuántica, clave y cuándo cambia, código, huella de la conexión,
  sala del relé, fragmentos verificados y rechazados, ruta y código de la página; sin avisos falsos al empezar. Capturas en `monitor-ultra/`.
- `node orbita-llamada.js` — «Tu llamada en Órbita» (15 nov 2026): en una videollamada Ultra entre dos PC, «Ver en Órbita» del
  monitor abre Órbita en otra pestaña con #llamada, sin la portada; el planeta solo con la llamada y el panel con el monitor en
  directo (le llega de la pestaña de la llamada por BroadcastChannel cada segundo); al colgar, «La llamada ha terminado.»; a
  tamaño de teléfono el botón no sale. Capturas en `orbita-llamada/`.
- `node llevar-ultra.js` — «Pasar al teléfono» en Ultra (15 nov 2026, dueño, 21:42): A (PC) pasa la videollamada Ultra a su teléfono T
  (código QR con «.u» al final); en T y en B siguen la voz cambiada, el mosaico, la capa postcuántica (con la llave del QR), la tarjeta
  roja con el mismo código y el Monitor de seguridad. T cuelga: «Volver a llamar» en los dos, durante 15 minutos, y la llamada vuelve a
  ser Ultra; «Cerrar» borra de la pestaña la llave y la marca de Ultra. `DEP=1` saca la consola de cada navegador. Capturas en `llevar-ultra/`.
- `node inicio-modos.js` — el inicio en el PC (15 nov 2026): primero el tipo de conversación, Blindado o Ultra (radio, también con las flechas); debajo, «Tengo un código» y «Crear un código», que hablan del código de ese tipo; «Crear un código» da el de 9 cifras o el Ultra de 16 caracteres; en inglés, traducido; en el teléfono, el inicio de siempre. 10 comprobaciones.
- `node voz-ultra.js` — la voz cambiada de Ultra medida en Node (formantes, tono y paso banda), sin navegador.
- `node contactos.js` — guardar contactos, volver, llamar desde la lista, recargas.
- `node tirar.js` — tirar para actualizar (solo el ✓, sin palabra).
- `node web.js` — la página en el ordenador y en el navegador del teléfono.
- `node ingles.js` — textos nuevos en inglés.
- `python3 hoja.py salida.png 360 a.png b.png …` — junta capturas en una hoja.
- `node ../csp-comprueba.js` (desde la raíz: `node herramientas/csp-comprueba.js`) — la Content-Security-Policy de toda la web, página a página, en Chromium: cero violaciones y cero manejadores en línea. Antes, si cambió algún script escrito dentro de una página (también en m/, e/ y Comunicaciones), `python3 herramientas/csp-hashes.py` recalcula los hashes de script-src; si no, el navegador deja ese script sin ejecutar.
