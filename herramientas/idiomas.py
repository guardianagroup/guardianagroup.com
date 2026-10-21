#!/usr/bin/env python3
"""Builds the home page language files (21 Oct 2026).

Spanish, English and Portuguese live inside index.html. Every other language is written natively in
i18n/fuente/<code>.json (texts by number, see i18n/portada/_claves.json) and this script turns it into
i18n/portada/<code>.json, keyed by a stable id of each Spanish text, so the page can fetch only the
reader's language. It also checks that nothing is missing and updates the list of languages offered
by the page (data-idiomas on <html>).

    python3 herramientas/idiomas.py            # build every language in i18n/fuente
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDEN = ['es', 'en', 'pt', 'fr', 'de', 'it', 'nl', 'pl', 'uk', 'ru', 'tr', 'zh', 'ja', 'ko', 'hi', 'bn', 'id', 'vi', 'th',
         'ar', 'fa', 'he', 'ur', 'zh-tw', 'cs', 'ro', 'hu', 'el', 'sv', 'da', 'fi', 'nb', 'sk', 'bg', 'hr', 'ms', 'fil', 'sw', 'ta', 'te', 'pt-pt']
X_CLAVES = {'sat': ['{a}', '{b}', '{p}'], 'cab': ['{n}'], 'tieL': [], 'tie': [], 'share': ['{d}'], 'copied': [], 'shared': [], 'meta': []}


def hid(t):
    """FNV-1a over UTF-16 code units, the same as hid() in index.html."""
    h = 0x811c9dc5
    b = t.encode('utf-16-le')
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xffffffff
    return format(h, '08x')


def norm(t):
    return re.sub(r'\s+', ' ', t).strip()


def main():
    html = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    a = html.index('const I={')
    I = json.loads(html[a + 8:html.index('\n', a)].rstrip(';'))
    claves = json.load(open(os.path.join(RAIZ, 'i18n/portada/_claves.json'), encoding='utf-8'))
    usadas = json.load(open(os.path.join(RAIZ, 'i18n/portada/_usadas.json'), encoding='utf-8'))
    faltan_en_pagina = [i for i in usadas if claves[i] not in I['d']]
    if faltan_en_pagina:
        sys.exit(f'_claves.json no coincide con index.html: {faltan_en_pagina[:5]}')
    hechos, errores = [], []
    fuente = os.path.join(RAIZ, 'i18n/fuente')
    for f in sorted(os.listdir(fuente)):
        if not f.endswith('.json'):
            continue
        l = f[:-5]
        src = json.load(open(os.path.join(fuente, f), encoding='utf-8'))
        t = {int(k): v for k, v in src['t'].items()}
        falta = [i for i in usadas if i not in t]
        if falta:
            errores.append(f'{l}: faltan textos {falta[:12]}{"…" if len(falta) > 12 else ""}')
        for k, ph in X_CLAVES.items():
            v = src.get('x', {}).get(k)
            if v is None:
                errores.append(f'{l}: falta x.{k}')
            elif isinstance(v, str) and any(p not in v for p in ph):
                errores.append(f'{l}: x.{k} sin {ph}')
        if len(src.get('x', {}).get('tieL', [])) != 3:
            errores.append(f'{l}: x.tieL debe tener 3 textos')
        luz, ambar = src['light']
        if not luz.strip().endswith(ambar.strip()):
            errores.append(f'{l}: light no termina en su parte ámbar')
        if not (0 <= src['hi'] < len(src['phrase'])):
            errores.append(f'{l}: hi fuera de la frase')
        out = {'t': {hid(norm(claves[i])): t[i] for i in usadas if i in t},
               'phrase': src['phrase'], 'hi': src['hi'], 'light': [luz, ambar], 'title': src['title'], 'x': src['x']}
        if 'sep' in src:
            out['sep'] = src['sep']
        if src.get('dir') == 'rtl':
            out['dir'] = 'rtl'
        json.dump(out, open(os.path.join(RAIZ, f'i18n/portada/{l}.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        hechos.append(l)
    if errores:
        print('\n'.join(errores))
        sys.exit(1)
    lista = [l for l in ORDEN if l in ('es', 'en', 'pt') or l in hechos]
    html = re.sub(r'data-idiomas="[^"]*"', f'data-idiomas="{",".join(lista)}"', html, count=1)
    open(os.path.join(RAIZ, 'index.html'), 'w', encoding='utf-8').write(html)
    print('idiomas:', ', '.join(lista))


if __name__ == '__main__':
    main()
