"""Klikt de leer-app van biologie/proefwerk-1 helemaal door (Playwright, 400x860, file://).
Gebruik: python test_module.py <repo-map> <screenshot-map>"""
import json, sys, re
from playwright.sync_api import sync_playwright
ROOT, OUT = sys.argv[1], sys.argv[2]
URL = f'file://{ROOT}/biologie/proefwerk-1/index.html'
D = json.load(open(f'{ROOT}/biologie/proefwerk-1/data.json'))
ALL = []
for t in D['topics']:
    ALL += [dict(k='type', q='Welk begrip hoort hierbij? ' + b[1], a=[b[0]]) for b in t.get('beg', [])]
    ALL += t['qs']
errors = []

def kind(pg):
    if pg.locator('#pb .sortcard').count(): return {'sort'}
    if pg.locator('#pb .ordl').count(): return {'order'}
    if pg.locator('#pb .fxb').count(): return {'formula'}
    if pg.locator('#pb textarea').count(): return {'open'}
    if pg.locator('#pb select').count(): return {'fill'}
    if pg.locator('#pb input.ti').count(): return {'type', 'num'}
    if pg.locator('#pb [data-o]').count(): return {'pick'}
    if pg.locator('#pb [data-v]').count(): return {'tf'}
    if pg.locator('#pb .opt[data-j]').count(): return {'mc'}
    if pg.locator('#pb [data-p]').count(): return {'paper'}
    raise Exception('onbekend vraagtype')

def find(pg):
    qt = pg.locator('#pb p.q b').first.inner_text().strip()
    ks = kind(pg)
    c = [q for q in ALL if q['q'] == qt and q['k'] in ks]
    assert c, f'niet gevonden: {qt}'
    return c[0]

def answer(pg, q, wrong=False):
    k = q['k']
    if k == 'mc':
        t = q['opts'][q['a'] if not wrong else (q['a'] + 1) % len(q['opts'])]
        pg.locator('#pb .opt', has_text=t).first.click()
    elif k == 'tf': pg.click(f'#pb [data-v="{1 if q["a"] != wrong else 0}"]')
    elif k == 'pick':
        for o in q['ok']: pg.locator(f'#pb [data-o="{o}"]').click()
        pg.click('#pk')
    elif k in ('type', 'num'):
        pg.fill('#pb input.ti', 'xyz' if wrong else (str(q['a']).replace('.', ',') if k == 'num' else q['a'][0])); pg.click('#tk')
    elif k == 'open':
        pg.fill('#pb textarea', 'antwoord'); pg.click('#sh')
        for c in pg.locator('#pb [data-p]').all(): c.check()
        pg.click('#okb')
    elif k == 'paper':
        for c in pg.locator('#pb [data-p]').all(): c.check()
        pg.click('#okb')
    elif k == 'fill':
        for i, it in enumerate(q['items']): pg.select_option(f'#pb select[data-i="{i}"]', it[1])
        pg.click('#fk')
    elif k == 'sort':
        for _ in q['items']:
            card = pg.locator('#pb .sortcard').inner_text().strip()
            cat = [it[1] for it in q['items'] if it[0] == card][0]
            pg.locator(f'#pb [data-c="{cat}"]').click(); pg.wait_for_timeout(480)
    elif k == 'order':
        for it in q['items']: pg.locator('#pb .opt', has_text=it).first.click()
    elif k == 'formula':
        for w in q['left'] + q['right']: pg.locator(f'#pb [data-w="{w}"]').click()
        pg.click('#fk')
    pg.wait_for_selector('#pb .fb')

def play(pg, wrong_first=False):
    n, wrong_done = 0, False
    while pg.locator('#nb').count() == 0 and pg.locator('#pb').count():
        q = find(pg)
        w = wrong_first and not wrong_done and q['k'] in ('mc', 'tf', 'type')
        answer(pg, q, wrong=w)
        if w:
            assert pg.locator('#pb .fb.bad').count(), 'geen foutmelding'
            wrong_done = True
        pg.click('#nb'); n += 1
        if pg.locator('.score').count(): break
    return n, pg.locator('.score').inner_text()

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 400, 'height': 860})
    pg.on('pageerror', lambda e: errors.append(str(e)))
    overflow = lambda: pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')
    pg.goto(URL); pg.wait_for_timeout(300)
    assert pg.input_value('#exam') == '2026-10-30', 'datum niet ingevuld'
    assert not overflow(); pg.screenshot(path=f'{OUT}/1-vandaag.png', full_page=True)
    print('vandaag:', pg.locator('.card b').first.inner_text())
    # Leren: elk onderwerp, alle afbeeldingen geladen
    for t in D['topics']:
        pg.goto(URL + '#leer:' + t['id']); pg.reload(); pg.wait_for_load_state('load'); pg.wait_for_timeout(200)
        bad = pg.evaluate('[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)')
        assert not bad, bad
        assert not overflow(), t['id']
    pg.screenshot(path=f'{OUT}/2-leren.png', full_page=True)
    pg.goto(URL + '#bron'); pg.reload(); pg.wait_for_load_state('load')
    for im in pg.locator('img').all(): im.scroll_into_view_if_needed()
    pg.wait_for_timeout(500)
    bad = pg.evaluate('[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)')
    assert not bad, bad
    print('bronnen:', pg.locator('img').count(), 'pagina\'s geladen')
    # Oefenen: elk onderwerp foutloos
    for t in D['topics']:
        pg.goto(URL); pg.evaluate(f"location.hash='oef:{t['id']}'"); pg.reload(); pg.wait_for_selector('#pb')
        n, sc = play(pg); print('oefenen', t['id'], n, 'vragen', sc)
        assert sc == '100%', (t['id'], sc)
        if t['id'] == 'bs3': pg.screenshot(path=f'{OUT}/3-oefen-klaar.png', full_page=True)
    # met een fout: die vraag komt aan het eind terug
    pg.goto(URL); pg.evaluate("location.hash='oef:bs1'"); pg.reload(); pg.wait_for_selector('#pb')
    n, sc = play(pg, wrong_first=True); print('oefenen met fout:', n, 'vragen', sc)
    assert sc != '100%' and n > 14
    # Herhalen
    pg.goto(URL); pg.evaluate("location.hash='oef:mix'"); pg.reload(); pg.wait_for_selector('#pb')
    n, sc = play(pg); print('herhalen', n, sc)
    # Proefwerk
    pg.goto(URL); pg.evaluate("location.hash='pw'"); pg.reload(); pg.click('[data-go="pw:go"]'); pg.wait_for_selector('#pb')
    n, sc = play(pg); print('oefenproefwerk', n, 'vragen, cijfer', sc)
    assert n == 30 and sc == '10,0'
    pg.screenshot(path=f'{OUT}/4-proefwerk.png', full_page=True)
    pg.goto(URL); pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/5-vandaag-na.png', full_page=True)
    st = pg.evaluate("JSON.parse(localStorage.getItem('studie:biologie-pw1'))")
    print('opgeslagen: pct', st['pct'], 'stats', st['stats'])
    # Hub
    pg.goto(f'file://{ROOT}/index.html'); pg.wait_for_timeout(300)
    tile = pg.locator('text=Proefwerk 1 · Thema 1 Planten en dieren').first
    assert tile.count()
    html = pg.content()
    assert 'oktober' in html
    pg.screenshot(path=f'{OUT}/6-hub.png', full_page=True)
    # Oudere modules laden nog zonder fouten
    for m in ['biologie/so-1', 'geschiedenis/hoofdstuk-1', 'frans/so-1', 'frans/so-2', 'nederlands/so-ww']:
        pg.goto(f'file://{ROOT}/{m}/index.html'); pg.wait_for_timeout(400)
        assert not overflow(), m
    b.close()
print('pageerrors:', errors)
assert not errors
print('ALLES OK')
