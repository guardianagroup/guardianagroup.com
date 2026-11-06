# Código Ultra (6 nov 2026): diseño, para la revisión criptográfica

Rama `ultra-codigo`. El dueño eligió que una invitación Ultra también se pueda compartir con un código, largo y que el servidor
de GUARDIANA no pueda abrir. El relé no cambia (`zero-motor/comunicaciones.js` está igual) y, una vez se tiene la semilla, el
protocolo de Ultra es el de siempre (compromiso, cuatro palabras, firmas). La Blindada gratuita no cambia.

La revisión criptográfica independiente del primer commit dio «GO con condiciones»; el segundo commit las aplica (la lista, al
final: «Tras la revisión independiente»). Lo más importante: la derivación pasa por PBKDF2 (S1) y el código nunca empieza por 9
cifras (M1).

## El código y la derivación (`orbita/comunicaciones/cripto.js`)

- **Código** (`nuevoCodigoU`): 16 símbolos del alfabeto Crockford base32 `0123456789ABCDEFGHJKMNPQRSTVWXYZ`, de
  `crypto.getRandomValues` con `byte & 31` (256 = 8 · 32: sin sesgo). 80 bits. Se muestra en 4 grupos: `K7QM-2XRP-9DTA-H4WN`.
  Si sale uno que empieza por 9 cifras ((10/32)^9: 1 de cada ~35 000), se descarta y se saca otro (M1); se pierde menos de una
  diezmilésima de bit.
- **Lectura** (`normalizaCodigoU`): NFKC (un teclado de ancho completo da `Ｋ７…`, que queda `K7…`: S3), mayúsculas; fuera
  espacios (`\s`), guiones (también ‐ ‑ ‒ – — ― −: U+2010 a U+2015 y U+2212) y puntos (`.` y `·`); O → 0, I y L → 1. Si no quedan
  exactamente 16 símbolos del alfabeto, no es un código Ultra (`null`). Con 9 cifras, la Blindada.
- **Derivación** (`derivaCodigoU`; quien entra, `preparaCodigoU`, con un solo PBKDF2 para el buzón y el sobre):
  - M = PBKDF2-SHA256(UTF-8(código normalizado), sal fija = UTF-8(`GUARDIANA código Ultra v1`), 300 000 vueltas, 32 bytes): la
    misma primitiva y las mismas vueltas que el código de la Blindada (`claveDeCodigo`), por la función `pbkdf2` del Número
    GUARDIANA. M se borra (`fill(0)`) en cuanto se ha usado;
  - buzón = HKDF-SHA256(M, sal = 32 bytes a cero, info = `GUARDIANA Ultra · buzón`, 8 bytes), como entero big-endian módulo
    10^9, en 9 cifras con ceros delante (sesgo del módulo del orden de 5 · 10⁻¹¹);
  - clave del sobre = HKDF-SHA256(M, sal = 16 bytes al azar, info = `GUARDIANA Ultra · sobre`, 32 bytes) → AES-256-GCM, no
    exportable;
  - sobre (`cierraSobreU`) = b64u(iv de 12 bytes ‖ AES-GCM(semilla de 32 bytes) ‖ etiqueta de 16) = 60 bytes, 80 caracteres;
    datos asociados = `UTF-8("GUARDIANA Ultra sobre\n" ‖ buzón)`. La sal viaja en b64u (22 caracteres).
  - Solo primitivas que ya había: PBKDF2, HKDF y AES-GCM de Web Crypto (`pbkdf2`, `C.hkdf`, `C.aes`), `C.azar` y `C.b64u`.
- **Con el relé**, los mensajes de siempre: `invita(buzón, sobre, sal)` (con «repetido», otro código; hasta 3 intentos),
  `busca(buzón)`, `retira(buzón)` y el aviso `codigo-usado`. El relé ya exige `^\d{9}$`, sobre de 40 a 200 y sal de 16 a 64. Los
  `invita` (Ultra y Blindada) van de uno en uno (`invitaEnCola`): el cliente del relé guarda una sola respuesta pendiente por tipo.

## El flujo (`orbita/comunicaciones/app.js`)

- **Quien invita**: la invitación Ultra sale como hoy (enlace y QR). Solo al pulsar «Usar un código» (`publicaCodigoU`) se crea
  el código y se deja el sobre. El botón sigue en la espera que sale tras «Copiar enlace» y, con un código vivo, la invitación se
  ve entera. El código se ve en grande, con «Vale 10 minutos y una sola vez», la cuenta atrás, «Alguien ha escrito el código:
  conectando…» (`codigo-usado`: quien recogió el sobre puede no ser la otra persona) y «Cancelar el código» (`retira`). Si a los
  30 s de recogido nadie ha entrado, «Nuevo código». El sobre sale del relé al cancelar el código o la invitación, al caducar, al
  entrar la otra persona (también si entró por el enlace) y con la tecla de pánico. Todo en memoria (`c.ucod`); Ultra no guarda
  nada. Tras un corte con el relé, el relé borra el sobre en cuanto ve cerrada la conexión vieja (hasta entonces aún puede darlo):
  el código se da por perdido («Se cortó la conexión con el relé: crea uno nuevo.»). No se vuelve a dejar el mismo sobre solo: si
  alguien lo recogió durante el corte, valdría una segunda vez.
- **Quien entra**: la casilla de «Tengo un código» acepta las 9 cifras o el código Ultra (letras y cifras; 16 casillas). El código
  Ultra entra solo al completarlo; 9 cifras escritas a mano, a los 800 ms sin otra tecla (pueden ser el principio de un código
  Ultra); lo pegado e Intro, al momento. Mientras se comprueba, la casilla sigue abierta: si lo escrito cambia, no se dice nada de
  lo anterior y lo nuevo, si está entero, se comprueba. Un texto pegado que no es un código ni un trozo de uno no toca la casilla.
  Sin la capa postcuántica (`C.B.hayBlindada()`), el aviso de siempre en la casilla, en ámbar, y **no se pide el sobre** (se da
  una sola vez). Si no: `preparaCodigoU` (M y el buzón) → `busca` → `abre` → `aceptaSemilla(semilla, 'blindada')`, la misma
  función que abre un enlace `#b=`. Código inexistente, caducado, ya usado o sobre que no abre: el mismo mensaje, «Código erróneo,
  caducado o ya usado.».

## Qué ve el relé y qué no

Ve: el buzón (9 cifras), el sobre y la sal, durante 10 minutos como mucho o hasta que se recoge; qué conexión lo deja y cuál lo
recoge, sus direcciones IP y cuándo. Así puede enlazar en el tiempo a quien invita con quien entra (luego también los ve en la
misma sala, como con el enlace) y sabe que esa invitación Ultra se compartió con código.

No ve: el código, M, la semilla ni la clave del sobre. En el primer commit había una excepción (M1): un código que empezaba por 9
cifras, escrito a mano, se probaba antes como código de la Blindada y esas 9 cifras llegaban al relé en un `busca` (quedaban por
adivinar 7 símbolos, 35 bits). Ahora `nuevoCodigoU` no da códigos así y 9 cifras escritas a mano esperan 800 ms sin otra tecla.
La prueba lo comprueba sobre todo lo que recibe un relé de verdad (`ultra-codigo.js`): ninguna forma del código (normalizada, en
grupos, en minúsculas o como se escribió) aparece en sus mensajes ni en sus tramas, ni en lo que mandan las páginas, ni en las
direcciones que piden; y, con un código forzado que empieza por 9 cifras, ningún `busca` lleva esas 9 cifras, ni escrito despacio
ni deprisa.

## Por qué 80 bits, y qué cuesta probar códigos

- No hay PAKE (no se añade criptografía nueva): quien tenga el sobre (el relé, o quien copie su memoria) puede probar códigos sin
  hablar con nadie. Por eso el código es largo y lento de probar: cada intento pasa por M, un PBKDF2-SHA256 de 300 000 vueltas.
  Abrir un sobre pide acertar entre 2^80 códigos; el buzón solo descarta, así que cuesta de media 2^79 de esos PBKDF2 (unas 2^97
  HMAC-SHA256) por sobre. Para ponerse en medio hay que hacerlo antes de que entre la otra persona (10 minutos, una sola vez): del
  orden de 2^88 HMAC-SHA256 por segundo. Y aun así, las cuatro palabras con compromiso previo lo harían visible si las dos
  personas las comparan.
- Varios sobres a la vez: el buzón no lleva sal propia y la de PBKDF2 es fija (quien entra solo tiene el código), así que quien
  guarde T sobres prueba cada código contra todos con un solo PBKDF2: del orden de 2^80 / T intentos para abrir uno cualquiera,
  sin elegir cuál (con un millón de sobres, unos 2^60 intentos, unas 2^78 HMAC-SHA256).
- Qué da un sobre abierto después: la semilla de esa invitación (la sala, que el relé ya ve, y la clave de las presentaciones, que
  van firmadas). Las claves de una sesión Ultra salen de tres ECDH P-384 y ML-KEM-1024 efímeros además de la semilla (psk): con la
  semilla sola no se leen los mensajes de una sesión ya hecha. Pero esa capa de la semilla, la que quedaría frente a quien rompiera
  a la vez P-384 y ML-KEM-1024, es de 80 bits con el código (con PBKDF2 delante), y no de 256, para quien tenga el sobre (S2).
- Sin el sobre: quien pruebe buzones al azar tiene 6 búsquedas por minuto, como con la Blindada. El límite es por conexión, no por
  IP (S2): con más conexiones, más búsquedas (un límite por IP en el relé queda para otra tanda, E5). Con suerte se lleva un sobre
  que no puede abrir y esa invitación queda recogida (denegación de servicio, no lectura): a los 30 s, «Nuevo código».
- 16 símbolos en 4 grupos se dictan por teléfono; el alfabeto evita las letras que se confunden y O/I/L se corrigen solas.
- La Blindada, para comparar: 9 cifras con PBKDF2-SHA256 (300 000 vueltas), y el relé recibe el código en claro.

## Qué cambia frente al enlace

- Con el enlace (`#b=`, 256 bits en el fragmento) el secreto no llega a ningún servidor y el relé no guarda nada. Sigue igual: si
  solo se usa el enlace, el relé no recibe ningún `invita` (comprobado también tras reconectarse quien invita).
- Con el código, el relé guarda hasta 10 minutos un sobre con la semilla: frente a quien lo tenga, el secreto pasa de 256 a 80 bits
  (con PBKDF2 delante), y el relé ve el buzón y el momento en que se deja y se recoge. A cambio, no hay enlace que quede en el
  historial del navegador.
- Enlace y código valen a la vez hasta que entra la otra persona; entonces el código sale del relé.

## Cambios de paso (primer commit)

1. **Corregido**: al reconectarse con el relé, `R.on('abierto')` volvía a publicar un código de 9 cifras (PBKDF2) con la semilla de
   cualquier invitación pendiente, también de una Ultra que solo iba por enlace: el relé recibía la semilla Ultra protegida por 9
   cifras. Ahora solo para la invitación por código de la Blindada (`!porEnlace(c)`). Comprobado antes del cambio (un `invita`
   tras `gcomPrueba.corta()`) y después (ninguno).
2. **Corregido**: con un enlace `#b=` en un navegador sin la capa postcuántica, «Ese enlace no es una invitación de GUARDIANA.»
   tapaba al momento el aviso de verdad. Ahora queda ese aviso, el mismo que con el código.
3. Pegar en la casilla ya no lo corta el máximo de caracteres; un código dentro de un mensaje pegado se toma entero.
4. Una décima cifra tras 9 no se bloquea como antes: pasa a las 16 casillas y no se pide nada al relé hasta tener las 16.

## Tras la revisión independiente (segundo commit)

- **M1**: `nuevoCodigoU` nunca da un código que empiece por 9 cifras; 9 cifras escritas a mano entran a los 800 ms sin otra tecla
  (`e.isTrusted`); lo pegado e Intro, al momento. La casilla ya no se pone en solo lectura mientras se comprueba: no se pierden
  teclas, y si lo escrito cambia, se comprueba lo nuevo.
- **M2**: «Usar un código» (`#ucod`) sale de `#enlace-vista`: sigue tras «Copiar enlace», en la espera.
- **B1**: un texto pegado sin código (ni trozo de uno) no toca la casilla ni se manda.
- **B2**: sin la capa postcuántica, con el código, el aviso solo en la casilla (en ámbar), sin el flotante; con el enlace, el de
  siempre.
- **B3**: con `codigo-usado`, «Alguien ha escrito el código: conectando…» y, a los 30 s sin entrar nadie, «Nuevo código».
- **B4**: los `invita`, en cola: dos invitaciones que piden código a la vez tienen las dos el suyo.
- **B5**: `publicaCodigo` (9 cifras) empieza por `if (!c || porEnlace(c)) return false;`.
- **S1**: M = PBKDF2-SHA256 (300 000 vueltas); buzón y clave del sobre, de M con HKDF (las mismas info).
- **S2**: precisado arriba: la capa de la semilla (psk) queda en 80 bits con el código; las 6 búsquedas por minuto son por
  conexión, no por IP.
- **S3**: NFKC al leer el código (cripto.js y la casilla).
- **E2**: la Blindada deja un solo código en el relé (antes, a menudo dos, uno sin enseñar).
- **E3**: la Blindada, tras un corte con el relé (que borra su código), crea uno nuevo y lo enseña (antes seguía enseñando el
  borrado).
- Textos: «Se cortó la conexión con el relé: crea uno nuevo.» y, en portugués de Portugal, «Válido durante 10 minutos e para uma
  única utilização.».
- Sin tocar en esta tanda: E1 (las casillas en rojo), E4 (la ventana estrecha) y E5 (un límite por IP en el relé).

## Pruebas

`node herramientas/pruebas-comunicaciones/ultra-codigo.js [capturas]`, con la web en el 8080: levanta su propio relé (puerto 8795)
y comprueba el formato, el buzón y el sobre calculados aparte con `node:crypto` (PBKDF2 y HKDF), «Usar un código» en la espera, la
entrada con minúsculas, espacios y O por 0, la sesión Ultra con las mismas cuatro palabras y mensajes en los dos sentidos, el
código usado, uno inventado, lo pegado (con y sin código, en ancho completo), la Blindada de 9 cifras (un solo código, uno nuevo
tras un corte), el navegador sin la capa postcuántica (el código no se gasta), un código forzado que empieza por 9 cifras (escrito
despacio, y deprisa con un relé lento corrigiendo la última tecla mientras se comprueba), el código caducado, cancelado, perdido
tras un corte o recogido sin que nadie entre, dos invitaciones que piden código a la vez y el enlace solo (ningún `invita`).
