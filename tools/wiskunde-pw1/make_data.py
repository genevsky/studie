"""Maakt wiskunde/proefwerk-1/data.json (leer.js): Getal & Ruimte 1 havo/vwo, H2 Getallen en bewerkingen.
Sommen staan in boeknotatie (· : − en {teller/noemer}, gemengd: 2{1/3}); de antwoorden worden hier exact uitgerekend.
Gebruik: python make_data.py <repo-map>"""
import json, re, sys
from fractions import Fraction as F
ROOT = sys.argv[1]

def ev(expr):
    """Rekent een som in boeknotatie exact uit."""
    s = re.sub(r"\d+", lambda m: f"F({m.group()})", expr)
    s = re.sub(r"F\((\d+)\)\{F\((\d+)\)/F\((\d+)\)\}", r"(F(\1)+F(\2,\3))", s)   # gemengd getal
    for _ in range(3):                                                                # deelstreep (teller zonder /)
        s = re.sub(r"\{([^{}/]+)/([^{}]+)\}", r"((\1)/(\2))", s)
    s = s.replace("−", "-").replace("·", "*").replace(":", "/")
    return eval(s, {"F": F})

def fmt(f):
    return str(f.numerator) if f.denominator == 1 else f"{f.numerator}/{f.denominator}"

def mixed(f):
    if f.denominator == 1: return fmt(f).replace("-", "−")
    sgn = "−" if f < 0 else ""; a = abs(f); w = a.numerator // a.denominator; r = a - w
    return f"{sgn}{w} {r.numerator}/{r.denominator}" if w else fmt(f).replace("-", "−")

def calc(expr, bk, **kw):
    v = ev(expr)
    q = {"k": "calc", "q": "Bereken: " + expr, "a": fmt(v), "bk": bk}
    if v.denominator != 1 and abs(v) > 1: q["x"] = f"{fmt(v).replace('-', '−')} = {mixed(v)} (helen eruit halen mag, maar hoeft niet)."
    q.update(kw); return q

def gen(g, bk, n=1): return [{"k": "gen", "g": g, "q": "", "bk": bk} for _ in range(n)]

T = []
T.append({"id": "w1", "nav": "2.1", "title": "Bewerkingen en rekenvolgorde", "pages": "blz. 58-63", "bron": [58, 59, 60, 61, 62, 63],
 "doelen": ["Je kunt de bewerkingen optellen, aftrekken, vermenigvuldigen en delen gebruiken bij berekeningen.", "Je kunt de rekenvolgorde toepassen."],
 "kern": ["In het product 4 × 3 zijn 4 en 3 de **factoren**. In de som 8 + 11 zijn 8 en 11 de **termen**.",
          "4 × 3 is een **product**. 28 : 7 is een **quotiënt**. 8 + 11 is een **som**. 18 − 5 is een **verschil**.",
          "Bij elke deling hoort een vermenigvuldiging: 28 : 7 = 4, want 4 × 7 = 28.",
          "Een vermenigvuldiging kun je met een vermenigvuldigingspunt noteren: 5 · 8 betekent 5 × 8.",
          "**De rekenvolgorde:** 1 werk binnen de haakjes · 2 vermenigvuldigen en delen van links naar rechts · 3 optellen en aftrekken van links naar rechts.",
          "Voorbeeld: 5 · (19 − 11) : 4 + 5 = 5 · 8 : 4 + 5 = 40 : 4 + 5 = 10 + 5 = **15**"],
 "let": ["2 + 7 · 5 = 2 + 35 = **37** (niet 45!): vermenigvuldigen gaat vóór optellen.", "8 : 2 · 3 = 4 · 3 = **12**: vermenigvuldigen en delen van **links naar rechts**.", "Schrijf elke tussenstap op een nieuwe regel. Let bij verhaalsommen op **overbodige informatie**."],
 "beg": [["product", "De uitkomst van een vermenigvuldiging (4 × 3)."], ["quotiënt", "De uitkomst van een deling (28 : 7)."], ["som", "De uitkomst van een optelling (8 + 11)."], ["verschil", "De uitkomst van een aftrekking (18 − 5)."], ["factoren", "De getallen in een product (4 en 3 in 4 × 3)."], ["termen", "De getallen in een som (8 en 11 in 8 + 11)."]],
 "n": 12, "qs": [
   {"k": "num", "q": "Bereken het product van 8 en 6.", "a": 48, "tol": 0, "bk": "blz. 92, leerdoelentest 1a"},
   {"k": "num", "q": "Bereken het quotiënt van 63 en 9.", "a": 7, "tol": 0, "bk": "blz. 92, leerdoelentest 1b"},
   {"k": "mc", "q": "Van 8 · 12 zijn 8 en 12 de …", "opts": ["factoren", "termen"], "a": 0, "bk": "blz. 92, leerdoelentest 1c"},
   {"k": "mc", "q": "Van 8 + 12 zijn 8 en 12 de …", "opts": ["termen", "factoren"], "a": 0, "bk": "blz. 92, leerdoelentest 1c"},
   {"k": "num", "q": "Bereken het verschil van 47 en 29.", "a": 18, "tol": 0, "bk": "blz. 92, leerdoelentest 1d"},
   {"k": "num", "q": "Margot koopt 4 kg bananen. In een kilogram gaan 7 bananen. De prijs van 1 kg bananen is €1,75. Hoeveel bananen heeft Margot gekocht?", "a": 28, "tol": 0, "unit": "bananen", "x": "4 · 7 = 28. De prijs is overbodige informatie.", "bk": "blz. 92, leerdoelentest 2a"},
   {"k": "num", "q": "Ilse verkocht 900 kaarsen in dozen van 18 stuks, voor in totaal €150. Hoeveel kost een doos met kaarsen?", "a": 3, "tol": 0, "unit": "euro", "x": "900 : 18 = 50 dozen. €150 : 50 = €3 per doos.", "bk": "blz. 92, leerdoelentest 2b"},
   calc("21 + 3 · 5 + 11 : 11", "blz. 92, leerdoelentest 3a"),
   calc("80 : 2 · 4 − (7 − 2)", "blz. 92, leerdoelentest 3b"),
   calc("63 : 7 + (18 − 7) · 3 + 24 : 6 · 2", "blz. 92, leerdoelentest 3c"),
   calc("500 − (250 − 3 · (150 − 125) : 5) − 75", "blz. 92, leerdoelentest 3d"),
   calc("85 − 3 · 7", "blz. 94, herhaling 3a"),
   calc("25 + 18 : 3", "blz. 94, herhaling 3b"),
   calc("60 : 3 · 2 + 18", "blz. 94, herhaling 3c"),
   calc("53 − (7 + 1) · 4 : (16 − 16 : 2)", "blz. 94, herhaling 3d"),
   calc("20 · 3 − 38 : (7 · (8 − 3) − 2 · 8)", "blz. 94, herhaling 3e"),
   calc("((5 − 3) · 10 − 8) : (11 − 5)", "blz. 94, herhaling 3f"),
   calc("2 + 7 · 5", "blz. 61"),
   calc("8 : 2 · 3", "blz. 62"),
   calc("80 − 2 · (9 + 3) + 14", "blz. 62"),
   {"k": "num", "q": "Een jaar heeft 12 maanden. Cindy is 180 maanden oud. Hoeveel jaar oud is Cindy?", "a": 15, "tol": 0, "unit": "jaar", "bk": "blz. 94, herhaling 2b"},
   {"k": "num", "q": "Cindy verdient €85 per maand. Hoeveel verdient ze per jaar?", "a": 1020, "tol": 0, "unit": "euro", "bk": "blz. 94, herhaling 2d"},
   {"k": "order", "q": "Zet de stappen van de rekenvolgorde op volgorde.", "items": ["Werk binnen de haakjes.", "Vermenigvuldigen en delen van links naar rechts.", "Optellen en aftrekken van links naar rechts."], "bk": "blz. 62"},
   *gen("volgorde", "blz. 62", 4)]})

T.append({"id": "w2", "nav": "2.2", "title": "Breuken", "pages": "blz. 64-69", "bron": [64, 65, 66, 67, 68, 69],
 "doelen": ["Je kunt breuken optellen en aftrekken.", "Je kunt breuken vermenigvuldigen."],
 "kern": ["In de breuk {8/11} is 8 de **teller** en 11 de **noemer**.",
          "Breuken met dezelfde noemer zijn **gelijknamig**. Om breuken op te tellen of af te trekken, maak je ze eerst gelijknamig: {8/15} + {2/3} = {8/15} + {10/15} = {18/15} = {6/5} = 1{1/5}",
          "Om 3{1/6} − {1/3} te berekenen, breng je bij 3{1/6} eerst de **helen binnen de breuk**: 3{1/6} − {1/3} = {19/6} − {2/6} = {17/6} = 2{5/6}",
          "Bij het vermenigvuldigen van breuken: **breuk × breuk = (teller × teller) / (noemer × noemer)**. 1{1/3} · {3/5} = {4/3} · {3/5} = {12/15} = {4/5}",
          "{2/3} · 60 = {2/3} · {60/1} = {120/3} = 40",
          "{3/4} **deel van** een half is {3/4} · {1/2} = {3/8} (deel van = keer)",
          "Vereenvoudig de uitkomst zo ver mogelijk. De helen eruit halen is niet verplicht."],
 "let": ["Bij **optellen en aftrekken** maak je gelijknamig; bij **vermenigvuldigen niet**.", "Bij vermenigvuldigen met een gemengd getal: **eerst de helen binnen de breuk brengen**.", "Kies als nieuwe noemer het kleinste getal dat in beide tafels zit: {3/10} + {8/15} → noemer 30."],
 "beg": [["teller", "Het getal boven de breukstreep."], ["noemer", "Het getal onder de breukstreep."], ["gelijknamig", "Breuken met dezelfde noemer zijn …"]],
 "n": 12, "qs": [
   calc("{8/9} − {5/9}", "blz. 92, leerdoelentest 4a"),
   calc("1{2/5} + 2{3/10}", "blz. 92, leerdoelentest 4b"),
   calc("4{1/5} − 2{1/3}", "blz. 92, leerdoelentest 4c"),
   calc("{5/12} − {5/18} + 1{1/6}", "blz. 92, leerdoelentest 4d"),
   calc("{2/3} · {5/12}", "blz. 92, leerdoelentest 5a"),
   calc("{2/3} + {5/12}", "blz. 92, leerdoelentest 5b"),
   calc("1{1/5} · {5/7}", "blz. 92, leerdoelentest 5c"),
   calc("1{1/5} + {5/7}", "blz. 92, leerdoelentest 5d"),
   calc("{5/6} · 42", "blz. 92, leerdoelentest 5e"),
   calc("42 − 3{5/6}", "blz. 92, leerdoelentest 5f"),
   calc("1{1/14} − 1{1/4} · {4/7}", "blz. 92, leerdoelentest 5g"),
   calc("(1{1/3} − {5/6}) · {3/4}", "blz. 92, leerdoelentest 5h"),
   {"k": "num", "q": "Bereken: {1/5} deel van 80", "a": 16, "tol": 0, "bk": "blz. 92, leerdoelentest 6a"},
   calc("{1/4} · {7/12}", "blz. 92, leerdoelentest 6b", q="Bereken: een kwart van {7/12}"),
   {"k": "num", "q": "Bereken: {3/4} deel van 160", "a": 120, "tol": 0, "bk": "blz. 92, leerdoelentest 6c"},
   {"k": "num", "q": "Bereken: een achtste deel van 120", "a": 15, "tol": 0, "bk": "blz. 92, leerdoelentest 6d"},
   {"k": "num", "q": "In een concertzaal kunnen 600 mensen. De zaal is voor {2/3} deel bezet met volwassenen en voor {1/4} deel met kinderen. Hoeveel volwassenen zijn er?", "a": 400, "tol": 0, "bk": "blz. 92, leerdoelentest 7a"},
   {"k": "num", "q": "Zelfde concertzaal (600 plaatsen, {2/3} volwassenen, {1/4} kinderen). Hoeveel lege stoelen zijn er?", "a": 50, "tol": 0, "x": "Kinderen: {1/4} · 600 = 150. 600 − 400 − 150 = 50.", "bk": "blz. 92, leerdoelentest 7b"},
   {"k": "num", "q": "Zelfde concertzaal: volwassenen betalen €8, kinderen de helft. Hoeveel euro hebben alle aanwezigen samen betaald?", "a": 3800, "tol": 0, "unit": "euro", "x": "400 · 8 + 150 · 4 = 3200 + 600 = €3800.", "bk": "blz. 92, leerdoelentest 7c"},
   calc("{3/10} + {5/6}", "blz. 94, herhaling 4a"),
   calc("{5/12} + 1{1/6}", "blz. 94, herhaling 4b"),
   calc("2{2/5} − 1{1/8}", "blz. 94, herhaling 4c"),
   calc("5 − 2{1/3}", "blz. 94, herhaling 4e"),
   *gen("breuk_op", "blz. 65-66", 3), *gen("breuk_keer", "blz. 68", 2)]})

T.append({"id": "w3", "nav": "2.3", "title": "Negatieve getallen", "pages": "blz. 70-77", "bron": [70, 71, 72, 73, 74, 75, 76, 77],
 "doelen": ["Je kunt positieve en negatieve getallen in volgorde van grootte zetten.", "Je kunt optellen en aftrekken met negatieve getallen."],
 "kern": ["Negatieve getallen zijn getallen kleiner dan nul. Je herkent ze aan het minteken ervoor. Op de getallenlijn staan de negatieve getallen **links** van 0 en de positieve getallen **rechts** van 0. Het getal **0 is niet positief en niet negatief**.",
          "−4 < 0 betekent −4 is **kleiner dan** 0. −4 > −6 betekent −4 is **groter dan** −6.",
          "−8 + 2 = −6 · −7 − 5 = −12 · 8 − 13 = −5",
          "**+ − = −**: 7 + −5 = 7 − 5 = 2",
          "**− − = +**: −13 − −8 = −13 + 8 = −5",
          "2 + −8 − −14 = 2 − 8 + 14 = −6 + 14 = 8",
          "−9 − (−5 − 8) = −9 − −13 = −9 + 13 = 4"],
 "let": ["Bij negatieve getallen is het getal **dichter bij 0 het grootste**: −2 > −5 en −2{1/4} > −2{1/2}.", "Tip: van **<** kun je een **K** van Kleiner maken.", "Eerst haakjes: −9 − (−5 − 8) = −9 − −13 = 4."],
 "n": 12, "qs": [
   {"k": "mc", "q": "Vul in: −61 … −59", "opts": ["<", ">", "="], "a": 0, "bk": "blz. 93, leerdoelentest 8a"},
   {"k": "mc", "q": "Vul in: −33 … 12", "opts": ["<", ">", "="], "a": 0, "bk": "blz. 93, leerdoelentest 8b"},
   {"k": "mc", "q": "Vul in: 3{1/3} … 3{1/5}", "opts": ["<", ">", "="], "a": 1, "bk": "blz. 93, leerdoelentest 8c"},
   {"k": "mc", "q": "Vul in: −1{4/5} … −1{3/4}", "opts": ["<", ">", "="], "a": 0, "bk": "blz. 93, leerdoelentest 8d"},
   {"k": "mc", "q": "Vul in: −5{1/4} … −5,25", "opts": ["<", ">", "="], "a": 2, "bk": "blz. 93, leerdoelentest 8e"},
   {"k": "mc", "q": "Vul in: 0 … −11{3/4}", "opts": ["<", ">", "="], "a": 1, "bk": "blz. 93, leerdoelentest 8f"},
   calc("5 − 9", "blz. 93, leerdoelentest 9a"), calc("−5 + 9", "blz. 93, leerdoelentest 9b"), calc("−5 − 9", "blz. 93, leerdoelentest 9c"),
   calc("3 − 17", "blz. 93, leerdoelentest 9d"), calc("−3 + 17", "blz. 93, leerdoelentest 9e"), calc("−3 − 17", "blz. 93, leerdoelentest 9f"),
   calc("5 + −3", "blz. 93, leerdoelentest 10a"), calc("−3 − −1", "blz. 93, leerdoelentest 10b"), calc("−11 − −3", "blz. 93, leerdoelentest 10c"),
   calc("13 + −7", "blz. 93, leerdoelentest 10d"), calc("−13 − −27", "blz. 93, leerdoelentest 10e"), calc("−15 − 38", "blz. 93, leerdoelentest 10f"),
   calc("−3 + 19 − −41", "blz. 93, leerdoelentest 10g"), calc("3 − (−21 + −12)", "blz. 93, leerdoelentest 10h"), calc("−7 − (−8 − −2)", "blz. 93, leerdoelentest 10i"),
   {"k": "order", "q": "Zet van klein naar groot.", "items": ["−1000", "−{5/4}", "−1", "{2/3}", "{12/5}", "2{1/2}"], "bk": "blz. 71, opdr. 35"},
   {"k": "num", "q": "Op Antarctica was het −89 °C, in Death Valley 54 °C. Hoeveel graden is het verschil?", "a": 143, "tol": 0, "unit": "°C", "x": "54 − −89 = 54 + 89 = 143.", "bk": "blz. 76"},
   {"k": "tf", "q": "0 is een positief getal.", "a": False, "x": "0 is niet positief en niet negatief.", "bk": "blz. 70"},
   *gen("neg_op", "blz. 74-75", 3), *gen("vergelijk", "blz. 71", 2)]})

T.append({"id": "w4", "nav": "2.4", "title": "Negatieve getallen vermenigvuldigen en delen", "pages": "blz. 78-82", "bron": [78, 79, 80, 81, 82],
 "doelen": ["Je kunt vermenigvuldigen met negatieve getallen, ook in combinatie met de rekenvolgorde.", "Je kunt delen met negatieve getallen, ook in combinatie met de rekenvolgorde."],
 "kern": ["8 · 7 = 56 · 8 · −7 = −56 · −6 · 3 = −18 · −3 · −12 = 36",
          "18 : 3 = 6 · 36 : −12 = −3 · −56 : 7 = −8 · −56 : −7 = 8",
          "**+ · + = +** · **+ · − = −** · **− · + = −** · **− · − = +** (bij delen precies hetzelfde)",
          "Bij 5 − 6 · −3 heb je te maken met twee verschillende mintekens: de **aftrekmin** en de **negatieve min**.",
          "Denk ook bij negatieve getallen aan de rekenvolgorde: 5 − 6 · −3 = 5 − −18 = 5 + 18 = **23** · −15 − 18 : −3 = −15 − −6 = −15 + 6 = **−9**"],
 "let": ["−5 − 3 is een **aftrekking** (= −8), −5 · −3 is een **vermenigvuldiging** (= 15).", "Meer factoren? Tel de minnen: **even** aantal → positief, **oneven** → negatief.", "Een getal keer 0 is 0, en 0 gedeeld door een getal is 0."],
 "n": 12, "qs": [
   calc("−8 · −3", "blz. 93, leerdoelentest 11a"), calc("−8 − 3", "blz. 93, leerdoelentest 11b"), calc("−5 · 4 · −6", "blz. 93, leerdoelentest 11c"),
   calc("−5 + 4 − 6", "blz. 93, leerdoelentest 11d"), calc("−4 − −12", "blz. 93, leerdoelentest 11e"), calc("−4 · −12", "blz. 93, leerdoelentest 11f"),
   calc("−25 − 5 · 3 − 1", "blz. 93, leerdoelentest 12a"), calc("12 · −6 − 8 · −2", "blz. 93, leerdoelentest 12b"),
   calc("−21 + (2 − 12) · −8 + 3", "blz. 93, leerdoelentest 12c"), calc("(−17 + 8) · −5 − 6 · −3", "blz. 93, leerdoelentest 12d"),
   calc("17 − 9 : −3", "blz. 93, leerdoelentest 13a"), calc("(−17 − 19) : −4 − 6", "blz. 93, leerdoelentest 13b"),
   calc("−60 : (3 · −4) − 18 : 2", "blz. 93, leerdoelentest 13c"), calc("27 : −3 · (6 − 2 · 5 − 7)", "blz. 93, leerdoelentest 13d"),
   calc("5 − 6 · −3", "blz. 89"), calc("−15 − 18 : −3", "blz. 89"),
   {"k": "mc", "q": "Wat is het teken van de uitkomst van −2 · −3 · −1 · −5 · −4?", "opts": ["negatief (oneven aantal minnen)", "positief (even aantal minnen)"], "a": 0, "bk": "blz. 79, opdr. 61"},
   *gen("neg_keer", "blz. 79-81", 4)]})

T.append({"id": "w5", "nav": "2.5", "title": "Negatieve breuken", "pages": "blz. 83-87", "bron": [83, 84, 85, 86, 87],
 "doelen": ["Je kunt berekeningen maken waarin de deelstreep voorkomt.", "Je kunt berekeningen maken met negatieve breuken."],
 "kern": ["Je kunt een deling met een deelstreep noteren. {27/−9} betekent 27 : −9, dus {27/−9} = −3. En zo is {−80/−16} = 5.",
          "Bij {24 − 30/5 − 6} bereken je eerst de teller en de noemer apart. Dus {24 − 30/5 − 6} = {−6/−1} = 6.",
          "Bij het vereenvoudigen van breuken laat je **geen minteken in de teller of de noemer** staan. Dus {−2/5} = −{2/5}, {4/−6} = −{4/6} = −{2/3} en {−4/−8} = {4/8} = {1/2}.",
          "−{2/3} + {5/8} = −{16/24} + {15/24} = −{1/24} · −{2/3} − {2/9} = −{6/9} − {2/9} = −{8/9}",
          "−2{2/3} + 1{1/5} = −{8/3} + {6/5} = −{40/15} + {18/15} = −{22/15} = −1{7/15}",
          "−{3/5} · {2/7} = −{6/35} · −1{1/6} · −{2/7} = −{7/6} · −{2/7} = {14/42} = {1/3}"],
 "let": ["Met de deelstreep: **eerst boven en onder apart uitrekenen**, dan delen.", "Een negatief gemengd getal: −2{2/3} = −{8/3} (het minteken hoort bij het hele getal).", "Mintekens in teller én noemer heffen elkaar op: {−4/−8} = {1/2}."],
 "n": 12, "qs": [
   calc("{−24 − 16/2 · −4}", "blz. 93, leerdoelentest 14a"), calc("{21 + −21/−3 − 10}", "blz. 93, leerdoelentest 14b"),
   calc("{−18/3} · 2 − {9 − 4/−5 : 1}", "blz. 93, leerdoelentest 14c"), calc("4 · {−28/7} − ({16/−2} − 2) · −1", "blz. 93, leerdoelentest 14d"),
   calc("−{5/9} + {1/4}", "blz. 93, leerdoelentest 15a"), calc("−{4/5} − {2/3}", "blz. 93, leerdoelentest 15b"),
   calc("−1{2/3} + 4{1/2}", "blz. 93, leerdoelentest 15c"), calc("1{2/7} − 5{1/3}", "blz. 93, leerdoelentest 15d"),
   calc("−7{1/3} − 3{1/5}", "blz. 93, leerdoelentest 15e"), calc("6 − 13{1/5}", "blz. 93, leerdoelentest 15f"),
   calc("−{3/7} · {2/5}", "blz. 93, leerdoelentest 16a"), calc("−{3/7} + {2/5}", "blz. 93, leerdoelentest 16b"),
   calc("−1{1/6} · −{2/7}", "blz. 93, leerdoelentest 16c"), calc("−1{1/6} − {2/7}", "blz. 93, leerdoelentest 16d"),
   calc("({−18/−3} − 8) · −4", "blz. 89"),
   {"k": "calc", "q": "Vereenvoudig: {−18/27}", "a": "-2/3", "bk": "blz. 84"},
   {"k": "calc", "q": "Vereenvoudig: {−16/−20}", "a": "4/5", "bk": "blz. 84"},
   *gen("deelstreep", "blz. 83", 2), *gen("neg_breuk", "blz. 85", 3)]})

# controle tegen het antwoordenboek (uitwerkingen leerdoelentest)
CHECK = {"21 + 3 · 5 + 11 : 11": 37, "80 : 2 · 4 − (7 − 2)": 155, "{8/9} − {5/9}": F(1, 3), "−1{1/6} · −{2/7}": F(1, 3), "5 − 6 · −3": 23, "−15 − 18 : −3": -9, "({−18/−3} − 8) · −4": 8, "{24 − 30/5 − 6}": 6}
for e, want in CHECK.items(): assert ev(e) == want, (e, ev(e), want)

data = {
 "meta": {"id": "wiskunde-pw1", "type": "leer", "brand": "Wiskunde", "sub": "Toetsweek · H2 Getallen en bewerkingen", "title": "Wiskunde H2", "toets": "toets", "lidw": "de", "examDate": "2026-11-03"},
 "instructie": "H2 Getallen en bewerkingen: alle paragrafen van hoofdstuk 2 (2.1 t/m 2.5).",
 "instructieVerbatim": "De leerstof voor de toetsweek:\n\nH2 Getallen en bewerkingen     : alle paragrafen van hoofdstuk 2\n\nMeenemen : gevulde etui, geodriehoek, (kleur)potloden en markeerstift.\n\nSucces met de voorbereidingen!",
 "C": "Dit antwoord is niet uit het boek maar zelf geschreven. Check het met je boek of je docent.",
 "extra": "Schrijf bij elke som de tussenstappen op papier, net als op de toets. Typ daarna alleen de uitkomst in.",
 "topics": T,
 "bronnen": {"pages": list(range(56, 100))},
}
json.dump(data, open(f"{ROOT}/wiskunde/proefwerk-1/data.json", "w"), ensure_ascii=False, indent=1)
print(len(T), "onderwerpen,", sum(len(t["qs"]) for t in T), "vragen")
