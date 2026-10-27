// GUARDIANA · la red neuronal de NÚCLEO (27 Oct 2026), la misma en la portada, en la sección de NÚCLEO y en Comunicaciones
// (dueño, 10:20: mejor la red de NÚCLEO que el círculo). 300 puntos en una esfera, cada uno unido a sus tres vecinos.
// Gira libre (dueño, 09:28: «que gire totalmente: izquierda, derecha, arriba, abajo; que nunca sea igual»): el eje y la
// velocidad cambian solos cada pocos segundos, con suavidad, y cada visita empieza distinta. Nace desde un punto de luz.
// RedNucleo(lienzo, { nace: true|false, puntos: 300 }) → { habla(), para() }
'use strict';
(function (raiz) {
  const reducir = !!(raiz.matchMedia && raiz.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function RedNucleo(lienzo, op) {
    op = op || {};
    const cx = lienzo && lienzo.getContext && lienzo.getContext('2d'); if (!cx) return { habla() {}, para() {} };
    const N = op.puntos || 300, P = [];
    for (let i = 0; i < N; i++) { const y = 1 - (i + .5) * 2 / N, r = Math.sqrt(1 - y * y), a = i * 2.39996323, k = .86 + Math.random() * .2; P.push([Math.cos(a) * r * k, y * k, Math.sin(a) * r * k, Math.random() * Math.PI * 2]); }
    const V = P.map((p, i) => P.map((o, j) => [j, (p[0] - o[0]) ** 2 + (p[1] - o[1]) ** 2 + (p[2] - o[2]) ** 2]).filter((x) => x[0] !== i).sort((a, b) => a[1] - b[1]).slice(0, 3).map((x) => x[0]));
    let t0 = performance.now(), habla = 0, vivo = true, W = 1, H = 1, dpr = 1;
    const azar = () => { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u); return [r * Math.cos(a), u, r * Math.sin(a)]; };
    const giro = () => { const e = azar(), v = .14 + Math.random() * .26; return e.map((x) => x * v); };
    let qo = (() => { const e = azar(), a = Math.random() * Math.PI * 2; return [Math.cos(a / 2), ...e.map((x) => x * Math.sin(a / 2))]; })();
    const w = giro(); let wObj = giro(), cambio = 2 + Math.random() * 3, antes = null;
    const mide = () => { const r = lienzo.getBoundingClientRect(); dpr = Math.min(2, raiz.devicePixelRatio || 1); W = Math.max(1, r.width); H = Math.max(1, r.height); lienzo.width = W * dpr; lienzo.height = H * dpr; };
    mide(); const ro = raiz.ResizeObserver ? new ResizeObserver(mide) : null; if (ro) ro.observe(lienzo);
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const sinNacer = op.nace === false;
    function cuadro(ahora) {
      if (!vivo) return;
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
      const Q = P.map((p) => { const x = m00 * p[0] + m01 * p[1] + m02 * p[2], y = m10 * p[0] + m11 * p[1] + m12 * p[2], z = m20 * p[0] + m21 * p[1] + m22 * p[2], pul = 1 + .04 * Math.sin(t * 1.7 + p[3]) + habla * .06 * Math.sin(t * 9 + p[3]); return [W / 2 + x * R * pul, H / 2 + y * R * pul, z]; });
      cx.lineWidth = 1;
      const lin = Math.max(0, Math.min(1, (nace - .25) / .6)), chico = Math.min(W, H) < 140;
      if (lin > 0) for (let i = 0; i < N; i++) for (const j of V[i]) { if (j < i) continue; const a = Q[i], b = Q[j], zz = (a[2] + b[2]) / 2; cx.strokeStyle = `rgba(156,195,228,${(.08 + .26 * (zz + 1) / 2 + habla * .15) * lin})`; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
      for (let i = 0; i < N; i++) { const a = Q[i], f = (a[2] + 1) / 2; cx.fillStyle = `rgba(${210 + 34 * f},${228 + 18 * f},248,${(.25 + .7 * f) * Math.min(1, nace * 1.4)})`; cx.beginPath(); cx.arc(a[0], a[1], (chico ? .5 : .7) + (chico ? 1.1 : 1.5) * f, 0, Math.PI * 2); cx.fill(); }
      const g2 = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 1.25); g2.addColorStop(0, `rgba(156,195,228,${.10 + habla * .12})`); g2.addColorStop(1, 'rgba(156,195,228,0)'); cx.fillStyle = g2; cx.fillRect(0, 0, W, H);
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
    return { habla() { habla = 1; }, para() { vivo = false; if (ro) ro.disconnect(); } };
  }
  raiz.RedNucleo = RedNucleo;
})(window);
