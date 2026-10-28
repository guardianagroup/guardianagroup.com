// Una llamada que llega a una conversación que no está en pantalla (la otra persona abrió una invitación nueva):
// se abre esa conversación, suena el timbre y se puede contestar. Y si ya hay una llamada, quien llama oye «ocupado».
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (n) => {
    const c = await b.newContext({ viewport: { width: 1280, height: 820 }, permissions: ['microphone', 'camera'], locale: 'es-ES' });
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} window.__tonos = []; const st = OscillatorNode.prototype.start; OscillatorNode.prototype.start = function (...a) { try { window.__tonos.push(Math.round(this.frequency.value)); } catch (_) {} return st.apply(this, a); }; });
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
  ok('conversación entre A y B', (await vis(A, '#conv')) && (await vis(B, '#conv')));
  const sala1 = await B.evaluate(() => [...GuardianaCom.convs.values()].find((c) => c.estado === 'activa' || c.huella).id);
  // B abre una invitación nueva: la conversación 1 deja de estar en pantalla
  console.log('A antes:', await A.evaluate(() => ({ conv: !document.querySelector('#conv').hidden, n: GuardianaCom.convs.size })));
  await B.evaluate(() => GuardianaCom.creaInvitacion()); await espera(1500);
  console.log('A después:', await A.evaluate(() => ({ conv: !document.querySelector('#conv').hidden, n: GuardianaCom.convs.size, estados: [...GuardianaCom.convs.values()].map((c) => c.estado + '/' + (c.rol||'')), aviso: (document.querySelector('.gc-aviso, #aviso, [role=alert]') || {}).textContent })));
  console.log('B después:', await B.evaluate(() => ({ n: GuardianaCom.convs.size, estados: [...GuardianaCom.convs.values()].map((c) => c.estado + '/' + (c.rol||'')) })));
  const enPantalla = await B.evaluate(() => ({ conv: !document.querySelector('#conv').hidden, inicio: !document.querySelector('#inicio').hidden }));
  ok('B tiene otra cosa en pantalla (invitación nueva)', enPantalla.inicio && !enPantalla.conv, JSON.stringify(enPantalla));
  console.log('A antes de llamar:', await A.evaluate(() => { const e = document.querySelector('#videollamar'); const out = []; let x = e; while (x && x !== document.body) { const cs = getComputedStyle(x); out.push((x.id || x.className || x.tagName) + ':' + cs.display + (x.hidden ? '/hidden' : '')); x = x.parentElement; } return out.join(' < ') + ' | conv:' + !document.querySelector('#conv').hidden + ' inicio:' + !document.querySelector('#inicio').hidden; }));
  await B.evaluate(() => { window.__tonos = []; });
  await A.mouse.move(600, 400); await A.click('#videollamar'); await espera(4500);
  const r = await B.evaluate(() => ({ llamada: !document.querySelector('#llamada').hidden, paso: (document.querySelector('#ll-paso') || {}).textContent, conv: !document.querySelector('#conv').hidden, timbre: window.__tonos.filter((f) => f === 880).length }));
  ok('a B le entra la videollamada aunque no tenía esa conversación en pantalla', r.llamada && /entrante/i.test(r.paso || '') && r.conv, JSON.stringify(r));
  ok('y le suena el timbre', r.timbre > 0, 'notas 880 Hz: ' + r.timbre);
  await B.mouse.move(600, 400); await B.click('#ll-contestar'); await espera(5000);
  const h = await A.evaluate(() => (document.querySelector('#ll-tiempo') || {}).textContent);
  ok('B contesta y hablan', /00:0[1-9]/.test(h || ''), h);
  await A.mouse.move(600, 400); await A.click('#ll-colgar'); await espera(2500);
  for (const p of [A, B]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e.message.slice(0, 500)); process.exit(1); });
