# ZERO · motor · cómo ponerlo en un servidor propio

El motor (`servidor.js`) abre cada web en una celda de Chromium controlada por Playwright y manda la pantalla a la página
`orbita/zero/` por WebSocket. GitHub Pages no puede ejecutarlo: hace falta un servidor Linux propio.

## Qué hace falta
- Un servidor con **Ubuntu 22.04/24.04 o Debian 12**, 2 núcleos y **4 GB de RAM** (8 GB si van a entrar varias personas a la vez), IP pública, puertos 80 y 443 libres.
- Un **registro DNS A** `motor.guardianagroup.com` → la IP del servidor (en el panel donde está el dominio).

## Instalación (un comando, como root, en la consola del servidor)
```
curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | bash -s -- motor.guardianagroup.com
```
Instala Node 22, Chromium (Playwright), Tor (ruta ULTRA) y Caddy (certificado TLS automático), crea el usuario `zero`,
deja el motor como servicio `zero-motor` en `127.0.0.1:8792` y Caddy publicándolo en `https://motor.guardianagroup.com`
(`wss://motor.guardianagroup.com/sesion`). Se puede repetir para actualizar: no toca la configuración ya creada.

## Después
- Configuración: `nano /etc/guardiana/zero.env` y `systemctl restart zero-motor`.
- Estado: `systemctl status zero-motor` · registro: `journalctl -u zero-motor -f` · salud: `curl https://motor.guardianagroup.com/salud`.
- Página conectada al motor: `https://guardianagroup.com/orbita/zero/?orbita=0&motor=wss://motor.guardianagroup.com`
  (la página guarda la dirección del motor en el equipo; `?motor=` vacío la olvida).

## Variables (`/etc/guardiana/zero.env`)
`ZERO_PUBLICO` (dirección pública, para el enlace oculto del señuelo) · `ZERO_ORIGENES` (webs que pueden abrir celdas) ·
`ZERO_MAX_SESIONES` (celdas vivas a la vez; 4 en 4 GB) · `ZERO_MIN_SIN_MIRAR` · `ZERO_MAX_HORAS` · `ZERO_TOR_PROXY`
(`socks5://127.0.0.1:9050`; vacío = sin ULTRA) · `PLAYWRIGHT_BROWSERS_PATH`.

## Pruebas locales (sin servidor)
`ZERO_DEBUG=1 ZERO_MOCK=1 node zero-motor/servidor.js 8792` y la página con `?motor=ws://127.0.0.1:8792`.
