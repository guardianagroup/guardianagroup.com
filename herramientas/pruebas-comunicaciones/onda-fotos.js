// Notas de voz con la onda real y velocidad 1× / 1,5× / 2×; fotos con el hueco reservado y el visor dentro de la app
// (agencia, ronda 76, fase 4). Dos teléfonos con Número GUARDIANA contra el relé de pruebas:
//   1. A manda una nota de voz (WAV: una mitad fuerte y otra floja) → en B, 44 barras y las primeras más altas que las últimas.
//   2. La velocidad: 1× → 1,5× → 2× → 1×, se recuerda y se aplica al reproducir; al sonar, las barras oídas se colorean.
//   3. A manda una foto de 1200 × 800 → en los dos, el hueco de 280 × 187 antes y después de cargar; al tocarla, el visor sin
//      cuenta atrás; al cerrarlo, la foto sigue. Tras recargar, el hueco se conserva.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'onda-fotos');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  await p.goto(URL0); await espera(2500); await p.click('#num-usar'); await espera(2500);
  return p;
}
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && r.width > 0 && r.height > 0; }, s);
const texto = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ''; }, s);
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
// un WAV de 3 s (mono, 8 kHz, 16 bits): 1,5 s fuertes y 1,5 s flojos
function wav() {
  const sr = 8000, n = sr * 3, datos = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) { const a = i < n / 2 ? 0.8 : 0.08; const v = Math.round(a * 32767 * Math.sin(2 * Math.PI * 440 * i / sr)); datos.writeInt16LE(v, i * 2); }
  const cab = Buffer.alloc(44);
  cab.write('RIFF', 0); cab.writeUInt32LE(36 + datos.length, 4); cab.write('WAVE', 8); cab.write('fmt ', 12); cab.writeUInt32LE(16, 16); cab.writeUInt16LE(1, 20); cab.writeUInt16LE(1, 22);
  cab.writeUInt32LE(sr, 24); cab.writeUInt32LE(sr * 2, 28); cab.writeUInt16LE(2, 32); cab.writeUInt16LE(16, 34); cab.write('data', 36); cab.writeUInt32LE(datos.length, 40);
  return Buffer.concat([cab, datos]);
}
const alturas = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel + ' .gc-voz-onda i')].map((i) => parseFloat(i.style.height) || 0), sel);
const media = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  const nA = await A.evaluate(() => window.gcomPruebaNumero.mio()), nB = await B.evaluate(() => window.gcomPruebaNumero.mio());
  await A.click('#llamar-num'); await marca(A, nB); await A.click('#marcar-llamar'); await espera(400); await A.fill('#num-nombre', 'Nathalie'); await A.click('#num-anadir'); await espera(1500); await A.click('#num-espera-ok');
  await B.click('#llamar-num'); await marca(B, nA); await B.click('#marcar-llamar'); await espera(400); await B.fill('#num-nombre', 'Fran'); await B.click('#num-anadir'); await espera(7000);
  comprueba(await visible(A, '#conv') && await visible(B, '#conv'), 'A y B: el chat se abre en los dos');
  // 1. la nota de voz con la onda
  await A.setInputFiles('#archivo', { name: 'Nota de voz 01.50 (0:03).wav', mimeType: 'audio/wav', buffer: wav() }); await espera(4000);
  const hA = await alturas(A, '.gc-mia'), hB = await alturas(B, '.gc-suya');
  comprueba(hA.length === 44 && hB.length === 44, 'la nota lleva 44 barras en los dos (' + hA.length + ' / ' + hB.length + ')');
  comprueba(media(hB.slice(0, 20)) > media(hB.slice(24)) * 1.8 && Math.max(...hB) >= 20, 'en B, la onda es real: la mitad fuerte más alta que la floja (' + media(hB.slice(0, 20)).toFixed(1) + ' frente a ' + media(hB.slice(24)).toFixed(1) + ')');
  comprueba(media(hA.slice(0, 20)) > media(hA.slice(24)) * 1.8, 'en A, también');
  comprueba(await B.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); const m = c.mensajes.find((x) => x.tipo === 'archivo'); return !!(m && m.archivo.onda && m.archivo.onda.length > 40); }), 'la onda queda guardada con el mensaje (no se vuelve a calcular)');
  comprueba((await texto(B, '.gc-suya .gc-voz-t')) === '0:03' && (await texto(B, '.gc-suya .gc-voz-vel')) === '1×', 'en reposo: la duración (0:03) y la velocidad 1×');
  await foto(B, '01-B-nota');
  // la onda, centrada con el círculo de ▶ (dueño, 07:58: «a la altura del centro perfecto del círculo»)
  const centros = (p, sel) => p.evaluate((sel) => { const c = (e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; }; const d = document.querySelector(sel + ' .gc-voz'); return { play: c(d.querySelector('.gc-voz-play')), onda: c(d.querySelector('.gc-voz-onda')), punto: c(d.querySelector('.gc-voz-punto')), vel: c(d.querySelector('.gc-voz-vel')) }; }, sel);
  for (const [P, sel, q] of [[B, '.gc-suya', 'B'], [A, '.gc-mia', 'A']]) { const k = await centros(P, sel); comprueba(Math.abs(k.play - k.onda) <= 1 && Math.abs(k.play - k.punto) <= 1 && Math.abs(k.play - k.vel) <= 1, q + ': la onda, la bolita y la velocidad, en el centro del círculo de ▶ (' + JSON.stringify(k) + ')'); }
  // 2. la velocidad
  await B.click('.gc-suya .gc-voz-vel'); await espera(200);
  comprueba((await texto(B, '.gc-suya .gc-voz-vel')) === '1,5×' && await B.evaluate(() => document.querySelector('.gc-suya .gc-voz-vel').classList.contains('activa') && localStorage.getItem('gcom-voz-vel') === '1.5'), 'un toque: 1,5× (se recuerda)');
  await B.click('.gc-suya .gc-voz-vel'); await espera(200);
  comprueba((await texto(B, '.gc-suya .gc-voz-vel')) === '2×', 'otro: 2×');
  await B.evaluate(() => { const b = document.querySelector('.gc-suya .gc-voz-play'); b.click(); window.__icono = b.querySelectorAll('svg rect').length; });
  comprueba(await B.evaluate(() => window.__icono === 2), 'al dar ▶, en el mismo toque pasa a ‖ (dos rayas verticales)');
  await espera(900);
  const sonando = await B.evaluate(() => { const d = document.querySelector('.gc-suya .gc-voz'), au = d.querySelector('audio'); return { rate: au.playbackRate, oidas: d.querySelectorAll('.gc-voz-onda i.oida').length, sonando: d.classList.contains('sonando') }; });
  comprueba(sonando.rate === 2, 'al reproducir, va a 2× (' + sonando.rate + ')');
  comprueba(sonando.oidas > 0 && sonando.oidas < 44, 'mientras suena, las barras oídas se colorean (' + sonando.oidas + ' de 44)');
  await foto(B, '02-B-sonando');
  await espera(2500);
  comprueba(await B.evaluate(() => !document.querySelector('.gc-suya .gc-voz-play svg rect')), 'al terminar, vuelve a ▶');
  await B.click('.gc-suya .gc-voz-vel'); await espera(200);
  comprueba((await texto(B, '.gc-suya .gc-voz-vel')) === '1×' && !(await B.evaluate(() => document.querySelector('.gc-suya .gc-voz-vel').classList.contains('activa'))), 'y vuelve a 1×');
  // 3. la foto
  const png = await A.evaluate(() => { const c = document.createElement('canvas'); c.width = 1200; c.height = 800; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 1200, 800); g.addColorStop(0, '#1E3A58'); g.addColorStop(1, '#9CC3E4'); x.fillStyle = g; x.fillRect(0, 0, 1200, 800); x.fillStyle = '#fff'; x.font = 'bold 120px sans-serif'; x.fillText('GUARDIANA', 150, 440); return c.toDataURL('image/png').split(',')[1]; });
  await A.setInputFiles('#archivo', { name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') }); await espera(6000);
  const cajaA = await A.evaluate(() => { const f = document.querySelector('.gc-mia .gc-foto'); return f ? { w: f.style.width, h: f.style.height, lista: f.classList.contains('lista'), img: !!f.querySelector('img.imagen') } : null; });
  const cajaB = await B.evaluate(() => { const f = document.querySelector('.gc-suya .gc-foto'); return f ? { w: f.style.width, h: f.style.height, lista: f.classList.contains('lista'), img: !!f.querySelector('img.imagen') } : null; });
  comprueba(cajaA && cajaA.w === '280px' && cajaA.h === '187px' && cajaA.lista, 'A: la foto en su hueco de 280 × 187: ' + JSON.stringify(cajaA));
  comprueba(cajaB && cajaB.w === '280px' && cajaB.h === '187px' && cajaB.lista && cajaB.img, 'B: la foto llega a un hueco igual: ' + JSON.stringify(cajaB));
  comprueba(await B.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); const m = c.mensajes.find((x) => x.tipo === 'archivo' && /^image/.test(x.archivo.mime)); return !!(m && m.archivo.w === 1200 && m.archivo.h === 800); }), 'las medidas viajan en el anuncio (1200 × 800)');
  await foto(B, '03-B-foto');
  comprueba(await B.evaluate(() => { const d = document.querySelector('.gc-suya .gc-archivo-foto'); return !!d && [...d.querySelectorAll('b, small, .gc-archivo-icono')].every((e) => e.hidden) && !d.querySelector('.boton'); }), 'la foto va sola: sin nombre, tamaño ni botones');
  await B.evaluate(() => { const i = document.querySelector('.gc-suya .gc-foto img.imagen'); const r = i.getBoundingClientRect(); i.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: r.x + 20, clientY: r.y + 20 })); }); await espera(400);
  comprueba(await visible(B, '#mm-guardar') && await visible(B, '#mmenu'), 'mantener pulsada la foto: el menú trae «Guardar»');
  await B.keyboard.press('Escape'); await espera(200);
  const bajar = await B.evaluate(() => { const g = document.querySelector('.gc-suya .gc-foto .gc-foto-bajar'), f = document.querySelector('.gc-suya .gc-foto'), t = document.querySelector('.gc-suya .gc-archivo-foto').closest('.gc-burbuja').querySelector('.gc-meta'); if (!g) return null; const a = g.getBoundingClientRect(), b = f.getBoundingClientRect(), c = t.getBoundingClientRect(); return { dentro: a.left >= b.left && a.bottom <= b.bottom && a.left - b.left < 14 && b.bottom - a.bottom < 14, horaDer: c.left >= a.right + 40 && b.right - c.right < 16 }; });
  comprueba(bajar && bajar.dentro && bajar.horaDer, 'B: el símbolo de descarga, dentro de la foto abajo a la izquierda, y la hora a la derecha: ' + JSON.stringify(bajar));
  comprueba(await A.evaluate(() => !document.querySelector('.gc-mia .gc-foto-bajar')), 'A (quien la envió): sin símbolo de descarga');
  await B.keyboard.press('Escape'); await espera(200);
  await B.click('.gc-suya .gc-foto img.imagen'); await espera(700);
  comprueba(await visible(B, '#visor') && await B.evaluate(() => document.querySelector('#visor').classList.contains('sin-tiempo') && !!document.querySelector('#visor-cuerpo img') && getComputedStyle(document.querySelector('#visor .visor-pie')).display === 'none' && document.querySelector('#visor-cuenta').hidden), 'al tocarla, el visor dentro de la app, sin cuenta atrás ni «se borra»');
  await foto(B, '04-B-visor');
  await B.click('#visor-cerrar'); await espera(500);
  comprueba(!(await visible(B, '#visor')) && await B.evaluate(() => !!document.querySelector('.gc-suya .gc-foto img.imagen') && !document.querySelector('.gc-suya .gc-archivo.caducado')), 'al cerrar el visor, la foto sigue en el chat');
  await B.reload(); await espera(4500);
  const tras = await B.evaluate(() => { const f = document.querySelector('.gc-suya .gc-foto'); return f ? { w: f.style.width, h: f.style.height } : null; });
  comprueba(tras && tras.w === '280px' && tras.h === '187px', 'tras recargar, el hueco se conserva: ' + JSON.stringify(tras));
  comprueba((await alturas(B, '.gc-suya')).length === 44 && media((await alturas(B, '.gc-suya')).slice(0, 20)) > media((await alturas(B, '.gc-suya')).slice(24)) * 1.8, 'tras recargar, la onda sale de lo guardado');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
