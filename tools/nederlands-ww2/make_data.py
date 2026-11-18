"""Maakt nederlands/so-ww/data.json (leer.js) voor de SO werkwoordspelling van 27 november 2026.
Bronnen: PPT 'Werkwoordspelling klas 1 compleet', 'Schema werkwoordsvormen en werkwoordspelling', de twee oefentoetsen
van de docent (met antwoorden) en Gespeld deel 1 en 2 (16 werkbladen; zinnen, antwoorden en uitleg uit de antwoordbladen,
eerder ingelezen voor de module van oktober, zie git 0745f56). Gebruik: python make_data.py <repo-map> <oude-data.json>"""
import json, re, sys
ROOT, OLD = sys.argv[1], sys.argv[2]
old = json.load(open(OLD))
M = f"{ROOT}/nederlands/so-ww"

FORMS = ["persoonsvorm tt", "persoonsvorm vt", "voltooid deelwoord", "onvoltooid deelwoord", "bijvoeglijk gebruikt (on)voltooid deelwoord", "infinitief", "gebiedende wijs"]
FI = {"pvtt": 0, "pvvt": 1, "vd": 2, "ovd": 3, "bn": 4, "inf": 5, "gw": 6}
RULE = {  # samengevat uit het schema en de PPT
    "pvtt": "**pv tt:** ik-vorm; **+ t** bij hij/zij/het/u/men en bij jij/je **vóór** de pv. Staat jij/je **áchter** de pv: geen t. Meervoud = hele werkwoord.",
    "pvvt": "**pv vt zwak:** zit de laatste letter van de **stam** in ’t ex-kofschip? → ik-vorm + **te(n)**, anders + **de(n)**. **Sterk:** de klank verandert, schrijf zoals je het hoort.",
    "vd": "**vd zwak:** (ge/be/ver/ont/er) + ik-vorm + **t** (stam in ’t ex-kofschip) of **d** (niet), altijd één t of d. **Sterk:** vd op **-en**.",
    "ovd": "**ovd** = hele werkwoord + **d(e)**: eindigt op **-nd(e)**.",
    "inf": "**infinitief** = het hele werkwoord. Na **te** en **aan het** altijd de infinitief. Niet verwarren met de pv tt meervoud.",
    "gw": "**gebiedende wijs** = **ik-vorm**; er is geen onderwerp.",
    "bn": "**bijvoeglijk gebruikt:** vd op -d/-t → + **e**, zo kort mogelijk (*vergrote, bestede*); vd op -en blijft **-en** (*gestolen*); van een ovd → **-nde** (*verwoestende*).",
}

def q_type(sent, verb, ans, f, x=None, bk=None, note=None):
    q = {"k": "type", "strict": True, "ctx": sent.replace("█", "**…**"), "q": f"Spel het werkwoord op de puntjes: **{verb}**", "a": ans, "show": " / ".join(ans) if len(ans) > 1 else ans[0],
         "xw": RULE[f], "bk": bk}
    xs = [f"*{FORMS[FI[f]]}*" + (f" ({note})" if note else "")]
    if x: xs.append(x)
    q["x"] = " · ".join(xs)
    return q

def q_form(sent, verb, f, bk, x=None):
    return {"k": "mc", "keep": True, "ctx": sent.replace("█", "**…**") + f" ({verb})", "q": "Welke werkwoordsvorm hoort op de puntjes?", "opts": FORMS, "a": FI[f], "bk": bk,
            **({"x": x} if x else {})}

# ---- oefentoetsen van de docent (letterlijk; antwoorden en vormen uit het antwoordmodel)
O1 = [("Het kan soms weken duren voordat een verdachte schuld █.", "bekennen", ["bekent"], "pvtt", None),
      ("Wat voor weer █ er verwacht?", "worden", ["wordt"], "pvtt", None),
      ("‘█ je snel weer beter?’, vroeg de kleine jongen bezorgd aan zijn zieke oma.", "worden", ["word"], "pvtt", None),
      ("De jongen █ zich gisteren in zijn vinger en draagt nu een pleister.", "snijden", ["sneed"], "pvvt", "sterk ww"),
      ("De directeur █ de gang van zaken.", "betreuren", ["betreurt"], "pvtt", None),
      ("Toen die baas het bedrijf █, was iedereen blij.", "verlaten", ["verliet"], "pvvt", "sterk ww"),
      ("█ je vriendin nog voor dat vakantiebaantje gevraagd?", "worden", ["wordt"], "pvtt", None),
      ("Lisa █ niet langer bang zijn in het donker en besluit een challenge aan te gaan.", "willen", ["wil"], "pvtt", "onregelmatig ww"),
      ("Die oudere mensen hebben hun hele leven █.", "reizen", ["gereisd"], "vd", None),
      ("Nog █ van een zware griep, ging Henri alweer aan het werk.", "herstellen", ["herstellend"], "ovd", None),
      ("Tijdens de vakantie heeft zij heel veel geld █.", "verspillen", ["verspild"], "vd", None),
      ("Timo is al drie keer eerder ziek █ dit schooljaar.", "zijn", ["geweest"], "vd", "onregelmatig ww"),
      ("Zij konden uw excuses niet █.", "aanvaarden", ["aanvaarden"], "inf", None),
      ("Gisteren █ wij met een spectaculaire reclamecampagne.", "starten", ["startten"], "pvvt", None),
      ("Nina █ vorige week tijdens het sollicitatiegesprek dat ze veel ervaring had.", "faken", ["fakete"], "pvvt", None),
      ("Het te laat █ vliegtuig had veel tegenwind gehad.", "landen", ["gelande"], "bn", "bijvoeglijk gebruikt vd"),
      ("█ u creditcards?", "aanvaarden", ["aanvaardt"], "pvtt", None),
      ("Wij █ tijdens de laatste vakantie een bezoek aan een oud kasteel.", "brengen", ["brachten"], "pvvt", "sterk ww"),
      ("Ik hoop dat zijn gezeur een keer █.", "ophouden", ["ophoudt"], "pvtt", None),
      ("De situatie is alleen maar verder █.", "verslechteren", ["verslechterd"], "vd", None),
      ("We hopen niet dat de situatie steeds verder zal █.", "verslechteren", ["verslechteren"], "inf", None),
      ("De situatie █ steeds verder.", "verslechteren", ["verslechtert"], "pvtt", None),
      ("De █ aankomsttijd van vlucht NH746 uit Augsburg is om 9.40u, tien minuten later dan gepland.", "verwachten", ["verwachte"], "bn", "bijvoeglijk gebruikt vd"),
      ("We █ de vorige zomer in hetzelfde hotel.", "overnachten", ["overnachtten"], "pvvt", None),
      ("Omdat de race niet goed █ werd, moeten alle deelnemers opnieuw starten.", "timen", ["getimed"], "vd", None),
      ("Nog niet zo lang geleden █ men die foto’s niet zo makkelijk.", "vergroten", ["vergrootte"], "pvvt", "men = ev, maar verwijst naar meerdere mensen"),
      ("Je moet vragen wat hij daarmee █ bereiken.", "willen", ["wil"], "pvtt", None),
      ("In ons █ kantoor, wordt niet snel ingebroken.", "verlichten", ["verlichte"], "bn", "bijvoeglijk gebruikt vd"),
      ("In ons verlichte kantoor, █ niet snel ingebroken.", "worden", ["wordt"], "pvtt", None),
      ("De gisteren █ brief is nog niet aangekomen bij de ontvanger.", "verzenden", ["verzonden"], "bn", "bijvoeglijk gebruikt vd")]
O2 = [("Deze zandbanken zijn berucht: daar █ menig schip.", "stranden, tt", ["strandt"], "pvtt", None),
      ("Toen wij in Florence waren, █ een paar studenten ons rond.", "leiden", ["leidden"], "pvvt", None),
      ("De fotograaf toonde zijn klant de █ gezinsfoto die was gemaakt op het strand.", "vergroten", ["vergrote"], "bn", "bijvoeglijk gebruikt vd"),
      ("De huizen die door de brand vernield werden, zijn nu █.", "herbouwen", ["herbouwd"], "vd", None),
      ("Het █ bedrag was hoger dan we hadden verwacht.", "besteden", ["bestede"], "bn", "bijvoeglijk gebruikt vd"),
      ("Toen de Pietjes op de deur █, schrokken de kinderen van het harde geluid.", "bonzen", ["bonsden"], "pvvt", None),
      ("De groep jongeren █ erop los nadat alle tieners uit de groep hun examen hadden gehaald.", "partyen", ["partyde"], "pvvt", "ev"),
      ("De jongeren █ erop los nadat zij hun examen hadden gehaald.", "partyen", ["partyden"], "pvvt", "mv"),
      ("De █ brand heeft veel schade aangericht.", "verwoesten", ["verwoestende"], "bn", "bijvoeglijk gebruikt onvoltooid deelwoord"),
      ("De verwoestende brand heeft veel schade █.", "aanrichten", ["aangericht"], "vd", None),
      ("De leerling █ de lesstof die hij had gemist toen hij afwezig was.", "achterhalen", ["achterhaalt"], "pvtt", None),
      ("De leerling heeft de █ lesstof achterhaald.", "missen", ["gemiste"], "bn", "bijvoeglijk gebruikt vd"),
      ("De leerling heeft de gemiste lesstof █.", "achterhalen", ["achterhaald"], "vd", None),
      ("Aan de horizon █ je duidelijk de twee vuurtorens.", "onderscheiden", ["onderscheid"], "pvtt", None),
      ("Aan de horizon █ de stuurman duidelijk de twee vuurtorens.", "onderscheiden", ["onderscheidt"], "pvtt", None),
      ("Hij heeft te veel tijd aan gamen besteed, waardoor hij zijn studie heeft █.", "verwaarlozen", ["verwaarloosd"], "vd", None),
      ("Lisanne █ dagelijks meer dan drie uur op haar telefoon.", "swipen", ["swipet"], "pvtt", None),
      ("Lisanne heeft meer dan drie uur op haar telefoon █.", "swipen", ["geswipet"], "vd", None),
      ("█ met haar telefoon in de hand loopt Lisanne naar school en is daardoor niet gefocust op haar omgeving.", "swipen", ["swipend"], "ovd", None),
      ("Tijdens het schaatsen was hij █.", "uitglijden", ["uitgegleden"], "vd", None),
      ("Derk █ absoluut niet dat iemand hem helpt met zijn schoolwerk.", "willen, tt", ["wil"], "pvtt", None),
      ("Het nieuws █ zich na het incident snel door de school.", "verspreiden, tt", ["verspreidt"], "pvtt", None),
      ("Het nieuws █ zich na het incident snel door de school.", "verspreiden, vt", ["verspreidde"], "pvvt", None),
      ("Het █ nieuws zorgde voor veel onrust in het dorp.", "verspreiden", ["verspreide"], "bn", "bijvoeglijk gebruikt vd"),
      ("Het nieuws zal zich snel door de school █.", "verspreiden", ["verspreiden"], "inf", None),
      ("Timothy moet zijn telefoon nodig █.", "upgraden", ["upgraden"], "inf", None),
      ("We zijn al drie keer eerder in de dierentuin █.", "zijn", ["geweest"], "vd", None),
      ("De pas █ sneeuw, was binnen enkele uren alweer gesmolten.", "vallen", ["gevallen"], "bn", "bijvoeglijk gebruikt vd"),
      ("De pas gevallen sneeuw, was binnen enkele uren alweer █.", "smelten", ["gesmolten"], "vd", None),
      ("Timothy █ vorige week zijn telefoon nadat hij meerdere meldingen had gekregen op zijn telefoon.", "upgraden", ["upgradede"], "pvvt", None),
      ("Betül heeft deze week al meer dan tien uur samen met haar beste vriendin █.", "gamen", ["gegamed"], "vd", None),
      ("Niemand kon █ dat de situatie zo ernstig was.", "vermoeden", ["vermoeden"], "inf", None),
      ("Vorige week █ de leerlingen en de docenten de lokalen opnieuw in.", "richten", ["richtten"], "pvvt", "mv"),
      ("Vorige week █ de schoolleiding de aula opnieuw in.", "richten", ["richtte"], "pvvt", "ev"),
      ("De █ fiets is nog steeds niet terecht.", "stelen", ["gestolen"], "bn", "bijvoeglijk gebruikt vd"),
      ("█ nou eens je mond!", "houden", ["houd", "hou"], "gw", None)]
assert len(O1) == 30 and len(O2) == 36
TOETS = [(s, v, a, f, n, "oefentoets 1") for s, v, a, f, n in O1] + [(s, v, a, f, n, "oefentoets 2") for s, v, a, f, n in O2]

# ---- PPT-oefening (dia 37-38) en dia 31; twee puntjes in één zin worden twee vragen
PPT = []
for it in old["ppt"]:
    d, n = it["d"], it["d"].count("█")
    parts = d.split("█")
    for i in range(n):
        s = parts[0] + "".join(("█" if j == i else it["a"][j]) + parts[j + 1] for j in range(n))
        PPT.append((s, it["v"], [it["a"][i]], it["f"], it["x"]))
PPT += [("Mark en Tim █ het bestand gisteren.", "downloaden", ["downloadden"], "pvvt", None),
        ("Ik █ mijn website een uur geleden.", "updaten", ["updatete"], "pvvt", None),
        ("Ik heb mijn website gisteren nog █.", "updaten", ["geüpdatet"], "vd", None)]

# ---- Gespeld: 256 zinnen met antwoord en uitleg uit de antwoordbladen
GES = [(q["d"], q["v"], q["a"], q["f"], q["x"], s["id"]) for s in old["sheets"] for q in s["q"]]
def ges_qs(fs, sheets=None):
    return [q_type(d, v, a, f, x, f"Gespeld {sid.split('-')[0]}, werkblad {sid.split('-')[1]}") for d, v, a, f, x, sid in GES if f in fs and (sheets is None or sid in sheets)]
def first_sentence(x): return re.split(r"(?<=\.)\s", x, maxsplit=1)[0]

ENG_SHEET = {"2-10"}
SLIDE = lambda n, cap: {"src": f"slides/s-{n:02d}.jpg", "cap": cap}
topics = []

# 1 werkwoordsvormen herkennen
herk = [q_form(s, v, f, bk, f"Antwoordmodel: {FORMS[FI[f]]}" + (f" ({n})" if n else "")) for s, v, a, f, n, bk in TOETS]
herk += [q_form(s, v, f, "PPT dia 37", x) for s, v, a, f, x in PPT]
seen = {}
for d, v, a, f, x, sid in GES:  # een selectie uit Gespeld: alle bn en gw, en per vorm 8 andere
    if f in ("bn", "gw") or seen.get(f, 0) < 8:
        seen[f] = seen.get(f, 0) + 1
        herk.append(q_form(d, v, f, f"Gespeld {sid.split('-')[0]}, werkblad {sid.split('-')[1]}", first_sentence(x)))
for it in old["pv"]:
    words = []
    for w in re.findall(r"[\wäëïöüéè’']+", it["s"]):
        if w not in words: words.append(w)
    herk.append({"k": "pick", "q": ("Tik alle **persoonsvormen** aan: " if it["ask"] == "pv" else "Tik alle **infinitieven** aan: ") + it["s"], "opts": words, "ok": it["ok"], "x": it["x"], "bk": "PPT dia 7 en 18"})
herk += [
    {"k": "mc", "q": "Hoe vind je de persoonsvorm het best, ook in een samengestelde zin?", "opts": ["met de tijdproef of de getalproef", "met de vraagproef", "het eerste werkwoord in de zin is altijd de pv"], "a": 0,
     "x": "Tijdproef: zet de zin in een andere tijd. Getalproef: zet de zin van ev in mv of andersom. Het werkwoord dat verandert, is de pv. De vraagproef werkt niet altijd goed.", "bk": "PPT dia 6-7"},
    {"k": "mc", "q": "Wat doe je éérst als je een werkwoord moet spellen?", "opts": ["de werkwoordsvorm vaststellen", "het kofschip toepassen", "de stam opzoeken"], "a": 0, "x": "Is het een pv? Zo nee, welke vorm dan wel? Pas daarna de regel van die vorm toe.", "bk": "schema"},
    {"k": "mc", "q": "Een werkwoord na **te** of **aan het** is altijd …", "opts": ["de infinitief", "de persoonsvorm", "een voltooid deelwoord"], "a": 0, "x": "*Hij is aan het lachen.* · *De te beantwoorden vragen*", "bk": "PPT dia 18"},
    {"k": "mc", "q": "*Twee scholieren branden een kaars.* Wat is **branden** hier?", "opts": ["persoonsvorm tt (meervoud)", "infinitief", "onvoltooid deelwoord"], "a": 0, "x": "Getalproef: één scholier brandt → het verandert, dus pv. Infinitief niet verwarren met pv tt mv.", "bk": "PPT dia 18"},
    {"k": "sort", "q": "Sterk, zwak of onregelmatig?", "cats": ["sterk", "zwak", "onregelmatig"], "items": [["lopen – liep", "sterk"], ["kijken – keek", "sterk"], ["helpen – hielp", "sterk"], ["snoepen – snoepte", "zwak"], ["werken – werkte", "zwak"], ["verhuizen – verhuisde", "zwak"], ["hebben – had", "onregelmatig"], ["zijn – was", "onregelmatig"], ["kunnen – kon", "onregelmatig"]],
     "x": "Sterk: de klank verandert in de vt. Zwak: geen klankverandering, -de/-te. Onregelmatig: hebben, kunnen, mogen, willen, zijn, zullen.", "bk": "PPT dia 10-13, 22"},
]
topics.append({"id": "vorm", "nav": "Vormen", "title": "Werkwoordsvormen herkennen", "pages": "schema + PPT dia 4-7, 18", "n": 12,
    "bron": [{"src": "bronnen/schema-1.jpg", "cap": "Schema blz. 1"}, {"src": "bronnen/schema-2.jpg", "cap": "Schema blz. 2"}, {"src": "bronnen/schema-3.jpg", "cap": "Schema blz. 3"}, SLIDE(5, "Werkwoordsvormen"), SLIDE(6, "Hoe vind je de persoonsvorm?"), SLIDE(7, "De pv in samengestelde zinnen")],
    "doelen": ["Je stelt bij elk werkwoord eerst de werkwoordsvorm vast: persoonsvorm (tt of vt), voltooid deelwoord, onvoltooid deelwoord, bijvoeglijk gebruikt (on)voltooid deelwoord, gebiedende wijs of infinitief.", "Je vindt de persoonsvorm met de tijdproef of de getalproef."],
    "kern": ["We onderscheiden **sterke**, **zwakke** en **onregelmatige** werkwoorden. Sterke werkwoorden veranderen in de vt van klank; zwakke niet. De onregelmatige werkwoorden zijn: zullen, zijn, mogen, hebben, kunnen en willen.",
             "De belangrijkste werkwoordsvormen: **persoonsvorm tt en vt** (vergroot/vergrootte) · **gebiedende wijs** (vergroot!) · **voltooid deelwoord** (vergroot) · **infinitief** (vergroten) · **onvoltooid deelwoord** (vergrotend) · **bijvoeglijk naamwoord** (vergrote)",
             "**Als je een werkwoord moet spellen, stel je eerst de werkwoordsvorm vast!** Is het te spellen werkwoord wel/geen persoonsvorm? Zo nee: welke vorm dan wel? Pas de regel toe die bij die vorm past.",
             "**Persoonsvorm vinden:** doe de **tijdproef** (zet de zin in een andere tijd) of de **getalproef** (ev ↔ mv). Het werkwoord dat verandert, is de persoonsvorm. Een samengestelde zin kan meer persoonsvormen hebben.",
             "Als de tijd niet duidelijk blijkt uit de zin, kies je de **tegenwoordige tijd**."],
    "let": ["Gebruik de tijd- of getalproef, niet de vraagproef: die werkt niet altijd.", "Infinitief niet verwarren met de pv tt meervoud: *Twee scholieren **branden** een kaars* is een pv.", "Een vd met een hulpwerkwoord (is, heeft, werd) is geen bijvoeglijk naamwoord; zegt het iets over een zelfstandig naamwoord (*de **vergrote** foto*), dan wel."],
    "qs": herk})

# 2 pv tt
pvtt = ges_qs({"pvtt"}, sheets={s["id"] for s in old["sheets"]} - ENG_SHEET) + [q_type(s, v, a, f, x, "PPT dia 37") for s, v, a, f, x in PPT if f == "pvtt"]
pvtt += [
    {"k": "mc", "q": "Kies: ___ je geen tegenspraak? (dulden)", "opts": ["Duld", "Duldt"], "a": 0, "x": "Jij/je **áchter** de pv: alleen de ik-vorm. *Duldt je broer geen tegenspraak?* krijgt wél een t (je broer = hij).", "bk": "PPT dia 9"},
    {"k": "mc", "q": "Kies: ___ jij altijd op tijd?", "opts": ["Ben", "Bent"], "a": 0, "x": "Jij áchter de pv → geen t: *Ben jij …?* maar *Jij bent …*", "bk": "PPT dia 25"},
    {"k": "mc", "q": "Wat is de **stam** van *verhuizen*, en wat de **ik-vorm**?", "opts": ["stam verhuiz, ik-vorm verhuis", "stam verhuis, ik-vorm verhuiz", "stam en ik-vorm zijn allebei verhuis"], "a": 0, "x": "Stam = hele werkwoord – en. De pv tt maak je met de **ik-vorm**: hij verhuist.", "bk": "PPT dia 8"},
    {"k": "mc", "q": "*Je moet vragen of je broer het boek ___.* (vinden)", "opts": ["vindt", "vind"], "a": 0, "x": "Je broer = hij → ik-vorm + t.", "check": True},
]
topics.append({"id": "pvtt", "nav": "pv tt", "title": "Persoonsvorm tegenwoordige tijd", "pages": "PPT dia 8-9", "n": 12, "bron": [SLIDE(8, "Stam en ik-vorm"), SLIDE(9, "PV TT"), SLIDE(25, "Let op: jij achter de pv")],
    "doelen": ["Je spelt de persoonsvorm in de tegenwoordige tijd goed, ook bij jij/je achter de persoonsvorm en bij werkwoorden met een d in de stam."],
    "kern": ["**ik** → ik-vorm: *ik download*", "**… je** (jij/je **áchter** de pv) → ik-vorm: *download je*", "**hij, zij, het, u, je** (vóór de pv) → ik-vorm **+ t**: *downloadt*", "**wij, zij, jullie** → hele werkwoord: *downloaden*",
             "Hulpje: gebruik een ander werkwoord, zoals **zwemmen, lopen** of ‘**smurfen**’. Noteer de ik-vorm en eventueel de -t als je die hoort bij het vervangende werkwoord. *Duld je geen tegenspraak? Duldt je broer geen tegenspraak?*",
             "**Stam** = hele werkwoord – en (lop, verhuiz, zitt); **ik-vorm** = ik loop, ik verhuis, ik zit. De pv tt bouw je op de **ik-vorm**."],
    "let": ["**Word je …?** (geen t) maar **Je wordt …** en **Wordt je vriendin …?** (je vriendin = zij).", "Een d in de stam blijft staan: hij **vindt**, het **wordt**, het nieuws **verspreidt**.", "Lijkt de pv op een voltooid deelwoord (*bedoelt / bedoeld*)? Is het de pv, dan gewoon ik-vorm + t."],
    "qs": pvtt})

# 3 pv vt + kofschipdrill
pvvt = ges_qs({"pvvt"}, sheets={s["id"] for s in old["sheets"]} - ENG_SHEET) + [q_type(s, v, a, f, x, "PPT dia 37") for s, v, a, f, x in PPT if f == "pvvt" and v not in ("downloaden", "updaten", "racen, vt")]
for inf, ik, vt, vd in old["kof"]:
    pvvt.append({"k": "type", "strict": True, "q": f"Verleden tijd enkelvoud van **{inf}**: gisteren … hij", "a": [vt], "bk": "kofschip",
                 "xw": f"Stam **{inf[:-2]}**, ik-vorm **{ik}**: " + ("laatste letter van de stam in ’t ex-kofschip → ik-vorm + **te**." if vt.endswith("te") else "laatste letter van de stam niet in ’t ex-kofschip → ik-vorm + **de**.")})
pvvt += [
    {"k": "mc", "q": "Welke medeklinkers zitten in ’t ex-kofschip?", "opts": ["t, x, k, f, s, ch, p", "t, k, f, s, ch, p, d", "x, k, f, s, ch, p, v, z"], "a": 0, "x": "’t eX-KoFSCHiP: t, x, k, f, s, ch, p. (’t sexy fokschaapje / kofschiptaxietje: dezelfde letters.)", "bk": "PPT dia 11"},
    {"k": "mc", "q": "Waarom is het **verhuisde** en niet *verhuiste*?", "opts": ["Je kijkt naar de stam (verhuiz): de z zit niet in ’t ex-kofschip.", "Omdat je de s hoort.", "Omdat verhuizen een sterk werkwoord is."], "a": 0, "x": "Let op het verschil tussen stam en ik-vorm, bijvoorbeeld bij verhuizen en verven.", "bk": "PPT dia 11"},
    {"k": "mc", "q": "Waarom schrijf je **startten** met twee keer t?", "opts": ["start (ik-vorm) + ten: de eerste t hoort bij de stam", "omdat het een sterk werkwoord is", "omdat het meervoud altijd tt heeft"], "a": 0, "bk": "oefentoets 1"},
    {"k": "mc", "q": "Hoe herken je een **sterk** werkwoord?", "opts": ["de klank verandert in de vt (roep – riep)", "de vt eindigt op -te", "het vd eindigt op -d"], "a": 0, "x": "Sterke werkwoorden schrijf je zoals je ze hoort, zo eenvoudig mogelijk.", "bk": "PPT dia 10, 12"},
]
topics.append({"id": "pvvt", "nav": "pv vt", "title": "Persoonsvorm verleden tijd", "pages": "PPT dia 10-13", "n": 12, "bron": [SLIDE(10, "PV VT"), SLIDE(11, "PV VT zwakke ww"), SLIDE(12, "PV VT sterke ww"), SLIDE(13, "Extra informatie")],
    "fig": [["slides/s-11.jpg", "’t ex-kofschip / ’t sexy fokschaapje"]],
    "doelen": ["Je spelt de persoonsvorm in de verleden tijd van zwakke werkwoorden met ’t ex-kofschip en van sterke werkwoorden zoals je ze hoort."],
    "kern": ["Als de klank in de verleden tijd hetzelfde blijft, is het een **zwak** werkwoord: snoep – snoepte. Bij een **sterk** werkwoord verandert de klank: roep – riep. Sterke werkwoorden schrijf je zoals je ze hoort, zo eenvoudig mogelijk.",
             "**Zwak, enkelvoud:** ik-vorm + **de/te** · **meervoud:** ik-vorm + **den/ten**",
             "Zit de laatste letter van **de stam** in de medeklinkers van **’t ex-kofschip** (t, x, k, f, s, ch, p)? → ik-vorm + **te(n)**. Zo niet → ik-vorm + **de(n)**.",
             "Let op het verschil tussen **stam** en **ik-vorm**, bijvoorbeeld bij **verhuizen** (verhuiz → verhuisde) en **verven** (verv → verfde).", "j als sj- of tsj-klank: roetsjen → roetsjte en geroetsjt."],
    "let": ["Kijk naar de **stam**, niet naar wat je hoort: verhui**z**en → verhuisde, ve**rv**en → verfde.", "Twee keer t of d als de stam al op t of d eindigt: **startten, overnachtten, leidden, verspreidde**.", "Meervoud: **-den / -ten** (bonsden, richtten); enkelvoud **-de / -te** (richtte)."],
    "qs": pvvt})

# 4 vd
vdq = ges_qs({"vd"}, sheets={s["id"] for s in old["sheets"]} - ENG_SHEET) + [q_type(s, v, a, f, x, "PPT dia 37") for s, v, a, f, x in PPT if f == "vd" and v != "updaten"]
for inf, ik, vt, vd in old["kof"]:
    vdq.append({"k": "type", "strict": True, "q": f"Voltooid deelwoord van **{inf}**: ik heb / ben …", "a": [vd], "bk": "kofschip",
                "xw": "Zwak: (ge) + ik-vorm + **t** als de laatste letter van de stam in ’t ex-kofschip zit, anders **d**. Altijd maar één t of d. Begint het werkwoord met ge/be/ver/ont/er, dan geen extra ge-."})
vdq += [
    {"k": "mc", "q": "Welk voltooid deelwoord is goed?", "opts": ["opgeblazen", "geopblazen", "opblazen"], "a": 0, "x": "Scheidbaar werkwoord (ze blies de ballon **op**): ge in het woord.", "bk": "PPT dia 16"},
    {"k": "mc", "q": "Welk voltooid deelwoord is goed?", "opts": ["gestofzuigd", "stofgezuigd", "gestofzuigt"], "a": 0, "x": "Je zegt *ik stofzuig* (niet *ik zuig stof*), dus niet scheidbaar: ge ervoor.", "bk": "PPT dia 16, schema"},
    {"k": "mc", "q": "Welk voltooid deelwoord is goed?", "opts": ["gehandbald", "handgebald", "gehandbalt"], "a": 0, "x": "Hij handbalde (niet: hij balde hand) → ge ervoor.", "bk": "PPT dia 16"},
    {"k": "mc", "q": "Welk voltooid deelwoord is goed?", "opts": ["vergroot", "gevergroot", "vergrootd"], "a": 0, "x": "Werkwoorden die al met ge, be, ver, ont of er beginnen, krijgen geen extra voorvoegsel.", "bk": "PPT dia 16"},
    {"k": "mc", "q": "Een sterk werkwoord heeft een voltooid deelwoord op …", "opts": ["-en (gelopen, gezwommen)", "-d", "-t"], "a": 0, "bk": "PPT dia 15"},
    {"k": "mc", "q": "Waaraan herken je in een zin dat er een voltooid deelwoord moet staan?", "opts": ["er staat een vorm van zijn, hebben of worden bij", "er staat te of aan het voor", "er is geen onderwerp"], "a": 0, "bk": "PPT dia 15"},
]
topics.append({"id": "vd", "nav": "vd", "title": "Voltooid deelwoord", "pages": "PPT dia 15-16", "n": 12, "bron": [SLIDE(15, "Voltooid deelwoord"), SLIDE(16, "Voltooid deelwoord: scheidbare ww")],
    "doelen": ["Je spelt het voltooid deelwoord goed: met d of t bij zwakke werkwoorden, op -en bij sterke werkwoorden, en met ge op de goede plek."],
    "kern": ["Een voltooid deelwoord geeft aan dat een handeling **afgerond** is en staat meestal bij een vorm van **zijn, hebben** of **worden**.",
             "**Sterke werkwoorden:** vd op **-en** (gelopen, gezwommen).",
             "**Zwakke werkwoorden:** (ge/be/ver/ont/er) + ik-vorm + **t** als de laatste letter van de stam in ’t ex-kofschip zit (*gepast*), anders + **d** (*gespeeld*). Altijd één t of één d.",
             "**Scheidbare** werkwoorden krijgen ge in het woord: opgeblazen, afgeraden. Niet-scheidbare samengestelde werkwoorden krijgen ge ervoor: gehandbald, geglimlacht, gestofzuigd.",
             "Werkwoorden die al met **ge, be, ver, ont** of **er** beginnen, krijgen geen extra voorvoegsel: vergroot, verbouwd."],
    "let": ["Hoor je een t, schrijf je toch een **d** als de stam niet in ’t ex-kofschip zit: gerei**sd** (reiz), verwaarloo**sd** (verwaarloz).", "Nooit **dt** in een voltooid deelwoord: *verspild, herbouwd*.", "*opgeblazen* maar *gestofzuigd*: kijk of je het werkwoord kunt splitsen in een zin."],
    "qs": vdq})

# 5 bn, ovd, inf, gw
rest = ges_qs({"bn", "gw"}, sheets={s["id"] for s in old["sheets"]} - ENG_SHEET) + [q_type(s, v, a, f, x, "PPT dia 37") for s, v, a, f, x in PPT if f in ("bn", "ovd", "inf")]
rest += [q_type(s, v, a, f, None, bk, n) for s, v, a, f, n, bk in TOETS if f in ("bn", "ovd", "inf", "gw")]
rest += [
    {"k": "sort", "q": "Is het bijvoeglijk naamwoord afgeleid van een voltooid of van een onvoltooid deelwoord?", "cats": ["van een vd", "van een ovd"], "items": [["de gebakken vis", "van een vd"], ["de onderschatte man", "van een vd"], ["de verplichte toetsstof", "van een vd"], ["het moe gestreden elftal", "van een vd"],
        ["de verhelderende vraag", "van een ovd"], ["het zinkende schip", "van een ovd"], ["een schitterende roman", "van een ovd"], ["een verwoestend vuur", "van een ovd"]], "bk": "PPT dia 21"},
    {"k": "mc", "q": "Welke schrijfwijze is goed?", "opts": ["de vergrote foto", "de vergrootte foto", "de vergroote foto"], "a": 0, "x": "vd vergroot (op -t) → bn + e, zo kort mogelijk: vergrote.", "bk": "PPT dia 20"},
    {"k": "mc", "q": "Welke schrijfwijze is goed?", "opts": ["de gehate vijand", "de gehaatte vijand", "de gehaate vijand"], "a": 0, "x": "Zo kort mogelijk, tenzij de uitspraak verandert: gehate (niet gehatte).", "bk": "PPT dia 20"},
    {"k": "mc", "q": "Welke schrijfwijze is goed?", "opts": ["de gestreken was", "de gestrekene was", "de gestrekende was"], "a": 0, "x": "vd op -en → het bn eindigt ook op -en.", "bk": "PPT dia 20"},
    {"k": "mc", "q": "Hoe maak je de gebiedende wijs?", "opts": ["met de ik-vorm, zonder onderwerp", "met de ik-vorm + t", "met het hele werkwoord"], "a": 0, "x": "*Bied eens een drankje aan!* · *Teken de driehoek ABC.*", "bk": "PPT dia 14"},
    {"k": "mc", "q": "Een onvoltooid deelwoord geeft aan dat een handeling …", "opts": ["nog aan de gang is", "afgerond is", "een bevel is"], "a": 0, "x": "*Hij liep fluitend naar huis.* Herken het aan -nd(e).", "bk": "PPT dia 17"},
]
topics.append({"id": "rest", "nav": "bn, ovd, inf, gw", "title": "Bijvoeglijk gebruikt, onvoltooid deelwoord, infinitief, gebiedende wijs", "pages": "PPT dia 14, 17-21", "n": 12,
    "bron": [SLIDE(14, "Gebiedende wijs"), SLIDE(17, "Onvoltooid deelwoord"), SLIDE(18, "Infinitief"), SLIDE(19, "Bijvoeglijk naamwoord"), SLIDE(20, "Bn van een vd"), SLIDE(21, "Bn van een vd of ovd")],
    "doelen": ["Je spelt bijvoeglijk gebruikte (on)voltooide deelwoorden, onvoltooide deelwoorden, infinitieven en de gebiedende wijs goed."],
    "kern": ["**Bijvoeglijk naamwoord van een vd:** kijk naar het voltooid deelwoord. Vd op **-d/-t**: het bn eindigt op **-e** en je schrijft het zo kort mogelijk, tenzij uitspraakverwarring: de vergrote foto, de verbrande lucifer, de bekladde muur, de gehate vijand, het betoverde huis (maar: een betoverd huis).",
             "Vd op **-en**: het bn eindigt ook op **-en**: de gestreken was, aangeschoten feestbeesten, gescheiden man.",
             "**Onvoltooid deelwoord** = hele werkwoord + **d(e)**, eindigt op **-nd(e)**: *Hij liep fluitend naar huis.* Ook als bn, zo kort mogelijk: fascinerend vuurwerk, stinkende vis, een verwoestende orkaan.",
             "**Infinitief** = het hele werkwoord. Na **te** en **aan het** altijd de infinitief. Niet verwarren met de pv tt meervoud: *Zij zullen naar school **lopen**.* (zullen = pv, lopen = inf)",
             "**Gebiedende wijs:** zin met een bevel, **geen onderwerp**, **ik-vorm**: *Bekijk het maar! · Bied eens een drankje aan!*"],
    "let": ["*de **vergrote** foto* (één t), *het **bestede** bedrag*: zo kort mogelijk.", "Van een ovd: **-nde**: de verwoeste**nde** brand.", "Gebiedende wijs zonder t: **Houd** (of **Hou**) je mond! · **Bied** eens iets aan!"],
    "qs": rest})

# 6 onregelmatige werkwoorden: hele tabel per werkwoord + losse vormen
TABLES = {}
for ci, verb in enumerate(old["irr"]["cols"]):
    rows = []
    for r in old["irr"]["rows"]:
        f = r[1 + ci]
        if f: rows.append([r[0], " / ".join(f), ""])
    TABLES[verb] = {"title": verb, "rows": rows}
onr = [{"k": "conj", "tab": v, "q": f"Vervoeg **{v}**: vul de hele tabel in.", "bk": "PPT dia 24"} for v in TABLES]
for v, T in TABLES.items():
    for i, r in enumerate(T["rows"]):
        onr.append({"k": "type", "strict": True, "q": f"**{v}** · {r[0]}", "a": r[1].split(" / "), "show": r[1], "tab": v, "row": i, "bk": "PPT dia 24"})
onr += [q_type(s, v, a, f, None, bk, n) for s, v, a, f, n, bk in TOETS if v.split(",")[0] in ("willen", "zijn")]
onr += [
    {"k": "mc", "q": "Welke werkwoorden zijn onregelmatig?", "opts": ["hebben, kunnen, mogen, willen, zijn, zullen", "lopen, zwemmen, kijken, roepen", "worden, vinden, houden, snijden"], "a": 0, "bk": "PPT dia 22"},
    {"k": "mc", "q": "Wat is netter in de verleden tijd?", "opts": ["wilde / wilden", "wou / wouden"], "a": 0, "x": "Gebruik liever wilde(n) dan wou(den). Wou(den) gebruik je vaker in spreektaal.", "bk": "PPT dia 25"},
    {"k": "mc", "q": "Kies: ___ jij morgen ook komen?", "opts": ["Kun", "Kunt"], "a": 0, "x": "Jij áchter de pv → geen t: Kun jij …? (Jij kunt …)", "bk": "PPT dia 24-25"},
]
topics.append({"id": "onr", "nav": "Onregelmatig", "title": "Onregelmatige werkwoorden", "pages": "PPT dia 22-26", "n": 10, "bron": [SLIDE(22, "Onregelmatige ww"), SLIDE(24, "De vervoeging"), SLIDE(25, "Let op")],
    "fig": [["slides/s-24.jpg", "Vervoeging van de onregelmatige werkwoorden"]],
    "doelen": ["Je kent de vervoeging van hebben, kunnen, mogen, willen, zijn en zullen uit je hoofd."],
    "kern": ["Onregelmatige werkwoorden: **hebben, kunnen, mogen, willen, zijn, zullen**. De persoonsvorm en het voltooid deelwoord schrijf je niet volgens de normale regels: leer de vervoeging uit je hoofd!",
             "**hebben:** ik heb · heb jij · jij/u hebt (u heeft) · hij heeft · wij hebben · had · hadden · gehad",
             "**kunnen:** ik kan · kan/kun jij · jij kunt/kan · hij kan · wij kunnen · kon · konden · gekund",
             "**mogen:** ik mag · mag jij · jij mag · hij mag · wij mogen · mocht · mochten · gemogen",
             "**willen:** ik wil · wil jij · jij wilt/wil · hij wil · wij willen · wilde/wou · wilden/wouden · gewild",
             "**zijn:** ik ben · ben jij · jij bent · hij is · wij zijn · was · waren · geweest",
             "**zullen:** ik zal · zal jij · jij zult/zal · hij zal · wij zullen · zou · zouden"],
    "let": ["Jij **áchter** de pv: geen t: *Ben jij …? Kun jij …?*", "Gebruik liever **wilde(n)** dan wou(den).", "**hij wil** (zonder t), maar **jij wilt** of jij wil."],
    "qs": onr})

# 7 Engelse werkwoorden
eng = []
for r in old["eng"]["rows"]:
    inf = r[0]
    for lab, forms in zip(["hij/zij/het tt", "hij/zij/het vt", "voltooid deelwoord"], r[1:]):
        eng.append({"k": "type", "strict": True, "q": f"**{inf}** · {lab}", "a": forms, "bk": "PPT dia 29-33",
                    "xw": "Engelse werkwoorden vervoeg je als **zwakke** Nederlandse werkwoorden. De **-e** of dubbele medeklinker blijft alleen als dat nodig is voor de uitspraak (ik like, ik app)."})
eng += ges_qs({"pvtt", "pvvt", "vd", "bn", "gw"}, sheets=ENG_SHEET)
eng += [q_type(s, v, a, f, x, "PPT dia 31, 37") for s, v, a, f, x in PPT if v in ("downloaden", "updaten", "racen, vt", "daten", "upgraden")]
eng += [q_type(s, v, a, f, None, bk, n) for s, v, a, f, n, bk in TOETS if v.split(",")[0] in ("faken", "timen", "partyen", "swipen", "upgraden", "gamen")]
eng += [
    {"k": "mc", "q": "Hoe vervoeg je Engelse werkwoorden in het Nederlands?", "opts": ["volgens de regels van de zwakke Nederlandse werkwoorden", "volgens de Engelse regels", "als sterke werkwoorden"], "a": 0, "bk": "PPT dia 27"},
    {"k": "mc", "q": "Welke vorm is goed? (liken)", "opts": ["ik like", "ik lik", "ik liek"], "a": 0, "x": "De -e blijft als dat nodig is voor de uitspraak.", "bk": "PPT dia 27"},
    {"k": "mc", "q": "Bij welk werkwoord blijft de dubbele medeklinker staan?", "opts": ["ik app", "ik voetball", "ik jogg"], "a": 0, "x": "Dubbele medeklinker blijft bij appen, baseballen, paintballen en passen. Maar: ik voetbal, ik basketbal, ik jog, ik hug.", "bk": "PPT dia 28"},
    {"k": "mc", "q": "Waarom is het **gegamed** (met d) maar **geracet** (met t)?", "opts": ["De stam van gamen eindigt op een m-klank (niet in ’t ex-kofschip), die van racen op een s-klank (wel).", "Gamen is sterk en racen zwak.", "Bij Engelse werkwoorden kies je zelf."], "a": 0, "x": "Je kijkt naar de **klank** van de laatste letter: race klinkt als rees → s.", "bk": "PPT dia 33"},
]
topics.append({"id": "eng", "nav": "Engelse ww", "title": "Engelse werkwoorden", "pages": "PPT dia 27-34", "n": 12, "bron": [SLIDE(27, "Engelse werkwoorden"), SLIDE(28, "Dubbele medeklinker"), SLIDE(29, "Tegenwoordige tijd"), SLIDE(30, "Verleden tijd"), SLIDE(33, "Vervoegingen")],
    "fig": [["slides/s-33.jpg", "Engelse werkwoorden vervoegd"]],
    "doelen": ["Je spelt Engelse werkwoorden volgens de Nederlandse regels van de zwakke werkwoorden."],
    "kern": ["We vervoegen de Engelse werkwoorden volgens de Nederlandse spellingsregels van **zwakke** (regelmatige) werkwoorden.",
             "Engelse werkwoorden die eindigen op een **-e** of **dubbele medeklinker**, behouden die (alleen) als dat nodig is voor de uitspraak: liken → ik like (niet: ik lik). Dit kan vreemde vormen opleveren: hij liket.",
             "Dubbele medeklinker blijft door de uitspraak: ik app, ik baseball, ik paintball, ik pass. Maar: ik softbal, ik voetbal, ik basketbal, ik jog, ik hug.",
             "chillen: chilt · childe · gechild — downloaden: downloadt · downloadde · gedownload — gamen: gamet · gamede · gegamed — racen: racet · racete · geracet — updaten: updatet · updatete · geüpdatet — upgraden: upgradet · upgradede · geüpgraded — streamen: streamt · streamde · gestreamd — deleten: deletet · deletete · gedeletet",
             "Bij twijfel: www.woordenlijst.org"],
    "let": ["Kijk naar de **klank** van de stam: race (s-klank) → racete, geracet; game (m) → gamede, gegamed.", "**geüpdatet** en **geüpgraded** met een trema op de u.", "Na een t of d in de stam toch nog -te/-de: updat**ete**, downloa**dde**."],
    "qs": eng})

# 8 oefentoetsen van de docent
oef = [q_type(s, v, a, f, None, bk, n) for s, v, a, f, n, bk in TOETS]
topics.append({"id": "toets", "nav": "Oefentoetsen", "title": "Oefentoetsen van de docent", "pages": "oefentoets 1 en 2", "n": 15, "bron": [SLIDE(37, "Oefening"), SLIDE(38, "Antwoorden oefening")],
    "doelen": ["Je past alle regels door elkaar toe, zoals op de SO: eerst de werkwoordsvorm bepalen, dan goed spellen."],
    "kern": ["Stap 1: noteer per zin welke **werkwoordsvorm** er staat: persoonsvorm (tt of vt), voltooid deelwoord, onvoltooid deelwoord, bijvoeglijk gebruikt (on)voltooid deelwoord, gebiedende wijs of infinitief.",
             "Stap 2: noteer het werkwoord in de **juiste spelling**. Als de tijd niet duidelijk blijkt uit de zin, kies je de tegenwoordige tijd.",
             "**Normering van de docent:** 70% goed voor een voldoende (5,5)."],
    "let": ["Twee werkwoorden in één zin? Bepaal de vorm voor elk werkwoord apart (*De verwoestende brand heeft veel schade aangericht*).", "**men** is enkelvoud: men vergroot**te**.", "Lees de hele zin: *gisteren, vorige week, toen* → verleden tijd."],
    "qs": oef})

data = {
    "meta": {"id": "nederlands-so-ww2", "type": "leer", "brand": "Nederlands", "sub": "SO werkwoordspelling", "title": "SO werkwoordspelling", "toets": "SO", "lidw": "de", "examDate": "2026-11-27", "acc": ["ë", "ü", "é", "ï"]},
    "instructie": "Theorie van werkwoordspelling kennen en toepassen: H27-28-29, het schema, de PPT, Gespeld en de oefentoetsen.",
    "instructieVerbatim": "Leerstof: Je moet de theorie van werkwoordspelling kennen en kunnen toepassen.\nZie H27-28-29, stencil met uitleg theorie en PPT, oefenboekjes Gespeld en de oefentoetsen (met antwoorden en normering)",
    "C": "Deze oefenzin is zelf gemaakt bij de regel uit de PPT.",
    "extra": "Fout gemaakt? Lees de uitleg en de regel, en schrijf het woord nog één keer goed op.",
    "tables": TABLES,
    "bronLabel": "PPT, schema en oefenboekjes",
    "bkLabel": "Bron",
    "bronnen": {"pages": [{"src": "bronnen/schema-1.jpg", "cap": "Schema blz. 1"}, {"src": "bronnen/schema-2.jpg", "cap": "Schema blz. 2"}, {"src": "bronnen/schema-3.jpg", "cap": "Schema blz. 3"}] + [SLIDE(i, f"PPT dia {i}") for i in range(1, 40)],
                "files": [{"title": "PowerPoint Werkwoordspelling (PDF)", "href": "bronnen/powerpoint.pdf"}, {"title": "Schema werkwoordsvormen en werkwoordspelling (PDF)", "href": "bronnen/schema.pdf"},
                          {"title": "Oefentoets 1 met antwoorden (PDF)", "href": "bronnen/oefentoets-1.pdf"}, {"title": "Oefentoets 2 met antwoorden (PDF)", "href": "bronnen/oefentoets-2.pdf"},
                          {"title": "Gespeld deel 1 (PDF)", "href": "bronnen/gespeld-1.pdf"}, {"title": "Gespeld deel 2 (PDF)", "href": "bronnen/gespeld-2.pdf"}]},
    "topics": topics,
}
for t in topics:
    t["bronTitle"] = "Dia's en schema" if t["id"] != "toets" else "Dia's: oefening"
    for q in t["qs"]:
        if q.get("bk") is None: q.pop("bk", None)
json.dump(data, open(f"{M}/data.json", "w"), ensure_ascii=False, indent=1)
print(len(topics), "onderwerpen", {t["id"]: len(t["qs"]) for t in topics})
