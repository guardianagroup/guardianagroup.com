/* GUARDIANA · Órbita · the planet's real layers (owner, 20 Oct 2026).
   «Cables submarinos», «Cables de tierra» and «Satélites de datos»: three buttons, off by default, so the planet
   stays clean. Everything is real and comes from our own site (orbita/datos, refreshed by a scheduled task):
   satellites from CelesTrak's public orbital elements, positions computed here, now, with SGP4 (satellite.js, MIT);
   cables from OpenStreetMap (ODbL). Nothing invented, no third party contacted by the visitor. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const P = () => window.OrbitaPlaneta;
  const RE = 6378.137, RAD = Math.PI / 180;
  const ACERO = '156,195,228', BLANCO = '244,246,248';
  // 22 Oct 2026, 21:43 (owner): «los cables azules están muy logrados; los blancos de alta potencia no me gustan» — the giants
  // are never white (their light blue gave way to gold on 23 Oct 2026, see SUB_COL); and what the pointer touches
  // lights up in its own colour (brighter and wider), never white either («se resalta en blanco: eso no puede ser»)
  // 23 Oct 2026 (owner, 18:47: «cables submarinos y fibra por tierra se ven del mismo color, que haya un orden»; 19:16:
  // «los submarinos los dejamos igual, pero los de tierra los vamos a segmentar por colores»; chose B, one colour per
  // type, over a copper family): the sea stayed steel (until later that day: SUB_COL); each land-fibre class has its own colour, shown as a legend in its
  // card — gold the great trunks, lavender the long routes, sea green between cities, grey the short links. The smaller
  // classes are drawn a little stronger so their colour reads (FIBRA_ALFA multiplies their opacity, capped at 1).
  const FIBRA_COL = (window.__FIBRA_COL) || { 3: '200,136,88', 2: '196,170,245', 1: '112,222,200', 0: '176,178,190' };
  // data centres in a colour of their own, so they stand out from the white lines and the grey land when zoomed in (owner,
  // 24 Oct 2026, 14:04: «que se distinga más»); not red or coral, which the palette keeps for outages
  const AZUL_CENTRO = '77,166,255';
  // the microwave radio chains of the countries with no land fibre (round 27, owner 24 Oct 2026, 18:43): dotted, in a cool
  // near-white of their own, so they never read as fibre (which is solid and coloured by rank)
  const RADIO_COL = '214,226,240';
  // 25 Oct 2026 (agency round 31, both voices; owner: «publica lo que veas conveniente»): whoever asks their system for
  // less motion gets the lights that run along the cables and the swaying dashes still; satellites keep their real orbit
  const QUIETO = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } })();
  const FIBRA_ALFA = window.__FIBRA_ALFA || { 3: 1, 2: 1.12, 1: 1.35, 0: 1.6 };
  // 23 Oct 2026 (owner: «los cables submarinos también los vamos a clasificar por color… vamos a mantener el diseño, unos son
  // más gruesos, otros menos, pero también van a ir por colores»; «para que no haya tanto colorín, van a ser los mismos
  // colores que tenemos en fibra por tierra»): each capacity class takes the colour of the land-fibre class of the same
  // rank — gold the giants (100 Tbit/s or more), lavender the big ones (20 to 100), sea green the regional ones (under 20),
  // grey when the capacity is not published. Widths, the giants' halo and the dashes of the approximate and planned
  // cables stay as they were.
  const SUB_COL = { gigante: FIBRA_COL[3], grande: FIBRA_COL[2], regional: FIBRA_COL[1], sinDato: FIBRA_COL[0] };
  // Owner, 22 Oct 2026: «cuando la persona abra Órbita, que no salgan los satélites de golpe, se ve demasiado ruido:
  // que abra solo con los cables submarinos, y luego la persona va abriendo y cerrando». So every opening starts with
  // the submarine cables alone; only the view and the orbit filter are remembered between visits.
  // Owner, 22 Oct 2026, 10:41: «cuando la persona abre satélites aparecen todos de golpe; tienen que ser por capas,
  // si no se inunda el globo». So the satellites open with the geostationary ring alone (a few hundred, still), and
  // the person adds the medium and the low orbit one by one; each orbit button is a layer of its own.
  const estado = { sub: true, tierra: false, fibra: false, puntos: false, sat: false, vista: 'equilibrada', orb: { baja: false, media: false, geo: true } };
  try { const g = JSON.parse(localStorage.getItem('guardiana-orbita-capas') || '{}'); if (g.vista) estado.vista = g.vista; if (!['equilibrada', 'todos', 'cielo'].includes(estado.vista)) estado.vista = 'equilibrada'; } catch (_) {}
  const guarda = () => { try { localStorage.setItem('guardiana-orbita-capas', JSON.stringify(estado)); } catch (_) {} };
  // 22 Oct 2026, 21:48 (owner): «le da cables submarinos y se le abre un desplegable y los clasificamos; fibra por tierra lo
  // mismo; centros de datos lo mismo». Every class starts on; the person switches them off one by one (the last main
  // class of a layer cannot be switched off: the layer is switched off instead). Not remembered between visits.
  const CLASES = {
    sub: { gigante: true, grande: true, regional: true, sinDato: true, aprox: true, previstos: true },
    fibra: { principal: true, largo: true, nacional: true, regional: true, radio: true }, // 23 Oct 2026, 18:45 (owner): «En construcción» out — its 8 routes could not be seen anywhere
    puntos: { datos: true, pequenos: true, intercambio: true, estaciones: true }, // 22 Oct 2026, 22:42 (owner: «es un semáforo»): every class is «on = shown», no inverted filters
  };
  const PRINCIPALES = { sub: ['gigante', 'grande', 'regional', 'sinDato'], fibra: ['principal', 'largo', 'nacional', 'regional'], puntos: ['datos', 'intercambio', 'estaciones'] };
  // 22 Oct 2026, 22:48 (owner: «llevo cuatro… se cierra y aún me quedaba uno… no se puede cerrar antes ni después»): the card
  // closes (the layer goes off) only when every switch that shows something is red. «Compañías pequeñas» only refines the
  // data centres, so it counts only while «Centros de datos» is on (otherwise it is greyed out).
  // 23 Oct 2026, 08:11 (owner): «se cierra automáticamente sin dejarme tocar compañías pequeñas». Every switch is its own
  // light and every one counts: «Centros de datos» are the centres of the companies with five or more on the map,
  // «Compañías pequeñas» the rest, so either can be on without the other.
  const cuentaEn = () => true;
  const todasApagadas = (k) => Object.keys(CLASES[k]).every((q) => !CLASES[k][q]);
  // 23 Oct 2026, 08:12 (owner): «cuando borro el último, se cierra la pestaña. Eso no debe pasar… tiene que cerrar el
  // cliente». A layer whose switches are all red goes off on the map, but its card stays open until the person closes it.
  const VACIA = {};
  const esGrande = (q) => !!(PT && PT.porOp && q.o && (PT.porOp.get(q.o) || 0) >= 5);
  // which class a submarine cable belongs to (by its published capacity) and whether it shows now
  const claseSub = (i) => { const c = capacidadDe(i); return !c ? 'sinDato' : c.tbps >= CAP.umbrales.gigante ? 'gigante' : c.tbps >= CAP.umbrales.grande ? 'grande' : 'regional'; };
  const colorSub = (i) => SUB_COL[claseSub(i)];
  // a planned cable has a class only when its file states a capacity in Tbit/s («unos 104 Tbit/s»); grey otherwise
  const clasePrev = (c) => { const m = String((c && c.capacidad) || '').match(/([\d.,]+)\s*Tbit\/s/i); if (!m) return 'sinDato'; const t = parseFloat(m[1].replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')), u = (CAP && CAP.umbrales) || { gigante: 100, grande: 20 }; return !isFinite(t) ? 'sinDato' : t >= u.gigante ? 'gigante' : t >= u.grande ? 'grande' : 'regional'; };
  // 23 Oct 2026 (owner: «la ruta estimada… son unos puntos fijos»): the power lights hold every cable of that power; «Ruta
  // estimada» off hides the cables whose route is approximate, and on by itself (no power light on) shows all of them.
  const sinPotencia = () => !CLASES.sub.gigante && !CLASES.sub.grande && !CLASES.sub.regional && !CLASES.sub.sinDato;
  const veSub = (i, l) => !l.aprox ? CLASES.sub[claseSub(i)] : CLASES.sub.aprox && (CLASES.sub[claseSub(i)] || sinPotencia());
  // a landing shows only while one of its cables is shown (23 Oct 2026: with just the planned cables on, the landings of every other cable stayed as fixed dots)
  const veLlegada = (ll) => !ll.seg || !ll.seg.length || !capas.sub || !capas.sub.lineas || ll.seg.some((j) => { const l = capas.sub.lineas[j]; return l && veSub(j, l); });
  const claseFibra = (l) => l.x.obra ? 'obra' : l.nivel === 3 ? 'principal' : l.nivel === 2 ? 'largo' : l.nivel === 1 ? 'nacional' : 'regional';
  const veFibra = (l) => (!l.x.obra || CLASES.fibra.obra) && CLASES.fibra[l.nivel === 3 ? 'principal' : l.nivel === 2 ? 'largo' : l.nivel === 1 ? 'nacional' : 'regional'];
  const vePunto = (q) => q.t === 'datos' ? (esGrande(q) ? CLASES.puntos.datos : CLASES.puntos.pequenos) : q.t === 'intercambio' ? CLASES.puntos.intercambio : true;
  const claveClases = (k) => Object.values(CLASES[k]).map((v) => (v ? 1 : 0)).join('');

  // ---------- data ----------
  const cargaJSON = async (url) => { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(r.status); return r.json(); };
  const cargaScript = (src) => new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = mal; document.head.appendChild(s); });
  const capas = { sub: null, tierra: null };
  const cargando = {};
  async function cargaCables(clave) {
    if (capas[clave] || cargando[clave]) return;
    cargando[clave] = true;
    try {
      const d = await cargaJSON(clave === 'sub' ? 'datos/cables.json' : 'datos/tierra.json');
      if (clave === 'sub') lugares();
      const lineas = d.cables.map((c) => {
        const w = [];
        c.l.forEach(([lon, lat], k) => {
          const v = P().vec(lon, lat);
          if (k) { // long hops follow the sphere, not a straight chord
            const a = w[w.length - 1], m = Math.hypot(...a), u = [a[0] / m, a[1] / m, a[2] / m];
            const ang = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2]))), n = Math.floor(ang / (2 * RAD));
            for (let j = 1; j <= n; j++) { const s = j / (n + 1), sa = Math.sin(ang), f0 = Math.sin((1 - s) * ang) / sa, f1 = Math.sin(s * ang) / sa; w.push([(u[0] * f0 + v[0] * f1) * 1.003, (u[1] * f0 + v[1] * f1) * 1.003, (u[2] * f0 + v[2] * f1) * 1.003]); }
          }
          w.push([v[0] * 1.003, v[1] * 1.003, v[2] * 1.003]);
        });
        // arc length along the cable (radians of the sphere), for the light travelling inside it
        const acc = [0];
        for (let j = 1; j < w.length; j++) { const a = w[j - 1], b = w[j]; acc.push(acc[j - 1] + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 1.003); }
        return { n: c.n, w, acc, L: acc[acc.length - 1], fase: Math.random(), aprox: !!c.aprox };
      });
      capas[clave] = { d, lineas, nombres: new Set(d.cables.map((c) => c.n).filter(Boolean)).size };
      // cables that do not exist yet (datos/cables-previstos.json: planned, tendered, under construction), drawn
      // dotted and said so in their card; never counted with the ones in service
      if (clave === 'sub') try { const pv = await cargaJSON('datos/cables-previstos.json'); PREV = (pv.cables || []).filter((c) => c.llegadas && c.llegadas.length >= 2).map((c) => { const w = []; c.llegadas.forEach((q, k) => { const v = P().vec(q.lon, q.lat); if (k) { const a = w[w.length - 1], m = Math.hypot(...a), u = [a[0] / m, a[1] / m, a[2] / m]; const ang = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2]))), n = Math.floor(ang / (2 * RAD)); for (let j = 1; j <= n; j++) { const t = j / (n + 1), sa = Math.sin(ang) || 1, f0 = Math.sin((1 - t) * ang) / sa, f1 = Math.sin(t * ang) / sa; w.push([(u[0] * f0 + v[0] * f1) * 1.003, (u[1] * f0 + v[1] * f1) * 1.003, (u[2] * f0 + v[2] * f1) * 1.003]); } } w.push([v[0] * 1.003, v[1] * 1.003, v[2] * 1.003]); }); return { c, w }; }); } catch (_) { PREV = []; }
      // the pieces of one cable are joined and the ends where the open data stop are found once the places are here
      if (clave === 'sub') lugares().then(uneCables).catch(() => {});
    } catch (e) { capas[clave] = { error: true }; }
    cargando[clave] = false; pintaNota();
  }

  // 22 Oct 2026 (owner): «que le salga la ciudad donde está el cable… y en los centros de datos también; si en una
  // ciudad hay varios centros de datos, que se vea claro». One small file: the city of each group of data centres and
  // the nearest city to both ends of every cable (OpenStreetMap + GeoNames). A name only when a real city is close.
  let LUG = null, cargaLug = null;
  // 26 Oct 2026 (review): lugares-capas.json indexes the points of puntos.json by position; if a publication lands between
  // the two downloads they no longer match (a Madrid centre said «Perth»). When the dates differ, the file is fetched again
  // once, fresh from the server.
  const lugares = () => cargaLug || (cargaLug = cargaJSON('datos/lugares-capas.json').then(async (d) => {
    const fechaPt = PT && PT.d && PT.d.descargado, fechaLug = d.generado_desde && d.generado_desde.puntos;
    if (fechaPt && fechaLug && fechaPt !== fechaLug) { try { const r = await fetch('datos/lugares-capas.json', { cache: 'reload' }); if (r.ok) { const d2 = await r.json(); if (d2.generado_desde && d2.generado_desde.puntos === fechaPt) d = d2; } } catch (_) {} }
    LUG = { d, centros: d.centros.map((c) => ({ w: P().vec(c[0], c[1]).map((x) => x * 1.002), ciudad: c[2], cc: c[3], n: c[4], ops: c[5] })), de: d.de || [], cables: d.cables, grupos: d.grupos || [], g: d.g || [],
      // only the ends that reach a real place: an end in the open sea is a joint between segments, not a landing
      llegadas: (d.llegadas || []).filter((l) => l[2]).map((l) => ({ w: P().vec(l[0], l[1]).map((x) => x * 1.003), ciudad: l[2], cc: l[3], seg: l[4] })) };
    LUG.orden = LUG.centros.map((_, i) => i).sort((a, b) => LUG.centros[b].n - LUG.centros[a].n); // the biggest cities get their label first
    return LUG;
  }).catch(() => { LUG = { error: true }; return LUG; }));
  // 25 Oct 2026 (owner, 14:12: «si la persona lo tiene puesto en ruso, tiene que verlo todo en ruso»): the names of these
  // places in the page's language, from GeoNames' own names in other languages (datos/lugares-idioma/<language>.json,
  // herramientas/lugares_idiomas.py). They are swapped in place, keeping the GeoNames names aside, so every label and
  // card reads them already translated; until the file arrives, the GeoNames name.
  let LUGI = null, LUGI_pide = null;
  function lugaresEnIdioma() {
    if (!LUG || LUG.error || !LUG.centros) return;
    const l = (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es';
    if (LUG.lang === l) return;
    if (!LUGI || LUGI.l !== l) {
      if (LUGI_pide !== l) { LUGI_pide = l; cargaJSON('datos/lugares-idioma/' + l + '.json').catch(() => ({ n: {} })).then((d) => { if (LUGI_pide === l) LUGI = { l, n: (d && d.n) || {} }; }); }
      return;
    }
    if (!LUG.orig) LUG.orig = { cen: LUG.centros.map((c) => c.ciudad), lle: LUG.llegadas.map((x) => x.ciudad), gru: LUG.grupos.map((g) => g[1].map((q) => q[0])), cab: (LUG.cables || []).map((e) => (e ? [e[0], e[2]] : null)) };
    const D = LUGI.n, O = LUG.orig, tr = (n, cc) => (n && D[n + '|' + cc]) || n;
    LUG.centros.forEach((c, i) => { c.ciudad = tr(O.cen[i], c.cc); });
    LUG.llegadas.forEach((x, i) => { x.ciudad = tr(O.lle[i], x.cc); });
    LUG.grupos.forEach((g, i) => g[1].forEach((q, j) => { q[0] = tr(O.gru[i][j], q[1]); }));
    (LUG.cables || []).forEach((e, i) => { if (e && O.cab[i]) { e[0] = tr(O.cab[i][0], e[1]); e[2] = tr(O.cab[i][1], e[3]); } });
    LUG.lang = l;
  }
  const paisNombre = (cc) => { if (!cc) return ''; try { const l = (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es'; return new Intl.DisplayNames([l], { type: 'region' }).of(cc) || cc; } catch (_) { return cc; } };

  // ---------- one cable, many pieces; and the ends where the open data stop (23 Oct 2026) ----------
  // Owner, on a photo of an unnamed cable whose card said «Llega a tierra en Fortaleza (Brasil)»: «él llega por la parte de
  // abajo, ahí a Brasil, pero la parte de arriba… hay varios que se quedan ahí como en el mar. ¿Es un error?». It is not a
  // drawing error: OpenStreetMap has those cables traced only part of the way (three of them stop at 15° N, 290 to 520 km
  // from Barbados, the nearest land). Measured on cables.json: of OpenStreetMap's 1,226 piece ends, 342 lie more than 30 km
  // from any coast; 223 of those meet another piece of the same cable, 96 lie beside another cable, and 23 touch nothing
  // within 30 km. After the joins below, 22 ends stay loose and fade out.
  // Done here, at load time, without touching cables.json (red.js and the tools read it as it is):
  //  1. Pieces of one cable whose ends touch or almost touch (JUNTA_KM) are joined: same Wikidata item, same named cable
  //     (the groups of lugares-capas), or an unnamed piece that is the only one continuing another. The few km between
  //     them are closed, the whole cable lights up under the pointer, and an unnamed piece takes the name of the cable it
  //     belongs to (also through a Wikidata item it shares with named pieces). Two differently named cables are never
  //     joined through an unnamed piece.
  //  2. An end of an OpenStreetMap piece that stays loose — no other cable within SUELTO_KM, no city within 80 km (GeoNames,
  //     as lugares-capas measures it), no land within TIERRA_KM on the planet's water mask — on a cable that reaches land or
  //     the network somewhere else, fades out over its last stretch, and its card says that the open data stop there.
  //     Nothing is drawn beyond it. The agency's pieces go from landing to landing and are never marked; nor is a cable
  //     that touches nothing anywhere (an island link such as Flores–Corvo: the mask does not show such small islands).
  const JUNTA_KM = 5, SUELTO_KM = 30, TIERRA_KM = 30;
  let UNION = null;
  // the named cable (lugares-capas group) a piece belongs to: its own, or the one it takes from the pieces it joins
  const grupoDe = (i) => { if (!LUG || !LUG.g) return -1; const g = LUG.g[i]; if (g != null && g >= 0) return g; const u = UNION ? UNION.grupo[i] : -1; return u >= 0 ? u : -1; };
  const cadenaDe = (i) => (UNION && UNION.piezas.get(UNION.raiz[i])) || [i];
  const cadenaSuelta = (i) => cadenaDe(i).some((j) => { const l = capas.sub && capas.sub.lineas && capas.sub.lineas[j]; return !!(l && l.colas); });
  const kmV = (a, b) => { const m = Math.hypot(a[0], a[1], a[2]) * Math.hypot(b[0], b[1], b[2]) || 1; return 6371 * Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / m))); };
  // arc length along a line again, after a point was added to it (the light inside runs on it); its visibility caps go
  const mideLinea = (l) => { const w = l.w, acc = [0]; for (let j = 1; j < w.length; j++) { const a = w[j - 1], b = w[j]; acc.push(acc[j - 1] + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 1.003); } l.acc = acc; l.L = acc[acc.length - 1]; l.caps = l.cap = null; };
  function uneCables() {
    const c = capas.sub; if (!c || !c.lineas || c.unidos) return; c.unidos = true;
    const cab = c.d.cables, n = cab.length, L0 = LUG && !LUG.error ? LUG : null;
    const grupo = (i) => (L0 && L0.g && L0.g[i] != null && L0.g[i] >= 0 ? L0.g[i] : -1);
    const agencia = (i) => !!cab[i].aprox;
    // every end of every piece, by latitude, so the ends near one are a short scan away
    const E = [];
    for (let i = 0; i < n; i++) { const l = cab[i].l; if (!l || l.length < 2) continue; for (let k = 0; k < 2; k++) { const q = k ? l[l.length - 1] : l[0]; E.push({ i, k, id: 2 * i + k, lat: q[1], v: P().vec(q[0], q[1]) }); } }
    E.sort((a, b) => a.lat - b.lat);
    const cerca = new Map(), dLat = JUNTA_KM / 111 + 1e-6; // end id → [[end, km], …] of other pieces within JUNTA_KM
    const anota = (p, q, d) => { if (!cerca.has(p.id)) cerca.set(p.id, []); cerca.get(p.id).push([q, d]); };
    for (let a = 0; a < E.length; a++) for (let b = a + 1; b < E.length && E[b].lat - E[a].lat <= dLat; b++) { const p = E[a], q = E[b]; if (p.i === q.i) continue; const d = kmV(p.v, q.v); if (d <= JUNTA_KM) { anota(p, q, d); anota(q, p, d); } }
    const porId = new Map(E.map((q) => [q.id, q]));
    const mismo = (i, j) => (cab[i].w && cab[i].w === cab[j].w) || (grupo(i) >= 0 && grupo(i) === grupo(j)); // the same cable, for sure
    const deOSM = (q) => (cerca.get(q.id) || []).filter(([r]) => !agencia(r.i));
    const juntas = []; // [km, end, end, sure]
    for (const [id, lista] of cerca) {
      const p = porId.get(id);
      for (const [q, d] of lista) {
        if (q.id < id) continue;
        if (mismo(p.i, q.i)) { juntas.push([d, p, q, 1]); continue; }
        // an unnamed piece continuing another (both from OpenStreetMap): each the only other end at that joint
        if (agencia(p.i) || agencia(q.i) || (cab[p.i].n && cab[q.i].n)) continue;
        if (deOSM(p).length === 1 && deOSM(q).length === 1) juntas.push([d, p, q, 0]);
      }
    }
    // an unnamed piece that would continue two differently named cables continues none of them
    const toca = new Map();
    for (const [, p, q, s] of juntas) if (!s) for (const [u, o] of [[p, q], [q, p]]) if (!cab[u.i].n && grupo(o.i) >= 0) { if (!toca.has(u.i)) toca.set(u.i, new Set()); toca.get(u.i).add(grupo(o.i)); }
    const raiz = Array.from({ length: n }, (_, i) => i), nombres = Array.from({ length: n }, (_, i) => new Set(grupo(i) >= 0 ? [grupo(i)] : []));
    const busca = (x) => { while (raiz[x] !== x) { raiz[x] = raiz[raiz[x]]; x = raiz[x]; } return x; };
    juntas.sort((a, b) => b[3] - a[3] || a[0] - b[0]); // the sure ones first, then the closest
    const hechas = [];
    for (const j of juntas) {
      const [, p, q, seguro] = j;
      if (!seguro && [p, q].some((u) => toca.has(u.i) && toca.get(u.i).size > 1)) continue;
      const a = busca(p.i), b = busca(q.i);
      if (a !== b) {
        if (!seguro && new Set([...nombres[a], ...nombres[b]]).size > 1) continue; // never two names in one cable through a guess
        raiz[b] = a; for (const g of nombres[b]) nombres[a].add(g);
      }
      hechas.push(j);
    }
    const piezas = new Map(); for (let i = 0; i < n; i++) { const r = busca(i); if (!piezas.has(r)) piezas.set(r, []); piezas.get(r).push(i); }
    // the name of an unnamed piece: the one name of the pieces it is joined to or, when none of them has a name, the one
    // of the named pieces that share a Wikidata item with them (the same cable for OpenStreetMap's mappers)
    const porWiki = new Map(); for (let i = 0; i < n; i++) { const w = cab[i].w; if (w && grupo(i) >= 0) { if (!porWiki.has(w)) porWiki.set(w, new Set()); porWiki.get(w).add(grupo(i)); } }
    const ef = new Int32Array(n).fill(-1), prestados = new Map();
    for (const [r, ps] of piezas) {
      let s = nombres[r];
      if (!s.size) { s = new Set(); for (const i of ps) { const g = cab[i].w && porWiki.get(cab[i].w); if (g) for (const x of g) s.add(x); } }
      if (s.size !== 1) continue;
      const g = [...s][0];
      for (const i of ps) if (grupo(i) < 0 && !cab[i].n) { ef[i] = g; if (!prestados.has(g)) prestados.set(g, []); prestados.get(g).push(i); }
    }
    // close the few km left between joined pieces: the end not yet extended reaches the other piece's own end
    const juntaEn = new Set(), alargado = new Set(); let cerradas = 0;
    const enTierra = (e) => agencia(e.i) || !!(L0 && L0.cables && L0.cables[e.i] && L0.cables[e.i][2 * e.k]); // a landing (named by the agency, or a city within 80 km)
    for (const [d, p, q] of hechas) {
      juntaEn.add(p.id); juntaEn.add(q.id);
      // a joint in the sea is not an end: no ring there (at a landing the ring stays: «la línea no puede empezar sola»)
      for (const e of [p, q]) if (!enTierra(e)) { const l = c.lineas[e.i]; (l.sinAro || (l.sinAro = [false, false]))[e.k] = true; }
      if (d < 0.05 || (alargado.has(p.id) && alargado.has(q.id))) continue;
      const [x, y] = alargado.has(p.id) ? [q, p] : [p, q], l = c.lineas[x.i], pt = [y.v[0] * 1.003, y.v[1] * 1.003, y.v[2] * 1.003];
      if (x.k) l.w.push(pt); else l.w.unshift(pt);
      alargado.add(x.id); mideLinea(l); cerradas++;
    }
    UNION = { raiz: raiz.map((_, i) => busca(i)), piezas, grupo: ef, prestados, juntas: hechas.length, cerradas, conNombre: ef.filter((g) => g >= 0).length, sueltos: 0 };
    c.porPotencia = null; c.visK = null; // a piece that took a name may take that cable's class
    pintaClases();
    cargaAgua().then((A) => marcaSueltos(A, juntaEn)).catch(() => {});
  }
  // the planet's own water mask (static/tierra/agua.png, 2048 × 1024, light = sea), read a few pixels at a time: is there
  // land within km of a point? Without it nothing is marked loose.
  let cargaAguaP = null;
  const cargaAgua = () => cargaAguaP || (cargaAguaP = new Promise((ok) => {
    const im = new Image();
    im.onerror = () => ok(null);
    im.onload = () => {
      const W = im.naturalWidth, H = im.naturalHeight, cv = document.createElement('canvas'), g = cv.getContext('2d', { willReadFrequently: true });
      if (!W || !H || !g) { ok(null); return; }
      ok((lon, lat, km) => {
        const x0 = (lon + 180) / 360 * W, y0 = (90 - lat) / 180 * H, ry = Math.ceil(km / (20015 / H)) + 1;
        const rx = Math.min(Math.floor(W / 2) - 1, Math.ceil(km / (40075 / W * Math.max(0.02, Math.cos(lat * RAD)))) + 1);
        const sx = Math.floor(x0) - rx, sy = Math.max(0, Math.floor(y0) - ry), sw = 2 * rx + 1, sh = Math.min(H, Math.floor(y0) + ry + 1) - sy;
        if (sh <= 0) return false;
        cv.width = sw; cv.height = sh; g.imageSmoothingEnabled = false;
        g.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
        if (sx < 0) g.drawImage(im, sx + W, sy, sw, sh, 0, 0, sw, sh); // across the antimeridian
        if (sx + sw > W) g.drawImage(im, sx - W, sy, sw, sh, 0, 0, sw, sh);
        const d = g.getImageData(0, 0, sw, sh).data;
        for (let yy = 0; yy < sh; yy++) for (let xx = 0; xx < sw; xx++) {
          const o = (yy * sw + xx) * 4; if (!d[o + 3] || d[o] >= 128) continue; // sea, or outside the map
          if (kmLL([lon, lat], [-180 + (sx + xx + 0.5) / W * 360, 90 - (sy + yy + 0.5) / H * 180]) <= km) return true;
        }
        return false;
      });
    };
    im.src = (document.documentElement.dataset.tierra || '/static/tierra/') + 'agua.png';
  }));
  // km from a unit vector to the nearest point of a drawn line (its vertices sit at 1.003)
  function kmALinea(v, w) {
    let m = Infinity;
    for (let j = 1; j < w.length; j++) {
      const a = w[j - 1], b = w[j], ax = a[0] / 1.003, ay = a[1] / 1.003, az = a[2] / 1.003, bx = b[0] / 1.003 - ax, by = b[1] / 1.003 - ay, bz = b[2] / 1.003 - az;
      const t = Math.max(0, Math.min(1, ((v[0] - ax) * bx + (v[1] - ay) * by + (v[2] - az) * bz) / (bx * bx + by * by + bz * bz || 1e-18)));
      const d = kmV(v, [ax + bx * t, ay + by * t, az + bz * t]); if (d < m) m = d;
    }
    return m;
  }
  function marcaSueltos(A, juntaEn) {
    const c = capas.sub; if (!A || !c || !c.lineas || !UNION) return;
    const cab = c.d.cables, n = cab.length, ciudad = LUG && !LUG.error && LUG.cables, lim = SUELTO_KM / 6371;
    const otroCable = (v, i) => c.lineas.some((l, j) => {
      if (j === i || !l.w || l.w.length < 2) return false;
      capsDe(l); const cp = l.cap; if (Math.acos(Math.max(-1, Math.min(1, v[0] * cp.c[0] + v[1] * cp.c[1] + v[2] * cp.c[2]))) > cp.r + lim) return false;
      return kmALinea(v, l.w) <= SUELTO_KM;
    });
    // each end: at land (a city within 80 km, a landing named by the agency, land on the mask), a joint, beside another
    // cable, or free
    const libres = [], anclada = new Set();
    for (let i = 0; i < n; i++) {
      const l = cab[i].l; if (!l || l.length < 2) continue;
      for (let k = 0; k < 2; k++) {
        const q = k ? l[l.length - 1] : l[0];
        if (cab[i].aprox || (ciudad && ciudad[i] && ciudad[i][2 * k])) { anclada.add(UNION.raiz[i]); continue; }
        if (juntaEn.has(2 * i + k)) continue;
        if (A(q[0], q[1], TIERRA_KM) || otroCable(P().vec(q[0], q[1]), i)) { anclada.add(UNION.raiz[i]); continue; }
        libres.push([i, k]);
      }
    }
    // a free end fades out only on a cable that reaches land or the network somewhere else
    const marca = new Map();
    for (const [i, k] of libres) if (anclada.has(UNION.raiz[i])) { if (!marca.has(i)) marca.set(i, [false, false]); marca.get(i)[k] = true; }
    for (const [i, [ini, fin]] of marca) { const l = c.lineas[i]; colas(l, ini, fin); const s = l.sinAro || (l.sinAro = [false, false]); if (ini) s[0] = true; if (fin) s[1] = true; }
    UNION.sueltos = [...marca.values()].reduce((s, m) => s + m[0] + m[1], 0);
  }
  // a vertex of the line at arc length s (inserted when there is none close by); its index
  function cortaEn(l, s) {
    let j = 0; while (j < l.acc.length - 2 && l.acc[j + 1] <= s) j++;
    const f = (s - l.acc[j]) / ((l.acc[j + 1] - l.acc[j]) || 1); if (f <= 0.02) return j; if (f >= 0.98) return j + 1;
    const a = l.w[j], b = l.w[j + 1], x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, z = a[2] + (b[2] - a[2]) * f, m = Math.hypot(x, y, z) / 1.003;
    l.w.splice(j + 1, 0, [x / m, y / m, z / m]); mideLinea(l); return j + 1;
  }
  // the last stretch before a loose end (a third of the piece, 700 km at most) is drawn apart, fading out (pintaColas);
  // the rest of the line, from d0 to d1, as always
  function colas(l, ini, fin) {
    const largo = Math.min(0.34 * l.L, 700 / 6371);
    let d0 = 0, d1 = l.w.length - 1;
    if (ini) d0 = cortaEn(l, largo);
    if (fin) d1 = cortaEn(l, l.L - largo);
    l.d0 = d0; l.d1 = d1; l.colas = [];
    if (ini) l.colas.push({ desde: d0, hasta: 0 });
    if (fin) l.colas.push({ desde: d1, hasta: l.w.length - 1 });
  }
  // every place where a cable reaches land, west to east: its named cable's landings and those of the pieces that joined it
  // here; for an unnamed cable, the landings of its own pieces. [city, country, lon, lat]
  function lugaresCable(i) {
    const gi = grupoDe(i), gr = gi >= 0 && LUG && LUG.grupos ? LUG.grupos[gi] : null, out = gr ? gr[1].slice() : [];
    const vistos = new Set(out.map((q) => q[0] + '|' + q[1]));
    let mas = false;
    for (const j of gr ? (UNION && UNION.prestados.get(gi)) || [] : cadenaDe(i)) {
      const e = LUG && LUG.cables && LUG.cables[j], d = capas.sub && capas.sub.d && capas.sub.d.cables[j]; if (!e || !d || !d.l) continue;
      for (const [k, q] of [[0, d.l[0]], [2, d.l[d.l.length - 1]]]) { if (!e[k]) continue; const key = e[k] + '|' + e[k + 1]; if (vistos.has(key)) continue; vistos.add(key); out.push([e[k], e[k + 1], q[0], q[1]]); mas = true; }
    }
    return mas ? out.sort((a, b) => a[2] - b[2]) : out;
  }

  // where the internet touches the ground (OpenStreetMap): landing stations, data centres, exchange points
  let PT = null;
  // The polar stations (bases and satellite ground stations) live in puntos-extra.json and are drawn with the cable layer
  // too, so they load on their own, without the 420 KB of data centres (22 Oct 2026, 14:15, owner: «que aparezca»).
  let EST = null, NOTAS = null, CAP = null, REL = null;
  // 22 Oct 2026, 15:23 (owner): «la profundidad a la que está el cable submarino, y también el de tierra». The seabed
  // and the land under each line (datos/cables-relieve.json, datos/fibra-relieve.json, from ETOPO 2022), keyed by the
  // line's own coordinates — the same key herramientas/relieve.py writes — so it survives any regeneration.
  const claveRelieve = (l) => { let s = 0; for (const [lon, lat] of l) s += Math.round(lon * 1000) + Math.round(lat * 1000); return l.length + ':' + s; };
  async function cargaRelieve() { if (REL || cargando.rel) return; cargando.rel = true; REL = { cables: {}, fibra: {} }; try { const c = await cargaJSON('datos/cables-relieve.json'); REL.cables = c.tramos || {}; } catch (_) {} try { const f = await cargaJSON('datos/fibra-relieve.json'); REL.fibra = f.tramos || {}; } catch (_) {} cargando.rel = false; }
  const relieveCable = (i) => { if (!REL || !capas.sub || !capas.sub.d) return null; const d = capas.sub.d.cables[i]; return d && d.l ? REL.cables[claveRelieve(d.l)] || null : null; };
  const relieveFibra = (i) => { if (!REL || !FT || !FT.lineas[i]) return null; const l = FT.lineas[i].x; return l && l.l ? REL.fibra[claveRelieve(l.l)] || null : null; };
  // 22 Oct 2026, 15:03 (owner): «los que llevan tantos terabytes… en otro color… un ramal diferente por potencia»:
  // design capacity per cable from the agency (datos/cables-capacidad.json, keyed by the group name of lugares-capas).
  async function cargaCapacidad() { if (CAP || cargando.cap) return; cargando.cap = true; try { const c = await cargaJSON('datos/cables-capacidad.json'); CAP = { cables: c.cables || {}, umbrales: c.umbrales || { gigante: 100, grande: 20 } }; if (capas.sub) capas.sub.porPotencia = null; pintaNota(); } catch (_) { CAP = { cables: {}, umbrales: { gigante: 100, grande: 20 } }; } cargando.cap = false; }
  const capacidadDe = (i) => { if (!CAP || !LUG || !LUG.g) return null; const gi = grupoDe(i); if (gi == null || gi < 0) return null; const g = LUG.grupos[gi]; return g ? CAP.cables[g[0]] || null : null; };
  const potencia = (i) => { const c = capacidadDe(i); if (!c) return 0; return c.tbps >= CAP.umbrales.gigante ? 2 : c.tbps >= CAP.umbrales.grande ? 1 : 0; };
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  async function cargaNotas() { if (NOTAS || cargando.notas) return; cargando.notas = true; try { const n = await cargaJSON('datos/cables-notas.json'); NOTAS = (n.cables || []).map((q) => ({ ...q, clave: norm(q.clave) })); } catch (_) { NOTAS = []; } cargando.notas = false; }
  async function cargaEstaciones() {
    if (EST || cargando.est) return; cargando.est = true;
    try { const e2 = await cargaJSON('datos/puntos-extra.json'); EST = []; for (const f of (e2.puntos || [])) { if (f.tipo !== 'estacion' || !Number.isFinite(f.lon) || !Number.isFinite(f.lat)) continue; EST.push({ w: P().vec(f.lon, f.lat).map((x) => x * 1.002), t: f.tipo, n: f.nombre || '', o: f.operador || '', x: { nota: f.nota || '', enlace: f.enlace || '', clase: f.clase || '', programa: f.programa || '', desde: f.desde || '', gente: f.gente || '', telemetria: f.telemetria || '', antenas: f.antenas || '', cambios: f.cambios || '', local: f.local || '', fuente: f.fuente || '', gas: !!f.gas }, lon: f.lon, lat: f.lat, extra: true }); } } catch (_) { EST = []; }
    cargando.est = false;
  }
  async function cargaPuntos() {
    if (PT || cargando.puntos) return;
    cargando.puntos = true;
    try {
      const d = await cargaJSON('datos/puntos.json');
      const c = d.campos, il = c.indexOf('lon'), ia = c.indexOf('lat'), it = c.indexOf('tipo'), inm = c.indexOf('nombre'), iop = c.indexOf('operador');
      const ex = d.extra || [];
      PT = { d, p: [], ix: [] };
      d.puntos.forEach((f, k) => {
        const q = { w: P().vec(f[il], f[ia]).map((x) => x * 1.002), t: f[it], n: f[inm] || '', o: f[iop] || '', x: ex[k] || null, lon: f[il], lat: f[ia] };
        if (f[it] === 'datos') PT.p.push(q); else if (f[it] === 'intercambio') PT.ix.push(q); else if (f[it] === 'aterrizaje') (PT.at || (PT.at = [])).push(q);
      });
      // hand-verified additions (datos/puntos-extra.json, with their sources): exchange points, polar stations…
      // OpenStreetMap does not know; they survive the automatic data updates
      try { const e2 = await cargaJSON('datos/puntos-extra.json'); for (const f of (e2.puntos || [])) { if (!Number.isFinite(f.lon) || !Number.isFinite(f.lat)) continue; const q = { w: P().vec(f.lon, f.lat).map((x) => x * 1.002), t: f.tipo, n: f.nombre || '', o: f.operador || '', x: (f.nota || f.enlace || f.clase || f.aprox || f.desde) ? { nota: f.nota || '', enlace: f.enlace || '', clase: f.clase || '', programa: f.programa || '', desde: f.desde || '', gente: f.gente || '', telemetria: f.telemetria || '', antenas: f.antenas || '', aprox: f.aprox || 0, dir: f.direccion || '' } : null, lon: f.lon, lat: f.lat, extra: true }; if (f.tipo === 'datos') PT.p.push(q); else if (f.tipo === 'intercambio') PT.ix.push(q); } } catch (_) {}
      // how many data centres each operator has on the map
      PT.porOp = new Map(); for (const q of PT.p) if (q.o) PT.porOp.set(q.o, (PT.porOp.get(q.o) || 0) + 1);
      lugares();
    } catch (e) { PT = { error: true }; }
    cargando.puntos = false; pintaNota();
  }
  // Several data centres can share one position (same building, same address in the data). From ×60 the ones that
  // still sit on top of each other open like a flower around the shared spot, each with its own thin spoke, so every
  // one can be pointed at and chosen (owner, 22 Oct 2026, 18:05: «siguen saliendo apiñados y no puedo elegir»).
  let ABANICO = null, abanicoFrame = -1;
  // 25 Oct 2026, 20:28 (owner, on Richardson: «por mucho que amplíe, no logro verlo bien… cuando pase el ratón por ahí,
  // deberían de abrirse con un círculo así grande, quedarse quieto mientras yo tengo el ratón ahí para yo poder elegir
  // uno»): from ×8, the pointer over three or more data centres that crowd together opens them in rings around the spot,
  // each with a thin line to where it really is; it stays while the pointer is inside, and goes when it leaves.
  let FLOR = null; // { idx, set, w (the centre, on the planet), z, r (outer radius), lugar: Map(i → [dx, dy]) }
  const FLOR_ZOOM = 8, FLOR_MAX = 60;
  function abreFlor(idx) {
    const p = P(), G = p.geo; if (!p || !idx.length) return;
    let sx = 0, sy = 0, sz = 0; for (const i of idx) { const w = PT.p[i].w; sx += w[0]; sy += w[1]; sz += w[2]; }
    const m = Math.hypot(sx, sy, sz) || 1, w = [sx / m * 1.002, sy / m * 1.002, sz / m * 1.002];
    const v0 = p.aVista(w), cx0 = G.CX + G.R * v0[0], cy0 = G.CY - G.R * v0[1];
    // nearest first by angle around the centre, so each one sits roughly on its own side
    const lista = idx.slice(0, FLOR_MAX).map((i) => { const v = p.aVista(PT.p[i].w); return [i, Math.atan2((G.CY - G.R * v[1]) - cy0, (G.CX + G.R * v[0]) - cx0)]; }).sort((a, b) => a[1] - b[1]);
    const lugar = new Map(); let r = 58, k = 0;
    while (k < lista.length) {
      const cabe = Math.max(6, Math.floor(2 * Math.PI * r / 22)), n = Math.min(cabe, lista.length - k);
      const giro = (r / 58) * 0.37;
      for (let j = 0; j < n; j++) { const a = giro + j * 2 * Math.PI / n; lugar.set(lista[k + j][0], [r * Math.cos(a), r * Math.sin(a)]); }
      k += n; if (k < lista.length) r += 28;
    }
    FLOR = { idx: lista.map((x) => x[0]), set: new Set(lista.map((x) => x[0])), w, z: G.R / (G.R0 || G.R), r, lugar, mas: Math.max(0, idx.length - FLOR_MAX) };
  }
  function cierraFlor() { if (FLOR) { FLOR = null; } }
  function florCentro(p, G) { if (!FLOR) return null; const v = p.aVista(FLOR.w); if (v[2] <= 0.05) return null; return [G.CX + G.R * v[0], G.CY - G.R * v[1]]; }
  function posiciones(p, G) {
    const z = G.R / (G.R0 || G.R), pos = new Map();
    if (!PT || !PT.p) return pos;
    const grupos = new Map(), F = CAMPO || campo(p, G), fd = F.d, fc = F.cosP;
    for (let i = 0; i < PT.p.length; i++) {
      const q = PT.p[i]; if (q.t === 'aterrizaje' || !vePunto(q)) continue;
      if (!F.todo) { const w = q.w; if (w[0] * fd[0] + w[1] * fd[1] + w[2] * fd[2] < fc) continue; } // off the visible cap: not even projected
      const v = p.aVista(q.w); if (v[2] <= 0.02) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1]; if (x < -60 || y < -60 || x > G.W + 60 || y > G.H + 60) continue;
      pos.set(i, [x, y, 0, 0]);
      if (z >= 60) { const k = Math.round(x / 4) + ':' + Math.round(y / 4); const g = grupos.get(k); if (g) g.push(i); else grupos.set(k, [i]); } // only what really sits on the same spot, once the zoom has already separated the rest
    }
    for (const g of grupos.values()) {
      if (g.length < 2) continue;
      let cx0 = 0, cy0 = 0; for (const i of g) { cx0 += pos.get(i)[0]; cy0 += pos.get(i)[1]; } cx0 /= g.length; cy0 /= g.length;
      const r = Math.min(30, 8 + 1.6 * g.length);
      g.forEach((i, j) => { const a = -Math.PI / 2 + j * 2 * Math.PI / g.length; pos.set(i, [cx0 + r * Math.cos(a), cy0 + r * Math.sin(a), cx0, cy0]); });
    }
    if (FLOR) {
      const c = florCentro(p, G);
      if (!c || Math.abs(z / FLOR.z - 1) > 0.25) FLOR = null;
      else {
        // the others under the disc are hidden meanwhile, so the flower reads alone
        for (const [i, q] of pos) if (!FLOR.set.has(i) && Math.hypot(q[0] - c[0], q[1] - c[1]) < FLOR.r + 18) pos.delete(i);
        for (const [i, d] of FLOR.lugar) { const v = p.aVista(PT.p[i].w); pos.set(i, [c[0] + d[0], c[1] + d[1], G.CX + G.R * v[0], G.CY - G.R * v[1]]); }
      }
    }
    return pos;
  }
  // 25 Oct 2026, 21:42 (owner: «los centros de datos así en color azul, así solo… no lo acabo de ver»): the mark as a small
  // building — a rounded square with a dark edge (crisp over the photo and over the grey) and a lit window in the middle;
  // the big operators a little larger. Chosen over the flat square and a white-edged version on the real map (Frankfurt,
  // colour and grey).
  function pintaEdificios(cx, arr) {
    if (!arr.length) return;
    const rr = (x, y, g, r) => { cx.moveTo(x - g + r, y - g); cx.arcTo(x + g, y - g, x + g, y + g, r); cx.arcTo(x + g, y + g, x - g, y + g, r); cx.arcTo(x - g, y + g, x - g, y - g, r); cx.arcTo(x - g, y - g, x + g, y - g, r); cx.closePath(); };
    cx.save(); cx.lineJoin = 'round';
    // the edge, under the body
    cx.beginPath(); for (let i = 0; i < arr.length; i += 3) rr(arr[i], arr[i + 1], arr[i + 2] + 0.9, 1.6);
    cx.fillStyle = 'rgba(6,8,12,.88)'; cx.fill();
    cx.beginPath(); for (let i = 0; i < arr.length; i += 3) rr(arr[i], arr[i + 1], arr[i + 2], 1.1);
    cx.fillStyle = `rgba(${AZUL_CENTRO},.96)`; cx.fill();
    // the lit window
    if (arr[2] >= 2.2) { cx.beginPath(); for (let i = 0; i < arr.length; i += 3) { const w = Math.max(0.7, arr[i + 2] * 0.34); cx.rect(arr[i] - w, arr[i + 1] - w, 2 * w, 2 * w); } cx.fillStyle = `rgba(${BLANCO},.95)`; cx.fill(); }
    cx.restore();
  }
  function pintaPuntos(cx, p, G) {
    const forma = { aterrizaje: 0, datos: 1, intercambio: 2 }, z = G.R / (G.R0 || G.R), L = esLimpio();
    ABANICO = posiciones(p, G); abanicoFrame = performance.now();
    const fc0 = FLOR && florCentro(p, G);
    if (fc0) {
      cx.save(); cx.globalCompositeOperation = 'source-over';
      cx.fillStyle = 'rgba(6,8,12,.82)'; cx.strokeStyle = `rgba(${AZUL_CENTRO},.45)`; cx.lineWidth = 1;
      cx.beginPath(); cx.arc(fc0[0], fc0[1], FLOR.r + 16, 0, 7); cx.fill(); cx.stroke();
      cx.strokeStyle = `rgba(${AZUL_CENTRO},.28)`; cx.lineWidth = 0.7; cx.beginPath();
      for (const i of FLOR.idx) { const q = ABANICO.get(i); if (q) { cx.moveTo(q[2], q[3]); cx.lineTo(q[0], q[1]); } }
      cx.stroke();
      cx.font = '500 10.5px "IBM Plex Mono", ui-monospace, monospace'; cx.textAlign = 'center'; cx.fillStyle = 'rgba(244,246,248,.8)';
      cx.fillText(num(FLOR.idx.length + FLOR.mas) + ' ' + T('centros de datos') + (FLOR.mas ? ' · ' + T('clic para la lista') : ''), fc0[0], fc0[1] - FLOR.r - 24);
      cx.restore();
    }
    // the spokes of the fans, under the marks
    if (z >= 60) { cx.save(); cx.globalCompositeOperation = 'source-over'; cx.strokeStyle = `rgba(${L ? BLANCO : ACERO},.35)`; cx.lineWidth = 0.8; cx.beginPath(); for (const [, q] of ABANICO) { if (q[2] || q[3]) { cx.moveTo(q[2], q[3]); cx.lineTo(q[0], q[1]); } } cx.stroke(); cx.restore(); }
    const sd = Math.max(1.5, Math.min(4, 1 + z * 0.22)); // data-centre squares grow a little with the zoom (owner: «que se separen bien»)
    const edif = [], F = CAMPO || campo(p, G), fd = F.d, fc = F.cosP;
    for (let k = 0; k < 3; k++) {
      cx.beginPath();
      for (let qi = 0; qi < PT.p.length; qi++) {
        const q = PT.p[qi]; if (forma[q.t] !== k || !vePunto(q)) continue;
        let x, y; const ab = k ? ABANICO.get(qi) : null;
        if (ab) { x = ab[0]; y = ab[1]; } else { if (k) continue; const w = q.w; if (!F.todo && w[0] * fd[0] + w[1] * fd[1] + w[2] * fd[2] < fc) continue; const v = p.aVista(w); if (v[2] <= 0.02) continue; x = G.CX + G.R * v[0]; y = G.CY - G.R * v[1]; }
        if (k === 0) { cx.moveTo(x, y - 2.6); cx.lineTo(x + 2.6, y); cx.lineTo(x, y + 2.6); cx.lineTo(x - 2.6, y); cx.closePath(); }
        else if (k === 1) edif.push(x, y, esGrande(q) ? sd * 1.2 : sd * 0.95);
        else { cx.moveTo(x + 2.8, y); cx.arc(x, y, 2.8, 0, 7); }
      }
      if (k === 2) { cx.strokeStyle = `rgba(${BLANCO},.85)`; cx.lineWidth = 1; cx.stroke(); }
      else { cx.fillStyle = k === 0 ? `rgba(${BLANCO},.9)` : `rgba(${AZUL_CENTRO},.95)`; cx.fill(); }
      if (k === 1) pintaEdificios(cx, edif);
      // (the faint ring of 22 Oct 2026 around each square went with the building mark of 25 Oct)
    }
  }

  // Where cables reach land: a small white point, larger under the pointer.
  // Close up (from ×4), no line starts or ends bare: each end gets a dot with a fine ring, like the data centres.
  // Owner, 22 Oct 2026, 18:00: «la línea no puede empezar sola, tiene que empezar con el circulito».
  let EXTREMOS_VISTOS = null;
  function pintaExtremos(cx, p, G, lineas, z, color) {
    const k = Math.min(1, (z - 4) / 4); if (k <= 0 || !lineas) return;
    if (!EXTREMOS_VISTOS) EXTREMOS_VISTOS = new Set();
    const r = 4.5 + Math.min(2.5, (z - 4) / 40);
    cx.save(); cx.globalCompositeOperation = 'source-over'; cx.lineWidth = 0.9;
    const F = CAMPO || campo(p, G), fd = F.d, fc = F.cosP;
    for (const l of lineas) {
      const w = l.w; if (!w || w.length < 2) continue;
      for (let e = 0; e < 2; e++) {
        if (l.sinAro && l.sinAro[e]) continue; // a joint between two pieces of one cable, or an end that fades out into the sea
        const q = e ? w[w.length - 1] : w[0];
        if (!F.todo && q[0] * fd[0] + q[1] * fd[1] + q[2] * fd[2] < fc) continue;
        const v = p.aVista(q); if (v[2] <= 0.05) continue;
        const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1]; if (x < -10 || y < -10 || x > G.W + 10 || y > G.H + 10) continue;
        const key = Math.round(x / 2) + ':' + Math.round(y / 2); if (EXTREMOS_VISTOS.has(key)) continue; EXTREMOS_VISTOS.add(key);
        cx.fillStyle = `rgba(${color},${(0.9 * k).toFixed(2)})`; cx.beginPath(); cx.arc(x, y, 1.7, 0, 7); cx.fill();
        cx.strokeStyle = `rgba(${color},${(0.5 * k).toFixed(2)})`; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.stroke();
      }
    }
    cx.restore();
  }
  function pintaLlegadas(cx, p, G) {
    if (!LUG || !LUG.llegadas) return;
    const zl = G.R / (G.R0 || G.R), ka = Math.min(1, (zl - 4) / 4);
    // 25 Oct 2026 (review): from afar the 2,000 landings piled up into white blobs on every coast (the Channel, Japan);
    // below ×4 they are smaller and fainter, and one dot per few pixels is enough
    const kl = Math.min(1, Math.max(0, (zl - 1) / 3)), rl = 1.1 + 0.7 * kl, al = 0.5 + 0.3 * kl, rejilla = zl < 4 ? new Set() : null;
    cx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < LUG.llegadas.length; i++) {
      if (i !== llegadaMarcada && !veLlegada(LUG.llegadas[i])) continue;
      const v = p.aVista(LUG.llegadas[i].w); if (v[2] <= 0.05) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], on = i === llegadaMarcada;
      if (rejilla && !on) { const kk = Math.round(x / 3) + ':' + Math.round(y / 3); if (rejilla.has(kk)) continue; rejilla.add(kk); }
      cx.fillStyle = on ? `rgba(${BLANCO},1)` : `rgba(${BLANCO},${al.toFixed(2)})`;
      cx.beginPath(); cx.arc(x, y, on ? 3.2 : rl, 0, 7); cx.fill();
      if (on) { cx.strokeStyle = `rgba(${BLANCO},.9)`; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y, 7, 0, 7); cx.stroke(); }
      else if (ka > 0) { cx.strokeStyle = `rgba(${BLANCO},${(0.5 * ka).toFixed(2)})`; cx.lineWidth = 0.9; cx.beginPath(); cx.arc(x, y, 4.5 + Math.min(2.5, (zl - 4) / 40), 0, 7); cx.stroke(); }
      if (EXTREMOS_VISTOS) EXTREMOS_VISTOS.add(Math.round(x / 2) + ':' + Math.round(y / 2));
    }
    cx.globalCompositeOperation = 'lighter';
  }
  // The name of the town where each cable reaches land (owner, 23 Oct 2026, 23:39: «todo cable que… empiece o termine en
  // un pueblo, tiene que aparecer el nombre… el resto no hace falta, porque si no el mapa se llenaría de pueblos»). Only
  // the landings, never other towns; they come in as the planet comes closer (from about a region on screen), the
  // landings with more cables first, never on top of each other nor of a country's name, and the cities of ciudades.js
  // give way to them (their boxes and names are shared through OrbitaCapas).
  let LLEG_CAJAS = [], LLEG_NOMBRES = [], CIU_NOMBRES = []; // 25 Oct 2026: «Dallas · 11» (a city with data centres) also stops ciudades.js from writing «Dallas» beside it
  const conHalo = (cx, txt, x, y, al) => { cx.lineWidth = 3.2; cx.strokeStyle = `rgba(6,8,12,${(0.85 * al).toFixed(2)})`; cx.strokeText(txt, x, y); cx.fillStyle = `rgba(${BLANCO},${(0.94 * al).toFixed(2)})`; cx.fillText(txt, x, y); };
  function pintaNombresLlegadas(cx, p, G) {
    LLEG_CAJAS = []; LLEG_NOMBRES = [];
    if (!LUG || !LUG.llegadas || soloTu) return;
    const B = document.body.classList; if (B.contains('dentro') || B.contains('viaje') || B.contains('en-espejo')) return;
    const ancho = G.W / G.R * 6371; // km of the Earth across the screen
    const DESDE = 4200, LLENO = 3400; // they start at about a large region on screen and are fully lit a little closer
    if (ancho >= DESDE && llegadaMarcada < 0) return;
    if (!LUG.ordenLl) LUG.ordenLl = LUG.llegadas.map((_, i) => i).sort((a, b) => (LUG.llegadas[b].seg || []).length - (LUG.llegadas[a].seg || []).length);
    const al0 = Math.max(0, Math.min(1, (DESDE - ancho) / (DESDE - LLENO)));
    const max = G.W <= 760 ? 22 : 56, SEP = 6, M = 6;
    const ocupadas = PAIS_CAJAS.concat(EST_CAJAS).map((b) => [b[0], b[1], b[0] + b[2], b[1] + b[3]]); // nor on a base's or station's name
    const choca = (b) => ocupadas.some((o) => b[0] < o[2] + SEP && b[2] > o[0] - SEP && b[1] < o[3] + SEP && b[3] > o[1] - SEP);
    cx.save(); cx.globalCompositeOperation = 'source-over'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
    cx.font = '500 11px "Hanken Grotesk", system-ui, sans-serif';
    let puestas = 0;
    const pon = (i, forzada) => {
      const ll = LUG.llegadas[i]; if (!ll || !ll.ciudad) return;
      if (!forzada && !veLlegada(ll)) return;
      const v = p.aVista(ll.w); if (v[2] <= 0.08) return;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1];
      if (x < M || y < M || x > G.W - M || y > G.H - M) return;
      const txt = ll.ciudad, w = cx.measureText(txt).width;
      // 25 Oct 2026 (review, the Gulf: «Ar Ruways» four times): several landings of one town say its name once,
      // unless they are far apart on screen
      if (!forzada && LLEG_NOMBRES.some((n) => n[2] === txt && Math.hypot(n[0] - x, n[1] - y) < 220)) return;
      const izq = x + 8 + w > G.W - M, lx = izq ? x - 8 - w : x + 8;
      const caja = izq ? [lx - 2, y - 8, x - 3, y + 8] : [x + 3, y - 8, lx + w + 2, y + 8];
      if (!forzada && choca(caja)) return;
      ocupadas.push(caja); LLEG_CAJAS.push([caja[0], caja[1], caja[2] - caja[0], caja[3] - caja[1]]); LLEG_NOMBRES.push([x, y, txt]);
      const al = forzada ? 1 : al0 * Math.min(1, (v[2] - 0.08) / 0.12);
      if (al > 0.02) conHalo(cx, txt, lx, y, al);
      puestas++;
    };
    if (llegadaMarcada >= 0) pon(llegadaMarcada, true); // the one under the pointer always says its name
    if (ancho < DESDE) for (const i of LUG.ordenLl) { if (puestas >= max) break; if (i !== llegadaMarcada) pon(i, false); }
    cx.restore();
  }
  // Cities with several data centres: a fine ring that grows with the count, and the number beside the big ones
  // when the planet is close enough to read it.
  const radioCiudad = (n, z) => (2.5 + 1.25 * Math.sqrt(n)) * Math.min(1.5, Math.max(1, z * 0.75));
  // Polar bases and satellite ground stations (datos/puntos-extra.json, tipo «estacion»; owner, 22 Oct 2026: «polo
  // norte, polo sur, Antártida, todo»): a ring with a dot, and the name when there is room
  // the bases' names can be touched like their ring (owner, 24 Oct 2026, 13:43: «que se puedan tocar ambos… también el nombre»)
  let EST_CAJAS = [];
  function pintaEstaciones(cx, p, G) {
    EST_CAJAS = [];
    if (!CLASES.puntos.estaciones) return;
    if (!EST || !EST.length) return;
    const z = G.R / (G.R0 || G.R), L = esLimpio();
    cx.save(); cx.globalCompositeOperation = 'source-over'; cx.lineJoin = 'round';
    cx.font = '500 11px "Hanken Grotesk", system-ui, sans-serif'; cx.textBaseline = 'middle';
    const ocupado = [];
    for (let iq = 0; iq < EST.length; iq++) {
      const q = EST[iq], plat = q.x && q.x.clase === 'plataforma';
      // the oil and gas platforms where a cable ends (owner, 24 Oct 2026, 21:08): a small square, from about a region on
      // screen (ten of them in the North Sea would be a smudge with the whole planet in view), the name when close
      if (plat && z < 3) continue;
      const v = p.aVista(q.w); if (v[2] <= 0.05) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1];
      cx.lineWidth = 1.1; cx.strokeStyle = `rgba(${BLANCO},${L ? 0.9 : 0.75})`; cx.beginPath();
      // each kind its own outline (agency round 31, both voices: «que no compartan el anillo de las llegadas de cables»):
      // a square the platforms, a hexagon the polar bases, a triangle the satellite ground stations
      if (plat) cx.rect(Math.round(x) - 3.5, Math.round(y) - 3.5, 7, 7);
      else if (q.x && q.x.clase === 'base') { for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; cx[k ? 'lineTo' : 'moveTo'](x + 4.6 * Math.cos(a), y + 4.6 * Math.sin(a)); } cx.closePath(); }
      else { cx.moveTo(x, y - 5); cx.lineTo(x + 4.6, y + 3.2); cx.lineTo(x - 4.6, y + 3.2); cx.closePath(); }
      cx.stroke();
      cx.fillStyle = `rgba(${BLANCO},.95)`; cx.beginPath(); cx.arc(x, y, 1.4, 0, 7); cx.fill();
      if (z >= (plat ? 8 : 1.8) && q.n) {
        const txt = T(q.n.split(' (')[0].split(' / ')[0]), w = Math.ceil(cx.measureText(txt).width), lx = Math.round(x + 8), ly = Math.round(y); // «Polo Sur», «Gran Muralla» in the page's language
        // 25 Oct 2026 (revisión punto por punto: «Fairbanks» over another name): label centre against label centre, and never on a country's name
        const cxl = x + 8 + w / 2, enPais = PAIS_CAJAS.some((b) => x + 4 < b[0] + b[2] && x + 12 + w > b[0] && y - 8 < b[1] + b[3] && y + 8 > b[1]);
        if (!enPais && !ocupado.some((o) => Math.abs(cxl - o[0]) < (w + o[2]) / 2 + 10 && Math.abs(y - o[1]) < 14)) { ocupado.push([cxl, y, w]); EST_CAJAS.push([x + 4, y - 8, w + 8, 16, iq]); conHalo(cx, txt, lx, ly, 0.9); }
      }
    }
    cx.restore();
  }
  function pintaCiudades(cx, p, G) {
    if (!LUG || !LUG.centros) return;
    const z = G.R / (G.R0 || G.R);
    cx.lineWidth = 1;
    cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle';
    const ocupado = []; CIU_NOMBRES = []; // labels never sit on top of each other
    const fl = FLOR && florCentro(p, G); // nothing of the cities over the flower of data centres
    for (const i of LUG.orden) {
      const c = LUG.centros[i]; if (c.n < 5) break;
      const v = p.aVista(c.w); if (v[2] <= 0.05) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], r = radioCiudad(c.n, z), on = i === centroMarcado;
      if (fl && Math.hypot(x - fl[0], y - fl[1]) < FLOR.r + 90) continue;
      cx.strokeStyle = on ? `rgba(${BLANCO},.95)` : `rgba(${AZUL_CENTRO},${c.n >= 10 ? 0.75 : 0.5})`;
      cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.stroke();
      // owner, 22 Oct 2026: «en el mapa no me sale la ciudad»: the city's name by its ring as the zoom grows
      // (the biggest first; closer in, every city with data centres), never one label over another
      const conNombre = c.ciudad && v[2] > 0.3 && (z >= 4.5 || (z >= 3 && c.n >= 3) || (z >= 2 && c.n >= 10) || (z >= 1.8 && c.n >= 15));
      if (conNombre) { const txt = c.ciudad + (c.n > 1 ? ' · ' + num(c.n) : ''), tx = x + r + 5, w = 6.3 * txt.length; if (!ocupado.some((o) => tx < o[0] + o[2] + 6 && tx + w + 6 > o[0] && Math.abs(y - o[1]) < 13)) { ocupado.push([tx, y, w]); CIU_NOMBRES.push([x, y, c.ciudad]); cx.font = '500 10.5px "Hanken Grotesk", system-ui, sans-serif'; cx.fillStyle = 'rgba(6,8,12,.55)'; cx.fillText(txt, tx + 1, y + 1); cx.fillStyle = on ? `rgba(${BLANCO},1)` : `rgba(${BLANCO},.82)`; cx.fillText(txt, tx, y); } }
    }
    if (centroMarcado >= 0) { const c = LUG.centros[centroMarcado]; if (c && c.n < 5) { const v = p.aVista(c.w); if (v[2] > 0.05) { cx.strokeStyle = `rgba(${BLANCO},.95)`; cx.beginPath(); cx.arc(G.CX + G.R * v[0], G.CY - G.R * v[1], 6, 0, 7); cx.stroke(); } } }
  }

  // ---------- the main land backbones (owner, 22 Oct 2026: «las redes troncales de tierra, las principales… que se
  // vea cómo se ramifica por tierra desde donde llega el cable») ----------
  // Shown with the «Cables» button: where a submarine cable lands, the long-distance fibre it feeds on land. Only
  // what an open source publishes (fibra-tierra.json says which, line by line); nothing is drawn where none has data.
  let FT = null;
  async function cargaFibra() {
    if (FT || cargando.ft) return;
    cargando.ft = true;
    try {
      const d = await cargaJSON('datos/fibra-tierra.json');
      // owner, 22 Oct 2026: «la fibra por tierra también con datos que van y vienen, como los cables»: the same
      // light inside, so each line carries its arc length
      FT = { d, lineas: d.lineas.map((x) => { const w = x.l.map(([lon, lat]) => P().vec(lon, lat).map((c) => c * 1.002)); const acc = [0]; for (let j = 1; j < w.length; j++) { const a = w[j - 1], b = w[j]; acc.push(acc[j - 1] + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 1.002); } return { x, w, acc, L: acc[acc.length - 1], fase: Math.random() }; }) };
    } catch (e) { FT = { error: true }; }
    cargando.ft = false; pintaNota();
    cargaRadio();
  }
  // ---------- radio chains (round 27): microwave from tower to tower where no fibre runs between the towns (Greenland,
  // Eritrea, the Falklands, the Pacific). Two voices name each stretch; the towers' positions are not public, so the
  // line joins the towns the sources name, dotted, and its card says so. In the «Cables por tierra» card, class «Radioenlaces». ----------
  let RD = null;
  async function cargaRadio() {
    if (RD || cargando.rd) return; cargando.rd = true;
    try {
      const d = await cargaJSON('datos/radioenlaces.json');
      RD = { d, lineas: (d.lineas || []).map((x) => { const w = x.l.map(([lon, lat]) => P().vec(lon, lat).map((c) => c * 1.002)); let km = 0; for (let j = 1; j < x.l.length; j++) { const [a, b] = [x.l[j - 1], x.l[j]], la1 = a[1] * RAD, la2 = b[1] * RAD; km += 6371 * Math.acos(Math.min(1, Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos((b[0] - a[0]) * RAD))); } return { x, w, km: Math.round(km) }; }) };
    } catch (_) { RD = { lineas: [] }; }
    cargando.rd = false; pintaNota();
  }
  let radioMarcado = -1;
  function pintaRadio(cx, p, G) {
    if (!RD || !RD.lineas || !RD.lineas.length || !CLASES.fibra.radio) return;
    const z = G.R / (G.R0 || G.R), fz = z <= 200 ? 1 : Math.max(0, 1 - (z - 200) / 400); if (fz <= 0) return;
    const g = cx.globalCompositeOperation; cx.globalCompositeOperation = 'source-over';
    cx.save(); cx.lineCap = 'round'; cx.lineWidth = Math.min(2.6, 1.5 + 0.12 * z); cx.setLineDash([0.1, Math.min(7, 3.6 + 0.4 * z)]);
    cx.strokeStyle = `rgba(${RADIO_COL},${(0.92 * fz).toFixed(2)})`; cx.beginPath();
    for (const l of RD.lineas) trazoW(cx, p, G, l.w, 0, l.w.length - 1);
    cx.stroke(); cx.restore(); cx.globalCompositeOperation = g;
    if (radioMarcado >= 0 && RD.lineas[radioMarcado]) { cx.save(); cx.setLineDash([0.1, 5]); cx.lineCap = 'round'; resalta(cx, p, G, [RD.lineas[radioMarcado]], RADIO_COL); cx.restore(); }
  }
  function buscaRadio(x, y) {
    if (!estado.fibra || !CLASES.fibra.radio || !RD || !RD.lineas) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 7 * 7;
    RD.lineas.forEach((l, i) => {
      let ax = 0, ay = 0, prev = false;
      for (const w of l.w) {
        const v = p.aVista(w), bx = G.CX + G.R * v[0], by = G.CY - G.R * v[1], ve = v[2] > 0.02;
        if (ve && prev) { const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L2)); const qx = ax + vx * t - x, qy = ay + vy * t - y, d2 = qx * qx + qy * qy; if (d2 < dm) { dm = d2; mejor = i; } }
        ax = bx; ay = by; prev = ve;
      }
    });
    return mejor;
  }
  function fichaRadio(i, x, y) {
    const r = RD.lineas[i], l = r.x, tit = l.n || T('Radioenlace de microondas');
    const filas = [[T('Tipo'), T('Radioenlace de microondas')]];
    if (l.cc) filas.push([T('País'), paisNombre(l.cc)]);
    if (l.o) filas.push([T('Operador'), l.o]);
    if (r.km) filas.push([T('Longitud en el mapa'), num(r.km) + ' km']);
    if (l.dato) filas.push([l.cc === 'US' || l.cc === 'GB' ? T('Latencia publicada') : T('Datos'), l.dato]);
    // the stock-exchange routes (Chicago–New Jersey, London–Frankfurt) are there for another reason: speed
    const bolsa = l.cc === 'US' || l.cc === 'GB';
    const para = bolsa ? T('Por aquí viajan las órdenes de bolsa entre dos mercados. Por el aire la señal llega antes que por la fibra, porque la luz va más despacio dentro del vidrio, y en la bolsa cada millonésima de segundo cuenta. La línea une los dos extremos: las torres no se dibujan.')
      : T('Aquí internet viaja por el aire: de torre en torre, por microondas, siempre a la vista. Se usa donde tender fibra no compensa o no es posible, como el hielo, el desierto o el mar entre islas. La posición de cada torre no es pública: la línea une los pueblos que nombran las fuentes.');
    if (clicActual) { abreModelo(modelo(T('Radioenlace de microondas'), tit, filas, T('Trazado aproximado') + ' · ' + T('Datos verificados'), { resumen: [T('Tipo'), T('País'), T('Operador'), T('Longitud en el mapa')], para }), x, y); return; }
    const f = ficha(); if (!f) return; f.classList.remove('sat');
    f.querySelector('b').textContent = tit;
    f.querySelector('span').textContent = filas.map((q) => q[0] + ': ' + q[1]).join('\n') + '\n' + T('Trazado aproximado') + ' · ' + T('Datos verificados');
    f.hidden = false; colocaFicha(x, y);
  }
  // Land fibre by levels (owner, 22 Oct 2026: «mucha carga en el planeta… para que no haya tanto ruido»): from afar
  // only the long corridors, one per corridor (operators sharing a route are drawn once), and the rest as you zoom in.
  // 22 Oct 2026, 21:33 (owner): «no puede salir todo de una vez; hay que clasificarla de alta potencia, de menos potencia».
  // Nobody publishes the capacity of land fibre, so each line's level comes from two proxies: its length (a line of
  // 800 km is a backbone) and company (a corridor that four operators share is a main road). Four levels, and each
  // one fades in with the zoom instead of appearing all at once:
  //   3 · troncal principal: 800 km or more, or a corridor shared by four lines (250 km or more) — always drawn
  //   2 · largo recorrido: 400 km or more, or a corridor shared by three (150 km or more) — from ×1.5
  //   1 · nacional: 150 km or more — from ×2.6
  //   0 · regional: the rest — from ×6
  const claveCorredor = (l) => { const a = l.x.l[0], b = l.x.l[l.x.l.length - 1]; const k = (q) => Math.round(q[0] * 2) + ',' + Math.round(q[1] * 2); const ka = k(a), kb = k(b); return ka < kb ? ka + '|' + kb : kb + '|' + ka; };
  function preparaNiveles() {
    if (!FT || !FT.lineas || FT.corr) return; // 24 Oct 2026 (QA): before the land cables have loaded
    FT.corr = new Map(); // corridor → the companies that run a line along it (one company drawing it twice counts once)
    for (const l of FT.lineas) { l.corr = claveCorredor(l); if (!FT.corr.has(l.corr)) FT.corr.set(l.corr, new Set()); FT.corr.get(l.corr).add(l.x.o || l.x.n || ''); }
    for (const l of FT.lineas) { const km = l.x.km || 0, c = FT.corr.get(l.corr).size || 1; l.nivel = km >= 800 || (c >= 4 && km >= 250) ? 3 : km >= 400 || (c >= 3 && km >= 150) ? 2 : km >= 150 ? 1 : 0; }
  }
  const aparece = (v) => Math.min(1, Math.max(0, v));
  // how much of a level shows at this zoom: 0 hidden, 1 fully there
  const fundidoNivel = (n, z) => n === 3 ? 1 : n === 2 ? aparece((z - 1.5) / 0.6) : n === 1 ? aparece((z - 2.6) / 1.0) : aparece((z - 6) / 2);
  function fibraVisible(z) {
    if (!FT || !FT.lineas) return [];
    preparaNiveles();
    const paso = Math.round(z * 20) / 20 + '|' + claveClases('fibra'); // recomputed only when the zoom moves a notch or a class changes
    if (FT.vis && FT.vis.paso === paso) return FT.vis.lineas;
    // from afar, one line per corridor (operators sharing a route are drawn once); past ×2.6 every line
    const una = z < 2.6, vistos = new Set(), lineas = [];
    for (const l of FT.lineas) { if (!veFibra(l) || fundidoNivel(l.nivel, z) <= 0) continue; if (una) { if (vistos.has(l.corr)) continue; vistos.add(l.corr); } lineas.push(l); }
    FT.vis = { paso, lineas };
    return lineas;
  }
  const rangoFibra = (l) => { if (l.nivel == null) preparaNiveles(); return l.nivel; };
  const nombreRango = (r) => r === 3 ? T('Gran autopista por tierra') : r === 2 ? T('Ruta larga') : r === 1 ? T('Ruta entre ciudades') : T('Enlace corto');
  function pintaFibra(cx, p, G) {
    const z = G.R / (G.R0 || G.R), lineas = fibraVisible(z);
    // 22 Oct 2026: the land fibre is drawn from city to city (its nodes are cities, not street addresses), so below
    // about 100 km of height the lines would all meet at one false point; they fade out between ×200 and ×600.
    const fz = z <= 200 ? 1 : Math.max(0, 1 - (z - 200) / 400); if (fz <= 0) return;
    // 22 Oct 2026, 18:10 (owner): the land fibre told apart by level — main trunks brighter and wider, regional links thin
    const kq = Math.min(1, Math.max(0, (z - 1.4) / 2.6)), base = Math.min(1.8, 0.9 + 0.2 * (z - 1));
    for (const obra of [false, true]) for (const nivel of [0, 1, 2, 3]) {
      const fn = fundidoNivel(nivel, z); if (fn <= 0) continue;
      const alfa = Math.min(1, (obra ? 0.5 : nivel === 3 ? 0.85 + 0.12 * kq : nivel === 2 ? 0.74 + 0.12 * kq : nivel === 1 ? 0.66 : 0.48) * (FIBRA_ALFA[nivel] || 1)) * fz * fn;
      cx.strokeStyle = `rgba(${FIBRA_COL[nivel]},${alfa.toFixed(2)})`;
      if (nivel === 3 && !obra) { const g = cx.globalCompositeOperation; cx.globalCompositeOperation = 'source-over'; cx.lineWidth = base + 0.9 + 0.5 * kq; cx.setLineDash([]); cx.beginPath(); const F0 = CAMPO || campo(p, G); for (const l of lineas) { if (l.x.obra || l.nivel !== 3) continue; if (!F0.todo) { capsDe(l); if (!veCap(F0, l.cap)) continue; } trazoW(cx, p, G, l.w, 0, l.w.length - 1); } cx.stroke(); cx.globalCompositeOperation = g; continue; }
      cx.lineWidth = nivel === 3 ? base + 0.9 + 0.5 * kq : nivel === 2 ? base + 0.35 + 0.3 * kq : nivel === 1 ? base : Math.max(0.7, base - 0.25);
      cx.setLineDash(obra ? [3, 3] : []);
      cx.beginPath();
      const F = CAMPO || campo(p, G);
      for (const l of lineas) {
        if (!!l.x.obra !== obra || l.nivel !== nivel) continue;
        if (!F.todo) { capsDe(l); if (!veCap(F, l.cap)) continue; }
        trazoW(cx, p, G, l.w, 0, l.w.length - 1);
      }
      cx.stroke();
    }
    cx.setLineDash([]);
    if (z >= 4) { pintaExtremos(cx, p, G, lineas, z, FIBRA_COL[3]); cx.globalCompositeOperation = 'lighter'; }
    if (fibraMarcada >= 0) {
      const l = FT.lineas[fibraMarcada]; resalta(cx, p, G, [l], FIBRA_COL[l.nivel] || ACERO); // lit in its own colour, as every line under the pointer
    }
  }
  let fibraMarcada = -1;
  function buscaFibra(x, y) {
    if (!estado.fibra || !FT || !FT.lineas) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 6 * 6;
    const vis = new Set(fibraVisible(G.R / (G.R0 || G.R))); // only what is drawn at this zoom can be picked
    FT.lineas.forEach((l, i) => {
      if (!vis.has(l)) return;
      let ax = 0, ay = 0, prev = false;
      for (const w of l.w) {
        const v = p.aVista(w), bx = G.CX + G.R * v[0], by = G.CY - G.R * v[1], ve = v[2] > 0.02;
        if (ve && prev) {
          const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L2));
          const qx = ax + vx * t - x, qy = ay + vy * t - y, d2 = qx * qx + qy * qy;
          if (d2 < dm) { dm = d2; mejor = i; }
        }
        ax = bx; ay = by; prev = ve;
      }
    });
    return mejor;
  }
  // the land networks that start within 60 km of a landing (computed once per landing)
  function porTierra(l) {
    if (!FT || !FT.lineas) return null;
    if (l.tierra) return l.tierra;
    const ops = new Map(), lim = 60 / 6371;
    for (const f of FT.lineas) {
      for (const w of f.w) { const d = Math.hypot(w[0] / 1.002 - l.w[0] / 1.003, w[1] / 1.002 - l.w[1] / 1.003, w[2] / 1.002 - l.w[2] / 1.003); if (d < lim) { const o = f.x.o || f.x.n; if (o) ops.set(o, (ops.get(o) || 0) + 1); break; } }
    }
    l.tierra = [...ops.keys()];
    return l.tierra;
  }
  function fichaFibra(i, x, y) {
    const f = ficha(); if (!f) return;
    f.classList.remove('sat');
    const l = FT.lineas[i].x, fu = FT.d.fuentes[l.f] || {};
    f.querySelector('b').textContent = (l.n && l.n !== l.o ? l.n : T('Fibra troncal por tierra')) ;
    const lin = [];
    lin.push(T('Fibra troncal por tierra') + (l.cc ? ' · ' + paisNombre(l.cc) : ''));
    if (l.o) lin.push(T('Operador') + ': ' + l.o);
    if (l.km) lin.push(T('Longitud en el mapa') + ': ' + num(l.km) + ' km');
    lin.push(T('Rango') + ': ' + nombreRango(rangoFibra(FT.lineas[i])) + (l.km ? '' : ''));
    if (l.obra) lin.push(T('En construcción según la fuente'));
    // Topology Zoo lines carry the year of the map they come from; a network another company took over since (23 Oct
    // 2026, the agency's review) names the network of the map, and the operator above is today's owner when two voices agree
    if (l.red) lin.push(T('Red en el mapa') + ': ' + l.red + (l.anio ? ' (' + l.anio + ')' : ''));
    else if (l.anio) lin.push(T('Según el mapa de la red de') + ' ' + l.anio);
    { const rl = relieveFibra(i); if (rl) lin.push(T('Altitud del terreno') + ': ' + T('máxima') + ' ' + num(rl.max) + ' m · ' + T('media') + ' ' + num(rl.med) + ' m'); }
    lin.push(T('Va enterrada a entre 0,6 y 1,5 m, casi siempre en conductos junto a carreteras, vías de tren, gasoductos o líneas eléctricas.'));
    lin.push(T('Trazado aproximado') + ' · ' + T('Datos verificados'));
    f.querySelector('span').textContent = lin.join('\n');
    if (clicActual) { const filas = lin.map((t) => { const j = t.indexOf(': '); return j > 0 && j < 40 ? [t.slice(0, j), t.slice(j + 2)] : ['', t]; }); abreModelo(modelo(T('Fibra troncal por tierra'), f.querySelector('b').textContent, filas, T('Trazado aproximado') + ' · ' + T('Datos verificados'), { resumen: [T('Fibra troncal por tierra'), T('Operador'), T('Longitud en el mapa'), T('Altitud del terreno')], para: T('Por aquí viaja internet dentro del continente: de las llegadas de los cables submarinos a las ciudades, y entre ciudades. Va bajo tierra, junto a carreteras y vías.'), secciones: [{ t: T('Datos'), claves: [T('Según el mapa de la red de'), T('En construcción según la fuente')] }] }), x, y); return; }
    f.hidden = false; colocaFicha(x, y);
  }

  // satellites: one SGP4 record each; positions computed in turns and extrapolated every frame
  let S = null;
  async function cargaSat() {
    if (S || cargando.sat) return;
    cargando.sat = true;
    try {
      if (!window.satellite) await cargaScript('static/vendor/satellite.min.js');
      const d = await cargaJSON('datos/satelites.json');
      const c = d.campos, ix = (k) => c.indexOf(k);
      const rec = [], g = [], nom = [], nor = [], fila = [];
      for (const f of d.sat) {
        const omm = { NORAD_CAT_ID: f[ix('norad')] };
        for (const k of c.slice(3)) if (/^[A-Z_]+$/.test(k)) omm[k] = f[ix(k)];
        try { const r = window.satellite.json2satrec(omm); if (r && !r.error) { rec.push(r); g.push(f[0]); nom.push(f[1]); nor.push(+f[ix('norad')] || 0); fila.push(f); } } catch (_) {}
      }
      const N = rec.length;
      S = { d, rec, g: Uint8Array.from(g), nom, fila, ix, N, pos: new Float64Array(N * 3), vel: new Float64Array(N * 3), t: new Float64Array(N), ok: new Uint8Array(N),
            sx: new Float32Array(N), sy: new Float32Array(N), sombra: new Uint8Array(N), dib: new Uint8Array(N), norad: Int32Array.from(nor), nSel: 0, cuentaOrb: { baja: 0, media: 0, geo: 0 }, vis: new Uint8Array(N), arriba: new Uint8Array(N), cursor: 0, nArriba: 0, tArriba: 0 };
      for (let i = 0; i < N; i++) propaga(i, Date.now());
    } catch (e) { S = { error: true }; }
    cargando.sat = false; pintaNota();
  }
  function propaga(i, ms) {
    const r = S.rec[i], jd = ms / 86400000 + 2440587.5, min = (jd - r.jdsatepoch) * 1440;
    let pv = null;
    try { pv = window.satellite.sgp4(r, min); } catch (_) {}
    if (!pv || !pv.position || typeof pv.position === 'boolean' || !isFinite(pv.position.x)) { S.ok[i] = 0; return; }
    const k = i * 3;
    S.pos[k] = pv.position.x; S.pos[k + 1] = pv.position.y; S.pos[k + 2] = pv.position.z;
    S.vel[k] = pv.velocity.x; S.vel[k + 1] = pv.velocity.y; S.vel[k + 2] = pv.velocity.z;
    S.t[i] = ms; S.ok[i] = 1;
  }
  // Low orbits at their real height; medium and geostationary ones on the outer rings, «not to scale».
  const escala = (rkm) => { const a = rkm - RE; return a < 2000 ? 1 + a / 6371 : a < 30000 ? 1.33 : 1.41; };

  // ---------- borders (owner, 22 Oct 2026: «que me salgan como divididos los estados») ----------
  // Natural Earth, public domain (datos/fronteras.json, built by herramientas/fronteras.py): countries from ×1.5,
  // states and provinces from ×2.5, their names when close enough. Loaded once, the first time the zoom asks for it.
  let FR = null, PREV = null;
  // 25 Oct 2026 (review, after the colour map): from ×4 the labels and lines take the «limpio» rules even over the photo (body.mapa-cerca)
  const esLimpio = () => document.body.classList.contains('limpio') || document.body.classList.contains('mapa-cerca');
  const conFoto = () => !document.body.classList.contains('limpio'); // the photo is under the data: names need a halo
  async function cargaFronteras() {
    if (FR || cargando.fronteras) return; cargando.fronteras = true;
    try {
      const d = await cargaJSON('datos/fronteras.json');
      const vec = (l) => ({ w: l.map(([lon, lat]) => P().vec(lon, lat).map((c) => c * 1.0015)) });
      FR = { paises: d.paises.map(vec), regiones: d.regiones.map(vec), nombres: d.nombres.map((n) => ({ w: P().vec(n[0], n[1]).map((c) => c * 1.0015), n: n[2], cc: n[3], r: n[4] || 9 })) };
    } catch (e) { FR = { error: true }; }
    cargando.fronteras = false;
  }
  // the region names in the page's language (owner, 25 Oct 2026, 14:12: «si la persona lo tiene puesto en ruso, tiene que
  // verlo todo en ruso»): datos/regiones/<language>.json, from Natural Earth and Wikidata (herramientas/regiones_idiomas.py),
  // in the order of fronteras.json; null where its own name is already right. Loaded when the names first show, again
  // when the language changes.
  let REG = null; const REG_ANCHO = new Map();
  const idiomaMapa = () => (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es';
  async function cargaRegiones(l) {
    if (cargando.regiones) return; cargando.regiones = true;
    try { const d = await cargaJSON('datos/regiones/' + l + '.json'); REG = { l, n: d.n || [] }; } catch (e) { REG = { l, n: [] }; }
    REG_ANCHO.clear(); cargando.regiones = false;
  }
  function pintaFronteras(cx, p, G) {
    const z = G.R / (G.R0 || G.R);
    if (z < 1.5) return;
    if (!FR) { cargaFronteras(); return; }
    if (FR.error) return;
    const L = esLimpio();
    cx.save(); cx.globalCompositeOperation = 'source-over';
    pintaLineas(cx, p, G, FR.paises, `rgba(${BLANCO},${L ? 0.5 : Math.min(0.28, 0.06 + 0.05 * z)})`, L ? 1 : 0.8);
    if (z >= 2.5) {
      pintaLineas(cx, p, G, FR.regiones, `rgba(${BLANCO},${L ? 0.26 : Math.min(0.2, 0.03 + 0.03 * z)})`, 0.6);
      // region names: on the clean map only when very close, so they never fight the data-centre cities
      if (z >= (L ? 12 : 4)) {
        const ocupado = []; cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        const lg = idiomaMapa(); if (!REG || REG.l !== lg) cargaRegiones(lg);
        const RN = REG && REG.l === lg ? REG.n : null;
        for (let iq = 0; iq < FR.nombres.length; iq++) {
          const q = FR.nombres[iq];
          if (q.r > (L ? (z >= 14 ? 6 : 3) : z >= 7 ? 9 : z >= 5.5 ? 6 : 3)) continue;
          const v = p.aVista(q.w); if (v[2] <= 0.4) continue;
          const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1]; if (x < -40 || x > G.W + 40 || y < -20 || y > G.H + 20) continue;
          const txt = ((RN && RN[iq]) || q.n).toLocaleUpperCase(lg);
          let w = REG_ANCHO.get(txt); if (w === undefined) { w = Math.ceil(cx.measureText(txt).width); REG_ANCHO.set(txt, w); } // measured: Cyrillic, Arabic or Chinese are not 6 px a letter
          if (ocupado.some((o) => Math.abs(x - o[0]) < (w + o[2]) / 2 + 10 && Math.abs(y - o[1]) < 14)) continue;
          ocupado.push([x, y, w]);
          if (conFoto()) { cx.lineJoin = 'round'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(6,8,12,.7)'; cx.strokeText(txt, x, y); }
          cx.fillStyle = `rgba(${BLANCO},${Math.min(0.5, 0.2 + 0.05 * z)})`; cx.fillText(txt, x, y);
        }
        cx.textAlign = 'start';
      }
    }
    cx.restore();
  }

  // ---------- countries: a name at each centroid once the borders show, and a card on hover (owner, 22 Oct 2026, 14:35) ----------
  let PAIS_CAJAS = [], PAISES = null, letraPais = null;
  const ANCHO_PAIS = new Map(); // the width of each name, measured once (again when the letter finishes loading)
  try { document.fonts.addEventListener('loadingdone', () => { ANCHO_PAIS.clear(); REG_ANCHO.clear(); }); } catch (_) {}
  const fuentePais = () => letraPais || (letraPais = '600 11px ' + ((getComputedStyle(document.documentElement).getPropertyValue('--texto') || '').trim() || '"Hanken Grotesk", system-ui, sans-serif'));
  async function cargaPaises() { if (PAISES || cargando.paises) return; cargando.paises = true; try { PAISES = (await cargaJSON('datos/paises.json')).paises || {}; } catch (_) { PAISES = {}; } cargando.paises = false; }
  function pintaPaises(cx, p, G) {
    PAIS_CAJAS = [];
    const z = G.R / (G.R0 || G.R); if (z < 2.2 || z > 400 || !p.centros) return;
    const L = esLimpio(), ocupado = [];
    if (!L) return; // 22 Oct 2026, 21:54 (owner): no country names while the planet is in colour; they come with the grey, «limpio» planet
    // owner, 24 Oct 2026, 21:22: «el nombre del país… no se ve muy bien. Sin embargo, las ciudades se ven en alta
    // calidad»: the cities' treatment (ciudades.js: the interface's letter, white over a dark halo, whole pixels), and
    // the spaced capitals they had, so a country never reads as a city
    cx.save(); cx.globalCompositeOperation = 'source-over'; cx.lineJoin = 'round';
    cx.font = fuentePais(); cx.textAlign = 'left'; cx.textBaseline = 'middle'; if ('letterSpacing' in cx) cx.letterSpacing = '0.9px';
    const al = Math.min(1, (z - 2.2) / 0.6); // a soft entrance instead of popping in at ×2.2
    for (const cc of Object.keys(p.centros)) {
      const c = p.centros[cc], v = p.aVista(p.vec(c.lon, c.lat)); if (v[2] <= 0.3) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1]; if (x < -60 || x > G.W + 60 || y < -20 || y > G.H + 20) continue;
      const txt = paisNombre(cc).toUpperCase();
      let w = ANCHO_PAIS.get(txt); if (w == null) { w = Math.ceil(cx.measureText(txt).width); ANCHO_PAIS.set(txt, w); }
      const choca = (yy) => ocupado.some((o) => Math.abs(x - o[0]) < (w + o[2]) / 2 + 8 && Math.abs(yy - o[1]) < 15);
      let yy = y; if (choca(yy)) { yy = y + 15; if (choca(yy)) { yy = y - 15; if (choca(yy)) continue; } } // a small nudge before giving up (Chequia next to Alemania)
      ocupado.push([x, yy, w]);
      const lx = Math.round(x - w / 2), ly = Math.round(yy), k = al * Math.min(1, (v[2] - 0.3) / 0.15), on = cc === paisMarcado;
      if (k > 0.02) {
        cx.lineWidth = 3.4; cx.strokeStyle = `rgba(6,8,12,${(0.85 * k).toFixed(2)})`; cx.strokeText(txt, lx, ly);
        cx.fillStyle = `rgba(${BLANCO},${((on ? 1 : 0.8) * k).toFixed(2)})`; cx.fillText(txt, lx, ly);
      }
      PAIS_CAJAS.push([lx - 3, ly - 9, w + 6, 18, cc]);
    }
    if ('letterSpacing' in cx) cx.letterSpacing = '0px';
    cx.restore();
  }
  let paisMarcado = null;
  function buscaPais(x, y) { for (const b of PAIS_CAJAS) if (x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]) return b[4]; return null; }
  function fichaPais(cc, x, y) {
    if (!PAISES) cargaPaises();
    const filas = [], D = (PAISES && PAISES[cc]) || null;
    // what the map itself knows about the country
    if (LUG && LUG.grupos) {
      const cabs = LUG.grupos.filter((g) => g[1].some((q) => q[1] === cc));
      const ciudades = [...new Set(cabs.flatMap((g) => g[1].filter((q) => q[1] === cc).map((q) => q[0])))];
      if (cabs.length) filas.push([T('Cables submarinos'), num(cabs.length) + ' · ' + ciudades.slice(0, 6).join(', ') + (ciudades.length > 6 ? ' · +' + (ciudades.length - 6) : '')]);
      else filas.push([T('Cables submarinos'), T('Ninguno con nombre en el mapa')]);
    }
    if (LUG && LUG.centros) { const cs = LUG.centros.filter((c) => c.cc === cc); const n = cs.reduce((a, c) => a + (c.n || 1), 0); if (n) { const top = cs.slice().sort((a, b) => (b.n || 1) - (a.n || 1)).slice(0, 4).map((c) => c.ciudad); filas.push([T('Centros de datos'), num(n) + ' · ' + top.join(', ')]); } }
    if (D) {
      if (D.movil) filas.push([T('Red móvil'), D.movil]);
      if (D.operadores) filas.push([T('Operadores'), D.operadores]);
      if (D.fija) filas.push([T('Fibra al hogar'), D.fija]);
      if (D.diez) filas.push([T('10G'), D.diez]);
      if (D.troncales) filas.push([T('Troncales'), D.troncales]);
      if (D.intercambio) filas.push([T('Intercambio de internet'), D.intercambio]);
      if (D.novedades) filas.push([T('Novedades'), D.novedades]);
    }
    abreModelo(modelo(T('País'), paisNombre(cc), filas, D && D.confirmado ? T('Datos verificados') : T('Datos en verificación'), {
      resumen: [T('Cables submarinos'), T('Centros de datos'), T('Red móvil')],
      para: T('El tráfico internacional de este país sale por los cables y las troncales que recoge esta ficha. Las redes móvil y fija son el primer tramo de ese recorrido.'), // 22 Oct 2026, 22:23 (owner): «la frase… a lo más profesional»
      secciones: [{ t: T('Red móvil y fija'), claves: [T('Red móvil'), T('Operadores'), T('Fibra al hogar'), '10G'], abierta: true }, { t: T('Por dónde entra internet'), claves: [T('Troncales'), T('Cables submarinos'), T('Intercambio de internet')] }, { t: T('Novedades'), claves: [T('Novedades')] }],
    }), x, y);
  }

  // ---------- drawing ----------
  function pinta(t) {
    const p = P(); if (!p) return;
    const cx = p.ctx, G = p.geo; EXTREMOS_VISTOS = null; CAMPO = campo(p, G); EST_CAJAS = []; lugaresEnIdioma(); // a frame without stations leaves no old name boxes behind
    pintaFronteras(cx, p, G); if (soloTu && document.body.classList.contains('viaje')) PAIS_CAJAS = []; else pintaPaises(cx, p, G); // the journey wants a clean planet
    // «Mi conexión» (owner, 22 Oct 2026): while the visitor looks at their own data the planet shows only that —
    // no cables, no satellites, nothing that is not theirs — so there is no doubt about what is whose.
    if (soloTu) { cx.globalCompositeOperation = 'lighter'; if (typeof soloTuPinta === 'function') soloTuPinta(cx, p, G, t); return; }
    cx.globalCompositeOperation = 'lighter';
    if (estado.tierra && capas.tierra && capas.tierra.lineas) pintaLineas(cx, p, G, capas.tierra.lineas, `rgba(${ACERO},.30)`, 0.7);
    if (estado.fibra && FT && FT.lineas) { pintaFibra(cx, p, G); pintaLuz(cx, p, G, fibraVisible(G.R / (G.R0 || G.R)), t); }
    if (estado.fibra) pintaRadio(cx, p, G);
    if (estado.sub && capas.sub && capas.sub.lineas) {
      // OpenStreetMap's cables as drawn; the ones the agency rebuilt from public sources (cables_agencia.py) are
      // an approximate sea trace, so they go dashed and a touch lighter (owner: «rotulado trazado aproximado»)
      if (!capas.sub.exactas) { capas.sub.exactas = capas.sub.lineas.filter((l) => !l.aprox); capas.sub.aprox = capas.sub.lineas.filter((l) => l.aprox); }
      // by power (owner, 22 Oct 2026): the giant trunks (≥ 100 Tbit/s) thick and bright, the big ones (≥ 20) a little
      // less, the rest as before. Grouped once per data load; CAP and LUG arrive asynchronously, so it is rebuilt when they do.
      if (!capas.sub.porPotencia || capas.sub.porPotencia.n !== capas.sub.lineas.length || capas.sub.porPotencia.cap !== CAP || capas.sub.porPotencia.lug !== LUG) {
        const P3 = { n: capas.sub.lineas.length, cap: CAP, lug: LUG, ex: [[], [], [], []], ap: [[], [], [], []] };
        capas.sub.lineas.forEach((l, i) => { (l.aprox ? P3.ap : P3.ex)[capacidadDe(i) ? potencia(i) : 3].push(l); }); // 3 = capacity not published
        capas.sub.porPotencia = P3;
      }
      // the difference grows with the zoom: on the whole planet the giants are only a little brighter (2Africa alone
      // rings a continent); close up they get their halo and their width
      const P3 = capas.sub.porPotencia, L3 = esLimpio(), zq = G.R / (G.R0 || G.R), kq = Math.min(1, Math.max(0, (zq - 1.4) / 2.6));
      const CS = CLASES.sub;
      // 23 Oct 2026: every class in its own colour (SUB_COL) and with the widths it had. The lines are painted normally, not
      // additively, so that where many cables share a corridor they keep their colour instead of adding up to white; only
      // the giants' soft halo adds up, as before. Grey first and gold last, so the biggest lie on top. A loose end fades
      // out into the sea (pintaColas).
      const traza = (ls, rgb, a, ancho) => opaco(cx, () => { pintaLineas(cx, p, G, ls, `rgba(${rgb},${a.toFixed(3)})`, ancho); pintaColas(cx, p, G, ls, rgb, a, ancho); });
      const halo = (ls, a) => { pintaLineas(cx, p, G, ls, `rgba(${SUB_COL.gigante},${a.toFixed(3)})`, 3.5 + 3 * kq); pintaColas(cx, p, G, ls, SUB_COL.gigante, a, 3.5 + 3 * kq); };
      // (the thinner classes a little more opaque than before, as the land fibre's, so that their colour reads)
      if (CS.sinDato) traza(P3.ex[3], SUB_COL.sinDato, 0.6, 0.9);
      if (CS.regional) traza(P3.ex[0], SUB_COL.regional, 0.72, 0.9);
      if (CS.grande && P3.ex[1].length) traza(P3.ex[1], SUB_COL.grande, Math.min(1, 0.7 + 0.2 * kq), 1 + 0.3 * kq);
      if (CS.gigante && P3.ex[2].length) { halo(P3.ex[2], (L3 ? 0.2 : 0.14) + 0.12 * kq); traza(P3.ex[2], SUB_COL.gigante, 0.92 + 0.08 * kq, 1.3 + 0.7 * kq); }
      // 23 Oct 2026, 08:16 (owner): «una línea fina discontinua… que va y viene, así la pantalla está viva». The planned
      // cables (short dashes) and the approximate routes (longer ones) breathe: their dashes slide gently back and forth.
      // Each in the colour of its capacity when it is known, grey otherwise.
      const vaiven = (fase) => QUIETO ? 0 : 9 * Math.sin((t || 0) / 1100 + fase);
      // planned cables in dots of their capacity colour, as the legend shows them; the approximate routes of cables in
      // service keep their long dashes (agency round 31, both voices: «que no se confunda lo aproximado con lo que aún no existe»)
      if (CS.previstos && PREV && PREV.length) { cx.save(); cx.lineCap = 'round'; cx.setLineDash([0.1, 4.4]); cx.lineDashOffset = vaiven(0); for (const k of ['sinDato', 'regional', 'grande', 'gigante']) { const ls = PREV.filter((q) => (q.clase || (q.clase = clasePrev(q.c))) === k); if (ls.length) traza(ls, SUB_COL[k], 0.7, 1.6); } cx.restore(); }
      if (CS.aprox && capas.sub.aprox.length) {
        cx.setLineDash([7, 5]); cx.lineDashOffset = vaiven(1.7);
        const todas = sinPotencia();
        if (CS.sinDato || todas) traza(P3.ap[3], SUB_COL.sinDato, 0.55, 0.9);
        if (CS.regional || todas) traza(P3.ap[0], SUB_COL.regional, 0.66, 0.9);
        if ((CS.grande || todas) && P3.ap[1].length) traza(P3.ap[1], SUB_COL.grande, 0.62 + 0.2 * kq, 1 + 0.3 * kq);
        if ((CS.gigante || todas) && P3.ap[2].length) { halo(P3.ap[2], (L3 ? 0.18 : 0.12) + 0.1 * kq); traza(P3.ap[2], SUB_COL.gigante, 0.85 + 0.12 * kq, 1.3 + 0.7 * kq); }
        cx.setLineDash([]); cx.lineDashOffset = 0;
      }
      pintaLuz(cx, p, G, subVisibles(), t);
    }
    if (estado.puntos && PT && PT.p) { cx.globalCompositeOperation = 'source-over'; pintaPuntos(cx, p, G); pintaEstaciones(cx, p, G); pintaCiudades(cx, p, G); cx.globalCompositeOperation = 'lighter'; if (puntoMarcado >= 0) pintaRuta(cx, p, G, t); }
    else if (estado.sub && EST) { cx.globalCompositeOperation = 'source-over'; pintaEstaciones(cx, p, G); cx.globalCompositeOperation = 'lighter'; } // 22 Oct 2026, 14:15 (owner): the polar stations show with the cables too
    if (estado.sub && capas.sub && capas.sub.lineas) {
      // what the pointer touches lights up in its own colour: the whole cable (every piece joined to the one touched), the
      // planned cable, or every cable of a landing
      if (cableMarcado >= 0) for (const j of cadenaDe(cableMarcado)) { const l = capas.sub.lineas[j]; if (l) resalta(cx, p, G, [l], colorSub(j)); }
      if (previstoMarcado >= 0 && PREV && PREV[previstoMarcado]) { const q = PREV[previstoMarcado]; cx.save(); cx.lineCap = 'round'; cx.setLineDash([0.1, 5]); resalta(cx, p, G, [q], SUB_COL[q.clase || (q.clase = clasePrev(q.c))]); cx.restore(); } // the planned cable under the pointer lights up like the real ones (owner, 22 Oct 2026, 17:57)
      if (llegadaMarcada >= 0 && LUG && LUG.llegadas) for (const j of LUG.llegadas[llegadaMarcada].seg) { const l = capas.sub.lineas[j]; if (l) resalta(cx, p, G, [l], colorSub(j)); }
      pintaLlegadas(cx, p, G);
      pintaNombresLlegadas(cx, p, G);
      { const ze = G.R / (G.R0 || G.R); if (ze >= 4) { pintaExtremos(cx, p, G, capas.sub.lineas, ze, BLANCO); if (PREV && PREV.length) pintaExtremos(cx, p, G, PREV, ze, BLANCO); } }
    }
    if (estado.sat && S && S.N) pintaSat(cx, p, G, t);
  }
  // The light inside the fibre (owner, 20 Oct 2026: «how the data travels, in the right direction»).
  // True to the physics: every submarine fibre carries data both ways at once, at the same speed (light in glass,
  // about 200,000 km/s). Shown in slow motion, the same speed on every cable; nothing here claims real traffic.
  const VLUZ = 0.11;        // radians of the planet per second on screen (slow motion)
  const PASO = 0.42;        // one pulse every this many radians of cable, in each direction
  function puntoEn(l, s) {
    let a = 0, b = l.acc.length - 1;
    while (b - a > 1) { const m = (a + b) >> 1; if (l.acc[m] <= s) a = m; else b = m; }
    const d = l.acc[b] - l.acc[a] || 1, f = (s - l.acc[a]) / d, A = l.w[a], B = l.w[b];
    return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f];
  }
  function pintaLuz(cx, p, G, lineas, t) {
    if (QUIETO) return;
    const cola = [0, 0.012, 0.024], alfa = [0.95, 0.42, 0.16], tam = [1.7, 1.4, 1.1];
    for (let c = 0; c < 3; c++) {
      cx.fillStyle = c ? `rgba(${ACERO},${alfa[c]})` : `rgba(${BLANCO},${alfa[c]})`;
      const h = tam[c] / 2;
      // many short land links (Topology Zoo gives thousands): skip the lights on the lines facing away and keep
      // the pulse count bounded, so the planet stays smooth on a modest computer
      const salto = lineas.length > 2500 ? Math.ceil(lineas.length / 2500) : 1, F = CAMPO || campo(p, G);
      for (let li = 0; li < lineas.length; li++) {
        const l = lineas[li];
        if (l.L < 0.01) continue;
        // the big trunks and long routes always carry their lights, and bigger ones, so the flow shows over their
        // thick, bright line too (owner, 24 Oct 2026, 13:49: «en las grandes troncales… no se ve el movimiento»)
        const rg = rangoFibra(l) || 0;
        if (rg < 2 && salto > 1 && li % salto) continue;
        const esc = rg >= 3 ? 2.3 : rg === 2 ? 1.6 : 1, tm = tam[c] * esc, hm = tm / 2;
        if (!F.todo) { capsDe(l); if (!veCap(F, l.cap)) continue; }
        if (l.w && l.w.length && p.aVista(l.w[0])[2] <= 0.02 && p.aVista(l.w[l.w.length - 1])[2] <= 0.02) continue;
        const n = Math.max(1, Math.round(l.L / PASO)), sep = l.L / n;
        for (let dir = 0; dir < 2; dir++) {
          const base = ((t * VLUZ + l.fase * sep + dir * sep / 2) % sep);
          for (let k = 0; k < n; k++) {
            let s = base + k * sep - cola[c];
            if (s < 0) continue;
            if (dir) s = l.L - s;
            if (l.colas && (s < l.acc[l.d0] || s > l.acc[l.d1])) continue; // no light in a stretch that fades out into the sea
            const v = p.aVista(puntoEn(l, s));
            if (v[2] <= 0.02) continue;
            cx.fillRect(G.CX + G.R * v[0] - hm, G.CY - G.R * v[1] - hm, tm, tm);
          }
        }
      }
    }
  }
  // ---------- what the screen can see (22 Oct 2026, 19:05: deep in, almost every line is off screen) ----------
  // The visible part of the planet is a cap around the view direction; its angular radius comes from the farthest
  // screen corner. A line (or a chunk of a long one) whose own cap does not touch it is not even projected.
  let CAMPO = null;
  function campo(p, G) {
    const v = p.vista, d = p.vec(v.lon, v.lat);
    const dm = Math.max(Math.hypot(G.CX, G.CY), Math.hypot(G.W - G.CX, G.CY), Math.hypot(G.CX, G.H - G.CY), Math.hypot(G.W - G.CX, G.H - G.CY)) + 80;
    const todo = dm >= G.R * 0.995, ang = todo ? Math.PI / 2 : Math.asin(dm / G.R);
    return { d, ang, todo, cosP: Math.cos(Math.min(Math.PI / 2, ang + 0.0015)) };
  }
  const capDe = (w, i0, i1) => {
    let x = 0, y = 0, z = 0; for (let i = i0; i <= i1; i++) { x += w[i][0]; y += w[i][1]; z += w[i][2]; }
    const m = Math.hypot(x, y, z) || 1; x /= m; y /= m; z /= m; let mn = 1;
    for (let i = i0; i <= i1; i++) { const q = w[i], mq = Math.hypot(q[0], q[1], q[2]) || 1, d = (q[0] * x + q[1] * y + q[2] * z) / mq; if (d < mn) mn = d; }
    return { i0, i1, c: [x, y, z], r: Math.acos(Math.max(-1, Math.min(1, mn))) };
  };
  function capsDe(l) {
    if (l.caps) return l.caps;
    const w = l.w, n = w.length, out = [];
    for (let i0 = 0; i0 < n - 1; i0 += 24) out.push(capDe(w, i0, Math.min(n - 1, i0 + 24)));
    l.cap = capDe(w, 0, n - 1); l.caps = out; return out;
  }
  const veCap = (F, cp) => F.d[0] * cp.c[0] + F.d[1] * cp.c[1] + F.d[2] * cp.c[2] >= Math.cos(Math.min(Math.PI, F.ang + cp.r));
  // the submarine cables that show with the classes switched on now (cached while nothing changes)
  function subVisibles() {
    const k = claveClases('sub') + '|' + capas.sub.lineas.length + '|' + (CAP ? 1 : 0);
    if (capas.sub.visK !== k) { capas.sub.visK = k; capas.sub.vis = capas.sub.lineas.filter((l, i) => veSub(i, l)); }
    return capas.sub.vis;
  }
  // what the pointer touches: a soft halo and a brighter, wider core in the line's own colour
  // 23 Oct 2026: the grey of «capacidad no publicada» lit at full strength read as white; it lights a darker,
  // slightly blue grey instead, so it is still grey under the pointer
  const GRIS_RESALTE = '136,146,162';
  function resalta(cx, p, G, lineas, rgb) { if (rgb === FIBRA_COL[0]) rgb = GRIS_RESALTE; pintaLineas(cx, p, G, lineas, `rgba(${rgb},.22)`, 7); pintaColas(cx, p, G, lineas, rgb, 0.22, 7); opaco(cx, () => { pintaLineas(cx, p, G, lineas, `rgba(${rgb},1)`, 2.3); pintaColas(cx, p, G, lineas, rgb, 1, 2.3); }); }
  // paint something without the additive glow (so a blue stays blue), then go back to how the layer was painting
  function opaco(cx, f) { const g = cx.globalCompositeOperation; cx.globalCompositeOperation = 'source-over'; f(); cx.globalCompositeOperation = g; }
  function pintaLineas(cx, p, G, lineas, color, ancho) {
    const F = CAMPO || campo(p, G);
    cx.strokeStyle = color; cx.lineWidth = ancho; cx.beginPath();
    for (const l of lineas) {
      const w = l.w; if (!w || w.length < 2) continue;
      // a cable whose open data stop in the sea: its last stretch is drawn apart, fading out (pintaColas)
      const a = l.colas ? l.d0 : 0, b = l.colas ? l.d1 : w.length - 1;
      if (F.todo) { trazoW(cx, p, G, w, a, b); continue; }
      const caps = capsDe(l); if (!veCap(F, l.cap)) continue;
      for (const cp of caps) { if (!veCap(F, cp)) continue; const i0 = Math.max(a, cp.i0), i1 = Math.min(b, cp.i1); if (i1 > i0) trazoW(cx, p, G, w, i0, i1); }
    }
    cx.stroke();
  }
  // the last stretch before a loose end: its own colour and width, fading to nothing where the open data stop
  function pintaColas(cx, p, G, lineas, rgb, alfa, ancho) {
    const F = CAMPO || campo(p, G);
    for (const l of lineas) {
      if (!l.colas) continue;
      if (!F.todo) { capsDe(l); if (!veCap(F, l.cap)) continue; }
      for (const q of l.colas) {
        const paso = q.hasta > q.desde ? 1 : -1, pts = [];
        for (let j = q.desde; ; j += paso) { const v = p.aVista(l.w[j]); pts.push(v[2] > 0.02 ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null); if (j === q.hasta) break; }
        const vis = pts.filter(Boolean); if (vis.length < 2) continue;
        const a = vis[0], b = vis[vis.length - 1];
        const gr = cx.createLinearGradient(a[0], a[1], b[0], b[1]);
        gr.addColorStop(0, `rgba(${rgb},${alfa.toFixed(3)})`); gr.addColorStop(0.55, `rgba(${rgb},${(alfa * 0.4).toFixed(3)})`); gr.addColorStop(1, `rgba(${rgb},0)`);
        cx.strokeStyle = gr; cx.lineWidth = ancho; cx.beginPath();
        let prev = false; for (const s of pts) { if (s && prev) cx.lineTo(s[0], s[1]); else if (s) cx.moveTo(s[0], s[1]); prev = !!s; }
        cx.stroke();
      }
    }
  }
  function trazoW(cx, p, G, w, i0, i1) {
    let prev = false;
    for (let i = i0; i <= i1; i++) {
      const v = p.aVista(w[i]), x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], ve = v[2] > 0.02;
      if (ve && prev) cx.lineTo(x, y); else if (ve) cx.moveTo(x, y);
      prev = ve;
    }
  }
  // ---------- satellites at full quality (owner, 22 Oct 2026: «mucho más realistas y de máxima calidad») ----------
  // Three silhouettes, drawn once per size and angle at the screen's own resolution (no blur at any zoom):
  //   0 Starlink-like broadband fleets: a flat body with one long solar wing, as the real ones fly;
  //   1 other low and medium orbits (Iridium, OneWeb, GPS-like): a box with two wings;
  //   2 geostationary: a bigger box, two long wings and the dish facing the Earth.
  // The wings lie across the direction of travel; geostationary wings point north–south, as they do in orbit.
  // Brightness follows the real Sun: dim in the Earth's shadow, brightest when the Sun lights the face we see.
  const ANG = 24;                                   // one pre-drawn sprite every 15°
  const FORMA = [{ largo: 7, kind: 0 }, { largo: 8.6, kind: 1 }, { largo: 12, kind: 2 }]; // owner, 22 Oct 2026: «mayor resolución y contraste»
  let SPR = null, sprDPR = 0;
  function dibujaForma(g, kind, L, s) {
    // L: wing span in device pixels; drawn around (0,0) with the wings along the x axis
    const panel = (x0, x1, h) => {
      const gr = g.createLinearGradient(0, -h, 0, h);
      gr.addColorStop(0, 'rgba(176,210,238,1)'); gr.addColorStop(0.5, `rgba(${ACERO},1)`); gr.addColorStop(1, 'rgba(98,140,180,1)');
      g.fillStyle = gr; g.fillRect(x0, -h, x1 - x0, 2 * h);
      if (L > 18) { // solar cells, only where the eye can see them
        g.strokeStyle = 'rgba(6,8,12,.55)'; g.lineWidth = Math.max(0.6, s * 0.35);
        const n = Math.max(2, Math.round(Math.abs(x1 - x0) / (h * 1.6)));
        g.beginPath();
        for (let k = 1; k < n; k++) { const x = x0 + (x1 - x0) * k / n; g.moveTo(x, -h); g.lineTo(x, h); }
        g.moveTo(x0, 0); g.lineTo(x1, 0); g.stroke();
      }
    };
    const cuerpo = (w, h) => {
      const gr = g.createLinearGradient(-w, -h, w, h);
      gr.addColorStop(0, `rgba(${BLANCO},1)`); gr.addColorStop(1, 'rgba(196,206,216,1)');
      g.fillStyle = gr; g.fillRect(-w, -h, 2 * w, 2 * h);
    };
    const brazo = (x0, x1) => { g.fillStyle = 'rgba(200,214,228,.9)'; g.fillRect(Math.min(x0, x1), -Math.max(0.5, s * 0.3), Math.abs(x1 - x0), Math.max(1, s * 0.6)); };
    if (kind === 0) {
      const hb = L * 0.13, wb = L * 0.16, hp = L * 0.15;
      panel(wb + L * 0.04, L * 0.5, hp); brazo(wb, wb + L * 0.05);
      cuerpo(wb, hb);
      g.fillStyle = `rgba(${BLANCO},1)`; g.fillRect(-wb, -hb, 2 * wb, Math.max(1, hb * 0.5)); // the flat antenna deck
    } else if (kind === 1) {
      const wb = L * 0.11, hb = L * 0.12, hp = L * 0.12;
      panel(-L * 0.5, -wb - L * 0.06, hp); panel(wb + L * 0.06, L * 0.5, hp);
      brazo(-wb - L * 0.06, -wb); brazo(wb, wb + L * 0.06);
      cuerpo(wb, hb);
    } else {
      const wb = L * 0.1, hb = L * 0.1, hp = L * 0.085;
      panel(-L * 0.5, -wb - L * 0.08, hp); panel(wb + L * 0.08, L * 0.5, hp);
      brazo(-wb - L * 0.08, -wb); brazo(wb, wb + L * 0.08);
      cuerpo(wb, hb);
      g.fillStyle = `rgba(${BLANCO},1)`; g.beginPath(); g.ellipse(0, hb + L * 0.035, wb * 0.9, L * 0.04, 0, 0, 7); g.fill(); // the dish
    }
  }
  function sprite(kind, z, ang) {
    const dpr = (P().geo.DPR) || 1;
    if (!SPR || sprDPR !== dpr) { SPR = new Map(); sprDPR = dpr; }
    const zb = z < 1.35 ? 0 : z < 1.75 ? 1 : z < 2.4 ? 2 : z < 3.4 ? 3 : z < 4.4 ? 4 : 5;
    const key = kind * 1000 + zb * 100 + ang;
    let sp = SPR.get(key);
    if (sp) return sp;
    const css = FORMA[kind].largo * [0.8, 1.15, 1.6, 2.05, 2.6, 3.1][zb]; // small on the whole planet (no crowd), bigger as you come closer          // wing span in CSS pixels at this zoom
    // drawn at twice the screen's own resolution and scaled down when painted: clean edges at any zoom
    const halo = css * 0.5 + 3, d = Math.ceil(2 * halo), px = Math.ceil(d * dpr * 2);
    const c = document.createElement('canvas'); c.width = c.height = px;
    const g = c.getContext('2d'), m = px / 2;
    // a soft glow first, so a satellite still reads as light against the night side of the planet
    const gr = g.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, `rgba(${kind === 2 ? BLANCO : ACERO},.55)`); gr.addColorStop(0.35, `rgba(${ACERO},.16)`); gr.addColorStop(1, `rgba(${ACERO},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, px, px);
    g.translate(m, m); g.rotate(ang * 2 * Math.PI / ANG);
    // a dark rim under the shape: it stands out on the bright day side as well as on the night
    g.save(); g.shadowColor = 'rgba(6,8,12,.95)'; g.shadowBlur = 2.2 * dpr * 2; dibujaForma(g, kind, css * dpr * 2, dpr * 2); g.restore();
    dibujaForma(g, kind, css * dpr * 2, dpr * 2);
    sp = { img: c, d };
    SPR.set(key, sp);
    return sp;
  }

  // the orbit of the satellite under the pointer: its next lap, computed with SGP4 (not a drawn circle)
  let ESTELA = null;
  function estela(i, ahora) {
    if (ESTELA && ESTELA.i === i && ahora - ESTELA.t < 3000) return ESTELA;
    const r = S.rec[i], periodo = 2 * Math.PI / (r.no || 0.06);       // minutes
    const pts = [], n = 160, desde = -0.12 * periodo, hasta = 0.88 * periodo;
    for (let k = 0; k <= n; k++) {
      const m = desde + (hasta - desde) * k / n, ms = ahora + m * 60000;
      let pv = null;
      try { pv = window.satellite.sgp4(r, (ms / 86400000 + 2440587.5 - r.jdsatepoch) * 1440); } catch (_) {}
      if (!pv || !pv.position || typeof pv.position === 'boolean' || !isFinite(pv.position.x)) { pts.push(null); continue; }
      const gm = window.satellite.gstime(new Date(ms)), cg = Math.cos(gm), sg = Math.sin(gm);
      const X = pv.position.x, Y = pv.position.y, Z = pv.position.z;
      const ex = X * cg + Y * sg, ey = -X * sg + Y * cg, ez = Z, rr = Math.hypot(ex, ey, ez), f = escala(rr) / rr;
      pts.push({ w: [ey * f, ez * f, ex * f], futuro: m >= 0 });
    }
    ESTELA = { i, t: ahora, pts, geo: periodo > 1300 };
    return ESTELA;
  }
  function pintaEstela(cx, p, G, i, ahora) {
    const e = estela(i, ahora); if (e.geo) return;                    // a geostationary satellite stays over one spot
    const n = e.pts.length, R = G.R;
    cx.lineCap = 'round';
    let prev = null;
    for (let k = 0; k < n; k++) {
      const q = e.pts[k]; if (!q) { prev = null; continue; }
      const v = p.aVista(q.w), x = G.CX + R * v[0], y = G.CY - R * v[1];
      const ve = v[2] > 0 || v[0] * v[0] + v[1] * v[1] > 1;
      if (prev && ve && prev.ve) {
        // the lap ahead fades out; the short stretch behind is a faint wake
        const a = q.futuro ? 0.55 * (1 - k / n) + 0.06 : 0.24 * (k / (n * 0.12));
        cx.strokeStyle = `rgba(${q.futuro ? BLANCO : ACERO},${Math.max(0, Math.min(0.6, a)).toFixed(3)})`;
        cx.lineWidth = q.futuro ? 1.1 : 0.8;
        cx.beginPath(); cx.moveTo(prev.x, prev.y); cx.lineTo(x, y); cx.stroke();
      }
      prev = { x, y, ve };
    }
  }

  function pintaSat(cx, p, G, t) {
    const ahora = Date.now(), N = S.N;
    // refresh about 1/120 of the fleet per frame: every satellite is recomputed every two seconds or so
    const lote = Math.max(60, Math.ceil(N / 120));
    for (let k = 0; k < lote; k++) { propaga(S.cursor, ahora); S.cursor = (S.cursor + 1) % N; }
    const gm = window.satellite.gstime(new Date(ahora)), cg = Math.cos(gm), sg = Math.sin(gm);
    const L = p.lugar, cuentaArriba = L && ahora - S.tArriba > 4000;
    let ox = 0, oy = 0, oz = 0, ux = 0, uy = 0, uz = 0, n = 0;
    if (cuentaArriba) { const a = L.lat * RAD, b = L.lon * RAD; ux = Math.cos(a) * Math.cos(b); uy = Math.cos(a) * Math.sin(b); uz = Math.sin(a); ox = ux * RE; oy = uy * RE; oz = uz * RE; }
    const R = G.R, CX = G.CX, CY = G.CY;
    // the real Sun (computed in orbita.js): a satellite inside the Earth's shadow is not lit, so it is drawn dim
    const sol = window.OrbitaSol ? window.OrbitaSol() : null;
    let sx0 = 0, sy0 = 0, sz0 = 0;
    if (sol) { const a = sol.lat * RAD, b = sol.lon * RAD; sx0 = Math.cos(a) * Math.cos(b); sy0 = Math.cos(a) * Math.sin(b); sz0 = Math.sin(a); }
    // where the viewer looks from, in the planet's frame: the Sun behind the viewer lights the whole face we see
    const c0 = p.aVista([1, 0, 0])[2], c1 = p.aVista([0, 1, 0])[2], c2 = p.aVista([0, 0, 1])[2];
    const fase = sol ? (1 + sy0 * c0 + sz0 * c1 + sx0 * c2) / 2 : 1;   // 0 back-lit … 1 front-lit (same Sun for all)
    const capasPinta = [[], [], []];
    const cuentaOrb = { baja: 0, media: 0, geo: 0 }; let nSel = 0;
    const suma = { baja: { n: 0, alto: 0, periodo: 0 }, media: { n: 0, alto: 0, periodo: 0 }, geo: { n: 0, alto: 0, periodo: 0 } };
    const z = G.R / (G.R0 || G.R), paso = z < 1.35 ? 10 : z < 1.75 ? 5 : 3; S.paso = paso; // starlink-like low fleet, other low/medium, geostationary
    if (!S.ang) S.ang = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      if (!S.ok[i]) { S.vis[i] = 0; continue; }
      const k = i * 3, dt = (ahora - S.t[i]) / 1000;
      const X = S.pos[k] + S.vel[k] * dt, Y = S.pos[k + 1] + S.vel[k + 1] * dt, Z = S.pos[k + 2] + S.vel[k + 2] * dt;
      // TEME → Earth-fixed
      const ex = X * cg + Y * sg, ey = -X * sg + Y * cg, ez = Z;
      const r = Math.hypot(ex, ey, ez), f = escala(r) / r;
      const v = p.aVista([ey * f, ez * f, ex * f]);
      const ve = v[2] > 0 || v[0] * v[0] + v[1] * v[1] > 1;
      S.vis[i] = ve ? 1 : 0;
      if (cuentaArriba) {
        const dx = ex - ox, dy = ey - oy, dz = ez - oz, d = Math.hypot(dx, dy, dz);
        const el = Math.asin((dx * ux + dy * uy + dz * uz) / d);
        S.arriba[i] = el > 25 * RAD ? 1 : 0; if (S.arriba[i]) n++;
      }
      // what this view shows (owner + agency, 20 Oct 2026): never hidden without saying so; the count is on screen
      const alto = r - RE, banda = alto < 2000 ? 'baja' : alto < 30000 ? 'media' : 'geo';
      cuentaOrb[banda]++;
      if (cuentaArriba || !S.medias) { const q = suma[banda]; q.n++; q.alto += alto; q.periodo += 2 * Math.PI / S.rec[i].no; }
      let sel = estado.orb[banda];
      if (sel && estado.vista === 'equilibrada' && S.g[i] === 0) sel = S.norad[i] % paso === 0;
      if (sel && estado.vista === 'cielo') sel = !!S.arriba[i];
      S.dib[i] = sel ? 1 : 0; if (sel) nSel++;
      if (!ve || !sel) continue;
      const x = CX + R * v[0], y = CY - R * v[1];
      S.sx[i] = x; S.sy[i] = y;
      let sombra = 0;
      if (sol) { const d = ex * sx0 + ey * sy0 + ez * sz0; if (d < 0 && r * r - d * d < RE * RE) sombra = 1; }
      S.sombra[i] = sombra;
      const kind = alto > 30000 ? 2 : S.g[i] === 0 ? 0 : 1;
      // which way it flies on the screen: wings across the motion; geostationary wings along the north–south axis
      let dx, dy;
      if (kind === 2) { const w = p.aVista([ey * f, ez * f + 0.05, ex * f]); dx = w[0] - v[0]; dy = -(w[1] - v[1]); }
      else {
        const q = 20, X2 = X + S.vel[k] * q, Y2 = Y + S.vel[k + 1] * q, Z2 = Z + S.vel[k + 2] * q;
        const e2x = X2 * cg + Y2 * sg, e2y = -X2 * sg + Y2 * cg, f2 = escala(Math.hypot(e2x, e2y, Z2)) / Math.hypot(e2x, e2y, Z2);
        const w = p.aVista([e2y * f2, Z2 * f2, e2x * f2]); dx = -(w[1] - v[1]); dy = -(w[0] - v[0]); // perpendicular
      }
      S.ang[i] = ((Math.round(Math.atan2(dy, dx) / (2 * Math.PI) * ANG) % ANG) + ANG) % ANG;
      capasPinta[kind].push(sombra ? -1 - i : i);
    }
    if (cuentaArriba) { S.nArriba = n; S.tArriba = ahora; }
    if (cuentaArriba || !S.medias) { S.medias = {}; for (const b of ['baja', 'media', 'geo']) { const q = suma[b]; S.medias[b] = q.n ? { n: q.n, alto: q.alto / q.n, periodo: q.periodo / q.n } : null; } }
    const cambia = nSel !== S.nSel || cuentaArriba; S.nSel = nSel; S.cuentaOrb = cuentaOrb;
    if (cambia) { pintaNota(); pintaVista(); }
    if (marcado >= 0 && S.vis[marcado] && S.dib[marcado]) pintaEstela(cx, p, G, marcado, ahora);
    // in sunlight, brighter the more of its lit face we see; in the Earth's shadow, only a faint shape
    const luz = 0.8 + 0.2 * fase;
    for (let c = 0; c < 3; c++) {
      for (const j of capasPinta[c]) {
        const sombra = j < 0, i = sombra ? -1 - j : j;
        const sp = sprite(c, z, S.ang[i]), h = sp.d / 2;
        cx.globalAlpha = sombra ? 0.4 : luz;
        cx.drawImage(sp.img, S.sx[i] - h, S.sy[i] - h, sp.d, sp.d);
      }
    }
    cx.globalAlpha = 1;
    // the ones over your sky right now: a quiet ring each
    if (L) {
      cx.strokeStyle = `rgba(${BLANCO},.7)`; cx.lineWidth = 1; cx.beginPath();
      const rr = 3.2 + 1.6 * Math.min(2, z - 1);
      for (let i = 0; i < N; i++) if (S.arriba[i] && S.vis[i] && S.dib[i]) { cx.moveTo(S.sx[i] + rr + 2, S.sy[i]); cx.arc(S.sx[i], S.sy[i], rr + 2, 0, 7); }
      cx.stroke();
    }
    if (marcado >= 0 && S.vis[marcado]) {
      cx.strokeStyle = `rgba(${BLANCO},.95)`; cx.lineWidth = 1.4;
      cx.beginPath(); cx.arc(S.sx[marcado], S.sy[marcado], 7 + 2 * Math.min(2, z - 1), 0, 7); cx.stroke();
    }
  }

  // ---------- the line under the planet: what is shown, from where, how fresh ----------
  // 25 Oct 2026 (agency round 39, two voices: «¿Cómo lo sabemos?»): the sources and the date of the data, as a date
  const fechaIso = (iso) => { if (!iso) return ''; const t = Date.parse(iso); if (!Number.isFinite(t)) return ''; try { return new Date(t).toLocaleDateString((window.GuardianaIdioma && window.GuardianaIdioma.locale) || 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (_) { return iso.slice(0, 10); } };
  const dominios = (lista) => (lista || []).map((u) => { const m = String(u).match(/^https?:\/\/([^/]+)/); return m ? m[1].replace(/^www\./, '') : String(u); }).filter((x, i, a) => x && a.indexOf(x) === i).slice(0, 4).join(' · ');
  const hace = (iso) => { const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000)); return m < 60 ? m + ' min' : Math.round(m / 60) + ' h'; };
  const haceTxt = (x) => { const l = window.GuardianaIdioma && window.GuardianaIdioma.lang; return l === 'en' ? x + ' ago' : l === 'pt' ? 'há ' + x : 'hace ' + x; };
  const num = (n) => n.toLocaleString((window.GuardianaIdioma && window.GuardianaIdioma.locale) || 'es-ES');
  function pintaNota() {
    try { if (typeof pintaClases === 'function') pintaClases(); } catch (_) {} // the class counts follow the data as it arrives
    const el = $('capa-nota'); if (!el) return;
    const partes = [], porCapa = {};
    const meter = (k, txt) => { partes.push(txt); porCapa[k] = txt; };
    if (estado.sat) {
      if (S && S.N) {
        const vistaTxt = estado.vista === 'todos' && estado.orb.baja && estado.orb.media && estado.orb.geo ? num(S.N) + ' ' + T('satélites de datos')
          : T('Mostrando') + ' ' + num(S.nSel || 0) + ' ' + T('de') + ' ' + num(S.N) + ' ' + T('satélites de datos') + (estado.vista === 'equilibrada' && estado.orb.baja && (S.paso || 10) > 1 ? ' (' + T('Starlink: 1 de cada') + ' ' + (S.paso || 10) + ')' : estado.vista === 'cielo' ? ' (' + T('a más de 25° sobre tu horizonte') + ')' : '');
        // the oldest group on the map sets the age (a group whose download came back empty keeps its previous one)
        const fechaSat = (S.d.grupos || []).filter((g) => g.n && g.descargado).map((g) => g.descargado).sort()[0] || S.d.descargado;
        let s = vistaTxt + ' · ' + T('Datos verificados') + ', ' + haceTxt(hace(fechaSat)) + ' · ' + T('posición calculada ahora');
        const L = P() && P().lugar;
        if (L && S.tArriba) s += ' · ' + T('sobre') + ' ' + L.nombre + ': ' + num(S.nArriba);
        meter('sat', s);
      } else if (S && S.error) meter('sat', T('No se pudieron cargar los satélites.'));
      else meter('sat', T('Cargando satélites…'));
    }
    if (estado.sub) {
      const c = capas.sub;
      meter('sub', c && c.d ? num(cuentaCables(() => true) || c.nombres) + ' ' + T('cables submarinos con nombre') + (CAP && Object.keys(CAP.cables).length ? ' · ' + T('color por capacidad: dorado y grueso con halo, más de 100 Tbit/s; lavanda, de 20 a 100 Tbit/s; verde agua, menos de 20 Tbit/s; gris, capacidad no publicada') : '') + ' · ' + T('Datos verificados') + ' · ' + T('puede faltar alguno') + ' · ' + T('la luz viaja en los dos sentidos a la vez, a cámara lenta: cruza el Atlántico en unos 30 ms') : c && c.error ? T('No se pudieron cargar los cables.') : T('Cargando cables…'));
    }
    if (estado.fibra) {
      meter('fibra', FT && FT.d ? num(FT.d.medida.km) + ' km ' + T('de fibra troncal por tierra en') + ' ' + num(FT.d.medida.paises.length) + ' ' + T('países') + ' · ' + T('trazados aproximados de redes reales') + ' · ' + T('por niveles: de lejos solo las troncales principales; las nacionales y las regionales aparecen al acercarse') + (RD && RD.lineas && RD.lineas.length ? ' · ' + num(RD.lineas.length) + ' ' + T('radioenlaces de microondas, punteados, donde no hay fibra') : '') + ' · ' + T('Datos verificados') : FT && FT.error ? T('No se pudieron cargar los cables por tierra.') : T('Cargando los cables por tierra…'));
    }
    if (estado.tierra) {
      const c = capas.tierra;
      meter('tierra', c && c.d ? num(c.nombres) + ' ' + T('cables de tierra con nombre') + ' · ' + T('Datos verificados') + ' · ' + T('solo una parte de la fibra') : c && c.error ? T('No se pudieron cargar los cables de tierra.') : T('Cargando cables de tierra…'));
    }
    if (estado.puntos) {
      const m = PT && PT.d && PT.d.medida;
      meter('puntos', m ? num(m.datos) + ' ' + T('centros de datos') + ' · ' + T('Datos verificados') + ' · ' + T('cobertura parcial') : PT && PT.error ? T('No se pudieron cargar los puntos.') : T('Cargando puntos…'));
    }
    el.textContent = partes.join('   ·   ');
    // 21 Oct 2026 (owner): no text under the planet; the same facts live under the pointer on each button. 23 Oct 2026,
    // 23:32 (owner): not the browser's long tooltip but a designed square card (fichaCapa, below), so no title here
    for (const k of Object.keys(porCapa)) { const b = document.querySelector(`#capas [data-capa="${k}"]`); if (b) b.removeAttribute('title'); }
    try { refrescaFichaCapa(); } catch (_) {}
    el.hidden = true;
    document.body.classList.toggle('ver-sat', estado.sat);
    if (estado.sat) el.title = T('Satélites bajos a su altura real; los de órbita media y geoestacionaria, en los anillos exteriores (distancia no a escala). Su brillo sigue al Sol de ahora: más tenues los que están en la sombra de la Tierra. Pase el ratón por uno para ver su próxima vuelta.');
    else el.removeAttribute('title');
  }

  // ---------- a satellite under the pointer: its name, its fleet, its height ----------
  let marcado = -1;
  const ficha = () => $('sat-ficha');
  function busca(x, y) {
    if (!S || !S.N || !estado.sat) return -1;
    let mejor = -1, d2 = 81;
    for (let i = 0; i < S.N; i++) { if (!S.vis[i] || !S.dib[i]) continue; const dx = S.sx[i] - x, dy = S.sy[i] - y, q = dx * dx + dy * dy; if (q < d2) { d2 = q; mejor = i; } }
    return mejor;
  }
  // ---------- everything real we know about one satellite (owner, 22 Oct 2026: «más información de cada uno,
  // siempre real») ----------
  // Who runs each fleet and what it is for: the operators' own descriptions of their service.
  const FLOTA = {
    starlink: ['SpaceX', 'US', 'Internet por satélite para hogares, barcos y aviones'],
    oneweb: ['Eutelsat OneWeb', 'GB', 'Internet por satélite para empresas, gobiernos y aviones'],
    kuiper: ['Amazon (Proyecto Kuiper)', 'US', 'Internet por satélite, en despliegue'],
    qianfan: ['Shanghai Spacecom Satellite Technology', 'CN', 'Internet por satélite, en despliegue'],
    hulianwang: ['China Satellite Network Group', 'CN', 'Red estatal china de internet por satélite, en despliegue'],
    'iridium-NEXT': ['Iridium Communications', 'US', 'Teléfonos y datos por satélite en todo el planeta, también en los polos'],
    globalstar: ['Globalstar', 'US', 'Teléfonos satelitales y mensajes de emergencia por satélite'],
    orbcomm: ['ORBCOMM', 'US', 'Datos de máquinas: seguimiento de barcos, camiones y contenedores'],
    ses: ['SES', 'LU', 'Televisión, internet y comunicaciones'],
    intelsat: ['Intelsat (grupo SES)', 'LU', 'Televisión, internet y comunicaciones'],
    eutelsat: ['Eutelsat', 'FR', 'Televisión e internet'],
    telesat: ['Telesat', 'CA', 'Televisión y comunicaciones'],
  };
  // CelesTrak's launch-site codes (SATCAT) for the sites these fleets fly from
  const BASES = {
    AFETR: ['Cabo Cañaveral', 'US'], AFWTR: ['Vandenberg', 'US'], TYMSC: ['Baikonur', 'KZ'], PKMTR: ['Plesetsk', 'RU'],
    VOSTO: ['Vostochny', 'RU'], JSC: ['Jiuquan', 'CN'], TSC: ['Taiyuan', 'CN'], XSC: ['Xichang', 'CN'], WSC: ['Wenchang', 'CN'],
    FRGUI: ['Kourou', 'GF'], SRILR: ['Sriharikota', 'IN'], RLLB: ['Mahia', 'NZ'], YSLA: ['mar Amarillo', 'CN'],
  };
  const locale = () => (window.GuardianaIdioma && window.GuardianaIdioma.locale) || 'es-ES';
  const fechaTxt = (ms, conHora) => new Date(ms).toLocaleString(locale(), conHora ? { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'long', year: 'numeric' });
  // the cities (GeoNames, already on the site) to say what a satellite flies over right now
  let CIU = null, cargaCiu = null;
  const ciudades = () => cargaCiu || (cargaCiu = fetch((document.documentElement.dataset.tierra || '/static/tierra/') + 'ciudades.tsv').then((r) => r.text()).then((t) => {
    const v = [];
    for (const l of t.split('\n')) { if (!l || l[0] === '#') continue; const c = l.split('\t'); const la = +c[3], lo = +c[4]; if (isFinite(la)) v.push([c[0], c[1], la * RAD, lo * RAD]); }
    CIU = v; return v;
  }).catch(() => { CIU = []; return CIU; }));
  function bajo(lat, lon) { // nearest city with 15,000 people or more, if one is within 400 km
    if (!CIU || !CIU.length) return null;
    let mejor = null, dm = 1e9; const cl = Math.cos(lat);
    for (const c of CIU) { const dla = c[2] - lat, dlo = (c[3] - lon) * cl; const d = dla * dla + dlo * dlo; if (d < dm) { dm = d; mejor = c; } }
    const km = Math.sqrt(dm) * 6371;
    return km < 400 ? { n: mejor[0], cc: mejor[1], km } : null;
  }
  // where a satellite is in the Earth-fixed frame at a given moment (SGP4)
  function fijo(i, ms) {
    const r = S.rec[i]; let pv = null;
    try { pv = window.satellite.sgp4(r, (ms / 86400000 + 2440587.5 - r.jdsatepoch) * 1440); } catch (_) {}
    if (!pv || !pv.position || typeof pv.position === 'boolean' || !isFinite(pv.position.x)) return null;
    const gm = window.satellite.gstime(new Date(ms)), cg = Math.cos(gm), sg = Math.sin(gm), X = pv.position.x, Y = pv.position.y;
    return { x: X * cg + Y * sg, y: -X * sg + Y * cg, z: pv.position.z, v: Math.hypot(pv.velocity.x, pv.velocity.y, pv.velocity.z) };
  }
  function desde(L, p) { // elevation over the horizon and distance, seen from the visitor's place
    const a = L.lat * RAD, b = L.lon * RAD, ux = Math.cos(a) * Math.cos(b), uy = Math.cos(a) * Math.sin(b), uz = Math.sin(a);
    const dx = p.x - ux * RE, dy = p.y - uy * RE, dz = p.z - uz * RE, d = Math.hypot(dx, dy, dz);
    return { el: Math.asin((dx * ux + dy * uy + dz * uz) / d) / RAD, d };
  }
  const PASOS = new Map(); // next time each satellite climbs over 25° in the visitor's sky (24 h ahead, every 20 s)
  function proximoPaso(i, L) {
    const clave = i + '@' + L.lat.toFixed(2) + ',' + L.lon.toFixed(2), ya = PASOS.get(clave);
    if (ya && (ya.t === 0 || ya.t > Date.now())) return ya.t;
    let t = 0; const t0 = Date.now();
    for (let s = 20; s <= 86400; s += 20) { const p = fijo(i, t0 + s * 1000); if (p && desde(L, p).el > 25) { t = t0 + s * 1000; break; } }
    PASOS.set(clave, { t }); return t;
  }
  function muestra(i, x, y) {
    const f = ficha(); if (!f) return;
    marcado = i;
    if (i < 0) { f.hidden = true; return; }
    if (!CIU) ciudades().then(() => { if (marcado === i) muestra(i, x, y); });
    const ahora = Date.now(), p = fijo(i, ahora), grupo = S.d.grupos[S.g[i]], fl = grupo ? FLOTA[grupo.id] : null;
    const r = p ? Math.hypot(p.x, p.y, p.z) : RE, alto = r - RE, geo = alto > 30000;
    const rec = S.rec[i], periodo = 2 * Math.PI / rec.no, fila = S.fila[i], dato = (k) => (S.ix(k) >= 0 ? fila[S.ix(k)] : '');
    const lin = [];
    if (fl) lin.push([T('Operador'), fl[0] + ' · ' + paisNombre(fl[1])], [T('Para qué'), T(fl[2])]);
    else if (grupo) lin.push([T('Flota'), grupo.nombre]);
    lin.push([T('Altura'), num(Math.round(alto)) + ' km']);
    lin.push([T('Luz del Sol'), T(S.sombra[i] ? 'en la sombra de la Tierra: funciona con sus baterías' : 'al sol: sus paneles generan energía')]);
    if (p) lin.push([T('Velocidad'), num(Math.round(p.v * 3600)) + ' km/h']);
    if (geo) lin.push([T('Órbita'), T('geoestacionaria: gira con la Tierra y parece quieto en el cielo')]);
    else lin.push([T('Vuelta a la Tierra'), T('cada') + ' ' + num(Math.round(periodo)) + ' min · ' + num(Math.round(1440 / periodo * 10) / 10) + ' ' + T('al día')], [T('Inclinación'), num(Math.round(rec.inclo / RAD * 10) / 10) + '°']);
    if (p) {
      const la = Math.asin(p.z / r), lo = Math.atan2(p.y, p.x), c = bajo(la, lo);
      lin.push([T('Ahora sobre'), c ? c.n + ' (' + paisNombre(c.cc) + ')' : CIU ? T('una zona sin ciudades grandes cerca') : '…']);
    }
    const L = P() && P().lugar;
    if (L && p) {
      const v = desde(L, p);
      lin.push([T('Desde') + ' ' + L.nombre, num(Math.round(v.d)) + ' km · ' + (v.el > 0 ? T('sobre tu horizonte') + ' (' + Math.round(v.el) + '°)' : T('bajo tu horizonte'))]);
      if (!geo) { const t = proximoPaso(i, L); lin.push([T('Próximo paso alto'), t ? fechaTxt(t, true) : T('no en las próximas 24 h')]); }
    }
    const lz = dato('lanzado'), base = BASES[dato('sitio')];
    if (lz) lin.push([T('Lanzado'), fechaTxt(Date.parse(lz + 'T12:00:00Z'), false) + (base ? ' · ' + base[0] + ' (' + paisNombre(base[1]) + ')' : '')]);
    lin.push([T('Catálogo'), 'NORAD ' + S.norad[i] + (dato('cospar') ? ' · COSPAR ' + dato('cospar') : '')]);
    const foto = fotoDe('satelite', S.norad[i]);
    if (clicActual) {
      abreModelo(modelo(T('Satélite'), S.nom[i], lin, T('Datos verificados'), { foto, resumen: [T('Operador'), T('Para qué'), T('Altura'), T('Velocidad'), T('Ahora sobre')] }), x, y);
      return;
    }
    fotoFicha(f, foto, S.nom[i]);
    f.querySelector('b').textContent = S.nom[i];
    const sp = f.querySelector('span'); sp.textContent = '';
    const dl = document.createElement('dl'); dl.className = 'sat-dl';
    for (const [k, v] of lin) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
    sp.append(dl);
    // 22 Oct 2026 (owner: «no es en tiempo real»): it is. The position is computed for this very moment from the
    // satellite's published orbit; the orbit itself is a few hours old, which moves the dot by about a kilometre.
    const pie = document.createElement('small');
    pie.textContent = T('Posición de este instante, calculada con su órbita') + ' (' + T('Datos verificados') + ', ' + T('órbita medida') + ' ' + haceTxt(hace(dato('EPOCH') ? dato('EPOCH') + (/Z$/.test(dato('EPOCH')) ? '' : 'Z') : S.d.descargado)) + ')';
    sp.append(pie);
    f.classList.add('sat'); f.hidden = false;
    const G = P().geo, w = f.offsetWidth || 320, h = f.offsetHeight || 260;
    // 24 Oct 2026 (QA): on a narrow screen the card never leaves the screen (it went to x ≈ −300 on a phone)
    f.style.left = Math.max(8, Math.min(G.W - w - 8, x + 16 + w > G.W - 8 ? x - 16 - w : x + 16)) + 'px'; f.style.top = Math.max(70, Math.min(G.H - h - 12, y - 40)) + 'px';
  }
  let centroMarcado = -1, cableMarcado = -1, llegadaMarcada = -1, puntoMarcado = -1, pendiente = null;
  function buscaEstacion(x, y) {
    if (!(estado.puntos || estado.sub) || !EST || !CLASES.puntos.estaciones) return -1;
    for (const b of EST_CAJAS) if (x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]) return b[4]; // its name
    const p = P(), G = p.geo, z = G.R / (G.R0 || G.R); let mejor = -1, dm = 8 * 8;
    for (let i = 0; i < EST.length; i++) { if (z < 3 && EST[i].x && EST[i].x.clase === 'plataforma') continue; const v = p.aVista(EST[i].w); if (v[2] <= 0.05) continue; const dx = G.CX + G.R * v[0] - x, dy = G.CY - G.R * v[1] - y, d2 = dx * dx + dy * dy; if (d2 < dm) { dm = d2; mejor = i; } }
    return mejor;
  }
  // the station's own name in the page's language where it is a common noun («Polo Sur (Amundsen-Scott)» → «South Pole (Amundsen-Scott)»)
  const nombreEstacion = (n) => { const k = n.indexOf(' ('); return k > 0 ? T(n.slice(0, k)) + n.slice(k) : T(n); };
  function fichaEstacion(i, x, y) {
    const q = EST[i], X = q.x || {}, filas = [];
    // an oil or gas platform where a submarine cable ends (owner, 24 Oct 2026, 21:08–21:09: «que aparezca el nombre de la
    // plataforma petrolífera y la información… con foto»); what two voices confirm, in herramientas/agencia-rondas/ronda29
    const plat = X.clase === 'plataforma', base = X.clase === 'base';
    const tipo = plat ? (X.gas ? T('Plataforma de gas') : T('Plataforma petrolífera')) : base ? T('Base antártica') : T('Estación terrena de satélites');
    if (X.clase) filas.push([T('Tipo'), tipo]);
    if (q.o) filas.push([T('Operador'), /^[A-Z]{2}$/.test(q.o) ? paisNombre(q.o) + (X.programa ? ' · ' + X.programa : '') : q.o]);
    if (plat && X.programa) filas.push([T('Campo'), X.programa]);
    if (X.desde) filas.push([T('Desde'), String(X.desde)]);
    if (X.gente) filas.push([T('Personal'), X.gente]);
    if (X.enlace) filas.push([plat ? T('Cable que llega') : T('Cómo se conecta'), X.enlace]);
    if (X.telemetria) filas.push([T('Por dónde salen los datos'), X.telemetria]);
    if (X.antenas) filas.push([T('Antenas'), X.antenas]);
    if (X.local) filas.push([T('Enlaces locales'), X.local]);
    if (X.cambios) filas.push([T('Novedades'), X.cambios]);
    if (X.nota) filas.push([T('Datos'), X.nota]);
    if (plat && X.fuente) filas.push([T('Fuente'), X.fuente.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')]);
    if (plat) {
      abreModelo(modelo(tipo, nombreEstacion(q.n), filas, T('Datos verificados'), {
        foto: fotoDe('estacion', q.n),
        resumen: [T('Tipo'), T('Operador'), T('Cable que llega')],
        para: T('Aquí termina un cable submarino de fibra óptica. Así se conectan a tierra las plataformas del mar del Norte: por el cable pasan los datos de la producción, las comunicaciones y el internet de quienes trabajan a bordo.'),
        secciones: [{ t: T('La plataforma'), claves: [T('Campo'), T('Desde'), T('Datos')], abierta: true }, { t: T('Fuente'), claves: [T('Fuente')] }],
      }), x, y);
      return;
    }
    abreModelo(modelo(tipo, q.n ? nombreEstacion(q.n) : T('Estación'), filas, T('Datos verificados'), {
      foto: fotoDe('estacion', q.n),
      resumen: [T('Tipo'), T('Operador'), T('Cómo se conecta'), T('Desde')],
      para: base ? T('Desde aquí no hay cable: todo lo que entra y sale va por satélite, con la capacidad y los retrasos que eso impone. Es el internet más caro y escaso del planeta.') : T('Por aquí bajan a tierra las imágenes y medidas de los satélites que luego ves en los mapas del tiempo, en la navegación y en las noticias.'),
      secciones: [{ t: T('Conexión y datos'), claves: [T('Cómo se conecta'), T('Por dónde salen los datos'), T('Antenas')], abierta: true }, { t: base ? T('La base') : T('La estación'), claves: [T('Desde'), T('Personal'), T('Datos')] }, { t: T('Enlaces locales'), claves: [T('Enlaces locales')] }, { t: T('Novedades'), claves: [T('Novedades')] }],
    }), x, y);
  }
  function buscaPunto(x, y) {
    if (!estado.puntos || !PT || !PT.p) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 5.5 * 5.5;
    const ab = ABANICO && performance.now() - abanicoFrame < 400 ? ABANICO : null; // where the marks really are on screen (fans included)
    for (let i = 0; i < PT.p.length; i++) { if (!vePunto(PT.p[i])) continue; let px, py; const a = ab && ab.get(i); if (a) { px = a[0]; py = a[1]; } else { const v = p.aVista(PT.p[i].w); if (v[2] <= 0.05) continue; px = G.CX + G.R * v[0]; py = G.CY - G.R * v[1]; } const dx = px - x, dy = py - y, d2 = dx * dx + dy * dy; if (d2 < dm) { dm = d2; mejor = i; } }
    return mejor;
  }
  function buscaLlegada(x, y) {
    if (!estado.sub || !LUG || !LUG.llegadas) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 8 * 8;
    for (let i = 0; i < LUG.llegadas.length; i++) { if (!veLlegada(LUG.llegadas[i])) continue; const v = p.aVista(LUG.llegadas[i].w); if (v[2] <= 0.05) continue; const dx = G.CX + G.R * v[0] - x, dy = G.CY - G.R * v[1] - y, d2 = dx * dx + dy * dy; if (d2 < dm) { dm = d2; mejor = i; } }
    return mejor;
  }
  function buscaCentro(x, y) {
    if (!estado.puntos || !LUG || !LUG.centros) return -1;
    const p = P(), G = p.geo, z = G.R / (G.R0 || G.R); let mejor = -1, dm = 1e9;
    for (let i = 0; i < LUG.centros.length; i++) {
      const c = LUG.centros[i], v = p.aVista(c.w); if (v[2] <= 0.05) continue;
      const dx = G.CX + G.R * v[0] - x, dy = G.CY - G.R * v[1] - y, d = Math.hypot(dx, dy), lim = Math.max(9, c.n >= 5 ? radioCiudad(c.n, z) + 3 : 9);
      if (d < lim && d - lim < dm) { dm = d - lim; mejor = i; }
    }
    return mejor;
  }
  function buscaPrevisto(x, y) {
    if (!estado.sub || !PREV || !PREV.length || !CLASES.sub.previstos) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 7 * 7;
    PREV.forEach((l, i) => { let ax = 0, ay = 0, prev = false; for (const w of l.w) { const v = p.aVista(w), bx = G.CX + G.R * v[0], by = G.CY - G.R * v[1], ve = v[2] > 0.02; if (ve && prev) { const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L2)); const qx = ax + vx * t - x, qy = ay + vy * t - y, d2 = qx * qx + qy * qy; if (d2 < dm) { dm = d2; mejor = i; } } ax = bx; ay = by; prev = ve; } });
    return mejor;
  }
  function fichaPrevisto(i, x, y) {
    const c = PREV[i].c, filas = [];
    const est = { 'en construcción': T('En construcción'), planeado: T('Previsto'), propuesto: T('Propuesto') }[c.estado] || T('Previsto');
    filas.push([T('Estado'), est + (c.anio ? ' · ' + c.anio : '')]);
    filas.push([T('Origen'), c.llegadas[0].lugar + ' (' + paisNombre(c.llegadas[0].pais) + ')']);
    filas.push([T('Destino'), c.llegadas[c.llegadas.length - 1].lugar + ' (' + paisNombre(c.llegadas[c.llegadas.length - 1].pais) + ')']);
    if (c.km) filas.push([T('Longitud'), '≈ ' + num(c.km) + ' km']);
    // 22 Oct 2026, 14:05 (owner): «que salga la información de lo que quieren hacer y quién lo quiere hacer, todo lo que se sepa»
    if (c.promotor) filas.push([T('Quién lo quiere hacer'), c.promotor]);
    if (c.que) filas.push([T('Qué quieren hacer'), c.que]);
    if (c.cuando) filas.push([T('Para cuándo'), c.cuando]);
    if (c.capacidad) filas.push([T('Capacidad prevista'), c.capacidad]);
    if (c.coste) filas.push([T('Coste'), c.coste]);
    if (c.estudio) filas.push([T('Estudio'), c.estudio]);
    const am = c.llegadas.filter((l) => !l.via); if (am.length > 2) filas.push([T('Amarres previstos'), am.map((l) => l.lugar).join(' · ')]);
    if (c.duenos && c.duenos.length) filas.push([T('Dueños'), c.duenos.join(', ')]);
    if (c.nota) filas.push([T('Datos'), c.nota]);
    abreModelo(modelo(T('Cable previsto'), c.nombre, filas, T('Todavía no existe: se dibuja en línea recta, como aviso.') + ' · ' + T('Datos verificados'), {
      resumen: [T('Estado'), T('Origen'), T('Destino'), T('Quién lo quiere hacer')],
      para: T('Todavía no existe y no lleva datos. Si se construye, abrirá una ruta nueva entre') + ' ' + c.llegadas[0].lugar + ' ' + T('y') + ' ' + c.llegadas[c.llegadas.length - 1].lugar + '.',
      secciones: [{ t: T('El proyecto'), claves: [T('Qué quieren hacer'), T('Para cuándo'), T('Coste'), T('Capacidad prevista'), T('Estudio')], abierta: true }, { t: T('Amarres previstos'), claves: [T('Amarres previstos')] }, { t: T('Datos'), claves: [T('Longitud'), T('Dueños'), T('Datos')] }],
      color: SUB_COL[PREV[i].clase || (PREV[i].clase = clasePrev(c))],
    }), x, y);
  }
  function buscaCable(x, y) {
    if (!estado.sub || !capas.sub || !capas.sub.lineas) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 7 * 7;
    capas.sub.lineas.forEach((l, i) => {
      if (!veSub(i, l)) return; // a class switched off cannot be picked
      let ax = 0, ay = 0, prev = false;
      for (const w of l.w) {
        const v = p.aVista(w), bx = G.CX + G.R * v[0], by = G.CY - G.R * v[1], ve = v[2] > 0.02;
        if (ve && prev) {
          const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L2));
          const qx = ax + vx * t - x, qy = ay + vy * t - y, d2 = qx * qx + qy * qy;
          if (d2 < dm) { dm = d2; mejor = i; }
        }
        ax = bx; ay = by; prev = ve;
      }
    });
    return mejor;
  }
  // the card goes beside the pointer; while a data centre's route is drawn, on the side away from it, so it never
  // covers the line the person is looking at
  const colocaFicha = (x, y) => {
    const f = ficha(); const G = P().geo, w = f.offsetWidth || 280, h = f.offsetHeight || 80;
    const der = x + 16 + w <= G.W - 8, izq = x - 16 - w >= 8;
    let left = der ? x + 16 : Math.max(8, x - 16 - w), top = y - 46;
    const r = puntoMarcado >= 0 ? RUTAS.get(puntoMarcado) : null;
    if (r && LUG && LUG.llegadas) {
      const q = P().pantalla(LUG.llegadas[r.llegada].w);
      if (q.ve) {
        if (q.x > x && izq) left = x - 16 - w; else if (q.x <= x && der) left = x + 16;
        if (q.y > y + 20 && y - h - 16 >= 70) top = y - h - 16; else if (q.y < y - 20) top = y + 16;
      }
    }
    // the flower of data centres stays uncovered: the card goes beside the disc, on the side with room
    const fl = FLOR && florCentro(P(), G);
    if (fl) {
      const R = FLOR.r + 18, cx1 = left + w / 2, cy1 = top + h / 2;
      if (Math.abs(cx1 - fl[0]) < w / 2 + R && Math.abs(cy1 - fl[1]) < h / 2 + R) {
        if (fl[0] + R + 12 + w <= G.W - 8) left = fl[0] + R + 12; else left = fl[0] - R - 12 - w;
        top = Math.max(70, Math.min(G.H - h - 12, fl[1] - h / 2));
      }
    }
    f.style.left = Math.max(8, Math.min(G.W - w - 8, left)) + 'px'; f.style.top = Math.max(70, Math.min(G.H - h - 12, top)) + 'px';
  };
  // ---------- where a data centre's cables come from (owner, 22 Oct 2026: «al pasar por el centro de datos, que
  // aparezca el cable que le viene, y al quitarme desaparece: que se vea de forma visual de dónde viene») ----------
  // From the nearest place where submarine cables land to the building: along the land backbones we know
  // (fibra-tierra.json) when they join the two, or else a dashed straight line, and the card says so: the exact land
  // route is not public. The submarine cables that land there light up across the ocean, with their light inside.
  let RED = null;
  const kmLL = (a, b) => { const la1 = a[1] * RAD, la2 = b[1] * RAD, h = Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((b[0] - a[0]) * RAD / 2) ** 2; return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h))); };
  const lonLat = (w) => { const m = Math.hypot(w[0], w[1], w[2]); return [Math.atan2(w[0], w[2]) / RAD, Math.asin(w[1] / m) / RAD]; };
  function red() { // the land backbones as a graph: their vertices, joined along each line and where lines meet
    if (RED || !FT || !FT.lineas) return RED;
    const nodos = [], idx = new Map(), ady = [], celda = new Map();
    const nodo = (lon, lat) => {
      const k = Math.round(lon * 50) + ',' + Math.round(lat * 50); let i = idx.get(k);
      if (i === undefined) { i = nodos.length; idx.set(k, i); nodos.push([lon, lat]); ady.push([]); const c = Math.floor(lon * 4) + ',' + Math.floor(lat * 4); (celda.get(c) || celda.set(c, []).get(c)).push(i); }
      return i;
    };
    const une = (a, b, li) => { if (a === b) return; const d = kmLL(nodos[a], nodos[b]); ady[a].push([b, d, li]); ady[b].push([a, d, li]); };
    const extremos = [];
    FT.lineas.forEach((l, li) => {
      let prev = -1;
      for (const [lon, lat] of l.x.l) { const i = nodo(lon, lat); if (prev >= 0) une(prev, i, li); prev = i; }
      extremos.push([nodo(l.x.l[0][0], l.x.l[0][1]), li], [prev, li]);
    });
    // where one line ends within 15 km of another one, the two are taken as joined
    for (const [e, li] of extremos) {
      const [lon, lat] = nodos[e], cx0 = Math.floor(lon * 4), cy0 = Math.floor(lat * 4), cerca = [];
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const j of celda.get((cx0 + dx) + ',' + (cy0 + dy)) || []) { if (j === e) continue; const d = kmLL(nodos[e], nodos[j]); if (d < 15) cerca.push([d, j]); }
      cerca.sort((a, b) => a[0] - b[0]); for (const [, j] of cerca.slice(0, 3)) une(e, j, -1);
    }
    RED = { nodos, ady };
    return RED;
  }
  function cercano(ll, lim) { let m = -1, dm = lim; RED.nodos.forEach((n, i) => { if (Math.abs(n[1] - ll[1]) > 1 || Math.abs(n[0] - ll[0]) > 1.5 / Math.max(0.2, Math.cos(ll[1] * RAD))) return; const d = kmLL(n, ll); if (d < dm) { dm = d; m = i; } }); return m; }
  function camino(a, b) { // Dijkstra over the backbones
    const N = RED.nodos.length, dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), por = new Int32Array(N).fill(-1);
    const heap = [[0, a]]; dist[a] = 0;
    const sube = (h) => { let i = h.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } };
    const baja = (h) => { const top = h[0], last = h.pop(); if (h.length) { h[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } } return top; };
    while (heap.length) {
      const [d, u] = baja(heap); if (d > dist[u]) continue; if (u === b) break;
      for (const [v, w, li] of RED.ady[u]) { const nd = d + w; if (nd < dist[v]) { dist[v] = nd; prev[v] = u; por[v] = li; heap.push([nd, v]); sube(heap); } }
    }
    if (!isFinite(dist[b])) return null;
    const pts = [], ops = []; let u = b;
    while (u >= 0) { pts.push(RED.nodos[u]); const li = por[u]; if (li >= 0) { const o = FT.lineas[li].x.o; if (o && !ops.includes(o)) ops.push(o); } u = prev[u]; }
    return { pts: pts.reverse(), km: dist[b], ops: ops.reverse() };
  }
  function lineaDe(pts) { // a line on the sphere through these [lon, lat] points, with its length for the light
    const w = [];
    pts.forEach(([lon, lat], k) => {
      const v = P().vec(lon, lat);
      if (k) { const a = w[w.length - 1], m = Math.hypot(...a), u = [a[0] / m, a[1] / m, a[2] / m]; const ang = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2]))), n = Math.floor(ang / (0.5 * RAD)); for (let j = 1; j <= n; j++) { const s = j / (n + 1), sa = Math.sin(ang), f0 = Math.sin((1 - s) * ang) / sa, f1 = Math.sin(s * ang) / sa; w.push([(u[0] * f0 + v[0] * f1) * 1.003, (u[1] * f0 + v[1] * f1) * 1.003, (u[2] * f0 + v[2] * f1) * 1.003]); } }
      w.push([v[0] * 1.003, v[1] * 1.003, v[2] * 1.003]);
    });
    const acc = [0]; for (let j = 1; j < w.length; j++) { const a = w[j - 1], b = w[j]; acc.push(acc[j - 1] + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 1.003); }
    return { w, acc, L: acc[acc.length - 1], fase: 0 };
  }
  const RUTAS = new Map();
  function rutaCentro(i) {
    if (RUTAS.has(i)) return RUTAS.get(i);
    if (!LUG || !LUG.llegadas || !LUG.llegadas.length) return null;
    const q = PT.p[i], cll = [q.lon, q.lat];
    let li = -1, dm = 1e9;
    LUG.llegadas.forEach((l, k) => { const d = kmLL(cll, l.ll || (l.ll = lonLat(l.w))); if (d < dm) { dm = d; li = k; } });
    const L = LUG.llegadas[li], r = { llegada: li, km: dm, linea: null, via: false, kmRuta: 0, ops: [], estacion: null, lejos: false };
    // a cable landing station mapped in OpenStreetMap, closer than any cable end we have, is used instead
    // (OpenStreetMap has few submarine cables in some seas, e.g. around southern Africa)
    let desde = L.ll;
    for (const e of PT.at || []) { const d = kmLL(cll, [e.lon, e.lat]); if (d < r.km) { r.km = d; r.estacion = e; desde = [e.lon, e.lat]; } }
    if (r.km > 1500) r.lejos = true; // too far to be its real way in: said on the card, not drawn
    else if (r.km >= 2) {
      let c = null;
      if (red()) { const a = cercano(desde, 40), b = cercano(cll, 40); if (a >= 0 && b >= 0 && a !== b) c = camino(a, b); }
      if (c && c.km < Math.max(3 * r.km, r.km + 300)) { r.via = true; r.kmRuta = c.km + kmLL(desde, c.pts[0]) + kmLL(c.pts[c.pts.length - 1], cll); r.ops = c.ops; r.linea = lineaDe([desde, ...c.pts, cll]); }
      else r.linea = lineaDe([desde, cll]);
    }
    if (FT && FT.lineas) RUTAS.set(i, r); // with the backbones loaded the answer will not change
    return r;
  }
  function pintaRuta(cx, p, G, t) {
    const r = rutaCentro(puntoMarcado); if (!r || r.lejos) return;
    const L = LUG.llegadas[r.llegada];
    // the submarine cables that land there, lit across the ocean
    if (!r.estacion && capas.sub && capas.sub.lineas) { const ls = L.seg.map((k) => capas.sub.lineas[k]).filter(Boolean); for (const k of L.seg) { const l = capas.sub.lineas[k]; if (l) { pintaLineas(cx, p, G, [l], `rgba(${colorSub(k)},.9)`, 1.8); pintaColas(cx, p, G, [l], colorSub(k), 0.9, 1.8); } } pintaLuz(cx, p, G, ls, t); } // each in its own colour (23 Oct 2026)
    if (r.linea) {
      cx.setLineDash(r.via ? [] : [5, 4]);
      pintaLineas(cx, p, G, [r.linea], `rgba(${BLANCO},.95)`, 1.8);
      cx.setLineDash([]);
      // the light along the land stretch, both ways, like inside every fibre
      const l = r.linea, n = Math.max(3, Math.round(l.L / 0.02)), sep = l.L / n;
      cx.fillStyle = `rgba(${BLANCO},.95)`;
      for (let dir = 0; dir < 2; dir++) for (let k = 0; k < n; k++) {
        let s = ((t * VLUZ * 0.35 + dir * sep / 2) % sep) + k * sep; if (s > l.L) continue; if (dir) s = l.L - s;
        const v = p.aVista(puntoEn(l, s)); if (v[2] <= 0.02) continue;
        cx.fillRect(G.CX + G.R * v[0] - 1.1, G.CY - G.R * v[1] - 1.1, 2.2, 2.2);
      }
    }
    // the landing, ringed and named
    const v = p.aVista(r.estacion ? r.estacion.w : L.w);
    if (v[2] > 0.05) {
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1];
      cx.globalCompositeOperation = 'source-over';
      cx.strokeStyle = `rgba(${BLANCO},.95)`; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(x, y, 7, 0, 7); cx.stroke();
      cx.fillStyle = `rgba(${BLANCO},1)`; cx.beginPath(); cx.arc(x, y, 2.6, 0, 7); cx.fill();
      const n = new Set(L.seg.map((k) => (grupoDe(k) >= 0 ? 'g' + grupoDe(k) : 's' + k))).size;
      const txt = r.estacion ? (r.estacion.n || T('Estación de llegada de cables')) : L.ciudad + ' · ' + num(n) + ' ' + T(n === 1 ? 'cable submarino' : 'cables submarinos');
      cx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle';
      cx.lineWidth = 3; cx.strokeStyle = 'rgba(6,8,12,.85)'; cx.strokeText(txt, x + 12, y);
      cx.fillStyle = `rgba(${BLANCO},.98)`; cx.fillText(txt, x + 12, y);
      cx.globalCompositeOperation = 'lighter';
    }
  }

  // ---------- Ficha completa (owner, 22 Oct 2026, 15:24: «una estructura bien hecha para que no sea caótico… con un
  // desplegable e irla bajando»; agencia: «entender en tres segundos y profundizar solo cuando interese»).
  // Two levels for every kind of thing: hovering shows the summary card (title + up to five lines); a click opens this
  // panel: the same summary on top and then sections that unfold one by one, «Copiar ficha» and «Guardar PDF».
  // On a phone it is a sheet that rises from the bottom (tap the handle to raise it). ----------
  let clicActual = false, panelModelo = null;
  const esTactil = () => matchMedia && matchMedia('(pointer: coarse)').matches;
  function panel() {
    let p = $('ficha-panel'); if (p) return p;
    p = document.createElement('aside'); p.id = 'ficha-panel'; p.className = 'ficha-panel'; p.hidden = true; p.setAttribute('aria-label', T('Ficha'));
    p.innerHTML = '<div class="asa" aria-hidden="true"></div><div class="cab"><span class="tipo"></span><span class="botones"><button type="button" class="atras" hidden>‹</button><button type="button" class="cerrar" aria-label="' + T('Cerrar') + '">×</button></span></div><figure class="foto" hidden><img alt="" decoding="async"><figcaption></figcaption></figure><h2 class="tit"></h2><p class="sub"></p><dl class="sat-dl resumen"></dl><div class="secs"></div><figure class="foto mapa" hidden><canvas width="804" height="280" aria-hidden="true"></canvas></figure><div class="acciones"><button type="button" class="ir" hidden>' + T('Verla en Órbita') + '</button><button type="button" class="copiar">' + T('Copiar ficha') + '</button><button type="button" class="pdf">' + T('Guardar PDF') + '</button></div><p class="pie"></p>';
    document.body.append(p);
    p.querySelector('.cerrar').addEventListener('click', cierraPanel);
    p.querySelector('.asa').addEventListener('click', () => p.classList.toggle('alta'));
    p.querySelector('.copiar').addEventListener('click', async (e) => { const b = e.currentTarget; try { await navigator.clipboard.writeText(textoFicha(panelModelo)); b.textContent = T('Copiada'); } catch (_) { b.textContent = T('No se pudo copiar'); } setTimeout(() => { b.textContent = T('Copiar ficha'); }, 1800); });
    p.querySelector('.pdf').addEventListener('click', () => { p.querySelectorAll('details').forEach((d) => { d.open = true; }); document.body.classList.add('imprime-ficha'); setTimeout(() => { try { window.print(); } finally { setTimeout(() => document.body.classList.remove('imprime-ficha'), 500); } }, 50); });
    p.querySelector('.atras').addEventListener('click', () => { const m = historial.pop(); if (m) { historial.pop(); abrePanel(m); } });
    p.addEventListener('click', (e) => e.stopPropagation());
    // 22 Oct 2026, 22:24 (owner: «le doy a por dónde entra internet, se baja más para abajo y se pierde… no puede pasar de
    // los márgenes de la pantalla»): a section that unfolds lifts the card back inside the screen; if it is still too
    // tall, the card scrolls inside itself.
    p.addEventListener('toggle', () => encajaPanel(), true);
    addEventListener('resize', () => encajaPanel());
    arrastrable(p);
    return p;
  }
  // 23 Oct 2026, 08:17 (owner): «ese cuadro queda fijo. Lo tiene que poder mover clicando encima… y lo pone en la pantalla
  // donde le sea mejor y que no le tape nada». On a computer the card is dragged from anywhere that is not a button or a
  // section title; the place chosen is kept for the next cards of this visit.
  let posUsuario = null;
  const encaja = (left, top, w, h) => { const M = 8; return { left: Math.round(Math.max(M, Math.min(innerWidth - w - M, left))), top: Math.round(Math.max(M, Math.min(Math.max(M, innerHeight - h - M), top))) }; };
  function arrastrable(p) {
    let ini = null;
    p.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || esTactil() || innerWidth < 760) return;
      if (e.target.closest('button, a, summary, input, select, textarea, [contenteditable]')) return;
      const r = p.getBoundingClientRect();
      ini = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, mov: false, id: e.pointerId };
    });
    addEventListener('pointermove', (e) => {
      if (!ini || e.pointerId !== ini.id) return;
      const dx = e.clientX - ini.x, dy = e.clientY - ini.y;
      if (!ini.mov) {
        if (Math.hypot(dx, dy) < 5) return; // a click stays a click
        ini.mov = true; p.classList.add('suelto', 'moviendo');
        try { const sel = getSelection(); if (sel) sel.removeAllRanges(); } catch (_) {}
      }
      const q = encaja(ini.l + dx, ini.t + dy, p.offsetWidth, p.offsetHeight);
      p.style.left = q.left + 'px'; p.style.top = q.top + 'px'; posUsuario = q;
      e.preventDefault();
    });
    const fin = () => { if (ini && ini.mov) p.classList.remove('moviendo'); ini = null; };
    addEventListener('pointerup', fin); addEventListener('pointercancel', fin);
  }
  // 25 Oct 2026, 21:34 (owner: «la X está escondida debajo del centro de datos»): the card never starts under the top bar,
  // whatever its height (on a narrower window the layer buttons wrap onto a second row and covered the close button)
  const bajoCabecera = () => { const h = document.querySelector('header'); const r = h && h.getBoundingClientRect(); return Math.max(74, r && r.height ? Math.round(r.bottom) + 8 : 74); };
  function encajaPanel() {
    const p = $('ficha-panel'); if (!p || p.hidden || !p.classList.contains('suelto')) return;
    const M = 16, arriba = bajoCabecera();
    p.style.maxHeight = Math.max(160, innerHeight - arriba - M) + 'px';
    const h = p.offsetHeight; let top = parseFloat(p.style.top) || arriba;
    if (top + h > innerHeight - M) top = Math.max(arriba, innerHeight - M - h);
    p.style.top = Math.round(top) + 'px';
  }
  const historial = [];
  function textoFicha(m) {
    if (!m) return '';
    const L = [m.titulo + (m.sub ? ' — ' + m.sub : ''), ''];
    for (const [k, v] of m.resumen) L.push((k ? k + ': ' : '') + v);
    for (const sec of m.secciones) { L.push('', sec.t.toUpperCase()); if (sec.texto) L.push(sec.texto); for (const [k, v] of sec.filas || []) L.push((k ? k + ': ' : '') + v); }
    if (m.pie) L.push('', m.pie);
    L.push('', 'GUARDIANA · Órbita · ' + new Date().toLocaleDateString(document.documentElement.lang === 'en' ? 'en-GB' : 'es-ES'));
    return L.join('\n');
  }
  function abrePanel(m, x, y) {
    const p = panel(); panelModelo = m; historial.push(m); if (historial.length > 12) historial.shift();
    p.querySelector('.tipo').textContent = m.tipo || ''; p.querySelector('.tit').textContent = m.titulo || ''; p.querySelector('.sub').textContent = m.sub || ''; p.querySelector('.sub').hidden = !m.sub;
    muestraEn(p.querySelector('.tit'), m.color); // a cable's colour beside its name (23 Oct 2026)
    const dl = p.querySelector('.resumen'); dl.textContent = '';
    for (const [k, v] of m.resumen) { if (!v) continue; const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k || ''; dd.textContent = v; if (!k) dd.className = 'ancho'; dl.append(dt, dd); }
    const secs = p.querySelector('.secs'); secs.textContent = '';
    m.secciones.forEach((sec, i) => {
      const filas = (sec.filas || []).filter(([, v]) => v); if (!filas.length && !sec.texto) return;
      const d = document.createElement('details'); d.open = !!sec.abierta; const sm = document.createElement('summary'); sm.textContent = sec.t; d.append(sm);
      if (sec.texto) { const t = document.createElement('p'); t.className = 'texto'; t.textContent = sec.texto; d.append(t); }
      if (filas.length) { const dl2 = document.createElement('dl'); dl2.className = 'sat-dl'; for (const [k, v] of filas) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k || ''; dd.textContent = v; if (!k) dd.className = 'ancho'; dl2.append(dt, dd); } d.append(dl2); }
      secs.append(d);
    });
    pintaFoto(p.querySelector('.foto'), m.foto, m.titulo);
    // 24 Oct 2026 (company card, approved by the owner at 20:27): a small map of where it is, and a button that flies the
    // planet there; the other cards do not use them
    p.classList.toggle('empresa', !!m.empresa);
    const fm = p.querySelector('figure.mapa');
    if (fm) { fm.hidden = !m.mapa; if (m.mapa) miniMapa(fm.querySelector('canvas'), m.mapa.lon, m.mapa.lat); }
    const bi = p.querySelector('.ir');
    if (bi) { bi.hidden = !m.ir; bi.onclick = m.ir ? () => { cierraPanel(); const ES = window.OrbitaEspejo; if (ES && ES.activo) ES.cierra(); const PL = window.OrbitaPlaneta; if (PL && PL.ir) PL.ir(m.ir.lon, m.ir.lat, m.ir.z || 400); } : null; }
    p.querySelector('.pie').textContent = m.pie || ''; p.querySelector('.atras').hidden = historial.length < 2;
    p.hidden = false; p.scrollTop = 0; p.classList.remove('alta');
    // On a computer the full card opens where the pointer is, whole, never cut by the edges; if there is no room
    // beside the point it goes to the middle (owner, 22 Oct 2026, 18:07). On a phone it stays a bottom sheet.
    if (Number.isFinite(x) && Number.isFinite(y) && !esTactil() && innerWidth >= 760) {
      const arriba = bajoCabecera();
      p.classList.add('suelto'); p.style.left = '0px'; p.style.top = '0px'; p.style.maxHeight = Math.max(160, innerHeight - arriba - 16) + 'px';
      const w = p.offsetWidth, h = p.offsetHeight, M = 16;
      let left = x + 18; if (left + w > innerWidth - M) left = x - w - 18; if (left < M) left = Math.max(M, Math.round((innerWidth - w) / 2));
      let top = y - 24; if (top + h > innerHeight - M) top = innerHeight - M - h; if (top < arriba) top = arriba;
      if (posUsuario) { const q = encaja(posUsuario.left, posUsuario.top, w, h); left = q.left; top = q.top; } // where the person put it
      p.style.left = left + 'px'; p.style.top = top + 'px';
    } else { p.classList.remove('suelto'); p.style.left = ''; p.style.top = ''; p.style.maxHeight = ''; }
    const f = ficha(); if (f) f.hidden = true;
    document.body.classList.add('con-ficha');
    // 24 Oct 2026 (QA): the browser's or phone's back closes the card instead of leaving Órbita: an open card is one
    // step in the history (a second card replaces the first, it does not add another step)
    if (!fichaEnHistoria()) { try { history.pushState(Object.assign({}, history.state || {}, { ficha: 1 }), ''); } catch (_) {} }
  }
  const fichaEnHistoria = () => !!(history.state && history.state.ficha);
  function cierraPanel(desdeHistoria) {
    const p = $('ficha-panel'); const abierta = !!(p && !p.hidden);
    if (p) p.hidden = true; panelModelo = null; historial.length = 0; fichaFija = false; document.body.classList.remove('con-ficha');
    if (abierta && desdeHistoria !== true && fichaEnHistoria()) { try { history.back(); } catch (_) {} } // its step goes too
  }
  addEventListener('popstate', () => { if (panelModelo && !fichaEnHistoria()) cierraPanel(true); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panelModelo) cierraPanel(); });
  // a model from a flat list of rows: the summary takes the keys named first (or the first five), each remaining row
  // goes to the section its key belongs to; unknown keys fall into «Más datos»
  function modelo(tipo, titulo, filas, pie, plan) {
    plan = plan || {};
    const quitar = new Set(), resumen = [], secciones = [];
    const toma = (k) => filas.filter(([kk, v]) => kk === k && v);
    for (const k of plan.resumen || []) { for (const f of toma(k)) { resumen.push(f); quitar.add(f); } }
    if (!resumen.length) for (const f of filas.slice(0, 5)) { if (f[1]) { resumen.push(f); quitar.add(f); } }
    if (plan.para) secciones.push({ t: T('En la práctica'), /* 22 Oct 2026, 22:23 (owner): instead of «Qué significa para ti», more professional */ texto: plan.para, abierta: true });
    for (const sec of plan.secciones || []) { const fs = []; for (const k of sec.claves) for (const f of toma(k)) if (!quitar.has(f)) { fs.push(f); quitar.add(f); } if (fs.length || sec.texto) secciones.push({ t: sec.t, filas: fs, texto: sec.texto, abierta: !!sec.abierta }); }
    const resto = filas.filter((f) => f[1] && !quitar.has(f)); if (resto.length) secciones.push({ t: T('Más datos'), filas: resto });
    return { tipo, titulo, sub: plan.sub || '', resumen, secciones, pie, color: plan.color || '', foto: plan.foto || null };
  }
  // ---------- photos in the cards (owner, 24 Oct 2026: «cuando toquemos centro de datos… que aparezca una foto, si es que
  // la hay… en los cables, en los satélites también»). Only real photos of that very element, reviewed one by one, with a
  // free licence, copied to our own site (orbita/static/fotos): no visit asks a third party for anything. Each carries its
  // author and licence, in the card and in terminos.html. No photo, no frame: the card stays as it was. ----------
  let FOTOS = null, cargaFotos = null;
  const pliegaF = (s) => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const pideFotos = () => cargaFotos || (cargaFotos = cargaJSON('datos/fotos.json').then((d) => { FOTOS = d.fotos || {}; return FOTOS; }).catch(() => { FOTOS = {}; return FOTOS; }));
  const fotoDe = (tipo, id) => (FOTOS && id != null ? FOTOS[tipo + '-' + pliegaF(id)] || null : null);
  // the author as Commons gives it, tidied («The original uploader was X at English Wikipedia.» → «X (Wikipedia en inglés)»)
  const ACENTO_RGB = '156,195,228';
  const autorLimpio = (a) => {
    let t = String(a || '').trim().replace(/^The original uploader was\s+/i, '').replace(/^(Photo|Foto|Photograph):\s*/i, '').replace(/^User:?\s+/i, '');
    t = t.replace(/\s+at\s+English Wikipedia\.?$/i, ' (' + T('Wikipedia en inglés') + ')').replace(/\.$/, '');
    return t.length > 70 ? t.slice(0, 68).trim() + '…' : t;
  };
  const creditoFoto = (fo) => T('Foto') + ': ' + (autorLimpio(fo.autor) || T('autor sin nombre')) + ' · ' + (fo.licencia || '') + ' · Wikimedia Commons';
  // a small map around a point, cut from the planet's own 16K map (static/tierra/dia-16k), with a ring on the point
  const MINI = new Map();
  const teselaMini = (k) => {
    let t = MINI.get(k);
    if (!t) { t = new Promise((ok) => { const im = new Image(); im.decoding = 'async'; im.onload = () => ok(im); im.onerror = () => ok(null); im.src = (document.documentElement.dataset.tierra || '/static/tierra/') + 'dia-16k/' + k + '.jpg'; }); MINI.set(k, t); }
    return t;
  };
  async function miniMapa(cv, lon, lat) {
    if (!cv) return;
    const W = cv.width, H = cv.height, ppd = 16384 / 360, esc = 2, marca = lon + ',' + lat;
    const cx = (lon + 180) * ppd, cy = (90 - lat) * ppd, sw = W / esc, sh = H / esc, x0 = cx - sw / 2, y0 = cy - sh / 2;
    const g = cv.getContext('2d'); g.fillStyle = '#0B0F15'; g.fillRect(0, 0, W, H); cv.dataset.para = marca;
    const teselas = [];
    for (let c = Math.floor(x0 / 2048); c <= Math.floor((x0 + sw) / 2048); c++) for (let f = Math.max(0, Math.floor(y0 / 2048)); f <= Math.min(3, Math.floor((y0 + sh) / 2048)); f++) teselas.push([c, f]);
    const ims = await Promise.all(teselas.map(([c, f]) => teselaMini((((c % 8) + 8) % 8) + '_' + f)));
    if (cv.dataset.para !== marca) return; // another card was opened meanwhile
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    teselas.forEach(([c, f], i) => { if (ims[i]) g.drawImage(ims[i], (c * 2048 - x0) * esc, (f * 2048 - y0) * esc, 2048 * esc, 2048 * esc); });
    g.strokeStyle = 'rgb(' + ACENTO_RGB + ')'; g.fillStyle = 'rgb(' + ACENTO_RGB + ')'; g.lineWidth = 3;
    g.beginPath(); g.arc(W / 2, H / 2, 20, 0, 2 * Math.PI); g.stroke(); g.beginPath(); g.arc(W / 2, H / 2, 6, 0, 2 * Math.PI); g.fill();
  }
  function pintaFoto(fig, fo, titulo) {
    if (!fig) return;
    if (!fo) { fig.hidden = true; fig.querySelector('img').removeAttribute('src'); return; }
    const im = fig.querySelector('img');
    im.width = fo.ancho || 640; im.height = fo.alto || 360; im.alt = titulo || '';
    im.src = 'static/fotos/' + fo.archivo;
    fig.querySelector('figcaption').textContent = creditoFoto(fo);
    fig.hidden = false;
  }
  function fotoFicha(f, fo, titulo) { // the summary card: a small strip on top
    let fig = f.querySelector('figure.foto');
    if (!fo) { if (fig) fig.hidden = true; return; }
    if (!fig) { fig = document.createElement('figure'); fig.className = 'foto'; fig.innerHTML = '<img alt="" decoding="async"><figcaption></figcaption>'; f.prepend(fig); }
    pintaFoto(fig, fo, titulo);
  }
  // hover → summary card; click → the whole panel
  function abreModelo(m, x, y) {
    if (clicActual) { abrePanel(m, x, y); return; }
    const pista = esTactil() ? T('Toca para la ficha completa') : T('Clic: ficha completa');
    fichaRica(m.titulo + (m.sub ? ' · ' + m.sub : ''), m.resumen, (m.pie ? m.pie + ' · ' : '') + pista, x, y, m.color, m.foto);
  }
  // a card with labels and values in two columns (satellites, data centres)
  // the colour of a cable beside its name, as in the legend of its layer (23 Oct 2026)
  function muestraEn(el, rgb) { if (!el || !rgb) return; const s = document.createElement('s'); s.className = 'muestra'; s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--c', rgb); el.prepend(s); }
  function fichaRica(titulo, filas, pie, x, y, color, foto) {
    const f = ficha(); if (!f) return;
    fotoFicha(f, foto, titulo);
    f.querySelector('b').textContent = titulo; muestraEn(f.querySelector('b'), color);
    const sp = f.querySelector('span'); sp.textContent = '';
    const dl = document.createElement('dl'); dl.className = 'sat-dl';
    for (const [k, v] of filas) { if (!v) continue; const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
    sp.append(dl);
    if (pie) { const s2 = document.createElement('small'); s2.textContent = pie; sp.append(s2); }
    f.classList.add('sat'); f.hidden = false;
    colocaFicha(x, y);
  }
  const kmEntre = (a, b) => { const d = Math.hypot(a[0] / 1.002 - b[0], a[1] / 1.002 - b[1], a[2] / 1.002 - b[2]); return 2 * 6371 * Math.asin(Math.min(1, d / 2)); };
  const dominio = (u) => { try { return new URL(/^https?:/.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch (_) { return ''; } };
  // 22 Oct 2026 (owner: «de los centros de datos quiero saberlo todo: dueño, tecnologías, año… cualquier cosa
  // interesante»): everything OpenStreetMap and Wikidata state about the building and its operator, and what we can
  // measure from the map itself (the nearest cable landing and exchange point, the light's time to you)
  function fichaCentro(i, x, y) {
    const q = PT.p[i], X = q.x || {}, wd = (PT.d.wikidata || {}), W = (X.w && wd.edificios && wd.edificios[X.w]) || {}, E = (X.ow && wd.empresas && wd.empresas[X.ow]) || null;
    const c = LUG && LUG.centros && LUG.de ? LUG.centros[LUG.de[i]] : null;
    const filas = [];
    if (q.o) {
      let op = q.o;
      if (E) { const m = []; if (E.pais) m.push(/^[A-Z]{2}$/.test(E.pais) ? paisNombre(E.pais) : E.pais); if (E.fundada) m.push(T('fundada en') + ' ' + E.fundada); if (E.matriz) m.push(T('del grupo') + ' ' + E.matriz); if (m.length) op += ' (' + m.join(', ') + ')'; }
      filas.push([T('Operador'), op]);
      const n = PT.porOp.get(q.o) || 0; if (n > 1) filas.push([T('Del mismo operador'), num(n) + ' ' + T('centros de datos en el mapa')]);
    }
    // a hand-verified point carries its own note; the «(city)» at its end goes, since «Dónde» says it (25 Oct 2026: it
    // was shown twice, as «Datos» and «Nota»)
    const nota = (X.nota || '').replace(/\s*\([^()]*\)\s*$/, '').trim();
    if (nota) filas.push([T('Datos'), T(nota)]); // a fixed note of ours (ronda 38) is translated; a free OpenStreetMap note stays as it is
    if (X.dir) filas.push([T('Dirección'), X.dir]);
    // 25 Oct 2026 (ronda 35): 1, only the city is known; 2, two voices put the building in the same area, less than 2 km apart
    if (X.aprox) filas.push([T('Ubicación aproximada'), X.aprox === 2 ? T('a menos de 2 km; la dirección exacta del edificio aún no está confirmada') : T('en la ciudad; la dirección exacta del edificio aún no está confirmada')]);
    const duenos = X.dueno || (W.duenos && W.duenos.join(', '));
    if (duenos && duenos !== q.o) filas.push([T('Dueño'), duenos]);
    const desde = X.desde || W.desde; if (desde) filas.push([T('En servicio desde'), String(desde).slice(0, 4)]);
    if (W.m2) filas.push([T('Superficie'), num(W.m2) + ' m²']);
    if (W.mw) filas.push([T('Potencia'), num(W.mw) + ' MW']);
    // 25 Oct 2026 (Abilene, 39 unnamed buildings): a campus OpenStreetMap maps building by building is one point
    if (X.edificios > 1) filas.push([T('Edificios'), num(X.edificios) + ' ' + T(q.n ? 'edificios en este campus' : 'edificios en este campus; su nombre aún no es público en los datos abiertos')]);
    if (X.plantas) filas.push([T('Plantas'), X.plantas]);
    if (X.alto) filas.push([T('Altura del edificio'), X.alto + ' m']);
    if (X.tier) filas.push(['Tier', X.tier]);
    if (X.pue) filas.push(['PUE', X.pue]);
    if (X.medio) filas.push([T('Conexión'), X.medio]);
    if (c && c.ciudad) filas.push([T('Dónde'), c.ciudad + ', ' + paisNombre(c.cc) + (c.n > 1 ? ' · ' + num(c.n) + ' ' + T('centros de datos en esta ciudad') : '')]);
    // measured on the map: the nearest submarine-cable landing (drawn while the pointer is here), its cables, the
    // land stretch, and the nearest internet exchange point
    const r = rutaCentro(i);
    if (r) {
      const L = LUG.llegadas[r.llegada], nombres = [];
      for (const k of L.seg) { const gi = grupoDe(k), nm = gi >= 0 ? LUG.grupos[gi][0] : ''; if (nm && !nombres.includes(nm)) nombres.push(nm); }
      // Owner, 22 Oct 2026: «tiene que ser un idioma comprensible para todos los clientes, fácil y a la vez profesional»
      // 25 Oct 2026, ronda 37 (ChatGPT + Gemini: «la proximidad no implica conexión»): the nearest landing, in a straight
      // line, and a plain line that this centre need not use that cable
      const K = T('Cable submarino cercano');
      if (r.lejos) filas.push([K, T('De las llegadas de cables de esta zona aún no tenemos datos.')]);
      else if (r.estacion) filas.push([K, T('La estación de cables submarinos más cercana es') + ' ' + (r.estacion.n || '') + (r.estacion.o ? ' (' + r.estacion.o + ')' : '') + ', ' + T('a') + ' ' + num(Math.round(r.km)) + ' km ' + T('en línea recta') + '.']);
      else filas.push([K, r.km < 2 ? T('Los cables submarinos salen del mar aquí mismo, en') + ' ' + L.ciudad + '.' : T('La llegada de cable submarino más cercana está en') + ' ' + L.ciudad + ' (' + paisNombre(L.cc) + '), ' + T('a') + ' ' + num(Math.round(r.km)) + ' km ' + T('en línea recta') + '. ' + T('No implica que este centro use ese cable.')]);
      filas.push([T('Por dónde viajan los datos'), T('Este centro se conecta a otras redes, pero sus rutas reales no son públicas: el mapa enseña la infraestructura cercana, no el recorrido confirmado de tus datos.')]);
      if (nombres.length && !r.estacion && !r.lejos) filas.push([T('Cables que llegan ahí'), nombres.slice(0, 4).join(' · ') + (nombres.length > 4 ? ' · +' + (nombres.length - 4) : '')]);
      if (r.km >= 2 && !r.lejos) filas.push([T('Por tierra'), r.via ? T('Desde esa llegada, unos') + ' ' + num(Math.round(r.kmRuta)) + ' km ' + T('por una red de fibra conocida') + (r.ops.length ? ' (' + r.ops.slice(0, 2).join(', ') + ')' : '') + '.' : T('La ruta exacta por tierra no es pública; en el mapa se dibuja en línea recta.')]);
    }
    if (PT.ix && PT.ix.length) {
      let m = null, dm = 1e9; for (const ix of PT.ix) { const d = kmEntre(q.w, ix.w.map((v) => v / 1.002)); if (d < dm) { dm = d; m = ix; } }
      if (m && dm < 300) filas.push([T('Intercambio de internet'), (m.n || T('sin nombre')) + ' · ' + (dm < 1 ? T('en el mismo sitio') : num(Math.round(dm)) + ' km')]);
    }
    const L = P() && P().lugar;
    // owner, 22 Oct 2026: «quiero datos sobre ese centro de datos que estoy viendo», not the distance from the visitor
    if (X.web) filas.push([T('Web'), dominio(X.web)]);
    { const fu = X.fuentes && X.fuentes.length ? T('Agencia GUARDIANA, dos voces') + ' · ' + dominios(X.fuentes) + ' · OpenStreetMap (ODbL)' : q.extra ? T('Agencia GUARDIANA, dos voces') : 'OpenStreetMap (ODbL)' + (X.w || X.ow ? ' · Wikidata (CC0)' : '');
      filas.push([T('Fuentes'), fu]); const fe = fechaIso(PT && PT.d && PT.d.descargado); if (fe && !q.extra) filas.push([T('Comprobado'), fe]); }
    const nn = nombreCentro(q), titulo = nn && nn !== q.o ? nn : (q.o ? q.o + ' · ' + T('centro de datos') : X.edificios > 1 ? T('Campus de centros de datos sin nombre') : T('Centro de datos sin nombre'));
    const fuentes = T('Datos verificados');
    const nube = q.o && /amazon|aws|google|microsoft|azure|meta|facebook|apple|oracle|alibaba|cloudflare|ovh|equinix|digital realty|telefónica|telefonica|orange|vodafone|claro|movistar/i.test(q.o);
    abreModelo(modelo(T('Centro de datos'), titulo, filas.length ? filas : [[T('Datos'), T('Sin más datos públicos sobre este edificio')]], fuentes, {
      foto: fotoDe('centro', X.w),
      resumen: [T('Operador'), T('Edificios'), T('Dónde'), T('En servicio desde'), T('Cable submarino cercano')],
      para: T('Aquí viven servicios de internet: cada vez que abres una web o guardas algo «en la nube», tus datos pasan por sitios como este.') + (nube ? ' ' + T('Si usas servicios de') + ' ' + q.o + ', ' + T('parte de tus datos puede estar guardada en edificios así.') : ''),
      secciones: [{ t: T('Infraestructura cercana'), claves: [T('Cable submarino cercano'), T('Cables que llegan ahí'), T('Por tierra'), T('Intercambio de internet'), T('Por dónde viajan los datos')], abierta: true }, { t: T('El edificio'), claves: [T('Operador'), T('Edificios'), T('Del mismo operador'), T('Dueño'), T('En servicio desde'), T('Superficie'), T('Potencia'), T('Plantas'), T('Altura del edificio'), 'Tier', 'PUE', T('Conexión'), T('Dónde'), T('Dirección'), T('Ubicación aproximada'), T('Web')] }, { t: T('Cómo lo sabemos'), claves: [T('Fuentes'), T('Comprobado')] }, { t: T('Notas'), claves: [T('Datos'), T('Nota')] }],
    }), x, y);
  }
  function fichaLugar(tipo, i, x, y) {
    const f = ficha(); if (!f) return;
    f.classList.remove('sat');
    if (tipo === 'punto') { fichaCentro(i, x, y); return; } else if (tipo === 'llegada') {
      const l = LUG.llegadas[i], nombres = [], sin = { n: 0 };
      for (const k of l.seg) { const gi = grupoDe(k), nm = gi >= 0 ? LUG.grupos[gi][0] : ''; if (nm) { if (!nombres.includes(nm)) nombres.push(nm); } else sin.n++; }
      f.querySelector('b').textContent = T('Aquí llegan cables submarinos') + ' · ' + l.ciudad;
      const lista = nombres.slice(0, 5).join(' · ') + (nombres.length > 5 ? ' · +' + (nombres.length - 5) : '');
      const ti = porTierra(l);
      const sigue = !ti ? '' : ti.length ? '\n' + T('Sigue por tierra') + ': ' + ti.slice(0, 4).join(' · ') + (ti.length > 4 ? ' · +' + (ti.length - 4) : '') : '\n' + T('Su ruta por tierra no es pública');
      f.querySelector('span').textContent = paisNombre(l.cc) + '\n' + (lista ? lista + (sin.n ? ' · +' + num(sin.n) : '') : num(sin.n) + ' ' + T(sin.n === 1 ? 'cable, nombre no publicado' : 'cables, nombres no publicados')) /* 22 Oct 2026, 21:30 (owner): «sin nombre» reads as a hole; the fact is that the source does not publish the name */ + sigue;
    } else if (tipo === 'centro') {
      const c = LUG.centros[i];
      f.querySelector('b').textContent = c.ciudad ? c.ciudad + ' · ' + paisNombre(c.cc) : T('Lejos de cualquier ciudad');
      const ops = c.ops.map(([o, k]) => o + (k > 1 ? ' ' + num(k) : '')).join(' · ');
      f.querySelector('span').textContent = num(c.n) + ' ' + T(c.n === 1 ? 'centro de datos' : 'centros de datos') + (ops ? '\n' + ops : '');
    } else {
      const d = capas.sub.d.cables[i];
      // the whole cable when its name is known: every place where one of its pieces reaches land, west to east (with the
      // pieces that joined it at load time, uneCables); an unnamed cable, the landings of its own pieces
      const gi = grupoDe(i), gr = gi >= 0 ? LUG.grupos[gi] : null, sitios = lugaresCable(i);
      const lados = sitios.map(([c, cc]) => c + ' (' + paisNombre(cc) + ')');
      const titulo = gr ? gr[0] : (d.n || T('Cable submarino sin nombre'));
      f.querySelector('b').textContent = titulo; muestraEn(f.querySelector('b'), colorSub(i)); // its colour, as in the legend
      // owner, 22 Oct 2026: «origen Francia, destino Brasil… sería más entendible». West to east; data goes both ways.
      const medio = lados.slice(1, -1);
      const donde = lados.length >= 2 ? T('Origen') + ': ' + lados[0] + '\n' + T('Destino') + ': ' + lados[lados.length - 1]
          + (medio.length ? '\n' + T('Paradas') + ': ' + medio.slice(0, 4).join(' · ') + (medio.length > 4 ? ' · +' + (medio.length - 4) : '') : '')
          + '\n' + T('Los datos viajan por él en los dos sentidos.')
        : lados.length === 1 ? T('Llega a tierra en') + ' ' + lados[0] : T('Sus extremos no están cerca de ninguna ciudad');
      const filas = [];
      if (lados.length >= 2) { filas.push([T('Origen'), lados[0]], [T('Destino'), lados[lados.length - 1]]); if (medio.length) filas.push([T('Paradas'), medio.join(' · ')]); }
      else if (lados.length === 1) filas.push([T('Llega a tierra en'), lados[0]]);
      // everything we know about the whole cable (owner, 22 Oct 2026: «el año, los kilómetros… todos los datos que sepamos»)
      const inf = (gr && gr[2]) || {}, mas = [];
      if (inf.anio) mas.push(T('En servicio desde') + ' ' + inf.anio);
      if (inf.km) mas.push(T('Longitud') + ': ' + num(inf.km) + ' km');
      else if (inf.kmMapa && !(UNION && UNION.prestados.has(gi))) mas.push(T('Longitud en el mapa') + ': ' + num(inf.kmMapa) + ' km'); // (it does not count the pieces that joined it here)
      if (inf.duenos && inf.duenos.length) mas.push(T('Dueños') + ': ' + inf.duenos.join(', '));
      // owner, 22 Oct 2026: «la distancia punto a punto»: between consecutive landings, west to east, as the crow
      // flies over the sea (the exact route of each stretch is not public), so it is said plainly
      if (sitios.length >= 2 && sitios.every((q) => Number.isFinite(q[3]))) {
        const tramos = [];
        for (let k = 1; k < sitios.length && tramos.length < 6; k++) { const a = sitios[k - 1], b = sitios[k]; const d = kmLL([a[2], a[3]], [b[2], b[3]]); if (d >= 20) tramos.push(a[0] + ' → ' + b[0] + ': ' + num(Math.round(d)) + ' km'); }
        if (tramos.length) mas.push(T('De punto a punto, en línea recta') + ': ' + tramos.join(' · ') + (sitios.length - 1 > 6 ? ' · …' : ''));
      }
      const ops = inf.operan && inf.operan.length ? inf.operan.join(', ') : d.o;
      if (ops) mas.push(T('Operador') + ': ' + ops);
      { const rl = relieveCable(i); if (rl) { mas.push(T('Profundidad del fondo bajo este tramo') + ': ' + T('máxima') + ' ' + num(rl.max) + ' m · ' + T('media') + ' ' + num(rl.med) + ' m' + (rl.plataforma ? ' · ' + rl.plataforma + ' % ' + T('en plataforma (menos de 200 m, donde va enterrado)') : '') + (rl.abisal ? ' · ' + rl.abisal + ' % ' + T('en llanura abisal (más de 4.000 m, apoyado en el fondo)') : '')); } }
      { const cp = capacidadDe(i); if (cp) { const clase = cp.tbps >= CAP.umbrales.gigante ? T('troncal gigante') : cp.tbps >= CAP.umbrales.grande ? T('troncal grande') : T('cable regional'); mas.push(T('Capacidad') + ': ' + (cp.tbps >= 1 ? num(cp.tbps) + ' Tbit/s' : num(Math.round(cp.tbps * 1000)) + ' Gbit/s') + (cp.pares ? ' · ' + cp.pares + ' ' + T('pares de fibra') : '') + ' · ' + clase); } }
      if (inf.aprox) {  // rebuilt by the agency: say so, and where it was checked
        mas.push(T('Trazado aproximado por mar') + ' · ' + T('Datos verificados'));
        // 23 Oct 2026: a hop that would run hundreds of km over land is not drawn (a terrestrial link we cannot trace)
        if (inf.sinTrazar) mas.push(inf.sinTrazar === 1 ? T('Un tramo por tierra sin dibujar') : num(inf.sinTrazar) + ' ' + T('tramos por tierra sin dibujar'));
      }
      // 22 Oct 2026, 14:34 (owner): «el cable que se rompió también lo indicamos»: known cuts and repairs, by hand
      { const nn = norm(gr ? gr[0] : (d.n || '')); const nt = NOTAS && NOTAS.find((q) => new RegExp('(^|[^a-z0-9])' + q.clave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)').test(nn)); if (nt) { if (nt.incidentes) mas.push(T('Incidencias conocidas') + ': ' + nt.incidentes); if (nt.estado) mas.push(T('Estado') + ': ' + T(nt.estado === 'en servicio' ? 'En servicio' : 'En construcción')); } }
      // 23 Oct 2026 (owner: «hay varios que se quedan ahí como en el mar. ¿Es un error?»): a cable whose line fades out into
      // the sea says why, and nothing more (see uneCables)
      const corto = cadenaSuelta(i) ? T('En los datos abiertos (OpenStreetMap) este cable está trazado solo hasta donde se apaga la línea.') : '';
      f.querySelector('span').textContent = donde + (mas.length ? '\n' + mas.join('\n') : '') + (corto ? '\n' + corto : '');
      if (clicActual) {
        for (const m of mas) { const j = m.indexOf(': '); if (j > 0 && j < 40) filas.push([m.slice(0, j), m.slice(j + 2)]); else filas.push(['', m]); }
        if (corto) filas.push([T('Trazado'), corto]);
        { const fu = inf.aprox ? T('Reconstruido por la agencia GUARDIANA de fuentes públicas, confirmado por dos voces') + (inf.fuentes && inf.fuentes.length ? ' · ' + dominios(inf.fuentes) : '') : 'OpenStreetMap (ODbL)' + (d.w ? ' · Wikidata (CC0)' : '');
          filas.push([T('Fuentes'), fu]); const fe = fechaIso(capas.sub && capas.sub.d && capas.sub.d.descargado); if (fe) filas.push([T('Comprobado'), fe]); }
        const cp = capacidadDe(i), L = P() && P().lugar, miPais = L && P().pais;
        const toca = miPais ? sitios.find((q) => q[1] === miPais) : null;
        abreModelo(modelo(gr && gr[2] && gr[2].aprox ? T('Cable submarino') + ' · ' + T('trazado aproximado') : T('Cable submarino'), titulo, filas, T('Datos verificados'), {
          sub: lados.length >= 2 ? lados[0].replace(/ \(.*\)$/, '') + ' → ' + lados[lados.length - 1].replace(/ \(.*\)$/, '') : '',
          resumen: [T('Origen'), T('Destino'), T('En servicio desde'), T('Longitud'), T('Capacidad')],
          para: (lados.length >= 2 ? T('Une') + ' ' + lados[0] + ' ' + T('con') + ' ' + lados[lados.length - 1] + ' ' + T('por el fondo del mar.') + ' ' : '') + T('Cuando tus datos cruzan entre esos dos lados —un vídeo, un correo, una copia de seguridad— pueden ir por este cable o por otros paralelos; si uno se corta, el tráfico se reparte por los demás y lo notas como lentitud, no como apagón.') + (toca ? ' ' + T('Llega a tu país por') + ' ' + toca[0] + '.' : '') + (cp && cp.tbps >= 100 ? ' ' + T('Es una de las grandes autopistas: por él cabe el tráfico de decenas de millones de personas a la vez.') : ''),
          secciones: [{ t: T('Recorrido y profundidad'), claves: [T('Paradas'), T('Trazado'), T('De punto a punto, en línea recta'), T('Profundidad del fondo bajo este tramo'), T('Longitud en el mapa')], abierta: true }, { t: T('Datos'), claves: [T('Dueños'), T('Operador'), T('Capacidad'), T('Longitud'), T('En servicio desde')] }, { t: T('Cómo lo sabemos'), claves: [T('Fuentes'), T('Comprobado')] }, { t: T('Incidencias y estado'), claves: [T('Incidencias conocidas'), T('Estado')] }],
          color: colorSub(i),
        }), x, y);
        return;
      }
    }
    f.hidden = false; colocaFicha(x, y);
  }
  // ---------- a crowded spot (owner, 22 Oct 2026): «se hace muy difícil clicar» ----------
  // A click near several data centres opens a small list of the ones within reach; it stays until one is chosen
  // (or Esc / a click elsewhere), and hovering the planet does not replace it meanwhile.
  let lista = null, fichaFija = false; // fijo: a card chosen from the list stays until the next click
  function cercanos(x, y, r) {
    if (!estado.puntos || !PT || !PT.p) return [];
    const p = P(), G = p.geo, out = [];
    for (let i = 0; i < PT.p.length; i++) { const v = p.aVista(PT.p[i].w); if (v[2] <= 0.05) continue; const dx = G.CX + G.R * v[0] - x, dy = G.CY - G.R * v[1] - y, d2 = dx * dx + dy * dy; if (d2 <= r * r) out.push([d2, i]); }
    return out.sort((a, b) => a[0] - b[0]).map((a) => a[1]);
  }
  // 25 Oct 2026: OpenStreetMap names some buildings with just a letter or a number («A», «B», «2»); alone they say nothing
  const nombreCentro = (q) => (q.n && q.n.trim().length <= 2 ? (q.o ? q.o + ' · ' : T('Centro de datos') + ' ') + q.n.trim() : q.n);
  function cierraLista() { if (lista) { lista.remove(); lista = null; } }
  function abreLista(idx, x, y) {
    cierraLista(); const f = ficha(); if (f) f.hidden = true;
    const ciudad = (() => { const c = buscaCentro(x, y); return c >= 0 && LUG && LUG.centros[c] && LUG.centros[c].ciudad ? LUG.centros[c].ciudad : ''; })();
    lista = document.createElement('div'); lista.className = 'lista-cerca'; lista.setAttribute('role', 'listbox');
    const t = document.createElement('div'); t.className = 'titulo'; t.textContent = num(idx.length) + ' ' + T(idx.length === 1 ? 'centro de datos' : 'centros de datos') + ' ' + T('aquí') + (ciudad ? ' · ' + ciudad : ''); lista.appendChild(t);
    const h = document.createElement('p'); h.className = 'pista'; h.textContent = T('Elige uno para ver su ficha.'); lista.appendChild(h);
    const ul = document.createElement('div'); ul.className = 'filas';
    for (const i of idx.slice(0, 40)) {
      const q = PT.p[i], b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'option');
      b.innerHTML = '<b></b><span></span>'; b.querySelector('b').textContent = nombreCentro(q) || q.o || (q.x && q.x.edificios > 1 ? T('Campus de centros de datos sin nombre') : T('Centro de datos sin nombre')); b.querySelector('span').textContent = q.x && q.x.edificios > 1 ? num(q.x.edificios) + ' ' + T('edificios') : q.n && q.n.trim().length > 2 && q.o && q.o !== q.n ? q.o : '';
      b.addEventListener('mouseenter', () => { puntoMarcado = i; }); // the dot lights up on the planet while you look at the row
      b.addEventListener('click', (e) => { e.stopPropagation(); const r = b.getBoundingClientRect(); cierraLista(); cableMarcado = llegadaMarcada = centroMarcado = fibraMarcada = -1; puntoMarcado = i; clicActual = true; fichaLugar('punto', i, r.right + 8, r.top); fichaFija = true; });
      ul.appendChild(b);
    }
    if (idx.length > 40) { const m = document.createElement('p'); m.className = 'pista'; m.textContent = '+' + num(idx.length - 40) + ' · ' + T('acerca más para verlos todos'); ul.appendChild(m); }
    lista.appendChild(ul);
    const x0 = document.createElement('button'); x0.type = 'button'; x0.className = 'cerrar'; x0.setAttribute('aria-label', T('Cerrar')); x0.textContent = '×'; x0.addEventListener('click', (e) => { e.stopPropagation(); cierraLista(); }); lista.appendChild(x0);
    document.body.appendChild(lista);
    const W = innerWidth, H = innerHeight, r = lista.getBoundingClientRect();
    lista.style.left = Math.max(8, Math.min(W - r.width - 8, x + 14)) + 'px'; lista.style.top = Math.max(60, Math.min(H - r.height - 8, y - 20)) + 'px';
    lista.addEventListener('click', (e) => e.stopPropagation());
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lista) cierraLista(); });
  let estacionMarcada = -1, previstoMarcado = -1;
  function mira(x, y, clic) {
    if ((lista || fichaFija) && !clic) return; // the list is open, or a card was chosen from it: hovering changes nothing
    clicActual = !!clic;
    // the flower of crowded data centres (see abreFlor): it stays while the pointer is inside it
    if (FLOR) {
      const p0 = P(), c = p0 && florCentro(p0, p0.geo);
      if (!c || Math.hypot(x - c[0], y - c[1]) > FLOR.r + 22) { cierraFlor(); if (puntoMarcado >= 0 && !clic) { puntoMarcado = -1; muestra(-1); } }
      else {
        const q = buscaPunto(x, y);
        if (q >= 0 && FLOR.set.has(q)) { cableMarcado = llegadaMarcada = centroMarcado = fibraMarcada = -1; if (q !== puntoMarcado || clic) { puntoMarcado = q; fichaLugar('punto', q, c[0] + FLOR.r + 24, y); } if (clic) fichaFija = true; return; }
        if (clic && FLOR.mas) { const idx = FLOR.idx.concat(cercanos(c[0], c[1], 30).filter((i) => !FLOR.set.has(i))); cierraFlor(); abreLista(idx, x, y); return; }
        if (!clic) return; // between two marks: the last card stays
        cierraFlor();
      }
    } else if (!clic && estado.puntos && PT && PT.p && P() && P().geo.R / (P().geo.R0 || 1) >= FLOR_ZOOM) {
      const cerca = cercanos(x, y, 16).filter((i) => vePunto(PT.p[i]));
      if (cerca.length >= 3) { abreFlor(cercanos(x, y, 26).filter((i) => vePunto(PT.p[i]))); cableMarcado = llegadaMarcada = centroMarcado = fibraMarcada = puntoMarcado = -1; muestra(-1); return; }
    }
    if (clic) {
      fichaFija = false;
      const z = P() ? P().geo.R / (P().geo.R0 || 1) : 1, cerca = cercanos(x, y, z >= 8 ? 14 : 22);
      if (cerca.length >= 2) { abreLista(cerca, x, y); return; }
      if (lista) cierraLista();
    }
    if (P() && P().dentro) { if (marcado >= 0 || centroMarcado >= 0 || cableMarcado >= 0 || llegadaMarcada >= 0 || puntoMarcado >= 0) { centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = -1; muestra(-1); } return; }
    const pc = buscaPais(x, y);
    if (pc) { centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = fibraMarcada = previstoMarcado = estacionMarcada = -1; if (pc !== paisMarcado || clic) { paisMarcado = pc; fichaPais(pc, x, y); } else colocaFicha(x, y); if (clic) fichaFija = true; return; }
    paisMarcado = null;
    const est = buscaEstacion(x, y);
    if (est >= 0) { centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = fibraMarcada = previstoMarcado = -1; if (est !== estacionMarcada || clic) { estacionMarcada = est; fichaEstacion(est, x, y); } else colocaFicha(x, y); if (clic) fichaFija = true; return; }
    estacionMarcada = -1;
    const q = buscaPunto(x, y);
    if (q >= 0) { if (marcado >= 0) { marcado = -1; } cableMarcado = llegadaMarcada = centroMarcado = fibraMarcada = -1; if (q !== puntoMarcado || clic) { puntoMarcado = q; fichaLugar('punto', q, x, y); } else colocaFicha(x, y); if (clic) fichaFija = true; return; }
    puntoMarcado = -1;
    const i = estado.sat ? busca(x, y) : -1;
    if (i >= 0) { centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = -1; muestra(i, x, y); if (clic) fichaFija = true; return; }
    if (marcado >= 0) muestra(-1);
    const g = buscaLlegada(x, y);
    if (g >= 0) { cableMarcado = centroMarcado = -1; if (g !== llegadaMarcada || clic) { llegadaMarcada = g; fichaLugar('llegada', g, x, y); } else colocaFicha(x, y); return; }
    llegadaMarcada = -1;
    const c = buscaCentro(x, y);
    if (c >= 0) { cableMarcado = -1; if (c !== centroMarcado || clic) { centroMarcado = c; fichaLugar('centro', c, x, y); } else colocaFicha(x, y); return; }
    centroMarcado = -1;
    const pv = buscaPrevisto(x, y);
    if (pv >= 0) { centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = fibraMarcada = -1; if (pv !== previstoMarcado || clic) { previstoMarcado = pv; fichaPrevisto(pv, x, y); } else colocaFicha(x, y); if (clic) fichaFija = true; return; }
    previstoMarcado = -1;
    const k = buscaCable(x, y);
    if (k >= 0) { fibraMarcada = -1; if (k !== cableMarcado || clic) { cableMarcado = k; fichaLugar('cable', k, x, y); } else colocaFicha(x, y); if (clic) fichaFija = true; return; }
    if (cableMarcado >= 0) cableMarcado = -1;
    const ft = buscaFibra(x, y);
    if (ft >= 0) { radioMarcado = -1; if (ft !== fibraMarcada || clic) { fibraMarcada = ft; fichaFibra(ft, x, y); } else colocaFicha(x, y); if (clic) fichaFija = true; return; }
    fibraMarcada = -1;
    const rd = buscaRadio(x, y);
    if (rd >= 0) { if (rd !== radioMarcado || clic) { radioMarcado = rd; fichaRadio(rd, x, y); } else colocaFicha(x, y); if (clic) fichaFija = true; return; }
    radioMarcado = -1;
    const f = ficha(); if (f && !f.hidden) f.hidden = true;
    if (clic && panelModelo) cierraPanel(); // a click on nothing closes the full card
  }
  // the interface on top of the planet (layer buttons, satellite filter, gauges…) never reaches the map underneath (owner, 22 Oct 2026, 18:03)
  const UI_ENCIMA = 'header, .capa-vista, #puertas, #radiografias, #directo, #lugar, #seccion, .zoom, .conexion, .lista-cerca, #sat-ficha, #ficha-panel, #capas, #sat-vista, #sat-fase, #capa-nota, .altura, #dato, #viaje, #informe, button, a, select, input, label';
  addEventListener('click', (e) => { if (!soloTu && !e.target.closest(UI_ENCIMA)) { recogeTarjetas(); mira(e.clientX, e.clientY, true); } });
  // 23 Oct 2026, 09:06 (owner): «cuando una persona clique en la pantalla… desaparezca cualquier cuadro de los de arriba…
  // que no se anule, que se quede como estaba». A click on the planet only folds the open layer card; the layer and its
  // switches stay exactly as they were, and the layer button opens the card again.
  function recogeTarjetas() {
    let algo = false;
    for (const k of Object.keys(PLEGADO)) if (!PLEGADO[k] && (estado[k] || VACIA[k])) { PLEGADO[k] = true; algo = true; }
    if (estado.sat && !estado.satPlegado) { estado.satPlegado = true; algo = true; }
    if (algo) { pintaClases(); pintaVista(); }
  }
  addEventListener('pointermove', (e) => {
    if (e.target && e.target.closest && e.target.closest(UI_ENCIMA)) { if (!fichaFija && (cableMarcado >= 0 || llegadaMarcada >= 0 || centroMarcado >= 0 || fibraMarcada >= 0 || puntoMarcado >= 0 || previstoMarcado >= 0 || estacionMarcada >= 0)) { cableMarcado = llegadaMarcada = centroMarcado = fibraMarcada = puntoMarcado = previstoMarcado = estacionMarcada = -1; muestra(-1); } return; }
    if (pendiente) { pendiente.x = e.clientX; pendiente.y = e.clientY; return; }
    pendiente = { x: e.clientX, y: e.clientY };
    requestAnimationFrame(() => { const q = pendiente; pendiente = null; mira(q.x, q.y); pintaMano(); });
  }, { passive: true });
  // 22 Oct 2026, 21:42 (owner): «el ratón debe ser el de siempre, una flechita; cuando paso por encima de un cable tiene que ser
  // la mano, para que se entienda que hay algo que se puede ver». The hand shows only over something with a card.
  function pintaMano() {
    const algo = !!paisMarcado || marcado >= 0 || centroMarcado >= 0 || cableMarcado >= 0 || llegadaMarcada >= 0 || puntoMarcado >= 0 || previstoMarcado >= 0 || estacionMarcada >= 0 || fibraMarcada >= 0;
    document.body.classList.toggle('mano', algo);
  }

  // ---------- one orbit at a time: what that orbit is, measured on the satellites themselves ----------
  function pintaFase() {
    const el = $('sat-fase'); if (!el) return;
    const solo = Object.keys(estado.orb).filter((x) => estado.orb[x]);
    const m = S && S.medias ? S.medias[solo[0]] : null;
    if (!estado.sat || solo.length !== 1 || !m || !m.n) { el.hidden = true; return; }
    const k = solo[0], ms = Math.round(2 * m.alto / 299.792458 * 10) / 10; // up and down at the speed of light, at the least
    const partes = [num(m.n) + ' ' + T('satélites'), k === 'geo' ? T('a') + ' ' + num(Math.round(m.alto / 10) * 10) + ' km' : T('a una media de') + ' ' + num(Math.round(m.alto / 10) * 10) + ' km'];
    partes.push(k === 'geo' ? T('giran con la Tierra y parecen quietos sobre el mismo punto') : T('dan la vuelta a la Tierra en unos') + ' ' + num(Math.round(m.periodo)) + ' min');
    partes.push(T('la señal tarda al menos') + ' ' + num(ms < 10 ? ms : Math.round(ms)) + ' ms ' + T('en subir y bajar'));
    const txt = partes.join(' · ');
    if (el.textContent !== txt) el.textContent = txt;
    el.hidden = false;
  }

  // ---------- which satellites: view and orbit (with the real count beside each orbit) ----------
  function pintaVista() {
    const caja = $('sat-vista'); if (!caja) return;
    caja.hidden = !(estado.sat || VACIA.sat) || !!estado.satPlegado;
    // the card hangs under the «Satélites» button (owner: «un desplegable»); centred on it when there is room
    const b = document.querySelector('#capas [data-capa="sat"]');
    if (b && !caja.hidden && innerWidth > 760) { const r = b.getBoundingClientRect(), w = caja.offsetWidth || 340; let x = r.left + r.width / 2 - w / 2; x = Math.max(12, Math.min(innerWidth - w - 12, x)); caja.style.left = x + 'px'; caja.style.transform = 'none'; caja.style.top = (r.bottom + 10) + 'px'; }
    caja.querySelectorAll('[data-vista]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.vista === estado.vista)));
    caja.querySelectorAll('[data-orb]').forEach((b) => { b.setAttribute('aria-pressed', String(!!estado.orb[b.dataset.orb])); const c = S && S.cuentaOrb ? S.cuentaOrb[b.dataset.orb] : 0; b.querySelector('b').textContent = c ? num(c) : ''; });
    pintaFase();
    document.body.classList.toggle('tarjeta', !caja.hidden || !!document.querySelector('.capa-vista:not([hidden])'));
    const cielo = caja.querySelector('[data-vista="cielo"]'); const L = P() && P().lugar;
    if (cielo) { cielo.disabled = !L; const t = cielo.querySelector('.cielo-t'); const v = L && L.nombre ? T('Sobre') + ' ' + L.nombre : T('Sobre ti'); if (t.textContent !== v) t.textContent = v; }
  }
  function enganchaVista() {
    const caja = $('sat-vista'); if (!caja) return;
    const ti = caja.querySelector('.titulo');
    if (ti) { const x = document.createElement('button'); x.type = 'button'; x.className = 'plegar'; x.setAttribute('aria-label', T('Minimizar el panel')); x.title = T('Minimizar el panel'); x.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg><span>' + T('Minimizar') + '</span>'; x.addEventListener('click', () => { estado.satPlegado = true; if (VACIA.sat) { VACIA.sat = false; estado.orb = { baja: true, media: true, geo: true }; guarda(); } pintaVista(); }); ti.appendChild(x); }
    // the «Satélites» button unfolds the card again when the layer is on but the card was folded
    const sb = document.querySelector('#capas [data-capa="sat"]');
    if (sb) sb.addEventListener('click', (e) => { if (estado.sat && estado.satPlegado) { e.stopImmediatePropagation(); estado.satPlegado = false; for (const q of Object.keys(PLEGADO)) PLEGADO[q] = true; pintaVista(); pintaClases(); } }, true);
    caja.querySelectorAll('[data-vista]').forEach((b) => b.addEventListener('click', () => { estado.vista = b.dataset.vista; guarda(); pintaVista(); pintaNota(); }));
    // 22 Oct 2026 (owner: «por capas… la persona tiene que ver»): every orbit is a layer the person switches on or
    // off on its own; the satellites open with the geostationary ring only. The last layer on cannot be switched off
    // (the button would show nothing); the person turns the satellites off instead.
    // 22 Oct 2026, 22:20 (owner: «no me deja borrar la geoestacionaria para poder quitar todos del mapa»): every orbit
    // switches off; switching off the last one clears the satellites from the map (the layer turns off) and the
    // orbits go back to their opening state for the next time.
    caja.querySelectorAll('[data-orb]').forEach((b) => b.addEventListener('pointerenter', () => { const d = b.querySelector('.d'); if (d) b.title = d.textContent; }));
    caja.querySelectorAll('[data-orb]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.orb, encendidas = Object.keys(estado.orb).filter((x) => estado.orb[x]);
      if (estado.orb[k] && encendidas.length === 1) { estado.orb[k] = false; VACIA.sat = true; guarda(); pon('sat', false); return; }
      estado.orb[k] = !estado.orb[k];
      if (!estado.sat) { const queda = Object.assign({}, estado.orb); pon('sat', true); estado.orb = queda; }
      guarda(); pintaVista(); pintaNota();
    }));
  }

  // ---------- the class cards under the layer buttons (22 Oct 2026, 21:48) ----------
  const TEXTOS_CLASES = {
    // 22 Oct 2026, 22:02 (owner): «palabras para que sean entendibles, todo»
    // 23 Oct 2026, 09:17 (owner: «busca las palabras más apropiadas, entendibles y profesionales»): agency round with ChatGPT and Grok
    sub: { titulo: 'Cables submarinos', clases: { gigante: ['Autopistas entre continentes', 'Los cables más potentes: más de 100 Tbit/s.'], grande: ['Grandes rutas', 'Entre 20 y 100 Tbit/s: unen países y regiones.'], regional: ['Cables regionales', 'Menos de 20 Tbit/s: unen islas y países vecinos.'], sinDato: ['Capacidad no publicada', 'Cables en funcionamiento cuya capacidad no han publicado sus propietarios.'], aprox: ['Trazado aproximado', 'Sabemos dónde llega, pero no su recorrido exacto. Línea discontinua.'], previstos: ['Cables en proyecto', 'Anunciados o en construcción; aún no transportan datos. Línea discontinua.'] } },
    fibra: { titulo: 'Cables terrestres', /* owner, 23 Oct 2026, 22:55: «Cables por tierra, mejor»; 27 Oct, 09:49: «Cables terrestres» */ clases: { principal: ['Grandes troncales', 'Rutas de 800 km o más, o compartidas por varias compañías.'], largo: ['Rutas largas', 'De 400 a 800 km, entre regiones.'], nacional: ['Rutas entre ciudades', 'De 150 a 400 km; aparecen al acercarte.'], regional: ['Enlaces cortos', 'Menos de 150 km, dentro de una zona; aparecen muy de cerca.'] , radio: ['Radioenlaces', 'Cadenas de microondas de torre en torre: donde no hay fibra entre pueblos, y las rutas rápidas de la bolsa.']} },
    puntos: { titulo: 'Puntos de red', clases: { datos: ['Grandes operadores', 'De compañías con 5 centros de datos o más en el mapa.'], pequenos: ['Otros centros de datos', 'De compañías con 1 a 4 centros de datos en el mapa, o sin operador conocido.'], intercambio: ['Puntos de intercambio', 'Donde las redes de distintas compañías se conectan entre sí.'], estaciones: ['Bases y antenas', 'Bases del Ártico y la Antártida, estaciones terrestres de satélites y plataformas petrolíferas donde termina un cable.'] } },
  };

  const PLEGADO = { sub: true, fibra: true, puntos: true }; // the cards open on the button's click, one at a time; on arrival none is open
  // 24 Oct 2026 (QA: «506 named cables… one class (861) is larger than the total»): the figures count whole cables
  // (a named cable is one, however many pieces the map draws it with), never the pieces
  function cuentaCables(filtro) {
    if (!capas.sub || !capas.sub.lineas || !capas.sub.d) return 0;
    const vistos = new Set(), cab = capas.sub.d.cables;
    capas.sub.lineas.forEach((l, i) => { if (!filtro(l, i)) return; const g = grupoDe(i); if (g >= 0) vistos.add('g' + g); else if (cab[i] && cab[i].n) vistos.add('n' + cab[i].n); });
    return vistos.size;
  }
  function cuentaClase(k, c) {
    try {
      if (k === 'sub') { if (!capas.sub || !capas.sub.lineas || !CAP) return 0; if (c === 'previstos') return PREV ? PREV.length : 0; if (c === 'aprox') return cuentaCables((l) => l.aprox); return cuentaCables((l, i) => claseSub(i) === c); }
      if (k === 'fibra') { if (c === 'radio') return RD && RD.lineas ? RD.lineas.length : 0; if (!FT || !FT.lineas) return 0; preparaNiveles(); return FT.lineas.filter((l) => claseFibra(l) === c).length; }
      if (k === 'puntos') { if (c === 'estaciones') return EST ? EST.length : 0; if (!PT || !PT.p) return 0; if (c === 'intercambio') return PT.ix ? PT.ix.length : 0; if (c === 'pequenos') return PT.p.filter((q) => q.t === 'datos' && !esGrande(q)).length; if (c === 'datos') return PT.p.filter((q) => q.t === 'datos' && esGrande(q)).length; return PT.p.filter((q) => q.t === c).length; }
    } catch (_) {}
    return 0;
  }
  function enganchaClases() {
    const header = document.querySelector('header'); if (!header) return;
    for (const k of Object.keys(TEXTOS_CLASES)) {
      const b = document.querySelector(`#capas [data-capa="${k}"]`); if (!b) continue;
      const caja = document.createElement('div'); caja.id = k + '-vista'; caja.className = 'sat-vista capa-vista'; caja.hidden = true; caja.setAttribute('role', 'group');
      const orb = document.createElement('div'); orb.className = 'orb'; caja.appendChild(orb);
      const ti = document.createElement('div'); ti.className = 'titulo'; ti.textContent = T(TEXTOS_CLASES[k].titulo); orb.appendChild(ti);
      const x = document.createElement('button'); x.type = 'button'; x.className = 'plegar'; x.setAttribute('aria-label', T('Minimizar el panel')); x.title = T('Minimizar el panel'); x.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg><span>' + T('Minimizar') + '</span>'; x.addEventListener('click', () => { PLEGADO[k] = true; if (VACIA[k]) { VACIA[k] = false; for (const q of Object.keys(CLASES[k])) CLASES[k][q] = true; } pintaClases(); }); ti.appendChild(x);
      // 23 Oct 2026: the submarine card says what its colours mean, on screen (a phone has no tooltips)
      if (k === 'sub') { const ley = document.createElement('p'); ley.className = 'leyenda'; ley.textContent = T('El color indica la capacidad: más de 100 Tbit/s, de 20 a 100, menos de 20 o no publicada.'); orb.appendChild(ley); } // in the order of the coloured classes below
      for (const c of Object.keys(TEXTOS_CLASES[k].clases)) {
        const [n, d] = TEXTOS_CLASES[k].clases[c];
        const bt = document.createElement('button'); bt.type = 'button'; bt.dataset.clase = c; bt.setAttribute('aria-pressed', String(!!CLASES[k][c]));
        bt.innerHTML = '<i aria-hidden="true"></i><span class="n"></span><span class="d"></span>';
        bt.querySelector('.n').append(T(n), ' ', Object.assign(document.createElement('b'), {})); bt.querySelector('.d').textContent = T(d); bt.title = T(d); // 22 Oct 2026, 22:09 (owner): the card lists classes only; the explanation shows under the pointer
        // 23 Oct 2026 (owner: «los de tierra los vamos a segmentar por colores»): each land-fibre class shows its colour, as in a map legend
        if (k === 'fibra') { const m = document.createElement('s'); m.className = 'muestra' + (c === 'radio' ? ' punto' : ''); m.setAttribute('aria-hidden', 'true'); m.style.setProperty('--c', c === 'radio' ? RADIO_COL : FIBRA_COL[{ principal: 3, largo: 2, nacional: 1, regional: 0 }[c]]); bt.querySelector('.n').prepend(m); }
        // 23 Oct 2026 (owner: «los cables submarinos también… van a ir por colores»): the same colours by capacity; the
        // approximate and planned routes show their dashes (each one is drawn in the colour of its capacity)
        if (k === 'sub') { const m = document.createElement('s'); m.className = 'muestra' + (c === 'aprox' ? ' raya' : c === 'previstos' ? ' punto' : ''); m.setAttribute('aria-hidden', 'true'); m.style.setProperty('--c', SUB_COL[c] || BLANCO); bt.querySelector('.n').prepend(m); }
        bt.addEventListener('click', () => {
          CLASES[k][c] = !CLASES[k][c];
          if (k === 'sub' && capas.sub) capas.sub.visK = null;
          // every switch red = the layer off on the map (its button too), the card stays open for the person
          if (todasApagadas(k)) { VACIA[k] = true; pon(k, false); return; }
          // a switch turned green again in an emptied card lights the layer with just what is green
          if (!estado[k]) { const queda = Object.assign({}, CLASES[k]); pon(k, true); Object.assign(CLASES[k], queda); if (k === 'sub' && capas.sub) capas.sub.visK = null; }
          pintaClases(); pintaNota();
        });
        orb.appendChild(bt);
      }
      header.appendChild(caja);
      // the layer button unfolds the card again when the layer is on but the card was folded
      b.addEventListener('click', (e) => { if (estado[k] && PLEGADO[k]) { e.stopImmediatePropagation(); for (const q of Object.keys(PLEGADO)) PLEGADO[q] = q !== k; estado.satPlegado = true; pintaVista(); pintaClases(); } }, true);
    }
    addEventListener('resize', pintaClases);
  }
  function pintaClases() {
    let abierta = !!(estado.sat && !estado.satPlegado);
    for (const k of Object.keys(TEXTOS_CLASES)) {
      const caja = $(k + '-vista'); if (!caja) continue;
      caja.hidden = !(estado[k] || VACIA[k]) || !!PLEGADO[k];
      if (!caja.hidden) abierta = true;
      const b = document.querySelector(`#capas [data-capa="${k}"]`);
      if (b && !caja.hidden && innerWidth > 760) { const r = b.getBoundingClientRect(), w = caja.offsetWidth || 340; let x = r.left + r.width / 2 - w / 2; x = Math.max(12, Math.min(innerWidth - w - 12, x)); caja.style.left = x + 'px'; caja.style.transform = 'none'; caja.style.top = (r.bottom + 10) + 'px'; }
      caja.querySelectorAll('[data-clase]').forEach((bt) => { const c = bt.dataset.clase; bt.setAttribute('aria-pressed', String(!!CLASES[k][c])); bt.disabled = !cuentaEn(k, c); const n = cuentaClase(k, c); bt.querySelector('b').textContent = n ? num(n) : ''; });
    }
    document.body.classList.toggle('tarjeta', abierta);
  }
  // ---------- the three buttons ----------
  function pon(clave, on) {
    estado[clave] = on; guarda();
    if (on) VACIA[clave] = false;
    const b = document.querySelector(`#capas [data-capa="${clave}"]`); if (b) b.setAttribute('aria-pressed', String(on));
    // one card at a time: the layer just switched on shows its card, the others fold
    if (on) { for (const k of Object.keys(PLEGADO)) PLEGADO[k] = k !== clave; estado.satPlegado = clave !== 'sat'; }
    // 22 Oct 2026, 22:42 (owner: «si los pongo todos… no puede quedar entremezclado… es un semáforo»): a layer switched on
    // shows everything — all its classes green; the person switches off what they do not want from the card.
    if (on && CLASES[clave]) { for (const q of Object.keys(CLASES[clave])) CLASES[clave][q] = true; if (clave === 'sub' && capas.sub) capas.sub.visK = null; }
    if (on && clave === 'sat') estado.orb = { baja: true, media: true, geo: true };
    if (on) { if (clave === 'sat') cargaSat(); else if (clave === 'puntos') { cargaPuntos(); cargaCables('sub'); cargaFibra(); } else if (clave === 'fibra') cargaFibra(); else { cargaCables(clave); if (clave === 'sub') { cargaFibra(); cargaEstaciones(); cargaNotas(); cargaPaises(); cargaCapacidad(); cargaRelieve(); } } }
    if (!on) { muestra(-1); centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = fibraMarcada = -1; }
    pintaNota(); pintaVista(); pintaClases();
  }
  // ---------- the card under the pointer on the four layer buttons ----------
  // 23 Oct 2026, 23:32 (owner, with a photo of the browser's long tooltip): «quiero que salga un cuadrado bien diseñado,
  // y los cuatro tienen que ser más o menos el mismo tamaño». One card, the same 300 × 300 px for the four: the layer,
  // its figure, what it is, its classes as a legend and «Datos verificados». Only with a mouse (a touch screen has the
  // class cards); it never takes the pointer, so the button under it keeps working.
  const FRASE_CAPA = {
    sub: 'Los cables submarinos por donde viajan los datos entre continentes',
    fibra: 'Las grandes redes de fibra que llevan internet por tierra, de las llegadas de cables al interior',
    puntos: 'Los centros de datos donde se guarda y se sirve internet',
    sat: 'Los satélites que llevan datos, en tiempo real',
  };
  const NOMBRE_CAPA = { sub: 'Cables submarinos', fibra: 'Cables terrestres', puntos: 'Centros de datos', sat: 'Satélites' };
  let fichaCapa = null, fichaCapaDe = null, fichaCapaT = 0;
  function datosFichaCapa(k) {
    const f = { titulo: T(NOMBRE_CAPA[k]), frase: T(FRASE_CAPA[k]) + '.', cifra: '', unidad: '', filas: [], pie: T('Datos verificados'), encendida: !!estado[k] };
    if (k === 'sub') {
      const c = capas.sub;
      if (c && c.d) { f.cifra = num(cuentaCables(() => true) || c.nombres); f.unidad = T('cables submarinos con nombre'); }
      const R = { gigante: '> 100', grande: '20–100', regional: '< 20', sinDato: '' };
      f.leyenda = [T('Capacidad'), 'Tbit/s'];
      for (const q of PRINCIPALES.sub) f.filas.push({ col: SUB_COL[q], n: T(TEXTOS_CLASES.sub.clases[q][0]), v: R[q] });
      f.pie += ' · ' + T('puede faltar alguno');
    } else if (k === 'fibra') {
      if (FT && FT.d && FT.d.medida) { f.cifra = num(FT.d.medida.km) + ' km'; f.unidad = T('de fibra troncal por tierra en') + ' ' + num(FT.d.medida.paises.length) + ' ' + T('países'); }
      const R = { principal: '≥ ' + num(800), largo: num(400) + '–' + num(800), nacional: num(150) + '–' + num(400), regional: '< ' + num(150) };
      const C = { principal: 3, largo: 2, nacional: 1, regional: 0 };
      f.leyenda = [T('Longitud'), 'km'];
      for (const q of PRINCIPALES.fibra) f.filas.push({ col: FIBRA_COL[C[q]], n: T(TEXTOS_CLASES.fibra.clases[q][0]), v: R[q] });
      f.pie += ' · ' + T('trazados aproximados de redes reales');
    } else if (k === 'puntos') {
      const m = PT && PT.d && PT.d.medida;
      if (m) { f.cifra = num(m.datos); f.unidad = T('centros de datos'); }
      f.leyenda = [T('Puntos de red'), ''];
      for (const q of ['datos', 'pequenos', 'intercambio', 'estaciones']) { const n = PT && PT.p ? cuentaClase('puntos', q) : 0; f.filas.push({ col: q === 'datos' || q === 'pequenos' ? AZUL_CENTRO : ACERO, punto: true, n: T(TEXTOS_CLASES.puntos.clases[q][0]), v: n ? num(n) : '' }); }
      f.pie += ' · ' + T('cobertura parcial');
    } else if (k === 'sat') {
      if (S && S.N) { f.cifra = num(S.N); f.unidad = T('satélites de datos'); }
      const R = { geo: num(35786), media: num(2000) + '–' + num(30000), baja: '< ' + num(2000) };
      const N = { geo: 'Órbita geoestacionaria', media: 'Órbita media', baja: 'Órbita baja' };
      f.leyenda = [T('Altura'), 'km'];
      for (const q of ['geo', 'media', 'baja']) f.filas.push({ col: ACERO, punto: true, n: T(N[q]), v: R[q] });
      const fecha = S && S.d ? ((S.d.grupos || []).filter((g) => g.n && g.descargado).map((g) => g.descargado).sort()[0] || S.d.descargado) : null;
      f.pie += (fecha ? ', ' + haceTxt(hace(fecha)) : '') + ' · ' + T('posición calculada ahora');
    }
    return f;
  }
  function llenaFichaCapa(k) {
    if (!fichaCapa) { fichaCapa = document.createElement('div'); fichaCapa.id = 'capa-ficha'; fichaCapa.className = 'capa-ficha'; fichaCapa.setAttribute('role', 'tooltip'); fichaCapa.hidden = true; document.body.appendChild(fichaCapa); }
    const f = datosFichaCapa(k), el = fichaCapa;
    const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    el.dataset.capa = k; el.replaceChildren();
    const cab = mk('div', 'cf-cab'); cab.append(mk('span', 'cf-estado' + (f.encendida ? ' on' : '')), mk('span', 'cf-tit', f.titulo)); el.append(cab);
    // with its figure, the figure says what it is; before the layer has loaded, what it is, in large type (the four
    // cards keep the same height either way)
    if (f.cifra) { const ci = mk('div', 'cf-cifra'); ci.append(mk('b', null, f.cifra), mk('span', null, f.unidad)); el.append(ci); }
    else el.append(mk('p', 'cf-frase grande', f.frase));
    const ul = mk('ul', 'cf-filas');
    if (f.leyenda) { const li = mk('li', 'cf-ley'); li.append(mk('s'), mk('span', null, f.leyenda[0]), mk('em', null, f.leyenda[1])); ul.append(li); }
    for (const r of f.filas) { const li = mk('li'), s = mk('s', r.punto ? 'punto' : ''); s.style.setProperty('--c', r.col); li.append(s, mk('span', null, r.n), mk('em', null, r.v || '')); ul.append(li); }
    el.append(ul);
    // (no «click here» line: the button's own switch says whether the layer is on; the dot in the corner repeats it)
    // 25 Oct 2026, 21:25 (owner): no footer («Datos verificados · puede faltar alguno…») on the four layer cards
  }
  function colocaFichaCapa(b) {
    const el = fichaCapa, r = b.getBoundingClientRect(), W = el.offsetWidth, H = el.offsetHeight, M = 12;
    const x = Math.max(M, Math.min(innerWidth - W - M, r.left + r.width / 2 - W / 2));
    let y = r.bottom + 12, arriba = false;
    if (y + H > innerHeight - M && r.top - 12 - H >= M) { y = r.top - 12 - H; arriba = true; }
    el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px';
    el.style.setProperty('--flecha', Math.round(Math.max(18, Math.min(W - 18, r.left + r.width / 2 - x))) + 'px');
    el.classList.toggle('arriba', arriba);
  }
  const conRaton = matchMedia('(hover: hover) and (pointer: fine)');
  function abreFichaCapa(b) {
    clearTimeout(fichaCapaT);
    if (!conRaton.matches || document.body.classList.contains('m2') || document.body.classList.contains('dentro')) return;
    // the class panels below the buttons step aside while the card is open, so the two never overlap (owner,
    // 24 Oct 2026, 12:34: «se me solapa una pantalla con la otra»); orbita.css, body.con-ficha-capa
    document.body.classList.add('con-ficha-capa');
    llenaFichaCapa(b.dataset.capa); fichaCapa.hidden = false; colocaFichaCapa(b);
    if (fichaCapaDe && fichaCapaDe !== b) fichaCapaDe.removeAttribute('aria-describedby');
    fichaCapaDe = b; b.setAttribute('aria-describedby', 'capa-ficha');
    requestAnimationFrame(() => { if (fichaCapaDe === b) fichaCapa.classList.add('ver'); });
  }
  function cierraFichaCapa(ya) {
    clearTimeout(fichaCapaT);
    const fin = () => { document.body.classList.remove('con-ficha-capa'); if (!fichaCapa) return; fichaCapa.classList.remove('ver'); fichaCapa.hidden = true; if (fichaCapaDe) fichaCapaDe.removeAttribute('aria-describedby'); fichaCapaDe = null; };
    if (ya) fin(); else fichaCapaT = setTimeout(fin, 90);
  }
  // the figures arrive when a layer finishes loading: an open card follows them
  function refrescaFichaCapa() { if (fichaCapa && fichaCapaDe && !fichaCapa.hidden) { llenaFichaCapa(fichaCapaDe.dataset.capa); colocaFichaCapa(fichaCapaDe); fichaCapa.classList.add('ver'); } }
  function enganchaFichasCapa() {
    document.querySelectorAll('#capas [data-capa]').forEach((b) => {
      b.removeAttribute('title');
      let espera = 0;
      b.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(espera); espera = setTimeout(() => abreFichaCapa(b), fichaCapaDe ? 0 : 220); });
      b.addEventListener('pointerleave', () => { clearTimeout(espera); cierraFichaCapa(); });
      b.addEventListener('focus', () => { try { if (b.matches(':focus-visible')) abreFichaCapa(b); } catch (_) {} });
      b.addEventListener('blur', () => cierraFichaCapa(true));
      b.addEventListener('click', () => { clearTimeout(espera); cierraFichaCapa(true); });
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') cierraFichaCapa(true); });
    addEventListener('resize', () => cierraFichaCapa(true));
    addEventListener('guardiana-idioma', refrescaFichaCapa);
  }

  async function arranca() {
    pideFotos(); // small (a few dozen entries): ready before the first card opens
    // the land layer only appears when there is land data to show
    // (asked to the small index, so the page never requests a file that is not there)
    let ind = null; try { const r = await fetch('datos/indice.json', { cache: 'no-cache' }); if (r.ok) ind = await r.json(); } catch (_) {}
    for (const k of ['puntos']) if (!ind || !ind.capas || !ind.capas[k]) { const b = document.querySelector(`#capas [data-capa="${k}"]`); if (b) b.remove(); estado[k] = false; }
    estado.tierra = false; // land fibre left out (owner, 21 Oct 2026): OpenStreetMap knows too little of it
    enganchaVista(); enganchaClases(); enganchaFichasCapa();
    document.querySelectorAll('#capas [data-capa]').forEach((b) => b.addEventListener('click', () => pon(b.dataset.capa, b.getAttribute('aria-pressed') !== 'true')));
    for (const k of ['sub', 'fibra', 'puntos', 'sat']) if (estado[k]) pon(k, true);
    for (const k of Object.keys(PLEGADO)) PLEGADO[k] = true; estado.satPlegado = estado.satPlegado || false; pintaClases(); // on arrival no class card covers the planet: they open from the buttons
    pintaNota();
    addEventListener('guardiana-idioma', pintaNota);
  }
  let soloTu = false, soloTuPinta = null;
  function ponSoloTu(on, dibuja) { soloTu = !!on; soloTuPinta = on ? dibuja || null : null; document.body.classList.toggle('solo-tu', soloTu); if (soloTu) { cierraLista(); muestra(-1); centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = fibraMarcada = -1; } pintaNota(); pintaVista(); }
  window.OrbitaCapas = { abreFicha: (m, x, y) => abrePanel(m, x, y), pinta, pon, soloTu: ponSoloTu, get enSoloTu() { return soloTu; }, get cajasPaises() { return LLEG_CAJAS.length || EST_CAJAS.length ? PAIS_CAJAS.concat(LLEG_CAJAS, EST_CAJAS) : PAIS_CAJAS; }, /* and the bases' and stations' names */ /* and the names of the towns where cables land */ get nombresLlegadas() { return CIU_NOMBRES.length ? LLEG_NOMBRES.concat(CIU_NOMBRES) : LLEG_NOMBRES; }, /* the country names' boxes, so the cities (ciudades.js) never land on them */ get estado() { return { ...estado }; }, get satelites() { return S && S.N ? S.N : 0; }, get lugares() { return LUG; }, get fibra() { return FT; },
    // the map's network as lines of unit vectors, for the routes that travel along it (red.js)
    get red() { return { sub: capas.sub && capas.sub.lineas, tierra: capas.tierra && capas.tierra.lineas, fibra: FT && FT.lineas }; },
    // the submarine pieces joined at load time and the ends left fading out into the sea (uneCables), for the automated checks
    get uniones() { return UNION ? { juntas: UNION.juntas, cerradas: UNION.cerradas, conNombre: UNION.conNombre, sueltos: UNION.sueltos, nombres: [...UNION.prestados].map(([g, ps]) => [LUG.grupos[g] ? LUG.grupos[g][0] : g, ps]) } : null; },
    // loads the whole network (whether or not its layers are shown) and resolves when it is there
    cargaRed() {
      cargaCables('sub'); cargaFibra(); // the land-cable layer has no file yet (indice.json), so it is not asked for
      const listo = () => capas.sub && FT;
      return new Promise((ok) => { const mira = () => listo() ? ok(this.red) : setTimeout(mira, 120); mira(); });
    } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();
