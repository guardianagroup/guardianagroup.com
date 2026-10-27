# Ronda 67 · Astra 6 (gpt-6-astra, Cheaper Inference) · «ZERO entra antes que tú»

27 Oct 2026, ~18:45 (Bogotá). Playground de Cheaper Inference (pregunta resumida, solo información del producto; tope de 4.096 tokens de salida). Lo esencial, fiel. Astra ya conocía la primera versión publicada.

1. **Dictamen:** la idea vende, pero «ambiente seguro» promete demasiado.
   - Aislar no es lo mismo que detectar: ninguna de las dos certifica que una web sea segura.
   - Como ZERO ya visitó la web, el botón no debería ser «Entrar» sino **«Continuar en ZERO»**: lo que se permite es interactuar.
2. **Competencia:** Cloudflare Browser Isolation, Menlo, Zscaler, Safe Links, urlscan.io. «¿Qué no hace nadie? No lo sé.»
   - Defendible: aislamiento por imágenes + comprobación visible + explicación de bloqueos + decisión informada.
   - No: que ZERO inventó entrar antes.
3. **Qué comprobar** (prioridades, no tiempos medidos):
   - reputación comercial (Web Risk), también en cada redirección;
   - TLS;
   - edad del dominio por RDAP (señal débil, con caché);
   - edad del certificado por CT, fuera del camino crítico;
   - imitación de marcas;
   - formularios de contraseña o tarjeta y su destino;
   - ClickFix y falso antivirus;
   - grabación de sesión y exfiltración;
   - minería (no basta ver WebAssembly).

   Ninguna señal sola demuestra fraude.
4. **Lo primero que añadiría:**
   - comprobar cada redirección;
   - credenciales en un dominio incompatible con la marca;
   - destino de cada formulario antes de enviarlo;
   - ClickFix;
   - vigilancia después de la primera imagen;
   - descargas retenidas hasta aplicar la política.

   No mandar URLs de clientes a urlscan.io («unlisted» no es privado).
5. **La burbuja también es un objetivo:** aislamiento entre sesiones, sin acceso a redes internas, salida controlada y retención mínima. Que una página toque un señuelo es una señal para investigar, no prueba automática de robo.
6. **Rastreadores, en tres grupos:**
   - **bloquear por defecto:** malware, phishing, exfiltración y ladrones de credenciales;
   - **bloquear por privacidad:** rastreo entre sitios, huella y grabación de sesión;
   - **evaluar con contexto:** analítica propia, antifraude, pagos y autenticación.

   En pantalla, sin mezclar para inflar cifras: «Rastreo bloqueado», «Amenaza conocida bloqueada», «Señal sospechosa».
7. **Corregir la primera versión:** los tiempos (load + 300 ms, documento + 400 ms, tope de 2,5 s) son de presentación, no de seguridad. **Si vence el tope, el estado es «comprobación incompleta», no «aprobado».**
   - Estados: comprobando · sin alertas iniciales · rastreo bloqueado · señal relevante (explicar y pedir decisión) · **amenaza confirmada (bloquear, no tratarla como simple aceptación de responsabilidad)** · comprobación incompleta.
   - Ni esperas artificiales ni una confirmación por cada rastreador.
8. **Textos:**
   - «ZERO abre la web en su burbuja y comprueba señales de riesgo antes de mostrártela.»
   - Durante: «ZERO está entrando primero. Chequeando la web…».
   - Sin hallazgos: «No detectamos alertas en las comprobaciones iniciales. La vigilancia continúa.»
   - Con hallazgo, por ejemplo: «Esta página pide una contraseña y presenta señales de imitación de una marca.»
   - Botones: **«Volver · Continuar en ZERO»**, con la nota «La navegación seguirá aislada, pero podrías entregar datos a esta página».
   - Cambiaría «Entrar bajo mi responsabilidad»: no explica el riesgo.
9. **La lista como prueba:** qué observamos → qué hicimos → qué significa. No decir «eliminamos» si solo se bloqueó, ni «bloqueado» si solo se detectó.
10. **No prometer:**
    - «web segura», «cero malware», «fraude imposible»;
    - «detectamos todos los rastreadores», «nadie puede robar tus datos», «no dejas rastro»;
    - «todo comprobado en 2,5 s».

    GUARDIANA opera la infraestructura: hay que explicar accesos, registros y retención.
11. **Nombre:** «ZERO Primero». Frase: **«Primero ZERO. Después tú.»** (comprobar la marca).
12. **Plan en días:**
    - días 1–2: auditoría;
    - días 3–5: reputación, redirecciones y caché;
    - días 6–8: formularios, marcas y ClickFix;
    - días 9–11: vigilancia posterior y clasificación;
    - días 12–15: pruebas y despliegue gradual.

    Medir p50 y p95, falsos positivos y sitios rotos.

Fuentes que cita: Cloudflare, Menlo, Zscaler, Microsoft Safe Links, urlscan.io, Google Web Risk (precios), Safe Browsing (restricción comercial), ICANN RDAP y RFC 9162. «No he comprobado en vivo cambios de catálogo o tarifas».
