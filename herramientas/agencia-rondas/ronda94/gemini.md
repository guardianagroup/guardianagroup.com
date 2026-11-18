# Ronda 94 · Gemini (Pro, razonamiento «Alto») · 17 nov 2026

Respuesta a `pregunta.md`, copiada de la conversación. Lo que Claude comprobó y corrigió está en `claude.md`.

## A. Capas en vivo
1. **Nodos atacantes (sensores de GUARDIANA)**: dato propio; cada 5–15 min (registros de fail2ban/iptables → JSON).
   Dibujo: arcos desde la IP atacante hasta nuestros servidores, color por puerto (SSH 22, Telnet 23, web 443).
2. **Vulnerabilidades explotadas (CISA KEV)**: https://www.cisa.gov/known-exploited-vulnerabilities-catalog (JSON y CSV);
   obra del Gobierno de EE. UU., dominio público; diaria o en crisis. Dibujo: pulsos sobre el país del fabricante del
   programa afectado, o una cinta de avisos.
3. **Salud del enrutamiento BGP (RIPEstat)**: https://stat.ripe.net/docs/data_api (bgp-state, routing-status). Según
   Gemini, uso comercial permitido con atribución («Data provided by RIPE NCC»). Dibujo: el país parpadea y muestra el %
   de prefijos que pierden conectividad.

## B. Cortes por país
- RIPE RIS / RIPEstat: «la fuente más segura»; uso comercial con atribución.
- IODA: foco académico, sin licencia estándar; pedir permiso a ioda-info@caida.org.
- Internet Society Pulse: parte CC BY 4.0, pero los datos de terceros (Cloudflare) llevan su licencia: no usarlo sin
  separar qué dato es de quién.
- Veredicto: RIPEstat para caídas BGP y permiso por escrito de IODA para anomalías de tráfico.

## C. Ataques y sensores propios
- Shadowserver, DShield, abuse.ch: restringen el uso comercial sin suscripción.
- Sensores propios: «la mejor baza». Riesgos: **atribución falsa** (la IP suele ser un equipo zombi, una VPN o un proxy:
  decirlo en la leyenda) y **RGPD** (Helsinki y Núremberg): anonimizar el último octeto en memoria, sacar el país con una
  base GeoIP local (propone MaxMind GeoLite2, «apta comercialmente con atribución») y borrar la IP; guardar solo
  coordenadas y tipo de ataque.

## D. Ficha de país (8 datos)
1. Adopción de IPv6 (APNIC, stats.labs.apnic.net/ipv6), CC BY 4.0.
2. % de población con internet (Banco Mundial, datos de la UIT), CC BY 4.0.
3. Velocidad y latencia medianas (M-Lab, CC0; BigQuery, medianas mensuales). Ookla no es comercial.
4. Ley de protección de datos y autoridad (UNCTAD, «uso libre comercial citando a la UNCTAD»).
5. Convenio de Budapest: sí/no y año (Consejo de Europa, tratado n.º 185).
6. Sistemas autónomos registrados (ficheros delegados de los 5 RIR).
7. Servidores NTP públicos activos (NTP Pool).
8. Índice Global de Ciberseguridad de la UIT (nivel por país).

## E. Qué no pondría
- Mapas de «rayos» de ataques mundiales (Kaspersky, Fortinet, Norse): interpolan, reciclan o inflan.
- Atribuir ataques a un Estado por la IP.
- Velocidad «en tiempo real» del país: mostrar la mediana del último mes o trimestre.
- Semáforos de país «seguro / inseguro».
