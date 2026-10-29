// GUARDIANA · Comunicaciones · cliente del relé (26 Oct 2026).
// Se conecta al relé de GUARDIANA (el principal: ver «elige»), mantiene la conexión viva (ping cada 10 s, reconexión
// con espera creciente), vuelve a entrar en las salas tras una caída y pasa tramas binarias ya selladas.
// El relé solo ve la sala y los bytes; nunca una clave ni un nombre.
'use strict';
(function (raiz) {
  const MOTORES = ['wss://motor.guardianagroup.com', 'wss://motor-am.guardianagroup.com'];
  const q = new URLSearchParams(location.search);
  const LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  // Instalación propia (dueño, 27 Oct 2026, 23:21: «mejora este modelo», Threema OnPrem): si la página no la sirve
  // guardianagroup.com, el relé es el mismo servidor que la sirve. Nada pasa por GUARDIANA.
  const PROPIO = !LOCAL && !/(^|\.)guardianagroup\.com$/.test(location.hostname);

  function crea(o) {
    o = o || {};
    const esc = {}; const on = (t, f) => { (esc[t] = esc[t] || []).push(f); };
    const emite = (t, ...a) => { for (const f of esc[t] || []) { try { f(...a); } catch (e) { console.error(e); } } };
    let ws = null, url = null, abierto = false, intentos = 0, ping = null, cerrando = false;
    const salas = new Map(); // sala → { yo, b } (b: sala de una sesión blindada)
    let ice = [], caduca = 0, region = '', llamadas = false, ultimoPong = 0, pingEn = 0, latencia = null, avisos = ''; const hist = [];
    const esperas = {}; // respuestas pendientes (invita, busca)
    // la app en segundo plano (presencia): si la página nace oculta (el teléfono la abre en segundo plano), ya cuenta como fuera
    let fueraAhora = typeof document !== 'undefined' && document.visibilityState !== 'visible';
    let subUlt = null, salasUlt = []; // la última suscripción de avisos, para reenviarla nada más abrir (si no, el relé no sabe
    // todavía que esta conexión es la de este teléfono y un aviso suyo podría volver a él mismo)

    // 27 Oct 2026, 21:25: las dos personas de una conversación tienen que estar en el mismo relé (los relés no se enlazan
    // entre sí: la sala y el código de invitación viven en uno solo). Con el relé de Miami ya en marcha, elegir «el más
    // cercano» separaría a una persona de América de otra de Europa. Mientras los relés no se enlacen, Comunicaciones usa
    // siempre el principal (Núremberg); el de Miami sirve a ZERO.
    async function elige() {
      if (q.get('rele')) return q.get('rele');
      if (LOCAL) return 'ws://127.0.0.1:8794';
      if (PROPIO) return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;
      return MOTORES[0];
    }

    async function conecta() {
      if (cerrando) return;
      if (!url) url = await elige();
      try { ws = new WebSocket(url.replace(/\/$/, '') + '/com'); } catch (_) { return reintenta(); }
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        abierto = true; intentos = 0;
        ws.send(JSON.stringify({ t: 'hola' }));
        for (const [sala, x] of salas) ws.send(JSON.stringify({ t: 'entra', sala, yo: x.yo, b: x.b || undefined }));
        if (subUlt) { try { ws.send(JSON.stringify({ t: 'avisos', sub: subUlt, salas: salasUlt })); } catch (_) {} }
        if (fueraAhora) { try { ws.send(JSON.stringify({ t: 'presencia', fuera: 1 })); } catch (_) {} }
        clearInterval(ping); pingEn = 0; ping = setInterval(mide, 10000); setTimeout(mide, 300);
        emite('abierto', { url });
      };
      ws.onmessage = (e) => {
        if (typeof e.data === 'string') {
          let m; try { m = JSON.parse(e.data); } catch (_) { return; }
          switch (m.t) {
            case 'hola': region = m.region || ''; llamadas = !!m.llamadas; ice = m.ice || []; caduca = m.caduca || 0; avisos = typeof m.avisos === 'string' ? m.avisos : ''; emite('hola', { region, llamadas, ice, avisos }); break;
            case 'ice': ice = m.ice || []; caduca = m.caduca || 0; emite('ice', ice); break;
            case 'sala': emite('sala', m.sala, m.miembros || []); break;
            case 'llega': emite('llega', m.sala, m.quien); break;
            case 'sale': emite('sale', m.sala, m.quien); break;
            case 'fuera': break;
            case 'pong': ultimoPong = Date.now(); if (pingEn) { latencia = Date.now() - pingEn; hist.push(latencia); if (hist.length > 6) hist.shift(); } pingEn = 0; emite('pong', latencia); break;
            case 'sustituido': salas.delete(m.sala); emite('sustituido', m.sala); break;
            case 'ausente': case 'atasco': case 'lento': emite('aviso', m); break;
            case 'error': emite('error', m); break;
            case 'invita': { const f = esperas.invita; delete esperas.invita; if (f) f(m); break; }
            case 'busca': { const f = esperas.busca; delete esperas.busca; if (f) f(m); break; }
            case 'codigo-usado': emite('codigo-usado', m.codigo); break;
            // avisos fuera de la app (29 Oct 2026)
            case 'avisos': emite('avisos', m); break;
            case 'despierta': emite('despierta', m); break;
            case 'presencia': emite('presencia', m); break;
            default: break;
          }
          return;
        }
        const b = new Uint8Array(e.data);
        if (b.length < 41 || b[0] !== 2) return;
        const sala = hex(b.subarray(1, 33)), de = hex(b.subarray(33, 41));
        emite('trama', sala, de, b.subarray(41));
      };
      ws.onclose = () => { const estaba = abierto; abierto = false; clearInterval(ping); ws = null; if (estaba) emite('cerrado'); reintenta(); };
      ws.onerror = () => {};
    }
    function reintenta() {
      if (cerrando) return;
      intentos++;
      const espera = Math.min(20000, 800 * Math.pow(1.7, Math.min(intentos, 8))) + Math.random() * 400;
      setTimeout(() => { if (!ws) { if (intentos % 4 === 0) url = null; conecta(); } }, espera);
    }
    // Al volver a la página (el iPhone duerme la pestaña al compartir por WhatsApp), conexión enseguida y no a la espera
    // creciente; si parece abierta pero no contesta a un ping en 3 s, se cierra y se abre otra (dueño, 28 Oct 2026, 15:33: «me
    // tiene que entrar automático en cuanto mi amigo acepta»).
    function despierta() {
      if (cerrando) return;
      if (!ws) { intentos = 0; conecta(); return; }
      if (!abierto) return;
      const antes = ultimoPong; try { pingEn = Date.now(); ws.send(JSON.stringify({ t: 'ping' })); } catch (_) {}
      setTimeout(() => { if (ws && abierto && ultimoPong === antes) { intentos = 0; try { ws.close(); } catch (_) {} } }, 3000);
    }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') despierta(); });
    if (typeof addEventListener === 'function') { addEventListener('pageshow', despierta); addEventListener('online', despierta); addEventListener('focus', despierta); }
    const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    const deHex = (s) => Uint8Array.from(String(s).match(/../g) || [], (h) => parseInt(h, 16));

    // Un ping al relé (cada 10 s, y cada 2 s mientras hay un envío: el viaje del archivo enseña la latencia medida).
    // Nunca dos a la vez: el «pong» no lleva número, así que uno nuevo espera a la respuesta del anterior (o a 4 s).
    function mide() {
      if (!abierto || !ws || (pingEn && Date.now() - pingEn < 4000)) return false;
      try { pingEn = Date.now(); ws.send(JSON.stringify({ t: 'ping' })); return true; } catch (_) { return false; }
    }
    function entra(sala, yo, opc) { const b = opc && opc.b ? 1 : 0; salas.set(sala, { yo, b }); if (abierto) ws.send(JSON.stringify({ t: 'entra', sala, yo, b: b || undefined })); }
    function sale(sala) { salas.delete(sala); if (abierto) ws.send(JSON.stringify({ t: 'sale', sala })); }
    // avisa: esta trama es un mensaje o un archivo y merece aviso en el teléfono de la otra persona si la tiene cerrada (0x11).
    // Las demás (acuses, «leído», «escribiendo…», presentaciones, señalización de llamada) van como siempre (0x01) y no avisan.
    function manda(sala, para, carga, avisa) {
      if (!abierto) return false;
      const c = carga instanceof Uint8Array ? carga : new Uint8Array(carga);
      const b = new Uint8Array(41 + c.length);
      b[0] = avisa ? 0x11 : 1; b.set(deHex(sala), 1); if (para) b.set(deHex(para), 33); b.set(c, 41);
      try { ws.send(b); return true; } catch (_) { return false; }
    }
    function pideIce() { if (abierto) ws.send(JSON.stringify({ t: 'ice' })); }
    const pregunta = (t, m) => new Promise((res) => { if (!abierto) return res({ ok: false, por: 'sin relé' }); esperas[t] = res; ws.send(JSON.stringify(Object.assign({ t }, m))); setTimeout(() => { if (esperas[t] === res) { delete esperas[t]; res({ ok: false, por: 'sin respuesta' }); } }, 8000); });
    const invita = (codigo, sobre, sal) => pregunta('invita', { codigo, sobre, sal });
    const busca = (codigo) => pregunta('busca', { codigo });
    const retira = (codigo) => { if (abierto) ws.send(JSON.stringify({ t: 'retira', codigo })); };
    // la suscripción del navegador (endpoint y claves públicas) con las salas en las que avisar; quitar=1 la borra del relé
    const suscribe = (sub, salas, quitar) => {
      if (!sub) return false;
      const s = { endpoint: sub.endpoint, keys: sub.keys };
      if (quitar) { subUlt = null; salasUlt = []; } else { subUlt = s; salasUlt = salas || []; }
      if (!abierto) return false;
      try { ws.send(JSON.stringify({ t: 'avisos', sub: s, salas: salas || [], quitar: quitar ? 1 : undefined })); return true; } catch (_) { return false; }
    };
    // «despierta» a quien no está en la sala: un aviso en su teléfono de mensaje o de llamada
    const despiertaA = (sala, tipo) => { if (!abierto) return false; try { ws.send(JSON.stringify({ t: 'despierta', sala, tipo })); return true; } catch (_) { return false; } };
    // la app en segundo plano o de vuelta (29 Oct 2026, 14:38): lo que llegue mientras está fuera se avisa también en el teléfono
    const presencia = (fuera) => { fueraAhora = !!fuera; if (!abierto) return false; try { ws.send(JSON.stringify({ t: 'presencia', fuera: fuera ? 1 : 0 })); return true; } catch (_) { return false; } };
    function cierra() { cerrando = true; clearInterval(ping); try { ws && ws.close(); } catch (_) {} }

    conecta();
    // para las pruebas: un corte de la conexión como los del teléfono (se vuelve a conectar sola)
    const corta = () => { try { if (ws) ws.close(); } catch (_) {} };
    return { on, entra, sale, manda, pideIce, cierra, invita, busca, retira, mide, suscribe, despiertaA, presencia, corta, get avisos() { return avisos; }, get abierto() { return abierto; }, get atraso() { return ws ? ws.bufferedAmount : 0; }, get region() { return region; }, get llamadas() { return llamadas; }, get ice() { return ice; }, get caduca() { return caduca; }, get url() { return url; }, get latencia() { return latencia; }, get latenciaMin() { return hist.length ? Math.min(...hist) : null; }, get ultimoPong() { return ultimoPong; } };
  }
  // Otro servidor de llamadas (dueño, 28 Oct 2026, 14:17: «que las llamadas sean todas buenas, independientemente de si la
  // persona está en Sudamérica, en Europa…»): una conexión corta para medir su tiempo de ida y vuelta y pedirle sus
  // credenciales de llamada (TURN, de vida corta). No entra en ninguna sala ni manda nada más; se cierra en cuanto responde.
  function iceDe(base, espera) {
    return new Promise((res) => {
      let ws = null, fin = false, t0 = 0, ice = null, caduca = 0, region = ''; const ms = [];
      const acaba = (r) => { if (fin) return; fin = true; clearTimeout(tm); try { if (ws) ws.close(); } catch (_) {} res(r); };
      const tm = setTimeout(() => acaba(ice && ms.length ? { ice, caduca, region, ms: Math.round(Math.min(...ms)) } : null), espera || 5000);
      try { ws = new WebSocket(String(base).replace(/\/$/, '') + '/com'); } catch (_) { acaba(null); return; }
      ws.onopen = () => { try { ws.send(JSON.stringify({ t: 'hola' })); } catch (_) { acaba(null); } };
      ws.onmessage = (e) => {
        if (typeof e.data !== 'string') return;
        let m; try { m = JSON.parse(e.data); } catch (_) { return; }
        if (m.t === 'hola') { if (!m.llamadas || !Array.isArray(m.ice) || !m.ice.length) { acaba(null); return; } ice = m.ice; caduca = +m.caduca || 0; region = m.region || ''; t0 = performance.now(); try { ws.send(JSON.stringify({ t: 'ping' })); } catch (_) { acaba(null); } }
        else if (m.t === 'pong' && ice) {
          // cuatro medidas seguidas y la mejor: una sola puede dar un pico (desde Barranquilla, Miami dio 156 ms una vez y 47 ms después)
          ms.push(performance.now() - t0);
          if (ms.length >= 4) acaba({ ice, caduca, region, ms: Math.round(Math.min(...ms)) });
          else { t0 = performance.now(); try { ws.send(JSON.stringify({ t: 'ping' })); } catch (_) { acaba({ ice, caduca, region, ms: Math.round(Math.min(...ms)) }); } }
        }
      };
      ws.onerror = () => acaba(null); ws.onclose = () => acaba(ice && ms.length ? { ice, caduca, region, ms: Math.round(Math.min(...ms)) } : null);
    });
  }
  raiz.GuardianaRele = { crea, MOTORES, PROPIO, iceDe };
})(typeof window !== 'undefined' ? window : globalThis);
