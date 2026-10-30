# Ronda 77 · Astra (gpt-6-astra en Cheaper Inference, playground) · 30 Oct 2026

Solo se copia el texto que va entre «ASSISTANT OUTPUT» y «Response headers», sin claves. Salida máxima: 4.096 tokens. La respuesta llegó completa.

## 1. VPN general frente a rutas exclusivas de GUARDIANA

**Recomendación:** opción 2, como sistema de rutas alternativas para GUARDIANA, no como «camuflaje indetectable». Mantener una VPN general amplía mucho el producto, la operación y el riesgo.

**Límite de este informe:** no tengo verificación en tiempo real a 30 de octubre de 2026. El corte ruso de unos 16 KB es un antecedente que me habéis dado, no una condición universal comprobada aquí. Hay que distinguir el bloqueo de los fallos propios.

| Criterio | VPN general propia | Solo GUARDIANA y puentes |
|---|---|---|
| Rusia y China | WireGuard y OpenVPN se identifican y se bloquean. VLESS/REALITY e Hysteria2 incorporan estrategias anticensura, pero tampoco garantizan el acceso. Hysteria2 depende de UDP. | Reduce la superficie y permite adaptar las rutas. HTTPS/WSS puede funcionar donde fallan otros protocolos. TURN-TLS sigue distinguiéndose de la navegación normal y se puede bloquear. |
| Coste | Más tráfico, más soporte de dispositivos y gestión del abuso. Necesita cliente nativo o integración con el sistema. | Menor alcance: solo chat, archivos y llamadas. El coste lo dominarán el vídeo y el tráfico internacional de salida. |
| Riesgo legal | Mayor exposición como servicio de VPN o proxy y como posible proveedor de telecomunicaciones. | Menor exposición, porque no hay tránsito general. Pero sigue siendo mensajería cifrada y, posiblemente, conectividad transfronteriza regulada. |
| Abuso | Terceros pueden usar nuestras IP para spam, fraude o ataques si ofrecemos salida general. | Mucho menor si los puentes solo llegan a nuestros servicios. TURN también exige controles: no debe convertirse en un proxy abierto. |
| Mantenimiento | Clientes para cada sistema operativo, actualizaciones, túneles, DNS, fugas, reputación de las IP y soporte permanente. | Varias rutas, certificados, pruebas por región, TURN y distribución segura de la configuración. Sigue siendo trabajo continuo. |
| Privacidad | La salida de la VPN ve los destinos y metadatos de otras aplicaciones; no necesariamente el contenido TLS. | El puente ve la IP, los tiempos y los volúmenes de GUARDIANA. El contenido sigue cifrado de extremo a extremo si la implementación es correcta. |

**Rusia.** Revisar con un abogado local el régimen de Roskomnadzor para VPN y proxies, y las obligaciones que pudieran corresponder como organizador de difusión de información: registro, conservación de datos y requerimientos de las autoridades. Revisar también la localización de datos personales, si aplica. No dar por hecho que un relé sin cuentas queda exento.

**China.** El MIIT regula las telecomunicaciones y las conexiones transfronterizas. Operar infraestructura o vender conectividad puede exigir autorizaciones y socios habilitados. Los usuarios pueden sufrir consecuencias administrativas según el uso y la aplicación local de la norma; no ofrecer garantías jurídicas.

**En ambos países**, ser mensajería con cifrado de extremo a extremo no da una excepción automática. Antes de contratar servidores locales, revisar también:
- las sanciones y los pagos;
- las condiciones del proveedor;
- posibles exigencias incompatibles con nuestras garantías.

## 2. Diseño técnico concreto

### Primero: diagnosticar Moscú

Los síntomas son compatibles con una restricción del transporte, pero no la prueban.
- Probar cargas cifradas sintéticas, pequeñas y grandes, por cada ruta.
- Revisar la descarga, la integridad, el descifrado, la caché, CORS y la URL de las fotos.
- En WebRTC, recoger getStats(): candidato seleccionado, transporte, bytes enviados y recibidos, y estado ICE.
- Verificar la autenticación TURN, los certificados, la IP anunciada, el NAT y el cortafuegos.
- Confirmar que el 5349 es alcanzable. Haber activado TURN-TLS no demuestra que funcione.

El certificado debe cubrir el nombre exacto del servidor TURN. «El certificado de la web» solo sirve si incluye ese nombre.

### Topología recomendada

```text
PWA → WSS/HTTPS 443 → entrada regional → relé de mensajes
PWA → TURN-TLS 443 → TURN regional → otro extremo WebRTC
```

Hay que distinguir dos funciones:
1. **Puente web.** Termina el TLS exterior y reenvía solo a nuestros servicios, por un enlace autenticado y cifrado. Ve el protocolo exterior, pero no el contenido cifrado de extremo a extremo.
2. **TURN regional.** Participa de verdad en la ruta de los medios.

Un proxy TCP hacia coturn en Alemania no hace local, por sí solo, el relé de medios: importan la dirección de relé anunciada y la conectividad entre servidores TURN. Los puentes rusos tampoco eliminan un bloqueo sobre su propia salida internacional.

Mantener iceTransportPolicy: "relay". Si los dos participantes lo usan, también tiene que funcionar el tramo entre relés.

### Compartir el 443

Preferencia: nombres distintos y un multiplexor TCP delante.
- entrada.example: HTTPS/WSS → Caddy → Node.
- llamadas.example: TURN-TLS → coturn.
- Los dos pueden compartir IP y el puerto TCP 443.

HAProxy o nginx stream con ssl_preread pueden leer el SNI y pasar el TLS sin terminarlo. Caddy con layer4 también, pero necesita un módulo adicional y mantener esa compilación. El Caddy HTTP estándar no basta.

Usar el SNI como criterio principal, sin depender del ALPN: TURN no ofrece necesariamente un identificador ALPN útil y constante. Probar con Chrome, Safari y Firefox reales.

**Alternativa inicial más sencilla:** una IP aparte y coturn directamente en el 443.

El 443 solo describe el acceso del cliente. Coturn seguirá necesitando sus puertos de relé y conectividad para los medios, por ejemplo el rango UDP configurado. TURN-TLS sobre TCP puede empeorar las llamadas cuando hay pérdida de paquetes, por el bloqueo de cabecera de línea.

QUIC en UDP 443 es una ruta opcional. Una PWA no puede convertir a voluntad WebRTC en TURN sobre QUIC.

### Huellas TLS, ALPN y ECH

TURN sobre TLS no es HTTPS. El SNI, las huellas JA3/JA4, los tamaños, los tiempos y el sondeo activo pueden delatar las diferencias.

Desde JavaScript no podemos configurar a voluntad el ClientHello del TURN del navegador. Tampoco podemos copiar su huella HTTPS ni meter HTTP dentro de TURN con una opción.

ECH puede ocultar el SNI interior cuando el cliente, el servidor y la distribución de la configuración lo admiten. Pero:
- no oculta la IP ni el patrón de tráfico;
- no hay que darlo por disponible para TURN en los navegadores que nos interesan;
- no garantiza que funcione el multiplexado por el SNI interior.

Una transformación más profunda exigiría otro transporte, posiblemente un cliente nativo y una evaluación independiente.

### Descubrimiento y selección

- Un manifiesto de rutas firmado con una clave independiente de TLS.
- Versión, caducidad, protección contra la vuelta atrás y clave de recuperación.
- Un conjunto inicial dentro de la app; actualizaciones por varias rutas.
- Entrega fuera de banda mediante QR o archivo firmado.
- Distribución parcial y rotación gradual para dificultar la enumeración.

Ningún puente público repartido a los usuarios puede mantenerse en secreto para siempre. No publicar toda la reserva en el JavaScript público.

La app debe probar la disponibilidad y una transferencia sostenida, no solo la conexión TLS. Debe llevar puntuaciones locales, tiempos de espera, retroceso exponencial e histéresis. Para cambiar de ruta una llamada: configuración ICE nueva y reinicio ICE; puede haber un corte.

La primera instalación sigue siendo un problema: si GitHub Pages está bloqueado, el código de recuperación no llega. Una PWA guardada ayuda, pero no garantiza que se conserve para siempre. Otros dominios son otros orígenes: no comparten automáticamente identidad ni almacenamiento. Hay que diseñar una migración segura para no crear por accidente otro Número GUARDIANA.

### CDN y China continental

Una CDN puede ayudar a distribuir la web y el WSS donde esté permitido. Normalmente no sirve como transporte TURN genérico. Puede terminar el TLS exterior, pero no el cifrado de extremo a extremo.

No basar el producto en el domain fronting: muchos proveedores lo impiden, es frágil y puede incumplir contratos.

Desde China, TURN-TLS 443 hacia Hong Kong o Japón puede funcionar en ciertas redes, pero hay que medirlo. No hay una respuesta universal del tipo «el GFW bloquea WebRTC»: pueden fallar el UDP, la IP, el DNS, el TLS o rutas concretas.

Alojar en Hong Kong no es alojar en China continental. Para una web pública en infraestructura continental suele exigirse el registro ICP (备案); los servicios comerciales y de telecomunicaciones pueden necesitar más licencias. El ICP no autoriza por sí solo la mensajería cifrada ni la conectividad transfronteriza.

## 3. Relé de Asia

Empezaría por **Singapur**, sin presentarlo como el mejor para China.

| Ubicación | Para quién |
|---|---|
| Singapur | Candidato equilibrado para el Sudeste Asiático y la India. |
| Hong Kong | Candidato para el sur de China; el acceso transfronterizo es variable. |
| Tokio | Candidato para Japón y Corea; probar también desde el norte de China. |
| Bangkok | Interesante para usuarios cercanos, pero no como único nodo de la región sin mediciones. |

No tengo aquí fuentes actuales de latencia por operador, así que no doy cifras. La ubicación geográfica no muestra la congestión ni los acuerdos de tránsito.

Hay que probar desde redes móviles y fijas de cada mercado:
- RTT, pérdida y variación del retardo;
- transferencia sostenida;
- establecimiento y calidad de las llamadas.

Comparar percentiles y horas punta. Añadir Hong Kong o Tokio solo si las mediciones justifican el coste.

## 4. Fases y presupuesto

Estimaciones mensuales orientativas, no presupuestos. No incluyen desarrollo, abogados, impuestos, auditorías ni tráfico intensivo de vídeo.

| Fase | Trabajo | Incremento mensual estimado |
|---|---|---:|
| Esta semana | Diagnóstico, TURN-TLS 443, validación de certificados, límites contra el abuso y uno o dos nodos de prueba | USD 40–180 |
| Semanas siguientes | Piloto regional autorizado, Singapur, manifiestos firmados y selección automática | USD 150–600 |
| Cuando se demuestre útil | Varios proveedores, un segundo nodo en Asia, vigilancia por región y capacidad de reserva | USD 400–1.500 |

El desarrollo y la operación probablemente costarán más que el alquiler inicial. Presupuestar las llamadas según los usuarios simultáneos, la tasa de bits, la duración y la salida facturable.

**Nunca haríamos:**
- Prometer acceso ante cualquier bloqueo.
- Desactivar la validación TLS o rebajar el cifrado de extremo a extremo.
- Ofrecer proxies abiertos, o TURN sin autenticación, cuotas y restricciones de destino.
- Guardar contenido o claves privadas en los puentes.
- Conseguir infraestructura saltándose requisitos legales o con identidades falsas.
- Confiarlo todo a un solo dominio, proveedor o lista fija.

## 5. Qué decir al cliente

**Sí:**

> «GUARDIANA está diseñada para mejorar la disponibilidad en redes restrictivas mediante rutas alternativas y relés regionales. La disponibilidad depende de la red, el país y los bloqueos vigentes.»

> «Los puentes transportan contenido cifrado de extremo a extremo; pueden observar metadatos de conexión.»

**No:**
- «Funciona siempre en Rusia y China».
- «Indetectable», «imposible de bloquear» o «sin metadatos».
- «Todo sale por el 443», sin explicar los tramos internos.
- «Llamadas poscuánticas»: hoy usan DTLS-SRTP y no son poscuánticas.
- «Conforme» o «certificada CNSA 2.0». Si está técnicamente acreditado, describir solo los algoritmos de la suite CNSA 2.0 que de verdad se usan.
