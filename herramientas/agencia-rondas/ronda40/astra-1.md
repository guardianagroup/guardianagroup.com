# Ronda 40 · Astra 6 (gpt-6-astra, Playground, 4.096 tokens) · tanda 1: A, B (cortado), D (no llegó)

Pregunta: contexto + bloques A, B y D de `pregunta.txt` (versión compacta). Respuesta cortada por el límite de tokens en mitad del bloque B.

---

## Punto de partida

- ZERO puede proteger mejor el dispositivo local frente al contenido web y explicar sus decisiones con más claridad. Eso no equivale a superar el anonimato de Tor Browser ni todas las defensas de Brave.
- En semanas es viable una alfa acotada: navegación remota, aislamiento, bloqueo verificable y panel conectado a eventos reales. No un sustituto completo de los tres navegadores.
- Mensaje obligatorio: «Las webs se ejecutan lejos de tu dispositivo. GUARDIANA opera esa infraestructura y técnicamente puede acceder a lo que sucede en ella». Los píxeles no eliminan la necesidad de confiar en el proveedor.

# A) MOTOR

## 1. Transmitir la pantalla

Alfa: CDP screencast → pasarela autenticada → WebSocket → pantalla del cliente.

- Playwright controla sesiones, pestañas y navegación; CDP aporta imágenes y eventos de red. Nunca exponer CDP directamente a internet.
- Enviar únicamente el último cuadro útil; descartar cuadros antiguos si el cliente no puede seguir. Acumularlos convierte una conexión lenta en segundos de retraso.
- Capturar también ventanas emergentes y cambios de pestaña. Portapapeles, descargas y permisos pasan por controles explícitos, no por automatismos.
- Limitaciones: screencast no es un transporte audiovisual completo; no incorpora por sí solo audio. Hay que resolver además teclado internacional, composición de texto y accesibilidad.

WebRTC: siguiente transporte, no siguiente aislamiento.

- Pasar cuando vídeo, audio, desplazamiento o latencia bajo pérdida de paquetes impidan una experiencia aceptable en las pruebas de PC.
- Requiere captura del escritorio virtual, codificador y transporte WebRTC; no basta con cambiar WebSocket por otro canal.
- Ventajas: vídeo comprimido, control de congestión y mejor tratamiento de pérdidas. Costes: codificación, infraestructura multimedia y TURN.
- Separar dos WebRTC: el transporte de pantalla de ZERO puede estar permitido aunque el WebRTC de las páginas esté bloqueado.
- No afirmar ahorro sin medir coste de cómputo, codificación y tráfico por hora de uso activo.

## 2. Interceptar y cortar: dos capas

Capa navegador: decisiones por URL, contexto, almacenamiento y contenido.
Capa red de la microVM: salida obligatoria por la ruta autorizada y bloqueo de destinos prohibidos.

CDP/Playwright permiten una primera capa útil, pero no constituyen por sí solos un cortafuegos ni un sustituto completo de uBlock.

| Control | Primera implementación real | Límite que debe reconocerse |
|---|---|---|
| Peticiones | Interceptar con CDP Fetch o Playwright y un motor compatible con reglas ABP, no expresiones regulares improvisadas. | Comprobar cobertura de marcos, trabajadores, caché, redirecciones y conexiones persistentes. |
| Service workers | Deshabilitarlos inicialmente si impiden una cobertura comprobable. | Algunas webs perderán funciones; debe constar. |
| Cookies de terceros | Política de Chromium más pruebas reales de lectura y escritura. | Documentar excepciones y cookies particionadas. No llamarlo «bloqueo de todo almacenamiento». |
| Scripts | Cortar solicitudes identificadas; modo estricto por sitio para desactivar JavaScript. | Sin JavaScript muchas webs se rompen. No identificar cualquier script como espía. |
| Huella | Perfil remoto común, permisos restringidos, fuentes y configuración controladas. | Oculta características del PC local, pero no elimina la huella del navegador remoto. |
| WebRTC de las webs | Bloqueado en la alfa; restricciones del navegador más bloqueo de salidas no autorizadas. | Impide llamadas y otras funciones. Una política que limita UDP no equivale a desactivarlo completamente. |
| Referer | Eliminarlo entre sitios o reducirlo al origen, con excepciones visibles. | Puede romper flujos; retirar la cabecera no elimina los demás identificadores. |
| Parámetros de seguimiento | Reglas concretas por parámetro y contexto antes de navegar. | No borrar todos los parámetros: rompería firmas, pagos y accesos. |
| HTTPS obligatorio | Intentar HTTPS y, si falla, detenerse con explicación. Sin descenso silencioso a HTTP. | HTTPS cifra el transporte; no certifica que la web sea honrada. |
| Filtrado cosmético | CSS por sitio, mediante mecanismo controlado del navegador. | Ocultar no es impedir transmisión. Mostrarlo como categoría distinta. |
| Scriptlets | Segunda fase: conjunto pequeño, revisado y compatible con el motor elegido. | Nunca ejecutar código arbitrario descargado de una lista. |
| Avisos de cookies | Automatizaciones locales para pulsar «rechazar» en gestores expresamente soportados. | Ocultar el aviso no significa rechazar. No asegurar que el servidor respetó la elección. |

Decisión para un equipo pequeño: primero bloqueo de red y políticas de Chromium. Después cosmética, scriptlets y consentimiento. No intentar reproducir todo uBlock en semanas.

### Listas y licencias

Selección inicial comercialmente utilizable, conservando avisos y cumpliendo sus condiciones:

| Fuente | Licencia | Uso |
|---|---|---|
| EasyList / EasyPrivacy oficiales | Doble licencia GPL-3.0 / CC-BY-SA-3.0 | Publicidad y seguimiento. Elegir una vía de cumplimiento. |
| Listas propias de uBlock en uAssets | GPL-3.0; revisar excepciones y componentes importados | Incorporar solo reglas que soporte nuestro motor. Los scriptlets son código. |
| Peter Lowe | Publicada con permiso de uso comercial bajo licencia tipo BSD | Dominios de publicidad y seguimiento; archivar el texto exacto distribuido. |
| Wikidata | CC0 para sus datos estructurados | Enriquecimiento empresarial, no bloqueo. |

No incorporar automáticamente:

- DuckDuckGo Tracker Radar: sus datos usan CC-BY-NC-SA-4.0; no sirven para esta suscripción sin autorización comercial adicional. La licencia del código no cambia la del conjunto de datos.
- Disconnect: existen datos bajo CC-BY-NC-SA-4.0. Revisar por separado el archivo de seguimiento y el de entidades; no trasladar permisos de uno al otro. Fuera hasta documentar autorización comercial del archivo exacto.
- URLhaus, OpenPhish y PhishTank: no certifico aquí sus condiciones vigentes de redistribución, API y explotación comercial. Fuera del paquete inicial hasta verificar la licencia de la entrega concreta y sus términos de acceso. Gratuito, descargable y abierto no son sinónimos.

Registro obligatorio por fuente: URL, licencia archivada, versión, fecha, atribución, modificaciones y permiso para incluir resultados en informes PDF. Revisar también la licencia del motor de filtrado. No presentar todos estos recursos como «listas abiertas equivalentes».

## 3. Convertir cada corte en una explicación comprobable

Crear un registro por decisión:

- Dominio solicitado, sitio que originó la solicitud, tipo de recurso y momento.
- Acción efectiva: bloqueado, permitido, modificado u ocultado.
- Regla aplicada, lista y versión.
- Empresa atribuida, fuente y fecha; sede y propósito con evidencias separadas.
- Resultado técnico confirmado. Un intento de bloqueo fallido no cuenta como corte.

Enriquecimiento comercialmente limpio:

- Nuestra base de 100 empresas: hechos investigados independientemente, con procedencia documentada; no copiar Tracker Radar para eludir su licencia.
- Wikidata, CC0: razón social, relaciones empresariales y país de sede cuando estén documentados. La correspondencia dominio–empresa necesita su propia evidencia.
- Tracker Radar o Disconnect solo tras obtener los derechos pertinentes.
- Dominio desconocido: «Empresa no identificada». No completar por intuición.

Lenguaje del panel:

- «Solicitud bloqueada por una regla de seguimiento».
- «Dominio atribuido a X; sede documentada en Y».
- «Propósito clasificado: medición/publicidad; no demuestra qué pretendía hacer esta solicitud concreta».
- Sede empresarial ≠ ubicación del servidor ≠ destino final de los datos.
- «No observamos amenazas conocidas»; nunca «nadie te está espiando».

La supuesta subasta publicitaria solo se muestra como observada si existe evidencia específica. Ver dominios publicitarios no prueba una subasta ni sus participantes.

El PDF utiliza los mismos eventos y fuentes, sin empresas de ejemplo y sin incluir por defecto URL completas, tokens o datos personales.

## 4. Uso durante todo el mes

Una suscripción da acceso durante el mes; no exige una microVM encendida permanentemente.

- Sesión activa: recursos normales. Pestaña inactiva: congelación o descarte recuperable. Usuario ausente: suspensión o cierre con restauración.
- No decidir ausencia solo por falta de teclado: puede estar leyendo, escuchando o descargando. Combinar visibilidad del cliente, actividad y tareas en curso; avisar antes.
- Reducir cuadros cuando no cambia la imagen; detener captura cuando no hay cliente mirando.
- Pestañas abiertas y pestañas ejecutándose son cosas distintas: limitar las segundas y conservar las demás dormidas.
- Límites explícitos de sesiones simultáneas, memoria y resolución. No agotar una bolsa mensual oculta que deje a la persona sin navegador.
- Cortar sesiones huérfanas y evitar duplicarlas tras reconexiones. Reservar capacidad para horas punta.
- Persistir, si la persona lo elige, marcadores y perfil cifrado por usuario. No compartir perfiles ni instantáneas usadas entre clientes.
- «MicroVM efímera» no significa «datos siempre borrados»: separar duración de la máquina y conservación del perfil.
- Una suspensión de memoria conserva secretos. Cifrarla, limitar su vida y preferir reconstrucción desde perfil cuando sea suficiente.
- No prometer reanudación exacta: formularios, conexiones y webs pueden caducar.

Medir coste por hora activa, recursos durante ausencia, tráfico, concurrencia punta y tiempo de arranque. Las sesiones suspendidas también pueden generar costes.

## 5. Aislamiento mínimo y pruebas

Para una alfa con navegación libre:

- Una microVM por sesión, sandbox de Chromium activo y procesos sin privilegios. Nada de --no-sandbox.
- Imagen mínima, actualizada e inmutable; disco temporal; sin credenciales de infraestructura dentro.
- Red de salida separada del plano de control. Bloquear redes internas, metadatos de nube, loopback accesible por proxy y rutas equivalentes IPv6.
- Resolver DNS en infraestructura controlada; comprobar redirecciones y DNS rebinding. Impedir saltarse la salida mediante QUIC, UDP, proxy alternativo o DNS no autorizado.
- Pasarela con autorización por sesión, comprobación de origen y credenciales breves. Ningún cliente puede elegir el identificador de otra sesión para conectarse.
- Portapapeles y archivos sin acceso automático al PC. Borrado comprobado al terminar.

Pruebas antes de cualquier afirmación pública:

- IP y DNS observados por sitios de prueba; IPv4, IPv6, WebRTC, QUIC y resolución bajo Tor.
- Si cae el proxy o Tor, la navegación se detiene, no cambia a salida directa.
- Cobertura real de filtros y cookies en marcos, trabajadores, caché y redirecciones.
- Acceso cruzado entre sesiones; persistencia de cookies, discos y capturas tras destrucción.
- SSRF contra servicios internos, conexiones WebSocket secuestradas, permisos, portapapeles y descargas.
- Revisar registros y copias: que no almacenen silenciosamente navegación, contraseñas o capturas.

Publicar qué se probó, en qué versión y con qué limitaciones. No convertir una batería de pruebas en una garantía absoluta.

# B) SEGURIDAD

## Frente a Brave, DuckDuckGo y Tor

| Defensa | Posición real de ZERO |
|---|---|
| Bloqueo de rastreadores, cookies de terceros y actualización a HTTPS | Puede igualar funciones concretas con reglas, implementación y pruebas comparables. No se obtiene automáticamente por usar Chromium remoto. |
| Protección frente a hu… | (cortado por el límite de 4.096 tokens; continuación en `astra-1b.md`) |
