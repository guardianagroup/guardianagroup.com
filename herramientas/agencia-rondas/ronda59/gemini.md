# Ronda 59 · Gemini (Argon) · prueba de 3 días, sitios del cobro, quién ha pagado, VPN

Chat: https://gemini.google.com/app/95f40eaa6f1589cd (texto completo allí; aquí lo esencial, fiel)

## A) Estrategia
- Gratis para siempre y sin cuenta: portada, NÚCLEO, Órbita, Multas, Comunicaciones («embudo de confianza y viralidad»). De pago: **ZERO** tras 3 días gratis.
- La prueba empieza **al abrir ZERO por primera vez**, nunca en «Empezar» ni en NÚCLEO. 72 horas exactas con contador; inconveniente: quien empieza un viernes y vuelve el lunes la pierde.
- **Opción A (recomendada): sin tarjeta**, solo correo + código, y ZERO se pausa al tercer día; nunca se cobra sin pasar por el checkout. **Opción B**: tarjeta en Dodo desde el principio y cobro automático: frena el abuso, pero pide tarjeta antes de ver ZERO. Pasar a B solo si el gasto de servidor sube.

## B) Sitios concretos
- Portada y «Empezar»: sin correo ni precios; debajo: «Entrada libre. Sin registro.»
- Tarjetas de Órbita, Comunicaciones y «Habla con NÚCLEO»: sin etiquetas. **Tarjeta ZERO: «3 días de prueba gratis · Luego desde 4,99 US$/mes».**
- **Arriba a la derecha en NÚCLEO, junto a «Multas»: «Precios / Mi cuenta»** (sin sesión: planes y acceso; con sesión: «Prueba: quedan 2 días» o «Plan Plus activo»).
- **Entrada a ZERO, el único punto de control**: «ZERO abre un navegador blindado en nuestros servidores solo para ti. Escribe tu correo para activar tus 3 días gratis (sin tarjeta).» + «¿Ya tienes cuenta o clave de licencia? Entrar».
- Dentro de ZERO: «Prueba gratis: quedan 2 d 14 h · Pasar a Plus»; con menos de 24 h, en ámbar: «Tu prueba termina hoy». Clientes: nada de contador ni publicidad.
- Fin de prueba: no abre el Chromium; «Tus 3 días de prueba en ZERO han terminado. Órbita, Comunicaciones y NÚCLEO siguen siendo gratis para siempre…» + Plus mensual, Plus anual, Fundador + «Volver a NÚCLEO».
- NÚCLEO (precio): «Todo lo que corre en tu propio equipo… es gratis siempre. Solo cobramos por ZERO después de 3 días de prueba, porque cada sesión enciende un ordenador privado para ti en nuestros servidores y no vendemos tus datos para pagarlo…».
- Comunicaciones y Multas: sin muros ni avisos intrusivos; en el pie de Multas, como mucho: «¿Quieres evitar que te rastreen así? Prueba el navegador ZERO 3 días gratis.»
- Precios (`/precios` o ventana en NÚCLEO): «Gratis para siempre» frente a «Plus / Fundador»; «Impuestos incluidos. Cancela en dos clics desde tu portal sin hablar con nadie.»
- Checkout alojado de Dodo con el correo y el `account_id` en metadatos; `/gracias` («Pago confirmado. Tu acceso a ZERO ya está activo…» + «Abrir ZERO ahora»); «Mi cuenta» abre el portal del cliente de Dodo; términos y privacidad con las condiciones de la prueba y Dodo como merchant of record.
- Avisos (sin tarjeta): en pantalla con menos de 24 h y un correo opcional a las 48 h. (Con tarjeta: correo obligatorio 24 h antes del cobro.)

## C) Quién ha pagado
- Correo + código de 6 cifras (10 min) → token firmado; en otro equipo, el mismo correo recupera el estado, «porque la verdad está en la base de datos de api.guardianagroup.com, no en su navegador». Alternativa: pegar la clave de licencia de Dodo y validarla con `/licenses/validate`.
- Estados: trial_active (72 h), trial_expired, active (webhook `subscription.active`/`renewed`/`payment.succeeded` → `paid_until`), lifetime (Fundador), cancelled (acceso hasta `paid_until`), past_due/expired (corte; también reembolso o disputa). Webhooks firmados (Standard Webhooks).
- ZERO lo comprueba al abrir cada sesión (no arranca el Chromium si no hay derecho) y cada 10 minutos; una sesión simultánea por cuenta.
- Guardar: id, correo normalizado (o su HMAC), estado, fechas, ids de Dodo. Nunca: contraseñas, tarjetas, dirección, historial de navegación.

## D) VPN y trampas
- Cambiar de VPN y usar incógnito no basta, porque el estado depende del correo; hace falta un correo nuevo.
- No: bloquear VPN («dispararte en el pie»), cookies o huella del navegador, CAPTCHA de Google o Cloudflare (rastreadores de terceros en nuestra puerta).
- Sí: normalizar el correo (alias «+», puntos de Gmail), bloquear dominios desechables solo para la prueba, **prueba de trabajo local** (2–3 s de cálculo) antes de mandar el código, límite suave de altas por IP de salida.
- Que no compense: una sesión a la vez; en la prueba, sesiones de 20–30 min con tope diario de 45–60 min y cierre a los 3 min de inactividad (propuesta, no medida). Válvula: prueba con tarjeta en Dodo («la huella de la tarjeta impide dos pruebas»: **no lo dice la documentación de Dodo**, ver notas).
- Abuso residual aceptable: quien crea un correo nuevo cada 3 días nunca iba a pagar.

## E) Leyes (mapa)
- UE: 14 días (Directiva 2011/83/UE, modificada por la 2019/2161); **TJUE C-565/22 Sofatutor (5 oct 2023)**: con prueba gratis bien informada, el desistimiento nace una sola vez. España: TRLGDCU.
- EE. UU.: ROSCA (15 U.S.C. §§ 8401–8405) y California ARL (Bus. & Prof. Code §§ 17600–17606). (Habla de «click-to-cancel» como exigencia: la regla federal fue anulada; California sí exige cancelar en línea.)
- Brasil: CDC art. 49 (7 días). Colombia: Ley 1480 art. 47 (5 días hábiles; excepción para servicios empezados con acuerdo); no cobrar hasta tener NIT y cuenta bancaria.

## F) Veredicto
Fase 1 (mientras llega el NIT): api.guardianagroup.com (correo + código, normalización, lista de desechables), ventana de correo al abrir ZERO, contador dentro de ZERO, límites de prueba en el motor. Fase 2 (con NIT): webhooks de Dodo, botones de fin de prueba y «Precios / Mi cuenta» con el checkout y el portal.
Decisiones del dueño: 1) sin tarjeta (recomendado) o con tarjeta; 2) límite diario de ZERO en la prueba (propone 25 min por sesión y 60 al día); 3) «Fundador 49 US$» visible desde el primer día (recomienda sí).
