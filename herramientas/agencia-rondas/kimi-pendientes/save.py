import sys, json, hashlib
raw, expected, out = sys.argv[1], sys.argv[2], sys.argv[3]
t = open(raw, encoding='utf-8').read()
h = hashlib.sha256(t.encode('utf-8')).hexdigest()
print('len', len(t), 'hash ok' if h == expected else 'HASH MISMATCH ' + h)
if h != expected:
    sys.exit(1)
data = json.loads(t)
with open(out, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write('\n')
print('items', len(data))
from collections import Counter
k = 'pais'
if data and isinstance(data[0], dict) and 'pais' in data[0]:
    print(dict(Counter(d.get('pais') for d in data)))
