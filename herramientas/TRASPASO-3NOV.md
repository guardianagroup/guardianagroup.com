# Traspaso · 3 nov 2026, 02:00 (Bogotá) · el dueño para hasta mañana

Dónde está cada cosa, para seguir sin perder nada. Las reglas del dueño están en `TRASPASO.md`, y no cambian. Lo más importante:
- Español, pocas líneas, sin código en el chat.
- «encriptado» y no «cifrado».
- Nada de «auditada», «certificada», «conformidad CNSA 2.0» ni «anónima».
- Sin cifras inventadas ni promesas absolutas.
- Nunca nombres, correos ni claves del dueño.
- Él inicia sesión, acepta y paga.
- Capturas de cada cambio, avisar al publicar.
- Proponer antes de un cambio grande.
- Solo se publica lo que confirman dos voces.

## GUARDIANA para Windows (repositorio guardianagroup/guardiana)

### Rama `antivirus-vpn`: la 1.0.55 está lista para publicar
- **Versión:** subida en 0b906f6. Las pruebas pasan en c62c9f5 (ci y zero en verde).
- **Contenido:**
  - VPN con corte solo hacia su servidor, Modo Hogar e IPv6.
  - ZERO gratis tras la prueba, con las protecciones en la barra y el chip de VPN con «Desconectar».
  - Programa más ligero.
  - Antivirus con cortes que no se pierden (revisión: GO).
  - 31 idiomas.
  - «encriptado» en todo el español.
  - `GET /api/plan` abierto a la web (para Ultra).
- **Candidato:** ejecución 41590231341. Huellas SHA-256 de los MSI:
  - es: e0b3d6fbcd14d1c28dbc92aa2aef9578b749046218bdefc4a3eefdac7f96e7dc
  - en: 2fb45af8935d1ade1f414b6b17662212f2e3f3a260be6564438412819cf9a010
  - pt: 7159b0dcc9400344267b8fd719fca5164572205431ed05598cde5c3312ed8ec2
  - (la de es la confirma el registro de instalador.yml).
- **Pruebas del candidato:** la instalación por consola, incluida la actualización desde la 1.0.54 publicada, dio 0 fallos. Defender no protesta.
- **Fotos del instalador:**
  - La instalación nueva salió bien (ejecución 41592336616).
  - La actualización falló, por la prueba y no por el programa: el ZERO de la 1.0.54 se abrió encima del instalador.
  - Se arregló `build/cliente/fotos_instalador.ps1` (pone el instalador delante) y se repitió en la ejecución 41593255450. Mirar esas fotos antes de publicar. Se sacan con `herramientas/publicar/fotos_de_log.py <run> <carpeta>`.
- **Pasos que faltan para publicar:**
  1. Revisar las fotos de 41593255450 y mandárselas al dueño.
  2. En la web, `instaladores.yml` con version 1.0.55, ejecucion 41590231341 y las tres huellas.
  3. `herramientas/publicar/publica_paginas.py <web> 1.0.54 1.0.55 41536881703 41590231341 <es> <en> <pt> <bytes_es> <bytes_en> <bytes_pt>`. Los tamaños salen de los MSI descargados.
  4. `git rm` de los MSI de la 1.0.54.
  5. `herramientas/csp-hashes.py`, commit y push a main.
  6. Avisar al dueño de que, al acabar la prueba, la VPN pide Plus (él y su amigo pueden necesitar licencia).

### Rama `arreglos-1056` (cfc65dd, subida): las cuatro mejoras de la tercera revisión de los cortes del antivirus
- Retomar la sesión perdida sin perder cortes (5bd18bb).
- Comprobación cada minuto (3aee108).
- «Dejar pasar todo» olvida también lo que espera (2efc603).
- Olvidar las rutas que ya no están (c84e669).
- **Estado:** ci y vpn en verde; zero seguía corriendo.
- **Falta:** una revisión (segunda voz) y unirla para la 1.0.56.

### Rama `traduccion-wip` (4cf6d4e): las traducciones, paradas por el dueño (3 nov, 01:10: «los idiomas lo dejamos para el final»)
- **En `herramientas/traduccion/`:** trocea, comprueba y junta; el encargo; los trozos; y `cola.txt`, con todo lo pendiente.
- **Hecho:**
  - bengalí 14/21, tamil 11/21, telugu 8/21, tailandés 7/21.
  - Sin empezar: vietnamita, indonesio, malayo, filipino, suajili, islandés y chino de Taiwán.
- **Al retomar:** terminar esos idiomas, `junta.py <idioma> <repo>`, y la tanda delta (tarea 70 y `cola.txt`).
  - La tanda delta incluye las 25 claves nuevas de ZERO (barra_*, licencia_*, vpn_*) y la clave «ir».
  - También seis claves cuyo español cambió, y reescribir las notas borrado_nota_*.

## La web (repositorio guardianagroup/guardianagroup.com)
- **`main` (b32b08a):** publicado Comunicaciones con la Blindada (gratis) y Ultra (con Plus, «próximamente»), con los términos y la privacidad al 2 nov.
- **Rama `encriptado-web`:** cambia «cifrado» por «encriptado» en todo el español de la web.
  - Vuelve a enlazar las traducciones de los 39 idiomas.
  - En términos y privacidad, una línea en el historial y la fecha al 3 nov.
  - Estado: ver el final de este archivo.
- **Rama `ultra-1`:** Ultra 1, la versión de pago de Comunicaciones (ver `agencia-rondas/ronda93/decisiones.md`).
  - Se crea solo dentro del programa con Plus (la prueba cuenta); quien la recibe entra gratis desde cualquier navegador.
  - Es la «sesión blindada» interna (modo 'blindada', suite P-384, ML-KEM-1024, ML-DSA-87), encendida y puesta al día.
  - Estado: ver el final de este archivo.
- **Orden al publicar:** primero `encriptado-web`, después `ultra-1` (unir main y resolver los `?v=`), y después la tanda de traducción de la web.
  - La tanda de la web es la tarea 39: unos 475 textos faltan en los 39 idiomas y hoy salen en inglés. El encargo y el script que funde las traducciones están en `herramientas/traduccion-web/`.

## Ronda 93 con Gemini: Ultra
- Está en `agencia-rondas/ronda93/`: la pregunta, la respuesta de Gemini (4 Argon, razonamiento «Alto», resumida), la de Claude y las decisiones.
- La propuesta ya se le contó al dueño.

## Pendiente importante (lista de tareas de la sesión)
- **VPN:**
  - modo estricto (66);
  - pantalla de regiones con banderas (67);
  - instalar la VPN en Núremberg y Miami;
  - Tokio, cuando la pantalla de regiones esté lista (lo paga el dueño).
- **Antivirus:** niveles Normal y Máximo, esperando el visto bueno del dueño.
- **ZERO:**
  - micrófono en el propio PC;
  - Tor;
  - preguntas abiertas del agente: el chip sin la pestaña del panel, unificar los interruptores, «Inicio» descentrado.
- **PDFs y cartas en todos los idiomas (73):** letras fuera de Latin-1, y cartas en dos idiomas.
- **Plurales de cada idioma (72).**
- **Prueba «lienzo» de ZERO que falla a veces (74).**
- **PC del dueño:** diagnóstico (63).

## Estado de las ramas de la web al parar
- **`encriptado-web` (81bf500, subida, «a medias»):**
  - El cambio está hecho en e/, m/, nueva/, Comunicaciones, escaner.js, orbita.js y 17 páginas de empresas. Los hashes dicen «en forma de código (hash)» y «descifraron» pasó a «descodificaron».
  - Las claves están re-enlazadas en idioma.js, en los 39 i18n, en i18n/nueva y en orbita-fuente.
  - `?v=` está en 20261103-enc1. huellas.py y csp-hashes.py no dejan nada pendiente. Pasan las 5 pruebas de Comunicaciones.
  - Términos y privacidad no tenían «cifrado», así que no se tocaron.
  - Quedan 2 claves «…sin cifrar» porque las usa la extensión del navegador.
  - **Falta:** csp-comprueba en las páginas cambiadas, el recuento de «cifr…» que quedan, mirar las traducciones en inglés en el navegador, y las capturas. Después, publicar.
- **`ultra-1` (169f91f, subida, «a medias»), 3 commits:**
  - La voz cambiada de verdad: formantes, tono al azar y paso banda, medida en Node (5c0cd68).
  - Las 2.048 palabras de verificación, con una lista propia (329fdb5).
  - Lo demás en un commit «a medias» (169f91f):
    - la puerta por el programa con Plus;
    - solo en memoria;
    - las 4 palabras;
    - sin buzón;
    - bloques de 1 KB con latido;
    - cbr=1;
    - clave nueva cada minuto;
    - sin rebaja;
    - recibo negable;
    - mosaico con ruido;
    - nombres neutros;
    - pánico;
    - medidas del móvil.
  - **Hecho, según el agente (puntos 1–15 del encargo):**
    - solo en memoria (ML-DSA sellada y abierta solo para firmar; arrays a cero; se purgan las Ultras guardadas antiguas);
    - invitación solo por `#b=`;
    - 4 palabras con una lista propia de 2.048 (`palabras.js`), en el chat y en la llamada, con el número a un toque y la nota de la voz clonada;
    - sin buzón, dicho en pantalla;
    - bloques de 1 KB, latido cada 5 s y `cbr=1`/`usedtx=0`;
    - clave de la llamada cada minuto;
    - sin rebaja, con «Seguir en la Blindada»;
    - recibo negable y «Solicitar comprobante firmado»;
    - mosaico con ruido y sin «difuminada» (el fondo negro por silueta NO: sin aprendizaje automático no es fiable);
    - voz por formantes (LPC 32), tono al azar y paso banda (`pruebas/voz-ultra.js` en verde);
    - EXIF fuera y cada imagen recodificada, nombres neutros, aviso en PDF/Office;
    - velo y Esc dos veces o «Borrar y salir»;
    - en el móvil, tapar en segundo plano y claves borradas a los 15 s;
    - el nivel de cada lado;
    - los textos públicos;
    - la puerta `GET /api/plan`, con `?plan=plus` solo en local.
  - **Falta:**
    - las claves nuevas de idioma.js con su inglés y su portugués (no hay ninguna);
    - el `?v=` de las 6 páginas;
    - csp-comprueba;
    - ejecutar `ultra.js` (la prueba nueva, ya escrita);
    - adaptar y ejecutar tipos.js, blindado.js y codigo-grande.js, que esperan «próximamente», y ejecutar enviar-llamada.js, llevar.js y rota.js;
    - capturas de verdad a 1366 y 390 (solo hay las de humo en el scratchpad).
  - **Para el revisor:**
    - el SDP pone `cbr=1` solo en la primera línea de audio (la pista «muda» queda sin cbr);
    - las palabras de la llamada salen de `palabrasDe(sas.lazo)`;
    - el relleno es `rellena()` a múltiplos de 1 KB más 41+13+16 bytes de cabeceras;
    - `pidePlan()` va por los eventos guardiana-panel-pide y guardiana-panel.
  - **Después:** una revisión de la criptografía por una segunda voz, y enseñárselo al dueño antes de publicar.

---

# Actualización · 3 nov 2026, 09:50 (el dueño para otra vez: «Guarda aquí y seguimos más tarde»)

## Publicado esta mañana
- **1.0.55 publicada:**
  - instaladores en `descargas/1.0.55/` (6bd237f);
  - páginas de descarga actualizadas y MSI de la 1.0.54 quitados (9b7b279).
  - Fotos de la actualización 1.0.54 → 1.0.55 bien: se ve «Cerrando GUARDIANA ZERO para actualizarlo…» y no sale «Archivos en uso» (ejecución 41593255450, con el arreglo de `fotos_instalador.ps1` en 3c043b7).
- **«Encriptado» en toda la web** (cad14f7). No queda ningún «cifrado» visible y las traducciones están re-enlazadas.
- **Antivirus para la 1.0.56:** unido en `antivirus-vpn`, en 33e432b y 80f1342, con GO del revisor en cuatro rondas.
  - Queda una cosa baja: aplicar la regla de las 24 h también en la comprobación de cada minuto (tarea 78).

## Peticiones del dueño de esta mañana, y dónde quedan
1. **«Arregla la VPN para que se pueda utilizar… explícame cómo va a funcionar»** (08:49): ya se le explicó la VPN por países y continentes, en qué se distingue de las demás y lo que falta.
2. **El instalador sin «Finalizar»** (09:21), **con una pantalla de instalación bonita** (09:23): rama `candidato-auto`, en d6e656e (a medias, todavía no compila).
   - **Hecho**, solo en `build/wix/guardiana.wxs`:
     - GUARDIANA se abre sola al terminar: `LaunchPanel` después de `ExecuteAction`, con la condición `NOT Installed AND NOT REMOVE`.
     - La última pantalla no sale: la fila de ExitDialog se queda con una condición que nunca se cumple, porque quitarla rompe ICE20.
     - Página de «Instalando» con la marca.
   - **Falta:**
     - los textos en es/en/pt (también quitar «Pulsa «Finalizar»»);
     - `instalando.bmp` desde `imagenes.py`;
     - lo mismo en `zero.wxs`;
     - la regla de éxito nueva en `fotos_instalador.ps1`;
     - `instalador.yml`;
     - comprobar que una instalación silenciosa no abre nada.
   - El candidato 41657392922 se canceló (iba a fallar).
3. **La parte de arriba más fina, y la barra de Windows integrada** (09:24): sin código todavía. El diseño elegido:
   - se quita la barra de título nativa con WM_NCCALCSIZE, conservando los bordes para cambiar el tamaño;
   - el programa dibuja minimizar, maximizar y cerrar en una ventana hija con capas, arriba a la derecha, de 46 px cada botón, para que Windows 11 siga ofreciendo sus diseños de ventana;
   - una franja invisible arriba sirve para cambiar el tamaño;
   - las zonas vacías mueven la ventana con `app-region: drag` (IsNonClientRegionSupportEnabled);
   - la página avisa con `data-barra-titulo` y responde con una variable CSS; si no responde, ZERO pone su fila de 44 px;
   - la cabecera web, dentro del programa, mide 44 px fijos y deja 138 px libres a la derecha; la ✕ de la sección se esconde.
   - **Hoy:** la cabecera web mide 84 px (52 en Comunicaciones), más unos 32 px de la barra de Windows.
   - Las capturas de antes están en el scratchpad (`cabecera-fina/`). Las ramas vacías se borraron: se rehacen desde `antivirus-vpn` y `main`.
4. **La VPN con información de verdad: dónde estás, países y «lo que una web verá»** (09:25).
   - **Programa** (rama `vpn-estricto`, en 8ab3ed6, a medias, subida):
     - el modo estricto está escrito, pero CI todavía no lo ha compilado: bloqueo persistente y de arranque, salidas y reconexión sin soltar el bloqueo, `POST /api/vpn/estricto`, `guardiana vpn apaga | estado`, y la desinstalación quita el bloqueo;
     - **falta:** el JS de la barra de ZERO y sus textos, la prueba de la pasarela, el paso de desinstalación del WiX y la entrada del menú Inicio, los trabajos de `vpn.yml` (un servidor «agujero negro»), `docs/VPN.md` con la decisión sobre el Modo Hogar, y CI en verde;
     - **la API de salidas, sin empezar.** El contrato está más abajo. Ojo: la pasarela de ZERO siempre manda `{}` como cuerpo del POST, así que antes hay que cambiarla.
     - Para el revisor: si Windows rechaza los filtros de arranque en la subcapa propia, se usa la universal. Sin probar.
   - **Web** (rama `vpn-pantalla`): ver la línea de su agente al final de este archivo.
   - **Contrato de la API** (los dos lados lo usan tal cual):
     - `GET /api/vpn`, con los campos de hoy más:
       - `salida{id,pais,ciudad,continente,proveedor,nombre,ip}`;
       - `desde`, `saludo` (ms);
       - `subidos`, `bajados` (bytes);
       - `postcuantica`, `dns_tunel`, `estricto` (bool).
     - `GET /api/vpn/salidas` → `{salidas:[{id,pais,ciudad,continente,proveedor,nombre,disponible,ms}],mas_rapida}`.
       - Salidas: `hel` (vpn.guardianagroup.com, FI), `nbg` (vpn-nbg.guardianagroup.com, DE) y `mia` (vpn-mia.guardianagroup.com, US).
     - `POST /api/vpn/conecta`, con `{"salida":"hel"|"rapida"}`.
     - `GET /api/vpn/comprueba` → `{ip_vista,pais_ip,dns,ipv6,zona{equipo,salida,coincide},idioma,ubicacion_windows}`.
   - **Servidores:**
     - `zero-motor/instalar.sh` y `vpn.sh` ya admiten `VPN_NOMBRE`, pero Caddy tiene escrito a mano `vpn.guardianagroup.com`: hay que hacerlo por servidor.
     - Para Núremberg y Miami, el dueño pega una orden en la consola de cada servidor, y crea `vpn-nbg` y `vpn-mia` en Porkbun.
5. **Ultra** (rama `ultra-1`, en 79df286, subida y terminada):
   - Pruebas: ultra 55/55, tipos 22/22, blindado 31/31, codigo-grande 41/41, voz-ultra 14/14, enviar-llamada 57/57, llevar 35/35, rota 11/11, CSP 0/0.
   - 113 claves nuevas con su inglés y su portugués.
   - Las capturas se le enseñaron al dueño (`ultra1-resumen.jpg`).
   - **Falta antes de publicar:**
     - **(a)** Ultra no debe mandar el país sacado de la zona horaria. Ahora lo manda en el anuncio de cada archivo, en los avisos «listo» y «fin», en `viajeNuevo` y en los dos registros del recibo.
     - **(b)** No existe ningún campo para que la persona escriba su nombre (`guardaNombre` no se llama desde ningún sitio), así que Ultra no manda nombre. Que «Límites» lo diga así.
     - **(c)** Cambiar todo «suite CNSA 2.0» visible por los nombres de los algoritmos. Sale en la cabecera del chat, en los mensajes de vigilancia, en la fila «Suite» del recibo, y en la portada, los términos y «Cómo funciona» en es/en/pt.
       - La línea 2475 de `index.html` es un script en línea, así que su hash de CSP cambia.
       - En los términos va con una línea en el historial.
     - **(d)** La revisión independiente de la criptografía: ver al final.
     - **Revisión independiente de Ultra 1: NO-GO** (completa en `agencia-rondas/ronda93/revision-ultra1.md`). La criptografía es buena, pero dos frases de la pantalla no son verdad.
       1. **Las 4 palabras del chat se pueden forzar.** Salen del SHA-384 de las dos huellas: 44 bits, sin compromiso previo.
          - Quien tenga el enlace y controle el relé puede probar identidades hasta que coincidan, en un minuto de CPU.
          - Arreglo: compromiso y revelación al estilo ZRTP antes de sacar las palabras. Mientras tanto, mandar a la gente al número de 60 cifras.
          - Las palabras de la **llamada** sí están bien: ya tienen compromiso y revelación.
       2. **El relé ve cuándo se manda un mensaje de verdad.**
          - El marcador 0x11 de aviso distingue los mensajes de los latidos.
          - El latido va además de los mensajes, no en su lugar.
          - Arreglo: en Ultra, nunca 0x11, y ritmo constante de 1 trama de 1 KB por latido, sea de verdad o de relleno. Si no, quitar las frases sobre el ritmo.
       - **Should-fix:**
         - la llamada puede caer a solo DTLS (`pqAClaro`, modo «auto» del receptor);
         - una oferta sin `sas` deja la llamada sin palabras;
         - el secreto de la invitación queda en el historial global del navegador;
         - la puerta de Plus está solo en el cliente;
         - SVG, vídeo, audio y ZIP salen con sus metadatos;
         - el nivel de cada lado es el que dice cada uno;
         - el nombre se manda en cada presentación;
         - «CNSA 2.0» con P-384 (es de CNSA 1.0) y HKDF-SHA-256 en la llamada;
         - 23 pares de palabras se distinguen por una sola letra;
         - el pánico no funciona durante una llamada;
         - quedan «nadie puede» en `index.html`;
         - quien recibe firma el recibo sin poder negarse.
       - **Sin revisar todavía:** la voz (`voz-ultra.js`), el recibo firmado de `viaje.js`, la lectura discreta y la tapa en el PC.
   - **Web de la VPN** (rama `vpn-pantalla`, en b3394f4, a medias, subida): solo cambia `orbita/static/vpn.js`, reescrito.
     - Pasa `node --check`, pero nadie lo ha mirado todavía en un navegador.
     - **Tiene la lógica y los textos en español de todos los estados:** antes de conectar, conectada, «lo que una web verá», sin respuesta y fuera del programa. Lleva una demostración solo en local (`?demo=…`).
     - **Falta:**
       - los estilos (`vpn.css` sigue siendo el viejo);
       - pasar el cuerpo del POST como `cuerpo` en el `pide` de `escaner.js`;
       - las claves en `idioma.js` (no hay ninguna) y el `?v=` (`20261103-vpn1`);
       - huellas, csp-hashes, csp-comprueba y las capturas.
     - **Lo que tiene que hacer antes el programa** (rama `vpn-estricto`):
       - que la pasarela de ZERO pase el cuerpo (hoy manda siempre `{}`);
       - que deje pasar `salida.ip` e `ip_vista` (hoy tapa las direcciones);
       - añadir a su lista permitida `GET /api/vpn/salidas`, `GET /api/vpn/comprueba` y `POST /api/vpn/estricto`.
     - ZERO no niega hoy la geolocalización, así que la página no lo afirma.
