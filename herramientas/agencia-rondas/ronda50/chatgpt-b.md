# ChatGPT (esfuerzo «Alta», chat «Cambiar arquitectura ZERO») — ronda 50b, E–I. Pensó 1 min 10 s. Copia del texto de la página (las fichas de fuente aparecen como «Nombre +1»). La pregunta J y K (Google, redes e IAs) no le llegó en esta tanda.

Ronda 50b · ZERO: seguridad, acceso y buscador propio — 26 de octubre de 2026 · Análisis técnico y decisión de producto

## E. Tor limitado a la web convencional

Hecho comprobable: Tor no es sinónimo de dark web. Permite visitar sitios normales .com, .es, etcétera; los servicios .onion son una capacidad adicional. [About Tor — Tor]

Mi recomendación: sí, establecer una lista blanca de .onion en un proxy SOCKS5 propio delante de Tor, pero nunca confiar exclusivamente en ese filtro.

Arquitectura propuesta:
- Validar todos los destinos en el proxy, incluidas redirecciones y subrecursos. Permitir únicamente direcciones .onion exactas, verificadas por el operador.
- Aplicar un cortafuegos de salida: Chromium solo puede alcanzar el proxy autorizado; el proxy, Tor. Impedir acceso a redes privadas, loopback, metadatos de nube y destinos internos no autorizados.
- Resolver DNS por Tor; activar SafeSocks 1, comprobar TestSocks 1, impedir resolución local, WebRTC/UDP y QUIC directos. No permitir conexiones fuera del túnel. [Tor — Tor +1]
- Aislar sesiones y circuitos entre usuarios; aplicar controles también a webs convencionales.

Importante: bloquear .onion no impide visitar contenido delictivo alojado en la web convencional. Tampoco convierte todo .onion en ilegal.

Fuentes legítimas de protección:

| Fuente | Cobertura y condiciones |
|---|---|
| IWF | URLs de abuso sexual infantil verificadas. Acceso bajo licencia para miembros. Actualmente exige organización registrada con más de 12 meses de actividad y más de dos empleados a tiempo completo no vinculados, entre otros requisitos. [iwf.org.uk +1] |
| URLhaus | Distribución de malware. API comunitaria con clave y uso razonable; explotación comercial puede requerir suscripción. [Community API] |
| PhishTank | Phishing verificado. Datos gratuitos también para uso comercial, sujetos a límites de consultas. [PhishTank +1] |
| Google Web Risk | Malware y engaños web. Uso comercial; primeras 100.000 consultas mensuales gratuitas en Lookup y después 0,50 USD por mil, según tarifa publicada. [Google Cloud] |

Google Safe Browsing gratuito no sustituye comercialmente a Web Risk. [Google for Developers]

No he identificado una lista global exhaustiva y jurídicamente autorizada de «mercados ilegales». Mantendría un procedimiento de denuncia, verificación, apelación y bloqueo de destinos concretos, evitando clasificar como ilegal un sitio solo por su temática.

Texto exacto recomendado:
> ULTRA utiliza Tor para acceder a la web convencional. El acceso a servicios .onion está restringido a destinos autorizados. Bloqueamos amenazas conocidas y determinados destinos prohibidos, pero no podemos garantizar que todo el contenido accesible sea seguro o legal.

## F. Webs que rechazan la celda

Hecho comprobable: la web de destino decide si acepta la conexión. Cambiar de proveedor o utilizar Tor no garantiza acceso.

Orden que recomiendo:
1. Mostrar una explicación clara y ofrecer abrir la página en el navegador habitual.
2. Contactar al editor y solicitar acceso autorizado para navegación remota interactiva.
3. Publicar identidad del nodo, dirección de abuso, límites operativos y procedimiento de reclamación.
4. Probar una salida fija de otro proveedor únicamente por disponibilidad y redundancia, no para evadir restricciones.

Texto exacto:
> Esta página no admite conexiones desde nuestro navegador remoto. Puedes abrirla en tu navegador habitual. En ese caso, la página se ejecutará en tu dispositivo y no estará protegida por la celda aislada de ZERO.

Conclusión: sin instalar componentes locales ni contar con la autorización del sitio, no existe una solución universal y honesta que permita abrir todas las webs dentro de la celda.

## G. Celda sellada: seguridad demostrable

Hecho comprobable: si únicamente llegan imágenes y ZERO no ejecuta código remoto de la página en el dispositivo, se reduce considerablemente la exposición del equipo a ataques del sitio visitado. Es el principio utilizado en sistemas comerciales de aislamiento remoto. [Cloudflare One docs]

Pero un contexto Playwright no equivale a una máquina virtual de seguridad: principalmente separa cookies, almacenamiento y sesiones. [Playwright]

Recomendación: ejecutar cada celda en un contenedor fuertemente restringido o microVM, sin privilegios, con límites de recursos, sistema de archivos efímero y cortafuegos. Mantener el supervisor de seguridad fuera de ella.

Persisten riesgos de vulnerabilidades de Chromium, escape al servidor, phishing, descargas liberadas, enlaces externos, portapapeles e incidentes en la propia interfaz de GUARDIANA.

Siete indicadores visibles (textos propuestos para la interfaz; los cambios de estado solo se muestran cuando exista la correspondiente evidencia técnica):

| Estado normal | Alerta y condición |
|---|---|
| «Página ejecutándose en la celda» | «Posible fallo de aislamiento»: el supervisor detecta una infracción grave |
| «Conexiones dentro de la ruta autorizada» | «Salida no autorizada bloqueada»: el cortafuegos detecta un intento directo |
| «Sin amenazas conocidas detectadas» | «Destino peligroso bloqueado»: coincidencia confirmada con lista |
| «Descargas retenidas» | «Archivo sospechoso en cuarentena»: detección del analizador |
| «Señuelos sin activaciones detectadas» | «Señuelo activado»: acceso o aparición del identificador exclusivo |
| «Sin accesos prohibidos detectados» | «Acceso restringido bloqueado»: intento registrado por el supervisor |
| «Celda activa» | «Celda sellada» o «Celda destruida»: acción confirmada por el servidor |

Una activación de señuelo no demuestra necesariamente exfiltración: puede indicar lectura, coincidencia accidental o acceso de un escáner.

Automatización defendible: bloquear peticiones peligrosas de alta confianza; sellar ante señales graves; destruir automáticamente cuando el aislamiento o el control de salida haya fallado, conservando primero evidencias mínimas en un supervisor independiente. Las alertas débiles requieren correlación.

El comprobante firmado debe acreditar acciones registradas, no eliminación absoluta: también hay que gestionar copias, registros y retención.

## H. Siete ideas nuevas para ZERO

1. Semáforo de riesgo: explica antes de abrir una página las amenazas conocidas y las limitaciones de protección.
2. Aduana de descargas: conserva archivos, analiza tipos y firmas, y exige autorización para exportarlos.
3. Radar de huellas: muestra qué APIs potencialmente identificadoras utiliza una página, sin afirmar automáticamente que identificó a la persona.
4. Viaje de una conexión: explica visualmente cada destino, responsable conocido y clasificación.
5. Reiniciar identidad de sesión: crea un perfil limpio y elimina el anterior sin prometer anonimato absoluto.
6. Pasaporte verificable: comprobante firmado de bloqueos, incidentes y destrucción, con sus límites probatorios.
7. Permisos temporales: permite cámara, archivos o portapapeles únicamente mediante autorización explícita y limitada.

## I. ¿Crear un buscador propio?

Sí es realista construir un buscador GUARDIANA; no es realista igualar Google rápidamente con un índice mundial independiente.

| Camino | Plazo estimado por mí | Coste y calidad |
|---|---|---|
| Brave/Mojeek API | 1–2 semanas | Brave: 5 USD/1.000 búsquedas; Mojeek: desde 2 GBP/1.000. Calidad de índice profesional; ranking propio sujeto a licencia. [Brave +1] |
| SearXNG | 1–2 semanas | Software AGPL gratuito; servidor adicional. Calidad dependiente de proveedores; pueden bloquearlo o exigir CAPTCHA. [GitHub +1] |
| YaCy | 2–6 semanas para prototipo | GPL, índice propio o distribuido. Cobertura y ranking muy variables. [GitHub] |
| Marginalia / Stract / Mwmbl | 1–3 meses para prototipo adaptado | Proyectos abiertos de búsqueda independiente; calidad especializada o cobertura limitada frente a Google. Infraestructura variable. [Marginalia Search Engine Software Documentation +2] |
| Common Crawl + índice propio | Varios meses para índice acotado | Archivos gratuitos; procesamiento, almacenamiento y actualización no gratuitos. Un rastreo mensual supera los 2.000 millones de páginas. [commoncrawl.org] |

Estos plazos son estimaciones de desarrollo, no cifras publicadas por los proveedores. No hay presupuestos verificables de operación para un índice GUARDIANA sin definir cobertura, tamaño y consultas.

Además, hay diferencias jurídicas: YaCy utiliza GPL; SearXNG, Stract y Mwmbl usan AGPL. Deben respetarse sus obligaciones y las licencias del contenido indexado.

Los términos de Brave permiten usar resultados dentro de aplicaciones cliente, pero restringen almacenamiento persistente, derivados y redistribución. El ranking propio y una interfaz comercial de búsqueda sustitutiva merecen autorización escrita antes del lanzamiento. [API]

Mi elección: construiría GUARDIANA Buscar en dos etapas: primero una interfaz propia con Mojeek o Brave bajo licencia comercial adecuada; después, un pequeño índice independiente especializado en privacidad, empresas, rastreadores y seguridad. Así el usuario obtiene resultados sin CAPTCHA de búsqueda y GUARDIANA desarrolla tecnología propia gradualmente.

Límite definitivo: eliminar el CAPTCHA del buscador no elimina las verificaciones de las webs visitadas.

Prioridad global: aislamiento real por celda, cortafuegos obligatorio, protección comercial legítima y búsqueda mediante API autorizada. Es una propuesta diferenciadora, realizable y mucho más defendible que prometer acceso universal o seguridad absoluta.
