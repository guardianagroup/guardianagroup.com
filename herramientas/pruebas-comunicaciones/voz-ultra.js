// La voz cambiada de Ultra (voz-ultra.js), medida en Node con una voz sintética: un tren de pulsos a 120 Hz (las cuerdas vocales)
// a través de tres resonadores (los formantes, 600, 1200 y 2500 Hz). Comprueba que, tras el filtro: 1) los formantes se mueven a
// las frecuencias que predice la deformación bilineal (y no de forma uniforme); 2) el tono (120 Hz) se conserva; 3) con α = 0 y
// tono 1 la señal sale casi igual; 4) el paso banda deja fuera lo que está por debajo de 300 Hz y por encima de 3000 Hz.
// Uso: node voz-ultra.js
'use strict';
const path = require('path');
const { GuardianaVozUltraMotor: Motor } = require(path.join(__dirname, '..', '..', 'orbita', 'comunicaciones', 'voz-ultra.js'));
const FS = 48000, SEG = 1.2, N = Math.round(FS * SEG), F0 = 120;
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
// resonador de 2.º orden (frecuencia central f, ancho de banda bw)
function resonador(f, bw) { const r = Math.exp(-Math.PI * bw / FS), th = 2 * Math.PI * f / FS; return { a1: -2 * r * Math.cos(th), a2: r * r, y1: 0, y2: 0, g: (1 - r) * Math.sqrt(1 - 2 * r * Math.cos(2 * th) + r * r) }; }
function vocal(formantes) {
  const rs = formantes.map((f) => resonador(f, 80)), x = new Float64Array(N), per = Math.round(FS / F0);
  for (let i = 0; i < N; i++) { let v = i % per === 0 ? 1 : 0; for (const r of rs) { const y = r.g * v - r.a1 * r.y1 - r.a2 * r.y2; r.y2 = r.y1; r.y1 = y; v = y; } x[i] = v; }
  let pico = 0; for (let i = 0; i < N; i++) pico = Math.max(pico, Math.abs(x[i])); for (let i = 0; i < N; i++) x[i] *= 0.3 / pico; // amplitud de una voz normal
  return x;
}
// envolvente espectral: la magnitud de cada armónico del tono (múltiplos de 120 Hz) en la mitad final de la señal (60 periodos
// exactos), suavizada; sus máximos locales entre 200 y 4000 Hz son los formantes
function picos(x, cuantos) {
  const desde = N - 60 * Math.round(FS / F0), L = N - desde, arm = [];
  for (let k = 1; k * F0 <= 4000; k++) { const w = 2 * Math.PI * k * F0 / FS; let re = 0, im = 0; for (let i = desde; i < N; i++) { re += x[i] * Math.cos(w * (i - desde)); im -= x[i] * Math.sin(w * (i - desde)); } arm.push({ f: k * F0, db: 20 * Math.log10(Math.hypot(re, im) / L + 1e-12) }); }
  const suave = arm.map((e, i) => ({ f: e.f, db: (arm[Math.max(0, i - 1)].db + 2 * e.db + arm[Math.min(arm.length - 1, i + 1)].db) / 4 }));
  const out = []; for (let i = 1; i < suave.length - 1; i++) if (suave[i].f > 200 && suave[i].db > suave[i - 1].db && suave[i].db >= suave[i + 1].db) out.push(suave[i]);
  return out.sort((u, v) => v.db - u.db).slice(0, cuantos).map((e) => e.f).sort((u, v) => u - v);
}
// adónde manda la deformación bilineal un formante en f (e^{-jω̃} = (e^{-jω} + α)/(1 + α e^{-jω}))
function mapea(f, alfa) { const w = 2 * Math.PI * f / FS, re = Math.cos(w), im = -Math.sin(w); const nr = re + alfa, ni = im, dr = 1 + alfa * re, di = alfa * im; const qr = (nr * dr + ni * di) / (dr * dr + di * di), qi = (ni * dr - nr * di) / (dr * dr + di * di); return Math.round(Math.abs(Math.atan2(qi, qr)) * FS / (2 * Math.PI)); }
function pasa(x, alfa, tono, banda) { const m = Motor(FS); m.alfa = alfa; m.tono = tono; m.banda = banda; const y = new Float64Array(N); for (let i = 0; i < N; i++) y[i] = m.muestra(x[i]); return y; }
function periodo(x) { const desde = Math.floor(N / 2); let mejor = 0, lag = 0; for (let L = 200; L <= 800; L++) { let s = 0; for (let i = desde + 800; i < N; i++) s += x[i] * x[i - L]; if (s > mejor) { mejor = s; lag = L; } } return lag; }
const rms = (x, desde) => { let s = 0; for (let i = desde; i < N; i++) s += x[i] * x[i]; return Math.sqrt(s / (N - desde)); };

const FORM = [600, 1200, 2500], x = vocal(FORM);
const px = picos(x, 3);
comprueba(px.length === 3 && px.every((f, i) => Math.abs(f - FORM[i]) <= 130), 'la voz sintética tiene sus tres formantes donde toca', px);
// 1) formantes deformados (α = 0,18), sin tono ni paso banda
for (const alfa of [0.18, -0.18]) {
  const y = pasa(x, alfa, 1, false), py = picos(y, 3), esperados = FORM.map((f) => mapea(f, alfa));
  const cerca = py.length === 3 && py.every((f, i) => Math.abs(f - esperados[i]) <= 130);
  comprueba(cerca, 'α = ' + alfa + ': los formantes se mueven adonde dice la deformación', { medidos: py, esperados });
  const razones = py.map((f, i) => f / FORM[i]);
  comprueba(Math.max(...razones) - Math.min(...razones) > 0.05, 'α = ' + alfa + ': el cambio no es uniforme (no es un remuestreo)', razones.map((r) => +r.toFixed(3)));
  comprueba(periodo(y) === Math.round(FS / F0), 'α = ' + alfa + ': el tono se conserva (120 Hz)', periodo(y));
  comprueba(Math.abs(rms(y, N / 2) / rms(x, N / 2) - 1) < 0.5, 'α = ' + alfa + ': la ganancia se mantiene (±50 %)', +(rms(y, N / 2) / rms(x, N / 2)).toFixed(2));
}
// 3) sin deformación: casi la misma señal (con el retardo del tono a 1 no hay cambio)
{ const y = pasa(x, 0, 1, false); let d = 0, s = 0; for (let i = N / 2; i < N; i++) { d += (y[i] - x[i]) ** 2; s += x[i] ** 2; } comprueba(d / s < 1e-6, 'α = 0 y tono 1: la señal sale igual', d / s); }
// 2) tono más grave (0,8) con formantes: el periodo sube a 1/0,8
{ const y = pasa(x, 0.12, 0.8, false); const per = periodo(y); comprueba(Math.abs(per - Math.round(FS / (F0 * 0.8))) <= 6, 'tono 0,8 con α = 0,12: el periodo pasa a 1/0,8', { per, esperado: Math.round(FS / (F0 * 0.8)) }); }
// 4) paso banda: un tono de 150 Hz y otro de 5000 Hz se atenúan; uno de 1000 Hz pasa
for (const [f, debe] of [[150, false], [1000, true], [5000, false]]) {
  const s = new Float64Array(N); for (let i = 0; i < N; i++) s[i] = 0.3 * Math.sin(2 * Math.PI * f * i / FS);
  const y = pasa(s, 0, 1, true), g = rms(y, N / 2) / rms(s, N / 2);
  comprueba(debe ? g > 0.8 : g < 0.25, 'paso banda ' + f + ' Hz: ' + (debe ? 'pasa' : 'se atenúa'), +g.toFixed(3));
}
console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
process.exit(fallos.length ? 1 : 0);
