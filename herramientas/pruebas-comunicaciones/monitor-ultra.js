// La llamada Ultra del 15 nov 2026 (dueño, 20:32 y 20:33), PC ↔ PC, en videollamada:
//   1. «Voz cambiada» y «Mosaico» puestos de serie y a la vista, encima de la barra (no dentro de «Más»); un toque los quita y otro
//      los pone, y cada píldora dice su estado.
//   2. El código rojo en el centro, en las dos pantallas, al empezar: el mismo en los dos, con «Léelo en voz alta…»; las 4 palabras,
//      plegadas en la píldora de arriba. Al cambiar la llave (aquí, cada 8 s; en la llamada de verdad, cada 2 minutos) vuelve a salir
//      con «El código ha cambiado», el mismo en los dos.
//   3. El Monitor de seguridad, siempre a la vista en los dos: «Todo en orden», comprobado hace pocos segundos, con sus filas reales
//      (encriptado activo, capa postcuántica ML-KEM-1024 · AES-256-GCM, la clave y cuándo cambia, el código, la huella de la conexión
//      que coincide con la que llegó encriptada, la sala con solo los dos, fragmentos verificados sin rechazados, la ruta y el código
//      de la página); «Coinciden» lo apunta; la cápsula de arriba lo pliega y lo abre.
//   4. En el teléfono (quien recibe la invitación entra desde su navegador), en una llamada de voz: el monitor sale plegado (una línea)
//      y se abre al tocarlo; «Voz cambiada» a la vista y, sin imagen, sin «Mosaico»; la tarjeta roja también.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'monitor-ultra');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, nombre, vp) {
  const ctx = await browser.newContext({ viewport: vp || { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); sessionStorage.setItem('gcom-rota-ms', '8000'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const vista = (P) => P.evaluate(() => {
  const ve = (e) => !!(e && !e.hidden && e.getClientRects().length && !e.closest('[hidden]'));
  const c = document.querySelector('#ll-cod'), m = document.querySelector('#ll-mon');
  const ef = (id) => { const b = document.querySelector(id); return b ? { ve: ve(b), on: b.getAttribute('aria-pressed') === 'true', b: (b.querySelector('b') || {}).textContent, i: (b.querySelector('i') || {}).textContent } : null; };
  return {
    voz: ef('#ll-ef-voz'), mosaico: ef('#ll-ef-mosaico'), viejos: ['#ll-grave-caja', '#ll-mosaico-caja'].filter((s) => ve(document.querySelector(s))),
    tarjeta: ve(c), titulo: c ? c.querySelector('#ll-cod-t').textContent : '', num: c ? c.querySelector('#ll-cod-num').textContent.replace(/\D/g, '') : '', texto: c ? c.querySelector('#ll-cod-texto').textContent : '',
    codigo: window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.codigo : '',
    palabrasGrande: ve(document.querySelector('#ll-sas')), palabrasMini: ve(document.querySelector('#ll-sas-mini')),
    mon: ve(m), plegado: !!(m && m.classList.contains('plegado')), nivel: m ? m.dataset.nivel : '', estado: m ? m.querySelector('.ll-mon-estado').textContent : '',
    filas: m ? Object.fromEntries([...m.querySelectorAll('#ll-mon-l li')].map((l) => [l.dataset.k, [l.className.replace(/^mon-/, ''), l.querySelector('b').textContent, l.querySelector('span').textContent]])) : {},
    eventos: m ? [...m.querySelectorAll('#ll-mon-ev li')].map((l) => l.textContent) : [],
    filasVisibles: m ? ve(m.querySelector('#ll-mon-l')) : false,
    ruta: (() => { const r = m && m.querySelector('#ll-mon-ruta'); return r ? { r: r.dataset.ruta, ve: ve(r), dato: r.querySelector('#ll-mon-ruta-dato').textContent, nota: r.querySelector('#ll-mon-ruta-nota').textContent, serv: ve(r.querySelector('.mr-serv')), pies: [...r.querySelectorAll('.mr-pie')].filter(ve).map((x) => x.textContent) } : null; })(),
    choque: (() => { const a = document.querySelector('#ll-cod-chip'), b = document.querySelector('#ll-efectos'); if (!ve(a) || !ve(b)) return null; const r = a.getBoundingClientRect(), q = b.getBoundingClientRect(); return !(r.right <= q.left || q.right <= r.left || r.bottom <= q.top || q.bottom <= r.top); })(),
  };
});
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const B = await equipo(browser, 'B'), A = await equipo(browser, 'A');
  await B.goto(URL0 + '?plan=plus'); await espera(1500);
  await B.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await B.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si');
  comprueba(await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 20000), '0. conversación Ultra entre A y B');
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => B.evaluate(() => { const b = document.querySelector('#ll-contestar'); return !!(b && b.getClientRects().length); }), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada Ultra');

  // 1. las píldoras
  await espera(1500);
  let a = await vista(A), b = await vista(B);
  comprueba(a.voz && a.voz.ve && a.voz.on && a.voz.b === 'Voz cambiada' && a.voz.i === 'activado' && a.mosaico && a.mosaico.ve && a.mosaico.on && a.mosaico.b === 'Mosaico' && a.mosaico.i === 'activado', '1. A: «Voz cambiada · activado» y «Mosaico · activado», a la vista de serie', { voz: a.voz, mosaico: a.mosaico });
  comprueba(b.voz && b.voz.ve && b.voz.on && b.mosaico && b.mosaico.ve && b.mosaico.on, '1. B: las dos píldoras, puestas', { voz: b.voz, mosaico: b.mosaico });
  comprueba(!a.viejos.length && !b.viejos.length, '1. ya no van dentro de «Más»', { A: a.viejos, B: b.viejos });
  await A.click('#ll-ef-mosaico'); await espera(500);
  a = await vista(A);
  const mosaicoFuera = await A.evaluate(() => GuardianaCom.llamada && document.querySelector('#ll-ef-mosaico').getAttribute('aria-pressed'));
  comprueba(mosaicoFuera === 'false' && a.mosaico.i === 'desactivado', '1. un toque quita el mosaico y la píldora lo dice', a.mosaico);
  await A.click('#ll-ef-mosaico'); await A.click('#ll-ef-voz'); await espera(500);
  a = await vista(A);
  comprueba(a.mosaico.on && !a.voz.on && a.voz.i === 'desactivado', '1. otro toque lo vuelve a poner; la voz también se quita', { voz: a.voz, mosaico: a.mosaico });
  await A.click('#ll-ef-voz'); await espera(300);
  comprueba((await vista(A)).voz.on, '1. y se vuelve a poner');

  // 2. la tarjeta roja, en el centro de los dos
  let ok = await hasta(async () => { const x = await vista(A), y = await vista(B); return x.tarjeta && y.tarjeta && /^\d{6}$/.test(x.num) && x.num === y.num; }, 15000);
  a = await vista(A); b = await vista(B);
  comprueba(ok && /^(Código de seguridad|El código ha cambiado)$/.test(a.titulo) && /^Léelo en voz alta y comprueba con la otra persona que los números coinciden\./.test(a.texto), '2. la tarjeta roja en el centro de las dos pantallas, con el mismo código y «Léelo en voz alta…»', { A: [a.num, a.titulo], B: [b.num] });
  comprueba(!a.palabrasGrande && !b.palabrasGrande && a.palabrasMini && b.palabrasMini, '2. las 4 palabras, plegadas en la píldora de arriba', { A: [a.palabrasGrande, a.palabrasMini], B: [b.palabrasGrande, b.palabrasMini] });
  const colorTarjeta = await A.evaluate(() => getComputedStyle(document.querySelector('#ll-cod-num')).color);
  console.log('     color del número:', colorTarjeta);

  // 3. el monitor
  ok = await hasta(async () => { const x = await vista(A); return x.mon && x.filas.huella && x.filas.huella[0] === 'ok' && x.filas.frag && x.ruta && x.ruta.r && !/—/.test(x.ruta.dato); }, 12000);
  a = await vista(A); b = await vista(B);
  await A.screenshot({ path: path.join(OUT, '1-pc-monitor-tarjeta.png') });
  comprueba(ok && a.mon && b.mon && !a.plegado && a.filasVisibles, '3. el monitor, a la vista y abierto en el PC (A y B)', { A: [a.mon, a.plegado], B: [b.mon, b.plegado] });
  comprueba(a.nivel === 'ok' && /^Todo en orden · comprobado hace \d s$/.test(a.estado), '3. «Todo en orden · comprobado hace N s»', a.estado);
  const F = a.filas;
  comprueba(F.cifrado && F.cifrado[0] === 'ok' && /^Activo/.test(F.cifrado[2]), '3. encriptado de extremo a extremo: activo', F.cifrado);
  comprueba(F.pq && F.pq[0] === 'ok' && F.pq[2] === 'ML-KEM-1024 · AES-256-GCM', '3. capa postcuántica: ML-KEM-1024 · AES-256-GCM', F.pq);
  comprueba(F.llave && /^nº \d+ · cambia en 0:0\d$/.test(F.llave[2]), '3. la clave: su número y cuándo cambia', F.llave);
  // (justo al cambiar la llave, un momento «Comprobando…» hasta que la tarjeta enseña el nuevo)
  let fc = F.codigo; await hasta(async () => { fc = (await vista(A)).filas.codigo; return fc && fc[2] === 'Sin comprobar: léelo en voz alta'; }, 5000);
  comprueba(fc && fc[2] === 'Sin comprobar: léelo en voz alta', '3. el código: sin comprobar', fc);
  comprueba(F.huella && F.huella[0] === 'ok' && F.huella[2] === 'Coincide con la que llegó encriptada', '3. la huella de la conexión coincide con la que llegó encriptada', F.huella);
  comprueba(F.sala && F.sala[0] === 'ok' && F.sala[2] === 'Solo los dos', '3. la sala del relé: solo los dos', F.sala);
  comprueba(F.frag && F.frag[0] === 'ok' && /^Fragmentos: [\d.]+ · rechazados: 0$/.test(F.frag[2]) && Number(F.frag[2].split(' ')[1].replace(/\D/g, '')) > 10, '3. voz e imagen verificadas, ninguna rechazada', F.frag);
  // el recorrido de los datos (dueño, 15 nov 2026, 22:20): aquí la conexión es directa (en el relé de verdad pasa por el servidor)
  const R = a.ruta, DATO = /^Envío [\d.,]+ (kbit|Mbit)\/s · recepción [\d.,]+ (kbit|Mbit)\/s · ida y vuelta [\d.,]+ ms$/;
  comprueba(R && R.ve && R.r === 'directa' && !R.serv && R.pies.length === 2 && R.pies[0] === 'Tu dispositivo' && /^La otra persona/.test(R.pies[1]) && DATO.test(R.dato) && /^Sin servidores en medio/.test(R.nota), '3. el recorrido de los datos (aquí, directo): tu dispositivo y la otra persona, sin su ubicación; envío, recepción e ida y vuelta medidos', R);
  comprueba(!('ruta' in F), '3. la ruta ya no va repetida en una fila aparte', Object.keys(F));
  comprueba(F.pagina && F.pagina[0] === 'ok' && F.pagina[2] === 'Solo el de GUARDIANA', '3. el código de la página: solo el de GUARDIANA', F.pagina);
  comprueba(a.eventos.some((e) => /Monitor en marcha$/.test(e)), '3. el registro empieza con «Monitor en marcha»', a.eventos);
  // los segundos corren
  const t1 = (await vista(A)).estado; await espera(2600); const t2 = (await vista(A)).estado;
  comprueba(/hace [0-2] s$/.test(t2), '3. el monitor sigue comprobando (vuelve a «hace 0-2 s»)', [t1, t2]);
  // «Coinciden» en la tarjeta de A, justo después de un cambio de llave (aquí cambia cada 8 s)
  { const c = (await vista(A)).codigo; await hasta(async () => { const x = await vista(A); return x.tarjeta && x.num && x.num !== c; }, 12000); }
  await A.click('#ll-cod-si');
  let visto = null; await hasta(async () => { const x = await vista(A); if (x.filas.codigo && x.filas.codigo[2] === 'Comprobado') { visto = x; return true; } return false; }, 3000);
  a = visto || await vista(A);
  comprueba(a.filas.codigo && a.filas.codigo[0] === 'ok' && a.filas.codigo[2] === 'Comprobado' && a.eventos.some((e) => /Los números coinciden\.$/.test(e)), '3. «Coinciden»: el monitor lo apunta', { fila: a.filas.codigo, eventos: a.eventos });
  // la llave cambia: la tarjeta vuelve a salir en los dos, con otro código, el mismo en los dos, y el monitor apunta la clave nueva
  const c0 = a.codigo;
  ok = await hasta(async () => { const x = await vista(A), y = await vista(B); return x.tarjeta && y.tarjeta && x.num && x.num !== c0 && x.num === y.num; }, 16000);
  a = await vista(A); b = await vista(B);
  comprueba(ok && a.titulo === 'El código ha cambiado', '2. al cambiar la llave, la tarjeta vuelve: «El código ha cambiado», el mismo en los dos', { A: [a.num, a.titulo], B: [b.num, b.titulo] });
  comprueba(a.eventos.some((e) => /Clave nº \d+ activa$/.test(e)) && a.filas.codigo[2] !== 'Comprobado', '3. el monitor apunta la clave nueva y el código vuelve a estar sin comprobar', { eventos: a.eventos, codigo: a.filas.codigo });
  await A.screenshot({ path: path.join(OUT, '2-pc-codigo-cambiado.png') });
  // la cápsula de arriba pliega y abre el monitor
  await A.evaluate(() => document.querySelector('#llamada').dispatchEvent(new PointerEvent('pointermove'))); await espera(150);
  await A.click('.gc-llamada-cifrado'); await espera(300);
  const pleg = (await vista(A)).plegado;
  await A.click('#ll-mon-cab'); await espera(300);
  const abre = !(await vista(A)).plegado;
  comprueba(pleg && abre, '3. la cápsula de arriba lo pliega; su cabecera lo vuelve a abrir', { pleg, abre });
  const segAbierto = await A.evaluate(() => !document.querySelector('#ll-seg').hidden);
  comprueba(!segAbierto, '3. en Ultra la cápsula ya no abre «Seguridad de esta llamada» (lo tiene el monitor)');
  // con la llamada pasando por un servidor (como en el relé de verdad, que fuerza el paso por él): aquí, sin relé, se hace pasar el
  // candidato propio por «relay» en lo que lee el monitor. Tres puntos, la nota del servidor y nada de la ubicación de la otra persona
  await A.evaluate(() => { const orig = RTCPeerConnection.prototype.getStats; window.__statsOrig = orig; RTCPeerConnection.prototype.getStats = async function (...x) { const st = await orig.apply(this, x), m = new Map(); st.forEach((r, k) => m.set(k, r.type === 'local-candidate' ? Object.assign({}, r, { candidateType: 'relay' }) : r)); return m; }; });
  let Rs = null; await hasta(async () => { Rs = (await vista(A)).ruta; return Rs && Rs.r === 'mio' && !/—/.test(Rs.dato); }, 8000);
  comprueba(Rs && Rs.r === 'mio' && Rs.serv && Rs.pies.length === 3 && /^Servidor de GUARDIANA/.test(Rs.pies[1]) && /Su ubicación no se muestra$/.test(Rs.pies[2]) && DATO.test(Rs.dato) && Rs.nota === 'El servidor solo reenvía paquetes encriptados: no tiene las claves para abrirlos.', '3. por un servidor: tu dispositivo, el servidor de GUARDIANA y la otra persona (sin su ubicación), con la nota del servidor', Rs);
  await (await A.$('#ll-mon')).screenshot({ path: path.join(OUT, '2b-pc-recorrido-servidor.png') });
  await A.evaluate(() => { RTCPeerConnection.prototype.getStats = window.__statsOrig; });

  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);
  comprueba(!(await vista(A)).mon && !(await vista(B)).mon, '5. al colgar, el monitor se va');
  // 4. el teléfono (quien recibe la invitación Ultra entra desde su navegador), en una llamada de voz: el monitor plegado en una línea,
  //    que se abre al tocarlo; «Voz cambiada» a la vista y sin «Mosaico» (no hay imagen)
  {
    const D = await equipo(browser, 'D');
    // (como ultra.js: con el agente del teléfono la web lleva a «solo en el PC»; aquí, el tamaño y el toque del teléfono, como la app instalada)
    const ctxT = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
    await ctxT.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); sessionStorage.setItem('gcom-rota-ms', '8000'); } catch (_) {} try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
    const T = await ctxT.newPage(); T.on('pageerror', (e) => { console.log('[T] pageerror', String(e).slice(0, 300)); fallos.push('pageerror T'); });
    await D.goto(URL0 + '?plan=plus'); await espera(1500);
    await D.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
    const u2 = String(await D.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    await T.goto(u2); await espera(1500); if (await T.$('#aceptar-si:visible')) await T.click('#aceptar-si');
    comprueba(await hasta(async () => (await enSesion(T)) && (await enSesion(D)), 20000), '4. conversación Ultra entre un PC y un teléfono');
    await T.evaluate(() => document.querySelector('#llamar').click()); await espera(2200);
    if (await hasta(() => D.evaluate(() => { const b = document.querySelector('#ll-contestar'); return !!(b && b.getClientRects().length); }), 15000)) await D.click('#ll-contestar');
    comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(D)) === 'hablando', 20000), '4. en llamada de voz');
    await hasta(async () => { const x = await vista(T); return x.mon && x.tarjeta; }, 15000); await espera(1200);
    let t = await vista(T);
    await T.screenshot({ path: path.join(OUT, '3-telefono-plegado.png') });
    comprueba(t.mon && t.plegado && !t.filasVisibles && /^(Todo en orden|Hay avisos)/.test(t.estado), '4. en el teléfono, el monitor plegado en una línea', { plegado: t.plegado, estado: t.estado });
    comprueba(t.voz && t.voz.ve && t.voz.on && t.mosaico && !t.mosaico.ve, '4. «Voz cambiada» a la vista; sin imagen, no hay «Mosaico»', { voz: t.voz, mosaico: t.mosaico });
    comprueba(t.tarjeta && /^\d{6}$/.test(t.num), '4. la tarjeta roja también en el teléfono', t.num);
    await T.click('#ll-cod-si'); await espera(600);
    const tc = await vista(T);
    comprueba(tc.choque === false, '4. la píldora del código plegado no se monta encima de «Voz cambiada»', tc.choque);
    await hasta(async () => { const x = await vista(T); return x.filas.frag; }, 8000);
    const tf = await vista(T);
    comprueba(tf.filas.frag && /rechazados: 0$/.test(tf.filas.frag[2]) && tf.nivel === 'ok', '4. al empezar no salta ningún aviso falso: ningún fragmento rechazado y «Todo en orden»', { frag: tf.filas.frag, nivel: tf.nivel, estado: tf.estado });
    await T.click('#ll-mon-cab'); await espera(500);
    t = await vista(T);
    await T.screenshot({ path: path.join(OUT, '4-telefono-abierto.png') });
    comprueba(!t.plegado && t.filasVisibles && t.filas.huella && t.filas.sala, '4. al tocarlo se abre con todas sus filas', Object.keys(t.filas));
    await T.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1200);
  }
  await browser.close();
  console.log(fallos.length ? `\n${fallos.length} FALLOS` : '\nTODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
