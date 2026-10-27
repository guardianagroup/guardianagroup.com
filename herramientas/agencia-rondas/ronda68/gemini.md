# Ronda 68 · Gemini (Argon) · el viaje del archivo en Comunicaciones y elegir la ruta

27 Oct 2026, ~18:05 (Bogotá). Chat: https://gemini.google.com/app/370d0bc7a57f9e14 (texto completo allí; aquí lo esencial, fiel). Con **❗** van los errores que la investigación de Claude (`claude-rutas.md`, con fuentes primarias) contradice.

## A) Qué se mide

- **Navegador:**
  - `File.size`, bloques confirmados, `bufferedAmount`, velocidad (`bytesSent`/`bytesReceived` por intervalo) y tiempo restante;
  - RTT actual y medio (`totalRoundTripTime`/`responsesReceived`), `availableOutgoingBitrate`;
  - en canales de datos no hay contador de pérdida ni de variación: se deducen;
  - tipo de candidato (directo o `relay`) y `relayProtocol` (udp, tcp, tls);
  - `networkType`, oculto; `navigator.connection.effectiveType` solo en Chromium;
  - cortes y reinicios por los eventos ICE.
- **Relé TURN:** conoce las IP de los dos extremos y puede lanzar mtr o Paris traceroute. Si el envío va directo, nuestros servidores no ven ese camino.
- **Licencias** (según Gemini):
  - RIPEstat: «comercial permitido con uso justo y atribución». **❗ Falso:** sus términos prohíben los servicios de pago sin permiso escrito.
  - RIPE IPmap: «permitido con atribución». **❗ Falso:** los términos del RIPE NCC prohíben re-empaquetar.
  - RIPE Atlas: con créditos.
  - GeoLite2: «comercial con atribución». **❗ Es ambiguo:** hay que pedírselo por escrito a MaxMind.
  - IP2Location LITE: CC BY-SA 4.0 con atribución.
  - CAIDA: restringida.
- **Satélite:** AS14593 (Starlink), Viasat y HughesNet por su ASN; RTT de 25–60 ms en órbita baja y más de 550 ms en geoestacionaria. Con una VPN delante se ve el ASN de la VPN.
- **Física:** n≈1,468 en la fibra, unos 200 km/ms en un sentido, es decir, como mucho 100 km de distancia por cada ms de RTT. Ejemplo: un escalón de +65 ms entre un salto americano y uno europeo indica un cruce del Atlántico.
- **Lo invisible:** los cables (capas 1 y 2) no aparecen en el traceroute, y la vuelta no se ve. Texto honrado: «Medido: salió de la red X y entró en la red Y en 118 ms. Estimado: cruza el corredor submarino del Atlántico; las operadoras no dicen por qué cable».

## B) Elegir la ruta

| Opción | ¿Evita países? | Coste |
|---|---|---|
| Relés TURN propios, encadenados | Parcial: dónde están los nodos, no el BGP | 20–80 US$/mes por VPS |
| Tor | No para WebRTC (sin UDP) | Inviable en el navegador |
| SCION (SSFN, Anapaya) | Sí, con garantía criptográfica, si todos hablan SCION | Contratado por las empresas |
| Troncales de nube | No verificable | 0,08–0,15 US$/GB |
| Líneas privadas o MPLS | Sí, por contrato | Miles de US$/mes |

- **Alibi Routing y DeTor:** explicados bien. Límite: cuando el país está pegado a la ruta, el margen es menor que el ruido de las colas.
- **Ya (en semanas), según Gemini:**
  - una malla de 6–8 relés (Colombia, Brasil, EE. UU., Islandia, Suiza, España, Japón) encadenados por WireGuard;
  - la «elipse» de la velocidad de la luz con un sello «Exclusión física demostrada por velocidad de la luz»;
  - si no alcanza, «Sin redes registradas en [País] según BGP (no descartable físicamente por cercanía)».

  **❗ Ojo:** la elipse vale entre puntos de ubicación conocida (nuestros relés). La ubicación del usuario por IP es aproximada (y puede llevar VPN), así que no sirve para «demostrar» nada.

## C) Multicanal

- **Varias `RTCPeerConnection`, cada una forzada a un relé TURN distinto.**
- **XOR o Shamir sobre cada bloque ya encriptado:** quien capture menos partes no tiene información, «incluso si dentro de 30 años rompiera ML-KEM y AES».
- **Coste:** XOR de 3 vías multiplica por 3 la subida y la bajada; los señuelos, entre un 20 % y un 100 % más.
- **Límite:** la primera y la última milla son comunes.
- **Valor real:** frente a la captura en tránsito internacional y en nubes intermedias (*harvest now, decrypt later*).

## D) Anomalías

- **Intermediario:** un código corto derivado del secreto y de la huella DTLS.
- **Integridad:** la etiqueta de AES-GCM por bloque.
- **BGP:** RPKI con Routinator propio; un Invalid es una señal real; saltos de RTT o un ASN de otro continente.
- **UDP bloqueado o DPI:** si solo funciona TURN sobre TLS en el puerto 443, eso se sabe con certeza.
- **Nunca:** «te están espiando». Un pinchazo óptico pasivo es indetectable desde los extremos.

## E) La pantalla

- **Escritorio:** a la derecha; en el móvil, una hoja deslizable.
- **Titular de ejemplo:** «Enviando contrato.pdf (48,2 MB) · Ruta blindada por 3 jurisdicciones · Ningún canal lleva el documento completo».
- **Globo de Órbita:** la barra de progreso avanza sobre cada arco.
- **Etiquetas:**
  - [MEDIDO] (verde);
  - [ESTIMADO] (ámbar);
  - [ILUSTRATIVO] (gris).
- **Lo que se paga, según Gemini:** un «Certificado Criptográfico de Tránsito» (PDF + JSON firmados) con hash, hora, claves, ASN y jurisdicciones, RPKI y la prueba Alibi. **❗ «Certificado» está prohibido** (rondas 64 y 66): decir «comprobante».
- **Móvil:** una tarjeta arriba; la vista 3D a 30 FPS; 2–3 canales.

## F) Producto

- **«Único en el mundo», según Gemini:** combinar el cifrado poscuántico, el reparto XOR/Shamir por relés en jurisdicciones elegidas, BGP/RPKI y traceroute en vivo, y la prueba física de exclusión con su comprobante. **❗ No verificado:** no afirmarlo sin un estudio.
- **Humo:** obligar a Claro, Movistar o Level3 a cambiar de cable; detectar pinchazos pasivos.
- **Costes:**
  - 8 nodos en 8 países, 180–350 US$/mes;
  - un envío de 1 GB en XOR de 3 canales + 20 % de señuelo sale a < 0,04 US$;
  - medición y bases de datos, 0 US$. **❗ No:** RIPEstat y GeoLite no son gratis para este uso.
- **Fases:**
  1. días 1–10: telemetría + panel + mtr en los 2 relés;
  2. semanas 3–4: elegir la jurisdicción + elipse + comprobante;
  3. semanas 5–6: multicanal y señuelos.

## G) Ley

- **IP:** dato personal (TJUE C-582/14, Breyer; la SIC, *comprobar*).
- **Al otro, mostrar:** la IP enmascarada; solo el país y el ASN, salvo que los dos acepten compartir la telemetría completa.
- **Retención:** la ruta, solo en memoria y borrada al cerrar la sala.
- **Exportación:** Colombia sin restricciones (*no verificado*); en EE. UU., mercado masivo o código abierto (*no verificado*).
