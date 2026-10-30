#!/usr/bin/env python3
"""CSP sin 'unsafe-inline' en script-src: cada script en línea, con su hash SHA-256 (29 Oct 2026; auditoría de la web,
hallazgo 5; dueño: «lo mejor que se pueda»).

Hasta ahora la política de cada página (<meta http-equiv="Content-Security-Policy">, puesta por cabeceras.py) permitía
cualquier script escrito dentro de la página ('unsafe-inline'): si alguien lograba colar un <script> en el HTML, el navegador
lo ejecutaba. Esta herramienta deja en script-src solo 'self' y el hash de cada <script> que de verdad está en la página,
así que un script que no sea exactamente uno de los nuestros no se ejecuta. Los estilos siguen con 'unsafe-inline' en
style-src (no ejecutan código; hay 679 bloques <style> y muchos atributos style).

PROCEDIMIENTO · LÉELO ANTES DE PUBLICAR
  Cada vez que cambie un script en línea de cualquier página (una letra, un espacio, un salto de línea; también al
  regenerar páginas con idiomas.py, empresas.py, obras.py…) hay que volver a ejecutar esta herramienta ANTES de publicar:

      python3 herramientas/csp-hashes.py            # toda la web (idempotente: si no hay nada que cambiar, no toca nada)
      python3 herramientas/huellas.py               # después, si cambió algo de orbita/comunicaciones
      node herramientas/csp-comprueba.js            # comprobación: abre cada página en Chromium y cuenta las violaciones

  Si no se hace, el hash ya no coincide y el navegador NO ejecuta ese script: la página se queda sin él, en silencio
  (solo lo dice la consola: «Refused to execute inline script…»). Lo mismo si cabeceras.py pone la política estándar
  (que aún lleva 'unsafe-inline') en una página nueva: esta herramienta la corrige al ejecutarse.

Qué hace en cada página .html de la web (misma lista FUERA que cabeceras.py, pero aquí entran m/ y e/ y las dos páginas de
Comunicaciones; fuera también extension/, que es el código fuente de la extensión del navegador y lleva la política del
manifest, y los google*.html de la raíz, que son archivos de verificación):
  a. Busca la <meta http-equiv="Content-Security-Policy">; si no la hay, pone la estándar de cabeceras.py (ya sin
     'unsafe-inline') o, para las páginas de CSP_PROPIA, la suya.
  b. Calcula el SHA-256 (base64) de cada <script> sin src (también type="module", importmap, speculationrules), sobre los
     bytes UTF-8 del texto exacto entre <script …> y </script>, sin recortar nada (así lo calcula el navegador). Los
     type="application/json", "application/ld+json", "text/template" y "text/plain" no se ejecutan: sin hash.
  c. Reescribe SOLO la directiva script-src: lo que tenía (menos 'unsafe-inline' y los hashes o nonces viejos) más los
     hashes nuevos. Sin scripts en línea: script-src 'self' (o lo que tuviera). El resto de la política no se toca.
  d. Quita el ontouchstart="" vacío del <body> (truco de iOS para que funcione :active; con la política nueva un
     manejador en línea, aunque esté vacío, queda bloqueado) y, en esas páginas, añade antes de </body> el equivalente
     <script>document.addEventListener('touchstart',function(){},{passive:true})</script>, que se hashea como los demás.
  e. Avisa (no corrige) de lo que la política nueva bloquearía y hay que pasar a addEventListener a mano: atributos
     on*="…" con contenido, href="javascript:…". Los scripts que crean <script src="…"> propios (globo, Órbita, m/)
     siguen permitidos por 'self'; eval, new Function y document.write ya estaban prohibidos (no hay 'unsafe-eval').

Uso: python3 herramientas/csp-hashes.py [raíz del repo] [--solo-ver]      (idempotente; --solo-ver: dice qué cambiaría, sin escribir)
     python3 herramientas/csp-hashes.py pagina.html [otra.html …]        (solo esas páginas, aunque estén fuera de la lista)
"""
import base64, hashlib, os, re, sys

ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
SOLO_VER = '--solo-ver' in sys.argv
SUELTAS = [a for a in ARGS if a.endswith('.html')]
CARPETA = [a for a in ARGS if not a.endswith('.html')]
RAIZ = os.path.abspath(CARPETA[0] if CARPETA else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
# Como cabeceras.py, pero con m/ y e/ dentro (su política propia se respeta: solo cambia script-src) y extension/ fuera.
FUERA = ('v/', 'descargas/', 'node_modules/', '.git/', '.claude/', 'zero-motor/', 'herramientas/', 'extension/')

# La política estándar de la web (cabeceras.py), ya sin 'unsafe-inline' en script-src: se pone solo donde no hay ninguna.
CSP_ESTANDAR = ("default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; "
                "font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'")
# Páginas sin política a las que la estándar rompería: m/ (Comunicaciones en el móvil) habla con el relé por wss://, con el
# PC por WebTransport (https:// a direcciones de la red local que cambian), reproduce blob: y lleva manifest; decidir su
# connect-src es cosa del dueño. Mientras tanto, lo que sí se puede sin romper nada: solo los scripts (y nada de objetos
# ni <base>), que es lo que pide el hallazgo 5.
CSP_PROPIA = {
    'm/index.html': "script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'",
}
NO_EJECUTA = {'application/json', 'application/ld+json', 'text/template', 'text/plain', 'text/html', 'text/x-template'}
TOQUE = "<script>document.addEventListener('touchstart',function(){},{passive:true})</script>"

RE_CSP = re.compile(r'<meta http-equiv="Content-Security-Policy" content="([^"]*)"\s*/?>', re.I)
RE_CHARSET = re.compile(r'(<meta charset=["\']?utf-8["\']?\s*/?>)', re.I)
RE_SCRIPT = re.compile(r'<script\b([^>]*)>(.*?)</script\s*>', re.I | re.S)
RE_ATTR_SRC = re.compile(r'\ssrc\s*=', re.I)
RE_ATTR_TYPE = re.compile(r'\stype\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))', re.I)
RE_BODY_TOQUE = re.compile(r'(<body\b[^>]*?)\s+ontouchstart\s*=\s*(?:""|\'\')', re.I)
RE_TOQUE_YA = re.compile(r'document(?:\.body)?\.addEventListener\(\s*[\'"]touchstart[\'"]')
RE_MANEJADOR = re.compile(r'<[a-zA-Z][^>]*?\s(on[a-z]+)\s*=\s*(?:"[^"]+"|\'[^\']+\'|[^\s>"\']+)', re.I)
RE_JAVASCRIPT = re.compile(r'(?:href|src|action|formaction)\s*=\s*["\']?\s*javascript:', re.I)
RE_DIRECTIVA_SCRIPT = re.compile(r'^script-src(?:\s|$)', re.I)


def hashes_de(s):
    """Hashes (en orden, sin repetir) de los scripts en línea que el navegador ejecutaría; y avisos de parseo."""
    hs, avisos = [], []
    for m in RE_SCRIPT.finditer(s):
        attrs, cuerpo = m.group(1), m.group(2)
        if RE_ATTR_SRC.search(' ' + attrs):
            continue  # con src, el contenido se ignora
        mt = RE_ATTR_TYPE.search(' ' + attrs)
        tipo = ((mt.group(1) or mt.group(2) or mt.group(3) or '') if mt else '').strip().lower()
        if tipo in NO_EJECUTA:
            continue
        if '<!--' in cuerpo and re.search(r'<script', cuerpo, re.I):
            avisos.append('script en línea con «<!--» y «<script» dentro: el navegador puede cerrarlo en otro sitio (revisar a mano)')
        h = "'sha256-%s'" % base64.b64encode(hashlib.sha256(cuerpo.encode('utf-8')).digest()).decode('ascii')
        if h not in hs:
            hs.append(h)
    return hs, avisos


def script_src_nuevo(tokens, hashes):
    """La directiva script-src: lo que tenía (menos 'unsafe-inline', hashes y nonces viejos) más los hashes de ahora."""
    base = [t for t in tokens if t.lower() not in ("'unsafe-inline'", "'none'")
            and not re.match(r"'(sha256|sha384|sha512|nonce)-", t, re.I)]
    fuentes = base + [h for h in hashes if h not in base]
    return 'script-src ' + (' '.join(fuentes) if fuentes else "'none'")


def directivas(contenido):
    return [p.strip() for p in contenido.split(';') if p.strip()]


def politica_nueva(contenido, hashes):
    partes = directivas(contenido)
    hecho = False
    for i, p in enumerate(partes):
        if RE_DIRECTIVA_SCRIPT.match(p):
            partes[i] = script_src_nuevo(p.split()[1:], hashes)
            hecho = True
            break
    if not hecho:  # política sin script-src (manda default-src): se añade una propia, con 'self'
        partes.insert(1 if partes and partes[0].lower().startswith('default-src') else 0, script_src_nuevo(["'self'"], hashes))
    return '; '.join(partes)


def script_src_de(contenido):
    for p in directivas(contenido):
        if RE_DIRECTIVA_SCRIPT.match(p):
            return p.split()[1:]
    return []


def sin_scripts(s):
    """La página sin el contenido de sus scripts (para buscar manejadores en línea sin falsos positivos del JS)."""
    return RE_SCRIPT.sub(lambda m: '<script%s></script>' % m.group(1), s)


def trata(ruta, rel):
    s = open(ruta, encoding='utf-8').read()
    o = s
    avisos = []
    if not RE_CSP.search(s) and not RE_CHARSET.search(s):
        return 'sin charset', 0, ['sin política y sin <meta charset="utf-8"> tras el que ponerla: no se toca']
    # d. fuera el ontouchstart="" del <body>; en su lugar, el mismo truco como script (hasheado)
    s, n = RE_BODY_TOQUE.subn(r'\1', s)
    if n and not RE_TOQUE_YA.search(s):
        i = s.rfind('</body>')
        if i < 0:
            return 'sin body', 0, ['tenía ontouchstart pero no </body>: no se toca']
        s = s[:i] + TOQUE + s[i:]
    # b. hashes de los scripts en línea
    hashes, av = hashes_de(s)
    avisos += av
    # a. y c. la política: solo script-src
    m = RE_CSP.search(s)
    if m:
        nueva = politica_nueva(m.group(1), hashes)
        if nueva != m.group(1):
            s = s[:m.start(1)] + nueva + s[m.end(1):]
    else:
        base = CSP_PROPIA.get(rel, CSP_ESTANDAR)
        nueva = politica_nueva(base, hashes)
        mc = RE_CHARSET.search(s)
        s = s[:mc.end()] + '\n<meta http-equiv="Content-Security-Policy" content="%s">' % nueva + s[mc.end():]
        avisos.append('no tenía política: puesta ' + ('la propia (CSP_PROPIA)' if rel in CSP_PROPIA else 'la estándar'))
    # e. lo que la política nueva bloquea y hay que arreglar a mano
    limpio = sin_scripts(s)
    for mm in RE_MANEJADOR.finditer(limpio):
        avisos.append('manejador en línea %s= (bloqueado por la política; pasar a addEventListener): %s' % (mm.group(1), mm.group(0)[:120]))
    for mm in RE_JAVASCRIPT.finditer(limpio):
        avisos.append('«javascript:» en un atributo (bloqueado): ' + limpio[max(0, mm.start() - 40):mm.end() + 40].replace('\n', ' '))
    if any(t.lower() == "'unsafe-inline'" for t in script_src_de(nueva)):
        avisos.append("script-src sigue con 'unsafe-inline' (revisar)")
    if s != o:
        if not SOLO_VER:
            open(ruta, 'w', encoding='utf-8').write(s)
        return 'cambiada', len(hashes), avisos
    return 'igual', len(hashes), avisos


def paginas():
    if SUELTAS:
        return [os.path.relpath(os.path.abspath(a), RAIZ).replace(os.sep, '/') for a in SUELTAS]
    out = []
    for carpeta, dirs, archivos in os.walk(RAIZ):
        rel = os.path.relpath(carpeta, RAIZ).replace(os.sep, '/')
        rel = '' if rel == '.' else rel + '/'
        if rel.startswith(FUERA):
            dirs[:] = []
            continue
        for a in archivos:
            if not a.endswith('.html'):
                continue
            if rel == '' and a.startswith('google'):
                continue  # archivos de verificación de Google en la raíz (no son páginas)
            out.append(rel + a)
    return sorted(out)


def main():
    n = {'cambiada': 0, 'igual': 0, 'sin charset': 0, 'sin body': 0}
    con_hash = sin_hash = total_hashes = 0
    avisos_total = 0
    for rel in paginas():
        r, nh, avisos = trata(os.path.join(RAIZ, rel), rel)
        n[r] += 1
        if r in ('cambiada', 'igual'):
            total_hashes += nh
            if nh:
                con_hash += 1
            else:
                sin_hash += 1
        for a in avisos:
            avisos_total += 1
            print('AVISO %s: %s' % (rel, a))
    print('páginas: %d · cambiadas: %d · iguales: %d · con scripts en línea: %d (%d hashes) · sin scripts en línea: %d · avisos: %d'
          % (sum(n.values()), n['cambiada'], n['igual'], con_hash, total_hashes, sin_hash, avisos_total))
    if n['sin charset'] or n['sin body']:
        print('sin tocar:', {k: v for k, v in n.items() if k in ('sin charset', 'sin body') and v})


if __name__ == '__main__':
    main()
