#!/usr/bin/env python3
"""GUARDIANA ZERO · construye la extensión del navegador (Chrome, Edge, Brave; Manifest V3) a partir del motor de ZERO.

Reúne en extension/dist/zero/:
- manifest, fondo.js (motor en el navegador), panel (html/css/js), relevo.js, iconos;
- motor/cortes.js y motor/empresas.js: los mismos de zero-motor/, convertidos a módulos sin fs;
- sensores.js: los sensores de la celda (zero-motor/sensores.js) con el puente window.postMessage;
- listas/*.txt (EasyList, EasyPrivacy, uBlock Origin; licencias en fuentes.json) y datos/*.json (empresas, países);
- reglas/normal.json y reglas/malware.json: reglas declarativas (declarativeNetRequest) derivadas de las listas, para que
  sea el navegador quien corte cuando la persona sube el nivel; en «Observar» no hay reglas activas salvo webs peligrosas;
- static/idioma.js y static/i18n/*.json: los 42 idiomas de ZERO.
Y deja extension/dist/guardiana-zero-<versión>.zip listo para subir a la tienda.

Uso: python3 extension/construir.py
"""
import json, os, re, shutil, sys, zipfile
from datetime import datetime, timezone

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RAIZ, 'extension', 'zero')
MOTOR = os.path.join(RAIZ, 'zero-motor')
DIST = os.path.join(RAIZ, 'extension', 'dist', 'zero')
MAX_NORMAL = 29000   # reglas estáticas garantizadas por extensión: 30.000
TIPOS_DNR = {'script': 'script', 'image': 'image', 'stylesheet': 'stylesheet', 'object': 'object', 'xmlhttprequest': 'xmlhttprequest',
             'subdocument': 'sub_frame', 'ping': 'ping', 'websocket': 'websocket', 'font': 'font', 'media': 'media', 'other': 'other', 'csp_report': 'csp_report'}


def lee(p): return open(p, encoding='utf-8').read()
def escribe(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(s)


def motor_cortes():
    s = lee(os.path.join(MOTOR, 'cortes.js'))
    s = s.replace("const fs = require('fs');\nconst path = require('path');\n", '')
    # cargaCarpeta (usa fs) → aplicaBadfilter (solo la segunda pasada)
    i = s.index('  cargaCarpeta(carpeta) {'); j = s.index('  cargaTexto(texto, lista, proposito) {')
    s = s[:i] + """  // Segunda pasada tras cargar todas las listas: quitar las reglas marcadas con $badfilter.
  aplicaBadfilter() {
    if (!this.badfilter.size) return this.n;
    const quita = (arr) => arr.filter((r) => !this.badfilter.has(r.texto));
    for (const [k, v] of this.indice) this.indice.set(k, quita(v));
    for (const [k, v] of this.excIndice) this.excIndice.set(k, quita(v));
    this.siempre = quita(this.siempre); this.excSiempre = quita(this.excSiempre);
    return this.n;
  }

""" + s[j:]
    s = s[:s.index("module.exports = { Cortes };")] + "export { Cortes };\n"
    assert "require(" not in s
    return s


def motor_empresas():
    s = lee(os.path.join(MOTOR, 'empresas.js'))
    s = s.replace("const fs = require('fs');\nconst path = require('path');\n", '')
    i = s.index('  constructor(raiz) {'); j = s.index('  /** { empresa, pais')
    s = s[:i] + """  // En el navegador los datos llegan ya leídos: { espejo, fichas, agencia }
  constructor(datos) {
    const d = (datos && datos.espejo) || {};
    this.dominios = d.dominios || {}; this.paisEmpresa = d.empresas || {}; this.fecha = d.fecha;
    this.fichas = ((datos && datos.fichas) || {}).empresas || {};
    this.wikidata = (datos && datos.wikidata) || {};
    this.agencia = (datos && datos.agencia && datos.agencia.dominios) ? datos.agencia : { dominios: {}, empresas: {}, detalle: {} };
    // empresa → dominios conocidos (para las reglas de «permitir» y «cortar» por empresa)
    this.porEmpresa = new Map();
    const mete = (dom, emp) => { if (!emp) return; if (!this.porEmpresa.has(emp)) this.porEmpresa.set(emp, new Set()); this.porEmpresa.get(emp).add(dom); };
    for (const [dom, x] of Object.entries(this.dominios)) mete(dom, x && x.empresa);
    for (const [dom, x] of Object.entries(this.agencia.dominios)) mete(dom, x && x.empresa);
    for (const [dom, x] of Object.entries(this.wikidata)) mete(dom, x && x.empresa);
  }
  dominiosDe(empresa) { return [...(this.porEmpresa.get(empresa) || [])]; }

""" + s[j:]
    s = s[:s.index("module.exports = { Empresas, baseDominio, PAISES };")] + "export { Empresas, baseDominio, PAISES };\n"
    assert "require(" not in s and "fs." not in s
    return s


def sensores():
    s = lee(os.path.join(MOTOR, 'sensores.js'))
    i = s.index('module.exports = String.raw`') + len('module.exports = String.raw`')
    j = s.rindex('`;')
    cuerpo = s[i:j]
    puente = """// GUARDIANA ZERO · sensores en la página (mundo principal). Observan lo que la web intenta (huella digital, permisos,
// WebRTC, formularios sin cifrar, subasta de anuncios) y lo cuentan al motor por window.postMessage → relevo.js.
// Solo observación: no cambian la web.
(() => {
  const MARCA = 'guardiana-zero-suceso';
  window.__zeroSuceso = (j) => { try { window.postMessage({ zero: MARCA, j: String(j) }, '*'); } catch (_) {} };
})();
"""
    return puente + cuerpo + '\n'


def reglas_dnr():
    """Reglas declarativas a partir de las listas: solo reglas de red sencillas (||dominio^ con tipos y third-party).
    Lo que no se entiende se deja fuera (nunca se corta por una regla no entendida)."""
    reg = json.load(open(os.path.join(MOTOR, 'listas', 'fuentes.json'), encoding='utf-8'))
    orden = ['easyprivacy', 'ubo-privacy', 'easylist', 'ubo-filters']  # primero rastreo, luego publicidad
    bloqueo, permiso, malware = [], [], []
    vistos = set()
    def convierte(linea, lista):
        linea = linea.strip()
        if not linea or linea[0] in '![#' or '##' in linea or '#@#' in linea or '#?#' in linea or '$$' in linea: return None
        exc = linea.startswith('@@')
        if exc: linea = linea[2:]
        patron, _, ops = linea.partition('$')
        m = re.fullmatch(r'\|\|([a-z0-9][a-z0-9.-]*[a-z0-9])\^?', patron)
        if not m: return None
        host = m.group(1)
        if host.count('.') == 0 or len(host) > 120: return None
        cond = {'urlFilter': '||' + host + '^'}
        tipos, notipos = [], []
        if ops:
            for op in ops.split(','):
                op = op.strip(); neg = op.startswith('~'); op = op[1:] if neg else op
                if op in ('third-party', '3p'): cond['domainType'] = 'firstParty' if neg else 'thirdParty'; continue
                if op in ('first-party', '1p'): cond['domainType'] = 'thirdParty' if neg else 'firstParty'; continue
                t = {'xhr': 'xmlhttprequest', 'frame': 'subdocument', 'css': 'stylesheet'}.get(op, op)
                if t in TIPOS_DNR: (notipos if neg else tipos).append(TIPOS_DNR[t]); continue
                if op in ('important', 'document', 'all'): continue
                return None  # domain=, redirect, removeparam, csp, etc.: fuera
        if tipos: cond['resourceTypes'] = sorted(set(tipos))
        elif notipos: cond['excludedResourceTypes'] = sorted(set(notipos) | {'main_frame'})
        else: cond['excludedResourceTypes'] = ['main_frame']
        return exc, cond, host
    for clave in orden:
        f = reg['listas'].get(clave)
        if not f: continue
        ruta = os.path.join(MOTOR, 'listas', f['archivo'])
        if not os.path.exists(ruta): continue
        for linea in open(ruta, encoding='utf-8', errors='replace'):
            r = convierte(linea, clave)
            if not r: continue
            exc, cond, host = r
            firma = (exc, json.dumps(cond, sort_keys=True))
            if firma in vistos: continue
            vistos.add(firma)
            (permiso if exc else bloqueo).append(cond)
    # webs peligrosas: ubo-badware, también navegaciones
    f = reg['listas'].get('ubo-badware')
    if f and os.path.exists(os.path.join(MOTOR, 'listas', f['archivo'])):
        for linea in open(os.path.join(MOTOR, 'listas', f['archivo']), encoding='utf-8', errors='replace'):
            r = convierte(linea, 'ubo-badware')
            if not r or r[0]: continue
            malware.append({'urlFilter': r[1]['urlFilter']})
    normal, i = [], 1
    for c in permiso[:3000]:
        normal.append({'id': i, 'priority': 2, 'action': {'type': 'allow'}, 'condition': c}); i += 1
    for c in bloqueo:
        if len(normal) >= MAX_NORMAL: break
        normal.append({'id': i, 'priority': 1, 'action': {'type': 'block'}, 'condition': c}); i += 1
    mal = [{'id': i2 + 1, 'priority': 1, 'action': {'type': 'block'}, 'condition': c} for i2, c in enumerate(malware[:20000])]
    return normal, mal, {'bloqueo': len(bloqueo), 'permiso': len(permiso), 'malware': len(malware)}


def iconos():
    from PIL import Image, ImageDraw
    for n in (16, 32, 48, 128):
        k = 8
        im = Image.new('RGBA', (n * k, n * k), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        w = n * k
        d.ellipse([0, 0, w - 1, w - 1], fill=(6, 8, 12, 255))
        g = w * 0.16
        d.ellipse([g, g, w - g, w - g], outline=(156, 195, 228, 255), width=max(2, int(w * 0.085)))
        c = w / 2; r = w * 0.11
        d.ellipse([c - r, c - r, c + r, c + r], fill=(156, 195, 228, 255))
        im = im.resize((n, n), Image.LANCZOS)
        os.makedirs(os.path.join(DIST, 'iconos'), exist_ok=True)
        im.save(os.path.join(DIST, 'iconos', f'{n}.png'))


def main():
    if os.path.exists(DIST): shutil.rmtree(DIST)
    os.makedirs(DIST)
    for f in ('manifest.json', 'fondo.js', 'panel.html', 'panel.css', 'panel.js', 'relevo.js'):
        shutil.copy(os.path.join(SRC, f), os.path.join(DIST, f))
    escribe(os.path.join(DIST, 'motor', 'cortes.js'), motor_cortes())
    escribe(os.path.join(DIST, 'motor', 'empresas.js'), motor_empresas())
    escribe(os.path.join(DIST, 'sensores.js'), sensores())
    # listas y sus licencias
    reg = json.load(open(os.path.join(MOTOR, 'listas', 'fuentes.json'), encoding='utf-8'))
    os.makedirs(os.path.join(DIST, 'listas'), exist_ok=True)
    quedan = {}
    for k, f in reg['listas'].items():
        ruta = os.path.join(MOTOR, 'listas', f['archivo'])
        if k in ('ubo-removeparam', 'ubo-lan', 'ubo-cookies') or not os.path.exists(ruta): continue
        shutil.copy(ruta, os.path.join(DIST, 'listas', f['archivo'])); quedan[k] = f
    json.dump({'generado': reg.get('generado'), 'listas': quedan}, open(os.path.join(DIST, 'listas', 'fuentes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # datos de empresas
    os.makedirs(os.path.join(DIST, 'datos'), exist_ok=True)
    for src, dst in (('orbita/datos/espejo.json', 'espejo.json'), ('orbita/datos/empresas.json', 'empresas.json'), ('zero-motor/datos/dominios-agencia.json', 'dominios-agencia.json')):
        p = os.path.join(RAIZ, src)
        if os.path.exists(p): shutil.copy(p, os.path.join(DIST, 'datos', dst))
    # reglas declarativas
    normal, mal, n = reglas_dnr()
    escribe(os.path.join(DIST, 'reglas', 'normal.json'), json.dumps(normal, ensure_ascii=False, separators=(',', ':')))
    escribe(os.path.join(DIST, 'reglas', 'malware.json'), json.dumps(mal, ensure_ascii=False, separators=(',', ':')))
    # idiomas
    os.makedirs(os.path.join(DIST, 'static', 'i18n'), exist_ok=True)
    shutil.copy(os.path.join(RAIZ, 'orbita', 'static', 'idioma.js'), os.path.join(DIST, 'static', 'idioma.js'))
    for f in os.listdir(os.path.join(RAIZ, 'orbita', 'static', 'i18n')):
        if f.endswith('.json'): shutil.copy(os.path.join(RAIZ, 'orbita', 'static', 'i18n', f), os.path.join(DIST, 'static', 'i18n', f))
    iconos()
    ver = json.load(open(os.path.join(SRC, 'manifest.json')))['version']
    zp = os.path.join(RAIZ, 'extension', 'dist', f'guardiana-zero-{ver}.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for raiz, _, fs in os.walk(DIST):
            for f in fs:
                p = os.path.join(raiz, f); z.write(p, os.path.relpath(p, DIST))
    tam = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(DIST) for f in fs)
    print(f'extensión {ver}: {tam/1e6:.1f} MB sin comprimir · reglas normal {len(normal)} (bloqueo {n["bloqueo"]}, permiso {n["permiso"]}) · malware {len(mal)} · zip {os.path.getsize(zp)/1e6:.1f} MB → {zp}')


if __name__ == '__main__':
    main()
