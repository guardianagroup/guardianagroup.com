Ronda 67 · GUARDIANA · «ZERO entra antes que tú»: el navegador que entra primero en la web, la comprueba y solo entonces te deja pasar (27 Oct 2026). Máximo razonamiento, a fondo.

Eres parte de la agencia de GUARDIANA. Responde en español, concreto, en bloques cortos y numerados. No inventes cifras, funciones ni estudios: fuente oficial o «no lo sé». Nada de promesas absolutas.

**El dueño (17:25–17:28):**
- «El navegador debería funcionar en webs donde estamos seguros de que no hay malware ni robo de datos: entrar nosotros primero, verificar, y después damos el ok y el cliente ve la web; mientras hacemos el chequeo decimos "Chequeando la web".»
- «Es novedosa y viral: el navegador que entra antes que tú a una web y verifica antes de que entres tú.»
- «El cliente escribe en el navegador y pulsa Enter. Hay que hacerle entender que hemos entrado nosotros primero, que estamos chequeando que el ambiente es seguro, que eliminamos los rastreadores peligrosos, y luego entra él. Así evitamos el malware y todo lo posible, absolutamente todo.»
- «Trabaja con la agencia en eso profundamente.»

**Qué es ZERO hoy (hechos, del código):**
- **Navegador remoto:** la web se abre en un Chromium en nuestro servidor (la «burbuja», un contexto aislado por sesión). La persona solo recibe imágenes de la pantalla y manda ratón y teclado. Nada de la web se ejecuta en su equipo.
- **Listas de webs peligrosas:** antes de cargar, la dirección se compara con listas públicas. Hoy, uBlock Origin «badware» (unas 5.000 reglas); además EasyList, EasyPrivacy y las listas de uBlock para publicidad, rastreo y cookies. Si coincide, ZERO no la abre.
- **Certificado TLS:** si no supera la comprobación de Chromium, no se abre.
- **Enlaces limpios:** quita de los enlaces los identificadores de seguimiento.
- **Cortes:** por defecto ZERO deja ver todo (publicidad, rastreo, subastas de anuncios) y la persona corta por grupos o por empresa. Lo peligroso se corta siempre. Con Tor corta de entrada.
- **Descargas:** quedan retenidas en la burbuja (tamaño, tipo, huella SHA-256, listas) y solo llegan al equipo si la persona lo pide.
- **Ventanas, avisos y permisos:** ventanas y avisos emergentes cerrados; permisos (cámara, micrófono, ubicación…) denegados; WebRTC desactivado.
- **Señuelos:** datos falsos plantados en la burbuja (texto oculto, cookie, almacén, enlace oculto). Si salen hacia otra empresa, es una fuga demostrada.
- **Vigilancia por puntos:** huella digital, permisos, ventanas, descargas, redirecciones, certificados y webs peligrosas suman puntos. Niveles: vigilar, cortar a terceros, sellar (sin red ni programas) y destruir.
- **Hoy y desde esta ronda:** hoy la persona ve la web mientras carga. La primera versión de «ZERO entra antes que tú» (en construcción) retiene la imagen hasta terminar la comprobación y muestra «Chequeando la web…» con los pasos reales.

LO QUE TE PIDO:

A) **El mundo hoy.** Quién hace algo parecido y cómo:
- Aislamiento remoto del navegador (RBI): Cloudflare Browser Isolation, Menlo Security, Zscaler, Authentic8 Silo, Palo Alto (Prisma Access Browser), Island, Ericom.
- Comprobación de enlaces en el momento del clic: Microsoft Defender Safe Links, Proofpoint URL Defense, Mimecast.
- Analizadores de webs: urlscan.io, VirusTotal, Google Safe Browsing / Web Risk, Microsoft SmartScreen, Cloudflare Radar URL Scanner, Netcraft.
- ¿Alguno lo ofrece a personas normales y de forma visible («entramos primero, ahora entra tú»)? ¿Qué hacen mejor que ZERO y qué no hace nadie?

B) **Qué comprobar en esos segundos** (lo que de verdad detecta malware, robo de datos y fraude). Para cada comprobación: qué detecta, fuente o técnica, coste y licencia (uso comercial), tiempo que añade y privacidad (si revela a un tercero la web visitada).
- Reputación: Google Web Risk (Safe Browsing no permite uso comercial), URLhaus y ThreatFox (abuse.ch), PhishTank, OpenPhish, Spamhaus DBL, Phishing.Database y listas de criptominería.
- Edad del dominio (RDAP) y del certificado (Certificate Transparency).
- Dominios que imitan a otros: letras de otros alfabetos (punycode), errores de escritura, marcas.
- Formularios que piden contraseña o tarjeta en una web nueva o que imita a otra.
- Comportamientos:
  - saltos y redirecciones;
  - descargas automáticas y ventanas;
  - avisos falsos de «tu equipo tiene virus»;
  - ataques que piden pegar comandos (ClickFix);
  - notificaciones;
  - criptominería;
  - grabación de sesión (lo que escribes);
  - huella digital.
- Qué se puede hacer en menos de 2–3 segundos y qué no.

C) **«Eliminamos los rastreadores peligrosos».**
- ¿Qué rastreadores son peligrosos de verdad, no solo molestos? Por ejemplo: grabadores de sesión que capturan lo que escribes, huella digital, scripts de terceros en páginas de pago, criptominería.
- ¿Cortarlos siempre por defecto, aunque el resto se deje ver?
- Fuentes.

D) **La experiencia, fácil de entender:**
- Qué ve la persona desde que pulsa Enter hasta que entra: textos exactos de cada paso, cuánto puede durar sin que se aburra (estudios, si los hay) y qué pasa si tarda.
- Cómo hacer entender «hemos entrado nosotros primero» en una frase y una imagen.
- Qué enseñar al terminar: «Web comprobada», lo que se encontró y lo que se cortó.
- Si hay algo raro (dominio de hace 3 días, imita a un banco, descarga automática): ¿se detiene y se pregunta («Entrar igualmente» / «Volver»), o se avisa y se entra?
- Si es peligrosa: qué ve.
- Webs conocidas o comprobadas hace poco: ¿más rápido? Sin crear un historial de la persona.

E) **Promesas y ley:**
- Qué no se puede decir («100 % segura», «sin malware garantizado») y qué sí («ZERO no ha visto peligros conocidos»).
- Responsabilidad si una web comprobada resulta peligrosa.
- Privacidad: nosotros vemos qué web pide la persona. Cómo no guardar historial, y cómo consultar la reputación sin revelar la web (prefijos de hash, listas locales). Ley 1581 y RGPD.

F) **Lo que la hace única y viral:**
- Nombre de la función y frase de una línea.
- ¿Un comprobante compartible de la comprobación («ZERO comprobó esta web a las 17:30»)? Riesgos.
- ¿Pagaría la gente por esto? ¿En qué plan va?

G) **Plan técnico:**
- Qué construimos primero (en días) y qué después.
- Cuánto cuesta (APIs y servidores).
- Riesgos: webs que detectan robots, captchas, webs lentas, falsos positivos.
