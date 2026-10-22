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

  // ---------- «Por dónde viajan tus datos» (owner, 22 Oct 2026, 15:25: «sobre todo empieza por el punto 1») ----------
  // Measured, never estimated: from this browser, the round trip to the public front door of 33 cloud regions
  // (Amazon Web Services; the metro of each region is public) and to the nearest edge of Cloudflare's network.
  // Each probe is one minimal request, made only when the visitor presses the button. The real hop-by-hop route
  // (traceroute) cannot be done by a web page: the GUARDIANA program measures it and hands it over through
  // OrbitaConexion.ruta(...) — see below — and Órbita draws it the same way.
  const NUBES = [
    ['us-east-1', 'Virginia del Norte (Ashburn)', 'US', 39.04, -77.49], ['us-east-2', 'Ohio (Columbus)', 'US', 39.96, -83.0], ['us-west-1', 'California del Norte', 'US', 37.35, -121.95],
    ['us-west-2', 'Oregón (Boardman)', 'US', 45.84, -119.7], ['ca-central-1', 'Montreal', 'CA', 45.5, -73.57], ['ca-west-1', 'Calgary', 'CA', 51.05, -114.07], ['mx-central-1', 'Querétaro', 'MX', 20.59, -100.39],
    ['sa-east-1', 'São Paulo', 'BR', -23.55, -46.63], ['eu-west-1', 'Dublín', 'IE', 53.35, -6.26], ['eu-west-2', 'Londres', 'GB', 51.51, -0.13], ['eu-west-3', 'París', 'FR', 48.86, 2.35],
    ['eu-central-1', 'Fráncfort', 'DE', 50.11, 8.68], ['eu-central-2', 'Zúrich', 'CH', 47.38, 8.54], ['eu-north-1', 'Estocolmo', 'SE', 59.33, 18.07], ['eu-south-1', 'Milán', 'IT', 45.46, 9.19],
    ['eu-south-2', 'Zaragoza (Aragón)', 'ES', 41.65, -0.88], ['il-central-1', 'Tel Aviv', 'IL', 32.08, 34.78], ['me-south-1', 'Baréin', 'BH', 26.23, 50.59], ['me-central-1', 'Emiratos (Dubái)', 'AE', 25.2, 55.27],
    ['af-south-1', 'Ciudad del Cabo', 'ZA', -33.93, 18.42], ['ap-south-1', 'Mumbai', 'IN', 19.08, 72.88], ['ap-south-2', 'Hyderabad', 'IN', 17.39, 78.49], ['ap-southeast-1', 'Singapur', 'SG', 1.35, 103.82],
    ['ap-southeast-2', 'Sídney', 'AU', -33.87, 151.21], ['ap-southeast-3', 'Yakarta', 'ID', -6.2, 106.85], ['ap-southeast-4', 'Melbourne', 'AU', -37.81, 144.96], ['ap-southeast-5', 'Kuala Lumpur', 'MY', 3.14, 101.69],
    ['ap-southeast-7', 'Bangkok', 'TH', 13.76, 100.5], ['ap-northeast-1', 'Tokio', 'JP', 35.68, 139.69], ['ap-northeast-2', 'Seúl', 'KR', 37.57, 126.98], ['ap-northeast-3', 'Osaka', 'JP', 34.69, 135.5],
    ['ap-east-1', 'Hong Kong', 'HK', 22.32, 114.17], ['ap-east-2', 'Taipéi', 'TW', 25.03, 121.56],
  ];
  const URL_NUBE = (r) => 'https://dynamodb.' + r + '.amazonaws.com/';
  const URL_BORDE = 'https://speed.cloudflare.com/cdn-cgi/trace';
  // Cloudflare names each edge site by its airport code; the big ones, with the city's position
  const IATA = { MAD: ['Madrid', 40.42, -3.7], BCN: ['Barcelona', 41.39, 2.17], LIS: ['Lisboa', 38.72, -9.14], OPO: ['Oporto', 41.15, -8.61], CDG: ['París', 48.86, 2.35], MRS: ['Marsella', 43.3, 5.37], FRA: ['Fráncfort', 50.11, 8.68], MUC: ['Múnich', 48.14, 11.58], DUS: ['Düsseldorf', 51.22, 6.78], HAM: ['Hamburgo', 53.55, 9.99], BER: ['Berlín', 52.52, 13.4], AMS: ['Ámsterdam', 52.37, 4.9], BRU: ['Bruselas', 50.85, 4.35], LHR: ['Londres', 51.51, -0.13], MAN: ['Mánchester', 53.48, -2.24], EDI: ['Edimburgo', 55.95, -3.19], DUB: ['Dublín', 53.35, -6.26], MXP: ['Milán', 45.46, 9.19], FCO: ['Roma', 41.9, 12.5], ZRH: ['Zúrich', 47.38, 8.54], GVA: ['Ginebra', 46.2, 6.14], VIE: ['Viena', 48.21, 16.37], PRG: ['Praga', 50.08, 14.44], WAW: ['Varsovia', 52.23, 21.01], BUD: ['Budapest', 47.5, 19.04], BTS: ['Bratislava', 48.15, 17.11], ARN: ['Estocolmo', 59.33, 18.07], GOT: ['Gotemburgo', 57.71, 11.97], CPH: ['Copenhague', 55.68, 12.57], OSL: ['Oslo', 59.91, 10.75], HEL: ['Helsinki', 60.17, 24.94], RIX: ['Riga', 56.95, 24.11], VNO: ['Vilna', 54.69, 25.28], TLL: ['Tallin', 59.44, 24.75], ATH: ['Atenas', 37.98, 23.73], SOF: ['Sofía', 42.7, 23.32], OTP: ['Bucarest', 44.43, 26.1], BEG: ['Belgrado', 44.79, 20.47], ZAG: ['Zagreb', 45.81, 15.98], IST: ['Estambul', 41.01, 28.98], KBP: ['Kiev', 50.45, 30.52], TLV: ['Tel Aviv', 32.08, 34.78], DXB: ['Dubái', 25.2, 55.27], DOH: ['Doha', 25.29, 51.53], BAH: ['Baréin', 26.23, 50.59], RUH: ['Riad', 24.71, 46.68], JED: ['Yeda', 21.49, 39.19], MCT: ['Mascate', 23.59, 58.41], AMM: ['Amán', 31.95, 35.93], CAI: ['El Cairo', 30.04, 31.24], CMN: ['Casablanca', 33.57, -7.59], TUN: ['Túnez', 36.8, 10.18], ALG: ['Argel', 36.75, 3.06], LOS: ['Lagos', 6.52, 3.38], ACC: ['Acra', 5.6, -0.19], NBO: ['Nairobi', -1.29, 36.82], JNB: ['Johannesburgo', -26.2, 28.05], CPT: ['Ciudad del Cabo', -33.93, 18.42], DUR: ['Durban', -29.86, 31.02], MPM: ['Maputo', -25.97, 32.57], DAR: ['Dar es Salaam', -6.79, 39.28], ADD: ['Adís Abeba', 9.03, 38.74], DKR: ['Dakar', 14.72, -17.47], MIA: ['Miami', 25.76, -80.19], ATL: ['Atlanta', 33.75, -84.39], IAD: ['Washington (Ashburn)', 39.04, -77.49], EWR: ['Nueva York (Newark)', 40.69, -74.17], BOS: ['Boston', 42.36, -71.06], ORD: ['Chicago', 41.88, -87.63], DFW: ['Dallas', 32.78, -96.8], IAH: ['Houston', 29.76, -95.37], DEN: ['Denver', 39.74, -104.99], PHX: ['Phoenix', 33.45, -112.07], LAX: ['Los Ángeles', 34.05, -118.24], SJC: ['San José (California)', 37.34, -121.89], SFO: ['San Francisco', 37.77, -122.42], SEA: ['Seattle', 47.61, -122.33], PDX: ['Portland', 45.52, -122.68], YVR: ['Vancouver', 49.28, -123.12], YYZ: ['Toronto', 43.65, -79.38], YUL: ['Montreal', 45.5, -73.57], MEX: ['Ciudad de México', 19.43, -99.13], QRO: ['Querétaro', 20.59, -100.39], GDL: ['Guadalajara', 20.67, -103.35], PTY: ['Panamá', 8.98, -79.52], SJO: ['San José (Costa Rica)', 9.93, -84.08], GUA: ['Guatemala', 14.63, -90.51], SDQ: ['Santo Domingo', 18.47, -69.9], SJU: ['San Juan', 18.47, -66.11], BOG: ['Bogotá', 4.71, -74.07], MDE: ['Medellín', 6.24, -75.58], CLO: ['Cali', 3.45, -76.53], UIO: ['Quito', -0.18, -78.47], GYE: ['Guayaquil', -2.17, -79.92], LIM: ['Lima', -12.05, -77.04], SCL: ['Santiago de Chile', -33.45, -70.67], EZE: ['Buenos Aires', -34.6, -58.38], MVD: ['Montevideo', -34.9, -56.16], ASU: ['Asunción', -25.26, -57.58], GRU: ['São Paulo', -23.55, -46.63], GIG: ['Río de Janeiro', -22.91, -43.17], FOR: ['Fortaleza', -3.72, -38.54], CWB: ['Curitiba', -25.43, -49.27], POA: ['Porto Alegre', -30.03, -51.23], BSB: ['Brasilia', -15.79, -47.88], CCS: ['Caracas', 10.48, -66.9], SIN: ['Singapur', 1.35, 103.82], HKG: ['Hong Kong', 22.32, 114.17], NRT: ['Tokio', 35.68, 139.69], KIX: ['Osaka', 34.69, 135.5], ICN: ['Seúl', 37.57, 126.98], TPE: ['Taipéi', 25.03, 121.56], BOM: ['Mumbai', 19.08, 72.88], DEL: ['Nueva Delhi', 28.61, 77.21], MAA: ['Chennai', 13.08, 80.27], BLR: ['Bangalore', 12.97, 77.59], HYD: ['Hyderabad', 17.39, 78.49], CCU: ['Calcuta', 22.57, 88.36], KHI: ['Karachi', 24.86, 67.01], CMB: ['Colombo', 6.93, 79.86], DAC: ['Daca', 23.81, 90.41], KUL: ['Kuala Lumpur', 3.14, 101.69], CGK: ['Yakarta', -6.2, 106.85], BKK: ['Bangkok', 13.76, 100.5], SGN: ['Ho Chi Minh', 10.82, 106.63], HAN: ['Hanói', 21.03, 105.85], MNL: ['Manila', 14.6, 120.98], SYD: ['Sídney', -33.87, 151.21], MEL: ['Melbourne', -37.81, 144.96], PER: ['Perth', -31.95, 115.86], BNE: ['Brisbane', -27.47, 153.03], AKL: ['Auckland', -36.85, 174.76], HNL: ['Honolulu', 21.31, -157.86], GUM: ['Guam', 13.44, 144.79], KEF: ['Reikiavik', 64.13, -21.9], LUX: ['Luxemburgo', 49.61, 6.13], MIL: ['Milán', 45.46, 9.19], PMO: ['Palermo', 38.12, 13.36], NAP: ['Nápoles', 40.85, 14.27], TRN: ['Turín', 45.07, 7.69] };
  const RAD = Math.PI / 180;
  const kmEntre = (a, b) => { const dl = (b.lon - a.lon) * RAD, f1 = a.lat * RAD, f2 = b.lat * RAD; const h = Math.sin((f2 - f1) / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2; return 2 * 6371 * Math.asin(Math.sqrt(h)); };
  const minimoMs = (km) => 2 * km / 200; // light inside glass fibre: about 200 km per millisecond, there and back
  let rutas = null, midiendo = false, rutaReal = null;
  async function sonda(url, veces, limite) {
    // warm-up opens the connection (DNS, TCP, TLS); the timed probes then ride the same connection: ≈ one round trip
    const pide = async () => { const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), limite || 5000); try { await fetch(url + (url.includes('?') ? '&' : '?') + 'g=' + Math.random().toString(36).slice(2), { mode: 'no-cors', cache: 'no-store', credentials: 'omit', signal: ctl.signal }); } finally { clearTimeout(tm); } };
    try { await pide(); } catch (_) { return null; }
    const ts = [];
    for (let i = 0; i < (veces || 3); i++) { const t0 = performance.now(); try { await pide(); ts.push(performance.now() - t0); } catch (_) {} }
    return ts.length ? Math.round(Math.min(...ts)) : null;
  }
  async function mideRutas() {
    if (midiendo) return;
    const P = window.OrbitaPlaneta, L = P && P.lugar;
    if (!L) { rutas = { sinLugar: true }; pinta(); return; }
    midiendo = true; rutas = { origen: L, nubes: [], borde: null, hechas: 0, total: NUBES.length + 1, cuando: Date.now() }; CAMINOS.clear(); preparaRed(); pinta();
    // the nearest edge of the internet (Cloudflare names its site by airport code), then its round trip
    try {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 6000);
      const r = await fetch(URL_BORDE, { cache: 'no-store', credentials: 'omit', signal: ctl.signal }); clearTimeout(tm);
      const txt = await r.text(); const colo = (txt.match(/^colo=(\w+)/m) || [])[1];
      if (colo) { const c = IATA[colo]; rutas.borde = { colo, nombre: c ? c[0] : colo, lat: c ? c[1] : null, lon: c ? c[2] : null }; rutas.borde.ms = await sonda(URL_BORDE, 3, 5000); }
    } catch (_) { rutas.borde = null; }
    rutas.hechas++; pinta();
    // the cloud regions, four at a time so one slow probe does not hold the rest
    const cola = NUBES.slice();
    const obrero = async () => { while (cola.length) { const n = cola.shift(); const ms = await sonda(URL_NUBE(n[0]), 3, 5000); const km = kmEntre(L, { lat: n[3], lon: n[4] }); if (ms != null) rutas.nubes.push({ region: n[0], nombre: n[1], cc: n[2], lat: n[3], lon: n[4], ms, km, minimo: minimoMs(km), t0: performance.now() }); rutas.hechas++; if (abierto) pinta(); } };
    await Promise.all([obrero(), obrero(), obrero(), obrero()]);
    rutas.nubes.sort((a, b) => a.ms - b.ms); rutas.fin = Date.now(); midiendo = false; pinta();
    if (P && P.ir) P.ir(L.lon, L.lat, 1); // the whole planet, you in the middle: every arc in view
  }
  // The real route, hop by hop, as the program measures it (web pages cannot): {destino:{nombre,ip,lat,lon}, saltos:[{n,ip,nombre,lat,lon,ms,red,cc}]}
  function ruta(datos) {
    if (!datos || !Array.isArray(datos.saltos)) return;
    rutaReal = { destino: datos.destino || null, saltos: datos.saltos.filter((h) => h && Number.isFinite(h.lat) && Number.isFinite(h.lon)), cuando: Date.now() };
    if (!abierto) abre(true); else pinta();
  }

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

  function seccionRutas() {
    const s = document.createElement('section'); s.className = 'bloque rutas';
    const h = document.createElement('h3'); h.textContent = T('Por dónde viajan tus datos'); s.append(h);
    const dl = document.createElement('dl'); dl.className = 'sat-dl';
    const add = (k, v, e) => { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; if (e) { const i = document.createElement('i'); i.className = 'et ' + e; i.textContent = T(e); dd.append(' ', i); } dl.append(dt, dd); };
    if (rutaReal && rutaReal.saltos.length) {
      add(T('Ruta real medida por el programa'), (rutaReal.destino && rutaReal.destino.nombre ? T('hasta') + ' ' + rutaReal.destino.nombre + ' · ' : '') + rutaReal.saltos.length + ' ' + T('saltos'), 'medido');
      rutaReal.saltos.forEach((hp) => add((hp.n || '') + '', (hp.nombre || hp.ip || '') + (hp.red ? ' · ' + hp.red : '') + (Number.isFinite(hp.ms) ? ' · ' + num(hp.ms) + ' ms' : '')));
    }
    if (rutas && rutas.sinLugar) add(T('Estado'), T('Hace falta tu ubicación para dibujarlo: pulsa «Precisar ubicación» arriba y vuelve a intentarlo.'));
    else if (rutas) {
      if (midiendo) add(T('Estado'), T('Midiendo…') + ' ' + rutas.hechas + ' / ' + rutas.total);
      if (rutas.borde) add(T('Borde de internet más cercano'), rutas.borde.nombre + ' (' + rutas.borde.colo + ')' + (rutas.borde.ms != null ? ' · ' + rutas.borde.ms + ' ms' : ''), 'medido');
      rutas.nubes.forEach((n, i) => add((i + 1) + '. ' + n.nombre, n.ms + ' ms · ' + num(Math.round(n.km)) + ' km · ' + T('mínimo') + ' ' + num(Math.round(n.minimo)) + ' ms' + (n.minimo > 0 ? ' · ×' + num(n.ms / n.minimo, 1) : ''), i < 3 ? 'medido' : ''));
      if (!midiendo && rutas.fin && !rutas.nubes.length) add(T('Estado'), T('No se pudo medir ahora. Vuelve a intentarlo.'));
    }
    if (dl.children.length) s.append(dl);
    const p = document.createElement('p'); p.className = 'nota';
    p.textContent = rutas && rutas.nubes && rutas.nubes.length
      ? T('Ida y vuelta medida ahora desde este navegador hasta la puerta pública de cada centro de datos. «Mínimo» es lo que tardaría la luz por la fibra en línea recta: lo que sobra es el camino real de tus datos (cables que no van rectos, saltos entre redes). En el planeta, los tres más rápidos brillan más; el pulso recorre cada trayecto a cámara lenta, 20 veces más despacio que tus datos.') + ' ' + (window.OrbitaRed && window.OrbitaRed.lista ? T('Cada trayecto va por los cables submarinos y la fibra terrestre del mapa, por el camino más corto entre ellos: así viajan tus datos. El cable exacto que usó tu conexión no se conoce desde fuera de la red; donde el mapa no tiene camino, se dibuja el arco directo.') : T('Cargando la red del mapa para dibujar los trayectos por los cables…')) + (porSatelite() ? ' ' + T('Tu operador es de satélite: el primer tramo sube al satélite y baja a la red en tierra.') : '')
      : T('Se mide desde este navegador: una petición mínima a la puerta pública de 33 centros de datos de nube (Amazon Web Services) y al borde de red más cercano (Cloudflare), solo cuando tú pulsas. No se envía nada tuyo. La ruta salto a salto solo puede medirla el programa GUARDIANA, y Órbita la dibuja igual.');
    s.append(p);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'medir'; b.disabled = midiendo; b.textContent = midiendo ? T('Midiendo…') : rutas && rutas.nubes && rutas.nubes.length ? T('Volver a medir') : T('Medir rutas'); b.addEventListener('click', mideRutas); s.append(b);
    // the journey and its report: on a computer only for now (owner, 22 Oct 2026: «solo versión PC, de momento»)
    const pc = !(matchMedia && matchMedia('(pointer: coarse)').matches) && innerWidth >= 900;
    if (pc && rutas && rutas.nubes && rutas.nubes.length && !midiendo && window.OrbitaViaje) {
      const v = document.createElement('button'); v.type = 'button'; v.className = 'medir viaje3d'; v.textContent = T('Ver el viaje en 3D'); v.addEventListener('click', () => window.OrbitaViaje.empieza(rutas)); s.append(' ', v);
      const i = document.createElement('button'); i.type = 'button'; i.className = 'medir'; i.textContent = T('Guardar el viaje (PDF)'); i.addEventListener('click', () => window.OrbitaViaje.informe(rutas)); s.append(' ', i);
    }
    return s;
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
    cuerpo.append(seccionRutas());
    cuerpo.append(seccion(T('Lo que cualquier web ve de ti'), f.vista, T('Sin pedir permiso. Por eso existe GUARDIANA.')));
    const s4 = document.createElement('section'); s4.className = 'bloque programa';
    const h4 = document.createElement('h3'); h4.textContent = T('Lo que solo ve el programa'); s4.append(h4);
    const p4 = document.createElement('p'); p4.className = 'nota'; p4.textContent = T('Qué programas hablan con internet, con quién y cuánto, y la ruta real de tus datos: eso se mide dentro del equipo, con ZERO. Aquí no se inventa.'); s4.append(p4);
    cuerpo.append(s4);
  }
  // what is drawn on the empty planet while the card is open: only the visitor's own marks
  // a great-circle arc on the sphere, as screen points (null where it goes behind the planet)
  function arco(p, G, a, b, n) {
    const va = p.vec(a.lon, a.lat), vb = p.vec(b.lon, b.lat); const d = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])), om = Math.acos(d), so = Math.sin(om) || 1e-9, pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, ka = Math.sin((1 - t) * om) / so, kb = Math.sin(t * om) / so; const w = [va[0] * ka + vb[0] * kb, va[1] * ka + vb[1] * kb, va[2] * ka + vb[2] * kb].map((c) => c * 1.004); const v = p.aVista(w); pts.push(v[2] > 0.02 ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null); }
    return pts;
  }
  function traza(cx, pts) { let prev = false; cx.beginPath(); for (const q of pts) { if (q && prev) cx.lineTo(q[0], q[1]); else if (q) cx.moveTo(q[0], q[1]); prev = !!q; } cx.stroke(); }
  // 22 Oct 2026, 18:13 (owner): «deben de llegar por el cable… es mucho más real». The route between two places is
  // drawn along the submarine cables and the land fibre of the map (red.js finds the shortest way through them); the
  // straight arc remains only where the map has no way. The exact cable a packet took is not known from outside the
  // network, and the panel says so. When the operator is a satellite one, the first leg goes up to the satellite.
  const SATELITE = /starlink|viasat|hughes|hughesnet|oneweb|eutelsat|skydsl|bigblu|konnect|telesat|iridium|inmarsat|ses\b|satel/i;
  const porSatelite = () => !!(fuera && !fuera.error && SATELITE.test(String(fuera.operador || '') + ' ' + String(fuera.red || '')));
  const CAMINOS = new Map();
  // unit vectors from a to b: along the network when there is a way, the great circle otherwise; cached by place pair
  function trayecto(p, a, b, n) {
    const key = a.lon.toFixed(2) + ',' + a.lat.toFixed(2) + '>' + b.lon.toFixed(2) + ',' + b.lat.toFixed(2) + '#' + n + (porSatelite() ? 's' : '');
    let c = CAMINOS.get(key); if (c) return c;
    const R = window.OrbitaRed, ruta = R && R.lista ? R.camino(a, b) : null;
    let w;
    if (ruta) w = R.muestrea(ruta, n);
    else { const va = p.vec(a.lon, a.lat), vb = p.vec(b.lon, b.lat); const d = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])), om = Math.acos(d), so = Math.sin(om) || 1e-9; w = []; for (let i = 0; i <= n; i++) { const t = i / n, ka = Math.sin((1 - t) * om) / so, kb = Math.sin(t * om) / so; w.push([va[0] * ka + vb[0] * kb, va[1] * ka + vb[1] * kb, va[2] * ka + vb[2] * kb]); } }
    let alza = null;
    if (porSatelite() && ruta) {
      // the first leg climbs to the satellite above the start of the path (low orbit drawn at scale: about 550 km up;
      // a geostationary one would be six planet radii away, so it is drawn nearer and the panel says «no a escala»)
      const geo = /viasat|hughes|eutelsat|skydsl|bigblu|konnect|inmarsat|ses\b/i.test(String(fuera.operador || ''));
      alza = { hasta: Math.max(2, Math.round(n * 0.12)), alto: geo ? 1.35 : 1.09, geo };
    }
    c = { w, red: !!ruta, km: ruta ? ruta.km : null, alza }; CAMINOS.set(key, c); return c;
  }
  // the screen points of a trayecto (null where it goes behind the planet); the satellite leg is lifted
  function pantalla(p, G, c) {
    const out = [], n = c.w.length - 1;
    for (let i = 0; i <= n; i++) {
      let h = 1.004;
      if (c.alza && i <= c.alza.hasta) { const s = i / c.alza.hasta; h = 1.004 + (c.alza.alto - 1.004) * Math.sin(s * Math.PI); }
      const w = c.w[i], v = p.aVista([w[0] * h, w[1] * h, w[2] * h]);
      out.push(v[2] > 0.02 || h > 1.05 ? [G.CX + G.R * v[0], G.CY - G.R * v[1]] : null);
    }
    return out;
  }
  const camino = (p, G, a, b, n) => pantalla(p, G, trayecto(p, a, b, n));
  const preparaRed = () => { if (window.OrbitaRed && !window.OrbitaRed.lista) window.OrbitaRed.prepara().then((si) => { if (si) { CAMINOS.clear(); if (abierto) pinta(); } }); };
  // labels never pile up: each one takes its box; a later label that would overlap is left out (the dot stays).
  // The fastest clouds come first in the list, so they keep their name when Europe gets crowded.
  let cajas = [];
  function marca(cx, p, G, lon, lat, texto, t, fuerte, abajo) {
    const w = p.vec(lon, lat).map((c) => c * 1.003), v = p.aVista(w); if (v[2] <= 0.02) return null;
    const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1], pulso = 0.5 + 0.5 * Math.sin((t || 0) / 450);
    if (fuerte) { cx.strokeStyle = 'rgba(156,195,228,' + (0.25 + 0.35 * pulso) + ')'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(x, y, 9 + 6 * pulso, 0, 7); cx.stroke(); }
    cx.fillStyle = fuerte ? '#9CC3E4' : 'rgba(244,246,248,.85)'; cx.beginPath(); cx.arc(x, y, fuerte ? 3.2 : 2.2, 0, 7); cx.fill();
    if (texto) {
      const px = fuerte ? 10.5 : 10, w = px * 0.62 * texto.length, lx = x + (fuerte ? 12 : 7), ly = y + (abajo ? 14 : 0), caja = [lx, ly - 7, w, 14];
      const choca = cajas.some((c) => lx < c[0] + c[2] + 4 && lx + w > c[0] - 4 && ly - 7 < c[1] + c[3] && ly + 7 > c[1]);
      if (!choca || fuerte) { cajas.push(caja); cx.font = (fuerte ? '500 ' : '400 ') + px + 'px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle'; cx.fillStyle = fuerte ? 'rgba(232,236,241,.92)' : 'rgba(232,236,241,.78)'; cx.fillText(texto, lx, ly); }
    }
    return [x, y];
  }
  function pintaMio(cx, p, G, t) {
    cx.save(); cx.globalCompositeOperation = 'source-over'; cajas = [];
    const P = window.OrbitaPlaneta, L = (rutas && rutas.origen) || (P && P.lugar);
    // you first, so your label is never pushed out: measured from outside if you asked for it, otherwise the place you chose
    if (fuera && !fuera.error && Number.isFinite(fuera.lat)) marca(cx, p, G, fuera.lon, fuera.lat, (T('Cómo te ve internet') + ' · ' + (fuera.ciudad || '')).toUpperCase(), t, true);
    else if (L && (rutas || rutaReal)) marca(cx, p, G, L.lon, L.lat, (T('Tú') + ' · ' + L.nombre + (L.aprox ? ' (' + T('aproximada') + ')' : '')).toUpperCase(), t, true);
    // the measured arcs to the clouds: fastest three bright, the rest fainter; a pulse rides each one at 1/20 of real speed
    if (rutas && rutas.nubes && rutas.nubes.length && L) {
      const mejor = rutas.nubes[0].ms || 1;
      rutas.nubes.forEach((n, i) => {
        const c = trayecto(p, L, n, 96), pts = pantalla(p, G, c), top = i < 3, k = Math.max(0, Math.min(1, 1 - (n.ms - mejor) / (6 * mejor)));
        cx.strokeStyle = top ? 'rgba(156,195,228,.85)' : 'rgba(244,246,248,' + (0.18 + 0.3 * k).toFixed(2) + ')'; cx.lineWidth = top ? 1.5 : 0.9; traza(cx, pts);
        const f = (((t || 0) - (n.t0 || 0)) / (n.ms * 20)) % 1, q = pts[Math.round(f * (pts.length - 1))];
        if (q) { cx.fillStyle = top ? '#9CC3E4' : 'rgba(244,246,248,.8)'; cx.beginPath(); cx.arc(q[0], q[1], top ? 2.6 : 1.8, 0, 7); cx.fill(); }
        // the satellite the first leg climbs to, named once (on the fastest route)
        if (c.alza && i === 0) { const s = pts[Math.round(c.alza.hasta / 2)]; if (s) { cx.fillStyle = '#F4F6F8'; cx.beginPath(); cx.arc(s[0], s[1], 2.4, 0, 7); cx.fill(); cx.strokeStyle = 'rgba(244,246,248,.6)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(s[0], s[1], 6, 0, 7); cx.stroke(); cx.font = '400 10px "IBM Plex Mono", ui-monospace, monospace'; cx.textBaseline = 'middle'; cx.fillStyle = 'rgba(232,236,241,.85)'; cx.fillText((T('satélite') + ' · ' + (fuera.operador || '') + (c.alza.geo ? ' · ' + T('no a escala') : '')).toUpperCase(), s[0] + 9, s[1] - 8); } }
        marca(cx, p, G, n.lon, n.lat, n.nombre + ' · ' + n.ms + ' ms', t, top);
      });
      if (rutas.borde && Number.isFinite(rutas.borde.lat)) { cx.setLineDash([3, 4]); cx.strokeStyle = 'rgba(156,195,228,.6)'; cx.lineWidth = 1; traza(cx, camino(p, G, L, rutas.borde, 48)); cx.setLineDash([]); marca(cx, p, G, rutas.borde.lon, rutas.borde.lat, T('borde') + ' · ' + rutas.borde.nombre + (rutas.borde.ms != null ? ' · ' + rutas.borde.ms + ' ms' : ''), t, false, true); }
    }
    // the real route from the program: hop by hop, numbered
    if (rutaReal && rutaReal.saltos.length) {
      const hs = rutaReal.saltos; let prev = L;
      cx.strokeStyle = 'rgba(244,246,248,.9)'; cx.lineWidth = 1.6;
      for (const h of hs) { if (prev) traza(cx, camino(p, G, prev, h, 64)); prev = h; }
      hs.forEach((h, i) => marca(cx, p, G, h.lon, h.lat, (h.n || i + 1) + ' · ' + (h.nombre || h.ip || '') + (Number.isFinite(h.ms) ? ' · ' + num(h.ms) + ' ms' : ''), t, i === hs.length - 1));
    }
    cx.restore();
  }
  function abre(si) {
    abierto = si; panel.hidden = !si; boton.setAttribute('aria-pressed', si ? 'true' : 'false');
    guarda(si ? 'ver' : 'no');
    if (window.OrbitaCapas && window.OrbitaCapas.soloTu) window.OrbitaCapas.soloTu(si, pintaMio);
    if (si) { preparaRed(); pinta(); if (ping == null) latencia().then((ms) => { ping = ms; if (abierto) pinta(); }); }
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
  window.OrbitaConexion = { abre, ruta, medirRutas: mideRutas, trayecto, porSatelite, get datos() { return { local: filasLocales(), fuera: fuera, ping, rutas, rutaReal }; } };
})();
