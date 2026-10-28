# Ronda 66 · ChatGPT («Alta», con web) · acabar con la suplantación de empresas

27 Oct 2026 (Bogotá). Chat «Propuesta Control IA». Texto completo allí; aquí lo esencial, fiel. Con *(comprobar)* van las cifras y fechas que cita y que aún no hemos verificado con la fuente primaria. Con **❗** van los puntos en los que no coincide con Gemini (`gemini.md`).

**Decisión:** crear dentro de Comunicaciones un servicio nuevo, **GUARDIANA · CANAL VERIFICADO**.

- **Promesa:** «Antes de pagar una factura o aceptar un cambio de cuenta bancaria, comprueba que la orden procede de tu proveedor y ha sido autorizada.»
- No es otro correo, otro banco ni otro antivirus: es una relación de confianza verificable entre dos empresas, en la que las instrucciones delicadas quedan vinculadas criptográficamente a personas autorizadas.
- **Regla fundamental:** una orden de pago no se considera autorizada solo porque parezca proceder del jefe, del contador o de un proveedor conocido.

## A) El problema

- **FBI IC3, informe 2025** (publicado el 6 Abr 2026 *(comprobar)*):
  - BEC: 3.046,6 M US$ en pérdidas denunciadas y 24.768 denuncias (coincide con Gemini);
  - serie: 2,9 (2023), 2,8 (2024) y 3,0 (2025) miles de M US$ *(comprobar)*;
  - segunda categoría con más pérdidas, después del fraude de inversiones;
  - BEC con participación de IA: más de 30 M US$, una subcategoría que no se suma al total (coincide con Gemini: 30,2 M).

  Son pérdidas denunciadas al IC3, no una estimación mundial, y no demuestran cuántos fraudes podría evitar GUARDIANA.
- **Europol:** dos modalidades, el falso director (urgencia y presión para saltarse las autorizaciones) y el falso proveedor (cambio de datos bancarios). Recomienda verificar por procedimientos internos y contactos ya conocidos, nunca con los datos del mensaje sospechoso.
- **Cómo se hace:** dominios parecidos, cuentas de correo comprometidas, facturas manipuladas y voces o vídeos falsificados.
- **IA:** no plantea detectar voces falsas como defensa principal. «Una voz auténtica no sustituye una autorización criptográfica. Una voz falsa tampoco debería servir para saltársela.»
- **Colombia:**
  - la Superfinanciera describe suplantaciones de empresas (campaña de junio de 2026 *(comprobar)*);
  - el CSIRT de la Policía publica indicadores de campañas maliciosas;
  - no hay una cifra oficial de pérdidas por BEC comparable con la del FBI, y no se debe extrapolar (coincide con Gemini).
- **Clientes prioritarios:** pymes con proveedores habituales, tesorerías, contadores, inmobiliarias y despachos que gestionan fondos de clientes.

## B) Lo que existe y por qué no basta

- **SPF, DKIM y DMARC** (RFC 7208, 6376 y 7489): comprueban servidores, firma e integridad del correo y alineación del dominio. No pueden asegurar que el directivo autorizara la transferencia, que la cuenta de correo no esté comprometida ni que el proveedor legítimo no envíe instrucciones fraudulentas desde su propia cuenta. **Diferencia de GUARDIANA:** firmar la autorización de una operación concreta, no solo el mensaje.
- **BIMI con VMC/CMC:** ayuda a reconocer marcas; un logotipo autenticado no autoriza a cambiar una cuenta. No copiar el distintivo de Gmail ni presentarlo como certificación bancaria.
- **Verificación bancaria:**
  - Trustpair: validación de proveedores y cuentas, seguimiento de cambios y revisión humana;
  - Eftsure: comprobación de datos bancarios con varias fuentes;
  - Confirmation of Payee (Reino Unido) y Verification of Payee (UE): comparan nombre y cuenta antes de pagar, pero no demuestran quién autorizó la factura;
  - VoP: obligatoria en la zona euro desde el 9 Oct 2025 (coincide con Gemini); en los Estados sin euro, 9 Jul 2027 *(comprobar)*.

  Conclusión: autorización de la empresa y verificación del beneficiario son controles distintos, y ambos importan.
- **Colombia:**
  - Bre-B (Banco de la República) muestra el nombre enmascarado del receptor de la llave antes de confirmar: es una comprobación parcial del destinatario;
  - no ha encontrado una API pública comercial que permita comprobar la titularidad de cualquier cuenta frente a un NIT. **❗ Gemini** afirma que ACH cruza el NIT con la titularidad: por comprobar.

  Rótulo inicial que propone: «Cuenta declarada por una empresa verificada en GUARDIANA. Titularidad bancaria no verificada independientemente». Nunca «Cuenta bancaria verificada» sin un servicio autorizado que lo compruebe.
- **Firmas digitales y llamadas:**
  - la firma detecta modificaciones, pero no demuestra que la orden sea conveniente, que el firmante conserve sus facultades ni que su dispositivo esté limpio;
  - la llamada a un número ya registrado sigue siendo útil, pero una voz conocida no basta.

## C) El diseño de CANAL VERIFICADO (arquitectura conceptual, no operativa)

1. **La confianza se establece una vez.** Proveedor y cliente abren un canal en GUARDIANA, que distingue mensajes, documentos firmados, instrucciones de pago, cambios de cuenta y autorizaciones excepcionales. Un correo externo nunca se convierte por sí solo en una instrucción autorizada.
2. **Alta de empresa en tres niveles:**
   1. control del dominio por un registro DNS temporal (control técnico, no identidad legal);
   2. existencia legal: razón social, NIT y matrícula mercantil en el RUES;
   3. representación: quien da de alta la empresa tiene facultades (documentación vigente y contacto independiente) y designa a los trabajadores autorizados.

   El RUT es información tributaria complementaria y no acredita la representación. Las empresas extranjeras, con fuentes oficiales equivalentes.
3. **Identidad sin distintivos ambiguos:** estados separados («Registro empresarial comprobado», «Control del dominio comprobado», «Representante autorizado comprobado», «Titularidad de cuenta bancaria pendiente de comprobar»), cada uno con fecha y método, y revisados periódicamente.
4. **Claves:**
   - separar las de conversación de las de autorización empresarial;
   - passkeys (WebAuthn) para acceder y aprobar;
   - claves de firma por dispositivo y trabajador: ECDSA P-256 al principio y ML-DSA (FIPS 204) cuando su implementación esté probada y auditada;
   - firma vinculada a la versión exacta de la operación;
   - directorio de claves con historial verificable, avisos de sustitución y revocación.

   WebAuthn autentica una credencial; la firma empresarial debe ir ligada al contenido autorizado. Una contraseña nunca sustituye una firma de aprobación. **❗ Gemini** propone Ed25519 + ML-DSA-65 desde el principio: decisión técnica pendiente.
5. **Cambio de cuenta, el procedimiento más riguroso:**
   1. el proveedor elige «Solicitar cambio de cuenta»;
   2. indica la cuenta nueva, el banco, el titular declarado y el motivo (se muestra la cuenta anterior);
   3. un responsable autorizado firma desde su dispositivo;
   4. un segundo responsable independiente firma la misma versión;
   5. GUARDIANA avisa a los responsables registrados y aplica un periodo de espera configurable;
   6. la empresa pagadora lo contrasta por un contacto ya conocido y, si es posible, con el banco;
   7. sus responsables autorizan actualizar el beneficiario.

   - Solo entonces aparece «Cambio aprobado por las partes», sin afirmar una verificación bancaria que no se hizo.
   - La misma persona no puede pedir y aprobar, ni dos claves del mismo dispositivo simular independencia.
   - Las 24 h de espera serían una política propuesta, no un requisito legal. **❗ Gemini:** 48 h y un aviso durante 30 días.
6. **Si el supuesto director exige saltarse el procedimiento:** pantalla «Cambio de cuenta bloqueado. La solicitud no cuenta con las autorizaciones necesarias», con la cuenta anterior y la solicitada (terminaciones ficticias) y la indicación «Confirma la solicitud con tu proveedor mediante un contacto que ya tuvieras registrado. No utilices el teléfono incluido en el mensaje sospechoso». Nadie, ni el director real, cambia las reglas en silencio. Las excepciones de emergencia siguen un procedimiento aparte, más exigente, aprobado antes y registrado.
7. **GUARDIANA VERIFICA:** herramienta gratuita para comprobar la procedencia de facturas e instrucciones.
   - El sello vincula la identidad emisora y sus claves, la huella del documento, la operación y su versión, las firmas y aprobaciones y el estado de revocación.
   - No basta con firmar el PDF: importe, moneda, beneficiario, cuenta y referencia deben formar parte de una representación canónica firmada.
8. **Comprobar gratis y sin cuenta:**
   - entrando por uno mismo en guardianagroup.com («Verificar documento»), con el archivo o un código;
   - la firma puede comprobarse en el propio navegador, sin enviar el documento;
   - resultados: «Firma válida», «Empresa comprobada», «Firmante autorizado», «Cuenta bancaria no comprobada», «Documento modificado», «Estado desconocido».

   Un QR también puede llevar a una web falsa: siempre debe poder comprobarse desde el dominio oficial. Referencia abierta: credenciales verificables del W3C.
9. **Transparencia:**
   - registro público de altas, revocaciones y cambios de claves, sin documentos ni datos bancarios completos;
   - árboles de Merkle, pruebas de inclusión y consistencia y verificadores independientes (modelo Certificate Transparency: hace detectables los cambios, no los impide);
   - no anunciar «blockchain».
10. **Voces y vídeos falsos:**
    - descarta una palabra secreta fija (se puede escuchar, filtrar o grabar);
    - propone un reto de un solo uso: el empleado abre GUARDIANA por un acceso conocido, elige «Comprobar esta orden», y el directivo debe aprobar exactamente esa orden desde su dispositivo registrado;
    - no es infalible ante un dispositivo controlado por el atacante, una coacción o el robo de claves.

    **❗ Gemini** propone tres palabras que cambian cada 60 s o «Autorizar con huella»; ambos coinciden en apoyarse en el dispositivo registrado.
11. **Lo que diferenciaría a GUARDIANA:**
    - no afirmaría que nadie en el mundo hace algo parecido (Trustpair, Eftsure y los sistemas bancarios ya cubren partes importantes);
    - la diferencia sería integrar identidad empresarial, canal encriptado, autorizaciones independientes, cambios de cuenta firmados, comprobación gratuita y registro verificable, con una interfaz comprensible para pymes;
    - **humo:** decir que las firmas poscuánticas, por sí solas, eliminan el fraude (la mayoría de los ataques explotan errores humanos o identidades comprometidas).

    **❗ Gemini** afirma que «nadie» vigila la antigüedad de la cuenta en las facturas; Trustpair sí hace seguimiento de cambios. No publicable.

## D) Fácil de usar

- **Pantalla de la tesorera** («Pagos y proveedores · GUARDIANA · Canal Verificado»), sin algoritmos ni códigos:
  - «Verificar factura»: comprueba quién la autorizó;
  - «Comprobar cuenta»: revisa los datos para pagar;
  - «Mis proveedores»: empresas y contactos;
  - «Libro de operaciones»: cambios y aprobaciones.
- **Una comprobación real:**
  - NÚCLEO pregunta «¿Quieres comprobar esta factura antes de pagar?»;
  - GUARDIANA verifica la firma, los datos, el estado del proveedor y si la cuenta coincide con la aprobada;
  - si hay un cambio pendiente, no muestra ningún botón que invite a pagar a la cuenta nueva: explica qué falta y ofrece pedir comprobación;
  - la ficha separa «Autorizaciones completas» de «Titularidad bancaria comprobada» (solo si se comprobó);
  - la transferencia se sigue haciendo desde el banco.
- **Gratis para la empresa invitada:** recibir la invitación, ver y responder solicitudes, comprobar facturas firmadas, confirmar un contacto y firmar la respuesta que se le pide. **Con plan:** administrar proveedores propios, crear políticas y aprobaciones e iniciar canales. La empresa suscrita cubre, dentro de una cuota, las verificaciones de sus proveedores. El invitado nunca paga por comprobar que una solicitud es auténtica.

## E) Ley y promesas

- **Verificación no es autorización estatal.** Rótulo: «Empresa comprobada por GUARDIANA mediante registro mercantil, dominio y representación, con fecha y alcance de las verificaciones». Un NIT válido no hace a una empresa fiable ni solvente.
- **Ley 527 de 1999:** efectos jurídicos de los mensajes de datos (arts. 10 y 11, admisibilidad y valoración; art. 28, atributos de la firma digital). GUARDIANA genera evidencias técnicas, pero no puede llamar a sus sellos «firma digital certificada», «certificación legal de empresa» ni «garantía de pago». Para firmas reguladas, integrar proveedores acreditados.
- **Datos personales (Ley 1581, RGPD):** política específica para representantes y trabajadores. Que un dato empresarial sea público no lo hace libremente reutilizable. El libro de operaciones no debe convertirse en vigilancia de empleados, y los datos bancarios completos no se muestran por defecto.
- **Responsabilidad:** no se puede trasladar todo al cliente con una cláusula genérica.
  - **Casos a estudiar jurídicamente:** verificar mal una representación, aceptar una aprobación fuera de las reglas, alterar datos firmados por un fallo, una revocación o recuperación irregular, una pérdida de información, o presentar como bancaria una verificación solo documental.
  - **Fuera de nuestro control:** coacciones, pagos fuera del canal y dispositivos comprometidos.

  Contrato profesional claro, análisis jurídico y, si el riesgo lo justifica, una póliza (sin prometer que lo cubra todo).
- **Frases:**
  - **Sí, cuando esté demostrado:** «Ayuda a prevenir cambios fraudulentos de cuentas», «Firma y comprueba instrucciones autorizadas», «Verificación de identidad empresarial con alcance definido», «Comprobantes técnicos verificables», «Aprobaciones independientes», «Cifrado y firmas poscuánticas donde estén implementados» (en la web, «encriptado»).
  - **No:** «Eliminamos el fraude bancario», «Ninguna empresa puede ser suplantada», «Identidad garantizada al 100 %», «Certificados judiciales irrefutables», «Es imposible que un empleado autorice un fraude», «Seguridad cuántica absoluta».
- **Si el fraude ya ocurrió:** botón «Creo que me han estafado». NÚCLEO guía para avisar al banco por sus canales oficiales, pedir la recuperación o el bloqueo de fondos, conservar las evidencias y denunciar (Superfinanciera: avisar de inmediato a la entidad y denunciar ante la Policía o la Fiscalía; FBI: contactar cuanto antes con el banco de origen). No garantiza recuperar el dinero.

## F) Precio y plan

- **No incluirlo en el plan personal (4,90 €).** Precios propuestos, hipótesis por validar con clientes:
  - **Profesional, 14,90 €/mes:** ENTREGA, buzón profesional, documentos y usuarios con cuotas;
  - **Empresa, 29,90 €/mes** (su apuesta): añade CANAL VERIFICADO, dos aprobaciones, libro de operaciones, control de cambios bancarios e invitaciones a proveedores;
  - **Empresa Plus, 59,90 €/mes:** más trabajadores, volumen y controles.

  Las verificaciones bancarias y KYB con coste externo, según contrato. **❗ Gemini** lo incluye en el Plan Profesional (14,90 US$/mes, hasta 3 usuarios): decisión del dueño.
- **Costes por presupuestar** (sin importes inventados): verificación DNS (bajo), contraste registral y de representación (puede requerir revisión humana), firmas y aprobaciones, canal y almacenamiento, libro verificable, auditoría criptográfica, verificación bancaria externa y soporte a incidentes. Pedir presupuestos antes de fijar tarifas y proteger el margen con cuotas.
- **Fases:**
  1. identidad empresarial y canal entre dos empresas, sin cambios bancarios reales;
  2. instrucciones firmadas y doble aprobación;
  3. verificación pública y libro de operaciones;
  4. comprobación bancaria y auditoría antes de venderlo para operaciones sensibles.

  Prototipo con identidades y cuentas ficticias en 4–6 semanas (estimación, no plazo comprobado). **❗ Gemini:** mínimo en 2 semanas.
- **Seis decisiones del dueño, según ChatGPT:**
  1. nombre: CANAL VERIFICADO, dentro de Comunicaciones;
  2. cliente inicial: pymes que pagan a proveedores habituales;
  3. primera protección: cambio de cuenta con dos aprobaciones independientes y comprobación por un canal conocido;
  4. verificación bancaria: integración externa futura, sin atribuirnos una capacidad que no tenemos;
  5. precio a probar: 29,90 €/mes por empresa, con cuotas;
  6. lanzamiento: piloto controlado, pruebas de fraude y auditoría antes de operaciones reales de alto riesgo.

**Veredicto:** una de las ideas más interesantes estudiadas para Comunicaciones; no compite con WhatsApp ni con Signal, sino que permite distinguir una instrucción de pago realmente autorizada de un mensaje que solo lo parece.

- **Frase comercial:** «Que nadie cambie la cuenta de tus proveedores con un simple correo, una llamada o una voz falsa. Comprueba las autorizaciones antes de pagar.»
- **Norma interna:** «Si falta una verificación obligatoria, la operación permanece pendiente o bloqueada dentro de GUARDIANA. Ninguna urgencia, directivo o administrador puede convertir silenciosamente una comprobación incompleta en una autorización válida.»
