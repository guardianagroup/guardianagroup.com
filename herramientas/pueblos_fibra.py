#!/usr/bin/env python3
"""GUARDIANA · Órbita: the towns the agency's land backbones pass through, so they can be placed on the map.

fibra_agencia.py places every city of the voices' routes with the GeoNames list of 15,000 people or more; many
backbones of small countries go through smaller towns (Siguiri, Nzérékoré, Gelephu…), and the voices often write a
town's usual English name, not GeoNames' main one (Gomel for Homyel'). This reads GeoNames cities500 (CC BY 4.0, every
populated place of more than 500 people, with its alternate names) and keeps only the places whose name, or one of
whose alternate names, is a town that a voice wrote for that same country in herramientas/fibra-agencia/*.json. It
writes herramientas/fuentes/pueblos-fibra.tsv (folded name as the voices wrote it, country, latitude, longitude,
population, GeoNames name), the most populous place per name and country.

Run by .github/workflows/pueblos-cables.yml (the download is not reachable from every machine):
    python3 herramientas/pueblos_fibra.py /tmp/geonames/cities500.txt
"""
import glob, json, os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from fibra_agencia import pliega, ALIAS  # noqa: E402

FUERA = {'PPLX', 'PPLH', 'PPLQ', 'PPLW', 'PPLCH'}

def buscados():
    out = set()
    for f in glob.glob(os.path.join(AQUI, 'fibra-agencia', '*.json')) + glob.glob(os.path.join(AQUI, 'radio-agencia', '*.json')):  # round 27: the radio chains' towns too
        try:
            datos = json.load(open(f, encoding='utf-8'))
        except ValueError:
            continue
        for r in datos if isinstance(datos, list) else []:
            cc = (r.get('pais') or '').upper()[:2]
            for c in r.get('ciudades') or []:
                for k in {pliega(c), pliega(re.split(r'[(/,]', c)[0])}:
                    if k:
                        out.add((cc, ALIAS.get(k, k)))
    # 25 Oct 2026 (revisión completa: Atlantis-2 drawn to the sea east of Tenerife for «El Médano», SMAP to Geelong for
    # «Torquay»): the places where the agency's submarine cables land, so cables_agencia.py can check the voices'
    # coordinates against the real town
    for f in glob.glob(os.path.join(AQUI, 'cables-agencia', '*.json')):
        try:
            datos = json.load(open(f, encoding='utf-8'))
        except ValueError:
            continue
        for c in datos if isinstance(datos, list) else []:
            for L in (c.get('llegadas') or []) if isinstance(c, dict) else []:
                cc = (L.get('pais') or '').upper()[:2]
                k = pliega(re.split(r'[(/,]', L.get('lugar') or '')[0])
                if cc and k: out.add((cc, k))
    return out

def main(ruta):
    quiero = buscados()
    mejor = {}
    with open(ruta, encoding='utf-8') as f:
        for l in f:
            c = l.rstrip('\n').split('\t')
            if len(c) < 15 or c[6] != 'P' or c[7] in FUERA:
                continue
            cc, pob = c[8], int(c[14] or 0)
            nombres = {c[1], c[2]} | set(x for x in c[3].split(',') if x)
            for n in nombres:
                k = pliega(n)
                if (cc, k) in quiero and ((cc, k) not in mejor or pob > mejor[(cc, k)][2]):
                    mejor[(cc, k)] = (float(c[4]), float(c[5]), pob, c[1])
    destino = os.path.join(AQUI, 'fuentes', 'pueblos-fibra.tsv')
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, 'w', encoding='utf-8') as f:
        f.write('# GeoNames cities500, CC BY 4.0, https://www.geonames.org — los pueblos por los que pasan las troncales de la agencia: clave, país, lat, lon, población, nombre\n')
        for (cc, k), (la, lo, pob, n) in sorted(mejor.items()):
            f.write(f'{k}\t{cc}\t{la}\t{lo}\t{pob}\t{n}\n')
    print(f'{len(mejor)} de {len(quiero)} nombres de las troncales encontrados en GeoNames cities500 → {destino}')

if __name__ == '__main__':
    if len(sys.argv) < 2 or not os.path.exists(sys.argv[1]):
        sys.exit('uso: pueblos_fibra.py /ruta/a/cities500.txt')
    main(sys.argv[1])
