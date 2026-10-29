/* GUARDIANA · Comunicaciones · service worker (29 Oct 2026). Dueño, 09:14 y 10:02: «las notificaciones fuera de la aplicación…
   intentar hacer que suene o que haga algo cuando está fuera… máxima calidad».
   Solo hace una cosa: recibir el aviso cifrado (Web Push, RFC 8030/8291) que manda el relé cuando alguien escribe o llama a una
   sala en la que este equipo no está conectado, y enseñarlo como aviso del sistema. El aviso no trae ningún mensaje: solo dice
   «mensaje» o «llamada» y en qué sala; el contenido llega por el canal encriptado cuando se abre la app. No guarda nada, no
   intercepta ninguna petición y no manda nada a ningún sitio. */
'use strict';
const VERSION = 'gcom-sw-2026-10-29a';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

// los textos, en el idioma del equipo (los mismos cinco que la app); sin nombres ni contenido
const TEXTOS = {
  es: { mensaje: 'Mensaje nuevo', mensajeCuerpo: 'GUARDIANA · toca para leerlo (va encriptado hasta que abras la app).', llamada: 'Te están llamando', llamadaCuerpo: 'GUARDIANA · toca para contestar.' },
  en: { mensaje: 'New message', mensajeCuerpo: 'GUARDIANA · tap to read it (encrypted until you open the app).', llamada: 'Incoming call', llamadaCuerpo: 'GUARDIANA · tap to answer.' },
  pt: { mensaje: 'Mensagem nova', mensajeCuerpo: 'GUARDIANA · toque para ler (vai criptografada até você abrir o app).', llamada: 'Estão ligando para você', llamadaCuerpo: 'GUARDIANA · toque para atender.' },
  ru: { mensaje: 'Новое сообщение', mensajeCuerpo: 'GUARDIANA · нажмите, чтобы прочитать (зашифровано, пока вы не откроете приложение).', llamada: 'Вам звонят', llamadaCuerpo: 'GUARDIANA · нажмите, чтобы ответить.' },
  cs: { mensaje: 'Nová zpráva', mensajeCuerpo: 'GUARDIANA · klepněte pro přečtení (šifrováno, dokud aplikaci neotevřete).', llamada: 'Někdo vám volá', llamadaCuerpo: 'GUARDIANA · klepněte pro přijetí.' },
};
const textos = () => { let l = 'en'; try { l = String((self.navigator && self.navigator.language) || 'en').slice(0, 2).toLowerCase(); } catch (_) {} return TEXTOS[l] || TEXTOS.en; };
const salaOk = (s) => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);

self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = {}; }
  const tipo = d.tipo === 'llamada' ? 'llamada' : 'mensaje', sala = salaOk(d.sala) ? d.sala : '';
  const t = textos();
  e.waitUntil((async () => {
    // con la app abierta y a la vista, la propia página avisa (y el relé no manda el aviso si este equipo está en la sala)
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    let aLaVista = false;
    for (const c of cs) { try { c.postMessage({ t: 'aviso', tipo, sala }); if (c.visibilityState === 'visible' && c.focused) aLaVista = true; } catch (_) {} }
    if (aLaVista && tipo === 'mensaje') return;
    const op = {
      body: tipo === 'llamada' ? t.llamadaCuerpo : t.mensajeCuerpo, icon: '/icon-192.png?v=2', badge: '/icon-192.png?v=2',
      tag: 'gcom-' + tipo + '-' + sala.slice(0, 16), renotify: tipo === 'llamada', requireInteraction: tipo === 'llamada',
      vibrate: tipo === 'llamada' ? [400, 200, 400, 200, 400] : [120], timestamp: Number(d.t) || Date.now(),
      data: { sala, tipo },
    };
    await self.registration.showNotification(tipo === 'llamada' ? t.llamada : t.mensaje, op);
    try { if (self.navigator && self.navigator.setAppBadge) await self.navigator.setAppBadge(); } catch (_) {}
  })());
});

// al tocar el aviso: la app, en esa conversación (si ya está abierta, se trae al frente)
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const d = e.notification.data || {}, sala = salaOk(d.sala) ? d.sala : '', tipo = d.tipo === 'llamada' ? 'llamada' : 'mensaje';
  const url = '/orbita/comunicaciones/?desde=aviso' + (sala ? '&sala=' + sala : '') + '&tipo=' + tipo;
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) {
      if (!/\/orbita\/comunicaciones\//.test(c.url)) continue;
      try { await c.focus(); } catch (_) {}
      try { c.postMessage({ t: 'abre', sala, tipo }); } catch (_) {}
      return;
    }
    try { await self.clients.openWindow(url); } catch (_) {}
  })());
});

// la página puede pedir que se retiren avisos ya vistos (al abrir esa conversación)
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.t === 'cierra') {
    e.waitUntil((async () => { const ns = await self.registration.getNotifications(); for (const n of ns) { const x = n.data || {}; if (!d.sala || x.sala === d.sala) n.close(); } })());
  }
});
