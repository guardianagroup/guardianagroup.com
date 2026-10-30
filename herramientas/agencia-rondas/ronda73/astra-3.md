# Ronda 73 · Astra 6 (gpt-6-astra, Cheaper Inference) · parte 3 (final de la 10, y 11–15)

29 oct 2026, ~22:10. Texto copiado entre «ASSISTANT OUTPUT» y «Response headers» (completo esta vez). Incluye las preguntas
12 (elegir el número, dueño 21:54) y 13 (cómo pasar el número, dueño 21:55).

### 10. Amenazas: filas pendientes

| Amenaza | Qué protege GUARDIANA | Qué queda sin cubrir |
|---|---|---|
| Relé y metadatos del remitente | E2E impide al relé leer el contenido, si está correctamente implementado. | Puede observar IP, horarios, tamaños y relaciones entre conexiones. Un TURN obligatorio evita revelar directamente la IP al interlocutor, pero el TURN la ve. No equivale a anonimato. |
| Ordenadores cuánticos | ML-KEM-768 aporta protección poscuántica al establecimiento de la sesión, con un combinador híbrido correcto. | ECDSA y ECDH P-256 no son poscuánticos. Tampoco debe anunciarse como poscuántico el TLS de la web o del relé sin comprobar su configuración. El emparejamiento ECDH sigue expuesto; comprometer sus semillas puede tener consecuencias adicionales según cómo se utilicen. ML-KEM no soluciona una autenticación falsificable por un atacante cuántico activo. |
| Teléfono desbloqueado robado | Las claves no exportables dificultan extraerlas mediante la API. | No impiden utilizarlas desde la aplicación: el ladrón podría leer mensajes accesibles, escribir y aceptar contactos. Un bloqueo adicional reduce exposición; no protege frente a un sistema comprometido. |

Sin cubrir por estas medidas: malware, código web malicioso, capturas del interlocutor, ingeniería social, denegación de servicio y pérdida de identidad sin un mecanismo de recuperación. La protección poscuántica del protocolo completo no queda demostrada solo por incorporar ML-KEM.

### 11. ¿Una web es más difícil de espiar que una aplicación nativa?

No como regla general. Ambas dependen del sistema operativo, de su implementación y de cómo reciben actualizaciones.

- Permisos y aislamiento: el navegador restringe lo que puede hacer una web y pide permisos para cámara y micrófono. Las aplicaciones nativas también tienen aislamiento y permisos, aunque pueden disponer de capacidades adicionales.
- Tiendas: sus revisiones y firmas aportan controles, no garantizan ausencia de espionaje. Evitarlas elimina intermediarios, pero también esos controles.
- Actualizaciones: una PWA permite corregir rápidamente errores; también permite introducir rápidamente código malicioso si se compromete quien lo publica.
- Código verificable: el código descargado puede inspeccionarse; eso no prueba que todos reciban el mismo ni que lo servido coincida con el código auditado. Una aplicación nativa también puede ser abierta y verificable.
- Punto débil web: el servidor y la cadena de publicación pueden entregar JavaScript que lea mensajes o utilice claves no exportables. No necesariamente sucede una descarga completa «cada vez»: existen cachés y service workers, pero la confianza en las actualizaciones permanece.

Texto para la web, cuatro líneas:

> GUARDIANA funciona desde el navegador, sin instalar desde una tienda.
> El navegador limita su acceso al dispositivo y solicita permisos para cámara y micrófono.
> El cifrado de extremo a extremo protege el contenido entre los dispositivos participantes.
> Ninguna web ni aplicación puede garantizar protección si el dispositivo o su código están comprometidos.

### 12. Elegir el número

| Opción | Ventaja | Riesgo principal |
|---|---|---|
| a) Elección libre con «ya está elegido» | Personalización directa. | Oráculo de disponibilidad, números personales, patrones previsibles y acaparamiento. |
| b) Aleatorio + «Otro número» + «Elegir el mío» | Buen valor por defecto y posibilidad de elegir. | Conserva los riesgos de a) cuando se utiliza la elección manual. |
| c) Solo aleatorio | Mantiene la distribución prevista y reduce elecciones identificativas. | Menor personalización; no elimina la enumeración del directorio ni el abuso de altas. |

Recomiendo b), con el azar como opción principal y la elección manual en un segundo nivel. Es una modificación explícita de «11 cifras aleatorias»: los números elegidos ya no tienen esa garantía.

Límites y avisos:

- Generación local con aleatoriedad criptográfica; Damm automático. Damm detecta errores, no aporta secreto.
- «No uses tu teléfono, fecha de nacimiento ni otros datos personales».
- Rechazar patrones especialmente triviales, sin prometer que eso detectará todos los datos personales.
- Limitar consultas y altas masivas con medidas antiabuso proporcionadas. Sin cuenta ni identidad externa, no puede garantizarse «un número por persona».
- No reservar números por pulsar «Otro número»: únicamente al confirmar el alta.
- Mostrar «No disponible; prueba otro», sin información del titular. Sigue siendo un oráculo, aunque el texto sea discreto.
- Con M, conocer un número ocupado no permite llamar unilateralmente: falta que su titular también añada al solicitante.

Sobre lo que sabe el operador: generar localmente evita enviar el número en claro, pero no vuelve irreversible su huella. El servidor conoce idn, sus claves públicas y metadatos. Saber el número tampoco concede acceso al contenido E2E.

Coste de invertir PBKDF2. Supuestos: objetivo uniforme, sin pistas, sal pública fija, salida suficientemente larga y búsqueda exhaustiva:

- Once cifras: 10^11 candidatos; promedio 5×10^10 evaluaciones PBKDF2.
- Diez cifras: 10^10 candidatos; promedio 5×10^9. Solo diez veces menos, no una diferencia enorme.
- Cada evaluación cuesta 100.000 iteraciones; la cifra Damm no multiplica el espacio.

Ejemplo hipotético, no un rendimiento medido: a 10.000 candidatos/segundo, serían unos 58 días frente a 5,8 días, en promedio. Son aproximadamente 1.389 frente a 139 horas: multiplicarlas por el coste horario del equipo da el coste monetario. El rendimiento y precio reales no lo sé sin medir hardware e implementación.

Prefijos telefónicos, fechas y datos conocidos reducen mucho la búsqueda. Además, la sal fija permite reutilizar trabajo entre muchos usuarios. PBKDF2 encarece la enumeración; no transforma un número corto en un secreto fuerte.

### 13. Cómo pasar el número

La explicación propuesta es esencialmente correcta, con matices:

- El número no es una llave de acceso: obtenerlo, por sí solo, no permite abrir unilateralmente un chat ni leer conversaciones existentes.
- Sí permite intentar identificar al usuario y preparar engaños. No debe tratarse como contraseña ni como único secreto del emparejamiento.
- La sustitución es el peligro principal al compartirlo: quien sustituye los números de ambos puede hacer que cada persona añada al atacante. La consulta al directorio confirmaría esas identidades sustituidas, no las personas pretendidas.

No exigiría exclusivamente Signal. WhatsApp y Signal ofrecen E2E en conversaciones personales; los chats ordinarios de Telegram no. El correo normalmente tampoco ofrece E2E. En todos importan los dispositivos, la autenticidad del interlocutor y la posibilidad de reenvío.

La clasificación necesita condiciones: QR en persona desde la aplicación del otro es una buena referencia; dictarlo sirve si reconoces realmente a la persona. Una llamada suplantada no es automáticamente más segura que un mensaje autenticado.

Sí: el QR debería incluir el número y huellas de las claves de identidad, con formato versionado. La aplicación debe comprobarlas y conservarlas; un cambio posterior exige una advertencia y nueva verificación.

«Verificar contacto» debe comparar un código derivado de ambas identidades criptográficas, presencialmente o mediante otro canal autenticado. Otro canal controlado por el mismo atacante no basta.

Enlace con fragmento #: es útil para evitar errores. El fragmento no se envía en la petición HTTP, pero lo leen el JavaScript de la página, extensiones y quien recibe el enlace. Puede quedar en historiales. Usaría dominio fijo, sin acortadores, con número y huellas; ningún secreto.

Texto para la persona mayor: «Comparte tu número con quien quieras hablar; para confirmar que es esa persona, comparad “Verificar contacto” en persona o por otro medio de confianza».

### 14. Una recomendación para construir hoy

Construir b): número aleatorio local por defecto y elección manual secundaria con avisos y límites.
Mantener la adición mutua sin avisos al destinatario por intentos unilaterales.
Compartir QR/enlace con número y huellas; incorporar verificación y alertas de cambio.
Auditar protocolo, publicación web y dependencias antes de prometer seguridad.

### 15. Una recomendación para el futuro

Diseñar y auditar una evolución poscuántica de extremo a extremo, incluyendo autenticación y emparejamiento, con publicación del cliente verificable y un procedimiento seguro de migración de identidades.
