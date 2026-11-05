#!/usr/bin/env python3
"""indexnow.py <web> [--envia]: el aviso a IndexNow (Bing, Yandex, Seznam, Naver y DuckDuckGo a través de Bing) con las
direcciones del sitemap.xml publicado. Sin --envia solo escribe herramientas/seo/indexnow.json y enseña la orden curl; con
--envia lo manda a https://api.indexnow.org/indexnow desde este PC (hace falta que la web esté ya publicada: la clave es el
archivo <clave>.txt de la raíz). Respuesta esperada: 200 (aceptado) o 202 (aceptado, clave pendiente); 422 = alguna URL no es
del dominio; 403 = la clave no coincide con el archivo (5 nov 2026, SEO)."""
import json, pathlib, re, sys, urllib.request

HOST = 'guardianagroup.com'
args = [a for a in sys.argv[1:] if not a.startswith('--')]
raras = [a for a in sys.argv[1:] if a.startswith('--') and a != '--envia']
if raras or not args:
    sys.exit('uso: indexnow.py <web> [--envia]')
web = pathlib.Path(args[0])
claves = sorted(p for p in web.glob('*.txt') if re.fullmatch(r'[0-9a-f]{32}', p.stem) and p.read_text().strip() == p.stem)
if len(claves) != 1:
    sys.exit('hace falta exactamente un archivo <clave>.txt en la raíz (hay %d)' % len(claves))
clave = claves[0].stem
urls = re.findall(r'<loc>(https://%s/[^<]*)</loc>' % re.escape(HOST), (web / 'sitemap.xml').read_text(encoding='utf-8'))
urls = sorted(set(urls))
if not urls:
    sys.exit('el sitemap no tiene direcciones')
cuerpo = {'host': HOST, 'key': clave, 'keyLocation': 'https://%s/%s.txt' % (HOST, clave), 'urlList': urls}
salida = web / 'herramientas' / 'seo' / 'indexnow.json'
salida.write_text(json.dumps(cuerpo, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print('%d direcciones -> %s' % (len(urls), salida))
if '--envia' not in sys.argv:
    print('para enviarlo: python3 herramientas/indexnow.py . --envia   (o, en Windows, PowerShell: '
          'curl.exe -sS -o NUL -w "IndexNow: HTTP %{http_code}" -X POST https://api.indexnow.org/indexnow '
          '-H "Content-Type: application/json; charset=utf-8" --data-binary "@herramientas/seo/indexnow.json")')
    sys.exit(0)
datos = json.dumps(cuerpo).encode('utf-8')
pet = urllib.request.Request('https://api.indexnow.org/indexnow', data=datos,
                             headers={'Content-Type': 'application/json; charset=utf-8'}, method='POST')
try:
    with urllib.request.urlopen(pet, timeout=30) as r:
        print('IndexNow: HTTP', r.status)
except urllib.error.HTTPError as e:
    print('IndexNow: HTTP', e.code, e.read().decode('utf-8', 'replace')[:200])
