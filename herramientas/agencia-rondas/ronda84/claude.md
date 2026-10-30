# Revisión independiente (Claude, otro agente sin ver el trabajo), ronda 84

1. Alta: un intermediario con los dos secretos de sesión podía hacer coincidir el código (probar ~10⁶ identificadores de llamada,
   o hacer avanzar la cadena de quien recibe con fragmentos válidos). Arreglo: atar el código al número de seguridad de la llamada
   (compromiso previo) y no enseñarlo sin él; quien recibe no pasa de las llaves que tocan por el tiempo de llamada.
2. Media: «si no coincide, alguien se ha puesto en medio» exagera: puede ser el cambio de minuto; y que coincida solo prueba que
   esta capa tiene la misma llave. Frase: «Si coincide, los dos tenéis la misma llave. Si no, esperad al siguiente; si sigue sin
   coincidir, colgad: puede haber alguien en medio».
3. Media-baja: el secreto hacia atrás es parcial (el secreto de la sesión sigue en la página): no prometerlo en público.
4. Baja: con más de 3 llaves de retraso se perdía la llamada para siempre: usar el límite por tiempo.
Sin problemas: la vuelta 255→0, el avance doble, los fragmentos tardíos, H.264 y que el código no filtra nada de la llave.
