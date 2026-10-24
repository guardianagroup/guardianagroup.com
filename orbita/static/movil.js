/* GUARDIANA · Órbita en el móvil, «M1 · Planeta protagonista» (23 Oct 2026, chosen by the owner; styles in movil.css).
   On a phone the header keeps only GUARDIANA, «Capas» and «···»; the layers and everything else live in two sheets that
   rise from the bottom; «Ver mi conexión» is the one big button; the three doors are a bar at the bottom; the card of a
   cable opens small and grows with a swipe up. Nothing is rebuilt: the sheets drive the same layer and class buttons
   the computer uses (window.OrbitaCapas, the class cards, the language list, the location dialog), so both stay in step.
   Only on body.m2 (set in index.html); on tablets and computers this file does nothing visible. */
(() => {
  'use strict';
  const B = document.body;
  if (!B.classList.contains('m2')) return;
  const $ = (id) => document.getElementById(id);
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const movil = () => innerWidth <= 760;
  const SVG = {
    capas: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M8 2 1.5 5.2 8 8.4l6.5-3.2z"/><path d="m1.5 8 6.5 3.2L14.5 8"/><path d="m1.5 10.8 6.5 3.2 6.5-3.2"/></svg>',
    mas: '<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></svg>',
    rx: '<svg class="m2-ico" width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="2.5" y="2" width="11" height="12" rx="2"/><path d="M5 5.5h6M5 8h6M5 10.5h3.5"/></svg>',
    zero: '<svg class="m2-ico" width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 1.6 13.4 3.8v3.9c0 3.1-2.3 5.6-5.4 6.6-3.1-1-5.4-3.5-5.4-6.6V3.8z"/></svg>',
    com: '<svg class="m2-ico" width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"/></svg>',
  };

  // ---------- the doors: an icon and a short tag each («Gratis», «Demo», «Pronto») ----------
  const PUERTA = [['rx', 'Gratis'], ['zero', 'Demo'], ['com', 'Pronto']];
  document.querySelectorAll('#puertas .puerta:not(.aparte) button').forEach((b, i) => {
    const p = PUERTA[i]; if (!p) return;
    b.insertAdjacentHTML('afterbegin', SVG[p[0]]);
    const tag = document.createElement('span'); tag.className = 'm2-tag'; tag.textContent = p[1]; b.appendChild(tag);
  });

  // ---------- «Ver mi conexión» leaves the header and floats over the bar (and goes back if the window grows wide) ----------
  const M2 = matchMedia('(max-width: 760px), (max-width: 1400px) and (pointer: coarse)');
  const mueveConexion = () => { const b = $('conexion-btn'); if (!b) return false;
    if (M2.matches) { if (b.parentElement !== B) B.appendChild(b); }
    else { const der = document.querySelector('header .derecha'); if (der && b.parentElement !== der) der.insertBefore(b, der.firstChild); }
    return true; };
  if (!mueveConexion()) { const mo = new MutationObserver(() => { if (mueveConexion()) mo.disconnect(); }); mo.observe(document.querySelector('header') || B, { childList: true, subtree: true }); }
  M2.addEventListener('change', mueveConexion);

  // ---------- top right: «Capas» and «···» ----------
  const arriba = document.createElement('div'); arriba.className = 'm2-arriba';
  arriba.innerHTML = '<button type="button" class="capas" aria-haspopup="dialog">' + SVG.capas + '<span>Capas</span><span class="n" aria-hidden="true"></span></button>'
    + '<button type="button" class="mas" aria-haspopup="dialog" aria-label="Más">' + SVG.mas + '</button>';
  B.appendChild(arriba);

  // ---------- the sheets ----------
  const velo = document.createElement('div'); velo.className = 'm2-velo'; B.appendChild(velo);
  let abierta = null;
  function hoja(id, titulo, pinta) {
    const el = document.createElement('section'); el.className = 'm2-hoja'; el.id = id; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', titulo);
    el.innerHTML = '<div class="asa" aria-hidden="true"></div><h2></h2><div class="cuerpo"></div>';
    el.querySelector('h2').textContent = titulo;
    B.appendChild(el);
    const h = { id, el, cuerpo: el.querySelector('.cuerpo'), pinta };
    arrastre(el, el.querySelector('.asa'), () => cierra());
    return h;
  }
  function abre(h) {
    if (abierta === h) return;
    if (abierta) cierra(true);
    h.pinta(h); h.el.hidden = false; abierta = h;
    requestAnimationFrame(() => requestAnimationFrame(() => { h.el.classList.add('on'); velo.classList.add('on'); }));
    B.classList.add('m2-hoja-abierta');
    try { history.pushState({ m2hoja: h.id }, '', location.href); } catch (_) {}
    setTimeout(() => { const f = h.el.querySelector('button, a'); if (f) f.focus({ preventScroll: true }); }, 320);
  }
  function cierra(sinHistoria) {
    const h = abierta; if (!h) return; abierta = null;
    h.el.classList.remove('on'); h.el.style.transform = ''; velo.classList.remove('on'); B.classList.remove('m2-hoja-abierta');
    setTimeout(() => { if (abierta !== h) h.el.hidden = true; }, 320);
    if (!sinHistoria && history.state && history.state.m2hoja) { try { history.back(); } catch (_) {} }
  }
  velo.addEventListener('click', () => cierra());
  addEventListener('popstate', () => { if (abierta && !(history.state && history.state.m2hoja)) cierra(true); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierta) { e.stopPropagation(); cierra(); } }, true);
  // a sheet follows the finger down and closes past 80 px (or with a quick flick); a short pull springs back
  function arrastre(el, asa, alCerrar) {
    let y0 = null, t0 = 0, dy = 0;
    const ini = (y) => { y0 = y; t0 = performance.now(); dy = 0; el.classList.add('arrastra'); };
    const mov = (y) => { if (y0 == null) return; dy = Math.max(0, y - y0); el.style.transform = 'translateY(' + dy + 'px)'; };
    const fin = () => { if (y0 == null) return; const v = dy / Math.max(1, performance.now() - t0); y0 = null; el.classList.remove('arrastra'); el.style.transform = ''; if (dy > 80 || (dy > 24 && v > 0.6)) alCerrar(); };
    asa.addEventListener('pointerdown', (e) => { ini(e.clientY); asa.setPointerCapture(e.pointerId); });
    asa.addEventListener('pointermove', (e) => mov(e.clientY));
    asa.addEventListener('pointerup', fin); asa.addEventListener('pointercancel', fin);
    asa.addEventListener('click', () => { if (dy < 4) alCerrar(); });
  }
  const fila = (html, attrs) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'm2-fila'; b.innerHTML = html; for (const k in (attrs || {})) b.setAttribute(k, attrs[k]); return b; };
  const texto = (s) => { const d = document.createElement('span'); d.textContent = s; return d.innerHTML; };

  // ---- Capas: four big switches, each with its colour; «Afinar» shows the classes of a layer that is on ----
  const CAPAS = [
    // both kinds of cable share the colours by class since 23 Oct 2026 (owner, 21:50); «Cables por tierra» (22:55)
    { k: 'sub', n: 'Cables submarinos', d: 'Por el fondo del mar, entre continentes', ley: 'linear-gradient(90deg,#ECBC6C 0 34%,#C4AAF5 34% 67%,#70DEC8 67%)' },
    { k: 'fibra', n: 'Cables por tierra', d: 'De las costas al interior', ley: 'linear-gradient(90deg,#ECBC6C 0 34%,#C4AAF5 34% 67%,#70DEC8 67%)' },
    { k: 'puntos', n: 'Centros de datos', d: 'Donde se guarda y se sirve internet', pto: '#E8ECF1' },
    { k: 'sat', n: 'Satélites', d: 'En tiempo real', pto: '#9CC3E4' },
  ];
  const afinando = new Set();
  const estadoCapas = () => (window.OrbitaCapas ? window.OrbitaCapas.estado : {});
  function originalesDe(k) {
    if (k === 'sat') return [...document.querySelectorAll('#sat-vista .orb button[data-orb]')];
    return [...document.querySelectorAll('#' + k + '-vista .orb button[data-clase]')];
  }
  function pintaCapas(h) {
    const est = estadoCapas(); h.cuerpo.textContent = '';
    for (const c of CAPAS) {
      if (!document.querySelector('#capas [data-capa="' + c.k + '"]')) continue; // a layer without data on this site
      const on = !!est[c.k];
      const muestra = c.ley ? '<span class="ley" style="background:' + c.ley + '"></span>' : '<span class="pto" style="background:' + c.pto + ';box-shadow:0 0 8px ' + c.pto + '"></span>';
      const b = fila(muestra + '<span class="t">' + texto(c.n) + '<small>' + texto(c.d) + '</small></span><span class="m2-sw" aria-hidden="true"></span>', { 'aria-pressed': String(on) });
      b.addEventListener('click', () => { if (window.OrbitaCapas) window.OrbitaCapas.pon(c.k, !estadoCapas()[c.k]); if (!estadoCapas()[c.k]) afinando.delete(c.k); setTimeout(() => { pintaCapas(h); cuenta(); }, 30); });
      h.cuerpo.appendChild(b);
      if (!on) continue;
      const af = document.createElement('button'); af.type = 'button'; af.className = 'm2-afinar'; af.setAttribute('aria-expanded', String(afinando.has(c.k)));
      af.innerHTML = '<span class="fl" aria-hidden="true">›</span><span>Afinar</span>';
      af.addEventListener('click', () => { if (afinando.has(c.k)) afinando.delete(c.k); else afinando.add(c.k); pintaCapas(h); });
      h.cuerpo.appendChild(af);
      if (!afinando.has(c.k)) continue;
      const caja = document.createElement('div'); caja.className = 'm2-clases';
      for (const o of originalesDe(c.k)) {
        const n = o.querySelector('.n'); if (!n) continue;
        const sw = n.querySelector('.muestra'), cnt = n.querySelector('b');
        const nombre = [...n.childNodes].filter((x) => x.nodeType === 3).map((x) => x.nodeValue).join(' ').trim();
        const m = fila((sw ? sw.outerHTML.replace('class="muestra"', 'class="ley" style="background:rgb(' + sw.style.getPropertyValue('--c') + ')"') : '') + '<span class="t">' + texto(nombre) + (cnt && cnt.textContent ? ' <b>' + texto(cnt.textContent) + '</b>' : '') + '</span><span class="m2-sw" aria-hidden="true"></span>', { 'aria-pressed': o.getAttribute('aria-pressed') || 'false' });
        if (o.disabled) m.disabled = true;
        m.addEventListener('click', () => { o.click(); setTimeout(() => pintaCapas(h), 30); });
        caja.appendChild(m);
      }
      if (c.k === 'sat') {
        const seg = document.createElement('div'); seg.className = 'm2-seg'; seg.setAttribute('role', 'radiogroup');
        for (const o of document.querySelectorAll('#sat-vista .seg [data-vista]')) {
          const r = document.createElement('button'); r.type = 'button'; r.setAttribute('role', 'radio'); r.setAttribute('aria-checked', o.getAttribute('aria-checked') || 'false'); r.textContent = o.textContent.trim();
          r.addEventListener('click', () => { o.click(); setTimeout(() => pintaCapas(h), 30); });
          seg.appendChild(r);
        }
        caja.appendChild(seg);
      }
      h.cuerpo.appendChild(caja);
    }
  }
  const capas = hoja('m2-capas', 'Capas del planeta', pintaCapas);
  // T1 · tablet in landscape: the same switches always at hand, in a panel on the right (movil.css shows it only there)
  const panelT1 = document.createElement('aside'); panelT1.className = 't1-panel'; panelT1.setAttribute('aria-label', 'Capas del planeta');
  panelT1.innerHTML = '<h2>Capas</h2><div class="cuerpo"></div>';
  B.appendChild(panelT1);
  const t1 = { id: 't1-panel', el: panelT1, cuerpo: panelT1.querySelector('.cuerpo'), pinta: (h) => pintaCapas(h) };
  setTimeout(() => pintaCapas(t1), 1200);
  addEventListener('guardiana-idioma', () => pintaCapas(t1));
  const cuenta = () => { const est = estadoCapas(), n = CAPAS.filter((c) => est[c.k] && document.querySelector('#capas [data-capa="' + c.k + '"]')).length; arriba.querySelector('.capas .n').textContent = n > 1 ? String(n) : ''; };
  arriba.querySelector('.capas').addEventListener('click', () => (abierta === capas ? cierra() : abre(capas)));
  setTimeout(cuenta, 1500);

  // ---- «···»: Conocer, the language, the place, GUARDIANA OS and the legal pages ----
  let verIdiomas = false;
  function pintaMas(h) {
    h.cuerpo.textContent = '';
    const conocer = document.createElement('a'); conocer.className = 'm2-fila'; conocer.href = ($('conocer') && $('conocer').getAttribute('href')) || '/conocer.html';
    conocer.innerHTML = '<span class="t">' + texto('Conocer GUARDIANA') + '</span><span class="fl" aria-hidden="true">›</span>';
    h.cuerpo.appendChild(conocer);
    const langs = [...document.querySelectorAll('header .idiomas .idioma-menu button[data-l], header .idiomas > button[data-l]')];
    const actual = langs.find((b) => b.getAttribute('aria-pressed') === 'true');
    const nombreDe = (b) => { const c = b.querySelector('.cod'); return (b.textContent || '').replace(c ? c.textContent : '', '').trim() || b.dataset.l.toUpperCase(); };
    const idi = fila('<span class="t">' + texto('Idioma') + '</span><span class="v" translate="no">' + texto(actual ? nombreDe(actual) : (document.documentElement.lang || 'es').toUpperCase()) + '</span><span class="fl" aria-hidden="true">›</span>', { 'aria-expanded': String(verIdiomas) });
    idi.addEventListener('click', () => { verIdiomas = !verIdiomas; pintaMas(h); });
    h.cuerpo.appendChild(idi);
    if (verIdiomas && langs.length) {
      const caja = document.createElement('div'); caja.className = 'm2-idiomas'; caja.setAttribute('translate', 'no');
      for (const o of langs) {
        const b = document.createElement('button'); b.type = 'button'; b.lang = o.lang || ''; b.setAttribute('aria-pressed', o.getAttribute('aria-pressed') || 'false'); b.textContent = nombreDe(o);
        b.addEventListener('click', () => { if (window.GuardianaIdioma) window.GuardianaIdioma.pon(o.dataset.l); else o.click(); verIdiomas = false; setTimeout(() => pintaMas(h), 60); });
        caja.appendChild(b);
      }
      h.cuerpo.appendChild(caja);
    }
    const lugar = ($('lugar-nombre') && $('lugar-nombre').textContent.trim()) || '';
    const sinLugar = !lugar || /precisar/i.test(lugar) || lugar === T('Precisar ubicación');
    // the installable app (owner, 21:19: «que pueda descargarla… como si fuera tipo aplicación»): only where the browser
    // can install it, or the two steps on an iPhone or iPad
    if (window.GuardianaApp && window.GuardianaApp.puede()) {
      const ap = fila('<span class="t">' + texto('Instalar la app') + '<small>' + texto('GUARDIANA en tu pantalla de inicio') + '</small></span><span class="fl" aria-hidden="true">›</span>');
      ap.addEventListener('click', () => { cierra(); setTimeout(() => window.GuardianaApp.instalar(), 330); });
      h.cuerpo.appendChild(ap);
    }
    const ub = fila('<span class="t">' + texto('Mi ubicación') + '</span><span class="v">' + texto(sinLugar ? T('Sin precisar') : lugar) + '</span><span class="fl" aria-hidden="true">›</span>');
    ub.addEventListener('click', () => { cierra(); setTimeout(() => { const b = $('lugar-btn'); if (b) b.click(); }, 330); });
    h.cuerpo.appendChild(ub);
    const os = fila('<span class="t">GUARDIANA OS</span><span class="v">' + texto('En preparación') + '</span><span class="fl" aria-hidden="true">›</span>');
    os.addEventListener('click', () => { cierra(); setTimeout(() => { if (window.OrbitaPuertas) window.OrbitaPuertas.abre('sistema'); }, 330); });
    h.cuerpo.appendChild(os);
    const pie = document.createElement('div'); pie.className = 'm2-pie';
    pie.innerHTML = '<a href="/terminos.html">' + texto('Términos') + '</a><a href="/privacidad.html">' + texto('Privacidad') + '</a><a href="/contacto.html">' + texto('Contacto') + '</a>';
    h.cuerpo.appendChild(pie);
  }
  const mas = hoja('m2-mas', 'Más', pintaMas);
  arriba.querySelector('.mas').addEventListener('click', () => (abierta === mas ? cierra() : abre(mas)));

  // a sheet open when the language changes is drawn again in the new language
  addEventListener('guardiana-idioma', () => { if (abierta) abierta.pinta(abierta); });

  // ---------- the card of a cable or a satellite: small first; swipe up for all of it, swipe down to close ----------
  function engancha(p) {
    if (p.dataset.m2) return; p.dataset.m2 = '1';
    const asa = p.querySelector('.asa'); if (!asa) return;
    let y0 = null, dy = 0;
    asa.addEventListener('pointerdown', (e) => { y0 = e.clientY; dy = 0; asa.setPointerCapture(e.pointerId); });
    asa.addEventListener('pointermove', (e) => { if (y0 != null) dy = e.clientY - y0; });
    const fin = () => { if (y0 == null) return; y0 = null;
      if (dy < -30) p.classList.add('alta');
      else if (dy > 40) { if (p.classList.contains('alta')) p.classList.remove('alta'); else { const c = p.querySelector('.cerrar'); if (c) c.click(); } } };
    asa.addEventListener('pointerup', fin); asa.addEventListener('pointercancel', fin);
  }
  { const p = $('ficha-panel'); if (p) engancha(p); }
  new MutationObserver(() => { const p = $('ficha-panel'); if (p) engancha(p); }).observe(B, { childList: true });

  // ---------- on arrival: a short hint instead of the location question (asked inside «Mi conexión») ----------
  let vista = false; try { vista = sessionStorage.getItem('guardiana-m2-pista') === '1'; } catch (_) {}
  if (!vista && movil()) {
    const pista = document.createElement('div'); pista.className = 'm2-pista'; pista.setAttribute('role', 'status');
    pista.textContent = 'Gira el planeta con el dedo. Toca un cable para conocerlo.';
    B.appendChild(pista);
    setTimeout(() => pista.classList.add('on'), 2600);
    setTimeout(() => { pista.classList.remove('on'); setTimeout(() => pista.remove(), 600); }, 8000);
    try { sessionStorage.setItem('guardiana-m2-pista', '1'); } catch (_) {}
  }
})();
