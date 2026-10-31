/* GUARDIANA · Órbita · «Escáner PC» (31 Oct 2026). El dueño, 30 Oct, 23:32: «una nueva sección… que cuando la persona pulse el
   botón, se analice profundamente todo… desde el antivirus, micrófonos, cualquier cosa que sea medible, programas
   preinstalados, si el computador habla de alguna forma y envía telemetría afuera»; 00:10: «Vigía se cambia por escáner pc».
   Dentro del programa para Windows (data-en-programa en <html>), la web pide al panel de este mismo equipo sus lecturas, por
   la pasarela del programa: el evento «guardiana-panel-pide» con un texto JSON { n, metodo, ruta } y la respuesta
   «guardiana-panel» con otro { n, estado (código HTTP; 0 = fallo de red), datos (el cuerpo, en texto) }. El programa solo deja
   pasar una lista cerrada de pares método + ruta, todos de solo lectura (Z/sesion.rs, PANEL_LECTURAS); lo que no contesta, lo
   que contesta 402 (nivel Gratis) o lo que Windows no dijo sale aquí como «No medido», con su motivo, y nada se rompe.
   La secuencia es la de la especificación (§4.1): primero las lecturas rápidas, luego las dos órdenes de mirar ahora (la
   revisión de Windows y la mirada lenta de la vigilancia), después el resto en paralelo; la revisión se sigue cada 700 ms
   con sus pasos reales, numerados, y el informe se va llenando según llegan los datos. A los 60 s, si la revisión sigue,
   el informe manda y esa parte queda «en curso» con su avance. Nada se estima ni se inventa: cada cifra es del programa.
   Reglas (§4.4): todo se queda en la memoria de esta página (ni guardianagroup.com, ni terceros, ni localStorage ni
   IndexedDB); nombres y no rutas; nunca SID, ids de aparato ni direcciones; donde hay país o red, «IP Geolocation by
   DB-IP». Las frases de las comprobaciones son las del panel (/api/textos, en el idioma del panel); los textos propios
   están en español aquí y static/idioma.js los pone en el idioma de la página. Fuera del programa, la misma sección
   explica qué hace y ofrece descargar el programa. */
(function () {
  'use strict';
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const lang = () => (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es';
  const loc = () => (window.GuardianaIdioma ? window.GuardianaIdioma.locale : undefined);
  const enPrograma = () => document.documentElement.dataset.enPrograma === '1';
  const reducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const DESCARGA = '/instalar.html#descargar';
  const PANEL = 'http://127.0.0.1:7443/';
  const DBIP = 'https://db-ip.com';

  // ---------- iconos ----------
  const SVG = (d, w) => '<svg width="' + (w || 16) + '" height="' + (w || 16) + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const I_ATRAS = SVG('<path d="M10 3.5 5.5 8l4.5 4.5"/>');
  const I_X = SVG('<path d="M4 4l8 8M12 4l-8 8"/>', 14);
  const I_ESCANER = SVG('<path d="M2.5 5.5v-2a1 1 0 0 1 1-1h2M10.5 2.5h2a1 1 0 0 1 1 1v2M13.5 10.5v2a1 1 0 0 1-1 1h-2M5.5 13.5h-2a1 1 0 0 1-1-1v-2M2.5 8h11"/>', 18);
  const I_ESCANER_P = SVG('<path d="M2.5 5.5v-2a1 1 0 0 1 1-1h2M10.5 2.5h2a1 1 0 0 1 1 1v2M13.5 10.5v2a1 1 0 0 1-1 1h-2M5.5 13.5h-2a1 1 0 0 1-1-1v-2M2.5 8h11"/>', 14);
  const I_BAJA = SVG('<path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/>', 18);
  const I_OTRA = SVG('<path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.8v2.7h-2.7"/>', 15);
  const I_SALTO = SVG('<path d="M6 3.5H3.5v9h9V10M9 3.5h3.5V7M12.3 3.7 7.5 8.5"/>', 13);

  // ---------- lo que llega, limpio: nombres y no rutas ----------
  const RARO = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;
  const SID = /\bS-1-\d+(?:-\d+){1,14}\b/g;
  const MAC = /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g;
  const ID_APARATO = /\b(?:mac|ip):[^\s,;)]+/gi;
  const URLS = /\b(?:https?|ftp|file|wss?):\/\/[^\s"'<>]+/gi;
  const IP4 = /\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}(?::\d{1,5})?\b/g;
  const IP6 = /\[?(?:[0-9A-Fa-f]{1,4}:){2,7}(?::?[0-9A-Fa-f]{1,4})?\]?(?::\d{1,5})?/g;
  // the folders of a path (Windows, a share, the registry, a Unix home): only the last name stays
  const DIR_WIN = /(?:\\\\\?\\|\\\?\?\\)?(?:[A-Za-z]:|\\\\[^\\\s]+|%[A-Za-z_]+%|\\SystemRoot)\\(?:[^\\]*\\)*/g;
  const DIR_REG = /\bHK(?:EY_[A-Z_]+|LM|CU|CR|CC|U)(?:\\[^\\]*)*\\/g;
  const DIR_UNIX = /(?:~|\/(?:Users|home|private|var|tmp|opt|Applications|Library|System|usr|etc|mnt|media|Volumes|root))\/(?:[^/\s]+\/)*/g;
  function limpia(x, max, conDirecciones) {
    if (typeof x !== 'string' && typeof x !== 'number') return '';
    let s = String(x).replace(RARO, ' ');
    s = s.replace(URLS, '•••').replace(ID_APARATO, '•••').replace(SID, '•••').replace(MAC, '•••');
    if (conDirecciones !== false) { s = s.replace(IP4, '•••').replace(IP6, (m) => (/[a-f]/i.test(m) || m.includes('::') ? '•••' : m)); }
    s = s.replace(DIR_WIN, '').replace(DIR_REG, '').replace(DIR_UNIX, '');
    s = s.replace(/_[a-z0-9]{13}\b/g, ''); // a Store package's publisher hash (Microsoft.WindowsCamera_8wekyb3d8bbwe)
    s = s.replace(/\s+/g, ' ').trim();
    return s.length > (max || 160) ? s.slice(0, (max || 160) - 1).trimEnd() + '…' : s;
  }
  const esSID = (s) => /^S-1-\d/.test(String(s || ''));
  const httpsDe = (u) => (typeof u === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(u) && u.length < 400 ? u : '');
  const lista = (x) => (Array.isArray(x) ? x : []);
  const numero = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : typeof x === 'string' && x.trim() !== '' && Number.isFinite(+x) ? +x : null);

  // ---------- números, bytes, horas ----------
  const num = (n) => { const v = numero(n); return v == null ? '—' : v.toLocaleString(loc()); };
  function bytes(n) {
    let v = numero(n); if (v == null) return '—';
    const u = ['B', 'kB', 'MB', 'GB', 'TB']; let i = 0;
    while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
    return (i ? v.toLocaleString(loc(), { maximumFractionDigits: v < 10 ? 1 : 0 }) : Math.round(v).toLocaleString(loc())) + ' ' + u[i];
  }
  const esHora = (ms) => { const v = numero(ms); return v != null && v > 1e12 && v < 4e12; };
  const fecha = (ms) => { if (!esHora(ms)) return ''; try { return new Date(+ms).toLocaleString(loc(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (_) { return ''; } };
  const fechaLarga = (ms) => { if (!esHora(ms)) return ''; try { return new Date(+ms).toLocaleString(loc(), { dateStyle: 'long', timeStyle: 'medium' }); } catch (_) { return new Date(+ms).toISOString(); } };
  const dia = (ms) => { if (!esHora(ms)) return ''; try { return new Date(+ms).toLocaleDateString(loc(), { day: 'numeric', month: 'short', year: 'numeric' }); } catch (_) { return ''; } };
  const hora = (ms) => { if (!esHora(ms)) return ''; try { return new Date(+ms).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (_) { return ''; } };
  const hhmm = (ms) => { if (!esHora(ms)) return ''; try { return new Date(+ms).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }); } catch (_) { return ''; } };
  const iso = (ms) => { try { return new Date(+ms).toISOString(); } catch (_) { return ''; } };
  const reloj = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const segundos = (ms) => { const s = Math.max(0, ms) / 1000; return s < 60 ? s.toLocaleString(loc(), { maximumFractionDigits: s < 10 ? 1 : 0 }) + ' s' : Math.floor(s / 60) + ' min ' + Math.round(s % 60) + ' s'; };
  const nombresPais = {};
  function paisNombre(cc) {
    const c = String(cc || '').toUpperCase();
    if (!/^[A-Z]{2}$/.test(c) || c === 'ZZ' || c === 'XX') return '';
    try { const l = lang(); const dn = nombresPais[l] || (nombresPais[l] = new Intl.DisplayNames([l], { type: 'region' })); return dn.of(c) || c; } catch (_) { return c; }
  }

  // ---------- los textos del panel (su idioma) ----------
  let TX = null, LANGP = '';
  const tp = (k) => (TX && typeof k === 'string' && typeof TX[k] === 'string' ? TX[k] : null);
  const tpn = (k, n) => (Number(n) === 1 && tp(k + '_uno')) || tp(k);
  function rellena(s, datos) {
    let r = String(s || '');
    for (const [a, b] of Object.entries(datos && typeof datos === 'object' ? datos : {})) r = r.split('{' + a + '}').join(limpia(String(b == null ? '' : b), 160));
    return r.replace(/\{[a-z_]+\}/gi, '—');
  }
  const humano = (id) => { const s = String(id || '').replace(/_/g, ' ').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; };
  const idiomaDe = (p) => { const v = p && p.rv_g_proteccion; return v === 'Protección' ? 'es' : v === 'Protection' ? 'en' : v === 'Proteção' ? 'pt' : ''; };
  const perfil = (p) => tp('vg_perfil_' + String(p || '').toLowerCase()) || limpia(p, 40);
  const valorVg = (v) => (v === 'sin_fijar' ? tp('vg_valor_sin_fijar') || v : tp('vg_valor_' + String(v).toLowerCase()) || limpia(v, 40));

  // ---------- el DOM ----------
  function h(tag, at, ...hijos) {
    const e = document.createElement(tag);
    if (at) for (const k in at) {
      const v = at[k]; if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'on') for (const ev in v) e.addEventListener(ev, v[ev]);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const x of hijos.flat(3)) { if (x == null || x === false || x === '') continue; e.append(x instanceof Node ? x : document.createTextNode(String(x))); }
    return e;
  }
  // a name or a figure: it is never translated; the panel's own words: in the panel's language
  const dato = (s, cls, tag) => h(tag || 'span', { class: cls, translate: 'no' }, s);
  const panel = (s, cls, tag) => h(tag || 'span', { class: cls, translate: 'no', lang: LANGP || null }, s);
  // Spanish in the page; static/idioma.js shows it in the language on screen and keeps the original for the next change
  function pon(el, s) { if (el.dataset.es !== s) { el.dataset.es = s; el.textContent = s; } return el; }
  const enlace = (href, ...hijos) => h('a', { href, target: '_blank', rel: 'noopener noreferrer', referrerpolicy: 'no-referrer' }, ...hijos);

  // ---------- la pasarela del programa ----------
  // 1.0.50 (independent review): the program answers at once what it will not pass (403 not on its list, 503 its panel is
  // not open, 413 too large), lets through at most four readings at a time (the fifth gets 429), a new check-up once a
  // minute and a new slow look every 30 s (429 again), and the two orders only right after a real click or key (428).
  // So this page keeps its own queue of four, and sends the two orders inside the person's click on «Escanear».
  const PEND = new Map(), COLA = [], MAX_A_LA_VEZ = 4;
  let SIG = Math.floor(Math.random() * 1e6) * 1000 + 1, enVuelo = 0;
  const MOTIVO_DE = { 402: 'plan', 401: 'sesion', 403: 'prohibida', 413: 'grande', 428: 'sin_gesto', 429: 'freno', 503: 'sin_panel', 0: 'red' };
  // primero: the polls of a running check-up go ahead of the queue
  function pide(metodo, ruta, maximo, primero) {
    return new Promise((resolver) => {
      const job = { metodo, ruta, maximo, resolver, intentos: 0 };
      if (primero) COLA.unshift(job); else COLA.push(job);
      bombea();
    });
  }
  function bombea() { while (enVuelo < MAX_A_LA_VEZ && COLA.length) envia(COLA.shift()); }
  function envia(job) {
    enVuelo++;
    const n = SIG++, t0 = performance.now();
    let reloj0 = 0, hecho = false;
    const fin = (r) => {
      if (hecho) return; hecho = true; PEND.delete(n); clearTimeout(reloj0); enVuelo = Math.max(0, enVuelo - 1);
      // a reading turned away only because four were already on their way goes back to the queue a moment later
      if (r.estado === 429 && job.metodo === 'GET' && job.intentos < 8) { job.intentos++; setTimeout(() => { COLA.unshift(job); bombea(); }, 400 + 200 * job.intentos); bombea(); return; }
      r.ms = Math.round(performance.now() - t0); job.resolver(r); bombea();
    };
    reloj0 = setTimeout(() => fin({ ok: false, motivo: 'tiempo', maximo: job.maximo }), job.maximo);
    PEND.set(n, fin);
    try { document.dispatchEvent(new CustomEvent('guardiana-panel-pide', { detail: JSON.stringify({ n, metodo: job.metodo, ruta: job.ruta }) })); }
    catch (_) { fin({ ok: false, motivo: 'tiempo', maximo: job.maximo }); }
  }
  document.addEventListener('guardiana-panel', (e) => {
    let d = e && e.detail;
    if (typeof d === 'string') { if (d.length > 4200000) return; try { d = JSON.parse(d); } catch (_) { return; } }
    if (!d || typeof d !== 'object') return;
    const fin = PEND.get(Number(d.n)); if (!fin) return;
    const estado = Number(d.estado) || 0;
    let j = null, legible = true;
    if (d.datos && typeof d.datos === 'object') j = d.datos;
    else if (typeof d.datos === 'string' && d.datos) { try { j = JSON.parse(d.datos); } catch (_) { legible = false; } }
    else legible = false;
    if (estado >= 200 && estado < 300) return fin(legible ? { ok: true, estado, json: j } : { ok: false, estado, motivo: 'ilegible' });
    fin({ ok: false, estado, json: j, motivo: MOTIVO_DE[estado] || 'error' });
  });

  // ---------- las lecturas ----------
  // [clave, método, ruta, nombre, tope en ms]; el orden es el de los segmentos del avance
  const L = [
    ['revAhora', 'POST', '/api/revision/ahora', 'Revisión de Windows: orden de empezar', 12000],
    ['vigAhora', 'POST', '/api/vigilancia/ahora', 'Vigilancia continua: mirada nueva', 12000],
    ['textos', 'GET', '/api/textos', 'Textos del panel', 15000],
    ['estado', 'GET', '/api/estado', 'Estado del programa', 12000],
    ['vigia', 'GET', '/vigia', 'Vigía de las llamadas', 12000],
    ['pd1', 'GET', '/api/por-dentro', 'Conexiones de 24 horas: primera toma', 25000],
    ['resumen', 'GET', '/api/vigilancia/resumen', 'Vigilancia continua: resumen', 12000],
    ['detectar', 'GET', '/api/antivirus/detectar', 'Antivirus registrados en Windows', 40000],
    ['antivirus', 'GET', '/api/antivirus', 'Actividad del antivirus', 25000],
    ['identificacion', 'GET', '/api/identificacion', 'Identificación de destinos', 25000],
    ['ia', 'GET', '/api/ia', 'Servicios de IA', 20000],
    ['qv', 'GET', '/api/quien-vende', 'Quién vende tus datos', 40000],
    ['revision', 'GET', '/api/revision', 'Revisión de Windows: resultado', 12000],
    ['vigilancia', 'GET', '/api/vigilancia', 'Vigilancia continua: detalle e historial', 40000],
    ['pd2', 'GET', '/api/por-dentro', 'Conexiones de 24 horas: segunda toma', 25000],
  ];
  const LD = {}; for (const [k, m, r, n, t] of L) LD[k] = { m, r, n, t };
  // the readings the next build of the program adds: an older one does not answer them
  const NUEVAS = new Set(['vigia', 'qv']);
  const MOTIVO = {
    tiempo: 'Sin respuesta del programa',
    plan: 'Forma parte del plan Plus',
    sesion: 'El panel del programa no tiene una sesión válida',
    prohibida: 'El programa no deja pasar esta lectura',
    sin_panel: 'El panel del programa no está abierto',
    grande: 'La respuesta era demasiado grande para pasarla',
    sin_gesto: 'El programa solo la acepta justo después de pulsar «Escanear»',
    freno: 'El programa la frenó: demasiadas lecturas a la vez',
    freno_rev: 'Se pidió una revisión hace menos de un minuto: se sigue esa',
    freno_vig: 'Se pidió una mirada hace menos de 30 segundos: se usa esa',
    error: 'El programa no pudo hacer esta lectura',
    red: 'El panel no pudo hablar con su servicio',
    ilegible: 'Respuesta ilegible',
    no_windows: 'Solo se mide en Windows',
    no_termino: 'La revisión de Windows no terminó a tiempo',
    no_empezo: 'La revisión de Windows no empezó',
    fallo: 'La revisión de Windows falló',
    sin_programa: 'Necesita el programa GUARDIANA para Windows',
  };

  // ---------- el escaneo ----------
  // S = { g, t0, tFin, fin, informe, l: {clave: {e, motivo, estado, ms, maximo, detalle, t}}, d: {clave: json}, v: {clave: versión},
  //       rev: {...}, vig: {...} }
  let S = null, GEN = 0;
  const vigente = (g) => !!(S && S.g === g && GEN === g);
  function nuevo() {
    const l = {}; for (const [k] of L) l[k] = { e: 'pendiente' };
    return { g: ++GEN, t0: Date.now(), tFin: 0, fin: false, informe: false, l, d: {}, v: {},
      rev: { e: 'esperando', visto: 0, cola: [], feed: [], hechas: [], seccion: '', firmas: 0, sinFirma: 0, cuentas: [], vistaCorriendo: false, fin: false, detalle: '' },
      vig: { e: 'esperando', tPedido: 0, umbral: 0, lentas: {}, motivo: '' }, tPd1: 0 };
  }
  // a reading: asked now (it waits in the queue if four are on their way) and kept in memory with its result
  function lee(g, k) {
    if (!vigente(g)) return Promise.resolve(null);
    const st = S.l[k], def = LD[k];
    st.e = 'esperando'; pintaAvanceLuego();
    return pide(def.m, def.r, def.t).then((r) => {
      if (!vigente(g)) return null;
      st.ms = r.ms; st.estado = r.estado; st.t = Date.now();
      if (r.ok) { st.e = 'medido'; S.d[k] = r.json; S.v[k] = (S.v[k] || 0) + 1; }
      else { st.e = 'no_medido'; st.motivo = r.motivo; st.maximo = r.maximo; }
      late(); pintaAvanceLuego(); informeLuego();
      return r;
    });
  }
  function noMedido(k, motivo, detalle, omitida) { const st = S.l[k]; if (!st || st.e === 'medido') return; st.e = omitida ? 'omitido' : 'no_medido'; st.motivo = motivo; st.t = Date.now(); if (detalle) st.detalle = detalle; pintaAvanceLuego(); informeLuego(); }

  // Not async on purpose: the two orders leave inside the person's own click (the program only lets them through within
  // 3 s of a real click or key), before anything else is asked.
  function escanea() {
    if (!enPrograma() || (S && !S.fin)) return;
    S = nuevo(); const g = S.g;
    const pRevA = lee(g, 'revAhora');
    const pVigA = lee(g, 'vigAhora');
    S.vig.tPedido = Date.now();
    pintaTodo(); arrancaReloj();
    setTimeout(() => { if (vigente(g) && !S.informe) { S.informe = true; pintaTodo(); } }, 60000);
    // the quick readings, then the rest; the queue keeps four on their way at most
    const pTextos = lee(g, 'textos').then((r) => { if (r && r.ok && r.json && r.json.panel && typeof r.json.panel === 'object') { TX = r.json.panel; LANGP = idiomaDe(TX); informeLuego(true); } });
    const pEstado = lee(g, 'estado');
    const pVigia = lee(g, 'vigia');
    const pPd1 = lee(g, 'pd1').then(() => { if (S && S.g === g) S.tPd1 = Date.now(); });
    const pRev = pRevA.then((r) => (vigente(g) ? revision(g, r) : null));
    const pVig = pVigA.then((r) => (vigente(g) ? vigilancia(g, r) : null));
    const g3 = ['detectar', 'antivirus', 'identificacion', 'ia', 'qv'].map((k) => lee(g, k));
    // a second take of the connections (the VPNs and the processor's rates need it), at least 8 s after the first
    const pPd2 = Promise.all([pPd1, ...g3]).then(async () => {
      if (!vigente(g)) return;
      const w = (S.tPd1 || Date.now()) + 8000 - Date.now(); if (w > 0) await espera(w);
      if (vigente(g)) await lee(g, 'pd2');
    });
    Promise.all([pTextos, pEstado, pVigia, pRev, pVig, pPd2, ...g3]).then(() => {
      if (!vigente(g)) return;
      S.fin = true; S.informe = true; S.tFin = Date.now();
      paraReloj(); late(true); pintaTodo();
    });
  }

  // the Windows check-up: the order's answer, then a look every 700 ms with its real steps until it ends
  async function revision(g, r) {
    // a check-up that ends after this moment is this scan's; with the program's brake (one a minute), the one asked
    // less than a minute ago is
    let umbral = S.t0 - 1500;
    const orden = !!(r && r.ok && r.json && typeof r.json === 'object');
    if (orden) { if (r.json.disponible === false) return terminaRev('no_medido', 'no_windows'); procesaRev(r.json, umbral); }
    else if (r && r.estado === 429) { noMedido('revAhora', 'freno_rev', '', true); umbral = S.t0 - 61000; }
    if (S.rev.fin) return;
    S.l.revision.e = 'esperando'; pintaAvanceLuego();
    const limite = S.t0 + 315000, sinOrden = !orden && !(r && r.estado === 429);
    let fallos = 0, vueltas = 0;
    while (vigente(g) && !S.rev.fin) {
      await espera(700); if (!vigente(g)) return;
      const q = await pide('GET', '/api/revision', 12000, true); if (!vigente(g)) return;
      vueltas++;
      if (q.ok && q.json && typeof q.json === 'object') { fallos = 0; procesaRev(q.json, umbral); }
      else if (++fallos >= 4) { terminaRev('no_medido', q.motivo || 'tiempo'); break; }
      if (S.rev.fin) break;
      // the order did not go through and nothing is running: say why the order failed
      if (sinOrden && vueltas >= 1 && q.ok && !S.rev.vistaCorriendo) { terminaRev('no_medido', S.l.revAhora.motivo || 'error'); break; }
      if (Date.now() > limite) { terminaRev('no_medido', 'no_termino'); break; }
      if (!S.rev.vistaCorriendo && Date.now() - S.t0 > 25000) { terminaRev('no_medido', 'no_empezo'); break; }
    }
  }
  const SECS = ['equipo', 'actualizaciones', 'defensa', 'sistema', 'acceso', 'arranque', 'salida', 'certificados', 'privacidad', 'programas', 'defender_sucesos'];
  const SEC_N = { equipo: 'Equipo', actualizaciones: 'Actualizaciones', defensa: 'Antivirus', sistema: 'Sistema', acceso: 'Acceso', arranque: 'Arranque', salida: 'Salida a internet', certificados: 'Certificados', privacidad: 'Privacidad', programas: 'Programas', defender_sucesos: 'Sucesos del antivirus' };
  const CUENTA_N = { inicio: 'Programas de inicio', tareas: 'Tareas programadas', servicios: 'Servicios', controladores: 'Controladores' };
  function procesaRev(j, umbral) {
    if (j.disponible === false) return terminaRev('no_medido', 'no_windows');
    if (j.corriendo) {
      S.rev.vistaCorriendo = true;
      const v = j.vivo && typeof j.vivo === 'object' ? j.vivo : {};
      // the steps since the last look: the program keeps the last 60 and numbers them all
      const total = numero(v.n) || 0, pasos = lista(v.pasos).filter((p) => Array.isArray(p) && typeof p[0] === 'string' && typeof p[1] === 'string');
      const nuevos = total < S.rev.visto ? pasos : pasos.slice(Math.max(0, pasos.length - (total - S.rev.visto)));
      S.rev.visto = total;
      for (const p of nuevos) encola(p);
      S.rev.seccion = SECS.includes(v.seccion) ? v.seccion : '';
      S.rev.hechas = lista(v.hechas).filter((x) => Array.isArray(x) && SECS.includes(x[0])).map((x) => [x[0], numero(x[1]) || 0]);
      S.rev.firmas = numero(v.firmas) || 0; S.rev.sinFirma = numero(v.sin_firma) || 0;
      S.rev.cuentas = lista(v.cuentas).filter((x) => Array.isArray(x) && CUENTA_N[x[0]]).map((x) => [x[0], numero(x[1]) || 0]);
      pintaAvanceLuego(); informeLuego();
      return;
    }
    // not running: it ended during this scan if it was seen running, or if it ended after the threshold
    const reciente = esHora(j.cuando) && +j.cuando >= umbral;
    if (!S.rev.vistaCorriendo && !reciente) return;
    if (j.error) return terminaRev('no_medido', j.error === 'no_windows' ? 'no_windows' : 'fallo', j.error === 'no_windows' ? '' : limpia(String(j.error), 160));
    S.d.revision = j; S.v.revision = (S.v.revision || 0) + 1;
    if (S.rev.hechas.length < SECS.length) { const ya = new Map(S.rev.hechas); S.rev.hechas = SECS.map((s) => [s, ya.get(s) || 0]); }
    S.rev.seccion = '';
    terminaRev('medido');
  }
  function terminaRev(e, motivo, detalle) {
    if (!S || S.rev.fin) return;
    S.rev.fin = true; S.rev.e = e; S.rev.motivo = motivo || ''; S.rev.detalle = detalle || '';
    const st = S.l.revision; st.e = e; st.ms = Date.now() - S.t0; st.t = Date.now(); if (motivo) st.motivo = motivo; if (detalle) st.detalle = detalle;
    late(); pintaAvanceLuego(); informeLuego();
  }

  // the continuous monitoring: a fresh slow look (start-up, privacy, protection) asked in the click, followed through its
  // summary every 3 s, then its detail once (which checks its whole chain: not to be polled)
  const LENTAS = ['arranque', 'privacidad', 'proteccion'];
  async function vigilancia(g, r) {
    if (r && r.estado === 402) { noMedido('resumen', 'plan'); noMedido('vigilancia', 'plan'); S.vig.e = 'no_medido'; S.vig.motivo = 'plan'; pintaAvanceLuego(); return; }
    let umbral = S.vig.tPedido, mirando = !!(r && r.ok);
    if (r && r.estado === 429) { noMedido('vigAhora', 'freno_vig', '', true); umbral = S.vig.tPedido - 30000; mirando = true; }
    S.vig.umbral = umbral;
    const rr = await lee(g, 'resumen'); if (!vigente(g)) return;
    const j = rr && rr.ok && rr.json && typeof rr.json === 'object' ? rr.json : null;
    if (!j) {
      S.vig.e = 'no_medido'; S.vig.motivo = S.l.resumen.motivo || 'error';
      if (S.vig.motivo === 'plan') { noMedido('vigilancia', 'plan'); pintaAvanceLuego(); return; }
    } else {
      const lentas = LENTAS.filter((id) => { const x = lista(j.vigilancias).find((w) => w && w.id === id); return x && x.disponible !== false; });
      S.vig.lentas = {}; for (const id of lentas) S.vig.lentas[id] = false;
      const marca = (jj) => { for (const id of lentas) { const x = lista(jj.vigilancias).find((w) => w && w.id === id); if (x && esHora(x.ultima) && +x.ultima >= umbral) S.vig.lentas[id] = true; } };
      marca(j);
      if (!mirando) { S.vig.e = 'sin_orden'; S.vig.motivo = S.l.vigAhora.motivo || 'error'; }
      else if (lentas.every((id) => S.vig.lentas[id])) S.vig.e = 'hecha';
      else {
        S.vig.e = 'mirando'; pintaAvanceLuego();
        const limite = S.vig.tPedido + 125000;
        while (vigente(g)) {
          await espera(3000); if (!vigente(g)) return;
          const q = await pide('GET', '/api/vigilancia/resumen', 12000, true); if (!vigente(g)) return;
          if (q.ok && q.json && typeof q.json === 'object') { S.d.resumen = q.json; S.v.resumen = (S.v.resumen || 0) + 1; marca(q.json); informeLuego(); }
          if (lentas.every((id) => S.vig.lentas[id])) { S.vig.e = 'hecha'; break; }
          if (Date.now() > limite) { S.vig.e = 'caduco'; break; }
          pintaAvanceLuego();
        }
      }
    }
    pintaAvanceLuego();
    if (vigente(g)) await lee(g, 'vigilancia');
  }

  // ---------- los pasos de la revisión, en directo ----------
  let relojCola = 0;
  function encola(p) {
    if (!S) return;
    S.rev.cola.push(p); if (S.rev.cola.length > 40) S.rev.cola.splice(0, S.rev.cola.length - 40);
    if (!relojCola) relojCola = setInterval(sigueCola, reducido() ? 600 : 260);
  }
  function sigueCola() {
    if (!S || !S.rev.cola.length) { clearInterval(relojCola); relojCola = 0; return; }
    const p = S.rev.cola.shift();
    S.rev.feed.push(p); if (S.rev.feed.length > 8) S.rev.feed.shift();
    late(); pintaFeed(p);
  }
  function filaPaso(p) {
    const [tipo, texto] = p;
    if (tipo === 'seccion') return h('li', null, h('span', { class: 'tipo' }, 'Sección'), h('b', null, SEC_N[texto] || ''));
    if (tipo === 'firma') {
      const [nombre, estado, firmante] = texto.split('\t');
      const valida = estado === 'Valid';
      return h('li', null, h('span', { class: 'tipo' }, 'Firma'), dato(limpia(nombre, 80), null, 'b'),
        estado === undefined ? h('span', { class: 'est' }, 'Firma leída') : h('span', { class: 'est' + (valida ? '' : ' aviso') }, valida ? 'Firma válida' : 'Sin firma válida'),
        firmante ? dato(limpia(firmante, 80), null, 'small') : null);
    }
    if (tipo === 'dns') return h('li', null, h('span', { class: 'tipo' }, 'Pregunta DNS'), dato(limpia(texto, 80, false), null, 'b'), h('span', { class: 'est' }, 'Pregunta de prueba'));
    if (tipo === 'cuenta') { const [k, n] = texto.split('\t'); return h('li', null, h('span', { class: 'tipo' }, 'Recuento'), h('b', null, CUENTA_N[k] || ''), dato(num(n), 'est')); }
    return null;
  }

  // ---------- la sección ----------
  let raiz = null, cuerpo = null, portada = null, cabeza = null, avance = null, tira = null, informe = null, indice = null, secciones = null;
  let acc = null, volverBtn = null, cerrarBtn = null, descargarBtn = null, lienzo = null, red = null, abierto = false, antes = null, volverA = 'orbita';
  const C = {}; // the progress console's parts
  function monta() {
    if (raiz) return raiz;
    raiz = h('section', { class: 'escaner', id: 'escaner', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'esc-titulo', hidden: true });
    volverBtn = h('button', { type: 'button', class: 'esc-volver', html: I_ATRAS }); volverBtn.append(h('span'));
    volverBtn.addEventListener('click', sal);
    const marca = h('div', { class: 'esc-logo' }, h('span', { class: 'g', translate: 'no' }, 'GUARDIANA'), h('span', { class: 'sep', 'aria-hidden': 'true', translate: 'no' }, '/'), h('span', { class: 'sub' }, 'Escáner PC'));
    cerrarBtn = h('button', { type: 'button', class: 'esc-cerrar', 'aria-label': 'Cerrar', title: 'Cerrar', html: I_X });
    cerrarBtn.addEventListener('click', sal);
    acc = h('div', { class: 'esc-acc' }, cerrarBtn);
    // no <header> here: Órbita's stylesheet fixes every header to the top of the page
    const barra = h('div', { class: 'esc-barra' }, volverBtn, marca, acc);
    lienzo = h('canvas', { class: 'esc-red', 'aria-hidden': 'true' });
    portada = h('div', { class: 'esc-portada' });
    cabeza = h('div', { class: 'esc-cabeza', hidden: true });
    avance = h('div', { class: 'esc-avance', hidden: true });
    tira = h('div', { class: 'esc-tira', role: 'status', hidden: true });
    indice = h('nav', { class: 'esc-indice', 'aria-label': 'Índice' });
    secciones = h('div', { class: 'esc-secciones' });
    informe = h('div', { class: 'esc-informe', hidden: true }, indice, secciones);
    const hoja = h('div', { class: 'esc-hoja' }, portada, cabeza, avance, tira, informe);
    cuerpo = h('div', { class: 'esc-cuerpo', tabindex: '-1' }, hoja);
    raiz.append(h('div', { class: 'esc-fondo', 'aria-hidden': 'true' }), barra, cuerpo);
    montaCabeza(); montaAvance();
    document.body.append(raiz);
    // a click on something that cannot take the focus leaves it on the sheet, so the keys scroll it and stay here
    raiz.addEventListener('pointerdown', (e) => { if (!e.target.closest('button, a, summary, input, select, textarea, [tabindex]')) setTimeout(() => { if (abierto && !raiz.contains(document.activeElement)) cuerpo.focus({ preventScroll: true }); }, 0); });
    raiz.addEventListener('keydown', teclas);
    cuerpo.addEventListener('scroll', espia, { passive: true });
    return raiz;
  }
  function pintaVolver() {
    if (!volverBtn) return;
    pon(volverBtn.querySelector('span'), volverA === 'nucleo' ? 'Inicio' : 'Órbita');
  }

  // ---------- la portada ----------
  const SECC = [
    ['estado', 'Estado del equipo', 'El veredicto, solo con lo medido.'],
    ['proteccion', 'Protección', 'Antivirus, cortafuegos, actualizaciones, cifrado y arranque seguro.'],
    ['antivirus', 'Tu antivirus por dentro y con quién habla', 'Qué envía, a qué países y empresas, y lo que manda a la nube.'],
    ['sensores', 'Cámara, micrófono, pantalla y ubicación', 'Quién los usa ahora y quién los usó.'],
    ['acceso', 'Control remoto, cuentas y quién administra el equipo', 'Sesiones remotas, programas de control, cuentas, puertos y organizaciones.'],
    ['arranque', 'Lo que arranca solo', 'Programas de inicio, tareas, servicios y controladores, con su firma.'],
    ['fabrica', 'Programas de fábrica y preinstalados', 'Lo que puso el fabricante y lo que Windows instala en cada cuenta.'],
    ['telemetria', 'Telemetría y datos que salen', 'Diagnóstico de Windows, publicidad y lo que se envía a quién.'],
    ['salida', 'Por dónde sale tu internet', 'DNS, proxy, VPN, archivo hosts y Wi-Fi.'],
    ['certificados', 'Certificados raíz', 'Las autoridades en las que confía el equipo, además de las de Microsoft.'],
    ['ia', 'IA en este equipo', 'Servicios de IA con los que habló, qué programas lo hicieron y Recall.'],
    ['extensiones', 'Extensiones del navegador', 'Las que pueden leer todas las webs o tus chats con IA.'],
    ['identidad', 'Quién está detrás de los destinos', 'Qué empresas reciben las conexiones y con qué certeza se sabe.'],
    ['defender', 'Lo que anotó tu antivirus', 'Amenazas, análisis y protección apagada en los últimos 7 días.'],
    ['equipo', 'Otros datos del equipo', 'Modelo, Windows, firmware, USB y Bluetooth.'],
    ['limites', 'Límites y cómo se midió', 'Duración real, lo que no se midió y las fuentes.'],
  ];
  const nn = (i) => String(i + 1).padStart(2, '0');
  function pintaPortada(prog) {
    const clave = (prog ? 'p' : 'w') + lang();
    if (portada.dataset.clave === clave) return;
    portada.dataset.clave = clave; portada.textContent = '';
    const hechos = h('div', { class: 'esc-hechos' },
      h('div', { class: 'esc-hecho' }, h('b', null, 'Solo lectura'), h('span', null, 'No cambia ningún ajuste ni instala nada.')),
      h('div', { class: 'esc-hecho' }, h('b', null, 'En este equipo'), h('span', null, 'El informe vive en esta página: no se envía a GUARDIANA ni a nadie.')),
      h('div', { class: 'esc-hecho' }, h('b', null, 'Sin cifras inventadas'), h('span', null, 'Cada dato dice de dónde sale. Lo que no se pudo medir se dice, con su motivo.')));
    const examina = h('div', { class: 'esc-examina' }, h('h2', { class: 'esc-rot' }, 'Qué examina'),
      h('ol', null, SECC.map(([, t, d], i) => h('li', null, dato(nn(i), 'n'), h('b', null, t), h('small', null, d)))));
    if (prog) {
      const b = h('button', { type: 'button', class: 'esc-boton', html: I_ESCANER }); b.append(h('span', null, 'Escanear este equipo'));
      b.addEventListener('click', () => escanea());
      portada.append(lienzo, h('p', { class: 'esc-k' }, 'Inspección de este equipo'), h('h1', { id: 'esc-titulo' }, 'Examen completo de este equipo'),
        h('p', { class: 'esc-lead' }, 'Protección y antivirus, cámara, micrófono y pantalla, control remoto, lo que arranca solo y lo que vino de fábrica, telemetría y todo lo que este equipo envía fuera. Una sola lectura, con las mediciones del programa GUARDIANA instalado aquí.'),
        b, h('p', { class: 'esc-nota-boton' }, 'La revisión de Windows puede tardar unos minutos; el resto aparece en cuanto llega.'), hechos, examina);
    } else {
      const a = h('a', { class: 'esc-boton web', href: DESCARGA, html: I_BAJA }); a.append(h('span', null, 'Descargar GUARDIANA para Windows'));
      portada.append(lienzo, h('p', { class: 'esc-k' }, 'Escáner PC · Para Windows'), h('h1', { id: 'esc-titulo' }, 'Examen completo de este equipo'),
        h('p', { class: 'esc-lead' }, 'El Escáner PC lee lo que Windows y el programa GUARDIANA saben de este equipo: protección y antivirus, cámara, micrófono y pantalla, control remoto, lo que arranca solo, los programas de fábrica, la telemetría y todo lo que sale a internet. Una web no puede ver nada de esto por sí sola: hace falta el programa instalado.'),
        a, h('p', { class: 'esc-nota-boton' }, 'Una vez instalado, abre Órbita desde el programa y pulsa «Escáner PC».'), hechos, examina);
    }
  }

  // ---------- la cabeza: escaneando / informe ----------
  function montaCabeza() {
    C.cabT = h('h1', { id: 'esc-titulo-2' });
    C.vivo = h('i', { class: 'esc-vivo', 'aria-hidden': 'true' });
    C.ini = dato('', null, 'b'); C.trans = dato('', null, 'b'); C.lect = dato('', null, 'b');
    C.transR = h('span'); C.lectR = h('span', null, 'Lecturas');
    C.linea = h('p', { class: 'esc-linea' }, C.vivo, h('span', null, h('span', null, 'Empezó'), ' ', C.ini), h('span', null, C.transR, ' ', C.trans), h('span', null, C.lectR, ' ', C.lect));
    C.otra = h('button', { type: 'button', class: 'esc-otra', hidden: true, html: I_OTRA }); C.otra.append(h('span', null, 'Volver a escanear'));
    C.otra.addEventListener('click', () => { if (S && S.fin) { cuerpo.scrollTo({ top: 0, behavior: reducido() ? 'auto' : 'smooth' }); escanea(); } });
    cabeza.append(h('div', { class: 'esc-red-caja' }), h('div', null, h('p', { class: 'esc-k' }, 'Escáner PC'), C.cabT, C.linea), C.otra);
  }
  function pintaCabeza() {
    if (!S) return;
    pon(C.cabT, S.informe ? 'Informe de este equipo' : 'Escaneando este equipo');
    C.ini.textContent = hora(S.t0);
    const fin = S.fin;
    pon(C.transR, fin ? 'Duración' : 'Tiempo transcurrido');
    C.trans.textContent = fin ? segundos(S.tFin - S.t0) : reloj(Date.now() - S.t0);
    const k = L.filter(([x]) => /medido|omitido/.test(S.l[x].e)).length;
    C.lect.textContent = k + ' / ' + L.length;
    C.vivo.classList.toggle('quieto', fin);
    C.otra.hidden = !fin;
  }

  // ---------- el avance ----------
  function montaAvance() {
    C.lN = dato('0'); C.lT = dato(String(L.length));
    C.segs = h('ol', { class: 'esc-segs', 'aria-hidden': 'true' }, L.map(([k, , , n]) => h('li', { 'data-k': k, title: n })));
    C.ult = h('ul', { class: 'esc-ult' });
    const mL = h('div', { class: 'esc-med m-lect' }, h('h3', { class: 'esc-rot' }, 'Lecturas del programa'), h('p', { class: 'esc-cifra-g' }, C.lN, h('small', { translate: 'no' }, '/'), h('small', null, C.lT)), C.segs, C.ult);
    C.rN = dato('0');
    C.secs = h('ol', { class: 'esc-secs-av' }, SECS.map((s) => h('li', { 'data-s': s }, h('i'), h('span', null, SEC_N[s]), dato('', null, 'small'))));
    C.fN = dato('0', null, 'b'); C.fS = dato('0', null, 'b');
    C.firmas = h('p', { class: 'esc-firmas' }, h('span', null, h('span', null, 'Firmas leídas'), ' ', C.fN), h('span', { class: 'aviso' }, h('span', null, 'Sin firma válida'), ' ', C.fS));
    C.revNota = h('div');
    const mR = h('div', { class: 'esc-med m-rev' }, h('h3', { class: 'esc-rot' }, 'Revisión de Windows'), h('p', { class: 'esc-cifra-g' }, C.rN, h('small', { translate: 'no' }, '/'), dato('11', null, 'small'), h('em', null, 'Secciones hechas')), C.secs, C.firmas, C.revNota);
    C.vigE = h('p', { class: 'esc-vig-estado' });
    C.lentas = h('ul', { class: 'esc-lentas' });
    const mV = h('div', { class: 'esc-med m-vig' }, h('h3', { class: 'esc-rot' }, 'Vigilancia continua'), C.vigE, C.lentas);
    C.feed = h('ol', { class: 'esc-feed', 'aria-hidden': 'true' });
    avance.append(h('div', { class: 'esc-av-rejilla' }, mL, mR, mV), C.feed);
  }
  let rafAvance = 0;
  function pintaAvanceLuego() { if (!rafAvance) rafAvance = requestAnimationFrame(() => { rafAvance = 0; pintaAvance(); pintaTira(); pintaCabeza(); }); }
  function pintaAvance() {
    if (!S || !abierto) return;
    const resueltas = L.filter(([k]) => /medido|omitido/.test(S.l[k].e));
    C.lN.textContent = String(resueltas.length);
    for (const li of C.segs.children) li.className = S.l[li.dataset.k].e;
    // the last four readings that answered (or did not)
    const ultimas = resueltas.map(([k]) => k).sort((a, b) => (S.l[b].t || 0) - (S.l[a].t || 0)).slice(0, 4).reverse();
    const cl = ultimas.join(',') + lang();
    if (C.ult.dataset.clave !== cl) {
      C.ult.dataset.clave = cl; C.ult.textContent = '';
      for (const k of ultimas) {
        const st = S.l[k];
        C.ult.append(h('li', { class: st.e }, h('i'), h('span', null, LD[k].n), st.e === 'medido' ? dato(segundos(st.ms || 0), null, 'small') : h('small', null, st.e === 'omitido' ? 'Omitida' : 'No medido')));
      }
    }
    // the check-up
    const hm = new Map(S.rev.hechas);
    C.rN.textContent = String(S.rev.e === 'medido' ? SECS.length : hm.size);
    for (const li of C.secs.children) {
      const s = li.dataset.s, hecha = hm.has(s) || S.rev.e === 'medido', ahora = !hecha && S.rev.seccion === s && !S.rev.fin;
      li.className = hecha ? 'hecha' : ahora ? 'ahora' : '';
      const sm = li.querySelector('small'); const t = hecha && hm.get(s) ? segundos(hm.get(s)) : '';
      if (sm.textContent !== t) sm.textContent = t;
    }
    C.fN.textContent = num(S.rev.firmas); C.fS.textContent = num(S.rev.sinFirma);
    const rn = S.rev.e + (S.rev.motivo || '') + lang();
    if (C.revNota.dataset.clave !== rn) { C.revNota.dataset.clave = rn; C.revNota.textContent = ''; if (S.rev.e === 'no_medido') C.revNota.append(noMedidoNodo('revision')); }
    // the monitoring
    const v = S.vig, ve = v.e + (v.motivo || '') + JSON.stringify(v.lentas) + lang();
    if (C.vigE.dataset.clave !== ve) {
      C.vigE.dataset.clave = ve; C.vigE.textContent = ''; C.lentas.textContent = '';
      if (v.e === 'no_medido') C.vigE.append(h('span', null, 'No medido'), h('small', null, MOTIVO[v.motivo] || MOTIVO.error));
      else if (v.e === 'esperando') C.vigE.append(h('span', null, 'Esperando la lectura…'));
      else {
        C.vigE.append(h('span', null, v.e === 'hecha' ? 'Mirada nueva hecha' : v.e === 'caduco' ? 'La mirada nueva no terminó a tiempo' : 'Mirada nueva pedida'),
          h('small', null, v.e === 'caduco' ? 'Se usa la última mirada que respondió.' : 'Arranque, privacidad y protección, leídos ahora por el programa.'));
        for (const id of Object.keys(v.lentas)) C.lentas.append(h('li', { class: v.lentas[id] ? 'hecha' : v.e === 'mirando' ? 'esperando' : '' }, h('i'), h('span', null, { arranque: 'Arranque', privacidad: 'Privacidad', proteccion: 'Protección' }[id])));
      }
    }
    if (!C.feed.childElementCount) C.feed.append(h('li', { class: 'vacio' }, 'Los pasos de la revisión de Windows aparecen aquí según los da.'));
  }
  function pintaFeed(p) {
    if (!abierto || !C.feed) return;
    const li = filaPaso(p); if (!li) return;
    const v = C.feed.querySelector('.vacio'); if (v) v.remove();
    C.feed.append(li); while (C.feed.children.length > 8) C.feed.firstElementChild.remove();
    hablaRed();
  }
  function rehaceFeed() {
    if (!C.feed || !S) return;
    C.feed.textContent = ''; for (const p of S.rev.feed) { const li = filaPaso(p); if (li) C.feed.append(li); }
  }
  function pintaTira() {
    if (!S || !abierto || tira.hidden) return;
    const clave = [S.fin, S.rev.e, S.rev.hechas.length, Math.round((Date.now() - S.t0) / 1000), lang()].join('|');
    if (tira.dataset.clave === clave) return; tira.dataset.clave = clave; tira.textContent = '';
    const medidas = L.filter(([k]) => S.l[k].e === 'medido').length, no = L.filter(([k]) => S.l[k].e === 'no_medido').length;
    if (!S.fin && !S.rev.fin) {
      const n = S.rev.hechas.length, barra = h('span', { class: 'barra' }, h('i'));
      barra.firstChild.style.width = (100 * n / SECS.length).toFixed(1) + '%';
      tira.append(h('i', { class: 'esc-vivo', 'aria-hidden': 'true' }), h('b', null, 'La revisión de Windows sigue en curso'), barra, dato(n + ' / ' + SECS.length, 'mono'), h('span', null, 'Secciones hechas'), dato(reloj(Date.now() - S.t0), 'mono'));
    } else if (!S.fin) {
      tira.append(h('i', { class: 'esc-vivo', 'aria-hidden': 'true' }), h('b', null, 'Terminando las últimas lecturas'), dato(reloj(Date.now() - S.t0), 'mono'));
    } else {
      tira.append(h('i', { class: 'esc-vivo quieto', 'aria-hidden': 'true' }), h('b', null, 'Escaneo terminado'), h('span', null, 'Duración'), dato(segundos(S.tFin - S.t0), 'mono'),
        h('span', null, 'Medidas'), dato(String(medidas), 'mono'), h('span', null, 'No medidas'), dato(String(no), 'mono'));
    }
  }

  // ---------- el reloj de la página mientras escanea ----------
  let relojPag = 0;
  function arrancaReloj() { paraReloj(); relojPag = setInterval(() => { if (abierto) pintaAvanceLuego(); }, 1000); }
  function paraReloj() { clearInterval(relojPag); relojPag = 0; }

  // ---------- la red de NÚCLEO: late con cada respuesta y cada paso reales ----------
  let ultimoLatido = 0;
  function late(fuerte) { if (fuerte || Date.now() - ultimoLatido > 380) { ultimoLatido = Date.now(); hablaRed(); } }
  function hablaRed() { if (red && abierto) try { red.habla(); } catch (_) {} }
  function colocaRed() {
    const caja = !portada.hidden ? portada : cabeza.querySelector('.esc-red-caja');
    if (!caja) return;
    if (caja === portada) { if (lienzo.parentNode !== portada) portada.prepend(lienzo); }
    else if (lienzo.parentNode !== caja) caja.append(lienzo);
    if (abierto && !red && window.RedNucleo) { try { red = window.RedNucleo(lienzo, { nace: !reducido() }); } catch (_) { red = null; } }
  }
  function paraRed() { if (red) { try { red.para(); } catch (_) {} red = null; } }

  // ---------- el informe ----------
  const NIVEL = { alerta: 4, aviso: 3, info: 2, nd: 2, ok: 1 };
  const CHIP = { alerta: 'Para arreglar', aviso: 'Para revisar', info: 'Para saber', ok: 'Correcto', nd: 'Sin dato', curso: 'En curso', nomedido: 'No medido', esperando: 'Esperando', medido: 'Medido', parcial: 'Parcial' };
  // which section shows each check of the revision: by its id, or else by its group (so new checks appear by themselves)
  const SEC_DE_CHECK = { defender_nube: 'antivirus', camara: 'sensores', microfono: 'sensores', ubicacion: 'sensores', pantalla: 'sensores', fabricante: 'fabrica', aprovisionados: 'fabrica', telemetria: 'telemetria', diagtrack: 'telemetria', publicidad: 'telemetria', certificados: 'certificados', recall: 'ia', usb: 'equipo', bluetooth: 'equipo', bios: 'equipo' };
  const SEC_DE_GRUPO = { proteccion: 'proteccion', acceso: 'acceso', arranque: 'arranque', salida: 'salida', privacidad: 'telemetria', antivirus: 'defender' };
  const FUENTE_N = { revision: 'Revisión de Windows', vigilancia: 'Vigilancia continua', vigia: 'Vigía de las llamadas', pd: 'Conexiones de las últimas 24 horas', antivirus: 'Actividad del antivirus', detectar: 'Antivirus registrados en Windows', identificacion: 'Identificación de destinos', ia: 'Servicios de IA', qv: 'Quién vende tus datos', estado: 'Estado del programa' };
  const FUENTES = { estado: ['revision', 'vigilancia', 'vigia', 'pd', 'antivirus', 'identificacion'], proteccion: ['revision', 'detectar', 'vigilancia', 'vigia'], antivirus: ['antivirus', 'pd', 'revision', 'detectar', 'qv'], sensores: ['vigia', 'vigilancia', 'revision'], acceso: ['vigia', 'revision'], arranque: ['revision', 'vigilancia'], fabrica: ['revision', 'qv'], telemetria: ['revision', 'vigilancia', 'pd', 'qv'], salida: ['revision', 'pd', 'estado'], certificados: ['revision'], ia: ['ia', 'qv', 'revision'], extensiones: ['qv'], identidad: ['identificacion', 'pd'], defender: ['revision', 'vigia'], equipo: ['revision', 'estado'], limites: ['estado'] };
  // the state of a source: medido | no_medido | esperando
  function fuente(k) {
    if (!S) return 'esperando';
    if (k === 'revision') return S.rev.e === 'medido' ? 'medido' : S.rev.e === 'no_medido' ? 'no_medido' : 'esperando';
    if (k === 'vigilancia') { if (S.l.vigilancia.e === 'medido' || S.l.resumen.e === 'medido') return 'medido'; return S.l.vigilancia.e === 'no_medido' ? 'no_medido' : 'esperando'; }
    if (k === 'pd') { if (S.l.pd2.e === 'medido' || S.l.pd1.e === 'medido') return 'medido'; return S.l.pd1.e === 'no_medido' && S.l.pd2.e === 'no_medido' ? 'no_medido' : 'esperando'; }
    const e = S.l[k] && S.l[k].e; return e === 'medido' ? 'medido' : e === 'no_medido' ? 'no_medido' : 'esperando';
  }
  const leyKey = (k) => (k === 'vigilancia' ? (S.l.resumen.e === 'no_medido' ? 'resumen' : 'vigilancia') : k === 'pd' ? (S.l.pd2.e === 'no_medido' && S.l.pd1.e === 'no_medido' ? 'pd1' : 'pd2') : k);
  const pd = () => { const p = S && (S.d.pd2 || S.d.pd1); return p && typeof p === 'object' && Array.isArray(p.destinos) ? p : null; };
  function checksDe(sec) {
    const j = S && S.d.revision; if (!j || !Array.isArray(j.grupos)) return [];
    const out = [];
    for (const g of j.grupos) {
      if (!g || !Array.isArray(g.checks)) continue;
      for (const c of g.checks) {
        if (!c || typeof c.id !== 'string') continue;
        if ((SEC_DE_CHECK[c.id] || SEC_DE_GRUPO[g.id] || 'equipo') === sec) out.push(c);
      }
    }
    return out.map((c, i) => [c, i]).sort((a, b) => (NIVEL[b[0].estado] || 0) - (NIVEL[a[0].estado] || 0) || a[1] - b[1]).map((x) => x[0]);
  }
  const nivelDe = (e) => (NIVEL[e] ? e : 'info');
  const peor = (cs) => cs.reduce((a, c) => { const e = c.estado === 'nd' ? 'info' : nivelDe(c.estado); return (NIVEL[e] || 0) > (NIVEL[a] || 0) ? e : a; }, null);
  const chip = (nivel, txt) => h('span', { class: 'esc-chip ' + nivel }, txt || CHIP[nivel] || CHIP.medido);
  const bloque = (titulo, ...hijos) => { const hs = hijos.flat(3).filter(Boolean); return hs.length ? h('div', { class: 'esc-bloque' }, titulo ? h('h3', null, titulo) : null, hs) : null; };
  function cifras(items) {
    const xs = items.filter(Boolean); if (!xs.length) return null;
    return h('div', { class: 'esc-cifras' }, xs.map((x) => h('div', { class: 'esc-cifra' + (x.n ? ' ' + x.n : '') }, dato(x.v, null, 'b'), x.lp ? panel(x.lp) : h('span', null, x.l), x.s ? h('small', null, x.s) : null)));
  }
  const FUERTES = new Set(['nuevo', 'sin_firma', 'firma_mala', 'no_existe', 'sin_clave', 'invitado', 'delicado', 'redirigido', 'apagado', 'sin_actualizar', 'en_uso', 'detectada', 'actuo']);
  const marcaChip = (m) => panel(tp('rv_marca_' + m) || humano(m), 'esc-marca' + (FUERTES.has(m) ? ' fuerte' : ''));
  const HUELLA = /^[0-9A-F]{32,64}$/i;
  function filaItem(it) {
    if (!it || typeof it !== 'object') return null;
    const t = limpia(it.t, 140) || '—';
    const d0 = typeof it.d === 'string' && HUELLA.test(it.d.trim()) ? null : limpia(it.d, 200);
    const huella = typeof it.d === 'string' && HUELLA.test(it.d.trim()) ? it.d.trim().toUpperCase() : '';
    const d = d0 && d0 !== t ? d0 : '';
    const marcas = lista(it.marcas).filter((m) => typeof m === 'string' && /^[a-z0-9_]{1,40}$/.test(m)).slice(0, 6);
    return h('li', null, dato(t, null, 'b'), marcas.map(marcaChip), esHora(it.cuando) ? h('time', { translate: 'no', datetime: iso(it.cuando) }, fecha(it.cuando)) : null,
      d ? dato(d, null, 'small') : null, huella ? dato(huella.slice(0, 8) + '…' + huella.slice(-4), 'esc-huella', 'small') : null);
  }
  // a long list: the first ones, the rest folded
  function largo(filas, cls, n) {
    const xs = filas.filter(Boolean); if (!xs.length) return null;
    const max = n || 6, ul = h('ul', { class: 'esc-lista' + (cls ? ' ' + cls : '') }, xs.slice(0, max));
    if (xs.length <= max) return ul;
    const det = h('details', { class: 'esc-mas' }, h('summary', null, h('span', null, 'Ver los demás'), dato(' (' + (xs.length - max) + ')')), h('ul', { class: 'esc-lista' }, xs.slice(max)));
    return [ul, det];
  }
  function tarjetaCheck(c) {
    const est = NIVEL[c.estado] ? c.estado : 'info';
    const titulo = tp('rv_t_' + c.id) || humano(c.id);
    const base = typeof c.frase === 'string' ? tp(c.frase) : null;
    const f = base ? rellena(base, c.datos) : est === 'nd' ? tp('rv_nd') : null;
    return h('article', { class: 'esc-ch n-' + est }, h('i', { class: 'esc-punto', 'aria-hidden': 'true' }),
      h('div', { class: 'esc-ch-cab' }, panel(titulo, 'esc-ch-t', 'h4'), chip(est)),
      f ? panel(f, 'esc-ch-f', 'p') : null,
      largo(lista(c.lista).map(filaItem)));
  }
  const tarjetas = (cs) => (cs && cs.length ? h('div', { class: 'esc-checks' }, cs.map(tarjetaCheck)) : null);
  function cuentas(cs) {
    const n = { alerta: 0, aviso: 0, ok: 0, info: 0 };
    for (const c of cs) n[c.estado === 'nd' ? 'info' : nivelDe(c.estado)]++;
    const xs = ['alerta', 'aviso', 'ok', 'info'].filter((k) => n[k]);
    return xs.length ? h('div', { class: 'esc-mini' }, xs.map((k) => h('span', { class: 'esc-marca' + (k === 'alerta' ? ' rojo' : k === 'aviso' ? ' fuerte' : k === 'ok' ? ' verde' : '') }, dato(String(n[k]) + ' · '), h('span', null, CHIP[k])))) : null;
  }
  // the verdict of a set of checks: the worst one, in the panel's words; or what the whole says
  function verChecks(cs) {
    if (!cs.length) return { nivel: 'info', ver: ['Windows no devolvió comprobaciones para este apartado.'] };
    const p = peor(cs);
    if (p === 'alerta' || p === 'aviso') {
      const c = cs.find((x) => nivelDe(x.estado) === p) || cs[0];
      const t = tp('rv_t_' + c.id) || humano(c.id), base = typeof c.frase === 'string' ? tp(c.frase) : null;
      return { nivel: p, ver: [panel(base ? t + ': ' + rellena(base, c.datos) : t), cuentas(cs)] };
    }
    return { nivel: p, ver: [p === 'ok' ? 'Las comprobaciones hechas en este apartado están correctas.' : 'Nada que arreglar ni revisar en este apartado; hay datos para saber.', cuentas(cs)] };
  }
  function noMedidoNodo(k, extra) {
    const st = S && S.l[k]; if (!st) return null;
    const m = st.motivo || 'error';
    const det = [];
    if (m === 'tiempo' && st.maximo) det.push(dato(' · ' + segundos(st.maximo)));
    if ((m === 'error' || m === 'sesion' || m === 'plan') && st.estado) det.push(dato(' · HTTP ' + st.estado));
    if (st.detalle) det.push(dato(' · ' + st.detalle));
    return h('div', { class: 'esc-nm' }, h('b', null, st.e === 'omitido' ? 'Omitida' : 'No medido'), h('span', { class: 'q' }, LD[k].n), h('span', null, h('span', null, MOTIVO[m] || MOTIVO.error), det),
      m === 'tiempo' && NUEVAS.has(k) ? h('small', null, 'Puede que la versión instalada del programa aún no ofrezca esta lectura.') : null, extra || null);
  }
  const nmFuente = (k) => (fuente(k) === 'no_medido' ? noMedidoNodo(leyKey(k)) : null);
  function revEnCurso() {
    const n = S.rev.hechas.length, barra = h('span', { class: 'barra' }, h('i'));
    barra.firstChild.style.width = (100 * n / SECS.length).toFixed(1) + '%';
    return h('div', { class: 'esc-nm' }, h('b', null, 'En curso'), h('span', null, 'Esta parte llegará cuando termine la revisión de Windows.'),
      h('div', { class: 'esc-mini', style: 'flex-basis:100%' }, barra, dato(n + ' / ' + SECS.length), h('span', null, 'Secciones hechas')));
  }
  // the revision's part of a section: its checks, or why not yet / not at all
  function parteRev(sec) {
    if (!S || S.rev.e === 'esperando') return { cs: null, nodo: revEnCurso() };
    if (S.rev.e === 'no_medido') return { cs: null, nodo: noMedidoNodo('revision') };
    const cs = checksDe(sec); return { cs, nodo: tarjetas(cs) };
  }
  const nivelRev = (pr, sinChecks) => (pr.cs ? (pr.cs.length ? peor(pr.cs) : sinChecks || 'info') : S.rev.e === 'no_medido' ? 'nomedido' : 'curso');
  const atribucion = () => {
    const f = S && S.d.estado && S.d.estado.fuente_red, web = httpsDe(f && f.web) || DBIP;
    return h('p', { class: 'esc-atrib', translate: 'no' }, enlace(web, 'IP Geolocation by DB-IP'));
  };
  const TIPO_VIGIA = { microfono: 'Micrófono', camara: 'Cámara', pantalla: 'Pantalla', escritorio_remoto: 'Escritorio remoto', control_remoto: 'Control remoto', grabador: 'Grabador de pantalla', antivirus: 'Antivirus', amenaza: 'Amenaza' };
  // what the call Watch sees now, of some kinds: {nivel, tipo, texto, desde}
  function vigiaDe(tipos) {
    const v = S && S.d.vigia; if (!v || typeof v !== 'object') return [];
    const out = [];
    for (const [nivel, xs] of [['alerta', v.alertas], ['aviso', v.avisos]]) for (const x of lista(xs)) {
      if (!x || typeof x !== 'object' || (tipos && !tipos.includes(x.tipo))) continue;
      const texto = limpia(x.texto, 260) || limpia(x.programa, 80); if (!texto) continue;
      out.push({ nivel, tipo: x.tipo, texto, desde: x.desde });
    }
    return out;
  }
  function usosAhora() {
    const xs = vigiaDe(['microfono', 'camara', 'pantalla']), dichos = new Set(xs.map((x) => x.tipo));
    const res = S && S.d.resumen && typeof S.d.resumen === 'object' ? S.d.resumen : null;
    for (const u of lista(res && res.en_uso)) {
      if (!u || typeof u !== 'object' || dichos.has(u.recurso)) continue;
      const que = tp('vg_rec_' + u.recurso) || humano(u.recurso);
      xs.push({ nivel: 'aviso', tipo: u.recurso, texto: limpia(u.programa, 80) + ' · ' + que, desde: u.desde });
    }
    return xs;
  }
  const filaAhora = (x) => h('div', { class: 'esc-ah ' + x.nivel }, h('b', null, TIPO_VIGIA[x.tipo] || 'Aviso'), panel(x.texto), esHora(x.desde) ? h('time', { translate: 'no', datetime: iso(x.desde) }, hhmm(x.desde)) : h('span'));
  const vg = (id) => { const v = S && S.d.vigilancia; return v && Array.isArray(v.vigilancias) ? v.vigilancias.find((w) => w && w.id === id) || null : null; };
  function cuandoCorto(ms) {
    if (!esHora(ms)) return '';
    const d = new Date(+ms), hoy = new Date(), ayer = new Date(Date.now() - 864e5), mismo = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (mismo(d, hoy) && tp('vg_hoy_a')) return tp('vg_hoy_a').replace('{h}', hhmm(ms));
    if (mismo(d, ayer) && tp('vg_ayer_a')) return tp('vg_ayer_a').replace('{h}', hhmm(ms));
    return fecha(ms);
  }
  // a finding of the monitoring's history, from its key and its data (never its stored text, which carries paths)
  function fraseSuceso(s) {
    const f = s && s.datos && typeof s.datos.frase === 'string' ? s.datos.frase : ''; const base = f && tp(f); if (!base) return null;
    const d = Object.assign({}, s.datos && s.datos.datos && typeof s.datos.datos === 'object' ? s.datos.datos : {});
    delete d.ruta;
    if (d.recurso) d.recurso = tp('vg_recurso_' + d.recurso) || d.recurso;
    if (d.ajuste) d.ajuste = tp('vg_aj_' + d.ajuste) || d.ajuste;
    d.cuenta = d.cuenta && !esSID(d.cuenta) ? (tp('vg_de_cuenta') || ' ({x})').replace('{x}', limpia(d.cuenta, 40)) : '';
    if ('antes' in d) d.antes = valorVg(d.antes);
    if ('despues' in d) d.despues = valorVg(d.despues);
    if ('activo' in d) d.activo = d.activo === 'true' ? tp('vg_pt_activo') || '' : tp('vg_pt_inactivo') || '';
    if (d.tipo) d.tipo = tp('vg_tipo_' + d.tipo) || d.tipo;
    if (f.startsWith('vg_ev_cortafuegos') && d.x) d.x = perfil(d.x);
    d.cuando = cuandoCorto(f.startsWith('vg_ev_uso') && d.desde ? Number(d.desde) : s.ts);
    return rellena(base, d);
  }
  function historial(tipo, max) {
    const v = S && S.d.vigilancia; if (!v) return null;
    const xs = lista(v.historial).filter((s) => s && s.tipo === tipo).slice(0, max || 6).map((s) => { const f = fraseSuceso(s); return f ? h('li', null, panel(f, null, 'b'), esHora(s.ts) ? h('time', { translate: 'no', datetime: iso(s.ts) }, fecha(s.ts)) : null) : null; }).filter(Boolean);
    return xs.length ? h('ul', { class: 'esc-lista plana' }, xs) : null;
  }

  // ---- 1 · Estado del equipo
  function secEstado() {
    const rv = S.d.revision, rs = rv && rv.resumen && typeof rv.resumen === 'object' ? rv.resumen : null;
    let nivel, ver;
    if (S.rev.e === 'medido' && rs) {
      const a = numero(rs.alerta) || 0, w = numero(rs.aviso) || 0;
      const clave = a ? 'rv_conclusion_alerta' : w ? 'rv_conclusion_aviso' : 'rv_conclusion_ok';
      nivel = a ? 'alerta' : w ? 'aviso' : numero(rs.info) ? 'info' : 'ok';
      const f = tp(clave);
      ver = [f ? panel(rellena(f, { alerta: a, aviso: w, ok: rs.ok || 0, info: rs.info || 0 })) : null,
        h('small', null, 'Veredicto sobre lo que Windows y el programa pudieron medir en este escaneo. Lo que no se midió figura en «Límites y cómo se midió».')];
    } else if (S.rev.e === 'no_medido') { nivel = 'nomedido'; ver = ['Sin veredicto: la revisión de Windows no se pudo completar.']; }
    else { nivel = 'curso'; ver = ['El veredicto llegará cuando termine la revisión de Windows.']; }
    // right now: the call Watch, the monitoring's attention and the uses it sees
    const usos = usosAhora();
    const ahora = [...usos, ...vigiaDe(['escritorio_remoto', 'control_remoto', 'grabador', 'antivirus', 'amenaza'])].map(filaAhora);
    const res = S.d.resumen && typeof S.d.resumen === 'object' ? S.d.resumen : null;
    for (const x of lista(res && res.atencion)) { const f = x && tp(x.frase); if (f) ahora.push(h('div', { class: 'esc-ah aviso' }, h('b', null, 'Vigilancia continua'), panel(f.replace('{x}', perfil(x.x))), h('span'))); }
    let bAhora = null;
    if (ahora.length) bAhora = bloque('Ahora mismo', h('div', { class: 'esc-ahora' }, ahora));
    else if (fuente('vigia') === 'medido') {
      const lim = S.d.vigia && limpia(S.d.vigia.limites, 600);
      bAhora = bloque('Ahora mismo', h('p', { class: 'esc-texto' }, 'El Vigía de las llamadas no ve ahora micrófono, cámara ni pantalla en uso, ni sesiones o programas de control remoto.'), lim ? panel(lim, 'esc-nota', 'p') : null);
    }
    // the figures, only those measured
    const xs = [];
    if (S.rev.e === 'medido' && rs) {
      xs.push({ v: num(rs.alerta || 0), l: 'Para arreglar', n: rs.alerta ? 'alerta' : '', s: 'Revisión de Windows' });
      xs.push({ v: num(rs.aviso || 0), l: 'Para revisar', n: rs.aviso ? 'aviso' : '', s: 'Revisión de Windows' });
      xs.push({ v: num(rs.ok || 0), l: 'Correcto', n: '', s: 'Revisión de Windows' });
      xs.push({ v: num(rs.info || 0), l: 'Para saber', s: 'Revisión de Windows' });
      if (numero(rs.nuevos)) xs.push({ v: num(rs.nuevos), l: 'Nuevos', s: 'Revisión de Windows' });
      const nd = lista(rv.grupos).reduce((a, g) => a + lista(g && g.checks).filter((c) => c && c.estado === 'nd').length, 0);
      if (nd) xs.push({ v: num(nd), l: 'Sin respuesta de Windows', s: 'Revisión de Windows' });
    }
    if (fuente('vigia') === 'medido' || (res && Array.isArray(res.en_uso))) xs.push({ v: num(usos.length), l: 'En uso ahora (cámara, micrófono, pantalla)', n: usos.length ? 'aviso' : '', s: fuente('vigia') === 'medido' ? 'Vigía de las llamadas' : 'Vigilancia continua' });
    const p = pd();
    if (p && p.mide_bytes !== false) {
      let total = 0, tel = 0; for (const d of p.destinos) { const e = numero(d && d.enviados) || 0; total += e; if (d && /^(telemetria|publicidad|rastreador)$/.test(d.categoria)) tel += e; }
      xs.push({ v: bytes(total), l: 'Enviado en 24 h', s: numero(p.destinos_omitidos) ? 'Suma parcial' : 'Conexiones de las últimas 24 horas' });
      xs.push({ v: bytes(tel), l: 'Telemetría, publicidad y rastreo (24 h)', n: tel ? 'aviso' : '', s: 'Conexiones de las últimas 24 horas' });
    }
    const av = S.d.antivirus; if (av && av.resumen && numero(av.resumen.subidos) != null) xs.push({ v: bytes(av.resumen.subidos), l: 'Enviado por tu antivirus (24 h)', s: 'Actividad del antivirus' });
    const idn = S.d.identificacion; if (idn && idn.cobertura && numero(idn.cobertura.pct_identificada) != null) xs.push({ v: num(idn.cobertura.pct_identificada) + ' %', l: 'Consultas con empresa identificada (7 días)', s: 'Identificación de destinos' });
    const nm = FUENTES.estado.filter((k) => fuente(k) === 'no_medido').map((k) => nmFuente(k));
    return { nivel, ver, cuerpo: [bAhora, cifras(xs), bloque(nm.length ? 'No medido' : null, nm)] };
  }
  // ---- 2 · Protección
  function secProteccion() {
    const pr = parteRev('proteccion');
    const det = S.d.detectar, detl = det ? lista(det.detectados).filter((x) => x && typeof x === 'object').map((x) => h('li', null, dato(limpia(x.nombre, 90), null, 'b'),
      panel(x.activo ? tp('av_activo') || '✓' : tp('av_inactivo') || '✗', 'esc-marca' + (x.activo ? ' verde' : ' fuerte')),
      panel(x.al_dia ? tp('av_al_dia') || '✓' : tp('av_desactualizado') || '✗', 'esc-marca' + (x.al_dia ? ' verde' : ' fuerte')),
      x.conocido === false && tp('av_no_en_lista') ? panel(tp('av_no_en_lista'), 'esc-marca') : null)) : [];
    let bDet = null;
    if (det) bDet = bloque('Antivirus registrados en Windows', detl.length ? h('ul', { class: 'esc-lista plana' }, detl) : panel(det.aviso === 'no_windows' ? tp('av_detectar_no_windows') || '' : tp('av_detectar_ninguno') || '', 'esc-texto', 'p'));
    else if (fuente('detectar') === 'no_medido') bDet = bloque('Antivirus registrados en Windows', noMedidoNodo('detectar'));
    const w = vg('proteccion');
    const bVg = w && lista(w.lista).length ? bloque('Centro de seguridad de Windows, visto por la vigilancia continua', h('ul', { class: 'esc-lista plana' }, lista(w.lista).filter((p) => p && typeof p === 'object').map((p) => {
      const nombre = p.clase === 'perfil' ? (tp('vg_pt_clase_perfil') || '{x}').replace('{x}', perfil(p.nombre)) : (tp('vg_pt_clase_' + p.clase) || '{x}').replace('{x}', limpia(p.nombre, 80));
      let est = p.activo ? tp('vg_pt_activo') : tp('vg_pt_inactivo');
      if ((p.clase === 'tiempo_real' || p.clase === 'manipulacion') && p.al_mando === false) est = tp('vg_pt_segundo_plano');
      return h('li', null, panel(nombre, null, 'b'), est ? panel(est, 'esc-marca' + (p.activo ? ' verde' : ' fuerte')) : null);
    }))) : null;
    const vivo = vigiaDe(['antivirus']).map(filaAhora);
    const v = verChecksSi(pr);
    return { nivel: v.nivel, ver: v.ver, cuerpo: [vivo.length ? bloque('Ahora mismo, según el Vigía de las llamadas', h('div', { class: 'esc-ahora' }, vivo)) : null, bDet, bloque('Comprobaciones de Windows', pr.nodo), bVg, bloque('Historial de la vigilancia', historial('proteccion'))] };
  }
  function verChecksSi(pr) {
    if (pr.cs) return verChecks(pr.cs);
    return { nivel: S.rev.e === 'no_medido' ? 'nomedido' : 'curso', ver: [S.rev.e === 'no_medido' ? 'La revisión de Windows no se pudo completar.' : 'La revisión de Windows sigue en curso.'] };
  }
  // ---- 3 · Tu antivirus por dentro y con quién habla
  function secAntivirus() {
    const av = S.d.antivirus, cuerpo = [];
    let nivel = 'info', ver;
    if (av && typeof av === 'object') {
      const r = av.resumen && typeof av.resumen === 'object' ? av.resumen : {};
      const nada = !numero(r.subidos) && !numero(r.bajados);
      const prods = lista(r.productos).map((x) => limpia(x, 60)).filter(Boolean);
      ver = [panel(nada ? tp('av_resumen_nada') || '' : (tp('av_resumen_productos') || '{p}').replace('{p}', prods.join(', ')))];
      if (!nada) cuerpo.push(bloque('En las últimas 24 horas', cifras([{ v: bytes(r.subidos), l: 'Datos enviados' }, { v: bytes(r.bajados), l: 'Datos recibidos' }, { v: num(r.destinos), l: 'Destinos' }, { v: num(r.paises), l: 'Países' }, { v: bytes(r.subidos_noche), l: 'Enviado de madrugada (00–06 h)', n: numero(r.subidos_noche) ? 'aviso' : '' }])));
      // each product on this computer (never the other devices of the house)
      const p = pd();
      for (const x of lista(av.vistos).filter((x) => x && x.device_id === 'self')) {
        const prod = limpia(x.producto, 80), traf = lista(av.trafico).find((t) => t && t.producto === x.producto);
        const progs = lista(x.programas).filter((g) => g && typeof g === 'object').map((g) => h('li', null, dato(limpia(g.nombre, 80), null, 'b'), g.firma ? dato(limpia(g.firma, 80), null, 'small') : null, h('span', { class: 'der' }, panel((tpn('av_consultas', g.consultas) || '{n}').replace('{n}', num(g.consultas))))));
        const dest = lista(x.destinos).filter((d) => d && typeof d === 'object').slice(0, 8).map((d) => {
          const uso = d.uso ? tp('av_uso_' + d.uso) : tp('av_no_documentado'), f = httpsDe(d.fuente);
          return h('li', null, dato(limpia(d.qname, 120, false), null, 'b'), uso ? panel(uso, 'esc-marca' + (d.uso ? '' : ' fuerte')) : null, h('span', { class: 'der' }, panel((tpn('av_consultas', d.consultas) || '{n}').replace('{n}', num(d.consultas)))), f ? h('small', null, enlace(f, 'Fuente')) : null);
        });
        const porPais = traf ? lista(traf.paises).filter((q) => q && typeof q === 'object').slice(0, 6).map((q) => h('li', null, String(q.pais).startsWith('@') ? h('b', null, q.pais === '@local' ? 'Red local' : 'Varios países (anycast)') : dato(paisNombre(q.pais) || '—', null, 'b'), h('span', { class: 'der' }, dato(bytes(q.subidos) + ' ↑  ' + bytes(q.bajados) + ' ↓')))) : [];
        const porDest = traf ? lista(traf.destinos).filter((q) => q && typeof q === 'object').slice(0, 6).map((q) => h('li', null, dato(limpia(q.destino, 120, false) || limpia(q.red, 80) || '—', null, 'b'), q.destino && q.red ? dato(limpia(q.red, 80), null, 'small') : null, h('span', { class: 'der' }, dato(bytes(q.subidos) + ' ↑')))) : [];
        // inside the computer: processor, memory and disk, from the second take (the rates need two)
        const prog = p ? lista(p.programas).find((g) => g && g.tipo === 'antivirus' && (g.id === x.producto || lista(g.procesos).some((n) => lista(x.programas).some((q) => q && q.nombre === n)))) : null;
        const ac = prog && prog.actividad && typeof prog.actividad === 'object' ? prog.actividad : null;
        const dentro = ac ? cifras([numero(ac.cpu) != null ? { v: ac.cpu.toLocaleString(loc(), { maximumFractionDigits: 1 }) + ' %', l: 'Procesador' } : null, { v: bytes(ac.memoria), l: 'Memoria' },
          numero(ac.lee) != null ? { v: bytes(ac.lee) + '/s', l: 'Lectura de disco' } : null, numero(ac.escribe) != null ? { v: bytes(ac.escribe) + '/s', l: 'Escritura de disco' } : null]) : null;
        cuerpo.push(h('div', { class: 'esc-producto' }, h('h4', null, dato(prod), x.empresa ? dato(limpia(x.empresa, 80) + (paisNombre(x.pais) ? ' · ' + paisNombre(x.pais) : ''), null, 'small') : null),
          cifras([{ v: num(x.consultas), l: 'Consultas' }, { v: num(x.documentados), l: 'Nombres con uso publicado' }, { v: num(x.no_documentados), l: 'Sin uso publicado', n: numero(x.no_documentados) ? 'aviso' : '' }, { v: num(x.nocturnas), l: 'De madrugada (00–06 h)' }]),
          bloque('Programas', h('ul', { class: 'esc-lista plana' }, progs)),
          bloque('Nombres que pidió', dest.length ? h('ul', { class: 'esc-lista plana' }, dest) : null),
          porPais.length || porDest.length ? h('div', { class: 'esc-dos' }, h('div', null, h('h5', null, panel(tp('av_por_pais') || '')), h('ul', { class: 'esc-lista plana' }, porPais)), h('div', null, h('h5', null, panel(tp('av_por_destino') || '')), h('ul', { class: 'esc-lista plana' }, porDest))) : null,
          dentro ? bloque('Dentro del equipo', dentro) : null));
      }
      // official sanctions of the products installed here (the catalogue the panel keeps, with its sources)
      const inst = new Set([...lista(av.vistos).filter((x) => x && x.device_id === 'self').map((x) => String(x.producto).toLowerCase()), ...lista(S.d.detectar && S.d.detectar.detectados).map((d) => String(d && d.nombre).toLowerCase())]);
      const sanc = [];
      for (const f of lista(av.catalogo)) {
        if (!f || !lista(f.sanciones).length) continue;
        const nom = String(f.producto || '').toLowerCase(); if (![...inst].some((i) => i && nom && (i.includes(nom) || nom.includes(i)))) continue;
        for (const s of lista(f.sanciones)) {
          if (!s || typeof s !== 'object') continue; const fu = httpsDe(s.fuente), fr = tp('av_sancion_' + s.clave);
          sanc.push(h('li', null, dato(limpia(f.producto, 60), null, 'b'), panel(tp('av_tipo_' + s.tipo) || humano(s.tipo), 'esc-marca fuerte'), h('span', { class: 'der' }, dato(limpia(s.autoridad, 80) + ' · ' + limpia(s.fecha, 12) + (s.importe ? ' · ' + limpia(s.importe, 40) : ''))), fr ? panel(fr, null, 'small') : null, fu ? h('small', null, enlace(fu, 'Fuente')) : null));
        }
      }
      if (sanc.length) cuerpo.push(bloque('Sanciones oficiales', h('ul', { class: 'esc-lista plana' }, sanc)));
    } else { nivel = fuente('antivirus') === 'no_medido' ? 'nomedido' : 'esperando'; ver = [nivel === 'nomedido' ? 'No se pudo medir lo que hace tu antivirus.' : 'Esperando la lectura…']; cuerpo.push(nmFuente('antivirus')); }
    const casos = lista(S.d.qv && S.d.qv.antivirus).filter((a) => a && a.caso && tp('qv_caso_' + a.caso)).map((a) => h('li', null, dato(limpia(a.nombre, 80), null, 'b'), panel(tp('qv_caso_' + a.caso), null, 'small')));
    if (casos.length) cuerpo.push(bloque('Casos documentados', h('ul', { class: 'esc-lista plana' }, casos)));
    const pr = parteRev('antivirus');
    cuerpo.push(bloque('Lo que Microsoft Defender envía a la nube', pr.cs ? tarjetas(pr.cs) || h('p', { class: 'esc-texto' }, 'Windows no lo dijo en esta revisión.') : pr.nodo));
    if (av) cuerpo.push(atribucion());
    return { nivel: av ? 'medido' : nivel, chip: av ? 'Medido' : null, ver, cuerpo };
  }
  // ---- 4 · Cámara, micrófono, pantalla y ubicación
  function secSensores() {
    const res = S.d.resumen, filas = usosAhora().map(filaAhora);
    const mideVigia = fuente('vigia') === 'medido', mideRes = !!res;
    let nivel, ver;
    if (filas.length) { nivel = 'aviso'; ver = ['Hay programas usando ahora la cámara, el micrófono o la pantalla.']; }
    else if (mideVigia) { nivel = 'ok'; ver = ['Ningún programa usa ahora la cámara, el micrófono ni la pantalla, según lo que Windows anota.']; }
    else if (mideRes) { nivel = 'ok'; ver = ['Ningún programa usa ahora la cámara ni el micrófono, según lo que Windows anota.', h('small', null, 'La pantalla en este momento no se pudo medir.')]; }
    else if (fuente('vigia') === 'no_medido' && fuente('vigilancia') === 'no_medido') { nivel = 'nomedido'; ver = ['No se pudo medir quién usa ahora la cámara, el micrófono o la pantalla.']; }
    else { nivel = 'esperando'; ver = ['Esperando la lectura…']; }
    const pr = parteRev('sensores');
    const w = vg('camara_microfono');
    const usos = w ? lista(w.lista).filter((u) => u && typeof u === 'object').map((u) => {
      const quien = u.propio ? tp('vg_cm_propio') || 'GUARDIANA' : limpia(u.programa, 80) + (u.motor_web && tp('vg_cm_motor_web') ? ' (' + tp('vg_cm_motor_web') + ')' : '');
      const que = tp('vg_rec_' + u.recurso) || humano(u.recurso);
      const cuando = u.ahora ? (tp('vg_cm_ahora_desde') || '{h}').replace('{h}', hhmm(u.desde)) : (tp('vg_cm_de_a') || '{a} – {b}').replace('{a}', cuandoCorto(u.desde)).replace('{b}', hhmm(u.hasta));
      return h('li', null, panel(quien + ' · ' + que, null, 'b'), h('span', { class: 'der' }, panel(cuando)));
    }) : [];
    const limites = [tp('vg_cm_limite') ? panel(tp('vg_cm_limite'), 'esc-nota', 'p') : null, S.d.vigia && limpia(S.d.vigia.limites, 600) ? panel(limpia(S.d.vigia.limites, 600), 'esc-nota', 'p') : null];
    return { nivel, chip: nivel === 'aviso' ? 'En uso ahora' : nivel === 'ok' ? 'Nada en uso ahora' : null, ver,
      cuerpo: [filas.length ? bloque('Ahora mismo', h('div', { class: 'esc-ahora' }, filas)) : null,
        fuente('vigia') === 'no_medido' ? bloque(null, noMedidoNodo('vigia')) : null,
        bloque('Última vez por programa', pr.nodo),
        usos.length ? bloque('Usos de las últimas 24 horas, según la vigilancia continua', h('ul', { class: 'esc-lista plana' }, usos)) : null,
        bloque('Historial de la vigilancia', historial('camara_microfono')),
        fuente('vigilancia') === 'no_medido' ? bloque(null, nmFuente('vigilancia')) : null,
        bloque('Límites', limites)] };
  }
  // ---- 5 · Control remoto, cuentas y quién administra el equipo
  function secAcceso() {
    const vivo = vigiaDe(['escritorio_remoto', 'control_remoto', 'grabador']);
    const pr = parteRev('acceso'), v = verChecksSi(pr);
    let bVivo;
    if (vivo.length) bVivo = bloque('Ahora mismo, según el Vigía de las llamadas', h('div', { class: 'esc-ahora' }, vivo.map(filaAhora)));
    else if (fuente('vigia') === 'medido') bVivo = bloque('Ahora mismo, según el Vigía de las llamadas', h('p', { class: 'esc-texto' }, 'Nada en marcha ahora: ni sesión de escritorio remoto, ni programas de control remoto, ni grabadores de pantalla.'));
    else if (fuente('vigia') === 'no_medido') bVivo = bloque('Ahora mismo, según el Vigía de las llamadas', noMedidoNodo('vigia'));
    let nivel = v.nivel;
    if (vivo.some((x) => x.nivel === 'alerta') && (NIVEL[nivel] || 0) < NIVEL.aviso) nivel = 'aviso';
    return { nivel, ver: v.ver, cuerpo: [bVivo, bloque('Comprobaciones de Windows', pr.nodo)] };
  }
  // ---- 6 · Lo que arranca solo
  function secArranque() {
    const pr = parteRev('arranque'), v = verChecksSi(pr), w = vg('arranque');
    const fr = w && typeof w.frase === 'string' && tp(w.frase) ? rellena(tp(w.frase), w.datos) : null;
    const nuevos = w ? lista(w.lista).filter((a) => a && typeof a === 'object').map((a) => h('li', null, dato(limpia(a.titulo, 100), null, 'b'), panel(tp('vg_tipo_' + a.tipo) || humano(a.tipo), 'esc-marca'),
      a.presente === false && tp('vg_marca_ido') ? panel(tp('vg_marca_ido'), 'esc-marca fuerte') : null, a.sistema && tp('vg_marca_sistema') ? panel(tp('vg_marca_sistema'), 'esc-marca') : null,
      esHora(a.visto) ? h('time', { translate: 'no' }, fecha(a.visto)) : null)) : [];
    return { nivel: v.nivel, ver: v.ver, cuerpo: [bloque('Comprobaciones de Windows', pr.nodo),
      bloque('Lo nuevo según la vigilancia continua (7 días)', fr ? panel(fr, 'esc-texto', 'p') : null, nuevos.length ? largo(nuevos, 'plana', 8) : null, fuente('vigilancia') === 'no_medido' ? nmFuente('vigilancia') : null),
      bloque('Historial de la vigilancia', historial('arranque'))] };
  }
  // ---- 7 · Programas de fábrica y preinstalados
  function secFabrica() {
    const pr = parteRev('fabrica'), v = verChecksSi(pr), qv = S.d.qv;
    const fab = qv ? lista(qv.fabricante).filter((f) => f && typeof f === 'object').map((f) => h('li', null, dato(limpia(f.programa, 80), null, 'b'), f.marca ? dato(limpia(f.marca, 40), 'esc-marca') : null,
      h('span', { class: 'der' }, panel((tpn('qv_consultas', f.consultas) || '{n}').replace('{n}', num(f.consultas)))),
      f.firmante ? panel((tp('qv_firmado_por') || '{f}').replace('{f}', limpia(f.firmante, 80)), null, 'small') : null,
      lista(f.destinos).length ? panel((tp('qv_fab_habla') || '') + ' ' + lista(f.destinos).filter(Array.isArray).slice(0, 8).map((x) => limpia(x[0], 60) + ' (' + num(x[1]) + ')').join(', '), null, 'small') : null)) : [];
    let bFab = null;
    if (qv) bFab = bloque('Programas del fabricante que se conectaron (7 días)', fab.length ? h('ul', { class: 'esc-lista plana' }, fab) : panel(qv.sistema && qv.sistema !== 'windows' ? tp('qv_fab_no_windows') || '' : tp('qv_fab_vacio') || '', 'esc-texto', 'p'));
    else if (fuente('qv') === 'no_medido') bFab = bloque('Programas del fabricante que se conectaron (7 días)', noMedidoNodo('qv'));
    return { nivel: v.nivel, ver: v.ver, cuerpo: [bloque('Comprobaciones de Windows', pr.nodo), bFab] };
  }
  // ---- 8 · Telemetría y datos que salen
  const CATS = ['telemetria', 'publicidad', 'rastreador'];
  function secTelemetria() {
    const pr = parteRev('telemetria'), cuerpo = [], p = pd();
    let nivel = nivelRev(pr), ver;
    if (p && p.mide_bytes !== false) {
      const suma = { total: 0, telemetria: 0, publicidad: 0, rastreador: 0 };
      for (const d of p.destinos) { if (!d) continue; const e = numero(d.enviados) || 0; suma.total += e; if (CATS.includes(d.categoria)) suma[d.categoria] += e; }
      ver = [h('span', null, 'Lo que este equipo envió en las últimas 24 horas, por categoría.')];
      // the categories' names are the panel's, in its language
      cuerpo.push(cifras([{ v: bytes(suma.total), l: 'Total enviado', s: numero(p.destinos_omitidos) ? 'Suma parcial' : null },
        ...CATS.map((c) => ({ v: bytes(suma[c]), lp: tp('rg_cat_' + c), l: humano(c), n: suma[c] ? 'aviso' : '' }))]));
      if (numero(p.destinos_omitidos)) cuerpo.push(h('p', { class: 'esc-nota' }, 'Suma parcial: el programa atribuyó solo los destinos principales.'));
      const filas = p.destinos.filter((d) => d && CATS.includes(d.categoria)).sort((a, b) => (numero(b.enviados) || 0) - (numero(a.enviados) || 0)).slice(0, 14).map((d) => h('tr', null,
        h('td', null, dato(limpia(d.destino, 120, false) || '—', null, 'b'), dato(limpia(d.programa, 60), null, 'small')),
        h('td', null, panel(tp('rg_cat_' + d.categoria) || humano(d.categoria), 'esc-marca' + (d.categoria === 'publicidad' || d.categoria === 'rastreador' ? ' fuerte' : '')), (numero(d.paradas) || d.regla != null) ? h('span', { class: 'esc-marca rojo' }, 'Cortado') : null),
        h('td', null, dato(limpia(d.empresa, 60) || limpia(d.red, 60) || '—'), dato(paisNombre(d.pais), null, 'small')),
        h('td', { class: 'num' }, dato(bytes(d.enviados))), h('td', { class: 'num' }, dato(num(d.consultas)))));
      if (filas.length) cuerpo.push(bloque('Destinos de telemetría, publicidad y rastreo', h('div', { class: 'esc-tabla-caja' }, h('table', { class: 'esc-tabla' },
        h('thead', null, h('tr', null, h('th', null, 'Destino'), h('th', null, 'Categoría'), h('th', null, 'Empresa'), h('th', { class: 'num' }, 'Enviado'), h('th', { class: 'num' }, 'Consultas'))), h('tbody', null, filas)))));
      cuerpo.push(h('p', { class: 'esc-nota' }, 'Un servicio que corre dentro de svchost.exe aparece con ese nombre: Windows no dice cuál de sus servicios fue.'), atribucion());
    } else if (p && p.mide_bytes === false) { cuerpo.push(panel(tp('pd_sin_bytes') || '', 'esc-texto', 'p')); }
    else if (fuente('pd') === 'no_medido') cuerpo.push(bloque(null, nmFuente('pd')));
    if (!ver) { const v = verChecksSi(pr); nivel = v.nivel; ver = v.ver; }
    cuerpo.unshift(bloque('Comprobaciones de Windows', pr.nodo));
    // the system's advertising and diagnostics settings, as GUARDIANA reads them
    const qv = S.d.qv;
    if (qv && lista(qv.ajustes).length) cuerpo.push(bloque('Ajustes de publicidad y diagnóstico', h('ul', { class: 'esc-lista plana' }, lista(qv.ajustes).filter((a) => a && typeof a === 'object').map((a) => h('li', null,
      panel(tp('qv_aj_' + a.clave) || humano(a.clave), null, 'b'), panel(a.activo === true ? tp('qv_aj_activado') || '' : a.activo === false ? tp('qv_aj_desactivado') || '' : tp('qv_aj_desconocido') || '', 'esc-marca' + (a.activo === true ? ' fuerte' : a.activo === false ? ' verde' : '')),
      a.por_politica && tp('qv_aj_politica') ? panel(tp('qv_aj_politica'), 'esc-marca') : null, tp('qv_aj_' + a.clave + '_que') ? panel(tp('qv_aj_' + a.clave + '_que'), null, 'small') : null)))));
    const w = vg('privacidad');
    if (w && lista(w.lista).length) cuerpo.push(bloque('Valores anotados por la vigilancia continua', h('ul', { class: 'esc-lista plana' }, lista(w.lista).filter((x) => x && typeof x === 'object').map((x) => h('li', null,
      panel((tp('vg_aj_' + x.ajuste) || humano(x.ajuste)) + (x.cuenta && !esSID(x.cuenta) ? (tp('vg_de_cuenta') || ' ({x})').replace('{x}', limpia(x.cuenta, 40)) : ''), null, 'b'), h('span', { class: 'der' }, panel(valorVg(x.valor))))))));
    if (qv) {
      const progs = lista(qv.programas).filter((g) => g && typeof g === 'object').map((g) => h('li', null, dato(limpia(g.programa, 80) || '—', null, 'b'), g.firmante ? dato(limpia(g.firmante, 80), null, 'small') : null,
        lista(g.empresas).filter((e) => e && typeof e === 'object').map((e) => h('small', null, dato(limpia(e.empresa, 80)), ' ', e.origen === 'registro' && tp('qv_registro_ca') ? panel(tp('qv_registro_ca'), 'esc-marca fuerte') : e.caso && tp('qv_caso_' + e.caso) ? panel(tp('qv_caso_' + e.caso)) : null, ' ', dato(lista(e.dominios).filter((x) => x && x.dominio).map((x) => limpia(x.dominio, 80, false)).join(', '))))));
      cuerpo.push(bloque(null, h('h3', null, panel(tp('qv_prog_titulo') || '')), progs.length ? h('ul', { class: 'esc-lista plana' }, progs) : panel(tp('qv_prog_vacio') || '', 'esc-texto', 'p')));
    } else if (fuente('qv') === 'no_medido') cuerpo.push(bloque(null, noMedidoNodo('qv')));
    if (fuente('vigilancia') === 'no_medido') cuerpo.push(bloque(null, nmFuente('vigilancia')));
    return { nivel, ver, cuerpo };
  }
  // ---- 9 · Por dónde sale tu internet
  function secSalida() {
    const pr = parteRev('salida'), v = verChecksSi(pr), cuerpo = [bloque('Comprobaciones de Windows', pr.nodo)];
    const est = S.d.estado, p = pd();
    const filas = [];
    if (est && typeof est.dns_aplicado === 'boolean') filas.push(h('li', null, h('b', null, 'Filtro DNS de GUARDIANA'), h('span', { class: 'esc-marca' + (est.dns_aplicado ? ' verde' : ' fuerte') }, est.dns_aplicado ? 'Puesto' : 'No puesto')));
    if (p && Array.isArray(p.vpn)) filas.push(h('li', null, h('b', null, 'VPN activas ahora'), p.vpn.length ? dato(p.vpn.map((x) => limpia(x, 60)).join(', '), 'esc-marca') : h('span', { class: 'esc-marca' }, 'Ninguna')));
    if (filas.length) cuerpo.push(bloque('Según el programa', h('ul', { class: 'esc-lista plana' }, filas)));
    if (fuente('estado') === 'no_medido') cuerpo.push(bloque(null, noMedidoNodo('estado')));
    return { nivel: v.nivel, ver: v.ver, cuerpo };
  }
  // ---- 10 · Certificados raíz
  function secCertificados() { const pr = parteRev('certificados'), v = verChecksSi(pr); return { nivel: v.nivel, ver: v.ver, cuerpo: [bloque(null, pr.nodo)] }; }
  // ---- 11 · IA en este equipo
  function secIA() {
    const ia = S.d.ia, qv = S.d.qv, cuerpo = [];
    let nivel = 'info', ver;
    if (ia && typeof ia === 'object') {
      const sv = lista(ia.servicios).filter((s) => s && s.device_id === 'self');
      const total = sv.reduce((a, s) => a + (numero(s.consultas) || 0), 0);
      ver = [sv.length ? 'Este equipo habló con servicios de IA en los últimos 7 días.' : 'Este equipo no habló con ningún servicio de IA de la lista en los últimos 7 días.'];
      cuerpo.push(cifras([{ v: num(sv.length), l: 'Servicios de IA con los que habló este equipo' }, { v: num(total), l: 'Consultas (7 días)' }]));
      if (sv.length) cuerpo.push(bloque('Servicios de IA (7 días)', h('div', { class: 'esc-tabla-caja' }, h('table', { class: 'esc-tabla' },
        h('thead', null, h('tr', null, h('th', null, 'Servicio'), h('th', null, 'Programas'), h('th', { class: 'num' }, 'Consultas'), h('th', { class: 'num' }, 'Última'))),
        h('tbody', null, sv.map((s) => h('tr', null, h('td', null, dato(limpia(s.servicio, 80), null, 'b'), tp('ia_col_nombres') ? panel(num(s.nombres) + ' ' + tp('ia_col_nombres'), null, 'small') : null),
          h('td', null, dato(lista(s.programas).filter(Array.isArray).map((x) => limpia(x[0], 60) + ' (' + num(x[1]) + ')').join(', ') || '—')),
          h('td', { class: 'num' }, dato(num(s.consultas))), h('td', { class: 'num' }, dato(fecha(s.ultima))))))))));
      if (tp('ia_limite')) cuerpo.push(panel(tp('ia_limite'), 'esc-nota', 'p'));
    } else { nivel = fuente('ia') === 'no_medido' ? 'nomedido' : 'esperando'; ver = [nivel === 'nomedido' ? 'No se pudo medir el uso de servicios de IA.' : 'Esperando la lectura…']; cuerpo.push(nmFuente('ia')); }
    // how to ask each service not to train with the chats, and the documented cases
    if (qv && lista(qv.ia).length) {
      const casos = new Map(lista(qv.casos).filter((c) => c && c.id).map((c) => [c.id, c]));
      cuerpo.push(bloque('Cómo pedir que no entrenen con tus chats', h('ul', { class: 'esc-lista plana' }, lista(qv.ia).filter((s) => s && typeof s === 'object').map((s) => {
        const c = s.caso && casos.get(s.caso), fu = c && httpsDe(c.url);
        return h('li', null, dato(limpia(s.servicio, 80), null, 'b'), panel(tp(s.guia ? 'qv_ia_guia_' + s.guia : 'qv_ia_guia_otra') || tp('qv_ia_guia_otra') || '', null, 'small'),
          s.caso && tp('qv_caso_' + s.caso) ? panel(tp('qv_caso_' + s.caso), null, 'small') : null, fu ? h('small', null, enlace(fu, 'Fuente')) : null);
      }))));
    }
    const pr = parteRev('ia');
    cuerpo.push(bloque('Recall', pr.cs ? tarjetas(pr.cs) || h('p', { class: 'esc-texto' }, 'Windows no lo dijo en esta revisión.') : pr.nodo));
    return { nivel, chip: ia ? 'Medido' : null, ver, cuerpo };
  }
  // ---- 12 · Extensiones del navegador
  function secExtensiones() {
    const qv = S.d.qv;
    if (!qv || typeof qv !== 'object') { const nm = fuente('qv') === 'no_medido'; return { nivel: nm ? 'nomedido' : 'esperando', ver: [nm ? 'No se pudieron leer las extensiones.' : 'Esperando la lectura…'], cuerpo: [nmFuente('qv')] }; }
    const ext = lista(qv.extensiones).filter((e) => e && typeof e === 'object');
    const marcadas = ext.filter((e) => e.caso || e.todas_las_webs || e.chats_ia), otras = ext.filter((e) => !(e.caso || e.todas_las_webs || e.chats_ia));
    const casos = new Map(lista(qv.casos).filter((c) => c && c.id).map((c) => [c.id, c]));
    const fila = (e) => {
      const c = e.caso && casos.get(e.caso), fu = c && httpsDe(c.url), nav = limpia(e.navegador, 20);
      return h('li', null, dato(limpia(e.nombre, 90) || limpia(e.id, 40), null, 'b'), dato(nav + (e.version ? ' · ' + limpia(e.version, 30, false) : ''), 'esc-marca'),
        e.todas_las_webs && tp('qv_ext_todas') ? panel(tp('qv_ext_todas'), 'esc-marca fuerte') : null, e.chats_ia && tp('qv_ext_chats') ? panel(tp('qv_ext_chats'), 'esc-marca fuerte') : null,
        e.caso && tp('qv_caso_' + e.caso) ? panel(tp('qv_caso_' + e.caso), null, 'small') : null,
        (e.todas_las_webs || e.chats_ia) && tp('qv_ext_lee_ia') ? panel(tp('qv_ext_lee_ia') + ' ' + (tp('qv_ext_quitar_' + nav.toLowerCase()) || ''), null, 'small') : null,
        fu ? h('small', null, enlace(fu, 'Fuente')) : null);
    };
    let nivel, ver;
    if (!ext.length) { nivel = 'ok'; ver = [panel(tp(qv.cuentas_miradas === 0 ? 'qv_ext_sin_cuentas' : 'qv_ext_ninguna') || '')]; if (qv.cuentas_miradas === 0) nivel = 'nomedido'; }
    else if (marcadas.some((e) => e.caso)) { nivel = 'alerta'; ver = ['Hay extensiones que aparecen en un caso documentado o pueden leer todo lo que ves en cualquier web.']; }
    else if (marcadas.length) { nivel = 'aviso'; ver = ['Hay extensiones que pueden leer todo lo que ves en cualquier web.']; }
    else { nivel = 'ok'; ver = [panel(tp('qv_ext_vacio') || '')]; }
    return { nivel, ver, cuerpo: [cifras([{ v: num(ext.length), l: 'Instaladas' }, { v: num(ext.filter((e) => e.todas_las_webs).length), l: 'Leen todas las webs', n: ext.some((e) => e.todas_las_webs) ? 'aviso' : '' },
      { v: num(ext.filter((e) => e.chats_ia).length), l: 'Leen tus chats con IA', n: ext.some((e) => e.chats_ia) ? 'aviso' : '' }, { v: num(ext.filter((e) => e.caso).length), l: 'Con un caso documentado', n: ext.some((e) => e.caso) ? 'alerta' : '' },
      { v: num(qv.cuentas_miradas), l: 'Cuentas revisadas' }]),
      marcadas.length ? bloque('Las que pueden leer lo que ves', h('ul', { class: 'esc-lista plana' }, marcadas.map(fila))) : null,
      otras.length ? bloque('Las demás extensiones', largo(otras.map(fila), 'plana', 4)) : null] };
  }
  // ---- 13 · Quién está detrás de los destinos
  function secIdentidad() {
    const idn = S.d.identificacion, p = pd(), cuerpo = [];
    let nivel = 'info', ver;
    if (idn && idn.cobertura && typeof idn.cobertura === 'object') {
      const c = idn.cobertura;
      ver = [panel(limpia(idn.pct_texto, 80) || num(c.pct_identificada) + ' %')];
      const barra = h('div', { class: 'esc-barra3', 'aria-hidden': 'true' }, h('i', { class: 'a' }), h('i', { class: 'b' }), h('i', { class: 'c' }));
      [c.pct_identificada, c.pct_probable, c.pct_sin_identificar].forEach((v, i) => { barra.children[i].style.width = Math.max(0, Math.min(100, numero(v) || 0)) + '%'; });
      cuerpo.push(cifras([{ v: num(c.pct_identificada) + ' %', l: 'Identificada' }, { v: num(c.pct_probable) + ' %', l: 'Probable' }, { v: num(c.pct_sin_identificar) + ' %', l: 'Sin identificar', n: numero(c.pct_sin_identificar) ? 'aviso' : '' }, { v: num(c.consultas), l: 'Consultas (7 días)' }]), barra,
        h('p', { class: 'esc-nota' }, 'Incluye los aparatos de la casa que comparten su detalle con este equipo, si los hay.'));
      const fil = (x) => (x && typeof x === 'object' ? h('li', null, dato(limpia(x.qname, 120, false) || '—', null, 'b'), h('span', { class: 'der' }, panel((tp('id_consultas') || '{n}').replace('{n}', num(x.consultas)))),
        x.identidad && x.identidad.frase ? panel(limpia(x.identidad.frase, 200), null, 'small') : null, lista(x.identidad && x.identidad.pruebas_texto).slice(0, 2).map((t) => panel(limpia(t, 160), null, 'small'))) : null);
      const pro = lista(idn.probables).slice(0, 10).map(fil), sin = lista(idn.sin_identificar).slice(0, 10).map(fil);
      if (pro.length || sin.length) cuerpo.push(h('div', { class: 'esc-dos' }, h('div', null, h('h5', null, panel(tp('id_probables_titulo') || '')), pro.length ? h('ul', { class: 'esc-lista plana' }, pro) : panel(tp('id_lista_vacia') || '', 'esc-nota', 'p')),
        h('div', null, h('h5', null, panel(tp('id_sin_titulo') || '')), sin.length ? h('ul', { class: 'esc-lista plana' }, sin) : panel(tp('id_lista_vacia') || '', 'esc-nota', 'p'))));
      const pf = Object.entries(idn.por_fuente && typeof idn.por_fuente === 'object' ? idn.por_fuente : {}).filter(([, n]) => numero(n)).sort((a, b) => b[1] - a[1]);
      if (pf.length) cuerpo.push(bloque('Quién lo decidió', h('ul', { class: 'esc-lista plana' }, pf.map(([k, n]) => h('li', null, panel(tp('id_fuente_' + k) || humano(k), null, 'b'), h('span', { class: 'der' }, dato(num(n))))))));
      const ed = idn.ediciones; if (ed && tp('id_ediciones')) cuerpo.push(panel(rellena(tp('id_ediciones'), { mundo: ed.empresas_mundo, redes: ed.redes, listas: ed.listas, base: ed.base_red_fuente, base_fecha: ed.base_red }), 'esc-nota', 'p'));
    } else { nivel = fuente('identificacion') === 'no_medido' ? 'nomedido' : 'esperando'; ver = [nivel === 'nomedido' ? 'No se pudo medir quién está detrás de los destinos.' : 'Esperando la lectura…']; cuerpo.push(nmFuente('identificacion')); }
    // the companies that receive the most from this computer, in the last 24 hours
    if (p && p.mide_bytes !== false) {
      const em = new Map();
      for (const d of p.destinos) {
        if (!d) continue; const k = limpia(d.empresa, 60) || '';
        const x = em.get(k) || { n: k, env: 0, cons: 0, paises: new Set(), progs: new Set() };
        x.env += numero(d.enviados) || 0; x.cons += numero(d.consultas) || 0; if (paisNombre(d.pais)) x.paises.add(paisNombre(d.pais)); if (d.programa) x.progs.add(limpia(d.programa, 40));
        em.set(k, x);
      }
      const top = [...em.values()].sort((a, b) => b.env - a.env).slice(0, 10);
      if (top.length) cuerpo.push(bloque('Empresas que más reciben de este equipo (24 h)', h('div', { class: 'esc-tabla-caja' }, h('table', { class: 'esc-tabla' },
        h('thead', null, h('tr', null, h('th', null, 'Empresa'), h('th', null, 'Países'), h('th', { class: 'num' }, 'Enviado'), h('th', { class: 'num' }, 'Consultas'))),
        h('tbody', null, top.map((x) => h('tr', null, h('td', null, x.n ? dato(x.n, null, 'b') : h('b', null, 'Sin empresa identificada'), dato([...x.progs].slice(0, 4).join(', '), null, 'small')), h('td', null, dato([...x.paises].join(', ') || '—')),
          h('td', { class: 'num' }, dato(bytes(x.env))), h('td', { class: 'num' }, dato(num(x.cons))))))))));
      cuerpo.push(h('p', { class: 'esc-nota' }, 'El país es el del servidor según una base de datos de direcciones; no es la ruta exacta que siguen los datos.'), atribucion());
    }
    return { nivel: idn ? 'medido' : nivel, chip: idn ? 'Medido' : null, ver, cuerpo };
  }
  // ---- 14 · Lo que anotó tu antivirus
  function secDefender() {
    const pr = parteRev('defender'), v = verChecksSi(pr), vivo = vigiaDe(['amenaza']);
    let nivel = v.nivel; if (vivo.length) nivel = 'alerta';
    return { nivel, ver: vivo.length ? ['Microsoft Defender tiene ahora amenazas activas.', ...v.ver.slice(0, 1)] : v.ver,
      cuerpo: [vivo.length ? bloque('Amenazas activas ahora, según el Vigía de las llamadas', h('div', { class: 'esc-ahora' }, vivo.map(filaAhora))) : null, bloque('Comprobaciones de Windows (7 días)', pr.nodo)] };
  }
  // ---- 15 · Otros datos del equipo
  function secEquipo() {
    const rv = S.d.revision, eq = rv && rv.equipo && typeof rv.equipo === 'object' ? rv.equipo : null, est = S.d.estado, pr = parteRev('equipo');
    const def = [];
    const fila = (k, v) => { if (v) def.push(h('dt', null, k), h('dd', null, dato(v))); };
    if (eq) {
      fila('Fabricante', limpia(eq.fabricante, 80)); fila('Modelo', limpia(eq.modelo, 80));
      fila('Windows', [limpia(eq.sistema, 80), limpia(eq.display, 20)].filter(Boolean).join(' · '));
      fila('Compilación', [limpia(eq.compilacion, 20), numero(eq.ubr) != null ? String(eq.ubr) : ''].filter(Boolean).join('.'));
      fila('Último arranque', fecha(eq.arranque)); fila('Windows instalado', dia(eq.instalado));
      fila('Firmware', [limpia(eq.bios_fabricante, 40), limpia(eq.bios, 30), dia(eq.bios_fecha)].filter(Boolean).join(' · '));
    }
    if (est) { fila('Programa GUARDIANA', limpia(est.version, 20)); if (est.nivel) def.push(h('dt', null, 'Plan'), h('dd', null, est.nivel === 'plus' ? dato('Plus') : h('span', null, 'Gratis'))); }
    const nivel = pr.cs && pr.cs.length ? peor(pr.cs) : eq || est ? 'info' : nivelRev(pr);
    return { nivel, ver: [def.length ? 'Datos del equipo, tal como los dan Windows y el programa.' : S.rev.e === 'no_medido' ? 'La revisión de Windows no se pudo completar.' : 'Esperando la lectura…'],
      cuerpo: [def.length ? h('dl', { class: 'esc-def' }, def) : null, bloque('Comprobaciones de Windows', pr.nodo)] };
  }
  // ---- 16 · Límites y cómo se midió
  function secLimites() {
    const filas = L.map(([k]) => {
      const st = S.l[k];
      const estado = st.e === 'medido' ? h('span', { class: 'esc-marca verde' }, 'Medido') : st.e === 'no_medido' ? h('span', { class: 'esc-marca fuerte' }, 'No medido') : st.e === 'omitido' ? h('span', { class: 'esc-marca' }, 'Omitida') : h('span', { class: 'esc-marca' }, 'En curso');
      const motivo = st.e === 'no_medido' || st.e === 'omitido' ? h('small', null, MOTIVO[st.motivo] || MOTIVO.error) : null;
      return h('tr', null, h('td', null, h('b', null, LD[k].n), dato(LD[k].m + ' ' + LD[k].r, null, 'small'), motivo), h('td', null, estado), h('td', { class: 'num' }, dato(st.ms != null && st.e !== 'esperando' ? segundos(st.ms) : '—')));
    });
    const dur = S.fin ? S.tFin - S.t0 : Date.now() - S.t0;
    const est = S.d.estado, fr = est && est.fuente_red;
    const fuentes = [];
    for (const l of lista(est && est.listas)) if (l && l.id) fuentes.push(h('li', null, dato(limpia(l.id, 40), null, 'b'), h('span', { class: 'der' }, dato(num(l.entries) + (esHora(l.fetched) ? ' · ' + dia(l.fetched) : '')))));
    if (fr) fuentes.push(h('li', null, dato(limpia(fr.fuente, 40) || 'DB-IP', null, 'b'), h('span', { class: 'der' }, dato([limpia(fr.fecha, 20), limpia(fr.licencia, 30)].filter(Boolean).join(' · ')))));
    const cad = S.d.vigilancia && 'cadena_rota' in S.d.vigilancia ? (S.d.vigilancia.cadena_rota == null ? tp('vg_cadena_ok') : (tp('vg_cadena_rota') || '{x}').replace('{x}', limpia(String(S.d.vigilancia.cadena_rota), 40))) : null;
    return { nivel: 'info', chip: S.fin ? 'Medido' : 'En curso', ver: [h('span', null, 'Duración del escaneo'), ' ', dato(segundos(dur)), h('small', null, h('span', null, 'Empezó'), ' ', dato(fechaLarga(S.t0)), S.fin ? [' · ', h('span', null, 'Terminó'), ' ', dato(fechaLarga(S.tFin))] : null)],
      cuerpo: [bloque('Lecturas', h('div', { class: 'esc-tabla-caja' }, h('table', { class: 'esc-tabla' }, h('thead', null, h('tr', null, h('th', null, 'Lectura'), h('th', null, 'Resultado'), h('th', { class: 'num' }, 'Tiempo'))), h('tbody', null, filas)))),
        bloque('Solo lectura', h('p', { class: 'esc-texto' }, 'Ninguna de estas lecturas cambia una regla, la licencia ni un ajuste. Para comprobar el DNS, la revisión de Windows hace tres preguntas por nombres públicos (dns.google, one.one.one.one y un nombre inventado) a cada servidor DNS que usa el equipo, como mucho a cuatro; nada más sale.'), tp('rv_pie') ? panel(tp('rv_pie'), 'esc-nota', 'p') : null),
        bloque('Lo que ninguna lectura mide', h('ul', { class: 'esc-ul' },
          h('li', null, 'El contenido de lo que se envía: ninguna lectura lo ve.'),
          h('li', null, 'Las capturas de pantalla hechas por vías distintas de la oficial de Windows: no quedan anotadas.'),
          h('li', null, 'La ubicación en directo: solo se sabe la última vez que cada programa la usó.'),
          h('li', null, 'Puntos de arranque menos comunes (Winlogon, AppInit, IFEO, suscripciones WMI): no se revisan.'),
          h('li', null, 'Actualizaciones pendientes: no se buscan, porque la búsqueda la haría el propio Windows Update.'),
          h('li', null, 'Puertos UDP y reglas de entrada del cortafuegos: no se revisan.'),
          h('li', null, 'DNS cifrado del sistema y reglas NRPT: no se revisan.'),
          h('li', null, 'Credential Guard, reglas ASR y acceso controlado a carpetas: no se revisan.'),
          h('li', null, 'Las cuentas sin sesión iniciada: sus ajustes no se leen.'),
          h('li', null, 'Telemetría de fabricantes de equipos: solo se reconoce la que está en la lista abierta de GUARDIANA.'))),
        bloque('Fuentes y bases de datos', fuentes.length ? h('ul', { class: 'esc-lista plana' }, fuentes) : null, cad ? panel(cad, 'esc-nota', 'p') : null, atribucion()),
        bloque('Privacidad de este informe', h('p', { class: 'esc-texto' }, 'Este informe se ha hecho dentro de este equipo y vive en la memoria de esta página: no se envía a GUARDIANA ni a nadie y no se guarda en el navegador. Al cerrar la página, desaparece; solo queda si lo descargas.'),
          h('p', { class: 'esc-texto' }, 'Nombres, no rutas: las rutas de archivo, los identificadores internos de las cuentas de Windows y las direcciones no se muestran aquí.'),
          h('a', { class: 'esc-enlace-panel', href: PANEL, 'data-producto': 'guardiana' }, h('span', null, 'Detalle completo en el panel del programa'), h('span', { html: I_SALTO })))] };
  }
  const PINTA = { estado: secEstado, proteccion: secProteccion, antivirus: secAntivirus, sensores: secSensores, acceso: secAcceso, arranque: secArranque, fabrica: secFabrica, telemetria: secTelemetria, salida: secSalida, certificados: secCertificados, ia: secIA, extensiones: secExtensiones, identidad: secIdentidad, defender: secDefender, equipo: secEquipo, limites: secLimites };
  const DEPENDE_REV = new Set(['estado', 'proteccion', 'antivirus', 'sensores', 'acceso', 'arranque', 'fabrica', 'telemetria', 'salida', 'certificados', 'ia', 'defender', 'equipo']);

  let tInforme = 0;
  function informeLuego(ya) { clearTimeout(tInforme); tInforme = setTimeout(() => pintaInforme(), ya ? 0 : 140); }
  function firma(id) {
    const fs = FUENTES[id] || [];
    const partes = [lang(), LANGP, TX ? 1 : 0, S.g, fs.map((k) => fuente(k) + (k === 'pd' ? (S.v.pd1 || 0) + '.' + (S.v.pd2 || 0) : k === 'vigilancia' ? (S.v.resumen || 0) + '.' + (S.v.vigilancia || 0) : S.v[k] || 0)).join(',')];
    if (DEPENDE_REV.has(id)) partes.push(S.rev.e, S.rev.e === 'esperando' ? S.rev.hechas.length : '');
    if (id === 'limites') partes.push(L.map(([k]) => S.l[k].e).join(''), S.fin, S.fin ? 0 : Math.floor((Date.now() - S.t0) / 5000));
    if (id === 'estado') partes.push(S.v.vigia || 0, S.v.resumen || 0);
    return partes.join('|');
  }
  function pintaInforme() {
    if (!S || !abierto || informe.hidden) return;
    if (!secciones.childElementCount) {
      indice.textContent = ''; const ol = h('ol');
      SECC.forEach(([id, t], i) => {
        secciones.append(h('section', { class: 'esc-sec', id: 'esc-s-' + id, 'aria-labelledby': 'esc-h-' + id }));
        const b = h('button', { type: 'button', 'data-s': id }, h('i', { class: 'esc-p esperando' }), dato(nn(i), 'n'), h('span', null, t));
        b.addEventListener('click', () => { const s = document.getElementById('esc-s-' + id); if (s) { cuerpo.scrollTo({ top: s.offsetTop - 8, behavior: reducido() ? 'auto' : 'smooth' }); s.setAttribute('tabindex', '-1'); s.focus({ preventScroll: true }); } });
        ol.append(h('li', null, b));
      });
      indice.append(ol);
    }
    SECC.forEach(([id, t], i) => {
      const sec = document.getElementById('esc-s-' + id); if (!sec) return;
      const f = firma(id); if (sec.dataset.firma === f) return;
      sec.dataset.firma = f;
      let r;
      try { r = PINTA[id](); } catch (e) { r = { nivel: 'nomedido', ver: ['No se pudo componer este apartado con los datos recibidos.'], cuerpo: [] }; try { console.warn('Escáner PC', id, e); } catch (_) {} }
      const abiertos = new Set([...sec.querySelectorAll('details[open]')].map((d, j) => j));
      const nivel = r.nivel || 'info';
      sec.dataset.nivel = nivel; sec.textContent = '';
      const nombres = (FUENTES[id] || []).map((k) => FUENTE_N[k]).filter(Boolean).join(' · ');
      const partes = [h('div', { class: 'esc-sec-cab' }, dato(nn(i), 'esc-num'), h('h2', { id: 'esc-h-' + id }, t), chip(nivel === 'medido' ? 'info' : nivel, r.chip || CHIP[nivel])),
        nombres ? h('p', { class: 'esc-fuentes' }, h('span', null, 'Fuentes'), h('span', null, nombres)) : null,
        h('div', { class: 'esc-ver ' + nivel }, lista(r.ver).filter((x) => x != null)), ...lista(r.cuerpo).flat(3)];
      for (const x of partes) if (x instanceof Node) sec.append(x);
      [...sec.querySelectorAll('details')].forEach((d, j) => { if (abiertos.has(j)) d.open = true; });
      const b = indice.querySelector('button[data-s="' + id + '"] .esc-p'); if (b) b.className = 'esc-p ' + (nivel === 'medido' ? 'info' : nivel);
    });
    pintaDescargar();
  }
  // the section in view is marked in the index
  let rafEspia = 0;
  function espia() {
    if (rafEspia) return;
    rafEspia = requestAnimationFrame(() => {
      rafEspia = 0; if (!indice || informe.hidden) return;
      const tope = cuerpo.getBoundingClientRect().top + 90; let actual = null;
      for (const s of secciones.children) { if (s.getBoundingClientRect().top <= tope) actual = s.id.slice(6); else break; }
      for (const b of indice.querySelectorAll('button')) b.classList.toggle('actual', b.dataset.s === actual);
    });
  }

  // ---------- descargar el informe (solo si la persona lo pide; se hace en este navegador) ----------
  function documento() {
    if (!S) return null;
    const filas = [], datos = { escaner_pc: 1, empezo: iso(S.t0), termino: S.fin ? iso(S.tFin) : null, duracion_ms: (S.fin ? S.tFin : Date.now()) - S.t0, idioma_del_panel: LANGP || null, lecturas: {}, comprobaciones: [], ahora: [] };
    for (const [k] of L) { const st = S.l[k]; datos.lecturas[k] = { ruta: LD[k].m + ' ' + LD[k].r, resultado: st.e, motivo: st.motivo || null, ms: st.ms == null ? null : st.ms }; }
    if (S.rev.e === 'medido') {
      for (const [id, t] of SECC) for (const c of checksDe(id)) {
        const titulo = tp('rv_t_' + c.id) || humano(c.id), base = typeof c.frase === 'string' ? tp(c.frase) : null, f = base ? rellena(base, c.datos) : '';
        const items = lista(c.lista).map((it) => ({ t: limpia(it && it.t, 140), d: it && typeof it.d === 'string' && HUELLA.test(it.d.trim()) ? '' : limpia(it && it.d, 200), marcas: lista(it && it.marcas).filter((m) => typeof m === 'string'), cuando: it && esHora(it.cuando) ? iso(it.cuando) : null }));
        filas.push([T(t), titulo, T(CHIP[NIVEL[c.estado] ? c.estado : 'info']), [f, ...items.slice(0, 12).map((x) => x.t + (x.d ? ' (' + x.d + ')' : ''))].filter(Boolean).join(' · ')]);
        datos.comprobaciones.push({ apartado: id, id: c.id, estado: c.estado, titulo, frase: f, lista: items });
      }
    }
    for (const x of vigiaDe(null)) datos.ahora.push({ tipo: x.tipo, nivel: x.nivel, texto: x.texto, desde: esHora(x.desde) ? iso(x.desde) : null });
    const rs = S.d.revision && S.d.revision.resumen;
    const totales = rs && S.rev.e === 'medido' ? [[T('Para arreglar'), num(rs.alerta || 0)], [T('Para revisar'), num(rs.aviso || 0)], [T('Correcto'), num(rs.ok || 0)], [T('Para saber'), num(rs.info || 0)]] : [];
    const noMed = L.filter(([k]) => S.l[k].e === 'no_medido').map(([k]) => T(LD[k].n) + ': ' + T(MOTIVO[S.l[k].motivo] || MOTIVO.error));
    return { archivo: 'GUARDIANA-escaner-pc', titulo: T('Escáner PC') + ' · ' + T('Informe de este equipo'), subtitulo: fechaLarga(S.t0),
      lineas: [T('Duración del escaneo') + ': ' + segundos(datos.duracion_ms), ...vigiaDe(null).map((x) => T(TIPO_VIGIA[x.tipo] || 'Aviso') + ': ' + x.texto)],
      totales, columnas: [T('Apartado'), T('Comprobación'), T('Estado'), T('Detalle')], filas: filas.length ? filas : [[T('Revisión de Windows'), '', T(S.rev.e === 'no_medido' ? 'No medido' : 'En curso'), '']],
      notas: [...(noMed.length ? [T('No medido') + ': ' + noMed.join(' · ')] : []), T('Nombres, no rutas: las rutas de archivo, los identificadores internos de las cuentas de Windows y las direcciones no se muestran aquí.'), 'IP Geolocation by DB-IP (https://db-ip.com)'], datos };
  }
  function pintaDescargar() {
    if (!acc) return;
    const quiere = !!(S && enPrograma() && window.GuardianaDescargas && L.some(([k]) => S.l[k].e === 'medido'));
    if (quiere && !descargarBtn) { descargarBtn = window.GuardianaDescargas.boton(documento, 'esc-descargar'); acc.prepend(descargarBtn); }
    else if (!quiere && descargarBtn) { descargarBtn.remove(); descargarBtn = null; }
  }

  // ---------- todo a la vez ----------
  function pintaTodo() {
    if (!raiz || !abierto) return;
    const prog = enPrograma(), con = !!(S && prog);
    portada.hidden = con; cabeza.hidden = !con; avance.hidden = !con || S.informe; tira.hidden = !con || !S.informe; informe.hidden = !con;
    raiz.setAttribute('aria-labelledby', con ? 'esc-titulo-2' : 'esc-titulo');
    if (!con) pintaPortada(prog);
    else { pintaCabeza(); pintaAvance(); pintaTira(); informeLuego(true); }
    colocaRed(); pintaDescargar();
  }

  // ---------- el idioma de la página (el selector viaja a la barra mientras la sección está abierta) ----------
  let idiomas = null, idiomasCasa = null;
  function mueveIdiomas(dentro) {
    if (dentro) {
      const c = document.querySelector('header .idiomas'); if (!c || c === idiomas) return;
      idiomas = c; idiomasCasa = { padre: c.parentNode, sig: c.nextSibling };
      acc.insertBefore(c, cerrarBtn);
    } else if (idiomas && idiomasCasa) {
      try { if (idiomasCasa.padre && idiomasCasa.padre.isConnected) idiomasCasa.padre.insertBefore(idiomas, idiomasCasa.sig && idiomasCasa.sig.parentNode === idiomasCasa.padre ? idiomasCasa.sig : null); } catch (_) {}
      idiomas = null; idiomasCasa = null;
    }
  }
  addEventListener('guardiana-idioma', () => {
    if (!raiz) return;
    pintaVolver();
    if (portada) delete portada.dataset.clave;
    if (C.ult) delete C.ult.dataset.clave; if (C.revNota) delete C.revNota.dataset.clave; if (C.vigE) delete C.vigE.dataset.clave;
    if (tira) delete tira.dataset.clave;
    rehaceFeed();
    if (abierto) pintaTodo();
    if (boton) pon(boton.querySelector('span'), 'Escáner PC');
  });

  // ---------- abrir y cerrar ----------
  const visible = (el) => !!(el && !el.hidden && el.isConnected && !el.classList.contains('sale'));
  const nucleoTapa = () => visible(document.getElementById('nuc-ini')) || visible(document.getElementById('nuc-sala'));
  function abre(op) {
    op = op || {};
    monta();
    volverA = op.volver === 'nucleo' ? 'nucleo' : 'orbita';
    pintaVolver();
    if (abierto) { pintaTodo(); if (op.escanea && !S) escanea(); return true; }
    abierto = true; antes = document.activeElement;
    if (op.apila !== false) { try { history.pushState({ escaner: 1 }, '', location.pathname + location.search + '#escaner'); } catch (_) {} }
    raiz.hidden = false; raiz.classList.remove('sale');
    document.body.classList.add('en-escaner');
    // the planet is covered: it stops drawing while this section is open (and «Tu PC» stops asking)
    window.OrbitaTapada = true;
    mueveIdiomas(true);
    if (boton) boton.setAttribute('aria-pressed', 'true');
    pintaTodo(); rehaceFeed();
    if (op.escanea && !S && enPrograma()) escanea();
    setTimeout(() => { if (!abierto) return; const t = portada.hidden ? C.cabT : portada.querySelector('h1'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } else cuerpo.focus({ preventScroll: true }); }, 80);
    return true;
  }
  function cierra() {
    if (!abierto) return;
    abierto = false;
    const dentro = raiz.contains(document.activeElement);
    raiz.classList.add('sale');
    setTimeout(() => { if (!abierto && raiz) { raiz.hidden = true; raiz.classList.remove('sale'); } }, 260);
    document.body.classList.remove('en-escaner');
    if (window.GuardianaDescargas) try { window.GuardianaDescargas.cierraMenu(); } catch (_) {}
    mueveIdiomas(false); paraRed();
    window.OrbitaTapada = nucleoTapa();
    if (boton) boton.setAttribute('aria-pressed', 'false');
    if (volverA === 'nucleo' && window.GuardianaNucleo && typeof window.GuardianaNucleo.inicio === 'function') { volverA = 'orbita'; try { window.GuardianaNucleo.inicio(); } catch (_) {} return; }
    if (dentro) setTimeout(() => {
      const ve = (el) => !!(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
      const v = [antes, boton, document.getElementById('tupc-btn'), document.getElementById('volver')].find(ve);
      if (v) v.focus({ preventScroll: true });
    }, 300);
  }
  // leave: through the history if this section put a step there, else in place (it also drops the address's #escaner)
  function sal() {
    if (history.state && history.state.escaner && !history.state.llegada) { history.back(); return; }
    if (location.hash === '#escaner') { try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {} }
    cierra();
  }
  addEventListener('popstate', (e) => {
    if (e.state && e.state.escaner) { if (!abierto) abre({ apila: false }); }
    else if (abierto) cierra();
  });
  // the keys: Esc leaves; Tab stays inside; nothing reaches the planet's own keys (the doors' arrows) while this is open
  function teclas(e) {
    if (!abierto) return;
    if (e.key === 'Escape') {
      if (document.querySelector('.idioma-menu:not([hidden])') || document.querySelector('.descargar-menu')) return;
      e.preventDefault(); e.stopPropagation(); sal(); return;
    }
    if (e.key === 'Tab') {
      const fs = [...raiz.querySelectorAll('button, a[href], summary, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden');
      if (fs.length) { const i = fs.indexOf(document.activeElement); if (e.shiftKey && (i <= 0)) { e.preventDefault(); fs[fs.length - 1].focus(); } else if (!e.shiftKey && i === fs.length - 1) { e.preventDefault(); fs[0].focus(); } }
    }
    e.stopPropagation();
  }
  // a key pressed with the focus outside (on the page's body) is this section's too
  addEventListener('keydown', (e) => {
    if (!abierto || !raiz || raiz.contains(e.target)) return;
    if (e.target && e.target.closest && e.target.closest('.descargar-menu')) return;
    if (e.key === 'Escape') { if (document.querySelector('.idioma-menu:not([hidden])') || document.querySelector('.descargar-menu')) return; e.preventDefault(); e.stopImmediatePropagation(); sal(); return; }
    if (/^(Arrow|Page|Home|End| )/.test(e.key)) { e.stopImmediatePropagation(); cuerpo.focus({ preventScroll: true }); }
  }, true);
  document.addEventListener('focusin', (e) => {
    if (!abierto || !raiz || raiz.contains(e.target) || (e.target.closest && e.target.closest('.descargar-menu, #nuc-ini, #nuc-sala'))) return;
    const b = raiz.querySelector('.esc-volver'); if (b) b.focus({ preventScroll: true });
  });

  // ---------- la entrada, dentro del programa: «Escáner PC» en la cabecera, junto a «Tu PC» ----------
  let boton = null;
  function ponBoton() {
    const marca = document.querySelector('header .izq .marca');
    if (!enPrograma()) { if (boton) { boton.remove(); boton = null; } return; }
    if (boton || !marca) { if (boton) { const tu = document.getElementById('tupc-btn'); if (tu && boton.previousElementSibling !== tu) tu.after(boton); } return; }
    boton = document.createElement('button'); boton.type = 'button'; boton.id = 'escaner-btn'; boton.className = 'lugar-btn escaner-btn';
    boton.setAttribute('aria-pressed', abierto ? 'true' : 'false'); boton.setAttribute('aria-controls', 'escaner');
    boton.innerHTML = I_ESCANER_P + '<span></span>'; pon(boton.querySelector('span'), 'Escáner PC');
    boton.addEventListener('click', () => { if (abierto) sal(); else abre(); });
    const tu = document.getElementById('tupc-btn'); (tu || marca).after(boton);
  }
  function arranca() {
    ponBoton();
    try { new MutationObserver(() => { ponBoton(); if (abierto) pintaTodo(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-en-programa'] }); } catch (_) {}
    // «Tu PC» puts its button a moment later: this one goes right after it
    setTimeout(ponBoton, 0);
    // arriving with /orbita/#escaner
    if (location.hash === '#escaner') {
      try { history.replaceState({ escaner: 1, llegada: 1 }, '', location.pathname + location.search + '#escaner'); } catch (_) {}
      setTimeout(() => abre({ apila: false }), 300);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca, { once: true }); else arranca();
  window.OrbitaEscaner = { abre, cierra: sal, escanea: () => { if (!abierto) abre(); escanea(); }, get abierto() { return abierto; }, get escaneando() { return !!(S && !S.fin); } };
})();
