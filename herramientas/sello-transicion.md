# El paso de los servidores al sello (guion, 1 nov 2026)

Dueño, 16:21–16:30: «sellar la página web… del máximo nivel posible». Desde este paso, los servidores solo pasan a
versiones firmadas por el dueño (`zero-motor/sello-actualiza.sh` y `zero-motor/sello-aplica.sh`). Hasta este paso, el
actualizador de siempre pone en los servidores, en 15 minutos, lo que llegue a `main` (y si cambia `instalar.sh`, lo
ejecuta como root). Por eso el orden importa.

1. **La llave del dueño.** El dueño abre <https://guardianagroup.com/firma/> en su iPhone (Face ID) o en su PC (Windows
   Hello), pulsa «Crear mi llave» y pega aquí el texto. `python3 herramientas/sello.py llave '<texto>'`.
2. **Todo junto en local, sin publicar.** Fusionar la rama `sello-servidores` en `main` (en local) con la llave nueva
   (`sello/llaves.json`). No subir nada todavía: con el actualizador de siempre, subir `instalar.sh` sin una publicación
   firmada dejaría los servidores sin llaves que comprobar.
3. **La publicación nº 1.** `python3 herramientas/sello.py preparar --nota "…" --servidores`. Subir **solo** `sello/`
   (la llave, el manifiesto y el documento pendiente): el manifiesto ya describe el `zero-motor/` nuevo aunque aún no esté
   en `main`. Mientras tanto, nada más cambia en la web (si cambia, se vuelve a preparar).
4. **La firma.** El dueño abre /firma/, revisa la publicación (qué cambia, «✓ El manifiesto es el de este documento») y
   firma con Face ID o Windows Hello; pega aquí el texto. `python3 herramientas/sello.py firma '<texto>'` la comprueba.
5. **La transición.** Subir el resto de una vez (el código de `zero-motor/`, la firma y `sello/actual.json`). El
   actualizador de siempre ve un `instalar.sh` nuevo y lo ejecuta como root por última vez: instala el comprobador, los
   guiones y las llaves como root, comprueba que la versión instalada es la publicación nº 1 firmada y apunta su número.
6. **Comprobar** en los tres servidores, 15–30 minutos después: `https://<servidor>/vigilante` (que la web sea la firmada,
   los certificados y el DNS) y `journalctl -u zero-actualiza` (las versiones que llegan, firmadas o no).

Pruebas: `herramientas/pruebas-sello/firma.js` (la página de firma, 23) y `herramientas/pruebas-sello/servidor.sh` (un
servidor simulado, 13; solo en una máquina de pruebas).

Si algo sale mal: el motor sigue funcionando con la versión que tenía; sin una publicación firmada nueva, los servidores
no cambian. Para volver al actualizador de antes hace falta entrar en el servidor como root.
