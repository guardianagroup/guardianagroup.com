# Ronda 25c · Confirmación cruzada de la fibra por tierra de los territorios (24 Oct 2026, 15:40–15:58)

Cada voz recibe las rutas de la otra (las mismas ciudades, en el mismo orden) y devuelve solo lo que respalda con una fuente.

- **ChatGPT («Alta»)** confirma 8 rutas de Gemini, algunas recortadas: HK (Tuen Mun–Tsuen Wan), SG (Jurong–Clementi–Queenstown–Downtown Core), MC, AW (San Nicolas–Oranjestad–Paradera–Noord), YT (Koungou–Mamoudzou), PF (Punaauia–Papeete–Pirae–Arue–Mahina), VU (Blacksands–Port Vila) y BS (Eight Mile Rock–Hawksbill–Freeport–Lucaya). Archivo: `fibra-agencia/chatgpt-troncales-territorios-2.json`.
- **Gemini** ya estaba en Flash-Lite (el límite de su modelo potente se renueva a las 17:47) y solo confirma la ruta de ChatGPT de Mónaco (Fontvieille–La Condamine–Monte-Carlo). Archivo: `fibra-agencia/gemini-troncales-territorios-2.json`.
- **Astra 6** (gpt-6-astra, 15:56) no confirma ninguna de las seis rutas que quedaban, de Curazao, Samoa, Tonga e Islas Salomón: devolvió `[]`.

**Resultado:** entran Hong Kong, Singapur, Aruba, Mayotte, Polinesia Francesa y Bahamas → **187 países**. Mónaco (3,1 km) y Vanuatu (3,4 km) quedan fuera por el límite de 5 km de `fibra_tierra.py`, pendientes de que el dueño diga si se hace una excepción. Curazao, Samoa, Tonga e Islas Salomón siguen sin una segunda voz.
