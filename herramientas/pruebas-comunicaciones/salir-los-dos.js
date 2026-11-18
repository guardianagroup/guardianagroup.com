// Chat privado: al salir los dos, se borra (dueño, 15 nov 2026, 17:19: «cada vez que salgo en un chat y vuelvo a entrar, el chat
// vuelve a aparecer… Piensa que esto es un chat privado… se tiene que borrar todo automático, cuando los dos salen»). Dos PCs, chat
// normal con el código de 9 cifras:
//   1. Sale A (al «+»): no se borra, B sigue dentro. Sale B: se borra en los dos equipos (memoria y disco).
//   2. Lo que no se ha visto no se borra: B fuera recibe un mensaje; sale A; sigue en los dos. B entra, lo lee y sale: se borra.
//   3. A cierra la pestaña; sale B: B lo borra y deja la orden firmada en el buzón. A vuelve a abrir GUARDIANA: el chat no aparece
//      ni un momento y desaparece también de su disco.
//   4. Los dos cierran a la vez. Al volver, ni A ni B lo ven aparecer, y se borra en los dos.
//   5. A recarga con B dentro: el chat no se borra y vuelve a la lista de A.
//   6. Un mensaje que espera en el buzón: al volver, el chat se enseña con el mensaje nuevo y no se borra hasta que se ve.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'salir-los-dos');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (cond || extra === undefined ? '' : '  ' + JSON.stringify(extra))); if (!cond) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { try { if (await fn()) return true; } catch (_) {} await espera(250); } return false; };

// cada equipo es un perfil (su disco se queda entre pestañas); cada pestaña apunta las filas de la lista que llega a ver
async function perfil(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO' });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    window.__filas = [];
    const mira = () => { for (const b of document.querySelectorAll('#lista-filas .fila-conv')) { const r = b.getBoundingClientRect(); if (r.width && r.height && !window.__filas.includes(b.dataset.id)) window.__filas.push(b.dataset.id); } };
    new MutationObserver(mira).observe(document, { subtree: true, childList: true, attributes: true });
  });
  return ctx;
}
async function pestana(ctx, nombre) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const salas = (p) => p.evaluate(() => [...GuardianaCom.convs.values()].filter((c) => c.estado !== 'destruida').map((c) => c.id));
const enDisco = (p, id) => p.evaluate((id) => new Promise((res) => { const r = indexedDB.open('guardiana-com', 1); r.onsuccess = () => { try { const g = r.result.transaction('conv').objectStore('conv').get(id); g.onsuccess = () => res(!!g.result); g.onerror = () => res(null); } catch (e) { res(null); } }; r.onerror = () => res(null); }), id);
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && !e.closest('[hidden]') && r.width > 0 && r.height > 0; }, s);
const escribe = async (p, t) => { await p.fill('#texto', t); await p.click('#enviar'); };
const estados = (p, id) => p.evaluate((id) => { const c = GuardianaCom.convs.get(id); return c ? c.mensajes.filter((m) => m.dir !== 'sistema').map((m) => m.dir + ':' + m.estado) : null; }, id);
const todoLeido = async (p, id, n) => { const e = await estados(p, id); return !!e && e.length >= (n || 1) && e.every((x) => x === 'mia:leido' || x === 'suya:leido'); };
const sale = (p) => p.click('#lista-nueva');

// al inicio (el «+» de la lista, en el PC): es salir de la conversación que estuviera abierta
async function aInicio(p) { if (await visible(p, '#lista-nueva')) { await p.click('#lista-nueva'); await espera(400); } }
// B crea la invitación (9 cifras) y A las escribe en «Tengo un código»; los dos dentro, un mensaje cada uno y los dos vistos
async function conversacion(A, B, n) {
  await aInicio(B); await B.click('#modo-blindado'); await B.click('#nueva');
  await hasta(async () => /\d{3}/.test(await B.textContent('#codigo')), 10000);
  const cod = (await B.textContent('#codigo')).replace(/\D/g, '');
  await aInicio(A);
  if (!(await visible(A, '#paso-entrar'))) { if (!(await visible(A, '#unir')) && (await visible(A, '#modo-blindado'))) await A.click('#modo-blindado');
    if (!(await visible(A, '#unir'))) await A.screenshot({ path: path.join(OUT, 'sin-unir-' + n + '.png') }); await A.click('#unir', { timeout: 8000 }); await hasta(() => visible(A, '#paso-entrar'), 4000); }
  await A.fill('#unir-codigo', ''); await A.focus('#unir-codigo'); await A.keyboard.type(cod, { delay: 25 });
  const lista = async (P) => P.evaluate(() => { const c = [...GuardianaCom.convs.values()].filter((x) => x.huella && x.estado === 'activa').sort((a, b) => b.creado - a.creado)[0]; return c && c.sesion && c.sesion.confirmada ? c.id : null; });
  const abierta = await hasta(async () => (await visible(A, '#conv')) && (await visible(B, '#conv')) && !!(await lista(A)) && (await lista(A)) === (await lista(B)), 20000);
  const id = await lista(A);
  await escribe(A, 'Hola ' + n); await espera(1200); await escribe(B, 'Hola, recibido ' + n);
  const leidos = await hasta(async () => (await todoLeido(A, id, 2)) && (await todoLeido(B, id, 2)), 15000);
  return { id, ok: abierta && leidos && !!id };
}

(async () => {
  const browser = await chromium.launch();
  try {
    const cA = await perfil(browser), cB = await perfil(browser);
    let A = await pestana(cA, 'A'), B = await pestana(cB, 'B');
    await B.goto(URL0); await A.goto(URL0); await espera(1500);

    // ---- 1. sale A: sigue; sale B: se borra en los dos ----
    let k = await conversacion(A, B, 1);
    comprueba(k.ok, '1. chat abierto, un mensaje cada uno, los dos vistos', k);
    const nota = await A.evaluate((id) => GuardianaCom.convs.get(id).mensajes.some((m) => m.dir === 'sistema' && /^Chat privado/.test(m.texto)), k.id);
    comprueba(nota, '1. el chat avisa: «Chat privado: cuando los dos salgan… se borrará en los dos equipos»');
    await sale(A); await espera(4000);
    comprueba((await salas(A)).includes(k.id) && (await salas(B)).includes(k.id), '1. sale A con B dentro: el chat sigue en los dos');
    await sale(B);
    const borrado1 = await hasta(async () => !(await salas(A)).includes(k.id) && !(await salas(B)).includes(k.id), 8000);
    comprueba(borrado1, '1. sale B: se borra en los dos equipos');
    comprueba((await enDisco(A, k.id)) === false && (await enDisco(B, k.id)) === false, '1. y tampoco queda en el disco de ninguno');
    await A.screenshot({ path: path.join(OUT, '01-A-tras-salir.png') });

    // ---- 2. lo que no se ha visto no se borra ----
    k = await conversacion(A, B, 2);
    comprueba(k.ok, '2. chat nuevo, todo visto');
    await sale(B); await espera(1500);
    await escribe(A, '¿Sigues ahí?'); await espera(2500);
    const sinVer = await B.evaluate((id) => (GuardianaCom.convs.get(id) || {}).noLeidos || 0, k.id);
    await sale(A); await espera(4500);
    comprueba(sinVer > 0 && (await salas(A)).includes(k.id) && (await salas(B)).includes(k.id), '2. B tiene un mensaje sin ver y salen los dos: no se borra', { sinVer });
    await B.click('#lista-filas .fila-conv[data-id="' + k.id + '"]');
    await hasta(async () => (await todoLeido(A, k.id, 3)), 8000);
    await sale(B);
    const borrado2 = await hasta(async () => !(await salas(A)).includes(k.id) && !(await salas(B)).includes(k.id), 8000);
    comprueba(borrado2, '2. B entra, lo lee y sale: se borra en los dos');

    // ---- 3. A cierra la pestaña; sale B; A vuelve ----
    k = await conversacion(A, B, 3);
    comprueba(k.ok, '3. chat nuevo, todo visto');
    await A.close(); await espera(2500);
    await sale(B);
    const borradoB3 = await hasta(async () => !(await salas(B)).includes(k.id), 15000);
    comprueba(borradoB3, '3. A cerró la pestaña y B sale: B lo borra (la orden queda en el buzón de A)', await B.evaluate((id) => { const c = GuardianaCom.convs.get(id); return c ? { estado: c.estado, buzon: !!(c.buzon && c.buzon.suya), acuerdo: !!c.acuerdoPub, firma: !!c.firmaPub, suId: !!c.suId, conBuzon: GuardianaCom.rele.conBuzon, m: c.mensajes.map((m) => m.dir + ':' + m.estado) } : null; }, k.id));
    A = await pestana(cA, 'A'); await A.goto(URL0);
    const borradoA3 = await hasta(async () => !(await salas(A)).includes(k.id) && (await enDisco(A, k.id)) === false, 12000);
    await espera(1500);
    const vistasA3 = await A.evaluate(() => window.__filas);
    comprueba(borradoA3, '3. A vuelve a abrir GUARDIANA: se cumple la orden y se borra de su disco');
    comprueba(!vistasA3.includes(k.id), '3. y el chat no llega a verse en su lista ni un momento', vistasA3);
    await A.screenshot({ path: path.join(OUT, '03-A-al-volver.png') });

    // ---- 4. los dos cierran a la vez ----
    k = await conversacion(A, B, 4);
    comprueba(k.ok, '4. chat nuevo, todo visto');
    await Promise.all([A.close(), B.close()]); await espera(2500);
    A = await pestana(cA, 'A'); await A.goto(URL0);
    const borradoA4 = await hasta(async () => !(await salas(A)).includes(k.id) && (await enDisco(A, k.id)) === false, 15000);
    await espera(1500);
    comprueba(borradoA4 && !(await A.evaluate(() => window.__filas)).includes(k.id), '4. A vuelve: no lo ve aparecer y se borra de su disco');
    B = await pestana(cB, 'B'); await B.goto(URL0);
    const borradoB4 = await hasta(async () => !(await salas(B)).includes(k.id) && (await enDisco(B, k.id)) === false, 15000);
    await espera(1500);
    comprueba(borradoB4 && !(await B.evaluate(() => window.__filas)).includes(k.id), '4. B vuelve: tampoco lo ve y se borra de su disco');

    // ---- 5. A recarga con B dentro: se queda ----
    k = await conversacion(A, B, 5);
    comprueba(k.ok, '5. chat nuevo, todo visto');
    await A.reload(); await espera(1000);
    const vuelve5 = await hasta(async () => (await A.evaluate((id) => window.__filas.includes(id), k.id)), 15000);
    await espera(3000);
    comprueba(vuelve5 && (await salas(A)).includes(k.id) && (await salas(B)).includes(k.id) && (await enDisco(A, k.id)) === true, '5. A recarga con B dentro: el chat sigue y vuelve a su lista');
    await A.screenshot({ path: path.join(OUT, '05-A-recarga.png') });

    // ---- 6. un mensaje que espera en el buzón: al volver, se enseña y no se borra hasta verlo ----
    await sale(A); await espera(3000); // (5 se queda: A sale con B dentro)
    await sale(B);
    await hasta(async () => !(await salas(A)).includes(k.id) && !(await salas(B)).includes(k.id), 8000);
    k = await conversacion(A, B, 6);
    comprueba(k.ok, '6. chat nuevo, todo visto');
    await B.close(); await espera(2500);
    await escribe(A, 'Te dejo esto para luego'); await espera(3000);
    await sale(A); await espera(4000);
    comprueba((await salas(A)).includes(k.id), '6. B cerró, A le escribe y sale: A no lo borra (B aún no lo ha visto)');
    B = await pestana(cB, 'B'); await B.goto(URL0);
    const llega6 = await hasta(async () => (await B.evaluate((id) => { const c = GuardianaCom.convs.get(id); return !!c && c.mensajes.some((m) => m.dir === 'suya' && m.texto === 'Te dejo esto para luego') && window.__filas.includes(id); }, k.id)), 15000);
    comprueba(llega6, '6. B vuelve: el mensaje llega del buzón y el chat se enseña');
    await B.click('#lista-filas .fila-conv[data-id="' + k.id + '"]');
    await hasta(async () => (await todoLeido(A, k.id, 3)), 10000);
    await sale(B);
    const borrado6 = await hasta(async () => !(await salas(A)).includes(k.id) && !(await salas(B)).includes(k.id), 10000);
    comprueba(borrado6, '6. B lo lee y sale: se borra en los dos');
  } catch (e) {
    console.log('ERROR ' + (e && e.stack || e)); fallos.push('excepción');
  } finally {
    await browser.close();
    console.log(fallos.length ? 'FALLOS: ' + fallos.length + ' → ' + fallos.join(' | ') : 'TODO OK');
    process.exit(fallos.length ? 1 : 0);
  }
})();
