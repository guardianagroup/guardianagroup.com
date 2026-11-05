#!/usr/bin/env python3
"""publica_paginas.py <web> <vieja> <nueva> <ejecucion_vieja> <ejecucion_nueva> <sha_es> <sha_en> <sha_pt> <bytes_es> <bytes_en> <bytes_pt>
Pone las páginas de descarga (instalar, install, instalar pt, la portada y ZERO) en la versión nueva, como se hizo en la 1.0.53
(e185c61): versión, ejecución de candidato.yml, huellas SHA-256 y tamaños (MB de 10^6, un decimal). Las huellas viejas se leen
de descargas/<vieja>/SHA256SUMS. No toca nada más; después, herramientas/csp-hashes.py."""
import pathlib, re, sys
web, vieja, nueva, ev, en_, hes, hen, hpt, bes, ben, bpt = sys.argv[1:12]
W = pathlib.Path(web)
sumas = (W / 'descargas' / vieja / 'SHA256SUMS').read_text()
viejas = {}
for l in sumas.splitlines():
    h, n = l.split()[:2]
    n = n.lstrip('*')
    viejas['en' if n.endswith('-en.msi') else 'pt' if n.endswith('-pt.msi') else 'es'] = h
nuevas = {'es': hes, 'en': hen, 'pt': hpt}
for h in nuevas.values():
    assert re.fullmatch(r'[0-9a-f]{64}', h), h
mb = lambda b, coma: (('%.1f' % (int(b) / 1e6)).replace('.', ',') if coma else '%.1f' % (int(b) / 1e6))
# 5 nov 2026: también ZERO en inglés y en portugués (seguían en la 1.0.50, con enlaces a instaladores que ya no estaban)
paginas = {'instalar.html': ('es', True), 'en/install.html': ('en', False), 'pt/instalar.html': ('pt', True), 'index.html': ('es', True),
           'zero.html': ('es', True), 'en/zero.html': ('en', False), 'pt/zero.html': ('pt', True)}
ZERO = ('zero.html', 'en/zero.html', 'pt/zero.html')
tam = {'es': bes, 'en': ben, 'pt': bpt}
# todas se preparan antes de escribir ninguna: si una no queda bien, no se cambia nada
listas = {}
for rel, (idioma, coma) in paginas.items():
    p = W / rel
    s = p.read_text(encoding='utf-8')
    antes = s
    s = s.replace(vieja, nueva).replace(ev, en_)
    for k in ('es', 'en', 'pt'):
        s = s.replace(viejas[k], nuevas[k])
    # el tamaño de su MSI («59,5 MB», o «59.5 MB» en inglés): el de antes, exacto, por el de ahora
    msi = {'es': '', 'en': '-en', 'pt': '-pt'}[idioma]
    viejo_b = (W / 'descargas' / vieja / ('guardiana-%s-windows-x64%s.msi' % (vieja, msi))).stat().st_size
    s = s.replace(mb(viejo_b, coma) + ' MB', mb(tam[idioma], coma) + ' MB')
    if rel in ZERO:
        # ZERO enseña un solo instalador, el de su idioma: su enlace, su huella, la versión y el tamaño, sean de la versión
        # que sean (5 nov 2026: zero.html seguía con la huella de la 1.0.50 y las otras dos, en la 1.0.50 entera)
        s = re.sub(r'/descargas/1\.0\.\d+/guardiana-1\.0\.\d+-windows-x64' + msi + r'\.msi',
                   '/descargas/%s/guardiana-%s-windows-x64%s.msi' % (nueva, nueva, msi), s)
        s = re.sub(r'(<code class="huella">)[0-9a-f]{64}(</code>)', lambda m: m.group(1) + nuevas[idioma] + m.group(2), s)
        s = re.sub(r'GUARDIANA 1\.0\.\d+ (incluye|includes|inclui)', lambda m: 'GUARDIANA %s %s' % (nueva, m.group(1)), s)
        s = re.sub(r'(Windows 10 (?:y|and|e) 11 · (?:(?:español|English|português) · )?)\d+[.,]\d MB',
                   lambda m: m.group(1) + mb(tam[idioma], coma) + ' MB', s)
    # nada de otra versión ni otra huella: si queda algo, se dice y no se escribe
    otras = sorted(set(re.findall(r'/descargas/(1\.0\.\d+)/', s)) - {nueva})
    huellas = sorted(set(re.findall(r'\b[0-9a-f]{64}\b', s)) - set(nuevas.values()))
    if otras or huellas:
        sys.exit('%s: quedan descargas de %s y huellas %s; arréglalo a mano antes de publicar (no se ha cambiado nada)' % (rel, otras, [h[:12] for h in huellas]))
    listas[p] = (s, antes)
for p, (s, antes) in listas.items():
    p.write_text(s, encoding='utf-8')
    print(p.relative_to(W), 'cambiada' if s != antes else 'igual', '·', s.count(nueva), 'veces', nueva)
