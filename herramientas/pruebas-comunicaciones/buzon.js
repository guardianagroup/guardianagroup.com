// Buzón cifrado (dueño, 30 Oct 2026, 00:05: elige el «buzón cifrado», como WhatsApp). Dos teléfonos con el Número GUARDIANA:
//   1. Al abrirse el chat, cada uno tiene la llave de buzón del otro.
//   2. B cierra la app: A escribe y manda una nota de voz → ✓ al momento (en el buzón), sin reloj.
//   3. A también cierra la app. B abre la suya → le llegan el texto y la nota (los dos sin conexión a la vez).
//   4. B lo lee con A cerrada → A abre la app → ✓✓ leído.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const OUT = process.argv[2] || path.join(__dirname, 'buzon');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
async function contexto(browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES' });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  return ctx;
}
async function pagina(ctx, nombre) { const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); }); p.on('console', (m) => { if (/buzón/.test(m.text())) console.log('[' + nombre + '] ' + m.text().slice(0, 200)); }); await p.goto(URL0); await espera(2500); return p; }
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 && r.height > 0; }, s);
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const conv = (p) => p.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); return c ? { buzonSuya: !!(c.buzon && c.buzon.suya), mias: c.buzon ? c.buzon.mias.length : 0, msgs: (c.mensajes || []).map((m) => ({ tipo: m.tipo, dir: m.dir, estado: m.estado, texto: m.texto, voz: m.archivo && m.archivo.voz, porBuzon: m.porBuzon })) } : null; });
(async () => {
  const browser = await chromium.launch();
  const cA = await contexto(browser), cB = await contexto(browser);
  let A = await pagina(cA, 'A'); let B = await pagina(cB, 'B');
  await A.click('#num-usar'); await B.click('#num-usar'); await espera(2500);
  const numA = await A.evaluate(() => window.gcomPruebaNumero.mio()), numB = await B.evaluate(() => window.gcomPruebaNumero.mio());
  await A.click('#llamar-num'); await espera(300); await marca(A, numB); await A.click('#marcar-llamar'); await espera(400);
  await A.fill('#num-nombre', 'B'); await A.click('#num-anadir'); await espera(2000); await A.click('#num-espera-ok'); await espera(300);
  await B.click('#llamar-num'); await espera(300); await marca(B, numA); await B.click('#marcar-llamar'); await espera(400);
  await B.fill('#num-nombre', 'A'); await B.click('#num-anadir'); await espera(7000);
  comprueba(await visible(A, '#conv') && await visible(B, '#conv'), 'se añaden los dos: el chat se abre');
  const llaves = await hasta(async () => { const a = await conv(A), b = await conv(B); return a && b && a.buzonSuya && b.buzonSuya; }, 15000);
  comprueba(llaves, '1. cada uno tiene la llave de buzón del otro');
  // 2. B cierra la app; A escribe y manda una nota de voz
  await B.close(); await espera(2500);
  await A.fill('#texto', 'Hola, te lo dejo en el buzón'); await A.click('#enviar');
  await A.setInputFiles('#archivo', { name: 'Nota de voz 00.20 (0:02).webm', mimeType: 'audio/webm', buffer: crypto.randomBytes(30 * 1024) });
  await espera(500); await A.setInputFiles('#archivo', { name: 'foto-grande.jpg', mimeType: 'image/jpeg', buffer: crypto.randomBytes(2500 * 1024) });
  const tick = await hasta(async () => { const a = await conv(A); const ms = a.msgs.filter((m) => m.dir === 'mia'); return ms.length >= 3 && ms.every((m) => m.estado === 'enviado' && m.porBuzon); }, 20000);
  comprueba(tick, '2. con B cerrada: texto, nota y foto de 2,5 MB con ✓ al momento, en el buzón (' + JSON.stringify((await conv(A)).msgs.filter((m) => m.dir === 'mia').map((m) => m.estado + (m.porBuzon ? '·buzón' : ''))) + ')');
  await A.screenshot({ path: path.join(OUT, '01-A-un-tick.png') });
  // 3. A también cierra; B abre
  await A.close(); await espera(1500);
  B = await pagina(cB, 'B2');
  const llego = await hasta(async () => { const b = await conv(B); return b && b.msgs.some((m) => m.dir === 'suya' && m.texto === 'Hola, te lo dejo en el buzón') && b.msgs.filter((m) => m.dir === 'suya' && m.tipo === 'archivo').length === 2; }, 25000);
  comprueba(llego, '3. A y B nunca a la vez: a B le llegan el texto, la nota y la foto');
  // 4. B lo lee (abre el chat) con A cerrada
  if (!(await visible(B, '#conv'))) { await B.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); if (c) GuardianaCom.abreConv(c.id); }); await espera(2000); }
  await B.screenshot({ path: path.join(OUT, '02-B-recibido.png') });
  await espera(3000);
  A = await pagina(cA, 'A2');
  const leido = await hasta(async () => { const a = await conv(A); return a && a.msgs.filter((m) => m.dir === 'mia').every((m) => m.estado === 'leido'); }, 20000);
  comprueba(leido, '4. A abre la app: ✓✓ leído (' + JSON.stringify((await conv(A)).msgs.filter((m) => m.dir === 'mia').map((m) => m.estado)) + ')');
  if (!(await visible(A, '#conv'))) { await A.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); if (c) GuardianaCom.abreConv(c.id); }); await espera(1500); }
  await A.screenshot({ path: path.join(OUT, '03-A-leido.png') });
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  await browser.close();
})();
