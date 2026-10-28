// Prueba de Comunicaciones en local (página en 127.0.0.1:8802, relé de pruebas en 127.0.0.1:8794), dos navegadores.
// Comprueba: revisar antes de enviar, cortar un envío (los dos lados), «Guardar en…» y la espera en el viaje,
// «Enviar» durante una nota de voz, el texto de cierre de la sesión normal, el título del modo discreto y la
// invitación blindada con el enlace primero.
const { chromium } = require('playwright');
const fs = require('fs');
const S = '/tmp/pruebas-com/prueba-com/';
fs.mkdirSync(S, { recursive: true });
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = [];
const ok = (nombre, cond, extra) => { res.push((cond ? 'OK   ' : 'FALLA') + ' ' + nombre + (extra ? ' · ' + extra : '')); };

(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (nombre) => {
    const c = await b.newContext({ viewport: { width: 1200, height: 860 }, permissions: ['microphone'], locale: 'es-ES', timezoneId: 'Europe/Paris' });
    await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} });
    const p = await c.newPage(); p.errores = [];
    p.on('pageerror', (e) => p.errores.push(nombre + ': ' + e.message));
    p.on('dialog', (d) => { p.errores.push(nombre + ': ventana del navegador ' + d.type()); d.dismiss(); });
    await p.goto(URL); await p.waitForTimeout(1500);
    return p;
  };
  const A = await mk('A'), B = await mk('B');
  const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);

  // 1. conversación normal
  await A.click('#nueva'); await A.waitForTimeout(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  ok('código de invitación', /^\d{9}$/.test(codigo), codigo);
  await B.click('#unir'); await B.waitForTimeout(300);
  await B.fill('#unir-codigo', codigo); await B.waitForTimeout(200);
  if (await visible(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !((await visible(A, '#conv')) && (await visible(B, '#conv'))); i++) await espera(500);
  for (const p of [A, B]) if (await visible(p, '#pro')) { await p.click('#pro-empezar').catch(() => {}); }
  await espera(2500);
  ok('conversación abierta en los dos', (await visible(A, '#conv')) && (await visible(B, '#conv')));
  await A.screenshot({ path: S + '1-A-conv.png' });

  // 2. modo discreto: título según el estado
  const t0 = await A.getAttribute('#discreto', 'title');
  ok('título del modo discreto (apagado)', /activarlo/.test(t0), t0.slice(-40));

  // 3. revisar antes de enviar: elegir un archivo no lo envía
  fs.writeFileSync(S + 'nota.txt', 'Prueba de GUARDIANA\n');
  await A.setInputFiles('#archivo', S + 'nota.txt'); await A.waitForTimeout(500);
  const hoja = await A.evaluate(() => document.querySelector('#h-envio').classList.contains('gc-abierta'));
  const enChat = await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-archivo b')].map((x) => x.textContent));
  ok('al elegir un archivo sale la hoja «Revisa antes de enviar»', hoja, (await A.textContent('#envio-lista')).trim());
  ok('y todavía no se ha enviado', !enChat.includes('nota.txt'));
  await A.screenshot({ path: S + '2-A-revisa.png' });
  await A.click('#envio-no'); await A.waitForTimeout(300);
  ok('«Cancelar» cierra sin enviar', !(await A.evaluate(() => document.querySelector('#h-envio').classList.contains('gc-abierta'))) && !(await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-archivo b')].some((x) => x.textContent === 'nota.txt'))));
  await A.setInputFiles('#archivo', S + 'nota.txt'); await A.waitForTimeout(400);
  await A.click('#envio-si'); await A.waitForTimeout(3000);
  const llegaB = await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-archivo')].map((x) => x.innerText.replace(/\s+/g, ' ')).join(' | '));
  ok('«Enviar» lo envía y llega', /nota\.txt/.test(llegaB), llegaB.slice(0, 120));

  // 4. imagen: se ve antes de enviar
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGNgYPj/n4GBgYEBAAeQAQGqbS9GAAAAAElFTkSuQmCC', 'base64');
  fs.writeFileSync(S + 'foto.png', png);
  await A.setInputFiles('#archivo', S + 'foto.png'); await A.waitForTimeout(500);
  ok('una imagen se ve en la hoja', await A.evaluate(() => !!document.querySelector('#envio-lista li.foto img')));
  await A.screenshot({ path: S + '3-A-foto.png' });
  await A.keyboard.press('Escape'); await A.waitForTimeout(300);
  ok('Escape cierra la hoja', !(await A.evaluate(() => document.querySelector('#h-envio').classList.contains('gc-abierta'))));

  // 5. cortar desde quien envía mientras espera a que el otro elija dónde guardarlo (40 MB)
  fs.writeFileSync(S + 'enorme.bin', Buffer.alloc(40 * 1024 * 1024, 3));
  await A.setInputFiles('#archivo', S + 'enorme.bin'); await A.waitForTimeout(600); await A.click('#envio-si'); await espera(2500);
  if (await A.evaluate(() => !!document.querySelector('#h-viaje.gc-abierta'))) { await A.keyboard.press('Escape'); await espera(300); }
  const hayCorte = await A.evaluate(() => [...document.querySelectorAll('#mensajes button')].some((x) => /Cortar el envío/.test(x.textContent)));
  if (hayCorte) await A.evaluate(() => [...document.querySelectorAll('#mensajes button')].reverse().find((x) => /Cortar el envío/.test(x.textContent)).click());
  await espera(2000);
  const aTxt = await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-archivo')].map((x) => x.innerText.replace(/\s+/g, ' ')).pop());
  const bTxt = await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-archivo')].map((x) => x.innerText.replace(/\s+/g, ' ')).pop());
  ok('quien envía puede cortarlo', hayCorte && /cortado por ti/.test(aTxt), aTxt);
  ok('a quien recibe le sale cortado por la otra persona', /cortado por la otra persona/.test(bTxt), bTxt);
  await A.screenshot({ path: S + '4-A-cortado.png' }); await B.screenshot({ path: S + '4-B-cortado.png' });

  // 6. archivo grande (más de 32 MB): quien recibe ve la espera en el viaje y puede cortarlo
  await A.setInputFiles('#archivo', S + 'enorme.bin'); await A.waitForTimeout(600); await A.click('#envio-si'); await espera(3000);
  if (await A.evaluate(() => !!document.querySelector('#h-viaje.gc-abierta'))) { await A.keyboard.press('Escape'); await espera(300); }
  const conDisco = await B.evaluate(() => typeof window.showSaveFilePicker === 'function');
  const botonesB = await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-archivo')].pop().innerText.replace(/\s+/g, ' '));
  ok('B ve «Guardar en…» y «Cortar el envío»', !conDisco || (/Guardar en/.test(botonesB) && /Cortar el envío/.test(botonesB)), 'showSaveFilePicker=' + conDisco + ' · ' + botonesB);
  await B.evaluate(() => [...document.querySelectorAll('#mensajes .vj-ver')].pop().click()); await espera(1200);
  const vj = await B.evaluate(() => { const h = document.querySelector('#h-viaje'); return { espera: h.querySelector('.vj-espera').hidden ? '' : h.querySelector('.vj-espera').textContent, vel: h.querySelector('.vj-vel').textContent, guardar: !h.querySelector('#vj-guardar').hidden, cortar: !h.querySelector('#vj-cortar').hidden, etq: h.querySelector('.vj-etq').innerText.replace(/\s+/g, ' ') }; });
  ok('el viaje dice qué falta y ofrece «Guardar en…»', !conDisco || (/Esperando a que elijas/.test(vj.espera) && vj.guardar && vj.vel === 'En espera'), JSON.stringify(vj).slice(0, 260));
  ok('el viaje ofrece cortar', vj.cortar);
  ok('el país dice de dónde sale', !vj.etq || /zona horaria/.test(vj.etq), vj.etq.slice(0, 120));
  await B.screenshot({ path: S + '5-B-viaje-espera.png' });
  await B.click('#vj-cortar'); await espera(2000);
  const aTxt2 = await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-archivo')].map((x) => x.innerText.replace(/\s+/g, ' ')).pop());
  ok('quien recibe puede cortarlo desde el viaje', /cortado por la otra persona/.test(aTxt2), aTxt2);
  await B.keyboard.press('Escape'); await espera(300);

  // 7. nota de voz: «Enviar» la termina y la envía
  await A.click('#grabar'); await espera(1600);
  const grabando = await visible(A, '#grabando');
  await A.click('#enviar'); await espera(2500);
  const voz = await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-archivo')].map((x) => x.innerText.replace(/\s+/g, ' ')).pop());
  ok('«Enviar» durante la grabación envía la nota', grabando && /Nota de voz/.test(voz), voz);

  // 8. hoja de cierre en la sesión normal
  await A.click('#terminar'); await espera(400);
  const cierre = await A.textContent('#cierre-este');
  ok('cierre de sesión normal: la identidad se queda', /Tu identidad y tu nombre se quedan/.test(cierre), cierre.slice(0, 90));
  await A.screenshot({ path: S + '6-A-cierre.png' });
  await A.click('#cierre-no');

  // 9. invitación blindada: el enlace primero y el QR plegado
  const C3 = await mk('C');
  await C3.click('#nueva-blindada'); await espera(2500);
  const bl = await C3.evaluate(() => { const p = document.querySelector('#paso-enlace'); const fila = p.querySelector('.enlace-fila'), det = p.querySelector('details.qr-plegado'); return { visible: !p.hidden, enlacePrimero: !!(fila && det && (fila.compareDocumentPosition(det) & Node.DOCUMENT_POSITION_FOLLOWING)), plegado: det ? !det.open : null, enlace: (p.querySelector('#enlace-b').value || '').slice(0, 60) }; });
  ok('blindada: enlace primero y QR plegado', bl.visible && bl.enlacePrimero && bl.plegado === true, JSON.stringify(bl));
  await C3.screenshot({ path: S + '7-C-blindada.png' });
  await C3.click('details.qr-plegado summary'); await espera(300);
  await C3.screenshot({ path: S + '8-C-blindada-qr.png' });

  for (const p of [A, B, C3]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n'));
  await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e); process.exit(1); });
