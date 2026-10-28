// Sesión blindada: videollamada con «Tu imagen» y «Mejorar la luz» (en local, con cámara simulada).
const { chromium } = require('playwright');
const S = '/tmp/pruebas-com/prueba-com/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (n, w, url) => {
    const c = await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 820 }, isMobile: w < 500, hasTouch: w < 500, permissions: ['microphone', 'camera'], locale: 'es-ES', timezoneId: 'America/Bogota' });
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); localStorage.setItem('gcom-imagen', 'natural'); } catch (e) {} });
    const p = await c.newPage(); p.errores = [];
    p.on('pageerror', (e) => p.errores.push(n + ': ' + e.message)); p.on('dialog', (d) => { p.errores.push(n + ': ventana ' + d.type()); d.dismiss(); });
    await p.goto(url || 'http://127.0.0.1:8802/orbita/comunicaciones/?luz'); await p.waitForTimeout(1500); return p;
  };
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  const A = await mk('A', 1280);
  await A.click('#nueva-blindada'); await espera(2500);
  const enlace = await A.inputValue('#enlace-b');
  ok('enlace blindado', /#b=/.test(enlace));
  const B = await mk('B', 390, enlace.replace('/comunicaciones/#', '/comunicaciones/?luz#'));
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(3000);
  for (const p of [A, B]) { if (await vis(p, '#bl-coincide')) await p.click('#bl-coincide'); }
  await espera(2500);
  ok('sesión blindada verificada por los dos', !(await A.evaluate(() => document.querySelector('#videollamar').classList.contains('apagado'))), await A.getAttribute('#videollamar', 'title'));
  await A.click('#videollamar'); await espera(2500);
  ok('en la blindada, «Tu imagen» se puede elegir antes de contestar', await vis(B, '#ll-imagenes'));
  await B.screenshot({ path: S + 'b1-B-entrante-movil.png' });
  await B.click('#ll-contestar'); await espera(6000);
  const diag = async (p) => p.evaluate(() => { try { return JSON.parse(document.querySelector('#ll-calidad').dataset.diag || '{}'); } catch (e) { return {}; } });
  const dA = await diag(A);
  ok('«Mejorar la luz» aclara la imagen con poca luz', dA.modo === 'aclarada' && dA.luz > 1, JSON.stringify(dA));
  ok('la tarjeta no tapa la imagen hasta abrirla', !(await vis(A, '#ll-ajustes')), await A.textContent('#ll-ajustes-caja span'));
  await A.mouse.move(600, 400); await espera(300); // los botones vuelven al mover el ratón
  await A.click('#ll-ajustes-b'); await espera(500);
  ok('«Voz e imagen» abre la tarjeta con los dos grupos', (await vis(A, '#ll-voces')) && (await vis(A, '#ll-imagenes')));
  await A.click('#ll-imagenes [data-imagen="mosaico"]'); await espera(3500);
  const recibe = await B.evaluate(() => { const v = document.querySelector('#v-remoto'); return v.videoWidth + 'x' + v.videoHeight; });
  ok('con «Mosaico», B recibe la imagen protegida', recibe === '640x360', recibe);
  await A.screenshot({ path: S + 'b2-A-tarjeta-escritorio.png' });
  await A.click('#ll-luz'); await espera(2500);
  const dA2 = await diag(A);
  ok('sin «Mejorar la luz», el brillo vuelve a 1', dA2.luz === 1, JSON.stringify(dA2));
  await A.click('#ll-luz'); await A.click('#ll-imagenes [data-imagen="natural"]'); await espera(1500);
  await B.mouse.move(200, 400); await espera(300);
  await B.click('#ll-ajustes-b'); await espera(500); await B.screenshot({ path: S + 'b3-B-tarjeta-movil.png' });
  await A.click('#ll-colgar'); await espera(1500);
  for (const p of [A, B]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e.message.slice(0, 500)); process.exit(1); });
