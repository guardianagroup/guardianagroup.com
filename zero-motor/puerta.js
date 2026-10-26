// ZERO · PUERTA IA (26 Oct 2026; ronda 40, punto 9: ChatGPT y Astra; dueño: «que la gente use su IA dentro de GUARDIANA»).
//
// Modalidad «envío protegido»: la persona escribe en el compositor de GUARDIANA (nunca en la caja de la web del
// proveedor, donde la web lee el texto antes del botón «enviar»); ZERO sustituye los datos personales por marcadores
// ([CORREO-1], [TELÉFONO-1], [NOMBRE-1]…) antes de que el texto salga de la celda, lo manda por la API oficial del
// proveedor y restaura los marcadores en la respuesta. El proveedor recibe el texto con marcadores; el mapa marcador →
// dato no sale nunca. Lo que no se promete (ronda 40): anonimato si la persona ha iniciado sesión con su cuenta, ni
// control de lo que el proveedor haga con lo que recibe; sí se dice exactamente qué se sustituyó.
'use strict';
const crypto = require('crypto');

// Detectores deterministas. Cada uno devuelve [{inicio, fin, tipo}]; se resuelven solapes dejando el más largo.
const DETECTORES = [
  ['CORREO', /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g],
  ['IBAN', /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){3,7}(?:[ ]?[A-Z0-9]{1,4})?\b/g],
  ['TARJETA', /\b(?:\d[ -]?){13,19}\b/g],
  ['TELÉFONO', /(?:\+\d{1,3}[ .-]?)?(?:\(\d{1,4}\)[ .-]?)?\d{2,4}(?:[ .-]?\d{2,4}){2,4}\b/g],
  ['DOCUMENTO', /\b(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z]|\d{6,10})\b/g],
  ['DIRECCIÓN', /\b(?:calle|avenida|avda\.?|av\.?|carrera|cra\.?|cl\.?|paseo|plaza|camino|carretera|rua|rue|street|st\.|road|rd\.)\s+[^,.\n]{3,60}?\s+(?:n[ºo°.]?\s*)?\d{1,5}\b[^,.\n]{0,30}/gi],
  ['FECHA', /\b(?:[0-3]?\d[\/.-][01]?\d[\/.-](?:19|20)\d{2})\b/g],
  ['WEB', /\bhttps?:\/\/[^\s)]+/g],
];

const RE_PRESENTACION = /\b(?:me llamo|mi nombre es|soy|my name is|i am|chamo-me|meu nome é)\s+([A-ZÁÉÍÓÚÑ][\wáéíóúñü'-]+(?:\s+(?:de|del|la|los|das|dos|van|von)?\s*[A-ZÁÉÍÓÚÑ][\wáéíóúñü'-]+){0,3})/g;

function escapaRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Sustituye los datos personales de `texto`. misDatos: {nombre, apellidos, ciudad, empresa, otros:[…]} (lo que la persona
 *  quiera que nunca salga). Devuelve { texto, mapa: {marcador: original}, lista: [{tipo, marcador}] }. */
function sustituye(texto, misDatos) {
  texto = String(texto || '');
  const tramos = [];
  for (const [tipo, re] of DETECTORES) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(texto))) {
      if (tipo === 'TELÉFONO') { const nd = m[0].replace(/\D/g, '').length; if (nd < 9 || nd > 15) continue; }
      if (tipo === 'TARJETA' && !luhn(m[0])) continue;
      if (tipo === 'DOCUMENTO' && /^\d{6,10}$/.test(m[0]) && !/\b(?:dni|nie|cédula|cedula|pasaporte|documento|id)\b/i.test(texto.slice(Math.max(0, m.index - 40), m.index))) continue;
      tramos.push({ inicio: m.index, fin: m.index + m[0].length, tipo, valor: m[0] });
    }
  }
  let m2;
  RE_PRESENTACION.lastIndex = 0;
  while ((m2 = RE_PRESENTACION.exec(texto))) { const i = m2.index + m2[0].length - m2[1].length; tramos.push({ inicio: i, fin: i + m2[1].length, tipo: 'NOMBRE', valor: m2[1] }); }
  const propios = [];
  if (misDatos && typeof misDatos === 'object') {
    for (const [k, v] of Object.entries(misDatos)) {
      const vals = Array.isArray(v) ? v : [v];
      for (const x of vals) { const s = String(x || '').trim(); if (s.length >= 3) propios.push([k === 'nombre' || k === 'apellidos' ? 'NOMBRE' : k === 'ciudad' ? 'LUGAR' : k === 'empresa' ? 'EMPRESA' : 'DATO', s]); }
    }
  }
  for (const [tipo, s] of propios) {
    const re = new RegExp('(?<![\\wáéíóúñ])' + escapaRe(s) + '(?![\\wáéíóúñ])', 'gi'); let m;
    while ((m = re.exec(texto))) tramos.push({ inicio: m.index, fin: m.index + m[0].length, tipo, valor: m[0] });
  }
  // solapes: gana el tramo más largo
  tramos.sort((a, b) => a.inicio - b.inicio || (b.fin - b.inicio) - (a.fin - a.inicio));
  const elegidos = []; let ultimoFin = -1;
  for (const t of tramos) { if (t.inicio < ultimoFin) continue; elegidos.push(t); ultimoFin = t.fin; }
  // marcadores estables: el mismo dato → el mismo marcador
  const porValor = new Map(); const cuenta = {}; const mapa = {}; const lista = [];
  let out = ''; let pos = 0;
  for (const t of elegidos) {
    const clave = t.tipo + '|' + t.valor.toLowerCase();
    let marcador = porValor.get(clave);
    if (!marcador) { cuenta[t.tipo] = (cuenta[t.tipo] || 0) + 1; marcador = '[' + t.tipo + '-' + cuenta[t.tipo] + ']'; porValor.set(clave, marcador); mapa[marcador] = t.valor; lista.push({ tipo: t.tipo, marcador }); }
    out += texto.slice(pos, t.inicio) + marcador; pos = t.fin;
  }
  out += texto.slice(pos);
  return { texto: out, mapa, lista };
}

function luhn(s) {
  const d = s.replace(/\D/g, ''); if (d.length < 13) return false;
  let sum = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) { let n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; }
  return sum % 10 === 0;
}

/** Devuelve los marcadores a su valor en la respuesta del proveedor. */
function restaura(texto, mapa) {
  let out = String(texto || '');
  for (const [marcador, valor] of Object.entries(mapa || {})) out = out.split(marcador).join(valor);
  return out;
}

// Proveedores: API oficial, con la clave que la persona o GUARDIANA configure en el motor (variables de entorno; nunca
// en la página). Sin clave o en modo de pruebas, un simulacro que devuelve el texto recibido (sirve para ver qué llegó).
const PROVEEDORES = {
  openai: { nombre: 'ChatGPT (OpenAI)', url: 'https://api.openai.com/v1/chat/completions', clave: 'ZERO_OPENAI_KEY', modelo: 'gpt-4o-mini' },
  gemini: { nombre: 'Gemini (Google)', url: null, clave: 'ZERO_GEMINI_KEY', modelo: 'gemini-2.0-flash' },
  anthropic: { nombre: 'Claude (Anthropic)', url: 'https://api.anthropic.com/v1/messages', clave: 'ZERO_ANTHROPIC_KEY', modelo: 'claude-3-5-haiku-latest' },
  compatible: { nombre: 'API compatible con OpenAI', url: process.env.ZERO_COMPAT_URL || null, clave: 'ZERO_COMPAT_KEY', modelo: process.env.ZERO_COMPAT_MODEL || 'gpt-4o-mini' },
};

async function envia(proveedor, mensajes, opciones) {
  const p = PROVEEDORES[proveedor] || PROVEEDORES.openai;
  const clave = process.env[p.clave];
  if (!clave || !p.url || (opciones && opciones.simulacro)) {
    return { texto: 'Simulacro: el motor no tiene clave para ' + p.nombre + ', así que no se ha enviado nada. Lo que habría salido es el texto con marcadores de la izquierda.', simulacro: true, proveedor: p.nombre, modelo: p.modelo };
  }
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 60000);
  try {
    let r, j, texto;
    if (proveedor === 'anthropic') {
      r = await fetch(p.url, { method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json', 'x-api-key': clave, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: p.modelo, max_tokens: 1024, system: mensajes.filter((m) => m.role === 'system').map((m) => m.content).join('\n'), messages: mensajes.filter((m) => m.role !== 'system') }) });
      j = await r.json(); texto = (j.content || []).map((c) => c.text || '').join('');
    } else {
      r = await fetch(p.url, { method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + clave }, body: JSON.stringify({ model: p.modelo, messages: mensajes }) });
      j = await r.json(); texto = (((j.choices || [])[0] || {}).message || {}).content || '';
    }
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (j.error && j.error.message || ''));
    return { texto, simulacro: false, proveedor: p.nombre, modelo: p.modelo };
  } finally { clearTimeout(t); }
}

const SISTEMA = 'Responde en el idioma del mensaje. El texto puede contener marcadores como [CORREO-1] o [NOMBRE-2]: son datos personales sustituidos; consérvalos tal cual en tu respuesta cuando te refieras a ellos y no intentes adivinarlos.';

/** Un envío protegido completo. Devuelve lo que la página necesita enseñar. */
async function envioProtegido({ proveedor, texto, misDatos, simulacro }) {
  const s = sustituye(texto, misDatos);
  const mensajes = [{ role: 'system', content: SISTEMA }, { role: 'user', content: s.texto }];
  const t0 = Date.now();
  let r;
  try { r = await envia(proveedor, mensajes, { simulacro }); } catch (e) { r = { texto: '', error: String(e.message || e), proveedor: (PROVEEDORES[proveedor] || PROVEEDORES.openai).nombre }; }
  const respuesta = restaura(r.texto, s.mapa);
  const ref = crypto.createHash('sha256').update(s.texto + '|' + (r.texto || '') + '|' + t0).digest('hex').slice(0, 8).toUpperCase();
  return { enviado: s.texto, respuesta, error: r.error || null, simulacro: !!r.simulacro, proveedor: r.proveedor, modelo: r.modelo || null, sustituidos: s.lista, ms: Date.now() - t0, ref };
}

module.exports = { sustituye, restaura, envia, envioProtegido, PROVEEDORES };
