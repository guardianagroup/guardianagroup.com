# Comprueba que cada «?v=» de las páginas publicadas se subió después del último cambio de su archivo (28 Oct 2026:
# en tres publicaciones seguidas app.css y app.js cambiaron sin subir la versión). Ejecútalo después de publicar:
#   python3 herramientas/versiones.py   → «total desfasados: 0»
import re, subprocess, os, sys
R='/home/claude/guardianagroup.com'
def g(*a): return subprocess.run(['git','-C',R,*a],capture_output=True,text=True).stdout
main=set(g('ls-tree','-r','--name-only','origin/main').split('\n'))
files=[f for f in g('ls-files').split('\n') if f.endswith(('.html','.js','.css','.webmanifest'))]
pat=re.compile(r'''["'(]([^"'()?#\s]+\.(?:js|css|webmanifest|png|svg|json))\?v=([A-Za-z0-9._-]+)''')
seen=set(); malos=[]
for f in files:
    if f not in main: continue
    try: s=open(os.path.join(R,f),encoding='utf-8').read()
    except Exception: continue
    for m in pat.finditer(s):
        ref,ver=m.group(1),m.group(2)
        if ref.startswith(('http:','https:','//')): continue
        a=ref.lstrip('/') if ref.startswith('/') else os.path.normpath(os.path.join(os.path.dirname(f),ref))
        if not os.path.exists(os.path.join(R,a)): continue
        k=(f,ref,ver)
        if k in seen: continue
        seen.add(k)
        intro=g('log','-S',f'{ref}?v={ver}','--format=%H','--',f).split('\n')[0]
        if not intro: print('?',f,ref,ver); continue
        after=g('log','--format=%h %ad','--date=format:%d %H:%M',f'{intro}..HEAD','--',a).strip()
        if after:
            malos.append((f,ref,ver,a,after.split('\n')))
for f,ref,ver,a,after in malos:
    print(f'{f}: {ref}?v={ver}  ← {a} cambió después en {len(after)} commit(s): {after[0]}')
print('total desfasados:',len(malos))
