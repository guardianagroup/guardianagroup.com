# Ronda 77 · Claude · Red camuflada de GUARDIANA para Rusia, China y redes que cortan (30 Oct 2026)

Voz independiente. Los datos de proveedores, latencias y bloqueos vienen de una investigación hecha hoy; las fuentes están al final.

## 1. VPN general frente a GUARDIANA camuflada y puentes

**Recomendación: la opción 2.** Una VPN general obliga a responder del tráfico de terceros. Además:
- WireGuard y OpenVPN ya se detectan y se bloquean en Rusia;
- en Rusia y China las VPN no registradas están perseguidas;
- vigilaría la navegación de nuestros clientes, justo lo contrario de lo que vendemos.

La opción 2 solo transporta lo que ya va cifrado de extremo a extremo hacia nuestros propios servidores.

## 2. Diseño

- **Puentes sin abrir nada.** El puente ruso reenvía bytes (nginx stream: 443, 80 y 3478 udp/tcp). El TLS de ru.guardianagroup.com lo termina el servidor principal; el certificado se valida a través del 80 del puente. El puente no tiene certificado ni claves y no ve ni las salas. Es mejor que terminar TLS en Rusia, donde el proveedor está obligado a colaborar con las autoridades.
- **TURN.** El puente reenvía también el 3478: todo el audio y el vídeo del usuario ruso entra y sale por el puente. Riesgo sin confirmar: que el tramo puente→Núremberg también sufra el corte.
- **Un solo 443 en el servidor principal.** nginx stream con ssl_preread delante de Caddy: el SNI llamadas.guardianagroup.com va a coturn (TLS) y el resto a Caddy. El ACME de Caddy sigue funcionando en paso directo. Sirve para hoteles, empresas y países que solo dejan salir el 443.
- **Huella.** El TLS del TURN del navegador no se puede disfrazar desde JavaScript. Es TURN-TLS, no HTTPS: un DPI que lo busque lo encuentra. Rusia ya bloquea el ECH de Cloudflare, así que no cuento con él.
- **Último recurso (más adelante).** Audio y vídeo por nuestro propio WebSocket: se codifica en el equipo (WebCodecs), se cifra con las claves de la conversación y viaja como un WSS normal. Hay que medir el coste en batería y en latencia.
- **Detección.** Hoy la app usa la zona horaria rusa. Mejor una prueba real: bajar unos 64 KB del relé; si se queda clavada en unos 16 KB, cambiar al puente. Hay que guardar la ruta buena y volver a probar cada cierto tiempo.
- **Lista de puentes.** Firmada y dentro de la app, con rotación. Sin domain fronting: los grandes proveedores lo cerraron y Cloudflare está estrangulado en Rusia.
- **China.** No se promete. El Gran Cortafuegos filtra el WebRTC. La calidad solo se garantiza dentro de China continental, y eso exige licencia ICP; no lo haríamos.

## 3. Relé de Asia: Singapur

| Destino | Latencia media desde Singapur (WonderNetwork, 30-10-2026) |
|---|---|
| Bangkok, Yakarta, Manila y Ho Chi Minh | 13–29 ms |
| India | 32–72 ms |
| Tokio | 66 ms |
| Seúl | 84 ms |

Tokio queda como segundo nodo para Japón, Corea y el norte de China. Vultr Singapur cuesta 5–6 USD/mes, con 1–2 TB incluidos y 10 USD por cada TB extra. Igual que Miami, este relé sería solo para las llamadas: los mensajes siguen en el relé principal.

## 4. Proveedor ruso

- **Timeweb Cloud (Moscú).** Red rusa (AS9123), acepta tarjetas extranjeras y a los no residentes les cobra en tenge. Desde unos 1 920 ₽/mes en el plan visible. Es una empresa rusa, con identificación del cliente obligatoria (decreto de 2023), y el gobierno quiere endurecerla a Gosuslugi o biometría.
- **EDIS Global (Chipre, Moscú).** Admite N26 y PayPal, unos 5 €/mes. Pero sale por un tránsito que ya figura entre las redes restringidas: es probable que no sirva.
- **Descartados por sanciones:** Aeza, PQ.Hosting y HOSTKEY.
- Antes de operar en Rusia, consulta legal: la obligación de registrarse como organizador de difusión de información (ORI).

## 5. Al cliente

- **Sí:** «diseñada para funcionar en redes con restricciones; la disponibilidad depende del país y de los bloqueos vigentes».
- **No:** «imposible de bloquear», «funciona siempre en Rusia y China» ni «llamadas poscuánticas».

## Fuentes

- net4people/bbs #490 (corte de 16 KB, también UDP): https://github.com/net4people/bbs/issues/490
- Habr, redes restringidas (10-2-2026): https://habr.com/en/articles/997088
- Timeweb, pagos: https://timeweb.com/ru/docs/oplata-uslug/sposoby-oplaty-uslug-i-sroki-zachisleniya-platezhej/
- Timeweb, VDS: https://timeweb.cloud/services/vds-vps
- EDIS Moscú: https://www.edisglobal.com/vps-hosting/russia-moscow
- OFAC y Aeza: https://home.treasury.gov/news/press-releases/sb0185
- Vonage, el relé de China: https://developer.vonage.com/en/blog/china-relay-eol-build-your-own-relay-with-vonage-video-api
- WonderNetwork: https://wondernetwork.com/pings/Singapore
- Vultr, precios: https://www.vultr.com/pricing/
- Identificación de clientes de hosting en Rusia: https://www.securitylab.ru/news/544204.php
