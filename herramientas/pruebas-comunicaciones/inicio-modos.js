// El inicio en el PC (dueño, 15 nov 2026): primero el tipo de conversación, Blindado o Ultra; después «Tengo un código» o «Crear un
// código», que dicen el código de ese tipo.
//   1. Al abrir: Blindado elegido; los botones hablan de 9 cifras; sin la nota de Ultra.
//   2. Ultra: elegido (radio), los botones hablan de 16 caracteres y sale la nota de Ultra; con las flechas se vuelve a Blindado.
//   3. «Crear un código» con Blindado: el código de 9 cifras. Con Ultra: el código Ultra de 16 caracteres.
//   4. En inglés, los textos nuevos traducidos. En el teléfono, el inicio de siempre (sin el tipo).
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'inicio-modos');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (cond || extra === undefined ? '' : '  ' + JSON.stringify(extra))); if (!cond) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { try { if (await fn()) return true; } catch (_) {} await espera(250); } return false; };
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && !e.closest('[hidden]') && r.width > 0 && r.height > 0; }, s);
const estado = (p) => p.evaluate(() => ({ b: document.querySelector('#modo-blindado').getAttribute('aria-checked'), u: document.querySelector('#modo-ultra').getAttribute('aria-checked'), nueva: document.querySelector('#nueva-t').textContent, unir: document.querySelector('#unir-t').textContent, nota: !document.querySelector('#modo-nota').hidden, crear: document.querySelector('#nueva b').textContent }));
async function equipo(browser, ua, locale, vp) {
  const ctx = await browser.newContext({ viewport: vp || { width: 1280, height: 800 }, userAgent: ua, locale });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror'); });
  return p;
}
(async () => {
  const browser = await chromium.launch();
  try {
    let P = await equipo(browser, PC, 'es-CO');
    await P.goto(URL0); await espera(2000);
    let e = await estado(P);
    comprueba(await visible(P, '#modos') && e.b === 'true' && e.u === 'false' && /9 cifras/.test(e.nueva) && /9 cifras/.test(e.unir) && !e.nota && e.crear === 'Crear un código', '1. al abrir: Blindado elegido, los botones hablan de 9 cifras, sin nota de Ultra', e);
    comprueba(!(await visible(P, '#nueva-blindada')), '1. el botón ancho de Ultra ya no está: Ultra es uno de los dos tipos');
    const orden = await P.evaluate(() => { const r = (s) => document.querySelector(s).getBoundingClientRect(); return { unirIzq: r('#unir').left < r('#nueva').left, mismaFila: Math.abs(r('#unir').top - r('#nueva').top) < 2, tiposArriba: r('#modo-blindado').bottom <= r('#unir').top }; });
    comprueba(orden.unirIzq && orden.mismaFila && orden.tiposArriba, '1. arriba el tipo; debajo «Tengo un código» y, a su derecha, «Crear un código»', orden);
    await P.evaluate(() => document.querySelector('#modos').scrollIntoView({ block: 'center' }));
    await P.screenshot({ path: path.join(OUT, '01-blindado.png') });

    await P.click('#modo-ultra'); await espera(200);
    e = await estado(P);
    comprueba(e.u === 'true' && e.b === 'false' && /16 caracteres/.test(e.nueva) && /16 caracteres/.test(e.unir) && e.nota, '2. Ultra: elegido, los botones hablan de 16 caracteres y sale la nota de Ultra', e);
    await P.screenshot({ path: path.join(OUT, '02-ultra.png') });
    await P.focus('#modo-ultra'); await P.keyboard.press('ArrowLeft'); await espera(150);
    e = await estado(P);
    comprueba(e.b === 'true' && (await P.evaluate(() => document.activeElement && document.activeElement.id)) === 'modo-blindado', '2. con las flechas se vuelve a Blindado (y el foco va con él)', e);

    await P.click('#nueva');
    const nueve = await hasta(async () => /^\d{3}[\s-]?\d{3}[\s-]?\d{3}$/.test(((await P.textContent('#codigo')) || '').trim()), 10000);
    comprueba(nueve, '3. «Crear un código» con Blindado: sale el código de 9 cifras', (await P.textContent('#codigo')));
    await P.close();

    P = await equipo(browser, PC, 'es-CO');
    await P.goto(URL0); await espera(2000);
    await P.click('#modo-ultra'); await P.click('#nueva');
    const dieciseis = await hasta(async () => /^[0-9A-Z]{4}([\s-]?[0-9A-Z]{4}){3}$/.test(((await P.textContent('#ucod-codigo')) || '').trim()) && (await visible(P, '#ucod-caja')), 12000);
    comprueba(dieciseis, '3. «Crear un código» con Ultra: sale el código Ultra de 16 caracteres', (await P.textContent('#ucod-codigo').catch(() => '')));
    await P.screenshot({ path: path.join(OUT, '03-ultra-codigo.png') });
    await P.close();

    P = await equipo(browser, PC, 'en-US');
    await P.goto(URL0); await espera(1500);
    await P.goto(URL0 + '?lang=en'); await espera(2500);
    const en = await P.evaluate(() => ({ grupo: document.querySelector('#modos').getAttribute('aria-label'), b: document.querySelector('#modo-blindado b').textContent, bs: document.querySelector('#modo-blindado small').textContent, us: document.querySelector('#modo-ultra small').textContent, crear: document.querySelector('#nueva b').textContent, unir: document.querySelector('#unir-t').textContent, lang: document.documentElement.lang }));
    comprueba(en.lang.startsWith('en') && en.b === 'Shielded' && en.bs === 'Free · 9-digit code' && en.us === 'With the Plus subscription · 16-character code' && en.crear === 'Create a code' && /^(Enter|Type) the 9 digits you were given$/.test(en.unir) && en.grupo === 'Conversation type', '4. en inglés, los textos nuevos traducidos', en);
    await P.click('#modo-ultra'); await espera(200);
    const enU = await P.evaluate(() => ({ nueva: document.querySelector('#nueva-t').textContent, unir: document.querySelector('#unir-t').textContent }));
    comprueba(enU.nueva === 'You get a 16-character Ultra code to give to the other person' && enU.unir === 'Enter the 16 characters you were given', '4. y al elegir Ultra, también', enU);
    await P.close();

    const IPH = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
    P = await equipo(browser, IPH, 'es-CO', { width: 390, height: 844 });
    await P.goto(URL0); await espera(2000);
    comprueba(!(await visible(P, '#modos')) && !(await visible(P, '#modo-nota')), '4. en el teléfono no sale el tipo: su inicio de siempre');
  } catch (err) {
    console.log('ERROR ' + (err && err.stack || err)); fallos.push('excepción');
  } finally {
    await browser.close();
    console.log(fallos.length ? 'FALLOS: ' + fallos.length + ' → ' + fallos.join(' | ') : 'TODO OK');
    process.exit(fallos.length ? 1 : 0);
  }
})();
