# Saves the text of the latest tool result that contains a marker (from this session's transcript),
# so long answers from the agency are kept word for word without retyping them.
import json, sys, re, glob, os
marca, salida = sys.argv[1], sys.argv[2]
desde = sys.argv[3] if len(sys.argv) > 3 else None
# the newest transcript of this machine (each session writes its own .jsonl)
f = max(glob.glob('/root/.claude/projects/*/*.jsonl'), key=os.path.getmtime)
ultimo = None
for linea in open(f, encoding='utf-8'):
    try: o = json.loads(linea)
    except Exception: continue
    msg = o.get('message') or {}
    cont = msg.get('content')
    if not isinstance(cont, list): continue
    for c in cont:
        if c.get('type') != 'tool_result': continue
        partes = c.get('content')
        textos = [p.get('text', '') for p in partes if isinstance(p, dict)] if isinstance(partes, list) else [partes or '']
        for t in textos:
            if marca in t: ultimo = t
if ultimo is None: sys.exit('no encontrado')
m = re.match(r'^(".*")\n\n\(captured at origin', ultimo, re.S)
texto = json.loads(m.group(1)) if m else ultimo
if desde and desde in texto: texto = texto[texto.index(desde):]
open(salida, 'w', encoding='utf-8').write(texto)
print(len(texto), 'caracteres en', salida)
