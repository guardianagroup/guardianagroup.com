# Ronda 72 · Invitar en el iPhone · cruce

29 Oct 2026, 18:15–18:40 (Bogotá). Voces: ChatGPT (`chatgpt.md`), Gemini Flash-Lite sin sesión (`gemini.md`), Astra 6 (`astra.md`) y Claude independiente con fuentes (`claude.md`). Pregunta: `pregunta.md`. Regla del dueño: publicar solo lo que confirmen dos voces.

**En una frase:** las cuatro voces coinciden en que, como web (PWA), en el iPhone no existe «un solo paso»: el enlace de WhatsApp siempre abre Safari y Safari no puede abrir la app instalada ni pasarle nada sin la persona. El «un toque» de verdad solo llega con una app en la App Store (enlaces universales).

## Lo que confirman dos voces o más (se aplica)
1. **No aceptar nunca la invitación en Safari** (las cuatro). El chat se quedaría fuera de la app y sin avisos.
2. **Primera vez: una sola pantalla con las instrucciones a la vista, sin botón previo** (ChatGPT, Astra, Claude): «Pulsa Compartir → Agregar a Inicio → abre GUARDIANA». La invitación viaja dentro del icono por la dirección de inicio del manifiesto.
3. **El manifiesto se pone una sola vez y antes de que Safari lea ninguno** (Claude, con el código de WebKit: lee el primer `<link rel=manifest>` y no lo relee; admite `blob:`/`data:` si la política de seguridad lo deja y las direcciones son absolutas). Por eso fallaba esta tarde: la política (`manifest-src 'self'`) bloqueaba el manifiesto propio y Safari usaba el de siempre, sin la invitación. Corregido: `manifest-src 'self' blob: data:` y el manifiesto lo crea `arranque.js` antes que nada.
4. **La invitación solo en el fragmento (`#i=`), nunca en la consulta (`?inv=`)** (Astra, Claude): la consulta llega al servidor. Corregido.
5. **`id` fijo en el manifiesto** (Claude): si no, la identidad de la app sería la dirección con la invitación. Hecho (`id` = `/orbita/comunicaciones/` absoluto).
6. **Quien ya tiene la app: copiar en Safari y «Abrir invitación» en la app** (ChatGPT, Astra, Claude), 4–5 toques; el código de 9 cifras como respaldo (ChatGPT, Astra, Claude).
7. **`navigator.share()` no ofrece «Agregar a Inicio»** (Claude, código de WebKit). Fuera el botón «Instalar y chatear».
8. **Futuro: app nativa mínima (Capacitor) con enlaces universales** (las cuatro): quien ya la tiene entra con un toque; para la primera vez, instalar desde la tienda y volver a tocar el enlace (o pegar). Coste: 99 USD/año Apple + 25 USD Google; 1–2 meses. Riesgos: guía 4.2 (no ser «una web empaquetada»: avisos nativos, CallKit) y 1.2 (denunciar y bloquear).

## Lo que no se toma
- Gemini: «esquema propio ¿Abrir en GUARDIANA?» para el caso b: una PWA no puede registrar esquemas en iOS.
- Prometer «un paso» o notificaciones activadas sin el permiso de la persona.

## Pendiente señalado
- Código de 9 cifras con PBKDF2: el relé podría probarlo sin conexión (~30 bits). Pasar a PAKE (CPace/SPAKE2) si se usa en el móvil (Astra, Claude).
- Probar en iPhones reales con iOS 17, 18, 26 y 27 que la app añadida arranca con el `#i=` (lista en `claude.md`).
- El chat de la esposa en Safari se borra solo tras 7 días sin visitar la web: rehacerlo dentro de la app.
