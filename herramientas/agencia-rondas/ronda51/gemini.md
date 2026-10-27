# Gemini (Argon) — ronda 51, textos de Comunicaciones para profesionales. Copia del texto de la página (27 Oct 2026, 00:50 Bogotá).

A) Titular: «Sala de reuniones y envío de documentación confidencial desde el navegador». Entradilla: «Comparte expedientes, informes y llamadas cifradas con tus clientes al instante. Sin instalar programas, sin crear cuentas ni pedir números de teléfono, y sin dejar copias en servidores intermedios.»

B) Beneficios:
1. Acceso inmediato para tu cliente — Sin registros, contraseñas ni números de teléfono. Tu cliente entra desde su navegador con un código temporal o un enlace directo, sin instalar programas.
2. DESTACADO · Archivos de cualquier tamaño — Envía expedientes completos, pruebas diagnósticas o vídeos pesados de extremo a extremo. Viajan fragmentados y cifrados, sin colapsar el navegador ni guardarse en ningún servidor.
3. Salas que desaparecen al terminar — Hasta 8 participantes por sala. El servidor solo encamina el tráfico sin guardar mensajes, nombres ni archivos; al salir el último, la sala desaparece.
4. Llamadas sin exponer tu red — Las llamadas se conectan a través de un relé intermedio para que ningún participante vea la dirección de red del otro.
5. Verificación directa entre interlocutores — Número de 60 cifras, por teléfono o en persona, para comprobar que hablas directamente con tu cliente sin intermediarios.
6. Cierre y limpieza de sesión — «Terminar y borrar» elimina la conversación de tu pantalla y solicita al instante el borrado en el navegador de la otra persona.

C) Cómo te protege (sencillo): Llaves creadas en tu equipo y bloqueadas para que no puedan extraerse · Invitaciones caducas (9 cifras, un uso, 10 min, o enlace cuyo secreto nunca se envía al servidor) · Una llave nueva por mensaje y por fragmento; la anterior se descarta · Tránsito a ciegas: el servidor sabe qué conexiones comparten sala y cuántos bytes mueven, pero no ve nombres, claves ni contenidos · Sin rastro tras la reunión: la sala deja de existir y los datos se limpian del navegador.
Ficha técnica: Web Crypto nativa sin librerías de terceros; ECDSA/ECDH P-256 no exportables · presentaciones firmadas, triple ECDH, HKDF-SHA256, renovación por sesión · AES-256-GCM en mensajes y fragmentos de 192 KB; cadenas HMAC-SHA256 con descarte de claves previas · invitación: 9 dígitos, 10 min, límite de intentos, sobre PBKDF2 (300.000) o secreto en el fragmento # · relé sin persistencia; máx. 8 conexiones por sala; TURN con credenciales efímeras · número de seguridad de 60 dígitos; archivos por streaming de 192 KB sin carga completa en RAM.

D) Abogados y notarías: escrituras, pruebas y contratos preliminares sin exponer borradores en el correo ni obligar al cliente a registrarse. · Clínicas: resultados e informes voluminosos al paciente, verificando su identidad por voz antes de enviar. · Gestorías, RR. HH. y empresas: nóminas, auditorías, pactos de socios y documentación laboral en salas efímeras.

E) «GUARDIANA protege la información mientras viaja y mientras permanece en la sala, pero no puede impedir que el destinatario guarde los archivos recibidos, haga capturas de pantalla o tenga su propio dispositivo comprometido.»

F) Riesgos: «cualquier tamaño» puede leerse como promesa absoluta (depende de la conexión y del disco del receptor) → matizar; «sin guardarse en ningún servidor» es exacto para el contenido, pero el sobre de invitación queda en el servidor hasta 10 minutos → distinguirlo; «Terminar y borrar» es una solicitud, no un control remoto garantizado → dejar visible el límite de la sección E.
