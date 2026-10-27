Ronda 68 · GUARDIANA · Comunicaciones: ver el viaje del archivo en directo (real y medible) y elegir por dónde viaja (27 Oct 2026). Máximo razonamiento, investigación a fondo.

Eres parte de la agencia de GUARDIANA (empresa colombiana de privacidad; ZERO es su navegador remoto, Comunicaciones su chat encriptado y NÚCLEO su guía). Responde en español, concreto, en bloques cortos y numerados. No inventes cifras, funciones ni estudios: fuente oficial o «no lo sé». Nada de promesas absolutas. Fuentes prohibidas: submarinecablemap.com, TeleGeography y PeeringDB.

**El dueño (17:45–17:46):**
- «En Comunicaciones, cuando una persona envíe documentos sensibles, debe ser una experiencia que no haga otra aplicación.»
- «A la derecha, una pantalla en formato vídeo donde midamos lo grande que es el archivo, cuánto falta, cuándo sale, por dónde se está enviando: por cable terrestre, cable submarino o satélite; dónde llega, dónde se recibe y lo que hay entre medio. Que vayamos verificando la distancia por donde va, como en un viaje 3D.»
- «Qué detalles técnicos: obstrucciones, filtros, cambios de red, un ataque o una zona más complicada.»
- «Una estrategia de fuegos artificiales para que no sepan exactamente por dónde va. Multicanal en vez de un canal, para que no puedan descifrar el mensaje entero.»
- «Una experiencia visual que a la vez sea real y medible, con muchos datos. Que la persona sienta seguridad y esté informada en todo momento. Así podemos cobrar una suscripción más cara: vamos a ser los número uno en envío de datos comprometidos entre empresas.»
- «¿Podemos elegir la forma y por dónde vamos a viajar, para evitar países o zonas que ya han sido objeto de robo de datos? Quiero una investigación profunda sobre esto.»

**Qué es Comunicaciones hoy (hechos):**
- Chat, llamadas y archivos encriptados de extremo a extremo en el navegador. Intercambio híbrido ML-KEM-768 + ECDH P-256; código de 9 cifras para unirse.
- WebRTC: directo entre los dos cuando se puede; si no, por un relé TURN en nuestros servidores (hoy dos: Europa y América). El relé no guarda nada.
- En la web ya hay un planeta (Órbita) con cables, centros de datos y satélites, y medidas reales de ida y vuelta desde el navegador hasta centros de datos. Avisa de que el cable exacto no se conoce desde fuera de la red.

LO QUE TE PIDO:

A) **Qué se puede medir de verdad durante un envío.**
- Desde el navegador (WebRTC getStats y la propia transferencia): tamaño, progreso, velocidad, tiempo restante, ida y vuelta (RTT), pérdida, variación, directo o por relé, tipo de red, cambios de red y reinicios de ICE.
- Desde nuestro relé:
  - traceroute o MTR hacia cada extremo;
  - redes (ASN) y países de cada salto;
  - fuentes y licencias para uso comercial: RIPEstat, RIPE IPmap, RIPE Atlas, MaxMind GeoLite2, IP2Location LITE, CAIDA.
- Inferencias:
  - satélite: ¿se puede saber por la red (p. ej., Starlink)?
  - cruce de océano por latencia (la luz en fibra, unos 200 km por milisegundo).
- Qué NO se puede saber (el cable exacto) y cómo decirlo con honradez.

B) **Elegir por dónde viaja y evitar países.** Qué es posible hoy, qué cuesta y qué podríamos afirmar:
- relés propios en países elegidos (red superpuesta);
- Tor con exclusión de países;
- SCION (redes que eligen el camino, geovallas; Secure Swiss Finance Network);
- redes troncales privadas de nubes; líneas dedicadas;
- investigación: Alibi Routing (SIGCOMM 2015) y DeTor (USENIX Security 2017), que prueban con la velocidad de la luz que un paquete no pasó por una zona.
- ¿Qué podría hacer GUARDIANA ya y qué después? Solo afirmar «no ha pasado por X» si se puede demostrar.

C) **Multicanal y «fuegos artificiales».**
- Partir el archivo en partes (XOR o Shamir) por relés o caminos distintos, para que ninguno lleve el todo.
- Tráfico señuelo, relleno y flujos falsos.
- Valor real frente a teatro, coste en ancho de banda, y límites: la primera y la última milla son comunes, el cifrado de extremo a extremo ya protege el contenido, y quedan los metadatos.

D) **Ataques y anomalías que podríamos detectar y enseñar con honradez:**
- intermediario (huella o número de seguridad distintos);
- fallos de integridad;
- cambios de ruta: secuestro BGP (RPKI inválido, salto brusco de latencia, paso por un país inesperado);
- estrangulamiento o inspección;
- qué no afirmar.

E) **La experiencia:** un panel lateral «en directo», como un viaje en 3D.
- Qué enseñar y con qué etiquetas honradas (medido / estimado / ilustrativo).
- Que lo entiendan un profesional de 60 años y una tesorera.
- Qué la haría valer una suscripción más cara.
- En el móvil.

F) **Producto y precio:**
- Un plan superior para empresas: qué tendría de único en el mundo y qué sería humo.
- Costes: relés en varios países, ancho de banda, medición.
- Fases, en días y semanas.

G) **Ley, en corto:** medir y enseñar la IP o la ruta del otro (datos personales; Ley 1581 y RGPD), consentimiento, y si hay algo de control de exportación por el cifrado.
