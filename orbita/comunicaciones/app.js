// GUARDIANA · Comunicaciones · la aplicación (26 Oct 2026). Identidad, invitaciones, sesiones, mensajes, archivos,
// llamadas y la pantalla. Lo que se guarda (IndexedDB «guardiana-com») queda en este navegador y se cifra en reposo con
// una clave que también vive aquí; «Destruir» lo borra en los dos lados. El relé nunca recibe nada legible.
'use strict';
(() => {
  const C = window.GuardianaCripto, $ = (s) => document.querySelector(s), T = (s) => (window.GuardianaIdioma ? GuardianaIdioma.t(s) : s);
  const LOC = () => (window.GuardianaIdioma && GuardianaIdioma.locale) || 'es';
  const TROZO = 192 * 1024, VENTANA = 12;
  const ORIGEN = location.origin + location.pathname.replace(/[^/]*$/, '');
  const LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);

  // ---------- almacén ----------
  const BD = (() => {
    let db = null;
    const abre = () => new Promise((res, rej) => {
      const r = indexedDB.open('guardiana-com', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore('yo', { keyPath: 'id' });
        d.createObjectStore('conv', { keyPath: 'id' });
        d.createObjectStore('msg', { keyPath: 'id' }).createIndex('conv', 'conv');
        d.createObjectStore('arch', { keyPath: 'id' }).createIndex('conv', 'conv');
      };
      r.onsuccess = () => { db = r.result; res(db); }; r.onerror = () => rej(r.error);
    });
    const tx = (st, modo, f) => new Promise((res, rej) => { const t = db.transaction(st, modo); const o = t.objectStore(st); const q = f(o); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
    const pon = (st, v) => tx(st, 'readwrite', (o) => o.put(v));
    const saca = (st, k) => tx(st, 'readonly', (o) => o.get(k));
    const todos = (st) => tx(st, 'readonly', (o) => o.getAll());
    const porConv = (st, c) => tx(st, 'readonly', (o) => o.index('conv').getAll(c));
    const borra = (st, k) => tx(st, 'readwrite', (o) => o.delete(k));
    const borraConv = async (st, c) => { const xs = await porConv(st, c); for (const x of xs) await borra(st, x.id); };
    return { abre, pon, saca, todos, porConv, borra, borraConv };
  })();

  // ---------- estado ----------
  let YO = null;            // { firma, acuerdo, firmaPub, acuerdoPub, nombre, reposo, huella }
  const CONVS = new Map();  // sala → conv
  let ACTUAL = null;        // sala abierta
  let R = null;
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : C.hex(C.azar(16)));
  const inicial = (n) => ((n || '').trim()[0] || '·').toUpperCase();

  // cifrado en reposo (clave local no exportable; nonce aleatorio por registro)
  async function guardaSellado(obj) { const iv = C.azar(12); const datos = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, YO.reposo, C.te.encode(JSON.stringify(obj)))); return { iv, datos }; }
  async function leeSellado(r) { try { return JSON.parse(C.td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: r.iv }, YO.reposo, r.datos))); } catch (_) { return null; } }

  // ---------- identidad ----------
  async function cargaIdentidad() {
    let y = await BD.saca('yo', 'yo');
    if (!y) {
      const id = await C.creaIdentidad();
      const reposo = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      y = { id: 'yo', firma: id.firma, acuerdo: id.acuerdo, firmaPub: id.firmaPub, acuerdoPub: id.acuerdoPub, nombre: '', reposo, creado: Date.now() };
      await BD.pon('yo', y);
      y.nueva = true;
    }
    YO = y; YO.huella = await C.huella(y.firmaPub, y.acuerdoPub);
  }
  async function guardaNombre(n) {
    YO.nombre = String(n || '').trim().slice(0, 40);
    try { const y = await BD.saca('yo', 'yo'); y.nombre = YO.nombre; await BD.pon('yo', y); } catch (e) { console.warn('nombre', e); }
    for (const c of CONVS.values()) if (c.sesion) enviaControl(c, { tipo: 'nombre', nombre: YO.nombre });
  }

  // ---------- conversaciones ----------
  async function yoId(sala) { return C.hex(await C.sha256(C.te.encode('GUARDIANA miembro\n' + sala + '\n' + C.hex(YO.huella)))).slice(0, 16); }
  function convNueva(sala, semilla, rol) {
    return { id: sala, semilla, rol, estado: 'invitacion', nombre: '', firmaPub: null, acuerdoPub: null, huella: null, verificada: false, creado: Date.now(), ultimo: Date.now(), ultimoTexto: null, noLeidos: 0 };
  }
  const guardable = (c) => ({ id: c.id, tumba: c.tumba, semilla: c.semilla, rol: c.rol, estado: c.estado, nombre: c.nombre, firmaPub: c.firmaPub, acuerdoPub: c.acuerdoPub, huella: c.huella, verificada: c.verificada, creado: c.creado, ultimo: c.ultimo, ultimoTexto: c.ultimoTexto, noLeidos: c.noLeidos, pqVisto: !!c.pqVisto });
  const guardaConv = (c) => BD.pon('conv', guardable(c));
  async function preparaConv(c) {
    const d = await C.deSemilla(c.semilla);
    c.presentacion = d.presentacion; c.psk = d.psk; c.yo = await yoId(c.id);
    c.miembros = new Set(); c.sesion = null; c.sesiones = new Map(); c.ef = null; c.epoca = null; c.mensajes = []; c.cola = []; c.enviando = false; c.archivos = new Map();
    c.suId = c.huella ? C.hex(await C.sha256(C.te.encode('GUARDIANA miembro\n' + c.id + '\n' + C.hex(c.huella)))).slice(0, 16) : null;
    CONVS.set(c.id, c);
    R.entra(c.id, c.yo);
  }
  // Una sola conversación (dueño, 26 Oct 20:04): al abrir, queda la activa más reciente; las invitaciones sin usar y las
  // conversaciones de versiones anteriores se borran (si la otra persona vuelve, recibe la orden de borrado).
  async function cargaConvs() {
    const xs = (await BD.todos('conv')).sort((a, b) => (b.creado || 0) - (a.creado || 0));
    const viva = xs.find((x) => x.huella && x.estado !== 'destruida_pendiente');
    for (const x of xs) {
      // las marcas de borrado pendiente (sin contenido) caducan a las 24 horas
      if (x.estado === 'destruida_pendiente' && Date.now() - (x.tumba || x.creado || 0) > 24 * 3600 * 1000) { await BD.borra('conv', x.id); continue; }
      if (x === viva || x.estado === 'destruida_pendiente') { await preparaConv(x); continue; }
      if (!x.huella) { await BD.borraConv('msg', x.id); await BD.borraConv('arch', x.id); await BD.borra('conv', x.id); continue; }
      x.estado = 'destruida_pendiente'; x.tumba = Date.now(); x.ultimoTexto = null; x.noLeidos = 0;
      await BD.borraConv('msg', x.id); await BD.borraConv('arch', x.id); await BD.pon('conv', x); await preparaConv(x);
    }
    pintaLista();
  }
  // Invitación por código (dueño, 26 Oct 20:00: «un número en pantalla, la otra persona lo pone; sencillísimo»). El secreto
  // de la conversación (32 bytes) se cierra con una clave derivada del código (PBKDF2) y ese «sobre» se deja en el relé
  // durante 10 minutos, una sola vez; el relé no puede abrirlo sin el código y limita los intentos de búsqueda.
  async function creaInvitacion() {
    if (!R.abierto) { aviso(T('Sin conexión: espera un momento.')); return; }
    for (const c of [...CONVS.values()]) await destruye(c, true);
    const semilla = C.nuevaSemilla();
    const d = await C.deSemilla(semilla);
    const c = convNueva(d.sala, semilla, 'invita');
    await preparaConv(c); // no se guarda hasta que la otra persona entra: recargar la página la deja atrás
    abreConv(c.id);
    muestraInvitacion(c); await publicaCodigo(c);
  }
  async function publicaCodigo(c) {
    for (let intento = 0; intento < 3; intento++) {
      const codigo = C.nuevoCodigo(), sal = C.azar(16), iv = C.azar(12);
      const k = await C.claveDeCodigo(codigo, sal);
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: C.te.encode('GUARDIANA sobre') }, k, c.semilla));
      const r = await R.invita(codigo, C.b64u(C.cat(iv, ct)), C.b64u(sal));
      if (r && r.ok) { c.codigo = codigo; c.codigoCaduca = r.caduca || (Date.now() + 10 * 60 * 1000); pintaCodigo(c); pintaLista(); return true; }
      if (!r || r.por !== 'repetido') break;
    }
    c.codigo = null; pintaCodigo(c); aviso(T('No se pudo crear el código: inténtalo otra vez.')); return false;
  }
  const codigoBonito = (k) => k ? k.replace(/(\d{3})(?=\d)/g, '$1-') : '···-···-···';
  async function aceptaCodigo(texto) {
    const codigo = String(texto || '').replace(/\D/g, '');
    if (codigo.length !== 9) return 'formato';
    const r = await R.busca(codigo);
    if (!r || !r.ok) return (r && r.por) || 'no vale';
    let semilla = null;
    try {
      const sobre = C.deB64u(r.sobre), sal = C.deB64u(r.sal);
      const k = await C.claveDeCodigo(codigo, sal);
      semilla = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: sobre.subarray(0, 12), additionalData: C.te.encode('GUARDIANA sobre') }, k, sobre.subarray(12)));
    } catch (_) { return 'no vale'; }
    if (semilla.length !== 32) return 'no vale';
    return (await aceptaSemilla(semilla)) ? 'ok' : 'no vale';
  }
  async function aceptaSemilla(semilla) {
    const d = await C.deSemilla(semilla);
    if (CONVS.has(d.sala)) { abreConv(d.sala); return true; }
    for (const c of [...CONVS.values()]) await destruye(c, true);
    const c = convNueva(d.sala, semilla, 'acepta');
    await guardaConv(c); await preparaConv(c);
    pintaLista(); abreConv(c.id);
    return true;
  }
  // enlaces #i= antiguos (ya no se muestran, pero uno guardado sigue abriendo su conversación)
  async function aceptaInvitacion(enlace) {
    let semilla = null;
    try { const m = String(enlace).match(/#i=([A-Za-z0-9_-]{43})/); if (m) semilla = C.deB64u(m[1]); } catch (_) {}
    if (!semilla || semilla.length !== 32) return false;
    return aceptaSemilla(semilla);
  }

  // ---------- presentación y sesión ----------
  // Quién inicia: de las dos huellas, la menor. Quien inicia se presenta cuando llega o ve llegar; quien responde solo
  // contesta a una presentación (con «resp» = la época a la que contesta) y deriva la sesión en ese momento; quien
  // inicia deriva al recibir la respuesta a su época vigente. Así los dos usan el mismo par de efímeras.
  const soyInicio = (c) => !c.huella || C.hex(YO.huella) < C.hex(c.huella);
  // presentarse va por la misma cola que las tramas de la conversación: nunca dos efímeras a medio camino
  const enCola = (c, f) => { c.proc = (c.proc || Promise.resolve()).then(f).catch((e) => console.warn(e)); return c.proc; };
  const reintenta = (c, ms) => { clearTimeout(c.reintento); c.reintento = setTimeout(() => { if (!c.sesion && c.suId && c.miembros.has(c.suId) && R.abierto) enCola(c, () => presenta(c, null, true)); }, ms); };
  // Devuelve, cuando responde con ML-KEM, el secreto híbrido { ss, ek, ct } para derivar la sesión v3; si no, null.
  async function presenta(c, resp, forzar) {
    if (c.estado === 'destruida' || !R.abierto) return null;
    // una presentación espontánea en reacción a otra espontánea no se repite en ráfaga: si hace falta, el reintento la manda
    if (!resp && !forzar && c.presentadoEn && Date.now() - c.presentadoEn < 1200) { reintenta(c, 1400); return null; }
    c.ef = await C.efimera(); c.epoca = C.azar(16);
    // híbrido poscuántico (v3): quien inicia lleva una clave ML-KEM-768 nueva en cada presentación; quien responde
    // encapsula a la clave de la presentación que contesta. Sin la librería, o con una versión anterior, queda en v2.
    if (!resp && soyInicio(c) && C.hayPQ()) { try { c.ef.kem = C.kemPar(); } catch (e) { console.warn('ML-KEM', e); c.ef.kem = null; } }
    let pq = null;
    if (resp && resp.ek && C.hayPQ()) { try { const k = C.kemEncapsula(resp.ek); pq = { ss: k.ss, ek: resp.ek, ct: k.ct }; } catch (e) { console.warn('ML-KEM', e); pq = null; } }
    // las últimas efímeras propias, por época: una respuesta a cualquiera de ellas vale para derivar sesión
    c.efs = c.efs || new Map(); c.efs.set(C.hex(c.epoca), c.ef); for (const k of [...c.efs.keys()].slice(0, -4)) { const v = c.efs.get(k); if (v && v.kem) { v.kem.dk.fill(0); v.kem = null; } c.efs.delete(k); }
    // ronda 48: la firma ata la transcripción. Quien responde firma también la huella y la efímera de quien inicia.
    const datos = resp ? await C.datosResponde(c.id, YO.firmaPub, YO.acuerdoPub, c.ef.pub, c.epoca, resp.epoca, c.huella, resp.ef) : C.datosInicia(c.id, YO.firmaPub, YO.acuerdoPub, c.ef.pub, c.epoca);
    const sig = await C.firma(YO, datos);
    const j = { v: 2, firmaPub: C.b64u(YO.firmaPub), acuerdoPub: C.b64u(YO.acuerdoPub), ef: C.b64u(c.ef.pub), epoca: C.b64u(c.epoca), resp: resp ? C.b64u(resp.epoca) : '', nombre: YO.nombre, sig: C.b64u(sig) };
    // la segunda firma (v3) cubre además los campos ML-KEM; las versiones anteriores la ignoran y usan «sig»
    if (c.ef.kem) { j.kem = C.b64u(c.ef.kem.ek); j.sig3 = C.b64u(await C.firma(YO, C.datosInicia(c.id, YO.firmaPub, YO.acuerdoPub, c.ef.pub, c.epoca, c.ef.kem.ek))); }
    if (pq) { j.kemct = C.b64u(pq.ct); j.sig3 = C.b64u(await C.firma(YO, await C.datosResponde(c.id, YO.firmaPub, YO.acuerdoPub, c.ef.pub, c.epoca, resp.epoca, c.huella, resp.ef, pq))); }
    const iv = C.azar(12);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new Uint8Array([1]) }, c.presentacion, C.te.encode(JSON.stringify(j))));
    R.manda(c.id, c.suId || null, C.cat(new Uint8Array([1]), iv, ct));
    c.presentadoEn = Date.now();
    if (!resp) reintenta(c, 4000 + Math.random() * 1500);
    return pq;
  }
  async function recibePresentacion(c, de, b) {
    if (b.length < 30) return;
    let j;
    try { j = JSON.parse(C.td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.subarray(1, 13), additionalData: new Uint8Array([1]) }, c.presentacion, b.subarray(13)))); } catch (_) { return; }
    try {
      if (j.v !== 2) return;
      const firmaPub = C.deB64u(j.firmaPub), acuerdoPub = C.deB64u(j.acuerdoPub), ef = C.deB64u(j.ef), epoca = C.deB64u(j.epoca), sig = C.deB64u(j.sig), resp = j.resp ? C.deB64u(j.resp) : null;
      if (firmaPub.length !== 65 || acuerdoPub.length !== 65 || ef.length !== 65 || epoca.length !== 16 || (resp && resp.length !== 16)) return;
      // campos del híbrido (v3): la clave ML-KEM solo en una presentación que inicia, el texto cifrado solo en una
      // respuesta, y cualquiera de los dos solo con su segunda firma
      const kemEk = j.kem ? C.deB64u(j.kem) : null, kemCt = j.kemct ? C.deB64u(j.kemct) : null, sig3 = j.sig3 ? C.deB64u(j.sig3) : null;
      if ((kemEk && (resp || kemEk.length !== C.KEM_EK)) || (kemCt && (!resp || kemCt.length !== C.KEM_CT)) || ((kemEk || kemCt) && !sig3)) return;
      const huella = await C.huella(firmaPub, acuerdoPub);
      if (C.hex(huella) === C.hex(YO.huella)) return; // yo mismo desde otra pestaña
      if (c.huella && C.hex(c.huella) !== C.hex(huella)) { R.manda(c.id, de, new Uint8Array([5])); c.intrusos = (c.intrusos || 0) + 1; vigila(c, T('Intento de entrada con otra identidad: rechazado; la conversación sigue intacta.'), 'mal'); if (!c.intrusoAvisado) { c.intrusoAvisado = true; await anotaSistema(c, 'Alguien con otra identidad intentó entrar en esta conversación: rechazado.'); } pintaRadio(c); return; } // la invitación ya es de otra persona
      // una época nunca se acepta dos veces (repetición)
      c.epocasVistas = c.epocasVistas || new Set(); const eh = C.hex(epoca); if (c.epocasVistas.has(eh)) return; c.epocasVistas.add(eh); if (c.epocasVistas.size > 64) c.epocasVistas.delete(c.epocasVistas.values().next().value);
      const efMia = resp && c.efs ? c.efs.get(C.hex(resp)) : null;
      const datos = resp ? (efMia ? await C.datosResponde(c.id, firmaPub, acuerdoPub, ef, epoca, resp, YO.huella, efMia.pub) : null) : C.datosInicia(c.id, firmaPub, acuerdoPub, ef, epoca);
      if (!datos) return; // respuesta a una época que no es de las últimas mías: fuera
      if (!(await C.verifica(firmaPub, sig, datos))) return;
      // la segunda firma ata los campos ML-KEM a esta presentación; si no cuadra, la presentación entera se descarta
      if (kemEk && !(await C.verifica(firmaPub, sig3, C.datosInicia(c.id, firmaPub, acuerdoPub, ef, epoca, kemEk)))) return;
      if (kemCt) {
        if (!efMia.kem) return; // un texto cifrado para una clave ML-KEM que no mandé (o que ya se usó)
        if (!(await C.verifica(firmaPub, sig3, await C.datosResponde(c.id, firmaPub, acuerdoPub, ef, epoca, resp, YO.huella, efMia.pub, { ek: efMia.kem.ek, ct: kemCt })))) return;
      }
      const nueva = !c.huella;
      if (nueva) { c.firmaPub = firmaPub; c.acuerdoPub = acuerdoPub; c.huella = huella; c.estado = 'activa'; if (!c.nombre) c.nombre = String(j.nombre || '').slice(0, 40); }
      else if (!c.nombre && j.nombre) c.nombre = String(j.nombre).slice(0, 40);
      c.suId = de; c.miembros.add(de);
      if (nueva || j.nombre !== c.nombreVisto) { c.nombreVisto = j.nombre; await guardaConv(c); }
      const esResp = !!efMia;
      if (!soyInicio(c)) { const pq = await presenta(c, { epoca, ef, ek: kemEk }); await derivaSesion(c, ef, c.ef, pq); }
      else if (esResp) {
        // con texto cifrado ML-KEM, sesión híbrida; sin él (versión anterior al otro lado), la v2 de siempre (pq: false)
        const pq = kemCt ? { ss: C.kemAbre(kemCt, efMia.kem.dk), ek: efMia.kem.ek, ct: kemCt } : null;
        if (efMia.kem) { efMia.kem.dk.fill(0); efMia.kem = null; } // la clave privada ML-KEM de esa presentación ya no sirve
        await derivaSesion(c, ef, efMia, pq);
      }
      else if (!resp) await presenta(c, null);
      if (nueva) { if (c.codigo) R.retira(c.codigo); c.codigo = null; clearInterval(muestraInvitacion.reloj); await anotaSistema(c, 'Conversación establecida: cifrada de extremo a extremo. Comprobad el número de seguridad cuando podáis.'); if (ACTUAL === c.id) abreConv(c.id); }
      if (c.estado === 'destruida_pendiente') { enviaControl(c, { tipo: 'destruir' }); setTimeout(() => destruyeLocal(c, false, true), 300); return; }
      pintaLista(); if (ACTUAL === c.id) pintaCabecera(c);
    } catch (e) { console.warn('presentación', e); }
  }
  async function derivaSesion(c, suEf, efMia, pq, acepta) {
    if (!efMia || !suEf || !c.acuerdoPub) { if (pq && pq.ss) pq.ss.fill(0); return; }
    // 27 Oct 2026, ronda 55 (ChatGPT y Astra): una conversación que ya tuvo sesión postcuántica no vuelve a solo ECDH sin que
    // la persona lo acepte expresamente; mientras, no hay sesión (no sale nada) y se explica arriba.
    if (!pq && c.pqVisto && !acepta) {
      const yaParada = !!c.clasicaPendiente; c.clasicaPendiente = { suEf, efMia }; c.sesion = null;
      if (!yaParada) vigila(c, T('Sesión sin protección postcuántica parada: esta conversación ya la tenía. Solo sigue si tú lo aceptas.'), 'mal');
      pintaCabecera(c); return;
    }
    c.clasicaPendiente = null;
    const inicio = soyInicio(c);
    const s = await C.sesion(YO, efMia, { ef: suEf, acuerdoPub: c.acuerdoPub }, c.id, inicio, c.psk, YO.huella, c.huella, pq || null);
    if (pq && pq.ss) pq.ss.fill(0);
    const sid = C.hex(s.hash.subarray(0, 8));
    // pq: true solo si esta sesión mezcla ML-KEM-768 con el ECDH (los dos lados con la versión nueva)
    const ses = { sid, hash: s.hash, envio: C.cadena(s.envio), recibo: C.cadena(s.recibo), desde: Date.now(), confirmada: false, pq: !!s.pq };
    c.sesiones.set(sid, ses); c.sesion = ses; clearTimeout(c.reintento); c.encuentros = (c.encuentros || 0) + 1;
    // 27 Oct 2026: el registro dice si la sesión lleva la capa poscuántica; si una conversación que ya la tuvo vuelve a una
    // sesión sin ella (la otra persona con una versión anterior, o alguien con la invitación quitándola), se avisa en rojo.
    if (ses.pq) { vigila(c, T('Claves nuevas acordadas con la otra persona (cifrado renovado, con protección postcuántica ML-KEM-768).'), 'info'); if (!c.pqVisto) { c.pqVisto = true; guardaConv(c); } }
    else if (c.pqVisto) vigila(c, T('Sesión sin la capa postcuántica: el otro equipo no la ha usado esta vez. La conversación sigue encriptada de extremo a extremo.'), 'mal');
    else vigila(c, T('Claves nuevas acordadas con la otra persona (cifrado renovado).'), 'info');
    for (const k of [...c.sesiones.keys()].slice(0, -3)) c.sesiones.delete(k);
    pintaCabecera(c); pintaLista();
    enviaControl(c, { tipo: 'ok' });
    if (YO.nombre) enviaControl(c, { tipo: 'nombre', nombre: YO.nombre });
    enviaCola(c);
    if (ACTUAL === c.id && document.visibilityState === 'visible') marcaLeidos(c);
  }

  // ---------- mensajes ----------
  async function sella(c, obj) {
    const ses = c.sesion; if (!ses) return null;
    const { n, clave } = await ses.envio.siguiente();
    const cab = new Uint8Array(13); cab[0] = 2; cab.set(C.deHex(ses.sid), 1); new DataView(cab.buffer).setUint32(9, n);
    const ct = await C.sella(clave, n, C.te.encode(JSON.stringify(obj)), C.cat(cab, ses.hash)); // AAD: cabecera + hash de sesión entero
    return C.cat(cab, ct);
  }
  function enviaControl(c, obj) { if (!c.sesion || !R.abierto || !c.miembros.has(c.suId)) return false; sella(c, obj).then((b) => b && R.manda(c.id, c.suId, b)); return true; }
  const enLinea = (c) => !!(c.suId && c.miembros.has(c.suId) && c.sesion && R.abierto);

  async function enviaTexto(c, texto) {
    const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'mia', estado: 'pendiente', tipo: 'texto', texto };
    await guardaMensaje(c, m); c.mensajes.push(m); c.cola.push(m);
    pintaMensaje(c, m); actualizaUltimo(c, m);
    enviaCola(c);
  }
  async function enviaCola(c) {
    if (c.enviando) return; c.enviando = true;
    try {
      while (c.cola.length && enLinea(c)) {
        const m = c.cola[0];
        const carga = m.tipo === 'texto' ? { tipo: 'texto', id: m.id, t: m.t, texto: m.texto } : m.tipo === 'archivo' ? { tipo: 'archivo', id: m.id, t: m.t, nombre: m.archivo.nombre, tam: m.archivo.tam, mime: m.archivo.mime, clave: m.archivo.clave, trozos: m.archivo.trozos } : null;
        if (!carga) { c.cola.shift(); continue; }
        const b = await sella(c, carga); if (!b || !R.manda(c.id, c.suId, b)) break;
        c.cola.shift(); m.estado = 'enviado'; await guardaMensaje(c, m); pintaEstado(m);
        if (m.tipo === 'archivo') mandaArchivo(c, m);
      }
    } finally { c.enviando = false; }
  }
  async function recibeMensaje(c, de, b) {
    if (b.length < 13 + 16) return;
    const sid = C.hex(b.subarray(1, 9)), n = new DataView(b.buffer, b.byteOffset).getUint32(9);
    const ses = c.sesiones.get(sid);
    if (!ses) { if (!c.clasicaPendiente) R.manda(c.id, de, new Uint8Array([4])); return; } // no conozco esa sesión: que se presente otra vez (salvo con la sesión sin capa postcuántica parada: no se vuelve a negociar en bucle)
    let j;
    try { const k = await ses.recibo.para(n); j = JSON.parse(C.td.decode(await C.abre(k, n, b.subarray(13), C.cat(b.subarray(0, 13), ses.hash)))); } catch (e) { if (!/repetido|saltados/.test(e.message)) { c.incidencias = (c.incidencias || 0) + 1; await anotaSistema(c, 'Un mensaje no superó la comprobación de integridad y se ha descartado.'); vigila(c, T('Un mensaje no superó la autenticación: descartado.'), 'mal'); pintaRadio(c); } return; }
    if (c.suId !== de) return;
    c.ultimaVerificacion = Date.now();
    if (!ses.confirmada) { ses.confirmada = true; if (c.sesion === ses) pintaCabecera(c); vigila(c, T('Confirmación de clave recibida: la otra persona tiene la misma clave.'), 'bien'); } // la otra persona tiene la misma clave: sesión confirmada
    switch (j.tipo) {
      case 'texto': {
        if (c.mensajes.some((x) => x.id === j.id)) { enviaControl(c, { tipo: 'ack', ids: [j.id] }); return; }
        const m = { id: String(j.id).slice(0, 64), conv: c.id, t: Math.min(Date.now(), +j.t || Date.now()), dir: 'suya', estado: 'recibido', tipo: 'texto', texto: String(j.texto || '').slice(0, 20000) };
        await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m); actualizaUltimo(c, m, true); vigila(c, T('Mensaje recibido: superó la verificación criptográfica.'), 'ok'); pintaRadio(c);
        enviaControl(c, { tipo: 'ack', ids: [m.id] });
        if (ACTUAL === c.id && document.visibilityState === 'visible') marcaLeidos(c); else avisaSonido();
        return;
      }
      case 'ok': return;
      case 'ack': case 'leido': {
        const est = j.tipo === 'ack' ? 'entregado' : 'leido';
        for (const id of j.ids || []) { const m = c.mensajes.find((x) => x.id === id && x.dir === 'mia'); if (m && (est === 'leido' || m.estado === 'enviado' || m.estado === 'pendiente')) { if (!(m.estado === 'leido')) { m.estado = est; await guardaMensaje(c, m); pintaEstado(m); if (est === 'entregado' && m.tipo === 'texto') vigila(c, T('Mensaje entregado: acuse del otro equipo.'), 'ok'); } } }
        return;
      }
      case 'nombre': { const n = String(j.nombre || '').trim().slice(0, 40); if (!c.nombreFijado && n && n !== c.nombre) { c.nombre = n; await guardaConv(c); pintaLista(); pintaCabecera(c); } return; }
      case 'archivo': return recibeAnuncioArchivo(c, j);
      case 'archivo-ack': { const a = c.archivos.get(j.id); if (a && a.envio) { a.ack = Math.max(a.ack, +j.hasta || 0); a.sigue && a.sigue(); } return; }
      case 'archivo-listo': { const a = c.archivos.get(j.id); if (a && a.envio) { a.listo = true; a.sigue && a.sigue(); } return; }
      case 'archivo-fin': { const a = c.archivos.get(j.id); const m = c.mensajes.find((x) => x.id === j.id); if (m) { m.estado = j.ok ? 'entregado' : 'fallo'; m.archivo.progreso = j.ok ? 1 : m.archivo.progreso; await guardaMensaje(c, m); pintaMensaje(c, m, true); vigila(c, (j.ok ? T('Archivo entregado') : T('Archivo no completado')) + ': ' + m.archivo.nombre + (j.ok ? ' · ' + T('acuse del otro equipo: completo y autenticado.') : ''), j.ok ? 'bien' : 'mal'); pintaRadio(c); if (j.ok) await recibo(c, m, +j.seg || 0, +j.trozos || m.archivo.trozos, true); } if (a) c.archivos.delete(j.id); return; }
      case 'archivo-cancel': { const a = c.archivos.get(j.id); if (a) { a.cancelado = true; if (a.escritor) { try { await a.escritor.abort(); } catch (_) {} } c.archivos.delete(j.id); } const m = c.mensajes.find((x) => x.id === j.id); if (m && m.estado !== 'recibido') { m.estado = 'fallo'; if (j.por === 'integridad') { m.archivo.motivo = T('cortado en el otro lado: datos alterados'); c.incidencias = (c.incidencias || 0) + 1; await anotaSistema(c, 'La otra persona cortó un envío porque no superó la comprobación de integridad.'); } await guardaMensaje(c, m); pintaMensaje(c, m, true); pintaRadio(c); } return; }
      case 'llamada': return; // esta versión no tiene llamadas (dueño, 26 Oct 20:01)
      case 'destruir': return destruyeLocal(c, true);
      default: return;
    }
  }
  async function guardaMensaje(c, m) {
    const cuerpo = m.tipo === 'texto' ? { tipo: 'texto', texto: m.texto } : m.tipo === 'archivo' ? { tipo: 'archivo', archivo: m.archivo } : { tipo: m.tipo, texto: m.texto, llamada: m.llamada };
    const s = await guardaSellado(cuerpo);
    await BD.pon('msg', { id: m.id, conv: c.id, t: m.t, dir: m.dir, estado: m.estado, iv: s.iv, datos: s.datos });
  }
  async function cargaMensajes(c) {
    if (c.cargados) return;
    const xs = (await BD.porConv('msg', c.id)).sort((a, b) => a.t - b.t);
    c.mensajes = [];
    for (const x of xs) { const cu = await leeSellado(x); if (!cu) continue; const m = { id: x.id, conv: c.id, t: x.t, dir: x.dir, estado: x.estado, tipo: cu.tipo, texto: cu.texto, archivo: cu.archivo, llamada: cu.llamada }; if (m.dir === 'mia' && m.estado === 'pendiente') c.cola.push(m); if (m.tipo === 'archivo' && m.dir === 'mia' && m.estado !== 'entregado' && m.estado !== 'leido' && m.archivo && (m.archivo.progreso || 0) < 1) { m.estado = 'fallo'; c.cola = c.cola.filter((q) => q !== m); } if (m.tipo === 'archivo' && m.dir === 'suya' && m.estado === 'recibiendo') m.estado = 'fallo'; c.mensajes.push(m); }
    c.cargados = true;
  }
  async function anotaSistema(c, texto) {
    const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'sistema', estado: 'ok', tipo: 'sistema', texto };
    await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m);
  }
  async function actualizaUltimo(c, m, suyo) {
    c.ultimo = m.t; c.ultimoTexto = await guardaSellado({ texto: m.tipo === 'texto' ? m.texto : m.tipo === 'archivo' ? '📎 ' + m.archivo.nombre : m.texto || '' });
    if (suyo && !(ACTUAL === c.id && document.visibilityState === 'visible')) c.noLeidos = (c.noLeidos || 0) + 1;
    await guardaConv(c); pintaLista();
  }
  async function marcaLeidos(c) {
    const ids = c.mensajes.filter((m) => m.dir === 'suya' && m.estado === 'recibido').map((m) => m.id);
    if (ids.length && enviaControl(c, { tipo: 'leido', ids })) { for (const m of c.mensajes) if (ids.includes(m.id)) { m.estado = 'leido'; await guardaMensaje(c, m); } }
    if (c.noLeidos) { c.noLeidos = 0; await guardaConv(c); pintaLista(); }
  }

  // ---------- archivos ----------
  // Cualquier archivo, del tamaño que sea: quien manda lo lee por trozos de 192 KB (nunca entero en memoria), cada trozo
  // va sellado con AES-256-GCM bajo la clave del archivo y con su número en los datos asociados, así que un trozo
  // falso o fuera de sitio no abre; el relé solo ve bytes. Quien recibe lo escribe directo al disco si el navegador
  // lo permite (Chrome, Edge: «Guardar en…») o lo junta en memoria hasta MAX_MEMORIA (los demás). Quien manda espera a
  // «archivo-listo» y luego avanza con ventana (acuses cada 4 trozos) sin pasarse del cupo del relé.
  const MAX_MEMORIA = 300 * 1024 * 1024;
  const conDisco = () => typeof window.showSaveFilePicker === 'function';
  const fidDe = (id) => C.deHex(id.replace(/-/g, '').slice(0, 32).padEnd(32, '0'));
  async function enviaArchivos(c, archivos) {
    for (const f of archivos) {
      if (!f || !f.size) continue;
      const clave = C.azar(32), trozos = Math.ceil(f.size / TROZO) || 1;
      const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'mia', estado: 'pendiente', tipo: 'archivo', archivo: { nombre: (f.name || 'archivo').slice(0, 180), tam: f.size, mime: f.type || 'application/octet-stream', clave: C.b64u(clave), trozos, progreso: 0 } };
      c.archivos.set(m.id, { envio: true, f, clave: await C.aes(clave), ack: 0, trozos, listo: false });
      if (f.size <= MAX_MEMORIA && /^(image|audio)\//.test(m.archivo.mime)) await BD.pon('arch', { id: m.id, conv: c.id, blob: f, nombre: m.archivo.nombre, mime: m.archivo.mime, tam: f.size });
      await guardaMensaje(c, m); c.mensajes.push(m); c.cola.push(m); pintaMensaje(c, m); actualizaUltimo(c, m);
    }
    enviaCola(c);
  }
  async function falla(c, m, texto) { m.estado = 'fallo'; await guardaMensaje(c, m); pintaMensaje(c, m, true); if (texto) aviso(texto); }
  async function mandaArchivo(c, m) {
    const a = c.archivos.get(m.id);
    if (!a || !a.f) return falla(c, m, T('Ese archivo ya no está disponible para enviarlo: elígelo otra vez.'));
    // espera «archivo-listo» (la otra persona ha elegido dónde guardarlo o lo recibe en memoria)
    const t0 = Date.now();
    while (!a.listo) { if (a.cancelado || c.estado === 'destruida') return; if (!enLinea(c) || Date.now() - t0 > 10 * 60 * 1000) return falla(c, m); await new Promise((r) => { a.sigue = r; setTimeout(r, 500); }); }
    const fid = fidDe(m.id); a.t0 = Date.now();
    for (let i = 0; i < a.trozos; i++) {
      if (a.cancelado || c.estado === 'destruida') return;
      while (i - a.ack >= VENTANA || R.atraso > 3 * 1024 * 1024) { if (!enLinea(c)) return falla(c, m); await new Promise((r) => { a.sigue = r; setTimeout(r, 300); }); if (a.cancelado) return; }
      let claro; try { claro = new Uint8Array(await a.f.slice(i * TROZO, (i + 1) * TROZO).arrayBuffer()); } catch (_) { return falla(c, m, T('No se pudo leer el archivo: ¿sigue en el mismo sitio?')); }
      const cab = new Uint8Array(21); cab[0] = 3; cab.set(fid, 1); new DataView(cab.buffer).setUint32(17, i);
      const ct = await C.sella(a.clave, i, claro, cab);
      if (!R.manda(c.id, c.suId, C.cat(cab, ct))) return falla(c, m);
      m.archivo.progreso = (i + 1) / a.trozos; pintaProgreso(m);
    }
  }
  async function recibeAnuncioArchivo(c, j) {
    if (c.mensajes.some((x) => x.id === j.id)) return;
    const tam = +j.tam || 0, trozos = +j.trozos || 0;
    if (!tam || trozos !== (Math.ceil(tam / TROZO) || 1) || !j.clave) { enviaControl(c, { tipo: 'archivo-cancel', id: j.id }); return; }
    const m = { id: String(j.id).slice(0, 64), conv: c.id, t: Math.min(Date.now(), +j.t || Date.now()), dir: 'suya', estado: 'recibiendo', tipo: 'archivo', archivo: { nombre: String(j.nombre || 'archivo').slice(0, 180).replace(/[\\/:*?"<>|]/g, '_'), tam, mime: String(j.mime || 'application/octet-stream').slice(0, 100), trozos, progreso: 0, aDisco: tam > MAX_MEMORIA || (conDisco() && tam > 32 * 1024 * 1024) } };
    const a = { envio: false, clave: await C.aes(C.deB64u(j.clave)), partes: null, escritor: null, siguiente: 0, tengo: 0, trozos, m, pendientes: new Map() };
    c.archivos.set(m.id, a);
    if (!m.archivo.aDisco) { a.partes = new Array(trozos); a.listo = true; }
    else if (!conDisco()) { enviaControl(c, { tipo: 'archivo-cancel', id: m.id }); c.archivos.delete(m.id); m.estado = 'fallo'; m.archivo.motivo = T('Pasa de 300 MB y este navegador no puede escribirlo al disco según llega (Chrome o Edge sí).'); }
    await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m); actualizaUltimo(c, m, true);
    if (a.listo) enviaControl(c, { tipo: 'archivo-listo', id: m.id });
    else if (m.estado !== 'fallo') { avisaSonido(); if (ACTUAL !== c.id) aviso(T('Te están mandando un archivo grande: elige dónde guardarlo.')); }
  }
  // «Guardar en…» (archivos grandes): la persona elige el destino y, desde ahí, cada trozo se escribe según llega.
  async function eligeDestino(c, m) {
    const a = c.archivos.get(m.id); if (!a || a.listo) return;
    try {
      const h = await window.showSaveFilePicker({ suggestedName: m.archivo.nombre });
      a.escritor = await h.createWritable(); a.listo = true; a.nombreDisco = h.name;
      enviaControl(c, { tipo: 'archivo-listo', id: m.id });
      m.archivo.enDisco = true; pintaMensaje(c, m, true);
    } catch (_) { /* canceló el diálogo: el botón sigue ahí */ }
  }
  async function recibeTrozo(c, de, b) {
    if (b.length < 21 + 16 || c.suId !== de) return;
    const fid = C.hex(b.subarray(1, 17)), i = new DataView(b.buffer, b.byteOffset).getUint32(17);
    const m = c.mensajes.find((x) => x.tipo === 'archivo' && x.dir === 'suya' && C.hex(fidDe(x.id)) === fid);
    const a = m && c.archivos.get(m.id); if (!a || a.envio || !a.listo || i >= a.trozos) return;
    let claro; try { claro = await C.abre(a.clave, i, b.subarray(21), b.subarray(0, 21)); } catch (_) { return incidencia(c, m, a, 'Un trozo del archivo no superó la comprobación de integridad: envío cortado.'); }
    const esperado = i < a.trozos - 1 ? TROZO : m.archivo.tam - (a.trozos - 1) * TROZO;
    if (claro.length !== esperado) return incidencia(c, m, a, 'Un trozo del archivo no coincide con lo anunciado: envío cortado.');
    if (!a.t0) a.t0 = Date.now(); c.ultimaVerificacion = Date.now();
    if (a.partes) { if (a.partes[i]) return; a.partes[i] = claro; a.tengo++; }
    else {
      // al disco, en orden: lo que llega adelantado espera en memoria (como mucho la ventana)
      if (i < a.siguiente || a.pendientes.has(i)) return;
      a.pendientes.set(i, claro);
      while (a.pendientes.has(a.siguiente)) { const x = a.pendientes.get(a.siguiente); a.pendientes.delete(a.siguiente); try { await a.escritor.write(x); } catch (_) { c.archivos.delete(m.id); enviaControl(c, { tipo: 'archivo-cancel', id: m.id }); return falla(c, m, T('No se pudo escribir el archivo en el disco.')); } a.siguiente++; a.tengo++; }
    }
    m.archivo.progreso = a.tengo / a.trozos; pintaProgreso(m);
    if (a.tengo % 4 === 0 || a.tengo === a.trozos) enviaControl(c, { tipo: 'archivo-ack', id: m.id, hasta: a.tengo });
    if (a.tengo === a.trozos) {
      c.archivos.delete(m.id);
      let ok = true;
      if (a.partes) { const blob = new Blob(a.partes, { type: m.archivo.mime }); ok = blob.size === m.archivo.tam; if (ok) await BD.pon('arch', { id: m.id, conv: c.id, blob, nombre: m.archivo.nombre, mime: m.archivo.mime, tam: blob.size }); }
      else { try { await a.escritor.close(); } catch (_) { ok = false; } }
      m.estado = ok ? 'recibido' : 'fallo'; m.archivo.progreso = 1;
      const seg = Math.max(0.1, (Date.now() - (a.t0 || Date.now())) / 1000);
      vigila(c, ok ? T('Archivo recibido') + ': ' + m.archivo.nombre + ' · ' + a.trozos + ' ' + T('trozos autenticados, completo.') : T('Archivo incompleto: ') + m.archivo.nombre, ok ? 'bien' : 'mal');
      await guardaMensaje(c, m); pintaMensaje(c, m, true); pintaRadio(c);
      enviaControl(c, { tipo: 'archivo-fin', id: m.id, ok, seg: Math.round(seg * 10) / 10, trozos: a.trozos });
      if (ok) await recibo(c, m, seg, a.trozos, false);
      if (ok && !(ACTUAL === c.id && document.visibilityState === 'visible')) avisaSonido();
    }
  }
  // Manipulación detectada (ronda del dueño, 26 Oct 20:03): se corta el envío al instante, queda marcado en coral y anotado.
  async function incidencia(c, m, a, texto) {
    c.incidencias = (c.incidencias || 0) + 1;
    if (a) { a.cancelado = true; if (a.escritor) { try { await a.escritor.abort(); } catch (_) {} } c.archivos.delete(m.id); }
    enviaControl(c, { tipo: 'archivo-cancel', id: m.id, por: 'integridad' });
    m.estado = 'fallo'; m.archivo.motivo = T('detenido: no superó la autenticación'); await guardaMensaje(c, m); pintaMensaje(c, m, true);
    await anotaSistema(c, texto); aviso(T(texto)); vigila(c, T(texto), 'mal'); pintaRadio(c);
  }
  // Recibo de entrega (dueño, 26 Oct 20:25): aparece solo en el chat cuando el archivo ha llegado entero al otro equipo.
  const segundos = (x) => (x < 60 ? x.toLocaleString(LOC(), { maximumFractionDigits: 1 }) + ' s' : Math.floor(x / 60) + ' min ' + Math.round(x % 60) + ' s');
  async function recibo(c, m, seg, trozos, entregado) {
    const texto = (entregado ? T('Recibo de entrega') : T('Recibo de recepción')) + ' · ' + m.archivo.nombre + ' · ' + tamano(m.archivo.tam) + ' · ' + T('en') + ' ' + segundos(seg) + ' · ' + trozos + ' ' + T('trozos comprobados') + ' · ' + T('cifrado de extremo a extremo; cada trozo superó la autenticación') + ' · ' + T('contenido no analizado: viaja cifrado');
    const r = { id: uuid(), conv: c.id, t: Date.now(), dir: 'sistema', estado: 'ok', tipo: 'recibo', texto };
    await guardaMensaje(c, r); c.mensajes.push(r); pintaMensaje(c, r);
  }
  async function abreArchivo(m, guardar) {
    const r = await BD.saca('arch', m.id); if (!r) return aviso(m.archivo.enDisco ? T('Ese archivo se guardó directamente en tu disco, en la carpeta que elegiste.') : T('Este archivo ya no está en este navegador.'));
    const u = URL.createObjectURL(r.blob);
    const a = document.createElement('a'); a.href = u; if (guardar) a.download = r.nombre; else { a.target = '_blank'; a.rel = 'noopener'; }
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
  }

  // ---------- destruir ----------
  async function destruyeLocal(c, porElla, silencio) {
    if (c.estado === 'destruida') return;
    c.estado = 'destruida';
    R.sale(c.id); CONVS.delete(c.id);
    await BD.borraConv('msg', c.id); await BD.borraConv('arch', c.id); await BD.borra('conv', c.id);
    if (ACTUAL === c.id) { cierraConv(); }
    pintaLista();
    if (!silencio) aviso(porElla ? T('La otra persona ha terminado la conversación: se ha borrado también aquí.') : T('Conversación terminada y borrada; el otro equipo ha recibido la orden de borrado.'));
  }
  // Destruir con la otra persona ausente: se borra todo aquí y queda una lápida (sin mensajes) que, en cuanto la otra
  // persona entre, le manda «destruir» y desaparece.
  async function destruye(c, silencio) {
    if (c.codigo) R.retira(c.codigo);
    if (enLinea(c)) { enviaControl(c, { tipo: 'destruir' }); await new Promise((r) => setTimeout(r, 250)); await destruyeLocal(c, false, silencio); return; }
    if (!c.huella) { await destruyeLocal(c, false, true); return; }
    c.estado = 'destruida_pendiente'; c.tumba = Date.now(); c.mensajes = []; c.cola = []; c.ultimoTexto = null; c.noLeidos = 0;
    await BD.borraConv('msg', c.id); await BD.borraConv('arch', c.id); await guardaConv(c);
    if (ACTUAL === c.id) cierraConv();
    pintaLista(); aviso(T('Conversación terminada y borrada aquí; en el otro equipo, en cuanto esa persona entre.'));
  }

  // ---------- relé ----------
  function arrancaRele() {
    R = GuardianaRele.crea();
    const estadoRele = (txt, cls) => { const e = $('#rele'); e.className = 'rele ' + (cls || ''); $('#reletxt').textContent = txt; };
    window.pintaBarra = () => { const c = CONVS.get(ACTUAL); const on = !!(c && c.huella && enLinea(c) && c.sesion && c.sesion.confirmada); estadoRele(on ? T('Conectado') : T('Desconectado'), on ? 'si' : ''); };
    // arriba: «Desconectado» hasta que la conversación con la otra persona está establecida; entonces «Conectado» (dueño, 20:21)
    R.on('abierto', () => { pintaBarra(); });
    R.on('hola', () => { for (const c of CONVS.values()) pintaCabecera(c); pintaBarra(); });
    R.on('cerrado', () => { pintaBarra(); for (const c of CONVS.values()) { c.miembros.clear(); c.sesion = null; pintaCabecera(c); } pintaLista(); });
    setInterval(() => { if (R.abierto && R.caduca && R.caduca * 1000 - Date.now() < 2 * 3600 * 1000) R.pideIce(); }, 10 * 60 * 1000);
    R.on('sala', (sala, miembros) => { const c = CONVS.get(sala); if (!c) return; c.miembros = new Set(miembros); c.sesion = null; if (miembros.length && (!c.suId || miembros.includes(c.suId))) enCola(c, () => presenta(c, null, true)); pintaCabecera(c); pintaLista(); });
    R.on('llega', (sala, quien) => { const c = CONVS.get(sala); if (!c) return; c.miembros.add(quien); if (!c.suId || c.suId === quien) { c.sesion = null; enCola(c, () => presenta(c, null, true)); } pintaCabecera(c); pintaLista(); });
    R.on('sale', (sala, quien) => { const c = CONVS.get(sala); if (!c) return; c.miembros.delete(quien); if (c.suId === quien) { c.sesion = null; vigila(c, T('La otra persona se ha desconectado.'), 'info'); } pintaCabecera(c); pintaLista(); });
    R.on('sustituido', (sala) => { const c = CONVS.get(sala); if (c) { c.miembros.clear(); c.sesion = null; } aviso(T('Esta conversación se ha abierto en otra pestaña: sigue allí.')); });
    // Las tramas de una conversación se procesan en orden (una detrás de otra): así un trozo de archivo nunca
    // adelanta al anuncio del archivo, ni un mensaje a la presentación que abre su sesión.
    R.on('trama', (sala, de, b) => {
      const c = CONVS.get(sala); if (!c || !b.length) return;
      c.proc = (c.proc || Promise.resolve()).then(async () => {
        try {
          if (b[0] === 1) await recibePresentacion(c, de, b);
          else if (b[0] === 2) await recibeMensaje(c, de, b);
          else if (b[0] === 3) await recibeTrozo(c, de, b);
          else if (b[0] === 4) { if (c.suId === de) await presenta(c, null); }
          else if (b[0] === 5) { if (!c.huella) { c.ocupada = true; pintaCabecera(c); $('#invita-estado').textContent = T('Esta invitación ya la usó otra persona.'); } }
        } catch (e) { console.warn('trama', e); }
      });
    });
    R.on('aviso', (m) => { if (m.t === 'lento') aviso(T('El relé está limitando la velocidad: el envío sigue más despacio.')); });
  }

  // ---------- pantalla: lista ----------
  const hora = (t) => new Date(t).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' });
  const fecha = (t) => { const d = new Date(t), h = new Date(); return d.toDateString() === h.toDateString() ? T('Hoy') : d.toLocaleDateString(LOC(), { weekday: 'long', day: 'numeric', month: 'long' }); };
  const diaDe = (t) => new Date(t).toDateString();
  // Sin lista ni historial (dueño, 26 Oct 20:04): una conversación a la vez. Si hay una, se muestra; si no, el inicio.
  async function pintaLista() {
    const xs = [...CONVS.values()].filter((c) => c.estado !== 'destruida_pendiente' && c.estado !== 'destruida');
    if (!xs.length) { if (ACTUAL) cierraConv(); return; }
    if (!ACTUAL || !CONVS.has(ACTUAL)) abreConv(xs.sort((a, b) => (b.creado || 0) - (a.creado || 0))[0].id);
  }


  // ---------- pantalla: conversación ----------
  async function abreConv(id) {
    const c = CONVS.get(id); if (!c) return;
    ACTUAL = id; await cargaMensajes(c);
    const inv = c.estado === 'invitacion' && c.rol === 'invita' && !c.huella;
    $('#inicio').hidden = !inv; $('#conv').hidden = inv; $('#app').classList.toggle('en-conv', !inv);
    if (inv) { $('#paso-inicio').hidden = true; $('#paso-entrar').hidden = true; $('#paso-codigo').hidden = false; }
    pintaCabecera(c); pintaTodos(c); pintaRadio(c); pintaLista();
    if (c.estado === 'invitacion' && c.rol === 'invita') { muestraInvitacion(c); if (!c.huella && (!c.codigo || Date.now() > c.codigoCaduca)) publicaCodigo(c); }
    marcaLeidos(c);
    if (matchMedia('(min-width: 761px)').matches) $('#texto').focus();
  }
  function cierraConv() { ACTUAL = null; if (window.pintaBarra) pintaBarra(); $('#conv').hidden = true; $('#inicio').hidden = false; $('#app').classList.remove('en-conv'); $('#paso-inicio').hidden = false; $('#paso-codigo').hidden = true; $('#paso-entrar').hidden = true; }
  function pintaCabecera(c) {
    if (window.pintaBarra) pintaBarra();
    if (ACTUAL !== c.id) return;
    $('#cnombre').textContent = T('Conversación cifrada');
    const conf = $('#cconfianza'); conf.classList.remove('gc-sin-verificar');
    let txt;
    if (c.ocupada && !c.huella) txt = T('Esta invitación ya la usó otra persona.');
    else if (!c.huella) txt = c.miembros.size ? T('Estableciendo el cifrado…') : T('Esperando a que la otra persona escriba el código…');
    else if (!R.abierto) txt = T('Sin conexión con el relé');
    else if (!c.miembros.has(c.suId)) txt = T('No está conectada ahora: lo que escribas saldrá cuando entre');
    else if (!c.sesion || !c.sesion.confirmada) txt = T('Estableciendo el cifrado…');
    else txt = T('Cifrada de extremo a extremo') + ' · ' + (c.sesion.pq ? T('postcuántica') + ' · ' : T('sin protección postcuántica') + ' · ') + (c.verificada ? T('verificada') : T('sin verificar'));
    const pqa = $('#cpq'); if (pqa) pqa.hidden = !c.clasicaPendiente;
    if (c.huella && !c.verificada) conf.classList.add('gc-sin-verificar');
    conf.textContent = txt;
  }
  // Vigilancia a la derecha (dueño, 26 Oct 20:22): anota cada comprobación real según ocurre y mantiene la última a la vista.
  const hms = (t) => new Date(t || Date.now()).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  function vigila(c, texto, nivel) {
    c.vigilancia = c.vigilancia || []; c.vigilancia.push({ t: Date.now(), texto, nivel: nivel || 'ok' }); if (c.vigilancia.length > 80) c.vigilancia.shift();
    if (ACTUAL === c.id) pintaVigila(c);
  }
  function pintaVigila(c) {
    if (ACTUAL !== c.id) return;
    const inc = c.incidencias || 0, rech = c.intrusos || 0;
    $('#vigila').classList.toggle('alerta', inc > 0);
    const ul = $('#vigila-filas'); ul.textContent = '';
    const fila = (cls, b, sp) => { const li = document.createElement('li'); li.className = cls; const i = document.createElement('i'); const bb = document.createElement('b'); bb.textContent = b; const ss = document.createElement('span'); ss.textContent = sp; li.append(i, bb, ss); ul.append(li); };
    const ses = c.sesion && c.sesion.confirmada;
    const hm = (t) => new Date(t).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' });
    fila(ses ? 'gc-ok' : 'gc-aviso', T('Cifrado'), ses ? T('De extremo a extremo; confirmación de clave recibida.') + ' ' + T('Claves de este encuentro') + ': ' + hm(c.sesion.desde) + ' · ' + T('encuentro') + ' ' + (c.encuentros || 1) : T('Acordando claves…'));
    fila(c.verificada ? 'gc-ok' : 'gc-aviso', T('Identidad'), c.verificada ? T('Verificada por las dos personas.') : T('Sin verificar: comparad el número de seguridad (escudo).'));
    const presente = !!(c.suId && c.miembros.has(c.suId));
    fila(presente ? 'gc-ok' : 'gc-aviso', T('Otro extremo'), presente ? T('La otra pestaña está conectada a la sala.') : T('La otra pestaña está desconectada; lo pendiente espera en tu equipo.'));
    const lat = R.latencia, hace = R.ultimoPong ? Math.round((Date.now() - R.ultimoPong) / 1000) : null;
    fila(R.abierto && hace != null && hace < 40 ? 'gc-ok' : 'gc-aviso', T('Servidor'), (R.abierto ? T('responde') + (lat != null ? ' · ' + lat + ' ms' : '') + (hace != null ? ' · ' + T('hace') + ' ' + hace + ' s' : '') : T('sin respuesta · reconectando')) + ' · ' + T('transporta contenido cifrado; sin almacenamiento de mensajes'));
    const msgs = c.mensajes.filter((m) => m.tipo === 'texto' && m.dir === 'suya').length, arch = c.mensajes.filter((m) => m.tipo === 'archivo' && (m.estado === 'recibido' || m.estado === 'entregado' || m.estado === 'leido')).length, incompletos = c.mensajes.filter((m) => m.tipo === 'archivo' && m.estado === 'fallo').length;
    fila(inc ? 'gc-alerta' : 'gc-ok', T('Verificación'), (inc ? inc + ' ' + (inc === 1 ? T('dato que no superó la autenticación: descartado') : T('datos que no superaron la autenticación: descartados')) + ' · ' : '') + msgs + ' ' + (msgs === 1 ? T('mensaje recibido autenticado') : T('mensajes recibidos autenticados')) + ' · ' + arch + ' ' + (arch === 1 ? T('archivo completo') : T('archivos completos')) + (incompletos ? ' · ' + incompletos + ' ' + T('incompletos') : ''));
    fila(rech ? 'gc-aviso' : 'gc-ok', T('Entradas rechazadas'), rech ? rech + ' · ' + T('intento de entrada con otra identidad: rechazado; la conversación sigue intacta') : T('Ninguna.'));
    fila(location.protocol === 'https:' || LOCAL ? 'gc-ok' : 'gc-alerta', 'HTTPS', location.protocol === 'https:' || LOCAL ? T('Conexión de esta página: HTTPS.') : T('Esta página no usa HTTPS.'));
    const vv = $('#vigila-vivo'); vv.textContent = '';
    for (const e of [...(c.vigilancia || [])].reverse().slice(0, 40)) { const li = document.createElement('li'); li.className = e.nivel; const tm = document.createElement('time'); tm.textContent = hms(e.t); const sp = document.createElement('span'); sp.textContent = e.texto; li.append(tm, sp); vv.append(li); }
    $('#vigila-ultima').textContent = c.ultimaVerificacion ? T('última verificación') + ' ' + hms(c.ultimaVerificacion) : '';
    // sellada: cifrado confirmado y la otra persona presente (aura, dueño 20:31)
    const sellada = !!(ses && presente);
    $('#conv').classList.toggle('sellada', sellada); $('#sello-insignia').hidden = !sellada;
  }
  // «hace N s» del servidor se mueve cada segundo; la hora de verificación solo cuando ocurre una de verdad
  setInterval(() => { const c = CONVS.get(ACTUAL); if (!c || $('#conv').hidden) return; pintaVigila(c); }, 1000);
  // «Radiografía» permanente (dueño, 26 Oct 20:03): solo lo verificable, en todo momento
  function pintaRadio(c) {
    pintaVigila(c);
    if (ACTUAL !== c.id) return;
    const r = $('#radio'); if (!c.huella) { r.hidden = true; return; }
    const msgs = c.mensajes.filter((m) => m.tipo === 'texto').length, arch = c.mensajes.filter((m) => m.tipo === 'archivo' && (m.estado === 'recibido' || m.estado === 'entregado' || m.estado === 'leido')).length, inc = c.incidencias || 0;
    r.hidden = false; r.className = 'radio' + (inc ? ' mal' : '');
    $('#radiotxt').textContent = inc
      ? inc + ' ' + (inc === 1 ? T('incidencia') : T('incidencias')) + ' · ' + T('envío detenido y anotado')
      : T('Cifrado de extremo a extremo') + ' · ' + msgs + ' ' + (msgs === 1 ? T('mensaje') : T('mensajes')) + ' · ' + arch + ' ' + (arch === 1 ? T('archivo') : T('archivos')) + ' · ' + T('verificación criptográfica superada') + (c.verificada ? ' · ' + T('identidad verificada') : '');
  }
  function pintaTodos(c) {
    const ul = $('#mensajes'); ul.textContent = ''; ul.dataset.dia = '';
    for (const m of c.mensajes) pintaMensaje(c, m, false, true);
    ul.scrollTop = ul.scrollHeight;
  }
  function pintaMensaje(c, m, reemplaza, sinScroll) {
    if (ACTUAL !== c.id) return;
    const ul = $('#mensajes');
    const abajo = ul.scrollHeight - ul.scrollTop - ul.clientHeight < 80;
    let li = ul.querySelector('[data-id="' + m.id + '"]');
    if (li && !reemplaza) return;
    if (!li) {
      if (ul.dataset.dia !== diaDe(m.t)) { ul.dataset.dia = diaDe(m.t); const f = document.createElement('li'); f.className = 'gc-fecha'; f.textContent = fecha(m.t); ul.append(f); }
      li = document.createElement('li'); li.dataset.id = m.id; ul.append(li);
      const prev = li.previousElementSibling; if (prev && prev.dataset.dir === m.dir && m.dir !== 'sistema' && m.t - (+prev.dataset.t || 0) < 120000) li.classList.add('gc-sigue');
    }
    li.dataset.dir = m.dir; li.dataset.t = m.t; li.textContent = '';
    if (m.tipo === 'llamada') { li.className = 'gc-centro'; const l = document.createElement('span'); l.className = 'gc-linea-llamada'; l.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'; l.append(document.createTextNode(m.texto)); li.append(l); if (!sinScroll && abajo) ul.scrollTop = ul.scrollHeight; return; }
    if (m.tipo === 'recibo') { li.className = 'gc-centro'; const d = document.createElement('div'); d.className = 'recibo'; const partes = String(m.texto).split(' · '); const h = document.createElement('b'); h.textContent = '✓ ' + partes[0]; d.append(h); for (const x of partes.slice(1)) { const sp = document.createElement('span'); sp.textContent = x; d.append(sp); } li.append(d); if (!sinScroll && abajo) ul.scrollTop = ul.scrollHeight; return; }
    if (m.dir === 'sistema') { li.className = 'gc-nota-sistema'; li.textContent = T(m.texto); if (!sinScroll && abajo) ul.scrollTop = ul.scrollHeight; return; }
    const bur = document.createElement('div'); bur.className = 'gc-burbuja ' + (m.dir === 'mia' ? 'gc-mia' : 'gc-suya') + (li.classList.contains('gc-sigue') ? ' gc-sigue' : '');
    if (m.tipo === 'texto') { const s = document.createElement('span'); s.className = 'gc-texto'; s.append(...enlaza(m.texto)); bur.append(s); }
    else if (m.tipo === 'archivo') bur.append(tarjetaArchivo(m));
    const meta = document.createElement('span'); meta.className = 'gc-meta'; const tm = document.createElement('time'); tm.textContent = hora(m.t); meta.append(tm);
    if (m.dir === 'mia') { const tk = document.createElement('span'); tk.className = 'gc-ticks'; meta.append(tk); }
    bur.append(meta); li.append(bur); pintaEstado(m);
    if (!sinScroll && (abajo || m.dir === 'mia')) ul.scrollTop = ul.scrollHeight;
  }
  const TICK1 = '<svg viewBox="0 0 16 11"><path d="M1 6l3.5 3.5L11 2"/></svg>', TICK2 = '<svg viewBox="0 0 16 11"><path d="M1 6l3.5 3.5L11 2M6 9.5L15 2"/></svg>', RELOJ = '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.6"/><path d="M6 3.3V6l1.9 1.2"/></svg>';
  function pintaEstado(m) {
    const li = $('#mensajes [data-id="' + m.id + '"]'); if (!li) return;
    const tk = li.querySelector('.gc-ticks'); if (!tk) return;
    tk.classList.toggle('gc-pendiente', m.estado === 'pendiente');
    tk.innerHTML = m.estado === 'pendiente' ? RELOJ : m.estado === 'enviado' ? TICK1 : m.estado === 'fallo' ? '' : TICK2;
    tk.style.color = m.estado === 'leido' ? 'var(--gc-acero)' : 'var(--gc-suave)';
    tk.style.opacity = '1';
    tk.title = m.estado === 'pendiente' ? T('Pendiente: saldrá cuando la otra persona entre') : m.estado === 'enviado' ? T('Enviado') : m.estado === 'entregado' ? T('Entregado') : m.estado === 'leido' ? T('Leído') : m.estado === 'fallo' ? T('No se pudo enviar') : '';
    if (m.estado === 'fallo') { tk.textContent = '!'; tk.style.color = 'var(--alerta)'; }
  }
  function pintaProgreso(m) { const li = $('#mensajes [data-id="' + m.id + '"]'); if (!li) return; if (!li.querySelector('.gc-progreso')) { const c = CONVS.get(m.conv); if (c) pintaMensaje(c, m, true); return; } const i = li.querySelector('.gc-progreso i'); if (i) i.style.width = Math.round((m.archivo.progreso || 0) * 100) + '%'; const s = li.querySelector('.gc-archivo small'); if (s) s.textContent = tamano(m.archivo.tam) + (m.archivo.progreso < 1 ? ' · ' + Math.round(m.archivo.progreso * 100) + ' %' : ''); }
  const tamano = (n) => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
  function tarjetaArchivo(m) {
    const d = document.createElement('div'); d.className = 'gc-archivo';
    const ic = document.createElement('span'); ic.className = 'gc-archivo-icono'; ic.innerHTML = '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';
    const b = document.createElement('b'); b.textContent = m.archivo.nombre; b.setAttribute('translate', 'no');
    const s = document.createElement('small');
    const pr = m.archivo.progreso || 0;
    s.textContent = tamano(m.archivo.tam) + (m.estado === 'fallo' ? ' · ' + (m.archivo.motivo || T('no se completó')) : pr < 1 && (m.estado === 'recibiendo' || m.estado === 'enviado') ? ' · ' + Math.round(pr * 100) + ' %' : m.estado === 'pendiente' ? ' · ' + T('pendiente') : m.archivo.enDisco ? ' · ' + T('guardado en tu disco') : '');
    d.append(ic, b, s);
    const enCurso = m.estado !== 'fallo' && pr < 1 && m.estado !== 'pendiente';
    if (enCurso) { const p = document.createElement('span'); p.className = 'gc-progreso'; const i = document.createElement('i'); i.style.width = Math.round(pr * 100) + '%'; p.append(i); d.append(p); }
    if (m.estado === 'recibido' || m.estado === 'entregado' || m.estado === 'leido') { const se = document.createElement('span'); se.className = 'sello'; se.textContent = '✓ ' + T('Completo y autenticado: cifrado de extremo a extremo'); d.append(se); }
    else if (m.estado === 'fallo' && /alterados/.test(m.archivo.motivo || '')) { const se = document.createElement('span'); se.className = 'sello mal'; se.textContent = '✕ ' + T('Detenido: no superó la autenticación'); d.append(se); }
    const fila = document.createElement('div'); fila.className = 'fila';
    if (m.dir === 'suya' && m.estado === 'recibiendo' && m.archivo.aDisco && !m.archivo.enDisco) { const g = document.createElement('button'); g.type = 'button'; g.className = 'boton principal'; g.textContent = T('Guardar en…'); g.addEventListener('click', () => { const c = CONVS.get(m.conv); if (c) eligeDestino(c, m); }); fila.append(g); }
    if ((m.dir === 'suya' && m.estado === 'recibido' && !m.archivo.enDisco) || (m.dir === 'mia' && /^(image|audio)\//.test(m.archivo.mime))) {
      if (/^audio\//.test(m.archivo.mime)) { BD.saca('arch', m.id).then((r) => { if (!r) return; const au = document.createElement('audio'); au.controls = true; au.preload = 'metadata'; au.src = URL.createObjectURL(r.blob); au.style.gridColumn = '1 / -1'; d.prepend(au); }); }
      if (/^image\//.test(m.archivo.mime) && m.archivo.tam < 24 * 1024 * 1024) { BD.saca('arch', m.id).then((r) => { if (!r) return; const img = document.createElement('img'); img.className = 'imagen'; img.alt = m.archivo.nombre; img.src = URL.createObjectURL(r.blob); img.style.gridColumn = '1 / -1'; img.addEventListener('click', () => abreArchivo(m, false)); d.prepend(img); }); }
      if (m.dir === 'suya') { const g = document.createElement('button'); g.type = 'button'; g.className = 'boton'; g.textContent = T('Guardar'); g.addEventListener('click', () => abreArchivo(m, true)); fila.append(g); }
    }
    if (fila.childNodes.length) d.append(fila);
    return d;
  }
  function enlaza(texto) {
    const out = []; const re = /https?:\/\/[^\s<>"']+/g; let i = 0, m;
    while ((m = re.exec(texto))) { if (m.index > i) out.push(document.createTextNode(texto.slice(i, m.index))); const a = document.createElement('a'); a.href = m[0]; a.textContent = m[0]; a.target = '_blank'; a.rel = 'noopener noreferrer'; out.push(a); i = m.index + m[0].length; }
    if (i < texto.length) out.push(document.createTextNode(texto.slice(i)));
    return out;
  }

  // ---------- hojas ----------
  const abreHoja = (id) => { $('#' + id).classList.add('gc-abierta'); };
  const cierraHoja = (id) => { $('#' + id).classList.remove('gc-abierta'); };
  function pintaCodigo(c) {
    const e = $('#codigo'); e.textContent = codigoBonito(c.codigo); e.className = 'codigo' + (c.codigoUsado ? ' usado' : (c.codigo && Date.now() > c.codigoCaduca ? ' caducado' : ''));
    const caducado = c.codigo && Date.now() > c.codigoCaduca;
    const est = c.ocupada ? T('Esta invitación ya la usó otra persona.') : c.codigoUsado ? T('La otra persona ha escrito el código: conectando…') : caducado ? T('Este código ha caducado (10 minutos). Pide uno nuevo.') : '';
    $('#invita-estado').textContent = est; $('#invita-estado').hidden = !est;
    const v = $('#validez'); v.hidden = !c.codigo || caducado || c.codigoUsado;
    if (c.codigo && !caducado) { const q = Math.max(0, Math.round((c.codigoCaduca - Date.now()) / 1000)); v.textContent = ''; v.append(document.createTextNode(T('Tiene una validez de 10 minutos y un solo uso: pasado ese tiempo queda inhabilitado y deja de funcionar.') + ' ' + T('Le quedan') + ' ')); const b = document.createElement('b'); b.textContent = Math.floor(q / 60) + ':' + String(q % 60).padStart(2, '0'); v.append(b); v.append(document.createTextNode('.')); }
    $('#invita-nuevo').hidden = !(caducado && !c.huella);
  }
  function muestraInvitacion(c) {
    pintaCodigo(c);
    clearInterval(muestraInvitacion.reloj); muestraInvitacion.reloj = setInterval(() => { if ($('#paso-codigo').hidden) return clearInterval(muestraInvitacion.reloj); pintaCodigo(c); }, 1000);
  }
  async function muestraEscudo(c) {
    const ul = $('#escudo-lista'); ul.textContent = '';
    const fila = (cls, b, s) => { const li = document.createElement('li'); li.className = cls; const i = document.createElement('i'); const bb = document.createElement('b'); bb.textContent = b; const ss = document.createElement('span'); ss.textContent = s; li.append(i, bb, ss); ul.append(li); };
    fila(c.sesion ? 'gc-ok' : 'gc-info', T('Cifrado de extremo a extremo'), T('AES-256-GCM con una clave distinta por mensaje; la sesión se renueva cada vez que os encontráis (ECDH P-256 con firma ECDSA).'));
    fila('gc-info', T('Servidor de GUARDIANA'), T('encamina tramas cifradas que no puede descifrar; ve conexión y volumen, no contenido; no guarda historial'));
    fila(c.incidencias ? 'gc-alerta' : 'gc-ok', T('Verificación'), c.incidencias ? (c.incidencias + ' ' + (c.incidencias === 1 ? T('incidencia') : T('incidencias')) + ': ' + T('datos que no superaron la autenticación, descartados y anotados en la conversación.')) : T('Cada mensaje y cada trozo de archivo se autentica al llegar; hasta ahora, todos superaron la verificación.'));
    fila(c.verificada ? 'gc-ok' : 'gc-aviso', c.verificada ? T('Identidad verificada') : T('Identidad sin verificar'), c.verificada ? T('Comprobasteis el número de seguridad.') : T('Hasta que comprobéis el número, confías en que el enlace llegó a la persona correcta.'));
    fila('gc-aviso', T('Límites'), T('No es anonimato: el relé ve tu dirección IP, la sala y el volumen de tráfico, no el contenido.') + ' ' + T('Tu identidad vive en este navegador: se pierde si borras los datos del sitio o cambias de equipo.') + ' ' + T('Los archivos recibidos quedan en este navegador sin nuestro cifrado; «Destruir» no alcanza lo ya guardado en un disco.') + ' ' + T('Ningún cifrado protege un equipo o navegador comprometido. Esta versión no es poscuántica ni está auditada por terceros.'));
    $('#numero').textContent = c.huella ? await C.numeroSeguridad(YO.huella, c.huella) : T('Aparecerá cuando la otra persona entre.');
    $('#verificada').checked = !!c.verificada; $('#verificada').disabled = !c.huella;
    $('#destruir-nota').hidden = true;
    abreHoja('h-escudo');
  }

  // ---------- avisos ----------
  let avisoT = null;
  function aviso(txt) { const e = $('#aviso'); e.textContent = txt; e.hidden = false; clearTimeout(avisoT); avisoT = setTimeout(() => { e.hidden = true; }, 4200); }
  let ctxAudio = null;
  function avisaSonido() {
    try { ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)(); const o = ctxAudio.createOscillator(), g = ctxAudio.createGain(); o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.0001; o.connect(g).connect(ctxAudio.destination); const t = ctxAudio.currentTime; g.gain.exponentialRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); o.start(t); o.stop(t + 0.4); } catch (_) {}
    if (document.title[0] !== '●') document.title = '● ' + document.title;
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { document.title = document.title.replace(/^● /, ''); const c = CONVS.get(ACTUAL); if (c) marcaLeidos(c); } });

  // ---------- eventos ----------
  function eventos() {
    $('#nueva').addEventListener('click', creaInvitacion);
    // «Crear invitación» al final del bloque para profesionales: sube al principio y hace lo mismo que el botón grande.
    const proEmpezar = $('#pro-empezar');
    if (proEmpezar) proEmpezar.addEventListener('click', () => { const ini = $('#inicio'); if (ini) ini.scrollTo({ top: 0, behavior: 'smooth' }); $('#nueva').click(); });
    // ronda 55: la persona acepta, a sabiendas, una sesión sin protección postcuántica (la otra persona tiene una versión anterior)
    const pqSi = $('#cpq-si');
    if (pqSi) pqSi.addEventListener('click', () => { const c = CONVS.get(ACTUAL); if (!c || !c.clasicaPendiente) return; const p = c.clasicaPendiente; vigila(c, T('Has aceptado seguir sin protección postcuántica en esta sesión.'), 'info'); enCola(c, () => derivaSesion(c, p.suEf, p.efMia, null, true)); });
    // dueño, 10:20: arriba, la red neuronal de NÚCLEO (la misma firma que la portada)
    try { const l = $('.inicio .red-nucleo'); if (l && window.RedNucleo) window.RedNucleo(l, { nace: false }); } catch (_) {}
    // dueño, 10:10: la explicación, en un desplegable bajo los dos botones
    const como = $('#como-btn');
    if (como) como.addEventListener('click', () => { const pro = $('#pro'); if (!pro) return; const abre = pro.hidden; pro.hidden = !abre; como.setAttribute('aria-expanded', String(abre)); if (abre) setTimeout(() => pro.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); });
    $('#unir').addEventListener('click', () => { $('#unir-mal').hidden = true; $('#unir-espera').hidden = true; $('#unir-codigo').value = ''; $('#paso-inicio').hidden = true; $('#paso-entrar').hidden = false; setTimeout(() => $('#unir-codigo').focus(), 50); });
    $('#unir-cerrar').addEventListener('click', () => { $('#paso-entrar').hidden = true; $('#paso-inicio').hidden = false; });
    // Campo del código: solo cifras, nueve como mucho (lo que pase de nueve no entra), guiones automáticos y sin selección azul
    const campoCod = $('#unir-codigo');
    campoCod.addEventListener('beforeinput', (e) => {
      if (!e.inputType || !e.inputType.startsWith('insert')) return;
      const nuevas = String(e.data || '').replace(/\D/g, '');
      const sel = campoCod.selectionEnd - campoCod.selectionStart;
      const ya = campoCod.value.replace(/\D/g, '').length - (sel > 0 ? campoCod.value.slice(campoCod.selectionStart, campoCod.selectionEnd).replace(/\D/g, '').length : 0);
      if (campoCod.readOnly || (e.inputType !== 'insertFromPaste' && (!nuevas || ya >= 9))) e.preventDefault();
    });
    campoCod.addEventListener('input', (e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 9); e.target.value = d.replace(/(\d{3})(?=\d)/g, '$1-'); try { e.target.setSelectionRange(e.target.value.length, e.target.value.length); } catch (_) {} $('#unir-mal').hidden = true; if (d.length === 9) $('#unir-ok').click(); });
    $('#unir-ok').addEventListener('click', async () => {
      const b = $('#unir-ok'); if (b.disabled) return; b.disabled = true; campoCod.readOnly = true; $('#unir-mal').hidden = true; $('#unir-espera').hidden = false;
      const r = await aceptaCodigo($('#unir-codigo').value);
      b.disabled = false; campoCod.readOnly = false; $('#unir-espera').hidden = true;
      if (r === 'ok') { $('#paso-entrar').hidden = true; $('#paso-inicio').hidden = false; return; }
      $('#unir-mal').textContent = r === 'demasiados intentos' ? T('Demasiados intentos: espera un minuto.') : r === 'sin relé' || r === 'sin respuesta' ? T('Sin conexión con el relé: espera un momento.') : T('Código erróneo o caducado.');
      $('#unir-mal').hidden = false; campoCod.focus(); try { campoCod.setSelectionRange(campoCod.value.length, campoCod.value.length); } catch (_) {}
    });
    $('#unir-codigo').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#unir-ok').click(); });
    $('#terminar').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (!c) return; if (!confirm(T('¿Terminar la conversación? Se borra aquí y en el otro equipo.'))) return; await destruye(c); });
    $('#invita-nuevo').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (c) { c.codigoUsado = false; await publicaCodigo(c); } });
    R.on('codigo-usado', (codigo) => { for (const c of CONVS.values()) if (c.codigo === codigo) { c.codigoUsado = true; pintaCodigo(c); } });
    R.on('abierto', () => { for (const c of CONVS.values()) if (c.estado === 'invitacion' && c.rol === 'invita' && !c.huella && (!c.codigo || Date.now() > c.codigoCaduca)) publicaCodigo(c); });
    $('#escudo').addEventListener('click', () => { const c = CONVS.get(ACTUAL); if (c) muestraEscudo(c); });
    $('#escudo-cerrar').addEventListener('click', () => cierraHoja('h-escudo'));
    $('#verificada').addEventListener('change', async (e) => { const c = CONVS.get(ACTUAL); if (!c) return; c.verificada = e.target.checked; await guardaConv(c); pintaCabecera(c); pintaRadio(c); muestraEscudo(c); });
    $('#destruir').addEventListener('click', async (e) => { const c = CONVS.get(ACTUAL); if (!c) return; if ($('#destruir-nota').hidden) { $('#destruir-nota').hidden = false; e.currentTarget.textContent = T('Sí, destruir'); return; } cierraHoja('h-escudo'); e.currentTarget.textContent = T('Destruir conversación'); await destruye(c); });
    const ta = $('#texto');
    const ajusta = () => { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; document.querySelector('.gc-compositor').classList.toggle('con-texto', !!ta.value.trim()); };
    ta.addEventListener('input', ajusta);
    const envia = async () => { const c = CONVS.get(ACTUAL); const t = ta.value.replace(/\s+$/, ''); if (!c || !t) return; ta.value = ''; ajusta(); ta.dispatchEvent(new Event('input')); await enviaTexto(c, t); ta.focus(); };
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); envia(); } });
    $('#enviar').addEventListener('click', envia);
    $('#adjuntar').addEventListener('click', () => $('#archivo').click());
    // Modo discreto: un interruptor (recordado en este equipo) que activa el velo del chat y los números al escribir
    const conv = $('#conv'), mascara = $('#texto-mascara');
    let discreto = true; try { discreto = localStorage.getItem('gcom-discreto') !== '0'; } catch (_) {}
    let cifras = [];
    const pintaMascara = () => {
      if (!discreto) { mascara.textContent = ''; return; }
      const v = ta.value; const n = [...v].length;
      if (cifras.length > n) cifras.length = n;
      while (cifras.length < n) { const b = C.azar(1)[0]; cifras.push(String(b % 10)); }
      let i = 0; mascara.textContent = [...v].map((ch) => { const d = cifras[i++]; return ch === '\n' || ch === ' ' ? ch : d; }).join('') + (v.endsWith('\n') ? ' ' : '');
      mascara.scrollTop = ta.scrollTop;
    };
    const ponDiscreto = (on) => {
      discreto = !!on; try { localStorage.setItem('gcom-discreto', discreto ? '1' : '0'); } catch (_) {}
      conv.classList.toggle('discreta', discreto); $('#discreto').setAttribute('aria-pressed', String(discreto));
      ta.placeholder = discreto ? T('Modo discreto: lo que escribas se verá como números') : T('Escribe un mensaje');
      lienzo.classList.toggle('velado', discreto); pintaMascara();
    };
    $('#discreto').addEventListener('click', () => ponDiscreto(!discreto));
    ta.addEventListener('input', pintaMascara); ta.addEventListener('scroll', () => { mascara.scrollTop = ta.scrollTop; });
    // Velo: se descubre solo mientras se mantiene pulsado (ratón o dedo) sobre los mensajes o sobre la pista
    const lienzo = $('#lienzo');
    const descubre = (e) => { if (e.type === 'pointerdown' && e.button != null && e.button !== 0) return; lienzo.classList.remove('velado'); };
    // al soltar, un segundo de margen para poder pulsar un botón dentro del chat (Guardar, reproducir)
    let veloT = null; const cubre = () => { clearTimeout(veloT); if (!discreto) return; veloT = setTimeout(() => { if (discreto) lienzo.classList.add('velado'); }, 1200); };
    const descubreYa = (e) => { clearTimeout(veloT); descubre(e); };
    for (const el of [lienzo, $('#velo-pista')]) { el.addEventListener('pointerdown', descubreYa); el.addEventListener('contextmenu', (e) => e.preventDefault()); }
    addEventListener('pointerup', cubre); addEventListener('pointercancel', cubre); addEventListener('blur', cubre); document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') cubre(); });
    $('#velo-pista').addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); descubre(e); } });
    $('#velo-pista').addEventListener('keyup', cubre);
    ponDiscreto(discreto);
    // Notas de voz (dueño, 26 Oct 20:05): se graban aquí, se cifran y viajan como un archivo más; con la voz tal cual.
    let grab = null;
    const compositor = document.querySelector('.gc-compositor');
    const paraGrabacion = (enviar) => {
      if (!grab) return; const g = grab; grab = null; clearInterval(g.reloj);
      g.enviar = enviar; try { g.rec.stop(); } catch (_) {} setTimeout(() => g.stream.getTracks().forEach((x) => x.stop()), 300);
      compositor.classList.remove('grabando-ya'); $('#grabando').hidden = true; $('#grabar').setAttribute('aria-pressed', 'false');
    };
    $('#grabar').addEventListener('click', async () => {
      const c = CONVS.get(ACTUAL); if (!c) return;
      if (grab) return paraGrabacion(true);
      if (!navigator.mediaDevices || !window.MediaRecorder) return aviso(T('Este navegador no puede grabar audio.'));
      let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch (_) { return aviso(T('Sin permiso para el micrófono.')); }
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 64000 } : undefined);
      const trozos = []; const t0 = Date.now();
      rec.ondataavailable = (e) => { if (e.data && e.data.size) trozos.push(e.data); };
      rec.onstop = () => { const g = este; if (!g.enviar || !trozos.length) return; const tipo = rec.mimeType || mime || 'audio/webm'; const ext = /mp4/.test(tipo) ? 'm4a' : /ogg/.test(tipo) ? 'ogg' : 'webm'; const dur = Math.round((Date.now() - t0) / 1000); const f = new File(trozos, T('Nota de voz') + ' ' + new Date().toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' (' + Math.floor(dur / 60) + ':' + String(dur % 60).padStart(2, '0') + ').' + ext, { type: tipo }); const cc = CONVS.get(ACTUAL) || c; if (cc) enviaArchivos(cc, [f]); };
      const este = { rec, stream, enviar: false, reloj: null };
      grab = este; rec.start(250);
      compositor.classList.add('grabando-ya'); $('#grabando').hidden = false; $('#grabar').setAttribute('aria-pressed', 'true');
      este.reloj = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('#grabando-t').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); if (s >= 600) paraGrabacion(true); }, 250);
    });
    $('#grabar-cancelar').addEventListener('click', () => paraGrabacion(false));
    ta.addEventListener('paste', (e) => { const fs = [...((e.clipboardData && e.clipboardData.files) || [])]; const c = CONVS.get(ACTUAL); if (c && fs.length) { e.preventDefault(); enviaArchivos(c, fs.map((f, i) => (f.name && f.name !== 'image.png') ? f : new File([f], 'imagen-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + (i ? '-' + i : '') + '.' + ((f.type || '').split('/')[1] || 'png'), { type: f.type }))); } });
    $('#archivo').addEventListener('change', async (e) => { const c = CONVS.get(ACTUAL); const fs = [...e.target.files]; e.target.value = ''; if (c && fs.length) enviaArchivos(c, fs); });
    const zona = $('#conv');
    zona.addEventListener('dragover', (e) => { e.preventDefault(); });
    zona.addEventListener('drop', (e) => { e.preventDefault(); const c = CONVS.get(ACTUAL); const fs = [...(e.dataTransfer && e.dataTransfer.files) || []]; if (c && fs.length) enviaArchivos(c, fs); });
    document.querySelectorAll('.gc-hoja').forEach((h) => h.addEventListener('click', (e) => { if (e.target === h) h.classList.remove('gc-abierta'); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.gc-hoja.gc-abierta').forEach((h) => h.classList.remove('gc-abierta')); });
    addEventListener('hashchange', () => { if (/#i=/.test(location.hash)) { aceptaInvitacion(location.href); history.replaceState(null, '', location.pathname + location.search); } });
    addEventListener('guardiana-idioma', () => { pintaLista(); const c = CONVS.get(ACTUAL); if (c) pintaCabecera(c); });
  }

  // ---------- arranque ----------
  async function arranca() {
    if (!window.isSecureContext || !crypto.subtle || !window.indexedDB) { $('#inicio').innerHTML = '<p>' + T('Este navegador no puede abrir Comunicaciones: hace falta una conexión segura (https) y un navegador actual.') + '</p>'; return; }
    await BD.abre();
    await cargaIdentidad();
    arrancaRele();
    eventos();
    await cargaConvs();
    if (/#i=/.test(location.hash)) { const ok = await aceptaInvitacion(location.href); history.replaceState(null, '', location.pathname + location.search); if (!ok) aviso(T('Ese enlace no es una invitación de GUARDIANA.')); }
  }
  arranca().catch((e) => { console.error(e); aviso(T('Algo falló al arrancar: recarga la página.')); });
  window.GuardianaCom = { get convs() { return CONVS; }, get yo() { return YO; }, get rele() { return R; }, abreConv, creaInvitacion, aceptaInvitacion };
})();
