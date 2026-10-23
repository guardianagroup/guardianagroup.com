#!/usr/bin/env python3
"""ESPEJO «Con / Sin GUARDIANA»: builds orbita/datos/espejo.json from the dated measurement and the agency's votes.

Rule of the agency (owner): only what at least two voices confirm is published. For each third-party domain the
voices are ChatGPT and Grok (both classified every domain), plus Gemini and Claude where those two disagree or one
did not know. A company and its country are published when two voices name the same company (after normalising
the name) and the same country; the category when two voices give the same one. A domain whose company is not
confirmed still counts as measured («dominios de otras empresas») but is not drawn and is never cut.

Usage: python3 construye.py   (writes ../../orbita/datos/espejo.json and prints what was left out)
"""
import json, os, sys
from collections import Counter

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, '..', '..', 'orbita', 'datos', 'espejo.json')

# the same company written in different ways by the voices → one display name
NOMBRES = {
    'grupo henneo': 'Henneo', 'henneo media': 'Henneo', 'henneo': 'Henneo',
    'triple lift': 'TripleLift', 'triplelift': 'TripleLift',
    'adaptmx': 'AdaptMX', 'adaptmx (monet engine)': 'AdaptMX',
    'microsoft': 'Microsoft', 'microsoft (xandr)': 'Microsoft', 'xandr (microsoft)': 'Microsoft',
    'anonymised (id ward limited)': 'Anonymised', 'anonymised': 'Anonymised', 'id ward': 'Anonymised',
    'bunny.net': 'BunnyWay', 'bunnyway': 'BunnyWay', 'bunnyway (bunny.net)': 'BunnyWay',
    'disqus (zeta global)': 'Zeta Global', 'zeta global (disqus)': 'Zeta Global', 'zeta global': 'Zeta Global',
    'the walt disney company (espn)': 'The Walt Disney Company', 'the walt disney company': 'The Walt Disney Company', 'disney': 'The Walt Disney Company', 'espn (the walt disney company)': 'The Walt Disney Company',
    'parse.ly': 'Automattic', 'automattic (parse.ly)': 'Automattic', 'automattic': 'Automattic',
    'piano (at internet)': 'Piano', 'piano': 'Piano', 'piano software': 'Piano',
    'teads': 'Teads', 'teads holding co.': 'Teads', 'teads holding co': 'Teads',
    'adobe inc.': 'Adobe', 'adobe': 'Adobe',
    'sky uk limited': 'Sky', 'sky': 'Sky', 'sky (comcast)': 'Sky', 'sky group': 'Sky',
    'paramount global': 'Paramount', 'paramount skydance': 'Paramount', 'paramount skydance corporation': 'Paramount', 'paramount': 'Paramount',
    'fox corporation': 'Fox Corporation', 'fox corp.': 'Fox Corporation', 'fox': 'Fox Corporation',
    'x corp': 'X Corp.', 'x corp.': 'X Corp.', 'x (twitter)': 'X Corp.', 'x': 'X Corp.',
    'epsilon (publicis groupe)': 'Epsilon', 'epsilon': 'Epsilon', 'publicis groupe (epsilon)': 'Epsilon',
    'freewheel (comcast)': 'FreeWheel', 'freewheel': 'FreeWheel',
    'integral ad science': 'Integral Ad Science', 'ias': 'Integral Ad Science',
    'virtual minds ag': 'Virtual Minds', 'virtual minds': 'Virtual Minds', 'adition technologies (virtual minds)': 'Virtual Minds',
    'exte (rich audience)': 'Rich Audience', 'rich audience': 'Rich Audience',
    'smile wanted': 'SmileWanted', 'smilewanted': 'SmileWanted',
    'gfk (niq)': 'GfK', 'gfk': 'GfK', 'niq (gfk)': 'GfK',
    'adl digital lab (grupo aval)': 'ADL Digital Lab', 'adl digital lab': 'ADL Digital Lab',
    'triton digital (iheartmedia)': 'Triton Digital', 'triton digital': 'Triton Digital',
    'jsdelivr': 'jsDelivr', 'jsdelivr (prospect one)': 'jsDelivr', 'prospect one': 'jsDelivr',
    'casa editorial el tiempo': 'Casa Editorial El Tiempo',
    'unidad editorial': 'Unidad Editorial',
    'prisa': 'PRISA', 'prisa media': 'PRISA',
    'rcs mediagroup': 'RCS MediaGroup',
    'prensa ibérica': 'Prensa Ibérica', 'prensa iberica': 'Prensa Ibérica',
    'jw player': 'JW Player', 'jwp': 'JW Player', 'jw player (jwp)': 'JW Player', 'jwp connatix': 'JW Player',
    'contentsquare': 'Contentsquare',
    'meta': 'Meta', 'meta platforms': 'Meta',
    'amazon': 'Amazon', 'amazon.com': 'Amazon',
    'comscore': 'Comscore', 'nielsen': 'Nielsen',
    'the trade desk': 'The Trade Desk',
    'index exchange': 'Index Exchange',
    'equativ': 'Equativ',
    'magnite': 'Magnite', 'pubmatic': 'PubMatic', 'openx': 'OpenX', 'criteo': 'Criteo', 'rtb house': 'RTB House',
    'improve digital (azerion)': 'Improve Digital', 'improve digital': 'Improve Digital', 'azerion (improve digital)': 'Improve Digital',
    'sovrn': 'Sovrn', 'seedtag': 'Seedtag', 'taboola': 'Taboola', 'permutive': 'Permutive', 'id5': 'ID5',
    'tealium': 'Tealium', 'chartbeat': 'Chartbeat', 'echobox': 'Echobox', 'cloudflare': 'Cloudflare', 'apple': 'Apple', 'google': 'Google',
    'didomi': 'Didomi', 'liveramp': 'LiveRamp', 'marfeel': 'Marfeel', 'pubstack': 'Pubstack', 'opti digital': 'Opti Digital',
    'braze': 'Braze', 'braze inc.': 'Braze', 'adform': 'Adform',
    'jwx': 'JW Player', 'minute spoteam ltd.': 'Minute.ly', 'minute.ly': 'Minute.ly', 'mux inc.': 'Mux', 'mux': 'Mux', 'amplitude inc.': 'Amplitude', 'amplitude': 'Amplitude',
    'quarter media': 'Quarter Media', 'quartermedia': 'Quarter Media', 'twipe': 'Twipe', 'twipe mobile solutions': 'Twipe', 'usercentrics gmbh': 'Usercentrics', 'usercentrics': 'Usercentrics',
    'infonline gmbh': 'INFOnline', 'infonline': 'INFOnline', 'addefend gmbh': 'AdDefend', 'addefend': 'AdDefend', 'pinpoll gmbh': 'Pinpoll', 'pinpoll': 'Pinpoll',
    'branch metrics': 'Branch', 'branch': 'Branch', 'skydance corporation': 'Paramount', 'dailymotion': 'Dailymotion', 'sourcepoint': 'Sourcepoint',
    'intent iq': 'Intent IQ', 'insurads': 'InsurAds', 'covatic': 'Covatic', 'confiant': 'Confiant', 'brightcove': 'Brightcove', 'poool': 'Poool',
    'eyeo gmbh': 'eyeo', 'eyeo': 'eyeo', 'xplosion interactive gmbh': 'Xplosion Interactive', 'xplosion interactive': 'Xplosion Interactive', 'appsflyer': 'AppsFlyer', 'geoedge': 'GeoEdge', 'ipsos': 'Ipsos',
    'fairplay sports media': 'FairPlay Sports Media', 'airship': 'Airship', 'aniview': 'Aniview', 'adnami': 'Adnami', 'kargo': 'Kargo', 'ketch': 'Ketch',
    'missena': 'Missena', 'nexx360': 'Nexx360', 'tappx': 'Tappx', 'the ozone project': 'The Ozone Project', 'kameleoon': 'Kameleoon', 'crazy egg': 'Crazy Egg', 'qualtrics': 'Qualtrics', 'facil\'iti': "FACIL'iti", 'facil’iti': "FACIL'iti",
}
CORTA = {'publicidad', 'rastreo', 'medición'}
CATS = {'publicidad', 'rastreo', 'medición', 'funcional', 'consentimiento', 'grupo editorial'}

def nombre(e):
    if not e: return None
    k = e.strip().lower()
    return NOMBRES.get(k, e.strip())

def lee_jsonl(nombre_f):
    p = os.path.join(AQUI, nombre_f)
    if not os.path.exists(p): return {}
    return {o['dominio']: o for o in (json.loads(l) for l in open(p, encoding='utf-8') if l.strip())}

def lee_json(nombre_f):
    p = os.path.join(AQUI, nombre_f)
    if not os.path.exists(p): return {}
    return {k: v for k, v in json.load(open(p, encoding='utf-8')).items() if not k.startswith('_')}

def main():
    med = json.load(open(os.path.join(AQUI, 'medicion-2026-10-23.json'), encoding='utf-8'))
    voces = {
        'chatgpt': {**lee_jsonl('chatgpt-dominios-1.jsonl'), **lee_jsonl('chatgpt-dominios-2.jsonl')},
        'grok': {**lee_jsonl('grok-dominios-1.jsonl'), **lee_jsonl('grok-dominios-2.jsonl')},
        'gemini': {**lee_jsonl('gemini-dominios-1.jsonl'), **lee_jsonl('gemini-dominios-2.jsonl')},
        'claude': lee_json('claude-dominios.json'),
    }
    todos = sorted({d for s in med['sitios'].values() for d in s['terceros']})
    dominios, empresas, fuera = {}, {}, []
    for d in todos:
        vs = [v[d] for v in voces.values() if d in v]
        emp = Counter(nombre(v.get('empresa')) for v in vs if v.get('empresa'))
        e, ne = (emp.most_common(1)[0] if emp else (None, 0))
        if ne < 2:
            dominios[d] = {}; fuera.append((d, 'empresa', dict(emp))); continue
        pais = Counter(v.get('pais') for v in vs if v.get('pais') and nombre(v.get('empresa')) == e)
        p, np_ = (pais.most_common(1)[0] if pais else (None, 0))
        if np_ < 2:
            dominios[d] = {}; fuera.append((d, 'país', dict(pais))); continue
        if e in empresas and empresas[e] != p:
            print('AVISO: país distinto para', e, empresas[e], p, 'en', d, file=sys.stderr)
        empresas.setdefault(e, p)
        cat = Counter(v.get('categoria') for v in vs if v.get('categoria') in CATS)
        c, nc = (cat.most_common(1)[0] if cat else (None, 0))
        if nc >= 2 and list(cat.values()).count(nc) == 1:
            dominios[d] = {'empresa': e, 'categoria': c}
        else:
            dominios[d] = {'empresa': e}; fuera.append((d, 'categoría', dict(cat)))
    ORDEN = ['marca', 'as', 'sport', 'lequipe', 'gazzetta', 'kicker', 'skysports', 'espn', 'cbssports', 'foxsports', 'eltiempo']
    NOMBRE_SITIO = {'marca': ('Marca', 'ES'), 'as': ('AS', 'ES'), 'sport': ('Sport', 'ES'), 'lequipe': ("L'Équipe", 'FR'), 'gazzetta': ('La Gazzetta dello Sport', 'IT'),
                    'kicker': ('Kicker', 'DE'), 'skysports': ('Sky Sports', 'GB'), 'espn': ('ESPN', 'US'), 'cbssports': ('CBS Sports', 'US'), 'foxsports': ('Fox Sports', 'US'), 'eltiempo': ('El Tiempo', 'CO')}
    sitios = []
    for k in ORDEN:
        s = med['sitios'][k]; n, pa = NOMBRE_SITIO[k]
        sitios.append({'id': k, 'nombre': n, 'pais': pa, 'web': s['web'], 'dominios': s['terceros']})
    out = {'fecha': med['fecha'], 'desde': med['desde'], 'sitios': sitios, 'dominios': dominios, 'empresas': dict(sorted(empresas.items()))}
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, 'w', encoding='utf-8') as f: json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    ident = sum(1 for v in dominios.values() if v.get('empresa'))
    corta = sum(1 for v in dominios.values() if v.get('categoria') in CORTA)
    print(f'dominios {len(dominios)} · con empresa {ident} · empresas {len(empresas)} · países {len(set(empresas.values()))} · cortables {corta}')
    for d, que, votos in fuera: print('  sin confirmar', que.ljust(9), d, votos)

if __name__ == '__main__':
    main()
