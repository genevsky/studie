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
st+=[P('Tijdlijn van tijdvak 1 (p. 60-61)',H2),P('Let op: bij v.C. loopt het getal terug, dus 10.000 v.C. is ouder dan 9000 v.C. Vouw of dek de rechterkolom af en test jezelf.',sm),Spacer(1,4)]
rows=[[P('<b>%s</b>'%e['w']),P(e['l'])] for e in D['timeline'] if e.get('core')]
T=Table(rows,colWidths=[40*mm,W-40*mm]);T.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('BACKGROUND',(0,0),(0,-1),colors.HexColor('#FBE7A8'))]))
st+=[T]
st.append(PageBreak())
# --- begrippen
st+=[P('Begrippen (p. 60-61)',H1),P('Dit zijn de 33 begrippen van de begrippenlijst in je boek, met de omschrijving uit het boek. Op de toets krijg je de omschrijving en noem jij het begrip. <b>Vouw het blad dubbel langs de stippellijn</b>: dan zie je alleen de omschrijvingen. Noem het begrip, klap open en kijk. Onder elk begrip staat een steuntje om het te onthouden.',sm),Spacer(1,6)]
for p,tt in sorted(D['paragrafen'].items()):
    rows=[[P(x['d'].replace('&','&amp;')),P('<b>%s</b><br/><font size="8" color="#526A6E">%s</font>'%(x['t'],x['h']))] for x in D['begrippen'] if x['p']==p and not x.get('x')]
    T=Table(rows,colWidths=[W/2,W/2])
    T.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),('LEFTPADDING',(1,0),(1,-1),10),('RIGHTPADDING',(0,0),(0,-1),10),('LINEAFTER',(0,0),(0,-1),1,MUT,None,(3,3)),('BACKGROUND',(1,0),(1,-1),colors.HexColor('#EEF4F3'))]))
    st+=[KeepTogether([P('%s %s'%(p,tt),H2),T])]
st.append(PageBreak())
# --- vragen 1.1-1.4 (om te vouwen)
st+=[P('Vragen van 1.1 t/m 1.4',H1),P('Dit zijn de vragen bij het begin van elke paragraaf. <b>Vouw het blad dubbel langs de stippellijn</b>: lees de vraag, zeg of schrijf je antwoord en klap open om te kijken.',sm),Spacer(1,4)]
for p_ in ['1.1','1.2','1.3','1.4']:
    tt=D['paragrafen'][p_]
    rows=[[P('<b>%s</b>'%v['q']),P('<br/>'.join('• '+md(x) for x in v['pts'])+('<br/><font size=8 color="#526A6E">Noem er minstens %d.</font>'%v['need'] if v['need']<len(v['pts']) else ''),ParagraphStyle('va',parent=B,fontSize=8.8,leading=11.5))] for v in D['vragen'] if v['p']==p_]
    T=Table(rows,colWidths=[W/2,W/2])
    T.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#CBDAD8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),('LEFTPADDING',(1,0),(1,-1),10),('RIGHTPADDING',(0,0),(0,-1),10),('LINEAFTER',(0,0),(0,-1),1,MUT,None,(3,3)),('BACKGROUND',(1,0),(1,-1),colors.HexColor('#EEF4F3'))]))
    st+=[P('%s %s'%(p_,tt),H2),T]
st.append(PageBreak())
# --- oefentoets
random.seed(11)
begs=[x for x in D['begrippen'] if not x.get('x')];pick=random.sample(begs,12)
st+=[P('Oefentoets',H1),P('Naam: ______________________     Datum: ____________     Tijd: 30 minuten',sm),Spacer(1,6),P('Deel A. Noem het begrip (12 punten)',H2)]
for i,x in enumerate(pick,1):
    st+=[P('<b>%d.</b> %s'%(i,x['d'])),Spacer(1,3),P('Begrip: ____________________________________________'),Spacer(1,6)]
tv=D['tijdvakken'];tvs=random.sample(tv,4);tvn=random.sample([t for t in tv if t not in tvs],3)
st+=[P('Deel B. Tijdvakken en tijdlijn (10 punten)',H2)]
n=13
for t in tvs: st+=[P('<b>%d.</b> Welke jaartallen horen bij: <b>%s</b>?  ____________________'%(n,t['name'])),Spacer(1,6)];n+=1
for t in tvn: st+=[P('<b>%d.</b> Welk tijdvak is <b>%s</b>?  ______________________________________'%(n,t['yrs'])),Spacer(1,6)];n+=1
core=[e for e in D['timeline'] if e.get('core')];cs=random.sample(core,3)
for e in cs: st+=[P('<b>%d.</b> Wat gebeurde er in <b>%s</b>?  ______________________________________'%(n,e['w'])),Spacer(1,6)];n+=1
opens=[v for v in random.sample(D['vragen'],4)]
st+=[P('Deel C. Vragen uit de paragrafen (4 vragen)',H2)]
for i,o in enumerate(opens,n):
    st+=[P('<b>%d.</b> %s'%(i,o['q'])),Spacer(1,4)]+[P('_'*78) for _ in range(3)]+[Spacer(1,8)]
st+=[PageBreak(),P('Antwoorden oefentoets',H1),P('Deel A',H2)]
for i,x in enumerate(pick,1): st.append(P('<b>%d.</b> %s'%(i,x['t'])))
st.append(P('Deel B',H2));n=13
for t in tvs: st.append(P('<b>%d.</b> %s'%(n,t['yrs'])));n+=1
for t in tvn: st.append(P('<b>%d.</b> %s'%(n,t['name'])));n+=1
for e in cs: st.append(P('<b>%d.</b> %s'%(n,e['l'])));n+=1
st.append(P('Deel C: wat erin moet staan',H2))
for i,o in enumerate(opens,n):
    st.append(P('<b>%d.</b> %s <font color="#526A6E">(%s)</font>'%(i,' / '.join(md(x) for x in o['pts']),'minimaal %d'%o['need'] if o['need']<len(o['pts']) else 'alles')))
st.append(Spacer(1,6));st.append(P('Cijfer ter indicatie: 1 + 9 × (punten ÷ 26). Deel A en B: 1 punt per vraag. Deel C: 1 punt per vraag als je genoeg punten noemt.',sm))
st.append(PageBreak())
# --- kaartjes (voorkant / achterkant)
tv=D['tijdvakken']
CF=ParagraphStyle('cf',parent=B,fontSize=13,leading=17,alignment=1)
CBK=ParagraphStyle('cb',parent=B,fontSize=15,leading=20,alignment=1)
rows=[[P('<font size=8 color="#526A6E">Tijdvak %d</font><br/><b>%s</b>'%(t['n'],t['name']),CF),P('<b>%s</b><br/><font size=9 color="#526A6E">%s</font>'%(t['yrs'],t['tag']),CBK)] for t in tv]
T=Table(rows,colWidths=[W/2]*2,rowHeights=[22.5*mm]*10)
T.setStyle(TableStyle([('BOX',(0,0),(-1,-1),.8,MUT),('LINEBELOW',(0,0),(-1,-2),.8,MUT),('LINEAFTER',(0,0),(0,-1),1.2,MUT,None,(4,3)),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BACKGROUND',(1,0),(1,-1),colors.HexColor('#EEF4F3'))]))
st+=[P('Kaartjes: tijdvakken om te vouwen',H1),P('Print enkelzijdig. <b>Vouw het blad dubbel langs de stippellijn</b> (links naam, rechts jaartallen). Zie je de naam, noem dan de jaartallen, en draai om. Wil je losse kaartjes? Knip dan na het vouwen langs de dichte lijnen: dan heb je tien kaartjes met voor- en achterkant.',sm),Spacer(1,6),T]
doc.build(st,onFirstPage=foot,onLaterPages=foot)
