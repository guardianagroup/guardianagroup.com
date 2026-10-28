# Ronda 67 · «ZERO entra antes que tú» · cruce

27 Oct 2026, 17:40–18:45 (Bogotá). Voces: ChatGPT («Alta», con web; `chatgpt.md`), Gemini (Argon; `gemini.md`) y Astra 6 (Cheaper Inference; `astra.md`). Pregunta: `pregunta.md`. Notas escritas a las 20:20.

## Lo que dicen las tres voces (coinciden)

1. **La tecnología existe** (aislamiento remoto de Cloudflare, Menlo o Zscaler; Safe Links; urlscan.io; Web Risk): no decir que GUARDIANA inventó comprobar antes de navegar. La diferencia es una comprobación visible y explicada, en un navegador remoto sin instalación, para cualquier persona.
2. **Qué comprobar:**
   - listas de reputación, también en cada redirección;
   - certificado y conexión;
   - dominios que imitan marcas (punycode, mezcla de alfabetos);
   - formularios de contraseña o tarjeta y su destino;
   - descargas, ventanas y permisos;
   - falsos avisos y ClickFix;
   - grabadores de sesión y minería;
   - direcciones internas.

   Ninguna señal sola demuestra fraude.
3. **Licencias:** Safe Browsing, solo no comercial; Web Risk, comercial y de pago; Phishing.Database y NoCoin, MIT; OpenPhish, con consentimiento escrito; Spamhaus DBL, con licencia.
4. **Tres resultados:** sin amenazas conocidas, se abre; con señales, se explican y la persona decide; **con amenaza confirmada, se bloquea, sin «entrar igualmente».**
5. **Si se agota el tiempo, el estado es «comprobación incompleta», no «aprobado»** (Astra). Nunca esperas artificiales.
6. **No prometer** «web segura», «cero malware» ni «eliminamos todos los rastreadores».
7. **Privacidad:** caché anónima y breve, solo con el nombre de la web; sin historial individual ni URL completas en los registros; nada de enviar direcciones de clientes a analizadores externos (en urlscan.io, «unlisted» no es privado).

## Donde discrepan

- **Nombre:** «ZERO entra primero» (ChatGPT), «Primero ZERO. Después tú.» (Astra), «El Explorador de ZERO» (Gemini). La web usa «ZERO entra antes que tú».
- **Tiempo:** tope de 2,5 s (Gemini y la primera versión) o rápida hasta 2 s, lenta hasta 5 y límite de 8 (ChatGPT).
- **Con señales:** «Volver» o «Continuar en ZERO» (Astra y ChatGPT) o «Volver a lugar seguro» y un modo sellado sin teclado (Gemini).
- **«Nadie lo hace»:** lo afirma Gemini; ChatGPT y Astra dicen que no lo saben.
- **abuse.ch (URLhaus, ThreatFox):** Gemini lo da por CC0; ChatGPT, uso comercial por consultar. Claude comprobó en la ronda 69 que solo Feodo Tracker es CC0.
- **Comprobante para compartir:** de pago (ChatGPT) o solo a petición y «válido solo para ese instante» (Gemini).

## Lo que ya está hecho (publicado)

- ZERO comprueba la web dentro de la burbuja antes de mostrarla.
- **Riesgo grave, sin acceso** (dueño, 18:40): lista de webs peligrosas, certificado que falla, contenido peligroso dentro o dirección interna. Solo «Volver».
- Con señales: «Volver» o «Continuar en ZERO».
- Detalle de lo detectado:
  - el archivo (nombre, tipo real, tamaño, origen y SHA-256);
  - la lista que lo identifica;
  - el motivo del certificado;
  - el destino de los formularios;
  - el texto de los mensajes emergentes.
- Redacción profesional y en lenguaje claro, en 42 idiomas.

## Pendiente (ZERO v2, propuesta de Claude)

1. Comprobar cada redirección y el destino de los formularios con contraseña o tarjeta.
2. Detectar ClickFix y el falso soporte técnico.
3. Cortar los grabadores de sesión.
4. Listas con licencia comprobada: Phishing.Database (MIT), NoCoin (MIT) y Spamhaus DROP (con atribución). Web Risk, opcional y de pago.
5. Pruebas: lista, redirección maliciosa, dominio parecido, descarga, permisos, grabador, ClickFix, pago legítimo, web lenta y dirección interna. Medir p50 y p95, falsos positivos y webs que dejan de funcionar.
