# Ronda 66 · Acabar con la suplantación de empresas con Comunicaciones · cruce

27 Oct 2026, a partir de las 17:30 (Bogotá). Voces: Gemini (Argon; `gemini.md`) y ChatGPT («Alta», con web; `chatgpt.md`). Pregunta: `pregunta.md`. Notas escritas a las 20:20.

## Lo que dicen las dos voces (coinciden)

1. **El problema es real y está medido en EE. UU.:** FBI IC3 2025, 3.046,6 M US$ perdidos por BEC en 24.768 denuncias, la segunda categoría tras el fraude de inversiones; más de 30 M US$ en BEC con IA. En Colombia no hay una cifra oficial comparable, y no se extrapola.
2. **Las tres vías:** dominio parecido, cuenta real del proveedor robada (la más peligrosa: supera SPF, DKIM y DMARC) y voz o vídeo clonados para presionar.
3. **Lo que existe no basta:** SPF, DKIM, DMARC y BIMI autentican al remitente, no autorizan un pago. Confirmation of Payee, Verification of Payee (UE, desde octubre de 2025) y Bre-B (nombre enmascarado del receptor) comprueban el beneficiario, no quién aprobó la orden. Son controles distintos y ambos importan.
4. **El diseño:**
   - identidad verificada de cada empresa (dominio por DNS, RUES y NIT, representante);
   - datos de pago firmados;
   - **cambio de cuenta solo con dos personas y un periodo de espera, con aviso a los responsables registrados;**
   - comprobación gratuita de facturas firmadas, sin cuenta;
   - contra voces falsas, la aprobación desde el dispositivo registrado.
5. **Quien recibe no paga** por comprobar que una solicitud es auténtica.
6. **No decir:** «garantía contra fraude», «certificado», «firma digital certificada» ni «entidad de certificación» (Ley 527 de 1999; acreditación ONAC). La Ley 527 da valor probatorio a los mensajes de datos (arts. 10 y 11), no una garantía. Los datos de representantes y trabajadores, con la Ley 1581 y el RGPD.

## Donde discrepan

- **Cómo se nombra la cuenta:** Gemini muestra «Cuenta habitual verificada» en verde; ChatGPT, «Cuenta declarada por una empresa verificada en GUARDIANA. Titularidad bancaria no verificada independientemente» mientras no haya un servicio bancario que lo compruebe. **Claude: el rótulo de ChatGPT es el correcto.**
- **Plan y precio:** Gemini lo incluye en el Plan Profesional (14,90 US$/mes, hasta 3 usuarios); ChatGPT crea «Empresa» (29,90 €/mes), aparte del Profesional (14,90 €) y de «Empresa Plus» (59,90 €). Son hipótesis por validar.
- **Espera:** 48 h y un aviso durante 30 días (Gemini) o espera configurable, con 24 h como propuesta (ChatGPT).
- **Voces falsas:** tres palabras que cambian cada 60 s (Gemini) o un reto de un solo uso ligado a esa orden concreta (ChatGPT, que descarta una palabra fija).
- **Algoritmos:** Ed25519 + ML-DSA-65 y SLH-DSA para sellos (Gemini) o ECDSA P-256 y ML-DSA cuando esté auditada (ChatGPT).
- **Plazo:** mínimo en 2 semanas (Gemini) o prototipo con datos ficticios en 4–6 semanas, en cuatro fases (ChatGPT).
- **Colombia:** Gemini dice que ACH cruza el NIT con la titularidad; ChatGPT no encontró una API pública que lo permita. Por comprobar.
- **«Único»:** Gemini afirma que nadie vigila la antigüedad de la cuenta en las facturas; Trustpair sí hace seguimiento de cambios. No publicable. La diferencia defendible es la integración (ChatGPT).

## Propuesta de Claude

- **Nombre:** CANAL VERIFICADO, dentro de Comunicaciones.
- **Primera versión:**
  - alta de empresa (dominio, RUES y representante);
  - canal entre dos empresas;
  - cambio de cuenta con dos aprobaciones, espera y avisos;
  - GUARDIANA VERIFICA: comprobación gratuita de facturas firmadas, en el propio navegador.

  Sin tocar cuentas bancarias reales hasta el piloto.
- **Rótulos honrados:** cada verificación por separado, con fecha y método; nunca «cuenta verificada» sin comprobación bancaria.
- **Botón «Creo que me han estafado»** (ChatGPT): NÚCLEO guía para avisar al banco, conservar las evidencias y denunciar. Sencillo y útil desde el primer día.
- **Antes de venderlo:** revisión jurídica de la responsabilidad y un piloto con identidades y cuentas ficticias.
- **Decide el dueño:** si el semáforo de cuenta va dentro de ENTREGA en el Plan Profesional (Gemini) o en un plan Empresa aparte (ChatGPT).

## Conversación con el dueño (20:24–20:35) y decisión

- **Lo que GUARDIANA sabría y lo que no** (explicado al dueño):
  - **Sabría:** la identidad verificada de cada empresa, quién está autorizado a firmar, qué empresas están conectadas y cuándo se comunican, y el registro de operaciones.
  - **No leería:** el contenido de mensajes y facturas (encriptado de extremo a extremo) ni la cuenta bancaria completa (propuesta: solo los últimos dígitos y una huella).
- **No tocamos dinero:** GUARDIANA no recibe, no guarda, no mueve dinero ni ordena transferencias; el cliente paga desde su banco. Pendiente de confirmar con un abogado en cada país.
- **Fácil para el cliente:**
  - un botón «Comprobar antes de pagar» y tres resultados: verde («Autorizado por tu proveedor · cuenta de siempre»), ámbar («Cambio de cuenta pendiente: faltan autorizaciones») y coral («Factura modificada» o «Firma no válida»);
  - el proveedor confirma con su huella o su cara, y otra persona de su empresa lo aprueba.
- **El dueño pide pensarlo a nivel mundial (42 idiomas), con EE. UU. y Europa como ejemplo.** Datos comprobados por Claude en fuentes oficiales (20:30):
  - **EE. UU.:**
    - las normas de Nacha obligan a quien origina pagos ACH a tener procesos «reasonably intended to identify Entries… authorized under False Pretenses», y la definición cubre «Business Email Compromise (BEC), vendor impersonation, payroll impersonation»;
    - fase 1 el 20-mar-2026 (todas las ODFI y los originadores con 6 millones de operaciones o más en 2023); fase 2 el 19-jun-2026 (todos los demás originadores no consumidores);
    - la Reserva Federal ofrece a los bancos «Payee Name Verification» (FedDetect), sin que la página indique que sea obligatorio.

    Fuentes: nacha.org/rules/risk-management-topics-fraud-monitoring-phase-1 · frbservices.org/financial-services/multiservice-solutions/payee-name-verification
  - **Zona euro:** Verificación del Beneficiario gratuita desde el 9-oct-2025 (Banco de España, clientebancario.bde.es). No cubre pagos fuera de la zona ni dice quién autorizó el cambio.
  - **Conclusión:** el banco comprueba el nombre; GUARDIANA comprobaría la autorización. En EE. UU., además, ayudaría a las empresas a cumplir las normas de Nacha (sin prometer que las cumple por sí solo).
- **Decisión del dueño (20:35): «Lo dejamos para próximamente».** Cuando se retome:
  - una ronda de la agencia sobre la versión para EE. UU. y Europa (verificación de empresas por país, el identificador mundial LEI, idiomas y precio internacional);
  - una maqueta de la pantalla «Comprobar antes de pagar».
