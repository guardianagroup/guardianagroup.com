#!/usr/bin/env node
/* Comprueba la Content-Security-Policy de toda la web en un navegador de verdad (29 Oct 2026; pareja de csp-hashes.py).

   Sirve la raíz del repositorio con `python3 -m http.server` (127.0.0.1, puerto 8081 salvo que se diga otro), abre CADA
   página .html de la web (la misma lista que csp-hashes.py) en Chromium sin ventana (Playwright), espera 1,5 s tras la
   carga y recoge los mensajes de consola que contienen «Refused to» o «Content Security Policy» y los errores de página
   (pageerror). Objetivo: cero violaciones. Para las páginas de la app (orbita/comunicaciones, m/, e/) basta con cargarlas:
   sus errores de red (el relé ws://127.0.0.1:8794, el motor) no son de la política y se cuentan aparte, solo a título
   informativo.

   También busca en el DOM ya construido los manejadores en línea (onclick="…", href="javascript:…"), que el navegador no
   denuncia al cargar sino al dispararse el evento: cuentan como violación.

   Uso:  node herramientas/csp-comprueba.js [raíz] [--puerto 8081] [--servidor http://127.0.0.1:8080] [--hilos 4]
                                            [--espera 1500] [--tiempo 30000] [--solo 'orbita/'] [--con-sw]
         --servidor: usar uno que ya esté sirviendo ESA MISMA raíz (si no, se comprueban otros archivos); sin él, se arranca uno.
         --hilos: páginas a la vez · --espera: ms tras la carga · --tiempo: ms máximos de carga · --solo: expresión regular de rutas
         · --con-sw: deja que las páginas registren su service worker (por defecto se bloquea, para que cada pasada sea igual).
   Sale con 1 si hay alguna violación o error de página. */
'use strict';
const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const OPCIONES = { '--puerto': '8081', '--servidor': null, '--hilos': '4', '--espera': '1500', '--solo': null, '--tiempo': '30000' };
const sueltos = [];
let CON_SW = false; // por defecto los service workers se bloquean (resultados iguales en cada pasada); --con-sw los deja registrarse
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a in OPCIONES) OPCIONES[a] = process.argv[++i];
  else if (a === '--con-sw') CON_SW = true;
  else if (a.startsWith('--')) throw new Error('opción desconocida: ' + a);
  else sueltos.push(a);
}
const RAIZ = path.resolve(sueltos[0] || path.join(__dirname, '..'));
const PUERTO = parseInt(OPCIONES['--puerto'], 10);
const SERVIDOR = OPCIONES['--servidor'];
const HILOS = parseInt(OPCIONES['--hilos'], 10);
const ESPERA = parseInt(OPCIONES['--espera'], 10);
const SOLO = OPCIONES['--solo'] ? new RegExp(OPCIONES['--solo']) : null;
const TIEMPO = parseInt(OPCIONES['--tiempo'], 10);
// Misma lista que csp-hashes.py: fuera v/, descargas/, node_modules/, .git/, .claude/, zero-motor/, herramientas/, extension/
// y los google*.html de la raíz (verificación de Google, no son páginas).
const FUERA = ['v/', 'descargas/', 'node_modules/', '.git/', '.claude/', 'zero-motor/', 'herramientas/', 'extension/'];

function paginas() {
  const out = [];
  const anda = (dir, rel) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const r = rel + e.name;
      if (e.isDirectory()) { if (!FUERA.some((f) => (r + '/').startsWith(f))) anda(path.join(dir, e.name), r + '/'); continue; }
      if (!e.name.endsWith('.html')) continue;
      if (rel === '' && e.name.startsWith('google')) continue;
      out.push(r);
    }
  };
  anda(RAIZ, '');
  return out.sort();
}

function puertoLibre(puerto) {
  return new Promise((ok) => {
    const s = net.createServer();
    s.once('error', () => ok(false));
    s.once('listening', () => s.close(() => ok(true)));
    s.listen(puerto, '127.0.0.1');
  });
}

async function arrancaServidor() {
  if (SERVIDOR) return { base: SERVIDOR.replace(/\/$/, ''), para: () => {} };
  if (!(await puertoLibre(PUERTO))) throw new Error(`el puerto ${PUERTO} está ocupado: pasa --puerto N o --servidor http://127.0.0.1:${PUERTO} si ya sirve esta misma raíz`);
  const p = spawn('python3', ['-m', 'http.server', String(PUERTO), '--bind', '127.0.0.1'], { cwd: RAIZ, stdio: ['ignore', 'ignore', 'ignore'] });
  for (let i = 0; i < 50; i++) { // hasta 5 s a que escuche
    if (!(await puertoLibre(PUERTO))) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  return { base: `http://127.0.0.1:${PUERTO}`, para: () => { try { p.kill(); } catch (_) {} } };
}

const esViolacion = (t) => /Refused to|Content Security Policy/i.test(t);

// Los manejadores en línea (onclick="…", href="javascript:…") no dan violación al cargar: el navegador los corta cuando se
// dispara el evento. Se buscan en el DOM ya construido (también los que un script hubiera generado) y cuentan como violación.
const BUSCA_MANEJADORES = () => {
  const out = [];
  for (const e of document.querySelectorAll('*')) {
    for (const a of e.attributes) {
      if (/^on[a-z]+$/i.test(a.name)) out.push(`<${e.tagName.toLowerCase()} ${a.name}="${a.value.slice(0, 60)}">`);
      if (/^(href|src|action|formaction)$/i.test(a.name) && /^\s*javascript:/i.test(a.value)) out.push(`<${e.tagName.toLowerCase()} ${a.name}="${a.value.slice(0, 60)}">`);
    }
  }
  return out;
};

async function compruebaPagina(context, base, rel) {
  const page = await context.newPage();
  const violaciones = [], errores = [], otros = [];
  page.on('console', (m) => { const t = m.text(); if (esViolacion(t)) violaciones.push(t); else if (m.type() === 'error') otros.push(t); });
  page.on('pageerror', (e) => errores.push(String(e && e.message || e)));
  let carga = 'ok';
  try {
    await page.goto(`${base}/${rel}`, { waitUntil: 'load', timeout: TIEMPO });
  } catch (e) { carga = 'tiempo'; }
  try { await page.waitForTimeout(ESPERA); } catch (_) {}
  try { for (const m of await page.evaluate(BUSCA_MANEJADORES)) violaciones.push('manejador en línea (bloqueado al dispararse): ' + m); } catch (_) {}
  try { await page.close(); } catch (_) {}
  return { rel, carga, violaciones, errores, otros };
}

async function main() {
  const lista = paginas().filter((r) => !SOLO || SOLO.test(r));
  if (!lista.length) throw new Error('ninguna página que comprobar');
  const srv = await arrancaServidor();
  const browser = await chromium.launch();
  const resultados = [];
  let i = 0;
  const hilo = async () => {
    const context = await browser.newContext({ serviceWorkers: CON_SW ? 'allow' : 'block' });
    while (i < lista.length) {
      const rel = lista[i++];
      const r = await compruebaPagina(context, srv.base, rel);
      resultados.push(r);
      const n = r.violaciones.length + r.errores.length;
      process.stdout.write(`${n ? 'MAL ' : 'ok  '}${rel}${n ? `  (${r.violaciones.length} violaciones, ${r.errores.length} errores)` : ''}${r.carga !== 'ok' ? '  [carga lenta: >30 s]' : ''}\n`);
    }
    await context.close();
  };
  await Promise.all(Array.from({ length: Math.max(1, HILOS) }, hilo));
  await browser.close();
  srv.para();
  resultados.sort((a, b) => (a.rel < b.rel ? -1 : 1));
  const malas = resultados.filter((r) => r.violaciones.length || r.errores.length);
  const unicos = (xs) => [...new Set(xs)];
  console.log('\n=== RESUMEN ===');
  console.log(`páginas: ${resultados.length} · con violaciones de CSP: ${resultados.filter((r) => r.violaciones.length).length} · con errores de página: ${resultados.filter((r) => r.errores.length).length} · violaciones en total: ${resultados.reduce((s, r) => s + r.violaciones.length, 0)}`);
  for (const r of malas) {
    console.log(`\n${r.rel}: ${r.violaciones.length} violaciones, ${r.errores.length} errores`);
    for (const v of unicos(r.violaciones)) console.log('  CSP: ' + v.slice(0, 400));
    for (const e of unicos(r.errores)) console.log('  ERROR: ' + e.slice(0, 300));
  }
  const conOtros = resultados.filter((r) => r.otros.length);
  if (conOtros.length) {
    console.log(`\n(informativo, no son de la política) páginas con otros errores de consola: ${conOtros.length}`);
    for (const r of conOtros) console.log(`  ${r.rel}: ${unicos(r.otros).map((t) => t.slice(0, 160)).join(' | ')}`);
  }
  process.exit(malas.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
