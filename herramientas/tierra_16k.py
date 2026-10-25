#!/usr/bin/env python3
"""GUARDIANA · Órbita: the coast of Natural Earth 10m (land + minor islands, public domain) as rasters.

24 Oct 2026 (owner: cables cutting across islands, and the island of Lewis missing from the grey map):
  - orbita/static/tierra/tierra-16k/<col>_<row>.png: 16384 × 8192 (0.022° a pixel) in 32 tiles of 2048 × 2048, like
    dia-16k; white = land. The grey («limpio») planet uses them inside its zoom zone (orbita.js, uZonaT).
  - herramientas/fuentes/tierra-ne10m.png: 14400 × 7200 (0.025°), white = land. cables_agencia.py (class Fina) traces
    the agency's sea routes again where they cross land, and revisa_tierra.py / revisa_extremos.py measure the result.

Usage: python3 tierra_16k.py <folder with ne_10m_land.geojson and ne_10m_minor_islands.geojson>
(from https://github.com/nvkelso/natural-earth-vector, folder geojson/)
"""
import json, os, sys
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
Image.MAX_IMAGE_PIXELS = None


def raster(src, W, H, modo='L'):
    P = 360 / W
    im = Image.new(modo, (W, H), 0); d = ImageDraw.Draw(im)
    def xy(r): return [((lo + 180) / P, (90 - la) / P) for lo, la in r]
    for f in ('ne_10m_land.geojson', 'ne_10m_minor_islands.geojson'):
        for ft in json.load(open(os.path.join(src, f), encoding='utf-8'))['features']:
            g = ft['geometry']; ps = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
            for p in ps:
                d.polygon(xy(p[0]), fill=255 if modo == 'L' else 1)
                for h in p[1:]: d.polygon(xy(h), fill=0)
    return im


def main():
    src = sys.argv[1]
    im = raster(src, 16384, 8192)
    out = os.path.join(AQUI, '..', 'orbita', 'static', 'tierra', 'tierra-16k'); os.makedirs(out, exist_ok=True)
    for c in range(8):
        for f in range(4):
            im.crop((c * 2048, f * 2048, (c + 1) * 2048, (f + 1) * 2048)).convert('1').save(os.path.join(out, '%d_%d.png' % (c, f)), optimize=True)
    raster(src, 14400, 7200, '1').save(os.path.join(AQUI, 'fuentes', 'tierra-ne10m.png'), optimize=True)
    print('hecho')


if __name__ == '__main__':
    main()
