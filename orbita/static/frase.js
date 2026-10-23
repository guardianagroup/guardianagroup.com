/* GUARDIANA · Órbita · the phrase under the planet (owner, 23 Oct 2026, 12:18: «abajo del planeta queda un hueco…
   una frase… que aparezca una vez, la leas y ya está… 5, 6, 7 segundos y luego desaparezca… que se lea de izquierda a
   derecha… en los idiomas de derecha a izquierda, al revés… y que se ilumine para que se pueda leer, como hace la web»;
   12:36: «la 3… que se vaya leyendo, no quiero que aparezca de golpe»; 12:47: «con el mismo tipo de letra de la web»;
   12:53: «justo en el medio, donde acaba el planeta y la zona de abajo… visualmente tiene que ser perfecto»).
   The phrase came from the agency (Gemini). Once per visit, word by word in reading order (so right to left in Arabic,
   Hebrew, Persian and Urdu): the waiting words dimmed, never invisible, and each one shining for a moment as the light
   passes, as on the website; a pause to read it, and it fades away. With reduced motion it simply appears and later fades.
   Its place is measured, not guessed: the optical middle of the letters (from the top of the capitals to the baseline)
   sits exactly halfway between the planet's glowing rim and the top of the controls below it, and its width keeps
   clear of any card beside that gap. On one line while it can stay large, otherwise one sentence per line; where the
   gap is too small for it (a phone on its side), it does not appear at all. */
(function () {
  'use strict';
  const FRASE = 'Entiende cada conexión. Decide tu propio rumbo.';
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const reducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const ocupado = () => /\b(dentro|en-espejo|viaje|solo-tu)\b/.test(document.body.className);
  // the location question can open over the planet on a first visit: the phrase waits for it (or starts again after it)
  const pregunta = () => { const l = document.getElementById('lugar'); return !!(l && !l.hidden); };
  // the website's display face, loaded before the first word lights up so no letter changes shape while it is read
  const fuente = document.fonts && document.fonts.load ? document.fonts.load("400 34px 'Instrument Serif'").catch(() => null) : Promise.resolve();
  const plan = () => window.OrbitaPlaneta && window.OrbitaPlaneta.geo;
  let el = null, hecho = false, preparando = false, radio = 0, vigia = 0, lienzo = null;
  const relojes = [];
  const luego = (f, ms) => relojes.push(setTimeout(f, ms));

  // ---------- the place ----------
  // what can stand around the gap: the controls below it and the cards and buttons beside it
  const ALREDEDOR = '.espejo-modo .seg, #puertas .puerta, #directo, #dato, #capa-nota, #sat-vista, #sat-fase, .zoom, .altura, #ficha, .ficha-panel, .sat-ficha';
  // a box counts while it is laid out, even halfway through its own fade-in (the controls arrive just after the phrase)
  const caja = (e) => {
    if (!e || e.closest('[hidden]')) return null;
    const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') return null;
    const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 ? r : null;
  };
  const marca = () => { const i = document.createElement('i'); i.className = 'bl'; i.setAttribute('aria-hidden', 'true'); return i; };
  const mayuscula = () => {
    const s = getComputedStyle(el), f = parseFloat(s.fontSize);
    try { lienzo = lienzo || document.createElement('canvas').getContext('2d'); lienzo.font = s.fontStyle + ' ' + s.fontWeight + ' ' + s.fontSize + ' ' + s.fontFamily; return lienzo.measureText('H').actualBoundingBoxAscent || f * 0.72; } catch (_) { return f * 0.72; }
  };
  // the letters' optical band, from the element's own top: the capitals of the first line down to the last baseline
  function banda() {
    const r = el.getBoundingClientRect(), m = el.querySelectorAll('.bl');
    return { arriba: m[0].getBoundingClientRect().top - r.top - mayuscula(), abajo: m[m.length - 1].getBoundingClientRect().top - r.top };
  }
  function coloca() {
    const G = plan(); if (!el || !G || !G.R) return !!el; // without the planet's measures the stylesheet's own place stands
    const W = innerWidth, H = innerHeight;
    const techo = G.CY + G.R * 1.04; // the soft glow under the rim still reads as planet
    const cajas = [...document.querySelectorAll(ALREDEDOR)].map(caja).filter(Boolean);
    const enMedio = (r) => r.left < G.CX + 60 && r.right > G.CX - 60;
    let suelo = H - 16;
    for (const r of cajas) if (enMedio(r) && r.top > techo - 1) suelo = Math.min(suelo, r.top);
    const hueco = suelo - techo; if (hueco < 44) return false;
    let izq = 0, der = W;
    for (const r of cajas) { if (enMedio(r) || r.bottom <= techo || r.top >= suelo) continue; if (r.right <= G.CX) izq = Math.max(izq, r.right + 8); else if (r.left >= G.CX) der = Math.min(der, r.left - 8); }
    const ancho = Math.floor(Math.min(820, W * 0.92, 2 * Math.min(G.CX - izq, der - G.CX)));
    // the stylesheet's size first; one line while it can stay large, otherwise one sentence per line
    el.classList.remove('parte'); el.style.fontSize = ''; el.style.maxWidth = 'none'; el.style.whiteSpace = 'nowrap';
    const s = getComputedStyle(el), f0 = parseFloat(s.fontSize), pad = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
    const linea = el.getBoundingClientRect().width - pad, larga = Math.max(...[...el.querySelectorAll('.fs')].map((x) => x.getBoundingClientRect().width));
    el.style.whiteSpace = ''; el.style.maxWidth = ancho + 'px';
    const cabe = ancho - pad - 1;
    let f = f0;
    if (linea > cabe) { const f1 = f0 * cabe / linea; f = f1 >= Math.min(f0, 24) ? f1 : Math.min(f0, f0 * cabe / larga); }
    const MIN = 16;
    f = Math.max(MIN, Math.floor(f * 10) / 10);
    for (;;) {
      el.style.fontSize = f + 'px';
      el.classList.toggle('parte', larga * f / f0 > cabe); // only on a very narrow screen does a sentence break inside
      const b = banda(), aire = Math.max(12, hueco * 0.12);
      if (b.abajo - b.arriba + 2 * aire <= hueco) { el.style.top = ((techo + suelo) / 2 - (b.arriba + b.abajo) / 2).toFixed(1) + 'px'; return true; }
      if (f <= MIN) return false;
      f = Math.max(MIN, f - 1);
    }
  }
  const reajusta = () => { if (el && !coloca()) quita(); };
  // a zoom makes the planet take the gap: the phrase leaves rather than sit on top of it
  function vigila() {
    if (!el) return; const G = plan();
    if (G && radio && Math.abs(G.R - radio) > radio * 0.03) { quita(); return; }
    vigia = requestAnimationFrame(vigila);
  }

  // ---------- the phrase ----------
  function quita() {
    if (!el) return; const x = el; el = null;
    relojes.splice(0).forEach(clearTimeout); cancelAnimationFrame(vigia); removeEventListener('resize', reajusta);
    x.classList.add('fuera'); document.body.classList.remove('con-frase');
    setTimeout(() => x.remove(), 1400);
  }
  async function pon() {
    if (hecho || el || preparando || pregunta()) return; // after the question it comes back
    preparando = true;
    await Promise.race([fuente, new Promise((r) => setTimeout(r, 2500))]);
    preparando = false;
    if (hecho || el || pregunta()) return;
    hecho = true;
    if (ocupado()) return;
    el = document.createElement('p'); el.id = 'frase'; el.className = 'frase';
    el.setAttribute('translate', 'no'); // translated whole here; word by word the page translator would not find it
    const texto = String(T(FRASE)).trim(), frases = (texto.match(/[^.!?¡¿。！？؟]+[.!?。！？؟]*/g) || [texto]).map((x) => x.trim()).filter(Boolean);
    frases.forEach((x, j) => {
      const fs = document.createElement('span'); fs.className = 'fs';
      const ws = x.split(/\s+/).filter(Boolean);
      ws.forEach((w, i) => { const s = document.createElement('span'); s.className = 'fw'; s.textContent = w; fs.append(s); if (i < ws.length - 1) fs.append(' '); });
      el.append(fs); if (j < frases.length - 1) el.append(' ');
    });
    const fss = el.querySelectorAll('.fs'); fss[0].prepend(marca()); fss[fss.length - 1].append(marca());
    document.body.append(el);
    if (!coloca()) { el.remove(); el = null; return; } // no room for it on this screen
    const G = plan(); radio = G ? G.R : 0;
    document.body.classList.add('con-frase');
    addEventListener('resize', reajusta); vigia = requestAnimationFrame(vigila);
    requestAnimationFrame(() => el && el.classList.add('entra'));
    const ws = [...el.querySelectorAll('.fw')], quieto = reducido(), paso = quieto ? 0 : 310;
    ws.forEach((w, i) => luego(() => { w.classList.add('m'); luego(() => { w.classList.remove('m'); w.classList.add('on'); }, quieto ? 0 : 560); }, 650 + i * paso));
    // time to read it once, then away (about 7 s in all)
    luego(quita, 650 + ws.length * paso + 3800);
  }
  // it waits for the planet's arrival; anything the person opens takes its place at once
  function espera() {
    const ir = () => setTimeout(pon, 1700);
    if (document.body.classList.contains('listo')) ir();
    else { const o = new MutationObserver(() => { if (document.body.classList.contains('listo')) { o.disconnect(); ir(); } }); o.observe(document.body, { attributes: true, attributeFilter: ['class'] }); }
    new MutationObserver(() => { if (el && ocupado()) quita(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const l = document.getElementById('lugar');
    if (l) new MutationObserver(() => {
      if (!l.hidden && el) { quita(); hecho = false; } // interrupted before it could be read: once more afterwards
      else if (l.hidden && !hecho && document.body.classList.contains('listo')) setTimeout(pon, 1200);
    }).observe(l, { attributes: true, attributeFilter: ['hidden'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', espera); else espera();
})();
