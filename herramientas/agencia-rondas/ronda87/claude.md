# Claude (Opus 5.5), ronda 87 — revisión de lo de Gemini y propuesta

## Comprobado con una segunda fuente

- **YARA-X:** implementación de YARA en Rust puro, de VirusTotal, estable; licencia BSD-3-Clause.
  https://docs.rs/crate/yara-x/latest/source/README.md · https://awesome.ecosyste.ms/projects/github.com%2FVirusTotal%2Fyara-x
- **LOLBAS:** licencia **GPL-3.0** (Gemini decía MIT: corregido). Compatible con AGPL-3.0.
  https://awesome.ecosyste.ms/api/v1/projects/github.com%2FLOLBAS-Project%2FLOLBAS
- **MVI de Microsoft (requisitos oficiales):** producto disponible comercialmente con protección en tiempo real, reputación
  en el sector, acuerdo de confidencialidad y de licencia, uso de Trusted Signing, y certificado en los últimos 12 meses
  por uno de estos laboratorios: AV-Comparatives, AVLab, AV-Test, MRG Effitas, SE Labs, SKD Labs, VB100 o West Coast Labs.
  La página no menciona cuotas. https://learn.microsoft.com/en-us/defender-xdr/virus-initiative-criteria
- **GotaTun:** WireGuard en Rust de Mullvad (derivado de BoringTun), anunciado en diciembre de 2025, con una primera
  auditoría independiente sin fallos graves. https://www.phoronix.com/news/GotaTun-Rust-WireGuard-OSS ·
  https://www.techradar.com/vpn/vpn-services/no-major-vulnerabilities-mullvads-wireguard-implementation-gets-thumbs-up-from-independent-security-audit

- **abuse.ch (corrige a Gemini, que las daba por libres):** desde el 4 nov 2025, MalwareBazaar, URLhaus y ThreatFox son
  de uso libre solo sin ánimo de lucro; el uso con ánimo de lucro puede pedir una suscripción (Spamhaus), y las descargas
  piden una llave del portal de abuse.ch. Solo Feodo Tracker, SSL Blacklist y YARAify son CC0. Usarlas es decisión del
  dueño. https://abuse.ch/terms-of-use/ · https://bazaar.abuse.ch/export/

## Por comprobar antes de usarlo en público

Precios de servidores (Hetzner, Vultr, 1984 Hosting), fechas de incautaciones y auditorías de otros proveedores, cifras de
rendimiento (ms, MB, porcentajes), licencia de LOLDrivers y de las firmas de Detect It Easy, y requisitos y coste del
certificado EV y del Partner Center.

## Propuesta al dueño (antes de construir)

**Antivirus — empezar por la fase 1, sin controlador y conviviendo con Defender.** Sobre el Escáner PC y el Vigía:
YARA-X con listas abiertas que firmamos nosotros, reglas Sigma sobre los eventos de Windows, grafo de procesos, AMSI, y la
ventaja propia de GUARDIANA: cruzar proceso, DNS de la casa y micrófono/cámara/pantalla, con explicaciones en palabras
llanas. Las fases 3 y 4 (controlador propio, laboratorio y MVI) piden papeles de la empresa y presupuesto: se deciden más
adelante.

**VPN — empezar por la fase 1 en los servidores actuales.** WireGuard en Rust dentro del servicio, escudo WFP contra
fugas (TunnelVision, TunnelCrack, DNS, IPv6, WebRTC), DNS de la casa dentro del túnel y el aviso en vivo de lo que sale
fuera del túnel. Después: postcuántico híbrido y doble salto con operadores distintos.

**Decisiones del dueño:** visto bueno a las dos fases 1; si la VPN será gratuita o de pago; política contra el abuso de los
nodos de salida; un segundo proveedor y país para las salidas (coste por confirmar).
