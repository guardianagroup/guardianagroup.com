# Ronda 91 · decisiones (2 nov 2026) · **propuesta, pendiente del visto bueno del dueño**

Une lo que dijo Gemini (`gemini.md`, Flash-Lite: el modo Tarea se cortó por el límite de uso) con lo que comprobó Claude
(`claude.md`). Cada cifra lleva su fuente en `claude.md` o va marcada como **supuesto**.

## 1. Prioridad número uno: que no se vea dónde estás
1. **«Modo estricto», encendido por defecto cuando la persona elige un país.** Filtros WFP persistentes y de arranque: el
   bloqueo sigue si el servicio se cae, durante una actualización, al despertar del reposo, al cambiar de servidor y antes
   de que arranque Windows del todo. Si el servidor no contesta, **sin internet** con un aviso claro («La VPN no conecta: no
   sale nada hasta que vuelva o la apagues tú»), nunca vuelta a la conexión normal. Hoy hay dos huecos (sesión dinámica y
   corte que se suelta a los 8 s): se cierran antes de vender la VPN. Mullvad ya lo hace; GUARDIANA lo iguala.
2. **Cada salida, con su DNS en el mismo sitio** (Unbound en cada servidor) e IPv6 bloqueado fuera del túnel; sin
   excepción de red local en el modo estricto (TunnelVision y TunnelCrack).
3. **Lo que no se puede arreglar, se avisa antes de conectar**: zona horaria e idioma del equipo, permiso de ubicación de
   Windows (y ZERO niega la geolocalización por defecto), IP de centro de datos y latencia. Texto honesto: «Nadie puede
   impedir que una web note que usas una VPN si mide el retraso (CalcuLatency lo hace con un 3 % de fallos). Lo que sí
   garantizamos es que no vea tu IP real». Ni huellas falsas ni IP residenciales.

## 2. Ubicaciones virtuales: no
- Van contra la prioridad número uno: IPinfo las detecta midiendo latencias (17 de 20 VPN salen por países distintos de
  los que dicen) y una web que use esa base ve el país real. **Solo salidas reales**, con prueba pública: lista de salidas
  con ciudad y proveedor, geofeed (RFC 8805) y una IP que cualquiera pueda medir. Si algún día hiciera falta una virtual,
  irá marcada como hace Proton (icono y país físico).

## 3. Países, presentados por regiones
- Salidas **por país real**, agrupadas por continente con su bandera: «Europa · 🇫🇮 Helsinki · 🇩🇪 Núremberg», «América ·
  🇺🇸 Miami», «Asia · 🇯🇵 Tokio». Arriba, **«El más rápido»**: el programa mide la latencia a cada salida y elige la más
  cercana, que además es la que menos delata. Cada salida enseña sus ms medidos y la etiqueta «servidor real en…»; si está
  lejos: «Las webs pueden notar por el retraso que estás lejos». Antes de conectar, un semáforo de «lo que una web verá».

## 4. Dónde poner los servidores (precios del 2 nov 2026; latencias de WonderNetwork)

**Fase 1: todos los continentes de forma aceptable con 4 salidas (3 ya pagadas + 1 nueva)**

| Salida | Proveedor y plan | €/US$ al mes | Tráfico incluido | Cubre (latencia real) |
|---|---|---|---|---|
| 🇫🇮 Helsinki (ya hay VPN) | Hetzner CPX02 | 6,49 € | 20 TB; luego 1 €/TB | Norte y este de Europa (Fráncfort 26, Londres 33 ms) |
| 🇩🇪 Núremberg (ya existe) | Hetzner CX23 | 5,49–5,99 € | 20 TB (compartidos con los relés) | Oeste y sur de Europa (Madrid 31), Turquía, norte de África (El Cairo 67), Oriente Medio (Tel Aviv 50, Riad 93, Dubái 121) |
| 🇺🇸 Miami (ya existe) | Vultr 1 vCPU/1 GB | 5 US$ | 1 TB + 2 TB de la cuenta; luego 10 US$/TB | Latinoamérica (Bogotá 58, México 51, Lima 62, Santiago 92, São Paulo 108) y Norteamérica (Nueva York 35, Los Ángeles 58) |
| 🇯🇵 Tokio (nueva) | Vultr High Performance | 6 US$ | 2 TB; luego 10 US$/TB | Japón real, Corea (Seúl 31), Oceanía (Sídney 99), sureste asiático (Singapur 67) |

Coste: 12,48 € + 11 US$ ≈ **25 US$/mes** si se le carga todo a la VPN (**supuesto** de cambio 1 € ≈ 1,15 US$); dinero
nuevo, **6 US$/mes** (Tokio). Peor servidos: Buenos Aires (134 ms hasta Miami), Johannesburgo (174 hasta Fráncfort),
Nairobi (132 hasta Londres), Dubái (121 hasta Fráncfort) e India (~120 hasta Tokio, **supuesto**: Bombay–Singapur 54 +
Singapur–Tokio 67). En Miami, la VPN comparte 1 vCPU con los relés: si se nota, pasa a su propio servidor de 6 US$.
Núremberg queda pendiente de la ley alemana de IP (§ 8).

**Fase 2: por demanda medida, una a una (todas reales; 6 US$ salvo donde se dice)**
1. **EE. UU. este con tráfico ilimitado: OVHcloud VPS-1, 4,54 US$/mes, 500 Mbit/s.** No es por latencia sino por coste:
   cuando Miami pase de ~3 TB al mes, el tráfico de las Américas se lleva aquí (Bogotá–Washington 77 ms frente a 58). En
   qué centro está (Virginia u Oregón), por confirmar en el pedido.
2. **São Paulo** (Vultr; Akamai 7 US$ con 0,007 US$/GB): Brasil y Cono Sur (Buenos Aires 29, Santiago 47). Antes, abogado:
   el Marco Civil pide 1 año de registros de conexión al «proveedor de conexión».
3. **Madrid** (Vultr) para «aparecer en España» de verdad; la latencia ya la da Núremberg. Alternativa más barata en
   tráfico: VPS de OVHcloud en la Local Zone de Madrid (4,66 € sin IVA), si existe allí.
4. **Londres o Mánchester** (Vultr): IP del Reino Unido (hay precio en libras).
5. **Singapur** (Vultr): sureste asiático (Yakarta 13) e India (Bombay 54) **sin servidor en India** (CERT-In obliga a
   las VPN a guardar datos 5 años; Proton sacó sus servidores por eso).
6. **Sídney** (Vultr): Oceanía (Melbourne 10). Ley australiana: 2 años de datos para telecomunicaciones; abogado antes.
7. **Johannesburgo** (Vultr): sur y este de África (Nairobi 52, Ciudad del Cabo 18). Ley sudafricana: no comprobada.
8. **Ciudad de México** (Vultr): solo si piden IP mexicana (Miami ya da 51 ms).
- **Bogotá:** ni Vultr, ni Hetzner, ni DigitalOcean, ni OVHcloud. Solo Oracle (gratis únicamente si es la región de inicio
  de la cuenta, con riesgo de que la recuperen) o un proveedor local (no comprobado). Esperar a la revisión legal.
- **Oriente Medio:** sin servidor propio; Tel Aviv no ayuda al Golfo (Dubái–Tel Aviv 171 ms).

Fase 2 completa ≈ 7 × 6 + 4,54 ≈ **47 US$/mes**; con la fase 1, ≈ **72 US$/mes** más el tráfico.

## 5. Rentabilidad (supuestos marcados)
- **Neto por suscriptor** = precio − IVA incluido (**supuesto**: Colombia 19 %, España 21 %, Reino Unido 20 %) − Dodo
  (4 % + 0,40 US$, +1,5 % fuera de EE. UU., +0,5 % suscripción): **Latinoamérica 1,54 US$/mes** (anual: 1,52); **Europa
  3,09 €** (anual: 2,72); **resto 3,46–4,37 US$** (con o sin IVA y tarjeta de fuera); Reino Unido ≈ 2,78 £ (**supuesto**
  1 £ ≈ 1,30 US$). Si el IVA va encima del precio, el neto sube.
- **Cubrir las máquinas** (sin contar el resto de GUARDIANA): fase 1 (≈ 25 US$) = **17 suscriptores** latinoamericanos,
  u **8** europeos, o **6–8** del resto; fase 1 + 2 (≈ 72 US$) = **47**, **21** o **17–21**.
- **El tráfico manda** (**supuesto**: 100 GB por persona al mes; techo de un hogar entero, 482–711 GB, OpenVault):
  - En Hetzner, 200 personas por servidor sin pagar más; luego **0,10 € por persona**: 3 % de su neto europeo.
  - En Vultr (Miami, Tokio y fase 2), pasado lo incluido, **1 US$ por persona**: el **65 %** del neto latinoamericano; con
    300 GB, **pérdida** (−1,46 US$). Con OVHcloud ilimitado, casi 0. Por eso el punto 1 de la fase 2 va primero en
    cuanto haya uso, y por eso se mide antes de recalcular la cuota (ronda 88).
  - Coste por persona en las Américas a 100 GB: 50 personas en Miami ≈ 0,50 US$; 500 ≈ 0,95 US$; 1.000 ≈ 0,98 US$. En
    OVHcloud (4,54 US$): 500 ≈ 0,01 US$. En Europa (Hetzner, 2 servidores): 100 ≈ 0,12 €; 400 ≈ 0,03 €; 1.000 ≈ 0,07 €.
- **Cuándo se satura** (**supuesto**: en la hora punta, 10 % de los suscriptores conectados a 5 Mbit/s): un servidor
  pequeño con 300–500 Mbit/s (Hetzner, OVHcloud) aguanta **600–1.000 suscriptores**; el procesador no es el límite
  (WireGuard ya llenaba 1 Gbit/s en portátiles i7 con Linux 4.6). Núremberg comparte su red con los relés de llamadas.

## 6. Lo que de verdad la hace distinta (ordenado por valor para la persona, después por esfuerzo)
1. **Corte sin huecos («modo estricto»)**: valor máximo; esfuerzo medio; coste 0. Ya lo tiene Mullvad: igualarlo, no
   presumir.
2. **«Lo que una web verá»**, comprobado en el propio programa antes y durante la conexión (país de la IP en varias bases,
   DNS, IPv6, WebRTC, zona horaria, idioma, permiso de ubicación, latencia frente a distancia): valor alto; esfuerzo
   bajo-medio. Existen webs de pruebas; dentro de una VPN no lo vimos (no se dirá «primeros» sin comprobarlo).
3. **Solo salidas reales y demostrables** (lista pública, geofeed, IP medible): valor alto; esfuerzo bajo. Mullvad, IVPN
   y Windscribe ya lo cumplen según IPinfo.
4. **Órbita + antivirus**: qué programa intentó salir fuera del túnel, a dónde y cuándo; y un proceso que el antivirus
   marca pierde la red al momento: valor alto; esfuerzo medio. Portmaster ya da monitor y cortafuegos por programa; el corte
   por veredicto del antivirus no lo vimos en nadie.
5. **Doble salto entre continentes con dos operadores** (entrar por Hetzner en Europa, salir por Vultr en América), como
   modo aparte «Privacidad máxima», no por defecto: protege frente a una sola orden o un solo proveedor, pero suma
   latencia (Bogotá–Helsinki 174 ms + Helsinki–Miami) y delata más. Lo tienen Mullvad y Obscura (con Mullvad); valor medio;
   esfuerzo medio; dobla el tráfico.
6. **Postcuántico**: hecho (ML-KEM-768). Mullvad, NordVPN y ExpressVPN también: se dice «también», nunca «únicos».
7. **Más adelante:** salida distinta por programa, fichas con firma ciega (pago desligado de la conexión), camuflaje dentro
   de los relés para países con censura, relleno contra el análisis de tráfico bajo demanda (lo tiene Mullvad; encarece el
   tráfico) y servidores sin disco (en un VPS alquilado no se puede demostrar del todo; se dirá así).
8. **IP que rota**: no por defecto (Surfshark la tiene); cambiar de IP a mitad de sesión es lo que más alarma a las webs.

## 7. Japón, más barato y «gratis»
- **Vultr Tokio, 5–6 US$/mes**, servidor real en Japón. Lo «gratis» legítimo es Oracle Always Free (2 núcleos Arm, 12 GB,
  10 TB): solo en la región de inicio de la cuenta, puede ser recuperado y no se comprobó que sus condiciones admitan una
  VPN comercial. Sirve para probar, no para vender.

## 8. Decisiones del dueño
1. Visto bueno a la fase 1 (Tokio, +6 US$/mes; VPN también en Núremberg y Miami) y al «modo estricto» por defecto.
2. Sin ubicaciones virtuales.
3. Consulta a un abogado en Colombia (Decreto 1704, la empresa es colombiana) antes de cobrar por la VPN; seguir la ley
   alemana de IP (si se aprueba y alcanza a las VPN, Núremberg deja de ser salida).
4. Medir el tráfico real unas semanas; con más de ~3 TB/mes en Miami, OVHcloud en EE. UU. y recalcular la cuota.
5. Opcional: repetir la pregunta a Gemini Argon (modo Tarea) cuando vuelva el uso, hoy a las 21:47.
