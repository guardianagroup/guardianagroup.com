/* GUARDIANA · Órbita · «Tu llamada en Órbita» (15 Nov 2026; el dueño, 22:57: «¿Cómo se va a ver cuando quieran ver la
   llamada en órbita?», y 23:23: «SÍ»). Durante una llamada Ultra, «Ver en Órbita» en el Monitor de seguridad abre esta página
   con #llamada y el planeta enseña solo la llamada: tu dispositivo (donde Órbita sitúa este equipo, aproximado si no se ha
   precisado), el servidor de GUARDIANA que la reenvía y la otra persona, sin lugar: la línea sube al espacio, nunca hacia un
   país. Los paquetes encriptados circulan en los dos sentidos y el panel repite el monitor de la llamada.
   Los datos los manda la pestaña de la llamada (BroadcastChannel «guardiana-llamada»: mismo origen, no salen del navegador),
   una vez por segundo y ya en su idioma. Nada se inventa: mientras no llega nada, la vista lo dice; si deja de llegar, también;
   al colgar, «La llamada ha terminado». La línea une tu dispositivo con el servidor: no es el camino exacto de los cables, y el
   panel lo dice. Solo en el PC (en el teléfono no hay Órbita). */
(function () {
  'use strict';
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const P = () => window.OrbitaPlaneta;
  const RAD = Math.PI / 180;
  const ACENTO = '156,195,228', VERDE = '92,201,138', BLANCO = '244,246,248';
  // los servidores de llamadas de GUARDIANA (los del relé de Comunicaciones), por su clave en la llamada
  const SERVIDORES = { eu: { lat: 49.4521, lon: 11.0767 }, am: { lat: 25.7617, lon: -80.1918 } };
  const MUDO = 6000; // ms sin noticias de la llamada antes de decirlo
  const reducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const vec = (lon, lat) => { const a = lat * RAD, b = lon * RAD; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
  const ang = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  function slerp(a, b, t) { const om = ang(a, b), so = Math.sin(om); if (so < 1e-6) return a.slice(); const ka = Math.sin((1 - t) * om) / so, kb = Math.sin(t * om) / so; return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]; }
  const N = 72;
  // el arco entre dos lugares, levantado en el medio (más cuanto más largo)
  function arco(A, B) {
    const a = vec(A.lon, A.lat), b = vec(B.lon, B.lat), om = ang(a, b), h = 0.035 + 0.2 * Math.min(1, om / Math.PI), w = [];
    for (let i = 0; i <= N; i++) { const t = i / N, p = slerp(a, b, t), k = 1.004 + h * Math.sin(Math.PI * t); w.push([p[0] * k, p[1] * k, p[2] * k]); }
    return w;
  }
  const crea = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = T(txt); return e; };
  // lo que llega de la otra pestaña se lee como texto, recortado; nunca como HTML
  const RARO = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;
  const tx = (x, max) => (typeof x === 'string' ? x.replace(RARO, '').trim().slice(0, max || 120) : '');

  // ---------- el estado ----------
  // L = { datos (lo último de la llamada, limpio), t (cuándo llegó), fin, w (el arco), lk }
  let L = null, hud = null, reloj = null;
  const fuente = () => { const f = getComputedStyle(document.body).fontFamily; return f && f !== 'serif' ? f : 'system-ui, sans-serif'; };
  function limpia(d) {
    if (!d || typeof d !== 'object' || d.v !== 1) return null;
    const NIV = { ok: 1, aviso: 1, alerta: 1, neutro: 1 };
    const filas = Array.isArray(d.filas) ? d.filas.slice(0, 14).filter((f) => Array.isArray(f) && f.length === 4).map((f) => [tx(f[0], 20), NIV[f[1]] ? f[1] : 'neutro', tx(f[2], 80), tx(f[3], 120)]) : [];
    return {
      nivel: NIV[d.nivel] ? d.nivel : 'neutro', estado: tx(d.estado, 60), hace: Number.isFinite(d.hace) ? Math.max(0, Math.min(999, Math.round(d.hace))) : null,
      filas, ruta: ['mio', 'servidor', 'directa'].includes(d.ruta) ? d.ruta : '', servidor: SERVIDORES[d.servidor] ? d.servidor : '',
      ciudad: tx(d.ciudad, 60), guardiana: d.guardiana !== false, envio: tx(d.envio, 24), recep: tx(d.recep, 24), ida: tx(d.ida, 16),
    };
  }

  // ---------- el dibujo, en el modo limpio del planeta (OrbitaCapas.soloTu) ----------
  function punto(p, G, w) { const v = p.aVista(w); return { x: G.CX + G.R * v[0], y: G.CY - G.R * v[1], ve: v[2] > 0.02 || (w[0] * w[0] + w[1] * w[1] + w[2] * w[2] > 1.02 && v[0] * v[0] + v[1] * v[1] > 1) }; }
  function etiqueta(cx, x, y, titulo, sub, lado) {
    cx.save(); cx.globalCompositeOperation = 'source-over';
    const f = fuente(); cx.font = '600 13px ' + f; const w1 = cx.measureText(titulo).width; cx.font = '400 11.5px ' + f; const w2 = sub ? cx.measureText(sub).width : 0;
    const w = Math.max(w1, w2) + 22, h = sub ? 42 : 26, bx = lado < 0 ? x - w - 16 : x + 16, by = y - h / 2;
    cx.fillStyle = 'rgba(9,13,19,.82)'; cx.strokeStyle = 'rgba(156,195,228,.28)'; cx.lineWidth = 1;
    cx.beginPath(); if (cx.roundRect) cx.roundRect(bx, by, w, h, 9); else cx.rect(bx, by, w, h); cx.fill(); cx.stroke();
    const rtl = document.documentElement.dir === 'rtl'; cx.direction = rtl ? 'rtl' : 'ltr'; cx.textAlign = rtl ? 'right' : 'left'; cx.textBaseline = 'top';
    const x0 = rtl ? bx + w - 11 : bx + 11;
    cx.fillStyle = `rgb(${BLANCO})`; cx.font = '600 13px ' + f; cx.fillText(titulo, x0, by + 7);
    if (sub) { cx.fillStyle = 'rgba(244,246,248,.6)'; cx.font = '400 11.5px ' + f; cx.fillText(sub, x0, by + 24); }
    cx.restore();
  }
  function nodo(cx, x, y, r, rgb, t, fase, vivo) {
    const g = cx.createRadialGradient(x, y, 0, x, y, r * 4.2); g.addColorStop(0, `rgba(${rgb},.55)`); g.addColorStop(1, `rgba(${rgb},0)`);
    cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r * 4.2, 0, 7); cx.fill();
    cx.fillStyle = `rgb(${rgb})`; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill();
    if (vivo && !reducido()) { const e = ((t * 0.55 + fase) % 1); cx.strokeStyle = `rgba(${rgb},${(0.7 * (1 - e)).toFixed(3)})`; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(x, y, r + 4 + 22 * e, 0, 7); cx.stroke(); }
  }
  // los paquetes: puntos que recorren un trazo (lista de puntos en pantalla), en un sentido o en el otro
  function paquetes(cx, pts, rgb, t, n, vel, alReves, desv) {
    if (reducido() || pts.length < 2) return;
    const largos = [0]; for (let i = 1; i < pts.length; i++) largos.push(largos[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const total = largos[largos.length - 1]; if (total < 4) return;
    for (let k = 0; k < n; k++) {
      let s = ((t * vel + k / n) % 1); if (alReves) s = 1 - s;
      const d = s * total; let i = 1; while (i < largos.length - 1 && largos[i] < d) i++;
      const a = pts[i - 1], b = pts[i], u = (d - largos[i - 1]) / Math.max(1e-6, largos[i] - largos[i - 1]);
      let x = a.x + (b.x - a.x) * u, y = a.y + (b.y - a.y) * u;
      const nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny) || 1; x += (nx / nl) * desv; y += (ny / nl) * desv;
      const borde = Math.min(1, s * 6, (1 - s) * 6);
      const g = cx.createRadialGradient(x, y, 0, x, y, 7); g.addColorStop(0, `rgba(${rgb},${(0.95 * borde).toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},0)`);
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 7, 0, 7); cx.fill();
      cx.fillStyle = `rgba(${BLANCO},${(0.9 * borde).toFixed(3)})`; cx.beginPath(); cx.arc(x, y, 1.6, 0, 7); cx.fill();
    }
  }
  function trazo(cx, pts, rgb, a, ancho, guiones) {
    if (pts.length < 2) return;
    cx.save(); if (guiones) cx.setLineDash(guiones);
    cx.strokeStyle = `rgba(${rgb},${a})`; cx.lineWidth = ancho; cx.beginPath(); cx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i].x, pts[i].y);
    cx.stroke(); cx.restore();
  }
  // del punto `s` (en pantalla) hacia fuera del planeta: del centro a través de él, un poco hacia arriba; acaba en el espacio
  function subida(G, s) {
    let dx = s.x - G.CX, dy = s.y - G.CY; const dl = Math.hypot(dx, dy);
    if (dl < G.R * 0.2) { dx = 0.45; dy = -1; } else { dx /= dl; dy /= dl; dy -= 0.35; }
    const nl = Math.hypot(dx, dy); dx /= nl; dy /= nl;
    const ox = G.CX + dx * G.R * 1.34, oy = G.CY + dy * G.R * 1.34;
    const c1 = { x: s.x + dx * G.R * 0.18 - dy * G.R * 0.06, y: s.y + dy * G.R * 0.18 + dx * G.R * 0.06 }, ruta = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40, m = 1 - u; ruta.push({ x: m * m * s.x + 2 * m * u * c1.x + u * u * ox, y: m * m * s.y + 2 * m * u * c1.y + u * u * oy }); }
    return { ruta, o: { x: ox, y: oy } };
  }
  function pinta(cx, p, G, t) {
    if (!L) return;
    const yo = p.lugar; if (!yo) return;
    const d = L.datos, vivo = !!d && !L.fin && performance.now() - L.t < MUDO;
    const S = d && d.servidor ? SERVIDORES[d.servidor] : null;
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round'; cx.lineJoin = 'round';
    const a = punto(p, G, vec(yo.lon, yo.lat).map((c) => c * 1.004));
    let s = null, desde = a;
    // 1 · tu dispositivo → el servidor (si la llamada pasa por uno de GUARDIANA de este lado): el arco y sus paquetes
    if (S) {
      const lk = yo.lon.toFixed(3) + ',' + yo.lat.toFixed(3) + ',' + d.servidor;
      if (!L.w || L.lk !== lk) { L.lk = lk; L.w = arco(yo, S); }
      const pts = []; for (const w of L.w) { const q = punto(p, G, w); if (q.ve) pts.push(q); else if (pts.length) break; }
      trazo(cx, pts, ACENTO, vivo ? 0.18 : 0.08, 7); trazo(cx, pts, ACENTO, vivo ? 0.75 : 0.3, 1.6);
      if (vivo) { paquetes(cx, pts, ACENTO, t, 4, 0.32, false, -3.2); paquetes(cx, pts, VERDE, t, 4, 0.32, true, 3.2); }
      s = punto(p, G, vec(S.lon, S.lat).map((c) => c * 1.004)); desde = s;
    }
    // 2 · hacia la otra persona: sube al espacio desde el servidor (o desde tu dispositivo), hacia ningún país
    let o = null;
    if (d && desde.ve) {
      const sb = subida(G, desde);
      trazo(cx, sb.ruta, ACENTO, vivo ? 0.12 : 0.06, 6); trazo(cx, sb.ruta, ACENTO, vivo ? 0.55 : 0.25, 1.4, [3, 6]);
      if (vivo) { paquetes(cx, sb.ruta, ACENTO, t, 3, 0.4, false, -3); paquetes(cx, sb.ruta, VERDE, t, 3, 0.4, true, 3); }
      o = sb.o;
      cx.save(); cx.globalCompositeOperation = 'source-over';
      cx.strokeStyle = `rgba(${ACENTO},.8)`; cx.lineWidth = 1.5; cx.setLineDash([3, 4]); cx.beginPath(); cx.arc(o.x, o.y, 12, 0, 7); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = `rgba(${ACENTO},.9)`; cx.beginPath(); cx.arc(o.x, o.y - 2.5, 3.2, 0, 7); cx.fill();
      cx.beginPath(); cx.arc(o.x, o.y + 6.5, 5.5, Math.PI, 0); cx.fill();
      cx.restore();
    }
    // 3 · los puntos y sus rótulos
    if (a.ve) nodo(cx, a.x, a.y, 4.5, ACENTO, t, 0, vivo);
    if (s && s.ve) nodo(cx, s.x, s.y, 4.5, VERDE, t, 0.5, vivo);
    cx.restore();
    if (a.ve) etiqueta(cx, a.x, a.y, T('Tu dispositivo'), yo.aprox ? T('Ubicación aproximada') : (yo.nombre || ''), a.x < (s && s.ve ? s.x : G.CX) ? -1 : 1);
    if (s && s.ve) etiqueta(cx, s.x, s.y + 30, d.guardiana ? T('Servidor de GUARDIANA') : T('Servidor'), d.ciudad, s.x >= (a.ve ? a.x : G.CX) ? 1 : -1);
    if (o) etiqueta(cx, o.x, o.y, T('La otra persona'), T('Su ubicación no se muestra'), o.x < G.CX ? -1 : 1);
  }

  // ---------- el panel ----------
  function pintaHud() {
    if (!hud || !L) return;
    const d = L.datos, yo = P() && P().lugar, mudo = !!d && !L.fin && performance.now() - L.t >= MUDO;
    hud.classList.toggle('mudo', !d || mudo || L.fin);
    const nv = hud.querySelector('.llorb-nivel'), ha = hud.querySelector('.llorb-hace');
    nv.className = 'llorb-nivel' + (d && !mudo && !L.fin ? ' ' + d.nivel : '');
    if (L.fin) { nv.textContent = T('La llamada ha terminado.'); ha.textContent = ''; }
    else if (!d) { nv.textContent = T('Esperando los datos de la llamada…'); ha.textContent = ''; }
    else if (mudo) { nv.textContent = T('Sin datos de la llamada desde hace {s} s').replace('{s}', String(Math.round((performance.now() - L.t) / 1000))); ha.textContent = ''; }
    else { nv.textContent = d.estado || ''; ha.textContent = d.hace != null ? ' · ' + T('comprobado hace {s} s').replace('{s}', String(d.hace)) : ''; }
    // la ruta: tres puntos (o dos, si no hay servidor de este lado)
    const r = hud.querySelector('.llorb-ruta'); r.textContent = '';
    const pasos = [['yo', 'Tu dispositivo', yo ? (yo.aprox ? T('{p}, aproximado').replace('{p}', yo.nombre || '') : yo.nombre || '') : '']];
    if (d && d.servidor) pasos.push(['serv', d.guardiana ? 'Servidor de GUARDIANA' : 'Servidor', d.ciudad]);
    pasos.push(['otro', 'La otra persona', T('Su ubicación no se muestra')]);
    for (const [cls, b, s] of pasos) { const li = crea('li', cls); const i = crea('i'); i.setAttribute('aria-hidden', 'true'); li.append(i, crea('b', null, b)); const sp = document.createElement('span'); sp.textContent = s; li.append(sp); r.append(li); }
    const c = hud.querySelector('.llorb-cifras'); c.textContent = ''; c.hidden = !d;
    if (d) for (const [v, k] of [[d.envio || '—', 'Enviando'], [d.recep || '—', 'Recibiendo'], [d.ida || '—', 'Ida y vuelta']]) { const div = crea('div'); const b = document.createElement('b'); b.textContent = v; div.append(b, crea('span', null, k)); c.append(div); }
    const ul = hud.querySelector('.llorb-l'); ul.textContent = ''; ul.hidden = !d || L.fin;
    if (d) for (const [, nivel, b, s] of d.filas) { const li = crea('li', 'llorb-' + nivel); const i = crea('i'); i.setAttribute('aria-hidden', 'true'); const bb = document.createElement('b'); bb.textContent = b; const sp = document.createElement('span'); sp.textContent = s; li.append(i, bb, sp); ul.append(li); }
    const ns = hud.querySelector('.llorb-nota-serv'); if (ns) ns.hidden = !(d && d.servidor); // sin servidor de este lado, la nota del servidor sobra
    const vb = hud.querySelector('.llorb-volver'); vb.textContent = T(L.fin ? 'Cerrar' : 'Volver a la llamada');
  }
  function montaHud() {
    if (hud) return;
    hud = crea('section', 'llorb-hud'); hud.id = 'llorb'; hud.setAttribute('aria-labelledby', 'llorb-t');
    const cab = crea('div', 'cab'), k = crea('p', 'k'), vivo = crea('i', 'vivo'); vivo.setAttribute('aria-hidden', 'true');
    k.append(vivo, crea('span', null, 'Llamada Ultra'), crea('span', 'sep', '·'), crea('span', null, 'En directo'));
    const x = crea('button', 'llorb-x'); x.type = 'button'; x.setAttribute('aria-label', T('Cerrar')); x.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
    x.addEventListener('click', () => cierra(true));
    cab.append(k, x);
    const titulo = crea('h2', 't', 'Tu llamada en Órbita'); titulo.id = 'llorb-t'; titulo.tabIndex = -1;
    const est = crea('p', 'llorb-est'); est.setAttribute('role', 'status'); est.append(crea('b', 'llorb-nivel'), crea('span', 'llorb-hace'));
    const ruta = crea('ol', 'llorb-ruta'), cifras = crea('div', 'llorb-cifras'), ul = crea('ul', 'llorb-l');
    const notas = crea('div', 'llorb-notas');
    notas.append(crea('p', 'llorb-nota-serv', 'La línea une tu dispositivo con el servidor que reenvía la llamada; no es el camino exacto de los cables.'), crea('p', null, 'De la otra persona nunca se muestra dónde está.'));
    const volver = crea('button', 'llorb-volver', 'Volver a la llamada'); volver.type = 'button';
    volver.addEventListener('click', () => cierra(true));
    hud.append(cab, titulo, est, ruta, cifras, ul, notas, volver);
    document.body.append(hud);
  }

  // ---------- abrir y cerrar ----------
  let canal = null;
  // el encuadre: tu lugar y el servidor a la vista (un poco al sur del punto medio, para que el arco se vea levantado)
  function encuadra(clave) {
    const p = P(), yo = p && p.lugar, S = SERVIDORES[clave]; if (!yo) return;
    if (!S) { p.ir(yo.lon, yo.lat - 10, 1.08); return; }
    const m = slerp(vec(yo.lon, yo.lat), vec(S.lon, S.lat), 0.5);
    p.ir(Math.atan2(m[0], m[2]) / RAD, Math.asin(Math.max(-1, Math.min(1, m[1]))) / RAD - 14, 1.08);
  }
  function abre() {
    const p = P(); if (!p || !window.OrbitaCapas) return false;
    if (L) return true;
    if (window.OrbitaTuPC && window.OrbitaTuPC.activo) window.OrbitaTuPC.cierra();
    L = { datos: null, t: 0, fin: false, w: null, lk: '' };
    montaHud(); pintaHud();
    document.body.classList.add('en-llamada-orbita');
    window.OrbitaCapas.soloTu(true, pinta);
    encuadra('eu');
    reloj = setInterval(pintaHud, 1000);
    try { if (canal) canal.postMessage({ v: 1, tipo: 'pide' }); } catch (_) {}
    setTimeout(() => { const h = hud && hud.querySelector('.t'); if (h) h.focus({ preventScroll: true }); }, 400);
    return true;
  }
  function recibe(datos) {
    if (!L) return;
    const antes = L.datos && L.datos.servidor;
    L.datos = datos; L.t = performance.now(); L.fin = false;
    if (datos.servidor !== antes) encuadra(datos.servidor);
    pintaHud();
  }
  function cierra(volver) {
    if (!L) return;
    L = null; clearInterval(reloj); reloj = null;
    if (hud) { hud.remove(); hud = null; }
    document.body.classList.remove('en-llamada-orbita');
    if (window.OrbitaCapas) window.OrbitaCapas.soloTu(false);
    if (location.hash === '#llamada') { try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {} }
    // abierta desde la llamada: se cierra esta pestaña y queda la de la llamada
    if (volver) { try { window.close(); } catch (_) {} }
  }
  try {
    canal = new BroadcastChannel('guardiana-llamada');
    canal.onmessage = (e) => {
      const m = e && e.data; if (!m || m.v !== 1) return;
      if (m.tipo === 'fin') { if (L) { L.fin = true; pintaHud(); } return; }
      if (m.tipo === 'estado') { const d = limpia(m); if (d) recibe(d); }
    };
  } catch (_) { canal = null; }
  // con #llamada (lo abre «Ver en Órbita»): en cuanto el planeta está, la vista; si el hash llega después, también
  function alHash() {
    if (location.hash !== '#llamada' || L) return;
    let n = 0;
    const intenta = () => { if (abre()) return; if (++n < 60) setTimeout(intenta, 250); };
    intenta();
  }
  addEventListener('hashchange', alHash);
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', alHash); else alHash();
  window.OrbitaLlamada = { abre, cierra, get activa() { return !!L; } };
})();
