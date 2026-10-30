# Ronda 73 · Número GUARDIANA · notas de cierre (29 Oct 2026, 22:30)

Dos voces: Astra 6 (astra.md, astra-2.md, astra-3.md) y una voz independiente con hechos comprobados (claude.md).
Pregunta: pregunta.md. Lo construido: zero-motor/numeros.js, comunicaciones/{cripto,rele,app,sw}.js, prueba numero.js.

## Lo que confirman las dos voces (y está construido)
- **M «añadirse los dos»**: escribir un número no produce nada al destinatario; la respuesta del servidor es la misma exista o no el
  número. C (solicitud con Aceptar/Rechazar) no cumple el requisito del dueño (21:40).
- **12 cifras = 11 al azar creadas en el teléfono + 1 de control Damm.** Capacidad 10^11 (Astra) / 9·10^10 con primera cifra 1–9
  (voz indep.); ocupación con 1.000 M de personas, ~1 %. Damm detecta toda cifra cambiada y toda transposición de vecinas.
- **El número no sale del teléfono**: al servidor va la huella idn = PBKDF2-SHA256(número, «GUARDIANA número v1», 300.000).
  Honesto: la huella encarece enumerar, no hace secreto el número (voz indep.: toda la base de 11 cifras al azar se invierte en
  ~12 días de una GPU a 100.000 vueltas; a 300.000, ~35). Con M no hace falta que sea secreto.
- **Semilla nueva por emparejamiento, firmada**: nada de semilla estática (Astra, bloque 0). Construido: cada uno deja un sobre
  (AES-GCM con una clave que sale de los dos números) con sus claves públicas, un valor al azar y una firma; la semilla sale de
  ECDH entre las dos identidades + los dos valores al azar + las dos huellas. Comprobación de que la otra mitad es del número
  escrito (huella), con las claves de su alta y bien firmada; en la sala, solo entra esa identidad (`huellaEsperada`).
- **Nombre**: «Número GUARDIANA · No es un número de teléfono». Sin «+», sin prefijo, sin tel:.
- **Textos**: «Bienvenido a GUARDIANA», «Otro número», «Usar este número», «Para hablar, los dos deben añadir el número del otro»,
  «Esperando a {n}», «Cuando {n} añada también tu número, el chat se abrirá solo».
- **Topic de Web Push** (voz indep., hecho comprobado en RFC 8030): llevaba 16 caracteres de la sala; Apple/Google podían ver qué
  suscripciones comparten chat. Arreglado: etiqueta HMAC por suscripción, sala y tipo (avisos.js `tema`).
- **Buzón**: no es una sala del relé (nadie «entra»); es la sala de avisos por la que llega «contacto». Arreglado tras la voz
  independiente: sale de la huella con un secreto del servidor y solo su dueño (conexión que presentó el número firmando el reto)
  puede suscribirse (numeros.js `buzon`, `salaPermitida`).
- **Límites** (Astra; la voz indep. da otros parecidos): 10 números nuevos/h y 30/día por identidad; 100 citas pendientes; altas
  5/min por conexión y 30/h por IP resumida (HMAC con clave de cada arranque, solo en memoria).
- **Web frente a app nativa**: la frase del dueño (21:47) no es cierta tal cual; el sistema (y Pegasus) ven cualquier app. Lo que
  sí: sin tienda, menos permisos, código con huellas públicas, aislada, se borra con el icono. Punto débil: el servidor que
  entrega el código (→ blindar la web, #86; anclaje de versiones firmadas, futuro).
- **Cómo pasar el número** (21:55): el número no es una llave; el riesgo es la sustitución en el camino; de más a menos seguro:
  QR en persona (futuro; con la huella/clave dentro), de viva voz (sin cambio de voz), por escrito + «Verificar contacto».
  Construido: «Compartir mi número» como texto (sin enlace con el número; solo el dominio para quien no tiene la app).

## Donde difieren (decisión)
- **Agrupar**: Astra 3-3-3-3; voz indep. 4-4-4 (por no parecer 3-3-4 de teléfono). 12 cifras en 3-3-3-3 tampoco son un teléfono
  → 3-3-3-3 (más fácil de dictar).
- **«Elegir el mío»**: Astra sí, con avisos; voz indep. no (teléfono/fecha invertibles, suplantación). El dueño lo quiere (21:54)
  → se deja un nivel más abajo, con aviso «No uses tu teléfono ni tu fecha», patrones triviales rechazados, y «ocupado» solo para
  el elegido (el azar reintenta solo). Dicho al dueño con la objeción.
- **Caducidad de la cita**: Astra 7 (quizá 30), voz indep. 30 → 30 días.
- **Enlace «Compartir mi número»**: Astra útil con dominio fijo; voz indep. peor que el texto → texto, con el dominio solo.
- **Cifras mundiales**: Astra no pudo navegar; la voz indep. trae una tabla con «2 fuentes» marcadas → #84 (comprobar enlaces
  antes de publicar).

## Lo que las dos piden y queda para después (registro de diseño)
1. **Clave de cuenta + hoja de rescate** (12 palabras o QR en papel): recuperar el número al perder el móvil, firmar los aparatos
   (PC con QR), cambiar claves sin cambiar de número; «GUARDIANA nunca te pedirá la hoja». Hoy: una app = una identidad = un número.
2. **Mudanza a sala y PSK nuevos en el primer encuentro** (que ya es ML-KEM-768): la cita usa ECDH P-256 estático (sin capa PQ ni
   secreto hacia adelante para la semilla; el contenido sí va con ML-KEM). Alternativa: prekey ML-KEM firmada en el sobre.
3. **Transparencia de claves** (registro auditado; autovigilancia del propio número por otra conexión) y «Verificar contacto»
   con QR; colores de verificación tipo Threema.
4. **Anclaje del código**: solo versiones firmadas con una clave fuera del servidor (tipo Code Verify) → con #86.
5. **Bloquear / denunciar** (firma de los mensajes como prueba) y aviso de cambio de clave.
6. Honesto, sin cubrir: el servidor ve IP y horas en directo; un operador decidido puede invertir huellas (días de GPU) y, con
   ellas, deshacer la «ceguera» de las citas de una persona concreta; Pegasus; teléfono desbloqueado robado; primer contacto sin
   verificar.
