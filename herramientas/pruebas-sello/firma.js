// El sello de GUARDIANA de punta a punta (1 Nov 2026): crear la llave del dueño en /firma/, preparar una publicación,
// firmarla con la llave (un autenticador virtual de Chromium, con verificación del usuario), comprobarla con
// zero-motor/sello.js y ver que cualquier cambio (un archivo, el documento, otra llave, otro sitio) la invalida.
// Uso: RAIZ=<copia del repositorio servida en PUERTO> PUERTO=8090 node herramientas/pruebas-sello/firma.js
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'); const path = require('path');
const RAIZ = process.env.RAIZ, PUERTO = process.env.PUERTO || '8090';
const URL = `http://localhost:${PUERTO}/firma/`;
const ENV = Object.assign({}, process.env, { SELLO_ORIGEN: `http://localhost:${PUERTO}`, SELLO_RP: 'localhost' });
let ok = 0, mal = 0; const comprueba = (c, n, x) => { if (c) ok++; else { mal++; console.log('FALLO', n, x || ''); } };
const py = (...a) => execFileSync('python3', ['herramientas/sello.py', ...a], { cwd: RAIZ, env: ENV, encoding: 'utf8' });
const nodo = (...a) => { try { return { ok: true, out: execFileSync('node', ['zero-motor/sello.js', ...a], { cwd: RAIZ, env: ENV, encoding: 'utf8' }) }; } catch (e) { return { ok: false, out: String(e.stdout || e.message) }; } };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext(); const p = await c.newPage();
  const err = []; p.on('pageerror', (e) => err.push(e.message));
  const cdp = await c.newCDPSession(p);
  await cdp.send('WebAuthn.enable');
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } });
  // 1) sin llaves: la página ofrece crear la llave
  await p.goto(URL); await p.waitForTimeout(700);
  comprueba(await p.isVisible('#sin-llaves'), 'sin llaves: se ofrece crear la llave');
  await p.fill('#nombre', 'iPhone de prueba'); await p.click('#crear'); await p.waitForTimeout(900);
  const llave = await p.inputValue('#resultado textarea');
  comprueba(/"alg":-7/.test(llave) && /"spki":"MF/.test(llave), 'llave ES256 con su parte pública', llave.slice(0, 80));
  py('llave', llave);
  // 2) una publicación preparada se ve en la página, con su manifiesto comprobado
  py('preparar', '--nota', 'Primera publicación sellada (prueba)', '--servidores');
  await p.goto(URL); await p.waitForTimeout(1200);
  comprueba(await p.isVisible('#pendiente'), 'la publicación pendiente se ve');
  comprueba((await p.textContent('#p-man')).includes('✓'), 'manifiesto comprobado en la página', await p.textContent('#p-man'));
  comprueba(!(await p.isDisabled('#firmar')), 'se puede firmar');
  await p.screenshot({ path: path.join(process.env.SALIDA || '/tmp', 'firma-pendiente.png'), fullPage: true });
  // 3) firmar: la página comprueba la firma antes de dejar copiarla
  await p.click('#firmar'); await p.waitForTimeout(1200);
  const firma = await p.inputValue('#resultado textarea');
  comprueba(/"seq":1/.test(firma) && /"signature"/.test(firma), 'firma lista', firma.slice(0, 60));
  await p.screenshot({ path: path.join(process.env.SALIDA || '/tmp', 'firma-lista.png'), fullPage: true });
  const salida = py('firma', firma);
  comprueba(/firmada y vigente/.test(salida), 'la firma entra en el sello', salida);
  // 4) los servidores: zero-motor/ es exactamente lo firmado
  let r = nodo('publicacion', '.', 'zero-motor');
  comprueba(r.ok && /"ok":true/.test(r.out), 'publicación y zero-motor comprobados', r.out);
  // 5) un archivo cambiado en zero-motor: no vale
  const f = path.join(RAIZ, 'zero-motor', 'LEEME.md'); const antes = fs.readFileSync(f);
  fs.appendFileSync(f, '\nmanipulado\n'); r = nodo('publicacion', '.', 'zero-motor');
  comprueba(!r.ok && /cambiado: zero-motor\/LEEME.md/.test(r.out), 'un archivo cambiado se detecta', r.out); fs.writeFileSync(f, antes);
  // 6) un archivo de más: no vale
  fs.writeFileSync(path.join(RAIZ, 'zero-motor', 'intruso.js'), 'process.exit(0)'); r = nodo('publicacion', '.', 'zero-motor');
  comprueba(!r.ok && /de más: zero-motor\/intruso.js/.test(r.out), 'un archivo de más se detecta', r.out); fs.unlinkSync(path.join(RAIZ, 'zero-motor', 'intruso.js'));
  // 6b) el modo de los servidores: con las llaves instaladas aparte (no las que trae la versión)
  const instaladas = path.join(process.env.SALIDA || '/tmp', 'sello-llaves-instaladas.json');
  fs.copyFileSync(path.join(RAIZ, 'sello', 'llaves.json'), instaladas);
  const servidor = (extra) => { try { return { ok: true, out: execFileSync('node', ['zero-motor/sello.js', 'servidor', '.', 'zero-motor'], { cwd: RAIZ, env: Object.assign({}, ENV, { SELLO_LLAVES: instaladas }, extra || {}), encoding: 'utf8' }) }; } catch (e) { return { ok: false, out: String(e.stdout || e.message) }; } };
  r = servidor(); comprueba(r.ok && /"seq":1/.test(r.out), 'servidor: la versión firmada vale', r.out);
  r = servidor({ SELLO_LLAVES: path.join(RAIZ, 'no-existe.json') }); comprueba(!r.ok && /no tiene las llaves/.test(r.out), 'servidor sin llaves instaladas: no se actualiza', r.out);
  r = servidor({ SELLO_MINIMO: '2' }); comprueba(!r.ok && /anterior a la aplicada/.test(r.out), 'servidor: no se vuelve a una publicación anterior', r.out);
  fs.symlinkSync('LEEME.md', path.join(RAIZ, 'zero-motor', 'enlace')); r = servidor();
  comprueba(!r.ok && /no es un archivo: zero-motor\/enlace/.test(r.out), 'servidor: un enlace en zero-motor no vale', r.out); fs.unlinkSync(path.join(RAIZ, 'zero-motor', 'enlace'));
  fs.mkdirSync(path.join(RAIZ, 'zero-motor', 'node_modules', 'x'), { recursive: true }); fs.writeFileSync(path.join(RAIZ, 'zero-motor', 'node_modules', 'x', 'index.js'), '');
  r = servidor(); comprueba(!r.ok && /de más: zero-motor\/node_modules\/x\/index.js/.test(r.out), 'servidor: no se salta ninguna carpeta', r.out);
  fs.rmSync(path.join(RAIZ, 'zero-motor', 'node_modules'), { recursive: true });
  const fll = path.join(RAIZ, 'sello', 'llaves.json'); const llAntes = fs.readFileSync(fll);
  const llOtra = JSON.parse(llAntes); llOtra.llaves.push(Object.assign({}, llOtra.llaves[0], { id: 'otra', nombre: 'otra' })); fs.writeFileSync(fll, JSON.stringify(llOtra));
  r = servidor(); comprueba(!r.ok && /llaves de esta versión no son las firmadas/.test(r.out), 'servidor: una llave añadida sin firma no vale', r.out); fs.writeFileSync(fll, llAntes);
  r = servidor(); comprueba(r.ok, 'servidor: todo en su sitio otra vez', r.out);
  // 7) el documento cambiado (por ejemplo, otro manifiesto): la firma ya no vale
  const d = path.join(RAIZ, 'sello', 'publicaciones', '1.doc.json'); const doc = fs.readFileSync(d);
  fs.writeFileSync(d, Buffer.from(doc.toString().replace('"servidores":true', '"servidores":false'))); r = nodo('publicacion', '.');
  comprueba(!r.ok && /reto no es este documento/.test(r.out), 'documento cambiado: firma inválida', r.out); fs.writeFileSync(d, doc);
  // 8) otra llave en llaves.json no puede hacer pasar una firma ajena; y firmada para otro sitio no vale
  r = (() => { try { return { ok: true, out: execFileSync('node', ['zero-motor/sello.js', 'publicacion', '.'], { cwd: RAIZ, env: process.env, encoding: 'utf8' }) }; } catch (e) { return { ok: false, out: String(e.stdout) }; } })();
  comprueba(!r.ok && /otro sitio/.test(r.out), 'firmada en localhost no vale para guardianagroup.com', r.out);
  // 9) una publicación nueva tiene que ser posterior
  py('preparar', '--nota', 'Segunda (prueba)');
  await p.goto(URL); await p.waitForTimeout(1200);
  comprueba((await p.textContent('#p-num')).includes('nº 2'), 'la segunda aparece pendiente');
  comprueba(/archivos cambian respecto a la nº 1/.test(await p.textContent('#p-ncambios')), 'dice qué cambia respecto a la anterior', await p.textContent('#p-ncambios'));
  // sin verificación del usuario (UV), la firma no se acepta
  await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: false });
  await p.click('#firmar'); await p.waitForTimeout(1200);
  const avisoUV = await p.isVisible('#aviso');
  comprueba(avisoUV, 'sin Face ID ni PIN no hay firma', await p.textContent('#aviso'));
  comprueba(!err.length, 'sin errores en la página', err.join(' | '));
  console.log(`pruebas-sello/firma: ${ok} OK, ${mal} fallos`);
  await b.close();
})();
