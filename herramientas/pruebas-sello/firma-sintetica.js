// Solo para las pruebas del sello en los servidores (herramientas/pruebas-sello/servidor.sh): firma un documento como lo haría la página /firma/ (WebAuthn «get» en
// https://guardianagroup.com), con una llave de prueba generada aquí, que solo está en el llaves.json de la prueba.
// Uso: node firma-sintetica.js nueva <dir>            → crea <dir>/prueba.pem y escribe la llave pública (JSON) por la salida
//      node firma-sintetica.js firma <doc> <dir> <seq> → escribe la firma (JSON) por la salida
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const b64u = (b) => Buffer.from(b).toString('base64url');
const sha = (b) => crypto.createHash('sha256').update(b).digest();
const [orden, a, b, c] = process.argv.slice(2);
if (orden === 'nueva') {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  fs.writeFileSync(path.join(a, 'prueba.pem'), privateKey.export({ type: 'pkcs8', format: 'pem' }));
  const id = b64u(crypto.randomBytes(16));
  fs.writeFileSync(path.join(a, 'prueba.id'), id);
  console.log(JSON.stringify({ id, alg: -7, spki: publicKey.export({ type: 'spki', format: 'der' }).toString('base64'), nombre: 'llave de prueba', alta: '2026-11-01' }));
} else if (orden === 'firma') {
  const doc = fs.readFileSync(a);
  const llave = crypto.createPrivateKey(fs.readFileSync(path.join(b, 'prueba.pem')));
  const cd = Buffer.from(JSON.stringify({ type: 'webauthn.get', challenge: b64u(sha(doc)), origin: 'https://guardianagroup.com', crossOrigin: false }));
  const ad = Buffer.concat([sha(Buffer.from('guardianagroup.com')), Buffer.from([0x05]), Buffer.from([0, 0, 0, 1])]);
  const firma = crypto.sign('sha256', Buffer.concat([ad, sha(cd)]), { key: llave, dsaEncoding: 'der' });
  console.log(JSON.stringify({ seq: parseInt(c, 10), id: fs.readFileSync(path.join(b, 'prueba.id'), 'utf8'), authData: b64u(ad), clientDataJSON: b64u(cd), signature: b64u(firma) }));
}
