// GUARDIANA · Comunicaciones · la voz cambiada de Ultra (3 Nov 2026; dueño, 00:20: «la versión ultra… máximo nivel que seas capaz
// de hacer»; agencia, ronda 93: «formantes, tono con variación al azar y paso banda»). Procesador de audio (AudioWorklet) que corre
// en el propio equipo, antes de encriptar: la voz original no sale de aquí.
//
// Tres pasos, en este orden:
//   1. Formantes deformados. Cada 10 ms se estima la envolvente espectral de la voz (predicción lineal de orden 32 sobre 30 ms, con
//      preénfasis; Levinson-Durbin),
//      se separa el residuo (lo que queda al quitar esa envolvente: el pulso de las cuerdas vocales, con el tono) y se vuelve a
//      sintetizar con la envolvente deformada en frecuencia (sustitución bilineal z⁻¹ → (z⁻¹ − α)/(1 − α·z⁻¹), un paso-todo de primer
//      orden): los formantes se mueven de forma no uniforme, el tono no. Un cambio de tono simple (una «cinta más lenta») se deshace en
//      segundos; este no se deshace con un remuestreo.
//   2. Tono. Línea de retardo con dos lecturas en contrafase (ventanas seno², suma constante) sobre ~40 ms: más grave o más agudo sin
//      cambiar la velocidad del habla. (El mismo mecanismo que voz.js.)
//   3. Paso banda de 300 a 3000 Hz (Butterworth de cuarto orden, dos biquad por lado): fuera lo que delata el timbre por debajo y
//      por encima.
// Los parámetros (α y la proporción de tono) los elige llamada.js al azar en cada llamada y no viajan a ningún sitio.
//
// Lo que no hace, dicho sin rodeos: no oculta el acento, el vocabulario, las muletillas ni el ritmo, y no engaña a un sistema de
// reconocimiento de voz entrenado para ello. Dificulta que alguien que no sabe qué filtro se usa te reconozca de oído.
'use strict';
(function (raiz) {
  const ORDEN = 32; // orden de la predicción lineal a 48 kHz (medido en pruebas/voz-ultra.js: con 24, parte del formante original se colaba)
  // Autocorrelación → coeficientes de predicción a[1..p] (e[n] = x[n] + Σ a_k·x[n−k]); Levinson-Durbin. Devuelve null si la trama es
  // silencio o el sistema está mal condicionado.
  function levinson(r, p, ruido) {
    if (!(r[0] > 1e-12)) return null; // silencio
    const a = new Float64Array(p + 1), tmp = new Float64Array(p + 1); a[0] = 1;
    let err = r[0] * (ruido || 1.0001); // un pelín de ruido blanco (lag window) para que no explote con señales muy limpias
    for (let i = 1; i <= p; i++) {
      let acc = r[i]; for (let j = 1; j < i; j++) acc += a[j] * r[i - j];
      const k = -acc / err; if (!(Math.abs(k) < 1)) return null;
      for (let j = 1; j < i; j++) tmp[j] = a[j] + k * a[i - j];
      for (let j = 1; j < i; j++) a[j] = tmp[j];
      a[i] = k; err *= (1 - k * k); if (!(err > r[0] * 1e-9)) return null; // (umbral relativo: vale para voces muy bajas)
    }
    return a;
  }
  // multiplicación de polinomios (coeficientes de z⁰, z⁻¹, …)
  function mul(p, q) { const o = new Float64Array(p.length + q.length - 1); for (let i = 0; i < p.length; i++) for (let j = 0; j < q.length; j++) o[i + j] += p[i] * q[j]; return o; }
  // A(z) = Σ a_k z⁻ᵏ deformado con z⁻¹ → (z⁻¹ − α)/(1 − α z⁻¹): el filtro de síntesis 1/Ã(z) queda como (1 − α z⁻¹)ᵖ / N(z), con
  // N(z) = Σ a_k (z⁻¹ − α)ᵏ (1 − α z⁻¹)ᵖ⁻ᵏ, normalizado para que N₀ = 1. Devuelve { num, den } (den[0] = 1).
  function deforma(a, alfa, p) {
    const base = [new Float64Array([1])], menos = [new Float64Array([1])];
    const d = new Float64Array([-alfa, 1]), u = new Float64Array([1, -alfa]); // (z⁻¹ − α) y (1 − α z⁻¹)
    for (let k = 1; k <= p; k++) { base.push(mul(base[k - 1], d)); menos.push(mul(menos[k - 1], u)); }
    const N = new Float64Array(p + 1);
    for (let k = 0; k <= p; k++) { const t = mul(base[k], menos[p - k]); for (let i = 0; i <= p; i++) N[i] += a[k] * t[i]; }
    const n0 = N[0]; if (!(Math.abs(n0) > 1e-9)) return null;
    const den = new Float64Array(p + 1), num = new Float64Array(p + 1);
    for (let i = 0; i <= p; i++) { den[i] = N[i] / n0; num[i] = menos[p][i] / n0; }
    return { num, den };
  }
  // biquad Butterworth (Q = 1/√2) paso alto o paso bajo
  function biquad(tipo, fc, fs) {
    const w = 2 * Math.PI * fc / fs, c = Math.cos(w), s = Math.sin(w), al = s / Math.SQRT2;
    let b0, b1, b2; const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
    if (tipo === 'alto') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; } else { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
  }
  function filtra(f, x) { const y = f.b0 * x + f.b1 * f.x1 + f.b2 * f.x2 - f.a1 * f.y1 - f.a2 * f.y2; f.x2 = f.x1; f.x1 = x; f.y2 = f.y1; f.y1 = y; return y; }

  // El motor, independiente del AudioWorklet (así se prueba en Node con señales sintéticas): procesa muestras una a una.
  function Motor(fs, opc) {
    opc = opc || {};
    const p = opc.orden || ORDEN, VENT = Math.round(fs * (opc.ventana || 0.03)), SALTO = Math.round(fs * 0.01); // 30 ms de ventana, 10 ms de salto
    const RUIDO = opc.ruido || 1.00001;
    const hann = new Float64Array(VENT); for (let i = 0; i < VENT; i++) hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / VENT);
    const hist = new Float64Array(VENT), xh = new Float64Array(p + 1), eh = new Float64Array(p + 1), yh = new Float64Array(p + 1);
    let n = 0, a = null, w = null, ganancia = 1, eIn = 1e-6, eOut = 1e-6, pre = 0, des = 0;
    const PRE = 0.95; // preénfasis (y su inverso a la salida): aplana la pendiente del espectro y la predicción modela mejor los formantes altos
    // tono: línea de retardo con dos lecturas (voz.js)
    const N = 8192, buf = new Float32Array(N); let wi = 0, fase = 0; const W = Math.round(fs * 0.04);
    const lee = (d) => { let r = wi - d - 1; while (r < 0) r += N; const r0 = Math.floor(r), f = r - r0; const x0 = buf[r0 % N], x1 = buf[(r0 + 1) % N]; return x0 + (x1 - x0) * f; };
    // paso banda de cuarto orden: dos biquad en cascada por cada lado
    const pa = [biquad('alto', 300, fs), biquad('alto', 300, fs)], pb = [biquad('bajo', 3000, fs), biquad('bajo', 3000, fs)];
    const m = { alfa: 0, tono: 1, banda: true };
    m.analiza = () => {
      // autocorrelación de la ventana de los últimos 20 ms
      const r = new Float64Array(p + 1), x = new Float64Array(VENT);
      for (let i = 0; i < VENT; i++) x[i] = hist[(n + i) % VENT] * hann[i];
      for (let k = 0; k <= p; k++) { let s = 0; for (let i = k; i < VENT; i++) s += x[i] * x[i - k]; r[k] = s; }
      const nueva = levinson(r, p, RUIDO);
      if (!nueva) return;
      a = nueva; w = m.alfa ? deforma(a, m.alfa, p) : null;
    };
    m.muestra = (x0) => {
      const x = x0 - PRE * pre; pre = x0; // preenfatizada: sobre esta se analiza y se filtra
      hist[n % VENT] = x; n++;
      if (n % SALTO === 0) m.analiza();
      let y = x0;
      if (a && w) {
        // residuo e = x + Σ a_k x[n−k]; síntesis y = Σ num_k e[n−k] − Σ den_k y[n−k] (k ≥ 1)
        for (let k = p; k > 0; k--) xh[k] = xh[k - 1]; xh[0] = x;
        let e = x; for (let k = 1; k <= p; k++) e += a[k] * xh[k];
        for (let k = p; k > 0; k--) eh[k] = eh[k - 1]; eh[0] = e;
        // (yh[k−1] = y[n−k]: la salida anterior está en yh[0] hasta que se desplaza, abajo)
        let s = 0; for (let k = 0; k <= p; k++) s += w.num[k] * eh[k]; for (let k = 1; k <= p; k++) s -= w.den[k] * yh[k - 1];
        if (!isFinite(s) || Math.abs(s) > 1e3) { s = 0; yh.fill(0); eh.fill(0); } // nunca un estallido: se reinicia el filtro
        for (let k = p; k > 0; k--) yh[k] = yh[k - 1]; yh[0] = s;
        // ganancia: la energía de salida sigue a la de entrada (promedio móvil de ~50 ms), sin saltos
        eIn += (x * x - eIn) * 0.0004; eOut += (s * s - eOut) * 0.0004;
        const g = Math.min(4, Math.sqrt((eIn + 1e-9) / (eOut + 1e-9))); ganancia += (g - ganancia) * 0.002;
        des = s * ganancia + PRE * des; y = des; // deénfasis
        if (!isFinite(y) || Math.abs(y) > 1e3) { des = 0; y = 0; }
      }
      // tono
      buf[wi] = y;
      const k = m.tono;
      if (k !== 1) {
        fase += 1 - k; if (fase >= W) fase -= W; else if (fase < 0) fase += W;
        const d1 = fase, d2 = (fase + W / 2) % W, s1 = Math.sin(Math.PI * d1 / W), s2 = Math.sin(Math.PI * d2 / W);
        y = lee(d1) * s1 * s1 + lee(d2) * s2 * s2;
      }
      wi = (wi + 1) % N;
      if (m.banda) y = filtra(pb[1], filtra(pb[0], filtra(pa[1], filtra(pa[0], y))));
      return y;
    };
    m.activo = () => !!(a && w); // (pruebas)
    return m;
  }

  if (typeof AudioWorkletProcessor === 'function') {
    class GuardianaVozUltra extends AudioWorkletProcessor {
      static get parameterDescriptors() {
        return [
          { name: 'alfa', defaultValue: 0, minValue: -0.5, maxValue: 0.5, automationRate: 'k-rate' },
          { name: 'tono', defaultValue: 1, minValue: 0.5, maxValue: 2, automationRate: 'k-rate' },
          { name: 'banda', defaultValue: 1, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
        ];
      }
      constructor() { super(); this.m = Motor(sampleRate); }
      process(entradas, salidas, p) {
        const ent = entradas[0] && entradas[0][0], sal = salidas[0] && salidas[0][0];
        if (!sal) return true;
        if (!ent) { sal.fill(0); return true; }
        this.m.alfa = p.alfa[0]; this.m.tono = p.tono[0]; this.m.banda = p.banda[0] >= 0.5;
        for (let i = 0; i < ent.length; i++) sal[i] = this.m.muestra(ent[i]);
        for (let c = 1; c < salidas[0].length; c++) salidas[0][c].set(sal);
        return true;
      }
    }
    registerProcessor('guardiana-voz-ultra', GuardianaVozUltra);
  }
  if (raiz) raiz.GuardianaVozUltraMotor = Motor; // para las pruebas (Node)
})(typeof module !== 'undefined' && module.exports ? module.exports : (typeof globalThis !== 'undefined' && typeof AudioWorkletProcessor !== 'function' ? globalThis : null));
