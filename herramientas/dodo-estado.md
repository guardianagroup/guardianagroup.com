# Dodo Payments · lo que hay dentro (visto el 26 Oct 2026, 01:20 Bogotá; sin tocar nada)

El dueño abrió el panel de Dodo en el navegador integrado para que se vea lo que ya existe y se acople a la web. Aquí solo
hay datos del producto; nada de clientes, nombres, correos, tarjetas ni claves (regla de siempre).

## Cuenta

- Verificación completa: **pagos en vivo activos** (información del producto, identidad y banco: aprobados). Verificada como particular.
- Marca principal: «guardiana group». Moneda de los productos: USD, **impuestos incluidos** en el precio.
- Categoría fiscal de los productos: SaaS.
- Los productos vienen importados del modo de prueba (metadato `source_product_id`).

## Productos activos (la página de pago la aloja Dodo)

| Producto | ID | Precio | Tipo | Enlace de pago |
| --- | --- | --- | --- | --- |
| GUARDIANA Plus · Mensual | `pdt_0NnxPZGJy7PYHrGx1oBki` | 4,99 $ al mes | suscripción | `https://checkout.dodopayments.com/buy/pdt_0NnxPZGJy7PYHrGx1oBki?quantity=1` |
| GUARDIANA Plus · Anual | `pdt_0NnxPZ40xI6mR2MOoaAMt` | 47,90 $ al año | suscripción | `https://checkout.dodopayments.com/buy/pdt_0NnxPZ40xI6mR2MOoaAMt?quantity=1` |
| GUARDIANA Fundador | `pdt_0NnxfRzo4H78OnLGFOS2H` | 49 $ | pago único | `https://checkout.dodopayments.com/buy/pdt_0NnxfRzo4H78OnLGFOS2H?quantity=1` |

- El enlace admite `redirect_url=` (a dónde vuelve la persona después de pagar): hay que ponerle una página nuestra de
  «gracias» cuando se acople (p. ej. `https://guardianagroup.com/gracias/`), y el cuadro «Compartir» del panel genera
  también enlace acortado y código QR.
- Mensual: **precio localizado por país** (50 países: CR, EC, AR y 47 más; en Colombia la página cobró 2,49 $), sin
  paridad de poder adquisitivo automática, **sin periodo de prueba** (el campo está desactivado), sin descuento por defecto,
  sin «tarjeta opcional con precio 0». Entrega un **derecho «GUARDIANA Plus» = clave de licencia** en cada compra
  (los pagos de prueba del dueño muestran «Has License Key: Yes»).
- Descripción actual del producto (ES/EN/PT) habla del programa antiguo («Tu IA habla con servicios que tú no ves…»):
  cuando ZERO sea lo que se vende, la descripción y la «información del producto» de la verificación tendrán que decir
  «navegador en la nube» (lo decide el dueño; la política de aceptación de Dodo está anotada en ronda 41).

## Ajustes de suscripción (panel → Ajustes → Suscripciones)

- Varias suscripciones por cliente: sí. Prevención de pruebas repetidas: **no** (irrelevante mientras no haya prueba).
- Cambios de plan desde el portal: no. Cancelación inmediata: sí. Cancelación al final del periodo pagado: sí.
- Descuento al cancelar: no (10 % configurado pero apagado). Pausar: no. Recordatorio de método de pago: 3 días antes.

## Lo que no hay todavía

- **Webhooks: ningún endpoint.** Sin ellos la web no puede saber quién tiene derecho de uso; la primera versión del cobro
  (ronda 41) los necesita en `api.guardianagroup.com` (firma Standard Webhooks, idempotencia por `webhook-id`).
- Otra vía sin servidor propio, que encaja con lo que ya está configurado: **la clave de licencia**. Dodo la entrega al
  pagar y ofrece activar/validar claves por API; ZERO podría pedir la clave una vez y comprobarla contra Dodo desde
  nuestra pasarela (hay que confirmar en la documentación qué llamadas no exigen la clave secreta y cuántas
  activaciones permite cada clave). Lo decide el dueño mañana, cuando abra «los dos payments».

## Reglas que siguen en pie

- Hoy no se cobra nada ni hay enlaces de pago en la web hasta el NIT (regla del dueño). Los enlaces de arriba son para
  cuando lo diga.
- Nunca copiar claves de API ni el secreto de los webhooks en ningún archivo ni chat.
