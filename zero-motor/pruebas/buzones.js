// Buzón cifrado del relé (30 Oct 2026): guardar por trozos, sobrevivir a un reinicio, entregar solo al destinatario, borrar.
'use strict';
const fs = require('fs'); const os = require('os'); const path = require('path'); const crypto = require('crypto');
const { Buzones } = require('../buzones');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'buzones-'));
let fallos = 0; const ok = (c, t) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + t); if (!c) fallos++; };
const sala = crypto.randomBytes(32).toString('hex'), a = crypto.randomBytes(8).toString('hex'), b = crypto.randomBytes(8).toString('hex');
const id = crypto.randomBytes(16).toString('hex'), datos = crypto.randomBytes(1500 * 1024);
let bz = new Buzones({ dir });
const r1 = bz.deja(sala, a, b, id, 0, 2, datos.subarray(0, 960 * 1024), true);
ok(r1.ok && !r1.completo, 'el primer trozo se guarda a la espera del segundo');
const r2 = bz.deja(sala, a, b, id, 1, 2, datos.subarray(960 * 1024), true);
ok(r2.ok && r2.completo, 'con el segundo, el sobre está entero');
ok(bz.para(sala, a).length === 0, 'quien lo dejó no lo recibe');
bz = new Buzones({ dir }); // reinicio
const xs = bz.para(sala, b);
ok(xs.length === 1 && Buffer.compare(xs[0].datos, datos) === 0 && xs[0].de === a, 'tras reiniciar el relé, el destinatario lo recibe entero y sabe de quién es');
ok(bz.borra(sala, a, [id]) === 0, 'quien lo dejó no puede borrarlo');
ok(bz.borra(sala, b, [id]) === 1 && bz.para(sala, b).length === 0 && !fs.existsSync(path.join(dir, sala + '_' + id + '.bin')), 'el destinatario lo borra y desaparece del disco');
const r3 = bz.deja(sala, a, b, crypto.randomBytes(16).toString('hex'), 0, 1, crypto.randomBytes(7 * 1024 * 1024), false);
ok(!r3.ok, 'un sobre de más de 6 MB se rechaza');
fs.rmSync(dir, { recursive: true, force: true });
console.log(fallos ? 'FALLOS: ' + fallos : 'TODO BIEN');
