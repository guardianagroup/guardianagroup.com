# Ronda 72 · Gemini (Flash-Lite, sin sesión) · 29 Oct 2026, 18:25

Registro fiel. Ojo: el caso b) supone un «esquema propio» («¿Abrir en GUARDIANA?») que una PWA no puede registrar en iOS; no se toma.

Gemini ha dicho

Flujo para iPhone — Caso a) No tiene GUARDIANA

Objetivo: Recibir enlace por WhatsApp, instalar la PWA, capturar el chat y activar notificaciones.

Pasos exactos (pantalla por pantalla):

WhatsApp: Toca el enlace corto recibido ([guardianagroup.com/chat/#i=](https://guardianagroup.com/chat/#i=)...). El iPhone lo abre automáticamente en Safari.

Safari (Pantalla de bienvenida web): La página web carga el chat y muestra un botón grande que dice "Instalar y abrir chat". Toca ese botón.

Safari (Menú inferior): En la barra de herramientas de Safari, toca el botón "Compartir" (el icono del cuadrado con una flecha hacia arriba).

Safari (Menú desplegable): Desplaza las opciones hacia abajo en el menú flotante y toca "Agregar al inicio".

Safari (Pantalla de confirmación de iOS): Aparece la vista previa del icono y el nombre. Toca el botón "Agregar" en la esquina superior derecha. El sistema crea un nuevo icono en la pantalla de inicio.

Pantalla de inicio del iPhone: Cierra o minimiza Safari, busca el nuevo icono de GUARDIANA recién creado y tócalo para abrir la app.

GUARDIANA (Primer arranque): Al abrir la app por primera vez, aparece una ventana emergente del sistema operativo que dice: «"GUARDIANA" quiere enviar notificaciones». Toca "Permitir". El chat ya está dentro y listo.

Número total de toques: 7 toques conscientes (más el cambio manual entre Safari y la pantalla de inicio).

Qué puede fallar: Si la persona de 60 años vuelve a abrir una instalación anterior que ya tuviera en la pantalla de inicio (que se quedó vacía), el chat nuevo no aparecerá y creerá que la invitación falló. Si rechaza o ignora el aviso de notificaciones, no recibirá alertas de los mensajes.

Cómo se evita: Diseñar la PWA para que detecte al arrancar si hay un parámetro pendiente en el almacenamiento local o mostrar un aviso visual inconfundible que indique cuál es el icono correcto si existen duplicados.

Flujo para iPhone — Caso b) Ya tiene GUARDIANA

Objetivo: Unirse a un nuevo chat usando la aplicación que ya está instalada previamente, sin reinstalar nada.

Pasos exactos (pantalla por pantalla):

WhatsApp: Toca el enlace de invitación recibido. El iPhone lo abre en Safari.

Safari (Página puente): La página web detecta que el usuario ya dispone de una sesión previa y muestra un botón directo que reza: "Abrir en mi app GUARDIANA". Toca ese botón.

Sistema iOS (Alerta de esquema personalizado): Aparece un aviso nativo del sistema que pregunta: «¿Abrir en "GUARDIANA" ?». Toca "Abrir".

GUARDIANA (App instalada): La app de la pantalla de inicio se abre de manera automática mostrando el nuevo chat integrado en la lista principal.

Número total de toques: 4 toques.

Qué puede fallar: Al no existir enlaces universales nativos directos para PWAs puras en iOS, el paso intermitente obligatorio por Safari puede confundir al usuario mayor, haciéndole pensar que ha salido de la aplicación o que está navegando por internet por error.

Cómo se evita: Añadir instrucciones visuales muy claras en la página intermedia de Safari con un diseño gráfico grande que explique que ese salto de pantalla es un paso de seguridad normal y automático.

Evaluación de Opciones Tecnológicas

A) Seguir como PWA y afinar el flujo

Pros: Cero costes de distribución, control absoluto del código fuente, independencia total frente a políticas de tiendas de aplicaciones y ausencia de comisiones.

Contras: Safari en iOS gestiona los manifiestos dinámicos (blob: o data:) de forma restrictiva e inestable; la fiabilidad del start_url inyectado varía de manera impredecible entre distintas versiones de iOS (17, 18 y posteriores).

Coste: Bajo (horas de programación interna).

Plazo: Inmediato (1 a 3 días).

B) Usar un código corto (9 cifras) escrito dentro de la app

Pros: Elimina por completo la necesidad de pasar por Safari para los usuarios que ya tienen la aplicación instalada; todo ocurre dentro del entorno cifrado.

Contras: Obliga a la persona de 60 años a memorizar, transcribir, dictar o teclear manualmente un código de 9 cifras, lo cual genera una fricción enorme y una tasa muy alta de errores humanos.

Coste: Bajo.

Plazo: 2 a 4 días.

C) Publicar una app nativa mínima (envoltorio tipo Capacitor) en App Store y Google Play

Pros: Soluciona el problema estructural en iOS mediante enlaces universales reales, permitiendo que el enlace abra la app directamente en un solo toque (igual que funciona WebAPK en Android).

Contras: Dependencia estricta de la App Store de Apple (revisiones rigurosas, políticas estrictas sobre criptografía y pago anual obligatorio de cuenta de desarrollador).

Coste: Medio (configuración de certificados, cuenta de desarrollador y despliegue inicial).

Plazo: 2 a 4 semanas.

D) Otras ideas (Códigos QR, App Clip, portapapeles automático, etc.)

Pros: App Clip permitiría experiencias instantáneas sin instalación previa en iOS para casos puntuales.

Contras: Los App Clips poseen restricciones técnicas muy severas de tamaño de paquete, no garantizan una persistencia de datos robusta en IndexedDB a largo plazo y complican innecesariamente la arquitectura de seguridad y cifrado.

Recomendaciones Finales

Para hoy: Mantener la arquitectura PWA actual refinando los textos de ayuda visual en pantalla y utilizando el puente de apertura directa desde Safari, asumiendo las limitaciones técnicas que impone Apple en iOS.

Para el futuro: Migrar hacia una app nativa ligera basada en un contenedor web (como Capacitor) con enlaces universales configurados, logrando así la experiencia fluida de un solo toque en iPhone.