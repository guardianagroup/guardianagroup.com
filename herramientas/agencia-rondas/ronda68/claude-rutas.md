# Ronda 68 · Claude (voz propia, fuentes primarias) · medir el viaje de un archivo y elegir o demostrar la ruta

27 Oct 2026, 18:00–18:35 (Bogotá). Investigación independiente, sin ver las respuestas de Gemini y ChatGPT. «confirmado» = leído en la fuente; «no verificado» = no se pudo confirmar.

## 1. Lo que mide el navegador durante la transferencia (WebRTC getStats)

1. **Campos del par de candidatos ICE** (W3C webrtc-stats): `bytesSent`/`bytesReceived`, `currentRoundTripTime` (el último RTT de las comprobaciones STUN), `totalRoundTripTime`/`responsesReceived` y `availableOutgoingBitrate` (solo si el control de congestión lo calcula). Confirmado: https://www.w3.org/TR/webrtc-stats/
2. **Soporte (Chrome / Firefox / Safari, según los datos de compatibilidad de MDN):**
   - bytes: 58 / 56 / 11, sirven en los tres;
   - `currentRoundTripTime`: 71 / 142 / Safari lo retiró en 16.2;
   - `totalRoundTripTime`/`responsesReceived`: 71 / 142 / 11; con ellos se calcula un RTT medio que vale en todos;
   - `availableOutgoingBitrate`: solo Chrome.

   Confirmado: https://github.com/mdn/browser-compat-data
3. **Tipo de candidato** (`host`/`srflx`/`prflx`/`relay`): 80 / 27 / 12.1; `relay` = por el servidor TURN. Confirmado (MDN `RTCIceCandidate/type`).
4. **`networkType`:** retirado por privacidad (W3C). No construir sobre él.
5. **Cambios de red:**
   - `restartIce()`;
   - `selectedCandidatePairChanges` (80 / 155 / no);
   - `selectedCandidatePairId` (80 / 153 / 13.1);
   - el evento `selectedcandidatepairchange` (75 / 154 / 16.4);
   - `iceconnectionstatechange` (los tres).

   Confirmado.
6. **Progreso del archivo:** `RTCDataChannelStats.bytesSent` (80 / 79 / 13.1) y `bufferedAmount` (los tres). Confirmado.

## 2. Medir la ruta desde nuestro relé hasta cada usuario

1. **mtr** (GPL-2.0) muestra el ASN de cada salto preguntando a Team Cymru: eso envía las IPs de los usuarios a un tercero. Confirmado: https://github.com/traviscross/mtr. Los términos de Team Cymru: no verificado.
2. **Paris traceroute:** el traceroute clásico inventa bucles y enlaces cuando la red reparte la carga; Paris traceroute lo evita. Confirmado: https://arxiv.org/abs/0904.2733
3. **Solo se ve la ida:** el traceroute no da la vuelta, y el 88–98 % de las rutas son asimétricas. Confirmado: https://web.eecs.umich.edu/~harshavm/papers/nsdi10.pdf
4. **País de los routers:** las bases IP2Location-Lite y MaxMind aciertan el país de un router el 77,5–78,6 % de las veces; «the databases are not reliable for geolocating routers» (CAIDA, 2017). Confirmado.
5. **Licencias para un producto de pago:**
   - **RIPEstat Data API: no, sin permiso escrito** (prohíbe «paid services»). Confirmado.
   - **RIPE IPmap: no, sin permiso escrito.** Confirmado.
   - **RIPE Atlas: sí, con condiciones.** Permiso comercial por defecto y revocable, con atribución, pero las medidas se hacen públicas: solo vale para medir infraestructura propia, nunca IPs de usuarios. Confirmado: https://atlas.ripe.net/docs/commercial-use
   - **MaxMind GeoLite: ambiguo.** El EULA habla de «internal business purposes» y un artículo de soporte exige licencia de redistribución comercial. Hay que pedírselo por escrito. Ambigüedad confirmada.
   - **IP2Location LITE: sí, con atribución** (CC BY-SA 4.0, «free for personal or commercial use with attribution»). Confirmado.
   - **CAIDA: no, sin licencia** (uso no lucrativo o de prueba interna). Confirmado.

## 3. Satélite y cruce de océanos

1. **AS14593 = SPACEX-STARLINK.** Confirmado vía CAIDA AS Rank; el registro de ARIN no se pudo consultar. Otros ASN de Starlink: no verificado.
2. **La latencia no delata a Starlink:** su mediana en hora pico en EE. UU. es de unos 33 ms (Starlink). Se detecta por la red (ASN), no por el RTT. Confirmado.
3. **Física (ITU-T G.114):**
   - fibra: 5 µs/km (200 km/ms), es decir, como mínimo ~1 ms de RTT por cada 100 km en línea recta;
   - satélite geoestacionario: 260 ms por sentido, solo el tramo espacial, es decir, RTT ≥ ~520 ms.

   La latencia pone un límite de distancia; no dice el medio ni el cable. Confirmado.

## 4. Elegir o demostrar la ruta

1. **SCION** (ETH Zúrich): los extremos eligen el camino entre redes. Sus especificaciones aún no son RFC. Confirmado.
2. **SSFN:**
   - el Banco Nacional Suizo y SIX la lanzaron el 15-jul-2021 (con Swisscom, Sunrise, SWITCH y Anapaya), y tiene más de 100 participantes;
   - sustituyó a Finance IPNet para los pagos SIC a finales de junio de 2024.

   Confirmado.
3. **Acceso a SCION:**
   - proveedores en la lista de la SCION Association: Swisscom, Init7, Colt, BT, AWS, Azure…;
   - Anapaya EDGE «Lite» es gratis; el resto, con precio a consultar;
   - los navegadores necesitan una extensión o una pasarela.

   Proveedor en Colombia y precios: no verificado.
4. **Alibi Routing** (SIGCOMM 2015):
   - demuestra, paquete a paquete, que la ida y la vuelta evitaron una región: si el RTT por un relé «coartada» es menor que el mínimo físico pasando por esa región, el paquete no pudo pasar por ella;
   - detecta, no evita;
   - supuestos: un atacante puede retrasar pero no acelerar, y los relés firman;
   - límites: la región propia no se puede evitar; tuvo un 84 % de éxito en simulación.

   Confirmado.
5. **DeTor** (USENIX Security 2017):
   - en Tor, solo el 12 % de los circuitos evitaba EE. UU. de forma demostrable;
   - «never-twice» funciona en el 98,6 % de los casos;
   - Rusia solo se evita en el 35 %;
   - excluir países en Tor da «only the illusion of control».

   Confirmado.
6. **Tor `ExcludeNodes` / `StrictNodes`:** excluyen relés, no los países ni las redes que hay entre ellos. Un overlay propio garantiza dónde están los relés, no el camino entre ellos ni el primer y el último tramo. Confirmado.

## 5. Multicamino, reparto de secretos y señuelos

1. **MPTCP:** RFC 8684 (2020). **QUIC multipath:** borrador en la cola del RFC Editor. Confirmado.
2. **WebRTC (SCTP/DTLS/ICE, RFC 8831):** no usa ni MPTCP ni QUIC multipath. El multicanal se hace en la aplicación: varias conexiones, cada una por un relé distinto (`iceTransportPolicy: 'relay'`). Confirmado.
3. **Shamir (1979):** con menos partes de las necesarias no se aprende nada del secreto; XOR es el caso «todas las partes». Confirmado. Límite (razonamiento propio): no sirve contra quien ve todos los caminos (el proveedor o el Wi-Fi del usuario), y el tamaño y los tiempos siguen a la vista.
4. **Señuelos:**
   - Dyer et al. (2012): ninguna de nueve contramedidas eficientes impidió reconocer el sitio visitado; con BuFLO, un 93,5 % de tráfico extra y aún un 27,3 % de acierto;
   - Das et al. (2018): de anonimato fuerte, poco tráfico extra y poca latencia, solo se pueden tener dos.

   Confirmado.

## 6. Señales de anomalía de ruta

1. **RPKI ROV** (RFC 6811): da Valid, Invalid o NotFound, y no valida el camino. Confirmado.
2. **RFC 9319:** con `maxLength`, un secuestro de subprefijo puede salir «Valid»; hay que firmar ROA sin `maxLength`. Confirmado.
3. **Fugas de rutas** (RFC 7908): la validación de origen no las ve; ASPA aún es un borrador. Confirmado.
4. **RIS Live:** BGP en tiempo real por WebSocket, con uso comercial por defecto, revocable y con atribución. Confirmado.
5. **BGPStream** (CAIDA): código abierto. Licencia de sus datos: no verificado.
6. **Qué cuenta:**
   - **Señales reales:** el prefijo de un relé nuestro anunciado con otro origen, un Invalid, o un ASN nuevo junto al origen.
   - **No prueban nada solas:** un pico de RTT, un cambio de país en una base GeoIP, bucles de traceroute, NotFound o un reinicio de ICE.

## Lo que GUARDIANA puede construir ya, con honradez

1. Panel medido: tamaño, progreso, velocidad, RTT y el tiempo restante como estimación, según lo que ofrezca cada navegador.
2. Indicador de ruta: «directo» o «por nuestro relé de Europa / de América», con aviso en vivo si cambia la red.
3. Medidas desde nuestros relés con Paris traceroute o mtr. ASN con IP2Location LITE y atribución, sin mandar IPs a terceros, y rotuladas «aproximado».
4. Física: la distancia máxima compatible con el RTT, «satélite geoestacionario probable» y «Starlink (AS14593)».
5. Vigilancia BGP/RPKI de los prefijos de nuestros relés con RIS Live, y ROA sin `maxLength`.

## Afirmaciones prohibidas

- «Tu archivo pasó por tal cable, por tierra o por satélite».
- «La ruta evita un país», salvo con una prueba tipo Alibi y sus supuestos explícitos.
- Ubicación exacta de los saltos o del otro.
- Ancho de banda en Firefox o Safari.
- «El multicanal o los señuelos te hacen invisible».
- «Secuestro detectado» sin un anuncio BGP anómalo; «RPKI Valid = ruta segura».
- «Usamos SCION» sin estar conectados.
- Datos de RIPEstat, IPmap, CAIDA o GeoLite sin permiso.

No se pudieron consultar: ARIN (AS14593), el geofeed de Starlink, las estadísticas provisionales de la W3C y el repositorio de Tor.
