# Ronda 89 · 1 nov 2026 · lo que comprobó Claude (Fable 5.1)

Gemini queda pendiente: el equipo del dueño no estaba enlazado esta noche, así que su parte se le pedirá con `pregunta.md`
cuando lo esté. Lo de abajo son hechos con su fuente, leída hoy; lo que no se pudo leer se marca como pendiente.

## Radiografía local (subastas, rastreadores, telemetría)

- **Prebid.js enseña las pujas desde la propia página.** `pbjs.getBidResponses()` devuelve, por cada bloque de anuncio,
  cada puja con `bidder`, `cpm` («el precio exacto del pujador»), `currency`, `netRevenue`, `timeToRespond`, `mediaType`,
  `dealId` y `meta` (dominios del anunciante, anunciante, agencia, marca, red, fuente de demanda, categorías). Es un
  método público del objeto `pbjs`, legible por un guion de la página; también hay `getAllWinningBids()`.
  Fuente: <https://docs.prebid.org/dev-docs/publisher-api-reference/getBidResponses.html>,
  <https://docs.prebid.org/dev-docs/publisher-api-reference/getAllWinningBids.html>. Esto es «ver más datos de precios
  en las subastas» de verdad, sin tocar nada: la página ya lo tiene en memoria. Solo en webs que usen Prebid (muchas de
  prensa lo usan; cuáles exactamente, se mide, no se afirma).
- **Listas de rastreadores: dos de las más conocidas no sirven para GUARDIANA.** Tracker Radar de DuckDuckGo es
  CC BY-NC-SA 4.0 (<https://raw.githubusercontent.com/duckduckgo/tracker-radar/master/LICENSE>) y la base de Ghostery
  (TrackerDB / WhoTracks.me) también es CC BY-NC-SA 4.0 y pide contrato para uso comercial
  (<https://github.com/ghostery/trackerdb>). GUARDIANA se cobra: ninguna de las dos entra. Sí entra **EasyPrivacy**
  (GPL-3.0 o CC BY-SA 3.0, ya en `docs/LISTS.md` del programa, con la misma licencia que GUARDIANA, GPL-3.0). La lista de
  **Disconnect** se dice GPL-3.0 en su repositorio: pendiente de leer su archivo de licencia antes de usarla.
- **Dónde se hace la radiografía.** Hoy, en servidores (Playwright + Chromium) y una web ve un centro de datos. En el PC
  del cliente, con su navegador y su conexión, no hay nada que esconder: es una persona. Lo que el programa puede leer
  por el protocolo de depuración de Chromium (CDP), sin cambiar lo que la web ve: cada petición de red con su dominio,
  tamaño, cabeceras y cuerpo cuando la página lo manda (`Network.*`); cookies y almacenamiento por origen; y, con un
  guion de solo lectura en la página, `pbjs`, `googletag` y `__tcfapi` (consentimiento TCF v2). Las llamadas de huella
  (canvas, audio, fuentes) solo se pueden contar envolviendo funciones del navegador, y eso sí cambia la página: se deja
  para después y se dirá «no medido» mientras tanto.
- **Lo que se promete y lo que no.** Se enseña lo que la página hizo en este equipo, con cada dato y su fuente; nunca se
  manda fuera del PC si el cliente no lo pide; no se resuelven captchas ni se disimula nada; donde una web cierre la
  puerta, se dice.

## «IA en tu PC»

- **Quién usa micrófono, cámara y pantalla, con fecha, lo dice Windows.** En el registro,
  `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\<capacidad>\NonPackaged\<programa>` y
  lo mismo bajo cada usuario (`HKEY_USERS\<SID>\...`), con los valores `LastUsedTimeStart` y `LastUsedTimeStop`
  (FILETIME); el programa va en el nombre de la clave con `#` en vez de `\`. Las aplicaciones de la Tienda van en la misma
  rama sin `NonPackaged`. Fuente: artefacto de Velociraptor
  <https://docs.velociraptor.app/exchange/artifacts/pages/windows.registry.capabilityaccessmanager>. GUARDIANA ya lee
  el registro desde `vigilancia.ps1` (solo lectura): esta rama se añade igual.
- **Recall.** Está apagado y quitado por defecto en equipos administrados; guardar capturas requiere consentimiento del
  usuario; se puede quitar del todo con `Disable-WindowsOptionalFeature -Online -FeatureName "Recall" -Remove`; las
  políticas son `WindowsAI/AllowRecallEnablement` y `WindowsAI/DisableAIDataAnalysis`; las capturas se guardan
  encriptadas en el propio equipo; necesita 50 GB libres para activarse y para de guardar con menos de 25 GB.
  Fuente: <https://learn.microsoft.com/en-us/windows/client-management/manage-recall>. GUARDIANA puede decir si la
  característica está instalada y si hay política que la prohíba (solo lectura); quitarla es una orden del cliente, con
  su botón, nunca sola.
- **Los destinos de red de los servicios de IA** ya se ven en «Tu IA» del panel (`/api/ia`); lo nuevo es unirlo con el
  programa que habla (el escudo ve el proceso) y con los permisos de arriba, y avisar cuando un programa nuevo empiece.
  Los dominios por fabricante: pendientes de fuente oficial por cada uno antes de ponerlos en una lista.
- **Lo que no se dice:** «bloquea la IA», «detecta todo lo que la IA hace con tus datos». El contenido va encriptado y no
  se abre. Se vigila, se avisa y se deja cortar.
