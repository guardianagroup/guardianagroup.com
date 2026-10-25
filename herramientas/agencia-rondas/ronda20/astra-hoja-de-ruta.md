# Ronda 20 · Astra 6 (gpt-6-astra) · hoja-de-ruta

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> Con todo lo anterior, danos una hoja de ruta de 12 meses en tres fases para un equipo de 3 a 5 personas, con lo mínimo viable de cada fase y lo que no hay que hacer todavía.

_Enviada en una petición nueva e independiente: «todo lo anterior» solo incluía el párrafo de contexto, no las respuestas previas._

---

## Decisión principal

**En 12 meses, GUARDIANA debe consolidar un servicio web de navegación aislada, no intentar construir simultáneamente otro Brave, otro Tor y otro Google.**

ZERO será el núcleo; Radiografías explicará lo que ocurre; Órbita aportará contexto. El buscador será un experimento condicionado a resultados. El navegador independiente y el dispositivo quedan fuera de este año.

Brave y Tor Browser son referencias, pero tienen objetivos distintos: **bloquear rastreo, aislar riesgos y ofrecer anonimato no son equivalentes**. ZERO introduce, además, confianza en GUARDIANA y en su proveedor de nube.

## Fase 1 — Meses 1–3: demostrar seguridad y utilidad

**Objetivo:** convertir la demostración de ZERO en una alfa privada operable.

### Mínimo viable

- **Un solo recorrido:** abrir ZERO desde la web, navegar y destruir la sesión. Usar un motor mantenido —por ejemplo, Chromium—, sin bifurcarlo.
- **Aislamiento por sesión:** entorno efímero, sandbox habilitado, separación entre usuarios y bloqueo del acceso a redes internas y metadatos de nube. No confiar únicamente en un contenedor.
- **Superficie reducida:** sin extensiones, perfiles persistentes, subida de archivos ni descargas durante la alfa.
- **Privacidad documentada:** explicar qué pueden observar GUARDIANA, la nube y las webs visitadas. No registrar contenido ni historial; minimizar y caducar registros operativos. Verificar también herramientas de analítica y soporte.
- **Radiografías básica:** dominios contactados y solicitudes a terceros observadas durante esa sesión. Distinguir observaciones de inferencias: contactar un tercero no demuestra por sí solo rastreo.
- **Órbita mínima:** ficha de dominio con DNS, ASN y proveedor identificado, indicando fuente, fecha e incertidumbre.
- Probar con **15–25 usuarios de un único segmento**, inicialmente profesionales o pequeñas organizaciones que revisan enlaces y sitios desconocidos.

**Criterio para avanzar:** sesiones estables, destrucción comprobada, pruebas de aislamiento superadas y coste por minuto conocido. Entrevistas que identifiquen un uso recurrente, no solo curiosidad.

**No hacer todavía:** lanzamiento masivo, buscador, aplicación instalable, marketing de “anonimato total” o “seguridad cuántica”.

## Fase 2 — Meses 4–6: beta pagada y operación fiable

**Objetivo:** comprobar que alguien paga y que cada cliente puede atenderse sin trabajo manual constante.

### Mínimo viable

- Cuentas, pagos, límites de tiempo, concurrencia y consumo. **Cobrar por capacidad o minutos incluidos; evitar planes ilimitados.**
- Automatizar creación, cierre y limpieza de sesiones, parches del motor, alertas y recuperación ante fallos.
- Incorporar protección contra abuso sin convertirla en vigilancia del contenido.
- Radiografías con un resumen comprensible: qué se observó, qué significa y qué no puede concluirse.
- Integrar Órbita dentro de Radiografías; no mantener tres productos separados.
- Preparar respuesta a incidentes y una **revisión externa de seguridad** antes de ampliar la beta.
- Revisar obligaciones colombianas de protección de datos, contratos con proveedores y transferencias internacionales con asesoría competente.

**Criterio para avanzar:** al menos cinco organizaciones o veinte usuarios individuales pagando, uso repetido durante ocho semanas y margen de contribución positivo después de nube y pagos. Ajustar esos umbrales al segmento elegido.

**No hacer todavía:** ampliar el equipo por expectativas, API pública, planes empresariales personalizados o navegación mediante Tor con promesas de equivalencia a Tor Browser.

## Fase 3 — Meses 7–12: consolidar y explorar una sola expansión

**Objetivo:** mejorar retención, seguridad y economía; después, probar búsqueda privada.

### Mínimo viable

- Mejorar compatibilidad y latencia en los sitios más usados. Añadir como máximo una capacidad solicitada —por ejemplo, descargas controladas— tras evaluar sus riesgos.
- Publicar arquitectura, límites de privacidad y un resumen de la revisión de seguridad.
- **Buscador experimental:** consultar un proveedor autorizado mediante intermediación del servidor, sin enviar la IP del usuario ni identificadores de cuenta. Sin historial por defecto. Explicar que el proveedor sigue recibiendo las consultas. No construir índice propio.
- **Preparación poscuántica:** inventariar criptografía y dependencias; probar TLS híbrido poscuántico donde exista soporte mantenido y verificar qué trayectos cubre. No desarrollar criptografía ni llamar “cuánticamente seguro” al producto completo.

**Criterio de cierre:** retención sostenida, costes controlados y operación sostenible. Si ZERO no cumple, posponer búsqueda.

**No hacer todavía:** navegador independiente, índice global, dispositivo propio o garantías comparables a Tor.

## Equipo y orden de recorte

Tres responsables: **plataforma/aislamiento**, **producto web**, **backend/operaciones**. Con cuatro o cinco personas, sumar calidad/seguridad y atención comercial. Contratar externamente auditoría y asesoría legal.

**Si falta capacidad:** recortar primero buscador, luego visualizaciones de Órbita y extras de Radiografías. Nunca recortar aislamiento, actualizaciones, transparencia ni control de costes.
