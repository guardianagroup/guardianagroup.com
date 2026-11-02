# Ronda 92 · decisiones (2 nov 2026) · **propuesta, pendiente del visto bueno del dueño**

Une a Gemini (`gemini.md`: Argon para los puntos 1–4, Flash-Lite para el 5–7) y lo comprobado por Claude (`claude.md`).
Lo marcado «por construir» no se anuncia hasta que funcione.

## 1. Dos versiones: Blindada (gratis) y Ultra (dentro de Plus)
La web deja de decir «Fuerte / Blindado / Ultra» y pasa a dos columnas. La Blindada es la llamada de hoy.

**Blindada, gratis siempre**
- Encriptación de extremo a extremo por los relés de GUARDIANA (ninguno ve la IP del otro) y la capa postcuántica con
  ML-KEM-768 y llave nueva cada 2 minutos, como hoy.
- **Sin números en pantalla**, como pide el dueño: ni la tarjeta roja ni ventanas. La comprobación se queda **discreta**
  dentro de «Seguridad de esta llamada» (se abre tocando «Encriptada de extremo a extremo»), que ya enseña el código de la
  capa; ahí iría el número de 4 dígitos de la llamada, que hoy solo sale en el blindado y se compara una vez.
- **Continuidad de claves con aviso** (por construir): cada equipo recuerda la llave de su contacto y, si cambia, lo dice
  claro antes de seguir. Es lo que sostiene la seguridad cuando nadie compara (RFC 6189: «autenticación razonable»).
- Voz natural e imagen sin filtros (hoy la llamada normal trae cambios de voz: pasarían a Ultra); archivos y paso al
  teléfono, como hoy.

**Ultra, con la suscripción**
- **El código grande y rojo** que cambia cada 2 minutos con «Coinciden / No coinciden», como hoy.
- Acuerdo de la llamada con **ML-KEM-1024 + ECDH P-384** (la suite que hoy usa el chat blindado) y firmas postcuánticas.
- **Mosaico, difuminado y voz distorsionada**, hechos en el equipo antes de encriptar.
- Ya anunciado para Ultra: doble camino entre relés, archivos de hasta 1 TB, recibo de entrega firmado.
- **Por construir, en este orden** (todo real y comprobable):
  1. **Llave nueva de verdad cada pocos minutos**: un intercambio ML-KEM + ECDH nuevo dentro de la llamada, no solo
     derivada de la anterior. Da recuperación tras compromiso, que la cadena de hoy no da.
  2. **Audio a tasa constante**, sin DTX y sin la extensión que dice el volumen de cada paquete (RFC 6562): el tamaño de
     los paquetes deja de delatar lo que se dice.
  3. **Dos relés de operadores y países distintos**: ninguno ve las dos IP. Cuesta el doble de tráfico.
  4. **En el programa de Windows**: la ventana fuera de las capturas (`WDA_EXCLUDEFROMCAPTURE`, como hace Signal) y aviso
     de grabadoras conocidas abiertas (el Vigía ya pausa la llamada si algo escucha o mira).
- Lo que nunca se dirá: «imposible de grabar», «imposible de abrir», «la más segura del mundo», que cumple normas que
  nadie ha comprobado, ni «primeros en postcuántico» (Zoom lo tiene en llamadas desde 2024).

**Texto honesto para la Blindada** (adaptado de Gemini): «Tu llamada va encriptada de extremo a extremo. GUARDIANA
recuerda la llave de tu contacto y te avisa si cambia. Si quieres comprobar ahora que nadie, ni siquiera nuestro servidor,
se ha puesto en medio, toca el candado y comparad de viva voz el código de 4 dígitos. En Ultra, el código está siempre a la
vista y cambia cada 2 minutos.»

## 2. El cambiador de voz, en la pantalla y en la web
«Dificulta que te reconozcan de oído quienes no saben qué filtro usas. No engaña a un sistema de reconocimiento automático
preparado para ello, ni oculta tu acento, tu ritmo ni lo que dices.» (VoicePrivacy 2024: un método más fuerte que el de
GUARDIANA no protegió nada contra el atacante que conoce el sistema.) Mejorarlo más (conversión de voz en el equipo) se
estudia aparte: más retraso y más procesador.

## 3. Prueba: 7 días, sin tarjeta
- **7 días, no 3.** Las pruebas de 5–9 días convierten más que las de 4 o menos (RevenueCat: 45,9 % frente a 39,6 % en
  mensuales; 33 % frente a 24 % en anuales; es correlación y en apps de móvil). Un programa de seguridad que se instala
  necesita días para enseñar datos (Órbita, radiografías). Se mantiene sin tarjeta y con 30 días de reembolso.
- Justo: aviso dentro del programa dos días antes de acabar; nada se cobra solo (sin tarjeta no se puede); baja y
  reembolso en un clic. **UE**: botón de «desistir del contrato aquí» en la web donde se compra o se gestiona la licencia,
  obligatorio desde el 19 jun 2026 (Directiva 2023/2673) si hay derecho de desistimiento. **Colombia**: retracto de 5 días hábiles. **EE. UU.**:
  ROSCA y leyes estatales (la regla federal se anuló en julio de 2025).

## 4. Qué sigue funcionando al acabar la prueba
- **Sí, gratis:** llamadas y chat Blindada; el navegador ZERO; Órbita con sus datos y radiografías.
- **No (Plus):** VPN (cuesta tráfico de verdad: ronda 91); llamadas Ultra.
- **Antivirus: decide el dueño.** Propuesta: siguen gratis el escáner y lo que enseña (quién usa cámara, micrófono y
  pantalla; avisos); pasan a Plus la protección en tiempo real propia y la cuarentena. Así nadie queda sin protección:
  Microsoft Defender sigue activo en el equipo (GUARDIANA convive con él, ronda 88). Las dos voces de Gemini piden no
  apagarlo del todo.

## 5. Precio
- **Una sola cuota Plus con todo** (VPN, Ultra y protección en tiempo real), sin precio aparte para Ultra: lo recomiendan
  las dos respuestas de Gemini y encaja con la ronda 88. Quitar de la web «Prepago por horas, día o mes, sin cuenta» de
  Ultra, o decidir que sigue como opción.
- Referencias (leídas hoy): Mullvad 5 €/mes fijos; Surfshark One (VPN + antivirus) 18,95 US$ al mes o 2,79–3,59 US$/mes
  pagando 1–2 años. Plus, a 2,49–4,99 al mes sin permanencia, es barato; el margen lo decide el tráfico de la VPN
  (ronda 91, § 5), no el precio de la competencia.

## 6. Decisiones del dueño
1. Visto bueno a las dos versiones y a «sin números en pantalla» en la Blindada, con el código dentro del candado y la
   continuidad de claves con aviso.
2. Qué pasa con el antivirus tras la prueba (propuesta del § 4).
3. 7 días (propuesto) o 3.
4. Ultra: solo con Plus, o también prepago por horas o días.
5. Orden de construcción de Ultra (§ 1, por construir).
