// El chat con aire arriba y abajo (dueño, 28 Oct 2026, 13:37) en la ventana del dueño (1422×654), con la llamada en pequeño.
const { chromium } = require('playwright');
const S = '/tmp/pruebas-com/prueba-74/';
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (vp) => { const c = await b.newContext({ viewport: vp, permissions: ['microphone', 'camera'], locale: 'es-ES' }); await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} }); const p = await c.newPage(); await p.goto(URL); await p.waitForTimeout(1500); return p; };
  const A = await mk({ width: 1422, height: 654 }), B = await mk({ width: 1280, height: 760 });
  const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  await A.click('#nueva'); await A.waitForTimeout(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  await B.click('#unir'); await B.waitForTimeout(300); await B.fill('#unir-codigo', codigo); await B.waitForTimeout(300); if (await visible(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !((await visible(A, '#conv')) && (await visible(B, '#conv'))); i++) await espera(500);
  await espera(2500);
  for (let i = 1; i <= 14; i++) { const p = i % 3 ? B : A; await p.click('#texto'); await p.keyboard.type('Mensaje de prueba número ' + i + (i % 4 === 0 ? ' con un poco más de texto para que ocupe dos líneas en la burbuja y se vea cómo queda' : ''), { delay: 0 }); await p.keyboard.press('Enter'); await espera(250); }
  await espera(1500);
  await A.screenshot({ path: S + 'margen-1-abajo.png' });
  await A.evaluate(() => { const ul = document.querySelector('#mensajes'); ul.scrollTop = ul.scrollHeight / 2 - 120; }); await espera(400);
  await A.screenshot({ path: S + 'margen-2-medio.png' });
  await A.click('#videollamar'); await espera(1500);
  await B.mouse.move(600, 400); await B.click('#ll-contestar'); await espera(4000);
  await A.mouse.move(700, 300); await espera(200); await A.click('#ll-mini'); await espera(800);
  await A.evaluate(() => { const ul = document.querySelector('#mensajes'); ul.scrollTop = 0; }); await espera(400);
  await A.screenshot({ path: S + 'margen-3-mini-arriba.png' });
  await A.evaluate(() => { const ul = document.querySelector('#mensajes'); ul.scrollTop = ul.scrollHeight; }); await espera(400);
  await A.screenshot({ path: S + 'margen-4-mini-abajo.png' });
  const m = await A.evaluate(() => { const ll = document.querySelector('#llamada').getBoundingClientRect(); return { top: Math.round(ll.top), bottom: Math.round(ll.bottom), vh: innerHeight }; });
  console.log(JSON.stringify(m));
  await b.close();
})().catch((e) => { console.error('FALLO', e); process.exit(1); });
