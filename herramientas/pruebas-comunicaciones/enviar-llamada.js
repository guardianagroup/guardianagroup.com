// «Enviar» en la llamada del teléfono (dueño, 2 Nov 2026, 16:37: «incluye también lo de enviar la foto, la ubicación y archivos en la
// llamada del móvil. Correcto, sí.»). A (PC) y B (PC) en videollamada; A la pasa a su iPhone (T, 390 × 844). Entonces:
//   0. En la llamada PC ↔ PC (por el chat) no sale «Enviar». En T sí, con los demás botones y sin apretarlos; en el PC de B, también.
//   1. El menú: «Foto», «Ubicación» y «Archivo».
//   2. Foto: T elige una foto con datos ocultos (EXIF con el GPS y una marca); B la ve en grande, sin esos datos, y la guarda.
//   3. Ubicación: T (ubicación simulada) la confirma; B ve las coordenadas, la precisión y «Abrir en el mapa» (OpenStreetMap en el PC).
//   4. Archivo: T manda un archivo de varios trozos; B lo guarda y es idéntico.
//   5. Al revés: B (sin permiso de ubicación: lo dice; con permiso: sale) manda su ubicación y un archivo a T; en el iPhone, «Abrir en
//      el mapa» va a Mapas (maps.apple.com).
//   6. B pasa su llamada a su Android (U, 412 × 915): T y U, los dos en el teléfono. U manda una foto a T (en grande en el iPhone) y un
//      archivo; T manda su ubicación a U («geo:» en Android).
//   7. U cuelga: en T lo recibido se suelta; en los teléfonos, nada en la base de datos ni en el almacenamiento del navegador.
// Uso: node enviar-llamada.js [carpeta de capturas]
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const OUT = process.argv[2] || path.join(__dirname, 'enviar-llamada');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const BOGOTA = { latitude: 4.609712, longitude: -74.081752, accuracy: 12 };
const MEDELLIN = { latitude: 6.244203, longitude: -75.581237, accuracy: 35 };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, tipo, nombre, geo) {
  const pc = tipo === 'pc';
  const ctx = await browser.newContext({
    viewport: pc ? { width: 1280, height: 800 } : tipo === 'android' ? { width: 412, height: 915 } : { width: 390, height: 844 },
    deviceScaleFactor: pc ? 1 : tipo === 'android' ? 2.625 : 3, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : tipo === 'android' ? ANDROID : IPHONE,
    locale: 'es-CO', permissions: ['microphone', 'camera'].concat(geo ? ['geolocation'] : []), geolocation: geo || undefined, acceptDownloads: true,
  });
  await ctx.addInitScript((safari) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    window.__copiados = []; try { navigator.clipboard.writeText = (y) => { window.__copiados.push(String(y)); return Promise.resolve(); }; } catch (_) {}
    if (safari) { try { Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined }); } catch (_) {} }
  }, tipo === 'iphone');
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  // la política de seguridad de la página (CSP) tampoco puede quejarse de nada durante la llamada
  p.on('console', (m) => { const x = m.text(); if (/Refused to|Content Security Policy/i.test(x)) { console.log('[' + nombre + '] CSP', x.slice(0, 200)); fallos.push('CSP ' + nombre); } });
  return { p, ctx };
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(300); } return false; };
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const envios = (P) => P.evaluate(() => (window.gcomPruebaEnvios ? window.gcomPruebaEnvios() : []));
const uno = async (P, f) => (await envios(P)).find(f);
const espEnvio = (P, f, ms) => hasta(async () => !!(await uno(P, f)), ms || 20000);
// la tarjeta de un envío (por su id): título, detalle, botones y enlaces
const tarjeta = (P, id) => P.evaluate((id) => {
  const e = document.querySelector('#ll-envios .ll-env[data-id="' + id + '"]'); if (!e) return null;
  const r = e.getBoundingClientRect();
  return { titulo: e.querySelector('.ll-env-txt b').textContent, detalle: e.querySelector('.ll-env-txt small').textContent.replace(/\u00a0/g, ' '), botones: [...e.querySelectorAll('.ll-env-acc .ll-env-b')].map((b) => b.textContent), enlaces: [...e.querySelectorAll('a.ll-env-b')].map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target') || '' })), caja: { x: r.left, y: r.top, w: r.width, h: r.height } };
}, id);
// pulsa el botón de la tarjeta de un envío que diga ese texto
const pulsaEnTarjeta = (P, id, txt) => P.evaluate(([id, txt]) => {
  const e = document.querySelector('#ll-envios .ll-env[data-id="' + id + '"]'); if (!e) return false;
  const b = [...e.querySelectorAll('.ll-env-b')].find((x) => x.textContent === txt); if (!b) return false; b.click(); return true;
}, [id, txt]);
// la barra de botones: cada botón visible, su sitio y el de su nombre
const barra = (P) => P.evaluate(() => [...document.querySelectorAll('#ll-botones > .gc-llamada-boton')].filter((b) => !b.hidden && getComputedStyle(b).display !== 'none' && b.getClientRects().length).map((b) => {
  const r = b.querySelector('button').getBoundingClientRect(), s = b.querySelector('span').getBoundingClientRect();
  return { n: b.querySelector('span').textContent.trim(), x: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), y: Math.round(r.top), sx: Math.round(s.left), sr: Math.round(s.right), sb: Math.round(s.bottom) };
}));
function barraBien(b, ancho, alto) {
  if (!b.length) return false;
  for (let i = 0; i < b.length; i++) {
    if (b[i].x < 0 || b[i].r > ancho || b[i].sx < 0 || b[i].sr > ancho || b[i].sb > alto) return false;
    if (i && (b[i].x - b[i - 1].r < 6 || b[i].sx < b[i - 1].sr)) return false;
  }
  return true;
}
// una foto JPEG con datos ocultos: EXIF con «Make» (la marca de la prueba) y el GPS (40°26'46" N, 79°58'56" W)
const MARCA = 'GUARDIANA-PRUEBA-MARCA';
function conExif(jpeg) {
  const be16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; }, be32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32BE(n); return b; };
  const ent = (tag, tipo, n, v) => Buffer.concat([be16(tag), be16(tipo), be32(n), Buffer.isBuffer(v) ? v : be32(v)]);
  const make = Buffer.from(MARCA + '\0', 'ascii');
  // TIFF: cabecera (8) + IFD0 (2 + 2×12 + 4 = 30) → 38; GPS IFD (2 + 4×12 + 4 = 54) → 92; Make (23) → 115; dos coordenadas (3×8 cada una)
  const ifd0 = 8, gps = 38, oMake = 92, oLat = oMake + make.length, oLon = oLat + 24;
  const rac = (a, b, c) => Buffer.concat([be32(a), be32(1), be32(b), be32(1), be32(c), be32(1)]);
  const tiff = Buffer.concat([
    Buffer.from('MM\0*', 'binary'), be32(ifd0),
    be16(2), ent(0x010f, 2, make.length, oMake), ent(0x8825, 4, 1, gps), be32(0),
    be16(4), ent(1, 2, 2, Buffer.from('N\0\0\0', 'binary')), ent(2, 5, 3, oLat), ent(3, 2, 2, Buffer.from('W\0\0\0', 'binary')), ent(4, 5, 3, oLon), be32(0),
    make, rac(40, 26, 46), rac(79, 58, 56),
  ]);
  const app1 = Buffer.concat([Buffer.from([0xff, 0xe1]), be16(2 + 6 + tiff.length), Buffer.from('Exif\0\0', 'binary'), tiff]);
  return Buffer.concat([jpeg.subarray(0, 2), app1, jpeg.subarray(2)]);
}
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
// los bytes de lo que se ve en grande (la página no deja leer un «blob:» con fetch: la política de seguridad no lo permite)
const bytesDeImg = (P) => P.evaluate(async () => { const id = document.querySelector('#ll-ver').dataset.id; return id ? window.gcomPruebaEnvioBytes(id) : null; });
const deB64u = (s) => Buffer.from(String(s || '').replace(/-/g, '+').replace(/_/g, '/'), 'base64');
async function pasa(P, Tel) {
  await P.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(800);
  const dir = await P.evaluate(() => document.querySelector('#llevar-qr').dataset.url);
  await Tel.goto(String(dir).replace('https://guardianagroup.com', 'http://127.0.0.1:8080'));
}
// elige en el menú de «Enviar» y, si abre el selector del teléfono, le da el archivo
// (en la videollamada los botones se esconden a los 3 s sin tocar nada: primero se despiertan, como con un toque en la pantalla)
const despierta = (P) => P.evaluate(() => { const c = document.querySelector('#llamada'); c.dispatchEvent(new Event('pointermove')); });
async function envia(P, que, archivo) {
  await despierta(P); await espera(120);
  await P.click('#ll-enviar'); await espera(250);
  if (!archivo) { await P.click('.ll-env-op[data-que="' + que + '"]'); return; }
  const [fc] = await Promise.all([P.waitForEvent('filechooser', { timeout: 5000 }), P.click('.ll-env-op[data-que="' + que + '"]')]);
  await fc.setFiles(archivo);
}
async function guarda(P, accion) {
  const [d] = await Promise.all([P.waitForEvent('download', { timeout: 8000 }), accion()]);
  const ruta = await d.path(); return { nombre: d.suggestedFilename(), datos: fs.readFileSync(ruta) };
}

(async () => {
  // (con el idioma del sistema en UTF-8: si no, Chromium en Linux guarda «presupuesto-señal.pdf» como «download», como cualquier nombre con «ñ»)
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'], env: Object.assign({}, process.env, { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' }) });
  // la foto de prueba (1600 × 1200, con algo de ruido para que ocupe varios trozos) y un archivo de cuatro trozos
  let foto;
  {
    const { p: G, ctx } = await equipo(browser, 'pc', 'G');
    await G.goto('about:blank');
    const b64 = await G.evaluate(async () => {
      const c = document.createElement('canvas'); c.width = 1600; c.height = 1200; const g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 1600, 1200); gr.addColorStop(0, '#1E3A58'); gr.addColorStop(1, '#9CC3E4'); g.fillStyle = gr; g.fillRect(0, 0, 1600, 1200);
      const im = g.getImageData(0, 0, 1600, 1200); for (let i = 0; i < im.data.length; i += 4) { const r = (Math.random() * 40) | 0; im.data[i] += r; im.data[i + 1] += r; im.data[i + 2] += r; } g.putImageData(im, 0, 0);
      g.fillStyle = '#F4F6F8'; g.font = 'bold 120px sans-serif'; g.fillText('GUARDIANA', 360, 560); g.font = '64px sans-serif'; g.fillText('foto de prueba', 520, 680);
      const bl = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9)); const u = new Uint8Array(await bl.arrayBuffer()); let s = ''; for (let k = 0; k < u.length; k += 32768) s += String.fromCharCode.apply(null, u.subarray(k, k + 32768)); return btoa(s);
    });
    foto = conExif(Buffer.from(b64, 'base64'));
    await ctx.close();
  }
  comprueba(foto.includes(Buffer.from(MARCA)) && foto.includes(Buffer.from('Exif\0\0', 'binary')), '·  la foto de prueba lleva EXIF con el GPS y la marca', { bytes: foto.length });
  const archivo = crypto.randomBytes(700 * 1024 + 123);
  const archivo2 = Buffer.from('Informe de prueba de GUARDIANA.\n'.repeat(400));

  const { p: A } = await equipo(browser, 'pc', 'A'), { p: B, ctx: ctxB } = await equipo(browser, 'pc', 'B');
  await B.goto(URL0); await espera(1500);
  await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B (PC) en videollamada');
  await espera(1500);
  comprueba(!(await visible(A, '#ll-enviar-caja')) && !(await visible(B, '#ll-enviar-caja')), '0. en la llamada PC ↔ PC (por el chat) no sale «Enviar»');

  // ---- A pasa la llamada a su iPhone (T) ----
  const { p: T } = await equipo(browser, 'iphone', 'T', BOGOTA);
  await pasa(A, T);
  comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(A)) === 'libre' && (await estado(B)) === 'hablando', 30000), '0. T (iPhone) habla con B');
  comprueba(await hasta(() => visible(T, '#ll-enviar'), 8000), '0. en T sale «Enviar»');
  comprueba(await hasta(() => visible(B, '#ll-enviar'), 8000), '0. y en el PC de B, que habla con el teléfono, también');
  await espera(2000);
  // quitar el código de seguridad grande para ver la pantalla (se pliega igual a los 30 s)
  for (const P of [T, B]) await P.evaluate(() => { const b = document.querySelector('#ll-cod-si'); if (b && !b.closest('[hidden]')) b.click(); });
  await espera(600);
  {
    const b = await barra(T);
    comprueba(b.map((x) => x.n).join(' · ') === 'Compartir pantalla · Girar · Enviar · Volver al PC · Colgar', '0. en T, los botones: ' + b.map((x) => x.n).join(' · '));
    comprueba(barraBien(b, 390, 844) && b.every((x) => x.w === 60), '0. en 390 px caben los cinco, de 60 px, sin pisarse ni ellos ni sus nombres', b.map((x) => [x.n, x.x, x.r, x.sx, x.sr]));
    await T.screenshot({ path: path.join(OUT, '1-tel-boton.png') });
    const bb = await barra(B);
    comprueba(bb.some((x) => x.n === 'Enviar') && barraBien(bb, 1280, 800), '0. en el PC, «Enviar» en la barra: ' + bb.map((x) => x.n).join(' · '));
    await B.screenshot({ path: path.join(OUT, '0-pc-boton.png') });
  }
  // ---- 1. el menú ----
  await despierta(T); await espera(120); await T.click('#ll-enviar'); await espera(400);
  {
    const m = await T.evaluate(() => { const m = document.querySelector('#ll-enviar-menu'), r = m.getBoundingClientRect(), bar = document.querySelector('#ll-botones').getBoundingClientRect(); return { abierto: !m.hidden, ops: [...m.querySelectorAll('.ll-env-op b')].map((b) => b.textContent), notas: [...m.querySelectorAll('.ll-env-op small')].map((b) => b.textContent), x: r.left, r: r.right, abajo: r.bottom, barra: bar.top, exp: document.querySelector('#ll-enviar').getAttribute('aria-expanded') }; });
    comprueba(m.abierto && m.ops.join(' · ') === 'Foto · Ubicación · Archivo' && m.exp === 'true', '1. el menú: ' + m.ops.join(' · '), m.notas);
    comprueba(m.x >= 0 && m.r <= 390 && m.abajo <= m.barra, '1. dentro de la pantalla y encima de los botones', { x: m.x, r: m.r, abajo: m.abajo, barra: m.barra });
    await T.screenshot({ path: path.join(OUT, '1-tel-menu.png') });
    await T.mouse.click(195, 160); await espera(300);
    comprueba(await T.evaluate(() => document.querySelector('#ll-enviar-menu').hidden), '1. un toque fuera lo cierra');
  }
  // ---- 2. la foto ----
  await envia(T, 'foto', { name: 'IMG_0042.JPG', mimeType: 'image/jpeg', buffer: foto });
  comprueba(await espEnvio(B, (x) => x.dir === 'llega' && x.que === 'foto' && x.estado === 'hecho', 30000), '2. B recibe la foto');
  comprueba(await hasta(() => T.evaluate(() => window.gcomPruebaEnvios().some((x) => x.dir === 'sale' && x.que === 'foto' && x.estado === 'hecho')), 10000), '2. y en T queda «Foto enviada»');
  {
    const it2 = await uno(T, (x) => x.dir === 'sale' && x.que === 'foto'), tt = it2 && await tarjeta(T, it2.id);
    comprueba(tt && tt.titulo === 'Foto enviada' && /^\d+ KB$/.test(tt.detalle), '2. en T, la tarjeta «Foto enviada» (con la foto ya limpia)', tt && [tt.titulo, tt.detalle]);
    await T.screenshot({ path: path.join(OUT, '2-tel-foto-enviada.png') });
  }
  {
    const v = await B.evaluate(() => { const v = document.querySelector('#ll-ver'), i = document.querySelector('#ll-ver-img'), r = i.getBoundingClientRect(); return { abierto: !v.hidden, w: i.naturalWidth, h: i.naturalHeight, area: r.width * r.height, titulo: document.querySelector('#ll-ver-t').textContent, guardar: document.querySelector('#ll-ver-guardar').textContent }; });
    comprueba(v.abierto && v.w === 1600 && v.h === 1200 && v.area > 1280 * 800 * 0.5 && v.titulo === 'Foto recibida' && v.guardar === 'Guardar', '2. en B, la foto en grande (con «Guardar»)', v);
    const recibida = deB64u(await bytesDeImg(B));
    comprueba(recibida.length > 0 && !recibida.includes(Buffer.from(MARCA)) && !recibida.includes(Buffer.from('Exif\0\0', 'binary')) && !recibida.includes(Buffer.from([0xff, 0xe1])), '2. sin los datos ocultos: ni EXIF ni GPS ni la marca', { enviada: foto.length, recibida: recibida.length });
    await B.screenshot({ path: path.join(OUT, '2-pc-foto.png') });
    const g = await guarda(B, () => B.click('#ll-ver-guardar'));
    comprueba(/^foto-\d{8}-\d{6}\.jpg$/.test(g.nombre) && sha(g.datos) === sha(recibida), '2. «Guardar»: se descarga la misma foto', g.nombre);
    await B.click('#ll-ver-cerrar'); await espera(300);
    const it = await uno(B, (x) => x.dir === 'llega' && x.que === 'foto'), tj = await tarjeta(B, it.id);
    comprueba(tj && tj.titulo === 'Foto recibida' && tj.botones.join(' · ') === 'Ver · Guardar', '2. al cerrarla, queda su tarjeta: «Foto recibida» con «Ver» y «Guardar»', tj && [tj.titulo, tj.botones]);
    comprueba(await B.evaluate(() => /al terminar la llamada/.test((document.querySelector('.ll-envios-nota') || {}).textContent || '')), '2. y la nota: se borra al terminar la llamada, salvo lo que guardes');
  }
  // ---- 3. la ubicación ----
  await envia(T, 'ubicacion');
  comprueba(await espEnvio(T, (x) => x.dir === 'sale' && x.que === 'ubicacion' && x.estado === 'confirma', 15000), '3. T: se pide la ubicación y se enseña antes de enviarla');
  {
    const it = await uno(T, (x) => x.dir === 'sale' && x.que === 'ubicacion'), tj = await tarjeta(T, it.id);
    comprueba(tj.titulo === '¿Enviar tu ubicación?' && /^4\.60971, -74\.08175 · ±12 m$/.test(tj.detalle) && tj.botones.join(' · ') === 'Cancelar · Enviar', '3. «¿Enviar tu ubicación?» con las coordenadas y la precisión', [tj.titulo, tj.detalle, tj.botones]);
    comprueba(!(await uno(B, (x) => x.que === 'ubicacion')), '3. antes de confirmar, a B no le ha llegado nada');
    await T.screenshot({ path: path.join(OUT, '3-tel-ubicacion-confirma.png') });
    await pulsaEnTarjeta(T, it.id, 'Enviar');
  }
  comprueba(await espEnvio(B, (x) => x.dir === 'llega' && x.que === 'ubicacion' && x.estado === 'hecho', 15000), '3. B recibe la ubicación');
  {
    const it = await uno(B, (x) => x.dir === 'llega' && x.que === 'ubicacion'), tj = await tarjeta(B, it.id);
    comprueba(tj.titulo === 'Ubicación recibida' && tj.detalle === '4.60971, -74.08175 · ±12 m', '3. en B: «Ubicación recibida», coordenadas y precisión', [tj.titulo, tj.detalle]);
    comprueba(tj.enlaces.length === 1 && tj.enlaces[0].href === 'https://www.openstreetmap.org/?mlat=4.60971&mlon=-74.08175#map=17/4.60971/-74.08175' && tj.enlaces[0].target === '_blank', '3. «Abrir en el mapa»: OpenStreetMap en otra pestaña (en el PC)', tj.enlaces);
    comprueba(!(await B.evaluate(() => [...document.querySelectorAll('img, iframe')].some((x) => /openstreetmap|maps\.apple|tile/.test(x.src || '')))), '3. la página no carga ningún mapa');
    comprueba(await hasta(async () => { const x = await uno(T, (y) => y.dir === 'sale' && y.que === 'ubicacion'); return x && x.estado === 'hecho'; }, 8000), '3. y en T, «Ubicación enviada»');
    await B.screenshot({ path: path.join(OUT, '3-pc-ubicacion.png') });
  }
  // ---- 4. un archivo ----
  await envia(T, 'archivo', { name: 'presupuesto-señal.pdf', mimeType: 'application/pdf', buffer: archivo });
  comprueba(await espEnvio(B, (x) => x.dir === 'llega' && x.que === 'archivo' && x.estado === 'hecho', 30000), '4. B recibe el archivo');
  {
    const it = await uno(B, (x) => x.dir === 'llega' && x.que === 'archivo'), tj = await tarjeta(B, it.id);
    comprueba(tj.titulo === 'Archivo recibido' && /^presupuesto-señal\.pdf · 700 KB$/.test(tj.detalle) && tj.botones.includes('Guardar'), '4. «Archivo recibido» con su nombre, su tamaño y «Guardar»', [tj.titulo, tj.detalle, tj.botones]);
    await B.screenshot({ path: path.join(OUT, '4-pc-archivo.png') });
    const g = await guarda(B, () => pulsaEnTarjeta(B, it.id, 'Guardar'));
    comprueba(g.nombre === 'presupuesto-señal.pdf' && sha(g.datos) === sha(archivo), '4. «Guardar»: el mismo archivo, byte a byte (4 trozos)', { nombre: g.nombre, bytes: g.datos.length });
    comprueba(await hasta(async () => { const x = await uno(T, (y) => y.dir === 'sale' && y.que === 'archivo'); return x && x.estado === 'hecho'; }, 8000), '4. y en T, «Archivo enviado»');
    await T.screenshot({ path: path.join(OUT, '4-tel-enviados.png') });
  }
  // ---- 5. al revés: del PC al iPhone ----
  comprueba(await hasta(async () => !(await envios(T)).some((x) => x.dir === 'sale' && x.estado === 'hecho'), 14000), '5. en T, las tarjetas de lo enviado se van solas a los pocos segundos');
  {
    await despierta(B); await espera(120); await B.click('#ll-enviar'); await espera(400);
    const m = await B.evaluate(() => { const m = document.querySelector('#ll-enviar-menu'), r = m.getBoundingClientRect(), b = document.querySelector('#ll-enviar').getBoundingClientRect(), bar = document.querySelector('#ll-botones').getBoundingClientRect(); return { abierto: !m.hidden, centro: Math.round(r.left + r.width / 2), boton: Math.round(b.left + b.width / 2), abajo: r.bottom, barra: bar.top }; });
    comprueba(m.abierto && Math.abs(m.centro - m.boton) < 4 && m.abajo <= m.barra, '5. en el PC, el menú encima de «Enviar»', m);
    await B.screenshot({ path: path.join(OUT, '0-pc-menu.png') });
    await B.keyboard.press('Escape'); await espera(200);
    comprueba(await B.evaluate(() => document.querySelector('#ll-enviar-menu').hidden), '5. Esc lo cierra');
  }
  {
    await envia(B, 'ubicacion');
    const sinPermiso = await espEnvio(B, (x) => x.dir === 'sale' && x.que === 'ubicacion' && x.estado === 'error', 15000);
    const it = await uno(B, (x) => x.dir === 'sale' && x.que === 'ubicacion' && x.estado === 'error');
    comprueba(sinPermiso && /revisa el permiso del navegador/.test(it.motivo), '5. B sin permiso de ubicación: lo dice', it && it.motivo);
    await B.screenshot({ path: path.join(OUT, '5-pc-sin-permiso.png') });
    await ctxB.grantPermissions(['geolocation'], { origin: 'http://127.0.0.1:8080' }); await ctxB.setGeolocation(MEDELLIN);
    await pulsaEnTarjeta(B, it.id, 'Reintentar');
    comprueba(await espEnvio(B, (x) => x.dir === 'sale' && x.que === 'ubicacion' && x.estado === 'confirma', 15000), '5. con permiso, «Reintentar»: la enseña para confirmar');
    const it2 = await uno(B, (x) => x.dir === 'sale' && x.que === 'ubicacion' && x.estado === 'confirma');
    await pulsaEnTarjeta(B, it2.id, 'Enviar');
    comprueba(await espEnvio(T, (x) => x.dir === 'llega' && x.que === 'ubicacion', 15000), '5. T recibe la ubicación de B');
    const r = await uno(T, (x) => x.dir === 'llega' && x.que === 'ubicacion'), tj = await tarjeta(T, r.id);
    comprueba(tj.detalle === '6.24420, -75.58124 · ±35 m' && tj.enlaces.length === 1 && tj.enlaces[0].href === 'https://maps.apple.com/?ll=6.24420,-75.58124&q=6.24420,-75.58124', '5. en el iPhone, «Abrir en el mapa» va a Mapas', [tj.detalle, tj.enlaces]);
    await envia(B, 'archivo', { name: 'acta.txt', mimeType: 'text/plain', buffer: archivo2 });
    comprueba(await espEnvio(T, (x) => x.dir === 'llega' && x.que === 'archivo' && x.estado === 'hecho', 20000), '5. T recibe el archivo de B');
    const ra = await uno(T, (x) => x.dir === 'llega' && x.que === 'archivo'), tja = await tarjeta(T, ra.id);
    const g = await guarda(T, () => pulsaEnTarjeta(T, ra.id, 'Guardar'));
    comprueba(tja.titulo === 'Archivo recibido' && g.nombre === 'acta.txt' && sha(g.datos) === sha(archivo2), '5. y lo guarda en el teléfono, idéntico', [tja.titulo, tja.detalle, g.nombre]);
    const caben = await T.evaluate(() => [...document.querySelectorAll('#ll-envios .ll-env')].every((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }));
    comprueba(caben, '5. en T, las tarjetas caben a lo ancho');
    await T.screenshot({ path: path.join(OUT, '5-tel-recibe.png') });
  }
  // ---- 6. B pasa la suya a su Android (U): T y U, los dos en el teléfono ----
  const { p: U } = await equipo(browser, 'android', 'U', MEDELLIN);
  await pasa(B, U);
  comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(U)) === 'hablando' && (await estado(B)) === 'libre', 30000), '6. B pasa la suya a su Android: T y U hablan', { T: await estado(T), U: await estado(U), B: await estado(B) });
  comprueba(await hasta(async () => !(await envios(B)).length && !(await visible(B, '#ll-envios')), 8000), '6. en el PC de B, al salir de la llamada, lo recibido se suelta');
  comprueba(await hasta(() => visible(U, '#ll-enviar'), 10000) && await hasta(() => visible(T, '#ll-enviar'), 10000), '6. en los dos teléfonos sale «Enviar»');
  await espera(1500);
  for (const P of [T, U]) await P.evaluate(() => { const b = document.querySelector('#ll-cod-si'); if (b && !b.closest('[hidden]')) b.click(); });
  await espera(500);
  {
    const b = await barra(U);
    comprueba(b.map((x) => x.n).join(' · ') === 'Girar · Enviar · Volver al PC · Colgar' && barraBien(b, 412, 915), '6. en el Android (412 px): ' + b.map((x) => x.n).join(' · '), b.map((x) => [x.n, x.x, x.r]));
    await U.screenshot({ path: path.join(OUT, '6-and-boton.png') });
    await despierta(U); await espera(120); await U.click('#ll-enviar'); await espera(400);
    await U.screenshot({ path: path.join(OUT, '6-and-menu.png') });
    await despierta(U); await espera(120); await U.click('#ll-enviar'); await espera(300);
  }
  await envia(U, 'foto', { name: 'Screenshot_20261102.png', mimeType: 'image/jpeg', buffer: foto });
  comprueba(await espEnvio(T, (x) => x.dir === 'llega' && x.que === 'foto' && x.estado === 'hecho', 30000), '6. T recibe la foto de U');
  {
    const v = await T.evaluate(() => { const v = document.querySelector('#ll-ver'), i = document.querySelector('#ll-ver-img'), r = i.getBoundingClientRect(), g = document.querySelector('#ll-ver-guardar').getBoundingClientRect(); return { abierto: !v.hidden, w: i.naturalWidth, ancho: r.width, alto: r.height, guardar: g.bottom <= innerHeight && g.top > r.top }; });
    comprueba(v.abierto && v.w === 1600 && v.ancho >= 360 && v.guardar, '6. en el iPhone, la foto en grande (casi todo el ancho) y «Guardar» a la vista', v);
    const recibida = deB64u(await bytesDeImg(T));
    comprueba(!recibida.includes(Buffer.from(MARCA)) && !recibida.includes(Buffer.from('Exif\0\0', 'binary')), '6. también sin los datos ocultos');
    await T.screenshot({ path: path.join(OUT, '6-tel-foto.png') });
    await T.click('#ll-ver-cerrar'); await espera(300);
  }
  await envia(T, 'ubicacion');
  comprueba(await espEnvio(T, (x) => x.dir === 'sale' && x.que === 'ubicacion' && x.estado === 'confirma', 15000), '6. T vuelve a pedir su ubicación');
  { const it = (await envios(T)).filter((x) => x.dir === 'sale' && x.que === 'ubicacion' && x.estado === 'confirma').pop(); await pulsaEnTarjeta(T, it.id, 'Enviar'); }
  comprueba(await espEnvio(U, (x) => x.dir === 'llega' && x.que === 'ubicacion', 15000), '6. U recibe la ubicación de T');
  {
    const r = await uno(U, (x) => x.dir === 'llega' && x.que === 'ubicacion'), tj = await tarjeta(U, r.id);
    comprueba(tj.enlaces.length === 1 && tj.enlaces[0].href === 'geo:4.60971,-74.08175?q=4.60971,-74.08175' && !tj.enlaces[0].target, '6. en Android, «Abrir en el mapa» con «geo:» (la app de mapas del teléfono)', tj.enlaces);
    await U.screenshot({ path: path.join(OUT, '6-and-ubicacion.png') });
  }
  await envia(U, 'archivo', { name: 'nota.txt', mimeType: 'text/plain', buffer: archivo2 });
  comprueba(await espEnvio(T, (x) => x.dir === 'llega' && x.que === 'archivo' && x.estado === 'hecho' && x.nombre === 'nota.txt', 20000), '6. T recibe el archivo de U');
  await T.screenshot({ path: path.join(OUT, '6-tel-bandeja.png') });
  // ---- 7. U cuelga ----
  await U.evaluate(() => document.querySelector('#ll-colgar').click());
  comprueba(await hasta(async () => (await estado(T)) !== 'hablando', 15000), '7. U cuelga: la llamada termina en T');
  comprueba(await hasta(async () => !(await envios(T)).length && !(await visible(T, '#ll-envios')) && !(await visible(T, '#ll-ver')), 8000), '7. en T, lo recibido se suelta de la memoria');
  for (const [P, n] of [[T, 'T'], [U, 'U']]) {
    const bd = await P.evaluate(async () => { try { return (await indexedDB.databases()).map((x) => x.name); } catch (_) { return ['?']; } });
    const ls = await P.evaluate(() => Object.keys(localStorage).filter((k) => /gcom|guardiana/i.test(k)));
    comprueba(!bd.length && !ls.length, '7. en ' + n + ', nada en la base de datos ni en el almacenamiento del navegador', { bd, ls });
  }
  await T.screenshot({ path: path.join(OUT, '7-tel-fin.png') });
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
