// Pantalla completa en el móvil (dueño, 28 Oct 2026, 16:03): Android la pide sola al crear o aceptar; en el iPhone, «⋯» lo explica
const { chromium, devices } = require('playwright');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = [];
  const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const mk = async (d) => { const c = await b.newContext(Object.assign({}, d, { locale: 'es-ES' })); await c.addInitScript(() => { window.__completa = 0; const o = Element.prototype.requestFullscreen; Element.prototype.requestFullscreen = function () { window.__completa++; return Promise.resolve(); }; Object.defineProperty(document, 'fullscreenEnabled', { get: () => true }); navigator.share = async () => {}; }); const p = await c.newPage(); await p.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await p.waitForTimeout(1500); return p; };
  const A = await mk(devices['Pixel 7']);
  ok('el manifiesto de la app está enlazado', await A.evaluate(() => !!document.querySelector('link[rel="manifest"][href$="comunicaciones.webmanifest"]')));
  await A.tap('#nueva-blindada'); await espera(2000);
  ok('Android: al crear la invitación, pide la pantalla completa', (await A.evaluate(() => window.__completa)) >= 1);
  const I = await mk(devices['iPhone 13']);
  ok('iPhone: no la pide (no se puede desde la web)', (await I.evaluate(() => { document.querySelector('#nueva-blindada').click(); return window.__completa; })) === 0);
  await espera(2000);
  const m = await (await b.newContext()).newPage(); const r = await m.goto('http://127.0.0.1:8802/orbita/comunicaciones/comunicaciones.webmanifest'); const j = await r.json();
  ok('manifiesto: pantalla completa, solo Comunicaciones', j.display === 'fullscreen' && j.scope === '/orbita/comunicaciones/');
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.error('FALLO', e.message); process.exit(1); });
