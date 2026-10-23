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
  const contKey = (region) => /^(us|ca|mx)-/.test(region) ? 'América del Norte' : /^sa-/.test(region) ? 'América del Sur' : /^eu-/.test(region) ? 'Europa' : /^(il|me)-/.test(region) ? 'Oriente Medio' : /^af-/.test(region) ? 'África' : /^ap-southeast-(2|4)/.test(region) ? 'Oceanía' : 'Asia';
  const continente = (region) => T(contKey(region));
  // the visitor's own continent comes from the country (23 Oct 2026: taken from the nearest measured region, Colombia
  // came out as North America — Querétaro is nearer than São Paulo); every country not listed is Asia
  const CONT_PAIS = {};
  [['América del Norte', 'US CA MX GT BZ SV HN NI CR PA CU JM HT DO PR BS BB TT AG AI AW BL BM BQ CW DM GD GP KN KY LC MF MQ MS PM SX TC VC VG VI GL UM'],
    ['América del Sur', 'CO VE EC PE BO BR PY UY AR CL GY SR GF FK GS'],
    ['Europa', 'AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK'],
    ['Oriente Medio', 'AE BH IL IQ IR JO KW LB OM PS QA SA SY YE TR'],
    ['África', 'DZ AO BJ BW BF BI CM CV CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU YT MA MZ NA NE NG RE RW SH ST SN SC SL SO ZA SS SD TZ TG TN UG EH ZM ZW'],
    ['Oceanía', 'AU NZ FJ PG SB VU NC PF WS TO KI TV NR FM MH PW GU MP AS CK NU TK WF PN NF']].forEach(([k, s]) => s.split(' ').forEach((c) => { CONT_PAIS[c] = k; }));
  const contDePais = (cc) => cc ? (CONT_PAIS[String(cc).toUpperCase()] || 'Asia') : '';
  const esTactil = () => matchMedia && matchMedia('(pointer: coarse)').matches;
  const suave = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // the stops: the fastest destination of each continent, nearest first, at most six
  function paradas(r) {
    const porCont = new Map();
    for (const n of r.nubes) { const c = continente(n.region); if (!porCont.has(c) || porCont.get(c).ms > n.ms) porCont.set(c, n); }
    return [...porCont.values()].sort((a, b) => a.km - b.km).slice(0, 6);
  }

  // ---------- drawing on the planet (in «solo tú» mode) ----------
  // 22 Oct 2026, 18:13 (owner): the data travel along the map's cables and fibre, not over the planet from city to city.
  // conexion.js finds the way through the network (and the satellite leg when the operator is one); the great circle
  // remains only where the map has no way. «alza» lifts the whole trayecto a little for the flight camera.
  function arcoPantalla(p, G, a, b, n, alza) {
    const CN = window.OrbitaConexion, c = CN && CN.trayecto ? CN.trayecto(p, a, b, n) : null, pts = [];
    if (c) {
      for (let i = 0; i <= n; i++) {
        const t = i / n; let h = 1.004 + (alza || 0) * Math.sin(Math.PI * t);
        if (c.alza && i <= c.alza.hasta) { const s = i / c.alza.hasta; h = Math.max(h, 1.004 + (c.alza.alto - 1.004) * Math.sin(s * Math.PI)); }
        const w = c.w[i], v = p.aVista([w[0] * h, w[1] * h, w[2] * h]); pts.push(v[2] > 0.02 || h > 1.05 ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null);
      }
      pts.red = c.red; pts.satelite = !!c.alza; return pts;
    }
    const va = vec(a.lon, a.lat), vb = vec(b.lon, b.lat);
    for (let i = 0; i <= n; i++) { const t = i / n, w = slerp(va, vb, t), h = 1.004 + (alza || 0) * Math.sin(Math.PI * t); const v = p.aVista([w[0] * h, w[1] * h, w[2] * h]); pts.push(v[2] > 0.02 ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null); }
    return pts;
  }
  function trazo(cx, pts, desde, hasta) {
    let prev = false; cx.beginPath();
    for (let i = desde; i <= hasta; i++) { const q = pts[i]; if (q && prev) cx.lineTo(q[0], q[1]); else if (q) cx.moveTo(q[0], q[1]); prev = !!q; }
    cx.stroke();
  }
  function proy(p, G, lon, lat) { const v = p.aVista(vec(lon, lat).map((c) => c * 1.004)); if (v[2] <= 0.02) return null; return [G.CX + G.R * v[0], G.CY - G.R * v[1]]; }
  function punto(cx, p, G, lon, lat, r, color) { const xy = proy(p, G, lon, lat); if (!xy) return null; cx.fillStyle = color; cx.beginPath(); cx.arc(xy[0], xy[1], r, 0, 7); cx.fill(); return xy; }
  // labels never sit on top of each other: each frame keeps the boxes already used; a label that would collide is
  // simply not drawn (the dot stays), unless it is the one the scene is about (`forzar`)
  let CAJAS = [];
  function cabe(x, y, w, h, forzar) { const b = [x - 2, y - h / 2, x + w + 2, y + h / 2]; if (!forzar) for (const c of CAJAS) if (b[0] < c[2] && b[2] > c[0] && b[1] < c[3] && b[3] > c[1]) return false; CAJAS.push(b); return true; }
  function etiqueta(cx, xy, texto, fuerte, abajo, forzar) {
    if (!xy) return false; cx.font = (fuerte ? '600 12px' : '500 10.5px') + ' "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle'; cx.textAlign = 'left';
    const x = xy[0] + 11, y = xy[1] + (abajo ? 14 : 0), w = cx.measureText(texto).width; if (!cabe(x, y, w, fuerte ? 15 : 13, forzar)) return false;
    cx.lineWidth = 3; cx.strokeStyle = 'rgba(6,8,12,.85)'; cx.strokeText(texto, x, y); cx.fillStyle = fuerte ? '#F4F6F8' : 'rgba(232,236,241,.8)'; cx.fillText(texto, x, y); return true;
  }

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
    // the counters, drawn as the HUD shows them, over the same dark band
    const k = c.width / Math.max(1, innerWidth), h = $('viaje'); if (!h) return;
    { const alto = 290 * k, gb = cx.createLinearGradient(0, c.height, 0, c.height - alto); gb.addColorStop(0, 'rgba(6,8,12,.86)'); gb.addColorStop(0.48, 'rgba(6,8,12,.55)'); gb.addColorStop(1, 'rgba(6,8,12,0)'); cx.fillStyle = gb; cx.fillRect(0, c.height - alto, c.width, alto); }
    cx.save(); cx.scale(k, k); cx.textBaseline = 'top';
    cx.fillStyle = 'rgba(244,246,248,.92)'; cx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText((T('El viaje de tus datos') + ' · GUARDIANA').toUpperCase(), 28, 24);
    cx.fillStyle = 'rgba(169,179,190,.9)'; cx.font = '400 11px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(h.querySelector('.sub').textContent, 28, 42);
    if (V.fase === 'despliegue' || V.fase === 'repaso' || V.fase === 'satelite') {
      const W = innerWidth, y = innerHeight - 150; cx.textAlign = 'center';
      cx.fillStyle = 'rgba(169,179,190,.95)'; cx.font = '500 12px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(h.querySelector('.destino').textContent, W / 2, y);
      cx.fillStyle = '#F4F6F8'; cx.font = '600 44px "IBM Plex Sans", system-ui, sans-serif'; cx.fillText(h.querySelector('.km').textContent + ' km', W / 2 - 150, y + 22); cx.fillText(h.querySelector('.ms').textContent + ' ms', W / 2 + 150, y + 22);
      cx.fillStyle = '#9CC3E4'; cx.font = '500 12px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(h.querySelector('.luz').textContent, W / 2, y + 82);
    } else if (V.fase === 'final') {
      const W = innerWidth, y = innerHeight - 140; cx.textAlign = 'center';
      cx.fillStyle = '#F4F6F8'; cx.font = '600 30px "IBM Plex Sans", system-ui, sans-serif'; cx.fillText(h.querySelector('.fin .t').textContent, W / 2, y);
      cx.fillStyle = 'rgba(169,179,190,.95)'; cx.font = '400 12px "IBM Plex Mono", ui-monospace, monospace'; cx.fillText(h.querySelector('.fin .d').textContent, W / 2, y + 44);
    }
    cx.restore();
  }
  window.OrbitaDespues = cuadroGrabado;
  // 23 Oct 2026, 09:24 (owner): «el primer recorrido lo quitaría, es demasiado rápido… que salgan todas las líneas a la
  // vez… en modo despacio… y luego haces un repaso» continent by continent, nearest first. 09:26: «que suba hasta el
  // satélite y el satélite la lleve a otro continente» — shown as an EXAMPLE, never as the visitor's measured route.
  const LENTO = 22, DESP_MIN = 1800, DESP_MAX = 7500; // slow motion: each pulse takes its real round trip × 22 (1.8 to 7.5 s)
  const durDe = (n) => Math.max(DESP_MIN, Math.min(DESP_MAX, n.ms * LENTO));
  const corto = (n) => n.nombre.replace(/ \(.*\)/, '');
  // a pulse of light: a trail that fades behind a bright head
  function pulso(cx, pts, f, N, fuerte) {
    const cab = Math.round(Math.max(0, Math.min(1, f)) * N);
    for (let i = 1; i <= cab; i++) { const q0 = pts[i - 1], q1 = pts[i]; if (!q0 || !q1) continue; const k = 1 - (cab - i) / Math.max(10, N * 0.3); if (k <= 0) continue; cx.strokeStyle = 'rgba(' + ACENTO + ',' + (0.12 + 0.8 * k).toFixed(3) + ')'; cx.lineWidth = (fuerte ? 1 : 0.7) + (fuerte ? 2.2 : 1.4) * k; cx.beginPath(); cx.moveTo(q0[0], q0[1]); cx.lineTo(q1[0], q1[1]); cx.stroke(); }
    const q = pts[cab]; if (q && f < 1) { const R = fuerte ? 13 : 8, g = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], R); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.35, 'rgba(' + ACENTO + ',.7)'); g.addColorStop(1, 'rgba(' + ACENTO + ',0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(q[0], q[1], R, 0, 7); cx.fill(); }
  }
  function pintaViaje(cx, p, G, t) {
    if (!V) return;
    const r = V.rutas, L = r.origen, now = performance.now(), N = 72;
    cx.save(); cx.globalCompositeOperation = 'source-over';
    // the home marker and its label are the planet's own (orbita.js draws them); only its box is reserved here
    CAJAS = []; const casa = proy(p, G, L.lon, L.lat);
    if (casa) { cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cabe(casa[0] + 12, casa[1] + 4, cx.measureText(T('TU EQUIPO') + ' · ' + L.nombre.toUpperCase() + ' (' + T('APROX.') + ')').width, 14, true); }
    if (V.fase === 'despliegue') {
      // every path at once, each pulse at its own pace: the near ones arrive first, the far ones keep travelling
      const desde = now - V.tDesp;
      for (const n of V.porKm) { const f = desde / durDe(n), pts = arcoPantalla(p, G, L, n, N); if (f >= 1) { cx.strokeStyle = 'rgba(' + ACENTO + ',.45)'; cx.lineWidth = 1; trazo(cx, pts, 0, N); } else pulso(cx, pts, f, N, false); }
      for (const n of V.porKm) { if (desde >= durDe(n)) etiqueta(cx, punto(cx, p, G, n.lon, n.lat, 2.4, '#F4F6F8'), corto(n) + ' · ' + n.ms + ' ms', false); else punto(cx, p, G, n.lon, n.lat, 1.6, 'rgba(' + BLANCO + ',.45)'); }
    } else if (V.fase === 'repaso' || V.fase === 'satelite' || V.fase === 'final') {
      const g = V.fase === 'repaso' ? V.grupo : null;
      for (const n of V.porKm) { const dentro = !!(g && g.nubes.includes(n)); cx.strokeStyle = dentro ? 'rgba(' + ACENTO + ',.85)' : 'rgba(' + BLANCO + ',' + (V.fase === 'final' ? 0.28 : V.fase === 'satelite' ? 0.07 : 0.13) + ')'; cx.lineWidth = dentro ? 1.7 : 0.8; trazo(cx, arcoPantalla(p, G, L, n, N), 0, N); }
      if (g) { const ns = g.nubes; etiqueta(cx, punto(cx, p, G, ns[0].lon, ns[0].lat, 3.4, '#F4F6F8'), corto(ns[0]) + ' · ' + ns[0].ms + ' ms', true, false, true); for (const n of ns.slice(1)) etiqueta(cx, punto(cx, p, G, n.lon, n.lat, 2.4, '#9CC3E4'), corto(n) + ' · ' + n.ms + ' ms', false); }
      if (V.fase === 'satelite' && V.sat) pintaSatelite(cx, p, G, now);
    }
    cx.restore();
  }
  // ---------- the satellite example (owner, 23 Oct 2026, 09:26: «una sube hasta el satélite, y el satélite la lleva a
  // otro continente… con una realidad muy bonita») ----------
  // A geostationary satellite stays 35,786 km above the equator, turning with the Earth. The example lands on a measured
  // destination of ANOTHER continent that one satellite sees together with the visitor, both well above the horizon
  // (at most 66° from the point under the satellite: more than 15° of elevation at true scale). The satellite sits over
  // the equator between the two, where the lower of the two elevations is highest. It is drawn much nearer than it is
  // (1.7 Earth radii from the centre instead of 6.6), so it says «no a escala»; the belt of those orbits is drawn too.
  const SAT_ALTO = 1.7, SAT_MAX = 66 * RAD;
  function ejemploSatelite(r) {
    const L = r.origen; if (!L || Math.abs(L.lat) > 60) return null;
    const cerca = r.nubes.slice().sort((a, b) => a.km - b.km)[0];
    const propio = contDePais(P() && P().pais) || (cerca && cerca.km < 1500 ? contKey(cerca.region) : '');
    let mejor = null;
    for (const n of r.nubes) {
      if (contKey(n.region) === propio || n.km < 4000) continue;
      let lonS = 0, peor = Infinity;
      for (let lon = -180; lon < 180; lon += 1) { const S0 = { lon, lat: 0 }, g = Math.max(angulo(S0, L), angulo(S0, n)); if (g < peor) { peor = g; lonS = lon; } }
      if (peor > SAT_MAX) continue;
      // the most beautiful scene wins: the camera's own score, plus a long journey (up to ~90° of the planet)
      const S0 = { lon: lonS, lat: 0 }, C = encuadre(L, n, S0); if (!C.nota) continue;
      const nota = C.nota + 0.02 * Math.min(90, angulo(L, n) / RAD);
      if (!mejor || nota > mejor.nota) mejor = { nota, D: n, S0, C };
    }
    return mejor;
  }
  // world → view for a camera that is not the current one (the same rotation as the planet's aVista)
  function desde(C, w) { const a = C.lat * RAD, b = C.lon * RAD, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b); const x = w[0] * cb - w[2] * sb, z = w[0] * sb + w[2] * cb; return [x, w[1] * ca - z * sa, w[1] * sa + z * ca]; }
  // where the camera looks: both ends well inside the visible face, the satellite out in space beyond the planet's
  // edge when the geometry allows it (preferably above, never down among the counters), the whole scene centred
  function encuadre(U, D, S0) {
    const g = P() && P().geo, Rp = g ? g.R0 : 250, mx = g ? g.W / 2 : 700, my = g ? g.H / 2 : 450;
    const wU = vec(U.lon, U.lat), wD = vec(D.lon, D.lat), wS = vec(S0.lon, S0.lat).map((c) => c * SAT_ALTO);
    let mejor = null;
    for (let lat = -64; lat <= 64; lat += 2) for (let dl = -64; dl <= 64; dl += 2) {
      const C = { lon: S0.lon + dl, lat }, u = desde(C, wU), d = desde(C, wD), s = desde(C, wS), rho = Math.hypot(s[0], s[1]);
      if (u[2] < 0.5 || d[2] < 0.5) continue;
      if (s[2] <= 0 && rho <= 1.02) continue;
      if (s[1] < -0.3 || Math.abs(s[0]) * Rp > mx - 150 || s[1] * Rp > my - 70) continue;
      const nota = 3 * Math.min(rho, 1.2) + Math.min(s[1], 1.1) + 2 * Math.min(u[2], d[2]) - 0.8 * Math.abs((u[0] + d[0] + s[0]) / 3) - 0.4 * Math.abs((u[1] + d[1] + s[1]) / 3);
      if (!mejor || nota > mejor.nota) mejor = { nota, lon: C.lon, lat: C.lat };
    }
    return mejor || { nota: 0, lon: S0.lon, lat: (U.lat + D.lat) / 3 };
  }
  function tramoSat(p, G, a, b, sube, N) { // along the great circle from a to b, rising (or falling) between the ground and the satellite
    const va = vec(a.lon, a.lat), vb = vec(b.lon, b.lat), pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, w = slerp(va, vb, t), h = 1.004 + (SAT_ALTO - 1.004) * (sube ? Math.sin(t * Math.PI / 2) : Math.cos(t * Math.PI / 2));
      const v = p.aVista([w[0] * h, w[1] * h, w[2] * h]), fuera = v[0] * v[0] + v[1] * v[1] > 1;
      pts.push(v[2] > 0.02 || fuera ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null);
    }
    return pts;
  }
  // the belt of geostationary orbits: a ring over the equator, hidden where the planet is in front of it; the near
  // half brighter than the far one, and never across the counters
  function zonasHud() {
    const h = $('viaje'); if (!h) return [];
    return [...h.querySelectorAll('.centro .destino, .centro .luz, .centro .cifras > div')].map((el) => { const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); return [b.left - 14, b.top - 8, b.right + 14, b.bottom + 8]; });
  }
  function anillo(cx, p, G, a) {
    if (a <= 0) return; const N = 360, cerca = [], lejos = [], zonas = zonasHud();
    const libre = (x, y) => !zonas.some((z) => x > z[0] && x < z[2] && y > z[1] && y < z[3]);
    for (let i = 0; i <= N; i++) {
      const l = i / N * 2 * Math.PI, v = p.aVista([Math.sin(l) * SAT_ALTO, 0, Math.cos(l) * SAT_ALTO]), x = G.CX + G.R * v[0], y = G.CY - G.R * v[1];
      const ve = (v[2] > 0 || v[0] * v[0] + v[1] * v[1] > 1) && libre(x, y);
      cerca.push(ve && v[2] >= 0 ? [x, y] : null); lejos.push(ve && v[2] < 0 ? [x, y] : null);
    }
    cx.save(); cx.setLineDash([2, 6]); cx.lineWidth = 1;
    cx.strokeStyle = 'rgba(' + ACENTO + ',' + (0.2 * a).toFixed(3) + ')'; trazo(cx, lejos, 0, N);
    cx.strokeStyle = 'rgba(' + ACENTO + ',' + (0.5 * a).toFixed(3) + ')'; trazo(cx, cerca, 0, N);
    cx.restore();
  }
  function onda(cx, xy, r, a) { if (a <= 0) return; cx.save(); cx.strokeStyle = 'rgba(' + ACENTO + ',' + (0.85 * a).toFixed(3) + ')'; cx.lineWidth = 1.3; cx.beginPath(); cx.arc(xy[0], xy[1], r, 0, 7); cx.stroke(); cx.restore(); }
  // the satellite itself: body, boom and two solar panels with their cells, in a soft glow
  function dibujoSatelite(cx, q, a) {
    const [x, y] = q; cx.save(); cx.globalAlpha = a;
    const g = cx.createRadialGradient(x, y, 0, x, y, 22); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(0.4, 'rgba(' + ACENTO + ',.18)'); g.addColorStop(1, 'rgba(' + ACENTO + ',0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 22, 0, 7); cx.fill();
    cx.strokeStyle = 'rgba(' + BLANCO + ',.85)'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(x - 7, y); cx.lineTo(x + 7, y); cx.stroke();
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? x - 19 : x + 7; cx.fillStyle = 'rgba(' + ACENTO + ',.92)'; cx.fillRect(x0, y - 3.5, 12, 7);
      cx.strokeStyle = 'rgba(6,8,12,.55)'; cx.lineWidth = 0.8; cx.beginPath(); for (const k of [4, 8]) { cx.moveTo(x0 + k, y - 3.5); cx.lineTo(x0 + k, y + 3.5); } cx.moveTo(x0, y); cx.lineTo(x0 + 12, y); cx.stroke();
    }
    cx.fillStyle = '#F4F6F8'; cx.fillRect(x - 3.5, y - 3.5, 7, 7);
    cx.strokeStyle = 'rgba(244,246,248,.9)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y + 6.5, 3, Math.PI * 1.15, Math.PI * 1.85, true); cx.stroke(); // the dish, facing the Earth
    cx.restore();
  }
  const SAT_T0 = 2000, SAT_SUBE = 2800, SAT_PAUSA = 450, SAT_BAJA = 2800, SAT_FIN = SAT_T0 + SAT_SUBE + SAT_PAUSA + SAT_BAJA;
  function pintaSatelite(cx, p, G, now) {
    const L = V.rutas.origen, S = V.sat, N = 64, t = now - V.tSat, aparece = Math.max(0, Math.min(1, (t - 600) / 900));
    anillo(cx, p, G, aparece);
    if (aparece > 0.5) etiqueta(cx, proy(p, G, L.lon, L.lat), T('Tú') + ' · ' + L.nombre, true, true, true);
    const sube = tramoSat(p, G, L, S.S0, true, N), baja = tramoSat(p, G, S.S0, S.D, false, N);
    const f1 = (t - SAT_T0) / SAT_SUBE, f2 = (t - SAT_T0 - SAT_SUBE - SAT_PAUSA) / SAT_BAJA;
    cx.save(); cx.globalAlpha = aparece; cx.setLineDash([3, 5]); cx.strokeStyle = 'rgba(' + BLANCO + ',.3)'; cx.lineWidth = 1; trazo(cx, sube, 0, N); trazo(cx, baja, 0, N); cx.restore();
    if (f1 > 0) pulso(cx, sube, Math.min(1, f1), N, true);
    if (f2 > 0) pulso(cx, baja, Math.min(1, f2), N, true);
    const q = sube[N];
    if (q) {
      dibujoSatelite(cx, q, aparece);
      const fl = (t - SAT_T0 - SAT_SUBE) / 800; if (fl > 0 && fl < 1) { onda(cx, q, 10 + 30 * fl, 1 - fl); onda(cx, q, 10 + 14 * fl, (1 - fl) * 0.6); }
      // its name: to the right when there is room, otherwise above it (the beams arrive from below), otherwise to the left
      const txt = T('Órbita geoestacionaria') + ' · ' + T('no a escala'); cx.font = '500 10.5px "IBM Plex Mono", ui-monospace, monospace';
      const w = cx.measureText(txt).width;
      const sitio = q[0] + 26 + w <= G.W - 16 ? [q[0] + 15, q[1] - 15] : q[1] - 30 > 70 ? [Math.max(16, Math.min(G.W - 16 - w, q[0] - w / 2)) - 11, q[1] - 30] : [q[0] - 37 - w, q[1] - 15];
      if (aparece > 0.5) etiqueta(cx, sitio, txt, false, false, true);
    }
    const llega = t - SAT_FIN, xy = punto(cx, p, G, S.D.lon, S.D.lat, llega >= 0 ? 3.4 : 2.4, llega >= 0 ? '#F4F6F8' : 'rgba(' + BLANCO + ',.7)');
    if (xy && llega >= 0) { if (llega < 1000) { onda(cx, xy, 4 + 24 * llega / 1000, 1 - llega / 1000); } etiqueta(cx, xy, corto(S.D) + ' · ' + continente(S.D.region), true, false, true); }
  }
  function centroDe(ns) { let x = 0, y = 0, z = 0; for (const n of ns) { const v = vec(n.lon, n.lat); x += v[0]; y += v[1]; z += v[2]; } const m = Math.hypot(x, y, z) || 1; return { lat: Math.asin(y / m) / RAD, lon: Math.atan2(x / m, z / m) / RAD }; }
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
    h.querySelector('.informe').addEventListener('click', () => informe(V && V.rutas, { pdf: true }));
    h.querySelector('.video').addEventListener('click', descargaVideo);
    return h;
  }
  function empieza(rutas) {
    const r = rutas || (C() && C().datos.rutas); if (!r || !r.nubes || !r.nubes.length || !r.origen || !P()) return;
    // the map's network first, so the journey travels along the cables from its first frame (a few hundred ms at most)
    if (window.OrbitaRed && !window.OrbitaRed.lista && !empieza.intentado) { empieza.intentado = true; window.OrbitaRed.prepara().then(() => empieza(rutas)); return; }
    const h = hud(); h.hidden = false; h.classList.remove('final'); h.querySelector('.fin').hidden = true; h.querySelector('.centro').style.opacity = '0';
    document.body.classList.add('viaje');
    const porCont = new Map(); for (const n of r.nubes) { const k = continente(n.region); if (!porCont.has(k)) porCont.set(k, []); porCont.get(k).push(n); }
    const grupos = [...porCont.entries()].map(([k, ns]) => { ns.sort((a, b) => a.ms - b.ms); const c = centroDe(ns); return { k, nubes: ns, lon: c.lon, lat: c.lat, km: Math.min(...ns.map((n) => n.km)), abre: Math.max(...ns.map((n) => angulo(c, n))) }; }).sort((a, b) => a.km - b.km);
    V = { rutas: r, porKm: r.nubes.slice().sort((a, b) => a.km - b.km), grupos, grupo: null, sat: ejemploSatelite(r), fase: 'intro', t0: performance.now(), salta: false, cam: null };
    if (window.OrbitaCapas) window.OrbitaCapas.soloTu(true, pintaViaje);
    const hora = new Date(r.fin || r.cuando || Date.now()).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' });
    h.querySelector('.sub').textContent = T('Medido ahora desde') + ' ' + r.origen.nombre + ' · ' + hora + (r.borde ? ' · ' + T('borde') + ': ' + r.borde.nombre : '') + ' · ' + (window.OrbitaRed && window.OrbitaRed.lista ? T('conexiones medidas, trayectos por los cables del mapa') : T('conexiones medidas, trayectorias ilustrativas'));
    camara(r.origen.lon, r.origen.lat, 1.7, 1600);
    h.querySelector('.video').hidden = true;
    if (!esTactil()) empiezaGrabacion();
    requestAnimationFrame(paso);
  }
  function termina() {
    if (!V) return; V = null; paraGrabacion();
    const h = $('viaje'); if (h) h.hidden = true;
    document.body.classList.remove('viaje', 'viaje-fin');
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
    const desde = now - V.t0, dt = Math.min(100, now - (V.prev || now)); V.prev = now;
    if (V.fase === 'intro') {
      if (desde > 2600 || V.salta) { V.salta = false; despliega(now); }
    } else if (V.fase === 'despliegue') {
      const t = now - V.tDesp, ultimo = Math.max(...V.porKm.map(durDe)), llegados = V.porKm.filter((n) => t >= durDe(n));
      h.querySelector('.ms').textContent = num(Math.min(Math.max(...r.nubes.map((n) => n.ms)), Math.round(t / LENTO)));
      h.querySelector('.km').textContent = num(llegados.length ? Math.round(Math.max(...llegados.map((n) => n.km))) : 0);
      h.querySelector('.luz').textContent = num(llegados.length) + ' / ' + num(r.nubes.length) + ' ' + T('destinos medidos');
      if (t > ultimo + 1600 || V.salta) { V.salta = false; siguienteGrupo(now); }
    } else if (V.fase === 'repaso') {
      if (now - V.tGrupo > 4700 || V.salta) { V.salta = false; siguienteGrupo(now); }
    } else if (V.fase === 'satelite') {
      const t = now - V.tSat, f = Math.max(0, Math.min(1, (t - SAT_T0) / (SAT_FIN - SAT_T0)));
      h.querySelector('.km').textContent = num(Math.round(71572 * f)); h.querySelector('.ms').textContent = num(Math.round(477 * f));
      if (t > SAT_FIN + 2700 || V.salta) { V.salta = false; final(now); }
    } else if (V.fase === 'final') {
      if (!V.tFin) V.tFin = now;
      // the planet keeps turning, slowly, with the whole web on it — until the person takes it: then it is theirs to turn
      // and zoom (23 Oct 2026, 10:43, owner: «he tocado el planeta y no me deja moverlo… y que tenga zoom»)
      if (!cam && !V.libre) { const p = P(), v = p && p.vista; if (v) p.ir(v.lon + 0.0025 * dt, L.lat, 1); }
      if (REC.on && now - V.tFin > 7000) paraGrabacion(); // seven more seconds of the turning planet, then the file closes
    }
    requestAnimationFrame(paso);
  }
  // 1. every path at once, slowly, from your city
  function despliega(now) {
    const h = hud(), r = V.rutas, L = r.origen;
    V.fase = 'despliegue'; V.tDesp = now + 400;
    camara(L.lon, L.lat * 0.6, 1.05, 1600);
    h.querySelector('.destino').textContent = T('Hemos medido tu conexión con') + ' ' + r.nubes.length + ' ' + T('regiones del mundo');
    h.querySelector('.cifras').style.visibility = ''; h.querySelector('.km').textContent = '0'; h.querySelector('.ms').textContent = '0';
    h.querySelector('.luz').style.opacity = '1'; h.querySelector('.centro').style.opacity = '1';
  }
  // 2. the review: the camera visits each continent, nearest first, with its destinations named
  function siguienteGrupo(now) {
    const h = hud(), g = V.grupos.shift();
    if (!g) { if (V.sat) satelite(now); else final(now); return; }
    V.fase = 'repaso'; V.grupo = g; V.tGrupo = now;
    // close enough to tell the destinations apart, never so close that the planet fills the screen and hides where the
    // lines come from (23 Oct 2026: a single destination took ×2.6 and the counters sat on bright desert)
    const z = Math.max(1.05, Math.min(1.8, 1.25 / Math.max(0.3, g.abre * 2)));
    camara(g.lon, g.lat, z, 1300);
    const m = g.nubes[0];
    h.querySelector('.destino').textContent = g.k.toUpperCase() + ' · ' + (g.nubes.length > 1 ? num(g.nubes.length) + ' ' + T('destinos medidos') : corto(m));
    h.querySelector('.km').textContent = num(Math.round(m.km)); h.querySelector('.ms').textContent = num(m.ms);
    h.querySelector('.luz').textContent = corto(m) + ' · ' + T('La luz en línea recta tardaría') + ' ' + num(Math.round(m.minimo)) + ' ms · ' + T('tus datos han tardado') + ' ' + num(m.ms) + ' ms';
    h.querySelector('.luz').style.opacity = '1'; h.querySelector('.centro').style.opacity = '1';
  }
  // 3. an example, marked as such: how a piece of data travels through a geostationary satellite
  function satelite(now) {
    const h = hud(), S = V.sat, L = V.rutas.origen;
    V.fase = 'satelite'; V.grupo = null; V.tSat = now;
    camara(S.C.lon, S.C.lat, 1, 1700);
    h.querySelector('.destino').textContent = T('Ejemplo · así viaja un dato por satélite');
    h.querySelector('.km').textContent = '0'; h.querySelector('.ms').textContent = '0';
    h.querySelector('.luz').textContent = T('Sube 35.786 km hasta un satélite geoestacionario y baja en otro continente: como mínimo 71.572 km y casi medio segundo de ida y vuelta.');
    h.querySelector('.luz').style.opacity = '1'; h.querySelector('.centro').style.opacity = '1';
  }
  // 4. the end: the whole planet, every path, the numbers
  function final(now) {
    const h = hud(), r = V.rutas, L = r.origen;
    V.fase = 'final'; V.grupo = null; h.classList.add('final');
    camara(L.lon, L.lat, 1, 1400);
    // from here the planet is the person's: a touch, a drag or the wheel stops the slow turn; the zoom rail comes back
    const p = P(), lienzo = p && p.lienzos && p.lienzos.tierra, rail = $('zoom'), este = V;
    const tecla = (e) => { if (/^[+\-=]$|^Arrow/.test(e.key)) toma(); };
    const toma = () => { removeEventListener('keydown', tecla); if (V && V === este && V.fase === 'final') { V.libre = true; cam = null; } };
    if (lienzo) lienzo.addEventListener('pointerdown', toma, { once: true });
    if (rail) rail.addEventListener('pointerdown', toma, { once: true });
    addEventListener('wheel', toma, { once: true, passive: true });
    addEventListener('keydown', tecla);
    document.body.classList.add('viaje-fin');
    h.querySelector('.centro').style.opacity = '0';
    const ms = r.nubes.map((n) => n.ms), lejos = r.nubes.slice().sort((a, b) => b.km - a.km)[0];
    h.querySelector('.fin .t').textContent = T('Así viajan tus datos');
    const parpadeo = r.nubes.filter((n) => n.ms <= 150).length;
    h.querySelector('.fin .d').textContent = num(r.nubes.length) + ' ' + T('destinos medidos') + ' · ' + T('de') + ' ' + num(Math.min(...ms)) + ' ' + T('a') + ' ' + num(Math.max(...ms)) + ' ms · ' + T('el más lejano') + ': ' + lejos.nombre + ', ' + num(Math.round(lejos.km)) + ' km' + (parpadeo ? ' · ' + T('en lo que dura un parpadeo (unos 150 ms) tus datos van y vuelven de') + ' ' + num(parpadeo) + ' ' + T('de ellos') : '');
    h.querySelector('.fin').hidden = false;
  }

  // ---------- the report ----------
  let FR = null;
  async function fronteras() { if (FR) return FR; try { const d = await (await fetch('datos/fronteras.json')).json(); FR = d.paises || []; } catch (_) { FR = []; } return FR; }
  function lienzo(w, h) { const c = document.createElement('canvas'); const dpr = Math.min(3, window.devicePixelRatio || 1); c.width = w * dpr; c.height = h * dpr; c.style.width = '100%'; c.style.maxWidth = w + 'px'; c.style.height = 'auto'; const cx = c.getContext('2d'); cx.scale(dpr, dpr); return [c, cx]; }
  // 1. the globe, both faces: an orthographic view centred on you and, smaller, the opposite face of the planet, so
  // the destinations behind the horizon are seen too; borders as fine lines, your arcs lifted above the surface
  function figuraGlobo(r, lineas, paradasV) {
    const W = 1100, H = 720, [c, cx] = lienzo(W, H), L = r.origen;
    cx.fillStyle = '#06080C'; cx.fillRect(0, 0, W, H);
    const esfera = (cLon, cLat, CX, CY, R, grande) => {
      const la = cLat * RAD, lo = cLon * RAD, cl = Math.cos(la), sl = Math.sin(la), co = Math.cos(lo), so = Math.sin(lo);
      const proy = (lon, lat, alza) => { const [x0, y0, z0] = vec(lon, lat); const x1 = x0 * co - z0 * so, z1 = x0 * so + z0 * co; const y2 = y0 * cl - z1 * sl, z2 = y0 * sl + z1 * cl; const h = 1 + (alza || 0); return { x: CX + R * x1 * h, y: CY - R * y2 * h, z: z2, ve: z2 > -0.015 }; }; // clipped at the horizon: an arc to the far side ends at the limb, it does not poke out of the sphere
      let g = cx.createRadialGradient(CX - R * 0.3, CY - R * 0.35, R * 0.1, CX, CY, R * 1.02); g.addColorStop(0, '#111822'); g.addColorStop(0.8, '#0A0E14'); g.addColorStop(1, '#06080C'); cx.fillStyle = g; cx.beginPath(); cx.arc(CX, CY, R, 0, 7); cx.fill();
      g = cx.createRadialGradient(CX, CY, R * 0.96, CX, CY, R * 1.06); g.addColorStop(0, 'rgba(' + ACENTO + ',0)'); g.addColorStop(0.5, 'rgba(' + ACENTO + ',.35)'); g.addColorStop(1, 'rgba(' + ACENTO + ',0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(CX, CY, R * 1.06, 0, 7); cx.fill();
      const linea = (puntos, alzaDe) => { cx.beginPath(); let prev = false; for (let i = 0; i < puntos.length; i++) { const q = proy(puntos[i][0], puntos[i][1], alzaDe ? alzaDe(i) : 0); if (q.ve && prev) cx.lineTo(q.x, q.y); else if (q.ve) cx.moveTo(q.x, q.y); prev = q.ve; } cx.stroke(); };
      cx.strokeStyle = 'rgba(' + ACENTO + ',.08)'; cx.lineWidth = 0.6;
      for (let lat = -60; lat <= 60; lat += 30) { const ps = []; for (let lon = -180; lon <= 180; lon += 3) ps.push([lon, lat]); linea(ps); }
      for (let lon = -180; lon < 180; lon += 30) { const ps = []; for (let lat = -90; lat <= 90; lat += 3) ps.push([lon, lat]); linea(ps); }
      cx.strokeStyle = 'rgba(' + ACENTO + ',' + (grande ? 0.38 : 0.3) + ')'; cx.lineWidth = 0.7;
      for (const l of lineas) linea(l);
      const arco = (n, fuerte) => {
        const va = vec(L.lon, L.lat), vb = vec(n.lon, n.lat), N = 80, ps = [];
        // the same trayecto as on the planet: along the map's network when there is a way (then flat on the sphere)
        const CN = window.OrbitaConexion, c = CN && CN.trayecto ? CN.trayecto(window.OrbitaPlaneta, L, n, N) : null, porRed = !!(c && c.red);
        for (let i = 0; i <= N; i++) { const w = porRed ? c.w[i] : slerp(va, vb, i / N); ps.push([Math.atan2(w[0], w[2]) / RAD, Math.asin(Math.max(-1, Math.min(1, w[1]))) / RAD]); }
        cx.strokeStyle = fuerte ? 'rgba(' + BLANCO + ',.95)' : 'rgba(' + ACENTO + ',.32)'; cx.lineWidth = fuerte ? (grande ? 1.8 : 1.3) : 0.8; if (fuerte) { cx.shadowColor = 'rgba(' + ACENTO + ',.9)'; cx.shadowBlur = 10; }
        linea(ps, (i) => porRed ? (c.alza && i <= c.alza.hasta ? (c.alza.alto - 1) * Math.sin(Math.PI * i / c.alza.hasta) : 0.004) : (fuerte ? 0.16 : 0.07) * Math.sin(Math.PI * i / N)); cx.shadowBlur = 0;
      };
      for (const n of r.nubes) if (!paradasV.includes(n)) arco(n, false);
      for (const n of paradasV) arco(n, true);
      const cajas = [];
      const rotulo = (txt, x, y, fuerte) => { cx.font = (fuerte ? '600 12px' : '500 11px') + ' "IBM Plex Mono", ui-monospace, monospace'; const w = cx.measureText(txt).width; for (const dy of [0, -13, 13, -26, 26]) { const b = [x - 2, y + dy - 7, x + w + 2, y + dy + 7]; if (cajas.some((k) => b[0] < k[2] && b[2] > k[0] && b[1] < k[3] && b[3] > k[1])) continue; cajas.push(b); cx.lineWidth = 3; cx.strokeStyle = 'rgba(6,8,12,.9)'; cx.strokeText(txt, x, y + dy); cx.fillStyle = '#F4F6F8'; cx.fillText(txt, x, y + dy); return; } };
      cx.textBaseline = 'middle'; cx.textAlign = 'left';
      const me = proy(L.lon, L.lat);
      if (me.z > 0) { cx.fillStyle = '#9CC3E4'; cx.beginPath(); cx.arc(me.x, me.y, 4.5, 0, 7); cx.fill(); cx.strokeStyle = 'rgba(' + ACENTO + ',.6)'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(me.x, me.y, 11, 0, 7); cx.stroke(); rotulo((T('Tú') + ' · ' + L.nombre).toUpperCase(), me.x + 16, me.y + 14, true); }
      for (const n of paradasV) { const q = proy(n.lon, n.lat); if (q.z <= 0) continue; cx.fillStyle = '#F4F6F8'; cx.beginPath(); cx.arc(q.x, q.y, 3, 0, 7); cx.fill(); rotulo(n.nombre.replace(/ \(.*\)/, '') + ' · ' + n.ms + ' ms', q.x + 9, q.y, false); }
      if (!grande) { cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textAlign = 'center'; cx.fillStyle = 'rgba(' + BLANCO + ',.6)'; cx.fillText(T('La otra cara del planeta').toUpperCase(), CX, CY + R + 22); }
    };
    esfera(L.lon, L.lat, 390, H / 2 + 6, 300, true);
    esfera(L.lon + 180, -L.lat, 880, H / 2 - 20, 150, false);
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
    const orden = r.nubes.slice().sort((a, b) => a.ms - b.ms), cajas = [[CX - 60, CY + 10, CX + 60, CY + 26]];
    orden.forEach((n, i) => {
      const a = rumbo(L, n) * RAD, rr = esc(n.ms), x = CX + rr * Math.sin(a), y = CY - rr * Math.cos(a), top = i < 5;
      cx.strokeStyle = top ? 'rgba(' + ACENTO + ',.9)' : 'rgba(' + BLANCO + ',.28)'; cx.lineWidth = top ? 1.6 : 0.9; cx.beginPath(); cx.moveTo(CX, CY); cx.lineTo(x, y); cx.stroke();
      cx.fillStyle = top ? '#9CC3E4' : 'rgba(' + BLANCO + ',.6)'; cx.beginPath(); cx.arc(x, y, top ? 3.2 : 2, 0, 7); cx.fill();
      if (top || i % 3 === 0) { const txt = n.nombre.replace(/ \(.*\)/, '') + ' ' + n.ms, der = Math.sin(a) >= 0; cx.font = (top ? '600 10.5px' : '400 9.5px') + ' "IBM Plex Mono", ui-monospace, monospace'; const w = cx.measureText(txt).width, x0 = der ? x + 7 : x - 7 - w; for (const dy of [0, -12, 12, -24, 24, -36, 36]) { const b = [x0 - 2, y + dy - 6, x0 + w + 2, y + dy + 6]; if (cajas.some((k) => b[0] < k[2] && b[2] > k[0] && b[1] < k[3] && b[3] > k[1])) continue; cajas.push(b); cx.textAlign = 'left'; cx.fillStyle = top ? '#F4F6F8' : 'rgba(' + BLANCO + ',.6)'; cx.fillText(txt, x0, y + dy); break; } }
    });
    cx.fillStyle = '#9CC3E4'; cx.beginPath(); cx.arc(CX, CY, 4, 0, 7); cx.fill();
    cx.textAlign = 'center'; cx.font = '600 11px "IBM Plex Mono", ui-monospace, monospace'; cx.fillStyle = '#F4F6F8'; cx.fillText((T('Tú') + ' · ' + L.nombre).toUpperCase(), CX, CY + 18);
    return c;
  }
  // 3. light against reality: for each destination, the physical minimum and what was measured
  function figuraLuz(r) {
    const filas = r.nubes.slice().sort((a, b) => a.ms - b.ms).slice(0, 16), W = 1100, fh = 26, H = 40 + filas.length * fh + 30, [c, cx] = lienzo(W, H);
    const maxMs = Math.max(...filas.map((n) => n.ms)), x0 = 250, ancho = W - x0 - 150, esc = (ms) => ancho * ms / maxMs;
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
  // 4. distance against time: every destination as a point; the line is the physical minimum for that distance
  function figuraDispersion(r) {
    const W = 1100, H = 420, [c, cx] = lienzo(W, H), x0 = 70, y0 = H - 50, ancho = W - x0 - 40, alto = y0 - 30;
    const maxKm = Math.max(...r.nubes.map((n) => n.km)) * 1.05, maxMs = Math.max(...r.nubes.map((n) => n.ms)) * 1.1;
    const X = (km) => x0 + ancho * km / maxKm, Y = (ms) => y0 - alto * ms / maxMs;
    cx.fillStyle = '#06080C'; cx.fillRect(0, 0, W, H);
    cx.strokeStyle = 'rgba(' + ACENTO + ',.18)'; cx.lineWidth = 0.8; cx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; cx.fillStyle = 'rgba(' + BLANCO + ',.55)'; cx.textBaseline = 'middle';
    for (let ms = 50; ms < maxMs; ms += 50) { cx.beginPath(); cx.moveTo(x0, Y(ms)); cx.lineTo(x0 + ancho, Y(ms)); cx.stroke(); cx.textAlign = 'right'; cx.fillText(ms + ' ms', x0 - 8, Y(ms)); }
    for (let km = 2000; km < maxKm; km += 2000) { cx.textAlign = 'center'; cx.fillText(num(km) + ' km', X(km), y0 + 16); }
    cx.strokeStyle = 'rgba(' + ACENTO + ',.85)'; cx.lineWidth = 1.4; cx.setLineDash([5, 4]); cx.beginPath(); cx.moveTo(X(0), Y(0)); cx.lineTo(X(maxKm), Y(minimoMs(maxKm))); cx.stroke(); cx.setLineDash([]);
    cx.textAlign = 'left'; cx.fillStyle = '#9CC3E4'; cx.fillText(T('mínimo de la luz por la fibra'), X(maxKm * 0.55) + 8, Y(minimoMs(maxKm * 0.55)) + 14);
    for (const n of r.nubes) { cx.fillStyle = 'rgba(' + BLANCO + ',.85)'; cx.beginPath(); cx.arc(X(n.km), Y(n.ms), 3.2, 0, 7); cx.fill(); }
    const top = r.nubes.slice().sort((a, b) => a.ms - b.ms); [top[0], top[Math.floor(top.length / 2)], top[top.length - 1]].forEach((n) => { if (!n) return; cx.fillStyle = '#F4F6F8'; cx.fillText(n.nombre.replace(/ \(.*\)/, '') + ' · ' + n.ms + ' ms', X(n.km) + 7, Y(n.ms) - 8); });
    return c;
  }
  const minimoMs = (km) => 2 * km / 200;
  // 5. by continent: the milliseconds over the physical minimum, on average, towards each part of the world
  function figuraContinentes(r) {
    const porCont = new Map();
    for (const n of r.nubes) { const k = continente(n.region); if (!porCont.has(k)) porCont.set(k, []); porCont.get(k).push(n); }
    const filas = [...porCont.entries()].map(([k, ns]) => ({ k, n: ns.length, extra: ns.reduce((s, n) => s + n.ms - n.minimo, 0) / ns.length, razon: ns.reduce((s, n) => s + n.ms / n.minimo, 0) / ns.length, ms: ns.reduce((s, n) => s + n.ms, 0) / ns.length })).sort((a, b) => a.extra - b.extra);
    const W = 1100, fh = 30, H = 24 + filas.length * fh + 16, [c, cx] = lienzo(W, H), x0 = 250, ancho = W - x0 - 230, maxExtra = Math.max(...filas.map((f) => f.extra)) || 1;
    cx.fillStyle = '#06080C'; cx.fillRect(0, 0, W, H);
    cx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle';
    filas.forEach((f, i) => {
      const y = 24 + i * fh, w = ancho * f.extra / maxExtra;
      cx.textAlign = 'right'; cx.fillStyle = '#F4F6F8'; cx.fillText(f.k + ' · ' + f.n, x0 - 12, y + 9);
      const g = cx.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, 'rgba(' + ACENTO + ',.9)'); g.addColorStop(1, 'rgba(' + ACENTO + ',.35)'); cx.fillStyle = g; cx.fillRect(x0, y, w, 18);
      cx.textAlign = 'left'; cx.fillStyle = 'rgba(' + BLANCO + ',.85)'; cx.fillText('+' + num(Math.round(f.extra)) + ' ms ' + T('de media') + ' · ×' + num(f.razon, 1) + ' · ' + num(Math.round(f.ms)) + ' ms', x0 + w + 8, y + 9);
    });
    return c;
  }
  async function informe(rutas, opciones) {
    const r = rutas || (C() && C().datos.rutas); if (!r || !r.nubes || !r.nubes.length || !r.origen) return;
    if (window.OrbitaRed && !window.OrbitaRed.lista) await window.OrbitaRed.prepara();
    const lineas = await fronteras(), paradasV = paradas(r), fuera = C() && C().datos.fuera;
    let a = $('informe'); if (a) a.remove();
    a = document.createElement('article'); a.id = 'informe'; a.className = 'informe'; a.setAttribute('aria-label', T('El viaje de tus datos'));
    const cuando = new Date(r.fin || r.cuando || Date.now());
    const orden = r.nubes.slice().sort((x, y) => x.ms - y.ms), mejor = orden[0], peor = orden[orden.length - 1];
    const porCont = new Map(); for (const n of orden) { const k = continente(n.region); if (!porCont.has(k)) porCont.set(k, n); }
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    // not a <header>: the page's own header rule would fix it to the top (23 Oct 2026: this comment had swallowed the
    // line that fills the block, so the report came out without its title, place and date)
    const cab = el('div', 'cab'), titulo = el('div', 'titulo'); cab.append(titulo); titulo.append(el('p', 'k', 'GUARDIANA · ÓRBITA'), el('h1', 't', T('El viaje de tus datos')), el('p', 's',r.origen.nombre + (r.origen.aprox ? ' (' + T('aproximada') + ')' : '') + (fuera && !fuera.error && fuera.operador ? ' · ' + fuera.operador : '') + ' · ' + cuando.toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + cuando.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }) + (r.borde ? ' · ' + T('borde de internet más cercano') + ': ' + r.borde.nombre + (r.borde.ms != null ? ' (' + r.borde.ms + ' ms)' : '') : '')));
    const acc = el('div', 'acciones'); const bPdf = el('button', '', T('Guardar PDF')); bPdf.type = 'button'; const bX = el('button', '', T('Cerrar')); bX.type = 'button'; acc.append(bPdf, bX, el('small', '', T('El PDF se descarga en tu equipo; no se envía a ningún sitio.'))); cab.append(acc);
    a.append(cab);
    const f1 = el('figure'); f1.append(figuraGlobo(r, lineas, paradasV)); f1.append(el('figcaption', '', T('Tu planeta: cada línea es un camino medido desde tu equipo; las brillantes, el más rápido de cada continente.') + ' ' + (window.OrbitaRed && window.OrbitaRed.lista ? T('Cada trayecto va por los cables submarinos y la fibra terrestre del mapa, por el camino más corto entre ellos. El cable exacto que usaron tus datos no se conoce desde fuera de la red.') : T('Conexiones medidas, trayectorias ilustrativas: el arco une origen y destino, no muestra por dónde fueron los paquetes.')))); a.append(f1);
    const cifras = el('section', 'cifras');
    const dato = (v, k) => { const d = el('div'); d.append(el('b', '', v), el('span', '', k)); return d; };
    cifras.append(dato(num(orden.length), T('destinos medidos')), dato(mejor.ms + ' ms', T('el más rápido') + ': ' + mejor.nombre.replace(/ \(.*\)/, '')), dato(num(Math.round(peor.km)) + ' km', T('el más lejano') + ': ' + peor.nombre.replace(/ \(.*\)/, '')), dato('×' + num(orden.reduce((s, n) => s + n.ms / n.minimo, 0) / orden.length, 1), T('tiempo medio sobre el mínimo físico')));
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
    const f5 = el('figure'); f5.append(figuraContinentes(r)); f5.append(el('figcaption', '', T('Por continente: los milisegundos de más sobre el mínimo físico, de media, hacia cada parte del mundo (destinos medidos, razón sobre el mínimo y tiempo medio).'))); a.append(f5);
    const f4 = el('figure'); f4.append(figuraDispersion(r)); f4.append(el('figcaption', '', T('Distancia frente a tiempo: cada punto es un destino; la línea de puntos es el mínimo físico para esa distancia. Lo que queda por encima son equipos, colas y caminos que no van rectos: no se traduce en kilómetros.'))); a.append(f4);
    const tabla = el('table'); const th = el('tr'); [T('Destino'), T('Continente'), 'ms', 'km', T('mínimo'), '× ' + T('mínimo')].forEach((k) => th.append(el('th', '', k))); tabla.append(th);
    for (const n of orden) { const tr = el('tr'); [n.nombre, continente(n.region), n.ms + ' ms', num(Math.round(n.km)), num(Math.round(n.minimo)) + ' ms', '×' + num(n.ms / n.minimo, 1)].forEach((v) => tr.append(el('td', '', v))); tabla.append(tr); }
    a.append(tabla);
    a.append(el('p', 'pie', T('Son tus datos y de nadie más: este informe se ha generado en tu equipo y no se ha enviado a ningún sitio.') + ' · GUARDIANA · guardianagroup.com'));
    document.body.append(a); document.body.classList.add('con-informe');
    const cierra = () => { a.remove(); document.body.classList.remove('con-informe'); };
    bX.addEventListener('click', cierra);
    bPdf.addEventListener('click', () => pdfInforme(a, bPdf));
    if (opciones && opciones.pdf) setTimeout(() => pdfInforme(a, bPdf), 120);
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { cierra(); document.removeEventListener('keydown', esc); } });
    a.scrollTop = 0;
  }
  // ---------- the PDF (23 Oct 2026, 09:24, owner: «cuando le doy a guardar el viaje en PDF, la pantalla se queda
  // bloqueada y no hace nada»): the print dialog does not open in every browser (in some embedded ones it never shows and
  // the page waits for it). The report is photographed here (html2canvas, MIT, served from this site), cut into A4 pages
  // at the edges of its blocks, and written as a PDF of images by the small writer below; nothing leaves the computer.
  const BASE_V = (() => { try { const u = document.currentScript && document.currentScript.src; return u ? u.replace(/[^\/]*$/, '') : 'static/'; } catch (_) { return 'static/'; } })();
  function cargaScript(src) { return new Promise((ok, mal) => { const e = document.createElement('script'); e.src = src; e.onload = ok; e.onerror = mal; document.head.append(e); }); }
  const jpeg = (c) => new Promise((ok) => c.toBlob((b) => b.arrayBuffer().then((x) => ok(new Uint8Array(x))), 'image/jpeg', 0.9));
  function pdfDeImagenes(paginas) {
    const enc = new TextEncoder(), partes = [], ofs = []; let pos = 0;
    const pon = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; partes.push(b); pos += b.length; };
    const obj = (id, cuerpo) => { ofs[id] = pos; pon(id + ' 0 obj\n'); cuerpo(); pon('\nendobj\n'); };
    const W = 595.28, H = 841.89, n = paginas.length;
    pon('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n');
    obj(1, () => pon('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => pon('<< /Type /Pages /Kids [' + paginas.map((_, i) => (3 + 3 * i) + ' 0 R').join(' ') + '] /Count ' + n + ' >>'));
    paginas.forEach((pg, i) => {
      const Pg = 3 + 3 * i, Cn = 4 + 3 * i, Im = 5 + 3 * i, cs = 'q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im0 Do Q';
      obj(Pg, () => pon('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 ' + Im + ' 0 R >> >> /Contents ' + Cn + ' 0 R >>'));
      obj(Cn, () => { pon('<< /Length ' + cs.length + ' >>\nstream\n'); pon(cs); pon('\nendstream'); });
      obj(Im, () => { pon('<< /Type /XObject /Subtype /Image /Width ' + pg.w + ' /Height ' + pg.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + pg.bytes.length + ' >>\nstream\n'); pon(pg.bytes); pon('\nendstream'); });
    });
    const total = 3 + 3 * n, xref = pos;
    pon('xref\n0 ' + total + '\n0000000000 65535 f \n');
    for (let i = 1; i < total; i++) pon(String(ofs[i]).padStart(10, '0') + ' 00000 n \n');
    pon('trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(partes, { type: 'application/pdf' });
  }
  async function pdfInforme(a, boton) {
    if (!a || !a.isConnected || pdfInforme.ocupado) return; pdfInforme.ocupado = true;
    const antes = boton.textContent; boton.disabled = true; boton.textContent = T('Preparando el PDF…');
    try {
      if (!window.html2canvas) await cargaScript(BASE_V + 'vendor/html2canvas.min.js');
      const ar = a.getBoundingClientRect(), ancho = a.clientWidth, alto = a.scrollHeight, k = Math.min(2, 2400 / Math.max(1, ancho));
      // where the pages may break: the top of every block, so no figure, paragraph or row is cut in two
      const cortes = [...a.querySelectorAll('.cab, figure, .cifras, .dos, h2, p, table, tr, .pie')].map((e) => Math.round((e.getBoundingClientRect().top - ar.top + a.scrollTop) * k)).filter((y) => y > 0).sort((x, y) => x - y);
      const lienzo = await window.html2canvas(a, {
        backgroundColor: '#06080C', scale: k, width: ancho, height: alto, windowWidth: innerWidth, windowHeight: alto, logging: false, useCORS: true,
        onclone: (doc) => { const x = doc.getElementById('informe'); if (!x) return; Object.assign(x.style, { position: 'absolute', inset: 'auto', left: '0', top: '0', boxSizing: 'border-box', width: ancho + 'px', height: 'auto', overflow: 'visible' }); /* border-box: with its side padding inside the width, as on screen (without it the right edge was cut off) */ const ac = x.querySelector('.acciones'); if (ac) ac.style.visibility = 'hidden'; }
      });
      const PW = lienzo.width, PH = Math.round(PW * 297 / 210), paginas = [];
      for (let y = 0; y < lienzo.height - 4;) {
        let fin = Math.min(lienzo.height, y + PH);
        if (fin < lienzo.height) { const c = cortes.filter((v) => v > y + PH * 0.45 && v <= y + PH); if (c.length) fin = c[c.length - 1]; }
        const pg = document.createElement('canvas'); pg.width = PW; pg.height = PH; const g = pg.getContext('2d');
        g.fillStyle = '#06080C'; g.fillRect(0, 0, PW, PH); g.drawImage(lienzo, 0, y, PW, fin - y, 0, 0, PW, fin - y);
        paginas.push({ w: PW, h: PH, bytes: await jpeg(pg) });
        y = fin;
      }
      const blob = pdfDeImagenes(paginas), enl = document.createElement('a');
      enl.href = URL.createObjectURL(blob); enl.download = 'GUARDIANA-' + T('El viaje de tus datos').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') + '-' + new Date().toISOString().slice(0, 10) + '.pdf';
      document.body.append(enl); enl.click(); setTimeout(() => { URL.revokeObjectURL(enl.href); enl.remove(); }, 60000);
      boton.textContent = antes;
    } catch (e) {
      boton.textContent = T('No se pudo crear el PDF');
      setTimeout(() => { boton.textContent = antes; }, 3000);
    } finally { boton.disabled = false; pdfInforme.ocupado = false; }
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && V) termina(); });
  window.OrbitaViaje = { empieza, informe, get activo() { return !!V; } };
})();
