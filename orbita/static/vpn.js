/* GUARDIANA · Órbita · «VPN» (1 nov 2026; el dueño: «VPN como sección propia», un solo programa con Comunicaciones,
   Antivirus, Navegador y VPN por una cuota). La misma casa que «Antivirus»: pantalla completa sobre el planeta, noche,
   acero, IBM Plex. Dentro del programa habla con el servicio por la pasarela de ZERO (GET /api/vpn, POST /api/vpn/conecta
   y /api/vpn/desconecta: solo tras un clic real); fuera del programa dice qué es y qué hace falta. Nada se promete que
   no esté medido: lo que el túnel hace está probado en Windows (docs/VPN.md del programa); el primer servidor está en
   preparación y aquí se dice así. Español en la página; static/idioma.js lo enseña en el idioma de la pantalla. */
(() => {
  'use strict';
  const RAIZ = document.documentElement;
  const enPrograma = () => RAIZ.dataset.enPrograma === '1';
  const DESCARGA = '/instalar.html#descargar';
  const SVG = (d, w) => '<svg width="' + (w || 16) + '" height="' + (w || 16) + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const I_ATRAS = SVG('<path d="M10 3.5 5.5 8l4.5 4.5"/>');
  const I_X = SVG('<path d="M4 4l8 8M12 4l-8 8"/>', 14);
  // the tunnel: two arcs with a key inside
  const I_VPN = SVG('<path d="M3 8a5 5 0 0 1 10 0M3 8a5 5 0 0 0 10 0"/><circle cx="8" cy="8" r="1.6"/>');

  function h(tag, at, ...hijos) {
    const e = document.createElement(tag);
    if (at) for (const k in at) {
      const v = at[k]; if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const x of hijos.flat(3)) { if (x == null || x === false || x === '') continue; e.append(x instanceof Node ? x : document.createTextNode(String(x))); }
    return e;
  }
  const dato = (s, cls, tag) => h(tag || 'span', { class: cls, translate: 'no' }, s);
  function pon(el, s) { if (el.dataset.es !== s) { el.dataset.es = s; el.textContent = s; } return el; }
  const LOC = () => (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es';
  const bytes = (n) => { n = Number(n) || 0; const u = ['B', 'kB', 'MB', 'GB', 'TB']; let i = 0; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; } return (i ? n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) : String(n)) + ' ' + u[i]; };
  const hora = (ms) => { try { return new Date(+ms).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' }); } catch (_) { return ''; } };
  const hace = (ms) => { const s = Math.max(0, Math.round((Date.now() - ms) / 1000)); return s < 60 ? s + ' s' : s < 3600 ? Math.round(s / 60) + ' min' : Math.round(s / 3600) + ' h'; };
  const pide = (m, r, t) => (window.OrbitaEscaner && window.OrbitaEscaner.pide ? window.OrbitaEscaner.pide(m, r, t) : Promise.resolve({ ok: false, motivo: 'tiempo' }));

  // ---------- la sección ----------
  let raiz = null, cuerpo = null, acc = null, cerrarBtn = null, volverBtn = null, idiomas = null, idiomasCasa = null;
  let abierto = false, antes = null, boton = null, reloj = 0, foto = null, aviso = '';
  const V = {}; // the parts that change with the state
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
    // the state, big: a ring that breathes while connecting and closes when connected
    V.anillo = h('div', { class: 'vpn-anillo', 'aria-hidden': 'true' }, h('i'), h('i'), h('b', { html: I_VPN.replace('width="16" height="16"', 'width="34" height="34"') }));
    V.k = h('p', { class: 'esc-k' }, 'VPN · Para Windows');
    V.titulo = h('h1', { id: 'vpn-titulo' }, 'Desconectada');
    V.lead = h('p', { class: 'esc-lead' });
    V.boton = h('button', { type: 'button', class: 'esc-boton vpn-boton' }); V.boton.append(h('span'));
    V.boton.addEventListener('click', orden);
    V.aviso = h('p', { class: 'vpn-aviso', role: 'status', 'aria-live': 'polite' });
    V.datos = h('dl', { class: 'vpn-datos', hidden: true });
    const hechos = h('div', { class: 'esc-hechos vpn-hechos' },
      h('div', { class: 'esc-hecho' }, h('b', null, 'Encriptado hasta el servidor'), h('span', null, 'Lo que sale de este equipo viaja encriptado con WireGuard hasta el servidor de GUARDIANA; las webs ven la dirección del servidor, no la tuya.')),
      h('div', { class: 'esc-hecho' }, h('b', null, 'Si el túnel cae, nada sale'), h('span', null, 'El corte está en el propio Windows (Filtering Platform): fuera del túnel solo pasan el servicio de GUARDIANA, la red local y DHCP.')),
      h('div', { class: 'esc-hecho' }, h('b', null, 'Clave poscuántica'), h('span', null, 'Además de la clave clásica de WireGuard, una clave compartida acordada con ML-KEM-768, en cada conexión.')));
    const limites = h('div', { class: 'vpn-limites' }, h('h2', { class: 'esc-rot' }, 'Lo que no hace'),
      h('p', null, 'No oculta quién eres ante las webs donde inicias sesión, ni frena el phishing ni a quien entrega su contraseña.'),
      h('p', null, 'El servidor de GUARDIANA ve adónde va tu tráfico, como en cualquier VPN. Qué guarda y qué no se publicará con su código, dentro del sello; hasta entonces no se promete nada.'),
      h('p', null, 'Incluida en la licencia de GUARDIANA, sin cuenta aparte. La biblioteca de WireGuardNT va firmada por WireGuard LLC, tal cual la publica, y el programa comprueba su huella antes de cargarla.'));
    V.fuera = h('div', { class: 'vpn-fuera', hidden: true },
      h('p', { class: 'esc-texto' }, 'La VPN va dentro del programa GUARDIANA para Windows: una web no puede abrir un túnel por sí sola. Una vez instalado, abre el programa y elige «VPN» en la portada.'),
      (() => { const a = h('a', { class: 'esc-boton', href: DESCARGA }); a.append(h('span', null, 'Instalar GUARDIANA')); return a; })());
    V.servidor = h('p', { class: 'vpn-servidor' }, h('span', { class: 'esc-marca' }, 'En preparación'), ' ', h('span', null, 'Primer servidor: Helsinki. Cuando esté dentro del sello, se conecta desde aquí; hasta entonces, «Conectar» dirá que el servidor no contesta.'));
    const hoja = h('div', { class: 'esc-hoja vpn-hoja' }, h('div', { class: 'esc-portada vpn-portada' }, V.anillo, V.k, V.titulo, V.lead, V.boton, V.aviso, V.datos, V.fuera, V.servidor, hechos), limites);
    cuerpo = h('div', { class: 'esc-cuerpo', tabindex: '-1' }, hoja);
    raiz.append(h('div', { class: 'esc-fondo', 'aria-hidden': 'true' }), barra, cuerpo);
    document.body.appendChild(raiz);
    pinta();
    return raiz;
  }

  // ---------- el estado ----------
  const FASE = { desconectada: 'Desconectada', conectando: 'Conectando…', conectada: 'Conectada', sin_respuesta: 'El servidor no contesta', reconectando: 'Reconectando…', error: 'No se pudo conectar' };
  // con túnel (y su corte) puesto: conectada; sin respuesta del servidor (1.0.53: lo dice y deja desconectar); o
  // reconectando (cuando el programa rehaga el túnel solo)
  const CON_TUNEL = (f) => f === 'conectada' || f === 'sin_respuesta' || f === 'reconectando';
  function fase() {
    if (!enPrograma()) return 'fuera';
    if (!foto) return 'desconectada';
    if (foto.disponible === false) return 'no_disponible';
    const f = String(foto.fase || '').toLowerCase();
    return FASE[f] ? f : (foto.error ? 'error' : 'desconectada');
  }
  function pinta() {
    if (!raiz) return;
    const f = fase();
    raiz.dataset.fase = f;
    const enPC = f !== 'fuera';
    V.fuera.hidden = enPC; V.boton.hidden = !enPC || f === 'no_disponible'; V.servidor.hidden = !enPC || CON_TUNEL(f);
    pon(V.titulo, f === 'fuera' ? 'La VPN de GUARDIANA' : f === 'no_disponible' ? 'No disponible en este equipo' : FASE[f]);
    pon(V.lead, f === 'fuera' ? 'Un túnel encriptado desde este equipo hasta un servidor de GUARDIANA, con corte si cae y clave poscuántica. Va dentro del mismo programa que el Antivirus, el navegador y Comunicaciones.'
      : f === 'no_disponible' ? (foto && foto.motivo ? String(foto.motivo) : 'El programa no puede abrir el túnel aquí.')
      : f === 'conectada' ? 'Todo lo que sale de este equipo va por el túnel. Si el túnel cae, nada sale fuera de él.'
      : f === 'sin_respuesta' ? 'El servidor de la VPN no contesta. Mientras tanto, nada sale fuera del túnel. Para volver a tu conexión normal, desconecta; cuando el servidor vuelva, podrás conectar de nuevo.'
      : f === 'reconectando' ? 'El servidor dejó de contestar: GUARDIANA pide un alta nueva y rehace el túnel. Mientras tanto, nada sale fuera de él. Si prefieres volver a tu conexión normal, desconecta.'
      : f === 'conectando' ? 'Llaves nuevas, alta en el servidor, túnel y corte; después, el primer saludo del servidor. Unos segundos.'
      : f === 'error' ? 'El equipo quedó como estaba: sin túnel y sin corte.'
      : 'Al conectar, lo que salga de este equipo irá encriptado hasta el servidor de GUARDIANA.');
    pon(V.boton.querySelector('span'), CON_TUNEL(f) ? 'Desconectar' : f === 'conectando' ? 'Conectando…' : 'Conectar');
    V.boton.disabled = f === 'conectando';
    V.boton.classList.toggle('secundario', CON_TUNEL(f));
    // the figures, only while there is a tunnel
    const filas = [];
    if (foto && (CON_TUNEL(f) || f === 'conectando' || f === 'error')) {
      if (foto.servidor) filas.push(['Servidor', dato(String(foto.servidor))]);
      if (CON_TUNEL(f) && foto.desde_ms) filas.push(['Desde', dato(hora(foto.desde_ms) + ' · ' + hace(foto.desde_ms))]);
      if (CON_TUNEL(f) && foto.direccion) filas.push(['Dirección en el túnel', dato(String(foto.direccion))]);
      if (f === 'conectada' && foto.enviados != null) filas.push(['Enviados', dato(bytes(foto.enviados))]);
      if (f === 'conectada' && foto.recibidos != null) filas.push(['Recibidos', dato(bytes(foto.recibidos))]);
      if (CON_TUNEL(f) && foto.ultimo_saludo_ms) filas.push(['Último saludo del servidor, hace', dato(hace(foto.ultimo_saludo_ms))]);
      if ((f === 'error' || f === 'reconectando') && foto.error) filas.push(['Motivo', dato(String(foto.error))]);
    }
    V.datos.textContent = ''; V.datos.hidden = !filas.length;
    for (const [k, v] of filas) V.datos.append(h('div', null, h('dt', null, k), h('dd', null, v)));
    pon(V.aviso, aviso);
  }
  async function mira() {
    if (!abierto || !enPrograma()) return;
    const r = await pide('GET', '/api/vpn', 8000);
    if (!abierto) return;
    if (r && r.ok && r.json && typeof r.json === 'object') foto = r.json;
    pinta();
  }
  async function orden() {
    const f = fase(); if (f === 'conectando' || f === 'fuera' || f === 'no_disponible') return;
    aviso = CON_TUNEL(f) ? 'Cerrando el túnel…' : 'Abriendo el túnel…'; pinta();
    // desconectar mientras reconecta puede esperar a que acabe el intento en curso (hasta unos 25 segundos)
    const r = await pide('POST', CON_TUNEL(f) ? '/api/vpn/desconecta' : '/api/vpn/conecta', CON_TUNEL(f) ? 40000 : 15000);
    const j = r && r.json && typeof r.json === 'object' ? r.json : null;
    if (r && r.ok && j && j.ok === true) aviso = '';
    else if (r && r.estado === 428) aviso = 'El programa solo acepta la orden justo después de pulsar: vuelve a pulsar.';
    // 1.0.55: conectar es de Plus al acabar la prueba; el programa manda su propia línea, ya en el idioma de la persona
    else if (r && r.estado === 402 && j && j.texto) aviso = String(j.texto);
    else aviso = 'No se pudo. ' + (j && j.motivo ? String(j.motivo) : r && r.motivo === 'tiempo' ? 'El programa no respondió a tiempo.' : 'El programa no lo permitió.');
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
    document.body.classList.add('en-escaner', 'en-vpn');
    window.OrbitaTapada = true;
    mueveIdiomas(true);
    if (boton) boton.setAttribute('aria-pressed', 'true');
    pinta(); mira(); clearInterval(reloj); reloj = setInterval(mira, 3000);
    setTimeout(() => { if (abierto) { V.titulo.setAttribute('tabindex', '-1'); V.titulo.focus({ preventScroll: true }); } }, 80);
    return true;
  }
  function cierra() {
    if (!abierto) return;
    abierto = false; clearInterval(reloj);
    const dentro = raiz.contains(document.activeElement);
    raiz.classList.add('sale');
    setTimeout(() => { if (!abierto && raiz) { raiz.hidden = true; raiz.classList.remove('sale'); } }, 260);
    document.body.classList.remove('en-escaner', 'en-vpn');
    mueveIdiomas(false);
    window.OrbitaTapada = false;
    if (boton) boton.setAttribute('aria-pressed', 'false');
    // 2 Nov 2026 (owner, 08:01: «tiene que volver a la carátula principal»): leaving the VPN shows the main cover
    if (window.GuardianaNucleo && typeof window.GuardianaNucleo.inicio === 'function') { try { window.GuardianaNucleo.inicio(); } catch (_) {} return; }
    if (dentro) setTimeout(() => { const v = [antes, document.getElementById('volver')].find((el) => el && el.isConnected && el.getClientRects().length); if (v) v.focus({ preventScroll: true }); }, 300);
  }
  function sal() {
    if (history.state && history.state.vpn && !history.state.llegada) { history.back(); return; }
    if (location.hash === '#vpn') { try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {} }
    cierra();
  }
  addEventListener('popstate', (e) => { if (e.state && e.state.vpn) { if (!abierto) abre({ apila: false }); } else if (abierto) cierra(); });
  document.addEventListener('keydown', (e) => { if (abierto && e.key === 'Escape' && !document.querySelector('.idioma-menu:not([hidden])')) { e.preventDefault(); e.stopImmediatePropagation(); sal(); } }, true);
  addEventListener('guardiana-idioma', () => { if (abierto) pinta(); });

  // ---------- la entrada: solo desde la portada principal (2 Nov 2026, el dueño, 08:01: sin puertas entre secciones) ----------
  function ponBoton() { if (boton) { boton.remove(); boton = null; } }
  function arranca() {
    ponBoton();
    try { new MutationObserver(() => { ponBoton(); if (abierto) { pinta(); mira(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-en-programa'] }); } catch (_) {}
    setTimeout(ponBoton, 0); setTimeout(ponBoton, 400);
    if (location.hash === '#vpn') {
      try { history.replaceState({ vpn: 1, llegada: 1 }, '', location.pathname + location.search + '#vpn'); } catch (_) {}
      setTimeout(() => abre({ apila: false }), 300);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca, { once: true }); else arranca();
  window.OrbitaVpn = { abre, cierra: sal, get abierto() { return abierto; } };
})();
