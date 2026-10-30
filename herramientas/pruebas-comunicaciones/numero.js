// Número GUARDIANA (dueño, 29 Oct 2026, 20:56–21:55; agencia, ronda 73): en la app del teléfono, cada persona tiene su número;
// «Llamar» abre un teclado; nadie puede escribirte por saber tu número: solo hablan los que se han añadido los dos.
// Dos teléfonos (A y B) contra el relé de pruebas (node zero-motor/pruebas/rele.js 8794):
//   · A crea su número (azar); B elige el suyo; un número trivial se rechaza; un número ocupado también.
//   · A marca un número al azar: «esperando», sin nada en B. A marca el de B: esperando. B marca el de A: el chat se abre solo en
//     los dos, encriptado, con los nombres que puso cada uno; se escribe y llega.
//   · Recargar: el número y el chat siguen. Un tercero con el número de A no puede entrar en la sala de A y B.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'numero');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) console.log('[' + nombre + '] ' + m.text().slice(0, 200)); });
  return p;
}
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && r.width > 0 && r.height > 0; }, s);
const texto = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; }, s);
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
(async () => {
  const browser = await chromium.launch();
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B'), X = await telefono(browser, 'X');
  await A.goto(URL0); await B.goto(URL0); await espera(2500);
  // bienvenida: número propuesto, sin «Invitar a chat»
  comprueba(await visible(A, '#mi-numero-nuevo'), 'A: «Bienvenido», con un número propuesto');
  comprueba(!(await visible(A, '#nueva-blindada')), 'A: sin «Invitar a chat» en el inicio');
  const prop1 = await texto(A, '#num-propuesto');
  comprueba(/^\d{3} \d{3} \d{3} \d{3}$/.test(prop1), 'el número propuesto se lee en grupos de tres (' + prop1 + ')');
  await A.click('#num-otro'); await espera(200);
  const prop2 = await texto(A, '#num-propuesto');
  comprueba(prop2 !== prop1 && /^\d{3} \d{3} \d{3} \d{3}$/.test(prop2), '«Otro número» propone otro (' + prop2 + ')');
  await foto(A, '01-A-bienvenida');
  await A.click('#num-usar'); await espera(2500);
  comprueba(await visible(A, '#mi-numero-hecho') && await visible(A, '#llamar-num'), 'A: «Usar este número» → «Tu Número GUARDIANA» y «Llamar»');
  const numA = await A.evaluate(() => window.gcomPruebaNumero.mio());
  comprueba(numA.length === 12 && prop2.replace(/ /g, '') === numA, 'A tiene el número propuesto (' + numA + ')');
  await foto(A, '02-A-mi-numero');
  // B elige el suyo: trivial → no; ocupado (el de A) → no; uno bueno → sí
  await B.click('#num-elegir'); await espera(200);
  await B.fill('#num-elige-in', '11111111111'); await B.click('#num-usar'); await espera(400);
  comprueba(/fácil de adivinar/.test(await texto(B, '#num-error') || ''), 'B: un número trivial se rechaza');
  await B.fill('#num-elige-in', numA.slice(0, 11)); await B.click('#num-usar'); await espera(2500);
  comprueba(/no está disponible/.test(await texto(B, '#num-error') || ''), 'B: el número de A está ocupado');
  await foto(B, '03-B-ocupado');
  const once = '4821179' + String(Math.floor(Math.random() * 9000) + 1000); // (el relé de pruebas recuerda los números de otras pasadas)
  await B.fill('#num-elige-in', once); await B.click('#num-usar'); await espera(2500);
  const numB = await B.evaluate(() => window.gcomPruebaNumero.mio());
  comprueba(numB.length === 12 && numB.startsWith(once) && await visible(B, '#mi-numero-hecho'), 'B elige su número y se le añade la cifra de control (' + numB + ')');
  // A marca un número al azar válido: «esperando», y a B no le pasa nada
  await A.click('#llamar-num'); await espera(400);
  comprueba(await visible(A, '#teclado'), 'A: «Llamar» abre el teclado');
  await foto(A, '04-A-teclado');
  const azar = await A.evaluate(() => window.gcomPruebaNumero.nuevo());
  await marca(A, azar); await espera(300);
  comprueba(!(await A.evaluate(() => document.querySelector('#marcar-llamar').disabled)), 'con 12 cifras correctas, «Llamar» se activa');
  await A.click('#marcar-borra'); await espera(100); await marca(A, azar.slice(-1) === '0' ? '1' : '0'); await espera(200);
  comprueba(await A.evaluate(() => document.querySelector('#marcar-llamar').disabled) && /no es correcto/.test(await texto(A, '#marcar-ayuda')), 'con una cifra mal, lo dice y no deja llamar');
  await A.click('#marcar-borra'); await marca(A, azar.slice(-1)); await espera(200);
  await A.click('#marcar-llamar'); await espera(500);
  comprueba(await visible(A, '#h-num') && await visible(A, '#num-paso-nombre'), 'número nuevo: pide el nombre');
  await A.fill('#num-nombre', 'Nadie'); await A.click('#num-anadir'); await espera(2500);
  comprueba(await visible(A, '#num-paso-espera') && /Esperando a Nadie/.test(await texto(A, '#num-espera-t')), 'un número al azar: «Esperando», igual que uno real');
  await foto(A, '05-A-esperando-azar');
  comprueba(await visible(B, '#mi-numero-hecho') && !(await visible(B, '#h-num')) && !(await visible(B, '#conv')), 'a B no le llega nada de nadie');
  await A.click('#num-espera-ok'); await espera(300);
  // A añade a B
  await A.click('#llamar-num'); await espera(300); await marca(A, numB); await A.click('#marcar-llamar'); await espera(400);
  await A.fill('#num-nombre', 'Mi mujer'); await A.click('#num-anadir'); await espera(2500);
  comprueba(/Esperando a Mi mujer/.test(await texto(A, '#num-espera-t')) && (await texto(A, '#num-espera-mio')).replace(/ /g, '') === numA, 'A añade a B: espera, y le enseña su propio número para pasárselo');
  await foto(A, '06-A-esperando-B');
  comprueba(!(await visible(B, '#conv')) && !(await visible(B, '#h-num')), 'B sigue sin enterarse de nada');
  await A.click('#num-espera-ok'); await espera(300);
  await A.click('#ver-contactos'); await espera(400);
  const filas = await A.evaluate(() => [...document.querySelectorAll('#contactos-filas .contacto')].map((li) => li.textContent.trim().replace(/\s+/g, ' ')));
  comprueba(filas.length === 2 && filas.some((f) => /Mi mujer.*Esperando/.test(f)) && filas.some((f) => /Nadie.*Esperando/.test(f)), 'en «Mis chats», los dos números esperando (' + filas.join(' | ') + ')');
  await foto(A, '07-A-mis-chats');
  await A.click('#contactos-atras'); await espera(300);
  // B añade a A: el chat se abre solo en los dos
  await B.click('#llamar-num'); await espera(300); await marca(B, numA); await B.click('#marcar-llamar'); await espera(400);
  await B.fill('#num-nombre', 'Mi marido'); await B.click('#num-anadir'); await espera(6000);
  comprueba(await visible(B, '#conv') && await visible(A, '#conv'), 'B añade a A: el chat se abre solo en los dos teléfonos');
  comprueba((await texto(A, '#cnombre')) === 'Mi mujer' && (await texto(B, '#cnombre')) === 'Mi marido', 'cada uno ve el nombre que puso (' + (await texto(A, '#cnombre')) + ' / ' + (await texto(B, '#cnombre')) + ')');
  const sesion = await A.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); return c && c.sesion ? { pq: c.sesion.pq, conf: c.sesion.confirmada, huella: !!c.huella, esperada: c.huellaEsperada === [...c.huella].map((x) => x.toString(16).padStart(2, '0')).join('') } : null; });
  comprueba(sesion && sesion.pq && sesion.huella && sesion.esperada, 'sesión encriptada (con ML-KEM) y con la identidad esperada: ' + JSON.stringify(sesion));
  await foto(A, '08-A-chat-abierto'); await foto(B, '08-B-chat-abierto');
  await A.fill('#texto', 'Hola, ya estoy en GUARDIANA'); await A.click('#enviar'); await espera(2000);
  comprueba(await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].some((e) => /ya estoy en GUARDIANA/.test(e.textContent))), 'el mensaje llega');
  const citasA = await A.evaluate(() => window.gcomPruebaNumero.citas());
  comprueba(citasA.length === 1 && citasA[0].n !== numB, 'la cita con B se cerró; la del azar sigue esperando');
  // un tercero con el número de A no entra en la sala de A y B (no conoce la cita ni la clave); y su «esperando» es igual
  await X.goto(URL0); await espera(2500); await X.click('#num-usar'); await espera(2500);
  await X.click('#llamar-num'); await espera(300); await marca(X, numA); await X.click('#marcar-llamar'); await espera(400);
  await X.fill('#num-nombre', 'A'); await X.click('#num-anadir'); await espera(2500);
  comprueba(/Esperando a A/.test(await texto(X, '#num-espera-t')), 'un tercero que añade a A: espera, sin que A se entere');
  await espera(1500);
  comprueba(!(await visible(A, '#h-num')) && (await A.evaluate(() => [...GuardianaCom.convs.values()].filter((c) => c.numero).length)) === 1, 'A: ningún chat nuevo, ningún aviso');
  // recargar: todo sigue
  await A.reload(); await espera(4000);
  comprueba((await A.evaluate(() => window.gcomPruebaNumero.mio())) === numA, 'tras recargar, A conserva su número');
  comprueba(await visible(A, '#conv') && (await texto(A, '#cnombre')) === 'Mi mujer', 'tras recargar, el chat con «Mi mujer» sigue y se abre');
  await espera(3000);
  comprueba(await A.evaluate(() => { const c = [...GuardianaCom.convs.values()].find((x) => x.numero); return !!(c && c.sesion && c.sesion.confirmada); }), 'tras recargar, la sesión se vuelve a acordar');
  await A.click('#cvolver'); await espera(400);
  await foto(A, '09-A-mis-chats-con-chat');
  await A.click('#contactos-atras'); await espera(300);
  await foto(A, '10-A-inicio');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
