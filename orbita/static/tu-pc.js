/* GUARDIANA · Órbita · «Tu PC, en directo» (31 Oct 2026). Inside the Windows program the window shows this website's Órbita
   (owner, 30 Oct 2026: «la versión web que teníamos, que ya estaba terminada, quiero que la metas en el programa»), and the
   program, which sees every connection of the computer, hands them to this page: with which company each one talks, where
   its server is and whether GUARDIANA cut it. The planet draws them from your PC, the way ESPEJO draws a website's.
   The contract with the program: the page asks with the event «guardiana-pc-pide» and the program answers, when it can,
   with «guardiana-pc» (detail: a JSON text { v: 1, ahora, maxima, vigilando, programas, destinos: [{ e, d, p, c, la, lo, k,
   x, n, g }] }). Every field is read as untrusted: names reach the page as text, never as HTML.
   This module makes no network request: what the program hands over stays in this page. Outside the program (no
   data-en-programa on <html>) it does nothing at all. Nothing is invented: every figure on screen is the program's, and
   while it has not answered the panel says so. The arcs go from your PC to the place of each server: never the route the
   data takes, and the panel says that too. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const lang = () => (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es';
  const loc = () => (window.GuardianaIdioma ? window.GuardianaIdioma.locale : undefined);
  const num = (n) => (Number.isFinite(n) ? n.toLocaleString(loc()) : '');
  const P = () => window.OrbitaPlaneta;
  const enPrograma = () => document.documentElement.dataset.enPrograma === '1';
  const RAD = Math.PI / 180;
  const ACENTO = '156,195,228', ROJO = '224,122,108', BLANCO = '244,246,248';
  const CADA = 5000;   // ms between two questions to the program
  const TARDA = 12000; // ms without a first answer before the panel adds that it keeps asking
  const MUDO = 16000;  // ms without a new answer before the live dot stops and the panel says since when
  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const X = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  // the place of a cut name: the program places a name stopped before it left at its company's seat (universo.rs, «sede»)
  const NOTA_LUGAR = 'El lugar es el del servidor según una base de datos de direcciones; si se cortó antes de salir, el país de la sede de la empresa. No es la ruta exacta que siguen los datos.';
  const NOTA_AQUI = 'Estos datos los entrega el programa a esta página dentro de tu equipo; la página no los envía a ningún sitio.';
  const NOTA_SIN = 'Las conexiones sin lugar conocido cuentan en el total, pero no se dibujan.';

  // ---------- geometry ----------
  const vec = (lon, lat) => { const a = lat * RAD, b = lon * RAD; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
  const angulo = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  function slerp(a, b, t) { const om = angulo(a, b), so = Math.sin(om); if (so < 1e-6) return a.slice(); const ka = Math.sin((1 - t) * om) / so, kb = Math.sin(t * om) / so; return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]; }
  // a small, stable number from a text: each place keeps the rhythm of its pulses from one answer to the next
  const semilla = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
  const nombres = {};
  const paisNombre = (cc) => { try { const l = lang(); const dn = nombres[l] || (nombres[l] = new Intl.DisplayNames([l], { type: 'region' })); return dn.of(cc) || cc; } catch (_) { return cc; } };

  // ---------- what the program hands over, cleaned ----------
  // control characters and direction marks out: a name shows as what it is, and nothing in it can turn the line around
  const RARO = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;
  const texto = (x, max) => (typeof x === 'string' ? x.replace(RARO, '').replace(/\s+/g, ' ').trim().slice(0, max) : '');
  // two capital letters; not the «unknown» and continent codes some address tables use, nor the program's own marks (@local)
  const NO_PAIS = new Set(['ZZ', 'XX', 'EU', 'AP']);
  const paisDe = (x) => { const c = texto(x, 2).toUpperCase(); return /^[A-Z]{2}$/.test(c) && !NO_PAIS.has(c) ? c : ''; };
  const coord = (x, lim) => (typeof x === 'number' && Number.isFinite(x) && Math.abs(x) <= lim ? x : null);
  function limpia(d) {
    if (!d || typeof d !== 'object') return null;
    let la = coord(d.la, 90), lo = coord(d.lo, 180);
    if (la === null || lo === null || (la === 0 && lo === 0)) { la = null; lo = null; } // «0, 0» is the sea off Africa, not a place
    const n = typeof d.n === 'number' && Number.isFinite(d.n) && d.n >= 1 ? Math.min(1e9, Math.round(d.n)) : 1;
    return { e: texto(d.e, 80), d: texto(d.d, 120), p: paisDe(d.p), c: texto(d.c, 60), la, lo, x: d.x === 1 || d.x === true ? 1 : 0, n, g: texto(d.g, 60) };
  }
  const mayor = (m) => { let k = '', v = -1; for (const [a, b] of m) if (b > v) { k = a; v = b; } return k; };
  // the counts, by company and by place: the server's coordinates, or the middle of its country; with neither, it counts
  // in the totals and is not drawn
  function resume(lista) {
    const C = (P() && P().centros) || {};
    const r = { total: lista.length, conexiones: 0, cortadas: 0, empresas: new Map(), sinEmpresa: null, paises: new Set(), lugares: new Map(), sinLugar: 0 };
    for (const d of lista) {
      r.conexiones += d.n; if (d.x) r.cortadas += d.n;
      if (d.p) r.paises.add(d.p);
      let em = d.e ? r.empresas.get(d.e) : r.sinEmpresa;
      if (!em) { em = { nombre: d.e, n: 0, corta: 0, queda: 0, paises: new Map(), progs: new Map() }; if (d.e) r.empresas.set(d.e, em); else r.sinEmpresa = em; }
      em.n += d.n; if (d.x) em.corta += d.n; else em.queda += d.n;
      if (d.p) em.paises.set(d.p, (em.paises.get(d.p) || 0) + d.n);
      if (d.g) em.progs.set(d.g, (em.progs.get(d.g) || 0) + d.n);
      let lon, lat, key, porPais = false;
      if (d.la !== null) { lat = d.la; lon = d.lo; key = Math.round(lat * 2) / 2 + ',' + Math.round(lon * 2) / 2; }
      else if (d.p && C[d.p]) { lat = C[d.p].lat; lon = C[d.p].lon; key = 'pais:' + d.p; porPais = true; }
      else { r.sinLugar += d.n; continue; }
      let l = r.lugares.get(key);
      if (!l) r.lugares.set(key, (l = { key, lon, lat, porPais, pais: d.p, ciudades: new Map(), n: 0, corta: 0, queda: 0, empresas: new Map() }));
      l.n += d.n; if (d.x) l.corta += d.n; else l.queda += d.n;
      if (d.c) l.ciudades.set(d.c, (l.ciudades.get(d.c) || 0) + d.n);
      if (!l.pais && d.p) l.pais = d.p;
      if (d.e) { const x = l.empresas.get(d.e) || { n: 0, corta: 0 }; x.n += d.n; if (d.x) x.corta += d.n; l.empresas.set(d.e, x); }
    }
    for (const l of r.lugares.values()) l.ciudad = mayor(l.ciudades);
    return r;
  }

  // ---------- the open view ----------
  // E = { t0, visible, pedido, ultima, res, lugares (the places on the planet, with their fade), lk, enfocado, movido,
  //       antes, reloj, tPrev, lista (whether the list was drawn once) }
  let E = null;

  // ---------- drawing (in the planet's clean mode, through OrbitaCapas.soloTu) ----------
  const N = 48, CERCA = 0.02; // points of an arc; closer than this (about 130 km) a server is next to you
  function arco(L, l) {
    const casa = vec(L.lon, L.lat); let dest = vec(l.lon, l.lat), ang = angulo(casa, dest);
    if (ang < CERCA) return { cerca: true };
    if (ang > 3.1) { dest = vec(l.lon + 1.5, l.lat + 1); ang = angulo(casa, dest); } // the far side of the planet: one of its many great circles
    // low over the planet, a little higher the farther it goes: data, not a missile (owner, 23 Oct 2026, on ESPEJO's first arcs)
    const alto = 0.018 + 0.11 * Math.min(1, ang / 1.6), w = [];
    for (let i = 0; i <= N; i++) { const t = i / N, g = slerp(casa, dest, t), a = 1.004 + alto * Math.sin(Math.PI * t); w.push([g[0] * a, g[1] * a, g[2] * a]); }
    return { cerca: false, w, pts: new Array(N + 1), sale: N, largo: N, periodo: 2400 + 2600 * Math.min(1, ang / 1.6) + 1000 * semilla(l.key) };
  }
  let CAJAS = [];
  function cabe(x, y, w, h) { const b = [x - 3, y - h / 2, x + w + 3, y + h / 2]; for (const c of CAJAS) if (b[0] < c[2] && b[2] > c[0] && b[1] < c[3] && b[3] > c[1]) return false; CAJAS.push(b); return true; }
  // a name beside a point: to its right, or, with no room there (another name, the panel, the edge), to its left
  function etiqueta(cx, ax, ay, off, txt, fuerte, color, W) {
    cx.font = (fuerte ? '600 12px' : '500 11px') + ' "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle'; cx.textAlign = 'left';
    const w = cx.measureText(txt).width, h = fuerte ? 16 : 14;
    let x = ax + off;
    if (x + w > W - 10 || !cabe(x, ay, w, h)) { x = ax - off - w; if (x < 10 || !cabe(x, ay, w, h)) return false; }
    cx.lineWidth = 3; cx.strokeStyle = 'rgba(6,8,12,.86)'; cx.strokeText(txt, x, ay);
    cx.fillStyle = color || (fuerte ? '#F4F6F8' : 'rgba(232,236,241,.88)'); cx.fillText(txt, x, ay);
    return true;
  }
  const corto = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
  function trazo(cx, pts, desde, hasta) {
    cx.beginPath(); let prev = false;
    for (let i = desde; i <= hasta; i++) { const q = pts[i]; if (q && prev) cx.lineTo(q[0], q[1]); else if (q) cx.moveTo(q[0], q[1]); prev = !!q; }
    cx.stroke();
  }
  function cabeza(cx, q, rojo, a) {
    const R = 5, g = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], R);
    g.addColorStop(0, rojo ? `rgba(255,236,232,${(0.95 * a).toFixed(3)})` : `rgba(255,255,255,${(0.92 * a).toFixed(3)})`);
    g.addColorStop(0.4, `rgba(${rojo ? ROJO : ACENTO},${(0.65 * a).toFixed(3)})`); g.addColorStop(1, `rgba(${rojo ? ROJO : ACENTO},0)`);
    cx.fillStyle = g; cx.beginPath(); cx.arc(q[0], q[1], R, 0, 7); cx.fill();
  }
  function destello(cx, q, k, a) {
    const rr = 3 + 9 * k, g = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], rr + 6);
    g.addColorStop(0, `rgba(${ROJO},${(0.95 * (1 - k * 0.6) * a).toFixed(3)})`); g.addColorStop(1, `rgba(${ROJO},0)`);
    cx.fillStyle = g; cx.beginPath(); cx.arc(q[0], q[1], rr + 6, 0, 7); cx.fill();
  }
  function pinta(cx, p, G) {
    if (!E) return;
    const L = p.lugar; if (!L) return;
    const now = performance.now(), dt = Math.min(0.1, Math.max(0, (now - (E.tPrev || now)) / 1000)); E.tPrev = now;
    const quieto = reducido(), ease = quieto ? 1 : Math.min(1, dt * 5);
    const lk = L.lon.toFixed(3) + ',' + L.lat.toFixed(3);
    if (lk !== E.lk) { E.lk = lk; for (const l of E.lugares.values()) l.ruta = null; } // another place chosen for this computer
    CAJAS = E.caja ? [E.caja] : [];
    cx.save(); cx.globalCompositeOperation = 'source-over'; cx.lineCap = 'round'; cx.lineJoin = 'round';
    const vc = p.aVista(vec(L.lon, L.lat).map((c) => c * 1.004)), casa = vc[2] > 0 ? [G.CX + G.R * vc[0], G.CY - G.R * vc[1]] : null;
    const anilloR = Math.max(16, Math.min(34, 14 + G.R * 0.035));
    if (casa) CAJAS.push([casa[0] - 16, casa[1] - 16, casa[0] + 16, casa[1] + 16]); // the planet's own marker for you
    // each place: how visible it is (it fades in when it appears and out when it goes), its arc on screen, how far it grew
    const vivos = [];
    for (const [k, l] of E.lugares) {
      l.a += ((l.t1 ? 0 : 1) - l.a) * ease;
      if (l.t1 && l.a < 0.02) { E.lugares.delete(k); continue; }
      l.rv += (l.rObj - l.rv) * ease;
      if (!l.ruta) l.ruta = arco(L, l);
      const r = l.ruta;
      if (!r.cerca) {
        const pts = r.pts;
        for (let i = 0; i <= N; i++) { const w = r.w[i], v = p.aVista(w), alto = w[0] * w[0] + w[1] * w[1] + w[2] * w[2] > 1.02; pts[i] = (v[2] > 0.02 || (alto && v[0] * v[0] + v[1] * v[1] > 1)) ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null; }
        r.sale = N; if (casa) for (let i = 1; i <= N; i++) { const q = pts[i]; if (q && Math.hypot(q[0] - casa[0], q[1] - casa[1]) > anilloR) { r.sale = i; break; } }
        r.largo = Math.max(1, Math.round(N * (quieto ? 1 : suave(Math.min(1, (now - l.t0) / 1100)))));
      }
      const v = p.aVista(vec(l.lon, l.lat).map((c) => c * 1.004));
      l.q = v[2] > 0.02 ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null;
      vivos.push(l);
    }
    const hayCortes = !!(E.res && E.res.cortadas > 0);
    E.aRing = (E.aRing || 0) + ((hayCortes ? 1 : 0) - (E.aRing || 0)) * ease;
    // 1 · the arcs, faint: what goes out in the accent; what GUARDIANA cut in coral, dashed, from the ring outwards (where it
    //     was going), so a cut never looks like it arrived
    for (const l of vivos) {
      const r = l.ruta; if (r.cerca) continue;
      const a = Math.min(0.42, 0.13 + 0.06 * Math.log10(1 + l.n)) * l.a;
      if (l.queda > 0) { cx.strokeStyle = `rgba(${ACENTO},${a.toFixed(3)})`; cx.lineWidth = 1.2; trazo(cx, r.pts, 0, r.largo); }
      if (l.corta > 0 && l.queda === 0) { cx.setLineDash([2, 5]); cx.strokeStyle = `rgba(${ROJO},${(a * 0.95).toFixed(3)})`; cx.lineWidth = 1; trazo(cx, r.pts, Math.min(r.sale, r.largo), r.largo); cx.setLineDash([]); }
    }
    // 2 · the pulses: what leaves your PC reaches its place; what GUARDIANA cut bursts in coral against the ring around you
    cx.globalCompositeOperation = 'lighter';
    for (const l of vivos) {
      const r = l.ruta, fase = semilla(l.key + '·pulso');
      if (r.cerca) {
        // a server next to you: the pulse is a ring that opens around your PC (in coral, it stops at GUARDIANA's ring)
        if (!casa) continue;
        for (const [n, rojo] of [[l.queda, false], [l.corta, true]]) {
          if (!n) continue;
          const per = 2600 + 900 * fase, f = quieto ? 0.6 : ((now + fase * per + (rojo ? per / 2 : 0)) / per) % 1;
          const rr = 6 + (rojo ? anilloR - 6 : anilloR * 1.6) * f, al = (rojo ? 0.7 : 0.55) * (1 - f) * l.a;
          cx.strokeStyle = `rgba(${rojo ? ROJO : ACENTO},${al.toFixed(3)})`; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(casa[0], casa[1], rr, 0, 7); cx.stroke();
        }
        continue;
      }
      const pts = r.pts, cola = Math.max(4, Math.round(N * 0.14));
      const tandas = (n) => (n > 0 ? Math.min(3, 1 + Math.floor(Math.log2(1 + n) / 2.2)) : 0);
      // what passes: from your PC to its place
      const nq = tandas(l.queda);
      for (let k = 0; k < nq; k++) {
        const f = quieto ? 0.62 : (((now + fase * r.periodo + k * r.periodo / nq) / r.periodo) % 1), cab = Math.min(r.largo, Math.round(f * N));
        for (let i = Math.max(1, cab - cola); i <= cab; i++) {
          const q0 = pts[i - 1], q1 = pts[i]; if (!q0 || !q1) continue;
          const v = 1 - (cab - i) / cola; if (v <= 0) continue;
          cx.strokeStyle = `rgba(${ACENTO},${((0.1 + 0.7 * v) * l.a).toFixed(3)})`; cx.lineWidth = 0.8 + 1.6 * v; cx.beginPath(); cx.moveTo(q0[0], q0[1]); cx.lineTo(q1[0], q1[1]); cx.stroke();
        }
        if (pts[cab]) cabeza(cx, pts[cab], false, l.a);
      }
      // what GUARDIANA cut: it leaves your PC and stops at the ring
      const nc = tandas(l.corta), tope = Math.max(1, r.sale);
      for (let k = 0; k < nc; k++) {
        const f = quieto ? 1 : (((now + fase * r.periodo * 0.7 + k * r.periodo * 0.7 / nc) / (r.periodo * 0.7)) % 1);
        if (f > 0.78 || quieto) { const q = pts[tope]; if (q) destello(cx, q, quieto ? 0.3 : (f - 0.78) / 0.22, l.a); continue; }
        const cab = Math.round((f / 0.78) * tope), q = pts[cab]; if (q) cabeza(cx, q, true, l.a);
      }
    }
    cx.globalCompositeOperation = 'source-over';
    // 3 · GUARDIANA's ring around your PC, while there is something cut
    if (casa && E.aRing > 0.01) {
      const rr = anilloR * (0.7 + 0.3 * E.aRing);
      cx.strokeStyle = `rgba(${ACENTO},${(0.2 * E.aRing).toFixed(3)})`; cx.lineWidth = 7; cx.beginPath(); cx.arc(casa[0], casa[1], rr, 0, 7); cx.stroke();
      cx.strokeStyle = `rgba(${BLANCO},${(0.8 * E.aRing).toFixed(3)})`; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(casa[0], casa[1], rr, 0, 7); cx.stroke();
      CAJAS.push([casa[0] - rr, casa[1] - rr, casa[0] + rr, casa[1] + rr]);
    }
    // 4 · a dot where each server is: white where something passes, coral where all of it was cut
    for (const l of vivos) {
      if (!l.q || l.ruta.cerca) continue;
      const crece = l.ruta.largo / N; if (crece < 0.98) continue; // the dot appears when its arc arrives
      const solo = l.queda === 0;
      cx.fillStyle = solo ? `rgba(${ROJO},${(0.75 * l.a).toFixed(3)})` : `rgba(${BLANCO},${(0.92 * l.a).toFixed(3)})`;
      cx.beginPath(); cx.arc(l.q[0], l.q[1], l.rv, 0, 7); cx.fill();
      if (!solo) { cx.strokeStyle = `rgba(${ACENTO},${(0.35 * l.a).toFixed(3)})`; cx.lineWidth = 3; cx.beginPath(); cx.arc(l.q[0], l.q[1], l.rv + 2.5, 0, 7); cx.stroke(); }
    }
    // 5 · the names: your PC, and only the biggest companies, at the place where most of each one goes; never over a dot
    for (const l of vivos) if (l.q && !l.ruta.cerca && l.ruta.largo >= N) CAJAS.push([l.q[0] - l.rv - 2, l.q[1] - l.rv - 2, l.q[0] + l.rv + 2, l.q[1] + l.rv + 2]);
    if (casa) etiqueta(cx, casa[0], casa[1], anilloR + 8, L.aprox || !L.nombre ? T('Tu PC') : T('Tu PC') + ' · ' + corto(String(L.nombre), 28), true, null, G.W);
    if (E.res) {
      const K = G.W >= 1200 ? 5 : G.W >= 760 ? 4 : 3, porLugar = new Map();
      const top = [...E.res.empresas.values()].sort((a, b) => b.n - a.n || a.nombre.localeCompare(b.nombre)).slice(0, K);
      for (const em of top) {
        let mejor = null, mv = -1;
        for (const l of vivos) { if (l.t1) continue; const x = l.empresas.get(em.nombre); if (x && x.n > mv) { mv = x.n; mejor = l; } }
        if (!mejor) continue;
        if (!porLugar.has(mejor)) porLugar.set(mejor, []);
        porLugar.get(mejor).push(em);
      }
      for (const [l, ems] of porLugar) {
        const q = l.ruta.cerca ? casa : l.q; if (!q || (!l.ruta.cerca && l.ruta.largo < N)) continue;
        const donde = l.ciudad || (l.pais ? paisNombre(l.pais) : '');
        const cortadas = ems.every((em) => { const x = l.empresas.get(em.nombre); return x && x.corta >= x.n; });
        const txt = corto(ems.map((em) => em.nombre).join(', '), 34) + (donde ? ' · ' + corto(donde, 22) : '');
        etiqueta(cx, q[0], q[1] + (l.ruta.cerca ? 18 : 0), (l.ruta.cerca ? anilloR : l.rv) + 7, txt, false, cortadas ? `rgba(${ROJO},.95)` : null, G.W);
      }
    }
    cx.restore();
  }

  // ---------- the camera: one glide to a view that holds your PC and the places, when the first answer arrives ----------
  let cam = null;
  function encuadra() {
    const p = P(); if (!p || !E || !E.res || typeof p.ir !== 'function') return; const L = p.lugar; if (!L) return;
    let s = [0, 0, 0], peso = 0;
    for (const l of E.res.lugares.values()) { const v = vec(l.lon, l.lat), k = Math.sqrt(l.n); peso += k; s = s.map((x, i) => x + v[i] * k); }
    const c = vec(L.lon, L.lat), kc = Math.max(1, peso * 0.7); s = s.map((x, i) => x + c[i] * kc); // your PC weighs as much as most of the rest: it stays in view
    const n = Math.hypot(s[0], s[1], s[2]) || 1, lon = Math.atan2(s[0], s[2]) / RAD;
    // on a phone the panel is a sheet from the bottom: the view looks a little further south, so the places stay above it
    const lat = Math.asin(s[1] / n) / RAD - (innerWidth <= 760 ? 16 : 0);
    const d = p.vista || { lon, lat }; cam = { lon0: d.lon, lat0: d.lat, lon, lat: Math.max(-35, Math.min(45, lat)), t0: performance.now(), dur: reducido() ? 1 : 1500 };
    requestAnimationFrame(mueve);
  }
  function mueve(now) {
    if (!cam || !E) { cam = null; return; } const p = P(); if (!p) return;
    const k = Math.min(1, (now - cam.t0) / cam.dur), s = suave(k), dl = ((cam.lon - cam.lon0) % 360 + 540) % 360 - 180;
    p.ir(cam.lon0 + dl * s, cam.lat0 + (cam.lat - cam.lat0) * s, 1);
    if (k < 1) requestAnimationFrame(mueve); else cam = null;
  }

  // ---------- the panel ----------
  let hud = null;
  function crea(tag, cls, s) { const e = document.createElement(tag); if (cls) e.className = cls; if (s != null) pon(e, s); return e; }
  // Spanish in the page; static/idioma.js shows it in the language on screen and keeps the original for the next change
  function pon(el, s) { if (el.dataset.es !== s) { el.dataset.es = s; el.textContent = s; } }
  function montaHud() {
    if (hud) return hud;
    hud = crea('section', 'tupc-hud'); hud.id = 'tupc'; hud.hidden = true; hud.tabIndex = -1;
    hud.setAttribute('role', 'dialog'); hud.setAttribute('aria-labelledby', 'tupc-t');
    const cab = crea('div', 'cab'), k = crea('div', 'k'), vivo = crea('i', 'vivo'); vivo.setAttribute('aria-hidden', 'true');
    const sep = crea('span', 'sep'); sep.textContent = '·'; sep.setAttribute('aria-hidden', 'true');
    k.append(vivo, crea('span', '', 'Tu PC'), sep, crea('span', '', 'En directo'));
    const x = document.createElement('button'); x.type = 'button'; x.className = 'cerrar'; x.innerHTML = X; x.setAttribute('aria-label', 'Cerrar'); x.title = 'Cerrar';
    x.addEventListener('click', cierra);
    cab.append(k, x);
    const t = crea('h2', 't', 'Con quién habla tu PC'); t.id = 'tupc-t'; t.tabIndex = -1;
    const estado = crea('p', 'estado'); estado.setAttribute('role', 'status'); estado.setAttribute('aria-live', 'polite');
    const cifras = crea('div', 'cifras'); cifras.hidden = true;
    for (const [s, c] of [['conexiones', 'c1'], ['empresas', 'c2'], ['países', 'c3'], ['cortadas', 'c4 rojo']]) {
      const d = crea('div', c), b = crea('b'); b.setAttribute('translate', 'no'); d.append(b, crea('span', '', s)); cifras.append(d);
    }
    const emp = crea('div', 'empresas'); emp.hidden = true;
    const ol = crea('ol'); ol.setAttribute('aria-label', 'Empresas');
    emp.append(crea('div', 'k2', 'Empresas'), ol);
    const notas = crea('div', 'notas'), sin = crea('p', 'sin-lugar', NOTA_SIN); sin.hidden = true;
    notas.append(sin, crea('p', '', NOTA_LUGAR), crea('p', '', NOTA_AQUI));
    hud.append(cab, t, estado, cifras, emp, notas);
    document.body.append(hud);
    return hud;
  }
  // the counters glide to their new value
  function cuenta(el, a) {
    const de = Number(el.dataset.v || 0); el.dataset.v = a; const t0 = performance.now();
    if (reducido() || de === a) { el.textContent = num(a); return; }
    const f = (now) => { const k = Math.min(1, (now - t0) / 750); el.textContent = num(Math.round(de + (a - de) * suave(k))); if (k < 1 && el.dataset.v == a) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  const horaDe = (ms) => { try { return new Date(ms).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (_) { return new Date(ms).toTimeString().slice(0, 8); } };
  function pintaEstado() {
    if (!hud || !E) return;
    const est = hud.querySelector('.estado'), ahora = Date.now(), r = E.res;
    let linea = '', nota = '';
    if (!r) { linea = 'Esperando al programa…'; if (ahora - E.t0 > TARDA) nota = 'Todavía no ha respondido; se vuelve a preguntar cada 5 segundos.'; }
    else if (!r.total) linea = 'Todavía no hay conexiones que mostrar en este momento.';
    const mudo = !!(r && ahora - E.ultima > MUDO && ahora - E.visible > 4000);
    hud.classList.toggle('mudo', !r || mudo);
    // written only when it changes, so a screen reader hears each change once
    const clave = [linea, nota, mudo ? E.ultima : 0, lang()].join('|');
    if (est.dataset.clave === clave) return; est.dataset.clave = clave;
    est.textContent = '';
    if (linea) est.append(crea('span', '', linea));
    if (nota) est.append(crea('small', '', nota));
    if (mudo) { const s = crea('small'), h = crea('time'); h.setAttribute('translate', 'no'); h.textContent = ' ' + horaDe(E.ultima); s.append(crea('span', '', 'Sin respuesta del programa desde las'), h); est.append(s); }
    est.hidden = !est.childNodes.length;
  }
  function rellena(li, em, nueva) {
    if (nueva) {
      li.innerHTML = '<div class="fila"><b></b><em hidden></em><span class="v" translate="no"></span></div><small><span class="tp-pais" translate="no"></span><span class="tp-prog" translate="no"></span></small>';
    }
    const b = li.querySelector('b'), marca = li.querySelector('em'), v = li.querySelector('.v');
    if (em.nombre) { b.setAttribute('translate', 'no'); if (b.textContent !== em.nombre) { delete b.dataset.es; b.textContent = em.nombre; } }
    else { b.removeAttribute('translate'); pon(b, 'Sin empresa identificada'); }
    const todo = em.corta > 0 && em.queda === 0, parte = em.corta > 0 && em.queda > 0;
    marca.hidden = !(todo || parte); marca.classList.toggle('parte', parte);
    if (todo || parte) pon(marca, todo ? 'Cortada' : 'Cortada en parte');
    li.classList.toggle('cortada', todo);
    const nv = num(em.n);
    if (v.textContent !== nv) { if (!nueva && v.textContent) { v.classList.remove('sube'); void v.offsetWidth; v.classList.add('sube'); } v.textContent = nv; }
    const paises = [...em.paises.entries()].sort((a, c) => c[1] - a[1]).map(([c]) => paisNombre(c));
    const progs = [...em.progs.entries()].sort((a, c) => c[1] - a[1]).map(([g]) => g);
    const donde = paises.length > 2 ? paises.slice(0, 2).join(', ') + ' +' + (paises.length - 2) : paises.join(', ');
    const quien = progs.length > 3 ? progs.slice(0, 3).join(', ') + ' +' + (progs.length - 3) : progs.join(', ');
    const d = li.querySelector('.tp-pais'), g = li.querySelector('.tp-prog');
    if (d.textContent !== donde) d.textContent = donde;
    const gq = (donde && quien ? ' · ' : '') + quien; if (g.textContent !== gq) g.textContent = gq;
    const titulo = [paises.join(', '), progs.join(', ')].filter(Boolean).join(' · ');
    if (li.title !== titulo) li.title = titulo;
  }
  // the list keeps its rows: a company that stays is updated where it is and glides to its new place; a new one fades in
  function pintaLista() {
    const ol = hud.querySelector('.empresas ol'), r = E.res, quieto = reducido();
    const filas = [...r.empresas.values()].sort((a, b) => b.n - a.n || a.nombre.localeCompare(b.nombre));
    if (r.sinEmpresa) filas.push(r.sinEmpresa);
    const viejas = new Map(); for (const li of ol.children) viejas.set(li.dataset.k, li);
    const antes = new Map(); if (!quieto && !hud.hidden) for (const [k, li] of viejas) antes.set(k, li.getBoundingClientRect().top);
    const filasLi = filas.map((em) => {
      const k = em.nombre ? 'e:' + em.nombre : 'sin';
      let li = viejas.get(k); const nueva = !li;
      if (nueva) { li = document.createElement('li'); li.dataset.k = k; if (!quieto && E.lista) li.classList.add('nueva'); }
      viejas.delete(k); rellena(li, em, nueva); return li;
    });
    for (const li of viejas.values()) li.remove();
    filasLi.forEach((li, i) => { if (ol.children[i] !== li) ol.insertBefore(li, ol.children[i] || null); });
    E.lista = true;
    if (quieto) return;
    for (const li of filasLi) {
      const y0 = antes.get(li.dataset.k); if (y0 == null) continue;
      const dy = y0 - li.getBoundingClientRect().top; if (Math.abs(dy) < 1) continue;
      li.style.transition = 'none'; li.style.transform = `translateY(${dy.toFixed(1)}px)`;
      requestAnimationFrame(() => requestAnimationFrame(() => { li.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)'; li.style.transform = ''; }));
    }
  }
  function pintaHud() {
    if (!hud || !E) return;
    const r = E.res, hay = !!(r && r.total);
    hud.querySelector('.cifras').hidden = !hay; hud.querySelector('.empresas').hidden = !hay;
    if (hay) {
      const c = [r.conexiones, r.empresas.size, r.paises.size, r.cortadas];
      ['.c1', '.c2', '.c3', '.c4'].forEach((s, i) => cuenta(hud.querySelector(s + ' b'), c[i]));
      pintaLista();
    }
    hud.querySelector('.sin-lugar').hidden = !(r && r.sinLugar > 0);
    pintaEstado();
  }
  // the panel's box, so no name on the planet goes under it
  function midePanel() { if (!E || !hud || hud.hidden) return; const b = hud.getBoundingClientRect(); E.caja = b.width ? [b.left - 6, b.top - 6, b.right + 6, b.bottom + 6] : null; }

  // ---------- asking the program, and its answers ----------
  function pide() { if (!E) return; E.pedido = Date.now(); try { document.dispatchEvent(new Event('guardiana-pc-pide')); } catch (_) {} }
  function late() {
    if (!E) return;
    // every five seconds while the view is open and in sight (not while NÚCLEO covers the planet)
    if (!document.hidden && !window.OrbitaTapada && Date.now() - E.pedido >= CADA - 60) pide();
    pintaEstado(); midePanel();
  }
  function arrancaReloj() { paraReloj(); if (E) E.reloj = setInterval(late, 1000); }
  function paraReloj() { if (E && E.reloj) { clearInterval(E.reloj); E.reloj = 0; } }
  function recibe(e) {
    if (!E) return;
    let j = e && e.detail;
    if (typeof j === 'string') { if (j.length > 4e6) return; try { j = JSON.parse(j); } catch (_) { return; } }
    if (!j || typeof j !== 'object' || Array.isArray(j) || !Array.isArray(j.destinos)) return;
    const lista = j.destinos.slice(0, 400).map(limpia).filter(Boolean);
    E.ultima = Date.now();
    aplica(lista);
  }
  function aplica(lista) {
    const res = resume(lista), ahora = performance.now(), vistos = new Set();
    E.res = res;
    for (const nl of res.lugares.values()) {
      vistos.add(nl.key);
      const rObj = 2.2 + Math.min(4.8, Math.log2(1 + nl.n) * 0.75);
      const l = E.lugares.get(nl.key);
      if (l) { Object.assign(l, { n: nl.n, corta: nl.corta, queda: nl.queda, empresas: nl.empresas, ciudad: nl.ciudad, pais: nl.pais, rObj, t1: 0 }); }
      else { Object.assign(nl, { t0: ahora, t1: 0, a: 0, rv: 0, rObj, ruta: null, q: null }); E.lugares.set(nl.key, nl); }
    }
    for (const [k, l] of E.lugares) if (!vistos.has(k) && !l.t1) l.t1 = ahora;
    pintaHud();
    if (!E.enfocado && !E.movido && res.lugares.size) { E.enfocado = true; encuadra(); }
  }

  // ---------- opening and closing ----------
  const OTRA = /\b(dentro|viaje|en-espejo|con-conexion|en-radio)\b/;    // another view takes the planet: this one steps aside
  const CON_SU_DIBUJO = /\b(en-espejo|viaje|con-conexion)\b/;           // …and these draw on it themselves
  let enganchado = false;
  function engancha() {
    if (enganchado) return; enganchado = true;
    document.addEventListener('guardiana-pc', recibe);
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !E) return;
      const l = $('lugar'); if (l && !l.hidden) return;                   // the place dialog closes first
      if (document.querySelector('.idioma-menu:not([hidden])')) return;   // and the list of languages
      e.preventDefault(); cierra();
    });
    document.addEventListener('visibilitychange', () => {
      if (!E) return;
      if (document.hidden) paraReloj(); else { E.visible = Date.now(); arrancaReloj(); if (Date.now() - E.pedido > 1500) pide(); }
    });
    new MutationObserver(() => { if (E && OTRA.test(document.body.className)) cierra(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // «Ver mi conexión» holds the planet too: this view closes before it opens
    document.addEventListener('click', (e) => { if (E && e.target && e.target.closest && e.target.closest('#conexion-btn')) cierra(); }, true);
    // the person takes the planet: the camera lets go at once, and does not come back to frame it
    ['pointerdown', 'wheel'].forEach((ev) => addEventListener(ev, (e) => { if (!E || (e.target && e.target.closest && e.target.closest('.tupc-hud'))) return; cam = null; E.movido = true; }, { passive: true, capture: true }));
    addEventListener('guardiana-idioma', () => { if (E) { pintaHud(); const est = hud && hud.querySelector('.estado'); if (est) { est.dataset.clave = ''; pintaEstado(); } } });
    addEventListener('resize', midePanel);
  }
  function abre() {
    if (!enPrograma()) return false; // only the program can see the computer's connections
    if (E) { pide(); return true; }
    if (document.body.classList.contains('viaje') || document.body.classList.contains('dentro')) return false;
    if (!P()) return false;
    engancha();
    // the other views that hold the planet step aside first
    if (window.OrbitaEspejo && window.OrbitaEspejo.activo) { try { window.OrbitaEspejo.cierra(); } catch (_) {} }
    const pc = $('conexion'); if (pc && !pc.hidden && window.OrbitaConexion) { try { window.OrbitaConexion.abre(false); } catch (_) {} }
    if (window.OrbitaRadiografias && window.OrbitaRadiografias.abierto) { try { window.OrbitaRadiografias.cierra(); } catch (_) {} }
    const ahora = Date.now();
    E = { t0: ahora, visible: ahora, pedido: 0, ultima: 0, res: null, lugares: new Map(), lk: '', enfocado: false, movido: false, antes: document.activeElement, reloj: 0, tPrev: 0, lista: false, aRing: 0, caja: null };
    montaHud(); hud.hidden = false; hud.classList.remove('sale');
    const est = hud.querySelector('.estado'); est.dataset.clave = '';
    for (const b of hud.querySelectorAll('.cifras b')) { b.dataset.v = 0; b.textContent = ''; }
    hud.querySelector('.empresas ol').textContent = '';
    pintaHud();
    document.body.classList.add('en-tupc');
    if (boton) boton.setAttribute('aria-pressed', 'true');
    if (window.OrbitaCapas) window.OrbitaCapas.soloTu(true, pinta);
    arrancaReloj(); pide();
    requestAnimationFrame(midePanel);
    setTimeout(() => { if (E && hud && !hud.hidden) { const h = hud.querySelector('.t'); (h && getComputedStyle(h).display !== 'none' ? h : hud).focus({ preventScroll: true }); } }, 450);
    return true;
  }
  function cierra() {
    if (!E) return;
    const antes = E.antes, dentro = !!(hud && hud.contains(document.activeElement));
    paraReloj(); E = null; cam = null;
    if (hud) { hud.classList.add('sale'); setTimeout(() => { if (!E && hud) { hud.hidden = true; hud.classList.remove('sale'); } }, 260); }
    document.body.classList.remove('en-tupc');
    if (window.OrbitaCapas && !CON_SU_DIBUJO.test(document.body.className)) window.OrbitaCapas.soloTu(false);
    if (boton) boton.setAttribute('aria-pressed', 'false');
    // the focus goes back where it was (or to «Tu PC», or to a door, or to «Inicio»), never lost in a closed panel
    if (dentro) setTimeout(() => {
      const ve = (el) => !!(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
      const v = [antes, boton, document.querySelector('#puertas .puerta button'), $('volver')].find(ve);
      if (v) v.focus({ preventScroll: true });
    }, 300);
  }
  // ---------- the way in from the planet, inside the program: «Tu PC» in the header, where the web has «Conocer GUARDIANA»
  //            (which the program hides; the header keeps its measure). On a computer the ring of doors is hidden since
  //            NÚCLEO (nucleo.css), so without this the view would only open from /orbita/#radiografias. Outside the program
  //            there is no button. ----------
  let boton = null;
  function ponBoton() {
    const marca = document.querySelector('header .izq .marca');
    if (!enPrograma()) { if (boton) { boton.remove(); boton = null; } return; }
    if (boton || !marca) return;
    boton = document.createElement('button'); boton.type = 'button'; boton.id = 'tupc-btn'; boton.className = 'lugar-btn tupc-btn';
    boton.setAttribute('aria-pressed', E ? 'true' : 'false'); boton.setAttribute('aria-controls', 'tupc');
    boton.innerHTML = '<i aria-hidden="true"></i><span></span>'; pon(boton.querySelector('span'), 'Tu PC');
    boton.addEventListener('click', () => { if (E) cierra(); else abre(); });
    marca.after(boton);
  }
  ponBoton();
  // and if the program marks the page a moment later
  try { new MutationObserver(ponBoton).observe(document.documentElement, { attributes: true, attributeFilter: ['data-en-programa'] }); } catch (_) {}
  window.OrbitaTuPC = { abre, cierra, get activo() { return !!E; } };
})();
