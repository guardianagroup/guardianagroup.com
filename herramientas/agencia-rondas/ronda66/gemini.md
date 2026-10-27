# Ronda 66 · Gemini (Argon) · acabar con la suplantación de empresas

27 Oct 2026, ~17:35 (Bogotá). Chat: https://gemini.google.com/app/5d590213ccb62826 (texto completo allí; aquí lo esencial, fiel). Lo que hay que comprobar va marcado. Cita mucho una fuente llamada «Coffr»: no es oficial; las cifras se comprueban en el informe del FBI.

## A) El problema

- **FBI IC3, informe 2025 (publicado en 2026)** (*comprobar en ic3.gov*):
  - BEC: 3.046.598.558 US$ en 24.768 denuncias, de media 123.005 US$ por golpe;
  - segundo delito que más dinero roba, tras las estafas de inversión;
  - IA: 893 M US$ en pérdidas ligadas a la IA, 30,2 M en BEC con IA.
- **Encuesta AFP 2026:** el 74 % de las empresas sufrió intentos de BEC (*comprobar*).
- **Europol (IOCTA):** el BEC y el fraude al CEO con voces y vídeos falsos, entre las amenazas que más crecen.
- **Colombia:** no hay un dato oficial que separe el BEC del resto de estafas informáticas («prefiero decir que no hay dato»). Si el tesorero autoriza la transferencia engañado, el banco rara vez devuelve el dinero (cita la Circular Externa 007 de 2018 de la Superfinanciera; *comprobar*).
- **Las tres vías:**
  1. dominio parecido (proveed0r.com);
  2. cuenta real del proveedor robada: el atacante lee los hilos y, el día del pago, responde con la factura real y la cuenta cambiada (la más peligrosa);
  3. voz o vídeo clonados con IA para meter prisa.
- **A quién golpea:** pymes, constructoras, comercializadoras, contadores, inmobiliarias y abogados.

## B) Lo que existe y por qué no basta

- **SPF, DKIM y DMARC:** impiden falsificar tu dominio exacto, pero no frenan dominios parecidos. Si roban la cuenta real del proveedor, el correo falso pasa todas las pruebas.
- **BIMI con VMC/CMC:** cuesta unos 1.000–1.500 US$ al año (*comprobar*: tarifas de DigiCert y Entrust). Las pymes no lo compran, y con la cuenta robada el logo verificado sale igual.
- **Verificación de cuentas:**
  - UE: Verification of Payee, obligatoria desde octubre de 2025 (Reglamento (UE) 2024/886).
  - Reino Unido: Confirmation of Payee.
  - Colombia: Bre-B (Banco de la República, desde 2025) asocia «llaves» a cuentas y muestra datos básicos al transferir; ACH cruza el NIT con la titularidad (*comprobar el detalle*).
  - No bastan: SWIFT internacional sin verificación de titularidad; cuentas a nombre de empresas pantalla o «fiduciarias autorizadas»; Trustpair y Eftsure son caros, para grandes empresas.
- **Firmas en PDF y llamada de confirmación:** el contador no sabe mirar la firma, y la llamada falla si el número de la factura es del estafador o si contesta una voz clonada.

## C) El diseño único: «Identidad y Pagos Blindados»

1. **Ficha Oficial de Cobro de la empresa:**
   - dominio comprobado por DNS, NIT/RUT y firma con la huella del representante (WebAuthn PRF);
   - llave postcuántica (Ed25519 + ML-DSA-65) y huella de la cuenta oficial en el directorio de transparencia (árbol de Merkle).
2. **Regla de hierro contra el cambio de cuenta:** la cuenta habitual queda sellada.
   - Al enviar una factura por ENTREGA, el navegador del emisor lee la cuenta del PDF y la compara con la ficha.
   - Si coincide, el receptor ve en verde «Cuenta habitual verificada (••4821), registrada hace 8 meses, sin cambios».
   - Si no coincide o se cambia:
     - **dos personas:** huella en dos dispositivos;
     - **enfriamiento:** 48 h, y un cartel rojo o ámbar durante 30 días («Cambio reciente de cuenta: verifica antes de pagar»);
     - **aviso fuera de banda** a los socios y a los clientes que la tienen guardada.
3. **Sello en cada factura:** QR + firma SLH-DSA y ML-DSA sobre el SHA-256 del archivo y la cuenta. Cualquiera lo comprueba gratis en guardianagroup.com/verificar: ve si se cambió algo, a nombre de quién está y desde cuándo está la cuenta.
4. **Reto en vivo contra voces clonadas:** botón «Pedir código de viva voz». Aparecen tres palabras que cambian cada 60 s en el canal encriptado, o «Autorizar con huella». El estafador no tiene el dispositivo real.

- **Único:** nadie (Signal, WhatsApp, WeTransfer, Dropbox) vigila la antigüedad de la cuenta bancaria dentro de las facturas ni exige dos huellas para cambiarla, y menos por 14,90 US$/mes.
- **Humo:** «conectados con todos los bancos del mundo», «la IA detecta al 100 % los audios falsos».

## D) Fácil de usar

- **Tres botones:** «Mi Cuenta Oficial de Cobro», «Enviar Factura o Documento Blindado» y «Comprobar una Factura Recibida» (gratis para cualquiera).
- **Enviar:** se arrastra el PDF, sale el sello verde y se copia el enlace con el código.
- **El cliente** no paga ni se registra. Ve un semáforo verde o rojo («¡ALTO! La cuenta no coincide…»), y debajo una invitación a activar el sello en su empresa (efecto viral).

## E) Ley

- **No decir:** «seguro o garantía contra estafas», «entidad de certificación acreditada» (ONAC, Ley 527 de 1999; eIDAS).
- **Decir:** «Sistema técnico de verificación criptográfica de integridad documental y control de cambios de cuentas registradas». La decisión de transferir es del usuario.
- **Datos personales:** los de la empresa no son sensibles; los del representante sí (Ley 1581, RGPD).
  - WebAuthn no envía la huella, solo una clave pública.
  - En el árbol público, solo un HMAC con sal de la cuenta y sus últimos 4 dígitos.
- **Ley 527, arts. 10 y 11:** el juez valora la fiabilidad del mensaje de datos. La huella, la firma y el registro dan una trazabilidad alta en un peritaje (no es garantía).

## F) Precio y plan

- **Dentro del Plan Profesional (14,90 US$/mes, hasta 3 usuarios):** sello de cuenta oficial con aviso de cambios y doble llave, ENTREGA con semáforo, buzón con el nombre de la empresa, libro de recibos y vigilancia de filtraciones del dominio.
- **Plan Personal (4,90):** comprobar gratis cualquier factura recibida.
- **Mínimo en 2 semanas:**
  - semana 1: la cuenta oficial firmada, con su antigüedad y la regla de cambios;
  - semana 2: casilla «Es una factura» en ENTREGA, con la comparación en el navegador del emisor, el semáforo y el código de viva voz.
- **Pregunta al dueño:** ¿el semáforo de cuenta verificada va dentro de ENTREGA en el Plan Profesional?
