# Ronda 48 · Comunicaciones de GUARDIANA (26 Oct 2026, 19:00 Bogotá) · revisión de seguridad y de lo que se dice en pantalla

Contexto para la agencia (ChatGPT, Gemini, Astra): GUARDIANA GROUP S.A.S. publica hoy «Comunicaciones», una app web (PC y móvil, sin instalar nada) de chat, llamadas de voz y vídeo y archivos entre dos navegadores. Pedimos una revisión honesta: (1) fallos del protocolo, (2) qué afirmaciones de pantalla son exactas y cuáles hay que matizar o quitar, (3) qué NO debemos prometer. Nada de marketing: solo lo que confirmen al menos dos voces se publica.

## Diseño (tal como está hecho)
- Identidad: par ECDSA P-256 (firma) + par ECDH P-256 (acuerdo), generados con Web Crypto en el navegador, guardados en IndexedDB como claves no exportables. Huella = SHA-256(pub firma ‖ pub acuerdo).
- Invitación: 32 bytes aleatorios en el fragmento del enlace (`#i=…`), que el navegador no envía al servidor. De la semilla: sala del relé = SHA-256("GUARDIANA sala\n" ‖ semilla) (el relé la ve) y clave de presentación = HKDF-SHA256(semilla, info "GUARDIANA presentación") (el relé no). La invitación vale para una persona: tras emparejar, cualquier otra identidad que entre con el enlace recibe «ya usada».
- Presentación: cada lado manda, sellado con AES-256-GCM bajo la clave de presentación, {pub firma, pub acuerdo, efímera ECDH P-256, época (8 bytes), resp (época a la que responde o ceros), nombre, firma ECDSA sobre (sala ‖ pubs ‖ efímera ‖ época ‖ resp)}. Roles: inicia quien tiene la huella menor; el otro solo responde. Sesión = HKDF-SHA256(DH(ef, ef) ‖ DH(id, ef) ‖ DH(ef, id), sal = sala, 64 bytes) → dos cadenas (una por sentido). Cada reencuentro (reconexión) crea una sesión nueva con efímeras nuevas.
- Mensajes: cadena simétrica (mk = HMAC(ck, 1), ck' = HMAC(ck, 2)), AES-256-GCM, nonce = número de mensaje, datos asociados = cabecera (tipo, id de sesión 8 bytes, n). Hasta 256 claves saltadas para desorden. Identificador de sesión = SHA-256(ef_A ‖ ef_B ordenadas)[0..8].
- Archivos: clave aleatoria de 32 bytes por archivo (viaja en el anuncio sellado), trozos de 192 KB sellados con AES-256-GCM, nonce = índice del trozo, datos asociados = (tipo, id de archivo 16 bytes, índice). Sin hash global: la integridad la da la autenticación de cada trozo y el número total declarado. El receptor escribe al disco según llegan (File System Access) o junta en memoria hasta 300 MB.
- Llamadas: WebRTC del navegador; oferta, respuesta y candidatos viajan dentro del canal sellado; `iceTransportPolicy: 'relay'` con coturn en el servidor de GUARDIANA (credenciales de 12 h firmadas con HMAC). Opus banda completa con FEC y RED; vídeo hasta 2,5 Mb/s.
- Relé: WebSocket en el mismo proceso que el motor de ZERO; salas de hasta 8 conexiones; solo reenvía tramas binarias; no guarda nada; sin buzón (los mensajes pendientes esperan en el equipo del remitente). Cupo de 8 MB/s por conexión.
- En reposo: mensajes cifrados en IndexedDB con una clave AES-GCM local no exportable (misma base de datos); los archivos recibidos en memoria se guardan como Blob sin cifrar en IndexedDB; «Destruir» borra todo en los dos lados.

## Lo que dice la pantalla (texto a revisar)
1. «Cifrado de extremo a extremo en tu navegador. Nada se guarda en servidores.»
2. «El relé de GUARDIANA solo pasa bytes que no puede leer y no guarda nada.»
3. «Todo lo que hace falta viaja tras «#», que los navegadores no envían a ningún servidor.»
4. «AES-256-GCM con una clave distinta por mensaje; la sesión se renueva cada vez que os encontráis (ECDH P-256 con firma ECDSA).»
5. «Si los dos veis el mismo número (por teléfono o en persona), nadie se ha puesto en medio.»
6. «Hasta que comprobéis el número, confías en que el enlace llegó a la persona correcta.»
7. Llamadas: «Por el relé, cifradas entre los dos navegadores; ninguno ve la dirección del otro.»
8. Términos: «Ningún cifrado protege un equipo ya comprometido, y esta versión no es poscuántica.»

## Preguntas
A. ¿Algún fallo real en el acuerdo de sesión (triple DH con firmas ECDSA, roles por huella, épocas) o en la cadena simétrica (sin ratchet DH dentro de la sesión)? ¿Qué cambiarías primero?
B. ¿Es correcto decir «de extremo a extremo» para las llamadas si la huella DTLS viaja por el canal sellado y el tráfico pasa por coturn?
C. ¿Qué frase de la lista 1–8 no es exacta o promete de más? Propón la redacción honesta en español, corta.
D. ¿Qué límites hay que decir explícitamente (metadatos que ve el relé, pestaña abierta en los dos lados, un navegador = una identidad, sin poscuántico, archivos en IndexedDB)?
