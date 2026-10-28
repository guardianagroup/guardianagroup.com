# GUARDIANA · Traspaso al chat nuevo · 28 Oct 2026, 15:05 (Bogotá) — EMPIEZA POR AQUÍ

Este archivo manda sobre los anteriores. La historia completa está en `herramientas/TRASPASO-CHAT.md`, `herramientas/TRASPASO.md` y `herramientas/LANZAMIENTO.md`; léelos solo si hace falta un detalle.

## ACTUALIZACIÓN 16:25 (manda sobre lo de abajo)

Hecho y publicado entre las 15:10 y las 16:25 (main de 2fc91d0 a 6d0b867; web-idiomas hasta c6d0477):
- **Toda la web sin seleccionar ni copiar** (guardiana.css, oscuro.css, diseno.css, app.css y /nueva/; solo los campos de escribir se seleccionan).
- Fuera la tira de la campanita y el escudo de la cabecera; cabecera más grande en el ordenador.
- **Pip** de mensaje con la página minimizada (avisos del sistema en silencio); timbre de llamada el nuestro.
- **Videollamada:** partida mitad y mitad por defecto **solo en el ordenador** (botón redondo para hacerla pequeña o partirla); en el móvil como FaceTime; «‹ Atrás», tocar la imagen o el mismo botón cierran «Voz e imagen»; con la pantalla partida, la tarjeta va en la otra mitad; arranque de imagen a 1,5 Mb/s (x-google-start-bitrate); en el teléfono la llamada se bloquea en vertical donde el sistema deja (Android a pantalla completa o como app).
- **Sesión blindada sin números que comprobar** (opcional en «Seguridad y verificación»; términos punto 6 al día).
- **Invitación por enlace, fácil:** el enlace se copia solo al crearla; en el móvil un único «Compartir enlace»; al compartir, pantalla de espera entera con «Volver a compartir»; quien abre el enlace ve «Te han invitado… ¿Aceptas?» (Aceptar / No, gracias); el relé se reconecta al volver de WhatsApp y la conversación se abre sola; quien entra no escribe hasta la primera conexión («Conectando con la otra persona…»). El código del ordenador lleva «Copiar el enlace».
- **Móvil, una sola conversación:** un botón «Crear invitación» (sin «Tengo un código» ni «Sesión blindada»: en el móvil «Crear invitación» ES la blindada por enlace); crear o aceptar otra borra la anterior en los dos equipos; sin lista, sin «Tus conversaciones», sin «‹»; para salir, «⋯» → «Terminar».
- **Invitado sin rastro:** sin barra de la web; al terminar, solo «Conversación terminada» (también al recargar: sessionStorage gcom-fin); si no le quedan conversaciones, se borran su identidad (store «yo») y sus ajustes gcom-*.
- **«Borrar el chat»:** papelera junto al micrófono (solo con el campo vacío; al escribir, el micrófono pasa a «Enviar»); borra aquí y en el otro equipo (pendiente si no está: `vaciarPendiente`, sale con `mandaVaciar` cuando hay sesión).
- **El clip con menú:** Foto o vídeo (fotos sin metadatos: `sinDatosOcultos`, canvas, máx. 4096 px), Cámara (móvil, capture), Documento, Ubicación (exacta o aproximada; tarjeta con «Abrir en el mapa», OpenStreetMap solo al tocar).
- **Pantalla completa / app:** manifiesto propio `orbita/comunicaciones/comunicaciones.webmanifest` (fullscreen, vertical); Android pide pantalla completa sola al crear, aceptar, llamar o contestar; en el iPhone, «⋯» → «Pantalla completa» explica «Añadir a pantalla de inicio»; botón «Añadir a la pantalla de inicio» (Android y ordenador con beforeinstallprompt; iPhone con los pasos); **enlace para mandar: guardianagroup.com/orbita/comunicaciones/?instalar**.
- Al salir de la página no queda la conversación en la copia del «Atrás» (pagehide vacía #mensajes; pageshow persisted recarga).
- «Entrar» en vez de «Entrar en NÚCLEO» en la portada, guías y radiografías.
- Agencia, ronda 75 (diseño del móvil): pregunta en `herramientas/agencia-rondas/ronda75/pregunta.md`; ChatGPT y GPT-6 Astra respondieron (tres controles abajo, botones grandes a lo ancho, sin Multas en la barra del móvil, globo pequeño, textos sin promesas absolutas). Aplicado. Falta guardar sus respuestas en ronda75/ (están en las pestañas del navegador integrado).

Versiones ahora: app.js y app.css **20261029e**, llamada.js **20261029s**, rele.js **20261028o**, componentes.css 20261028m, idioma.js **20261029p49**.

Pruebas nuevas en `herramientas/pruebas-com/`: invitab (17), unasola (6), vaciar (9), partida (6), ajustes (5), clip (5), completa (4), instalar (3), pip (4), sincopia (10). El móvil ya no escribe códigos: las pruebas entran por enlace (#codigo-enlace) y pulsan #aceptar-si. Los servidores de prueba (relé 8794 y web 8802) se paran a las 2 h: arráncalos otra vez si fallan todas.

Después de las 16:25, también publicado: «Añadir a la pantalla de inicio» también en el ordenador (Chrome/Edge) y el enlace **?instalar** (abre la hoja «Añadir»); fotos HEIC del iPhone sin datos ocultos; sin «Desconectado» arriba cuando no hay conversación; **«Tapar»** en «Revisa antes de enviar» (mosaico con el dedo o el ratón, `abreTapar`, pruebas `prueba_tapar.js`). Versiones: app.js 20261029h, app.css 20261029g, idioma.js 20261029p51 (main 15ed79a).

Pendiente, por orden:
1. «Ver una vez» (foto o archivo que se borra en los dos equipos al cerrarlo; hay que tocar el protocolo de archivos: bandera `unaVez`, visor a pantalla completa, control `visto-una-vez`).
2. La llamada que «se borra al descolgar» (Barranquilla–Cartagena): sin datos del dueño todavía.
3. Llamada en grupo (hasta 4, por código numérico) después del lanzamiento.
4. Textos legales en inglés y portugués (borradores en herramientas/legal-borradores/) con lo de Miami, la blindada sin comprobación obligatoria y la ubicación.
5. Cadenas nuevas en los otros 39 idiomas.
6. Privacidad: decir que «Ubicación» y las fotos sin metadatos existen (punto 5).

## 0. Lo primero que tienes que hacer

1. Clona y prepara (si no lo tienes ya):
   - `git clone https://github.com/guardianagroup/guardianagroup.com /home/claude/guardianagroup.com`, `git checkout web-idiomas`.
   - `ln -s /home/claude/guardianagroup.com /home/claude/web`.
   - `git -C /home/claude/guardianagroup.com worktree add /home/claude/wt-main main`. `herramientas/publica.sh` usa esas dos rutas.
2. Contesta al dueño en español, en pocas líneas y sin código.
3. Sigue con lo pendiente (punto 6), empezando por el pip y el tono con la página minimizada.

## 1. Reglas del dueño (siguen todas)

- **Idioma y tono.** Español siempre, pocas líneas, sin código en el chat. Avisa siempre al publicar.
- **Vocabulario.** «encriptado» mejor que «cifrado».
- **Palabras prohibidas.** Nada de «auditada», «certificada», «conformidad CNSA 2.0», «recuperación tras compromiso» ni «anónima». No digas que el audio de las llamadas es postcuántico.
- **Afirmaciones.** Solo las que se puedan comprobar. Sin cifras inventadas ni promesas absolutas. Las fuentes van en los datos o en terminos.html §6. Sin logos ni marcas reales en las maquetas.
- **Su nombre.** El nombre real del dueño no aparece nunca en público ni en el repositorio. Lo enseñan las consolas de Vultr y la cuenta de ChatGPT: no lo copies a ningún sitio.
- **Cuentas.** Nunca claves ni contraseñas: el dueño inicia sesión, acepta términos y paga. Nunca leas la contraseña root de Vultr. Nunca borres servidores ni datos tú.
- **Pide permiso antes de** aceptar términos, enviar formularios o abrir los 42 idiomas al público. Los 42 siguen cerrados: hoy solo español e inglés. El modo «en construcción» ya está quitado, con su permiso (13:54).
- **Colores.** Fondo #06080C, acento #9CC3E4, texto #F4F6F8, coral #E07A6C, ámbar #F0C77F, verde #5CC98A.
- **Alcance ampliado (14:17).** «Haz todo lo que sea necesario, pero que las llamadas sean todas buenas… donde sea». Después: «Lo dejo en tus manos».

## 2. Repositorio y publicación

- Se trabaja en la rama **web-idiomas**. GitHub Pages sirve **main**.
- Para publicar: commit en web-idiomas → `git push origin web-idiomas` → `bash herramientas/publica.sh <commit>`.
  - publica.sh copia a main solo los archivos de ese commit.
  - Antes comprueba que main tiene la versión anterior de cada uno.
  - Rechaza `instalar.html`, `en/*`, `pt/*`, `descargas/*` y `*i18n/nueva/*`: NUNCA copies eso a main.
- Git:
  - Nunca force-push ni amend.
  - Stash compartido: solo `git stash push -m <etiqueta>`; se aplica por SHA y se borra por etiqueta.
- Firma de cada commit:
  - `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  - `Claude-Session: <la URL de tu sesión>`
- **Cada cambio en main reinicia el motor y el relé** en los dos servidores en ≤15 min (`zero-actualiza`). El chat se reconecta solo y las llamadas siguen (van por coturn). Avísale.
- Agencia: las notas de las rondas (`herramientas/agencia-rondas/`) y `LANZAMIENTO.md` NO se publican en main. ronda72, 73 y 74 no están en main.
- **Textos de la interfaz:**
  - Mapa D en `orbita/static/idioma.js`, solo inglés y portugués.
  - Se añaden justo después de la línea ancla `    "Enviar": ["Send", "Enviar"],`.
  - Al cambiarlo, sube `idioma.js?v=` en 5 páginas: comunicaciones, comunicaciones/verificar, zero, orbita/index y multas. Ahora va por **p36**.
- **Huellas:** `python3 herramientas/huellas.py` después de tocar Comunicaciones (escribe `orbita/comunicaciones/huellas.txt`).
- **Versiones en `orbita/comunicaciones/index.html`:** app.css **o**, app.js **p**, llamada.js n, rele.js n, componentes.css m. Súbelas al tocar cada archivo.

### Publicado hoy (main)

| main | web-idiomas | Qué |
|---|---|---|
| 00a428b | 18f1605 | Web abierta. Fuera obras.js; portada y /nueva/ en es/en. |
| 5ecab61 | 1f111f7 | Comunicaciones como app de mensajería (detalle abajo). |
| 515ae7b | 27a2990 | Varias conversaciones y sesión blindada con aureola. |
| a349ef7 | ac3bde0 | Textos legales con el servidor de Miami (privacidad 4, 5 y 9; términos 6; cómo funciona). |
| 5c94c54 | b34d03b | Miami o Núremberg elegido con varias medidas (4 pings, el mejor). |

Sin publicar, a propósito: 492b17c y d78c8d3 (notas de la agencia, ronda 74) y 8306a1e (LANZAMIENTO.md).

## 3. Infraestructura (DNS en Porkbun; el dueño inicia sesión, TTL 600)

| Nombre | IP | Proveedor | Qué hace |
|---|---|---|---|
| motor.guardianagroup.com | 168.119.225.147 | Hetzner, Núremberg | Motor de ZERO, relé de Comunicaciones (`/com`), coturn. Región «Europa · Núremberg». |
| motor-am.guardianagroup.com | **144.202.36.32** | Vultr Miami | **Nuevo desde el 28 Oct a las 14:38.** Ver abajo. |
| rele-am.guardianagroup.com | 207.246.115.38 | Vultr Miami (viejo, 1 GB) | Solo el relé viejo de las páginas m/ y e/. No se ha tocado. |
| rele.guardianagroup.com | 5.75.173.240 | — | Ver TRASPASO-CHAT.md. |
| motor-hel.guardianagroup.com | 62.238.17.121 | Hetzner | Ver TRASPASO-CHAT.md. |

Raíz y www: 185.199.108–111.153 (GitHub Pages).

**El servidor nuevo de Miami:**
- Vultr vc2-2c-4gb (2 vCPU, 4 GB), 20 USD/mes, sin copias automáticas, Ubuntu 24.04.
- Instalado con `zero-motor/cloud-init-am.yaml`, que ejecuta `instalar.sh motor-am.guardianagroup.com 'América · Miami'`. Caddy pone el TLS solo.
- Comprobado a las 14:5x: `https://motor-am.guardianagroup.com/salud` → ok, `"region":"América · Miami"`, `tope 5`, `llamadas: true`, `coturn activo`.
- El motor de ZERO está ahí. La página de ZERO elige el motor que responde antes, así que desde América las webs ven una IP de Estados Unidos.

**coturn:**
- Puerto 3478 UDP y TCP; relé en 49160–49999/udp. Credenciales firmadas con TURN_SECRETO (distinto en cada servidor), de 12 h.
- Sin registros. Solo deniega redes privadas, así que Miami↔Núremberg funciona.
- Prueba en vivo desde el equipo del dueño (Barranquilla), con `iceTransportPolicy: relay`: los dos servidores dan candidato relay (144.202.36.32 y 168.119.225.147).
- Latencia por WebSocket: Miami 46–53 ms, Núremberg 148–176 ms. Una medida suelta llegó a dar 156 ms a Miami: por eso ahora se toman 4.

## 4. Cómo funciona Comunicaciones (lo que hay que saber para tocarla)

Archivos en `orbita/comunicaciones/`: `index.html`, `app.js` (la app), `app.css`, `componentes.css`, `llamada.js` (llamadas), `rele.js` (cliente del relé), `viaje*.js` (recorrido de archivos), `verificar/` (comprobantes).

**Relé (`rele.js`):**
- `MOTORES = ['wss://motor.guardianagroup.com', 'wss://motor-am.guardianagroup.com']`. El chat va SIEMPRE por MOTORES[0], Núremberg.
- Protocolo: el cliente manda `{t:'hola'}` y recibe `{t:'hola', region, llamadas, ice, caduca}`; `{t:'ping'}` → `{t:'pong'}`.
- `LOCAL` = página en 127.0.0.1 o localhost. `PROPIO` = servida fuera de guardianagroup.com.
- `latenciaMin` = la mejor de las últimas 6 medidas.
- `iceDe(base, espera)` abre una conexión corta a otro servidor: 4 pings y el mejor; devuelve `{ice, caduca, region, ms}` o null.

**Servidor de llamadas más cercano (`app.js`):**
- `eligeServidorLlamadas()` se lanza a los 4 s de abrir y cada hora; si falla, otra vez a los 3 min.
- `iceCercano()` usa Miami si `iceAm.ms + 25 < latenciaMin` del principal y sus credenciales no caducan en 2 min. Si no, Núremberg.
- Cada persona elige el suyo y los dos servidores se pasan la llamada.
- `servidorLlamada()` lo dice en VIGILANCIA («Tu llamada pasa por el servidor de llamadas de Miami (Estados Unidos).») y al tocar «Conexión» durante la llamada.
- Las llamadas van siempre por relay (`iceTransportPolicy 'relay'`); en LOCAL sin TURN, 'all'.

**Varias conversaciones (`app.js`):**
- `CONVS`, `ACTUAL`, `MAX_CONVS = 8`. Funciones: `nombreConv`, `estadoLista`, `pintaLista` (#lista-filas `.fila-conv`), `abreConv` (borradores), `nuevaConversacion`, `limpiaInvitaciones`, `caben`, `avisoConv` (aviso que se toca), `hojaNombre`/`guardaAlias` (alias local).
- En el móvil, `body.ver-lista` y `#cvolver`.

**Llamadas:**
- Una a la vez: `LLAMADA_CONV`, y `convLl()` = `CONVS.get(LLAMADA_CONV || ACTUAL)`.
- Una oferta desde otra conversación con una llamada en curso → acto `ocupado` («Comunicando» a quien llama).
- Al contestar se abre esa conversación.
- `anotaLlamada` pone el resumen en el chat al lado de quien llamó: saliente/entrante con duración, perdida en coral, rechazada, cancelada, sin respuesta, comunicando, interrumpida, y «Volver a llamar».

**Leído y escribiendo:**
- Tics: `pintaEstado` con las clases gc-pendiente, gc-leido (verde) y gc-fallo.
- «Leído» solo si el mensaje se ve de verdad: `seVeElChat`, `enPantalla`, `marcaLeidos`.
- Privacidad recíproca: localStorage `gcom-leido` y `gcom-escribe`.
- «Escribiendo…» y «Grabando audio…» con tres puntos: `avisaEscribe` y `muestraEscribe`.

**Con la página minimizada (`app.js`):**
- `fuera()`, `pintaTitulo` (el título parpadea con 💬/📞, y `setAppBadge`), `iconoConPunto` (favicon con punto coral).
- `avisaFuera(c, que, video)`: aviso del sistema sin el contenido, tag `gcom-nuevo`. `avisaLlamada`: aviso que se queda hasta contestar, tag `gcom-llamada`.
- `pintaAvisos` enseña la tira #cavisos para pedir el permiso (solo en el ordenador).
- `avisosSistema()` excluye Android, iPhone y iPad.

**Sesión blindada:**
- Clase `.conv.blindada`. La aureola está al final de `app.css`: `@property --gc-ang`, `.lienzo::before` con máscara de bordes (luz con steps(210) en 7 s) y `::after` con el reflejo (transform, cada 9 s); sin movimiento si el sistema pide reducirlo.
- `.conv.sellada` es el aura estática que tienen todas las conversaciones cuando la otra persona está y la clave está confirmada.

**Móvil y tableta (publicado):**
- Cabecera en una fila con «⋯» (#cmas/#cmenu: nombre, seguridad, modo discreto, terminar). Sin franja repetida ni «Multas» dentro de la conversación.
- Campo a 16 px, para que el iPhone no haga zoom.
- Tocar el nombre abre la seguridad.
- Wake Lock en llamadas.
- Aviso dentro de Instagram, Facebook o TikTok (`avisoInterno`).
- Tableta sin VIGILANCIA fija (`pointer:coarse` y ≤1400 px).
- «Atrás» en vez de «Regresar a NÚCLEO» (`orbita/static/nucleo.js`).

## 5. Pruebas

Las pruebas están en `herramientas/pruebas-com/` (Playwright; Chromium y Playwright ya instalados: no instales otro). Escriben capturas en `/tmp/pruebas-com/…`: crea antes `mkdir -p /tmp/pruebas-com/prueba-74`.

Antes de lanzarlas, arranca dos servidores:
- Relé de pruebas: `node zero-motor/pruebas/rele.js 8794`.
- Web: `python3 -m http.server 8802 --bind 127.0.0.1`, desde la raíz del repositorio.

Se lanzan con `node herramientas/pruebas-com/<prueba>.js`.

Resultado con lo publicado hoy, todo verde:

| Prueba | Comprobaciones |
|---|---|
| chat74 | 29 |
| movil74 | 32 |
| interno74 | 9 |
| varias74 | 27 |
| video | 18 |
| tonos | 9 |
| cliente_llamada | 15 |
| audio | 6 |
| com | 19 |
| blindada | 8 |
| verificar | 26 |
| receptor | 4 |

`prueba_icede.js` prueba los 4 pings. `foto_blindada.js` saca las fotos de la aureola.

Trucos de las pruebas:
- Mover el ratón antes de pulsar los botones de llamada.
- `#unir-ok` se pulsa con `{ timeout: 3000 }` y `.catch(() => {})`.
- localStorage `guardiana-acceso = dueno`.

## 6. Pendiente, por orden

0. **Hecho a las 15:10–15:14 y publicado** (main 2fc91d0, web-idiomas 41a9861): fuera la tira de la campanita (#cavisos siempre oculta, `pintaAvisos`; los avisos se activan desde «⋯» → `#cm-avisos`); cabecera de la conversación más grande en el ordenador (al final de app.css, `@media (min-width:761px)`). Versiones: app.css **o**, app.js **p**. Prueba chat74 actualizada (29 OK).
0b. **NUEVO (15:12) — videollamada partida por defecto.** El dueño probó el doble clic y le gusta la pantalla dividida mitad y mitad: «que saliera así por defecto, mitad-mitad. Y ya si uno la quiere minimizar, que haya como un botoncito muy profesional para hacerla más pequeña». En `llamada.js` (~líneas 576–680: clase `dividida`, `lado-izq/der/arriba/abajo`, doble clic en la línea ~669, tamaño recordado en el equipo): al empezar una videollamada, entrar en dividida; añadir un botón discreto (icono de reducir, con texto accesible «Hacer pequeña») que vuelva a la imagen flotante, y otro para volver a dividirla. Revisa también el móvil (arriba y abajo) y las pruebas video y tonos.
0d. **NUEVO (15:14) — el clip, con un menú en vez de abrir directamente los archivos.** El dueño pidió ideas «que se pueda dar privacidad… fotografías del PC… la ubicación… útiles para particulares y profesionales» y que se añada lo bueno. Propuesta ya contada al dueño (si quiere, ronda 75 de la agencia para afinarla):
   1. **Archivo** (lo de hoy), con la opción «Con comprobante de entrega», que ya existe.
   2. **Foto o vídeo**, enviados **sin los datos ocultos**: ubicación GPS, modelo del equipo y fecha. Las fotos se vuelven a dibujar en un canvas antes de encriptar; con los vídeos, decir que no se puede limpiar todo.
   3. **Cámara**: hacer la foto con la cámara del PC o del móvil dentro de la página (sin metadatos).
   4. **Tapar antes de enviar**: difuminar o pixelar caras, matrículas o datos de una foto. Se puede reutilizar lo de «Difuminada» y «Mosaico» de la videollamada.
   5. **Ver una vez**: la foto o el archivo se borra en los dos equipos al cerrarlo. Hay que decir que no impide una foto de la pantalla.
   6. **Ubicación**: enviarla una vez, precisa o aproximada (~1 km), solo al pulsar y con el permiso del navegador. Llega como coordenadas, con «Abrir en el mapa» (OpenStreetMap) solo si se toca: sin mapas de terceros cargados solos.
   7. Más adelante: escanear un documento a PDF con la cámara del móvil, y un contacto (vCard).
   El menú se abre al pulsar el clip (hoja abajo en el móvil, menú pequeño en el ordenador), con iconos sencillos, y cada envío pasa por la misma encriptación. Textos en inglés y portugués, y pruebas.
0c. **NUEVO (15:13) — botón «Borrar chat».** «Un botoncito que diga borrar el chat… a la derecha, al lado del micrófono… se borraría todo el chat sin poderlo recuperar de ninguna forma… Esa opción es muy importante». Propuesta: icono de papelera junto al micrófono (`#texto`/grabar), con confirmación («Se borran todos los mensajes y archivos de esta conversación, en los dos equipos. No se puede deshacer.»). Borra mensajes, archivos y recorridos guardados (IndexedDB encriptado) y manda un control nuevo (p. ej. `{tipo:'vaciar'}`) para que el otro equipo borre lo mismo; la conversación sigue abierta (a diferencia de «Terminar», que la cierra). En la blindada, igual. Prueba nueva y textos en inglés y portugués. Con el móvil, que quepa en la barra de abajo sin apretar.

1. **Pip y tono con la página minimizada** (dueño, 15:03): «que salga la notificación si le he escrito… un pequeño pip si le escribo un mensaje… y si le estoy llamando, que haga tono de llamada».
   - Hoy, en `app.js` (~línea 517): `if (!avisaFuera(c, 'mensaje') && !aLaVista) avisaSonido();`. Si sale el aviso del sistema, no suena el nuestro.
   - Cambio propuesto: que suene SIEMPRE nuestro pip cuando el mensaje no está a la vista, y poner `silent: true` en el `new Notification` de mensajes para que no suenen dos.
   - Comprueba que el timbre de la llamada entrante (llamada.js, tonos) suena con la pestaña oculta. El AudioContext tiene que estar desbloqueado por un gesto previo.
   - Dile al dueño la verdad sobre el móvil: con el navegador en segundo plano o la pantalla apagada, el teléfono para la página. No hay aviso, pip ni timbre hasta tener Web Push (ronda 73, «Aviso prioritario»).
   - En el ordenador (ventana minimizada u otra pestaña) sí funciona. Hace falta permiso de avisos, que se pide en la tira «Activar avisos».
2. **Contestar al dueño cómo va el móvil y la tableta** (15:03). Si no le ha llegado respuesta:
   - Hecho y publicado: lo del punto 4.
   - Falta: probarlo en un iPhone y un Android de verdad (hasta ahora, emulados); avisos en segundo plano en el móvil (Web Push); las cadenas nuevas en los otros 39 idiomas.
3. **La llamada que «se borra al descolgar»** (14:2x, el dueño en Barranquilla y su amigo en Cartagena, versión vieja). Pendiente de que el dueño diga equipo, navegador y mensaje. Puede ser de permisos o de un navegador dentro de una app. Con la versión nueva hay que volver a probar.
4. **Comprobar Miami en una llamada real.** Tras recargar, VIGILANCIA debe decir «…servidor de llamadas de Miami». Si no lo dice, mira `iceAm` y `latenciaMin`.
5. **Llamada en grupo** (hasta 4), después del lanzamiento. El dueño la quiere por **código numérico** (más fácil que QR), con la misma encriptación. Diseño en la ronda 73: malla por nuestro TURN, «Solicitar entrada», aceptar o rechazar y número de seguridad.
6. **Textos legales en inglés y portugués.** Los borradores están en `herramientas/legal-borradores/{en,pt}/`. Ni se publican ni se copian a en/ o pt/ sin permiso.
   - Les falta lo de Miami (como en ac3bde0).
   - Quedan dudas sobre metadatos, nombres en las atribuciones y criterios.
7. **Traducciones.** Las cadenas nuevas (resúmenes de llamada, escribiendo, avisos, menú, varias conversaciones, servidor de llamadas) están en inglés y portugués en idioma.js. Faltan los otros 39 idiomas (`orbita/static/i18n/*.json`), para cuando el dueño abra los 42.
8. El servidor viejo de Miami (rele-am, 207.246.115.38) sigue encendido para m/ y e/. Que decida el dueño.
9. Mejora apuntada: que `zero-actualiza` solo reinicie el motor si cambian archivos del motor (hoy reinicia con cualquier cambio en main).

## 7. Navegadores (sesiones del dueño)

**Chrome del dueño (Claude in Chrome):**
- Pestaña 490382360: su Comunicaciones en vivo. No tocar.
- Pestaña 490382386: consola de Hetzner.
- Pestaña 490382392: mía, ahora en ZERO `?motor=`. Ciérrala.
- Porkbun queda con la sesión iniciada en ese Chrome.

**Navegador integrado:**
- tab-2: ChatGPT (agencia: GPT-6 con esfuerzo High; chat `/c/6ae23eaf-…`).
- tab-3: Gemini (Argon «Alto»; límite de uso hasta las 4:47 p. m.).
- tab-4: playground de Cheaper Inference (GPT-6 Astra; DeepSeek V4 Pro se queda sin tokens razonando).
- tab-5: ZERO `?motor=`, usada para medir latencias.

**Escribir en la agencia:**
- ChatGPT: `.ProseMirror[contenteditable]` con `execCommand('insertText')` y el botón «Enviar».
- Gemini: `rich-textarea .ql-editor` y «Enviar mensaje».

La agencia trabaja por rondas en `herramientas/agencia-rondas/rondaNN/` (pregunta.md, una respuesta por modelo, notas.md). La próxima es la 75.
