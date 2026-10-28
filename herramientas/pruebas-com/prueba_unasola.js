// En el móvil, una sola conversación (dueño, 28 Oct 2026, 15:58): crear otra pregunta y borra la anterior en los dos equipos
const { chromium, devices } = require('playwright');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = [];
  const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null && getComputedStyle(e).display !== 'none'); }, s);
  const cA = await b.newContext(Object.assign({}, devices['iPhone 13'], { locale: 'es-ES' }));
  await cA.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} navigator.share = async () => {}; });
  const A = await cA.newPage(); await A.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await A.waitForTimeout(1500);
  const invita = async () => { await A.tap('#nueva-blindada'); await espera(2500); return A.inputValue('#enlace-b'); };
  const entra = async (enlace) => { const c = await b.newContext(Object.assign({}, devices['Pixel 7'], { locale: 'es-ES' })); const B = await c.newPage(); await B.goto(enlace); for (let i = 0; i < 20 && !(await vis(B, '#aceptar-si')); i++) await espera(300); await B.tap('#aceptar-si'); for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500); await espera(2000); return B; };
  const B = await entra(await invita());
  ok('primera conversación abierta', (await vis(A, '#conv')) && (await vis(B, '#conv')));
  ok('en la conversación, sin «‹» ni lista (no se vuelve a ninguna anterior)', !(await vis(A, '#cvolver')) && !(await vis(A, '#lista')));
  await A.tap('#cmas'); await espera(250); await A.tap('#cm-terminar'); await espera(400); await A.tap('#cierre-si').catch(() => {}); await espera(2500);
  ok('tras «Terminar», el inicio sin «Tus conversaciones»', (await vis(A, '#nueva-blindada')) && !(await vis(A, '#volver-lista')));
  await A.tap('#nueva-blindada'); await espera(2500);
  ok('en la espera, sin «Tus conversaciones» ni el globo', !(await vis(A, '#volver-lista')) && !(await vis(A, '.red-nucleo')));
  const filas = await A.evaluate(() => document.querySelectorAll('#lista-filas .fila-conv').length);
  ok('A: solo queda la invitación nueva', filas <= 1, 'filas ' + filas);
  ok('B: la anterior se ha borrado también allí', await B.evaluate(() => { const f = document.querySelector('#fin-invitado'); return !!(f && !f.hidden); }));
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.error('FALLO', e.message); process.exit(1); });
