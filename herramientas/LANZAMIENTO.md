# GUARDIANA · Traspaso para el chat del lanzamiento (28 Oct 2026)

Copia en el repositorio del documento del proyecto de claude.ai `claude/LANZAMIENTO_29OCT2026.md`, para los chats que trabajan desde el repositorio clonado y no ven el proyecto.

**Encargo del dueño:** dejar la web lista y pulida para empezar la publicidad el 29 de octubre: idiomas, diseño, corrección de fallos, enlaces, ortografía profesional y entendible.

Este chat es **solo para la web que ve el visitante**. La infraestructura de servidores y relés no se toca aquí (quedó pendiente y está documentada aparte). Estado completo en el repositorio: `herramientas/TRASPASO-CHAT.md` (incluye el estado al 28 Oct, arriba del todo).

## Repositorio y publicación
- Repo `guardianagroup/guardianagroup.com`. Se trabaja en la rama `web-idiomas`; la web publicada (GitHub Pages) sale de `main`.
- Publicar: commit en `web-idiomas` → push → `bash herramientas/publica.sh <commit>` (copia a `main` solo los archivos de ese commit, comprueba que `main` tenía la versión anterior y rechaza rutas prohibidas). Nunca `force-push` ni `amend`.
- Esperar al despliegue: `gh run list -R guardianagroup/guardianagroup.com -L 1`. Hay una actualización automática de datos de Órbita que también publica en `main`.
- **Nunca copiar a `main`:** `instalar.html`, `en/`, `pt/`, `descargas/`, `i18n/nueva/*`.

## Estado de la web
- Toda la web está «en construcción»: `/obras.js` manda a `/obras.html` a quien no tiene la marca `guardiana-acceso = dueno`. Para el lanzamiento hay que quitarla con `herramientas/obras.py quita`. **Es decisión del dueño cuándo; preguntar antes.**
- Idiomas abiertos en las páginas de la aplicación: solo `es` y `en` (`ABIERTOS` en `orbita/static/idioma.js`). Las 42 traducciones existen; se abren todas con `data-idiomas="todos"` en `<html>`. **Preguntar al dueño si se abren para el lanzamiento.**
- La portada (`index.html`) tiene su propio sistema de idiomas: mapa `I` en línea para es/en/pt y `/i18n/portada/<l>.json`, que se regenera con `herramientas/idiomas.py`.
- Las páginas de la aplicación (Órbita, Comunicaciones, Multas…) usan `orbita/static/idioma.js`, con el mapa `D` para en/pt y `orbita/static/i18n/<l>.json` para los demás.

## La tarea del lanzamiento (QA profundo)
119 páginas HTML públicas; 61 son fichas de empresa con la misma plantilla (`empresas/`). Las principales: portada `index.html`, `orbita/`, `orbita/comunicaciones/` (+ `verificar/`), `orbita/zero/`, `orbita/multas/`, `como-funciona.html`, `comprar.html`, `contacto.html`, `terminos.html`, `privacidad.html`, `guias/`, `radiografias/`.
Revisar, con herramientas (Playwright sirviendo el sitio con `python3 -m http.server` desde la raíz):
1. **Enlaces:** que los internos resuelvan a un archivo y que los externos no estén rotos. Ya corregido un enlace muerto a `/estado` en `orbita/index.html`.
2. **Errores de página:** `pageerror`/consola en cada página principal.
3. **Idiomas:** que ninguna frase se quede en español en otro idioma; claves completas; derecha-a-izquierda correcto en ar, fa, he, ur.
4. **Diseño:** capturas en escritorio (1440) y móvil (390) de cada página principal; buscar desbordes y solapes.
5. **Ortografía y tono:** profesional y entendible; primero la frase clara y luego lo técnico; sin coloquialismos.
6. **Versiones:** que los `?v=` de los `<script>`/`<link>` sean coherentes y no quede ninguno apuntando a un archivo viejo.

**Aviso para la comprobación de idiomas (importante, evita un falso positivo):** las páginas de la aplicación solo activan `es` y `en` por defecto. Una comprobación de traducciones que cargue la página sin abrir el resto marcará **los 41 idiomas como «sin traducir»** aunque sí lo estén. Antes de medir, poner `data-idiomas="todos"` en el `<html>` (o forzarlo en el navegador de prueba con un MutationObserver). El 28 Oct una comprobación en segundo plano reportó, por esto, «41 idiomas con hallazgos» en ZERO y Multas: es ese falso positivo, no fallos reales. Rehacer abriendo todos los idiomas.

## Reglas del dueño que siguen
- **Forma:** español, pocas líneas y sin código en el chat; avisar al publicar.
- **Lenguaje:** profesional y entendible; nada coloquial. «encriptado» mejor que «cifrado».
- **Afirmaciones de seguridad:** solo las que confirmen dos voces de la agencia y se puedan comprobar; nada de «auditada», «certificada», «conformidad CNSA 2.0», «recuperación tras compromiso» ni «anónima»; no decir que el audio de las llamadas es postcuántico. Sin cifras inventadas ni promesas absolutas.
- **Contenido:** sin logos ni marcas reales en maquetas; fuentes en los datos o en `terminos.html` §6.
- **Privacidad del dueño:** su nombre real nunca aparece en público (ni en los documentos del repositorio).
- **Cuentas:** nunca claves ni contraseñas; el dueño inicia sesión, acepta términos y paga; pedir permiso antes de aceptar términos o enviar formularios.
- **Colores:** fondo #06080C, acento #9CC3E4, texto #F4F6F8; coral #E07A6C (cortes/alertas/multas); ámbar #F0C77F (dinero/avisos); verde #5CC98A («Permitido»).

## Publicado la noche del 27 al 28 y la mañana del 28
- Comunicaciones: sesión blindada, llamadas con cambio de voz y página de verificación, en los 42 idiomas.
- OWASP ASVS: inventario criptográfico y plan de migración (`herramientas/CRIPTOGRAFIA.md`) y las huellas SHA-256 del código servido (`orbita/comunicaciones/huellas.txt`, con `herramientas/huellas.py`).
- `herramientas/publica.sh` guardado en el repositorio.

## Apuntado para después del lanzamiento (28 Oct 2026, aprobado por el dueño)
- **«Blindar esta conversación».** Desde una conversación normal en la que los dos ya han comprobado el número de seguridad, un botón crea la sesión blindada y manda su enlace dentro de ese mismo chat encriptado, sin pasar por WhatsApp, correo ni otra app. Motivo: en la prueba de PC a PC del 28 Oct, mandar el enlace por fuera resultó incómodo. Toca la parte criptográfica, así que se diseña y se prueba con calma: hoy crear una invitación cierra la conversación abierta (una sola a la vez), y durante el paso tendrían que convivir las dos; la seguridad del enlace dependería de la conversación normal (P-256 y ML-KEM-768), y eso hay que decirlo en pantalla.

## 28 Oct 2026 (mañana y mediodía, pruebas en vivo Bogotá–Praga): hecho y publicado
- **Comprobante:** «Verificar en guardianagroup.com» abre con el comprobante ya comprobado (#c=, se borra de la dirección); veredicto grande arriba («Comprobante válido», sello verde/ámbar/coral) y «¿Tienes el archivo que se envió?» debajo, con nombre y tamaño; avisa si se elige el propio .json o el PDF, o un archivo de otro tamaño.
- **Videollamada:** tonos (425 Hz al llamar, timbre al recibir; contexto de audio desbloqueado con el primer gesto); tu imagen no se mueve al abrir «Voz e imagen», se arrastra, cambia de tamaño desde un asa y llega a pantalla dividida (doble clic); el chat de detrás queda bloqueado con la llamada en grande; botones con su color sobre cualquier imagen; en el ordenador no se dibuja en menos de 640 × 480 (con zoom alto se reduce entera); sonido a 48 kHz y Opus hasta 96 kb/s con FEC y prioridad sobre la imagen.
- **ZERO:** pide las webs en el idioma del navegador de la persona; el muro antirrobot sale en el centro con «Actualizar» (una recarga cuando la persona la pulsa).
- **Barrido:** 287 páginas sin enlaces internos rotos; 166 × 2 tamaños sin errores ni desbordes; español a la vista en inglés, limpio.

## Apuntado para después del lanzamiento (28 Oct 2026, agencia)
- **Antes y después de las subastas** (ronda 72): página «Comprueba tu exposición» (tu conexión frente a la de la burbuja, sin instalar nada), marcador opcional para ver las pujas de tu navegador en el ordenador, y un «Informe de exposición y protección» firmado y sin datos personales. La subasta propia de GUARDIANA, descartada.
- **Llamada urgente** (ronda 73): Web Push encriptado con permiso por contacto, horas de silencio y límites; móvil «timbre» vinculado con QR; no prometer que despierta a nadie; nombre «Aviso prioritario», nunca «emergencias».
- **Añadir a alguien a la llamada** (ronda 73): hasta 4 en malla por nuestro TURN, bajando la imagen al entrar más gente; enlace de un uso y 5 minutos, «Solicitar entrada», aceptar o rechazar con un código corto.
- **Extensión ZERO:** construida en local (v0.1.0) para probar pujas reales en el navegador de la persona; no publicada.

## Infraestructura (solo informe; no se toca desde la web)
- Cada publicación en `main` reinicia el motor y el relé en ≤15 min (`zero-actualiza.timer` reinicia `zero-motor` con cualquier cambio): corta ZERO y el chat un momento; las llamadas por coturn siguen. Conviene que solo reinicie si cambian archivos del motor.
- ZERO y Comunicaciones solo en Núremberg: las webs ven Alemania (idioma por IP); el servidor de Miami no tiene el motor.
- `herramientas/` es pública en el repositorio y lleva IP de servidores.
