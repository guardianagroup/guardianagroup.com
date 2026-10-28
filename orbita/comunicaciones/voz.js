// GUARDIANA · Comunicaciones · cambio de voz en las llamadas (27 Oct 2026, dueño: «llamadas de voz con opción de cambio
// de voz, para la sesión blindada y la normal»). Procesador de audio (AudioWorklet) que se ejecuta en el propio
// navegador, antes de encriptar: la voz original no sale del equipo.
//
// Cambio de tono por línea de retardo con dos lecturas en contrafase (ventanas seno², suma constante): el retardo
// recorre una ventana de ~40 ms a ritmo (1 − proporción), así el sonido sale más agudo (proporción > 1) o más grave
// (proporción < 1) sin cambiar la velocidad del habla. «robot» mezcla una modulación en anillo a 55 Hz.
// Lo que no hace: no oculta el acento, las palabras ni la forma de hablar.
'use strict';
class GuardianaVoz extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'proporcion', defaultValue: 1, minValue: 0.5, maxValue: 2, automationRate: 'k-rate' },
      { name: 'robot', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }
  constructor() {
    super();
    this.N = 8192; this.buf = new Float32Array(this.N); this.w = 0;
    this.W = Math.round(sampleRate * 0.04); this.fase = 0; this.osc = 0;
  }
  lee(d) {
    let r = this.w - d - 1; while (r < 0) r += this.N;
    const r0 = Math.floor(r), f = r - r0, a = this.buf[r0 % this.N], b = this.buf[(r0 + 1) % this.N];
    return a + (b - a) * f;
  }
  process(entradas, salidas, p) {
    const ent = entradas[0] && entradas[0][0], sal = salidas[0] && salidas[0][0];
    if (!sal) return true;
    if (!ent) { sal.fill(0); return true; }
    const k = p.proporcion[0], robot = p.robot[0], W = this.W, paso = 2 * Math.PI * 55 / sampleRate;
    for (let i = 0; i < ent.length; i++) {
      this.buf[this.w] = ent[i];
      let y = ent[i];
      if (k !== 1) {
        this.fase += 1 - k; if (this.fase >= W) this.fase -= W; else if (this.fase < 0) this.fase += W;
        const d1 = this.fase, d2 = (this.fase + W / 2) % W;
        const s1 = Math.sin(Math.PI * d1 / W), s2 = Math.sin(Math.PI * d2 / W);
        y = this.lee(d1) * s1 * s1 + this.lee(d2) * s2 * s2;
      }
      if (robot > 0) { this.osc += paso; if (this.osc > 2 * Math.PI) this.osc -= 2 * Math.PI; y = y * (1 - robot) + y * Math.sin(this.osc) * robot * 1.6; }
      sal[i] = y;
      this.w = (this.w + 1) % this.N;
    }
    for (let c = 1; c < salidas[0].length; c++) salidas[0][c].set(sal);
    return true;
  }
}
registerProcessor('guardiana-voz', GuardianaVoz);
