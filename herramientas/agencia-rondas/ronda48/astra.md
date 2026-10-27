# Ronda 48 · Astra 6 (gpt-6-astra, Playground de Cheaper Inference) · 26 Oct 2026 · respuesta literal (sin cabeceras ni claves)

## Dictamen
El diseño puede proporcionar cifrado de extremo a extremo, pero esta descripción no basta para validar la implementación ni todas las promesas. Hay aspectos críticos sin especificar: orden del triple DH, tratamiento de repeticiones, nonces de presentación, verificación del número y borrado remoto. Esta es una revisión, no dos voces independientes: necesitáis otra revisión del código, pruebas y configuración operativa.

## A. Protocolo: problemas y prioridades
### 1. Triple DH: hay que fijar el orden
Definid A = iniciador y B = respondedor. Ambos deben concatenar exactamente DH(ef_A, ef_B) ‖ DH(id_A, ef_B) ‖ DH(ef_A, id_B). Cambios prioritarios: codificación canónica, longitudes, versión y etiquetas de dominio; vincular la derivación de claves al hash de la transcripción autenticada (identidades, roles, efímeras, épocas y respuesta); separar explícitamente las claves A→B y B→A; añadir confirmación de clave antes de declarar establecida la sesión.
### 2. Roles, épocas y repetición
¿Cómo sabe cada lado quién tiene la huella menor antes de intercambiar las identidades? Separad descubrimiento de identidad e inicio del acuerdo. Una firma válida no demuestra que una presentación sea reciente: especificar cómo se generan las épocas y se evita su reutilización; que resp corresponda exactamente al intento pendiente; rechazo de respuestas antiguas, duplicados y estados incompatibles; gestión de reconexiones simultáneas; prohibición de reinstalar una sesión antigua reiniciando contadores (reutilizaría claves y nonces de GCM).
### 3. AES-GCM y cadena simétrica
No se especifica el nonce de presentación: ambos lados comparten esa clave, sus nonces deben ser únicos también entre reconexiones (nonces aleatorios de 96 bits con límites de uso). La cadena HMAC protege mensajes anteriores si se borran las claves consumidas; no aporta recuperación dentro de la sesión; las claves saltadas retenidas quedan expuestas. Proteger contadores y estado contra concurrencia entre pestañas y restauraciones; rechazar duplicados; limitar saltos y trabajo antes de autenticar; borrar efímeras y claves antiguas; ampliar el identificador de sesión a 128 o 256 bits. Preferencia: un protocolo y una implementación mantenidos y auditados en vez de consolidar un acuerdo propio sin análisis independiente.
### 4. Invitación «para una persona»
El enlace es una credencial al portador: quien lo obtiene puede intentar emparejarse primero. «Ya usada» requiere explicar quién fija la identidad aceptada y dónde persiste; debe resistir carreras, pestañas simultáneas y reconexiones; borrar el almacenamiento local puede eliminar esa protección.
### 5. Archivos y almacenamiento
No hace falta un hash global si el anuncio autenticado fija identificador, tamaño y número de trozos y el receptor verifica índices, longitudes y etiquetas sin huecos ni duplicados. No declarar el archivo completo antes de esas comprobaciones. Los Blob sin cifrar en IndexedDB no tienen vuestro cifrado local. Una clave no exportable limita su extracción por la API, pero código malicioso del mismo origen puede usarla para descifrar.

## B. Llamadas por coturn
Sí, condicionalmente: DTLS-SRTP cifra entre navegadores; coturn reenvía y no tiene las claves. La condición es que la huella DTLS llegue por señalización autenticada y se compruebe. `iceTransportPolicy: 'relay'` evita exponer candidatos directos al otro participante, pero TURN conoce las IP de sus clientes. Comprobad SDP, candidatos y rutas reales en cada navegador antes de prometer ocultación de direcciones.

## C. Revisión de las frases 1–8
1. «El contenido se cifra entre los dos navegadores. No ofrecemos almacenamiento de mensajes en el servidor.» La ausencia de registros exige verificación aparte.
2. «El relé reenvía contenido cifrado y no dispone de sus claves. Ve datos de conexión y tráfico.»
3. Incorrecta: la sala derivada sí llega al relé. «El secreto de invitación está tras # y no se incluye en la petición HTTP. La aplicación del navegador sí puede leerlo.» También puede quedar en historial, sincronización o extensiones.
4. Esencialmente correcta: «Mensajes con AES-256-GCM y una clave derivada por mensaje. Cada reconexión establece nuevas claves de sesión mediante ECDH P-256 autenticado con ECDSA.»
5. Demasiado absoluta: «Comparad el código por un canal independiente y de confianza para verificar el vínculo criptográfico entre ambos.» No descarta equipos comprometidos.
6. «Hasta verificar el código por otro canal de confianza, dependéis de que la invitación haya llegado únicamente a la persona prevista.»
7. «Audio y vídeo cifrados entre navegadores mediante WebRTC y transportados por TURN. TURN conoce las IP de conexión; la configuración busca no revelarlas al interlocutor.»
8. Correcta: «El cifrado no protege frente a un equipo o navegador comprometido. Esta versión no ofrece protección poscuántica.» Incluid también código de la aplicación comprometido.

## D. Límites visibles
Metadatos (IP, sala, horarios, duración, conexiones simultáneas, volumen; TURN añade metadatos de llamadas; no es anonimato). Disponibilidad (ambos con la aplicación abierta; la suspensión de pestañas en móviles puede interrumpir). Identidad (pertenece al perfil y almacenamiento de ese navegador/origen; varias pestañas pueden compartirla). Archivos (copias locales sin vuestro cifrado; 300 MB no garantiza memoria en todos los equipos). «Destruir»: quitad «borra todo en los dos lados»; solo borra lo propio y solicita el borrado remoto; no elimina descargas, capturas ni copias. Confianza operativa: HTTPS, código servido, dependencias y origen web forman parte de la seguridad; compartir proceso con ZERO amplía el impacto de un fallo. No prometer: anonimato, imposibilidad de interceptación, borrado verificable del otro equipo, protección poscuántica, resistencia a dispositivos comprometidos ni seguridad auditada sin auditoría.
