// Aviso dentro de Instagram/Facebook/TikTok (ronda 74) y VIGILANCIA cerrada en la tableta.
const { chromium, devices } = require('playwright');
const S = '/tmp/pruebas-com/prueba-74/';
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const res = []; const ok = (n, c, e) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (e ? ' · ' + e : ''));
(async () => {
  const b = await chromium.launch();
  const caso = async (nombre, disp, ua) => {
    const c = await b.newContext(Object.assign({}, disp, ua ? { userAgent: ua } : {}, { locale: 'es-ES' }));
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
    const p = await c.newPage(); const err = []; p.on('pageerror', (e) => err.push(e.message));
    await p.goto(URL); await p.waitForTimeout(1500);
    return { c, p, err };
  };
  const v = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  // iPhone dentro de Instagram
  let { c, p, err } = await caso('ig-iphone', devices['iPhone 13'], devices['iPhone 13'].userAgent + ' Instagram 310.0.0.0 (iPhone14,5; iOS 17_0)');
  ok('iPhone + Instagram: aviso visible', await v(p, '#interno'));
  ok('iPhone + Instagram: sin «Abrir en Chrome»', !(await v(p, '#interno-chrome')));
  ok('iPhone + Instagram: instrucción «⋯»', /Toca ⋯/.test(await p.textContent('#interno-como')));
  await p.screenshot({ path: S + 'interno-iphone.png' });
  await p.tap('#interno-no'); await p.waitForTimeout(200);
  ok('«Continuar aquí» lo quita', !(await v(p, '#interno')));
  await p.reload(); await p.waitForTimeout(1200);
  ok('no vuelve en la misma visita', !(await v(p, '#interno')));
  ok('sin errores (iPhone)', !err.length, err.join(' | '));
  await c.close();
  // Android dentro de Facebook
  ({ c, p, err } = await caso('fb-android', devices['Pixel 7'], devices['Pixel 7'].userAgent + ' [FB_IAB/FB4A;FBAV/440.0.0.0;]'));
  ok('Android + Facebook: aviso con «Abrir en Chrome»', (await v(p, '#interno')) && (await v(p, '#interno-chrome')));
  await p.screenshot({ path: S + 'interno-android.png' });
  await c.close();
  // navegador normal: sin aviso
  ({ c, p, err } = await caso('normal', devices['iPhone 13']));
  ok('Safari normal: sin aviso', !(await v(p, '#interno')));
  await c.close();
  // iPad horizontal: sin VIGILANCIA fija
  ({ c, p, err } = await caso('ipad', devices['iPad (gen 7) landscape']));
  const g = await p.evaluate(() => getComputedStyle(document.querySelector('.conv .cuerpo')).gridTemplateColumns + ' | vigila=' + getComputedStyle(document.querySelector('.vigila')).display);
  ok('iPad horizontal: VIGILANCIA cerrada', /vigila=none/.test(g), g);
  await c.close();
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO', e); process.exit(1); });
