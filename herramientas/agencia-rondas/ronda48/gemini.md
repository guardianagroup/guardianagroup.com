# Ronda 48 · Gemini (4 Argon) · 26 Oct 2026 · respuesta literal

El protocolo es criptográficamente sólido en su base, pero tiene 4 vulnerabilidades de diseño reales (dos en el acuerdo/presentación y dos en el manejo de estado y archivos) que conviene corregir hoy mismo, y varias frases en pantalla necesitan ajuste para ser 100 % exactas.

## A. Auditoría del protocolo: fallos reales y orden de prioridad

### 1. CRÍTICO (Cambiar primero): Falta la identidad y efímera del par en la firma de respuesta (Fallo de Unknown Key-Share / Key Compromise Impersonation parcial)
En la presentación, cada lado firma (sala ‖ pubs_propias ‖ efímera_propia ‖ época ‖ resp). El fallo: la firma del que responde ata la época del iniciador (resp), pero no ata criptográficamente la huella ni la clave efímera del iniciador. Si un atacante (o un miembro previo de la sala) tiene o intercepta la semilla del enlace #i=…, puede tomar un paquete de presentación legítimo de B y reenviarlo o cruzarlo en otra negociación dentro de la misma sala manipulando los tiempos, o provocar un desacuerdo sobre con qué efímera se está negociando antes de que falle el MAC del primer mensaje.
La solución exacta: quien inicia (huella menor) envía su presentación firmando (sala ‖ "INIT" ‖ pub_firma_A ‖ pub_acuerdo_A ‖ ef_A ‖ época_A). Quien responde (tras ver el mensaje de A) debe incluir en su firma la huella y la efímera recibidas de A: (sala ‖ "RESP" ‖ pub_firma_B ‖ pub_acuerdo_B ‖ ef_B ‖ huella_A ‖ ef_A ‖ época_B ‖ época_A). Además, la derivación de Sesión = HKDF-SHA256(...) debe meter en el parámetro info el transcript ordenado de ambas partes: info = "GUARDIANA sesion" ‖ huella_menor ‖ ef_menor ‖ huella_mayor ‖ ef_mayor.

### 2. ALTO (Cambiar segundo): En los reencuentros no se incluye la clave de presentación (semilla) ni una prueba de conocimiento de la invitación
Como sala es pública para el servidor WebSocket, una vez superada la primera presentación, el cálculo de la clave de sesión depende únicamente de las claves públicas de las partes y de sala. Si el relé (o alguien que controle el servidor en un reencuentro futuro) no conoce la semilla, igualmente podría intentar inyectar un paquete de presentación si el cliente no exige que también los reencuentros vayan cifrados bajo clave de presentación (o una clave derivada de la sesión anterior). Además, si época es un simple contador o timestamp y no un nonce aleatorio de 16-32 bytes, el que inicia no tiene garantía de frescura frente a una repetición.
La solución exacta: sustituir época (8 bytes) por un nonce aleatorio de 16 bytes; incluir la clave de presentación (derivada de la semilla del #) como entrada adicional (PSK) en el HKDF de la sesión: HKDF(DH1 ‖ DH2 ‖ DH3 ‖ clave_presentacion, ...). Así, ni siquiera un servidor malicioso que engañe a un usuario para no verificar el número de seguridad puede hacer Man-in-the-Middle sin poseer también el fragmento #i=… del enlace.

### 3. MEDIO (Cambiar tercero): El corte de sesión sin ratchet DH y el borrado de ck
Cadena simétrica sin ratchet DH: decisión de ingeniería válida y honesta para sesiones cortas en web. Da Forward Secrecy hacia el pasado de cada mensaje solo si se borran de memoria y de IndexedDB la clave de cadena anterior (ck) y las claves de mensaje (mk) en cuanto se usan. No da Post-Compromise Security dentro de una misma conexión abierta; la curación ocurre únicamente al reconectar. En JavaScript los ArrayBuffer no se borran solos: hacer fill(0) tras cada paso y no guardar jamás ck ni efímeras en IndexedDB.

### 4. MEDIO (Cambiar cuarto): Truncamiento silencioso en archivos y colisión del identificador de sesión
Si el anuncio declara total_trozos = 100 y la transmisión se interrumpe en el 99, el archivo no debe quedar como válido hasta verificar trozos_recibidos === total_trozos_anunciados (o un byte es_ultimo_trozo en el AAD del último). Identificador de sesión de 8 bytes en el AAD: suficiente contra colisiones accidentales, pero no cuesta nada meter los 32 bytes completos del hash del transcript en el campo additionalData (8 en la cabecera de red).

## B. ¿Es exacto llamar «cifrado de extremo a extremo» a las llamadas WebRTC pasando por coturn?
Sí, 100 % exacto y riguroso, siempre que la oferta y la respuesta SDP (con a=fingerprint) viajen dentro del canal sellado y autenticado y nunca por otro canal, y que el acuerdo de sesión esté completado antes de iniciar la llamada. coturn solo ve paquetes opacos y no tiene las claves SRTP.

## C. Revisión frase por frase
1. Exacto si los logs de nginx/coturn/node están apagados. Propuesta: «Cifrado de extremo a extremo entre navegadores. Nuestros servidores no guardan ni mensajes ni archivos.»
2. Matizar: el relé lee el identificador de la sala y tamaño/momento de cada trama. Propuesta: «El relé de GUARDIANA solo encamina tramas cifradas que no puede descifrar y no guarda historial.»
3. Promete de más: si el usuario pega el enlace en WhatsApp, Telegram, Gmail o iMessage, el servidor de esa app ve el enlace entero con el # (y sus bots de previsualización pueden abrirlo). Propuesta: «El secreto de invitación viaja tras «#» para que el navegador no lo envíe a nuestro servidor (envía el enlace por un canal de confianza).»
4. Exacto; se puede dejar.
5. Inexacto tal como está definida «huella» (es de una persona). Si se muestra un código común SHA-256(ordenadas(Huella_A, Huella_B)): «Si los dos comprobáis el mismo código de seguridad por otra vía, verificáis que habláis directamente sin intermediarios.»
6. Exacto y muy honesto (TOFU); se puede dejar.
7. Matizar «dirección»: es la IP lo que se oculta entre interlocutores; el servidor sí ve ambas. Propuesta: «Llamadas cifradas de navegador a navegador a través del relé: ningún participante ve la dirección IP del otro.»
8. Exacto; se puede dejar.

## D. Límites que declarar explícitamente
- Metadatos: «Mientras estás conectado, el servidor de relé y el servidor TURN conocen tu dirección IP, el identificador anónimo de la sala, el momento de conexión y el volumen de bytes, pero nunca el contenido ni las claves. Los datos no se escriben en disco.» No prometer anonimato de red frente a GUARDIANA.
- Almacenamiento local: los mensajes se cifran con una clave guardada en el propio navegador; cualquier persona o programa con acceso a tu sesión abierta puede leer el historial y los archivos recibidos (los archivos en memoria se guardan sin cifrar). En equipo compartido, «Destruir» antes de cerrar. No decir que la clave «no exportable» protege en reposo frente a un portátil desbloqueado o un navegador infectado.
- «Destruir» es cooperativo: borra lo local al instante y envía una orden de borrado; si la otra persona está desconectada, ya descargó el archivo o modificó su navegador, no se puede borrar lo que ya está en su poder. No prometer «autodestrucción garantizada».
- Sin buzón: ambos navegadores deben coincidir con la pestaña abierta.
- Identidad ligada al navegador: sin cuenta ni copia en la nube; se pierde al borrar los datos del sitio o cambiar de equipo.
