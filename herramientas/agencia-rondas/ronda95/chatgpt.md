# Ronda 95 · ChatGPT (High) · 19 nov 2026

…
Mostrar más
Ha pensado durante 8m 8s
ChatGPT dijo:
RONDA 95 — GUARDIANA GROUP S.A.S.

Informe de arquitectura criptográfica, posicionamiento competitivo y comunicación pública

Proyecto: ELIXIR — www.house1718.com
Fecha de referencia: 19 de noviembre de 2026
Alcance: chat y transferencia de documentos y archivos en el navegador. Sin instalación, llamadas, voz, vídeo ni mensajes de audio.

1. Dictamen estratégico de la agencia

Nuestra recomendación es desarrollar ELIXIR como un sistema de intercambio confidencial de documentos con identidad verificada, protección criptográfica evolutiva y detección explícita de determinadas anomalías.

No recomendamos intentar diferenciarlo simplemente acumulando algoritmos. La verdadera mejora respecto a CRISTALE debe estar en la combinación de tres capacidades:

Continuidad de la protección: renovar los secretos criptográficos durante la conversación, no únicamente cada cinco minutos, e incorporar mecanismos que permitan recuperarse de determinadas exposiciones temporales de claves.

Identidad y documentación verificables: dificultar la suplantación, controlar los cambios de identidad y permitir demostrar criptográficamente qué documento se recibió y qué confirmó cada participante.

Seguridad observable: indicar claramente qué ha verificado el navegador, qué anomalías ha detectado y cuáles quedan fuera de su capacidad de observación.

La tecnología debe distinguirse de las garantías. Un sistema puede utilizar algoritmos estandarizados y, aun así, presentar fallos en su protocolo, en la implementación, en el navegador o en la entrega de la página.

NIST publicó ML-KEM, ML-DSA y SLH-DSA el 13 de agosto de 2024, mientras que Signal presentó su trinquete postcuántico SPQR el 2 de octubre de 2025. Son referencias técnicas pertinentes, pero su existencia no valida automáticamente una implementación propia. 
NIST
+2

1.1. La diferencia comercial

CRISTALE — Comunicación privada entre personas

Conversaciones y archivos cifrados, con verificación mutua de identidad y sesiones temporales.

ELIXIR — Intercambio documental de alta confidencialidad

Incorpora continuidad de confianza, protección criptográfica durante la sesión, controles documentales y alertas verificables.

Frase diferenciadora propuesta:

CRISTALE protege la conversación. ELIXIR añade verificación continua de identidad, claves y documentos.

La segunda parte solo debe publicarse una vez implementados y probados los mecanismos correspondientes.

1.2. Tres decisiones que deben resolverse antes de programar

Primera: identidad persistente o ausencia de almacenamiento. Una libreta de contactos con claves fijadas necesita recordar claves o huellas entre sesiones. Si no se guarda absolutamente nada, el navegador no puede reconocer por sí solo a una persona de una visita anterior. La alternativa es una libreta local cifrada, opcional y persistente, o importar una referencia de identidad previamente conservada fuera de ELIXIR.

Segunda: comprobantes firmados o negabilidad. Un comprobante exportable con firmas de las partes puede aportar evidencia técnica de aceptación o recepción, pero reduce la negabilidad respecto a ese comprobante. Son dos objetivos diferentes. Recomendamos conservar el chat sin firmas exportables por defecto y exigir consentimiento explícito para generar un acta documental.

Tercera: proteger el contenido o proteger también las relaciones. Un servidor que recibe directamente las conexiones puede observar direcciones IP, horarios y pertenencia a una sala. El relleno de tráfico no elimina esa información. Sin una infraestructura adicional de ocultación de origen, la afirmación correcta es que ELIXIR protege el contenido y reduce algunas señales de actividad, no que oculta completamente quién se comunica con quién.

Estas tres decisiones condicionan la arquitectura, el precio de cada modalidad y las afirmaciones admisibles en la web.

2. Arquitectura propuesta para ELIXIR
2.1. Evaluación de las once propuestas

La escala de coste es una valoración relativa de ingeniería —bajo, medio, alto o muy alto—, no un presupuesto. El riesgo se refiere principalmente a introducir defectos o complejidad adicional.

Propuesta

	

Decisión

	

Valor / riesgo / coste

a) Triple KEM: P-384 + ML-KEM-1024 + HQC

	

No en producción inicial

	

Diversidad matemática real; riesgo alto, coste alto

b) Tercera firma SLH-DSA

	

No por defecto

	

Diversidad criptográfica; riesgo medio, coste medio

c) Trinquete por mensaje y postcuántico periódico

	

Sí, prioritario

	

Valor muy alto; riesgo alto, coste alto

d) AES-GCM + XChaCha20 en cascada

	

No

	

Beneficio adicional incierto; riesgo medio, coste medio

e) PAKE o invitación dividida

	

Sí a invitación dividida opcional

	

Valor medio/alto; riesgo bajo/medio

f) Identidades fijadas y bloqueo de cambios

	

Sí

	

Valor muy alto; riesgo medio, coste medio

g) Documentos, huellas y actas

	

Sí, por fases

	

Valor muy alto; riesgo medio/alto, coste medio/alto

h) Integridad de la página

	

Sí, con límites expresos

	

Valor alto; riesgo medio, coste medio

i) Tráfico constante para mensajes y archivos

	

Sí, configurable

	

Valor medio/alto; coste operativo potencialmente alto

j) Detección y avisos explicativos

	

Sí, prioritario

	

Valor muy alto; riesgo medio, coste medio

k) Aislamiento del contenido y control de versiones

	

Sí, prioritario

	

Valor muy alto; riesgo medio, coste medio

a) Triple acuerdo de claves: ¿merece la pena HQC?

La idea tiene fundamento criptográfico, pero no recomendamos desplegarla todavía.

NIST seleccionó HQC el 11 de marzo de 2025 precisamente como alternativa basada en una familia matemática distinta de ML-KEM. Su objetivo es disponer de una segunda vía si apareciesen debilidades en la familia principal. La selección no equivale a la publicación de un estándar final. 
NIST
+2

Para producción recomendamos conservar:

ECDH P-384 efímero.

ML-KEM-1024.

Derivación híbrida HKDF-SHA-384 con separación de dominios, identificadores de algoritmo, claves públicas y transcripción completa del acuerdo.

El protocolo debe definir y verificar rigurosamente el combinador; no basta con concatenar secretos sin especificar cómo se autentican y vinculan a la sesión.

Como referencia, el RFC 9954 de julio de 2026 define consideraciones para acuerdos híbridos y el RFC 10024 de agosto de 2026 contempla expresamente la pareja P-384 + ML-KEM-1024 para TLS 1.3. Esto respalda la elección de las primitivas, no convierte automáticamente el protocolo de ELIXIR en TLS ni valida su propio combinador. 
Hybrid Key Exchange in TLS 1.3
+2

Implementación HQC en navegador:

Biblioteca

	

Situación comprobada

	

Dictamen

@noble/post-quantum 0.7.1

	

Incluye ML-KEM, ML-DSA y SLH-DSA; no HQC en sus exportaciones publicadas

	

Mantener para las primitivas compatibles ya utilizadas, con pruebas

open-quantum-safe/liboqs

	

Implementa HQC y otros algoritmos

	

Referencia para evaluación y pruebas cruzadas

@oqs/liboqs-js

	

Envoltura JS/WASM, con HQC-128/192/256

	

Laboratorio, no producción inicial

Classic McEliece

	

Implementaciones disponibles en el ecosistema OQS; claves públicas voluminosas

	

Descartar para este producto

El propio repositorio de liboqs-js declara que está orientado a investigación y prototipos, y advierte expresamente sobre las limitaciones de uso productivo. 
GitHub
+2

Decisión: preparar la arquitectura para incorporar HQC en una versión futura, pero no anunciar un triple sistema hasta disponer de una implementación suficientemente revisada, parámetros estabilizados y pruebas reproducibles en los navegadores soportados.

b) Añadir SLH-DSA a las firmas

SLH-DSA está definido en FIPS 205, publicado el 13 de agosto de 2024. Su construcción basada en funciones hash proporciona diversidad frente a las firmas basadas en retículos. Sus firmas son considerablemente más grandes que las de ML-DSA, según la documentación de la biblioteca noble. 
CSRC
+2

Recomendamos:

ML-DSA-87 + ECDSA P-384 para autenticar identidades efímeras y acuerdos de sesión.

Reservar SLH-DSA para experimentación o para manifiestos de versiones del software, donde la frecuencia de firma es baja.

No firmar cada mensaje con tres algoritmos.

La protección real depende también de cómo se autentican las claves públicas. Tres firmas creadas por un código malicioso o por una identidad falsa no solucionan el problema de origen.

c) Trinquete por mensaje y recuperación postcuántica
Prioridad criptográfica principal

Esta es la mejora más importante respecto al diseño de CRISTALE descrito.

El Double Ratchet de Signal deriva claves distintas para los mensajes y combina evolución simétrica con nuevos intercambios de claves. Su evolución SPQR añade una renovación postcuántica continua; Signal anunció esta ampliación el 2 de octubre de 2025 y publicó una especificación técnica revisada en noviembre de ese año. 
signal.org
+1

Proponemos dos mecanismos complementarios:

Esquema conceptual de evolución de claves; no representa un protocolo formal completo.

Mecanismo 1 — por mensaje. Cada dirección utiliza una cadena independiente que genera una clave AEAD nueva para cada mensaje. Después de avanzar, el sistema elimina las claves anteriores, sujeto a las limitaciones de memoria de JavaScript y del navegador. El receptor conserva únicamente las claves pendientes necesarias dentro de una ventana acotada para mensajes fuera de orden.

Mecanismo 2 — renovación asimétrica. Incorporar secretos nuevos mediante intercambios ECDH y postcuánticos autenticados, para limitar los efectos de determinadas exposiciones temporales de material criptográfico.

No recomendamos programar una imitación rápida de SPQR. Puede estudiarse su especificación e implementar un diseño equivalente solo tras definir formalmente el estado del protocolo y completar pruebas intensivas. La recuperación después de una exposición exige que el atacante haya perdido acceso y que entre material nuevo que no controle; no ocurre simplemente por cambiar un contador.

Decisión de ingeniería: diseñar y probar primero el trinquete simétrico y el clásico, y después incorporar la renovación postcuántica sin rebajas silenciosas a modos anteriores.

d) ¿Cifrado AES-256-GCM + XChaCha20-Poly1305?

No recomendamos la cascada para la primera versión.

AES-GCM y las construcciones ChaCha20-Poly1305 son opciones criptográficas conocidas. Sin embargo, utilizar ambas consecutivamente obliga a gestionar dos claves, dos conjuntos de nonces, dos capas de autenticación y más posibilidades de error.

El estándar HPKE, RFC 9180 de febrero de 2022, establece un modelo con elección explícita de KEM, KDF y AEAD. 
rfc-editor.org

Nuestra propuesta es:

AES-256-GCM mediante Web Crypto para mensajes y archivos.

Claves independientes derivadas para cada dirección y para cada archivo.

Nonces únicos por clave, construidos a partir de identificadores y contadores según el protocolo.

Campos autenticados que incluyan sesión, dirección, tipo, secuencia y versión.

Una segunda suite de cifrado solo como alternativa explícita y probada, no como cascada obligatoria.

La ventaja de ELIXIR debe venir del protocolo de claves y de la autenticación, no del número de cifradores consecutivos.

e) Invitaciones, PAKE y canales independientes

OPAQUE dispone de una especificación, el RFC 9807 de julio de 2025, pero está diseñado como PAKE aumentado entre cliente y servidor. No es la opción natural para que dos personas intercambien directamente un secreto de invitación. 
rfc-editor.org

En CRISTALE, un código realmente aleatorio de 80 bits ofrece un espacio de búsqueda muy grande. Su problema principal no es necesariamente el ataque de diccionario, sino que otra persona lo vea, lo reciba o lo reutilice.

Además, un PAKE no impide la entrada de alguien que ya conoce el secreto completo.

Para ELIXIR proponemos:

Enlace de invitación con secreto aleatorio de 256 bits, generado localmente.

Secreto en el fragmento de la URL, cuando se use enlace, y evitando que la aplicación lo envíe al servidor o a terceros.

Acceso de un solo uso lógico, con control de capacidad para exactamente dos participantes.

Opción de dividir la invitación en dos componentes aleatorios que deben reunirse para entrar, enviados por canales diferentes.

Confirmación humana obligatoria de identidad mediante un canal previamente confiable.

La división de la invitación sirve para reducir el riesgo de que una sola comunicación comprometida revele todo el acceso. No debe presentarse como una solución contra dos canales comprometidos ni contra el engaño a ambos participantes.

f) Antisuplantación reforzada

Sí, pero con una distinción imprescindible: clave de sesión frente a identidad del contacto.

Una clave nueva en cada sesión es compatible con una identidad persistente: basta con que las nuevas claves de sesión estén vinculadas criptográficamente a la identidad previamente reconocida.

Proponemos una tarjeta de identidad verificada con:

Huella criptográfica de una clave de identidad estable.

Nombre descriptivo elegido por el usuario.

Fecha de la primera verificación.

Historial local de cambios autorizados.

Bloqueo ante cualquier sustitución inesperada.

Procedimiento de cambio que requiera una nueva verificación por un canal independiente.

En el modo empresarial, un cambio no debería resolverse simplemente pulsando «Aceptar igualmente».

Las cuatro palabras actuales deben comprometer criptográficamente las claves, las identidades y la transcripción del acuerdo. Si se generan a partir de una lista de 2.048 palabras, cuatro palabras ofrecen 44 bits de comparación, siempre que su selección sea uniforme. Añadir palabras puede reducir la probabilidad de una coincidencia falsa, pero no sustituye la verificación humana por un canal fiable.

Signal utiliza números de seguridad y exige aprobación manual cuando cambia una identidad previamente verificada; Apple ha desarrollado mecanismos de verificación de contactos y transparencia de claves. Son referentes documentados, no garantías transferibles automáticamente a ELIXIR. 
Signal Support
+1

Propuesta final: cuatro palabras obligatorias, huella larga y QR disponibles para comprobar con mayor precisión, identidad fijada cuando exista almacenamiento local voluntario y bloqueo de sustituciones.

g) Documentos, metadatos y actas

Esta debería ser la característica empresarial más visible.

Función

	

Recomendación

Huella SHA-256 del archivo

	

Sí, antes y después del tratamiento

Limpieza de EXIF en imágenes

	

Sí, opción local

Eliminación de metadatos PDF/Office

	

Sí, solo en formatos probados y con confirmación

Documentos firmados digitalmente

	

Conservar original; avisar antes de cualquier modificación

Vista protegida

	

Sí, con restricciones de interfaz, sin prometer impedir copias

Acta de entrega

	

Sí, exportable y opcional

Análisis de archivos peligrosos

	

Validación y tratamiento en entorno aislado; no ejecutar contenido

OWASP recomienda tratar las cargas de archivos como una superficie de ataque y contempla medidas como reconstrucción del contenido cuando sean aplicables. Esto cobra especial importancia al procesar PDF y Office. 
OWASP Cheat Sheet Series

Diseño del acta ELIXIR

El sistema puede crear un documento verificable con:

Huella SHA-256 de los bytes exactos recibidos.

Tamaño, nombre visible y tipo declarado.

Identificadores criptográficos de ambas identidades.

Confirmación explícita de recepción y, si se solicita, de aceptación.

Firmas de ambos participantes.

Versión del protocolo y declaración de la fecha/hora comunicada por los equipos.

Es esencial distinguir recepción técnica, lectura y aceptación del contenido. Tampoco una firma digital prueba por sí sola la identidad civil de una persona o la validez jurídica de un acto.

Sin un servicio externo de sellado temporal, la hora registrada no constituye una prueba independiente del instante real. Para una clínica o despacho, conviene que el propio comprobante explique estas limitaciones.

h) Integridad de la aplicación web

Recomendamos aplicar conjuntamente:

HTML, JS y WASM publicados mediante versiones inmutables.

SRI en recursos admitidos, sin dependencias de terceros innecesarias.

CSP estricta, evitando scripts inline arbitrarios y eval.

Trusted Types donde exista compatibilidad.

Referrer-Policy: no-referrer, aislamiento de origen y controles contra contenido incrustado.

Manifiestos firmados de las versiones y compilaciones reproducibles.

Monitorización externa independiente que compare el código realmente servido.

OWASP documenta CSP como mitigación de ciertas inyecciones de scripts; MDN explica que SRI verifica la integridad de subrecursos y que Trusted Types reduce determinadas superficies de inyección en el DOM. 
OWASP Cheat Sheet Series
+2

Límite esencial: si el servidor controla el HTML inicial, puede intentar sustituir tanto las instrucciones como las huellas que ese HTML contiene. Una página de verificación alojada bajo el mismo control no soluciona por sí sola ese riesgo.

La alternativa más honesta es publicar las versiones firmadas, ofrecer un verificador independiente y usar observadores externos. En un navegador sin una referencia previa de confianza, no podemos garantizar que un usuario detecte cualquier alteración del código suministrado.

i) Ocultación de actividad y tamaño de archivos

Las tramas de 1 KB de CRISTALE constituyen una base útil para disimular diferencias de tamaño, pero hay que medir qué observa cada adversario.

Proponemos tres perfiles técnicos, internos o configurables:

Perfil

	

Funcionamiento

	

Principal limitación

Normal

	

Tramas cifradas y relleno según necesidad

	

Se observa bastante actividad temporal

Constante

	

Una tasa fija por dirección, con tramas ficticias

	

Consume ancho de banda durante toda la sesión

Documental

	

Tasa fija durante una ventana de transferencia, con relleno hasta completar la ventana

	

Archivos grandes, interrupciones o ampliaciones pueden revelar información

El tráfico constante debe incorporar tanto texto como archivos a la misma cola de salida. Los receptores descartan las tramas ficticias una vez autenticadas y descifradas.

No recomendamos intentar ocultar archivos de tamaño arbitrario mediante una velocidad limitada: la duración puede revelar un rango de tamaños, y el ancho de banda necesario crece considerablemente.

Incluso con una tasa constante, siguen siendo observables el inicio y fin de la conexión, la dirección IP frente al relé y las interrupciones.

j) Detección de anomalías: qué puede saber realmente ELIXIR

Aquí debemos ser particularmente estrictos.

Suceso

	

¿Puede detectarse?

	

Condición

Firma o autenticación del acuerdo inválida

	

Sí

	

Verificación con claves de identidad previamente autenticadas

Código usado para intentar ocupar una plaza adicional

	

Parcialmente

	

El relé debe reportarlo y aplicar control de capacidad

Mensaje cifrado alterado

	

Sí

	

Fallo de autenticación AEAD

Mensaje duplicado

	

Sí

	

Identificador y secuencia repetidos

Mensajes fuera de orden

	

Sí

	

Secuencias y ventana de recepción

Mensaje suprimido

	

Parcialmente

	

Puede detectarse un hueco, pero no siempre su causa

Cambio inesperado de identidad

	

Sí

	

Existe una identidad de referencia confiable

Un tercer participante activo

	

Parcialmente

	

Se exige autenticación de los dos extremos

Alguien copia bytes cifrados

	

No

	

La copia pasiva no genera necesariamente indicios

Servidor que observa IP y horarios

	

No como intrusión

	

Es parte de lo que observa el relé

Código robado pero no utilizado

	

No

	

No existe necesariamente ningún evento observable

Página web sustituida antes de iniciar

	

No de forma general

	

Falta una referencia independiente de integridad

Software espía en un equipo

	

No de forma fiable

	

Puede leer contenido desde el propio equipo

Una desconexión, un fallo del relé o un paquete perdido no deben presentarse automáticamente como un ataque.

Diseño concreto del aviso

ELIXIR — Sesión bloqueada

La identidad criptográfica del contacto no coincide con la verificada anteriormente.

El intercambio de mensajes y archivos se ha detenido. Esto puede deberse a un cambio legítimo de dispositivo o a un intento de suplantación. No podemos determinar la causa únicamente con esta señal.

Evento ID-04 · Identidad diferente · Comprobación local

No enviar más datos
Verificación independiente necesaria

Recomendamos tres niveles de interfaz: información (pérdida temporal de conexión), advertencia (secuencia anómala o acceso adicional rechazado) y bloqueo (identidad inválida, autenticación fallida o cambio de versión criptográfica no permitido).

Cada alerta debe comunicar qué se observó, qué significa, qué no demuestra y qué medida se ha tomado.

k) Ideas adicionales de mayor valor

Aislamiento estricto del documento recibido. Un PDF o archivo Office no debe ejecutarse ni procesarse con componentes innecesarios dentro del contexto criptográfico principal. El texto del chat debe renderizarse como texto, no como HTML suministrado por el interlocutor.

Confirmación explícita antes de liberar un archivo. Mostrar el contacto verificado, el nombre del documento, su tamaño y la huella antes de autorizar la entrega.

Protección contra cambios de protocolo. Si ambos han iniciado ELIXIR, no permitir que el relé los haga pasar silenciosamente a CRISTALE ni que sustituya una suite criptográfica por otra.

Límite de tamaño y memoria. Cifrar archivos por bloques con autenticación independiente y verificación final. Evitar cargar documentos grandes completos en memoria del navegador.

Pruebas de robustez. Incluir fallos de aleatoriedad, reinicios, desconexiones, mensajes duplicados, cambios de versión, archivos manipulados y sesiones simultáneas. Las pruebas contra casos adversos deben formar parte de la aceptación de cada versión.

3. Diseño operativo recomendado
3.1. Flujo para dos participantes

Inicio ELIXIR

Crear un código · Tengo un código

Invitación temporal

Secreto generado localmente · Capacidad para dos personas

Acuerdo híbrido y autenticación

P-384 + ML-KEM-1024 · Firmas · Verificación mutua

Confirmación de identidad

Palabras · Huella · Referencia previa cuando exista

Chat y documentos

Claves por mensaje · Renovación híbrida · Control de integridad

Cierre

Fin de sesión · Eliminación lógica del estado temporal · Acta opcional

En la portada deben continuar apareciendo únicamente los dos botones solicitados. La elección CRISTALE/ELIXIR puede integrarse después de pulsarlos, en el proceso de creación o acceso, sin añadir funciones ajenas al chat.

3.2. Estructura técnica mínima

Componente

	

Responsabilidad

Cliente web

	

Cifrado, descifrado, verificación, documentos y alertas

Worker criptográfico

	

Aislar operaciones intensivas y mantener el estado separado de la interfaz

Relé WebSocket sobre TLS

	

Transmitir únicamente tramas cifradas de sesiones activas

Control de sala

	

Capacidad para dos conexiones admitidas, caducidad y prevención de reingreso

Verificador independiente

	

Comprobar versiones firmadas de la aplicación

Almacenamiento local opcional

	

Identidades verificadas cifradas; nunca historial del chat por defecto

El servidor del relé no debe recibir claves privadas, secretos de sesión ni documentos descifrados. Para los pagos puede existir un sistema comercial separado, pero sus datos no deberían permitir reconstruir el contenido de las conversaciones.

Una precisión importante: prohibir guardar conversaciones no equivale a no tratar datos personales. El acceso al servidor, la facturación, los registros de infraestructura y la prevención de abuso requieren un inventario de datos y una política de retención separados.

3.3. Condiciones de salida a producción

Recomendamos exigir, como mínimo, las siguientes pruebas antes de comercializar ELIXIR:

Vectores oficiales de cada primitiva criptográfica y pruebas cruzadas entre implementaciones.

Pruebas de estados, truncamiento, duplicación, reordenamiento, retransmisión y caídas de conexión.

Comprobación de rechazo de identidades y versiones inesperadas.

Verificación de que el relé no recibe el contenido ni los secretos.

Pruebas de almacenamiento residual y de exposición de datos en el navegador.

Revisión independiente del diseño del protocolo y pruebas de intrusión de la aplicación completa.

Medición de consumo de CPU, RAM, ancho de banda y comportamiento ante archivos grandes.

La revisión independiente es especialmente importante antes de usar ELIXIR con información de clínicas, bancos o despachos. No recomendamos anunciarlo como un sistema apto para esos contextos exclusivamente por la elección de sus algoritmos.

4. Comparación con los principales servicios

Fecha de corte: 19 de noviembre de 2026.

La comparación distingue el cifrado durante la comunicación, el almacenamiento de mensajes, los metadatos y las funciones de verificación. No constituye una clasificación absoluta de seguridad.

En las tablas, las referencias entre corchetes identifican fuentes del propio fabricante o de su proyecto oficial. Su URL y fecha se encuentran en el apartado 7. El símbolo ? señala información incompleta, no confirmada públicamente o dependiente de una configuración.

CRISTALE aparece según la descripción técnica facilitada por GUARDIANA; ELIXIR, según la arquitectura propuesta, todavía pendiente de implementación y pruebas.

4.1. WhatsApp, Telegram, Signal e iMessage frente a CRISTALE

Característica

	

WhatsApp

	

Telegram

	

Signal

	

iMessage

	

CRISTALE

E2EE por defecto

	

Sí, chats personales [WA24]

	

No; únicamente chats secretos [TG26]

	

Sí [SI26]

	

Sí, entre dispositivos compatibles [AP24]

	

Sí, declarado

Postcuántico y fecha

	

? Sin despliegue general confirmado en documentación consultada [WA26P]

	

? No documentado [TG26]

	

PQXDH, 2023; SPQR anunciado en 2025, despliegue gradual [SI23, SI25]

	

PQ3 desde 2024 en equipos compatibles [AP24]

	

ML-KEM-1024 híbrido, declarado

Metadatos del servidor

	

Número, IP, dispositivo, actividad y otros datos [WA26]

	

Cuenta, teléfono, IP y mensajes de nube [TG26]

	

Muy limitados; creación de cuenta y última conexión entre los divulgados [SI24]

	

Identificadores de cuenta y enrutamiento; retención exacta ? [AP24, AP26]

	

Sala, IP, horarios, bytes; retención por verificar

Teléfono o cuenta obligatorios

	

Número para registro [WA26]

	

Cuenta con teléfono [TG26]

	

Número para registro, aunque puede ocultarse a contactos [SI24U]

	

Identidad Apple o número [AP24]

	

Invitación; sin cuenta personal según diseño

Copias en la nube

	

Sí; protección E2EE opcional [WA21]

	

Chats normales sincronizados en nube [TG26]

	

Copias seguras E2EE opcionales desde 2025 [SI25B]

	

Sí; protección depende de configuración iCloud [AP26]

	

No

Verificación de identidad

	

Código de seguridad y transparencia de claves [WA23]

	

Comparación de clave en chat secreto [TG26]

	

Números de seguridad; verificación opcional [SI26V]

	

Contact Key Verification [AP23]

	

Cuatro palabras y verificación mutua obligatoria

Código abierto

	

Cliente completo no publicado ? [WA26]

	

Clientes sí; servidor no [TG26]

	

Clientes y servidor sí [SI26]

	

Implementación completa no pública [AP24]

	

No se ha aportado repositorio público

Guardado en dispositivo

	

Historial y archivos locales [WA21]

	

Caché y chats secretos locales [TG26]

	

Historial local y posibles copias [SI25B]

	

Historial y datos sincronizados [AP26]

	

Memoria de sesión; archivos exportados aparte

Fuentes principales: documentación de Meta de 2021–2026, Telegram, Signal de 2023–2025 y Apple de 2023–2026. 
Engineering at Meta
+5

Interpretación importante: Signal y Apple ya ofrecen mecanismos postcuánticos que actúan después del establecimiento inicial. Por eso, una renovación cada cinco minutos no basta para presentar CRISTALE como superior a ellos. La evolución propuesta para ELIXIR es pertinente, pero su eficacia debe verificarse en la implementación. 
signal.org
+1

4.2. Threema, Wire, Session y SimpleX frente a ELIXIR

Característica

	

Threema

	

Wire

	

Session

	

SimpleX

	

ELIXIR propuesto

E2EE por defecto

	

Sí [TH26]

	

Sí [WI26]

	

Sí [SE26]

	

Sí [SX26]

	

Sí

Postcuántico y fecha

	

Colaboración para incorporarlo anunciada en febrero de 2026; despliegue general ? [TH26P]

	

MLS y preparación criptográfica; despliegue PQ general no confirmado [WI26]

	

Protocol V2 con PQ previsto, no confirmado [SE26]

	

Híbrido resistente a amenazas cuánticas desde v5.6, marzo de 2024 [SX24]

	

ML-KEM-1024; renovación PQ pendiente de desarrollo

Metadatos del servidor

	

ID y datos necesarios de entrega; contactos locales [TH26]

	

Cuenta, dispositivos y metadatos operativos [WI25]

	

Nodos almacenan mensajes cifrados temporalmente; metadatos minimizados [SE26]

	

Colas temporales; sin identidad global de usuario [SX26]

	

Sala, IP, horarios y tráfico

Teléfono o cuenta obligatorios

	

ID de Threema; teléfono no [TH26]

	

Cuenta y correo [WI25]

	

ID local; teléfono no [SE26]

	

Perfil local; sin cuenta global [SX26]

	

Invitación; sin cuenta personal para comunicarse

Copias en la nube

	

Threema Safe opcional [TH26]

	

Sincronización y servicios asociados a cuenta; alcance de copias ? [WI26]

	

Recuperación mediante clave y almacenamiento local [SE26]

	

Exportación local cifrada; sin copia de cuenta central [SX26]

	

No por defecto

Verificación de identidad

	

QR y niveles de confianza [TH26]

	

ID Shield y comprobación de dispositivos [WI26]

	

ID/QR compartido [SE26]

	

Enlace inicial y código de seguridad [SX26]

	

Obligatoria; fijación de identidad opcional

Código abierto

	

Sí, clientes [TH26]

	

Sí, clientes y servidor [WI26O]

	

Sí [SE26]

	

Sí [SX26]

	

Recomendamos publicar cliente y especificación

Guardado en dispositivo

	

Chats, archivos y contactos [TH26]

	

Historial sincronizado y datos locales [WI26]

	

Mensajes y claves locales [SE26]

	

Base local cifrada y archivos [SX26]

	

RAM; libreta cifrada opcional; documentos exportados

Fuentes: Threema 2026, Wire 2025–2026, documentación de Session y SimpleX 2024–2026. 
Threema
+4

4.3. Qué puede diferenciar realmente a ELIXIR

No es prudente afirmar que será el sistema con la criptografía más fuerte del mercado.

Signal dispone de una evolución documentada de su protocolo postcuántico, Apple utiliza PQ3, SimpleX introdujo protección híbrida en 2024 y Wire adoptó MLS como protocolo principal en 2026. Son desarrollos sustanciales. 
signal.org
+3

La oportunidad para GUARDIANA está en ofrecer una experiencia específica para dos personas que necesitan intercambiar documentación reservada durante una sesión controlada, sin trasladar necesariamente toda su vida profesional a otra plataforma.

Ventaja propuesta

	

Potencial diferenciador

	

Condición

Sin historial central de conversaciones

	

Alto

	

Demostrar ausencia de almacenamiento de contenido en el relé

Verificación obligatoria antes de intercambiar datos

	

Alto

	

Comprobación verdaderamente independiente del canal vulnerable

Fijación estricta de identidad empresarial

	

Alto

	

Resolver almacenamiento y recuperación de contactos

Huellas y actas documentales

	

Muy alto para despachos

	

Identidad, firmas y límites jurídicos claramente documentados

Protección de archivos durante la misma sesión

	

Alto

	

Transferencia robusta y tratamiento seguro

Detección explicada al usuario

	

Alto

	

Evitar presentar anomalías como ataques demostrados

Triple KEM o triple firma

	

Limitado inicialmente

	

No añadir complejidad sin beneficio medible

Posicionamiento: competir por especialización, controles y experiencia documental, no por supuestos absolutos de invulnerabilidad.

5. Apartado público sobre espionaje y comunicaciones
5.1. Tres nombres propuestos

1. El mundo invisible de las comunicaciones

Nuestra elección: solemne, comprensible y apto para público general.

2. Cuando alguien escucha

Más emocional y directo.

3. Las huellas del espionaje

Adecuado si se dedica más espacio a los hechos documentados.

Recomendamos el primero. Permite explicar la diferencia entre comunicaciones convencionales, cifrado extremo a extremo y ataques al propio dispositivo sin recurrir al miedo como argumento de venta.

5.2. Cómo se puede interceptar una comunicación telefónica

Ejemplo: una llamada o un SMS entre Vodafone y Orange.

Una llamada telefónica tradicional puede atravesar distintos equipos y redes antes de llegar al destinatario. Puede existir cifrado en determinados tramos, incluido el enlace radioeléctrico, pero eso no significa que el contenido permanezca cifrado exclusivamente para los dos teléfonos durante todo el recorrido.

Un SMS convencional tampoco dispone, por su propio diseño, de cifrado extremo a extremo entre los dispositivos.

La diferencia puede entenderse con una carta:

En una comunicación tradicional, el mensaje atraviesa instalaciones que participan en su tratamiento o transporte. Hay que confiar en sus protecciones.

En una comunicación cifrada de extremo a extremo, el contenido viaja dentro de un sobre que, bajo las condiciones de seguridad del sistema, solo pueden abrir los dispositivos participantes.

Esto no significa que los operadores mencionados estén interceptando mensajes ni que sus redes presenten una vulnerabilidad específica.

La agencia europea ENISA examinó en marzo de 2018 los problemas de seguridad de SS7 y Diameter, protocolos utilizados en interconexiones de redes móviles, y documentó riesgos de suplantación, seguimiento e interceptación bajo determinadas condiciones. 
ENISA
+1

Cinco formas documentadas de atacar las comunicaciones convencionales

Método

	

Qué ocurre

	

Fuente

SS7 y Diameter

	

Un atacante con acceso adecuado a la señalización puede aprovechar fallos de confianza o validación para manipular ciertas funciones de la red

	

ENISA, 28/03/2018 
ENISA

Salt Typhoon

	

Compromiso de redes de operadores, con robo de registros de llamadas, determinadas comunicaciones y datos relacionados con órdenes judiciales

	

FBI, 24/04/2025 
FBI

Falsas antenas

	

Equipos que se hacen pasar por estaciones móviles pueden provocar que dispositivos cercanos revelen identificadores o información de conexión

	

Centro Canadiense de Ciberseguridad, 2026 
Canadian Centre for Cyber Security

Descenso a redes antiguas

	

Bajo ciertas condiciones, la degradación a tecnologías móviles anteriores puede facilitar ataques que aprovechan protecciones más débiles

	

GSMA y CISA 
GSMA
+1

Duplicado fraudulento de SIM

	

Un atacante consigue que el operador asocie el número de la víctima a una SIM bajo su control y recibe llamadas o SMS dirigidos a ese número

	

ENISA, 2021; FCC, 2024 
ENISA
+1

En particular, el FBI confirmó en 2025 que la campaña Salt Typhoon había permitido sustraer determinados datos de comunicaciones y copiar información sometida a requerimientos judiciales. No debemos convertir esto en una afirmación de que cualquier sistema de interceptación legal sea accesible desde Internet. 
ic3.gov

5.3. Cómo ocurre un hackeo de comunicaciones

No todos los ataques siguen la misma secuencia. Para una persona sin conocimientos técnicos, podemos explicar cinco situaciones distintas.

Escenario 1. La interceptación del camino. Un tercero intenta observar lo que circula por una red. Si encuentra contenido sin cifrado de extremo a extremo, o consigue acceder a un sistema que lo procesa en claro, puede obtener información. El cifrado extremo a extremo busca limitar precisamente ese riesgo.

Escenario 2. La infección del teléfono. Aquí ya no es necesario romper el cifrado de la conversación. El programa espía intenta entrar en el equipo y observar el contenido cuando el usuario lo lee o lo escribe.

Escenario 3. Las copias y cuentas. Aunque un mensaje viaje protegido, una copia almacenada fuera del dispositivo puede estar sometida a otras condiciones de cifrado y recuperación. Por ejemplo, Apple diferencia entre la protección estándar de iCloud y su protección avanzada; WhatsApp y Signal ofrecen mecanismos específicos de copias cifradas. 
Apple Support
+2

Escenario 4. La vigilancia a gran escala. Las revelaciones de Edward Snowden en 2013 documentaron programas de recopilación y análisis de información de comunicaciones. Incluyeron debates sobre contenido, metadatos y colaboración entre organismos de inteligencia y proveedores. No demuestran que todas las comunicaciones actuales sean legibles por esos organismos. 
Privacy International
+1

Escenario 5. El engaño. Un atacante puede suplantar una identidad, enviar una invitación fraudulenta o utilizar una voz sintética para hacerse pasar por otra persona. La FCC documentó en 2024 casos de llamadas engañosas con voces generadas mediante IA. 
docs.fcc.gov

5.4. Pegasus: el límite que debemos explicar

Citizen Lab publicó en abril de 2022 la investigación CatalanGate, que documentó ataques contra personas relacionadas con Cataluña mediante Pegasus y Candiru. Entre los hallazgos se encontraba evidencia de mecanismos de infección sin interacción de la víctima en determinadas versiones de iOS. Amnistía Internacional corroboró evidencia forense de varios de los casos investigados. 
The Citizen Lab
+1

La investigación sobre Pegasus no terminó ahí. Citizen Lab publicó en septiembre de 2026 un análisis que confirmó una infección mediante un mecanismo de iMessage sin clic en el dispositivo de un activista serbio. 
The Citizen Lab

Estos casos justifican una advertencia fundamental:

Si el equipo está comprometido, el atacante puede intentar obtener el contenido directamente en el dispositivo. El chat no puede garantizar que detectará ese acceso. El software espía puede operar fuera de su campo de observación.

Por eso, tampoco conviene utilizar Pegasus para insinuar que ELIXIR proporciona una defensa especial frente a él únicamente por su criptografía postcuántica.

5.5. Qué defienden CRISTALE y ELIXIR

Amenaza

	

CRISTALE

	

ELIXIR propuesto

Interceptación de contenido cifrado por la red

	

Protección mediante E2EE, sujeta a implementación correcta

	

Misma protección de base

Almacenamiento de tráfico para intentar descifrarlo en el futuro

	

Acuerdo híbrido postcuántico

	

Acuerdo híbrido y renovación postcuántica continua, si se implementa

Alteración de tramas cifradas

	

Autenticación y rechazo

	

Autenticación, rechazo y aviso detallado

Sustitución de identidad

	

Verificación mutua y alarma

	

Referencia persistente cuando exista, bloqueo y recuperación controlada

Documento alterado

	

Autenticación del archivo si se ha implementado correctamente

	

Huella, verificación y acta opcional

Exposición de metadatos de conexión

	

Parcialmente reducida

	

Tráfico constante configurable, con límites

Dispositivo infectado

	

Sin protección general fiable

	

Sin protección general fiable

Participante que copia o fotografía contenido

	

No puede impedirlo

	

No puede impedirlo

Página maliciosa suministrada por el origen comprometido

	

No garantizada su detección

	

Mitigaciones, pero sin detección universal

Usuario engañado para entregar secretos

	

Verificación y advertencias

	

Verificación reforzada y controles de entrega

La defensa de un chat debe acompañarse de buenas prácticas de seguridad del dispositivo, actualizaciones y evaluación de riesgos. El cifrado no sustituye esas medidas.

6. Texto final propuesto para publicar
El mundo invisible de las comunicaciones
Escritura
El mundo invisible de las comunicaciones

Durante décadas hemos hablado, escrito y enviado información confiando en que llegaría a su destino sin que nadie la observara.

Pero una comunicación atraviesa redes, sistemas y dispositivos. En determinadas circunstancias, esos puntos pueden convertirse en vías de acceso a información privada.

En 2013, las revelaciones de Edward Snowden mostraron la dimensión de algunos programas de vigilancia. En 2022, las investigaciones sobre Pegasus en España documentaron cómo teléfonos de personas concretas habían sido objeto de ataques mediante software espía. En 2024, los ataques a operadores de telecomunicaciones estadounidenses volvieron a poner de manifiesto los riesgos de las infraestructuras de comunicaciones.

No todos los ataques requieren romper un cifrado. A veces se intenta interceptar el camino. Otras veces se busca engañar a una persona, acceder a sus copias o comprometer directamente su dispositivo.

Nuestra respuesta

CRISTALE permite intercambiar mensajes y archivos cifrados de extremo a extremo, con verificación mutua de identidad y sesiones temporales.

ELIXIR está concebido para añadir controles de identidad, evolución continua de claves, verificación documental y alertas ante determinadas anomalías detectables.

Ambos se utilizan desde el navegador, sin instalar aplicaciones. Solo texto y archivos.

El límite que no ocultamos

Ningún cifrado puede garantizar la protección de lo que ya está visible en un dispositivo comprometido.

Tampoco podemos impedir que un destinatario conserve información que ha decidido recibir, ni asegurar que toda tentativa de espionaje produzca una alerta.

Nuestra responsabilidad es proteger lo que técnicamente podemos proteger, explicar lo que podemos verificar y no atribuir a la tecnología capacidades que no tiene.

GUARDIANA GROUP S.A.S.

Nota editorial: los mecanismos de ELIXIR descritos en el texto son objetivos de diseño, no capacidades que deban anunciarse como operativas antes de finalizar su implementación y validación.

7. Fuentes oficiales, fechas y enlaces

Los identificadores son los utilizados en las tablas comparativas. Para páginas sin fecha de publicación visible se consigna la consulta del 19/11/2026. Las fuentes corresponden al estado de información disponible en esa fecha.

7.1. Criptografía, protocolos y navegador

Fuente y fecha

	

Documento

NIST · 13/08/2024

	

FIPS 203 — ML-KEM

NIST · 13/08/2024

	

FIPS 204 — ML-DSA

NIST · 13/08/2024

	

FIPS 205 — SLH-DSA

NIST · 11/03/2025

	

Selección de HQC

NIST · septiembre de 2025

	

SP 800-227 — Recomendaciones sobre KEM

IETF · julio de 2026

	

RFC 9954 — Acuerdo híbrido de claves

IETF · agosto de 2026

	

RFC 10024 — Híbridos ML-KEM para TLS 1.3

IRTF · julio de 2025

	

RFC 9807 — OPAQUE

Signal · 02/10/2025

	

Sparse Post Quantum Ratchet

Signal · revisión 04/11/2025

	

Especificación Double/Triple Ratchet

Open Quantum Safe · consultado 19/11/2026

	

Implementación liboqs-js y advertencias de uso

noble · consultado 19/11/2026

	

Biblioteca @noble/post-quantum

OWASP · consultado 19/11/2026

	

Guía Content Security Policy

OWASP · consultado 19/11/2026

	

Guía de tratamiento de archivos

MDN · consultado 19/11/2026

	

Subresource Integrity

7.2. Fuentes de servicios de mensajería

Código

	

Fuente oficial y fecha

WA21

	

Meta: copias E2EE, 10/09/2021

WA23

	

Meta: transparencia de claves, 13/04/2023

WA24

	

Meta: E2EE y mensajería interoperable, 06/03/2024

WA26

	

WhatsApp: política de privacidad, vigente en 2026

WA26P

	

Meta: migración postcuántica, 16/04/2026

TG26

	

Telegram FAQ, consulta 19/11/2026 y política de privacidad

SI23

	

Signal PQXDH, 19/09/2023

SI24

	

Signal: transparencia sobre solicitudes de datos, consulta 2026

SI24U

	

Signal: identificadores y privacidad, 20/02/2024

SI25

	

Signal SPQR, 02/10/2025

SI25B

	

Signal: copias seguras, 08/09/2025

SI26

	

Signal: características, consulta 2026 y código fuente

SI26V

	

Signal: números de seguridad, consulta 2026

AP23

	

Apple: Contact Key Verification, 2023

AP24

	

Apple PQ3, 21/02/2024

AP26

	

Apple: protección de datos de iCloud, actualización 2026

TH26

	

Threema: documentación y preguntas frecuentes, consulta 2026

TH26P

	

Threema e IBM Research, 24/02/2026

WI25

	

Wire: política de privacidad, 2025

WI26

	

Wire: MLS, actualización 24/03/2026 y seguridad

WI26O

	

Wire: código abierto, 08/07/2026

SE26

	

Session: cifrado y Protocol V2, consulta 2026 y almacenamiento

SX24

	

SimpleX v5.6, 23/03/2024

SX26

	

SimpleX: privacidad, revisión disponible en noviembre de 2026 y documentación técnica

7.3. Telefonía, vigilancia y software espía

Fecha

	

Fuente

28/03/2018

	

ENISA — Seguridad de SS7 y Diameter

2021

	

ENISA — Fraude de duplicación de SIM

24/04/2025

	

FBI — Investigación Salt Typhoon

Consulta 2026

	

Centro Canadiense de Ciberseguridad — Falsas estaciones móviles

18/04/2022

	

Citizen Lab — CatalanGate

18/04/2022

	

Amnistía Internacional — Pegasus en España

02/09/2026

	

Citizen Lab — Infección documentada en Serbia

Julio de 2021

	

Amnistía — Metodología forense Pegasus

2013

	

Privacy International — Revelaciones sobre PRISM

Junio de 2024

	

FCC — Suplantación de voz mediante IA

8. Decisión final para GUARDIANA GROUP

Recomendamos aprobar ELIXIR como producto empresarial diferenciado, pero dividir su desarrollo en dos hitos comerciales.

El primero debe entregar un chat de dos participantes fiable, con cifrado híbrido, identidades estrictamente verificadas, archivos por bloques, control de integridad y una interfaz que no exagere las capacidades de detección.

El segundo debe incorporar el trinquete postcuántico continuo, identidad empresarial persistente y controles documentales avanzados. Estas capacidades no deben aparecer como operativas hasta superar sus correspondientes pruebas.

No recomendamos incluir de salida: triple KEM con HQC, firma triple obligatoria, cifrado AES y XChaCha en cascada, ni promesas de detección universal de espionaje.

La mayor oportunidad de ELIXIR no está en tener más algoritmos que Signal o Apple. Está en convertir la confidencialidad de una conversación y la entrega de un documento en una operación comprensible, verificable y cuidadosamente delimitada.

Mensaje rector para toda la marca: proteger el contenido, verificar la identidad y reconocer expresamente los límites.

¿Te ha resultado útil esta conversación hasta ahora?
ChatGPT puede cometer errores. Comprueba la información importante.
Última respuesta

Esfuerzo de razonamiento
Alta
