# Ronda 27 (sin empezar) · Radioenlaces en Órbita — aprobado por el dueño el 24 Oct 2026, 18:43

Dueño, 18:43: «Añade las troncales de los países que no tienen fibra… Groenlandia, Eritrea, Malvinas, Pacífico, y las rutas de bolsa como dato curioso, me parece bien.»

## Qué se añade (y qué no)
- **Sí:** las grandes cadenas TRONCALES de radioenlaces de microondas (de torre en torre) de los países sin fibra por tierra: Groenlandia (cadena de Tusass por la costa oeste), Eritrea, Malvinas y las islas del Pacífico donde la troncal es por radio (Tonga, Kiribati, Tuvalu, Islas Marshall, Nauru, Palaos y, si procede, Islas Salomón, Vanuatu y Papúa Nueva Guinea).
- **Sí, como dato curioso:** las rutas de microondas de baja latencia de la bolsa: Chicago (CME, Aurora) – Nueva York/Nueva Jersey (Carteret, Secaucus, Mahwah) y Londres (Slough/Basildon) – Fráncfort.
- **No:** los millones de enlaces cortos de las antenas de móvil, ni los registros oficiales enteros (FCC, Ofcom, Canadá, Australia): llenarían de líneas solo esos países y darían una imagen falsa.

## Cómo
1. Agencia, regla de las dos voces: ChatGPT («Alta») y Astra 6 (de 2 en 2 países, con «aproximado» permitido) dan cada cadena como lista ordenada de localidades, con fuente pública (Tusass, regulador, Banco Mundial, BAsD, UIT…). Nada de submarinecablemap.com, TeleGeography ni PeeringDB. Confirmación cruzada como en la ronda 26.
2. Guardar las respuestas en `herramientas/radio-agencia/<voz>-radio-<n>.json` (mismo formato que `fibra-agencia`: nombre, operador, pais, ciudades, estado, fuente). Para las rutas de bolsa puede servir de comprobación el registro público de la FCC (Universal Licensing System) — comprobar su licencia antes de usarlo.
3. Generador nuevo `herramientas/radio_agencia.py` (copia de `fibra_agencia.py`: misma lógica de dos voces y `SITIOS`) → `orbita/datos/radioenlaces.json`.
4. **Antes de programar: captura de diseño para que el dueño la apruebe** (Playwright en local). Propuesta: línea discontinua (para que no se confunda con la fibra), como clase nueva de «Cables por tierra» o quinta capa «Radioenlaces»; ficha con «Radioenlace de microondas · trazado aproximado»; la ruta de la bolsa con su dato curioso (la señal por el aire va más rápido que por fibra).
5. Fuentes y licencias en `terminos.html` §6; textos en los idiomas abiertos (es, en) y en el diccionario `D` de `idioma.js`.

Orden acordado con el dueño: después de cerrar los 16 cables submarinos de la ronda 26b y las fichas de empresas, salvo que él diga otra cosa.
