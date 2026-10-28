// Videollamada y llamada en pequeño, en local (página 127.0.0.1:8802, relé de pruebas 127.0.0.1:8794), con cámara y
// micrófono simulados por el navegador.
const { chromium } = require('playwright');
const S = '/tmp/pruebas-com/prueba-com/';
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = [];
const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (n, w) => {
    const c = await b.newContext({ viewport: { width: w || 1280, height: 820 }, permissions: ['microphone', 'camera'], locale: 'es-ES', timezoneId: 'America/Bogota' });
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
    const p = await c.newPage(); p.errores = [];
    p.on('pageerror', (e) => p.errores.push(n + ': ' + e.message));
    p.on('dialog', (d) => { p.errores.push(n + ': ventana ' + d.type()); d.dismiss(); });
    await p.goto(URL); await p.waitForTimeout(1500); return p;
  };
  const A = await mk('A'), B = await mk('B', 390);
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  await A.click('#nueva'); await A.waitForTimeout(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  await B.click('#unir'); await B.fill('#unir-codigo', codigo); await B.waitForTimeout(200);
  if (await vis(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(2500);
  ok('conversación', (await vis(A, '#conv')) && (await vis(B, '#conv')));
  ok('botón de videollamada', await vis(A, '#videollamar'), await A.getAttribute('#videollamar', 'title'));

  // videollamada
  await A.click('#videollamar'); await espera(2500);
  const entra = await B.evaluate(() => ({ abierta: document.querySelector('#llamada').classList.contains('gc-abierta'), paso: document.querySelector('#ll-paso').textContent, etiqueta: document.querySelector('#llamada').getAttribute('aria-label') }));
  ok('a B le entra una videollamada', entra.abierta && /Videollamada entrante/.test(entra.paso), JSON.stringify(entra));
  const suena = async (p) => p.evaluate(() => new Promise((res) => { const AC = window.AudioContext; let n = 0; const t0 = Date.now(); const mira = () => res(n); setTimeout(mira, 10); }));
  await B.click('#ll-contestar'); await espera(6000);
  const estado = async (p) => p.evaluate(() => { const r = document.querySelector('#v-remoto'), l = document.querySelector('#v-local'), c = document.querySelector('#llamada'); return { conVideo: c.classList.contains('con-video'), remoto: r.videoWidth + 'x' + r.videoHeight, local: l.videoWidth + 'x' + l.videoHeight, calidad: document.querySelector('#ll-calidad').textContent, tiempo: document.querySelector('#ll-tiempo').textContent, camara: !document.querySelector('#ll-camara-caja').hidden }; });
  const ea = await estado(A), eb = await estado(B);
  ok('A ve la imagen de B', ea.conVideo && !/^0x/.test(ea.remoto), JSON.stringify(ea));
  ok('B ve la imagen de A', eb.conVideo && !/^0x/.test(eb.remoto), JSON.stringify(eb));
  const enviada = await A.evaluate(async () => { const pc = null; return null; });
  await A.screenshot({ path: S + 'v1-A-videollamada.png' }); await B.screenshot({ path: S + 'v1-B-videollamada.png' });

  // los botones se esconden solos y vuelven al mover el ratón
  await A.mouse.move(640, 400); await espera(3800);
  const reposo = await A.evaluate(() => document.querySelector('#llamada').classList.contains('reposo'));
  const opac = await A.evaluate(() => getComputedStyle(document.querySelector('#ll-botones')).opacity);
  await A.screenshot({ path: S + 'v7-A-reposo.png' });
  await A.mouse.move(700, 450); await espera(500);
  const vuelve = !(await A.evaluate(() => document.querySelector('#llamada').classList.contains('reposo')));
  ok('en la videollamada los botones se esconden solos y vuelven al mover el ratón', reposo && opac === '0' && vuelve, 'opacidad en reposo ' + opac);

  // ver el chat sin colgar
  await A.click('#ll-mini'); await espera(600);
  const mini = await A.evaluate(() => { const c = document.querySelector('#llamada'), r = c.getBoundingClientRect(); return { mini: c.classList.contains('mini'), caja: Math.round(r.width) + 'x' + Math.round(r.height), modal: c.getAttribute('aria-modal') }; });
  ok('«Ver el chat» deja la llamada en pequeño', mini.mini && mini.modal === 'false', JSON.stringify(mini));
  await A.click('#texto'); await A.keyboard.type('Te escribo durante la videollamada'); await A.keyboard.press('Enter'); await espera(2000);
  const llega = await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].map((x) => x.textContent).pop());
  ok('se puede escribir durante la llamada y llega', llega === 'Te escribo durante la videollamada', llega);
  const sigue = await estado(A);
  ok('la llamada sigue mientras tanto', sigue.tiempo !== '00:00' && !/^0x/.test(sigue.remoto), sigue.tiempo);
  await A.screenshot({ path: S + 'v2-A-mini.png' });
  await B.click('#ll-mini'); await espera(500); await B.screenshot({ path: S + 'v2-B-mini-movil.png' });
  await B.click('#ll-volver'); await espera(400);
  ok('«Ampliar» vuelve a la llamada grande', !(await B.evaluate(() => document.querySelector('#llamada').classList.contains('mini'))));

  // cámara apagada
  await A.click('#ll-volver'); await espera(300);
  await A.click('#ll-camara'); await espera(1500);
  const sinCam = await B.evaluate(() => document.querySelector('#llamada').classList.contains('con-video'));
  ok('con la cámara de A apagada, B ve su inicial en vez de la imagen', !sinCam);
  await A.click('#ll-camara'); await espera(1500);
  ok('y al encenderla vuelve la imagen', await B.evaluate(() => document.querySelector('#llamada').classList.contains('con-video')));

  // sesión normal: imagen tal cual, sin opciones de imagen; la tarjeta de voz se abre con su botón
  ok('en la sesión normal no hay opciones de imagen', !(await vis(A, '#ll-imagenes')));
  ok('la tarjeta no tapa la imagen hasta abrirla', !(await vis(A, '#ll-ajustes')), await A.textContent('#ll-ajustes-caja span'));
  await A.click('#ll-ajustes-b'); await espera(400);
  ok('«Tu voz» abre la tarjeta', await vis(A, '#ll-ajustes'));
  await A.screenshot({ path: S + 'v6-A-normal-tarjeta.png' });
  await A.click('#ll-ajustes-b'); await espera(300);

  // colgar
  await A.click('#ll-colgar'); await espera(2500);
  const anota = await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-linea-llamada, #mensajes li.gc-llam-li .gc-llam-txt')].map((x) => x.textContent).pop());
  ok('al colgar se anota «Videollamada saliente/entrante · duración» (ronda 74)', /Videollamada (saliente|entrante)\s*\d\d:\d\d/.test(anota || ''), anota);
  ok('la llamada se cierra en los dos', !(await A.evaluate(() => document.querySelector('#llamada').classList.contains('gc-abierta'))) && !(await B.evaluate(() => document.querySelector('#llamada').classList.contains('gc-abierta'))));

  // llamada de voz: sigue igual y también se puede ver el chat
  await A.click('#llamar'); await espera(2000); await B.click('#ll-contestar'); await espera(4000);
  const voz = await estado(A);
  ok('la llamada de voz sigue sin imagen', !voz.conVideo && !(await vis(A, '#ll-videos')), voz.tiempo);
  await A.screenshot({ path: S + 'v3-A-voz-tarjeta.png' });
  await A.click('#ll-mini'); await espera(400); await A.screenshot({ path: S + 'v3-A-voz-mini.png' });
  await A.click('#ll-colgar'); await espera(1500);

  for (const p of [A, B]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n'));
  await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e.message.slice(0, 600)); process.exit(1); });
