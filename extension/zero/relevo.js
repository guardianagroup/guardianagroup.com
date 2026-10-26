// GUARDIANA ZERO · relevo (mundo aislado). Los sensores corren en el mundo de la página y no pueden hablar con la
// extensión; dejan sus avisos en window.postMessage y este relevo los lleva al motor. Solo pasan avisos de ZERO.
(() => {
  'use strict';
  const MARCA = 'guardiana-zero-suceso';
  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || e.data.zero !== MARCA || typeof e.data.j !== 'string' || e.data.j.length > 65536) return;
    try { chrome.runtime.sendMessage({ t: 'sensor', json: e.data.j, origen: location.origin, marco: window === window.top ? 'principal' : 'marco' }); } catch (_) {}
  });
})();
