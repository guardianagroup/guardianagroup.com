/* GUARDIANA · Órbita · «Ahora mismo» (owner, 22 Oct 2026: «datos curiosos e interesantes, que el cliente diga wow, pero
   que sean ciertos; del exterior y del propio PC»). One true fact at a time, in the card at the bottom right.
   Facts about the world are computed here, now, from the same open data the planet draws: CelesTrak's orbital elements
   (SGP4, satellite.js), OpenStreetMap's cables and data centres, GeoNames' cities and the real Sun. Facts about this
   computer come from the panel's own measurements (/api/por-dentro, kept by orbita.js in window.__orbitaPD); outside the
   program they are examples and the card says «EJEMPLO». Nothing is invented and nothing leaves the page. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const RAIZ = document.documentElement, DEMO = RAIZ.dataset.demo === '1', TIERRA = RAIZ.dataset.tierra || '/static/tierra/';
  const RAD = Math.PI / 180, RT = 6371, STERLING = [39.006, -77.429];
  const lang = () => { const l = (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es'; return X[l] ? l : 'en'; };
  const loc = () => (window.GuardianaIdioma && window.GuardianaIdioma.locale) || 'es-ES';
  const num = (n, d = 0) => Number(n).toLocaleString(loc(), { maximumFractionDigits: d, minimumFractionDigits: d });
  const pais = (cc) => { try { return new Intl.DisplayNames([lang()], { type: 'region' }).of(cc) || cc; } catch (_) { return cc; } };
  const lugar = () => (window.OrbitaPlaneta && window.OrbitaPlaneta.lugar) || null;
  const km = (a1, o1, a2, o2) => { const p1 = a1 * RAD, p2 = a2 * RAD, dp = p2 - p1, dl = (o2 - o1) * RAD; const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2; return 2 * RT * Math.asin(Math.min(1, Math.sqrt(h))); };

  const X = {
    es: {
      k: { mundo: 'EL MUNDO, AHORA', equipo: 'TU EQUIPO', ejemplo: 'EJEMPLO' },
      sat: (d) => `satélites de datos están ahora mismo sobre el horizonte de ${d}.`, satF: 'CelesTrak · posiciones calculadas ahora',
      noche: (p) => `ciudades de más de 15.000 habitantes están ahora de noche: el ${p} % del total.`, nocheF: 'GeoNames · el Sol, calculado ahora',
      cerca: (n, o, c) => `te separan del centro de datos más cercano del mapa: ${n}${o && o !== n ? ' (' + o + ')' : ''}${c ? ', en ' + c : ''}.`, cercaF: 'OpenStreetMap (ODbL) · cobertura parcial',
      luz: (d) => `es lo mínimo que tarda la luz por fibra desde ${d} hasta Sterling (Virginia, EE. UU.), la ciudad con más centros de datos del mapa.`, luzF: 'En línea recta; por los cables reales, algo más',
      cab: (v) => `de cable submarino en el mapa: darían ${v} vueltas a la Tierra.`, cabF: 'OpenStreetMap (ODbL) · faltan algunos',
      star: (p) => `satélites Starlink en órbita: el ${p} % de todos los satélites de datos que sigue Órbita.`, starF: 'CelesTrak',
      llegan: (p) => `cables submarinos llegan a tierra en ${p}. Por ellos viaja casi todo lo que tu equipo envía a otros continentes.`, lleganF: 'OpenStreetMap (ODbL) · puede faltar alguno',
      emp: (p) => `empresas recibieron datos de tu equipo en la última hora, desde ${p} ${p === 1 ? 'programa' : 'programas'}.`, empF: 'Medido en este equipo por GUARDIANA',
      top: (pr, k) => `conexiones ha hecho hoy ${pr}, el programa que más habla con internet, a ${k} ${k === 1 ? 'país' : 'países'}.`, topF: 'Medido en este equipo por GUARDIANA',
      tel: (k) => `conexiones de telemetría ha enviado hoy tu equipo, a ${k} ${k === 1 ? 'país' : 'países'}.`, telF: 'Medido en este equipo por GUARDIANA',
      ej: 'Ejemplo: en el programa, medido en tu equipo', tu: 'tu ciudad',
    },
    en: {
      k: { mundo: 'THE WORLD, NOW', equipo: 'YOUR COMPUTER', ejemplo: 'EXAMPLE' },
      sat: (d) => `data satellites are above the horizon of ${d} right now.`, satF: 'CelesTrak · positions computed now',
      noche: (p) => `cities of more than 15,000 people are in night right now: ${p}% of them.`, nocheF: 'GeoNames · the Sun, computed now',
      cerca: (n, o, c) => `to the nearest data centre on the map: ${n}${o && o !== n ? ' (' + o + ')' : ''}${c ? ', in ' + c : ''}.`, cercaF: 'OpenStreetMap (ODbL) · partial coverage',
      luz: (d) => `is the least light needs, through fibre, from ${d} to Sterling (Virginia, USA), the city with the most data centres on the map.`, luzF: 'In a straight line; along the real cables, a little more',
      cab: (v) => `of submarine cable on the map: enough to go round the Earth ${v} times.`, cabF: 'OpenStreetMap (ODbL) · some are missing',
      star: (p) => `Starlink satellites in orbit: ${p}% of all the data satellites Órbita follows.`, starF: 'CelesTrak',
      llegan: (p) => `submarine cables reach land in ${p}. Almost everything your computer sends to other continents travels through them.`, lleganF: 'OpenStreetMap (ODbL) · some may be missing',
      emp: (p) => `companies received data from your computer in the last hour, from ${p} ${p === 1 ? 'program' : 'programs'}.`, empF: 'Measured on this computer by GUARDIANA',
      top: (pr, k) => `connections today by ${pr}, the program that talks to the internet most, to ${k} ${k === 1 ? 'country' : 'countries'}.`, topF: 'Measured on this computer by GUARDIANA',
      tel: (k) => `telemetry connections sent by your computer today, to ${k} ${k === 1 ? 'country' : 'countries'}.`, telF: 'Measured on this computer by GUARDIANA',
      ej: 'Example: in the program, measured on your computer', tu: 'your city',
    },
    pt: {
      k: { mundo: 'O MUNDO, AGORA', equipo: 'SEU COMPUTADOR', ejemplo: 'EXEMPLO' },
      sat: (d) => `satélites de dados estão agora acima do horizonte de ${d}.`, satF: 'CelesTrak · posições calculadas agora',
      noche: (p) => `cidades com mais de 15 mil habitantes estão agora à noite: ${p} % do total.`, nocheF: 'GeoNames · o Sol, calculado agora',
      cerca: (n, o, c) => `até o centro de dados mais próximo do mapa: ${n}${o && o !== n ? ' (' + o + ')' : ''}${c ? ', em ' + c : ''}.`, cercaF: 'OpenStreetMap (ODbL) · cobertura parcial',
      luz: (d) => `é o mínimo que a luz leva, pela fibra, de ${d} até Sterling (Virgínia, EUA), a cidade com mais centros de dados do mapa.`, luzF: 'Em linha reta; pelos cabos reais, um pouco mais',
      cab: (v) => `de cabo submarino no mapa: dariam ${v} voltas na Terra.`, cabF: 'OpenStreetMap (ODbL) · faltam alguns',
      star: (p) => `satélites Starlink em órbita: ${p} % de todos os satélites de dados que o Órbita acompanha.`, starF: 'CelesTrak',
      llegan: (p) => `cabos submarinos chegam à terra em ${p}. Por eles viaja quase tudo o que seu computador envia a outros continentes.`, lleganF: 'OpenStreetMap (ODbL) · pode faltar algum',
      emp: (p) => `empresas receberam dados do seu computador na última hora, de ${p} ${p === 1 ? 'programa' : 'programas'}.`, empF: 'Medido neste computador pela GUARDIANA',
      top: (pr, k) => `conexões hoje do ${pr}, o programa que mais fala com a internet, para ${k} ${k === 1 ? 'país' : 'países'}.`, topF: 'Medido neste computador pela GUARDIANA',
      tel: (k) => `conexões de telemetria enviadas hoje pelo seu computador, para ${k} ${k === 1 ? 'país' : 'países'}.`, telF: 'Medido neste computador pela GUARDIANA',
      ej: 'Exemplo: no programa, medido no seu computador', tu: 'sua cidade',
    },
  };
  const tx = () => X[lang()];

  // ---------- data, loaded once and only when needed ----------
  const memo = {};
  const una = (k, f) => memo[k] || (memo[k] = f().catch(() => null));
  const json = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
  const script = (src) => new Promise((ok, mal) => { if (window.satellite) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = mal; document.head.appendChild(s); });
  const pausa = () => new Promise((r) => setTimeout(r, 0));
  async function trozos(n, f) { let i = 0; while (i < n) { const t0 = performance.now(); while (i < n && performance.now() - t0 < 8) f(i++); await pausa(); } }
  const satelites = () => una('sat', async () => {
    await script('static/vendor/satellite.min.js');
    const d = await json('datos/satelites.json'), c = d.campos, ix = (k) => c.indexOf(k), rec = [];
    await trozos(d.sat.length, (j) => { const f = d.sat[j], o = { NORAD_CAT_ID: f[ix('norad')] }; for (const k of c.slice(3)) o[k] = f[ix(k)]; try { const r = window.satellite.json2satrec(o); if (r && !r.error) rec.push(r); } catch (_) {} });
    return { d, rec };
  });
  const ciudades = () => una('ciu', async () => {
    const t = await (await fetch(TIERRA + 'ciudades.tsv')).text(), v = [];
    for (const l of t.split('\n')) { if (!l || l[0] === '#') continue; const p = l.split('\t'); const la = +p[3] * RAD, lo = +p[4] * RAD; v.push(Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)); }
    return new Float32Array(v);
  });
  const puntos = () => una('pt', () => json('datos/puntos.json'));
  const lugaresCapas = () => una('lug', () => json('datos/lugares-capas.json'));
  const cables = () => una('cab', () => json('datos/cables.json'));

  // ---------- the facts ----------
  const MUNDO = [
    async function satSobre() {
      const L = lugar(); if (!L) return null;
      const S = await satelites(); if (!S) return null;
      const ahora = new Date(), gm = window.satellite.gstime(ahora), a = L.lat * RAD, b = L.lon * RAD;
      const ux = Math.cos(a) * Math.cos(b), uy = Math.cos(a) * Math.sin(b), uz = Math.sin(a), ox = ux * 6378.137, oy = uy * 6378.137, oz = uz * 6378.137;
      let n = 0;
      await trozos(S.rec.length, (i) => {
        let pv = null; try { pv = window.satellite.propagate(S.rec[i], ahora); } catch (_) {}
        if (!pv || !pv.position || typeof pv.position === 'boolean') return;
        const p = pv.position, ex = p.x * Math.cos(gm) + p.y * Math.sin(gm), ey = -p.x * Math.sin(gm) + p.y * Math.cos(gm), ez = p.z;
        const dx = ex - ox, dy = ey - oy, dz = ez - oz, d = Math.hypot(dx, dy, dz);
        if ((dx * ux + dy * uy + dz * uz) / d > 0) n++;
      });
      return { k: 'mundo', v: num(n), t: tx().sat(L.aprox ? L.nombre : L.nombre || tx().tu), f: tx().satF };
    },
    async function noche() {
      const C = await ciudades(); if (!C || !window.OrbitaSol) return null;
      const s = window.OrbitaSol(), a = s.lat * RAD, b = s.lon * RAD, sx = Math.cos(a) * Math.cos(b), sy = Math.cos(a) * Math.sin(b), sz = Math.sin(a);
      let n = 0; const N = C.length / 3;
      for (let i = 0; i < C.length; i += 3) if (C[i] * sx + C[i + 1] * sy + C[i + 2] * sz < 0) n++;
      return { k: 'mundo', v: num(n), t: tx().noche(num(100 * n / N)), f: tx().nocheF };
    },
    async function centroCercano() {
      const L = lugar(); if (!L || L.aprox) return null;
      const [P, G] = await Promise.all([puntos(), lugaresCapas()]); if (!P) return null;
      const c = P.campos, il = c.indexOf('lon'), ia = c.indexOf('lat'), it = c.indexOf('tipo'), inm = c.indexOf('nombre'), iop = c.indexOf('operador');
      let mejor = null, dm = 1e9, j = -1;
      for (const p of P.puntos) { if (p[it] !== 'datos') continue; j++; const d = km(L.lat, L.lon, p[ia], p[il]); if (d < dm) { dm = d; mejor = { p, j }; } }
      if (!mejor) return null;
      const g = G && G.de && G.centros ? G.centros[G.de[mejor.j]] : null;
      const nombre = mejor.p[inm] || mejor.p[iop] || '—';
      return { k: 'mundo', v: num(dm < 10 ? dm : Math.round(dm), dm < 10 ? 1 : 0) + ' km', t: tx().cerca(nombre, mejor.p[iop], g && g[2] ? g[2] + ', ' + pais(g[3]) : ''), f: tx().cercaF };
    },
    async function luz() {
      const L = lugar(); if (!L) return null;
      const d = km(L.lat, L.lon, STERLING[0], STERLING[1]); if (d < 50) return null;
      return { k: 'mundo', v: num(d / 200, d < 2000 ? 1 : 0) + ' ms', t: tx().luz(L.nombre || tx().tu), f: tx().luzF };
    },
    async function cableVueltas() {
      const C = await cables(); if (!C || !C.medida) return null;
      return { k: 'mundo', v: num(C.medida.km) + ' km', t: tx().cab(num(C.medida.km / 40075, 1)), f: tx().cabF };
    },
    async function starlink() {
      const S = await satelites(); if (!S) return null;
      const g = S.d.grupos, st = g.find((x) => x.id === 'starlink'), tot = g.reduce((a, x) => a + x.n, 0);
      if (!st || !tot) return null;
      return { k: 'mundo', v: num(st.n), t: tx().star(num(100 * st.n / tot)), f: tx().starF + ', ' + new Date(S.d.descargado).toLocaleDateString(loc()) };
    },
    async function cablesPais() {
      const cc = window.OrbitaPlaneta && window.OrbitaPlaneta.pais; if (!cc) return null;
      const G = await lugaresCapas(); if (!G || !G.llegadas) return null;
      const nombres = new Set();
      for (const l of G.llegadas) if (l[3] === cc) for (const k of l[4]) { const gi = G.g ? G.g[k] : -1; nombres.add(gi >= 0 ? 'g' + gi : 's' + k); }
      if (!nombres.size) return null;
      return { k: 'mundo', v: num(nombres.size), t: tx().llegan(pais(cc)), f: tx().lleganF };
    },
  ];
  // This computer: in the program, from the panel's measurements; outside it, three labelled examples.
  function equipo() {
    const t = tx();
    if (DEMO) return [
      { k: 'equipo', e: true, v: num(37), t: t.emp(6), f: t.ej },
      { k: 'equipo', e: true, v: num(1204), t: t.tel(3), f: t.ej },
      { k: 'equipo', e: true, v: num(842), t: t.top('Navegador', 9), f: t.ej },
    ];
    const u = window.__orbitaPD; if (!u || !u.destinos) return [];
    const out = [], ahora = u.ahora || Date.now(), hora = u.destinos.filter((d) => ahora - (d.ultima || 0) < 3600e3);
    const emp = new Set(hora.map((d) => d.empresa || d.red || d.destino).filter(Boolean)), prog = new Set(hora.map((d) => d.programa).filter(Boolean));
    if (emp.size) out.push({ k: 'equipo', v: num(emp.size), t: t.emp(prog.size || 1), f: t.empF });
    const porProg = new Map();
    for (const d of u.destinos) { if (!d.programa) continue; const x = porProg.get(d.programa) || { n: 0, p: new Set() }; x.n += (d.enviados || 0) + (d.paradas || 0); if (d.pais) x.p.add(d.pais); porProg.set(d.programa, x); }
    const top = [...porProg.entries()].sort((a, b) => b[1].n - a[1].n)[0];
    if (top && top[1].n) out.push({ k: 'equipo', v: num(top[1].n), t: t.top(top[0], top[1].p.size), f: t.topF });
    const tel = u.destinos.filter((d) => d.categoria === 'telemetria'), nt = tel.reduce((a, d) => a + (d.enviados || 0) + (d.paradas || 0), 0);
    if (nt) out.push({ k: 'equipo', v: num(nt), t: t.tel(new Set(tel.map((d) => d.pais).filter(Boolean)).size), f: t.telF });
    return out;
  }

  // ---------- the card ----------
  const caja = $('dato'); if (!caja) return;
  let i = 0, lista = [], parado = false, temp = 0;
  async function siguiente() {
    clearTimeout(temp);
    const eq = equipo();
    // the order alternates: the world, this computer, the world…
    const orden = [];
    for (let k = 0; k < Math.max(MUNDO.length, eq.length); k++) { if (MUNDO[k]) orden.push(MUNDO[k]); if (eq[k]) orden.push(eq[k]); }
    lista = orden;
    for (let intento = 0; intento < orden.length; intento++) {
      const f = orden[i % orden.length]; i++;
      const d = typeof f === 'function' ? await f() : f;
      if (d) { pinta(d, (i - 1) % orden.length, orden.length); break; }
    }
    temp = setTimeout(() => { if (!parado && !document.hidden) siguiente(); else temp = setTimeout(siguiente, 3000); }, 9000);
  }
  function pinta(d, k, n) {
    const t = tx();
    caja.classList.remove('entra'); void caja.offsetWidth; caja.classList.add('entra');
    $('dato-k').textContent = t.k[d.k];
    const e = $('dato-e'); e.hidden = !d.e; e.textContent = t.k.ejemplo;
    $('dato-v').textContent = d.v; $('dato-t').textContent = d.t; $('dato-f').textContent = d.f;
    const p = $('dato-p'); p.textContent = '';
    for (let j = 0; j < n; j++) { const b = document.createElement('i'); if (j === k) b.className = 'on'; p.append(b); }
    caja.hidden = false;
  }
  caja.addEventListener('mouseenter', () => { parado = true; });
  caja.addEventListener('mouseleave', () => { parado = false; });
  caja.addEventListener('click', () => siguiente());
  addEventListener('guardiana-idioma', () => { i = Math.max(0, i - 1); siguiente(); });
  setTimeout(siguiente, 3500);
})();
