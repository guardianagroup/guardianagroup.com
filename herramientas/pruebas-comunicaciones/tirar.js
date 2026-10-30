// Pull-to-refresh on the phone: a short pull goes back; a long pull reloads and says «Actualizado».
const { chromium } = require('playwright');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-ES', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1' });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'standalone', { get: () => true }); sessionStorage.setItem('gcom-sin-numero', '1'); });
  const p = await ctx.newPage(); let fallos = 0; p.on('pageerror', (e) => { console.log('pageerror', String(e)); fallos++; });
  await p.goto('http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0'); await espera(1500);
  const cdp = await ctx.newCDPSession(p);
  const tira = async (desde, hasta, pasos, foto) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 196, y: desde }] });
    for (let i = 1; i <= pasos; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 196, y: desde + (hasta - desde) * i / pasos }] }); await espera(16); }
    if (foto) await p.screenshot({ path: foto });
    const estado = await p.evaluate(() => ({ ver: document.querySelector('.tirar').classList.contains('ver'), listo: document.querySelector('.tirar').classList.contains('listo'), mueve: document.querySelector('#inicio').style.transform }));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    return estado;
  };
  const corto = await tira(250, 300, 6);
  await espera(500);
  const tras = await p.evaluate(() => ({ ver: document.querySelector('.tirar').classList.contains('ver'), mueve: document.querySelector('#inicio').style.transform }));
  console.log((corto.ver && !corto.listo && !tras.ver && !tras.mueve ? 'OK   ' : 'FALLO') + ' tirón corto: baja un poco y vuelve', JSON.stringify(corto), JSON.stringify(tras));
  const marca = await p.evaluate(() => (window.__antes = 1));
  const largo = await tira(220, 420, 12, 'tirar-1.png');
  console.log((largo.listo && /translateY/.test(largo.mueve) ? 'OK   ' : 'FALLO') + ' tirón largo: llega al punto', JSON.stringify(largo));
  await espera(300); await p.screenshot({ path: 'tirar-2.png' });
  await p.waitForLoadState('load'); await espera(1200);
  const recargada = await p.evaluate(() => window.__antes === undefined);
  const hecho = await p.evaluate(() => { const t = document.querySelector('.tirar'); return { hecho: t.classList.contains('hecho') && t.classList.contains('ver'), texto: t.textContent.trim(), ancho: Math.round(t.getBoundingClientRect().width), ok: getComputedStyle(t.querySelector('.tirar-ok')).display }; });
  await p.screenshot({ path: 'tirar-3.png' });
  console.log((recargada && hecho.hecho && !hecho.texto && hecho.ancho <= 42 && hecho.ok === 'block' ? 'OK   ' : 'FALLO') + ' se vuelve a cargar y sale solo el ✓, sin la palabra (' + recargada + ', ' + JSON.stringify(hecho) + ')');
  await espera(1800);
  console.log((await p.evaluate(() => !document.querySelector('.tirar').classList.contains('ver')) ? 'OK   ' : 'FALLO') + ' «Actualizado» se va solo');
  console.log(fallos ? 'pageerrors: ' + fallos : 'sin errores');
  await b.close();
})();
