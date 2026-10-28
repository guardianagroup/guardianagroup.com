// Fotos de la sesión blindada con su halo (dueño, 28 Oct 2026, 14:35).
const { chromium } = require('playwright');
const S = '/tmp/pruebas-com/prueba-74/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (n, w, url) => {
    const c = await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 760 }, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 2, locale: 'es-ES', timezoneId: 'America/Bogota' });
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
    const p = await c.newPage(); await p.goto(url || 'http://127.0.0.1:8802/orbita/comunicaciones/'); await p.waitForTimeout(1500); return p;
  };
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  const A = await mk('A', 1280);
  await A.click('#nueva-blindada'); await espera(2500);
  const enlace = await A.inputValue('#enlace-b');
  const B = await mk('B', 390, enlace);
  for (let i = 0; i < 20; i++) { const v = await B.evaluate(() => { const e = document.querySelector('#aceptar-si'); return !!(e && e.offsetParent); }); if (v) { await B.click('#aceptar-si'); break; } await new Promise((r) => setTimeout(r, 300)); }
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(3000);
  for (const p of [A, B]) { if (await vis(p, '#bl-coincide')) await p.click('#bl-coincide'); }
  await espera(2500);
  for (const [p, t] of [[A, 'Contrato revisado: te lo envío ahora.'], [B, 'Perfecto, lo espero.'], [A, '¿Lo firmamos mañana a las 10?']]) { await p.click('#texto'); await p.keyboard.type(t, { delay: 2 }); await p.keyboard.press('Enter'); await espera(700); }
  await espera(1500);
  await A.screenshot({ path: S + 'blindada-1.png' }); await espera(1700); await A.screenshot({ path: S + 'blindada-2.png' });
  await B.screenshot({ path: S + 'blindada-movil.png' });
  // secuencia para ver el movimiento: la zona de la conversación (cabecera + lienzo) cada 0,45 s durante 9 s
  for (const [p, n] of [[A, 'a'], [B, 'b']]) {
    const caja = await p.evaluate(() => { const c = document.querySelector('#conv').getBoundingClientRect(); const l = document.querySelector('.lienzo').getBoundingClientRect(); return { x: c.left, y: c.top, width: c.width, height: l.bottom - c.top }; });
    for (let i = 0; i < 20; i++) { await p.screenshot({ path: S + 'sec-' + n + '-' + String(i).padStart(2, '0') + '.png', clip: caja }); await espera(450); }
  }
  await b.close();
})().catch((e) => { console.error('FALLO', e); process.exit(1); });
