# Ronda 95 · Gemini (Neon, razonamiento alto) · 19 nov 2026

MEMORANDO TÉCNICO Y ESTRATÉGICO · RONDA 95Cliente: Guardiana Group S.A.S. · Proyecto: Elixir ([www.house1718.com](https://www.house1718.com)) · Fecha: 19 de noviembre de 2026

1. Arquitectura de ELIXIR: evaluación técnica y veredicto

Elixir opera bajo tres restricciones innegociables: solo texto y archivos en el navegador, sin instalación y sin promesas imposibles frente a un equipo comprometido o un servidor web hostil. Para que la modalidad empresarial justifique un precio superior frente a Cristale, no basta con acumular siglas criptográficas: debe resolver riesgos reales de despachos, clínicas, banca y entornos B2B (compromiso continuo de sesión, suplantación en relaciones recurrentes, fuga de metadatos documentales, prueba legal sin terceros y detección temprana de manipulación del canal).

Evaluación punto por punto (a–k)
a) KEM triple de familias matemáticas distintas: curva + retículos (ML-KEM-1024) + códigos (HQC o Classic McEliece)

Valor real: Medio-alto a largo plazo como seguro frente a una rotura matemática imprevista de retículos (ML-KEM, FIPS 203, 13 ago 2024). El NIST seleccionó HQC el 11 de marzo de 2025 precisamente como respaldo de distinta familia matemática (códigos correctores de errores), pero su borrador de estándar está en elaboración y el estándar definitivo se espera para 2027 (NIST, 11 mar 2025). Classic McEliece exige claves públicas de entre 261 KB y 1,35 MB, lo que penaliza gravemente un protocolo síncrono con tramas de 1 KB.   
NIST Computer Security Resource Center
+ 1

Riesgo: Alto hoy en producción. @noble/post-quantum (v0.7.1, ago 2026) no implementa HQC ni Classic McEliece. La única alternativa seria en JS/WASM es @oqs/liboqs-js (envoltorio WebAssembly de liboqs, Open Quantum Safe / PQCA), pero el propio proyecto advierte de forma explícita que está destinada a investigación, prototipado y experimentación, no a producción, y marca el soporte SIMD en Safari como no probado (Open Quantum Safe, 2026). Introducir código C compilado a WASM en estado experimental y con especificación HQC aún no congelada aumenta el riesgo real de fallo de implementación hoy más de lo que reduce el riesgo teórico de quiebra de ML-KEM-1024 + P-384.   
GitHub
+ 1

Coste: Alto en tamaño de paquete WASM, superficie de cadena de suministro y mantenimiento cuando NIST ajuste los parámetros finales de HQC en 2027.

Veredicto: NO para lanzamiento inmediato en noviembre de 2026; SÍ en arquitectura preparada. Mantened el híbrido ML-KEM-1024 + ECDH P-384 sobre un combinador HKDF-SHA-384 diseñado con ranura de versión para acoplar HQC en cuanto NIST publique el estándar definitivo en 2027 y exista implementación JS pura y estable.

b) Firmas de identidad con SLH-DSA (FIPS 205, basadas solo en hash) además de ML-DSA-87 + ECDSA P-384

Valor real: Alto. SLH-DSA (FIPS 205, aprobado el 13 de agosto de 2024) depende únicamente de la resistencia de funciones hash (SHA-2 o SHAKE), una hipótesis matemática conservadora y completamente ajena a retículos y curvas elípticas. A diferencia de HQC, ya es estándar definitivo y está implementado en la misma librería que usáis (@noble/post-quantum 0.7.1, con vectores públicos NIST ACVP reproducidos en v0.7.0 y optimización de velocidad de hasta 2x en 2026).   
GitHub

Riesgo: Bajo. El principal cuidado es elegir la variante rápida (SLH-DSA-SHA2-192f o SLH-DSA-SHA2-256f) y limitar su uso al handshake inicial de identidad y a las actas de entrega de documentos (nunca por cada mensaje), porque las firmas miden decenas de kilobytes (~35–49 KB) y consumen más CPU que ML-DSA.

Coste: Bajo. Sin nuevas dependencias externas; solo añadir unos kilobytes al intercambio inicial de sala y al acta final.

Veredicto: SÍ. Es la mejora de diversidad matemática más sólida, honesta y realizable hoy mismo en el navegador.

c) Trinquete por mensaje (FS por mensaje) + trinquete postcuántico periódico (línea SPQR de Signal, oct 2025)

Valor real: Muy alto. Cristale renueva claves cada 5 minutos; si un atacante accede a la memoria de la sesión dentro de esa ventana, puede descifrar todos los mensajes de esa época. Añadir un trinquete simétrico KDF por mensaje (borrando inmediatamente cada clave de mensaje tras usarla) aporta secreto hacia delante por mensaje individual. Sumar un trinquete híbrido periódico (ECDH P-384 + ML-KEM-1024 cada N mensajes o cada T minutos) aporta seguridad post-compromiso (PCS) también frente a adversarios cuánticos, siguiendo el principio de Apple PQ3 (21 feb 2024) y Signal SPQR (2 oct 2025).   
Signal

Riesgo: Bajo en Elixir. Signal necesitó códigos de borrado complejos en SPQR porque su mensajería es asíncrona con buzón y entrega fuera de orden. Elixir es síncrono y en vivo (ambos extremos conectados, sin buzón): el intercambio ML-KEM-1024 de renovación se encapsula de forma ordenada en el flujo continuo, lo que reduce drásticamente la complejidad de estados y el riesgo de errores sutiles.   
Signal

Coste: Medio en ingeniería y pruebas de máquina de estados; despreciable en UX.

Veredicto: SÍ (prioridad máxima). Cierra la brecha técnica entre Cristale y el estado del arte real de 2026.

d) Cifrado en cascada AES-256-GCM + XChaCha20-Poly1305 con claves independientes

Valor real: Medio-alto como defensa en profundidad de implementación. WebCrypto API ejecuta AES-256-GCM en código nativo del navegador (aceleración hardware), mientras que XChaCha20-Poly1305 (vía @noble/ciphers, familia ARX sin tablas de búsqueda) corre en JavaScript puro con nonces de 192 bits. Aplicado en cascada (Encrypt-then-Encrypt) con dos claves independientes derivadas por HKDF-SHA-384 con etiquetas de dominio distintas —y vinculando en ambos los mismos datos asociados (AAD: identificador de época, contador de trama y dirección)—, un fallo en el motor WebCrypto o una debilidad en una sola primitiva simétrica no expone el texto claro.

Riesgo: Bajo si se evita cualquier reutilización de clave o nonce y se validan estrictamente ambas etiquetas AEAD antes de exponer un solo byte.

Coste: Bajo en texto; moderado en archivos grandes (XChaCha20 en JS es más lento que AES-GCM nativo). Exige procesar archivos por bloques (p. ej. 64 KB) en un Web Worker para no bloquear la interfaz.

Veredicto: SÍ (con ejecución en Web Worker por bloques). Muy buen argumento técnico para clientes corporativos sin añadir complejidad frágil.

e) Código de invitación como contraseña de un PAKE (CPace u OPAQUE) o invitación en dos mitades por dos canales

Valor real: Conviene distinguir ambos protocolos. OPAQUE (RFC 9807, publicado el 24 de julio de 2025) es un PAKE aumentado cliente-servidor pensado para sustituir contraseñas almacenadas en un servidor: no encaja en un chat par-a-par efímero sin cuentas. CPace (IRTF CFRG draft-irtf-cfrg-cpace-21, abril 2026) es un PAKE balanceado par-a-par que protege contraseñas cortas contra ataques de diccionario fuera de línea. Sin embargo, si el código de invitación tiene ya 80 bits de entropía (como en Cristale), el ataque realista no es la fuerza bruta fuera de línea, sino la interceptación del canal donde se envió el código (correo, WhatsApp o SMS).   
IETF Datatracker
+ 1

Diseño superior: Invitación dividida en dos canales + CPace sobre el segundo factor. Canal A (p. ej., correo o mensajería): código de sala de 16 símbolos. Canal B (p. ej., llamada telefónica o en persona): un PIN corto de 6 a 8 dígitos. Ese PIN corto alimenta un CPace (sobre P-384 o Ristretto255) vinculado al transcript del intercambio híbrido, con un único intento por sala (si falla, la sala se destruye). Así, robar el correo no permite entrar ni atacar por fuerza bruta el PIN fuera de línea.

Riesgo y coste: Riesgo moderado-bajo (CPace tiene vectores de prueba oficiales en el borrador CFRG de abril de 2026, pero no es aún RFC definitivo); coste de UX muy asumible en entorno corporativo (y opcional para que el usuario elija 1 canal o 2 canales).   
IETF Datatracker

Veredicto: OPAQUE: NO. CPace + invitación en dos mitades (canal A + PIN corto canal B): SÍ.

f) Antisuplantación (libreta de contactos con claves fijadas, bloqueo sin «aceptar igualmente», más palabras)

Valor real: Muy alto en B2B. En Cristale, cada sesión nace de cero, por lo que cada encuentro exige confiar de nuevo en el canal de verificación de palabras. En relaciones recurrentes (abogado-cliente, comité bancario), fijar la clave pública de identidad (ML-DSA-87 + SLH-DSA + ECDSA) elimina la fatiga de verificación y convierte cualquier intento posterior de suplantación en una alarma inequívoca.

Riesgo (tensión con «nada se guarda»): Guardar contactos en localStorage o IndexedDB del navegador deja rastro persistente en el equipo. Para respetar la promesa de memoria efímera en Elixir, la libreta debe funcionar mediante archivo portátil cifrado en local (p. ej. .elixir-vault, cifrado con Argon2id + AES-256-GCM, que el usuario arrastra al navegador al abrir sesión y vive solo en RAM) o vinculada a una llave física WebAuthn (ver punto k). Si un contacto fijado aparece con otra clave: bloqueo estricto sin botón «aceptar igualmente»; el usuario debe revocar explícitamente la ficha antigua y completar una nueva verificación fuera de banda.

Más palabras: Pasar de 4 a 5 palabras (de una lista de 2.048 palabras, ~55 bits de entropía en una ventana en tiempo real con un solo intento) ya ofrece una probabilidad de acierto ciego inferior a 
1
1 entre 
3
,
6
×
10
16
3,6×10
16
; añadir 8 o 10 palabras empeora la lectura en voz alta sin aportar ventaja práctica frente a un intento único con compromiso previo.

Veredicto: SÍ a libreta portátil cifrada en RAM con claves fijadas y bloqueo duro sin «aceptar igualmente»; NO a alargar en exceso las palabras (mantener 4 o 5 palabras comprometidas).

g) Documentos: limpieza local de metadatos, huella, acta de entrega bilateral, visor sin descarga

Limpieza local de metadatos: SÍ, con honestidad sobre PDF. En el navegador se limpian de forma fiable imágenes (re-renderizado completo en <canvas>, eliminando EXIF, GPS, IPTC y XMP) y documentos Office OOXML (.docx, .xlsx, .pptx, eliminando docProps/core.xml, app.xml, autor y metadatos del ZIP). En PDF, borrar solo /Info y /XMP no garantiza eliminar revisiones incrementales ni capas ocultas; ofreced dos modos explícitos: limpieza estructural (conserva texto seleccionable, advirtiendo del límite) y modo plano/rasterizado (convierte cada página en imagen limpia y recompone un PDF nuevo, borrando toda estructura oculta).

Huella criptográfica (SHA-384) + Acta de entrega firmada bilateralmente: SÍ (elemento diferencial estrella de Elixir). Al confirmar la recepción de un archivo, ambos equipos firman un recibo estructurado con sus claves verificadas (ECDSA + ML-DSA-87 + SLH-DSA): huella SHA-384 del archivo, identidad pública de emisor y receptor, marca temporal y nonce de sesión. Se descarga en formato verificable sin conexión (JSON + resumen PDF). Matiz crítico: el acta es por naturaleza no negable (prueba ante terceros que el documento se entregó), lo opuesto a los acuses negables de Cristale; debe ser una función explícita por documento y desactivada por defecto en mensajes normales.

Visor sin descarga: SÍ CON MATICES. Renderizar PDFs e imágenes exclusivamente en <canvas> desde RAM (sin crear enlaces download ni guardar en disco) más una marca de agua dinámica superpuesta (código de sesión y hora) reduce descargas accidentales en equipos compartidos y disuade filtraciones, indicando en pantalla con total claridad que no puede impedir una captura de pantalla ni una fotografía externa.

Veredicto: SÍ a todo el bloque, con modo PDF honesto y acta bilateral explícita por documento.

h) Integridad de la propia web: SRI, CSP estricta, huellas publicadas, página de verificación

Valor real y límite ineludible: SRI y una CSP estricta (sin unsafe-inline, sin dominios externos, sin fuentes remotas) protegen frente a inyección XSS y manipulación de CDN de terceros, pero no impiden que el propio servidor de house1718.com, si fuera comprometido o coaccionado, sirva un index.html malicioso dirigido a un único usuario (sin SRI o con un SRI distinto). Ninguna página de verificación servida por el mismo servidor resuelve este círculo vicioso.

Qué es lo mejor y más honesto hoy:

Compilación determinista (reproducible) con código cliente público y huellas SHA-384 de cada versión publicadas en al menos tres lugares independientes (registro de transparencia público como Sigstore/Rekor, repositorio Git firmado con PGP/SSH y registro DNSSEC TXT).

Extensión verificadora ligera opcional (estilo Code Verify de WhatsApp Web / Meta): para clientes empresariales que acepten instalar una extensión mínima en Chrome/Firefox/Edge (sin instalar el chat), esta compara en cada carga el código servido por house1718.com contra la huella independiente y bloquea en rojo si difiere.

Paquete HTML único verificable sin servidor web (descarga opcional para departamentos de seguridad de bancos/despachos): el cliente comprueba el SHA-384 una vez y abre el archivo local, usando el servidor de Núremberg únicamente como relé WebSocket ciego.

Veredicto: SÍ a CSP estricta + SRI + compilación reproducible + huellas multi-canal + extensión verificadora opcional, declarando abiertamente el límite del modelo web en la documentación pública.

i) Tráfico: ocultar cuándo y cuánto se escribe o se envía (archivos incluidos)

Valor real: Alto frente a análisis de tráfico por observadores de red o por el propio relé. Si Cristale mantiene tramas de 1 KB a ritmo fijo para texto pero dispara una ráfaga al enviar un PDF de 4 MB, cualquiera que observe el caudal sabrá el instante exacto y el tamaño del documento.

Diseño concreto: Conformador de caudal constante estricto (CBR) desde la apertura hasta el cierre de la sala, en el que texto, acuses y fragmentos de archivos viajan únicamente dentro de las ranuras fijas (si no hay datos reales, se envía relleno indistinguible cifrado). Como el ancho de banda tiene coste y latencia, Elixir debe ofrecer dos perfiles seleccionables al crear la sala: Conversación (p. ej. 4 KB/s constantes) y Documentos (p. ej. 64 KB/s constantes: un PDF de 2 MB tarda ~32 segundos sin producir ningún pico observable), más un tiempo de enfriamiento con tráfico de relleno (30–60 s tras el último archivo) y supresión total de indicadores de «escribiendo» fuera del canal cifrado fijo.

Riesgo y coste: Coste moderado de ancho de banda en el relé de Núremberg y mayor tiempo de envío en archivos pesados (debe comunicarse al usuario como «envío camuflado a ritmo constante»).

Veredicto: SÍ (modo CBR estricto seleccionable con perfiles de caudal).

j) Detección de intentos de intrusión: qué SÍ se detecta, qué NO y diseño del aviso
Evento / intento	¿Detectable por Elixir?	Mecanismo técnico de detección
Persona en medio (MitM) durante el inicio	SÍ	Desajuste en compromiso previo de palabras, fallo de CPace (si 2 canales) o firma de clave fijada no coincidente.
Código de invitación ya usado / carrera por entrar	SÍ	El relé y la máquina de estados solo admiten exactamente 2 participantes; un tercer intento o reutilización dispara evento y destrucción de sala.
Tercero intentando inyectarse en la sala	SÍ	Claves de sesión estrictamente bilaterales + límite duro de 2 ranuras en relé + fallo AEAD inmediato.
Tramas alteradas, truncadas o manipuladas	SÍ	Fallo de verificación de doble etiqueta AEAD (AES-256-GCM y XChaCha20-Poly1305).
Tramas borradas, repetidas o reordenadas	SÍ	Contadores monótonos obligatorios en AAD + ventana de secuencia estricta (sin saltos admitidos en canal síncrono).
Cambio de clave de identidad en mitad o entre sesiones	SÍ	Alarma instantánea en sesión; bloqueo duro frente a libreta de claves fijadas.
Alteración del código web servido	PARCIAL	Detectable solo si el usuario emplea la extensión verificadora externa o paquete local verificado; no detectable desde el propio código si el servidor web fue comprometido.
Programa espía en el equipo (Pegasus, keylogger, troyano)	NO	El atacante opera en el sistema operativo: lee la pantalla, el teclado y la memoria del navegador antes del cifrado.
Foto/grabación física de la pantalla o micrófono ambiental	NO	Canal analógico fuera del perímetro de software.
Correlación de direcciones IP por ISP / operadora	NO	Sin red de múltiples saltos, el ISP y el relé ven la IP y la hora de conexión.

Diseño concreto del aviso en pantalla (tres estados, cero ambigüedad):

Estado normal (barra discreta verde/neutra): «Canal verificado · Tráfico constante activo · Solo en memoria».

Anomalía de red sin evidencia criptográfica (ámbar): «Interrupción de flujo constante detectada durante X s. Envío pausado por precaución». Permite reconectar solo manteniendo el mismo estado de trinquete o cerrar.

Alerta crítica de integridad o identidad (pantalla bloqueada en rojo oscuro, sin botón "continuar"):

Acción automática inmediata: congela la caja de texto, aborta transferencias en curso, borra las claves efímeras de RAM y cierra el WebSocket.

Texto llano al usuario: «Sesión interrumpida por seguridad: se ha detectado [motivo exacto: clave de identidad distinta a la verificada / trama manipulada / intento de acceso con tu código]. No vuelvas a enviar información por este canal. Confirma con tu contacto por otra vía antes de abrir un código nuevo.»

k) Tres propuestas adicionales (lo NUEVO más allá de «postcuántico»)

Identidad empresarial protegida por hardware sin instalar nada (WebAuthn + extensión PRF): Permite vincular la clave de identidad fijada y el descifrado de la libreta portátil a una llave física FIDO2 (p. ej. YubiKey) o a la biometría hardware del dispositivo mediante estándares W3C nativos del navegador. Evita que el usuario gestione contraseñas débiles y separa la identidad del almacenamiento del navegador.

Verificador público sin conexión para Actas de Entrega: Una herramienta estática abierta donde un juez, perito, auditor externo o contraparte puede arrastrar el documento original + el acta firmada (ECDSA + ML-DSA-87 + SLH-DSA) y verificar localmente la integridad y autoría criptográfica sin crear cuenta y sin enviar el archivo a ningún servidor. Esto posiciona a Elixir en el terreno de la prueba documental verificable, donde ni Signal ni WhatsApp compiten.

Clave de coacción / botón de vaciado instantáneo y caducidad automática: Un atajo de teclado o botón visible que sobrescribe los buffers de RAM (TypedArray.fill(0)), vacía el DOM y redirige la pestaña en milisegundos, combinado con caducidad dura de sala por inactividad configurable (p. ej., 10 minutos). (Nota honesta: JavaScript no garantiza el borrado físico inmediato en todos los colectores de basura del motor JS, por lo que cerrar la pestaña o ventana sigue siendo la recomendación complementaria.)

Resumen ejecutivo de decisiones para ELIXIR
Elemento	Veredicto	Motivo principal
a) KEM triple (con HQC/McEliece)	NO hoy (ranura lista para 2027)	HQC sin estándar definitivo hasta 2027; liboqs-js es experimental.
b) Firmas SLH-DSA (FIPS 205)	SÍ	Estándar definitivo (ago 2024), basado solo en hash, ya en @noble/post-quantum.
c) Trinquete por mensaje + PQ periódico	SÍ (prioritario)	FS por mensaje + PCS postcuántica; muy viable al ser síncrono.
d) Cascada AES-256-GCM + XChaCha20-Poly1305	SÍ (en Web Worker)	Defensa en profundidad real con claves independientes y familias distintas.
e) PAKE + invitación en dos canales	CPace + 2 canales: SÍ / OPAQUE: NO	OPAQUE es cliente-servidor; CPace protege un 2.º factor corto entre pares.
f) Libreta con claves fijadas + bloqueo duro	SÍ (bóveda portátil en RAM)	Resuelve suplantación recurrente B2B sin dejar datos en claro en el navegador.
g) Metadatos, huella, acta bilateral, visor	SÍ (con aviso honesto en PDF/pantalla)	Gran valor diferencial para abogados, clínicas y banca.
h) Integridad web (SRI, CSP, verificador)	SÍ (+ extensión opcional verificadora)	Máxima mitigación honesta reconociendo el límite del servidor web.
i) Tráfico constante CBR (archivos incluidos)	SÍ (perfiles seleccionables)	Oculta presencia y tamaño de documentos dentro del flujo fijo.
j) Detección activa y bloqueo en rojo	SÍ	Transparencia exacta entre lo detectable en canal y lo indetectable en SO.
k) WebAuthn PRF + verificador offline de actas	SÍ	Diferenciación real más allá del reclamo «postcuántico».

Frase de una línea que distingue Elixir de Cristale:

Cristale protege conversaciones efímeras entre personas; Elixir convierte el navegador en una sala corporativa con secreto por mensaje, claves fijadas contra suplantación, tráfico constante también para documentos y actas de entrega verificables sin servidor.

2. Comparativa de plataformas frente a Cristale y Elixir

Fecha de corte de los datos: 19 de noviembre de 2026. Las celdas con información incompleta, no verificable públicamente o aún en despliegue llevan la marca ⚠️ Dudoso.

Criterio	WhatsApp	Telegram	Signal	iMessage	Threema	Wire	Session	SimpleX Chat	CRISTALE (Guardiana)	ELIXIR (Propuesta)
Cifrado E2EE por defecto	Sí, en chats 1 a 1, grupos y llamadas (Protocolo Signal, desde abr 2016).	No. Los chats normales y grupos son cliente-servidor (nube); solo los Chats Secretos 1 a 1 opcionales son E2EE (MTProto 2.0).	Sí, en todos los chats, grupos y llamadas.	Sí entre dispositivos Apple; los SMS verdes y ciertos flujos RCS no son iMessage E2EE.	Sí, en todos los mensajes, grupos y llamadas (NaCl / protocolo Ibex).	Sí, en mensajes, archivos y llamadas mediante estándar MLS (RFC 9420).	Sí, en chats 1 a 1 y grupos cerrados; las Comunidades públicas no son E2EE.	Sí, en chats directos y grupos mediante doble trinquete + capas de transporte.	Sí, por defecto en toda sala (solo texto y archivos).	Sí, por defecto en toda sala (solo texto y archivos).
Postcuántico (cuál y desde cuándo)	⚠️ Dudoso / No confirmado para chats. Meta publicó su estrategia PQC interna (abr 2026) y mencionó copias cifradas, pero no ha publicado especificación ni confirmación de PQC en sesiones de chat.	No. Los Chats Secretos usan Diffie-Hellman clásico de 2048 bits; la documentación oficial no recoge PQC.	Sí. PQXDH (X25519 + Kyber/ML-KEM-1024) desde sep 2023; trinquete continuo SPQR (ML-KEM) anunciado y en despliegue gradual desde oct 2025.	Sí. PQ3 (Curve25519 + ML-KEM-768 en inicio y renovación periódica) desde iOS 17.4, feb 2024.	No en producción aún. Anunció colaboración con IBM Research el 24 feb 2026 para implementar PQC.	⚠️ Dudoso en producción. Se declara «preparado para PQC» gracias a la agilidad de suites de MLS, sin documentación pública de despliegue general activo de KEM PQ.	⚠️ En desarrollo (no en producción). Protocolo v2 con ML-KEM + PFS anunciado en dic 2025; actualización de oct 2026 confirma que sigue en fase previa a despliegue general.	Sí. Híbrido con Streamlined NTRU Prime dentro del doble trinquete: beta mar 2024, por defecto en chats directos desde v5.7 (abr 2024); aún no en grupos.	Sí. Híbrido ML-KEM-1024 + ECDH P-384 y firmas ML-DSA-87 + ECDSA P-384 (en @noble/post-quantum 0.7.1, sin revisión externa independiente).	Sí. ML-KEM-1024 + ECDH P-384 con trinquete PQ periódico + firmas triples ECDSA + ML-DSA-87 + SLH-DSA (FIPS 205).
Metadatos que guarda el servidor	Extensos: número de teléfono, lista de contactos, pertenencia a grupos, hora/frecuencia de uso, IP, datos de dispositivo y compartición con Meta (Política de Privacidad; ficha App Store).	Altos en nube: IP, teléfono, contactos, historial completo de chats en la nube y metadatos sociales (Política de Privacidad; Telegram indica no guardar registros de Chats Secretos).	Mínimos: fecha de registro y última conexión (día). Sealed Sender oculta el remitente al servidor (oct 2018; citaciones judiciales hasta mar 2026).	Moderados: registros de consultas de capacidad iMessage (quién busca a quién) e IP retenidos hasta 25–30 días según Apple Legal Process Guidelines.	Mínimos: ID público, clave pública y token push; grupos gestionados en cliente sin conocimiento del servidor (Whitepaper jun 2026).	Moderados: cuentas, participantes de conversaciones, marcas de tiempo y registros operativos en nube UE. ⚠️ Dudoso el alcance exacto de retención tras migración a MLS.	Muy bajos: enrutamiento cebolla sobre red de nodos que oculta IP y relación emisor-receptor; nodos almacenan paquetes cifrados temporalmente.	Mínimos extremos: sin identificadores de usuario; colas unidireccionales temporales por contacto; sin grafo social en servidor.	Solo en tránsito: sala activa, IP de conexión y bytes cifrados en relé de Núremberg; sin buzón ni cuentas.	Solo en tránsito: sala activa, IP y caudal constante CBR (oculta cuándo y cuánto se envía); sin buzón ni cuentas.
Teléfono o cuenta obligatorios	Sí: número de teléfono obligatorio.	Sí: número de teléfono obligatorio (salvo números virtuales de Fragment en blockchain).	Sí al registrarse: teléfono obligatorio, aunque desde feb 2024 se puede ocultar usando nombres de usuario.	Sí: Cuenta de Apple (correo y/o teléfono) obligatoria.	No: usa un ID aleatorio de 8 caracteres; teléfono y correo son opcionales.	Sí: correo electrónico o cuenta corporativa (IdP).	No: genera un Account ID criptográfico sin teléfono ni correo.	No: ni teléfono, ni correo, ni identificador fijo de usuario.	No: solo código de 16 símbolos o enlace de 256 bits.	No: código de sala (y PIN en segundo canal opcional); identidad portátil opcional sin cuenta en servidor.
Copias en la nube	Opcionales (Google Drive, iCloud o nube WhatsApp); el cifrado E2EE de la copia en Drive/iCloud requiere activación manual.	Por defecto en servidores de Telegram para todos los chats salvo Chats Secretos.	Opcionales: Signal Secure Backups E2EE (clave de 64 caracteres) lanzadas en sep 2025 y ampliadas a todas las plataformas en sep 2026.	Activas si usas iCloud: con protección estándar Apple guarda la clave de copia; E2EE total exige activar Protección de Datos Avanzada (abr 2026).	Opcionales y locales/cifradas (Threema Safe o copia cifrada con contraseña elegida por el usuario).	No (solo copia local exportable cifrada; sincronización multi-dispositivo vía MLS).	No (recuperación de identidad mediante frase semilla local; sincronización cifrada entre dispositivos).	No (base de datos portátil exportable localmente por el usuario).	No existen.	No existen (solo actas de entrega descargadas voluntariamente en local).
Verificación de identidad	Código de seguridad / QR opcional; aviso opcional si cambia.	Imagen/huella de clave solo en Chats Secretos (opcional).	Números de seguridad / QR opcionales; aviso si cambia la identidad.	Contact Key Verification opcional desde iOS 17.2 (comprobación automática + código manual).	3 niveles (rojo/amarillo/verde por escaneo QR presencial).	Huella de dispositivo manual o automática vía IdP (ID Shield).	Verificación manual del Account ID; aprobación de dispositivos vinculados en Protocolo v2.	Código de seguridad por contacto (intercambio en 2 factores).	Obligatoria: 4 palabras comprometidas antes del intercambio; alarma y borrado si cambia.	Obligatoria + fijación: 4–5 palabras comprometidas + libreta de claves fijadas con bloqueo duro sin «aceptar igualmente».
Código abierto	No (cliente y servidor cerrados; ⚠️ no verificable de forma independiente).	Parcial: clientes abiertos (con retrasos ocasionales en publicación); servidor cerrado.	Sí: clientes, libsignal y servidor bajo licencias abiertas.	No (código cerrado, aunque publicó especificación y pruebas formales de PQ3).	Parcial: todas las apps cliente (iOS, Android, Desktop, Web) son abiertas; servidor central cerrado.	Sí: clientes y servidor de código abierto en GitHub.	Sí: clientes, libsession y software de nodos de código abierto.	Sí: clientes y servidores de relé completamente abiertos en GitHub.	Previsto / dependiente de publicación (usa @noble/post-quantum abierto, sin revisión externa independiente).	Sí en cliente (compilación reproducible) + huellas públicas multi-canal y verificador abierto.
Qué queda guardado en el dispositivo	Historial completo y adjuntos en base de datos local (salvo mensajes temporales activados).	Caché local de chats en nube y base de datos local de Chats Secretos.	Base de datos local cifrada con historial y adjuntos (salvo temporizador de borrado).	Historial completo de mensajes y adjuntos en el dispositivo y, si se activa, en iCloud.	Base de datos local cifrada (SQLite/SQLCipher) con mensajes y contactos.	Historial local cifrado en el dispositivo.	Historial local cifrado y clave de cuenta en el dispositivo.	Base de datos local cifrada con historial, archivos y contactos.	Nada por diseño: solo RAM; al cerrar la pestaña desaparece.	Nada por diseño: solo RAM; los archivos en visor no se descargan. Solo se guarda en disco lo que el usuario exporte expresamente (acta o bóveda cifrada).
3. Apartado de espionaje para el público general
Tres propuestas de nombre para el apartado

Cómo se intercepta una comunicación (y hasta dónde llega la defensa) — Sobrio, institucional, ideal para despachos y banca.

Anatomía de una escucha — Solemne, editorial, fácil de recordar.

El mapa real de la vigilancia — Directo, periodístico y honesto.

Base documental verificada (puntos a, b y c)
a) Escucha de llamadas y lectura de SMS entre operadoras (p. ej., de Vodafone a Orange)

Por qué no hay cifrado de extremo a extremo: En la telefonía móvil tradicional, el cifrado protege como máximo el salto de radio entre tu móvil y la antena más cercana; una vez dentro del núcleo de la operadora y al cruzar hacia otra operadora, las llamadas y los SMS circulan bajo el control de las redes y no están cifrados de extremo a extremo (CISA, Mobile Communications Best Practice Guidance, 18 dic 2024; NIST SP 800-187, dic 2017).   
CISA

SS7 y Diameter: Son los protocolos de señalización con los que las operadoras del mundo intercambian llamadas, SMS y ubicación en itinerancia. Nacieron bajo una premisa de confianza mutua entre operadoras y carecen de autenticación robusta de origen; el Departamento de Seguridad Nacional de EE. UU. (DHS) documentó en abril de 2017 que actores con acceso a la red SS7/Diameter pueden rastrear ubicación, redirigir llamadas e interceptar SMS.   
Homeland Security

Sistemas de interceptación legal atacados (Salt Typhoon, 2024–2025): Las leyes obligan a las operadoras a mantener interfaces para escuchas judiciales (como CALEA en EE. UU.). En otoño de 2024 se confirmó —y el aviso conjunto de CISA, FBI y NSA AA25-239A del 27 de agosto de 2025 detalló— que actores estatales vinculados a China (Salt Typhoon) comprometieron enrutadores troncales de grandes operadoras globales y accedieron a registros de llamadas, tráfico y sistemas de interceptación legal. La propia CISA recomendó el 18 de diciembre de 2024 dejar de confiar en SMS y llamadas convencionales y migrar a mensajería cifrada de extremo a extremo.   
DeepStrike's penetration testing
+ 1

Falsas antenas (IMSI catchers) y bajada a 2G: Un dispositivo portátil puede hacerse pasar por una torre legítima, capturar identificadores del terminal y forzar al teléfono a bajar a tecnología 2G, donde el teléfono no autentica a la red y los cifrados antiguos (A5/1, A5/2) están rotos o pueden desactivarse (DHS, abr 2017; NIST SP 800-187, dic 2017; Android Open Source Project, act. sep 2026).   
Homeland Security

Duplicado de SIM (SIM swapping): Mediante engaño a la operadora o complicidad interna, un atacante transfiere tu número a una tarjeta SIM bajo su control y recibe tus llamadas y SMS de verificación. La magnitud del problema llevó a la FCC estadounidense a aprobar normas específicas contra el SIM swapping el 15 de noviembre de 2023.   
Federal Communications Commission (.gov)

b) Cómo funciona un ataque a comunicaciones, paso a paso

Interceptar el camino: Escuchar cables submarinos, operadoras, redes Wi-Fi o protocolos de señalización. En junio de 2013, las revelaciones de Edward Snowden expusieron programas de vigilancia masiva como PRISM (acceso en servidores de grandes tecnológicas) y Upstream (captura directa en troncales de fibra óptica), cuya existencia y marco legal bajo la Sección 702 fueron confirmados oficialmente por la junta independiente estadounidense PCLOB el 2 de julio de 2014.   
National Security Agency

Entrar en el propio teléfono (software espía comercial): Cuando el cifrado impide leer el tráfico en tránsito, los atacantes van al origen: el dispositivo. Programas comerciales como Pegasus (NSO Group, vendido a agencias gubernamentales) han infectado teléfonos incluso sin que la víctima pulse ningún enlace (cero clics), como documentaron Amnistía Internacional (18 jul 2021) y Citizen Lab en el exploit FORCEDENTRY (13 sep 2021). En España, Citizen Lab documentó en CatalanGate (18 abr 2022) al menos 65 personas atacadas o infectadas (51 infecciones confirmadas forensemente con Pegasus), el CNI reconoció 18 intervenciones ante el Congreso el 5 de mayo de 2022, y el propio Gobierno español denunció el 2 de mayo de 2022 la infección ilícita de los teléfonos del presidente Pedro Sánchez y la ministra Margarita Robles.   
Amnesty International
+ 1

Atacar las copias en la nube: Aunque una aplicación cifre los mensajes en tránsito, si guarda copias en servidores externos con claves controladas por el proveedor (como ocurre en configuraciones estándar sin cifrado extremo a extremo activado), cualquiera con acceso legal o ilícito a esa nube puede leer el archivo histórico.   
Apple Support

Engaño y suplantación (incluida voz clonada con IA): En muchos casos no hace falta romper nada técnico: basta con hacerse pasar por un directivo, un abogado o un familiar. La Comisión Federal de Comercio de EE. UU. (FTC) alertó ya en marzo y noviembre de 2023 de que herramientas de inteligencia artificial permiten clonar la voz de una persona a partir de unos pocos segundos de audio público para engañar por teléfono.   
FTC Consumer Advice

c) Por qué nosotros (y qué no puede defender ninguna herramienta)

Cristale cierra el camino de red (híbrido postcuántico, sin cuentas, sin buzón, sin copias en la nube, solo memoria, verificación obligatoria de palabras, tramas fijas).

Elixir añade defensa continua mensaje a mensaje, resistencia contra suplantación recurrente, limpieza de metadatos documentales, tráfico constante incluso al enviar archivos, detección activa de manipulación del canal y actas probatorias sin servidor.

Límite absoluto y honesto: Ni Cristale ni Elixir ofrecen llamadas ni vídeo (solo texto y archivos), y ninguna herramienta de software puede proteger lo que aparece en la pantalla de un teléfono u ordenador ya infectado por software espía, ni impedir una foto externa, ni eliminar por completo la confianza inicial en el servidor que entrega una web si no se verifica su código por una vía independiente.

Texto final propuesto para publicar en [www.house1718.com](https://www.house1718.com)
Anatomía de una escucha

La mayoría de las personas cree que una llamada telefónica o un SMS viajan dentro de un tubo cerrado. En realidad, viajan como una postal abierta.

1. Por qué una llamada o un SMS pueden escucharse entre operadoras

Cuando llamas o envías un SMS desde una operadora a otra —por ejemplo, de Vodafone a Orange—, tu voz o tu mensaje no viajan protegidos de teléfono a teléfono. La red móvil solo protege, en el mejor de los casos, el primer salto por el aire hasta la antena más cercana. Al entrar en la red de las operadoras, la comunicación queda expuesta a cuatro debilidades conocidas desde hace años:

Redes nacidas para confiar: Los protocolos que conectan a las operadoras del mundo (SS7 y Diameter) fueron diseñados hace décadas asumiendo que todos los participantes eran de fiar. Informes oficiales del Departamento de Seguridad Nacional estadounidense (2017) documentaron cómo el acceso indebido a esas redes permite localizar teléfonos, desviar llamadas y leer SMS.   
Homeland Security

Las puertas de escucha legal, atacadas: Las operadoras están obligadas por ley a mantener sistemas para escuchas judiciales. En 2024 y 2025, agencias como CISA y el FBI confirmaron que un grupo estatal (Salt Typhoon) penetró en grandes operadoras internacionales y llegó hasta sus propios sistemas de interceptación legal.   
DeepStrike's penetration testing

Antenas falsas: Un equipo portátil puede hacerse pasar por una torre de telefonía cercana y empujar a tu móvil a conectarse a la antigua red 2G, donde el teléfono no comprueba si la antena es real y el cifrado puede anularse.   
Homeland Security

Duplicado de tarjeta SIM: Si alguien convence a tu operadora para emitir una copia de tu SIM, tus llamadas y tus códigos SMS pasan a sonar en su bolsillo.   
Federal Communications Commission (.gov)

2. Cómo se espía una comunicación hoy, paso a paso

Espiar no consiste siempre en «romper matemáticas». Un atacante suele elegir el eslabón más débil:

Escuchar el camino: Como un empleado de correos que fotocopia todo lo que pasa por la cinta transportadora. Las revelaciones de 2013 y el informe oficial del PCLOB (2014) confirmaron la captura masiva de tráfico en cables y servidores centrales.   
National Security Agency

Robar las copias en la nube: De poco sirve poner tres cerrojos en la puerta de casa si dejas una copia de las llaves en un trastero ajeno. Muchos chats seguros pierden su protección cuando el historial se guarda en la nube sin cifrado exclusivo del usuario.   
Apple Support

Entrar dentro del propio teléfono: Si la carta va en un sobre lacrado imposible de abrir en el correo, el espía entra en tu despacho y mira por encima de tu hombro mientras la escribes. Así funciona el software espía comercial como Pegasus (NSO Group): investigaciones forenses de Amnistía Internacional (2021) y Citizen Lab (2021–2022) demostraron que puede infectar un teléfono incluso sin pulsar ningún enlace, con casos confirmados en España tanto en la sociedad civil como en altos cargos del Estado.   
The Citizen Lab

Suplantar a la persona: Hoy bastan unos segundos de audio de una entrevista o una nota de voz para clonar una voz con inteligencia artificial y engañar por teléfono, como ha advertido la FTC estadounidense (2023).   
FTC Consumer Advice

3. Qué hace nuestra herramienta — y qué no puede hacer nadie

House 1718 no tiene llamadas, ni voz, ni vídeo: es únicamente un canal de texto y envío de documentos en el navegador.

Cristale cierra el camino: cifra de extremo a extremo con algoritmos preparados frente a futuros ordenadores cuánticos, exige comprobar cuatro palabras antes de hablar para frenar suplantaciones, no guarda copias en servidores ni en tu disco y desaparece al cerrar la pestaña.

Elixir refuerza el perímetro para organizaciones: renueva las claves en cada mensaje y de forma periódica, fija las identidades recurrentes para impedir que alguien sustituya a tu interlocutor, limpia metadatos de documentos antes de enviarlos, mantiene un caudal constante para que ni siquiera se distinga cuándo envías un archivo, detiene la sesión en rojo si detecta manipulación en el canal y permite emitir actas de entrega firmadas sin que ningún servidor vea el contenido.

La verdad completa sobre los límites: ninguna herramienta de mensajería —ni la nuestra ni ninguna otra— puede protegerte si tu ordenador o tu teléfono ya están infectados por software espía: quien controla tu equipo ve tu pantalla antes de que el mensaje se cifre. Tampoco puede impedir que alguien haga una fotografía a la pantalla. Y, al funcionar en una web, exige que el código entregado por el servidor no haya sido manipulado (por eso publicamos nuestras huellas de verificación por vías independientes). La seguridad real empieza por no prometer lo imposible.

4. Lista de fuentes oficiales y verificadas

NIST — Post-Quantum Cryptography FIPS Approved (FIPS 203, FIPS 204, FIPS 205) (13 de agosto de 2024): https://csrc.nist.gov/news/2024/postquantum-cryptography-fips-approved

NIST — NIST Selects HQC as Fifth Algorithm for Post-Quantum Encryption (11 de marzo de 2025, act. 20 de marzo de 2025): https://www.nist.gov/news-events/news/2025/03/nist-selects-hqc-fifth-algorithm-post-quantum-encryption

NIST — SP 800-187, Guide to LTE Security (diciembre de 2017): https://csrc.nist.gov/pubs/sp/800/187/final

Paul Miller (@noble/post-quantum) — Repositorio oficial y registro de versiones (v0.7.x) (27 de agosto de 2026): https://github.com/paulmillr/noble-post-quantum y https://github.com/paulmillr/noble-post-quantum/releases

Open Quantum Safe (@oqs/liboqs-js) — Documentación oficial y advertencias de uso (2025–2026): https://github.com/open-quantum-safe/liboqs-js

IETF / RFC Editor — RFC 9807: The OPAQUE Augmented Password-Authenticated Key Exchange (aPAKE) Protocol (24 de julio de 2025): https://www.rfc-editor.org/info/rfc9807/

IETF / IRTF CFRG — draft-irtf-cfrg-cpace-21: CPace, a balanced composable PAKE (revisión 22 de abril de 2026, act. 7 de octubre de 2026): https://datatracker.ietf.org/doc/draft-irtf-cfrg-cpace/

Signal — Technology preview: Sealed sender for Signal (29 de octubre de 2018): https://signal.org/blog/sealed-sender/

Signal — Quantum Resistance and the Signal Protocol (PQXDH) (19 de septiembre de 2023): https://signal.org/blog/pqxdh/

Signal — Keep your phone number private with Signal usernames (20 de febrero de 2024): https://signal.org/blog/phone-number-privacy-usernames/

Signal — Introducing Signal Secure Backups (8 de septiembre de 2025) y Back to Backups: A Year in Review (28 de septiembre de 2026): https://signal.org/blog/introducing-secure-backups/ y https://signal.org/blog/backup-improvements/

Signal — Signal Protocol and Post-Quantum Ratchets (SPQR) (2 de octubre de 2025): https://signal.org/blog/spqr/

Signal — Government Requests (transparencia judicial) (actualizado 6 de marzo de 2026): https://signal.org/bigbrother/

Apple Security Research — iMessage with PQ3: The new state of the art in quantum-secure messaging at scale (21 de febrero de 2024): https://security.apple.com/blog/imessage-pq3/

Apple Support — About iMessage Contact Key Verification (2024–2026): https://support.apple.com/en-us/118246

Apple Support — How to turn on Advanced Data Protection for iCloud (17 de abril de 2026): https://support.apple.com/en-us/108756

Apple Legal — Legal Process Guidelines (U.S. Government & Law Enforcement): https://www.apple.com/legal/privacy/law-enforcement-guidelines-us.pdf

WhatsApp / Meta — About end-to-end encrypted backup y About Code Verify: https://faq.whatsapp.com/490592613091019 y https://faq.whatsapp.com/web/security-and-privacy/about-code-verify/?lang=es

Engineering at Meta — Post-Quantum Cryptography Migration at Meta: Framework, Lessons, and Takeaways (16 de abril de 2026): https://engineering.fb.com/2026/04/16/security/post-quantum-cryptography-migration-at-meta-framework-lessons-and-takeaways/

Telegram — End-to-End Encryption, Secret Chats (API Docs) y Privacy Policy: https://core.telegram.org/api/end-to-end y https://telegram.org/privacy?setln=es

Threema — Threema and IBM Research: Collaboration for a Quantum-Secure Future (24 de febrero de 2026): https://threema.com/en/blog/quantum-secure-future

Threema — Cryptography Whitepaper (26 de junio de 2026): https://threema.com/assets/documents/threema-cryptography-whitepaper.pdf

Wire — Messaging Layer Security (MLS) y Wire Security Whitepaper: https://wire.com/en/messaging-layer-security y https://start.wire.com/wire-security-whitepaper

Session — Session Protocol V2: PFS, Post-Quantum and the Future of Private Messaging (1 de diciembre de 2025) y Session Protocol v2: An Update on PFS, Post-Quantum and Linked Devices (13 de octubre de 2026): https://getsession.org/session-protocol-v2 y https://getsession.org/blog/session-protocol-v2-update

SimpleX Chat — v5.6 (beta): adding quantum resistance (14 de marzo de 2024), v5.7 released (26 de abril de 2024) y Documentación técnica: https://simplex.chat/blog/20240314-simplex-chat-v5-6-quantum-resistance-signal-double-ratchet-algorithm.html, https://simplex.chat/blog/20240426-simplex-legally-binding-transparency-v5-7-better-user-experience.html y https://github.com/simplex-chat/simplex-chat/blob/stable/docs/SIMPLEX.md

DHS (U.S. Department of Homeland Security) — Study on Mobile Device Security (abril de 2017): https://www.dhs.gov/sites/default/files/publications/DHS%20Study%20on%20Mobile%20Device%20Security%20-%20April%202017-FINAL.pdf

CISA — Mobile Communications Best Practice Guidance (18 de diciembre de 2024; actualizado 2025/2026): https://www.cisa.gov/sites/default/files/2024-12/guidance-mobile-communications-best-practices.pdf y https://www.cisa.gov/resources-tools/resources/mobile-communications-best-practice-guidance

CISA / FBI / NSA — Joint Advisory AA25-239A: Countering Chinese State-Sponsored Actors Compromise of Networks Worldwide to Feed Global Espionage System (27 de agosto de 2025): https://www.cisa.gov/topics/cyber-threats-and-advisories/nation-state-cyber-actors/china/publications

Android Open Source Project (Google) — Disable 2G | Cellular Security (actualizado 30 de septiembre de 2026) y Android 14 cellular connectivity security (8 de agosto de 2023): https://source.android.com/docs/security/features/cellular-security/disable-2g y https://security.googleblog.com/2023/08/android-14-introduces-first-of-its-kind.html

FCC (Federal Communications Commission) — SIM Swapping and Port-Out Fraud Rules (Report and Order, 15 nov 2023; fecha de cumplimiento 28 ago 2024): https://www.fcc.gov/consumer-governmental-affairs/fcc-announces-effective-compliance-date-sim-swapping-item

PCLOB (Privacy and Civil Liberties Oversight Board) — Report on the Surveillance Program Operated Pursuant to Section 702 of FISA (PRISM & Upstream) (2 de julio de 2014): https://www.nsa.gov/portals/75/documents/about/civil-liberties/resources/pclob_section_702_report.pdf

Amnistía Internacional (Security Lab) — Forensic Methodology Report: How to catch NSO Group's Pegasus (18 de julio de 2021) y Catalangate: obstáculos para investigar Pegasus (22 de octubre de 2026): https://www.amnesty.org/en/latest/research/2021/07/forensic-methodology-report-how-to-catch-nso-groups-pegasus/ y https://www.es.amnesty.org/en-que-estamos/blog/historia/articulo/catalangate-investigacion-judicial-pegasus/

The Citizen Lab (University of Toronto) — FORCEDENTRY: NSO Group iMessage Zero-Click Exploit Captured in the Wild (13 de septiembre de 2021) y CatalanGate (18 de abril de 2022): https://citizenlab.ca/research/forcedentry-nso-group-imessage-zero-click-exploit-captured-in-the-wild/ y https://citizenlab.ca/research/catalangate-extensive-mercenary-spyware-operation-against-catalans-using-pegasus-candiru/

Presidencia del Gobierno de España (La Moncloa) / Europa Press — Infección con Pegasus en terminales de Pedro Sánchez y Margarita Robles (2 de mayo de 2022) y Reforma del control del CNI (26 de mayo de 2022): https://www.europapress.es/nacional/noticia-gobierno-anuncia-telefonos-sanchez-robles-sido-infectados-software-pegasus-20220502094439.html y https://www.lamoncloa.gob.es/lang/en/presidente/news/paginas/2022/20220526_appearance.aspx

FTC (Federal Trade Commission) — Scammers use AI to enhance their family emergency schemes (20 de marzo de 2023) y Announcing the FTC's Voice Cloning Challenge (16 de noviembre de 2023): https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes y https://consumer.ftc.gov/consumer-alerts/2023/11/announcing-ftcs-voice-cloning-challenge

Gemini es una IA y puede cometer errores.