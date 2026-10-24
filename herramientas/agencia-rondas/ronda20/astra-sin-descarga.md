# Ronda 20 · Astra 6 (gpt-6-astra) · sin-descarga

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> GUARDIANA ya no instala ningún programa en el ordenador del cliente: todo funciona desde la web, y como app instalable desde el navegador (PWA). ¿Cómo la hacemos lo mejor posible así?
> - Di qué protecciones reales se pueden dar sin instalar ningún programa: navegador aislado en la nube; DNS cifrado con perfiles de configuración (DoH o DoT, perfiles de iPhone, Android y Windows); VPN WireGuard con perfiles o con la app oficial de WireGuard; extensiones de navegador; alias de correo; avisos de filtraciones; análisis de enlaces y archivos en la nube; Radiografías de webs.
> - Di qué límites pone el navegador, es decir, qué no se puede hacer desde la web.
> - Di qué ofrecer gratis y qué en la suscripción.
> - Di qué NO debemos prometer.

---

## 1. Posicionamiento: protección web, no sustituto del navegador

GUARDIANA puede ser muy útil sin instalar software propio: **un centro de privacidad web, con ZERO para abrir sitios en un navegador remoto aislado**. La PWA facilita el acceso, pero **no obtiene privilegios adicionales por estar instalada**.

Distingan claramente:
- **Sin instalar nada:** ZERO, Radiografías, Órbita, alias, alertas y análisis.
- **Con configuración del dispositivo:** DNS cifrado.
- **Con componentes adicionales opcionales:** WireGuard y extensiones. No son protección «solo desde la web».

## 2. Protecciones reales, por prioridad

### P0 — ZERO: aislamiento remoto bien hecho
El sitio se ejecuta en infraestructura de GUARDIANA; el cliente recibe su representación y envía sus interacciones. Para mayor aislamiento, prioricen transmisión visual sobre ejecución de código del sitio en el navegador local.

Imprescindible:
- Entornos desechables por sesión, separación entre clientes, actualizaciones rápidas y aislamiento reforzado del servidor.
- Sin acceso a redes internas ni servicios administrativos.
- Descargas, cargas, portapapeles, cámara y micrófono bloqueados por defecto o sujetos a autorización explícita.
- Análisis de descargas antes de entregarlas; descargarlas y abrirlas localmente vuelve a introducir riesgo.
- Sesiones persistentes solo como opción, cifradas y con borrado sencillo.

**Protege frente a muchos ataques ejecutados por páginas y oculta a esas páginas la IP doméstica.** No evita que identifiquen al usuario por su cuenta, sus acciones o datos que entregue. Además, GUARDIANA pasa a ser un intermediario de confianza: técnicamente podría acceder a contenido y sesiones.

Mientras sea una demostración, indíquenlo y desaconsejen operaciones sensibles hasta validar su seguridad.

### P0 — Radiografías y análisis
- Mostrar dominios contactados, terceros, cookies, tecnologías y posibles rastreadores.
- Separar **observaciones comprobadas** de inferencias.
- Indicar fecha, ubicación y condiciones del análisis: una web cambia según sesión, consentimiento y país.
- Analizar enlaces y archivos en entornos aislados, con límites y borrado automático.
- No visitar automáticamente enlaces privados ni compartir archivos con servicios externos sin consentimiento: pueden contener secretos o activar acciones.

Órbita debe explicar relaciones de infraestructura, **no presentar compartir proveedor o IP como prueba de conducta maliciosa**.

### P1 — DNS cifrado
Ofrecer un resolvedor DoH/DoT, sin registro persistente de consultas por defecto, y filtrado opcional de dominios maliciosos.

Configuración:
- **iPhone/iPad:** perfiles de DNS cifrado compatibles.
- **Android:** DNS privado mediante DoT en versiones compatibles; DoH depende del navegador o implementación.
- **Windows:** DoH nativo en versiones compatibles, especialmente Windows 11; no prometer un perfil universal para todas las versiones.

El DNS cifra consultas hasta el resolvedor, **no todo el tráfico**, y el resolvedor puede verlas. Aplicaciones, navegadores o VPN pueden usar otro DNS. No bloquea todos los anuncios ni impide identificar conexiones por otros medios.

### P1 — WireGuard opcional
Entregar perfiles para clientes compatibles o para la app oficial de WireGuard. Una configuración por sí sola no crea una VPN si el sistema carece de cliente.

La VPN protege el trayecto hasta GUARDIANA y cambia la IP de salida; **traslada confianza al operador**, no proporciona anonimato total. La PWA no puede crear un túnel VPN del dispositivo.

### P1 — Identidad y avisos
- Alias de correo revocables, por servicio, con reenvío y controles contra abuso. El proveedor de alias puede procesar el correo reenviado.
- Alertas de filtraciones con direcciones verificadas, fuentes legítimas y mínima retención.
- Nunca pedir contraseñas en claro ni afirmar que una búsqueda cubre todas las filtraciones.

### P2 — Extensión opcional
Puede advertir sobre enlaces y bloquear solicitudes dentro de los permisos y límites del navegador. **Requiere instalación**, no protege otras aplicaciones y no equivale a Brave o Tor Browser.

## 3. Límites de la web/PWA

No puede administrar todo el tráfico, imponer DNS o VPN globales, inspeccionar otras aplicaciones, eliminar malware del equipo, modificar profundamente el motor del navegador ni garantizar protección contra huellas digitales. Tampoco convierte ZERO en Tor.

## 4. Gratis y suscripción

**Gratis:** Radiografías y Órbita básicas, pocos alias, alertas básicas, análisis limitado y prueba acotada de ZERO. DNS básico si sus costes lo permiten.

**Suscripción:** más tiempo y capacidad de ZERO, alias y análisis ampliados, historial opcional, controles DNS, VPN y funciones familiares o empresariales.

Mantengan **la misma seguridad fundamental** en ambos planes; cobren por capacidad y funciones, no por dejar al usuario gratuito desprotegido.

## 5. Qué NO prometer

Nada de «anonimato absoluto», «cero rastreo», «archivos seguros al 100 %», «no vemos nada» o «sin registros» sin respaldo técnico y operativo.

Tampoco «a prueba de computación cuántica»: adopten criptografía poscuántica estandarizada donde exista soporte verificable; WireGuard no la aporta automáticamente.

**Prioridad empresarial:** consolidar y auditar ZERO antes de desarrollar un navegador, buscador o dispositivo propios.
