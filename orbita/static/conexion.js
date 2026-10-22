/* GUARDIANA · Órbita · «Mi conexión» (owner, 22 Oct 2026): one button that turns «the world» into «your world».
   Two kinds of facts, each with its own label so the visitor knows where certainty ends:
     · measured here, in this browser, without talking to anyone (what any web page can see of you);
     · «from outside»: only when the visitor presses the button, one request to a public lookup service tells
       how the internet sees this connection (public address, operator, approximate city). Nothing is sent before.
   What only the program can see (processes, every connection of the computer) is said to be the program's, not shown.
   No figure is invented: a value we cannot measure is not shown. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const ORIGEN_FUERA = 'https://ipinfo.io/json';   // the one outside lookup, made only on the visitor's click
  const K = 'guardiana_conexion';                   // remembered choice: 'ver' | 'no'
  let panel = null, boton = null, fuera = null, ping = null, abierto = false, medido = false;

  const lee = () => { try { return localStorage.getItem(K); } catch (_) { return null; } };
  const guarda = (v) => { try { localStorage.setItem(K, v); } catch (_) {} };
  const num = (n, d) => Number.isFinite(n) ? n.toLocaleString(window.GuardianaIdioma ? window.GuardianaIdioma.locale : undefined, { maximumFractionDigits: d || 0 }) : null;

  // ---------- what this browser can see of itself, without asking anyone ----------
  function navegador() {
    const ua = navigator.userAgent || '';
    const uad = navigator.userAgentData;
    let nav = '', so = '';
    if (uad && uad.brands) { const b = uad.brands.find((x) => !/Not.A.Brand|Chromium/i.test(x.brand)) || uad.brands[0]; if (b) nav = b.brand + ' ' + b.version; so = uad.platform || ''; }
    if (!nav) {
      const m = ua.match(/(Firefox|Edg|OPR|Chrome|Safari|Version)\/(\d+)/g) || [];
      const f = (k) => { const x = m.find((s) => s.startsWith(k + '/')); return x ? x.split('/')[1] : null; };
      if (f('Firefox')) nav = 'Firefox ' + f('Firefox'); else if (f('Edg')) nav = 'Edge ' + f('Edg'); else if (f('OPR')) nav = 'Opera ' + f('OPR'); else if (f('Chrome')) nav = 'Chrome ' + f('Chrome'); else if (f('Safari')) nav = 'Safari ' + (f('Version') || '');
    }
    if (!so) so = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : '';
    return { nav, so };
  }
  function red() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return null;
    const tipo = { wifi: 'Wi-Fi', cellular: T('móvil'), ethernet: T('cable de red'), bluetooth: 'Bluetooth', wimax: 'WiMAX', none: T('sin red') }[c.type] || null;
    const calidad = { 'slow-2g': T('muy lenta'), '2g': T('lenta'), '3g': T('media'), '4g': T('buena') }[c.effectiveType] || null;
    return { tipo, calidad, rtt: Number.isFinite(c.rtt) && c.rtt > 0 ? c.rtt : null, bajada: Number.isFinite(c.downlink) && c.downlink > 0 ? c.downlink : null, ahorro: !!c.saveData };
  }
  async function latencia() {
    // round trip to the page's own origin: a tiny request, no cache, three times, the median; nobody else contacted
    const ts = [];
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      try { await fetch('static/vendor/satellite-LICENSE.txt?x=' + Math.random().toString(36).slice(2), { cache: 'no-store', method: 'HEAD' }); ts.push(performance.now() - t0); } catch (_) {}
    }
    if (!ts.length) return null; ts.sort((a, b) => a - b); return Math.round(ts[Math.floor(ts.length / 2)]);
  }

  // ---------- rows ----------
  const fila = (k, v, etiqueta) => (v == null || v === '' ? null : { k, v, e: etiqueta || 'medido' });
  function filasLocales() {
    const { nav, so } = navegador(), r = red(), P = window.OrbitaPlaneta, L = P && P.lugar;
    const tz = (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || null;
    const hora = new Date().toLocaleTimeString(window.GuardianaIdioma ? window.GuardianaIdioma.locale : undefined, { hour: '2-digit', minute: '2-digit' });
    const gpc = navigator.globalPrivacyControl === true;
    return {
      ahora: [
        fila(T('Conexión'), navigator.onLine === false ? T('sin conexión ahora') : T('en línea')),
        r && fila(T('Tipo de red'), r.tipo),
        r && fila(T('Calidad estimada'), r.calidad && (r.calidad + (r.bajada ? ' · ~' + num(r.bajada, 1) + ' Mb/s' : '')), 'estimado'),
        r && fila(T('Ida y vuelta estimada'), r.rtt && r.rtt + ' ms', 'estimado'),
        fila(T('Ida y vuelta real hasta GUARDIANA'), ping != null ? ping + ' ms' : T('midiendo…')),
        fila(T('Esta página'), location.protocol === 'https:' ? T('cifrada (HTTPS)') : T('sin cifrar')),
        r && r.ahorro ? fila(T('Ahorro de datos'), T('activado')) : null,
      ].filter(Boolean),
      vista: [
        fila(T('Navegador'), nav || null),
        fila(T('Sistema'), so || null),
        fila(T('Idioma del navegador'), (navigator.languages && navigator.languages[0]) || navigator.language || null),
        fila(T('Zona horaria'), tz && tz.replace(/_/g, ' ') + ' · ' + hora),
        fila(T('Pantalla'), screen && screen.width ? screen.width + ' × ' + screen.height + (window.devicePixelRatio > 1 ? ' · ×' + num(window.devicePixelRatio, 1) : '') : null),
        fila(T('Procesador'), navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' ' + T('núcleos') : null),
        fila(T('Memoria'), navigator.deviceMemory ? T('al menos') + ' ' + navigator.deviceMemory + ' GB' : null),
        fila(T('Puntero'), matchMedia && matchMedia('(pointer: coarse)').matches ? T('táctil') : T('ratón o panel táctil')),
        fila(T('Señal «no me rastrees»'), gpc ? T('enviada (GPC)') : navigator.doNotTrack === '1' ? T('enviada (DNT)') : T('no enviada')),
        fila(T('Ubicación en Órbita'), L ? L.nombre + (L.aprox ? ' (' + T('aproximada') + ')' : '') : T('sin precisar'), L && !L.aprox ? 'medido' : 'estimado'),
      ].filter(Boolean),
    };
  }

  // ---------- from outside: one request, only on click ----------
  async function medirFuera() {
    const b = panel.querySelector('.medir'); b.disabled = true; b.textContent = T('Midiendo…');
    try {
      const ctl = new AbortController(); setTimeout(() => ctl.abort(), 8000);
      const r = await fetch(ORIGEN_FUERA, { signal: ctl.signal, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const org = (j.org || '').replace(/^AS\d+\s*/, '');
      const [la, lo] = (j.loc || '').split(',').map(Number);
      fuera = { ip: j.ip || null, operador: org || null, ciudad: [j.city, j.region, j.country].filter(Boolean).join(', ') || null, lat: la, lon: lo, cuando: Date.now() };
      medido = true;
      if (window.OrbitaPlaneta && Number.isFinite(la) && Number.isFinite(lo)) window.OrbitaPlaneta.ir(lo, la, Math.max(2.5, (window.OrbitaPlaneta.geo.R / (window.OrbitaPlaneta.geo.R0 || 1)) || 1));
    } catch (_) { fuera = { error: true }; }
    pinta();
  }
  function filasFuera() {
    if (!fuera) return null;
    if (fuera.error) return [{ k: T('Estado'), v: T('No se pudo medir ahora. Vuelve a intentarlo.'), e: '' }];
    return [
      fila(T('Dirección pública'), fuera.ip, 'verificado'),
      fila(T('Operador'), fuera.operador, 'verificado'),
      fila(T('Ciudad que ve internet'), fuera.ciudad, 'estimado'),
    ].filter(Boolean);
  }

  // ---------- panel ----------
  function seccion(titulo, filas, nota) {
    const s = document.createElement('section'); s.className = 'bloque';
    const h = document.createElement('h3'); h.textContent = titulo; s.append(h);
    const dl = document.createElement('dl'); dl.className = 'sat-dl';
    for (const f of filas) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = f.k; dd.textContent = f.v; if (f.e) { const i = document.createElement('i'); i.className = 'et ' + f.e; i.textContent = T(f.e); dd.append(' ', i); } dl.append(dt, dd); }
    s.append(dl);
    if (nota) { const p = document.createElement('p'); p.className = 'nota'; p.textContent = nota; s.append(p); }
    return s;
  }
  function pinta() {
    if (!panel) return;
    const cuerpo = panel.querySelector('.cuerpo'); cuerpo.textContent = '';
    const f = filasLocales();
    cuerpo.append(seccion(T('Ahora mismo'), f.ahora, T('Medido en este navegador, sin consultar a nadie.')));
    const sf = filasFuera();
    const s2 = document.createElement('section'); s2.className = 'bloque';
    const h2 = document.createElement('h3'); h2.textContent = T('Cómo te ve internet'); s2.append(h2);
    if (sf) { const dl = document.createElement('dl'); dl.className = 'sat-dl'; for (const x of sf) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = x.k; dd.textContent = x.v; if (x.e) { const i = document.createElement('i'); i.className = 'et ' + x.e; i.textContent = T(x.e); dd.append(' ', i); } dl.append(dt, dd); } s2.append(dl); }
    const p = document.createElement('p'); p.className = 'nota';
    p.textContent = sf && !fuera.error ? T('Medido una vez, al pulsar tú. No se repite solo.') : T('Para saberlo hay que preguntar fuera: una sola consulta, solo si tú pulsas. Hasta entonces, nada sale de aquí.');
    s2.append(p);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'medir'; b.textContent = sf ? T('Volver a medir') : T('Medir desde fuera'); b.addEventListener('click', medirFuera); s2.append(b);
    cuerpo.append(s2);
    cuerpo.append(seccion(T('Lo que cualquier web ve de ti'), f.vista, T('Sin pedir permiso. Por eso existe GUARDIANA.')));
    const s4 = document.createElement('section'); s4.className = 'bloque programa';
    const h4 = document.createElement('h3'); h4.textContent = T('Lo que solo ve el programa'); s4.append(h4);
    const p4 = document.createElement('p'); p4.className = 'nota'; p4.textContent = T('Qué programas hablan con internet, con quién y cuánto, y la ruta real de tus datos: eso se mide dentro del equipo, con ZERO. Aquí no se inventa.'); s4.append(p4);
    cuerpo.append(s4);
  }
  function abre(si) {
    abierto = si; panel.hidden = !si; boton.setAttribute('aria-pressed', si ? 'true' : 'false');
    guarda(si ? 'ver' : 'no');
    if (si) { pinta(); if (ping == null) latencia().then((ms) => { ping = ms; if (abierto) pinta(); }); }
  }
  function monta() {
    const der = document.querySelector('header .derecha'); if (!der) return;
    boton = document.createElement('button'); boton.type = 'button'; boton.id = 'conexion-btn'; boton.className = 'lugar-btn conexion-btn'; boton.setAttribute('aria-pressed', 'false');
    boton.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="12.5" r="1.2"/><path d="M5.2 9.7a4 4 0 0 1 5.6 0M2.6 7a7.6 7.6 0 0 1 10.8 0"/></svg><span>' + T('Ver mi conexión') + '</span>';
    der.insertBefore(boton, der.firstChild);
    panel = document.createElement('aside'); panel.id = 'conexion'; panel.className = 'conexion'; panel.hidden = true; panel.setAttribute('aria-label', T('Mi conexión'));
    panel.innerHTML = '<div class="titulo"><span>' + T('Mi conexión') + '</span><span class="acciones"><button type="button" class="ver" aria-pressed="true">' + T('Ver') + '</button><button type="button" class="nover" aria-pressed="false">' + T('No ver') + '</button></span></div><div class="cuerpo"></div><p class="pie">' + T('Son tus datos y de nadie más. Nada se guarda fuera de este equipo.') + '</p>';
    document.body.append(panel);
    boton.addEventListener('click', () => abre(!abierto));
    panel.querySelector('.nover').addEventListener('click', () => abre(false));
    panel.querySelector('.ver').addEventListener('click', () => abre(true));
    window.addEventListener('online', () => abierto && pinta()); window.addEventListener('offline', () => abierto && pinta());
    window.addEventListener('guardiana-idioma', () => { boton.querySelector('span').textContent = T('Ver mi conexión'); panel.querySelector('.titulo > span').textContent = T('Mi conexión'); panel.querySelector('.ver').textContent = T('Ver'); panel.querySelector('.nover').textContent = T('No ver'); panel.querySelector('.pie').textContent = T('Son tus datos y de nadie más. Nada se guarda fuera de este equipo.'); if (abierto) pinta(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta); else monta();
  window.OrbitaConexion = { abre, get datos() { return { local: filasLocales(), fuera: fuera, ping }; } };
})();
