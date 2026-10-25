# Studiehub

Studiemateriaal per vak en toets. Open `index.html` (of de GitHub Pages-link) en kies een toets.

- `catalog.js`: lijst van vakken en toetsen (hub), met datum en instructie van de docent
- `<vak>/<toets>/`: per toets `index.html`, `data.json` (bron) en `data.js` (gegenereerd), plus `bronnen/`, `fig/` en eventueel `slides/`, `handouts/`, `gen.js`
- `assets/leer.js`: de studie-app voor alle huidige modules. Vier tabs: Vandaag (dagplan tot de toets), Leren (kern, afbeeldingen, valkuilen, bronnen), Oefenen (per onderwerp, fouten komen terug, Herhalen), Toets (oefentoets van 30 vragen met cijfer)
- Vraagtypes in `data.json`: mc, tf, type (`strict` voor vreemde talen: accenten en lidwoord), num, calc (breuken, exact), gen (verse som uit `gen.js`), pick, order, sort, fill, open, formula, paper. Een vraag kan een leestekst tonen met `txt` (zie `texts`).
- `assets/app.js`, `vocab.js`, `taal.js`, `kennis.js`: oudere apps, nu niet in gebruik
- `tools/leer/`: `prep_pages.py` (boekpagina's en uitsneden), `build_data.py` (controle + data.js), `test_module.py` (volledige klik-test). Per module in `tools/<module>/` het script dat `data.json` maakt.
