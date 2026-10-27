# Ronda 48 · Comunicaciones · lo que dicen dos voces (Gemini 4 Argon, Astra 6) · 26 Oct 2026, 19:05 Bogotá

Las dos revisiones completas están en `gemini.md` y `astra.md` (texto literal). Coinciden en:

## Protocolo (se aplica hoy, v2 del acuerdo)
1. **Atar la transcripción**: la firma de quien responde debe cubrir también la huella y la efímera de quien inicia, con etiqueta de rol («INICIA»/«RESPONDE»), codificación canónica y versión; la derivación HKDF lleva en `info` la transcripción ordenada (huellas y efímeras de los dos). Orden fijo del triple DH: DH(ef_A, ef_B) ‖ DH(id_A, ef_B) ‖ DH(ef_A, id_B) con A = quien inicia.
2. **La clave de la invitación entra en la sesión** (PSK en el HKDF): sin el secreto del enlace, ni un relé malicioso puede ponerse en medio aunque nadie compare el número.
3. **Épocas de 16 bytes aleatorios**; rechazar épocas repetidas y respuestas a épocas que no son las últimas propias.
4. **Identificador de sesión completo (32 bytes) en los datos asociados** de cada mensaje (en la cabecera de red pueden ir 8).
5. **Confirmación de clave** antes de decir «cifrada»: el primer mensaje sellado que abre bien confirma la sesión.
6. Archivos: no dar por recibido hasta tener todos los trozos con su longitud exacta (ya); los Blob en IndexedDB no llevan nuestro cifrado (decirlo).
7. Sin ratchet DH dentro de la sesión: válido y honesto; la recuperación llega al reconectar (efímeras nuevas). No guardar cadenas ni efímeras en disco (ya).

## Textos (redacción nueva, confirmada por las dos voces)
- 1 «Cifrado de extremo a extremo entre navegadores. Nuestros servidores no guardan mensajes ni archivos.»
- 2 «El relé de GUARDIANA solo encamina tramas cifradas que no puede descifrar: ve datos de conexión, no contenido, y no guarda historial.»
- 3 «El secreto de la invitación viaja tras «#», que el navegador no manda a nuestro servidor. Mándalo por un canal de confianza: quien tenga el enlace puede entrar.»
- 4 Se queda.
- 5 «Si los dos comprobáis el mismo número por otra vía (teléfono, en persona), estáis hablando sin intermediarios.»
- 6 Se queda.
- 7 «Cifradas entre los dos navegadores y transportadas por el relé: ningún participante ve la dirección IP del otro (el relé sí ve las dos).»
- 8 Se queda (+ «ni frente a una aplicación o navegador manipulados»).
- «Destruir» es cooperativo: borra aquí y pide el borrado allí; no borra lo ya guardado en disco ni copias.

## Límites que se dicen en pantalla («Qué protege y qué no»)
Metadatos que ve el relé (IP, sala, horas, volumen); las dos personas con la página abierta (sin buzón); una identidad por navegador (se pierde al borrar datos del sitio o cambiar de equipo); los archivos recibidos quedan en el navegador sin nuestro cifrado; «Destruir» no alcanza lo ya guardado; no es poscuántico; nada protege un equipo o navegador comprometido; no es anonimato.

## Lo que NO se promete
Anonimato de red, borrado garantizado en el otro equipo, protección poscuántica, seguridad «auditada» (no hay auditoría externa aún).
