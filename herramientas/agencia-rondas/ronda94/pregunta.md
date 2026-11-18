# Ronda 94 · Órbita: capas en vivo (ataques y cortes de internet) y ficha de país

**Contexto.** GUARDIANA es un programa para Windows, de pago (suscripción Plus), con un planeta en 3D, «Órbita». Hoy enseña cables submarinos, cables terrestres, centros de datos y satélites, y «Ver mi PC en directo» (con quién habla el PC de la persona, medido por el programa). El dueño quiere (17 nov 2026):

1. Una o varias capas nuevas **en vivo**: ataques (malware, DDoS, intrusiones) y **cortes de internet por país o zona**, en tiempo real.
2. Que al pulsar un país salga una **ficha** con datos de internet de ese país, reales e interesantes para quien paga.

**Reglas del proyecto.**
- Solo datos reales, con su fuente; nada inventado ni decorativo. Cada dato, confirmado por dos voces o dos fuentes.
- El producto es de pago: la licencia de cada fuente tiene que permitir el uso comercial (o ser de dominio público), o hay que pedir permiso o pagar.
- Prohibido usar submarinecablemap.com / TeleGeography y PeeringDB.
- El navegador del usuario no pide nada a terceros: una tarea programada copia los datos a nuestro sitio (hoy cada 6 horas; se puede bajar a cada 5–15 minutos) y se sirven desde guardianagroup.com.
- Sin promesas absolutas.

**Lo que ya he comprobado.**
- Cloudflare Radar (API): CC BY-NC 4.0, no comercial. Sus gráficos incrustables son CC BY 4.0, pero incrustarlos es pedir a un tercero desde el navegador.
- OONI: datos en bruto CC BY-NC-SA 4.0, no comercial.
- abuse.ch (URLhaus, ThreatFox, Feodo Tracker): gratis con uso razonable y clave; a las empresas les «puede requerir» la suscripción comercial.
- IODA (Georgia Tech): API pública; no he encontrado la licencia de sus datos.
- Ya tenemos: ficha de 196 países (4G/5G, operadores, fibra, troncales, punto de intercambio), cables y centros de datos por país, multas por protección de datos, y lo que el PC del usuario envía a cada país.
- Idea propia, **sensores nuestros**: GUARDIANA tiene servidores (VPN en Helsinki; relés en Núremberg y Miami). Se pueden contar los intentos de intrusión reales que reciben (puertos cerrados, SSH…) por país de origen y publicarlos agregados cada pocos minutos: dato propio y real, sin licencia de terceros, y dicho como lo que es («lo que ven nuestros sensores», no «todos los ataques del mundo»).

**Preguntas.**

A. ¿Qué capas en vivo pondrías, por orden de interés para un cliente y de viabilidad legal? Para cada una: fuente concreta, dirección de la API o del conjunto de datos, licencia exacta (¿permite uso comercial?), cada cuánto se actualiza y qué se dibuja en el planeta.

B. Cortes de internet por país en tiempo real: ¿qué fuente tiene licencia apta para un producto de pago? (IODA, RIPE RIS / RIPEstat, Internet Society Pulse, otras). Si hace falta permiso, ¿a quién se pide?

C. Ataques en vivo: ¿hay alguna fuente abierta y apta para uso comercial? (CISA KEV, Shadowserver, ransomware.live, RansomLook, DShield / SANS ISC, GreyNoise…). ¿Qué opinas de los sensores propios? ¿Qué riesgos legales, de imagen o de precisión ves (por ejemplo, atribuir un ataque a un país por la IP de origen)?

D. Ficha de país: ¿qué 8–10 datos reales añadirías a lo que ya tenemos? (porcentaje de población con internet, velocidad, año de la primera conexión, ley de protección de datos y autoridad, cortes en el último año, 5G…). Para cada uno, la fuente y su licencia.

E. ¿Qué **no** pondrías, por engañoso o por no poder demostrarlo?

Responde en español y en concreto, con el enlace a las condiciones de cada fuente. Si no estás seguro de una licencia, dilo.
