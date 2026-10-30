Ronda 77 · GUARDIANA Comunicaciones · Que funcione en Rusia, China y cualquier red que corte (30 Oct 2026, 10:05). Máximo razonamiento. Responde en español, como máximo 1.800 palabras.

Eres parte de la agencia de GUARDIANA (GUARDIANA GROUP S.A.S., Cartagena, Colombia). GUARDIANA Comunicaciones es una app web (PWA) de chat, archivos y llamadas de voz y vídeo cifrados de extremo a extremo, para profesionales y personas con información sensible. Nada de cuentas: cada teléfono tiene su identidad y un «Número GUARDIANA».

ARQUITECTURA ACTUAL
- La web y la app se sirven desde GitHub Pages (guardianagroup.com).
- Hay un relé principal en Hetzner (Núremberg, motor.guardianagroup.com) y otro en Miami.
- Mensajes y archivos van por un WebSocket (wss, 443) hacia el relé, ya cifrados de extremo a extremo. El relé solo ve bytes y la sala.
- Llamadas WebRTC siempre por el relé de llamadas (coturn, iceTransportPolicy «relay»):
  - turn: 3478 udp/tcp;
  - desde hoy también turns: 5349/tcp con el certificado de la web;
  - relé de medios en 49160–49999/udp.
  - Audio y vídeo DTLS-SRTP de extremo a extremo; no son poscuánticos.
- Delante del relé hay Caddy (443, TLS automático) y node detrás.

EL PROBLEMA (real, de hoy)
- El hijo del dueño está en Moscú. Con él el chat funciona, pero las fotos no se abren y las llamadas suenan sin audio ni vídeo.
- Desde junio de 2025, las operadoras rusas cortan a unos 16 KB las conexiones TCP/TLS hacia grandes alojamientos extranjeros (Hetzner, Cloudflare, DigitalOcean, OVH…). También bloquean protocolos de VPN.
- China (el Gran Cortafuegos) y otros países hacen cosas parecidas o peores.
- Intentamos alquilar un «servidor de paso» en Moscú (Selectel), pero solo aceptan tarjetas rusas. Estamos buscando proveedor.

LA PROPUESTA QUE EL DUEÑO QUIERE ESTUDIAR
Opción 1, una «VPN de GUARDIANA» para todos los clientes.
Opción 2, la recomendada por Claude: que SOLO el tráfico de GUARDIANA viaje camuflado como tráfico web normal y entre por «puentes» locales en los países que cortan. Es decir:
- todo por 443/TCP (y QUIC 443/UDP donde sirva) con TLS normal;
- TURN sobre TLS en 443, compartiendo puerto con la web mediante SNI/ALPN;
- puentes dentro de Rusia (y donde haga falta) que reenvían al relé sin descifrar nada;
- la app elige sola la ruta que funciona.
Además, un relé para Asia (Singapur, Hong Kong, Tokio o Bangkok, por decidir).

PREGUNTAS
1. Compara la opción 1 (VPN propia general: WireGuard, OpenVPN, VLESS/Reality, Hysteria2…) con la opción 2 (solo GUARDIANA camuflada más puentes). Para cada una:
   - eficacia real hoy contra el DPI ruso y el GFW chino;
   - coste;
   - riesgo legal para la empresa y para los usuarios en Rusia y China (leyes de VPN, registro, Roskomnadzor, MIIT);
   - responsabilidad por abuso (lo que hagan terceros con nuestras IP);
   - mantenimiento;
   - impacto en la privacidad.
   Recomienda una y explica por qué.
2. Para la opción 2, propón el diseño técnico concreto:
   - Cómo servir en un solo puerto 443 la web/WebSocket y TURN-TLS: Caddy con layer4, HAProxy, nginx stream ssl_preread, o coturn directamente en 443.
   - Cómo hacer que el saludo TLS no delate a WebRTC/TURN: huella JA3/JA4, ALPN, SNI. ¿Sirve ECH?
   - Cómo elegir y descubrir los puentes sin que el censor los enumere fácilmente (lista firmada dentro de la app, entrega fuera de banda, rotación).
   - Cómo detecta la app que está bloqueada y cambia de ruta sin que la persona haga nada.
   - Si conviene o no usar CDNs o «domain fronting» hoy.
   - Qué se puede hacer y qué NO para China continental: ¿funciona TURN-TLS 443 hacia Hong Kong o Japón? ¿El GFW corta WebRTC? ¿Hace falta ICP?
3. Ubicación del relé de Asia: ¿cuál cubre mejor China, el Sudeste Asiático, India, Japón y Corea? Razónalo con latencias típicas, sin inventar cifras: si no tienes la fuente, dilo.
4. Fases: qué hacemos primero (esta semana), qué después y qué no haríamos nunca. Con el coste mensual aproximado de cada fase, dicho como estimación.
5. Qué podemos decir al cliente y qué no. Ejemplo: «diseñado para funcionar en redes que bloquean», y nunca «imposible de bloquear».

REGLAS DE LA CASA
- Nada de promesas absolutas («100 % seguro», «imposible de bloquear», «los primeros»).
- No decir «conforme/certificada CNSA 2.0»; sí «algoritmos de la suite CNSA 2.0».
- El audio y el vídeo no son poscuánticos.
- No se inventan cifras. Si no hay fuente, se dice «estimación» o «sin confirmar».
- No usar submarinecablemap.com, TeleGeography ni PeeringDB como fuentes.
- Nada de técnicas para atacar ni dañar redes de terceros: solo cómo hacer que nuestro propio servicio sea alcanzable.

FORMATO
Secciones numeradas como las preguntas, frases cortas y una tabla para la comparación de la pregunta 1.
