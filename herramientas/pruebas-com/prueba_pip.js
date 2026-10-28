// Pip con GUARDIANA minimizada (dueño, 28 Oct 2026, 15:03): suena el pip (dos notas) y el aviso del sistema va en silencio
const { chromium } = require('playwright');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = [];
  const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const mk = async (falso) => { const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); await c.addInitScript((falso) => {
      try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {}
      if (!falso) return;
      window.__avisos = []; window.__osc = 0;
      const N = function (t, o) { window.__avisos.push(Object.assign({ t }, o)); this.close = () => {}; }; N.permission = 'granted'; N.requestPermission = async () => 'granted'; window.Notification = N;
      const orig = AudioContext.prototype.createOscillator; AudioContext.prototype.createOscillator = function () { window.__osc++; return orig.call(this); };
      window.__fuera = false; Object.defineProperty(document, 'visibilityState', { get: () => (window.__fuera ? 'hidden' : 'visible') }); document.hasFocus = () => !window.__fuera;
    }, falso); const p = await c.newPage(); await p.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await p.waitForTimeout(1500); return p; };
  const A = await mk(false), B = await mk(true);
  await A.click('#nueva'); await espera(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  await B.click('#unir'); await espera(300); await B.fill('#unir-codigo', codigo); await espera(300);
  await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !(await B.evaluate(() => { const e = document.querySelector('#conv'); return !!(e && !e.hidden && e.offsetParent); })); i++) await espera(500);
  await espera(2500);
  await B.evaluate(() => { window.__fuera = true; window.__osc = 0; window.__avisos = []; document.dispatchEvent(new Event('visibilitychange')); });
  await A.click('#texto'); await A.keyboard.type('¿Estás?'); await A.keyboard.press('Enter'); await espera(2000);
  const r = await B.evaluate(() => ({ osc: window.__osc, avisos: window.__avisos, titulo: document.title }));
  ok('B minimizada: suena el pip (dos notas)', r.osc >= 2, 'osciladores ' + r.osc);
  ok('el aviso del sistema sale, sin el texto y en silencio', r.avisos.length === 1 && r.avisos[0].silent === true && !/Estás/.test(JSON.stringify(r.avisos)), JSON.stringify(r.avisos));
  ok('el título avisa (parpadea entre «(1)» y «💬»)', /\(1\)|💬/.test(r.titulo), r.titulo);
  await B.evaluate(() => { window.__fuera = false; window.__osc = 0; document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); });
  await A.click('#texto'); await A.keyboard.type('Ya te veo'); await A.keyboard.press('Enter'); await espera(1500);
  ok('con la conversación a la vista, sin pip', (await B.evaluate(() => window.__osc)) === 0);
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.error('FALLO', e.message); process.exit(1); });
