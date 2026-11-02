// Órbita en el programa: la portada («Toma el control de tus datos») sin el planeta por debajo un instante antes (dueño, 2 Nov 2026,
// 13:16: «primero me aparece la página de órbita y luego me aparece la que tiene que aparecer»).
//   1. Desde que se pinta la página hasta que sale la portada, nada del planeta a la vista (se mira cada 20 ms).
//   2. Con una puerta en la dirección (#zero), sin portada: el planeta se ve (no se queda nada tapado).
'use strict';
const { chromium } = require('playwright');
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
(async () => {
  const browser = await chromium.launch();
  for (const vez of [1, 2]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO' });
    // muestras desde el primer momento, en la propia página: ¿se ve el planeta (la marca de arriba)? ¿está la portada?
    await ctx.addInitScript(() => {
      window.__m = [];
      const mira = () => {
        const m = document.querySelector('.marca'), p = document.querySelector('.nuc-ini');
        // a la vista de verdad: lo que hay encima en el centro de la marca es la propia marca (no un velo ni la portada)
        const ve = (e) => { if (!e || e.hidden || !e.getClientRects().length) return false; const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(x && (x === e || e.contains(x))); };
        const vePortada = (e) => !!(e && !e.hidden && e.getClientRects().length && getComputedStyle(e).visibility === 'visible' && document.documentElement.classList.contains('portada-lista') || (e && !document.documentElement.classList.contains('con-portada') && !e.hidden));
        // el velo de la página (html::after, sin recibir clics: elementFromPoint pasa a través) está puesto y por encima de todo
        const tapado = () => { const h = document.documentElement; if (!h.classList.contains('con-portada') || h.classList.contains('portada-lista')) return false; const a = getComputedStyle(h, '::after'); return a.content !== 'none' && a.position === 'fixed' && a.zIndex === '2147483647' && a.backgroundColor !== 'rgba(0, 0, 0, 0)'; };
        window.__m.push({ t: Math.round(performance.now()), planeta: !tapado() && ve(m), portada: vePortada(p), tapado: tapado() });
      };
      const id = setInterval(mira, 20); setTimeout(() => clearInterval(id), 9000);
      document.addEventListener('readystatechange', mira);
    });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:8080/orbita/' + (vez === 2 ? '#zero' : ''));
    await p.waitForTimeout(4000);
    const m = await p.evaluate(() => window.__m);
    if (vez === 1) {
      const antes = m.filter((x) => !x.portada && x.planeta); if (process.env.VER) console.log(JSON.stringify(m.filter((x, i) => i === 0 || JSON.stringify([m[i - 1].planeta, m[i - 1].portada, m[i - 1].tapado]) !== JSON.stringify([x.planeta, x.portada, x.tapado]))));
      comprueba(m.some((x) => x.portada), '1. sale la portada', m.length);
      comprueba(antes.length === 0, '1. antes de la portada, nada del planeta a la vista', antes.slice(0, 3));
    } else {
      comprueba(m.some((x) => x.planeta) && !m.some((x) => x.portada), '2. con #zero, sin portada y el planeta a la vista');
    }
    await ctx.close();
  }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
