# Traspaso · 6 nov 2026, 09:20 (Bogotá) · la 1.0.57 publicada

Para seguir sin perder nada. Las reglas del dueño están en `TRASPASO.md` y `TRASPASO-5NOV.md`, y no cambian. Se añaden
estas, del 5 nov:
- El modo estricto cubre «tus programas de Windows», no WSL ni las máquinas virtuales: ningún texto promete más.
- Comunicaciones Ultra: «disponible con Plus» (los 7 días de prueba del programa cuentan como Plus).
- En el teléfono la web se lee y la aplicación no se usa («leer sí, usar no»). La aplicación móvil llegará en 2 o 3 semanas.
- Los despliegues a producción (`instaladores.yml`) los pulsa el dueño: se le deja el formulario relleno en su Chrome
  (Claude in Chrome; el navegador de la app no tiene su sesión de GitHub). El último clic es siempre suyo.

## Publicado el 6 nov
- **GUARDIANA 1.0.57** en la web: instaladores 42231575905 (main d85c4f86), candidato 42226473864, rama `pc-1.0.57`
  0c75734.
  - Huellas SHA-256: es 2995d83a11b40d897d332ea0c6236498599f6bebef84aa7e89c897003eba2193, en
    71a45692a64ffddc6ec632cb6a8b0a54aa803d126384b9c82d06c4d833019835, pt
    53ea5dd3cfe409607b82590c4cde66730087f1248b86fa5dd031b747fdefe3d7. GUARDIANA ZERO.exe (dentro):
    734033ab87c131f5b5fcc722f1deebb87ff727fb6b4c15dbcd954e891d8ca594. Tamaños 65908736, 66002944 y 65908736 bytes.
  - Qué trae:
    - lo amontonado del programa;
    - el icono de la VPN junto al reloj, con su menú y los avisos de Windows;
    - «Apagar la VPN de GUARDIANA» lanza el guardiana.exe que Windows tiene apuntado para el servicio
      (QueryServiceConfigW), nunca uno deducido de la carpeta de ZERO;
    - «El servicio de GUARDIANA está parado» solo con SERVICE_STOPPED; mientras arranca o se para, «aún no contesta».
  - Comprobado:
    - ci 42226465156 y zero 42226465344;
    - candidato 42226473864, con sus cuatro trabajos;
    - fotos del instalador 42229145728: nueva, actualiza desde la 1.0.56 y el instalador de ZERO.
    - El workflow vpn no corre con estos cambios: su filtro de rutas no incluye crates/zero, zero/ ni docs.
  - Dos voces:
    - del icono, GO a falta de la prueba a mano;
    - sobre e86aa2b, GO con una condición (la ruta sin comillas), aplicada en 0c75734 y confirmada: GO sin condiciones.
- **Web (este commit):**
  - las páginas de descarga en la 1.0.57 (`publica_paginas.py`);
  - fuera los MSI de la 1.0.56 (queda su SHA256SUMS);
  - portadas /en/ y /pt/, CSP, huellas y sitemap regenerados.
- **Pantalla de la VPN (rama `vpn-web-3`, d9215e60):**
  - «Parada, con su bloqueo puesto»;
  - la tarjeta en rojo cuando no sale nada;
  - se abre con `#vpn` aunque Órbita ya esté abierta, encima de la portada, y no se cierra al volver a pulsar el icono.
  - Segunda voz: GO con condiciones, aplicadas con su propia versión probada.
- **Prueba a mano del dueño:** `herramientas/PRUEBA-1.0.57-ICONO-VPN.md`. Tiene 22 pasos; el 22, opcional, con el
  servicio parado.

## Ultra abierta y gratis en la web, por un tiempo (dueño, 6 nov, 09:32)
- Commit ec6713f6, `ULTRA_ABIERTA = true` en `orbita/comunicaciones/app.js`: cualquiera crea Ultra desde un navegador de
  PC, dentro o fuera del programa, para que el dueño la pruebe con un amigo. Revisión rápida: GO.
- Los letreros siguen diciendo «Con la suscripción Plus».
- Mientras esté abierta, `herramientas/pruebas-comunicaciones/ultra.js` (apartado 1) y `tipos.js` (apartado 0) fallan:
  comprueban que Ultra está cerrada.
- **Cerrarla cuando el dueño avise:** `git revert ec6713f6` deja los tres archivos como estaban. A mano: `false`, otro
  `?v=` de app.js y `huellas.py`.

## Pendiente
- **Publicadas las traducciones de Ultra (6 nov):** `traduccion-ultra` hasta c510be6a, fundida con main; idioma.js con
  `?v=20261106-trad3`. Segunda voz: GO con condiciones sobre 01eae9ae, aplicadas en c510be6a y confirmadas (GO sin
  condiciones). Lo que sigue es lo que se hizo en la rama:
- **`traduccion-ultra`** (01eae9ae y c510be6a): los arreglos de la segunda voz ya están aplicados.
  - Qué lleva:
    - 9 frases corregidas;
    - 31 claves en los 39 idiomas;
    - «comprobante» unificado en ja, zh-tw, ko y th;
    - fr «accusé de remise»;
    - las citas de «escribiendo…» y «leído» iguales a la etiqueta;
    - el coreano nuevo en 해요체;
    - el lema traducido;
    - fuera las claves «Nadie puede escribirte…».
  - Dudas:
    - tamil «கவச முறை» o el existente «கவசப் பயன்முறை»;
    - chino simplificado «插在中间» o «居中介入»;
    - quedan 9 cadenas japonesas con 証跡 o 配達証明 y 3 coreanas con 증빙;
    - el coreano de Verificar va en 합니다체;
    - «4 GB» se lee «GB 4» en árabe.
  - Fuera de la tanda: 75 textos de Comunicaciones que pone el JavaScript siguen en inglés en los 39 idiomas.
- **De la revisión de la pantalla de la VPN (no bloquea):**
  - con el bloqueo puesto, «Lo que una web verá» sigue diciendo «Ahora, sin VPN…»: hay que ocultarlo mientras dure;
  - el Antivirus tiene el mismo fallo al volver a pulsar su aviso (`#escaner`).
- **Del icono (no bloquea):**
  - llamar a `guardiana_exe()` solo cuando la entrada vaya a salir;
  - separar las paradas del instalador en las pruebas: el bloque del icono después del instalador, y un latido con la hora.
- **Guardado sin publicar:**
  - `guardado/escaner-radiografias`: el escáner y las Radiografías (29-31 oct);
  - `guardado/niveles`: la Blindada y Ultra por horas, superada.

## Decisiones del dueño
- pt: «criptografado» o «encriptado».
- El main del programa sigue en la 1.0.46 (ledger).
- El certificado de firma (Certum) y la pasarela de pagos. Con la pasarela llega la puerta de Plus en el relé.
- Search Console, Bing e IndexNow: los pasos están en `herramientas/seo/GUIA-DUENO.md`. Quedan las decisiones 5 a 9 de
  `herramientas/seo/PLAN.md`.

## Más adelante
- Unas 605 claves de `idioma.js` sin los 39 idiomas, y los plurales de la Revisión en los otros 28 idiomas.
- El cortafuegos de Hyper-V para WSL2 y las máquinas virtuales.
- La lentitud de la sección «arranque» de la Revisión del PC.
- El Antivirus Normal/Máximo, la actualización de los términos y la aplicación móvil.
