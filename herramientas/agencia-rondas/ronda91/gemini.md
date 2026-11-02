# Ronda 91 · lo que respondió Gemini (2 nov 2026, 17:2x–18:2x)

**Qué pasó.** La pregunta entera se mandó en modo «Tarea» con Argon. Gemini lanzó cuatro investigadores en paralelo (fugas y
ubicaciones virtuales; diez VPN por funciones; leyes de 15 países; precios, tráfico y WireGuard) y leyó, entre otras, las
páginas de ubicaciones virtuales de ExpressVPN y NordVPN, el informe de IPinfo sobre ubicaciones que no cuadran, el artículo
de CalcuLatency (USENIX) y el de NDSS 2025 sobre latencias, y las RFC 8805, 9092 y 8828. Antes de escribir el informe se
agotó el uso del plan («100 % usado, se restablece a las 21:47»; uso semanal, 18 %). Todos los modelos salvo 3.5
Flash-Lite quedaron bloqueados hasta esa hora, así que la respuesta que sigue es de **Gemini 3.5 Flash-Lite, razonamiento
bajo, modo chat** (dos mensajes). Es una segunda opinión más floja que las de otras rondas: sus cifras no se usan salvo que
estén comprobadas en `claude.md`. Entre corchetes, lo que Claude comprobó después.

## 1. Fugas
- **Huecos del interruptor de corte** (caídas, cambio de red, suspensión, arranque y actualizaciones): se arreglan con
  reglas de bloqueo persistentes de Windows Filtering Platform y un servicio que las pone antes de que haya red.
  [Coincide; Mullvad lo hace así. En GUARDIANA hoy hay dos huecos, ver `claude.md` § 4.]
- **DNS**: bloquear el puerto 53 fuera del túnel y mandar todo al resolutor del túnel. **IPv6**: bloquearlo fuera o
  llevarlo dentro. **WebRTC**: en Chrome o Edge solo se puede avisar; en ZERO se puede restringir. [Con túnel completo y
  corte por WFP, WebRTC sale por el túnel; ver RFC 8828 en `claude.md`.]
- **Zona horaria e idioma**: solo avisar; cambiarlos sería falsear la huella. **Latencia**: solo avisar («la física no se
  puede falsear»). **Listas de IP de centros de datos**: solo avisar (las IP residenciales quedan descartadas).

## 2. Cómo les salen rentables tantos países
- Alquilan en pocos centros (Fráncfort, Singapur…) y muestran IP de otros países; ExpressVPN y Surfshark lo dicen «en la
  letra pequeña»; buena parte de la comunidad técnica lo ve como un engaño; una web puede notar la latencia. [Comprobado,
  con matices: ExpressVPN, NordVPN y Proton publican listas; IPinfo midió 20 VPN, ver `claude.md` § 5.]

## 3. Regiones o países
- Salidas por país, al menos en los mercados principales. Las bases de geolocalización usan los registros regionales,
  BGP y datos de socios; los geofeeds (RFC 8805, enlazados en WHOIS con la RFC 9092) dejan declarar la ubicación de forma
  honesta. [RFC 8805 comprobada.]

## 4. Diferenciación (valor y esfuerzo, según Gemini)
- VPN unida al antivirus y a Órbita: «ningún líder lo tiene»; valor muy alto, esfuerzo alto. [No comprobado que nadie lo
  tenga: Portmaster ya une cortafuegos por programa, monitor de conexiones y su propia red; ver `claude.md` § 6.]
- Servidores sin disco: ExpressVPN, NordVPN, Proton, Mullvad; valor alto, esfuerzo medio. [No comprobado hoy.]
- Postcuántico: «Mullvad en pruebas». [Falso hoy: Mullvad lo ofrece en todas sus apps; NordVPN en todas desde mayo de
  2025; ExpressVPN en WireGuard desde agosto de 2025.]
- Túnel por aplicación: casi todos. Doble salto: Mullvad, IVPN, Proton, NordVPN; esfuerzo bajo. DAITA: Mullvad; esfuerzo
  muy alto y mucho más tráfico. Camuflaje: NordVPN, Surfshark, Windscribe, ExpressVPN; valor alto solo con censura dura.
  Sin registros demostrable: todos los líderes, con auditorías externas; esfuerzo alto por su coste.
- Propuesta propia: «Órbita forense activa», reglas en caliente que aíslan un programa si intenta salir fuera del túnel o
  habla con una IP de mala reputación, con registros locales encriptados.

## 5. Ley (según Gemini, sin enlaces)
- Favorables: Suiza, Finlandia, Suecia, Islandia, Panamá. Intermedias: Alemania, Países Bajos, Canadá, Japón, Singapur.
  A evitar: Estados Unidos, Australia, Brasil, Sudáfrica, Emiratos, México y Colombia. Lo que demuestra «sin registros»:
  servidores en RAM, auditorías, casos judiciales. [Solo parte comprobada; ver `claude.md` § 7.]

## 6. Tráfico y capacidad (según Gemini)
- Una persona gasta 30–60 GB al mes; un uso intenso, 150 GB. Hetzner: 20 TB en Europa y 1 TB en EE. UU., exceso a 1 €/TB;
  Vultr, DigitalOcean y Akamai: 1–2 TB y exceso a 0,01 US$/GB. Un núcleo mueve 1 Gbit/s de WireGuard; un servidor de
  2 vCPU aguanta 150–250 personas a la vez; antes se acaba el tráfico o el puerto. [Hetzner y Vultr, comprobados; Akamai
  cobra la mitad, 0,005 US$/GB; los 30–60 GB no traen fuente.]

## 7–9. Dónde poner los servidores, rentabilidad y fases
- **Primera respuesta:** fase 1 Helsinki, Miami, São Paulo y Singapur o Tokio; fase 2 Bogotá, México y Fráncfort. Ejemplo
  Europa a 4,49 €: −4 % de pasarela, −15 % de impuestos → ~3,64 € netos; un servidor de ~20 € en Hetzner con 20 TB y ~400
  personas sale a ~0,05 € por persona; con 50–100 suscriptores se cubre.
- **Reintento:** fase 1 con los tres actuales más São Paulo, Singapur, Sídney, Dubái (o Fráncfort) y Johannesburgo, «~7 ×
  15 US$ ≈ 105 US$/mes», unos 30 suscriptores a ~3,50 US$ netos; fase 2 con Bogotá y Tokio, ~135 US$/mes, ~40
  suscriptores. Consumo supuesto: 50 GB por persona; un nodo con 1 TB se queda corto con 20 personas intensas, uno de
  Hetzner con 20 TB llega a ~400. [Errores: Vultr no tiene Bogotá ni Dubái; Hetzner Singapur no da 20 TB (da 0,5 TB y
  cobra 7,40 €/TB); los servidores de 1 vCPU de Vultr cuestan 5–6 US$, no 15; la pasarela de GUARDIANA es Dodo Payments
  (4 % + 0,40 US$ y recargos), no Stripe.]
- **Japón:** lo más barato y honesto, Hetzner Singapur o la capa gratuita de Oracle en Tokio (ARM con 10 TB). «Gratis»
  legítimo y viable para producción no hay; las capas gratuitas tienen límites y riesgo de cierre. [Oracle hoy da 2 núcleos
  y 12 GB, no 24 GB, y solo en la región de inicio; Singapur no es Japón.]
- **Ubicaciones virtuales:** «rotundamente no» si la prioridad es que la web no descubra el país real: la latencia las
  delata. **Presentación:** lista por regiones con banderas y «Órbita automática / Más rápido», que mide la latencia y la
  carga y elige sola.
