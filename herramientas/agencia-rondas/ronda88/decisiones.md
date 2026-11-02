# Ronda 88 · 1 nov 2026 · decisiones de la agencia

Dueño, 22:34: «Te dejo a ti y a Gemini que toméis la decisión más coherente y os encarguéis vosotros del proyecto.»
22:35: «La idea es que la persona pueda tener antivirus, pueda tener navegador, pueda tener VPN por el mismo precio… vale
una cuota mensual y ya está. Lo de la VPN, tú me dirás, si a nosotros nos cuesta dinero, habrá que luego hacer un
recálculo de lo que vale Guardiana». 22:40: «una sola cuota mensual y el cliente tenga todos los servicios en 1 solo
programa. Comunicaciones, Antivirus, Navegador, VPN». 22:47: «Cuando termines la VPN, el navegador corregido y el
antivirus, mete los 42 idiomas en el programa».

A Gemini no se le preguntó de nuevo: estas decisiones salen de lo que propuso en la ronda 87 (`ronda87/gemini.md`) y de la
revisión de Claude (`ronda87/claude.md`). Las decidió Claude (Opus 5.5) con el encargo del dueño.

## Producto y precio

- **Un solo programa y una sola cuota al mes**: Comunicaciones, Antivirus, Navegador (ZERO) y VPN. La VPN entra en la
  licencia de GUARDIANA (y en los 7 días de prueba), sin cuenta ni registro aparte.
- **Lo que cuesta la VPN es sobre todo tráfico.** Hetzner incluye 20 TB al mes por servidor en Europa y cobra 1 € por TB
  de más (https://docs.hetzner.com/robot/general/traffic/); Vultr da 2 TB gratis al mes por cuenta, más lo de cada plan,
  y cobra 0,01 US$ por GB de más
  (https://blogs.vultr.com/Vultr-Announces-Reduced-Bandwidth-Pricing-2-Tb-Of-Free-Monthly-Egress-Free-Ingress-And-Global-Pooling,
  https://docs.vultr.com/support/platform/billing/what-is-the-bandwidth-overage-rate). Cada 100 GB al mes de una
  persona, gastado lo incluido: unos 0,10 € en Hetzner o 1 US$ en Vultr. Se empieza en Hetzner, se mide el uso real
  unas semanas y con eso se recalcula la cuota.
- **Fase 2**: el servidor comprobará la licencia sin saber de quién es (fichas con firma ciega, propuesta de Gemini en la
  87), para no unir el pago con la conexión.

## VPN

- **Servidores de la fase 1**: los de Hetzner que ya hay (Helsinki, parado, y Núremberg); Miami (Vultr) después, porque
  su tráfico cuesta diez veces más. Nada nuevo se alquila hasta medir.
- **Contra el abuso, sin guardar nada**: puerto 25 de salida cerrado; tope de altas por minuto; tope de conexiones nuevas
  por segundo por par (contra los barridos de puertos); un par sin uso en 24 horas se quita.
- **Instalar en los servidores**: dentro del sello, con la firma del dueño. Eso y los pagos siguen siendo suyos.

## Antivirus

- **Cuarentena desde la lista de avisos: sí.** Solo archivos que el propio escudo señaló, nunca en la carpeta de Windows
  ni en Program Files, y siempre se puede restaurar. La portada del Antivirus dejará de decir «Solo lectura» y dirá
  exactamente qué puede hacer.
- **Listas de muestras: solo las de licencia libre** (de abuse.ch, las CC0: Feodo Tracker, SSL Blacklist y YARAify).
  MalwareBazaar, URLhaus y ThreatFox no: su uso con ánimo de lucro puede pedir una suscripción de pago
  (https://abuse.ch/terms-of-use/). La segunda opinión sigue siendo Microsoft Defender, en el propio equipo.
- **Las listas viajan con cada versión del programa** (camino «a» de docs/ESCUDO.md); a diario desde los servidores
  (camino «b») cuando los servidores estén dentro del sello.

## Navegador ZERO

- **Sí**: la burbuja con la hora de la persona (publicado el 1 nov, 22:55) y más datos de las subastas que la propia
  página recibe.
- **No**: hacer que ZERO se haga pasar por persona ante los sistemas que detectan robots (quitar las marcas de que lo
  maneja un programa, disfrazar la red del servidor con proxies «residenciales», resolver captchas por su cuenta). Se
  empezó a probar y el entorno de trabajo lo bloqueó: es engañar a las webs. Los captchas los resuelve la persona dentro
  de ZERO. Para las webs que bloquean las redes de servidores enteras (Prisa: AS, El País), los caminos honestos son
  pedirles que admitan a GUARDIANA como navegador de privacidad o un botón «abrir esta web en mi navegador»; elige el
  dueño.

## Después

- Los **42 idiomas en el programa**, cuando estén la VPN, el navegador y el antivirus.
