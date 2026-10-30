'use strict';
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, 'en');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'en-US' });
  // el Número GUARDIANA, apagado en esta prueba (invitaciones; 29 Oct 2026, 23:07: en el móvil sin la app, el inicio es «Añadir a la pantalla de inicio»)
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); localStorage.setItem('guardiana-lang', 'en'); localStorage.setItem('guardiana-lang-chosen', '1'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('pageerror', String(e).slice(0, 200)));
  await p.goto('http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0'); await new Promise((r) => setTimeout(r, 1800));
  console.log(await p.evaluate(() => ({ h1: document.querySelector('#inicio>h1').innerText, boton: document.querySelector('#nueva-blindada b').innerText, como: document.querySelector('#como-btn').innerText, cifrado: document.querySelector('.gc-llamada-cifrado').innerText })));
  await p.click('.idiomas .idioma-actual'); await new Promise((r) => setTimeout(r, 300));
  await p.screenshot({ path: path.join(OUT, 'inicio-en.png') });
  await browser.close();
})();
