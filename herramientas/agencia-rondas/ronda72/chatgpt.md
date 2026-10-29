# Ronda 72 · ChatGPT · 29 Oct 2026, 18:20

Registro fiel de la respuesta (chatgpt.com, sin «Alta»).

Ronda 72 · GUARDIANA: invitar en el iPhone con el mínimo de pasos

Conclusión de diseño: para iPhone hay que separar dos situaciones. Quien no tiene GUARDIANA necesita instalarla sin perder la invitación; quien ya la tiene debe abrir el chat dentro de su instalación actual. No se debe obligar a ambas personas a pasar por el mismo proceso.

Hay una limitación fundamental: con la PWA actual, el enlace de WhatsApp no abre directamente la app instalada en iPhone. Por eso, intentar resolverlo con más botones en Safari no elimina el problema de fondo.

1. Caso A: no tiene GUARDIANA

Objetivo: terminar con GUARDIANA en la pantalla de inicio, el chat dentro y las notificaciones autorizadas.

La mejor solución inmediata es preparar una invitación que se convierta en una instalación nueva que ya contenga el chat, sin aceptar primero la invitación en Safari.

Pantalla por pantalla
1. WhatsApp

1 toque

Recibe el mensaje de su contacto.

Texto del mensaje: «Te invito a GUARDIANA. Pulsa aquí para entrar al chat».

Acción: toca el enlace.

2. Safari: preparar la instalación

2 toques, como mínimo en la ruta propuesta

GUARDIANA muestra una única pantalla, con instrucciones visuales grandes:

«Vamos a instalar GUARDIANA con tu chat dentro».

«1. Pulsa Compartir. 2. Elige Añadir a pantalla de inicio».

La persona abre Compartir y selecciona «Añadir a pantalla de inicio». La etiqueta exacta puede variar según la versión de iOS y el idioma.

3. Confirmar instalación

1 toque

En la hoja de instalación, pulsa «Añadir».

La página debe conservar la invitación en la dirección y en start_url, como ya habéis probado.

4. Abrir GUARDIANA desde el nuevo icono

1 toque

La nueva app se abre con el chat preparado. Si la invitación aún no se ha aceptado, la app lo hace ahora, sin mostrar otra decisión innecesaria.

5. Activar notificaciones

1 toque en el permiso del sistema

Cuando la app esté lista, solicita permiso con una explicación breve:

«¿Quieres recibir avisos cuando te escriban?».

En el permiso de iOS, pulsa «Permitir».

Total orientativo: 6 toques, contando abrir el enlace, abrir Compartir, elegir «Añadir a pantalla de inicio», confirmar «Añadir», abrir el icono y permitir notificaciones. Puede haber más si iOS exige habilitar una opción adicional, si el menú cambia o si hay que recuperar la instalación tras un error.

Este es un flujo de instalación guiado, no una instalación silenciosa. iOS no permite que una página web instale por sí sola una PWA ni active las notificaciones sin intervención del usuario.

Cómo evitar que falle el caso A

No aceptar la invitación en Safari. Safari debe limitarse a preparar la instalación.

No crear un icono nuevo para alguien que ya tiene GUARDIANA. Este procedimiento es solo para una instalación nueva.

No borrar ni sustituir el secreto de invitación al construir la URL. La semilla debe mantenerse en el fragmento #i=…, sin enviarse al servidor.

No dar por hecho que se activaron las notificaciones. Pedir permiso solo desde la app instalada y tras un toque del usuario; comprobar después el resultado. Apple documenta Web Push para apps añadidas a la pantalla de inicio en iOS 16.4 o posterior. 
Apple Developer Documentation
+1

Si la app abre sin el chat, mostrar «Recuperar invitación» y una instrucción breve. No repetir automáticamente «Añadir a pantalla de inicio», porque puede crear otro icono.

El número de toques anterior es el mínimo previsto para ese recorrido, no una garantía para todos los iPhone.

2. Caso B: ya tiene GUARDIANA instalada

Aquí no hay que reinstalar, volver a añadir un icono ni utilizar Safari como puente. La persona debe poder entrar al chat desde su instalación actual.

Flujo recomendado
1. WhatsApp

1 toque

Toca el enlace de invitación. Safari se abre; es el comportamiento que habéis comprobado.

2. Safari: copiar invitación

1 toque

Una pantalla sencilla muestra un único botón principal:

«Pasar invitación a GUARDIANA»

Al tocarlo, copia la invitación completa al portapapeles. La página no acepta la invitación ni transmite la semilla.

3. Abrir la app existente

1 toque, más desbloqueo si hace falta

El texto de Safari dice: «Ahora abre GUARDIANA desde tu pantalla de inicio».

La persona vuelve a la pantalla de inicio y toca el icono que ya utiliza.

4. GUARDIANA: abrir invitación

1 toque, más confirmación de iOS si la solicita

La app muestra una pantalla con un botón grande:

«Abrir invitación»

Al tocarlo, lee el portapapeles y procesa la invitación. Si iOS pide permiso para pegar, el mensaje debe explicarse claramente: «Pulsa Pegar para abrir tu chat».

Total orientativo: 4 toques, contando abrir el enlace, copiar, abrir la app y pulsar «Abrir invitación». La confirmación de pegado puede añadir otro toque. Si no se puede leer el portapapeles, hay que ofrecer una alternativa manual.

Cómo simplificarlo todavía más

Al abrir la app, detectar si hay una invitación disponible y mostrar directamente «Tienes una invitación. Abrir chat», si se puede obtener de forma fiable.

No mostrar «Invitar», «Ya tengo GUARDIANA», «Instalar» y «Abrir invitación» como cuatro opciones equivalentes. En Safari debe haber una sola acción principal.

Si la invitación se procesa correctamente, llevar al usuario directamente al chat y mostrar una confirmación breve: «Ya puedes conversar».

Si la invitación ya se aceptó anteriormente, abrir el chat existente. No crear otro contacto ni otra conversación por accidente.

Límite importante: una página web no puede garantizar que el portapapeles esté disponible en segundo plano, ni puede abrir automáticamente la PWA existente con fiabilidad sin un mecanismo de enlace compatible. Con los hechos que habéis verificado, no contaría con que este paso se pueda eliminar por completo en iOS.

3. Evaluación de las alternativas

Los costes y plazos siguientes son estimaciones de planificación, no cotizaciones. Dependen del tamaño del equipo, la arquitectura actual, las pruebas de seguridad y la revisión de las tiendas.

A) Seguir con la PWA y afinar el flujo
Mejor opción inmediata

Coste: bajo a medio.

Plazo estimado: 2–7 días laborables para implementar y probar el flujo básico; más si requiere cambios arquitectónicos.

Ventajas

No requiere App Store ni Google Play.

Conserva el modelo de privacidad y el cifrado actual.

Android puede seguir usando los enlaces directos que ya funcionan.

Permite entregar el chat dentro de la nueva instalación de iPhone mediante el start_url personalizado, si se conserva correctamente.

Desventajas

En iPhone no existe un botón web que instale silenciosamente la PWA.

Las instalaciones tienen almacenamiento y permisos independientes; añadir otro icono no actualiza necesariamente el anterior.

Para quien ya tiene la PWA, el paso Safari → aplicación sigue siendo un obstáculo.

Las notificaciones requieren una app de pantalla de inicio y permiso explícito. 
Apple Developer Documentation
+2

¿Es fiable start_url con la invitación en iOS 17, 18 y 26?

Mi evaluación:

iOS 17: el uso de start_url está soportado, pero no puedo garantizar que todas las variantes de instalación y manifiesto conserven la invitación.

iOS 18: misma conclusión; no tengo una matriz de pruebas que permita asegurar cada versión menor.

iOS 26: el mecanismo sigue siendo razonable, pero hay que verificar el ajuste «Abrir como app web» y el comportamiento real de instalación.

El manifiesto define la dirección de inicio, pero no es una garantía de que el sistema conserve todo el estado de una invitación. 
MDN
+1

¿Manifiesto dinámico blob: o data:?

No lo sé con suficiente certeza para recomendarlo en producción. No he encontrado evidencia fiable que permita asegurar que Safari de todas esas versiones acepte de forma consistente manifiestos con esas URL y aplique el start_url como necesitáis.

Mi recomendación técnica es servir un manifiesto real por HTTPS, desde el mismo origen, y probarlo en dispositivos físicos. La URL del manifiesto debe cambiar por invitación si hace falta, pero la identidad de la aplicación debe permanecer estable para no multiplicar instalaciones.

B) Cambiar el enlace por un código corto
Muy sencillo para quien ya tiene la app

Coste: bajo a medio.

Plazo estimado: 3–10 días laborables para adaptar el protocolo, la interfaz y las pruebas de seguridad.

La invitación se convierte en un código de 9 cifras, con caducidad de 10 minutos y un solo uso, aprovechando el mecanismo que ya existe.

Flujo para alguien que ya tiene GUARDIANA:

Recibe el código por WhatsApp.

Abre GUARDIANA y pulsa «Introducir código».

Escribe las 9 cifras y pulsa «Abrir chat».

Tres acciones principales dentro de la app, sin pasar por Safari.

Ventajas

No requiere reinstalar.

Elimina el problema del almacenamiento separado.

Reduce los errores de copiar y pegar enlaces.

Aprovecha un mecanismo existente.

Desventajas

Nueve cifras pueden ser difíciles de transcribir y confundir.

Un código de 9 cifras tiene como máximo unos 30 bits de espacio si todas las combinaciones son válidas. La seguridad no debe depender solo de que sea difícil adivinarlo.

El servidor no debe recibir la semilla ni poder reconstruirla. El sobre cifrado, la derivación de claves, los límites de intentos y la protección contra repetición deben revisarse cuidadosamente.

Quien no tiene la app todavía debe instalarla y luego introducir el código; el código no elimina el paso de instalación en iPhone.

Mejora importante: usar grupos visuales 123 456 789, teclado numérico automático, pegado completo cuando el usuario lo autorice y mensajes de error concretos. No pedir que memorice el código.

C) App nativa mínima con Capacitor
La solución estructural más sólida

Coste: medio a alto.

Plazo estimado: 4–10 semanas para un primer lanzamiento multiplataforma bien probado; puede ser más.

Con un envoltorio nativo de Capacitor, GUARDIANA podría utilizar enlaces universales de iOS y App Links de Android. Si la app está instalada, el enlace puede abrir el chat directamente. Si no está instalada, se abre la web de destino. 
Capacitor Documentation
+1

Ventajas

Un enlace puede llevar directamente a la conversación cuando la aplicación está instalada.

Se puede integrar mejor con notificaciones, llamadas, cámara, contactos y funciones del sistema.

Reduce la dependencia del comportamiento de Safari y de los iconos duplicados.

Puede conservar el núcleo web y compartir buena parte del código existente.

Desventajas

Hay que mantener y distribuir dos aplicaciones, además de gestionar certificados, firmas, versiones y revisiones.

Una app nativa no elimina automáticamente los problemas criptográficos ni hace que una invitación sobreviva a la instalación.

Un envoltorio que solo muestre un sitio web puede tener problemas de aprobación: Apple exige una experiencia con utilidad suficiente y no garantiza la aceptación de una web empaquetada. 
Apple Developer
+1

El punto delicado: el enlace diferido

Los enlaces universales resuelven el caso de la app instalada. No garantizan por sí solos que la invitación se recupere después de instalarla desde la tienda.

Para el caso de app no instalada, GUARDIANA necesita un mecanismo adicional. Una opción es que el propio iPhone conserve localmente la invitación y la app la recupere tras instalarse, pero no se puede dar por supuesto que la tienda transfiera ese estado.

Un servicio de enlaces diferidos puede almacenar un identificador de referencia, pero no debe recibir la semilla. Si se necesita un secreto de 32 bytes, puede cifrarse para el destinatario o mantenerse en el dispositivo hasta que la app esté disponible. La solución debe diseñarse para no convertir el servidor de atribución en custodio del secreto.

La prueba de aceptación debe incluir: enlace recibido por WhatsApp, instalación desde cero, primer inicio, recuperación de la invitación y verificación de que ningún servidor ha recibido la semilla en claro.

D) Otras ideas: QR, App Clip y portapapeles automático

Idea

	

Ventaja

	

Límite real




QR de invitación

	

Evita errores al copiar enlaces si ambas personas están juntas.

	

No soluciona por sí solo la instalación ni las notificaciones.




App Clip de iOS

	

Puede ofrecer una experiencia ligera sin instalar la app completa.

	

Requiere desarrollo, configuración y distribución compatibles con Apple; no es un atajo inmediato. No asumir que conservará la invitación después de instalar la app completa.




Portapapeles automático

	

Puede reducir pasos al pasar de Safari a la PWA.

	

iOS controla el acceso al portapapeles; no se puede prometer lectura silenciosa y fiable en segundo plano.




Código de 9 cifras

	

Resuelve bien la entrada de nuevas invitaciones dentro de la app existente.

	

Añade transcripción manual y no elimina la instalación inicial.




Enlace universal nativo

	

Abre directamente la app instalada desde WhatsApp.

	

Requiere app nativa y un diseño aparte para instalaciones nuevas.

Mi preferencia es combinar el enlace personalizado para la primera instalación con el código de 9 cifras para los usuarios existentes. No usaría QR como solución principal: está pensado para personas físicamente cercanas, no para la invitación habitual por WhatsApp.

4. Condiciones de seguridad que no negociaría

Antes de automatizar el flujo, impondría estas cinco reglas:

La semilla de 32 bytes solo se procesa en el dispositivo; nunca se envía en claro al relé, a registros, analítica o servicios de enlaces.

El fragmento #i=… no se envía automáticamente en una petición HTTP ordinaria, pero hay que auditar el código para evitar que la aplicación lo transmita por otros medios.

Los códigos temporales son credenciales de acceso: tienen que estar limitados en tiempo, uso e intentos. Nueve cifras no constituyen por sí solas una garantía de seguridad.

Si la invitación falla, no se crea un chat vacío ni se instala otro icono como solución automática.

La app confirma claramente que la conversación está lista y distingue entre «chat abierto» y «notificaciones permitidas». Ninguna de las dos cosas implica la otra.

5. Decisión ejecutiva

Recomendación para hoy — sin App Store

Mantener la PWA: start_url personalizado para la primera instalación, manifiesto HTTPS estable y pruebas en iOS 17, 18 y 26.
Para quienes ya tienen GUARDIANA, habilitar el código de 9 cifras dentro de la app y eliminar decisiones innecesarias de la pantalla de invitación.
No prometer instalación automática ni notificaciones activadas sin permiso explícito.

Recomendación para el futuro

Desarrollar una app nativa mínima con Capacitor, enlaces universales y App Links, conservando el cifrado de extremo a extremo.
Diseñar por separado la recuperación segura de invitaciones tras instalar desde la tienda, sin entregar la semilla a ningún servidor.
Lanzar solo después de probar el recorrido completo en dispositivos reales y validar la experiencia con personas mayores.

