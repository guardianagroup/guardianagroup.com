#!/usr/bin/env python3
"""Ronda 35: the addresses each voice gave, cleaned for Nominatim: [[id, voz, q1, q2, cc], …] for the batch given."""
import json, re, sys, os
AQUI = os.path.dirname(os.path.abspath(__file__))
lote = int(sys.argv[1])
lista = json.load(open(os.path.join(AQUI, 'lista.json'), encoding='utf-8'))
out = []
for voz in ('chatgpt', 'gemini', 'astra'):
    f = os.path.join(AQUI, '%s-%d.json' % (voz, lote))
    if not os.path.exists(f): continue
    for x in json.load(open(f, encoding='utf-8')):
        d = x[1]
        if not d: continue
        i = x[0]; L = lista[i - 1]
        c = re.sub(r'\([^)]*\)', '', d)
        c = re.sub(r'\s+-\s+', ', ', c)
        c = re.sub(r'\b\d{5}-\d{3}\b|\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b', '', c)  # Brazilian CEP, British postcode
        c = re.sub(r',\s*,+', ',', c).strip(' ,')
        partes = [p.strip() for p in c.split(',') if p.strip()]
        primera = partes[0]
        if len(partes) > 1 and re.fullmatch(r'\d+[A-Za-z]?', partes[1]): primera = partes[0] + ' ' + partes[1]
        out.append([i, voz, c, primera + ', ' + L['ciudad'], L['cc'].lower()])
print(json.dumps(out, ensure_ascii=False))
