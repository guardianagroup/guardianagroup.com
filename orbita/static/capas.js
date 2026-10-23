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
  // are drawn in a light blue of the same family, with a soft blue halo, never white; and what the pointer touches
  // lights up in its own colour (brighter and wider), never white either («se resalta en blanco: eso no puede ser»)
  const CLARO = '206,226,243';
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
    fibra: { principal: true, largo: true, nacional: true, regional: true, obra: true },
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
    } catch (e) { capas[clave] = { error: true }; }
    cargando[clave] = false; pintaNota();
  }

  // 22 Oct 2026 (owner): «que le salga la ciudad donde está el cable… y en los centros de datos también; si en una
  // ciudad hay varios centros de datos, que se vea claro». One small file: the city of each group of data centres and
  // the nearest city to both ends of every cable (OpenStreetMap + GeoNames). A name only when a real city is close.
  let LUG = null, cargaLug = null;
  const lugares = () => cargaLug || (cargaLug = cargaJSON('datos/lugares-capas.json').then((d) => {
    LUG = { d, centros: d.centros.map((c) => ({ w: P().vec(c[0], c[1]).map((x) => x * 1.002), ciudad: c[2], cc: c[3], n: c[4], ops: c[5] })), de: d.de || [], cables: d.cables, grupos: d.grupos || [], g: d.g || [],
      // only the ends that reach a real place: an end in the open sea is a joint between segments, not a landing
      llegadas: (d.llegadas || []).filter((l) => l[2]).map((l) => ({ w: P().vec(l[0], l[1]).map((x) => x * 1.003), ciudad: l[2], cc: l[3], seg: l[4] })) };
    LUG.orden = LUG.centros.map((_, i) => i).sort((a, b) => LUG.centros[b].n - LUG.centros[a].n); // the biggest cities get their label first
    return LUG;
  }).catch(() => { LUG = { error: true }; return LUG; }));
  const paisNombre = (cc) => { if (!cc) return ''; try { const l = (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es'; return new Intl.DisplayNames([l], { type: 'region' }).of(cc) || cc; } catch (_) { return cc; } };

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
  const capacidadDe = (i) => { if (!CAP || !LUG || !LUG.g) return null; const gi = LUG.g[i]; if (gi == null || gi < 0) return null; const g = LUG.grupos[gi]; return g ? CAP.cables[g[0]] || null : null; };
  const potencia = (i) => { const c = capacidadDe(i); if (!c) return 0; return c.tbps >= CAP.umbrales.gigante ? 2 : c.tbps >= CAP.umbrales.grande ? 1 : 0; };
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  async function cargaNotas() { if (NOTAS || cargando.notas) return; cargando.notas = true; try { const n = await cargaJSON('datos/cables-notas.json'); NOTAS = (n.cables || []).map((q) => ({ ...q, clave: norm(q.clave) })); } catch (_) { NOTAS = []; } cargando.notas = false; }
  async function cargaEstaciones() {
    if (EST || cargando.est) return; cargando.est = true;
    try { const e2 = await cargaJSON('datos/puntos-extra.json'); EST = []; for (const f of (e2.puntos || [])) { if (f.tipo !== 'estacion' || !Number.isFinite(f.lon) || !Number.isFinite(f.lat)) continue; EST.push({ w: P().vec(f.lon, f.lat).map((x) => x * 1.002), t: f.tipo, n: f.nombre || '', o: f.operador || '', x: { nota: f.nota || '', enlace: f.enlace || '', clase: f.clase || '', programa: f.programa || '', desde: f.desde || '', gente: f.gente || '', telemetria: f.telemetria || '', antenas: f.antenas || '', cambios: f.cambios || '', local: f.local || '', fuente: f.fuente || '' }, lon: f.lon, lat: f.lat, extra: true }); } } catch (_) { EST = []; }
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
      try { const e2 = await cargaJSON('datos/puntos-extra.json'); for (const f of (e2.puntos || [])) { if (!Number.isFinite(f.lon) || !Number.isFinite(f.lat)) continue; const q = { w: P().vec(f.lon, f.lat).map((x) => x * 1.002), t: f.tipo, n: f.nombre || '', o: f.operador || '', x: (f.nota || f.enlace || f.clase) ? { nota: f.nota || '', enlace: f.enlace || '', clase: f.clase || '', programa: f.programa || '', desde: f.desde || '', gente: f.gente || '', telemetria: f.telemetria || '', antenas: f.antenas || '' } : null, lon: f.lon, lat: f.lat, extra: true }; if (f.tipo === 'datos') PT.p.push(q); else if (f.tipo === 'intercambio') PT.ix.push(q); } } catch (_) {}
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
    return pos;
  }
  function pintaPuntos(cx, p, G) {
    const forma = { aterrizaje: 0, datos: 1, intercambio: 2 }, z = G.R / (G.R0 || G.R), L = esLimpio();
    ABANICO = posiciones(p, G); abanicoFrame = performance.now();
    // the spokes of the fans, under the marks
    if (z >= 60) { cx.save(); cx.globalCompositeOperation = 'source-over'; cx.strokeStyle = `rgba(${L ? BLANCO : ACERO},.35)`; cx.lineWidth = 0.8; cx.beginPath(); for (const [, q] of ABANICO) { if (q[2] || q[3]) { cx.moveTo(q[2], q[3]); cx.lineTo(q[0], q[1]); } } cx.stroke(); cx.restore(); }
    const sd = Math.max(1.5, Math.min(4, 1 + z * 0.22)); // data-centre squares grow a little with the zoom (owner: «que se separen bien»)
    const anillo = Math.max(0, Math.min(1, (z - 1.5) / 1.5)), anillos = [], F = CAMPO || campo(p, G), fd = F.d, fc = F.cosP;
    for (let k = 0; k < 3; k++) {
      cx.beginPath();
      for (let qi = 0; qi < PT.p.length; qi++) {
        const q = PT.p[qi]; if (forma[q.t] !== k || !vePunto(q)) continue;
        let x, y; const ab = k ? ABANICO.get(qi) : null;
        if (ab) { x = ab[0]; y = ab[1]; } else { if (k) continue; const w = q.w; if (!F.todo && w[0] * fd[0] + w[1] * fd[1] + w[2] * fd[2] < fc) continue; const v = p.aVista(w); if (v[2] <= 0.02) continue; x = G.CX + G.R * v[0]; y = G.CY - G.R * v[1]; }
        if (k === 0) { cx.moveTo(x, y - 2.6); cx.lineTo(x + 2.6, y); cx.lineTo(x, y + 2.6); cx.lineTo(x - 2.6, y); cx.closePath(); }
        else if (k === 1) { cx.rect(x - sd, y - sd, 2 * sd, 2 * sd); if (anillo) anillos.push(x, y); }
        else { cx.moveTo(x + 2.8, y); cx.arc(x, y, 2.8, 0, 7); }
      }
      if (k === 2) { cx.strokeStyle = `rgba(${BLANCO},.85)`; cx.lineWidth = 1; cx.stroke(); }
      else { cx.fillStyle = k === 0 ? `rgba(${BLANCO},.9)` : L ? `rgba(${BLANCO},.92)` : `rgba(${ACERO},.75)`; cx.fill(); }
      // 22 Oct 2026, 14:03 (owner): «alrededor un circulito, sutil, para que se identifique mejor» — a faint ring
      // around each data-centre square once the zoom separates them (it fades in between ×1.5 and ×3)
      if (k === 1 && anillo) {
        const ra = sd * 2.3; cx.beginPath();
        for (let i = 0; i < anillos.length; i += 2) { cx.moveTo(anillos[i] + ra, anillos[i + 1]); cx.arc(anillos[i], anillos[i + 1], ra, 0, 7); }
        cx.strokeStyle = `rgba(${L ? BLANCO : ACERO},${(0.34 * anillo).toFixed(2)})`; cx.lineWidth = 0.9; cx.stroke();
      }
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
      for (const q of [w[0], w[w.length - 1]]) {
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
    cx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < LUG.llegadas.length; i++) {
      if (i !== llegadaMarcada && !veLlegada(LUG.llegadas[i])) continue;
      const v = p.aVista(LUG.llegadas[i].w); if (v[2] <= 0.05) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], on = i === llegadaMarcada;
      cx.fillStyle = on ? `rgba(${BLANCO},1)` : `rgba(${BLANCO},.8)`;
      cx.beginPath(); cx.arc(x, y, on ? 3.2 : 1.8, 0, 7); cx.fill();
      if (on) { cx.strokeStyle = `rgba(${BLANCO},.9)`; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y, 7, 0, 7); cx.stroke(); }
      else if (ka > 0) { cx.strokeStyle = `rgba(${BLANCO},${(0.5 * ka).toFixed(2)})`; cx.lineWidth = 0.9; cx.beginPath(); cx.arc(x, y, 4.5 + Math.min(2.5, (zl - 4) / 40), 0, 7); cx.stroke(); }
      if (EXTREMOS_VISTOS) EXTREMOS_VISTOS.add(Math.round(x / 2) + ':' + Math.round(y / 2));
    }
    cx.globalCompositeOperation = 'lighter';
  }
  // Cities with several data centres: a fine ring that grows with the count, and the number beside the big ones
  // when the planet is close enough to read it.
  const radioCiudad = (n, z) => (2.5 + 1.25 * Math.sqrt(n)) * Math.min(1.5, Math.max(1, z * 0.75));
  // Polar bases and satellite ground stations (datos/puntos-extra.json, tipo «estacion»; owner, 22 Oct 2026: «polo
  // norte, polo sur, Antártida, todo»): a ring with a dot, and the name when there is room
  function pintaEstaciones(cx, p, G) {
    if (!CLASES.puntos.estaciones) return;
    if (!EST || !EST.length) return;
    const z = G.R / (G.R0 || G.R), L = esLimpio();
    cx.lineWidth = 1.1; cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle';
    const ocupado = [];
    for (const q of EST) {
      const v = p.aVista(q.w); if (v[2] <= 0.05) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1];
      cx.strokeStyle = `rgba(${BLANCO},${L ? 0.9 : 0.75})`; cx.beginPath(); cx.arc(x, y, 4.2, 0, 7); cx.stroke();
      cx.fillStyle = `rgba(${BLANCO},.95)`; cx.beginPath(); cx.arc(x, y, 1.4, 0, 7); cx.fill();
      if (z >= 1.8 && q.n) { const txt = q.n.split(' (')[0].split(' / ')[0], w = 6.2 * txt.length; if (!ocupado.some((o) => Math.abs(x - o[0]) < (w + o[2]) / 2 + 12 && Math.abs(y - o[1]) < 13)) { ocupado.push([x + 8 + w / 2, y, w]); cx.fillStyle = `rgba(${BLANCO},.85)`; cx.fillText(txt, x + 8, y); } }
    }
  }
  function pintaCiudades(cx, p, G) {
    if (!LUG || !LUG.centros) return;
    const z = G.R / (G.R0 || G.R);
    cx.lineWidth = 1;
    cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle';
    const ocupado = []; // labels never sit on top of each other
    for (const i of LUG.orden) {
      const c = LUG.centros[i]; if (c.n < 5) break;
      const v = p.aVista(c.w); if (v[2] <= 0.05) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], r = radioCiudad(c.n, z), on = i === centroMarcado;
      cx.strokeStyle = on ? `rgba(${BLANCO},.95)` : `rgba(${ACERO},${c.n >= 10 ? 0.7 : 0.45})`;
      cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.stroke();
      // owner, 22 Oct 2026: «en el mapa no me sale la ciudad»: the city's name by its ring as the zoom grows
      // (the biggest first; closer in, every city with data centres), never one label over another
      const conNombre = c.ciudad && v[2] > 0.3 && (z >= 4.5 || (z >= 3 && c.n >= 3) || (z >= 2 && c.n >= 10) || (z >= 1.8 && c.n >= 15));
      if (conNombre) { const txt = c.ciudad + (c.n > 1 ? ' · ' + num(c.n) : ''), tx = x + r + 5, w = 6.3 * txt.length; if (!ocupado.some((o) => tx < o[0] + o[2] + 6 && tx + w + 6 > o[0] && Math.abs(y - o[1]) < 13)) { ocupado.push([tx, y, w]); cx.font = '500 10.5px "Hanken Grotesk", system-ui, sans-serif'; cx.fillStyle = 'rgba(6,8,12,.55)'; cx.fillText(txt, tx + 1, y + 1); cx.fillStyle = on ? `rgba(${BLANCO},1)` : `rgba(${BLANCO},.82)`; cx.fillText(txt, tx, y); } }
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
    if (FT.corr) return;
    FT.corr = new Map(); // corridor → the companies that run a line along it (one company drawing it twice counts once)
    for (const l of FT.lineas) { l.corr = claveCorredor(l); if (!FT.corr.has(l.corr)) FT.corr.set(l.corr, new Set()); FT.corr.get(l.corr).add(l.x.o || l.x.n || ''); }
    for (const l of FT.lineas) { const km = l.x.km || 0, c = FT.corr.get(l.corr).size || 1; l.nivel = km >= 800 || (c >= 4 && km >= 250) ? 3 : km >= 400 || (c >= 3 && km >= 150) ? 2 : km >= 150 ? 1 : 0; }
  }
  const aparece = (v) => Math.min(1, Math.max(0, v));
  // how much of a level shows at this zoom: 0 hidden, 1 fully there
  const fundidoNivel = (n, z) => n === 3 ? 1 : n === 2 ? aparece((z - 1.5) / 0.6) : n === 1 ? aparece((z - 2.6) / 1.0) : aparece((z - 6) / 2);
  function fibraVisible(z) {
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
      const alfa = (obra ? 0.5 : nivel === 3 ? 0.85 + 0.12 * kq : nivel === 2 ? 0.74 + 0.12 * kq : nivel === 1 ? 0.66 : 0.48) * fz * fn;
      cx.strokeStyle = nivel >= 2 && !obra ? `rgba(${ACERO},${(alfa * (nivel === 3 ? 1 : 0.9)).toFixed(2)})` : `rgba(${ACERO},${alfa.toFixed(2)})`;
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
    if (z >= 4) { pintaExtremos(cx, p, G, lineas, z, ACERO); cx.globalCompositeOperation = 'lighter'; }
    if (fibraMarcada >= 0) {
      const l = FT.lineas[fibraMarcada]; resalta(cx, p, G, [l], l.nivel >= 2 ? CLARO : ACERO);
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
  const esLimpio = () => document.body.classList.contains('limpio');
  async function cargaFronteras() {
    if (FR || cargando.fronteras) return; cargando.fronteras = true;
    try {
      const d = await cargaJSON('datos/fronteras.json');
      const vec = (l) => ({ w: l.map(([lon, lat]) => P().vec(lon, lat).map((c) => c * 1.0015)) });
      FR = { paises: d.paises.map(vec), regiones: d.regiones.map(vec), nombres: d.nombres.map((n) => ({ w: P().vec(n[0], n[1]).map((c) => c * 1.0015), n: n[2], cc: n[3], r: n[4] || 9 })) };
    } catch (e) { FR = { error: true }; }
    cargando.fronteras = false;
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
        for (const q of FR.nombres) {
          if (q.r > (L ? (z >= 14 ? 6 : 3) : z >= 7 ? 9 : z >= 5.5 ? 6 : 3)) continue;
          const v = p.aVista(q.w); if (v[2] <= 0.4) continue;
          const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1]; if (x < -40 || x > G.W + 40 || y < -20 || y > G.H + 20) continue;
          const txt = q.n.toUpperCase(), w = 6.2 * txt.length;
          if (ocupado.some((o) => Math.abs(x - o[0]) < (w + o[2]) / 2 + 10 && Math.abs(y - o[1]) < 14)) continue;
          ocupado.push([x, y, w]);
          cx.fillStyle = `rgba(${BLANCO},${Math.min(0.5, 0.2 + 0.05 * z)})`; cx.fillText(txt, x, y);
        }
        cx.textAlign = 'start';
      }
    }
    cx.restore();
  }

  // ---------- countries: a name at each centroid once the borders show, and a card on hover (owner, 22 Oct 2026, 14:35) ----------
  let PAIS_CAJAS = [], PAISES = null;
  async function cargaPaises() { if (PAISES || cargando.paises) return; cargando.paises = true; try { PAISES = (await cargaJSON('datos/paises.json')).paises || {}; } catch (_) { PAISES = {}; } cargando.paises = false; }
  function pintaPaises(cx, p, G) {
    PAIS_CAJAS = [];
    const z = G.R / (G.R0 || G.R); if (z < 2.2 || z > 400 || !p.centros) return;
    const L = esLimpio(), ocupado = [];
    if (!L) return; // 22 Oct 2026, 21:54 (owner): no country names while the planet is in colour; they come with the grey, «limpio» planet
    cx.save(); cx.globalCompositeOperation = 'source-over';
    cx.font = '600 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    const al = Math.min(0.62, 0.22 + 0.08 * z);
    for (const cc of Object.keys(p.centros)) {
      const c = p.centros[cc], v = p.aVista(p.vec(c.lon, c.lat)); if (v[2] <= 0.3) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1]; if (x < -60 || x > G.W + 60 || y < -20 || y > G.H + 20) continue;
      const txt = paisNombre(cc).toUpperCase(), w = 6.6 * txt.length + 6;
      const choca = (yy) => ocupado.some((o) => Math.abs(x - o[0]) < (w + o[2]) / 2 + 3 && Math.abs(yy - o[1]) < 14);
      let yy = y; if (choca(yy)) { yy = y + 14; if (choca(yy)) { yy = y - 14; if (choca(yy)) continue; } } // a small nudge before giving up (Chequia next to Alemania)
      ocupado.push([x, yy, w]);
      cx.fillStyle = `rgba(${L ? BLANCO : ACERO},${al * (cc === paisMarcado ? 1.5 : 1)})`; cx.fillText(txt, x, yy);
      PAIS_CAJAS.push([x - w / 2, yy - 8, w, 16, cc]);
    }
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
    const cx = p.ctx, G = p.geo; EXTREMOS_VISTOS = null; CAMPO = campo(p, G);
    pintaFronteras(cx, p, G); if (soloTu && document.body.classList.contains('viaje')) PAIS_CAJAS = []; else pintaPaises(cx, p, G); // the journey wants a clean planet
    // «Mi conexión» (owner, 22 Oct 2026): while the visitor looks at their own data the planet shows only that —
    // no cables, no satellites, nothing that is not theirs — so there is no doubt about what is whose.
    if (soloTu) { cx.globalCompositeOperation = 'lighter'; if (typeof soloTuPinta === 'function') soloTuPinta(cx, p, G, t); return; }
    cx.globalCompositeOperation = 'lighter';
    if (estado.tierra && capas.tierra && capas.tierra.lineas) pintaLineas(cx, p, G, capas.tierra.lineas, `rgba(${ACERO},.30)`, 0.7);
    if (estado.fibra && FT && FT.lineas) { pintaFibra(cx, p, G); pintaLuz(cx, p, G, fibraVisible(G.R / (G.R0 || G.R)), t); }
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
      if (CS.regional) pintaLineas(cx, p, G, P3.ex[0], `rgba(${ACERO},.55)`, 0.9);
      if (CS.sinDato) pintaLineas(cx, p, G, P3.ex[3], `rgba(${ACERO},.55)`, 0.9);
      if (CS.grande && P3.ex[1].length) pintaLineas(cx, p, G, P3.ex[1], `rgba(${ACERO},${(0.62 + 0.2 * kq).toFixed(2)})`, 1 + 0.3 * kq);
      // the layer is painted additively (overlapping lines glow), which turns any bright core white: the giants' core is
      // painted normally, so it stays the accent blue, and only its halo adds up with the rest
      if (CS.gigante && P3.ex[2].length) { pintaLineas(cx, p, G, P3.ex[2], `rgba(${CLARO},${((L3 ? 0.2 : 0.14) + 0.12 * kq).toFixed(3)})`, 3.5 + 3 * kq); opaco(cx, () => pintaLineas(cx, p, G, P3.ex[2], `rgba(${ACERO},${(0.92 + 0.08 * kq).toFixed(2)})`, 1.3 + 0.7 * kq)); }
      // 23 Oct 2026, 08:16 (owner): «una línea fina discontinua… que va y viene, así la pantalla está viva». The planned
      // cables (short dashes) and the approximate routes (longer ones) breathe: their dashes slide gently back and forth.
      const vaiven = (fase) => 9 * Math.sin((t || 0) / 1100 + fase);
      if (CS.previstos && PREV && PREV.length) { cx.save(); cx.setLineDash([4, 5]); cx.lineDashOffset = vaiven(0); pintaLineas(cx, p, G, PREV, `rgba(${CLARO},.6)`, 1.1); cx.restore(); }
      if (CS.aprox && capas.sub.aprox.length) {
        cx.setLineDash([7, 5]); cx.lineDashOffset = vaiven(1.7);
        const todas = sinPotencia();
        if (CS.regional || todas) pintaLineas(cx, p, G, P3.ap[0], `rgba(${ACERO},.5)`, 0.9);
        if (CS.sinDato || todas) pintaLineas(cx, p, G, P3.ap[3], `rgba(${ACERO},.5)`, 0.9);
        if ((CS.grande || todas) && P3.ap[1].length) pintaLineas(cx, p, G, P3.ap[1], `rgba(${ACERO},${(0.55 + 0.2 * kq).toFixed(2)})`, 1 + 0.3 * kq);
        if ((CS.gigante || todas) && P3.ap[2].length) { pintaLineas(cx, p, G, P3.ap[2], `rgba(${CLARO},${((L3 ? 0.18 : 0.12) + 0.1 * kq).toFixed(3)})`, 3.5 + 3 * kq); opaco(cx, () => pintaLineas(cx, p, G, P3.ap[2], `rgba(${ACERO},${(0.85 + 0.12 * kq).toFixed(2)})`, 1.3 + 0.7 * kq)); }
        cx.setLineDash([]); cx.lineDashOffset = 0;
      }
      pintaLuz(cx, p, G, subVisibles(), t);
    }
    if (estado.puntos && PT && PT.p) { cx.globalCompositeOperation = 'source-over'; pintaPuntos(cx, p, G); pintaEstaciones(cx, p, G); pintaCiudades(cx, p, G); cx.globalCompositeOperation = 'lighter'; if (puntoMarcado >= 0) pintaRuta(cx, p, G, t); }
    else if (estado.sub && EST) { cx.globalCompositeOperation = 'source-over'; pintaEstaciones(cx, p, G); cx.globalCompositeOperation = 'lighter'; } // 22 Oct 2026, 14:15 (owner): the polar stations show with the cables too
    if (estado.sub && capas.sub && capas.sub.lineas) {
      if (cableMarcado >= 0) { const l = capas.sub.lineas[cableMarcado]; if (l) resalta(cx, p, G, [l], ACERO); }
      if (previstoMarcado >= 0 && PREV && PREV[previstoMarcado]) { cx.save(); cx.setLineDash([3, 5]); resalta(cx, p, G, [PREV[previstoMarcado]], ACERO); cx.restore(); } // the planned cable under the pointer lights up like the real ones (owner, 22 Oct 2026, 17:57)
      if (llegadaMarcada >= 0 && LUG && LUG.llegadas) { const ls = LUG.llegadas[llegadaMarcada].seg.map((i) => capas.sub.lineas[i]).filter(Boolean); resalta(cx, p, G, ls, ACERO); }
      pintaLlegadas(cx, p, G);
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
    const cola = [0, 0.012, 0.024], alfa = [0.95, 0.42, 0.16], tam = [1.7, 1.4, 1.1];
    for (let c = 0; c < 3; c++) {
      cx.fillStyle = c ? `rgba(${ACERO},${alfa[c]})` : `rgba(${BLANCO},${alfa[c]})`;
      const h = tam[c] / 2;
      // many short land links (Topology Zoo gives thousands): skip the lights on the lines facing away and keep
      // the pulse count bounded, so the planet stays smooth on a modest computer
      const salto = lineas.length > 2500 ? Math.ceil(lineas.length / 2500) : 1, F = CAMPO || campo(p, G);
      for (let li = c === 0 ? 0 : 0; li < lineas.length; li += salto) {
        const l = lineas[li];
        if (l.L < 0.01) continue;
        if (!F.todo) { capsDe(l); if (!veCap(F, l.cap)) continue; }
        if (l.w && l.w.length && p.aVista(l.w[0])[2] <= 0.02 && p.aVista(l.w[l.w.length - 1])[2] <= 0.02) continue;
        const n = Math.max(1, Math.round(l.L / PASO)), sep = l.L / n;
        for (let dir = 0; dir < 2; dir++) {
          const base = ((t * VLUZ + l.fase * sep + dir * sep / 2) % sep);
          for (let k = 0; k < n; k++) {
            let s = base + k * sep - cola[c];
            if (s < 0) continue;
            if (dir) s = l.L - s;
            const v = p.aVista(puntoEn(l, s));
            if (v[2] <= 0.02) continue;
            cx.fillRect(G.CX + G.R * v[0] - h, G.CY - G.R * v[1] - h, tam[c], tam[c]);
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
  function resalta(cx, p, G, lineas, rgb) { pintaLineas(cx, p, G, lineas, `rgba(${rgb},.22)`, 7); opaco(cx, () => pintaLineas(cx, p, G, lineas, `rgba(${rgb},1)`, 2.3)); }
  // paint something without the additive glow (so a blue stays blue), then go back to how the layer was painting
  function opaco(cx, f) { const g = cx.globalCompositeOperation; cx.globalCompositeOperation = 'source-over'; f(); cx.globalCompositeOperation = g; }
  function pintaLineas(cx, p, G, lineas, color, ancho) {
    const F = CAMPO || campo(p, G);
    cx.strokeStyle = color; cx.lineWidth = ancho; cx.beginPath();
    for (const l of lineas) {
      const w = l.w; if (!w || w.length < 2) continue;
      if (F.todo) { trazoW(cx, p, G, w, 0, w.length - 1); continue; }
      const caps = capsDe(l); if (!veCap(F, l.cap)) continue;
      for (const cp of caps) if (veCap(F, cp)) trazoW(cx, p, G, w, cp.i0, cp.i1);
    }
    cx.stroke();
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
      meter('sub', c && c.d ? num(c.nombres) + ' ' + T('cables submarinos con nombre') + (CAP && Object.keys(CAP.cables).length ? ' · ' + T('trazo claro y grueso con halo: troncales de más de 100 Tbit/s; trazo medio: más de 20 Tbit/s') : '') + ' · ' + T('Datos verificados') + ' · ' + T('puede faltar alguno') + ' · ' + T('la luz viaja en los dos sentidos a la vez, a cámara lenta: cruza el Atlántico en unos 30 ms') : c && c.error ? T('No se pudieron cargar los cables.') : T('Cargando cables…'));
    }
    if (estado.fibra) {
      meter('fibra', FT && FT.d ? num(FT.d.medida.km) + ' km ' + T('de fibra troncal por tierra en') + ' ' + num(FT.d.medida.paises.length) + ' ' + T('países') + ' · ' + T('trazados aproximados de redes reales') + ' · ' + T('por niveles: de lejos solo las troncales principales; las nacionales y las regionales aparecen al acercarse') + ' · ' + T('Datos verificados') : FT && FT.error ? T('No se pudo cargar la fibra por tierra.') : T('Cargando fibra por tierra…'));
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
    // 21 Oct 2026 (owner): no text under the planet; the same facts live in each button's tooltip
    for (const [k, txt] of Object.entries(porCapa)) { const b = document.querySelector(`#capas [data-capa="${k}"]`); if (b) b.title = txt; }
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
    f.style.left = (x + 16 + w > G.W - 8 ? x - 16 - w : x + 16) + 'px'; f.style.top = Math.max(70, Math.min(G.H - h - 12, y - 40)) + 'px';
  }
  let centroMarcado = -1, cableMarcado = -1, llegadaMarcada = -1, puntoMarcado = -1, pendiente = null;
  function buscaEstacion(x, y) {
    if (!(estado.puntos || estado.sub) || !EST || !CLASES.puntos.estaciones) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 8 * 8;
    for (let i = 0; i < EST.length; i++) { const v = p.aVista(EST[i].w); if (v[2] <= 0.05) continue; const dx = G.CX + G.R * v[0] - x, dy = G.CY - G.R * v[1] - y, d2 = dx * dx + dy * dy; if (d2 < dm) { dm = d2; mejor = i; } }
    return mejor;
  }
  function fichaEstacion(i, x, y) {
    const q = EST[i], X = q.x || {}, filas = [];
    if (X.clase) filas.push([T('Tipo'), X.clase === 'base' ? T('Base antártica') : T('Estación terrena de satélites')]);
    if (q.o) filas.push([T('Operador'), /^[A-Z]{2}$/.test(q.o) ? paisNombre(q.o) + (X.programa ? ' · ' + X.programa : '') : q.o]);
    if (X.desde) filas.push([T('Desde'), String(X.desde)]);
    if (X.gente) filas.push([T('Personal'), X.gente]);
    if (X.enlace) filas.push([T('Cómo se conecta'), X.enlace]);
    if (X.telemetria) filas.push([T('Por dónde salen los datos'), X.telemetria]);
    if (X.antenas) filas.push([T('Antenas'), X.antenas]);
    if (X.local) filas.push([T('Enlaces locales'), X.local]);
    if (X.cambios) filas.push([T('Novedades'), X.cambios]);
    if (X.nota) filas.push([T('Datos'), X.nota]);
    const base = X.clase === 'base';
    abreModelo(modelo(base ? T('Base antártica') : T('Estación terrena de satélites'), q.n || T('Estación'), filas, T('Datos verificados'), {
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
    f.style.left = left + 'px'; f.style.top = Math.max(70, Math.min(G.H - h - 12, top)) + 'px';
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
    if (!r.estacion && capas.sub && capas.sub.lineas) { const ls = L.seg.map((k) => capas.sub.lineas[k]).filter(Boolean); pintaLineas(cx, p, G, ls, `rgba(${BLANCO},.9)`, 1.8); pintaLuz(cx, p, G, ls, t); }
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
      const n = new Set(L.seg.map((k) => (LUG.g && LUG.g[k] >= 0 ? 'g' + LUG.g[k] : 's' + k))).size;
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
    p.innerHTML = '<div class="asa" aria-hidden="true"></div><div class="cab"><span class="tipo"></span><span class="botones"><button type="button" class="atras" hidden>‹</button><button type="button" class="cerrar" aria-label="' + T('Cerrar') + '">×</button></span></div><h2 class="tit"></h2><p class="sub"></p><dl class="sat-dl resumen"></dl><div class="secs"></div><div class="acciones"><button type="button" class="copiar">' + T('Copiar ficha') + '</button><button type="button" class="pdf">' + T('Guardar PDF') + '</button></div><p class="pie"></p>';
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
  function encajaPanel() {
    const p = $('ficha-panel'); if (!p || p.hidden || !p.classList.contains('suelto')) return;
    const M = 16, arriba = 74;
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
    p.querySelector('.pie').textContent = m.pie || ''; p.querySelector('.atras').hidden = historial.length < 2;
    p.hidden = false; p.scrollTop = 0; p.classList.remove('alta');
    // On a computer the full card opens where the pointer is, whole, never cut by the edges; if there is no room
    // beside the point it goes to the middle (owner, 22 Oct 2026, 18:07). On a phone it stays a bottom sheet.
    if (Number.isFinite(x) && Number.isFinite(y) && !esTactil() && innerWidth >= 760) {
      p.classList.add('suelto'); p.style.left = '0px'; p.style.top = '0px'; p.style.maxHeight = Math.max(160, innerHeight - 74 - 16) + 'px';
      const w = p.offsetWidth, h = p.offsetHeight, M = 16, arriba = 74;
      let left = x + 18; if (left + w > innerWidth - M) left = x - w - 18; if (left < M) left = Math.max(M, Math.round((innerWidth - w) / 2));
      let top = y - 24; if (top + h > innerHeight - M) top = innerHeight - M - h; if (top < arriba) top = arriba;
      if (posUsuario) { const q = encaja(posUsuario.left, posUsuario.top, w, h); left = q.left; top = q.top; } // where the person put it
      p.style.left = left + 'px'; p.style.top = top + 'px';
    } else { p.classList.remove('suelto'); p.style.left = ''; p.style.top = ''; p.style.maxHeight = ''; }
    const f = ficha(); if (f) f.hidden = true;
    document.body.classList.add('con-ficha');
  }
  function cierraPanel() { const p = $('ficha-panel'); if (p) p.hidden = true; panelModelo = null; historial.length = 0; fichaFija = false; document.body.classList.remove('con-ficha'); }
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
    return { tipo, titulo, sub: plan.sub || '', resumen, secciones, pie };
  }
  // hover → summary card; click → the whole panel
  function abreModelo(m, x, y) {
    if (clicActual) { abrePanel(m, x, y); return; }
    const pista = esTactil() ? T('Toca para la ficha completa') : T('Clic: ficha completa');
    fichaRica(m.titulo + (m.sub ? ' · ' + m.sub : ''), m.resumen, (m.pie ? m.pie + ' · ' : '') + pista, x, y);
  }
  // a card with labels and values in two columns (satellites, data centres)
  function fichaRica(titulo, filas, pie, x, y) {
    const f = ficha(); if (!f) return;
    f.querySelector('b').textContent = titulo;
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
    if (X.nota) filas.push([T('Datos'), X.nota]); // a hand-verified point carries its own note
    const duenos = X.dueno || (W.duenos && W.duenos.join(', '));
    if (duenos && duenos !== q.o) filas.push([T('Dueño'), duenos]);
    const desde = X.desde || W.desde; if (desde) filas.push([T('En servicio desde'), String(desde).slice(0, 4)]);
    if (W.m2) filas.push([T('Superficie'), num(W.m2) + ' m²']);
    if (W.mw) filas.push([T('Potencia'), num(W.mw) + ' MW']);
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
      for (const k of L.seg) { const gi = LUG.g ? LUG.g[k] : -1, nm = gi >= 0 ? LUG.grupos[gi][0] : ''; if (nm && !nombres.includes(nm)) nombres.push(nm); }
      // Owner, 22 Oct 2026: «tiene que ser un idioma comprensible para todos los clientes, fácil y a la vez profesional»
      if (r.lejos) filas.push([T('Desde el mar'), T('De las llegadas de cables de esta zona aún no tenemos datos.')]);
      else if (r.estacion) filas.push([T('Desde el mar'), T('La estación de cables submarinos más cercana es') + ' ' + (r.estacion.n || '') + (r.estacion.o ? ' (' + r.estacion.o + ')' : '') + ', ' + T('a') + ' ' + num(Math.round(r.km)) + ' km ' + T('de este centro de datos') + '.']);
      else filas.push([T('Desde el mar'), r.km < 2 ? T('Los cables submarinos salen del mar aquí mismo, en') + ' ' + L.ciudad + '.' : T('El cable submarino más cercano sale del mar en') + ' ' + L.ciudad + ' (' + paisNombre(L.cc) + '), ' + T('a') + ' ' + num(Math.round(r.km)) + ' km ' + T('de este centro de datos') + '.']);
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
    if (X.nota) filas.push([T('Nota'), X.nota]);
    const titulo = q.n && q.n !== q.o ? q.n : (q.o ? q.o + ' · ' + T('centro de datos') : T('Centro de datos sin nombre'));
    const fuentes = T('Datos verificados');
    const nube = q.o && /amazon|aws|google|microsoft|azure|meta|facebook|apple|oracle|alibaba|cloudflare|ovh|equinix|digital realty|telefónica|telefonica|orange|vodafone|claro|movistar/i.test(q.o);
    abreModelo(modelo(T('Centro de datos'), titulo, filas.length ? filas : [[T('Datos'), T('Sin más datos públicos sobre este edificio')]], fuentes, {
      resumen: [T('Operador'), T('Dónde'), T('En servicio desde'), T('Desde el mar')],
      para: T('Aquí viven servicios de internet: cada vez que abres una web o guardas algo «en la nube», tus datos pasan por sitios como este.') + (nube ? ' ' + T('Si usas servicios de') + ' ' + q.o + ', ' + T('parte de tus datos puede estar guardada en edificios así.') : ''),
      secciones: [{ t: T('Cómo llega internet aquí'), claves: [T('Desde el mar'), T('Cables que llegan ahí'), T('Por tierra'), T('Intercambio de internet')], abierta: true }, { t: T('El edificio'), claves: [T('Operador'), T('Del mismo operador'), T('Dueño'), T('En servicio desde'), T('Superficie'), T('Potencia'), T('Plantas'), T('Altura del edificio'), 'Tier', 'PUE', T('Conexión'), T('Dónde'), T('Web')] }, { t: T('Notas'), claves: [T('Datos'), T('Nota')] }],
    }), x, y);
  }
  function fichaLugar(tipo, i, x, y) {
    const f = ficha(); if (!f) return;
    f.classList.remove('sat');
    if (tipo === 'punto') { fichaCentro(i, x, y); return; } else if (tipo === 'llegada') {
      const l = LUG.llegadas[i], nombres = [], sin = { n: 0 };
      for (const k of l.seg) { const gi = LUG.g ? LUG.g[k] : -1, nm = gi >= 0 ? LUG.grupos[gi][0] : ''; if (nm) { if (!nombres.includes(nm)) nombres.push(nm); } else sin.n++; }
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
      const d = capas.sub.d.cables[i], e = (LUG && LUG.cables && LUG.cables[i]) || ['', '', '', ''];
      // the whole cable when its name is known: every place where one of its pieces reaches land, west to east
      const gi = LUG && LUG.g ? LUG.g[i] : -1, gr = gi >= 0 ? LUG.grupos[gi] : null;
      let lados;
      if (gr) lados = gr[1].map(([c, cc]) => c + ' (' + paisNombre(cc) + ')');
      else { lados = []; if (e[0]) lados.push(e[0] + ' (' + paisNombre(e[1]) + ')'); if (e[2] && (e[2] !== e[0] || e[3] !== e[1])) lados.push(e[2] + ' (' + paisNombre(e[3]) + ')'); }
      const titulo = gr ? gr[0] : (d.n || T('Cable submarino sin nombre'));
      f.querySelector('b').textContent = titulo;
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
      else if (inf.kmMapa) mas.push(T('Longitud en el mapa') + ': ' + num(inf.kmMapa) + ' km');
      if (inf.duenos && inf.duenos.length) mas.push(T('Dueños') + ': ' + inf.duenos.join(', '));
      // owner, 22 Oct 2026: «la distancia punto a punto»: between consecutive landings, west to east, as the crow
      // flies over the sea (the exact route of each stretch is not public), so it is said plainly
      if (gr && gr[1].length >= 2 && gr[1].every((q) => Number.isFinite(q[3]))) {
        const tramos = [];
        for (let k = 1; k < gr[1].length && tramos.length < 6; k++) { const a = gr[1][k - 1], b = gr[1][k]; const d = kmLL([a[2], a[3]], [b[2], b[3]]); if (d >= 20) tramos.push(a[0] + ' → ' + b[0] + ': ' + num(Math.round(d)) + ' km'); }
        if (tramos.length) mas.push(T('De punto a punto, en línea recta') + ': ' + tramos.join(' · ') + (gr[1].length - 1 > 6 ? ' · …' : ''));
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
      f.querySelector('span').textContent = donde + (mas.length ? '\n' + mas.join('\n') : '');
      if (clicActual) {
        for (const m of mas) { const j = m.indexOf(': '); if (j > 0 && j < 40) filas.push([m.slice(0, j), m.slice(j + 2)]); else filas.push(['', m]); }
        const cp = capacidadDe(i), L = P() && P().lugar, miPais = L && P().pais;
        const toca = gr && miPais ? gr[1].find((q) => q[1] === miPais) : null;
        abreModelo(modelo(gr && gr[2] && gr[2].aprox ? T('Cable submarino') + ' · ' + T('trazado aproximado') : T('Cable submarino'), titulo, filas, T('Datos verificados'), {
          sub: lados.length >= 2 ? lados[0].replace(/ \(.*\)$/, '') + ' → ' + lados[lados.length - 1].replace(/ \(.*\)$/, '') : '',
          resumen: [T('Origen'), T('Destino'), T('En servicio desde'), T('Longitud'), T('Capacidad')],
          para: (lados.length >= 2 ? T('Une') + ' ' + lados[0] + ' ' + T('con') + ' ' + lados[lados.length - 1] + ' ' + T('por el fondo del mar.') + ' ' : '') + T('Cuando tus datos cruzan entre esos dos lados —un vídeo, un correo, una copia de seguridad— pueden ir por este cable o por otros paralelos; si uno se corta, el tráfico se reparte por los demás y lo notas como lentitud, no como apagón.') + (toca ? ' ' + T('Llega a tu país por') + ' ' + toca[0] + '.' : '') + (cp && cp.tbps >= 100 ? ' ' + T('Es una de las grandes autopistas: por él cabe el tráfico de decenas de millones de personas a la vez.') : ''),
          secciones: [{ t: T('Recorrido y profundidad'), claves: [T('Paradas'), T('De punto a punto, en línea recta'), T('Profundidad del fondo bajo este tramo'), T('Longitud en el mapa')], abierta: true }, { t: T('Datos'), claves: [T('Dueños'), T('Operador'), T('Capacidad'), T('Longitud'), T('En servicio desde')] }, { t: T('Incidencias y estado'), claves: [T('Incidencias conocidas'), T('Estado')] }],
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
      b.innerHTML = '<b></b><span></span>'; b.querySelector('b').textContent = q.n || q.o || T('Centro de datos sin nombre'); b.querySelector('span').textContent = q.n && q.o && q.o !== q.n ? q.o : '';
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
    if (i >= 0) { centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = -1; muestra(i, x, y); return; }
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
    if (ft >= 0) { if (ft !== fibraMarcada || clic) { fibraMarcada = ft; fichaFibra(ft, x, y); } else colocaFicha(x, y); if (clic) fichaFija = true; return; }
    fibraMarcada = -1;
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
    fibra: { titulo: 'Fibra por tierra', clases: { principal: ['Grandes troncales', 'Rutas de 800 km o más, o compartidas por varias compañías.'], largo: ['Rutas largas', 'De 400 a 800 km, entre regiones.'], nacional: ['Rutas entre ciudades', 'De 150 a 400 km; aparecen al acercarte.'], regional: ['Enlaces cortos', 'Menos de 150 km, dentro de una zona; aparecen muy de cerca.'], obra: ['En construcción', 'Rutas en construcción. Línea discontinua.'] } },
    puntos: { titulo: 'Puntos de red', clases: { datos: ['Grandes operadores', 'Centros de datos de compañías con cinco o más en el mapa.'], pequenos: ['Otros centros de datos', 'De compañías con menos de cinco en el mapa, o sin operador identificado.'], intercambio: ['Puntos de intercambio', 'Donde las redes de distintas compañías se conectan entre sí.'], estaciones: ['Bases y antenas', 'Bases del Ártico y la Antártida, y estaciones terrestres de satélites.'] } },
  };

  const PLEGADO = { sub: true, fibra: true, puntos: true }; // the cards open on the button's click, one at a time; on arrival none is open
  function cuentaClase(k, c) {
    try {
      if (k === 'sub') { if (!capas.sub || !capas.sub.lineas || !CAP) return 0; if (c === 'previstos') return PREV ? PREV.length : 0; if (c === 'aprox') return capas.sub.aprox ? capas.sub.aprox.length : 0; let n = 0; capas.sub.lineas.forEach((l, i) => { if (claseSub(i) === c) n++; }); return n; }
      if (k === 'fibra') { if (!FT || !FT.lineas) return 0; preparaNiveles(); return FT.lineas.filter((l) => claseFibra(l) === c).length; }
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
      for (const c of Object.keys(TEXTOS_CLASES[k].clases)) {
        const [n, d] = TEXTOS_CLASES[k].clases[c];
        const bt = document.createElement('button'); bt.type = 'button'; bt.dataset.clase = c; bt.setAttribute('aria-pressed', String(!!CLASES[k][c]));
        bt.innerHTML = '<i aria-hidden="true"></i><span class="n"></span><span class="d"></span>';
        bt.querySelector('.n').append(T(n), ' ', Object.assign(document.createElement('b'), {})); bt.querySelector('.d').textContent = T(d); bt.title = T(d); // 22 Oct 2026, 22:09 (owner): the card lists classes only; the explanation shows under the pointer
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
  async function arranca() {
    // the land layer only appears when there is land data to show
    // (asked to the small index, so the page never requests a file that is not there)
    let ind = null; try { const r = await fetch('datos/indice.json', { cache: 'no-cache' }); if (r.ok) ind = await r.json(); } catch (_) {}
    for (const k of ['puntos']) if (!ind || !ind.capas || !ind.capas[k]) { const b = document.querySelector(`#capas [data-capa="${k}"]`); if (b) b.remove(); estado[k] = false; }
    estado.tierra = false; // land fibre left out (owner, 21 Oct 2026): OpenStreetMap knows too little of it
    enganchaVista(); enganchaClases();
    document.querySelectorAll('#capas [data-capa]').forEach((b) => b.addEventListener('click', () => pon(b.dataset.capa, b.getAttribute('aria-pressed') !== 'true')));
    for (const k of ['sub', 'fibra', 'puntos', 'sat']) if (estado[k]) pon(k, true);
    for (const k of Object.keys(PLEGADO)) PLEGADO[k] = true; estado.satPlegado = estado.satPlegado || false; pintaClases(); // on arrival no class card covers the planet: they open from the buttons
    pintaNota();
    addEventListener('guardiana-idioma', pintaNota);
  }
  let soloTu = false, soloTuPinta = null;
  function ponSoloTu(on, dibuja) { soloTu = !!on; soloTuPinta = on ? dibuja || null : null; document.body.classList.toggle('solo-tu', soloTu); if (soloTu) { cierraLista(); muestra(-1); centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = fibraMarcada = -1; } pintaNota(); pintaVista(); }
  window.OrbitaCapas = { pinta, pon, soloTu: ponSoloTu, get enSoloTu() { return soloTu; }, get estado() { return { ...estado }; }, get satelites() { return S && S.N ? S.N : 0; }, get lugares() { return LUG; }, get fibra() { return FT; },
    // the map's network as lines of unit vectors, for the routes that travel along it (red.js)
    get red() { return { sub: capas.sub && capas.sub.lineas, tierra: capas.tierra && capas.tierra.lineas, fibra: FT && FT.lineas }; },
    // loads the whole network (whether or not its layers are shown) and resolves when it is there
    cargaRed() {
      cargaCables('sub'); cargaFibra(); // the land-cable layer has no file yet (indice.json), so it is not asked for
      const listo = () => capas.sub && FT;
      return new Promise((ok) => { const mira = () => listo() ? ok(this.red) : setTimeout(mira, 120); mira(); });
    } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();
