#!/usr/bin/env python3
"""Ronda 26: turns a voice's raw answer (a JSON array, possibly cut short by the token limit) into the JSON file the
generators read. Only complete objects are kept; a cut-off last object is kept only when its route is complete and
its «fuente» is the only field cut (then it says so). Usage: a_json.py <raw.txt> <out.json>"""
import json, re, sys

raw = open(sys.argv[1], encoding='utf-8').read()
i = raw.find('[')
s = raw[i + 1:] if i >= 0 else raw
dec = json.JSONDecoder()
objs, pos = [], 0
while True:
    m = re.search(r'\{', s[pos:])
    if not m: break
    st = pos + m.start()
    try:
        o, end = dec.raw_decode(s, st)
        objs.append(o); pos = end
    except json.JSONDecodeError:
        frag = s[st:]
        # a cut «fuente»: close it and keep the route
        mm = re.match(r'(\{.*"estado"\s*:\s*"[^"]*",\s*"fuente"\s*:\s*")([^"]*)$', frag, re.S)
        if mm:
            try:
                o = json.loads(mm.group(1) + mm.group(2).replace('\n', ' ').strip() + ' (respuesta cortada)"}')
                objs.append(o)
            except json.JSONDecodeError:
                pass
        break
json.dump(objs, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(objs), 'rutas →', sys.argv[2])
for o in objs: print('  ', o.get('pais'), '·', o.get('operador'), '·', ' – '.join(o.get('ciudades') or []))
