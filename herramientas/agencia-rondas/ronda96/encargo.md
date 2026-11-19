RONDA 96 · Elixire · Encargo a la agencia (19 nov 2026, 11:45)

Responded en español, con tono de agencia y precisión. Cada afirmación de seguridad o de hechos, con fuente oficial y fecha. Sin promesas absolutas. No usar «auditada», «certificada», «conformidad CNSA 2.0» ni «anónima».

CONTEXTO (lo que ya sabéis de la ronda 95)
Elixire es una web (www.house1718.com) con chat, archivos y, más adelante, videollamada, encriptados de extremo a extremo en el navegador. El motor de partida es Ultra: ML-KEM-1024 + ECDH P-384 con HKDF-SHA-384; firmas ML-DSA-87 + ECDSA P-384; AES-256-GCM; clave distinta por mensaje (cadena HMAC-SHA-384) y nuevo acuerdo cada 5 minutos; código de 16 símbolos que se da por otro canal; cuatro palabras comprometidas antes del intercambio; tramas de 1 KB a ritmo fijo; nada guardado. Tenemos relés propios en Miami, Núremberg y Finlandia. Servicio de pago; la prueba gratuita será una videollamada de hasta 3 minutos.

TRES PREGUNTAS DEL DUEÑO

1. Sin internet. Si las dos personas están en la misma ciudad o el mismo país, ¿hay alguna tecnología que no pase por internet y sea más segura para hablar en tiempo real (texto y vídeo)? Radio de largo alcance (LoRa y similares), Bluetooth o wifi directo, fibra privada, enlaces de microondas o láser entre edificios, satélite, distribución cuántica de claves (QKD) por fibra urbana. ¿Qué gana y qué pierde cada una frente a internet con encriptado de extremo a extremo? ¿Alguna tiene sentido para Elixire? Decidlo sin rodeos aunque la respuesta sea «no».

2. El máximo nivel actual. ¿Qué usan hoy los sistemas militares y de inteligencia (Departamento de Defensa, NSA, CIA; OTAN y Europa si aplica) para proteger comunicaciones secretas? Algoritmos (CNSA 2.0 y lo que haya clasificado, si se sabe algo público), arquitectura (por ejemplo, dos capas independientes del programa CSfC), equipos, redes y procedimientos. ¿Dónde está Elixire frente a eso y qué nos falta de verdad?

3. Algo nuevo y mucho más seguro, sin copiar. El dueño no quiere copiar: quiere crear algo novedoso que sea mucho más seguro. Sabemos que inventar un cifrado nuevo nos haría más débiles (SIKE cayó en 2022). Por eso os pedimos lo novedoso en el diseño, con piezas probadas: el «Protocolo Elixire». Evaluad estas ideas, proponed las vuestras y decid cuáles suben la seguridad de verdad y cuáles solo añaden complejidad:
   a) Reparto por varios caminos: cada trama se parte en fragmentos (reparto de secretos XOR o Shamir) que viajan por relés distintos (Miami, Núremberg, Finlandia). Quien grabe un solo relé o un solo cable solo ve fragmentos al azar, aunque algún día rompa el encriptado.
   b) Mezclar en la clave de sesión un secreto que nunca pasa por el relé (derivado del código que se da por otro canal).
   c) Dos capas independientes, una dentro de otra, con familias de algoritmos e implementaciones distintas (como pide CSfC).
   d) Una tercera familia poscuántica en el acuerdo de claves (basada en códigos: Classic McEliece o HQC) junto a ML-KEM y ECDH.
   e) Renovación poscuántica continua (trinquete) y aviso inmediato de cualquier cambio de clave.
   f) Videollamada: prueba de vida al azar ligada a la clave (el reto lo firma el equipo verificado).
   Para cada una: qué ataque real frena, coste en un navegador, riesgo de implementación y si la recomendáis. Al final, la especificación que recomendáis para el Protocolo Elixire, en orden de construcción, y qué podemos decir públicamente sin exagerar.

RESTRICCIONES
En el navegador, sin instalar nada. No construimos una red de dos saltos ni instalación propia (OnPrem). Nada que no podamos implementar y probar bien. Honestidad total con los límites: un equipo infectado ve la pantalla; la web la entrega un servidor.
