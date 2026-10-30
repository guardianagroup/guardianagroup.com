# Ronda 73 · Claude (voz independiente, hechos comprobados) · Número GUARDIANA

29 oct 2026. Todo lo verificable lleva su enlace al lado; lo que no hallé dice «no lo sé». [Código] = leído en este repositorio. Las cuentas son mías (script de Python; los resultados están en las tablas).

## Respuesta corta
1. **Solo M cumple el requisito del dueño.** Con C, cualquiera que acierte un número llega a la persona, y el «nombre» de la solicitud sirve para publicidad. Recomiendo **M con «cita ciega»**: el servidor guarda solo una etiqueta que calculan los dos, nunca la pareja.
2. **Número:** 12 cifras = 11 al azar creadas en el teléfono + 1 de control Damm, en tres grupos de cuatro: **4821 1790 3510** (válido). Capacidad: 90 000 millones; con 1 000 millones de usuarios ocupa el 1,1 %. Nunca 10 cifras ni 3-3-4: es el formato de los teléfonos de Colombia, México y EE. UU./Canadá.
3. **Fallos más graves de A–D:**
   - C no impide que escriban desconocidos.
   - La «sala buzón» del relé actual la puede abrir y llenar cualquiera que consulte el número.
   - El directorio con la suscripción push, junto al archivo de avisos por sala, deja el grafo social en el disco. Además, el «topic» de Web Push ya revela hoy a Apple y Google qué suscripciones comparten chat.
4. **«Para siempre» exige una clave de cuenta, no del aparato.** Una hoja de rescate la recupera; la clave firma los aparatos (el PC, más adelante) y permite cambiar claves sin cambiar de número. Además: aviso de cambio de clave, QR en persona y, más adelante, transparencia de claves auditada como la de Signal (ago-2026).

## 0. Requisito del dueño: ¿C o M?

**Veredicto: M lo cumple por construcción; C solo lo limita.**

**C no lo cumple**
- Quien tenga o acierte un número manda «Fulano quiere hablar contigo» y despierta el teléfono. El nombre lo escribe él: «Bancolombia», «Tu hijo», «Gana dinero…». Esa pantalla ya es publicidad o estafa.
- Los límites solo frenan. Con 12 cifras y 1 000 millones de usuarios, el 1,1 % de los números válidos son de alguien:
  - 100 intentos al día → ~1,1 personas al día por atacante;
  - 10 000 IP × 100 intentos → ~11 100 personas al día (cuentas en el bloque 1).
- Pasa de verdad: investigadores de la Universidad de Viena comprobaron 3 546 millones de cuentas de WhatsApp, a más de 100 millones de números por hora, porque no había un límite efectivo. WhatsApp puso límites a principios de oct-2025 ([NDSS 2026](https://arxiv.org/abs/2511.20252)).
- Una errata que pasa la cifra de control (~10 % de las erratas dobles) llega a un desconocido real con una probabilidad igual a la densidad: 0,11 % con 1 000 M de usuarios.

**M sí lo cumple**
- Hasta que los dos se añaden, nadie recibe nada: ni aviso, ni nombre, ni llamada. Marcar al azar no da nada, ni siquiera saber si el número existe.
- Otras apps ya ofrecen algo parecido:
  - Threema permite «bloquear los mensajes de usuarios desconocidos» en general, y al bloqueado no se le avisa ([Threema](https://threema.com/en/faq/unwanted)).
  - Session solo deja llamar a contactos, «para evitar el spam» ([Session FAQ](https://getsession.org/faq)).
  - WhatsApp anunció el 29-jun-2026 una «clave de usuario» opcional que hará falta para empezar un chat contigo ([TechCrunch](https://techcrunch.com/2026/06/29/whatsapp-not-lets-you-reserve-usernames/)).

**Fallos de M y cómo arreglarlos**
1. **El servidor aprende el grafo.** Tal como está escrita, M guarda «A quiere hablar con B» durante días. Eso incluye las intenciones no correspondidas, un dato delicado (acoso). Después ve la pareja.
   - **Arreglo, «cita ciega»:** cada app calcula `etiqueta = HKDF(ECDH(mi clave de cuenta, la del otro), "GUARDIANA cita v1" ‖ idn menor ‖ idn mayor ‖ época)`. Los dos obtienen la misma. El servidor guarda solo etiquetas, sin números, cada una con la dirección de aviso de quien la dejó, y avisa a los dos cuando una llega dos veces.
   - Para calcular la etiqueta, A necesita la clave pública de B antes de que haya pareja. El servidor la da para cualquier número: la real o una «de mentira» derivada de un secreto suyo, imposibles de distinguir. Así no hay oráculo de existencia, y una clave pública sola no sirve para contactar.
   - Desaparecen el buzón y las solicitudes guardadas.
   - **Límite honesto:** quien vigile el servidor en directo puede casar «esta conexión consultó el número de B» con «esta conexión dejó esa etiqueta», por IP y hora. Lo que queda en el disco no revela parejas.
2. **Semilla fija por pareja.** Es siempre la misma, no tiene secreto hacia adelante y usa ECDH P-256 sin capa poscuántica. Quien robe una clave privada calcula todas las salas de esa persona, y no se puede rehacer un chat.
   - **Arreglo:** usarla solo para la cita. En el primer encuentro, que ya negocia ML-KEM-768, acordar una sala y un PSK nuevos al azar y mudarse. Añadir un contador de «época» en el HKDF para poder repetir la cita.
3. **Pérdida del teléfono.** Sin la clave no se puede recalcular nada.
   - Con la hoja de rescate (bloque 4) vuelven el número, la clave de cuenta y la lista de chats, y el otro ve «Ana tiene teléfono nuevo».
   - Sin hoja: número nuevo, y los dos se vuelven a añadir.
4. **¿Es fácil a los 60 años?** La idea («como darse el teléfono») se entiende. Lo que confunde es que no pase nada cuando solo uno ha añadido al otro. Hay que mostrar siempre «Esperando a que Ana te añada», con la instrucción «Dile tu número: 4821 1790 3510».
5. **Erratas.** En M una errata no molesta a nadie, pero deja a la persona esperando. Damm detecta casi todas (bloque 1).
6. **No frena la ingeniería social.** «Guarda mi nuevo número» es una estafa documentada en Colombia por el Centro Cibernético de la Policía ([RCN, 7-dic-2020](https://www.noticiasrcn.com/tecnologia/guarda-mi-nuevo-numero-la-nueva-estafa-que-pone-en-peligro-su-dinero-366715)). Con M, el estafador necesita que la víctima lo añada, y puede convencerla. Mitigación: aviso en pantalla al añadir un número con el mismo nombre que un contacto (bloque 8).

**Recomiendo M con cita ciega.**

## 1. Longitud y forma del número

**Capacidad y ocupación** (primera cifra de 1 a 9, la última es la de control; cálculo propio):

| Cifras | Capacidad | 1 M de usuarios | 10 M | 100 M | 1 000 M |
|---|---|---|---|---|---|
| 9 | 90 M | 1,1 % | 11 % | lleno | lleno |
| 10 | 900 M | 0,11 % | 1,1 % | 11 % | lleno |
| 11 | 9 000 M | 0,011 % | 0,11 % | 1,1 % | 11 % |
| **12** | **90 000 M** | **0,0011 %** | **0,011 %** | **0,11 %** | **1,1 %** |

**Marcar al azar con 12 cifras** (solo importa con C): probabilidad de dar con al menos una persona en un día.

| Usuarios | 20 intentos/día | 100/día | 1 000/día |
|---|---|---|---|
| 10 M | 0,22 % | 1,1 % | 10,5 % |
| 100 M | 2,2 % | 10,5 % | 67 % |
| 1 000 M | 20 % | 67 % | ~100 % (11 aciertos/día) |

«Nunca reutilizado» suma también los números de iconos borrados. Si cada persona gasta 3 en su vida, la ocupación se triplica (supuesto mío).

**Recomendación: 12 cifras = 11 al azar + 1 Damm, en grupos de 4-4-4, con la primera cifra de 1 a 9.**
- **Ni 10 cifras ni 3-3-4** (como el ejemplo «482 117 9035»). Es el formato de los teléfonos de:
  - EE. UU. y Canadá: «NXX-NXX-XXXX» ([NANPA](https://www.nationalnanpa.com/about_us/abt_nanp.html));
  - México, desde el 3-ago-2019 ([IFT](https://www.ift.org.mx/sites/default/files/cambios_marcacion_a_10.pdf));
  - Colombia: móviles de 10 cifras y fijos «60 + región + número», obligatorio desde el 1-dic-2021 ([CRC](https://www.ambitojuridico.com/sites/default/files/2021-11/comunicadoDesdediciembrecambiadefinitivamentemarcacionunicanacional-21.pdf)).

  Se confundiría con un teléfono y alguien lo marcaría.
- **11 cifras** alcanzan con M, pero con 1 000 M de usuarios la ocupación sube al 11 %, y la huella del número se invierte en ~1 día de GPU (bloque 12). **12** deja margen.
- Ninguna longitud de solo cifras es «imposible» como teléfono: un número E.164 tiene hasta 15 cifras ([E.164](https://en.wikipedia.org/wiki/E.164)). Lo que lo distingue es la forma: sin «+», en 4-4-4 y siempre con la palabra «GUARDIANA» delante. Si iOS o Android lo convierten en un enlace «Llamar» dentro de WhatsApp: **no lo sé**; hay que probarlo.
- **Cifra de control.** Comparé Damm y Luhn con 200 000 casos por tipo de error, en números de 12 cifras (cálculo propio):

| Error | Damm | Luhn |
|---|---|---|
| Una cifra cambiada | 100 % | 100 % |
| Dos vecinas cambiadas de sitio | 100 % | 97,9 % (falla 09↔90) |
| Salto (a b c → c b a) | 89,7 % | 0 % |
| Gemelas (aa → bb) | 90,9 % | 93,2 % |
| Dos cifras cambiadas | 89,8 % | 89,8 % |

  - Damm detecta todos los errores de una cifra y todas las transposiciones de vecinas ([Damm](https://en.wikipedia.org/wiki/Damm_algorithm)). Luhn no detecta 09↔90, 22↔55, 33↔66 ni 44↔77 ([Luhn](https://en.wikipedia.org/wiki/Luhn_algorithm)). Verhoeff iguala a Damm en lo básico, pero usa tres tablas, y Damm una sola de 10×10 ([Verhoeff](https://en.wikipedia.org/wiki/Verhoeff_algorithm)).
  - En el estudio de Verhoeff, el 79 % de los errores humanos son de una cifra y el 10,2 %, transposiciones ([misma fuente](https://en.wikipedia.org/wiki/Verhoeff_algorithm)). Una cifra Damm detecta así el ~89 % de los errores siempre, y casi todo el resto en ~9 de cada 10 casos.
  - La debilidad de Damm (añadir ceros delante no cambia el control) no importa con longitud fija.
  - Una sola cifra basta: con M, una errata no molesta a nadie.
- **Dictado.** Cifra a cifra, con una pausa entre grupos: «cuatro ocho dos uno — uno siete nueve cero — tres cinco uno cero». Un botón «Escuchar mi número» puede leerlo con la voz del navegador (si hay voz en español en el iPhone: probarlo).

## 2. Revisión de A–D: qué falla

**A. Número**
- Va ligado a la clave de firma **de una app**: sin recuperación y sin varios aparatos. Mejor: número → **clave de cuenta**, que firma las claves de cada aparato (bloques 4 y 5).
- Si lo da el servidor, alimenta el «ya lo saben». Mejor generarlo en el teléfono (bloque 12).
- Damm: bien. Basta una cifra.

**B. Directorio**
- **«Sala buzón» en el relé actual.** El relé deja entrar en una sala a cualquiera que conozca su identificador, hasta 8 personas; avisa de llegadas y salidas y entrega los mensajes a todos [Código: `zero-motor/comunicaciones.js`, `MAX_MIEMBROS = 8`, `llega`, `sale`, `sala llena`].
  - Quien consulte el número de B obtiene su buzón, ve cuándo se conecta y puede llenarlo para que B no entre.
  - Con M no hace falta buzón. Con C haría falta uno aparte, solo para dejar cosas, que únicamente B lea firmando un reto.
- **Suscripción push en el directorio + archivo de avisos.** Hoy el servidor guarda cada dirección de aviso con la lista de sus salas [Código: `zero-motor/avisos.js`]. Si además el directorio guarda «número → suscripción», queda en el disco «número → todas sus salas → las suscripciones de los otros → sus números»: el grafo completo. Arreglo:
  - el directorio no guarda la suscripción (M no la necesita);
  - cada contacto pasa su dirección de aviso al otro dentro del chat cifrado;
  - para despertarlo, la app pide al relé «avisa a esta dirección»; el relé firma con su clave VAPID y no guarda nada.
- **«Sin IP guardada».** El Caddyfile no tiene la directiva `log`, que es la que activa el registro de peticiones [Código: `zero-motor/instalar.sh`; [Caddy](https://caddyserver.com/docs/caddyfile/directives/log)]. Bien. Pero el proveedor y la red sí ven la IP y la hora.
- **«Topic» de Web Push.** Hoy es `gcom-m-` (o `gcom-l-`) más los 16 primeros caracteres de la sala [Código: `avisos.js`], y la sala viaja también dentro del aviso, cifrada.
  - El RFC 8030 dice que el Topic «no va cifrado ni autenticado» y que permite «una correlación más fina» que ayuda «al análisis de tráfico» ([RFC 8030](https://www.rfc-editor.org/rfc/rfc8030.html)). Apple o Google pueden ver qué suscripciones reciben avisos del mismo chat.
  - Arreglo inmediato: un Topic al azar para cada suscripción y chat, y en el aviso un número de chat local en vez de la sala.

**C. Solicitud**
- No cumple el requisito (bloque 0).
- El nombre libre es un canal de publicidad y suplantación.
- **La firma de A no nombra a B.** Si A firma «quiero hablar, semilla S, soy A» sin el número y la huella de B ni la fecha, quien vea el texto descifrado puede volver a cifrarlo para otra persona («reenvío subrepticio»). Hay que firmar el número de B, la huella de B, la fecha y el hash de la semilla.
- **ECDH efímero contra la clave fija de B.** No tiene capa poscuántica (la sesión sí) ni secreto hacia adelante para las solicitudes guardadas. Mejor:
  - una «prekey» firmada que rote, con ML-KEM-768, como PQXDH de Signal ([Signal, 19-sep-2023](https://signal.org/blog/pqxdh/));
  - HPKE estándar en vez de un esquema propio ([RFC 9180](https://www.rfc-editor.org/rfc/rfc9180.html)).
- Guardar solicitudes durante días permite llenar buzones.

**D. Límites**
- **Por IP:** las operadoras comparten una IP entre muchos clientes ([RFC 6888, NAT de operador](https://www.rfc-editor.org/rfc/rfc6888.html)), así que se castiga a inocentes; y una red de bots tiene miles de IP.
- **Por conexión:** basta con reconectar.
- Con C, el límite útil es **por identidad** (el remitente), más un coste por crear identidades (bloque 6). Con M y cita ciega, las consultas y etiquetas son anónimas y bastan límites por conexión e IP recortada, porque no hay a quién molestar.
- «Una solicitud pendiente por pareja» obliga a guardar parejas.

**Qué ve el servidor**

| | C | M (como está) | M con cita ciega |
|---|---|---|---|
| Qué número se busca | sí | sí | sí (su huella idn) |
| Quién busca | su conexión e IP | su conexión e IP | su IP (la conexión, solo si no se separa) |
| Pareja guardada | solicitud pendiente, días | intención días + pareja | no: solo dos etiquetas iguales |
| Intereses no correspondidos | solicitudes rechazadas | sí, días | etiquetas sin dueño |
| IP y horas | en directo | en directo | en directo |

**Cómo reducirlo sin complicar** (de más a menos rentable)
1. Contadores de límites solo en memoria, con la IP recortada (/24 en IPv4, /48 en IPv6) y una clave que cambie cada día.
2. Topic y contenido del aviso sin sala; directorio sin suscripción; avisos sin lista de salas.
3. Consultas y etiquetas por una conexión aparte, sin identidad.
4. Número guardado como idn más una «pimienta»: un secreto fuera de la base de datos, como pide OWASP para las contraseñas ([OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)). Protege de una copia robada de la base, no del operador (bloque 12).
5. **Remitente sellado («sealed sender»).**
   - En C, el remitente ya va dentro del sobre.
   - Signal lo hace con un token de entrega de 96 bits derivado de la clave de perfil (es decir, solo para contactos) y reconoce que la IP y los tiempos siguen pendientes ([Signal, 29-oct-2018](https://signal.org/blog/sealed-sender/)).
   - Un estudio logró enlazar a usuarios «en tan solo 5 mensajes» gracias a los acuses de recibo ([NDSS 2021](https://www.ndss-symposium.org/ndss-paper/improving-signals-sealed-sender/)).
   - Con M y cita ciega no hace falta.
6. **Pruebas de trabajo: no, para mensajes.** Laurie y Clayton (2004) concluyen que una prueba de trabajo por mensaje «no es una solución viable» y frenaría a remitentes legítimos ([Cambridge](https://www.cl.cam.ac.uk/~rnc1/proofwork2.pdf)). El móvil de una persona mayor es más lento que una granja de GPU. Como mucho, una sola prueba al crear el número.

## 3. Suplantación y servidor que miente
- **¿Cómo sabe B que el número es de quien dice?** El número no lo prueba: solo garantiza que firma la clave que el directorio tiene para ese número. Que «Ana» sea Ana depende de cómo se consiguió el número (en persona, de su voz) o de una verificación.
  - Threema lo muestra con colores: rojo = clave dada por el servidor; naranja = coincide con la agenda; verde = QR escaneado en persona ([Threema](https://threema.com/en/faq/levels-expl)).
- **Si el servidor miente** (da a A una clave suya y a B otra), se pone en medio con C y con M, también con cita ciega. En el primer contacto nada lo impide; solo se **detecta** comparando.
- **¿Basta el número de seguridad de la llamada?**
  - **Sí, si se comparan las 60 cifras** (12 grupos de 16 bits = 192 bits [Código: `cripto.js`, `numeroSeguridad`]), en persona o de viva voz, reconociendo a la persona. El intermediario reenvía la voz real; cambiar las cifras en directo le exigiría voz sintética: difícil, no imposible.
  - **No, si se compara solo un trozo.** El intermediario genera claves hasta que coinciden unas pocas cifras: para 6 cifras le bastan unas 1 000 claves por lado (cálculo propio).
  - Un código corto dicho de viva voz solo es seguro con un compromiso previo, como el código corto (SAS) de ZRTP: «16 bits = una oportunidad entre 65 536», porque el atacante debe elegir sus claves antes de ver las de los demás ([RFC 6189](https://www.rfc-editor.org/rfc/rfc6189.html)).
  - **Ojo con el cambio de voz** [Código: `voz.js`]: si está activo, reconocer la voz ya no sirve para verificar.
  - Apple manda comparar su código «en persona, por FaceTime o por otra llamada segura» ([Apple](https://support.apple.com/en-us/118246)).
- **Para una persona mayor:**
  - «Verificar en persona»: escanear el QR, y el contacto queda en verde.
  - «Verificar por llamada»: un código corto con compromiso.
  - Un aviso grande si cambia la clave de cuenta (bloque 8).
- **Detección automática (futuro): transparencia de claves.**
  - Signal (11-ago-2026): un registro con auditores independientes (Cloudflare y Trail of Bits), y cada app comprueba sola su propio identificador ([Signal](https://signal.org/blog/automatic-key-verification/)).
  - WhatsApp tiene un directorio de claves auditable desde el 13-abr-2023 ([Meta](https://engineering.fb.com/2023/04/13/security/whatsapp-key-transparency/)).

## 4. Pérdida del teléfono o del icono
**Hechos**
- En el iPhone, borrar el icono borra todo (hecho 5).
- A la app de la pantalla de inicio no le afecta el borrado de 7 días de Safari: «no esperamos que se borren sus datos» ([WebKit](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)).
- En WebCrypto, «no exportable» solo impide que el código saque la clave. La especificación no garantiza que no quede en el disco, «posiblemente sin cifrar» ([W3C](https://www.w3.org/TR/WebCryptoAPI/)).
- Una clave no exportable no se puede copiar. Para poder recuperarla, la clave de cuenta tiene que nacer de algo que la persona guarda.

**Opciones**

| Opción | A favor | En contra |
|---|---|---|
| a) Número nuevo, sin recuperación | Lo más simple y honesto | A los 60, perder todos los contactos al cambiar de móvil es lo peor |
| b) **Hoja de rescate**: 12 palabras (128 bits + 4 de control, [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)) o un QR impreso | Ningún servidor puede abrirla. Session hace lo mismo con su frase ([Session](https://docs.getsession.org/session-network/session-protocol/account-restoration)) | El papel se pierde; estafa «dame tus palabras» |
| c) Copia en el servidor con un PIN corto | Cómoda | Sin hardware que limite los intentos, el servidor puede probar todos los PIN: no es honesto. Threema Safe exige una contraseña de 8 caracteres o más, con scrypt ([Threema](https://threema.com/assets/documents/cryptography_whitepaper.pdf)) |
| d) Llave de acceso (passkey) con PRF | Face ID; se sincroniza por el llavero; debería sobrevivir al icono (no lo probé). Funciona en iOS/iPadOS 18+ y en Android con el gestor de contraseñas de Google ([Corbado, ago-2026](https://www.corbado.com/blog/passkeys-prf-webauthn)) | Depende de Apple o Google y de la versión. Si funciona dentro de la app de la pantalla de inicio: no lo sé |

**Recomendación**
- (b) en el alta, en papel; y (d) cuando se haya probado.
- Decir la verdad: «Si pierdes el teléfono y la hoja, tu número se pierde para siempre».
- **Qué vuelve:** el número, la clave de cuenta y la lista de chats (una copia cifrada con la clave de la hoja, con salas y PSK, sin mensajes). Los mensajes antiguos no vuelven.
- Los contactos ven «Ana tiene teléfono nuevo» sin alarma roja, porque lo firma la cuenta, y el aparato perdido queda revocado.
- La app debe decir: «GUARDIANA nunca te pedirá esta hoja».

## 5. Varios aparatos: preparar hoy sin construir
1. **Separar cuenta y aparato desde ya:** número → clave de cuenta → lista firmada de aparatos `{id, firmaPub, acuerdoPub, kemPub, alta}`, con versión creciente. Hoy, con un solo aparato.
2. **Los chats son de la cuenta, no del aparato.** La sala y el PSK los conocen todos sus aparatos; el relé ya admite 8 por sala [Código]. La sesión va por pareja de aparatos: en WhatsApp cada aparato tiene su clave y el que envía cifra para cada uno ([Meta, 2021](https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/)).
3. **Enlace por QR (futuro).** El PC muestra un QR con su clave; el móvil lo escanea, lo firma con la cuenta, publica la lista nueva y le pasa, cifrada, la lista de chats. WhatsApp enlaza así hasta 4 aparatos y envía cifrado el historial reciente ([misma fuente](https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/)).
4. **Formato desde hoy:** `idAparato` y versión de protocolo en cabeceras y sobres. Nunca suponer «un aparato = una identidad».
5. **Revocar:** una lista nueva sin ese aparato y un aviso a los contactos.

## 6. Abuso y spam
**Con M, quedan:**
- crear números en masa (gratis, sin teléfono);
- dejar etiquetas en masa;
- un contacto ya aceptado que molesta;
- la estafa social.

**Límites propuestos** (míos; ajustarlos con datos):

| Qué | Límite |
|---|---|
| Altas de número | 5 al día por IP recortada. Una prueba de trabajo de ~10–30 s al crear (solo encarece algo la creación masiva). Los números nuevos, con la mitad de los límites durante 7 días |
| Consultas de clave | 30 por hora y 100 al día por conexión; 300 al día por IP recortada. Referencia: Signal permite 100 búsquedas de usuario de golpe y recupera 1 cada 15 min, ~96 al día ([código](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/limits/RateLimiters.java); la tasa es inferencia mía de [RateLimiterConfig](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/limits/RateLimiterConfig.java)) |
| Etiquetas (añadir un número) | 20 al día y 200 activas por IP recortada; caducan a los 30 días si la app no las renueva |
| Mensajes y llamadas | Solo entre parejas que se han añadido las dos |

**Bloquear, denunciar y frenar**
- **Bloquear:** la app retira su etiqueta y descarta lo que llegue; el otro no se entera.
- **Denunciar:** B puede mandar a GUARDIANA, si quiere, los mensajes firmados del otro. La firma prueba quién los envió sin abrir nada más.
- **Frenar a quien no recibe respuesta**, como prueba WhatsApp desde oct-2025: los mensajes sin respuesta cuentan contra un tope mensual ([TechCrunch](https://techcrunch.com/2025/10/17/whatsapp-will-curb-the-number-of-messages-people-and-businesses-can-send-without-a-response)).

**Qué hacen los demás**

| App | Identificador y medidas | Qué copiaría |
|---|---|---|
| Signal | Nombre de usuario de 3 a 32 caracteres que acaba en al menos 2 cifras. No hay directorio de búsqueda: hay que saber el nombre exacto. Los desconocidos llegan como solicitudes de mensaje ([Signal](https://support.signal.org/hc/en-us/articles/6712070553754-Phone-Number-Privacy-and-Usernames)) | Sin búsqueda; solicitudes; transparencia de claves |
| Threema | ID de 8 caracteres A–Z/0–9, al azar, asignado por el servidor; niveles rojo, naranja y verde ([whitepaper, 26-jun-2026](https://threema.com/assets/documents/cryptography_whitepaper.pdf)); «Bloquear desconocidos» | ID al azar, colores de verificación, bloquear desconocidos |
| Session | Account ID de 66 caracteres ([Session](https://getsession.org/session-id-vs-phone-numbers)); llamadas solo a contactos; enrutado cebolla que oculta la IP ([FAQ](https://getsession.org/faq)) | Llamadas solo entre contactos (no la longitud) |
| WhatsApp | Teléfono. Nombres de usuario de 3 a 35 caracteres, sin búsqueda, con «clave de usuario» opcional ([TechCrunch](https://techcrunch.com/2026/06/29/whatsapp-not-lets-you-reserve-usernames/)). «Bloquear mensajes de cuentas desconocidas» cuando superan un volumen alto ([Techloy](https://techloy.com/how-to-block-unknown-account-messages-on-whatsapp)). Tope de mensajes sin respuesta | La clave de usuario (el espíritu de M) y el tope sin respuesta |
| Telegram | Teléfono y nombre de usuario público con búsqueda. A quien hace spam lo limita a escribir solo a quien lo tiene guardado ([Telegram](https://telegram.org/faq_spam)) | Esa sanción; no la búsqueda pública |

## 7. Ley y nombre
**«Número» y telecomunicaciones**
- En Colombia, la CRC administra «los recursos de numeración, identificación de redes» (Ley 1341, art. 22, num. 13, citada en la [Res. CRC 7303/2024](https://www.crcom.gov.co/sites/default/files/normatividad/00007303.pdf)). Un número GUARDIANA no sale de ese plan ni es E.164.
- Si el nombre «número» crea por sí solo alguna obligación: **no lo sé** (hay que consultar a un abogado TIC). Lo que decide es el servicio, no el nombre:
  - En la UE, un servicio que no conecta con números de los planes nacionales es de comunicaciones interpersonales «independiente de la numeración» (EECC, art. 2.7). Si conectara, sería «basado en numeración» (art. 2.6), con más obligaciones ([Directiva 2018/1972](https://www.legislation.gov.uk/eudr/2018/1972/article/2/data.html)).
  - En Colombia, el Decreto 1704 de 2012 obliga a los «proveedores de redes y servicios de telecomunicaciones» a conservar los datos de sus suscriptores durante 5 años; un aparte figura como nulo ([MinTIC](https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_1704_2012.htm)). Si GUARDIANA cuenta como proveedor: **no lo sé**.
- Precedente: Telegram vende «números anónimos» que no sirven para recibir SMS ni llamadas ([TechCrunch, 7-dic-2022](https://techcrunch.com/2022/12/07/telegram-is-auctioning-phone-numbers-to-let-users-sign-up-to-the-service-without-any-sim)).

**Nombre: «Número GUARDIANA», siempre con la marca**
- No «código». A los mayores se les enseña que un código no se comparte: por ejemplo, el NCSC de Irlanda dice que el código de WhatsApp «nunca debe compartirse con nadie» ([NCSC](https://ncsc.gov.ie/pdfs/2408200156_WhatsApp_Scam_Advice.pdf)). Además, ya existe el código de 9 cifras de un solo uso.
- «ID» es poco claro a los 60 años.
- Nunca con «+» ni en 3-3-4.

**Datos personales**
- **Colombia.** Dato personal es «cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables» ([Ley 1581, art. 3](http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html)). El número, la clave pública y la suscripción push (más la IP del momento) se asocian a una persona: **sí son datos personales**. Obligan a:
  - pedir una autorización «previa, expresa e informada» (arts. 3 y 9);
  - cumplir los principios del art. 4 (finalidad, libertad, seguridad, confidencialidad…) y los deberes del art. 17 (seguridad, hábeas data);
  - tener una política de tratamiento y un aviso de privacidad;
  - transferir datos al extranjero solo a países con nivel adecuado (art. 26). Alemania y la UE están en la lista de la SIC ([Circular 005, 10-ago-2017](https://operaciones.colombiacompra.gov.co/sites/cce_public/files/cce_informe_seguimiento/superindustria-circularexterna-2017-n0000005_20170810_1.pdf)), así que vale un servidor de Hetzner en Alemania o Finlandia;
  - inscribir las bases en el Registro Nacional de Bases de Datos: con el Decreto 090 de 2018, solo las sociedades con activos de más de 100 000 UVT y las entidades públicas ([Asuntos Legales](https://www.asuntoslegales.com.co/analisis/catalina-herrera-von-norden-530696/cambios-en-el-registro-nacional-de-bases-de-datos-2596772)). Hay que confirmar si aplica.
- **UE (RGPD).**
  - Se aplica a quien ofrece servicios a personas en la UE (art. 3.2.a); la web ya está en alemán, francés, italiano… [Código: `i18n/`].
  - Obliga a nombrar un representante en la UE (art. 27), salvo tratamiento «ocasional» y sin riesgo; una mensajería no es ocasional ([art. 3](https://gdpr-info.eu/art-3-gdpr/), [art. 27](https://gdpr-info.eu/art-27-gdpr/)).
  - Un «identificador en línea» es dato personal ([art. 4](https://gdpr-info.eu/art-4-gdpr/)), y también lo seudonimizado si se puede atribuir con información adicional ([cons. 26](https://gdpr-info.eu/recitals/no-26/)).
  - Desde el 21-dic-2020, la Directiva ePrivacy se aplica a la mensajería: confidencialidad de las comunicaciones (art. 5) y datos de tráfico, que hay que borrar o anonimizar (art. 6) ([IAPP](https://iapp.org/news/a/new-european-electronic-communications-code-means-the-application-of-the-eprivacy-directive-to-otts)). «Quién busca a quién» es un dato de tráfico.
- **En la práctica:**
  - un aviso de privacidad corto y claro;
  - un botón «Borrar mi número», que borra la entrada (el número no se reasigna);
  - un registro de actividades;
  - una evaluación de impacto, recomendable (si es obligatoria: no lo verifiqué).

## 8. Pantallas (con tuteo, como la app actual; con M y, al final, con C)
1. **Alta (primer arranque)**
   - Título: «Te damos la bienvenida a GUARDIANA». Texto: «Vamos a crear tu número. Se crea en este teléfono y es tuyo para siempre.» Botón: **«Crear mi número»**.
   - «Tu número GUARDIANA es 4821 1790 3510.» Botones: **«Escuchar»**, **«Otro número»**, **«Me lo quedo»**.
   - «Tu hoja de rescate: si pierdes el teléfono, con ella recuperas tu número. Escríbela en papel y guárdala con tus documentos. GUARDIANA nunca te la pedirá.» Botones: **«Ya la escribí»** y **«Recordármelo mañana»**.
   - «Para que suene cuando te llamen, toca Permitir.» Botón: **«Activar avisos»**.
2. **Tu número** (siempre arriba): «Mi número GUARDIANA: 4821 1790 3510». Botones:
   - **«Escuchar»**;
   - **«Enviar mi número»**, que manda el texto «Mi número GUARDIANA es 4821 1790 3510. Añádeme y yo te añado.», sin enlace;
   - más adelante, **«Mostrar mi código QR»**.
3. **Llamar** (botón grande de inicio, en lugar de «Invitar a chat»)
   - Teclado grande del 0 al 9 y **«Borrar»**; el número se agrupa solo en 4-4-4.
   - Si falla la cifra Damm: «Ese número tiene una cifra equivocada. Revísalo.»
   - Si es válido: «¿Cómo se llama?» (el nombre que tú le pones) y el botón **«Añadir»**.
4. **Respuesta con M** (siempre igual, exista o no el número): «Listo. Cuando Ana añada tu número, podrán hablar. Dile tu número: 4821 1790 3510.» Botones: **«Enviar mi número»** y **«Volver»**.
5. **Aviso de pareja con M:** notificación «Ana te añadió. Ya pueden hablar.» En la app, los botones **«Llamar»**, **«Videollamada»** y **«Escribir»**.
6. **Espera con M:** en la lista aparece «Ana · esperando a que te añada» y, debajo, «Recuérdale tu número». Botones: **«Enviar mi número»** y **«Quitar»**. A los 30 días: «Ana todavía no te ha añadido.» Botones: **«Seguir esperando»** y **«Quitar»**.
7. **Mismo nombre:** «Ya tienes una Ana con otro número. Si te dijo "guarda mi nuevo número", llámala a su número de siempre antes de añadirla.» Botones: **«Cancelar»** (el principal) y **«Añadir igual»**.
8. **Cambio de clave**
   - Sin firma de la cuenta: «Atención: la seguridad de Ana cambió. Puede ser un teléfono nuevo o alguien que se hace pasar por ella. Llámala antes de seguir.» Botones: **«Ya la llamé, es ella»** y **«Bloquear»**.
   - Con firma de la cuenta: «Ana tiene teléfono nuevo.»
9. **Con C (si se eligiera)**
   - Solicitud entrante: «Alguien quiere hablar contigo. Número 4821 1790 3510. Dice llamarse "Ana". No está en tus contactos.» Botones: **«Aceptar»**, **«Rechazar»** y **«Bloquear y denunciar»**.
   - Espera de A: «Solicitud enviada. Si la acepta, se abrirá el chat.» Botón: **«Cancelar solicitud»**.

## 9. Cifras mundiales de llamadas y mensajes no deseados
«2 fuentes» = dos publicaciones distintas dan la misma cifra (la regla del dueño).

| Dato | Año | Fuentes | ¿2 fuentes? |
|---|---|---|---|
| EE. UU. (FTC): 3 millones de denuncias de fraude y 15 900 M USD perdidos | 2025 | [FTC, 25-mar-2026](https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-testifies-joint-economic-committee-agencys-efforts-combat-fraud) · [AARP, 16-abr-2026](https://www.aarp.org/money/scams-fraud/fbi-ftc-report-2025-losses.html) | sí |
| EE. UU. (FTC): 12 500 M USD; la llamada fue el 2.º medio de contacto más denunciado, tras el correo | 2024 | [FTC, 10-mar-2025](https://www.ftc.gov/news-events/news/press-releases/2025/03/new-ftc-data-show-big-jump-reported-losses-fraud-125-billion-2024) · AARP (cita los 12 500 M) | la cifra sí; el medio, 1 fuente |
| EE. UU., 60 años o más (FTC): 2 400 M USD denunciados (≈4 veces lo de 2020); coste real estimado de 10 100 a 81 500 M USD; pérdida mediana del fraude telefónico, 2 210 USD | 2024 | [FTC, 1-dic-2025](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-issues-annual-report-congress-agencys-actions-protect-older-adults) · [informe](https://www.ftc.gov/system/files/ftc_gov/pdf/P144400-OlderAdultsReportDec2025.pdf) | misma fuente (2 documentos) |
| EE. UU. (FBI IC3): 1 008 597 denuncias y 20 877 M USD; con 60 años o más, 201 266 denuncias y 7 748 M USD (+59 %) | 2025 | [IC3](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf) · [AARP](https://www.aarp.org/money/scams-fraud/fbi-ftc-report-2025-losses.html) | sí |
| EE. UU. (FBI IC3): fraude de centros de llamadas, más de 80 000 denuncias y más de 2 900 M USD | 2025 | [IC3](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf) | 1 |
| Mundo (GASA/Feedzai, 46 000 adultos en 42 mercados): el 57 % sufrió un intento de estafa en 12 meses y el 23 % perdió dinero; los intentos fueron más frecuentes en Sudamérica, África y Oceanía | 2025 | [GASA, 7-oct-2025](https://www.gasa.org/post/global-scams-on-the-rise-over-half-of-adults-worldwide-report-scam-encounters) · [Feedzai, 9-oct-2025](https://www.feedzai.com/blog/gasa-global-state-of-scams-report/) | sí |
| ~442 000 M USD perdidos en esos 42 países (estimación) | 2025 | [Feedzai](https://www.feedzai.com/blog/gasa-global-state-of-scams-report/) | 1 |
| WhatsApp eliminó más de 6,8 M de cuentas ligadas a centros de estafa (1.er semestre) | 2025 | [TechRepublic, 7-ago-2025](https://www.techrepublic.com/article/news-whatsapp-scams-meta/) · [The Daily Star, 9-ago-2025](https://www.thedailystar.net/tech-startup/news/whatsapp-banned-68-million-accounts-linked-scams-3958706) | sí |
| Investigadores comprobaron 3 546 M de cuentas de WhatsApp | 2025 | [NDSS 2026](https://arxiv.org/abs/2511.20252) | 1 |
| Reino Unido (Ofcom): 45 M de personas (el 82 % de los adultos) recibieron una llamada o un mensaje sospechoso en 3 meses; el 61 % de los mayores de 75 recibió una posible llamada de estafa | 2021 | [Ofcom, 20-oct-2021](https://www.ofcom.org.uk/news-centre/2021/45-million-people-targeted-by-scams) · [TechRadar, 21-oct-2021](https://www.techradar.com/news/millions-of-brits-were-targeted-with-scam-calls-and-texts-this-summer) | sí |
| EE. UU.: 55 048 M de llamadas automáticas | 2023 | [YouMail](https://robocallindex.com/history/time) | 1 |
| Brasil y Chile (Hiya): 28 llamadas basura por persona al mes; tasa de fraude del 21 % y del 25 % | 4.º trim. 2024 | [Hiya / Business Wire](https://www.businesswire.com/news/home/20250225398435/en) | 1 |
| Colombia (Truecaller): 10,1 llamadas no deseadas por usuario al mes, puesto 11 del mundo (Brasil, 1.º, con 32,9) | 2021 | [DPL News, 13-ene-2022](https://dplnews.com/?p=135034) | 1 |
| Colombia (Truecaller): 17,3 al mes, puesto 10 (Brasil, 45,6) | 2019 | [La República, 5-dic-2019](https://www.larepublica.co/globoeconomia/los-10-paises-donde-los-usuarios-reciben-mas-llamadas-no-deseadas-2940756) | 1 |
| Colombia (Asocapitales-DNP, con datos SIEDCO de la Policía): extorsión, de 13 869 casos (2024) a 13 428 (2025); el 48,8 % por teléfono en las capitales | 2024–25 | [El Universal, 20-oct-2026](https://www.eluniversal.com.co/colombia/2026/10/20/la-extorsion-se-disparo-un-1829-en-colombia-entre-2016-y-2024/) · [Asuntos Legales, 21-oct-2026](https://www.asuntoslegales.com.co/actualidad/a-extorsion-crecio-en-varias-capitales-pese-a-la-reduccion-de-casos-a-nivel-nacional-4507575) | sí |
| Colombia: «alrededor del 70 %» de las llamadas extorsivas podrían salir de las cárceles (estimación de la Dijín) | 2026 | [El Universal](https://www.eluniversal.com.co/colombia/2026/10/20/la-extorsion-se-disparo-un-1829-en-colombia-entre-2016-y-2024/) | 1 (estimación) |
| Colombia: 64 628 denuncias por estafas digitales (Centro Cibernético Policial, hasta el 3 de diciembre) | 2025 | [Noticias RCN](https://www.noticiasrcn.com/economia/recomendaciones-estafas-digitales-colombia-por-policia-967224) | 1 |
| Colombia: 62 299 denuncias por los tres delitos informáticos más denunciados (el 88 % del total); la Policía aconseja no contestar números desconocidos | 2025 | [Policía Nacional, 16-ene-2026](https://www.policia.gov.co/noticia/recomendaciones-prevencion-digital-para-evitar-ser-victimas-delitos-informaticos-en) | 1 |
| Colombia: más de 13 000 incidentes cibernéticos atendidos; más de 1 300 por suplantación (robo de WhatsApp, perfiles falsos) | 2025 | [El País, 31-dic-2025](https://www.elpais.com.co/colombia/cibercrimen-en-colombia-cierra-2025-con-13-mil-casos-alerta-por-modalidades-de-fraude-3146.html) | 1 |

**Lo que no hallé (no lo sé):**
- cifras recientes (2024–2026) de Truecaller para Colombia;
- pérdidas en pesos por llamadas en Colombia;
- datos de mayores de 60 años en Colombia.

**Publicable hoy con dos fuentes:**
- FTC 2025 y 2024;
- FBI IC3 2025, incluidos los mayores de 60;
- GASA: 57 % y 23 %;
- WhatsApp: 6,8 M de cuentas;
- Ofcom 2021;
- extorsión en Colombia 2024–2025.

## 10. Un número para siempre: amenazas, defensa y detección
Ordenado por impacto y esfuerzo. Nada es «100 % seguro».

| # | Amenaza | Mitigación real | Cómo se detecta | Impacto / esfuerzo |
|---|---|---|---|---|
| 1 | **El servidor entrega código alterado.** En una web, el servidor sirve el código en cada visita y podría dar uno malo a una sola persona | `huellas.txt`, que ya existe [Código], + anclaje: un Service Worker que solo acepte versiones firmadas con una clave que no esté en el servidor. Meta creó Code Verify porque una web «se sirve directamente, sin un tercero que revise el código» ([Meta, 2022](https://engineering.fb.com/2022/03/10/security/code-verify/)) | Comparar las huellas con el repositorio público; aviso «la app cambió a la versión X» | Muy alto / medio |
| 2 | **El servidor miente con las claves** | Clave de cuenta fijada la primera vez + aviso de cambio + QR verde. Futuro: un registro de claves auditado ([CONIKS, 2015](https://www.usenix.org/conference/usenixsecurity15/technical-sessions/presentation/melara); [IETF keytrans](https://datatracker.ietf.org/doc/draft-ietf-keytrans-protocol/); Signal, 2026; WhatsApp, 2023) | Números de seguridad distintos. Autovigilancia: la app consulta su propio número por otra conexión y compara. Pruebas del registro | Muy alto / bajo hoy; alto el registro |
| 3 | **El servidor como punto de vigilancia** (grafo, horas) y las órdenes judiciales | Cita ciega; directorio sin push; avisos sin salas; sin registros; contadores en memoria. Lo que no existe no se puede entregar | Desde fuera no se detecta: código abierto, auditoría e informe de transparencia | Alto / bajo-medio |
| 4 | **Vincular toda la actividad al número** | El número solo se usa en la cita. Los chats van por salas propias que se mudan. Nunca poner el número en el relé de chats, en los avisos ni en la analítica | No se detecta | Alto / bajo |
| 5 | **Avisos push.** Apple y Google ven cuándo llegan, a qué suscripción y el Topic. En dic-2023 el senador Wyden reveló que hay gobiernos que piden esos datos ([Android Authority](https://www.androidauthority.com/apple-google-push-notification-surveillance-3392252)); Apple pasó a exigir orden judicial ([Globe and Mail](https://arc-dev.theglobeandmail.com/business/technology/article-apple-now-requires-a-judges-consent-to-hand-over-push-notification)) | Topic al azar; aviso sin sala y de tamaño fijo; pocos avisos | No se detecta | Medio / bajo |
| 6 | **Robo del teléfono** (desbloqueado) | Bloqueo de la app con Face ID o huella (WebAuthn, desde iOS 14.5 según [firt.dev](https://firt.dev/notes/pwa-ios/)). Revocar el aparato con la hoja. Que la clave sea no exportable no garantiza nada en el disco ([W3C](https://www.w3.org/TR/WebCryptoAPI/)) | Lista de aparatos; aviso a los contactos | Alto / medio |
| 7 | **Análisis de tráfico** (operador, red, proveedor) | Relleno a tamaños fijos (ya existe en la sesión blindada [Código]); no enviar acuses visibles para el servidor; retrasos al azar en los avisos no urgentes. El remitente sellado, por sí solo, se rompe «en tan solo 5 mensajes» ([NDSS 2021](https://www.ndss-symposium.org/ndss-paper/improving-signals-sealed-sender/)) | No se detecta | Medio / medio |
| 8 | **Ordenadores cuánticos** («guardar hoy, descifrar mañana») | La sesión ya es híbrida con ML-KEM-768, como PQXDH de Signal ([2023](https://signal.org/blog/pqxdh/)). Faltan las firmas (añadir ML-DSA a la cuenta; ya está en la sesión blindada), la cita ECDH (se compensa mudando la sala en el primer encuentro) y los avisos. Para el NIST, ECDSA y ECDH quedan obsoletos después de 2030 y prohibidos después de 2035 ([IR 8547 final, 27-oct-2026](https://nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf)). En TLS, Caddy 2.10 ofrece x25519mlkem768 por defecto ([Caddy](https://github.com/caddyserver/caddy/releases/tag/v2.10.0)). Apple dice que iOS 26 lo anuncia en TLS ([Apple](https://support.apple.com/en-gb/122756)), pero no dice si Safari también: comprobarlo | Revisar qué grupo TLS negocia el iPhone | Medio / medio |
| 9 | **Ingeniería social** («guarda mi nuevo número», «dame tu hoja») | Aviso de mismo nombre; «GUARDIANA nunca te pedirá la hoja»; verificar en persona | El aviso en pantalla | Alto / bajo |

**Rotación de claves sin cambiar el número:** la clave de cuenta firma claves de aparato nuevas (cada año, o enseguida tras un robo) y los contactos las aceptan sin alarma. La clave de cuenta no cambia al recuperar, porque sale de la hoja. Si hubiera que cambiarla (por ejemplo, si roban la hoja), el cambio muestra el aviso grande a los contactos.

**Lo que queda sin cubrir:**
- un espía con privilegios del sistema, tipo Pegasus;
- quien vea toda la red a la vez;
- el primer contacto sin verificar;
- quien tenga tu teléfono desbloqueado;
- el código malo servido a una persona antes de que exista el anclaje.

## 11. ¿Una app web es más segura que una de tienda?
**La frase del dueño, tal cual, no es cierta.**
- La web también corre dentro del teléfono.
- Pegasus, una vez dentro, ve mensajes, contactos y fotos, hace capturas de pantalla y enciende la cámara y el micrófono. Uno de sus ataques empieza por «comprometer primero el navegador» ([Amnistía, 16-jul-2026](https://securitylab.amnesty.org/latest/2026/07/inside-pegasus-the-evolution-of-the-worlds-most-notorious-spyware/)).
- BLASTPASS entró sin un solo clic, por iMessage, en iOS 16.6 ([Citizen Lab, 2023](https://citizenlab.ca/2023/09/blastpass-nso-group-iphone-zero-click-zero-day-exploit-captured-in-the-wild/)).
- Un teclado de terceros con «acceso total» puede «acceder, recoger y transmitir lo que escribes», en cualquier app ([Apple, citado por TechCrunch](https://techcrunch.com/2014/10/04/everything-you-need-to-know-about-ios-8-keyboard-permissions-but-were-afraid-to-ask)).

**Ventajas reales de la web (PWA)**
1. No pasa por la tienda: Apple y Google no distribuyen ni revisan el código, ni pueden cambiarlo allí.
2. Tiene menos poder: solo usa lo que el navegador ofrece, y con permiso (cámara, micrófono, avisos).
3. Código verificable: `huellas.txt` publica la huella de cada archivo [Código]. Es la misma idea que Code Verify de Meta.
4. Está aislada: no comparte datos con Safari ([firt.dev](https://firt.dev/notes/pwa-ios/)), y al borrar el icono se borra todo.
5. Corre en WebKit, que en iOS es el motor de todas las apps que navegan (guía 2.5.6, salvo en la UE y Japón; [Apple](https://developer.apple.com/app-store/review/guidelines/)) y se actualiza con iOS.

**Límites honestos**
1. El servidor puede cambiar el código en cualquier visita, incluso para una sola persona ([Meta](https://engineering.fb.com/2022/03/10/security/code-verify/)). Una app de tienda pasa revisión y va firmada.
2. Claves: WebCrypto no promete nada sobre el disco ([W3C](https://www.w3.org/TR/WebCryptoAPI/)). Una app nativa puede guardarlas en el Secure Enclave, que está aislado del procesador principal y pensado para resistir aunque se comprometa el núcleo del sistema ([Apple](https://support.apple.com/guide/security/secure-enclave-sec59b0b31ff/web)).
3. Los avisos solo llegan con la app instalada y desde iOS 16.4 ([firt.dev](https://firt.dev/notes/pwa-ios/)).
4. La web es superficie de ataque: el modo de aislamiento de Apple bloquea «ciertas tecnologías web complejas» para frenar a los espías mercenarios ([Apple](https://support.apple.com/en-us/105120)).

**5 frases para el cliente**
1. «GUARDIANA funciona desde la web: no pasa por ninguna tienda y no te pide ver tus contactos ni tus fotos.»
2. «Tus mensajes se cifran en tu teléfono antes de salir: ni nosotros ni nadie en el camino puede leerlos.»
3. «Publicamos la huella de cada versión del código para que cualquiera compruebe que es la misma para todos.»
4. «Si borras el icono, todo desaparece de tu teléfono.»
5. «Ninguna app, web o de tienda, te protege si el teléfono ya está infectado: mantenlo actualizado.»

## 12. Elegir el número
**Coste de invertir la huella** `idn = PBKDF2-SHA256(número, sal fija, 100 000)` con una RTX 4090. Base: hashcat 6.2.6 da 8 865,7 kH/s con 999 iteraciones ([benchmark](https://gist.github.com/Chick3nman/32e662a5bb63bc4f51b847bb422222fd)), o sea, ~88 600 pruebas por segundo con 100 000 iteraciones (cálculo propio). Con sal fija, una sola pasada invierte **toda la base a la vez**.

| Número | 100 000 iteraciones | 600 000 iteraciones (lo que pide OWASP para contraseñas) |
|---|---|---|
| 11 cifras al azar (9·10^10) | 11,8 días | 70,6 días |
| Móvil colombiano (10^9) | 3,1 h | 18,8 h |
| Fechas (~3,7·10^6 variantes) | 41 s | 4 min |
| Un teléfono que ya conoces | 0,01 ms | 0,07 ms |

**Las tres opciones**

| Opción | Riesgos | Veredicto |
|---|---|---|
| (a) Escribir el número que quiera, con aviso de «ya está elegido» | La gente pondrá su teléfono, su cédula o su fecha: la huella se invierte en segundos u horas y nos daría su teléfono real. «Ya está elegido» revela que ese teléfono usa GUARDIANA. Los números «bonitos» se acapararían. Y lo peor, **suplantación**: registrar como número GUARDIANA el teléfono de un banco o del hijo de la víctima («es el mismo de siempre») | No |
| (b) La app propone uno al azar, con «Otro número» y «Elegir el mío» | «Otro número» es inofensivo: se genera en el teléfono y no consulta al servidor. «Elegir el mío» trae todos los riesgos de (a) | Sí, **sin** «Elegir el mío» |
| (c) Solo al azar | Ningún riesgo nuevo | Sí (equivale a b sin elegir) |

**Recomendación: (b) sin «Elegir el mío».**
- Si el número sale ocupado, la app pide otro sola, sin mostrar «ya está elegido».
- Añadir pimienta en el servidor ([OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)).
- Si el dueño insiste en dejar elegir:
  - prohibir repeticiones, secuencias, fechas y cualquier cosa con forma de teléfono;
  - permitir como máximo 3 comprobaciones de «ya está elegido» al día;
  - avisar: «No uses tu teléfono ni tu fecha: se puede averiguar».
- Respuesta honesta al miedo de «nos espían»: «Tu número se crea en tu teléfono. No es una llave: con él nadie lee tus mensajes ni te llama si tú no lo añades».

## 13. Cómo se pasan los números
**Lo que ya le dijiste al dueño es correcto.**
- Robar el número no da contacto (con M) ni lectura (el cifrado es de extremo a extremo).
- El riesgo es la **sustitución en el camino**: quien controla el canal cambia el número de cada uno por uno suyo. A y B lo añaden a él sin que nadie toque el servidor, y él reenvía todo. Solo se detecta comparando el número de seguridad completo o con un código con compromiso (bloque 3).

**Lo que falta**
1. **El QR debe llevar la huella o, mejor, la clave pública de la cuenta.**
   - Con la huella, el contacto queda en verde sin fiarse del servidor, como en Threema.
   - Con la clave entera, A ni siquiera consulta al servidor: menos metadatos.
   - Lector dentro de la app: getUserMedia funciona en iOS desde la versión 13 ([firt.dev](https://firt.dev/notes/pwa-ios/)). BarcodeDetector no está en iOS ([misma fuente](https://firt.dev/notes/pwa-ios/)), así que hace falta un decodificador en JavaScript. Si funciona igual dentro de la app de la pantalla de inicio: probarlo.
2. **Orden de más a menos seguro:**
   1. QR en persona;
   2. de viva voz por teléfono, sin el cambio de voz;
   3. por escrito, en un mensajero cifrado de extremo a extremo, y luego «Verificar»;
   4. SMS o correo, los más fáciles de falsificar: solo con verificación después.
3. **El enlace «Compartir mi número», aunque lleve `#`, es peor que el texto.**
   - En el iPhone abre Safari, que no comparte datos con la app, así que no añade nada por sí solo.
   - Acostumbra a tocar enlaces, que es la puerta de las webs falsas que imitan a GUARDIANA.
   - Lo que aportaría (sin erratas y con huella) ya lo dan el texto con Damm y el QR en persona.
   - Recomiendo texto sin enlace.
4. **Frase de una línea:** «Tu número no es secreto: dalo en persona o de viva voz, y si alguien te dice "guarda mi nuevo número", llámalo a su número de siempre antes de añadirlo.» (La estafa existe: [RCN](https://www.noticiasrcn.com/tecnologia/guarda-mi-nuevo-numero-la-nueva-estafa-que-pone-en-peligro-su-dinero-366715).)

## Recomendación para hoy
1. Número de 12 cifras: 11 al azar creadas en el teléfono + Damm, en 4-4-4, siempre como «Número GUARDIANA». Al servidor solo llega idn, con pimienta.
2. M con cita ciega: etiqueta = HKDF(ECDH(clave de cuenta, la del otro), idn ordenados, época). El servidor da una clave para cualquier número (real o de mentira), responde siempre igual y avisa cuando una etiqueta llega dos veces. Sin buzón ni solicitudes.
3. En el primer encuentro (con ML-KEM-768), los dos se mudan a una sala y un PSK nuevos al azar.
4. Clave de cuenta salida de la hoja de rescate, que firma la lista de aparatos (uno hoy). Aviso de cambio de clave; QR en persona = verificado.
5. Ya: Topic y aviso sin sala; directorio sin suscripción push; archivo de avisos sin salas.
6. Límites por conexión e IP recortada, solo en memoria; ningún registro de IP.

## Recomendación para el futuro
1. Registro de claves auditado por terceros, con comprobación automática del propio número (como Signal desde ago-2026).
2. Anclaje del código (solo versiones firmadas fuera del servidor) y firmas ML-DSA en la cuenta.
3. PC enlazado por QR con la misma cuenta, y recuperación con llave de acceso (PRF) y Face ID.
