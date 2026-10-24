"""data.json -> data.js (window.EXAM) en controle van de inhoud. Gebruik: python build_data.py <modulemap>"""
import json, sys, os
mod = sys.argv[1]
d = json.load(open(f'{mod}/data.json'))
kinds = {'mc', 'tf', 'type', 'pick', 'order', 'sort', 'fill', 'open', 'num', 'formula', 'paper'}
for t in d['topics']:
    for i, q in enumerate(t['qs']):
        where = f"{t['id']} vraag {i}"
        assert q['k'] in kinds, where
        if q['k'] == 'mc': assert 0 <= q['a'] < len(q['opts']), where
        if q['k'] == 'pick': assert all(o in q['opts'] for o in q['ok']), where
        if q['k'] == 'fill': assert all(it[1] in q['opts'] for it in q['items']), where
        if q['k'] == 'sort': assert all(it[1] in q['cats'] for it in q['items']), where
        for f in [q.get('img')] + [x[0] for x in t.get('fig', [])]:
            if f: assert os.path.exists(f'{mod}/{f}'), f
    for p in t['bron']: assert os.path.exists(f'{mod}/bronnen/p{p}.jpg'), p
open(f'{mod}/data.js', 'w').write('window.EXAM=' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(d['topics']), 'onderwerpen,', sum(len(t['qs']) + len(t.get('beg', [])) for t in d['topics']), 'vragen')
