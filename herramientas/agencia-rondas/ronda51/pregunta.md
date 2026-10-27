Ronda 51 · GUARDIANA Comunicaciones · textos para profesionales (27 Oct 2026)

Eres parte de la agencia de GUARDIANA. Necesito textos en español, profesionales y claros, para la página de Comunicaciones (chat, llamadas y archivos cifrados). Público: despachos de abogados, clínicas y consultas médicas, gestorías, notarías, recursos humanos y empresas que envían información confidencial de clientes.

HECHOS DEL PRODUCTO (no inventes nada fuera de esto):
- Funciona en el navegador, sin instalar nada ni crear cuenta, sin número de teléfono.
- Cifrado de extremo a extremo con Web Crypto del navegador (sin librerías de terceros): identidad con claves ECDSA P-256 (firma) y ECDH P-256 (acuerdo) creadas en el equipo y no exportables.
- Inicio de conversación: presentaciones firmadas y triple acuerdo ECDH (efímera–efímera, identidad–efímera, efímera–identidad) mezclado con HKDF-SHA256. Cada sesión nueva renueva todas las claves.
- Mensajes y trozos de archivo: AES-256-GCM. Las claves avanzan con cada mensaje (cadenas HMAC-SHA256): una clave distinta por mensaje y la anterior se olvida.
- Invitación: código de 9 cifras, un solo uso, caduca en 10 minutos; el servidor solo guarda un «sobre» cerrado con una clave derivada del código en el navegador (PBKDF2, 300.000 iteraciones) y limita los intentos. O enlace cuyo secreto va tras «#» y nunca llega a un servidor.
- Número de seguridad de 60 cifras para comprobar por teléfono o en persona que no hay intermediarios.
- El servidor (relé) no guarda mensajes, nombres ni claves; solo sabe qué conexiones comparten una sala y cuántos bytes mueven; la sala desaparece al irse la última persona. Hasta 8 personas por sala.
- Llamadas por un relé TURN: ninguno de los dos ve la dirección de red del otro; las credenciales caducan solas.
- Archivos de cualquier tamaño, enviados en trozos cifrados de 192 KB (nunca enteros en memoria) y sin guardarse en ningún servidor.
- «Terminar y borrar»: borra la conversación en el equipo y pide el borrado en el de la otra persona (no alcanza lo que ya haya guardado en su disco).

REGLAS: nada de «imposible de hackear», «100 % seguro», ni promesas absolutas; no afirmes cumplimiento legal (RGPD, secreto profesional, datos de salud, HIPAA) ni certificaciones; nada de cifras que no estén arriba.

PIDO:
A) Un titular y una entradilla (máx. 30 palabras) para profesionales.
B) Seis beneficios en tarjetas: título (máx. 5 palabras) + texto (máx. 25 palabras), en lenguaje de cliente, no técnico. Incluye uno destacado sobre archivos enormes.
C) «Cómo te protege»: el modelo de seguridad explicado en 5 líneas sencillas y, aparte, una ficha técnica de 6 líneas para responsables de seguridad.
D) Tres casos de uso de una línea: abogados, clínicas, empresas.
E) Una línea honesta sobre los límites, sin asustar.
F) Señala cualquier frase de arriba que pueda ser engañosa o arriesgada legalmente.
Responde solo con el texto final, ordenado A–F.
