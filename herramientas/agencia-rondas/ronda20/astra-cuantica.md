# Ronda 20 · Astra 6 (gpt-6-astra) · cuantica

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> Danos un plan concreto para que GUARDIANA resista a los ordenadores cuánticos: TLS híbrido (X25519MLKEM768), firmas ML-DSA o SLH-DSA para las actualizaciones, mensajería (MLS y PQXDH), datos guardados. Di qué bibliotecas usar (liboqs, BoringSSL, AWS-LC, rustls), qué soportan ya los navegadores y qué NO debemos prometer (QKD, "protección cuántica total").

---

## Objetivo: protección poscuántica por capas, no “inmunidad cuántica”

Para una empresa pequeña, la prioridad es **proteger datos que puedan capturarse hoy y descifrarse después**, sin desarrollar criptografía propia. GUARDIANA debe distinguir tres objetivos: confidencialidad del tráfico, autenticidad de las actualizaciones y protección de datos guardados.

### 1. Primeros 30 días: inventario y TLS híbrido

Mapeen dónde terminan las conexiones y quién tiene las claves: CDN, balanceadores, servidores, ZERO, proveedores, copias y analítica. Prioricen información sensible con vida útil larga.

Desplieguen **TLS 1.3 con X25519MLKEM768** en los puntos compatibles. Combina X25519 y ML-KEM-768 para conservar protección si uno de los componentes falla, bajo las condiciones de seguridad del esquema.

En ZERO hay **dos conexiones independientes**:

- **Usuario → GUARDIANA/ZERO:** configuren el CDN o terminador TLS para negociar el grupo híbrido.
- **ZERO → web visitada:** mantengan Chromium actualizado; la protección depende también del servidor de destino.

Si el CDN descifra el tráfico, **CDN → servidor propio** es otro tramo que deben evaluar. WebRTC, si lo usan para transmitir ZERO, necesita una revisión separada: activar HTTPS híbrido no lo cubre automáticamente.

**Verificación:** registren únicamente versión TLS y grupo negociado, sin historial de navegación. Prueben compatibilidad, latencia y conexiones de respaldo. No basta con que una opción diga “PQC habilitado”.

### 2. Bibliotecas: una pila principal, no cuatro

| Biblioteca | Recomendación |
|---|---|
| **BoringSSL** | Apropiada para Chromium y servicios que ya la integran; tiene soporte de TLS híbrido. Eviten convertirla en una dependencia general esperando una API estable. |
| **AWS-LC** | Buena base criptográfica mantenida, con capacidades poscuánticas según versión. No es por sí sola un servidor TLS: necesita integración. |
| **rustls + aws-lc-rs** | Opción preferente para nuevos servicios Rust. Utilicen versiones compatibles con X25519MLKEM768 y revisen proveedor, funcionalidades de compilación y preferencia de grupos. |
| **liboqs** | Útil para laboratorio, interoperabilidad y evaluación. No la usaría como dependencia predeterminada de producción ni para inventar protocolos. |

Fijen versiones, mantengan pruebas de interoperabilidad y sigan avisos de seguridad. Que una biblioteca implemente un algoritmo **no implica que toda la aplicación lo negocie**.

### 3. Qué soportan los navegadores

Versiones recientes de **Chrome/Chromium, Edge y Firefox** soportan intercambio híbrido con ML-KEM; el resultado depende de versión, plataforma, políticas y servidor. Verifiquen Safari y navegadores móviles explícitamente: no anuncien compatibilidad universal.

Esto protege el **intercambio de claves**, pero los certificados y firmas TLS pueden seguir siendo clásicos. Además, soporte en TLS **no equivale a disponibilidad de ML-KEM o ML-DSA en WebCrypto**.

### 4. Días 30–90: actualizaciones auténticas

Como ya no distribuyen el programa de escritorio, protejan primero imágenes de ZERO, contenedores, infraestructura y cadena de compilación. Para un futuro navegador o dispositivo:

- Usen **ML-DSA** como primera opción; **SLH-DSA** ofrece una alternativa basada en hashes, con firmas mayores.
- Durante la transición, exijan **firma clásica y poscuántica**, no “cualquiera de las dos”.
- Implementen metadatos al estilo **TUF**: expiración, versiones monotónicas, rotación, claves raíz fuera de línea y rechazo de retrocesos.
- Conserven las firmas exigidas por cada plataforma: no todas aceptan firmas PQ nativamente.

Una web no puede demostrar su integridad frente a un servidor comprometido mediante un verificador JavaScript descargado del mismo servidor. Hace falta una raíz de confianza independiente.

### 5. Mensajería: solamente si entra al producto

- **PQXDH:** adecuado para establecimiento inicial asíncrono de secretos híbridos. No vuelve automáticamente poscuánticas la autenticación ni todas las renovaciones posteriores.
- **MLS:** adecuado para grupos, pero sus suites básicas no son poscuánticas. Exijan una suite PQ/híbrida interoperable y revisada antes de anunciar esa propiedad.
- No inventen una combinación “MLS + PQXDH”; requieren diseños e implementaciones específicos. Evalúen también ratcheting poscuántico.

### 6. Datos guardados

Usen **AES-256-GCM**, claves aleatorias, nonces únicos y cifrado por envoltura. Para contraseñas, **Argon2id**. Revisen copias, exportaciones y claves envueltas con RSA/ECC: pueden seguir siendo vulnerables. ML-KEM establece secretos; **no cifra archivos directamente**.

Minimicen retención: ningún algoritmo protege información que ZERO, el buscador o sus registros conservan innecesariamente en claro.

### Límites comerciales

No prometan **QKD**, “protección cuántica total”, anonimato equivalente a Tor ni seguridad integral por usar TLS híbrido. Publiquen cobertura comprobable por tramo. Primero fortalezcan la web y ZERO; después evalúen navegador propio y dispositivo, cuyo mantenimiento exige recursos sostenidos.
