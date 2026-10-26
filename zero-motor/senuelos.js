// ZERO · señuelos (26 Oct 2026; ronda 40, punto 13: las tres voces; dueño: «vigilar a la IA con archivos trampa»).
//
// Marcas únicas por sesión que ZERO planta en la celda donde nadie tiene motivo para mirar: un texto escondido en la
// página, una cookie propia de la web visitada, un dato en el almacén local, un enlace oculto a un colector propio y
// (para PUERTA IA) un archivo con nombre tentador. Si una de esas marcas reaparece en algo que sale de la celda
// (dirección, cuerpo, cabecera, trama de WebSocket) o alguien visita el enlace, ZERO lo afirma con evidencia:
// «este dato marcado salió hacia X por Y». Nunca se afirma más que eso (ronda 40: ni «ha entrenado con tus datos»
// ni acusaciones). Falsos positivos conocidos: previsualizadores de enlaces e indexadores que siguen el enlace; la
// propia web, que recibe su cookie por el mecanismo normal (se excluye) y puede mandarse a sí misma el contenido de
// su página (se dice, con otro texto).
'use strict';
const crypto = require('crypto');

const TIPOS = { dom: 'texto escondido en la página', cookie: 'cookie propia de la web', almacen: 'dato del almacén local', enlace: 'enlace oculto', archivo: 'archivo trampa' };

class Senuelos {
  constructor(baseColector) {
    this.token = crypto.randomBytes(6).toString('hex');
    this.base = baseColector; // en pruebas, el propio motor (http://127.0.0.1:puerto); en producción, un colector público propio
    this.marcas = {
      dom: 'ZG-D-' + this.token,
      cookie: 'ZG-C-' + this.token,
      almacen: 'ZG-A-' + this.token,
      enlace: this.base + '/s/' + this.token,
      archivo: 'Claves-y-datos-privados-' + this.token.slice(0, 6) + '.txt',
    };
    this.alertas = [];
  }

  // Lo que se ejecuta dentro de cada página de la celda, antes que cualquier script de la web.
  initScript() {
    const m = this.marcas;
    return `(() => {
      const planta = () => {
        try {
          if (!document.body) return;
          const i = document.createElement('i'); i.hidden = true; i.setAttribute('aria-hidden', 'true'); i.setAttribute('data-zg', '1'); i.textContent = ${JSON.stringify(m.dom)};
          const a = document.createElement('a'); a.hidden = true; a.setAttribute('aria-hidden', 'true'); a.setAttribute('rel', 'nofollow'); a.setAttribute('tabindex', '-1'); a.href = ${JSON.stringify(m.enlace)}; a.textContent = 'zg';
          document.body.append(i, a);
        } catch (_) {}
        try { if (location.protocol === 'http:' || location.protocol === 'https:') document.cookie = 'zg=' + ${JSON.stringify(m.cookie)} + '; path=/; SameSite=Lax'; } catch (_) {}
        try { localStorage.setItem('zg', ${JSON.stringify(m.almacen)}); } catch (_) {}
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', planta, { once: true }); else planta();
    })();`;
  }

  // ¿Aparece alguna marca en este texto? Devuelve los tipos encontrados.
  busca(texto) {
    if (!texto) return [];
    const s = String(texto);
    const out = [];
    for (const [tipo, marca] of Object.entries(this.marcas)) {
      if (tipo === 'enlace' ? s.includes('/s/' + this.token) : s.includes(marca)) out.push(tipo);
    }
    return out;
  }

  // Una petición que sale de la celda: dirección, cuerpo y cabeceras (la cookie propia viaja a su web por el
  // mecanismo normal: no cuenta; sí cuenta si va a un tercero o dentro de la dirección o del cuerpo).
  inspecciona({ url, postData, headers, tercero }) {
    const hallazgos = [];
    for (const tipo of this.busca(url)) hallazgos.push({ tipo, donde: 'dirección' });
    for (const tipo of this.busca(postData)) hallazgos.push({ tipo, donde: 'cuerpo' });
    for (const [k, v] of Object.entries(headers || {})) {
      if (k.toLowerCase() === 'cookie' && !tercero) continue;
      for (const tipo of this.busca(v)) hallazgos.push({ tipo, donde: 'cabecera ' + k });
    }
    return hallazgos;
  }

  apunta(h) { this.alertas.push(h); if (this.alertas.length > 200) this.alertas.shift(); }

  static nombre(tipo) { return TIPOS[tipo] || tipo; }
}

module.exports = { Senuelos, TIPOS };
