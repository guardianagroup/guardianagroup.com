Ronda 72 · GUARDIANA · Invitar a un chat en el iPhone, en un solo paso, para una persona de 60 años (29 Oct 2026, 18:15). Máximo razonamiento.

Eres parte de la agencia de GUARDIANA (empresa colombiana de privacidad). Comunicaciones es su chat, llamadas y videollamadas encriptados de extremo a extremo. Es una aplicación web (PWA), sin App Store, sin cuenta, sin teléfono ni correo. El dueño: «simplifícalo todo… como si fuera para una persona mayor… el mínimo de pasos; si puede ser todo en un paso, mejor, porque si no la gente se aburre… déjalo todo automatizado». Responde en español, concreto y en bloques numerados. No inventes: si algo depende de una versión de iOS o Android, dilo; si no lo sabes, «no lo sé». Nada de promesas absolutas.

HECHOS (verificados en teléfonos reales esta tarde):
1. Invitar: desde la app, «Invitar a chat» comparte por WhatsApp un enlace corto: guardianagroup.com/chat/#i=<semilla>. La semilla (32 bytes, en el fragmento) es el secreto de la conversación: nunca puede ir en claro a ningún servidor. El relé solo ve una sala derivada de ella.
2. iPhone: el enlace de WhatsApp se abre siempre en Safari, nunca en la app de la pantalla de inicio (no hay enlaces universales para una PWA). Safari y la app de la pantalla de inicio guardan cada uno sus cosas por separado (IndexedDB, localStorage, cookies). Las notificaciones (Web Push) solo funcionan en la app de la pantalla de inicio, no en Safari.
3. Resultado: la esposa del dueño aceptó la invitación en Safari → el chat quedó en Safari, la app vacía y sin notificaciones. Si se le pide «Agregar a Inicio» otra vez, el iPhone crea OTRO icono (no sustituye el anterior).
4. Lo que hemos probado: al abrir la invitación en Safari, no se acepta; se pone un manifiesto propio cuya start_url lleva la invitación (?app=1&inv=…#i=…) y la dirección de la página también, y se pide «Agregar a Inicio»; la app nueva nace con el chat dentro. Para quien YA tiene la app: botón «Ya tengo GUARDIANA» que copia la invitación al portapapeles, y en la app «Abrir invitación» la pega (iOS pide confirmar «Pegar»). El dueño lo encuentra lioso: demasiadas decisiones y pasos.
5. Android (Chrome): la app instalada (WebAPK) comparte almacenamiento con Chrome y, al estar instalada, puede abrir directamente los enlaces de su ámbito. Funciona bien.
6. Existe además un código de 9 cifras (sobre cifrado con PBKDF2 en el relé, 10 minutos, un solo uso) que hoy solo se usa en el ordenador.
7. Dos personas que ya se tienen como contacto no necesitan volver a invitarse: el chat sigue en «Mis chats» para siempre.

LA PREGUNTA: diseña el flujo MÁS SIMPLE posible, para una persona de 60 años con iPhone, en estos dos casos:
a) No tiene GUARDIANA: recibe la invitación por WhatsApp. ¿Cuál es el mínimo absoluto de pasos para acabar con la app en la pantalla de inicio, el chat dentro y las notificaciones activadas?
b) Ya tiene GUARDIANA (instalada antes por otra invitación): recibe una invitación de una persona nueva. ¿Cómo entra en ese chat sin reinstalar nada y sin perderse?

Para cada caso: los pasos exactos que vería la persona (pantalla por pantalla, con el texto de cada botón), cuántos toques son, qué puede fallar en el iPhone real y cómo se evita.

Evalúa además, con pros, contras, coste y plazo:
A) Seguir como PWA y afinar el flujo (¿start_url con la invitación es fiable en iOS 17, 18 y 26? ¿el manifiesto dinámico blob: o data: lo respeta Safari?).
B) Que la invitación NO sea un enlace sino un código corto que se escribe dentro de la app (el que ya tiene la app no pasa nunca por Safari).
C) Publicar una app nativa mínima (envoltorio, p. ej. Capacitor) en App Store y Google Play, con enlaces universales: el enlace abre la app si está instalada y, si no, la tienda; y el «enlace diferido» para que la invitación llegue a la app tras instalarla sin servidor que vea la semilla.
D) Cualquier otra idea mejor (QR, App Clip, portapapeles automático, etc.).

Termina con UNA recomendación clara para hoy (lo que se puede hacer ya, sin App Store) y UNA para el futuro, cada una en tres líneas como máximo.
