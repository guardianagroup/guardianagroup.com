# Ronda 49 · Comunicaciones · el panel de vigilancia de la derecha: ¿qué más puede decir, sin inventar nada? (26 Oct 2026, 20:30 Bogotá)

Contexto: GUARDIANA Comunicaciones (web, PC y móvil) es un chat cifrado de extremo a extremo entre dos equipos: código de 9 cifras (10 min, un uso), chat, notas de voz y archivos de cualquier tamaño. A la derecha del chat hay un panel «VIGILANCIA» que el dueño quiere que dé al usuario la sensación, con hechos, de que se vigila la seguridad del chat. Regla de la casa: solo se muestra lo verificable; nada inventado, nada «libre de virus» (el contenido va cifrado y nadie lo analiza).

Hoy el panel muestra (todo real):
- Filas: Cifrado (de extremo a extremo, activo; claves nuevas en cada encuentro) · Identidad (verificada / sin verificar: comparad el número de seguridad) · Integridad (N mensajes · N archivos · todo íntegro, nadie lo ha tocado; o incidencias con envío cortado) · Intrusos (intentos de entrada con otra identidad: rechazados y cortados) · Servidor (solo pasa tramas cifradas que no puede leer; no guarda nada).
- «En vivo»: cada comprobación con hora: mensaje recibido/entregado comprobado e íntegro; archivo recibido/entregado con trozos comprobados y tiempo; claves nuevas acordadas; cifrado confirmado (la otra persona tiene la misma clave); la otra persona se ha desconectado; intento de entrada ajeno rechazado; datos alterados: descartado/cortado.
- Reloj «comprobado hh:mm:ss» cada segundo.

Lo que la página SABE de verdad (y podría enseñar): algoritmos (AES-256-GCM, ECDH P-256 + ECDSA, HKDF-SHA256, PBKDF2); número de mensaje y de trozo; tamaño de cada trama; latencia de ida y vuelta al servidor (ping/pong WebSocket); hora de la última clave nueva; cuántas sesiones (reencuentros) ha habido; si la pestaña del otro está presente en la sala; bytes enviados/recibidos; número de seguridad (60 cifras) y si está verificado; navegador propio (user agent) y si soporta escritura a disco; si la conexión es https; si el relé elegido es Europa o América y su latencia; si el código de invitación sigue vivo o caducó; cuántos intentos de búsqueda de código rechazó el servidor (si el servidor lo comunica); errores de descifrado; desorden de mensajes (claves saltadas); reconexiones del WebSocket.

Lo que NO sabe y no debe decir: si el otro equipo está limpio de malware; si el otro hizo capturas o copió; si hay virus en un archivo; la dirección IP del otro (no la ve); anonimato.

Preguntas (responde en español, concreto, máximo 900 palabras; distingue «se puede mostrar con verdad» de «no»):
A. ¿Qué 5–8 datos más aportarían confianza real al usuario normal en ese panel, de la lista de lo que la página sabe? Da para cada uno el texto exacto en español (corto) y cuándo cambia de verde a ámbar o coral.
B. ¿Qué de lo que ya se muestra sobra o puede inducir a error (p. ej. «nadie lo ha tocado», «todo íntegro»)? Propón la redacción exacta.
C. ¿Debe el panel hacer una «comprobación» visible cada segundo si en realidad solo hay comprobación cuando llega algo? ¿Qué es honesto mostrar como latido: la conexión viva (ping/pong), la presencia del otro, ambos?
D. ¿Qué acción automática es defendible ante «espía» (intento de entrada con otra identidad, datos alterados, cambio de identidad del otro a mitad): cortar el envío, cerrar la sesión y pedir claves nuevas, o terminar la conversación? ¿Y qué debe mostrarse en ese momento?
