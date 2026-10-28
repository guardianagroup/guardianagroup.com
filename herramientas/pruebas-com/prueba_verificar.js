// Recorrido de cliente del comprobante de entrega: enviar un archivo, ver el comprobante, «Verificar en
// guardianagroup.com» (con el comprobante ya cargado), descargar el .json y verificarlo, comprobar el archivo, y soltar el
// PDF por error. En sesión normal y en sesión blindada; capturas en ordenador y en móvil.
const { chromium } = require('playwright');
const fs = require('fs');
const S = '/tmp/pruebas-com/prueba-com/';
const BASE = 'http://127.0.0.1:8802';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
(async () => {
  const b = await chromium.launch();
  const mk = async (n, w, url) => {
    const c = await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 860 }, isMobile: w < 500, hasTouch: w < 500, locale: 'es-ES', timezoneId: 'America/Bogota', acceptDownloads: true });
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
    const p = await c.newPage(); p.errores = [];
    p.on('pageerror', (e) => p.errores.push(n + ': ' + e.message)); p.on('dialog', (d) => d.dismiss());
    if (url) { await p.goto(url); await p.waitForTimeout(1500); }
    return p;
  };
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  fs.writeFileSync(S + 'contrato.txt', 'Contrato de prueba GUARDIANA\n'.repeat(2000));
  for (const modo of ['normal', 'blindada']) {
    const A = await mk('A', 1280, BASE + '/orbita/comunicaciones/');
    let B;
    if (modo === 'normal') {
      B = await mk('B', 1280, BASE + '/orbita/comunicaciones/');
      await A.click('#nueva'); await A.waitForTimeout(1500);
      const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
      await B.click('#unir'); await B.fill('#unir-codigo', codigo); await B.waitForTimeout(200); if (await vis(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
    } else {
      await A.click('#nueva-blindada'); await espera(2500);
      B = await mk('B', 1280, await A.inputValue('#enlace-b'));
    }
    for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
    await espera(3000);
    if (modo === 'blindada') { for (const p of [A, B]) if (await vis(p, '#bl-coincide')) await p.click('#bl-coincide'); await espera(2500); }
    await A.setInputFiles('#archivo', S + 'contrato.txt'); await A.waitForTimeout(500); await A.click('#envio-si');
    let firmado = false; for (let i = 0; i < 40 && !firmado; i++) { await espera(500); firmado = await A.evaluate(() => [...document.querySelectorAll('#mensajes button')].some((x) => /Ver comprobante/.test(x.textContent))); }
    ok(modo + ': el comprobante aparece en el chat', firmado);
    if (await A.evaluate(() => !!document.querySelector('#h-viaje.gc-abierta'))) { await A.keyboard.press('Escape'); await espera(300); }
    await A.evaluate(() => [...document.querySelectorAll('#mensajes button')].reverse().find((x) => /Ver comprobante/.test(x.textContent)).click()); await espera(1500);
    await A.screenshot({ path: S + 'c-' + modo + '-1-chat-comprobante.png' });
    const href = await A.getAttribute('#cu-verificar', 'href');
    ok(modo + ': «Verificar» lleva el comprobante en el enlace (fragmento)', /#c=[A-Za-z0-9_-]{100,}$/.test(href || ''), (href || '').slice(0, 60) + '… (' + (href || '').length + ' caracteres)');
    // la página de verificación abierta desde el chat: ya cargado y comprobado
    for (const w of [1280, 390]) {
      const V = await mk('V' + w, w, BASE + href);
      await espera(1500);
      const r = await V.evaluate(() => ({ veredicto: (document.querySelector('#ver-titulo') || {}).textContent, arriba: Math.round(document.querySelector('#veredicto').getBoundingClientRect().top), zonaOculta: document.querySelector('#zona-comp').hidden, visible: !document.querySelector('#resultado').hidden, estado: (document.querySelector('.cu-estado b') || {}).textContent, url: location.pathname + location.hash, pq: (document.querySelector('.cu-firma .cu-bien') || {}).textContent || '' }));
      ok(modo + ' ' + w + ': veredicto grande «Comprobante válido» arriba, a la vista', r.veredicto === 'Comprobante válido' && r.arriba >= 0 && r.arriba < 260 && r.zonaOculta, r.veredicto + ' · y=' + r.arriba);
      ok(modo + ' ' + w + ': se verifica solo al abrir y el fragmento se quita de la dirección', r.visible && /Firmado por los dos equipos/.test(r.estado || '') && r.url === '/orbita/comunicaciones/verificar/', JSON.stringify(r).slice(0, 160));
      if (modo === 'blindada') ok('blindada: la firma postcuántica sale como válida', /Válida/.test(r.pq), r.pq);
      await V.screenshot({ path: S + 'c-' + modo + '-2-verificada-' + w + '.png', fullPage: true });
      for (const e of V.errores) res.push('ERROR ' + e);
      await V.context().close();
    }
    // descargar el .json y verificarlo a mano, con el archivo y con el PDF por error
    const [dl] = await Promise.all([A.waitForEvent('download'), A.click('#cu-json')]);
    const ruta = S + 'comprobante-' + modo + '.json'; await dl.saveAs(ruta);
    ok(modo + ': el .json se descarga con nombre claro', /\.json$/.test(dl.suggestedFilename()), dl.suggestedFilename());
    const V = await mk('V', 1280, BASE + '/orbita/comunicaciones/verificar/');
    await V.setInputFiles('#f-comp', ruta); await espera(1500);
    ok(modo + ': el .json elegido a mano se verifica', /Firmado por los dos equipos/.test(await V.textContent('.cu-estado b')) && (await V.textContent('#ver-titulo')) === 'Comprobante válido');
    await V.setInputFiles('#f-arch', S + 'contrato.txt'); await espera(1500);
    ok(modo + ': el archivo original coincide (sello verde)', /exactamente el archivo que se envió/.test(await V.textContent('#arch-res')) && (await V.getAttribute('#arch-res', 'class')).includes('bien'));
    await V.setInputFiles('#f-arch', ruta); await espera(800);
    ok(modo + ': si se elige el propio .json, se explica qué archivo hace falta', /Ese es el comprobante/.test(await V.textContent('#arch-res')) && /contrato\.txt/.test(await V.textContent('#arch-res')), (await V.textContent('#arch-res')).slice(0, 90));
    await V.setInputFiles('#f-arch', { name: 'otro.txt', mimeType: 'text/plain', buffer: Buffer.from('no es el mismo') }); await espera(800);
    ok(modo + ': otro archivo: «No es el mismo archivo» y por qué', /No es el mismo archivo/.test(await V.textContent('#arch-res')) && /otro tamaño/.test(await V.textContent('#arch-res')), (await V.textContent('#arch-res')).slice(0, 120));
    await V.setInputFiles('#f-arch', S + 'contrato.txt'); await espera(1200);
    await V.screenshot({ path: S + 'c-' + modo + '-3-archivo.png', fullPage: true });
    fs.writeFileSync(S + 'comprobante.pdf', '%PDF-1.4\n% prueba\n');
    await V.setInputFiles('#f-comp', { name: 'comprobante.pdf', mimeType: 'application/pdf', buffer: fs.readFileSync(S + 'comprobante.pdf') }); await espera(800);
    const msg = await V.textContent('#error');
    ok(modo + ': con el PDF, explica qué archivo hace falta', /PDF del comprobante/.test(msg), msg.slice(0, 80));
    await V.screenshot({ path: S + 'c-' + modo + '-4-pdf.png' });
    for (const p of [A, B, V]) for (const e of p.errores) res.push('ERROR ' + e);
    for (const p of [A, B, V]) await p.context().close();
  }
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e.message.slice(0, 600)); process.exit(1); });
