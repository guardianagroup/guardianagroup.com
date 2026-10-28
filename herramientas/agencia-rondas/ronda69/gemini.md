# Ronda 69 · Gemini · Órbita: el mapa de las amenazas

27 Oct 2026, ~18:00 (Bogotá). Chat de Gemini «Plan técnico y estrategia para navegador ZERO» (el de la ronda 67). Texto completo allí; aquí lo esencial, fiel. Con **❗** van los errores que contradicen la comprobación de Claude con fuentes oficiales (`claude-fuentes.md`) y la respuesta de ChatGPT.

## A) Fuentes y licencias (según Gemini)

- **abuse.ch** (URLhaus, ThreatFox, MalwareBazaar, Feodo): «CC0, uso comercial totalmente libre». **❗ Falso:** la API comunitaria es de uso razonable y el uso empresarial puede requerir la API comercial (Spamhaus). ChatGPT dice lo mismo que Claude.
- **Spamhaus** (DROP, EDROP, Botnet C&C): «uso comercial con licencia de pago». **❗ Mezcla:** DROP se puede usar gratis con atribución (con sus términos); Botnet C&C y DBL sí piden licencia.
- **Shadowserver:** agregados públicos con atribución; feeds en bruto, con acuerdo. (ChatGPT: prohíbe extraer automáticamente sin permiso.)
- **OpenPhish y PhishTank:** versión pública citando la fuente, sin revender. (Más vago que ChatGPT: OpenPhish exige consentimiento escrito; PhishTank remite al acuerdo de Cisco.)
- **Cloudflare Radar:** «ni sus datos ni sus gráficos». **❗ Los gráficos insertables son CC BY 4.0**; los datos de la API, CC BY-NC.
- **Kaspersky, Check Point, Fortinet:** privativos; no extraer ni replicar.
- **DShield:** «restricciones para la redistribución comercial». **❗ Choca con ChatGPT** (usos comerciales permitidos salvo reventa, con atribución): por comprobar.
- **HIBP:** sin país de las víctimas (de acuerdo). **Verizon DBIR e IBM:** contexto. **Surfshark y Comparitech:** sesgados hacia los países que más denuncian; no recomendados.
- **Microsoft, ENISA, FBI IC3:** informes públicos; IC3, dominio público federal. **NCSI:** «datos abiertos». **❗ Uso comercial no confirmado** (ChatGPT).

## B) Cómo enseñarlo

- **Servidor alojado ≠ país atacante:** «Ubicación de la infraestructura de alojamiento (servidor / IP)», nunca «país origen del atacante».
- **Normalizar:** por millón de IP asignadas o de habitantes conectados, o ambos.
- **Periodo y fecha visibles:** «Datos de las últimas 24 horas (Actualizado: …)».
- **Frases:**
  - **Prohibidas:** «el país más peligroso del mundo para navegar», «zona roja de hackers».
  - **Correctas:** «Región con mayor concentración temporal de servidores de alojamiento de URLs maliciosas detectadas por redes abiertas».

## C) Capas útiles

- **Capa propia y anónima de ZERO:** dónde están los servidores de las webs que ZERO ha detenido hoy, solo por dominio e IP de destino, sumado por país («142 bloqueos hoy en servidores alojados en [País X]»). De acuerdo con ChatGPT en que es lo más diferenciador.
- **Con ZERO:** al tocar un país, qué tipo de amenaza predomina.
- **Con Comunicaciones:** marcar zonas de riesgo y configurar la política de rutas. **❗ Límite:** elegir el relé no garantiza el tránsito (ronda 68).

## D) Diseño

- **Colores que propone:** #FF6B6B, #FFD166, #06D6A0. **❗ No son los de GUARDIANA** (coral #E07A6C, ámbar #F0C77F, verde #5CC98A).
- **Leyenda:** rojo (estafas o virus bloqueados), amarillo (alertas recientes), verde («tráfico seguro y verificado»). **❗ El verde promete demasiado;** ChatGPT propone gris para «sin datos suficientes».
- **Frase al tocar un país:** «Los puntos en este país indican dónde están alquilados los ordenadores que usan los estafadores en internet, no sus habitantes.» (La explicación es clara, pero no siempre son equipos alquilados.)
- **Móvil:** tarjeta o lista por regiones con iconos grandes, sin rotaciones.

## E) Ley

- Descartar Cloudflare Radar (NC) y usar abuse.ch (**❗ no es CC0**), Phishing.Database (MIT) y datos propios de ZERO.
- **Difamación:** coletilla «Datos correspondientes a direcciones IP geolocalizadas de servidores denunciados en fuentes públicas abiertas, sin implicación de la soberanía ni de los operadores legítimos del territorio».
- **Datos personales:** nunca IP de usuarios ni de víctimas; solo agregados por país o ASN.

## F) Plan y coste

- **Plan:**
  - días 1–3: ingesta de abuse.ch geolocalizada con GeoLite2 local;
  - días 4–6: contador anónimo de bloqueos de ZERO por país de destino;
  - días 7–10: capa en el globo.
- **Coste:** «0 US$/mes». **❗ Depende del error de licencia:** abuse.ch puede requerir pago y GeoLite2 es ambiguo para este uso.
- **Único:** cada punto rojo es una amenaza real que ZERO detuvo. **Humo:** arcos de neón que fingen ataques en directo.
