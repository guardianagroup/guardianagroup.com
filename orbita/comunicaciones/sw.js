/* GUARDIANA · Comunicaciones · service worker (29 Oct 2026). Dueño, 09:14 y 10:02: «las notificaciones fuera de la aplicación…
   intentar hacer que suene o que haga algo cuando está fuera… máxima calidad».
   Solo hace una cosa: recibir el aviso cifrado (Web Push, RFC 8030/8291) que manda el relé cuando alguien escribe o llama a una
   sala en la que este equipo no está conectado, y enseñarlo como aviso del sistema. El aviso no trae ningún mensaje: solo dice
   «mensaje» o «llamada» y en qué sala; el contenido llega por el canal encriptado cuando se abre la app. No guarda nada, no
   intercepta ninguna petición y no manda nada a ningún sitio. */
'use strict';
const VERSION = 'gcom-sw-2026-10-29d';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

// los textos, en el idioma del equipo (los mismos cinco que la app); sin nombres ni contenido
const TEXTOS = {
  es: { mensaje: 'Mensaje nuevo', mensajeCuerpo: 'GUARDIANA · toca para leerlo (va encriptado hasta que abras la app).', llamada: 'Te están llamando', llamadaCuerpo: 'GUARDIANA · toca para contestar.' },
  en: { mensaje: 'New message', mensajeCuerpo: 'GUARDIANA · tap to read it (encrypted until you open the app).', llamada: 'Incoming call', llamadaCuerpo: 'GUARDIANA · tap to answer.' },
  pt: { mensaje: 'Mensagem nova', mensajeCuerpo: 'GUARDIANA · toque para ler (vai criptografada até você abrir o app).', llamada: 'Estão ligando para você', llamadaCuerpo: 'GUARDIANA · toque para atender.' },
  ru: { mensaje: 'Новое сообщение', mensajeCuerpo: 'GUARDIANA · нажмите, чтобы прочитать (зашифровано, пока вы не откроете приложение).', llamada: 'Вам звонят', llamadaCuerpo: 'GUARDIANA · нажмите, чтобы ответить.' },
  cs: { mensaje: 'Nová zpráva', mensajeCuerpo: 'GUARDIANA · klepněte pro přečtení (šifrováno, dokud aplikaci neotevřete).', llamada: 'Někdo vám volá', llamadaCuerpo: 'GUARDIANA · klepněte pro přijetí.' },
  de: { mensaje: 'Neue Nachricht', mensajeCuerpo: 'GUARDIANA · zum Lesen antippen (verschlüsselt, bis du die App öffnest).', llamada: 'Eingehender Anruf', llamadaCuerpo: 'GUARDIANA · zum Annehmen antippen.' },
  fr: { mensaje: 'Nouveau message', mensajeCuerpo: 'GUARDIANA · touchez pour le lire (chiffré jusqu’à l’ouverture de l’app).', llamada: 'Appel entrant', llamadaCuerpo: 'GUARDIANA · touchez pour répondre.' },
  it: { mensaje: 'Nuovo messaggio', mensajeCuerpo: 'GUARDIANA · tocca per leggerlo (cifrato finché non apri l’app).', llamada: 'Chiamata in arrivo', llamadaCuerpo: 'GUARDIANA · tocca per rispondere.' },
  nl: { mensaje: 'Nieuw bericht', mensajeCuerpo: 'GUARDIANA · tik om te lezen (versleuteld tot je de app opent).', llamada: 'Inkomende oproep', llamadaCuerpo: 'GUARDIANA · tik om op te nemen.' },
  pl: { mensaje: 'Nowa wiadomość', mensajeCuerpo: 'GUARDIANA · dotknij, aby przeczytać (zaszyfrowana do otwarcia aplikacji).', llamada: 'Połączenie przychodzące', llamadaCuerpo: 'GUARDIANA · dotknij, aby odebrać.' },
  tr: { mensaje: 'Yeni mesaj', mensajeCuerpo: 'GUARDIANA · okumak için dokun (uygulamayı açana kadar şifreli).', llamada: 'Gelen arama', llamadaCuerpo: 'GUARDIANA · yanıtlamak için dokun.' },
  uk: { mensaje: 'Нове повідомлення', mensajeCuerpo: 'GUARDIANA · торкніться, щоб прочитати (зашифровано, доки не відкриєте застосунок).', llamada: 'Вам телефонують', llamadaCuerpo: 'GUARDIANA · торкніться, щоб відповісти.' },
  ja: { mensaje: '新着メッセージ', mensajeCuerpo: 'GUARDIANA · タップして読む（アプリを開くまで暗号化されています）。', llamada: '着信', llamadaCuerpo: 'GUARDIANA · タップして応答。' },
  ko: { mensaje: '새 메시지', mensajeCuerpo: 'GUARDIANA · 눌러서 읽기 (앱을 열 때까지 암호화됨).', llamada: '전화가 왔습니다', llamadaCuerpo: 'GUARDIANA · 눌러서 받기.' },
  zh: { mensaje: '新消息', mensajeCuerpo: 'GUARDIANA · 点按阅读（打开应用前保持加密）。', llamada: '来电', llamadaCuerpo: 'GUARDIANA · 点按接听。' },
  ar: { mensaje: 'رسالة جديدة', mensajeCuerpo: 'GUARDIANA · اضغط للقراءة (مشفّرة حتى تفتح التطبيق).', llamada: 'مكالمة واردة', llamadaCuerpo: 'GUARDIANA · اضغط للرد.' },
  he: { mensaje: 'הודעה חדשה', mensajeCuerpo: 'GUARDIANA · הקש כדי לקרוא (מוצפן עד שתפתח את האפליקציה).', llamada: 'שיחה נכנסת', llamadaCuerpo: 'GUARDIANA · הקש כדי לענות.' },
  el: { mensaje: 'Νέο μήνυμα', mensajeCuerpo: 'GUARDIANA · πατήστε για να το διαβάσετε (κρυπτογραφημένο μέχρι να ανοίξετε την εφαρμογή).', llamada: 'Εισερχόμενη κλήση', llamadaCuerpo: 'GUARDIANA · πατήστε για να απαντήσετε.' },
  sv: { mensaje: 'Nytt meddelande', mensajeCuerpo: 'GUARDIANA · tryck för att läsa (krypterat tills du öppnar appen).', llamada: 'Inkommande samtal', llamadaCuerpo: 'GUARDIANA · tryck för att svara.' },
  da: { mensaje: 'Ny besked', mensajeCuerpo: 'GUARDIANA · tryk for at læse (krypteret, indtil du åbner appen).', llamada: 'Indgående opkald', llamadaCuerpo: 'GUARDIANA · tryk for at svare.' },
  nb: { mensaje: 'Ny melding', mensajeCuerpo: 'GUARDIANA · trykk for å lese (kryptert til du åpner appen).', llamada: 'Innkommende anrop', llamadaCuerpo: 'GUARDIANA · trykk for å svare.' },
  fi: { mensaje: 'Uusi viesti', mensajeCuerpo: 'GUARDIANA · napauta lukeaksesi (salattu, kunnes avaat sovelluksen).', llamada: 'Saapuva puhelu', llamadaCuerpo: 'GUARDIANA · napauta vastataksesi.' },
  ro: { mensaje: 'Mesaj nou', mensajeCuerpo: 'GUARDIANA · atinge pentru a-l citi (criptat până deschizi aplicația).', llamada: 'Apel primit', llamadaCuerpo: 'GUARDIANA · atinge pentru a răspunde.' },
  hu: { mensaje: 'Új üzenet', mensajeCuerpo: 'GUARDIANA · koppints az olvasáshoz (titkosítva, amíg meg nem nyitod az appot).', llamada: 'Bejövő hívás', llamadaCuerpo: 'GUARDIANA · koppints a fogadáshoz.' },
  id: { mensaje: 'Pesan baru', mensajeCuerpo: 'GUARDIANA · ketuk untuk membaca (terenkripsi sampai Anda membuka aplikasi).', llamada: 'Panggilan masuk', llamadaCuerpo: 'GUARDIANA · ketuk untuk menjawab.' },
  vi: { mensaje: 'Tin nhắn mới', mensajeCuerpo: 'GUARDIANA · chạm để đọc (được mã hóa cho đến khi bạn mở ứng dụng).', llamada: 'Cuộc gọi đến', llamadaCuerpo: 'GUARDIANA · chạm để trả lời.' },
  hi: { mensaje: 'नया संदेश', mensajeCuerpo: 'GUARDIANA · पढ़ने के लिए टैप करें (ऐप खोलने तक एन्क्रिप्टेड)।', llamada: 'इनकमिंग कॉल', llamadaCuerpo: 'GUARDIANA · जवाब देने के लिए टैप करें।' },
};
const textos = () => { let l = 'en'; try { l = String((self.navigator && self.navigator.language) || 'en').slice(0, 2).toLowerCase(); } catch (_) {} return TEXTOS[l] || TEXTOS.en; };
const salaOk = (s) => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);

self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = {}; }
  const tipo = d.tipo === 'llamada' ? 'llamada' : 'mensaje', sala = salaOk(d.sala) ? d.sala : '';
  const t = textos();
  e.waitUntil((async () => {
    // Siempre se enseña un aviso (iPhone: si el push no acaba en un aviso, el sistema pone uno genérico «Notificación»; 29 Oct 2026,
    // 15:32). Con la app a la vista, la página lo retira en cuanto lee el mensaje (mensaje «cierra»).
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) { try { c.postMessage({ t: 'aviso', tipo, sala }); } catch (_) {} }
    const op = {
      body: tipo === 'llamada' ? t.llamadaCuerpo : t.mensajeCuerpo, icon: '/icon-192.png?v=2', badge: '/icon-192.png?v=2',
      tag: 'gcom-' + tipo + '-' + sala.slice(0, 16), renotify: tipo === 'llamada', requireInteraction: tipo === 'llamada',
      vibrate: tipo === 'llamada' ? [400, 200, 400, 200, 400] : [120], timestamp: Number(d.t) || Date.now(),
      data: { sala, tipo },
    };
    await self.registration.showNotification(tipo === 'llamada' ? t.llamada : t.mensaje, op);
    await insignia();
  })());
});
// el número en el icono de la app (dueño, 29 Oct 2026, 12:21: «que también aparezcan ahí en el logo»): tantos como avisos sin abrir
async function insignia() {
  try { if (!(self.navigator && self.navigator.setAppBadge)) return; const ns = await self.registration.getNotifications(); if (ns.length) await self.navigator.setAppBadge(ns.length); else if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge(); } catch (_) {}
}

// al tocar el aviso: la app, en esa conversación (si ya está abierta, se trae al frente)
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const d = e.notification.data || {}, sala = salaOk(d.sala) ? d.sala : '', tipo = d.tipo === 'llamada' ? 'llamada' : 'mensaje';
  const url = '/orbita/comunicaciones/?desde=aviso' + (sala ? '&sala=' + sala : '') + '&tipo=' + tipo;
  e.waitUntil((async () => {
    await insignia();
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
    e.waitUntil((async () => { const ns = await self.registration.getNotifications(); for (const n of ns) { const x = n.data || {}; if (!d.sala || x.sala === d.sala) n.close(); } })()); // la insignia la ajusta la propia página (navigator.setAppBadge/clearAppBadge)
  }
});
