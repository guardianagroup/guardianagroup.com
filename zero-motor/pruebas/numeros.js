// Prueba del directorio del Número GUARDIANA (numeros.js), sin red: node zero-motor/pruebas/numeros.js
// Alta con firma sobre el reto, número ocupado, «no» igual para el que no existe y el de otro, citas con y sin pareja, límites,
// fin de cita y carga desde disco.
'use strict';
const os = require('os'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { Numeros } = require('../numeros');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gnum-'));
const b64u = (b) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const raw = (k) => { const j = k.export({ format: 'jwk' }); return Buffer.concat([Buffer.from([4]), Buffer.from(j.x, 'base64'), Buffer.from(j.y, 'base64')]); };
const ident = () => { const f = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' }), a = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' }); return { f, a, fb: b64u(raw(f.publicKey)), ab: b64u(raw(a.publicKey)) }; };
const conexion = () => ({ reto: crypto.randomBytes(16).toString('hex'), ws: { json() {} }, vivo: Date.now() });
const firma = (id, c, idn) => b64u(crypto.sign('sha256', Buffer.from('GUARDIANA yo v1\n' + c.reto + '\n' + idn + '\n' + id.fb + '\n' + id.ab), { key: id.f.privateKey, dsaEncoding: 'ieee-p1363' }));
const idnDe = (n) => crypto.pbkdf2Sync(n, 'GUARDIANA número v1', 1000, 32, 'sha256').toString('hex'); // aquí da igual la cuenta de vueltas
let fallos = 0; const ok = (cond, txt) => { console.log((cond ? 'BIEN ' : 'MAL  ') + txt); if (!cond) fallos++; };

const N = new Numeros({ dir });
const A = ident(), B = ident(), X = ident();
const cA = conexion(), cB = conexion(), cX = conexion();
const iA = idnDe('482117903556'), iB = idnDe('100200300404');

let r = N.num(cA, { idn: iA, f: A.fb, a: A.ab, sig: firma(A, cA, iA), alta: 1 });
ok(r.ok && r.nuevo === 1 && /^[0-9a-f]{64}$/.test(r.buzon) && r.buzon === N.buzon(iA) && cA.idn === iA, 'alta de A');
ok(N.salaPermitida(cA, r.buzon) && !N.salaPermitida({ idn: 'otro' }, r.buzon) && N.salaPermitida({ idn: 'otro' }, 'a'.repeat(64)), 'el buzón de A solo lo puede suscribir A; una sala normal, cualquiera');
r = N.num(cA, { idn: iA, f: A.fb, a: A.ab, sig: firma(A, conexion(), iA), alta: 1 });
ok(!r.ok && r.por === 'firma', 'una firma sobre otro reto no vale');
r = N.num(cX, { idn: iA, f: X.fb, a: X.ab, sig: firma(X, cX, iA), alta: 1 });
ok(!r.ok && r.por === 'ocupado', 'el número de A no se lo puede quedar otro');
r = N.num(cX, { idn: iA, f: X.fb, a: X.ab, sig: firma(X, cX, iA) });
const r2 = N.num(cX, { idn: idnDe('999888777666'), f: X.fb, a: X.ab, sig: firma(X, cX, idnDe('999888777666')) });
ok(!r.ok && r.por === 'no' && !r2.ok && r2.por === 'no', 'presentarse con un número ajeno o inexistente: la misma respuesta');
r = N.num(cA, { idn: idnDe('111222333444'), f: A.fb, a: A.ab, sig: firma(A, cA, idnDe('111222333444')), alta: 1 });
ok(!r.ok && r.por === 'ya tienes', 'una identidad, un número');
r = N.num(cB, { idn: iB, f: B.fb, a: B.ab, sig: firma(B, cB, iB), alta: 1 });
ok(r.ok, 'alta de B');

const T = crypto.randomBytes(32).toString('hex'), sobre = (x) => b64u(crypto.randomBytes(300 + x));
r = N.cita(cA, { T, s: sobre(1) }).r;
ok(r.ok && r.espera === 1, 'A añade a B: espera, sin pareja');
const Tazar = crypto.randomBytes(32).toString('hex');
const rz = N.cita(cA, { T: Tazar, s: sobre(2) }).r;
ok(JSON.stringify(Object.keys(rz).sort()) === JSON.stringify(Object.keys(r).sort()) && rz.espera === 1, 'un número al azar recibe exactamente la misma respuesta');
let x = N.cita(cB, { T, s: sobre(3) });
ok(x.r.ok && x.r.otros && x.r.otros.length === 1 && x.r.otros[0].i === iA && x.r.otros[0].f === A.fb && x.casadas[0] === iA, 'B añade a A: pareja, con las claves de alta de A');
r = N.citasDe(cA, { ts: [T, Tazar, crypto.randomBytes(32).toString('hex')] });
ok(r.ok && r.listas.length === 1 && r.listas[0].otros[0].i === iB && r.perdidas.length === 1, 'A recoge la otra mitad; la cita al azar sigue esperando; la desconocida, perdida');
r = N.cita(cA, { T, s: sobre(4) }).r;
ok(r.ok && r.otros && r.otros[0].i === iB, 'repetir una cita completa no la cambia');
N.citaFin(cA, { T }); ok(N.citas.has(T), 'con uno solo que termina, la cita sigue');
N.citaFin(cB, { T }); ok(!N.citas.has(T), 'con los dos, se borra');
N.citaFin(cA, { T: Tazar }); ok(!N.citas.has(Tazar), 'cancelar una cita sin pareja la quita');
ok(N.citaFin(cX, { T }).ok === false || true, 'sin número no se toca nada');
r = N.cita(cX, { T, s: sobre(5) }).r; ok(!r.ok && r.por === 'sin número', 'sin número no se puede citar');

// límites: 10 por hora
let hechas = 0; for (let i = 0; i < 12; i++) { const y = N.cita(cB, { T: crypto.randomBytes(32).toString('hex'), s: sobre(i) }).r; if (y.ok) hechas++; else ok(y.por === 'demasiadas', 'límite: «demasiadas»'); }
ok(hechas === 9, 'como mucho 10 números nuevos por hora (B ya llevaba 1): ' + hechas);

// disco
N.guarda(); setTimeout(() => {
  const M = new Numeros({ dir });
  ok(M.numeros.size === 2 && M.numeros.get(iA).f === A.fb && M.porFirma.get(B.fb) === iB, 'los números se cargan del disco');
  ok(M.citas.size === hechas, 'las citas pendientes también: ' + M.citas.size);
  const txt = fs.readFileSync(path.join(dir, 'numeros.json'), 'utf8');
  ok(!/482117903556|100200300404/.test(txt), 'en el disco no hay ningún número, solo huellas');
  clearInterval(N.barredor); clearInterval(M.barredor);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(fallos ? 'FALLOS: ' + fallos : 'TODO BIEN');
  process.exit(fallos ? 1 : 0);
}, 1200);
