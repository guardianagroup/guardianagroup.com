// El Vigía del programa para Windows, en la web (dueño, 30 Oct 2026, 14:44): durante una llamada, Comunicaciones pregunta al programa
// GUARDIANA de este ordenador (http://127.0.0.1:7443/vigia) y, si otro programa usa el micrófono, la cámara o la pantalla, la llamada
// se pone en pausa. Aquí el programa es un servidor de prueba que contesta lo que se le diga.
//   1. Sin alertas: la llamada sigue.
//   2. Con una alerta: pausa con su frase; el micrófono y la cámara se paran; a la otra persona se le dice.
//   3. La alerta desaparece: «Seguir con la llamada» se activa y, al pulsarlo, todo vuelve.
//   4. En Ajustes, el Vigía (solo en el ordenador) dice si el programa contesta.
'use strict';
const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'vigia');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
// el programa de prueba
let respuesta = { estado: 'limpio', hay_alertas: false, alertas: [] }, preguntas = 0;
const prog = http.createServer((req, res) => {
  const o = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods', 'GET'); res.setHeader('Access-Control-Allow-Private-Network', 'true'); res.end(); return; }
  if (!/^\/vigia/.test(req.url)) { res.statusCode = 404; res.end(); return; }
  preguntas++; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(respuesta));
});
async function equipo(browser, nombre, vigia) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((v) => { try { sessionStorage.setItem('gcom-sin-numero', '1'); if (v) localStorage.setItem('gcom-vigia', '1'); } catch (_) {} window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {} }, vigia);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
(async () => {
  await new Promise((r) => prog.listen(7443, '127.0.0.1', r));
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const B = await equipo(browser, 'B', true), C = await equipo(browser, 'C', false);
  await B.goto(URL0); await espera(1500);
  await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await C.goto(url); await espera(1500); if (await C.$('#aceptar-si:visible')) await C.click('#aceptar-si'); await espera(5000);
  await B.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(async () => !!(await C.$('#ll-contestar:visible')), 15000)) await C.click('#ll-contestar');
  await hasta(async () => (await estado(B)) === 'hablando' && (await estado(C)) === 'hablando', 20000);
  // 1. sin alertas
  await espera(4000);
  comprueba(preguntas >= 1, '1. la web pregunta al programa durante la llamada', preguntas);
  comprueba(!(await visible(B, '#ll-pausa')), '1. sin alertas, la llamada sigue');
  // 2. una alerta
  respuesta = { estado: 'alerta', hay_alertas: true, alertas: [{ tipo: 'microfono', nombre: 'Grabadora', frase: '«Grabadora» está usando tu micrófono.' }] };
  comprueba(await hasta(() => visible(B, '#ll-pausa'), 6000), '2. con una alerta: «Llamada en pausa»');
  comprueba(/Grabadora/.test(await B.textContent('#ll-pausa-l')), '2. y dice qué programa', await B.textContent('#ll-pausa-l'));
  const parados = await B.evaluate(() => { const v = document.querySelector('#v-local'); const s = v && v.srcObject; return GuardianaCom.llamada.enPausa; });
  comprueba(parados, '2. el micrófono y la cámara, parados');
  comprueba(await hasta(async () => /pausa/.test((await C.textContent('#ll-paso')) || ''), 5000), '2. la otra persona sabe que está en pausa', await C.textContent('#ll-paso'));
  comprueba(await B.evaluate(() => document.querySelector('#ll-pausa-seguir').disabled), '2. «Seguir» desactivado mientras dure la alerta');
  await B.screenshot({ path: path.join(OUT, '2-pausa.png') });
  // 3. la alerta desaparece
  respuesta = { estado: 'limpio', hay_alertas: false, alertas: [] };
  comprueba(await hasta(() => B.evaluate(() => !document.querySelector('#ll-pausa-seguir').disabled), 6000), '3. ya no hay alerta: «Seguir» se activa');
  await B.screenshot({ path: path.join(OUT, '3-seguir.png') });
  await B.click('#ll-pausa-seguir'); await espera(600);
  comprueba(!(await visible(B, '#ll-pausa')) && !(await B.evaluate(() => GuardianaCom.llamada.enPausa)) && (await estado(B)) === 'hablando', '3. al pulsar «Seguir», la llamada sigue con todo');
  // 4. Ajustes
  await B.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(2500);
  await B.evaluate(() => { const b = document.querySelector('#ajustes-btn'); if (b) b.click(); }); await espera(1200);
  comprueba(await visible(B, '#aj-vigia'), '4. en Ajustes del ordenador está el Vigía');
  comprueba(/Activado/.test(await B.textContent('#aj-vigia-est')), '4. y dice que el programa contesta', await B.textContent('#aj-vigia-est'));
  await B.screenshot({ path: path.join(OUT, '4-ajustes.png') });
  await browser.close(); prog.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
