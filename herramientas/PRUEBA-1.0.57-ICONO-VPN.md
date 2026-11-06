# Prueba a mano: el icono de la VPN junto al reloj (1.0.57)

Para hacer en tu PC con Windows 11 y, si tienes, en uno con Windows 10. No hay que cambiar ningún ajuste del sistema.

**Dónde está el icono.** Es el candado de GUARDIANA con un punto de color, junto al reloj. Windows suele guardar los
iconos nuevos en la flecha «^» que hay al lado del reloj: ábrela y estará ahí. No hace falta moverlo.

**Qué significa el color del punto:**
- verde: la VPN está conectada;
- ámbar: está conectando;
- rojo: no sale nada a internet (el servidor no contesta, o la VPN se paró con su bloqueo puesto);
- gris: está apagada, o GUARDIANA no contesta.

En cada paso, mira también el chip de la VPN en la barra de ZERO, si ZERO está abierto: debe decir lo mismo que el icono.

## Antes de empezar

1. Instala el instalador de la 1.0.57 que te pasemos, con su ventana normal.
   - **Qué debe pasar:** al terminar se abre GUARDIANA y el icono aparece (gris si la VPN está apagada).

## Lo básico

2. Pasa el ratón por encima del icono.
   - **Qué debe verse:** «GUARDIANA» y debajo el estado, por ejemplo «VPN desconectada».
3. Haz clic con el botón izquierdo.
   - **Qué debe verse:** se abre ZERO en la pantalla de la VPN de Órbita. Si ZERO ya estaba abierto detrás de otra ventana,
     debe venir al frente. Si solo parpadea en la barra de tareas, apúntalo.
4. Haz clic con el botón derecho.
   - **Qué debe verse:** un menú con:
     - el estado en gris (no se puede pulsar);
     - «Abrir la VPN» en negrita;
     - «Conectar a la salida más rápida»;
     - «Abrir GUARDIANA».
5. En ese menú, pulsa «Abrir GUARDIANA».
   - **Qué debe pasar:** se abre GUARDIANA.

## Conectar y desconectar desde el icono

6. Botón derecho → «Conectar a la salida más rápida».
   - **Qué debe verse:** el punto pasa a ámbar («VPN: conectando…») y en unos segundos a verde. Al pasar el ratón:
     «VPN conectada» y el país y la ciudad, por ejemplo «Finlandia · Helsinki».
   - No sale ningún aviso de Windows, porque lo has pedido tú.
7. Botón derecho otra vez.
   - **Qué debe verse:** arriba el estado y el lugar en gris, y ahora «Desconectar» en lugar de «Conectar…».
8. Pulsa «Desconectar».
   - **Qué debe verse:** el punto vuelve a gris («VPN desconectada»), sin aviso. Si abres el menú mientras tanto, pone
     «Desconectando…» y no se puede pulsar.

## Conectar y desconectar desde Órbita (los avisos)

9. Abre la VPN en Órbita y conecta desde allí.
   - **Qué debe verse:** el icono pasa a ámbar y luego a verde, y sale un aviso de Windows:
     - título «VPN conectada»;
     - el lugar;
     - «Lo que sale de tus programas de Windows hacia internet va por el túnel, encriptado hasta el servidor.»
10. Haz clic en ese aviso, o en su botón «Abrir la VPN».
    - **Qué debe pasar:** ZERO se abre en la VPN.
11. Desconecta desde Órbita.
    - **Qué debe verse:** el icono en gris y un aviso «VPN desconectada»: lo que sale vuelve a ir por tu conexión normal.

## Con ZERO cerrado

12. Cierra ZERO con su X.
    - **Qué debe verse:** el icono sigue ahí, y su menú y el clic funcionan (el clic vuelve a abrir ZERO en la VPN).

## Si se corta la red con la VPN conectada

13. Conecta la VPN y, cuando esté en verde, desenchufa el cable de red o apaga el wifi desde su botón de la barra de tareas.
    - **Qué debe verse:** el programa espera al servidor algo más de 3 minutos (200 segundos) antes de darlo por callado.
      Pasado ese tiempo, el punto pasa a rojo, con «VPN sin respuesta» (o «VPN: no conecta» si tienes encendido el modo
      estricto). Sale un aviso que explica que no sale nada de tus programas de Windows fuera del túnel. En el menú está
      «Desconectar».
14. Vuelve a conectar la red.
    - **Qué debe verse:** al poco (puede tardar un minuto), el punto vuelve a verde y sale el aviso «VPN conectada» con
      «El servidor vuelve a contestar…».
15. Si prefieres no esperar, pulsa «Desconectar» en el menú mientras está en rojo.
    - **Qué debe pasar:** vuelve a gris, y internet vuelve a ir por tu conexión normal.

## Si tu licencia está en el nivel gratuito

16. Solo si no tienes Plus: botón derecho → «Conectar a la salida más rápida».
    - **Qué debe verse:** un aviso con «VPN desconectada» y la línea de Plus, «Esto forma parte de Plus.». No debe decir
      «no se pudo conectar» sin explicar por qué.

## El Explorador de Windows

17. Abre el Administrador de tareas (Ctrl + Mayús + Esc) → «Procesos» → «Explorador de Windows» → botón derecho →
    «Reiniciar». La barra de tareas desaparece un momento y vuelve.
    - **Qué debe verse:** en unos segundos el icono vuelve con su color. No debe quedar ningún icono repetido.

## El teclado

18. Pulsa Win + B (lleva el teclado a los iconos junto al reloj). Muévete con las flechas hasta el icono; si está en la
    flecha «^», ábrela con Intro.
    - Intro sobre el icono: **debe** abrir la VPN en ZERO.
    - La tecla de menú, o Mayús + F10: **debe** abrir el menú, y se recorre con las flechas.

## La pantalla a más del 100 %

19. Solo si ya usas la escala de pantalla a 125, 150 o 200 % (no la cambies para esto): mira el icono de cerca.
    - **Qué debe verse:** el candado y el punto, nítidos, no borrosos.

## Actualizar con el instalador

20. Con el icono a la vista (mejor con la VPN conectada), instala encima el instalador nuevo que te pasemos, con su
    ventana normal.
    - **Qué debe pasar:**
      - no sale ninguna ventana de «archivos en uso» ni nada en inglés;
      - al terminar se abre GUARDIANA y el icono vuelve con su color;
      - no queda un segundo icono «fantasma» (si queda uno, desaparece al pasar el ratón: apúntalo).

## Un apagado que se cancela (opcional; cuidado con el último paso)

21. Abre el Bloc de notas, escribe cualquier cosa y no guardes. Ve a Inicio → Apagar. Cuando Windows diga que el Bloc de
    notas impide apagar, pulsa **«Cancelar»** (no «Apagar de todos modos»).
    - **Qué debe verse:** el icono sigue junto al reloj. Después cierra el Bloc de notas sin guardar.

## Lo que hay que apuntar

En cada paso que no salga como dice:
- el número del paso;
- el Windows (10 u 11) y la escala de pantalla;
- una foto de la pantalla (Win + Mayús + S) con el icono, el texto al pasar el ratón o el menú abierto.
