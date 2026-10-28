"""Controleert <modulemap>/data.json (leer.js) en schrijft data.js (window.EXAM). Gebruik: python build_data.py <modulemap>"""
import json, sys, os
mod = sys.argv[1]
d = json.load(open(f'{mod}/data.json'))
kinds = {'mc', 'tf', 'type', 'pick', 'order', 'sort', 'fill', 'open', 'num', 'formula', 'paper', 'calc', 'gen', 'conj'}
def bsrc(b): return f'bronnen/p{b}.jpg' if isinstance(b, int) else b['src']
for t in d['topics']:
    assert t['id'] not in ('mix', 'go'), f"onderwerp-id {t['id']} is gereserveerd door leer.js"
    for i, q in enumerate(t['qs']):
        where = f"{t['id']} vraag {i}: {q.get('q', q.get('g'))}"
        assert q['k'] in kinds, where
        if q['k'] == 'mc': assert 0 <= q['a'] < len(q['opts']), where
        if q['k'] == 'pick': assert all(o in q['opts'] for o in q['ok']), where
        if q['k'] == 'fill': assert all(it[1] in q['opts'] for it in q['items']), where
        if q['k'] == 'sort': assert all(it[1] in q['cats'] for it in q['items']), where
        if q['k'] in ('type',): assert isinstance(q['a'], list) and q['a'], where
        if q.get('txt'): assert q['txt'] in d.get('texts', {}), where
        if q.get('tab'): assert q['tab'] in d.get('tables', {}), where
        for f in [q.get('img')] + [x[0] for x in t.get('fig', [])]:
            if f: assert os.path.exists(f'{mod}/{f}'), f
    for b in t.get('bron', []): assert os.path.exists(f'{mod}/{bsrc(b)}'), bsrc(b)
for b in d.get('bronnen', {}).get('pages', []): assert os.path.exists(f'{mod}/{bsrc(b)}'), bsrc(b)
for f in d.get('bronnen', {}).get('files', []): assert os.path.exists(f"{mod}/{f['href']}"), f['href']
open(f'{mod}/data.js', 'w').write('window.EXAM=' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(d['topics']), 'onderwerpen,', sum(len(t['qs']) + len(t.get('beg', [])) for t in d['topics']), 'vragen')
