// El Antivirus dentro del programa (dueño, 17 nov 2026):
//   1. 21:12, «le acabo de dar a escanear… la página no aparece desde arriba del todo, sale como cortada»: al pulsar «Escanear este
//      equipo» (que está a media portada), el escaneo se ve desde arriba del todo.
//   2. 21:19, «le he dado a descargar en PDF y me lo abre directamente en el navegador de Guardiana… que te aparezca como aparece
//      siempre en Windows para guardarlo»: dentro del programa, «Descargar» abre el «Guardar como» de Windows (aquí, uno de
//      prueba), con el nombre del informe, y escribe en él el PDF. Si la persona cancela, no se guarda nada ni se abre nada.
//   3. Fuera del programa (una web cualquiera), la descarga de siempre.
// El programa se imita: las lecturas responden «200 {}» por el mismo canal que usa el programa (guardiana-panel).
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'antivirus-arriba-guardar');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (ok || extra === undefined ? '' : '  ' + JSON.stringify(extra))); if (!ok) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { try { if (await fn()) return true; } catch (_) {} await espera(200); } return false; };

async function pagina(browser, programa) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 736 }, userAgent: PC, locale: 'es-CO', acceptDownloads: true });
  await ctx.addInitScript((programa) => {
    if (!programa) return;
    const marca = () => { if (!document.documentElement) return false; document.documentElement.dataset.enPrograma = '1'; return true; };
    if (!marca()) new MutationObserver((_, o) => { if (marca()) o.disconnect(); }).observe(document, { childList: true });
    // el programa: cada lectura, «200 {}» un momento después
    document.addEventListener('guardiana-panel-pide', (e) => {
      let d = e.detail; try { d = JSON.parse(d); } catch (_) {}
      setTimeout(() => document.dispatchEvent(new CustomEvent('guardiana-panel', { detail: JSON.stringify({ n: d.n, estado: 200, datos: '{}' }) })), 60);
    });
    // el «Guardar como» de Windows, de prueba: apunta lo que se le pide y lo que se escribe
    window.__guardar = { pedidos: [], escritos: [], cancela: false };
    window.showSaveFilePicker = async (op) => {
      window.__guardar.pedidos.push(JSON.parse(JSON.stringify(op)));
      if (window.__guardar.cancela) throw new DOMException('cancelado', 'AbortError');
      return { createWritable: async () => ({ write: async (b) => { const t = await b.slice(0, 5).text(); window.__guardar.escritos.push({ tipo: b.type, bytes: b.size, empieza: t }); }, close: async () => { window.__guardar.cerrado = true; } }) };
    };
  }, programa);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror'); });
  return p;
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---- dentro del programa ----
    const P = await pagina(browser, true);
    await P.goto(URL0 + '#escaner'); await espera(3500);
    const hayBoton = await hasta(() => P.evaluate(() => !!document.querySelector('.escaner .esc-boton:not(.web)')), 8000);
    comprueba(hayBoton, '0. dentro del programa, la portada del Antivirus con «Escanear este equipo»');
    // la persona baja por la portada (lee «Qué examina») y vuelve a subir lo justo para pulsar el botón
    await P.evaluate(() => { const c = document.querySelector('.escaner .esc-cuerpo'); const b = c.querySelector('.esc-boton'); c.scrollTop = Math.max(0, b.offsetTop - 80); });
    await espera(300);
    const antes = await P.evaluate(() => document.querySelector('.escaner .esc-cuerpo').scrollTop);
    await P.screenshot({ path: path.join(OUT, '01-portada-bajada.png') });
    await P.click('.escaner .esc-boton'); await espera(700);
    const tras = await P.evaluate(() => { const c = document.querySelector('.escaner .esc-cuerpo'), t = document.querySelector('#esc-titulo-2'); const r = t ? t.getBoundingClientRect() : null, rc = c.getBoundingClientRect(); return { top: c.scrollTop, titulo: r ? Math.round(r.top - rc.top) : null, visible: !!r && r.top >= rc.top && r.bottom <= rc.bottom && r.height > 0 }; });
    comprueba(antes > 100 && tras.top === 0 && tras.visible, '1. al pulsar «Escanear este equipo» con la portada bajada, el escaneo se ve desde arriba del todo', { antes, tras });
    await P.screenshot({ path: path.join(OUT, '02-escaneando.png') });

    // el informe: «Descargar» → «Informe (PDF)» abre el «Guardar como»
    const hayDescargar = await hasta(() => P.evaluate(() => { const b = document.querySelector('.escaner .descargar'); return !!b && b.getBoundingClientRect().width > 0; }), 30000);
    comprueba(hayDescargar, '2. con lecturas hechas, sale «Descargar»');
    const pideYGuarda = async () => {
      await P.evaluate(() => document.querySelector('.escaner .descargar').scrollIntoView({ block: 'center' }));
      await P.click('.escaner .descargar'); await espera(250);
      await P.click('.descargar-menu button[role="menuitem"]'); await espera(900);
    };
    let bajadas = 0, nuevas = 0; P.on('download', () => { bajadas++; }); P.context().on('page', () => { nuevas++; });
    await pideYGuarda();
    let g = await P.evaluate(() => window.__guardar);
    const op = g.pedidos[0] || {};
    comprueba(g.pedidos.length === 1 && /^GUARDIANA-escaner-pc-\d{4}-\d{2}-\d{2}\.pdf$/.test(op.suggestedName || '') && op.startIn === 'desktop' && op.types && op.types[0].accept['application/pdf'][0] === '.pdf', '2. «Informe (PDF)» abre el «Guardar como» de Windows, con el nombre del informe y en el escritorio', op);
    comprueba(g.escritos.length === 1 && g.escritos[0].tipo === 'application/pdf' && g.escritos[0].empieza === '%PDF-' && g.escritos[0].bytes > 800 && g.cerrado === true, '2. y el PDF se escribe en el archivo elegido', g.escritos);
    comprueba(bajadas === 0 && nuevas === 0, '2. sin descarga aparte ni pestaña nueva: no se abre en el navegador', { bajadas, nuevas });
    // cancelar: nada
    await P.evaluate(() => { window.__guardar.cancela = true; });
    await pideYGuarda();
    g = await P.evaluate(() => window.__guardar);
    comprueba(g.pedidos.length === 2 && g.escritos.length === 1 && bajadas === 0 && nuevas === 0, '2. si la persona cancela el «Guardar como», no se guarda nada ni se abre nada', { pedidos: g.pedidos.length, escritos: g.escritos.length, bajadas, nuevas });
    await P.close();

    // ---- fuera del programa: la descarga de siempre (se comprueba con el propio módulo, que es el de todos los paneles) ----
    const W = await pagina(browser, false);
    await W.goto(URL0); await espera(3000);
    const [bajada] = await Promise.all([
      W.waitForEvent('download', { timeout: 10000 }).catch(() => null),
      W.evaluate(() => { let llamado = false; window.showSaveFilePicker = async () => { llamado = true; throw new DOMException('x', 'AbortError'); }; window.__llamado = () => llamado; return window.GuardianaDescargas.descarga('pdf', () => ({ archivo: 'GUARDIANA-prueba', titulo: 'Prueba', lineas: ['una'], totales: [], columnas: ['a'], filas: [['b']], notas: [], datos: { a: 1 } })); }),
    ]);
    const llamado = await W.evaluate(() => window.__llamado());
    comprueba(!!bajada && /^GUARDIANA-prueba-\d{4}-\d{2}-\d{2}\.pdf$/.test(bajada.suggestedFilename()) && !llamado, '3. fuera del programa, la descarga de siempre (sin «Guardar como»)', { nombre: bajada && bajada.suggestedFilename(), llamado });
  } catch (err) {
    console.log('ERROR ' + (err && err.stack || err)); fallos.push('excepción');
  } finally {
    await browser.close();
    console.log(fallos.length ? 'FALLOS: ' + fallos.length + ' → ' + fallos.join(' | ') : 'TODO OK');
    process.exit(fallos.length ? 1 : 0);
  }
})();
