# Ronda 26b · Segunda voz para los cables submarinos de una sola voz (24 Oct 2026, desde las 18:00)

Lotes de 5 en `lotes-cables.json`; pregunta en `pregunta-cables.txt`. Astra 6 responde; Claude comprueba lo dudoso contra textos publicados antes de dar por buena la segunda voz.

- **Lote 1** (Sorsogon–Samar, Tuvalu Vaka, Balticconnector, Channel Islands, ESAT-1): Astra solo da ESAT-1, y avisa de que no puede comprobar que siga en servicio. **Descartado:** ISPreview (junio de 2026) dice que ESAT-1 «reached the end of its operational lifespan in 2024» y que el cable Beaufort lo sustituye. La propuesta original de ESAT-1 era de Claude: queda como error de una sola voz.
- **Lote 2** (ADONES, Aphrodite 2, Aquilink, Blue Sky, Bonaire–Curaçao): Astra confirma ADONES y Bonaire–Curaçao.
  - **ADONES, descartado:** WFN Strategies (2013) lo describe en estudio de «recommissioning», y Subtel Forum (dic. 2020, sobre Nzadi) dice que los proyectos de festón de 2009 y 2017 «failed to deliver». No consta que esté en servicio.
  - **Bonaire–Curaçao Cable System:** entra (Gemini + Astra). Claude no encontró nada en contra (las noticias de 2025 sobre CELIA no describen la conexión actual de Bonaire).
- **Lote 3** (Cabo San Lucas–Mazatlán, Denmark-Germany 2, DN-6, DS-16, DS-18): Astra `[]`.
- **Lote 4** (Digicel Marianas, Eastern Light II, Savusavu–Taveuni, GLO-2, HaidaLink): Astra `[]`.
- **Lote 5** (19:40, cuenta nueva): Astra da Lanka Bell, Mazatlán–La Paz y Mozambique Festoon (respuesta cortada en Mozambique; SCSN sin responder).
  - **Lanka Bell, descartado:** Submarine Networks lista la estación de Lanka Bell en Colombo como llegada de FALCON (ya en el mapa); no es un cable propio y solo tiene una llegada.
  - **Mazatlán–La Paz, descartado:** el cable de Telmex en servicio (TMX5, 23-9-2025) va de San José del Cabo a Mazatlán según el comunicado de Telmex; el de Megacable (2018–2019) iba de La Paz a Topolobampo. Ninguna fuente oficial da La Paz–Mazatlán.
  - **Mozambique Festoon, descartado:** KfW (2006) documenta el cable de TDM Maputo–Beira, pero RTI dice que está dañado y sin funcionar.
  - **Hawaiki Nui 1, descartado:** BW Digital lo da en proyecto (servicio previsto en 2027).
  - **SCSN:** ya está en el mapa como «Venezuelan Festoon» (mismas llegadas); no se añade.
  - **TMX5 (= «Cabo San Lucas-Mazatlán» de Gemini, lote 3):** entra con Claude como segunda voz, comprobado en el comunicado oficial de Telmex (San José del Cabo–Mazatlán, 383 km, en servicio desde el 23-9-2025). `cables-agencia/claude-confirma-r26.json` y alias `tmx5` en `cables_agencia.py`.
- **Lote 6:** Astra solo da Puerto Montt–Puerto Chacabuco (Telefónica del Sur). **No se añade:** es el mismo cable que «FOS Quellón-Chacabuco», ya en el mapa.
- **Lote 7:** Astra `[]`. (Tui-Samoa a Vanua Levu ya está en el mapa dentro de «Tui-Samoa», con Suva y Savusavu.)
- **Lote 8** (WARF + SCSN): Astra confirma **WARF** (Thiruvananthapuram–Hulhumalé, 2007, WARF Telecom International) → entra (Gemini + Astra; Submarine Networks: GCX tiene la estación de Trivandrum para WARF). `cables-agencia/astra-confirma-r26-8.json`.
- **Ronda con el resto de la agencia (19:55):** ChatGPT («Alta», chat «Verificar cables submarinos en servicio») con los 21 que siguen con una sola voz y no propuso él (`chatgpt-cables-1/2.pregunta.txt`), y Gemini (4 Argon) con los 2 que propuso ChatGPT (Sorsogon–Samar y Tuvalu Vaka, `gemini-cables-1.pregunta.txt`).
- Después: `python3 herramientas/cables_agencia.py` (unos 3 min) y el proceso de los cables submarinos del traspaso. El workflow `datos-orbita.yml` también ejecuta `cables_agencia.py` cada 6 horas en `main`, así que `astra-confirma-r26-2.json` (Bonaire–Curaçao) entrará solo en la próxima ejecución.
