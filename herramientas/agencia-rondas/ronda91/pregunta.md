# Ronda 91 · 2 nov 2026 · la VPN: países o regiones, fugas y dónde poner los servidores (para Gemini)

Dueño, 16:56: «¿cómo tienes pensado hacer esto de la VPN? Que cuando entras te salgan un montón de países y banderas y cada
uno se conecte a la de ese país. Porque habrá gente que se querrá conectar a un país en concreto».

17:07: «Yo… tuve VPN de una marca… pagaba, creo que eran 50 euros al año… me daba la opción de conectarme al país que yo
quisiera. Nosotros entonces, para hacer eso, tengo que pagar un servidor en cada uno. ¿Hay alguna forma de que podamos esto
mejorarlo? Hacer una especie de VPN distinta, futurista, que tenga cosas que no tengan las demás, pero que no haga falta
meternos en una VPN exacta de un país. Puede ser… Europa, América, una por continente… tenemos que diferenciarnos y dar un
servicio distinto, sin tener… un servidor en cada país, porque eso me hace de tener entonces 200 servidores activos y es
mucho dinero. ¿Cómo hacen ellas entonces para que les salga rentable?»

17:10: «Qué buena idea tener la VPN unida al antivirus y a órbita. Así vemos quién se conecta al PC. Claro, eso está muy
bien. La encriptación postcuántica, espectacular. El doble salto entre continentes, por ejemplo. Entras por Europa y sales
por América. Buenísimo. Sí, sí, mete todas las cosas que puedan ser novedosas y que las puedas llegar a hacer. Piénsalo
profundamente, por favor… quiero una VPN distinta a lo que hay. Mucho más segura… novedoso y mejor que lo actual, que las
mejores que hay actualmente en el mundo.»

17:12: «Lo más importante aquí es que si una persona utiliza la VPN y quiere no aparecer en ese país y quiere estar en
otro, eso es muy importante que sea real, que la página web no lo pueda detectar. Eso es punto número uno. No se puede caer
entre medias… una caída entre medias, por ejemplo, diciendo que estás en España y estás en Alemania, eso puede hacer que el
otro te detecte, te bloqueen. Ahí tenemos que ser impecables… [ubicaciones virtuales] ¿Esto realmente es malo, es bueno, la
gente lo cataloga como algo malo? Si lo hacemos nosotros así… una persona quiere aparecer en Japón. ¿Es posible lograr eso
haciéndolo más barato, gratis? Todo esto analízalo a fondo».

17:15: «Ok, ejecuta con Gemini un plan de dónde poner estratégicamente servidores para cubrir todos los continentes y que me
salga barato y salga rentable con el precio que va a valer Guardiana.»

Hechos de partida (los dio el agente principal): GUARDIANA ya alquila tres servidores, Hetzner en Helsinki y en Núremberg y
Vultr en Miami (motor de la web y relés de llamadas); la VPN solo está montada en Helsinki (WireGuard y Unbound en
10.66.0.1); WireGuardNT en Windows, clave precompartida postcuántica ML-KEM-768, interruptor de corte con Windows Filtering
Platform. Ronda 88: fase 1 en Helsinki y Núremberg, Miami después; medir el uso real y recalcular la cuota; la VPN entra en
la licencia y en los 7 días de prueba. Precio publicado de «Plus» (comprar.html): Latinoamérica 2,49 US$/mes o 23,90
US$/año; Europa 4,49 €/mes o 43,10 €/año; Reino Unido 3,99 £/mes; resto del mundo 4,99 US$/mes o 47,90 US$/año.

## Lo que se le mandó a Gemini

**1) Modo «Tarea», modelo Argon, 17:2x** (conversación «Estrategia de Expansión VPN Guardiana», en la cuenta del dueño). Se
cortó por el límite de uso antes de escribir el informe (ver `gemini.md`). Texto exacto:

> Contexto: GUARDIANA es un programa para Windows con una sola cuota mensual: Comunicaciones (llamadas y chat encriptados en
> el navegador), Antivirus, el navegador ZERO, una VPN y «Órbita» (la pantalla de inicio que enseña con quién habla el
> ordenador). La VPN hoy: un solo servidor, en Helsinki (Hetzner); WireGuard (en Windows, WireGuardNT); clave precompartida
> postcuántica con ML-KEM-768; kill switch con Windows Filtering Platform; el resolvedor DNS del propio servidor dentro del
> túnel. Además, GUARDIANA tiene un escudo a nivel de DNS y Órbita.
>
> El dueño quiere ofrecer muchas ubicaciones sin pagar 200 servidores y diferenciarse de verdad: «una VPN distinta, mucho
> más segura, novedosa y mejor que las mejores que hay hoy». Su prioridad número uno: si alguien elige aparecer en otro
> país, tiene que ser real y la web no debe poder descubrir dónde está de verdad; nada de caídas a mitad (una caída que deje
> ver la conexión real puede hacer que una web te detecte y te bloquee).
>
> Límite que no se cruza: impedir que se filtre la IP o la ubicación real, sí; falsear la huella del navegador o usar
> proxies residenciales para burlar detecciones, no.
>
> Necesito respuestas con enlace a la fuente oficial y la fecha en que la leíste; separa lo comprobado de lo que no lo esté;
> ninguna cifra inventada (si algo es un supuesto, dilo).
>
> 1. Fugas. Todas las formas en que una web o un servicio averigua la ubicación real pese a la VPN: huecos del kill switch
> en caídas, reconexiones, suspensión y vuelta, actualizaciones y arranque; DNS; IPv6; WebRTC; zona horaria e idioma que no
> cuadran; triangulación por latencia (RTT); listas de reputación de IP de centros de datos; ubicación por GPS o Wi-Fi (la
> API del navegador y la de Windows). Para cada una: ¿se puede arreglar de forma honesta o solo avisar a la persona?
>
> 2. Cómo les salen rentables tantos países a las grandes VPN: servidores alquilados o compartidos y ubicaciones virtuales
> (la IP dice un país y el servidor está en otro). Cómo las declaran ExpressVPN, NordVPN, Proton VPN, Surfshark, PIA y
> otras, y qué piensa la gente de ellas: ¿se ven como un engaño? ¿Puede una web detectar la diferencia de latencia de una
> ubicación virtual?
>
> 3. Regiones o países: ¿una salida por continente o por país? ¿Cómo deciden el país las bases de geolocalización por IP
> (MaxMind, IPinfo, IP2Location) y qué papel tienen los geofeeds (RFC 8805)?
>
> 4. Diferenciación real y comprobable. Evalúa, sin darlas por buenas: doble salto entre continentes (entrar por Europa y
> salir por América), IP de salida que rotan, postcuántico, la VPN unida al antivirus y a Órbita (ver qué programa habla con
> quién y cortar el túnel a un proceso que el antivirus marca), túnel por aplicación, servidores sin disco, defensa contra
> el análisis de tráfico (como DAITA de Mullvad), camuflaje contra bloqueos y una política sin registros que se pueda
> demostrar. Para cada una: quién de los líderes ya la tiene (Mullvad, Proton VPN, NordVPN, ExpressVPN, Surfshark, IVPN,
> Windscribe, PIA, NymVPN, Obscura), valor para la persona, y esfuerzo y coste para nosotros. Ordénalas por valor para la
> persona y después por esfuerzo. Propón también lo que nadie tenga todavía y se pueda construir y demostrar.
>
> 5. Ley: retención de datos en los países candidatos (Finlandia, Alemania, Países Bajos, Suecia, Suiza, Estados Unidos,
> Canadá, Brasil, México, Colombia, Japón, Singapur, Australia, Sudáfrica, Emiratos). ¿Cómo se demuestra una política sin
> registros (auditorías externas, servidores sin disco, casos judiciales, informes de transparencia)?
>
> 6. Tráfico: cuánto gasta al mes una persona con VPN, y transferencia incluida y precio del exceso en Hetzner, OVHcloud,
> Vultr, DigitalOcean, Scaleway y Akamai/Linode. ¿Cuánto caudal WireGuard aguanta un servidor pequeño (2 a 4 vCPU) y
> cuántas personas a la vez?
>
> 7. Dónde poner los servidores, ciudad por ciudad, para cubrir todos los continentes: Europa, Norteamérica, Latinoamérica
> (el dueño está en Colombia: São Paulo, México y Bogotá si los hay), Asia, Oceanía, África y Oriente Medio. Cada elección
> basada en latencia real, puntos de intercambio de tráfico y clima legal, con el proveedor más barato adecuado en cada
> ciudad (Hetzner, OVHcloud, Vultr, DigitalOcean, Scaleway, Akamai/Linode u otros), su precio mensual de la página oficial y
> el tráfico incluido. ¿Cuál es la forma más barata y honesta de ofrecer Japón? ¿Hay alguna opción «gratis» legítima y
> cuánto cuesta de verdad?
>
> 8. Rentabilidad con el precio publicado de GUARDIANA «Plus» (todo el programa): Latinoamérica 2,49 US$/mes o 23,90
> US$/año; Europa 4,49 €/mes o 43,10 €/año; Reino Unido 3,99 £/mes; resto del mundo 4,99 US$/mes o 47,90 US$/año. Para cada
> fase: coste mensual (servidores y exceso de tráfico con un consumo realista por persona), cuántos suscriptores hacen falta
> para cubrirlo, comisiones de pago e impuestos (como supuesto, con fuente), coste por persona según crece la base y cuándo
> se satura cada servidor.
>
> 9. Plan por fases: fase 1, lo mínimo que cubre todos los continentes de forma aceptable; fase 2, lo que mejora la latencia
> donde estén los usuarios. Y cómo presentarlo a la persona: regiones con banderas y «el más rápido» automático.

**2) Modo «Chat», modelo 3.5 Flash-Lite (el único disponible tras el límite), 17:4x** (conversación «Plan Estratégico y
Técnico de GUARDIANA VPN»). El mismo texto, con una frase añadida en el punto 7, justo después de «…Asia, Oceanía, África y
Oriente Medio.»:

> Hoy GUARDIANA ya alquila tres servidores: Hetzner en Helsinki y en Núremberg y Vultr en Miami (motor de la web y relés de
> llamadas; la VPN, solo en Helsinki). Di qué cubre cada uno antes de añadir otros.

**3) Reintento en la misma conversación, 18:0x** (la primera respuesta parecía cortada; luego se vio que solo tardó en
pintarse):

> Tu respuesta se cortó tras el título del punto 1. Responde más breve, con las mismas reglas (fuentes con fecha, comprobado
> y no comprobado por separado, supuestos marcados), en este orden:
>
> A. Dónde poner los servidores, ciudad por ciudad, para cubrir Europa, Norteamérica, Latinoamérica, Asia, Oceanía, África y
> Oriente Medio, partiendo de los tres que ya hay (Hetzner Helsinki, Hetzner Núremberg, Vultr Miami). Fase 1: lo mínimo que
> cubre todos los continentes de forma aceptable. Fase 2: lo que mejora la latencia donde estén los usuarios. Para cada
> ciudad: proveedor, precio mensual y tráfico incluido.
>
> B. Coste mensual de cada fase con un consumo por persona que digas como supuesto, cuántos suscriptores a 2,49 US$
> (Latinoamérica), 4,49 € (Europa) y 4,99 US$ (resto) hacen falta para cubrirlo, y cuándo se satura un servidor pequeño.
>
> C. Japón: la forma más barata y honesta de ofrecerlo, y si hay alguna opción «gratis» legítima.
>
> D. En tres líneas: ¿ubicaciones virtuales sí o no, si la prioridad es que la web no descubra el país real?
>
> E. En tres líneas: las tres fugas que más importan y si se arreglan o solo se avisan.
