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

La batería que vale hoy, en el PC: ultra, ultra-codigo, blindado, tipos, codigo-grande, rota, llevar (con `B_PC=1`), enviar-llamada, voz-ultra,
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
- `node codigo-grande.js` — el código de seguridad de la llamada en las dos versiones: en la Blindada, ni la tarjeta roja ni la píldora; el código, en «Seguridad de esta llamada» (en el teléfono al que se pasó la llamada lo abre el título). En Ultra (3 Nov 2026, Ultra 1; en local, `?plan=plus` hace de programa con Plus), las 4 palabras de verificación en el centro, iguales en los dos; el código de la llave, en el panel; «No coinciden» cuelga y borra la conversación en los dos; y la llamada Ultra no se pasa al teléfono. (La tarjeta roja del código queda solo para rota.js, con `sessionStorage['gcom-ultra'] = '1'`, en local.)
- `node actualiza.js` — la actualización sola: con una versión nueva simulada, espera a que no haya nada a medias, se recarga, vuelve al mismo chat y no entra en bucle.
- `node tipos.js` — las dos versiones al invitar: fuera del programa, Ultra apagada en la hoja con su motivo («Solo desde el programa GUARDIANA, con Plus») y el botón del inicio que lo explica; con `?plan=plus`, Ultra elegible; los enlaces «#i=» y «#b=», el marco y el velo de Ultra, los números al escribir, «Voz cambiada» y «Mosaico» solo con la llamada en marcha, y la tecla de captura en el ordenador.
- `node ultra.js` — Ultra 1 (3 Nov 2026), de punta a punta con `?plan=plus` (o la pasarela del programa simulada): la puerta (GET /api/plan), la invitación de 256 bits solo en el fragmento, las 4 palabras y el nivel de cada lado, bloques de 1 KB con latido, sin buzón, sin rebaja, recibo negable y comprobante firmado a petición, fotos sin EXIF y nombres neutros, nada en IndexedDB tras recargar, pánico con Esc, la pantalla táctil (tapada y claves borradas a los 15 s) y, en la llamada, cbr=1/usedtx=0 en cada sección de audio, paquetes del mismo tamaño y la clave cada minuto.
- `node ultra-codigo.js` — la invitación Ultra también con un código de 16 caracteres (6 nov 2026; diseño en `ULTRA-CODIGO.md`). Levanta su propio relé (el de zero-motor, en este proceso, puerto 8795 o `RELE_PUERTO`) para ver lo que guarda; solo hace falta la web en el 8080. Comprueba el formato, que el relé guarda un buzón de 9 cifras (el de HKDF, calculado aparte en Node) y un sobre que en Node abre con el código y da la semilla del enlace, que el código no aparece en nada de lo que recibe el relé, la entrada con minúsculas, espacios y O por 0, las cuatro palabras y los mensajes, el código usado, uno inventado, la Blindada de 9 cifras, el aviso sin la capa postcuántica (igual que con el enlace), que con el enlace solo no llega ningún «invita» (tampoco al reconectarse) y el código caducado, cancelado o perdido tras un corte. Capturas en `ultra-codigo/`.
- `node voz-ultra.js` — la voz cambiada de Ultra medida en Node (formantes, tono y paso banda), sin navegador.
- `node contactos.js` — guardar contactos, volver, llamar desde la lista, recargas.
- `node tirar.js` — tirar para actualizar (solo el ✓, sin palabra).
- `node web.js` — la página en el ordenador y en el navegador del teléfono.
- `node ingles.js` — textos nuevos en inglés.
- `python3 hoja.py salida.png 360 a.png b.png …` — junta capturas en una hoja.
- `node ../csp-comprueba.js` (desde la raíz: `node herramientas/csp-comprueba.js`) — la Content-Security-Policy de toda la web, página a página, en Chromium: cero violaciones y cero manejadores en línea. Antes, si cambió algún script escrito dentro de una página (también en m/, e/ y Comunicaciones), `python3 herramientas/csp-hashes.py` recalcula los hashes de script-src; si no, el navegador deja ese script sin ejecutar.
