# ChatGPT (esfuerzo «Alta») — ronda 51, textos de Comunicaciones para profesionales. Copia del texto de la página.

A) Titular: «Comunicaciones confidenciales, sin complicaciones». Entradilla: «Habla con clientes y colaboradores, realiza llamadas y comparte archivos cifrados desde el navegador. Sin instalaciones, sin cuentas y sin números de teléfono.»

B) Beneficios:
1. Sin cuentas ni instalaciones — Inicia conversaciones directamente desde el navegador. Tus clientes no necesitan descargar aplicaciones, registrarse ni facilitar su número de teléfono.
2. Contenido cifrado de extremo a extremo — Tus mensajes y archivos se cifran en los equipos de los participantes antes de pasar por nuestros servidores.
3. Invitaciones temporales — Invita mediante un código de un solo uso, válido durante 10 minutos, o comparte un enlace que incorpora un secreto.
4. Llamadas con privacidad de red — Las llamadas utilizan un relé para evitar que los participantes conozcan entre sí sus direcciones de red.
5. DESTACADO · Archivos enormes, por partes — Comparte archivos de gran tamaño mediante fragmentos cifrados, sin almacenarlos en servidores ni cargarlos completos en memoria.
6. Termina y solicita el borrado — Borra la conversación de tu equipo y solicita su eliminación en el del destinatario. Las copias guardadas aparte permanecen fuera de nuestro alcance.

C) Cómo te protege (sencillo): Las claves nacen en tu equipo. · Cada conversación estrena claves. · Los mensajes se protegen individualmente (una clave por mensaje; la anterior se descarta). · Puedes comprobar con quién hablas (número de seguridad de 60 cifras). · El servidor no conserva las conversaciones; elimina la sala al salir la última persona.
Ficha técnica: Web Crypto nativa; ECDSA P-256 / ECDH P-256, privadas no exportables · presentaciones firmadas, triple ECDH, HKDF-SHA256, renovación por sesión · AES-256-GCM para mensajes y fragmentos de 192 KB; cadenas HMAC-SHA256 · invitaciones: 9 cifras, un uso, 10 min; sobre con PBKDF2 (300.000), intentos limitados; alternativa: secreto en el fragmento # · relé sin almacenamiento persistente; conoce conexiones de la sala y volumen; hasta 8 · número de seguridad; TURN con credenciales temporales; borrado local y solicitud remota.

D) Abogados: contratos, borradores y expedientes con clientes sin cuenta ni app. · Clínicas: conversa con pacientes y comparte documentación confidencial por un canal cifrado. · Empresas y RR. HH.: contratos, documentación laboral y archivos internos.

E) «El cifrado protege el contenido durante su transmisión, pero no evita copias realizadas por los destinatarios ni los riesgos de dispositivos comprometidos o identidades sin verificar.»

F) Riesgos señalados: no confundir sin cuenta con anonimato (los servidores ven IP y metadatos); decir «claves privadas no exportables»; distinguir identidad y sesión; la firma no acredita identidad civil; PBKDF2 sobre 9 cifras no resiste sin límite un ataque fuera de línea; el fragmento # puede leerlo el JavaScript o extensiones («no forma parte de la solicitud HTTP habitual»); el servidor y TURN conocen IP, horarios y duración; el servicio de invitaciones guarda temporalmente un sobre cifrado; «ninguno ve la dirección del otro» solo si se fuerza TURN; no anunciar «sin límite de tamaño» sin pruebas; «terminar y borrar» no elimina capturas ni copias; 8 personas no implica gestión de claves de grupo probada; Web Crypto no es certificación; no sugerir cumplimiento automático de RGPD, sanidad o secreto profesional.
