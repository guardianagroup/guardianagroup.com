# Ronda 95 · Gemini · estrategia (fraude, Symphony/Bloomberg, SWIFT, piloto) · 19 nov 2026

MEMORANDO ESTRATÉGICO · RONDA 95 (SEGUNDA AMPLIACIÓN)Cliente: Guardiana Group S.A.S. · Producto: Elixir · Fecha: 19 de noviembre de 2026

0. Prioridad inmediata: mapa de dónde se roba más dinero hoy por suplantación y engaño

Los ataques que más dinero mueven hoy en el mundo no rompen cifrados ni vulneran la red SWIFT: suplantan a personas reales para que la propia víctima autorice el pago. Ahí es exactamente donde Elixir puede generar retorno medible desde el primer mes, sin esperar licencias bancarias ni integraciones plurianuales.

Mapa del fraude con cifras oficiales
Modalidad de robo	Cifras oficiales y fuente	Quién lo sufre más	Qué corta Elixir (y qué NO corta)	Primer producto concreto a vender
Fraude del falso directivo y cambio de cuenta en facturas (BEC / EAC)	2.770 M$ en 21.442 denuncias en EE. UU. solo en 2024 (FBI IC3, 23 abr 2025; 2.900 M$ en 2023, informe mar 2024). 55.000 M$ en pérdidas expuestas globales entre oct 2013 y dic 2023 (FBI IC3 PSA, 11 sep 2024). Principal amenaza financiera corporativa en Europa (Europol IOCTA, jul 2024).	Empresas medianas y grandes, despachos de abogados, inmobiliarias y notarías (cierres de compraventa), constructoras y proveedores industriales.	Corta la falsificación de correos, facturas alteradas y suplantación de remitentes si todo alta o cambio de IBAN se confirma exclusivamente en Elixir mediante claves fijadas y acta firmada. No corta si un empleado se salta el protocolo y paga por correo.	Elixir Verificación de Pagos y Cierres (canal de doble validación para cambios de IBAN, facturas críticas y compraventas).
Suplantación con voz o vídeo clonados (deepfake)	Caso Arup (Hong Kong, feb 2024): 25,6 M$ (200 M HK$) sustraídos en 15 transferencias tras una videollamada con el director financiero y varios colegas clonados por IA (Policía de Hong Kong, feb 2024; confirmación de Arup, may 2024). Alerta oficial sobre clonación de voz en segundos (FTC, mar y nov 2023; FBI PSA, jun 2023).	Direcciones financieras (CFO/tesorería), banca privada, despachos con firmas internacionales y familias patrimoniales.	Corta la confianza ciega en la voz o la imagen: la identidad no depende de «cómo suena» el directivo, sino de su clave criptográfica fijada (y llave hardware WebAuthn opcional) + verificación en segundo canal. No corta si la orden se autoriza fuera de Elixir.	Protocolo de Autorización de Tesorería (instrucción escrita y firmada en Elixir obligatoria para órdenes superiores a un umbral, nunca por llamada).
Fraude de transferencia autorizada (APP)	450,7 M£ perdidos en Reino Unido en 2024 (UK Finance, may 2025; 459,7 M£ en 2023, informe may 2024). En el EEE, el fraude en pagos sumó 4.300 M€ en 2022, impulsado en transferencias por la manipulación del pagador (EBA/BCE, ago 2024). Desde el 7 oct 2024, el regulador británico PSR obliga a los bancos a reembolsar hasta 85.000 £ por caso (50/50 entre banco emisor y receptor).	Particulares, pymes y —tras la norma PSR de oct 2024— directamente el balance de los bancos en Reino Unido (y bajo mayor escrutinio en la UE con PSD3 en tramitación).	Corta la suplantación del propio banco, gestor de banca privada o abogado frente al cliente mediante sala con identidad institucional fijada. No corta estafas puras de inversión o romance donde el cliente confía voluntariamente en un desconocido externo.	Canal Oficial Gestor–Cliente para banca privada y despachos (sustituye llamadas y WhatsApp al confirmar transferencias elevadas).
Duplicado de SIM (SIM swapping)	48,8 M$ en 1.075 denuncias en EE. UU. en 2023 (FBI IC3, mar 2024; 72,6 M$ en 2022). Llevó a la FCC a aprobar reglas federales obligatorias contra el SIM swapping (15 nov 2023).	Directivos, tenedores de criptoactivos, clientes de banca privada y responsables de cuentas corporativas protegidas por SMS.	Corta la dependencia del número de teléfono y del SMS: Elixir no usa teléfono ni códigos SMS; la verificación opera sobre claves fijadas y segundo factor no telefónico. No corta el robo de credenciales de terceros bancos que sigan usando SMS.	Integrado en el mismo Canal Oficial Gestor–Cliente (eliminación del SMS como vía de confirmación documental).
Robo y toma de control de cuentas (ATO / suplantación general)	En 2024, la FTC registró 12.500 M$ en pérdidas declaradas en EE. UU., con 2.950 M$ solo en estafas de suplantación (FTC Consumer Sentinel, feb 2025). En Europa, el robo de credenciales y phishing sigue siendo la puerta de entrada al ATO bancario (Europol IOCTA, jul 2024).	Bancos minoristas, clínicas (robo de datos y cobros), despachos y clientes particulares.	Corta la suplantación dentro del canal Elixir (sin contraseñas reutilizables en servidor ni sesiones robables por phishing de credenciales clásicas). No corta el malware en el equipo del usuario ni el phishing sobre portales bancarios ajenos.	Incluido como beneficio operativo del canal verificado con llave hardware WebAuthn.
Decisión estratégica de entrada (qué vender primero)

El primer producto comercial no debe venderse como «el sustituto de Bloomberg ni de SWIFT», sino como «Elixir Cierres y Tesorería: el canal verificado contra el fraude de facturas, cambios de IBAN y suplantación de directivos».

Por qué primero ahí: Hay dolor financiero inmediato y medible (un solo fraude BEC medio en EE. UU. supera los 129.000 $ según el cociente de IC3 2024: 2.770 M$ / 21.442 casos), deciden socios de despacho, directores financieros y aseguradoras de ciberriesgo en semanas —no en 24 meses de comité bancario—, y usa exactamente lo que Elixir ya sabe hacer hoy mejor que nadie: entrar sin instalar nada, fijar identidades, limpiar documentos y emitir un acta firmada.

1. Symphony y Bloomberg: por qué los usan hoy y qué exige un banco para aprobar Elixir
Por qué los operadores y banqueros no abandonan hoy Bloomberg IB ni Symphony

Quien quiera desplazarlos debe entender que no son simples chats:

Datos de mercado y ejecución (Bloomberg): El Terminal Bloomberg (~350.000 suscriptores) integra datos en tiempo real, analítica, noticias, enrutamiento de órdenes (EMSX/TOMS) y chat (Instant Bloomberg, IB) en una sola pantalla. Un operador no paga ~27.000–32.000 $/año por el chat; usa el chat porque está pegado a las cotizaciones y al envío de órdenes. Elixir no va a sustituir al Terminal Bloomberg.

Comunidad y efecto red verificado: En Symphony (~600.000 usuarios del sector financiero) e IB, un banquero busca un nombre en el directorio global y sabe al instante en qué entidad trabaja esa persona verificada.

Cumplimiento y archivo regulatorio nativo: Las multas de la SEC y la CFTC por comunicaciones fuera de canales archivados (off-channel) han superado los 3.000 M$ acumulados entre diciembre de 2021 y 2025 (solo el 27 sep 2022 la SEC impuso 1.100 M$ a 16 firmas; el 14 ago 2024 sumó otros 392,75 M$ a 26 firmas). Un director de cumplimiento no puede aprobar un chat efímero para personal regulado si no entra automáticamente en el archivo legal del banco.

Identidad corporativa e integraciones: Acceso único corporativo (SSO), baja automática cuando un empleado deja el banco (SCIM), puentes registrados con WhatsApp/SMS (Symphony Connect) y bots de cotización (RFQ).

Hoja de ruta realista para que un banco apruebe Elixir como canal autorizado

Nota de rigor de costes: cifras orientativas de ingeniería + evaluaciones externas para una estructura pequeña y disciplinada en Europa/Colombia (2026–2027), sin incluir salarios comerciales ni infraestructura masiva.

Requisito bancario	Prioridad	Orden	Qué implica en Elixir (respetando cero visibilidad nuestra)	Coste externo + ingeniería aprox.
1. Archivo Custodiado con claves del cliente (CMEK)	Imprescindible	Fase 1	Cifrado local en navegador bajo clave pública del banco (ML-KEM-1024 + P-384) y entrega directa a repositorio WORM del banco (S3 Object Lock / Azure Immutable) sin que Guardiana tenga la clave.	30.000 – 50.000 € (ingeniería)
2. Exportación a archivadores (Smarsh, Global Relay, Proofpoint)	Imprescindible	Fase 1	Un conector desplegado por el cliente en su propia red que descifra el paquete .elixir-vault con la llave del banco y lo inyecta en formato estándar (EML/JSON/API) en Smarsh o Global Relay para vigilancia de cumplimiento.	25.000 – 45.000 €
3. Retención y conservación por orden legal (Legal Hold)	Imprescindible	Fase 1	Políticas obligatorias fijadas por el administrador del banco (impedir crear salas sin Archivo Custodiado para usuarios regulados); el bloqueo WORM y Legal Hold residen en el archivador del banco.	Incluido en Fase 1–2
4. Identidad corporativa (SSO SAML 2.0 / OIDC + SCIM)	Imprescindible	Fase 2	Autenticación de empleados del banco vía Microsoft Entra ID / Okta; los externos siguen entrando sin cuenta con código + verificación. Baja instantánea de empleados despedidos.	25.000 – 40.000 €
5. Consola de administración y registros de trazabilidad (SIEM)	Imprescindible	Fase 2	Gestión de políticas (caducidad, bloqueo de descargas, modo archivo obligatorio) y exportación de eventos de control (quién abrió sala, qué política aplicó, alertas rojas) en formato JSON/CEF hacia Splunk o Sentinel, sin exponer contenido.	30.000 – 50.000 €
6. Residencia de datos en tránsito	Imprescindible	Fase 2	Fijación contractual y técnica de relé exclusivamente UE (Núremberg / Finlandia) o EE. UU. (Miami), con bloqueo duro de desvío fuera de jurisdicción.	10.000 – 20.000 €
7. Evaluaciones externas independientes	Imprescindible	Fase 2–3	a) Revisión criptográfica independiente del protocolo Elixir y de @noble/post-quantum (40.000–80.000 €); b) Pruebas de intrusión externas (pentest web/relé, 15.000–25.000 €/año); c) Informe SOC 2 Tipo II (40.000–70.000 € primer año incluyendo herramienta y firma examinadora); d) Acreditación independiente ISO/IEC 27001 (35.000–60.000 €).	130.000 – 235.000 € (primer ciclo)
8. Integraciones de flujo (bots RFQ, OMS, CRM, directorios federados)	Deseable	Fase 3+	APIs cliente-a-cliente, enlace con CRM de banca privada o gestores documentales (iManage/NetDocuments en despachos).	60.000 – 150.000 €+
9. Datos de mercado o terminal financiero	Fuera de alcance	Nunca	Requeriría licencias de bolsas mundiales y décadas de producto; no es nuestro negocio.	No aplicable
Dónde Elixir es claramente superior hoy y dónde NO
Ámbito	Dónde Elixir gana hoy	Dónde Symphony / Bloomberg ganan hoy
Relación con terceros externos sin suscripción	Victoria clara de Elixir: un cliente de banca privada, un despacho externo o una contraparte en una compra de empresa entra en 10 segundos en el navegador, sin licencias ni instalación.	En Bloomberg IB exige Terminal; en Symphony exige alta en red o puentes con WhatsApp (que heredan metadatos y dependencias de Meta).
Criptografía y privacidad frente al proveedor	Victoria clara de Elixir: postcuántico híbrido + trinquete por mensaje + SLH-DSA + tráfico constante + sin buzón en servidor.	Sin PQC generalizado publicado; Bloomberg descifra por diseño; Symphony retiene metadatos sociales y de directorio.
Prueba documental e higiene de archivos	Victoria clara de Elixir: limpieza local de metadatos, envíos de hasta 1 TB (Chromium) y actas bilaterales verificables sin servidor.	Diseñados para texto corto y adjuntos limitados, no para salas documentales de gran tamaño ni actas criptográficas independientes.
Mesa de mercados, liquidez y cumplimiento llave en mano	No competimos hoy.	Victoria clara de Bloomberg y Symphony: datos de mercado, directorio global de 350k–600k profesionales e integración probada con Smarsh/Global Relay.

Conclusión operativa de esta sección: No vendáis «quítate Bloomberg o Symphony». Vended «el canal autorizado para hablar e intercambiar documentos con el 99% del mundo que NO tiene Bloomberg ni Symphony, sin caer en multas de correo/WhatsApp».

2. SWIFT e ISO 20022: qué es realista, qué NO lo es y cuál es nuestro hueco real
Qué haría falta de verdad para mover órdenes de pago fuera de SWIFT

Mover pagos interbancarios fuera de SWIFT no es un problema de cifrado web; es un problema de derecho bancario, liquidez de bancos centrales y vigilancia sistémica:

Vigilancia de bancos centrales: Aunque SWIFT es una cooperativa privada en Bélgica, su carácter sistémico la somete a la vigilancia cooperativa liderada por el Banco Nacional de Bélgica (NBB) junto con los bancos centrales del G10 (SWIFT Oversight Forum, creado en 1998 y ampliado en 2012).

Membresía bancaria y gobierno cooperativo: Conecta a más de 11.500 instituciones en más de 200 países y territorios, cada una sujeta a licencia bancaria, debida diligencia reforzada (KYC/KYB) y evaluación anual del Customer Security Programme (CSP).

Firmeza de la liquidación (Settlement Finality): SWIFT no mueve dinero; transmite mensajes que se liquidan en los sistemas RTGS de los bancos centrales (T2 / TARGET del Eurosistema, Fedwire de la Reserva Federal, CHAPS del Banco de Inglaterra) o en cuentas corresponsales (nostro/vostro) amparadas por la Directiva 98/26/CE de firmeza de la liquidación.

Control de sanciones y prevención de blanqueo (AML/CFT): Filtrado obligatorio frente a listas OFAC, Unión Europea, ONU y Reino Unido, más cumplimiento estricto de la Recomendación 16 del GAFI (Travel Rule).

Directorio BIC (ISO 9362) y gestión ISO 20022: SWIFT es la Autoridad de Registro designada por ISO para los códigos BIC y el registro oficial de mensajería ISO 20022.

Qué NO es realista para Guardiana / Elixir (decisión tajante):

NO es realista construir una red interbancaria alternativa a SWIFT, sustituir el enrutamiento BIC, operar liquidación de fondos ni actuar como entidad de pagos. Intentarlo consumiría decenas de millones en licencias y capital regulatorio, nos metería bajo supervisión de bancos centrales (PSD2/MiCA/FinCEN) y nos apartaría de nuestra ventaja: software criptográfico ligero sin custodia de dinero ni de datos.

El hueco real (donde sí podemos ganar y cobrar)

Las pérdidas millonarias no ocurren dentro del cableado de SWIFT; ocurren en la última milla antes de que la orden entre al banco (donde las empresas mandan instrucciones por correo, PDF o teléfono) y en la continuidad operativa cuando cae la infraestructura primaria. Ahí hay tres productos concretos y 100% legales sin licencia bancaria:

Canal verificado de instrucciones de pago y datos bancarios (anti-BEC / anti-cambio de IBAN):

El problema: Aunque la UE implantó la Verificación del Beneficiario (VoP) obligatoria para transferencias en euros desde el 9 de octubre de 2025 (Reglamento UE 2024/886 de Pagos Inmediatos, adoptado el 13 mar 2024), el VoP solo comprueba si un nombre coincide con un IBAN; no sirve para transferencias internacionales fuera de la zona euro (USD/GBP/CHF) ni impide que un estafador cree una sociedad pantalla con nombre parecido o suplante a un directivo que ordena pagar a un proveedor real pero fraudulento.

Qué hace Elixir: Antes de ejecutar cualquier alta de proveedor, cambio de cuenta o transferencia superior a un umbral, las dos partes validan la instrucción dentro de Elixir usando claves fijadas y descargan un Acta de Instrucción Bancaria firmada bilateralmente (ECDSA + ML-DSA-87 + SLH-DSA), lista para adjuntar al expediente de tesorería.

Transporte y firma de extremo a extremo de archivos ISO 20022 (Corporate-to-Bank):

El problema: ISO 20022 es un estándar XML abierto (pain.001 para iniciación de pagos, pain.002 para estado, camt.053 para extractos). Muchas empresas medianas y despachos siguen enviando lotes de pagos o instrucciones a sus bancos por portales frágiles, correo o SFTP mal protegido.

Qué hace Elixir: Transporta los XML ISO 20022 dentro del canal cifrado de Elixir, valida en local en el navegador la estructura del esquema XML (sin que nuestro servidor lea el XML), añade firma criptográfica de extremo a extremo del apoderado con clave fijada y emite acuse bilateral antes de que el banco inyecte el lote en su sistema de liquidación (SEPA, Fedwire o SWIFT). Elixir no liquida ni enruta pagos: solo blinda y da prueba de integridad al sobre digital entre la empresa y su banco.

Canal de respaldo fuera de banda entre tesorerías (Out-of-Band Treasury Continuity):

El problema: Cuando una empresa o un banco sufre un ataque de ransomware o compromiso del correo corporativo (Microsoft 365 / Exchange), las tesorerías se quedan ciegas para confirmar llamadas de margen, líneas de crédito o transferencias de emergencia con sus bancos corresponsales.

Qué hace Elixir: Un búnker de contingencia independiente del correo y de la red interna —con las claves públicas de los tesoreros fijadas de antemano en una bóveda portátil o llave hardware— que permite abrir sala en segundos desde cualquier navegador limpio para autenticar instrucciones críticas de liquidez. (Alineado con los requisitos de resiliencia operativa TIC del Reglamento europeo DORA, Reglamento UE 2022/2554, aplicable desde el 17 de enero de 2025).

3. Producto mínimo para entrar en la primera entidad (piloto) y argumento de venta
Piloto mínimo viable (6 a 8 semanas · objetivo: primer despacho mercantil/inmobiliario, tesorería corporativa o unidad de banca privada)

No intentéis entrar el día 1 por el comité global de un banco sistémico (tardará 18 meses y exigirá SOC 2 Tipo II + Smarsh antes de probar nada). Entrad primero por un despacho de abogados de M&A / inmobiliario o la tesorería de una empresa mediana, o por un piloto de innovación en una unidad de banca privada donde no haya obligación SEC/MiFID sobre tráfico de mesa, usando ese caso de éxito real para financiar las evaluaciones externas de la Fase 2.

Alcance exacto del MVP de piloto (solo lo construible y verificable hoy):

Sala Elixir completa en navegador (trinquete por mensaje + PQ periódico, firmas triples ECDSA + ML-DSA-87 + SLH-DSA, cascada AES-256-GCM + XChaCha20-Poly1305, tráfico constante en modo sigilo, alertas rojas de intrusión).

Libreta portátil cifrada con claves fijadas (bloqueo duro sin «aceptar igualmente») + invitación en dos canales (código + PIN corto vía CPace).

Módulo de Instrucción Bancaria / Documentos: plantilla estructurada de cambio de IBAN / cierre + limpiador local de metadatos + Acta de Entrega firmada bilateralmente + verificador público sin conexión.

Archivo Custodiado básico en local (clave pública del cliente en el navegador → paquete .elixir-vault descargable al servidor interno o repositorio WORM del cliente).

Fuera del piloto (dejado por escrito para Fase 2): SSO/SCIM, conectores Smarsh/Global Relay, envíos de 1 TB (en piloto tope práctico 5–10 GB) y evaluaciones SOC 2 / ISO 27001.

Métricas de éxito pactadas con el cliente piloto:

100% de los cambios de cuenta bancaria y envíos de documentación confidencial del equipo piloto realizados en Elixir durante 6 semanas.

Tiempo medio de incorporación de un cliente externo sin cuenta: menos de 90 segundos.

Cero incidentes de verificación fallida sin detección y 100% de actas verificables sin conexión por el equipo legal del cliente.

Argumento de venta en tres frases

El fraude de facturas y la suplantación de directivos ya roban miles de millones al año porque las empresas siguen enviando datos bancarios y contratos por correo, teléfono y aplicaciones que cualquiera puede falsificar.
Elixir abre en segundos una sala cifrada en el navegador —sin instalar nada ni crear cuentas para sus clientes— donde las identidades quedan fijadas criptográficamente, los documentos se limpian de metadatos y cada instrucción genera un acta firmada verificable sin servidores intermedios.
Ni nosotros podemos leer sus archivos ni sus claves salen de su control; si su entidad necesita conservar copias por ley, se cifran en su navegador exclusivamente con la llave de su departamento de cumplimiento.

4. Riesgos legales y de reputación — y frases que no debemos decir

Vender a banca, despachos y clínicas implica tratar con departamentos jurídicos que revisarán cada palabra de la web antes de firmar un contrato. Una exageración comercial aquí no solo rompe una venta: abre responsabilidad civil, sanciones por publicidad engañosa y posibles requerimientos de supervisores financieros.

Cinco riesgos críticos

Ser reclasificados como proveedor de servicios de pago: Si la web sugiere que Elixir «mueve dinero», «ejecuta pagos» o «sustituye a SWIFT», supervisores como el Banco de España, la EBA o FinCEN pueden investigar prestación de servicios de pago sin licencia (PSD2 / normativa de transmisores de dinero). Regla: Elixir transmite únicamente mensajes y documentos cifrados; jamás toca fondos ni inicia liquidaciones.

Responsabilidad por promesas de «prevención total del fraude»: Si prometemos «nadie puede robar nada» y un empleado sufre malware en su PC o paga fuera del canal, el cliente o su aseguradora pueden reclamar por incumplimiento o representación engañosa.

Prometer cumplimiento regulatorio (SEC 17a-4, MiFID II, HIPAA, DORA) por sí solo: Ninguna herramienta web hace cumplir una ley automáticamente; el cumplimiento depende del gobierno interno, del repositorio WORM y de la custodia de claves del propio cliente.

Exponer vulnerabilidades de código sin revisión externa previa: Hoy @noble/post-quantum 0.7.1 y el protocolo propio no cuentan con revisión criptográfica independiente ni informe SOC 2 Tipo II. Ocultarlo o disfrazarlo ante un CISO bancario destruye la credibilidad de golpe cuando pidan el informe en la primera reunión de seguridad.

Reputación frente al modelo de confianza web: Si un investigador de seguridad pública muestra que un servidor comprometido de house1718.com podría servir código modificado y nosotros no lo habíamos explicado con transparencia, el golpe reputacional sería irreversible.

Tabla de frases prohibidas vs. redacción rigurosa
Frase que NO debemos decir jamás	Por qué es peligrosa	Cómo decirlo con precisión y elegancia
«Nadie puede robar nada en Elixir» / «100% inhackeable»	Promesa absoluta falsa ante malware en el equipo o engaño fuera de canal; riesgo legal directo.	«Elixir protege el tránsito y fija las identidades en el navegador; si el equipo está limpio y se verifica la clave, bloquea la interceptación en red y la suplantación de canal.»
«Sustituimos a SWIFT para mover dinero más seguro»	Falso técnicamente y peligroso regulatoriamente (aparenta servicio de pagos no autorizado).	«Elixir no liquida pagos ni sustituye a SWIFT: blinda el intercambio previo de instrucciones bancarias y archivos ISO 20022 entre empresas, despachos y bancos.»
«Cumplimos SEC 17a-4, MiFID II, HIPAA y DORA»	Solo la entidad regulada puede cumplir esas normas; nosotros somos un componente técnico.	«Elixir ofrece Archivo Custodiado con claves exclusivas del cliente y actas verificables diseñados para integrarse en los programas de conservación y resiliencia de cada entidad.»
«Criptografía auditada / certificada / conformidad CNSA 2.0»	Prohibido por nuestra propia regla de veracidad y falso mientras no existan informes externos publicados.	«Implementación abierta basada en estándares NIST FIPS 203, 204 y 205; nuestra librería cliente está en proceso hacia revisión criptográfica independiente.»
«Comunicación completamente anónima»	Falso sin red de múltiples saltos: el proveedor de internet y el relé ven direcciones IP y horarios.	«Sin cuentas, sin teléfono y sin buzón en servidor; el relé únicamente observa la conexión cifrada en tránsito.»
«Acabamos con el fraude del CEO y los deepfakes»	Un solo empleado que obedezca una llamada fuera de Elixir invalida la afirmación.	«Reduce de raíz la suplantación cuando la organización exige que toda orden bancaria crítica se confirme únicamente mediante clave fijada en Elixir.»
5. Lista de fuentes oficiales y verificadas

FBI — Internet Crime Complaint Center (IC3) — 2024 Internet Crime Report (23 de abril de 2025): https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf

FBI — Internet Crime Complaint Center (IC3) — 2023 Internet Crime Report (marzo de 2024): https://www.ic3.gov/Media/PDF/AnnualReport/2023_IC3Report.pdf

FBI — IC3 Public Service Announcement — Business Email Compromise: The $55 Billion Scam (11 de septiembre de 2024): https://www.ic3.gov/PSA/2024/PSA240911

FBI — IC3 Public Service Announcement — Malicious Actors Manipulating Photos and Videos to Create Explicit Content and Sextortion Schemes / Deepfake warnings (5 de junio de 2023): https://www.ic3.gov/Media/Y2023/PSA230605

Europol — Internet Organised Crime Threat Assessment (IOCTA) 2024 (julio de 2024): https://www.europol.europa.eu/publications-events/main-reports/internet-organised-crime-threat-assessment-iocta-2024

Hong Kong Police Force / Arup (confirmación pública recogida por CNN y Financial Times) — Caso de fraude por videollamada deepfake de 200 M HK$(~25,6 M$) (febrero y mayo de 2024): https://edition.cnn.com/2024/02/04/asia/deepfake-cfo-scam-hong-kong-intl-hnk/index.html y https://www.arup.com/news/

UK Finance — Annual Fraud Report 2025 (datos 2024) (mayo de 2025) y Annual Fraud Report 2024 (datos 2023) (mayo de 2024): https://www.ukfinance.org.uk/policy-and-guidance/reports-and-publications/annual-fraud-report-2025 y https://www.ukfinance.org.uk/policy-and-guidance/reports-and-publications/annual-fraud-report-2024

Payment Systems Regulator (PSR, Reino Unido) — Fighting Authorised Push Payment (APP) Scams — Mandatory Reimbursement Policy (vigente desde 7 de octubre de 2024): https://www.psr.org.uk/our-work/app-scams/

European Banking Authority (EBA) & Banco Central Europeo (BCE) — 2024 Report on Payment Fraud (1 de agosto de 2024): https://www.eba.europa.eu/publications-and-media/press-releases/eba-and-ecb-publish-joint-report-payment-fraud

Diario Oficial de la Unión Europea (EUR-Lex) — Reglamento (UE) 2024/886 sobre transferencias inmediatas en euros (Verificación del Beneficiario / VoP aplicable desde 9 oct 2025) (13 de marzo de 2024): https://eur-lex.europa.eu/eli/reg/2024/886/oj

FTC (Federal Trade Commission) — Consumer Sentinel Network Data Book 2024 (febrero de 2025): https://www.ftc.gov/reports/consumer-sentinel-network-data-book-2024

FTC — Scammers use AI to enhance their family emergency schemes (20 de marzo de 2023) y Voice Cloning Challenge (16 de noviembre de 2023): https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes y https://consumer.ftc.gov/consumer-alerts/2023/11/announcing-ftcs-voice-cloning-challenge

FCC — SIM Swapping and Port-Out Fraud Rules (15 de noviembre de 2023): https://www.fcc.gov/consumer-governmental-affairs/fcc-announces-effective-compliance-date-sim-swapping-item

SEC (U.S. Securities and Exchange Commission) — SEC Charges 16 Wall Street Firms with Widespread Recordkeeping Failures (27 de septiembre de 2022) y Twenty-Six Firms to Pay More Than $390 Million Combined to Settle SEC's Charges for Widespread Recordkeeping Failures (14 de agosto de 2024): https://www.sec.gov/news/press-release/2022-174 y https://www.sec.gov/newsroom/press-releases/2024-98

SEC — Rule 17a-4 Electronic Recordkeeping Amendments (12 de octubre de 2022): https://www.sec.gov/news/press-release/2022-187

EUR-Lex — Reglamento (UE) 2022/2554 sobre la resiliencia operativa digital del sector financiero (DORA, aplicable desde 17 de enero de 2025) (14 de diciembre de 2022): https://eur-lex.europa.eu/eli/reg/2022/2554/oj

EUR-Lex — Directiva 98/26/CE sobre la firmeza de la liquidación en los sistemas de pagos y de liquidación de valores (19 de mayo de 1998): https://eur-lex.europa.eu/eli/dir/1998/26/oj

National Bank of Belgium (NBB) — Oversight of SWIFT (Cooperative Oversight / SWIFT Oversight Forum): https://www.nbb.be/en/financial-oversight/oversight/swift

SWIFT — About Us, BIC (ISO 9362), ISO 20022 y Customer Security Programme (CSP): https://www.swift.com/about-us, https://www.swift.com/standards/iso-20022 y https://www.swift.com/myswift/customer-security-programme-csp

FATF / GAFI — Recommendation 16 (Wire Transfers / Travel Rule): https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html

Symphony — Platform Security (CMEK) & Compliance Partners (Smarsh, Global Relay): https://symphony.com/platform/security/ y https://symphony.com/platform/compliance/

Bloomberg — Instant Bloomberg (IB) y Bloomberg Vault: https://www.bloomberg.com/professional/products/communication-collaboration/instant-bloomberg/ y https://www.bloomberg.com/professional/products/compliance/vault/

AICPA & ISO — SOC 2 Trust Services Criteria e ISO/IEC 27001:2022: https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2 y https://www.iso.org/standard/27001

Gemini es una IA y puede cometer errores.
