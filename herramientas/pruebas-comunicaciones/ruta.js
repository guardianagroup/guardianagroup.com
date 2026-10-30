// Prueba de la ruta (agencia, ronda 77; dueño, 30 Oct 2026, 10:30): la app comprueba si su red deja pasar una transferencia
// sostenida (64 KB) hacia el relé. Con una red normal no dice nada; con una red que corta a 16 KB (como Rusia hacia los grandes
// alojamientos extranjeros) avisa con claridad: los mensajes llegan, pero las fotos y las llamadas pueden fallar.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'ruta');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1&prueba-ruta=1';
const RELE = 'http://127.0.0.1:8794';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
const estrangula = (on) => fetch(RELE + '/estrangula?on=' + (on ? 1 : 0)).then((r) => r.text());
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES' });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror'); });
  try {
    await estrangula(false);
    await p.goto(URL0); await espera(5000);
    const a1 = await p.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent : ''; });
    comprueba(!/limitando/.test(a1), '1. red normal: no hay aviso de red limitada');
    comprueba(await p.evaluate(() => !GuardianaCom.rele.limitada), '1. red normal: la ruta está sana');
    await estrangula(true);
    await p.reload(); await espera(12000);
    const a2 = await p.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent : ''; });
    comprueba(/limitando/.test(a2), '2. red que corta a 16 KB: «' + a2.slice(0, 90) + '…»');
    comprueba(await p.evaluate(() => GuardianaCom.rele.limitada), '2. la ruta queda marcada como limitada');
    comprueba(await p.evaluate(() => GuardianaCom.rele.abierto), '2. el chat sigue conectado (los mensajes pasan)');
    await p.screenshot({ path: path.join(OUT, '02-aviso.png') });
  } finally { await estrangula(false); }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
})();
