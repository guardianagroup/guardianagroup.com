/* GUARDIANA · Órbita · the cities that appear as you come closer (owner, 23 Oct 2026, 21:47: «cuando hacemos zoom,
   también tendríamos que poder ver ciudades… háblalo con la agencia»). Agency round 16, four voices out of four in
   favour (ChatGPT, Gemini, Grok, GPT-6 Astra); what at least two of them back:
     · a discreet reference, never the protagonist: no city with the whole planet in view; national capitals and cities
       of more than 5 million when about a continent fills the screen; more than 1 million at a region; more than 100,000
       closer; every place in the data when less than about 200 km are in view;
     · few labels and never on top of each other (60 on a computer, 25 on a phone, 8 px apart; a capital also gives
       way when there is no room), nothing on the far side of the planet, a small dot and the name in the interface's
       letter at 12 px with a dark halo;
     · the name in the page's language from the source itself (no machine translation); the local name otherwise;
     · no card on tap in this first version, and nothing here uses or asks for the visitor's location.
   The data: Natural Earth, Populated Places 1:10m (public domain; «Made with Natural Earth»), 7,295 places, with the
   names Natural Earth gives in Spanish, English and Portuguese. It is loaded the first time a continent fills the screen.
   GeoNames (CC BY 4.0), which three voices proposed for the closest views, can be added later. */
(() => {
  'use strict';
  const P = () => window.OrbitaPlaneta;
  const RAD = Math.PI / 180, KM_RADIO = 6371;
  const ACENTO = '156,195,228', BLANCO = '244,246,248', FONDO = '6,8,12';
  let D = null, pedido = false;

  // the levels, by how many kilometres of the Earth the screen's width covers
  const NIVELES = [
    { km: 9000, pob: Infinity },  // the whole planet: none
    { km: 3000, pob: 5e6 },       // a continent: national capitals and more than 5 million
    { km: 800, pob: 1e6 },        // a region: more than 1 million
    { km: 200, pob: 1e5 },        // closer: more than 100,000
    { km: 0, pob: 0 },            // close: all
  ];
  // the width (km) under which a place starts to show, and the width at which it is fully lit
  function umbral(pob, cap) {
    if (cap || pob >= 5e6) return 7800; // fully lit at 7,800 km, fading in from the 9,000 km where the planet stops being whole
    if (pob >= 1e6) return 3000;
    if (pob >= 1e5) return 800;
    return 200;
  }

  async function carga() {
    if (pedido) return; pedido = true;
    try {
      const r = await fetch('datos/ciudades.json?v=20261023a'); if (!r.ok) throw new Error(r.status);
      const j = await r.json(), C = j.campos, i = (k) => C.indexOf(k);
      const iLon = i('lon'), iLat = i('lat'), iPob = i('poblacion'), iCap = i('capital'), iNom = i('nombre'), iEs = i('es'), iEn = i('en'), iPt = i('pt');
      const lista = j.c.map((c) => {
        const a = c[iLat] * RAD, b = c[iLon] * RAD, ca = Math.cos(a);
        const pob = c[iPob] || 0, cap = !!c[iCap];
        return { w: [ca * Math.sin(b), Math.sin(a), ca * Math.cos(b)], pob, cap, u: umbral(pob, cap), n: { local: c[iNom], es: c[iEs] || c[iNom], en: c[iEn] || c[iNom], pt: c[iPt] || c[iNom] } };
      });
      D = { lista, fuente: j.fuente, fecha: j.fecha };
    } catch (_) { D = null; pedido = false; }
  }

  const idioma = () => { const l = (document.documentElement.lang || 'es').slice(0, 2); return l === 'en' || l === 'pt' ? l : 'es'; };
  const movil = () => (P() && P().geo.W <= 760);
  let fuente = null;
  const letra = () => fuente || (fuente = (getComputedStyle(document.documentElement).getPropertyValue('--texto') || '').trim() || '"Hanken Grotesk", system-ui, sans-serif');

  // ---------- one frame ----------
  function pinta() {
    const p = P(); if (!p) return;
    const G = p.geo; if (!G || !G.R) return;
    // never while the visitor looks at their own data, inside a door or during the journey
    const B = document.body.classList;
    if ((window.OrbitaCapas && window.OrbitaCapas.enSoloTu) || B.contains('dentro') || B.contains('viaje') || B.contains('en-espejo')) return;
    const ancho = G.W / G.R * KM_RADIO; // km of the Earth across the screen, near the centre
    if (ancho >= NIVELES[0].km) return;
    if (!D) { carga(); return; }
    const cx = p.ctx, lang = idioma(), max = movil() ? 25 : 60, SEP = 8, MARGEN = 6;
    const ocupadas = [];
    // the country names already drawn keep their place (capas.js shares their boxes)
    const llegadas = window.OrbitaCapas && window.OrbitaCapas.nombresLlegadas;
    const paises = window.OrbitaCapas && window.OrbitaCapas.cajasPaises; if (paises) for (const b of paises) ocupadas.push([b[0], b[1], b[0] + b[2], b[1] + b[3]]);
    const choca = (b) => ocupadas.some((o) => b[0] < o[2] + SEP && b[2] > o[0] - SEP && b[1] < o[3] + SEP && b[3] > o[1] - SEP);
    cx.save(); cx.globalCompositeOperation = 'source-over'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
    let puestas = 0;
    for (const c of D.lista) { // already in order of importance: capitals, then by population
      if (puestas >= max) break;
      if (ancho >= c.u * 1.15) continue;
      const v = p.aVista(c.w); if (v[2] < 0.08) continue; // the far side and the very edge: nothing
      const x = G.CX + G.R * v[0], y = G.CY - G.R * v[1];
      if (x < MARGEN || y < MARGEN || x > G.W - MARGEN || y > G.H - MARGEN) continue;
      // a soft entrance as the screen narrows past its level, and towards the edge of the planet
      const alfa = Math.min(1, (c.u * 1.15 - ancho) / (c.u * 0.15)) * Math.min(1, (v[2] - 0.08) / 0.12);
      if (alfa <= 0.02) continue;
      const nombre = c.n[lang] || c.n.local; if (!nombre) continue;
      // a town already named as a cable landing (capas.js) is not named twice
      if (llegadas && llegadas.some((q) => Math.abs(q[0] - x) < 160 && Math.abs(q[1] - y) < 90 && (q[2] === nombre || q[2] === c.n.local))) continue;
      cx.font = (c.cap ? '600 ' : '500 ') + '12px ' + letra();
      // the name to the right of its dot; to the left when it would be cut by the edge of the screen
      const w = cx.measureText(nombre).width, izq = x + 7 + w > G.W - MARGEN, lx = izq ? x - 7 - w : x + 7;
      if (lx < MARGEN) continue;
      const caja = izq ? [lx - 2, y - 8, x + 4, y + 8] : [x - 4, y - 8, lx + w + 2, y + 8];
      if (choca(caja)) continue;
      ocupadas.push(caja); puestas++;
      // the dot (a capital, with a thin ring) and the name over a dark halo so it reads on land and sea
      cx.globalAlpha = alfa;
      cx.fillStyle = 'rgb(' + ACENTO + ')'; cx.beginPath(); cx.arc(x, y, c.cap ? 2.6 : 2, 0, 7); cx.fill();
      if (c.cap) { cx.strokeStyle = 'rgba(' + ACENTO + ',.75)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y, 5, 0, 7); cx.stroke(); }
      cx.lineWidth = 3.2; cx.strokeStyle = 'rgba(' + FONDO + ',.85)'; cx.strokeText(nombre, lx, y);
      cx.fillStyle = c.cap ? 'rgb(' + BLANCO + ')' : 'rgba(' + BLANCO + ',.88)'; cx.fillText(nombre, lx, y);
    }
    cx.restore();
  }

  window.OrbitaCiudades = { pinta, get datos() { return D ? { lugares: D.lista.length, fuente: D.fuente, fecha: D.fecha } : null; } };
})();
