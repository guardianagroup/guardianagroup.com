/* GUARDIANA · la app instalable (23 Oct 2026). The owner: «que cuando la persona abra la página web en el móvil o en la
   tablet pueda descargarla… que le pregunte… que quede al lado de una aplicación, como si fuera tipo aplicación».
   No store and no APK of ours: the website is an installable web app (manifest + service worker). On Android, Chrome
   installs it with the GUARDIANA icon among the other apps; on iPhone and iPad, Apple allows no automatic offer, so we
   show the two steps (Compartir › Añadir a pantalla de inicio). It asks once, on touch screens, never inside the app
   itself, and never again after «Ahora no». Nothing is sent anywhere. */
(() => {
  'use strict';
  // while the owner tries it, only with ?movil=nuevo or inside the installed app (index.html sets this switch)
  if (!window.__guardianaApp) { window.GuardianaApp = { puede: () => false, instalar() {}, instalada: false }; return; }
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  if ('serviceWorker' in navigator) addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
  const instalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const tactil = matchMedia('(pointer: coarse)').matches;
  const guarda = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
  const lee = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  let oferta = null; // the browser's own install offer (Chrome and Edge on Android, Windows, Mac, Linux)
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); oferta = e; botonPC(); });
  addEventListener('appinstalled', () => { oferta = null; guarda('guardiana-app', 'instalada'); cierra(); botonPC(); });
  const puede = () => !instalada() && (!!oferta || ios);

  let caja = null;
  const SVG_COMPARTIR = '<svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 10V1.8M5.2 4.4 8 1.6l2.8 2.8"/><path d="M5 6.5H3.5v7.5h9V6.5H11"/></svg>';
  function estilo() {
    if (document.getElementById('app-estilo')) return;
    const s = document.createElement('style'); s.id = 'app-estilo';
    s.textContent = '.app-velo{position:fixed;inset:0;z-index:120;background:rgba(4,6,9,.55)}'
      + '.app-hoja{position:fixed;z-index:121;left:0;right:0;bottom:0;margin-inline:auto;width:min(560px,100%);box-sizing:border-box;padding:22px max(20px,env(safe-area-inset-right,0px)) calc(20px + env(safe-area-inset-bottom,0px)) max(20px,env(safe-area-inset-left,0px));border-radius:22px 22px 0 0;border-top:1px solid #2A3442;background:#0B0F15;color:#E8ECF1;font-family:var(--texto,system-ui,sans-serif);box-shadow:0 -24px 60px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:14px}'
      + '.app-hoja .cab{display:flex;align-items:center;gap:14px}.app-hoja .cab img{width:56px;height:56px;border-radius:14px;flex:none}'
      + '.app-hoja h2{margin:0;font:400 26px/1.1 var(--display,Georgia,serif)}.app-hoja p{margin:0;font-size:15.5px;line-height:1.5;color:#B4BEC9}'
      + '.app-hoja ol{margin:0;padding:0 0 0 22px;display:flex;flex-direction:column;gap:10px;font-size:16px;line-height:1.45}.app-hoja ol svg{vertical-align:-4px;color:#9CC3E4}'
      + '.app-hoja .bt{display:flex;gap:10px;flex-wrap:wrap}.app-hoja button{all:unset;box-sizing:border-box;min-height:52px;padding:0 22px;border-radius:999px;font:600 16px/1 var(--texto,system-ui,sans-serif);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:1}'
      + '.app-hoja .si{background:#9CC3E4;color:#06080C}.app-hoja .no{border:1px solid #2A3442;color:#E8ECF1;font-weight:500}'
      + '.app-hoja button:focus-visible{outline:2px solid #9CC3E4;outline-offset:2px}';
    document.head.appendChild(s);
  }
  function cierra() { if (!caja) return; caja.forEach((e) => e.remove()); caja = null; }
  function abre(guia) {
    cierra(); estilo();
    const velo = document.createElement('div'); velo.className = 'app-velo';
    const h = document.createElement('section'); h.className = 'app-hoja'; h.setAttribute('role', 'dialog'); h.setAttribute('aria-modal', 'true'); h.setAttribute('aria-labelledby', 'app-t');
    const pasos = guia
      ? '<ol><li>' + T('Toca «Compartir»') + ' ' + SVG_COMPARTIR + ' ' + T('en la barra del navegador.') + '</li><li>' + T('Elige «Añadir a pantalla de inicio».') + '</li></ol>'
      : '';
    h.innerHTML = '<div class="cab"><img src="/icon-192.png" alt=""><h2 id="app-t"></h2></div><p class="tx"></p>' + pasos + '<div class="bt"><button type="button" class="no"></button><button type="button" class="si"></button></div>';
    h.querySelector('h2').textContent = T('GUARDIANA en tu pantalla de inicio');
    h.querySelector('.tx').textContent = T('Ábrela como una app: con un toque y a pantalla completa, sin pasar por el navegador.');
    const si = h.querySelector('.si'), no = h.querySelector('.no');
    no.textContent = T('Ahora no');
    si.textContent = guia ? T('Entendido') : T('Instalar');
    no.addEventListener('click', () => { guarda('guardiana-app-preguntado', '1'); cierra(); });
    si.addEventListener('click', async () => {
      guarda('guardiana-app-preguntado', '1');
      if (guia || !oferta) { cierra(); return; }
      const o = oferta; oferta = null; cierra();
      try { o.prompt(); await o.userChoice; } catch (_) {}
    });
    velo.addEventListener('click', () => { guarda('guardiana-app-preguntado', '1'); cierra(); });
    document.body.append(velo, h); caja = [velo, h];
    setTimeout(() => si.focus({ preventScroll: true }), 50);
  }
  function instalar() { if (instalada()) return; if (oferta) abre(false); else if (ios) abre(true); }
  // on a computer (owner, 21:25: «¿podemos hacer que la página web se instale en el escritorio de Windows?»): a quiet
  // «Instalar app» in the header, only when the browser can install it; it opens the same short sheet
  let bPC = null;
  function botonPC() {
    const der = document.querySelector('header .derecha'), ver = !!oferta && !instalada() && !document.body.classList.contains('m2');
    if (!ver) { if (bPC) { bPC.remove(); bPC = null; } return; }
    if (bPC || !der) return;
    bPC = document.createElement('button'); bPC.type = 'button'; bPC.className = 'lugar-btn instalar-btn';
    bPC.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2.5v7M5 6.8 8 9.8l3-3"/><path d="M2.5 11.5v1.8h11v-1.8"/></svg><span></span>';
    bPC.querySelector('span').textContent = T('Instalar app');
    bPC.addEventListener('click', instalar);
    der.appendChild(bPC);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && caja) cierra(); });
  // once, on a touch screen, after a while on the page: never inside the app, never after «Ahora no»
  if (tactil && !instalada() && !lee('guardiana-app-preguntado') && lee('guardiana-app') !== 'instalada') {
    setTimeout(() => {
      const ocupado = () => caja || instalada() || /\b(dentro|viaje|en-espejo|con-conexion|con-ficha|con-informe|m2-hoja-abierta)\b/.test(document.body.className) || document.querySelector('.radio-panel:not([hidden])');
      let intentos = 0;
      const prueba = () => { if (instalada() || lee('guardiana-app-preguntado')) return; if (ocupado()) { if (++intentos < 12) setTimeout(prueba, 10000); return; } // never over something the person opened; tried again later
        if (oferta) abre(false); else if (ios) abre(true); };
      prueba();
    }, 30000);
  }
  window.GuardianaApp = { puede, instalar, get instalada() { return instalada(); } };
})();
