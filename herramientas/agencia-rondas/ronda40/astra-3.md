# Ronda 40 · Astra 6 · tanda 3: H, I, J

## H) Prevenir, detectar, sellar y destruir

Objetivo: reducir la superficie de ataque y limitar el daño; no fabricar un “antivirus que lo ve todo”. ZERO mantiene Chromium en una microVM y envía píxeles al cliente, pero siguen existiendo riesgos en el navegador, el aislamiento, la pasarela, las cuentas y el dispositivo del cliente.

### 1. La sesión del cliente

Prevención y detección en capas:
- Chromium actualizado, aislamiento por sesión, mínimos privilegios, red de salida restringida y acceso bloqueado a servicios internos y metadatos de nube. Sin persistencia por defecto.
- Instrumentar navegador, supervisor de microVM y pasarela: fallos compatibles con exploits, procesos inesperados, intentos de escape, conexiones anómalas, cambios de autenticación y operaciones sensibles. Son señales, no diagnóstico infalible.
- Descargas en cuarentena, análisis y, cuando proceda, desarme de documentos. No entregarlas automáticamente al dispositivo. Phishing mediante reputación y análisis contextual; inyección en agentes mediante separación entre contenido y órdenes y control de herramientas.

Respuesta gradual, aplicada desde fuera de la microVM:
1. Riesgo bajo: advertir o bloquear la petición/descarga concreta.
2. Riesgo alto: cortar salida de red y congelar la pestaña o sesión.
3. Incidente: sellar significa impedir ejecución, comunicaciones y nuevos accesos; revocar credenciales gestionadas y solicitar invalidación de sesiones externas cuando sea posible.
4. Destruir la microVM y eliminar su almacenamiento efímero y claves.

Congelar una pestaña no contiene un escape: el supervisor debe poder aislar toda la celda. El botón de pánico, independiente de la página visitada, ejecuta aislamiento inmediato y ofrece cierre destructivo.

“Borrado comprobado” debe tener alcance definido: comprobar destrucción de recursos y claves bajo nuestro control; excluir instantáneas, copias y registros que contengan contenido. El borrado criptográfico requiere cifrado y claves realmente efímeras. No demuestra eliminación física en cada soporte del proveedor ni borra datos ya enviados a terceros.

Pantalla del cliente: “Conexión bloqueada por comportamiento sospechoso”, acción tomada, elementos afectados y opciones. Conservar únicamente códigos de evento, versiones, tiempos y resultado de destrucción; sin URLs, capturas, cookies ni contenido por defecto. La forense ampliada necesita autorización y caducidad.

### 2. GUARDIANA, su web y su equipo

La web estática no ejecuta PHP propio, por lo que un ataque específico a PHP puede no afectarla; sí depende de servidores de GitHub y puede sufrir compromisos de cuenta, dependencias, DNS o despliegue.

- Web: retirar terceros innecesarios, CSP restrictiva, SRI para recursos compatibles, dependencias fijadas y compilaciones verificables. GitHub Pages no permite configurar libremente todas las cabeceras: usar alojamiento/CDN que sí lo permita. CSP mediante meta solo cubre parte; HSTS requiere cabecera HTTPS. DNSSEC protege autenticidad DNS; CAA restringe emisores de certificados: ninguno impide malware.
- Equipo e infraestructura: llaves físicas/MFA resistente al phishing, mínimos privilegios, revisión de cambios, secretos fuera del repositorio, revocación ensayada y reconstrucción desde imágenes limpias.
- Detección: alertas de identidad, despliegue y DNS; señuelos sintéticos; registros mínimos firmados y enviados fuera del sistema vigilado. La firma dificulta alteraciones posteriores, no garantiza que un emisor comprometido registre la verdad. Atestación cuando la plataforma la soporte.

El cliente puede verificar manifiestos y firmas de versiones, procedencia de compilaciones y estado de incidentes. Un verificador independiente aporta más que un sello servido por la misma web comprometida.

En semanas: endurecer web y cuentas, alertas básicas, inventario, simulacro de revocación y prototipo del botón de pánico. Aislamiento de producción, detección avanzada, atestación y borrado auditable requieren más ingeniería y revisión externa.

Frase honesta: “Reducimos exposición, vigilamos señales de ataque y podemos aislar y destruir la sesión. No podemos garantizar detectar todo espionaje ni recuperar información que ya salió”.

## I) La subasta de anuncios: detalle con límites visibles

Unidad de captura: una ficha por subasta, no por página. Separar cargas iniciales, refrescos, espacios publicitarios y subastas paralelas; registrar inicio, cierre, duración y plazo configurado cuando sea accesible.

### Captura y certeza
- Prebid.js: instrumentar antes de ejecutarse. auctionInit/auctionEnd delimitan; añadir bidRequested, bidResponse, noBid, bidTimeout y bidWon. Guardar identificadores de subasta/espacio, adaptador pujador, CPM declarado, moneda, tamaño y tiempos. bidWon refleja la selección reportada por Prebid, no necesariamente una impresión facturada.
- Google Publisher Tag: slotRenderEnded aporta datos del renderizado, como advertiserId, lineItemId o creativeId, cuando estén disponibles. No asumir un campaignId universal. Estos identificadores no revelan las pujas perdedoras ni siempre permiten nombrar al anunciante.
- Red: observar desde Chromium solicitudes/respuestas accesibles, incluidas cargas OpenRTB reconocibles. Identificar cookies, IDs, segmentos, geolocalización, cadenas TCF y otros datos efectivamente transmitidos. TCF expresa señales de consentimiento, no acredita cumplimiento. Las subastas servidor a servidor quedan fuera salvo cooperación del operador.
- Identidades: cruzar dominios e IDs con ads.txt, sellers.json y schain cuando exista. Son declaraciones públicas de autorización y cadena comercial, no prueba de quién pagó esta impresión.

Mostrar observado directamente, declarado por biblioteca, inferido o no visible, con evidencia de origen. El JavaScript de la página puede ser incompleto o manipulable.

### Qué ve el cliente
Una línea temporal y una tabla: participante visible, oferta y moneda, respuesta/timeout, seleccionado, creativo renderizado y datos enviados. No convertir automáticamente el adaptador en comprador final.

Frases obligatorias: “Estos son los participantes observados; pueden existir otros no visibles”. “Este CPM es el valor declarado en la puja, no una factura ni necesariamente el ingreso del editor”. “Seleccionado y renderizado son estados distintos; no acreditan cobro”.

### Modo observatorio y fuga
Ejecutar la subasta en una celda nueva, sin cookies previas ni cuentas del cliente; registrar eventos y bloquear creativo, píxeles y seguimiento posterior cuando puedan distinguirse. No equivale a ejecutar sin seguimiento: las propias peticiones de puja ya pueden enviar IP de salida, URL, contexto, huella del navegador, señales de consentimiento y nuevos identificadores a múltiples empresas. No usarlo por defecto en páginas privadas. No reutilizar estado; restringir destinos y advertir que bloquear parte del flujo cambia el resultado.

Comparación: Brave bloquea anuncios/rastreadores mediante Shields; DuckDuckGo bloquea numerosos rastreadores conocidos; Tor dificulta vincular origen y navegación y homogeneiza huellas, pero no bloquea universalmente anuncios. Ninguno proporciona por defecto un libro completo de subastas.

Orden: prototipo Prebid y red; después GPT y resolución de identidades; finalmente compatibilidad entre sitios y medición de cobertura. Obtener “todos los compradores y todas las ofertas” exige acuerdos con actores publicitarios.

## J) Vigilar a la IA con archivos trampa

Los señuelos complementan permisos; no los sustituyen. La pasarela controla lo que entrega y las herramientas que intermedia, no la actividad interna del proveedor.

### Diseño
- Crear documentos y marcadores sintéticos únicos por sesión y ubicación: carpetas, pestañas, portapapeles o memoria de GUARDIANA. No introducir secretos reales ni conceder acceso adicional para facilitar la trampa.
- Colocar recursos fuera del alcance autorizado de la tarea. Registrar separadamente intento denegado y entrega efectiva mediante el intermediario de archivos/herramientas.
- Usar enlaces únicos hacia un colector propio, accesibles solamente en rutas instrumentadas del agente. No llamarlos “enlaces que solo seguiría una IA”: también pueden visitarlos escáneres, previsualizadores o personas.
- Buscar marcadores en respuestas, llamadas a herramientas y tráfico visible de la celda. Correlacionar sesión, agente y autorización.

### Qué demuestra
- Registro de apertura autenticado: “La herramienta del agente recibió este archivo”; no demuestra comprensión.
- Intento bloqueado: “Intentó acceder fuera del alcance permitido”.
- Marcador en una respuesta o petición: “Este dato marcado apareció aquí”; atribuir su origen requiere descartar otras vías.
- Nada de lo anterior demuestra entrenamiento, intención maliciosa ni ausencia de otras fugas.

Falsos positivos: adjunto voluntario del usuario, contexto añadido automáticamente, indexadores, antivirus, sincronización y tareas legítimas. Mantener un registro de autorizaciones; alertar con evidencia y pedir revisión antes de acusar o destruir.

En semanas: marcadores sintéticos, auditoría de herramientas y detección exacta en respuestas. Portapapeles, múltiples agentes, transformaciones del contenido y correlación de red requieren más trabajo.

Mensaje: “Detectamos un acceso inesperado a un señuelo y bloqueamos la operación. Estamos comprobando si lo autorizaste; esto no demuestra que el proveedor haya entrenado con tus datos”.
