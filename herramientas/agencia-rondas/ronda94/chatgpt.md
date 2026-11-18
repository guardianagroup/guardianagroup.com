# Ronda 94 · ChatGPT (razonamiento «Alta», 5 min 39 s) · 17 nov 2026

Resumen fiel de la respuesta a `pregunta.md` (la completa está en la conversación del 17 nov 2026). Lo comprobado por
Claude está en `claude.md`.

## Veredicto
Separar tres cosas que no se deben mezclar: lo que ven los servidores de GUARDIANA, los cambios observables en las redes
del mundo y los incidentes confirmados por fuentes externas. Hallazgos: **RIPE RIS sí permite el uso comercial con
atribución; RIPEstat no** sin permiso por escrito. **Pulse es solo no comercial**. IODA no tiene licencia comercial clara.

## A. Capas, por prioridad
1. Ataques observados por los sensores de GUARDIANA (primero).
2. Anomalías de rutas BGP con RIPE RIS (RIS Live por WebSocket; archivos MRT cada 5 min, tablas cada 8 h).
3. Cortes confirmados por varias señales (por fases).
4. Actividad de seguridad en el PC del cliente (ampliar lo propio).
5. CISA KEV (CC0): alertas de vulnerabilidades, no puntos de ataque.
6. Malware y botnets externos: negociar licencias.
7. Mapa mundial de DDoS de terceros: solo con datos verificables y licencia.
- Fuentes: **Feodo Tracker** (CC0 comercial según el apartado 3.4 de abuse.ch, 21 oct 2026; lista cada 5 min: servidores
  de mando de botnets, no ataques); URLhaus/ThreatFox/MalwareBazaar, suscripción vía Spamhaus. **M-Lab** (CC0):
  descarga, subida, latencia y pérdida, por país; no es «la velocidad del país». **RouteViews**: CC BY 4.0 según
  terceros; confirmar con help@routeviews.org. **SANS/DShield**: la página de feeds permite el uso comercial salvo
  reventa, pero la de investigación dice CC BY-NC 3.0 US: pedir permiso escrito a handlers@isc.sans.edu.
  **Geolocalización**: DB-IP Lite (CC BY 4.0); MaxMind exige licencia comercial si su base va en un producto.

## B. Cortes
- Tres niveles: anomalía de rutas observada → posible interrupción (dos señales independientes) → interrupción
  confirmada (evidencia técnica y confirmación independiente).
- IODA: solo con permiso escrito (propone ioda-info@cc.gatech.edu). RIPEstat: no sin licencia (stat@ripe.net). RIPE
  Atlas: permiso previo. Pulse: no (apartado 3.2). Mozilla Network Outages: CC0, pero el acceso se pide
  (outages@mozilla.com). NetBlocks: negociar.
- Motor propio de eventos BGP con RIS (y RouteViews cuando se confirme), con línea base histórica; dos colectores que
  reciben del mismo origen no son pruebas independientes.

## C. Ataques
- CISA KEV y Feodo: sí. ThreatFox/URLhaus/MalwareBazaar: acuerdo comercial. Shadowserver: no extraer ni revender.
  GreyNoise: su licencia prohíbe redistribuir. ransomware.live: permiso previo (no verificado en su documento).
  RansomLook: el código es GPL-3.0, los datos no quedan cubiertos.
- No hay fuente abierta de DDoS mundial en vivo con permiso comercial claro.
- Sensores propios: contar conexiones no pedidas, fallos de autenticación (SSH…), bloqueos del cortafuegos y peticiones
  web rechazadas; DDoS solo con medidas suficientes. Mostrar concentraciones por país y por sensor, **sin rayos** desde
  una ciudad «atacante».
- Riesgos: atribución («origen IP geolocalizado en…», nunca «X ha atacado»), muestra no representativa (tres sensores),
  RGPD (considerando 49: interés legítimo con necesidad y proporcionalidad; agregar no garantiza anonimato) e imagen (que
  no parezca que GUARDIANA es vulnerable).

## D. Ficha de país (10 datos)
1–3. % de población con internet (IT.NET.USER.ZS), suscripciones móviles por 100 (IT.CEL.SETS.P2) y banda ancha fija por
100 (IT.NET.BBND.P2): Banco Mundial/UIT, CC BY 4.0, anual. API:
`https://api.worldbank.org/v2/country/{ISO3}/indicator/{CODIGO}?format=json`. Banco Mundial y UIT no son dos voces
independientes: la segunda, el regulador nacional.
4–6. Descarga y subida, latencia, pérdida de paquetes: M-Lab (CC0), mensual, con mes y número de pruebas.
7. Anomalías recientes de rutas (RIS).
8. Infraestructura de mando de botnets en el país (Feodo + DB-IP).
9. Interrupciones verificadas en 12 meses (registro propio).
10. Ley de privacidad y autoridad: redacción propia con enlace a las normas oficiales; ni la Global Privacy Assembly ni
el rastreador de la UNCTAD dan licencia de reutilización.

## E. Qué no publicaría
«Ataques mundiales en directo» con tres servidores; flechas por un cable durante un ataque; «este país ataca a aquel»;
«internet caído en todo el país» por retiradas BGP; % de personas afectadas a partir de prefijos; «virus activos ahora»
con KEV o Feodo; «ataques recibidos por un país» con reputación de IP; «primer año de internet» de los 196 países sin
doble verificación; «velocidad real de todo el país»; un contador único que sume DDoS, malware e intrusiones.

## Arquitectura
Recolectores en nuestro servidor → verificación (licencia, procedencia, segundo testigo, geolocalización, privacidad) →
archivos en guardianagroup.com → Órbita. Cada evento con fuente, fechas, licencia, evidencia y caducidad; si la fuente
se pierde, Órbita dice cuándo se actualizó por última vez.
