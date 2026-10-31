# Astra 6 (gpt-6-astra), ronda 85

## 1. Inicio, de arriba abajo

- Cabecera: marca pequeña «GUARDIANA» y título «Inicio». Sin menú hamburguesa.
- Entrada: «Tu privacidad, bajo control.»
  Apoyo: «Comunícate. Comprueba qué datos salen. Explora la infraestructura.»
- Tarjeta principal — Comunicaciones
  «Conversaciones privadas.»
  «Chat y videollamadas cifradas.»
  Botón: «Abrir comunicaciones».
- Dos accesos compactos, apilados:
  «Radiografías» · «Mide qué datos salen de tu equipo.» · «Iniciar una prueba».
  «Órbita» · «Explora las redes que conectan el mundo.» · «Explorar el planeta».
- Carrusel editorial: encabezado «Entiende tu exposición». Tres tarjetas con ilustraciones ligeras:
  «Cada conexión deja señales.» · «Descubre qué información transmite tu equipo.»
  «Internet tiene una geografía.» · «Cables, fibra, centros de datos y satélites.»
  «Aísla tu navegación con ZERO.» · «Disponible solo para PC con Windows.» · «Conocer ZERO».
  Mostrar parte de la siguiente tarjeta y contador «1 de 3».
- Barra inferior persistente: «Inicio · Comunicaciones · Radiografías · Órbita».

## 2. Cabecera

Título grande que se encoge al desplazar. Implementarlo con cabecera sticky y progreso de scroll; reservar su altura para evitar
saltos. Al contraerse queda «Inicio» en una barra discreta. Nada de esconder la navegación.

## 3. Seis detalles decisivos

1. Continuidad: navegación cliente sin recargas; conservar scroll y estado por pestaña. Atrás debe funcionar.
2. Transiciones: fundidos de 160–220 ms entre pestañas; deslizamiento solo al entrar en detalles. Respetar prefers-reduced-motion.
3. Toque: blancos táctiles mínimos de 44 × 44 CSS px; respuesta visual inmediata con :active, sin depender de hover.
4. Desplazamiento: carrusel con scroll-snap; no secuestrar gestos ni bloquear el zoom.
5. Bordes y teclado: viewport-fit=cover, safe-area-inset-bottom y 100dvh; mantener compositor y campos visibles al abrir el teclado.
6. Carga: estructura visible inmediatamente, esqueletos estables y errores recuperables. Cargar el planeta 3D al entrar en Órbita, no en Inicio.

## 4. Iconos

Trazo uniforme, etiquetas siempre visibles:
- Inicio: casa simple.
- Comunicaciones: dos bocadillos superpuestos.
- Radiografías: marco de escaneo con tres líneas interiores.
- Órbita: esfera atravesada por una elipse inclinada.

## 5. Evitar

Carruseles automáticos, neón, candados decorativos, promesas absolutas y descargas ZERO en móvil. No duplicar «Chats · Llamar ·
Ajustes»: quedan dentro de Comunicaciones. Mantener #06080C, #9CC3E4 e IBM Plex Sans. PC intacto.
