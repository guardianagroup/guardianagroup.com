# Traspaso · 3 nov 2026, 02:00 (Bogotá) · el dueño para hasta mañana

Dónde está cada cosa, para seguir sin perder nada. Las reglas del dueño están en `TRASPASO.md`, y no cambian. Lo más importante:
- Español, pocas líneas, sin código en el chat.
- «encriptado» y no «cifrado».
- Nada de «auditada», «certificada», «conformidad CNSA 2.0» ni «anónima».
- Sin cifras inventadas ni promesas absolutas.
- Nunca nombres, correos ni claves del dueño.
- Él inicia sesión, acepta y paga.
- Capturas de cada cambio, avisar al publicar.
- Proponer antes de un cambio grande.
- Solo se publica lo que confirman dos voces.

## GUARDIANA para Windows (repositorio guardianagroup/guardiana)

### Rama `antivirus-vpn`: la 1.0.55 está lista para publicar
- **Versión:** subida en 0b906f6. Las pruebas pasan en c62c9f5 (ci y zero en verde).
- **Contenido:**
  - VPN con corte solo hacia su servidor, Modo Hogar e IPv6.
  - ZERO gratis tras la prueba, con las protecciones en la barra y el chip de VPN con «Desconectar».
  - Programa más ligero.
  - Antivirus con cortes que no se pierden (revisión: GO).
  - 31 idiomas.
  - «encriptado» en todo el español.
  - `GET /api/plan` abierto a la web (para Ultra).
- **Candidato:** ejecución 41590231341. Huellas SHA-256 de los MSI:
  - es: e0b3d6fbcd14d1c28dbc92aa2aef9578b749046218bdefc4a3eefdac7f96e7dc
  - en: 2fb45af8935d1ade1f414b6b17662212f2e3f3a260be6564438412819cf9a010
  - pt: 7159b0dcc9400344267b8fd719fca5164572205431ed05598cde5c3312ed8ec2
  - (la de es la confirma el registro de instalador.yml).
- **Pruebas del candidato:** la instalación por consola, incluida la actualización desde la 1.0.54 publicada, dio 0 fallos. Defender no protesta.
- **Fotos del instalador:**
  - La instalación nueva salió bien (ejecución 41592336616).
  - La actualización falló, por la prueba y no por el programa: el ZERO de la 1.0.54 se abrió encima del instalador.
  - Se arregló `build/cliente/fotos_instalador.ps1` (pone el instalador delante) y se repitió en la ejecución 41593255450. Mirar esas fotos antes de publicar. Se sacan con `herramientas/publicar/fotos_de_log.py <run> <carpeta>`.
- **Pasos que faltan para publicar:**
  1. Revisar las fotos de 41593255450 y mandárselas al dueño.
  2. En la web, `instaladores.yml` con version 1.0.55, ejecucion 41590231341 y las tres huellas.
  3. `herramientas/publicar/publica_paginas.py <web> 1.0.54 1.0.55 41536881703 41590231341 <es> <en> <pt> <bytes_es> <bytes_en> <bytes_pt>`. Los tamaños salen de los MSI descargados.
  4. `git rm` de los MSI de la 1.0.54.
  5. `herramientas/csp-hashes.py`, commit y push a main.
  6. Avisar al dueño de que, al acabar la prueba, la VPN pide Plus (él y su amigo pueden necesitar licencia).

### Rama `arreglos-1056` (cfc65dd, subida): las cuatro mejoras de la tercera revisión de los cortes del antivirus
- Retomar la sesión perdida sin perder cortes (5bd18bb).
- Comprobación cada minuto (3aee108).
- «Dejar pasar todo» olvida también lo que espera (2efc603).
- Olvidar las rutas que ya no están (c84e669).
- **Estado:** ci y vpn en verde; zero seguía corriendo.
- **Falta:** una revisión (segunda voz) y unirla para la 1.0.56.

### Rama `traduccion-wip` (4cf6d4e): las traducciones, paradas por el dueño (3 nov, 01:10: «los idiomas lo dejamos para el final»)
- **En `herramientas/traduccion/`:** trocea, comprueba y junta; el encargo; los trozos; y `cola.txt`, con todo lo pendiente.
- **Hecho:**
  - bengalí 14/21, tamil 11/21, telugu 8/21, tailandés 7/21.
  - Sin empezar: vietnamita, indonesio, malayo, filipino, suajili, islandés y chino de Taiwán.
- **Al retomar:** terminar esos idiomas, `junta.py <idioma> <repo>`, y la tanda delta (tarea 70 y `cola.txt`).
  - La tanda delta incluye las 25 claves nuevas de ZERO (barra_*, licencia_*, vpn_*) y la clave «ir».
  - También seis claves cuyo español cambió, y reescribir las notas borrado_nota_*.

## La web (repositorio guardianagroup/guardianagroup.com)
- **`main` (b32b08a):** publicado Comunicaciones con la Blindada (gratis) y Ultra (con Plus, «próximamente»), con los términos y la privacidad al 2 nov.
- **Rama `encriptado-web`:** cambia «cifrado» por «encriptado» en todo el español de la web.
  - Vuelve a enlazar las traducciones de los 39 idiomas.
  - En términos y privacidad, una línea en el historial y la fecha al 3 nov.
  - Estado: ver el final de este archivo.
- **Rama `ultra-1`:** Ultra 1, la versión de pago de Comunicaciones (ver `agencia-rondas/ronda93/decisiones.md`).
  - Se crea solo dentro del programa con Plus (la prueba cuenta); quien la recibe entra gratis desde cualquier navegador.
  - Es la «sesión blindada» interna (modo 'blindada', suite P-384, ML-KEM-1024, ML-DSA-87), encendida y puesta al día.
  - Estado: ver el final de este archivo.
- **Orden al publicar:** primero `encriptado-web`, después `ultra-1` (unir main y resolver los `?v=`), y después la tanda de traducción de la web.
  - La tanda de la web es la tarea 39: unos 475 textos faltan en los 39 idiomas y hoy salen en inglés. El encargo y el script que funde las traducciones están en `herramientas/traduccion-web/`.

## Ronda 93 con Gemini: Ultra
- Está en `agencia-rondas/ronda93/`: la pregunta, la respuesta de Gemini (4 Argon, razonamiento «Alto», resumida), la de Claude y las decisiones.
- La propuesta ya se le contó al dueño.

## Pendiente importante (lista de tareas de la sesión)
- **VPN:**
  - modo estricto (66);
  - pantalla de regiones con banderas (67);
  - instalar la VPN en Núremberg y Miami;
  - Tokio, cuando la pantalla de regiones esté lista (lo paga el dueño).
- **Antivirus:** niveles Normal y Máximo, esperando el visto bueno del dueño.
- **ZERO:**
  - micrófono en el propio PC;
  - Tor;
  - preguntas abiertas del agente: el chip sin la pestaña del panel, unificar los interruptores, «Inicio» descentrado.
- **PDFs y cartas en todos los idiomas (73):** letras fuera de Latin-1, y cartas en dos idiomas.
- **Plurales de cada idioma (72).**
- **Prueba «lienzo» de ZERO que falla a veces (74).**
- **PC del dueño:** diagnóstico (63).

## Estado de las ramas de la web al parar
- **`encriptado-web` (81bf500, subida, «a medias»):**
  - El cambio está hecho en e/, m/, nueva/, Comunicaciones, escaner.js, orbita.js y 17 páginas de empresas. Los hashes dicen «en forma de código (hash)» y «descifraron» pasó a «descodificaron».
  - Las claves están re-enlazadas en idioma.js, en los 39 i18n, en i18n/nueva y en orbita-fuente.
  - `?v=` está en 20261103-enc1. huellas.py y csp-hashes.py no dejan nada pendiente. Pasan las 5 pruebas de Comunicaciones.
  - Términos y privacidad no tenían «cifrado», así que no se tocaron.
  - Quedan 2 claves «…sin cifrar» porque las usa la extensión del navegador.
  - **Falta:** csp-comprueba en las páginas cambiadas, el recuento de «cifr…» que quedan, mirar las traducciones en inglés en el navegador, y las capturas. Después, publicar.
- **`ultra-1`:** el agente estaba guardando al parar. Ver la línea siguiente o `git log` de la rama.
