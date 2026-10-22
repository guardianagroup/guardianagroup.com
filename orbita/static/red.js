/* GUARDIANA · Órbita · the map's own network as a graph (owner, 22 Oct 2026, 18:13: «deben de llegar por el cable…
   es mucho más real»). The measured routes of «Mi conexión» and «El viaje de tus datos» are drawn along the submarine
   cables and the land fibre the map already has, by the shortest path through them, instead of as a straight arc over
   the planet. It is still a drawing: the exact cable a packet took is not known from outside the network, and the
   captions say so. Nothing here is sent anywhere. */
(function () {
  'use strict';
  const P = () => window.OrbitaPlaneta, C = () => window.OrbitaCapas;
  const RAD = Math.PI / 180, RT = 6371;
  const CELDA = 0.22; // degrees: vertices this close are the same junction (about 24 km)
  let G = null, cache = new Map();

  const lonlat = (w) => { const m = Math.hypot(w[0], w[1], w[2]) || 1; return [Math.atan2(w[0], w[2]) / RAD, Math.asin(w[1] / m) / RAD]; };
  const vec = (lon, lat) => { const a = lat * RAD, b = lon * RAD; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
  const kmEntre = (a, b) => { const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])); return RT * Math.acos(d); };

  function construye() {
    const c = C(); if (!c || !c.red) return null;
    const { sub, tierra, fibra } = c.red; if (!sub && !tierra && !fibra) return null;
    const idx = new Map(), nodos = [], ady = [];
    const nodo = (w) => {
      const [lon, lat] = lonlat(w), k = Math.round(lon / CELDA) + ',' + Math.round(lat / CELDA);
      let i = idx.get(k); if (i === undefined) { i = nodos.length; idx.set(k, i); nodos.push(vec(lon, lat)); ady.push([]); }
      return i;
    };
    const une = (a, b, peso) => { if (a === b) return; ady[a].push([b, peso]); ady[b].push([a, peso]); };
    for (const lineas of [sub || [], tierra || [], fibra || []]) {
      for (const l of lineas) {
        const w = l.w; if (!w || w.length < 2) continue;
        let prev = nodo(w[0]);
        for (let j = 1; j < w.length; j++) { const n = nodo(w[j]); if (n !== prev) { une(prev, n, Math.max(1, kmEntre(nodos[prev], nodos[n]))); prev = n; } }
      }
    }
    // neighbouring cells join too (a landing and the fibre of its town are rarely in the same cell), at a price
    for (const [k, i] of idx) {
      const [x, y] = k.split(',').map(Number);
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { const j = idx.get((x + dx) + ',' + (y + dy)); if (j !== undefined) une(i, j, 2.5 * kmEntre(nodos[i], nodos[j]) + 15); }
    }
    return { nodos, ady, n: nodos.length };
  }
  // the nearest junctions to a place, with their distance (an access leg that is not on the map is paid three times over)
  function cercanos(g, v, k, max) {
    const out = [];
    for (let i = 0; i < g.n; i++) { const d = kmEntre(v, g.nodos[i]); if (d <= max) out.push([d, i]); }
    out.sort((a, b) => a[0] - b[0]); return out.slice(0, k);
  }
  // Dijkstra with a binary heap
  function dijkstra(g, inicios, metas) {
    const dist = new Float64Array(g.n).fill(Infinity), prev = new Int32Array(g.n).fill(-1), heap = [];
    const empuja = (d, i) => { heap.push([d, i]); let j = heap.length - 1; while (j > 0) { const p = (j - 1) >> 1; if (heap[p][0] <= heap[j][0]) break; [heap[p], heap[j]] = [heap[j], heap[p]]; j = p; } };
    const saca = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let j = 0; for (;;) { const a = 2 * j + 1, b = a + 1; let m = j; if (a < heap.length && heap[a][0] < heap[m][0]) m = a; if (b < heap.length && heap[b][0] < heap[m][0]) m = b; if (m === j) break; [heap[m], heap[j]] = [heap[j], heap[m]]; j = m; } } return top; };
    for (const [d, i] of inicios) { dist[i] = d; empuja(d, i); }
    const metaD = new Map(metas), vistos = new Set(); let mejor = null;
    while (heap.length) {
      const [d, i] = saca(); if (vistos.has(i)) continue; vistos.add(i);
      if (metaD.has(i)) { const total = d + metaD.get(i); if (!mejor || total < mejor[0]) mejor = [total, i]; }
      if (mejor && d > mejor[0]) break;
      for (const [j, w] of g.ady[i]) { const nd = d + w; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; empuja(nd, j); } }
    }
    if (!mejor) return null;
    const camino = []; for (let i = mejor[1]; i >= 0; i = prev[i]) camino.push(i); camino.reverse();
    return { camino, km: mejor[0] };
  }
  // the path from a to b as unit vectors on the sphere (a and b included), or null when the map has no way between them
  function camino(a, b) {
    if (!G) { G = construye(); if (!G) return null; cache = new Map(); }
    const key = a.lon.toFixed(2) + ',' + a.lat.toFixed(2) + '>' + b.lon.toFixed(2) + ',' + b.lat.toFixed(2);
    if (cache.has(key)) return cache.get(key);
    const va = vec(a.lon, a.lat), vb = vec(b.lon, b.lat), recta = kmEntre(va, vb);
    let out = null;
    if (recta > 60) {
      const ini = cercanos(G, va, 4, 900).map(([d, i]) => [3 * d, i]), fin = cercanos(G, vb, 4, 900).map(([d, i]) => [i, 3 * d]);
      const r = ini.length && fin.length ? dijkstra(G, ini, fin) : null;
      // a path more than twice the straight line is a detour the map forces (a missing land link), not the way the
      // data took: fall back to the arc, which the captions call what it is
      if (r && r.km < 2.2 * recta + 300) {
        const pts = [va, ...r.camino.map((i) => G.nodos[i]), vb], acc = [0];
        for (let j = 1; j < pts.length; j++) acc.push(acc[j - 1] + kmEntre(pts[j - 1], pts[j]));
        out = { pts, acc, km: acc[acc.length - 1], porRed: r.km };
      }
    }
    cache.set(key, out); return out;
  }
  // n+1 points evenly spaced along the path, as unit vectors (for the pulse that runs along it)
  function muestrea(ruta, n) {
    const { pts, acc } = ruta, L = acc[acc.length - 1] || 1, out = []; let j = 0;
    for (let i = 0; i <= n; i++) {
      const s = L * i / n; while (j < pts.length - 2 && acc[j + 1] < s) j++;
      const t = Math.max(0, Math.min(1, (s - acc[j]) / ((acc[j + 1] - acc[j]) || 1))), p = pts[j], q = pts[j + 1];
      const w = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t], m = Math.hypot(w[0], w[1], w[2]) || 1;
      out.push([w[0] / m, w[1] / m, w[2] / m]);
    }
    return out;
  }
  // loads the map's network if needed and builds the graph; resolves true when there is one
  let cargando = null;
  function prepara() {
    if (G) return Promise.resolve(true);
    if (cargando) return cargando;
    const c = C(); if (!c || !c.cargaRed) return Promise.resolve(false);
    cargando = c.cargaRed().then(() => { G = construye(); cache = new Map(); cargando = null; return !!G; }).catch(() => { cargando = null; return false; });
    return cargando;
  }
  window.OrbitaRed = { camino, muestrea, prepara, get lista() { return !!G; }, olvida() { G = null; cache = new Map(); } };
})();
