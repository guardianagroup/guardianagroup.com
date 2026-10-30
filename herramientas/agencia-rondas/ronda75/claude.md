# Ronda 75 · Claude · «¿Cómo funciona?» completo

Voz independiente. Leídos `index.html` (`#como`, `#porque`), `CRIPTOGRAFIA.md` y el código donde hacía falta (`app.js`, `llamada.js`, `zero-motor/numeros.js`, `zero-motor/avisos.js`, `privacidad.html`). B solo afirma lo que el código hace hoy; lo que no respalda va en la nota final.

## A. Estructura

Orden en que una persona lo vive; títulos de dos a cuatro palabras (se traducen bien); párrafos de tres a cinco frases.

1. **Entrada.** Qué es, la regla del texto (solo lo que el código hace hoy; lo previsto, «próximamente») y la fecha de revisión.
2. **Cómo se usa.** Seis pasos: *Tu Número GUARDIANA*; *Añadirse los dos*; *Escribir y llamar*; *Cómo pasar tu número*; *En tu pantalla de inicio* (iPhone y Android); *De ordenador a ordenador* (código o enlace; chat temporal en el móvil).
3. **Cómo te protege.** Claves que nacen en tu equipo; claves nuevas por conversación y por mensaje; híbrido postcuántico; llamadas con el cifrado estándar del navegador, no postcuántico; relé que solo pasa paquetes.
4. **Por qué trabajamos así.** Cinco principios: sin cuenta, consentimiento mutuo, servidor que no guarda, sin tiendas (con la honestidad sobre el programa espía), código público. Motivos aquí; cifras, en «¿Por qué?».
5. **Qué ve y qué no ve GUARDIANA.** Nunca vemos / guardamos (con plazos) / vemos conectado / qué recibe la otra persona.
6. **Lo que no hace.** Copias de quien recibe, dispositivo infectado, copia por el camino, primer contacto sin comprobar, obligaciones profesionales.
7. **Cómo comprobarlo.** Número de seguridad de 60 cifras y huellas del código.
8. **Tres versiones.** Fuerte (hoy), Blindado y Ultra (próximamente); cada fila del cuadro, «hoy» o «próximamente».
9. **Nuestro compromiso.** Licencia, huellas, security.txt, empresa que responde, auditoría prevista; el ecosistema en una línea.

**Qué sobra.** «Qué hace por ti» cuenta en presente funciones del Blindado apagadas (`BLINDADO_ACTIVO = false`): velo, «todo o nada», autodestrucción, mosaico y voz grave. «Número de seguridad en la llamada» y «con tiempo» aparecen como del Fuerte y solo existen con el Blindado activo (`app.js`: `sas: … extrasB(c)` y «la hoja con “Tapar” y el tiempo, solo en el blindado»). «“Seguridad y verificación” comprueba que lo recibido es lo publicado» no es cierto: esa hoja muestra el número de seguridad y dos preferencias. Las citas académicas, a la ficha técnica. Dos entradas al mismo tema: una sola.

**Qué falta.** Los motivos (hoy solo hay datos); lo guardado con plazos; el chat temporal; el rechazo de otra identidad; las fotos sin datos ocultos; el tope real de 300 MB fuera de Chrome o Edge de ordenador; lo que recibe la otra persona; las huellas como comparación manual; el compromiso; la fecha de revisión.

## B. Texto listo para publicar

**¿Cómo funciona?**

GUARDIANA Comunicaciones es un servicio de mensajes, llamadas, videollamadas y archivos entre dos personas, encriptado de extremo a extremo: cada mensaje se cierra en tu equipo y solo el de la otra persona puede abrirlo. Esta página describe el código publicado hoy; lo que está en preparación se marca «próximamente». Última revisión: 29 de octubre de 2026.

**Cómo se usa**

*Tu Número GUARDIANA.* En el teléfono, GUARDIANA te propone un número de 12 cifras creado en tu propio dispositivo: once al azar y una de control contra errores al marcar. Puedes pedir otro o elegir el tuyo. No es un número de teléfono ni está ligado a tu nombre, tu correo o tu línea.

*Añadirse los dos.* Para hablar, cada uno añade el número del otro. Escribir un número no produce nada en el otro teléfono: ni aviso, ni mensaje, ni confirmación de que exista. Cuando los dos se han añadido, el chat se abre solo en ambos teléfonos y únicamente esa identidad puede entrar en él; si otra lo intenta, se rechaza y se te avisa. Un número añadido sin respuesta caduca a los 30 días.

*Escribir y llamar.* Desde el chat escribes, envías notas de voz, fotos y documentos de hasta 4 GB (más de 300 MB, solo si quien recibe usa Chrome o Edge en el ordenador), y llamas o haces videollamadas con un toque. Las fotos salen sin sus datos ocultos (dónde y con qué se hicieron). Con la app cerrada, el aviso solo dice «mensaje», «llamada» o «nuevo contacto»; el contenido llega encriptado al abrirla. «Terminar» borra la conversación en tu equipo y pide el borrado en el otro.

*Cómo pasar tu número.* No es una llave: con él nadie puede leerte ni contactarte; puedes darlo en persona o por escrito. Si alguien te pide guardar «su nuevo número», confírmalo por la vía de siempre: es una suplantación habitual.

*En tu pantalla de inicio.* iPhone: abre guardianagroup.com en Safari, toca «Descargar GUARDIANA», después Compartir y «Añadir a pantalla de inicio». Android: en Chrome, toca «Descargar GUARDIANA» y acepta «Instalar». No hay tienda: la app es la propia página y se actualiza al abrirla. Los avisos con la app cerrada llegan solo desde ese icono (iOS 16.4 o posterior).

*De ordenador a ordenador.* En el ordenador no se instala nada: se abre en el navegador con una invitación, un código de 9 cifras de un solo uso que caduca a los 10 minutos, o un enlace. Es la vía para un cliente sin GUARDIANA. Quien abre la invitación en el navegador del móvil, sin añadir la app, entra en un chat temporal que se borra tras 10 minutos sin uso.

**Cómo te protege**

*Las claves nacen en tu equipo.* GUARDIANA crea en tu dispositivo dos claves, una para firmar y otra para acordar secretos, que el navegador marca como no exportables: ni la propia app puede sacarlas. Nuestro servidor recibe solo su parte pública y una huella de tu número: un cálculo lento del que no sale el número.

*Cada conversación, claves nuevas.* Al abrirse una conversación, los dos equipos se presentan con sus firmas y acuerdan un secreto que no se repite en ninguna otra. De él nace una clave distinta para cada mensaje; una vez usada, se descarta. Un mensaje capturado no sirve para abrir los anteriores ni los siguientes.

*Protección postcuántica.* El acuerdo de claves es híbrido: combina la criptografía clásica (ECDH P-256) con ML-KEM-768, el estándar FIPS 203 diseñado para resistir a los ordenadores cuánticos; si un día falla una, la otra sigue protegiendo. Mensajes y archivos se cierran con AES-256-GCM. Si la otra persona usa una versión sin capa postcuántica, te lo decimos y no se sigue sin tu permiso.

*Llamadas y videollamadas.* El audio y el vídeo van encriptados con DTLS-SRTP, el cifrado estándar de las llamadas del navegador, que no es postcuántico. Las llamadas pasan siempre por nuestros servidores: ninguno de los dos ve la dirección IP del otro.

*Un relé que solo pasa paquetes.* Nuestro servidor de paso, en Núremberg (Alemania), entrega paquetes cerrados entre los dos miembros de una sala. No guarda mensajes, nombres ni claves, y la sala desaparece cuando sale el último.

**Por qué trabajamos así**

*Sin cuenta, sin teléfono, sin correo, sin contraseña.* Lo que no te pedimos no se puede robar, filtrar, vender ni exigir.

*Consentimiento mutuo.* Solo habla contigo quien tú has añadido y te ha añadido. Sin desconocidos no hacen falta filtros contra desconocidos.

*Un servidor que no guarda.* Un servidor sin datos no es un objetivo ni tiene nada que entregar: por eso el relé olvida la sala al terminar.

*Sin tiendas.* El sistema del teléfono ve cualquier aplicación, de tienda o web, y un programa espía instalado lo ve todo. La web aporta otra cosa: no pasa por intermediarios que la distribuyan o la modifiquen, pide menos permisos (no accede a tus contactos ni a tus fotos), su código es público y se elimina borrando el icono. Su punto débil es el servidor que entrega el código en cada visita: lo estamos endureciendo y, próximamente, cada versión irá firmada y anotada en un registro público.

*Código público.* No te pedimos que confíes en nosotros: publicamos lo que hace cada archivo. Las cifras detrás de cada decisión están en «¿Por qué?».

**Qué ve y qué no ve GUARDIANA**

*Nunca vemos:* el contenido de mensajes, archivos y llamadas; tu nombre; tu número; tu teléfono o tu correo; con quién hablaste, una vez cerrada la sala.

*Guardamos:* la huella de tu número con tus dos claves públicas y el mes de alta; mientras los dos os añadís, una «cita» cerrada que ninguno puede leer por separado (se borra al abrirse el chat o, sin respuesta, a los 30 días); y, si activas los avisos, la dirección de avisos de tu navegador y las salas de tus chats (identificadores al azar), que se borran tras 180 días sin uso.

*Vemos mientras estás conectado:* como cualquier servidor, tu dirección IP, la hora y el volumen de datos. No se registran; la dirección se usa solo en memoria, resumida, para limitar abusos.

*La otra persona recibe:* lo que le envías, el nombre que pongas y, en los archivos, el país que tu navegador deduce de tu zona horaria.

**Lo que no hace**

No impide que quien recibe guarde, copie o capture lo que le envías. No protege un teléfono ni un ordenador ya infectados. No puede saber si alguien copió un paquete por el camino: por eso todo viaja encriptado y la copia no sirve. Si alguien cambiara el número por el camino, la conversación podría nacer con un intermediario: compruébalo con el número de seguridad. No sustituye tus obligaciones profesionales sobre lo que envías.

**Cómo comprobarlo**

*Número de seguridad.* Cada conversación tiene un número de 60 cifras, derivado de las identidades de los dos equipos, en «Seguridad y verificación». Si los dos ven el mismo, comprobado por teléfono o en persona, no hay nadie en medio: marca «Verificada». La negociación de las llamadas viaja por ese mismo canal, así que la comprobación las cubre también.

*Huellas del código.* Publicamos la huella SHA-256 de cada archivo de la app en huellas.txt y el código completo en un repositorio público. Cualquiera puede comparar lo que recibe su navegador con lo publicado. Próximamente, cada versión irá firmada.

**Tres versiones**

*Fuerte · hoy, gratis.* Todo lo descrito en esta página.

*Blindado · próximamente, gratis.* Algoritmos de la suite CNSA 2.0 (ML-KEM-1024, firmas ML-DSA-87 y P-384), identidad nueva en cada conversación, claves renovadas cada 5 minutos, mensajes con relleno, fotos y documentos con tiempo en pantalla, archivos «todo o nada», autodestrucción ante un ataque, pantalla velada, y mosaico y voz grave en las videollamadas.

*Ultra · próximamente, de pago.* Relés de operadores independientes en varios países con ruta por capas, cobertura a ritmo constante, salas que cambian de dirección, detección de intentos de espionaje con informe, archivos de hasta 1 TB, prepago sin cuenta y un programa firmado para ordenador.

**Nuestro compromiso**

El código se publica con licencia AGPL-3.0 y con la huella de cada archivo. Los fallos de seguridad se reciben en hola@guardianagroup.com, con acuse en 72 horas y respuesta en 7 días. Responde una empresa con nombre: GUARDIANA GROUP S.A.S., Cartagena de Indias. Está prevista una auditoría externa independiente. Comunicaciones convive con ZERO, Radiografías y Órbita.

[Botón: Ver los datos: ¿por qué es así?]

## C. Frases prohibidas y riesgos legales

**Cinco frases que no debemos escribir nunca, con su versión honesta.**

1. ✗ «Imposible de espiar: nadie puede leer tus mensajes, ni siquiera nosotros.» → ✓ «Se encriptan en tu equipo y solo el de la otra persona puede abrirlos; el relé pasa paquetes que no puede leer. No protege un dispositivo infectado ni evita la copia de quien recibe.»
2. ✗ «Certificado / conforme a CNSA 2.0; grado militar avalado por la NSA.» → ✓ «Usa algoritmos de la suite CNSA 2.0 (Blindado, próximamente). Ninguna autoridad ha certificado esta aplicación.»
3. ✗ «No guardamos absolutamente nada. Cero datos, cero registros.» → ✓ «No guardamos mensajes, nombres, teléfonos ni claves. Guardamos la huella de tu número, la cita cerrada hasta 30 días y la dirección de avisos. Conectado, vemos tu IP y la hora; no se registran.»
4. ✗ «Todo está protegido contra los ordenadores cuánticos, también tus llamadas.» → ✓ «Mensajes y archivos usan un acuerdo híbrido con ML-KEM-768. Las llamadas usan el cifrado estándar del navegador (DTLS-SRTP), que no es postcuántico.»
5. ✗ «Resistente a Pegasus; aunque te roben las claves, la conversación se recupera sola.» → ✓ «Cada sesión estrena claves y la de cada mensaje se descarta tras usarse. Si tu dispositivo está comprometido, ninguna aplicación te protege.»

También: «los primeros», «100 % seguro», «no deja ningún rastro», «cumple la Ley 1581 / el RGPD / la historia clínica».

**Tres riesgos legales.**

1. **Ley 1581 de 2012: «no tratamos datos» cuando tratamos algunos.** La IP, la huella del número con sus claves públicas y la suscripción de avisos pueden ser datos personales (art. 3). «Cero datos» rompe la veracidad (art. 4) y el deber de informar (art. 12) ante la SIC. Mitigación: la lista exacta con plazos, enlazada a la política de tratamiento (art. 17 k), y decir que el relé está en Alemania y los servidores de llamadas en Alemania y Estados Unidos, ambos en la lista de nivel adecuado de la SIC (Circular 005 de 2017, modificada por la 008: [Holland & Knight](https://www.hklaw.com/publications/Cambios-en-la-Transferencia-de-Datos-Personales-a-Otros-Paises-08-25-2017/), [Circular 008](https://normativa.colpensiones.gov.co/colpens/docs/circular_superindustria_0008_2017.htm)); la transferencia debe constar (art. 26).
2. **Ley 1480 de 2011: lo anunciado obliga; «próximamente» no puede parecer «hoy».** La publicidad vincula (art. 29) y es engañosa cuando «no corresponda a la realidad o sea insuficiente» (arts. 5.13 y 30). El cuadro actual marca ✓ en el Fuerte funciones apagadas, y «Blindado gratis» promete lo que no existe. Mitigación: fecha de revisión, «hoy» / «próximamente» por fila, «sin fecha comprometida», condiciones de lo gratuito (art. 33).
3. **«Grado gubernamental», «postcuántica» y el público regulado.** Sin matiz, sugieren un aval oficial inexistente y una cobertura (llamadas, dispositivo) que no hay. Para clínicas, bancos y despachos, cualquier «cumple» (historia clínica, secreto profesional, reserva bancaria) traslada a GUARDIANA una responsabilidad que no puede asumir. Mitigación: «algoritmos de la suite…», nunca «conforme»; decir qué no es postcuántico; la frase final de «Lo que no hace».

## Nota final: lo que la pregunta da por hecho y el código no respalda

- **«Con tiempo» (hecho 4)** y «Borrar en los dos» por mensaje: solo con el Blindado activo (`app.js`: `extrasB` en la hoja de envío y en «Borrar en los dos»; `BLINDADO_ACTIVO = false`). En B, en Blindado.
- **Número de seguridad en la llamada:** el de 4 cifras existe (`llamada.js`, `sasCalcula`), pero solo se enseña en Blindado y Ultra (`app.js`, `sas: () => … extrasB(c)`). En el Fuerte, el de 60 cifras.
- **«Seguridad y verificación» que compara lo recibido con lo publicado (hecho 6):** nada lo hace; esa hoja muestra el número y dos preferencias. Construirlo o retirar la frase del párrafo «Código abierto y comprobable».
- **Blindado «próximamente» (hecho 7):** `CRIPTOGRAFIA.md` §3 lo describe como código existente; está, pero apagado por decisión del dueño (29 Oct, 12:52).
- **Relés (hecho 5):** `privacidad.html` §5: las llamadas usan Núremberg o Miami, el más cercano. **Comprobante:** hoy solo Ultra; `como-funciona.html` aún lo describe en presente. **Auditoría:** sin contrato ni fecha; B la deja «prevista».
- **Huella del número:** 11 cifras al azar son unos 36 bits; PBKDF2 (300.000 vueltas) frena, pero quien robe el almacén puede probar fuera de línea. B dice «un cálculo lento del que no sale el número», como la pantalla actual, no «imposible de deshacer». Conviene anotarlo en `CRIPTOGRAFIA.md` §7.
