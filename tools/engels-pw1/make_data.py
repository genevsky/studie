"""Maakt engels/proefwerk-1/data.json (leer.js) uit de Learning Corner van Stepping Stones 1 havo/vwo,
thema 1 (blz. 82-85) en thema 2 (blz. 130-133): woorden, Stones en grammatica. Gebruik: python make_data.py <repo-map>"""
import json, re, sys, itertools
ROOT = sys.argv[1]

# ---------- woorden, letterlijk van blz. 82-83 en 130-131 ----------
# theme words (alle ⇄)
T1_LOOKS = [["bald", "kaal"], ["beard", "baard"], ["braces", "beugel"], ["cheek", "wang"], ["chin", "kin"], ["curly", "krullend, krul-"], ["eyebrows", "wenkbrauwen"],
            ["freckles", "sproeten"], ["fringe", "pony"], ["glasses", "bril"], ["long (hair)", "lang (haar)"], ["short", "kort, klein"], ["ponytail", "paardenstaart"],
            ["scar", "litteken"], ["skin", "huid"], ["straight", "steil"]]
T1_FAM = [["a couple", "een stel"], ["cousin", "neef, nicht"], ["divorced", "gescheiden"], ["eldest", "oudste"], ["grandparents", "grootouders"],
          ["great-grandfather", "overgrootvader"], ["half-brother", "halfbroer"], ["married", "getrouwd"], ["middle child", "middelste kind"],
          ["nephew", "neef (kind van zus/broer)"], ["niece", "nicht (kind van zus/broer)"], ["only child", "enig kind"], ["sibling", "broer, zus"],
          ["stepfather", "stiefvader"], ["twin sister", "tweelingzus"], ["youngest", "jongste"]]
T1_PERS = [["annoying", "irritant"], ["calm", "kalm, rustig"], ["chatty", "spraakzaam"], ["cheerful", "vrolijk, opgewekt"], ["easy-going", "makkelijk in de omgang"],
           ["friendly", "vriendelijk"], ["funny", "grappig"], ["lazy", "lui"], ["mean", "gemeen"], ["nice", "aardig"], ["outgoing", "spontaan"], ["quiet", "stil, rustig"],
           ["serious", "serieus, ernstig"], ["shy", "verlegen"], ["smart", "slim"], ["sweet", "lief"]]
T1_NUM = [(30, "thirty"), (32, "thirty-two"), (40, "forty"), (43, "forty-three"), (50, "fifty"), (54, "fifty-four"), (60, "sixty"), (65, "sixty-five"), (70, "seventy"),
          (76, "seventy-six"), (80, "eighty"), (87, "eighty-seven"), (90, "ninety"), (98, "ninety-eight"), (100, "one hundred"), (101, "one hundred and one"),
          (1000, "one thousand"), (1011, "one thousand and eleven")]
T2_SCHOOL = [["assignment", "opdracht"], ["backpack", "rugtas"], ["desk", "bureau"], ["detention", "nablijven, straf"], ["diary", "agenda"], ["digital board", "digibord"],
             ["homework", "huiswerk"], ["locker", "kluisje"], ["notebook", "schrift"], ["school cafeteria", "school-kantine"], ["school hall", "aula"],
             ["timetable", "lesrooster"], ["to cheat", "spieken"], ["to fail", "onvoldoende halen"], ["to pass", "voldoende halen"], ["to study for", "leren voor"]]
T2_ORD = [(1, "first", "eerste"), (2, "second", "tweede"), (3, "third", "derde"), (4, "fourth", "vierde"), (5, "fifth", "vijfde"), (6, "sixth", "zesde"),
          (7, "seventh", "zevende"), (8, "eighth", "achtste"), (9, "ninth", "negende"), (10, "tenth", "tiende"), (11, "eleventh", "elfde"), (12, "twelfth", "twaalfde"),
          (13, "thirteenth", "dertiende"), (14, "fourteenth", "veertiende"), (15, "fifteenth", "vijftiende"), (19, "nineteenth", "negentiende"),
          (20, "twentieth", "twintigste"), (21, "twenty-first", "eenentwintigste")]
T2_SUBJ = [["art", "tekenen"], ["arts and crafts", "handenarbeid"], ["biology", "biologie"], ["Dutch", "Nederlands"], ["economics", "economie"], ["English", "Engels"],
           ["French", "Frans"], ["geography", "aardrijkskunde"], ["German", "Duits"], ["history", "geschiedenis"], ["maths", "wiskunde"], ["music", "muziek"],
           ["Physical Education (PE)", "gymnastiek/LO"], ["science", "natuur-/scheikunde"], ["social sciences", "maatschappijleer"], ["tutor hour", "mentoruur"]]
T2_LIKE = [["awesome", "geweldig"], ["awful", "vreselijk"], ["boring", "saai"], ["difficult", "moeilijk"], ["fine", "prima"], ["interesting", "interessant"],
           ["to be crazy about", "gek zijn op"], ["to be fond of", "dol zijn op"], ["to be into", "heel leuk vinden"], ["to dislike", "niet leuk vinden"],
           ["to enjoy", "genieten van"], ["to hate", "haten"], ["to like", "leuk vinden"], ["to prefer", "de voorkeur geven aan"], ["useful", "nuttig"], ["useless", "nutteloos"]]

# A/C/F/G: [Engels, Nederlands, voorbeeldzin]; ⇄ = beide kanten op, ➜ = alleen Engels → Nederlands
T1_TW = [  # ⇄
    ["fact", "feit", "It's a fact that the earth is round."], ["favourite", "favoriet, lievelings-", "My favourite ice-cream flavour is chocolate."],
    ["meet", "ontmoeten", "Nice to meet you, Thomas! My name is Mo."], ["move out", "op jezelf gaan wonen", "Many people move out of the house when they turn 18."],
    ["next to", "naast", "My place in class is next to Julie."], ["often", "vaak", "How often does your family go on holiday?"],
    ["smallest", "kleinste", "The Chihuahua is one of the smallest dogs in the world."], ["subject", "schoolvak", "In secondary school, French was my favourite subject."],
    ["tall", "lang", "Mr Bradley has brown hair, green eyes and is very tall."],
    ["artist", "kunstenaar", "The artist made a beautiful painting."], ["chance", "kans, mogelijkheid", "Is there a chance that you can help me study?"],
    ["draw", "tekenen", "She has high marks in art class because she can draw well."], ["enjoy", "leuk vinden", "Grandparents often enjoy it when their grandchildren visit them."],
    ["famous", "beroemd", "Vincent van Gogh is a famous Dutch painter."], ["paint", "schilderen", "I'm going to paint the door tomorrow."],
    ["possible", "mogelijk", "Is it possible to pay by credit card?"], ["sell", "verkopen", "She is going to sell her car and buy a new one."],
    ["somebody", "iemand", "The restaurant needs somebody who can work weekends."], ["wrong", "mis, fout", "I think Brian's birthday is next Tuesday, but I could be wrong."],
    ["beach", "strand", "The children built sandcastles at the beach."], ["close", "dichtbij", "I live very close to school, it's only a 5 minute walk."],
    ["for example", "bijvoorbeeld", "She loves sweet things. For example, chocolate and ice cream."], ["once", "één keer", "Once in my lifetime, I want to go skydiving or bungee jumping."],
    ["play", "spelen", "My sister takes ballet lessons and I play hockey."], ["right away", "meteen", "When Mum says 'Come here right away!', I know I am in trouble."],
    ["someone", "iemand", "Someone is at the door. Can you open it, please?"], ["sound", "geluid", "I love listening to the sound of birds."],
    ["stay", "(ver)blijven", "Where are you going to stay when you go to London?"], ["talk", "praten", "I'd like to talk some more! Let's meet again."],
    ["adult", "volwassene", "When you're over 18, you're officially an adult."], ["alike", "hetzelfde", "Callum and Hugh are brothers but they don't look alike."],
    ["different", "verschillend", "My sister and I are very different. She is tall and I am short."], ["exciting", "spannend, opwindend", "Her book was so exciting that she couldn't put it down."],
    ["feel", "voelen", "I like films that make you feel happy at the end."], ["prepare", "(je) voorbereiden", "I always prepare for a test the night before."],
    ["proud", "trots", "If you do your best, I'll always be proud of you."], ["remember", "onthouden", "Remember to post the letters on your way to work."],
    ["thrilling", "spannend", "Disney World is a theme park with some very thrilling rides."], ["warn", "waarschuwen", "Weather reporters warn people about hurricanes and tornadoes."]]
T1_RW = [  # ➜
    ["gymnastics", "turnen", "You should be really flexible if you want to do gymnastics."], ["competition", "competitie, wedstrijd", "We are taking part in the national dance competition."],
    ["naughty", "ondeugend", "It was naughty of Tommy to pull the cat's tail."], ["nearby", "vlakbij, in de buurt", "Even though my cousin lives nearby, I don't see her often."],
    ["quite", "tamelijk, best", "I quite often have a blackout when I have a test."],
    ["complain", "klagen", "Some people always complain about the weather."], ["description", "beschrijving", "Ireland sounds amazing from the description you gave."],
    ["general", "algemeen", "A general rule at school is getting to class on time."], ["habit", "gewoonte", "We have the habit of ordering pizza every Friday."],
    ["incredible", "ongelooflijk", "You got tickets for the concert? That's incredible news!"],
    ["braid", "vlecht", "Olivia wears her long hair in a braid."], ["elevator", "lift", "You have to take the stairs since the elevator is broken."],
    ["have in common", "gemeen hebben", "We have a lot in common, for instance our love of gaming."], ["queue", "rij", "If you don't like standing in a queue, you should shop online."],
    ["wave", "zwaaien", "I always wave goodbye when my friends leave."],
    ["awkward", "ongemakkelijk", "I feel awkward when people stare at me."], ["challenge", "uitdaging", "She gets bored very easily so she always needs a challenge."],
    ["conversation", "gesprek", "It is impossible to have a conversation with all this noise."], ["disability", "handicap", "Frank was born with a disability: he is blind."],
    ["prefer", "voorkeur geven aan", "We prefer hot and sunny weather to cold and rainy."]]
T2_TW = [
    ["afternoon", "middag", "I look after my little sister and brother in the afternoon."], ["break", "pauze", "During my lunch break, I eat my sandwich and have a cup of tea."],
    ["busy", "druk", "A seaside hotel is usually very busy during the summer."], ["drama", "toneel-", "I want to be an actor someday, so I joined the drama club."],
    ["hang out", "samen tijd doorbrengen", "Most teens like to hang out with friends in their free time."], ["important", "belangrijk", "My parents taught us that it is important to be respectful and kind."],
    ["meal", "maaltijd", "Which is your favourite meal of the day? Mine is breakfast."], ["probably", "waarschijnlijk", "The doctor is checking him out. It's probably nothing serious."],
    ["study for", "studeren, leren", "Do you want to come over to study for our biology test?"], ["worst", "ergst, slechtst", "I'm really bad at drawing. I'm the worst of my art class!"],
    ["almost", "bijna", "It's almost time to leave for school. Hurry up!"], ["brain", "hersenen", "It's a difficult subject. You really have to use your brain."],
    ["decide", "beslissen", "Shall we eat at an Italian restaurant or an Indian one? You can decide."], ["focus", "zich concentreren", "It's hard to focus on your homework when it's so noisy."],
    ["fast", "snel", "Brenda is a fast runner so she always beats me."], ["finally", "ten slotte", "After searching for hours, we finally found our cat."],
    ["loud", "luid", "The music was so loud that I couldn't even hear my friend talking."], ["mood", "stemming", "She's in a bad mood, so I wouldn't talk to her right now."],
    ["slow", "langzaam", "Dad is a slow driver, so he never gets a speeding ticket."], ["without", "zonder", "It rains so often here, so I never leave home without an umbrella."],
    ["catch up", "inhalen", "If you miss a lot of school, you have to catch up on assignments."], ["challenging", "lastig, uitdagend", "I am not good at languages, so French is a challenging class for me."],
    ["hard", "lastig", "I don't think maths is hard, I find it quite simple."], ["jealous", "jaloers", "Our cat gets jealous when I pet the neighbour's dog."],
    ["move", "verhuizen", "My mother has a new job in Canada, so we will move there in August."], ["opportunity", "kans", "The students have the opportunity to ask questions at the end of class."],
    ["performance", "optreden", "The dancers will have a performance on Friday night."], ["play", "toneelstuk", "My village has a drama club which puts on a play once a year."],
    ["reason", "reden", "The reason I missed class is that I had an appointment at the doctor's."], ["usually", "meestal", "We usually go camping with the family in France in summer."],
    ["change", "veranderen", "Why don't you change your hair colour if you don't like blond?"], ["early", "vroeg", "My stepdad goes to bed early because he starts work at 6 am."],
    ["enough", "genoeg", "Lisa fell asleep in class because she didn't get enough sleep last night."], ["join", "aansluiten, meedoen", "Why don't you join our group for this assignment?"],
    ["be lucky", "geluk hebben, mazzel hebben", "We have to be very lucky to have such nice neighbours."], ["opinion", "mening", "What's your opinion of her? I think she's nice."],
    ["sun", "zon", "You don't see the sun very much during an Irish summer."], ["remember", "zich herinneren", "I can never remember friends' birthdays. I need a calendar."],
    ["tired", "moe", "I had to study for two tests today, so now I'm tired."], ["wake up", "wakker maken, wakker worden", "If I don't set my alarm, I won't wake up in time for school."]]
T2_RW = [
    ["chore", "klusje, karweitje", "Doing the dishes is a chore that I hate. We should get a dishwasher."], ["curriculum", "leerstof, leerplan", "Dutch, maths and English are important subjects in the Dutch curriculum."],
    ["food tech", "voedingsleer, kookles", "Food tech is fun, because you learn about eating and cooking healthy."], ["personal development", "persoonlijke ontwikkeling", "In personal development, we learn about real-life things."],
    ["society", "maatschappij", "Phones and computers have a huge impact on our society."],
    ["distract", "afleiden", "I'm going to study upstairs so my little brother won't distract me."], ["researcher", "onderzoeker", "My mum is a researcher. She works in a laboratory."],
    ["scientific", "wetenschappelijk", "Animals like mice and rats are sometimes used for scientific research."], ["silence", "stilte", "Our teacher always wants complete silence during tests."],
    ["vocals", "zang", "The band has a combination of drums, piano and vocals."],
    ["choir", "koor", "My dad and I sing in the choir at our church every Sunday."], ["extracurricular activities", "buitenschoolse activiteiten", "Our school offers many different extracurricular activities."],
    ["Easter", "Pasen", "Little children love to search for eggs on Easter."], ["glee club", "zangclub", "If you like singing so much, you should join the glee club at school."],
    ["involved", "betrokken", "Our English teacher is involved in our musical production. He loves drama."],
    ["convince", "overtuigen", "We tried to convince grandma to join us on holiday."], ["excited", "opgewonden", "Fiona was so excited about winning a trip to London."],
    ["process", "verwerken", "We're moving and I have to change schools. That's a lot to process."], ["perform", "presteren", "Mum wants me to perform better at school so I have to study more."],
    ["signature", "handtekening", "When I filled in the form for an ID card, I had to put my signature at the bottom."]]
CAPS = {"Dutch", "English", "French", "German"}

def nl_variants(nl):
    out = {nl}
    base = re.sub(r"\s*\((kind van zus/broer|haar)\)", "", nl)
    out.add(base)
    for part in re.split(r"\s*,\s*", base):
        out.add(part)
        if "/" in part and "-/" not in part: out |= set(part.split("/"))
        if part.endswith("-"): out.add(part[:-1])
        if "(ver)" in part: out |= {part.replace("(ver)", "ver"), part.replace("(ver)", "")}
        if "(je) " in part: out |= {part.replace("(je) ", "je "), part.replace("(je) ", "")}
        if part == "school-kantine": out |= {"schoolkantine", "kantine"}
        if part == "natuur-/scheikunde": out |= {"natuurkunde", "scheikunde", "natuur- en scheikunde", "natuur-scheikunde", "natuur/scheikunde"}
        if part == "gymnastiek/LO": out |= {"gym", "gymnastiek", "LO", "lichamelijke opvoeding"}
        if part.startswith("zich "): out.add(part[5:])
    if nl == "lang (haar)": out.add("lang haar")
    return sorted(out)

def en_variants(en):
    out = {en}
    if en == "long (hair)": out |= {"long", "long hair"}
    if en == "Physical Education (PE)": out |= {"Physical Education", "PE"}
    if en.startswith("to "): out.add(en[3:])
    if en == "be lucky": out.add("to be lucky")
    if en == "a couple": out.add("couple")
    return sorted(out)

ALL = []  # (en, nl) van alle ⇄-woorden: zo telt bij "iemand" zowel somebody als someone goed
for L in (T1_LOOKS, T1_FAM, T1_PERS, T2_SCHOOL, T2_SUBJ, T2_LIKE): ALL += [tuple(x) for x in L]
ALL += [(e, n) for e, n, _ in T1_TW + T2_TW]
def accepted_en(nl):
    a = set()
    for e, n in ALL:
        if nl in nl_variants(n): a |= set(en_variants(e))
    return sorted(a)

def hl(sent, w):  # het woord vet in de voorbeeldzin
    return re.sub(r"(?i)\b(" + re.escape(w) + r")\b", r"**\1**", sent, count=1)

def word_qs(words, bk, two_way=True, sent=None):
    qs = []
    for x in words:
        e, n = x[0], x[1]
        s = x[2] if len(x) > 2 else None
        q1 = {"k": "type", "q": "Wat betekent: **" + e + "**", "a": nl_variants(n), "show": n, "bk": bk}
        if s: q1["ctx"] = "*" + hl(s, e.split(" ")[0] if e not in ("for example", "right away", "next to", "move out", "hang out", "catch up", "wake up", "have in common", "food tech", "glee club", "personal development", "extracurricular activities", "be lucky", "study for") else e) + "*"
        qs.append(q1)
        if two_way:
            q2 = {"k": "type", "strict": True, "q": "Hoe zeg je in het Engels: **" + n + "**", "a": accepted_en(n) or en_variants(e), "show": e, "bk": bk}
            if e in CAPS: q2["case"] = True; q2["xw"] = "Talen en nationaliteiten schrijf je in het Engels met een **hoofdletter**: Dutch, English, French, German."
            qs.append(q2)
    return qs

def kern_words(title, words):
    return "**" + title + ":** " + " · ".join(f"*{x[0]}* – {x[1]}" for x in words)

topics = []
# ---------- thema 1 theme words
topics.append({"id": "t1w", "nav": "T1 woorden", "title": "Thema 1 · Theme words", "pages": "blz. 82", "bron": [82], "n": 15,
    "doelen": ["Je kent de theme words van thema 1 (uiterlijk, familie, persoonlijkheid) van Engels naar Nederlands én van Nederlands naar Engels.", "Je schrijft de Engelse woorden goed."],
    "kern": [kern_words("Looks – uiterlijk", T1_LOOKS), kern_words("Family members – familieleden", T1_FAM), kern_words("Personality – persoonlijkheid", T1_PERS)],
    "let": ["**nephew** = neef (zoon van je broer/zus), **cousin** = neef of nicht (kind van je oom/tante), **niece** = nicht (dochter van je broer/zus).",
            "**quiet** (stil) is iets anders dan **quite** (tamelijk): quiet heeft de **e** vóór de t.",
            "Met een streepje: **easy-going**, **great-grandfather**, **half-brother**."],
    "qs": word_qs(T1_LOOKS + T1_FAM + T1_PERS, "blz. 82")})
topics.append({"id": "t1v", "nav": "T1 A-C-F-G", "title": "Thema 1 · Woorden A, C, F en G", "pages": "blz. 82-83", "bron": [82, 83], "n": 15,
    "doelen": ["⇄-woorden: je kent ze van Engels naar Nederlands én van Nederlands naar Engels.", "➜-woorden: je weet wat ze betekenen als je ze leest of hoort."],
    "kern": ["**⇄ (beide kanten op, ook spellen):** " + " · ".join(f"*{e}* – {n}" for e, n, _ in T1_TW),
             "**➜ (alleen herkennen):** " + " · ".join(f"*{e}* – {n}" for e, n, _ in T1_RW)],
    "let": ["**somebody** en **someone** betekenen allebei *iemand*; je schrijft ze als één woord.",
            "**tall** = lang (voor mensen); **long** = lang (voor haar, dingen). **wrong** begint met een stomme **w**.",
            "**favourite** is Brits-Engels: met **-our-**."],
    "qs": word_qs(T1_TW, "blz. 82-83") + word_qs(T1_RW, "blz. 82-83", two_way=False)})

# ---------- stones (letterlijk blz. 84 en 132)
S1 = [("Hello, my name is Rashid.", "Hallo, mijn naam is Rashid."), ("Hi, I'm your neighbour.", "Hoi, ik ben je buurman/-vrouw."),
      ("Nice/Good/Glad to meet you.", "Leuk om kennis te maken."), ("I have three sisters. I'm the eldest.", "Ik heb drie zussen. Ik ben de oudste."),
      ("Meet John and Louise. They are my parents.", "Dit zijn John en Louise. Zij zijn mijn ouders."), ("My father is a teacher.", "Mijn vader is docent."),
      ("My mother works at the hospital.", "Mijn moeder werkt in het ziekenhuis."), ("I'd like you to meet Claudia. She's my stepmother.", "Ik wil je graag voorstellen aan Claudia. Zij is mijn stiefmoeder."),
      ("How is it going? I'm all right, thanks.", "Hoe gaat het met je? Prima, dank je.")]
S2 = [("What is your first name? My first name is Anne.", "Wat is je voornaam? Mijn voornaam is Anne."), ("What is your address? I live at 77 Baltic Road.", "Wat is je adres? Ik woon op Baltic Road 77."),
      ("How old are you? I'm 13 years old.", "Hoe oud ben je? Ik ben 13 jaar."), ("When is your birthday? My birthday is on the 17th of May.", "Wanneer ben je jarig? Ik ben jarig op 17 mei."),
      ("What is your nationality? I am Dutch.", "Wat is je nationaliteit? Ik ben Nederlands."), ("Where do you live? I live in Rotterdam.", "Waar woon je? Ik woon in Rotterdam.")]
S3 = [("What does she look like?", "Hoe ziet zij eruit?"), ("What colour are her eyes?", "Welke kleur ogen heeft ze?"), ("Can you describe her to me?", "Kun je haar beschrijven?"),
      ("She has blond hair and wears glasses.", "Ze heeft blond haar en ze draagt een bril."), ("He is easy-going and funny.", "Hij is makkelijk in de omgang en grappig."),
      ("She is a little quiet but has a great sense of humour.", "Zij is een beetje stil maar ze heeft een goed gevoel voor humor.")]
S4 = [("What time is it?", "Hoe laat is het?"), ("Could you tell me the time, please?", "Kunt u/Kun je me vertellen hoe laat het is?"), ("It's two o'clock.", "Het is twee uur."),
      ("It's half past two.", "Het is half drie."), ("It's a quarter past two.", "Het is kwart over twee."), ("It's a quarter to three.", "Het is kwart voor drie."),
      ("It's twenty past two.", "Het is twintig minuten over twee. / Het is tien voor half drie."), ("It's ten to three.", "Het is tien voor drie.")]
S5 = [("When is English?", "Wanneer hebben we Engels?"), ("When is our next break?", "Wanneer hebben we onze volgende pauze?"),
      ("Do we have history before or after our lunch break?", "Hebben we geschiedenis voor of na onze lunchpauze?"), ("Do we have music in classroom 34?", "Hebben we muziek in lokaal 34?"),
      ("We have art in the afternoon.", "We hebben 's middags tekenen."), ("The first hour we have an English test.", "Het eerste uur hebben we een proefwerk Engels."),
      ("My day starts with two hours of PE.", "Mijn dag begint met twee uur gym.")]
S6 = [("What do you like about school?", "Wat vind je leuk aan school?"), ("What do you enjoy doing after school?", "Wat vind je leuk om na school te doen?"),
      ("What is your favourite subject?", "Wat is je lievelingsvak?"), ("Why is science your least favourite subject?", "Waarom vind je natuur- en scheikunde het minst leuk?"),
      ("I'm fond of French because it's an interesting subject.", "Ik ben dol op Frans want dat is een interessant vak."),
      ("I don't like maths. I think it's a difficult subject.", "Ik vind wiskunde niet leuk. Ik vind het een moeilijk vak."),
      ("After school I always visit my grandparents.", "Na school bezoek ik altijd mijn grootouders."),
      ("I enjoy practising with my band during the weekend.", "Ik vind het leuk om te oefenen met mijn band in het weekend.")]
CONTR = [("I'm", "I am"), ("It's", "It is"), ("it's", "it is"), ("She's", "She is"), ("I'd", "I would"), ("don't", "do not"), ("doesn't", "does not"), ("isn't", "is not"),
         ("aren't", "are not"), ("haven't", "have not"), ("hasn't", "has not"), ("can't", "cannot"), ("What is", "What's"), ("They are", "They're"), ("He is", "He's"), ("I am", "I'm")]
def contr_variants(s):
    alts = [s]
    for a, b in CONTR:
        new = []
        for x in alts:
            if re.search(r"(?<![\w'])" + re.escape(a) + r"(?![\w'])", x):
                new.append(re.sub(r"(?<![\w'])" + re.escape(a) + r"(?![\w'])", b, x))
        alts += new
    return sorted(set(alts))
def stone_alts(en):
    if en.startswith("Nice/Good/Glad"): return [w + " to meet you." for w in ("Nice", "Good", "Glad")]
    return contr_variants(en)

def stone_kern(title, S): return ["**" + title + "**"] + [f"*{e}* – {n}" for e, n in S]
def stone_qs(S, bk):
    return [{"k": "type", "strict": True, "q": "Vertaal naar het Engels: " + n, "a": stone_alts(e), "show": e, "bk": bk} for e, n in S]

st1 = stone_qs(S1 + S2 + S3, "blz. 84") + [
    {"k": "mc", "q": "Ik ben 13 jaar. = …", "opts": ["I'm 13 years old.", "I have 13 years.", "I'm 13 years."], "a": 0, "x": "Je leeftijd: **I'm … years old**.", "bk": "blz. 84, Stone 2"},
    {"k": "mc", "q": "Hoe ziet zij eruit? = …", "opts": ["What does she look like?", "How does she look like?", "How looks she?"], "a": 0, "x": "**What** does she look **like**? (niet *how*)", "bk": "blz. 84, Stone 3"},
    {"k": "mc", "q": "Mijn vader is docent. = …", "opts": ["My father is a teacher.", "My father is teacher.", "My father is the teacher."], "a": 0, "x": "Bij een beroep zet je in het Engels **a**: My father is **a** teacher.", "bk": "blz. 84, Stone 1"},
    {"k": "mc", "q": "Ik woon op Baltic Road 77. = …", "opts": ["I live at 77 Baltic Road.", "I live on Baltic Road 77.", "I live in Baltic Road 77."], "a": 0, "x": "In het Engels komt het huisnummer **vóór** de straat: **77 Baltic Road**.", "bk": "blz. 84, Stone 2"},
    {"k": "mc", "q": "Ik ben jarig op 17 mei. = …", "opts": ["My birthday is on the 17th of May.", "I am birthday on 17 May.", "My birthday is in the 17th of May."], "a": 0, "bk": "blz. 84, Stone 2"},
    {"k": "mc", "q": "Je wordt aan iemand voorgesteld. Wat zeg je?", "opts": ["Nice to meet you.", "Nice to see you again.", "How old are you?"], "a": 0, "bk": "blz. 84, Stone 1"},
    {"k": "mc", "q": "Je wilt weten welke kleur ogen ze heeft. Je vraagt: …", "opts": ["What colour are her eyes?", "What colour have her eyes?", "Which colour has she eyes?"], "a": 0, "bk": "blz. 84, Stone 3"},
    {"k": "mc", "q": "Iemand vraagt: How is it going? Je antwoordt: …", "opts": ["I'm all right, thanks.", "I'm 13 years old.", "I live in Rotterdam."], "a": 0, "bk": "blz. 84, Stone 1"},
    {"k": "mc", "q": "Ik ben Nederlands. = …", "opts": ["I am Dutch.", "I am Netherlands.", "I am dutch."], "a": 0, "x": "Nationaliteit: **Dutch**, met een hoofdletter.", "bk": "blz. 84, Stone 2"},
]
topics.append({"id": "t1s", "nav": "Stones 1-3", "title": "Stones 1-3 · Voorstellen, gegevens, beschrijven", "pages": "blz. 84", "bron": [84], "n": 12,
    "doelen": ["Je kunt jezelf en anderen voorstellen, persoonlijke gegevens vragen en geven, en mensen beschrijven met de zinnen van de Stones."],
    "kern": stone_kern("1 Introducing yourself and others – Jezelf en andere mensen voorstellen", S1) + stone_kern("2 Talking about personal information – Praten over persoonlijke gegevens", S2)
            + stone_kern("3 Describing people – Mensen beschrijven", S3) + ["De **oranje** woorden in het boek kun je vervangen door andere woorden die je kent."],
    "let": ["Leeftijd: **I'm 13 years old** (niet *I have 13 years*).", "Uiterlijk vragen: **What** does she look **like**? (niet *How*).",
            "Adres: nummer vóór de straat (**77 Baltic Road**); beroep met **a** (*My father is **a** teacher*)."],
    "qs": st1})

# ---------- grammatica thema 1 (blz. 85)
TABLES = {
    "be": {"title": "to be", "rows": [["I", "am", "ik ben"], ["you", "are", "jij bent"], ["he / she / it", "is", "hij / zij / het is"], ["we", "are", "wij zijn"], ["you", "are", "jullie zijn"], ["they", "are", "zij zijn"]]},
    "ps": {"title": "he / she / it-vorm", "rows": [["walk →", "walks", "+ s"], ["watch →", "watches", "-s, -x, -z, -ch, -sh: + es"], ["do →", "does", ""], ["go →", "goes", ""], ["try →", "tries", "medeklinker + y: -ies"], ["buy →", "buys", "a, e, i, o, u vóór -y: + s"]]},
    "pron": {"title": "Personal pronouns", "rows": [["I →", "me", "ik – mij"], ["you →", "you", "jij – jou"], ["he →", "him", "hij – hem"], ["she →", "her", "zij – haar"], ["it →", "it", "het – het"], ["we →", "us", "wij – ons"], ["they →", "them", "zij – hen"]]},
}
def psq(s, a, row, extra=()):
    return {"k": "type", "strict": True, "q": "Vul de goede vorm in: " + s, "a": [a, *extra], "tab": "ps" if row is not None and row >= 0 else "be", "row": abs(row) if row is not None else None, "bk": "blz. 85, grammar 1"}
g1 = [
    {"k": "conj", "tab": "be", "q": "Vervoeg **to be** in de present simple: vul de hele tabel in.", "bk": "blz. 85"},
    {"k": "conj", "tab": "ps", "q": "Schrijf de **he / she / it**-vorm van elk werkwoord.", "bk": "blz. 85"},
    {"k": "conj", "tab": "pron", "q": "Schrijf de vorm die je ná het werkwoord gebruikt (I like Jim → Jim likes **me**).", "bk": "blz. 85"},
    psq("My sister ___ (watch) TV every evening.", "watches", 1), psq("He ___ (try) to be on time.", "tries", 4), psq("She ___ (buy) a new backpack.", "buys", 5),
    psq("Tom ___ (go) to school by bike.", "goes", 3), psq("My brother ___ (do) his homework after dinner.", "does", 2), psq("Our teacher ___ (talk) a lot.", "talks", 0),
    psq("My cousin ___ (study) for a test.", "studies", 4), psq("Dad ___ (play) hockey on Saturday.", "plays", 5), psq("We ___ (walk) to school.", "walk", 0),
    psq("My grandparents ___ (live) in Rotterdam.", "live", 0), psq("Mum ___ (wash) the car every week.", "washes", 1), psq("He ___ (stay) at home on Sunday.", "stays", 5),
    psq("She ___ (catch up) on her assignments.", "catches up", 1, ("catches",)), psq("My little brother ___ (cry) a lot.", "cries", 4),
    psq("I ___ (be) the eldest.", "am", -0, ("I am",)) | {"tab": "be", "row": 0}, psq("It ___ (be) a difficult subject.", "is", None, ("It is",)) | {"tab": "be", "row": 2},
    psq("They ___ (be) twins.", "are", None, ("They are",)) | {"tab": "be", "row": 5},
    {"k": "sort", "q": "Welke uitgang krijgt de he/she/it-vorm?", "cats": ["+ s", "+ es", "y → ies"], "items": [["talk", "+ s"], ["play", "+ s"], ["buy", "+ s"], ["enjoy", "+ s"], ["stay", "+ s"],
        ["watch", "+ es"], ["wash", "+ es"], ["go", "+ es"], ["do", "+ es"], ["relax", "+ es"], ["try", "y → ies"], ["study", "y → ies"], ["cry", "y → ies"]], "bk": "blz. 85"},
    {"k": "mc", "q": "Waarvoor gebruik je de present simple?", "opts": ["voor feiten en gewoontes", "voor iets wat nu op dit moment bezig is", "voor iets wat gisteren gebeurde"], "a": 0, "x": "facts, habits: *She walks to school every day.*", "bk": "blz. 85"},
    {"k": "mc", "q": "Bij welke personen krijgt het werkwoord in de present simple een -s?", "opts": ["he, she, it", "I en you", "we, you, they"], "a": 0, "bk": "blz. 85"},
    {"k": "mc", "q": "Waarom is het **plays**, maar **tries**?", "opts": ["Bij play staat er een klinker (a) vóór de y, bij try een medeklinker.", "Play is een kort woord.", "Try is onregelmatig."], "a": 0, "bk": "blz. 85"},
    {"k": "type", "strict": True, "q": "Jim likes ___ (I).", "a": ["me"], "tab": "pron", "row": 0, "bk": "blz. 85, grammar 2"},
    {"k": "type", "strict": True, "q": "I like ___ (he).", "a": ["him"], "tab": "pron", "row": 2, "bk": "blz. 85, grammar 2"},
    {"k": "type", "strict": True, "q": "I like ___ (she).", "a": ["her"], "tab": "pron", "row": 3, "bk": "blz. 85, grammar 2"},
    {"k": "type", "strict": True, "q": "You like ___ (we).", "a": ["us"], "tab": "pron", "row": 5, "bk": "blz. 85, grammar 2"},
    {"k": "type", "strict": True, "q": "He likes ___ (they).", "a": ["them"], "tab": "pron", "row": 6, "bk": "blz. 85, grammar 2"},
    {"k": "type", "strict": True, "q": "Can you describe ___ to me? (she)", "a": ["her"], "tab": "pron", "row": 3, "bk": "blz. 84-85"},
    {"k": "type", "strict": True, "q": "My parents are proud of ___ (I).", "a": ["me"], "tab": "pron", "row": 0, "bk": "blz. 85"},
    {"k": "type", "strict": True, "q": "I don't see ___ very often. (they)", "a": ["them"], "tab": "pron", "row": 6, "bk": "blz. 85"},
    {"k": "type", "strict": True, "q": "Is that your brother? I like ___ (he).", "a": ["him"], "tab": "pron", "row": 2, "bk": "blz. 85"},
    {"k": "type", "strict": True, "q": "Can you help ___ with our homework? (we)", "a": ["us"], "tab": "pron", "row": 5, "bk": "blz. 85"},
    {"k": "mc", "q": "Welke zin is goed?", "opts": ["She likes him.", "Her likes him.", "She likes he."], "a": 0, "x": "Vóór het werkwoord: **she**; ná het werkwoord: **him**.", "bk": "blz. 85"},
    {"k": "mc", "q": "Welke zin is goed?", "opts": ["They like us.", "Them like us.", "They like we."], "a": 0, "bk": "blz. 85"},
    {"k": "fill", "q": "Kies het goede vraagwoord.", "opts": ["Who", "What", "Where", "When", "Why", "Which", "How"], "items": [["… is that? – That's my cousin.", "Who"], ["… is your name?", "What"],
        ["… is Jack? – He's at the beach.", "Where"], ["… is your birthday?", "When"], ["… is your house green?", "Why"], ["… colour is your favourite, red or blue?", "Which"], ["… is your brother? – He's fine.", "How"]], "bk": "blz. 85, grammar 3"},
    *[{"k": "type", "strict": True, "q": f"Hoe zeg je in het Engels het vraagwoord: **{n}**", "a": [e], "bk": "blz. 85, grammar 3", **({"xw": x} if x else {})} for n, e, x in
      [("wie", "who", "**who** = wie; **where** = waar."), ("wat", "what", ""), ("waar", "where", "**where** (waar) – niet verwarren met *were* (waren) of *wear* (dragen)."), ("wanneer", "when", ""),
       ("waarom", "why", ""), ("welke (keuze uit een paar)", "which", "**which** schrijf je met **wh** en **ch**."), ("hoe", "how", "")]],
]
topics.append({"id": "t1g", "nav": "Grammar 1-3", "title": "Grammar 1-3 · Present simple, pronouns, question words", "pages": "blz. 85", "bron": [85], "n": 12,
    "doelen": ["Je kunt de present simple vormen en spellen (walk – walks, watch – watches, try – tries, buy – buys).", "Je gebruikt de goede persoonlijke voornaamwoorden (I – me, he – him).", "Je kent de vraagwoorden who, what, where, when, why, which en how."],
    "kern": ["**1 Present simple** – voor **feiten en gewoontes** (facts, habits).",
             "I / you / we / they **walk** · he / she / it walk**s**.",
             "Na **-s, -x, -z, -ch, -sh** komt **-es**: watch → watch**es**. Ook: do → do**es**, go → go**es**.",
             "Medeklinker + **y** → **-ies**: try → tr**ies**. Maar **a, e, i, o, u** vóór -y → alleen **-s**: buy → buy**s**.",
             "**to be:** I **am** · you **are** · he/she/it **is** · we **are** · you **are** · they **are**.",
             "**2 Personal pronouns** – vóór het werkwoord / ná het werkwoord: **I – me**, **you – you**, **he – him**, **she – her**, **it – it**, **we – us**, **they – them**. *I like Jim. – Jim likes **me**.*",
             "**3 Question words** – **Who** is that? · **Where** is Jack? · **Why** is your house green? · **How** is your brother? · **What** is your name? · **When** is your birthday? · **Which** colour is your favourite, red or blue?"],
    "let": ["Vergeet de **-s** niet bij **he, she, it**: *My sister play**s** hockey.*", "**tries, studies** (medeklinker + y), maar **plays, buys, enjoys** (klinker + y).",
            "Ná het werkwoord: **me, him, her, us, them** – dus *She likes **him***, niet *She likes he*."],
    "qs": g1})

# ---------- thema 2
topics.append({"id": "t2w", "nav": "T2 woorden", "title": "Thema 2 · Theme words", "pages": "blz. 130", "bron": [130], "n": 15,
    "doelen": ["Je kent de theme words van thema 2 (op school, schoolvakken, wat je (niet) leuk vindt) van Engels naar Nederlands én van Nederlands naar Engels.", "Je schrijft de Engelse woorden goed."],
    "kern": [kern_words("At school – op school", T2_SCHOOL), kern_words("School subjects – schoolvakken", T2_SUBJ), kern_words("Likes and dislikes – vind-ik-(niet-)leuk", T2_LIKE)],
    "let": ["Talen met een **hoofdletter**: **Dutch, English, French, German**.", "**maths** (Brits, met s), **geography** (met **ph**), **science** (met **sc**).",
            "**useful** en **awful** eindigen op één **l** (-ful); **difficult** heeft **ff**."],
    "qs": word_qs(T2_SCHOOL + T2_SUBJ + T2_LIKE, "blz. 130")})
topics.append({"id": "t2v", "nav": "T2 A-C-F-G", "title": "Thema 2 · Woorden A, C, F en G", "pages": "blz. 130-131", "bron": [130, 131], "n": 15,
    "doelen": ["⇄-woorden: je kent ze van Engels naar Nederlands én van Nederlands naar Engels.", "➜-woorden: je weet wat ze betekenen als je ze leest of hoort."],
    "kern": ["**⇄ (beide kanten op, ook spellen):** " + " · ".join(f"*{e}* – {n}" for e, n, _ in T2_TW),
             "**➜ (alleen herkennen):** " + " · ".join(f"*{e}* – {n}" for e, n, _ in T2_RW)],
    "let": ["**play** in thema 2 = toneelstuk (zelfstandig naamwoord); in thema 1 = spelen.", "**opportunity** en **chance** betekenen allebei *kans*.",
            "Lastige spelling: **busy** (met u), **enough** (-ough), **jealous** (-ea-, -ous), **usually** (ll), **almost** (één l)."],
    "qs": word_qs(T2_TW, "blz. 130-131") + word_qs(T2_RW, "blz. 130-131", two_way=False)})

st2 = stone_qs(S4 + S5 + S6, "blz. 132") + [
    {"k": "gen", "g": "tijd", "q": "", "bk": "blz. 132, Stone 4"} for _ in range(4)] + [
    {"k": "mc", "q": "Het is half drie. = …", "opts": ["It's half past two.", "It's half three.", "It's half past three."], "a": 0, "x": "Engels telt vanaf het uur dat geweest is: half drie = **half past two**.", "bk": "blz. 132, Stone 4"},
    {"k": "mc", "q": "Het is kwart voor drie. = …", "opts": ["It's a quarter to three.", "It's a quarter past three.", "It's a quarter to two."], "a": 0, "bk": "blz. 132, Stone 4"},
    {"k": "mc", "q": "It's twenty past two. = …", "opts": ["Het is tien voor half drie.", "Het is twintig voor twee.", "Het is tien over half twee."], "a": 0, "bk": "blz. 132, Stone 4"},
    {"k": "mc", "q": "It's ten to three. = …", "opts": ["Het is tien voor drie.", "Het is tien over drie.", "Het is tien voor half drie."], "a": 0, "bk": "blz. 132, Stone 4"},
    {"k": "mc", "q": "Je wilt beleefd vragen hoe laat het is. Je zegt: …", "opts": ["Could you tell me the time, please?", "What is the clock?", "How late is it?"], "a": 0, "x": "*Hoe laat is het?* = **What time is it?** (niet *How late*).", "bk": "blz. 132, Stone 4"},
    {"k": "mc", "q": "We hebben 's middags tekenen. = …", "opts": ["We have art in the afternoon.", "We have drawing in the middle.", "We have art in the middag."], "a": 0, "bk": "blz. 132, Stone 5"},
    {"k": "mc", "q": "Wat is je lievelingsvak? = …", "opts": ["What is your favourite subject?", "What is your lovely subject?", "Which is your favourite thing?"], "a": 0, "bk": "blz. 132, Stone 6"},
    {"k": "mc", "q": "Ik ben dol op Frans. = …", "opts": ["I'm fond of French.", "I'm fond on French.", "I'm crazy of French."], "a": 0, "x": "**to be fond of** = dol zijn op; **to be crazy about** = gek zijn op.", "bk": "blz. 132, Stone 6"},
    {"k": "mc", "q": "Ik vind het leuk om te oefenen met mijn band. = I enjoy ___ with my band.", "opts": ["practising", "to practise", "practise"], "a": 0, "x": "Na **enjoy** komt de **-ing**-vorm: I enjoy practis**ing**.", "bk": "blz. 132, Stone 6"},
]
topics.append({"id": "t2s", "nav": "Stones 4-6", "title": "Stones 4-6 · Tijd, rooster, (niet) leuk vinden", "pages": "blz. 132", "bron": [132], "n": 12,
    "doelen": ["Je kunt zeggen en vragen hoe laat het is, praten over je rooster en zeggen wat je wel en niet leuk vindt."],
    "kern": stone_kern("4 Talking about the time – Praten over de tijd", S4) + stone_kern("5 Talking about timetables – Praten over roosters", S5) + stone_kern("6 Talking about likes and dislikes – Praten over wat je wel en niet leuk vindt", S6)
            + ["**Klok:** :00 o'clock · :05 five past · :10 ten past · :15 a quarter past · :20 twenty past · :25 twenty-five past · :30 half past · :35 twenty-five to · :40 twenty to · :45 a quarter to · :50 ten to · :55 five to"],
    "let": ["**half drie = half past two** (in het Engels noem je het uur dat al geweest is).", "Na **past** het uur dat geweest is, na **to** het uur dat komt: *a quarter **to three*** = kwart voor drie.",
            "Hoe laat is het? = **What time is it?** (niet *How late*)."],
    "qs": st2})

def neg_alts(*xs):
    out = set()
    for x in xs: out |= set(contr_variants(x))
    return sorted(out)
g2 = [
    *[{"k": "mc", "q": "Kies: " + s, "opts": o, "a": 0, "bk": "blz. 133, grammar 4", **({"x": x} if x else {})} for s, o, x in [
        ("___ you his brother?", ["Are", "Do", "Have"], ""), ("___ you tell me about yourself?", ["Can", "Do", "Are"], ""), ("___ you like him?", ["Do", "Are", "Does"], ""),
        ("___ he have a dog?", ["Does", "Do", "Has"], "Bij he/she/it: **Does** … **have**."), ("___ she walk to school?", ["Does", "Is", "Do"], ""),
        ("___ you got two cats?", ["Have", "Do", "Are"], "*have got*: **Have** you got …?"), ("___ she got history at two o'clock?", ["Has", "Does", "Have"], "*has got*: **Has** she got …?"),
        ("___ your sister wear glasses?", ["Does", "Is", "Do"], ""), ("___ your brother shy?", ["Is", "Does", "Has"], ""), ("___ we have music in classroom 34?", ["Do", "Are", "Does"], "")]],
    *[{"k": "type", "strict": True, "q": "Maak er een vraag van: " + s, "a": contr_variants(a), "show": a, "bk": "blz. 133, grammar 4", **({"xw": x} if x else {})} for s, a, x in [
        ("She walks to school.", "Does she walk to school?", "Met **does** valt de **-s** weg: Does she walk …?"), ("He has a dog.", "Does he have a dog?", "**has** wordt **have** na does."),
        ("You like him.", "Do you like him?", ""), ("They are divorced.", "Are they divorced?", "Bij am, are, is, can zet je het werkwoord vooraan."),
        ("She has got history at two o'clock.", "Has she got history at two o'clock?", "Bij *have got / has got*: **Has** she got …?"), ("He can draw well.", "Can he draw well?", ""),
        ("Tom plays hockey.", "Does Tom play hockey?", "Met **does** valt de **-s** weg."), ("Your sister wears braces.", "Does your sister wear braces?", "Met **does** valt de **-s** weg.")]],
    *[{"k": "type", "strict": True, "q": "Maak ontkennend: " + s, "a": neg_alts(*a), "show": a[0], "bk": "blz. 133, grammar 5", **({"xw": x} if x else {})} for s, a, x in [
        ("I am his brother.", ["I'm not his brother.", "I am not his brother."], ""), ("He is my friend.", ["He isn't my friend.", "He is not my friend.", "He's not my friend."], ""),
        ("You are here.", ["You aren't here.", "You are not here.", "You're not here."], ""), ("I can tell you the answer.", ["I can't tell you the answer.", "I cannot tell you the answer."], "**cannot** schrijf je als één woord; kort: **can't**."),
        ("I like him.", ["I don't like him.", "I do not like him."], ""), ("He has a dog.", ["He doesn't have a dog.", "He does not have a dog."], "**doesn't have** (niet *doesn't has*)."),
        ("She walks to school.", ["She doesn't walk to school.", "She does not walk to school."], "Na **doesn't** valt de **-s** weg: doesn't walk."),
        ("I have got two cats.", ["I haven't got two cats.", "I have not got two cats."], ""), ("She has got history at two o'clock.", ["She hasn't got history at two o'clock.", "She has not got history at two o'clock."], ""),
        ("Tom enjoys maths.", ["Tom doesn't enjoy maths.", "Tom does not enjoy maths."], "Na **doesn't** valt de **-s** weg."), ("We have art in the afternoon.", ["We don't have art in the afternoon.", "We do not have art in the afternoon."], ""),
        ("She is lazy.", ["She isn't lazy.", "She is not lazy.", "She's not lazy."], "")]],
    {"k": "mc", "q": "Welke zin is goed?", "opts": ["He doesn't have a dog.", "He doesn't has a dog.", "He don't have a dog."], "a": 0, "bk": "blz. 133"},
    {"k": "mc", "q": "Welke zin is goed?", "opts": ["She doesn't walk to school.", "She doesn't walks to school.", "She not walks to school."], "a": 0, "bk": "blz. 133"},
    {"k": "mc", "q": "Wanneer gebruik je **do / does** in een vraag of ontkenning?", "opts": ["bij andere werkwoorden dan am, are, is, can", "alleen bij am, are, is en can", "nooit bij he, she, it"], "a": 0, "bk": "blz. 133"},
    {"k": "order", "q": "Zet de woordvolgorde van een Engelse zin goed.", "items": ["wie (onderwerp)", "doet (werkwoord)", "wat", "waar", "wanneer"], "bk": "blz. 133, grammar 6"},
    *[{"k": "order", "q": "Maak een goede zin.", "items": it, "bk": "blz. 133, grammar 6"} for it in [
        ["She", "has", "history", "at school", "on Tuesday."], ["They", "cook", "dinner", "every Monday."], ["Horses", "don't like", "rain."],
        ["We", "have", "art", "in classroom 34", "in the afternoon."], ["I", "do", "my homework", "at home", "every day."], ["Tom", "meets", "his friends", "at the beach", "after school."]]],
    {"k": "mc", "q": "Welke zin heeft de goede woordvolgorde?", "opts": ["We have flowers at home.", "We have at home flowers.", "At home have we flowers."], "a": 0, "x": "wie – doet – wat – waar – wanneer", "bk": "blz. 133"},
    {"k": "mc", "q": "Welke zin heeft de goede woordvolgorde?", "opts": ["My sister plays hockey on Saturday.", "On Saturday plays my sister hockey.", "My sister plays on Saturday hockey."], "a": 0, "x": "In het Engels staat het onderwerp vóór het werkwoord, en **wanneer** aan het eind.", "bk": "blz. 133"},
]
topics.append({"id": "t2g", "nav": "Grammar 4-6", "title": "Grammar 4-6 · Ja/nee-vragen, ontkenningen, woordvolgorde", "pages": "blz. 133", "bron": [133], "n": 12,
    "doelen": ["Je kunt ja/nee-vragen maken, zinnen ontkennend maken en zinnen in de goede woordvolgorde zetten."],
    "kern": ["**4 Ja/nee-vragen** – **am, are, is, can** zet je vooraan: **Are** you his brother? · **Can** you tell me about yourself?",
             "Andere werkwoorden: **Do / Does** vooraan: **Do** you like him? · **Does** he have a dog? · **Does** she walk to school?",
             "*to have got*: **Have** you got two cats? · **Has** she got history at two o'clock?",
             "**5 Ontkenningen** – am, are, is, can + **not**: I am **not** / I'**m not** · he is not / he **isn't** · you are not / you **aren't** · I **cannot** / I **can't**",
             "Andere werkwoorden: **do not / don't** en **does not / doesn't**: I **don't** like him · He **doesn't** have a dog · She **doesn't** walk to school.",
             "*to have got*: I **have not got / haven't got** two cats · She **has not got / hasn't got** history at two o'clock.",
             "**6 Woordvolgorde:** **wie – doet – wat – waar – wanneer**: *She has history at school on Tuesday.* · *They cook dinner every Monday.*"],
    "let": ["Na **does / doesn't** valt de **-s** weg: *Does she walk…?*, *She doesn't walk…* (niet *walks*).", "**has** wordt **have** na does: *Does he **have** a dog?* · *He doesn't **have** a dog.*",
            "Engelse zinnen: onderwerp altijd vóór het werkwoord, en **waar** vóór **wanneer**."],
    "qs": g2})

# ---------- spelling: getallen en rangtelwoorden
O = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
TT = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
def en_num(n):
    if n < 20: return O[n]
    if n < 100: return TT[n // 10] + ('-' + O[n % 10] if n % 10 else '')
    if n < 1000: return O[n // 100] + ' hundred' + (' and ' + en_num(n % 100) if n % 100 else '')
    return en_num(n // 1000) + ' thousand' + (((' and ' if n % 1000 < 100 else ' ') + en_num(n % 1000)) if n % 1000 else '')
SP = {'one': 'first', 'two': 'second', 'three': 'third', 'five': 'fifth', 'eight': 'eighth', 'nine': 'ninth', 'twelve': 'twelfth'}
def en_ord(n):
    w = en_num(n); i = max(w.rfind('-'), w.rfind(' ')) + 1; l = w[i:]
    return w[:i] + (SP.get(l) or (l[:-1] + 'ieth' if l.endswith('y') else l + 'th'))
def abbr(n):
    t = n % 100
    return f"{n}{'th' if 10 < t < 14 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"
for n, w in T1_NUM: assert en_num(n) == w, (n, w)
for n, w, _ in T2_ORD: assert en_ord(n) == w, (n, w)
gq = []
for n, w in T1_NUM:
    gq.append({"k": "type", "strict": True, "q": f"Schrijf in het Engels: {n}", "a": [w], "show": w, "bk": "blz. 82",
               "xw": "Na **hundred / thousand** komt **and**: one hundred **and** one." if n > 100 else "Tiental en eenheid met een **streepje**; **forty** zonder u." if n < 100 else "**one hundred** (twee woorden)."})
    gq.append({"k": "num", "q": f"Welk getal is: {w}", "a": n, "tol": 0, "bk": "blz. 82"})
for n, w, nl in T2_ORD:
    gq.append({"k": "type", "strict": True, "q": f"Schrijf voluit in het Engels: {abbr(n)} ({nl})", "a": [w], "show": w, "bk": "blz. 130",
               "xw": "Let op: first, second, third, **fifth**, **eighth**, **ninth**, **twelfth**, twent**ieth**, twenty-**first**."})
for n in (1, 2, 3, 21):
    gq.append({"k": "type", "strict": True, "q": f"Hoe kort je af: {en_ord(n)}", "a": [abbr(n)], "bk": "blz. 130", "xw": "1st (fir**st**), 2nd (seco**nd**), 3rd (thi**rd**), 21st (twenty-fir**st**); de rest met **th**."})
gq += [{"k": "gen", "g": "schrijf", "q": "", "bk": "getallen"} for _ in range(5)] + [{"k": "gen", "g": "rang", "q": "", "bk": "rangtelwoorden"} for _ in range(4)]
topics.append({"id": "getal", "nav": "Getallen", "title": "Spelling · Getallen en rangtelwoorden", "pages": "blz. 82 en 130", "bron": [82, 130], "n": 15,
    "doelen": ["Je kunt de getallen (30 – 1011) en de rangtelwoorden (1st – 21st) in het Engels lezen en goed spellen."],
    "kern": ["**Getallen:** " + " · ".join(f"{n} *{w}*" for n, w in T1_NUM),
             "Tiental + eenheid met een **streepje**: thirty-two, eighty-seven. Na **hundred** en **thousand** komt **and**: one hundred **and** one, one thousand **and** eleven.",
             "**Rangtelwoorden:** " + " · ".join(f"{abbr(n)} *{w}*" for n, w, _ in T2_ORD),
             "Je maakt een rangtelwoord meestal met **-th** (fourth, sixth). Uitzonderingen: **first, second, third**; **fifth, twelfth** (ve → f); **eighth** (één t); **ninth** (zonder e); -ty → **-tieth** (twentieth)."],
    "let": ["**forty** (40) zonder **u**, ook al is het four (4) en fourteen (14).", "**ninth** zonder e, **eighth** met maar één t, **twelfth** en **fifth** met **f**.",
            "Afkortingen: **1st, 2nd, 3rd, 21st**; de rest met **th** (4th, 12th, 20th)."],
    "qs": gq})

# ---------- spelling: lastige woorden (⇄-woorden met een spellingsvalkuil)
SPEL = [("wenkbrauwen", "eyebrows", "eye + brows"), ("sproeten", "freckles", "met **ck**"), ("steil", "straight", "**aigh**: str-aigh-t"), ("baard", "beard", "**ea**"),
        ("neef (kind van zus/broer)", "nephew", "**ph** klinkt als f"), ("nicht (kind van zus/broer)", "niece", "**ie**: n-ie-ce"), ("neef, nicht", "cousin", "**ou**: c-ou-sin"),
        ("gescheiden", "divorced", "div-**o**-rced"), ("irritant", "annoying", "**nn**"), ("vrolijk, opgewekt", "cheerful", "-ful met één **l**"),
        ("stil, rustig", "quiet", "quiet (stil) ≠ quite (tamelijk)"), ("serieus, ernstig", "serious", "-**ious**"), ("vriendelijk", "friendly", "fr-**ie**-ndly"),
        ("favoriet, lievelings-", "favourite", "Brits-Engels: fav-**our**-ite"), ("verschillend", "different", "**ff**, eindigt op -**ent**"), ("spannend, opwindend", "exciting", "e-**xc**-iting"),
        ("onthouden", "remember", "re-**m**-e-**m**-ber"), ("mis, fout", "wrong", "stomme **w**"), ("mogelijk", "possible", "**ss** en -**ible**"), ("beroemd", "famous", "-**ous**"),
        ("opdracht", "assignment", "**ss** en een stomme **g**"), ("agenda", "diary", "d-**ia**-ry"), ("aardrijkskunde", "geography", "geo-gra-**ph**-y"), ("natuur-/scheikunde", "science", "**sc**-ience"),
        ("wiskunde", "maths", "Brits: math**s**"), ("Duits", "German", "hoofdletter"), ("Nederlands", "Dutch", "hoofdletter"), ("moeilijk", "difficult", "**ff**, één l"),
        ("nuttig", "useful", "-ful met één **l**"), ("vreselijk", "awful", "**aw** + -ful met één l"), ("geweldig", "awesome", "awe + some"), ("interessant", "interesting", "inter-**est**-ing"),
        ("druk", "busy", "b-**u**-sy"), ("belangrijk", "important", "-**ant**"), ("waarschijnlijk", "probably", "prob-**ab**-ly"), ("bijna", "almost", "**al**- met één l"),
        ("ten slotte", "finally", "final + **ly**: dubbel l"), ("zonder", "without", "één woord"), ("lastig, uitdagend", "challenging", "cha-**ll**-enging"), ("jaloers", "jealous", "j-**ea**-l-**ous**"),
        ("kans", "opportunity", "o-**pp**-ortunity"), ("optreden", "performance", "-**ance**"), ("meestal", "usually", "usual + **ly**: dubbel l"), ("genoeg", "enough", "en-**ough**"),
        ("vroeg", "early", "**ea**-rly"), ("mening", "opinion", "o-**p**-inion (één p)"), ("moe", "tired", "t-**i**-red")]
sq = []
for nl, en, tip in SPEL:
    q = {"k": "type", "strict": True, "q": "Schrijf in het Engels: **" + nl + "**", "a": accepted_en(nl) if en not in ("opportunity",) else ["opportunity", "chance"], "show": en, "xw": tip, "bk": "spelling"}
    if en in CAPS: q["case"] = True
    sq.append(q)
for nl, en, tip in SPEL: assert en in accepted_en(nl) or en == "opportunity", (nl, en)
sq += [{"k": "mc", "keep": False, "q": "Welke spelling is goed? (" + nl + ")", "opts": o, "a": 0, "bk": "spelling"} for nl, o in [
    ("40", ["forty", "fourty", "fourtey"]), ("negende", ["ninth", "nineth", "nineteenth"]), ("twaalfde", ["twelfth", "twelveth", "twelvth"]), ("achtste", ["eighth", "eightth", "eigth"]),
    ("stil", ["quiet", "quite", "quit"]), ("vriendelijk", ["friendly", "freindly", "frendly"]), ("aardrijkskunde", ["geography", "geografy", "jeography"]), ("waarom", ["why", "wy", "whie"]),
    ("hij probeert", ["he tries", "he trys", "he tryes"]), ("zij kijkt", ["she watches", "she watchs", "she watchies"])]]
topics.append({"id": "spel", "nav": "Spelling", "title": "Spelling · Lastige woorden", "pages": "blz. 82-83, 85, 130-131", "bron": [], "n": 15,
    "doelen": ["Je schrijft de ⇄-woorden met een spellingsvalkuil foutloos."],
    "kern": ["Woorden die je zelf moet kunnen gebruiken (⇄) moet je ook goed **spellen**. Deze woorden gaan vaak mis:",
             "**Thema 1:** " + " · ".join(f"*{en}*: {tip}" for _, en, tip in SPEL[:20]),
             "**Thema 2:** " + " · ".join(f"*{en}*: {tip}" for _, en, tip in SPEL[20:]),
             "Tip: zeg het woord hardop zoals je het schrijft (*ex-cit-ing*, *op-por-tu-ni-ty*, *ge-o-gra-phy*) en schrijf het daarna drie keer op."],
    "let": ["**quiet** (stil) ≠ **quite** (tamelijk).", "**-ful** heeft maar één l: useful, awful, cheerful.", "Talen en nationaliteiten met een hoofdletter: **Dutch, English, French, German**."],
    "qs": sq})

ORDER = ["t1w", "t1v", "getal", "t1s", "t1g", "t2w", "t2v", "t2s", "t2g", "spel"]
topics = sorted(topics, key=lambda t: ORDER.index(t["id"]))
INSTR = "Te leren/ kennen voor deze toets zijn de woorden, zinnen en grammatica van de thema's 1 en 2 (zie blz. 82-85 en 130-133"
data = {
    "meta": {"id": "engels-pw1", "type": "leer", "brand": "Engels", "sub": "Thema 1 en 2 · Stepping Stones", "title": "Proefwerk Engels thema 1 en 2", "toets": "proefwerk", "lidw": "het",
             "examDate": "2026-11-17", "acc": False},
    "instructie": "Woorden, zinnen (Stones) en grammatica van thema 1 en 2: blz. 82-85 en 130-133.",
    "instructieVerbatim": INSTR,
    "C": "Deze oefenzin is zelf gemaakt bij de regel uit het boek.",
    "extra": "⇄-woorden leer je beide kanten op en moet je goed kunnen spellen; ➜-woorden hoef je alleen te herkennen (Engels → Nederlands).",
    "tables": TABLES,
    "bronnen": {"pages": [82, 83, 84, 85, 130, 131, 132, 133]},
    "topics": topics,
}
json.dump(data, open(f"{ROOT}/engels/proefwerk-1/data.json", "w"), ensure_ascii=False, indent=1)
print(len(topics), "onderwerpen", sum(len(t["qs"]) for t in topics), "vragen")
