# Ronda 71 · Comunicaciones en modo ataque · cruce

27 Oct 2026, 23:05–23:45 (Bogotá). Equipo rojo. Voces: ChatGPT («Alta», sin h ni i; `chatgpt.md`), Gemini (razonamiento alto, con h; `gemini.md`) y Astra 6 (Cheaper Inference, 4.096 tokens, con h e i, en dos partes; `astra.md`). Pregunta: `pregunta.md`. Comparación de producto: `competencia.md`. Ninguna voz usó las fuentes prohibidas. Regla del dueño: **publicar solo lo que dos voces confirmen**; «sin promesas absolutas»; «no inventes».

**En una frase:** la blindada construida esta noche (invitación de 256 bits, verificación mutua obligatoria, dos firmas sobre toda la negociación, relleno, comprobante de doble firma e informe de cierre) la aceptan las tres voces como base; pero **ninguna** acepta publicar como garantías ya operativas la red de dos saltos ni la «recuperación tras compromiso», y Astra corrige que no digamos «conformidad CNSA 2.0».

## Lo que confirman las tres voces (se aplica)
1. **Firmar toda la negociación con las dos firmas (ECDSA P-384 + ML-DSA-87) sobre los mismos bytes.** → Ya está: `datosIniciaB`/`datosRespondeB` cubren identidad, efímera, época, huella del otro, ek y ct; `recibePresentacionB` exige las dos (`verifica` **y** `verificaPQ`) o descarta. ✔
2. **Nada de contenido hasta la verificación mutua real, comparada por otro canal.** → Ya está: puerta `puedeEnviar` (bloquea texto, archivos y señalización de llamada), control `verificada` con el hash del número, aviso en rojo si no coincide, y el texto pide comprobarlo por otro canal. ✔
3. **Quitar el fragmento de la URL nada más leerlo.** → Ya está: `history.replaceState` en el arranque y en `hashchange`. ✔
4. **Nonces de archivo únicos por (clave, trozo), sin recifrar bytes distintos.** → Ya correcto: clave aleatoria propia por archivo, nonce = índice del trozo, índice y contexto autenticados en el AAD, el bucle no revisita un índice. Se cierra con prueba. ✔
5. **Comprobante: objeto canónico firmado por los dos equipos; el verificador reconstruye lo que muestra solo de los campos firmados; dice «este equipo declaró recibir estos bytes», no aceptación legal.** → Hecho en `viaje.js`; falta que la **página de verificación** acepte el comprobante blindado (ver abajo). ◑→✔
6. **No publicar la red de dos saltos (h) como anonimato ni independencia entre nodos.** Las tres coinciden: los dos nodos son de GUARDIANA, queda la correlación temporal, y cifrar solo la sala no basta. → **No se publica h) esta noche.** Queda como siguiente paso con su diseño (capa navegador↔sala autenticada y evaluada, túnel troncal multiplexado, descriptor del nodo firmado) en el traspaso.
7. **No prometer «recuperación tras compromiso» por la sola renovación periódica.** ChatGPT y Astra lo bloquean; Gemini solo la admite con un secreto de encadenamiento y pruebas. → La renovación sigue funcionando (confidencialidad hacia delante al renovar), pero **no se anuncia PCS**; el aviso dice «claves renovadas: lo anterior ya no se puede leer con las claves nuevas», sin prometer recuperación.
8. **Voz = «efecto/cambio de voz», no anonimización; el audio no es poscuántico.** Astra explícito, coherente con el código (no oculta acento ni palabras). → El texto de la web dirá «cambio de voz», nunca «anónima/anonimiza»; no se dice que el audio sea poscuántico.
9. **Código de 9 cifras (sesión normal) débil fuera de línea.** Las tres: priorizar la invitación larga; a futuro, un PAKE revisado (SPAKE2+/CPace). → La blindada ya usa la semilla de 256 bits. En la normal no se cambia esta noche; queda anotado.
10. **CNSA 2.0 (corrección de Astra):** P-384 es CNSA 1.0; nombrar «los algoritmos de la suite CNSA 2.0 (ML-KEM-1024 y ML-DSA-87), en híbrido con P-384», sin decir «conformidad/certificado CNSA 2.0». → Se ajusta el texto.

## Lo que pide dos voces y conviene (siguiente, no esta noche)
- **Anclaje del código servido** (verificador/Service Worker que fije la versión y su huella; ChatGPT y Gemini): es la objeción nº 1 de toda cripto en navegador. No se resuelve con una firma comprobada por el mismo JavaScript recién servido. Diseño para el traspaso.
- **Identidad sellada por hardware** (WebAuthn PRF; Gemini) y **operar ML-DSA en un Web Worker con `.fill(0)`** (Gemini y Astra, para el material en memoria).
- **Sello de tiempo RFC 3161 en el comprobante** (ChatGPT «campos firmados», Gemini y Astra «un tercero para la hora»): hoy la hora la ponen los dos equipos; útil para valor pericial.
- **Cobertura de tráfico**: las tres dicen que no se improvisa esta noche.

## Se hace esta noche (confirmado)
- Página de verificación: aceptar el comprobante blindado (`V.FORMATO_B`), cargar `pq-cnsa.js`, usar `viaje.js?v=c`.
- Textos de la web (blindada, llamadas): honestos, con las palabras de arriba; sin «auditada», «certificada», «conformidad CNSA 2.0», «recuperación tras compromiso» ni «anónima».
- Pruebas que bloquean la publicación si fallan (invariantes): repetición, retroceso de época, nonce de trozo, trozo intercambiado, comprobante reutilizado/alterado. Ya cubiertas por `prueba-blindada.js`; se re-ejecutan.

## No se hace esta noche
- Red de dos saltos (h) como función publicada. Motivo: las tres voces y la regla «dos voces confirman». El dueño pidió a las 23:53 construirla igualmente; no se ha podido hacer en esta sesión y queda pendiente, con el diseño de las tres voces en `gemini.md` (B5) y `astra.md` (parte 2, bloque 1).
- Cambios en el código de 9 cifras de la sesión normal.
