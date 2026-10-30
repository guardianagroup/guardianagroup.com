// Reenvío automático (dueño, 29 Oct 2026, 23:47: «cuando se envía la imagen… sale como un símbolo de exclamación… todo sincronizado»).
// Dos teléfonos con la app y el Número GUARDIANA:
//   1. B tiene la app cerrada: A manda una foto → queda «pendiente» (reloj), nunca «!»; B abre la app → la foto llega sola.
//   2. A se queda sin conexión en mitad de un archivo de 30 MB → vuelve a «pendiente» y, al volver la conexión, llega entero.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const OUT = process.argv[2] || path.join(__dirname, 'reenvio');
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
async function pagina(ctx, nombre) { const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); }); await p.goto(URL0); await espera(2500); return p; }
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 && r.height > 0; }, s);
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
const estadoDe = (p, nombre) => p.evaluate((nombre) => { for (const c of GuardianaCom.convs.values()) for (const m of c.mensajes || []) if (m.tipo === 'archivo' && m.archivo && m.archivo.nombre === nombre) return m.estado; return null; }, nombre);
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const png = (bytes) => { const b = crypto.randomBytes(bytes); return b; };
(async () => {
  const browser = await chromium.launch();
  const cA = await contexto(browser), cB = await contexto(browser);
  const A = await pagina(cA, 'A'); let B = await pagina(cB, 'B');
  await A.click('#num-usar'); await B.click('#num-usar'); await espera(2500);
  const numA = await A.evaluate(() => window.gcomPruebaNumero.mio()), numB = await B.evaluate(() => window.gcomPruebaNumero.mio());
  await A.click('#llamar-num'); await espera(300); await marca(A, numB); await A.click('#marcar-llamar'); await espera(400);
  await A.fill('#num-nombre', 'B'); await A.click('#num-anadir'); await espera(2000); await A.click('#num-espera-ok'); await espera(300);
  await B.click('#llamar-num'); await espera(300); await marca(B, numA); await B.click('#marcar-llamar'); await espera(400);
  await B.fill('#num-nombre', 'A'); await B.click('#num-anadir'); await espera(7000);
  comprueba(await visible(A, '#conv') && await visible(B, '#conv'), 'se añaden los dos: el chat se abre');
  // 1. B cierra la app; A manda una foto
  await B.close(); await espera(2500);
  await A.setInputFiles('#archivo', { name: 'foto-1.jpg', mimeType: 'image/jpeg', buffer: png(40 * 1024) }); await espera(5000);
  const e1 = await estadoDe(A, 'foto-1.jpg');
  comprueba(e1 === 'pendiente' || e1 === 'enviado', '1. con B fuera, la foto no falla: «pendiente» o, con el buzón cifrado, ✓ (' + e1 + '), sin «!»');
  await A.screenshot({ path: path.join(OUT, '01-A-pendiente.png') });
  B = await pagina(cB, 'B2');
  const llego1 = await hasta(async () => ['entregado', 'leido'].includes(await estadoDe(A, 'foto-1.jpg')), 30000);
  comprueba(llego1, '1. B abre la app: la foto sale sola y llega (' + await estadoDe(A, 'foto-1.jpg') + ')');
  comprueba(['recibido', 'leido'].includes(await estadoDe(B, 'foto-1.jpg')), '1. B la tiene (' + await estadoDe(B, 'foto-1.jpg') + ')');
  // 2. A pierde la conexión en mitad de un archivo de 3 MB
  if (!(await visible(B, '#conv'))) { await B.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); if (c) document.querySelector('#contactos-filas .contacto button[data-id="' + c.id + '"]:not([data-acto])')?.click(); }); await espera(1500); }
  await A.setInputFiles('#archivo', { name: 'informe.pdf', mimeType: 'application/pdf', buffer: png(30 * 1024 * 1024) });
  { const h = Date.now() + 20000; while (Date.now() < h && (await A.evaluate(() => { for (const c of GuardianaCom.convs.values()) for (const m of c.mensajes || []) if (m.archivo && m.archivo.nombre === 'informe.pdf') return (m.archivo.progreso || 0); return 0; })) < 0.05) await espera(60); }
  await A.evaluate(() => GuardianaCom.rele.corta()); await espera(1500); // se corta la conexión con el relé (como al bloquear el teléfono)
  const e2 = await estadoDe(A, 'informe.pdf');
  const int2 = await A.evaluate(() => { for (const c of GuardianaCom.convs.values()) for (const m of c.mensajes || []) if (m.archivo && m.archivo.nombre === 'informe.pdf') return m.archivo.intentos || 0; return 0; });
  comprueba(e2 !== 'fallo' && int2 >= 1, '2. corte a mitad: no se da por perdido, se vuelve a enviar solo (' + e2 + ', intento ' + int2 + ')');
  await A.screenshot({ path: path.join(OUT, '02-A-sin-conexion.png') });
  const llego2 = await hasta(async () => ['entregado', 'leido'].includes(await estadoDe(A, 'informe.pdf')), 60000);
  comprueba(llego2, '2. vuelve la conexión: el archivo llega entero (' + await estadoDe(A, 'informe.pdf') + ' / B: ' + await estadoDe(B, 'informe.pdf') + ')');
  const info = (p) => p.evaluate(() => { for (const c of GuardianaCom.convs.values()) for (const m of c.mensajes || []) if (m.archivo && m.archivo.nombre === 'informe.pdf') { const a = c.archivos && c.archivos.get(m.id); return { estado: m.estado, prog: m.archivo.progreso, intentos: m.archivo.intentos, motivo: m.archivo.motivo, a: a ? { listo: a.listo, ack: a.ack, enviados: a.enviados, tengo: a.tengo, siguiente: a.siguiente } : null, cola: c.cola.length, enLinea: c.miembros.has(c.suId), ses: !!(c.sesion && c.sesion.confirmada) }; } return null; });
  console.log('A:', JSON.stringify(await info(A))); console.log('B:', JSON.stringify(await info(B)));
  await A.screenshot({ path: path.join(OUT, '03-A-final.png') }); await B.screenshot({ path: path.join(OUT, '03-B-final.png') });
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  await browser.close();
})();
