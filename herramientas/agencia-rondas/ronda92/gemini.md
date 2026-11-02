# Ronda 92 · lo que respondió Gemini (2 nov 2026, 17:2x–17:5x)

Puntos 1 a 4: **Gemini Argon en modo «Tarea»** (buscó RFC, documentación de Signal, WhatsApp, Element, Zoom y Apple, la API
de Microsoft para capturas, el VoicePrivacy Challenge y precios de la competencia); se cortó por el límite de uso antes del
punto 5. Puntos 5 a 7: **Gemini 3.5 Flash-Lite**, razonamiento bajo, en otra conversación (el único modelo disponible hasta
las 21:47). Resumen fiel; entre corchetes, lo que Claude comprobó (`claude.md`).

## 1. Blindada (gratis) y Ultra (de pago), según Argon
- La frontera no debe ser «seguridad mala frente a buena», sino **seguridad estándar completa (Blindada)** frente a
  **defensa activa contra vigilancia avanzada, menos metadatos e infraestructura cara (Ultra)**.
- **Blindada:** DTLS-SRTP más la capa postcuántica con ML-KEM-768 y llave nueva cada 2 minutos; un relé TURN propio que
  oculta la IP de cada uno al otro; continuidad de claves (aviso si cambia la llave del contacto) y el número de 4 dígitos,
  discreto, dentro de «Seguridad de la llamada»; envío de archivos con un tamaño básico.
- **Ultra:** ML-KEM-1024 con X25519 y renovación cada 60–120 s; grupos con SFrame y MLS; dos relés TURN de operadores y
  países distintos; audio a tasa constante y relleno; el código grande y rojo que cambia cada 2 minutos con «Coinciden / No
  coinciden» y alertas estrictas; mosaico y voz distorsionada en el equipo; bloqueo de capturas en Windows y avisos de
  grabación; traspaso del PC al teléfono, archivos grandes con recibo firmado y borrado programado. [El traspaso al teléfono
  hoy es de todas las llamadas; pasarlo a Ultra es idea de Gemini, no del dueño.]
- ZERO, Órbita y un antivirus básico, gratis; la VPN y el antivirus avanzado, de pago.

## 2. El coste de quitar la verificación (Argon)
- **Comprobado según Gemini:** sin forma de comparar algo, hay encriptación pero no autenticación: un servidor de señal o
  un relé comprometido (atacante, empleado, orden judicial) puede negociar una sesión con cada uno y escuchar sin que se
  note. Lo postcuántico no lo evita: protege de quien solo graba, no de quien cambia las claves en medio.
- **Recomienda dos capas:** en Blindada, continuidad de claves con aviso si cambian (como Signal y WhatsApp) y el número
  de 4 dígitos al tocar el candado; en Ultra, el código grande que cambia en pantalla.
- Texto propuesto: «En las llamadas Blindadas, GUARDIANA encripta tu conversación de extremo a extremo y comprueba sola que
  las llaves de tu contacto sigan siendo las de siempre, y te avisa si cambian; además, puedes abrir el candado de Seguridad
  de la llamada cuando quieras para comparar un código de 4 dígitos. En Ultra, añadimos verificación activa en pantalla cada
  2 minutos para que podáis confirmar a simple vista y de viva voz que nadie interfiere durante toda la llamada».

## 3. Tecnología para Ultra (Argon)
- **Postcuántico híbrido** X25519 + ML-KEM-1024 con HKDF atado a las huellas DTLS; «rotar la llave con un trinquete da
  secreto hacia adelante y seguridad tras compromiso». [Corrección: una cadena HKDF da lo primero, no lo segundo; ver
  `claude.md` § 3.]
- **SFrame (RFC 9605) y MLS (RFC 9420)** para grupos con un servidor de reenvío; hay borradores de MLS con ML-KEM.
- **Tasa variable:** Wright y otros (USENIX 2007, IEEE S&P 2008) y White y otros (IEEE S&P 2011) mostraron que el tamaño de
  los paquetes delata el idioma y frases concretas (precisión media del 50 %, más del 90 % en algunas). Ultra: Opus a tasa
  constante, sin DTX y con relleno. [RFC 6562 lo recomienda; comprobado.]
- **Dos relés:** uno solo conoce las dos IP y la hora; dos de operadores y países distintos lo evitan, salvo frente a quien
  vea a la vez la entrada y la salida.
- **Capturas en Windows:** `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)` (Windows 10 2004, valor 0x11) saca la ventana
  de las capturas; no existe en la web; un programa malicioso con privilegios puede quitarlo; una foto al monitor, siempre.
  [Comprobado; Microsoft dice que «no hay garantía».]
- **Grabación:** en el navegador no se puede detectar; en el programa, a medias (sesiones de audio y dispositivos virtuales
  conocidos); se presenta como «detección de grabadoras conocidas», nunca como «imposible de grabar».
- **Lo que tienen otros:** Signal, PQXDH (2023) y SPQR (octubre de 2025) en mensajes, número de 60 dígitos con aviso de
  cambio; WhatsApp, sin postcuántico documentado en chats ni llamadas, código de 60 dígitos y transparencia de claves;
  Threema, clásico, colaboración anunciada con IBM; Wire, MLS sin postcuántico por defecto; Element, Olm/Megolm y SFrame en
  llamadas; Zoom, E2EE postcuántico desde mayo de 2024 con ML-KEM-768 y un código para leer en voz alta; FaceTime, clásico
  en audio y vídeo (PQ3 es de iMessage). [Comprobados Signal SPQR y Zoom; el resto, no.]

## 4. El cambiador de voz (Argon)
- Bajar el tono sin tocar los formantes es lineal y **reversible**; los sistemas de reconocimiento de quien habla
  entrenados con voces cambiadas identifican igual porque miden el tracto vocal. Mejoran algo el coeficiente de McAdams
  (barato, en tiempo real) y la conversión neuronal de voz (más difícil de deshacer, 80–200 ms de retraso). Ninguno oculta
  acento, ritmo, pausas, vocabulario ni lo que se dice. [VoicePrivacy 2024: contra el atacante que conoce el sistema, el
  método de McAdams no mejoró nada en la prueba; ver `claude.md` § 4.]

## 5–7. Prueba, qué sigue gratis y precios (Flash-Lite)
- **3 o 7 días:** 7, sin tarjeta; según «Baremetrics», las pruebas de 7 días convierten un 18–24 %; 3 días son pocos para
  un programa de seguridad que hay que instalar. Pedir tarjeta sube la conversión por despiste y destruye la confianza.
  [Sin enlace a esa cifra; RevenueCat da otros números, ver `claude.md` § 5.]
- **Leyes:** UE y España, aviso claro antes de cobrar y 14 días de desistimiento (los 30 días de reembolso lo superan); EE.
  UU., la regla de la FTC «exige» baja tan fácil como el alta [**anulada** el 8 jul 2025 por el 8.º Circuito; siguen ROSCA y
  las leyes estatales]; Colombia, derecho de retracto en ventas a distancia.
- **Tras la prueba:** acierta el dueño (Blindada sí, Ultra no, VPN no por su coste de red, ZERO sí, Órbita sí). **El
  antivirus no debe apagarse del todo**: dejar el escáner bajo demanda y quitar la protección en tiempo real y las
  actualizaciones automáticas, como Malwarebytes, Bitdefender o Kaspersky.
- **Precios de referencia:** Proton Unlimited ~9,99 €/mes (7,99 en anual); NordVPN 8–12 €/mes; Avast One y McAfee 4–8 €/mes
  el primer año. GUARDIANA es muy barata en comparación. **No conviene un precio aparte para Ultra**: una sola cuota Plus
  con todo. [Proton y NordVPN no comprobados; Mullvad y Surfshark sí, `claude.md` § 6.]
