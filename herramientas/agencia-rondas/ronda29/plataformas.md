# Ronda 29 · Plataformas petrolíferas donde terminan cables (encargo del dueño, 24 Oct 2026, 21:08–21:09)

Dueño: «Los cables que terminan en plataformas petrolíferas, ponlo cuando la persona le dé, que aparezca el nombre de la plataforma petrolífera y la información» y «con foto de las plataformas petrolíferas».

## Hecho (21:10–21:20)
- `cables_agencia.py`: `OSM_PRIORIDAD` (tampnet, tampnet3, tampnetnorthsea, norseacoms, norseacom1, sleipnirgranefoc, cns). Las redes del mar del Norte se dibujan como las tiene OpenStreetMap, plataforma a plataforma, y no se pintan encima las versiones simplificadas de la agencia (Kårstø–Lowestoft y Aberdeen–Stavanger). Con la regla de las 20:45, la agencia había sustituido las 13 piezas de Tampnet por su versión simplificada y se perdían las llegadas a las plataformas.
- Extremos en el mar de esas redes: 18 (con el `cables.json` publicado a las 18:44). Plataformas de OpenStreetMap junto a ellos (Overpass, `man_made=offshore_platform`, desde el navegador integrado) y comprobadas con una segunda voz:

| Plataforma | lon, lat (OSM) | Operador | Campo / papel | Desde | Dato | Cable que llega | Segunda voz |
|---|---|---|---|---|---|---|---|
| Troll A | 3.725, 60.645 | Equinor | Campo de gas Troll | 1996 (gas) | 472 m de alto, en 303 m de agua: la estructura más alta jamás movida | Tampnet | Wikipedia «Troll A platform» |
| Oseberg A | 2.825, 60.491 | Equinor | Campo Oseberg; proceso y alojamiento | 1988 | Base de hormigón en 109 m de agua | Tampnet | Wikipedia «Oseberg oil field» |
| Sleipner A | 1.907, 58.367 | Equinor | Campo de gas Sleipner Øst | — | Inyecta CO₂ en la formación Utsira, a ~1.000 m bajo el fondo | TAMPNET 3 (y Sleipnir-Grane FOC) | Wikipedia «Sleipner gas field» |
| Johan Sverdrup (centro del campo) | 2.55, 58.836 | Equinor | Campo Johan Sverdrup; 5 plataformas unidas | oct. 2019 | Electricidad desde tierra; 110–120 m de agua | TAMPNET (BU4-BU5) | Wikipedia «Johan Sverdrup oil field» |
| Edvard Grieg | 2.247, 58.842 | Aker BP | Campo Edvard Grieg | nov. 2015 | — | TAMPNET 3 | Wikipedia «Edvard Grieg oil field» |
| Grane | 2.486, 59.165 | Equinor | Campo Grane | sept. 2003 | 128 m de agua | Sleipnir-Grane FOC / Tampnet | Wikipedia «Grane oil field» |
| Valhall | 3.393, 56.278 | Aker BP | Campo Valhall; complejo de plataformas unidas por puentes | 1982 | Electricidad desde tierra desde 2011; ~70 m de agua | Tampnet | Wikipedia «Valhall oil field» |
| Ula | 2.846, 57.111 | Aker BP | Campo Ula; 3 plataformas | oct. 1986 | ~70 m de agua | Tampnet | Wikipedia «Ula oil field» |
| Inspirer (campo Yme) | 4.534, 57.815 | Repsol Norge | Campo Yme, cuenca de Egersund | oct. 2021 (vuelve a producir; cerrado desde 2001) | Plataforma autoelevable, antes Mærsk Inspirer | Tampnet | Repsol Norge (repsol.no, página de Yme) |
| Draupner S | 2.471, 58.188 | Gassco (Equinor da el servicio técnico) | Nudo de gasoductos (Statpipe, Europipe I, Franpipe, Zeepipe) | 1985 (primer gas) | En 1995 midió la primera «ola gigante» registrada | Tampnet | Wikipedia «Draupner platform» |

- **Fuera por ahora:** Heimdal (2.227, 59.575; el campo dejó de producir y su retirada estaba prevista para 2025: comprobar si la plataforma de tubos de Gassco sigue), el extremo de 2.466, 59.2 (entre Grane y Balder FPU, no se sabe cuál), los de Norsea Coms en el sector británico (2.296, 56.46 y 2.337, 56.697: probablemente Clyde y Judy, pero OpenStreetMap no las tiene; buscar segunda voz), Tampnet −1.395, 57.444 y 2.861, 57.241 / 2.844, 57.224 (sin plataforma a menos de 12 km).

## Lo que falta (siguiente cuenta)
1. Esperar a que acabe `cables_agencia.py` con `OSM_PRIORIDAD` (y `lugares_capas.py`), comprobar que vuelven las piezas de Tampnet y publicar `cables.json`, `cables-agencia.json` y `lugares-capas.json` en las dos ramas.
2. Añadir las 10 plataformas a `orbita/datos/puntos-extra.json` como `"tipo": "estacion", "clase": "plataforma"` con `nombre`, `operador`, `programa` (el campo), `desde`, `enlace` (el cable que llega), `nota` (el dato) y `fuente`.
3. `capas.js`: en `pintaEstaciones`, un cuadradito en vez de anillo para `clase === 'plataforma'`; en `fichaEstacion`, tipo «Plataforma petrolífera» (Draupner: «Plataforma de gas»), texto «Aquí termina un cable submarino…» y las filas Operador, Campo, Desde, Cable que llega. Texto de la clase «Bases y antenas» con «y plataformas petrolíferas». Diccionario `D` de `idioma.js`. Subir versiones.
4. Fotos: con las plataformas ya en `puntos-extra.json` de `main`, lanzar `gh workflow run fotos.yml --ref main` (modo buscar: busca en Wikidata por nombre a menos de 60 km), revisar las candidatas una a una (foto real de la plataforma, sin personas ni logotipos), escribir `agencia-rondas/fotos/revision-2.json` y lanzar `fotos.yml` con `modo=copiar`. Créditos en `terminos.html` §6 (`#fotos`).
5. Captura de diseño para el dueño antes de publicar (prometido a las 21:10).
