"""Klikt een leer.js-module helemaal door (Playwright, 400x860, file://): Vandaag, alle Leren-pagina's en bronnen,
elk onderwerp foutloos oefenen, één sessie met een fout, Herhalen en een volledig oefenproefwerk.
Gebruik: python test_module.py <repo-map> <modulemap, bv. frans/proefwerk-1> <screenshot-map>"""
import json, sys
from playwright.sync_api import sync_playwright
ROOT, MOD, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
URL = f'file://{ROOT}/{MOD}/index.html'
D = json.load(open(f'{ROOT}/{MOD}/data.json'))
tag = MOD.split('/')[0]
errors = []

def cur(pg):
    q = pg.evaluate('window.__leerQ')
    return pg.evaluate('window.__lastGen') if q['k'] == 'gen' else q

def answer(pg, q, wrong=False):
    k = q['k']
    if k == 'mc':
        _click_opt(pg, q['opts'][q['a'] if not wrong else (q['a'] + 1) % len(q['opts'])])
    elif k == 'tf': pg.click(f'#pb [data-v="{1 if q["a"] != wrong else 0}"]')
    elif k == 'pick':
        for o in q['ok']: pg.locator(f'#pb [data-o={json.dumps(o, ensure_ascii=False)}]').click()
        pg.click('#pk')
    elif k in ('type', 'num', 'calc'):
        v = ('98765' if k == 'calc' else 'xyz') if wrong else (str(q['a']).replace('.', ',') if k == 'num' else q['a'] if k == 'calc' else q['a'][0])
        pg.fill('#pb input.ti', v); pg.click('#tk')
    elif k in ('open', 'paper'):
        if k == 'open': pg.fill('#pb textarea', 'antwoord'); pg.click('#sh')
        for c in pg.locator('#pb [data-p]').all(): c.check()
        pg.click('#okb')
    elif k == 'conj':
        for i, r in enumerate(D['tables'][q['tab']]['rows']): pg.fill(f'#pb input.ti[data-r="{i}"]', r[1])
        pg.click('#tk')
    elif k == 'fill':
        for i, it in enumerate(q['items']): pg.select_option(f'#pb select[data-i="{i}"]', it[1])
        pg.click('#fk')
    elif k == 'sort':
        for _ in q['items']:
            card = pg.locator('#pb .sortcard').inner_text().strip()
            cat = [it[1] for it in q['items'] if it[0].strip() == card][0]
            pg.locator(f'#pb [data-c={json.dumps(cat, ensure_ascii=False)}]').click(); pg.wait_for_timeout(460)
    elif k == 'order':
        for i in range(len(q['items'])): pg.locator(f'#pb .opt[data-i="{i}"]').click()
    elif k == 'formula':
        for w in q['left'] + q['right']: pg.locator(f'#pb [data-w={json.dumps(w, ensure_ascii=False)}]').click()
        pg.click('#fk')
    pg.wait_for_selector('#pb .fb')

def _click_opt(pg, text):
    # opties worden geschud en kunnen breuken bevatten: vergelijk de platte tekst
    flat = lambda s: ''.join(s.replace('{', '').replace('}', '').replace('/', '').split())
    for b in pg.locator('#pb .opt').all():
        if flat(b.inner_text()) == flat(text): b.click(); return
    raise Exception('optie niet gevonden: ' + text)

def play(pg, wrong_first=False):
    n, wrong_done = 0, False
    while True:
        q = cur(pg)
        w = wrong_first and not wrong_done and q['k'] in ('mc', 'tf', 'type', 'calc')
        try: answer(pg, q, wrong=w)
        except Exception: print('VRAAG:', json.dumps(q, ensure_ascii=False)[:400]); pg.screenshot(path=f'{OUT}/{tag}-fout.png', full_page=True); raise
        if w: assert pg.locator('#pb .fb.bad').count(), 'geen foutmelding'; wrong_done = True
        assert w or pg.locator('#pb .fb.good').count(), ('niet goed gerekend', q)
        pg.click('#nb'); n += 1
        if pg.locator('.score').count(): return n, pg.locator('.score').inner_text()

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 400, 'height': 860})
    pg.on('pageerror', lambda e: errors.append(str(e)))
    overflow = lambda: pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')
    pg.goto(URL); pg.wait_for_timeout(300)
    assert pg.input_value('#exam') == D['meta']['examDate'], 'datum niet ingevuld'
    assert not overflow(); pg.screenshot(path=f'{OUT}/{tag}-1-vandaag.png', full_page=True)
    for t in D['topics']:
        pg.goto(URL + '#leer:' + t['id']); pg.reload(); pg.wait_for_load_state('load'); pg.wait_for_timeout(150)
        bad = pg.evaluate('[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)')
        assert not bad and not overflow(), (t['id'], bad)
    pg.screenshot(path=f'{OUT}/{tag}-2-leren.png', full_page=True)
    pg.goto(URL + '#bron'); pg.reload(); pg.wait_for_load_state('load')
    for im in pg.locator('img').all(): im.scroll_into_view_if_needed()
    pg.wait_for_timeout(400)
    assert not pg.evaluate('[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)')
    print('bronnen:', pg.locator('img').count(), 'afbeeldingen,', pg.locator('a.btn[href$=".pdf"], a.btn[href$=".pptx"]').count(), 'bestanden')
    for t in D['topics']:
        for rnd in range(2 if any(q['k'] == 'gen' for q in t['qs']) else 1):
            pg.goto(URL); pg.evaluate(f"location.hash='oef:{t['id']}'"); pg.reload(); pg.wait_for_selector('#pb')
            if rnd == 0 and t is D['topics'][0]: pg.screenshot(path=f'{OUT}/{tag}-3-vraag.png', full_page=True)
            n, sc = play(pg); assert sc == '100%', (t['id'], sc)
        print('oefenen', t['id'], n, 'vragen', sc)
    pg.goto(URL); pg.evaluate(f"location.hash='oef:{D['topics'][0]['id']}'"); pg.reload(); pg.wait_for_selector('#pb')
    n, sc = play(pg, wrong_first=True); print('met fout:', n, 'vragen', sc); assert sc != '100%'
    pg.goto(URL); pg.evaluate("location.hash='oef:mix'"); pg.reload(); pg.wait_for_selector('#pb')
    print('herhalen', *play(pg))
    pg.goto(URL); pg.evaluate("location.hash='pw'"); pg.reload(); pg.click('[data-go="pw:go"]'); pg.wait_for_selector('#pb')
    n, sc = play(pg); print('oefentoets', n, 'vragen, cijfer', sc); assert n == 30 and sc == '10,0'
    pg.screenshot(path=f'{OUT}/{tag}-4-toets.png', full_page=True)
    pg.goto(URL); pg.wait_for_timeout(200); pg.screenshot(path=f'{OUT}/{tag}-5-vandaag-na.png', full_page=True)
    b.close()
print('pageerrors:', errors); assert not errors
print('ALLES OK', MOD)
