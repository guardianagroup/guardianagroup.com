// Los idiomas de Comunicaciones (dueño, 29 Oct 2026, 11:13: «los 42 idiomas»): en cada idioma abierto por data-idiomas, la
// pantalla de inicio, «¿Cómo funciona?» y «¿Por qué?» no dejan nada en español, y el idioma se elige solo por el del teléfono.
// Usage: node idiomas.js <outdir> [codigo…]
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const PEDIDOS = process.argv.slice(3);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
// frases centinela en español: si alguna sigue en pantalla, ese idioma no está entero
const CENTINELAS = ['¿Cómo funciona?', 'Dos modos', 'Qué hace por ti', 'Cómo protege', 'Sin registro y sin instalar', 'Mensajes, llamadas, videollamadas y archivos', 'Invitar a chat', 'Tus datos, bajo tu control', 'Encriptación de categoría gubernamental', 'Criptografía postcuántica', 'Dos tipos de chat', 'Sin registro', 'Sin instalar nada', 'Lo que no hace', 'Por eso', '¿Sabías que', 'Ver los datos', 'Nada se muestra solo', 'nada se muestra solo', 'Si detecta un ataque', 'Archivos «todo o nada»', 'El número de la llamada'];
const LOCALES = { ar: 'ar-SA', bg: 'bg-BG', bn: 'bn-BD', cs: 'cs-CZ', da: 'da-DK', de: 'de-DE', el: 'el-GR', en: 'en-US', es: 'es-ES', fa: 'fa-IR', fi: 'fi-FI', fil: 'fil-PH', fr: 'fr-FR', he: 'he-IL', hi: 'hi-IN', hr: 'hr-HR', hu: 'hu-HU', id: 'id-ID', is: 'is-IS', it: 'it-IT', ja: 'ja-JP', ko: 'ko-KR', ms: 'ms-MY', nb: 'nb-NO', nl: 'nl-NL', pl: 'pl-PL', pt: 'pt-BR', 'pt-pt': 'pt-PT', ro: 'ro-RO', ru: 'ru-RU', sk: 'sk-SK', sv: 'sv-SE', sw: 'sw-KE', ta: 'ta-IN', te: 'te-IN', th: 'th-TH', tr: 'tr-TR', uk: 'uk-UA', ur: 'ur-PK', vi: 'vi-VN', zh: 'zh-CN', 'zh-tw': 'zh-TW' };

(async () => {
  const html = fs.readFileSync(path.join(__dirname, '..', '..', 'orbita', 'comunicaciones', 'index.html'), 'utf8');
  const m = /data-idiomas="([^"]+)"/.exec(html); const lista = m && m[1] === 'todos' ? Object.keys(LOCALES) : (m ? m[1].split(/\s+/) : ['es']);
  const codigos = PEDIDOS.length ? PEDIDOS : lista.filter((c) => c !== 'es');
  console.log('     idiomas abiertos:', lista.length, '· se prueban:', codigos.join(' '));
  const browser = await chromium.launch();
  for (const code of codigos) {
    const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: LOCALES[code] || code });
    await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
    const p = await ctx.newPage(); const errores = [];
    p.on('pageerror', (e) => errores.push(String(e).slice(0, 120)));
    await p.goto('http://127.0.0.1:8080/orbita/comunicaciones/'); await espera(2200);
    const lang = await p.evaluate(() => document.documentElement.lang);
    const textoInicio = await p.evaluate(() => document.querySelector('#inicio').textContent);
    await p.click('#ver-como'); await espera(500);
    const textoComo = await p.evaluate(() => document.querySelector('#como').textContent);
    await p.screenshot({ path: path.join(OUT, 'idioma-' + code + '-como.png'), clip: { x: 0, y: 0, width: 393, height: 793 } });
    await p.click('#como-porque'); await espera(600);
    const textoPorque = await p.evaluate(() => document.querySelector('#porque').textContent);
    await p.screenshot({ path: path.join(OUT, 'idioma-' + code + '-porque.png') });
    const todo = textoInicio + '\n' + textoComo + '\n' + textoPorque;
    // lo que falta en un idioma cae al inglés: en los demás idiomas tampoco puede quedar inglés
    const EN = ['Two modes', 'What it does for you', 'How it protects', 'No sign-up and nothing to install', 'What it does not do', 'Invite to chat', 'How does it work?', 'Your data, under your control'];
    const quedan = CENTINELAS.filter((f) => todo.includes(f)).concat(code === 'en' ? [] : EN.filter((f) => todo.includes(f)));
    comprueba(lang.toLowerCase().startsWith(code.split('-')[0]) && !quedan.length && !errores.length, code + ': lang=' + lang + (quedan.length ? ' · en español: ' + quedan.join(' | ') : '') + (errores.length ? ' · errores: ' + errores[0] : ''));
    await ctx.close();
  }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
