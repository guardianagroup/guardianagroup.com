# Ronda 67 · Gemini (Argon) · «ZERO entra antes que tú»

27 Oct 2026, ~17:45 (Bogotá). Chat: https://gemini.google.com/app/bec5d33c60c2dc86 (texto completo allí; aquí lo esencial, fiel). Lo que hay que comprobar va marcado.

## A) El mundo hoy

- **RBI (Cloudflare, Menlo, Zscaler, Ericom):** ejecutan la web en la nube y mandan píxeles o un DOM limpio. Son para empresas y hacen el aislamiento invisible, sin sala de espera.
- **Authentic8 Silo:** aislado, para investigación, pero se ve la carga en directo.
- **Island y Prisma Access Browser:** navegadores corporativos locales, no remotos.
- **Safe Links, URL Defense, Mimecast:** reescriben los enlaces del correo y enseñan 1–3 s de «Verificando enlace…»; después la web corre en el equipo de la persona.
- **urlscan.io, Cloudflare URL Scanner, VirusTotal:** informes forenses de 10–30 s; no se navega dentro.
- **Safe Browsing, Web Risk, SmartScreen, Netcraft:** listas en el navegador local.
- **Nadie une** aislamiento en el servidor, comprobación en vivo y señuelos en una experiencia visible para cualquier persona. Ese es el hueco de ZERO.
- **Mejor que ZERO hoy:** redes de millones de sensores, visión artificial para detectar logos de bancos falsos y cajas de arena.

## B) Qué comprobar (todo dentro del servidor de ZERO, sin revelar la web a nadie)

1. **Listas locales:** URLhaus y ThreatFox (abuse.ch, CC0), Phishing.Database (MIT), uBlock Badware (GPLv3) y NoCoin (MIT, criptominería). Uso comercial permitido; menos de 5 ms en memoria (*comprobar licencias*). OpenPhish, PhishTank y Spamhaus DBL piden licencia de pago para uso comercial (*comprobar*).
2. **Google Web Risk:** Update API con prefijos de hash locales. Safe Browsing prohíbe el uso comercial. Dice «gratis hasta 100.000 consultas al mes» (*comprobar*).
3. **Edad del certificado:** el campo notBefore del certificado que Chromium ya recibe (0 ms). CT o RDAP, opcional y en paralelo (RDAP revela el dominio al registro y puede tardar 2–10 s).
4. **Imitación de dominios:** punycode (xn--), mezcla de alfabetos y distancia de texto contra una lista propia de unos 200 bancos y servicios.
5. **Formularios de robo:** campos de contraseña o tarjeta en dominios con certificado reciente o que imitan una marca (inspección del DOM, 10–30 ms).
6. **Saltos, descargas sin clic y ventanas trampa:** eventos de Playwright; mucho ya está en ZERO.
7. **Avisos falsos de virus y ClickFix:**
   - interceptar `navigator.clipboard.writeText` sin gesto;
   - bloquear la pantalla completa sin gesto;
   - detectar textos tipo «Win+R», «powershell», «curl | sh».
8. **Grabación de sesión, huella y minería:** listas + vigilancia de Canvas y AudioContext, WebAssembly con CPU alta, y teclas enviadas a terceros.

- **Cabe en 2,5 s:** listas, prefijos de Web Risk, dominio y punycode, certificado, cargar hasta `domcontentloaded`, saltos iniciales, descargas al abrir, portapapeles, formularios sospechosos y señuelos.
- **No cabe:** malware que espera al ratón o a los 30 s, VirusTotal o cajas de arena, RDAP lento. Esto sigue en segundo plano.

## C) «Rastreadores peligrosos»

- **Peligrosos de verdad:**
  - grabadores de sesión que capturan lo que se escribe (FullStory, Hotjar, LogRocket, Yandex Metrica, Clarity);
  - scripts de terceros en páginas con contraseña o tarjeta (Magecart);
  - huella agresiva;
  - criptominería y portapapeles.
- **Cortarlos siempre:**
  - listas de malware, phishing y minería;
  - en páginas con campo de contraseña o tarjeta, todos los grabadores de sesión de terceros.

  Lo comercial normal se sigue viendo.
- **Fuente:** Princeton, «No Boundaries: Exfiltration of Personal Data by Session-Replay Scripts» (Acar, Englehardt, Narayanan, 2017) (*comprobar autores y año*).

## D) La experiencia

- **Tiempos:** Nielsen (NN/g, «Response Times: The 3 Important Limits»): 0,1 s es instantáneo; 1 s se nota, pero no se pierde el hilo; 10 s es el límite. Presupuesto: 2,5 s.
- **Secuencia:**
  - de 0 a 0,4 s, una web ya comprobada se abre directa con un sello discreto «✓ Comprobada por ZERO»;
  - de 0,4 a 2,5 s, cristal oscuro con tres líneas en vivo.
- **Si tarda más de 2,5 s** con listas, dominio y certificado ya en orden: se suelta y se ve terminar de cargar, con una barra «ZERO sigue vigilando».
- **Frase:** «ZERO abre esta web en un ordenador nuestro, comprueba que no tenga trampas y te muestra la imagen limpia. Nada toca tu equipo.»
- **Al terminar:** una pastilla junto a la barra de direcciones: «✓ Web comprobada · 0 peligros · 4 rastreadores vigilados». Al tocarla, el detalle.
- **Ámbar (algo raro):** dominio de menos de 7 días que pide contraseña, descarga sin clic o nombre parecido a un banco.
  - Se para antes de dejar escribir: «Cuidado: ZERO ha entrado y ve algo inusual…».
  - Botones: «Volver a lugar seguro» (destacado) y «Entrar en modo sellado (sin teclado)».
- **Rojo:** «Paso cortado por ZERO… Tu equipo no ha tenido contacto con ella», con la fuente.
- **Rapidez sin historial:** caché anónima de 10 minutos en memoria, solo con el nombre de la web (nunca rutas ni la persona).

## E) Promesas y ley

- **Prohibido:** «100 % segura», «garantizamos cero malware», «eliminamos todo el peligro».
- **Decir:** «ningún archivo o código de esta web se ejecuta en tu dispositivo» y «no se han detectado amenazas conocidas ni trampas automáticas en la revisión inicial».
- **Términos:** ZERO aísla y comprueba con fuentes conocidas, pero no avala la honradez de una tienda; si la persona entrega su tarjeta a una web falsa aún no listada, ZERO evita la infección, no la entrega voluntaria.
- **Privacidad:**
  - las direcciones no se escriben en disco ni en registros;
  - las listas se descargan enteras: no se pregunta a nadie por la web del cliente.

## F) Único y viral

- **Nombre:** «El Explorador de ZERO» o «ZERO entra primero».
- **Frase:** «El único navegador que entra a la web antes que tú, pisa las trampas en nuestro servidor y solo te abre la puerta cuando el terreno está limpio.»
- **Comprobante para compartir:** solo si la persona lo pide, sin parámetros privados, y con «válido SOLO para ese instante» (riesgo de *cloaking*).
- **Plan:**
  - gratis para todos (el motor viral);
  - de pago:
    - burbujas sin cola;
    - modo «solo mirar» con el teclado bloqueado;
    - enlaces del chat de empresa visitados primero por ZERO.

## G) Plan técnico

- **Días 1–4 (0 US$ en API):**
  1. retener la imagen hasta `domcontentloaded` + 400 ms, con tope de 2,5 s;
  2. listas en memoria, actualizadas cada 30 min;
  3. portapapeles, contraseña + punycode o certificado de menos de 7 días, y modo sellado;
  4. caché de 10 minutos.
- **Semanas 2–3:**
  - corte de grabadores de sesión en páginas con contraseña o pago;
  - tarjeta compartible;
  - Web Risk o RDAP solo para lo ya sospechoso.
- **Coste:** sin servidores nuevos; 30–50 MB de RAM.
- **Riesgos:**
  - **captchas:** si se detecta uno en 500 ms, soltar y decir «la web pide confirmar que eres humano»;
  - **webs lentas:** nunca más de 2,5 s;
  - **falsos positivos:** nunca rojo solo por ser nueva.
