"""Zet de PowerPoint (als PDF) om in dia-plaatjes en de oefenbladen in pagina-plaatjes; kopieert de handouts.
Gebruik: python prep.py <map met bronbestanden> <modulemap>"""
import sys, shutil, pymupdf
src, mod = sys.argv[1], sys.argv[2]
PPT = "1HV Leesvaardigheid 1 H17-18-19 H32 en aanvullende begrippen 2627"
FILES = {f"{PPT}.pdf": "powerpoint-leesvaardigheid.pdf", f"{PPT}.pptx": "powerpoint-leesvaardigheid.pptx",
         "HV1 Oefenblad Leesvaardigheid 17.pdf": "oefenblad-17.pdf", "HV1 Oefenblad Leesvaardigheid 17 antwoorden.pdf": "oefenblad-17-antwoorden.pdf",
         "HV1 Oefenblad Leesvaardigheid 18.pdf": "oefenblad-18.pdf", "HV1 Oefenblad Leesvaardigheid 18 antwoorden.pdf": "oefenblad-18-antwoorden.pdf",
         "HV1 Oefenblad Leesvaardigheid 19 (1).pdf": "oefenblad-19.pdf", "HV1 Oefenblad Leesvaardigheid 19 antwoorden.pdf": "oefenblad-19-antwoorden.pdf"}
for a, b in FILES.items(): shutil.copy(f"{src}/{a}", f"{mod}/handouts/{b}")
d = pymupdf.open(f"{src}/{PPT}.pdf")
for i, p in enumerate(d):
    p.get_pixmap(dpi=round(1280 / (p.rect.width / 72))).pil_save(f"{mod}/slides/s{i+1:02d}.jpg", quality=78, optimize=True)
for n in ["17", "17-antwoorden", "18", "18-antwoorden", "19", "19-antwoorden"]:
    d = pymupdf.open(f"{mod}/handouts/oefenblad-{n}.pdf")
    for i, p in enumerate(d):
        p.get_pixmap(dpi=round(1300 / (p.rect.width / 72))).pil_save(f"{mod}/bladen/{n}-{i+1}.jpg", quality=78, optimize=True)
print("klaar")
