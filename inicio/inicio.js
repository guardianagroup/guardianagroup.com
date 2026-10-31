/* GUARDIANA · Inicio: los puntos del relato siguen a la tarjeta que se ve (y llevan a la suya al tocarlos); la lista de idiomas
   sube como una hoja, con un velo detrás. Nada sale del teléfono. */
(() => {
  'use strict';
  const rel = document.querySelector('[data-relato]'), puntos = [...document.querySelectorAll('.in-puntos button')];
  if (rel && puntos.length) {
    const cartas = [...rel.querySelectorAll('.in-carta')];
    const T = (x) => (window.GuardianaIdioma ? GuardianaIdioma.t(x) : x);
    const nombra = () => puntos.forEach((p, i) => p.setAttribute('aria-label', T('Tarjeta {n} de {t}').replace('{n}', i + 1).replace('{t}', puntos.length)));
    nombra(); addEventListener('guardiana-idioma', nombra);
    const marca = (i) => puntos.forEach((p, k) => { p.classList.toggle('si', k === i); if (k === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current'); });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((xs) => { for (const x of xs) if (x.isIntersecting) marca(cartas.indexOf(x.target)); }, { root: rel, threshold: 0.6 });
      cartas.forEach((c) => io.observe(c));
    }
    puntos.forEach((p, i) => p.addEventListener('click', () => { const c = cartas[i]; if (c) rel.scrollTo({ left: c.offsetLeft - rel.offsetLeft - 20, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }));
    // con el teclado: flechas a los lados
    rel.addEventListener('keydown', (e) => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); const i = puntos.findIndex((p) => p.classList.contains('si')); const j = Math.max(0, Math.min(cartas.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1))); puntos[j].click(); });
  }
  // la hoja de idiomas: un velo detrás mientras está abierta
  const fila = document.querySelector('.in-fila-idioma');
  if (fila) {
    const velo = document.createElement('div'); velo.className = 'in-velo'; velo.hidden = true; document.body.appendChild(velo);
    const mira = () => { const m = fila.querySelector('.idioma-menu'); if (!m) return false; new MutationObserver(() => { velo.hidden = m.hidden; }).observe(m, { attributes: true, attributeFilter: ['hidden'] }); return true; };
    if (!mira()) { const mo = new MutationObserver(() => { if (mira()) mo.disconnect(); }); mo.observe(fila, { childList: true, subtree: true }); }
    velo.addEventListener('click', () => { const b = fila.querySelector('.idioma-actual'); if (b) b.click(); });
    // toda la fila abre la lista
    fila.addEventListener('click', (e) => { if (e.target.closest('.idiomas')) return; const b = fila.querySelector('.idioma-actual'); if (b) { e.stopPropagation(); b.click(); } });
  }
})();
/* las páginas de texto existen en español, inglés y portugués: cada enlace, en el idioma elegido */
(() => {
  const RUTAS = { '/como-funciona.html': ['/en/how-it-works.html', '/pt/como-funciona.html'], '/terminos.html': ['/en/terms.html', '/pt/termos.html'],
    '/privacidad.html': ['/en/privacy.html', '/pt/privacidade.html'], '/zero.html': ['/en/zero.html', '/zero.html'] };
  const pinta = () => {
    const l = (window.GuardianaIdioma && GuardianaIdioma.lang) || 'es';
    document.querySelectorAll('a[href]').forEach((a) => {
      const base = a.dataset.es || a.getAttribute('href'); if (!RUTAS[base]) return; a.dataset.es = base;
      a.setAttribute('href', l === 'es' ? base : (l === 'pt' || l === 'pt-pt') ? RUTAS[base][1] : RUTAS[base][0]);
    });
  };
  pinta(); addEventListener('guardiana-idioma', pinta);
})();
