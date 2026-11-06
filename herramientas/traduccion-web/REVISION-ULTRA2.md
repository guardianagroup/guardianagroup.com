# Revisión independiente: traducción de Comunicaciones Ultra (rama `traduccion-ultra`)

Revisor: segunda voz (Claude), 6 nov 2026. Solo lectura: no he tocado ningún worktree, ni he hecho commits, pushes ni `git stash`.
Rama revisada: `beb091a0` (8 commits sobre `51d52f99`); `origin/main` = `602e5125` (solo añade `herramientas/TRASPASO-5NOV.md`). El remoto `traduccion-ultra` ya está en `beb091a0`.

## Veredicto: GO con condiciones

La tanda es de buena calidad. Están las 156 claves en los 39 idiomas, la parte técnica está limpia y no hay palabras prohibidas ni promesas nuevas. Sí hay que corregir 8 cadenas antes de publicar (sección 1) y cerrar dos puntos de coherencia que la tanda deja a la vista (sección 2).

---

## 1. Errores que hay que corregir antes de publicar

| Idioma | Id | Dice ahora | Debería decir | Por qué |
|---|---|---|---|---|
| de | u2-101 | «Ein darauf trainiertes Stimmerkennungssystem täuscht sie nicht, und sie verbirgt …» | «Ein darauf trainiertes Stimmerkennungssystem lässt sich davon nicht täuschen, und sie verbirgt …» | Se entiende al revés: el sistema pasa a ser sujeto («un sistema entrenado no la engaña»). Es un texto de límites de seguridad. |
| de | u2-093 | «…; ein darauf trainiertes Stimmerkennungssystem täuscht sie nicht, und sie verbirgt …» | «…; ein darauf trainiertes Stimmerkennungssystem lässt sich davon nicht täuschen, und sie verbirgt …» | El mismo error. En el mismo texto, «kann dich unter wenigen Kandidaten treffen» debería ser «… richtig erkennen», y «dich am Gehör zu erkennen» debería ser «dich nach Gehör zu erkennen» (lo mismo en u2-101 y u2-152). |
| bg | u2-004, u2-149, u2-150, u2-151 | «някой е можело да е по средата.» | «някой може да е бил по средата.» | No concuerda («някой» con el participio neutro «можело») y no es idiomático. Las variantes en presente (u2-010/011/012, «Някой може да е по средата») están bien. |
| fr | u2-091 | «… et elle n’exige d’envoyer rien par un autre canal.» | «… et elle n’exige de rien envoyer par un autre canal.» | Orden incorrecto de «rien» con el infinitivo. |
| ro | u2-072 | «deși browserul și biblioteca pot fi făcut copii care nu se șterg» | «deși browserul și biblioteca pot să fi făcut copii care nu se șterg» | Gramática: falta el subjuntivo perfecto. |

Son 8 cadenas en 4 idiomas. Basta con cambiarlas en `salida/<l>.json` y en `orbita/static/i18n/<l>.json`.

## 2. Condiciones de coherencia (no son fallos del traductor, pero la tanda las deja a la vista)

**A. Nombre de la versión gratuita (duda 1).** Lo he comprobado con Playwright en de, ja y ar. La tarjeta gratuita y la cabecera de la tabla de versiones dicen **«Shielded»** (inglés) porque `idioma.js`, cuando una clave no tiene traducción, cae al inglés. Al lado, los textos nuevos dicen «Abgeschirmt», «防護モード» o «الوضع المحصّن». En la tabla de comparación (captura `q_ar_tabla.png`) se alternan filas en inglés y filas en árabe.
- **Mínimo para publicar:** añadir a los 39 idiomas las claves «Blindada» y «Blindada y Ultra», con el mismo nombre que ya usan los textos nuevos (tabla de la sección 4, duda 1).
- **Muy recomendable en la misma subida:** hay otras 24 claves de la misma página sin traducción en ninguno de los 39 idiomas, que también salen en inglés: «Dos versiones», «próximamente», «Modo Ultra», «Código de seguridad», «Código de seguridad en la llamada.», «Encriptación de extremo a extremo con acuerdo de claves postcuántico», «Llamadas y videollamadas por los relés de GUARDIANA: ninguno ve la IP del otro», «Dos relés de operadores y países distintos: ninguno ve las dos direcciones IP», «Llamadas, videollamadas y Ultra», «En la Blindada, desde la conversación. …», «El código de seguridad no sale en la pantalla: …», «Cada mensaje, foto, archivo y llamada se cierra con claves …», «Cualquier archivo, tal como está», «De la cámara o de la galería, sin datos ocultos», «Una sola vez, cuando la confirmes», «Foto recibida», «Compartir pantalla», «Flotante», «En la ventana flotante», «Toca aquí para traer la imagen», «Toca para ver y oír la llamada», «Volver al PC», «¿Te han enviado un enlace de invitación? Ábrelo directamente o pégalo aquí.» y «Lo recibido se borra de este equipo al terminar la llamada, salvo lo que guardes.».

**B. «Comprobante» en ja, zh-tw, ko y th (duda 2).** Los 17 textos nuevos usan 受領証, 收據, 확인서 y หลักฐาน. Las cadenas que ya existían del mismo flujo (diálogo del comprobante y página de verificar) siguen con 証明書, 憑證, 증명서 y ใบรับรอง: unas 48 en ja, ko y th y 57 en zh-tw. Hay que elegir una de las dos opciones antes de publicar:
- **Propuesta:** pasar las existentes al término nuevo. Es un reemplazo mecánico; en coreano 증명서 y 확인서 terminan igual (서), así que las partículas no cambian. Hay que excluir las dos cadenas de ZERO («Cada respuesta lleva su comprobante.» y «Prototipo: …»), que son otro concepto.
- **Alternativa:** volver a poner el término viejo en los 17 nuevos y hacer el cambio más adelante.

## 3. Mejoras recomendadas (no bloquean)

- **fr: «accusé» sin complemento** en u2-082 («un accusé apparaît»), u2-087 («l’accusé est niable»), u2-108, u2-116, u2-118 y en el segundo «accusé» de u2-072. Solo, «accusé» se lee como «el acusado». Mejor «accusé de remise», que es la etiqueta que ya existe para «Recibo de entrega».
- **Etiquetas citadas que no coinciden con la interfaz** (u2-046 y u2-072):
  - «escribiendo…»: nl «typt…» (en la interfaz, «Aan het typen…»), id «sedang mengetik…» («Mengetik…»), hi «टाइप कर रहे हैं…» («लिख रहे हैं…»), ur «ٹائپ کر رہے ہیں…» («لکھ رہے ہیں…»).
  - «leído»: ar «تمت القراءة» («مقروءة»), he «נקרא» («נקראה»), hu «olvasva» («Elolvasva»), vi «đã đọc» («Đã xem»), ta «படித்தது» («படிக்கப்பட்டது»), hi «पढ़ लिया» («पढ़ा गया»), ur «پڑھ لیا» («پڑھ لیا گیا»).
  - «próximamente» (u2-097): hoy la clave en minúscula no está traducida y la tabla muestra «coming soon». Al añadirla, hay que usar la misma palabra que la cita.
  - El resto de etiquetas citadas coinciden exactamente en los 39 idiomas («No coinciden», «Encriptada de extremo a extremo», «Solicitar comprobante firmado», «Mostrar», «Descartar», «Borrar y salir», «Destruir», «Tengo un código», «PC con GUARDIANA», «navegador del PC»).
- **ko, registro:** los textos existentes de Comunicaciones van sobre todo en 해요체 (358 frente a 148 en ‑니다). Los nuevos van en ‑습니다 (94 frente a 12). En los avisos cortos conviene igualarlos.
- **Terminología menor:**
  - Relleno (padding): ru/uk «заполнение» → «дополнение»; pt-pt «enchimento» → «preenchimento».
  - pt-pt u2-043: «despromoção» → «redução da proteção».
  - nl: «Hybride afspraak» y «…-afspraak» → «(hybride) sleutelovereenkomst» (u2-009, u2-072, u2-125).
  - Formantes: ar «المكوّنات الصوتية» → «البواني الصوتية».
  - Muletillas: he «מילות הקישור החוזרות» → «מילות המילוי» (u2-093, u2-113).
  - «acertar entre pocos candidatos»: sk «trafiť» → «správne určiť».
  - «sin tiempo»: it «senza tempo» (u2-113) → «senza scadenza»; hi u2-113 «हमेशा के लिए रख लेने» desplaza el sentido («guardar para siempre») → «बिना समय-सीमा के भेजी गई चीज़ें सहेज लेने».
  - fi u2-094: «koko neuvottelun yli» → «koko neuvottelusta».
  - pl: «wpiąć się pośrodku» se entiende pero suena raro (mejor «wpiąć się w połączenie» o «być pośrodku»).
  - zh «插在中间» es coloquial (mejor «居中介入»).
  - ko: mezcla «오퍼, 응답» → «오퍼, 앤서» o «제안, 응답»; hi «ऑफ़र, जवाब» → «ऑफ़र, आंसर» o «प्रस्ताव, जवाब».
  - ta: «கவச முறை» frente a «கவசப் பயன்முறை», que es lo existente.

## 4. Las 10 dudas del traductor: decisión

1. **«Blindado/Blindada»: se traduce en todas partes, no se deja como nombre propio en español.** El inglés de `idioma.js` lo traduce («Shielded», como nombre y con mayúscula: «Continue in Shielded», «Shielded is free»). El portugués mantiene «Blindada» solo porque es una palabra portuguesa. «Ultra» y «Plus» sí se quedan tal cual porque se entienden en todos los idiomas. Regla: una sola forma por idioma, tomada de la traducción existente de «Blindado», con mayúscula donde la escritura la tenga, idéntica en etiquetas y frases. El traductor ya lo hizo así en las frases. Falta añadir las etiquetas «Blindada» y «Blindada y Ultra» (= «‹forma› y Ultra») con estas formas:
   fr Blindée · de Abgeschirmt · it Blindata · pt-pt Blindada · nl Afgeschermd · pl tryb Pancerny (etiqueta «Pancerny») · ja 防護モード · zh 防护模式 · zh-tw 加固模式 · ko 방탄 모드 · ar الوضع المحصّن · he מצב ממוגן · fa حالت محافظت‌شده · ur بکتربند موڈ · sv Pansrad · da Pansret · nb Pansret · fi Panssaroitu · is Brynvarið · ru Защищённый режим · uk Броньований режим · bg Брониран режим · tr Zırhlı mod · el Θωρακισμένη λειτουργία · cs Pancéřovaný režim · sk Obrnený režim · hu Páncélozott mód · ro Modul Blindat · hr Oklopljeni način · id Mode Berperisai · ms Mod Berperisai · vi Chế độ Bọc thép · th โหมดหุ้มเกราะ · fil Mode na May Kalasag · sw Hali ya Deraya · hi कवच मोड · bn রক্ষাকবচ মোড · ta கவச முறை (o கவசப் பயன்முறை, como lo existente) · te కవచ మోడ్.
2. **«Comprobante»: acepto los términos nuevos.** Evitan «certificado», que en estos idiomas además se confunde con los certificados TLS y roza la prohibición de «certificado». Formas: ja 署名付き受領証, zh-tw 簽署的收據 (si se quiere evitar el matiz de pago, 簽收單), ko 서명된 확인서 (o 수령 확인서), th หลักฐานที่ลงนาม. Condición: unificar las existentes (sección 2B). zh (凭证) y los demás idiomas ya son coherentes.
3. **«Negable»: correcto en los 39.** Se usó el término criptográfico habitual de «deniable»: niable, abstreitbar, negabile, negável, ontkenbaar, zaprzeczalne, 否認可能, 可否认/可否認, 부인 가능, قابل للإنكار, ניתן להכחשה, قابل انکار, отрицаемый/заперечуваний/отричаем, inkâr edilebilir, αρνήσιμο, popiratelné/popierateľné, letagadható, negabil, poreciv, dapat disangkal, boleh dinafikan, có thể phủ nhận, ปฏิเสธได้, maitatanggi, inaweza kukanwa, नकारा जा सकता, অস্বীকারযোগ্য, மறுக்கக்கூடிய, తిరస్కరించదగిన. Se mantiene.
4. **«Compromiso previo»: correcto en los 39** (término de «commitment»): engagement préalable, vorherige Festlegung, impegno preventivo, compromisso prévio, 事前コミットメント, 事先承诺, 사전 커밋먼트, الالتزام المسبق, התחייבות מוקדמת, предварительное обязательство, ön taahhüt, komitmen awal, wcześniejsze zobowiązanie, etc. Opcional: en nl, «vastlegging» → «commitment».
5. **«17 billones» (17×10¹²) está bien en los 39.** Es 2^44 ≈ 1,76×10¹³. fr «17 000 milliards», de «17 Billionen», it «17.000 miliardi», pt-pt «17 biliões», nl «17 biljoen», pl «17 bilionów», ja/zh-tw «17 兆», zh «17 万亿», ko «17조», ar/ur «17 تريليون/ٹریلین», he «17 אלף מיליארד», fa «17 هزار میلیارد», sv/da/nb «17 biljoner/billioner», fi «17 biljoonaa», is «17 billjónir», ru/uk/bg «17 триллионов/трильйонів/трилиона», tr «17 trilyon», el «17 τρισεκατομμύρια», cs/sk «17 bilionů/biliónov», hu «17 billió», ro «17.000 de miliarde», hr «17 bilijuna», id/ms/fil «17 triliun/trilion/trilyon», vi «17 nghìn tỷ», th «17 ล้านล้าน», sw «trilioni 17», hi/bn/ta/te «17 लाख करोड़/লক্ষ কোটি/லட்சம் கோடி/లక్షల కోట్లు». En ja, zh y ko «probabilidad menor que 1/17 billones» es equivalente.
6. **KB, GB y «Esc» en alfabeto latino: correcto.** «Esc» siempre en latino, porque es la etiqueta de la tecla. KB y GB son lo habitual en interfaces técnicas, y la web ya mezcla («MB» y «МБ», «MB» y «ميغابايت»). Opcional, y solo si se armoniza toda la web: ru/uk «КБ/ГБ».
7. **Punto alto griego: correcto.** U+00B7, pegado a la palabra y seguido de espacio, sustituye al «;» (U+0387 se normaliza a U+00B7). No queda ningún «;», que en griego se leería como interrogación. Las 145 cadenas existentes hacen lo mismo. Los separadores « · » del español se mantienen.
8. **Tailandés: correcto.** No hay punto final, los espacios separan cláusulas y «:» sigue la convención de la web (671 en las existentes). El «;» solo aparece en las tres listas técnicas largas (u2-072, u2-116, u2-125); se acepta porque con espacios serían ambiguas. **Telugu: correcto.** Los 166 ZWNJ van todos tras virama (్) y ante consonante, que es el uso estándar para evitar conjuntos en préstamos («డిఫాల్ట్‌గా»). La densidad es la de las cadenas existentes.
9. **Indonesio: «browser» está bien en Comunicaciones.** Las cadenas existentes de Comunicaciones usan «browser» en 36 de 38. «Peramban» queda como nombre de la sección del navegador ZERO. Opcional: igualar las 2 existentes que dicen «peramban».
10. **Suajili «jina la jumla» (nombre genérico): aceptable** (alternativa: «jina lisilotambulisha»). **Filipino «offer/answer» en inglés: correcto.** Son términos SDP y encajan con el registro técnico, igual que «DTLS fingerprint» o «header extension».

## 5. Qué comprobé sin hallar nada

- **JSON:** los 39 `orbita/static/i18n/*.json` son válidos. No falta ninguna clave de `origin/main`, no cambia ningún valor existente y la sección `p` está intacta. Hay +153 claves por idioma (151 de `idioma.js` y 2 de `app.js`) y 0 vacías.
- **Portada:** las 3 claves FNV están en los 39 `i18n/portada/<l>.json`. Se reemplazan exactamente las 3 claves viejas, cuyos textos españoles ya no están en `index.html`, `en/` ni `pt/`. `fuente`, `_claves` y `_usadas` concuerdan con `portada` en los 39.
- **Salidas:** `salida/<l>.json` tiene exactamente las 156 claves «es» y coincide con lo fusionado (solo cambian las comillas, según el estilo de cada idioma).
- **Marcadores, nombres técnicos y forma:** `{n}` intacto; nombres técnicos completos (ML-KEM-1024/768, ML-DSA-87, ECDH/ECDSA P-384/P-256, HKDF-SHA-256/384, AES-256-GCM, FIPS 203/204, RFC 6189/6464, ZRTP, Opus cbr=1/usedtx=0, ssrc-audio-level, DTLS-SRTP, TURN, WebRTC, Encoded Transforms, IndexedDB, localStorage, Web Crypto, EXIF/GPS/ICC/ID3). El único aviso es «ECDH-P-256-Vereinbarung» en de, que es un compuesto alemán correcto. Paréntesis, flechas y espacios iniciales y finales se conservan.
- **RTL y cifras:** ninguna marca de dirección (LRM, RLM, embeddings ni isolates) en ar, fa, he y ur; cifras occidentales en ar, fa, ur, he, hi, bn, th, ta y te.
- **Contenido:** ninguna palabra prohibida ni equivalente en los 156×39. Las únicas coincidencias son negaciones fieles («no es una garantía») o falsos positivos. No aparece CNSA. «Rebaja» no se tradujo como «descuento» en ningún idioma.
- **Términos:** «número de seguridad», «modo estricto» y «No coinciden» coinciden con los ya existentes en todos los idiomas comprobados. «Encriptado» usa el término común de cada idioma. El orden V2 tras «Por eso» está bien en de, nl, sv, da y nb; en is el «Þess vegna:» lleva dos puntos.
- **Versiones:** `?v=` de `idioma.js` sube a `20261105-ultra2-trad` en las 6 páginas que lo cargan: inicio, orbita, comunicaciones, comunicaciones/verificar, multas y zero. `idioma.js` usa ese mismo `?v=` para pedir los JSON. `extension/zero/panel.html` no se sirve en la web. El service worker no cachea traducciones.
- **Huellas:** `orbita/comunicaciones/huellas.txt` cuadra 29/29 con los archivos de la rama.
- **Fusión:** `git merge-tree --write-tree origin/main HEAD` sale limpio (sin conflictos).
- **Playwright** (copia de la rama servida en local):
  - Comunicaciones en de, ja y ar: los 73 textos de la tanda presentes en el HTML salen traducidos (73/73), ninguno en español.
  - ar: `dir=rtl` y maquetación correcta (captura del panel «¿Por qué?» y de la tabla).
  - Sin desbordamiento horizontal a 1280 ni a 390 px.
  - Tarjeta VPN de NÚCLEO traducida en `/orbita/` (de, ja, ar).
  - Portada en fr y zh: los 3 textos nuevos visibles y traducidos, sin errores de consola.
  - Los únicos errores de consola son los WebSocket al relé local, que no corre en esta copia.

## 6. Muestra revisada

- **14 idiomas** (fr, de, it, pt-pt, ja, zh, ko, ar, ru, hi, tr, id, pl, he) × **25 textos**: u2-004, 009, 012, 023, 025, 044, 046, 060, 072, 073, 076, 080, 082, 087, 089, 091, 093, 099, 108, 113, 116, 125, 141, 148, 155. Además, u2-001, u2-002 y u2-137 (limpieza de «nadie puede») en los 39.
- **8 al azar en cada uno de los otros 25** (semilla fija; los ids están en `muestra/azar25_ids.json`):
  - nl 002, 013, 023, 035, 061, 072, 084, 104
  - zh-tw 009, 039, 063, 080, 098, 114, 145, 156
  - fa 004, 058, 077, 084, 099, 116, 141, 142
  - ur 013, 036, 047, 048, 075, 096, 109, 126
  - sv 045, 047, 077, 082, 096, 121, 144, 145
  - da 029, 041, 069, 081, 089, 114, 118, 150
  - nb 030, 053, 054, 063, 064, 098, 130, 155
  - fi 003, 005, 017, 034, 046, 094, 118, 132
  - is 017, 034, 062, 124, 128, 130, 142, 151
  - uk 007, 042, 046, 078, 091, 116, 122, 155
  - bg 004, 054, 055, 083, 087, 104, 130, 148
  - el 007, 038, 052, 056, 060, 077, 088, 089
  - cs 005, 012, 020, 053, 058, 081, 088, 098
  - sk 006, 056, 066, 093, 114, 124, 133, 145
  - hu 036, 055, 076, 099, 107, 114, 133, 150
  - ro 019, 022, 045, 072, 087, 090, 135, 156
  - hr 005, 010, 016, 061, 099, 100, 130, 146
  - ms 023, 041, 045, 097, 127, 139, 144, 148
  - vi 001, 012, 036, 042, 045, 120, 126, 156
  - th 003, 010, 063, 081, 102, 116, 134, 144
  - fil 009, 021, 058, 075, 076, 084, 114, 122
  - sw 010, 038, 043, 067, 073, 078, 139, 152
  - bn 004, 025, 030, 093, 100, 101, 118, 141
  - ta 006, 012, 041, 050, 076, 079, 102, 109
  - te 015, 024, 036, 044, 077, 086, 090, 150
- **Pasadas automáticas en los 156×39:** proporción de longitud frente al inglés, signos, cifras, palabras prohibidas, etiquetas citadas, términos clave y registro (tú/usted).

## 7. Fuera de la tanda (visto de paso)

- **Lema de Comunicaciones en español en todos los idiomas,** también en en y pt. La página dice «… Sin cuentas ni números de teléfono. Nuestro servidor no puede leer lo que escribes.», pero `idioma.js` conserva la versión anterior («Sin cuentas y sin instalar nada»), así que no hay traducción que aplicar.
- **Mezclas que ya existían:** ru (y uk/bg) «идентичность» frente a «личность»; pt-pt «cifrar» frente a «encriptar»; fr «vous» frente a «tu» (los textos nuevos usan «vous» de forma coherente).

## 8. Archivos (todo en el scratchpad)

- Scripts:
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/scripts/tecnica.py`
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/scripts/estructura.py`
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/scripts/prohibidas.py`
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/scripts/muestra.py`
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/scripts/visual.py` a `visual5.py`
- Muestras: `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/muestra/`
- Capturas:
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/q_ar_tabla.png` (tabla mezclada inglés/árabe)
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/p_ar_pc_porque.png`
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/p_de_pc_pro.png`
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/p_portada_zh.png`
  - `/tmp/claude-0/-home-claude/598c721e-3dfe-5661-b133-736ea6904a93/scratchpad/captura_com_de.png`, `captura_com_ja.png`, `captura_com_ar.png`
