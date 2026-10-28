Ronda 70 · GUARDIANA · Comunicaciones: la «Sesión blindada», un modo de pago por horas que debe ser lo máximo en seguridad, privacidad y velocidad (27 Oct 2026). Máximo razonamiento, investigación a fondo.

Eres parte de la agencia de GUARDIANA (empresa colombiana de privacidad; ZERO es su navegador remoto, Comunicaciones su chat encriptado y NÚCLEO su guía). Responde en español, concreto, en bloques cortos y numerados. No inventes cifras, funciones ni estudios: fuente oficial o «no lo sé». Nada de promesas absolutas. Fuentes prohibidas: submarinecablemap.com, TeleGeography y PeeringDB.

**El dueño (21:02–22:06):**
- «¿O ponemos esa sección de pago por horas? Siempre y cuando podamos mejorar la privacidad y elevar la seguridad aún más.»
- «Por ejemplo 10 dólares la hora: un servicio caro pero muy seguro.»
- «¿Podemos mejorar la velocidad del envío activando más relés? Si el cliente paga 20 dólares la hora y nosotros gastamos 5 en aumentar la velocidad al máximo, el cliente gana y nosotros también.»
- «La gente va a pagar entre 10 y 20 dólares por hora: tenemos que estar a la altura de ese precio y de los certificados de que todo ha llegado correctamente; tienen que llevar bastantes datos.»
- «La blindada debe ser de la máxima. ¿Podemos superarla aún más?»
- «Tenéis que pensar que este servicio lo van a utilizar empresas americanas: tenéis que estar a la altura.» (22:05)
- «Esto lo van a utilizar empresas de primer nivel a nivel mundial: tenéis que estar a la altura de lo que vais a desarrollar.» (22:06)

**Qué es Comunicaciones hoy (hechos):**
- Chat y archivos entre dos navegadores, encriptados de extremo a extremo. Identidad de cada equipo: ECDSA P-256 + ECDH P-256, creadas en el navegador y no exportables.
- Sesión: tres acuerdos ECDH P-256 + ML-KEM-768 (híbrido postcuántico) + el secreto de la invitación, con HKDF-SHA-256; una clave distinta por mensaje (cadena HMAC-SHA-256).
- Archivos: fragmentos de 192 KB, cada uno con AES-256-GCM y una clave propia del archivo.
- Para unirse: un código de 9 cifras (10 minutos, un solo uso) y un número de seguridad de 60 cifras para comprobar la identidad.
- Transporte: WebSocket con TLS a un relé de GUARDIANA (Núremberg). Hay otro en Miami que aún no se usa para esto, porque los relés no se enlazan entre sí. El relé ve la IP, la sala y el volumen; no guarda nada; limita a 8 MB/s por conexión.
- Nuevo hoy:
  - el viaje del archivo en directo: mapa con lo medido, lo estimado y lo ilustrativo;
  - un comprobante de custodia digital firmado por los dos equipos: SHA-256 del archivo calculado en los dos lados, tipo real por el contenido, tiempos, velocidades, latencias, cronología e identidades. Se verifica en la web y se descarga en PDF y en .json.

**La propuesta de Claude para la blindada (superadla):**
1. Relé dedicado solo para esa sesión, sin límite de velocidad, en el país que elija el cliente y destruido al terminar.
2. Doble salto por dos relés en países distintos: ningún servidor ve a la vez las dos IP.
3. Tamaño y ritmo ocultos: relleno y tráfico constante.
4. Identidad obligatoria: no se envía nada hasta comprobar el número de seguridad; contraseña de sesión opcional como segunda llave.
5. Comprobante firmado de cada archivo.

LO QUE TE PIDO:

A) **Lo que falta para que sea la máxima en seguridad y privacidad, de verdad y medible.** Por ejemplo:
- firmas postcuánticas ML-DSA;
- claves en hardware (passkeys, WebAuthn);
- protección del código que se sirve al navegador;
- sellos de tiempo de terceros;
- borrado verificable;
- auditoría externa.
Para cada idea: qué aporta, qué cuesta y qué NO se puede prometer.

B) **Velocidad:** varios relés en paralelo (multicamino), regiones cercanas y sin límite. Cuánto se gana de verdad y cuánto cuesta por hora (Hetzner, Vultr, ancho de banda).

C) **Metadatos:** qué sigue viendo cada parte (relé, proveedor de internet, navegador, sistema) y cómo reducirlo. ¿Valen la pena aquí Tor o las redes de mezcla?

D) **El comprobante ante un tercero** (abogado, auditor, juez) en Colombia, la UE y EE. UU.:
- qué debe llevar;
- sello de tiempo cualificado (RFC 3161, eIDAS), Ley 527 de 1999, e-discovery;
- qué podemos afirmar y qué no.

E) **Producto:**
- qué haría la blindada única en el mundo a 10–20 dólares la hora y qué sería humo;
- a quién vendérsela primero;
- fases, en días y semanas.

F) **Empresas de primer nivel en todo el mundo** (el dueño, 22:05–22:06). Qué exigirá su departamento de compras y de seguridad antes de pagar, qué podemos cumplir ya, qué después y cuándo:
- **Certificaciones y auditorías:** SOC 2 tipo II, ISO/IEC 27001, pruebas de intrusión externas y programa de recompensas por fallos.
- **Criptografía validada FIPS 140-3:** ¿cuenta la del navegador (Web Crypto)? ¿Qué pasa con ML-KEM-768 en JavaScript?
- **EE. UU.:** HIPAA (acuerdo BAA), FINRA y SEC 17a-4, GLBA, CCPA/CPRA, y las Federal Rules of Evidence 901 y 902(13)/(14) para el comprobante.
- **UE y Reino Unido:** RGPD (contrato de encargado), eIDAS (sellos de tiempo y sellos cualificados), NIS2 y DORA.
- **Resto del mundo:** residencia de datos y relés por país (EE. UU., UE, Suiza, Singapur…).
- **Lo que piden las grandes empresas:** inicio de sesión corporativo (SAML/OIDC, SCIM), consola de administración, registros de auditoría exportables, claves del propio cliente (BYOK/HYOK), acuerdo de nivel de servicio, cuestionarios de seguridad (SIG, CAIQ) y seguro de responsabilidad.
