# Ronda 63 · ChatGPT («Alta», con web) · NÚCLEO guiado al 100 %

27 Oct 2026, ~15:45 (Bogotá). Respuesta copiada de la conversación (resumida sin perder ninguna recomendación).

**Veredicto:** aprueba la propuesta con siete cambios. El principal: NÚCLEO no debe comportarse como un chat, sino como una guía interactiva que conversa. La persona debe saber siempre dónde está, qué puede hacer ahora y cómo regresar sin perder su trabajo.

## A) El árbol
1. Seis opciones, con nombres sencillos («cuatro para actuar y dos para descubrir»): Navegar por internet · Comprobar una página (Radiografía) · Ver mis datos · Hablar y enviar archivos · Explorar el planeta · Conocer GUARDIANA. En los niveles siguientes, **máximo cuatro opciones** por pregunta («criterio inicial, no norma universal»).
2. Submenús: Navegar (abrir una web · buscar · cómo funciona ZERO) · Comprobar (Radiografía · quién me rastrea · qué es un corte · mis datos) · Ver mis datos (consultar · crear resumen · qué significan · borrar) · Hablar (iniciar · unirme con un código · enviar archivos · cifrado) · Planeta (ir a un país · cables · satélites · centros de datos) · GUARDIANA (qué es · gratis y de pago · multas · ayuda). Solo lo que ya funciona: el buscador propio, CONTROL IA y COMPRUEBA, cuando existan.
3. Faltan: «Estás aquí» (línea con el camino encima de la pregunta); proponer el siguiente paso tras cada resultado; conservar las respuestas al retroceder; estados de problema (sin datos, sin conexión, sin permiso, error de descarga, función de pago), cada uno con explicación y salida.
4. Recorridos cortos, una pregunta por paso (GOV.UK Design System: «una cosa por página»); no preguntar dos veces lo que ya se sabe.

## B) «Atrás» y «Menú principal»
5. **No acumular el chat:** una zona de pregunta activa que se actualiza; arriba el camino («Inicio › Mis datos › Resumen»), en el centro una sola pregunta, «← Atrás» y «Menú principal» siempre visibles.
6. «Atrás»: vuelve exactamente al paso anterior, recupera sus opciones, conserva lo elegido, no repite descargas ni envíos, sin mensajes duplicados. Lo irreversible (borrar) pide confirmación antes y NÚCLEO explica que no se puede deshacer. El botón atrás del navegador, coherente.
7. «Menú principal»: vuelve a las seis opciones; si hay algo a medias, pregunta antes. Al volver de ZERO, Órbita o Comunicaciones, regreso reconocible al mismo paso. Técnicamente, un historial de estados, no del texto.
8. Si NÚCLEO no entiende lo escrito, no manda al menú: «No he entendido bien lo que necesitas. Puedes elegir una de estas opciones o escribirlo de otra manera», con las opciones de la sección.

## C) Textos
9. Bienvenida: «Hola, soy NÚCLEO, tu guía en GUARDIANA. Voy a ayudarte paso a paso. Puedes elegir una opción o escribir lo que necesitas. Siempre podrás volver atrás o empezar de nuevo.»
10. Pregunta: «¿Qué quieres hacer ahora?»
11. Las seis opciones con su línea (p. ej., «Ver mis datos: consulta lo que ZERO ha detectado en este navegador y crea un resumen»).
12. Frases: tarea terminada «Ya está. ¿Qué quieres hacer ahora?»; sin datos «Todavía no hay datos de ZERO para mostrar en este navegador»; antes de borrar «Si borras estos datos, no podrás recuperarlos desde aquí. ¿Quieres continuar?»; al volver «Has vuelto a NÚCLEO. Puedes continuar donde lo dejaste». Nada de «Error 500» ni mensajes técnicos.

## D) Errores que hay que evitar
13. Demasiadas opciones; preguntas repetidas; acumular mensajes y botones antiguos; perderse al abrir ZERO u Órbita; volver al inicio tras un error; textos técnicos; botones pequeños (propone ~48 px de alto; WCAG 2.2 pide 24 × 24 px como mínimo); ofrecer funciones que no existen; borrar o enviar sin confirmar; respuestas sin siguiente paso.
14. «Ir a un país»: los países sugeridos, según el idioma o las pruebas, y «Buscar otro país». «¿Qué puedo pedir?»: conservarlo como explicación consultable del mismo árbol, no como un segundo menú. Fuera las acciones rápidas, pero «Atrás» y «Menú principal» fijos aunque se desplace la pantalla. Tras cada resultado, acciones de ese resultado.

## E) Comprobar
15. Tres rondas de pruebas con 5 personas (mayores con poca experiencia, teclado, ampliación, lectores de pantalla); sin decirles dónde pulsar.
16. Ocho situaciones: abrir una web sin saber qué es ZERO; entender una Radiografía; resumen de 7 días en PDF; conversación cifrada; encontrar España en Órbita y volver; retroceder y cambiar una elección; escribir algo que NÚCLEO no entiende; pedir datos cuando no hay.
17. Medir (objetivos internos propuestos): tareas sin ayuda ≥ 90 %; ningún error sin salida; «Atrás» correcto en todos los recorridos; ninguna elección perdida; 100 % de enlaces y acciones funcionando; entender el siguiente paso ≥ 90 %. Y pruebas automáticas de todos los caminos.
18. Regla final: quien no sabe recibe guía paso a paso; quien ya sabe puede escribir y llegar directo, con el mismo mecanismo para regresar.
