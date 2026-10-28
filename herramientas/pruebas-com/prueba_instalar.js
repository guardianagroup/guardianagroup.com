const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const res = []; const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const I = await (await b.newContext(Object.assign({}, devices['iPhone 13'], { locale: 'es-ES' }))).newPage(); await I.goto('http://127.0.0.1:8802/orbita/comunicaciones/?instalar'); await I.waitForTimeout(1600);
  ok('iPhone con ?instalar: salen los pasos', await I.evaluate(() => document.querySelector('#h-completa').classList.contains('gc-abierta')));
  ok('iPhone: botón «Añadir a la pantalla de inicio» en el inicio', await I.evaluate(() => !document.querySelector('#anadir-app').hidden));
  const P = await (await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-ES' })).newPage(); await P.goto('http://127.0.0.1:8802/orbita/comunicaciones/?instalar'); await P.waitForTimeout(1600);
  ok('ordenador con ?instalar: la hoja «Añadir»', await P.evaluate(() => document.querySelector('#h-instalar').classList.contains('gc-abierta')));
  console.log(res.join('\n')); await b.close(); })();
