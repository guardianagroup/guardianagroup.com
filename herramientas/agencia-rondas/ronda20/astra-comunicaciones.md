# Ronda 20 · Astra 6 (gpt-6-astra) · comunicaciones

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> ¿Cuál es el cifrado más fuerte que se puede tener hoy en las comunicaciones de GUARDIANA, para chat, voz y videollamada? Compara el protocolo de Signal (con PQXDH y su nuevo doble ratchet poscuántico) con MLS (RFC 9420) con suites poscuánticas. Para voz y vídeo, explica el cifrado de extremo a extremo: SRTP con claves de MLS o de Signal, SFrame para grupos y WebRTC con insertable streams. Cubre también:
> - cómo tener los menos metadatos posibles (remitente sellado, sin número de teléfono, que el servidor no sepa quién habla con quién);
> - la verificación de claves;
> - las copias de seguridad cifradas;
> - qué bibliotecas usar (libsignal, OpenMLS, mls-rs).
> Di qué es lo más fuerte que se puede usar hoy desde la web y qué NO debemos prometer.

---

## 1. Recomendación prioritaria

Para GUARDIANA, lo más fuerte **defendible hoy** es combinar:

- **E2EE con establecimiento híbrido clásico + poscuántico**, secreto hacia adelante y recuperación tras compromisos.
- **Cifrado autenticado**, usando AES-256 donde el protocolo lo permita.
- **TLS 1.3**, preferiblemente con intercambio híbrido X25519 + ML-KEM donde cliente y servidor lo soporten.

TLS protege el transporte; **no sustituye E2EE**. Tampoco basta con poner “AES-256”: importan las claves, su autenticación, la implementación y los dispositivos.

**Prioridad:** chat y llamadas individuales primero; grupos después; anonimato fuerte como proyecto separado. No diseñaría criptografía propia.

## 2. Signal frente a MLS

| Aspecto | Signal | MLS |
|---|---|---|
| Uso principal | Excelente opción para conversaciones individuales | Diseñado para grupos dinámicos y eficientes |
| Inicio poscuántico | **PQXDH** combina componentes clásicos y poscuánticos | **RFC 9420 no define suites poscuánticas**; requiere extensiones |
| Evolución de claves | Double Ratchet clásico más ratchet poscuántico | Actualizaciones de época mediante TreeKEM |
| Recuperación tras compromiso | Tras recibir material nuevo y seguro; depende del ratchet y del momento | Tras actualizaciones seguras y eliminación del acceso comprometido |
| Madurez poscuántica | Más consolidada para mensajería individual | Depende de la extensión, suite e implementación concretas |

**Corrección importante:** la evolución de Signal no es simplemente un “Double Ratchet poscuántico”. Combina el Double Ratchet con **SPQR, Sparse Post-Quantum Ratchet**, formando el **Triple Ratchet**. PQXDH protege el establecimiento inicial; SPQR incorpora renovación poscuántica durante la conversación, no necesariamente en cada mensaje.

Esto mejora la defensa frente a **“capturar hoy, descifrar mañana”**. No implica que toda la autenticación sea poscuántica: PQXDH conserva supuestos clásicos para autenticar identidades.

**MLS con suites híbridas poscuánticas puede ser excelente para grupos**, pero no basta con sustituir un algoritmo: deben cubrirse los intercambios relevantes de HPKE/TreeKEM, incorporación de miembros y actualizaciones. Las firmas son otra dimensión. No anunciar “MLS poscuántico” sin identificar especificación, cobertura, versión, auditoría e interoperabilidad.

## 3. Voz y vídeo: dónde termina realmente el cifrado

- **WebRTC convencional usa DTLS-SRTP.** Entre dos usuarios puede proteger extremo a extremo si se autentican correctamente las huellas DTLS. Con una **SFU**, normalmente protege usuario–servidor: la SFU puede acceder al contenido.
- **SRTP con claves derivadas de Signal o MLS** puede proporcionar E2EE si únicamente los participantes reciben esas claves. Deben derivarse claves separadas por emisor, dirección, flujo y época, con protección contra repetición.
- **Pero el navegador no ofrece una API general para reemplazar las claves SRTP por claves propias.** No lo plantearía como integración web directa.
- Para GUARDIANA web: **WebRTC Encoded Transforms**, conocidos como *insertable streams*, para cifrar los fotogramas antes de entregarlos al transporte. **SFrame** aporta un formato estandarizado adecuado, especialmente para grupos con SFU.

MLS puede distribuir el material de claves del grupo; Signal puede establecerlo para llamadas individuales. **SFrame no administra identidades ni membresía.** Hay que renovar claves cuando alguien entra o sale y comprobar compatibilidad real entre navegadores.

La SFU seguirá viendo información operativa: tamaños, tiempos, flujos y posiblemente participantes.

## 4. Reducir metadatos sin vender invisibilidad

- Identificadores aleatorios, sin teléfono obligatorio; evitar descubrimiento mediante subida de agendas.
- **Remitente sellado** para ocultar al servidor la identidad autenticada del emisor. No oculta automáticamente destinatario, IP, horarios ni correlaciones.
- Retención mínima, sin analítica invasiva; tokens de acceso poco vinculables y separación entre autenticación, entrega y medios.
- TURN obligatorio puede ocultar las IP entre interlocutores, pero el relay las conoce.
- Para reducir el conocimiento de “quién habla con quién”: relays independientes, mecanismos de acceso privados, relleno y, eventualmente, redes de anonimato. Añaden coste y latencia; algunos encajan mal con llamadas.

**E2EE, Signal y MLS no ocultan por sí solos el grafo social.**

## 5. Claves y copias

**Verificación:** QR o números de seguridad, alertas ante cambios, dispositivos vinculados visibles y transparencia de claves verificable con controles independientes. MLS también necesita una política de identidad.

**Copias:** cifrado en el cliente con secreto de recuperación independiente y suficientemente aleatorio. Nunca claves recuperables mediante un simple restablecimiento de contraseña. No restaurar estados antiguos del ratchet que puedan reutilizar claves. Una copia del historial amplía el impacto de una filtración.

## 6. Bibliotecas y límites

- **libsignal:** primera candidata para Signal; revisar licencia AGPL, soporte y versiones. Sus bindings Node no equivalen a un SDK de navegador.
- **OpenMLS / mls-rs:** candidatas Rust para grupos; verificar WASM, proveedor criptográfico, almacenamiento y soporte poscuántico concreto.

**Límite decisivo:** JavaScript malicioso servido por GUARDIANA podría robar claves. ZERO tampoco equivale a un extremo local si el servidor procesa allí el contenido descifrado.

Prometan **E2EE verificable y resistencia poscuántica delimitada**, no anonimato absoluto, invulnerabilidad cuántica ni protección frente a dispositivos comprometidos.
