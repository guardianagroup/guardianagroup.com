// GUARDIANA · NÚCLEO (27 Oct 2026). La puerta de entrada de GUARDIANA y su guía en toda la web.
// Dueño, 08:42: «pantalla negra y en el medio nace el navegador con el cerebro neuronal… ella te pregunta: buenos días,
// bienvenido a esta experiencia de tus datos… ¿qué desea hacer?… y te va derivando». Ronda 52 de la agencia (ChatGPT,
// Gemini y Astra): entrada en negro, nace la red neuronal, saludo por la hora local, tres accesos y un campo para pedir;
// en las secciones sigue presente. Esta primera versión no usa IA generativa: entiende frases con reglas y abre cada
// parte de verdad. Solo habla de GUARDIANA, la web y los datos. No guarda nada ni lo envía a nadie.
'use strict';
(() => {
  const T = (s) => { try { return window.GuardianaIdioma ? GuardianaIdioma.t(s) : s; } catch (_) { return s; } };
  const loc = () => { try { return (window.GuardianaIdioma && GuardianaIdioma.locale) || 'es'; } catch (_) { return 'es'; } };
  const sinTildes = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  const q = new URLSearchParams(location.search);
  const PUERTA_EN_URL = /^#(zero|radiografias|comunicaciones|mi-conexion)$/.test(location.hash);
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- el saludo según la hora del equipo (no pide ubicación) ----------
  const saludo = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'Buenos días' : h >= 12 && h < 20 ? 'Buenas tardes' : 'Buenas noches'; };

  // ---------- la red neuronal que nace en el centro ----------
  function red(lienzo) {
    const cx = lienzo.getContext('2d'); if (!cx) return { habla() {}, para() {} };
    const N = 300, P = [];
    for (let i = 0; i < N; i++) { // puntos repartidos en una esfera (espiral de Fibonacci) con un poco de relieve
      const y = 1 - (i + .5) * 2 / N, r = Math.sqrt(1 - y * y), a = i * 2.39996323, k = .86 + Math.random() * .2;
      P.push([Math.cos(a) * r * k, y * k, Math.sin(a) * r * k, Math.random() * Math.PI * 2]);
    }
    const V = P.map((p, i) => P.map((o, j) => [j, (p[0] - o[0]) ** 2 + (p[1] - o[1]) ** 2 + (p[2] - o[2]) ** 2]).filter((x) => x[0] !== i).sort((a, b) => a[1] - b[1]).slice(0, 3).map((x) => x[0]));
    let t0 = performance.now(), habla = 0, vivo = true, W = 0, H = 0, dpr = 1;
    const mide = () => { const r = lienzo.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = Math.max(1, r.width); H = Math.max(1, r.height); lienzo.width = W * dpr; lienzo.height = H * dpr; };
    mide(); addEventListener('resize', mide, { passive: true });
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    function cuadro(ahora) {
      if (!vivo) return;
      const t = (ahora - t0) / 1000, nace = reducir ? 1 : ease((t - .7) / 1.6), rot = reducir ? .6 : t * .18;
      habla *= .95;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * .4 * (.04 + .96 * nace) * (1 + habla * .05), c = Math.cos(rot), s = Math.sin(rot), ct = Math.cos(.35), st = Math.sin(.35);
      // la chispa del principio
      if (nace < 1) { const g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 40 + 60 * nace); g.addColorStop(0, `rgba(244,246,248,${.9 * (1 - nace * .7)})`); g.addColorStop(.3, `rgba(156,195,228,${.55 * (1 - nace * .5)})`); g.addColorStop(1, 'rgba(156,195,228,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
      const Q = P.map((p) => { const x = p[0] * c + p[2] * s, z0 = -p[0] * s + p[2] * c, y = p[1] * ct - z0 * st, z = p[1] * st + z0 * ct, pul = 1 + .04 * Math.sin(t * 1.7 + p[3]) + habla * .06 * Math.sin(t * 9 + p[3]); return [W / 2 + x * R * pul, H / 2 + y * R * pul, z]; });
      cx.lineWidth = 1;
      const lin = Math.max(0, Math.min(1, (nace - .25) / .6));
      if (lin > 0) for (let i = 0; i < N; i++) for (const j of V[i]) { if (j < i) continue; const a = Q[i], b = Q[j], zz = (a[2] + b[2]) / 2; cx.strokeStyle = `rgba(156,195,228,${(.08 + .26 * (zz + 1) / 2 + habla * .15) * lin})`; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
      for (let i = 0; i < N; i++) { const a = Q[i], f = (a[2] + 1) / 2; cx.fillStyle = `rgba(${210 + 34 * f},${228 + 18 * f},248,${(.25 + .7 * f) * Math.min(1, nace * 1.4)})`; cx.beginPath(); cx.arc(a[0], a[1], .7 + 1.5 * f, 0, Math.PI * 2); cx.fill(); }
      const g2 = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 1.25); g2.addColorStop(0, `rgba(156,195,228,${.10 + habla * .12})`); g2.addColorStop(1, 'rgba(156,195,228,0)'); cx.fillStyle = g2; cx.fillRect(0, 0, W, H);
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
    return { habla() { habla = 1; }, para() { vivo = false; } };
  }

  // ---------- lo que sabe NÚCLEO (solo GUARDIANA, la web y los datos) ----------
  const AYUDA = {
    nucleo: 'Soy NÚCLEO, el asistente de GUARDIANA. Te llevo a cada parte y te explico lo que pasa con tus datos. Solo hablo de GUARDIANA, de la web y de tus datos.',
    zero: 'ZERO es el navegador de GUARDIANA: la web se abre en una burbuja aislada en un servidor de GUARDIANA y a tu equipo solo llegan imágenes. A la derecha, la Radiografía te enseña quién intenta conectarse, las subastas de tus datos y lo que puedes cortar.',
    orbita: 'Órbita es el planeta de GUARDIANA: cables submarinos, cables por tierra, centros de datos y satélites, y cada corte en directo.',
    com: 'Comunicaciones es el chat y el envío de archivos de GUARDIANA, cifrados de extremo a extremo entre dos equipos, con un código de 9 cifras. Yo no puedo leer tus mensajes ni tus archivos.',
    guardiana: 'GUARDIANA te enseña y te deja cortar lo que la web hace con tus datos: navegar en una burbuja con ZERO, ver la red del planeta en Órbita y hablar cifrado con Comunicaciones.',
  };
  const NO_SE = 'Solo puedo ayudarte con GUARDIANA: navegar con ZERO, el planeta con sus cables y satélites, Comunicaciones y tus datos. Prueba con «Muéstrame los cables de Colombia» o «Abre eltiempo.com».';
  const CAPAS = [['sub', /submarin|cables? (del|de el)? ?mar|undersea|submarine/], ['fibra', /por tierra|terrestre|fibra|land cable|fiber|fibre/], ['puntos', /centros? de datos|data ?cent(er|re)s?|datacenter/], ['sat', /satelit|satellite/]];
  const NOMBRE_CAPA = { sub: 'los cables submarinos', fibra: 'los cables por tierra', puntos: 'los centros de datos', sat: 'los satélites' };
  let PAISES = null;
  function paises() { // nombres de país en español, inglés y el idioma de la página → código
    if (PAISES) return PAISES;
    PAISES = [];
    const C = (window.OrbitaPlaneta && OrbitaPlaneta.centros) || {};
    const dns = ['es', 'en', loc()].map((l) => { try { return new Intl.DisplayNames([l], { type: 'region' }); } catch (_) { return null; } }).filter(Boolean);
    for (const k of Object.keys(C)) { if (!/^[A-Z]{2}$/.test(k)) continue; const vistos = new Set(); for (const d of dns) { let n = ''; try { n = d.of(k); } catch (_) {} n = sinTildes(n); if (n && n.length > 2 && !vistos.has(n)) { vistos.add(n); PAISES.push([n, k]); } } }
    PAISES.push(['eeuu', 'US'], ['ee uu', 'US'], ['usa', 'US'], ['reino unido', 'GB'], ['inglaterra', 'GB']);
    PAISES.sort((a, b) => b[0].length - a[0].length);
    return PAISES;
  }
  const paisEn = (t) => { for (const [n, k] of paises()) { const re = new RegExp('(^|[^a-z])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)'); if (re.test(t)) return k; } return null; };
  const nombrePais = (k) => { try { return new Intl.DisplayNames([loc()], { type: 'region' }).of(k); } catch (_) { return k; } };

  // Una frase → una acción. Devuelve { texto, accion }.
  function entiende(frase) {
    const t = sinTildes(frase);
    if (!t) return null;
    const dom = /(^|\s)((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?)/i.exec(String(frase).trim());
    if (/^(hola|buenas|buenos dias|buen dia|hey|hi|hello|good (morning|afternoon|evening))\b/.test(t) && t.split(' ').length <= 3) return { texto: T(saludo()) + '. ' + T('¿Qué deseas hacer?') };
    if (/^(inicio|ir al inicio|volver al inicio|llevame al inicio|home)$/.test(t)) return { texto: T('Vuelvo al inicio.'), accion: () => muestraInicio(true) };
    if (/^(volver|atras|back)$/.test(t)) return { texto: T('Vuelvo atrás.'), accion: () => { const v = document.getElementById('volver'); if (v && !v.hidden) v.click(); else history.back(); } };
    if (/(pdf|informe|reporte|report)/.test(t)) return { texto: T('El informe en PDF lo hago con lo que ZERO ve en una web. Abro ZERO: abre una web y pídemelo, o pulsa «PDF» en la Radiografía.'), accion: () => { const w = marcoZero(); if (w && typeof w.zeroInforme === 'function') { w.zeroInforme(); } else abreZero(); } };
    if (dom && !/^(guardiana|guardianagroup)\./.test(dom[2])) { const d = dom[2].replace(/^https?:\/\//i, ''); return { texto: T('Abro {1} en ZERO, dentro de la burbuja.').replace('{1}', d), accion: () => abreZero(d) }; }
    if (/(que es|que hace|como funciona|para que sirve|quien eres|que eres|que puedes|ayuda|what is|how does|help)/.test(t)) {
      if (/nucleo|quien eres|que eres|que puedes|help|ayuda/.test(t) && !/zero|orbita|planeta|comunicacion|guardiana/.test(t)) return { texto: T(AYUDA.nucleo) };
      if (/zero|navegador|burbuja|radiograf/.test(t)) return { texto: T(AYUDA.zero) };
      if (/orbita|planeta|mapa|cable|satelit/.test(t)) return { texto: T(AYUDA.orbita) };
      if (/comunicacion|chat|cifrad/.test(t)) return { texto: T(AYUDA.com) };
      return { texto: T(AYUDA.guardiana) };
    }
    if (/(comunicacion|chat|mensaje|enviar (un )?archivo|mandar (un )?archivo|archivo cifrado|hablar con|codigo de 9|message|send a file)/.test(t)) return { texto: T('Abro Comunicaciones.'), accion: () => { location.href = 'comunicaciones/'; } };
    if (/(naveg|navegador|zero|burbuja|abrir? (una )?web|entrar en (una )?web|buscar en internet|rastre|quien me sigue|subasta|radiograf|cookies|browse|browser)/.test(t)) return { texto: T('Abro ZERO, el navegador de GUARDIANA.'), accion: () => abreZero() };
    const capa = (CAPAS.find(([, re]) => re.test(t)) || [])[0], pais = paisEn(t);
    if (capa || pais || /(planeta|mapa|orbita|cables?|cortes? en directo|en directo|el mundo|tierra|planet|map)/.test(t)) {
      let texto;
      if (capa && pais) texto = T('Te llevo al planeta: {1} en {2}.').replace('{1}', T(NOMBRE_CAPA[capa])).replace('{2}', nombrePais(pais));
      else if (capa) texto = T('Te llevo al planeta y enciendo {1}.').replace('{1}', T(NOMBRE_CAPA[capa]));
      else if (pais) texto = T('Te llevo al planeta, a {1}.').replace('{1}', nombrePais(pais));
      else texto = T('Te llevo al planeta.');
      return { texto, accion: () => alPlaneta(capa, pais) };
    }
    return { texto: T(NO_SE) };
  }

  // ---------- acciones reales ----------
  function marcoZero() { try { const m = document.getElementById('marco'); if (m && !m.hidden && m.contentWindow && /\/zero\//.test(m.contentWindow.location.pathname)) return m.contentWindow; } catch (_) {} return null; }
  function abreZero(web) {
    ocultaInicio();
    if (!marcoZero() && window.OrbitaPuertas) OrbitaPuertas.abre('zero');
    if (!web) return;
    let n = 0; const intenta = () => { // cuando ZERO esté listo, escribe la dirección en su barra y la abre
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

  // ---------- la portada ----------
  let ini = null, laRed = null;
  function construyeInicio() {
    const d = document.createElement('section');
    d.className = 'nuc-ini'; d.id = 'nuc-ini'; d.setAttribute('aria-label', 'NÚCLEO, la entrada de GUARDIANA');
    d.innerHTML = '<canvas class="nuc-lienzo" aria-hidden="true"></canvas>'
      + '<p class="nuc-k nuc-paso">NÚCLEO · GUARDIANA</p>'
      + '<h1 class="nuc-paso" id="nuc-saludo"></h1>'
      + '<p class="nuc-sub nuc-paso">Bienvenido a esta experiencia de tus datos.<b>¿Qué deseas hacer?</b></p>'
      + '<form class="nuc-form nuc-paso" id="nuc-form" autocomplete="off"><input id="nuc-q" type="text" maxlength="200" placeholder="Escribe qué deseas hacer…" aria-label="Pídeselo a NÚCLEO"><button type="submit">Ir</button></form>'
      + '<p class="nuc-resp" id="nuc-resp" aria-live="polite"></p>'
      + '<div class="nuc-ops nuc-paso" role="group" aria-label="Qué deseas hacer">'
      + '<button type="button" class="nuc-op" data-q="Quiero navegar"><i>ZERO</i><b>Navegar con ZERO</b><small>La web se abre en una burbuja aislada y ves quién intenta llevarse tus datos.</small></button>'
      + '<button type="button" class="nuc-op" data-q="Quiero ver el planeta"><i>ÓRBITA</i><b>Explorar el planeta</b><small>Cables submarinos y por tierra, centros de datos, satélites y cortes en directo.</small></button>'
      + '<button type="button" class="nuc-op" data-q="Quiero ir a Comunicaciones"><i>COMUNICACIONES</i><b>Hablar cifrado</b><small>Chat y archivos cifrados de extremo a extremo entre dos equipos.</small></button>'
      + '</div>'
      + '<div class="nuc-pie nuc-paso"><span>NÚCLEO solo habla de GUARDIANA, de la web y de tus datos. No guarda lo que le pides.</span><button type="button" class="nuc-salta" id="nuc-salta">Ir directo al planeta</button></div>';
    document.body.append(d);
    d.querySelector('#nuc-saludo').textContent = saludo();
    d.querySelector('#nuc-form').addEventListener('submit', (e) => { e.preventDefault(); const i = d.querySelector('#nuc-q'); pide(i.value, d.querySelector('#nuc-resp')); i.value = ''; });
    d.querySelectorAll('.nuc-op').forEach((b) => b.addEventListener('click', () => pide(b.dataset.q, d.querySelector('#nuc-resp'))));
    d.querySelector('#nuc-salta').addEventListener('click', () => alPlaneta());
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') alPlaneta(); });
    return d;
  }
  function revela(d, todo) {
    const pasos = [...d.querySelectorAll('.nuc-paso')];
    if (todo || reducir) { pasos.forEach((p) => p.classList.add('ve')); return; }
    const tiempos = [900, 2100, 2700, 3200, 3700, 4300];
    pasos.forEach((p, i) => setTimeout(() => p.classList.add('ve'), tiempos[Math.min(i, tiempos.length - 1)]));
  }
  function muestraInicio(rapido) {
    if (!ini) ini = construyeInicio();
    ini.hidden = false; ini.classList.remove('sale');
    if (laRed) laRed.para(); laRed = red(ini.querySelector('.nuc-lienzo'));
    revela(ini, !!rapido);
    barra.hidden = true;
    setTimeout(() => { const i = ini.querySelector('#nuc-q'); if (i) i.focus({ preventScroll: true }); }, rapido ? 50 : 3300);
  }
  function ocultaInicio() {
    if (!ini || ini.hidden) { barra.hidden = false; return; }
    ini.classList.add('sale'); barra.hidden = false;
    setTimeout(() => { ini.hidden = true; if (laRed) { laRed.para(); laRed = null; } }, 750);
  }
  function pide(frase, salida) {
    const r = entiende(frase); if (!r) return;
    if (laRed) laRed.habla();
    pinta(salida, r.texto);
    if (r.accion) setTimeout(r.accion, 900);
  }
  function pinta(el, texto) { if (!el) return; el.textContent = ''; const k = document.createElement('span'); k.className = 'nq'; k.textContent = 'NÚCLEO'; el.append(k, document.createTextNode(texto)); if (el.hidden) el.hidden = false; }

  // ---------- la barra de NÚCLEO bajo el planeta, presente en toda Órbita ----------
  const barra = document.createElement('form');
  barra.className = 'nuc-barra'; barra.id = 'nuc-barra'; barra.autocomplete = 'off'; barra.hidden = true;
  barra.innerHTML = '<p class="nuc-dice" id="nuc-dice" aria-live="polite" hidden></p><button type="button" class="nuc-orbe" id="nuc-orbe" aria-label="NÚCLEO: volver al inicio" title="NÚCLEO"></button><input id="nuc-bq" type="text" maxlength="200" placeholder="Pregúntale a NÚCLEO o dile adónde ir…" aria-label="Pídeselo a NÚCLEO"><button type="submit" class="nuc-ir">Ir</button>';
  document.body.append(barra);
  barra.addEventListener('submit', (e) => { e.preventDefault(); const i = barra.querySelector('#nuc-bq'); if (barra.classList.contains('mini')) { barra.classList.remove('mini'); i.focus(); return; } pide(i.value, barra.querySelector('#nuc-dice')); i.value = ''; });
  barra.querySelector('#nuc-orbe').addEventListener('click', () => { if (barra.classList.contains('mini')) { barra.classList.remove('mini'); barra.querySelector('#nuc-bq').focus(); } else muestraInicio(true); });
  // con una sección abierta (ZERO a pantalla completa), la barra se recoge en un botón pequeño abajo a la izquierda
  const mira = () => { const d = document.body.classList.contains('dentro'); barra.classList.toggle('mini', d); if (d) barra.querySelector('#nuc-dice').hidden = true; };
  new MutationObserver(mira).observe(document.body, { attributes: true, attributeFilter: ['class'] }); mira();

  // ---------- arranque ----------
  // la primera vez en esta visita, con su nacimiento; al volver a Órbita en la misma visita, al momento
  let visto = false; try { visto = sessionStorage.getItem('guardiana-nucleo') === '1'; sessionStorage.setItem('guardiana-nucleo', '1'); } catch (_) {}
  if (q.get('nucleo') === '0' || PUERTA_EN_URL) barra.hidden = false; else muestraInicio(visto);
  window.GuardianaNucleo = { inicio: () => muestraInicio(true), pide: (f) => pide(f, (ini && !ini.hidden) ? ini.querySelector('#nuc-resp') : barra.querySelector('#nuc-dice')) };
})();
