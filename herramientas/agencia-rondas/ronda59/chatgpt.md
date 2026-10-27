# Ronda 59 · ChatGPT («Alta», con búsqueda web) · prueba de 3 días, sitios del cobro, quién ha pagado, VPN

Chat: https://chatgpt.com/c/6ae0fd6e-7bc8-83e9-a5ec-9cd79b240965 (texto completo allí; aquí lo esencial, fiel)

## A) Estrategia
- Gratis y sin cuenta: portada, NÚCLEO, Órbita, Comunicaciones, Multas. De pago: **ZERO** (3 días gratis; después Plus), con la Radiografía, el PDF y el vídeo dentro, sujetos a uso razonable. «Gestión de suscripción: siempre accesible».
- **3 días para el lanzamiento** (ZERO necesita un servidor por sesión y no hay datos propios de conversión: «la elección es operativa, no una promesa estadística»). Más adelante, comparar cohortes de 3 y 7 días.
- **El reloj empieza en el primer uso efectivo de ZERO, nunca al entrar en NÚCLEO** («Iniciar mis 3 días» tras verificar el correo; si hay un error técnico antes de habilitarlo, no se consume). Fechas en el servidor, en UTC; borrar cookies o cambiar de VPN no cambia la fecha.
- **Sin tarjeta y sin cobro automático**: al caducar, ZERO se pausa y la persona elige plan y autoriza el pago. Dodo permite pruebas sin tarjeta (`trial_payment_method_optional`; al final pasa a `on_hold`), pero propone que la prueba la lleve GUARDIANA y la suscripción Dodo («nadie tiene una renovación pendiente por haber probado ZERO»).
- Condición previa: pedir a Dodo confirmación escrita de que acepta ZERO (su política excluye VPN, infraestructura y proxys); hasta el NIT y esa confirmación, todo en modo de pruebas.

## B) Sitios concretos (frases propuestas)
1. Portada: «Empezar» igual; debajo, discreto: «Explora gratis. Prueba ZERO 3 días sin tarjeta».
2. Entrada a NÚCLEO: sin formulario ni pago.
3. Tarjeta ZERO: «Prueba ZERO 3 días gratis, sin tarjeta. Después, desde 4,99 US$/mes». Órbita, Comunicaciones y «Habla con NÚCLEO»: «Gratis».
4. Entrada a ZERO: «3 días gratis, sin tarjeta. Sin cobros automáticos» + «Iniciar prueba»; precio y condiciones visibles antes del correo.
5. Verificación: «Introduce tu correo. Te enviaremos un código para activar tus 3 días».
6. Dentro de ZERO: «Prueba · 2 días restantes»; al pulsarlo, fecha exacta y «Ver planes».
7. A punto de caducar: «Tu prueba termina mañana…». Terminada: «Tus 3 días han terminado. ZERO está pausado. Activa Plus para seguir navegando. GUARDIANA sigue abierta para ti».
8. NÚCLEO (precio): «ZERO cuesta 4,99 US$/mes, 47,90 US$/año o 49 US$ con el plan Fundador… Órbita, Comunicaciones y NÚCLEO son gratis».
9. Precios (`/precios/`), checkout de Dodo, gracias (`/pago/resultado/`: «Estamos confirmando el pago…» y después «ZERO ya está activo»), cuenta (`/cuenta/`: plan, próxima fecha, facturas, método de pago, cancelación), términos y privacidad.
10. Comunicaciones y Multas: sin ofertas ni bloqueos; solo un enlace discreto a «Planes» en la navegación.
- Ojo con «Fundador»: por 49 US$ no prometer navegación ilimitada de por vida sin calcular el coste: definir duración, alcance y límites.
- Avisos: correo al empezar («termina el [fecha]; no se hará ningún cargo»), aviso y correo 24 h antes, y correo y pantalla al caducar. Fechas en la zona horaria de la persona.

## C) Quién ha pagado
- Identidad mínima: **correo verificado + código de 6 cifras** → `user_id` interno; sesión con cookie Secure/HttpOnly; en otro equipo, el mismo correo recupera el plan. Passkey después. La clave de licencia de Dodo «no la utilizaría como contraseña ni como única prueba de identidad».
- Dos registros: GUARDIANA (prueba, fechas, acceso) y Dodo (pago, renovación, cancelación), unidos solo en el servidor. **El navegador no decide quién ha pagado; la redirección a «Gracias» no demuestra un pago**: el webhook firmado sí (deduplicar, tolerar desorden, consultar la API ante dudas).
- Estados: free, trial, trial_expired, payment_pending, paid, past_due, on_hold, cancel_scheduled, cancelled/expired, refunded/revoked.
- ZERO comprueba el derecho antes de crear la celda, al aceptar el WebSocket, periódicamente (p. ej. cada minuto) y al recibir cambios; nadie debe poder abrir celdas saltándose la web.
- Guardar lo mínimo (id, correo, fechas, plan, ids de Dodo, registros técnicos limitados); nunca historial, chats, archivos, Radiografías ni datos de tarjeta.

## D) VPN y trampas
- «Una VPN por sí sola no permite repetir la prueba si está asociada a una cuenta»; con otro correo sí se puede: el objetivo es que el abuso cueste, no identificar a cada persona.
- No sirven: IP, VPN/Tor (nunca bloquear por sí solos), cookies, huella del navegador. Sirven: correo verificado (mínimo), normalizar alias «+», límites suaves por red y por envío de códigos, CAPTCHA solo ante riesgo; correos desechables: evaluar sin bloqueo universal; prueba de trabajo: no priorizar.
- Dodo «Prevent Trial Misuse» (Settings → Subscriptions): correos normalizados sin alias «+»; pasar `trial_period_days` en el checkout se salta la comprobación; solo protege si la prueba la gestiona Dodo.
- Que no compense: una prueba por cuenta, una celda a la vez, cierre por inactividad, presupuesto de recursos medido, sin ruta Tor en la prueba (anunciándolo), límites a altas y códigos, cola si se agota la capacidad. Aceptar abuso residual antes que vigilar a los clientes.

## E) Leyes (mapa)
- UE: Directiva 2011/83/UE, 14 días; el inicio inmediato no extingue por sí solo el derecho en servicios; cita una sentencia del TJUE de 9 jul 2026 (C-234/25) sin comprobar.
- EE. UU.: ROSCA (15 U.S.C. § 8403): condiciones antes de pedir el pago, consentimiento expreso, cancelar fácil. La regla «Click-to-Cancel» de la FTC fue anulada. California (ARL, reforzada desde el 1 jul 2025): consentimiento, cancelación en línea, recordatorios.
- Brasil: CDC art. 49 (7 días) y Decreto 7.962/2013 (desistir por la misma vía). Colombia: Ley 1480, art. 47 (retracto de 5 días hábiles; excepción para servicios ya empezados con acuerdo del consumidor).

## F) Veredicto
Diez pasos (explorar gratis → ZERO con su pantalla → correo → empieza la prueba → aviso → pausa → checkout → webhook → cliente). Fases: 1) servidor mínimo de cuentas; 2) pasarela de ZERO (autorización, una sesión, inactividad, caducidad); 3) Dodo en modo de pruebas; 4) pantallas y correos; 5) pruebas (VPN, impago, reembolso, webhook duplicado, acceso directo al motor). «Cuatro decisiones del dueño»: no las listó (se le pidió aparte).
