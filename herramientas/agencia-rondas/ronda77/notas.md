# Ronda 77 · Red camuflada · notas de cierre (30 Oct 2026, 10:25)

Hay dos voces:
- Astra 6 (astra.md).
- Claude, con datos comprobados hoy (claude.md).

Pregunta: pregunta.md.

## Lo que confirman las dos voces

- **No hacer una VPN general.** La opción es la 2: solo el tráfico de GUARDIANA, por rutas alternativas y puentes. Una VPN general multiplica el riesgo legal, el abuso de terceros con nuestras IP, el mantenimiento y la vigilancia de la navegación del cliente.
- **Un solo 443** con nombres distintos y un multiplexor por SNI delante (nginx stream con ssl_preread o HAProxy), sin terminar TLS. El ALPN no sirve de criterio.
- **El TURN-TLS del navegador se distingue de HTTPS** y no se puede disfrazar desde JavaScript. ECH no es la solución.
- **Nada de domain fronting.**
- **Detección por transferencia sostenida**, no solo por conexión. La ruta buena se recuerda y se vuelve a probar.
- **Lista de puentes firmada** dentro de la app, con rotación. No publicar toda la reserva.
- **China no se promete.** China continental exige ICP: no se haría.
- **Asia: empezar por Singapur.** Tokio o Hong Kong, solo si las mediciones lo justifican.
- **Riesgo sin confirmar:** que el tramo puente→Núremberg también se corte.
- **Ni contenido ni claves en los puentes.**
- **Consulta legal antes de operar en Rusia** (Roskomnadzor y obligaciones como organizador de difusión de información, ORI).
- **Al cliente:** «diseñada para mejorar la disponibilidad en redes restrictivas; depende del país y de los bloqueos vigentes». Nunca «imposible de bloquear» ni «funciona siempre en Rusia y China».

## Diferencia entre las dos voces

- **Astra:** el puente web termina el TLS exterior y reenvía por un enlace cifrado.
- **Claude:** el puente solo pasa bytes, y el TLS lo termina el servidor principal (el puente no tiene certificado).
- **Se queda la de Claude:** en Rusia el proveedor está obligado a colaborar. La investigación de hoy dice lo mismo: «no termines TLS en Rusia».

## Decisiones pendientes del dueño

- **Proveedor ruso:**
  - Timeweb: tarjeta extranjera, red rusa y verificación de identidad. Unos 20 USD/mes.
  - EDIS: N26 o PayPal, unos 5 €/mes, probablemente estrangulado.
- **Visto bueno para dos cambios:**
  - el 443 compartido en el servidor principal (reinstalación del servidor y un registro DNS nuevo: llamadas.guardianagroup.com);
  - el relé de Singapur (unos 6 USD/mes).
