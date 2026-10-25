**Sí, se hace.** Con datos curados, umbrales estrictos y carga por viewport. El planeta sigue siendo de infraestructura; las ciudades son orientación al acercar, no el protagonista.

### 1) Fuente de datos y licencia

- **Base recomendada**: Natural Earth populated places (dominio público). ne_110m (~243 lugares significativos) para vista lejana; ne_10m (~7 300) para zoom medio. Incluye SCALERANK, POP_MAX, capitales y nombres. No exige atribución, aunque conviene “Made with Natural Earth”.
- **Complemento denso**: GeoNames cities15000 (~25 000 ciudades >15 000 hab. o capitales) o filtrado de cities5000. Licencia CC BY 4.0. Obligatorio atribuir: “Datos de ciudades: GeoNames (CC BY 4.0)” con enlace a geonames.org, y mencionar si se filtra o se procesa. El readme oficial lo exige explícitamente.
- Preprocesar a un archivo binario o JSON compacto (id, lat, lon, pop, capital, name, asciiname). No servir el dump completo.

### 2) Ciudades por nivel de zoom

- Zoom lejano (órbita alta): solo capitales de país + ciudades >1 M. Prioridad absoluta a capitales.
- Zoom medio: >100 000–200 000 hab., o SCALERANK de Natural Earth. Máximo ~40–50 etiquetas visibles en pantalla.
- Zoom cercano: umbral baja a >15 000–50 000, solo dentro del viewport + margen. Nunca más de ~60 etiquetas simultáneas.
- Anti-solapamiento: detección de colisión en espacio de pantalla (AABB o grid espacial). Ordenar por prioridad (capital > población). Ocultar o desvanecer las de menor rango. Fade suave al cruzar umbrales. Probar densidad máxima en móvil real.

### 3) Estilo visual coherente

- Punto: pequeño círculo o punto de 2–4 px en #9CC3E4 (acento), opacidad 0.6–0.9 según importancia. Nada de rellenos grandes ni iconos.
- Etiqueta: #F4F6F8, tipografía sans-serif ligera ya usada en la interfaz (no bold, no decorativa). Tamaño 10–12 px base, escala mínima con zoom. Opacidad alta solo en las prioritarias; el resto más tenue.
- Día/noche del planeta: las etiquetas mantienen contraste. En el lado nocturno subir ligeramente la opacidad o añadir un halo muy sutil del color de acento. No cambiar de color de forma dramática.
- Fondo #06080C se respeta; nada de sombras pesadas ni efectos que compitan con cables, satélites o centros de datos.

### 4) Rendimiento en móvil

- Datos totales filtrados y comprimidos: pocos cientos de KB a 1–2 MB máximo para el conjunto usable. No cargar cities1000 completo.
- Carga perezosa por región o teselas según posición de cámara y zoom. Solo lo que está en frustum + margen.
- Puntos: instanced rendering o gl.POINTS (una o pocas draw calls).
- Etiquetas: máximo 40–60 por fotograma en móvil. Usar overlays DOM o SDF de texto con culling agresivo. Medir en gama media real (no solo desktop).
- Si el dispositivo o la red es débil, degradar: solo capitales o desactivar etiquetas.

### 5) Idioma de los nombres

- Preferencia: nombre en el idioma de la página (si existe en GeoNames alternateNamesV2 con código ISO) y, si no, el endónimo/local o el asciiname.
- Para 42 idiomas: GeoNames alternateNames cubre muchas lenguas principales y variantes; completar las capitales y ciudades grandes con Wikidata o una tabla curada propia. No esperar cobertura perfecta en todos los idiomas menores.
- En tooltip o panel: mostrar ambos (local + traducido) cuando existan. Evitar mezclas raras en la etiqueta principal.

### 6) Interacción

- Tocar una ciudad puede resaltarla y mostrar un panel discreto (nombre, país, población aproximada, y opcionalmente centros de datos o cables cercanos ya presentes en Órbita). No es obligatorio.
- No centrar la experiencia en ello. Si añade carga o ruido, dejar solo hover/tap de resalte sin panel. Nunca usar la interacción para pedir o revelar ubicación del visitante.

### 7) Honestidad y riesgos

- Datos “tal cual”: poblaciones son estimaciones (LandScan, GeoNames, etc.), nombres pueden estar desactualizados o tener variantes. Añadir nota discreta de fuente y “datos aproximados”.
- Privacidad: cero geolocalización del visitante. No enviar coordenadas, no centrar el planeta en la ciudad del usuario, no inferir nada.
- Errores conocidos: ciudades pequeñas o disputadas pueden faltar o estar mal clasificadas. No inventar ni corregir manualmente sin fuente. Fronteras y nombres políticos sensibles se mantienen neutrales según la fuente elegida.

### 8) Qué NO hacer

- No cargar todos los datos al inicio ni todas las ciudades a la vez.
- No permitir densidades que tapen cables, satélites o centros de datos.
- No usar fuentes propietarias sin licencia clara.
- No mostrar nivel de calle, edificios o datos inventados.
- No rastrear ni personalizar según ubicación del visitante.
- No hacer las ciudades el foco principal; Órbita sigue siendo infraestructura de internet.

**Recomendación final:** Sí, con Natural Earth para la base pública y GeoNames filtrado solo en zooms cercanos, carga perezosa, prioridad capitales/población y límite estricto de etiquetas.
