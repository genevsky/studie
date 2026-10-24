"""Boekpagina's (bronnen) en uitsneden van kernafbeeldingen voor biologie/proefwerk-1.
Gebruik: python prep_images.py <map met blz-NNN.png> <modulemap>"""
import sys, os
from PIL import Image
src, mod = sys.argv[1], sys.argv[2]
PAGES = list(range(14, 45)) + list(range(55, 70)) + list(range(79, 83))
FIGS = {  # naam: (pagina, x0, y0, x1, y1) in het 1188x1680-raster van de screenshots
 'levenskenmerken': (14, 200, 1040, 1010, 1625), 'zaad': (20, 200, 140, 1040, 600),
 'tomaat': (20, 95, 875, 1090, 1560), 'koolwitje': (27, 95, 140, 1060, 770),
 'kikker': (28, 95, 140, 1090, 785), 'lengte': (37, 205, 140, 815, 810),
 'fotosynthese': (40, 205, 185, 820, 985), 'tabel1': (58, 205, 1075, 980, 1610),
 'nest': (61, 205, 960, 870, 1345), 'tekenen': (63, 95, 610, 1090, 880),
 'doorsnede': (63, 200, 1150, 700, 1375), 'tekenregels': (64, 90, 225, 1100, 730),
 'kieming': (66, 205, 430, 1005, 910), 'grafiek': (67, 200, 140, 1070, 520),
 'trap': (31, 205, 470, 520, 790), 'uitpop': (31, 550, 520, 860, 785),
 'mok': (64, 205, 1290, 400, 1530), 'percentiel': (69, 205, 140, 760, 815)}
os.makedirs(f'{mod}/bronnen', exist_ok=True); os.makedirs(f'{mod}/fig', exist_ok=True)
def load(p): return Image.open(f'{src}/blz-{p:03d}.png').convert('RGB')
for p in PAGES:
    if os.path.exists(f'{src}/blz-{p:03d}.png'): load(p).save(f'{mod}/bronnen/p{p}.jpg', quality=78, optimize=True)
    else: print('ontbreekt', p)
for n, (p, *box) in FIGS.items():
    im = load(p).crop(box)
    if im.width < 900: im = im.resize((im.width * 3 // 2, im.height * 3 // 2), Image.LANCZOS)
    im.save(f'{mod}/fig/{n}.jpg', quality=82, optimize=True)
