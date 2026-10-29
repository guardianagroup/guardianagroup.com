# Ronda 72 · Astra 6 (gpt-6-astra, Cheaper Inference, 4.096 tokens) · 29 Oct 2026, 18:30

Texto entre «ASSISTANT OUTPUT» y «Response headers», sin claves.

1. Sin GUARDIANA: el recorrido mínimo de instalación

No se puede conseguir todo en un toque con esta PWA en iPhone. Safari no puede instalarla ni autorizar notificaciones automáticamente. Tampoco puede saber con fiabilidad si ya existe otro icono.

La invitación debe mostrar directamente las instrucciones, sin un botón previo «Instalar» que solo añada otro toque. No aceptar el chat en Safari.

Recorrido corto, usando el mecanismo que habéis comprobado:

| Paso | Lo que hace la persona | Toques |
|---|---|---:|
| 1 | Toca el enlace de WhatsApp | 1 |
| 2 | En Safari toca Compartir | 1 |
| 3 | Toca Agregar a Inicio | 1 |
| 4 | Confirma Agregar | 1 |
| 5 | Va a Inicio y toca GUARDIANA | 1 |
| 6 | Ya dentro del chat, toca Activar avisos de mensajes | 1 |
| 7 | En el permiso de iOS toca Permitir | 1 |

Total base: 7 toques, más el gesto para ir a Inicio. No es un mínimo universal certificado: puede haber menús adicionales, desplazamiento o diferencias de texto según versión e idioma. Si alguna versión abre automáticamente la nueva app, desaparece el toque del icono; no lo doy por supuesto.

Automatizar: al arrancar, guardar la invitación, incorporar el chat y mostrarlo. El permiso de notificaciones viene después; denegarlo no debe impedir conversar.

Puede fallar: instalación que no conserva la invitación, icono duplicado si ya tenía uno, almacenamiento no persistido, permiso denegado o avisos silenciados por ajustes/Concentración. Web Push requiere una app de Inicio y una versión compatible —iOS 16.4 o posterior—; tener permiso no garantiza entrega ni sonido.

2. Con GUARDIANA instalada: copiar, abrir y pegar

En la misma página de Safari, debajo de las instrucciones:

«¿Ya tienes el icono? No vuelvas a agregarlo.»

| Paso | Lo que hace la persona | Toques |
|---|---|---:|
| 1 | Toca el enlace de WhatsApp | 1 |
| 2 | Toca Ya tengo GUARDIANA: copiar invitación | 1 |
| 3 | Va a Inicio y toca su icono GUARDIANA | 1 |
| 4 | Toca Abrir invitación | 1 |
| 5 | Confirma Pegar, cuando iOS lo solicite | 1 |

Total base: 5 toques, más salir a Inicio. Si no aparece la confirmación de pegado, serían 4.

Después de copiar, mostrar: «Invitación copiada. Abre tu icono GUARDIANA y toca “Abrir invitación”.»

Ese botón debe leer el portapapeles mediante la acción del usuario, validar la invitación y abrir el chat, sin otra confirmación propia.

Puede fallar: portapapeles sobrescrito, pegado rechazado, apertura de otro icono duplicado o lectura no disponible en esa combinación de iOS y contexto. Ofrecer Introducir código como recuperación.

No prometer apertura automática de la PWA desde Safari. Las siguientes conversaciones quedan en Mis chats: no se repite este recorrido.

3. A — Afinar la PWA

El resultado probado esta tarde valida esos teléfonos y versiones, no todos los iOS 17, 18 y 26. No sé si vuestro start_url con invitación se conserva correctamente en todas sus versiones. No sé si Safari respeta un manifiesto blob: o data: durante instalación y arranque en cada una.

Hay que probar ambas cosas explícitamente, también al cerrar y reabrir.

Seguridad imprescindible: ?inv=… no puede contener la semilla ni una codificación reversible de ella: la consulta sí llega al servidor. El fragmento no se envía en la petición HTTP, pero vuestro código puede filtrarlo mediante telemetría. Un manifiesto servido por el servidor tampoco puede contener la semilla en claro. Tras importarla, limpiar la URL y evitar reimportaciones en arranques posteriores.

4. B — Código de nueve cifras

Es más fácil de explicar: «Abre GUARDIANA → Introducir código → escribe estas nueve cifras → Entrar».

Con entrada automática al completar las cifras: 11 toques base —icono, botón y nueve dígitos—, sin contar navegación. Con Entrar, 12. Evita portapapeles y reinstalaciones, pero exige recordar o alternar pantallas.

Reutilizar el sistema existente, revisando su seguridad: nueve cifras aportan aproximadamente 30 bits. PBKDF2, caducidad y uso único no eliminan el riesgo de adivinación, especialmente fuera de línea.

5. C — Nativa mínima con Capacitor

Con app instalada, enlaces universales/App Links permiten acercarse a un toque, condicionado por configuración, navegador y decisiones previas del usuario. Validar que el fragmento llegue intacto.

Sin instalar, el enlace diferido no es automático por usar Capacitor. No conozco un mecanismo general que atraviese ambas tiendas conservando ese secreto, sin otra transferencia. Alternativa clara: instalar y volver al enlace original de WhatsApp. No entregar la semilla a proveedores de atribución.

6. D — Mejor arquitectura futura

Un buzón público de invitaciones por instalación, con clave pública compartible: el remitente deposita la invitación cifrada para esa clave; la app la recibe sin importar enlaces. No requiere teléfono ni correo. Exige conocer previamente ese buzón, protección contra abuso y recuperación; no arregla una invitación ya recibida.

7. Recomendación para hoy — sin App Store

Mantener PWA: instalación guiada solo en combinaciones verificadas; nunca aceptar en Safari.  
Para instalados, un botón que copie y otro que pegue y abra; código como respaldo.  
No pedir reinstalar ni prometer un paso: medir el recorrido completo en cada iOS admitido.

8. Recomendación para el futuro

App nativa mínima con enlaces universales y notificaciones nativas.  
Para primera instalación, volver al enlace de WhatsApp; no prometer enlace diferido secreto.  
Añadir buzón cifrado para eliminar importaciones cuando ya se conoce al destinatario.
