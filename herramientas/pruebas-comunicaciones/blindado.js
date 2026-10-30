// Blindado (dueño, 29 Oct 2026, 10:08–10:16): lo que llega va velado (Mostrar / Descartar), fotos con tiempo que se borran al
// cerrarse, «Borrar en los dos», archivos como paquete «todo o nada», el número de seguridad de la llamada y la alarma de ataque.
// Usage: node blindado.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(150); } return false; };

async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') console.log('[' + nombre + '] ' + m.type() + ': ' + m.text().slice(0, 300)); });
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 400)); fallos.push('pageerror ' + nombre); });
  return p;
}
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };
// en el blindado el chat va borroso (modo discreto): la captura se hace con el dedo puesto, como lo vería la persona
const fotoDestapada = async (p, n) => { await p.mouse.move(196, 420); await p.mouse.down(); await espera(250); await foto(p, n); await p.mouse.up(); await espera(200); };
const caja = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && !e.closest('[hidden]') }; }, sel);
// una foto PNG real (4 × 4, roja) y un archivo de 4 piezas (700 KB) para el paquete «todo o nada»
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEklEQVR4nGP4z8DwHwyBNJAGACC4A/3pu9ONAAAAAElFTkSuQmCC', 'base64');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gcom-'));
const fotoPath = path.join(tmp, 'foto.png'); fs.writeFileSync(fotoPath, PNG);
const grandePath = path.join(tmp, 'informe.bin'); const grande = Buffer.alloc(700 * 1024); for (let i = 0; i < grande.length; i++) grande[i] = (i * 7 + (i >> 8)) & 255; fs.writeFileSync(grandePath, grande);
const crypto = require('crypto'); const shaGrande = crypto.createHash('sha256').update(grande).digest('hex');

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  await A.goto(URL0); await espera(1500);
  // 29 Oct 2026, 12:55–12:59 (dueño): el blindado va «próximamente» y sus extras están apagados; esta prueba queda para cuando vuelva
  if (await A.evaluate(() => { const b = document.querySelector('#tipo-blindado'); return !!b && b.getAttribute('aria-disabled') === 'true'; })) { console.log('El chat blindado está en «próximamente»: prueba omitida (se retoma cuando se active).'); await browser.close(); process.exit(0); }
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(2500);
  const enlace = await A.evaluate(() => { return window.gcomPrueba.enlace(); });
  if (!enlace) { console.log('sin enlace'); await browser.close(); process.exit(1); }
  await B.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(2000);
  if (await B.$('#aceptar-si:visible')) { await B.click('#aceptar-si'); }
  await espera(5000);
  comprueba(await hasta(A, () => /En línea|verificada|pendiente|Postcuántica/i.test(document.querySelector('#cconfianza').textContent), 10000), 'los dos en el chat blindado');

  // 1) lo que llega va velado: «Mensaje nuevo» + Mostrar / Descartar
  await A.tap('#texto'); await A.fill('#texto', 'Hola, esto llega velado'); await A.click('#enviar'); await espera(1200);
  const vB = await caja(B, '.gc-burbuja.gc-velada');
  comprueba(vB && vB.vis, 'B: el mensaje llega velado');
  const tB = await B.evaluate(() => (document.querySelector('.gc-velada .gc-velo-texto b') || {}).textContent);
  comprueba(tB === 'Mensaje nuevo', 'B: dice «Mensaje nuevo», sin el contenido (' + tB + ')');
  comprueba(!(await B.evaluate(() => document.body.textContent.includes('esto llega velado'))), 'B: el texto no está en pantalla');
  await fotoDestapada(B, '20-B-velado');
  const ticksA0 = await A.evaluate(() => document.querySelector('.gc-mia .gc-ticks').title);
  comprueba(ticksA0 !== 'Leído', 'A: aún no cuenta como leído (' + ticksA0 + ')');
  await B.evaluate(() => document.querySelector('.gc-velada .gc-velo-botones .boton.principal').click()); await espera(900);
  comprueba(await B.evaluate(() => document.body.textContent.includes('esto llega velado') && !document.querySelector('.gc-velada')), 'B: «Mostrar» abre el mensaje');
  comprueba(await hasta(A, () => document.querySelector('.gc-mia .gc-ticks').title === 'Leído', 4000), 'A: al mostrarlo, pasa a leído');
  // 2) Descartar: se borra sin abrirse y quien lo envió lo ve
  await B.tap('#texto'); await B.fill('#texto', 'Esto se descarta'); await B.click('#enviar'); await espera(1200);
  comprueba((await caja(A, '.gc-burbuja.gc-velada') || {}).vis, 'A: el mensaje de B llega velado');
  await A.evaluate(() => document.querySelectorAll('.gc-velada .gc-velo-botones .boton')[1].click()); await espera(900);
  comprueba(!(await A.evaluate(() => document.body.textContent.includes('Esto se descarta'))) && !(await caja(A, '.gc-burbuja.gc-velada')), 'A: «Descartar» lo borra sin abrirlo');
  comprueba(await hasta(B, () => /descartado/i.test((document.querySelector('.gc-mia:last-of-type .gc-ticks') || {}).textContent || '') || [...document.querySelectorAll('.gc-mia .gc-ticks')].some((t) => /descartado/i.test(t.textContent)), 4000), 'B: ve «descartado» en su mensaje');
  await fotoDestapada(B, '21-B-descartado');

  // 3) foto con tiempo («Una vez»): se ve dentro y al cerrar se borra; A recibe «visto y borrado»
  const [chooser] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
  await chooser.setFiles(fotoPath); await espera(1200);
  comprueba((await caja(A, '#h-envio.gc-abierta')) !== null && (await caja(A, '#envio-tiempo')).vis, 'A: «Revisa antes de enviar» con «Tiempo en pantalla»');
  await foto(A, '22-A-tiempo');
  await A.evaluate(() => document.querySelector('#envio-tiempo [data-vida="una"]').click()); await A.click('#envio-si'); await espera(2500);
  comprueba(await hasta(B, () => !!document.querySelector('.gc-velada'), 6000), 'B: la foto llega velada');
  const tipoB = await B.evaluate(() => (document.querySelector('.gc-velada .gc-velo-texto b') || {}).textContent);
  comprueba(tipoB === 'Foto', 'B: velada como «Foto» (' + tipoB + ')');
  await B.evaluate(() => document.querySelector('.gc-velada .gc-velo-botones .boton.principal').click()); await espera(900);
  const verB = await B.evaluate(() => { const b = [...document.querySelectorAll('.gc-archivo .boton')].find((x) => x.textContent === 'Ver'); return !!b && !document.querySelector('.gc-archivo img.imagen'); });
  comprueba(verB, 'B: con tiempo, botón «Ver» y sin vista previa ni «Guardar»');
  await fotoDestapada(B, '23-B-foto-tiempo');
  await B.evaluate(() => [...document.querySelectorAll('.gc-archivo .boton')].find((x) => x.textContent === 'Ver').click()); await espera(800);
  comprueba((await caja(B, '#visor')).vis && (await caja(B, '#visor-cuerpo img')).vis, 'B: el visor se abre con la foto');
  await foto(B, '24-B-visor');
  await B.click('#visor-cerrar'); await espera(1200);
  comprueba(await B.evaluate(() => /Visto y borrado/.test(document.querySelector('.gc-archivo .sello.vida').textContent) && !document.querySelector('#visor:not([hidden])')), 'B: al cerrar, «Visto y borrado»');
  comprueba(await hasta(A, () => [...document.querySelectorAll('.gc-mia .sello.vida')].some((s) => /otro equipo/.test(s.textContent)), 5000), 'A: «Visto y borrado en el otro equipo»');
  await fotoDestapada(A, '25-A-visto');

  // 4) archivo de 4 piezas: paquete «todo o nada», completo y con la huella correcta
  const [ch2] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
  await ch2.setFiles(grandePath); await espera(1000); await A.click('#envio-si');
  comprueba(await hasta(B, () => !!document.querySelector('.gc-velada'), 8000), 'B: el documento llega velado');
  await B.evaluate(() => document.querySelector('.gc-velada .gc-velo-botones .boton.principal').click());
  comprueba(await hasta(B, () => [...document.querySelectorAll('.gc-archivo .sello')].some((s) => /todo o nada/.test(s.textContent)), 15000), 'B: archivo completo, autenticado y como paquete «todo o nada»');
  comprueba(await hasta(A, () => [...document.querySelectorAll('.recibo')].length > 0 || [...document.querySelectorAll('.gc-mia .sello')].some((s) => /todo o nada/.test(s.textContent)), 15000), 'A: recibo de entrega');
  const shaB = await B.evaluate(async () => { const r = await new Promise((res) => { const q = indexedDB.open('guardiana-com'); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); if (!r) return 'sin bd'; try { const tx = r.transaction('arch'); const st = tx.objectStore('arch'); const all = await new Promise((res) => { const g = st.getAll(); g.onsuccess = () => res(g.result); g.onerror = () => res([]); }); const x = all.find((a) => a.tam === 700 * 1024); if (!x) return 'sin archivo'; const b = new Uint8Array(await x.blob.arrayBuffer()); const h = await crypto.subtle.digest('SHA-256', b); return [...new Uint8Array(h)].map((v) => v.toString(16).padStart(2, '0')).join(''); } catch (e) { return 'error ' + e.message; } });
  comprueba(shaB === shaGrande, 'B: el archivo abierto es idéntico al enviado (SHA-256) · ' + shaB.slice(0, 16));
  await fotoDestapada(B, '26-B-paquete');
  // «Borrar en los dos»
  await A.evaluate(() => { const b = [...document.querySelectorAll('.gc-mia .gc-archivo .boton')].find((x) => x.textContent === 'Borrar en los dos'); if (b) b.click(); }); await espera(1200);
  comprueba(await hasta(B, () => ![...document.querySelectorAll('.gc-archivo b')].some((b) => b.textContent === 'informe.bin') && /borrado un archivo/.test(document.body.textContent), 5000), 'B: «Borrar en los dos» lo quita también en B');

  // 5) la llamada: el número de seguridad, igual en las dos pantallas; «Coinciden» verifica
  await A.evaluate(() => document.querySelector('#llamar').click()); await espera(2500);
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
  comprueba(await hasta(A, () => !document.querySelector('#ll-sas').hidden, 12000) && await hasta(B, () => !document.querySelector('#ll-sas').hidden, 12000), 'llamada: el número aparece en los dos');
  const nA = await A.evaluate(() => document.querySelector('#ll-sas-num').textContent), nB = await B.evaluate(() => document.querySelector('#ll-sas-num').textContent);
  comprueba(/^\d\d \d\d$/.test(nA) && nA === nB, 'llamada: el mismo número en las dos pantallas (' + nA + ' | ' + nB + ')');
  await foto(A, '27-A-numero'); await foto(B, '27-B-numero');
  await A.click('#ll-sas-si'); await B.click('#ll-sas-si'); await espera(1000);
  comprueba(await A.evaluate(() => document.querySelector('#ll-sas').hidden && !document.querySelector('#ll-sas-mini').hidden && /✓/.test(document.querySelector('#ll-sas-mini').textContent)), 'llamada: con «Coinciden», la píldora ✓ arriba');
  await foto(A, '28-A-coinciden');
  await A.click('#ll-colgar'); await espera(2000);
  comprueba(await hasta(A, () => { const c = window.gcomPrueba.conv(); return !!(c && c.verificada && c.suVerificada); }, 6000) && await hasta(B, () => { const c = window.gcomPrueba.conv(); return !!(c && c.verificada && c.suVerificada); }, 6000), 'chat: queda verificada por los dos, sin mandar ningún número');

  // 6) alarma: al segundo mensaje manipulado, se destruye en los dos equipos y se dice en pantalla
  await B.evaluate(async () => { await window.gcomPrueba.incidencia(); });
  comprueba(await B.evaluate(() => document.querySelector('#alarma').hidden), 'alarma: con una incidencia, todavía no');
  await B.evaluate(async () => { await window.gcomPrueba.incidencia(); }); await espera(1500);
  comprueba(await B.evaluate(() => !document.querySelector('#alarma').hidden), 'alarma: con la segunda, se destruye y avisa en B');
  comprueba(await hasta(A, () => !document.querySelector('#alarma').hidden, 6000), 'alarma: el otro equipo (A) también se destruye y avisa');
  await foto(B, '29-B-alarma'); await foto(A, '29-A-alarma');
  const quedaA = await A.evaluate(() => window.gcomPrueba.conv() ? 1 : 0), quedaB = await B.evaluate(() => window.gcomPrueba.conv() ? 1 : 0);
  comprueba(!quedaA && !quedaB, 'alarma: no queda conversación en ningún equipo');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
