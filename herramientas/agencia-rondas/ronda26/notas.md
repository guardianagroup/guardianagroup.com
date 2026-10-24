# Ronda 26 · Fibra por tierra de los 16 países y territorios que faltaban (24 Oct 2026, 17:30–18:20)

Voces: ChatGPT («Alta», chat «Rutas terrestres de fibra en servicio»), Astra 6 (gpt-6-astra, Playground de Cheaper Inference) y Claude (comprobando textos oficiales). Gemini, Kimi y Grok no se usaron.

**Preguntas**
- `pregunta-fibra.txt`: ChatGPT, los 16 a la vez, solo con fuente pública con URL → `chatgpt-fibra-1.txt` (16 rutas).
- Astra con esa misma pregunta devolvió `[]` (tandas A y B). Con `pregunta-fibra-aprox.txt` (vale «aproximado» si el operador tiene red allí; como en la ronda 23) sí responde. Con 4 países se queda sin tokens razonando: van de 2 en 2 (`pregunta-fibra-aprox-corta.txt`).
- Confirmación cruzada: ChatGPT recibe las rutas de Astra y de Gemini (rondas 25b) en `chatgpt-confirma-1..3`; Astra las de ChatGPT en `astra-confirma-1` (devolvió `[]`). En la cuarta parte se le permitió a ChatGPT lo mismo que a Astra: fuente pública de que el operador tiene fibra allí, con «aproximado».
- Claude comprobó contra el texto del operador: Our Telekom (Henderson–Honiara–White River), LKW (Standardangebot 2024: centrales de las 12 localidades unidas por la fibra troncal) y GIBFIBRE (fibra en Gibraltar que llega a La Línea) → `fibra-agencia/claude-troncales-r26.json`.

**Resultado:** de 190 a **202 países**. Entran Gibraltar, Liechtenstein, Maldivas (Addu), Islas Salomón, San Marino, Samoa, Islas Feroe, Barbados, Bermudas, Curazao, Micronesia (Pohnpei) y Sáhara Occidental (Laayoune–Boujdour–Dakhla, Maroc Telecom).

**Sin entrar**
- Tonga: Astra (Sopu–Nuku'alofa) y Gemini (Fua'amotu–Vaini–Nuku'alofa–Kolovai) no coinciden y ChatGPT no confirma ninguna. Claude solo encontró el túnel de la playa a la estación de TCL en Sopu (Kaniva Tonga, 2013).
- Malvinas y Groenlandia: ni ChatGPT ni Astra dan fibra entre pueblos. Eritrea: tampoco (radioenlaces).
- Yap (Nimar–Colonia): ChatGPT y Astra coinciden, pero mide unos 0,4 km y `fibra_tierra.py` quita lo de menos de 0,5 km.
- Antártida y Tierras Australes Francesas: no hay pueblos que unir.

**Coordenadas** de los pueblos nuevos en `SITIOS` (`fibra_agencia.py`): Nominatim (con límite: a 1 petición cada 1,5 s, y aun así devuelve 429 si se insiste), Wikidata (P625, por `wbsearchentities` + `wbgetentities` con `origin=*` desde cualquier pestaña) y la búsqueda de GeoNames.
