# GUARDIANA · Traspaso completo para el chat nuevo
28 Oct 2026, 16:50 (Bogotá) — EMPIEZA POR AQUÍ

Este archivo manda sobre todos los anteriores:
- Lo de esta tarde, con más detalle: `herramientas/TRASPASO-28OCT-TARDE.md`.
- Lo de días anteriores: `herramientas/TRASPASO-CHAT.md` y `herramientas/TRASPASO.md`.
- La lista de lanzamiento: `herramientas/LANZAMIENTO.md`.

La publicidad empieza el 29 Oct 2026.

---

## 0. Lo primero que tienes que hacer

1. **Clona y prepara** (si no lo tienes ya):
   - `git clone https://github.com/guardianagroup/guardianagroup.com /home/claude/guardianagroup.com`, `git checkout web-idiomas`.
   - `ln -s /home/claude/guardianagroup.com /home/claude/web`.
   - `git -C /home/claude/guardianagroup.com worktree add /home/claude/wt-main main`.
   - `herramientas/publica.sh` usa exactamente esas dos rutas: `/home/claude/web` y `/home/claude/wt-main`.
2. **Arranca los servidores de prueba** (se paran solos a las 2 h; si fallan todas las pruebas, arráncalos otra vez):
   - `node zero-motor/pruebas/rele.js 8794`, en segundo plano.
   - `python3 -m http.server 8802 --bind 127.0.0.1`, en segundo plano y desde la raíz del repositorio.
3. **Contesta al dueño** en español, en pocas líneas y sin código.

Estado al traspaso:
- Todo está publicado: main **530a028**, web-idiomas **28d62fc**.
- El árbol está limpio.
- No hay nada a medias. «Ver una vez» estaba por empezar: no se tocó código.

---

## 1. Reglas del dueño (siguen todas)

- **Cómo hablarle.** Español siempre, pocas líneas, sin código en el chat. Avisa cada vez que publiques y dile que recargue (Ctrl+F5; en el móvil, cerrar la pestaña y abrirla otra vez).
- **Vocabulario.** «encriptado» mejor que «cifrado».
  - Prohibido: «auditada», «certificada», «conformidad CNSA 2.0», «recuperación tras compromiso» y «anónima».
  - No digas que el audio de las llamadas es postcuántico.
  - Sin cifras inventadas ni promesas absolutas: por ejemplo, nada de «no queda nada»; mejor «se han borrado los datos… lo descargado fuera puede seguir».
- **Afirmaciones y maquetas.**
  - Solo afirmaciones que se puedan comprobar.
  - Las fuentes van en los datos o en terminos.html §6.
  - Sin logos ni marcas reales en las maquetas.
- **Su nombre real** no aparece nunca en público ni en el repositorio. Lo enseñan la consola de Vultr y la cuenta de ChatGPT del dueño: no lo copies.
- **Cuentas y contraseñas.**
  - Nunca toques claves ni contraseñas.
  - El dueño inicia sesión, acepta términos y paga.
  - No leas la contraseña root de Vultr.
  - No borres servidores ni datos de cuentas.
- **Pide permiso antes de:**
  - aceptar términos;
  - enviar formularios;
  - abrir los 42 idiomas al público (hoy solo español e inglés).
- **«En construcción»:** ya está quitado, con su permiso (13:54).
- **Colores:** fondo #06080C, acento #9CC3E4, texto #F4F6F8, coral #E07A6C, ámbar #F0C77F, verde #5CC98A.
- **Alcance.** El dueño amplió a «haz todo lo que sea necesario para que las llamadas sean buenas» (14:17) y «lo dejo en tus manos». Pide «máxima calidad, profesional, simple como FaceTime o WhatsApp», sobre todo en el móvil.
- **Agencia.** Puede pedir que consultes a la agencia: ChatGPT, Gemini y GPT-6 Astra (punto 8).

---

## 2. Repositorio y publicación

- **Ramas.** Se trabaja en **web-idiomas**. GitHub Pages sirve **main**.
- **Publicar:**
  1. Commit en web-idiomas.
  2. `git push origin web-idiomas`.
  3. `bash herramientas/publica.sh <commit>`.
  - El script copia a main solo los archivos de ese commit.
  - Antes comprueba que main tiene la versión anterior de cada uno.
  - Rechaza `instalar.html`, `en/*`, `pt/*`, `descargas/*` y `*i18n/nueva/*`. Nunca copies eso a main.
  - Un archivo nuevo sale como «NUEVO: …».
- **Git.** Nunca force-push ni amend. Stash compartido: solo `git stash push -m <etiqueta>`; se aplica por SHA y se borra por etiqueta.
- **Firma de cada commit:**
  - `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  - `Claude-Session: <URL de tu sesión>`
- **Reinicio del motor.** Cada cambio en main reinicia el motor y el relé de los dos servidores en ≤15 min (`zero-actualiza`). El chat se reconecta solo y las llamadas siguen por coturn. Conviene avisar. Mejora pendiente: reiniciar solo si cambian archivos del motor.
- **No se publican en main:** `herramientas/agencia-rondas/`, `LANZAMIENTO.md` ni estos traspasos.
- **Textos de la interfaz.**
  - Están en el mapa D de `orbita/static/idioma.js` y solo hay inglés y portugués.
  - Las entradas nuevas se ponen justo después de la línea ancla `    "Enviar": ["Send", "Enviar"],`.
  - Al cambiarlo, sube `idioma.js?v=` en 5 páginas: orbita/comunicaciones/index.html, orbita/comunicaciones/verificar/index.html, orbita/zero/index.html, orbita/index.html y orbita/multas/index.html. Ahora va por **20261029p52**.
- **Huellas.** Ejecuta `python3 herramientas/huellas.py` después de tocar Comunicaciones; escribe `orbita/comunicaciones/huellas.txt`.
- **Versiones en `orbita/comunicaciones/index.html`:**

  | Archivo | Versión |
  |---|---|
  | app.js | 20261029j |
  | app.css | 20261029h (verificar/index.html carga `../app.css` con la misma versión) |
  | llamada.js | 20261029t |
  | rele.js | 20261028o |
  | componentes.css | 20261028m |

  Súbelas al tocar cada archivo.
- **Portada (`index.html` de la raíz).** Usa `/guardiana.css?v=20261028a` y lleva su propio diccionario `I` (es/en/pt) dentro del archivo.

---

## 3. Infraestructura

DNS en Porkbun: el dueño inicia sesión; TTL 600.

| Nombre | IP | Dónde | Qué hace |
|---|---|---|---|
| motor.guardianagroup.com | 168.119.225.147 | Hetzner, Núremberg | Motor de ZERO, relé de Comunicaciones (`/com`) y coturn. «Europa · Núremberg». |
| motor-am.guardianagroup.com | 144.202.36.32 | **Vultr Miami, nuevo** | Desde el 28 Oct, 14:38. Ver abajo. |
| rele-am.guardianagroup.com | 207.246.115.38 | Vultr Miami, viejo (1 GB) | Solo el relé de las páginas m/ y e/. Sin tocar; que decida el dueño si se apaga. |
| rele.guardianagroup.com | 5.75.173.240 | — | Ver traspasos anteriores. |
| motor-hel.guardianagroup.com | 62.238.17.121 | Hetzner | Ver traspasos anteriores. |

Raíz y www: 185.199.108–111.153 (GitHub Pages).

**El servidor nuevo de Miami (motor-am):**
- Vultr vc2-2c-4gb, 20 USD/mes, sin copias automáticas, Ubuntu 24.04.
- Instalado con `zero-motor/cloud-init-am.yaml`, que ejecuta `instalar.sh motor-am.guardianagroup.com 'América · Miami'`. Caddy pone el TLS solo.
- `/salud`: ok, «América · Miami», tope 5, llamadas, coturn activo.

**coturn:**
- 3478 UDP y TCP; relé en 49160–49999/udp.
- Credenciales de 12 h con TURN_SECRETO, distinto en cada servidor.
- Sin registros. Solo deniega redes privadas, así que Miami y Núremberg se pasan la llamada.

**Medido desde el equipo del dueño (Barranquilla):**
- Miami: 46–53 ms. Núremberg: 148–176 ms.
- Los dos dan candidato relay.

---

## 4. Lo que hay hoy en la web (todo publicado)

### Portada y web
- Abierta al público, en español e inglés.
- «Entrar» en vez de «Entrar en NÚCLEO» en la portada, las guías y las radiografías.
- En la portada, «Entrar» se hunde al tocarlo y pasa a «Entrando…» con un giro. Además, `<script type="speculationrules">` prerenderiza /orbita/ al pasar por encima (Chrome y Edge).
- Toda la web sin seleccionar ni copiar texto: sin sombreado azul, sin la barra de escribir ni el menú de copiar del móvil. Solo los campos de escribir se seleccionan.
- Textos legales:
  - Privacidad 4, 5 y 9: los servidores de Núremberg (Hetzner) y Miami (Vultr, The Constant Company, LLC).
  - Términos 6: el servidor de llamadas más cercano; la sesión blindada ya no espera a la comprobación del número.
  - Cómo funciona: también.

### Comunicaciones (`orbita/comunicaciones/`)

**Conversación:**
- Tics de leído en verde, «escribiendo…» con tres puntos y «grabando audio…».
- Cada llamada aparece en el chat al lado de quien llamó (saliente, entrante, perdida, rechazada, comunicando…), con «Volver a llamar».
- Leído y escribiendo son recíprocos: si no los das, no los ves.

**Con la página minimizada:**
- El título parpadea y sale un punto en el icono.
- Aviso del sistema sin el contenido, en silencio, más nuestro **pip** (dos notas).
- La llamada entrante suena con nuestro timbre.
- Los avisos se activan desde «⋯» (ya no hay tira con campanita).

**Llamadas:**
- Cada persona usa el servidor más cercano, Miami o Núremberg. Se mide con 4 pings y gana la mejor medida (`iceDe`, `latenciaMin`, `iceCercano`).
- VIGILANCIA dice «Tu llamada pasa por el servidor de llamadas de …», y lo mismo sale al tocar «Conexión: excelente».
- Calidad:
  - Hasta 1080p a 30 imágenes por segundo, hasta 6 Mb/s.
  - H.264 por hardware en el móvil y VP9 en el ordenador.
  - La imagen arranca a 1,5 Mb/s (x-google-start-bitrate).
  - Opus 48 kHz hasta 96 kb/s, con corrección de errores, cancelación de eco, supresión de ruido y aislamiento de voz.
  - Wake Lock.

**Videollamada:**
- **Ordenador:** pantalla partida mitad y mitad por defecto, con un botón redondo para hacerla pequeña o volver a partirla (`partidaPorDefecto`, `#ll-tam`). La tarjeta «Voz e imagen» va en la otra mitad.
- **Teléfono:** como FaceTime. La otra persona en grande y tú en pequeño. Vertical fija donde el sistema deja (Android a pantalla completa o como app). Al recibir, solo quién llama y «Rechazar» / «Contestar» (la voz y la imagen, en la píldora).
- «Voz e imagen» se cierra con «‹ Atrás», con el mismo botón o tocando la imagen.

**Sesión blindada:**
- Algoritmos de la suite CNSA 2.0 y marco de cristal con una luz blanca que recorre el borde.
- **Sin números que comprobar.** El número de seguridad es opcional, en «⋯» → «Seguridad y verificación».

**Varias conversaciones (solo en el ordenador):**
- Lista, nombres propios, borradores y una llamada a la vez («Comunicando»).

**Móvil, lo mínimo:**
- **Inicio:** un solo botón, **«Crear y compartir invitación»**. Es la sesión blindada por enlace y abre el menú de compartir del teléfono en el mismo toque (semilla preparada: `semillaLista`). Debajo, «Añadir a la pantalla de inicio» y «Cómo funciona».
- **Al compartir:** pantalla de espera entera, «Esperando a que la otra persona abra el enlace…», con «Volver a compartir» y «Cancelar». La conversación se abre sola cuando entra. El relé se reconecta al volver de WhatsApp (`despierta` en rele.js).
- **Una sola conversación:** crear o aceptar otra borra la anterior en los dos equipos. Sin lista, sin «Tus conversaciones», sin «‹». Para salir, «⋯» → «Terminar».
- **Barra de abajo:** clip, campo y micrófono. El micrófono pasa a «Enviar» al escribir. La papelera está junto al micrófono solo con el campo vacío.
- Sin «Multas» en la barra. Con el teclado del iPhone, la página mide lo visible (visualViewport).

**Quien recibe el enlace:**
- Ve «Te han invitado a una conversación encriptada. ¿Aceptas?», con «Aceptar» arriba y «No, gracias» debajo, sin la barra de la web.
- Hasta que la otra persona se conecta, «Conectando con la otra persona…» y sin campo de escribir.
- **Modo invitado** (pestaña marcada con sessionStorage `gcom-invitado`):
  - No hay barra de la web.
  - Al terminar, solo «Conversación terminada», también al recargar (`gcom-fin`).
  - Si no le quedan conversaciones, se borran su identidad y sus ajustes `gcom-*`.

**«Borrar el chat»:**
- Borra todo aquí y en el otro equipo, y la conversación sigue abierta.
- Si el otro no está conectado, la orden sale al conectarse (`vaciarPendiente` y `mandaVaciar`).

**«Terminar»:** borra la conversación en los dos equipos, igual que antes.

**El clip, con un menú:**
- **Foto o vídeo:** las fotos (también las HEIC) salen sin datos ocultos, redibujadas (`sinDatosOcultos`).
- **Cámara:** en el móvil.
- **Documento:** cualquier archivo.
- **Ubicación:** exacta o aproximada; llega como tarjeta con «Abrir en el mapa» de OpenStreetMap, que solo se abre al tocar.

**«Tapar»:** en «Revisa antes de enviar», cada foto lleva «Tapar». Se pasa con el dedo un mosaico por caras, matrículas o datos, y se envía ya tapada (`abreTapar`).

**Como app:**
- Manifiesto propio `comunicaciones.webmanifest`: pantalla completa, vertical, alcance /orbita/comunicaciones/.
- **Android:** pide pantalla completa sola al crear, aceptar, llamar o contestar.
- **iPhone:** no deja hacerlo desde una web. Lo explica «⋯» → «Pantalla completa».
- **«Añadir a la pantalla de inicio»:** en Android y en el ordenador, la ventana del sistema; en el iPhone, los pasos.
- **Enlace para mandar:** guardianagroup.com/orbita/comunicaciones/?instalar
- En el iPhone, lo de Chrome y lo del icono se guardan por separado.

**Otros:**
- Al salir de la página no queda la conversación en la copia del «Atrás».
- Sin «Desconectado» arriba si no hay conversación establecida.
- Aviso dentro de Instagram, Facebook y TikTok.

---

## 5. Mapa del código de Comunicaciones

### rele.js
- `MOTORES` (el chat siempre va por MOTORES[0], Núremberg).
- `crea()`: reconexión con espera creciente; `despierta()` al volver, al recuperar la red o con un ping sin respuesta.
- `latenciaMin` y `iceDe(base, espera)`.

### llamada.js
- `crea(o)`, `pinta()` y `giro()` (vertical fija).
- `miImagen` y `alternaDividida` (`partidaPorDefecto`, `pintaBotonTam`).
- `altaFidelidad` = `arranqueVideo` + `altaFidelidadAudio`.
- `topeVideo` y `topeAudio`.
- Opciones `o.servidor()` y `o.estado()`.

### app.js
- **Base:** `BD` (IndexedDB «guardiana-com»: yo, conv, msg, arch), `CONVS`, `ACTUAL`.
- **Crear, aceptar y borrar:**
  - `creaInvitacionB(semilla)`, `preguntaInvitacion` / `muestraAceptar` / `aceptaInvitacion` / `aceptaSemilla`.
  - `borraAnteriores`, `esMovil`.
  - `destruye` / `destruyeLocal` y `finInvitado`.
  - `vaciaLocal` / `vacia`.
- **Mostrar:** `abreConv`, `pintaEspera`, `pintaLista`, `pintaCabecera`, `muestraEnlace`.
- **Llamadas:** `LLAMADA_CONV` / `convLl`, `eligeServidorLlamadas` / `iceCercano` / `servidorLlamada`, `avisaLlamada`.
- **Avisos:** `avisaFuera` y `avisaSonido` (pip, desbloqueado con el primer gesto).
- **Teclado:** `tecladoMovil`.
- **App y pantalla completa:** `pantallaCompleta` / `comoApp` / `puedeCompleta`, `pintaAnadir`.
- **Enviar archivos y ubicación:**
  - `revisaEnvio` y `abreTapar`.
  - `sinDatosOcultos` y `mandaUbicacion`.
  - `enlaza` (enlaces y tarjeta de ubicación en `pintaMensaje`).
  - `enviaArchivos`, `tarjetaArchivo`, `recibeAnuncioArchivo`.
  - `MAX_MEMORIA` = 300 MB.

### index.html
- Pasos:
  - `#paso-inicio`, `#paso-codigo` (con `#codigo-enlace`), `#paso-enlace` (`#enlace-vista` / `#enlace-espera`), `#paso-aceptar`, `#paso-entrar`.
  - `#espera-otro` y `#fin-invitado`.
- Hojas: `h-nueva`, `h-vaciar`, `h-completa`, `h-instalar`, `h-ubicacion`, `h-envio`, `h-nombre`.
- Otros: `#adjuntos`, `#tapar` y el menú `#cmenu` (`cm-nombre`, `cm-seguridad`, `cm-discreto`, `cm-avisos`, `cm-completa`, `cm-terminar`).

---

## 6. Pruebas (`herramientas/pruebas-com/`)

Usan Playwright y Chromium, que ya están instalados: no instales otro.
- Escriben capturas en `/tmp/pruebas-com/prueba-74/`: crea la carpeta antes.
- En las del móvil se entra por enlace: `#codigo-enlace` o `#enlace-b`, y luego `#aceptar-si`. El móvil ya no tiene «Tengo un código».

Resultados de la última vez, todo verde:

| Prueba | Comprobaciones |
|---|---|
| chat74 | 29 |
| movil74 | 32 |
| interno74 | 9 |
| varias74 | 26 |
| video | 18 |
| tonos | 9 |
| cliente_llamada | 15 |
| audio | 6 |
| com | 19 |
| blindada | 8 |
| verificar | 26 |
| receptor | 4 |
| invitab | 15 |
| unasola | 6 |
| vaciar | 9 |
| partida | 6 |
| ajustes | 5 |
| clip | 5 |
| tapar | 5 |
| completa | 4 |
| instalar | 3 |
| pip | 4 |
| sincopia | 10 |
| entrar | 4 |
| icede (pings) | 3 |

Además:
- `recorrido_movil.js` saca una foto de cada paso en dos teléfonos («modo espectador»).
- `foto_blindada.js` saca las fotos de la aureola.
- Datos de prueba: `herramientas/pruebas-com/datos/` (una foto con datos ocultos y una en degradado).

---

## 7. Pendiente, por orden

1. **«Ver una vez»** (el dueño pidió ideas para el clip; es la que queda):
   - Una foto o un vídeo que se borra en los dos equipos al cerrarlo.
   - Plan:
     - casilla «Ver una vez» en `#h-envio`;
     - `enviaArchivos(c, fs, { unaVez })`;
     - `unaVez: 1` en la carga del anuncio (línea ~524);
     - el remitente no guarda la imagen en `arch`;
     - el receptor ve una tarjeta «Foto · ver una vez» → visor a pantalla completa → al cerrar, borra `arch` y marca `visto`;
     - control `una-vez-vista` para que el remitente marque «Abierta».
   - Hay que decir que no impide una captura de pantalla.
2. **La llamada que «se borra al descolgar»** (14:2x, Barranquilla–Cartagena, con la versión vieja). Falta que el dueño diga equipo, navegador y mensaje; con la versión nueva, hay que volver a probar.
3. **Comprobar en una llamada real** que VIGILANCIA dice «Miami» desde Colombia.
4. **Llamada en grupo** (hasta 4), después del lanzamiento. El dueño la quiere por **código numérico**, con la misma encriptación. Diseño en la ronda 73.
5. **Textos legales en inglés y portugués.** Los borradores están en `herramientas/legal-borradores/{en,pt}/`, sin publicar. Les falta: Miami, la blindada sin comprobación obligatoria, la ubicación y las fotos sin metadatos.
6. **Las cadenas nuevas en los otros 39 idiomas** (`orbita/static/i18n/*.json`), para cuando el dueño abra los 42.
7. **Decidir con el dueño:** cambiar «Voz e imagen» por «Efectos» (lo propuso la agencia), y si se apaga el servidor viejo de Miami (rele-am).
8. **Agencia, ronda 76 (si el dueño la pide):** una revisión del recorrido del móvil con las fotos de `recorrido_movil.js`.

---

## 8. Navegadores y agencia

**Chrome del dueño (Claude in Chrome):**
- Tiene su Comunicaciones en vivo: no la toques sin que te lo pida.
- Pestaña de trabajo: 490382402 (Comunicaciones publicada).
- Consola de Hetzner abierta.
- Porkbun, con la sesión iniciada.

**Navegador integrado:**
- tab-2: ChatGPT (agencia, GPT-6 con esfuerzo alto; chat «Revisar experiencia móvil», `/c/6ae23eaf-…`). Para escribir: `.ProseMirror[contenteditable]` con `execCommand('insertText')` y el botón «Enviar».
- tab-3: Gemini (Argon «Alto»; tuvo límite de uso hasta las 4:47 p. m.). Para escribir: `rich-textarea .ql-editor` y «Enviar mensaje».
- tab-4: playground de Cheaper Inference (GPT-6 Astra, máx. 4096 tokens). Para escribir, el textarea con el setter nativo y «Run again». En esa página se ve una clave de API: **no la copies**.
- tab-5: guardianagroup.com, para pruebas en vivo.

**Rondas de la agencia:**
- Van en `herramientas/agencia-rondas/rondaNN/` (pregunta.md, respuestas y notas.md).
- La 74 es la del móvil, el chat, los avisos y varias conversaciones.
- La 75 es el diseño del móvil; aplicado lo que el dueño no pidió distinto.
