/* GUARDIANA · Órbita · Radiografías (owner, 23 Oct 2026, 13:40, after the agency's sixth round: Órbita is the front page,
   Radiografías has its own door and comes first, before ZERO and Comunicaciones; «Empezar» leads here).
   Without the Windows program a web page cannot see the computer's own connections, so Radiografías looks at what can
   be seen honestly from here:
     · «Tú»: what any website sees of you. It opens «Mi conexión», measured in this browser; the outside lookup (address,
       operator, approximate city) is made only when the person asks for it.
     · «Una web»: who a website talks to. Today, the eleven sports and news front pages measured on 23 Oct 2026 (ESPEJO,
       drawn on the planet); any site the person chooses needs the browser in the cloud, so it says «pronto».
     · «Un enlace o archivo» («Abrir sin miedo»): a suspicious link or file opened in a disposable browser in the cloud.
       Not built yet: it says so.
     · «Tus aparatos»: what your phone and TV look up, with a DNS profile. Not built yet: it says so.
   23 Oct 2026, 15:05 (owner approves the structure the agency's four voices agree on): the mirror «Sin / Con» leaves the
   bottom of the front page and lives here, in «Una web» (its control only shows while the mirror is open), and «Abrir
   sin miedo» joins as a card of its own.
   The panel opens where the doors are (on the left; on a phone, from the bottom) and the planet stays in view.
   Nothing here is invented: no figure is shown that was not measured.
   31 Oct 2026 (owner, 30 Oct: «la versión web que teníamos, que ya estaba terminada, quiero que la metas en el programa»):
   inside the Windows program (data-en-programa on <html>), which does see the computer's own connections, a first card
   «Tu PC» opens them live on the planet (static/tu-pc.js), and the subtitle no longer says «Sin instalar nada». Outside the
   program the panel is exactly as before. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const enPrograma = () => document.documentElement.dataset.enPrograma === '1';
  const X = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  const FLECHA = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h9.5M8.5 4l4 4-4 4"/></svg>';
  const SALTO = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5H3.5v9h9V10M9 3.5h3.5V7M12.3 3.7 7.5 8.5"/></svg>';
  let panel = null, boton = null, abierto = false, salir = null;

  // ---------- the panel ----------
  function texto(el, s) { el.textContent = T(s); el.dataset.es = s; return el; }
  function crea(tag, cls, s) { const e = document.createElement(tag); if (cls) e.className = cls; if (s != null) texto(e, s); return e; }
  function monta() {
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'radiografias'; panel.className = 'radio-panel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'radio-t');
    const cab = crea('div', 'cab');
    const k = crea('div', 'k', 'Radiografías');
    const cerrar = document.createElement('button'); cerrar.type = 'button'; cerrar.className = 'cerrar'; cerrar.innerHTML = X;
    cerrar.addEventListener('click', () => (salir ? salir() : cierra()));
    cab.append(k, cerrar);
    const t = crea('h2', 't', 'Mira lo que no se ve.'); t.id = 'radio-t';
    const d = crea('p', 'd', 'Qué sabe de ti cualquier web y a quién habla cada página. Sin instalar nada.');

    // «Tú»
    const tu = crea('article', 'tarjeta tu');
    const tuK = crea('div', 'tk', 'Tú');
    const tuT = crea('h3', '', 'Qué ve de ti cualquier web');
    const tuD = crea('p', '', 'Tu navegador, tu sistema, tu idioma, tu hora y tu pantalla. Y, si lo pides, tu dirección en internet, tu operador y tu ciudad aproximada.');
    const tuB = document.createElement('button'); tuB.type = 'button'; tuB.className = 'accion';
    const tuBs = crea('span', '', 'Hacer mi radiografía'); tuB.append(tuBs); tuB.insertAdjacentHTML('beforeend', FLECHA);
    tuB.addEventListener('click', () => { vete(); setTimeout(() => { if (window.OrbitaConexion) window.OrbitaConexion.abre(true); }, 380); });
    tu.append(tuK, tuT, tuD, tuB);

    // «Una web»
    const web = crea('article', 'tarjeta web');
    const webK = crea('div', 'tk', 'Una web');
    const webT = crea('h3', '', 'A quién habla cada web');
    const webD = crea('p', '', 'Abrimos su portada en un navegador aparte y apuntamos cada conexión: la empresa, su país y para qué sirve, y qué cortaría GUARDIANA. Ya medidas:');
    const sitios = crea('div', 'sitios'); sitios.setAttribute('translate', 'no');
    const webN = crea('p', 'nota', 'Cualquier web que tú elijas: pronto, con el navegador en la nube.');
    web.append(webK, webT, webD, sitios, webN);
    sitios.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-s]'); if (!b) return;
      const s = b.dataset.s; vete(); // «todas» is not a site id: the mirror opens on the eleven together
      setTimeout(() => { if (window.OrbitaEspejo) window.OrbitaEspejo.abre('sin', s); }, 380);
    });

    // «Un enlace o archivo» («Abrir sin miedo», in all four voices of the agency's seventh round)
    const en = crea('article', 'tarjeta enlace pendiente');
    const enK = crea('div', 'tk'); const enKs = crea('span', '', 'Un enlace o archivo'); const enP = crea('span', 'pronto', 'Próximamente'); enK.append(enKs, enP);
    const enT = crea('h3', '', 'Ábrelo sin miedo');
    const enD = crea('p', '', 'Pega un enlace sospechoso o sube un archivo: lo abrimos en un navegador desechable en la nube, lejos de tu equipo, y te enseñamos qué intenta hacer antes de que lo abras tú.');
    en.append(enK, enT, enD);

    // «Tus aparatos»
    const ap = crea('article', 'tarjeta aparatos pendiente');
    const apK = crea('div', 'tk'); const apKs = crea('span', '', 'Tus aparatos'); const apP = crea('span', 'pronto', 'Próximamente'); apK.append(apKs, apP);
    const apT = crea('h3', '', 'Lo que consultan tu móvil y tu tele');
    const apD = crea('p', '', 'Con un perfil DNS, sin instalar nada, verás qué dominios consultan tus aparatos y cuáles se pueden cortar.');
    ap.append(apK, apT, apD);

    panel.append(cab, t, d, tu, web, en, ap);
    document.body.append(panel);
    programa();
    traduce();
    pintaSitios();
    return panel;
  }
  // ---------- inside the Windows program: «Tu PC», first, and a subtitle that does not say «Sin instalar nada» ----------
  const SUB_WEB = 'Qué sabe de ti cualquier web y a quién habla cada página. Sin instalar nada.';
  const SUB_PROGRAMA = 'Qué hace tu PC, qué sabe de ti cualquier web y a quién habla cada página.';
  function tarjetaPC() {
    const pc = crea('article', 'tarjeta tu-pc');
    const k = crea('div', 'tk'); k.append(crea('span', '', 'Tu PC'), crea('span', 'vivo', 'En directo'));
    const h = crea('h3', '', 'Lo que hace tu PC ahora mismo');
    const p = crea('p', '', 'Cada conexión de este equipo, en directo: con qué empresa habla, dónde está su servidor y si GUARDIANA la ha cortado. Solo lo ve el programa instalado.');
    const acc = crea('div', 'acciones');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'accion';
    b.append(crea('span', '', 'Ver mi PC en directo')); b.insertAdjacentHTML('beforeend', FLECHA);
    b.addEventListener('click', () => { vete(); setTimeout(() => { if (window.OrbitaTuPC) window.OrbitaTuPC.abre(); }, 380); });
    // the program's own tools: the program takes this click (data-producto) and shows its panel; the address is that panel's,
    // on this same computer, for the case nothing takes it
    const herr = document.createElement('a'); herr.className = 'secundaria'; herr.href = 'http://127.0.0.1:7443/'; herr.dataset.producto = 'guardiana';
    herr.append(crea('span', '', 'Herramientas del programa')); herr.insertAdjacentHTML('beforeend', SALTO);
    acc.append(b, herr);
    pc.append(k, h, p, acc);
    return pc;
  }
  function programa() {
    if (!panel) return;
    const si = enPrograma(), d = panel.querySelector(':scope > .d'), pc = panel.querySelector('.tu-pc');
    if (d) texto(d, si ? SUB_PROGRAMA : SUB_WEB);
    if (si && !pc) panel.insertBefore(tarjetaPC(), panel.querySelector('.tarjeta.tu'));
    else if (!si && pc) pc.remove();
    // the PC Scanner: inside the program, right after «Tu PC», and it scans; on the web, after «Una web», and it says what it
    // does and offers the program (it needs it to measure)
    let esc = panel.querySelector('.tarjeta.escaner'); if (!esc) esc = tarjetaEscaner();
    const ancla = si ? panel.querySelector('.tu-pc') : panel.querySelector('.tarjeta.web');
    if (ancla && ancla.nextElementSibling !== esc) ancla.after(esc);
    texto(esc.querySelector('p'), si ? ESC_PROGRAMA : ESC_WEB);
    texto(esc.querySelector('.accion span'), si ? 'Escanear este equipo' : 'Ver qué examina');
  }
  // 31 Oct 2026 (the owner, 23:32 and 00:10: «Vigía se cambia por escáner pc»): static/escaner.js
  const ESC_PROGRAMA = 'Protección y antivirus, cámara, micrófono y pantalla, control remoto, telemetría y todo lo que sale de este equipo, en una sola lectura que no cambia nada.';
  const ESC_WEB = 'Lo que Windows y el programa saben de este equipo, en una sola lectura. Necesita el programa GUARDIANA para Windows.';
  function tarjetaEscaner() {
    const es = crea('article', 'tarjeta escaner');
    const k = crea('div', 'tk'); k.append(crea('span', '', 'Escáner PC'));
    const b = document.createElement('button'); b.type = 'button'; b.className = 'accion';
    b.append(crea('span', '', 'Escanear este equipo')); b.insertAdjacentHTML('beforeend', FLECHA);
    b.addEventListener('click', () => { const prog = enPrograma(); vete(); setTimeout(() => { if (window.OrbitaEscaner) window.OrbitaEscaner.abre({ escanea: prog }); }, 380); });
    es.append(k, crea('h3', '', 'Examen completo de este equipo'), crea('p', '', ESC_PROGRAMA), b);
    return es;
  }
  // the measured front pages, from the mirror's own data
  async function pintaSitios() {
    const caja = panel && panel.querySelector('.sitios'); if (!caja || caja.childElementCount) return;
    let D = null;
    try { D = window.OrbitaEspejo && window.OrbitaEspejo.carga ? await window.OrbitaEspejo.carga() : null; } catch (_) { D = null; }
    if (!D || !D.sitios) { caja.hidden = true; return; }
    // the eleven at once first (what the bottom control used to open), then each front page
    const todas = document.createElement('button'); todas.type = 'button'; todas.dataset.s = 'todas'; todas.className = 'todas';
    const tn = document.createElement('span'); texto(tn, 'Todas'); todas.append(tn); caja.append(todas);
    D.sitios.forEach((s) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.s = s.id; b.title = s.web;
      const n = document.createElement('span'); n.textContent = s.nombre;
      const p = document.createElement('small'); p.textContent = s.pais;
      b.append(n, p); caja.append(b);
    });
  }
  function traduce() {
    if (boton) boton.querySelector('span').textContent = T('Empezar');
    if (!panel) return;
    panel.querySelectorAll('[data-es]').forEach((e) => { e.textContent = T(e.dataset.es); });
    panel.setAttribute('aria-label', T('Radiografías'));
    const c = panel.querySelector('.cerrar'); c.setAttribute('aria-label', T('Cerrar')); c.title = T('Cerrar');
  }

  // ---------- opening and closing ----------
  // `fuera` is the door's way back (it also tidies the address); without it the panel just closes
  function abre(fuera) {
    monta(); salir = typeof fuera === 'function' ? fuera : null;
    if (abierto) return;
    abierto = true;
    programa(); traduce();
    // another view that holds the planet steps aside first
    if (window.OrbitaEspejo && window.OrbitaEspejo.activo) window.OrbitaEspejo.cierra();
    if (window.OrbitaTuPC && window.OrbitaTuPC.activo) window.OrbitaTuPC.cierra();
    const pc = $('conexion'); if (pc && !pc.hidden && window.OrbitaConexion) window.OrbitaConexion.abre(false);
    panel.hidden = false; panel.classList.remove('sale');
    document.body.classList.add('en-radio');
    setTimeout(() => { const b = panel.querySelector('.tu-pc .accion') || panel.querySelector('.tu .accion'); if (abierto && b) b.focus({ preventScroll: true }); }, 450);
  }
  function cierra() {
    if (!abierto) return;
    abierto = false; salir = null;
    document.body.classList.remove('en-radio');
    panel.classList.add('sale');
    setTimeout(() => { if (!abierto) { panel.hidden = true; panel.classList.remove('sale'); } }, 260);
  }
  // leave through the door (the address loses «#radiografias»), then open what was chosen
  function vete() { if (salir) salir(); else cierra(); }

  // ---------- «Empezar» ----------
  // Not in the header (it is full on a laptop): after the phrase under the planet fades, «Empezar» takes its place, in
  // the middle of the same gap, and leads to Radiografías. It goes for good once the person starts anything — opens a
  // door, the mirror, «Mi conexión», the journey, or zooms in — and a returning visitor who already did is not asked.
  const K = 'guardiana_empezado';
  let empezado = (() => { try { return localStorage.getItem(K) === '1'; } catch (_) { return false; } })();
  let radioIni = 0, vigia = 0;
  const ocupado = () => /\b(dentro|en-espejo|en-radio|viaje|solo-tu)\b/.test(document.body.className);
  function montaBoton() {
    if (boton) return boton;
    boton = document.createElement('button'); boton.type = 'button'; boton.id = 'empezar'; boton.className = 'empezar'; boton.hidden = true;
    boton.setAttribute('aria-controls', 'radiografias');
    boton.innerHTML = '<span></span>' + FLECHA; boton.querySelector('span').textContent = T('Empezar');
    // 25 Oct 2026 (agency round 39, two voices: «una bienvenida que explique para qué sirve»): «Empezar» opens a short
    // welcome with the three ways in, instead of jumping straight to Radiografías
    boton.addEventListener('click', () => { bienvenida(); });
    document.body.append(boton);
    return boton;
  }
  let bienv = null;
  function cierraBienvenida() { if (bienv) { bienv.remove(); bienv = null; } }
  function bienvenida() {
    cierraBienvenida();
    bienv = document.createElement('div'); bienv.className = 'lugar bienvenida'; bienv.setAttribute('role', 'dialog'); bienv.setAttribute('aria-modal', 'true');
    const caja = document.createElement('div'); caja.className = 'lugar-caja';
    const k = document.createElement('div'); k.className = 'k'; k.textContent = T('ÓRBITA');
    const h = document.createElement('h2'); h.textContent = T('Descubre por dónde viajan tus datos');
    const p = document.createElement('p'); p.textContent = T('Tres caminos: recorre los cables, los centros de datos y los satélites por los que pasa tu vida digital; mide tu propia conexión; o mira qué ve de ti cualquier web.');
    const acc = document.createElement('div'); acc.className = 'acciones';
    const mk = (txt, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = T(txt); b.addEventListener('click', () => { cierraBienvenida(); empieza(); fn(); }); acc.append(b); return b; };
    const b1 = mk('Explorar el planeta', 'boton principal', () => {});
    mk('Ver mi conexión', 'boton', () => { const c = document.getElementById('conexion-btn'); if (c) c.click(); });
    mk('Qué ven de ti las webs', 'boton', () => { if (window.OrbitaPuertas) window.OrbitaPuertas.abre('radiografias'); else abre(); });
    caja.append(k, h, p, acc); bienv.append(caja); document.body.append(bienv);
    bienv.addEventListener('click', (e) => { if (e.target === bienv) { cierraBienvenida(); empieza(); } });
    b1.focus();
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && bienv) { cierraBienvenida(); empieza(); } });
  addEventListener('guardiana-idioma', () => { if (bienv) bienvenida(); });
  function colocaBoton() {
    if (!boton || boton.hidden) return true;
    const h = window.OrbitaHueco && window.OrbitaHueco(); if (!h) return true;
    const alto = boton.offsetHeight || 42;
    if (h.suelo - h.techo < alto + 24) return false;
    boton.style.top = ((h.techo + h.suelo) / 2 - alto / 2).toFixed(1) + 'px';
    boton.style.left = h.cx.toFixed(1) + 'px';
    return true;
  }
  function invita() {
    if (empezado || abierto || ocupado()) return;
    const l = $('lugar'); if (l && !l.hidden) return;
    montaBoton(); boton.hidden = false;
    if (!colocaBoton()) { boton.hidden = true; return; }
    const G = window.OrbitaPlaneta && window.OrbitaPlaneta.geo; radioIni = G ? G.R : 0;
    requestAnimationFrame(() => boton && boton.classList.add('entra'));
    cancelAnimationFrame(vigia); vigia = requestAnimationFrame(vigila);
  }
  // a zoom makes the planet take the gap: the person is exploring, «Empezar» has done its job
  function vigila() {
    if (!boton || boton.hidden || empezado) return;
    const G = window.OrbitaPlaneta && window.OrbitaPlaneta.geo;
    if (G && radioIni && Math.abs(G.R - radioIni) > radioIni * 0.03) { empieza(); return; }
    vigia = requestAnimationFrame(vigila);
  }
  function empieza() {
    if (empezado) return; empezado = true;
    try { localStorage.setItem(K, '1'); } catch (_) {}
    cancelAnimationFrame(vigia);
    if (boton) { boton.classList.remove('entra'); setTimeout(() => { if (boton) boton.hidden = true; }, 600); }
  }
  addEventListener('guardiana-frase-fin', invita);
  addEventListener('resize', () => { if (boton && !boton.hidden && !colocaBoton()) boton.hidden = true; });
  // anything the person opens counts as having started
  new MutationObserver(() => { if (!empezado && ocupado()) empieza(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !abierto) return;
    if (document.getElementById('lugar') && !document.getElementById('lugar').hidden) return;
    e.preventDefault(); vete();
  });
  // a view that takes the whole planet (a door, the journey) closes the panel
  new MutationObserver(() => { if (abierto && /\b(dentro|viaje|en-espejo|en-tupc)\b/.test(document.body.className)) cierra(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  addEventListener('guardiana-idioma', traduce);
  window.OrbitaRadiografias = { abre, cierra, get abierto() { return abierto; } };
})();
