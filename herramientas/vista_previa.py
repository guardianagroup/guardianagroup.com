#!/usr/bin/env python3
"""GUARDIANA · Órbita: prepare the private design preview (the Claude artifact) from a copy of orbita/.

The artifact wraps the page in its own <html>/<head>/<body>, so index.html is turned into body content:
  - the <head> links (styles, preload) and the <title> are kept at the top of the file;
  - the attributes of <html> (data-tierra, data-demo, data-cortes, lang) and the class of <body> are set by a script;
  - the door to ZERO becomes zero/index.html?orbita=1&entrada=0 (the artifact serves files, not folders).
Usage: python3 herramientas/vista_previa.py <destination folder>
"""
import os, re, shutil, sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'orbita')

def main(dest):
    if os.path.exists(dest): shutil.rmtree(dest)
    shutil.copytree(RAIZ, dest, ignore=shutil.ignore_patterns('*.py', '__pycache__'))
    p = os.path.join(dest, 'index.html')
    h = open(p, encoding='utf-8').read()
    html_attrs = dict(re.findall(r'(\w[\w-]*)="([^"]*)"', re.search(r'<html([^>]*)>', h).group(1)))
    body_class = (re.search(r'<body[^>]*class="([^"]*)"', h) or [None, ''])[1]
    head = re.search(r'<head>(.*?)</head>', h, re.S).group(1)
    keep = [l for l in re.findall(r'<(?:link|title)[^>]*>(?:[^<]*</title>)?', head) if 'favicon' not in l]
    body = re.search(r'<body[^>]*>(.*)</body>', h, re.S).group(1)
    script = '<script>(function(){var d=document.documentElement;' + ''.join('d.setAttribute(%r,%r);' % (k, v) for k, v in html_attrs.items()) + ('document.body.className=%r;' % body_class if body_class else '') + '})();</script>'
    open(p, 'w', encoding='utf-8').write('\n'.join(keep) + '\n' + script + body)
    j = os.path.join(dest, 'static', 'orbita.js')
    s = open(j, encoding='utf-8').read().replace("'zero/?orbita=1&entrada=0'", "'zero/index.html?orbita=1&entrada=0'")
    open(j, 'w', encoding='utf-8').write(s)
    n = sum(len(f) for _, _, f in os.walk(dest))
    print('vista previa en', dest, '·', n, 'archivos')

if __name__ == '__main__':
    main(sys.argv[1])
