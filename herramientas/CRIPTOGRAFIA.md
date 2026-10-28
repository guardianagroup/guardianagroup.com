# GUARDIANA · Inventario criptográfico y plan de migración

28 Oct 2026. Documento de ingeniería para OWASP ASVS 5.0 §11.1.3 (descubrimiento de la criptografía en uso) y §11.1.4 (inventario y plan de migración). Describe lo que hace el código fuente de este repositorio, no una promesa de cumplimiento. Hecho leyendo el código, no de memoria; cuando cambie el código, hay que actualizarlo. No acredita que las operaciones se ejecuten en tiempo constante (11.2.4) ni la protección de la memoria del navegador (11.7.1): eso no es demostrable con criptografía en JavaScript.

## 1. Dónde vive cada cosa
- **Comunicaciones** (chat, archivos, llamadas y comprobantes), en el navegador: `orbita/comunicaciones/cripto.js` (clásico y la sesión normal), `pq-mlkem.js` (ML-KEM-768), `pq-cnsa.js` (ML-KEM-1024 y ML-DSA-87), `viaje.js` y `verificar/verificar.js` (comprobantes), `sha256.js` (huella de archivos por partes), `llamada.js` (llamadas), `app.js` (orquesta todo).
- **Relé** (`zero-motor/comunicaciones.js`, `ws.js`, `servidor.js`): solo transporte y credenciales de llamada; nunca ve el contenido.
- **Páginas de verificación** sin conexión: `verificar.html` (raíz) y `orbita/comunicaciones/verificar/`.

## 2. Comunicaciones · sesión normal
Toda la parte clásica usa Web Crypto del navegador; ML-KEM-768 usa @noble/post-quantum 0.7.1, servida desde el propio sitio (`pq-mlkem.js`).

| Uso | Algoritmo y parámetros | Dónde |
|---|---|---|
| Identidad (firma) | ECDSA P-256, no exportable, en IndexedDB | `cripto.js` creaIdentidad, firma, verifica |
| Identidad (acuerdo) | ECDH P-256 (deriveBits 256), no exportable | `cripto.js` creaIdentidad, dh |
| Huella de identidad | SHA-256(firmaPub ‖ acuerdoPub) | `cripto.js` huella |
| Número de seguridad | SHA-256("GUARDIANA número de seguridad\n"+huellas ordenadas) → 60 cifras | `cripto.js` numeroSeguridad |
| Secreto de la invitación | 32 bytes de `crypto.getRandomValues` | `cripto.js` nuevaSemilla |
| Sala del relé | SHA-256("GUARDIANA sala\n" ‖ semilla) | `cripto.js` deSemilla |
| Clave de presentación | HKDF-SHA-256(semilla, "GUARDIANA presentación", 32) | `cripto.js` deSemilla |
| PSK de sesión | HKDF-SHA-256(semilla, "GUARDIANA psk de sesión", 32) | `cripto.js` deSemilla |
| Acuerdo de sesión v2 | IKM = DH(ef_A,ef_B) ‖ DH(id_A,ef_B) ‖ DH(ef_A,id_B) ‖ PSK; HKDF-SHA-256, sal = sala, info = transcripción; salen 96 bytes (cadena A→B, cadena B→A, hash) | `cripto.js` sesion |
| Acuerdo de sesión v3 (híbrido) | lo anterior + ss de ML-KEM-768 en el IKM; info "GUARDIANA sesión v3 ECDH-P256+ML-KEM-768" | `cripto.js` sesion |
| Cadena por mensaje | HMAC-SHA-256 (clave de mensaje = 32 bytes); la clave anterior se descarta | `cripto.js` cadena |
| Mensajes y trozos | AES-256-GCM, nonce de 12 bytes = número de mensaje, datos asociados = cabecera ‖ hash de sesión | `cripto.js` sella/abre/nonce |
| Firmas de la presentación | ECDSA P-256 sobre SHA-256 (v2 "sig" y v3 "sig3") | `cripto.js` datosInicia/datosResponde |
| KEM híbrido | ML-KEM-768 (FIPS 203); ek 1184, dk 2400, ct 1088 | `pq-mlkem.js`, `cripto.js` kem* |

**Código de invitación de 9 cifras:** 9 cifras aleatorias sin sesgo (`crypto.getRandomValues`); la clave sale de PBKDF2-SHA-256, 300.000 iteraciones, sal aleatoria de 16 bytes, y cierra el «sobre» con AES-256-GCM (datos asociados "GUARDIANA sobre"). `cripto.js` claveDeCodigo, nuevoCodigo. **Límite conocido:** 9 cifras son ~30 bits; si alguien captura el sobre del relé, puede probarlo fuera de línea. Ver el plan (§7).

## 3. Comunicaciones · sesión blindada
Identidad nueva en cada sesión. Usa los algoritmos de la suite CNSA 2.0 en híbrido con criptografía clásica. Nota honesta: P-384 pertenece a la suite CNSA 1.0; aquí es la pareja clásica del híbrido, no «conformidad CNSA 2.0».

| Uso | Algoritmo y parámetros | Dónde |
|---|---|---|
| Identidad (firma clásica) | ECDSA P-384, no exportable | `cripto.js` creaIdentidadB |
| Identidad (acuerdo clásico) | ECDH P-384 (deriveBits 384), no exportable | `cripto.js` dhB |
| Identidad (firma PQ) | ML-DSA-87 (FIPS 204); pública 2592, firma 4627; contexto "GUARDIANA blindada v1" | `pq-cnsa.js`, `cripto.js` firmaPQ/verificaPQ |
| Clave ML-DSA en reposo | AES-256-GCM con la clave local no exportable, datos asociados "GUARDIANA ML-DSA-87" | `cripto.js` creaIdentidadB, abreDsaB |
| Huella de identidad | SHA-384("GUARDIANA huella blindada v1\n" ‖ firmaPub ‖ acuerdoPub ‖ dsaPub) | `cripto.js` huellaB |
| Número de seguridad | SHA-384(…) → 60 cifras | `cripto.js` numeroSeguridadB |
| Invitación | semilla de 256 bits solo en el enlace "#b="; sala = SHA-256; presentación = HKDF-SHA-384 (32); psk = HKDF-SHA-384 (48) | `cripto.js` deSemillaB |
| Acuerdo de sesión | IKM = 3× DH P-384 ‖ ss de ML-KEM-1024 ‖ psk; HKDF-SHA-384, sal = sala, info = transcripción; salen 128 bytes (cadena A→B 48, B→A 48, hash 32) | `cripto.js` sesionB |
| Cadena por mensaje | HMAC-SHA-384; clave de mensaje = 32 bytes (AES-256) | `cripto.js` cadenaB |
| KEM | ML-KEM-1024 (FIPS 203); ek 1568, dk 3168, ct 1568 | `pq-cnsa.js`, `cripto.js` kem*B |
| Firmas de la presentación | ECDSA P-384 sobre SHA-384 **y** ML-DSA-87, las dos sobre los mismos bytes; sin las dos, se descarta | `cripto.js` datosIniciaB/datosRespondeB |
| Relleno | mensajes a múltiplos de 1 KB; último trozo de archivo completo | `cripto.js` rellena |

## 4. Archivos y comprobantes
- **Archivos:** clave aleatoria de 256 bits propia de cada archivo (`crypto.getRandomValues`), AES-256-GCM, nonce = índice del trozo, datos asociados = [3] ‖ id del archivo ‖ índice; trozos de 192 KB. Huella SHA-256 del archivo entero, calculada por partes (`sha256.js`) para que coincida con `sha256sum`/`Get-FileHash`.
- **Comprobante de entrega e integridad** (`viaje.js`, se verifica sin conexión en `verificar/`):
  - sesión normal: firmado por los dos equipos con ECDSA P-256 sobre SHA-256; número «GC-».
  - sesión blindada: doble firma de cada equipo, ECDSA P-384 sobre SHA-384 **y** ML-DSA-87; número «GB-». La página reconstruye lo que muestra a partir de los campos firmados.

## 5. Llamadas de voz
- **Audio:** DTLS-SRTP, el cifrado estándar que negocia el navegador (`llamada.js`). No es poscuántico.
- **Señalización** (oferta, respuesta, candidatos y **huella del certificado DTLS**): viaja dentro del canal encriptado de extremo a extremo de la sesión (normal o blindada), así que hereda su cifrado.
- **Transporte:** siempre por el TURN de GUARDIANA (`iceTransportPolicy: 'relay'` fuera de local): ninguno ve la IP del otro, pero el TURN sí ve las IP.

## 6. Relé y servidor (nunca ven el contenido)
| Uso | Algoritmo | Nota |
|---|---|---|
| Credencial TURN de vida corta | HMAC-SHA-1(secreto, "caducidad:etiqueta") | `comunicaciones.js` ice(). Es el estándar «TURN REST API» (RFC 8489); SHA-1 aquí es un MAC con clave, no un uso sensible a colisiones. Plan: §7 |
| Nonce de la credencial TURN | `crypto.randomBytes(4)` | `comunicaciones.js` |
| Apretón de manos WebSocket | SHA-1(clave + GUID) | `ws.js`. Fijado por el RFC 6455; no es una elección de seguridad |
| Sello del acta de sesión de ZERO | HMAC-SHA-256 con una clave efímera de 32 bytes, truncado a 32 hex | `servidor.js` (interno de ZERO, no es Comunicaciones) |
| Huella de una descarga de ZERO | SHA-256 del archivo | `servidor.js` |
| Identificadores y claves efímeras | `crypto.randomBytes` | varios |

## 7. Plan de migración (ASVS 11.1.4)
Estado por prioridad; «hecho» = ya en el código publicado.

1. **Acuerdo de claves poscuántico** — *hecho* en las dos sesiones: ML-KEM-768 (normal) y ML-KEM-1024 (blindada), siempre en híbrido con ECDH, sin degradación silenciosa (una conversación que tuvo la capa PQ no vuelve a solo-ECDH sin permiso).
2. **Firmas poscuánticas** — *hecho en la blindada* (ML-DSA-87). **Pendiente en la sesión normal:** las firmas de identidad siguen siendo ECDSA P-256. Migración: ofrecer ML-DSA también en la normal, o dirigir lo sensible a la blindada (hoy ya se hace con el texto de la web).
3. **Código de 9 cifras** — baja entropía; cae fuera de línea si se captura el sobre del relé. Migración: un intercambio con contraseña resistente a diccionario (PAKE revisado: SPAKE2+ RFC 9383 o CPace), no diseñado desde cero. Mientras: priorizar la invitación larga (la blindada ya solo usa semilla de 256 bits).
4. **Credencial TURN con HMAC-SHA-1** — riesgo bajo (MAC con clave, vida corta), pero conviene pasar al mecanismo con SHA-256 cuando el coturn lo admita.
5. **Librería @noble/post-quantum 0.7.1** — fijar la versión exacta y comprobar sus fuentes byte a byte con el paquete de npm (ya se hace en los 11 archivos vendidos); añadir vectores de prueba oficiales y casos inválidos. No afirma tiempo constante en JavaScript: por eso no se puede acreditar ASVS 11.2.4.
6. **Protección del código servido** — objeción nº 1 de toda la criptografía en el navegador (el servidor entrega el JavaScript en cada visita). Fuera del alcance de este inventario; está en las notas de la ronda 71 como siguiente paso (anclaje del código).

## 8. Procedencia de las librerías
- **Web Crypto** del navegador: ECDSA, ECDH, HKDF, HMAC, AES-GCM, PBKDF2, SHA-256/384, `getRandomValues`.
- **@noble/post-quantum 0.7.1** (licencia MIT, de Paul Miller): ML-KEM-768, ML-KEM-1024 y ML-DSA-87, servida desde el propio sitio (`pq-mlkem.js`, `pq-cnsa.js`), construida con `SC/pq/build/`. Sus archivos se comprueban byte a byte con el paquete de npm.
