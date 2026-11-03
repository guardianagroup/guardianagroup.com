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
//  10. En el teléfono: la pantalla se tapa al pasar a segundo plano y, a los 15 s fuera de una llamada, las claves de la sesión se borran
//      y al volver se acuerdan otras.
//  11. Opus a ritmo constante: en la llamada Ultra, los paquetes de audio que salen tienen todos el mismo tamaño; en «Seguridad de esta
//      llamada», la clave cambia «cada minuto».
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
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
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
  const ctx = await browser.newContext({ viewport: x.movil ? { width: 390, height: 844 } : { width: 1366, height: 820 }, deviceScaleFactor: x.movil ? 2 : 1, isMobile: !!x.movil, hasTouch: !!x.movil, userAgent: x.movil ? IPHONE : PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((x) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); if (x.rota) sessionStorage.setItem('gcom-rota-ms', String(x.rota)); } catch (_) {}
    if (x.sinCapa) { try { delete window.RTCRtpScriptTransform; window.RTCRtpScriptTransform = undefined; } catch (_) {} }
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
  p.on('websocket', (ws) => { if (!/\/com$/.test(ws.url())) return; ws.on('framesent', (f) => { const d = f.payload; if (typeof d === 'string') p.tramas.push({ txt: d }); else p.tramas.push({ bin: true, len: d.length, b0: d[0], d }); }); });
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
const enChat = (P) => hasta(() => P.evaluate(() => /postcuántica|Postcuántica/.test(document.querySelector('#cconfianza').textContent)), 15000);
async function llama(A, B, video) {
  await A.evaluate((v) => document.querySelector(v ? '#videollamar' : '#llamar').click(), !!video);
  for (let i = 0; i < 40; i++) { await espera(250); if (await B.$('#ll-contestar:visible')) { await B.click('#ll-contestar'); break; } }
  await hasta(() => A.evaluate(() => GuardianaCom.llamada.estado === 'hablando'), 15000);
  await espera(3000);
}
const estadoLl = (P) => P.evaluate(() => GuardianaCom.llamada.estado);
// una foto JPEG mínima (1×1) con un segmento APP1 «Exif» con GPS, para ver que no llega
const JPEG_BASE = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==', 'base64');
function jpegConExif() {
  const exif = Buffer.concat([Buffer.from('Exif\0\0'), Buffer.from('MM\0\x2a\0\0\0\x08\0\x01\x88\x25\0\x04\0\0\0\x01\0\0\0\x1a\0\0\0\0GPS LATITUDE 40.4168 N, 3.7038 W, hecho con un telefono concreto')]);
  const app1 = Buffer.concat([Buffer.from([0xff, 0xe1, (exif.length + 2) >> 8, (exif.length + 2) & 255]), exif]);
  return Buffer.concat([JPEG_BASE.subarray(0, 2), app1, JPEG_BASE.subarray(2)]);
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gcom-ultra-'));
const fotoPath = path.join(tmp, 'IMG_20261103_mi-nombre.jpg'); fs.writeFileSync(fotoPath, jpegConExif());
const docPath = path.join(tmp, 'informe de mi nombre.pdf'); fs.writeFileSync(docPath, Buffer.concat([Buffer.from('%PDF-1.4\n% GUARDIANA prueba\n'), Buffer.alloc(300 * 1024, 7)]));

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });

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
  const A = await equipo(browser, 'A', { programa: 'plus', latido: 2, rota: 8000 }), B = await equipo(browser, 'B', { latido: 2, rota: 8000 });
  const enlace = await invitaUltra(A);
  comprueba(/\/chat\/#b=[A-Za-z0-9_-]{43}$/.test(enlace), '2. la invitación Ultra: solo el fragmento «#b=» con 256 bits', enlace.slice(-50));
  comprueba(await A.evaluate(() => (window.__pedidos || []).includes('/api/plan')), '1. para crearla, el programa contestó GET /api/plan con «plus»');
  await foto(A, '02-pc-invitacion');
  const secreto = enlace.split('#b=')[1];
  const lleva = (P) => P.tramas.some((t) => (t.txt && (t.txt.includes(secreto) || /"t":"invita"/.test(t.txt))) || (t.bin && Buffer.from(t.d).toString('latin1').includes(secreto)));
  await acepta(B, enlace);
  comprueba(await enChat(A) && await enChat(B), '3. los dos en la sesión Ultra');
  comprueba(!lleva(A) && !lleva(B), '2. ninguna trama hacia el relé lleva el secreto ni un código de invitación', A.tramas.filter((t) => t.txt).map((t) => t.txt.slice(0, 30)));
  await espera(1500);
  const pa = await palabrasChat(A), pb = await palabrasChat(B);
  comprueba(pa && pa === pb && pa.split(' · ').length === 4, '3. las cuatro palabras, las mismas en los dos chats', [pa, pb]);
  comprueba(/Tú: PC con GUARDIANA · Otro lado: navegador del PC/.test(await nivelChat(A)) && /Tú: navegador del PC · Otro lado: PC con GUARDIANA/.test(await nivelChat(B)), '3. el nivel de cada lado, en los dos', [await nivelChat(A), await nivelChat(B)]);
  // el texto llega; el relé solo ve bloques de 1 KB
  A.tramas.length = 0;
  await A.fill('#texto', 'Hola, esto es Ultra'); await A.click('#enviar'); await espera(1200);
  await A.fill('#texto', 'x'.repeat(1500)); await A.click('#enviar'); await espera(1200);
  const msgs = A.tramas.filter((t) => t.bin && t.d[41] === 2);
  const tam = msgs.map((t) => t.len);
  comprueba(msgs.length >= 2 && tam.every((n) => (n - 41 - 13 - 16) % 1024 === 0 && n > 41 + 29), '4. cada mensaje sale al relé en bloques de 1 KB (41 de cabecera de relé + 13 + 16 + k·1024)', tam);
  comprueba(await B.evaluate(() => !!document.querySelector('.gc-velada')), '4. en el otro lado llega velado (lectura discreta)');
  await B.evaluate(() => document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click())); await espera(800);
  comprueba(await B.evaluate(() => document.body.textContent.includes('Hola, esto es Ultra')), '4. y se lee al mostrarlo');
  // el latido: sin escribir nadie, siguen saliendo tramas de 1 KB
  A.tramas.length = 0; await espera(7000);
  const latidos = A.tramas.filter((t) => t.bin && t.d[41] === 2);
  comprueba(latidos.length >= 2 && latidos.every((t) => t.len === 41 + 13 + 16 + 1024), '4. el latido de relleno (aquí cada 2 s) sale solo, de 1 KB', latidos.map((t) => t.len));
  await A.evaluate(() => { document.activeElement && document.activeElement.blur(); }); await A.mouse.move(600, 450); await A.mouse.down(); await espera(300);
  await foto(A, '03-pc-chat-palabras'); await A.mouse.up();
  // «Seguridad y verificación»: las palabras, nada guardado, sin buzón
  await A.evaluate(() => document.querySelector('#cpalabras').click()); await espera(700);
  const hojaSeg = await A.evaluate(() => document.querySelector('#escudo-lista').textContent);
  comprueba(/Palabras de verificación/.test(hojaSeg) && /sin buzón/i.test(hojaSeg) && /Nada guardado/.test(hojaSeg) && /PC con GUARDIANA/.test(hojaSeg) && /cbr=1/.test(hojaSeg), '3. «Seguridad y verificación» dice las palabras, nada guardado, sin buzón, cbr y el nivel');
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
    // comprobante firmado a petición, con un documento (y el aviso del autor)
    const [ch2] = await Promise.all([A.waitForEvent('filechooser'), A.evaluate(() => document.querySelector('#archivo').click())]);
    await ch2.setFiles(docPath); await espera(1500);
    comprueba(!(await A.evaluate(() => document.querySelector('#envio-autor').hidden)), '7. con un PDF, el aviso de que puede llevar el nombre del autor');
    await A.click('#envio-firmado'); await espera(200);
    comprueba(await A.evaluate(() => document.querySelector('#envio-firmado').getAttribute('aria-pressed') === 'true'), '7. «Solicitar comprobante firmado» se marca');
    await foto(A, '06-pc-enviar-pdf-firmado');
    await A.click('#envio-si'); await espera(1500);
    comprueba(await hasta(() => B.evaluate(() => [...document.querySelectorAll('.sello.firmado')].some((s) => /comprobante firmado/.test(s.textContent))), 6000), '7. la otra persona ve que se pide un comprobante firmado');
    comprueba(await hasta(() => A.evaluate(() => window.gcomPrueba.mensajes().some((m) => m.tipo === 'custodia' && m.estado === 'firmado')), 20000) && await hasta(() => B.evaluate(() => window.gcomPrueba.mensajes().some((m) => m.tipo === 'custodia' && m.estado === 'firmado')), 8000), '7. el comprobante queda firmado por los dos equipos');
    const d = (await A.evaluate(() => window.gcomPrueba.mensajes())).find((m) => m.tipo === 'archivo' && m.firmado);
    comprueba(d && d.nombre === 'documento-1.pdf', '7. el documento también sale con nombre neutro', d && d.nombre);
    await B.evaluate(() => document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click())); await espera(600);
    await foto(B, '07-pc-recibido');
  }

  // ---- 11. la llamada: palabras iguales, nivel, ritmo constante, clave cada minuto ----
  await llama(A, B, true);
  comprueba((await estadoLl(A)) === 'hablando' && (await estadoLl(B)) === 'hablando', '11. videollamada Ultra en marcha');
  const palLl = (P) => P.evaluate(() => ({ num: (document.querySelector('#ll-sas-num') || {}).textContent, vis: !document.querySelector('#ll-sas').hidden, t: document.querySelector('#ll-sas-t').textContent, nivel: document.querySelector('#ll-nivel').textContent, nivelVis: !document.querySelector('#ll-nivel').hidden, voz: GuardianaCom.llamada.voz, cambio: GuardianaCom.llamada.cambioActivo, imagen: GuardianaCom.llamada.imagen, pq: GuardianaCom.llamada.pq, cod: !document.querySelector('#ll-cod').hidden }));
  const la = await palLl(A), lb = await palLl(B);
  comprueba(la.vis && la.num === lb.num && la.num.split(' · ').length === 4 && la.t === 'Palabras de verificación', '3. en la llamada, las cuatro palabras iguales en las dos pantallas', [la.num, lb.num]);
  comprueba(la.nivelVis && /PC con GUARDIANA/.test(la.nivel) && /navegador del PC/.test(la.nivel), '3. y el nivel de cada lado', la.nivel);
  comprueba(la.voz === 'ultra' && la.cambio && la.imagen === 'mosaico' && la.pq && !la.cod && lb.voz === 'ultra' && lb.cambio, '11. voz cambiada y mosaico puestos, capa postcuántica activa, sin la tarjeta del código', la);
  const sdp = await A.evaluate(() => { const pc = GuardianaCom.llamada.pcPrueba; return (pc.remoteDescription.sdp.match(/a=fmtp:\d+ [^\r\n]*/) || [''])[0]; });
  comprueba(/cbr=1/.test(sdp) && /usedtx=0/.test(sdp), '11. Opus con cbr=1 y usedtx=0 en la descripción', sdp);
  // el tamaño de los paquetes de audio que salen: el mismo en cada ventana de 2 s
  const muestras = [];
  for (let i = 0; i < 4; i++) { muestras.push(await A.evaluate(async () => { const pc = GuardianaCom.llamada.pcPrueba; const st = await pc.getStats(); let r = null; st.forEach((x) => { if (x.type === 'outbound-rtp' && x.kind === 'audio' && !r) r = { b: x.bytesSent, p: x.packetsSent }; }); return r; })); await espera(2000); }
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

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
