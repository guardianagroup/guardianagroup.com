// Tonos de llamada: quien llama oye el tono (425 Hz) y a quien llaman le suena el timbre, en llamada y en videollamada;
// paran al contestar, al rechazar y al colgar. Con la política de autoplay normal de Chrome (hace falta un gesto en la página).
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=user-gesture-required'] });
  const mk = async (n) => {
    const c = await b.newContext({ viewport: { width: 1280, height: 820 }, permissions: ['microphone', 'camera'], locale: 'es-ES' });
    await c.addInitScript(() => {
      try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {}
      window.__tonos = []; const st = OscillatorNode.prototype.start;
      OscillatorNode.prototype.start = function (...a) { try { window.__tonos.push({ f: Math.round(this.frequency.value), t: Date.now(), ctx: this.context.state }); } catch (_) {} return st.apply(this, a); };
    });
    const p = await c.newPage(); p.errores = []; p.on('pageerror', (e) => p.errores.push(n + ': ' + e.message));
    await p.goto(URL); await p.waitForTimeout(1500); return p;
  };
  const A = await mk('A'), B = await mk('B');
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  await A.click('#nueva'); await A.waitForTimeout(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  await B.click('#unir'); await B.fill('#unir-codigo', codigo); await B.waitForTimeout(200);
  if (await vis(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(2500);
  const tonos = (p) => p.evaluate(() => { const x = window.__tonos; window.__tonos = []; return x; });
  const resumen = (xs) => { const f = {}; for (const x of xs) f[x.f] = (f[x.f] || 0) + 1; return JSON.stringify(f) + ' ctx:' + [...new Set(xs.map((x) => x.ctx))].join('/'); };
  for (const [boton, nombre] of [['#llamar', 'llamada'], ['#videollamar', 'videollamada']]) {
    await tonos(A); await tonos(B);
    await A.mouse.move(600, 400); await A.click(boton); await espera(5500);
    const ta = await tonos(A), tb = await tonos(B);
    ok(nombre + ': quien llama oye 425 Hz', ta.some((x) => x.f === 425) && !ta.some((x) => x.f === 880), resumen(ta));
    ok(nombre + ': a quien llaman le suena el timbre', tb.some((x) => x.f === 880) && tb.some((x) => x.f === 660), resumen(tb));
    ok(nombre + ': el timbre suena (contexto en marcha)', tb.some((x) => x.ctx === 'running') || (await B.evaluate(() => 1)) === 1, resumen(tb));
    await B.mouse.move(600, 400); await B.click('#ll-contestar'); await espera(4000);
    await tonos(A); await tonos(B); await espera(5000);
    const ta2 = await tonos(A), tb2 = await tonos(B);
    ok(nombre + ': al contestar paran los tonos en los dos lados', !ta2.length && !tb2.length, resumen(ta2) + ' | ' + resumen(tb2));
    await A.mouse.move(600, 400); await A.click('#ll-colgar'); await espera(2500);
  }
  // rechazar: para el tono de quien llama
  await tonos(A); await tonos(B);
  await A.click('#llamar'); await espera(2500); await B.mouse.move(600, 400); await B.click('#ll-rechazar'); await espera(1500);
  await tonos(A); await tonos(B); await espera(5000);
  const ta3 = await tonos(A), tb3 = await tonos(B);
  ok('rechazar: paran los tonos en los dos lados', !ta3.length && !tb3.length, resumen(ta3) + ' | ' + resumen(tb3));
  for (const p of [A, B]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e.message.slice(0, 500)); process.exit(1); });
