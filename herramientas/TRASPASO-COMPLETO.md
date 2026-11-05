# GUARDIANA · traspaso completo para seguir desde otra cuenta (3 nov 2026, 13:45, Bogotá)

Este archivo basta para seguir el trabajo sin la conversación anterior. Si algo no está aquí, búscalo en `herramientas/TRASPASO-3NOV.md`, en `herramientas/agencia-rondas/` y en `docs/VPN.md` del programa. Esos archivos tienen más detalle.

## 1. Quién y cómo
- **El dueño:** GUARDIANA GROUP S.A.S. (Colombia; hora de Bogotá, UTC−5). Su nombre y su correo **no se escriben nunca**: ni en público, ni en el repositorio, ni en commits.
- **Con el dueño:** siempre en **español**, en pocas líneas y sin código en el chat. Una **captura** de cada cambio visible, y avisar cuando algo esté **publicado**. **Proponer antes** de un cambio grande. Él quiere «calidad máxima».
- **Modo agencia con Gemini:** para las decisiones grandes se pregunta a Gemini (en el navegador del PC del dueño, gemini.google.com, modelo **«4 Argon»** con razonamiento **«Alto»**, ya con su sesión iniciada). Claude escribe su propia opinión antes de leer la de Gemini y luego se decide.
  - Cada ronda se guarda en `herramientas/agencia-rondas/rondaNN/` con cuatro archivos: `pregunta.md`, `gemini.md`, `claude.md` y `decisiones.md`.
  - La página de Gemini enseña la cuenta de Google del dueño: **no copiarla nunca**.
- **Solo se publica lo que confirman dos voces:** quien hace el trabajo y un revisor independiente, que lee el código sin conocer las conclusiones.

### Reglas del dueño (obligatorias)
- «**encriptado**» y no «cifrado». Un hash es «en forma de código (hash)», no «encriptado».
- Nunca «auditada», «certificada», «conformidad CNSA 2.0» ni «anónima».
- Sin cifras inventadas y sin promesas absolutas: nada de «imposible», «nadie puede» ni «100 %».
- Solo afirmaciones que se puedan comprobar. Las fuentes van en los datos o en `terminos.html` §6.
- Sin logos ni marcas reales en las maquetas de prueba. Nunca usar submarinecablemap.com, TeleGeography ni PeeringDB.
- **Nunca claves ni contraseñas.** El dueño inicia sesión, acepta los términos y paga. No se leen contraseñas de root, ni se copian claves de API, 2FA o Porkbun.
- No borrar datos ni servidores de forma permanente. No hacer force-push ni amend.
- Nada de trucos para engañar a sistemas de detección de terceros: ni huellas falsas, ni IP residenciales.
- En su PC no se cambian ajustes del sistema de Windows: se le dan los pasos.

## 2. El producto y lo ya decidido
- **Un programa y una cuota (Plus):** GUARDIANA para Windows, que incluye panel, Antivirus («el escudo»), VPN, el navegador **ZERO** (Rust + WebView2), Comunicaciones y Órbita.
- **La web guardianagroup.com:** Órbita (adónde van tus datos: cables, centros de datos, satélites), Comunicaciones web, la sección VPN, el Antivirus y el escáner.
- **Prueba de 7 días con todo.**
  - **Después, gratis:** la Blindada (Comunicaciones), ZERO, Órbita con sus datos, el antivirus y el historial de 24 h.
  - **Con Plus:** la VPN, Ultra, el Modo Hogar, el historial completo, la Protección máxima, el informe semanal, las cartas y la Vigilancia.
- **Antivirus:** se recomendó dejarlo gratis, con dos niveles, Normal y Máximo; falta el visto bueno del dueño.
- **Licencia «De por vida»:** ya no se vende (términos, punto A4). Quien la compró la conserva.
- **Comunicaciones:**
  - **Blindada** (gratis, publicada): el código de seguridad no sale en pantalla.
  - **Ultra** (de pago, sin publicar): la invitación **solo se crea dentro del programa con Plus**, y quien la recibe entra gratis desde cualquier navegador.
- **VPN** (ronda 91):
  - Solo salidas reales, sin ubicaciones virtuales.
  - **Modo estricto** por defecto.
  - Países agrupados por continente, con bandera, «El más rápido» y «lo que una web verá».
  - Fase 1: Helsinki, Núremberg y Miami, y Tokio cuando la pantalla de países esté lista. Tokio lo paga el dueño en Vultr, unos 6 US$ al mes.
  - Antes de cobrar por la VPN, consultar a un abogado en Colombia.

## 3. Repositorios, ramas y estado al traspasar
**Programa: github.com/guardianagroup/guardiana** (público, GPL-3.0). Rama de trabajo: **`antivirus-vpn`** (cabeza 80f1342).
- La **1.0.55 está publicada** (candidato 41590231341). Cabeza: 1.0.55 más los arreglos del antivirus para la 1.0.56, revisados y unidos.
- **`vpn-estricto`** (e1ae8e4, a medias):
  - **Modo estricto escrito:** bloqueo persistente y de arranque; reconexión sin soltar el bloqueo; «Desconectar» en cualquier fase; `POST /api/vpn/estricto`; `guardiana vpn apaga | estado`; la desinstalación quita el bloqueo; «Apagar la VPN de GUARDIANA» en el menú Inicio.
  - **En verde:** el trabajo del adaptador en `vpn` (run 41693734899), con los filtros persistentes y de arranque y la prueba del «agujero negro».
  - **Pendientes de ver:** el trabajo «estricto» del servicio real y `ci`/`zero` de 0d2da9a/e1ae8e4. La prueba «lienzo» de ZERO falla a veces sin motivo.
  - **API de salidas** (escrita, sin CI): la tabla y la medición están en `crates/tunel/src/salidas.rs`, y hay un eco de IP en `GET /vpn/alta` del servidor. El eco solo funciona cuando Helsinki se vuelva a desplegar desde ese commit (la versión está fijada en `zero-motor/vpn.sh` de la web).
  - **Falta:**
    - los campos nuevos de `GET /api/vpn`, más `GET /api/vpn/salidas`, `GET /api/vpn/comprueba` y el cuerpo `{"salida":…}` en `conecta`;
    - que la pasarela de ZERO pase el cuerpo del POST (hoy manda `{}`) y no tape `salida.ip` ni `ip_vista`;
    - meterlas en `PANEL_LECTURAS` con sus pruebas;
    - el contrato en `docs/VPN.md`.
  - **Ojo:** el estado viene en el campo `fase`, no en `estado`.
- **`candidato-auto`** (07fec65, código completo, todavía sin probar en Windows):
  - **Qué hace:**
    - el instalador abre GUARDIANA solo al terminar y no enseña la última pantalla («Finalizar»);
    - lleva una página «Instalando GUARDIANA en tu PC» con la marca (`instalando.bmp`, pasos en es/en/pt);
    - lo mismo en el instalador de ZERO;
    - el guion de fotos y `instalador.yml` exigen que el instalador se cierre solo y se abra GUARDIANA;
    - las instalaciones silenciosas no abren nada.
  - **Ejecuciones en marcha al parar:** candidato 41694009197, zero 41694009357 y ci 41694009164.
  - **Siguiente paso:** con el candidato en verde, `gh workflow run instalador.yml --ref candidato-auto -f candidato=<id> -f zero=41694009357`, mirar las fotos y enseñárselas al dueño.
- **`bandeja-vpn`** (80f1342, sin código todavía): el icono de GUARDIANA junto al reloj y los avisos de Windows de la VPN (el dueño dijo «Hazlo claro»).
  - Va dentro del proceso que ya existe, `GUARDIANA ZERO.exe --avisos` (`zero/navegador/src/avisos.rs` y `crates/zero/src/avisos.rs`). Se autoriza como el CLI: la clave de `%ProgramData%\Guardiana\panel.token` va en `X-Guardiana-Token`, a 127.0.0.1:7443.
  - **Hay que añadir `Pedido::Vpn` (`guardiana://vpn`)**, como `guardiana://escaner`.
  - Órbita abre la VPN con `ORBITA#vpn`, pero `vpn.js` no escucha `hashchange`: hay que añadirlo.
  - **El icono:** verde si está conectada, gris si está apagada, ámbar mientras conecta y rojo si no responde. El texto al pasar el ratón lleva el país. Menú: Abrir la VPN, Conectar (el más rápido) o Desconectar, y Abrir GUARDIANA.
  - **Los avisos:** conectada, desconectada, «La VPN no responde: no sale nada hasta que vuelva o la apagues tú», y «ha vuelto». Sin repetir avisos ni avisar de lo que la persona acaba de pulsar.
- **`barra-titulo`:** ver §4.3.
- **`traduccion-wip`** (4cf6d4e): las traducciones a medias del programa (ver §4.6).

**Web: github.com/guardianagroup/guardianagroup.com** (GitHub Pages construye **solo `main`**). Cabeza de `main`: 22cdb7a.
- Publicado: la 1.0.55 y sus descargas, «encriptado» en toda la web, y Comunicaciones con la Blindada y Ultra «próximamente».
- **`vpn-pantalla`** (dcb1d6b, casi hecho): la sección VPN nueva (`vpn.js`, `vpn.css`) con todos los estados.
  - Estados: antes de conectar (países por continente, banderas, ms, «El más rápido», «Próximamente»), conectando, conectada (país, IP que ven las webs, tiempo, datos, encriptación, DNS, modo estricto, «Desconectar»), «lo que una web verá», sin respuesta, error y fuera del programa.
  - Lleva 95 claves con inglés y portugués, y `?v=20261103-vpn1`. El cuerpo del POST va como `cuerpo` en `escaner.js`.
  - Demostración solo en local: `?demo=…`.
  - **Falta:** `huellas.py`, `csp-hashes.py`, csp-comprueba `^orbita/`, la prueba de interacción (en el scratchpad de la sesión anterior; si no está, rehacerla) y las capturas.
- **`ultra-1`** (fc5ec37, a medias): Ultra 1. Ver §4.4.
- **`cabecera-fina`:** ver §4.3.
- **`vpn-servidores`:** ver §4.1.

## 4. Lo que falta, por orden de importancia

### 4.1 La VPN de verdad (1.0.56). Es lo que más importa al dueño.
1. **El programa** (`vpn-estricto`): terminar lo de §3 y dejar CI en verde.
2. **La web** (`vpn-pantalla`): las comprobaciones y las capturas. Se publica cuando el programa tenga la API.
3. **El icono y los avisos** (`bandeja-vpn`).
4. **Los servidores** (rama `vpn-servidores` de la web).
   - **Lo que hay que conseguir:** que `zero-motor/instalar.sh` y `vpn.sh` instalen la VPN con un nombre propio por servidor:
     - `vpn.guardianagroup.com` en Helsinki, `motor-hel`, sin cambios;
     - `vpn-nbg.guardianagroup.com` en Núremberg, `motor.guardianagroup.com`;
     - `vpn-mia.guardianagroup.com` en Miami, `motor-am.guardianagroup.com`.
   - Hoy Caddy tiene escrito a mano `vpn.guardianagroup.com`. El nombre debe quedar guardado en `/etc/guardiana/vpn/`.
   - **Prueba:** `.github/workflows/vpn-servidor.yml`.
   - **Para el dueño:** dos órdenes para pegar como root en la consola de cada servidor, y dos registros A en Porkbun. Van en `zero-motor/LEEME-VPN.md`. Nunca pedirle contraseñas.
   - Estado al traspasar: ver la última línea de este archivo.
5. **NUEVO (dueño, 13:32): «que pueda entrar en otras páginas web y no la bloqueen… que se pueda visitar todo con normalidad».** Sin trucos de evasión (ni IP residenciales, ni huellas falsas, ni IP que rota). El plan:
   - **Excepciones por web que elige la persona** (túnel dividido por dominio). Cuando ZERO detecte la página de bloqueo de una web, ofrece «Abrir esta web sin VPN». Más adelante, también por programa.
   - **Higiene de las IP:** topes contra el abuso (el puerto 25 ya está cerrado), geofeed RFC 8805 y DNS inverso.
   - **Salidas cercanas o del mismo país.**
   - **Que ZERO no parezca un robot** (tarea 44).
   - **Medir** con una lista de webs a través del túnel en CI.
   - **Antes, una ronda con Gemini.**
6. **Publicar la 1.0.56** siguiendo §5.

### 4.2 El instalador sin «Finalizar» y con pantalla bonita (`candidato-auto`)
Ver §3. Va en la 1.0.56.

### 4.3 La barra de arriba fina, con los botones de la ventana dentro (dueño, 09:24)
- **El diseño elegido:**
  - quitar la barra de título nativa de ZERO con WM_NCCALCSIZE, conservando los bordes para cambiar el tamaño;
  - minimizar, maximizar y cerrar dibujados por el programa en una ventana hija con capas, arriba a la derecha, de 46 px cada uno, para que se vean los diseños de Windows 11;
  - una franja invisible arriba para cambiar el tamaño;
  - las zonas vacías arrastran la ventana con `app-region: drag` (IsNonClientRegionSupportEnabled);
  - la página avisa con `data-barra-titulo`;
  - dentro del programa, la cabecera web mide 44 px y deja libres 138 px a la derecha.
- **Hoy:** la cabecera mide 84 px (52 en Comunicaciones), más unos 32 px de la barra de Windows.
- **Ramas:** `barra-titulo` (programa) y `cabecera-fina` (web). Estado: ver la última línea de este archivo.

### 4.4 Ultra (`ultra-1`). La revisión independiente dio NO-GO.
El informe está en `agencia-rondas/ronda93/revision-ultra1.md`.
- **Hecho en fc5ec37** (escrito, pero ninguna prueba se ha vuelto a pasar):
  - **(1)** Las palabras del chat con compromiso y revelación.
  - **(2)** Ritmo fijo: una trama de 1 KB por segundo y nunca el marcador 0x11.
  - **(3)** La llamada no cae a solo DTLS.
  - **(4)** Una oferta sin compromiso SAS cuelga.
  - **(5)** El aviso del historial del navegador.
  - **(7)** Los metadatos de SVG y MP3; los demás archivos piden «Enviarlo así».
  - **(8)** «según su programa».
  - **(9)** No se manda el nombre.
  - **El país no se manda nunca.**
  - **(11)** La lista de palabras rehecha.
  - **(12)** El pánico también en llamadas, y sin «nadie puede».
  - **(13)** Quien recibe elige «Firmar» o «No firmar».
- **Falta:**
  - **(10)** Quitar «CNSA» de todo lo visible y poner los nombres de los algoritmos. En los términos va con una línea en el historial. Decir exactamente HKDF-SHA-256 en la llamada.
  - **(6)** La puerta de Plus también en el servidor.
  - Los textos de pantalla del ritmo y de las palabras, que todavía no dicen lo que hace el código.
  - El inglés y el portugués de los textos nuevos.
  - El `?v=` de `viaje.js`.
  - **Las pruebas:**
    - adaptar `ultra.js` (parte 4: tamaños y latido; parte 7: pulsar «Enviarlo así» y «Firmar»);
    - adaptar `blindado.js` (parte 5: esperar a las palabras);
    - volver a pasar ultra, tipos, blindado, codigo-grande, voz-ultra, enviar-llamada, llevar (B_PC=1) y rota;
    - huellas, csp-hashes y csp-comprueba.
  - **Después:** una revisión independiente nueva, enseñárselo al dueño, unir `main` (resolviendo los `?v=`) y publicar.

### 4.5 Antivirus
- **Bajo:** la regla de las 24 h también en la comprobación de cada minuto (tarea 78).
- **Pendiente del visto bueno del dueño:** los niveles Normal y Máximo.

### 4.6 Idiomas (el dueño: «los idiomas lo dejamos para el final»)
- **Programa:** hay 31 idiomas dentro. Rama `traduccion-wip`, carpeta `herramientas/traduccion/` (trocea, comprueba, junta, el encargo y `cola.txt`).
  - A medias: bn 14/21, ta 11/21, te 8/21 y th 7/21.
  - Sin empezar: vi, id, ms, fil, sw, is y zh-tw.
  - Para unir cada idioma: `python3 junta.py <idioma> <repo del programa>`.
  - **Después, una tanda delta para todos:**
    - las 25 claves nuevas de ZERO (barra_*, licencia_*_gratis/_plus, vpn_*) y «ir»;
    - las claves de la 1.0.56;
    - seis textos cuyo español cambió;
    - reescribir las notas borrado_nota_*.
- **Web:** faltan unos 475 textos en los 39 idiomas, que hoy salen en inglés. El encargo y la fusión están en `herramientas/traduccion-web/`.

### 4.7 Más adelante (apuntado por el dueño)
- **VPN:**
  - (14) «Privacidad máxima»: doble salto entre continentes con dos empresas;
  - (15) ver qué programa intentó salir por fuera de la VPN, y cortar al momento la red de cualquier programa que el antivirus marque como peligroso;
  - Tokio;
  - el abogado.
- **Plurales de cada idioma** (72).
- **PDFs y cartas en todos los idiomas** (73): letras fuera de Latin-1, y cartas en dos idiomas.
- **La prueba «lienzo» que falla a veces** (74).
- **ZERO:**
  - micrófono en el propio PC;
  - Tor;
  - ventana flotante propia para las llamadas;
  - preguntas abiertas: el chip sin la pestaña del panel, unificar el aspecto de los interruptores, «Inicio» descentrado.
- **Antivirus:**
  - ransomware (45);
  - examen a fondo (46).
- **El sello** (firma del código de la web y del programa, tareas 21 y 22).
- **Textos legales** (10).
- **Diagnóstico del PC del dueño** (63).
- **Una pregunta pendiente para el dueño:** la página de descarga dice que lo gratis sigue «para siempre». ¿Lo cambiamos por algo más prudente?

## 5. Cómo se trabaja (técnico)
- **Compilar:** en la nube de la sesión anterior, `cargo` no podía bajar crates.io, así que **CI era el compilador**. Antes de subir, `rustfmt --check --edition 2021 <archivos>`.
- **Workflows del programa:**
  - `ci`: fmt, clippy -D warnings y pruebas en Linux, Windows y macOS;
  - `zero.yml`;
  - `vpn.yml`, con `de_verdad`, que solo se lanza a mano y se conecta de verdad a Helsinki;
  - `escudo.yml`, `ligero.yml`;
  - `candidato.yml`: los MSI; se lanza a mano o con un push a una rama `candidato-*`;
  - `instalador.yml`: las fotos, con la entrada `candidato=<run>`;
  - `repro.yml`.
  - **Fallos que vienen y van:** `tcp_works_too` en macOS (AddrInUse) y el «lienzo» de ZERO.
- **Publicar una versión:**
  1. Subir la versión en `Cargo.toml`, en las entradas `guardiana-*` de `Cargo.lock`, en `zero/navegador/Cargo.toml` y en su `Cargo.lock`.
  2. CI en verde.
  3. `candidato.yml`. Las huellas de los MSI salen como avisos; en orden: -en, -pt y luego el de es.
  4. `instalador.yml -f candidato=<run>`, con fotos desde cero y actualizando. Se sacan con `herramientas/publicar/fotos_de_log.py`.
  5. En la web, `instaladores.yml` (version, ejecucion, huella_es/en/pt).
  6. `herramientas/publicar/publica_paginas.py <web> <vieja> <nueva> <ejec_vieja> <ejec_nueva> <h_es> <h_en> <h_pt> <bytes_es> <bytes_en> <bytes_pt>`.
  7. `git rm` de los MSI viejos.
  8. `herramientas/csp-hashes.py` y csp-comprueba en las páginas de descarga.
  9. Push a `main` y capturas al dueño.
- **Comprobaciones de la web:**
  - subir el `?v=` de cada JS o CSS cambiado (`idioma.js` va en 6 páginas con el mismo valor);
  - `python3 herramientas/huellas.py`, luego `python3 herramientas/csp-hashes.py`, y que ninguno deje nada pendiente;
  - `node herramientas/csp-comprueba.js --servidor http://127.0.0.1:PUERTO --solo '<regex>'`, con 0 violaciones y 0 errores;
  - las pruebas de Comunicaciones están en `herramientas/pruebas-comunicaciones/` (README). El relé local es `node zero-motor/pruebas/rele.js 8794`.
- **Idiomas de la web:**
  - `orbita/static/idioma.js`, objeto `D`, guarda `{"texto español": [inglés, portugués]}`;
  - los otros 39 idiomas están en `orbita/static/i18n/<l>.json` (`t` y `p`), y lo que falta sale en inglés;
  - la portada usa `herramientas/idiomas.py`.
- **Servidores:**
  - Helsinki (Hetzner): VPN en `vpn.guardianagroup.com` (62.238.17.121), con Unbound en 10.66.0.1;
  - Núremberg (Hetzner) y Miami (Vultr): llevan los relés de las llamadas;
  - se instalan con `zero-motor/instalar.sh`, que pega el dueño como root;
  - el DNS está en Porkbun y lo gestiona el dueño.
- **El PC del dueño:** se enlaza desde la app de escritorio de Claude. El navegador integrado tiene Gemini abierto. Nunca escribir contraseñas.
- **Agentes:** a la vez, como mucho unos 8 (la cuenta anterior llegó a su límite de uso con unos 20). A los agentes a veces no se les deja subir su rama: entonces la sube la sesión principal.

## 6. Estado final de las dos ramas que faltaban (13:55)
- **`barra-titulo`** (programa, bfaaf18, subida, a medias; **no publicar tal cual**):
  - **Hecho:**
    - un módulo nuevo, `crates/zero/src/barra_titulo.rs`, con la banda de 44 px, los botones de 46 px, las zonas de clic (botones y borde de arriba) y el área sin la barra de Windows; dibuja minimizar, maximizar, restaurar y cerrar al estilo de Windows 11;
    - sus 13 pruebas pasan con rustc;
    - la fila de arriba pasa de 56 a 44 y la barra entera de 144 a 132;
    - la web y el panel dicen con `zg_titulo` si su fila es la barra de título; la página marca `data-barra-titulo` y lee `--zero-barra-titulo`.
  - **Falta:**
    - todo `app.rs`: la ventana sin marco, las ventanas con capas de los botones y del borde, `app-region` con ICoreWebView2Settings9 y el zoom fijo;
    - `barra.html` a 44 px (sigue a 56);
    - la fila del panel;
    - las pruebas de punta a punta y las fotos de CI.
  - `sesion.rs` todavía no se ha compilado.
- **`cabecera-fina`** (web, 22cdb7a): sin cambios. Las capturas de antes estaban en el scratchpad de la sesión anterior.
- **`vpn-servidores`** (web, 22cdb7a): sin código, solo el diseño.
  - **Cómo se elige el nombre:** el nombre de la VPN sale de `VPN_NOMBRE`; si no está, de `/etc/guardiana/vpn/nombre` (permisos 600, root); y si tampoco, `vpn.guardianagroup.com`.
  - **Qué hace `instalar.sh`:**
    - escribe esa carpeta y ese archivo;
    - pasa el nombre a `vpn.sh` y lo usa en `VPN_CADDY` y en el mapa de nginx;
    - Helsinki queda idéntico byte a byte;
    - para si el dominio no coincide con `/etc/guardiana/dominio` (por si alguien pega la orden en el servidor equivocado);
    - al final comprueba con `--no-alpn` que https://<nombre>/vpn/alta responde 422.
  - **Trampas de la prueba:**
    - el programa solo acepta servidores `*.guardianagroup.com`, y Caddy solo hace certificados locales para `.localhost`;
    - un `instalar.sh` recién puesto cae a Caddy solo en el 443;
    - el servicio usa `/usr/bin/node`, pero en el runner está en `/usr/local/bin`.
  - La prueba se lanza con `gh workflow run vpn-servidor.yml --ref vpn-servidores`.
  - **Las IP de los servidores** están en `zero-motor/vigilante.js`: Núremberg 168.119.225.147 y Miami 144.202.36.32.
  - **Las órdenes para el dueño solo funcionan cuando el cambio esté en `main`.** Antes de cada una, crear en Porkbun el registro A (`vpn-nbg` o `vpn-mia`) apuntando a esa IP. Como root, en la consola del servidor:
    - Núremberg: `curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | VPN_NOMBRE=vpn-nbg.guardianagroup.com bash -s -- motor.guardianagroup.com`
    - Miami: `curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | VPN_NOMBRE=vpn-mia.guardianagroup.com bash -s -- motor-am.guardianagroup.com`
