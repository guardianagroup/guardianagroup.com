# Ronda 68 · El viaje del archivo en Comunicaciones y elegir la ruta · cruce

27 Oct 2026, 17:50–19:00 (Bogotá). Voces: ChatGPT («Alta», con web; `chatgpt.md`), Gemini (Argon; `gemini.md`), Astra 6 (Cheaper Inference; `astra.md`) y Claude (investigación propia con fuentes primarias; `claude-rutas.md`). Pregunta: `pregunta.md`. Notas escritas a las 20:20.

## Lo que dicen las cuatro voces (coinciden)

1. **Sí a un viaje verificable; no a vender un recorrido que no se puede observar.** Nunca «cruzó este cable» ni «no pasó por este país».
2. **Lo que se mide de verdad:** tamaño, bytes confirmados por la app receptora (meter datos en cola no es entregarlos), velocidad, tiempo restante (estimado), conexión directa o por relé, RTT y cambios de red. Estados: preparado → enviado → recibido → verificado (integridad comprobada).
3. **El traceroute desde nuestro relé no es el recorrido del archivo:** las rutas suelen ser asimétricas y la vuelta no se ve. El país de un router es una inferencia (las bases de geolocalización lo aciertan alrededor del 78 % de las veces, según CAIDA). El satélite se deduce por la red (por ejemplo, AS14593, Starlink), no por la latencia. La velocidad de la luz da límites de distancia, no la ruta.
4. **Elegir la ruta:** se puede elegir dónde están los relés; no se puede garantizar que el tráfico no atraviese un país. Tor no sirve de base. SCION y SSFN, interesantes a medio plazo a través de un operador.
5. **Multicanal:** XOR o Shamir entre relés distintos reducen lo que ve cada uno, pero la primera y la última milla son comunes y un dispositivo comprometido lo ve todo. Mejor repartir la clave que el archivo entero. Los señuelos cuestan tráfico y batería: no activarlos de forma masiva.
6. **Anomalías:** un RPKI inválido es una señal, no un «ataque confirmado». Nunca «te están espiando».
7. **La pantalla:** MEDIDO, ESTIMADO e ILUSTRATIVO, con trazo continuo o discontinuo; en el móvil, una tarjeta compacta, sin globo 3D permanente.
8. **Ley:** la IP puede ser un dato personal; al otro participante, solo una región amplia; retención mínima.

## Donde discrepan

- **Licencias:** Gemini da por permitidos RIPEstat e IPmap; Claude comprobó que **exigen permiso escrito** para un servicio de pago. GeoLite2 es ambiguo (pedirlo por escrito); IP2Location LITE sí, con atribución (CC BY-SA 4.0); CAIDA, no; RIPE Atlas, solo para medir infraestructura propia.
- **«Exclusión física demostrada por la velocidad de la luz»** (Gemini): vale solo entre puntos de ubicación conocida, como nuestros relés; la ubicación del usuario por IP es aproximada. No sirve para demostrar nada sobre su tramo.
- **«Certificado Criptográfico de Tránsito»** (Gemini): «certificado» no se usa (rondas 64 y 66); se dice «comprobante».
- **Coste de medir «0 US$»** (Gemini): falso para este uso, por las licencias.
- **Plazos:** seis semanas (Gemini) o doce en cinco fases, con la identidad primero (ChatGPT); Astra añade una evaluación independiente al final.

## Propuesta de Claude

- **Orden** (ChatGPT, coincide con Astra):
  1. identidad y entrega comprobable, con recibo;
  2. viaje en directo con datos reales y etiquetas;
  3. elección de relés: «Procesamiento de relé limitado a ubicaciones aprobadas». Si no hay un camino permitido, el envío se detiene y se explica;
  4. multirruta, solo si demuestra su beneficio.
- **Distintivo: un comprobante de custodia digital** al final de cada envío (identidad, integridad, relés, incidencias, tiempos, recepción y políticas), verificable fuera de GUARDIANA.
- **Mensaje** (ChatGPT): «Tu documento no desaparece cuando pulsas Enviar. Mira su progreso en directo. Conoce el relé utilizado, comprueba su entrega y consulta las incidencias observadas durante el transporte.»
- **Medición:** solo desde nuestros relés y con licencias comprobadas (IP2Location LITE, con atribución). Sin enviar IPs de usuarios a terceros: mtr consulta a Team Cymru, así que esa consulta se desactiva.
- **Precio:** el plan superior (Envío verificable empresarial) cobra por controles efectivos y evidencia delimitada; el importe, cuando se conozca el coste por GB en un piloto.
