import json, sys, runpy, re
import os; S=os.path.dirname(os.path.abspath(__file__))+'/'
src=[x[0] for x in json.load(open(S+'por-traducir-en.json'))]
T=runpy.run_path(sys.argv[1])['T']
for l, v in T.items():
    assert len(v)==len(src), (l, len(v))
    for s, t in zip(src, v):
        for ph in ('{n}', '{m}', 'GUARDIANA', 'SHA-256', 'OpenStreetMap', 'Tbit/s'):
            if ph in s: assert ph in t, (l, ph, t)
        if 'de X a Y' in s: assert 'X' in t and 'Y' in t, (l, t)
    f=os.path.join(S, '..', '..', '..', 'orbita', 'static', 'i18n', '%s.json' % l)
    d=json.load(open(f, encoding='utf-8')); n=0
    for s, t in zip(src, v):
        if s not in d['t']: d['t'][s]=t; n+=1
    open(f,'w',encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1))
    print(l, 'añadidas', n)
