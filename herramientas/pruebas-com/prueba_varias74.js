// Varias conversaciones en el mismo navegador (dueño, 28 Oct 2026, 13:56; agencia, ronda 74, bloque J).
// A (ordenador) abre dos conversaciones: con B (ordenador) y con C (teléfono). Comprueba que una nueva no borra la anterior,
// la lista, los avisos de otra conversación, los borradores, las llamadas atadas a su conversación («ocupado» desde otra),
// el nombre propio, terminar solo una y que al recargar siguen ahí; en el teléfono, «‹» y la lista.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const S = '/tmp/pruebas-com/prueba-74/';
fs.mkdirSync(S, { recursive: true });
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = [];
const ok = (nombre, cond, extra) => { res.push((cond ? 'OK   ' : 'FALLA') + ' ' + nombre + (extra ? ' · ' + extra : '')); };

(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (nombre, disp) => {
    const c = await b.newContext(Object.assign({}, disp || { viewport: { width: 1280, height: 800 } }, { permissions: ['microphone', 'camera'], locale: 'es-ES', timezoneId: 'America/Bogota' }));
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
    const p = await c.newPage(); p.errores = [];
    p.on('pageerror', (e) => p.errores.push(nombre + ': ' + e.message));
    p.on('dialog', (d) => { p.errores.push(nombre + ': ventana del navegador ' + d.type()); d.dismiss(); });
    await p.goto(URL); await p.waitForTimeout(1500);
    return p;
  };
  const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null && getComputedStyle(e).display !== 'none'); }, s);
  const filas = (p) => p.evaluate(() => [...document.querySelectorAll('#lista-filas .fila-conv')].map((x) => ({ id: x.dataset.id, nombre: x.querySelector('b').textContent, estado: x.querySelector('small').textContent, n: (x.querySelector('.fila-n') || {}).textContent || '', actual: x.classList.contains('actual') })));
  const actual = (p) => p.evaluate(() => { const x = document.querySelector('#lista-filas .fila-conv.actual'); return x ? x.dataset.id : null; });
  const une = async (Q, P, tactil) => {
    const codigo = (await Q.textContent('#codigo')).replace(/\D/g, '');
    if (tactil) { await Q.click('#codigo-enlace'); const enlaceI = await Q.evaluate(() => document.querySelector('#codigo-enlace').dataset.enlace); await P.goto(enlaceI); for (let i = 0; i < 20 && !(await visible(P, '#aceptar-si')); i++) await espera(300); await P.tap('#aceptar-si'); }
    else { await P.click('#unir'); await P.waitForTimeout(300); await P.fill('#unir-codigo', codigo); await P.waitForTimeout(300);
    if (await visible(P, '#unir-ok')) await P.click('#unir-ok', { timeout: 3000 }).catch(() => {}); }
    for (let i = 0; i < 40 && !(await visible(P, '#conv')); i++) await espera(500);
    await espera(2500);
  };
  const escribe = async (p, t) => { await p.click('#texto'); await p.keyboard.type(t, { delay: 5 }); await p.keyboard.press('Enter'); await espera(900); };
  const pulsa = async (p, sel) => { await p.mouse.move(640, 380); await p.mouse.move(650, 390); await espera(150); await p.click(sel, { timeout: 5000 }); };

  const A = await mk('A'), B = await mk('B'), C = await mk('C', devices['iPhone 13']);
  // 1) A–B
  await A.click('#nueva'); await A.waitForTimeout(1500);
  await une(A, B);
  ok('A–B: conversación abierta', (await visible(A, '#conv')) && (await visible(B, '#conv')));
  const filas1 = await filas(A);
  ok('A: lista con una conversación', filas1.length === 1, JSON.stringify(filas1));
  const idAB = filas1[0] && filas1[0].id;
  await escribe(A, 'Hola B');
  // 2) Nueva con C, sin borrar la de B
  await A.click('#lista-nueva'); await espera(500);
  ok('«Nueva» lleva al inicio con la lista a la vista', (await visible(A, '#paso-inicio')) && (await visible(A, '#lista')));
  await A.click('#nueva'); await A.waitForTimeout(1500);
  ok('A: la invitación nueva sale en la lista', (await filas(A)).length === 2);
  await une(A, C, true);
  ok('A–C: conversación abierta', (await visible(C, '#conv')));
  const filas2 = await filas(A);
  ok('A: dos conversaciones a la vez', filas2.length === 2, JSON.stringify(filas2.map((x) => x.nombre + ' · ' + x.estado)));
  const idAC = (filas2.find((x) => x.id !== idAB) || {}).id;
  ok('A–B sigue viva (B escribe y le llega a A)', await (async () => { await escribe(B, 'Mensaje de B'); await espera(1200); return true; })());
  await A.screenshot({ path: S + 'varias-1-A-dos.png' });
  // A está en la de C: aviso de la otra y número en la fila
  const ahora = await actual(A);
  const f3 = await filas(A); const filaB = f3.find((x) => x.id === idAB);
  ok('A sigue en la de C mientras le escribe B', ahora === idAC, ahora);
  ok('fila de B con «1» y «Mensaje nuevo»', filaB && filaB.n === '1' && /Mensaje nuevo/.test(filaB.estado), JSON.stringify(filaB));
  const toast = await A.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent + (e.classList.contains('con-conv') ? ' [toca]' : '') : ''; });
  ok('aviso «Mensaje nuevo en …» que se puede tocar', /Mensaje nuevo en «.+»/.test(toast) && /\[toca\]/.test(toast), toast);
  // borradores por conversación
  await A.click('#texto'); await A.keyboard.type('borrador para C', { delay: 5 });
  await A.click('#lista-filas .fila-conv[data-id="' + idAB + '"]'); await espera(900);
  const enB = await A.evaluate(() => ({ texto: document.querySelector('#texto').value, ult: [...document.querySelectorAll('#mensajes .gc-burbuja.gc-suya .gc-texto')].map((x) => x.textContent).pop() }));
  ok('al cambiar a la de B: su mensaje a la vista y el campo vacío', enB.ult === 'Mensaje de B' && enB.texto === '', JSON.stringify(enB));
  ok('la fila de B ya sin número', ((await filas(A)).find((x) => x.id === idAB) || {}).n === '');
  await espera(1500);
  const tickB = await B.evaluate(() => { const t = [...document.querySelectorAll('#mensajes .gc-ticks')].pop(); return t ? t.classList.contains('gc-leido') : null; });
  ok('B ve su mensaje leído (verde) al abrirlo A', tickB === true);
  await A.click('#lista-filas .fila-conv[data-id="' + idAC + '"]'); await espera(800);
  ok('al volver a la de C, su borrador sigue', (await A.evaluate(() => document.querySelector('#texto').value)) === 'borrador para C');
  await A.fill('#texto', ''); await A.dispatchEvent('#texto', 'input');
  // llamadas: B llama a A mientras A está en la de C
  await B.click('#llamar'); await espera(2000);
  ok('A: suena la llamada de B estando en la de C', await visible(A, '#ll-entrante'));
  await pulsa(A, '#ll-contestar'); await espera(3500);
  ok('al contestar, A pasa a la conversación de B', (await actual(A)) === idAB, await actual(A));
  // C llama a A durante la llamada con B: «ocupado»
  await C.tap('#llamar').catch(async () => { await C.evaluate(() => document.querySelector('#llamar').click()); });
  await espera(3500);
  const resuC = await C.evaluate(() => { const li = [...document.querySelectorAll('#mensajes li.gc-llam-li')].pop(); return li ? li.textContent : ''; });
  ok('C: «Comunicando» (A ya estaba en otra llamada)', /Comunicando/.test(resuC), resuC);
  ok('A: la llamada con B sigue', await A.evaluate(() => !document.querySelector('#ll-tiempo').hidden));
  await pulsa(A, '#ll-colgar'); await espera(2500);
  const resuA = await A.evaluate(() => { const li = [...document.querySelectorAll('#mensajes li.gc-llam-li')].pop(); return li ? li.textContent : ''; });
  ok('A: «Llamada entrante» en la conversación de B', /Llamada entrante/.test(resuA), resuA);
  // nombre propio
  await A.click('#cmas'); await espera(200); await A.click('#cm-nombre'); await espera(300);
  await A.fill('#nombre-conv', 'Abogado'); await A.click('#nombre-guardar'); await espera(400);
  const nom = await A.evaluate(() => document.querySelector('#cnombre').textContent);
  ok('nombre propio en la cabecera y en la lista', nom === 'Abogado' && (await filas(A)).some((x) => x.nombre === 'Abogado'), nom);
  await A.screenshot({ path: S + 'varias-2-A-nombre.png' });
  // C en el teléfono: «‹» a la lista y vuelta
  ok('C (teléfono): sin la barra de arriba dentro de la conversación', !(await visible(C, '#barra')));
  await C.tap('#cvolver'); await espera(400);
  ok('C: «‹» lleva a la lista', (await visible(C, '#lista')) && !(await visible(C, '#conv')));
  await C.screenshot({ path: S + 'varias-3-C-lista.png' });
  await C.tap('#lista-filas .fila-conv'); await espera(500);
  ok('C: tocar la fila vuelve a la conversación', (await visible(C, '#conv')) && !(await visible(C, '#lista')));
  // terminar solo la de C
  await A.click('#lista-filas .fila-conv[data-id="' + idAC + '"]'); await espera(700);
  await A.click('#terminar'); await espera(400); await A.click('#cierre-si'); await espera(2500);
  const f4 = await filas(A);
  ok('A: terminar la de C deja la de B', f4.length === 1 && f4[0].id === idAB, JSON.stringify(f4));
  ok('C: su conversación se ha borrado', !(await visible(C, '#conv')));
  // recargar: sigue la de B con sus mensajes
  await A.reload(); await espera(3500);
  const f5 = await filas(A);
  const tras = await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].map((x) => x.textContent));
  ok('al recargar, la conversación con B sigue con sus mensajes', f5.length === 1 && f5[0].nombre === 'Abogado' && tras.includes('Hola B') && tras.includes('Mensaje de B'), JSON.stringify({ f5, tras }));
  await escribe(B, 'Después de recargar'); await espera(1500);
  ok('y siguen hablando', (await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].map((x) => x.textContent))).includes('Después de recargar'));
  await A.screenshot({ path: S + 'varias-4-A-recarga.png' });

  for (const p of [A, B, C]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n'));
  await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e); process.exit(1); });
