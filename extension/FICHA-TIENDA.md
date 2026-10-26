# Ficha de GUARDIANA ZERO para Chrome Web Store / Edge Add-ons (v0.1.0)

**Nombre:** GUARDIANA ZERO
**Resumen (≤132 caracteres):** Ve quién se conecta desde cada web (empresas y países) y decide tú qué cortar. Todo en tu equipo; nada sale.
**Categoría:** Privacidad y seguridad · **Idioma:** español (inglés en la descripción)

## Descripción (ES)
ZERO te enseña, mientras navegas con normalidad, lo que cada web hace por detrás: con qué empresas se conecta, de qué país son y para qué (publicidad, rastreo, huella digital, subastas de anuncios). No corta nada por su cuenta: tú decides.

- **Observar** (por defecto): la web se abre tal cual; ZERO lo detecta todo y te lo enseña en un panel al lado de la página.
- **Permitir o cortar por empresa**: un botón por cada empresa que aparece.
- **Normal**: corta la publicidad y el rastreo de las listas públicas (EasyList, EasyPrivacy, uBlock Origin). **Estricto**: corta toda conexión con otras empresas salvo las que tú permitas.
- **Sensores honestos**: te avisa si la web consulta la huella digital de tu equipo, pide permisos, intenta abrir conexiones directas (WebRTC), subasta tu atención o usa formularios sin cifrar. Solo observan; no leen lo que escribes.
- **Nada sale de tu equipo**: sin cuentas, sin telemetría, sin enviar tu historial a nadie. Lo que ZERO ve se queda en tu navegador y desaparece al cerrar la pestaña.
- No modifica los resultados de los buscadores, no inserta anuncios ni cambia tu buscador.

Las listas de filtros son EasyList, EasyPrivacy y las de uBlock Origin; la atribución de empresas y países usa la base de GUARDIANA y Wikidata. Fuentes y licencias: guardianagroup.com/terminos.html.

## Description (EN)
ZERO shows you, while you browse as usual, what each website does behind the scenes: which companies it connects to, from which countries and for what (advertising, tracking, fingerprinting, ad auctions). It cuts nothing on its own: you decide.
- **Observe** (default): the site opens as it is; ZERO detects everything and shows it in a panel next to the page.
- **Allow or cut per company**, one button each. **Normal**: cuts advertising and tracking from public lists (EasyList, EasyPrivacy, uBlock Origin). **Strict**: cuts every connection to other companies except those you allow.
- **Honest sensors**: warns you when the site queries your device fingerprint, asks for permissions, tries direct connections (WebRTC), auctions your attention or uses unencrypted forms. They only observe.
- **Nothing leaves your device**: no accounts, no telemetry, no history sent anywhere. It does not modify search results, insert ads or change your search engine.

## Formulario de privacidad de la tienda
- **Finalidad única (single purpose):** mostrar a la persona las conexiones y comportamientos de rastreo de las webs que visita y permitirle cortarlos.
- **Justificación de permisos:**
  - `webRequest`: observar (solo lectura) cada conexión de la pestaña para clasificarla y mostrarla. No modifica peticiones.
  - `declarativeNetRequest`: aplicar los cortes que elige la persona (por empresa o por nivel) con reglas que ejecuta el navegador.
  - `host_permissions <all_urls>`: la observación debe funcionar en cualquier web que abra la persona.
  - `scripting` / content scripts en `document_start`: los sensores (huella digital, permisos, WebRTC, subasta) deben cargar antes que los scripts de la página para poder detectarlos. No alteran la página.
  - `sidePanel`: la interfaz de ZERO. `tabs` y `webNavigation`: asociar lo observado a la pestaña activa. `storage`: recordar el nivel y las empresas permitidas/cortadas en local.
- **Código remoto:** no.
- **Uso de datos:** no se recogen ni transmiten datos de usuario. Los datos de navegación se procesan en memoria en el dispositivo y no se envían a ningún servidor. Marcar: no se vende, no se usa para fines ajenos a la finalidad, no se usa para solvencia ni préstamos.
- **Política de privacidad:** https://guardianagroup.com/orbita/zero/privacidad-extension.html
- **Web:** https://guardianagroup.com/orbita/zero/ · **Soporte:** formulario de contacto de guardianagroup.com

## Capturas (1280×800)
`ficha-1.png` (Observar: empresas y países), `ficha-2.png` (En vivo: sensores), `ficha-3.png` (Normal: cortes). Hechas con la web de pruebas «El Diario de Pruebas»; conviene sustituirlas por capturas de webs reales desde el Chrome del dueño.

## Icono de la tienda
`iconos/128.png` (anillo acero sobre fondo #06080C). Imagen promocional pequeña 440×280: pendiente.
