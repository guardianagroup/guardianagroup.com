# Modelo: gpt-6-astra (Cheaper Inference, playground)

**Sí: ciudades como referencia geográfica al acercarse, no como una nueva capa protagonista.** Ayudan a situar la infraestructura; no hace falta representar calles ni edificios.

### 1) Fuente de datos y licencia
- **Recomendación inicial:** GeoNames `cities15000`; incorporar `cities5000` si las pruebas justifican más detalle. Reservar `cities1000` para una fase posterior. Revisar cobertura: sus criterios también incluyen determinadas localidades administrativas.
- GeoNames: **CC BY 4.0**. Mostrar en «Fuentes y licencias»: «Ciudades: GeoNames, CC BY 4.0», con enlaces a la fuente y licencia, fecha de descarga y aviso de filtrado o modificaciones.
- Alternativa más ligera: **Natural Earth, populated places**, dominio público; adecuada para escalas globales, menos completa al acercarse. Atribuirla igualmente por transparencia.

### 2) Ciudades por nivel de zoom
Usar la **extensión terrestre visible**, no el número de pasos de la rueda. Punto de partida:
- **Planeta completo:** ninguna etiqueta; mantener limpia Órbita.
- **Vista continental, más de 3.000 km de ancho:** capitales nacionales y ciudades de más de 5 millones.
- **Regional, 800–3.000 km:** añadir ciudades de más de 1 millón.
- **Cercana, 200–800 km:** añadir ciudades de más de 100.000.
- **Local, menos de 200 km:** añadir localidades del conjunto elegido, inicialmente alrededor de 15.000 habitantes.

Son umbrales iniciales, no obligaciones de mostrar todas. Priorizar capitales, población y estabilidad de las etiquetas ya visibles. **Máximo orientativo: 24 etiquetas en móvil y 60 en ordenador**, con separación mínima de 8 px, detección de colisiones y pequeñas transiciones para evitar parpadeos. Las capitales también ceden si no caben.

### 3) Estilo visual
- Punto de **3–4 px CSS**, discreto; capitales con pequeño aro, sin estrellas políticas.
- Etiqueta `#F4F6F8`, tipografía de interfaz, peso 400–500, **12–14 px**; halo oscuro `#06080C`. Acento `#9CC3E4` solo en selección.
- Opacidad estable de aproximadamente 85–95 % para texto, menor para puntos.
- Mismo lenguaje visual de día y noche: ajustar halo/contraste, **no simular luces urbanas ni actividad real**.
- Ocultar etiquetas tras el planeta y cerca del horizonte cuando resulten ilegibles.

### 4) Rendimiento móvil
- Preparar los datos fuera del cliente: ID, coordenadas, población, prioridad y nombres necesarios.
- **Objetivos de presupuesto**, no tamaños garantizados: índice inicial comprimido ≤200 KB; teselas visibles ≤100 KB cada una.
- Teselas geográficas con niveles de detalle; carga perezosa, caché y cancelación de solicitudes al cambiar de región.
- Dibujar texto mediante atlas de glifos y lotes GPU; evitar miles de elementos HTML.
- Mantener **≤24 etiquetas visibles por fotograma en móvil**. Recalcular selección/colisiones como máximo unas 10 veces por segundo durante el movimiento; no reconstruir datos cada fotograma.

### 5) Idioma
- Mostrar **un nombre en el idioma de la página** cuando exista; si falta, nombre local verificado. Ambos solo en la ficha.
- Usar nombres alternativos de GeoNames con sus códigos de idioma y preferencias; procesarlos en servidor y distribuir únicamente los idiomas necesarios.
- Para 42 idiomas, revisar cobertura y admitir explícitamente nombres sin traducir. **No inventar traducciones ni transliteraciones.**
- Incluir soporte tipográfico y dirección RTL; evitar descargar de entrada fuentes de todos los alfabetos.

### 6) Interacción
- **Primera versión: etiquetas informativas, sin clic.** Añadir selección solo si ofrece utilidad.
- Después: ficha con nombre, país y «infraestructura registrada cercana», indicando radio y fuente. Cercanía **no significa conexión ni servicio**.
- Si son interactivas: área táctil de al menos 44 px, foco accesible y sin bloquear el giro del globo.

### 7) Honestidad y riesgos
- Poblaciones desactualizadas y definiciones distintas de ciudad pueden alterar prioridades: publicar fecha y permitir reportar errores.
- No asociar coordenadas del centro urbano con ubicaciones exactas de instalaciones.
- Aplicar una política coherente para nombres disputados, capitales y territorios.
- **No pedir GPS, inferir ni mostrar dónde está el visitante** para esta función.

### 8) Qué NO hacer
No mostrar todas las ciudades, mezclar etiquetas con colores de cables, añadir destellos, descargar el catálogo mundial completo con todos los idiomas, fingir cobertura exhaustiva ni convertir cada punto en un botón vacío.

**Recomendación final: sí, lanzar ciudades discretas con GeoNames cities15000, detalle progresivo, nombres verificados y límites estrictos de etiquetas; interacción útil después.**
