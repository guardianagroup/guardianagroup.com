# Ronda 89 · 1 nov 2026 · decisiones

Dueño, 23:01–23:24: soluciones para que el navegador funcione normal y vea subastas, telemetría y rastreadores; vigilar a
las IA como servicio; «Confío en ti»; «Lo del navegador si no puedes solucionarlo de alguna manera, habrá que no hacerlo»;
calidad máxima en todo; 42 idiomas en la web y en el programa al acabar la VPN.

Decide Claude con el encargo del dueño; Gemini se suma cuando el equipo esté enlazado (`pregunta.md`). Las fuentes están
en `claude.md`.

## Navegador y radiografías

1. **No se disimula.** Nada que oculte que ZERO es automatizado, ni captchas resueltos, ni proxies residenciales. Esto
   quedó cerrado el 1 nov a las 22:50 y no se reabre.
2. **La radiografía se muda al PC del cliente** («radiografía local»): el programa abre un Chromium en el equipo, con la
   conexión del cliente, y observa lo que la página hace por CDP sin cambiarla. Una web ve una persona porque lo es.
   Los servidores quedan para quien mire desde la web sin el programa, con sus límites dichos.
3. **Subastas:** se leen `pbjs.getBidResponses()` y `getAllWinningBids()` (pujador, CPM, moneda, anunciante, agencia,
   marca, tiempo de respuesta) y los eventos de Google Publisher Tag; se enseñan tal cual, con «fuente: la propia
   página». Donde no haya Prebid se dice «esta web no publica sus pujas en la página».
4. **Rastreadores y telemetría:** cada petición con su dominio y a qué empresa pertenece, con EasyPrivacy (GPL-3.0, ya en
   el programa) y, si su licencia lo confirma, Disconnect. **Tracker Radar y Ghostery no**, son no comerciales.
   Consentimiento TCF v2 leído y comparado con lo que la página envía de verdad. La huella digital se deja para una
   fase posterior y hasta entonces se dice «no medido».
5. **Webs que cierran la puerta (PRISA y otras):** el botón «Abrir en mi navegador» y, si el dueño quiere, el correo a
   PRISA pidiendo lista blanca. Nada más.

## «IA en tu PC» (quinta pieza de la misma cuota)

6. **Qué se enseña:** asistentes de IA instalados y extensiones (lista por nombre de programa y editor, con fuente);
   quién usó micrófono, cámara y pantalla y cuándo (CapabilityAccessManager, solo lectura); Recall: si está instalado,
   si hay política que lo prohíba, y el botón para quitarlo, que ejecuta solo el cliente; qué programa habla con qué
   servicio de IA, uniendo «Tu IA» con el escudo; aviso cuando un programa nuevo empiece a hablar con una IA o a leer la
   pantalla.
7. **Qué no se dice:** «bloquea la IA», «ve lo que la IA hace con tus datos». Se vigila, se avisa y se deja cortar (VPN o
   cortafuegos del programa).

## Orden de trabajo

8. Primero lo que ya está en marcha: cuarentena (hecha), DLL en el instalador (en prueba), pantalla VPN (publicada).
9. Después, por este orden: radiografía local (subastas y rastreadores) → «IA en tu PC» → 42 idiomas en web y programa.
10. Revisión final de todo con una segunda voz (un agente que no haya visto el trabajo), como pidió el dueño a las 23:23.
