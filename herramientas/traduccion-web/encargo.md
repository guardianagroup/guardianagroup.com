# Encargo de traducción (GUARDIANA, web Órbita)

Entrada: `faltan.json` en esta carpeta: lista de {id, es, en}. El español es el original; el inglés es una referencia.
Salida: para cada idioma asignado, escribe `salida/<código>.json` con la forma {"<texto español exacto>": "<traducción>", ...}
— una entrada por cada uno de los 366 textos, con la clave copiada EXACTA del campo "es" (mismos espacios, comillas «», signos).
Escríbelo con un script de Python (json.dump con ensure_ascii=False), no a mano, para no romper el JSON.

Reglas (del dueño, obligatorias):
- Traducción natural y precisa, registro claro y directo (como un buen producto de seguridad), tuteo donde el idioma lo admita sin sonar raro.
- «encriptado/encriptar» → el término común de «encrypted» en ese idioma (nunca un término que suene a «codificado» vago).
- No traducir nombres propios ni marcas: GUARDIANA, ZERO, SECURE, NÚCLEO, Windows, WireGuard, WireGuardNT, Microsoft Defender, Prebid, ML-KEM-768, Filtering Platform, DHCP, VPN, USB, PDF, hosts, IA→ el término local de «AI».
- Nombres de sección ya fijados: «Órbita» como se usa ya en ese idioma (fr Orbite, de Orbit, ja 軌道, ar المدار…; si no lo sabes, la traducción literal de «órbita»); «Antivirus» → la palabra usual de «antivirus»; «Tu PC» → «Tu PC» traducido.
- No añadir ni quitar información, no inventar cifras, no añadir promesas. Nada de «auditada», «certificada», «anónima».
- Mantén comillas, signos, números, unidades, flechas (→), puntos medios (·) y espacios iniciales/finales tal cual.
- Si un texto termina en espacio (p. ej. «No se pudo. »), la traducción también.
- Árabe, persa, hebreo y urdu: texto normal (el navegador pone la dirección); números en cifras occidentales.
- Chino simplificado (zh), tradicional de Taiwán (zh-tw), portugués de Portugal (pt-pt, no brasileño), noruego bokmål (nb), filipino (fil).

Al terminar, comprueba con un script que cada archivo tiene las 366 claves exactas y que no hay valores vacíos, y responde
solo: idiomas hechos y cualquier duda real (máximo 5 líneas).
