#!/usr/bin/env python3
"""GUARDIANA · Órbita: the day map at 16K, in tiles, so the zoom goes further without losing sharpness.

Owner, 22 Oct 2026: «dale un zoom o dos más, sin perder calidad, sobre todo». The 8K map (dia-8k.jpg) is sharp up
to about ×5; past that it goes soft. Source: NASA Blue Marble Next Generation, July, with topography and bathymetry
(public domain, 21,600 × 10,800), the same family of imagery as static/tierra/dia.jpg, so the colours match.

Output: orbita/static/tierra/dia-16k/{col}_{fila}.jpg — 8 columns × 4 rows of 2048 × 2048 (each tile covers
45° × 45°; column 0 starts at 180° W, row 0 at the north pole), about 16 MB in all. The page (orbita.js) loads only
the tiles under the part of the planet on screen, from ×2.6 on, and only on computers.
Runs in the workflow (it needs the network); nothing else of the site changes.
"""
import io, os, sys, urllib.request

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'orbita', 'static', 'tierra')
FUENTE = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/july/world.topo.bathy.200407.3x21600x10800.jpg'
FUENTE2 = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73776/world.topo.bathy.200407.3x21600x10800.jpg'  # the old address, in case the new one moves
ANCHO, ALTO, TESELA = 16384, 8192, 2048

def main():
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    dest = os.path.join(RAIZ, 'dia-16k')
    os.makedirs(dest, exist_ok=True)
    local = sys.argv[1] if len(sys.argv) > 1 else None
    if local:
        im = Image.open(local)
    else:
        datos = None
        for url in (FUENTE, FUENTE2):
            try:
                print('descargando', url, flush=True)
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 GUARDIANA Orbita (guardianagroup.com)'})
                with urllib.request.urlopen(req, timeout=900) as r:
                    datos = r.read()
                break
            except Exception as e:
                print('no se pudo:', e, flush=True)
        if not datos:
            raise SystemExit('sin mapa de la NASA')
        print('descargado', len(datos) // 1048576, 'MB')
        im = Image.open(io.BytesIO(datos))
    im = im.convert('RGB')
    print('origen', im.size)
    im = im.resize((ANCHO, ALTO), Image.LANCZOS)
    total = 0
    for fila in range(ALTO // TESELA):
        for col in range(ANCHO // TESELA):
            t = im.crop((col * TESELA, fila * TESELA, (col + 1) * TESELA, (fila + 1) * TESELA))
            p = os.path.join(dest, f'{col}_{fila}.jpg')
            t.save(p, 'JPEG', quality=84, optimize=True, progressive=True, subsampling=1)
            total += os.path.getsize(p)
    with open(os.path.join(dest, 'FUENTE.txt'), 'w', encoding='utf-8') as f:
        f.write('NASA Blue Marble Next Generation (julio, con relieve y batimetría), dominio público.\n' + FUENTE + '\nReducido a 16384 × 8192 y partido en teselas de 2048 × 2048 (8 × 4, 45° cada una).\n')
    print('teselas en', dest, '·', total // 1048576, 'MB')

if __name__ == '__main__':
    main()
