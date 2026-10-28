// Lo del dueño a las 11:59: quien RECIBE el archivo descarga su comprobante (.json) y el archivo que guardó, y los verifica.
// Sesión normal; archivo de 700 KB (cuatro trozos, el último incompleto) y una imagen pequeña.
const { chromium } = require('playwright');
const fs = require('fs'); const crypto = require('crypto');
const S = '/tmp/pruebas-com/prueba-com/';
const BASE = 'http://127.0.0.1:8802';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
(async () => {
  const b = await chromium.launch();
  const mk = async (n, url) => { const c = await b.newContext({ viewport: { width: 1280, height: 860 }, locale: 'es-ES', acceptDownloads: true }); await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} }); const p = await c.newPage(); p.errores = []; p.on('pageerror', (e) => p.errores.push(n + ': ' + e.message)); if (url) { await p.goto(url); await p.waitForTimeout(1500); } return p; };
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  fs.writeFileSync(S + 'informe.bin', crypto.randomBytes(700 * 1024 + 37));
  const A = await mk('A', BASE + '/orbita/comunicaciones/'), B = await mk('B', BASE + '/orbita/comunicaciones/');
  await A.click('#nueva'); await A.waitForTimeout(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  await B.click('#unir'); await B.fill('#unir-codigo', codigo); await B.waitForTimeout(200); if (await vis(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(3000);
  await A.setInputFiles('#archivo', S + 'informe.bin'); await A.waitForTimeout(500); await A.click('#envio-si');
  let firmado = false; for (let i = 0; i < 60 && !firmado; i++) { await espera(500); firmado = await B.evaluate(() => [...document.querySelectorAll('#mensajes button')].some((x) => /Ver comprobante/.test(x.textContent))); }
  ok('a quien recibe le aparece el comprobante', firmado);
  for (const p of [A, B]) if (await p.evaluate(() => !!document.querySelector('#h-viaje.gc-abierta'))) { await p.keyboard.press('Escape'); await espera(300); }
  // B guarda el archivo recibido
  const [dlA] = await Promise.all([B.waitForEvent('download'), B.evaluate(() => [...document.querySelectorAll('#mensajes button')].find((x) => x.textContent.trim() === 'Guardar').click())]);
  const guardado = S + 'recibido-' + dlA.suggestedFilename(); await dlA.saveAs(guardado);
  const h1 = crypto.createHash('sha256').update(fs.readFileSync(S + 'informe.bin')).digest('hex'), h2 = crypto.createHash('sha256').update(fs.readFileSync(guardado)).digest('hex');
  ok('el archivo que guarda quien recibe es idéntico al enviado', h1 === h2, dlA.suggestedFilename() + ' · ' + fs.statSync(guardado).size + ' bytes');
  // B descarga su comprobante
  await B.evaluate(() => [...document.querySelectorAll('#mensajes button')].reverse().find((x) => /Ver comprobante/.test(x.textContent)).click()); await espera(1500);
  const [dlJ] = await Promise.all([B.waitForEvent('download'), B.click('#cu-json')]);
  const ruta = S + 'comprobante-receptor.json'; await dlJ.saveAs(ruta);
  const V = await mk('V', BASE + '/orbita/comunicaciones/verificar/');
  await V.setInputFiles('#f-comp', ruta); await espera(1500);
  ok('el comprobante de quien recibe: «Comprobante válido»', (await V.textContent('#ver-titulo')) === 'Comprobante válido', await V.textContent('#ver-archivo'));
  await V.setInputFiles('#f-arch', guardado); await espera(2000);
  ok('y el archivo guardado coincide (sello verde)', /exactamente el archivo que se envió/.test(await V.textContent('#arch-res')), (await V.textContent('#arch-res')).slice(0, 60));
  await V.evaluate(() => scrollTo(0, 0)); await espera(300); await V.screenshot({ path: S + 'verif-receptor.png', fullPage: false }); await V.setViewportSize({ width: 390, height: 844 }); await espera(400); await V.evaluate(() => scrollTo(0, document.querySelector('#resultado').getBoundingClientRect().top + scrollY - 70)); await espera(300); await V.screenshot({ path: S + 'verif-receptor-390.png', fullPage: false });
  for (const p of [A, B, V]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e.message.slice(0, 400)); process.exit(1); });
