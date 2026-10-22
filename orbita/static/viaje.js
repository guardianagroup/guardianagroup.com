/* GUARDIANA · Órbita · «El viaje de tus datos» (owner, 22 Oct 2026, 16:00: «no solamente un PDF… algo en 3D de lo que
   han hecho, de un continente a otro… algo distinto a todo lo que hemos visto»).
   Two pieces, both built only from what «Mi conexión» measured a moment ago (nothing invented, no cable attributed):
     · the journey: an automatic sequence on the planet itself — your city, then one pulse of light per destination,
       continent by continent, the camera following each arc, a live counter of kilometres and milliseconds, and at
       each arrival the comparison with light in a straight line (the «rodeo»); it ends with every path drawn;
     · the report: a full-page account with a 3D globe of your arcs, a compass of times (which way your data goes
       and how long it takes in each direction), the light-against-reality chart and the whole table, to keep as PDF. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const loc = () => (window.GuardianaIdioma ? window.GuardianaIdioma.locale : undefined);
  const num = (n, d) => Number.isFinite(n) ? n.toLocaleString(loc(), { maximumFractionDigits: d || 0 }) : '';
  const RAD = Math.PI / 180;
  const P = () => window.OrbitaPlaneta, C = () => window.OrbitaConexion;
  const ACENTO = '156,195,228', BLANCO = '244,246,248';

  // ---------- geometry ----------
  const vec = (lon, lat) => { const a = lat * RAD, b = lon * RAD; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
  function slerp(va, vb, t) { const d = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])), om = Math.acos(d), so = Math.sin(om) || 1e-9, ka = Math.sin((1 - t) * om) / so, kb = Math.sin(t * om) / so; return [va[0] * ka + vb[0] * kb, va[1] * ka + vb[1] * kb, va[2] * ka + vb[2] * kb]; }
  function puntoMedio(a, b, t) { const w = slerp(vec(a.lon, a.lat), vec(b.lon, b.lat), t); return { lat: Math.asin(Math.max(-1, Math.min(1, w[1]))) / RAD, lon: Math.atan2(w[0], w[2]) / RAD }; }
  const angulo = (a, b) => { const va = vec(a.lon, a.lat), vb = vec(b.lon, b.lat); return Math.acos(Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]))); };
  function rumbo(a, b) { const f1 = a.lat * RAD, f2 = b.lat * RAD, dl = (b.lon - a.lon) * RAD; const y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl); return ((Math.atan2(y, x) / RAD) + 360) % 360; }
  const continente = (region) => /^(us|ca|mx)-/.test(region) ? T('América del Norte') : /^sa-/.test(region) ? T('América del Sur') : /^eu-/.test(region) ? T('Europa') : /^(il|me)-/.test(region) ? T('Oriente Medio') : /^af-/.test(region) ? T('África') : /^ap-southeast-(2|4)/.test(region) ? T('Oceanía') : T('Asia');
  const esTactil = () => matchMedia && matchMedia('(pointer: coarse)').matches;
  const suave = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // the stops: the fastest destination of each continent, nearest first, at most six
  function paradas(r) {
    const porCont = new Map();
    for (const n of r.nubes) { const c = continente(n.region); if (!porCont.has(c) || porCont.get(c).ms > n.ms) porCont.set(c, n); }
    return [...porCont.values()].sort((a, b) => a.km - b.km).slice(0, 6);
  }

  // ---------- drawing on the planet (in «solo tú» mode) ----------
  function arcoPantalla(p, G, a, b, n, alza) {
    const va = vec(a.lon, a.lat), vb = vec(b.lon, b.lat), pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, w = slerp(va, vb, t), h = 1.004 + (alza || 0) * Math.sin(Math.PI * t); const v = p.aVista([w[0] * h, w[1] * h, w[2] * h]); pts.push(v[2] > 0.02 ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null); }
    return pts;
  }
  function trazo(cx, pts, desde, hasta) {
    let prev = false; cx.beginPath();
    for (let i = desde; i <= hasta; i++) { const q = pts[i]; if (q && prev) cx.lineTo(q[0], q[1]); else if (q) cx.moveTo(q[0], q[1]); prev = !!q; }
    cx.stroke();
  }
  function punto(cx, p, G, lon, lat, r, color) { const v = p.aVista(vec(lon, lat).map((c) => c * 1.004)); if (v[2] <= 0.02) return null; const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1]; cx.fillStyle = color; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill(); return [x, y]; }
  function etiqueta(cx, xy, texto, fuerte, abajo) { if (!xy) return; cx.font = (fuerte ? '600 12px' : '500 10.5px') + ' "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(6,8,12,.85)'; const x = xy[0] + 11, y = xy[1] + (abajo ? 14 : 0); cx.strokeText(texto, x, y); cx.fillStyle = fuerte ? '#F4F6F8' : 'rgba(232,236,241,.8)'; cx.fillText(texto, x, y); }

  let V = null; // the running journey
  // ---------- the recorder (owner, 22 Oct 2026, 16:04: «que la persona lo pueda luego descargar en PDF o en vídeo»):
  // every frame, the three planet canvases and the counters are composed on an offscreen canvas that feeds a
  // MediaRecorder; at the end the file is offered for download. Only on a computer (the phone version comes with the app).
  const REC = { on: false, rec: null, trozos: [], lienzo: null, cx: null, blob: null, mime: '' };
  function mimeVideo() { if (!window.MediaRecorder) return ''; for (const m of ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (_) {} } return ''; }
  function empiezaGrabacion() {
    const p = P(); if (!p || !p.lienzos) return false; const mime = mimeVideo(); if (!mime) return false;
    const base = p.lienzos.tierra; const c = document.createElement('canvas'); c.width = base.width; c.height = base.height;
    REC.lienzo = c; REC.cx = c.getContext('2d'); REC.trozos = []; REC.blob = null; REC.mime = mime;
    try {
      const flujo = c.captureStream(30); REC.rec = new MediaRecorder(flujo, { mimeType: mime, videoBitsPerSecond: 9000000 });
      REC.rec.ondataavailable = (e) => { if (e.data && e.data.size) REC.trozos.push(e.data); };
      REC.rec.onstop = () => { REC.blob = new Blob(REC.trozos, { type: mime.split(';')[0] }); REC.on = false; const h = $('viaje'); if (h) { const b = h.querySelector('.video'); b.hidden = false; b.textContent = T('Descargar vídeo') + ' (' + (REC.blob.size / 1048576).toFixed(0) + ' MB)'; } };
      REC.rec.start(500); REC.on = true; return true;
    } catch (_) { REC.on = false; return false; }
  }
  function paraGrabacion() { try { if (REC.rec && REC.rec.state !== 'inactive') REC.rec.stop(); } catch (_) {} }
  function descargaVideo() { if (!REC.blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(REC.blob); a.download = (T('El viaje de tus datos') + ' · GUARDIANA').replace(/[^\w\s·-]/g, '').trim() + (REC.mime.startsWith('video/mp4') ? '.mp4' : '.webm'); document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }
  function cuadroGrabado() {
    if (!REC.on || !V) return; const p = P(); if (!p) return; const l = p.lienzos, c = REC.lienzo, cx = REC.cx; if (!l || !c) return;
    cx.fillStyle = '#06080C'; cx.fillRect(0, 0, c.width, c.height);
    try { cx.drawImage(l.estrellas, 0, 0, c.width, c.height); cx.drawImage(l.tierra, 0, 0, c.width, c.height); cx.drawImage(l.rutas, 0, 0, c.width, c.height); } catch (_) { return; }
    // the counters, drawn as the HUD shows them
    const k = c.width / Math.max(1, innerWidth), h = $('viaje'); if (!h) return;
    cx.save(); cx.scale(k, k); cx.textBaseline = 'top';
    cx.fillStyle = 'rgba(244,246,248,.92)'; cx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText((T('El viaje de tus datos') + ' · GUARDIANA').toUpperCase(), 28, 24);
    cx.fillStyle = 'rgba(169,179,190,.9)'; cx.font = '400 11px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(h.querySelector('.sub').textContent, 28, 42);
    if (V.fase === 'vuelo') {
      const W = innerWidth, y = innerHeight - 150; cx.textAlign = 'center';
      cx.fillStyle = 'rgba(169,179,190,.95)'; cx.font = '500 12px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(h.querySelector('.destino').textContent, W / 2, y);
      cx.fillStyle = '#F4F6F8'; cx.font = '600 44px "IBM Plex Sans", system-ui, sans-serif'; cx.fillText(h.querySelector('.km').textContent + ' km', W / 2 - 150, y + 22); cx.fillText(h.querySelector('.ms').textContent + ' ms', W / 2 + 150, y + 22);
      if (V.llego) { cx.fillStyle = '#9CC3E4'; cx.font = '500 12px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(h.querySelector('.luz').textContent, W / 2, y + 82); }
    } else if (V.fase === 'final') {
      const W = innerWidth, y = innerHeight - 140; cx.textAlign = 'center';
      cx.fillStyle = '#F4F6F8'; cx.font = '600 30px "IBM Plex Sans", system-ui, sans-serif'; cx.fillText(h.querySelector('.fin .t').textContent, W / 2, y);
      cx.fillStyle = 'rgba(169,179,190,.95)'; cx.font = '400 12px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(h.querySelector('.fin .d').textContent, W / 2, y + 44);
    }
    cx.restore();
  }
  window.OrbitaDespues = cuadroGrabado;
  function pintaViaje(cx, p, G, t) {
    if (!V) return;
    const r = V.rutas, L = r.origen;
    cx.save(); cx.globalCompositeOperation = 'source-over';
    // every path, faint, so the whole web is always there
    for (const n of r.nubes) { cx.strokeStyle = 'rgba(' + BLANCO + ',' + (V.fase === 'final' ? 0.28 : 0.1) + ')'; cx.lineWidth = 0.8; trazo(cx, arcoPantalla(p, G, L, n, 64), 0, 64); }
    // the stops already travelled, with their label
    for (const s of V.hechas) { const pts = arcoPantalla(p, G, L, s, 64); cx.strokeStyle = 'rgba(' + ACENTO + ',.55)'; cx.lineWidth = 1.2; trazo(cx, pts, 0, 64); etiqueta(cx, punto(cx, p, G, s.lon, s.lat, 2.6, '#9CC3E4'), s.nombre + ' · ' + s.ms + ' ms', false); }
    // the pulse on its way: a trail that fades behind a bright head
    if (V.actual && V.fase === 'vuelo') {
      const s = V.actual, N = 96, pts = arcoPantalla(p, G, L, s, N), f = Math.max(0, Math.min(1, V.progreso)), cab = Math.round(f * N);
      for (let i = 1; i <= cab; i++) { const q0 = pts[i - 1], q1 = pts[i]; if (!q0 || !q1) continue; const k = 1 - (cab - i) / Math.max(12, N * 0.35); if (k <= 0) continue; cx.strokeStyle = 'rgba(' + ACENTO + ',' + (0.15 + 0.85 * k).toFixed(3) + ')'; cx.lineWidth = 1 + 2.2 * k; cx.beginPath(); cx.moveTo(q0[0], q0[1]); cx.lineTo(q1[0], q1[1]); cx.stroke(); }
      const q = pts[cab]; if (q) { const g = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 14); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.35, 'rgba(' + ACENTO + ',.7)'); g.addColorStop(1, 'rgba(' + ACENTO + ',0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(q[0], q[1], 14, 0, 7); cx.fill(); }
      if (f >= 1) etiqueta(cx, punto(cx, p, G, s.lon, s.lat, 3.2, '#F4F6F8'), s.nombre + ' · ' + s.ms + ' ms', true);
      else punto(cx, p, G, s.lon, s.lat, 2.4, 'rgba(' + BLANCO + ',.6)');
    }
    // you
    const pulso = 0.5 + 0.5 * Math.sin((t || 0) / 450), xy = punto(cx, p, G, L.lon, L.lat, 3.4, '#9CC3E4');
    if (xy) { cx.strokeStyle = 'rgba(' + ACENTO + ',' + (0.25 + 0.4 * pulso) + ')'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(xy[0], xy[1], 9 + 7 * pulso, 0, 7); cx.stroke(); etiqueta(cx, xy, (T('Tú') + ' · ' + L.nombre).toUpperCase(), true, true); }
    cx.restore();
  }

  // ---------- the sequence ----------
  function hud() {
    let h = $('viaje'); if (h) return h;
    h = document.createElement('div'); h.id = 'viaje'; h.className = 'viaje'; h.hidden = true;
    h.innerHTML = '<div class="arriba"><p class="k">' + T('El viaje de tus datos') + '</p><p class="sub"></p></div>'
      + '<div class="centro"><p class="destino"></p><div class="cifras"><div><b class="km">0</b><span>km</span></div><div><b class="ms">0</b><span>ms</span></div></div><p class="luz"></p></div>'
      + '<div class="abajo"><button type="button" class="saltar">' + T('Saltar') + '</button><button type="button" class="salir">' + T('Salir') + '</button></div>'
      + '<div class="fin" hidden><p class="t"></p><p class="d"></p><div class="botones"><button type="button" class="informe">' + T('Guardar el viaje (PDF)') + '</button><button type="button" class="video" hidden></button><button type="button" class="otra">' + T('Verlo otra vez') + '</button><button type="button" class="volver">' + T('Volver a Órbita') + '</button></div></div>';
    document.body.append(h);
    h.querySelector('.saltar').addEventListener('click', () => { if (V) V.salta = true; });
    h.querySelector('.salir').addEventListener('click', termina);
    h.querySelector('.volver').addEventListener('click', termina);
    h.querySelector('.otra').addEventListener('click', () => { const r = V && V.rutas; termina(); if (r) empieza(r); });
    h.querySelector('.informe').addEventListener('click', () => informe(V && V.rutas));
    h.querySelector('.video').addEventListener('click', descargaVideo);
    return h;
  }
  function empieza(rutas) {
    const r = rutas || (C() && C().datos.rutas); if (!r || !r.nubes || !r.nubes.length || !r.origen || !P()) return;
    const h = hud(); h.hidden = false; h.querySelector('.fin').hidden = true; h.querySelector('.centro').style.opacity = '0';
    document.body.classList.add('viaje');
    V = { rutas: r, paradas: paradas(r), hechas: [], actual: null, fase: 'intro', progreso: 0, t0: performance.now(), salta: false, cam: null };
    if (window.OrbitaCapas) window.OrbitaCapas.soloTu(true, pintaViaje);
    const hora = new Date(r.fin || r.cuando || Date.now()).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' });
    h.querySelector('.sub').textContent = T('Medido ahora desde') + ' ' + r.origen.nombre + ' · ' + hora + (r.borde ? ' · ' + T('borde') + ': ' + r.borde.nombre : '');
    camara(r.origen.lon, r.origen.lat, 1.7, 1600);
    h.querySelector('.video').hidden = true;
    if (!esTactil()) empiezaGrabacion();
    requestAnimationFrame(paso);
  }
  function termina() {
    if (!V) return; V = null; paraGrabacion();
    const h = $('viaje'); if (h) h.hidden = true;
    document.body.classList.remove('viaje');
    if (window.OrbitaCapas) window.OrbitaCapas.soloTu(false);
    if (C() && C().abre) C().abre(true); // back to «Mi conexión», with the results still there
  }
  // the camera: longitude and latitude glide to the target over `dur` ms; the zoom has its own glide inside the planet
  let cam = null;
  function camara(lon, lat, z, dur) { const p = P(); if (!p) return; const d = p.vista || { lon, lat }; cam = { lon0: d.lon, lat0: d.lat, lon, lat, z, t0: performance.now(), dur: dur || 1200 }; }
  function mueveCamara(now) {
    if (!cam) return; const p = P(); if (!p) return;
    const k = Math.min(1, (now - cam.t0) / cam.dur), s = suave(k);
    let dl = ((cam.lon - cam.lon0) % 360 + 540) % 360 - 180; // the short way round
    p.ir(cam.lon0 + dl * s, cam.lat0 + (cam.lat - cam.lat0) * s, cam.z);
    if (k >= 1) cam = null;
  }
  function paso(now) {
    if (!V) return;
    const h = hud(), r = V.rutas, L = r.origen; mueveCamara(now);
    const desde = now - V.t0;
    if (V.fase === 'intro') {
      if (desde > 2600 || V.salta) { V.salta = false; siguiente(now); }
    } else if (V.fase === 'vuelo') {
      const s = V.actual, dur = Math.max(2200, Math.min(4200, s.ms * 18)); // slow motion: the far ones take longer, never past four seconds
      const f = Math.min(1, (now - V.tVuelo) / dur); V.progreso = f;
      h.querySelector('.km').textContent = num(Math.round(s.km * f)); h.querySelector('.ms').textContent = num(Math.round(s.ms * f));
      if (f >= 1 && !V.llego) { V.llego = now; h.querySelector('.luz').textContent = T('La luz en línea recta tardaría') + ' ' + num(Math.round(s.minimo)) + ' ms · ' + T('tus datos dan un rodeo de') + ' ×' + num(s.ms / s.minimo, 1); h.querySelector('.luz').style.opacity = '1'; }
      if ((V.llego && now - V.llego > 1500) || V.salta) { V.salta = false; V.hechas.push(s); V.actual = null; siguiente(now); }
    } else if (V.fase === 'final') {
      if (REC.on && !V.tFin) V.tFin = now; if (REC.on && V.tFin && now - V.tFin > 3500) paraGrabacion(); // three more seconds of the whole planet, then the file closes
    }
    requestAnimationFrame(paso);
  }
  function siguiente(now) {
    const h = hud(), r = V.rutas, L = r.origen;
    const s = V.paradas.shift();
    if (!s) { // the end: the whole planet, every path, the numbers
      V.fase = 'final'; V.actual = null;
      camara(L.lon, L.lat, 1, 1400);
      h.querySelector('.centro').style.opacity = '0';
      const ms = r.nubes.map((n) => n.ms), lejos = r.nubes[r.nubes.length - 1];
      h.querySelector('.fin .t').textContent = T('Así viajan tus datos');
      h.querySelector('.fin .d').textContent = num(r.nubes.length) + ' ' + T('destinos medidos') + ' · ' + T('de') + ' ' + num(Math.min(...ms)) + ' ' + T('a') + ' ' + num(Math.max(...ms)) + ' ms · ' + T('el más lejano') + ': ' + lejos.nombre + ', ' + num(Math.round(lejos.km)) + ' km';
      h.querySelector('.fin').hidden = false;
      return;
    }
    V.fase = 'vuelo'; V.actual = s; V.tVuelo = now + 900; V.llego = 0; V.progreso = 0;
    // frame the arc: its midpoint in the centre, the zoom from the angle it spans
    const m = puntoMedio(L, s, 0.5), ang = angulo(L, s), z = Math.max(1.15, Math.min(3.2, 1.9 / Math.max(0.35, ang)));
    camara(m.lon, m.lat, z, 1100);
    h.querySelector('.destino').textContent = continente(s.region).toUpperCase() + ' · ' + s.nombre + (s.cc ? ' (' + s.cc + ')' : '');
    h.querySelector('.km').textContent = '0'; h.querySelector('.ms').textContent = '0'; h.querySelector('.luz').style.opacity = '0';
    h.querySelector('.centro').style.opacity = '1';
  }

  // ---------- the report ----------
  let FR = null;
  async function fronteras() { if (FR) return FR; try { const d = await (await fetch('datos/fronteras.json')).json(); FR = d.paises || []; } catch (_) { FR = []; } return FR; }
  function lienzo(w, h) { const c = document.createElement('canvas'); const dpr = Math.min(3, window.devicePixelRatio || 1); c.width = w * dpr; c.height = h * dpr; c.style.width = '100%'; c.style.maxWidth = w + 'px'; c.style.height = 'auto'; const cx = c.getContext('2d'); cx.scale(dpr, dpr); return [c, cx]; }
  // 1. the globe: an orthographic view centred on you, borders as fine lines, your arcs lifted above the surface
  function figuraGlobo(r, lineas, paradasV) {
    const W = 1100, H = 720, [c, cx] = lienzo(W, H), L = r.origen, R = 300, CX = W / 2, CY = H / 2 + 10;
    // rotation that brings you to the centre
    const la = L.lat * RAD, lo = L.lon * RAD, cl = Math.cos(la), sl = Math.sin(la), co = Math.cos(lo), so = Math.sin(lo);
    const proy = (lon, lat, alza) => { const [x0, y0, z0] = vec(lon, lat); const x1 = x0 * co - z0 * so, z1 = x0 * so + z0 * co; const y2 = y0 * cl - z1 * sl, z2 = y0 * sl + z1 * cl; const h = 1 + (alza || 0); return { x: CX + R * x1 * h, y: CY - R * y2 * h, z: z2 }; };
    cx.fillStyle = '#06080C'; cx.fillRect(0, 0, W, H);
    // the sphere: a soft limb, a darker body
    let g = cx.createRadialGradient(CX - R * 0.3, CY - R * 0.35, R * 0.1, CX, CY, R * 1.02); g.addColorStop(0, '#111822'); g.addColorStop(0.8, '#0A0E14'); g.addColorStop(1, '#06080C'); cx.fillStyle = g; cx.beginPath(); cx.arc(CX, CY, R, 0, 7); cx.fill();
    g = cx.createRadialGradient(CX, CY, R * 0.96, CX, CY, R * 1.06); g.addColorStop(0, 'rgba(' + ACENTO + ',0)'); g.addColorStop(0.5, 'rgba(' + ACENTO + ',.35)'); g.addColorStop(1, 'rgba(' + ACENTO + ',0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(CX, CY, R * 1.06, 0, 7); cx.fill();
    // graticule
    cx.strokeStyle = 'rgba(' + ACENTO + ',.08)'; cx.lineWidth = 0.6;
    for (let lat = -60; lat <= 60; lat += 30) { cx.beginPath(); let prev = false; for (let lon = -180; lon <= 180; lon += 3) { const q = proy(lon, lat); if (q.z > 0 && prev) cx.lineTo(q.x, q.y); else if (q.z > 0) cx.moveTo(q.x, q.y); prev = q.z > 0; } cx.stroke(); }
    for (let lon = -180; lon < 180; lon += 30) { cx.beginPath(); let prev = false; for (let lat = -90; lat <= 90; lat += 3) { const q = proy(lon, lat); if (q.z > 0 && prev) cx.lineTo(q.x, q.y); else if (q.z > 0) cx.moveTo(q.x, q.y); prev = q.z > 0; } cx.stroke(); }
    // borders
    cx.strokeStyle = 'rgba(' + ACENTO + ',.38)'; cx.lineWidth = 0.7;
    for (const l of lineas) { cx.beginPath(); let prev = false; for (const [lon, lat] of l) { const q = proy(lon, lat); if (q.z > 0.01 && prev) cx.lineTo(q.x, q.y); else if (q.z > 0.01) cx.moveTo(q.x, q.y); prev = q.z > 0.01; } cx.stroke(); }
    // the arcs: every destination faint, the stops bright and lifted
    const dibujaArco = (n, fuerte) => {
      const va = vec(L.lon, L.lat), vb = vec(n.lon, n.lat), N = 80; cx.beginPath(); let prev = false;
      for (let i = 0; i <= N; i++) { const t = i / N, w = slerp(va, vb, t), lat = Math.asin(Math.max(-1, Math.min(1, w[1]))) / RAD, lon = Math.atan2(w[0], w[2]) / RAD, q = proy(lon, lat, (fuerte ? 0.16 : 0.07) * Math.sin(Math.PI * t)); if (q.z > -0.05 && prev) cx.lineTo(q.x, q.y); else if (q.z > -0.05) cx.moveTo(q.x, q.y); prev = q.z > -0.05; }
      cx.strokeStyle = fuerte ? 'rgba(' + BLANCO + ',.95)' : 'rgba(' + ACENTO + ',.32)'; cx.lineWidth = fuerte ? 1.8 : 0.8; if (fuerte) { cx.shadowColor = 'rgba(' + ACENTO + ',.9)'; cx.shadowBlur = 10; } cx.stroke(); cx.shadowBlur = 0;
    };
    for (const n of r.nubes) if (!paradasV.includes(n)) dibujaArco(n, false);
    for (const n of paradasV) dibujaArco(n, true);
    // labels
    cx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle';
    for (const n of paradasV) { const q = proy(n.lon, n.lat, 0.16 * Math.sin(Math.PI)); const q2 = proy(n.lon, n.lat); if (q2.z <= -0.05) continue; cx.fillStyle = '#F4F6F8'; cx.beginPath(); cx.arc(q2.x, q2.y, 3, 0, 7); cx.fill(); const txt = n.nombre + ' · ' + n.ms + ' ms'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(6,8,12,.9)'; cx.strokeText(txt, q2.x + 9, q2.y); cx.fillStyle = '#F4F6F8'; cx.fillText(txt, q2.x + 9, q2.y); }
    const me = proy(L.lon, L.lat); cx.fillStyle = '#9CC3E4'; cx.beginPath(); cx.arc(me.x, me.y, 4.5, 0, 7); cx.fill(); cx.strokeStyle = 'rgba(' + ACENTO + ',.6)'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(me.x, me.y, 11, 0, 7); cx.stroke();
    cx.font = '600 12px "IBM Plex Mono", ui-monospace, monospace'; cx.fillStyle = '#F4F6F8'; cx.fillText((T('Tú') + ' · ' + L.nombre).toUpperCase(), me.x + 16, me.y + 14);
    return c;
  }
  // 2. the compass of times: each destination at its true bearing from you, the spoke as long as its milliseconds
  function figuraBrujula(r) {
    const W = 560, H = 560, [c, cx] = lienzo(W, H), L = r.origen, CX = W / 2, CY = H / 2, Rm = 230;
    const maxMs = Math.max(...r.nubes.map((n) => n.ms)), esc = (ms) => Rm * Math.sqrt(ms / maxMs); // square root: the near ones still get room
    cx.fillStyle = '#06080C'; cx.fillRect(0, 0, W, H);
    cx.strokeStyle = 'rgba(' + ACENTO + ',.18)'; cx.lineWidth = 0.8; cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.fillStyle = 'rgba(' + BLANCO + ',.55)'; cx.textBaseline = 'middle'; cx.textAlign = 'left';
    for (const ms of [50, 100, 200, 400]) { if (ms > maxMs * 1.05) break; const rr = esc(ms); cx.beginPath(); cx.arc(CX, CY, rr, 0, 7); cx.stroke(); cx.fillText(ms + ' ms', CX + 4, CY - rr - 7); }
    cx.textAlign = 'center'; cx.fillStyle = 'rgba(' + BLANCO + ',.7)';
    [[T('N'), 0], [T('E'), 90], [T('S'), 180], [T('O'), 270]].forEach(([k, a]) => { const q = a * RAD; cx.fillText(k, CX + (Rm + 16) * Math.sin(q), CY - (Rm + 16) * Math.cos(q)); });
    const orden = r.nubes.slice().sort((a, b) => a.ms - b.ms);
    orden.forEach((n, i) => {
      const a = rumbo(L, n) * RAD, rr = esc(n.ms), x = CX + rr * Math.sin(a), y = CY - rr * Math.cos(a), top = i < 5;
      cx.strokeStyle = top ? 'rgba(' + ACENTO + ',.9)' : 'rgba(' + BLANCO + ',.28)'; cx.lineWidth = top ? 1.6 : 0.9; cx.beginPath(); cx.moveTo(CX, CY); cx.lineTo(x, y); cx.stroke();
      cx.fillStyle = top ? '#9CC3E4' : 'rgba(' + BLANCO + ',.6)'; cx.beginPath(); cx.arc(x, y, top ? 3.2 : 2, 0, 7); cx.fill();
      if (top || i % 3 === 0) { cx.textAlign = Math.sin(a) >= 0 ? 'left' : 'right'; cx.fillStyle = top ? '#F4F6F8' : 'rgba(' + BLANCO + ',.6)'; cx.font = (top ? '600 10.5px' : '400 9.5px') + ' "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(n.nombre.replace(/ \(.*\)/, '') + ' ' + n.ms, x + (Math.sin(a) >= 0 ? 7 : -7), y); }
    });
    cx.fillStyle = '#9CC3E4'; cx.beginPath(); cx.arc(CX, CY, 4, 0, 7); cx.fill();
    cx.textAlign = 'center'; cx.font = '600 11px "IBM Plex Mono", ui-monospace, monospace'; cx.fillStyle = '#F4F6F8'; cx.fillText((T('Tú') + ' · ' + L.nombre).toUpperCase(), CX, CY + 18);
    return c;
  }
  // 3. light against reality: for each destination, the physical minimum and what was measured
  function figuraLuz(r) {
    const filas = r.nubes.slice().sort((a, b) => a.ms - b.ms).slice(0, 16), W = 1100, fh = 26, H = 40 + filas.length * fh + 30, [c, cx] = lienzo(W, H);
    const maxMs = Math.max(...filas.map((n) => n.ms)), x0 = 250, ancho = W - x0 - 90, esc = (ms) => ancho * ms / maxMs;
    cx.fillStyle = '#06080C'; cx.fillRect(0, 0, W, H);
    cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle'; cx.fillStyle = 'rgba(' + BLANCO + ',.6)';
    cx.fillText(T('mínimo de la luz por la fibra').toUpperCase(), x0, 16); cx.fillStyle = '#9CC3E4'; cx.fillRect(x0 - 14, 12, 8, 8);
    cx.fillStyle = 'rgba(' + BLANCO + ',.6)'; cx.fillText(T('lo que han tardado tus datos').toUpperCase(), x0 + 300, 16); cx.fillStyle = 'rgba(' + BLANCO + ',.35)'; cx.fillRect(x0 + 286, 12, 8, 8);
    filas.forEach((n, i) => {
      const y = 44 + i * fh;
      cx.textAlign = 'right'; cx.fillStyle = '#F4F6F8'; cx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(n.nombre.replace(/ \(.*\)/, ''), x0 - 12, y + 9);
      cx.fillStyle = 'rgba(' + BLANCO + ',.3)'; cx.fillRect(x0, y, esc(n.ms), 16);
      cx.fillStyle = '#9CC3E4'; cx.fillRect(x0, y, esc(n.minimo), 16);
      cx.textAlign = 'left'; cx.fillStyle = '#F4F6F8'; cx.fillText(n.ms + ' ms · ×' + num(n.ms / n.minimo, 1), x0 + esc(n.ms) + 8, y + 9);
    });
    return c;
  }
  async function informe(rutas) {
    const r = rutas || (C() && C().datos.rutas); if (!r || !r.nubes || !r.nubes.length || !r.origen) return;
    const lineas = await fronteras(), paradasV = paradas(r), fuera = C() && C().datos.fuera;
    let a = $('informe'); if (a) a.remove();
    a = document.createElement('article'); a.id = 'informe'; a.className = 'informe'; a.setAttribute('aria-label', T('El viaje de tus datos'));
    const cuando = new Date(r.fin || r.cuando || Date.now());
    const orden = r.nubes.slice().sort((x, y) => x.ms - y.ms), mejor = orden[0], peor = orden[orden.length - 1];
    const porCont = new Map(); for (const n of orden) { const k = continente(n.region); if (!porCont.has(k)) porCont.set(k, n); }
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    const cab = el('header', 'cab'); cab.append(el('p', 'k', 'GUARDIANA · ÓRBITA'), el('h1', 't', T('El viaje de tus datos')), el('p', 's', r.origen.nombre + (r.origen.aprox ? ' (' + T('aproximada') + ')' : '') + (fuera && !fuera.error && fuera.operador ? ' · ' + fuera.operador : '') + ' · ' + cuando.toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + cuando.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }) + (r.borde ? ' · ' + T('borde de internet más cercano') + ': ' + r.borde.nombre + (r.borde.ms != null ? ' (' + r.borde.ms + ' ms)' : '') : '')));
    const acc = el('div', 'acciones'); const bPdf = el('button', '', T('Guardar PDF')); bPdf.type = 'button'; const bX = el('button', '', T('Cerrar')); bX.type = 'button'; acc.append(bPdf, bX); cab.append(acc);
    a.append(cab);
    const f1 = el('figure'); f1.append(figuraGlobo(r, lineas, paradasV)); f1.append(el('figcaption', '', T('Tu planeta: cada arco es un camino medido desde tu equipo; los brillantes, el más rápido de cada continente.'))); a.append(f1);
    const cifras = el('section', 'cifras');
    const dato = (v, k) => { const d = el('div'); d.append(el('b', '', v), el('span', '', k)); return d; };
    cifras.append(dato(num(orden.length), T('destinos medidos')), dato(mejor.ms + ' ms', T('el más rápido') + ': ' + mejor.nombre.replace(/ \(.*\)/, '')), dato(num(Math.round(peor.km)) + ' km', T('el más lejano') + ': ' + peor.nombre.replace(/ \(.*\)/, '')), dato('×' + num(orden.reduce((s, n) => s + n.ms / n.minimo, 0) / orden.length, 1), T('rodeo medio sobre la luz')));
    a.append(cifras);
    const dos = el('div', 'dos');
    const f2 = el('figure'); f2.append(figuraBrujula(r)); f2.append(el('figcaption', '', T('Brújula de tiempos: cada destino en su dirección real desde ti; cuanto más lejos del centro, más tardan tus datos.'))); dos.append(f2);
    const sec = el('section', 'texto');
    sec.append(el('h2', '', T('Qué significa')));
    sec.append(el('p', '', T('Cada número es una ida y vuelta real desde tu equipo hasta la puerta pública de un centro de datos, medida en el momento de la fecha. La luz dentro de la fibra recorre unos 200 kilómetros por milisegundo; lo que tus datos tardan de más es el camino real: cables que bordean costas, saltos entre redes, colas en los equipos.')));
    sec.append(el('p', '', T('Tu destino más rápido es') + ' ' + mejor.nombre + ' (' + mejor.ms + ' ms, ' + num(Math.round(mejor.km)) + ' km). ' + T('Por continente, el más cercano a ti:') + ' ' + [...porCont.entries()].map(([k, n]) => k + ' → ' + n.nombre.replace(/ \(.*\)/, '') + ' ' + n.ms + ' ms').join(' · ') + '.'));
    sec.append(el('h2', '', T('Cómo se ha medido')));
    sec.append(el('p', '', T('Desde tu navegador, una petición mínima a la puerta pública de cada región (Amazon Web Services) y al borde de red más cercano (Cloudflare), tres veces, quedándonos con la mejor. La ubicación de cada centro es la zona metropolitana publicada por su operador. No se sabe por qué cable exacto ha ido cada dato: ningún mapa puede saberlo sin medir dentro de la red, y por eso no se dibuja.')));
    dos.append(sec); a.append(dos);
    const f3 = el('figure'); f3.append(figuraLuz(r)); f3.append(el('figcaption', '', T('La luz contra la realidad: en azul, lo que tardaría la luz en línea recta; en gris, lo que han tardado tus datos.'))); a.append(f3);
    const tabla = el('table'); const th = el('tr'); [T('Destino'), T('Continente'), 'ms', 'km', T('mínimo'), T('rodeo')].forEach((k) => th.append(el('th', '', k))); tabla.append(th);
    for (const n of orden) { const tr = el('tr'); [n.nombre, continente(n.region), n.ms + ' ms', num(Math.round(n.km)), num(Math.round(n.minimo)) + ' ms', '×' + num(n.ms / n.minimo, 1)].forEach((v) => tr.append(el('td', '', v))); tabla.append(tr); }
    a.append(tabla);
    a.append(el('p', 'pie', T('Son tus datos y de nadie más: este informe se ha generado en tu equipo y no se ha enviado a ningún sitio.') + ' · GUARDIANA · guardianagroup.com'));
    document.body.append(a); document.body.classList.add('con-informe');
    const cierra = () => { a.remove(); document.body.classList.remove('con-informe'); };
    bX.addEventListener('click', cierra);
    bPdf.addEventListener('click', () => { document.body.classList.add('imprime-informe'); setTimeout(() => { try { window.print(); } finally { setTimeout(() => document.body.classList.remove('imprime-informe'), 500); } }, 50); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { cierra(); document.removeEventListener('keydown', esc); } });
    a.scrollTop = 0;
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && V) termina(); });
  window.OrbitaViaje = { empieza, informe, get activo() { return !!V; } };
})();
