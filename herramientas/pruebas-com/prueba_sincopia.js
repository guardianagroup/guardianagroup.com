// Sin selección ni copia (dueño, 28 Oct 2026, 15:17): el mensaje no se selecciona, el campo de escribir sí; y en otras páginas
const { chromium } = require('playwright');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = [];
  const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const mk = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} }); const p = await c.newPage(); await p.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await p.waitForTimeout(1500); return p; };
  const A = await mk(), B = await mk();
  await A.click('#nueva'); await espera(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  ok('el código de invitación no se selecciona', await A.evaluate(() => getComputedStyle(document.querySelector('#codigo')).userSelect === 'none'));
  await B.click('#unir'); await espera(300); await B.fill('#unir-codigo', codigo); await espera(300);
  await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !(await A.evaluate(() => { const e = document.querySelector('#conv'); return !!(e && !e.hidden && e.offsetParent); })); i++) await espera(500);
  await espera(2500);
  await A.click('#texto'); await A.keyboard.type('Mensaje que no se copia'); await A.keyboard.press('Enter'); await espera(1500);
  const sel = await B.evaluate(() => { const t = [...document.querySelectorAll('#mensajes .gc-texto')].pop(); return t ? 'ok' : 'sin mensaje'; });
  const caja = await B.locator('#mensajes .gc-texto').last().boundingBox();
  if (caja) { await B.mouse.click(caja.x + 10, caja.y + caja.height / 2, { clickCount: 3 }); await B.mouse.move(caja.x + 2, caja.y + 2); await B.mouse.down(); await B.mouse.move(caja.x + caja.width - 2, caja.y + caja.height - 2); await B.mouse.up(); }
  ok('el mensaje no se puede seleccionar (ni con triple clic ni arrastrando)', sel === 'ok' && (await B.evaluate(() => String(getSelection()).trim())) === '', await B.evaluate(() => String(getSelection())));
  await B.keyboard.press('Control+a');
  ok('Ctrl+A no selecciona la conversación', (await B.evaluate(() => String(getSelection()).trim())) === '' || (await B.evaluate(() => document.activeElement && document.activeElement.id === 'texto')));
  ok('cursor normal sobre el mensaje (sin barra de escribir)', await B.evaluate(() => getComputedStyle(document.querySelector('#mensajes .gc-texto')).cursor) !== 'text');
  await B.click('#texto'); await B.keyboard.type('hola'); await B.keyboard.press('Control+a');
  ok('el campo de escribir sí se selecciona', await B.evaluate(() => { const t = document.querySelector('#texto'); return t.selectionEnd - t.selectionStart === 4; }));
  for (const u of ['/', '/orbita/', '/orbita/zero/?motor=', '/privacidad.html', '/nueva/']) {
    const p = await (await b.newContext()).newPage(); await p.goto('http://127.0.0.1:8802' + u); await p.waitForTimeout(800);
    ok('sin selección en ' + u, await p.evaluate(() => getComputedStyle(document.body).userSelect === 'none'));
  }
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.error('FALLO', e.message); process.exit(1); });
