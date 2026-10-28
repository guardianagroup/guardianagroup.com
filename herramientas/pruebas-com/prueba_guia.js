// La guía «Añade GUARDIANA a tu pantalla de inicio» (dueño, 28 Oct 2026, 17:02): cada teléfono y navegador ve sus pasos
const { chromium, devices } = require('playwright');
const DIR = process.env.SALIDA || '/tmp/pruebas-com/guia';
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const IOS = (os, extra) => `Mozilla/5.0 (iPhone; CPU iPhone OS ${os} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) ${extra}`;
const CASOS = [
  { n: 'ios26', ua: IOS('18_6', 'Version/26.0 Mobile/15E148 Safari/604.1'), pasos: 4, loc: 'es-CO', txt: 'Agregar a Inicio' },
  { n: 'ios', ua: IOS('17_5', 'Version/17.5 Mobile/15E148 Safari/604.1'), pasos: 4, loc: 'es-ES', txt: 'Añadir a pantalla de inicio' },
  { n: 'crios26', ua: IOS('26_0', 'CriOS/141.0.7390.41 Mobile/15E148 Safari/604.1'), pasos: 4, loc: 'es-MX', txt: 'Agregar a Inicio' },
  { n: 'app', ua: IOS('26_0', 'Mobile/15E148 Instagram 350.0.0.0'), pasos: 2, loc: 'es-CO', txt: 'Abrir en Safari' },
  { n: 'androidmenu', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', pasos: 3, loc: 'es-CO', txt: 'Instalar app', android: true },
  { n: 'android', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', pasos: 2, loc: 'es-CO', txt: 'En el aviso del teléfono', android: true, aviso: true },
  { n: 'pc', ua: null, pasos: 2, loc: 'es-ES', txt: 'Haz clic en «Instalar»', pc: true, aviso: true },
  { n: 'pcno', ua: null, pasos: 0, loc: 'es-ES', txt: 'Añadir al Dock', pc: true, boton: false },
  { n: 'se', ua: IOS('18_6', 'Version/26.0 Mobile/15E148 Safari/604.1'), pasos: 4, loc: 'es-CO', txt: 'Agregar a Inicio', plat: 'ios26', se: true },
  { n: 'en-ios26', ua: IOS('18_6', 'Version/26.0 Mobile/15E148 Safari/604.1'), pasos: 4, loc: 'en-GB', txt: 'Add to Home Screen', lang: 'en', plat: 'ios26' },
];
(async () => {
  const b = await chromium.launch(); let ok = 0, mal = 0; const err = [];
  const comprueba = (c, n, x) => { if (c) ok++; else { mal++; console.log('FALLO', n, x || ''); } };
  for (const k of CASOS) {
    const ctx = await b.newContext(k.pc ? { viewport: { width: 1280, height: 800 }, locale: k.loc } : Object.assign({}, devices[k.se ? 'iPhone SE' : 'iPhone 13'], { userAgent: k.ua, locale: k.loc }, k.android ? { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.6 } : {}));
    if (k.lang) await ctx.addInitScript((l) => { try { localStorage.setItem('guardiana-lang', l); localStorage.setItem('guardiana-lang-chosen', '1'); } catch (_) {} }, k.lang);
    const p = await ctx.newPage(); p.on('pageerror', (e) => err.push(k.n + ': ' + e.message));
    await p.goto(URL + '?instalar'); await p.waitForTimeout(1200);
    if (k.aviso) await p.evaluate(() => { const e = new Event('beforeinstallprompt'); e.prompt = () => { window.__pedido = true; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); dispatchEvent(e); });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => { const h = document.querySelector('#h-completa'); const lis = [...h.querySelectorAll('.guia-pasos > li')].filter((li) => getComputedStyle(li).display !== 'none'); return { abierta: h.classList.contains('gc-abierta'), plat: h.dataset.plat, pasos: lis.length, txt: h.innerText, instalar: getComputedStyle(document.querySelector('#guia-instalar')).display !== 'none', boton: !document.querySelector('#anadir-app').hidden }; });
    comprueba(r.abierta, k.n + ': abierta');
    comprueba(r.plat === (k.plat || k.n), k.n + ': plataforma', r.plat);
    comprueba(r.pasos === k.pasos, k.n + ': pasos', r.pasos);
    comprueba(r.txt.includes(k.txt), k.n + ': texto', k.txt);
    comprueba(r.instalar === !!k.aviso, k.n + ': botón Instalar', r.instalar);
    comprueba(r.boton === (k.boton !== false), k.n + ': «Añadir a la pantalla de inicio» en el inicio', r.boton);
    // «Entendido» o «Instalar», siempre a la vista (también en un iPhone pequeño)
    comprueba(await p.evaluate(() => { const r = document.querySelector('#completa-ok').getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= 0; }), k.n + ': botón de abajo a la vista');
    await p.screenshot({ path: `${DIR}/guia-${k.n}.png` });
    if (k.aviso) { await p.click('#guia-instalar'); await p.waitForTimeout(300); comprueba(await p.evaluate(() => window.__pedido === true && !document.querySelector('#h-completa').classList.contains('gc-abierta')), k.n + ': «Instalar» pide la ventana del sistema y cierra la guía'); }
    await ctx.close();
  }
  // el nombre como app: GUARDIANA (dueño, 17:06)
  const ctx = await b.newContext(); const p = await ctx.newPage(); await p.goto(URL); await p.waitForTimeout(500);
  const m = await p.evaluate(async () => { const j = await (await fetch('comunicaciones.webmanifest')).json(); return { name: j.name, short: j.short_name, apple: document.querySelector('meta[name="apple-mobile-web-app-title"]').content, title: document.title }; });
  comprueba(m.name === 'GUARDIANA' && m.short === 'GUARDIANA' && m.apple === 'GUARDIANA' && m.title === 'GUARDIANA', 'nombre de la app', JSON.stringify(m));
  comprueba(!err.length, 'sin errores de página', err.join(' | '));
  console.log(`prueba_guia: ${ok} OK, ${mal} fallos`); await b.close();
})();
