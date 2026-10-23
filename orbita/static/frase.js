/* GUARDIANA · Órbita · the phrase under the planet (owner, 23 Oct 2026, 12:18: «abajo del planeta queda un hueco…
   una frase… que aparezca una vez, la leas y ya está… 5, 6, 7 segundos y luego desaparezca… que se lea de izquierda a
   derecha… en los idiomas de derecha a izquierda, al revés… y que se ilumine para que se pueda leer, como hace la web»;
   12:36: «la 3… que se vaya leyendo, no quiero que aparezca de golpe»). The phrase came from the agency (Gemini).
   Once per visit, word by word in reading order (so right to left in Arabic, Hebrew, Persian and Urdu): the waiting
   words dimmed, never invisible, and each one shining for a moment as the light passes, as on the website; a pause to
   read it, and it fades away. With reduced motion it simply appears and later fades. */
(function () {
  'use strict';
  const FRASE = 'Entiende cada conexión. Decide tu propio rumbo.';
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const reducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const ocupado = () => /\b(dentro|en-espejo|viaje|solo-tu)\b/.test(document.body.className);
  // the location question can open over the planet on a first visit: the phrase waits for it (or starts again after it)
  const pregunta = () => { const l = document.getElementById('lugar'); return !!(l && !l.hidden); };
  let el = null, hecho = false;
  const relojes = [];
  const luego = (f, ms) => relojes.push(setTimeout(f, ms));

  function quita() {
    if (!el) return; const x = el; el = null;
    relojes.splice(0).forEach(clearTimeout);
    x.classList.add('fuera'); document.body.classList.remove('con-frase');
    setTimeout(() => x.remove(), 1400);
  }
  function pon() {
    if (hecho || el) return;
    if (pregunta()) return; // it comes back when the question closes
    hecho = true;
    if (ocupado()) return;
    el = document.createElement('p'); el.id = 'frase'; el.className = 'frase';
    el.setAttribute('translate', 'no'); // translated whole here; word by word the page translator would not find it
    const palabras = String(T(FRASE)).split(/\s+/).filter(Boolean);
    palabras.forEach((w, i) => { const s = document.createElement('span'); s.className = 'fw'; s.textContent = w; el.append(s); if (i < palabras.length - 1) el.append(' '); });
    // in the space under the planet, above the two ESPEJO buttons
    const G = window.OrbitaPlaneta && window.OrbitaPlaneta.geo;
    if (G && G.R) el.style.top = Math.round(G.CY + G.R + Math.max(20, G.R * 0.1)) + 'px';
    document.body.append(el); document.body.classList.add('con-frase');
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
