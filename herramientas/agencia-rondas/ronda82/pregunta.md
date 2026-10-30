IMPORTANTE: responde enseguida, sin razonar largo. Máximo 300 palabras.

Revisión técnica de GUARDIANA Comunicaciones (web, WebRTC).
- La sesión de chat se acuerda con ECDH P-256 + ML-KEM-768 (en la blindada, P-384 + ML-KEM-1024) y HKDF.
- De esa sesión sale, con HKDF, un secreto de 32 bytes para las llamadas.
- En cada llamada: HKDF(secreto, sal = «GUARDIANA medios v1» + id de la llamada) da dos llaves AES-256-GCM, una por sentido.
- Con WebRTC Encoded Transform (RTCRtpScriptTransform), cada fragmento de audio (Opus) y de imagen (VP8/VP9) se cifra con AES-256-GCM. El IV es aleatorio de 96 bits en cada fragmento, y la cabecera mínima va en claro pero autenticada (AAD).
- Todo esto va encima del DTLS-SRTP normal (ECDHE clásico).
- Solo se activa si los dos lados lo confirman. Si no, la llamada sigue solo con DTLS-SRTP y la interfaz no dice nada.

Pregunta: con esto, ¿es correcto y honesto mostrar en la llamada «Videollamada encriptada post-cuántica»? ¿Qué matices o riesgos hay (por ejemplo, «guardar ahora, descifrar después», autenticación, metadatos)? Responde «Sí» o «No» y da 3 matices.
