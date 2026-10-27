# Ronda 65 · ChatGPT («Alta», con web) · profesionales con la máxima seguridad, y aviso de filtraciones

27 Oct 2026, 17:10–17:30 (Bogotá). Chat: el de las rondas 60 y 62–64. Texto completo allí (unos 45.000 caracteres); aquí lo esencial, fiel. Lo que hay que comprobar va marcado.

**Su decisión como dueño:** dos servicios:
- **GUARDIANA PROFESIONAL:** enviar, recibir y organizar documentos confidenciales, con usuarios autorizados, cifrado de extremo a extremo y comprobantes técnicos de acceso.
- **GUARDIANA ALERTAS:** avisar al titular cuando sus correos verificados salen en filtraciones conocidas nuevas, y guiarle paso a paso.

Condición: no anunciar «la máxima seguridad del mundo» ni «más seguro que Signal» sin especificaciones, pruebas y auditorías independientes. La seguridad depende de toda la cadena: identidad, navegador, claves, cifrado, servidores, personal, recuperación y dispositivos.

## A) El mundo hoy

- **Tres propiedades distintas:**
  - confidencialidad futura (*forward secrecy*);
  - recuperación tras un compromiso (*post-compromise security*);
  - resistencia poscuántica.

  Un archivo guardado siete días no hereda las garantías de un ratchet: si alguien consigue su clave mientras está disponible, puede quedarse una copia.
- **Signal:** PQXDH y, desde octubre de 2025, Triple Ratchet (Double Ratchet + SPQR).
  - Copiar: rotación de claves, recuperación y documentación pública.
  - No copiar: su complejidad, para un archivo que se guarda y se recoge una vez.
- **iMessage PQ3:** clásica + poscuántica al empezar y al renovar. Apple documenta Kyber-1024 al inicio, Kyber-768 en las renovaciones y P-256 para autenticar. Tiene análisis independientes (Waterloo, ETH Zúrich).
  - Copiar: diseñar las propiedades antes de programar, análisis formal y verificar la implementación.
- **MLS (RFC 9420):** claves de grupo aunque no estén todos conectados; añadir y retirar miembros.
  - Útil para buzones compartidos por varios profesionales.
  - No inventar un MLS poscuántico propio sin especificación interoperable, biblioteca mantenida y auditoría.
  - El estándar base no hace poscuánticas todas sus suites ni protege todos los metadatos.
- **Los demás:**
  - Wire: MLS, que no lo hace poscuántico.
  - Webex: MLS + SFrame en reuniones Zero Trust.
  - RCS: estándar GSMA con MLS; publicado no es desplegado.
  - WhatsApp: transparencia de claves y QR.
  - Threema: seudónimos, Ibex (PFS clásico), Cure53 2024.
  - Proton (Mail, Drive, Pass).
  - Tresorit: pruebas de penetración externas de 2025.
  - SecureDrop y OnionShare: Tor.
  - AWS Wickr: retención corporativa.
- **Metadatos:** ningún sistema los elimina todos. Para GUARDIANA: minimizarlos, no fingir que no existen.
- **Las evidencias no son equivalentes:** especificación, demostración formal, auditoría de código y certificación organizativa prueban cosas distintas.
- **Conclusión:** combinar
  - la disciplina criptográfica de Signal y Apple;
  - los grupos de MLS;
  - la transparencia de identidad de WhatsApp;
  - la confidencialidad documental de Proton y Tresorit;
  - la sencillez de una herramienta de entrega.

  Nada de anunciar superioridad antes de pruebas independientes.

## B) Diseño de GUARDIANA PROFESIONAL (arquitectura objetivo; nada de esto existe aún)

- **Cuatro piezas separadas:** identidad, custodia de archivos cifrados, autorización de acceso y comprobantes.
- **Algoritmos:**
  - acuerdo de claves: ML-KEM-768 + ECDH P-256 (híbrido);
  - archivos: AES-256-GCM por fragmentos;
  - derivación: HKDF-SHA-256/384;
  - identidad: ECDSA P-256 ahora y ML-DSA-65 como evolución;
  - registros: firma clásica + ML-DSA, cuando esté auditada;
  - SLH-DSA para usos concretos;
  - HQC todavía no: el NIST lo eligió en marzo de 2025 y su norma está en desarrollo.

  Bibliotecas revisadas; nunca programar ML-KEM ni ML-DSA a mano.
- **Protocolo: no inventar un Triple Ratchet nuevo.**
  - Comunicaciones en directo: evolucionar hacia una implementación examinada del Triple Ratchet o equivalente.
  - Buzón asíncrono: una clave aleatoria por archivo, cifrada para los dispositivos autorizados con un mecanismo híbrido; el servidor solo guarda lo cifrado.
  - Revocar a un trabajador impide darle claves nuevas, pero no borra lo que ya descargó.
- **Metadatos:**
  - identificadores aleatorios;
  - nombres de archivo, asuntos y mensajes cifrados;
  - IP fuera de los registros largos;
  - caducidad;
  - relleno opcional.

  No prometer un remitente totalmente oculto.
- **Identidad, en tres niveles:**
  1. Cuenta: passkeys (WebAuthn: huella, cara o PIN).
  2. Dispositivo: claves propias por dispositivo, revocables.
  3. Destinatario: confirmado por QR, código o verificación independiente, con etiquetas honestas («Identidad verificada», «Correo verificado», «Identidad no verificada»).

  WebAuthn PRF como opción, no universal: no todos los autenticadores la soportan. Separar las claves de inicio de sesión de las de descifrado.
- **Transparencia de claves:**
  - directorio verificable, como el AKD de WhatsApp;
  - pruebas de inclusión y de consistencia;
  - alerta ante un cambio inesperado.

  Hace falta verificación independiente: un registro firmado solo por GUARDIANA no basta.
- **El mayor peligro de una web: el JavaScript que se sirve.** Quien controle el servidor o una dependencia podría servir código que robe antes de cifrar. Medidas:
  - aplicación criptográfica separada de ZERO y de scripts externos;
  - CSP estricta y Trusted Types;
  - dependencias bloqueadas;
  - SRI (que no protege el HTML principal);
  - compilaciones reproducibles y manifiestos firmados;
  - historial público de versiones.

  Opción: una aplicación de escritorio verificable para profesionales muy exigentes. Contradice en parte «no instalar nada»; el cliente que solo recibe no instala nada.
- **Servidores confidenciales (AMD SEV-SNP, Intel TDX):** solo si una evaluación de amenazas lo justifica. No son imprescindibles para guardar archivos ya cifrados en el equipo. Cita un aviso de Intel de agosto de 2026 sobre TDX (*comprobar*).
- **Borrado:** borrado criptográfico (destruir la clave de cada entrega) + un procedimiento documentado. Nunca «borrado irrecuperable certificado».
- **Recuperación:**
  - un kit personal guardado fuera de GUARDIANA;
  - recuperación de empresa con varios custodios (Shamir, p. ej. 2 de 3), visible y pactada por contrato.

  Hay que diseñarla antes de cifrar los primeros documentos.
- **«Quién abrió qué»:** tres eventos: acceso autorizado, descarga completada y apertura confirmada por el dispositivo.
  - Registros firmados en un árbol de Merkle con las raíces publicadas (como Trillian), sin datos de clientes.
  - Prueba la integridad de lo registrado, no quién miraba la pantalla.
- **Para un despacho:**
  - accesos individuales;
  - funciones: administrador, profesional, colaborador, receptor externo;
  - buzones de recepción;
  - gestión de dispositivos;
  - retención configurable (hay profesiones que deben conservar documentos);
  - comprobantes.

  Criterio: ningún administrador puede añadirse en secreto como destinatario, ningún cambio de clave pasa inadvertido y las recuperaciones exigen a los custodios reales.

## C) Fácil para un profesional de 60 años

- Sin siglas en pantalla. Pantalla «Mi despacho»: Enviar documento, Pedir documento, Mis documentos, Mi equipo.
- **Enviar, en cuatro decisiones:** ¿A quién?, ¿Qué documento?, ¿Hasta cuándo?, «Enviar documento».
  - Estados reales: «Documento preparado», «Invitación enviada», «Documento recibido».
  - Nunca «Entregado» solo por crear un enlace.
- **El cliente:** recibe en el dominio de GUARDIANA, ve quién se lo pide, sube y pulsa «Entregar mis documentos». No paga ni crea cuenta; en casos muy confidenciales se verifica su correo.
- **Si pierde el móvil:** NÚCLEO le guía (otra passkey, el kit de recuperación o los custodios del despacho). GUARDIANA puede recuperar la cuenta, pero no fabricar las claves de documentos anteriores.

## D) Auditorías

- **Primero, una auditoría externa de lo que ya existe en Comunicaciones:** ML-KEM-768 + ECDH P-256, firmas, código de 9 cifras, relé, archivos y destrucción de sesiones. Pedir propuestas a Cure53, Trail of Bits y NCC Group.
- **Orden:**
  1. auditoría criptográfica;
  2. pentest web y de servidor;
  3. auditoría de la aplicación profesional;
  4. ISO/IEC 27001:2022;
  5. SOC 2 tipo II;
  6. CSPN o BSZ/BSI.
- **Costes:** no encontró tarifa pública oficial («no sé cuánto costaría exactamente»). Pedir tres presupuestos con el mismo alcance cuando la especificación esté estable.
- **No decir:** «Auditado por Cure53», «Certificado ISO 27001», «Cumple SOC 2», «Certificado por NIST», «Cifrado irrompible», «Superior a Signal, Apple y Proton».

## E) Aviso de filtraciones: GUARDIANA ALERTAS

- **Fuentes:**
  - Have I Been Pwned, para correos: API comercial, vigilancia de dominios y consultas por prefijo de hash en los planes compatibles.
  - SpyCloud, para teléfonos: sin contrato ni precio verificado.
- **HIBP** (*comprobar todo*):
  - Condiciones: dice que las actualizó el 27 de octubre de 2026. Permiten ciertas integraciones comerciales, con límites a la reventa, a los dominios ajenos y a los servicios equivalentes a su buscador.
  - Precios que cita, con facturación anual:
    - gratuito;
    - Core, desde 4,39 US$/mes;
    - Pro, desde 379 US$/mes (k-anonimidad y dominios de clientes autorizados);
    - Enterprise, bajo presupuesto.
  - En esta sesión se vio «desde 3,50 US$/mes».
- **Consulta por k-anonimidad:** SHA-1 del correo, se envían solo los 6 primeros caracteres hex y se compara en local. Solo en planes concretos; no es anonimato total.
- **Comprobación puntual ≠ vigilancia continua:**
  - Comprobación puntual: no se guarda el correo.
  - Vigilancia: hay que guardar el correo, protegido.

  Nunca decir «no almacenamos tu correo» si se vigila.
- **Teléfonos:** HIBP no tiene una búsqueda por teléfono documentada, y el hash de un teléfono no lo protege (se puede enumerar). Empezar solo con correos.
- **El aviso:** «Hemos encontrado una nueva exposición asociada a tu correo», con qué hacer:
  - entrar a mano en la web oficial;
  - cambiar la contraseña si se reutilizaba;
  - activar un segundo factor o una passkey;
  - revisar los accesos.

  Sin contraseñas en el mensaje ni enlaces que las pidan. La fecha de la filtración no es la fecha en que se publicó, y no aparecer no significa estar a salvo.
- **Ley 1581 (autorización previa, finalidad) y RGPD:**
  - cada adulto autoriza su propio correo;
  - el titular de un plan familiar no ve los resultados de los demás;
  - empresas: acreditar el dominio e informar a cada trabajador;
  - nada de vigilar en secreto los correos de los empleados.

## F) Veredicto

1. **ALERTAS por correo, primero:** prototipo interno en 2–4 semanas, si hay licencia.
2. **ENTREGA PROFESIONAL, piloto** con Comunicaciones (4–8 semanas), sin expedientes médicos reales.
3. **Buzón profesional multiusuario** (varios meses), con auditoría antes de aceptar documentos reales.

- **Costes:**
  - conocidos: HIBP (arriba) y Cloudflare R2 (0,015 US$/GB-mes);
  - desconocidos: desarrollo, auditoría, ISO/SOC 2 y hardware confidencial.
- **Lo diferente a nivel mundial:** que también sean verificables las actuaciones del propio proveedor (cambios de claves, versiones del software, recuperaciones, comprobantes) sin exponer los documentos, y que una persona sin conocimientos lo use bien. Solo se podrá afirmar después de implementarlo y auditarlo.
- **Seis decisiones del dueño:**
  1. aprobar ALERTAS y PROFESIONAL;
  2. alertas primero;
  3. sin teléfonos todavía;
  4. mantener el híbrido y añadir identidad verificable, recuperación y auditoría antes de más criptografía;
  5. web sencilla por defecto y cliente verificable opcional;
  6. suscripción personal y plan profesional multiusuario, con el precio según los costes.
- **Frase:** «GUARDIANA te avisa cuando tus datos aparecen en filtraciones conocidas y te ayuda a compartir documentos confidenciales con las personas adecuadas. Sin complicaciones y con controles de seguridad que podemos explicar y comprobar.»
