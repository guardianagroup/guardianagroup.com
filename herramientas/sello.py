#!/usr/bin/env python3
"""El sello de GUARDIANA (1 Nov 2026; dueño, 16:21–16:30: «sellar la página web… del máximo nivel posible»).

Cada publicación de la web y de los servidores lleva un documento que firma el dueño con su llave de acceso (Face ID o
Windows Hello) en https://guardianagroup.com/firma/. El documento dice qué se publica: la huella SHA-256 del manifiesto,
que a su vez da el SHA-256 de cada archivo. Los servidores solo se actualizan a lo firmado; el programa (desde la 1.0.52)
solo ejecuta lo firmado; y el vigilante avisa si lo que sirve la web no es lo firmado.

Fuera del manifiesto: los datos que cambian solos (orbita/datos/, los actualiza un flujo cada 6 horas), el propio sello/,
herramientas/ y .github/. Dentro, aunque esté en sello/: las llaves del dueño (sello/llaves.json), para que ninguna llave
nueva valga sin una firma de las que ya hay.

Uso:
  python3 herramientas/sello.py estado
  python3 herramientas/sello.py preparar --nota "Qué cambia" [--servidores]
  python3 herramientas/sello.py llave '<json que da la página de firma>'
  python3 herramientas/sello.py firma '<json que da la página de firma>'
  python3 herramientas/sello.py comprobar
"""
import argparse
import datetime
import hashlib
import json
import os
import subprocess
import sys

R = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()
S = os.path.join(R, 'sello')
FUERA = ('orbita/datos/', 'sello/', 'herramientas/', '.github/')
DENTRO = ('sello/llaves.json',)
VIGENCIA_DIAS = 35


def _lee_json(rel, defecto=None):
    try:
        with open(os.path.join(S, rel), encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return defecto


def _escribe(rel, datos):
    p = os.path.join(S, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'wb') as f:
        f.write(datos if isinstance(datos, bytes) else datos.encode('utf-8'))


def _canonico(obj):
    return json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')


def archivos():
    salida = subprocess.run(['git', '-C', R, 'ls-files', '-z'], capture_output=True, check=True).stdout
    todos = set(x.decode('utf-8') for x in salida.split(b'\0') if x)
    todos.update(p for p in DENTRO if os.path.isfile(os.path.join(R, p)))
    for p in sorted(todos):
        if (p.startswith(FUERA) and p not in DENTRO) or not os.path.isfile(os.path.join(R, p)):
            continue
        yield p


def manifiesto():
    m = {}
    for p in archivos():
        h = hashlib.sha256()
        with open(os.path.join(R, p), 'rb') as f:
            for trozo in iter(lambda: f.read(1 << 20), b''):
                h.update(trozo)
        m[p] = h.hexdigest()
    return _canonico({'v': 1, 'sitio': 'guardianagroup.com', 'archivos': m}), m


def _siguiente():
    a = (_lee_json('actual.json') or {}).get('seq', 0)
    p = (_lee_json('pendiente.json') or {}).get('seq', 0)
    return max(a, p) + 1, a


def estado(_):
    a = _lee_json('actual.json')
    p = _lee_json('pendiente.json')
    ll = (_lee_json('llaves.json') or {}).get('llaves', [])
    print(f'llaves del dueño: {len(ll)}', ', '.join(k.get('nombre', k['id'][:8]) for k in ll))
    print('publicación firmada vigente:', a['seq'] if a else 'ninguna')
    print('pendiente de firma:', p['seq'] if p else 'ninguna')
    b, m = manifiesto()
    print(f'manifiesto de ahora: {len(m)} archivos, sha256 {hashlib.sha256(b).hexdigest()[:16]}…')


def preparar(args):
    seq, base = _siguiente()
    b, m = manifiesto()
    ahora = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
    commit = subprocess.run(['git', '-C', R, 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    doc = {
        'v': 1,
        'sitio': 'guardianagroup.com',
        'seq': seq,
        'base': base,
        'manifiesto': hashlib.sha256(b).hexdigest(),
        'archivos': len(m),
        'fecha': ahora.isoformat().replace('+00:00', 'Z'),
        'expira': (ahora + datetime.timedelta(days=VIGENCIA_DIAS)).isoformat().replace('+00:00', 'Z'),
        'servidores': bool(args.servidores),
        'commit': commit,
        'nota': args.nota.strip()[:400],
    }
    _escribe(f'manifiestos/{seq}.json', b)
    _escribe(f'publicaciones/{seq}.doc.json', _canonico(doc))
    _escribe('pendiente.json', _canonico({'seq': seq}) + b'\n')
    print(f'publicación {seq} preparada: {len(m)} archivos; falta la firma del dueño en https://guardianagroup.com/firma/')


def _json_arg(texto):
    texto = texto.strip()
    if os.path.isfile(texto):
        with open(texto, encoding='utf-8') as f:
            texto = f.read()
    return json.loads(texto)


def llave(args):
    k = _json_arg(args.json)
    for c in ('id', 'alg', 'spki'):
        if c not in k:
            sys.exit(f'falta «{c}» en la llave')
    if k['alg'] not in (-7, -257):
        sys.exit('algoritmo no admitido')
    datos = _lee_json('llaves.json') or {'v': 1, 'llaves': []}
    if any(x['id'] == k['id'] for x in datos['llaves']):
        sys.exit('esa llave ya está')
    datos['llaves'].append({'id': k['id'], 'alg': k['alg'], 'spki': k['spki'], 'nombre': str(k.get('nombre', ''))[:40],
                            'alta': str(k.get('alta', ''))[:30]})
    _escribe('llaves.json', json.dumps(datos, ensure_ascii=False, indent=1) + '\n')
    print('llave añadida:', k.get('nombre', k['id'][:8]))


def _node_verifica(doc_rel, firma_path):
    r = subprocess.run(['node', os.path.join(R, 'zero-motor', 'sello.js'), 'verifica', os.path.join(S, doc_rel), firma_path,
                        os.path.join(S, 'llaves.json')], capture_output=True, text=True, env=os.environ)
    return r.returncode == 0, (r.stdout or r.stderr).strip()


def firma(args):
    f = _json_arg(args.json)
    seq = f.get('seq')
    if not isinstance(seq, int):
        sys.exit('la firma no dice el número de publicación')
    doc_rel = f'publicaciones/{seq}.doc.json'
    if not os.path.isfile(os.path.join(S, doc_rel)):
        sys.exit(f'no hay documento para la publicación {seq}')
    tmp = os.path.join(S, f'publicaciones/{seq}.firma.json')
    _escribe(f'publicaciones/{seq}.firma.json', _canonico({c: f[c] for c in ('seq', 'id', 'authData', 'clientDataJSON', 'signature')}) + b'\n')
    ok, salida = _node_verifica(doc_rel, tmp)
    if not ok:
        os.remove(tmp)
        sys.exit('firma NO válida: ' + salida)
    a = (_lee_json('actual.json') or {}).get('seq', 0)
    if seq <= a:
        sys.exit(f'la publicación {seq} no es posterior a la vigente ({a})')
    _escribe('actual.json', _canonico({'seq': seq}) + b'\n')
    p = _lee_json('pendiente.json')
    if p and p.get('seq') == seq:
        os.remove(os.path.join(S, 'pendiente.json'))
    print(f'publicación {seq} firmada y vigente:', salida)


def comprobar(_):
    a = _lee_json('actual.json')
    if not a:
        sys.exit('no hay publicación firmada')
    r = subprocess.run(['node', os.path.join(R, 'zero-motor', 'sello.js'), 'publicacion', R], capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr.strip())
    if r.returncode:
        sys.exit(1)
    firmado = json.loads(open(os.path.join(S, f"manifiestos/{a['seq']}.json"), encoding='utf-8').read())['archivos']
    _, ahora = manifiesto()
    dif = sorted(set(firmado) ^ set(ahora)) + sorted(p for p in set(firmado) & set(ahora) if firmado[p] != ahora[p])
    print('lo de ahora coincide con lo firmado' if not dif else f'{len(dif)} archivos distintos de lo firmado: ' + ', '.join(dif[:20]))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='orden', required=True)
    sub.add_parser('estado').set_defaults(f=estado)
    p = sub.add_parser('preparar')
    p.add_argument('--nota', required=True)
    p.add_argument('--servidores', action='store_true')
    p.set_defaults(f=preparar)
    p = sub.add_parser('llave')
    p.add_argument('json')
    p.set_defaults(f=llave)
    p = sub.add_parser('firma')
    p.add_argument('json')
    p.set_defaults(f=firma)
    sub.add_parser('comprobar').set_defaults(f=comprobar)
    a = ap.parse_args()
    a.f(a)


if __name__ == '__main__':
    main()
