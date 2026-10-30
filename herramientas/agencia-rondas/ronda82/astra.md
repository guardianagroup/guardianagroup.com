Ronda 82 · Astra 6 (gpt-6-astra, Cheaper Inference) · revisión de «Videollamada encriptada post-cuántica»

Sí, con matices: es honesto si el rótulo aparece solo cuando el cifrado PQ de medios está realmente activo y autenticado; en fallback no debe mostrarse.

1. HNDL y metadatos: el contenido Opus/VP8/VP9 queda protegido por llaves derivadas de ML-KEM+ECDH, así que "guardar ahora, descifrar después" no debería romper el contenido si ML-KEM aguanta. Pero IPs, tiempos, duración, id de llamada, cabeceras en claro, señalización y patrones de tráfico siguen expuestos. "Post-cuántica" no cubre metadatos.

2. Autenticación y downgrade: ML-KEM no autentica por sí solo. Hay que autenticar el intercambio y la confirmación mutua con mecanismos fuertes; si la autenticación es clásica o el fallback silencioso es manipulable, un atacante activo podría abusar del modo DTLS-SRTP. Mostrar el rótulo sin verificación mutua fuerte sería engañoso.

3. IV, rotación y alcance: IV aleatorio de 96 bits por fragmento con clave por llamada es razonable, pero conviene rotación/rekeying y límites por clave por el riesgo de colisiones. Además, el DTLS-SRTP clásico subyacente no aporta PQ a metadatos; el rótulo debería precisar "medios" y distinguir claramente PQ activo frente a solo DTLS-SRTP.
