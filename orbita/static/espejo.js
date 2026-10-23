/* GUARDIANA · Órbita · ESPEJO, «Con / Sin GUARDIANA» (owner, 23 Oct 2026, 10:27: «en órbita podría haber dos botones…
   con guardiana y cómo sería sin guardiana… casi todo cortado… sin guardiana, que sería un bombardeo»; 11:05: «haz
   sobre todo diarios deportivos… ahí hay miles de rastreadores»).
   A real, dated measurement, never an estimate: the front pages of eleven sports and news sites opened on 23 Oct 2026
   from Colombia in a browser without blockers, cookies accepted when the site asked, and every domain of another
   company the browser contacted written down (herramientas/espejo). Company and country of each domain: confirmed by
   at least two voices of the agency; a domain without that stays in the count and is neither drawn nor cut.
   The arcs go from you to the country where each company has its seat: never the route the data takes.
   «Con GUARDIANA» is the same measurement with GUARDIANA's rules applied (advertising, tracking and measurement cut);
   the screen says so, and it never claims that the visitor is protected today. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const loc = () => (window.GuardianaIdioma ? window.GuardianaIdioma.locale : undefined);
  const num = (n) => Number.isFinite(n) ? n.toLocaleString(loc()) : '';
  const P = () => window.OrbitaPlaneta;
  const RAD = Math.PI / 180;
  const ACENTO = '156,195,228', ROJO = '224,122,108', BLANCO = '244,246,248';
  const CORTA = new Set(['publicidad', 'rastreo', 'medición']);
  const CATS = { publicidad: 'Publicidad', rastreo: 'Rastreo', 'medición': 'Medición', funcional: 'Funcional', consentimiento: 'Consentimiento', 'grupo editorial': 'Grupo editorial' };
  const suave = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const reducido = () => matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let D = null;  // the measurement (datos/espejo.json)
  let E = null;  // the open mirror: { modo, sitio, arcos, paises, res, t0, tModo, tSel, mezcla }

  // ---------- geometry ----------
  const vec = (lon, lat) => { const a = lat * RAD, b = lon * RAD; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
  function slerp(va, vb, t) { const d = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])), om = Math.acos(d), so = Math.sin(om) || 1e-9, ka = Math.sin((1 - t) * om) / so, kb = Math.sin(t * om) / so; return [va[0] * ka + vb[0] * kb, va[1] * ka + vb[1] * kb, va[2] * ka + vb[2] * kb]; }
  const angulo = (va, vb) => Math.acos(Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])));
  const paisNombre = (cc) => { try { const l = (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es'; return new Intl.DisplayNames([l], { type: 'region' }).of(cc) || cc; } catch (_) { return cc; } };
  // a small, stable number from a text: each company keeps its place in the fan and the rhythm of its pulses
  const semilla = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };

  function carga() {
    if (!carga.p) carga.p = fetch('datos/espejo.json', { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((j) => (D = j)).catch((e) => { carga.p = null; throw e; });
    return carga.p;
  }

  // ---------- what a selection measured ----------
  function resumen(sitio) {
    const sitios = D.sitios.filter((s) => sitio === 'todas' || s.id === sitio);
    const doms = new Set(); sitios.forEach((s) => s.dominios.forEach((d) => doms.add(d)));
    const emp = new Map();
    let cortados = 0;
    for (const d of doms) {
      const x = D.dominios[d] || {};
      if (CORTA.has(x.categoria)) cortados++;
      if (!x.empresa || !D.empresas[x.empresa]) continue;
      let e = emp.get(x.empresa);
      if (!e) emp.set(x.empresa, (e = { nombre: x.empresa, pais: D.empresas[x.empresa], dominios: [], corta: 0, queda: 0, cats: new Set() }));
      e.dominios.push(d); if (CORTA.has(x.categoria)) e.corta++; else e.queda++; if (x.categoria) e.cats.add(x.categoria);
    }
    const paises = new Map();
    for (const e of emp.values()) {
      let p = paises.get(e.pais); if (!p) paises.set(e.pais, (p = { cc: e.pais, empresas: 0, cortadas: 0, quedan: 0 }));
      p.empresas++; if (e.corta && !e.queda) p.cortadas++; else p.quedan++;
    }
    const quedanPaises = [...paises.values()].filter((p) => p.quedan > 0).length;
    return { sitios, doms: doms.size, emp, paises, cortados, quedan: doms.size - cortados, quedanPaises };
  }

  // where the arcs start: the visitor's place (or country); when the planet knows neither, the country the measurement was made from
  function origen() { const p = P(); if (!p) return null; const L = p.lugar; if (L) return L; const c = D && p.centros && p.centros[D.desde]; return c ? { lon: c.lon, lat: c.lat } : null; }

  // ---------- the arcs: one per company (two when some of its domains are cut and some stay) ----------
  function arcos(res) {
    const p = P(), L = origen(); if (!L || !p.centros) return [];
    const casa = vec(L.lon, L.lat), lista = [];
    for (const e of res.emp.values()) {
      const c = p.centros[e.pais]; if (!c) continue;
      if (e.corta) lista.push({ e, pais: e.pais, c, n: e.corta, corta: true });
      if (e.queda) lista.push({ e, pais: e.pais, c, n: e.queda, corta: false });
    }
    // the fan: the arcs to one country rise at different heights, so a country that receives many companies shows
    // as a sheaf of arcs and not as one line
    const porPais = new Map(); lista.forEach((a) => { if (!porPais.has(a.pais)) porPais.set(a.pais, []); porPais.get(a.pais).push(a); });
    for (const grupo of porPais.values()) {
      grupo.sort((a, b) => semilla(a.e.nombre + a.corta) - semilla(b.e.nombre + b.corta));
      grupo.forEach((a, i) => { a.k = grupo.length > 1 ? i / (grupo.length - 1) : 0.5; });
    }
    const N = 56;
    for (const a of lista) {
      const dest = vec(a.c.lon, a.c.lat), ang0 = angulo(casa, dest);
      // a company in your own country: a short loop that rises and comes back near you, not a line of zero length
      const fin = ang0 < 0.035 ? vec(a.c.lon + 4 + 6 * a.k, a.c.lat + 3) : dest, ang = angulo(casa, fin);
      // the sheaf opens both upwards and sideways, so it reads as many arcs from any side of the planet
      const solo = porPais.get(a.pais).length < 2, alto = 0.03 + 0.17 * Math.min(1, ang / 1.6) + (solo ? 0 : 0.06 * a.k);
      let n = [casa[1] * fin[2] - casa[2] * fin[1], casa[2] * fin[0] - casa[0] * fin[2], casa[0] * fin[1] - casa[1] * fin[0]];
      const ln = Math.hypot(n[0], n[1], n[2]); n = ln > 1e-6 ? n.map((x) => x / ln) : [0, 1, 0];
      const lado = solo ? 0 : (a.k - 0.5) * 2 * (0.05 + 0.11 * Math.min(1, ang / 1.6));
      a.w = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N, s = Math.sin(Math.PI * t), g = slerp(casa, fin, t), w = [g[0] + n[0] * lado * s, g[1] + n[1] * lado * s, g[2] + n[2] * lado * s];
        const lw = Math.hypot(w[0], w[1], w[2]), h = (1.004 + alto * s) / lw; a.w.push([w[0] * h, w[1] * h, w[2] * h]);
      }
      a.N = N; a.fase = semilla(a.e.nombre + a.pais); a.periodo = 1800 + 2200 * semilla(a.e.nombre);
      a.pulsos = Math.min(4, 1 + Math.floor(a.n / 1.5)); // more domains, more pulses: the «bombardeo»
    }
    return lista;
  }

  // ---------- drawing (in the planet's clean mode) ----------
  let CAJAS = [];
  function cabe(x, y, w, h) { const b = [x - 3, y - h / 2, x + w + 3, y + h / 2]; for (const c of CAJAS) if (b[0] < c[2] && b[2] > c[0] && b[1] < c[3] && b[3] > c[1]) return false; CAJAS.push(b); return true; }
  function etiqueta(cx, x, y, texto, fuerte, color) {
    cx.font = (fuerte ? '600 12px' : '500 10.5px') + ' "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle'; cx.textAlign = 'left';
    const w = cx.measureText(texto).width; if (!cabe(x, y, w, fuerte ? 15 : 13)) return false;
    cx.lineWidth = 3; cx.strokeStyle = 'rgba(6,8,12,.86)'; cx.strokeText(texto, x, y); cx.fillStyle = color || (fuerte ? '#F4F6F8' : 'rgba(232,236,241,.82)'); cx.fillText(texto, x, y); return true;
  }
  function pinta(cx, p, G, t) {
    if (!E || !E.arcos) return;
    const now = performance.now(), L = origen(); if (!L) return;
    CAJAS = [];
    // mezcla: 0 = without, 1 = with; it glides, so the cut arcs fold back to you instead of vanishing
    const objetivo = E.modo === 'con' ? 1 : 0;
    if (E.mezcla !== objetivo) { const k = Math.min(1, (now - E.tModo) / 1100); E.mezcla = objetivo ? suave(k) : 1 - suave(k); if (k >= 1) E.mezcla = objetivo; }
    const mez = E.mezcla, aparece = Math.min(1, (now - E.tSel) / 700);
    cx.save(); cx.globalCompositeOperation = 'source-over'; cx.lineCap = 'round'; cx.lineJoin = 'round';
    const casa = (() => { const v = p.aVista(vec(L.lon, L.lat).map((c) => c * 1.004)); return v[2] > 0 ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null; })();
    const anilloR = Math.max(16, Math.min(34, 14 + G.R * 0.035));
    if (casa) CAJAS.push([casa[0] - 16, casa[1] - 16, casa[0] + 16, casa[1] + 16]); // the planet's own marker for you
    // screen points of every arc, once per frame
    for (const a of E.arcos) {
      const pts = a.pts || (a.pts = new Array(a.N + 1));
      for (let i = 0; i <= a.N; i++) { const v = p.aVista(a.w[i]); pts[i] = (v[2] > 0 || v[0] * v[0] + v[1] * v[1] > 1) ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null; }
      // where the arc leaves GUARDIANA's ring around you: the cut ones stop there
      a.sale = a.N;
      if (casa) for (let i = 1; i <= a.N; i++) { const q = pts[i]; if (q && Math.hypot(q[0] - casa[0], q[1] - casa[1]) > anilloR) { a.sale = i; break; } }
      a.largo = a.corta ? Math.max(a.sale, Math.round(a.N - (a.N - a.sale) * mez)) : a.N;
    }
    // 1 · the arcs themselves, faint
    for (const a of E.arcos) {
      const pts = a.pts, rojo = a.corta && mez > 0.02;
      const alfa = (a.corta ? 0.16 + 0.1 * mez : 0.17 + 0.07 * mez) * aparece;
      cx.strokeStyle = rojo ? `rgba(${ROJO},${(alfa * (0.4 + 0.6 * mez) + 0.12 * (1 - mez)).toFixed(3)})` : `rgba(${ACENTO},${alfa.toFixed(3)})`;
      cx.lineWidth = a.corta ? 1 : 1.1;
      cx.beginPath(); let prev = false;
      for (let i = 0; i <= a.largo; i++) { const q = pts[i]; if (q && prev) cx.lineTo(q[0], q[1]); else if (q) cx.moveTo(q[0], q[1]); prev = !!q; }
      cx.stroke();
    }
    // 2 · the pulses: what leaves your browser. Without GUARDIANA all of them reach their country; with it, the cut
    //     ones burst red against the ring around you
    cx.globalCompositeOperation = 'lighter';
    const quieto = reducido();
    for (const a of E.arcos) {
      const pts = a.pts, tope = a.largo;
      for (let k = 0; k < a.pulsos; k++) {
        const f = quieto ? 0.62 : (((now + a.fase * a.periodo + k * a.periodo / a.pulsos) / a.periodo) % 1);
        const cab = Math.round(f * tope), rojo = a.corta && mez > 0.5;
        if (a.corta && mez > 0.5 && cab >= tope - 1) {
          // the cut: a red flash where the pulse meets the ring
          const q = pts[tope]; if (!q) continue; const r = 3 + 9 * ((f * tope - (tope - 1)) % 1);
          const g = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], r + 6); g.addColorStop(0, `rgba(${ROJO},.95)`); g.addColorStop(1, `rgba(${ROJO},0)`);
          cx.fillStyle = g; cx.beginPath(); cx.arc(q[0], q[1], r + 6, 0, 7); cx.fill(); continue;
        }
        const largoCola = Math.max(4, Math.round(tope * 0.16));
        for (let i = Math.max(1, cab - largoCola); i <= cab; i++) {
          const q0 = pts[i - 1], q1 = pts[i]; if (!q0 || !q1) continue;
          const v = 1 - (cab - i) / largoCola; if (v <= 0) continue;
          cx.strokeStyle = rojo ? `rgba(${ROJO},${(0.15 + 0.7 * v).toFixed(3)})` : `rgba(${ACENTO},${((0.12 + 0.75 * v) * aparece).toFixed(3)})`;
          cx.lineWidth = 0.8 + 1.8 * v; cx.beginPath(); cx.moveTo(q0[0], q0[1]); cx.lineTo(q1[0], q1[1]); cx.stroke();
        }
        const q = pts[cab]; if (!q) continue;
        const R = 5.5, g = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], R);
        g.addColorStop(0, rojo ? 'rgba(255,236,232,.95)' : `rgba(255,255,255,${(0.9 * aparece).toFixed(3)})`); g.addColorStop(0.4, rojo ? `rgba(${ROJO},.7)` : `rgba(${ACENTO},${(0.6 * aparece).toFixed(3)})`); g.addColorStop(1, `rgba(${rojo ? ROJO : ACENTO},0)`);
        cx.fillStyle = g; cx.beginPath(); cx.arc(q[0], q[1], R, 0, 7); cx.fill();
      }
    }
    cx.globalCompositeOperation = 'source-over';
    // 3 · GUARDIANA's ring around you (with GUARDIANA)
    if (casa && mez > 0.01) {
      const r = anilloR * (0.6 + 0.4 * mez);
      cx.strokeStyle = `rgba(${ACENTO},${(0.22 * mez).toFixed(3)})`; cx.lineWidth = 7; cx.beginPath(); cx.arc(casa[0], casa[1], r, 0, 7); cx.stroke();
      cx.strokeStyle = `rgba(${BLANCO},${(0.85 * mez).toFixed(3)})`; cx.lineWidth = 1.3; cx.beginPath(); cx.arc(casa[0], casa[1], r, 0, 7); cx.stroke();
      if (casa) CAJAS.push([casa[0] - r, casa[1] - r, casa[0] + r, casa[1] + r]);
    }
    // 4 · the countries: a dot where the arcs land and its name with how many companies are there
    const filas = [...E.res.paises.values()].sort((x, y) => y.empresas - x.empresas);
    for (const fila of filas) {
      const c = p.centros[fila.cc]; if (!c) continue;
      const v = p.aVista(vec(c.lon, c.lat).map((x) => x * 1.004)); if (v[2] <= 0.02) continue;
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1];
      const vivos = Math.round(fila.empresas - (fila.empresas - fila.quedan) * mez), r = 2.2 + Math.sqrt(Math.max(1, vivos)) * 0.9;
      cx.fillStyle = vivos > 0 ? `rgba(${BLANCO},${(0.9 * aparece).toFixed(3)})` : `rgba(${ROJO},.55)`; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill();
      const nombre = paisNombre(fila.cc) + ' · ' + num(vivos);
      etiqueta(cx, x + r + 6, y, nombre, fila.empresas >= 5, vivos > 0 ? null : `rgba(${ROJO},.85)`);
    }
    cx.restore();
  }

  // ---------- the camera: one glide to a view that holds you and the countries ----------
  let cam = null;
  function encuadra() {
    const p = P(); if (!p || !E) return; const L = origen(); if (!L) return;
    let s = vec(L.lon, L.lat).map((c) => c * 3);
    for (const f of E.res.paises.values()) { const c = p.centros[f.cc]; if (!c) continue; const v = vec(c.lon, c.lat); s = s.map((x, i) => x + v[i] * Math.sqrt(f.empresas)); }
    const n = Math.hypot(s[0], s[1], s[2]) || 1, lat = Math.asin(s[1] / n) / RAD, lon = Math.atan2(s[0], s[2]) / RAD;
    const d = p.vista || { lon, lat }; cam = { lon0: d.lon, lat0: d.lat, lon, lat: Math.max(-35, Math.min(45, lat)), t0: performance.now(), dur: 1500 };
    requestAnimationFrame(mueve);
  }
  function mueve(now) {
    if (!cam || !E) { cam = null; return; } const p = P(); if (!p) return;
    const k = Math.min(1, (now - cam.t0) / cam.dur), s = suave(k), dl = ((cam.lon - cam.lon0) % 360 + 540) % 360 - 180;
    p.ir(cam.lon0 + dl * s, cam.lat0 + (cam.lat - cam.lat0) * s, 1);
    if (k < 1) requestAnimationFrame(mueve); else cam = null;
  }
  // the person takes the planet: the camera lets go at once
  ['pointerdown', 'wheel'].forEach((ev) => addEventListener(ev, () => { cam = null; }, { passive: true, capture: true }));

  // ---------- the HUD ----------
  let hud = null, control = null, lista = null;
  const fechaLarga = () => { try { return new Date(D.fecha + 'T12:00:00').toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }); } catch (_) { return D.fecha; } };
  function montaControl() {
    if (control) return control;
    control = document.createElement('div'); control.id = 'espejo-modo'; control.className = 'espejo-modo';
    control.innerHTML = '<div class="pre">¿Qué pasa al abrir un diario deportivo?</div>'
      + '<div class="seg" role="radiogroup" aria-label="Con y sin GUARDIANA">'
      + '<button type="button" role="radio" aria-checked="false" data-modo="sin"><i aria-hidden="true"></i>Sin GUARDIANA</button>'
      + '<button type="button" role="radio" aria-checked="false" data-modo="con"><i aria-hidden="true"></i>Con GUARDIANA</button>'
      + '<button type="button" class="salir" aria-label="Salir" title="Salir" hidden><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>';
    document.body.append(control);
    control.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => abre(b.dataset.modo)));
    control.querySelector('.salir').addEventListener('click', cierra);
    return control;
  }
  function montaHud() {
    if (hud) return hud;
    hud = document.createElement('section'); hud.id = 'espejo'; hud.className = 'espejo-hud'; hud.hidden = true; hud.setAttribute('aria-live', 'polite');
    hud.innerHTML = '<div class="k"><span>ESPEJO</span><span class="sep">·</span><span class="fecha"></span></div>'
      + '<h2 class="t"></h2><p class="d"></p><p class="d2"></p>'
      + '<div class="cifras"><div class="c1"><b>—</b><span></span></div><div class="c2"><b>—</b><span></span></div><div class="c3"><b>—</b><span></span></div></div>'
      + '<div class="sitios" role="radiogroup" aria-label="Webs medidas"></div>'
      + '<div class="paises"><div class="k2">País de la sede de cada empresa</div><ol></ol></div>'
      + '<button type="button" class="ver"><span>Ver las empresas</span> <b class="n" translate="no"></b></button>'
      + '<p class="met">Medido el <span class="fecha2"></span> desde Colombia, en un navegador sin bloqueadores y aceptando las cookies cuando la web las pidió. Cuenta mínima: lo que pasa dentro de los anuncios no se ve. <b>Datos verificados</b></p>';
    document.body.append(hud);
    hud.querySelector('.ver').addEventListener('click', () => muestraLista(!lista || lista.hidden));
    return hud;
  }
  function montaLista() {
    if (lista) return lista;
    lista = document.createElement('aside'); lista.id = 'espejo-lista'; lista.className = 'espejo-lista'; lista.hidden = true; lista.setAttribute('aria-label', 'Empresas y países');
    lista.innerHTML = '<div class="titulo"><span>Empresas y países</span><button type="button" class="cerrar" aria-label="Cerrar" title="Cerrar"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div><div class="cuerpo"></div>';
    document.body.append(lista);
    lista.querySelector('.cerrar').addEventListener('click', () => muestraLista(false));
    return lista;
  }
  function muestraLista(si) { montaLista(); lista.hidden = !si; if (si) pintaLista(); }
  function pintaLista() {
    if (!lista || lista.hidden || !E) return;
    const cuerpo = lista.querySelector('.cuerpo'); cuerpo.textContent = '';
    const porPais = new Map(); for (const e of E.res.emp.values()) { if (!porPais.has(e.pais)) porPais.set(e.pais, []); porPais.get(e.pais).push(e); }
    [...porPais.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).forEach(([cc, es]) => {
      const g = document.createElement('section'); g.className = 'grupo';
      const h = document.createElement('h3'); h.textContent = paisNombre(cc); const n = document.createElement('span'); n.textContent = num(es.length); h.append(n); g.append(h);
      const ul = document.createElement('ul');
      es.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach((e) => {
        const li = document.createElement('li'), cortada = E.modo === 'con' && e.corta && !e.queda;
        if (cortada) li.className = 'cortada';
        const b = document.createElement('b'); b.textContent = e.nombre; b.setAttribute('translate', 'no'); li.append(b);
        const cats = document.createElement('span'); cats.className = 'cats';
        [...e.cats].forEach((c) => { const x = document.createElement('i'); x.textContent = CATS[c] || c; if (CORTA.has(c)) x.className = 'corta'; cats.append(x); });
        if (E.modo === 'con') { const x = document.createElement('em'); x.textContent = cortada ? 'Cortada' : e.corta ? 'Cortada en parte' : 'Se queda'; x.className = cortada ? 'corte' : e.corta ? 'parte' : 'queda'; cats.append(x); }
        li.append(cats);
        const d = document.createElement('small'); d.textContent = e.dominios.join(' · '); d.setAttribute('translate', 'no'); li.append(d);
        ul.append(li);
      });
      g.append(ul); cuerpo.append(g);
    });
    const met = hud.querySelector('.met').cloneNode(true); cuerpo.append(met);
  }
  // the counters glide to their new value
  function cuenta(el, a) {
    const de = Number(el.dataset.v || 0); el.dataset.v = a; const t0 = performance.now();
    if (reducido() || de === a) { el.textContent = num(a); return; }
    const f = (now) => { const k = Math.min(1, (now - t0) / 750); el.textContent = num(Math.round(de + (a - de) * suave(k))); if (k < 1 && el.dataset.v == a) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  function pintaHud() {
    if (!E || !hud) return; const r = E.res, con = E.modo === 'con', uno = E.sitio !== 'todas';
    hud.classList.toggle('con', con);
    hud.querySelector('.fecha').textContent = fechaLarga(); hud.querySelector('.fecha2').textContent = fechaLarga();
    hud.querySelector('.t').textContent = con ? 'Con GUARDIANA' : 'Sin GUARDIANA';
    hud.querySelector('.d').textContent = con
      ? 'La misma medición con las reglas de GUARDIANA: se cortan la publicidad, el rastreo y la medición, y queda lo necesario para ver la web.'
      : (uno ? 'Al abrir la portada de este diario, el navegador conecta con todas estas empresas, que no son el diario.' : 'Al abrir la portada de once diarios deportivos y de noticias, el navegador conecta con todas estas empresas, que no son el diario.');
    hud.querySelector('.d2').textContent = con ? 'La misma medición, con las reglas de GUARDIANA' : (uno ? 'Portada de este diario' : 'Portada de once diarios deportivos y de noticias');
    const c = [[con ? r.cortados : r.doms, con ? 'dominios cortados' : 'dominios de otras empresas'], [con ? r.quedan : r.emp.size, con ? 'dominios se quedan' : 'empresas identificadas'], [con ? r.quedanPaises : r.paises.size, 'países']];
    ['.c1', '.c2', '.c3'].forEach((s, i) => { const el = hud.querySelector(s); cuenta(el.querySelector('b'), c[i][0]); el.querySelector('span').textContent = c[i][1]; el.classList.toggle('rojo', con && i === 0); });
    // the sites
    const sit = hud.querySelector('.sitios');
    if (!sit.childElementCount) {
      const todas = document.createElement('button'); todas.type = 'button'; todas.dataset.s = 'todas'; todas.setAttribute('role', 'radio'); todas.textContent = 'Todas'; sit.append(todas);
      D.sitios.forEach((s) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.s = s.id; b.setAttribute('role', 'radio'); b.setAttribute('translate', 'no'); b.title = s.web; b.innerHTML = '<span></span><small></small>'; b.querySelector('span').textContent = s.nombre; b.querySelector('small').textContent = s.pais; sit.append(b); });
      sit.addEventListener('click', (e) => { const b = e.target.closest('button[data-s]'); if (b) elige(b.dataset.s); });
    }
    sit.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.s === E.sitio)));
    // the countries, as bars: with GUARDIANA the cut part turns red
    const ol = hud.querySelector('.paises ol'); ol.textContent = '';
    const filas = [...r.paises.values()].sort((a, b) => b.empresas - a.empresas).slice(0, 7), max = Math.max(1, ...filas.map((f) => f.empresas));
    filas.forEach((f) => {
      const li = document.createElement('li');
      const n = document.createElement('span'); n.className = 'n'; n.textContent = paisNombre(f.cc);
      const barra = document.createElement('span'); barra.className = 'barra';
      const q = document.createElement('i'); q.className = 'q'; q.style.width = (100 * (con ? f.quedan : f.empresas) / max).toFixed(1) + '%';
      const k = document.createElement('i'); k.className = 'k'; k.style.width = con ? (100 * f.cortadas / max).toFixed(1) + '%' : '0%';
      barra.append(q, k);
      const v = document.createElement('span'); v.className = 'v'; v.textContent = con ? num(f.quedan) + ' / ' + num(f.empresas) : num(f.empresas);
      li.append(n, barra, v); ol.append(li);
    });
    hud.querySelector('.ver .n').textContent = '(' + num(r.emp.size) + ')';
    control.querySelectorAll('[data-modo]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.modo === E.modo)));
    pintaLista();
  }

  // ---------- opening, choosing, closing ----------
  function elige(sitio) {
    if (!E) return; E.sitio = sitio; E.res = resumen(sitio); E.arcos = arcos(E.res); E.tSel = performance.now(); pintaHud(); encuadra();
  }
  async function abre(modo) {
    if (document.body.classList.contains('viaje') || document.body.classList.contains('dentro')) return;
    try { await carga(); } catch (_) { return; }
    if (!P()) return;
    const nuevo = !E;
    if (nuevo) {
      const C = window.OrbitaConexion, pc = $('conexion'); if (pc && !pc.hidden && C && C.abre) { try { C.abre(false); } catch (_) {} }
      E = { modo: modo || 'sin', sitio: 'todas', mezcla: modo === 'con' ? 1 : 0, tModo: performance.now(), tSel: performance.now() };
      montaHud(); hud.hidden = false; control.querySelector('.salir').hidden = false;
      document.body.classList.add('en-espejo');
      if (window.OrbitaCapas) window.OrbitaCapas.soloTu(true, pinta);
      elige('todas');
    } else if (E.modo !== modo) { E.modo = modo; E.tModo = performance.now(); pintaHud(); }
  }
  function cierra() {
    if (!E) return; E = null; cam = null;
    if (hud) hud.hidden = true; if (lista) lista.hidden = true;
    control.querySelector('.salir').hidden = true; control.querySelectorAll('[data-modo]').forEach((b) => b.setAttribute('aria-checked', 'false'));
    document.body.classList.remove('en-espejo');
    if (window.OrbitaCapas) window.OrbitaCapas.soloTu(false);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && E) { if (lista && !lista.hidden) muestraLista(false); else cierra(); } });
  addEventListener('guardiana-idioma', () => { if (E) pintaHud(); });
  // another view takes the planet (a door, «Mi conexión», the journey): the mirror steps aside
  new MutationObserver(() => { if (E && (document.body.classList.contains('dentro') || document.body.classList.contains('viaje'))) cierra(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', (e) => { if (E && e.target.closest('#conexion-btn')) cierra(); }, true);

  function arranca() { montaControl(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
  window.OrbitaEspejo = { abre, cierra, get activo() { return !!E; }, get datos() { return D; } };
})();
