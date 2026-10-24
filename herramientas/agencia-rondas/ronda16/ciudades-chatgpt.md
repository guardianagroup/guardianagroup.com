**Sí. Recomiendo incorporar ciudades a Órbita, pero como una capa cartográfica inteligente que aparece progresivamente con el zoom.** Deben ayudar a comprender dónde está la infraestructura, sin competir visualmente con ella.

## 1. Fuente de datos y licencia

- **Natural Earth – Populated Places:** para capitales y grandes ciudades en vistas globales. Dominio público, uso comercial permitido y atribución voluntaria. [Natural Earth]
- **GeoNames:** fuente principal para ampliar el detalle. `cities15000` (~25.000 registros), `cities5000` (~50.000) y `cities1000` (~130.000). Licencia CC BY 4.0. [download.geonames.org]
- **Atribución:** en «Fuentes y licencias», accesible desde Órbita: «Datos geográficos: GeoNames (CC BY 4.0), adaptados por GUARDIANA; Natural Earth (dominio público)». Enlaces a fuentes y licencia, indicando las modificaciones.
- **Actualización:** descargar y depurar datos en el servidor cada trimestre; no consultar la API de GeoNames desde cada navegador.

## 2. Qué ciudades aparecen según el zoom

Propuesta inicial basada en altura aproximada de la cámara sobre la superficie, ajustable según el tamaño de pantalla:

| Altura | Ciudades visibles |
| --- | --- |
| Más de 8.000 km | Ninguna. Protagonismo absoluto del planeta |
| 8.000–2.500 km | Capitales destacadas y metrópolis de más de 5 millones |
| 2.500–700 km | Capitales nacionales y ciudades de más de 1 millón |
| 700–150 km | Capitales regionales y ciudades de más de 100.000 |
| 150–30 km | Ciudades de más de 15.000 |
| Menos de 30 km | Ciudades de más de 5.000; las de 1.000 solo en detalle avanzado |

Las capitales tienen prioridad, pero nunca visibilidad garantizada si se solapan.

**Límites simultáneos:** 40–60 etiquetas en ordenador y 15–25 en móvil, reducidos cuando haya mucha infraestructura.

Aplicar detección de colisiones mediante cajas de texto, separación de 6–8 px y posiciones alternativas. Priorizar capitales, importancia regional y población; mantener las etiquetas estables mientras se gira el planeta. [MapLibre GL JS]

## 3. Estilo visual

GUARDIANA · ÓRBITA

EJEMPLO VISUAL

![](data:image/svg+xml;charset=utf-8,%3Csvg%20font-family%3D%22-apple-system-body%2C%20ui-sans-serif%2C%20-apple-system%2C%20system-ui%2C%20%26quot%3BSegoe%20UI%26quot%3B%2C%20Helvetica%2C%20%26quot%3BApple%20Color%20Emoji%26quot%3B%2C%20Arial%2C%20sans-serif%2C%20%26quot%3BSegoe%20UI%20Emoji%26quot%3B%2C%20%26quot%3BSegoe%20UI%20Symbol%26quot%3B%22%20font-weight%3D%22400%22%20data-d-component%3D%22svg%22%20fill%3D%22currentColor%22%20style%3D%22color%3Argb(237%2C%20237%2C%20237)%22%20viewBox%3D%220%200%20340%20120%22%20width%3D%22100%25%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2288%22%20cy%3D%2247%22%20r%3D%223.2%22%20fill%3D%22%239CC3E4%22%2F%3E%3Ctext%20x%3D%22100%22%20y%3D%2251%22%20font-size%3D%2213%22%20font-weight%3D%22550%22%20font-family%3D%22sans-serif%22%20fill%3D%22%23F4F6F8%22%3EBogot%C3%A1%3C%2Ftext%3E%3Ccircle%20cx%3D%22219%22%20cy%3D%2228%22%20r%3D%222.2%22%20fill%3D%22%239CC3E4%22%20opacity%3D%22.8%22%2F%3E%3Ctext%20x%3D%22229%22%20y%3D%2232%22%20font-size%3D%2211.5%22%20font-family%3D%22sans-serif%22%20fill%3D%22%23F4F6F8%22%20opacity%3D%22.8%22%3ETunja%3C%2Ftext%3E%3Ccircle%20cx%3D%22164%22%20cy%3D%2292%22%20r%3D%221.8%22%20fill%3D%22%239CC3E4%22%20opacity%3D%22.65%22%2F%3E%3Ctext%20x%3D%22174%22%20y%3D%2296%22%20font-size%3D%2211%22%20font-family%3D%22sans-serif%22%20fill%3D%22%23F4F6F8%22%20opacity%3D%22.7%22%3EGirardot%3C%2Ftext%3E%3C%2Fsvg%3E)

Jerarquía de capital, ciudad regional y ciudad secundaria. Sin tarjetas ni elementos decorativos.

- Punto de 2–3 px en `#9CC3E4`, sin resplandor permanente.
- Texto `#F4F6F8`, opacidad del 70–90 %, tamaño de 11–13 px; mínimo legible de 12 px en móvil.
- Tipografía Inter con respaldo Noto Sans para alfabetos internacionales.
- Desvanecimiento de 180–250 ms al entrar o salir del nivel.
- Día y noche: mismo estilo cartográfico, ajustando contraste sobre el terreno. Las ciudades no deben simular luces artificiales propias.
- Ocultar cualquier ciudad situada detrás del horizonte terrestre.

## 4. Rendimiento en móvil

- GeoNames comprimido: `cities15000` ~3,2 MB; `cities5000` ~5,5 MB; `cities1000` ~11 MB. Son tamaños de los archivos originales, **no descargas que deba efectuar cada visitante**. [download.geonames.org +1]
- Preprocesar y generar teselas vectoriales jerárquicas según zoom y área visible.
- Objetivo orientativo: 20–50 KB comprimidos por tesela, únicamente cuando sea necesaria.
- Cargar únicamente la cara visible del planeta y regiones próximas al encuadre.
- Dibujar hasta 25 etiquetas por fotograma en móvil y 60 en ordenador; recalcular su distribución al cambiar significativamente la cámara, no necesariamente 60 veces por segundo.
- Mantener un atlas de glifos y reutilizar geometrías. Si baja el rendimiento, reducir primero etiquetas secundarias, nunca cables o centros de datos.

## 5. Idioma de las ciudades

**Mostrar un único nombre en el idioma de la página cuando exista un exónimo reconocido.** De lo contrario, utilizar el nombre local.

Ejemplos: «Londres» en español, «London» en inglés; «München» como nombre local cuando no haya traducción validada.

- GeoNames `alternateNamesV2` ofrece variantes por idioma y marca nombres preferidos e históricos. [download.geonames.org]
- Wikidata aporta etiquetas estructuradas multilingües bajo CC0. [Wikidata]
- Cruzar registros mediante identificadores estables, sin equiparar ciudades únicamente por parecido textual.
- En la ficha ampliada, mostrar opcionalmente el nombre local.
- Nunca traducir automáticamente los topónimos con IA. Para los 42 idiomas habrá nombres sin traducción: conservar el local.

## 6. Interacción

**Sí, pero limitada y útil para la misión de GUARDIANA.**

Al tocar una ciudad se abre una ficha discreta con nombre, país y la acción «Ver infraestructura cercana».

Esta acción destaca centros de datos, puntos de intercambio, estaciones de amarre y troncales próximas que estén documentadas en Órbita.

Sin ventanas grandes, sin abandonar el planeta y sin desplazar automáticamente la cámara. El segundo toque puede cerrar la ficha.

En móvil, área táctil invisible de al menos 44 × 44 px.

## 7. Honestidad y riesgos

- Mostrar ciudades reales con coordenadas documentadas; nada generado o completado mediante IA.
- Los datos de población pueden estar desactualizados y no son homogéneos entre países.
- Revisar capitales, nombres históricos, territorios disputados y ubicaciones duplicadas.
- Indicar «Ubicación aproximada» cuando la coordenada represente el centro de una localidad y no una posición exacta.
- No afirmar que un cable o una conexión pasa por una ciudad solo porque aparece cerca.
- **Privacidad:** mostrar ciudades no exige conocer dónde está el visitante. La capa debe funcionar sin geolocalización, sin permisos y sin transmitir su posición.
- Mantener identificada la fuente y fecha de actualización del catálogo.

## 8. Qué NO hacer

- No llenar el planeta de miles de nombres.
- No añadir fotografías, edificios 3D, monumentos o carreteras.
- No incorporar luces intermitentes, animaciones constantes o efectos de videojuego.
- No tapar cables, satélites ni infraestructura importante con etiquetas.
- No mostrar ciudades de 1.000 habitantes por defecto.
- No introducir un selector adicional de ciudades en la barra principal: basta con «Ciudades» dentro de las opciones cartográficas, activado por defecto y con posibilidad de desactivarlo.
- No utilizar etiquetas extraídas de Google Maps ni depender de servicios cartográficos externos para cada movimiento.

**Recomendación final:** SÍ, incorporar ciudades con Natural Earth + GeoNames, aparición progresiva al acercarse, etiquetas premium discretas, máximo 60 en ordenador y 25 en móvil, y una interacción destinada exclusivamente a descubrir la infraestructura real de internet.
