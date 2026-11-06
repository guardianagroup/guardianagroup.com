# Traspaso · 6 nov 2026, 00:45 (Bogotá) · la 1.0.56 publicada; la 1.0.57 en pruebas

Para seguir mañana sin perder nada. Las reglas del dueño están en `TRASPASO.md` y `TRASPASO-5NOV.md`, y no cambian. Se
añaden estas, del 5 nov:
- El modo estricto cubre «tus programas de Windows», no WSL ni las máquinas virtuales: ningún texto promete más.
- Comunicaciones Ultra: «disponible con Plus» (los 7 días de prueba del programa cuentan como Plus).
- En el teléfono la web se lee y la aplicación no se usa («leer sí, usar no»). La aplicación móvil llegará en 2 o 3 semanas.
- Los despliegues a producción (`instaladores.yml`) los pulsa el dueño: se le deja el formulario relleno en su Chrome.

## Publicado el 5 nov
- **GUARDIANA 1.0.56** en la web: instaladores 42093745990, candidato 42087442121, main c99ef16d.
- **Web (main 602e5125):**
  - lo amontonado y la segunda tanda de la pantalla de la VPN;
  - ZERO entero en el teléfono;
  - el SEO de base (`herramientas/seo/`) y «leer sí, usar no»;
  - las portadas /en/ y /pt/ y el planeta en WebP;
  - Comunicaciones Ultra «con Plus».

## GUARDIANA 1.0.57 (repositorio guardianagroup/guardiana, rama `pc-1.0.57`, 8d23ba6)
- **Qué trae:**
  - lo amontonado del programa (`apinamientos-programa`, a1957ce);
  - el icono de la VPN junto al reloj (`bandeja-vpn-2`, 137e38b): punto verde, ámbar, rojo o gris. Un clic abre la VPN
    en ZERO. El menú sirve para conectar a la salida más rápida o desconectar. Al conectar o desconectar desde Órbita
    salen avisos de Windows.
- **Pruebas:** en 8d23ba6, ci 42168600677 bien y zero 42168600743 en curso al guardar. En 137e38b: ci bien, zero 166/0 e
  instalador 42/0.
- **Segunda voz del icono:** GO, a falta de la prueba a mano del dueño. Hay dos detalles menores, para antes del candidato:
  1. La ruta de `vpn apaga --menu` debe salir del servicio instalado (su ImagePath, con QueryServiceConfigW), no de la
     carpeta desde la que corre ZERO.
  2. Mientras el servicio arranca (START_PENDING), el icono dice «está parado». Debe decir que está arrancando.
- **Paradas del instalador en las pruebas:** no vienen del icono, porque también pasan en ramas sin él. Aun así, esta rama
  lleva 4 en 13 pasos, frente a 1 en 79 en las demás. Para separarlo, el bloque del icono de `prueba.js` debe ir después
  del instalador y dejar un registro con la hora. No bloquea.
- **Prueba a mano del dueño:** `herramientas/PRUEBA-1.0.57-ICONO-VPN.md` (21 pasos; en Windows 11 y, si hay, en 10).
- **Pasos siguientes:**
  1. Los dos detalles y su CI.
  2. `candidato.yml` y las fotos del instalador.
  3. La prueba a mano y el visto bueno del dueño.
  4. Publicar como la 1.0.56: el dueño pulsa «Run workflow» en `instaladores.yml`. Después, `publica_paginas.py` de la
     1.0.56 a la 1.0.57, `git rm` de los MSI de la 1.0.56, `?v=`, huellas y CSP.

## La web: pendiente
- **`vpn-web-3`** (creada desde main 602e5125, sin cambios aún). La pantalla de la VPN de Órbita debe decir lo mismo que el
  icono y el chip de ZERO:
  - título «Parada, con su bloqueo puesto» cuando está desconectada con el bloqueo puesto (`E.desconectar === true`);
  - la tarjeta en rojo (`data-bloqueo="1"`) cuando no hay respuesta, cuando reconecta y cuando está parada con el bloqueo;
  - abrir con `#vpn` aunque Órbita ya esté abierta (`hashchange`);
  - la clave nueva en `idioma.js` (en y pt);
  - subir el `?v=` de vpn.js, vpn.css e idioma.js, de acuerdo con `traduccion-ultra`.
- **`traduccion-ultra`** (a9397f40): los 156 textos de Ultra en los 39 idiomas restantes.
  - Segunda voz: GO con condiciones. El informe está en la rama, en `herramientas/traduccion-web/REVISION-ULTRA2.md`, con
    su propuesta para las 10 dudas de términos.
  - Antes de publicar:
    - corregir 8 frases en de, bg, fr y ro;
    - dar a «Blindada» y «Blindada y Ultra» en los 39 idiomas el mismo nombre que usan las frases (hoy caen al inglés,
      «Shielded»), y traducir en la misma subida las otras 24 claves de esa página;
    - usar un solo término de «comprobante» en ja, zh-tw, ko y th.
  - Después se funde con main, se pasan `portadas.py`, `csp-hashes.py`, `huellas.py` y `sitemap.py`, y se publica.
  - Fuera de la tanda: el lema de Comunicaciones sale en español en todos los idiomas, porque la clave de `idioma.js` es de
    una versión anterior del texto.
  - Al fundir, se quitan las claves viejas con «Nadie puede escribirte…» de `orbita/static/i18n/*.json`, que ya no se
    muestran porque el texto en español cambió.
- **Guardado sin publicar:** trabajos viejos que solo estaban en la copia de la sesión.
  - `guardado/escaner-radiografias`: el escáner y las Radiografías (29-31 oct), con las páginas de la 1.0.50, ya
    superadas.
  - `guardado/niveles`: la Blindada y Ultra por horas, superada por Ultra «con Plus».

## Decisiones del dueño
- pt: «criptografado» o «encriptado».
- El main del programa sigue en la 1.0.46 (ledger).
- El certificado de firma (Certum) y la pasarela de pagos. Con la pasarela llega la puerta de Plus en el relé.
- Search Console, Bing e IndexNow: los pasos están en `herramientas/seo/GUIA-DUENO.md`; quedan las decisiones 5 a 9 de
  `herramientas/seo/PLAN.md`.

## Más adelante
- Unas 605 claves de `idioma.js` sin los 39 idiomas, y los plurales de la Revisión en los otros 28 idiomas.
- El cortafuegos de Hyper-V para WSL2 y las máquinas virtuales, y la lentitud de la sección «arranque» de la Revisión del
  PC.
- El Antivirus Normal/Máximo, la actualización de los términos y la aplicación móvil.
