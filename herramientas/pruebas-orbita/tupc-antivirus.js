// «Tu antivirus» dentro de «Ver mi PC en directo» (dueño, 17 nov 2026, 21:56: «también quiero que aparezca el antivirus…
// exactamente con quién habla el antivirus»; 21:57: «vigilar con algún botón… al antivirus instalado, con el que convivimos»).
//   1. Con el programa (1.0.62) diciendo qué programas son antivirus, el panel lleva «Tu antivirus» con su nombre y
//      «Vigilar»; las empresas con las que habla llevan la marca «Antivirus».
//   2. Al pulsarlo: «Con quién habla tu antivirus», solo sus empresas y sus cifras; el botón pasa a «Ver todo el PC».
//   3. Otra vez: vuelve todo el PC.
//   4. Si en ese rato el antivirus no se conecta, lo dice («Tu antivirus no se ha conectado en este rato.»).
//   5. Un programa anterior (sin «av»): no hay bloque del antivirus.
// El programa se imita: la página pide con «guardiana-pc-pide» y aquí se contesta con «guardiana-pc».
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'tupc-antivirus');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/?nucleo=0';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (ok || extra === undefined ? '' : '  ' + JSON.stringify(extra))); if (!ok) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { try { if (await fn()) return true; } catch (_) {} await espera(200); } return false; };

const AV = 'Microsoft Defender';
const TOMA = {
  v: 1, ahora: 0, programas: 4, av: [{ id: AV }],
  destinos: [
    { e: 'Microsoft', d: 'wdcp.microsoft.com', p: 'US', c: 'Boydton', la: 36.67, lo: -78.39, x: 0, n: 14, g: AV },
    { e: 'Microsoft', d: 'go.microsoft.com', p: 'IE', c: 'Dublín', la: 53.35, lo: -6.26, x: 0, n: 3, g: AV },
    { e: 'Akamai', d: 'definitionupdates.microsoft.com', p: 'NL', c: 'Ámsterdam', la: 52.37, lo: 4.9, x: 0, n: 2, g: AV },
    { e: 'Google', d: 'www.google.com', p: 'US', c: 'Mountain View', la: 37.39, lo: -122.08, x: 0, n: 22, g: 'Chrome' },
    { e: 'Meta', d: 'graph.facebook.com', p: 'IE', c: 'Clonee', la: 53.41, lo: -6.44, x: 1, n: 9, g: 'Chrome' },
    { e: 'Spotify', d: 'spclient.wg.spotify.com', p: 'SE', c: 'Estocolmo', la: 59.33, lo: 18.07, x: 0, n: 5, g: 'Spotify.exe' },
  ],
};

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', timezoneId: 'America/Bogota' });
    await ctx.addInitScript((toma) => {
      const marca = () => { if (!document.documentElement) return false; document.documentElement.dataset.enPrograma = '1'; return true; };
      if (!marca()) new MutationObserver((_, o) => { if (marca()) o.disconnect(); }).observe(document, { childList: true });
      window.__toma = toma;
      document.addEventListener('guardiana-pc-pide', () => setTimeout(() => (window.__tomas = (window.__tomas || 0) + 1) && document.dispatchEvent(new CustomEvent('guardiana-pc', { detail: JSON.stringify(window.__toma) })), 40));
    }, TOMA);
    const P = await ctx.newPage(); P.on('pageerror', (e) => { console.log('pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror'); });
    await P.goto(URL0); await espera(6000);
    comprueba(await hasta(() => P.evaluate(() => !!document.querySelector('#tupc-btn')), 10000), '0. en el programa, Órbita tiene «Ver mi PC en directo»');
    await P.click('#tupc-btn');
    const estado = () => P.evaluate(() => {
      const h = document.querySelector('#tupc'), b = h && h.querySelector('.av-pc'); if (!b) return null;
      window.__n = window.__n || 0;
      const vis = !h.querySelector('.empresas').hidden;
      const filas = (vis ? [...h.querySelectorAll('.empresas li')] : []).map((li) => ({ n: li.querySelector('b').textContent, av: !li.querySelector('.tp-av').hidden, marca: li.querySelector('.tp-av').textContent }));
      const r = b.getBoundingClientRect(), x = b.querySelector('.av-ver');
      return { ve: !b.hidden && r.height > 0, nombre: b.querySelector('.av-n').textContent, k: b.querySelector('.av-k').textContent, boton: x.textContent, pulsado: x.getAttribute('aria-pressed'),
        titulo: h.querySelector('.t').textContent, filas, tomas: window.__tomas || 0, conexiones: h.querySelector('.cifras .c1 b').dataset.v, nada: !b.querySelector('.av-nada').hidden, cifras: !h.querySelector('.cifras').hidden };
    });
    comprueba(await hasta(async () => ((await estado()) || {}).filas && (await estado()).filas.length === 5, 8000), '1. llegan las conexiones del PC (5 empresas)', await estado());
    await espera(1800);
    let e = await estado();
    comprueba(e.ve && e.k === 'Tu antivirus' && e.nombre === AV && e.boton === 'Vigilar' && e.pulsado === 'false' && e.titulo === 'Con quién habla tu PC',
      '1. el panel lleva «Tu antivirus» · Microsoft Defender, con «Vigilar»', e);
    const marcadas = e.filas.filter((f) => f.av).map((f) => f.n).sort();
    comprueba(JSON.stringify(marcadas) === JSON.stringify(['Akamai', 'Microsoft']) && e.filas.filter((f) => f.av).every((f) => f.marca === 'Antivirus'),
      '1. las empresas con las que habla el antivirus llevan «Antivirus» (Microsoft, Akamai) y las demás no', e.filas);
    await P.screenshot({ path: path.join(OUT, '01-todo-el-pc.png') });

    await P.click('#tupc .av-ver'); await espera(1600);
    e = await estado();
    const nombres = e.filas.map((f) => f.n).sort();
    comprueba(e.titulo === 'Con quién habla tu antivirus' && e.boton === 'Ver todo el PC' && e.pulsado === 'true' && JSON.stringify(nombres) === JSON.stringify(['Akamai', 'Microsoft']) && e.conexiones === '19' && e.filas.every((f) => !f.av),
      '2. «Vigilar»: solo sus empresas (Microsoft, Akamai), 19 conexiones, «Ver todo el PC»', e);
    const lugares = await P.evaluate(() => document.querySelectorAll('#tupc .empresas li').length);
    comprueba(lugares === 2, '2. la lista no enseña nada más que lo del antivirus', lugares);
    await P.screenshot({ path: path.join(OUT, '02-solo-el-antivirus.png') });

    await P.click('#tupc .av-ver'); await espera(1400);
    e = await estado();
    comprueba(e.titulo === 'Con quién habla tu PC' && e.boton === 'Vigilar' && e.pulsado === 'false' && e.filas.length === 5 && e.conexiones === '55',
      '3. otra vez: vuelve todo el PC (5 empresas, 55 conexiones)', e);

    // 4. a take in which the antivirus says nothing
    await P.click('#tupc .av-ver');
    await P.evaluate((av) => { window.__toma = { ...window.__toma, destinos: window.__toma.destinos.filter((d) => d.g !== av) }; }, AV);
    comprueba(await hasta(async () => (await estado()).nada, 9000), '4. sin conexiones del antivirus en ese rato, lo dice', await estado());
    e = await estado();
    comprueba(!e.cifras && e.filas.length === 0, '4. y no enseña cifras ni empresas de otros programas', e);
    await P.screenshot({ path: path.join(OUT, '03-antivirus-sin-conexiones.png') });

    // 5. a program before the 1.0.62: no «av»
    await P.evaluate(() => { const t = { ...window.__toma }; delete t.av; window.__toma = t; });
    comprueba(await hasta(async () => { const x = await estado(); return x && !x.ve && x.titulo === 'Con quién habla tu PC' && x.filas.length === 3; }, 9000),
      '5. con un programa anterior (sin «av»), no hay bloque del antivirus y se ve todo el PC', await estado());

    // 6. in English the block says it in English
    await P.evaluate((av) => { window.__toma = { ...window.__toma, av: [{ id: av }] }; }, AV);
    comprueba(await hasta(async () => (await estado()).ve, 9000), '6. el programa vuelve a decir cuál es el antivirus: vuelve el bloque');
    await P.evaluate(() => window.GuardianaIdioma && window.GuardianaIdioma.pon('en'));
    await espera(1500);
    const en = await P.evaluate(() => { const b = document.querySelector('#tupc .av-pc'); return b ? { k: b.querySelector('.av-k').textContent, boton: b.querySelector('.av-ver').textContent } : null; });
    comprueba(en && en.k === 'Your antivirus' && en.boton === 'Watch', '6. en inglés: «Your antivirus» y «Watch»', en);
    await P.screenshot({ path: path.join(OUT, '04-ingles.png') });
  } finally { await browser.close(); }
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO OK');
  process.exit(fallos.length ? 1 : 0);
})();
