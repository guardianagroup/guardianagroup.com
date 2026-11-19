# Ronda 95 · Gemini · ampliación (Symphony, SWIFT, archivo, 1 TB, textos) · 19 nov 2026

Gemini ha dicho

MEMORANDO TÉCNICO Y ESTRATÉGICO · RONDA 95 (AMPLIACIÓN)Cliente: Guardiana Group S.A.S. · Marca en pantalla: Elixir · Fecha: 19 de noviembre de 2026

1. Competencia empresarial, SWIFT / ISO 20022 y comparativa honesta

Para que un director de seguridad de un banco o un socio de despacho nos tome en serio, nunca debemos comparar herramientas de categorías distintas como si hicieran lo mismo. Hoy el entorno corporativo combina cuatro piezas diferentes: redes de mensajería financiera regulada con vigilancia interna (Symphony, Bloomberg IB), mensajería federada o suiza instalada con gestión corporativa (Element X/Matrix, Threema Work, Wire), suites de correo y disco cifrado (Proton) y redes interbancarias de liquidación (SWIFT sobre ISO 20022). Elixir ocupa otro lugar: una sala efímera en el navegador, sin instalación ni cuentas en servidor, para intercambios sensibles con terceros externos y actas verificables.

Comparativa empresarial fila por fila

Las celdas cuya situación pública exacta en 2026 no es verificable o sigue en transición llevan la marca ⚠️ Dudoso.

Criterio	Symphony	Bloomberg (IB)	Element X / Matrix	Threema Work	Wire	Proton (Mail / Drive)	CRISTALE (Guardiana)	ELIXIR (Propuesta)
Categoría real	Chat financiero regulado (banca de inversión; fundado por consorcio con Bank of America, oct 2014).	Chat financiero integrado en el Terminal Bloomberg.	Mensajería federada de código abierto (usada por gobiernos: Tchap en Francia, 2019; BwMessenger y TI-Messenger en Alemania, 2020+).	Mensajería corporativa suiza con gestión MDM.	Colaboración corporativa de origen suizo/europeo.	No es un chat en tiempo real: suite suiza de correo (OpenPGP) y archivos en la nube.	Chat efímero 1 a 1 en navegador (personas).	Sala efímera corporativa en navegador (texto y documentos).
Cifrado E2EE y quién tiene las claves	Sí, con claves en manos del banco (CMEK): el cliente opera su propio Key Manager / HSM (Symphony Security). Symphony no descifra, pero el banco sí puede descifrar para cumplimiento.	No es E2EE de conocimiento cero: cifrado en tránsito y reposo gestionado por Bloomberg; acceso corporativo integrado para supervisión y archivo (Bloomberg Vault).	Sí en salas privadas (Olm/Megolm vía SDK Rust vodozemac). Claves en dispositivos del usuario; en despliegue gubernamental, la entidad controla el servidor propio.	Sí por defecto (protocolo Ibex / NaCl). Claves únicamente en el dispositivo del usuario.	Sí por defecto mediante estándar IETF MLS (RFC 9420, jul 2023). Claves en los dispositivos de los participantes.	Sí en contenido de Proton Mail (OpenPGP entre usuarios Proton o con contraseña) y Proton Drive. No cifra cabeceras ni asunto del correo por diseño de OpenPGP.	Sí por defecto (ML-KEM-1024 + ECDH P-384). Solo en memoria de ambos navegadores.	Sí por defecto con trinquete por mensaje y PQ periódico. Solo en memoria; archivo opcional cifrado con clave exclusiva del cliente.
Postcuántico (cuál y desde cuándo)	⚠️ Dudoso: sin especificación pública confirmada de KEM postcuántico activo en producción.	⚠️ Dudoso: sin especificación pública de PQC extremo a extremo en IB.	⚠️ Dudoso / En exploración: sin despliegue general confirmado de trinquete PQ en producción sobre Element X.	No en producción aún: colaboración con IBM Research anunciada el 24 feb 2026.	⚠️ Dudoso en producción: arquitectura preparada vía MLS (RFC 9420), sin anuncio público de KEM PQ generalizado.	⚠️ Dudoso en producción: investigación activa en borradores PQC de OpenPGP, sin despliegue general verificado en Mail/Drive.	Sí: ML-KEM-1024 + P-384 y ML-DSA-87 + ECDSA P-384 (@noble/post-quantum 0.7.1, sin revisión externa independiente).	Sí: híbrido ML-KEM-1024 + P-384 con trinquete PQ periódico + firmas triples ECDSA + ML-DSA-87 + SLH-DSA (FIPS 205).
Metadatos y visibilidad del servidor	Altos para el banco: directorio corporativo, participantes, horas, políticas de retención y archivo completo vía Key Manager.	Totales para Bloomberg y la firma: identidad verificada en Terminal, marcas temporales, archivo completo y vigilancia de cumplimiento.	Moderados: los homeservers federados ven pertenencia a salas, identidades Matrix, marcas de tiempo y grafo de salas.	Mínimos: ID aleatorio, clave pública y token push; servidores en Suiza. La empresa gestiona licencias/MDM sin leer chats.	Moderados: cuentas corporativas, lista de conversaciones y registros operativos (nube UE o servidor propio).	Moderados en correo: remitente, destinatario, hora y asunto en claro en Proton Mail; mínimos en Proton Drive. Servidores en Suiza.	Solo en tránsito: sala activa, IP y tramas fijas de 1 KB en Núremberg. Sin cuentas ni buzón.	Solo en tránsito: sala activa, IP y tráfico constante CBR (en modo sigilo). Sin cuentas ni buzón.
Instalación y cuenta obligatoria	Sí: cuenta corporativa y plataforma gestionada (requiere integración de cumplimiento).	Sí: suscripción a Bloomberg Terminal / cuenta verificada por la entidad.	Sí: cuenta en servidor Matrix + app o cliente web configurado.	Sí: app instalada + licencia Threema Work gestionada (sin teléfono obligatorio).	Sí: cuenta corporativa + app o cliente web.	Sí: cuenta Proton (en Drive/Mail permite compartir enlaces con externos).	No: navegador sin instalar nada; solo código o enlace.	No: navegador sin instalar nada; código (+ PIN opcional por segundo canal).
Conservación / cumplimiento regulatorio	Nativo: diseñado expresamente para SEC 17a-4, CFTC y MiFID II.	Nativo: Bloomberg Vault integrado para archivo regulatorio inmutable.	Configurable en despliegues propios con conectores externos (rompe la efimeridad).	Limitado: enfoque de privacidad estricta; sin archivo centralizado descifrable por el servidor.	Disponible mediante módulos empresariales de retención legal.	Parcial: archivo en buzón/Drive del cliente; sin flujo nativo de sala efímera con acta bilateral.	No existe: desaparece al cerrar la pestaña.	Opcional bajo llave del cliente: Archivo Custodiado cifrado en navegador + Actas de Entrega firmadas sin servidor.
Qué queda en el equipo	Caché y acceso autenticado según política del banco.	Sesiones y acceso bajo entorno del Terminal Bloomberg.	Base de datos local cifrada en dispositivo.	Base de datos local cifrada (SQLCipher).	Base de datos local cifrada.	Caché del navegador/app + historial persistente en servidores cifrados de Proton.	Nada por diseño (solo RAM).	Nada por diseño (solo RAM), salvo lo que el usuario exporte expresamente (acta o archivo cifrado).
Qué son SWIFT e ISO 20022 (y por qué NO compiten con un chat)

Qué es SWIFT: Fundada en 1973 en Bélgica, SWIFT (Society for Worldwide Interbank Financial Telecommunication) es una red cerrada de mensajería financiera que conecta a más de 11.000 entidades para enviar órdenes estructuradas (transferencias internacionales, valores, tesorería). No es un chat ni un canal para negociar contratos o intercambiar PDFs confidenciales entre un abogado y su cliente.

Qué es ISO 20022: Es un estándar abierto de formato de datos (esquemas XML) para estructurar pagos e información financiera; no es un protocolo de cifrado ni una red de transporte. SWIFT culminó en noviembre de 2025 el periodo de coexistencia de pagos transfronterizos (CBPR+) hacia ISO 20022 (iniciado el 20 de marzo de 2023).

Qué protege SWIFT: Protege el tráfico de banco a banco dentro de su red privada (SIPN) mediante módulos de seguridad hardware (HSM), infraestructura de clave pública (PKI), firmas digitales de no repudio y autorizaciones bilaterales (RMA).

El ataque real al Banco de Bangladés (4–5 de febrero de 2016): Atacantes vinculados al grupo norcoreano Lazarus (imputación del Departamento de Justicia de EE. UU., 6 sep 2018) no rompieron el cifrado de la red SWIFT. Comprometieron los equipos internos del Banco de Bangladés, accedieron a su servidor local SWIFT Alliance Access, manipularon el software de la impresora de confirmación y emitieron 35 órdenes fraudulentas por 951 millones de dólares a través de la Reserva Federal de Nueva York. Lograron sustraer 81 millones de dólares netos (otras transferencias se frenaron por alertas y un error tipográfico en «foundation»). Como respuesta, SWIFT lanzó su Customer Security Programme (CSP, 2016–2017) para exigir seguridad en los equipos internos de cada banco.

La lección para banca y despachos: Exactamente la misma que sostiene Elixir con honestidad: ninguna red cifrada —ni SWIFT ni Elixir— impide un robo si el atacante ya controla el ordenador desde el que se escribe.

Lectura honesta para banca y despachos: qué tienen hoy vs. qué aporta Elixir

Qué tienen hoy: Los bancos de primer orden ya tienen Symphony y Bloomberg IB para hablar con contrapartes del sector bajo vigilancia de cumplimiento. Pero cuando necesitan intercambiar documentos ultraconfidenciales con un tercero externo sin Terminal ni Symphony (un despacho externo, un perito, un cliente de banca privada, una contraparte en una fusión antes del anuncio), acaban cayendo en correo electrónico sin cifrar, enlaces de nube con copias en servidores ajenos o WhatsApp personal —el exacto motivo por el que la SEC y la CFTC impusieron miles de millones de dólares en multas entre 2021 y 2024—.

Qué aporta Elixir: No pretende sustituir a Bloomberg IB ni a Symphony en mesa de tesorería. Resuelve el eslabón externo de alta sensibilidad: abrir una sala en segundos sin instalar nada, fijar la identidad del interlocutor, enviar documentos limpios de metadatos con acta bilateral firmada y, si el regulador exige conservar el intercambio, generar un archivo cifrado cuyas llaves posee únicamente el departamento de cumplimiento del cliente.

2. Obligación de conservar y diseño del Archivo Custodiado en Elixir
Qué exige la ley por sector (fuentes oficiales)
Sector	Norma y fuente oficial	Obligación concreta de conservación
Banca / Brókeres (EE. UU.)	SEC Rule 17a-4 (17 CFR § 240.17a-4, reformada 12 oct 2022, cumplimiento obligatorio 3 may 2023) y CFTC Reg. 1.31 (17 CFR § 1.31, reformada 23 may 2017).	Conservar comunicaciones de negocio entre 3 y 6 años (SEC) o 5 años (CFTC) en formato inalterable (WORM —escritura única, lectura múltiple— o sistema con registro cronológico inalterable que permita reconstruir el original). El uso de mensajería fuera de archivo (off-channel) supuso sanciones masivas de SEC/CFTC (p. ej., 1.100 M$ a 16 firmas el 27 sep 2022).
Banca / Inversión (UE)	MiFID II (Directiva 2014/65/UE, art. 16.7, aplicable desde 3 ene 2018) y Reglamento Delegado (UE) 2017/565 (art. 76).	Conservar comunicaciones electrónicas relativas a recepción, transmisión y ejecución de órdenes durante un mínimo de 5 años (ampliable a 7 años a petición de la autoridad supervisora), en soporte duradero inalterable.
Clínicas y sanidad	RGPD (Reglamento UE 2016/679, art. 9), Ley 41/2002 en España (art. 17) y HIPAA en EE. UU. (45 CFR Parte 164).	Protección reforzada de datos de salud; en España, conservación mínima de la historia clínica durante 5 años desde el alta (más según normativa autonómica); en EE. UU., retención mínima de documentación HIPAA de 6 años más leyes estatales de historiales.
Despachos de abogados	Ley 10/2010 PBC/FT en España (art. 25, 28 abr 2010) y secreto profesional (Estatuto General de la Abogacía, RD 135/2021, 2 mar 2021).	Secreto profesional estricto; en operaciones sujetas a prevención de blanqueo (compraventa de inmuebles, gestión de fondos, sociedades), obligación legal de conservar la documentación durante 10 años.
Diseño técnico: Archivo Custodiado en el navegador (clave 100% del cliente)

El objetivo es mantener Cristale intacto («nada se guarda, nunca») y ofrecer en Elixir un modo de Archivo Custodiado opcional por sala, visible en cabecera para ambos participantes («Archivo Custodiado activo: se genera copia cifrada para el cliente» — nunca grabación encubierta).

Cómo funciona sin que ningún servidor de Guardiana pueda leer un solo byte:

Par de claves de custodia generado por el cliente (fuera de nuestros servidores):

El departamento de cumplimiento del banco, clínica o despacho genera en su propio equipo (o en su HSM interno) un par de claves híbrido de custodia: ML-KEM-1024 + ECDH P-384.

La clave privada de descifrado nunca sale del cliente (puede dividirse con esquema de umbral Shamir 
𝑀
M-de-
𝑁
N, por ejemplo 2 de 3 llaves entre Cumplimiento, Dirección Legal y Auditoría Interna, para que ninguna persona individual abra archivos sin autorización colegiada).

En la configuración de Elixir solo se carga la clave pública de custodia (custodia_pub.json), cuya huella SHA-384 queda fijada y visible al crear la sala.

Construcción en RAM de un registro encadenado e inalterable:

Durante la conversación, el navegador ensambla en memoria un registro estructurado (JSONL canónico) donde cada entrada contiene: índice secuencial, marca temporal UTC, identidad pública verificada del emisor, texto o metadatos/huella SHA-384 del archivo adjunto, firma del emisor y encadenamiento hash SHA-384 sobre la entrada anterior (
𝐻
𝑛
=
SHA-384
(
𝐻
𝑛
−
1
∥
entrada
𝑛
)
H
n
	​

=SHA-384(H
n−1
	​

∥entrada
n
	​

)).

Al cerrar la sala (o periódicamente en sesiones largas), ambos extremos firman el resumen raíz 
𝐻
final
H
final
	​

 (ECDSA P-384 + ML-DSA-87 + SLH-DSA). Así nadie —ni siquiera el propio usuario después— puede borrar un mensaje intermedio sin romper la cadena criptográfica.

Cifrado envolvente local antes de abandonar la RAM:

El navegador genera una clave simétrica aleatoria de un solo uso (
𝐾
archivo
K
archivo
	​

), cifra el paquete completo con la cascada AES-256-GCM + XChaCha20-Poly1305 y encapsula 
𝐾
archivo
K
archivo
	​

 exclusivamente bajo la clave pública de custodia del cliente (ML-KEM-1024 + P-384).

Propiedad clave: una vez cifrado en el navegador, ni el propio empleado que participó en el chat ni los servidores de Guardiana pueden descifrar el paquete .elixir-vault, porque solo existe la clave pública en el navegador.

Dos vías de depósito (nunca en servidores descifrables por Guardiana):

Vía A (Descarga directa local): El paquete cifrado .elixir-vault se escribe directamente en el disco o unidad de red interna del cliente mediante File System Access API, sin pasar por ningún almacenamiento nuestro.

Vía B (Envío cifrado directo al repositorio WORM del cliente): El navegador envía el bloque ya cifrado directamente (vía URL prefirmada o webhook corporativo) al almacenamiento inmutable propio del cliente (por ejemplo, Amazon S3 Object Lock en modo Compliance o Azure Immutable Blob Storage), donde queda bloqueado contra borrado durante 5, 7 o 10 años.

Límite legal honesto que debe figurar en contrato: Elixir entrega un archivo cifrado con integridad criptográfica verificable y sin acceso de Guardiana; pero la responsabilidad regulatoria (SEC 17a-4, MiFID II, HIPAA, PBC/FT) recae en la entidad regulada, que debe depositar el bloque cifrado en un repositorio inmutable bajo su gobierno, controlar la custodia de su clave privada y establecer sus controles internos para evitar comunicaciones fuera de política.

3. Envíos de hasta 1 TB a máxima velocidad desde el navegador

Enviar 1 TB desde una pestaña del navegador sin colgar el equipo es técnicamente factible hoy, siempre que nunca se cargue el archivo en RAM y se respeten los límites reales de los navegadores y de la física de red.

1) Troceado en flujo continuo (streaming) y concurrencia

Lectura sin memoria: El emisor lee el archivo origen mediante File.slice(inicio, fin) en bloques fijos de 8 MB o 16 MB (un archivo de 1 TB en bloques de 16 MB son 65.536 fragmentos). Cada bloque se transfiere como ArrayBuffer transferible (zero-copy) a un grupo de Web Workers paralelos (p. ej. 4 a 8 hilos según navigator.hardwareConcurrency) para cifrar sin congelar la interfaz.

Control de contrapresión (backpressure): El bucle de lectura solo extrae el siguiente bloque cuando la cola del socket (WebTransport sobre HTTP/3 QUIC con respaldo WebSocket sobre TLS 1.3) baja de un umbral fijo (p. ej., 32–64 MB en vuelo). El consumo total de RAM de la pestaña permanece acotado por debajo de 256 MB, aunque el archivo mida 1 TB.

Rendimiento real del cifrado a 1 TB: En un equipo moderno, AES-256-GCM vía WebCrypto aprovecha aceleración hardware AES-NI (1–3 GB/s), mientras que XChaCha20-Poly1305 en JavaScript puro ronda 50–150 MB/s por hilo. Repartido entre 6–8 Web Workers, la cascada completa alcanza ~400–900 MB/s (suficiente para saturar enlaces de 1 Gbps e incluso varios Gbps). Si la conexión es de 10 Gbps en CPUs modestas, el modo Carga Pesada puede indicar el ritmo real de CPU en pantalla para que no haya sorpresas.

Realismo de tiempos para el cliente: 1 TB (= 8.000 gigabits) tarda teóricamente ~22,2 horas a 100 Mbps, ~2,2 horas a 1 Gbps y ~13,5 minutos a 10 Gbps.

2) Escritura directa a disco (File System Access API) y compatibilidad honesta

En Chrome, Edge, Brave y Opera de escritorio: El receptor autoriza una vez el archivo de destino con window.showSaveFilePicker(), obtiene un FileSystemWritableFileStream y escribe cada fragmento descifrado y verificado directamente en disco (writable.write({ type: 'write', position: offset, data })), sin crear un Blob gigante en memoria.

Límite real en Firefox y Safari (honestidad obligatoria): A fecha de noviembre de 2026, ni Firefox ni Safari implementan showSaveFilePicker() hacia el sistema de archivos general del usuario (MDN, 2026). Ambos soportan únicamente el Origin Private File System (OPFS, con FileSystemSyncAccessHandle en un Web Worker), pero OPFS está sujeto a cuotas de almacenamiento del navegador y exige una descarga final posterior que falla o duplica espacio a escala de 1 TB. Conclusión práctica: Elixir debe habilitar envíos de hasta 1 TB de forma transparente en navegadores Chromium de escritorio y mostrar un aviso claro en Firefox/Safari limitando el tamaño máximo seguro en esos navegadores al espacio disponible en OPFS.

3) Reanudación tolerante a cortes

En una transferencia de varias horas, la red va a microcortarse.

Cada envío genera un identificador de transferencia y un pequeño archivo auxiliar cifrado en disco (.elixir-resume, junto al .part), o mantiene el estado mientras dure la sesión.

El estado de 65.536 bloques cabe en un mapa de bits de solo 8 KB. Al reconectar (incluso horas después con un nuevo código de sala vinculado a la misma identidad fijada), el receptor envía su mapa de bits de 8 KB; el emisor salta con File.slice() al siguiente bloque faltante y el receptor reposiciona con position: offset. No se repite ni un solo megabyte ya confirmado.

4) Verificación por huella en tiempo real (Árbol de Merkle)

Esperar a recibir 1 TB completo para descubrir un byte corrupto en el gigabyte 12 sería inaceptable.

Doble verificación:

Por bloque al instante: cada bloque de 16 MB lleva su etiqueta AEAD con AAD vinculada a (id_sesión, id_archivo, índice_bloque, total_bloques). Si llega alterado o fuera de sitio, se descarta y se solicita su reenvío de inmediato.

Árbol de Merkle SHA-384 (o BLAKE3): el emisor calcula las hojas (huella de cada bloque de 16 MB) y construye la raíz de Merkle, permitiendo verificar la integridad global incrementalmente y emitir al finalizar el Acta de Entrega firmada bilateralmente con la raíz de Merkle y el SHA-384 lineal calculado en flujo durante la escritura.

5) Cómo conciliar 1 TB con el tráfico constante (CBR): verdad matemática

No se pueden mezclar sin mentir al cliente:

Meter 1 TB dentro del caudal constante de documentos de Cristale/Elixir a 64 KB/s tardaría ~180 días (6 meses).

Mantener una sala vacía emitiendo relleno constante a 1 Gbps para disimular si se envía o no un archivo quemaría ~320 TB al mes por cada sala y colapsaría la red del cliente y nuestros relés.

Solución honesta y limpia — Dos carriles explícitos en la interfaz:

Carril 1 · Modo Sigilo (CBR estricto): Para texto y documentos de hasta ~100 MB. Todo viaja dentro del caudal constante fijo (4 KB/s o 64 KB/s). Nadie en la red distingue cuándo escribes ni si acabas de enviar un contrato.

Carril 2 · Modo Carga Pesada (hasta 1 TB, máxima velocidad): Se activa expresamente al adjuntar archivos grandes con un aviso claro en pantalla: «Envío de alta velocidad: contenido cifrado de extremo a extremo, volumen visible en red». Qué sí protege este modo frente a análisis fino: redondeo del tamaño total a bloques gruesos (p. ej., múltiplos de 1 GB con relleno cifrado final para ocultar el tamaño exacto) y ritmo techo estable durante la emisión.

6) Arquitectura multi-relé (Núremberg, Miami, Finlandia)

Respetando la restricción de no construir una red de dos saltos, tres nodos geográficos aportan soberanía, velocidad y resiliencia:

Función	Cómo opera con Núremberg, Miami y Finlandia
Selección por cercanía y jurisdicción	Al crear la sala, el creador elige manualmente la región (UE Alemania — Núremberg, UE Nórdica — Finlandia o América — Miami) o deja selección automática por menor latencia TLS. Útil para clientes europeos que exigen tránsito estrictamente dentro del Espacio Económico Europeo (RGPD).
Conmutación ante fallo (failover)	En el handshake se acuerda un relé primario y uno secundario. Si Núremberg cae en el minuto 40 de un envío de 1 TB, ambos navegadores saltan automáticamente a Finlandia, reautentican la sala y reanudan desde el mapa de bits de 8 KB sin perder lo transferido.
Paralelismo multi-relé (striping opcional)	En transferencias pesadas donde los clientes tengan enlaces multi-gigabit y un único relé sea el cuello de botella, los fragmentos pares pueden cursarse por Núremberg y los impares por Finlandia (mismo cifrado extremo a extremo, sin doble salto). Además, ningún nodo ve siquiera el 100% del flujo cifrado.
Nota de costes y vía directa P2P opcional	Mover 1 TB por relé consume 1 TB de entrada + 1 TB de salida en el servidor (coste real a reflejar en la tarifa empresarial de Elixir). Como acelerador opcional activable por ambas partes, Elixir puede intentar un canal directo WebRTC DataChannel (cifrado con las mismas claves Elixir) cuando los cortafuegos lo permitan —velocidad máxima sin pasar por relé, avisando de que ambos extremos ven sus IP entre sí— y caer automáticamente a los relés de Núremberg/Miami/Finlandia si el cortafuegos bloquea P2P.
4. Textos ultrabreves para la web de una sola pantalla

Estética: pantalla única negra, hierro y cristal, sobriedad de búnker. Marca en pantalla: Elixir. Restricción estricta: máximo tres líneas por bloque.

Titular de entrada

Elixir.
Chat y documentos cifrados de extremo a extremo en tu navegador, sin cuentas ni servidores con llave.
Entra con un código o crea uno: cuando cierras la pestaña, no queda nada.

Hoja «Cómo te escuchan»

Una llamada o un SMS cruzan las redes de operadoras como una postal abierta, expuestos a redes SS7, antenas falsas y escuchas en los cables.
Los programas espía comerciales atacan el propio dispositivo; muchas aplicaciones pierden su protección al subir copias a la nube.
Elixir blinda el camino en el navegador y no guarda nada, pero ninguna herramienta protege una pantalla ya infectada.

Hoja «Frente a los demás»

Otras plataformas exigen instalar aplicaciones, registrarse con teléfono o ceder las claves de archivo al proveedor o a la nube.
Elixir funciona al instante en el navegador con criptografía híbrida postcuántica, sin cuentas, sin buzón y con detección activa de intrusos.
Para banca, clínicas y despachos añade actas firmadas verificables y archivo opcional cuya llave solo tiene el cliente.

Hoja «Cristale y Elixir»

Cristale protege conversaciones y archivos efímeros entre personas: cifrado híbrido postcuántico, verificación por palabras y borrado total al cerrar.
Elixir lleva el navegador al nivel corporativo: claves renovadas por mensaje, contactos fijados, limpieza de metadatos, tráfico constante, envíos de hasta 1 TB y actas firmadas.
Misma premisa de hierro en ambos: nosotros nunca podemos leer lo que envías.

5. Lista de fuentes oficiales y verificadas

Symphony — Security & Customer-Managed Encryption Keys (CMEK): https://symphony.com/platform/security/ (consultado en marco documental vigente 2025–2026; consorcio fundador anunciado en octubre de 2014).

Bloomberg — Instant Bloomberg (IB) y Bloomberg Vault: https://www.bloomberg.com/professional/products/communication-collaboration/instant-bloomberg/ y https://www.bloomberg.com/professional/products/compliance/vault/

Element / Matrix — Element for Government (Tchap, BwMessenger, TI-Messenger) y especificación Matrix: https://element.io/solutions/government y https://spec.matrix.org/ (Tchap lanzado por DINUM Francia en abril de 2019; BwMessenger anunciado en 2020).

Threema — Threema Work, Cryptography Whitepaper (26 de junio de 2026) y Collaboration with IBM Research (24 de febrero de 2026): https://threema.com/en/work, https://threema.com/assets/documents/threema-cryptography-whitepaper.pdf y https://threema.com/en/blog/quantum-secure-future

IETF / Wire — RFC 9420: The Messaging Layer Security (MLS) Protocol (julio de 2023) y Wire MLS: https://www.rfc-editor.org/info/rfc9420 y https://wire.com/en/messaging-layer-security

Proton AG — Proton Mail Security y Proton Drive Security: https://proton.me/mail/security y https://proton.me/drive/security

SWIFT — ISO 20022 (coexistencia CBPR+ marzo 2023 – noviembre 2025) y Customer Security Programme (CSP): https://www.swift.com/standards/iso-20022 y https://www.swift.com/myswift/customer-security-programme-csp

ISO 20022 — About ISO 20022: https://www.iso20022.org/about-iso-20022

U.S. Department of Justice (DOJ) — North Korean Regime-Backed Programmer Charged With Conspiracy to Conduct Multiple Cyber Attacks and Intrusions (Bangladesh Bank, feb 2016) (6 de septiembre de 2018): https://www.justice.gov/opa/pr/north-korean-regime-backed-programmer-charged-conspiracy-conduct-multiple-cyber-attacks-and

SEC (U.S. Securities and Exchange Commission) — SEC Adopts Amendments to Electronic Recordkeeping Requirements (Rule 17a-4) (12 de octubre de 2022; cumplimiento 3 de mayo de 2023): https://www.sec.gov/news/press-release/2022-187

SEC — SEC Charges 16 Wall Street Firms with Widespread Recordkeeping Failures (Off-Channel Communications) (27 de septiembre de 2022): https://www.sec.gov/news/press-release/2022-174

CFTC (Commodity Futures Trading Commission) — CFTC Unanimously Approves Amendments to Regulation 1.31 (Recordkeeping) (23 de mayo de 2017): https://www.cftc.gov/PressRoom/PressReleases/7565-17

Diario Oficial de la Unión Europea (EUR-Lex) — 

Gemini es una IA y puede cometer errores.
