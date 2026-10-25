"""Boekpagina's en uitsneden voor een leer.js-module.
Gebruik: python prep_pages.py <map met screenshots> <modulemap> <spec.json>
spec.json: {"pattern": "blz-{p:03d}.png", "pages": [12, 13], "figs": {"naam": [pagina, x0, y0, x1, y1]}}
Pagina's worden <modulemap>/bronnen/pNN.jpg (max 1600 px breed), uitsneden <modulemap>/fig/naam.jpg."""
import json, os, sys
from PIL import Image
src, mod, spec = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3]))
pat = spec.get("pattern", "blz-{p:03d}.png")
os.makedirs(f"{mod}/bronnen", exist_ok=True); os.makedirs(f"{mod}/fig", exist_ok=True)
def load(p): return Image.open(os.path.join(src, pat.format(p=p))).convert("RGB")
for p in spec.get("pages", []):
    im = load(p)
    if im.width > 1600: im = im.resize((1600, im.height * 1600 // im.width), Image.LANCZOS)
    im.save(f"{mod}/bronnen/p{p}.jpg", quality=78, optimize=True)
for n, (p, *box) in spec.get("figs", {}).items():
    im = load(p).crop(box)
    if im.width < 900: im = im.resize((im.width * 3 // 2, im.height * 3 // 2), Image.LANCZOS)
    im.save(f"{mod}/fig/{n}.jpg", quality=82, optimize=True)
print(len(spec.get("pages", [])), "pagina's,", len(spec.get("figs", {})), "uitsneden")
