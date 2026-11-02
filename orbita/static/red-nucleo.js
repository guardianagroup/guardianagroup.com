// GUARDIANA · la red neuronal de NÚCLEO (27 Oct 2026), la misma en la portada, en la sección de NÚCLEO y en Comunicaciones
// (dueño, 10:20: mejor la red de NÚCLEO que el círculo). 300 puntos en una esfera, cada uno unido a sus tres vecinos.
// Gira libre (dueño, 09:28: «que gire totalmente: izquierda, derecha, arriba, abajo; que nunca sea igual»): el eje y la
// velocidad cambian solos cada pocos segundos, con suavidad, y cada visita empieza distinta. Nace desde un punto de luz.
// RedNucleo(lienzo, { nace: true|false, puntos: 300 }) → { habla(), para(), pausa(), sigue() }
// 2 Nov 2026 (dueño, 16:53 y 17:14: «que no vaya a tirones… en todo tipo de PCs»): el mismo dibujo con muchas menos órdenes
// al lienzo. Antes, cada cuadro pedía unas 750 (una línea o un punto cada vez, cada uno con su color); ahora las líneas y los
// puntos van por grupos de brillo (16 tonos, una sola orden por grupo), que a la vista son lo mismo. Los puntos y sus vecinos
// se calculan una vez por visita y se reutilizan, así que volver a la portada no rehace la red. En un equipo con poca
// potencia (<html class="ligero">, lo decide static/orbita.js) se dibuja un cuadro de cada dos: gira igual de suave.
'use strict';
(function (raiz) {
  const reducir = !!(raiz.matchMedia && raiz.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const TONOS = 16;
  const ligero = () => raiz.document.documentElement.classList.contains('ligero');
  // la forma de la red, una vez por visita y por número de puntos: los puntos (con su latido) y los pares unidos
  const FORMAS = {};
  function forma(N) {
    if (FORMAS[N]) return FORMAS[N];
    const B = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) { const y = 1 - (i + .5) * 2 / N, r = Math.sqrt(1 - y * y), a = i * 2.39996323, k = .86 + Math.random() * .2; B[i * 4] = Math.cos(a) * r * k; B[i * 4 + 1] = y * k; B[i * 4 + 2] = Math.sin(a) * r * k; B[i * 4 + 3] = Math.random() * Math.PI * 2; }
    // los tres vecinos más cercanos de cada punto (como antes: se dibuja i→j solo si j > i)
    const pares = [], d = new Float64Array(N), idx = new Array(N);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) { const dx = B[i * 4] - B[j * 4], dy = B[i * 4 + 1] - B[j * 4 + 1], dz = B[i * 4 + 2] - B[j * 4 + 2]; d[j] = dx * dx + dy * dy + dz * dz; idx[j] = j; }
      const v = idx.filter((j) => j !== i).sort((a, b) => d[a] - d[b]).slice(0, 3);
      for (const j of v) if (j >= i) pares.push(i, j);
    }
    return (FORMAS[N] = { B, pares: Uint16Array.from(pares) });
  }
  function RedNucleo(lienzo, op) {
    op = op || {};
    const cx = lienzo && lienzo.getContext && lienzo.getContext('2d'); if (!cx) return { habla() {}, para() {}, pausa() {}, sigue() {} };
    const N = op.puntos || 300, F = forma(N), B = F.B, PARES = F.pares, E = PARES.length / 2;
    const Q = new Float32Array(N * 3), tonoL = new Uint8Array(E), ordenL = new Uint16Array(E), tonoP = new Uint8Array(N), ordenP = new Uint16Array(N), cuenta = new Uint16Array(TONOS + 1);
    let t0 = performance.now(), habla = 0, vivo = true, W = 1, H = 1, dpr = 1, impar = false, pedido = 0;
    const azar = () => { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u); return [r * Math.cos(a), u, r * Math.sin(a)]; };
    const giro = () => { const e = azar(), v = .14 + Math.random() * .26; return e.map((x) => x * v); };
    let qo = (() => { const e = azar(), a = Math.random() * Math.PI * 2; return [Math.cos(a / 2), ...e.map((x) => x * Math.sin(a / 2))]; })();
    const w = giro(); let wObj = giro(), cambio = 2 + Math.random() * 3, antes = null;
    const mide = () => { const r = lienzo.getBoundingClientRect(); dpr = Math.min(2, raiz.devicePixelRatio || 1); W = Math.max(1, r.width); H = Math.max(1, r.height); lienzo.width = W * dpr; lienzo.height = H * dpr; };
    mide(); const ro = raiz.ResizeObserver ? new ResizeObserver(mide) : null; if (ro) ro.observe(lienzo);
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const sinNacer = op.nace === false;
    // los elementos ordenados por tono (de los apagados a los brillantes), sin crear nada nuevo en cada cuadro
    function ordena(tono, orden, n) {
      cuenta.fill(0); for (let i = 0; i < n; i++) cuenta[tono[i] + 1]++;
      for (let k = 1; k <= TONOS; k++) cuenta[k] += cuenta[k - 1];
      for (let i = 0; i < n; i++) orden[cuenta[tono[i]]++] = i;
      // cuenta[k] es ahora el final del tono k
    }
    function cuadro(ahora) {
      if (!vivo) return;
      pedido = requestAnimationFrame(cuadro);
      if (ligero() && antes !== null && (impar = !impar)) return; // un cuadro de cada dos en un equipo con poca potencia
      const t = (ahora - t0) / 1000, nace = (reducir || sinNacer) ? 1 : ease((t - .7) / 1.6), dt = antes == null ? 0 : Math.min(.05, (ahora - antes) / 1000);
      antes = ahora;
      if (!reducir && dt > 0) {
        if (t > cambio) { wObj = giro(); cambio = t + 2.5 + Math.random() * 4.5; }
        const k = 1 - Math.exp(-dt * .7); for (let i = 0; i < 3; i++) w[i] += (wObj[i] - w[i]) * k;
        const n = Math.hypot(w[0], w[1], w[2]), m = n * dt * (1 + habla * .8);
        if (n > 1e-6) {
          const sm = Math.sin(m / 2) / n, a1 = Math.cos(m / 2), b1 = w[0] * sm, c1 = w[1] * sm, d1 = w[2] * sm, [a2, b2, c2, d2] = qo;
          qo = [a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2, a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2, a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2, a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2];
          const l = Math.hypot(qo[0], qo[1], qo[2], qo[3]) || 1; qo = qo.map((x) => x / l);
        }
      }
      habla *= .95;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * .4 * (.04 + .96 * nace) * (1 + habla * .05), [qa, qb, qc, qd] = qo;
      const m00 = 1 - 2 * (qc * qc + qd * qd), m01 = 2 * (qb * qc - qa * qd), m02 = 2 * (qb * qd + qa * qc), m10 = 2 * (qb * qc + qa * qd), m11 = 1 - 2 * (qb * qb + qd * qd), m12 = 2 * (qc * qd - qa * qb), m20 = 2 * (qb * qd - qa * qc), m21 = 2 * (qc * qd + qa * qb), m22 = 1 - 2 * (qb * qb + qc * qc);
      if (nace < 1) { const g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 40 + 60 * nace); g.addColorStop(0, `rgba(244,246,248,${.9 * (1 - nace * .7)})`); g.addColorStop(.3, `rgba(156,195,228,${.55 * (1 - nace * .5)})`); g.addColorStop(1, 'rgba(156,195,228,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
      for (let i = 0; i < N; i++) {
        const px = B[i * 4], py = B[i * 4 + 1], pz = B[i * 4 + 2], ph = B[i * 4 + 3];
        const x = m00 * px + m01 * py + m02 * pz, y = m10 * px + m11 * py + m12 * pz, z = m20 * px + m21 * py + m22 * pz, pul = 1 + .04 * Math.sin(t * 1.7 + ph) + habla * .06 * Math.sin(t * 9 + ph);
        Q[i * 3] = W / 2 + x * R * pul; Q[i * 3 + 1] = H / 2 + y * R * pul; Q[i * 3 + 2] = z;
      }
      // dueño, 10:49: «la red de dentro de NÚCLEO debería ser la misma que la de la portada»: puntos y líneas a escala del
      // tamaño (la de la portada mide 360 px), para que la pequeña sea la misma red en miniatura y no una más apretada
      const esc = Math.max(.5, Math.min(1.15, Math.min(W, H) / 360));
      cx.lineWidth = Math.max(.6, esc);
      const lin = Math.max(0, Math.min(1, (nace - .25) / .6));
      if (lin > 0) {
        for (let e = 0; e < E; e++) { const zz = (Q[PARES[2 * e] * 3 + 2] + Q[PARES[2 * e + 1] * 3 + 2]) / 2; tonoL[e] = Math.max(0, Math.min(TONOS - 1, Math.round((zz + 1) / 2 * (TONOS - 1)))); }
        ordena(tonoL, ordenL, E);
        let e0 = 0;
        for (let k = 0; k < TONOS; k++) {
          const e1 = cuenta[k]; if (e1 <= e0) continue;
          cx.strokeStyle = `rgba(156,195,228,${((.08 + .26 * k / (TONOS - 1) + habla * .15) * lin).toFixed(3)})`; cx.beginPath();
          for (let s = e0; s < e1; s++) { const e = ordenL[s], a = PARES[2 * e] * 3, b = PARES[2 * e + 1] * 3; cx.moveTo(Q[a], Q[a + 1]); cx.lineTo(Q[b], Q[b + 1]); }
          cx.stroke(); e0 = e1;
        }
      }
      const vis = Math.min(1, nace * 1.4);
      for (let i = 0; i < N; i++) tonoP[i] = Math.max(0, Math.min(TONOS - 1, Math.round((Q[i * 3 + 2] + 1) / 2 * (TONOS - 1))));
      ordena(tonoP, ordenP, N);
      let p0 = 0;
      for (let k = 0; k < TONOS; k++) {
        const p1 = cuenta[k]; if (p1 <= p0) continue;
        const f = k / (TONOS - 1);
        cx.fillStyle = `rgba(${Math.round(210 + 34 * f)},${Math.round(228 + 18 * f)},248,${((.25 + .7 * f) * vis).toFixed(3)})`; cx.beginPath();
        for (let s = p0; s < p1; s++) { const i = ordenP[s], x = Q[i * 3], y = Q[i * 3 + 1], ff = (Q[i * 3 + 2] + 1) / 2, r = (.7 + 1.5 * ff) * esc; cx.moveTo(x + r, y); cx.arc(x, y, r, 0, Math.PI * 2); }
        cx.fill(); p0 = p1;
      }
      const g2 = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 1.25); g2.addColorStop(0, `rgba(156,195,228,${.10 + habla * .12})`); g2.addColorStop(1, 'rgba(156,195,228,0)'); cx.fillStyle = g2; cx.fillRect(0, 0, W, H);
    }
    pedido = requestAnimationFrame(cuadro);
    return {
      habla() { habla = 1; },
      // para: se acabó (se suelta el lienzo); pausa y sigue: la misma red se queda quieta y vuelve donde estaba
      para() { vivo = false; cancelAnimationFrame(pedido); if (ro) ro.disconnect(); },
      pausa() { vivo = false; cancelAnimationFrame(pedido); },
      sigue() { if (vivo) return; vivo = true; antes = null; mide(); pedido = requestAnimationFrame(cuadro); },
    };
  }
  raiz.RedNucleo = RedNucleo;
})(window);
