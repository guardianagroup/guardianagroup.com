/* GUARDIANA · Órbita · «VPN» (1 nov 2026; rehecha el 3 nov 2026). El dueño, 3 nov, 09:25: «le da a conectar, ya está, me dice
   conectada, pero no me da más información… me ha conectado, pero no sé a dónde… Todas las VPN te dicen a dónde… Haz una VPN de
   verdad y de calidad», y que se elija el país, agrupado por continentes y con banderas.
   La misma casa que «Antivirus» (pantalla completa sobre el planeta, noche, acero, IBM Plex) y lo que decidió la ronda 91
   (§1–§3 y §6): solo salidas reales, cada una con su ciudad, su proveedor y su retraso medido; arriba, «El más rápido»; el aviso
   honesto cuando una salida está lejos; y «Lo que una web verá», con lo que la VPN no puede cambiar.
   Dentro del programa habla con el servicio por la pasarela de ZERO (static/escaner.js, OrbitaEscaner.pide):
     GET  /api/vpn             en qué está; desde la versión con salidas, también salida, desde, saludo, subidos, bajados,
                               postcuantica, dns_tunel y estricto;
     GET  /api/vpn/salidas     las salidas, con su retraso y la más rápida;
     GET  /api/vpn/comprueba   lo que ve una web: dirección, DNS, IPv6, hora y permiso de ubicación de Windows (la zona horaria
                               y el idioma del equipo, si el programa no los dice, los lee esta página, que está en él);
     POST /api/vpn/conecta     {"salida": "<id>" | "rapida"}, POST /api/vpn/desconecta y POST /api/vpn/estricto
                               {"estricto": true|false}: solo tras un clic de verdad (el cuerpo va en «cuerpo»).
   Con el programa de hoy, que solo tiene GET /api/vpn y sus campos de antes, se enseña lo que hay y nada más: su único servidor
   (vpn.guardianagroup.com, Helsinki; docs/VPN.md), sin lista, sin retrasos, sin direcciones y sin semáforo.
   Fuera del programa dice qué es y qué hace falta. Nada se inventa: cada cifra y cada dirección son del programa.
   Demostración local, para el diseño y las capturas (solo servida desde 127.0.0.1 o localhost, como las pruebas locales de
   Comunicaciones; nunca en la web publicada ni dentro del programa): ?demo=apagada|bloqueada|conectando|conectada|sin_respuesta|error|antigua.
   Español en la página; static/idioma.js lo enseña en el idioma de la pantalla. */
(() => {
  'use strict';
  const RAIZ = document.documentElement;
  const Q = new URLSearchParams(location.search);
  const LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname) && location.port !== '7443';
  const DEMO = LOCAL && /^(apagada|bloqueada|conectando|conectada|sin_respuesta|error|antigua)$/.test(Q.get('demo') || '') ? Q.get('demo') : '';
  const enPrograma = () => DEMO !== '' || RAIZ.dataset.enPrograma === '1';
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const lang = () => (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es';
  const loc = () => (window.GuardianaIdioma ? window.GuardianaIdioma.locale : undefined);
  const DESCARGA = '/instalar.html#descargar';
  // from here on the delay itself tells a website the person is far from the exit (ronda 91, §3)
  const LEJOS_MS = 100;

  // ---------- iconos y banderas ----------
  const SVG = (d, w) => '<svg width="' + (w || 16) + '" height="' + (w || 16) + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const I_ATRAS = SVG('<path d="M10 3.5 5.5 8l4.5 4.5"/>');
  const I_X = SVG('<path d="M4 4l8 8M12 4l-8 8"/>', 14);
  const I_VPN = SVG('<path d="M3 8a5 5 0 0 1 10 0M3 8a5 5 0 0 0 10 0"/><circle cx="8" cy="8" r="1.6"/>', 28);
  const I_RAYO = SVG('<path d="M8.8 1.8 4 9h3.7l-.6 5.2L12 7H8.3z"/>', 15);
  const I_OTRA = SVG('<path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.8v2.7h-2.7"/>', 13);
  // Drawn here, 24 × 16 and with nobody's logo: Windows shows flag emoji as two letters
  const BANDERAS = {
    FI: '<rect width="24" height="16" fill="#F4F6F8"/><rect x="6.7" width="4" height="16" fill="#003580"/><rect y="5.8" width="24" height="4.4" fill="#003580"/>',
    DE: '<rect width="24" height="5.4" fill="#151515"/><rect y="5.33" width="24" height="5.4" fill="#DD0000"/><rect y="10.66" width="24" height="5.34" fill="#FFCE00"/>',
    JP: '<rect width="24" height="16" fill="#F4F6F8"/><circle cx="12" cy="8" r="4.8" fill="#BC002D"/>',
    US: (() => {
      let s = '<rect width="24" height="16" fill="#F4F6F8"/>';
      for (let i = 0; i < 13; i += 2) s += '<rect y="' + (i * 16 / 13).toFixed(3) + '" width="24" height="' + (16 / 13).toFixed(3) + '" fill="#B22234"/>';
      s += '<rect width="10.4" height="8.62" fill="#3C3B6E"/>';
      for (let f = 0; f < 9; f++) for (let c = 0; c < (f % 2 ? 5 : 6); c++) s += '<circle cx="' + ((2 * c + (f % 2 ? 2 : 1)) * 10.4 / 12).toFixed(2) + '" cy="' + ((f + 1) * 8.62 / 10).toFixed(2) + '" r=".3" fill="#F4F6F8"/>';
      return s;
    })(),
  };

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
  // a name, an address or a figure: never translated (it is already in the language on screen)
  const dato = (s, cls, tag) => h(tag || 'span', { class: cls, translate: 'no' }, s);
  // Spanish in the page; static/idioma.js shows it in the language on screen and keeps the original for the next change
  function pon(el, s) { s = s || ''; if (el.dataset.es !== s) { el.dataset.es = s; el.textContent = s; } return el; }
  // a value that changes every second: only its text changes, so nothing else on the page has to look again
  function vivo(cls, tr) { const t = document.createTextNode(''); const e = h('span', { class: cls, translate: tr ? null : 'no' }); e.append(t); e.t = t; e.es = ''; return e; }
  const ponVivo = (e, s) => { if (e && e.t && e.es !== s) { e.es = s; e.t.data = s; } };
  function bandera(cc, cls) {
    const d = BANDERAS[cc];
    if (!d) return h('span', { class: 'vpn-bandera sin' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true', translate: 'no' }, cc || '');
    return h('span', { class: 'vpn-bandera' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 16" preserveAspectRatio="none" focusable="false">' + d + '</svg>' });
  }

  // ---------- lo que llega del programa, limpio ----------
  const RARO = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;
  const texto = (s, max) => (typeof s === 'string' ? s.replace(RARO, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 120) : '');
  const num = (x) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : null);
  const esHora = (ms) => { const v = num(ms); return v != null && v > 1e12 && v < 4e12; };
  const IP4 = /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  // the program's gateway hides addresses it should not pass («·»): only a whole address is shown
  const esIP = (s) => typeof s === 'string' && (IP4.test(s) || (/^[0-9a-f:]{3,39}$/i.test(s) && (s.match(/:/g) || []).length >= 2));
  const cc = (s) => (typeof s === 'string' && /^[A-Za-z]{2}$/.test(s) ? s.toUpperCase() : '');
  const ID = /^[a-z0-9_-]{1,24}$/;
  function salidaDe(x) {
    if (!x || typeof x !== 'object' || typeof x.id !== 'string' || !ID.test(x.id)) return null;
    const ms = num(x.ms);
    return { id: x.id, pais: cc(x.pais), ciudad: texto(x.ciudad, 60), continente: texto(x.continente, 30).toLowerCase(), proveedor: texto(x.proveedor, 40),
      nombre: texto(x.nombre, 80).toLowerCase(), ip: esIP(x.ip) ? x.ip : '', disponible: x.disponible !== false, ms: ms != null && ms < 60000 ? Math.round(ms) : null };
  }
  // Today's program (1.0.55) names only its server, always the same one: GUARDIANA's first exit (docs/VPN.md)
  const CONOCIDOS = { 'vpn.guardianagroup.com': { id: 'hel', pais: 'FI', ciudad: 'Helsinki', continente: 'europa', proveedor: 'Hetzner', nombre: 'vpn.guardianagroup.com', ip: '', disponible: true, ms: null } };
  function estadoDe(f) {
    const e = { disponible: f.disponible !== false, motivo: texto(f.motivo, 200), fase: texto(f.fase, 30).toLowerCase(), error: texto(f.error, 240), servidor: texto(f.servidor, 80).toLowerCase() };
    e.nueva = 'salida' in f; // a program with exits says «salida» always (null when off)
    e.salida = salidaDe(f.salida) || (!e.nueva && CONOCIDOS[e.servidor] ? Object.assign({}, CONOCIDOS[e.servidor]) : null);
    e.desde = esHora(f.desde) ? f.desde : esHora(f.desde_ms) ? f.desde_ms : null;
    e.saludo = esHora(f.saludo) ? f.saludo : esHora(f.ultimo_saludo_ms) ? f.ultimo_saludo_ms : null;
    e.subidos = num(f.subidos) != null ? f.subidos : num(f.enviados);
    e.bajados = num(f.bajados) != null ? f.bajados : num(f.recibidos);
    e.postcuantica = f.postcuantica === true; e.dnsTunel = f.dns_tunel === true;
    e.estricto = typeof f.estricto === 'boolean' ? f.estricto : null;
    e.desconectar = f.desconectar === true; // 1.0.56: the block is still in Windows (also after an error)
    return e;
  }
  function listaDe(j) {
    if (!j || typeof j !== 'object' || !Array.isArray(j.salidas)) return null;
    const vistas = new Set();
    const salidas = j.salidas.map(salidaDe).filter((s) => s && !vistas.has(s.id) && vistas.add(s.id)).slice(0, 60);
    const rapida = typeof j.mas_rapida === 'string' && salidas.some((s) => s.id === j.mas_rapida && s.disponible) ? j.mas_rapida : null;
    return { salidas, rapida };
  }
  // 5 Nov 2026: the program (1.0.56) says the computer's time zone and language as null: this page, on the same computer, reads
  // them itself (the time zone of Windows and the language a website is told), exactly what a website would read
  const zonaLocal = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) { return ''; } };
  const idiomaLocal = () => (typeof navigator !== 'undefined' && typeof navigator.language === 'string' ? navigator.language : '');
  function compruebaDe(j) {
    if (!j || typeof j !== 'object') return null;
    const z = j.zona && typeof j.zona === 'object' ? j.zona : {};
    const de = (v, ok) => (ok.includes(v) ? v : '');
    // 5 Nov 2026 (revisión de la 1.0.56): qué se mide de verdad y qué se deduce de la configuración del programa
    // («comprobado»: {ip, dns, ipv6}). Sin ese dato (una versión anterior del programa), el DNS y el IPv6 no se dan por
    // medidos: la pantalla dice «según la configuración», nunca «comprobado» de algo que no se comprobó.
    const k = j.comprobado && typeof j.comprobado === 'object' ? j.comprobado : {};
    const medido = { dns: k.dns === true, ipv6: k.ipv6 === true };
    return { medido, ip: esIP(j.ip_vista) ? j.ip_vista : '', pais: cc(j.pais_ip), dns: de(j.dns, ['tunel', 'fuera', 'desconocido']), ipv6: de(j.ipv6, ['bloqueado', 'fuga', 'sin_ipv6']),
      zona: texto(z.equipo, 60) || texto(zonaLocal(), 60), coincide: typeof z.coincide === 'boolean' ? z.coincide : null, idioma: texto(j.idioma, 40) || texto(idiomaLocal(), 40),
      ubicacion: de(j.ubicacion_windows, ['permitida', 'denegada', 'desconocida']) };
  }

  // ---------- nombres, en el idioma de la pantalla ----------
  const DN = {};
  const nombreDe = (tipo, c) => { try { const k = tipo + ':' + lang(); return (DN[k] || (DN[k] = new Intl.DisplayNames([lang()], { type: tipo }))).of(c) || ''; } catch (_) { return ''; } };
  const paisNombre = (c) => (c && c !== 'ZZ' && c !== 'XX' ? nombreDe('region', c) || c : '');
  const lugar = (s) => (s ? [paisNombre(s.pais), T(s.ciudad)].filter(Boolean).join(' · ') : '');
  const CONTINENTES = { europa: 'Europa', america: 'América', 'américa': 'América', asia: 'Asia', africa: 'África', 'áfrica': 'África', oceania: 'Oceanía', 'oceanía': 'Oceanía' };
  const continente = (c) => CONTINENTES[c] || (c ? c.charAt(0).toUpperCase() + c.slice(1) : '');
  function idiomaNombre(t) {
    if (!/^[a-z]{2,3}(?:[-_][A-Za-z0-9]{2,8}){0,3}$/.test(t)) return t;
    const n = nombreDe('language', t.replace(/_/g, '-'));
    return n ? n.charAt(0).toLocaleUpperCase(loc()) + n.slice(1) : t;
  }
  // a time zone's city where Spanish or Portuguese name it otherwise than the zone's own (IANA) name
  const ZONAS = {
    Bogota: ['Bogotá', 'Bogotá'], Mexico_City: ['Ciudad de México', 'Cidade do México'], New_York: ['Nueva York', 'Nova York'], Los_Angeles: ['Los Ángeles', 'Los Angeles'],
    Sao_Paulo: ['São Paulo', 'São Paulo'], Panama: ['Panamá', 'Panamá'], Asuncion: ['Asunción', 'Assunção'], Havana: ['La Habana', 'Havana'], Cancun: ['Cancún', 'Cancún'],
    Merida: ['Mérida', 'Mérida'], Lisbon: ['Lisboa', 'Lisboa'], London: ['Londres', 'Londres'], Paris: ['París', 'Paris'], Berlin: ['Berlín', 'Berlim'], Zurich: ['Zúrich', 'Zurique'],
    Vienna: ['Viena', 'Viena'], Rome: ['Roma', 'Roma'], Brussels: ['Bruselas', 'Bruxelas'], Copenhagen: ['Copenhague', 'Copenhague'], Stockholm: ['Estocolmo', 'Estocolmo'],
    Warsaw: ['Varsovia', 'Varsóvia'], Prague: ['Praga', 'Praga'], Athens: ['Atenas', 'Atenas'], Moscow: ['Moscú', 'Moscou'], Istanbul: ['Estambul', 'Istambul'],
    Canary: ['Canarias', 'Canárias'], Madrid: ['Madrid', 'Madri'], Helsinki: ['Helsinki', 'Helsinque'], Tokyo: ['Tokio', 'Tóquio'], Seoul: ['Seúl', 'Seul'],
    Singapore: ['Singapur', 'Singapura'], Jerusalem: ['Jerusalén', 'Jerusalém'], Cairo: ['El Cairo', 'Cairo'], Johannesburg: ['Johannesburgo', 'Joanesburgo'], Sydney: ['Sídney', 'Sydney'],
  };
  function zonaCiudad(z) {
    if (!/^[A-Za-z]+(?:\/[A-Za-z0-9_+-]+)+$/.test(z)) return z; // not a zone name: as the program says it
    const c = z.split('/').pop(), l = lang(), x = ZONAS[c];
    return x && (l === 'es' || l === 'pt') ? x[l === 'es' ? 0 : 1] : c.replace(/_/g, ' ');
  }
  function bytes(n) {
    let v = num(n); if (v == null) return '—';
    const u = ['B', 'kB', 'MB', 'GB', 'TB']; let i = 0;
    while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
    return (i ? v.toLocaleString(loc(), { maximumFractionDigits: v < 10 ? 1 : 0 }) : Math.round(v).toLocaleString(loc())) + ' ' + u[i];
  }
  const reloj = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 3600) + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const hace = (t) => { const s = Math.max(0, Math.round((Date.now() - t) / 1000)); return s < 5 ? 'hace un momento' : 'hace ' + (s < 60 ? s + ' s' : s < 3600 ? Math.floor(s / 60) + ' min' : Math.floor(s / 3600) + ' h'); };

  // ---------- la pasarela del programa (o la demostración local) ----------
  const pidePrograma = (m, r, t, primero, cuerpo) => (window.OrbitaEscaner && window.OrbitaEscaner.pide ? window.OrbitaEscaner.pide(m, r, t, primero, cuerpo) : Promise.resolve({ ok: false, motivo: 'tiempo' }));
  const pide = DEMO ? demostracion() : pidePrograma;

  // ---------- el estado ----------
  let E = null;                      // the VPN as the program last told it (estadoDe)
  let fallos = 0, motivoFallo = '';  // reads of /api/vpn that failed in a row, and why
  let L = null, lSoporte = '', lFallo = false, lEnVuelo = false, lPedida = 0;  // the exits (listaDe); lSoporte: '' | 'si' | 'no'
  let C = null, cSoporte = '', cFallo = false, cEnVuelo = false;               // what a website sees (compruebaDe), with .grupo and .t
  let elegida = 'rapida';            // the choice on screen: 'rapida' or an exit's id
  let pedida = null;                 // what this page asked for: { id }
  let aviso = null, ocupado = false, ocupadoEstricto = false, miraEnVuelo = false, faseVista = '';
  const FASES = ['conectando', 'conectada', 'sin_respuesta', 'reconectando', 'error'];
  const CON_TUNEL = (f) => f === 'conectada' || f === 'sin_respuesta' || f === 'reconectando';
  function fase() {
    if (!enPrograma()) return 'fuera';
    if (motivoFallo === 'version') return 'no_disponible';
    if (!E) return fallos ? 'sin_programa' : 'leyendo';
    if (fallos >= 3) return 'sin_programa';
    if (!E.disponible) return 'no_disponible';
    if (FASES.includes(E.fase)) return E.fase;
    return E.fase === 'apagada' || E.fase === 'desconectada' || !E.fase ? 'desconectada' : E.error ? 'error' : 'desconectada';
  }
  // what a website sees is read again whenever the tunnel is put up or taken down; a reading taken in the other state is not shown
  const grupo = (f) => (f === 'conectada' ? 'on' : f === 'desconectada' ? 'off' : '');
  const disponibles = () => (L ? L.salidas.filter((s) => s.disponible) : []);
  const porId = (id) => (L && L.salidas.find((s) => s.id === id)) || null;
  function eleccion() {
    if (lSoporte !== 'si' || !L) return lSoporte === 'no' ? '' : 'rapida';
    if (elegida === 'rapida' && L.rapida) return 'rapida';
    if (elegida !== 'rapida' && disponibles().some((s) => s.id === elegida)) return elegida;
    return L.rapida ? 'rapida' : (disponibles()[0] || {}).id || '';
  }
  // the exit on screen: the program's, or (while it starts) the one this page asked for
  function salidaVista() {
    if (E && E.salida) return E.salida;
    const f = fase();
    if (pedida && (f === 'conectando' || f === 'error') && pedida.id && pedida.id !== 'rapida') return porId(pedida.id);
    return null;
  }

  // ---------- la sección ----------
  let raiz = null, acc = null, cerrarBtn = null, volverBtn = null, idiomas = null, idiomasCasa = null;
  let abierto = false, antes = null, relojLectura = 0, relojVivo = 0;
  const V = {}; // the parts that change
  function monta() {
    if (raiz) return raiz;
    raiz = h('section', { class: 'escaner vpn', id: 'vpn', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'vpn-titulo', hidden: true });
    volverBtn = h('button', { type: 'button', class: 'esc-volver', html: I_ATRAS }); volverBtn.append(pon(h('span'), 'Inicio'));
    volverBtn.addEventListener('click', sal);
    const marca = h('div', { class: 'esc-logo' }, h('span', { class: 'g', translate: 'no' }, 'GUARDIANA'), h('span', { class: 'sep', 'aria-hidden': 'true', translate: 'no' }, '/'), h('span', { class: 'sub', translate: 'no' }, 'VPN'));
    cerrarBtn = h('button', { type: 'button', class: 'esc-cerrar', 'aria-label': 'Cerrar', title: 'Cerrar', html: I_X });
    cerrarBtn.addEventListener('click', sal);
    acc = h('div', { class: 'esc-acc' }, cerrarBtn);
    const barra = h('div', { class: 'esc-barra' }, volverBtn, marca, acc);

    // the card: the state on top, what belongs to it in the middle, the orders at the foot
    V.anillo = h('div', { class: 'vpn-anillo', 'aria-hidden': 'true' }, h('i'), h('i'), V.centro = h('b', { html: I_VPN }));
    V.k = h('p', { class: 'esc-k' }, 'VPN · Para Windows');
    V.titulo = h('h1', { id: 'vpn-titulo' });
    V.donde = h('p', { class: 'vpn-donde' });
    V.lead = h('p', { class: 'vpn-lead' });
    V.motivo = h('p', { class: 'vpn-lead vpn-motivo' });
    // a div, not a <header>: Órbita's own header styles apply to every <header> on the page
    const cab = h('div', { class: 'vpn-cab' }, V.anillo, h('div', { class: 'vpn-cab-txt' }, V.k, V.titulo, V.donde, V.lead, V.motivo));
    V.cuerpo = h('div', { class: 'vpn-cuerpo' });
    V.interruptor = h('button', { type: 'button', class: 'vpn-interruptor', role: 'switch', 'aria-checked': 'false', 'aria-labelledby': 'vpn-estricto-t', on: { click: cambiaEstricto } });
    V.estrictoValor = h('span', { class: 'vpn-estricto-v' });
    V.estricto = h('div', { class: 'vpn-estricto', hidden: true }, V.interruptor,
      h('div', null, h('p', { class: 'vpn-estricto-t' }, h('span', { id: 'vpn-estricto-t' }, 'Modo estricto'), V.estrictoValor),
        h('p', { class: 'vpn-estricto-d' }, 'Si la VPN se cae, no sale nada de tus programas de Windows fuera del túnel hasta que vuelva o la desconectes.'),
        h('p', { class: 'vpn-estricto-d vpn-estricto-limite' }, 'WSL y las máquinas virtuales (Hyper-V, Windows Sandbox, Docker) pueden sacar su tráfico fuera del túnel, también con el modo estricto.')));
    V.boton = h('button', { type: 'button', class: 'esc-boton vpn-boton', on: { click: () => orden(V.boton.dataset.orden) } }, h('span'));
    V.boton2 = h('button', { type: 'button', class: 'esc-otra vpn-boton2', hidden: true, on: { click: () => orden(V.boton2.dataset.orden) } }, h('span'));
    V.instalar = h('a', { class: 'esc-boton vpn-boton', href: DESCARGA, hidden: true }, h('span', null, 'Instalar GUARDIANA'));
    V.acciones = h('div', { class: 'vpn-acciones' }, V.boton2, V.boton, V.instalar);
    V.aviso = h('p', { class: 'vpn-aviso', role: 'status', 'aria-live': 'polite' });
    V.pie = h('div', { class: 'vpn-pie' }, V.estricto, V.acciones);
    V.tarjeta = h('article', { class: 'vpn-tarjeta', 'aria-labelledby': 'vpn-titulo' }, cab, V.cuerpo, V.pie, V.aviso);

    // what a website sees: a traffic light, and what nobody can promise
    V.webEstado = vivo('vpn-web-estado', true);
    V.webBoton = h('button', { type: 'button', class: 'vpn-comprobar', html: I_OTRA, on: { click: () => comprueba(true) } }); V.webBoton.append(h('span', null, 'Comprobar de nuevo'));
    V.webSub = h('p', { class: 'vpn-web-sub' });
    V.luces = h('ul', { class: 'vpn-luces' });
    V.web = h('section', { class: 'vpn-web', 'aria-labelledby': 'esc-h-vpn-web', hidden: true },
      h('div', { class: 'vpn-web-cab' }, h('div', null, h('h2', { id: 'esc-h-vpn-web' }, 'Lo que una web verá'), V.webSub), h('div', { class: 'vpn-web-acc' }, V.webEstado, V.webBoton)),
      V.luces,
      h('p', { class: 'vpn-honesto' }, 'Con la VPN conectada, las webs ven la dirección del servidor de GUARDIANA, no la tuya; lo que sí pueden notar, por el retraso, es que usas una VPN.'));

    const hechos = h('div', { class: 'esc-hechos vpn-hechos' },
      h('div', { class: 'esc-hecho' }, h('b', null, 'Encriptado hasta el servidor'), h('span', null, 'Lo que sale de tus programas de Windows viaja encriptado con WireGuard hasta el servidor de GUARDIANA; las webs ven la dirección del servidor, no la tuya.')),
      h('div', { class: 'esc-hecho' }, h('b', null, 'Corte en el propio Windows'), h('span', null, 'De tus programas de Windows no sale nada fuera del túnel, salvo los paquetes encriptados hacia el servidor y lo imprescindible de la red local, como DHCP o el Modo Hogar de tu casa. Lo corta Windows (Filtering Platform). WSL y las máquinas virtuales van aparte.')),
      h('div', { class: 'esc-hecho' }, h('b', null, 'Clave postcuántica'), h('span', null, 'Además de la clave clásica de WireGuard, una clave compartida acordada con ML-KEM-768, nueva en cada conexión.')));
    const limites = h('div', { class: 'vpn-limites' }, h('h2', { class: 'esc-rot' }, 'Lo que no hace'),
      h('p', null, 'No oculta quién eres ante las webs donde inicias sesión, ni frena el phishing ni a quien entrega su contraseña.'),
      h('p', null, 'El servidor de GUARDIANA ve adónde va tu tráfico, como en cualquier VPN. Qué guarda y qué no se publicará con su código, dentro del sello; hasta entonces no se promete nada.'),
      h('p', null, 'Incluida en la licencia de GUARDIANA, sin cuenta aparte. La biblioteca de WireGuardNT va firmada por WireGuard LLC, tal cual la publica, y el programa comprueba su huella antes de cargarla.'));
    const demo = DEMO ? h('p', { class: 'vpn-demo' }, h('span', { class: 'esc-marca fuerte' }, 'Demostración local'), ' ', h('span', null, 'Datos de ejemplo, no del programa.')) : null;
    const hoja = h('div', { class: 'esc-hoja vpn-hoja' }, demo, V.tarjeta, V.web, hechos, limites);
    raiz.append(h('div', { class: 'esc-fondo', 'aria-hidden': 'true' }), barra, h('div', { class: 'esc-cuerpo', tabindex: '-1' }, hoja));
    document.body.appendChild(raiz);
    pinta();
    return raiz;
  }

  // ---------- pintar ----------
  const TITULO = { leyendo: 'Leyendo el estado…', sin_programa: 'Sin respuesta del programa', no_disponible: 'No disponible en este equipo', desconectada: 'Desconectada',
    conectando: 'Conectando…', conectada: 'Conectada', sin_respuesta: 'El servidor no contesta', reconectando: 'Reconectando…', error: 'No se pudo conectar', fuera: 'La VPN de GUARDIANA' };
  const MOTIVO_LECTURA = { tiempo: 'El programa no respondió a tiempo.', sin_panel: 'El panel del programa no está abierto.', sesion: 'El panel del programa no tiene una sesión válida.',
    red: 'El panel no pudo hablar con su servicio.', ilegible: 'El programa contestó algo que no se puede leer.' };
  function titulo(f, s) {
    if (f === 'conectada' && s) return 'Conectada a ' + lugar(s);
    if (f === 'conectando') return s ? 'Conectando a ' + lugar(s) + '…' : pedida && pedida.id === 'rapida' ? 'Conectando a la salida más rápida…' : 'Conectando…';
    // 6 Nov 2026: as the icon next to the clock says it («VPN parada, con su bloqueo puesto»)
    if (f === 'desconectada' && E && E.desconectar === true) return 'Parada, con su bloqueo puesto';
    return TITULO[f] || 'Desconectada';
  }
  function lead(f) {
    switch (f) {
      case 'fuera': return 'Un túnel encriptado desde este equipo hasta un servidor de GUARDIANA, con corte si cae y clave postcuántica. Va dentro del mismo programa que el Antivirus, el navegador y Comunicaciones.';
      case 'sin_programa': return [MOTIVO_LECTURA[motivoFallo] || 'Esta página no pudo leer el estado de la VPN en el programa.', 'Se vuelve a intentar cada pocos segundos.'];
      case 'no_disponible': return motivoFallo === 'version' ? 'La versión instalada del programa aún no trae la VPN.' : E && E.motivo ? '' : 'El programa no puede abrir el túnel aquí.';
      case 'desconectada': return E && E.desconectar === true ? 'El bloqueo sigue puesto en Windows: no sale nada de tus programas de Windows fuera del túnel. «Desconectar» lo quita y vuelve a tu conexión normal.' : lSoporte === 'si' ? 'Elige el país de salida y conecta: las webs verán la dirección de ese servidor, no la tuya.' : 'Al conectar, lo que salga de tus programas de Windows irá encriptado hasta el servidor de GUARDIANA, y las webs verán su dirección, no la tuya.';
      case 'conectando': return 'Llaves nuevas, alta en el servidor, túnel y corte; después, el primer saludo del servidor. Unos segundos.';
      case 'conectada': return 'Lo que sale de tus programas de Windows hacia internet va por el túnel, encriptado hasta el servidor.';
      case 'sin_respuesta': return E && E.estricto === true ? 'Modo estricto: no sale nada de tus programas de Windows fuera del túnel hasta que el servidor vuelva o desconectes la VPN.' : 'Mientras tanto, no sale nada de tus programas de Windows fuera del túnel. Para volver a tu conexión normal, desconecta; cuando el servidor vuelva, podrás conectar de nuevo.';
      case 'reconectando': return 'El servidor dejó de contestar: GUARDIANA pide un alta nueva y rehace el túnel. Mientras tanto, no sale nada de tus programas de Windows fuera de él. Si prefieres volver a tu conexión normal, desconecta.';
      case 'error': return E && E.estricto === true ? 'Modo estricto: no sale nada de tus programas de Windows fuera del túnel hasta que la VPN conecte o la desconectes.' : E && E.desconectar === true ? 'El bloqueo sigue puesto en Windows: no sale nada de tus programas de Windows fuera del túnel. «Desconectar» lo quita y vuelve a tu conexión normal.' : 'El equipo quedó como estaba: sin túnel y sin corte.';
      default: return '';
    }
  }
  function pinta() {
    if (!raiz) return;
    const f = fase(), s = salidaVista(), conTunel = CON_TUNEL(f);
    raiz.dataset.fase = f; V.tarjeta.dataset.fase = f;
    // 6 Nov 2026: red whenever nothing of the computer's programs goes out (its server silent, or the block still in Windows),
    // as the icon next to the clock and ZERO's chip paint it
    V.tarjeta.dataset.bloqueo = f === 'sin_respuesta' || f === 'reconectando' || (E && E.desconectar === true && f !== 'conectada' && f !== 'conectando' && f !== 'sin_programa') ? '1' : '';
    // the ring: the exit's flag once there is one, the tunnel before
    const centro = s && f !== 'desconectada' ? 'b:' + s.pais : 'vpn';
    if (V.centro.dataset.de !== centro) { V.centro.dataset.de = centro; V.centro.textContent = ''; if (centro === 'vpn') V.centro.innerHTML = I_VPN; else V.centro.append(bandera(s.pais, 'grande')); }
    pon(V.titulo, titulo(f, s));
    // where it is, when the title does not say it already: the place, «servidor real en …», the provider and the server's name
    const firmaDonde = f + '|' + (s ? s.id + s.pais + s.ciudad + s.proveedor + s.nombre : '') + '|' + lang();
    if (V.donde.dataset.firma !== firmaDonde) {
      V.donde.dataset.firma = firmaDonde; V.donde.textContent = '';
      if (s && (conTunel || f === 'conectando' || f === 'error')) {
        const partes = [];
        if (f !== 'conectada' && f !== 'conectando') partes.push(dato(lugar(s), 'fuerte'));
        if (s.ciudad) partes.push(h('span', null, 'servidor real en ' + T(s.ciudad)));
        if (s.proveedor) partes.push(dato(s.proveedor));
        if (s.nombre) partes.push(dato(s.nombre, 'mono'));
        partes.forEach((p, i) => { if (i) V.donde.append(h('span', { class: 'sep', 'aria-hidden': 'true', translate: 'no' }, '·')); V.donde.append(p); });
      }
      V.donde.hidden = !V.donde.firstChild;
    }
    // the lead: one sentence per piece, so that each one is translated whole
    const frases = [].concat(lead(f) || []).filter(Boolean), firmaLead = frases.join('\n');
    if (V.lead.dataset.firma !== firmaLead) {
      V.lead.dataset.firma = firmaLead; V.lead.textContent = '';
      frases.forEach((x, i) => { if (i) V.lead.append(' '); V.lead.append(h('span', null, x)); });
      V.lead.hidden = !frases.length;
    }
    // the program's own words, when it says why
    const motivo = f === 'no_disponible' && E && E.motivo && motivoFallo !== 'version' ? E.motivo : (f === 'error' || f === 'reconectando') && E && E.error ? E.error : '';
    if (V.motivo.dataset.firma !== motivo) {
      V.motivo.dataset.firma = motivo; V.motivo.textContent = '';
      if (motivo) V.motivo.append(h('span', { class: 'k' }, 'Motivo'), ' ', h('span', null, motivo));
      V.motivo.hidden = !motivo;
    }
    pintaCuerpo(f, s);
    pintaPie(f);
    pintaWeb(f, s);
    actualizaVivos();
  }

  // the middle of the card, rebuilt only when what it shows changes
  function pintaCuerpo(f, s) {
    let firma = f + '|' + lang();
    if (f === 'desconectada' || f === 'error') firma += '|' + lSoporte + '|' + lFallo + '|' + JSON.stringify(L);
    else if (f === 'conectada') firma += '|' + JSON.stringify(s) + '|' + (E ? [E.postcuantica, E.dnsTunel] : '') + '|' + (C && C.grupo === 'on' ? [C.ip, C.pais, C.ipv6] : '') + '|' + cSoporte + '|' + !!E.desde;
    else if (f === 'sin_respuesta' || f === 'reconectando') firma += '|' + !!(E && E.saludo) + '|' + !!(E && E.desde);
    if (V.cuerpo.dataset.firma === firma) return;
    // keep the focus on the same choice when the list is drawn again
    const foco = V.cuerpo.contains(document.activeElement) && document.activeElement.name === 'vpn-salida' ? document.activeElement.value : null;
    V.cuerpo.dataset.firma = firma; V.cuerpo.textContent = ''; V.vivos = {};
    let dentro = null;
    if (f === 'fuera') dentro = fuera();
    else if (f === 'desconectada' || f === 'error') dentro = eligeSalida();
    else if (f === 'conectada') dentro = detalles(s);
    else if (f === 'sin_respuesta' || f === 'reconectando') dentro = sinRespuesta();
    if (dentro) V.cuerpo.append(dentro);
    V.cuerpo.hidden = !dentro;
    if (foco) { const i = V.cuerpo.querySelector('input[name="vpn-salida"][value="' + foco + '"]'); if (i) i.focus({ preventScroll: true }); }
  }
  function fuera() {
    return h('div', { class: 'vpn-fuera' },
      h('p', null, 'La VPN va dentro del programa GUARDIANA para Windows: una web no puede abrir un túnel por sí sola. Una vez instalado, abre el programa y elige «VPN» en la portada.'),
      h('p', { class: 'vpn-fuera-salida' }, bandera('FI'), h('span', null, 'La primera salida está en Helsinki (Finlandia): un servidor real de GUARDIANA, no una ubicación virtual.')));
  }
  function filaSalida(s, conRadio) {
    const lejos = s.disponible && s.ms != null && s.ms >= LEJOS_MS;
    const dcha = !conRadio ? null : !s.disponible ? h('span', { class: 'esc-marca' }, 'Próximamente') : s.ms != null ? dato(s.ms + ' ms', 'vpn-ms' + (lejos ? ' lejos' : '')) : h('span', { class: 'vpn-ms nd' }, 'sin medir');
    const sub = h('span', { class: 'vpn-op-sub' });
    if (s.ciudad) sub.append(h('span', null, 'servidor real en ' + T(s.ciudad)));
    if (s.proveedor) sub.append(h('span', { class: 'sep', 'aria-hidden': 'true', translate: 'no' }, '·'), dato(s.proveedor));
    const cuerpoFila = [bandera(s.pais), h('span', { class: 'vpn-op-txt' }, dato(lugar(s) || s.id, 'vpn-op-nom'), sub, lejos ? h('span', { class: 'vpn-lejos' }, 'Las webs pueden notar por el retraso que estás lejos.') : null), dcha ? h('span', { class: 'vpn-op-dcha' }, dcha) : null];
    if (!conRadio) return h('div', { class: 'vpn-op fija' }, cuerpoFila);
    const input = h('input', { type: 'radio', name: 'vpn-salida', value: s.id, disabled: !s.disponible, on: { change: () => { elegida = s.id; } } });
    return h('label', { class: 'vpn-op' + (s.disponible ? '' : ' no') }, input, h('span', { class: 'vpn-radio', 'aria-hidden': 'true' }), cuerpoFila);
  }
  function eligeSalida() {
    if (lSoporte === 'no') {
      // today's program: one server, always the same
      const s = CONOCIDOS['vpn.guardianagroup.com'];
      return h('div', { class: 'vpn-elige' }, h('p', { class: 'vpn-rot' }, 'Servidor'), h('div', { class: 'vpn-una' }, filaSalida(s, false)),
        h('p', { class: 'vpn-nota' }, 'Esta versión del programa conecta siempre a este servidor.'));
    }
    if (!L) {
      if (lFallo) return h('div', { class: 'vpn-elige' }, h('p', { class: 'vpn-nota aviso' }, 'No se pudo leer la lista de salidas. Se vuelve a intentar en unos segundos; «Conectar» usa la más rápida.'));
      return h('div', { class: 'vpn-elige', 'aria-busy': 'true' }, h('p', { class: 'vpn-rot' }, 'Elige la salida'), h('div', { class: 'esc-espera', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
    }
    const sel = eleccion();
    const rap = L.rapida ? porId(L.rapida) : null;
    const rInput = h('input', { type: 'radio', name: 'vpn-salida', value: 'rapida', disabled: !rap, on: { change: () => { elegida = 'rapida'; } } });
    const rDcha = rap ? h('span', { class: 'vpn-rapida-a' }, bandera(rap.pais), dato(T(rap.ciudad) + (rap.ms != null ? ' · ' + rap.ms + ' ms' : ''), 'vpn-ms')) : h('span', { class: 'vpn-ms nd' }, 'Sin medida todavía');
    const rapida = h('label', { class: 'vpn-op vpn-op-rapida' + (rap ? '' : ' no') }, rInput, h('span', { class: 'vpn-radio', 'aria-hidden': 'true' }),
      h('span', { class: 'vpn-rayo', html: I_RAYO, 'aria-hidden': 'true' }),
      h('span', { class: 'vpn-op-txt' }, h('span', { class: 'vpn-op-nom' }, 'El más rápido'), h('span', { class: 'vpn-op-sub' }, 'El programa mide el retraso hasta cada salida y elige la más cercana.')), rDcha);
    // the continents, in the program's order; in each, the ones that work first
    const grupos = new Map();
    for (const s of L.salidas) { const k = s.continente || '·'; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(s); }
    const bloques = [...grupos].map(([k, xs]) => h('div', { class: 'vpn-grupo', role: 'group', 'aria-label': continente(k) || null },
      k !== '·' ? h('p', { class: 'vpn-rot' }, continente(k)) : null,
      [...xs.filter((s) => s.disponible), ...xs.filter((s) => !s.disponible)].map((s) => filaSalida(s, true))));
    const caja = h('div', { class: 'vpn-elige', role: 'radiogroup', 'aria-labelledby': 'vpn-elige-t' },
      h('p', { class: 'vpn-rot', id: 'vpn-elige-t' }, 'Elige la salida'), rapida, h('div', { class: 'vpn-grupos' }, bloques),
      disponibles().length ? null : h('p', { class: 'vpn-nota aviso' }, 'Ninguna salida está disponible ahora.'));
    const marcada = caja.querySelector('input[value="' + sel + '"]'); if (marcada) marcada.checked = true;
    elegida = sel || elegida;
    return caja;
  }
  function detalles(s) {
    const W = V.vivos;
    // what websites see: the address a website saw, checked from this computer; or the server's while that check comes
    const ver = h('div', { class: 'vpn-ver-a' }, h('p', { class: 'k' }, 'Las webs ven'));
    const cOn = C && C.grupo === 'on' ? C : null;
    const ip = cOn && cOn.ip ? cOn.ip : s && s.ip ? s.ip : '';
    const pais = cOn && cOn.pais ? cOn.pais : ip && s ? s.pais : '';
    if (ip) ver.append(h('p', { class: 'v' }, dato(ip, 'ip'), pais ? dato(' (' + paisNombre(pais) + ')', 'pais') : null));
    else ver.append(h('p', { class: 'v texto' }, 'La dirección del servidor de GUARDIANA, no la tuya.'));
    W.comprobado = h('p', { class: 's' }); ver.append(W.comprobado);
    const fuga = cOn && cOn.ipv6 === 'fuga';
    const real = h('div', { class: 'vpn-ver-b' + (fuga ? ' alerta' : '') }, h('p', { class: 'k' }, 'Tu dirección real'), h('p', { class: 'v' }, fuga ? 'Podría verse por IPv6' : 'Oculta'));
    W.reloj = vivo('v num'); W.subidos = vivo('v num'); W.bajados = vivo('v num');
    const cifras = h('div', { class: 'vpn-cifras' },
      E && E.desde ? h('div', null, h('p', { class: 'k' }, 'Tiempo conectada'), W.reloj) : null,
      h('div', null, h('p', { class: 'k' }, 'Enviados'), W.subidos),
      h('div', null, h('p', { class: 'k' }, 'Recibidos'), W.bajados));
    const filas = h('dl', { class: 'vpn-filas' },
      h('div', null, h('dt', null, 'Encriptación'), h('dd', null, E && E.postcuantica ? 'WireGuard con capa postcuántica' : dato('WireGuard'))),
      E && E.dnsTunel ? h('div', null, h('dt', null, 'DNS'), h('dd', null, 'Dentro del túnel')) : null);
    return h('div', { class: 'vpn-detalles' }, h('div', { class: 'vpn-ver' }, ver, real), cifras, filas);
  }
  function sinRespuesta() {
    const W = V.vivos;
    W.saludo = vivo('v', true); W.reloj = vivo('v num');
    return h('dl', { class: 'vpn-filas vpn-problema' },
      E && E.saludo ? h('div', null, h('dt', null, 'Último saludo del servidor'), h('dd', null, W.saludo)) : null,
      E && E.desde ? h('div', null, h('dt', null, 'Tiempo conectada'), h('dd', null, W.reloj)) : null);
  }
  // what changes every second: the time connected, the bytes, «hace …»
  function actualizaVivos() {
    const W = V.vivos || {};
    if (E && E.desde) ponVivo(W.reloj, reloj(Date.now() - E.desde));
    if (E) { ponVivo(W.subidos, bytes(E.subidos)); ponVivo(W.bajados, bytes(E.bajados)); }
    if (E && E.saludo) ponVivo(W.saludo, hace(E.saludo));
    if (W.comprobado) {
      const c = C && C.grupo === 'on' && C.ip ? C : null;
      pon(W.comprobado, cEnVuelo ? 'Comprobando…' : c ? 'Comprobado desde este equipo' : '');
      W.comprobado.hidden = !W.comprobado.textContent;
    }
    if (V.webEstado && !V.web.hidden) ponVivo(V.webEstado, cEnVuelo ? 'Comprobando…' : C && C.t ? hace(C.t) : '');
  }

  // the foot of the card: strict mode and the orders
  function pintaPie(f) {
    const hayEstricto = !!E && E.estricto !== null && f !== 'fuera' && f !== 'no_disponible' && f !== 'sin_programa' && f !== 'leyendo';
    V.estricto.hidden = !hayEstricto;
    if (hayEstricto) {
      V.interruptor.setAttribute('aria-checked', String(E.estricto));
      V.interruptor.disabled = ocupadoEstricto || ocupado || f === 'conectando';
      pon(V.estrictoValor, E.estricto ? 'Activado' : 'Desactivado');
      V.estricto.classList.toggle('on', E.estricto);
    }
    let o1 = '', t1 = '', o2 = '';
    if (f === 'desconectada') { o1 = 'conecta'; t1 = 'Conectar'; if (E && E.desconectar === true) o2 = 'desconecta'; }
    else if (f === 'error') { o1 = 'conecta'; t1 = 'Conectar'; if (E && (E.estricto === true || E.desconectar === true)) o2 = 'desconecta'; }
    else if (f === 'conectando') { o1 = 'nada'; t1 = 'Conectando…'; }
    else if (CON_TUNEL(f)) { o1 = 'desconecta'; t1 = 'Desconectar'; }
    V.boton.hidden = !o1; V.boton.dataset.orden = o1;
    pon(V.boton.querySelector('span'), ocupado && o1 === 'desconecta' ? 'Desconectando…' : t1);
    const sinSalida = o1 === 'conecta' && lSoporte === 'si' && L && !disponibles().length;
    V.boton.disabled = o1 === 'nada' || ocupado || sinSalida;
    V.boton.classList.toggle('secundario', o1 === 'desconecta');
    V.boton2.hidden = !o2; V.boton2.dataset.orden = o2; pon(V.boton2.querySelector('span'), o2 ? 'Desconectar' : ''); V.boton2.disabled = ocupado;
    V.instalar.hidden = f !== 'fuera';
    V.pie.hidden = V.estricto.hidden && V.boton.hidden && V.boton2.hidden && V.instalar.hidden;
    const firmaAviso = aviso ? JSON.stringify(aviso) : '';
    if (V.aviso.dataset.firma !== firmaAviso) {
      V.aviso.dataset.firma = firmaAviso; V.aviso.textContent = '';
      if (aviso) { if (aviso.t) V.aviso.append(h('span', null, aviso.t)); if (aviso.m) V.aviso.append(' ', h('span', { class: 'm', translate: aviso.propio ? 'no' : null }, aviso.m)); }
      V.aviso.hidden = !aviso;
    }
  }

  // ---------- lo que una web verá ----------
  function luces(f, s) {
    const g = grupo(f), on = g === 'on';
    if (!C || C.grupo !== g) return null;
    const L1 = [], fila = (n, k, v, t, vTexto) => L1.push({ n, k, v, t, vTexto });
    // the address and its country
    if (C.ip || C.pais) {
      const v = [C.ip, paisNombre(C.pais)].filter(Boolean).join(' · ');
      if (!on) fila('aviso', 'Dirección IP', v, 'Es tu dirección real: sin VPN, las webs la ven.');
      else if (C.ip && s && s.ip && C.ip !== s.ip) fila('alerta', 'Dirección IP', v, 'No es la del servidor de la VPN.');
      else if (C.pais && s && s.pais && C.pais !== s.pais) fila('aviso', 'Dirección IP', v, 'Es la del servidor, pero las bases de datos de direcciones la sitúan en otro país.');
      else fila('ok', 'Dirección IP', v, 'La del servidor de la VPN, no la tuya.');
    } else fila('nd', 'Dirección IP', '', 'No se pudo comprobar.');
    // DNS and IPv6: about the tunnel, so only with it up
    if (!on) { fila('nd', 'DNS', '', 'Se comprueba con la VPN conectada.'); fila('nd', 'IPv6', '', 'Se comprueba con la VPN conectada.'); }
    else {
      // whole sentences, never composed: each one has its translation (revisión web, 5 nov 2026)
      const md = !!(C.medido && C.medido.dns), m6 = !!(C.medido && C.medido.ipv6);
      if (C.dns === 'tunel') fila('ok', 'DNS', 'Dentro del túnel', md ? 'Los nombres de las webs se resuelven en el servidor, no en tu proveedor de internet.' : 'Según la configuración de la VPN: los nombres de las webs se resuelven en el servidor, no en tu proveedor de internet.', true);
      else if (C.dns === 'fuera') fila('alerta', 'DNS', 'Fuera del túnel', md ? 'Tu proveedor de internet podría ver qué webs visitas.' : 'Según la configuración de la VPN: tu proveedor de internet podría ver qué webs visitas.', true);
      else fila('nd', 'DNS', '', 'No se pudo comprobar.');
      if (C.ipv6 === 'bloqueado') fila('ok', 'IPv6', 'Bloqueado', m6 ? 'Tus programas de Windows no sacan nada por IPv6 fuera del túnel.' : 'Según la configuración de la VPN: tus programas de Windows no sacan nada por IPv6 fuera del túnel.', true);
      else if (C.ipv6 === 'sin_ipv6') fila('ok', 'IPv6', 'Tu red no usa IPv6', '', true);
      else if (C.ipv6 === 'fuga') fila('alerta', 'IPv6', 'Sale fuera del túnel', m6 ? 'Una web podría ver tu dirección IPv6 real.' : 'Según la configuración de la VPN: una web podría ver tu dirección IPv6 real.', true);
      else fila('nd', 'IPv6', '', 'No se pudo comprobar.');
    }
    // the computer's clock and language: the VPN does not change them
    if (C.zona) {
      const z = zonaCiudad(C.zona), p = s ? paisNombre(s.pais) : '';
      if (on && C.coincide === false) { if (p) fila('aviso', 'Hora del PC', '', 'La hora de tu PC es de ' + z + ': una web podría notar que no estás en ' + p + '.'); else fila('aviso', 'Hora del PC', z, 'Una web podría notar que no estás en el país de la salida.'); }
      else if (on && C.coincide === true) fila('ok', 'Hora del PC', z, 'Coincide con la de la salida.');
      else fila('info', 'Hora del PC', z, 'Las webs la ven; la VPN no la cambia.');
    } else fila('nd', 'Hora del PC', '', 'No se pudo leer.');
    if (C.idioma) fila('info', 'Idioma', idiomaNombre(C.idioma), 'Las webs lo ven; la VPN no lo cambia.');
    if (C.ubicacion === 'permitida') fila('aviso', 'Ubicación de Windows', 'Permitida', 'Un programa al que se la des puede saber dónde estás, con o sin VPN.', true);
    else if (C.ubicacion === 'denegada') fila('ok', 'Ubicación de Windows', 'Denegada', 'Los programas no pueden pedírsela a Windows.', true);
    else fila('nd', 'Ubicación de Windows', '', 'No se pudo leer.');
    return L1;
  }
  const NOMBRE_LUZ = { ok: 'Bien', aviso: 'Atención', alerta: 'Problema', info: 'Información', nd: 'Sin comprobar' };
  function pintaWeb(f, s) {
    const g = grupo(f);
    V.web.hidden = !g;
    if (!g) return;
    const todoMedido = !!(C && C.medido && C.medido.dns && C.medido.ipv6);
    pon(V.webSub, g === 'on' ? (todoMedido ? 'Con la VPN conectada, comprobado desde este equipo.' : 'Con la VPN conectada: la dirección, comprobada desde este equipo; el DNS y el IPv6, según la configuración.') : 'Ahora, sin VPN.');
    V.webBoton.hidden = cSoporte !== 'si'; V.webBoton.disabled = cEnVuelo;
    const filas = cSoporte === 'si' ? luces(f, s) : null;
    const firma = g + '|' + lang() + '|' + cSoporte + '|' + cFallo + '|' + cEnVuelo + '|' + JSON.stringify(filas);
    if (V.luces.dataset.firma === firma) return;
    V.luces.dataset.firma = firma; V.luces.textContent = '';
    if (cSoporte === 'no') { V.luces.append(h('li', { class: 'vpn-luz vacia' }, h('span', null, 'Esta versión del programa aún no lo comprueba.'))); return; }
    if (!filas) {
      V.luces.append(h('li', { class: 'vpn-luz vacia' }, cEnVuelo || !cSoporte ? h('div', { class: 'esc-espera', 'aria-hidden': 'true' }, h('i'), h('i')) : h('span', null, cFallo ? 'No se pudo comprobar. Vuelve a intentarlo en unos segundos.' : 'Comprobando…')));
      return;
    }
    for (const r of filas) {
      const v = r.v ? (r.vTexto ? h('b', null, r.v) : dato(r.v, null, 'b')) : null;
      V.luces.append(h('li', { class: 'vpn-luz ' + r.n }, h('i', { role: 'img', 'aria-label': NOMBRE_LUZ[r.n] }), h('span', { class: 'k' }, r.k),
        h('span', { class: 'v' }, v, v && r.t ? h('span', { class: 'sep', 'aria-hidden': 'true', translate: 'no' }, '—') : null, r.t ? h('span', null, r.t) : null)));
    }
  }

  // ---------- leer ----------
  async function mira() {
    if (!abierto || !enPrograma() || miraEnVuelo) return;
    miraEnVuelo = true;
    const r = await pide('GET', '/api/vpn', 8000);
    miraEnVuelo = false;
    if (!abierto) return;
    if (r && r.ok && r.json && typeof r.json === 'object') { E = estadoDe(r.json); fallos = 0; motivoFallo = ''; }
    else { fallos++; motivoFallo = r && (r.estado === 403 || r.estado === 404) ? 'version' : (r && r.motivo) || 'tiempo'; }
    tras();
  }
  // a change of state: what a website saw before no longer holds, and the exits are read again
  function tras() {
    const f = fase();
    if (f !== faseVista) {
      const antes0 = faseVista; faseVista = f;
      if (f === 'conectada' || f === 'desconectada') {
        if (C && C.grupo !== grupo(f)) C = null;
        if (antes0 && antes0 !== 'leyendo') setTimeout(() => comprueba(false), f === 'conectada' ? 1200 : 1500);
      }
      if (f === 'desconectada' && antes0 && antes0 !== 'leyendo') { pedida = null; setTimeout(() => leeSalidas(true), 600); }
    }
    pinta();
  }
  async function leeSalidas(forzar) {
    if (!abierto || !enPrograma() || lEnVuelo || lSoporte === 'no') return;
    if (!forzar && Date.now() - lPedida < 30000) return;
    lEnVuelo = true; lPedida = Date.now();
    const r = await pide('GET', '/api/vpn/salidas', 20000);
    lEnVuelo = false;
    if (r && r.ok) { const l = listaDe(r.json); if (l) { L = l; lSoporte = 'si'; lFallo = false; } else lFallo = true; }
    else if (r && (r.estado === 403 || r.estado === 404)) lSoporte = 'no';
    else { lFallo = true; lPedida = Date.now() - 22000; } // again in about 8 s
    if (abierto) pinta();
  }
  async function comprueba(forzar) {
    if (!abierto || !enPrograma() || cEnVuelo || cSoporte === 'no') return;
    const g = grupo(fase()); if (!g) return;
    if (!forzar && C && C.grupo === g) return;
    cEnVuelo = true; cFallo = false; pinta();
    const r = await pide('GET', '/api/vpn/comprueba', 25000);
    cEnVuelo = false;
    if (r && r.ok) {
      const c = compruebaDe(r.json);
      if (c) { cSoporte = 'si'; if (grupo(fase()) === g) C = Object.assign(c, { grupo: g, t: Date.now() }); else setTimeout(() => comprueba(false), 600); }
      else cFallo = true;
    } else if (r && (r.estado === 403 || r.estado === 404)) cSoporte = 'no';
    else { cFallo = true; if (!cSoporte) cSoporte = 'si'; }
    if (abierto) pinta();
  }
  // every 3 s while it is open and on screen: the state; the exits now and then while there is no tunnel
  function late() {
    if (!abierto || document.hidden) return;
    mira();
    const f = fase();
    if (f === 'desconectada' || f === 'error') leeSalidas(false);
  }

  // ---------- las órdenes: solo tras un clic de verdad ----------
  function resultado(r) {
    const j = r && r.json && typeof r.json === 'object' ? r.json : null;
    if (r && r.ok && j && j.ok === true) aviso = null;
    else if (r && r.estado === 428) aviso = { t: 'El programa solo acepta la orden justo después de pulsar: vuelve a pulsar.' };
    // 1.0.55: connecting is Plus once the trial ends; the program sends its own line, already in the person's language
    else if (r && r.estado === 402 && j && typeof j.texto === 'string' && texto(j.texto, 300)) aviso = { t: '', m: texto(j.texto, 300), propio: true };
    else aviso = { t: 'No se pudo.', m: j && typeof j.motivo === 'string' && texto(j.motivo, 200) ? texto(j.motivo, 200) : r && r.motivo === 'tiempo' ? 'El programa no respondió a tiempo.' : 'El programa no lo permitió.' };
  }
  async function orden(o) {
    const f = fase();
    if (ocupado || !o || o === 'nada') return;
    if (o === 'conecta' && (f === 'desconectada' || f === 'error')) {
      const id = eleccion();
      ocupado = true; pedida = { id: id || 'rapida' }; aviso = { t: 'Abriendo el túnel…' }; pinta();
      const r = await pide('POST', '/api/vpn/conecta', 15000, true, JSON.stringify({ salida: id || 'rapida' }));
      ocupado = false; resultado(r);
    } else if (o === 'desconecta' && (CON_TUNEL(f) || f === 'error' || (f === 'desconectada' && E && E.desconectar === true))) {
      ocupado = true; aviso = { t: 'Cerrando el túnel…' }; pinta();
      // closing while the program reconnects can wait for the attempt under way (up to some 25 seconds)
      const r = await pide('POST', '/api/vpn/desconecta', 40000, true);
      ocupado = false; resultado(r);
    } else return;
    await mira();
  }
  async function cambiaEstricto() {
    if (ocupadoEstricto || !E || E.estricto === null) return;
    ocupadoEstricto = true; aviso = null; pinta();
    const r = await pide('POST', '/api/vpn/estricto', 15000, true, JSON.stringify({ estricto: !E.estricto }));
    ocupadoEstricto = false; resultado(r);
    await mira();
  }

  // ---------- abrir y cerrar, como «Antivirus» ----------
  function mueveIdiomas(dentro) {
    if (dentro) {
      const c = document.querySelector('header .idiomas'); if (!c || c === idiomas) return;
      idiomas = c; idiomasCasa = { padre: c.parentNode, sig: c.nextSibling }; acc.insertBefore(c, cerrarBtn);
    } else if (idiomas && idiomasCasa) {
      try { if (idiomasCasa.padre && idiomasCasa.padre.isConnected) idiomasCasa.padre.insertBefore(idiomas, idiomasCasa.sig && idiomasCasa.sig.parentNode === idiomasCasa.padre ? idiomasCasa.sig : null); } catch (_) {}
      idiomas = null; idiomasCasa = null;
    }
  }
  function abre(op) {
    op = op || {}; monta();
    if (abierto) { pinta(); return true; }
    if (window.OrbitaEscaner && window.OrbitaEscaner.abierto) window.OrbitaEscaner.cierra();
    abierto = true; antes = document.activeElement;
    if (op.apila !== false) { try { history.pushState({ vpn: 1 }, '', location.pathname + location.search + '#vpn'); } catch (_) {} }
    raiz.hidden = false; raiz.classList.remove('sale');
    // 2 Nov 2026 (owner, 17:14): opened from the main cover, already whole under it while the cover fades out above
    const portadaEncima = document.getElementById('nuc-ini'); raiz.classList.toggle('sin-entrada', !!(portadaEncima && !portadaEncima.hidden));
    document.body.classList.add('en-escaner', 'en-vpn');
    window.OrbitaTapada = true;
    mueveIdiomas(true);
    // what a website saw belongs to that moment; the rest is read again now
    C = null; cFallo = false; faseVista = ''; aviso = null;
    pinta();
    mira().then(() => leeSalidas(true)).then(() => comprueba(false));
    clearInterval(relojLectura); relojLectura = setInterval(late, 3000);
    clearInterval(relojVivo); relojVivo = setInterval(() => { if (abierto && !document.hidden) actualizaVivos(); }, 1000);
    setTimeout(() => { if (abierto) { V.titulo.setAttribute('tabindex', '-1'); V.titulo.focus({ preventScroll: true }); } }, 80);
    return true;
  }
  function cierra() {
    if (!abierto) return;
    abierto = false; clearInterval(relojLectura); clearInterval(relojVivo);
    const dentro = raiz.contains(document.activeElement);
    // 2 Nov 2026 (owner, 17:14): back to the main cover, the VPN stays whole underneath while the cover fades in over it, then goes
    const aPortada = !!(window.GuardianaNucleo && typeof window.GuardianaNucleo.inicio === 'function');
    if (!aPortada) raiz.classList.add('sale');
    setTimeout(() => { if (!abierto && raiz) { raiz.hidden = true; raiz.classList.remove('sale'); } }, aPortada ? 320 : 260);
    document.body.classList.remove('en-escaner', 'en-vpn');
    mueveIdiomas(false);
    window.OrbitaTapada = false;
    // 2 Nov 2026 (owner, 08:01: «tiene que volver a la carátula principal»): leaving the VPN shows the main cover
    if (aPortada) { try { window.GuardianaNucleo.inicio(); } catch (_) {} return; }
    if (dentro) setTimeout(() => { const v = [antes, document.getElementById('volver')].find((el) => el && el.isConnected && el.getClientRects().length); if (v) v.focus({ preventScroll: true }); }, 300);
  }
  function sal() {
    if (history.state && history.state.vpn && !history.state.llegada) { history.back(); return; }
    if (location.hash === '#vpn') { try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {} }
    cierra();
  }
  const sinPortada = () => { if (window.GuardianaNucleo && typeof window.GuardianaNucleo.cierra === 'function') try { window.GuardianaNucleo.cierra(); } catch (_) {} };
  addEventListener('popstate', (e) => {
    if (e.state && e.state.vpn) { if (!abierto) { sinPortada(); abre({ apila: false }); } return; }
    if (location.hash === '#vpn') { try { history.replaceState({ vpn: 1, llegada: 1 }, '', location.pathname + location.search + '#vpn'); } catch (_) {} if (!abierto) { sinPortada(); abre({ apila: false }); } return; }
    if (abierto) cierra();
  });
  document.addEventListener('keydown', (e) => { if (abierto && e.key === 'Escape' && !document.querySelector('.idioma-menu:not([hidden])')) { e.preventDefault(); e.stopImmediatePropagation(); sal(); } }, true);
  addEventListener('guardiana-idioma', () => { if (abierto) pinta(); });
  document.addEventListener('visibilitychange', () => { if (abierto && !document.hidden) mira(); });

  // ---------- la entrada: solo desde la portada principal (2 Nov 2026, el dueño, 08:01: sin puertas entre secciones) ----------
  function arranca() {
    try { new MutationObserver(() => { if (abierto) { E = null; fallos = 0; motivoFallo = ''; pinta(); mira(); } }).observe(RAIZ, { attributes: true, attributeFilter: ['data-en-programa'] }); } catch (_) {}
    if (location.hash === '#vpn') {
      try { history.replaceState({ vpn: 1, llegada: 1 }, '', location.pathname + location.search + '#vpn'); } catch (_) {}
      setTimeout(() => abre({ apila: false }), 300);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca, { once: true }); else arranca();
  // 6 Nov 2026: the icon next to the clock opens «guardiana://vpn» also with Órbita already open in ZERO; the page does not
  // load again, only its address gains «#vpn»
  addEventListener('hashchange', () => {
    if (location.hash !== '#vpn' || abierto) return;
    try { history.replaceState({ vpn: 1, llegada: 1 }, '', location.pathname + location.search + '#vpn'); } catch (_) {}
    sinPortada();
    abre({ apila: false });
  });
  window.OrbitaVpn = { abre, cierra: sal, get abierto() { return abierto; } };

  // ---------- la demostración local (?demo=…; solo en 127.0.0.1 o localhost) ----------
  // A pretend program with the new API (or, with «antigua», today's): its figures are examples, never shown on the real site.
  function demostracion() {
    const ahora = Date.now(), antigua = DEMO === 'antigua';
    const SALIDAS = [
      { id: 'hel', pais: 'FI', ciudad: 'Helsinki', continente: 'europa', proveedor: 'Hetzner', nombre: 'vpn.guardianagroup.com', ip: '62.238.17.121', disponible: true, ms: 176 },
      { id: 'nbg', pais: 'DE', ciudad: 'Núremberg', continente: 'europa', proveedor: 'Hetzner', nombre: '', disponible: false, ms: null },
      { id: 'mia', pais: 'US', ciudad: 'Miami', continente: 'america', proveedor: 'Vultr', nombre: '', disponible: false, ms: null },
    ];
    const st = { fase: antigua || DEMO === 'bloqueada' ? 'apagada' : DEMO, salida: null, desde: null, saludo: null, subidos: 0, bajados: 0, estricto: true, error: '', bloqueo: DEMO === 'bloqueada' };
    if (st.fase !== 'apagada') st.salida = SALIDAS[0];
    if (st.fase === 'conectada') Object.assign(st, { desde: ahora - 754000, saludo: ahora - 14000, subidos: 1843200, bajados: 12634000 });
    if (st.fase === 'sin_respuesta') Object.assign(st, { desde: ahora - 1520000, saludo: ahora - 95000, subidos: 3120000, bajados: 41200000 });
    if (st.fase === 'error') Object.assign(st, { error: 'el servidor no contesta', estricto: false });
    const respuesta = (estado, json, ms) => new Promise((ok) => setTimeout(() => ok(estado >= 200 && estado < 300 ? { ok: true, estado, json } : { ok: false, estado, json, motivo: estado === 403 ? 'prohibida' : 'error' }), ms == null ? 140 : ms));
    function foto() {
      if (st.fase === 'conectada') { st.subidos += 2600 + Math.round(Math.random() * 9000); st.bajados += 21000 + Math.round(Math.random() * 90000); if (Date.now() - st.saludo > 110000) st.saludo = Date.now(); }
      if (antigua) return { disponible: true, motivo: null, fase: st.fase, servidor: st.fase === 'apagada' ? '' : 'vpn.guardianagroup.com', desde_ms: st.desde || 0, direccion: st.fase === 'apagada' ? '' : '·', error: st.error, enviados: st.fase === 'conectada' ? st.subidos : null, recibidos: st.fase === 'conectada' ? st.bajados : null, ultimo_saludo_ms: st.saludo };
      const on = st.fase !== 'apagada';
      return { disponible: true, motivo: null, fase: st.fase, servidor: on ? 'vpn.guardianagroup.com' : '', salida: on ? st.salida : null, desde: on ? st.desde : null, saludo: on ? st.saludo : null,
        subidos: on ? st.subidos : 0, bajados: on ? st.bajados : 0, postcuantica: on, dns_tunel: on, estricto: st.estricto, error: st.error,
        desconectar: (on && st.fase !== 'error') || st.bloqueo };
    }
    function vista() {
      const on = st.fase === 'conectada';
      return { comprobado: { ip: true, dns: false, ipv6: false }, ip_vista: on ? '62.238.17.121' : '203.0.113.24', pais_ip: on ? 'FI' : 'CO', dns: on ? 'tunel' : 'fuera', ipv6: on ? 'bloqueado' : 'sin_ipv6',
        zona: { equipo: 'America/Bogota', salida: on ? 'Europe/Helsinki' : null, coincide: on ? false : null }, idioma: 'es-CO', ubicacion_windows: 'permitida' };
    }
    return (m, r, t, primero, cuerpo) => {
      if (m === 'GET' && r === '/api/vpn') return respuesta(200, foto());
      if (m === 'GET' && r === '/api/vpn/salidas') return antigua ? respuesta(403, null, 20) : respuesta(200, { salidas: SALIDAS, mas_rapida: 'hel' }, 420);
      if (m === 'GET' && r === '/api/vpn/comprueba') return antigua ? respuesta(403, null, 20) : respuesta(200, vista(), 1100);
      if (m === 'POST' && r === '/api/vpn/conecta') {
        let id = 'rapida'; try { id = JSON.parse(cuerpo).salida; } catch (_) {}
        Object.assign(st, { fase: 'conectando', salida: SALIDAS.find((s) => s.id === id && s.disponible) || SALIDAS[0], error: '', subidos: 0, bajados: 0 });
        setTimeout(() => { if (st.fase === 'conectando') Object.assign(st, { fase: 'conectada', desde: Date.now(), saludo: Date.now() }); }, 2600);
        return respuesta(200, { ok: true }, 200);
      }
      if (m === 'POST' && r === '/api/vpn/desconecta') { Object.assign(st, { fase: 'apagada', salida: null, desde: null, saludo: null, error: '', bloqueo: false }); return respuesta(200, { ok: true }, 500); }
      if (m === 'POST' && r === '/api/vpn/estricto' && !antigua) { try { st.estricto = JSON.parse(cuerpo).estricto === true; } catch (_) {} return respuesta(200, { ok: true }, 220); }
      return respuesta(403, null, 20);
    };
  }
})();
