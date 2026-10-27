# Ronda 65 · Gemini (Argon) · profesionales con la máxima seguridad, y aviso de filtraciones

27 Oct 2026, ~17:25 (Bogotá). Chat: https://gemini.google.com/app/5d590213ccb62826 (texto completo allí; aquí lo esencial, fiel). Lo que hay que comprobar va marcado.

## A) El mundo hoy

- **Signal:** PQXDH (X25519 + ML-KEM-1024) al empezar y el triple ratchet con SPQR (seguridad postcuántica también después de cada compromiso). Remitente oculto (Sealed Sender) y descubrimiento de contactos en enclaves (SGX). Número de seguridad o QR. Análisis formales (ETH, Bochum, INRIA, Cryspen). Débil para despachos: pide teléfono, sin buzón web para clientes sin la app, sin comprobantes.
- **iMessage PQ3:** P-256 + ML-KEM-768 y renovación postcuántica periódica de claves. Apple ve quién habla con quién. Contact Key Verification con transparencia de claves. Verificado con Tamarin (Gemini cita «Universidad de Cuenca / ETH Zürich»: *comprobar*; el análisis conocido es de la ETH y de Stebila). Solo Apple.
- **MLS (RFC 9420):** grupos grandes (TreeKEM): añadir o expulsar un dispositivo es barato. Lo usan Webex, Wire, Wickr, Matrix (Element X) y RCS (GSMA UP 3.0). Postcuántico: borrador de suites híbridas (X25519 + ML-KEM-768). No oculta IP por sí solo.
- **WhatsApp:** Signal clásico (sin postcuántico en los chats), transparencia de claves (AKD, 2023); muchos metadatos para Meta.
- **Threema** (sin teléfono, ID aleatorio, auditado por Cure53; sin buzón web abierto), **Proton** (OpenPGP con postcuántico híbrido en GopenPGP v3), **Tresorit** (ISO 27001; auditoría de EY), **Wickr** (empresas, retención, Amazon/EE. UU.), **SecureDrop/OnionShare** (Tor, oculta la IP de los dos lados; exige Tor Browser).

## B) El diseño para profesionales

- **Cifrado:** mantener ML-KEM-768 (FIPS 203) + ECDH. **Firmas: el salto que falta**: firma híbrida Ed25519/ECDSA + **ML-DSA-65 (FIPS 204)**; y **SLH-DSA (FIPS 205)**, basada solo en hashes, para sellar los comprobantes a largo plazo. HQC (elegido por el NIST en marzo de 2025 como respaldo) cuando tenga norma: diseño preparado para cambiar algoritmos.
- **Despacho con varias personas:** MLS con suite postcuántica: el buzón cifra para el grupo del despacho; revocar a un empleado al instante.
- **Llaves atadas a la huella o la cara:** WebAuthn con PRF (W3C Nivel 3): sin el dedo no se abre nada. Transparencia de claves (AKD) para que el servidor no pueda cambiar la llave de un despacho sin que se note.
- **El código que se sirve:** SRI + CSP estricta, builds reproducibles y firmados con su huella publicada en un registro inmutable; un verificador ligero (extensión o PWA) para despachos.
- **Metadatos:** el nombre del cliente y del archivo, dentro del cifrado; tamaños redondeados (bloques de 1 MB).
- **Servidores:** memoria cifrada por hardware (AMD SEV-SNP o Intel TDX); Gemini dice que «hoy en Hetzner, OVHcloud, GCP y Azure» (*comprobar Hetzner*).
- **Borrado:** borrado criptográfico (la llave efímera se borra al descargar) y un recibo firmado en el registro.
- **«Quién abrió qué» sin ver nada:** se registra la huella del paquete cifrado, la hora y la firma del dispositivo, encadenado en un árbol de Merkle; el nombre del documento va cifrado y solo lo lee el despacho.
- **Recuperación:** kit de rescate en PDF y, si se quiere, la llave maestra partida con Shamir (2 de 3: socio A, socio B, papel).
- **Real:** postcuántico en cifrado y firmas, llaves con la huella, nombres ocultos con relleno, registro firmado en Merkle, borrado al descargar. **Humo:** «encriptación cuántica» (eso es QKD), «protege aunque tu ordenador tenga un virus», «100 % inhackeable».

## C) Fácil de usar

- **Tres botones:** «Enviar documento con comprobante», «Mi buzón para recibir de clientes» y «Libro de envíos y recibos». Ninguna sigla en pantalla.
- **La primera vez:** «Activa tu llave con tu huella o cara» y se descarga la «Hoja de rescate de tu despacho» (imprimir y guardar).
- **Enviar:** se arrastra el PDF, se elige «destruir al abrirlo una vez» y se copia el mensaje para WhatsApp con el código.
- **El cliente:** no instala nada; el abogado ve en verde «Entregado a las 17:14 y borrado del servidor» y el comprobante.
- **Si pierde el móvil:** desde otro equipo, o con la hoja o el socio, el botón rojo «He perdido un equipo — Desconectarlo ahora».

## D) Auditorías

- **Orden:**
  1. auditoría de código y criptografía (Cure53, Trail of Bits, Quarkslab, NCC, Kudelski), con el informe publicado;
  2. ISO/IEC 27001 y SOC 2 tipo II;
  3. CSPN, BSI o ENS (6–18 meses).
- **Costes (estimaciones de mercado, sin fuente):** auditoría focalizada de 2–3 semanas, 15.000–35.000 US$; ISO 27001, 10.000–25.000 US$.
- **Desde el primer día:** libro blanco técnico, código del cliente abierto y `security.txt` (RFC 9116).
- **No decir** «auditado» ni «certificado», ni poner logotipos, hasta tenerlos. Sí: «construido con los estándares postcuánticos del NIST (FIPS 203 y 204)».

## E) Aviso de filtraciones

- **Fuente:** Have I Been Pwned (la usan 1Password y Mozilla), API comercial «desde 3,50 US$/mes» (*comprobar precio*) con atribución obligatoria. Busca por correo o dominio, no por teléfono (para no servir de directorio inverso). Otras fuentes (SpyCloud, Constella, Dehashed), caras o dudosas.
- **Contraseñas:** Pwned Passwords con k-anonimidad (solo los 5 primeros caracteres del hash). Correo puntual: no se guarda. Vigilancia: hay que guardar el correo, cifrado.
- **Ley:**
  - nadie puede vigilar el correo de otro: confirmación por correo (doble opt-in; art. 9 de la Ley 1581 y art. 6.1.a del RGPD);
  - empresas: demostrar que el dominio es suyo (DNS o admin@), por interés legítimo (art. 6.1.f y considerando 49).
- **Explicarlo:** escribe tu correo y confírmalo; te enseñamos en qué robos salió y qué datos llevaba; NÚCLEO te da la lista de lo que cambiar. No prometer «el 100 % de la internet oscura» ni «borramos tus datos de los delincuentes».

## F) Veredicto

- **Semanas 1–2:** aviso de filtraciones (HIBP + NÚCLEO + confirmación por código).
- **Semanas 2–4:** ENTREGA + buzón profesional con firma híbrida ML-DSA, nombres ocultos y libro de recibos encadenado.
- **Meses 2–3:** WebAuthn PRF, MLS completo, Shamir y la primera auditoría cuando el plan profesional la pague.
- **Decide el dueño:**
  - nombre («GUARDIANA Profesional»);
  - precio (14,90 US$ con hasta 3 usuarios);
  - empezar el aviso con correos y dominios, sin teléfonos.
