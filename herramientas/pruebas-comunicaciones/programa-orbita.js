// «Ver en Órbita» y la vuelta a la llamada dentro del programa GUARDIANA (dueño, 16 Nov 2026, 12:20: «nos hemos ido a Órbita… él la
// pantalla no la puede hacer más grande ni nada. Y sobre todo, no podemos volver a la llamada, ninguno de los dos»). En el programa,
// Órbita y Comunicaciones son sus propias pestañas, sin barra: «Ver en Órbita» abría una pestaña nueva de la web, sin barra, y desde
// ella no había forma de volver a la llamada. Aquí A es el programa: su página va marcada (data-en-programa y data-ventana-llamada) y,
// como hace el guion del programa, el clic en un enlace con data-producto se queda en una petición al programa (se apunta).
//   1. «Ver en Órbita»: ninguna pestaña nueva; el programa pasa a su pestaña de Órbita, y esa pestaña abre la vista de la llamada.
//   2. La pestaña de la llamada queda detrás: su ventana, con «Volver a la llamada» además de micrófono, cámara y colgar.
//   3. «Volver a la llamada» en la ventana: el programa vuelve a Comunicaciones, la ventana se cierra y la llamada sale en grande.
//   4. Desde Órbita, su «Volver a la llamada» también pide Comunicaciones al programa (antes cerraba la pestaña).
//   5. En mitad de la llamada, un enlace a Órbita también va a la pestaña de Órbita del programa, no a una pestaña nueva.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'programa-orbita');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, nombre, programa) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((programa) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    if (window.top !== window || window.opener) return;
    window.__vista = 'visible';
    Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get: () => window.__vista });
    Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get: () => window.__vista !== 'visible' });
    window.__abiertas = []; const abre = window.open;
    window.open = function (u, n, f) { window.__abiertas.push([String(u || ''), String(n || '')]); return abre.call(window, u, n, f); };
    if (!programa) return;
    try { Object.defineProperty(window, 'documentPictureInPicture', { configurable: true, value: undefined }); } catch (_) {}
    new MutationObserver((_, o) => { if (document.documentElement) { document.documentElement.dataset.enPrograma = '1'; document.documentElement.dataset.ventanaLlamada = '1'; o.disconnect(); } }).observe(document, { childList: true });
    // como el guion del programa (crates/zero/src/paginas.rs): el clic en [data-producto] es una petición al programa
    window.__productos = [];
    document.addEventListener('click', (e) => { const b = e.target && e.target.closest && e.target.closest('[data-producto]'); if (!b) return; e.preventDefault(); e.stopImmediatePropagation(); window.__productos.push(String(b.dataset.producto || '')); }, true);
  }, !!programa);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return { p, ctx };
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
const oculta = (P, si) => P.evaluate((si) => { window.__vista = si ? 'hidden' : 'visible'; document.dispatchEvent(new Event('visibilitychange')); }, si);
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--disable-popup-blocking'] });
  const { p: B } = await equipo(browser, 'B', false), { p: A, ctx } = await equipo(browser, 'A', true);
  await A.goto(URL0 + '?plan=plus'); await espera(1500);
  await A.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await A.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await B.goto(url); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  comprueba(await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 20000), '0. conversación Ultra entre A (el programa) y B');
  // la pestaña de Órbita del programa, ya abierta (como en el programa: su propia pestaña, con su página marcada)
  const O = await ctx.newPage(); O.on('pageerror', (e) => { console.log('[O] pageerror', String(e).slice(0, 300)); fallos.push('pageerror O'); });
  await O.goto('http://127.0.0.1:8080/orbita/'); await espera(2500);
  await A.bringToFront();
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada');
  await espera(3000);

  // 1. «Ver en Órbita»
  const paginas0 = ctx.pages().length;
  await A.evaluate(() => { const m = document.querySelector('#ll-mon'); if (m && m.classList.contains('plegado')) m.querySelector('.ll-mon-cab, button')?.click(); document.querySelector('#ll-mon-orbita').click(); });
  await espera(1200);
  const pedidos = await A.evaluate(() => ({ productos: window.__productos.slice(), abiertas: window.__abiertas.slice() }));
  comprueba(pedidos.productos.includes('orbita') && !pedidos.abiertas.some((x) => /orbita/.test(x[0])) && ctx.pages().length === paginas0, '1. «Ver en Órbita»: el programa pasa a su pestaña de Órbita, sin pestaña nueva', pedidos);
  comprueba(await hasta(() => O.evaluate(() => !!(window.OrbitaLlamada && window.OrbitaLlamada.activa)), 9000), '1. y esa pestaña abre la vista de la llamada');
  await O.screenshot({ path: path.join(OUT, '1-orbita-con-la-llamada.png') });

  // 2. la pestaña de la llamada, detrás: su ventana
  let [V] = await Promise.all([ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null), oculta(A, true)]);
  await espera(2500);
  const botones = V ? await V.evaluate(() => [...document.querySelectorAll('.vf-b')].map((b) => [b.className.replace('vf-b ', ''), b.getAttribute('aria-label')])) : null;
  comprueba(!!V && botones && botones.map((b) => b[0]).join(',') === 'vf-mic,vf-cam,vf-colgar,vf-volver' && botones[3][1] === 'Volver a la llamada', '2. su ventana, con «Volver a la llamada» además de micrófono, cámara y colgar', botones);
  if (V) { await V.setViewportSize({ width: 400, height: 260 }).catch(() => {}); await V.mouse.move(200, 130); await espera(400); await V.screenshot({ path: path.join(OUT, '2-ventana.png') }); }

  // 3. «Volver a la llamada»
  await A.evaluate(() => { window.__productos.length = 0; });
  if (V) await V.evaluate(() => document.querySelector('.vf-volver').click()).catch(() => {});
  await espera(800);
  // el programa pasa a Comunicaciones: la pestaña de la llamada se ve otra vez
  await oculta(A, false); await espera(1000);
  const vuelta = await A.evaluate(() => ({ productos: window.__productos.slice(), mini: document.querySelector('#llamada').classList.contains('mini'), estado: GuardianaCom.llamada.estado }));
  comprueba(vuelta.productos.includes('secure') && (!V || V.isClosed()) && !vuelta.mini && vuelta.estado === 'hablando', '3. «Volver a la llamada»: el programa vuelve a Comunicaciones, la ventana se cierra y la llamada, en grande', { ...vuelta, cerrada: !V || V.isClosed() });

  // 4. desde Órbita, su «Volver a la llamada»
  await O.evaluate(() => { window.__productos = window.__productos || []; window.__productos.length = 0; });
  const cerrada = await O.evaluate(() => { let c = false; const x = window.close; window.close = () => { c = true; }; const b = document.querySelector('.llorb-volver'); if (b) b.click(); window.close = x; return { boton: !!b, cerro: c, productos: window.__productos.slice() }; });
  comprueba(cerrada.boton && !cerrada.cerro && cerrada.productos.includes('secure'), '4. desde Órbita, «Volver a la llamada» pide Comunicaciones al programa (no cierra la pestaña)', cerrada);

  // 5. un enlace a Órbita en mitad de la llamada
  await A.evaluate(() => { window.__productos.length = 0; window.__abiertas.length = 0; const a = document.createElement('a'); a.href = '/orbita/multas/?desde=comunicaciones'; a.id = '__multas'; document.body.append(a); a.click(); a.remove(); });
  await espera(600);
  const enl = await A.evaluate(() => ({ productos: window.__productos.slice(), abiertas: window.__abiertas.slice(), aqui: location.pathname }));
  comprueba(enl.productos.includes('orbita') && !enl.abiertas.length && enl.aqui === '/orbita/comunicaciones/', '5. un enlace a Órbita va a la pestaña de Órbita del programa, sin pestaña nueva y sin dejar la llamada', enl);
  comprueba((await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', '5. y la llamada sigue');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
