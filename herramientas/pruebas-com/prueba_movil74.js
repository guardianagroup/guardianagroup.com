// Ronda 74: el móvil. Cabecera en una fila con «⋯» (seguridad, modo discreto, terminar), sin la franja repetida ni «Multas»
// dentro de la conversación, campo de 16 px, tocar el nombre abre la seguridad y, al recibir una llamada, las voces plegadas.
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
    const c = await b.newContext(Object.assign({}, disp || { viewport: { width: 1280, height: 760 } }, { permissions: ['microphone', 'camera'], locale: 'es-ES', timezoneId: 'America/Bogota' }));
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
    const p = await c.newPage(); p.errores = [];
    p.on('pageerror', (e) => p.errores.push(nombre + ': ' + e.message));
    p.on('dialog', (d) => { p.errores.push(nombre + ': ventana del navegador ' + d.type()); d.dismiss(); });
    await p.goto(URL); await p.waitForTimeout(1500);
    return p;
  };
  for (const [etq, disp] of [['iphone', devices['iPhone 13']], ['android', devices['Pixel 7']]]) {
    const A = await mk('A-' + etq), C = await mk('C-' + etq, disp);
    const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null && getComputedStyle(e).display !== 'none'); }, s);
    await A.click('#nueva'); await A.waitForTimeout(1500);
    const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
    void codigo; await A.click('#codigo-enlace'); const enlaceI = await A.evaluate(() => document.querySelector('#codigo-enlace').dataset.enlace);
    await C.goto(enlaceI); for (let i = 0; i < 20 && !(await visible(C, '#aceptar-si')); i++) await espera(300);
    await C.tap('#aceptar-si');
    for (let i = 0; i < 40 && !((await visible(A, '#conv')) && (await visible(C, '#conv'))); i++) await espera(500);
    for (const p of [A, C]) if (await visible(p, '#pro')) { await p.click('#pro-empezar').catch(() => {}); }
    await espera(2500);
    ok(etq + ': conversación abierta', (await visible(C, '#conv')));
    const cab = await C.evaluate(() => {
      const v = (s) => { const e = document.querySelector(s); return !!(e && e.offsetParent !== null && getComputedStyle(e).display !== 'none'); };
      const nom = document.querySelector('#cnombre'), conf = document.querySelector('#cconfianza'), cab = document.querySelector('.conv .gc-cabecera');
      return { mas: v('#cmas'), terminar: v('#terminar'), discreto: v('#discreto'), escudo: v('#escudo'), radio: v('#radio'), multas: v('.barra .multas-b'), idioma: v('.barra .idiomas'), nombre: nom.textContent, cortado: nom.scrollWidth > nom.clientWidth + 1, confianza: conf.textContent, lineas: Math.round(conf.getBoundingClientRect().height / parseFloat(getComputedStyle(conf).lineHeight)), alto: Math.round(cab.getBoundingClientRect().height), campo: getComputedStyle(document.querySelector('#texto')).fontSize, desborda: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    ok(etq + ': cabecera con «⋯» y sin Terminar/Modo discreto/escudo', cab.mas && !cab.terminar && !cab.discreto && !cab.escudo, JSON.stringify(cab));
    ok(etq + ': sin la franja repetida, sin «Multas» ni idioma', !cab.radio && !cab.multas && !cab.idioma);
    ok(etq + ': nombre entero («Conversación»)', cab.nombre === 'Conversación' && !cab.cortado, cab.nombre);
    ok(etq + ': estado corto (1–2 líneas)', cab.lineas <= 2 && /^Encriptada · /.test(cab.confianza), cab.confianza + ' · ' + cab.lineas + ' líneas');
    ok(etq + ': campo de 16 px (sin zoom en el iPhone)', cab.campo === '16px', cab.campo);
    ok(etq + ': sin desbordes', !cab.desborda);
    await C.screenshot({ path: S + etq + '-1-cabecera.png' });
    // menú
    await C.tap('#cmas'); await espera(300);
    const menu = await C.evaluate(() => [...document.querySelectorAll('#cmenu button')].filter((x) => !x.hidden).map((x) => x.textContent.trim()));
    ok(etq + ': menú con nombre, seguridad, modo discreto y terminar', JSON.stringify(menu) === JSON.stringify(['Cambiar el nombre', 'Seguridad y verificación', 'Modo discreto', 'Pantalla completa', 'Terminar conversación']), JSON.stringify(menu));
    await C.screenshot({ path: S + etq + '-2-menu.png' });
    await C.tap('#cm-discreto'); await espera(300);
    ok(etq + ': modo discreto desde el menú', await C.evaluate(() => document.querySelector('#discreto').getAttribute('aria-pressed') === 'true' && document.querySelector('#cm-discreto').getAttribute('aria-checked') === 'true'));
    await C.tap('#cm-discreto'); await espera(200);
    await C.tap('#cm-terminar'); await espera(500);
    ok(etq + ': «Terminar conversación» pide confirmación', await C.evaluate(() => !!document.querySelector('#h-cierre.gc-abierta')) && await visible(C, '#conv'));
    await C.screenshot({ path: S + etq + '-3-terminar.png' });
    await C.evaluate(() => { const h = document.querySelector('#h-cierre'); const b = h && [...h.querySelectorAll('button')].find((x) => /Cancelar|Seguir/.test(x.textContent)); if (b) b.click(); else h.classList.remove('gc-abierta'); });
    await espera(400);
    // tocar el nombre: seguridad
    await C.tap('.conv .gc-quien'); await espera(500);
    ok(etq + ': tocar el nombre abre la seguridad', await C.evaluate(() => !!document.querySelector('#h-escudo.gc-abierta')));
    await C.evaluate(() => document.querySelector('#escudo-cerrar').click()); await espera(300);
    // llamada entrante en el móvil: voces plegadas
    await A.click('#videollamar'); await espera(2000);
    ok(etq + ': entrante con «Tu voz: Natural» plegada', (await visible(C, '#ll-voz-pill')) && !(await visible(C, '#ll-voces')) && (await C.textContent('#ll-voz-pill span')) === 'Tu voz: Natural');
    await C.screenshot({ path: S + etq + '-4-entrante.png' });
    await C.tap('#ll-voz-pill'); await espera(300);
    ok(etq + ': al tocarla, se ven las voces', await visible(C, '#ll-voces'));
    await C.tap('#ll-voces [data-voz="grave"]'); await espera(300);
    ok(etq + ': la píldora dice la voz elegida', (await C.textContent('#ll-voz-pill span')) === 'Tu voz: Más grave');
    await C.screenshot({ path: S + etq + '-5-voces.png' });
    await C.tap('#ll-voces [data-voz="natural"]'); await espera(200);
    await C.tap('#ll-contestar'); await espera(4500);
    ok(etq + ': contestada', await C.evaluate(() => !document.querySelector('#ll-tiempo').hidden));
    await C.screenshot({ path: S + etq + '-6-en-llamada.png' });
    await C.tap('body', { position: { x: 195, y: 300 } }).catch(() => {}); await espera(300);
    await C.tap('#ll-colgar').catch(async () => { await C.evaluate(() => document.querySelector('#ll-colgar').click()); });
    await espera(2500);
    const resu = await C.evaluate(() => { const li = [...document.querySelectorAll('#mensajes li.gc-llam-li')].pop(); return li ? li.textContent : ''; });
    ok(etq + ': resumen «Videollamada entrante» en el chat del móvil', /Videollamada entrante/.test(resu), resu);
    await C.screenshot({ path: S + etq + '-7-resumen.png' });
    for (const p of [A, C]) for (const e of p.errores) res.push('ERROR ' + e);
    await A.context().close(); await C.context().close();
  }
  console.log(res.join('\n'));
  await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e); process.exit(1); });
