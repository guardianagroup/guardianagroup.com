// Ronda 74 / dueño 28 Oct 2026 13:29–13:37: tics de leído en verde, «escribiendo…», resúmenes de llamada a cada lado,
// avisos con la página minimizada (título, punto y aviso del sistema simulado) y la tira para activar los avisos.
// Local: página en 127.0.0.1:8802 y relé de pruebas en 127.0.0.1:8794; dos navegadores de ordenador.
const { chromium } = require('playwright');
const fs = require('fs');
const S = '/tmp/pruebas-com/prueba-74/';
fs.mkdirSync(S, { recursive: true });
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = [];
const ok = (nombre, cond, extra) => { res.push((cond ? 'OK   ' : 'FALLA') + ' ' + nombre + (extra ? ' · ' + extra : '')); };

(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (nombre, notif) => {
    const c = await b.newContext({ viewport: { width: 1280, height: 760 }, permissions: ['microphone', 'camera'], locale: 'es-ES', timezoneId: 'America/Bogota' });
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
    if (notif) await c.addInitScript(() => {
      // aviso del sistema simulado: se apuntan los avisos y el permiso empieza «sin decidir»
      window.__avisos = []; window.__perm = 'default';
      class N { constructor(t, o) { this.t = t; this.o = o || {}; window.__avisos.push({ t, body: this.o.body, tag: this.o.tag, fija: !!this.o.requireInteraction }); } close() { this.cerrado = true; } static get permission() { return window.__perm; } static requestPermission() { window.__perm = 'granted'; return Promise.resolve('granted'); } }
      window.Notification = N;
      // «minimizada»: se puede fingir que la pestaña no está a la vista
      window.__oculta = false;
      Object.defineProperty(document, 'visibilityState', { get: () => (window.__oculta ? 'hidden' : 'visible'), configurable: true });
      const hf = document.hasFocus.bind(document); document.hasFocus = () => (window.__oculta ? false : hf() || true);
    });
    const p = await c.newPage(); p.errores = [];
    p.on('pageerror', (e) => p.errores.push(nombre + ': ' + e.message));
    p.on('dialog', (d) => { p.errores.push(nombre + ': ventana del navegador ' + d.type()); d.dismiss(); });
    await p.goto(URL); await p.waitForTimeout(1500);
    return p;
  };
  const A = await mk('A', false), B = await mk('B', true);
  const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);

  // conversación
  await A.click('#nueva'); await A.waitForTimeout(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  await B.click('#unir'); await B.waitForTimeout(300);
  await B.fill('#unir-codigo', codigo); await B.waitForTimeout(200);
  if (await visible(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !((await visible(A, '#conv')) && (await visible(B, '#conv'))); i++) await espera(500);
  for (const p of [A, B]) if (await visible(p, '#pro')) { await p.click('#pro-empezar').catch(() => {}); }
  await espera(2500);
  ok('conversación abierta', (await visible(A, '#conv')) && (await visible(B, '#conv')));

  // la tira de avisos: en B (permiso sin decidir) sí; en A (sin Notification simulada, permiso del navegador) según el navegador
  ok('B ve la tira «Activar avisos»', await visible(B, '#cavisos'));
  await B.screenshot({ path: S + '1-B-tira-avisos.png' });
  await B.click('#cavisos-si'); await espera(400);
  ok('tras activarlos, la tira se va', !(await visible(B, '#cavisos')));

  // «escribiendo…»
  await A.click('#texto'); await A.keyboard.type('Hola, ¿qu', { delay: 40 });
  let vio = false; for (let i = 0; i < 20 && !vio; i++) { await espera(150); vio = await visible(B, '#mensajes li.gc-escribiendo .gc-puntos'); }
  ok('B ve los tres puntos mientras A escribe', vio);
  await B.screenshot({ path: S + '2-B-escribiendo.png' });
  ok('los puntos van al final del chat', await B.evaluate(() => { const ul = document.querySelector('#mensajes'); return ul.lastElementChild && ul.lastElementChild.classList.contains('gc-escribiendo'); }));
  await A.fill('#texto', ''); await A.dispatchEvent('#texto', 'input');
  let fue = false; for (let i = 0; i < 20 && !fue; i++) { await espera(150); fue = !(await visible(B, '#mensajes li.gc-escribiendo')); }
  ok('al borrar el texto, los puntos se van', fue);

  // leído en verde
  await A.click('#texto'); await A.keyboard.type('Primer mensaje', { delay: 10 }); await A.keyboard.press('Enter');
  await espera(2500);
  const tick = await A.evaluate(() => { const t = [...document.querySelectorAll('#mensajes .gc-ticks')].pop(); return t ? { leido: t.classList.contains('gc-leido'), color: getComputedStyle(t).color, titulo: t.title } : null; });
  ok('A: tics de leído en verde', tick && tick.leido && tick.color === 'rgb(92, 201, 138)', JSON.stringify(tick));
  ok('B no tiene puntos tras recibir el mensaje', !(await visible(B, '#mensajes li.gc-escribiendo')));
  await A.screenshot({ path: S + '3-A-leido.png' });

  // minimizada: título con el número, punto en el icono y aviso del sistema sin contenido
  await B.evaluate(() => { window.__oculta = true; document.dispatchEvent(new Event('visibilitychange')); });
  await A.click('#texto'); await A.keyboard.type('Segundo', { delay: 10 }); await A.keyboard.press('Enter'); await espera(1500);
  await A.click('#texto'); await A.keyboard.type('Tercero', { delay: 10 }); await A.keyboard.press('Enter'); await espera(1800);
  const fuera = await B.evaluate(() => ({ titulo: document.title, icono: (document.querySelector('link[rel="icon"]') || {}).href || '', avisos: window.__avisos.slice() }));
  ok('B minimizada: «(2)» en el título (o su alternancia)', /^\(2\) |2 mensajes nuevos/.test(fuera.titulo), fuera.titulo);
  ok('B minimizada: punto en el icono', /^data:image\/png/.test(fuera.icono));
  ok('B minimizada: aviso del sistema sin el texto', fuera.avisos.length >= 1 && /mensajes? nuevos?/.test(fuera.avisos[fuera.avisos.length - 1].body) && !fuera.avisos.some((x) => /Segundo|Tercero/.test(x.body + x.t)), JSON.stringify(fuera.avisos));
  const tickNoLeido = await A.evaluate(() => { const t = [...document.querySelectorAll('#mensajes .gc-ticks')].pop(); return t ? t.classList.contains('gc-leido') : null; });
  ok('A: sin leer mientras B está minimizada', tickNoLeido === false);
  await B.evaluate(() => { window.__oculta = false; document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); });
  await espera(1500);
  const vuelta = await B.evaluate(() => ({ titulo: document.title, icono: (document.querySelector('link[rel="icon"]') || {}).getAttribute('href') }));
  ok('B vuelve: título e icono limpios', !/^\(/.test(vuelta.titulo) && !/^data:/.test(vuelta.icono || ''), JSON.stringify(vuelta));
  const tickLeido2 = await A.evaluate(() => { const t = [...document.querySelectorAll('#mensajes .gc-ticks')].pop(); return t ? t.classList.contains('gc-leido') : null; });
  ok('A: leído al volver B', tickLeido2 === true);

  // llamadas: resúmenes a cada lado
  const pulsa = async (p, sel) => { await p.mouse.move(640, 380); await p.mouse.move(650, 390); await espera(150); await p.click(sel, { timeout: 5000 }); };
  const ultimaLlam = (p) => p.evaluate(() => { const li = [...document.querySelectorAll('#mensajes li.gc-llam-li')].pop(); if (!li) return null; const b = li.querySelector('.gc-burbuja'); return { lado: b.classList.contains('gc-mia') ? 'mia' : 'suya', titulo: b.querySelector('b').textContent, sub: (b.querySelector('small') || {}).textContent || '', clase: b.className }; });
  // 1) A llama (voz), B contesta, A cuelga
  await A.click('#llamar'); await espera(1500);
  ok('B: el tiempo no se ve mientras suena', await B.evaluate(() => document.querySelector('#ll-tiempo').hidden));
  ok('B: las voces plegadas al recibir', !(await visible(B, '#ll-voces')) && (await visible(B, '#ll-voz-pill')));
  await B.screenshot({ path: S + '4-B-entrante.png' });
  ok('B: aviso de llamada con la página a la vista: no', !(await B.evaluate(() => window.__avisos.some((x) => x.tag === 'gcom-llamada'))));
  await pulsa(B, '#ll-contestar'); await espera(4000);
  ok('A: el tiempo se ve contestada', await A.evaluate(() => !document.querySelector('#ll-tiempo').hidden));
  const cal = await A.evaluate(() => { const c = document.querySelector('#ll-calidad'); return { t: c.textContent, n: c.dataset.nivel, l: c.dataset.largo }; });
  ok('A: calidad corta («Conexión: …»)', /^Conexión: /.test(cal.t) && !!cal.n, JSON.stringify(cal));
  await pulsa(A, '#ll-colgar'); await espera(2500);
  let la = await ultimaLlam(A), lb = await ultimaLlam(B);
  ok('A: «Llamada saliente» a la derecha', la && la.lado === 'mia' && la.titulo === 'Llamada saliente' && /^\d\d:\d\d/.test(la.sub), JSON.stringify(la));
  ok('B: «Llamada entrante» a la izquierda', lb && lb.lado === 'suya' && lb.titulo === 'Llamada entrante', JSON.stringify(lb));
  await A.screenshot({ path: S + '5-A-resumen.png' }); await B.screenshot({ path: S + '5-B-resumen.png' });
  // 2) A videollama, B rechaza
  await espera(1200);
  await A.click('#videollamar'); await espera(2000);
  await pulsa(B, '#ll-rechazar'); await espera(2500);
  la = await ultimaLlam(A); lb = await ultimaLlam(B);
  ok('A: «Videollamada sin respuesta» a la derecha', la && la.lado === 'mia' && la.titulo === 'Videollamada sin respuesta', JSON.stringify(la));
  ok('B: «Videollamada rechazada» a la izquierda', lb && lb.lado === 'suya' && lb.titulo === 'Videollamada rechazada', JSON.stringify(lb));
  // 3) A llama y cuelga antes de que contesten, con B minimizada: B tiene «Llamada perdida» y los avisos
  await espera(1200);
  await B.evaluate(() => { window.__oculta = true; window.__avisos.length = 0; document.dispatchEvent(new Event('visibilitychange')); });
  await A.click('#llamar'); await espera(2000);
  const durante = await B.evaluate(() => ({ titulo: document.title, avisos: window.__avisos.slice() }));
  ok('B minimizada: aviso fijo de llamada entrante', durante.avisos.some((x) => x.tag === 'gcom-llamada' && x.fija && /Llamada entrante/.test(x.t)), JSON.stringify(durante));
  ok('B minimizada: el título dice «Llamada entrante»', /Llamada entrante/.test(durante.titulo), durante.titulo);
  await pulsa(A, '#ll-colgar'); await espera(2500);
  la = await ultimaLlam(A); lb = await ultimaLlam(B);
  ok('A: «Llamada cancelada» a la derecha', la && la.lado === 'mia' && la.titulo === 'Llamada cancelada', JSON.stringify(la));
  ok('B: «Llamada perdida» a la izquierda, en coral', lb && lb.lado === 'suya' && lb.titulo === 'Llamada perdida' && /perdida/.test(lb.clase), JSON.stringify(lb));
  const tras = await B.evaluate(() => ({ titulo: document.title, avisos: window.__avisos.map((x) => x.body || x.t) }));
  ok('B minimizada: aviso «Llamada perdida.»', tras.avisos.some((x) => /Llamada perdida\./.test(x)), JSON.stringify(tras));
  await B.evaluate(() => { window.__oculta = false; document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); });
  await espera(800);
  await B.screenshot({ path: S + '6-B-perdida.png' });
  // volver a llamar desde la burbuja
  await B.click('#mensajes li.gc-llam-li:last-child .gc-llam-otra'); await espera(1500);
  ok('B: «Volver a llamar» llama', await A.evaluate(() => !document.querySelector('#ll-entrante').hidden));
  await pulsa(A, '#ll-rechazar'); await espera(2000);

  for (const p of [A, B]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n'));
  await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e); process.exit(1); });
