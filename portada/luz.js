/* GUARDIANA · la luz de los títulos en las demás páginas (23 Oct 2026).
   El fundador (20 Oct): «toda la web con la letra de la portada y el texto que aparece y se ilumina». Agencia, ronda 13
   (ChatGPT y Gemini; Grok «A, con matices»): la luz palabra a palabra es la firma, pero solo en el titular y en las
   grandes frases; los demás títulos, una aparición discreta; párrafos, términos, privacidad y Órbita, sin efectos; que se
   pueda leer antes de iluminarse y que nadie tenga que esperar.
   Uso: <script src="/portada/luz.js" defer data-luz="main h1" data-aparece="main h2"></script>
   · data-luz: se ilumina palabra a palabra (al cargar si ya está a la vista; si no, al subir por la pantalla).
   · data-aparece: entra con un fundido corto la primera vez que llega a la pantalla.
   El texto nunca se parte ni se mueve de sitio: la luz colorea rangos (CSS Custom Highlight API), así que los lectores
   de pantalla, el traductor y la selección siguen igual. Con «reducir movimiento», nada se anima. */
(() => {
  'use strict';
  const yo = document.currentScript;
  const selA = yo && 'luz' in yo.dataset ? yo.dataset.luz : 'main h1', selB = (yo && yo.dataset.aparece) || '';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const est = document.createElement('style');
  est.textContent = '.luz-b{opacity:0;transform:translateY(10px);transition:opacity .45s ease,transform .45s ease}.luz-b.visto{opacity:1;transform:none}'
    + '::highlight(luz-0){color:rgba(232,238,245,.26)}::highlight(luz-1){color:#fff;text-shadow:0 0 .32em rgba(156,195,228,.75),0 0 .9em rgba(156,195,228,.35)}';
  document.head.appendChild(est);

  // ---- B: discreet entrance for blocks still below the screen (what is already visible is never hidden) ----
  if (selB) {
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }, { rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll(selB).forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) return; el.classList.add('luz-b'); io.observe(el); });
  }

  // ---- A: word by word ----
  if (!selA || !window.CSS || !CSS.highlights || typeof Highlight === 'undefined') return;
  const H0 = new Highlight(), H1 = new Highlight(); CSS.highlights.set('luz-0', H0); CSS.highlights.set('luz-1', H1);
  const palabras = (el) => {
    const out = [], lang = document.documentElement.lang || 'es', seg = /^(zh|ja|th)/.test(lang) && window.Intl && Intl.Segmenter ? new Intl.Segmenter(lang, { granularity: 'word' }) : null;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      if (seg) { for (const x of seg.segment(n.data)) { if (!x.isWordLike) continue; const r = new Range(); r.setStart(n, x.index); r.setEnd(n, x.index + x.segment.length); out.push(r); } continue; }
      const re = /\S+/g; let m; while ((m = re.exec(n.data))) { const r = new Range(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); out.push(r); }
    }
    return out;
  };
  // state of each word: 2 waiting (dim), 1 the light passing, 0 lit
  const bloques = [...document.querySelectorAll(selA)].map((el) => ({ el, w: palabras(el), k: 0, kt: 0 })).filter((b) => b.w.length > 1);
  if (!bloques.length) return;
  const pon = (b, i, e) => { const r = b.w[i]; H0.delete(r); H1.delete(r); if (e === 2) H0.add(r); else if (e === 1) H1.add(r); };
  const estado = (i, k) => (i < k - 2 ? 0 : i < k ? 1 : 2);
  for (const b of bloques) b.w.forEach((_, i) => pon(b, i, 2));
  const objetivo = (b) => {
    const r = b.el.getBoundingClientRect(), n = b.w.length, linea = innerHeight * 0.84;
    if (r.bottom < 0) return n + 2; if (r.top > innerHeight) return 0;
    let c = 0; for (let i = 0; i < n; i++) { const q = b.w[i].getBoundingClientRect(); if (q.top + q.height / 2 < linea) c = i + 1; }
    return c >= n ? n + 2 : c;
  };
  let andando = false, t0 = 0;
  const cuadro = (t) => {
    const dt = Math.min(200, t - t0); t0 = t; let falta = false;
    for (const b of bloques) {
      if (b.k === b.kt) continue;
      const cada = Math.max(18, 70 - Math.abs(b.kt - b.k) * 6); b.acc = (b.acc || 0) + dt;
      while (b.acc >= cada && b.k !== b.kt) { b.acc -= cada; const k = b.k + Math.sign(b.kt - b.k), lo = Math.max(0, Math.min(k, b.k) - 3), hi = Math.min(b.w.length, Math.max(k, b.k) + 3);
        for (let i = lo; i < hi; i++) { const e = estado(i, k); if (e !== estado(i, b.k)) pon(b, i, e); } b.k = k; }
      if (b.k !== b.kt) falta = true; else b.acc = 0;
    }
    if (falta) requestAnimationFrame(cuadro); else andando = false;
  };
  const mide = () => { for (const b of bloques) if (!b.fijo) b.kt = objetivo(b); if (!andando) { andando = true; t0 = performance.now(); requestAnimationFrame(cuadro); } };
  let pend = false; const pide = () => { if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; mide(); }); } };
  addEventListener('scroll', pide, { passive: true }); addEventListener('resize', pide);
  // a title already on screen at arrival lights up whole, one word after another (as the front page's headline): nobody
  // has to scroll to read the title of the page they just opened
  for (const b of bloques) { const r = b.el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { b.fijo = true; b.kt = b.w.length + 2; } }
  setTimeout(mide, 180);
})();
