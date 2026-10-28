// Cerrar «Voz e imagen» con «Atrás», con el mismo botón o tocando la imagen (dueño, 28 Oct 2026, 15:12)
const { chromium, devices } = require('playwright');
const S = '/tmp/pruebas-com/prueba-74/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] }); const res = [];
  const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const mk = async (disp) => { const c = await b.newContext(Object.assign({}, disp || { viewport: { width: 1280, height: 800 } }, { permissions: ['microphone', 'camera'], locale: 'es-ES' })); await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} }); const p = await c.newPage(); await p.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await p.waitForTimeout(1500); return p; };
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  const A = await mk(), B = await mk(devices['iPhone 13']);
  await A.click('#nueva'); await espera(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  void codigo; await A.click('#codigo-enlace'); { const u = await A.evaluate(() => document.querySelector('#codigo-enlace').dataset.enlace); await B.goto(u); for (let i = 0; i < 30; i++) { const v = await B.evaluate(() => { const e = document.querySelector('#aceptar-si'); return !!(e && e.offsetParent); }); if (v) break; await B.waitForTimeout(300); } await B.click('#aceptar-si'); }
  if (await vis(B, '#unir-ok')) await B.tap('#unir-ok').catch(() => {});
  for (let i = 0; i < 40 && !(await vis(A, '#conv')); i++) await espera(500);
  await espera(2500);
  await A.mouse.move(600, 400); await A.mouse.move(610, 410); await A.click('#videollamar'); await espera(2500);
  await B.tap('#ll-contestar').catch(async () => { await B.evaluate(() => document.querySelector('#ll-contestar').click()); });
  for (let i = 0; i < 30 && !(await A.evaluate(() => !document.querySelector('#ll-tiempo').hidden)); i++) await espera(500);
  await espera(2500);
  // B (teléfono): abrir «Voz e imagen» y volver de tres maneras
  const abierto = () => B.evaluate(() => document.querySelector('#llamada, .gc-llamada').classList.contains('ajustes'));
  const abre = async () => { await B.tap('#ll-ajustes-b'); await espera(400); };
  await abre(); ok('se abre «Voz e imagen»', await abierto());
  ok('se ve «Atrás»', await vis(B, '#ll-ajustes-atras'));
  await B.screenshot({ path: S + 'ajustes-atras.png' });
  await B.tap('#ll-ajustes-atras'); await espera(400); ok('«Atrás» lo cierra', !(await abierto()));
  await abre(); await B.tap('#ll-ajustes-b').catch(async () => { await B.evaluate(() => document.querySelector('#ll-ajustes-b').click()); }); await espera(400); ok('tocar otra vez el botón lo cierra', !(await abierto()));
  await abre(); const r = await B.evaluate(() => { const v = document.querySelector('#v-remoto').getBoundingClientRect(); return { x: v.left + v.width / 2, y: v.top + v.height * 0.45 }; }); await B.touchscreen.tap(r.x, r.y); await espera(400);
  ok('tocar la imagen lo cierra', !(await abierto()));
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.error('FALLO', e.message); process.exit(1); });
