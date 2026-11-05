// Core Web Vitals en local con Playwright (sustituto de Lighthouse: el registro de npm está bloqueado por el proxy).
// Mide, en Chromium de escritorio 1350×940, TTFB, FCP, LCP (y qué elemento es), CLS, TBT (tareas largas), peso y peticiones.
// Uso: node cwv.js [lento]   → «lento»: CPU ×4 y red «Fast 3G»-ish (1,6 Mb/s bajada, 150 ms RTT), como el perfil móvil de Lighthouse.
'use strict';
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8090';
const LENTO = process.argv[2] === 'lento';
const PAGINAS = (process.env.PAGS || '/,/instalar.html,/orbita/,/zero.html,/como-funciona.html,/casos.html,/en/index.html,/pt/index.html,/en/cases.html,/pt/casos.html,/radiografias/').split(',');
const UA_PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const INIT = `
(() => {
  window.__cwv = { lcp: 0, lcpEl: '', cls: 0, fcp: 0, tbt: 0, longTasks: 0, shifts: [] };
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__cwv.lcp = e.startTime; const el = e.element; window.__cwv.lcpEl = el ? (el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '') + ' ' + (el.src || el.currentSrc || (el.textContent || '').trim().slice(0, 40))) : '?'; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__cwv.cls += e.value; if (e.value > 0.01) window.__cwv.shifts.push([Math.round(e.startTime), +e.value.toFixed(4), (e.sources || []).map(s => s.node && s.node.tagName ? s.node.tagName + (s.node.id ? '#' + s.node.id : '') + (s.node.className && typeof s.node.className === 'string' ? '.' + s.node.className.split(' ')[0] : '') : '?').join(',')]); } } }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.name === 'first-contentful-paint') window.__cwv.fcp = e.startTime; } }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__cwv.longTasks++; window.__cwv.tbt += Math.max(0, e.duration - 50); } }).observe({ type: 'longtask', buffered: true });
  } catch (e) { window.__cwv.error = String(e); }
})();`;

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  console.log(`modo: ${LENTO ? 'LENTO (CPU ×4, red 1,6 Mb/s · 150 ms)' : 'normal (sin limitación)'}`);
  console.log('página'.padEnd(22), 'TTFB', 'FCP', 'LCP', 'CLS', 'TBT', 'tareas', 'KB', 'peticiones', 'nodos', 'LCP elemento');
  for (const p of PAGINAS) {
    const ctx = await browser.newContext({ userAgent: UA_PC, viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (LENTO) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    }
    let bytes = 0, n = 0;
    cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength || 0; n++; });
    await page.addInitScript(INIT);
    let r = {};
    try {
      await page.goto(BASE + p, { waitUntil: 'load', timeout: 90000 });
      await page.waitForTimeout(LENTO ? 6000 : 4000);
      // un desplazamiento pequeño para cerrar la ventana de LCP, como hace Lighthouse
      await page.mouse.wheel(0, 1); await page.waitForTimeout(300);
      r = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] || {};
        return Object.assign({}, window.__cwv, { ttfb: nav.responseStart || 0, nodos: document.getElementsByTagName('*').length, url: location.pathname + location.search });
      });
    } catch (e) { r = { error: e.message.slice(0, 80) }; }
    const f = (x) => (x == null ? '-' : Math.round(x)).toString();
    console.log(p.padEnd(22), f(r.ttfb).padEnd(4), f(r.fcp).padEnd(4), f(r.lcp).padEnd(5), (r.cls == null ? '-' : r.cls.toFixed(3)).padEnd(5), f(r.tbt).padEnd(4), String(r.longTasks ?? '-').padEnd(6), String(Math.round(bytes / 1024)).padEnd(6), String(n).padEnd(10), String(r.nodos ?? '-').padEnd(5), (r.lcpEl || r.error || '').slice(0, 70), r.url && r.url !== p ? ' (→ ' + r.url + ')' : '');
    if (r.shifts && r.shifts.length) console.log('   desplazamientos >0.01:', JSON.stringify(r.shifts.slice(0, 6)));
    await ctx.close();
  }
  await browser.close();
})();
