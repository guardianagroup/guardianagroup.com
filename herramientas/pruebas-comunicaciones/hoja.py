import sys
from PIL import Image, ImageDraw
# hoja.py salida.png ancho_cada img1 img2 ...
out, w = sys.argv[1], int(sys.argv[2])
ims = [Image.open(p).convert('RGB') for p in sys.argv[3:]]
ims = [im.resize((w, int(im.height * w / im.width))) for im in ims]
h = max(im.height for im in ims)
hoja = Image.new('RGB', (w * len(ims) + 12 * (len(ims) - 1), h + 26), (255, 255, 255))
d = ImageDraw.Draw(hoja)
x = 0
for p, im in zip(sys.argv[3:], ims):
    hoja.paste(im, (x, 26)); d.text((x + 4, 6), p.split('/')[-1][:40], fill=(0, 0, 0)); x += w + 12
hoja.save(out)
