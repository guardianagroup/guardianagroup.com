// GUARDIANA · Comunicaciones · «¿Sabías que…?» (27 Oct 2026). Dueño, 13:24: «abajo a la derecha, un apartado como el
// ¿Sabías que…? de Órbita, pero en Comunicaciones: espionaje en chats, suplantaciones de identidad, cuánto dinero se roba,
// robo de conversaciones». Los datos son de la ronda 57 de la agencia (/orbita/datos/sabias-comunicaciones.json): cada uno
// con dos voces y dos fuentes públicas; en pantalla, «Datos verificados». Solo se ve en la pantalla de inicio, con los dos
// botones grandes: al crear o escribir un código, al abrir «Cómo funciona» o en una conversación se oculta.
'use strict';
(() => {
  const ini = document.getElementById('inicio'), paso = document.getElementById('paso-inicio'), pro = document.getElementById('pro');
  if (!ini || !paso) return;
  const reducir = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const lengua = () => { const l = (window.GuardianaIdioma && window.GuardianaIdioma.lang) || document.documentElement.lang || 'es'; return /^es/.test(l) ? 'es' : /^pt/.test(l) ? 'pt' : 'en'; };
  const PASO = 11000;
  let D = null, i = 0, reloj = 0, quieto = false;
  const a = document.createElement('aside');
  a.className = 'sabias-com'; a.id = 'sabias-com'; a.hidden = true; a.setAttribute('translate', 'no');
  a.innerHTML = '<p class="sc-k"><span class="sc-punto" aria-hidden="true"></span><span class="sc-kt"></span></p><p class="sc-cifra"></p><p class="sc-t" aria-live="polite"></p>'
    + '<div class="sc-pie"><span class="sc-v"></span><span class="sc-nav"><button type="button" class="sc-b sc-ant"><span aria-hidden="true">‹</span></button>'
    + '<span class="sc-n"></span><button type="button" class="sc-b sc-sig"><span aria-hidden="true">›</span></button></span></div>';
  ini.append(a);
  const $ = (s) => a.querySelector(s);
  function pon() {
    const l = lengua(), U = D.ui[l] || D.ui.en, x = D.sabias[i], c = (x.cifra && x.cifra[l]) || '';
    $('.sc-kt').textContent = U.k;
    const ce = $('.sc-cifra'); ce.textContent = c; ce.hidden = !c; ce.dataset.tema = x.tema;
    $('.sc-t').textContent = (x[l] || x.en || x.es).replace(/\s*\?\s*$/, '.');
    $('.sc-v').textContent = U.v;
    $('.sc-n').textContent = (i + 1) + ' / ' + D.sabias.length;
    $('.sc-ant').setAttribute('aria-label', U.ant); $('.sc-sig').setAttribute('aria-label', U.sig);
    a.setAttribute('aria-label', U.k);
  }
  function pinta(anima) {
    if (!anima || reducir) { pon(); return; }
    a.classList.add('sc-cambia'); setTimeout(() => { pon(); a.classList.remove('sc-cambia'); }, 220);
  }
  const mueve = (d) => { i = (i + d + D.sabias.length) % D.sabias.length; pinta(true); };
  function para() { clearInterval(reloj); reloj = 0; }
  function arranca() { para(); if (reducir || quieto || a.hidden) return; reloj = setInterval(() => { if (!document.hidden) mueve(1); }, PASO); }
  const visible = () => !ini.hidden && !paso.hidden && (!pro || pro.hidden);
  function revisa() { const v = !!D && visible(); if (a.hidden !== !v) { a.hidden = !v; if (v) arranca(); else para(); } }
  new MutationObserver(revisa).observe(ini, { attributes: true, attributeFilter: ['hidden'], subtree: true });
  a.addEventListener('mouseenter', () => { quieto = true; para(); });
  a.addEventListener('mouseleave', () => { quieto = false; arranca(); });
  a.addEventListener('focusin', () => { quieto = true; para(); });
  a.addEventListener('focusout', () => { quieto = false; arranca(); });
  $('.sc-ant').addEventListener('click', () => mueve(-1));
  $('.sc-sig').addEventListener('click', () => mueve(1));
  addEventListener('guardiana-idioma', () => { if (D) pon(); });
  fetch('/orbita/datos/sabias-comunicaciones.json?v=20261027a').then((r) => (r.ok ? r.json() : null)).then((j) => {
    if (!j || !Array.isArray(j.sabias) || !j.sabias.length) return;
    D = j; i = Math.floor(Math.random() * D.sabias.length); pon(); revisa();
  }).catch(() => {});
})();
