# Ronda 67 · ChatGPT («Alta», con web) · «ZERO entra antes que tú»

27 Oct 2026, 17:40–18:25 (Bogotá). Chat nuevo, «Estrategia de ZERO Guardiana». Texto completo allí (unos 45.000 caracteres); aquí lo esencial, fiel.

**Su propuesta central:** «ZERO entra primero», en tres tiempos:
1. comprobar antes (reputación, identidad del dominio, conexiones, comportamientos, engaños);
2. proteger durante (cada navegación, descarga, formulario y cambio de dirección);
3. explicar después (qué se comprobó, qué se detectó y qué se bloqueó de verdad).

Que el código no se ejecute en el ordenador de la persona no impide que una web le robe la contraseña que ella misma escriba: hay que protegerla del código malicioso y de los engaños.

## A) El mundo hoy

- **RBI (Cloudflare, Menlo, Zscaler, Authentic8 Silo, Palo Alto, Island, Ericom/Cradlepoint), Safe Links, URL Defense, Mimecast, SmartScreen, urlscan.io, VirusTotal, Web Risk, Netcraft:** la tecnología existe. No decir que GUARDIANA inventó «navegar después de comprobar».
- **La diferencia:** una inspección preventiva explicada en lenguaje normal, en un navegador remoto sin instalación, con vigilancia continua y un comprobante comprensible.
- **Lo que no encontró:** pruebas de que algún competidor ofrezca esta experiencia exacta, pero tampoco para declarar a ZERO «el primero del mundo».

## B) Qué comprobar

- **Tres barreras:**
  1. antes de conectar (listas, dominio falso, destinos internos);
  2. primera carga remota, con la imagen retenida;
  3. vigilancia continua.

  Lo peligroso conocido se bloquea en la barrera 1, porque los scripts ya corren durante la primera carga.
- **Licencias:**
  - Web Risk: comercial; Lookup gratis hasta 100.000 al mes y luego 0,50 US$ por 1.000; las confirmaciones de hash de la Update API, 50 US$ por 1.000.
  - Safe Browsing: no comercial.
  - URLhaus y ThreatFox: uso comercial a consultar.
  - PhishTank: autorizado.
  - OpenPhish: consentimiento escrito.
  - Spamhaus DBL: licencia.
  - Phishing.Database y NoCoin: MIT.
  - VirusTotal: prohíbe su API pública en productos comerciales.
- **Su selección:** PhishTank + Phishing.Database + NoCoin + las listas actuales + Web Risk Lookup como respaldo (sabiendo que Lookup envía la URL a Google). Una interfaz de reputación intercambiable.
- **Once controles:**
  - reputación;
  - dominio nuevo (RDAP: una señal, no una prueba);
  - certificado y CT;
  - imitación de marcas (IDNA, Unicode UTS #39, catálogo de dominios oficiales);
  - formularios de contraseña o tarjeta;
  - redirecciones (cada salto vuelve a pasar la barrera 1);
  - descargas, ventanas y permisos;
  - falsas alarmas, falsos CAPTCHA y ClickFix (Microsoft y FTC los documentan);
  - grabación de sesión;
  - huella y minería;
  - destinos internos (SSRF, OWASP).
- **Cabe en 2–3 s:** listas, dominios parecidos, red, TLS y primeras señales.
- **No cabe:** páginas lentas, RDAP sin caché, análisis de archivos, legitimidad de una empresa, lo que aparece tras iniciar sesión o pagar.
- **Clave:** no abrir la web en un navegador de prueba y luego en otro: comprobar en la misma burbuja real, sin interacción, y soltar esa misma imagen. Es lo que hace la versión publicada.

## C) Rastreadores peligrosos

- **Tres categorías:**
  1. **alto riesgo** (malware, minería no autorizada, exfiltración demostrada): bloqueo obligatorio;
  2. **privacidad de alto impacto** (grabación de sesión, captura de lo que se escribe, huella invasiva): bloqueo preventivo cuando la identificación sea fiable;
  3. **seguimiento ordinario:** decide la persona.
- **Fuente:** Princeton CITP (grabadores de sesión que envían lo escrito antes de enviar el formulario).
- **No cortar** todo lo de terceros en páginas de pago (3D Secure y antifraude legítimos). Referencia: PCI DSS 6.4.3.
- **«Cambio imprescindible»:** si el producto dice «te protege antes de entrar», lo de alta confianza debe cortarse por defecto. Mantener «Observación» para ver la publicidad, pero sin quitar nunca los bloqueos esenciales.

## D) La experiencia

- **Textos:**
  - «ZERO entra primero.»
  - «Comprobando la dirección…»
  - «Abriendo la web en nuestra burbuja aislada…»
  - «Revisando conexiones y comportamientos…»
  - «Comprobación inicial terminada. Puedes navegar.»
  - «Hemos encontrado señales que requieren tu atención.»
  - «ZERO ha bloqueado esta página por un riesgo identificado.»
  - «No hemos podido completar todas las comprobaciones.»

  Nada de porcentajes inventados ni de estados que no hayan ocurrido.
- **Tiempos (objetivos, no medidos):** 0–2 s, rápida; 2–5 s, lenta; 8 s como límite. Nunca retrasos artificiales. Cita la guía RAIL de Google.
- **Al terminar:** amenazas detectadas, conexiones bloqueadas (diciendo cuáles) y controles completados.
- **Tres resultados:**
  - A, sin amenazas conocidas: se abre;
  - B, señales sospechosas (dominio reciente que imita una marca): «Volver» (recomendado) o «Continuar con restricciones»;
  - C, amenaza confirmada: bloquear, con «Volver» y «Ver motivo», **sin «Entrar igualmente»** («no pedir decisiones de seguridad a quien no las entiende»).
- **Caché:** global, sin usuario y de corta duración. Advierte de que una caché global también revela qué sitios se consultan; minimizarla.

## E) Promesas y ley

- **No decir:** «100 % segura», «cero malware garantizado», «imposible que te roben», «hemos eliminado todos los rastreadores peligrosos», «completamente fiable», «nadie puede espiarte».
- **Sí decir:**
  - «ZERO comprueba las amenazas conocidas antes de permitirte navegar y mantiene la vigilancia»;
  - «las webs se ejecutan en nuestro navegador remoto»;
  - «en esta comprobación no se han identificado amenazas conocidas».
- **Responsabilidad:** depende de la ley, las promesas y la diligencia. Hacen falta pruebas reproducibles, un canal de reclamaciones y rectificación de falsos positivos.
- **Datos personales:** la IP y la dirección visitada pueden serlo (Ley 1581, arts. 3, 4, 9, 12 y 17; RGPD, arts. 3, 5, 6, 13, 14, 25, 28, 32 y 82).
- **Privacidad mínima:**
  - sin historial individual;
  - sin URLs completas en los registros;
  - sin capturas ni formularios en la telemetría;
  - nada de URLs privadas a analizadores externos;
  - facturación separada de la navegación.
- **No vender como aislamiento total:** un contexto de Chromium por sesión no es una microVM aislada por hardware.

## F) Nombre y viralidad

- **Nombre público:** «ZERO entra primero».
- **Frase:** «ZERO entra primero. Comprueba la web antes de que navegues y sigue vigilando mientras estás dentro.»
- **Comprobante:** «Comprobante», nunca «certificado». Solo el dominio, la hora y el aviso de que caduca; una firma del servidor en una fase posterior. Riesgo: que un estafador use un comprobante viejo.
- **Viralidad y pago:** «no lo sé»; probar con A/B.
- **Precio:** la protección esencial, incluida en todo ZERO (también en la prueba gratis); el comprobante, en el plan de pago.

## G) Plan

| Etapa | Trabajo | Estimación |
|---|---|---|
| 1 | Retener la imagen y la interacción, pantalla, resultado y tope | 2–4 días (hecha hoy) |
| 2 | Control de cada navegación, reputación local, dominios parecidos, tres resultados | 4–7 días |
| 3 | Formularios, ClickFix, grabadores de sesión, fugas | 7–14 días |
| 4 | Comprobantes firmados, más reputación, pruebas de carga, auditoría | por determinar |

- **Costes:**
  - Web Risk: 500.000 consultas al mes ≈ 200 US$;
  - Hetzner CX23: 5,49 €/mes (tabla del 15-jun-2026);
  - el coste por usuario no se conoce sin medir.
- **Pruebas obligatorias:** lista, redirección maliciosa, dominio parecido, descarga, permisos, grabador, ClickFix, pago legítimo, web lenta, destino interno y cambio de destino. Medir p50, p95 y p99, falsos positivos y abandono.
- **No hacer todavía:** una IA que lea cada página; mandar cada visita a VirusTotal o urlscan.
