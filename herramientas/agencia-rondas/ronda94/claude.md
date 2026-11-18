# Ronda 94 · Claude: lo comprobado en las fuentes (17 nov 2026)

Cada licencia, leída en la página de quien da los datos. Donde Gemini y ChatGPT no coinciden, manda lo que dice la
fuente.

| Fuente | Lo que dicen sus condiciones | Quién acertó |
|---|---|---|
| **RIPE RIS** | Uso comercial permitido por defecto y revocable, con el logo del RIPE NCC, un enlace a https://www.ripe.net/ris y su texto fijo de descripción. https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/commercial-use | ChatGPT |
| **RIPEstat** | Uso comercial no permitido salvo permiso por escrito del RIPE NCC (stat@ripe.net). https://www.ripe.net/about-us/legal/ripestat-service-terms-and-conditions/ | ChatGPT (Gemini lo daba por comercial: **error**) |
| RIPE Atlas | Uso comercial con permiso previo; el RIPE NCC concede uno por defecto, revocable, a quien cumple sus reglas. https://atlas.ripe.net/docs/commercial-use | Ninguna del todo |
| RIPE Data Repository | Uso comercial no permitido. https://www.ripe.net/analyse/raw-data-sets/terms-conditions/ | — |
| **RouteViews** | CC BY 4.0 para los datos propios de RouteViews (texto de routeviews.org leído en una copia; confirmar en la página original antes de usarlo). | ChatGPT (con su reserva) |
| **abuse.ch** | Condiciones del 21 oct 2026, apartado 3.4: Feodo Tracker, SSL Blacklist y YARAify, CC0, uso comercial y no comercial. Apartado 4: URLhaus, ThreatFox y MalwareBazaar pueden requerir suscripción de pago con Spamhaus. https://abuse.ch/terms-of-use/ | ChatGPT |
| **Feodo Tracker hoy** | **Vacío**: su página dice que sus datos están vacíos ahora mismo, y la portada de abuse.ch, que lo están desde la Operación Endgame. https://feodotracker.abuse.ch/blocklist/ | Ninguna lo vio |
| **M-Lab** | CC0 1.0, sin restricciones de uso. https://www.measurementlab.net/data | Las dos |
| **Banco Mundial** | IT.NET.USER.ZS (% de personas que usan internet, de la UIT): CC BY 4.0, citando a la UIT. https://databank.worldbank.org/metadataglossary/world-development-indicators/series/IT.NET.USER.ZS · Condiciones: https://data.worldbank.org/summary-terms-of-use. Las series de móviles y banda ancha fija, **sin comprobar**. | Las dos |
| **CISA KEV** | CC0 (https://www.cisa.gov/sites/default/files/licenses/kev/license.txt; espejo oficial en github.com/cisagov/kev-data). | Las dos |
| **Internet Society Pulse** | Apartado 3.2: solo usos no comerciales; ni revender ni redistribuir. https://pulse.internetsociety.org/terms/ | ChatGPT |
| **SANS ISC / DShield** | Se contradice: la página de feeds permite usos comerciales salvo la reventa (https://isc.sans.edu/feeds_doc.html); la de investigación dice CC BY-NC 3.0 US (https://isc.sans.edu/researchfeed.html), y un diario de 2025, que no dan licencias comerciales pero «a veces» lo permiten si se pide. **Pedir permiso.** | ChatGPT |
| **DB-IP Lite** | CC BY 4.0; atribución con enlace a DB-IP.com en las páginas que muestren sus resultados. https://db-ip.com/db/lite.php | ChatGPT (Gemini proponía GeoLite2) |
| IODA | No encontrada ninguna licencia de sus datos. Las dos voces dan correos distintos (caida.org y cc.gatech.edu); IODA dejó CAIDA en 2021. Pedir permiso por su contacto oficial; ningún correo confirmado. | — |

## Errores de una sola voz que no pasan
- Gemini: RIPEstat comercial (falso); pulsos de KEV sobre el país del fabricante (decorativo, no mide nada); arcos desde
  la ciudad atacante (el origen IP no es el atacante, y ChatGPT lo descarta); UNCTAD «uso libre comercial» (ChatGPT dice
  lo contrario; sin comprobar, no se usa).
- ChatGPT: Feodo Tracker como primera fuente de malware (hoy vacío); RIPE Atlas «permiso previo obligatorio» (hay un
  permiso por defecto con reglas).

## Sin comprobar todavía (no se usan hasta tenerlo)
APNIC (IPv6), Consejo de Europa (Convenio de Budapest), ficheros delegados de los RIR (número de sistemas autónomos),
UIT (Índice Global de Ciberseguridad), NTP Pool, Mozilla Network Outages, NetBlocks, ransomware.live, GreyNoise.
