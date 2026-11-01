# Gemini (modo Tarea), ronda 87 — resumen de sus dos respuestas

Las cifras de este resumen son las que da Gemini; las que no estén en claude.md como comprobadas, no se usan en público.

## Antivirus

- **Idea central:** ningún antivirus une hoy en un solo programa doméstico el DNS de la casa, un grafo de procesos con
  eventos de Windows (ETW), un navegador propio y un vigilante de micrófono, cámara y pantalla, todo sin nube. Esa unión es
  la ventaja de GUARDIANA: «correlación causal» red + proceso + periférico + navegador.
- **Tres metas medibles que propone:** (1) ningún programa que no sea el navegador legítimo lee las contraseñas, cookies o
  claves guardadas del navegador; (2) toda conexión de un proceso debe venir de una consulta DNS de ese mismo proceso, y un
  dominio nunca visto en la casa pedido por un proceso en segundo plano o descargado de internet lo congela y lo explica;
  (3) captura de pantalla, teclado, micrófono o cámara cruzados con el grafo de procesos y la red, para parar espías y
  control remoto.
- **Piezas abiertas:** YARA-X (Rust) para archivos y memoria; listas de abuse.ch (MalwareBazaar, ThreatFox, URLhaus);
  reglas Sigma sobre los eventos; capa (capacidades de un ejecutable); LOLBAS y LOLDrivers; firmas de Detect It Easy;
  proveedor AMSI propio (scripts y .NET antes de ejecutarse); modelo local pequeño (LightGBM en ONNX) para ejecutables.
- **Sin nube:** se pierde la prevalencia mundial instantánea de un archivo nuevo; se compensa con listas firmadas que se
  actualizan a menudo, con la memoria del DNS de la casa («primera vez que la casa habla con esto») y con contención
  automática de lo descargado y sin firmar. Inteligencia compartida solo si la persona la activa.
- **Fases que propone:** 1) modo usuario: YARA-X, listas, Sigma sobre ETW, grafo de procesos, AMSI, cuarentena, cruce con
  el Vigía y el DNS (convive con Defender, sin controlador); 2) modelo local, memoria, señuelos contra ransomware, limpieza
  completa de persistencias; 3) controlador propio (minifiltro y avisos del núcleo de Windows), que exige certificado EV y
  alta en el Partner Center de Microsoft; 4) laboratorio independiente, MVI, ELAM y PPL.
- **Riesgos:** falsos positivos (no bloquear solo por el modelo: contener y bloquear al ver el daño), rendimiento del
  minifiltro, convivencia con Defender, y que un fallo en un controlador firmado lo vuelva peligroso (superficie mínima,
  compilación reproducible).

## VPN

- **Base:** WireGuard en Rust (GotaTun, de Mullvad) dentro del servicio de GUARDIANA; en Windows, el adaptador WireGuardNT
  o Wintun.
- **Postcuántico:** intercambio híbrido (Classic McEliece + ML-KEM) que alimenta la clave precompartida de WireGuard, al
  estilo Rosenpass o del túnel efímero de Mullvad.
- **Contra el análisis de tráfico:** máquinas de Maybenot (lo que usa DAITA de Mullvad): relleno, paquetes señuelo y
  ráfagas deformadas; con un coste de datos que hay que limitar (solo bajo demanda o solo el navegador).
- **Multisalto con operadores distintos:** entrada y salida en proveedores y países diferentes (p. ej. Miami en Vultr →
  Helsinki en Hetzner), como Obscura con Mullvad.
- **Windows sin fugas:** kill switch con Windows Filtering Platform (no con rutas), defensa contra TunnelVision (DHCP 121),
  TunnelCrack (LocalNet y ServerIP), fugas de DNS, IPv6 y WebRTC; DNS de la casa dentro del túnel.
- **Ideas propias:** (1) un proceso que el antivirus marca pierde el túnel al instante; (2) aviso en vivo cuando una app
  habla fuera del túnel, con nombre, huella y destino, y una prueba de fugas que la persona puede lanzar; (3) ruta elegida
  sobre el mapa (en GUARDIANA, con el mapa de Órbita y sus fuentes, no con fuentes vetadas); (4) camuflaje del túnel dentro
  de los relés de llamadas que ya tiene GUARDIANA, para redes que bloquean las VPN.
- **Servidores:** sin disco y con arranque verificado (stboot) en la fase final; claves de los nodos publicadas en un
  manifiesto firmado; credenciales con firmas ciegas para no unir pago y conexión.
- **Fases que propone:** 1) túnel, DNS y escudo WFP (6 semanas); 2) postcuántico, multisalto y aviso de fugas (hasta el
  mes 3); 3) anticensura, defensa contra análisis de tráfico y servidores sin disco (meses 4–5); 4) compilación
  reproducible, auditoría externa y móviles (meses 6–8).
- **Riesgos:** abuso de los nodos de salida (bloquear el puerto 25 y limitar escaneos sin guardar registros), órdenes
  judiciales e incautaciones, coste del tráfico (Vultr cobra el exceso), firma de controladores en Windows, MTU en
  multisalto.
