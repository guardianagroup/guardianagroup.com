# Ronda 20 · Astra 6 (gpt-6-astra) · zero

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> ¿Qué arquitectura usamos para un navegador aislado en la nube de calidad? Compara enviar píxeles (vídeo) con reconstruir el DOM. Cubre WebRTC y latencia, coste por usuario y mes, aislamiento del contenedor (gVisor, Firecracker), cómo evitar que nosotros mismos veamos lo que navega el usuario, y cómo escalar.

---

## Recomendación

Para ZERO, usaría **Chromium remoto, transmisión de píxeles por WebRTC y una microVM por sesión**. Empezaría con una región cercana a Colombia, sesiones efímeras y concurrencia limitada. No construiría todavía un motor de navegador propio: mantener Chromium actualizado ya exige una operación de seguridad seria.

El aislamiento protege el dispositivo, pero **no equivale a anonimato ni ofrece automáticamente las garantías de Brave o Tor Browser**.

### 1. Píxeles frente a reconstrucción del DOM

| Enfoque | Ventajas | Problemas |
|---|---|---|
| **Píxeles/vídeo** | Alta compatibilidad: la web se ejecuta completa remotamente. Su JavaScript no llega al dispositivo. Frontera de seguridad más clara. | Consume ancho de banda y codificación; añade latencia. Accesibilidad, selección de texto e impresión requieren trabajo específico. |
| **DOM reconstruido** | Texto nítido, potencialmente menos tráfico y mejor integración local. | Reescribir HTML/CSS, eventos y recursos es complejo; canvas, vídeo y aplicaciones dinámicas se rompen. El contenido reconstruido sigue siendo entrada no confiable para el navegador local. |

**Elegir píxeles como base**, sin ejecutar código del sitio en el cliente. Añadir canales restringidos para accesibilidad, portapapeles y descargas, con consentimiento y validación. No prometer compatibilidad universal: DRM, videollamadas y algunas passkeys necesitan pruebas específicas.

### 2. Arquitectura y aislamiento

```text
Cliente web → autenticación y asignador → microVM de sesión
Cliente web ← vídeo WebRTC / eventos → Chromium dentro de microVM
                                      → salida controlada a internet
```

Separar el **plano de control** —cuentas, facturación, asignación— del **plano de navegación**.

- **Firecracker:** opción preferida para separar sesiones mediante virtualización KVM. Imagen mínima, un usuario por microVM, Chromium con su sandbox activado y sin volúmenes compartidos. Requiere experiencia operativa; la aceleración GPU no es su camino sencillo.
- **gVisor:** alternativa práctica para un piloto basado en contenedores. Intercepta llamadas al sistema y reduce exposición al kernel del host, pero exige comprobar compatibilidad y rendimiento. No ofrece exactamente la misma frontera que una microVM.
- **Docker solo no basta** para ejecutar contenido hostil multiusuario.

Bloquear desde la sesión el acceso a metadatos cloud, redes privadas, servicios de control y otras sesiones. Aplicar cuotas de CPU, memoria y tráfico, y controlar abuso. Mantener también actualizado el navegador del cliente: sigue decodificando datos.

### 3. WebRTC y latencia

Usar **WebRTC para vídeo** y un **DataChannel para teclado, ratón y táctil**. Priorizar entrega ordenada para teclas y clics; descartar movimientos obsoletos.

- ICE/STUN y TURN de respaldo; contar el coste adicional de los relés.
- Codificación de baja latencia, resolución y bitrate adaptativos, texto legible antes que máxima fluidez.
- Objetivo inicial: **RTT inferior a 60–80 ms** y respuesta entrada-pantalla de aproximadamente **100–150 ms**, verificadas con usuarios reales.
- Medir Colombia–Miami, Colombia–São Paulo y proveedores regionales: la geografía no garantiza buen enrutamiento.

Alojar cómputo cerca del usuario importa más que poner una CDN delante. Empezar con codificación CPU; evaluar GPU únicamente con mediciones de densidad, coste y aislamiento.

### 4. Coste por usuario y mes

Presupuestar por **hora activa**, no por cuenta registrada. Ejemplo orientativo, no cotización:

**20 horas mensuales, 2 vCPU y 2–4 GB de RAM por sesión:**

- Cómputo y codificación: **US$0,06–0,20/h → US$1,20–4**.
- Vídeo medio de 2–6 Mbps: **18–54 GB/mes**.
- Egreso a US$0,03–0,09/GB: **US$0,54–4,86**.

Con capacidad ociosa, TURN, control y almacenamiento, presupuestaría inicialmente **US$3–12 por usuario de ese perfil**, sin soporte, ingeniería, impuestos ni margen. Vídeo intensivo y sesiones permanentemente abiertas pueden multiplicarlo. Validar estos supuestos mediante pruebas antes de fijar tarifas.

### 5. ¿Cómo impedir que GUARDIANA vea la navegación?

**En una nube convencional no podemos garantizarlo:** el navegador remoto descifra HTTPS y procesa pantalla, cookies y contraseñas. WebRTC cifra el transporte, pero no oculta la sesión al operador del servidor.

Desde el inicio: nada de historiales, capturas o URLs en logs; perfiles efímeros; acceso administrativo restringido y auditado; métricas sin contenido.

Para reducir técnicamente nuestra capacidad de inspección: **VMs confidenciales, atestación remota y claves liberadas solo al código verificado**, con transporte terminado dentro del entorno protegido. Esto requiere otro diseño de infraestructura y auditoría; no se obtiene automáticamente con Firecracker. Persisten metadatos, destinos de red y riesgos del software.

### 6. Escalado priorizado

1. Cola de admisión y pool pequeño de microVMs precalentadas.
2. Autoscaling por sesiones concurrentes, CPU de codificación y egreso.
3. Destruir sesiones inactivas tras aviso; nunca reutilizar perfiles.
4. Añadir regiones según latencia y demanda.
5. Medir coste/hora, latencia p95, fallos, compatibilidad y aislamiento antes de ampliar.

**Primero aislamiento verificable y buena experiencia; después expansión y promesas avanzadas de privacidad.**
