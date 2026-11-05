// Comprueba qué ve el rastreador móvil de Google (mobile-first) y el de escritorio en cada página: ¿redirige a /solo-pc/?
'use strict';
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8090';
const UAS = {
  'Googlebot Smartphone': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.85 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Googlebot Desktop': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/131.0.6778.85 Safari/537.36',
  'Bingbot móvil': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
};
const PAGINAS = (process.argv[2] || '/,/zero.html,/casos.html,/como-funciona.html,/radiografias/,/en/cases.html,/pt/casos.html,/privacidad.html,/orbita/comunicaciones/').split(',');
(async () => {
  const browser = await chromium.launch();
  for (const [nombre, ua] of Object.entries(UAS)) {
    const movil = /Mobile/.test(ua);
    const ctx = await browser.newContext({ userAgent: ua, viewport: movil ? { width: 412, height: 732 } : { width: 1350, height: 940 }, isMobile: movil, hasTouch: movil, deviceScaleFactor: movil ? 2.625 : 1 });
    for (const p of PAGINAS) {
      const page = await ctx.newPage();
      let final = '', h1 = '', palabras = 0;
      try {
        await page.goto(BASE + p, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(1500);
        final = page.url();
        h1 = await page.evaluate(() => (document.querySelector('h1') || {}).textContent || '').catch(() => '');
        palabras = await page.evaluate(() => (document.body.innerText || '').split(/\s+/).filter(Boolean).length).catch(() => 0);
      } catch (e) { final = 'ERROR ' + e.message.slice(0, 80); }
      console.log(`${nombre.padEnd(20)} ${p.padEnd(28)} → ${final.replace(BASE, '').padEnd(24)} h1="${h1.trim().slice(0, 40)}" palabras=${palabras}`);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
})();
