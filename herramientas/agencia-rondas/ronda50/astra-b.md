# Modelo: gpt-6-astra (Cheaper Inference, Playground) — ronda 50b, E–H (sin I, J, K: llegaron después). Texto entre «ASSISTANT OUTPUT» y «Response headers».

## E. Capar Tor

Hecho comprobable. Filtrar destinos en un SOCKS propio delante de Tor es una capa válida, pero no basta por sí sola. Bloquear .onion limita esos servicios; no impide acceder a contenido ilegal alojado en la web normal. .onion tampoco significa necesariamente ilegal.

La configuración debe cerrar estas vías:

- Salida directa: cortafuegos y aislamiento de red que obliguen a Chromium a usar exclusivamente el filtro. Sin conexión alternativa si falla Tor.
- DNS: enviar nombres al proxy para resolverlos por Tor; impedir DNS directo y DNS cifrado no autorizado.
- UDP/WebRTC/QUIC: bloquear UDP saliente de la celda, desactivar QUIC y restringir WebRTC. Desactivarlos en Chromium no sustituye al cortafuegos.
- Destinos especiales: impedir acceso a localhost, redes privadas, metadatos del proveedor y servicios administrativos.
- Otros protocolos y túneles: denegarlos por defecto; controlar también redirecciones, ventanas y subrecursos.

El filtro debe normalizar y validar nombres, rechazar solicitudes ambiguas y comparar direcciones onion exactas, verificadas mediante canales oficiales. Debe recibir nombres, no aceptar que una IP eluda la política. SOCKS conoce destinos, pero no las rutas URL dentro de HTTPS: hace falta además filtrado de navegación y recursos en el navegador.

Listas y condiciones:

| Servicio | Cobertura y acceso |
|---|---|
| IWF | Lista de URL con material de abuso sexual infantil identificado. Acceso mediante acuerdo y condiciones específicas; consultar elegibilidad empresarial, costes y obligaciones. No es una lista pública para redistribuir. |
| URLhaus, abuse.ch | URL relacionadas con distribución de malware; no cubre todo phishing ni contenido ilegal. Tiene mecanismos de consulta y feeds. Confirmar modalidad, límites y licencia comercial vigente; no asumir uso empresarial ilimitado gratuito. |
| PhishTank | Phishing reportado y verificado por su comunidad. API y datos sujetos a condiciones y límites; confirmar disponibilidad, credenciales y derechos para el volumen y producto previstos. |
| Google Web Risk | Servicio comercial para consultar amenazas como malware y engaño/phishing. Requiere proyecto, facturación y cumplimiento de contrato, cuotas y reglas de almacenamiento. No confundir con las condiciones de Safe Browsing. |

No existe una lista universal y exhaustiva de «mercados ilegales». Las categorías comerciales requieren revisar cobertura, jurisdicción, licencia y procedimiento de reclamación. Estas condiciones deben verificarse antes de contratar; no estoy certificando tarifas ni disponibilidad actuales.

Opinión/recomendación. Si Tor es exclusivamente para web normal, bloquearía inicialmente todo .onion: las excepciones añaden complejidad sin ser necesarias.

Texto:
> «ULTRA usa Tor para navegar por sitios públicos. Bloqueamos destinos restringidos y amenazas conocidas, pero ningún filtro detecta todo contenido ilegal o peligroso.»

## F. Webs que rechazan la red

Hecho comprobable. Ninguna arquitectura garantiza acceso a todas las páginas. El editor puede bloquear centros de datos, Tor o automatización legítima.

Salidas honestas:

- Contactar con el editor y solicitar autorización o inclusión en su lista de permitidos.
- Publicar una página del servicio con finalidad, contacto de abuso y rangos de salida. Aporta transparencia, no garantiza aceptación.
- Ofrecer apertura externa con confirmación; no transportar cookies ni credenciales.
- Una segunda salida estable puede servir para resiliencia o acuerdos autorizados, no para reintentar bloqueos cambiando de IP. Eso contradiría vuestro límite.

Opinión/recomendación. Priorizar aviso y apertura externa; gestionar acuerdos para sitios frecuentes. En ULTRA, nunca pasar silenciosamente a salida directa.

Texto:
> «Este sitio rechaza conexiones desde ZERO. No intentaremos eludir su restricción. Puedes abrirlo en tu navegador habitual: saldrás de la protección de ZERO y el sitio verá la conexión que utilice ese navegador.»

Botón: «Abrir fuera de ZERO». Abrir sin acceso a la ventana de origen y evitando enviar el referente.

## G. Celda sellada

Hecho comprobable. El código de la página remota no se ejecuta directamente en el PC: recibe imágenes y ejecuta el visor de GUARDIANA. Esto reduce exposición, pero quedan vulnerabilidades del visor, del navegador local y del decodificador de imágenes, además de las del servidor y Chromium remoto.

Un BrowserContext no es una frontera suficiente frente a una explotación de Chromium. Para defender separación entre usuarios hacen falta límites de sistema operativo —idealmente VM o microVM por celda o sesión—, sandbox y permisos mínimos.

Persisten riesgos por descargas exportadas, portapapeles, apertura externa, phishing y credenciales entregadas al sitio. Retener archivos no demuestra que sean inocuos.

Se pueden observar: intentos de salida prohibidos, procesos inesperados, escrituras fuera de rutas autorizadas, denegaciones del sandbox, resultados antimalware y aparición de señuelos en puntos instrumentados. Un fallo o un señuelo leído por la propia web no demuestra intrusión; tampoco se puede vigilar todo Internet buscando fugas.

Opinión/recomendación. Ante señales fuertes: cortar red y entradas, conservar evidencia mínima fuera de la celda, destruir su entorno y almacenamiento temporal, y avisar. Bloquear solo teclado y ratón no contiene una intrusión. El comprobante firmado acredita acciones registradas, no ausencia previa de compromiso ni borrado de datos enviados a terceros.

Seis indicadores visibles:

| Normal | Cuándo cambia y texto |
|---|---|
| «Entorno aislado activo» | Falla la comprobación: «Aislamiento no verificable: sesión detenida». |
| «Salida: Tor» / «Salida: directa» | Ruta incorrecta: «Salida inesperada: conexión bloqueada». |
| «Protección contra amenazas activa» | Feed vencido o consulta fallida: «Protección degradada». Coincidencia: «Destino bloqueado por amenaza conocida». |
| «Archivos retenidos en ZERO» | Exportación solicitada: «Este archivo saldrá de ZERO; puede contener riesgos». |
| «Sin alertas en los controles activos» | Señal relevante: «Actividad sospechosa: celda sellada». |
| «Sesión activa» | Contención/destrucción: «Celda desconectada» y después «Entorno eliminado; comprobante disponible». |

## H. Ideas nuevas — propuestas, no garantías

1. Frontera de salida: confirmación uniforme para archivos, portapapeles y enlaces externos; hace visible cuándo termina la protección.
2. Recibo de sesión: resumen firmado de ruta, bloqueos y destrucción, sin historial por defecto; aporta evidencia sin vigilancia innecesaria.
3. Modo lectura interactiva: formularios y cargas deshabilitados hasta autorización; reduce entregas accidentales de datos.
4. Identidad siempre visible: dominio real y aviso al cambiar de sitio antes de introducir datos; ayuda contra phishing.
5. Compatibilidad explicada: distinguir bloqueo del editor, fallo técnico y bloqueo de seguridad; evita mensajes confusos.
6. Botón «Cortar y empezar limpio»: desconecta y crea otra celda; devuelve control sin afirmar que revoca cuentas o recupera datos ya enviados.
