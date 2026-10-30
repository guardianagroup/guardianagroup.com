# Astra 6 (gpt-6-astra), ronda 84

Dictamen: el texto 1 es esencialmente correcto, pero debe precisar que cambia la clave de la capa adicional. El 2 resulta ambiguo: no identifica qué cambia. El 3 es excesivo: una discrepancia puede deberse a desincronización o errores, no necesariamente a una interceptación.

La coincidencia tampoco garantiza ausencia de intermediarios: seis cifras ofrecen una comprobación limitada, cuya seguridad depende del protocolo y del modo de comparación. Deben compararse códigos del mismo intervalo.

Además, HKDF no introduce secreto nuevo: quien obtenga una clave podrá derivar las siguientes. Borrar las anteriores no corrige ese compromiso. La procedencia post-cuántica tampoco acredita por sí sola la identidad del interlocutor.

Textos propuestos

1) «La clave de la capa adicional de cifrado de audio y vídeo se renueva cada minuto. Código del intervalo actual: 482 917. Compárelo con el de la otra persona para ese mismo intervalo.»

2) «La clave se renueva cada minuto. Comparen los códigos del mismo intervalo.»

3) «Si los códigos no coinciden, no den por verificada la llamada. Puede existir un error o una interceptación. Interrumpan el intercambio confidencial y compruébenlo por un canal independiente autenticado.»
