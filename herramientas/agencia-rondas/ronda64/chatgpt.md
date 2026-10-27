# Ronda 64 · ChatGPT («Alta», con web) · más ideas de lo que haría pagar, y ENTREGA a fondo

27 Oct 2026, 17:00–17:15 (Bogotá). Chat: el de las rondas 60, 62 y 63. Texto completo allí; aquí lo esencial, fiel.

**Su decisión como dueño:** que GUARDIANA sea la herramienta para mover información confidencial entre personas y empresas: «una persona paga por iniciar una tarea útil, otra participa gratis y ambas conocen GUARDIANA». Una suscripción barata para particulares y un nivel profesional; nunca cobrar al destinatario.

**Distinción técnica clave:** hoy Comunicaciones es en directo (los dos conectados con el código de 9 cifras). Enviar hoy para que el otro lo recoja mañana (ENTREGA TEMPORAL) es otro producto: almacenamiento temporal cifrado, claves, caducidad, borrado. No venderlo como si existiera.

## A) Diez ideas (orden por probabilidad de pago; precios de prueba; desarrollo a 30 €/h como hipótesis)

1. **SOLICITA** («pide documentos sin perseguir a nadie»): el profesional pide una lista de documentos y el cliente los entrega gratis; ve lo recibido y lo que falta. 9–19 €/mes. 60–140 h. Necesita ENTREGA asíncrona. Su favorita para profesionales.
2. **EXPEDIENTE:** los documentos de cada cliente organizados (recibidos, pendientes, entregados), con usuarios y permisos. 15–39 €/mes. 120–240 h. Después de demostrar que se usa ENTREGA.
3. **OCULTA** («tapa lo privado antes de compartir»): tapar números, direcciones o caras en fotos y PDF, eliminándolo de verdad, y limpiar metadatos. Incluido en 4,90. 30–80 h. Ojo: tapar no es borrar; puede invalidar firmas.
4. **CONFIRMA:** antes de pagar un cambio de cuenta bancaria, te guía a confirmarlo por un canal que ya conocías (la FTC lo recomienda). 5–15 €/mes. 40–100 h.
5. **VIGÍA WEB:** vigila la web de una empresa y avisa cuando aparecen nuevos terceros o rastreadores (Radiografía periódica). 9–29 €/mes. 80–160 h. Detectar un tercero no prueba una infracción.
6. **ACUERDO:** dos partes ven una versión concreta de un documento y la aceptan con evidencia técnica. 9–29 €/mes. 100–220 h. Riesgo alto: no es firma certificada (Decreto 2364 de 2012); para lo formal, un proveedor acreditado.
7. **CAPTURA:** ZERO guarda cómo se veía una web, con fecha y huella SHA-256. Incluido. No es un acta notarial.
8. **RECLAMA:** guía para pedir a una empresa acceso, rectificación o supresión de tus datos (por país; empezar por Colombia y España). 3–9 € por uso o incluido. No es asesoría legal.
9. **SECRETO:** enviar una clave temporal que solo se puede ver una vez. Incluido o 3–8 €/mes.
10. **CLAVE FAMILIAR:** guía para que una familia acuerde cómo comprobar llamadas urgentes pidiendo dinero (voces falsas). Dentro del plan familiar. Nunca «infalible».
- Dato de contexto: la FTC registró más de un millón de denuncias por suplantación en 2025 en EE. UU. (~3.500 M US$ de pérdidas declaradas).
- **Sus preferidas entre las nuevas:** SOLICITA, OCULTA y VIGÍA WEB.

## B) ENTREGA a fondo

- **Nombre y frase:** GUARDIANA ENTREGA. «Envía documentos importantes de forma cifrada. La otra persona los recibe gratis y sin crear una cuenta.» Comunicaciones es conversar; ENTREGA, terminar una tarea.
- **Primera versión, ENTREGA DIRECTA (con lo que ya hay):** el que envía elige el archivo, «Preparar entrega», código de 9 cifras, el otro entra, «Enviar ahora», progreso y comprobante de lo que de verdad se comprobó; el que recibe no paga ni crea cuenta, comprueba quién lo envía y puede pulsar «Confirmo que lo he recibido» (opcional; no es aceptar el contenido). El código prueba que tiene la invitación, no su identidad.
- **Segunda versión, ENTREGA TEMPORAL:** encriptado en el navegador con una clave por entrega; el servidor guarda el archivo cifrado, nunca la clave. Diseñar con cuidado cómo llega la clave (enlace con el secreto, contraseña aparte con protección contra intentos). El postcuántico de Comunicaciones no se hereda solo: hay que diseñarlo y probarlo.
- **Qué significa cada función:** caducidad (1 h, 24 h, 7 días; explicar copias y registros); contraseña (barrera extra, no identidad); acuse (separar «llegó», «se descargó» y «pulsó que lo recibió»); límite de descargas (no impide copiar lo descargado); marca de agua (antes de cifrar; disuade, no impide fotos); registro (fechas, estados, huella; sin IP completas); recuperación (si las claves solo están en los equipos, perderlas es perder el archivo).
- **Seguridad imprescindible:** tamaño y tipo de archivo, cifrado autenticado, límites contra abusos, borrado comprobado. Conflicto real: con cifrado de extremo a extremo el servidor no puede revisar el contenido en busca de virus (OWASP: controles de subida).
- **Ley:** Colombia, Ley 527 de 1999 (mensajes de datos, fuerza probatoria; art. 20, acuse de recibo) y acreditación ONAC para certificación; UE, eIDAS arts. 43–44 (la entrega cualificada exige prestador cualificado). Los comprobantes pueden ser prueba electrónica, pero no se puede asegurar su valor en un proceso.
- **Palabras:** sí «entrega cifrada», «comprobante técnico», «registro de recepción confirmada», «acceso limitado», «el destinatario no paga»; no «imposible de interceptar», «certificado legal», «prueba irrefutable de lectura», «desaparecerá de todos los dispositivos», «imposible de copiar», «identidad certificada».
- **Precio (para validar):** quien recibe, gratis; Personal 4,90 €/mes (20 entregas al mes); Profesional 14,90 €/mes (100 entregas, comprobantes ampliados, SOLICITA después). Equipos, más adelante. Salud: no hasta revisar requisitos (datos sensibles).
- **Coste de guardar:** Cloudflare R2, 0,015 US$ por GB-mes (1.000 archivos de 10 MB durante 7 días ≈ 0,035 US$). Dodo cobra desde 4 % + 0,40 US$ por cobro: mejor suscripción que micropagos.

## C) Las tres primeras

1. **ENTREGA DIRECTA** (semana 1: interfaz, invitaciones, estados, pruebas).
2. **COMPRUEBA** básico (semana 2, con los cobros y la prueba gratis).
3. **OCULTA** (semana 3), y semana 4 pruebas con personas y profesionales.
- SOLICITA y ENTREGA TEMPORAL, cuando se vea que repiten y pagan.

## D) Lo que no haría

Nube ilimitada; firma digital certificada propia; «destrucción remota garantizada»; envíos ilimitados sin cuotas; un antivirus universal de documentos; verificar identidad con selfies o documentos; diez aplicaciones con diez suscripciones (todo bajo NÚCLEO, una suscripción y un nivel profesional).
