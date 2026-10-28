// «Borrar el chat» (dueño, 28 Oct 2026, 15:13): se borra todo aquí y en el otro equipo; con el otro sin conectar, cuando entre
const { chromium, devices } = require('playwright');
const S = '/tmp/pruebas-com/prueba-74/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = [];
  const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  const mk = async (d) => { const c = await b.newContext(Object.assign({}, d || { viewport: { width: 1280, height: 800 } }, { locale: 'es-ES' })); await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} }); const p = await c.newPage(); await p.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await p.waitForTimeout(1500); return p; };
  const textos = (p) => p.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].map((x) => x.textContent));
  const A = await mk(), B = await mk(devices['iPhone 13']);
  await A.click('#nueva'); await espera(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  void codigo; await A.click('#codigo-enlace'); const enlaceI = await A.evaluate(() => document.querySelector('#codigo-enlace').dataset.enlace);
  await B.goto(enlaceI); for (let i = 0; i < 20 && !(await vis(B, '#aceptar-si')); i++) await espera(300); await B.tap('#aceptar-si');
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(2500);
  for (const [p, t] of [[A, 'uno'], [B, 'dos'], [A, 'tres']]) { if (p === B) { await p.tap('#texto'); } else { await p.click('#texto'); } await p.keyboard.type(t); await p.keyboard.press('Enter'); await espera(800); }
  await espera(1000);
  ok('antes: 3 mensajes en los dos', (await textos(A)).length === 3 && (await textos(B)).length === 3);
  await B.screenshot({ path: S + 'vaciar-1-movil.png' });
  await A.click('#vaciar'); await espera(400);
  ok('pide confirmación', await A.evaluate(() => document.querySelector('#h-vaciar').classList.contains('gc-abierta')));
  await A.click('#vaciar-si'); await espera(2000);
  ok('A: chat vacío', (await textos(A)).length === 0);
  ok('B: chat vacío también', (await textos(B)).length === 0);
  ok('la conversación sigue abierta y se puede escribir', (await vis(A, '#texto')) && (await vis(B, '#texto')));
  await B.tap('#texto'); await B.keyboard.type('sigue'); await B.keyboard.press('Enter'); await espera(1500);
  ok('y siguen hablando', (await textos(A)).includes('sigue'));
  await A.reload(); await espera(3500);
  ok('al recargar A, solo lo de después', JSON.stringify(await textos(A)) === JSON.stringify(['sigue']), JSON.stringify(await textos(A)));
  // B sin conectar: A borra y, cuando B vuelve, se borra allí
  const ctxB = B.context(); await B.close(); await espera(1500);
  await A.click('#vaciar'); await espera(300); await A.click('#vaciar-si'); await espera(800);
  const avisoA = await A.evaluate(() => (document.querySelector('#aviso') || {}).textContent || '');
  ok('A, con B sin conectar: borrado aquí y aviso de que allí será al conectarse', (await textos(A)).length === 0 && /en cuanto esa persona se conecte/.test(avisoA), avisoA);
  const B2 = await ctxB.newPage(); await B2.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await espera(6000);
  ok('B, al volver: chat vacío', (await textos(B2)).length === 0, JSON.stringify(await textos(B2)));
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.error('FALLO', e.message); process.exit(1); });
