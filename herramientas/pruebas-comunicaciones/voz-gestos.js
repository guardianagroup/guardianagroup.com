// Gestos del micrófono (dueño, 30 Oct 2026, 00:26–00:30): toque corto → fija; mantener y soltar → envía; el sistema se queda el dedo →
// fija; deslizar a la izquierda → cancela. Dos teléfonos con el Número GUARDIANA contra el relé de pruebas.
const { chromium } = require('playwright');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let fallos = 0; const ok = (c, t) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + t); if (!c) fallos++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const tel = async () => { const c = await b.newContext({ viewport: { width: 393, height: 793 }, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone'] }); await c.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} }); const p = await c.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos++; }); await p.goto('http://127.0.0.1:8080/orbita/comunicaciones/?app=1'); await espera(2500); await p.click('#num-usar'); await espera(2500); return p; };
  const A = await tel(), B = await tel();
  const nA = await A.evaluate(() => window.gcomPruebaNumero.mio()), nB = await B.evaluate(() => window.gcomPruebaNumero.mio());
  const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
  await A.click('#llamar-num'); await marca(A, nB); await A.click('#marcar-llamar'); await espera(400); await A.fill('#num-nombre', 'B'); await A.click('#num-anadir'); await espera(1500); await A.click('#num-espera-ok');
  await B.click('#llamar-num'); await marca(B, nA); await B.click('#marcar-llamar'); await espera(400); await B.fill('#num-nombre', 'A'); await B.click('#num-anadir'); await espera(7000);
  const r = await A.evaluate(() => { const g = document.querySelector('#grabar').getBoundingClientRect(); return { x: g.x + g.width / 2, y: g.y + g.height / 2 }; });
  const pe = (tipo, x, y) => A.evaluate(([tipo, x, y]) => { document.querySelector('#grabar').dispatchEvent(new PointerEvent(tipo, { bubbles: true, cancelable: true, pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, button: 0, buttons: tipo === 'pointerup' ? 0 : 1 })); }, [tipo, x, y]);
  const notas = () => A.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); return c ? c.mensajes.filter((m) => m.tipo === 'archivo' && m.archivo.voz).length : 0; });
  const estado = () => A.evaluate(() => ({ grabando: document.querySelector('.gc-compositor').classList.contains('grabando-ya'), fija: document.querySelector('.gc-compositor').classList.contains('grab-fija') }));
  // 1. toque corto: queda fija y se puede enviar
  await pe('pointerdown', r.x, r.y); await espera(80); await pe('pointerup', r.x, r.y); await espera(1500);
  let e = await estado(); ok(e.grabando && e.fija, '1. un toque corto deja la grabación fija (no se pierde)');
  await espera(1500); await A.evaluate(() => document.querySelector('#enviar').click()); await espera(1500);
  ok(await notas() === 1 && !(await estado()).grabando, '1. «Enviar» la manda');
  // 2. mantener 2,5 s y soltar: se envía
  await pe('pointerdown', r.x, r.y); await espera(2500); await pe('pointerup', r.x, r.y); await espera(1500);
  ok(await notas() === 2 && !(await estado()).grabando, '2. mantener y soltar la envía');
  // 3. el sistema se queda el dedo (pointercancel): queda fija
  await pe('pointerdown', r.x, r.y); await espera(1500); await pe('pointercancel', r.x, r.y); await espera(600);
  e = await estado(); ok(e.grabando && e.fija, '3. si el sistema se queda el dedo, queda fija');
  await A.evaluate(() => document.querySelector('#grabar-cancelar').click()); await espera(800);
  ok(await notas() === 2 && !(await estado()).grabando, '3. la papelera la tira');
  // 4. deslizar a la izquierda cancela
  await pe('pointerdown', r.x, r.y); await espera(1500); await pe('pointermove', r.x - 130, r.y); await espera(600);
  ok(await notas() === 2 && !(await estado()).grabando, '4. deslizar a la izquierda cancela');
  console.log(fallos ? 'FALLOS: ' + fallos : 'TODO BIEN');
  await b.close();
})();
