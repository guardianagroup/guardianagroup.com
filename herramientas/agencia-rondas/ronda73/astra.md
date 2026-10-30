# Ronda 73 · Astra 6 (gpt-6-astra, Cheaper Inference) · Número GUARDIANA

29 oct 2026, 21:47. Texto copiado entre «ASSISTANT OUTPUT» y «Response headers». Se cortó en el bloque 8 (tope de 4.096 tokens del
playground); los bloques 9, 10 y la recomendación final van en una segunda petición (astra-2.md).

## 0. Qué cumple el requisito

C no lo cumple: un desconocido puede provocar una solicitud y un aviso. «Aceptar/Rechazar» impide entrar directamente al chat, pero no evita el contacto no deseado.

M es la opción adecuada: escribir un número no produce mensajes, solicitudes ni llamadas al destinatario. Solo la autorización mutua abre el chat.

La promesa honesta es: «Solo podrán hablarte los números que tú también hayas añadido», no «ningún desconocido»: alguien puede engañar a la persona para que lo añada.

Fallos que corregir en M:

- Semilla estática: repetiría sala y secretos iniciales. Utilicen ECDH estático únicamente para proteger un intercambio firmado de valores aleatorios nuevos; de ese intercambio sale una semilla distinta para cada establecimiento. Vinculen firmas y derivación a ambas identidades, números, versión y establecimiento. Después, mantengan el protocolo híbrido existente.
- Esto no da secreto hacia adelante al intercambio inicial: comprometer posteriormente una clave estática puede revelar ese intercambio grabado. La seguridad de las sesiones posteriores requiere analizar el protocolo completo.
- El servidor conoce intentos y parejas; M no oculta el grafo.
- Perder la identidad rompe el acceso, aunque el número siga registrado.
- Una intención antigua no debe autorizar indefinidamente: caducidad y cancelación visibles.

Para personas mayores: «Para hablar, los dos deben guardar el número del otro». Es comprensible, pero hay que probarlo con usuarios; la espera será el principal tropiezo.

## 1. Número mundial

Recomiendo 12 cifras totales: 11 aleatorias y una de control Damm, permitiendo ceros iniciales y tratándolo siempre como texto.

| Cifras totales | Capacidad con un control | Ocupación con 8.000 millones |
|---|---:|---:|
| 9 | 100 millones | Insuficiente |
| 10 | 1.000 millones | Insuficiente |
| 11 | 10.000 millones | 80 % |
| 12 | 100.000 millones | 8 % |

Con 10.000 millones registrados, la ocupación sería del 10 %. Estas densidades cuentan números válidos; un atacante puede calcular el control.

Formato: NNN NNN NNN NNN, bajo el rótulo «Número GUARDIANA · No es un teléfono». Sin prefijo +57, sin enlace tel:. Aceptar pegado con espacios y conservar ceros iniciales.

Damm detecta errores de una cifra y transposiciones adyacentes; no todos los errores. Verhoeff también sirve; Luhn deja escapar algunas transposiciones. El control evita equivocaciones, no spam.

La asignación debe ser aleatoria criptográfica, transaccional y con comprobación de unicidad. «Nunca reutilizado» exige conservar números retirados y copias del registro. La capacidad cuenta todas las asignaciones históricas, no solo usuarios activos: no es infinita.

## 2. Revisión de A–D

A. Bien encaminado. El reto debe ser único, caducar y vincular ambas claves públicas y la operación. Vincular el número exclusivamente a una clave de dispositivo dificultaría recuperación y multidispositivo.

Además, aunque no haya formulario de cuenta, sí existe un registro técnico seudónimo. Mejor decir «sin teléfono, correo ni contraseña».

B. «Nada más» no describe M: también habrá intenciones, autorizaciones, bloqueos, dispositivos y estados de revocación. Separar:

- Registro estable del número.
- Claves y dispositivos autorizados.
- Buzones, suscripciones y datos temporales.

El servidor ve IP, horas, tamaños, conexiones, consultas y parejas, aunque no los guarde. Revisar también registros de proxy, alojamiento y servicios de avisos. El operador puede correlacionar directorio y salas del relé: no afirmar que toda GUARDIANA solo conoce bytes anónimos.

Reducir: retención corta, sin analítica publicitaria, registros depurados, avisos genéricos y límites de acceso administrativo. Los proveedores push reciben sus propios metadatos.

C. Además de incumplir el requisito, facilita enumeración mediante entrega de claves. Para mostrar el nombre cifrado, B debe descifrar la solicitud antes de aceptarla; aceptar autoriza la conversación, no el primer descifrado. Firmar destinatario, remitente, semilla, caducidad e identificador; impedir repeticiones.

D. Necesario, insuficiente contra múltiples identidades. Un tope global por destinatario permite que atacantes lo llenen y bloqueen contactos legítimos.

No añadiría ahora hashes simples de números: el espacio se puede recorrer. Un HMAC ayuda frente al robo aislado de la base, no frente al operador. Sealed sender puede reducir ciertos metadatos de transporte, pero no oculta las parejas que M necesita reconocer. Pruebas de trabajo añaden consumo y fricción; no son la primera defensa.

Los sobres actuales del PC y sus diez minutos de vida son otro mecanismo: no reutilizarlos como directorio permanente.

## 3. Identidad y servidor malicioso

El número identifica una identidad criptográfica, no demuestra que sea María. El nombre mostrado es una declaración del remitente.

Si el servidor sustituye claves desde el primer encuentro, puede intentar interponerse. La prueba de posesión al registrar no evita que el propio directorio mienta después.

Mínimo:

- Fijar localmente las identidades aceptadas.
- Mostrar cambios y detener la confianza automática.
- Ofrecer «Verificar contacto», comparando QR o número de seguridad personalmente o por un canal independiente.
- Firmar el intercambio completo y vincular ambas partes.
- Más adelante, transparencia de claves con auditoría y mecanismos contra vistas diferentes del directorio.

No basta con mostrar un número de seguridad durante la llamada. Debe representar las identidades y claves pertinentes, y las personas tienen que compararlo por un medio que el atacante no controle. Compararlo únicamente dentro de la misma comunicación sospechosa no ofrece esa garantía.

## 4. Pérdida, borrado y recuperación

Las claves actuales son no exportables: una copia cifrada no permite exportarlas mágicamente. Tampoco unas palabras creadas después pueden reconstruirlas.

Opciones honestas:

- Sin recuperación: número nuevo; el anterior queda retirado, nunca asignado a otro.
- Con recuperación diseñada desde ahora: secreto independiente, por ejemplo 12 palabras aleatorias correctamente implementadas, cuya autoridad pública quede registrada. Permite autorizar claves nuevas, revocar las perdidas y conservar el número. No recupera automáticamente chats ni claves antiguas.

Recomiendo una tarjeta de recuperación en papel, con ayuda guiada y confirmación de que se guardó fuera del móvil. Quien la tenga podría apropiarse del número. Sin teléfono ni correo, el soporte no dispone de una forma sencilla de distinguir al dueño de un impostor.

No anunciar «para siempre». Texto: «Tu número es estable. Para recuperarlo si pierdes este móvil, guarda tu tarjeta de recuperación».

Diseñar el borrado descrito como pérdida de identidad. No extrapolar comportamientos de almacenamiento a todas las versiones. Push en iPhone requiere las condiciones indicadas desde iOS 16.4; en Android, WebAPK no es requisito universal para Web Push: depende del navegador y configuración.

## 5. Preparación multidispositivo

Separar desde hoy:

Número → autoridad de identidad → dispositivos autorizados.

Cada dispositivo tendrá claves, identificador, permisos y revocación propios. El futuro QR deberá iniciar un enlace temporal, aprobado por un dispositivo autorizado, y certificar el nuevo equipo; no copiar claves no exportables.

Prever versión del registro, avisos por dispositivo y cambios firmados. Compartir número no implica compartir una única clave.

Asimismo, «el chat queda para siempre» no equivale a conservar su historial: hacen falta almacenamiento, copias y sincronización. El relé actual no garantiza entrega indefinida a equipos desconectados.

## 6. Abuso y referencias de otras aplicaciones

Para el piloto de M, límites iniciales, revisables con datos:

- 10 números nuevos por hora y 30 por día por identidad.
- 100 intenciones sin pareja, con caducidad de 7 días.
- Una intención por pareja; repetirla no amplía automáticamente su vida.
- Como umbral secundario: 100 altas de identidad o 300 nuevas intenciones por IP/día activan controles adicionales, no un bloqueo indiscriminado: hay redes compartidas.
- Número inexistente: misma respuesta, sin claves ni aviso. No conservar una autorización que pueda activarse si ese número se asigna posteriormente.
- Avisos solo tras pareja mutua; notificación no garantizada, estado consultable al abrir.
- «Bloquear» corta mensajes y llamadas; sin aviso al bloqueado.
- «Denunciar» permite compartir voluntariamente mensajes seleccionados, explicando que saldrán del ámbito privado.

La creación masiva de identidades sigue siendo un problema; limitar únicamente por conexión es fácil de eludir. Evitar diferencias evidentes de tiempos y respuestas que revelen registros.

Qué copiar:

- Signal: usernames para iniciar contacto sin compartir teléfono; su sufijo numérico es un discriminador, no una cifra de control. El registro sigue utilizando teléfono en el modelo documentado.
- Threema: ID de ocho caracteres y verificación por QR.
- Session: identificador de 66 caracteres hexadecimales, sin teléfono obligatorio; demasiado largo para dictarlo.
- WhatsApp: bloqueo, denuncia y enlace de dispositivos; su modelo tradicional usa teléfono.
- Telegram: usernames, controles de contacto y antispam; un username público también facilita descubrimiento.

No he verificado cambios de estas funciones en octubre de 2026, especialmente usernames de WhatsApp o restricciones según versión. No lo sé con precisión actual.

## 7. Nombre y obligaciones legales

Usaría «Número GUARDIANA». «ID» resulta menos familiar; «código» parece temporal.

Llamarlo número no lo convierte automáticamente en numeración telefónica E.164. Tampoco evita regulación por llamarlo ID: importan el servicio, países, interconexión y actividad real. No usar indicativos internacionales ni insinuar llamadas a teléfonos o emergencias. Requiere revisión jurídica colombiana y de mercados objetivo; la clasificación europea también merece análisis.

Número, claves públicas, IP y suscripción push pueden ser datos personales, aunque no haya nombre: distinguen o permiten relacionar personas. Son seudónimos, no necesariamente anónimos.

Ley 1581 y RGPD, cuando correspondan, implican finalidad, información transparente, base jurídica o autorización aplicable, derechos, retención limitada, seguridad, contratos con encargados y evaluación de transferencias internacionales. Analizar también incidentes y necesidad de evaluación de impacto.

La conservación de números retirados debe minimizarse y justificarse. No prometer «no guardamos datos personales».

## 8. Pantallas y textos

Alta, dentro de la app instalada

- Título: «Bienvenido a GUARDIANA»
- Texto: «Habla sin dar tu teléfono ni tu correo.»
- Botón: «Crear mi número»
- Después: «Guardar mi recuperación»
- Avisos: «Activar avisos», explicando: «Para enterarte cuando alguien autorizado te escriba o llame».

Tu número

- «Tu Número GUARDIANA»
- Número grande, agrupado.
- «Copiar número»
- «No es un número de teléfono.»
- M: «Para hablar, los dos deben añadir el número del otro.»

Inicio, conforme al dueño: botón «Llamar», que abre teclado. No debe iniciar una llamada a alguien todavía no autorizado.

(cortado aquí por el tope de tokens)
