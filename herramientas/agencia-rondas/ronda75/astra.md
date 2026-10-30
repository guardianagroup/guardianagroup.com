# Ronda 75 · Astra (gpt-6-astra en Cheaper Inference) · 29 Oct 2026

Copiado solo el texto entre «ASSISTANT OUTPUT» y «Response headers» (sin claves).

## A. Estructura recomendada

Una pantalla única, con índice y lectura por niveles: explicación principal siempre visible y detalles técnicos desplegables. Los límites de protección no deben quedar ocultos al final.

1. Qué es GUARDIANA Comunicaciones. Servicio para intercambiar información sensible mediante mensajes, archivos y llamadas. Presentar su finalidad sin equiparar confidencialidad con anonimato o invulnerabilidad.
2. Cómo empezar en el móvil. Explicar la instalación desde la web en iPhone y Android, sin tiendas ni registro. Diferenciar la aplicación instalada del chat temporal del navegador.
3. Tu número GUARDIANA. Explicar sus 12 cifras, su generación local y la posibilidad de elegirlo. Advertir que no se utilicen teléfonos ni fechas personales.
4. Compartir el número y añadirse los dos. Describir el consentimiento mutuo y por qué escribir un número no permite consultar su existencia ni enviar solicitudes. Recomendar compartirlo por un medio de confianza.
5. Conversar, llamar y utilizar un ordenador. Explicar llamadas, archivos temporizados e invitaciones, incluido PC a PC. Precisar caducidad y uso único del código.
6. Cómo se establece la protección. Separar identidad, sesión y cifrado por mensaje. Explicar el componente poscuántico y excluir expresamente el audio y el vídeo de las llamadas.
7. Por qué trabajamos así. Vincular cada decisión —sin cuenta, consentimiento mutuo, distribución web, código abierto y relé sin historial— con su utilidad y sus contrapartidas.
8. Qué ve y qué conserva GUARDIANA. Distinguir contenido, datos de conexión, registros de números, citas y notificaciones. Evitar el ambiguo «no guardamos nada».
9. Qué no protege. Dispositivos infectados, destinatarios que copian, suplantación inicial y límites de los temporizadores. Explicar que copiar tráfico no tiene por qué dejar señales.
10. Cómo verificar. Número de seguridad para comprobar al interlocutor; código y huellas para examinar el software. Son comprobaciones distintas, con límites distintos.
11. Fuerte, Blindado y Ultra. Separar visualmente lo disponible de lo previsto; indicar gratuidad o pago. No presentar la hoja de ruta como capacidad actual.
12. Transparencia, compromiso y ecosistema. Identificar a la empresa, la licencia y el trabajo pendiente. Presentar ZERO, Radiografías y Órbita como servicios distintos.

Qué sobra: superlativos, comparaciones despectivas con otras aplicaciones, listas de siglas sin explicación y argumentos dirigidos a personas mayores.

Qué falta confirmar antes de publicar: recorrido exacto para crear y aceptar invitaciones PC a PC; funcionamiento preciso de los temporizadores y de la eliminación local; política y plazos de conservación complementarios; contacto de privacidad; alcance y calendario de una eventual auditoría. No deben inventarse para completar la página.

---

## B. Texto listo para publicar

# ¿Cómo funciona GUARDIANA Comunicaciones?

## Confidencialidad con límites claros

GUARDIANA Comunicaciones, de GUARDIANA GROUP S.A.S., Cartagena, Colombia, está diseñada para profesionales y organizaciones que intercambian información sensible.

Puedes conversar, compartir archivos y realizar llamadas sin crear una cuenta ni facilitar tu teléfono o correo. Nuestra obligación es explicar cómo protegemos esas comunicaciones, qué información interviene y qué queda fuera de esa protección.

## 1. Empieza desde la web

Accede a guardianagroup.com.

- iPhone: abre la web en Safari y utiliza Compartir → Añadir a pantalla de inicio.
- Android: abre la web en un navegador compatible y elige Instalar aplicación o Añadir a pantalla de inicio.

Es una aplicación web instalable: no necesitas una tienda, una contraseña ni un registro personal. Los nombres de los menús pueden variar.

Si entras desde el navegador del móvil sin instalarla, utilizas un chat temporal que se borra tras diez minutos sin actividad.

## 2. Tu número GUARDIANA

En el móvil, tu aplicación genera un número de doce cifras: once aleatorias creadas en el teléfono y una de control para detectar errores de escritura.

También puedes elegirlo. No utilices tu teléfono, una fecha personal ni una combinación fácilmente deducible.

El servidor recibe una huella derivada del número, no el número directamente, junto con las dos claves públicas de tu aplicación. Esta demuestra que posee su identidad firmando un reto. Las claves privadas se generan como no exportables mediante la tecnología criptográfica del navegador.

## 3. Para hablar, debéis añadiros los dos

Comparte tu número por un medio de confianza. Tú añades el número de la otra persona y ella añade el tuyo.

Escribir un número no envía avisos ni mensajes, ni revela si existe. Así evitamos que conocerlo sea suficiente para iniciar una comunicación no deseada.

Cada aplicación deposita una cita con un sobre cifrado derivado de ambos números. Cuando coinciden, intercambian sus sobres, comprueban huellas, claves y firmas y crean conjuntamente un secreto nuevo.

El chat se abre en los dos teléfonos y queda vinculado a esas identidades. La cita desaparece al abrirse; si no encuentra pareja, caduca a los treinta días.

## 4. Mensajes, llamadas y ordenador

Desde el chat puedes enviar mensajes, iniciar llamadas y videollamadas y compartir notas de voz, fotos y documentos. Hay opciones de visualización de una vez, treinta segundos, un minuto o cinco minutos, y archivos de hasta 4 GB, divididos en fragmentos cifrados.

Estos tiempos limitan la disponibilidad dentro de la aplicación; no impiden que quien recibe haga una copia.

En el ordenador funciona en el navegador mediante invitación: un enlace o un código de nueve cifras, de un solo uso y válido durante diez minutos. La comunicación entre dos ordenadores utiliza también invitaciones; no requiere instalar un programa.

## 5. Cómo se protege una conversación

Cada aplicación dispone de una identidad para firmar y otra para acordar secretos. Utilizamos ECDSA P-256 y ECDH P-256, mecanismos criptográficos de firma y acuerdo de claves.

Cada sesión comienza con presentaciones firmadas y combina tres acuerdos ECDH con ML-KEM-768, un mecanismo poscuántico normalizado en FIPS 203. HKDF-SHA256 transforma esos secretos en claves de sesión.

Los mensajes se cifran con AES-256-GCM, que protege el contenido y permite detectar alteraciones. Cada mensaje utiliza una clave distinta; la anterior se descarta. Cada sesión genera claves nuevas.

El componente poscuántico está en este establecimiento de claves. El audio y el vídeo de las llamadas no son poscuánticos.

Las llamadas utilizan WebRTC y protección DTLS-SRTP. Su señalización viaja dentro del canal cifrado de extremo a extremo. Todo el tráfico de llamada pasa por nuestro servidor TURN: los interlocutores no reciben la dirección IP del otro.

## 6. Comprueba con quién hablas

Cada conversación dispone de un número de seguridad de sesenta cifras. Compáralo con la otra persona mediante un canal independiente y fiable, preferiblemente en persona.

Esta comprobación es especialmente importante en el primer contacto: alguien podría sustituir el número GUARDIANA mientras te lo hacen llegar.

La aplicación avisa y rechaza el acceso si otra identidad intenta entrar en una sala ya vinculada. Esto no sustituye la verificación inicial.

## 7. Qué ve y qué conserva GUARDIANA

Nuestro relé de Comunicaciones está en Núremberg, Alemania. Transmite paquetes cifrados entre los miembros de una sala: no conserva mensajes, nombres ni claves privadas. La sala desaparece cuando sale su último miembro.

El servidor sí conserva:

- Huellas de números y sus claves públicas.
- Citas cifradas pendientes, durante un máximo de treinta días.
- Suscripciones de notificaciones: dirección opaca, claves de entrega y salas asociadas.

Mientras hay conexión, ve la IP, la hora y la información necesaria para encaminar las comunicaciones. Esos datos de conexión no se registran. Los controles de abuso mantienen temporalmente en memoria una representación resumida de la IP.

Los avisos indican «mensaje», «llamada» o «contacto», sin contenido de la conversación. Se cifran para el navegador y utilizan etiquetas por teléfono, no una etiqueta compartida que permita emparejar a ambos destinatarios. Esto no elimina todos los metadatos de los servicios de notificaciones.

## 8. Por qué trabajamos así

Sin cuenta: evitamos pedir identificadores personales innecesarios. Eso no significa que toda actividad sea anónima.

Con consentimiento mutuo: compartir un número no equivale a autorizar mensajes de cualquiera.

Sin historial en el relé: reducimos la información que permanece en nuestra infraestructura. Esto no controla las copias de los destinatarios.

Sin tiendas: distribuimos directamente, solicitamos menos permisos y hacemos público el código. Pero una web no queda fuera del alcance del sistema operativo ni de un programa espía.

La distribución web tiene un punto crítico: el servidor que entrega el código. Publicamos la web estática en GitHub Pages, con políticas de seguridad por página, y seguimos reforzando su entrega. Retirar el icono tampoco debe confundirse con comprobar la eliminación de todos los datos locales.

## 9. Lo que esta tecnología no puede hacer

No protege un teléfono infectado ni impide capturas, grabaciones o copias realizadas por quien recibe.

Tampoco permite detectar necesariamente que alguien haya copiado un paquete durante el tránsito: una copia puede no dejar huella. Por eso protegemos el contenido mediante cifrado, en lugar de prometer que nadie podrá copiar el tráfico.

## 10. Tres versiones, con disponibilidad diferenciada

Fuerte — disponible hoy, gratuita. Incluye las funciones actuales descritas en esta página.

Blindado — próximamente, gratuita. Prevemos P-384, ML-KEM-1024 y firmas ML-DSA-87; identidad nueva por conversación; renovación de claves cada cinco minutos; relleno del tráfico; archivos «todo o nada»; mecanismos de autodestrucción ante ataques; pantalla velada; mosaico y voz grave en vídeo. Su alcance deberá concretarse antes del lanzamiento.

Ultra — próximamente, de pago. Prevemos relés de operadores independientes en varios países, rutas por capas, tráfico de cobertura constante, salas rotativas, mecanismos de detección de intentos de espionaje con informe, archivos de hasta 1 TB, prepago sin cuenta y un programa firmado para PC.

Ninguna función prevista debe interpretarse como disponible ni como garantía de detectar cualquier ataque.

## 11. Verificación y compromiso

El código es público bajo licencia AGPL-3.0. Publicamos huellas SHA-256 —resúmenes digitales de los archivos— en huellas.txt. La página Seguridad y verificación compara lo recibido con lo publicado.

Esa coincidencia no demuestra por sí sola que el código carezca de fallos ni sustituye una referencia independiente. Próximamente: versiones firmadas y anotadas en un registro público.

Código abierto no significa código auditado. Cualquier auditoría independiente futura deberá identificarse mediante su alcance, fecha y resultados.

El ecosistema incluye ZERO, navegación aislada en la nube para reducir la exposición al abrir enlaces y archivos; Radiografías, para conocer qué observa una web y con quién se comunica; y Órbita, para explorar la infraestructura de internet. Son herramientas complementarias, no garantías de ausencia de riesgo.

---

## C. Frases prohibidas y riesgos legales

### Cinco frases que nunca debemos escribir

| No escribir | Versión honesta |
|---|---|
| «Es imposible espiar GUARDIANA». | «Protegemos las comunicaciones mediante cifrado; un dispositivo comprometido queda fuera de esa protección». |
| «Todas nuestras comunicaciones son poscuánticas y estamos certificados CNSA 2.0». | «Fuerte incorpora ML-KEM-768 al establecimiento híbrido de claves. El audio y el vídeo de las llamadas no son poscuánticos». |
| «No recogemos ni guardamos ningún dato». | «No conservamos mensajes en el relé; sí determinados registros técnicos, suscripciones y citas cifradas». |
| «Los archivos desaparecen para siempre». | «La aplicación limita su disponibilidad; no puede eliminar copias realizadas por el destinatario». |
| «Detectamos cualquier intento de espionaje». | «Copiar tráfico puede no dejar huella. Ultra prevé mecanismos de detección cuyo alcance deberá documentarse». |

### Tres riesgos legales prioritarios

1. Protección de datos — Ley 1581 de 2012. IP, huellas, claves públicas y suscripciones pueden ser datos personales cuando permiten identificar o vincular personas. La ausencia de nombre no elimina las obligaciones: documentar finalidades, fundamento aplicable, conservación, derechos, responsable y canales de atención.

2. Tratamiento internacional y terceros. Deben revisarse los flujos hacia Alemania y los proveedores de alojamiento y notificaciones; Miami corresponde a ZERO y debe explicarse en su documentación. Distinguir jurídicamente transmisión y transferencia internacional, con los instrumentos y condiciones aplicables, no solo indicar países.

3. Publicidad engañosa — Ley 1480 de 2011. Las afirmaciones de seguridad deben ser comprobables y coherentes con el producto disponible. «Sin riesgo», «certificado», «auditado», borrado irreversible o funciones futuras presentadas como actuales pueden inducir a error; tampoco debe insinuarse que usar GUARDIANA satisface automáticamente las obligaciones sectoriales de bancos, clínicas o administraciones.
