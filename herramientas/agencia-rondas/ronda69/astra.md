# Ronda 69 · Astra 6 (gpt-6-astra, Cheaper Inference) · Órbita: el mapa de las amenazas

27 Oct 2026, ~20:10 (Bogotá). Playground de Cheaper Inference (pregunta resumida, solo información del producto; tope de 4.096 tokens de salida). Lo esencial, fiel. Astra avisa de que no tiene verificación web en directo: no certifica qué condiciones estaban vigentes hoy y deja como pendiente toda fuente cuya licencia no se haya revisado y archivado. Con **❗** van los puntos que conviene contrastar con la comprobación de Claude (`claude-fuentes.md`) o con las otras voces.

1. **Dictamen:** sí a incorporar amenazas en Órbita; no a presentarlas como un ranking de «países que roban datos». Propone «Órbita · Amenazas observadas», con tres preguntas separadas:
   - dónde se ha observado infraestructura que distribuye malware;
   - dónde se han registrado impactos;
   - qué capacidad de respuesta tiene cada país.

   «Dónde se roban más datos» no tiene una respuesta mundial fiable: una filtración puede implicar víctimas, servidores y responsables en jurisdicciones distintas.
2. **Qué significa tener permiso.** Hay que comprobar por separado:
   - acceso y descarga;
   - uso comercial;
   - transformación y agregación;
   - publicación de resultados;
   - redistribución (exportaciones o API);
   - atribución, conservación y actualización.

   Gratis no significa reutilizable; pagar una API no da derecho a republicarla; agregar por países no elimina las restricciones. Propone un registro público de fuentes y otro interno de permisos, versiones de licencia y acuerdos.
3. **Infraestructura maliciosa:**
   - **abuse.ch** (URLhaus, ThreatFox, MalwareBazaar): no hay una licencia común; revisar cada proyecto. Sin esa revisión, pendiente. (Coincide con Claude: el uso comercial puede requerir suscripción con Spamhaus.)
   - **Spamhaus:** los accesos gratuitos tienen condiciones; pedir permiso expreso para una agregación pública. **❗** Claude comprobó que DROP es «free for any use», citando a Spamhaus; DBL sí requiere suscripción.
   - **Shadowserver:** sus informes para operadores no son datos abiertos; uso comercial no autorizado sin acuerdo (coincide con Claude y ChatGPT).

   **Recomendación:** negociar una fuente principal de infraestructura observada antes de diseñar una capa que después no se pueda publicar.
4. **Tráfico, filtraciones e informes de empresas:**
   - **Cloudflare Radar:** cubre solo lo que ve Cloudflare; una licencia CC BY-NC no permite nuestro uso comercial. **❗** Omite que los gráficos insertables son CC BY 4.0 (Claude).
   - **HIBP:** CC BY 4.0 en la API, compatible con uso comercial y atribución; no dice dónde se produjo el robo. Encaja mejor en educación y consultas privadas que en un ranking geográfico (coincide con Claude).
   - **Microsoft Digital Defense Report:** un informe público no es una base abierta; citar hallazgos no es copiar gráficos.
5. **Organismos públicos e índices:**
   - **ENISA:** revisar el aviso de reutilización de cada publicación; anexos y gráficos pueden tener derechos distintos;
   - **Europol:** «No lo sé» sin revisar el aviso legal;
   - **FBI IC3:** las obras federales de EE. UU. suelen carecer de copyright allí; comprobar componentes de terceros; no implica aval del FBI;
   - **ITU GCI:** si tiene restricción no comercial, hace falta autorización (Claude lo confirmó: CC BY-NC-SA 3.0 IGO);
   - **NCSI:** licencia por verificar; poder consultarlo no basta.

   Ninguna de estas fuentes permite afirmar qué países «roban más».
6. **Mostrar sin estigmatizar:**
   - separar alojamiento observado, impacto denunciado y capacidad institucional, sin una puntuación única de «peligrosidad»;
   - cada ficha indica qué se cuenta (IP, dominio, URL, incidente o denuncia), el periodo, la última actualización y la cobertura, qué ubicación representa (servidor, víctima o denunciante) y qué no permite concluir;
   - mensaje permanente: «La ubicación de la infraestructura no identifica al responsable»;
   - sin banderas acusatorias, «países criminales» ni colores que parezcan un juicio nacional. Un país con grandes nubes puede alojar más infraestructura abusada; uno con mejores canales de denuncia puede registrar más víctimas.
7. **Normalizar sin fabricar precisión:** cifras absolutas y tasas solo con denominadores compatibles:
   - IP maliciosas respecto de las IP observadas por el mismo sistema;
   - dispositivos afectados respecto de los cubiertos por esa telemetría;
   - denuncias respecto de la población conectada, si hay una estimación oficial compatible.

   - Nunca dividir URL maliciosas entre habitantes y llamarlo «riesgo personal». **❗** Gemini proponía normalizar por habitantes conectados.
   - Documentar deduplicación, geolocalización, IPv4/IPv6, infraestructura compartida y cambios de método.
   - Sin un denominador defendible, no hay ranking normalizado.
   - «Sin datos» se muestra distinto de «sin detecciones».
8. **Capas útiles:**
   - infraestructura observada (contexto, no un listado operativo de enlaces peligrosos);
   - impacto denunciado, en capas independientes;
   - evolución temporal, solo si la cobertura permite comparar;
   - capacidad de respuesta (ITU o NCSI, con permiso; no como garantía de seguridad);
   - «Qué puedo hacer», explicado por NÚCLEO.

   Cables, centros de datos y satélites siguen siendo contexto físico: no dibujar recorridos de ataques sobre cables sin evidencia. Órbita no debe insinuar que cambiar de país de navegación elimina el riesgo.
9. **Datos propios de ZERO:** «No sé qué telemetría recoge hoy ZERO»; no anunciaría bloqueos ni detecciones sin comprobarlos.
   - **Nunca al planeta:** historiales, URL completas, consultas, IP de clientes, mensajes ni identificadores persistentes.
   - **Detalle decisivo:** al ser navegación remota, la ubicación de salida de ZERO es la del servidor, no la de la persona; no convertirla en «víctimas por país». (La capa de ZERO que proponen ChatGPT y Gemini cuenta el país del servidor de la web detenida, no el de la persona.)
   - **Para publicar:**
     - agregar en un entorno controlado;
     - suprimir grupos pequeños y combinaciones identificables;
     - reducir la precisión temporal y geográfica;
     - evaluar ataques por comparación entre filtros;
     - probar la reidentificación antes del lanzamiento.
   - El umbral no lo sabe sin estudiar volumen y distribución (ChatGPT proponía 20 eventos por celda). Quitar nombres o aplicar hashes no anonimiza, y los usuarios de ZERO no representan a toda la población.
10. **Planeta y móvil:**
    - **Planeta:** superficie por países o regiones, una variable activa, leyenda visible, periodo seleccionable y ficha lateral; sin explosiones ni arcos que atribuyan ataques. Estados separados: datos disponibles, cobertura insuficiente y fuente desactualizada. Atribución y limitaciones, a un toque.
    - **Móvil:** abrir con búsqueda, resumen y lista accesible; el globo es una vista opcional.
    - **Accesibilidad:** colores accesibles, movimiento reducido y alternativa textual; ninguna conclusión depende de una animación.
11. **Ley y riesgos:**
    - **Colombia:** Ley 1581 de 2012, Decreto 1074 de 2015 y criterios de la SIC (finalidad, autorización cuando corresponda, minimización, seguridad, derechos y transferencias internacionales). Que algo sea público no le quita su carácter personal.
    - **Riesgos:**
      - reidentificación por ubicación, hora y eventos raros;
      - falsos positivos y daño reputacional a países, operadores o empresas;
      - datos obsoletos que mantienen una acusación ya corregida;
      - incumplimientos de contrato, copyright o derechos sobre bases de datos;
      - exposición de indicadores aprovechables para el abuso.
    - Evaluación de impacto, retención limitada, canal de corrección y retirada, y trazabilidad. Órbita no debe convertirse en un directorio público de víctimas.
12. **Plan por puertas de aprobación:**
    1. validar preguntas, fuentes, muestras y derechos;
    2. prototipo con datos sintéticos claramente rotulados;
    3. una capa autorizada, con metodología y vista móvil;
    4. impacto y capacidades, sin mezclarlos;
    5. ZERO, aparte, tras la revisión técnica y de privacidad.

    - **Coste:** no lo sabe sin cotizaciones, arquitectura y alcance; inventarlo sería engañoso. Lo abaratan una actualización no instantánea, los agregados regionales y reutilizar el motor existente; lo encarecen las licencias de redistribución, varios proveedores y la telemetría propia.
    - **Diferencial defendible:** unir infraestructura física, evidencia de amenazas, incertidumbre y la orientación de NÚCLEO. No puede afirmar que sea único en el mundo.
    - **Humo:** «mapa mundial del robo de datos», «riesgo exacto por país», «ataques en tiempo real» a partir de informes anuales, «anonimato garantizado».

**Decisión recomendada:** aprobar la investigación y el prototipo, y condicionar el mapa público a los permisos, la comparabilidad y las pruebas de privacidad. «Órbita gana valor explicando qué sabemos, no coloreando como certeza lo que ignoramos.»
