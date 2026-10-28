const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext(Object.assign({}, devices['iPhone 13'], { locale: 'es-ES' })); const p = await c.newPage(); const err = []; p.on('pageerror', (e) => err.push(e.message));
  await p.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await p.waitForTimeout(1800);
  const antes = await p.evaluate(() => ({ boton: !document.querySelector('#anadir-app').hidden, visible: !!document.querySelector('#anadir-app').offsetParent }));
  await p.tap('#anadir-app'); await p.waitForTimeout(600);
  const hoja = await p.evaluate(() => { const h = document.querySelector('#h-completa'); const r = h.querySelector('.gc-hoja-caja').getBoundingClientRect(); return { abierta: h.classList.contains('gc-abierta'), top: Math.round(r.top), alto: Math.round(r.height), vh: innerHeight, txt: h.innerText.slice(0, 80) }; });
  await p.screenshot({ path: '/tmp/pruebas-com/prueba-74/anadir-iphone.png' });
  console.log(JSON.stringify({ antes, hoja, err })); await b.close(); })();
