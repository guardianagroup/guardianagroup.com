# Ronda 94 · decisiones (17 nov 2026) · **propuesta, pendiente del visto bueno del dueño**

Une a Gemini (`gemini.md`), ChatGPT (`chatgpt.md`) y lo comprobado por Claude en cada fuente (`claude.md`).
Lo marcado «por construir» no se anuncia hasta que funcione.

## 1. Capas en vivo de Órbita, en este orden
1. **«Lo que ven nuestros sensores»** (por construir). Los servidores de GUARDIANA en Helsinki, Núremberg y Miami cuentan
   las conexiones que nadie pidió y los intentos de entrar (SSH y otros), por país de la IP, en tramos de 5 minutos. Dato
   propio, sin licencia de terceros.
   - En el planeta: intensidad por país y por sensor; **sin rayos** desde una ciudad «atacante».
   - Texto fijo: «País de la IP, no del atacante: suele ser un equipo infectado, una VPN o un proxy».
   - Privacidad: la IP no se guarda; solo el país, el puerto y la hora. País sacado con DB-IP Lite (CC BY 4.0, con
     enlace a DB-IP).
2. **«Rutas de internet»** (por construir). Anomalías BGP por país con RIPE RIS (uso comercial con logo, enlace y texto
   del RIPE NCC) y RouteViews (CC BY 4.0) como segunda observación, una vez confirmada en su página.
   - Se dice «anomalía de rutas», nunca «internet caído».
   - RIPEstat no se usa: prohíbe el uso comercial sin permiso.
3. **«Vulnerabilidades que se están explotando»** (CISA KEV, CC0): una lista con fecha y fabricante, no puntos sobre
   países.

**Ahora no:** Feodo Tracker (CC0 pero vacío hoy); URLhaus, ThreatFox y MalwareBazaar (suscripción con Spamhaus);
DShield (licencia contradictoria); IODA, Mozilla y NetBlocks (permiso); Cloudflare Radar, OONI y Pulse (no comerciales);
GreyNoise (su licencia lo impide). Mapa de DDoS mundial: no hay fuente apta.

## 2. Cortes de internet confirmados
Tres niveles: anomalía de rutas → posible corte (dos señales independientes) → corte confirmado (evidencia y confirmación
independiente). Hasta tener una segunda señal con permiso (IODA o Mozilla), Órbita solo enseña el primer nivel.

## 3. Ficha de país: datos nuevos
| Dato | Fuente y licencia | Estado |
|---|---|---|
| % de personas que usan internet, con su año | Banco Mundial / UIT, CC BY 4.0 | comprobada |
| Descarga y subida medianas, latencia y pérdida, con mes y n.º de pruebas | M-Lab, CC0 | comprobada |
| Anomalías de rutas, últimas 24 h y 30 días | RIPE RIS + RouteViews | tras la capa 2 |
| Lo que ven nuestros sensores desde ese país | propio | tras la capa 1 |
| Suscripciones móviles y banda ancha fija por 100 habitantes | Banco Mundial / UIT | licencia de la serie por comprobar |
| Ley de protección de datos y autoridad | redacción propia con enlace a la norma oficial | por escribir con dos voces |
| Adopción de IPv6, sistemas autónomos, Convenio de Budapest | APNIC, RIR, Consejo de Europa | licencias por comprobar |

Se queda lo que ya hay (4G/5G, operadores, fibra, troncales, intercambio, multas, lo que el PC envía a cada país).

## 4. Qué no se pone (las dos voces de acuerdo)
Mapas de rayos de ataques mundiales; «este país te ataca»; «internet caído» por BGP solo; la velocidad «real» de un país;
un contador único que sume DDoS, malware e intrusiones; semáforos de país seguro o inseguro; «primer año de internet» sin
doble verificación histórica.

## 5. Permisos que pedir (los pide el dueño)
IODA (Georgia Tech), SANS ISC (handlers@isc.sans.edu), Mozilla (outages@mozilla.com) y RouteViews
(help@routeviews.org), para confirmar su CC BY 4.0. En cada petición: datos mostrados a clientes de pago, copiados a
nuestro servidor, sin que el cliente pida nada a terceros.
