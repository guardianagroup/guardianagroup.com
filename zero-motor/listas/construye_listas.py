#!/usr/bin/env python3
"""Construye las listas de filtros de ZERO a partir de sus repositorios públicos (26 Oct 2026, ronda 40).

Solo entran listas con licencia que permite el uso comercial, y de cada una se guarda URL, licencia, commit y fecha
en `fuentes.json` (registro obligatorio, Astra ronda 40). Fuera: DuckDuckGo Tracker Radar y Disconnect (CC BY-NC-SA 4.0).

Uso: python3 zero-motor/listas/construye_listas.py <carpeta con los clones>
     (clones: git clone --depth 1 https://github.com/easylist/easylist ; https://github.com/uBlockOrigin/uAssets)
Escribe easylist.txt, easyprivacy.txt y ubo-*.txt en esta carpeta (no se suben al repositorio: ver .gitignore).
"""
import json, os, re, subprocess, sys
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.expanduser('~'), 'listas-src')

FUENTES = {
    'easylist': {
        'nombre': 'EasyList', 'url': 'https://github.com/easylist/easylist', 'licencia': 'GPL-3.0 o CC BY-SA 3.0 (doble licencia)',
        'licencia_url': 'https://easylist.to/pages/licence.html', 'proposito': 'publicidad', 'plantilla': 'easylist.template', 'repo': 'easylist'},
    'easyprivacy': {
        'nombre': 'EasyPrivacy', 'url': 'https://github.com/easylist/easylist', 'licencia': 'GPL-3.0 o CC BY-SA 3.0 (doble licencia)',
        'licencia_url': 'https://easylist.to/pages/licence.html', 'proposito': 'rastreo', 'plantilla': 'easyprivacy.template', 'repo': 'easylist'},
    'ubo-privacy': {'nombre': 'uBlock Origin · privacy', 'url': 'https://github.com/uBlockOrigin/uAssets', 'licencia': 'GPL-3.0',
                    'licencia_url': 'https://github.com/uBlockOrigin/uAssets/blob/master/LICENSE', 'proposito': 'rastreo', 'archivo': 'filters/privacy.txt', 'repo': 'uAssets'},
    'ubo-badware': {'nombre': 'uBlock Origin · badware', 'url': 'https://github.com/uBlockOrigin/uAssets', 'licencia': 'GPL-3.0',
                    'licencia_url': 'https://github.com/uBlockOrigin/uAssets/blob/master/LICENSE', 'proposito': 'malware', 'archivo': 'filters/badware.txt', 'repo': 'uAssets'},
    'ubo-filters': {'nombre': 'uBlock Origin · filters', 'url': 'https://github.com/uBlockOrigin/uAssets', 'licencia': 'GPL-3.0',
                    'licencia_url': 'https://github.com/uBlockOrigin/uAssets/blob/master/LICENSE', 'proposito': 'publicidad', 'archivo': 'filters/filters.txt', 'repo': 'uAssets'},
    'ubo-unbreak': {'nombre': 'uBlock Origin · unbreak', 'url': 'https://github.com/uBlockOrigin/uAssets', 'licencia': 'GPL-3.0',
                    'licencia_url': 'https://github.com/uBlockOrigin/uAssets/blob/master/LICENSE', 'proposito': 'excepciones', 'archivo': 'filters/unbreak.txt', 'repo': 'uAssets'},
    'ubo-removeparam': {'nombre': 'uBlock Origin · privacy-removeparam', 'url': 'https://github.com/uBlockOrigin/uAssets', 'licencia': 'GPL-3.0',
                        'licencia_url': 'https://github.com/uBlockOrigin/uAssets/blob/master/LICENSE', 'proposito': 'parametros', 'archivo': 'filters/privacy-removeparam.txt', 'repo': 'uAssets'},
    'ubo-cookies': {'nombre': 'uBlock Origin · annoyances-cookies', 'url': 'https://github.com/uBlockOrigin/uAssets', 'licencia': 'GPL-3.0',
                    'licencia_url': 'https://github.com/uBlockOrigin/uAssets/blob/master/LICENSE', 'proposito': 'avisos-cookies', 'archivo': 'filters/annoyances-cookies.txt', 'repo': 'uAssets'},
    'ubo-lan': {'nombre': 'uBlock Origin · lan-block', 'url': 'https://github.com/uBlockOrigin/uAssets', 'licencia': 'GPL-3.0',
                'licencia_url': 'https://github.com/uBlockOrigin/uAssets/blob/master/LICENSE', 'proposito': 'red-local', 'archivo': 'filters/lan-block.txt', 'repo': 'uAssets'},
}
EXCLUIDAS = {
    'DuckDuckGo Tracker Radar': 'CC BY-NC-SA 4.0: sin uso comercial sin permiso de DuckDuckGo',
    'Disconnect': 'CC BY-NC-SA 4.0 (LICENSE del repositorio disconnect-tracking-protection)',
}


def commit(repo):
    d = os.path.join(SRC, repo)
    sha = subprocess.run(['git', '-C', d, 'log', '-1', '--format=%H'], capture_output=True, text=True).stdout.strip()
    fecha = subprocess.run(['git', '-C', d, 'log', '-1', '--format=%cI'], capture_output=True, text=True).stdout.strip()
    return sha, fecha


def expande(repo_dir, plantilla):
    """Resuelve las líneas %include easylist:ruta% de las plantillas de EasyList."""
    out = []
    for linea in open(os.path.join(repo_dir, plantilla), encoding='utf-8'):
        m = re.match(r'%include easylist:(.+?)%', linea.strip())
        if m:
            ruta = os.path.join(repo_dir, m.group(1))
            if os.path.exists(ruta):
                out.append(open(ruta, encoding='utf-8').read().rstrip('\n') + '\n')
            else:
                out.append('! (falta %s)\n' % m.group(1))
        else:
            out.append(linea.replace('%timestamp%', datetime.now(timezone.utc).strftime('%d %b %Y %H:%M UTC')))
    return ''.join(out)


def main():
    reg = {'generado': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'listas': {}, 'excluidas': EXCLUIDAS}
    for clave, f in FUENTES.items():
        repo_dir = os.path.join(SRC, f['repo'])
        if not os.path.isdir(repo_dir):
            print('falta el clon de', f['repo']); continue
        texto = expande(repo_dir, f['plantilla']) if 'plantilla' in f else open(os.path.join(repo_dir, f['archivo']), encoding='utf-8').read()
        destino = os.path.join(AQUI, clave + '.txt')
        open(destino, 'w', encoding='utf-8').write(texto)
        sha, fecha = commit(f['repo'])
        n = sum(1 for l in texto.splitlines() if l and not l.startswith('!') and not l.startswith('['))
        reg['listas'][clave] = {k: v for k, v in f.items() if k not in ('plantilla', 'archivo', 'repo')} | {
            'archivo': clave + '.txt', 'commit': sha, 'fecha_commit': fecha, 'reglas': n, 'origen': f.get('plantilla') or f.get('archivo')}
        print('%-16s %7d reglas  %s' % (clave, n, fecha))
    json.dump(reg, open(os.path.join(AQUI, 'fuentes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
