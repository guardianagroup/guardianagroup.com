// Al recargar la app (tirar para actualizar o la actualización sola), arriba no se mueve nada ni sale «Desconectado» un momento
// (dueño, 29 Oct 2026, 08:38: «cuando la actualizo, me sale el check en verde… Pero arriba me aparece durante un momento
// desconectado y como que se mueve la parte de arriba. Vigila eso para que no pase»). Se graba, fotograma a fotograma, lo que
// hay en pantalla desde que empieza a cargar, con los archivos llegando con retraso como en un teléfono de verdad.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'recarga');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
const RETRASO = Number(process.env.RETRASO || 450); // ms que tardan en llegar los scripts al recargar (el iPhone los revalida)

// grabadora: en cada fotograma, lo que se ve arriba
function grabadora() {
  window.__marcos = [];
  const ve = (e) => { if (!e || !e.isConnected) return false; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; const s = getComputedStyle(e); return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05 && !e.closest('[hidden]'); };
  const caja = (e) => { if (!ve(e)) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
  const paso = () => {
    try {
      const q = (s) => document.querySelector(s);
      const app = q('#app'), raiz = document.documentElement;
      const tapado = !!(app && getComputedStyle(app).visibility === 'hidden') || getComputedStyle(raiz).visibility === 'hidden' || !!(document.body && getComputedStyle(document.body).visibility === 'hidden');
      window.__marcos.push({
        t: Math.round(performance.now()),
        tapado,
        barra: !tapado && ve(q('#barra')) ? caja(q('#barra')) : null,
        rele: !tapado && ve(q('#rele')) ? q('#reletxt').textContent : null,
        titulo: !tapado && ve(q('.barra .barra-t')) ? q('.barra .barra-t').textContent : null,
        volver: !tapado && ve(q('#volver')),
        inicio: !tapado && ve(q('#paso-inicio')),
        contactos: !tapado && ve(q('#contactos')),
        conv: !tapado && ve(q('#conv')),
        nombre: !tapado && ve(q('#cnombre')) ? q('#cnombre').textContent : null,
        nombreCaja: !tapado ? caja(q('#cnombre')) : null,
        linea: !tapado && ve(q('#cconfianza')) ? q('#cconfianza').textContent : null,
        lineaCaja: !tapado ? caja(q('#cconfianza')) : null,
        mensajesCaja: !tapado ? caja(q('#mensajes')) : null,
        check: !!(q('.tirar') && q('.tirar').classList.contains('ver')),
      });
    } catch (e) { window.__marcos.push({ t: Math.round(performance.now()), error: String(e) }); }
    if (window.__marcos.length < 600) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

async function equipo(browser, ua) {
  const pc = ua === PC;
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 793 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: ua || UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  await ctx.addInitScript(grabadora);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
// los scripts llegan con retraso (como al recargar en el iPhone, que los vuelve a pedir)
async function conRetraso(P) {
  await P.route(/\/orbita\/(comunicaciones|static)\/[\w-]+\.js(\?|$)/, async (r) => { await espera(RETRASO); await r.continue(); });
}
async function tiraParaActualizar(P, y0) {
  const cdp = await P.context().newCDPSession(P);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 196, y: y0 }] });
  for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 196, y: y0 + 220 * i / 12 }] }); await espera(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
// resumen de la grabación: lo que ha salido arriba y si algo se ha movido
function analiza(marcos, nombre) {
  const vistos = marcos.filter((m) => !m.error && !m.tapado);
  const releTextos = [...new Set(vistos.map((m) => m.rele).filter(Boolean))];
  const lineas = [...new Set(vistos.map((m) => m.linea).filter((x) => x !== null))];
  const titulos = [...new Set(vistos.map((m) => m.titulo).filter(Boolean))];
  const pantallas = []; for (const m of vistos) { const p = m.conv ? 'chat' : m.contactos ? 'contactos' : m.inicio ? 'inicio' : 'nada'; if (pantallas[pantallas.length - 1] !== p) pantallas.push(p); }
  const barras = []; for (const m of vistos) { const b = m.barra ? 'barra' : 'sin barra'; if (barras[barras.length - 1] !== b) barras.push(b); }
  const nombreTops = [...new Set(vistos.map((m) => m.nombreCaja && m.nombreCaja[1]).filter((x) => x !== null && x !== undefined))];
  const mensajesTops = [...new Set(vistos.map((m) => m.mensajesCaja && m.mensajesCaja[1]).filter((x) => x !== null && x !== undefined))];
  const r = { marcos: marcos.length, tapados: marcos.filter((m) => m.tapado).length, releTextos, lineas, titulos, pantallas, barras, nombreTops, mensajesTops, volver: vistos.some((m) => m.volver), check: vistos.some((m) => m.check) };
  fs.writeFileSync(path.join(OUT, nombre + '.json'), JSON.stringify(marcos, null, 1));
  return r;
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  // dos teléfonos en un chat
  const A = await equipo(browser), B = await equipo(browser);
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); await espera(400);
  await A.click('#invitar-otra'); await espera(1200);
  const url = String((await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await B.goto(url); await espera(1500); await B.click('#aceptar-si'); await espera(5000);
  await A.tap('#texto'); await A.fill('#texto', 'Hola'); await A.click('#enviar'); await espera(800);
  await A.evaluate(() => document.activeElement && document.activeElement.blur()); await espera(600);
  comprueba(await A.evaluate(() => document.querySelector('#cconfianza').textContent) === 'En línea', 'antes: los dos en el chat, «En línea»');

  // 1. tirar para actualizar dentro del chat
  await conRetraso(A);
  await tiraParaActualizar(A, 260);
  await A.waitForEvent('load'); await espera(4500);
  const r1 = analiza(await A.evaluate(() => window.__marcos), '1-chat');
  console.log(JSON.stringify(r1));
  comprueba(r1.check, 'tirar para actualizar: sale el ✓');
  comprueba(!r1.releTextos.length, 'arriba nunca sale «Desconectado» (ni «Conectado»)', r1.releTextos);
  comprueba(r1.pantallas.join() === 'chat', 'vuelve al chat sin pasar por el inicio', r1.pantallas);
  comprueba(r1.barras.join() === 'sin barra', 'en el chat, la barra de arriba no aparece y desaparece', r1.barras);
  comprueba(r1.lineas.join() === 'En línea', 'la línea de debajo del nombre no pasa por «Sin conexión», «No conectado» ni «Conectando…»', r1.lineas);
  comprueba(r1.nombreTops.length <= 1 && r1.mensajesTops.length <= 1, 'el nombre y los mensajes no se mueven', [r1.nombreTops, r1.mensajesTops]);
  await A.screenshot({ path: path.join(OUT, '1-chat.png') });

  // 2. guardada como contacto: tirar para actualizar en el chat vuelve al chat (no al inicio)
  await A.unroute(/\/orbita\/(comunicaciones|static)\/[\w-]+\.js(\?|$)/);
  await A.evaluate(() => { const b = document.querySelector('#cm-contacto'); if (b) b.click(); }); await espera(500);
  if (await A.$('#h-contacto.gc-abierta, #h-nombre.gc-abierta')) {
    const campo = await A.$('.gc-hoja.gc-abierta input'); if (campo) await campo.fill('Nathalie');
    const ok = await A.$('.gc-hoja.gc-abierta .boton.principal, .gc-hoja.gc-abierta button[type="submit"]'); if (ok) await ok.click();
  }
  await espera(800);
  const esContacto = await A.evaluate(() => document.querySelector('#conv').classList.contains('es-contacto'));
  console.log('contacto guardado:', esContacto);
  await conRetraso(A);
  await tiraParaActualizar(A, 260);
  await A.waitForEvent('load'); await espera(4500);
  const r2 = analiza(await A.evaluate(() => window.__marcos), '2-contacto');
  console.log(JSON.stringify(r2));
  comprueba(!r2.releTextos.length, 'con contacto: arriba nunca sale «Desconectado»', r2.releTextos);
  comprueba(r2.pantallas.join() === 'chat', 'con contacto: vuelve al chat sin pasar por el inicio', r2.pantallas);
  comprueba(r2.lineas.join() === 'En línea', 'con contacto: la línea no pasa por estados intermedios', r2.lineas);
  comprueba(r2.nombreTops.length <= 1, 'con contacto: el nombre no se mueve', r2.nombreTops);

  // 3. en el inicio: tirar para actualizar no enseña «Desconectado» ni cambia el título de arriba
  await A.unroute(/\/orbita\/(comunicaciones|static)\/[\w-]+\.js(\?|$)/);
  await A.evaluate(() => document.querySelector('#cvolver').click()); await espera(800);
  if (await A.evaluate(() => document.querySelector('#inicio').classList.contains('ver-contactos'))) { await A.click('#contactos-atras'); await espera(500); }
  await conRetraso(A);
  await tiraParaActualizar(A, 300);
  await A.waitForEvent('load'); await espera(3500);
  const r3 = analiza(await A.evaluate(() => window.__marcos), '3-inicio');
  console.log(JSON.stringify(r3));
  comprueba(!r3.releTextos.length, 'inicio: arriba nunca sale «Desconectado»', r3.releTextos);
  comprueba(r3.titulos.length === 1 && /GUARDIANA/.test(r3.titulos[0]) && !r3.volver, 'inicio: arriba, siempre el candado y «GUARDIANA» (nunca «‹ Inicio» ni «Comunicaciones»)', [r3.titulos, r3.volver]);
  comprueba(r3.pantallas.join() === 'inicio', 'inicio: se queda en el inicio', r3.pantallas);
  await A.screenshot({ path: path.join(OUT, '3-inicio.png') });

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
