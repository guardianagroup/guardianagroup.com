# Ronda 69 · ChatGPT («Alta», con web) · Órbita: el mapa de las amenazas

27 Oct 2026, 17:54–18:00 (Bogotá). Chat nuevo, «Fuentes para Órbita». Texto completo allí; aquí lo esencial, fiel. Con *(comprobar)* van las cifras y fechas que cita y que aún no hemos verificado con la fuente primaria.

**Decisión:** sí, una capa nueva «AMENAZAS» en Órbita, sobria y trazable; no un planeta con rayos rojos de «ataques mundiales». Cinco categorías que nunca se mezclan: malware alojado, suplantación, infraestructura de ataque, países afectados y filtraciones confirmadas. No existe una clasificación verificable de «los países más peligrosos de Internet».

## El hallazgo principal: gratis no es reutilizable

- **Cloudflare Radar:** API y descargas, CC BY-NC (no en un producto comercial sin permiso); las gráficas insertables, CC BY 4.0.
- **abuse.ch** (URLhaus, ThreatFox, MalwareBazaar): API comunitaria con uso razonable; el uso empresarial puede requerir la API comercial (Spamhaus). Feodo: por verificar.
- **Shadowserver:** prohíbe la extracción automática y la reventa sin autorización; se pueden enlazar sus gráficos.
- **Spamhaus:** DROP, descarga gratuita con términos propios (no licencia general de redistribución); Botnet C&C, licencia comercial.
- **APWG:** leer y citar. **OpenPhish:** no con el feed gratuito sin consentimiento escrito. **PhishTank:** su FAQ permite uso comercial, pero remite al acuerdo de Cisco: guardar los términos y pedir aclaración.
- **Kaspersky, Check Point, Fortinet:** no reproducir sus mapas ni datos sin licencia.
- **SANS ISC / DShield:** sus términos de feeds permiten usos comerciales distintos de la reventa, con atribución *(comprobar)*. Es su primera elección. Honeypots propios, después.
- **Filtraciones:**
  - HIBP: catálogo CC BY 4.0, sin país de las víctimas;
  - Verizon DBIR e IBM: referencia editorial;
  - Surfshark y Comparitech: no comerciales.

  No publicar un contador de «datos robados por país».
- **Informes:**
  - ENISA: CC BY 4.0 en sus publicaciones propias;
  - Microsoft, Europol IOCTA, ITU GCI y NCSI: citar y enlazar;
  - INTERPOL: no comercial sin autorización;
  - FBI IC3: datos federales.

  Fechas que da *(comprobar)*: MDDR 2026, 1 Oct; ENISA TL 2026, 22 Sep; IOCTA 2026, 28 Abr.
- **Ejemplo explicable:** IC3 2025, 2.222 denuncias desde Colombia y 993 desde España *(comprobar)*. Nunca convertirlo en «peligrosidad».

## Cómo enseñarlo sin mentir ni estigmatizar

- **El país del servidor no es el del delincuente** (VPN, botnets, alquiler, equipos comprometidos, anycast). Decir «ubicación estimada de infraestructura observada»; categoría «Ubicación desconocida».
- **Tres indicadores distintos:**
  - infraestructura de malware por país y periodo (con cobertura);
  - eventos recibidos por sensores;
  - denuncias por millón de usuarios de Internet (usuarios del Banco Mundial, CC BY 4.0).

  Siempre número absoluto y tasa, con sesgos de notificación.
- **Cada dato con:** qué, dónde, cuándo y con qué certeza. No sumar la misma URL de tres listas.
- **Frases:**
  - **No:** «el país más peligroso del mundo», «desde aquí salen todos los virus», «este país roba datos», «evita este país y estarás seguro», «ZERO ha evitado 500 robos».
  - **Sí:** «país con más indicadores observados en esta fuente y periodo», «ZERO ha bloqueado 500 solicitudes clasificadas como peligrosas».

## Capas y diseño

- **Capas:** suplantaciones (PhishTank, si se confirma), malware alojado (URLhaus con permiso), actividad observada (DShield), filtraciones e incidentes, y **«Lo que ZERO ha detectado»**.
- **«Lo que ZERO ha detectado» es su prioridad diferenciadora:**
  - dos contadores separados: amenazas distintas e intentos bloqueados, siempre con el total de comprobaciones;
  - agregación sin identidad, IP, URL completa ni hora individual;
  - umbral inicial de 20 eventos por celda (de ingeniería, no garantía de anonimato).

  Si fuera un servicio aparte no necesario para proteger, voluntario y desactivado por defecto.
- **Estados:** «En directo» (solo sensores propios), «Actualizado hoy», «Histórico». Si falla la actualización, último dato válido como histórico.
- **Con ZERO:** los indicadores pesan por URL, estado y fiabilidad, no por país; nunca bloquear un país entero. **Con Comunicaciones:** elegir jurisdicción del relé no garantiza el tránsito.
- **Diseño:**
  - una entrada «AMENAZAS», una capa a la vez;
  - coral para confirmado, ámbar para aviso, gris para «sin datos suficientes»;
  - ficha por país en lenguaje llano (qué, cuántos, cuándo, quién lo midió, qué significa, qué hacer) y «Ver las fuentes»;
  - en el móvil, una capa, ficha deslizable, lista por países y agregación por país (sin inventar ciudades).

## Ley, plan y decisiones

- **Ley:**
  - cada fuente con su ficha de licencia: aprobada, pendiente o no utilizable;
  - Ley 1581 y RGPD (arts. 4, 5, 6, 25 y 32): la IP del visitante es dato personal potencial; las URL completas, sensibles; minimizar lo que capten los honeypots;
  - procedimiento de rectificación y retirada; no señalar a empresas de alojamiento como cómplices.
- **Plan:**
  - días 1–3: registro de fuentes, pestaña y leyenda;
  - días 4–7: una fuente permitida (DShield; PhishTank si se confirma);
  - semanas 2–4: conexión con ZERO, privacidad y falsos positivos;
  - meses 2–3: honeypots y licencia de abuse.ch si demuestra valor.
- **Coste:** datos casi gratis con fuentes compatibles; desarrollo, geolocalización y operación, por medir.
- **Lo singular:** medición + explicación (NÚCLEO) + acción (ZERO).
- **Humo:**
  - rayos inventados;
  - contadores estimados;
  - rankings de «países criminales»;
  - atribuir por GeoIP;
  - «evitó un país» por un mapa de cables;
  - «robo evitado» por un bloqueo;
  - países sin cobertura pintados como seguros.
- **Decisiones del dueño, según ChatGPT:**
  1. AMENAZAS sí, cinco capas;
  2. primero DShield (y PhishTank si se confirma);
  3. datos de ZERO solo agregados y validados;
  4. no comprar licencias todavía.

Frase propuesta: «GUARDIANA. Mira las amenazas del mundo. Comprueba antes de entrar. Decide con información.»
