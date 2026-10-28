# Ronda 65 · El plan para profesionales con la máxima seguridad, y el aviso de filtraciones · cruce

27 Oct 2026, 17:10–17:30 (Bogotá). Voces: ChatGPT («Alta», con web; `chatgpt.md`) y Gemini (Argon; `gemini.md`). Pregunta: `pregunta.md`. Notas escritas a las 20:20, tras las rondas 66–69.

## Lo que dicen las dos voces (coinciden)

1. **Lo que ya tiene Comunicaciones es correcto:** el intercambio híbrido ML-KEM-768 + ECDH P-256 se mantiene. Lo que falta son las **firmas poscuánticas**: ML-DSA-65 (FIPS 204) junto a la firma clásica, y SLH-DSA (FIPS 205) para sellar comprobantes a largo plazo. HQC todavía no (el NIST lo eligió en marzo de 2025; su norma está en desarrollo).
2. **No anunciar «la máxima seguridad del mundo»** ni compararse con Signal o Apple sin especificación, pruebas y auditoría independiente. Se copian sus métodos (diseñar las propiedades antes de programar, análisis formal, transparencia de claves), no su complejidad.
3. **El mayor riesgo de una aplicación web es el código que se sirve:** CSP estricta, SRI, compilaciones reproducibles y firmadas, historial público de versiones y, para despachos exigentes, un verificador opcional.
4. **Metadatos:** nombres de archivo y de cliente dentro del encriptado, relleno de tamaños y lo mínimo en los registros. Nunca prometer un remitente totalmente oculto.
5. **Identidad:** passkeys (WebAuthn) y claves por dispositivo, revocables; transparencia de claves para que el servidor no pueda sustituir la clave de un despacho sin que se note.
6. **Borrado criptográfico** (destruir la clave de cada entrega), nunca «borrado irrecuperable certificado».
7. **Recuperación:** kit personal guardado fuera de GUARDIANA y, para el despacho, la clave repartida entre custodios (Shamir 2 de 3). Se diseña antes de encriptar el primer documento.
8. **«Quién abrió qué»:** eventos firmados y encadenados en un árbol de Merkle. Prueba la integridad de lo registrado, no quién miraba la pantalla.
9. **Fácil de usar:** sin siglas en pantalla, tres o cuatro botones, y el cliente no paga ni crea cuenta.
10. **Auditorías:** primero, una auditoría criptográfica externa de lo que ya existe (Cure53, Trail of Bits, NCC Group…); después, pruebas de intrusión, ISO/IEC 27001 y SOC 2 tipo II. No decir «auditado» ni «certificado» hasta tenerlo.
11. **Aviso de filtraciones:** Have I Been Pwned, con atribución; **solo correos**, sin teléfonos. Una comprobación puntual no guarda el correo; la vigilancia sí, protegido. Cada adulto autoriza su propio correo (doble confirmación; Ley 1581 y RGPD) y una empresa debe acreditar su dominio.
12. **Orden:** el aviso de filtraciones, primero; después ENTREGA profesional y el buzón, con auditoría antes de aceptar documentos reales.

## Donde discrepan

- **Despacho con varias personas:** Gemini propone MLS con suite poscuántica; ChatGPT, no inventar un MLS poscuántico propio y empezar con una clave aleatoria por archivo, encriptada para cada dispositivo autorizado.
- **Firmas ahora o después:** Gemini, firma híbrida con ML-DSA-65 desde el principio; ChatGPT, ECDSA P-256 ahora y ML-DSA cuando haya una biblioteca auditada.
- **Servidores con memoria encriptada (SEV-SNP, TDX):** Gemini los recomienda; ChatGPT, solo si una evaluación de amenazas lo justifica.
- **Costes de auditoría:** Gemini estima 15.000–35.000 US$ sin fuente; ChatGPT no da cifra y pide tres presupuestos. No se publica ninguna cifra.
- **Precio de HIBP:** Gemini dice «desde 3,50 US$/mes»; ChatGPT, desde 4,39 US$/mes con pago anual, que es lo que Claude comprobó en la página oficial (ronda 69).
- **Plazos:** Gemini, aviso en 1–2 semanas y plan profesional en 2–4; ChatGPT, prototipo del aviso en 2–4 semanas (con licencia), piloto profesional en 4–8 y buzón multiusuario en varios meses.

## Propuesta de Claude

- **Lo que más mejora la seguridad real, por orden:**
  1. auditoría externa de lo que ya existe;
  2. diseño de la recuperación;
  3. protección del código servido;
  4. firmas híbridas con ML-DSA mediante una biblioteca auditada.

  Más algoritmos no compensan la falta de estos cuatro pasos.
- **Aviso de filtraciones:** cuando el dueño contrate HIBP; correos y dominios, con doble confirmación y los pasos guiados por NÚCLEO.
- **Plan profesional:** piloto sin documentos reales sensibles hasta la auditoría.
- **Decide el dueño:** el nombre («GUARDIANA Profesional»), el precio y empezar por el aviso de filtraciones.
