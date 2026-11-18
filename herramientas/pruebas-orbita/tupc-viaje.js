// «El viaje de tus datos», dentro de «Ver mi PC en directo» (dueño, 17 nov 2026, 21:51: «el botón ese que quitamos el día 2 de
// noviembre porque yo lo pedí… ponlo dentro de ver mi PC en directo»).
//   1. En el programa, «Ver mi PC en directo» lleva el bloque «El viaje de tus datos» con «Ver el viaje en 3D».
//   2. Al pulsarlo se mide (el botón cuenta: «Midiendo… n / 34») y, al acabar, la vista del PC se aparta y empieza el viaje.
//   3. «Saltar» lleva al final: «Guardar el viaje (PDF)», «Verlo otra vez» y «Volver a Órbita».
//   4. De vuelta en «Ver mi PC en directo», con el viaje ya medido: «Ver el viaje en 3D» y «Guardar el viaje (PDF)».
//   5. «Guardar el viaje (PDF)» pide primero dónde guardarlo (el «Guardar como» de Windows, aquí uno de prueba) y escribe un PDF.
// El programa y la red se imitan: las lecturas del PC responden por el canal del programa, y las sondas a los centros de datos
// (Amazon Web Services, Cloudflare) se contestan aquí mismo con una espera corta.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'tupc-viaje');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/?nucleo=0';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (ok || extra === undefined ? '' : '  ' + JSON.stringify(extra))); if (!ok) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { try { if (await fn()) return true; } catch (_) {} await espera(200); } return false; };

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 736 }, userAgent: PC, locale: 'es-CO', timezoneId: 'America/Bogota' });
    await ctx.addInitScript(() => {
      const marca = () => { if (!document.documentElement) return false; document.documentElement.dataset.enPrograma = '1'; return true; };
      if (!marca()) new MutationObserver((_, o) => { if (marca()) o.disconnect(); }).observe(document, { childList: true });
      // las sondas del viaje, contestadas aquí (sin red): cada una tarda un poco, como una de verdad
      const real = window.fetch.bind(window);
      window.fetch = (u, op) => { const s = String(u && u.url ? u.url : u);
        if (/amazonaws\.com\//.test(s)) return new Promise((ok) => setTimeout(() => ok(new Response('', { status: 200 })), 20 + Math.random() * 60));
        if (/speed\.cloudflare\.com/.test(s)) return new Promise((ok) => setTimeout(() => ok(new Response('fl=1\ncolo=BOG\n', { status: 200 })), 25));
        return real(u, op); };
      window.__guardar = { pedidos: [], escritos: [] };
      window.showSaveFilePicker = async (op) => { window.__guardar.pedidos.push(JSON.parse(JSON.stringify(op))); return { createWritable: async () => ({ write: async (b) => { window.__guardar.escritos.push({ tipo: b.type, bytes: b.size, empieza: await b.slice(0, 5).text() }); }, close: async () => {} }) }; };
    });
    const P = await ctx.newPage(); P.on('pageerror', (e) => { console.log('pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror'); });
    await P.goto(URL0); await espera(7000);
    const hayBoton = await hasta(() => P.evaluate(() => !!document.querySelector('#tupc-btn')), 10000);
    comprueba(hayBoton, '0. en el programa, Órbita tiene «Ver mi PC en directo»');
    await P.click('#tupc-btn'); await espera(1200);
    const bloque = () => P.evaluate(() => { const v = document.querySelector('#tupc .viaje-pc'); if (!v) return null; const r = v.getBoundingClientRect(), h = document.querySelector('#tupc').getBoundingClientRect(); const b = v.querySelector('.vj-ver'), p = v.querySelector('.vj-pdf');
      return { ve: !v.hidden && r.height > 0 && r.bottom <= h.bottom + 1, titulo: v.querySelector('.k2').textContent, boton: b.textContent, pdf: !p.hidden && p.getBoundingClientRect().width > 0, deshabilitado: b.disabled }; });
    let bl = await bloque();
    comprueba(!!bl && bl.ve && bl.titulo === 'El viaje de tus datos' && bl.boton === 'Ver el viaje en 3D' && !bl.pdf, '1. «Ver mi PC en directo» lleva «El viaje de tus datos», con «Ver el viaje en 3D»', bl);
    await P.screenshot({ path: path.join(OUT, '01-tu-pc-con-viaje.png') });

    await P.click('#tupc .vj-ver');
    const midiendo = await hasta(async () => /^Midiendo… \d+ \/ \d+$/.test(((await bloque()) || {}).boton || ''), 4000);
    comprueba(midiendo, '2. al pulsarlo, mide y el botón lo cuenta («Midiendo… n / 34»)', await bloque());
    await P.screenshot({ path: path.join(OUT, '02-midiendo.png') });
    const vuela = await hasta(() => P.evaluate(() => document.body.classList.contains('viaje') && !document.body.classList.contains('en-tupc') && !document.querySelector('#viaje').hidden), 30000);
    comprueba(vuela, '2. al acabar la medición, la vista del PC se aparta y empieza el viaje');
    await espera(2500); await P.screenshot({ path: path.join(OUT, '03-viaje.png') });

    // «Saltar» hasta el final
    const fin = await hasta(async () => { await P.evaluate(() => { const b = document.querySelector('#viaje .saltar'); if (b) b.click(); }); return P.evaluate(() => { const f = document.querySelector('#viaje .fin'); return !!f && !f.hidden; }); }, 60000);
    const finBot = await P.evaluate(() => [...document.querySelectorAll('#viaje .fin .botones button')].filter((b) => !b.hidden).map((b) => b.textContent.trim()));
    comprueba(fin && finBot.includes('Guardar el viaje (PDF)') && finBot.includes('Volver a Órbita'), '3. al final del viaje: «Guardar el viaje (PDF)» y «Volver a Órbita»', finBot);
    await P.screenshot({ path: path.join(OUT, '04-final.png') });
    await P.click('#viaje .volver'); await espera(900);

    await P.click('#tupc-btn'); await espera(1200);
    bl = await bloque();
    comprueba(!!bl && bl.ve && bl.boton === 'Ver el viaje en 3D' && bl.pdf, '4. de vuelta en «Ver mi PC en directo»: «Ver el viaje en 3D» y «Guardar el viaje (PDF)»', bl);
    await P.screenshot({ path: path.join(OUT, '05-tu-pc-medido.png') });

    await P.click('#tupc .vj-pdf');
    const pedido = await hasta(() => P.evaluate(() => window.__guardar.pedidos.length > 0), 8000);
    const op = await P.evaluate(() => window.__guardar.pedidos[0] || {});
    comprueba(pedido && /^GUARDIANA-El-viaje-de-tus-datos-\d{4}-\d{2}-\d{2}\.pdf$/.test(op.suggestedName || ''), '5. «Guardar el viaje (PDF)» pide primero dónde guardarlo, con su nombre', op);
    const escrito = await hasta(() => P.evaluate(() => window.__guardar.escritos.length > 0), 90000);
    const es = await P.evaluate(() => window.__guardar.escritos[0] || {});
    comprueba(escrito && es.empieza === '%PDF-' && es.bytes > 20000, '5. y escribe el PDF en el archivo elegido', es);
  } catch (err) {
    console.log('ERROR ' + (err && err.stack || err)); fallos.push('excepción');
  } finally {
    await browser.close();
    console.log(fallos.length ? 'FALLOS: ' + fallos.length + ' → ' + fallos.join(' | ') : 'TODO OK');
    process.exit(fallos.length ? 1 : 0);
  }
})();
