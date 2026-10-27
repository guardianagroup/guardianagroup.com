# Ronda 68 · ChatGPT («Alta», con web) · el viaje del archivo en Comunicaciones y elegir la ruta

27 Oct 2026, 17:50–18:30 (Bogotá). Chat nuevo, «Investigar ruta verificable». Texto completo allí (unos 34.000 caracteres); aquí lo esencial, fiel.

**Veredicto:** desarrollarla con tres capacidades distintas:
- **observar:** medir y detectar cambios reales;
- **dirigir:** elegir los relés y la política;
- **demostrar:** pruebas técnicas, sin confundir una estimación geográfica con una garantía. Es la más difícil y la más valiosa.

Nombre provisional: **GUARDIANA COMUNICACIONES · RUTA VERIFICABLE**. Promesa: «controlamos los puntos de tránsito que podemos controlar, medimos lo que sucede y documentamos lo que podemos verificar», nunca «ningún país podrá interceptar el archivo».

## A) Qué se mide de verdad

- **Medido:** tamaño, bytes recibidos (contador del destinatario), progreso confirmado por bloques, velocidad, RTT del par ICE, variación, directo o TURN y cambios de conexión.
- **Estimado:** tiempo restante («Calculando…» si aún no hay muestras).
- **Parcial:** pérdida y tipo de red.
- **Estimado y con medida aparte:** países atravesados.
- **No:** el cable exacto.
- **No siempre:** el satélite.
- **Cuatro estados que no se mezclan:** preparado → enviado → recibido (confirmación de la app del destinatario) → verificado (integridad y autenticidad). `bufferedAmount` no prueba la recepción. Protocolo propio con bloques numerados, acuses autenticados, hash final y recibo firmado. Recibir no prueba que se haya leído.
- **«El viaje»** no es un objeto con GPS: son paquetes. La animación representa el avance y los tramos de infraestructura conocidos.
- **Desde nuestros relés:** traceroute o MTR (IP, ASN, país estimado, latencia, confianza, saltos mudos). No es el mismo camino que siguió el archivo ni el de vuelta (Paris traceroute).
- **Licencias:**
  - RIPEstat: permiso escrito para uso comercial;
  - IPmap: autorización;
  - RIPE Atlas: permiso;
  - GeoLite2: con atribución, distinguiendo la redistribución;
  - IP2Location LITE: confirmar por escrito el uso SaaS;
  - CAIDA: según el conjunto.

  Decisión: empezar con telemetría propia y solo con licencias que permitan expresamente el uso.
- **Satélite:** por ASN (p. ej., Starlink): «Proveedor de acceso compatible con red satelital. Trayecto interno no verificado».
- **Cable submarino:** no. Con unos 200 km/ms de fibra, 50 ms de RTT son ≈10.000 km sumando ida y vuelta: un límite, no la ruta. Mostrar «Cruce intercontinental probable · Medio físico exacto: no identificado · Cables de la región: contexto de Órbita».

## B) Elegir la ruta y evitar países

| Tecnología | ¿Qué se elige? | ¿Demuestra evitar países? |
|---|---|---|
| Relés GUARDIANA | país y servidor | No, solo el relé |
| Tor | países de los nodos | No (DeTor) |
| SCION | caminos anunciados | No el trayecto físico completo |
| Troncal de nube | regiones | Solo con condiciones o contrato |
| Circuito dedicado | extremos | Según garantías y auditoría |

- **Red superpuesta propia con políticas:** Automático, Europa, América o Ruta controlada. `iceTransportPolicy: "relay"` no encadena varios relés: hace falta una capa propia.
- **Regla empresarial:** «Solo infraestructura autorizada; si no hay ruta compatible, no se envía». Residencia de los relés sí; ausencia total de tránsito por un país, no.
- **Tor:** no como base (TCP, no UDP; geolocalización falible).
- **SCION/SSFN:** lo más interesante a medio plazo, a través de un operador SCION; no construir una red mundial propia.
- **Alibi Routing:** pruebas posteriores, no una garantía preventiva.
- **DeTor:** solo el 12 % de los circuitos que excluían nodos de EE. UU. lo evitaba de forma demostrable.
- **Tres niveles:**
  1. relé conocido;
  2. ruta observada;
  3. evitación verificable, solo como investigación y nunca anunciada hoy.

## C) Multicanal y fuegos artificiales

- **Bloques disjuntos:** reducen lo que ve cada relé, sin secreto perfecto.
- **XOR 2 de 2 con máscara aleatoria:** ninguna parte sola revela nada; 200 MB por cada 100 MB.
- **Shamir 2 de 3:** hasta 300 MB. Mejor: encriptar el archivo, repartir la clave con un umbral y añadir redundancia (con diseño auditado).
- **WebRTC:** varios `RTCDataChannel` en una misma conexión comparten transporte. Para tener caminos distintos hacen falta conexiones independientes por relés distintos, comprobando que de verdad son distintos.
- **Señuelos:** 1 MB falso por cada MB real duplica el tráfico. No activarlos de forma masiva por defecto: primero bloques de tamaño normalizado, relleno limitado y conexiones realmente separadas. La primera y la última milla son comunes y los extremos pueden estar comprometidos.

## D) Anomalías

- **Cuatro niveles:** normal, informativo, advertencia y bloqueo.
- **Textos honrados:**
  - «La identidad criptográfica ha cambiado»;
  - «Bloque rechazado: autenticidad o integridad no verificadas»;
  - «El archivo no coincide»;
  - «La conexión ha cambiado»;
  - «Retraso elevado»;
  - «Anomalía de validación de origen» (RPKI inválido);
  - «Posible tránsito por país no previsto».
- **Nunca:** «un hacker intenta leer» por latencia, «espionaje» por pérdida, «una agencia interceptó», «cable obstruido», «ataque BGP confirmado» solo por RPKI.
- **Identidad antes que la animación:** el código de 9 cifras no prueba quién es la empresa. Hay que verificar la organización, vincular dispositivos y claves, comprobar el número de seguridad por otro canal, avisar si cambian las claves y emitir recibos con la identidad.

## E) La pantalla

- **Panel con tres etiquetas obligatorias:**
  - **MEDIDO** (bytes, RTT, relé, integridad), con trazo sólido;
  - **ESTIMADO** (routers, cruce oceánico, tiempo restante), con trazo discontinuo;
  - **ILUSTRATIVO** (partículas, cables no identificados, satélites de contexto).
- **Para la tesorera, cuatro preguntas:** ¿a quién?, ¿protegido y verificado?, ¿cuánto falta y llegó íntegro?, ¿pasa algo? Además, «Ver detalles técnicos».
- **Móvil:** una tarjeta compacta, sin planeta 3D permanente.

## F) Producto y precio

- **Lo diferente:** reunir identidad verificada, cifrado de extremo a extremo con comprobación, infraestructura controlada, telemetría real separada de las inferencias, alertas, recibo e informe legible. Competir por hacer verificable, no por el mapa más espectacular.
- **Tres modalidades:**
  - Comunicaciones;
  - Comunicaciones Profesional (identidad, recibos, informes, viaje observado);
  - Comunicaciones Ruta Verificable (políticas de relés, redundancia, alertas, evidencias).

  No inventa precios: primero el coste por GB y un piloto.
- **Costes de referencia:**
  - Hetzner CX23, 3,62 €/mes con 20 TB (anuncio de oct-2025; hoy, disponibilidad limitada);
  - Google Dedicated Interconnect, 2,328 US$/h por 10 Gbps;
  - AWS Direct Connect, no es una línea hasta el cliente.

  Los relés VPS bastan para empezar.
- **Fases:**

  | Fase | Plazo | Contenido |
  |---|---|---|
  | 0 | días 1–4 | auditoría de cifrado, identidad y recibos |
  | 1 | días 5–12 | telemetría |
  | 2 | semanas 3–4 | panel con etiquetas |
  | 3 | semanas 5–6 | elección de relé y políticas |
  | 4 | semanas 7–9 | multiconexión |
  | 5 | semanas 10–12 | piloto |

- **Cinco pruebas antes de cobrar:**
  1. pasar de Wi-Fi a red móvil;
  2. caída del relé;
  3. bloque alterado, que debe rechazarse;
  4. identidad sustituida;
  5. una ruta que incumple la política y no se envía.

## G) Ley

- **Datos personales:**
  - IP: dato personal en ciertos casos (TJUE);
  - Ley 1581, arts. 9 y 12; RGPD, arts. 6, 13, 28, 32 y 44 y ss.

  No enseñar la IP completa ni la ubicación precisa del otro: solo una región amplia. Informar a los dos y retener lo mínimo.
- **Exportación:** puede haber control según el caso (Reglamento (UE) 2021/821, EAR de EE. UU.). «No sé» la clasificación de GUARDIANA.

## Decisión

1. Identidad y entrega comprobable, primero.
2. Después, el viaje en directo con datos reales y etiquetas.
3. Luego, la elección de relés.
4. Al final, la multirruta, si se demuestra su beneficio.

- **Distintivo:** un **comprobante de custodia digital** al final de cada envío, con identidad, integridad, relés, incidencias, tiempos, recepción y políticas, verificable fuera de la plataforma.
- **Mensaje:** «Tu documento no desaparece cuando pulsas Enviar. Mira su progreso en directo. Conoce el relé utilizado, comprueba su entrega y consulta las incidencias observadas durante el transporte.»
- **Líneas rojas:** no vender una ruta inventada como medida; no decir que se evitó un país solo por elegir relés; no confundir la fragmentación o los señuelos con más cifrado.
