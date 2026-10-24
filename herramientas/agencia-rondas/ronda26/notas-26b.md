# Ronda 26b · Segunda voz para los cables submarinos de una sola voz (24 Oct 2026, desde las 18:00)

Lotes de 5 en `lotes-cables.json`; pregunta en `pregunta-cables.txt`. Astra 6 responde; Claude comprueba lo dudoso contra textos publicados antes de dar por buena la segunda voz.

- **Lote 1** (Sorsogon–Samar, Tuvalu Vaka, Balticconnector, Channel Islands, ESAT-1): Astra solo da ESAT-1, y avisa de que no puede comprobar que siga en servicio. **Descartado:** ISPreview (junio de 2026) dice que ESAT-1 «reached the end of its operational lifespan in 2024» y que el cable Beaufort lo sustituye. La propuesta original de ESAT-1 era de Claude: queda como error de una sola voz.
- **Lote 2** (ADONES, Aphrodite 2, Aquilink, Blue Sky, Bonaire–Curaçao): Astra confirma ADONES y Bonaire–Curaçao.
  - **ADONES, descartado:** WFN Strategies (2013) lo describe en estudio de «recommissioning», y Subtel Forum (dic. 2020, sobre Nzadi) dice que los proyectos de festón de 2009 y 2017 «failed to deliver». No consta que esté en servicio.
  - **Bonaire–Curaçao Cable System:** entra (Gemini + Astra). Claude no encontró nada en contra (las noticias de 2025 sobre CELIA no describen la conexión actual de Bonaire).
- **Lote 3** (Cabo San Lucas–Mazatlán, Denmark-Germany 2, DN-6, DS-16, DS-18): Astra `[]`.
- **Lote 4** (Digicel Marianas, Eastern Light II, Savusavu–Taveuni, GLO-2, HaidaLink): Astra `[]`.
- **Quedan los lotes 5–8** de `lotes-cables.json` (Hawaiki Nui 1, Lanka Bell, Mazatlán–La Paz, Mozambique Festoon, SCSN; Oahu–Kauai, PENBAL-5, Pichilingue–Topolobampo, Puerto Montt–Chacabuco, Réseau Phoebus; Sabr, SunCable/Groote, SMAP-Kangaroo, Trans-Cook Strait, Tui-Samoa a Vanua Levu; WARF). Misma pregunta (`pregunta-cables.txt`) en el Playground de Astra.
- Después: `python3 herramientas/cables_agencia.py` (unos 3 min) y el proceso de los cables submarinos del traspaso. El workflow `datos-orbita.yml` también ejecuta `cables_agencia.py` cada 6 horas en `main`, así que `astra-confirma-r26-2.json` (Bonaire–Curaçao) entrará solo en la próxima ejecución.
