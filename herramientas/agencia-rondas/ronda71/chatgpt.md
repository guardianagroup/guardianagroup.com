# Ronda 71 · ChatGPT («Alta») · 27 Oct 2026, 23:09

Conversación «Diseñar sesión blindada» (la misma de la ronda 70). Recibió la pregunta sin los puntos h) (red de dos saltos) ni i) (llamadas). Registro fiel de la respuesta (41.900 caracteres), ordenado; el texto completo está en esa conversación.

Nota de lectura: la pregunta describía la blindada con ML-DSA-65; lo construido usa la suite CNSA 2.0 completa (P-384, ML-KEM-1024, ML-DSA-87, SHA-384, AES-256). Las críticas de diseño se aplican igual.

## 1. Veredicto del equipo rojo
- Base criptográfica «interesante y diferenciada», pero hoy no se puede demostrar que sea equivalente o superior a Signal, Threema o Matrix/Element: la seguridad depende del protocolo completo y de la implementación, no solo de los algoritmos.
- Cinco asuntos prioritarios: (1) el código de 9 cifras cae por búsqueda exhaustiva fuera de línea si se captura el sobre; PBKDF2 sube el coste pero no añade entropía; (2) TOFU sin verificar fija una identidad falsa en el primer contacto; (3) un JavaScript malicioso servido desde el origen compromete archivos y claves utilizables (no exportable ≠ inutilizable); (4) la renovación periódica no demuestra por sí sola recuperación tras compromiso (Signal: Double Ratchet + SPQR desde 2025); (5) los comprobantes firmados reducen la negabilidad: decisión de producto, no mejora gratuita.
- Regla: clasifica por daño si se cumplen las condiciones (hecho / riesgo por diseño / pendiente de prueba). No ejecutó ataques ni auditó el repositorio: nada equivale a una certificación.

## A. Ocho ataques
1. **Código comprometido en el navegador (crítica).** Publicación, dependencia o XSS → el código lee archivos antes de encriptar y usa las claves. La blindada no lo cierra. Arreglo: origen exclusivo para Comunicaciones sin scripts de terceros; CSP estricta y Trusted Types; compilaciones deterministas; dependencias fijadas; publicaciones protegidas y registro verificable de versiones autorizadas; para sesiones críticas, estudiar un cliente empaquetado verificable localmente. Prueba: alterar un script en laboratorio y ver si se detecta antes de exponer secretos.
2. **Capturar la invitación y adelantarse (crítica).** Con la semilla se calcula la sala y las claves derivadas; el riesgo es la incorporación no autorizada y el ataque activo a la negociación (conocer la semilla no descifra una sesión ya establecida). Blindada: parcial. Arreglo: tratar el enlace como credencial de alto valor; **un solo uso; dos participantes; bloqueo de sustituciones de identidad; caducidad; nada transferible hasta la verificación**; **quitar el fragmento de la URL con history.replaceState** nada más importarlo (sin venderlo como borrado del historial).
3. **Secuestro del primer contacto (crítica).** TOFU detecta cambios, no quién estaba detrás al principio. Blindada: solo si las 60 cifras se comparan por un canal auténtico, fuera de la conversación. «No basta con pulsar "Verificado" en los dos navegadores»; sin canal independiente, permitir cancelar o seguir con advertencia expresa, nunca declarar la identidad verificada.
4. **Relé malicioso (alta).** Retrasa, descarta, reordena, duplica; fuerza reconexiones, agota memoria, interrumpe renovaciones, busca bajar el modo. La blindada no lo cierra. Arreglo: **máquina de estados estricta; épocas autenticadas; identificadores de dirección y sesión; antiduplicados; confirmación de cada renovación; prohibido bajar de modo tras una caída.** Prueba: relé adversarial local durante miles de transiciones.
5. **Invitación normal fuera de línea (crítica si se captura el sobre).** Con el sobre y la sal, cada candidato cuesta 300.000 iteraciones y la etiqueta GCM confirma el acierto. La blindada sí lo cierra (semilla de 256 bits, sin sobre). Para la sesión normal: cambiar el mecanismo, no subir iteraciones.
6. **Errores en los trozos de archivo (crítica si se repite nonce).** La descripción no define los nonces de los trozos. Arreglo: **definir formalmente nonce, clave, dirección, transferencia, época, índice, reintentos y recuperación**; reenviar el mismo cifrado puede valer, reencriptar bytes distintos con la misma clave y nonce, nunca; rechazar índices duplicados inconsistentes y archivos cuyo hash total no coincida (ASVS 11.3.4).
7. **Comprobantes reutilizados o manipulados (alta).** La firma impide alterar lo firmado, no que una parte firme datos falsos ni que la interfaz muestre otra cosa. Arreglo: manifiesto canónico inequívoco (identificador, versión, participantes, archivo, sesión, resultado, hash de la transcripción); el verificador reconstruye lo que muestra **solo a partir de los campos firmados**; lo no autenticado se marca como tal. El comprobante dice «este equipo declaró haber recibido y validado estos bytes», no «una persona leyó y aceptó el documento».
8. **Metadatos (alta para privacidad).** IP, sala, tiempos, trozos y volúmenes permiten correlacionar. Blindada: parcial. Arreglo: minimizar registros, aislar relés, relleno por rangos, separar operadores si el modelo lo pide, medir la filtración residual. Session usa Onion Requests (con límites de rendimiento); GUARDIANA no puede afirmar una protección equivalente con relé directo.

## B. Diseño de la blindada (a–g)
| Cambio | Decisión | Condición |
|---|---|---|
| a) Invitación de 256 bits | Mantener | Distribución protegida y uso único |
| b) Verificación obligatoria | Mantener | Canal independiente y confirmación mutua real |
| c) Renovación periódica híbrida | **Rediseñar antes de publicar** | Protocolo de transición de claves y épocas |
| d) Relleno | Mantener con ajustes | Proteger el tamaño sin ocultar las limitaciones |
| e) Identidad ML-DSA | Mantener con cambios | **Firmar también la negociación**, no solo el comprobante |
| f) Sin límite de velocidad | Probar antes de activar | Evitar agotar CPU, memoria y red |
| g) Borrado e informe | Mantener con precisión | Distinguir destrucción lógica de borrado físico |

- No publicaría c) ni e) como garantías operativas hasta probar transición, autenticación y compatibilidad.
- **Qué firmar (11):** las dos identidades autentican la negociación completa: claves ECDSA y ML-DSA, ECDH de identidad, efímeras, clave y ciphertext ML-KEM, sala y roles, versión y perfil, las dos épocas y el historial de negociación; los dos lados calculan la misma transcripción.
- **Orden (12):** preparar (validar invitación, versión, límites, unicidad) → negociar (transcripción inequívoca) → autenticar (ECDSA + ML-DSA sobre la transcripción con el perfil) → derivar y **confirmar la clave mutuamente** → verificar a las personas → autorizar el contenido → renovar y cerrar. Una firma válida sobre una transcripción incompleta nunca autoriza contenido.
- **HKDF (13):** los tres DH con roles, el secreto ML-KEM, la PSK; en renovaciones, la raíz anterior + material nuevo. Contexto: protocolo y versión, perfil y algoritmos, sala, claves públicas clásicas y PQ, efímeras, ek y ct, roles, épocas, hash de la transcripción; codificación canónica con etiquetas y longitudes; claves separadas por finalidad. «Propuesta de requisitos, no demostración formal.»
- **Renovación (14):** el temporizador no basta: fallos si A destruye la clave vieja mientras B recibe trozos de la época anterior, o con renovaciones simultáneas. Estados ACTIVA → PREPARANDO → CONFIRMANDO → NUEVA ÉPOCA → CIERRE DE LA ANTERIOR, con confirmaciones autenticadas y reglas para retrasos, retransmisiones y simultaneidad. Tabla de borrado: efímera tras derivar y confirmar; privada ML-KEM tras la negociación; secreto inicial tras derivar; clave de mensaje tras usarla; clave de archivo al cerrar la transferencia; raíz anterior tras confirmar la transición; identidades hasta revocación. Definir qué pasa al llegar al límite de 64 épocas (nunca reiniciar contadores con las mismas claves).
- **Noble 0.7.1 (15):** sin auditoría independiente completa y sin tiempo constante garantizado en JavaScript; no prueba vulnerabilidad, pero impide afirmar ASVS 11.2.4. Fijar versión, vectores oficiales, casos inválidos, interoperabilidad entre navegadores. La clave ML-DSA guardada encriptada está descifrada mientras se firma: no resiste un JavaScript comprometido.
- **Cambio de identidad (16):** la blindada cambia el número de seguridad; migración con declaración de vinculación firmada por la identidad clásica; perfiles diferenciados; una reconexión que pierda ML-DSA no puede convertirse en sesión normal.
- **Relleno (17):** el último trozo relleno oculta el tamaño exacto pero no el número de trozos; clases de relleno para mensajes y archivos, tamaño real encriptado y comprobado. No oculta cuántos mensajes, duración, IP, inicio y fin, patrón temporal.
- **Velocidad (18):** no ilimitada: control dinámico por capacidad, memoria, tasas por sala, control de flujo y aislamiento entre sesiones.

## C. Código de 9 cifras
- 10⁹ códigos ≈ 29,9 bits. Peor caso 10⁹ × 300.000 = 3×10¹⁴ evaluaciones HMAC; medio 1,5×10¹⁴.
- Tiempo medio / peor: 1.000 códigos/s → 5,8 / 11,6 días; 10.000 → 13,9 / 27,8 h; 100.000 → 1,39 / 2,78 h; 1.000.000 → 8,3 / 16,7 min. Tabla condicional: no atribuye velocidades a ninguna GPU ni estima el coste en dólares sin medirlo.
- Los diez minutos y el uso único solo valen contra intentos en línea; una copia del sobre se puede atacar después de caducar.
- Qué haría: invitación con al menos 128 bits (idealmente la semilla de 256) por enlace o QR; si hace falta un código corto, un PAKE especificado y revisado (no diseñarlo desde cero). ASVS 5.0 pide al menos 128 bits para valores impredecibles. Para esta noche: mantener el código normal con advertencia y dar prioridad al mecanismo largo; recomendar la blindada para operaciones sensibles.

## D. Comparación
| Sistema | Fortalezas documentadas | Frente a GUARDIANA |
|---|---|---|
| Signal | PQXDH, Double Ratchet, SPQR/Triple Ratchet, verificación | Más madurez y renovación continua; GUARDIANA empieza sin teléfono |
| Threema | Sin teléfono, Ibex con PFS y análisis formal, auditorías | Más seguridad evaluada; GUARDIANA tiene ML-KEM |
| Session | Onion routing, red descentralizada, sin teléfono ni correo, entrega asíncrona | Protege la IP; GUARDIANA tiene el intercambio ML-KEM |
| Element/Matrix | Olm/Megolm, dispositivos verificados, federación, autoalojamiento | Ecosistema y empresa; GUARDIANA, entrega con comprobante firmado |

- Datos que cita como nuevos: Signal (agosto de 2026) añadió verificación automática de claves con transparencia, «la verificación obligatoria por sí sola no superaría esa prestación»; Threema (febrero de 2026) anunció con IBM Research la incorporación poscuántica, sin acreditar la transición; Session sigue presentando el Protocol V2 como desarrollo; Element anunció (octubre de 2026) llamadas encriptadas descentralizadas. Pendiente de contrastar con fuente oficial.
- Tres diferenciadores en semanas (sin afirmar que sean inéditos en el mundo): (1) **pasaporte criptográfico del archivo**: dos equipos firman el mismo manifiesto y el verificador sin conexión comprueba archivo, firmas, versiones y eventos (2–4 semanas); (2) **laboratorio adversarial reproducible**: relé propio y batería publicada de ataques (cambio de identidad, duplicación, pérdida, reordenación, degradación, comprobantes) con versiones fijadas (2–4 semanas); (3) **radiografía de privacidad de la sesión**: qué ha observado el propio cliente (relé, IP conocida por el servicio, volumen visible, tiempos, relleno, estado criptográfico), separando lo medido de lo inferido (2–3 semanas).
- Frase defendible: «Comprueba a quién te conectas, verifica que el archivo llegó íntegro y examina qué garantías reales ofreció la sesión». No: «el mensajero más seguro del mundo».

## E. Signal y ASVS 5.0 nivel 3
| Propiedad | v3 actual | Blindada a–g |
|---|---|---|
| Extremo a extremo | Sí, por diseño | Sí, por diseño |
| Mensajes anteriores tras comprometer claves actuales | Parcial (depende del borrado) | Parcial (verificar la renovación) |
| Recuperación tras compromiso | No acreditada | No acreditada con una mera renovación periódica |
| PQ pasiva del secreto inicial | Sí, híbrido | Sí, híbrido |
| Autenticación PQ activa | No (ECDSA) | Prevista; requiere firmar toda la negociación |
| Autenticación humana | Opcional | Obligatoria, con canal auténtico |
| Resistencia a repetición | Parcial | Requiere pruebas de estados |
| Negabilidad | Limitada por firmas | Más limitada |
| IP frente al relé | No | No |
| Integridad verificable de archivos | Sí | Sí, firmas reforzadas |

- Distinción: la cadena HMAC protege lo anterior si se borra; sin material nuevo, quien roba el estado calcula lo siguiente. Un rekey híbrido nuevo ayuda a recuperar si el atacante ya no está dentro, no manipula la negociación y la autenticación sigue siendo fiable. «La sesión se cura sola cada pocos minutos» sería incorrecto.
- Negabilidad: dos políticas claras, «conversación confidencial» y «entrega acreditable»; no venderlas como si dieran a la vez las mismas garantías.
- ASVS V11 (todos pendientes de acreditar): 11.1.3 descubrimiento de criptografía; 11.1.4 inventario y plan de migración; 11.2.4 tiempo constante (no demostrable con Noble JS); 11.2.5 fallo seguro; 11.3.4 nonces (archivos por inspeccionar); 11.5.2 aleatoriedad bajo demanda; 11.6.2 parámetros de intercambio (negociación completa por validar); 11.7.1 memoria; 11.7.2 minimización.
- ASVS V12 y otros: 12.1.2 TLS con FS (configuración no acreditada); 12.1.4 revocación («no sé»); 12.1.5 ECH; 12.3.5 autenticación entre servicios internos; 8.3.1 autorización en capa confiable (inspeccionar el relé); 16.3.2 y 16.4.2 registros. No se puede declarar cumplimiento de ASVS L3, ni hoy ni con la blindada.
- Batería interna de aceptación (27): identidad inyectada → bloqueo; clave ML-DSA sustituida → fallo; sin ML-KEM → rechazo sin degradar; repetición → ninguna segunda entrega; trozos reordenados → íntegro o fallo cerrado; nonce repetido → imposible; renovaciones simultáneas → estado consistente; confirmación de rekey perdida → ningún estado ambiguo; reconexión con perfil inferior → bloqueo; byte del archivo cambiado → rechazo; campo firmado cambiado → rechazo; inundación → contención por sala; cierre a mitad → estado consistente; migración de identidad → vinculación verificada. Además: dos pestañas, reinicios, navegador suspendido, reloj alterado, versiones distintas, fallos de almacenamiento.
- Orden de trabajo (28): auditar invitaciones, autenticación, nonces, archivos y comprobantes y rechazar degradaciones → identidad híbrida completa → renovación segura → código y navegador → evidencias y privacidad → publicar resultados de pruebas sin secretos.
- **Decisión para esta noche (29):** aceptar invitación de 256 bits, comprobación obligatoria, firma híbrida de comprobantes, relleno graduado e informe de cierre; bloquear hasta superar pruebas la nueva negociación ML-DSA, la renovación periódica, la transición de épocas y quitar el límite sin controles sustitutivos; **prohibido anunciar** «más seguro que Signal», «seguridad mundial máxima», «recuperación garantizada tras ataque» o «ASVS nivel 3 cumplido».
- Conclusión: destacar por lo que se puede demostrar; la oportunidad es una sesión confidencial inmediata con identidad comprobada, entrega acreditable, pruebas adversariales reproducibles y transparencia de metadatos. Las pruebas internas no sustituyen una evaluación independiente cuando se quiera convencer a grandes empresas. Frase para el equipo: «Ninguna garantía nueva se publica sin una prueba reproducible de lo que protege, un modelo claro de lo que no protege y un procedimiento seguro para fallar».
