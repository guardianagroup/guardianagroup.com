# Ronda 41 · Gemini (4 Argon, «Alto», con búsqueda) · cómo cobrar

Chat: https://gemini.google.com/app/7839db1802e9a0f4

A) ALTA E IDENTIDAD

Al pagar en Dodo Payments, el checkout alojado pide obligatoriamente correo electrónico (para emitir recibos/facturas y dar acceso al Portal del Cliente) y país (más código postal solo donde el impuesto local lo exige, activando minimal_address: true en la sesión de checkout).

| Opción | Experiencia para no técnicos | Privacidad / Datos en GUARDIANA | Encaje con Dodo Payments |
|---|---|---|---|
| 1. Correo + código (OTP) | Excelente. Todo el mundo sabe leer un código de 6 dígitos en su correo. | Guardamos el correo (o su hash HMAC-SHA256) vinculado al estado de suscripción. | Natural. El mismo correo sirve para entrar a GUARDIANA y para el checkout/portal de Dodo. |
| 2. Passkeys (WebAuthn) + correo | Confusa entre dispositivos. Si crea la passkey en el móvil y abre el PC, se atasca o cae siempre en el correo de recuperación. | Igual que la 1 (al necesitar el correo de rescate, el dato existe igual). | Redundante. Añade fricción técnica sin ahorrar el correo que Dodo ya pide. |
| 3. Número tipo Mullvad | Peligrosa para no técnicos. Si pierden el número de 16 dígitos o limpian el navegador, pierden su dinero sin rescate posible. | Máxima. GUARDIANA no guarda ningún correo en su base de datos. | Con fricción. En Dodo igual tienen que poner su correo para la factura; se pasa el número en metadata. |
| 4. Híbrido (Correo con OTP + Passkey opcional) | Fluida. Entra con correo + código de 6 dígitos; un botón opcional permite activar huella/rostro en ese equipo. | Guardamos solo account_id, email_hash y fecha de vencimiento (el correo en claro vive en Dodo). | Directo. Nuestro servidor pasa metadata: { account_id } al crear la sesión de checkout en Dodo. |

Recomendación: Opción 1 evolucionable a 4 (correo + código de 6 dígitos, sin contraseñas). El número de Mullvad genera soporte constante por pérdidas de cuenta. Para minimizar datos, no guardamos el correo en texto plano: HMAC-SHA256(email_normalizado, secreto_servidor) para buscar la cuenta; el código se envía al correo en memoria y se descarta.

Frase de alta: «Escribe tu correo y te enviamos un código de 6 números para entrar. Sin contraseñas que recordar.»

B) PAGO Y DERECHO DE USO

Flujo: «Probar 7 días gratis» → nuestro servidor llama a POST /checkouts (product_id con trial_period_days: 7, minimal_address: true, return_url, metadata: { account_id }) → checkout alojado (checkout_url) → webhook subscription.active (o updated/renewed) → leemos metadata.account_id y anotamos valid_until = next_billing_date → la pasarela comprueba ahora < valid_until.

Guardar (mínimo): account_id (UUID), email_hash, dodo_subscription_id, dodo_customer_id, status (active, past_due, on_hold, cancelled) y valid_until. Nunca: tarjeta, CVV, nombre real, dirección postal ni IP de pago.

Impago: subscription.past_due (con past_due_ends_at: gracia, mantenemos el acceso); agotados los reintentos, subscription.on_hold: cortamos el acceso y botón al Portal de Dodo para actualizar tarjeta. Cancelación a mitad de mes: Allow Cancellation at Next Billing Date; subscription.cancelled con cancel_at_next_billing_date: true; conserva el derecho hasta valid_until. Reembolso: refund.succeeded o cancelación inmediata → valid_until = ahora. Cambio de tarjeta: enlace dinámico al Customer Portal (caduca en 24 h) o customer.dodopayments.com.

Prueba de 7 días: con tarjeta obligatoria (trial_payment_method_optional: false): regalar microVMs sin tarjeta atrae granjas de bots y mineros. Anti-abuso: prevención de pruebas repetidas de Dodo (Settings → Subscriptions; bloquea correos repetidos y alias con +).

C) PRIVACIDAD ENTRE EL PAGO Y LA NAVEGACIÓN

Fichas con firma ciega (RSA Blind Signatures / IETF Privacy Pass): el navegador genera un secreto t, lo ciega con r y lo manda al servidor de cuentas con su sesión; el servidor verifica valid_until > ahora y firma sin ver t; el navegador desciega y obtiene (t, firma); para abrir una microVM entrega (t, firma) a la pasarela, sin cookie de cuenta ni correo; la pasarela verifica con la clave pública y abre.

Límite de sesiones simultáneas sin identidad: 1 ficha ciega por ventana corta (hora) o credencial de ranura por día; la pasarela guarda en RAM los hashes de fichas activas; otra sesión con la misma ficha se rechaza o cierra la primera, sin saber de qué cuenta es.

Sí se puede prometer: «Nuestro sistema de cobros y nuestro navegador en la nube están separados matemáticamente: la máquina que abre tu navegador verifica un pase anónimo y no sabe cuál es tu correo ni tu factura.» No: anonimato frente a correlación de red o frente a nuestra propia infraestructura (la pasarela ve la IP del cliente; un único usuario a las 3:00).

Mullvad: números de cuenta y pago en efectivo/cripto, pero su servidor ve qué cuenta está conectada. Apple Private Relay: RSA blind signatures + doble salto. Tor: tres saltos, lento y con CAPTCHAs.

Fase 2, preparando la arquitectura desde el día 1: en fase 1, bases de datos separadas y un JWT de 1 hora con { entitlement: zero, slot_id: hash_rotativo_diario, exp } sin correo ni ID de Dodo; en fase 2, firma ciega RSA (@cloudflare/privacypass-ts o equivalente).

D) LÍMITES DE USO HONESTOS

1 sesión activa a la vez (si abres en el móvil, pasa al móvil); máximo de pestañas simultáneas (p. ej. 6); pausa por inactividad (15 min sin ratón, teclado ni audio: la microVM se destruye y un clic la despierta); descargas efímeras y tráfico humano (sin torrent, minería ni bots). Frase: «Usa ZERO todos los días del mes sin reloj ni límite de horas: tienes un navegador activo a la vez que se pausa solo cuando dejas de usarlo para ahorrar energía y vuelve al instante cuando regresas.»

E) LA WEB ESTÁTICA Y EL SERVIDOR DE CUENTAS

GitHub Pages: web pública en 42 idiomas, Radiografías, Órbita y la pantalla/visor de ZERO; cero secretos. Servidor propio (api.guardianagroup.com): un único servicio ligero: código de 6 dígitos por correo, checkout y enlaces al portal, receptor /webhooks/dodo, emisión de pases y pasarela de entrada. Un solo binario (Node/Fastify o Go) con SQLite (WAL) o PostgreSQL y dos tablas: accounts y processed_webhooks. Firma Standard Webhooks: cuerpo crudo, cabeceras webhook-id, webhook-timestamp y webhook-signature, secreto sin el prefijo whsec_ en base64, HMAC-SHA256("{id}.{timestamp}.{raw_body}") en tiempo constante; rechazar timestamps a más de 5 min; webhook-id como clave primaria (idempotencia). Logs sin IPs ni correos, rotados cada 24 h.

F) OBLIGACIONES (mapa, no asesoría)

Dodo (MoR): impuestos globales (IVA/VAT/GST/sales tax), factura al comprador y exenciones B2B, medios de pago y PCI-DSS, disputas, avisos de cobro. GUARDIANA: NIT, RUT y DIAN por las liquidaciones; términos y privacidad enlazados en la web y en el checkout; desistimiento UE/UK (informar de la prueba y la cancelación); Ley 1581 de 2012 y RGPD (finalidad del mínimo dato, canal de borrado, prohibición a menores).

G) VEREDICTO · 10 pasos

1 entra en la web y pulsa «Probar ZERO 7 días gratis»; 2 correo + código, account_id con hash HMAC; 3 el servidor pide a Dodo la sesión de checkout con 7 días, minimal_address y metadata account_id; 4 país y tarjeta en el checkout alojado (paga 0); 5 webhook firmado subscription.active; 6 verificación de firma e idempotencia, valid_until = fin de prueba; 7 «Navegar en ZERO»: pase efímero sin datos personales; 8 la pasarela levanta la microVM (1 activa por cuenta, pausa a los 15 min); 9 al día 7 Dodo cobra el mes, factura con impuestos y subscription.renewed; 10 «Mi suscripción» abre el portal de Dodo.

V1 (en cuanto salga el NIT): correo + código con hash; checkout de Dodo con prueba de 7 días con tarjeta, dirección mínima y prevención de pruebas repetidas; un microservicio para alta, webhooks y pases JWT sin datos personales; 1 sesión simultánea y suspensión a los 15 minutos. Fase 2: firmas ciegas; passkeys opcionales; pagos alternativos sin correo para usuarios avanzados.
