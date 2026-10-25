# Ronda 20 · Astra 6 (gpt-6-astra) · hardware

**Pregunta** (enviada a continuación del párrafo de contexto de `pregunta.txt`):

> Si GUARDIANA lanzara hardware propio (un router o cortafuegos de privacidad, una llave de seguridad o un móvil endurecido), ¿qué tiene más sentido para una empresa pequeña? Cubre el chip (ARM o RISC-V), el sistema (OpenWrt, GrapheneOS), el elemento seguro, el arranque verificado, el coste por unidad y las certificaciones (FCC, CE, CRC de Colombia).

---

## Recomendación: router primero, llave como complemento, móvil después

Para GUARDIANA, **lo más coherente es un router de privacidad basado en hardware existente**, no diseñar una placa desde cero. Encaja con Radiografías y Órbita, protege varios dispositivos y puede administrarse desde una interfaz web.

**La llave de seguridad es más sencilla de comercializar mediante un fabricante especializado**, pero aporta menos diferenciación. **Un móvil propio es demasiado costoso y dependiente del fabricante del procesador** para esta etapa.

Antes de vender hardware, consolidaría el producto web y validaría demanda mediante un piloto pagado.

## 1. Router/cortafuegos: la mejor apuesta estratégica

### Hardware y chip
Elegiría **ARM con soporte sólido en Linux/OpenWrt**, Ethernet gigabit y memoria suficiente para actualizaciones y análisis local: como referencia, 512 MB–1 GB de RAM y almacenamiento eMMC.

RISC-V es interesante, pero **una arquitectura abierta no garantiza privacidad ni un dispositivo completamente abierto**. Hoy priorizaría disponibilidad, controladores, documentación y soporte de seguridad sobre la arquitectura.

Para reducir riesgo, el primer producto podría ser una **pasarela Ethernet sin radio**, colocada entre el módem y un punto de acceso existente. Reduce complejidad de Wi-Fi y parte del trabajo regulatorio, aunque exige explicar bien la instalación.

### Sistema y funciones
**OpenWrt**, con una selección pequeña de equipos realmente soportados:

- Actualizaciones automáticas firmadas.
- DNS cifrado, bloqueo de rastreadores y segmentación de dispositivos.
- VPN opcional.
- Panel web local y administración remota voluntaria.
- Radiografías y Órbita alimentadas por metadatos, preferiblemente procesados localmente.

**Límite importante:** un router no ve todo lo que una página conoce del usuario. HTTPS y otros mecanismos de cifrado restringen su visibilidad. No prometería inspección completa ni instalaría certificados para interceptar tráfico.

Tampoco convierte todos los dispositivos en Tor Browser ni sustituye el aislamiento de ZERO.

### Elemento seguro y arranque
Un **TPM 2.0 o elemento seguro** puede proteger la identidad del dispositivo y determinadas claves. No sustituye un sistema actualizado.

Exigiría una cadena de arranque verificado desde una raíz de confianza del chip, protección contra versiones vulnerables anteriores y recuperación segura. **Instalar OpenWrt no garantiza esas propiedades**: dependen de la placa y de su integración. Conviene además permitir firmware alternativo mediante desbloqueo físico explícito.

## 2. Llave: menor desarrollo, menor diferenciación

Lanzaría una **llave OEM FIDO2/WebAuthn**, USB-C y, si existe demanda, NFC. Sin biometría inicialmente.

- **Chip:** normalmente un microcontrolador ARM Cortex-M o equivalente; ARM frente a RISC-V importa menos que la seguridad del conjunto.
- **Elemento seguro:** claves no exportables y resistencia a ataques físicos, con evaluaciones independientes pertinentes.
- **Firmware:** arranque autenticado; si admite actualizaciones, deben estar firmadas y evitar retrocesos inseguros.
- **Certificación:** verificar el alcance de la certificación FIDO del modelo exacto. Cambiar firmware o diseño puede exigir reevaluación.

Puede servir como acceso resistente al phishing a GUARDIANA y a otros servicios compatibles. **No diseñaría un protocolo criptográfico propio ni usaría “elemento seguro” como prueba suficiente de seguridad.**

## 3. Móvil endurecido: solo sobre equipos compatibles

**No fabricaría un teléfono propio.** Exploraría configurar y vender equipos que figuren en la lista oficial vigente de GrapheneOS, con garantía y soporte claramente definidos.

GrapheneOS no es una capa que pueda instalarse con las mismas garantías en cualquier móvil ARM. Depende de capacidades concretas: arranque verificado, protección de claves, aislamiento y actualizaciones del fabricante.

No elegiría RISC-V para este proyecto. Los obstáculos principales son módem, controladores, cámaras, batería, cadena de suministro y soporte prolongado.

## Coste orientativo por unidad

**USD, referencia presupuestaria, no cotización.** Para router/llave: lotes OEM de aproximadamente 500–1.000 unidades. Excluye desarrollo, certificaciones, transporte, impuestos, garantía y soporte.

| Producto | Coste aproximado |
|---|---:|
| Router/pasarela ARM | US$60–140 |
| Llave FIDO2 especializada | US$20–50 |
| Móvil compatible adquirido terminado | US$400–1.000 |

En lotes pequeños, los costes serán mayores. Reservaría presupuesto separado para ensayos y certificaciones: pueden representar **miles o decenas de miles de dólares**, según mercados y variantes.

## Certificaciones: no son intercambiables

- **FCC:** cumplimiento para Estados Unidos; requisitos según radio y emisiones.
- **CE:** conformidad para el mercado europeo; según producto, incluye RED, compatibilidad electromagnética, seguridad y otras obligaciones. No es simplemente comprar un certificado.
- **Colombia:** la homologación **CRC aplica a determinadas categorías de equipos terminales**, especialmente móviles; no debe asumirse que todo router o llave requiere el mismo trámite. Revisar también requisitos radioeléctricos de ANE y obligaciones de importación aplicables.

Un módulo previamente certificado ayuda, pero no garantiza conformidad del producto final.

**Plan:** piloto de 50–100 routers existentes; llave OEM después; móvil solo con demanda demostrada. La preparación poscuántica debe basarse en protocolos estandarizados y actualizables, no en vender un supuesto «chip cuánticamente seguro».
