Ronda 55 · GUARDIANA · Comunicaciones postcuántica: revisión antes de anunciarla (27 Oct 2026)

Eres parte de la agencia de GUARDIANA. El dueño quiere decir «encriptación postcuántica» en Comunicaciones («es lo más espectacular, pero tiene que ser verdad»). Ya está hecha y probada; no se ha anunciado. Revisa con lupa.

HECHOS (del código, comprobables):
- Comunicaciones: chat y archivos de PC a PC en el navegador. Identidad por equipo: ECDSA P-256 (firma) y ECDH P-256 (acuerdo), claves privadas no exportables de Web Crypto.
- Invitación: 32 bytes aleatorios; de ahí salen la sala del relé (el relé la ve) y la clave de presentación (el relé no).
- Sesión: cada lado manda su «presentación» sellada (AES-GCM) y firmada (ECDSA).
  - Antes, el secreto de sesión mezclaba tres ECDH P-256 con HKDF-SHA256.
  - Ahora es híbrido: quien inicia manda una clave pública ML-KEM-768 (FIPS 203) nueva en cada presentación, y quien responde encapsula y devuelve el texto cifrado.
  - Las dos cosas van dentro de las presentaciones selladas y con una segunda firma ECDSA que las cubre.
  - El secreto de sesión = HKDF sobre los tres ECDH + el secreto ML-KEM + el secreto de la invitación, con las huellas de la clave y del texto cifrado.
- Después, una clave distinta por mensaje (cadenas HMAC-SHA256) y AES-256-GCM en cada mensaje y en cada trozo de archivo.
- Las firmas de identidad siguen siendo ECDSA P-256 (no postcuánticas).
- Si el otro equipo tiene una versión anterior, la sesión es solo ECDH (sin ML-KEM). Si esa conversación ya tuvo una sesión postcuántica, el registro de seguridad lo avisa en rojo. Hoy no se rechaza.
- Librería: @noble/post-quantum 0.7.1 (MIT), compilada desde su código etiquetado en GitHub y servida desde nuestro sitio.
  - Su autor dice que no tiene auditoría independiente (autoauditoría en la 0.6.1) y que no promete tiempo constante.
  - Aún no se ha comparado con el paquete de npm.
  - Las claves privadas ML-KEM viven en memoria JavaScript, se usan una vez y se borran.
- Pruebas:
  - 222 comprobaciones del establecimiento de sesión: nuevo con nuevo, nuevo con anterior y alteraciones rechazadas;
  - 200 idas y vueltas ML-KEM;
  - 40 casos cruzados con crypto/mlkem de Go, idénticos;
  - prueba con dos navegadores reales: postcuántica en las dos puntas.
  - Coste: unos 2,9 KB más por sesión y alrededor de 1 ms por operación.
- Archivos: van en trozos autenticados (AES-GCM). Un trozo alterado no supera la verificación y se descarta. Al llegar entero, el registro dice «Archivo recibido: … trozos autenticados, completo», y en el chat aparece un recibo de entrega. El relé ve la dirección IP, la sala y el volumen, no el contenido.
- Prohibido: promesas absolutas («100 % seguro», «nadie», «indescifrable»), cifras inventadas.

PIDO (máximo 30 líneas):
A) ¿Es honesto decir «encriptación postcuántica»? Da la frase exacta más fuerte que siga siendo verdad, para la portada (máximo 6 palabras) y para la explicación.
B) Riesgos: el retroceso a solo ECDH (¿avisar o rechazar?), la falta de auditoría independiente, la ausencia de tiempo constante, y la comparación con npm. ¿Qué hay que hacer antes de anunciarlo y qué basta con decir?
C) Textos en español para el desplegable «Cómo funciona Comunicaciones», tres apartados de 2 o 3 frases cada uno: «Encriptación postcuántica», «Cada archivo, vigilado» y «Recibo de entrega».
Separa hechos de opiniones.
