# Ronda 59 · Prueba gratis de 3 días y cobro: dónde va, quién ha pagado, VPN · cruce

27 Oct 2026, 14:35–15:00 (Bogotá). Voces: ChatGPT («Alta», con web; `chatgpt.md`, más la respuesta aparte con sus cuatro decisiones) y Gemini (Argon; `gemini.md`). Astra no se usó (con preguntas largas se queda sin tokens). Claude comprobó la documentación de Dodo y la sentencia del TJUE. Pregunta: `pregunta.md`.

## Lo que dicen las dos voces (se hace así)

1. **Gratis para siempre, sin cuenta:** portada, NÚCLEO, Órbita, Comunicaciones y Multas. **De pago: solo ZERO** (es lo único que gasta servidor), con su Radiografía, PDF y vídeo dentro.
2. **3 días**, que empiezan **la primera vez que se usa ZERO**, nunca al pulsar «Empezar» ni al entrar en NÚCLEO. 72 horas exactas, guardadas en el servidor.
3. **Sin tarjeta y sin cobro automático:** al acabar, ZERO se pausa y el resto de GUARDIANA sigue abierto; solo se paga si la persona entra en el checkout y lo autoriza.
4. **La única puerta es la entrada a ZERO.** Nada de muros en «Empezar», Órbita, Comunicaciones ni Multas.
5. **El navegador nunca decide quién ha pagado** (la web es pública y se puede tocar): lo decide el servidor con lo que dice Dodo; la vuelta a «gracias» no demuestra un pago. ZERO comprueba el derecho al abrir la sesión y cada pocos minutos; una sesión a la vez.
6. **VPN:** cambiar de VPN, borrar el navegador o abrir incógnito no sirve si la prueba va ligada al correo; con un correo nuevo sí se puede repetir. **No bloquear las VPN** (son nuestros clientes); normalizar el correo (alias «+»), límites suaves en las altas, una sesión a la vez, cierre por inactividad, prueba con recursos acotados y sin ruta Tor; aceptar un abuso residual antes que vigilar a los clientes.
7. **Leyes (mapa):** EE. UU., ROSCA (condiciones antes de pedir el pago, consentimiento expreso, cancelar fácil) y California (cancelar en línea); UE, 14 días; Brasil, 7 (CDC art. 49); Colombia, 5 días hábiles (Ley 1480, art. 47), con excepción para servicios que ya empezaron con acuerdo de la persona.

## Los sitios concretos (las dos voces; frases a pulir)

| Sitio | Qué aparece |
|---|---|
| Portada y «Empezar» | Nada de pago ni correo. Como mucho, una línea discreta (ChatGPT: «Explora gratis. Prueba ZERO 3 días sin tarjeta»; Gemini: «Entrada libre. Sin registro.»). |
| NÚCLEO, tarjeta ZERO | «3 días gratis, sin tarjeta · Después, desde 4,99 US$/mes». Las otras tres tarjetas, sin precio (ChatGPT añadiría «Gratis»). |
| NÚCLEO, arriba a la derecha | Junto a «Multas», «Mi plan» o «Precios / Mi cuenta» con el estado («Prueba: quedan 2 días», «Plus activo»). Gemini lo pone ahí; ChatGPT, como enlace discreto. |
| Entrada a ZERO | La única puerta: qué es ZERO, «3 días gratis, sin tarjeta, sin cobros automáticos», el precio de después, y el acceso. |
| Dentro de ZERO | Una pastilla pequeña: «Prueba · quedan 2 días» (ámbar el último día); al pulsarla, la fecha exacta y «Ver planes». Para quien paga, nada. |
| Fin de la prueba | No abre ZERO: «Tus 3 días han terminado. ZERO está en pausa. Órbita, Comunicaciones y NÚCLEO siguen gratis» + Plus mensual, Plus anual (y Fundador, si se decide) + «Volver a NÚCLEO». |
| NÚCLEO cuando preguntan el precio | Qué es gratis, qué cuesta ZERO y por qué (un ordenador aislado para ti en nuestros servidores; no vendemos tus datos). |
| Página de precios (`/precios/`) | Gratis para siempre frente a Plus; impuestos incluidos; cómo se cancela. |
| Checkout | El de Dodo (alojado), creado para esa persona. |
| Gracias (`/gracias/`) | «Estamos confirmando el pago…» y, cuando el servidor lo confirma, «ZERO ya está activo» + «Abrir ZERO». |
| Gestionar o cancelar | El portal del cliente de Dodo, desde «Mi plan». |
| Términos y privacidad | Condiciones de la prueba y de la suscripción, renovación, cancelación, desistimiento o retracto, Dodo como merchant of record. |
| Avisos | En pantalla dentro de ZERO el último día; por correo (ChatGPT: al empezar, 24 h antes y al acabar; Gemini: uno a las 48 h). |
| Comunicaciones y Multas | Sin ofertas ni bloqueos (Gemini admite una línea suave al pie de Multas). |

## Comprobado por Claude (documentación de Dodo, 27 Oct 2026)

- **Prueba sin tarjeta:** casilla «Start the trial without a card» (`trial_payment_method_optional`): la suscripción se crea y se activa al momento sin medio de pago; Dodo manda un recordatorio antes del cobro; si no se añade tarjeta, al acabar pasa a `on_hold` y la persona recibe un correo; al añadirla, se reactiva. (docs.dodopayments.com/features/subscription)
- **Prevent Trial Misuse:** en Settings → Subscriptions, apagado por defecto; compara correos normalizados y quita los alias «+»; la prueba cuenta desde que se activa (cancelar el mismo día ya la gasta); **pasar `trial_period_days` en el checkout se salta la comprobación**. **No dice nada de tarjetas:** lo de Gemini («la huella de la tarjeta impide dos pruebas») no está en la documentación y no se usa.
- **Claves de licencia:** se emiten con `subscription.active` (una por asiento); para suscripciones, «sin caducidad» y **su validez sigue a la suscripción**: en `on_hold`, desactivadas (vuelven al salir); canceladas o caducadas, desactivadas para siempre; en `past_due`, activas durante la gracia. El endpoint de validar es **público** (sin clave secreta) y devuelve `valid: true` si la clave está activa. (docs.dodopayments.com/es/features/license-keys; api-reference/licenses/validate-license). Falta comprobar en modo de prueba que una prueba sin tarjeta también emite la clave.
- **TJUE C-565/22 (Sofatutor, 5 oct 2023):** en una suscripción que empieza con prueba gratis, el desistimiento nace **una sola vez**, siempre que al contratar se dijera de forma clara que después se paga (curia.europa.eu, comunicado 154/23). La sentencia C-234/25 que cita ChatGPT no se ha comprobado y no se usa.

## Donde discrepan

- **Fundador (49 US$, pago único):** Gemini lo enseña desde el primer día como acceso «de por vida»; ChatGPT, no venderlo hasta definir duración, derechos y límites (un pago único no paga servidor para siempre). Lo decide el dueño; propuesta de Claude: definirlo antes de enseñarlo.
- **Límites de la prueba:** Gemini propone 25 min por sesión y 60 al día; ChatGPT, medir primero el coste real. Las dos: una sesión, cierre por inactividad y sin Tor en la prueba.
- **Anti-robots:** Gemini, prueba de trabajo en el navegador (sin terceros); ChatGPT, CAPTCHA solo ante riesgo. Las dos: nunca reCAPTCHA ni rastreadores en nuestra puerta.
- **Correos desechables:** Gemini los bloquea solo para la prueba; ChatGPT, evaluarlos sin bloqueo universal.

## Propuesta de Claude al dueño

1. Estrategia: la de las dos voces (gratis todo menos ZERO; 3 días desde el primer uso de ZERO; sin tarjeta ni cobro automático; ZERO en pausa al acabar).
2. **Cómo saber quién ha pagado, dos caminos:**
   - **Rápido (sin servidor de cuentas):** la prueba es una suscripción de Dodo de 3 días sin tarjeta con «Prevent Trial Misuse» encendido. Al entrar en ZERO, la persona activa la prueba en el checkout de Dodo (correo y país, sin tarjeta); Dodo le da un **pase** (la clave de licencia) que ZERO guarda; el motor lo valida con Dodo al abrir cada sesión y cada pocos minutos. Si no paga, Dodo lo apaga solo; si paga, se enciende otra vez. Dodo manda los avisos, los recibos y el portal para cancelar. El motor ve un pase, no el correo. Antes, probar en modo de prueba que la prueba sin tarjeta emite el pase.
   - **Completo (cuentas propias):** `api.guardianagroup.com` con correo + código, la prueba en nuestra base, webhooks de Dodo. Más trabajo, todo dentro de la web.
3. VPN: no se bloquean; la prueba va con el correo (Dodo junta los alias «+»); una sesión por pase, cierre por inactividad, sin Tor ni ULTRA en la prueba.
4. Nada se cobra ni se enseña con enlaces de pago hasta el NIT (regla del dueño); se puede montar todo en modo de prueba de Dodo.
5. ChatGPT vuelve a recomendar pedir a Dodo confirmación escrita de que acepta ZERO (ronda 41); el dueño dijo entonces que Dodo ya funciona.
