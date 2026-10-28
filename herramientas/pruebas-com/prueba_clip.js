// El menú del clip (dueño, 28 Oct 2026, 15:14): foto sin datos ocultos, cámara en el móvil, documento y ubicación
const { chromium, devices } = require('playwright');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const FOTO = '/home/claude/guardianagroup.com/herramientas/pruebas-com/datos/foto-con-datos.jpg';
(async () => {
  const b = await chromium.launch(); const res = [];
  const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && getComputedStyle(e).display !== 'none'); }, s);
  const mk = async (d) => { const c = await b.newContext(Object.assign({}, d || { viewport: { width: 1280, height: 800 } }, { locale: 'es-ES', permissions: ['geolocation'], geolocation: { latitude: 11.004107, longitude: -74.806981, accuracy: 18 } })); await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} }); const p = await c.newPage(); await p.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await p.waitForTimeout(1500); return p; };
  const A = await mk(), B = await mk(devices['iPhone 13']);
  await A.click('#nueva'); await espera(1500);
  await A.click('#codigo-enlace'); const u = await A.evaluate(() => document.querySelector('#codigo-enlace').dataset.enlace);
  await B.goto(u); for (let i = 0; i < 30 && !(await vis(B, '#aceptar-si')); i++) await espera(300); await B.tap('#aceptar-si');
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(2500);
  // menú
  await A.click('#adjuntar'); await espera(300);
  const itemsA = await A.evaluate(() => [...document.querySelectorAll('#adjuntos button')].filter((x) => !x.hidden).map((x) => x.querySelector('b').textContent));
  ok('ordenador: el clip abre el menú (sin «Cámara»)', JSON.stringify(itemsA) === JSON.stringify(['Foto o vídeo', 'Documento', 'Ubicación']), JSON.stringify(itemsA));
  await A.keyboard.press('Escape'); await espera(200);
  await B.tap('#adjuntar'); await espera(300);
  const itemsB = await B.evaluate(() => [...document.querySelectorAll('#adjuntos button')].filter((x) => !x.hidden).length);
  ok('móvil: con «Cámara» (4 opciones)', itemsB === 4);
  await B.screenshot({ path: '/tmp/pruebas-com/prueba-74/clip-movil.png' });
  await B.tap('#adj-doc').catch(() => {}); await espera(300); await B.keyboard.press('Escape');
  // foto sin datos ocultos
  const limpia = await A.evaluate(async () => { const r = await fetch('/herramientas/pruebas-com/datos/foto-con-datos.jpg'); const bl = await r.blob(); const f = new File([bl], 'IMG_0001.JPG', { type: 'image/jpeg' }); const g = await window.__gcomPruebas.sinDatosOcultos(f); const t = new TextDecoder('latin1').decode(new Uint8Array(await g.arrayBuffer())); return { nombre: g.name, tipo: g.type, conDatos: /TELEFONO-SECRETO|MARCA-SECRETA|Exif/.test(t) }; });
  ok('la foto sale sin datos ocultos (ni modelo, ni marca, ni bloque Exif)', !limpia.conDatos && limpia.tipo === 'image/jpeg', JSON.stringify(limpia));
  await A.setInputFiles('#archivo-foto', FOTO); await espera(1200);
  ok('«Foto o vídeo» lleva a «Revisa antes de enviar»', await A.evaluate(() => document.querySelector('#h-envio') && document.querySelector('#h-envio').classList.contains('gc-abierta')));
  await A.keyboard.press('Escape'); await A.evaluate(() => { const h = document.querySelector('#h-envio'); if (h) h.classList.remove('gc-abierta'); });
  // ubicación
  await A.click('#adjuntar'); await espera(200); await A.click('#adj-ubicacion'); await espera(300);
  await A.click('#ubi-aprox'); await espera(2500);
  const tarjeta = await B.evaluate(() => { const x = [...document.querySelectorAll('#mensajes .gc-ubicacion')].pop(); return x ? { txt: x.innerText, href: (x.querySelector('a') || {}).href } : null; });
  ok('B recibe la ubicación aproximada con «Abrir en el mapa»', !!tarjeta && /11\.00, -74\.81/.test(tarjeta.txt) && /aproximada/.test(tarjeta.txt) && /openstreetmap\.org/.test(tarjeta.href), JSON.stringify(tarjeta));
  await B.screenshot({ path: '/tmp/pruebas-com/prueba-74/clip-ubicacion.png' });
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.error('FALLO', e.message); process.exit(1); });
