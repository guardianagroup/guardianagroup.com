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
  // Owner, 22 Oct 2026: «cuando la persona abra Órbita, que no salgan los satélites de golpe, se ve demasiado ruido:
  // que abra solo con los cables submarinos, y luego la persona va abriendo y cerrando». So every opening starts with
  // the submarine cables alone; only the view and the orbit filter are remembered between visits.
  // Owner, 22 Oct 2026, 10:41: «cuando la persona abre satélites aparecen todos de golpe; tienen que ser por capas,
  // si no se inunda el globo». So the satellites open with the geostationary ring alone (a few hundred, still), and
  // the person adds the medium and the low orbit one by one; each orbit button is a layer of its own.
  const estado = { sub: true, tierra: false, fibra: false, puntos: false, sat: false, vista: 'equilibrada', orb: { baja: false, media: false, geo: true } };
  try { const g = JSON.parse(localStorage.getItem('guardiana-orbita-capas') || '{}'); if (g.vista) estado.vista = g.vista; if (!['equilibrada', 'todos', 'cielo'].includes(estado.vista)) estado.vista = 'equilibrada'; } catch (_) {}
  const guarda = () => { try { localStorage.setItem('guardiana-orbita-capas', JSON.stringify(estado)); } catch (_) {} };

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
      // how many data centres each operator has on the map
      PT.porOp = new Map(); for (const q of PT.p) if (q.o) PT.porOp.set(q.o, (PT.porOp.get(q.o) || 0) + 1);
      lugares();
    } catch (e) { PT = { error: true }; }
    cargando.puntos = false; pintaNota();
  }
  function pintaPuntos(cx, p, G) {
    const forma = { aterrizaje: 0, datos: 1, intercambio: 2 };
    for (let k = 0; k < 3; k++) {
      cx.beginPath();
      for (const q of PT.p) {
        if (forma[q.t] !== k) continue;
        const v = p.aVista(q.w); if (v[2] <= 0.02) continue;
        const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1];
        if (k === 0) { cx.moveTo(x, y - 2.6); cx.lineTo(x + 2.6, y); cx.lineTo(x, y + 2.6); cx.lineTo(x - 2.6, y); cx.closePath(); }
        else if (k === 1) cx.rect(x - 1.5, y - 1.5, 3, 3);
        else { cx.moveTo(x + 2.8, y); cx.arc(x, y, 2.8, 0, 7); }
      }
      if (k === 2) { cx.strokeStyle = `rgba(${BLANCO},.85)`; cx.lineWidth = 1; cx.stroke(); }
      else { cx.fillStyle = k === 0 ? `rgba(${BLANCO},.9)` : `rgba(${ACERO},.75)`; cx.fill(); }
    }
  }

  // Where cables reach land: a small white point, larger under the pointer.
  function pintaLlegadas(cx, p, G) {
    if (!LUG || !LUG.llegadas) return;
    cx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < LUG.llegadas.length; i++) {
      const v = p.aVista(LUG.llegadas[i].w); if (v[2] <= 0.05) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], on = i === llegadaMarcada;
      cx.fillStyle = on ? `rgba(${BLANCO},1)` : `rgba(${BLANCO},.8)`;
      cx.beginPath(); cx.arc(x, y, on ? 3.2 : 1.8, 0, 7); cx.fill();
      if (on) { cx.strokeStyle = `rgba(${BLANCO},.9)`; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y, 7, 0, 7); cx.stroke(); }
    }
    cx.globalCompositeOperation = 'lighter';
  }
  // Cities with several data centres: a fine ring that grows with the count, and the number beside the big ones
  // when the planet is close enough to read it.
  const radioCiudad = (n, z) => (2.5 + 1.25 * Math.sqrt(n)) * Math.min(1.5, Math.max(1, z * 0.75));
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
  function pintaFibra(cx, p, G) {
    const z = G.R / (G.R0 || G.R);
    for (const obra of [false, true]) {
      cx.strokeStyle = `rgba(${ACERO},${obra ? 0.5 : 0.72})`; cx.lineWidth = Math.min(1.8, 0.9 + 0.2 * (z - 1));
      cx.setLineDash(obra ? [3, 3] : []);
      cx.beginPath();
      for (const l of FT.lineas) {
        if (!!l.x.obra !== obra) continue;
        let prev = false;
        for (const w of l.w) {
          const v = p.aVista(w), x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], ve = v[2] > 0.02;
          if (ve && prev) cx.lineTo(x, y); else if (ve) cx.moveTo(x, y);
          prev = ve;
        }
      }
      cx.stroke();
    }
    cx.setLineDash([]);
    if (fibraMarcada >= 0) {
      const l = FT.lineas[fibraMarcada]; cx.strokeStyle = `rgba(${BLANCO},.95)`; cx.lineWidth = 2; cx.beginPath();
      let prev = false;
      for (const w of l.w) { const v = p.aVista(w), x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], ve = v[2] > 0.02; if (ve && prev) cx.lineTo(x, y); else if (ve) cx.moveTo(x, y); prev = ve; }
      cx.stroke();
    }
  }
  let fibraMarcada = -1;
  function buscaFibra(x, y) {
    if (!estado.fibra || !FT || !FT.lineas) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 6 * 6;
    FT.lineas.forEach((l, i) => {
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
    if (l.obra) lin.push(T('En construcción según la fuente'));
    lin.push(T('Trazado aproximado') + ' · ' + T('Datos verificados'));
    f.querySelector('span').textContent = lin.join('\n');
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
  let FR = null;
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
    cx.save(); cx.globalCompositeOperation = 'source-over';
    pintaLineas(cx, p, G, FR.paises, `rgba(${BLANCO},${Math.min(0.28, 0.06 + 0.05 * z)})`, 0.8);
    if (z >= 2.5) {
      pintaLineas(cx, p, G, FR.regiones, `rgba(${BLANCO},${Math.min(0.2, 0.03 + 0.03 * z)})`, 0.6);
      if (z >= 4) {
        const ocupado = []; cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        for (const q of FR.nombres) {
          if (q.r > (z >= 7 ? 9 : z >= 5.5 ? 6 : 3)) continue;
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

  // ---------- drawing ----------
  function pinta(t) {
    const p = P(); if (!p) return;
    const cx = p.ctx, G = p.geo;
    pintaFronteras(cx, p, G);
    // «Mi conexión» (owner, 22 Oct 2026): while the visitor looks at their own data the planet shows only that —
    // no cables, no satellites, nothing that is not theirs — so there is no doubt about what is whose.
    if (soloTu) { cx.globalCompositeOperation = 'lighter'; if (typeof soloTuPinta === 'function') soloTuPinta(cx, p, G, t); return; }
    cx.globalCompositeOperation = 'lighter';
    if (estado.tierra && capas.tierra && capas.tierra.lineas) pintaLineas(cx, p, G, capas.tierra.lineas, `rgba(${ACERO},.30)`, 0.7);
    if (estado.fibra && FT && FT.lineas) { pintaFibra(cx, p, G); pintaLuz(cx, p, G, FT.lineas, t); }
    if (estado.sub && capas.sub && capas.sub.lineas) {
      // OpenStreetMap's cables as drawn; the ones the agency rebuilt from public sources (cables_agencia.py) are
      // an approximate sea trace, so they go dashed and a touch lighter (owner: «rotulado trazado aproximado»)
      if (!capas.sub.exactas) { capas.sub.exactas = capas.sub.lineas.filter((l) => !l.aprox); capas.sub.aprox = capas.sub.lineas.filter((l) => l.aprox); }
      pintaLineas(cx, p, G, capas.sub.exactas, `rgba(${ACERO},.62)`, 1);
      if (capas.sub.aprox.length) { cx.setLineDash([6, 4]); pintaLineas(cx, p, G, capas.sub.aprox, `rgba(${ACERO},.5)`, 1); cx.setLineDash([]); }
      pintaLuz(cx, p, G, capas.sub.lineas, t);
    }
    if (estado.puntos && PT && PT.p) { cx.globalCompositeOperation = 'source-over'; pintaPuntos(cx, p, G); pintaCiudades(cx, p, G); cx.globalCompositeOperation = 'lighter'; if (puntoMarcado >= 0) pintaRuta(cx, p, G, t); }
    if (estado.sub && capas.sub && capas.sub.lineas) {
      if (cableMarcado >= 0) { const l = capas.sub.lineas[cableMarcado]; if (l) pintaLineas(cx, p, G, [l], `rgba(${BLANCO},.95)`, 2.2); }
      if (llegadaMarcada >= 0 && LUG && LUG.llegadas) { const ls = LUG.llegadas[llegadaMarcada].seg.map((i) => capas.sub.lineas[i]).filter(Boolean); pintaLineas(cx, p, G, ls, `rgba(${BLANCO},.95)`, 2); }
      pintaLlegadas(cx, p, G);
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
      for (const l of lineas) {
        if (l.L < 0.01) continue;
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
  function pintaLineas(cx, p, G, lineas, color, ancho) {
    cx.strokeStyle = color; cx.lineWidth = ancho; cx.beginPath();
    for (const l of lineas) {
      let prev = false;
      for (const w of l.w) {
        const v = p.aVista(w), x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], ve = v[2] > 0.02;
        if (ve && prev) cx.lineTo(x, y); else if (ve) cx.moveTo(x, y);
        prev = ve;
      }
    }
    cx.stroke();
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
    const el = $('capa-nota'); if (!el) return;
    const partes = [], porCapa = {};
    const meter = (k, txt) => { partes.push(txt); porCapa[k] = txt; };
    if (estado.sat) {
      if (S && S.N) {
        const vistaTxt = estado.vista === 'todos' && estado.orb.baja && estado.orb.media && estado.orb.geo ? num(S.N) + ' ' + T('satélites de datos')
          : T('Mostrando') + ' ' + num(S.nSel || 0) + ' ' + T('de') + ' ' + num(S.N) + ' ' + T('satélites de datos') + (estado.vista === 'equilibrada' && estado.orb.baja && (S.paso || 10) > 1 ? ' (' + T('Starlink: 1 de cada') + ' ' + (S.paso || 10) + ')' : estado.vista === 'cielo' ? ' (' + T('a más de 25° sobre tu horizonte') + ')' : '');
        let s = vistaTxt + ' · ' + T('Datos verificados') + ', ' + haceTxt(hace(S.d.descargado)) + ' · ' + T('posición calculada ahora');
        const L = P() && P().lugar;
        if (L && S.tArriba) s += ' · ' + T('sobre') + ' ' + L.nombre + ': ' + num(S.nArriba);
        meter('sat', s);
      } else if (S && S.error) meter('sat', T('No se pudieron cargar los satélites.'));
      else meter('sat', T('Cargando satélites…'));
    }
    if (estado.sub) {
      const c = capas.sub;
      meter('sub', c && c.d ? num(c.nombres) + ' ' + T('cables submarinos con nombre') + ' · ' + T('Datos verificados') + ' · ' + T('puede faltar alguno') + ' · ' + T('la luz viaja en los dos sentidos a la vez, a cámara lenta: cruza el Atlántico en unos 30 ms') : c && c.error ? T('No se pudieron cargar los cables.') : T('Cargando cables…'));
    }
    if (estado.fibra) {
      meter('fibra', FT && FT.d ? num(FT.d.medida.km) + ' km ' + T('de fibra troncal por tierra en') + ' ' + num(FT.d.medida.paises.length) + ' ' + T('países') + ' · ' + T('trazados aproximados de redes reales') + ' · ' + T('Datos verificados') : FT && FT.error ? T('No se pudo cargar la fibra por tierra.') : T('Cargando fibra por tierra…'));
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
  function buscaPunto(x, y) {
    if (!estado.puntos || !PT || !PT.p) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 5.5 * 5.5;
    for (let i = 0; i < PT.p.length; i++) { const v = p.aVista(PT.p[i].w); if (v[2] <= 0.05) continue; const dx = G.CX + G.R * v[0] - x, dy = G.CY - G.R * v[1] - y, d2 = dx * dx + dy * dy; if (d2 < dm) { dm = d2; mejor = i; } }
    return mejor;
  }
  function buscaLlegada(x, y) {
    if (!estado.sub || !LUG || !LUG.llegadas) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 8 * 8;
    for (let i = 0; i < LUG.llegadas.length; i++) { const v = p.aVista(LUG.llegadas[i].w); if (v[2] <= 0.05) continue; const dx = G.CX + G.R * v[0] - x, dy = G.CY - G.R * v[1] - y, d2 = dx * dx + dy * dy; if (d2 < dm) { dm = d2; mejor = i; } }
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
  function buscaCable(x, y) {
    if (!estado.sub || !capas.sub || !capas.sub.lineas) return -1;
    const p = P(), G = p.geo; let mejor = -1, dm = 7 * 7;
    capas.sub.lineas.forEach((l, i) => {
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
    fichaRica(titulo, filas.length ? filas : [[T('Datos'), T('Sin más datos públicos sobre este edificio')]], fuentes, x, y);
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
      f.querySelector('span').textContent = paisNombre(l.cc) + '\n' + (lista ? lista + (sin.n ? ' · ' + num(sin.n) + ' ' + T(sin.n === 1 ? 'sin nombre' : 'sin nombre') : '') : num(sin.n) + ' ' + T(sin.n === 1 ? 'cable sin nombre' : 'cables sin nombre')) + sigue;
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
      f.querySelector('b').textContent = gr ? gr[0] : (d.n || T('Cable submarino sin nombre'));
      // owner, 22 Oct 2026: «origen Francia, destino Brasil… sería más entendible». West to east; data goes both ways.
      const medio = lados.slice(1, -1);
      const donde = lados.length >= 2 ? T('Origen') + ': ' + lados[0] + '\n' + T('Destino') + ': ' + lados[lados.length - 1]
          + (medio.length ? '\n' + T('Paradas') + ': ' + medio.slice(0, 4).join(' · ') + (medio.length > 4 ? ' · +' + (medio.length - 4) : '') : '')
          + '\n' + T('Los datos viajan por él en los dos sentidos.')
        : lados.length === 1 ? T('Llega a tierra en') + ' ' + lados[0] : T('Sus extremos no están cerca de ninguna ciudad');
      // everything we know about the whole cable (owner, 22 Oct 2026: «el año, los kilómetros… todos los datos que sepamos»)
      const inf = (gr && gr[2]) || {}, mas = [];
      if (inf.anio) mas.push(T('En servicio desde') + ' ' + inf.anio);
      if (inf.km) mas.push(T('Longitud') + ': ' + num(inf.km) + ' km');
      else if (inf.kmMapa) mas.push(T('Longitud en el mapa') + ': ' + num(inf.kmMapa) + ' km');
      if (inf.duenos && inf.duenos.length) mas.push(T('Dueños') + ': ' + inf.duenos.join(', '));
      const ops = inf.operan && inf.operan.length ? inf.operan.join(', ') : d.o;
      if (ops) mas.push(T('Operador') + ': ' + ops);
      if (inf.aprox) {  // rebuilt by the agency: say so, and where it was checked
        mas.push(T('Trazado aproximado por mar') + ' · ' + T('Datos verificados'));
      }
      f.querySelector('span').textContent = donde + (mas.length ? '\n' + mas.join('\n') : '');
    }
    f.hidden = false; colocaFicha(x, y);
  }
  function mira(x, y) {
    if (P() && P().dentro) { if (marcado >= 0 || centroMarcado >= 0 || cableMarcado >= 0 || llegadaMarcada >= 0 || puntoMarcado >= 0) { centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = -1; muestra(-1); } return; }
    const q = buscaPunto(x, y);
    if (q >= 0) { if (marcado >= 0) { marcado = -1; } cableMarcado = llegadaMarcada = centroMarcado = fibraMarcada = -1; if (q !== puntoMarcado) { puntoMarcado = q; fichaLugar('punto', q, x, y); } else colocaFicha(x, y); return; }
    puntoMarcado = -1;
    const i = estado.sat ? busca(x, y) : -1;
    if (i >= 0) { centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = -1; muestra(i, x, y); return; }
    if (marcado >= 0) muestra(-1);
    const g = buscaLlegada(x, y);
    if (g >= 0) { cableMarcado = centroMarcado = -1; if (g !== llegadaMarcada) { llegadaMarcada = g; fichaLugar('llegada', g, x, y); } else colocaFicha(x, y); return; }
    llegadaMarcada = -1;
    const c = buscaCentro(x, y);
    if (c >= 0) { cableMarcado = -1; if (c !== centroMarcado) { centroMarcado = c; fichaLugar('centro', c, x, y); } else colocaFicha(x, y); return; }
    centroMarcado = -1;
    const k = buscaCable(x, y);
    if (k >= 0) { fibraMarcada = -1; if (k !== cableMarcado) { cableMarcado = k; fichaLugar('cable', k, x, y); } else colocaFicha(x, y); return; }
    if (cableMarcado >= 0) cableMarcado = -1;
    const ft = buscaFibra(x, y);
    if (ft >= 0) { if (ft !== fibraMarcada) { fibraMarcada = ft; fichaFibra(ft, x, y); } else colocaFicha(x, y); return; }
    fibraMarcada = -1;
    const f = ficha(); if (f && !f.hidden) f.hidden = true;
  }
  addEventListener('click', (e) => { if (!soloTu && !e.target.closest('header, #puertas, #directo, #lugar, #seccion, .zoom, .conexion')) mira(e.clientX, e.clientY); });
  addEventListener('pointermove', (e) => {
    if (pendiente) { pendiente.x = e.clientX; pendiente.y = e.clientY; return; }
    pendiente = { x: e.clientX, y: e.clientY };
    requestAnimationFrame(() => { const q = pendiente; pendiente = null; mira(q.x, q.y); });
  }, { passive: true });

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
    caja.hidden = !estado.sat || !!estado.satPlegado;
    // the card hangs under the «Satélites» button (owner: «un desplegable»); centred on it when there is room
    const b = document.querySelector('#capas [data-capa="sat"]');
    if (b && !caja.hidden && innerWidth > 760) { const r = b.getBoundingClientRect(), w = caja.offsetWidth || 340; let x = r.left + r.width / 2 - w / 2; x = Math.max(12, Math.min(innerWidth - w - 12, x)); caja.style.left = x + 'px'; caja.style.transform = 'none'; caja.style.top = (r.bottom + 10) + 'px'; }
    caja.querySelectorAll('[data-vista]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.vista === estado.vista)));
    caja.querySelectorAll('[data-orb]').forEach((b) => { b.setAttribute('aria-pressed', String(!!estado.orb[b.dataset.orb])); const c = S && S.cuentaOrb ? S.cuentaOrb[b.dataset.orb] : 0; b.querySelector('b').textContent = c ? num(c) : ''; });
    pintaFase();
    const cielo = caja.querySelector('[data-vista="cielo"]'); const L = P() && P().lugar;
    if (cielo) { cielo.disabled = !L; const t = cielo.querySelector('.cielo-t'); const v = L && L.nombre ? T('Sobre') + ' ' + L.nombre : T('Sobre ti'); if (t.textContent !== v) t.textContent = v; }
  }
  function enganchaVista() {
    const caja = $('sat-vista'); if (!caja) return;
    const ti = caja.querySelector('.titulo');
    if (ti) { const x = document.createElement('button'); x.type = 'button'; x.className = 'plegar'; x.setAttribute('aria-label', T('Plegar')); x.textContent = '—'; x.addEventListener('click', () => { estado.satPlegado = true; pintaVista(); }); ti.appendChild(x); }
    // the «Satélites» button unfolds the card again when the layer is on but the card was folded
    const sb = document.querySelector('#capas [data-capa="sat"]');
    if (sb) sb.addEventListener('click', (e) => { if (estado.sat && estado.satPlegado) { e.stopImmediatePropagation(); estado.satPlegado = false; pintaVista(); } }, true);
    caja.querySelectorAll('[data-vista]').forEach((b) => b.addEventListener('click', () => { estado.vista = b.dataset.vista; guarda(); pintaVista(); pintaNota(); }));
    // 22 Oct 2026 (owner: «por capas… la persona tiene que ver»): every orbit is a layer the person switches on or
    // off on its own; the satellites open with the geostationary ring only. The last layer on cannot be switched off
    // (the button would show nothing); the person turns the satellites off instead.
    caja.querySelectorAll('[data-orb]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.orb, encendidas = Object.keys(estado.orb).filter((x) => estado.orb[x]);
      if (estado.orb[k] && encendidas.length === 1) return;
      estado.orb[k] = !estado.orb[k];
      guarda(); pintaVista(); pintaNota();
    }));
  }

  // ---------- the three buttons ----------
  function pon(clave, on) {
    estado[clave] = on; guarda();
    const b = document.querySelector(`#capas [data-capa="${clave}"]`); if (b) b.setAttribute('aria-pressed', String(on));
    if (on && clave === 'sat') estado.satPlegado = false;
    if (on) { if (clave === 'sat') cargaSat(); else if (clave === 'puntos') { cargaPuntos(); cargaCables('sub'); cargaFibra(); } else if (clave === 'fibra') cargaFibra(); else { cargaCables(clave); if (clave === 'sub') cargaFibra(); } }
    if (!on) { muestra(-1); centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = fibraMarcada = -1; }
    pintaNota(); pintaVista();
  }
  async function arranca() {
    // the land layer only appears when there is land data to show
    // (asked to the small index, so the page never requests a file that is not there)
    let ind = null; try { const r = await fetch('datos/indice.json', { cache: 'no-cache' }); if (r.ok) ind = await r.json(); } catch (_) {}
    for (const k of ['puntos']) if (!ind || !ind.capas || !ind.capas[k]) { const b = document.querySelector(`#capas [data-capa="${k}"]`); if (b) b.remove(); estado[k] = false; }
    estado.tierra = false; // land fibre left out (owner, 21 Oct 2026): OpenStreetMap knows too little of it
    enganchaVista();
    document.querySelectorAll('#capas [data-capa]').forEach((b) => b.addEventListener('click', () => pon(b.dataset.capa, b.getAttribute('aria-pressed') !== 'true')));
    for (const k of ['sub', 'fibra', 'puntos', 'sat']) if (estado[k]) pon(k, true);
    pintaNota();
    addEventListener('guardiana-idioma', pintaNota);
  }
  let soloTu = false, soloTuPinta = null;
  function ponSoloTu(on, dibuja) { soloTu = !!on; soloTuPinta = on ? dibuja || null : null; document.body.classList.toggle('solo-tu', soloTu); if (soloTu) { muestra(-1); centroMarcado = cableMarcado = llegadaMarcada = puntoMarcado = fibraMarcada = -1; } pintaNota(); pintaVista(); }
  window.OrbitaCapas = { pinta, pon, soloTu: ponSoloTu, get enSoloTu() { return soloTu; }, get estado() { return { ...estado }; }, get satelites() { return S && S.N ? S.N : 0; }, get lugares() { return LUG; }, get fibra() { return FT; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();
