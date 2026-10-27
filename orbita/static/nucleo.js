// GUARDIANA · NÚCLEO (27 Oct 2026). La puerta de entrada de GUARDIANA y su guía en toda la web.
// Dueño, 08:42: «pantalla negra y en el medio nace el navegador con el cerebro neuronal… buenos días, bienvenido a esta
// experiencia de tus datos… ¿qué desea hacer?… y te va derivando»; 09:03: «si Núcleo está muy bien estructurado y va
// guiando al cliente por la web, y puede ir y retroceder, a lo mejor no hace falta la IA». Ronda 52 de la agencia.
// NÚCLEO guiado: una conversación con opciones (como un chatbot de botones), ir y volver, y frases escritas que entiende
// con reglas. Hace las cosas de verdad: abre ZERO con una web, lleva al planeta y a un país, enciende capas, cuenta tus
// datos de hoy (los que ZERO guarda en este navegador), hace el PDF y abre Comunicaciones. Solo habla de GUARDIANA, de
// la web y de tus datos. Corre en el navegador de cada persona: no guarda ni envía lo que se le pide.
'use strict';
(() => {
  const T = (s) => { try { return window.GuardianaIdioma ? GuardianaIdioma.t(s) : s; } catch (_) { return s; } };
  const loc = () => { try { return (window.GuardianaIdioma && GuardianaIdioma.locale) || 'es'; } catch (_) { return 'es'; } };
  const fmt = (n) => { try { return Number(n).toLocaleString(loc()); } catch (_) { return String(n); } };
  const sinTildes = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  const pon = (tpl, ...xs) => xs.reduce((s, x, i) => s.split('{' + (i + 1) + '}').join(x), T(tpl));
  const q = new URLSearchParams(location.search);
  const PUERTA_EN_URL = /^#(zero|radiografias|comunicaciones|mi-conexion)$/.test(location.hash);
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- la red neuronal que nace en el centro ----------
  function red(lienzo) {
    const cx = lienzo.getContext('2d'); if (!cx) return { habla() {}, para() {} };
    const N = 300, P = [];
    for (let i = 0; i < N; i++) { const y = 1 - (i + .5) * 2 / N, r = Math.sqrt(1 - y * y), a = i * 2.39996323, k = .86 + Math.random() * .2; P.push([Math.cos(a) * r * k, y * k, Math.sin(a) * r * k, Math.random() * Math.PI * 2]); }
    const V = P.map((p, i) => P.map((o, j) => [j, (p[0] - o[0]) ** 2 + (p[1] - o[1]) ** 2 + (p[2] - o[2]) ** 2]).filter((x) => x[0] !== i).sort((a, b) => a[1] - b[1]).slice(0, 3).map((x) => x[0]));
    let t0 = performance.now(), habla = 0, vivo = true, W = 0, H = 0, dpr = 1;
    // Giro libre (dueño, 09:28: «que gire totalmente: izquierda, derecha, arriba, abajo; que nunca sea igual»): el eje y la
    // velocidad cambian solos cada pocos segundos, con suavidad, hacia una dirección al azar, y cada visita empieza distinta.
    const azar = () => { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u); return [r * Math.cos(a), u, r * Math.sin(a)]; };
    const giro = () => { const e = azar(), v = .14 + Math.random() * .26; return e.map((x) => x * v); };
    let qo = (() => { const e = azar(), a = Math.random() * Math.PI * 2; return [Math.cos(a / 2), ...e.map((x) => x * Math.sin(a / 2))]; })();
    const w = giro(); let wObj = giro(), cambio = 2 + Math.random() * 3, antes = null;
    const mide = () => { const r = lienzo.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = Math.max(1, r.width); H = Math.max(1, r.height); lienzo.width = W * dpr; lienzo.height = H * dpr; };
    mide(); const ro = new ResizeObserver(mide); ro.observe(lienzo);
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    function cuadro(ahora) {
      if (!vivo) return;
      const t = (ahora - t0) / 1000, nace = reducir ? 1 : ease((t - .7) / 1.6), dt = antes == null ? 0 : Math.min(.05, (ahora - antes) / 1000);
      antes = ahora;
      if (!reducir && dt > 0) {
        if (t > cambio) { wObj = giro(); cambio = t + 2.5 + Math.random() * 4.5; }
        const k = 1 - Math.exp(-dt * .7); for (let i = 0; i < 3; i++) w[i] += (wObj[i] - w[i]) * k;
        const n = Math.hypot(w[0], w[1], w[2]), m = n * dt * (1 + habla * .8);
        if (n > 1e-6) {
          const sm = Math.sin(m / 2) / n, a1 = Math.cos(m / 2), b1 = w[0] * sm, c1 = w[1] * sm, d1 = w[2] * sm, [a2, b2, c2, d2] = qo;
          qo = [a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2, a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2, a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2, a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2];
          const l = Math.hypot(qo[0], qo[1], qo[2], qo[3]) || 1; qo = qo.map((x) => x / l);
        }
      }
      habla *= .95;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * .4 * (.04 + .96 * nace) * (1 + habla * .05), [qa, qb, qc, qd] = qo;
      const m00 = 1 - 2 * (qc * qc + qd * qd), m01 = 2 * (qb * qc - qa * qd), m02 = 2 * (qb * qd + qa * qc), m10 = 2 * (qb * qc + qa * qd), m11 = 1 - 2 * (qb * qb + qd * qd), m12 = 2 * (qc * qd - qa * qb), m20 = 2 * (qb * qd - qa * qc), m21 = 2 * (qc * qd + qa * qb), m22 = 1 - 2 * (qb * qb + qc * qc);
      if (nace < 1) { const g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 40 + 60 * nace); g.addColorStop(0, `rgba(244,246,248,${.9 * (1 - nace * .7)})`); g.addColorStop(.3, `rgba(156,195,228,${.55 * (1 - nace * .5)})`); g.addColorStop(1, 'rgba(156,195,228,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
      const Q = P.map((p) => { const x = m00 * p[0] + m01 * p[1] + m02 * p[2], y = m10 * p[0] + m11 * p[1] + m12 * p[2], z = m20 * p[0] + m21 * p[1] + m22 * p[2], pul = 1 + .04 * Math.sin(t * 1.7 + p[3]) + habla * .06 * Math.sin(t * 9 + p[3]); return [W / 2 + x * R * pul, H / 2 + y * R * pul, z]; });
      cx.lineWidth = 1;
      const lin = Math.max(0, Math.min(1, (nace - .25) / .6));
      if (lin > 0) for (let i = 0; i < N; i++) for (const j of V[i]) { if (j < i) continue; const a = Q[i], b = Q[j], zz = (a[2] + b[2]) / 2; cx.strokeStyle = `rgba(156,195,228,${(.08 + .26 * (zz + 1) / 2 + habla * .15) * lin})`; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
      for (let i = 0; i < N; i++) { const a = Q[i], f = (a[2] + 1) / 2; cx.fillStyle = `rgba(${210 + 34 * f},${228 + 18 * f},248,${(.25 + .7 * f) * Math.min(1, nace * 1.4)})`; cx.beginPath(); cx.arc(a[0], a[1], .7 + 1.5 * f, 0, Math.PI * 2); cx.fill(); }
      const g2 = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 1.25); g2.addColorStop(0, `rgba(156,195,228,${.10 + habla * .12})`); g2.addColorStop(1, 'rgba(156,195,228,0)'); cx.fillStyle = g2; cx.fillRect(0, 0, W, H);
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
    return { habla() { habla = 1; }, para() { vivo = false; ro.disconnect(); } };
  }

  // ---------- acciones reales ----------
  function marcoZero() { try { const m = document.getElementById('marco'); if (m && !m.hidden && m.contentWindow && /\/zero\//.test(m.contentWindow.location.pathname)) return m.contentWindow; } catch (_) {} return null; }
  function abreZero(web) {
    ocultaInicio();
    if (!marcoZero() && window.OrbitaPuertas) OrbitaPuertas.abre('zero');
    if (!web) return;
    let n = 0; const intenta = () => {
      const w = marcoZero(); const f = w && w.document.getElementById('lens'); const i = f && f.querySelector('input');
      if (i) { i.value = web; i.dispatchEvent(new w.Event('input', { bubbles: true })); try { f.requestSubmit(); } catch (_) { f.dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true })); } return; }
      if (++n < 40) setTimeout(intenta, 250);
    };
    setTimeout(intenta, 600);
  }
  function alPlaneta(capa, pais) {
    ocultaInicio();
    const v = document.getElementById('volver'); if (document.body.classList.contains('dentro') && v && !v.hidden) v.click();
    setTimeout(() => {
      try { if (capa && window.OrbitaCapas && typeof OrbitaCapas.pon === 'function') OrbitaCapas.pon(capa, true); } catch (_) {}
      try { const C = window.OrbitaPlaneta && OrbitaPlaneta.centros; if (pais && C && C[pais]) OrbitaPlaneta.ir(C[pais].lon, C[pais].lat, 2.2); } catch (_) {}
    }, 500);
  }
  const irComunicaciones = () => { location.href = 'comunicaciones/'; };
  // El PDF lo hace ZERO con lo que ha visto en una web abierta.
  function pdf() {
    const w = marcoZero();
    if (w && typeof w.zeroInforme === 'function') { ocultaInicio(); w.zeroInforme(); return true; }
    return false;
  }

  // ---------- tus datos de hoy (lo que ZERO guarda en este navegador; nada sale de aquí) ----------
  const lee = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (_) { return d; } };
  function misDatos() {
    const REG = lee('zeroRegistroCortes', []), tot = lee('zeroTotal', null);
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const hoy = Array.isArray(REG) ? REG.filter((r) => r && r.t >= +d0) : [];
    const emp = new Set(hoy.map((r) => r.e).filter(Boolean)), pai = new Set(hoy.map((r) => r.p).filter((x) => x && x !== 'País no identificado'));
    const total = tot && typeof tot.c === 'number' ? tot.c : (Array.isArray(REG) ? REG.length : 0);
    if (!hoy.length && !total) return T('Todavía no hay datos: en cuanto abras una web con ZERO y cortes algo, aquí te cuento qué empresas eran y de qué países. Se guarda solo en este navegador.');
    let s = hoy.length ? pon('Hoy, en este equipo: cortes {1} · empresas {2} · países {3}.', fmt(hoy.length), fmt(emp.size), fmt(pai.size)) : T('Hoy todavía no se ha cortado nada en este equipo.');
    if (total) s += ' ' + pon('Desde que usas ZERO, cortes en total: {1}.', fmt(total));
    if (hoy.length) { const cuenta = new Map(); hoy.forEach((r) => cuenta.set(r.e, (cuenta.get(r.e) || 0) + 1)); const top = [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e).filter(Boolean); if (top.length) s += ' ' + pon('Las que más lo han intentado: {1}.', top.join(', ')); }
    return s + ' ' + T('Se guarda solo en este navegador.');
  }

  // ---------- la conversación guiada ----------
  const AYUDA = {
    zero: 'ZERO es el navegador de GUARDIANA: la web se abre en una burbuja aislada en un servidor de GUARDIANA y a tu equipo solo llegan imágenes. A la derecha, la Radiografía te enseña quién intenta conectarse, las subastas de tus datos y lo que puedes cortar.',
    orbita: 'Órbita es el planeta de GUARDIANA: cables submarinos, cables terrestres, centros de datos y satélites, y cada corte en directo.',
    com: 'Comunicaciones es el chat y el envío de archivos de GUARDIANA, cifrados de extremo a extremo entre dos equipos, con un código de 9 cifras. Yo no puedo leer tus mensajes ni tus archivos.',
    guardiana: 'GUARDIANA te enseña y te deja cortar lo que la web hace con tus datos: navegar en una burbuja con ZERO, ver la red del planeta en Órbita y hablar cifrado con Comunicaciones.',
    nucleo: 'Soy NÚCLEO, el asistente de GUARDIANA. Te llevo a cada parte y te explico lo que pasa con tus datos. Solo hablo de GUARDIANA, de la web y de tus datos.',
  };
  const ETIQUETA = {
    zero: 'Navegar con NÚCLEO', planeta: 'Explorar el planeta', com: 'Comunicaciones', datos: 'Mis datos de hoy', guardiana: '¿Qué es GUARDIANA?',
    'z-web': 'Abrir una web', 'z-buscar': 'Buscar en internet', 'z-radio': 'Ver quién me sigue', 'z-pdf': 'Hacer el PDF', 'z-que': '¿Cómo funciona ZERO?',
    'p-sub': 'Cables submarinos', 'p-fibra': 'Cables terrestres', 'p-puntos': 'Centros de datos', 'p-sat': 'Satélites', 'p-pais': 'Ir a un país', 'p-directo': 'Cortes en directo', 'p-que': '¿Qué es Órbita?',
    'c-crear': 'Crear una invitación', 'c-codigo': 'Tengo un código', 'c-que': '¿Cómo funciona?',
    'd-zero': 'Ver el detalle en ZERO', 'd-corte': '¿Qué es un corte?',
  };
  const NODOS = {
    inicio: { d: () => T('¿Qué deseas hacer?'), o: ['zero', 'planeta', 'com'] },
    zero: { x: [['Qué es', 'Un navegador para entrar en cualquier web: la web se abre en un ordenador de GUARDIANA y a tu equipo solo llega la imagen.'], ['Qué ves', 'A la derecha, quién intenta seguirte, quién puja por tus datos y quién intenta leer tu equipo.'], ['Tú decides', 'Cortas lo que quieras con un interruptor. Si eliges Tor, se corta más.']], d: () => T('¿Qué quieres hacer?'), o: ['z-web', 'z-buscar', 'z-radio', 'z-pdf'] },
    'z-web': { d: () => T('Escribe la dirección de la web, por ejemplo eltiempo.com, y la abro en ZERO.'), pide: 'web' },
    'z-buscar': { d: () => T('Abro ZERO: escribe tu búsqueda en su barra.'), a: () => abreZero() },
    'z-radio': { d: () => T('La Radiografía está a la derecha de ZERO: abre una web y verás quién intenta conectarse, las subastas de tus datos y lo que puedes cortar. Abro ZERO.'), a: () => abreZero() },
    'z-pdf': { d: () => (marcoZero() && typeof marcoZero().zeroInforme === 'function') ? T('Preparo el PDF con lo que ZERO ha visto en esta web.') : T('Para el PDF necesito una web abierta en ZERO. Abro ZERO: abre una web y vuelve a pedírmelo.'), a: () => { if (!pdf()) abreZero(); } },
    'z-que': { d: () => T(AYUDA.zero), o: ['z-web', 'z-radio', 'z-pdf'] },
    planeta: { x: [['Qué es', 'Un mapa de la Tierra con los caminos por los que viajan tus datos.'], ['Qué ves', 'Cables submarinos, cables terrestres, centros de datos y satélites.'], ['En directo', 'Cada vez que GUARDIANA corta algo, lo ves aparecer en el planeta.']], d: () => T('¿Qué quieres ver?'), o: ['p-sub', 'p-fibra', 'p-puntos', 'p-sat', 'p-pais', 'p-directo'] },
    'p-sub': { d: () => pon('Te llevo al planeta y enciendo {1}.', T('los cables submarinos')), a: () => alPlaneta('sub') },
    'p-fibra': { d: () => pon('Te llevo al planeta y enciendo {1}.', T('los cables terrestres')), a: () => alPlaneta('fibra') },
    'p-puntos': { d: () => pon('Te llevo al planeta y enciendo {1}.', T('los centros de datos')), a: () => alPlaneta('puntos') },
    'p-sat': { d: () => pon('Te llevo al planeta y enciendo {1}.', T('los satélites')), a: () => alPlaneta('sat') },
    'p-pais': { d: () => T('¿Qué país? Escríbelo y te llevo.'), pide: 'pais' },
    'p-directo': { d: () => T('Te llevo al planeta: a la derecha, en EN DIRECTO, aparece cada corte.'), a: () => alPlaneta() },
    'p-que': { d: () => T(AYUDA.orbita), o: ['p-sub', 'p-sat', 'p-pais'] },
    com: { x: [['Qué es', 'Un chat para hablar y enviar archivos, incluso muy grandes, con otra persona.'], ['Cómo empieza', 'Tú creas una invitación y le das a la otra persona un código de 9 cifras.'], ['Privacidad', 'Todo va cifrado de un equipo al otro: nuestro servidor no puede leerlo, y yo tampoco.']], d: () => T('¿Qué quieres hacer?'), o: ['c-crear', 'c-codigo'] },
    'c-crear': { d: () => T('Abro Comunicaciones: pulsa «Crear invitación» y dale el código a la otra persona.'), a: irComunicaciones },
    'c-codigo': { d: () => T('Abro Comunicaciones: pulsa «Tengo un código» y escribe las 9 cifras.'), a: irComunicaciones },
    'c-que': { d: () => T(AYUDA.com), o: ['c-crear', 'c-codigo'] },
    datos: { x: [['Qué es', 'Lo que ZERO ha cortado mientras navegabas: qué empresas y de qué países.'], ['Dónde está', 'Solo en este navegador.']], d: misDatos, o: ['d-zero', 'z-pdf', 'd-corte'] },
    'd-zero': { d: () => T('Abro ZERO: la Radiografía te enseña el detalle de cada web.'), a: () => abreZero() },
    'd-corte': { d: () => T('Un corte es una conexión de otra empresa que ZERO no deja pasar. En ZERO, por defecto, todo pasa y tú decides qué cortar; con Tor, ZERO corta más.'), o: ['zero', 'datos'] },
    guardiana: { x: [['ZERO', 'Navegar viendo quién intenta llevarse tus datos.'], ['Órbita', 'Ver por dónde viajan tus datos en el planeta.'], ['Comunicaciones', 'Hablar y enviar archivos cifrados con otra persona.']], d: () => T('¿Por dónde empezamos?'), o: ['zero', 'planeta', 'com'] },
    nucleo: { d: () => T(AYUDA.nucleo), o: ['zero', 'planeta', 'com'] },
    nose: { d: () => T('Solo puedo ayudarte con GUARDIANA: navegar con ZERO, el planeta con sus cables y satélites, Comunicaciones y tus datos. Elige una opción o prueba con «Muéstrame los cables de Colombia» o «Abre eltiempo.com».'), o: ['zero', 'planeta', 'com'] },
  };

  // ---------- frases escritas → una opción (reglas en español, inglés y portugués; países y direcciones en cualquier idioma) ----------
  const extra = (k) => { const v = T(k); return v && v !== k ? v.split('|').map(sinTildes).filter(Boolean) : []; }; // claves que cada idioma puede añadir
  const tiene = (t, re, k) => re.test(t) || extra(k).some((w) => t.includes(w));
  const CAPAS = [['p-sub', /submarin|undersea|submarine/], ['p-fibra', /por tierra|terrestre|fibra|land cable|fiber|fibre/], ['p-puntos', /centros? de datos|data ?cent(er|re)s?|datacenter/], ['p-sat', /satelit|satellite/]];
  let PAISES = null;
  function paises() {
    if (PAISES) return PAISES;
    const C = (window.OrbitaPlaneta && OrbitaPlaneta.centros) || {};
    if (!Object.keys(C).length) return [];
    PAISES = [];
    const dns = ['es', 'en', 'pt', loc()].map((l) => { try { return new Intl.DisplayNames([l], { type: 'region' }); } catch (_) { return null; } }).filter(Boolean);
    for (const k of Object.keys(C)) { if (!/^[A-Z]{2}$/.test(k)) continue; const vistos = new Set(); for (const d of dns) { let n = ''; try { n = d.of(k); } catch (_) {} n = sinTildes(n); if (n && n.length > 2 && !vistos.has(n)) { vistos.add(n); PAISES.push([n, k]); } } }
    PAISES.push(['eeuu', 'US'], ['ee uu', 'US'], ['usa', 'US'], ['reino unido', 'GB'], ['inglaterra', 'GB']);
    PAISES.sort((a, b) => b[0].length - a[0].length);
    return PAISES;
  }
  const paisEn = (t) => { for (const [n, k] of paises()) { if (n.length < 3) continue; const i = t.indexOf(n); if (i >= 0 && !/[a-z]/.test(t[i - 1] || ' ') && !/[a-z]/.test(t[i + n.length] || ' ')) return k; } return null; };
  const nombrePais = (k) => { try { return new Intl.DisplayNames([loc()], { type: 'region' }).of(k); } catch (_) { return k; } };
  function entiende(frase, modo) {
    const t = sinTildes(frase); if (!t) return null;
    const dom = /(^|\s)((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?)/i.exec(String(frase).trim());
    if (modo === 'web' && (dom || !/\s/.test(t))) { const d = (dom ? dom[2] : t).replace(/^https?:\/\//i, ''); return { texto: pon('Abro {1} en ZERO, dentro de la burbuja.', d), a: () => abreZero(d) }; }
    if (modo === 'pais') { const k = paisEn(t); if (k) return { texto: pon('Te llevo al planeta, a {1}.', nombrePais(k)), a: () => alPlaneta(null, k) }; }
    if (/^(atras|volver|back|voltar)$/.test(t)) return { atras: true };
    if (/^(inicio|ir al inicio|volver al inicio|menu|home|start)$/.test(t)) return { nodo: 'inicio' };
    if (tiene(t, /^(hola|buenas|buenos dias|buen dia|hey|hi|hello|ola|oi|bom dia|boa tarde|boa noite|good (morning|afternoon|evening))\b/, 'NUCLEO_CLAVES_HOLA') && t.split(' ').length <= 4) return { nodo: 'inicio' };
    if (tiene(t, /(pdf|informe|reporte|report|relatorio)/, 'NUCLEO_CLAVES_PDF')) return { nodo: 'z-pdf' };
    if (dom && !/^(guardiana|guardianagroup)\./i.test(dom[2])) { const d = dom[2].replace(/^https?:\/\//i, ''); return { texto: pon('Abro {1} en ZERO, dentro de la burbuja.', d), a: () => abreZero(d) }; }
    if (tiene(t, /(mis datos|mis cortes|que me han cortado|que has cortado|resumen|hoy|my data|today|meus dados|hoje)/, 'NUCLEO_CLAVES_DATOS')) return { nodo: 'datos' };
    if (tiene(t, /(que es un corte|what is a cut|o que e um corte)/, 'NUCLEO_CLAVES_CORTE')) return { nodo: 'd-corte' };
    const ayuda = tiene(t, /(que es|que hace|como funciona|para que sirve|quien eres|que eres|que puedes|ayuda|what is|how does|who are you|help|o que e|como funciona|ajuda)/, 'NUCLEO_CLAVES_AYUDA');
    const sZero = tiene(t, /(naveg|zero|burbuja|abrir? (una )?web|buscar en internet|rastre|quien me sigue|subasta|radiograf|cookie|browse|browser|bubble|tracker|leil)/, 'NUCLEO_CLAVES_ZERO');
    const sCom = tiene(t, /(comunica|chat|mensaje|archivo|cifrad|hablar con|codigo|invitacion|message|file|encrypt|arquivo|mensagem|convite)/, 'NUCLEO_CLAVES_COM');
    const capa = (CAPAS.find(([, re]) => re.test(t)) || [])[0], pais = paisEn(t);
    const sPlan = capa || pais || tiene(t, /(planeta|mapa|orbita|cables?|cabos?|cortes? en directo|en directo|el mundo|planet|map|orbit|live)/, 'NUCLEO_CLAVES_PLANETA');
    if (ayuda) { if (/nucleo|quien eres|que eres|que puedes|who are you/.test(t)) return { nodo: 'nucleo' }; if (sZero) return { nodo: 'z-que' }; if (sCom) return { nodo: 'c-que' }; if (sPlan) return { nodo: 'p-que' }; return { nodo: 'guardiana' }; }
    if (sCom) return { nodo: 'com' };
    if (sZero) return { nodo: /quien me sigue|rastre|radiograf|tracker/.test(t) ? 'z-radio' : 'zero' };
    if (sPlan) {
      if (capa && pais) return { texto: pon('Te llevo al planeta: {1} en {2}.', T({ 'p-sub': 'los cables submarinos', 'p-fibra': 'los cables terrestres', 'p-puntos': 'los centros de datos', 'p-sat': 'los satélites' }[capa]), nombrePais(pais)), a: () => alPlaneta(capa.slice(2), pais) };
      if (capa) return { nodo: capa };
      if (pais) return { texto: pon('Te llevo al planeta, a {1}.', nombrePais(pais)), a: () => alPlaneta(null, pais) };
      return { nodo: 'planeta' };
    }
    return { nodo: 'nose' };
  }

  // ---------- la portada y la charla ----------
  let ini = null, laRed = null, pila = ['inicio'], modo = null;
  function construyeInicio() {
    const d = document.createElement('section');
    d.className = 'nuc-ini'; d.id = 'nuc-ini'; d.setAttribute('aria-label', 'NÚCLEO, la entrada de GUARDIANA');
    d.innerHTML = '<canvas class="nuc-lienzo" aria-hidden="true"></canvas>'
      + '<p class="nuc-k nuc-paso" translate="no">NÚCLEO</p>'
      + '<h1 class="nuc-paso" id="nuc-saludo">Toma el control de tus datos</h1>' // dueño, 09:42 y 09:49: «Toma el control de tus datos»
      + '<p class="nuc-sub nuc-paso" id="nuc-sub"><b>¿Qué deseas hacer?</b></p>'
      + '<div class="nuc-charla" id="nuc-charla" aria-live="polite"></div>'
      + '<div class="nuc-ops nuc-paso" id="nuc-ops" role="group" aria-label="Qué deseas hacer">'
      + '<button type="button" class="nuc-op" data-n="zero"><i>ZERO</i><b>Navegar con NÚCLEO</b><small>Entra en cualquier web y mira quién intenta llevarse tus datos.</small></button>'
      + '<button type="button" class="nuc-op" data-n="planeta"><i>ÓRBITA</i><b>Explorar el planeta</b><small>Cables submarinos, cables terrestres, centros de datos, satélites y cortes en directo.</small></button>'
      + '<button type="button" class="nuc-op" data-n="com"><i>COMUNICACIONES</i><b>Chat y archivos encriptados</b><small>Chatea y envía archivos encriptados de PC a PC.</small></button>'
      + '</div>'
      + '<div class="nuc-chips nuc-paso" id="nuc-chips" role="group" aria-label="Más opciones"></div>'
      ; // dueño, 09:41: sin el botón «¿Qué es GUARDIANA?»; 09:53: «borra de ahí el navegador ese de qué quieres hacer… ya veremos dónde lo metemos»: sin caja de escribir ni charla en la portada
    document.body.append(d);
    // cada tarjeta lleva directa a su sección (dueño, 09:53: dentro de la portada, la charla lo hacía todo más pequeño)
    d.querySelectorAll('.nuc-op').forEach((b) => b.addEventListener('click', () => entra(b.dataset.n)));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') alPlaneta(); });
    return d;
  }
  function ponMarcador() { const i = ini && ini.querySelector('#nuc-q'); if (i) i.placeholder = T(modo === 'web' ? 'Escribe la dirección, por ejemplo eltiempo.com' : modo === 'pais' ? 'Escribe el país' : 'Escribe qué deseas hacer…'); }
  function pintaOpciones(id) {
    if (!ini) return;
    const n = NODOS[id] || NODOS.inicio, chips = ini.querySelector('#nuc-chips'), grandes = ini.querySelector('#nuc-ops');
    grandes.hidden = id !== 'inicio';
    chips.textContent = '';
    for (const o of (n.o || [])) { if (id === 'inicio' && ['zero', 'planeta', 'com'].includes(o)) continue; const b = document.createElement('button'); b.type = 'button'; b.className = 'nuc-chip'; b.textContent = T(ETIQUETA[o] || o); b.addEventListener('click', () => elige(o)); chips.append(b); }
    const at = ini.querySelector('#nuc-atras'), ir = ini.querySelector('#nuc-inicio');
    if (at) at.hidden = pila.length <= 1;
    if (ir) ir.hidden = id === 'inicio' && !ini.classList.contains('charla');
  }
  function burbuja(quien, texto, filas) {
    const c = ini.querySelector('#nuc-charla'); const p = document.createElement('div'); p.className = 'nuc-b ' + quien;
    if (quien === 'el') { const k = document.createElement('span'); k.className = 'nq'; k.textContent = 'NÚCLEO'; p.append(k); }
    if (filas && filas.length) { const dl = document.createElement('dl'); dl.className = 'nuc-x'; for (const [k, v] of filas) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = T(k); dd.textContent = T(v); dl.append(dt, dd); } p.append(dl); }
    const tx = document.createElement('p'); tx.className = 'nuc-bt'; tx.textContent = texto; p.append(tx);
    c.append(p); while (c.children.length > 8) c.firstChild.remove(); c.scrollTop = c.scrollHeight;
  }
  function enCharla() { if (!ini) return; if (!ini.classList.contains('charla')) { ini.classList.add('charla'); ini.querySelectorAll('.nuc-paso').forEach((p) => p.classList.add('ve')); } }
  function responde(r, eleccion) {
    if (!r) return;
    if (!ini || ini.hidden) muestraInicio(true);
    enCharla(); if (laRed) laRed.habla();
    if (eleccion) burbuja('tu', eleccion);
    if (r.atras) { atras(); return; }
    if (r.nodo) { const n = NODOS[r.nodo]; if (r.nodo === 'inicio') { pila = ['inicio']; } else if (pila[pila.length - 1] !== r.nodo) pila.push(r.nodo); modo = n.pide || null; ponMarcador(); burbuja('el', n.d(), n.x); pintaOpciones(n.o ? r.nodo : (pila[pila.length - 2] || 'inicio')); if (n.a) setTimeout(n.a, 1100); return; }
    modo = null; ponMarcador(); burbuja('el', r.texto); if (r.a) setTimeout(r.a, 1100);
  }
  function elige(id) { responde({ nodo: id }, T(ETIQUETA[id] || id)); }
  function entra(id) { if (id === 'zero') abreZero(); else if (id === 'planeta') alPlaneta(); else if (id === 'com') irComunicaciones(); }
  function escribe(frase) { const f = String(frase || '').trim(); if (!f) return; responde(entiende(f, modo), f); }
  function atras() { if (pila.length > 1) pila.pop(); modo = null; ponMarcador(); const id = pila[pila.length - 1]; if (id === 'inicio') { ini.classList.remove('charla'); ini.querySelector('#nuc-charla').textContent = ''; } else burbuja('el', NODOS[id].d(), NODOS[id].x); pintaOpciones(id); }
  function revela(d, todo) {
    const pasos = [...d.querySelectorAll('.nuc-paso')];
    if (todo || reducir) { pasos.forEach((p) => p.classList.add('ve')); return; }
    const tiempos = [900, 2100, 2700, 3300, 3700, 4000, 4300, 4600];
    pasos.forEach((p, i) => setTimeout(() => p.classList.add('ve'), tiempos[Math.min(i, tiempos.length - 1)]));
  }
  function muestraInicio(rapido) {
    if (!ini) { ini = construyeInicio(); pintaOpciones('inicio'); }
    ini.hidden = false; ini.classList.remove('sale');
    if (laRed) laRed.para(); laRed = red(ini.querySelector('.nuc-lienzo'));
    revela(ini, !!rapido);
    barra.hidden = true;
    setTimeout(() => { const i = ini.querySelector('#nuc-q'); if (i) i.focus({ preventScroll: true }); }, rapido ? 50 : 3400);
  }
  function ocultaInicio() {
    barra.hidden = false;
    if (!ini || ini.hidden) return;
    ini.classList.add('sale');
    setTimeout(() => { if (!ini.classList.contains('sale')) return; ini.hidden = true; if (laRed) { laRed.para(); laRed = null; } }, 750);
  }

  // ---------- la barra de NÚCLEO bajo el planeta; dentro de una sección, un botón pequeño ----------
  const barra = document.createElement('form');
  barra.className = 'nuc-barra'; barra.id = 'nuc-barra'; barra.autocomplete = 'off'; barra.hidden = true;
  barra.innerHTML = '<button type="button" class="nuc-orbe" id="nuc-orbe" aria-label="Abrir NÚCLEO" title="NÚCLEO"></button><input id="nuc-bq" type="text" maxlength="200" placeholder="Pregúntale a NÚCLEO o dile adónde ir…" aria-label="Pídeselo a NÚCLEO"><button type="submit" class="nuc-ir">Ir</button>';
  document.body.append(barra);
  barra.addEventListener('submit', (e) => { e.preventDefault(); const i = barra.querySelector('#nuc-bq'); if (barra.classList.contains('mini')) { muestraInicio(true); return; } const f = i.value; i.value = ''; if (f.trim()) escribe(f); else muestraInicio(true); });
  barra.querySelector('#nuc-orbe').addEventListener('click', () => muestraInicio(true));
  // dueño, 09:53: el chat con NÚCLEO irá más adelante en otro sitio; de momento, la barra es solo el botón que vuelve a la portada
  barra.classList.add('mini');

  // ---------- dueño, 10:02 («que se vea todo limpio»): la portada reparte; al cerrar una sección se vuelve a la portada, salvo
  // con «Verme en Órbita», que lleva al planeta con tu ficha. El botón de volver dice «Inicio». ----------
  let verme = 0, estabaDentro = document.body.classList.contains('dentro');
  addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.tipo === 'orbita-verme') verme = Date.now(); });
  new MutationObserver(() => {
    const d = document.body.classList.contains('dentro');
    if (estabaDentro && !d) setTimeout(() => { if (Date.now() - verme > 1500 && !document.body.classList.contains('dentro')) muestraInicio(true); }, 60);
    estabaDentro = d;
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  { const vb = document.getElementById('volver'); if (vb) for (const n of vb.childNodes) if (n.nodeType === 3 && n.data.trim() === 'Órbita') n.data = 'Inicio'; }

  // ---------- arranque: la primera vez en esta visita, con su nacimiento; al volver en la misma visita, al momento ----------
  let visto = false; try { visto = sessionStorage.getItem('guardiana-nucleo') === '1'; sessionStorage.setItem('guardiana-nucleo', '1'); } catch (_) {}
  if (q.get('nucleo') === '0' || PUERTA_EN_URL) barra.hidden = false; else muestraInicio(visto);
  addEventListener('guardiana-idioma', () => { if (ini) { pintaOpciones(pila[pila.length - 1]); ponMarcador(); } });
  window.GuardianaNucleo = { inicio: () => muestraInicio(true), pide: escribe, elige };
})();
