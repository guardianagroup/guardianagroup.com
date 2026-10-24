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
  const corto = (n) => T(n.nombre.replace(/ \(.*\)/, '')); // the place in the page's language (idioma.js has the 33 metros)
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
      if (!cam && !V.libre) { const p = P(), v = p && p.vista; if (v) p.ir(v.lon - 0.0025 * dt, L.lat, 1); } // the slow turn goes the Earth's way, as the idle planet
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
    h.querySelector('.fin .d').textContent = num(r.nubes.length) + ' ' + T('destinos medidos') + ' · ' + T('de X a Y ms').replace('X', num(Math.min(...ms))).replace('Y', num(Math.max(...ms))) + ' · ' + T('el más lejano') + ': ' + T(lejos.nombre) + ', ' + num(Math.round(lejos.km)) + ' km' + (parpadeo ? ' · ' + T('en lo que dura un parpadeo (unos 150 ms) tus datos van y vuelven de') + ' ' + num(parpadeo) + ' ' + T('de ellos') : '');
    h.querySelector('.fin').hidden = false;
  }

  // ---------- the report ----------
  // 24 Oct 2026 (owner, looking at it: «el mapa lo veo demasiado digital… quiero que lo hagas con mayor realismo y mejor
  // calidad»; the compass «dale más profesionalidad»; the scatter «más entendible y más profesional»). One language for
  // the five figures: the site's own faces (Hanken Grotesk, IBM Plex Mono for the small capitals, Schibsted Grotesk for
  // titles), one colour per continent in every figure, each canvas drawn at the width it is shown (sharp on a phone and on
  // a dense screen, drawn again when that width changes) and labels that never sit on one another. The globe is the real
  // Earth (the site's own day texture, pixel by pixel in an orthographic view) with soft daylight and a thin atmosphere.
  // Every number is what «Mi conexión» measured; the lines are drawn paths, not the packets' real route.
  const FONDO = '#0A0E14', TINTA = '#F4F6F8', TINTA2 = '#C4CCD5', TINTA3 = '#A9B3BE', AZUL = '#9CC3E4';
  const REJILLA = 'rgba(244,246,248,.08)', EJE = 'rgba(244,246,248,.28)';
  // One colour per continent, the same in every figure, in a fixed order (west to east). Chosen with the data-viz method
  // and its validator: OKLCH lightness 0.51–0.67 and chroma ≥ 0.11 on this dark surface; away from coral (cuts), amber
  // (money) and the steel accent (you, and the light); the continents that sit side by side in some figure (the two
  // Americas in the scatter; the Middle East beside Europe, Asia, Africa and Oceania; Asia beside Oceania) stay ≥ 15
  // apart (OKLab ΔE ×100) and ≥ 9 under protanopia and deuteranopia; every mark ≥ 3.2:1 on the surface. Seven colours
  // cannot all be told apart by colour alone, so the points that matter carry their name, and the legend, the card under
  // the pointer and the table name the rest.
  const CONTINENTES = [['América del Norte', '#1AA9A5'], ['América del Sur', '#1F73B6'], ['África', '#28864B'], ['Europa', '#7F8CE0'], ['Oriente Medio', '#CB629E'], ['Asia', '#909E19'], ['Oceanía', '#7051B0']];
  const COLOR_CONT = Object.fromEntries(CONTINENTES);
  const colorDe = (n) => COLOR_CONT[contKey(n.region)] || TINTA3;
  const conAlfa = (hex, a) => 'rgba(' + [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',') + ',' + a + ')';
  const mayus1 = (s) => (s ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : s);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  // the site's faces, read from its own CSS (a canvas never waits for a font: drawn too early it prints the fallback)
  const varCss = (v, d) => { try { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || d; } catch (_) { return d; } };
  let FAM = null;
  const familia = (k) => (FAM || (FAM = { texto: varCss('--texto', "'Hanken Grotesk', system-ui, sans-serif"), mono: varCss('--mono', "'IBM Plex Mono', ui-monospace, monospace"), titulo: varCss('--display', "'Schibsted Grotesk', system-ui, sans-serif") }))[k];
  const letra = (peso, px, k) => peso + ' ' + px + 'px ' + familia(k || 'texto');
  function fuentes() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const pide = [letra(400, 12), letra(500, 12), letra(600, 12), letra(400, 11, 'mono'), letra(500, 11, 'mono')].map((f) => document.fonts.load(f).catch(() => null));
    return Promise.race([Promise.all(pide), new Promise((ok) => setTimeout(ok, 3000))]);
  }
  const espacia = (cx, px) => { if ('letterSpacing' in cx) cx.letterSpacing = (px || 0) + 'px'; }; // spaced small capitals, as on the rest of the site

  // a canvas drawn at the width it is shown, at least twice as dense as a CSS pixel (the PDF photographs it at ×1.7)
  function lienzoA(c, W, H, leer) {
    const k = Math.max(2, Math.min(3, window.devicePixelRatio || 1));
    c.width = Math.round(W * k); c.height = Math.round(H * k); c.__W = W;
    const cx = c.getContext('2d', leer ? { willReadFrequently: true } : undefined); cx.setTransform(k, 0, 0, k, 0, 0); // `leer`: the globe paints pixel by pixel
    cx.fillStyle = FONDO; cx.fillRect(0, 0, W, H); cx.textBaseline = 'middle'; cx.lineJoin = 'round'; cx.lineCap = 'round'; espacia(cx, 0);
    return { cx, k };
  }
  // a line of text in pieces (name, figure…), each with its weight and ink; a halo first when it sits over a picture
  function mide(cx, partes) { let w = 0; for (const p of partes) { cx.font = p.f; w += cx.measureText(p.t).width; } return w; }
  function escribe(cx, x, y, partes, halo) {
    cx.textAlign = 'left';
    for (const pasada of halo ? ['halo', 'tinta'] : ['tinta']) {
      let xx = x;
      for (const p of partes) {
        cx.font = p.f;
        if (pasada === 'halo') { cx.lineWidth = halo.w; cx.strokeStyle = halo.c; cx.strokeText(p.t, xx, y); } else { cx.fillStyle = p.c; cx.fillText(p.t, xx, y); }
        xx += cx.measureText(p.t).width;
      }
    }
  }
  function pastilla(cx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  // a bar from its baseline, square there and with a 4 px round end
  function barra(cx, x, y, w, h) { if (w <= 0) return; const r = Math.min(4, w / 2, h / 2); cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + w - r, y); cx.arcTo(x + w, y, x + w, y + r, r); cx.lineTo(x + w, y + h - r); cx.arcTo(x + w, y + h, x + w - r, y + h, r); cx.lineTo(x, y + h); cx.closePath(); cx.fill(); }
  // does the segment cross the box? (Liang–Barsky)
  function cruza(x1, y1, x2, y2, b) {
    let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
    for (const [p, q] of [[-dx, x1 - b[0]], [dx, b[2] - x1], [-dy, y1 - b[1]], [dy, b[3] - y1]]) {
      if (p === 0) { if (q < 0) return false; continue; }
      const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return true;
  }
  const solapa = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  // Labels never sit on one another: each one weighs the places around its point (near, in its preferred direction,
  // not across the figure's own lines, its leader not across another label) and takes the best free one; the boxes
  // already taken (labels, points, reserved areas) and the frame decide what is free. A label set
  // away from its point gets a thin leader; one with no place is left out (the legend, the card and the table name it).
  function rotulador(marco, ocupado, op) {
    const o = op || {}, cajas = (ocupado || []).slice(), rotulos = [];
    const libre = (b) => b[0] >= marco[0] && b[1] >= marco[1] && b[2] <= marco[2] && b[3] <= marco[3] && !cajas.some((k) => solapa(b, k));
    return {
      cajas, libre, reserva: (b) => { cajas.push(b); },
      busca(x, y, r, w, h, dir) {
        let mejor = null;
        for (const d0 of [3, 9, 16, 26, 40, 58, 80]) for (const g of [0, 20, -20, 40, -40, 60, -60, 80, -80, 100, -100, 125, -125, 150, -150, 180]) {
          const a = dir + g * RAD, co = Math.cos(a), si = Math.sin(a), d = r + d0, ax = x + co * d, ay = y + si * d;
          let bx = co > 0.38 ? ax : co < -0.38 ? ax - w : ax - w / 2, by = si > 0.38 ? ay : si < -0.38 ? ay - h : ay - h / 2;
          // above or below its point, a name may slide sideways to stay inside the frame (still over its point); beside
          // it, up or down
          if (Math.abs(co) <= 0.38) { const nx = Math.min(Math.max(bx, marco[0] + 2), marco[2] - w - 2); if (nx <= x && nx + w >= x) bx = nx; }
          if (Math.abs(si) <= 0.38) { const ny = Math.min(Math.max(by, marco[1] + 1), marco[3] - h - 1); if (ny <= y && ny + h >= y) by = ny; }
          const b = [bx - 2, by - 1, bx + w + 2, by + h + 1];
          let nota = d0 + Math.abs(g) * 0.3;
          if (mejor && nota >= mejor.nota) continue;
          if (!libre(b)) continue;
          if (o.segmentos) for (const s of o.segmentos) if (cruza(s[0], s[1], s[2], s[3], b)) nota += o.peso || 14;
          if (d0 > 9) { const qx = Math.max(b[0], Math.min(b[2], x)), qy = Math.max(b[1], Math.min(b[3], y)); for (const k of rotulos) if (cruza(x, y, qx, qy, k)) nota += 40; }
          if (!mejor || nota < mejor.nota) mejor = { nota, x: bx, y: by + h / 2, b, lejos: d0 > 9 };
        }
        if (mejor) { cajas.push(mejor.b); rotulos.push(mejor.b); }
        return mejor;
      },
    };
  }
  // a set of names: a few orders are tried (as given, the most important first, the reverse) and the one that leaves the
  // fewest names out (the important ones weigh more) with the shortest leaders wins; then they are drawn
  function rotula(cx, marco, ocupado, op, items, halo, tintaGuia) {
    let mejor = null;
    for (const orden of [items, items.slice().sort((a, b) => (b.peso || 1) - (a.peso || 1) || (b.d || 0) - (a.d || 0)), items.slice().reverse()]) {
      const rot = rotulador(marco, ocupado, op); let total = 0;
      const res = orden.map((it) => { const s = rot.busca(it.x, it.y, it.r, mide(cx, it.partes), it.h, it.dir); total += s ? s.nota : 260 * (it.peso || 1); return { it, s }; });
      if (!mejor || total < mejor.total) mejor = { total, res };
    }
    for (const { it, s } of mejor.res) {
      if (!s) continue;
      if (s.lejos) { if (it.casco) guia(cx, it.x, it.y, it.r, s, it.casco, 3); guia(cx, it.x, it.y, it.r, s, tintaGuia, 1); }
      escribe(cx, s.x, s.y, it.partes, halo);
    }
  }
  // an axis's step and end: the smallest «nice» step (1, 2, 2.5 or 5 × 10ⁿ) that leaves `minPx` between two ticks
  function escala(max, largo, minPx) {
    const e0 = Math.floor(Math.log10(Math.max(max, 1e-9)));
    for (let e = e0 - 2; e <= e0 + 2; e++) for (const m of [1, 2, 2.5, 5]) { const paso = m * Math.pow(10, e), n = Math.max(1, Math.ceil(max / paso - 1e-9)); if (largo / n >= minPx) return { paso, tope: n * paso }; }
    return { paso: max, tope: max };
  }
  function guia(cx, x, y, r, s, color, ancho) {
    const b = s.b, qx = Math.max(b[0], Math.min(b[2], x)), qy = Math.max(b[1], Math.min(b[3], y)), d = Math.hypot(qx - x, qy - y);
    if (d < r + 4) return;
    cx.strokeStyle = color; cx.lineWidth = ancho || 1; cx.beginPath(); cx.moveTo(x + (qx - x) / d * (r + 2), y + (qy - y) / d * (r + 2)); cx.lineTo(qx, qy); cx.stroke();
  }
  // the fastest destination of each continent (the bright paths, the named points)
  function rapidosPorContinente(r) { const m = new Map(); for (const n of r.nubes) { const k = contKey(n.region); if (!m.has(k) || m.get(k).ms > n.ms) m.set(k, n); } return [...m.values()]; }
  const razon = (n) => (n.minimo > 0 ? n.ms / n.minimo : null);
  // what the card under the pointer says of one destination (the same values as the table)
  const fichaDe = (n) => ({ t: T(n.nombre), l: [continente(n.region) + ' · ' + n.ms + ' ms', num(Math.round(n.km)) + ' km ' + T('en línea recta') + ' · ' + T('mínimo') + ' ' + num(Math.round(n.minimo)) + ' ms' + (razon(n) ? ' · ×' + num(razon(n), 1) : '')] });

  // ---------- 1. the globe: the real Earth, both faces ----------
  // The day texture of the planet (the site's own, already in the browser's cache) as pixels, at three sizes: each
  // globe reads the size nearest one texel per pixel, a coarser one towards the limb, so nothing shimmers.
  let TEX = null;
  function textura() {
    if (!TEX) TEX = new Promise((ok, mal) => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => {
        try {
          const niveles = []; let w = im.naturalWidth, h = im.naturalHeight, fuente = im;
          for (let i = 0; i < 3 && w >= 512; i++) {
            const c = document.createElement('canvas'); c.width = w; c.height = h;
            const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(fuente, 0, 0, w, h);
            niveles.push({ w, h, d: g.getImageData(0, 0, w, h).data }); fuente = c; w >>= 1; h >>= 1;
          }
          ok(niveles);
        } catch (e) { mal(e); }
      };
      im.onerror = () => mal(new Error('textura'));
      im.src = (document.documentElement.dataset.tierra || 'static/tierra/') + 'dia.jpg';
    }).catch(() => null);
    return TEX;
  }
  const LUZ = (() => { const v = [-0.45, 0.52, 0.72], m = Math.hypot(v[0], v[1], v[2]); return v.map((x) => x / m); })(); // daylight from the upper left, as on the front page
  // Orthographic Earth centred on (lon0, lat0): for each pixel, the point of the sphere under it, its colour in the
  // texture (bilinear), soft daylight (no night side), a little blue haze towards the limb and, outside, the thin glow of
  // the atmosphere (the front page's planet does the same on the graphics card; here it is 2D so the PDF can take it).
  function pintaTierra(cx, k, G, lon0, lat0, niv) {
    const cw = cx.canvas.width, ch = cx.canvas.height, Rk = G.R * k, ck = G.CX * k, rk = G.CY * k, M = 1.08;
    const x0 = Math.max(0, Math.floor(ck - Rk * M)), y0 = Math.max(0, Math.floor(rk - Rk * M)), x1 = Math.min(cw, Math.ceil(ck + Rk * M)), y1 = Math.min(ch, Math.ceil(rk + Rk * M)), bw = x1 - x0, bh = y1 - y0;
    if (bw <= 0 || bh <= 0) return;
    const img = cx.getImageData(x0, y0, bw, bh), d = img.data;
    const la = lat0 * RAD, lo = lon0 * RAD, cl = Math.cos(la), sl = Math.sin(la), co = Math.cos(lo), so = Math.sin(lo);
    let base = 0; while (base < niv.length - 1 && niv[base + 1].w / (2 * Math.PI) >= Rk * 0.92) base++;
    const AR = 156, AG = 195, AB = 228, Lx = LUZ[0], Ly = LUZ[1], Lz = LUZ[2], PI2 = 2 * Math.PI, borde = 1 + 1 / Rk;
    for (let py = 0; py < bh; py++) {
      const v = (rk - (y0 + py + 0.5)) / Rk;
      for (let px = 0; px < bw; px++) {
        const u = (x0 + px + 0.5 - ck) / Rk, r2 = u * u + v * v;
        if (r2 > M * M) continue;
        const i = (py * bw + px) * 4, rr = Math.sqrt(r2);
        const brillo = rr > 1 ? 0.4 * Math.pow(Math.max(0, 1 - (rr - 1) / 0.075), 2.4) : 0.4; // the glow outside
        if (rr >= borde) { d[i] += (AR - d[i]) * brillo; d[i + 1] += (AG - d[i + 1]) * brillo; d[i + 2] += (AB - d[i + 2]) * brillo; continue; }
        const s = rr > 0.9999 ? 0.9999 / rr : 1, uu = u * s, vv = v * s, z = Math.sqrt(Math.max(0, 1 - uu * uu - vv * vv));
        // view → world (the inverse of vistaDe), then latitude and longitude
        const wy = vv * cl + z * sl, z1 = z * cl - vv * sl, wx = uu * co + z1 * so, wz = z1 * co - uu * so;
        const lat = Math.asin(wy > 1 ? 1 : wy < -1 ? -1 : wy), lon = Math.atan2(wx, wz);
        const t = niv[Math.min(niv.length - 1, base + (z < 0.4 ? 1 : 0) + (z < 0.17 ? 1 : 0))], tw = t.w, th = t.h, td = t.d;
        let fx = (lon / PI2 + 0.5) * tw - 0.5, fy = (0.5 - lat / Math.PI) * th - 0.5;
        if (fy < 0) fy = 0; else if (fy > th - 1.001) fy = th - 1.001;
        const ix = Math.floor(fx), iy = Math.floor(fy), ax = fx - ix, ay = fy - iy, xa = ((ix % tw) + tw) % tw, xb = xa + 1 === tw ? 0 : xa + 1;
        const p00 = (iy * tw + xa) * 4, p10 = (iy * tw + xb) * 4, p01 = p00 + tw * 4, p11 = p10 + tw * 4;
        const w00 = (1 - ax) * (1 - ay), w10 = ax * (1 - ay), w01 = (1 - ax) * ay, w11 = ax * ay;
        let R = td[p00] * w00 + td[p10] * w10 + td[p01] * w01 + td[p11] * w11;
        let Gc = td[p00 + 1] * w00 + td[p10 + 1] * w10 + td[p01 + 1] * w01 + td[p11 + 1] * w11;
        let B = td[p00 + 2] * w00 + td[p10 + 2] * w10 + td[p01 + 2] * w01 + td[p11 + 2] * w11;
        const lam = uu * Lx + vv * Ly + z * Lz, luz = 0.6 + 0.55 * Math.pow(lam > 0 ? lam : 0, 0.85);
        const h = 0.5 * Math.pow(1 - z, 2.3);
        R = R * luz; Gc = Gc * luz; B = B * luz;
        R += (AR - R) * h; Gc += (AG - Gc) * h; B += (AB - B) * h;
        const cub = (1 - rr) * Rk + 0.5; // the limb, antialiased against the glow
        if (cub < 1) { const c0 = cub > 0 ? cub : 0, gr = d[i] + (AR - d[i]) * brillo, gg = d[i + 1] + (AG - d[i + 1]) * brillo, gb = d[i + 2] + (AB - d[i + 2]) * brillo; R = gr + (R - gr) * c0; Gc = gg + (Gc - gg) * c0; B = gb + (B - gb) * c0; }
        d[i] = R; d[i + 1] = Gc; d[i + 2] = B; d[i + 3] = 255;
      }
    }
    cx.putImageData(img, x0, y0);
  }
  // without the texture (it could not load): a quiet disc, the same place for the lines
  function discoSimple(cx, G) { const g = cx.createRadialGradient(G.CX - G.R * 0.3, G.CY - G.R * 0.35, G.R * 0.1, G.CX, G.CY, G.R); g.addColorStop(0, '#17212D'); g.addColorStop(1, '#0B1119'); cx.fillStyle = g; cx.beginPath(); cx.arc(G.CX, G.CY, G.R, 0, 7); cx.fill(); cx.strokeStyle = 'rgba(156,195,228,.4)'; cx.lineWidth = 1; cx.stroke(); }
  // world → this figure's view (the same rotation as the planet's)
  function vistaDe(G, lon0, lat0) {
    const la = lat0 * RAD, lo = lon0 * RAD, cl = Math.cos(la), sl = Math.sin(la), co = Math.cos(lo), so = Math.sin(lo);
    return (w, h) => { const x1 = w[0] * co - w[2] * so, z1 = w[0] * so + w[2] * co, y2 = w[1] * cl - z1 * sl, z2 = w[1] * sl + z1 * cl; return [G.CX + G.R * x1 * (h || 1), G.CY - G.R * y2 * (h || 1), z2]; };
  }
  function dibujaGlobo(c, W, r, rapidos, niv) {
    const L = r.origen, ancho = W >= 720;
    let H, G1, G2;
    // wide: the two faces side by side, the pair centred, room between them for the names; narrow: one over the other
    if (ancho) {
      H = Math.round(Math.max(440, Math.min(720, W * 0.56))); const R1 = Math.min(H * 0.43, W * 0.3), R2 = R1 * 0.47, hueco = Math.max(70, R1 * 0.38), x0 = (W - (2 * R1 + hueco + 2 * R2)) / 2;
      G1 = { CX: x0 + R1, CY: H / 2, R: R1 }; G2 = { CX: x0 + 2 * R1 + hueco + R2, CY: H / 2 - 10, R: R2 };
    } else { const R1 = Math.min(W * 0.43, 260), R2 = R1 * 0.6; G1 = { CX: W / 2, CY: R1 + 26, R: R1 }; G2 = { CX: W / 2, CY: 2 * R1 + 26 + 44 + R2, R: R2 }; H = Math.round(G2.CY + R2 + 46); }
    const { cx, k } = lienzoA(c, W, H, true), fs = ancho ? 12.5 : 11.5;
    const caras = [{ G: G1, lon: L.lon, lat: L.lat, grande: true }, { G: G2, lon: L.lon + 180, lat: -L.lat, grande: false }];
    for (const f of caras) { if (niv) pintaTierra(cx, k, f.G, f.lon, f.lat, niv); else discoSimple(cx, f.G); f.v = vistaDe(f.G, f.lon, f.lat); }
    // the paths: the same trayectos as on the planet (along the map's network when there is a way, the great circle
    // otherwise, the satellite leg lifted); faint ones first, the fastest of each continent bright on top
    const N = 96, CN = window.OrbitaConexion, va = vec(L.lon, L.lat);
    const tray = r.nubes.map((n) => {
      const t = CN && CN.trayecto ? CN.trayecto(window.OrbitaPlaneta, L, n, N) : null, red = !!(t && t.red && t.w && t.w.length > N), vb = vec(n.lon, n.lat), fuerte = rapidos.includes(n), ws = [], hs = [];
      for (let i = 0; i <= N; i++) {
        ws.push(red ? t.w[i] : slerp(va, vb, i / N));
        hs.push(red ? (t.alza && i <= t.alza.hasta ? 1 + (t.alza.alto - 1) * Math.sin(Math.PI * i / t.alza.hasta) : 1.004) : 1 + (fuerte ? 0.16 : 0.07) * Math.sin(Math.PI * i / N));
      }
      return { n, ws, hs, fuerte, color: colorDe(n) };
    });
    const traza = (v, t) => { cx.beginPath(); let prev = false; for (let i = 0; i <= N; i++) { const q = v(t.ws[i], t.hs[i]), ve = q[2] > -0.015; if (ve && prev) cx.lineTo(q[0], q[1]); else if (ve) cx.moveTo(q[0], q[1]); prev = ve; } cx.stroke(); };
    for (const f of caras) {
      const e = f.grande ? 1 : 0.8;
      cx.strokeStyle = 'rgba(6,8,12,.4)'; cx.lineWidth = 2.8 * e; for (const t of tray) if (!t.fuerte) traza(f.v, t);
      cx.strokeStyle = 'rgba(244,246,248,.5)'; cx.lineWidth = 1 * e; for (const t of tray) if (!t.fuerte) traza(f.v, t);
      cx.strokeStyle = 'rgba(6,8,12,.55)'; cx.lineWidth = 4.6 * e; for (const t of tray) if (t.fuerte) traza(f.v, t);
      cx.save(); cx.shadowColor = 'rgba(156,195,228,.95)'; cx.shadowBlur = 7 * k * e; cx.strokeStyle = TINTA; cx.lineWidth = 1.9 * e; for (const t of tray) if (t.fuerte) traza(f.v, t); cx.restore();
    }
    // the destinations: a badge in the continent's colour (light ring, dark edge: it reads over sea, forest and desert)
    const ocupado = [], sitios = [];
    for (const f of caras) {
      f.marcas = [];
      for (const t of tray) {
        const q = f.v(vec(t.n.lon, t.n.lat), 1.004); if (q[2] <= 0.02) continue;
        const rr = (t.fuerte ? 4.4 : 2.8) * (f.grande ? 1 : 0.85);
        cx.beginPath(); cx.arc(q[0], q[1], rr + 2.8, 0, 7); cx.fillStyle = 'rgba(6,8,12,.55)'; cx.fill();
        cx.beginPath(); cx.arc(q[0], q[1], rr + 1.5, 0, 7); cx.fillStyle = TINTA; cx.fill();
        cx.beginPath(); cx.arc(q[0], q[1], rr, 0, 7); cx.fillStyle = t.color; cx.fill();
        f.marcas.push({ x: q[0], y: q[1], r: rr + 2, t }); ocupado.push([q[0] - rr - 2, q[1] - rr - 2, q[0] + rr + 2, q[1] + rr + 2]);
        sitios.push(Object.assign({ x: q[0], y: q[1], r: rr + 3 }, fichaDe(t.n)));
      }
    }
    // you, at the centre of the large face
    const yo = caras[0].v(va, 1.004);
    cx.strokeStyle = 'rgba(156,195,228,.7)'; cx.lineWidth = 1.3; cx.beginPath(); cx.arc(yo[0], yo[1], 12, 0, 7); cx.stroke();
    cx.beginPath(); cx.arc(yo[0], yo[1], 7.4, 0, 7); cx.fillStyle = 'rgba(6,8,12,.6)'; cx.fill();
    cx.beginPath(); cx.arc(yo[0], yo[1], 6.2, 0, 7); cx.fillStyle = TINTA; cx.fill();
    cx.beginPath(); cx.arc(yo[0], yo[1], 4.6, 0, 7); cx.fillStyle = AZUL; cx.fill();
    ocupado.push([yo[0] - 13, yo[1] - 13, yo[0] + 13, yo[1] + 13]);
    // the small face's name, under it
    const otra = T('La otra cara del planeta').toUpperCase(); cx.font = letra(500, 10.5, 'mono'); espacia(cx, 1.1);
    const ow = cx.measureText(otra).width, oy = G2.CY + G2.R + (ancho ? 26 : 24);
    cx.fillStyle = TINTA3; cx.textAlign = 'center'; cx.fillText(otra, G2.CX, oy); espacia(cx, 0);
    ocupado.push([G2.CX - ow / 2 - 4, oy - 9, G2.CX + ow / 2 + 4, oy + 9]);
    // the names: you first, then the fastest of each continent (the fastest of all first), each beside its badge
    const marco = [6, 6, W - 6, H - 6], halo = { w: 4, c: 'rgba(6,8,12,.85)' };
    { const partes = [{ t: (T('Tú') + ' · ' + L.nombre).toUpperCase(), f: letra(600, fs - 0.5), c: TINTA }], s = rotulador(marco, ocupado).busca(yo[0], yo[1], 13, mide(cx, partes), fs + 3, 0.35); if (s) { escribe(cx, s.x, s.y, partes, halo); ocupado.push(s.b); } }
    const items = [];
    for (const t of tray.filter((x) => x.fuerte).sort((a, b) => a.n.ms - b.n.ms)) {
      for (const f of caras) {
        const m = f.marcas.find((x) => x.t === t); if (!m) continue;
        const partes = [{ t: corto(t.n), f: letra(600, f.grande ? fs : fs - 1), c: TINTA }, { t: '  ' + t.n.ms + ' ms', f: letra(500, f.grande ? fs - 0.5 : fs - 1.5), c: TINTA2 }];
        const dir = Math.hypot(m.x - f.G.CX, m.y - f.G.CY) < f.G.R * 0.2 ? 0 : Math.atan2(m.y - f.G.CY, m.x - f.G.CX);
        items.push({ x: m.x, y: m.y, r: m.r, partes, h: (f.grande ? fs : fs - 1) + 3, dir, casco: 'rgba(6,8,12,.6)' });
      }
    }
    rotula(cx, marco, ocupado, null, items, halo, 'rgba(244,246,248,.8)');
    c.__puntos = sitios;
  }

  // ---------- 2. the compass of times: a polar chart, true bearing from you, the round trip as the distance ----------
  // the rings: a «nice» outer value just above the slowest destination, and up to three inner ones, well apart on the
  // square-root scale (it gives the near destinations room; the rings say what each distance means)
  function anillos(maxMs) {
    const BON = [10, 20, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000, 10000];
    const tope = BON.find((v) => v >= maxMs * 1.02) || Math.ceil(maxMs * 1.02 / 1000) * 1000, out = [tope];
    let ult = 1;
    for (let i = BON.length - 1; i >= 0 && out.length < 4; i--) { const v = BON[i]; if (v >= tope) continue; const f = Math.sqrt(v / tope); if (ult - f >= 0.16 && f >= 0.3) { out.unshift(v); ult = f; } }
    return out;
  }
  function dibujaBrujula(c, W, r, rapidos) {
    const H = W < 440 ? Math.round(W + 60) : W, { cx } = lienzoA(c, W, H), L = r.origen; // on a phone, a band above and below the dial for the names
    const marg = W < 400 ? 34 : 40, CX = W / 2, CY = H / 2, Rm = W / 2 - marg, R0 = 8;
    const maxMs = Math.max(...r.nubes.map((n) => n.ms)), aros = anillos(maxMs), tope = aros[aros.length - 1];
    const rad = (ms) => Rm * Math.sqrt(Math.max(0, ms) / tope);
    const pts = r.nubes.map((n) => { const a = rumbo(L, n) * RAD, d = rad(n.ms); return { n, a, d, x: CX + d * Math.sin(a), y: CY - d * Math.cos(a), top: rapidos.includes(n), color: colorDe(n) }; });
    // the widest empty sector: the ring values and your name go there, where no spoke passes
    const angs = pts.map((p) => ((p.a / RAD) % 360 + 360) % 360).sort((x, y) => x - y);
    let hueco = { mid: 180, ancho: 360 };
    if (angs.length > 1) { hueco = { mid: 0, ancho: -1 }; angs.forEach((a0, i) => { const a1 = i + 1 < angs.length ? angs[i + 1] : angs[0] + 360, g = a1 - a0; if (g > hueco.ancho) hueco = { mid: (a0 + g / 2) % 360, ancho: g }; }); }
    else if (angs.length === 1) hueco = { mid: (angs[0] + 180) % 360, ancho: 360 };
    // 1. the rings, the compass ticks and the four letters
    cx.lineWidth = 1;
    for (const v of aros) { cx.strokeStyle = v === tope ? EJE : 'rgba(244,246,248,.12)'; cx.beginPath(); cx.arc(CX, CY, rad(v), 0, 7); cx.stroke(); }
    for (let g = 0; g < 360; g += 5) {
      const l = g % 90 === 0 ? 9 : g % 30 === 0 ? 6 : g % 10 === 0 ? 4 : 2, q = g * RAD, s = Math.sin(q), co = Math.cos(q);
      cx.strokeStyle = g % 30 === 0 ? 'rgba(244,246,248,.45)' : 'rgba(244,246,248,.2)'; cx.beginPath(); cx.moveTo(CX + Rm * s, CY - Rm * co); cx.lineTo(CX + (Rm + l) * s, CY - (Rm + l) * co); cx.stroke();
    }
    const ocupado = [];
    cx.font = letra(600, 12); cx.fillStyle = TINTA2; cx.textAlign = 'center';
    for (const [t, g] of [[T('N'), 0], [T('E'), 90], [T('S'), 180], [T('O'), 270]]) { const q = g * RAD, x = CX + (Rm + 21) * Math.sin(q), y = CY - (Rm + 21) * Math.cos(q); cx.fillText(t, x, y); ocupado.push([x - 9, y - 9, x + 9, y + 9]); }
    // 2. the spokes (the fastest of each continent stronger, on top) and, over them, the ring values across the empty sector
    const orden = pts.slice().sort((p, q) => (p.top - q.top) || (q.n.ms - p.n.ms));
    for (const p of orden) { cx.strokeStyle = conAlfa(p.color, p.top ? 0.8 : 0.36); cx.lineWidth = p.top ? 1.5 : 1; cx.beginPath(); cx.moveTo(CX + R0 * Math.sin(p.a), CY - R0 * Math.cos(p.a)); cx.lineTo(p.x, p.y); cx.stroke(); }
    // the ring values go along a nearly vertical bearing (so they stack, never side by side): the one fewest spokes cross
    const radios = pts.map((p) => [CX + R0 * Math.sin(p.a), CY - R0 * Math.cos(p.a), p.x, p.y]);
    cx.font = letra(400, 10.5, 'mono');
    const cajasAro = (g) => aros.map((v) => { const d = rad(v), x = CX + d * Math.sin(g), y = CY - d * Math.cos(g), w = cx.measureText(num(v) + ' ms').width + 10; return [x - w / 2, y - 8, x + w / 2, y + 8]; });
    let gq = Math.PI, cruces = Infinity;
    for (const gd of [180, 172, 188, 164, 196, 156, 204, 0, 8, 352, 16, 344, 148, 212, 24, 336]) {
      const g = gd * RAD, cs = cajasAro(g); let n = 0;
      for (const b of cs) { for (const s of radios) if (cruza(s[0], s[1], s[2], s[3], b)) n++; for (const p of pts) if (p.x > b[0] - 6 && p.x < b[2] + 6 && p.y > b[1] - 6 && p.y < b[3] + 6) n += 3; }
      if (n < cruces) { cruces = n; gq = g; if (!n) break; }
    }
    for (const v of aros) {
      const d = rad(v), x = CX + d * Math.sin(gq), y = CY - d * Math.cos(gq), txt = num(v) + ' ms', w = cx.measureText(txt).width + 10;
      pastilla(cx, x - w / 2, y - 8, w, 16, 8); cx.fillStyle = FONDO; cx.fill();
      cx.fillStyle = TINTA3; cx.textAlign = 'center'; cx.fillText(txt, x, y + 0.5); ocupado.push([x - w / 2, y - 8, x + w / 2, y + 8]);
    }
    // 3. the points, each with a ring of the surface where they touch
    for (const p of orden) {
      const rr = p.top ? 5 : 4; cx.beginPath(); cx.arc(p.x, p.y, rr + 2, 0, 7); cx.fillStyle = FONDO; cx.fill();
      cx.beginPath(); cx.arc(p.x, p.y, rr, 0, 7); cx.fillStyle = p.color; cx.fill(); ocupado.push([p.x - rr - 1, p.y - rr - 1, p.x + rr + 1, p.y + rr + 1]);
    }
    // 4. you: the dot at the centre and, in a small pill beside it, your place, set where no spoke passes
    cx.strokeStyle = 'rgba(156,195,228,.55)'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(CX, CY, 8, 0, 7); cx.stroke();
    cx.beginPath(); cx.arc(CX, CY, 4.2, 0, 7); cx.fillStyle = AZUL; cx.fill();
    const tu = T('Tú') + ' · ' + L.nombre; cx.font = letra(600, 11.5); const pw = cx.measureText(tu).width + 20, ph = 22;
    let sitio = null;
    for (let d = 18; d <= Rm * 0.7 && !sitio; d += 3) for (const off of [0, 12, -12, 24, -24, 36, -36, 50, -50, 65, -65, 80, -80, 100, -100, 125, -125, 150, -150, 180]) {
      const q = (hueco.mid + off) * RAD, x = CX + d * Math.sin(q), y = CY - d * Math.cos(q), b = [x - pw / 2, y - ph / 2, x + pw / 2, y + ph / 2];
      if (b[0] < 4 || b[2] > W - 4 || b[1] < 4 || b[3] > H - 4) continue;
      if (CX > b[0] - 10 && CX < b[2] + 10 && CY > b[1] - 10 && CY < b[3] + 10) continue;
      if (radios.some((s) => cruza(s[0], s[1], s[2], s[3], b)) || ocupado.some((o) => solapa(o, b))) continue;
      sitio = b; break;
    }
    if (sitio) {
      const qx = Math.max(sitio[0], Math.min(sitio[2], CX)), qy = Math.max(sitio[1], Math.min(sitio[3], CY)), dd = Math.hypot(qx - CX, qy - CY);
      if (dd > 10) { cx.strokeStyle = 'rgba(156,195,228,.55)'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(CX + (qx - CX) / dd * 9, CY + (qy - CY) / dd * 9); cx.lineTo(qx, qy); cx.stroke(); }
    } else sitio = [6, 6, 6 + pw + 14, 6 + ph]; // no free place inside (destinations in every direction): the corner, with the same dot
    pastilla(cx, sitio[0], sitio[1], sitio[2] - sitio[0], ph, ph / 2); cx.fillStyle = 'rgba(10,14,20,.96)'; cx.fill(); cx.strokeStyle = 'rgba(156,195,228,.6)'; cx.lineWidth = 1; cx.stroke();
    cx.font = letra(600, 11.5); cx.fillStyle = TINTA; cx.textAlign = 'left';
    if (sitio[0] === 6 && sitio[1] === 6) { cx.beginPath(); cx.arc(sitio[0] + 12, sitio[1] + ph / 2, 3.6, 0, 7); cx.fillStyle = AZUL; cx.fill(); cx.fillStyle = TINTA; cx.fillText(tu, sitio[0] + 22, sitio[1] + ph / 2 + 0.5); }
    else cx.fillText(tu, sitio[0] + 10, sitio[1] + ph / 2 + 0.5);
    ocupado.push(sitio);
    // 5. the names: the fastest of each continent and the slowest of all, beside the point or led out to a free place
    const lento = pts.reduce((m, p) => (p.n.ms > m.n.ms ? p : m), pts[0]);
    const nombrados = pts.filter((p) => p.top).sort((a, b) => a.n.ms - b.n.ms); if (lento && !lento.top) nombrados.push(lento);
    const fsz = W < 400 ? 11.5 : 12;
    rotula(cx, [4, 4, W - 4, H - 4], ocupado, { segmentos: radios, peso: 12 }, nombrados.map((p) => ({ x: p.x, y: p.y, r: p.top ? 6 : 5, d: p.d, partes: [{ t: corto(p.n), f: letra(600, fsz), c: TINTA }, { t: ' ' + p.n.ms + ' ms', f: letra(500, fsz - 0.5), c: TINTA3 }], h: fsz + 3, dir: p.a - Math.PI / 2 })), { w: 3.2, c: FONDO }, 'rgba(244,246,248,.42)');
    c.__puntos = pts.map((p) => Object.assign({ x: p.x, y: p.y, r: 7 }, fichaDe(p.n)));
  }

  // ---------- 3. light against reality: the fastest destinations, the light's minimum inside each bar ----------
  function dibujaLuz(c, W, r) {
    const filas = r.nubes.slice().sort((a, b) => a.ms - b.ms).slice(0, 16), estrecho = W < 560;
    const fh = estrecho ? 25 : 27, arriba = 48, H = arriba + filas.length * fh + 8, { cx } = lienzoA(c, W, H), fn = estrecho ? 12 : 12.5;
    cx.font = letra(500, fn); const nombreW = Math.min(W * (estrecho ? 0.42 : 0.3), Math.max(...filas.map((n) => cx.measureText(corto(n)).width)) + 20);
    // on a phone the bar keeps the room and the times-the-minimum stays in the table and the card
    const valW = mide(cx, [{ t: '888 ms', f: letra(600, 12) }].concat(estrecho ? [] : [{ t: '  ×8,8', f: letra(500, 12) }])) + 12;
    const x0 = nombreW + 10, x1 = W - valW, maxMs = Math.max(...filas.map((n) => n.ms)), { paso, tope } = escala(maxMs, x1 - x0, 58);
    const X = (ms) => x0 + (x1 - x0) * ms / tope;
    // the axis: its title, the values, a hairline grid behind the bars
    cx.font = letra(500, 12); cx.fillStyle = TINTA2; cx.textAlign = 'left'; cx.fillText(T('Ida y vuelta medida (ms)'), x0, 10);
    cx.font = letra(400, 10.5, 'mono'); cx.textAlign = 'center';
    for (let v = 0; v <= tope + 1e-9; v += paso) { const x = X(v); cx.fillStyle = TINTA3; cx.fillText(num(v), x, arriba - 16); cx.strokeStyle = v === 0 ? EJE : REJILLA; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(Math.round(x) + 0.5, arriba - 6); cx.lineTo(Math.round(x) + 0.5, H - 6); cx.stroke(); }
    const zonas = [];
    filas.forEach((n, i) => {
      const y = arriba + i * fh + fh / 2, bh = estrecho ? 11 : 12, col = colorDe(n);
      cx.beginPath(); cx.arc(5, y, 4, 0, 7); cx.fillStyle = col; cx.fill();
      let nom = corto(n); cx.font = letra(500, fn); while (nom.length > 3 && cx.measureText(nom).width > nombreW - 18) nom = nom.slice(0, -2) + '…';
      cx.fillStyle = TINTA; cx.textAlign = 'left'; cx.fillText(nom, 15, y + 0.5);
      // the measured round trip; inside it, from the baseline, the light's minimum (2 px of surface between the two)
      const xm = X(n.ms), xl = X(Math.min(n.minimo, n.ms));
      cx.fillStyle = 'rgba(244,246,248,.24)'; barra(cx, x0, y - bh / 2, xm - x0, bh);
      cx.fillStyle = FONDO; cx.fillRect(xl - 1, y - bh / 2, 2, bh);
      cx.fillStyle = AZUL; cx.fillRect(x0, y - bh / 2, Math.max(0, xl - 1 - x0), bh);
      escribe(cx, xm + 8, y + 0.5, [{ t: n.ms + ' ms', f: letra(600, 12), c: TINTA }].concat(razon(n) && !estrecho ? [{ t: '  ×' + num(razon(n), 1), f: letra(500, 12), c: TINTA3 }] : []));
      zonas.push(Object.assign({ b: [0, y - fh / 2, W, y + fh / 2] }, fichaDe(n)));
    });
    c.__puntos = zonas;
  }

  // ---------- 4. by continent: the milliseconds over the physical minimum, on average ----------
  function dibujaContinentes(c, W, r) {
    const g = new Map(); for (const n of r.nubes) { const k = contKey(n.region); if (!g.has(k)) g.set(k, []); g.get(k).push(n); }
    const media = (ns, f) => ns.reduce((s, n) => s + f(n), 0) / ns.length;
    const filas = [...g.entries()].map(([k, ns]) => ({ k, color: COLOR_CONT[k] || TINTA3, n: ns.length, extra: media(ns, (n) => n.ms - n.minimo), razon: media(ns, (n) => (n.minimo > 0 ? n.ms / n.minimo : 0)), ms: media(ns, (n) => n.ms) })).sort((a, b) => a.extra - b.extra);
    // wide: name, bar and, in two columns on the right, times the minimum and the average round trip; on a phone each
    // continent takes two lines (its name and those two values, then the bar) so the bar keeps its length
    const ancho = W >= 640, fh = ancho ? 34 : 48, arriba = 48, H = arriba + filas.length * fh + 6, { cx } = lienzoA(c, W, H), fn = ancho ? 13 : 12.5;
    cx.font = letra(500, fn); const nombreW = Math.max(...filas.map((f) => cx.measureText(T(f.k)).width + cx.measureText(' · ' + f.n).width)) + 22;
    const colR = W - 116, colM = W - 8;
    const tipW = mide(cx, [{ t: '+888 ms', f: letra(600, 12.5) }]) + 14;
    const x0 = ancho ? Math.min(nombreW + 12, W * 0.36) : 16, x1 = (ancho ? colR - 64 : W) - tipW;
    const maxE = Math.max(1, ...filas.map((f) => f.extra)), { paso, tope } = escala(maxE, x1 - x0, 58);
    const X = (v) => x0 + (x1 - x0) * Math.max(0, v) / tope;
    cx.font = letra(500, 12); cx.fillStyle = TINTA2; cx.textAlign = 'left'; cx.fillText(T('Milisegundos de más sobre el mínimo, de media'), x0, 10);
    if (ancho) { cx.textAlign = 'right'; cx.fillText('× ' + T('mínimo'), colR, 10); cx.fillText(T('Tiempo medio'), colM, 10); }
    cx.font = letra(400, 10.5, 'mono'); cx.textAlign = 'center';
    const bajo = ancho ? 0 : 9; // the bar's line inside a row
    for (let v = 0; v <= tope + 1e-9; v += paso) { const x = X(v); cx.fillStyle = TINTA3; cx.fillText((v ? '+' : '') + num(v), x, arriba - 16); cx.strokeStyle = v === 0 ? EJE : REJILLA; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(Math.round(x) + 0.5, arriba - 6); cx.lineTo(Math.round(x) + 0.5, H - 4); cx.stroke(); }
    const zonas = [];
    filas.forEach((f, i) => {
      const y = arriba + i * fh + fh / 2, yn = ancho ? y : y - 10, yb = y + bajo;
      const extra = '+' + num(Math.round(f.extra)) + ' ms', rz = '×' + num(f.razon, 1), md = num(Math.round(f.ms)) + ' ms';
      if (!ancho) { cx.fillStyle = FONDO; cx.fillRect(12, yn - 9, W - 12, 18); } // the name's line stands clear of the grid
      cx.beginPath(); cx.arc(5, yn, 4.5, 0, 7); cx.fillStyle = f.color; cx.fill();
      escribe(cx, 16, yn + 0.5, [{ t: T(f.k), f: letra(500, fn), c: TINTA }, { t: ' · ' + f.n, f: letra(500, fn), c: TINTA3 }]);
      cx.fillStyle = f.color; barra(cx, x0, yb - (ancho ? 7 : 6), X(f.extra) - x0, ancho ? 14 : 12);
      escribe(cx, X(f.extra) + 8, yb + 0.5, [{ t: extra, f: letra(600, 12.5), c: TINTA }]);
      cx.font = letra(500, ancho ? 12.5 : 12); cx.fillStyle = TINTA2; cx.textAlign = 'right';
      if (ancho) { cx.fillText(rz, colR, y + 0.5); cx.fillText(md, colM, y + 0.5); } else cx.fillText(rz + ' · ' + md, W - 2, yn + 0.5);
      zonas.push({ b: [0, y - fh / 2, W, y + fh / 2], t: T(f.k), l: [num(f.n) + ' ' + T('destinos medidos'), extra + ' ' + T('de media') + ' · ' + rz + ' · ' + T('Tiempo medio') + ' ' + md] });
    });
    c.__puntos = zonas;
  }

  // ---------- 5. how fast your data travelled: each destination's speed as a share of light in fibre ----------
  // 24 Oct 2026 (owner, on the distance-against-time scatter: «cambia el formato por completo… otro y más profesional»).
  // One bar per destination, fastest against light first: the time light would take through fibre in a straight line
  // divided by the time measured, as a percentage. Two times compared: nothing is turned into kilometres and no route is
  // claimed. The line at 100 % is that light; the faint track behind each bar is what the detours took. On a phone, the
  // first twelve and how many more (the table lists them all).
  function dibujaVelocidad(c, W, r) {
    const estrecho = W < 560, todas = r.nubes.filter((n) => n.ms > 0).map((n) => ({ n, pct: 100 * n.minimo / n.ms })).sort((a, b) => b.pct - a.pct || a.n.ms - b.n.ms);
    const filas = estrecho ? todas.slice(0, 12) : todas, resto = todas.length - filas.length;
    const fh = estrecho ? 25 : 24, arriba = 50, abajo = resto > 0 ? 34 : 8, H = arriba + filas.length * fh + abajo, { cx } = lienzoA(c, W, H), fn = estrecho ? 12 : 12.5;
    const pc = (p) => (p / 100).toLocaleString(loc(), { style: 'percent', maximumFractionDigits: 0 });
    cx.font = letra(500, fn); const nombreW = Math.min(W * (estrecho ? 0.42 : 0.3), Math.max(...filas.map((f) => cx.measureText(corto(f.n)).width)) + 20);
    const valW = mide(cx, [{ t: pc(100), f: letra(600, 12) }]) + 14;
    const paso = estrecho ? 50 : 25, tope = Math.ceil(Math.max(100, ...filas.map((f) => f.pct)) / paso) * paso; // past 100 % only if a measurement says so
    const x0 = nombreW + 10, x1 = W - valW - 4, X = (p) => x0 + (x1 - x0) * Math.max(0, p) / tope, x100 = Math.round(X(100)) + 0.5, fondo = H - abajo;
    // the axis: its title (wide), the values with a hairline grid, and the light's line at 100 %, named over it
    const ref = mayus1(T('la luz por fibra, en línea recta'));
    cx.font = letra(500, 12); const refW = cx.measureText(ref).width;
    cx.fillStyle = TINTA2; cx.textAlign = 'right'; cx.fillText(ref, Math.min(W - 4, x100 + 1), 10);
    if (!estrecho) { const tt = T('Velocidad, en % de la luz por fibra'); if (x0 + cx.measureText(tt).width + 24 < Math.min(W - 4, x100 + 1) - refW) { cx.textAlign = 'left'; cx.fillText(tt, x0, 10); } }
    cx.font = letra(400, 10.5, 'mono'); cx.textAlign = 'center';
    for (let v = 0; v <= tope + 1e-9; v += paso) { const x = Math.round(X(v)) + 0.5; cx.fillStyle = TINTA3; cx.fillText(pc(v), x, arriba - 16); if (v !== 100) { cx.strokeStyle = v === 0 ? EJE : REJILLA; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(x, arriba - 6); cx.lineTo(x, fondo); cx.stroke(); } }
    const zonas = [], bh = estrecho ? 11 : 12;
    filas.forEach((f, i) => {
      const y = arriba + i * fh + fh / 2, n = f.n, col = colorDe(n), xb = X(f.pct);
      cx.beginPath(); cx.arc(5, y, 4, 0, 7); cx.fillStyle = col; cx.fill();
      let nom = corto(n); cx.font = letra(500, fn); while (nom.length > 3 && cx.measureText(nom).width > nombreW - 18) nom = nom.slice(0, -2) + '…';
      cx.fillStyle = TINTA; cx.textAlign = 'left'; cx.fillText(nom, 15, y + 0.5);
      cx.fillStyle = 'rgba(244,246,248,.055)'; cx.fillRect(x0, y - bh / 2, Math.max(0, X(100) - x0), bh); // up to the light: what the detours took
      cx.fillStyle = col; barra(cx, x0, y - bh / 2, xb - x0, bh);
      // its value at the end of the bar; past the light's line when it would touch it
      const v = pc(f.pct); cx.font = letra(600, 12); const vw = cx.measureText(v).width;
      const xv = xb + 8 + vw > x100 - 5 && f.pct <= 100 ? x100 + 8 : xb + 8;
      escribe(cx, xv, y + 0.5, [{ t: v, f: letra(600, 12), c: TINTA }]);
      const ficha = fichaDe(n); ficha.l = ficha.l.concat(T('Velocidad, en % de la luz por fibra') + ': ' + v);
      zonas.push(Object.assign({ b: [0, y - fh / 2, W, y + fh / 2] }, ficha));
    });
    // the light's line, over the tracks, under its value and its name
    cx.strokeStyle = AZUL; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(x100, arriba - 6); cx.lineTo(x100, fondo); cx.stroke();
    if (resto > 0) { cx.font = letra(500, 12); cx.fillStyle = TINTA3; cx.textAlign = 'left'; cx.fillText(T('y {n} destinos más, en la tabla de abajo').replace('{n}', num(resto)), 15, H - 13); }
    c.__puntos = zonas;
  }

  // ---------- the page ----------
  // a figure: its title and legend over the canvas, the caption under it
  function figura(titulo, leyenda, pie) {
    const f = el('figure', 'grafico'), cab = el('div', 'g-cab'), c = document.createElement('canvas');
    cab.append(el('h3', 'g-t', titulo)); if (leyenda) cab.append(leyenda);
    c.setAttribute('role', 'img'); c.setAttribute('aria-label', titulo + '. ' + pie);
    f.append(cab, c, el('figcaption', '', pie));
    return { f, c };
  }
  function leyenda(items) {
    const ul = el('ul', 'leyenda');
    for (const it of items) { const li = el('li'), i = el('i', it.tipo || 'punto'); if (it.tipo === 'anillo') i.style.borderColor = it.c; else i.style.background = it.c; li.append(i, document.createTextNode(it.t)); ul.append(li); }
    return ul;
  }
  // the card under the pointer: the destination (or continent) nearest to it, with what was measured
  function puntero(a) {
    const tip = el('div', 'tip'); tip.hidden = true; tip.setAttribute('aria-hidden', 'true'); a.append(tip);
    let ultimo = null;
    const mira = (e) => {
      const c = e.target && e.target.tagName === 'CANVAS' ? e.target : null, ps = c && c.__puntos;
      if (!ps || !ps.length) { tip.hidden = true; ultimo = null; return; }
      const rc = c.getBoundingClientRect(), e2 = rc.width / (c.__W || rc.width), x = (e.clientX - rc.left) / e2, y = (e.clientY - rc.top) / e2;
      let mejor = null, dm = Infinity;
      for (const p of ps) {
        const d = p.b ? (x >= p.b[0] && x <= p.b[2] && y >= p.b[1] && y <= p.b[3] ? 0 : Infinity) : Math.hypot(p.x - x, p.y - y);
        if (d < dm && d <= (p.b ? 0 : Math.max(12, p.r + 6))) { dm = d; mejor = p; }
      }
      if (!mejor) { tip.hidden = true; ultimo = null; return; }
      if (mejor !== ultimo) { tip.textContent = ''; tip.append(el('b', '', mejor.t)); for (const l of mejor.l) tip.append(el('span', '', l)); ultimo = mejor; }
      tip.hidden = false;
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      tip.style.left = Math.max(8, Math.min(innerWidth - tw - 8, e.clientX + 16)) + 'px';
      tip.style.top = (e.clientY + 18 + th > innerHeight - 8 ? e.clientY - th - 14 : e.clientY + 18) + 'px';
    };
    a.addEventListener('pointermove', mira); a.addEventListener('pointerdown', mira);
    a.addEventListener('pointerleave', () => { tip.hidden = true; ultimo = null; });
    a.addEventListener('scroll', () => { tip.hidden = true; ultimo = null; }, { passive: true });
  }
  async function informe(rutas, opciones) {
    const r = rutas || (C() && C().datos.rutas); if (!r || !r.nubes || !r.nubes.length || !r.origen) return;
    if (window.OrbitaRed && !window.OrbitaRed.lista) await window.OrbitaRed.prepara();
    const fuera = C() && C().datos.fuera;
    { const viejo = $('informe'); if (viejo) { if (viejo.__cierra) viejo.__cierra(true); else viejo.remove(); } }
    const a = document.createElement('article'); a.id = 'informe'; a.className = 'informe'; a.setAttribute('aria-label', T('El viaje de tus datos'));
    const cuando = new Date(r.fin || r.cuando || Date.now());
    const orden = r.nubes.slice().sort((x, y) => x.ms - y.ms), mejor = orden[0], peor = orden.reduce((m, n) => (n.km > m.km ? n : m)); // «the farthest» by distance (it was the slowest), as at the journey's end
    const porCont = new Map(); for (const n of orden) { const k = continente(n.region); if (!porCont.has(k)) porCont.set(k, n); }
    const rapidos = rapidosPorContinente(r), presentes = CONTINENTES.filter(([k]) => r.nubes.some((n) => contKey(n.region) === k));
    const leyCont = (mas) => leyenda(presentes.map(([k, c]) => ({ t: T(k), c })).concat(mas || []));
    // not a <header>: the page's own header rule would fix it to the top (23 Oct 2026: this comment had swallowed the
    // line that fills the block, so the report came out without its title, place and date)
    const cab = el('div', 'cab'), titulo = el('div', 'titulo'); cab.append(titulo); titulo.append(el('p', 'k', 'GUARDIANA · ÓRBITA'), el('h1', 't', T('El viaje de tus datos')), el('p', 's', r.origen.nombre + (r.origen.aprox ? ' (' + T('aproximada') + ')' : '') + (fuera && !fuera.error && fuera.operador ? ' · ' + fuera.operador : '') + ' · ' + cuando.toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + cuando.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }) + (r.borde ? ' · ' + T('borde de internet más cercano') + ': ' + r.borde.nombre + (r.borde.ms != null ? ' (' + r.borde.ms + ' ms)' : '') : '')));
    const acc = el('div', 'acciones'); const bPdf = el('button', '', T('Guardar PDF')); bPdf.type = 'button'; const bX = el('button', '', T('Cerrar')); bX.type = 'button'; acc.append(bPdf, bX, el('small', '', T('El PDF se descarga en tu equipo; no se envía a ningún sitio.'))); cab.append(acc);
    a.append(cab);
    const red = window.OrbitaRed && window.OrbitaRed.lista;
    const g1 = figura(T('Tu planeta'), leyCont([{ t: T('Tú') + ' · ' + r.origen.nombre, c: AZUL, tipo: 'anillo' }]), T('Cada línea es un camino medido desde tu equipo; las brillantes, el más rápido de cada continente.') + ' ' + (red ? T('Cada trayecto va por los cables submarinos y la fibra terrestre del mapa, por el camino más corto entre ellos. El cable exacto que usaron tus datos no se conoce desde fuera de la red.') : T('Conexiones medidas, trayectorias ilustrativas: el arco une origen y destino, no muestra por dónde fueron los paquetes.')));
    a.append(g1.f);
    const cifras = el('section', 'cifras');
    const dato = (v, k) => { const d = el('div'); d.append(el('b', '', v), el('span', '', k)); return d; };
    cifras.append(dato(num(orden.length), T('destinos medidos')), dato(mejor.ms + ' ms', T('el más rápido') + ': ' + corto(mejor)), dato(num(Math.round(peor.km)) + ' km', T('el más lejano') + ': ' + corto(peor)), dato('×' + num(orden.reduce((s, n) => s + n.ms / n.minimo, 0) / orden.length, 1), T('tiempo medio sobre el mínimo físico')));
    a.append(cifras);
    const dos = el('div', 'dos');
    const g2 = figura(T('Brújula de tiempos'), leyCont(), T('Cada punto es un destino, en su dirección real desde ti; cuanto más lejos del centro, más tardan tus datos. Los anillos marcan la ida y vuelta en milisegundos.'));
    dos.append(g2.f);
    const sec = el('section', 'texto');
    sec.append(el('h2', '', T('Qué significa')));
    sec.append(el('p', '', T('Cada número es una ida y vuelta real desde tu equipo hasta la puerta pública de un centro de datos, medida en el momento de la fecha. La luz dentro de la fibra recorre unos 200 kilómetros por milisegundo; lo que tus datos tardan de más es el camino real: cables que bordean costas, saltos entre redes, colas en los equipos.')));
    sec.append(el('p', '', T('Tu destino más rápido es') + ' ' + mejor.nombre + ' (' + mejor.ms + ' ms, ' + num(Math.round(mejor.km)) + ' km). ' + T('Por continente, el más cercano a ti:') + ' ' + [...porCont.entries()].map(([k, n]) => k + ' → ' + corto(n) + ' ' + n.ms + ' ms').join(' · ') + '.'));
    sec.append(el('h2', '', T('Cómo se ha medido')));
    sec.append(el('p', '', T('Desde tu navegador, una petición mínima a la puerta pública de cada región (Amazon Web Services) y al borde de red más cercano (Cloudflare), tres veces, quedándonos con la mejor. La ubicación de cada centro es la zona metropolitana publicada por su operador. No se sabe por qué cable exacto ha ido cada dato: ningún mapa puede saberlo sin medir dentro de la red, y por eso no se dibuja.')));
    dos.append(sec); a.append(dos);
    const g3 = figura(T('La luz contra la realidad'), leyenda([{ t: mayus1(T('mínimo de la luz por la fibra')), c: AZUL, tipo: 'barra' }, { t: mayus1(T('lo que han tardado tus datos')), c: 'rgba(244,246,248,.32)', tipo: 'barra' }].concat(presentes.map(([k, c]) => ({ t: T(k), c })))), T('Tus destinos más rápidos. Cada barra es lo que han tardado tus datos, ida y vuelta; el tramo azul, lo que tardaría la luz por la fibra en línea recta.'));
    a.append(g3.f);
    const g4 = figura(T('Por continente'), null, T('Los milisegundos de más sobre el mínimo físico, de media, hacia cada parte del mundo, con los destinos medidos, la razón sobre el mínimo y el tiempo medio.'));
    a.append(g4.f);
    const g5 = figura(T('A qué velocidad viajaron tus datos'), leyCont(), T('Cada barra divide lo que tardaría la luz por fibra en línea recta entre lo que han tardado tus datos. Si tus datos fueran por fibra en línea recta, llegarían al 100 %. Lo que falta son los rodeos de los cables, los saltos entre redes y las colas en los equipos.'));
    a.append(g5.f);
    const tabla = el('table'); const th = el('tr'); [T('Destino'), T('Continente'), 'ms', 'km', T('mínimo'), '× ' + T('mínimo')].forEach((k) => th.append(el('th', '', k))); tabla.append(th);
    for (const n of orden) {
      const tr = el('tr'); [n.nombre, continente(n.region), n.ms + ' ms', num(Math.round(n.km)), num(Math.round(n.minimo)) + ' ms', '×' + num(n.ms / n.minimo, 1)].forEach((v, i) => {
        const td = el('td', '', i === 1 ? null : v);
        if (i === 1) { const s = el('span', 'cont'), d = el('i'); d.style.background = colorDe(n); s.append(d, document.createTextNode(v)); td.append(s); }
        tr.append(td);
      });
      tabla.append(tr);
    }
    a.append(tabla);
    a.append(el('p', 'pie', T('Son tus datos y de nadie más: este informe se ha generado en tu equipo y no se ha enviado a ningún sitio.') + ' · GUARDIANA · guardianagroup.com'));
    puntero(a);
    document.body.append(a); document.body.classList.add('con-informe');
    a.scrollTop = 0;
    // each figure at the width it is shown; drawn again (a moment later) when that width changes
    let niv = null;
    const figs = [
      { c: g1.c, pinta: (W) => dibujaGlobo(g1.c, W, r, rapidos, niv) },
      { c: g2.c, pinta: (W) => dibujaBrujula(g2.c, W, r, rapidos) },
      { c: g3.c, pinta: (W) => dibujaLuz(g3.c, W, r) },
      { c: g4.c, pinta: (W) => dibujaContinentes(g4.c, W, r) },
      { c: g5.c, pinta: (W) => dibujaVelocidad(g5.c, W, r) },
    ];
    const dibuja = (fg) => { const W = Math.floor(fg.c.getBoundingClientRect().width); if (W < 120) return; fg.W = W; try { fg.pinta(W); } catch (e) { if (window.console) console.warn('informe', e); } };
    const ro = window.ResizeObserver ? new ResizeObserver((es) => { for (const e of es) { const fg = figs.find((f) => f.c === e.target); if (!fg || fg.W == null || Math.abs(Math.floor(e.contentRect.width) - fg.W) < 2) continue; clearTimeout(fg.t); fg.t = setTimeout(() => dibuja(fg), 160); } }) : null;
    const otroIdioma = () => { const y = a.scrollTop; informe(r, { y }); }; // the canvases speak the page's language too
    const esc = (e) => { if (e.key === 'Escape') cierra(); };
    const cierra = (sigue) => { if (ro) ro.disconnect(); removeEventListener('guardiana-idioma', otroIdioma); document.removeEventListener('keydown', esc); figs.forEach((f) => clearTimeout(f.t)); a.remove(); if (!sigue) { document.body.classList.remove('con-informe'); TEX = null; } }; // the texture's pixels go with the report
    a.__cierra = cierra;
    bX.addEventListener('click', () => cierra());
    bPdf.addEventListener('click', () => pdfInforme(a, bPdf));
    document.addEventListener('keydown', esc);
    addEventListener('guardiana-idioma', otroIdioma);
    a.__listo = (async () => {
      niv = await Promise.all([fuentes(), textura()]).then((x) => x[1]);
      if (!a.isConnected) return;
      for (const fg of figs) { dibuja(fg); if (ro) ro.observe(fg.c); await new Promise((ok) => setTimeout(ok, 0)); }
      a.dataset.listo = '1';
    })();
    await a.__listo;
    if (opciones && opciones.y) a.scrollTop = opciones.y;
    if (opciones && opciones.pdf && a.isConnected) setTimeout(() => pdfInforme(a, bPdf), 120);
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
      if (a.__listo) await a.__listo; // the figures are drawn first (the faces and the planet's texture take a moment)
      if (!window.html2canvas) await cargaScript(BASE_V + 'vendor/html2canvas.min.js');
      const ar = a.getBoundingClientRect(), ancho = a.clientWidth, alto = a.scrollHeight, k = Math.min(2, 2400 / Math.max(1, ancho));
      // where the pages may break: the top of every block, so no figure, paragraph or row is cut in two
      const cortes = [...a.querySelectorAll('.cab, figure, .cifras, .dos, h2, p, table, tr, .pie')].map((e) => Math.round((e.getBoundingClientRect().top - ar.top + a.scrollTop) * k)).filter((y) => y > 0).sort((x, y) => x - y);
      const lienzo = await window.html2canvas(a, {
        backgroundColor: '#06080C', scale: k, width: ancho, height: alto, windowWidth: innerWidth, windowHeight: alto, logging: false, useCORS: true,
        onclone: (doc) => { const x = doc.getElementById('informe'); if (!x) return; Object.assign(x.style, { position: 'absolute', inset: 'auto', left: '0', top: '0', boxSizing: 'border-box', width: ancho + 'px', height: 'auto', overflow: 'visible' }); /* border-box: with its side padding inside the width, as on screen (without it the right edge was cut off) */ const ac = x.querySelector('.acciones'); if (ac) ac.style.visibility = 'hidden'; const tp = x.querySelector('.tip'); if (tp) tp.remove(); }
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
  // 24 Oct 2026 (QA): Esc with the report open closes only the report; the journey under it stays
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && V && !document.body.classList.contains('con-informe')) termina(); });
  window.OrbitaViaje = { empieza, informe, get activo() { return !!V; } };
})();
