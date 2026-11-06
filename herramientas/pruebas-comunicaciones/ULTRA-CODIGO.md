# Código Ultra (6 nov 2026): diseño, para la revisión criptográfica

Rama `ultra-codigo`. El dueño eligió que una invitación Ultra también se pueda compartir con un código, largo y que el servidor
de GUARDIANA no pueda abrir. El relé no cambia (`zero-motor/comunicaciones.js` está igual) y, una vez se tiene la semilla, el
protocolo de Ultra es el de siempre (compromiso, cuatro palabras, firmas). La Blindada gratuita no cambia.

## El código y la derivación (`orbita/comunicaciones/cripto.js`)

- **Código** (`nuevoCodigoU`): 16 símbolos del alfabeto Crockford base32 `0123456789ABCDEFGHJKMNPQRSTVWXYZ`, de
  `crypto.getRandomValues` con `byte & 31` (256 = 8 · 32: sin sesgo). 80 bits. Se muestra en 4 grupos: `K7QM-2XRP-9DTA-H4WN`.
- **Lectura** (`normalizaCodigoU`): mayúsculas; fuera espacios (`\s`), guiones (también ‐ ‑ ‒ – — ― −: U+2010 a U+2015 y U+2212) y puntos (`.` y `·`);
  O → 0, I y L → 1. Si no quedan exactamente 16 símbolos del alfabeto, no es un código Ultra (`null`). Con 9 cifras, la Blindada.
- **Derivación** (`derivaCodigoU`), con `ikm = UTF-8("GUARDIANA código Ultra\n" ‖ código normalizado)`:
  - buzón = HKDF-SHA256(ikm, sal = 32 bytes a cero, info = `GUARDIANA Ultra · buzón`, 8 bytes), como entero big-endian módulo
    10^9, en 9 cifras con ceros delante (sesgo del módulo del orden de 5 · 10⁻¹¹);
  - clave del sobre = HKDF-SHA256(ikm, sal = 16 bytes al azar, info = `GUARDIANA Ultra · sobre`, 32 bytes) → AES-256-GCM, no
    exportable;
  - sobre (`cierraSobreU`) = b64u(iv de 12 bytes ‖ AES-GCM(semilla de 32 bytes) ‖ etiqueta de 16) = 60 bytes, 80 caracteres;
    datos asociados = `UTF-8("GUARDIANA Ultra sobre\n" ‖ buzón)`. La sal viaja en b64u (22 caracteres).
  - Solo primitivas que ya había: `C.hkdf`, `C.aes`, `C.azar`, `C.b64u` y AES-GCM de Web Crypto.
- **Con el relé**, los mensajes de siempre: `invita(buzón, sobre, sal)` (con «repetido», otro código; hasta 3 intentos),
  `busca(buzón)`, `retira(buzón)` y el aviso `codigo-usado`. El relé ya exige `^\d{9}$`, sobre de 40 a 200 y sal de 16 a 64.

## El flujo (`orbita/comunicaciones/app.js`)

- **Quien invita**: la invitación Ultra sale como hoy (enlace y QR). Solo al pulsar «Usar un código» (`publicaCodigoU`) se crea
  el código y se deja el sobre. Se ve en grande, con «Vale 10 minutos y una sola vez», la cuenta atrás, «La otra persona ha escrito
  el código: conectando…» (`codigo-usado`) y «Cancelar el código» (`retira`). El sobre sale del relé al cancelar el código o la
  invitación, al caducar, al entrar la otra persona (también si entró por el enlace) y con la tecla de pánico. Todo en memoria
  (`c.ucod`); Ultra no guarda nada. Tras un corte con el relé, el relé borra el sobre en cuanto ve cerrada la conexión vieja (hasta
  entonces aún puede darlo): el código se da por perdido y se pide otro. No se vuelve a dejar el mismo sobre solo: si alguien lo
  recogió durante el corte, valdría una segunda vez.
- **Quien entra**: la casilla de «Tengo un código» acepta las 9 cifras o el código Ultra (letras y cifras; 16 casillas; entra solo
  al completarlo). Sin la capa postcuántica (`C.B.hayBlindada()`), el aviso de siempre y **no se pide el sobre** (se da una sola
  vez). Si no: buzón → `busca` → `abreSobreU` → `aceptaSemilla(semilla, 'blindada')`, la misma función que abre un enlace `#b=`.
  Código inexistente, caducado, ya usado o sobre que no abre: el mismo mensaje, «Código erróneo, caducado o ya usado.».

## Qué ve el relé y qué no

Ve: el buzón (9 cifras), el sobre y la sal, durante 10 minutos como mucho o hasta que se recoge; qué conexión lo deja y cuál lo
recoge, sus direcciones IP y cuándo. Así puede enlazar en el tiempo a quien invita con quien entra (luego también los ve en la
misma sala, como con el enlace) y sabe que esa invitación Ultra se compartió con código.

No ve: el código, la semilla ni la clave del sobre. La prueba lo comprueba sobre todo lo que recibe un relé de verdad
(`ultra-codigo.js`, apartado 1): ninguna forma del código (normalizada, en grupos, en minúsculas o como se escribió) aparece en sus
mensajes ni en sus tramas, ni en lo que mandan las páginas, ni en las direcciones que piden.

## Por qué 80 bits

- No hay PAKE (no se añade criptografía nueva): quien tenga el sobre (el relé, o quien copie su memoria) puede probar códigos sin
  hablar con nadie. Por eso el código es largo. Abrir un sobre pide acertar entre 2^80 códigos; el buzón solo descarta, así que
  cuesta del orden de 2^79 HKDF-SHA256 por sobre. Para ponerse en medio hay que hacerlo antes de que entre la otra persona (10
  minutos, una sola vez): del orden de 2^70 HKDF por segundo. Y aun así, las cuatro palabras con compromiso previo lo harían
  visible si las dos personas las comparan.
- Varios sobres a la vez: el buzón no lleva sal (quien entra solo tiene el código), así que quien guarde T sobres puede probar cada
  código contra todos: del orden de 2^80 / T para abrir uno cualquiera, sin elegir cuál (con un millón, unos 2^60).
- Qué da un sobre abierto después: la semilla de esa invitación (la sala, que el relé ya ve, y la clave de las presentaciones, que
  van firmadas). Las claves de una sesión Ultra salen de tres ECDH P-384 y ML-KEM-1024 efímeros además de la semilla (psk): con la
  semilla sola no se leen los mensajes de una sesión ya hecha.
- Sin el sobre: quien pruebe buzones al azar tiene 6 búsquedas por minuto y conexión, como con la Blindada; con suerte se lleva un
  sobre que no puede abrir y esa invitación queda «usada» (denegación de servicio, no lectura).
- 16 símbolos en 4 grupos se dictan por teléfono; el alfabeto evita las letras que se confunden y O/I/L se corrigen solas.
- La Blindada, para comparar: 9 cifras con PBKDF2-SHA256 (300 000 vueltas), y el relé recibe el código en claro.

## Qué cambia frente al enlace

- Con el enlace (`#b=`, 256 bits en el fragmento) el secreto no llega a ningún servidor y el relé no guarda nada. Sigue igual: si
  solo se usa el enlace, el relé no recibe ningún `invita` (comprobado también tras reconectarse quien invita).
- Con el código, el relé guarda hasta 10 minutos un sobre con la semilla: frente a quien lo tenga, el secreto pasa de 256 a 80 bits,
  y el relé ve el buzón y el momento en que se deja y se recoge. A cambio, no hay enlace que quede en el historial del navegador.
- Enlace y código valen a la vez hasta que entra la otra persona; entonces el código sale del relé.

## Cambios de paso que conviene revisar

1. **Corregido**: al reconectarse con el relé, `R.on('abierto')` volvía a publicar un código de 9 cifras (PBKDF2) con la semilla de
   cualquier invitación pendiente, también de una Ultra que solo iba por enlace: el relé recibía la semilla Ultra protegida por 9
   cifras. Ahora solo para la invitación por código de la Blindada (`!porEnlace(c)`). Comprobado antes del cambio (un `invita`
   tras `gcomPrueba.corta()`) y después (ninguno).
2. **Corregido**: con un enlace `#b=` en un navegador sin la capa postcuántica, «Ese enlace no es una invitación de GUARDIANA.»
   tapaba al momento el aviso de verdad. Ahora queda ese aviso, el mismo que con el código.
3. Pegar en la casilla ya no lo corta el máximo de caracteres; un código dentro de un mensaje pegado se toma entero.
4. **Sin tocar (Blindada)**: al crear una invitación por código, `creaInvitacion` y `abreConv` piden código los dos; a menudo quedan
   dos sobres de 9 cifras en el relé y solo se enseña uno (el otro vale 10 minutos para la misma invitación).
5. Bordes conocidos de la casilla: si las 9 primeras posiciones de un código Ultra son cifras (probabilidad (10/32)^9, unas 3
   entre 100 000), al escribirlo la casilla prueba antes esas 9 cifras como código de la Blindada; falla, y se sigue escribiendo.
   Y, al revés, una décima cifra tras 9 ya no se bloquea como antes: pasa a las 16 casillas (un código Ultra puede empezar así).

## Pruebas

`node herramientas/pruebas-comunicaciones/ultra-codigo.js [capturas]`, con la web en el 8080: levanta su propio relé (puerto 8795)
y comprueba el formato, el buzón y el sobre calculados aparte con `node:crypto`, la entrada con minúsculas, espacios y O por 0,
la sesión Ultra con las mismas cuatro palabras y mensajes en los dos sentidos, el código usado, uno inventado, la Blindada de 9
cifras, el navegador sin la capa postcuántica (el código no se gasta), el enlace solo (ningún `invita`) y el código caducado,
cancelado o perdido tras un corte.
