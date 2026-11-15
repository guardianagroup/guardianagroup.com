// Editor de fotos (dueño, 15 nov 2026, 17:12: «hay una que dice responder. Esa quítala… cuando uno envía la foto, o pueda tocar la
// foto que le han enviado, pueda escribir encima o enviar la foto con el texto abajo… tipo WhatsApp»). Dos PCs, chat normal (la web
// en el teléfono dice que GUARDIANA es solo para PC):
//   1. A elige una foto con «Foto»: se abre el editor (Texto y Dibujar; sin Tapar, que es del blindado), escribe encima, dibuja,
//      deshace, pone un comentario y la envía; B la recibe editada (JPEG) con el comentario debajo.
//   2. Mantener pulsada la foto: sin «Responder»; en un texto, «Responder» sigue.
//   3. B abre la foto en el visor: «Editar» → el editor con esa foto → la envía con texto encima; A la recibe.
//   4. «Documento» sigue saliendo directo, sin editor.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'fotos-editor');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const FOTO = fs.readFileSync(process.env.FOTO || '/home/claude/qa/foto-prueba.png');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (cond || extra === undefined ? '' : '  ' + JSON.stringify(extra))); if (!cond) fallos.push(txt); };
async function equipo(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO' });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && !e.closest('[hidden]') && r.width > 0 && r.height > 0; }, s);
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(300); } return false; };
const fotos = (p) => p.evaluate(() => { const out = []; for (const c of GuardianaCom.convs.values()) for (const m of c.mensajes || []) if (m.tipo === 'archivo' && /^image\//.test(m.archivo.mime || '')) out.push({ id: m.id, dir: m.dir, estado: m.estado, mime: m.archivo.mime, pie: m.archivo.pie || '', nombre: m.archivo.nombre, tam: m.archivo.tam }); return out; });
// un trazo con el dedo (eventos de puntero, como en el teléfono)
async function traza(p, sel, puntos) {
  await p.evaluate(({ sel, puntos }) => {
    const el = document.querySelector(sel), r = el.getBoundingClientRect();
    const ev = (tipo, x, y) => el.dispatchEvent(new PointerEvent(tipo, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: r.left + x * r.width, clientY: r.top + y * r.height, button: 0, buttons: tipo === 'pointerup' ? 0 : 1 }));
    ev('pointerdown', puntos[0][0], puntos[0][1]);
    for (const q of puntos.slice(1)) ev('pointermove', q[0], q[1]);
    const u = puntos[puntos.length - 1]; ev('pointerup', u[0], u[1]);
  }, { sel, puntos });
}
(async () => {
  const browser = await chromium.launch();
  try {
    const A = await equipo(browser, 'A'), B = await equipo(browser, 'B');
    await B.goto(URL0); await espera(1500);
    await B.click('#nueva'); await espera(2500);
    const url = String(await B.evaluate(() => window.gcomPrueba.enlaceI())).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
    comprueba(await visible(A, '#conv') && await visible(B, '#conv'), 'se añaden los dos: el chat se abre');

    // ---- 1. «Foto»: el editor ----
    await A.setInputFiles('#archivo-foto', { name: 'paisaje.png', mimeType: 'image/png', buffer: FOTO });
    const abierto = await hasta(() => visible(A, '#fe'), 6000);
    await hasta(() => A.evaluate(() => { const m = document.querySelector('#fe-marco'); return !!m && m.getBoundingClientRect().width > 50; }), 4000);
    const her = { dibujar: await visible(A, '#fe-dibujar'), texto: await visible(A, '#fe-texto'), tapar: await visible(A, '#fe-tapar'), deshacer: await A.evaluate(() => document.querySelector('#fe-deshacer').disabled), comentario: await visible(A, '#fe-comentario'), enviar: await visible(A, '#fe-enviar'), sale: (await fotos(A)).length };
    comprueba(abierto && her.dibujar && her.texto && !her.tapar && her.deshacer && her.comentario && her.enviar && her.sale === 0, '1. «Foto» abre el editor: «Texto» y «Dibujar» (sin «Tapar»), el comentario y «Enviar»; nada sale todavía', her);
    await A.screenshot({ path: path.join(OUT, '01-A-editor.png') });
    // escribir encima
    await A.click('#fe-texto'); await hasta(() => visible(A, '#fe-escribe'), 2000);
    await A.click('#fe-colores-t .fe-color:nth-child(5)'); // ámbar
    await A.click('#fe-fondo');
    await A.keyboard.type('Hola desde el Caribe');
    await A.screenshot({ path: path.join(OUT, '02-A-escribiendo.png') });
    await A.click('#fe-escribe-ok');
    const t1 = await A.evaluate(() => [...document.querySelectorAll('#fe-textos .fe-t')].map((e) => ({ t: e.textContent, bg: e.style.background })));
    comprueba(t1.length === 1 && t1[0].t === 'Hola desde el Caribe' && /240, 199, 127|F0C77F/i.test(t1[0].bg), '1. «Texto»: lo escrito queda sobre la foto, con el color y el fondo elegidos', t1);
    // moverlo: arrastrar el texto con el dedo
    const antes = await A.evaluate(() => { const e = document.querySelector('#fe-textos .fe-t'); return [e.style.left, e.style.top]; });
    await A.evaluate(() => {
      const el = document.querySelector('#fe-textos .fe-t'), r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const ev = (t, dx, dy, d) => d.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 3, pointerType: 'touch', isPrimary: true, clientX: x + dx, clientY: y + dy, buttons: t === 'pointerup' ? 0 : 1 }));
      ev('pointerdown', 0, 0, el); const lz = document.querySelector('#fe-lienzo'); for (let i = 1; i <= 8; i++) ev('pointermove', 0, i * 12, lz); ev('pointerup', 0, 96, lz);
    });
    const despues = await A.evaluate(() => { const e = document.querySelector('#fe-textos .fe-t'); return [e.style.left, e.style.top]; });
    comprueba(antes[0] === despues[0] && parseFloat(despues[1]) > parseFloat(antes[1]) + 5, '1. el texto se mueve con el dedo', { antes, despues });
    // dibujar, deshacer y volver a dibujar
    await A.click('#fe-dibujar');
    const colores = await visible(A, '#fe-colores');
    await A.click('#fe-colores .fe-color:nth-child(6)'); // coral
    await traza(A, '#fe-marco', [[0.1, 0.8], [0.3, 0.7], [0.5, 0.85], [0.7, 0.7], [0.9, 0.8]]);
    const tras1 = await A.evaluate(() => ({ des: document.querySelector('#fe-deshacer').disabled, px: (() => { const c = document.querySelector('#fe-cv'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; })() }));
    await A.click('#fe-deshacer');
    const tras2 = await A.evaluate(() => { const c = document.querySelector('#fe-cv'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
    await traza(A, '#fe-marco', [[0.15, 0.2], [0.4, 0.3], [0.6, 0.15], [0.85, 0.3]]);
    comprueba(colores && !tras1.des && tras1.px > 200 && tras2 === 0, '1. «Dibujar»: los colores, el trazo en la foto y «Deshacer» lo quita', { colores, tras1, tras2 });
    await A.click('#fe-dibujar');
    await A.fill('#fe-comentario', 'Mira esto, https://guardianagroup.com');
    await A.screenshot({ path: path.join(OUT, '03-A-listo-para-enviar.png') });
    await A.click('#fe-enviar');
    comprueba(await hasta(async () => !(await visible(A, '#fe')), 6000), '1. «Enviar» cierra el editor');
    const llegaB = await hasta(async () => (await fotos(B)).some((f) => f.dir === 'suya' && ['recibido', 'leido'].includes(f.estado)), 20000);
    const fB = (await fotos(B)).find((f) => f.dir === 'suya'), fA = (await fotos(A)).find((f) => f.dir === 'mia');
    comprueba(llegaB && fB && fB.mime === 'image/jpeg' && /\.jpg$/.test(fB.nombre) && fA && fA.mime === 'image/jpeg', '1. B la recibe editada: una foto nueva en JPEG (con lo escrito y lo dibujado dentro)', { fA, fB });
    await hasta(() => B.evaluate(() => !!document.querySelector('#mensajes .gc-pie')), 6000);
    const pieB = await B.evaluate(() => { const p = document.querySelector('#mensajes .gc-pie'); return p ? { t: p.textContent, enlace: !!p.querySelector('a') } : null; });
    comprueba(!!pieB && pieB.t === 'Mira esto, https://guardianagroup.com' && pieB.enlace && fB.pie === 'Mira esto, https://guardianagroup.com', '1. y con el comentario debajo de la foto, con su enlace', pieB);
    const pieA = await A.evaluate(() => { const p = document.querySelector('#mensajes .gc-pie'); return p ? p.textContent : ''; });
    comprueba(pieA === 'Mira esto, https://guardianagroup.com', '1. quien la envía también ve el comentario debajo');
    // la foto que llegó, con lo dibujado: no es la original (otro tamaño y otro formato) y se ve
    const vista = await B.evaluate(async () => { const i = document.querySelector('#mensajes .gc-foto img.imagen'); if (!i) return null; await i.decode().catch(() => {}); return { w: i.naturalWidth, h: i.naturalHeight }; });
    comprueba(!!vista && vista.w === 320 && vista.h === 240, '1. la foto recibida se ve, con sus medidas', vista);
    await B.screenshot({ path: path.join(OUT, '04-B-recibida-con-comentario.png') });

    // ---- 2. mantener pulsado: sin «Responder» en la foto; en un texto, sí ----
    await B.evaluate(() => { const li = document.querySelector('#mensajes .gc-foto').closest('li'); li.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 100 })); });
    await hasta(() => visible(B, '#mmenu'), 2000);
    const menuFoto = { menu: await visible(B, '#mmenu'), responder: await visible(B, '#mm-responder'), info: await visible(B, '#mm-info') };
    await B.keyboard.press('Escape');
    await A.fill('#texto', 'Un texto normal'); await A.press('#texto', 'Enter');
    await hasta(() => B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].some((e) => e.textContent === 'Un texto normal')), 15000);
    await B.evaluate(() => { const s = [...document.querySelectorAll('#mensajes .gc-texto')].find((e) => e.textContent === 'Un texto normal'); s.closest('li').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 100 })); });
    await hasta(() => visible(B, '#mmenu'), 2000);
    const menuTexto = { menu: await visible(B, '#mmenu'), responder: await visible(B, '#mm-responder') };
    await B.keyboard.press('Escape');
    comprueba(menuFoto.menu && !menuFoto.responder && menuFoto.info && menuTexto.menu && menuTexto.responder, '2. en la foto, el menú sin «Responder»; en un texto, «Responder» sigue', { menuFoto, menuTexto });

    // ---- 3. B abre la foto, «Editar», escribe encima y la envía ----
    await B.click('#mensajes .gc-foto img.imagen');
    await hasta(() => visible(B, '#visor'), 4000);
    const ed = await visible(B, '#visor-editar');
    await B.screenshot({ path: path.join(OUT, '05-B-visor-con-editar.png') });
    await B.click('#visor-editar');
    const abiertoB = await hasta(() => visible(B, '#fe'), 5000);
    comprueba(ed && abiertoB && !(await visible(B, '#visor')) && await visible(B, '#fe-comentario'), '3. en el visor, «Editar»: abre el editor con esa foto, para enviarla', { ed, abiertoB });
    await hasta(() => B.evaluate(() => { const m = document.querySelector('#fe-marco'); return !!m && m.getBoundingClientRect().width > 50; }), 4000);
    await B.click('#fe-texto'); await B.keyboard.type('Respuesta'); await B.click('#fe-escribe-ok');
    const nA = (await fotos(A)).length;
    await B.click('#fe-enviar');
    const llegaA = await hasta(async () => (await fotos(A)).filter((f) => f.dir === 'suya').length === 1 && (await fotos(A)).length === nA + 1, 20000);
    comprueba(llegaA, '3. A recibe la foto editada por B');

    // ---- 4. «Documento»: directo, sin editor ----
    const nB = (await fotos(B)).length;
    await A.setInputFiles('#archivo', { name: 'plano.png', mimeType: 'image/png', buffer: FOTO });
    await espera(1500);
    const sinEditor = !(await visible(A, '#fe'));
    const llego4 = await hasta(async () => (await fotos(B)).length === nB + 1, 20000);
    comprueba(sinEditor && llego4, '4. «Documento» sigue saliendo directo, sin editor', { sinEditor, llego4 });

    // ---- 5. «Cancelar» no envía nada; varias fotos, cada una con su comentario ----
    await A.setInputFiles('#archivo-foto', { name: 'otra.png', mimeType: 'image/png', buffer: FOTO });
    await hasta(() => visible(A, '#fe'), 5000);
    const n5 = (await fotos(A)).length;
    await A.click('#fe-x'); await espera(800);
    comprueba(!(await visible(A, '#fe')) && (await fotos(A)).length === n5, '5. «Cancelar» (✕) cierra el editor sin enviar nada');
    await A.setInputFiles('#archivo-foto', [{ name: 'uno.png', mimeType: 'image/png', buffer: FOTO }, { name: 'dos.png', mimeType: 'image/png', buffer: FOTO }]);
    await hasta(() => visible(A, '#fe-tira'), 5000);
    const tira = await A.evaluate(() => document.querySelectorAll('#fe-tira .fe-mini').length);
    await A.fill('#fe-comentario', 'Primera');
    await A.click('#fe-tira li:nth-child(2) .fe-mini'); await espera(400);
    await A.fill('#fe-comentario', 'Segunda');
    await A.click('#fe-tira li:nth-child(1) .fe-mini'); await espera(400);
    const vuelve = await A.evaluate(() => document.querySelector('#fe-comentario').value);
    await A.click('#fe-enviar');
    const dos = await hasta(async () => { const p = (await fotos(B)).map((f) => f.pie); return p.includes('Primera') && p.includes('Segunda'); }, 25000);
    comprueba(tira === 2 && vuelve === 'Primera' && dos, '5. dos fotos: la tira para pasar de una a otra y cada una llega con su comentario', { tira, vuelve });
    await A.screenshot({ path: path.join(OUT, '06-A-final.png') });

    // ---- 6. el modo «Listo» (el de la hoja del blindado): «Tapar» y «Listo», sin comentario; devuelve la foto tapada ----
    await A.evaluate(async (b64) => {
      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), f = new File([bin], 'hoja.png', { type: 'image/png' });
      window.__listo = null; await window.GuardianaEditorFoto.abre({ archivos: [f], modo: 'listo', tapar: true, alListo: (x) => { window.__listo = x; } });
    }, FOTO.toString('base64'));
    await hasta(() => A.evaluate(() => { const m = document.querySelector('#fe-marco'); return !!m && m.getBoundingClientRect().width > 50; }), 4000);
    const modoListo = { tapar: await visible(A, '#fe-tapar'), listo: await visible(A, '#fe-listo'), comentario: await visible(A, '#fe-comentario') };
    await A.click('#fe-tapar');
    const pista = await visible(A, '#fe-pista');
    await traza(A, '#fe-marco', [[0.3, 0.5], [0.5, 0.5], [0.7, 0.5]]);
    await A.screenshot({ path: path.join(OUT, '07-A-tapar.png') });
    await A.click('#fe-listo');
    await hasta(() => A.evaluate(() => !!window.__listo), 5000);
    const res = await A.evaluate(() => { const x = window.__listo; return x ? { tipo: x.type, nombre: x.name, editada: !!x.__editada, limpia: !!x.__limpia } : null; });
    comprueba(modoListo.tapar && modoListo.listo && !modoListo.comentario && pista && !!res && res.tipo === 'image/jpeg' && res.editada && res.limpia && !(await visible(A, '#fe')), '6. modo «Listo»: «Tapar» con su pista, sin comentario; devuelve la foto tapada, nueva y sin datos ocultos', { modoListo, pista, res });
  } catch (e) { console.log('ERROR', e && e.stack || e); fallos.push('excepción'); }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO OK');
  process.exit(fallos.length ? 1 : 0);
})();
