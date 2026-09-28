import json,random,re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import *
from reportlab.pdfgen import canvas
random.seed(7)
D=json.load(open('data.json'))
F='/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('S',F+'DejaVuSans.ttf'));pdfmetrics.registerFont(TTFont('SB',F+'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('S',normal='S',bold='SB',italic='S',boldItalic='SB')
TEAL=colors.HexColor('#0E7C86');INK=colors.HexColor('#12292E');SOFT=colors.HexColor('#DCEBE9');SUN=colors.HexColor('#F2B01E');MUT=colors.HexColor('#526A6E')
B=ParagraphStyle('b',fontName='S',fontSize=9.5,leading=13.5,textColor=INK)
sm=ParagraphStyle('sm',parent=B,fontSize=8.5,leading=12,textColor=MUT)
H1=ParagraphStyle('h1',parent=B,fontName='SB',fontSize=20,leading=24,textColor=TEAL,spaceAfter=4)
H2=ParagraphStyle('h2',parent=B,fontName='SB',fontSize=13,leading=17,textColor=TEAL,spaceBefore=10,spaceAfter=5)
H3=ParagraphStyle('h3',parent=B,fontName='SB',fontSize=10.5,leading=14,spaceBefore=6,spaceAfter=2)
BL=ParagraphStyle('bl',parent=B,leftIndent=10,bulletIndent=0)
def md(s): return re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s.replace('&','&amp;'))
def P(t,s=B): return Paragraph(md(t),s)
def foot(c,d):
    c.saveState();c.setFont('S',8);c.setFillColor(MUT);c.drawString(18*mm,10*mm,'Tijdreis Geschiedenis · Hoofdstuk 1 Jagers en boeren');c.drawRightString(A4[0]-18*mm,10*mm,'Pagina %d'%d.page);c.restoreState()
doc=SimpleDocTemplate('Geschiedenis_H1_spiekbrief_en_oefentoets.pdf',pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=16*mm,bottomMargin=18*mm,title='Geschiedenis hoofdstuk 1: spiekbrief en oefentoets',author='Tijdreis Geschiedenis')
W=A4[0]-36*mm
st=[]
# --- p1 tijdvakken
st+=[P('Tijdreis Geschiedenis',H1),P('Hoofdstuk 1 · Jagers en boeren · spiekbrief en oefentoets',sm),Spacer(1,8)]
st+=[P('De tien tijdvakken',H2),P('Leer de naam (voorkant) en de jaartallen (achterkant). Dek de rechterkolom af en test jezelf.',sm),Spacer(1,4)]
rows=[[P('<b>Nr</b>'),P('<b>Tijdvak</b>'),P('<b>Jaartallen</b>'),P('<b>Denk aan</b>')]]
for t in D['tijdvakken']: rows.append([P(str(t['n'])),P('<b>%s</b>'%t['name']),P(t['yrs']),P(t['tag'],sm)])
T=Table(rows,colWidths=[10*mm,62*mm,38*mm,W-110*mm],repeatRows=1)
T.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),SOFT),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
st+=[T,Spacer(1,10)]
w=D['eezelsbrug'].split(' ')
st+=[P('Ezelsbruggetje',H3),P(' '.join('<font color="#B07800"><b>%s</b></font>%s'%(x[0],x[1:]) for x in w),ParagraphStyle('m',parent=B,fontSize=13,leading=19)),
     P(' · '.join('%s = %s'%(w[i][0],D['eezelsbrugUitleg'][i]) for i in range(10)),sm),Spacer(1,4),
     P('De namen komen uit de standaardindeling. Controleer ze met het kaartjesblad van de leraar.',sm)]
st.append(PageBreak())
# --- begrippen
st+=[P('Begrippen (p. 60-61)',H1),P('Dit zijn de 32 begrippen van de begrippenlijst in je boek, met de omschrijving uit het boek. Op de toets krijg je de omschrijving en noem jij het begrip. Dek de linkerkolom af en probeer het begrip te noemen. Onder elke omschrijving staat een steuntje om het te onthouden.',sm),Spacer(1,6)]
for p,tt in [('1.1','De eerste mensen'),('1.2','Jagers worden boeren'),('1.3','Denken en doen'),('1.4','Leven langs de Nijl')]:
    rows=[[P('<b>%s</b>'%x['t']),P('%s<br/><font size="8" color="#526A6E">%s</font>'%(x['d'].replace('&','&amp;'),x['h']))] for x in D['begrippen'] if x['p']==p and not x.get('x')]
    T=Table(rows,colWidths=[52*mm,W-52*mm])
    T.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),('BACKGROUND',(0,0),(0,-1),colors.HexColor('#EEF4F3'))]))
    st+=[KeepTogether([P('%s %s'%(p,tt),H2),T])]
ext=[x for x in D['begrippen'] if x.get('x')]
rows=[[P('<b>%s</b>'%x['t']),P(x['d'])] for x in ext]
T=Table(rows,colWidths=[52*mm,W-52*mm]);T.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
st+=[KeepTogether([P('Extra woorden uit de tekst (niet op de begrippenlijst)',H2),P('Handig om te snappen, maar eerst de 32 hierboven leren.',sm),Spacer(1,3),T])]
st.append(PageBreak())
# --- samenvatting
st+=[P('Samenvatting',H1)]
for s in D['summary']:
    st+=[P('%s · %s (%s)'%(s['id'],s['title'],s['pages']),H2),P('<b>%s</b>'%s['one'],B)]
    for sec in s['sections']:
        st.append(P(sec['h'],H3))
        for pt in sec['pts']: st.append(Paragraph(md(pt),BL,bulletText='•'))
st.append(PageBreak())
# --- tijdlijn
st+=[P('Tijdlijn',H1),P('De geel gemarkeerde regels staan op de tijdlijn van tijdvak 1 in je boek (p. 60-61). Let op: bij v.C. loopt het getal terug, dus 10.000 v.C. is ouder dan 9000 v.C. Niet op schaal.',sm),Spacer(1,6)]
rows=[[P('<b>%s</b>'%e['w']),P(e['l'])] for e in D['timeline']]
T=Table(rows,colWidths=[48*mm,W-48*mm]);sty=[('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]
[sty.append(('BACKGROUND',(0,i),(-1,i),colors.HexColor('#FBE7A8'))) for i,e in enumerate(D['timeline']) if e.get('core')];T.setStyle(TableStyle(sty));st+=[T,Spacer(1,10)]
st+=[P('Jager of boer?',H2)]
j=[x['t'] for x in D['sort'] if x['s']=='j'];b=[x['t'] for x in D['sort'] if x['s']=='b']
T=Table([[P('<b>Jager-verzamelaars</b>'),P('<b>Boeren</b>')],[[P(x,BL) for x in j],[P(x,BL) for x in b]]],colWidths=[W/2,W/2])
T.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),SOFT),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),.5,colors.HexColor('#CBDAD8')),('LINEAFTER',(0,0),(0,-1),.5,colors.HexColor('#CBDAD8'))]))
st+=[T,PageBreak()]
# --- studieplan
st+=[P('Studieplan in vijf korte rondes',H1),P('Verspreid leren werkt beter dan één keer veel. Maak er dagen van. Elke ronde duurt ongeveer 20 minuten.',sm),Spacer(1,6)]
rows=[[P('<b>Ronde</b>'),P('<b>Wat doe je?</b>')],
 [P('1'),P('Lees paragraaf 1.1 en 1.2 (samenvatting). Leer de tien tijdvakken met het ezelsbruggetje. Doe de begrippen van 1.1 en 1.2 met de kaartjes.')],
 [P('2'),P('Lees 1.3 en 1.4. Kaartjes: begrippen van 1.3 en 1.4, plus de kaartjes van ronde 1 die vandaag terugkomen.')],
 [P('3'),P('Alle begrippen door elkaar (omschrijving → begrip). Bouw de tijdlijn met het spel. Teken de tijdlijn uit je hoofd op een blanco blad.')],
 [P('4'),P('Oefentoets. Kijk wat fout ging en oefen precies die kaartjes. Doe de leg uit-vragen.')],
 [P('5 (dag voor de toets)'),P('Alleen kaartjes die nog niet zitten. Tijdvakken zeggen met de jaartallen. Tijdlijn uit je hoofd. Vroeg naar bed.')]]
T=Table(rows,colWidths=[32*mm,W-32*mm]);T.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),SOFT),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
st+=[T,Spacer(1,10),P('Tip: zet een kruisje bij elk begrip dat je twee dagen achter elkaar goed had.',sm),PageBreak()]
# --- leerdoelen, vergelijk, tips
st+=[P('Leerdoelen, vergelijking en toetstips',H1),P('Kun je dit uitleggen zonder in het boek te kijken? Zet een vinkje.',sm)]
for s_ in D['summary']:
    st.append(P('Paragraaf %s · %s'%(s_['id'],s_['title']),H3))
    for g in D['leerdoelen'][s_['id']]: st.append(Paragraph(md(g.replace('Je kunt ','')),BL,bulletText='[  ]'))
st+=[P('Vergelijk: jager of boer',H2)]
rows=[[P('<b>%s</b>'%c) if i==0 or j==0 else P(c) for j,c in enumerate(r)] for i,r in enumerate(D['compare'])]
T=Table(rows,colWidths=[24*mm,(W-24*mm)/2,(W-24*mm)/2]);T.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),SOFT),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
st.append(T)
for t_ in D['tips']:
    st.append(P(t_['h'],H3))
    for p_ in t_['p']: st.append(Paragraph(md(p_),BL,bulletText='\u2022'))
st.append(PageBreak())
# --- oefentoets
random.seed(11)
begs=[x for x in D['begrippen'] if not x.get('x')];pick=random.sample(begs,12);mcs=random.sample(D['mc'],8)
st+=[P('Oefentoets',H1),P('Naam: ______________________     Datum: ____________     Tijd: 30 minuten',sm),Spacer(1,6),P('Deel A. Noem het begrip (12 punten)',H2)]
for i,x in enumerate(pick,1):
    st+=[P('<b>%d.</b> %s'%(i,x['d'])),Spacer(1,3),P('Begrip: ____________________________________________'),Spacer(1,6)]
st+=[P('Deel B. Meerkeuze (8 punten)',H2)]
ans=[]
for i,m in enumerate(mcs,13):
    o=list(enumerate(m['o']));random.shuffle(o);L='ABCD'
    ans.append((i,L[[k for k,(orig,_) in enumerate(o) if orig==m['a']][0]],m['w']))
    st.append(KeepTogether([P('<b>%d.</b> %s'%(i,m['q'])),*[Paragraph('%s. %s'%(L[k],t.replace('&','&amp;')),ParagraphStyle('o',parent=B,leftIndent=14)) for k,(_,t) in enumerate(o)],Spacer(1,6)]))
opens=random.sample(D['open'],4)
st+=[P('Deel C. Open vragen (4 vragen)',H2)]
for i,o in enumerate(opens,21):
    st+=[P('<b>%d.</b> %s'%(i,o['q'])),Spacer(1,4)]+[P('_'*78) for _ in range(2)]+[Spacer(1,8)]
st+=[PageBreak(),P('Antwoorden oefentoets',H1),P('Deel A',H2)]
for i,x in enumerate(pick,1): st.append(P('<b>%d.</b> %s'%(i,x['t'])))
st.append(P('Deel B',H2))
for i,a,w in ans: st.append(P('<b>%d.</b> %s  <font color="#526A6E">(%s)</font>'%(i,a,w)))
st.append(P('Deel C: wat erin moet staan',H2))
for i,o in enumerate(opens,21):
    st.append(P('<b>%d.</b> %s <font color="#526A6E">(%s)</font>'%(i,' / '.join(o['pts']),'minimaal %d van %d'%(o['need'],len(o['pts'])) if o['need']<len(o['pts']) else 'alles')))
st.append(Spacer(1,6));st.append(P('Cijfer ter indicatie: 1 + 9 × (aantal goed ÷ 20). Deel A en B zijn 1 punt per vraag; Deel C tel je zelf na met de punten hierboven.',sm))
st.append(PageBreak())
# --- kaartjes (voorkant / achterkant)
tv=D['tijdvakken']
def cards(kind):
    rows=[];
    for r in range(5):
        row=[]
        for c in range(2):
            t=tv[r*2+c]
            if kind=='f': row.append(P('<font size=8 color="#526A6E">Tijdvak %d</font><br/><b>%s</b>'%(t['n'],t['name']),ParagraphStyle('c',parent=B,fontSize=14,leading=19,alignment=1)))
            else: row.append(P('<b>%s</b><br/><font size=9 color="#526A6E">%s</font>'%(t['yrs'],t['tag']),ParagraphStyle('c',parent=B,fontSize=16,leading=22,alignment=1)))
        rows.append(row)
    if kind=='b': rows=[r[::-1] for r in rows]   # spiegelen voor dubbelzijdig printen
    T=Table(rows,colWidths=[W/2]*2,rowHeights=[42*mm]*5)
    T.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.8,MUT),('VALIGN',(0,0),(-1,-1),'MIDDLE')]));return T
st+=[P('Kaartjes: voorkant (naam)',H1),P('Knip uit. Print dubbelzijdig (kort of lang draaien): de achterkant staat gespiegeld op de volgende pagina, zodat naam en jaartallen achter elkaar zitten.',sm),Spacer(1,6),cards('f'),PageBreak(),P('Kaartjes: achterkant (jaartallen)',H1),Spacer(1,6),cards('b')]
doc.build(st,onFirstPage=foot,onLaterPages=foot)
