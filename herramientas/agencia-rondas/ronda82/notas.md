Ronda 82 · notas (30 Oct 2026) · ¿se puede decir «Videollamada encriptada post-cuántica»?

Voces: Claude (el diseño, llamada.js y medios-pq.js) y Astra 6 (astra.md): «Sí, con matices».

Cómo se cumplen los matices de Astra
1. Metadatos: nunca se dice que «post-cuántica» cubra metadatos (IP del relé, horas, duración). El rótulo habla de la
   videollamada, es decir, del sonido y la imagen.
2. Autenticación y bajada de nivel: la oferta y la respuesta (con «pqm») viajan dentro de la sesión del chat, cifradas de
   extremo a extremo y autenticadas, así que nadie en medio puede quitar la marca sin romper la sesión. El rótulo solo aparece
   cuando la otra persona lo confirma y, además, ya se está descifrando lo suyo con la llave nueva. La autenticación de las
   identidades sigue siendo la del chat (palabras de comprobación y claves de identidad).
3. IV aleatorio de 96 bits por fragmento, con una llave por llamada y sentido: a unos 80 fragmentos por segundo, el límite
   recomendado (2^32 cifrados por llave) queda muy lejos. La renovación de llaves cada 1–2 minutos (con su código) es lo
   siguiente que pidió el dueño.

Decisión: se publica el rótulo «Videollamada encriptada post-cuántica» (y «Llamada encriptada post-cuántica»), solo con la capa
activa y descifrando, y la etiqueta «Post-cuántica» en la cápsula de arriba.
