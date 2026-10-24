# Ronda 20 · Astra 6 (gpt-6-astra) · buscador

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> ¿Cómo hacemos un buscador privado para el navegador y para un futuro dispositivo: metabuscador o índice propio? ¿Qué APIs hay (Brave Search API, Mojeek, otras), con qué costes? ¿Cómo garantizamos la privacidad (sin registros, consultas cifradas, PIR) y la calidad de los resultados?

---

## 1. Decisión: metabuscador propio ahora; índice especializado después

Para GUARDIANA, **no construiría un índice general de internet inicialmente**. Rastrear, actualizar, combatir spam y ordenar miles de millones de páginas exige recursos muy superiores a los de una empresa pequeña.

Haría un **buscador web con backend propio**, reutilizable desde ZERO, un futuro navegador y cualquier dispositivo:

- **Brave Search API como primera candidata**, sujeta a evaluación contractual y de calidad.
- **Mojeek como alternativa independiente** y posible complemento.
- Una interfaz propia sin publicidad conductual ni perfiles.
- Más adelante, un **índice especializado en Colombia y contenidos poco cubiertos**, no una copia de Google.

No consulten varios proveedores por defecto: multiplicaría el coste y expondría cada consulta a más empresas. Usen un proveedor principal; complementen únicamente cuando aporte valor.

## 2. APIs y costes orientativos

**No puedo verificar tarifas en tiempo real.** Estas son referencias públicas históricas para presupuestar, no cotizaciones vigentes a octubre de 2026. Confirmen precios, derechos de presentación, almacenamiento y condiciones de privacidad antes de contratar.

| Opción | Coste orientativo | Evaluación |
|---|---:|---|
| **Brave Search API** | Referencias de **US$3–5/1.000 consultas**, según plan y fecha | Índice independiente; candidata principal. Revisar específicamente retención y uso de consultas. |
| **Mojeek Search API** | **Solicitar cotización vigente** | Índice propio e independiente. Probar cobertura colombiana, español y actualidad. |
| **Serper** | Referencia desde **US$1/1.000**, mediante paquetes | Resultados de Google mediante intermediario; dependencia comercial y técnica adicional. |
| **SerpApi** | Aproximadamente **US$10–15/1.000** en algunos planes pequeños históricos | Integra múltiples motores. Revisar procedencia, condiciones y retención. |
| **Tavily** | Referencia de **US$8/1.000 búsquedas básicas** por consumo; avanzadas más caras | Orientada a agentes y extracción; no sería mi primera opción para búsqueda convencional. |

**Bing Search APIs se retiró el 11 de agosto de 2025**; no lo incluyan como opción contratable equivalente. Los servicios de *grounding* para IA no sustituyen necesariamente una API de resultados para un buscador.

Con US$3–5/1.000, **100.000 búsquedas mensuales cuestan US$300–500 solo en API**; un millón, US$3.000–5.000. Añadan infraestructura, protección contra abuso, impuestos y búsquedas complementarias.

**SearXNG sirve para prototipar**, pero no concede derechos sobre los motores consultados ni garantiza disponibilidad comercial.

## 3. Privacidad: compromisos verificables, no promesas absolutas

Arquitectura inicial:

**Usuario → backend de GUARDIANA → proveedor de búsqueda.**

El proveedor recibe la consulta y la IP del servidor, **no la IP del usuario**. Pero GUARDIANA puede observar ambos durante el procesamiento, y el proveedor ve el texto buscado.

Medidas prioritarias:

1. **Sin cuentas obligatorias, identificadores persistentes, historial remoto ni analítica de terceros.**
2. No registrar consultas, IP ni cabeceras identificadoras. Revisar también **CDN, WAF, balanceadores, errores, trazas y copias de seguridad**.
3. Métricas agregadas de latencia, fallos y consumo; controles antiabuso efímeros, sin historial de búsquedas.
4. Enviar únicamente consulta, idioma y región aproximada elegida. Nunca ubicación precisa ni identificadores del navegador.
5. Resultados sin rastreadores ni redirecciones publicitarias; `Referrer-Policy: no-referrer`. Evitar recursos externos cargados automáticamente.
6. Contratos que especifiquen retención, reutilización y subencargados; evaluación de transferencias internacionales conforme al régimen colombiano de datos.

**HTTPS cifra el transporte, no oculta la consulta al proveedor.** OHTTP, con un relay independiente, puede separar identidad de consulta, pero requiere una implementación compatible y no impide inferencias por el contenido.

**PIR no es una solución inmediata para búsqueda web general:** permite recuperar elementos sin revelar cuál, pero resolver consultas libres y ranking privado a gran escala sigue siendo costoso y complejo.

Para resistencia poscuántica, adopten **TLS híbrido con ML-KEM donde exista soporte extremo a extremo**. Eso no elimina registros ni oculta consultas procesadas en claro.

## 4. Calidad y ejecución

**Primeros 90 días:**

- Evaluar Brave y Mojeek con 500–1.000 consultas públicas o sintéticas: Colombia, español, navegación, actualidad y errores ortográficos.
- Medir relevancia de los primeros resultados, frescura, diversidad, latencia y coste por búsqueda útil.
- Lanzar una beta con proveedor principal, alternativa ante fallos y auditoría de registros.
- Recoger valoraciones voluntarias sin vincularlas a identidad o historial.

Después, construir un índice local solo donde las pruebas demuestren carencias. **Radiografías puede aportar señales explicables de rastreo**, pero mantengan separadas relevancia y privacidad: una web menos rastreadora no necesariamente contiene la mejor respuesta.
