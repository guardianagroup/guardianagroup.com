# Ronda 92 · lo que comprobó Claude (2 nov 2026)

Fuentes leídas hoy, 2 nov 2026. El código citado es el de `orbita/comunicaciones/` del repositorio de la web (solo lectura).

## 1. Cómo es hoy (código y web)

- **Dos números, no uno.** El **número de seguridad de la llamada** tiene **4 dígitos** (SHA-256 del secreto ECDH, el
  compromiso previo y las dos huellas DTLS; `llamada.js`, `sasCalcula`) y solo se enseña en el blindado y Ultra
  (`app.js`, `sas: extrasB`; «en el modo normal no», 29 oct). El **código grande y rojo** que sale en el centro tiene **6
  dígitos**, sale de la llave de la capa postcuántica (`medios-pq.js`, `codigo`) atado a ese número, cambia con la llave
  **cada 2 minutos** (`ROTA_MS = 120000`) y **sale en cualquier llamada de dos con la capa activa**, también en la normal
  (`codigoAhora` no mira la versión). Es «los números» que el dueño quiere fuera de la gratuita.
- **Ya existe el sitio discreto:** al tocar la cápsula «Encriptada de extremo a extremo» se abre «Seguridad de esta
  llamada» (`pintaSeg`), que ya enseña el código de ahora con su explicación. Quitar la tarjeta roja de la Blindada y dejar
  el código ahí es un cambio pequeño.
- **La renovación de hoy** es una cadena HKDF: cada llave sale de la anterior y las viejas se borran a los 10 s, pero el
  secreto de la sesión del chat sigue en la página mientras dure (`medios-pq.js`, comentario de cabecera). Eso da secreto
  hacia adelante dentro de la llamada; **no da recuperación tras compromiso** (quien robe el secreto puede seguir la
  cadena). Para eso hace falta meter material nuevo cada cierto tiempo (un intercambio ML-KEM/ECDH nuevo), como el SPQR de
  Signal, que se presenta como un trinquete postcuántico que «avanza con regularidad» y da las dos propiedades
  (2 oct 2025, <https://signal.org/blog/spqr/>; habla de mensajes, no de llamadas).
- **Voz:** `voz.js` cambia el tono con una línea de retardo y añade una modulación en anillo para «robot»; el propio
  archivo dice que no oculta acento, palabras ni forma de hablar. «Voz e imagen» ofrece Natural, Más grave, Más aguda,
  Distorsionada, Robótica, Difuminada y Mosaico.
- **La web anuncia tres versiones** (Fuerte, Blindado, Ultra) y una tabla con «Llamadas y videollamadas con número de
  seguridad» marcado en las tres; Ultra dice «Prepago por horas, día o mes, sin cuenta», que choca con «Ultra con la
  suscripción» (`index.html`, «Tres versiones»). La prueba: 7 días sin tarjeta y 30 días de reembolso (`terminos.html`).

## 2. Verificación: qué se pierde sin comparar

- ZRTP (RFC 6189): el número corto detecta a quien se pone en medio; con 16 bits, el atacante tiene 1 entre 65.536 de
  pasar sin que se note (§ 4.4.1.1). Si después no se compara, la **continuidad de claves** (material guardado de la llamada
  anterior) da «una autenticación razonable» frente a quien se pone en medio; un cambio puede ser un ataque o que el otro
  perdió su secreto guardado (§ 1, § 4.3.2) (<https://www.rfc-editor.org/rfc/rfc6189.txt>).
- Cuenta de Claude con el número de 4 dígitos de GUARDIANA (con compromiso previo): quien se ponga en medio en una llamada
  que **se compara** pasa sin que se note 1 vez de cada 10.000; en una llamada que **no se compara**, siempre. Por eso
  quitar el número de la Blindada exige continuidad de claves con aviso, y explicarlo.

## 3. Lo que tienen otros (comprobado lo que lleva enlace)

- **Zoom:** E2EE postcuántico en Meetings desde el 21 may 2024 con Kyber 768 (ML-KEM), Phone y Rooms después
  (<https://news.zoom.com/post-quantum-e2ee/>). **Llamadas con postcuántico ya hay: no se puede decir «primeros».**
- **Signal:** SPQR, 2 oct 2025, mensajes (enlace arriba). Windows 11: «Screen security» activada por defecto en Signal
  Desktop desde el 21 may 2025, con la marca DRM de la ventana para que Recall y otras capturas no la vean; puede molestar a
  lectores de pantalla y lupas (<https://signal.org/blog/signal-doesnt-recall/>).
- **Microsoft:** `WDA_EXCLUDEFROMCAPTURE` (0x11, desde Windows 10 2004) enseña la ventana solo en el monitor; Microsoft
  dice que **no hay garantía** de proteger el contenido, por ejemplo frente a una foto de la pantalla
  (<https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-setwindowdisplayaffinity>).
- **Tasa variable:** la RFC 6562 (marzo de 2012) dice que con información muy sensible **no se usen códecs en modo
  variable**, porque el tamaño de cada paquete depende de lo que se dice (<https://www.rfc-editor.org/rfc/rfc6562>).
- No comprobado hoy: WhatsApp, Threema, Wire, Element y FaceTime (lo de `gemini.md` queda como dicho por Gemini).

## 4. Cambiador de voz

- VoicePrivacy 2024: el atacante «semiinformado», que tiene el sistema que transforma la voz y entrena su reconocedor con
  voces ya transformadas, es «el más fuerte conocido» y el que vale para medir (§ 2.2, § 4.2). En su tabla 9, el método de
  McAdams (B2) da un 4,52 % de error igual en la prueba frente al 4,59 % de la voz sin tocar: **contra ese atacante no
  protege nada** (lectura de Claude de la tabla) (<https://arxiv.org/pdf/2404.02677>). El cambio de tono de GUARDIANA es
  más simple que McAdams.
- Conclusión: dificulta que te reconozca de oído alguien que no sabe qué filtro usas; no engaña a un reconocimiento
  automático preparado; no oculta acento, ritmo, palabras ni lo que dices. Que un tono fijo se pueda «deshacer» del todo:
  no comprobado con fuente hoy (lo dice Gemini).

## 5. Prueba gratis: datos y leyes

- **RevenueCat** (28 sep 2026; más de 17.000 apps, ago 2025–jul 2026): en planes mensuales convierten el 39,6 % las
  pruebas de 4 días o menos y el **45,9 %** las de 5–9 días; en anuales, 24 % frente a **33 %**; su informe de 2026 da una
  mediana del 42,5 % para 17 días o más y del 25,5 % para 4 o menos. Avisa de que es correlación
  (<https://www.revenuecat.com/blog/growth/free-trial-length>). Son apps de móvil, donde la prueba suele pedir medio de
  pago; la de GUARDIANA no lo pide, así que sus porcentajes serán otros.
- **UE:** desde el **19 jun 2026**, la Directiva (UE) 2023/2673 (art. 11 bis de la 2011/83/UE) exige en los contratos en
  línea con derecho de desistimiento un **botón de desistir** visible durante todo el plazo, con un segundo paso para
  confirmar y un acuse en soporte duradero (<https://www.jdsupra.com/legalnews/eu-consumer-protection-law-update-new-9377759/>).
  Los 14 días de desistimiento: no leídos hoy en la fuente.
- **EE. UU.:** el 8.º Circuito **anuló el 8 jul 2025** la regla «click-to-cancel» de la FTC; siguen ROSCA, la ley de la
  FTC y las leyes de renovación automática de más de la mitad de los estados
  (<https://www.gtlaw.com/en/insights/2025/7/eighth-circuit-vacates-ftcs-click-to-cancel-rule>). Gemini la daba por vigente.
- **Colombia:** retracto de **5 días hábiles** desde la celebración del contrato de servicios; no cabe en servicios cuya
  prestación empezó con el acuerdo del consumidor (Ley 1480 de 2011, art. 47, en concepto de la SIC:
  <https://sedeelectronica.sic.gov.co/sites/default/files/normatividad/Concepto_12208265.pdf>).

## 6. Precios de la competencia (comprobado)

- **Mullvad:** 5 €/mes, igual al mes, al año o a diez años; hasta 5 equipos (<https://mullvad.net/pricing/>).
- **Surfshark** (precios «al 30 jul 2026», en dólares): Starter (VPN) 16,45 al mes, 3,39/mes en 12 meses, 2,49/mes en 24;
  **One (VPN + antivirus)** 18,95 al mes, 3,59 y 2,79; One+ 21,85, 7,49 y 4,49 (<https://surfshark.com/blog/surfshark-vpn-plans>).
- **Proton:** VPN Plus y Unlimited (VPN + correo, Pass, Drive) sin precio en la página leída
  (<https://protonvpn.com/support/proton-vpn-plans>). NordVPN, Norton y Bitdefender: no leídos hoy.
- Lectura: GUARDIANA cobra al mes (2,49–4,99) menos que lo que los grandes cobran al mes (16–22 US$) y algo más que sus
  ofertas a 2 años (2,5–4,5 US$). Su ventaja de precio está en el pago mensual sin permanencia.
