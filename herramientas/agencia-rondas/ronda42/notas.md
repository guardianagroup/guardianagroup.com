# Ronda 42 · Quién está detrás de cada dominio (111 dominios) · cruce

26 Oct 2026, 08:35–09:05 (Bogotá). Voces: ChatGPT («Alta», con web; pensó 5 min; `chatgpt.md`), Gemini (Argon «Alto», con web; `gemini.md`), Astra 6 (`astra.md`, cortado por el límite de 4.096 tokens en «trafficjunky.net»: 94 de 111). Pregunta: `pregunta.txt`. Cruce automático: `scratchpad/r42_cruce.py` → `zero-motor/datos/dominios-agencia.json`.

## Regla aplicada

- Entra un dominio cuando **al menos dos voces coinciden en la empresa** (vale el nombre principal o el de entre paréntesis: «Alphabet (Google)» ≈ «Google»; «IPONWEB (BidSwitch)» ≈ «Criteo (BidSwitch)» → BidSwitch). El nombre que se guarda es el más corto en que coinciden.
- **País de la sede: Wikidata (CC0)** cuando existe el ítem de la empresa (consulta SPARQL del 26 Oct 2026 por la web oficial, P856 → P17/P297 y P159 para la ciudad): 48 empresas. Si no hay ítem, el país en que coinciden dos voces: 24 empresas. Sin país por ninguna vía, el dominio no entra.
- Resultado: **107 dominios, 72 empresas**. Ninguna contradicción entre el país de dos voces y el de Wikidata.

## Fuera (y por qué)

- `unpkg.com` (solo Gemini: «unpkg», probable), `popads.net` (solo Gemini: «Tomksoft», probable), `polyfill.io` (Gemini y Astra: «Funnull», sin país en ninguna voz ni en Wikidata).
- Astra no llegó a 17 dominios (de trafficjunky.net a line.me): entran por ChatGPT + Gemini.

## Dudas resueltas con dos voces (apuntadas por si cambian)

- `outbrain.com` → se guarda «Outbrain» (Gemini) aunque ChatGPT y Astra ponen «Teads (Outbrain)»: Outbrain compró Teads en 2025 y adoptó su nombre; Wikidata (Q28872999, teads.com) da sede en Nueva York, EE. UU.
- `bidswitch.net` → «BidSwitch», Francia (Criteo compró IPONWEB en 2022; ChatGPT y Astra dicen Criteo/FR, Gemini IPONWEB/GB).
- `sharethrough.com` → «Sharethrough», Francia (Equativ, Wikidata Q120967874, París; Gemini decía Canadá).
- `33across.com` → «33Across», EE. UU. (ChatGPT: «WealthStage (33Across)»; Astra: «TripleLift (33Across)»: no coinciden en la matriz, sí en 33Across).
- `livechatinc.com` → «Text», Polonia (tres voces PL; Wikidata tiene «Text, Inc.», Boston, que parece la filial: se mantiene PL).
- `trafficjunky.net` → «Aylo», Canadá según Wikidata (Q1250111; ChatGPT decía LU, Gemini CY).
- `media.net` → Emiratos Árabes Unidos según Wikidata (Q24885109, Dubái; ChatGPT decía US, Gemini AE).
- `smartlook.com` → «Cisco» (compró Smartlook en 2023); `drift.com` → «Salesloft» (2024); `piwik.pro` → «Cookie Information», Dinamarca (2024); `sharethis.com` → «Predactiv» (nuevo nombre de ShareThis); `segment.io` → «Twilio»; `krxd.net` → «Salesforce»; `bluekai.com` y `addthis.com` → «Oracle».
- `analytics.tiktok.com` y `tiktok.com` → «ByteDance», China (Wikidata Q55606242, Pekín): la sede del grupo, no la filial europea (TikTok Technology, Irlanda).

## Qué cambia en ZERO

`zero-motor/empresas.js` carga `datos/dominios-agencia.json` después de la base de ESPEJO: `www.google-analytics.com`, `static.criteo.net`, `www.facebook.com`, `cdn.cookielaw.org`, `analytics.tiktok.com`… salen ya con empresa y país, y la ficha dice de dónde viene cada dato («agencia GUARDIANA, dos voces · país: Wikidata (CC0)»). Cuando el motor se publique, `terminos.html` §6 tendrá que citar: EasyList/EasyPrivacy, listas de uBlock Origin, malware-filter (CC0), Wikidata (CC0) y esta base de la agencia.
