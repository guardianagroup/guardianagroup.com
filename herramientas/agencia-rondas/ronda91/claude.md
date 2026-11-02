# Ronda 91 · lo que comprobó Claude (2 nov 2026)

Todo se leyó hoy, 2 nov 2026, en la página que se enlaza. Precios sin IVA salvo que se diga. «Comprobado» = leído en la
fuente; «supuesto» = cálculo o hipótesis de Claude; «no comprobado» = no se pudo leer hoy.

## 1. Precios oficiales de un servidor pequeño por región (comprobado)

**Hetzner** (precio con IPv4; página de producto leída en el navegador; subida de precios del 15 jun 2026 en
<https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/>):
- **Europa (Núremberg, Falkenstein, Helsinki):** CPX02 (1 vCPU AMD, 1 GB, 20 GB) **6,49 €/mes, 20 TB incluidos**, exceso
  **1,00 €/TB**; se puede pedir. CX23 (2 vCPU, 4 GB) **5,99 €/mes, 20 TB**, pero hoy marcado «not available» para pedidos
  nuevos, igual que CAX11 (6,49 €) y CX33 (8,99 €). <https://www.hetzner.com/cloud/regular-performance/> ·
  <https://www.hetzner.com/cloud/cost-optimized/>. **Los 20 TB de la ronda 88 se confirman** para Europa.
- **EE. UU. (Ashburn, Hillsboro):** CPX11 (2 vCPU, 2 GB) **17,99 €/mes, 1 TB**, exceso 1,00 €/TB.
- **Singapur:** CPX02 **7,99 €/mes, 0,5 TB**; exceso **7,40 €/TB** en la página de producto (la página
  <https://www.hetzner.com/cloud-singapore/> dice «8,49 $ por TB»: no cuadran entre sí).
- Capacidad: «se puede esperar unos 300–500 Mbit/s», sin garantía; el anfitrión tiene 10 Gbit/s compartidos (preguntas
  frecuentes de la página Regular Performance).

**Vultr** (API pública <https://api.vultr.com/v2/plans?type=all&per_page=500>; el exceso, en
<https://docs.vultr.com/support/platform/billing/what-is-the-bandwidth-overage-rate>, actualizada el 26 oct 2026):
- Regular (vc2-1c-1gb): **5 US$/mes**, 1 vCPU, 1 GB, **1 TB**. High Performance (vhp-1c-1gb): **6 US$/mes**, **2 TB**.
  Los dos, en 31–32 ciudades: Miami, Ciudad de México, São Paulo, Santiago, Madrid, Londres, Mánchester, Fráncfort, París,
  Ámsterdam, Estocolmo, Varsovia, Milán, Nueva Jersey, Chicago, Dallas, Atlanta, Los Ángeles, Silicon Valley, Seattle,
  Toronto, Tokio, Osaka, Seúl, Singapur, Bombay, Delhi, Bangalore, Sídney, Melbourne, Johannesburgo y Tel Aviv. **No hay
  Bogotá ni Dubái.**
- 2 TB gratis al mes por cuenta, sumados a lo de cada servidor; exceso **0,01 US$/GB (10 US$/TB)**
  (<https://docs.vultr.com/support/platform/billing/how-are-bandwidth-caps-calculated>). Vultr avisa de que algunas
  tarifas pueden variar por región (<https://docs.vultr.com/support/platform/billing/is-pricing-the-same-in-all-data-center-locations>).
- El Miami actual es de 1 vCPU y 1 GB (notas de traspaso del proyecto).

**OVHcloud** (tráfico **ilimitado** salvo Asia-Pacífico):
- Europa: VPS-1 (2 vCores, 4 GB, 40 GB, 500 Mbit/s) **3,81 €/mes sin IVA (4,61 € con IVA)**
  (<https://www.ovhcloud.com/es-es/vps/vps-france/>). VPS-2 en «Local Zone» (400 Mbit/s) 4,66 € sin IVA; hay Local Zones
  en Madrid, Milán, Viena, Bruselas, Lisboa, Estocolmo, Zúrich y otras
  (<https://www.ovhcloud.com/es-es/about-us/global-infrastructure/regions/>); que haya VPS en cada una, no confirmado.
- EE. UU.: VPS-1 **4,54 US$/mes, tráfico ilimitado, 500 Mbit/s**; «VPN» figura entre sus usos (<https://us.ovhcloud.com/vps/>).
  En qué centros (Virginia, Oregón), no leído hoy.
- Asia-Pacífico (Bombay, Singapur, Sídney): cuota mensual (500 GB el VPS-1) y luego 10 Mbit/s
  (<https://www.ovhcloud.com/en/vps/vps-singapore/>). Ni Latinoamérica ni Japón.

**DigitalOcean:** 4 US$ (512 MiB, 500 GiB) y **6 US$ (1 GiB, 1.000 GiB)**; exceso 0,01 US$/GiB, sin diferencias por región
(<https://digitalocean.com/pricing/droplets>, <https://docs.digitalocean.com/platform/billing/bandwidth/>). Sin
Latinoamérica, Japón ni África.

**Akamai/Linode:** Nanode 1 GB **5 US$ en Norteamérica, 7 US$ en Sudamérica**, 1 TB; exceso **0,005 US$/GB** (0,007 en
Sudamérica) (<https://www.akamai.com/cloud/pricing/cpu>). Asia-Pacífico: el selector no respondió; no leído.

**Scaleway:** solo París, Ámsterdam y Varsovia; desde el 1 jun 2026 la IPv4 cuesta 0,005 €/hora (≈3,65 €/mes)
(<https://www.scaleway.com/en/blog/a-transparent-update-on-scaleway-pricing/>). No aporta regiones nuevas.

**Oracle Cloud «Always Free»** (la única opción gratis seria): Arm A1 con **2 núcleos y 12 GB** (1.500 horas de núcleo y
9.000 GB-hora al mes; ya no son 4 y 24) y **10 TB de salida al mes**, solo en la **región de inicio** de la cuenta;
Oracle puede recuperar instancias «ociosas» (7 días con CPU, red y memoria por debajo del 20 %) y avisa de errores por
falta de capacidad (<https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm>). Tiene
región en Bogotá, Tokio, Osaka, São Paulo, Querétaro, Johannesburgo, Dubái y otras
(<https://docs.oracle.com/en-us/iaas/Content/General/Concepts/regions.htm>). No comprobado: si sus condiciones admiten una
VPN comercial para terceros.

## 2. Tráfico, capacidad y uso

- **WireGuard:** la página oficial da 1.011 Mbit/s con Linux 4.6.1 en portátiles i7 (i7-3820QM e i7-5200U) unidos por
  Ethernet de 1 Gbit/s, y avisa de que esas pruebas son antiguas y que hoy va más rápido
  (<https://www.wireguard.com/performance/>). En un servidor pequeño, el límite es la red (300–500
  Mbit/s en Hetzner, 500 Mbit/s en OVHcloud), no el procesador.
- **Uso:** OpenVault, 2.º trimestre de 2026: **711 GB de media y 482 GB de mediana al mes por hogar**
  (<https://www.advanced-television.com/2026/07/23/report-broadband-upstream-usage-up-20-yoy-in-q2/>). Es un hogar
  entero (con televisión), no un PC con VPN: sirve de techo. No hay fuente para el uso de un PC con VPN.

## 3. Latencias reales entre centros de datos (comprobado)

Medianas de 336 medidas horarias (14 días) de WonderNetwork, leídas hoy (<https://wondernetwork.com/pings>, por pares):
Bogotá–Miami 58 ms · Bogotá–Washington 77 · Bogotá–Madrid 169 · Bogotá–Helsinki 174 · Bogotá–Tokio 264 · Ciudad de
México–Miami 51 · Lima–Miami 62 · Santiago–Miami 92 · São Paulo–Miami 108 · Buenos Aires–Miami 134 · Buenos Aires–São Paulo
29 · Santiago–São Paulo 47 · Nueva York–Miami 35 · Los Ángeles–Miami 58 · Madrid–Núremberg 31 · Madrid–Helsinki 53 ·
Londres–Helsinki 33 · Fráncfort–Helsinki 26 · Estambul–Fráncfort 25 · El Cairo–Fráncfort 67 · Lagos–Londres 104 ·
Nairobi–Londres 132 · Nairobi–Johannesburgo 52 · Johannesburgo–Fráncfort 174 · Tel Aviv–Fráncfort 50 · Riad–Fráncfort 93 ·
Dubái–Fráncfort 121 · Dubái–Tel Aviv 171 · Dubái–Bombay 230 · Seúl–Tokio 31 · Tokio–Singapur 67 · Sídney–Tokio 99 ·
Sídney–Singapur 177 · Bombay–Singapur 54 · Yakarta–Singapur 13.

## 4. Fugas: qué se arregla y qué solo se avisa

- **Huecos del interruptor de corte.** Mullvad mantiene el bloqueo en reconexiones y cambios de servidor y, en Windows,
  pone filtros WFP persistentes que bloquean antes de que arranque su servicio (documentación de su app en
  <https://mintlify.com/mullvad/mullvadvpn-app/security/kill-switch>; que sea la oficial, no confirmado). **En GUARDIANA
  hay dos huecos por diseño** (`docs/VPN.md` del repositorio del programa, leído hoy): los filtros van en una sesión
  dinámica («si el servicio se para, Windows quita los filtros») y, si el servidor no contesta en 8 segundos, «el túnel se
  cierra (y el corte con él)… para no dejar el equipo sin internet». Para la prioridad del dueño, eso es justo la caída
  que delata. Se arregla: filtros persistentes y de arranque, y no soltar el bloqueo si el servidor falla.
- **Rutas forzadas:** TunnelVision (CVE-2024-3661, la opción 121 de DHCP añade rutas y saca tráfico del túnel,
  <https://db.gcve.eu/cve/CVE-2024-3661>) y TunnelCrack (red local falsa y respuesta DNS falsa del servidor; afectó a la
  mayoría de apps de Windows probadas; USENIX Security 2023, <https://tunnelcrack.mathyvanhoef.com/>). Se arreglan con el
  corte por WFP y sin excepción de red local.
- **WebRTC:** el modo por defecto de la RFC 8828 expone las direcciones de la ruta por defecto (con túnel completo, la del
  túnel), no otras interfaces (<https://www.rfc-editor.org/rfc/rfc8828.html>). Se arregla con túnel completo.
- **DNS e IPv6:** se arreglan (bloqueo fuera del túnel; ya en el plan). Deducción de Claude, sin fuente: si la IP sale por
  Tokio y el DNS por Helsinki, la web y su red de distribución ven dos sitios; el resolutor tiene que estar en cada salida.
- **Zona horaria e idioma:** `Intl.DateTimeFormat().resolvedOptions().timeZone` da la zona del sistema
  (<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/resolvedOptions>).
  Solo se avisa: cambiarla por la persona es falsear la huella.
- **Latencia:** CalcuLatency (USENIX Security 2024) detecta desde la web a quien usa una VPN, WireGuard incluido,
  comparando latencias (WebSocket, TCP, ICMP), con 2,9 % de falsos negativos y 0,95 % de falsos positivos; falla cuando la
  persona está cerca de la salida (unas 650 millas, ~1.050 km) (<https://usenix.org/system/files/usenixsecurity24-ramesh.pdf>).
  Solo se avisa; la salida más cercana es la que menos delata.
- **IP de centro de datos:** MaxMind marca `is_hosting_provider` e `is_anonymous_vpn`
  (<https://dev.maxmind.com/geoip/docs/databases/anonymous-ip>). Solo se avisa (las IP residenciales están descartadas).
- **GPS y Wi-Fi:** Windows ubica el equipo con GPS, puntos Wi-Fi cercanos, antenas e IP, y las apps necesitan permiso
  (<https://support.microsoft.com/windows/privacy/windows-location-service-and-privacy>). Lo arregla la persona quitando el
  permiso; GUARDIANA puede avisar de qué apps lo tienen y ZERO puede negarlo por defecto (negar no es falsear).

## 5. Ubicaciones virtuales: cómo se declaran y cómo se ven

- ExpressVPN publica la lista (p. ej., Bolivia sale por Brasil, Nigeria por España) y dice que las demás son físicas;
  actualizada el 16 jul 2026 (<https://expressvpn.com/support/knowledge-hub/virtual-server-locations>).
- NordVPN: 79 ubicaciones virtuales (casi 30 añadidas en dic 2025); p. ej., Ecuador sale por Colombia; la primera, India,
  por Singapur (15 ene 2026, <https://nordvpn.com/blog/new-nordvpn-virtual-servers/>).
- Proton («Smart Routing»): icono de globo y país físico al pasar el ratón en Windows; India sale por Singapur, «para
  proteger a sus usuarios de las leyes de vigilancia» de ese país (<https://protonvpn.com/support/how-smart-routing-works>).
- OVHcloud vende «VPS España»: servidor en otros centros europeos con IP geolocalizada en España
  (<https://www.ovhcloud.com/es-es/vps/vps-espana/>). Así se fabrica un país barato.
- IPinfo (actualizado en abril de 2026) midió 20 VPN y más de 150.000 IP con sondas en 1.200 puntos: **17 de 20 salen por
  países distintos de los que dicen**; Mullvad, IVPN y Windscribe, ninguno; ExpressVPN y CyberGhost 57 % virtual o sin
  medir; NordVPN 53 %. Dice que etiquetar es transparente y mezclar sin etiqueta confunde
  (<https://ipinfo.io/blog/vpn-location-mismatch-report>). Consecuencia: una web que use una base con medición activa ve el
  país real del servidor. **Una ubicación virtual va contra la prioridad número uno.**
- Geofeeds: RFC 8805 (2020, informativa, sin rango de estándar) deja publicar «prefijo → país, región, ciudad»
  (<https://datatracker.ietf.org/doc/rfc8805/>). El mismo mecanismo sirve para declarar la verdad o una ubicación virtual.

## 6. Diferenciadores: quién los tiene ya (comprobado salvo donde se dice)

- **Postcuántico:** Mullvad en todas sus apps, a elegir (<https://mullvad.net/en/why-mullvad-vpn>); NordVPN en todas desde
  el 22 may 2025 (<https://nordsecurity.com/press-area/nordvpn-launches-post-quantum-encryption-across-all-its-applications>);
  ExpressVPN, WireGuard postcuántico con ML-KEM desde el 6 ago 2025
  (<https://expressvpn.com/blog/expressvpn-launches-post-quantum-wireguard-blueprint-vpn-industry/>). GUARDIANA iguala;
  no es la primera.
- **Doble salto:** Mullvad (entrada y salida distintas, con postcuántico en los dos túneles;
  <https://mintlify.com/mullvad/mullvadvpn-app/features/multihop>); **con dos empresas distintas**, Obscura (entrada) +
  Mullvad (salida): «ninguna de las dos ve todo» (<https://obscura.com/knowledge/relay-and-exit-nodes/>). Proton (Secure
  Core) y NordVPN (Double VPN): no leído hoy.
- **IP que rota:** Surfshark cambia la IP cada ~5 minutos sin cortar, en el mismo país (<https://surfshark.com/features/ip-rotator>).
  Para la prioridad del dueño es un riesgo: un cambio de IP a mitad de sesión es justo lo que hace saltar las alarmas de
  muchas webs (deducción, sin fuente).
- **Contra el análisis de tráfico:** DAITA de Mullvad, en sus cinco plataformas (<https://mullvad.net/en/why-mullvad-vpn>).
- **Monitor por programa + red propia:** Portmaster (Safing) es un cortafuegos de código abierto que enseña cada conexión
  por programa, corta programas y limita países por programa; trae túnel dividido desde la 2.2.1 (jul 2026); su red SPN
  aparte, no leída (<https://safing.io/>). **Que un antivirus corte el túnel a un proceso: no lo vimos en ninguno.**
- **Sin registros demostrado:** la policía sueca registró la oficina de Mullvad el 18 abr 2023 y se fue sin datos
  (<https://mullvad.net/en/blog/2023/4/20/mullvad-vpn-was-subject-to-a-search-warrant-customer-data-not-compromised/>).
- No comprobado hoy: servidores sin disco de ExpressVPN, NordVPN y Surfshark; camuflaje de Proton y NordVPN; el kill switch
  avanzado de Proton; la herramienta de NordVPN que enseña lo que internet sabe de tu ubicación (solo vista en un titular).

## 7. Ley (solo lo comprobado)

- **UE:** el TJUE (30 abr 2024, C-470/21) admite conservar de forma general las IP si se separan bien los datos
  (<https://eucrim.eu/news/ecj-ruled-on-data-retention-of-ip-addresses-in-piracy-cases/>).
- **Alemania (Núremberg):** proyecto de ley de **conservación de IP durante 3 meses** (y quizá puertos) para quien da
  acceso a internet y asigna IP; aprobado por el Gobierno el 22 abr 2026, primera lectura el 24 jun, audiencia el 7 oct;
  **sin votación final a 2 nov 2026**; no dice nada de las VPN
  (<https://www.bundestag.de/dokumente/textarchiv/2026/kw41-pa-recht-ip-adressspeicherung-1221516>,
  <https://www.beck-aktuell.de/heute-im-recht/rechtspolitik-gesetzgebung/regierung-gesetzentwurf-ip-speicherpflicht-2026-04-22>).
- **EE. UU. (Miami):** sin obligación general de conservar; a petición, se preserva 90 días (+90) lo que ya se tiene
  (18 U.S.C. § 2703(f), <https://www.law.cornell.edu/uscode/text/18/2703>).
- **Brasil (São Paulo):** el proveedor de conexión guarda los registros de conexión **1 año**; las aplicaciones, 6 meses
  (Marco Civil, arts. 13 y 15, en material de la ESMPU:
  <https://escola.mpu.mp.br/plataforma-aprender/acervo-educacional/conteudo/201cinvestigacao-de-crimes-ciberneticos/textoc-3.pdf>;
  la web de Planalto devolvió «Acceso denegado»).
- **Colombia:** los proveedores de redes y servicios de telecomunicaciones guardan los datos del suscriptor (identidad,
  dirección de facturación, tipo de conexión) **5 años** (Decreto 1704 de 2012, art. 4, compilado en el Decreto 1078 de
  2015, art. 2.2.2.6.4; tiene una parte anulada que la página no identifica)
  (<https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_1704_2012.htm>). **GUARDIANA GROUP S.A.S. es
  colombiana**: si esto le alcanza como proveedor de VPN lo tiene que decir un abogado, esté donde esté el servidor.
- **Australia (Sídney):** las empresas de telecomunicaciones guardan un conjunto de datos **al menos 2 años** (TIA Act
  1979); la página no habla de VPN (<https://www.homeaffairs.gov.au/nat-security/Pages/Data-retention-obligations.aspx>).
- **India:** desde 2022, CERT-In obliga a las VPN a guardar datos de clientes **5 años** (prensa:
  <https://www.businessinsider.in/tech/news/it-ministry-orders-vpn-providers-to-store-user-data-for-five-years-tech-news/amp_articleshow/91334830.cms>;
  la página oficial de CERT-In no cargó). Proton retiró sus servidores físicos de India por eso (enlace del § 5).
- **No comprobado hoy:** Finlandia, Países Bajos, Suecia, Suiza, Canadá, México, Japón, Singapur, Sudáfrica y Emiratos.

## 8. Pagos e impuestos

- **Dodo Payments** (la pasarela de GUARDIANA, según la política de privacidad del sitio): **4 % + 0,40 US$** por
  transacción; **+1,5 %** con tarjetas de fuera de EE. UU.; **+0,5 %** en suscripciones; PayPal +3 %; reembolso 1 US$;
  disputa 30 US$; dice gestionar los impuestos en más de 190 países (<https://dodopayments.com/es/pricing>). Si los
  precios de GUARDIANA incluyen el IVA o se suma encima, no comprobado.
- Impuestos (supuesto, sin fuente leída hoy): IVA del 19 % en Colombia y del 21 % en España como casos de referencia.
