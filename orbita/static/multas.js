// GUARDIANA · NÚCLEO · «Multas» (27 Oct 2026). Dueño, 13:30: «arriba a la derecha, Multas en rojo: todas las multas que
// sabemos de las grandes empresas, para que a la gente se le refresque la memoria y no olvide por qué las han multado con
// nuestros datos». Los casos están en /orbita/datos/multas.json (los 49 de casos.html, cada uno con su autoridad, su
// fecha, la resolución o noticia y una copia en archive.org) y se cargan solo al abrir. Nada sale de este navegador.
// window.GuardianaMultas.abre(botón que lo abrió) · .cierra()
'use strict';
(function (raiz) {
  let datos = null, capa = null, origen = null, filtro = 'todas';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lengua = () => { const l = (raiz.GuardianaIdioma && raiz.GuardianaIdioma.lang) || document.documentElement.lang || 'es'; return /^es/.test(l) ? 'es' : /^pt/.test(l) ? 'pt' : 'en'; };
  const loc = () => { try { return (raiz.GuardianaIdioma && raiz.GuardianaIdioma.locale) || document.documentElement.lang || 'es'; } catch (_) { return 'es'; } };
  const de = (x, l) => (x && typeof x === 'object' ? x[l] || x.en || x.es || '' : x || '');
  const fecha = (c) => {
    if (!c.dia || c.soloAnio) return c.anio || '';
    try { return new Date(c.dia + 'T12:00:00').toLocaleDateString(loc(), { day: 'numeric', month: 'short', year: 'numeric' }); } catch (_) { return c.dia; }
  };
  function carga() {
    if (datos) return Promise.resolve(datos);
    return fetch('/orbita/datos/multas.json?v=20261027b').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((j) => (datos = j));
  }
  function pinta() {
    const l = lengua(), U = datos.ui[l] || datos.ui.en, C = datos.casos;
    const n = (id) => (id === 'todas' ? C.length : C.filter((c) => c.cat === id).length);
    const chips = [{ id: 'todas', t: U.todas }].concat(datos.cats.map((c) => ({ id: c.id, t: de(c, l) }))).filter((c) => n(c.id))
      .map((c) => `<button type="button" class="nm-chip" data-f="${c.id}" aria-pressed="${c.id === filtro}">${esc(c.t)} <b>${n(c.id)}</b></button>`).join('');
    const lista = C.filter((c) => filtro === 'todas' || c.cat === filtro).map((c) => {
      const est = c.estado ? `<span class="nm-est">${esc(de(c.estado, l))}</span>` : '';
      // sin importe (multa anulada o pendiente de recalcular): en su lugar, el estado
      const cifra = c.cifra ? `<p class="nm-cifra">${esc(c.cifra)}</p>` : `<p class="nm-cifra nm-sin">${esc(c.estado ? de(c.estado, l) : '—')}</p>`;
      return `<article class="nm-caso">${cifra}`
        + `<p class="nm-quien"><b>${esc(c.empresa)}</b><span>${esc(de(c.autoridad, l))} · ${esc(fecha(c))}</span>${est}</p>`
        + `<h3>${esc(de(c.titulo, l))}</h3><p class="nm-texto">${esc(de(c.texto, l))}</p>`
        + `<button type="button" class="nm-mas" aria-expanded="false">${esc(U.mas)}</button>`
        + `<p class="nm-enl"><a href="${esc(c.fuente)}" target="_blank" rel="noopener">${esc(U.fuente)}</a>${c.copia ? `<a href="${esc(c.copia)}" target="_blank" rel="noopener">${esc(U.copia)}</a>` : ''}</p></article>`;
    }).join('');
    capa.innerHTML = `<header class="nm-cab"><button type="button" class="nuc-volver nm-volver"><span aria-hidden="true">←</span> ${esc(U.volver)}</button><span class="nm-k">${esc(U.k)}</span></header>`
      + `<div class="nm-cuerpo"><div class="nm-col"><h2 id="nm-t">${esc(U.titulo)}</h2><p class="nm-intro">${esc(U.intro)}</p>`
      + `<p class="nm-n">${esc(U.casos.replace('{1}', String(n(filtro))))}</p><div class="nm-fil" role="group" aria-label="${esc(U.k)}">${chips}</div>`
      + `<div class="nm-lista">${lista}</div></div></div>`;
    capa.querySelector('.nm-volver').addEventListener('click', cierra);
    capa.querySelectorAll('.nm-chip').forEach((b) => b.addEventListener('click', () => { filtro = b.dataset.f; pinta(); const x = capa.querySelector(`.nm-chip[data-f="${filtro}"]`); if (x) x.focus({ preventScroll: true }); }));
    capa.querySelectorAll('.nm-caso').forEach((a) => {
      const t = a.querySelector('.nm-texto'), m = a.querySelector('.nm-mas');
      // «Leer más» solo si el texto no cabe en sus tres líneas
      requestAnimationFrame(() => { if (t.scrollHeight <= t.clientHeight + 2) m.hidden = true; });
      m.addEventListener('click', () => { const ab = a.classList.toggle('abierto'); m.setAttribute('aria-expanded', String(ab)); m.textContent = ab ? U.menos : U.mas; });
    });
  }
  function teclas(e) { if (e.key === 'Escape' && capa && !capa.hidden) { e.stopPropagation(); cierra(); } }
  function abre(boton) {
    origen = boton || null;
    if (!capa) {
      capa = document.createElement('section');
      capa.className = 'nuc-multas'; capa.hidden = true; capa.setAttribute('role', 'dialog'); capa.setAttribute('aria-modal', 'true');
      capa.setAttribute('aria-labelledby', 'nm-t'); capa.setAttribute('translate', 'no');
      document.body.append(capa); capa.addEventListener('keydown', teclas);
    }
    return carga().then(() => {
      pinta(); capa.hidden = false; capa.scrollTop = 0;
      requestAnimationFrame(() => { capa.classList.add('ve'); const v = capa.querySelector('.nm-volver'); if (v) v.focus({ preventScroll: true }); });
    });
  }
  function cierra() {
    if (!capa || capa.hidden) return;
    capa.classList.remove('ve'); capa.hidden = true;
    if (origen && origen.focus) origen.focus({ preventScroll: true });
  }
  raiz.GuardianaMultas = { abre, cierra };
})(window);
