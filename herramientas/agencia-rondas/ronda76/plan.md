# Ronda 76 · Plan de implementación · GUARDIANA Comunicaciones a la altura de Apple

Dueño, 30 Oct 2026, 00:43: encargo completo (encargo.md); «los colores los dejo a tu elección y la app completa también»;
00:44: «mismo diseño para versión PC». Regla del encargo: antes de tocar código, analizar la arquitectura, identificar
los componentes reutilizables y presentar el plan; no romper lo que funciona.

## 1. Arquitectura actual (analizada)
- Una sola página: `index.html` (1.053 líneas). Siete pantallas en `<section>`: `inicio` (número, Llamar, Mis chats,
  ¿Cómo funciona?), `contactos` (Mis chats), `marcar` (teclado de Llamar), `como`, `porque`, `pro`, `conv` (el chat).
  Quince hojas inferiores `.gc-hoja`: escudo (seguridad y verificación), eliminar, nueva, completa, anadir, guia,
  instalada, ajustes, avisos, vaciar, num, nombre, cierre, envio, ubicacion. Las pantallas se alternan con clases en
  `#inicio` (`ver-contactos`, `ver-marcar`, `ver-como`) y `hidden`.
- Estilos: `componentes.css` (248, base del chat) + `app.css` (1.824; 88 bloques `@media`: 39 para ≤ 760 px, 7 para
  ≥ 761). 86 colores sueltos y 31 tamaños de letra: de ahí la sensación de «botonería».
- Lógica: `app.js` (4.165): estado `CONVS`, `pintaMensaje`, `tarjetaArchivo`, `reproductorVoz`, `burbujaLlamada`,
  `pintaLista`/`pintaContactos`, `pintaCabecera`, hojas (`abreHoja`/`cierraHoja`), grabación, archivos por trozos,
  reenvío, buzón cifrado, Número GUARDIANA. `llamada.js` (1.337), `rele.js`, `cripto.js`, `sw.js`.
- Pruebas automáticas: 33 guiones en `herramientas/pruebas-comunicaciones/` (dos teléfonos reales contra el relé de
  pruebas). Cada fase tiene que dejarlos en TODO BIEN antes de publicarse.

## 2. Componentes reutilizables
Se conservan y se restilan (no se reescriben): burbuja (`.gc-burbuja` + `.gc-meta` + `.gc-ticks`), tarjeta de archivo,
reproductor de voz, tarjeta de llamada, fila de chat, hoja inferior, botón grande, fila de ajuste, compositor, teclado,
cabeceras (`.barra-t`, `.contactos-cab`), avisos flotantes (`aviso()`).
Nuevos (un solo juego, para móvil y PC): fichas `--g-*`, botón de texto, lista agrupada, barra de pestañas, menú
contextual, cita de respuesta, onda de voz, columna lateral (PC), panel de información (PC).

## 3. Lo que no se toca
`cripto.js`, `rele.js`, `sw.js`, la lógica de `llamada.js`, el buzón cifrado, el Número GUARDIANA y las citas, los
archivos por trozos y el reenvío. Toda la seguridad y todo el transporte quedan como están.

## 4. Identidad visual (decidida: propuesta B · «Sello», elegida por el dueño a las 01:05 entre tres)
- Color (modo oscuro, sobrio): fondo #06080C · barra #0A0D12 · superficie #0C1118 · capa elevada #161C25 ·
  raya rgba(255,255,255,.09) · hilo rgba(156,195,228,.22) · texto #F4F6F8 · secundario #A3AEBA · terciario #6F7B88 ·
  acento #9CC3E4 (pulsado #84AFD6) · burbuja propia #1E3A58 · ajena #0F141B con hilo · leído = acento · en línea #5CC98A ·
  alerta #E07A6C. Veintiséis fichas en total; nada fuera de ellas. El acento es lo único que se toca; verde = en
  línea/verificado; rojo = error, borrar, colgar, perdida.
- Tipografía: IBM Plex Sans (servida desde el sitio), doce tamaños: 30/36 título, 17/22 nombres y botones, 17/23
  mensaje (15/21 en PC), 15/20 segunda línea, 13/16 citas y notas, 12/16 fecha, 11/13 hora. Plex Mono solo para cifras.
- Forma: rejilla de 4 px; margen 16; radios 10 (botones, campos, listas), 12 (burbujas, sin cola; 4 en las esquinas que
  se tocan dentro de un grupo), 20 (hojas); sin bordes de 1 px (rayas de 0,5); una sombra en toda la app (hojas); sin
  brillos de color; iconos de un solo juego, trazo 1,75 a 24 px. Lo que da carácter: el hilo fino en las burbujas
  ajenas, las esquinas moderadas y la quietud; nada de cola ni de colorines.
- Botones: uno relleno por pantalla; lo secundario, texto en acento sin caja; nada por debajo de 44 px al tacto.
- Las tres propuestas enseñadas (A · Tinta, B · Sello, C · Lámina) están en las capturas enviadas al dueño el 30 Oct a
  las 00:58; las fichas de A y C no se usan.

## 5. Navegación
Móvil: barra de pestañas abajo, **Chats · Llamar · Ajustes** (aprobada por el dueño, 00:34).
- Chats: título grande, buscador, lista a todo el ancho (avatar con inicial, nombre, última línea sin contenido, hora,
  contador), «+» para nuevo chat (número o invitación). Es el inicio.
- Llamar: Tu Número GUARDIANA (compartir), teclado, y debajo las llamadas recientes.
- Ajustes: lista agrupada (Notificaciones, Sonido, Vibración, Guía de instalación, Buscar actualizaciones, ¿Cómo
  funciona?, ¿Por qué?, Seguridad).
- Chat: cabecera con avatar e inicial, nombre y estado; burbujas agrupadas con cola; fecha fija arriba; mantener
  pulsado (Responder · Reenviar · Información · Borrar); deslizar para responder; compositor «+», campo, micrófono/enviar.
- Información del chat: una sola hoja (hoy repartida en «escudo» y «nombre»): nombre, número, número de seguridad,
  verificación, borrar.
PC (dueño, 00:44: «mismo diseño… que guarden sintonía PC y móvil»): una sola capa de estilos y un solo juego de
componentes para los dos; lo único que cambia es la disposición (columnas en el PC, pestañas en el móvil).
- ≥ 1.100 px: tres columnas — izquierda 320 px (pestañas como barra lateral + buscador + lista), centro el chat, derecha
  320 px (información y seguridad; se abre desde el nombre). 761–1.099 px: dos columnas (lista + chat; la información,
  como hoja). ≤ 760 px: una columna (móvil). Hover solo con ratón; Enter envía, Esc cierra, ⌘/Ctrl+K busca.

## 6. Lo que el encargo pide y hoy no existe → propuestas, no funciones
Grupos, reacciones, incorporar participantes a una llamada, gestión de dispositivos, historial de llamadas unificado,
buscador dentro de los mensajes. Se diseñan como propuestas y no se enseñan al cliente hasta que existan.

## 7. Fases (cada una: pruebas en TODO BIEN → captura → publicación)
1. HECHA (30 Oct). Fichas y capa visual (`diseno.css`, «Sello»): burbujas agrupadas sin cola, hora y ✓ dentro, ✓✓ en
   acento al leer, compositor sin círculos, botones sin borde, hojas y Ajustes como lista, lista de chats a todo el ancho.
   Sin cambios de lógica.
2. HECHA (30 Oct), salvo las columnas del PC. Pestañas Chats · Llamar · Ajustes; «Chats» con buscador y «+»; en Ajustes,
   «¿Cómo funciona?» y «¿Por qué?». El PC sigue con su lista a la izquierda y el chat al centro con las mismas fichas; la
   tercera columna (información) va con la fase 5.
3. HECHA (30 Oct). Chat: cabecera con avatar, menú al mantener pulsado, deslizar para responder, citas (campo cifrado `cita`), fecha
   fija, «↓ nuevos».
4. HECHA (30 Oct), salvo documentos. Notas de voz con onda real y 1× / 1,5× / 2×; fotos con hueco reservado, vista previa y visor; documentos.
5. Información del chat en una hoja; estados vacíos, de error y de conexión unificados.
6. Auditoría: capturas a 393, 430, 768, 1.100 y 1.440 px; 60 fps en un iPhone 13; contraste AA; teclado y accesibilidad.
