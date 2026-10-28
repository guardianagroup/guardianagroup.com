// GUARDIANA · Comunicaciones · la aplicación (26 Oct 2026). Identidad, invitaciones, sesiones, mensajes, archivos,
// llamadas y la pantalla. Lo que se guarda (IndexedDB «guardiana-com») queda en este navegador y se cifra en reposo con
// una clave que también vive aquí; «Destruir» lo borra en los dos lados. El relé nunca recibe nada legible.
'use strict';
(() => {
  const C = window.GuardianaCripto, $ = (s) => document.querySelector(s), T = (s) => (window.GuardianaIdioma ? GuardianaIdioma.t(s) : s);
  const LOC = () => (window.GuardianaIdioma && GuardianaIdioma.locale) || 'es';
  const TROZO = 192 * 1024, VENTANA = 12, VENTANA_B = 32;
  // Sesión blindada (dueño, 27 Oct 2026, 22:01–23:12): suite CNSA 2.0, invitación por enlace de 256 bits, verificación mutua
  // obligatoria, identidad nueva en cada sesión, renovación de claves cada 5 minutos, relleno e informe de cierre.
  const esB = (c) => !!(c && c.modo === 'blindada');
  const RENUEVA_B_MS = 5 * 60 * 1000;
  // en pruebas locales, «?renueva=N» acorta la renovación a N segundos
  const renuevaMs = () => (LOCAL && +new URLSearchParams(location.search).get('renueva') * 1000) || RENUEVA_B_MS;
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
  let LL = null; // llamadas de voz (llamada.js)
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : C.hex(C.azar(16)));
  // El viaje del archivo y el comprobante de custodia (dueño, 27 Oct 2026, 20:39): el estado de cada envío vive aquí,
  // solo en memoria; el comprobante firmado por los dos equipos se guarda como un mensaje más («custodia»).
  const VIAJES = new Map();
  const VJ = () => window.GuardianaViaje;
  const VERSION_APP = 'GUARDIANA Comunicaciones 2026-10-27'; // entra en el comprobante: qué versión midió y firmó
  const iso = (t) => (Number.isFinite(t) ? new Date(t).toISOString() : null);
  // latencias recibidas del otro equipo: { min, mediana, max, n } en enteros, o null
  const estadValida = (o) => (o && typeof o === 'object' && ['min', 'mediana', 'max', 'n'].every((k) => Number.isInteger(o[k]) && o[k] >= 0 && o[k] < 600000) ? { min: o.min, mediana: o.mediana, max: o.max, n: o.n } : null);
  const MI_PAIS = (() => { try { return (window.GuardianaViajeDatos && GuardianaViajeDatos.miPais()) || ''; } catch (_) { return ''; } })();
  const regionValida = (x) => (typeof x === 'string' && /^[A-Z]{2}$/.test(x) ? x : '');
  const latValida = (x) => (typeof x === 'number' && isFinite(x) && x >= 0 && x < 60000 ? Math.round(x) : null);
  const limpiaNombre = (n) => String(n || 'archivo').slice(0, 180).replace(/[\\/:*?"<>|]/g, '_');
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
  // En la blindada, cada sesión tiene su propia identidad (ECDSA y ECDH P-384 + ML-DSA-87): nada enlaza una sesión con
  // la siguiente, y al terminar se borra con todo lo demás. La clave ML-DSA-87 se guarda encriptada con la clave local.
  const miHuella = (c) => (esB(c) ? c.miHuellaB : YO.huella);
  async function preparaIdentidadB(c) {
    if (!C.B.hayBlindada()) throw new Error('sin blindada');
    if (!c.idB) { const n = await C.B.creaIdentidad(YO.reposo); c.idB = n.guardar; c.idBDsaSec = n.dsaSec; }
    else if (!c.idBDsaSec) c.idBDsaSec = await C.B.abreDsa(c.idB, YO.reposo);
    c.miHuellaB = await C.B.huella(c.idB.firmaPub, c.idB.acuerdoPub, c.idB.dsaPub);
  }
  async function yoId(sala, c) { return C.hex(await C.sha256(C.te.encode('GUARDIANA miembro\n' + sala + '\n' + C.hex(c ? miHuella(c) : YO.huella)))).slice(0, 16); }
  function convNueva(sala, semilla, rol, modo) {
    return { id: sala, semilla, rol, modo: modo === 'blindada' ? 'blindada' : 'normal', suVerificada: false, estado: 'invitacion', nombre: '', firmaPub: null, acuerdoPub: null, huella: null, verificada: false, creado: Date.now(), ultimo: Date.now(), ultimoTexto: null, noLeidos: 0 };
  }
  const guardable = (c) => ({ id: c.id, tumba: c.tumba, semilla: c.semilla, rol: c.rol, estado: c.estado, nombre: c.nombre, firmaPub: c.firmaPub, acuerdoPub: c.acuerdoPub, huella: c.huella, verificada: c.verificada, creado: c.creado, ultimo: c.ultimo, ultimoTexto: c.ultimoTexto, noLeidos: c.noLeidos, pqVisto: !!c.pqVisto, clasicaAceptada: !!c.clasicaAceptada, modo: c.modo || 'normal', suVerificada: !!c.suVerificada, dsaPub: c.dsaPub || null, idB: c.idB || null });
  const guardaConv = (c) => BD.pon('conv', guardable(c));
  async function preparaConv(c) {
    if (esB(c)) await preparaIdentidadB(c);
    const d = esB(c) ? await C.B.deSemilla(c.semilla) : await C.deSemilla(c.semilla);
    c.presentacion = d.presentacion; c.psk = d.psk; c.yo = await yoId(c.id, c);
    c.miembros = new Set(); c.sesion = null; c.sesiones = new Map(); c.ef = null; c.epoca = null; c.mensajes = []; c.cola = []; c.enviando = false; c.archivos = new Map();
    c.suId = c.huella ? C.hex(await C.sha256(C.te.encode('GUARDIANA miembro\n' + c.id + '\n' + C.hex(c.huella)))).slice(0, 16) : null;
    CONVS.set(c.id, c);
    R.entra(c.id, c.yo, esB(c) ? { b: 1 } : undefined);
  }
  // Una sola conversación (dueño, 26 Oct 20:04): al abrir, queda la activa más reciente; las invitaciones sin usar y las
  // conversaciones de versiones anteriores se borran (si la otra persona vuelve, recibe la orden de borrado).
  async function cargaConvs() {
    const xs = (await BD.todos('conv')).sort((a, b) => (b.creado || 0) - (a.creado || 0));
    const viva = xs.find((x) => (x.huella || (x.modo === 'blindada' && x.rol === 'invita')) && x.estado !== 'destruida_pendiente');
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
  // Invitación blindada: solo por enlace o QR, con la semilla entera (256 bits) en el fragmento «#b=»: el navegador no la
  // manda a ningún servidor y el relé no guarda ningún sobre. Se guarda aquí hasta que la otra persona entre o se termine.
  async function creaInvitacionB() {
    if (!R.abierto) { aviso(T('Sin conexión: espera un momento.')); return; }
    if (!C.B.hayBlindada()) { aviso(T('Este navegador no puede abrir una sesión blindada: hace falta uno actual.')); return; }
    for (const c of [...CONVS.values()]) await destruye(c, true);
    const semilla = C.nuevaSemilla();
    const d = await C.B.deSemilla(semilla);
    const c = convNueva(d.sala, semilla, 'invita', 'blindada');
    await preparaConv(c); await guardaConv(c);
    abreConv(c.id);
  }
  const enlaceB = (c) => ORIGEN + '#b=' + C.b64u(c.semilla);
  function muestraEnlace(c) {
    const u = enlaceB(c); $('#enlace-b').value = u;
    const q = $('#enlace-qr'); if (q && window.qrSvg && q.dataset.u !== u) { q.innerHTML = window.qrSvg(u); q.dataset.u = u; }
    const est = $('#enlace-estado'); est.textContent = c.ocupada ? T('Esta invitación ya la usó otra persona.') : T('Esperando a que la otra persona abra el enlace…'); est.classList.toggle('mal', !!c.ocupada);
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
  async function aceptaSemilla(semilla, modo) {
    const B = modo === 'blindada';
    if (B && !C.B.hayBlindada()) { aviso(T('Este navegador no puede abrir una sesión blindada: hace falta uno actual.')); return false; }
    const d = B ? await C.B.deSemilla(semilla) : await C.deSemilla(semilla);
    if (CONVS.has(d.sala)) { abreConv(d.sala); return true; }
    for (const c of [...CONVS.values()]) await destruye(c, true);
    const c = convNueva(d.sala, semilla, 'acepta', modo);
    await preparaConv(c); await guardaConv(c);
    pintaLista(); abreConv(c.id);
    return true;
  }
  // enlaces: «#b=» abre una sesión blindada; «#i=» (antiguos, ya no se muestran) sigue abriendo su conversación normal
  async function aceptaInvitacion(enlace) {
    let semilla = null, modo = 'normal';
    try { const m = String(enlace).match(/#([ib])=([A-Za-z0-9_-]{43})/); if (m) { semilla = C.deB64u(m[2]); modo = m[1] === 'b' ? 'blindada' : 'normal'; } } catch (_) {}
    if (!semilla || semilla.length !== 32) return false;
    return aceptaSemilla(semilla, modo);
  }

  // ---------- presentación y sesión ----------
  // Quién inicia: de las dos huellas, la menor. Quien inicia se presenta cuando llega o ve llegar; quien responde solo
  // contesta a una presentación (con «resp» = la época a la que contesta) y deriva la sesión en ese momento; quien
  // inicia deriva al recibir la respuesta a su época vigente. Así los dos usan el mismo par de efímeras.
  const soyInicio = (c) => !c.huella || C.hex(miHuella(c)) < C.hex(c.huella);
  const presentaX = (c, resp, forzar) => (esB(c) ? presentaB(c, resp, forzar) : presenta(c, resp, forzar));
  // presentarse va por la misma cola que las tramas de la conversación: nunca dos efímeras a medio camino
  const enCola = (c, f) => { c.proc = (c.proc || Promise.resolve()).then(f).catch((e) => console.warn(e)); return c.proc; };
  const reintenta = (c, ms) => { clearTimeout(c.reintento); c.reintento = setTimeout(() => { if (!c.sesion && c.suId && c.miembros.has(c.suId) && R.abierto) enCola(c, () => presentaX(c, null, true)); }, ms); };
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
    // Ronda 56: lo publicado dice «no seguimos sin tu permiso», así que también la primera vez: si la otra persona tiene una
    // versión sin la capa postcuántica, la sesión se para hasta que se acepte. En una conversación que nunca la tuvo, el
    // permiso vale para esa conversación; en una que ya la tuvo, cada vuelta atrás se pregunta de nuevo.
    if (!pq && !acepta && (c.pqVisto || !c.clasicaAceptada)) {
      const yaParada = !!c.clasicaPendiente; c.clasicaPendiente = { suEf, efMia }; c.sesion = null;
      if (!yaParada) vigila(c, c.pqVisto ? T('Sesión sin protección postcuántica parada: esta conversación ya la tenía. Solo sigue si tú lo aceptas.') : T('Sesión sin protección postcuántica parada: la otra persona usa una versión anterior. Solo sigue si tú lo aceptas.'), 'mal');
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
    reenviaCustodias(c);
    if (ACTUAL === c.id && document.visibilityState === 'visible') marcaLeidos(c);
  }

  // ---------- sesión blindada (suite CNSA 2.0) ----------
  // La misma coreografía que la normal (quien tiene la huella menor inicia; quien responde contesta a una época concreta),
  // con P-384, ML-KEM-1024 obligatorio y dos firmas (ECDSA P-384 y ML-DSA-87) sobre exactamente los mismos bytes. Una
  // presentación a la que le falte cualquiera de las dos firmas, o el ML-KEM, se descarta sin más.
  async function presentaB(c, resp, forzar) {
    if (c.estado === 'destruida' || !R.abierto || !c.idB) return null;
    if (!resp && !forzar && c.presentadoEn && Date.now() - c.presentadoEn < 1200) { reintenta(c, 1400); return null; }
    if (resp && !resp.ek) return null; // sin la clave ML-KEM de quien inicia no hay respuesta posible
    c.ef = await C.B.efimera(); c.epoca = C.azar(16);
    if (!resp && soyInicio(c)) c.ef.kem = C.B.kemPar();
    let pq = null;
    if (resp) { const k = C.B.kemEncapsula(resp.ek); pq = { ss: k.ss, ek: resp.ek, ct: k.ct }; }
    c.efs = c.efs || new Map(); c.efs.set(C.hex(c.epoca), c.ef); for (const k of [...c.efs.keys()].slice(0, -4)) { const v = c.efs.get(k); if (v && v.kem) { v.kem.dk.fill(0); v.kem = null; } c.efs.delete(k); }
    const id = c.idB;
    const datos = resp
      ? await C.B.datosResponde(c.id, id.firmaPub, id.acuerdoPub, id.dsaPub, c.ef.pub, c.epoca, resp.epoca, c.huella, resp.ef, pq.ek, pq.ct)
      : await C.B.datosInicia(c.id, id.firmaPub, id.acuerdoPub, id.dsaPub, c.ef.pub, c.epoca, c.ef.kem ? c.ef.kem.ek : new Uint8Array(0));
    const sig = await C.B.firma(id, datos), sigpq = C.B.firmaPQ(c.idBDsaSec, datos);
    const j = { v: 4, b: 1, firmaPub: C.b64u(id.firmaPub), acuerdoPub: C.b64u(id.acuerdoPub), dsaPub: C.b64u(id.dsaPub), ef: C.b64u(c.ef.pub), epoca: C.b64u(c.epoca), resp: resp ? C.b64u(resp.epoca) : '', nombre: YO.nombre, sig: C.b64u(sig), sigpq: C.b64u(sigpq) };
    if (c.ef.kem) j.kem = C.b64u(c.ef.kem.ek);
    if (pq) j.kemct = C.b64u(pq.ct);
    const iv = C.azar(12);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new Uint8Array([1]) }, c.presentacion, C.B.rellena(C.te.encode(JSON.stringify(j)))));
    R.manda(c.id, c.suId || null, C.cat(new Uint8Array([1]), iv, ct));
    c.presentadoEn = Date.now();
    if (!resp) reintenta(c, 4000 + Math.random() * 1500);
    return pq;
  }
  async function recibePresentacionB(c, de, b) {
    if (b.length < 30 || !c.idB) return;
    let j;
    try { j = JSON.parse(C.td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.subarray(1, 13), additionalData: new Uint8Array([1]) }, c.presentacion, b.subarray(13)))); } catch (_) { return; }
    try {
      if (!j || j.v !== 4 || j.b !== 1) return;
      const firmaPub = C.deB64u(j.firmaPub), acuerdoPub = C.deB64u(j.acuerdoPub), dsaPub = C.deB64u(j.dsaPub), ef = C.deB64u(j.ef), epoca = C.deB64u(j.epoca), sig = C.deB64u(j.sig), sigpq = C.deB64u(j.sigpq), resp = j.resp ? C.deB64u(j.resp) : null;
      const kemEk = j.kem ? C.deB64u(j.kem) : null, kemCt = j.kemct ? C.deB64u(j.kemct) : null;
      if (firmaPub.length !== C.B.EC || acuerdoPub.length !== C.B.EC || ef.length !== C.B.EC || dsaPub.length !== C.B.DSA_PUB || epoca.length !== 16 || (resp && resp.length !== 16) || sigpq.length !== C.B.DSA_FIRMA) return;
      if ((kemEk && (resp || kemEk.length !== C.B.EK)) || (kemCt && kemCt.length !== C.B.CT) || (!!resp !== !!kemCt)) return;
      const huella = await C.B.huella(firmaPub, acuerdoPub, dsaPub);
      if (C.hex(huella) === C.hex(c.miHuellaB)) return; // yo mismo desde otra pestaña
      if (c.huella && C.hex(c.huella) !== C.hex(huella)) { R.manda(c.id, de, new Uint8Array([5])); c.intrusos = (c.intrusos || 0) + 1; vigila(c, T('Intento de entrada con otra identidad: rechazado; la conversación sigue intacta.'), 'mal'); if (!c.intrusoAvisado) { c.intrusoAvisado = true; await anotaSistema(c, 'Alguien con otra identidad intentó entrar en esta conversación: rechazado.'); } pintaRadio(c); return; }
      c.epocasVistas = c.epocasVistas || new Set(); const eh = C.hex(epoca); if (c.epocasVistas.has(eh)) return; c.epocasVistas.add(eh); if (c.epocasVistas.size > 64) c.epocasVistas.delete(c.epocasVistas.values().next().value);
      const efMia = resp && c.efs ? c.efs.get(C.hex(resp)) : null;
      if (resp && (!efMia || !efMia.kem)) return; // respuesta a una época que no es de las últimas mías (o ya usada): fuera
      const datos = resp
        ? await C.B.datosResponde(c.id, firmaPub, acuerdoPub, dsaPub, ef, epoca, resp, c.miHuellaB, efMia.pub, efMia.kem.ek, kemCt)
        : await C.B.datosInicia(c.id, firmaPub, acuerdoPub, dsaPub, ef, epoca, kemEk || new Uint8Array(0));
      if (!(await C.B.verifica(firmaPub, sig, datos)) || !C.B.verificaPQ(dsaPub, sigpq, datos)) return; // las dos firmas, o nada
      const nueva = !c.huella;
      if (nueva) { c.firmaPub = firmaPub; c.acuerdoPub = acuerdoPub; c.dsaPub = dsaPub; c.huella = huella; c.estado = 'activa'; if (!c.nombre) c.nombre = String(j.nombre || '').slice(0, 40); }
      else if (!c.nombre && j.nombre) c.nombre = String(j.nombre).slice(0, 40);
      c.suId = de; c.miembros.add(de);
      if (nueva || j.nombre !== c.nombreVisto) { c.nombreVisto = j.nombre; await guardaConv(c); }
      if (!soyInicio(c)) { if (kemEk && !resp) { const pq = await presentaB(c, { epoca, ef, ek: kemEk }); await derivaSesionB(c, ef, c.ef, pq); } }
      else if (resp) { const pq = { ss: C.B.kemAbre(kemCt, efMia.kem.dk), ek: efMia.kem.ek, ct: kemCt }; efMia.kem.dk.fill(0); efMia.kem = null; await derivaSesionB(c, ef, efMia, pq); }
      else await presentaB(c, null);
      if (nueva) { clearInterval(muestraInvitacion.reloj); await anotaSistema(c, 'Sesión blindada establecida. Antes de enviar nada, comprobad los dos el número de seguridad por otro canal.'); if (ACTUAL === c.id) abreConv(c.id); }
      if (c.estado === 'destruida_pendiente') { enviaControl(c, { tipo: 'destruir' }); setTimeout(() => destruyeLocal(c, false, true), 300); return; }
      pintaLista(); if (ACTUAL === c.id) pintaCabecera(c);
    } catch (e) { console.warn('presentación blindada', e); }
  }
  async function derivaSesionB(c, suEf, efMia, pq) {
    if (!efMia || !suEf || !c.acuerdoPub || !pq || !pq.ss) { if (pq && pq.ss) pq.ss.fill(0); return; }
    const inicio = soyInicio(c);
    const s = await C.B.sesion(c.idB, efMia, { ef: suEf, acuerdoPub: c.acuerdoPub }, c.id, inicio, c.psk, c.miHuellaB, c.huella, pq);
    pq.ss.fill(0);
    const sid = C.hex(s.hash.subarray(0, 8)), renovada = !!c.sesion;
    const ses = { sid, hash: s.hash, envio: C.B.cadena(s.envio), recibo: C.B.cadena(s.recibo), desde: Date.now(), confirmada: false, pq: true, blindada: true };
    c.sesiones.set(sid, ses); c.sesion = ses; clearTimeout(c.reintento); c.encuentros = (c.encuentros || 0) + 1;
    if (!c.pqVisto) { c.pqVisto = true; guardaConv(c); }
    vigila(c, renovada ? T('Claves renovadas (algoritmos CNSA 2.0): lo anterior ya no se puede leer con las claves nuevas.') : T('Claves acordadas con la otra persona: algoritmos CNSA 2.0 (ML-KEM-1024 y ECDH P-384).'), 'info');
    // de las sesiones anteriores quedan las dos últimas (por los mensajes en vuelo); las demás se borran de la memoria
    for (const k of [...c.sesiones.keys()].slice(0, -3)) { const x = c.sesiones.get(k); try { x.envio.borra(); x.recibo.borra(); } catch (_) {} c.sesiones.delete(k); }
    pintaCabecera(c); pintaLista();
    enviaControl(c, { tipo: 'ok' });
    if (YO.nombre) enviaControl(c, { tipo: 'nombre', nombre: YO.nombre });
    if (c.verificada) enviaControl(c, { tipo: 'verificada', si: 1, n: await hNumero(c) });
    enviaCola(c);
    reenviaCustodias(c);
    if (ACTUAL === c.id && document.visibilityState === 'visible') marcaLeidos(c);
  }
  // ---------- número de seguridad y verificación mutua ----------
  const numeroDe = (c) => (esB(c) ? C.B.numeroSeguridad(c.miHuellaB, c.huella) : C.numeroSeguridad(YO.huella, c.huella));
  const hNumero = async (c) => C.hex(await C.sha256(C.te.encode('GUARDIANA número comprobado\n' + (await numeroDe(c)))));
  async function marcaVerificada(c, si) {
    c.verificada = !!si; await guardaConv(c);
    if (esB(c) && c.huella) {
      enviaControl(c, { tipo: 'verificada', si: c.verificada ? 1 : 0, n: await hNumero(c) });
      await anotaSistema(c, c.verificada ? 'Has comprobado el número de seguridad.' : 'Has retirado tu comprobación del número de seguridad.');
      vigila(c, c.verificada ? T('Has comprobado el número de seguridad.') : T('Has retirado tu comprobación del número de seguridad.'), c.verificada ? 'bien' : 'info');
    }
    pintaCabecera(c); pintaRadio(c); enviaCola(c);
  }
  async function recibeVerificada(c, j) {
    if (!esB(c) || !c.huella) return;
    const antes = !!c.suVerificada;
    if (j.si === 1 && j.n === (await hNumero(c))) {
      c.suVerificada = true;
      if (!antes) { await anotaSistema(c, 'La otra persona ha comprobado el número de seguridad.'); vigila(c, T('La otra persona ha comprobado el número de seguridad.'), 'bien'); }
    } else if (j.si === 1) {
      // el otro equipo ve otro número: no son las mismas identidades en los dos lados (o alguien en medio)
      c.suVerificada = false;
      await anotaSistema(c, 'El número de seguridad no coincide en los dos equipos: no enviéis nada y comprobadlo de nuevo por otro canal.');
      vigila(c, T('El número de seguridad no coincide en los dos equipos: no enviéis nada y comprobadlo de nuevo por otro canal.'), 'mal');
      c.incidencias = (c.incidencias || 0) + 1;
    } else {
      c.suVerificada = false;
      if (antes) { await anotaSistema(c, 'La otra persona ha retirado su comprobación del número de seguridad.'); vigila(c, T('La otra persona ha retirado su comprobación del número de seguridad.'), 'info'); }
    }
    await guardaConv(c); pintaCabecera(c); pintaRadio(c); enviaCola(c);
  }
  // La puerta de la blindada: encima del campo de escribir, con el número a la vista, hasta que los dos lo comprueban
  async function pintaPuerta(c) {
    const p = $('#bl-puerta'); if (!p) return;
    const ver = !!(esB(c) && c.huella && ACTUAL === c.id && !(c.verificada && c.suVerificada));
    p.hidden = !ver; $('#conv').classList.toggle('bl-cerrada', ver);
    if (!ver) return;
    const n = await numeroDe(c); if ($('#bl-numero').textContent !== n) $('#bl-numero').textContent = n;
    const yo = $('#bl-yo'), otro = $('#bl-otro');
    yo.textContent = c.verificada ? T('Tú: comprobado') : T('Tú: pendiente'); yo.className = c.verificada ? 'si' : '';
    otro.textContent = c.suVerificada ? T('La otra persona: comprobado') : T('La otra persona: pendiente'); otro.className = c.suVerificada ? 'si' : '';
    const bt = $('#bl-coincide'); bt.textContent = c.verificada ? T('Retirar mi comprobación') : T('He comprobado que coincide'); bt.classList.toggle('principal', !c.verificada);
  }
  // ---------- informe de cierre (blindada) ----------
  function muestraCierre(c) {
    const n = c.mensajes.filter((m) => m.tipo === 'texto').length, a = c.mensajes.filter((m) => m.tipo === 'archivo').length, k = c.mensajes.filter((m) => m.tipo === 'custodia').length;
    $('#cierre-cuenta').textContent = n + ' ' + (n === 1 ? T('mensaje') : T('mensajes')) + ' · ' + a + ' ' + (a === 1 ? T('archivo') : T('archivos')) + ' · ' + k + ' ' + (k === 1 ? T('comprobante') : T('comprobantes'));
    $('#cierre-aviso-comp').hidden = !k;
    abreHoja('h-cierre');
  }
  // borrado criptográfico de lo que vive en memoria: claves de cadena, secreto de la invitación, psk e identidad de la sesión
  function borraClavesB(c) {
    try { for (const x of c.sesiones.values()) { if (x.envio.borra) x.envio.borra(); if (x.recibo.borra) x.recibo.borra(); } } catch (_) {}
    try { if (c.psk) c.psk.fill(0); if (c.semilla) c.semilla.fill(0); if (c.idBDsaSec) c.idBDsaSec.fill(0); if (c.efs) for (const v of c.efs.values()) if (v && v.kem) v.kem.dk.fill(0); } catch (_) {}
    c.sesion = null; c.sesiones = new Map(); c.idB = null; c.idBDsaSec = null; c.efs = null;
  }

  // ---------- mensajes ----------
  async function sella(c, obj) {
    const ses = c.sesion; if (!ses) return null;
    const { n, clave } = await ses.envio.siguiente();
    const cab = new Uint8Array(13); cab[0] = 2; cab.set(C.deHex(ses.sid), 1); new DataView(cab.buffer).setUint32(9, n);
    const claro = C.te.encode(JSON.stringify(obj));
    const ct = await C.sella(clave, n, esB(c) ? C.B.rellena(claro) : claro, C.cat(cab, ses.hash)); // AAD: cabecera + hash de sesión entero
    if (esB(c)) clave.fill(0); // la clave de este mensaje ya no sirve: fuera de la memoria
    return C.cat(cab, ct);
  }
  function enviaControl(c, obj) { if (!c.sesion || !R.abierto || !c.miembros.has(c.suId)) return false; sella(c, obj).then((b) => b && R.manda(c.id, c.suId, b)); return true; }
  const enLinea = (c) => !!(c.suId && c.miembros.has(c.suId) && c.sesion && R.abierto);
  // blindada: nada de contenido (mensajes, archivos, llamadas) hasta que los dos han comprobado el número de seguridad
  const puedeEnviar = (c) => !esB(c) || !!(c.verificada && c.suVerificada);

  async function enviaTexto(c, texto) {
    const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'mia', estado: 'pendiente', tipo: 'texto', texto };
    await guardaMensaje(c, m); c.mensajes.push(m); c.cola.push(m);
    pintaMensaje(c, m); actualizaUltimo(c, m);
    enviaCola(c);
  }
  async function enviaCola(c) {
    if (c.enviando) return; c.enviando = true;
    try {
      while (c.cola.length && enLinea(c) && puedeEnviar(c)) {
        const m = c.cola[0];
        const carga = m.tipo === 'texto' ? { tipo: 'texto', id: m.id, t: m.t, texto: m.texto } : m.tipo === 'archivo' ? { tipo: 'archivo', id: m.id, t: m.t, nombre: m.archivo.nombre, tam: m.archivo.tam, mime: m.archivo.mime, clave: m.archivo.clave, trozos: m.archivo.trozos, v: 1, region: MI_PAIS || undefined, voz: m.archivo.voz ? 1 : undefined } : null;
        if (!carga) { c.cola.shift(); continue; }
        const vj = m.tipo === 'archivo' && VIAJES.get(m.id), sesU = c.sesion; // la clave del archivo viaja en esta sesión
        const b = await sella(c, carga); if (!b || !R.manda(c.id, c.suId, b)) break;
        if (vj && sesU) { vj.pq = !!sesU.pq; vj.sid = sesU.sid; vj.sesionDesde = sesU.desde; vj.tAnuncio = Date.now(); }
        if (vj) evento(vj, T('Anuncio enviado al destinatario, encriptado de extremo a extremo; se espera su confirmación.')); // antes de cualquier espera: va antes que la respuesta
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
      case 'verificada': return recibeVerificada(c, j);
      case 'nombre': { const n = String(j.nombre || '').trim().slice(0, 40); if (!c.nombreFijado && n && n !== c.nombre) { c.nombre = n; await guardaConv(c); pintaLista(); pintaCabecera(c); } return; }
      case 'archivo': return recibeAnuncioArchivo(c, j, ses);
      case 'archivo-ack': { const a = c.archivos.get(j.id); if (a && a.envio) { a.ack = Math.max(a.ack, +j.hasta || 0); a.sigue && a.sigue(); acuseViaje(j, a); } return; }
      case 'archivo-listo': { const a = c.archivos.get(j.id); if (a && a.envio) { a.listo = true; a.sigue && a.sigue(); listoViaje(c, j); } return; }
      case 'viaje': { const v = VIAJES.get(j.id); if (v) { const l = latValida(j.lat); if (l != null) v.latSuya.push(l); if (v.rol === 'recibe' && typeof j.bytes === 'number' && isFinite(j.bytes)) v.enCamino = Math.max(0, Math.min(v.tam, j.bytes) - (v.confirmados || 0)); } return; }
      case 'custodia': return recibeCustodia(c, j);
      case 'custodia-firma': return firmaCustodia(c, j);
      case 'custodia-no': return rechazoCustodia(c, j);
      case 'archivo-fin': { const a = c.archivos.get(j.id); const m = c.mensajes.find((x) => x.id === j.id); const v = VIAJES.get(j.id); if (a) c.archivos.delete(j.id); if (m) { m.estado = j.ok ? 'entregado' : 'fallo'; m.archivo.progreso = j.ok ? 1 : m.archivo.progreso; await guardaMensaje(c, m); pintaMensaje(c, m, true); vigila(c, (j.ok ? T('Archivo entregado') : T('Archivo no completado')) + ': ' + m.archivo.nombre + (j.ok ? ' · ' + T('acuse del otro equipo: completo y autenticado.') : ''), j.ok ? 'bien' : 'mal'); pintaRadio(c); if (j.ok && v && v.custodia === 'si' && j.v === 1 && a && a.sha256) await entregaViaje(c, m, a, v, j); else { if (v) finViaje(v, j.ok, j); if (j.ok) await recibo(c, m, +j.seg || 0, +j.trozos || m.archivo.trozos, true); } } return; }
      case 'archivo-cancel': { const a = c.archivos.get(j.id); if (a) { a.cancelado = true; if (a.escritor) { try { await a.escritor.abort(); } catch (_) {} } c.archivos.delete(j.id); } const m = c.mensajes.find((x) => x.id === j.id); const vc = VIAJES.get(j.id); if (vc && vc.estado !== 'entregado') { vc.estado = 'fallo'; vc.tFin = Date.now(); evento(vc, j.por === 'integridad' ? T('El otro equipo ha detenido el envío: un fragmento no superó la autenticación.') : T('El otro equipo ha cancelado el envío.'), 'mal'); } if (m && m.estado !== 'recibido') { m.estado = 'fallo'; if (j.por === 'integridad') { m.archivo.motivo = T('cortado en el otro lado: datos alterados'); c.incidencias = (c.incidencias || 0) + 1; await anotaSistema(c, 'La otra persona cortó un envío porque no superó la comprobación de integridad.'); } await guardaMensaje(c, m); pintaMensaje(c, m, true); pintaRadio(c); } return; }
      case 'llamada': if (LL && c.id === ACTUAL) await LL.recibe(j); return; // llamadas de voz (dueño, 27 Oct 2026, 23:05)
      case 'destruir': return destruyeLocal(c, true);
      default: return;
    }
  }
  async function guardaMensaje(c, m) {
    const cuerpo = m.tipo === 'texto' ? { tipo: 'texto', texto: m.texto } : m.tipo === 'archivo' ? { tipo: 'archivo', archivo: m.archivo } : m.tipo === 'custodia' ? { tipo: 'custodia', custodia: m.custodia, texto: m.texto } : { tipo: m.tipo, texto: m.texto, llamada: m.llamada };
    const s = await guardaSellado(cuerpo);
    await BD.pon('msg', { id: m.id, conv: c.id, t: m.t, dir: m.dir, estado: m.estado, iv: s.iv, datos: s.datos });
  }
  async function cargaMensajes(c) {
    if (c.cargados) return;
    const xs = (await BD.porConv('msg', c.id)).sort((a, b) => a.t - b.t);
    c.mensajes = [];
    for (const x of xs) { const cu = await leeSellado(x); if (!cu) continue; const m = { id: x.id, conv: c.id, t: x.t, dir: x.dir, estado: x.estado, tipo: cu.tipo, texto: cu.texto, archivo: cu.archivo, llamada: cu.llamada, custodia: cu.custodia }; if (m.dir === 'mia' && m.estado === 'pendiente') c.cola.push(m); if (m.tipo === 'archivo' && m.dir === 'mia' && m.estado !== 'entregado' && m.estado !== 'leido' && m.archivo && (m.archivo.progreso || 0) < 1) { m.estado = 'fallo'; c.cola = c.cola.filter((q) => q !== m); } if (m.tipo === 'archivo' && m.dir === 'suya' && m.estado === 'recibiendo') m.estado = 'fallo'; c.mensajes.push(m); }
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
  async function enviaArchivos(c, archivos, opc) {
    const voz = !!(opc && opc.voz);
    for (const f of archivos) {
      if (!f || !f.size) continue;
      const clave = C.azar(32), trozos = Math.ceil(f.size / TROZO) || 1;
      const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'mia', estado: 'pendiente', tipo: 'archivo', archivo: { nombre: (f.name || 'archivo').slice(0, 180), tam: f.size, mime: f.type || 'application/octet-stream', clave: C.b64u(clave), trozos, progreso: 0, voz: voz || undefined } };
      c.archivos.set(m.id, { envio: true, f, clave: await C.aes(clave), ack: 0, trozos, listo: false, enviados: 0 });
      if (f.size <= MAX_MEMORIA && /^(image|audio)\//.test(m.archivo.mime)) await BD.pon('arch', { id: m.id, conv: c.id, blob: f, nombre: m.archivo.nombre, mime: m.archivo.mime, tam: f.size });
      const v = viajeNuevo(c, m, 'envia'); v.voz = voz;
      evento(v, T('Archivo preparado') + ': ' + trozos.toLocaleString(LOC()) + ' ' + T('fragmentos de 192 KB, cada uno encriptado y autenticado por separado (AES-256-GCM).'));
      await guardaMensaje(c, m); c.mensajes.push(m); c.cola.push(m); pintaMensaje(c, m); actualizaUltimo(c, m);
      abreSiToca(v);
    }
    enviaCola(c);
  }
  async function falla(c, m, texto) {
    m.estado = 'fallo'; await guardaMensaje(c, m); pintaMensaje(c, m, true); if (texto) aviso(texto);
    const v = VIAJES.get(m.id); if (v && v.estado !== 'entregado' && v.estado !== 'fallo') { v.estado = 'fallo'; v.tFin = Date.now(); evento(v, T('Envío interrumpido.') + (texto ? ' ' + texto : ''), 'mal'); }
  }
  async function mandaArchivo(c, m) {
    const a = c.archivos.get(m.id);
    if (!a || !a.f) return falla(c, m, T('Ese archivo ya no está disponible para enviarlo: elígelo otra vez.'));
    // espera «archivo-listo» (la otra persona ha elegido dónde guardarlo o lo recibe en memoria)
    const t0 = Date.now();
    while (!a.listo) { if (a.cancelado || c.estado === 'destruida') return; if (!enLinea(c) || Date.now() - t0 > 10 * 60 * 1000) return falla(c, m); await new Promise((r) => { a.sigue = r; setTimeout(r, 500); }); }
    const fid = fidDe(m.id); a.t0 = Date.now();
    const v = VIAJES.get(m.id), huella = window.GuardianaSHA256 ? GuardianaSHA256.crea() : null;
    if (v) { v.estado = 'viaje'; v.t0 = a.t0; VJ() && VJ().muestra(v, 0); vigilaViajes(); abreSiToca(v, true); }
    for (let i = 0; i < a.trozos; i++) {
      if (a.cancelado || c.estado === 'destruida') return;
      while (i - a.ack >= (esB(c) ? VENTANA_B : VENTANA) || R.atraso > (esB(c) ? 8 : 3) * 1024 * 1024) { if (!enLinea(c)) return falla(c, m, T('Se perdió la conexión.')); await new Promise((r) => { a.sigue = r; setTimeout(r, 300); }); if (a.cancelado) return; }
      let claro; try { claro = new Uint8Array(await a.f.slice(i * TROZO, (i + 1) * TROZO).arrayBuffer()); } catch (_) { return falla(c, m, T('No se pudo leer el archivo: ¿sigue en el mismo sitio?')); }
      if (huella) huella.pon(claro); // la huella del archivo entero, en orden: la misma que calcula el equipo del destinatario
      const cab = new Uint8Array(21); cab[0] = 3; cab.set(fid, 1); new DataView(cab.buffer).setUint32(17, i);
      // blindada: el último trozo sale completo (192 KB), así el relé no ve el tamaño exacto del archivo
      const carga = esB(c) && claro.length < TROZO ? (() => { const x = new Uint8Array(TROZO); x.set(claro); return x; })() : claro;
      const ct = await C.sella(a.clave, i, carga, cab);
      if (!R.manda(c.id, c.suId, C.cat(cab, ct))) return falla(c, m, T('Se perdió la conexión.'));
      a.enviados += claro.length;
      if (v && i === 0) { v.salida = new Date().toISOString(); v.tipoReal = VJ().tipoPorContenido(claro); evento(v, T('Primer fragmento enviado al relé de GUARDIANA') + (v.rele && v.rele.ciudad && !v.rele.prueba ? ' · ' + v.rele.ciudad + ', ' + VJ().pais(v.rele.cc) : '') + '.'); }
      m.archivo.progreso = (i + 1) / a.trozos; pintaProgreso(m);
    }
    if (huella) a.sha256 = C.hex(huella.cierra());
    if (v) v.tUltimo = Date.now();
    if (v) evento(v, T('Último fragmento enviado: se espera la confirmación del destinatario.'));
  }
  async function recibeAnuncioArchivo(c, j, ses) {
    if (c.mensajes.some((x) => x.id === j.id)) return;
    const tam = +j.tam || 0, trozos = +j.trozos || 0;
    if (!tam || trozos !== (Math.ceil(tam / TROZO) || 1) || !j.clave) { enviaControl(c, { tipo: 'archivo-cancel', id: j.id }); return; }
    const voz = j.voz === 1, custodia = j.v === 1 && !voz;
    const m = { id: String(j.id).slice(0, 64), conv: c.id, t: Math.min(Date.now(), +j.t || Date.now()), dir: 'suya', estado: 'recibiendo', tipo: 'archivo', archivo: { nombre: limpiaNombre(j.nombre), tam, mime: String(j.mime || 'application/octet-stream').slice(0, 100), trozos, progreso: 0, aDisco: tam > MAX_MEMORIA || (conDisco() && tam > 32 * 1024 * 1024), custodia: custodia ? 1 : undefined } };
    const a = { envio: false, clave: await C.aes(C.deB64u(j.clave)), partes: null, escritor: null, siguiente: 0, tengo: 0, trozos, m, pendientes: new Map(), huella: window.GuardianaSHA256 ? GuardianaSHA256.crea() : null, hPtr: 0 };
    c.archivos.set(m.id, a);
    const v = viajeNuevo(c, m, 'recibe'); v.voz = voz; v.custodia = voz ? 'voz' : custodia ? 'si' : 'no'; v.paisSuyo = regionValida(j.region); v.pq = !!(ses && ses.pq); v.sid = ses ? ses.sid : ''; v.sesionDesde = ses ? ses.desde : null;
    evento(v, T('Anuncio del archivo recibido, encriptado de extremo a extremo') + ': ' + trozos.toLocaleString(LOC()) + ' ' + T('fragmentos') + '.');
    if (!m.archivo.aDisco) { a.partes = new Array(trozos); a.listo = true; }
    else if (!conDisco()) { enviaControl(c, { tipo: 'archivo-cancel', id: m.id }); c.archivos.delete(m.id); m.estado = 'fallo'; m.archivo.motivo = T('Pasa de 300 MB y este navegador no puede escribirlo al disco según llega (Chrome o Edge sí).'); v.estado = 'fallo'; evento(v, m.archivo.motivo, 'mal'); }
    await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m); actualizaUltimo(c, m, true);
    if (a.listo) { enviaControl(c, listoCarga(m.id, v)); evento(v, T('Listo para recibir: aviso enviado al remitente.')); }
    else if (m.estado !== 'fallo') { evento(v, T('Elige dónde guardarlo para empezar la recepción.')); avisaSonido(); if (ACTUAL !== c.id) aviso(T('Te están mandando un archivo grande: elige dónde guardarlo.')); }
  }
  const listoCarga = (id, v) => ({ tipo: 'archivo-listo', id, v: 1, region: MI_PAIS || undefined, lat: v ? VJ() && VJ().minima(v.latMia) : undefined });
  // «Guardar en…» (archivos grandes): la persona elige el destino y, desde ahí, cada trozo se escribe según llega.
  async function eligeDestino(c, m) {
    const a = c.archivos.get(m.id); if (!a || a.listo) return;
    try {
      const h = await window.showSaveFilePicker({ suggestedName: m.archivo.nombre });
      a.escritor = await h.createWritable(); a.listo = true; a.nombreDisco = h.name;
      const v = VIAJES.get(m.id);
      enviaControl(c, listoCarga(m.id, v)); if (v) evento(v, T('Destino elegido en tu disco: aviso enviado al remitente.'));
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
    if (esB(c) && claro.length === TROZO && esperado < TROZO) claro = claro.subarray(0, esperado); // el relleno del último trozo
    if (claro.length !== esperado) return incidencia(c, m, a, 'Un trozo del archivo no coincide con lo anunciado: envío cortado.');
    const v = VIAJES.get(m.id);
    if (v && i === 0 && !v.tipoReal) v.tipoReal = VJ().tipoPorContenido(claro);
    if (!a.t0) { a.t0 = Date.now(); if (v) { v.estado = 'viaje'; v.t0 = a.t0; VJ() && VJ().muestra(v, 0); evento(v, T('Primer fragmento recibido y autenticado en tu equipo.')); vigilaViajes(); abreSiToca(v, true); } }
    c.ultimaVerificacion = Date.now();
    if (a.partes) {
      if (a.partes[i]) return; a.partes[i] = claro; a.tengo++;
      // la huella, en orden: los fragmentos llegan en orden y, si no, esperan a los anteriores
      if (a.huella) while (a.hPtr < a.trozos && a.partes[a.hPtr]) { a.huella.pon(a.partes[a.hPtr]); a.hPtr++; }
    }
    else {
      // al disco, en orden: lo que llega adelantado espera en memoria (como mucho la ventana)
      if (i < a.siguiente || a.pendientes.has(i)) return;
      a.pendientes.set(i, claro);
      while (a.pendientes.has(a.siguiente)) { const x = a.pendientes.get(a.siguiente); a.pendientes.delete(a.siguiente); if (a.huella) a.huella.pon(x); try { await a.escritor.write(x); } catch (_) { c.archivos.delete(m.id); enviaControl(c, { tipo: 'archivo-cancel', id: m.id }); return falla(c, m, T('No se pudo escribir el archivo en el disco.')); } a.siguiente++; a.tengo++; a.hPtr++; }
    }
    m.archivo.progreso = a.tengo / a.trozos; pintaProgreso(m);
    if (v) { v.verificados = a.tengo; v.confirmados = a.tengo === a.trozos ? v.tam : Math.min(v.tam, a.tengo * TROZO); VJ() && VJ().muestra(v, v.confirmados); hito(v, T('Recibido y autenticado en tu equipo')); }
    if (a.tengo % 4 === 0 || a.tengo === a.trozos) enviaControl(c, { tipo: 'archivo-ack', id: m.id, hasta: a.tengo, lat: v && VJ() ? VJ().minima(v.latMia) : undefined });
    if (a.tengo === a.trozos) {
      c.archivos.delete(m.id);
      let ok = true;
      if (a.partes) { const blob = new Blob(a.partes, { type: m.archivo.mime }); ok = blob.size === m.archivo.tam; if (ok) await BD.pon('arch', { id: m.id, conv: c.id, blob, nombre: m.archivo.nombre, mime: m.archivo.mime, tam: blob.size }); }
      else { try { await a.escritor.close(); } catch (_) { ok = false; } }
      m.estado = ok ? 'recibido' : 'fallo'; m.archivo.progreso = 1;
      const seg = Math.max(0.1, (Date.now() - (a.t0 || Date.now())) / 1000);
      vigila(c, ok ? T('Archivo recibido') + ': ' + m.archivo.nombre + ' · ' + a.trozos + ' ' + T('trozos autenticados, completo.') : T('Archivo incompleto: ') + m.archivo.nombre, ok ? 'bien' : 'mal');
      // lo que este equipo ha medido: entra en el comprobante y se comprueba antes de firmarlo (se guarda con el mensaje)
      const sha = ok && a.huella && a.hPtr === a.trozos ? C.hex(a.huella.cierra()) : null;
      const obs = sha ? { sha256: sha, llegada: new Date().toISOString(), primero: iso(a.t0), anuncio: v ? iso(v.tCreado) : null, lat: v && VJ() ? VJ().estad(v.latMia) : null, verificada: !!c.verificada, nombre: YO.nombre || '', region: MI_PAIS || '', version: VERSION_APP, tipo: (v && v.tipoReal) || null, mutua: esB(c) ? !!(c.verificada && c.suVerificada) : undefined, pq: !!(v && v.pq), sid: (v && v.sid) || '', rele: v && v.rele ? v.rele.host || '' : '', rele_region: R.region || '' } : null;
      if (obs && m.archivo.custodia) m.archivo.obs = obs;
      await guardaMensaje(c, m); pintaMensaje(c, m, true); pintaRadio(c);
      const fin = { tipo: 'archivo-fin', id: m.id, ok, seg: Math.round(seg * 10) / 10, trozos: a.trozos };
      if (obs) Object.assign(fin, { v: 1, sha256: obs.sha256, llegada: obs.llegada, primero: obs.primero, anuncio: obs.anuncio, lat: obs.lat, verificada: obs.verificada, nombre: obs.nombre, region: obs.region || undefined, version: obs.version, tipoReal: obs.tipo, mutua: obs.mutua }); // «tipo» es el del mensaje: el del archivo va en «tipoReal»
      enviaControl(c, fin);
      if (v) { finViaje(v, ok); if (ok) { v.coincide = undefined; evento(v, T('Último fragmento autenticado: archivo completo.'), 'bien'); if (sha) evento(v, T('Huella SHA-256 calculada en tu equipo') + ': ' + VJ().agrupa(sha, 16) + '…'); } }
      // con comprobante, la tarjeta firmada sustituye al recibo; si no llega en 30 s, queda el recibo de siempre
      if (ok && !(m.archivo.custodia && obs)) await recibo(c, m, seg, a.trozos, false);
      else if (ok) setTimeout(() => { if (!c.mensajes.some((x) => x.id === 'cu-' + m.id) && c.estado !== 'destruida') recibo(c, m, seg, a.trozos, false); }, 30000);
      if (ok && !(ACTUAL === c.id && document.visibilityState === 'visible')) avisaSonido();
    }
  }
  // Manipulación detectada (ronda del dueño, 26 Oct 20:03): se corta el envío al instante, queda marcado en coral y anotado.
  async function incidencia(c, m, a, texto) {
    c.incidencias = (c.incidencias || 0) + 1;
    if (a) { a.cancelado = true; if (a.escritor) { try { await a.escritor.abort(); } catch (_) {} } c.archivos.delete(m.id); }
    enviaControl(c, { tipo: 'archivo-cancel', id: m.id, por: 'integridad' });
    m.estado = 'fallo'; m.archivo.motivo = T('detenido: no superó la autenticación'); await guardaMensaje(c, m); pintaMensaje(c, m, true);
    const v = VIAJES.get(m.id); if (v) { v.estado = 'fallo'; v.tFin = Date.now(); evento(v, T(texto), 'mal'); }
    await anotaSistema(c, texto); aviso(T(texto)); vigila(c, T(texto), 'mal'); pintaRadio(c);
  }
  // Recibo de entrega (dueño, 26 Oct 20:25): aparece solo en el chat cuando el archivo ha llegado entero al otro equipo.
  const segundos = (x) => (x < 60 ? x.toLocaleString(LOC(), { maximumFractionDigits: 1 }) + ' s' : Math.floor(x / 60) + ' min ' + Math.round(x % 60) + ' s');
  async function recibo(c, m, seg, trozos, entregado) {
    const texto = (entregado ? T('Recibo de entrega') : T('Recibo de recepción')) + ' · ' + m.archivo.nombre + ' · ' + tamano(m.archivo.tam) + ' · ' + T('en') + ' ' + segundos(seg) + ' · ' + trozos + ' ' + T('trozos comprobados') + ' · ' + T('cifrado de extremo a extremo; cada trozo superó la autenticación') + ' · ' + T('contenido no analizado: viaja cifrado');
    const r = { id: uuid(), conv: c.id, t: Date.now(), dir: 'sistema', estado: 'ok', tipo: 'recibo', texto };
    await guardaMensaje(c, r); c.mensajes.push(r); pintaMensaje(c, r);
  }
  // ---------- el viaje del archivo y el comprobante de custodia digital ----------
  const MIN_VIAJE = 1024 * 1024; // el viaje se abre solo a partir de 1 MB (nunca con notas de voz)
  function viajeNuevo(c, m, rol) {
    const r = window.GuardianaViajeDatos ? GuardianaViajeDatos.rele(R.url || '') : {};
    const v = { id: m.id, conv: c.id, rol, tCreado: Date.now(), mime: m.archivo.mime, nombre: m.archivo.nombre, tam: m.archivo.tam, trozos: m.archivo.trozos, estado: 'espera', confirmados: 0, enCamino: 0, verificados: 0, muestras: [], latMia: R.latencia != null ? [R.latencia] : [], latSuya: [], paisMio: MI_PAIS, paisSuyo: '', rele: r, pq: !!(c.sesion && c.sesion.pq), verificada: !!c.verificada, otro: c.nombre || '', eventos: [], incidencias: [] };
    VIAJES.set(m.id, v);
    return v;
  }
  function evento(v, texto, nivel) { if (VJ()) VJ().evento(v, texto, nivel); else { v.eventos.push({ t: Date.now(), texto, nivel: nivel || '' }); } }
  // hitos del 25, 50 y 75 % (solo en archivos de 4 MB o más: en los pequeños serían ruido)
  function hito(v, texto) {
    if (v.tam < 4 * 1024 * 1024) return;
    const n = Math.min(3, Math.floor((v.confirmados / v.tam) * 4));
    while ((v.hito || 0) < n) { v.hito = (v.hito || 0) + 1; evento(v, texto + ': ' + v.hito * 25 + ' %'); }
  }
  let viajeCerradoEn = 0, relojViajes = 0;
  // Se abre solo: al elegir el archivo (quien envía) o al llegar el primer fragmento (quien recibe). Nunca encima de otro
  // envío en curso, ni si la persona acaba de cerrarlo; si está abierto en uno ya terminado, pasa al nuevo.
  function abreSiToca(v, empieza) {
    if (!VJ() || v.voz || v.tam < MIN_VIAJE || ACTUAL !== v.conv) return;
    const act = VJ().actual;
    if (act === v) return;
    if (act) { if (empieza && (act.estado === 'entregado' || act.estado === 'fallo')) VJ().abre(v); return; }
    if (v.visto || Date.now() - viajeCerradoEn < 30000) return;
    VJ().abre(v);
  }
  // cada 2 s, mientras haya un envío en curso: latencia con el relé (ping) y, a la otra parte, la latencia propia y lo enviado
  function vigilaViajes() {
    if (relojViajes) return;
    relojViajes = setInterval(() => {
      const activos = [...VIAJES.values()].filter((v) => v.estado === 'viaje');
      if (!activos.length) { clearInterval(relojViajes); relojViajes = 0; return; }
      R.mide();
      const enviando = activos.filter((v) => v.rol === 'envia');
      for (const v of activos) {
        const c = CONVS.get(v.conv); if (!c) continue;
        if (v.rol === 'envia') { const a = c.archivos.get(v.id); if (a) { v.salidos = Math.max(v.confirmados || 0, a.enviados - (enviando.length === 1 ? R.atraso : 0)); v.enCamino = enviando.length === 1 ? Math.max(0, v.salidos - (v.confirmados || 0)) : 0; } }
        if (v.custodia === 'si') enviaControl(c, { tipo: 'viaje', id: v.id, lat: VJ() ? VJ().minima(v.latMia) : null, bytes: v.rol === 'envia' ? v.salidos || 0 : v.confirmados || 0 });
      }
    }, 2000);
  }
  function listoViaje(c, j) {
    const v = VIAJES.get(j.id); if (!v) return;
    v.custodia = v.voz ? 'voz' : j.v === 1 ? 'si' : 'no'; v.tListo = Date.now();
    v.paisSuyo = regionValida(j.region) || v.paisSuyo; const l = latValida(j.lat); if (l != null) v.latSuya.push(l);
    evento(v, T('El equipo del destinatario está listo: empieza el envío.'));
    if (v.custodia === 'no') evento(v, T('El otro equipo usa una versión anterior de Comunicaciones: el envío sigue, sin comprobante de entrega e integridad.'), 'info');
  }
  function acuseViaje(j, a) {
    const v = VIAJES.get(j.id); if (!v) return;
    const hasta = Math.min(a.trozos, Math.max(0, +j.hasta || 0));
    v.verificados = Math.max(v.verificados || 0, hasta); v.confirmados = hasta === a.trozos ? v.tam : Math.min(v.tam, v.verificados * TROZO);
    if (VJ()) VJ().muestra(v, v.confirmados);
    const l = latValida(j.lat); if (l != null) v.latSuya.push(l);
    hito(v, T('Confirmado por el equipo del destinatario'));
  }
  function finViaje(v, ok) {
    if (!v || v.estado === 'entregado' || v.estado === 'fallo') return;
    v.tFin = Date.now(); v.enCamino = 0;
    if (ok) { v.estado = 'entregado'; v.confirmados = v.tam; v.verificados = v.trozos; if (v.rol === 'envia') evento(v, T('El equipo del destinatario confirma la llegada completa') + ': ' + v.trozos.toLocaleString(LOC()) + ' ' + T('fragmentos autenticados') + '.', 'bien'); }
    else { v.estado = 'fallo'; evento(v, T('El otro equipo no ha podido completar el archivo.'), 'mal'); }
  }
  // Quien envía, al recibir «archivo-fin»: compara la huella, escribe el registro, lo firma y lo manda a firmar.
  async function entregaViaje(c, m, a, v, j) {
    v.tFin = Date.now(); v.enCamino = 0; v.confirmados = v.tam; v.verificados = m.archivo.trozos;
    const l = latValida(j.lat); if (l != null) v.latSuya.push(l);
    const suSha = String(j.sha256 || ''); v.coincide = suSha === a.sha256; v.estado = 'entregado';
    evento(v, T('El equipo del destinatario confirma la llegada completa') + ': ' + (+j.trozos || m.archivo.trozos).toLocaleString(LOC()) + ' ' + T('fragmentos autenticados') + '.', 'bien');
    if (!v.coincide) { evento(v, T('La huella SHA-256 no coincide: no se emite comprobante.'), 'mal'); c.incidencias = (c.incidencias || 0) + 1; await anotaSistema(c, 'La huella SHA-256 del archivo no coincide en los dos equipos: no se emite comprobante.'); pintaRadio(c); return; }
    evento(v, T('Huella SHA-256 idéntica en los dos equipos') + ': ' + VJ().agrupa(a.sha256, 16) + '…', 'bien');
    const dura = Math.max(0.001, (v.tFin - v.t0) / 1000), rel = v.rele || {}, emitido = new Date().toISOString();
    const suTipo = typeof j.tipoReal === 'string' && /^[A-Z0-9]{2,5}$/.test(j.tipoReal) ? j.tipoReal : null;
    const cro = [
      ['emisor', 'preparado', iso(v.tCreado)], ['emisor', 'anuncio', iso(v.tAnuncio)], ['emisor', 'aceptado', iso(v.tListo)],
      ['emisor', 'salida', v.salida || iso(v.t0)], ['emisor', 'ultimo', iso(v.tUltimo)], ['emisor', 'confirmado', iso(v.tFin)], ['emisor', 'firma', emitido],
      ['receptor', 'anuncio_recibido', typeof j.anuncio === 'string' ? j.anuncio.slice(0, 40) : null], ['receptor', 'primero', typeof j.primero === 'string' ? j.primero.slice(0, 40) : null], ['receptor', 'llegada', typeof j.llegada === 'string' ? j.llegada.slice(0, 40) : null],
    ].filter((x) => x[2]).map(([lado, que, t]) => ({ t, lado, que })).sort((p, q) => (p.t < q.t ? -1 : p.t > q.t ? 1 : 0));
    const B = esB(c);
    const mio = B ? { clave: C.b64u(c.idB.firmaPub), acuerdo: C.b64u(c.idB.acuerdoPub), clave_pq: C.b64u(c.idB.dsaPub), huella: C.hex(c.miHuellaB) } : { clave: C.b64u(YO.firmaPub), acuerdo: C.b64u(YO.acuerdoPub), huella: C.hex(YO.huella) };
    const suyo = B ? { clave: C.b64u(c.firmaPub), acuerdo: C.b64u(c.acuerdoPub), clave_pq: C.b64u(c.dsaPub), huella: C.hex(c.huella) } : { clave: C.b64u(c.firmaPub), acuerdo: C.b64u(c.acuerdoPub), huella: C.hex(c.huella) };
    const reg = {
      v: B ? 2 : 1, tipo: B ? 'entrega-integridad-blindada' : 'custodia-digital', id: m.id, emitido,
      modo: B ? 'blindada' : undefined, suite: B ? 'CNSA 2.0: ECDSA y ECDH P-384, ML-KEM-1024, ML-DSA-87, AES-256-GCM, SHA-384' : undefined,
      verificacion_mutua: B ? !!(c.verificada && c.suVerificada && j.mutua === true) : undefined,
      archivo: { nombre: m.archivo.nombre, bytes: m.archivo.tam, sha256: a.sha256, tipo_declarado: m.archivo.mime || null, tipo_real: v.tipoReal || null, fragmentos: m.archivo.trozos, tam_fragmento: TROZO },
      emisor: { ...mio, nombre: YO.nombre || '', region: MI_PAIS || '', verifico_al_otro: !!c.verificada, version: VERSION_APP },
      receptor: { ...suyo, nombre: String(j.nombre || '').slice(0, 40), region: regionValida(j.region), verifico_al_otro: j.verificada === true, version: typeof j.version === 'string' ? j.version.slice(0, 60) : null },
      sesion: { id: v.sid || null, pq: !!v.pq, establecida: iso(v.sesionDesde), blindada: B || undefined },
      transporte: {
        rele: rel.host || '', rele_ciudad: rel.prueba ? '' : rel.ciudad || '', rele_pais: rel.prueba ? '' : rel.cc || '', rele_region: R.region || '', conexion: /^wss:/.test(R.url || '') ? 'wss' : 'ws',
        salida: v.salida || iso(v.t0), llegada: typeof j.llegada === 'string' ? j.llegada.slice(0, 40) : null,
        duracion_s: Math.round(dura * 1000) / 1000, espera_s: v.tListo && v.tAnuncio ? Math.round(v.tListo - v.tAnuncio) / 1000 : null,
        velocidad_media_bps: Math.round(m.archivo.tam / dura), velocidad_maxima_bps: v.velMax ? Math.round(Math.max(v.velMax, m.archivo.tam / dura)) : Math.round(m.archivo.tam / dura),
        latencia_ms: { emisor: VJ().estad(v.latMia), receptor: estadValida(j.lat) },
        fragmentos_verificados: +j.trozos || m.archivo.trozos, fragmentos_rechazados: 0,
      },
      integridad: { sha256_emisor: a.sha256, sha256_receptor: suSha, coincide: true, tipo_receptor: suTipo },
      cronologia: cro,
      incidencias: v.incidencias.slice(0, 20),
    };
    const texto = VJ().canon(reg);
    const firma = B ? C.b64u(await C.B.firma(c.idB, VJ().aFirmarB(texto))) : C.b64u(await C.firma(YO, VJ().aFirmar(texto)));
    const firmapq = B ? C.b64u(C.B.firmaPQ(c.idBDsaSec, VJ().aFirmarB(texto), VJ().CTX_B)) : undefined;
    const comp = { formato: B ? VJ().FORMATO_B : VJ().FORMATO, registro: JSON.parse(texto), firmas: { emisor: firma } }; // en orden canónico: el mismo archivo en los dos equipos
    if (B) comp.firmas_pq = { emisor: firmapq };
    v.comprobante = comp; v.comprobanteValido = false;
    await guardaCustodia(c, m.id, comp, 'pendiente');
    enviaControl(c, { tipo: 'custodia', id: m.id, reg: texto, firma, firmapq });
    evento(v, T('Comprobante firmado por tu equipo: enviado al destinatario para su firma.'), 'info');
  }
  async function guardaCustodia(c, fid, comp, estado, motivo) {
    const id = 'cu-' + fid;
    let m = c.mensajes.find((x) => x.id === id);
    if (!m) { m = { id, conv: c.id, t: Date.now(), dir: 'sistema', estado, tipo: 'custodia', custodia: comp, texto: motivo || '' }; c.mensajes.push(m); }
    else { m.estado = estado; m.custodia = comp; if (motivo != null) m.texto = motivo; }
    await guardaMensaje(c, m); pintaMensaje(c, m, true);
    return m;
  }
  // Quien recibe: comprueba que el registro dice exactamente lo que ha medido su equipo y, solo entonces, lo firma.
  async function recibeCustodia(c, j) {
    if (!VJ()) return;
    if (!c.cargados) await cargaMensajes(c);
    const v = VIAJES.get(j.id), no = (por) => { enviaControl(c, { tipo: 'custodia-no', id: String(j.id || '').slice(0, 64), por }); if (v) evento(v, T('El comprobante del remitente no coincide con lo medido en tu equipo: no se firma.'), 'mal'); };
    const m = c.mensajes.find((x) => x.id === j.id && x.tipo === 'archivo' && x.dir === 'suya');
    if (!m || !m.archivo || !m.archivo.obs || typeof j.reg !== 'string' || j.reg.length > (esB(c) ? 24000 : 16000) || typeof j.firma !== 'string') return no('datos');
    const ya = c.mensajes.find((x) => x.id === 'cu-' + m.id);
    if (ya && ya.estado === 'firmado' && ya.custodia && ya.custodia.firmas && ya.custodia.firmas.receptor) { enviaControl(c, { tipo: 'custodia-firma', id: m.id, firma: ya.custodia.firmas.receptor, firmapq: ya.custodia.firmas_pq ? ya.custodia.firmas_pq.receptor : undefined }); return; } // ya firmado: la firma otra vez, por si no llegó
    const B = esB(c);
    if (B && (typeof j.firmapq !== 'string' || j.reg.length > 20000)) return no('firma');
    let reg; try { reg = JSON.parse(j.reg); } catch (_) { return no('formato'); }
    if (!reg || VJ().canon(reg) !== j.reg) return no('formato');
    if (B ? !((await C.B.verifica(c.firmaPub, C.deB64u(j.firma), VJ().aFirmarB(j.reg))) && C.B.verificaPQ(c.dsaPub, C.deB64u(j.firmapq), VJ().aFirmarB(j.reg), VJ().CTX_B)) : !(await C.verifica(c.firmaPub, C.deB64u(j.firma), VJ().aFirmar(j.reg)))) return no('firma');
    const o = m.archivo.obs, ar = reg.archivo || {}, e = reg.emisor || {}, r = reg.receptor || {}, se = reg.sesion || {}, t = reg.transporte || {}, ig = reg.integridad || {};
    const mios = (Array.isArray(reg.cronologia) ? reg.cronologia : []).filter((x) => x && x.lado === 'receptor');
    const esperados = [['anuncio_recibido', o.anuncio], ['primero', o.primero], ['llegada', o.llegada]].filter((x) => x[1]);
    const mioB = B ? { clave: C.b64u(c.idB.firmaPub), acuerdo: C.b64u(c.idB.acuerdoPub), huella: C.hex(c.miHuellaB), pq: C.b64u(c.idB.dsaPub) } : { clave: C.b64u(YO.firmaPub), acuerdo: C.b64u(YO.acuerdoPub), huella: C.hex(YO.huella) };
    const okModo = B ? reg.v === 2 && reg.tipo === 'entrega-integridad-blindada' && reg.modo === 'blindada' && r.clave_pq === mioB.pq && e.clave_pq === C.b64u(c.dsaPub) && reg.verificacion_mutua === (o.mutua === true) : reg.v === 1 && reg.tipo === 'custodia-digital';
    const ok = okModo && reg.id === m.id
      && limpiaNombre(ar.nombre) === m.archivo.nombre && ar.bytes === m.archivo.tam && ar.fragmentos === m.archivo.trozos && ar.tam_fragmento === TROZO && ar.sha256 === o.sha256 && (ar.tipo_declarado || '') === (m.archivo.mime || '')
      && ig.sha256_emisor === o.sha256 && ig.sha256_receptor === o.sha256 && ig.coincide === true && (ig.tipo_receptor || null) === (o.tipo || null)
      && r.clave === mioB.clave && r.acuerdo === mioB.acuerdo && r.huella === mioB.huella && r.region === o.region && r.verifico_al_otro === o.verificada && r.nombre === o.nombre && r.version === o.version
      && e.clave === C.b64u(c.firmaPub) && e.acuerdo === C.b64u(c.acuerdoPub) && e.huella === C.hex(c.huella)
      && se.pq === o.pq && (se.id || '') === (o.sid || '')
      && t.llegada === o.llegada && t.rele === o.rele && t.rele_region === o.rele_region && t.fragmentos_verificados === m.archivo.trozos && t.fragmentos_rechazados === 0
      && VJ().canon((t.latencia_ms || {}).receptor || null) === VJ().canon(o.lat || null)
      && mios.length === esperados.length && esperados.every(([que, hora]) => mios.some((x) => x.que === que && x.t === hora))
      && typeof t.salida === 'string' && Number.isFinite(t.duracion_s) && t.duracion_s > 0;
    if (!ok) return no('no coincide');
    if (v) evento(v, T('Comprobante recibido del remitente: coincide con lo medido en tu equipo.'));
    const firma = B ? C.b64u(await C.B.firma(c.idB, VJ().aFirmarB(j.reg))) : C.b64u(await C.firma(YO, VJ().aFirmar(j.reg)));
    const firmapq = B ? C.b64u(C.B.firmaPQ(c.idBDsaSec, VJ().aFirmarB(j.reg), VJ().CTX_B)) : undefined;
    const comp = { formato: B ? VJ().FORMATO_B : VJ().FORMATO, registro: reg, firmas: { emisor: j.firma, receptor: firma } };
    if (B) comp.firmas_pq = { emisor: j.firmapq, receptor: firmapq };
    enviaControl(c, { tipo: 'custodia-firma', id: m.id, firma, firmapq });
    await guardaCustodia(c, m.id, comp, 'firmado');
    if (v) { v.comprobante = comp; v.comprobanteValido = true; v.coincide = true; evento(v, T('Comprobante firmado por tu equipo: firmado por los dos equipos.'), 'bien'); }
    vigila(c, T('Comprobante de entrega e integridad firmado por los dos equipos') + ': ' + m.archivo.nombre, 'bien');
  }
  // Quien envía: la firma del destinatario, comprobada con su clave de identidad
  async function firmaCustodia(c, j) {
    if (!VJ()) return;
    if (!c.cargados) await cargaMensajes(c);
    const cm = c.mensajes.find((x) => x.id === 'cu-' + j.id && x.tipo === 'custodia'); if (!cm || !cm.custodia || typeof j.firma !== 'string') return;
    const comp = cm.custodia, v = VIAJES.get(j.id);
    if (comp.firmas && comp.firmas.receptor === j.firma) return;
    const B = comp.formato === VJ().FORMATO_B, tx = VJ().canon(comp.registro);
    const valida = B ? (typeof j.firmapq === 'string' && (await C.B.verifica(c.firmaPub, C.deB64u(j.firma), VJ().aFirmarB(tx))) && C.B.verificaPQ(c.dsaPub, C.deB64u(j.firmapq), VJ().aFirmarB(tx), VJ().CTX_B)) : await C.verifica(c.firmaPub, C.deB64u(j.firma), VJ().aFirmar(tx));
    if (!valida) { if (v) evento(v, T('La firma del destinatario no es válida: el comprobante sigue pendiente.'), 'mal'); return; }
    comp.firmas = Object.assign({}, comp.firmas, { receptor: j.firma });
    if (B) comp.firmas_pq = Object.assign({}, comp.firmas_pq, { receptor: j.firmapq });
    await guardaCustodia(c, j.id, comp, 'firmado', '');
    if (v) { v.comprobante = comp; v.comprobanteValido = true; evento(v, T('El destinatario ha firmado el comprobante: firmado por los dos equipos.'), 'bien'); }
    vigila(c, T('Comprobante de entrega e integridad firmado por los dos equipos') + ': ' + ((comp.registro && comp.registro.archivo && comp.registro.archivo.nombre) || ''), 'bien');
  }
  async function rechazoCustodia(c, j) {
    if (!c.cargados) await cargaMensajes(c);
    const cm = c.mensajes.find((x) => x.id === 'cu-' + j.id && x.tipo === 'custodia'); if (!cm || cm.estado === 'firmado') return;
    await guardaCustodia(c, j.id, cm.custodia, 'rechazado', 'Su equipo no ha podido comprobar el registro.');
    const v = VIAJES.get(j.id); if (v) evento(v, T('El destinatario no ha firmado el comprobante: su equipo no ha podido comprobar el registro.'), 'mal');
    const m = c.mensajes.find((x) => x.id === j.id && x.tipo === 'archivo'); if (m) await recibo(c, m, v && v.tFin && v.t0 ? (v.tFin - v.t0) / 1000 : 0, m.archivo.trozos, true);
  }
  // en cada sesión nueva, los comprobantes aún sin la firma del destinatario se le vuelven a mandar
  async function reenviaCustodias(c) {
    if (!VJ()) return;
    if (!c.cargados) await cargaMensajes(c);
    for (const x of c.mensajes) if (x.tipo === 'custodia' && x.estado === 'pendiente' && x.custodia && x.custodia.registro && x.custodia.firmas) enviaControl(c, { tipo: 'custodia', id: x.custodia.registro.id, reg: VJ().canon(x.custodia.registro), firma: x.custodia.firmas.emisor, firmapq: x.custodia.firmas_pq ? x.custodia.firmas_pq.emisor : undefined });
  }
  function tarjetaCustodia(m) {
    const comp = m.custodia || {}, reg = comp.registro || {}, ar = reg.archivo || {}, est = m.estado;
    const d = document.createElement('div'); d.className = 'custodia' + (est === 'pendiente' ? ' pendiente' : est === 'rechazado' ? ' mal' : '');
    const ico = document.createElement('span'); ico.className = 'cu-ico'; ico.innerHTML = VJ() ? (est === 'firmado' ? VJ().ESCUDO : VJ().AVISO) : '';
    const k = document.createElement('span'); k.className = 'cu-k'; k.textContent = est === 'firmado' ? T('Comprobante de entrega e integridad') : est === 'pendiente' ? T('Comprobante pendiente de firma') : T('Comprobante no emitido');
    const t = document.createElement('span'); t.className = 'cu-t'; t.setAttribute('translate', 'no'); t.textContent = (ar.nombre || '') + ' · ' + tamano(ar.bytes || 0);
    const s = document.createElement('span'); s.className = 'cu-s';
    s.textContent = est === 'firmado' ? T('Firmado por los dos equipos') + ' · SHA-256 ' + (VJ() ? VJ().agrupa(ar.sha256, 16) : '') + '…' : est === 'pendiente' ? T('Firmado por tu equipo; falta la firma del destinatario.') : T('El destinatario no lo ha firmado: su equipo no ha podido comprobar el registro.');
    d.append(ico, k, t, s);
    if (reg.archivo && VJ()) {
      const fila = document.createElement('div'); fila.className = 'fila';
      const ver = document.createElement('button'); ver.type = 'button'; ver.className = 'boton'; ver.textContent = T('Ver comprobante'); ver.addEventListener('click', () => VJ().muestraComprobante(comp));
      const baja = document.createElement('button'); baja.type = 'button'; baja.className = 'boton'; baja.textContent = T('Descargar PDF'); baja.addEventListener('click', () => VJ().imprime(comp));
      fila.append(ver); if (est === 'firmado') fila.append(baja); d.append(fila);
    }
    return d;
  }
  const RUTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="6" r="2.2"/><path d="M7 17c5-1 3-8 8-9.5" stroke-dasharray="2.4 2.6"/></svg>';
  async function abreArchivo(m, guardar) {
    const r = await BD.saca('arch', m.id); if (!r) return aviso(m.archivo.enDisco ? T('Ese archivo se guardó directamente en tu disco, en la carpeta que elegiste.') : T('Este archivo ya no está en este navegador.'));
    const u = URL.createObjectURL(r.blob);
    const a = document.createElement('a'); a.href = u; if (guardar) a.download = r.nombre; else { a.target = '_blank'; a.rel = 'noopener'; }
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
  }

  // ---------- llamadas ----------
  const mmss = (ms) => { const x = Math.round(ms / 1000); return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };
  async function anotaLlamada(info) {
    const c = CONVS.get(ACTUAL); if (!c || !info) return;
    const texto = info.por === 'fin' ? T('Llamada de voz') + ' · ' + mmss(info.duracion) + (info.voz ? ' · ' + T('con cambio de voz') : '') : info.por === 'ocupado' ? T('Comunicando') : info.por === 'fallo' ? T('Llamada interrumpida') : info.por === 'sin-medios' ? T('Llamada sin micrófono') : T('Llamada no contestada');
    const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'sistema', estado: 'ok', tipo: 'llamada', texto, llamada: { por: info.por, duracion: info.duracion || 0 } };
    await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m);
  }
  const puedeLlamar = () => { const c = CONVS.get(ACTUAL); return !!(c && enLinea(c) && c.sesion && c.sesion.confirmada && puedeEnviar(c)); };
  function arrancaLlamadas() {
    if (!window.GuardianaLlamada || !window.RTCPeerConnection) { const b = $('#llamar'); if (b) b.hidden = true; return; }
    LL = GuardianaLlamada.crea({
      ice: () => R.ice, puede: puedeLlamar, t: T, aviso, suena: avisaSonido, fin: anotaLlamada,
      manda: (m) => { const c = CONVS.get(ACTUAL); if (c) enviaControl(c, Object.assign({ tipo: 'llamada' }, m)); },
      nombre: () => { const c = CONVS.get(ACTUAL); return (c && c.nombre) || T('La otra persona'); },
      inicial: () => { const c = CONVS.get(ACTUAL); return inicial(c && c.nombre); },
    });
    $('#llamar').addEventListener('click', () => LL.llamar());
  }

  // ---------- destruir ----------
  async function destruyeLocal(c, porElla, silencio) {
    if (c.estado === 'destruida') return;
    c.estado = 'destruida';
    if (LL && LL.ocupado && ACTUAL === c.id) LL.colgar();
    if (esB(c)) borraClavesB(c);
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
    R.on('sala', (sala, miembros) => { const c = CONVS.get(sala); if (!c) return; c.miembros = new Set(miembros); c.sesion = null; if (miembros.length && (!c.suId || miembros.includes(c.suId))) enCola(c, () => presentaX(c, null, true)); pintaCabecera(c); pintaLista(); });
    R.on('llega', (sala, quien) => { const c = CONVS.get(sala); if (!c) return; c.miembros.add(quien); if (!c.suId || c.suId === quien) { c.sesion = null; enCola(c, () => presentaX(c, null, true)); } pintaCabecera(c); pintaLista(); });
    R.on('sale', (sala, quien) => { const c = CONVS.get(sala); if (!c) return; c.miembros.delete(quien); if (c.suId === quien) { c.sesion = null; vigila(c, T('La otra persona se ha desconectado.'), 'info'); if (LL && LL.ocupado && ACTUAL === c.id) LL.recibe({ acto: 'colgar' }); } pintaCabecera(c); pintaLista(); });
    R.on('sustituido', (sala) => { const c = CONVS.get(sala); if (c) { c.miembros.clear(); c.sesion = null; } aviso(T('Esta conversación se ha abierto en otra pestaña: sigue allí.')); });
    // Las tramas de una conversación se procesan en orden (una detrás de otra): así un trozo de archivo nunca
    // adelanta al anuncio del archivo, ni un mensaje a la presentación que abre su sesión.
    R.on('trama', (sala, de, b) => {
      const c = CONVS.get(sala); if (!c || !b.length) return;
      c.proc = (c.proc || Promise.resolve()).then(async () => {
        try {
          if (b[0] === 1) await (esB(c) ? recibePresentacionB(c, de, b) : recibePresentacion(c, de, b));
          else if (b[0] === 2) await recibeMensaje(c, de, b);
          else if (b[0] === 3) await recibeTrozo(c, de, b);
          else if (b[0] === 4) { if (c.suId === de) await presentaX(c, null); }
          else if (b[0] === 5) { if (!c.huella) { c.ocupada = true; pintaCabecera(c); $('#invita-estado').textContent = T('Esta invitación ya la usó otra persona.'); } }
        } catch (e) { console.warn('trama', e); }
      });
    });
    R.on('aviso', (m) => { /* incidencias: códigos (el comprobante los dice en el idioma de quien lo lee) */
      if (m.t === 'lento') aviso(T('El relé está limitando la velocidad: el envío sigue más despacio.'));
      if (m.t === 'lento' || m.t === 'atasco') for (const v of VIAJES.values()) if (v.estado === 'viaje' && !v['inc_' + m.t]) { v['inc_' + m.t] = true; const que = m.t === 'lento' ? 'El relé limitó la velocidad del envío.' : 'El relé retuvo fragmentos por saturación del destinatario.'; v.incidencias.push({ t: new Date().toISOString(), que: m.t === 'lento' ? 'rele_lento' : 'rele_atasco', lado: v.rol === 'envia' ? 'emisor' : 'receptor' }); evento(v, T(que), 'info'); }
    });
    R.on('pong', (ms) => { if (!Number.isFinite(ms)) return; for (const v of VIAJES.values()) if (v.estado === 'viaje' || v.estado === 'espera') { v.latMia.push(ms); if (v.latMia.length > 1000) v.latMia.shift(); } });
    // sin relé, un envío en curso no sigue (no hay reanudación): queda como no completado en los dos lados
    R.on('cerrado', () => { for (const v of VIAJES.values()) if (v.estado === 'viaje') { v.estado = 'fallo'; v.tFin = Date.now(); v.enCamino = 0; evento(v, T('Se perdió la conexión con el relé: el envío no se ha completado.'), 'mal'); } });
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
    if (inv) { $('#paso-inicio').hidden = true; $('#paso-entrar').hidden = true; $('#paso-codigo').hidden = esB(c); $('#paso-enlace').hidden = !esB(c); }
    pintaCabecera(c); pintaTodos(c); pintaRadio(c); pintaLista();
    if (c.estado === 'invitacion' && c.rol === 'invita') { if (esB(c)) muestraEnlace(c); else { muestraInvitacion(c); if (!c.huella && (!c.codigo || Date.now() > c.codigoCaduca)) publicaCodigo(c); } }
    $('#conv').classList.toggle('blindada', esB(c));
    marcaLeidos(c);
    if (matchMedia('(min-width: 761px)').matches) $('#texto').focus();
  }
  function cierraConv() { ACTUAL = null; if (window.pintaBarra) pintaBarra(); $('#conv').hidden = true; $('#inicio').hidden = false; $('#app').classList.remove('en-conv'); $('#paso-inicio').hidden = false; $('#paso-codigo').hidden = true; $('#paso-entrar').hidden = true; $('#paso-enlace').hidden = true; }
  function pintaCabecera(c) {
    if (window.pintaBarra) pintaBarra();
    if (ACTUAL !== c.id) return;
    $('#cnombre').textContent = esB(c) ? T('Sesión blindada') : T('Conversación cifrada');
    const conf = $('#cconfianza'); conf.classList.remove('gc-sin-verificar');
    let txt;
    if (c.ocupada && !c.huella) txt = T('Esta invitación ya la usó otra persona.');
    else if (!c.huella) txt = c.miembros.size ? T('Estableciendo el cifrado…') : T('Esperando a que la otra persona escriba el código…');
    else if (!R.abierto) txt = T('Sin conexión con el relé');
    else if (!c.miembros.has(c.suId)) txt = T('No está conectada ahora: lo que escribas saldrá cuando entre');
    else if (!c.sesion || !c.sesion.confirmada) txt = T('Estableciendo el cifrado…');
    else if (esB(c)) txt = T('Algoritmos CNSA 2.0') + ' · ' + T('postcuántica') + ' · ' + (c.verificada && c.suVerificada ? T('verificada por los dos') : T('pendiente de la verificación mutua'));
    else txt = T('Cifrada de extremo a extremo') + ' · ' + (c.sesion.pq ? T('postcuántica') + ' · ' : T('sin protección postcuántica') + ' · ') + (c.verificada ? T('verificada') : T('sin verificar'));
    const pqa = $('#cpq');
    if (pqa) {
      pqa.hidden = !c.clasicaPendiente;
      const sp = pqa.querySelector('span');
      if (sp && c.clasicaPendiente) sp.textContent = c.pqVisto ? T('La otra persona no ha usado la protección postcuántica. Esta conversación ya la tenía, así que la he parado.') : T('La otra persona usa una versión sin protección postcuántica. No sigo sin tu permiso.');
    }
    if (c.huella && !(c.verificada && (!esB(c) || c.suVerificada))) conf.classList.add('gc-sin-verificar');
    conf.textContent = txt;
    pintaPuerta(c);
    const ll = $('#llamar'); if (ll) { const si = puedeLlamar() && (R.llamadas || LOCAL); ll.classList.toggle('apagado', !si); ll.title = si ? T('Llamada de voz') : esB(c) && !(c.verificada && c.suVerificada) ? T('Las llamadas se abren cuando los dos hayáis comprobado el número de seguridad.') : !R.llamadas && !LOCAL ? T('El servicio de llamadas no está disponible ahora mismo.') : T('La otra persona tiene que estar conectada.'); }
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
    const verOk = esB(c) ? !!(c.verificada && c.suVerificada) : !!c.verificada;
    fila(verOk ? 'gc-ok' : 'gc-aviso', T('Identidad'), verOk ? T('Verificada por las dos personas.') : esB(c) ? T('Pendiente de la verificación mutua: no sale nada hasta que los dos comprobéis el número.') : T('Sin verificar: comparad el número de seguridad (escudo).'));
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
    if (m.tipo === 'custodia') { li.className = 'gc-centro'; li.append(tarjetaCustodia(m)); if (!sinScroll && abajo) ul.scrollTop = ul.scrollHeight; return; }
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
    if (VIAJES.has(m.id) && VJ()) { const b = document.createElement('button'); b.type = 'button'; b.className = 'boton vj-ver'; b.innerHTML = RUTA; b.append(document.createTextNode(T('Ver el viaje'))); b.addEventListener('click', () => { const v = VIAJES.get(m.id); if (v) VJ().abre(v); }); fila.append(b); }
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
    if (esB(c)) {
      fila(c.sesion ? 'gc-ok' : 'gc-info', T('Sesión blindada'), T('Algoritmos de la suite CNSA 2.0: ML-KEM-1024 y ECDH P-384 para las claves, ML-DSA-87 y ECDSA P-384 para las firmas, AES-256-GCM y SHA-384.'));
      fila('gc-ok', T('Renovación de claves'), T('Claves nuevas cada 5 minutos y en cada reconexión: lo anterior deja de poder leerse con lo nuevo.'));
      fila(c.verificada && c.suVerificada ? 'gc-ok' : 'gc-aviso', T('Verificación mutua'), c.verificada && c.suVerificada ? T('Los dos habéis comprobado el número de seguridad.') : T('Hasta que los dos comprobéis el número de seguridad, no se envía nada.'));
    } else fila(c.sesion ? 'gc-ok' : 'gc-info', T('Cifrado de extremo a extremo'), T('AES-256-GCM con una clave distinta por mensaje; la sesión se renueva cada vez que os encontráis (ECDH P-256 con firma ECDSA).'));
    fila('gc-info', T('Servidor de GUARDIANA'), T('encamina tramas cifradas que no puede descifrar; ve conexión y volumen, no contenido; no guarda historial'));
    fila(c.incidencias ? 'gc-alerta' : 'gc-ok', T('Verificación'), c.incidencias ? (c.incidencias + ' ' + (c.incidencias === 1 ? T('incidencia') : T('incidencias')) + ': ' + T('datos que no superaron la autenticación, descartados y anotados en la conversación.')) : T('Cada mensaje y cada trozo de archivo se autentica al llegar; hasta ahora, todos superaron la verificación.'));
    fila(c.verificada ? 'gc-ok' : 'gc-aviso', c.verificada ? T('Identidad verificada') : T('Identidad sin verificar'), c.verificada ? T('Comprobasteis el número de seguridad.') : T('Hasta que comprobéis el número, confías en que el enlace llegó a la persona correcta.'));
    fila('gc-aviso', T('Límites'), T('No es anonimato: el relé ve tu dirección IP, la sala y el volumen de tráfico, no el contenido.') + ' ' + T('Tu identidad vive en este navegador: se pierde si borras los datos del sitio o cambias de equipo.') + ' ' + T('Los archivos recibidos quedan en este navegador sin nuestro cifrado; «Destruir» no alcanza lo ya guardado en un disco.') + ' ' + T('Ningún cifrado protege un equipo o navegador comprometido.') + ' ' + T('El viaje de cada archivo y su comprobante muestran a la otra persona el país de tu equipo, estimado por la zona horaria del navegador; nunca la zona horaria ni la dirección IP.'));
    $('#numero').textContent = c.huella ? await numeroDe(c) : T('Aparecerá cuando la otra persona entre.');
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
    if (pqSi) pqSi.addEventListener('click', () => {
      const c = CONVS.get(ACTUAL); if (!c || !c.clasicaPendiente) return; const p = c.clasicaPendiente;
      // en una conversación que nunca tuvo la capa postcuántica, el permiso queda para esa conversación
      if (!c.pqVisto) { c.clasicaAceptada = true; guardaConv(c); vigila(c, T('Has aceptado seguir sin protección postcuántica en esta conversación.'), 'info'); }
      else vigila(c, T('Has aceptado seguir sin protección postcuántica en esta sesión.'), 'info');
      enCola(c, () => derivaSesion(c, p.suEf, p.efMia, null, true));
    });
    // dueño, 10:53: «todas las páginas tienen que tener un botón de volver a donde estás»: a NÚCLEO si se vino desde NÚCLEO,
    // si no, al inicio (la portada)
    try { const v = sessionStorage.getItem('guardiana-vuelta') === 'nucleo', a = $('#volver'); if (a) { a.href = v ? '/orbita/?nucleo=pide' : '/orbita/'; const sp = a.querySelector('span'); if (sp) sp.textContent = v ? 'Regresar a NÚCLEO' : 'Inicio'; a.setAttribute('aria-label', v ? 'Regresar a NÚCLEO' : 'Volver al inicio'); } } catch (_) {}
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
    $('#terminar').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (!c) return; if (esB(c)) return muestraCierre(c); const hay = c.mensajes.some((x) => x.tipo === 'custodia'); if (!confirm(hay ? T('¿Terminar la conversación? Se borra aquí y en el otro equipo, también los comprobantes de entrega e integridad: descarga antes los que quieras conservar.') : T('¿Terminar la conversación? Se borra aquí y en el otro equipo.'))) return; await destruye(c); });
    $('#invita-nuevo').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (c) { c.codigoUsado = false; await publicaCodigo(c); } });
    R.on('codigo-usado', (codigo) => { for (const c of CONVS.values()) if (c.codigo === codigo) { c.codigoUsado = true; pintaCodigo(c); } });
    R.on('abierto', () => { for (const c of CONVS.values()) if (c.estado === 'invitacion' && c.rol === 'invita' && !c.huella && (!c.codigo || Date.now() > c.codigoCaduca)) publicaCodigo(c); });
    $('#escudo').addEventListener('click', () => { const c = CONVS.get(ACTUAL); if (c) muestraEscudo(c); });
    $('#escudo-cerrar').addEventListener('click', () => cierraHoja('h-escudo'));
    $('#verificada').addEventListener('change', async (e) => { const c = CONVS.get(ACTUAL); if (!c) return; await marcaVerificada(c, e.target.checked); muestraEscudo(c); });
    $('#destruir').addEventListener('click', async (e) => { const c = CONVS.get(ACTUAL); if (!c) return; if ($('#destruir-nota').hidden) { $('#destruir-nota').hidden = false; e.currentTarget.textContent = T('Sí, destruir'); return; } cierraHoja('h-escudo'); e.currentTarget.textContent = T('Destruir conversación'); await destruye(c); });
    const ta = $('#texto');
    const ajusta = () => { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; document.querySelector('.gc-compositor').classList.toggle('con-texto', !!ta.value.trim()); };
    ta.addEventListener('input', ajusta);
    const envia = async () => { const c = CONVS.get(ACTUAL); const t = ta.value.replace(/\s+$/, ''); if (!c || !t) return; ta.value = ''; ajusta(); ta.dispatchEvent(new Event('input')); await enviaTexto(c, t); ta.focus(); };
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); envia(); } });
    $('#enviar').addEventListener('click', envia);
    $('#adjuntar').addEventListener('click', () => $('#archivo').click());
    // Modo discreto: un interruptor (recordado en este equipo) que activa el velo del chat y los números al escribir.
    // 28 Oct 2026 (dueño): de entrada, el modo normal; el discreto solo si la persona lo elige. Clave nueva, para que nadie
    // se quede en discreto por el valor que la versión anterior guardaba sola al abrir la página.
    const conv = $('#conv'), mascara = $('#texto-mascara');
    let discreto = false; try { discreto = localStorage.getItem('gcom-discreto2') === '1'; localStorage.removeItem('gcom-discreto'); } catch (_) {}
    let cifras = [];
    const pintaMascara = () => {
      if (!discreto) { mascara.textContent = ''; return; }
      const v = ta.value; const n = [...v].length;
      if (cifras.length > n) cifras.length = n;
      while (cifras.length < n) { const b = C.azar(1)[0]; cifras.push(String(b % 10)); }
      let i = 0; mascara.textContent = [...v].map((ch) => { const d = cifras[i++]; return ch === '\n' || ch === ' ' ? ch : d; }).join('') + (v.endsWith('\n') ? ' ' : '');
      mascara.scrollTop = ta.scrollTop;
    };
    const ponDiscreto = (on, elegido) => {
      discreto = !!on; if (elegido) { try { localStorage.setItem('gcom-discreto2', discreto ? '1' : '0'); } catch (_) {} }
      conv.classList.toggle('discreta', discreto); $('#discreto').setAttribute('aria-pressed', String(discreto));
      ta.placeholder = discreto ? T('Modo discreto: lo que escribas se verá como números') : T('Escribe un mensaje');
      lienzo.classList.toggle('velado', discreto); pintaMascara();
    };
    $('#discreto').addEventListener('click', () => ponDiscreto(!discreto, true));
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
      rec.onstop = () => { const g = este; if (!g.enviar || !trozos.length) return; const tipo = rec.mimeType || mime || 'audio/webm'; const ext = /mp4/.test(tipo) ? 'm4a' : /ogg/.test(tipo) ? 'ogg' : 'webm'; const dur = Math.round((Date.now() - t0) / 1000); const f = new File(trozos, T('Nota de voz') + ' ' + new Date().toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' (' + Math.floor(dur / 60) + ':' + String(dur % 60).padStart(2, '0') + ').' + ext, { type: tipo }); const cc = CONVS.get(ACTUAL) || c; if (cc) enviaArchivos(cc, [f], { voz: true }); };
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
    addEventListener('hashchange', () => { if (/#[ib]=/.test(location.hash)) { aceptaInvitacion(location.href); history.replaceState(null, '', location.pathname + location.search); } });
    addEventListener('guardiana-idioma', () => { pintaLista(); const c = CONVS.get(ACTUAL); if (c) pintaCabecera(c); });
    // sesión blindada
    $('#nueva-blindada').addEventListener('click', creaInvitacionB);
    $('#enlace-copiar').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (!c || !esB(c)) return; try { await navigator.clipboard.writeText(enlaceB(c)); aviso(T('Enlace copiado: envíalo por un canal de confianza.')); } catch (_) { $('#enlace-b').select(); } });
    const comparte = $('#enlace-compartir'); comparte.hidden = !navigator.share;
    comparte.addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (!c || !esB(c)) return; try { await navigator.share({ title: 'GUARDIANA', text: T('Invitación a una sesión blindada de GUARDIANA Comunicaciones'), url: enlaceB(c) }); } catch (_) {} });
    $('#enlace-cancelar').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (c) await destruye(c, true); });
    $('#bl-coincide').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (c) await marcaVerificada(c, !c.verificada); });
    $('#cierre-si').addEventListener('click', async () => { cierraHoja('h-cierre'); const c = CONVS.get(ACTUAL); if (c) await destruye(c); });
    $('#cierre-no').addEventListener('click', () => cierraHoja('h-cierre'));
    // un enlace blindado pegado en el campo del código también vale
    campoCod.addEventListener('paste', async (e) => { const t = (e.clipboardData && e.clipboardData.getData('text')) || ''; if (!/#[ib]=[A-Za-z0-9_-]{43}/.test(t)) return; e.preventDefault(); const ok = await aceptaInvitacion(t); if (ok) $('#paso-entrar').hidden = true; else { $('#unir-mal').textContent = T('Ese enlace no es una invitación de GUARDIANA.'); $('#unir-mal').hidden = false; } });
    // renovación de claves de la blindada: cada 5 minutos, quien inicia se presenta otra vez (efímeras y ML-KEM nuevos)
    setInterval(() => { for (const c of CONVS.values()) { if (!esB(c) || c.renovando || !c.sesion || !c.sesion.confirmada || !enLinea(c) || !soyInicio(c) || Date.now() - c.sesion.desde < renuevaMs()) continue; c.renovando = true; enCola(c, () => presentaB(c, null, true)).finally(() => setTimeout(() => { c.renovando = false; }, 20000)); } }, 15000);
  }

  // ---------- arranque ----------
  async function arranca() {
    if (!window.isSecureContext || !crypto.subtle || !window.indexedDB) { $('#inicio').innerHTML = '<p>' + T('Este navegador no puede abrir Comunicaciones: hace falta una conexión segura (https) y un navegador actual.') + '</p>'; return; }
    await BD.abre();
    await cargaIdentidad();
    arrancaRele();
    eventos();
    arrancaLlamadas();
    await cargaConvs();
    if (/#[ib]=/.test(location.hash)) { const ok = await aceptaInvitacion(location.href); history.replaceState(null, '', location.pathname + location.search); if (!ok) aviso(T('Ese enlace no es una invitación de GUARDIANA.')); }
    // NÚCLEO guiado (ronda 63): «Tengo un código» llega con el campo del código abierto; «Crear una invitación», con la invitación
    // hecha en cuanto hay conexión (si ya hay una conversación en marcha, no se toca: solo se señala el botón). Una sola vez.
    try {
      const paso = new URLSearchParams(location.search).get('paso');
      if (paso === 'codigo' || paso === 'crear') {
        history.replaceState(history.state, '', location.pathname + location.hash);
        if (paso === 'codigo') $('#unir').click();
        else if ([...CONVS.values()].some((c) => c.estado === 'activa')) $('#nueva').focus();
        else { let n = 0; const espera = () => { if (R.abierto) $('#nueva').click(); else if (++n < 40) setTimeout(espera, 250); else $('#nueva').focus(); }; espera(); }
      }
    } catch (_) {}
  }
  if (window.GuardianaViaje) GuardianaViaje.alCerrar = () => { viajeCerradoEn = Date.now(); };
  arranca().catch((e) => { console.error(e); aviso(T('Algo falló al arrancar: recarga la página.')); });
  window.GuardianaCom = { get convs() { return CONVS; }, get yo() { return YO; }, get rele() { return R; }, get viajes() { return VIAJES; }, get llamada() { return LL; }, abreConv, creaInvitacion, aceptaInvitacion };
})();
