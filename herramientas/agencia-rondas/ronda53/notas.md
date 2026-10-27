# Ronda 53 · Lo que la gente le escribe a NÚCLEO (27 Oct 2026)

Respondieron las tres voces:
- ChatGPT: conversación «Frases de Núcleo», unas 190 frases.
- Gemini: «Núcleo y Guía de Guardiana», unas 150.
- Astra (gpt-6-astra): unas 180, en dos llamadas porque la primera se cortó a los 4096 tokens.

## Lo que se publica (lo que confirman al menos dos voces)

**Frases**
- Las de las tres voces juntas, revisadas, unas 520 en total: `orbita/static/nucleo-frases.js`.
- Las tres entendieron «cortes en directo» como caídas de internet. Es un error: en Órbita son las conexiones que GUARDIANA corta.
- Por eso esas frases van a una intención aparte, `p-caidas`, que lo aclara.

**Respuestas**
- Se publica lo que coinciden en decir al menos dos voces.
- Se descartan las exageraciones de Gemini: «no guardamos nada en servidores», «no existen cuentas», «42 idiomas en preparación», «archivos de cualquier tamaño».

**Fuera de tema** (las tres)
- No responder.
- Ofrecer buscarlo con ZERO, sin enviarlo solo: la persona lo pulsa (Astra).

**Delicadas** (ChatGPT, Gemini y Astra)
- Contraseñas y banco: no escribirlos aquí.
- Hackear: no se ayuda.
- Cuenta robada: usar la recuperación oficial.
- Peligro: llamar a emergencias.
- Insultos: volver a ofrecer ayuda.
- Lo delicado nunca se ofrece buscarlo.

**Si no entiende**
- Normalizar la frase y tolerar faltas (las tres).
- Con confianza alta, actuar; con dudas, «¿Quisiste decir…?» con 2–3 opciones; si no entiende nada, «No he reconocido esa petición» más el desplegable (ChatGPT y Astra).
- Preguntar solo el dato que falte: la web, el país o el código (las tres).
- Pedir confirmación antes de borrar (ChatGPT y Astra).

## Motor

`orbita/static/nucleo-motor.js`:
- Reglas fijas primero: dirección, búsqueda, código de 9 cifras, país, «qué es / cómo funciona» más una sección, y palabras inequívocas.
- Después, parecido por trozos de tres letras con las frases de ejemplo.

Prueba de dejar cada frase fuera (con 521 frases):
- acierta el 83,9 %;
- en otro 5,4 %, la buena aparece en «¿Quisiste decir…?»;
- se equivoca en el 7,1 %;
- no entiende el 3,6 %.

Los 46 casos difíciles de la prueba salen bien.
