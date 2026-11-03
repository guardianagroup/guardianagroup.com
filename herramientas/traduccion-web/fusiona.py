#!/usr/bin/env python3
"""fusiona.py <web> <salida>: añade a orbita/static/i18n/<l>.json las traducciones de salida/<l>.json (español → idioma),
con las comillas que ya usa cada idioma en la web, y escribe el archivo con la misma forma (una entrada por línea)."""
import json, re, sys, pathlib
web, salida = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
ESTILO = {'de': ('„', '“'), 'pl': ('„', '”'), 'fi': ('”', '”'), 'ro': ('„', '”'), 'hu': ('„', '”'), 'id': ('“', '”'),
          'zh': ('“', '”'), 'ja': ('「', '」'), 'nl': ('“', '”'), 'sv': ('”', '”'), 'is': ('„', '“'), 'cs': ('„', '“'),
          'sk': ('„', '“'), 'bg': ('„', '“'), 'hr': ('„', '”'), 'tr': ('“', '”'), 'he': ('"', '"'), 'ur': ('“', '”'),
          'hi': ('“', '”'), 'bn': ('“', '”'), 'vi': ('“', '”'), 'ms': ('“', '”'), 'fil': ('“', '”'), 'ko': ('‘', '’'),
          'zh-tw': ('「', '」')}
def comillas(l, v):
    if l not in ESTILO:
        return v
    a, c = ESTILO[l]
    v = re.sub(r'«[   ]?', a, v)
    return re.sub(r'[   ]?»', c, v)
def escribe(ruta, d):
    partes = ['{']
    claves = list(d.keys())
    for n, sec in enumerate(claves):
        partes.append(json.dumps(sec, ensure_ascii=False) + ':{')
        items = list(d[sec].items())
        for i, (k, v) in enumerate(items):
            partes.append(json.dumps(k, ensure_ascii=False) + ':' + json.dumps(v, ensure_ascii=False) + (',' if i < len(items) - 1 else ''))
        partes.append('}' + (',' if n < len(claves) - 1 else ''))
    partes.append('}')
    ruta.write_text('\n'.join(partes) + '\n', encoding='utf-8')
hechos = {}
for f in sorted(salida.glob('*.json')):
    l = f.stem
    destino = web / f'{l}.json'
    if not destino.exists():
        continue
    d = json.loads(destino.read_text(encoding='utf-8'))
    nuevos = json.loads(f.read_text(encoding='utf-8'))
    n = 0
    for k, v in nuevos.items():
        if isinstance(v, str) and v.strip() and k not in d['t']:
            d['t'][k] = comillas(l, v)
            n += 1
    escribe(destino, d)
    json.loads(destino.read_text(encoding='utf-8'))
    hechos[l] = n
print(hechos)
