// Ultra 1 (3 Nov 2026; dueño, 00:20: «empezar ya la versión ultra… sobre todo de privacidad y que no puedan espiarnos. Máximo nivel
// que seas capaz de hacer»; agencia, ronda 93). Dos ordenadores y, al final, un teléfono simulado. Lo que se comprueba:
//   1. La puerta: fuera del programa, el botón Ultra explica en una línea y no crea nada; dentro del programa (data-en-programa y la
//      pasarela GET /api/plan simulada) con nivel «gratis», lo mismo; con «plus», crea la invitación. En la hoja del teléfono, Ultra
//      sale apagada fuera del programa. (En local, «?plan=plus» hace de programa con Plus.)
//   2. La invitación va solo en el fragmento («#b=», 43 caracteres): ninguna trama hacia el relé lleva el secreto ni un «invita» (código).
//   3. Las cuatro palabras de verificación, las mismas en los dos chats y, en la llamada, las mismas en las dos pantallas; el nivel de
//      cada lado («navegador del PC»; con el programa, «PC con GUARDIANA»).
//   4. Relleno: cada trama de mensaje que sale hacia el relé mide 41 + 13 + 16 + k·1024 bytes; y el latido de relleno (aquí cada 2 s)
//      sigue saliendo sin que nadie escriba.
//   5. Sin buzón: con la otra persona desconectada, un mensaje no manda ningún sobre (trama 3) al relé; se queda pendiente.
//   6. Sin rebaja: un navegador sin Encoded Transforms no puede llamar (la hoja explica «aqui»), y si le llaman, lo rechaza y el que
//      llama ve «suyo»; «Seguir en la Blindada» manda una invitación «#i=» por el chat.
//   7. Recibo negable por defecto (nota del sistema «negable», sin tarjeta de comprobante); «Solicitar comprobante firmado» hace la
//      tarjeta firmada por los dos; el nombre del archivo sale neutro; una foto con EXIF llega sin EXIF.
//   8. Nada guardado: al recargar, la conversación Ultra ya no está (ni en IndexedDB) y el otro lado la ve desconectada.
//   9. La tecla de pánico: Esc dos veces borra y sale a la portada; el otro equipo recibe la orden de borrado.
//  10. En una pantalla táctil estrecha (desde el 1 Nov 2026 marco.js lleva los teléfonos a /solo-pc/: aquí, una ventana de 390 px táctil
//      con el navegador del PC, como tipos.js): la pantalla se tapa al pasar a segundo plano y, a los 15 s fuera de una llamada, las
//      claves de la sesión se borran y al volver se acuerdan otras.
//  11. Opus a ritmo constante: en cada sección de audio de la descripción, cbr=1 y usedtx=0, y sin la extensión «ssrc-audio-level»;
//      los paquetes de la voz que salen miden lo mismo; en «Seguridad de esta llamada», la clave cambia «cada minuto»; y en Ultra no se
//      ofrece «Pasar al teléfono».
// Y lo de la revisión independiente (3 nov 2026; ultra-2, 5 nov 2026):
//  R1. Las palabras del chat, con compromiso previo: «comprobando…» hasta que quien inicia revela su número (aquí, 4 s después) y,
//      luego, las mismas en los dos; si quien inicia se comprometió con otra identidad, alarma y borrado en los dos.
//  R2. Ritmo fijo: una trama de 1 KB por tic (aquí, 2 s), con mensajes o sin ellos, nunca dos seguidas antes de tiempo; y nunca la
//      marca de aviso 0x11.
//  R3. Una llamada Ultra cuya capa postcuántica no se mantiene se cuelga en los dos lados (no sigue en claro) y lo explica.
//  R4. Una oferta de llamada sin el compromiso de las palabras se rechaza en los dos lados.
//  R5/R8/R9. «Límites» dice lo del historial, que el nivel lo dice el programa de cada uno y que no se envían ni el país ni el nombre.
//  R7. SVG y MP3, limpios; lo demás (un PDF) no sale sin «Enviarlo así».
//  R12. Esc dos veces también durante una llamada Ultra: cuelga, borra en los dos y sale.
//  R13. Quien recibe decide «Firmar» o «No firmar» el comprobante.
// Uso: node ultra.js [carpeta de capturas]
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const OUT = process.argv[2] || path.join(__dirname, 'ultra');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + (ms || 8000); while (Date.now() < h) { if (await fn()) return true; await espera(200); } return false; };
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const aviso = (P) => P.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent : ''; });
const local = (u) => u.replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
// x: { plan: 'plus'|'gratis'|'' (en la dirección), programa: 'plus'|'gratis' (data-en-programa y la pasarela simulada), sinCapa, movil, latido }
async function equipo(browser, nombre, x) {
  x = x || {};
  const ctx = await browser.newContext({ viewport: x.movil ? { width: 390, height: 844 } : { width: 1366, height: 820 }, deviceScaleFactor: x.movil ? 2 : 1, hasTouch: !!x.movil, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((x) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); if (x.rota) sessionStorage.setItem('gcom-rota-ms', String(x.rota)); if (x.revela) sessionStorage.setItem('gcom-prueba-revela-ms', String(x.revela)); if (x.otraIdentidad) sessionStorage.setItem('gcom-prueba-otra-identidad', '1'); if (x.sinCw) sessionStorage.setItem('gcom-prueba-sin-cw', '1'); if (x.recompromete) sessionStorage.setItem('gcom-prueba-recompromete', '1'); } catch (_) {}
    if (x.sinCapa) { try { delete window.RTCRtpScriptTransform; window.RTCRtpScriptTransform = undefined; } catch (_) {} }
    if (x.rompeVoz) { try { if (window.AudioWorklet) AudioWorklet.prototype.addModule = function () { return Promise.reject(new Error('prueba')); }; } catch (_) {} }
    setInterval(() => { const e = document.querySelector('#aviso'); if (e && !e.hidden && e.textContent && !(window.__av || []).includes(e.textContent)) (window.__av = window.__av || []).push(e.textContent); }, 100);
    if (x.movil) { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} }
    window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); };
    window.__copiados = []; try { navigator.clipboard.writeText = (y) => { window.__copiados.push(String(y)); return Promise.resolve(); }; navigator.clipboard.write = (items) => Promise.all(items.map(async (it) => { const b = await it.getType('text/plain'); window.__copiados.push(await b.text()); })); } catch (_) {}
    // el programa GUARDIANA, simulado: marca la página y contesta GET /api/plan por la pasarela
    if (x.programa) {
      document.addEventListener('DOMContentLoaded', () => { document.documentElement.dataset.enPrograma = '1'; });
      document.addEventListener('guardiana-panel-pide', (e) => { let d = e.detail; try { d = JSON.parse(d); } catch (_) {} window.__pedidos = (window.__pedidos || []).concat(d.ruta); setTimeout(() => document.dispatchEvent(new CustomEvent('guardiana-panel', { detail: JSON.stringify({ n: d.n, estado: 200, datos: JSON.stringify({ nivel: x.programa }) }) })), 30); });
    }
  }, x);
  const p = await ctx.newPage();
  p.tramas = []; // lo que esta página manda al relé: { bin, len, b0 } o { txt }
  p.on('websocket', (ws) => { if (!/\/com$/.test(ws.url())) return; ws.on('framesent', (f) => { const d = f.payload; if (typeof d === 'string') p.tramas.push({ txt: d, t: Date.now() }); else p.tramas.push({ bin: true, len: d.length, b0: d[0], d, t: Date.now() }); }); });
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  p.on('console', (m) => { if (m.type() === 'error') console.log('[' + nombre + '] error: ' + m.text().slice(0, 200)); });
  await p.goto(URL0 + (x.plan ? '?plan=' + x.plan : '') + (x.latido ? (x.plan ? '&' : '?') + 'latido=' + x.latido : '')); await espera(1500);
  return p;
}
const foto = (P, n) => P.screenshot({ path: path.join(OUT, n + '.png') });
const palabrasChat = (P) => P.evaluate(() => { const e = document.querySelector('#cpalabras'); return e && !e.hidden ? document.querySelector('#cpalabras-txt').textContent : ''; });
const nivelChat = (P) => P.evaluate(() => (document.querySelector('#cpalabras-nivel') || {}).textContent || '');
async function invitaUltra(A) {
  await A.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  return A.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '');
}
async function acepta(B, enlace) { await B.goto(local(enlace)); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si'); }
// en la sesión Ultra: el PC lo dice en la línea de confianza; el teléfono la deja vacía (el puntito verde), así que ahí, la sesión
const enChat = (P) => hasta(() => P.evaluate(() => /postcuántica|Postcuántica/.test(document.querySelector('#cconfianza').textContent) || [...GuardianaCom.convs.values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada && c.sesion.pq)), 15000);
async function llama(A, B, video) {
  await A.evaluate((v) => document.querySelector(v ? '#videollamar' : '#llamar').click(), !!video);
  for (let i = 0; i < 40; i++) { await espera(250); if (await B.$('#ll-contestar:visible')) { await B.click('#ll-contestar'); break; } }
  await hasta(() => A.evaluate(() => GuardianaCom.llamada.estado === 'hablando'), 15000);
  await espera(3000);
}
const estadoLl = (P) => P.evaluate(() => GuardianaCom.llamada.estado);
// una foto JPEG de verdad (la dibuja el navegador, 64×48) con un segmento APP1 «Exif» con GPS detrás del SOI, para ver que no llega
async function jpegConExif(browser) {
  const p = await browser.newPage();
  const b64 = await p.evaluate(() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 48; const g = cv.getContext('2d'); g.fillStyle = '#2a6'; g.fillRect(0, 0, 64, 48); g.fillStyle = '#fc3'; g.fillRect(8, 8, 30, 20); return cv.toDataURL('image/jpeg', 0.9).split(',')[1]; });
  await p.close();
  const base = Buffer.from(b64, 'base64');
  const exif = Buffer.concat([Buffer.from('Exif\0\0'), Buffer.from('MM\0\x2a\0\0\0\x08\0\x01\x88\x25\0\x04\0\0\0\x01\0\0\0\x1a\0\0\0\0GPS LATITUDE 40.4168 N, 3.7038 W, hecho con un telefono concreto')]);
  const app1 = Buffer.concat([Buffer.from([0xff, 0xe1, (exif.length + 2) >> 8, (exif.length + 2) & 255]), exif]);
  return Buffer.concat([base.subarray(0, 2), app1, base.subarray(2)]);
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gcom-ultra-'));
const fotoPath = path.join(tmp, 'IMG_20261103_mi-nombre.jpg');
// y una «foto» dañada (con su Exif) que ningún navegador puede volver a dibujar
const rotaPath = path.join(tmp, 'IMG_roto.jpg'); fs.writeFileSync(rotaPath, Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0, 20]), Buffer.from('Exif\0\0GPS 40.4168 N\0'), Buffer.alloc(400, 0x55)]));
const docPath = path.join(tmp, 'informe de mi nombre.pdf'); fs.writeFileSync(docPath, Buffer.concat([Buffer.from('%PDF-1.4\n% GUARDIANA prueba\n'), Buffer.alloc(300 * 1024, 7)]));
const doc2Path = path.join(tmp, 'otro informe.pdf'); fs.writeFileSync(doc2Path, Buffer.concat([Buffer.from('%PDF-1.4\n% GUARDIANA prueba 2\n'), Buffer.alloc(40 * 1024, 9)]));
const svgPath = path.join(tmp, 'dibujo de mi nombre.svg'); fs.writeFileSync(svgPath, '<?xml version="1.0" encoding="UTF-8"?>\n<!-- hecho por Fulano Prueba en su equipo -->\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" width="40" height="40" inkscape:version="1.3 (Fulano Prueba)" sodipodi:docname="dibujo de Fulano Prueba.svg"><metadata><rdf:RDF><cc:Work><dc:creator><cc:Agent><dc:title>Fulano Prueba</dc:title></cc:Agent></dc:creator></cc:Work></rdf:RDF></metadata><sodipodi:namedview id="nv" inkscape:window-width="1920"/><rect width="40" height="40" fill="#2a6" inkscape:label="capa de Fulano Prueba"/></svg>\n');
// un SVG con una foto incrustada (data:), que conservaría sus datos: no se puede limpiar aquí (revisión independiente 2, S4)
const svg2Path = path.join(tmp, 'plano con foto.svg'); fs.writeFileSync(svg2Path, '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><title>Plano de Fulano</title><image href="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==" width="40" height="40"/></svg>\n');
// un MP3 con etiquetas ID3v2 (al principio) y, al final, APEv2 con cabecera, Lyrics3 v2 e ID3v1 («TAG»): título y autor (M6)
const mp3Path = path.join(tmp, 'grabacion de mi nombre.mp3');
{ const txt = Buffer.from('\0Cancion de Fulano Prueba'), fr = Buffer.concat([Buffer.from('TIT2'), Buffer.from([0, 0, 0, txt.length, 0, 0]), txt]);
  const tam = fr.length, cab = Buffer.from([0x49, 0x44, 0x33, 3, 0, 0, (tam >> 21) & 127, (tam >> 14) & 127, (tam >> 7) & 127, tam & 127]);
  const mpeg = Buffer.alloc(4 * 1024, 0x55); for (let i = 0; i < mpeg.length; i += 418) { mpeg[i] = 0xff; mpeg[i + 1] = 0xfb; mpeg[i + 2] = 0x90; mpeg[i + 3] = 0x64; }
  const v1 = Buffer.alloc(128, 0); Buffer.from('TAG').copy(v1, 0); Buffer.from('Fulano Prueba').copy(v1, 33);
  const it = Buffer.concat([Buffer.alloc(8), Buffer.from('Artist\0'), Buffer.from('Fulano Prueba')]); it.writeUInt32LE(13, 0);
  const apeP = (cabecera) => { const x = Buffer.alloc(32); x.write('APETAGEX', 0, 'latin1'); x.writeUInt32LE(2000, 8); x.writeUInt32LE(it.length + 32, 12); x.writeUInt32LE(1, 16); x.writeUInt32LE((0x80000000 | (cabecera ? 0x20000000 : 0)) >>> 0, 20); return x; };
  const lyr = Buffer.from('LYRICSBEGIN' + 'IND0000210' + 'LYR00013Fulano Prueba'), ly = Buffer.concat([lyr, Buffer.from(String(lyr.length).padStart(6, '0') + 'LYRICS200')]);
  fs.writeFileSync(mp3Path, Buffer.concat([cab, fr, mpeg, apeP(true), it, apeP(false), ly, v1])); }

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  fs.writeFileSync(fotoPath, await jpegConExif(browser));

  // ---- 1. la puerta ----
  { const F = await equipo(browser, 'fuera');
    await F.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(700);
    const av = await aviso(F);
    comprueba(/desde el programa GUARDIANA/.test(av) && (await F.evaluate(() => window.gcomPrueba.cuantas())) === 0, '1. fuera del programa: el botón Ultra lo explica en una línea y no crea nada', av);
    comprueba(await F.evaluate(() => /desde el programa GUARDIANA/.test(document.querySelector('#nueva-blindada-t').textContent)), '1. y el botón del inicio lo dice desde el principio');
    await foto(F, '01-pc-fuera');
    await F.context().close();
    const G = await equipo(browser, 'gratis', { programa: 'gratis' });
    await G.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(900);
    const av2 = await aviso(G);
    comprueba(/suscripción Plus/.test(av2) && (await G.evaluate(() => window.gcomPrueba.cuantas())) === 0 && (await G.evaluate(() => (window.__pedidos || []).includes('/api/plan'))), '1. en el programa sin Plus: pide GET /api/plan, lo explica y no crea nada', av2);
    await G.context().close();
    const M = await equipo(browser, 'movil-fuera', { movil: true });
    await M.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(900);
    const hoja = await M.evaluate(() => ({ abierta: document.querySelector('#h-invitar').classList.contains('gc-abierta'), apagado: document.querySelector('#tipo-blindado').getAttribute('aria-disabled'), sub: document.querySelector('#tipo-blindado small').textContent }));
    comprueba(hoja.abierta && hoja.apagado === 'true' && /programa GUARDIANA/.test(hoja.sub), '1. en el teléfono, fuera del programa: Ultra apagada en la hoja, con el motivo', hoja);
    await M.evaluate(() => document.querySelector('#tipo-blindado').click()); await espera(700);
    comprueba(/desde el programa GUARDIANA/.test(await aviso(M)) && (await M.evaluate(() => document.querySelector('#tipo-normal').getAttribute('aria-checked') === 'true')), '1. tocarla avisa y sigue la Blindada');
    await foto(M, '01-movil-hoja');
    await M.context().close();
  }

  // ---- 2–4. dos PCs: A en el programa con Plus (pasarela simulada), B fuera ----
  const A = await equipo(browser, 'A', { programa: 'plus', latido: 2, rota: 8000, revela: 4000 }), B = await equipo(browser, 'B', { latido: 2, rota: 8000, revela: 4000 });
  const enlace = await invitaUltra(A);
  comprueba(/\/chat\/#b=[A-Za-z0-9_-]{43}$/.test(enlace), '2. la invitación Ultra: solo el fragmento «#b=» con 256 bits', enlace.slice(-50));
  comprueba(await A.evaluate(() => (window.__pedidos || []).includes('/api/plan')), '1. para crearla, el programa contestó GET /api/plan con «plus»');
  await foto(A, '02-pc-invitacion');
  const secreto = enlace.split('#b=')[1];
  const lleva = (P) => P.tramas.some((t) => (t.txt && (t.txt.includes(secreto) || /"t":"invita"/.test(t.txt))) || (t.bin && Buffer.from(t.d).toString('latin1').includes(secreto)));
  await acepta(B, enlace);
  comprueba(await enChat(A) && await enChat(B), '3. los dos en la sesión Ultra');
  comprueba(!lleva(A) && !lleva(B), '2. ninguna trama hacia el relé lleva el secreto ni un código de invitación', A.tramas.filter((t) => t.txt).map((t) => t.txt.slice(0, 30)));
  // R1: antes de la revelación (quien inicia la retrasa 4 s), ninguna palabra: «comprobando…» en los dos
  { const qa = await palabrasChat(A), qb = await palabrasChat(B);
    comprueba(qa === 'comprobando…' && qb === 'comprobando…', 'R1. hasta que quien inicia revela su número, «comprobando…» en los dos (ninguna palabra)', [qa, qb]);
    await foto(A, '03a-pc-chat-comprobando'); }
  await hasta(async () => (await palabrasChat(A)).split(' · ').length === 4 && (await palabrasChat(B)).split(' · ').length === 4, 12000);
  const pa = await palabrasChat(A), pb = await palabrasChat(B);
  comprueba(pa && pa === pb && pa.split(' · ').length === 4, '3. las cuatro palabras, las mismas en los dos chats (tras comprobar el compromiso)', [pa, pb]);
  comprueba(/Tu lado: PC con GUARDIANA · Otro lado: navegador del PC/.test(await nivelChat(A)) && /Tu lado: navegador del PC · Otro lado: PC con GUARDIANA/.test(await nivelChat(B)), '3. el nivel de cada lado, en los dos', [await nivelChat(A), await nivelChat(B)]);
  // un contacto se queda para volver a llamar: en Ultra, que no guarda nada, no se ofrece
  comprueba(await A.evaluate(() => document.querySelector('#cm-contacto').hidden && document.querySelector('#ccontacto').hidden) && await B.evaluate(() => document.querySelector('#cm-contacto').hidden && document.querySelector('#ccontacto').hidden), '8. en Ultra no se ofrece «Guardar contacto»');
  // el texto llega; el relé solo ve bloques de 1 KB
  A.tramas.length = 0;
  await A.fill('#texto', 'Hola, esto es Ultra'); await A.click('#enviar'); await espera(1200);
  await A.fill('#texto', 'x'.repeat(1500)); await A.click('#enviar');
  await hasta(async () => A.tramas.filter((t) => t.bin && t.d[41] === 2).length >= 4, 12000); // (a ritmo fijo: un mensaje o un trozo por tic)
  const msgs = A.tramas.filter((t) => t.bin && t.d[41] === 2);
  const tam = msgs.map((t) => t.len);
  comprueba(msgs.length >= 2 && tam.every((n) => (n - 41 - 13 - 16) % 1024 === 0 && n > 41 + 29), '4. cada mensaje sale al relé en bloques de 1 KB (41 de cabecera de relé + 13 + 16 + k·1024)', tam);
  comprueba(await hasta(() => B.evaluate(() => document.querySelectorAll('.gc-velada').length >= 2), 15000), '4. en el otro lado llega velado (lectura discreta)');
  await B.evaluate(() => document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click())); await espera(800);
  comprueba(await B.evaluate(() => document.body.textContent.includes('Hola, esto es Ultra') && document.body.textContent.includes('x'.repeat(1500))), '4. y se lee al mostrarlo (también el de 1.500 letras, que fue en trozos)');
  // R2: ritmo fijo. Durante 12 s se escribe y se mandan tres mensajes: lo que sale hacia el relé son tramas de 1 KB, una por tic
  // (2 s aquí), nunca dos antes de tiempo, y ninguna con la marca de aviso
  { await espera(4000); A.tramas.length = 0;
    await A.fill('#texto', 'uno'); await A.click('#enviar'); await espera(700);
    await A.type('#texto', 'escribiendo', { delay: 60 }); await espera(300); await A.fill('#texto', ''); await A.fill('#texto', 'dos'); await A.click('#enviar'); await espera(400);
    await A.fill('#texto', 'tres'); await A.click('#enviar'); await espera(10000);
    const ts = A.tramas.filter((t) => t.bin && t.d[41] === 2), dif = ts.slice(1).map((t, i) => t.t - ts[i].t);
    comprueba(ts.length >= 5 && ts.length <= 8 && ts.every((t) => t.len === 41 + 13 + 16 + 1024) && dif.every((d) => d >= 1500 && d <= 2700), 'R2. al escribir y mandar tres mensajes, una trama de 1 KB por tic y ninguna de más', { n: ts.length, ms: dif });
    comprueba(await hasta(() => B.evaluate(() => { document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click()); const t = document.body.textContent; return t.includes('uno') && t.includes('dos') && t.includes('tres'); }), 8000), 'R2. y los tres llegan, cada uno en su tic'); }
  comprueba(!A.tramas.some((t) => t.bin && t.b0 === 0x11) && !B.tramas.some((t) => t.bin && t.b0 === 0x11), 'R2. ninguna trama de Ultra lleva la marca de aviso 0x11');
  // el latido: sin escribir nadie, siguen saliendo tramas de 1 KB
  A.tramas.length = 0; await espera(7000);
  const latidos = A.tramas.filter((t) => t.bin && t.d[41] === 2);
  comprueba(latidos.length >= 2 && latidos.every((t) => t.len === 41 + 13 + 16 + 1024), '4. el latido de relleno (aquí cada 2 s) sale solo, de 1 KB', latidos.map((t) => t.len));
  await A.evaluate(() => { document.activeElement && document.activeElement.blur(); }); await A.mouse.move(600, 450); await A.mouse.down(); await espera(300);
  await foto(A, '03-pc-chat-palabras'); await A.mouse.up();
  // «Seguridad y verificación»: las palabras, nada guardado, sin buzón
  await A.evaluate(() => document.querySelector('#cpalabras').click()); await espera(700);
  const hojaSeg = await A.evaluate(() => document.querySelector('#escudo-lista').textContent);
  comprueba(/Palabras de verificación/.test(hojaSeg) && /no tiene buzón/.test(hojaSeg) && /Nada guardado/.test(hojaSeg) && /PC con GUARDIANA/.test(hojaSeg) && /cbr=1/.test(hojaSeg), '3. «Seguridad y verificación» dice las palabras, nada guardado, sin buzón, cbr y el nivel');
  comprueba(/una trama de 1 KB por segundo/.test(hojaSeg) && !/latido de relleno cada 5 s/.test(hojaSeg), 'R2. y el ritmo que de verdad lleva: una trama de 1 KB por segundo', (hojaSeg.match(/Tamaño y ritmo.{0,160}/) || [''])[0]);
  comprueba(/historial del navegador/.test(hojaSeg) && /según lo dice su propio programa/.test(hojaSeg) && /no se envían ni el país de tu equipo ni tu nombre/.test(hojaSeg), 'R5/R8/R9. «Límites»: el historial, el nivel según cada programa, ni país ni nombre');
  comprueba(/la hace esta página, no el relé/.test(hojaSeg), 'R6. «Límites» dice que la puerta de Plus está en la página, no en el relé');
  comprueba(!/CNSA/.test(hojaSeg) && !(await A.evaluate(() => /CNSA/.test(document.body.innerText + ' ' + document.querySelector('#cconfianza').textContent))), '10. sin «CNSA» en «Seguridad y verificación», en la cabecera del chat ni en nada visible');
  await foto(A, '04-pc-seguridad');
  await A.click('#escudo-cerrar'); await espera(400);

  // ---- 7. archivos: recibo negable, comprobante a petición, nombre neutro, sin EXIF ----
  { const [ch] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
    await ch.setFiles(fotoPath); await espera(1500);
    const hoja = await A.evaluate(() => ({ abierta: document.querySelector('#h-envio').classList.contains('gc-abierta'), firmado: !document.querySelector('#envio-firmado').hidden, autor: document.querySelector('#envio-autor').hidden, neutro: !document.querySelector('#envio-neutro').hidden }));
    comprueba(hoja.abierta && hoja.firmado && hoja.autor && hoja.neutro, '7. al enviar una foto: la opción del comprobante firmado (apagada) y la nota del nombre neutro; sin aviso de autor', hoja);
    await foto(A, '05-pc-enviar-foto');
    await A.click('#envio-si'); await espera(4000);
    const mA = await A.evaluate(() => window.gcomPrueba.mensajes()), mB = await B.evaluate(() => window.gcomPrueba.mensajes());
    const fA = mA.find((m) => m.tipo === 'archivo'), fB = mB.find((m) => m.tipo === 'archivo');
    comprueba(fA && fA.nombre === 'foto-1.jpg' && fB && fB.nombre === 'foto-1.jpg', '7. la foto sale y llega con nombre neutro', [fA && fA.nombre, fB && fB.nombre]);
    comprueba(mA.some((m) => m.tipo === 'recibo' && /negable/.test(m.texto)) && !mA.some((m) => m.tipo === 'custodia') && !mB.some((m) => m.tipo === 'custodia'), '7. recibo negable de entrega, sin comprobante firmado', mA.filter((m) => m.tipo === 'recibo').map((m) => m.texto.slice(-60)));
    await B.evaluate(() => document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click())); await espera(800);
    const recibida = await B.evaluate((id) => window.gcomPrueba.archivo(id), fB.id);
    const bytes = recibida ? Buffer.from(recibida.b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64') : Buffer.alloc(0);
    comprueba(recibida && bytes.length > 0 && !bytes.toString('latin1').includes('Exif') && !bytes.toString('latin1').includes('GPS') && bytes[0] === 0xff && bytes[1] === 0xd8, '7. la foto llega sin el segmento EXIF (ni el GPS) y sigue siendo un JPEG', { bytes: bytes.length, nombre: recibida && recibida.nombre });
    // en Ultra, el viaje del archivo no lleva país en ningún lado (ni el de la zona horaria propia ni el que diga el otro)
    { const pa = (P) => P.evaluate(() => [...GuardianaCom.viajes.values()].map((v) => [v.paisMio || '', v.paisSuyo || '']));
      const xa = await pa(A), xb = await pa(B);
      comprueba(xa.length && xb.length && [...xa, ...xb].every(([m, s]) => !m && !s), 'fc5. en Ultra, el viaje del archivo no lleva país en ningún lado', { A: xa, B: xb }); }
    // la foto que no se puede volver a dibujar: en Ultra no sale (el original llevaría sus datos), y lo dice
    { const antes = (await A.evaluate(() => window.gcomPrueba.mensajes())).length;
      const [ch3] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
      await ch3.setFiles(rotaPath); await espera(1500);
      const av3 = await aviso(A), abierta = await A.evaluate(() => document.querySelector('#h-envio').classList.contains('gc-abierta')), despues = (await A.evaluate(() => window.gcomPrueba.mensajes())).length;
      comprueba(/no se puede limpiar/.test(av3) && !abierta && despues === antes, '7. una foto que no se puede limpiar no sale en Ultra, y lo dice', av3); }
    // R7: un SVG y un MP3 salen limpios (metadatos, comentarios, datos del programa de dibujo; etiquetas ID3), sin pedir nada más
    const recibe = async (nombreRe) => { await hasta(() => B.evaluate((re) => window.gcomPrueba.mensajes().some((m) => m.tipo === 'archivo' && m.dir === 'suya' && new RegExp(re).test(m.nombre) && ['recibido', 'entregado', 'leido'].includes(m.estado)), nombreRe), 20000);
      await B.evaluate(() => document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click())); await espera(500);
      const m = (await B.evaluate(() => window.gcomPrueba.mensajes())).filter((x) => x.tipo === 'archivo' && x.dir === 'suya' && new RegExp(nombreRe).test(x.nombre)).pop();
      const r = m ? await B.evaluate((id) => window.gcomPrueba.archivo(id), m.id) : null;
      return r ? Buffer.from(r.b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64') : Buffer.alloc(0); };
    for (const [ruta, re, mira, txt] of [[svgPath, '\\.svg$', (b) => { const x = b.toString('utf8'); return /<rect/.test(x) && !/Fulano/.test(x) && !/<metadata/i.test(x) && !/<!--/.test(x) && !/inkscape|sodipodi/i.test(x); }, 'R7. un SVG llega sin metadatos, comentarios ni datos del programa de dibujo'],
      [mp3Path, '\\.mp3$', (b) => b.length > 1000 && b[0] === 0xff && b[1] === 0xfb && !b.toString('latin1').includes('Fulano') && !b.toString('latin1').includes('ID3') && !b.toString('latin1').includes('APETAGEX') && !b.toString('latin1').includes('LYRICS') && b.length === 4096 && b.toString('latin1', b.length - 128, b.length - 125) !== 'TAG', 'R7. un MP3 llega sin sus etiquetas ID3, APEv2 ni Lyrics3 (ni las del principio ni las del final)']]) {
      const [chx] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
      await chx.setFiles(ruta); await espera(1500);
      const h = await A.evaluate(() => ({ autor: document.querySelector('#envio-autor').hidden, asi: document.querySelector('#envio-asi').hidden, enviar: !document.querySelector('#envio-si').disabled }));
      comprueba(h.autor && h.asi && h.enviar, txt.replace(/ llega.*/, '') + ': sin aviso y «Enviar» a punto (ya está limpio)', h);
      await A.click('#envio-si');
      const b = await recibe(re);
      comprueba(b.length > 0 && mira(b), txt, { bytes: b.length, inicio: b.toString('latin1', 0, 40) });
    }
    // S4: un SVG con una foto incrustada no sale «limpio»: el aviso y «Enviarlo así», como un documento
    { const [chs] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
      await chs.setFiles(svg2Path); await espera(1500);
      const h = await A.evaluate(() => ({ autor: !document.querySelector('#envio-autor').hidden, asi: !document.querySelector('#envio-asi').hidden, apagado: document.querySelector('#envio-si').disabled }));
      comprueba(h.autor && h.asi && h.apagado, 'S4. un SVG con una imagen incrustada no sale limpio: aviso y «Enviar» apagado hasta «Enviarlo así»', h);
      await A.click('#envio-no'); await espera(500); }
    // un documento (PDF): el aviso de lo que puede llevar dentro, y «Enviar» apagado hasta marcar «Enviarlo así»
    const [ch2] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
    await ch2.setFiles(docPath); await espera(1500);
    { const h = await A.evaluate(() => ({ autor: !document.querySelector('#envio-autor').hidden, asi: !document.querySelector('#envio-asi').hidden, apagado: document.querySelector('#envio-si').disabled, txt: document.querySelector('#envio-autor').textContent }));
      comprueba(h.autor && h.asi && h.apagado && /nombre de quien lo hizo/.test(h.txt), 'R7. con un PDF, el aviso de lo que puede llevar dentro, y «Enviar» apagado hasta «Enviarlo así»', h); }
    await A.click('#envio-asi'); await espera(200);
    comprueba(await A.evaluate(() => !document.querySelector('#envio-si').disabled && document.querySelector('#envio-asi').getAttribute('aria-pressed') === 'true'), 'R7. «Enviarlo así» enciende «Enviar»');
    await A.click('#envio-firmado'); await espera(200);
    comprueba(await A.evaluate(() => document.querySelector('#envio-firmado').getAttribute('aria-pressed') === 'true'), '7. «Solicitar comprobante firmado» se marca');
    await foto(A, '06-pc-enviar-pdf-firmado');
    await A.click('#envio-si'); await espera(1500);
    // velado (lectura discreta), lo dice debajo del velo; al mostrarlo, el sello y, R13, «Firmar» / «No firmar»: nada se firma solo
    comprueba(await hasta(() => B.evaluate(() => [...document.querySelectorAll('.gc-velada small')].some((s) => /con comprobante firmado/.test(s.textContent)) || [...document.querySelectorAll('.sello.firmado')].some((s) => /comprobante firmado/.test(s.textContent))), 8000), '7. la otra persona ve que se pide un comprobante firmado');
    comprueba(await hasta(() => B.evaluate(() => { document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click()); return !!document.querySelector('.firma-pide .firma-si'); }), 25000), 'R13. quien recibe ve «Firmar» y «No firmar»');
    await espera(2500);
    comprueba(!(await A.evaluate(() => window.gcomPrueba.mensajes().some((m) => m.tipo === 'custodia' && m.estado === 'firmado'))), 'R13. mientras no decide, nada se firma');
    await foto(B, '07a-pc-te-piden-firma');
    await B.click('.firma-pide .firma-si');
    comprueba(await hasta(() => A.evaluate(() => window.gcomPrueba.mensajes().some((m) => m.tipo === 'custodia' && m.estado === 'firmado')), 20000) && await hasta(() => B.evaluate(() => window.gcomPrueba.mensajes().some((m) => m.tipo === 'custodia' && m.estado === 'firmado')), 8000), '7. con «Firmar», el comprobante queda firmado por los dos equipos');
    // S3 (revisión independiente 2): el comprobante dice quién firma (las claves de la conversación), qué prueba y qué no
    { await A.evaluate(() => { const b = [...document.querySelectorAll('button')].filter((x) => x.textContent === 'Ver comprobante').pop(); if (b) b.click(); });
      let tx = ''; await hasta(async () => { tx = await A.evaluate(() => { const h = document.querySelector('#h-custodia.gc-abierta'); return h ? h.textContent : ''; }); return /Quién firma/.test(tx); }, 10000);
      comprueba(/Quién firma/.test(tx) && /no dicen quién es nadie/.test(tx) && /no prueban quién las tenía/.test(tx) && !/antes de enviar nada/.test(tx), 'S3. el comprobante dice quién firma, qué prueba y qué no', tx.slice(0, 160));
      await A.evaluate(() => { const x = document.querySelector('#h-custodia .vj-x'); if (x) x.click(); }); await espera(400); }
    const d = (await A.evaluate(() => window.gcomPrueba.mensajes())).find((m) => m.tipo === 'archivo' && m.firmado);
    comprueba(d && d.nombre === 'documento-1.pdf', '7. el documento también sale con nombre neutro', d && d.nombre);
    // R13: y con «No firmar», quien lo pidió lo ve como decisión de la otra persona
    { const [ch4] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
      await ch4.setFiles(doc2Path); await espera(1200); await A.click('#envio-asi'); await A.click('#envio-firmado'); await A.click('#envio-si');
      await hasta(() => B.evaluate(() => { document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click()); return !!document.querySelector('.firma-pide .firma-no'); }), 25000);
      await B.click('.firma-pide .firma-no');
      comprueba(await hasta(() => A.evaluate(() => window.gcomPrueba.mensajes().some((m) => m.tipo === 'custodia' && m.estado === 'rechazado' && /decidido no firmarlo/.test(m.texto + ' ' + JSON.stringify(m)))), 12000), 'R13. con «No firmar», quien lo pidió ve que la otra persona decidió no firmarlo');
      comprueba(await B.evaluate(() => [...document.querySelectorAll('.sello.firmado')].some((s) => /No has firmado/.test(s.textContent))), 'R13. y quien recibe lo ve en su mensaje'); }
    await foto(B, '07-pc-recibido');
  }

  // ---- 11. la llamada: palabras iguales, nivel, ritmo constante, clave cada minuto ----
  await llama(A, B, true);
  comprueba((await estadoLl(A)) === 'hablando' && (await estadoLl(B)) === 'hablando', '11. videollamada Ultra en marcha');
  const palLl = (P) => P.evaluate(() => ({ num: (document.querySelector('#ll-sas-num') || {}).textContent, vis: !document.querySelector('#ll-sas').hidden, t: document.querySelector('#ll-sas-t').textContent, nivel: document.querySelector('#ll-nivel').textContent, nivelVis: !document.querySelector('#ll-nivel').hidden, nivelTarjeta: (document.querySelector('#ll-sas-nivel') || {}).textContent || '', voz: GuardianaCom.llamada.voz, cambio: GuardianaCom.llamada.cambioActivo, imagen: GuardianaCom.llamada.imagen, pq: GuardianaCom.llamada.pq, cod: !document.querySelector('#ll-cod').hidden }));
  const la = await palLl(A), lb = await palLl(B);
  comprueba(la.vis && la.num === lb.num && la.num.split(' · ').length === 4 && la.t === 'Palabras de verificación', '3. en la llamada, las cuatro palabras iguales en las dos pantallas', [la.num, lb.num]);
  comprueba(la.nivelVis && /PC con GUARDIANA/.test(la.nivel) && /navegador del PC/.test(la.nivel), '3. y el nivel de cada lado', la.nivel);
  comprueba(/^Tu lado: PC con GUARDIANA\nOtro lado: navegador del PC\n\(cada uno, según su programa\)$/.test(la.nivelTarjeta) && /^Tu lado: navegador del PC\nOtro lado: PC con GUARDIANA\n\(cada uno, según su programa\)$/.test(lb.nivelTarjeta), '3. y también dentro de la tarjeta de las palabras, que tapa el de arriba (R8: según el programa de cada uno)', [la.nivelTarjeta, lb.nivelTarjeta]);
  comprueba(la.voz === 'ultra' && la.cambio && la.imagen === 'mosaico' && la.pq && !la.cod && lb.voz === 'ultra' && lb.cambio, '11. voz cambiada y mosaico puestos, capa postcuántica activa, sin la tarjeta del código', la);
  // cada sección de audio de las dos descripciones: cbr=1 y usedtx=0 en la de Opus; ninguna con la extensión del nivel de audio
  const secciones = await A.evaluate(() => { const pc = GuardianaCom.llamada.pcPrueba; return [pc.localDescription.sdp, pc.remoteDescription.sdp].map((d) => d.split(/\r\n(?=m=)/).filter((x) => /^m=audio /.test(x)).map((x) => ({ fmtp: (x.match(/a=fmtp:111 [^\r\n]*/) || [''])[0], nivel: /ssrc-audio-level/.test(x) }))); });
  const todas = secciones.flat();
  comprueba(todas.length >= 4 && todas.every((x) => /cbr=1/.test(x.fmtp) && /usedtx=0/.test(x.fmtp) && !x.nivel), '11. Opus con cbr=1 y usedtx=0 en cada sección de audio (voz y pista muda), sin «ssrc-audio-level»', todas);
  comprueba(!(await visible(A, '#ll-llevar')) && !(await visible(B, '#ll-llevar')), '11. en Ultra no se ofrece «Pasar al teléfono»');
  // el tamaño de los paquetes de la voz que salen: el mismo en cada ventana de 2 s
  const muestras = [];
  for (let i = 0; i < 4; i++) { muestras.push(await A.evaluate(async () => { const pc = GuardianaCom.llamada.pcPrueba; const s = pc.getSenders().find((x) => x.track && x.track.kind === 'audio' && x.track.enabled); if (!s) return null; const st = await s.getStats(); let r = null; st.forEach((x) => { if (x.type === 'outbound-rtp' && x.kind === 'audio') r = { b: x.bytesSent, p: x.packetsSent }; }); return r; })); await espera(2000); }
  const porPaquete = []; for (let i = 1; i < muestras.length; i++) if (muestras[i] && muestras[i - 1] && muestras[i].p > muestras[i - 1].p) porPaquete.push((muestras[i].b - muestras[i - 1].b) / (muestras[i].p - muestras[i - 1].p));
  comprueba(porPaquete.length >= 2 && Math.max(...porPaquete) - Math.min(...porPaquete) < 2, '11. los paquetes de audio que salen miden lo mismo (ritmo constante)', porPaquete.map((x) => +x.toFixed(1)));
  await A.evaluate(() => document.querySelector('.gc-llamada-cifrado').click()); await espera(600);
  const seg = await A.evaluate(() => document.querySelector('#ll-seg-l').textContent);
  comprueba(/cambia cada minuto/.test(seg), '11. «Seguridad de esta llamada»: la clave cambia cada minuto', seg.slice(0, 200));
  await A.mouse.move(683, 400); await espera(300);
  await foto(A, '08-pc-llamada');
  await A.evaluate(() => document.querySelector('#ll-sas-si').click()); await espera(800);
  comprueba(await A.evaluate(() => document.querySelector('#ll-sas-mini').textContent.startsWith('✓')), '3. «Sí, coinciden» pliega las palabras arriba con ✓');
  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);
  // R4: una oferta sin el compromiso de las palabras (aquí la quita la propia prueba, como haría quien está en medio): no se contesta
  { await A.evaluate(() => sessionStorage.setItem('gcom-prueba-sin-sas', '1'));
    const avisos = (P) => P.evaluate(() => { window.__avisos = window.__avisos || []; const e = document.querySelector('#aviso'); if (e && !e.hidden && !window.__avisos.includes(e.textContent)) window.__avisos.push(e.textContent); return window.__avisos.join(' | '); });
    await A.evaluate(() => document.querySelector('#llamar').click());
    const vio = await hasta(async () => /compromiso de las palabras/.test(await avisos(B)) && /compromiso de las palabras/.test(await avisos(A)), 10000);
    const libres = await hasta(async () => (await estadoLl(A)) === 'libre' && (await estadoLl(B)) === 'libre', 8000); // (tras «cerrando»)
    comprueba(vio && libres, 'R4. una oferta Ultra sin el compromiso de las palabras se rechaza y los dos lo ven', [await avisos(A), await avisos(B)]);
    await A.evaluate(() => sessionStorage.removeItem('gcom-prueba-sin-sas')); await espera(1500); }
  // R3: la capa postcuántica que no se mantiene (aquí, B con otra llave): la llamada se cuelga en los dos, nunca sigue en claro
  { await B.evaluate(() => sessionStorage.setItem('gcom-pq-roto', '1'));
    await llama(A, B, false);
    const fin = await hasta(async () => (await estadoLl(A)) === 'libre' && (await estadoLl(B)) === 'libre', 20000);
    const h = (P) => P.evaluate(() => ({ abierta: document.querySelector('#h-sinrebaja').classList.contains('gc-abierta'), por: document.querySelector('#sinrebaja-por').textContent }));
    const ha = await h(A), hb = await h(B);
    comprueba(fin && ha.abierta && hb.abierta && /no pudo mantenerse/.test(ha.por) && /no pudo mantenerse/.test(hb.por), 'R3. si la capa postcuántica no se mantiene, la llamada Ultra se cuelga en los dos y lo explica', { A: ha, B: hb });
    await foto(A, '08b-pc-capa-caida');
    for (const P of [A, B]) { try { await P.click('#sinrebaja-ok', { timeout: 3000 }); } catch (_) {} }
    await B.evaluate(() => sessionStorage.removeItem('gcom-pq-roto')); await espera(1000); }

  // ---- 5. sin buzón ----
  { await B.context().close(); await espera(1500);
    A.tramas.length = 0;
    await A.fill('#texto', 'Esto no debe ir a ningún buzón'); await A.click('#enviar'); await espera(3000);
    const sobres = A.tramas.filter((t) => t.bin && t.b0 === 3);
    const m = (await A.evaluate(() => window.gcomPrueba.mensajes())).filter((x) => x.tipo === 'texto' && x.dir === 'mia').pop();
    comprueba(sobres.length === 0 && m && m.estado === 'pendiente', '5. con la otra persona fuera, nada va al buzón del relé: el mensaje se queda pendiente', { sobres: sobres.length, estado: m && m.estado });
  }

  // ---- 8. nada guardado ----
  { await A.reload(); await espera(2500);
    const n = await A.evaluate(() => window.gcomPrueba.cuantas());
    const enBD = await A.evaluate(() => new Promise((res) => { const r = indexedDB.open('guardiana-com', 1); r.onsuccess = () => { const db = r.result; const t = db.transaction(['conv', 'msg', 'arch'], 'readonly'); const out = {}; let k = 3; for (const s of ['conv', 'msg', 'arch']) { const q = t.objectStore(s).count(); q.onsuccess = () => { out[s] = q.result; if (!--k) res(out); }; } }; r.onerror = () => res(null); }));
    comprueba(n === 0 && enBD && enBD.conv === 0 && enBD.msg === 0 && enBD.arch === 0, '8. tras recargar, la conversación Ultra no existe: ni en memoria ni en IndexedDB', { n, enBD });
    await A.context().close();
  }

  // ---- 6. sin rebaja ----
  { const C = await equipo(browser, 'C', { plan: 'plus', sinCapa: true }), D = await equipo(browser, 'D');
    const e2 = await invitaUltra(C); await acepta(D, e2); comprueba(await enChat(C) && await enChat(D), '6. C (sin Encoded Transforms) y D en Ultra');
    await C.evaluate(() => document.querySelector('#llamar').click()); await espera(1500);
    const h1 = await C.evaluate(() => ({ abierta: document.querySelector('#h-sinrebaja').classList.contains('gc-abierta'), por: document.querySelector('#sinrebaja-por').textContent, estado: GuardianaCom.llamada.estado }));
    comprueba(h1.abierta && /Este navegador no admite/.test(h1.por) && h1.estado === 'libre', '6. C no puede llamar: la hoja dice por qué y la llamada no empieza', h1);
    await foto(C, '09-pc-sin-rebaja');
    await C.click('#sinrebaja-ok'); await espera(400);
    // D llama a C: C rechaza y D ve «suyo»
    await D.evaluate(() => document.querySelector('#llamar').click()); await espera(3500);
    const h2 = await D.evaluate(() => ({ abierta: document.querySelector('#h-sinrebaja').classList.contains('gc-abierta'), por: document.querySelector('#sinrebaja-por').textContent, estado: GuardianaCom.llamada.estado }));
    const h3 = await C.evaluate(() => ({ abierta: document.querySelector('#h-sinrebaja').classList.contains('gc-abierta'), estado: GuardianaCom.llamada.estado }));
    comprueba(h2.abierta && /de la otra persona no admite/.test(h2.por) && h2.estado !== 'hablando' && h3.abierta && h3.estado === 'libre', '6. si D llama, C rechaza y los dos ven el motivo', { D: h2, C: h3 });
    // «Seguir en la Blindada»: una invitación «#i=» por el chat
    await D.click('#sinrebaja-blindada'); await espera(2500);
    comprueba(await hasta(() => C.evaluate(() => { document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click()); return [...document.querySelectorAll('.gc-burbuja a')].some((a) => /#i=[A-Za-z0-9_-]{43}/.test(a.href)); }), 6000), '6. «Seguir en la Blindada» manda por el chat una invitación Blindada «#i=»');
    comprueba((await D.evaluate(() => window.gcomPrueba.cuantas())) === 2, '6. y en D ya espera el chat Blindado nuevo (dos conversaciones)');
    await foto(C, '10-pc-seguir-blindada');
    await C.context().close(); await D.context().close();
  }

  // ---- R1. quien inicia se compromete con otra identidad (como quien está en medio y quisiera elegir las palabras después) ----
  { const X = await equipo(browser, 'X', { plan: 'plus', otraIdentidad: true }), Y = await equipo(browser, 'Y', { otraIdentidad: true });
    const e4 = await invitaUltra(X); await acepta(Y, e4);
    const al = (P) => P.evaluate(() => ({ vis: !document.querySelector('#alarma').hidden, por: document.querySelector('#alarma-por').textContent, n: window.gcomPrueba.cuantas() }));
    await hasta(async () => (await al(X)).vis && (await al(Y)).vis, 20000);
    const ax = await al(X), ay = await al(Y);
    comprueba(ax.vis && ay.vis && /compromiso previo/.test(ax.por) && /compromiso previo/.test(ay.por) && ax.n === 0 && ay.n === 0, 'R1. si el compromiso no cuadra con lo revelado: alarma en los dos y la conversación borrada', { X: ax, Y: ay });
    await foto(Y, '10b-pc-alarma-palabras');
    await X.context().close(); await Y.context().close();
  }

  // ---- A (revisión independiente 2, 5 nov 2026). Quien inicia no manda el compromiso de las palabras (como quien está en medio
  // y quisiera quitarlas): no hay sesión ni palabras; salta la alarma y la conversación se borra. Nunca «verificado» ----
  { const X = await equipo(browser, 'X2', { plan: 'plus', sinCw: true }), Y = await equipo(browser, 'Y2', { sinCw: true });
    const e6 = await invitaUltra(X); await acepta(Y, e6);
    let vioPalabras = false;
    const al = (P) => P.evaluate(() => ({ vis: !document.querySelector('#alarma').hidden, por: document.querySelector('#alarma-por').textContent, n: window.gcomPrueba.cuantas() }));
    await hasta(async () => { if ((await palabrasChat(X)).split(' · ').length === 4 || (await palabrasChat(Y)).split(' · ').length === 4) vioPalabras = true; return (await al(X)).vis || (await al(Y)).vis; }, 25000);
    const ax = await al(X), ay = await al(Y), a = ax.vis ? ax : ay;
    comprueba(!vioPalabras && (ax.vis || ay.vis) && /palabras de verificación/.test(a.por) && a.n === 0, 'A. sin el compromiso de las palabras: alarma y conversación borrada, nunca palabras', { X: ax, Y: ay, vioPalabras });
    await foto(ax.vis ? X : Y, '10c-pc-alarma-sin-compromiso');
    await X.context().close(); await Y.context().close();
  }

  // ---- B (revisión independiente 2). Quien inicia manda otra presentación con otro compromiso antes de revelar (como quien está
  // en medio y quisiera elegir entre varios): un solo compromiso por conversación, así que salta la alarma. Nunca «verificado» ----
  { const X = await equipo(browser, 'X3', { plan: 'plus', recompromete: true, revela: 6000 }), Y = await equipo(browser, 'Y3', { recompromete: true, revela: 6000 });
    const e7 = await invitaUltra(X); await acepta(Y, e7);
    let vioPalabras = false;
    const al = (P) => P.evaluate(() => ({ vis: !document.querySelector('#alarma').hidden, por: document.querySelector('#alarma-por').textContent, n: window.gcomPrueba.cuantas() }));
    await hasta(async () => { if ((await palabrasChat(X)).split(' · ').length === 4 || (await palabrasChat(Y)).split(' · ').length === 4) vioPalabras = true; return (await al(X)).vis && (await al(Y)).vis; }, 25000);
    const ax = await al(X), ay = await al(Y);
    comprueba(!vioPalabras && ax.vis && ay.vis && /compromiso previo/.test(ax.por) && /compromiso previo/.test(ay.por) && ax.n === 0 && ay.n === 0, 'B. otro compromiso antes de revelar: alarma y conversación borrada en los dos, nunca palabras', { X: ax, Y: ay, vioPalabras });
    await X.context().close(); await Y.context().close();
  }

  // ---- 9 y 10. teléfono: tapar al salir, claves borradas en segundo plano, pánico en el PC ----
  { const E = await equipo(browser, 'E', { plan: 'plus' }), M = await equipo(browser, 'M', { movil: true });
    const e3 = await invitaUltra(E); await acepta(M, e3); comprueba(await enChat(E) && await enChat(M), '10. el teléfono entra en Ultra');
    await espera(800);
    comprueba(await M.evaluate(() => { const ta = document.querySelector('#texto'); return ta.getAttribute('autocorrect') === 'off' && ta.getAttribute('autocapitalize') === 'off' && ta.getAttribute('spellcheck') === 'false' && ta.getAttribute('autocomplete') === 'off'; }), '10. en el teléfono, el campo sin corrector, autocompletar ni mayúsculas automáticas');
    comprueba(!(await M.evaluate(() => document.querySelector('#cm-panico').hidden)) && (await palabrasChat(M)) === (await palabrasChat(E)), '10. en el menú ⋯ está «Borrar y salir»; las palabras, las mismas que en el PC');
    await foto(M, '11-movil-chat');
    // a segundo plano: tapada al momento
    await M.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
    await espera(300);
    comprueba(await M.evaluate(() => { const t = document.querySelector('#captura-velo'); return !t.hidden && t.classList.contains('fuera'); }), '10. al pasar a segundo plano, la pantalla se tapa');
    await foto(M, '12-movil-tapada');
    const sesAntes = await M.evaluate(() => (GuardianaCom.convs.values().next().value.sesion || {}).sid);
    await espera(16500);
    const sinClaves = await M.evaluate(() => { const c = GuardianaCom.convs.values().next().value; return !c.sesion && c.sinClaves === true; });
    comprueba(sinClaves, '10. a los 15 s fuera de una llamada, las claves de la sesión se borran');
    await M.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
    comprueba(await hasta(() => M.evaluate(() => { const c = GuardianaCom.convs.values().next().value; return !!(c.sesion && c.sesion.confirmada); }), 12000), '10. al volver, se acuerdan claves nuevas');
    const sesDespues = await M.evaluate(() => (GuardianaCom.convs.values().next().value.sesion || {}).sid);
    comprueba(sesAntes && sesDespues && sesAntes !== sesDespues && (await M.evaluate(() => document.querySelector('#captura-velo').hidden)), '10. otra sesión distinta, y la pantalla destapada', [sesAntes, sesDespues]);
    await M.fill('#texto', 'Sigo aquí'); await M.click('#enviar'); await espera(1500);
    comprueba(await hasta(() => E.evaluate(() => !!document.querySelector('.gc-velada')), 5000), '10. y el chat sigue');
    // pánico en el PC: Esc dos veces
    await E.evaluate(() => document.activeElement && document.activeElement.blur());
    await E.keyboard.press('Escape'); await espera(300);
    comprueba(/Esc otra vez/.test(await aviso(E)), '9. el primer Esc avisa');
    await E.keyboard.press('Escape'); await espera(2500);
    comprueba(/127\.0\.0\.1:8080\/$/.test(E.url()) || /\/$/.test(new URL(E.url()).pathname), '9. el segundo Esc borra y sale a la portada', E.url());
    comprueba(await hasta(() => M.evaluate(() => window.gcomPrueba.cuantas() === 0), 6000), '9. el otro equipo recibe la orden de borrado');
    await foto(M, '13-movil-borrado');
    await E.context().close(); await M.context().close();
  }

  // ---- S1 y S6 (revisión independiente 2). S1: si el procesador de la voz cambiada no carga, la llamada sigue con la voz natural
  // y el botón lo dice. S6: si quien llama no revela su clave, quien contesta cuelga a los 10 s con la alarma, como en el chat ----
  { const S = await equipo(browser, 'S', { plan: 'plus', rompeVoz: true }), U = await equipo(browser, 'U');
    const e8 = await invitaUltra(S); await acepta(U, e8); await enChat(S); await enChat(U);
    await hasta(async () => (await palabrasChat(S)).split(' · ').length === 4, 12000);
    await llama(S, U, false);
    const v = await S.evaluate(() => ({ voz: GuardianaCom.llamada.voz, cambio: GuardianaCom.llamada.cambioActivo, boton: document.querySelector('#ll-grave').getAttribute('aria-pressed'), etiqueta: document.querySelector('#ll-grave').getAttribute('aria-label'), avisos: window.__av || [] }));
    comprueba(v.voz === 'natural' && !v.cambio && v.boton === 'false' && /desactivado/.test(v.etiqueta) && v.avisos.some((a) => /voz natural/.test(a)), 'S1. sin el procesador de la voz: sale la natural, el botón dice «desactivado» y avisa', v);
    await S.evaluate(() => document.querySelector('#ll-colgar').click()); await hasta(async () => (await estadoLl(S)) === 'libre' && (await estadoLl(U)) === 'libre', 8000); await espera(1500);
    await S.evaluate(() => sessionStorage.setItem('gcom-prueba-sin-revela', '1'));
    await llama(S, U, false);
    const al = (P) => P.evaluate(() => ({ vis: !document.querySelector('#alarma').hidden, por: document.querySelector('#alarma-por').textContent, n: window.gcomPrueba.cuantas() }));
    await hasta(async () => (await al(U)).vis, 25000);
    const au = await al(U), as = await al(S);
    const libres = await hasta(async () => (await estadoLl(U)) === 'libre' && (await estadoLl(S)) === 'libre', 5000); // (tras colgar, «cerrando» dura 0,7–1,5 s)
    comprueba(au.vis && /palabras de verificación/.test(au.por) && au.n === 0 && libres, 'S6. sin la revelación de quien llama, quien contesta cuelga a los 10 s con la alarma y la conversación se borra', { U: au, S: as });
    await foto(U, '14-pc-llamada-sin-palabras');
    await S.context().close(); await U.context().close();
  }

  // ---- R12. pánico durante una llamada Ultra: Esc dos veces cuelga, borra en los dos y sale ----
  { const G = await equipo(browser, 'G', { plan: 'plus' }), H = await equipo(browser, 'H');
    const e5 = await invitaUltra(G); await acepta(H, e5); comprueba(await enChat(G) && await enChat(H), 'R12. G y H en Ultra');
    await hasta(async () => (await palabrasChat(G)).split(' · ').length === 4, 10000);
    await llama(G, H, false);
    comprueba((await estadoLl(G)) === 'hablando', 'R12. llamada Ultra en marcha');
    await G.keyboard.press('Escape'); await espera(300);
    comprueba(/Esc otra vez/.test(await aviso(G)) && (await estadoLl(G)) === 'hablando', 'R12. en la llamada, el primer Esc avisa y no corta nada');
    await G.keyboard.press('Escape'); await espera(3000);
    comprueba(/127\.0\.0\.1:8080\/$/.test(G.url()) || /\/$/.test(new URL(G.url()).pathname), 'R12. el segundo Esc cuelga, borra y sale a la portada', G.url());
    comprueba(await hasta(async () => (await estadoLl(H)) === 'libre' && (await H.evaluate(() => window.gcomPrueba.cuantas())) === 0, 8000), 'R12. el otro equipo ve la llamada colgada y la conversación borrada');
    await G.context().close(); await H.context().close();
  }

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
