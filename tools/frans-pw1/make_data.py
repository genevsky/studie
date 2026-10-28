"""Maakt frans/proefwerk-1/data.json (leer.js) uit de woordenlijst van Chapitre 1 (Grandes Lignes, blz. 52-55)
en de grammatica (blz. 32-35, 48-51, 166-167, 171). Gebruik: python make_data.py <repo-map>"""
import json, re, sys
ROOT = sys.argv[1]

# [Frans, Nederlands] precies zoals op blz. 52-54
A = [["les vacances", "de vakantie"], ["le camping", "de camping"], ["il est", "hij is"], ["je cherche", "ik zoek"], ["voilà", "alsjeblieft (iets geven)"],
     ["je parle", "ik spreek, ik praat"], ["un peu", "een beetje"], ["français", "Frans"], ["je suis", "ik ben"], ["hollandais(e)", "Nederlands(e)"],
     ["et", "en"], ["oui", "ja"], ["non", "nee"], ["ici", "hier"], ["alors", "dus"],
     ["pardon", "sorry"], ["merci", "dankjewel"], ["de rien", "geen dank"], ["bonjour", "hallo"], ["au revoir", "tot ziens"]]
A_Z = [["Comment tu t'appelles?", "Hoe heet jij?"], ["Je m'appelle Max.", "Ik heet Max."], ["Tu habites où?", "Waar woon jij?"], ["J'habite à Breda, aux Pays-Bas.", "Ik woon in Breda, in Nederland."]]
B = [["l'hôtel", "het hotel"], ["la piscine", "het zwembad"], ["la fille", "het meisje"], ["le garçon", "de jongen"], ["génial(e)", "geweldig"],
     ["s'il vous plaît", "alstublieft (iets vragen)"], ["avec", "met"], ["aussi", "ook"], ["toujours", "altijd"], ["dans", "in"],
     ["la famille", "de familie"], ["les parents", "de ouders"], ["il y a", "er is, er zijn"], ["la sœur", "de zus"], ["le frère", "de broer"],
     ["j'aime", "ik vind leuk / houd van"], ["je préfère", "ik heb liever"], ["c'est", "dat is, het is"], ["petit(e)", "klein"], ["grand(e)", "groot"]]
B_Z = [["Bonjour, ça va?", "Hallo / Hoi, hoe gaat het?"], ["Ça va bien, et toi?", "Het gaat goed, en met jou?"], ["C'est quoi, Breda?", "Wat is dat, Breda?"], ["C'est une ville.", "Dat is een stad."]]
E = [["la plage", "het strand"], ["la mer", "de zee"], ["le problème", "het probleem"], ["le message", "de boodschap"], ["pourquoi", "waarom"],
     ["regarde", "kijk (naar)"], ["aider", "helpen"], ["on adore", "we zijn gek op"], ["très", "erg"], ["trop", "te, te veel"],
     ["aujourd'hui", "vandaag"], ["demain", "morgen"], ["peut-être", "misschien"], ["d'accord", "oké"], ["presque", "bijna"],
     ["beaucoup", "veel"], ["quelque chose", "iets"], ["beau", "mooi"], ["super", "super"], ["bizarre", "vreemd"]]
E_Z = [["Et toi, tu as quel âge?", "En jij, hoe oud ben jij?"], ["Moi, j'ai 12 ans.", "Ik ben 12 jaar."], ["Quel est ton numéro de téléphone?", "Wat is jouw telefoonnummer?"],
       ["Mon numéro, c'est le 06-12 20 09.", "Mijn telefoonnummer is 06-12 20 09."], ["Au revoir!", "Tot ziens!"], ["À plus!", "Tot later!"]]
F = [["la France", "Frankrijk"], ["la ville", "de stad"], ["la maison", "het huis"], ["le père", "de vader"], ["la mère", "de moeder"],
     ["les grands-parents", "de grootouders"], ["la photo", "de foto"], ["aller", "gaan"], ["visiter", "bezoeken"], ["dangereux", "gevaarlijk"],
     ["sportif", "sportief"], ["elle déteste", "ze heeft een hekel aan"], ["le sport", "de sport"], ["on fait", "we doen"], ["voir", "zien"],
     ["on mange", "we eten"], ["le fromage", "de kaas"], ["la crêpe", "de pannenkoek"], ["autre", "ander(e)"], ["moi", "ik (losstaand)"]]
F_Z = [["Tu as un frère?", "Heb jij een broer?"], ["Oui, j'ai un frère. Il s'appelle Romain.", "Ja, ik heb een broer. Hij heet Romain."], ["Il a quel âge?", "Hoe oud is hij?"], ["Il a 15 ans.", "Hij is 15 jaar."]]
NUM = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt"]
LABEL = {"les vacances": "les vacances (v mv)", "l'hôtel": "l'hôtel (m)", "les parents": "les parents (m mv)", "les grands-parents": "les grands-parents (m mv)"}

def fr_variants(fr):
    m = re.match(r"^(.*)\(e\)$", fr)
    return [m.group(1), m.group(1) + "e", fr] if m else [fr]

def nl_variants(nl):
    base = re.sub(r"\s*\((iets geven|iets vragen|losstaand)\)", "", nl)
    out = {nl, base}
    for part in re.split(r"\s*[,/]\s*", base):
        out.add(part)
    if "(naar)" in base: out |= {base.replace(" (naar)", ""), base.replace("(naar)", "naar")}
    if "(e)" in base: out |= {base.replace("(e)", ""), base.replace("(e)", "e")}
    if nl.startswith("ik vind leuk"): out |= {"ik houd van", "ik hou van"}
    if nl.startswith("Hallo / Hoi"): out |= {"Hallo, hoe gaat het?", "Hoi, hoe gaat het?"}
    return sorted(out)

def vocab_qs(words, zinnen, blz):
    qs = []
    for fr, nl in words + zinnen:
        z = [fr, nl] in zinnen
        qs.append({"k": "type", "q": ("Vertaal naar het Nederlands: " if z else "Wat betekent: ") + LABEL.get(fr, fr), "a": nl_variants(nl), "show": nl, "bk": blz, "dir": "fn"})
        qs.append({"k": "type", "strict": True, "q": ("Vertaal naar het Frans: " if z else "Hoe zeg je in het Frans: ") + nl, "a": fr_variants(fr), "show": fr, "bk": blz, "dir": "nf"})
    return qs

def vocab_topic(tid, nav, title, words, zinnen, blz, bron):
    return {"id": tid, "nav": nav, "title": title, "pages": blz, "bron": bron, "n": 15,
            "doelen": ["Je kent de woorden en zinnen van blok " + nav[-1] + " van Frans naar Nederlands én van Nederlands naar Frans.", "Je schrijft de Franse woorden goed, met accenten en met het lidwoord."],
            "kern": ["**" + LABEL.get(fr, fr) + "** – " + nl for fr, nl in words] + ["*Zin:* **" + fr + "** – " + nl for fr, nl in zinnen],
            "let": ["Leer per blokje van 5 woorden, en herhaal steeds het vorige blokje (stappenplan blz. 52).",
                    "Leer elk zelfstandig naamwoord **mét lidwoord**: aan het woord zie je niet of het mannelijk of vrouwelijk is.",
                    "Accenten horen bij de spelling: **voilà, génial, très, aujourd'hui, peut-être, problème, crêpe**."],
            "qs": vocab_qs(words, zinnen, blz)}

topics = [
    vocab_topic("a", "Blok A", "Vocabulaire A", A, A_Z, "blz. 52", [52]),
    vocab_topic("b", "Blok B", "Vocabulaire B", B, B_Z, "blz. 52-53", [52, 53]),
    vocab_topic("e", "Blok E", "Vocabulaire E", E, E_Z, "blz. 53", [53]),
    vocab_topic("f", "Blok F", "Vocabulaire F", F, F_Z, "blz. 53", [53]),
]
topics[0]["let"][2] = "Accenten horen bij de spelling: **voilà, français, où, à**. *Je m'appelle* en *j'habite*: de **j'** vóór een klinker of h."
topics[1]["let"][2] = "Accenten horen bij de spelling: **l'hôtel, génial, la sœur, le frère, je préfère, garçon, ça va**."
topics[2]["let"][2] = "Accenten horen bij de spelling: **le problème, très, aujourd'hui, peut-être, âge, numéro, téléphone, à plus**."
topics[3]["let"][2] = "Accenten horen bij de spelling: **le père, la mère, elle déteste, la crêpe**."

numq = []
for i, w in enumerate(NUM):
    numq.append({"k": "type", "strict": True, "q": f"Schrijf in het Frans: {i}", "a": [w], "show": w, "bk": "blz. 54"})
    numq.append({"k": "num", "q": f"Welk getal is: {w}", "a": i, "tol": 0, "bk": "blz. 54"})
topics.append({"id": "num", "nav": "0-20", "title": "Les nombres de 0 à 20", "pages": "blz. 54", "bron": [54], "n": 15,
               "doelen": ["Je kunt de getallen 0 tot en met 20 in het Frans lezen en schrijven."],
               "kern": [f"**{i}** – {w}" for i, w in enumerate(NUM)],
               "let": ["**dix-sept, dix-huit, dix-neuf** schrijf je met een streepje.", "**quatre** en **quatorze**, **cinq** en **quinze**, **six** en **seize**: let goed op het verschil.", "**vingt** (20) heeft een stomme **g** en **t**: niet vergeten bij het schrijven."],
               "qs": numq})

lid = {"id": "lid", "nav": "Lidwoorden", "title": "De lidwoorden", "pages": "blz. 32-35, 55, 166-167", "bron": [32, 33, 34, 55, 166, 167],
       "doelen": ["Je kunt de lidwoorden gebruiken (le, la, l', les, un, une)."],
       "kern": ["*De / Het* vertaal je met: **le, la, l'** of **les**. In het Frans zijn zelfstandige naamwoorden mannelijk of vrouwelijk.",
                "Mannelijk enkelvoud: **le / l'** · vrouwelijk enkelvoud: **la / l'** · meervoud (m én v): **les**.",
                "**le** camping – **de** camping · **les** campings – **de** campings · **la** fille – **het** meisje · **les** filles – **de** meisjes",
                "Voor een klinker (a, e, i, o, u) of een h die je niet hoort (stomme h) veranderen **le** en **la** in **l'**: **l'**ami – de vriend · **l'**hôtel – het hotel",
                "Zelfstandige naamwoorden krijgen in het meervoud een **s**. Deze s spreek je niet uit: **la** tente – **les** tentes.",
                "Het lidwoord *een* vertaal je met **un** of **une**. Je gebruikt **un** bij mannelijke woorden en **une** bij vrouwelijke. In de woordenlijst kun je dus **le** vervangen door **un** en **la** door **une**.",
                "J'ai **un** frère et **une** sœur. – Ik heb **een** broer en **een** zus.",
                "Na **aimer** (houden van), **préférer** (liever hebben), **adorer** (dol zijn op) en **détester** (een hekel hebben aan) zet je altijd **le / la / l'** of **les**: Tu aimes **le** coca? – Houd je van cola?"],
       "let": ["Bij een **l'**-woord zie je niet of het m of v is. Leer het erbij: **l'hôtel (m)** → **un** hôtel, **l'adresse (v)** → **une** adresse.",
               "Meervoud: **les** + woord met **-s** (de s hoor je niet).",
               "Na **aimer / préférer / adorer / détester** altijd een lidwoord, ook als het Nederlands er geen heeft."],
       "qs": [
           {"k": "mc", "q": "Kies: ___ garçon", "opts": ["le", "la"], "a": 0, "bk": "blz. 32, opdr. 16a"},
           {"k": "mc", "q": "Kies: ___ frère", "opts": ["le", "la"], "a": 0, "bk": "blz. 32, opdr. 16a"},
           {"k": "mc", "q": "Kies: ___ fille", "opts": ["le", "la"], "a": 1, "bk": "blz. 32, opdr. 16a"},
           {"k": "mc", "q": "Kies: ___ sœur", "opts": ["le", "la"], "a": 1, "bk": "blz. 32, opdr. 16a"},
           {"k": "mc", "q": "Raphaël est dans ___ hôtel, au parc d'attractions.", "opts": ["le", "la", "l'", "les"], "a": 2, "bk": "blz. 33, opdr. 16d"},
           {"k": "mc", "q": "___ attractions dans le parc sont géniales.", "opts": ["Le", "La", "L'", "Les"], "a": 3, "bk": "blz. 33, opdr. 16d"},
           {"k": "mc", "q": "Raphaël n'aime pas ___ camping.", "opts": ["le", "la", "l'", "les"], "a": 0, "bk": "blz. 33, opdr. 16d"},
           {"k": "mc", "q": "___ hamburgers dans le parc sont super.", "opts": ["Le", "La", "L'", "Les"], "a": 3, "bk": "blz. 33, opdr. 16d"},
           {"k": "mc", "q": "___ sœur de Raphaël adore le shopping.", "opts": ["Le", "La", "L'", "Les"], "a": 1, "bk": "blz. 33, opdr. 16d"},
           {"k": "mc", "q": "Elle aime aussi ___ piscine.", "opts": ["le", "la", "l'", "les"], "a": 1, "bk": "blz. 33, opdr. 16d"},
           {"k": "type", "strict": True, "q": "Zet in het meervoud: le frère", "a": ["les frères"], "bk": "blz. 33, opdr. 16e"},
           {"k": "type", "strict": True, "q": "Zet in het meervoud: la famille", "a": ["les familles"], "bk": "blz. 33, opdr. 16e"},
           {"k": "type", "strict": True, "q": "Zet in het meervoud: l'hôtel", "a": ["les hôtels"], "bk": "blz. 33, opdr. 16e"},
           {"k": "type", "strict": True, "q": "Zet in het meervoud: la piscine", "a": ["les piscines"], "bk": "blz. 33, opdr. 16e"},
           {"k": "type", "strict": True, "q": "Zet in het meervoud: la pizza", "a": ["les pizzas"], "bk": "blz. 33, opdr. 16e"},
           {"k": "type", "strict": True, "q": "Zet in het meervoud: le camping", "a": ["les campings"], "bk": "blz. 33, opdr. 16e"},
           {"k": "mc", "q": "Kies un of une: ___ attraction", "opts": ["un", "une"], "a": 1, "bk": "blz. 33, opdr. 17c"},
           {"k": "mc", "q": "Kies un of une: ___ restaurant", "opts": ["un", "une"], "a": 0, "bk": "blz. 33, opdr. 17c"},
           {"k": "mc", "q": "Kies un of une: ___ piscine", "opts": ["un", "une"], "a": 1, "bk": "blz. 33, opdr. 17c"},
           {"k": "mc", "q": "Kies un of une: ___ village", "opts": ["un", "une"], "a": 0, "bk": "blz. 33, opdr. 17c"},
           {"k": "mc", "q": "Kies un of une: ___ hôtel", "opts": ["un", "une"], "a": 0, "bk": "blz. 33, opdr. 17c"},
           {"k": "mc", "q": "Kies un of une: ___ ville", "opts": ["un", "une"], "a": 1, "bk": "blz. 33, opdr. 17c"},
           {"k": "fill", "q": "Vervang le, la en l' door un of une.", "opts": ["un", "une"], "items": [["Le frère de Hugo s'appelle Raphaël. Il a … frère super sympa.", "un"], ["Raphaël est dans l'hôtel Molière. C'est … hôtel dans le centre de Paris.", "un"], ["Il aime la piscine de l'hôtel. C'est … piscine énorme.", "une"], ["Raphaël visite le musée du Louvre. C'est … musée formidable.", "un"], ["Il cherche l'adresse (v) du restaurant Chartier. C'est … adresse difficile à trouver.", "une"], ["Raphaël rencontre le patron du restaurant. C'est … patron sympathique.", "un"]], "bk": "blz. 34, opdr. 17d"},
           {"k": "type", "strict": True, "q": "Vertaal: de familie", "a": ["la famille"], "bk": "blz. 34, opdr. 17e"},
           {"k": "type", "strict": True, "q": "Vertaal: de vakantie", "a": ["les vacances"], "bk": "blz. 34, opdr. 17e"},
           {"k": "type", "strict": True, "q": "Vertaal: een hotel", "a": ["un hôtel"], "bk": "blz. 34, opdr. 17e"},
           {"k": "type", "strict": True, "q": "Vertaal: het zwembad", "a": ["la piscine"], "bk": "blz. 34, opdr. 17e"},
           {"k": "type", "strict": True, "q": "Vertaal: de jongens", "a": ["les garçons"], "bk": "blz. 34, opdr. 17e"},
           {"k": "type", "strict": True, "q": "Vertaal: een meisje", "a": ["une fille"], "bk": "blz. 34, opdr. 17e"},
           {"k": "sort", "q": "Mannelijk of vrouwelijk? (kijk naar het lidwoord in de woordenlijst)", "cats": ["mannelijk (le / un)", "vrouwelijk (la / une)"], "items": [["camping", "mannelijk (le / un)"], ["hôtel", "mannelijk (le / un)"], ["garçon", "mannelijk (le / un)"], ["problème", "mannelijk (le / un)"], ["message", "mannelijk (le / un)"], ["père", "mannelijk (le / un)"], ["fromage", "mannelijk (le / un)"], ["piscine", "vrouwelijk (la / une)"], ["plage", "vrouwelijk (la / une)"], ["mer", "vrouwelijk (la / une)"], ["maison", "vrouwelijk (la / une)"], ["photo", "vrouwelijk (la / une)"], ["crêpe", "vrouwelijk (la / une)"]], "bk": "blz. 52-53"},
           {"k": "mc", "q": "Wanneer worden le en la ingekort tot l'?", "opts": ["Voor een klinker (a, e, i, o, u) of een stomme h.", "Altijd in het meervoud.", "Voor een medeklinker."], "a": 0, "bk": "blz. 32"},
           {"k": "tf", "q": "De meervouds-s van les filles spreek je uit.", "a": False, "x": "Deze s spreek je niet uit.", "bk": "blz. 32"},
           {"k": "mc", "q": "Houd je van cola? = Tu aimes ___ coca?", "opts": ["le", "un", "(niets)"], "a": 0, "x": "Na aimer, préférer, adorer en détester zet je altijd le / la / l' of les.", "bk": "blz. 167"},
           {"k": "mc", "q": "Nee, ik heb liever mineraalwater. = Non, je préfère ___ eau minérale.", "opts": ["l'", "une", "(niets)"], "a": 0, "bk": "blz. 167"},
           {"k": "mc", "q": "Wanneer gebruik je les?", "opts": ["bij meervoud, voor mannelijke én vrouwelijke woorden", "alleen bij vrouwelijke woorden", "bij enkelvoud voor een klinker"], "a": 0, "bk": "blz. 32"}
       ]}
topics.append(lid)

# lidwoord per woord: alle zelfstandige naamwoorden uit de woordenlijst (blz. 52-53) en de grammatica (blz. 32-34)
# (woord, m/v, nl, meervoud?)
NOUNS = [("camping", "m", "de camping"), ("hôtel", "m", "het hotel"), ("piscine", "v", "het zwembad"), ("fille", "v", "het meisje"),
         ("garçon", "m", "de jongen"), ("famille", "v", "de familie"), ("sœur", "v", "de zus"), ("frère", "m", "de broer"),
         ("plage", "v", "het strand"), ("mer", "v", "de zee"), ("problème", "m", "het probleem"), ("message", "m", "de boodschap"),
         ("ville", "v", "de stad"), ("maison", "v", "het huis"), ("père", "m", "de vader"), ("mère", "v", "de moeder"),
         ("photo", "v", "de foto"), ("sport", "m", "de sport"), ("fromage", "m", "de kaas"), ("crêpe", "v", "de pannenkoek"),
         ("ami", "m", "de vriend"), ("tente", "v", "de tent"), ("attraction", "v", "de attractie"), ("restaurant", "m", "het restaurant"),
         ("village", "m", "het dorp"), ("adresse", "v", "het adres"), ("musée", "m", "het museum")]
PLUR = [("vacances", "v", "de vakantie"), ("parents", "m", "de ouders"), ("grands-parents", "m", "de grootouders")]
def starts_vowel(w): return w[0] in "aeiouéèêh"
lw_q = []
for w, g, nl in NOUNS:
    v = starts_vowel(w); art = "l'" if v else ("le" if g == "m" else "la")
    full_ = f"{art}{w}" if v else f"{art} {w}"
    why = (f"**{w}** begint met een {'stomme h' if w[0] == 'h' else 'klinker'} → **l'**. (Het is {'mannelijk: **un**' if g == 'm' else 'vrouwelijk: **une**'} {w}.)" if v
           else f"**{w}** is {'mannelijk → **le**' if g == 'm' else 'vrouwelijk → **la**'}. Leer het woord altijd mét lidwoord.")
    lw_q.append({"k": "mc", "keep": True, "q": f"Kies het lidwoord: ___ {w} ({nl})", "opts": ["le", "la", "l'", "les"], "a": ["le", "la", "l'", "les"].index(art), "x": f"**{full_}** = {nl}", "xw": why, "bk": "blz. 32, 52-53"})
    lw_q.append({"k": "mc", "keep": True, "q": f"Kies: ___ {w} (een {nl.split(' ', 1)[1]})", "opts": ["un", "une"], "a": 0 if g == "m" else 1, "x": f"**{'un' if g == 'm' else 'une'} {w}**", "xw": f"**{w}** is {'mannelijk → **un**' if g == 'm' else 'vrouwelijk → **une**'}" + (" (bij l'-woorden moet je het geslacht apart onthouden)." if v else "."), "bk": "blz. 33"})
for w, g, nl in PLUR:
    lw_q.append({"k": "mc", "keep": True, "q": f"Kies het lidwoord: ___ {w} ({nl})", "opts": ["le", "la", "l'", "les"], "a": 3, "x": f"**les {w}** = {nl}", "xw": f"**{w}** is meervoud → **les**.", "bk": "blz. 52-53"})
for w, g, nl in [("garçon", "m", "de jongen"), ("fille", "v", "het meisje"), ("maison", "v", "het huis"), ("problème", "m", "het probleem"), ("ami", "m", "de vriend"), ("adresse", "v", "het adres")]:
    lw_q.append({"k": "type", "strict": True, "q": f"Zet in het meervoud: {'l' + chr(39) + w if starts_vowel(w) else ('le ' if g == 'm' else 'la ') + w}", "a": [f"les {w}s"], "xw": "Meervoud: **les** + woord met **-s** (de s hoor je niet).", "bk": "blz. 32"})
lw_q.append({"k": "sort", "q": "Wordt le/la hier ingekort tot l'?", "cats": ["ja: l'", "nee: le of la"], "items": [["hôtel", "ja: l'"], ["ami", "ja: l'"], ["attraction", "ja: l'"], ["adresse", "ja: l'"], ["camping", "nee: le of la"], ["piscine", "nee: le of la"], ["fille", "nee: le of la"], ["frère", "nee: le of la"], ["maison", "nee: le of la"]], "x": "Voor een klinker (a, e, i, o, u) of een stomme h → l'.", "bk": "blz. 32"})
topics.append({"id": "lidw", "nav": "le, la, l'?", "title": "Lidwoord per woord", "pages": "blz. 32-33, 52-53", "bron": [32, 33, 52, 53], "n": 15,
               "doelen": ["Je weet van elk zelfstandig naamwoord uit de woordenlijst of het le, la, l' of les krijgt, en of het un of une is."],
               "kern": ["Stap 1: **meervoud?** → **les**.", "Stap 2: begint het woord met een **klinker** (a, e, i, o, u) of een **stomme h**? → **l'**.", "Stap 3: anders: **mannelijk → le** (een: **un**), **vrouwelijk → la** (een: **une**). Aan het woord zie je het niet: je moet het geslacht per woord kennen.",
                        "**Mannelijk (le / un):** " + ", ".join(("l'" + w + " (m)") if starts_vowel(w) else ("le " + w) for w, g, _ in NOUNS if g == "m"),
                        "**Vrouwelijk (la / une):** " + ", ".join(("l'" + w + " (v)") if starts_vowel(w) else ("la " + w) for w, g, _ in NOUNS if g == "v"),
                        "**Meervoud (les):** les vacances, les parents, les grands-parents"],
               "let": ["Bij **l'**-woorden zie je het geslacht niet: leer **l'hôtel (m) → un hôtel** en **l'adresse (v) → une adresse** erbij.", "Een Nederlands **het**-woord is in het Frans niet automatisch le: *het meisje* = **la** fille, *het zwembad* = **la** piscine.", "Leer elk woord hardop mét lidwoord: *la plage, le problème, la mer*."],
               "qs": lw_q})

AV = [["j'", "ai", "ik heb"], ["tu", "as", "jij hebt"], ["il / elle", "a", "hij / zij heeft"], ["on", "a", "wij hebben"], ["nous", "avons", "wij hebben"], ["vous", "avez", "jullie hebben / u heeft"], ["ils / elles", "ont", "zij hebben"]]
ET = [["je", "suis", "ik ben"], ["tu", "es", "jij bent"], ["il / elle", "est", "hij / zij is"], ["on", "est", "wij zijn"], ["nous", "sommes", "wij zijn"], ["vous", "êtes", "jullie zijn / u bent"], ["ils / elles", "sont", "zij zijn"]]
ae_q = []
def full(pr, v):
    # het werkwoord alleen, of met persoonlijk voornaamwoord (j'ai, je suis, il a, elle a ...)
    return [v] + [(f"{x}{v}" if x.endswith("'") else f"{x} {v}") for x in pr.split(" / ")]
for i, (pr, v, nl) in enumerate(AV):
    ae_q.append({"k": "type", "strict": True, "q": f"avoir: {pr} ___ ({nl})", "a": full(pr, v), "show": f"{pr} {v}".replace("' ", "'"), "tab": "avoir", "row": i, "bk": "blz. 49 en 55"})
for i, (pr, v, nl) in enumerate(ET):
    ae_q.append({"k": "type", "strict": True, "q": f"être: {pr} ___ ({nl})", "a": full(pr, v), "show": f"{pr} {v}", "tab": "etre", "row": i, "bk": "blz. 171"})
CONJ = [{"k": "conj", "tab": "avoir", "q": "Vervoeg avoir (hebben): vul de hele tabel in.", "bk": "blz. 49 en 55"},
        {"k": "conj", "tab": "etre", "q": "Vervoeg être (zijn): vul de hele tabel in.", "bk": "blz. 171"}]
ae_q[0:0] = CONJ
ae_q += [
    {"k": "type", "strict": True, "q": "Remplis le verbe avoir: Vous ___ quel âge?", "a": ["avez", "vous avez"], "bk": "blz. 50, opdr. 31e"},
    {"k": "type", "strict": True, "q": "Remplis le verbe avoir: Nous ___ 12 ans.", "a": ["avons", "nous avons"], "bk": "blz. 50, opdr. 31e"},
    {"k": "type", "strict": True, "q": "Remplis le verbe avoir: Luc ___ 11 ans.", "a": ["a", "Luc a"], "bk": "blz. 50, opdr. 31e"},
    {"k": "type", "strict": True, "q": "Remplis le verbe avoir: Valentine et Léon ___ 13 ans.", "a": ["ont", "Valentine et Léon ont"], "bk": "blz. 50, opdr. 31e"},
    {"k": "type", "strict": True, "q": "Remplis le verbe avoir: Et toi? Tu ___ quel âge?", "a": ["as", "tu as"], "bk": "blz. 50, opdr. 31e"},
    {"k": "type", "strict": True, "q": "Remplis le verbe avoir: Moi, j'___ aussi 13 ans.", "a": ["ai", "j'ai"], "bk": "blz. 50, opdr. 31e"},
    {"k": "type", "strict": True, "q": "Réponds en français: Vous avez une tente? (une caravane) Non, …", "a": ["Non, nous avons une caravane.", "nous avons une caravane"], "show": "Non, nous avons une caravane.", "bk": "blz. 50, opdr. 31f"},
    {"k": "type", "strict": True, "q": "Réponds en français: Simon a un frère? (twee zussen) Non, …", "a": ["Non, il a deux sœurs.", "il a deux sœurs", "il a deux soeurs", "Non, il a deux soeurs."], "show": "Non, il a deux sœurs.", "bk": "blz. 50, opdr. 31f"},
    {"k": "type", "strict": True, "q": "Réponds en français: Tu as un souvenir de la Tour Eiffel? (een foto) Non, …", "a": ["Non, j'ai une photo.", "j'ai une photo"], "show": "Non, j'ai une photo.", "bk": "blz. 50, opdr. 31f"},
    {"k": "type", "strict": True, "q": "Réponds en français: Ralph et Thomas, vous avez une sœur? (een broer) Non, …", "a": ["Non, nous avons un frère.", "nous avons un frère"], "show": "Non, nous avons un frère.", "bk": "blz. 50, opdr. 31f"},
    {"k": "type", "strict": True, "q": "Réponds en français: Clémence et Émilie ont 14 ans? (13 jaar) Non, …", "a": ["Non, elles ont 13 ans.", "elles ont 13 ans", "Non, elles ont treize ans.", "elles ont treize ans"], "show": "Non, elles ont 13 ans.", "bk": "blz. 50, opdr. 31f"},
    {"k": "type", "strict": True, "q": "Réponds en français: Moi, j'ai une grande famille. Et toi? (een kleine familie) Non, …", "a": ["Non, j'ai une petite famille.", "j'ai une petite famille"], "show": "Non, j'ai une petite famille.", "bk": "blz. 50, opdr. 31f"},
    {"k": "mc", "q": "Welk persoonlijk voornaamwoord? Hugo et Céline ont … → ___ ont", "opts": ["ils", "elles", "il"], "a": 0, "x": "Mannen of een gemengde groep: ils. Alleen vrouwen: elles.", "bk": "blz. 49"},
    {"k": "mc", "q": "Welk persoonlijk voornaamwoord? Sophie et Céline ont … → ___ ont", "opts": ["elles", "ils", "elle"], "a": 0, "bk": "blz. 49"},
    {"k": "mc", "q": "Welk persoonlijk voornaamwoord? Adam a … → ___ a", "opts": ["il", "elle", "ils"], "a": 0, "bk": "blz. 49"},
    {"k": "fill", "q": "Complète. Choisis entre je, elle, il, tu.", "opts": ["je", "tu", "il", "elle"], "items": [["Comment tu t'appelles? … m'appelle Julien.", "je"], ["… as un frère? Oui, j'ai un frère: Stéphane.", "tu"], ["… (Stéphane) a 13 ans.", "il"], ["Et ma sœur s'appelle Marine. … a 9 ans.", "elle"]], "bk": "blz. 48, opdr. 30b"},
    {"k": "mc", "q": "Wat betekent vous?", "opts": ["jullie én u", "alleen jullie", "wij"], "a": 0, "bk": "blz. 48"},
    {"k": "mc", "q": "Op welke twee manieren vertaal je wij?", "opts": ["nous en on", "nous en vous", "on en ils"], "a": 0, "x": "In spreektaal gebruik je meestal on. On kan ook men betekenen.", "bk": "blz. 48"},
    {"k": "mc", "q": "Ik ben 12 jaar. = …", "opts": ["J'ai 12 ans.", "Je suis 12 ans.", "J'ai 12 années."], "a": 0, "x": "In het Frans héb je een leeftijd: avoir … ans.", "bk": "blz. 53"},
    {"k": "type", "strict": True, "q": "Vertaal: Hij is 15 jaar.", "a": ["Il a 15 ans.", "Il a quinze ans."], "show": "Il a 15 ans.", "bk": "blz. 53"},
    {"k": "mc", "q": "Mijn broer is groot. = Mon frère ___ grand.", "opts": ["est", "a", "es"], "a": 0, "bk": "blz. 167"},
    {"k": "mc", "q": "Ik ben ziek. = Je ___ malade.", "opts": ["suis", "ai", "es"], "a": 0, "bk": "blz. 166"},
    {"k": "mc", "q": "Arthur en Martin zijn klein. = Arthur et Martin ___ petits.", "opts": ["sont", "ont", "est"], "a": 0, "x": "ils sont (zijn) ↔ ils ont (hebben): alleen een s verschil!", "bk": "blz. 167"},
    {"k": "mc", "q": "Wij hebben een hond. = Nous ___ un chien.", "opts": ["avons", "sommes", "avez"], "a": 0, "bk": "blz. 49"},
    {"k": "mc", "q": "Heb jij een broer? = Tu ___ un frère?", "opts": ["as", "es", "a"], "a": 0, "bk": "blz. 49"},
    {"k": "mc", "q": "Dat is een stad. = C'___ une ville.", "opts": ["est", "a", "es"], "a": 0, "bk": "blz. 53"},
]
AGE = "In het Frans **héb** je een leeftijd: *avoir … ans*. Ik ben 12 jaar = **j'ai** 12 ans."
ONT = "**ils/elles sont** = zij **zijn** (de **s** van **z**ijn) · **ils/elles ont** = zij **hebben**."
TUA = "**tu es** = jij bent · **tu as** = jij hebt."
ILA = "**il/elle est** = hij/zij is · **il/elle a** = hij/zij heeft."
J = "Voor een klinker wordt *je* → **j'**: **j'ai**, maar **je suis**."
def mz(nl, fr, tab, row, xw, alt=()):
    return {"k": "type", "strict": True, "q": "Vertaal: " + nl, "a": [fr, *alt], "show": fr, "tab": tab, "row": row, "xw": xw, "bk": "avoir blz. 49 · être blz. 171"}
MIX = [
    mz("Ik ben 12 jaar.", "J'ai 12 ans.", "avoir", 0, AGE, ["J'ai douze ans."]),
    mz("Ik heb een broer.", "J'ai un frère.", "avoir", 0, J),
    mz("Ik ben Nederlands.", "Je suis hollandais.", "etre", 0, J, ["Je suis hollandaise."]),
    mz("Hij is 15 jaar.", "Il a 15 ans.", "avoir", 2, AGE, ["Il a quinze ans."]),
    mz("Hij is groot.", "Il est grand.", "etre", 2, ILA),
    mz("Zij (één meisje) is klein.", "Elle est petite.", "etre", 2, ILA),
    mz("Zij (één meisje) heeft een zus.", "Elle a une sœur.", "avoir", 2, ILA, ["Elle a une soeur."]),
    mz("Jij hebt een foto.", "Tu as une photo.", "avoir", 1, TUA),
    mz("Jij bent in het zwembad.", "Tu es dans la piscine.", "etre", 1, TUA),
    mz("Wij hebben een probleem.", "Nous avons un problème.", "avoir", 4, "nous **avons** (hebben) · nous **sommes** (zijn).", ["On a un problème."]),
    mz("Wij zijn in het hotel.", "Nous sommes dans l'hôtel.", "etre", 4, "nous **sommes** (zijn) · nous **avons** (hebben).", ["On est dans l'hôtel."]),
    mz("Jullie hebben een zus.", "Vous avez une sœur.", "avoir", 5, "vous **avez** (hebben) · vous **êtes** (zijn).", ["Vous avez une soeur."]),
    mz("Jullie zijn in het huis.", "Vous êtes dans la maison.", "etre", 5, "vous **êtes** (zijn) · vous **avez** (hebben)."),
    mz("Zij (Hugo en Adam) zijn klein.", "Ils sont petits.", "etre", 6, ONT),
    mz("Zij (Sophie en Céline) hebben een probleem.", "Elles ont un problème.", "avoir", 6, ONT),
    mz("Zij (Hugo en Céline) zijn 13 jaar.", "Ils ont 13 ans.", "avoir", 6, AGE + " " + ONT, ["Ils ont treize ans."]),
    mz("Hoe oud ben jij?", "Tu as quel âge?", "avoir", 1, AGE),
    mz("Dat is een stad.", "C'est une ville.", "etre", 2, "*c'est* = ce + **est** (être)."),
]
topics.append({"id": "tabel", "nav": "Hele tabel", "title": "avoir en être: de hele vervoeging", "pages": "blz. 49, 55, 171", "bron": [49, 55, 171], "n": 2,
               "doelen": ["Je kunt avoir en être helemaal vervoegen, van je/j' tot ils/elles, zonder te spieken."],
               "kern": ["**avoir** (hebben): j'**ai** · tu **as** · il/elle **a** · on **a** · nous **avons** · vous **avez** · ils/elles **ont**",
                        "**être** (zijn): je **suis** · tu **es** · il/elle **est** · on **est** · nous **sommes** · vous **êtes** · ils/elles **sont**",
                        "Zo oefen je: vul de tabel in, kijk welke rijen rood zijn en schrijf die rijen drie keer over. Doe dit elke dag één keer, tot beide tabellen in één keer goed zijn."],
               "let": ["Tabellen die niet in één keer goed zijn, komen aan het eind nog een keer terug.", "Zeg de vormen hardop terwijl je ze typt: *j'ai, tu as, il a …*"],
               "qs": [dict(c) for c in CONJ]})
topics.append({"id": "avoiretre", "nav": "avoir of être?", "title": "Door elkaar oefenen", "pages": "blz. 49, 55, 171", "bron": [49, 55, 171], "n": 12,
               "doelen": ["Je kiest zelf of je avoir of être nodig hebt, en je schrijft de goede vorm."],
               "kern": ["**avoir** (hebben): j'**ai** · tu **as** · il/elle **a** · on **a** · nous **avons** · vous **avez** · ils/elles **ont**",
                        "**être** (zijn): je **suis** · tu **es** · il/elle **est** · on **est** · nous **sommes** · vous **êtes** · ils/elles **sont**",
                        AGE, ONT, TUA + " " + ILA, J],
               "let": ["Vraag je bij elke zin eerst af: **hebben** of **zijn**? Pas daarna: welke vorm?", "Leeftijd is altijd **avoir**, ook al zeg je in het Nederlands *ben*.", "Kies bij *zij* eerst het voornaamwoord: één meisje = **elle**, meer mensen = **ils** (of **elles** als het alleen meisjes/vrouwen zijn)."],
               "qs": CONJ + MIX})
topics.append({"id": "ae", "nav": "avoir/être", "title": "avoir en être (+ persoonlijk voornaamwoord)", "pages": "blz. 48-51, 55, 166, 171", "bron": [48, 49, 50, 55, 166, 171], "n": 15,
               "doelen": ["Je kunt de persoonlijke voornaamwoorden gebruiken.", "Je kunt avoir gebruiken.", "Je kunt être vervoegen."],
               "kern": ["**je / j'** – ik · **tu** – jij · **il** – hij · **elle** – zij · **on** – wij · **nous** – wij · **vous** – jullie, u · **ils** – zij (mannelijk, meervoud) · **elles** – zij (vrouwelijk, meervoud)",
                        "*Je* verandert in **j'** voor een klinker of een stomme h: **j'ai** – ik heb · **j'habite** – ik woon.",
                        "In het Frans heb je twee manieren om *wij* te vertalen: **nous** en **on**. In spreektaal gebruik je meestal **on**. Het woord **on** kan ook *men* betekenen. **Vous** betekent zowel *jullie* als *u*.",
                        "Je kunt een naam vervangen door **il** of **elle**. Meerdere namen vervang je door **ils** (mannen of gemengde groep) of **elles** (alleen vrouwen).",
                        "**avoir** (hebben), onregelmatig: j'**ai** · tu **as** · il/elle **a** · on **a** · nous **avons** · vous **avez** · ils/elles **ont**",
                        "**être** (zijn), onregelmatig: je **suis** · tu **es** · il/elle **est** · on **est** · nous **sommes** · vous **êtes** · ils/elles **sont**",
                        "Leeftijd zeg je met **avoir**: J'**ai** 12 ans. – Ik **ben** 12 jaar. Il **a** quel âge? – Hoe oud is hij?"],
               "let": ["**Ik ben 12 jaar = J'ai 12 ans** (avoir, niet être!).", "**ils ont** (hebben) en **ils sont** (zijn) verschillen maar één letter.", "**tu as / il a** zonder accent; **à** met accent betekent *in / naar* (J'habite **à** Breda)."],
               "qs": ae_q})

ORDER = ["a", "b", "e", "f", "num", "lid", "lidw", "ae", "tabel", "avoiretre"]
topics.sort(key=lambda t: ORDER.index(t["id"]))
data = {
    "meta": {"id": "frans-pw1", "type": "leer", "brand": "Frans", "sub": "Proefwerk 1 · Chapitre 1", "title": "Frans proefwerk 1", "toets": "proefwerk", "lidw": "het", "examDate": "2026-11-06"},
    "instructie": "Woordjes Chapitre 1 (Frans → Nederlands en Nederlands → Frans), avoir en être, de lidwoorden.",
    "instructieVerbatim": "Leren: woordjes NF FN Chapitre 1, avoir en être, de lidwoorden",
    "C": "Dit antwoord is niet uit het boek maar zelf geschreven. Check het met je boek of je docent.",
    "extra": "Tip uit het boek: oefen ook met Slim stampen in Grandes Lignes en ligne.",
    "topics": topics,
    "tables": {"avoir": {"title": "avoir (hebben)", "rows": AV}, "etre": {"title": "être (zijn)", "rows": ET}},
    "bronnen": {"pages": [32, 33, 34, 35, 48, 49, 50, 51, 52, 53, 54, 55, 166, 167, 171]},
}
json.dump(data, open(f"{ROOT}/frans/proefwerk-1/data.json", "w"), ensure_ascii=False, indent=1)
print(len(topics), "onderwerpen,", sum(len(t["qs"]) for t in topics), "vragen")
