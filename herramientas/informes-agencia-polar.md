# Infraestructura polar de Internet — datos verificados (consulta 22-oct-2026)

Advertencia: las coordenadas de bases y puntos de amarre son aproximadas (conocimiento geográfico general / COMNAP-Wikipedia) y no se verificaron una a una en esta búsqueda acotada (~20 llamadas). Las cifras de km, años, dueños y estados sí provienen de las fuentes citadas. `null` en el JSON = no verificado.

## A) Antártida

### Cables submarinos
- **Confirmado: no hay ningún cable submarino en servicio** que conecte la Antártida (Wikipedia «Telecommunications in Antarctica»: toda comunicación intercontinental es radio, satélite o transporte físico).
- **Chile (Subtel) — estudio de factibilidad terminado ago-2026**, hecho por Salience Consulting + Pioneer Consulting (feb-2025 → ago-2026, ~2.000 páginas, 55 instalaciones evaluadas), financiado por CAF y MCDF (China). Resultado técnicamente positivo.
  - Opción 1: Punta Arenas + Puerto Williams → bases Frei, O'Higgins y Prat. ~1.600 km, US$370 M.
  - Opción 2: añade Palmer (EE. UU.), Rothera (GB), San Martín, Esperanza, Petrel (AR) y Ferraz (BR): 9 amarres antárticos, ~4.100 km, US$620-621 M.
  - Estado: **propuesto**. Pasa al Consejo de Política Antártica en nov-2026; Chile no lo financiaría solo; plazo total estimado 8 años. Dueño/operador sin definir. (La «licitación» de sep-2024 fue para el estudio, no para construir.)
  - Fuentes: Emol 18-ago-2026, Maritime Executive 23-ago-2026, Subtel/Pioneer (oceannews).
- **NSF (EE. UU.) McMurdo → Nueva Zelanda o Australia**: taller jun-2021; factibilidad inicial positiva ago-2022; estudio de escritorio publicado 27-dic-2023 (página NSF actualizada ene-2025). Sin ruta, km, coste ni fecha publicados; NSF prepara segundo taller científico y estudios de seguimiento que podrían llevarlo al proceso de diseño de instalación mayor. Estado: **propuesto**. Invercargill/Scott Base no aparecen nombrados en la fuente.
- Australia / Argentina: no se encontraron propuestas propias en esta búsqueda (Argentina y Australia solo aparecen como amarres candidatos del proyecto chileno / destino del de NSF).

### Cómo se conectan hoy las estaciones (fuentes: future.usap.gov; Wikipedia; DCD/Eutelsat)
- **McMurdo**: VSAT + Ross Island Earth Station (NOAA/JPSS, comisionada mar-2022, sustituye Black Island); enlace histórico compartido 17 Mbps; pruebas Starlink desde sep-2022 (segundo terminal en Allan Hills nov-2022). Página NSF menciona que evaluará Starlink en todas sus estaciones.
- **Polo Sur (Amundsen-Scott)**: no ve satélites geoestacionarios; usa NASA TDRS (relé SPTR, 50 Mbps desde 2007-08), DSCS (DoD, cobertura parcial del día), GOES e Iridium. Starlink en evaluación.
- **Palmer**: nuevo proveedor satelital desde oct-2020 (capacidad ×3).
- **Rothera (BAS)**: Eutelsat OneWeb «TALARIA» desde abr-2024, hasta 120 Mbps vía gateway en Chile (antes ≤5 Mbps).
- **Scott Base (NZ)**: banda C (Spark NZ / Horizons 3E); prueba de Starlink desde abr-2023.
- **Casey/Davis/Mawson (AU)**: Speedcast, 9 Mbps simétricos (dato de Wikipedia, puede estar desactualizado).
- **Marambio (AR)**: Wi-Fi local + Orbcomm para mensajes cortos.
- **Troll (NO)**: a través de TrollSat.
- Halley, Neumayer III, Concordia, Dumont d'Urville, King Sejong, Great Wall, Zhongshan, Vostok, Progress, Syowa, Maitri/Bharati, SANAE IV, Ferraz: enlace **no verificado** en esta búsqueda (`null`).

### Estaciones terrenas
- **TrollSat (KSAT)**, 72.0167°S 2.5333°E: operativa desde mar-2007, inaugurada 20-ene-2008; 3 antenas bajo un radomo (7,3 m S/X; 4,8 m y 7,6 m banda C); uplink banda C 45 Mbps a Europa/Norteamérica; conectada al NOC de KSAT en Tromsø; con SvalSat permite descargas dos veces por órbita (ESA Envisat, Galileo, satélites NASA). KSAT anunció 6 antenas más (2021).
- **McMurdo Ground Station (NASA Near Space Network)**: existe en la lista de complejos NSN de NASA; no se verificaron detalles.
- Concordia / Dumont d'Urville: sin estación terrena documentada en las fuentes consultadas.

## B) Ártico

### Cables en servicio
- **Svalbard Undersea Cable System** (Space Norway): tendido jul-ago 2003; Hotellneset (Longyearbyen) ↔ Breivika (Andøya) ↔ Harstad; dos cables de 1.375 y 1.339 km, 8 pares de fibra cada uno (1 en uso), 10 Gb/s por segmento inicial, potencial 2.500 Gb/s; uno cortado en ene-2022 (actividad humana según policía). Alimenta SvalSat.
- **Greenland Connect** (Tusass / TELE Greenland): en servicio 23-mar-2009; Milton (Terranova) – Qaqortoq – Nuuk – Landeyjasandur (Islandia); red total ~4.800 km; 2 pares de fibra.
- **Greenland Connect North** (Tusass): Nuuk – Aasiaat, 680 km, servicios desde 11-dic-2017.
- **Quintillion** (Alaska): instalación terminada oct-2017; Nome, Kotzebue, Point Hope, Wainwright, Utqiaġvik, Prudhoe Bay; 2.250 km (submarino + terrestre).
- **Polar Express** (Morsviazsputnik, Rusia): 12.650 km Teriberka → Vladivostok por la Ruta Marítima del Norte, 52-104 Tb/s, 65.000 M rublos; tramo Teriberka–Amderma tendido 27-oct-2022, estación Dikson 2023, Tiksi previsto 2024-25; finalización prevista 2026. **No hay confirmación pública de tramos en servicio comercial** → estado «en construcción».

### Planeados
- **Far North Fiber** (Far North Digital + Cinia + Arteria; ASN como constructor): Japón ↔ Alaska ↔ (Canadá/Groenlandia/Noruega/Finlandia/Irlanda según promotor) por el Paso del Noroeste, >16.000 km; estudio de ruta 2023; objetivo original fin de 2026 ya no alcanzable; nueva fecha no verificada. Sucesor de Arctic Connect (Cinia/MegaFon, cancelado 2021).

### Estaciones terrenas (coordenadas aproximadas)
SvalSat (78.23N 15.39E; abierta 15-abr-1999, NASA + NSC; antes del cable 55 Mbps vía Intelsat), Tromsø/KSAT NOC, Inuvik (CA), Esrange Kiruna (SE), Alaska Satellite Facility Fairbanks (US), Sodankylä (FI). Solo SvalSat y Tromsø se verificaron con fuente en esta búsqueda.

## Fuentes principales
- https://www.emol.com/noticias/Nacional/2026/08/18/1208799/cable-fibra-optica-magallanes-antartica.html
- https://maritime-executive.com/article/antarctica-submarine-cable-project-confirmed-feasible
- https://oceannews.com/news/subsea-cable/pioneer-consulting-and-salience-consulting-to-begin-chile-antarctica-submarine-fiber-optic-cable-feasibility-study/
- https://www.nsf.gov/geo/updates/connecting-last-continent-new-desktop-study-antarcticas
- https://future.usap.gov/communications-improvements
- https://en.wikipedia.org/wiki/Telecommunications_in_Antarctica
- https://www.datacenterdynamics.com/en/news/eutelsat-oneweb-launches-antarctic-connectivity-services/
- https://en.wikipedia.org/wiki/Troll_Satellite_Station
- https://www.ksat.no/news/news-archive/2021/ksat-to-build-six-antennas-at-the-troll-station/
- https://www.nasa.gov/technology/space-comms/near-space-network-complexes/
- https://en.wikipedia.org/wiki/Svalbard_Undersea_Cable_System
- https://www.rcinet.ca/eye-on-the-arctic/2022/01/10/disruption-at-one-of-two-undersea-cables-to-svalbard/
- https://en.wikipedia.org/wiki/Greenland_Connect
- https://www.tusass.gl/en/infrastructure/submarine-cable/
- https://www.capacitymedia.com/articles/3772562/arctic-subsea-cable-goes-into-service-to-connect-northern-alaska
- https://en.wikipedia.org/wiki/Polar_Express_(cable_system)
- https://www.akbizmag.com/industry/telecom-tech/trans-arctic-cable-consortium-to-connect-asia-to-europe-via-alaska/
- https://www.farnorthfiber.com/s/FNF-Cable-Route-Study-Released_11042023.pdf
