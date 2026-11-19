RONDA 95 · GUARDIANA GROUP S.A.S. · Encargo a la agencia (19 nov 2026)

Responded en español, con tono de agencia y precisión. Cada afirmación de seguridad o de hechos, con fuente oficial y fecha. Sin promesas absolutas. No usar «auditada», «certificada», «conformidad CNSA 2.0» ni «anónima».

CONTEXTO
Vamos a publicar una web nueva llamada «Elixir» (en www.house1718.com). Es solo un chat encriptado de extremo a extremo en el navegador: texto y envío de documentos y archivos. Nada más: sin voz, sin vídeo, sin audios, sin llamadas. Al entrar, solo dos botones: «Tengo un código» y «Crear un código». Dos modalidades, con precios distintos: CRISTALE y ELIXIR.

• CRISTALE (personas). Es la tecnología Ultra que ya funciona en GUARDIANA Comunicaciones: acuerdo de claves híbrido ML-KEM-1024 + ECDH P-384 (HKDF-SHA-384); firmas ML-DSA-87 + ECDSA P-384; invitación por código de 16 símbolos (80 bits) o por enlace de 256 bits que no pasa por el servidor; verificación mutua obligatoria con cuatro palabras comprometidas antes del intercambio (quien se ponga en medio tendría que acertarlas a ciegas); alarma y borrado si la identidad cambia a mitad; identidad nueva en cada sesión; renovación de claves cada 5 minutos; tramas de 1 KB a ritmo fijo con relleno mientras los dos están conectados; nada se guarda (solo memoria: al cerrar, desaparece); sin buzón en el relé; nombres de archivo neutros; acuses negables y comprobante firmado opcional. Librería: @noble/post-quantum 0.7.1 en JavaScript (sin auditoría independiente). El relé (servidor nuestro en Núremberg) solo ve la sala y bytes cifrados.

• ELIXIR (empresas: despachos de abogados con sus clientes, clínicas, bancos de primer orden, dos empresas entre sí; documentación muy privada). Tiene que ser lo más avanzado que podamos construir hoy en un navegador, y algo NUEVO más allá de «postcuántico».

El dueño lo resume así: que una persona pueda hablar con otra y que nadie pueda robar nada; y si alguien lo intenta, que quede detectado. Le preocupa el software espía comercial (Pegasus, de NSO Group, vendido a gobiernos; casos en España) y la vigilancia masiva que reveló Snowden.

RESTRICCIONES
Solo chat y archivos. En el navegador, sin instalar nada. No construimos una red de dos saltos ni instalación propia (OnPrem). Nada que no podamos implementar y probar bien. Honestidad total con los límites: un equipo infectado ve la pantalla; la web la entrega un servidor.

PREGUNTAS

1. ELIXIR. Proponed el diseño concreto. Evaluad cada idea por valor real, riesgo y coste; decid sí o no, con el porqué:
 a) KEM triple de familias matemáticas distintas: curva (X25519 o P-384) + retículos (ML-KEM-1024) + códigos (HQC, elegido por el NIST en marzo de 2025, o Classic McEliece). ¿Merece la pena? ¿Qué implementación en JS o WASM es seria hoy?
 b) Firmas de identidad también con SLH-DSA (FIPS 205, basada solo en funciones hash), además de ML-DSA-87 + ECDSA.
 c) Trinquete por mensaje (secreto hacia delante en cada mensaje) + trinquete postcuántico periódico (en la línea del SPQR de Signal, octubre de 2025).
 d) Cifrado en cascada AES-256-GCM + XChaCha20-Poly1305 con claves independientes.
 e) El código de invitación como contraseña de un PAKE (CPace u OPAQUE), para que interceptar el código no permita atacar fuera de línea; o la invitación en dos mitades por dos canales distintos.
 f) Antisuplantación. Hoy: palabras comprometidas + verificación mutua obligatoria + alarma si cambia la identidad. Para Elixir: ¿libreta de contactos verificados con claves fijadas (si vuelve con otras claves, bloqueo sin «aceptar igualmente», como el programa GUARDIANA)? ¿Más palabras? ¿Qué más?
 g) Documentos: limpieza local de metadatos (PDF, Office, imágenes) antes de enviar; huella de cada documento; acta de entrega firmada por los dos equipos (útil a abogados); visor sin descarga (sabiendo que no impide una foto a la pantalla).
 h) Integridad de la propia web: SRI, CSP estricta, huellas publicadas en varios sitios, página de verificación. ¿Algo mejor y honesto?
 i) Tráfico: ¿qué añadir a las tramas fijas de Cristale para que tampoco se sepa cuándo ni cuánto se escribe o se envía (archivos incluidos)?
 j) Detección: qué intentos de robo puede DETECTAR el chat y avisar en pantalla (alguien en medio, código usado por otro, tramas alteradas, borradas, repetidas o reordenadas, un tercero en la sala, cambio de claves, página alterada…), y cuáles no puede detectar (equipo infectado). Diseño concreto del aviso.
 k) Cualquier idea mejor que no esté aquí.
 Y proponed la frase de una línea que distingue Elixir de Cristale.

2. COMPARACIÓN (tabla): WhatsApp, Telegram, Signal, iMessage, Threema y, si procede, Wire, Session y SimpleX, frente a Cristale y Elixir. Filas: cifrado de extremo a extremo por defecto; postcuántico (cuál y desde cuándo); metadatos que guarda el servidor; teléfono o cuenta obligatorios; copias en la nube; verificación de identidad; código abierto; qué queda guardado en el dispositivo. Cada celda de los demás, con fuente oficial y fecha. Marcad las celdas dudosas.

3. APARTADO DE ESPIONAJE (proponed 3 nombres). Explicarlo a una persona sin conocimientos, en tono solemne pero muy fácil, con analogías sencillas:
 a) Cómo se puede escuchar una llamada o leer un SMS entre operadoras (por ejemplo, de Vodafone a Orange): por qué la red telefónica no cifra de extremo a extremo; SS7 y Diameter; sistemas de interceptación legal atacados (Salt Typhoon, 2024); falsas antenas (IMSI catchers) y bajada a 2G; duplicado de SIM. Solo hechos con fuente.
 b) Cómo funciona un hackeo de comunicaciones, paso a paso: interceptar por el camino; entrar en el teléfono (software espía como Pegasus, incluso sin clic; casos documentados por Citizen Lab y Amnistía); las copias en la nube; la vigilancia masiva (Snowden, 2013); el engaño y la suplantación (también con voz clonada).
 c) Por qué nosotros: qué defiende Cristale, qué defiende Elixir y qué NO puede defender ninguna herramienta. Recordad: no tenemos llamadas, solo chat.
 Proponed el texto final en español: corto, solemne, claro.

FORMATO: secciones numeradas; tablas cuando ayuden; al final, lista de fuentes con URL y fecha.
