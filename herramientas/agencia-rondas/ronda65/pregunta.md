Ronda 65 · GUARDIANA · El plan para profesionales con la máxima seguridad que exista hoy, y el aviso de filtraciones (27 Oct 2026). Máximo razonamiento.

Eres parte de la agencia de GUARDIANA. Responde en español, concreto, en bloques cortos y numerados. No inventes cifras ni funciones: fuente oficial (especificación, artículo, auditoría, ley) o «no lo sé». Nada de promesas absolutas.

**El dueño (17:05–17:06)** eligió dos ideas para cobrar:
- **Aviso de filtraciones:** te avisamos si tu correo o tu teléfono aparecen en un robo de datos, con los pasos a seguir.
- **Plan para profesionales:** abogados, médicos, contadores… envían y reciben documentos con su nombre, varios usuarios y registro de quién abrió qué (ENTREGA + buzón de recepción).

Dijo: «Fáciles de entender y de usar.» Y del plan para profesionales: «El nivel de encriptación y de seguridad debe ser mayor. Debéis utilizar la máxima tecnología existente, basaos en modelos. Pregunta a la agencia por los sistemas que circulan hoy en día e intentad mejorarlos, incluso a nivel mundial.»

**Lo que hay hoy en Comunicaciones (para mejorarlo):**
- Funciona en el navegador (web), de equipo a equipo.
- Intercambio de claves híbrido ML-KEM-768 + ECDH P-256 (postcuántico) y firmas de identidad clásicas (ECDSA P-256), con número de seguridad para comprobar.
- Invitación con un código de 9 cifras de un solo uso que caduca a los 10 minutos.
- Relé propio: ve la IP, la sala y el volumen, no el contenido.
- La conversación se borra al terminar.
- Sin auditoría independiente y sin llamadas.

**ENTREGA (propuesta):** el archivo se encripta en el navegador, se guarda cifrado en nuestro servidor hasta que se abre (7 días como máximo), se comparte con enlace + código y deja un comprobante técnico.

LO QUE TE PIDO:

A) **El mundo hoy.** Compara, con fuente oficial, los sistemas de referencia:
- Signal (PQXDH y el triple ratchet con SPQR);
- iMessage PQ3;
- MLS (RFC 9420) y quién lo usa (Wire, Webex, RCS…);
- WhatsApp (transparencia de claves);
- Threema, Proton (Mail, Drive, Pass), Tresorit, SecureDrop/OnionShare, Wickr;
- los que conozcas para que profesionales envíen documentos.

Para cada uno: qué protege mejor, qué metadatos deja ver, si es postcuántico (con qué algoritmos), cómo verifica identidades, qué auditorías tiene y cuál es su punto débil.

B) **El diseño de GUARDIANA para profesionales, para mejorar lo anterior.** Propuesta concreta y realista:
- algoritmos (FIPS 203/204/205, híbridos; ¿ML-DSA para firmar? ¿HQC?);
- protocolo (¿MLS con suites postcuánticas? ¿triple ratchet?);
- metadatos mínimos (remitente oculto, relés sin registros);
- identidad fácil de verificar (transparencia de claves, passkeys/WebAuthn con PRF, QR);
- seguridad del código que se sirve en el navegador (SRI, firmas, builds reproducibles, transparencia; ¿app nativa o web?);
- servidores (AMD SEV-SNP, Intel TDX);
- borrado verificable;
- recuperación sin que GUARDIANA pueda leer (kits de recuperación, Shamir);
- registro de «quién abrió qué» a prueba de manipulación (Merkle/transparencia) sin ver el contenido;
- lo que necesita un despacho (varios usuarios, roles, revocar un dispositivo, retención).

Di qué haría a GUARDIANA de verdad de lo más seguro del mundo y qué es humo.

C) **Fácil de entender y de usar.** Cómo esconder toda esa seguridad para que un abogado o un médico de 60 años la use sin errores: los pasos, los nombres de los botones y qué pasa si pierde el móvil.

D) **Auditorías y sellos.**
- Cuáles dan confianza a profesionales: auditoría criptográfica independiente (Cure53, Trail of Bits, NCC Group…), ISO/IEC 27001, SOC 2, CSPN/BSI en Europa.
- Coste en orden de magnitud y en qué orden hacerlas.
- Qué NO se puede decir hasta tenerlas.

E) **Aviso de filtraciones.**
- De dónde se sacan los datos con licencia comercial (Have I Been Pwned y sus condiciones, y otras fuentes).
- Cómo comprobar un correo o un teléfono sin guardar ni enviar más de lo necesario (¿k-anonimidad?).
- Qué dice la ley (Ley 1581, RGPD) si vigilamos los correos de una familia o de los empleados.
- Cómo se explica fácil y qué no se puede prometer.

F) **Veredicto.** Qué construimos primero, en cuánto tiempo y con qué coste, y qué decide el dueño.
