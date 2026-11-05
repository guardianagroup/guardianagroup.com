# Traspaso · 5 nov 2026, 14:30 (Bogotá) · la 1.0.56 lista, a la espera del «publica» del dueño

Dónde está cada cosa, para seguir sin perder nada. Las reglas del dueño están en `TRASPASO.md`, y no cambian. Lo más importante:
- Español, pocas líneas, sin código en el chat.
- «encriptado» y no «cifrado».
- Nada de «auditada», «certificada», «conformidad CNSA 2.0», «anónima», «imposible», «nadie puede», «100 % seguro», «los primeros».
- Sin cifras inventadas ni promesas absolutas.
- Nunca nombres, correos ni claves del dueño. Él inicia sesión, acepta y paga.
- Capturas de cada cambio, avisar al publicar. Proponer antes de un cambio grande.
- Solo se publica lo que confirman dos voces.
- Las filas del escudo de ZERO nunca cambian de alto ni se mueven al pulsar un botón (dueño, 10 oct).

## GUARDIANA para Windows (repositorio guardianagroup/guardiana)

### Rama `pc-1.0.56`, commit final **8b51000**: lista para publicar
- **Qué trae:** VPN de verdad (salidas Helsinki, Núremberg y Miami; modo estricto con bloqueo persistente y de arranque,
  también sobre lo que Windows reenvía: ICS, punto de acceso, WinNAT; «desconectar» en el estado y «Desconectar» siempre a
  mano; la llave del panel solo va al proceso del servicio; cambio de salida sin perder el bloqueo); escudo de ZERO
  rediseñado (abierto 384 px por defecto, plegado 152 px; emblema grabado; filas de geometría fija); instalador que se
  cierra solo y abre GUARDIANA (WixUnelevatedShellExec), actualización desde la 1.0.55 sin perder nada; conclusión de la
  Revisión del PC con singular/plural (es, en, pt); textos del modo estricto acotados a «tus programas de Windows», con la
  nota de WSL y máquinas virtuales (docs/VPN.md «Lo que Windows reenvía»).
- **Comprobado sobre 8b51000:** ci (42087419623), zero (42087419546), vpn (42087419538), prueba estricta real
  `estricto_de_verdad` 115/115 (42087448241), candidato (42087442121), fotos del instalador (42090768150: nueva,
  actualiza y el instalador propio de ZERO, las tres bien).
- **Dos voces:** revisión independiente final (scratchpad `revision-final-1056.md`): GO con tres condiciones, aplicadas en
  8b51000 y verificadas por el mismo revisor: GO sin condiciones.
- **Huellas SHA-256 de los MSI del candidato 42087442121:**
  - es: 9e69da70c1e4ae75a25e933400d20b02ba8a79a30edacb7aca1d565f49fd2019
  - en: c58ff6d96efb1a8dd732540cdb7aef4caa7c684d49042a0f7b3057424bcb52a7
  - pt: 2439fb6045fbe0bf21c7947423a2f97cbd5474014fcf4c62deacd2101009a9f5
  - GUARDIANA ZERO.exe (dentro): e639397260a0abd04039060ada5d1ea0bfe0b4b4a68013899342397e3b1aaba7
- **Pasos para publicar (cuando el dueño diga «publica»):**
  1. En la web, `gh workflow run instaladores.yml --ref main -f version=1.0.56 -f ejecucion=42087442121 -f huella_es=… -f huella_en=… -f huella_pt=…`
     (es un despliegue en producción: el sistema pide la autorización expresa del dueño).
  2. `git pull` de main; tamaños con `git cat-file -s main:descargas/1.0.56/<msi>`.
  3. `herramientas/publicar/publica_paginas.py <web> 1.0.55 1.0.56 41590231341 42087442121 <es> <en> <pt> <bytes_es> <bytes_en> <bytes_pt>`.
  4. `git rm` de los MSI de la 1.0.55; fundir `vpn-pantalla` (f843a2ce); subir `?v=`; `huellas.py`, `csp-hashes.py`,
     `csp-comprueba.js`; commit y push a main; comprobar la web publicada y enseñarla.
- **Ramas fundidas en pc-1.0.56:** vpn-arreglos (segunda revisión: N2, N3, punto 5, menor 3), vpn-prueba-estricto,
  vpn-reenvio, escudo-nuevo. No borrar hasta publicar.

### Para la 1.0.57 (anotado, sin empezar salvo lo dicho)
- Icono de la VPN junto al reloj (rama `bandeja-vpn`, c6bc852, WIP).
- Cortafuegos de Hyper-V para WSL2 y máquinas virtuales (docs/VPN.md, «Siguiente paso»).
- Revisión del PC: la sección «arranque» tardó 295 s en el runner (Get-AuthenticodeSignature archivo a archivo); mirar
  si en un PC real es aceptable o firmar en lote.
- Plurales de la conclusión de la Revisión en los otros 28 idiomas (claves rv_n_problemas/_uno, rv_n_cosas/_uno,
  rv_conclusion_alerta_y/_sola, rv_conclusion_aviso_n; revision.js elige por LANG).
- Antivirus Normal/Máximo; Ultra; idiomas (rama traduccion-wip); página del instalador propio de ZERO.
- Probar a mano en un Windows 11 real (recomendación de las dos revisiones): VPN estricta con reinicio, desinstalar con la
  VPN puesta (VpnApaga en el desinstalador: misma forma que RestoreDns, no probada en MSI real).

## La web (repositorio guardianagroup/guardianagroup.com)
- **main (e94fb9bb):** VPN en Núremberg y Miami montada sola por la actualización automática. Los tres servidores de la
  VPN están vivos: vpn (62.238.17.121), vpn-nbg (168.119.225.147), vpn-mia (144.202.36.32); se actualizan cada 15 min
  desde main (`zero-motor/actualizar-motor.sh`).
- **vpn-pantalla (f843a2ce):** la pantalla de la VPN en Órbita con los textos de B1 (programas de Windows; nota de WSL y
  máquinas virtuales; «Desconectar» tras un error con el bloqueo puesto). Se publica con la 1.0.56.
- **apinamientos (agente, worktree wt-apinamientos):** arreglos de lo amontonado en ZERO, portada, Órbita, cabecera
  estrecha, tablas, NÚCLEO, Comunicaciones, casos, «Cómo funciona». Falta la segunda voz y publicar.
- **movil-lectura (agente, worktree wt-movil-lectura, parte de `seo`):** «leer sí, usar no» (decisión 1 de PLAN.md, opción A,
  dueño 5 nov): `marco/marco.js` y `marco/entrada.js` solo mandan a /solo-pc/ la aplicación (/orbita/ salvo /orbita/multas/,
  /m/, /e/, /chat/, /inicio/); las páginas de lectura se leen en el teléfono con la franja «GUARDIANA se usa en el PC. Aquí
  puedes leer qué hace.» (`marco/lectura.css`, × recordada en sessionStorage; portada: `--gf-alto` en el bloque táctil).
  Googlebot Smartphone ya ve el contenido; nunca se distingue al robot de las personas. Decisión 3: guías del DNS con
  «noindex»; zero.html, «por dentro», «comprobar un recibo» e instalar (sin «noindex», description a 155) en el sitemap
  (231 direcciones; `herramientas/sitemap.py`). Sin segunda voz todavía; falta fundir `seo` + `movil-lectura` en main.
- **Pendiente anotado:** Comunicaciones dice «Nadie puede escribirte…» en 42 idiomas (regla del dueño): redactar sin
  absolutos, encargo de traducción (`herramientas/traduccion-web/encargo.md`), `fusiona.py`, dos voces, publicar.
