// Invitación blindada fácil (dueño, 28 Oct 2026, 15:30–15:33): enlace copiado al crearla; en el móvil solo «Compartir enlace»;
// al compartir, pantalla de espera; sin números que comprobar; quien entra no escribe hasta la primera conexión; al entrar la
// otra persona, se abre sola la conversación
const { chromium, devices } = require('playwright');
const S = '/tmp/pruebas-com/prueba-74/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = [];
  const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null && getComputedStyle(e).display !== 'none'); }, s);
  const cA = await b.newContext(Object.assign({}, devices['iPhone 13'], { locale: 'es-ES' }));
  await cA.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} window.__copiado = ''; const cl = { write: async (items) => { const it = items[0]; const bl = await it.getType('text/plain'); window.__copiado = await bl.text(); }, writeText: async (t) => { window.__copiado = t; } }; Object.defineProperty(navigator, 'clipboard', { get: () => cl }); window.ClipboardItem = window.ClipboardItem || function (o) { this.getType = async (t) => o[t]; }; navigator.share = async (d) => { window.__compartido = d && d.url; }; });
  const A = await cA.newPage(); await A.goto('http://127.0.0.1:8802/orbita/comunicaciones/'); await A.waitForTimeout(1500);
  ok('móvil: un solo botón, «Crear y compartir invitación»', !(await vis(A, '#nueva')) && !(await vis(A, '#unir')) && (await A.evaluate(() => document.querySelector('#nueva-blindada').innerText.trim())) === 'Crear y compartir invitación');
  await A.screenshot({ path: S + 'invita-0-inicio.png' });
  await A.tap('#nueva-blindada'); await espera(2500);
  const enlace = await A.inputValue('#enlace-b');
  ok('un solo toque: se abre el menú de compartir del teléfono con el enlace', (await A.evaluate(() => window.__compartido)) === enlace && /#b=/.test(enlace), String(await A.evaluate(() => window.__compartido)));
  ok('y después, la pantalla de espera', (await vis(A, '#enlace-espera')) && !(await vis(A, '#enlace-vista')));
  await A.screenshot({ path: S + 'invita-2-espera.png' });
  await A.tap('#enlace-otra-vez'); await espera(300);
  ok('«Volver a compartir» vuelve a la página de compartir, con «Compartir enlace»', (await vis(A, '#enlace-vista')) && !(await vis(A, '#enlace-espera')) && (await vis(A, '#enlace-compartir')));
  await A.tap('#enlace-compartir'); await espera(300);
  // B entra: sin números que comprobar y escribe enseguida; A entra sola en la conversación
  const cB = await b.newContext(Object.assign({}, devices['Pixel 7'], { locale: 'es-ES' }));
  await cB.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
  const B = await cB.newPage(); await B.goto(enlace.replace('/comunicaciones/#', '/comunicaciones/?luz#')); 
  for (let i = 0; i < 20 && !(await vis(B, '#aceptar-si')); i++) await espera(300);
  ok('quien abre el enlace ve «¿Aceptas?»', await vis(B, '#paso-aceptar'));
  await B.screenshot({ path: S + 'invita-2b-aceptar.png' });
  await B.tap('#aceptar-si');
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(2500);
  ok('A entra sola en la conversación al entrar B', await vis(A, '#conv'));
  ok('sin el número de seguridad que comprobar', !(await vis(A, '#bl-puerta')) && !(await vis(B, '#bl-puerta')));
  ok('B ya puede escribir', (await vis(B, '#texto')) && !(await vis(B, '#espera-otro')));
  await B.tap('#texto'); await B.keyboard.type('Hola desde el enlace'); await B.keyboard.press('Enter'); await espera(1500);
  ok('A recibe el mensaje', (await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].map((x) => x.textContent))).includes('Hola desde el enlace'));
  await A.screenshot({ path: S + 'invita-3-conv.png' });
  ok('invitado: sin la barra de la web ni la vuelta a la lista', !(await vis(B, '#barra')) && !(await vis(B, '#cvolver')));
  await A.tap('#cmas'); await espera(250); await A.tap('#cm-terminar'); await espera(400); await A.tap('#cierre-si').catch(() => {}); await espera(2500);
  ok('al terminar, el invitado solo ve «Conversación terminada»', (await B.evaluate(() => { const f = document.querySelector('#fin-invitado'); return !!(f && !f.hidden && getComputedStyle(f).display !== 'none'); })) && !(await vis(B, '#app')));
  await B.screenshot({ path: S + 'invita-5-fin.png' });
  ok('y sin rastro: sin identidad guardada', await B.evaluate(() => new Promise((r) => { const q = indexedDB.open('guardiana-com', 1); q.onsuccess = () => { const t = q.result.transaction('yo', 'readonly').objectStore('yo').getAll(); t.onsuccess = () => r(t.result.length === 0); t.onerror = () => r(false); }; q.onerror = () => r(false); })));
  await B.reload(); await espera(2500);
  ok('al recargar, sigue el final (no se vuelve a la web)', (await B.evaluate(() => { const f = document.querySelector('#fin-invitado'); return !!(f && !f.hidden && getComputedStyle(f).display !== 'none'); })) && !(await vis(B, '#barra')));
  ok('el que invitó sí vuelve al inicio', await vis(A, '#inicio'));
  // C abre un enlace nuevo cuyo autor no está: «Conectando…», sin campo
  await A.evaluate(() => { document.querySelector('#lista-nueva') && document.querySelector('#lista-nueva').click(); });
  const cC = await b.newContext(Object.assign({}, devices['Pixel 7'], { locale: 'es-ES' }));
  const C = await cC.newPage(); await C.goto('http://127.0.0.1:8802/orbita/comunicaciones/#b=' + 'A'.repeat(43)); await C.waitForTimeout(2000); if (await vis(C, '#aceptar-si')) await C.tap('#aceptar-si'); await C.waitForTimeout(2500);
  ok('quien entra y no hay nadie: «Conectando…» y sin campo de escribir', (await vis(C, '#espera-otro')) && !(await vis(C, '#texto')));
  await C.screenshot({ path: S + 'invita-4-conectando.png' });
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.error('FALLO', e.message); process.exit(1); });
