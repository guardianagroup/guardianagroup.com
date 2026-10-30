Ronda 80 · la voz de Claude · «Que funcione como un teléfono, sin instalar nada»

Tres conceptos (de mejor a peor)
1. «Tu línea GUARDIANA»: el Número GUARDIANA pasa al navegador y se ancla a una llave de acceso (Face ID / huella).
2. «Tarjeta GUARDIANA»: un QR o enlace personal, como una tarjeta de visita cifrada; quien lo escanea te escribe o te llama.
3. «Llamada puente»: llamar a un número de teléfono normal; recibe una llamada con una voz y un SMS con un enlace de un solo uso.

1 · Tu línea GUARDIANA (a fondo)
- Primer minuto: se abre guardianagroup.com en el teléfono → «Comunicaciones» → una sola pantalla:
  «Tu línea GUARDIANA» · el número de 12 cifras ya creado en el teléfono · botón «Proteger con Face ID» (o «con tu huella»)
  · debajo, «Llamar» y «Mi tarjeta». Nada que rellenar.
- «Proteger con Face ID» crea una llave de acceso (passkey) solo para GUARDIANA. Con la extensión PRF de WebAuthn, esa llave
  devuelve siempre el mismo secreto, y de él sale la llave que cifra tu número, tus contactos y tus chats guardados. El servidor
  no guarda ninguna cuenta ni copia: la llave de acceso vive en el llavero del teléfono (iCloud o Google, cifrado de extremo a
  extremo). Si Safari borra los datos de la web (lo hace con las webs no instaladas tras 7 días de uso sin abrirlas) o cambias
  de teléfono, Face ID te devuelve tu línea.
- Llamar: «Llamar» → escribes el número o escaneas su tarjeta → si la otra persona tiene GUARDIANA abierta, suena al momento.
  Si no: en Android le llega el aviso del navegador; en iPhone, sin la app, no puede sonar con la página cerrada: le queda
  «Llamada perdida» en su buzón cifrado y la ve al abrir. Quien llama lo sabe: «No tiene GUARDIANA abierta. Le dejamos aviso».
- Con la página abierta suena en los dos (con sonido; vibración solo en Android).
- Qué se guarda y dónde: en el teléfono, cifrado con la llave de Face ID, el número, los contactos y lo que decidas guardar; en
  el servidor, la huella del número (no el número), las claves públicas y el buzón cifrado. Nada más.

Número GUARDIANA: se mantiene y sale de la «pantalla de inicio»: funciona en el navegador. Se sigue exigiendo que los dos se
añadan (sin eso, nadie puede escribirte aunque adivine tu número).

Idea que no hemos visto en otra app de mensajería segura (hay que confirmarlo con la investigación en curso)
- La identidad anclada a una llave de acceso con PRF, sin cuenta y sin copia en el servidor: tu línea vuelve con Face ID en
  cualquier navegador. Signal, Threema o WhatsApp atan la identidad a un número o a una copia de seguridad con contraseña.
  Viable hoy: PRF está en Safari 18 / iOS 18 y en Chrome; en Firefox, con límites (verificar soporte exacto antes de prometer).

Riesgos sin cuentas
- Spam por números adivinados: hace falta que los dos se añadan; límite de intentos por huella en el relé; números de 12 cifras.
- Suplantación: las palabras al empezar la llamada y el sello «Comprobado» en el contacto; la tarjeta se puede anular y cambiar.
- Quien pierde el teléfono y el llavero pierde su línea: es el precio de no tener cuenta; se dice claro.
- Límite honesto: en iPhone sin la app de la tienda, con la página cerrada, no suena.
