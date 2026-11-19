# Ronda 96 · Elixire · Decisiones (19 nov 2026, 12:35)

Dos voces: ChatGPT (razonamiento alto) y Gemini (Neon, razonamiento alto). Encargo: `encargo.md`. Respuestas completas en las dos conversaciones de la agencia.

## 1. Comunicarse sin internet en la misma ciudad o país

Las dos voces coinciden: **no hay nada mejor que internet con encriptado de extremo a extremo** para texto y vídeo en tiempo real dentro de una web.
- LoRa: alcance sí, capacidad no (texto corto, nada de vídeo).
- Bluetooth y wifi directo: decenas de metros y sin una API web general.
- Fibra privada, microondas, láser y satélite: infraestructura del cliente, no de Elixire.
- QKD: solo reparte claves, con equipos especiales; la NSA no la recomienda para sus sistemas.
- Matiz de ChatGPT: WebRTC dentro de la misma red local, como opción (evita los relés externos). Gemini: no para Elixire. **Queda fuera** (además, revela direcciones locales).

## 2. El máximo nivel actual

Coinciden: los algoritmos públicos de máximo nivel son los de **CNSA 2.0** (ML-KEM-1024, ML-DSA-87, AES-256, SHA-384/512; LMS/XMSS para firmar software). Elixire ya usa esos algoritmos (más ECDH/ECDSA P-384 en híbrido).

La distancia con defensa e inteligencia no está en los algoritmos, sino en:
- componentes validados (FIPS 140-3, catálogos de la OTAN y del CCN);
- dos capas independientes en equipos distintos (CSfC);
- equipos y redes controlados.

No se puede publicar «conformidad CNSA 2.0» ni nada parecido.

## 3. «Protocolo Elixire»: las seis ideas

| Idea | ChatGPT | Gemini | Decisión |
|---|---|---|---|
| a) Fragmentos XOR por varios relés | Laboratorio, no lanzamiento | Sí, pieza estrella (chat y documentos; no vídeo) | **Divergen.** Experimental, sin anunciarlo. Hoy solo hay dos relés de /com (motor y motor-am). |
| b) Secreto que nunca pasa por el relé | Sí, prioritario (256 bits opcionales por otro canal) | Sí, imprescindible (enlace de 256 bits y/o CPace sobre el código) | **Sí. Primero.** Modo «máxima protección» con secreto de 256 bits por otro canal. CPace no: es un borrador. |
| c) Dos capas en cascada | No como diseño general | Sí (AES-256-GCM + XChaCha20-Poly1305) | **Divergen.** No se construye sin otra ronda. |
| d) Tercera familia poscuántica (HQC, McEliece) | No al principio | No en v1 (HQC, estándar en 2027) | **No en v1.** |
| e) Trinquete poscuántico continuo | Sí, tras verificar Ultra | Sí, prioridad máxima | **Sí. Segundo.** |
| f) Prueba de vida ligada a la clave en la videollamada | Sí, alcance limitado | Sí | **Sí. Tercero.** Sin prometer detección infalible. |

### Ideas propias de la agencia
- **ChatGPT: «Cierre de confianza».** Para instrucciones de pago y cambios de cuenta: identidad vinculada, documento firmado e íntegro y segunda autorización. Mientras falte algo, el cierre sale incompleto. Ataca directamente el fraude del falso directivo. **Propuesta al dueño como producto.**
- **Gemini: etiquetas de sala distintas en cada relé.** Coste cero, si llega el reparto por varios relés.

### Lo que se puede decir en público (dos voces)
- Algoritmos poscuánticos y clásicos en híbrido.
- Identidad comprobada por clave y cuatro palabras.
- Nada guardado.
- Siempre con los límites: un equipo infectado ve la pantalla y la web depende del código servido.

Sin «conformidad», «auditada», «certificada» ni «anónima».

## 4. Construido hoy (antes de esta ronda)

Elixire publicada en www.house1718.com:
- motor Ultra para dos personas, solo en memoria;
- archivos de hasta 1 GB;
- videollamada solo por TURN, con la capa poscuántica de imagen y sonido y prueba de 3 minutos;
- CSP y huellas SHA-384 (SRI).
