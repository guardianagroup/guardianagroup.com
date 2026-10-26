// GUARDIANA · Comunicaciones · cliente del relé (26 Oct 2026).
// Elige el relé más cercano de los de GUARDIANA (el que antes responde a /salud), mantiene la conexión viva (ping cada
// 25 s, reconexión con espera creciente), vuelve a entrar en las salas tras una caída y pasa tramas binarias ya selladas.
// El relé solo ve la sala y los bytes; nunca una clave ni un nombre.
'use strict';
(function (raiz) {
  const MOTORES = ['wss://motor.guardianagroup.com', 'wss://motor-am.guardianagroup.com'];
  const q = new URLSearchParams(location.search);
  const LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);

  function crea(o) {
    o = o || {};
    const esc = {}; const on = (t, f) => { (esc[t] = esc[t] || []).push(f); };
    const emite = (t, ...a) => { for (const f of esc[t] || []) { try { f(...a); } catch (e) { console.error(e); } } };
    let ws = null, url = null, abierto = false, intentos = 0, ping = null, cerrando = false;
    const salas = new Map(); // sala → yo
    let ice = [], caduca = 0, region = '', llamadas = false;

    async function sonda(base) {
      const http = base.replace(/^ws/, 'http');
      const c = new AbortController(); const t = setTimeout(() => c.abort(), 3500);
      try {
        const t0 = performance.now();
        const r = await fetch(http + '/salud', { signal: c.signal, cache: 'no-store', mode: 'cors' });
        const j = await r.json();
        if (!j || !j.ok) throw new Error('sin ok');
        return { base, ms: performance.now() - t0, region: j.region || '' };
      } catch (_) { return null; } finally { clearTimeout(t); }
    }
    async function elige() {
      if (q.get('rele')) return q.get('rele');
      if (LOCAL) return 'ws://127.0.0.1:8794';
      const rs = (await Promise.all(MOTORES.map(sonda))).filter(Boolean).sort((a, b) => a.ms - b.ms);
      return rs.length ? rs[0].base : MOTORES[0];
    }

    async function conecta() {
      if (cerrando) return;
      if (!url) url = await elige();
      try { ws = new WebSocket(url.replace(/\/$/, '') + '/com'); } catch (_) { return reintenta(); }
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        abierto = true; intentos = 0;
        ws.send(JSON.stringify({ t: 'hola' }));
        for (const [sala, yo] of salas) ws.send(JSON.stringify({ t: 'entra', sala, yo }));
        clearInterval(ping); ping = setInterval(() => { try { ws.send(JSON.stringify({ t: 'ping' })); } catch (_) {} }, 25000);
        emite('abierto', { url });
      };
      ws.onmessage = (e) => {
        if (typeof e.data === 'string') {
          let m; try { m = JSON.parse(e.data); } catch (_) { return; }
          switch (m.t) {
            case 'hola': region = m.region || ''; llamadas = !!m.llamadas; ice = m.ice || []; caduca = m.caduca || 0; emite('hola', { region, llamadas, ice }); break;
            case 'ice': ice = m.ice || []; caduca = m.caduca || 0; emite('ice', ice); break;
            case 'sala': emite('sala', m.sala, m.miembros || []); break;
            case 'llega': emite('llega', m.sala, m.quien); break;
            case 'sale': emite('sale', m.sala, m.quien); break;
            case 'fuera': break;
            case 'sustituido': salas.delete(m.sala); emite('sustituido', m.sala); break;
            case 'ausente': case 'atasco': case 'lento': emite('aviso', m); break;
            case 'error': emite('error', m); break;
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
    const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    const deHex = (s) => Uint8Array.from(String(s).match(/../g) || [], (h) => parseInt(h, 16));

    function entra(sala, yo) { salas.set(sala, yo); if (abierto) ws.send(JSON.stringify({ t: 'entra', sala, yo })); }
    function sale(sala) { salas.delete(sala); if (abierto) ws.send(JSON.stringify({ t: 'sale', sala })); }
    function manda(sala, para, carga) {
      if (!abierto) return false;
      const c = carga instanceof Uint8Array ? carga : new Uint8Array(carga);
      const b = new Uint8Array(41 + c.length);
      b[0] = 1; b.set(deHex(sala), 1); if (para) b.set(deHex(para), 33); b.set(c, 41);
      try { ws.send(b); return true; } catch (_) { return false; }
    }
    function pideIce() { if (abierto) ws.send(JSON.stringify({ t: 'ice' })); }
    function cierra() { cerrando = true; clearInterval(ping); try { ws && ws.close(); } catch (_) {} }

    conecta();
    return { on, entra, sale, manda, pideIce, cierra, get abierto() { return abierto; }, get atraso() { return ws ? ws.bufferedAmount : 0; }, get region() { return region; }, get llamadas() { return llamadas; }, get ice() { return ice; }, get caduca() { return caduca; }, get url() { return url; } };
  }
  raiz.GuardianaRele = { crea, MOTORES };
})(typeof window !== 'undefined' ? window : globalThis);
