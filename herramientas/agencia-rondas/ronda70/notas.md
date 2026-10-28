# Ronda 70 · Comunicaciones: la Sesión blindada · cruce

27 Oct 2026, 22:04–22:30 (Bogotá). Voces: ChatGPT («Alta», con la ampliación F aparte; `chatgpt.md`), Gemini (4 Argon, razonamiento alto; `gemini.md`) y Astra 6 (Cheaper Inference; `astra.md`). Pregunta: `pregunta.md`. Notas escritas a las 22:35. Ninguna voz usó las fuentes prohibidas.

**En una frase:** la blindada vale 10–20 USD/h si vende garantías que el cliente puede comprobar (identidad, aislamiento, evidencia y servicio), no «más encriptación» ni «máxima seguridad»; y las empresas de primer nivel pedirán además pruebas externas que llevan meses.

## Lo que dicen las tres voces (coinciden)

1. **Garantías verificables, no superlativos.** Nada de «imposible de interceptar», «anónima», «borrado total certificado» ni «validez judicial garantizada».
2. **Proteger el código que se sirve al navegador:** CSP estricta, dependencias fijadas, compilaciones reproducibles y versiones firmadas. ChatGPT y Astra lo ponen por delante de todo: sin eso, una página manipulada anula las demás mejoras.
3. **Identidad obligatoria:** no se envía nada hasta que los dos confirman el número de seguridad, y la sesión se bloquea si cambia una clave.
4. **Renovación de secretos:** la cadena HMAC actual no recupera la seguridad tras un compromiso. Hay que renovar con ECDH + ML-KEM cada cierto tiempo y borrar las claves antiguas.
5. **Firmas dobles ECDSA + ML-DSA** (FIPS 204) en la identidad y el comprobante, exigiendo las dos.
6. **Passkeys (WebAuthn)** para autorizar lo crítico.
7. **Sello de tiempo de un tercero (RFC 3161)** sobre la huella del comprobante, sin enviarle el archivo.
8. **Auditoría externa** (revisión criptográfica y prueba de intrusión) antes de vender a empresas, publicando el alcance y lo corregido. Certifica una versión, no la ausencia de fallos.
9. **Tor y redes de mezcla, no por defecto:** demasiado lentos para archivos grandes.
10. **Velocidad:** quitar el límite de 8 MB/s en la blindada. El techo lo marca lo más lento entre la subida del emisor, la bajada del receptor, la ruta y los equipos.
11. **Bancos y brókers (SEC 17a-4, FINRA):** un chat efímero no les basta. Hace falta un modo aparte que guarde una copia encriptada en el archivo del propio cliente.
12. **FIPS 140-3:** usar Web Crypto no lo demuestra por sí solo, y ML-KEM en JavaScript no es un módulo validado.
13. **Lo que pedirá compras:** SOC 2 tipo II e ISO/IEC 27001 (meses), prueba de intrusión, SSO (SAML/OIDC) y SCIM, consola, registros de auditoría exportables, claves del cliente (BYOK/HYOK), acuerdo de nivel de servicio, cuestionarios SIG y CAIQ, contrato de encargado (art. 28 RGPD) y seguro.
14. **Regiones elegidas por el cliente.** Gemini añade dejar constancia en el comprobante, donde ya constan la ciudad y el país del relé.
15. **Ley:** la Ley 527 de 1999 (Colombia), eIDAS (UE) y las FRE 901 y 902(13)/(14) (EE. UU.) dan valor a la evidencia electrónica, pero nada la hace admisible automáticamente. El comprobante no prueba quién tecleó ni que se leyó.
16. **Primeros clientes:** despachos de abogados y operaciones de fusiones y adquisiciones; después, auditorías, investigaciones internas y propiedad intelectual.

## Lo confirman dos voces (la tercera no lo trata o lo matiza)

- **El código de 9 cifras no basta como secreto** (unos 30 bits; ChatGPT y Astra): invitación larga y aleatoria o un PAKE estandarizado (SPAKE2, RFC 9382). Gemini propone un PAKE (SPAKE2+, RFC 9383) para la contraseña de sesión.
- **Doble salto** (ChatGPT y Astra): solo reparte la confianza si los relés son de operadores independientes. Si los dos son de GUARDIANA, GUARDIANA podría correlacionarlos: «dos países no son dos dominios de confianza». Gemini no hace esa salvedad.
- **Relleno moderado y configurable** (ChatGPT y Astra), diciendo qué oculta y qué no; el tráfico constante, solo a petición, porque es caro. Perfiles separados: «Priorizar velocidad» y «Priorizar privacidad de metadatos».
- **Medir antes de usar varios relés en paralelo** (ChatGPT y Astra): primero, relé dedicado sin límite y pruebas reales; ninguna multiplicación de velocidad prometida sin medirla.
- **Borrado criptográfico sin prometer el borrado total** (ChatGPT y Astra): destruir la máquina no demuestra que el proveedor no conserve bloques o registros.
- **El JSON firmado es la evidencia y el PDF su representación** (ChatGPT y Astra). Estados separados: enviado; recibido completo y verificado; guardado; abierto o aceptado, solo con una acción explícita.
- **Límite de ML-DSA** (ChatGPT y Gemini): en JavaScript o WebAssembly no tiene la protección de una clave no exportable. **Límite de las passkeys** (ChatGPT y Astra): pueden sincronizarse, así que no siempre son hardware, y no son una firma jurídica.
- **RFC 3161 no es un sello cualificado eIDAS** (ChatGPT y Astra): para eso hace falta un prestador cualificado. Y un sello sobre nuestro comprobante no nos convierte en servicio de entrega certificada (art. 43).
- **El precio no es para servidores.** El cómputo cuesta céntimos por hora (ChatGPT y Gemini; Hetzner incluye 20 TB al mes en Europa y Vultr cobra 0,01 USD por GB de exceso, por comprobar en una factura real). El margen debe pagar auditorías, sellos, soporte, incidencias y seguro (ChatGPT y Astra).
- **No cobrar hasta tener las garantías** (ChatGPT y Astra), y reservar la decisión de no lanzar si no se demuestra lo prometido.
- **Nombres exactos** (ChatGPT y Astra): SOC 2 es un informe, no una «certificación»; nada de «HIPAA compliant» ni de FIPS. No tener la clave no exime de ser «business associate» en HIPAA, así que no se acepta información médica regulada todavía.
- **Residencia verificable** (ChatGPT y Astra): la empresa define las regiones permitidas, no hay cambio automático a otra región y, si no hay relé permitido, la sesión no empieza.
- **Acuerdo de nivel de servicio sin cifra de disponibilidad** hasta tener evidencias (ChatGPT y Astra). La consola nunca da al administrador las claves de las conversaciones.
- **12 semanas dan para un piloto,** no para la preparación empresarial completa (ChatGPT y Astra). Para sectores regulados, ChatGPT calcula de 18 a 24 meses o más.
- **«Única en el mundo» es humo** sin un análisis documentado de la competencia (ChatGPT y Astra; Gemini lo afirma).

## Donde discrepan

- **FIPS y el acuerdo híbrido.** Gemini sostiene que el híbrido es conforme si uno de los secretos sale de un módulo validado y se combina con una derivación aprobada (NIST SP 800-56C r2). Astra lo niega: «un híbrido no hereda automáticamente la validación». ChatGPT no sabe si se podrá certificar en una web.
  - Claude: SP 800-56C r2 sí admite añadir un secreto auxiliar a uno aprobado, pero eso no hace «validado» al producto: depende del módulo que hace cada operación, del equipo y de su modo. No se afirma nada sobre FIPS hasta un estudio con un laboratorio acreditado.
- **Plazos de SOC 2 e ISO 27001:** Gemini, 4–7 meses en total; ChatGPT, primer informe tipo II entre los meses 9 y 18; Astra, «meses de operación». Claude planifica con el plazo largo y no anuncia fechas.
- **SSO y SCIM:** Gemini, 2–3 semanas; Astra, 2–6; ChatGPT, complejidad «muy alta».
- **Velocidad en paralelo:** Gemini da 50–120 MB/s con 4–8 conexiones por 2–4 relés; ChatGPT y Astra no dan cifras sin medir. No se publica ninguna.
- **Recompensas por fallos:** Gemini, ya; ChatGPT, primero privadas; Astra, después de auditar. Nuestro `security.txt` ya dice que no hay recompensa en dinero.
- **Acuerdo BAA (HIPAA):** Gemini lo propone; ChatGPT y Astra no lo firmarían sin un análisis jurídico.
- **Calendario:** Gemini, todo en 6 semanas; ChatGPT, 12 semanas de piloto; Astra, 12 semanas hasta producción limitada para un solo cliente.
- **Capas y precio:** ChatGPT propone primero Blindada (10 USD/h) y Pro (20 USD/h), y en la F, Profesional por horas y Enterprise por contrato. Astra prefiere precio por hora con capacidad reservada y transferencia incluida publicada. Gemini, pago por horas.

## Lo dice una sola voz (no se publica sin comprobar)

- **Gemini:**
  - cifras: 0,25–2,20 USD/h por cuatro relés y 100 GB, margen del 80–95 %, auditoría 15 000–45 000 USD, intrusión 8 000–25 000 USD, seguro 2 500–7 500 USD al año, llaves físicas 50–90 USD y sellos 0,01–0,15 USD;
  - técnica: computación confidencial (AMD SEV-SNP, Intel TDX), raíz de Merkle de los fragmentos, SHA-512, JSON canónico RFC 8785, firma PAdES del PDF y ECH;
  - y «la primera sala de datos efímera» del mundo.
  - Claude comprobó: nuestra forma canónica ya equivale en la práctica a RFC 8785 para los datos del comprobante (claves en orden de unidades UTF-16; números y textos con la serialización de JavaScript).
- **ChatGPT:** Hetzner puede tardar hasta 48 horas en borrar del todo la imagen de un servidor; los módulos FIPS 140-2 pasaron a la lista histórica el 22 de septiembre de 2026; CAIQ v4.1 es del 27 de enero de 2026; propone un **Centro de confianza** público.
- **Astra:**
  - llamarlo «comprobante de entrega e integridad» y reservar «custodia» para cuando haya cadena de conservación documentada;
  - el tipo detectado por el contenido es orientativo y no certifica que el archivo sea seguro;
  - las huellas pueden revelar coincidencias con archivos conocidos (no publicar un buscador de huellas);
  - dos relés en serie pueden facturar dos salidas;
  - una matriz de localización por categoría de dato.

## Propuesta de Claude: qué distingue a la blindada de la sesión normal

Hoy solo existe la sesión normal, y ya es fuerte: encriptación de extremo a extremo con acuerdo híbrido postcuántico (ECDH P-256 + ML-KEM-768), una clave por mensaje y AES-256-GCM por fragmento. La blindada aún no está construida.

| | Sesión normal (hoy) | Sesión blindada |
|---|---|---|
| Encriptación | Híbrida postcuántica de extremo a extremo | La misma base, más renovación de secretos y firmas dobles ECDSA + ML-DSA |
| Identidad | Número de seguridad recomendado | Obligatoria: nada se envía sin confirmarla; bloqueo si cambia una clave; passkey para autorizar |
| Invitación | Código de 9 cifras, 10 minutos, un solo uso | Invitación larga y aleatoria (enlace o QR) o PAKE |
| Relé | Compartido (Núremberg), 8 MB/s por conexión | Dedicado a la sesión, sin ese límite, solo en las regiones permitidas |
| Metadatos | El relé ve las IP, la sala y el volumen | Perfil a elegir: velocidad o privacidad de metadatos, con sus límites por escrito |
| Comprobante | Firmado por los dos equipos | Además, firma ML-DSA, sello de tiempo de un tercero y estados separados |
| Al terminar | La sala se cierra | Borrado criptográfico y destrucción del relé, con un informe de lo hecho y de lo que no se puede garantizar |
| Servicio | — | Soporte, crédito si falla y documentación de seguridad |

- **Recomendación:** lo que distingue a la blindada es lo que cuesta mantener (relé dedicado, sellos, perfil de metadatos y soporte) y lo que exige más disciplina (verificación obligatoria). Las mejoras de encriptación se estrenan en la blindada y llegan después a la normal: una empresa de privacidad no debe dejar peor protegida, a propósito, la sesión de todos.
- **Para empresas de primer nivel, dos capas.** La idea es de ChatGPT, y los pilotos por cliente de Astra la apoyan.
  - **Blindada Profesional**, por horas (10–20 USD/h): lo de la tabla.
  - **Blindada Empresas**, por contrato: SSO y SCIM, consola sin acceso al contenido, registros exportables, regiones permitidas, modo con archivo del cliente, acuerdo de nivel de servicio y contrato de encargado. Se ofrece solo cuando esté hecho y probado.
- **Lo que ya sirve ante compras:**
  - `security.txt` (RFC 9116) con política de divulgación: acuse en 72 horas y respuesta en 7 días;
  - un comprobante firmado por los dos equipos, con relé, ciudad, país, huellas y cronología, que se verifica sin subir nada;
  - los límites publicados: «Esta versión aún no está auditada por terceros».

### Fases (en orden de valor)

1. **Días 1–10 (código, sin coste):**
   - identidad obligatoria con bloqueo;
   - invitación larga;
   - renovación de secretos;
   - comprobante v2 (estados separados, versión de esquema y de protocolo);
   - prueba de velocidad sin el límite de 8 MB/s en el relé de Miami, que no está en uso;
   - página «Centro de confianza» con lo implementado, lo parcial y lo previsto.
2. **Semanas 3–6:**
   - relé dedicado por sesión, creado y destruido por API en Hetzner o Vultr, con regiones permitidas (necesita una clave de API que pone el dueño y genera gasto);
   - ML-DSA con una biblioteca auditada;
   - sello RFC 3161 (solo la huella; falta elegir proveedor);
   - informe de cierre.
3. **Semanas 7–12:**
   - perfil de privacidad de metadatos;
   - passkeys;
   - revisión criptográfica y prueba de intrusión externas (pedir presupuestos: hoy el coste es «no lo sé»);
   - piloto con uno a tres despachos.
4. **Meses 3–18 (empresas):**
   - SSO y SCIM, consola, registros exportables, acuerdo de nivel de servicio, contrato de encargado, SIG y CAIQ, y seguro;
   - SOC 2 tipo I y después tipo II, e ISO 27001;
   - salud, banca, DORA y FIPS, aparte y con análisis jurídico.

### Decide el dueño

1. Aprobar la diferencia propuesta: garantías, aislamiento, evidencia y servicio. Las mejoras de encriptación llegan después también a la sesión normal.
2. Aprobar las dos capas (Profesional por horas y Empresas por contrato) y no cobrar la blindada hasta que sus garantías estén hechas y comprobadas. Dodo sigue en modo de prueba.
3. Empezar ya la fase 1, que no tiene coste.
4. Autorizar, en la fase 2, el gasto de los relés dedicados (la clave de API la pone el dueño).
5. Pedir presupuestos de auditoría y de prueba de intrusión.
6. Nombre del comprobante: mantener «comprobante de custodia digital» o pasar a «comprobante de entrega e integridad».
   - Claude recomienda el segundo: dice exactamente lo que el dueño pidió («que ha llegado todo correctamente») y un abogado no lo leerá como si GUARDIANA guardara el archivo.
   - Cambiarlo obliga a traducir de nuevo unas quince frases.
7. Dónde empieza el piloto: Colombia, España o EE. UU.
