# Ronda 68 · Astra 6 (gpt-6-astra, Cheaper Inference) · el viaje del archivo en Comunicaciones y elegir la ruta

27 Oct 2026, ~19:00 (Bogotá). Playground de Cheaper Inference (pregunta resumida, solo información del producto; tope de 4.096 tokens de salida). Lo esencial, fiel. Astra avisa de que no tiene navegación en esta conversación: da fundamentos y fuentes primarias, y marca lo que no ha podido comprobar.

1. **Dictamen:** sí al viaje verificable; no a vender un recorrido que no podemos observar. Nunca «cruzó exactamente este cable», «no pasó por ese país» ni «detectamos todos los ataques».
2. **Qué se mide** (cliente, receptor y nuestros TURN):
   - tamaño, separado de los bytes encriptados y del transporte;
   - avance confirmado por la app receptora (meter datos en cola no es entregarlos);
   - velocidad útil, tiempo restante (estimado), par ICE, RTT, receptor autenticado.

   En RTCDataChannel no reutilizar las métricas RTP de audio y vídeo; confirmaciones por bloques y comprobación final de integridad dentro del protocolo encriptado. Fuentes: W3C WebRTC Statistics, W3C WebRTC, RFC 8656 (TURN).
3. **Traceroute, ASN, país, satélite y distancia:**
   - el traceroute del relé no es el itinerario del archivo;
   - el ASN no identifica al dueño físico del router;
   - la geolocalización es una inferencia: con licencia (MaxMind, IPinfo), mostrando proveedor, fecha y confianza, sin porcentajes inventados;
   - un ASN satelital es una pista, no una prueba;
   - el RTT no se convierte en kilómetros recorridos: solo da límites físicos.
4. **Lo que no se verá:** el cable concreto, todos los países, las escuchas pasivas, la causa exacta de una pérdida, la posición del destinatario. La infraestructura de Órbita, rotulada «infraestructura de contexto; uso por esta transferencia no verificado».
5. **Elegir la ruta, cuatro niveles:**
   1. un relé autorizado (solo relé, verificando el candidato);
   2. una cadena gestionada propia (exige transporte y operación adicionales);
   3. transporte contratado con compromisos de recorrido;
   4. redes con caminos explícitos, como SCION, solo dentro de su ecosistema.

   Admisible: «Procesamiento de relé limitado a ubicaciones aprobadas». No: «El archivo nunca atravesó otros países».
6. **SCION y SSFN** (caso sectorial suizo de SIX, no una red abierta; condiciones de acceso actuales: no lo sabe), **Alibi Routing** (Levin y otros, SIGCOMM 2015: evidencia bajo un modelo, no certificación), **DeTor** (no lo puede verificar), **velocidad de la luz** (excluye desvíos imposibles, no da una ruta) y **Tor** (anonimato; elegir países de nodos no elige los países transitados).
7. **Multicanal:**
   - **XOR** con máscara aleatoria: una parte sola no revela nada; duplica el volumen;
   - **Shamir:** mejor repartir la clave que el archivo entero;
   - **límite:** dos canales pueden compartir operador o cable, y un dispositivo comprometido ve el contenido.

   Defensa adicional, no sustituto del encriptado de extremo a extremo.
8. **Señuelos («fuegos artificiales»):** reducen algo de información de tamaño y tiempos; no ocultan quién se comunica. Cuestan batería y tráfico y pueden crear patrones. No presentarlos como protección si no están implementados y evaluados.
9. **Anomalías:** cambio de par ICE, relé o IP; RTT y pausas; cambios BGP; RPKI (valida el origen, no el camino). «Anomalía correlacionada», nunca «ataque confirmado». Fuentes: RFC 6811, RIPE RIS.
10. **Pantalla:** visualización en tiempo real, no «vídeo del recorrido». MEDIDO / ESTIMADO / ILUSTRATIVO, cada dato con origen, hora y alcance; tramos desconocidos discontinuos. Un informe firmado acredita nuestros registros, no convierte una inferencia en verdad.
11. **Plan superior: «Comunicaciones · Envío verificable empresarial».** Relés aprobados, sin salida alternativa silenciosa (si no hay camino permitido, se detiene el envío y se explica), evidencias de entrega, diagnóstico y soporte.
    - **Fases:**
      1. auditoría;
      2. métricas y panel honesto;
      3. selección de relés;
      4. piloto multicanal, transporte contratado y SCION;
      5. evaluación independiente.
    - **Precio:** no lo sabe sin volúmenes. No decir «número uno» sin una comparación demostrable.
12. **Ley:**
    - IP, metadatos y rutas pueden ser datos personales; mostrar la IP del otro es divulgarla;
    - minimización, roles, retención limitada;
    - Ley 1581 y RGPD (base jurídica, encargados, capítulo V, posible evaluación de impacto).

**Recomendación final:** cobrar más por controles efectivos y evidencia delimitada, no por hacer visible un trayecto que Internet no permite demostrar.
