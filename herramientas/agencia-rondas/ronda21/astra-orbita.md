# Ronda 21 · Astra 6 (gpt-6-astra) · Órbita: 10 ideas

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`, en el Playground de Cheaper Inference, salida máxima 4.096 tokens; terminó por sí sola, `finish_reason: stop`, en una sola parte):

> Órbita ya muestra, en un planeta 3D:
> - 480 cables submarinos con el pueblo de cada llegada y su capacidad por colores;
> - cables por tierra de 138 países;
> - unos 3.000 centros de datos y puntos de intercambio;
> - los satélites de comunicaciones en tiempo real;
> - ciudades al acercarse;
> - la medida de la conexión del visitante hasta 33 centros de datos.
> ¿Qué más añadirías para que sea el mejor mapa de la infraestructura de internet del mundo? Da 10 ideas, de más a menos impacto: capas, datos o formas de interactuar. Para cada una, di de qué fuente abierta saldrían los datos y con qué licencia (no vale TeleGeography, submarinecablemap.com ni PeeringDB), el esfuerzo que requiere y por qué le importaría a la gente.

---

Añadiría menos objetos y más respuestas a preguntas: **«¿por dónde viajan mis datos?, ¿qué falla si se corta esto?, ¿quién controla la infraestructura?»** Este sería mi orden de impacto.

Esfuerzos orientativos para una persona desarrolladora, aprovechando el motor 3D existente; no incluyen mantenimiento. **Datos accesibles no siempre son datos abiertos**: conservaría licencia, procedencia y fecha por conjunto.

### 1. «Muéstrame el viaje de una conexión»
Seleccionar una medición y reproducir sus saltos IP, extremos y tiempos. Comparar recorrido lógico observado con infraestructura física cercana, **sin afirmar que utiliza un cable concreto**.

- **Fuente/licencia:** archivos públicos de traceroute/scamper de Measurement Lab (**CC0**); coordenadas de sus nodos.
- **Esfuerzo:** alto, 6–10 semanas.
- **Por qué importa:** convierte internet en algo comprensible. Son rutas de mediciones disponibles, no necesariamente la ruta actual del visitante. Los saltos sin ubicación fiable quedarían fuera del globo, en un diagrama.

### 2. Un mapa de la calidad experimentada
Mostrar velocidad y latencia por zona, con evolución, percentiles, número de muestras y comparación entre territorios. Mucho más útil que pintar únicamente capacidad instalada.

- **Fuente/licencia:** mediciones NDT de Measurement Lab (**CC0**).
- **Esfuerzo:** medio-alto, 4–6 semanas.
- **Por qué importa:** permite contrastar «hay fibra» con «la conexión funciona bien». Advertiría que las pruebas son voluntarias, no una muestra representativa; agregaría resultados sin publicar IP personales.

### 3. Simulador «¿y si se corta aquí?»
Desactivar un cable, una llegada o un nodo y explorar conexiones alternativas y posibles puntos únicos de fallo.

- **Fuente/licencia:** infraestructura cartografiada en OpenStreetMap (**ODbL 1.0**), complementada únicamente con capas existentes cuya licencia permita ese uso.
- **Esfuerzo:** alto, 8–12 semanas.
- **Por qué importa:** explica resiliencia y dependencia. Sería una **simulación de topología conocida**, no una predicción de apagones: faltarán enlaces, capacidad disponible y acuerdos comerciales.

### 4. «¿De quién es internet aquí?»
Agrupar instalaciones y enlaces por propietario, operador y grupo empresarial; distinguir esas relaciones y mostrar concentración territorial.

- **Fuente/licencia:** Wikidata (**CC0**) y etiquetas de operadores de OpenStreetMap (**ODbL 1.0**).
- **Esfuerzo:** medio-alto, 4–8 semanas, más revisión.
- **Por qué importa:** ayuda a periodistas, estudiantes y comunidades a entender dependencias. Mostraría cobertura del inventario y fecha de cada relación; ambas fuentes tienen lagunas.

### 5. Ficha de evidencia para cada elemento
Al pulsar: fuente original, licencia, última actualización, precisión geográfica y condición —operativo, proyectado o desconocido—. Añadir «reportar un error», con revisión pública.

- **Fuente/licencia:** metadatos e historiales de OpenStreetMap (**ODbL 1.0**), Wikidata (**CC0**) y manifiestos de cada conjunto incorporado.
- **Esfuerzo:** medio, 3–5 semanas.
- **Por qué importa:** diferencia un mapa fiable de una visualización espectacular. Aunque ocupa el quinto puesto, lo construiría desde el principio.

### 6. Infraestructura expuesta a terremotos
Superponer terremotos recientes y mapas de intensidad sobre llegadas de cables, rutas terrestres y centros de datos.

- **Fuente/licencia:** productos elaborados por USGS, como catálogo sísmico y ShakeMap (**dominio público estadounidense**; conservar créditos).
- **Esfuerzo:** bajo-medio, 2–4 semanas.
- **Por qué importa:** contextualiza noticias y permite explorar exposición. Estar cerca de un terremoto **no demuestra daño ni interrupción**; no mostraría falsas alertas de caída.

### 7. La brecha entre infraestructura y acceso
Comparar infraestructura visible con porcentaje de población conectada y suscripciones de banda ancha fija por país.

- **Fuente/licencia:** indicadores del Banco Mundial `IT.NET.USER.ZS` e `IT.NET.BBND.P2` (**CC BY 4.0**, según sus fichas).
- **Esfuerzo:** bajo, 1–2 semanas.
- **Por qué importa:** revela que tener cables cerca no garantiza acceso. Mostrar año y unidad: suscripciones no equivalen a personas ni velocidad.

### 8. La última milla
Al acercarse, mostrar centrales, armarios de telecomunicaciones, antenas y torres identificadas, con filtros por tecnología cuando esté documentada.

- **Fuente/licencia:** OpenStreetMap (**ODbL 1.0**).
- **Esfuerzo:** medio, 3–5 semanas.
- **Por qué importa:** conecta el planeta con el barrio. No convertiría la presencia de una antena en una supuesta cobertura móvil; ausencia de datos tampoco significa ausencia de servicio.

### 9. La dependencia eléctrica
Añadir redes eléctricas, subestaciones y centrales alrededor de grandes concentraciones digitales.

- **Fuente/licencia:** OpenStreetMap (**ODbL 1.0**) y Global Power Plant Database de WRI (**CC BY 4.0**).
- **Esfuerzo:** medio, 3–5 semanas.
- **Por qué importa:** explica que internet también depende de electricidad. Proximidad no demuestra suministro contractual, redundancia ni huella de carbono; señalaría antigüedad del inventario.

### 10. Una máquina del tiempo
Deslizador para comparar versiones del mapa y aperturas o retiradas documentadas.

- **Fuente/licencia:** historial de OpenStreetMap (**ODbL 1.0**) y revisiones y fechas documentadas en Wikidata (**CC0**).
- **Esfuerzo:** medio-alto, 4–8 semanas.
- **Por qué importa:** genera historias compartibles sobre cómo cambia internet. Separaría estrictamente **«apareció en la base»** de **«entró en funcionamiento»**.
