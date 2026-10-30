// El viaje del archivo en el teléfono (dueño, 28 Oct 2026, 20:19–20:21): no se abre solo ni al enviar ni al recibir; al llegar,
// el archivo lleva «Ver el viaje» y el comprobante dice en palabras de todos los días si llegó intacto.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const OUT = process.argv[2] || path.join(__dirname, 'viaje-movil');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt); if (!ok) fallos.push(txt); };
async function telefono(browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-CO' });
  // el Número GUARDIANA, apagado en esta prueba (invitaciones; 29 Oct 2026, 23:07: en el móvil sin la app, el inicio es «Añadir a la pantalla de inicio»)
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
const viajeAbierto = (p) => p.evaluate(() => !!(window.GuardianaViaje && GuardianaViaje.abierto && GuardianaViaje.abierto()));
(async () => {
  const archivo = path.join(OUT, 'contrato.bin'); fs.writeFileSync(archivo, crypto.randomBytes(2 * 1024 * 1024 + 4321));
  const browser = await chromium.launch();
  const A = await telefono(browser), B = await telefono(browser);
  await A.goto(URL0); await B.goto(URL0); await espera(1800);
  // 29 Oct 2026, 15:29 (dueño): el chat fuerte es mínimo y «Ver el viaje» es cosa de Ultra; esta prueba vuelve con Ultra
  if (await A.evaluate(() => { const b = document.querySelector('#tipo-blindado'); return !!b && b.getAttribute('aria-disabled') === 'true'; })) { console.log('El viaje del archivo es de Ultra, hoy apagado: prueba omitida (se retoma con Ultra).'); await browser.close(); process.exit(0); }
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(900);
  const url = String((await A.evaluate(() => window.__compartidos[0])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await B.goto(url); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si'); await espera(5000);
  comprueba(await A.evaluate(() => !document.querySelector('#conv').hidden), 'los dos en el chat');
  // enviar un archivo de 2 MB (el viaje antes se abría solo a partir de 1 MB)
  await A.setInputFiles('#archivo', archivo); await espera(600);
  // (29 Oct 2026, 15:29, dueño: «cuando se envía una foto, se envía directa»: ya no hay hoja de «¿Enviar archivo?» en el chat fuerte)
  if (await A.$('#envio-si:visible')) { await A.click('#envio-si'); }
  await espera(700);
  comprueba(!(await viajeAbierto(A)), 'al enviar, el viaje no se abre solo (quien envía)');
  let nada = true; for (let i = 0; i < 20; i++) { if (await viajeAbierto(B)) { nada = false; break; } await espera(250); }
  comprueba(nada, 'al recibir, el viaje no se abre solo (quien recibe)');
  await espera(6000);
  await A.evaluate(() => { const l = document.querySelector('#mensajes'); l.scrollTop = l.scrollHeight; });
  await A.screenshot({ path: path.join(OUT, '1-enviado.png') });
  await B.screenshot({ path: path.join(OUT, '2-recibido.png') });
  const verA = await A.$('#mensajes .vj-ver'), verB = await B.$('#mensajes .vj-ver');
  comprueba(!!verA && !!verB, 'al llegar, «Ver el viaje» como opción en los dos lados');
  const tarjeta = await A.evaluate(() => { const k = document.querySelector('#mensajes .custodia .cu-k'); const s = document.querySelector('#mensajes .custodia .cu-s'); return k ? k.textContent + ' | ' + (s ? s.textContent : '') : ''; });
  comprueba(/Llegó a su destino intacto/.test(tarjeta), 'la tarjeta del comprobante, en claro: ' + tarjeta);
  if (verA) { await verA.click(); await espera(800); comprueba(await viajeAbierto(A), '«Ver el viaje» lo abre'); await A.screenshot({ path: path.join(OUT, '3-viaje.png') }); await A.evaluate(() => GuardianaViaje.cierra()); await espera(300); }
  const verComp = await A.$('#mensajes .custodia .boton');
  if (verComp) { await verComp.click(); await espera(800); await A.screenshot({ path: path.join(OUT, '4-comprobante.png') });
    const veredicto = await A.evaluate(() => { const b = document.querySelector('#h-custodia .cu-estado b'); const h = document.querySelector('#h-custodia h2'); return (h ? h.textContent : '') + ' | ' + (b ? b.textContent : ''); });
    comprueba(/Comprobante de entrega/.test(veredicto) && /El archivo llegó a su destino intacto/.test(veredicto), 'el papel del comprobante, en claro: ' + veredicto); }
  await browser.close();
  try { fs.unlinkSync(archivo); } catch (_) {}
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
