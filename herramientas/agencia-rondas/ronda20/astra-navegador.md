# Ronda 20 · Astra 6 (gpt-6-astra) · navegador

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> ¿Qué base técnica elegimos para el navegador (Chromium como Brave, Gecko como Tor Browser y Mullvad Browser, o WebKit) y por qué? Da la lista priorizada de protecciones que necesitamos para igualar a Brave y a Tor Browser: bloqueo de rastreadores (motor y listas), anti-huella digital (aleatorizar o uniformar), aislamiento por sitio, solo HTTPS, DNS cifrado, cero telemetría, actualizaciones firmadas y sandbox. Para cada una, el esfuerzo estimado en personas-mes y el riesgo.

---

## Decisión: Chromium para ZERO; no prometer “un Tor propio”

**Elegiría Chromium, con modificaciones mínimas y componentes de privacidad reutilizados.** Para una empresa pequeña, ofrece compatibilidad web, aislamiento de procesos, sandbox y una ruta madura de actualizaciones. Además, encaja con ZERO como navegador remoto.

Pero hay una distinción fundamental: **una aplicación web no puede sustituir el motor ni las protecciones del navegador local**. Si todo será web, GUARDIANA puede ofrecer un navegador ejecutado en sus servidores y transmitir su interfaz; no convertir Chrome del usuario en Brave o Tor Browser.

ZERO reduce la exposición del dispositivo y de la IP doméstica ante las webs, pero **traslada confianza a GUARDIANA**, que técnicamente puede acceder a sesiones y contenido. Necesita aislamiento entre usuarios, sesiones efímeras y minimización verificable de registros.

### Por qué no las otras bases

- **Gecko:** lo elegiría si el objetivo principal fuera un navegador **instalable de anonimato**, aprovechando el trabajo de Tor Browser/Mullvad Browser. Su uniformidad anti-huella es valiosa, pero mantenerla exige seguir estrechamente ese ecosistema. Mullvad Browser, por sí solo, no incorpora la red Tor.
- **WebKit:** no ofrece una ventaja suficiente para este proyecto frente al ecosistema de Chromium ni frente al trabajo anti-huella de Gecko. Añadiría costes de integración y compatibilidad sin resolver el diferencial.

No desarrollaría un motor propio ni mantendría una bifurcación profunda.

## Protecciones: prioridad, esfuerzo y riesgo

**Estimaciones orientativas, no cotizaciones:** personas-mes de ingeniería experimentada para integrar, endurecer y probar sobre Chromium existente. Incluyen pruebas automatizadas; excluyen construir el motor, la plataforma completa de ZERO, auditorías externas y operación continua. Pueden variar aproximadamente ×2.

| Prioridad | Protección y decisión técnica | Esfuerzo | Riesgo principal |
|---|---|---:|---|
| **P0** | **Actualizaciones firmadas.** Seguir Chromium estable, automatizar compilaciones y despliegues, firmar artefactos, proteger claves y prevenir retrocesos. En ZERO se actualizan las imágenes del servidor. | **3–6** | **Crítico:** quedarse atrás en parches o comprometer la cadena de suministro. |
| **P0** | **Sandbox.** Conservar todas las barreras de Chromium; nunca usar `--no-sandbox`. En ZERO, añadir aislamiento fuerte por sesión/usuario, idealmente con máquinas virtuales ligeras. | **3–6** | **Crítico:** escape del navegador y acceso a otras sesiones. Un contenedor solo no basta como garantía. |
| **P0** | **Aislamiento por sitio.** Mantener Site Isolation y particionar cookies, almacenamiento y estado de red por sitio superior; bloquear cookies de terceros con excepciones controladas. | **2–4** | **Alto:** roturas de autenticación y filtraciones por estado compartido. Aislamiento de procesos y antirrastreo son capas distintas. |
| **P1** | **Bloqueo de rastreadores.** Integrar un motor mantenido, como `adblock-rust`, revisando licencia e interfaces. EasyList, EasyPrivacy y listas regionales; filtros cosméticos y actualizaciones verificadas. No depender únicamente de una extensión limitada por Manifest V3. | **3–6** | **Medio-alto:** sitios rotos, evasiones y mantenimiento de listas. |
| **P1** | **Anti-huella.** Para uso general, aleatorización coherente por sitio/sesión, estilo Brave. Para anonimato, uniformar versiones, fuentes, idioma, tamaños y APIs, estilo Tor/Mullvad. No mezclar estrategias sin medir resultados. | **6–12** para aleatorización; **12–24+** para uniformidad | **Muy alto:** una población pequeña o una configuración peculiar puede hacer al usuario más identificable. Estos plazos no garantizan equivalencia con Tor. |
| **P1** | **Solo HTTPS.** HTTPS-First/Only, advertencias claras y excepciones explícitas; controlar contenido mixto. | **1–2** | **Bajo-medio:** incompatibilidad con sitios antiguos y falsa sensación de anonimato. |
| **P1** | **Cero telemetría.** Auditar métricas, informes de fallos, identificadores, servicios externos y registros del servidor. No confundir ausencia de métricas con ausencia de conexiones para actualizar. | **2–4** | **Alto:** fugas indirectas en logs, dependencias o proveedores. |
| **P2** | **DNS cifrado.** DoH/DoT desde el componente que realmente resuelve, con política explícita ante fallos y proveedor configurable. | **1–3** | **Medio:** concentrar confianza en el resolvedor. En Tor, resolver dentro de Tor; no añadir DoH externo que eluda su diseño. |

## Límites y siguientes pasos

**Estas ocho medidas no igualan Tor Browser.** Falta anonimato de red, gestión de circuitos, aislamiento de identidades y resistencia evaluada frente a correlación. Tampoco basta con cambiar el logotipo de Chromium para igualar Brave.

“Preparado para la era cuántica” debe significar **heredar y verificar TLS híbrido poscuántico cuando ambos extremos lo soporten**, más agilidad criptográfica; no afirmar anonimato poscuántico integral.

**Orden empresarial:** asegurar ZERO → publicar modelo de amenazas y auditoría → evaluar navegador instalable. Buscador propio después; dispositivo propio, último. El mantenimiento de seguridad será una obligación permanente, no un proyecto que termina.
