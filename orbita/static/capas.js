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
  const estado = { sub: false, tierra: false, sat: false };
  try { Object.assign(estado, JSON.parse(localStorage.getItem('guardiana-orbita-capas') || '{}')); } catch (_) {}
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
        return { n: c.n, w, acc, L: acc[acc.length - 1], fase: Math.random() };
      });
      capas[clave] = { d, lineas, nombres: new Set(d.cables.map((c) => c.n).filter(Boolean)).size };
    } catch (e) { capas[clave] = { error: true }; }
    cargando[clave] = false; pintaNota();
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
      const rec = [], g = [], nom = [];
      for (const f of d.sat) {
        const omm = { NORAD_CAT_ID: f[ix('norad')] };
        for (const k of c.slice(3)) omm[k] = f[ix(k)];
        try { const r = window.satellite.json2satrec(omm); if (r && !r.error) { rec.push(r); g.push(f[0]); nom.push(f[1]); } } catch (_) {}
      }
      const N = rec.length;
      S = { d, rec, g: Uint8Array.from(g), nom, N, pos: new Float64Array(N * 3), vel: new Float64Array(N * 3), t: new Float64Array(N), ok: new Uint8Array(N),
            sx: new Float32Array(N), sy: new Float32Array(N), sombra: new Uint8Array(N), vis: new Uint8Array(N), arriba: new Uint8Array(N), cursor: 0, nArriba: 0, tArriba: 0 };
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

  // ---------- drawing ----------
  function pinta(t) {
    const p = P(); if (!p) return;
    const cx = p.ctx, G = p.geo;
    cx.globalCompositeOperation = 'lighter';
    if (estado.tierra && capas.tierra && capas.tierra.lineas) pintaLineas(cx, p, G, capas.tierra.lineas, `rgba(${ACERO},.30)`, 0.7);
    if (estado.sub && capas.sub && capas.sub.lineas) { pintaLineas(cx, p, G, capas.sub.lineas, `rgba(${ACERO},.62)`, 1); pintaLuz(cx, p, G, capas.sub.lineas, t); }
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
  // Starlink-like low fleet, other low/medium orbits, geostationary: steel, steel, cold white
  let SPR = null;
  function sprites() {
    if (SPR) return SPR;
    const defs = [[1.7, ACERO, 0.7], [2.2, ACERO, 0.92], [2.8, BLANCO, 0.92]];
    SPR = defs.map(([diam, rgb, a]) => {
      const k = 4, d = Math.ceil(diam + 3), c = document.createElement('canvas');
      c.width = c.height = d * k;
      const g = c.getContext('2d'), m = d * k / 2, gr = g.createRadialGradient(m, m, 0, m, m, m);
      const nuc = diam / 2 / (d / 2);
      gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(nuc * 0.75, `rgba(${rgb},${a})`);
      gr.addColorStop(nuc, `rgba(${rgb},${a * 0.45})`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, d * k, d * k);
      return { img: c, d };
    });
    return SPR;
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
    const capasPinta = [[], [], []]; // starlink-like low fleet, other low/medium, geostationary
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
      if (!ve) continue;
      const x = CX + R * v[0], y = CY - R * v[1];
      S.sx[i] = x; S.sy[i] = y;
      const alto = r - RE;
      let sombra = 0;
      if (sol) { const d = ex * sx0 + ey * sy0 + ez * sz0; if (d < 0 && r * r - d * d < RE * RE) sombra = 1; }
      S.sombra[i] = sombra;
      capasPinta[alto > 30000 ? 2 : S.g[i] === 0 ? 0 : 1].push(sombra ? -1 - i : i);
    }
    if (cuentaArriba) { S.nArriba = n; S.tArriba = ahora; pintaNota(); }
    // small soft discs, one pre-drawn sprite per kind (agency, 20 Oct 2026); in sunlight full, in the shadow dim
    for (let c = 0; c < 3; c++) {
      const sp = sprites()[c], s = sp.d, h = s / 2;
      for (const j of capasPinta[c]) {
        const sombra = j < 0, i = sombra ? -1 - j : j;
        cx.globalAlpha = sombra ? 0.28 : 1;
        cx.drawImage(sp.img, S.sx[i] - h, S.sy[i] - h, s, s);
      }
    }
    cx.globalAlpha = 1;
    // the ones over your sky right now: a quiet ring each
    if (L) {
      cx.fillStyle = `rgba(${BLANCO},.95)`;
      const sp = sprites()[2], h = sp.d / 2; for (let i = 0; i < N; i++) if (S.arriba[i] && S.vis[i]) cx.drawImage(sp.img, S.sx[i] - h, S.sy[i] - h, sp.d, sp.d);
    }
    if (marcado >= 0 && S.vis[marcado]) {
      cx.strokeStyle = `rgba(${BLANCO},.95)`; cx.lineWidth = 1.4;
      cx.beginPath(); cx.arc(S.sx[marcado], S.sy[marcado], 7, 0, 7); cx.stroke();
    }
  }

  // ---------- the line under the planet: what is shown, from where, how fresh ----------
  const hace = (iso) => { const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000)); return m < 60 ? m + ' min' : Math.round(m / 60) + ' h'; };
  const haceTxt = (x) => { const l = window.GuardianaIdioma && window.GuardianaIdioma.lang; return l === 'en' ? x + ' ago' : l === 'pt' ? 'há ' + x : 'hace ' + x; };
  const num = (n) => n.toLocaleString((window.GuardianaIdioma && window.GuardianaIdioma.locale) || 'es-ES');
  function pintaNota() {
    const el = $('capa-nota'); if (!el) return;
    const partes = [];
    if (estado.sat) {
      if (S && S.N) {
        let s = num(S.N) + ' ' + T('satélites de datos') + ' · CelesTrak, ' + haceTxt(hace(S.d.descargado)) + ' · ' + T('posición calculada ahora');
        const L = P() && P().lugar;
        if (L && S.tArriba) s += ' · ' + T('sobre') + ' ' + L.nombre + ': ' + num(S.nArriba);
        partes.push(s);
      } else if (S && S.error) partes.push(T('No se pudieron cargar los satélites.'));
      else partes.push(T('Cargando satélites…'));
    }
    if (estado.sub) {
      const c = capas.sub;
      partes.push(c && c.d ? num(c.nombres) + ' ' + T('cables submarinos con nombre') + ' · © OpenStreetMap (ODbL) · ' + T('puede faltar alguno') + ' · ' + T('la luz viaja en los dos sentidos a la vez, a cámara lenta: cruza el Atlántico en unos 30 ms') : c && c.error ? T('No se pudieron cargar los cables.') : T('Cargando cables…'));
    }
    if (estado.tierra) {
      const c = capas.tierra;
      partes.push(c && c.d ? num(c.nombres) + ' ' + T('cables de tierra con nombre') + ' · © OpenStreetMap (ODbL) · ' + T('solo una parte de la fibra') : c && c.error ? T('No se pudieron cargar los cables de tierra.') : T('Cargando cables de tierra…'));
    }
    el.textContent = partes.join('   ·   ');
    el.hidden = !partes.length;
    document.body.classList.toggle('ver-sat', estado.sat);
    if (estado.sat) el.title = T('Satélites bajos a su altura real; los de órbita media y geoestacionaria, en los anillos exteriores (distancia no a escala). Más tenues, los que están ahora en la sombra de la Tierra.');
    else el.removeAttribute('title');
  }

  // ---------- a satellite under the pointer: its name, its fleet, its height ----------
  let marcado = -1;
  const ficha = () => $('sat-ficha');
  function busca(x, y) {
    if (!S || !S.N || !estado.sat) return -1;
    let mejor = -1, d2 = 81;
    for (let i = 0; i < S.N; i++) { if (!S.vis[i]) continue; const dx = S.sx[i] - x, dy = S.sy[i] - y, q = dx * dx + dy * dy; if (q < d2) { d2 = q; mejor = i; } }
    return mejor;
  }
  function muestra(i, x, y) {
    const f = ficha(); if (!f) return;
    marcado = i;
    if (i < 0) { f.hidden = true; return; }
    const k = i * 3, r = Math.hypot(S.pos[k], S.pos[k + 1], S.pos[k + 2]);
    const grupo = S.d.grupos[S.g[i]];
    f.querySelector('b').textContent = S.nom[i];
    f.querySelector('span').textContent = (grupo ? grupo.nombre : '') + ' · ' + num(Math.round(r - RE)) + ' km ' + T('de altura') + ' · ' + T(S.sombra[i] ? 'en la sombra de la Tierra' : 'al sol') + (S.arriba[i] ? ' · ' + T('sobre tu cielo ahora') : '');
    f.hidden = false;
    const G = P().geo;
    f.style.left = Math.min(G.W - 240, x + 14) + 'px'; f.style.top = Math.max(70, y - 46) + 'px';
  }
  addEventListener('pointermove', (e) => { if (!estado.sat || (P() && P().dentro)) { if (marcado >= 0) muestra(-1); return; } const i = busca(e.clientX, e.clientY); if (i !== marcado) muestra(i, e.clientX, e.clientY); else if (i >= 0) { const f = ficha(); f.style.left = Math.min(P().geo.W - 240, e.clientX + 14) + 'px'; f.style.top = Math.max(70, e.clientY - 46) + 'px'; } }, { passive: true });

  // ---------- the three buttons ----------
  function pon(clave, on) {
    estado[clave] = on; guarda();
    const b = document.querySelector(`#capas [data-capa="${clave}"]`); if (b) b.setAttribute('aria-pressed', String(on));
    if (on) { if (clave === 'sat') cargaSat(); else cargaCables(clave); }
    if (!on && clave === 'sat') muestra(-1);
    pintaNota();
  }
  async function arranca() {
    // the land layer only appears when there is land data to show
    // (asked to the small index, so the page never requests a file that is not there)
    try { const r = await fetch('datos/indice.json', { cache: 'no-cache' }); if (!r.ok) throw 0; const i = await r.json(); if (!i.capas || !i.capas.tierra) throw 0; } catch (_) { const b = document.querySelector('#capas [data-capa="tierra"]'); if (b) b.remove(); estado.tierra = false; }
    document.querySelectorAll('#capas [data-capa]').forEach((b) => b.addEventListener('click', () => pon(b.dataset.capa, b.getAttribute('aria-pressed') !== 'true')));
    for (const k of ['sub', 'tierra', 'sat']) if (estado[k]) pon(k, true);
    pintaNota();
    addEventListener('guardiana-idioma', pintaNota);
  }
  window.OrbitaCapas = { pinta, pon, get estado() { return { ...estado }; }, get satelites() { return S && S.N ? S.N : 0; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();
