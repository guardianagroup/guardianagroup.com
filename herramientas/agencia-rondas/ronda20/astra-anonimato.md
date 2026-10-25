# Ronda 20 · Astra 6 (gpt-6-astra) · anonimato

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> ¿Cómo integramos un enrutamiento tipo Tor (Arti en Rust, puentes, servicios onion) o una red propia de nodos? ¿Qué es realista para una empresa pequeña y qué riesgos técnicos y legales hay, también en Colombia?

---

## Recomendación: Tor como opción de ZERO, no una red propia

Para una empresa pequeña, lo realista es **integrar la red Tor existente en el navegador remoto de ZERO**, con acceso onion opcional. No intentaría lanzar simultáneamente navegador nativo, buscador, red anónima y dispositivo.

La promesa inicial debe ser precisa: **“la web de destino no recibe tu IP residencial”**, no “GUARDIANA no puede saber quién eres”. En ZERO, GUARDIANA recibe la conexión del usuario y ejecuta el navegador: técnicamente puede correlacionar sesiones y observar contenido.

### 1. Arquitectura viable desde la web

```text
Navegador del usuario → HTTPS → sesión aislada de ZERO
                                  ↓
                             cliente Arti
                                  ↓
                         red Tor → web / onion
```

**Arti se ejecutaría en los servidores de GUARDIANA**, no dentro del JavaScript de la página. Una web común no dispone de los sockets, controles de tráfico y aislamiento necesarios para convertirse en un Tor Browser completo.

Implementación prioritaria:

- Un navegador desechable por sesión, preferiblemente con aislamiento fuerte mediante microVM o contenedores endurecidos.
- Arti como cliente y proxy local privado. Comprobar en la versión elegida soporte efectivo para onion, puentes, transportes y aislamiento; no asumir paridad total con el cliente Tor tradicional.
- Forzar mediante reglas de red que **todo el tráfico del navegador pase por Tor**. Si falla, cerrar la conexión: nunca salir directamente.
- Resolver nombres a través de Tor; bloquear rutas alternativas, QUIC/UDP y WebRTC directo. Tor transporta TCP, no cualquier protocolo.
- Separar almacenamiento, cookies, credenciales del proxy y circuitos entre sesiones según las capacidades verificadas del cliente. Esto no elimina la correlación temporal.
- Aislar descargas, aplicar cuotas y evitar que páginas accedan a redes internas, metadatos de nube o servicios administrativos.

**HTTPS sigue siendo obligatorio**: un nodo de salida puede observar y modificar HTTP sin cifrar.

### 2. Puentes y servicios onion

**Puentes:** ayudan cuando el acceso a Tor está bloqueado; no hacen automáticamente más anónimo al usuario. En esta arquitectura, quien conecta al puente es el servidor de ZERO, no el visitante. Si bloquean GUARDIANA, añadir puentes al servidor no resuelve ese bloqueo.

Los transportes anticensura pueden requerir procesos auxiliares y compatibilidad específica. Conviene apoyarse en mecanismos existentes, no inventar uno.

**Onion v3:** permitir que ZERO visite servicios onion evita nodos de salida para esas conexiones. Publicar también una dirección onion de GUARDIANA permite entrar desde Tor Browser sin salida hacia internet pública.

Pero una “pasarela onion” accesible por HTTPS normal **no equivale a usar Tor Browser**: GUARDIANA sigue siendo intermediaria de confianza.

### 3. ¿Red propia de nodos?

**No como producto de anonimato inicial.** Si GUARDIANA controla entrada y salida, puede correlacionarlas. Distribuir servidores entre países o proveedores no crea operadores independientes.

Una red pequeña también facilita análisis de tráfico y exige selección segura de rutas, directorio, defensa contra nodos maliciosos, actualizaciones y gestión de abusos.

Sí sería razonable:

- Operar un relay sin salida o un puente para contribuir a Tor.
- Ofrecer proxies propios para ubicación o rendimiento, **etiquetados como proxies, no como anonimato equivalente a Tor**.
- Posponer nodos de salida propios: concentran quejas, bloqueos y requerimientos.

### 4. Límites técnicos y promesas

ZERO combina dos riesgos: ataques al navegador remoto y confianza en GUARDIANA. Requiere actualizaciones rápidas, pruebas de fugas, auditoría externa y mínima retención de registros.

Un Chromium remoto con Tor **no es Tor Browser**: faltan sus defensas coordinadas contra huella digital y otras filtraciones. Iniciar sesión en cuentas personales también revela identidad.

**“Preparado para la era cuántica” no debe significar “anónimo poscuántico”.** El TLS híbrido de algunos tramos no protege automáticamente todos los circuitos de Tor ni evita correlación. Prioricen inventario criptográfico, capacidad de actualizar algoritmos y seguimiento de estándares.

### 5. Riesgos legales, también en Colombia

Requieren revisión jurídica antes del lanzamiento:

- **Ley 1581 de 2012 y reglamentación:** IP, cuentas y navegación pueden ser datos personales; definir finalidades, autorizaciones cuando correspondan, seguridad, retención y derechos. Revisar transferencias y transmisiones internacionales con proveedores.
- **Ley 1273 de 2009:** prevenir accesos abusivos; limitar Radiografías y Órbita a observación o pruebas autorizadas.
- Evaluar obligaciones aplicables sobre contenidos ilegales, especialmente explotación sexual infantil, y atención de requerimientos válidos.
- Revisar contratos de nube: algunos restringen Tor, proxies o salidas.

Operar Tor no equivale por sí mismo a delinquir, pero puede generar investigaciones y solicitudes de información.

**Orden recomendado:** modelo de amenazas → piloto ZERO/Tor → pruebas de fugas y auditoría → revisión legal → onion y puentes. Posponer navegador nativo, dispositivo y red propia.
