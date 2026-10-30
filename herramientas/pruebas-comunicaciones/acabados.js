// Acabados del móvil (dueño, 30 Oct 2026, 08:04–08:24). Dos teléfonos con Número GUARDIANA:
//   1. «Llamar»: sin título; tu número en una fila con «compartir»; el número marcado centrado exacto en su barra; el teclado
//      y el botón verde de llamar caben enteros encima de las pestañas, en tres alturas de iPhone.
//   2. Pestañas: tres partes iguales; icono y texto centrados en alto en la barra. El idioma, arriba a la derecha.
//   3. Chats sin «Editar»: deslizar un chat a la izquierda → «Eliminar» → la pregunta; un toque fuera la cierra sin abrir el chat;
//      deslizar un número que espera → «Quitar».
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'acabados');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && r.width > 0 && r.height > 0; }, s);
async function telefono(browser, nombre, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w || 393, height: h || 759 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES' });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  await p.goto(URL0); await espera(2500); await p.click('#num-usar'); await espera(3000);
  return p;
}
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
// el centro de los píxeles claros de una zona de la captura (para medir el texto de un campo)
async function centroTexto(p, sel) {
  const r = await p.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, sel);
  const f = path.join(OUT, 'campo.png'); await p.screenshot({ path: f, clip: r });
  // se mide con Python (PIL): la caja de los píxeles claros frente al centro del campo
  const py = "import sys,json\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert('RGB');W,H=im.size;px=im.load();xs=[];ys=[]\nfor y in range(H):\n  for x in range(W):\n    r,g,b=px[x,y]\n    if r+g+b>450: xs.append(x); ys.append(y)\nprint(json.dumps(None if not xs else {'dx':round(((min(xs)+max(xs))/2-W/2)/3,1),'dy':round(((min(ys)+max(ys))/2-H/2)/3,1)}))";
  return JSON.parse(require('child_process').execFileSync('python3', ['-c', py, f]).toString());
}
const desliza = async (p, sel, dx) => { const b = await p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x + r.width * 0.7, y: r.y + r.height / 2 }; }, sel); await p.evaluate(([s, b, dx]) => { const el = document.querySelector(s); const ev = (t, x) => el.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 5, pointerType: 'touch', isPrimary: true, clientX: x, clientY: b.y, buttons: t === 'pointerup' ? 0 : 1 })); ev('pointerdown', b.x); for (let i = 1; i <= 8; i++) ev('pointermove', b.x + dx * i / 8); ev('pointerup', b.x + dx); }, [sel, b, dx]); await espera(450); };
(async () => {
  const browser = await chromium.launch();
  // 1. «Llamar» en tres alturas
  for (const [w, h, n] of [[393, 759, 'iPhone 16'], [390, 763, 'iPhone 13'], [375, 647, 'iPhone SE']]) {
    const P = await telefono(browser, n, w, h);
    const m = await P.evaluate(() => { const q = (s) => document.querySelector(s).getBoundingClientRect(); return { titulo: getComputedStyle(document.querySelector('#marcar .contactos-cab')).display, llamar: q('#marcar-llamar').bottom, tabs: q('#pestanas').top, tecla: q('#teclado button[data-d="5"]').width, redondo: getComputedStyle(document.querySelector('#marcar-llamar')).borderRadius }; });
    comprueba(m.titulo === 'none' && m.llamar <= m.tabs - 4 && m.tecla >= 52 && m.redondo === '50%', n + ': sin título; el botón de llamar (redondo) entero encima de las pestañas; teclas de ' + Math.round(m.tecla) + ' px (' + JSON.stringify(m) + ')');
    await marca(P, '120245908'); await espera(200);
    const c = await centroTexto(P, '#marcar-n');
    comprueba(c && Math.abs(c.dx) <= 1 && Math.abs(c.dy) <= 1.5, n + ': el número marcado, centrado en su barra (desvío ' + JSON.stringify(c) + ' px)');
    await P.screenshot({ path: path.join(OUT, '1-llamar-' + n.replace(/ /g, '') + '.png') });
    // pestañas e idioma
    const t = await P.evaluate(() => { const nav = document.querySelector('#pestanas').getBoundingClientRect(); const xs = [...document.querySelectorAll('#pestanas .pestana:not([hidden])')].map((b) => { const r = b.getBoundingClientRect(), s = b.querySelector('svg').getBoundingClientRect(), l = b.querySelector('span').getBoundingClientRect(); return { cx: (r.left + r.right) / 2, w: r.width, alto: (s.top + l.bottom) / 2 }; }); const id = document.querySelector('.barra .idiomas').getBoundingClientRect(); return { w: innerWidth, xs, navMedio: (nav.top + nav.bottom) / 2, idiomaDer: innerWidth - id.right }; });
    const iguales = t.xs.length === 3 && t.xs.every((x, i) => Math.abs(x.cx - t.w * (2 * i + 1) / 6) <= 1);
    const enAlto = t.xs.every((x) => Math.abs(x.alto - t.navMedio) <= 1.5);
    comprueba(iguales && enAlto, n + ': pestañas a tercios exactos y centradas en alto (' + JSON.stringify(t.xs.map((x) => Math.round(x.cx) + '/' + Math.round(x.alto))) + ', medio ' + Math.round(t.navMedio) + ')');
    comprueba(t.idiomaDer <= 24, n + ': el idioma, arriba a la derecha (a ' + Math.round(t.idiomaDer) + ' px del borde)');
    await P.context().close();
  }
  // 3. deslizar para eliminar
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  const nA = await A.evaluate(() => window.gcomPruebaNumero.mio()), nB = await B.evaluate(() => window.gcomPruebaNumero.mio());
  await A.click('#llamar-num'); await marca(A, nB); await A.click('#marcar-llamar'); await espera(400); await A.fill('#num-nombre', 'Nathalie'); await A.click('#num-anadir'); await espera(1500); await A.click('#num-espera-ok');
  await A.click('#llamar-num'); await marca(A, '120245908718'); await A.click('#marcar-llamar'); await espera(400); await A.fill('#num-nombre', 'Notario'); await A.click('#num-anadir'); await espera(1500); await A.click('#num-espera-ok');
  await B.click('#llamar-num'); await marca(B, nA); await B.click('#marcar-llamar'); await espera(400); await B.fill('#num-nombre', 'Fran'); await B.click('#num-anadir'); await espera(7000);
  await A.evaluate(() => document.querySelector('#cvolver').click()); await espera(700);
  comprueba(await visible(A, '#contactos') && !(await visible(A, '#contactos-editar')), 'Chats: sin «Editar»');
  const fila = '#contactos-filas .contacto:not(.pendiente)';
  comprueba(await A.evaluate((s) => { const li = document.querySelector(s).getBoundingClientRect(), q = document.querySelector(s + ' .contacto-quita').getBoundingClientRect(); return q.left >= li.right - 0.5; }, fila), 'cerrada, «Eliminar» no se ve (queda fuera de la fila)');
  await desliza(A, fila + ' .contacto-abre', -150);
  const ab = await A.evaluate((s) => { const q = document.querySelector(s + ' .contacto-quita').getBoundingClientRect(), li = document.querySelector(s).getBoundingClientRect(); return { abierta: document.querySelector(s).classList.contains('abierta'), izq: Math.round(q.left), der: Math.round(q.right), w: Math.round(li.right) }; }, fila);
  comprueba(ab.abierta && ab.der === ab.w && ab.izq <= ab.w - 88 && await A.evaluate(() => document.querySelector('#conv').hidden), 'deslizar a la izquierda: asoma «Eliminar» en rojo, sin abrir el chat (' + JSON.stringify(ab) + ')');
  await A.screenshot({ path: path.join(OUT, '2-deslizar.png') });
  await A.tap('#contactos-t'); await espera(450);
  comprueba(await A.evaluate((s) => !document.querySelector(s).classList.contains('abierta'), fila) && await A.evaluate(() => document.querySelector('#conv').hidden), 'un toque fuera la cierra');
  await desliza(A, fila + ' .contacto-abre', -150);
  await A.tap(fila + ' .contacto-abre'); await espera(500);
  comprueba(await A.evaluate(() => document.querySelector('#conv').hidden) && await A.evaluate((s) => !document.querySelector(s).classList.contains('abierta'), fila), 'abierta, tocar la fila la cierra sin abrir el chat');
  await desliza(A, fila + ' .contacto-abre', -150);
  await A.tap(fila + ' .contacto-quita'); await espera(400);
  comprueba(await A.evaluate(() => document.querySelector('#h-eliminar').classList.contains('gc-abierta') && /Nathalie/.test(document.querySelector('#h-eliminar-t').textContent)), '«Eliminar» → «¿Eliminar el chat con Nathalie?»');
  await A.screenshot({ path: path.join(OUT, '3-pregunta.png') });
  await A.click('#eliminar-no').catch(async () => { await A.evaluate(() => document.querySelector('#h-eliminar').classList.remove('gc-abierta')); }); await espera(400);
  await A.tap(fila + ' .contacto-abre'); await espera(1200);
  comprueba(!(await A.evaluate(() => document.querySelector('#conv').hidden)), 'y un toque normal sigue abriendo el chat');
  await A.evaluate(() => document.querySelector('#cvolver').click()); await espera(700);
  await desliza(A, '#contactos-filas .contacto.pendiente .contacto-abre', -150);
  comprueba(await A.evaluate(() => { const q = document.querySelector('#contactos-filas .contacto.pendiente .contacto-quita'); return document.querySelector('#contactos-filas .contacto.pendiente').classList.contains('abierta') && q.textContent === 'Quitar'; }), 'un número que espera: deslizar → «Quitar»');
  await A.tap('#contactos-filas .contacto.pendiente .contacto-quita'); await espera(800);
  comprueba(await A.evaluate(() => !document.querySelector('#contactos-filas .contacto.pendiente')), '«Quitar» lo quita');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
