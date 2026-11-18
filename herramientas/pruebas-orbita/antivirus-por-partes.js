// El Antivirus por partes (dueño, 17 nov 2026, 21:17 y 21:57: «él escanea todo, pero también que podamos escanear por partes… un
// botón que escanee la cámara y el micrófono, otro los programas, otro los preinstalados… y al antivirus que tenga el PC»).
//   1. Dentro del programa, cada apartado de «Qué examina» es un botón; fuera (la web), no lo es.
//   2. «Cámara, micrófono, pantalla y ubicación»: solo se piden sus lecturas (no la de IA, ni quién vende, ni las conexiones de
//      24 horas…), el informe trae solo ese apartado, con su número de siempre (04), y la cabeza dice qué parte es.
//   3. Al terminar: «Volver a escanear» repite la misma parte; «Elegir otra parte» vuelve a la portada.
//   4. «Tu antivirus por dentro y con quién habla» trae también «Lo que anotó tu antivirus».
//   5. «Extensiones del navegador» no sale de la revisión de Windows: no se pide y termina enseguida.
//   6. «Estado del equipo» (el veredicto de todo) y «Escanear este equipo» son el escaneo completo: los 16 apartados.
// El programa se imita: las lecturas responden «200 {}» por el canal del programa, y se apunta cuáles se pidieron.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'antivirus-por-partes');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (ok || extra === undefined ? '' : '  ' + JSON.stringify(extra))); if (!ok) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { try { if (await fn()) return true; } catch (_) {} await espera(200); } return false; };

async function pagina(browser, programa) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 736 }, userAgent: PC, locale: 'es-CO' });
  await ctx.addInitScript((programa) => {
    if (!programa) return;
    const marca = () => { if (!document.documentElement) return false; document.documentElement.dataset.enPrograma = '1'; return true; };
    if (!marca()) new MutationObserver((_, o) => { if (marca()) o.disconnect(); }).observe(document, { childList: true });
    window.__pedidas = [];
    // el programa: la revisión de Windows «corre» un momento y termina; lo demás, «200 {}»
    let t0 = 0;
    document.addEventListener('guardiana-panel-pide', (e) => {
      let d = e.detail; try { d = JSON.parse(d); } catch (_) {}
      window.__pedidas.push(d.metodo + ' ' + d.ruta);
      let datos = {};
      if (d.ruta === '/api/revision/ahora') { t0 = Date.now(); datos = { disponible: true, corriendo: true, vivo: { n: 0, pasos: [], hechas: [] } }; }
      else if (d.ruta === '/api/revision') datos = Date.now() - t0 < 1500 ? { disponible: true, corriendo: true, vivo: { n: 0, pasos: [], hechas: [] } } : { disponible: true, corriendo: false, cuando: Date.now(), grupos: [{ id: 'privacidad', checks: [{ id: 'camara', estado: 'ok', frase: null, lista: [] }, { id: 'microfono', estado: 'aviso', frase: null, lista: [] }] }], resumen: { alerta: 0, aviso: 1, ok: 1, info: 0 } };
      setTimeout(() => document.dispatchEvent(new CustomEvent('guardiana-panel', { detail: JSON.stringify({ n: d.n, estado: 200, datos: JSON.stringify(datos) }) })), 50);
    });
  }, programa);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror'); });
  return p;
}
const informe = (P) => P.evaluate(() => ({ secs: [...document.querySelectorAll('.escaner .esc-secciones > section')].map((s) => s.id.slice(6)), nums: [...document.querySelectorAll('.escaner .esc-secciones .esc-num')].map((n) => n.textContent.trim()),
  indice: [...document.querySelectorAll('.escaner .esc-indice button, .escaner nav button[data-s]')].map((b) => b.dataset.s).filter(Boolean), parte: (() => { const x = document.querySelector('.escaner .esc-k-parte'); return x && !x.hidden ? x.textContent : ''; })(),
  titulo: (document.querySelector('#esc-titulo-2') || {}).textContent || '', botones: [...document.querySelectorAll('.escaner .esc-cabeza-acc button')].filter((b) => !b.hidden).map((b) => b.textContent.trim()) }));
const terminado = (P) => hasta(() => P.evaluate(() => { const b = document.querySelector('.escaner .esc-cabeza-acc .esc-otra:not(.suave)'); return !!b && !b.hidden; }), 40000);

(async () => {
  const browser = await chromium.launch();
  try {
    // ---- fuera del programa: la lista, sin botones ----
    const W = await pagina(browser, false);
    await W.goto(URL0 + '#escaner'); await espera(3500);
    const web = await W.evaluate(() => ({ items: document.querySelectorAll('.escaner .esc-examina li').length, botones: document.querySelectorAll('.escaner .esc-examina li button').length }));
    comprueba(web.items === 16 && web.botones === 0, '1. en la web, «Qué examina» es la lista de siempre (sin botones)', web);
    await W.close();

    // ---- dentro del programa ----
    const P = await pagina(browser, true);
    await P.goto(URL0 + '#escaner'); await espera(3500);
    const prog = await P.evaluate(() => ({ botones: [...document.querySelectorAll('.escaner .esc-examina li.parte button')].map((b) => b.dataset.parte), nota: (document.querySelector('.escaner .esc-partes-nota') || {}).textContent || '' }));
    comprueba(prog.botones.length === 16 && prog.botones[0] === 'estado' && prog.botones.includes('sensores') && prog.botones.includes('fabrica') && prog.botones.includes('antivirus') && prog.nota === 'Pulsa una parte para revisar solo esa.', '1. en el programa, cada apartado de «Qué examina» es un botón', prog);
    await P.evaluate(() => document.querySelector('.escaner .esc-examina').scrollIntoView({ block: 'center' })); await espera(300);
    await P.screenshot({ path: path.join(OUT, '01-portada-por-partes.png') });

    // 2. cámara y micrófono
    await P.evaluate(() => { window.__pedidas.length = 0; });
    await P.click('.escaner .esc-examina button[data-parte="sensores"]');
    comprueba(await terminado(P), '2. «Cámara, micrófono…»: el escaneo de esa parte termina');
    let pedidas = await P.evaluate(() => [...new Set(window.__pedidas)]);
    const noDebia = pedidas.filter((x) => /\/api\/(ia|quien-vende|por-dentro|identificacion|antivirus)/.test(x));
    comprueba(pedidas.includes('POST /api/revision/ahora') && pedidas.includes('GET /vigia') && noDebia.length === 0, '2. solo se piden las lecturas de esa parte', { pedidas, noDebia });
    let inf = await informe(P);
    comprueba(JSON.stringify(inf.secs) === '["sensores"]' && inf.nums[0] === '04' && inf.parte === 'Cámara, micrófono, pantalla y ubicación', '2. el informe trae solo ese apartado, con su número (04), y la cabeza dice qué parte es', inf);
    comprueba(inf.botones.includes('Volver a escanear') && inf.botones.includes('Elegir otra parte') && inf.botones.includes('Escanear este equipo'), '3. al terminar: «Volver a escanear», «Elegir otra parte» y «Escanear este equipo»', inf.botones);
    const top = await P.evaluate(() => document.querySelector('.escaner .esc-cuerpo').scrollTop);
    comprueba(top === 0, '2. y se ve desde arriba del todo', top);
    await P.screenshot({ path: path.join(OUT, '02-solo-camara-y-microfono.png') });

    // 3. volver a escanear: la misma parte; elegir otra: la portada
    await P.evaluate(() => { window.__pedidas.length = 0; });
    await P.click('.escaner .esc-cabeza-acc .esc-otra:not(.suave)'); await espera(400);
    comprueba(await terminado(P), '3. «Volver a escanear» repite');
    inf = await informe(P); pedidas = await P.evaluate(() => [...new Set(window.__pedidas)]);
    comprueba(JSON.stringify(inf.secs) === '["sensores"]' && !pedidas.some((x) => /\/api\/ia/.test(x)), '3. y repite la misma parte', { secs: inf.secs, pedidas });
    await P.evaluate(() => [...document.querySelectorAll('.escaner .esc-cabeza-acc button')].find((b) => b.textContent.trim() === 'Elegir otra parte').click()); await espera(500);
    const dePortada = await P.evaluate(() => { const p = document.querySelector('.escaner .esc-portada, .escaner [class*="portada"]'); return { botones: document.querySelectorAll('.escaner .esc-examina li.parte button').length, visible: !!document.querySelector('.escaner .esc-examina') && document.querySelector('.escaner .esc-examina').getBoundingClientRect().height > 0 }; });
    comprueba(dePortada.botones === 16 && dePortada.visible, '3. «Elegir otra parte» vuelve a la portada, con sus botones', dePortada);

    // 4. el antivirus: su apartado y lo que anotó
    await P.evaluate(() => { window.__pedidas.length = 0; });
    await P.evaluate(() => document.querySelector('.escaner .esc-examina button[data-parte="antivirus"]').click());
    comprueba(await terminado(P), '4. «Tu antivirus…»: termina');
    inf = await informe(P); pedidas = await P.evaluate(() => [...new Set(window.__pedidas)]);
    comprueba(JSON.stringify(inf.secs) === '["antivirus","defender"]' && pedidas.includes('GET /api/antivirus') && pedidas.includes('GET /api/antivirus/detectar') && !pedidas.some((x) => /\/api\/ia/.test(x)), '4. trae «Tu antivirus por dentro y con quién habla» y «Lo que anotó tu antivirus», con sus lecturas', { secs: inf.secs, pedidas });
    await P.screenshot({ path: path.join(OUT, '03-solo-antivirus.png') });

    // 5. extensiones: sin la revisión de Windows
    await P.evaluate(() => [...document.querySelectorAll('.escaner .esc-cabeza-acc button')].find((b) => b.textContent.trim() === 'Elegir otra parte').click()); await espera(500);
    await P.evaluate(() => { window.__pedidas.length = 0; });
    const t0 = Date.now();
    await P.evaluate(() => document.querySelector('.escaner .esc-examina button[data-parte="extensiones"]').click());
    comprueba(await terminado(P), '5. «Extensiones del navegador»: termina');
    const tardo = Date.now() - t0; inf = await informe(P); pedidas = await P.evaluate(() => [...new Set(window.__pedidas)]);
    comprueba(JSON.stringify(inf.secs) === '["extensiones"]' && !pedidas.some((x) => /revision|vigilancia/.test(x)) && pedidas.includes('GET /api/quien-vende') && tardo < 6000, '5. no pide la revisión de Windows ni la vigilancia, y termina enseguida', { secs: inf.secs, pedidas, tardo });

    // 6. el escaneo completo desde una parte, y «Estado del equipo»
    await P.evaluate(() => { window.__pedidas.length = 0; });
    await P.evaluate(() => [...document.querySelectorAll('.escaner .esc-cabeza-acc button')].find((b) => b.textContent.trim() === 'Escanear este equipo').click());
    comprueba(await terminado(P), '6. «Escanear este equipo» desde una parte: termina');
    inf = await informe(P); pedidas = await P.evaluate(() => [...new Set(window.__pedidas)]);
    comprueba(inf.secs.length === 16 && inf.parte === '' && pedidas.includes('GET /api/ia') && !inf.botones.includes('Elegir otra parte'), '6. es el escaneo completo: los 16 apartados y todas las lecturas', { n: inf.secs.length, parte: inf.parte, botones: inf.botones });
    await P.close();

    const Q = await pagina(browser, true);
    await Q.goto(URL0 + '#escaner'); await espera(3500);
    await Q.evaluate(() => document.querySelector('.escaner .esc-examina button[data-parte="estado"]').click());
    comprueba(await terminado(Q), '6. «Estado del equipo»: termina');
    inf = await informe(Q);
    comprueba(inf.secs.length === 16 && inf.parte === '', '6. «Estado del equipo» es el escaneo completo', { n: inf.secs.length, parte: inf.parte });
  } catch (err) {
    console.log('ERROR ' + (err && err.stack || err)); fallos.push('excepción');
  } finally {
    await browser.close();
    console.log(fallos.length ? 'FALLOS: ' + fallos.length + ' → ' + fallos.join(' | ') : 'TODO OK');
    process.exit(fallos.length ? 1 : 0);
  }
})();
