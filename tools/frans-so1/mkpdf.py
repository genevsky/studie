import json,random,re,sys
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
pdfmetrics.registerFont(TTFont('DV','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DVB','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('DV',normal='DV',bold='DVB')
src,out=sys.argv[1],sys.argv[2]
D=json.load(open(src))
BLUE=colors.HexColor('#1F4E9E');RED=colors.HexColor('#D2343A');GREY=colors.HexColor('#667')
H1=ParagraphStyle('h1',fontName='DVB',fontSize=18,textColor=BLUE,spaceAfter=4)
H2=ParagraphStyle('h2',fontName='DVB',fontSize=13,textColor=BLUE,spaceBefore=8,spaceAfter=4)
P=ParagraphStyle('p',fontName='DV',fontSize=9.5,leading=13)
SM=ParagraphStyle('sm',fontName='DV',fontSize=8.5,leading=11,textColor=GREY)
C=ParagraphStyle('c',fontName='DV',fontSize=10.5,leading=13)
CB=ParagraphStyle('cb',fontName='DVB',fontSize=10.5,leading=13)
md=lambda s:re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s.replace(' (tik op 🔊)','').replace('&','&amp;').replace('<','&lt;'))
st=[]
st.append(Paragraph('Frans SO 1 · Woordenlijst om te vouwen',H1))
st.append(Paragraph(md(D['instructie'])+' Vouw het blad langs de stippellijn: dan zie je maar één kant en kun je jezelf overhoren. Zet een vinkje als je het woord kent.',P))
W=[]
for l in D['lists']:
    st.append(Paragraph(f"{l['title']} <font color='#667' size=9>· {l['sub']}</font>",H2))
    rows=[]
    for bi,b in enumerate(l['blocks']):
        for i,w in enumerate(b):
            W.append(w)
            rows.append([Paragraph(f"<b>{md(w['fr'])}</b>",C),'[  ]','',Paragraph(md(w['nl']),C),'[  ]'])
    t=Table(rows,colWidths=[62*mm,10*mm,10*mm,62*mm,10*mm],rowHeights=6.4*mm)
    ts=[('FONT',(0,0),(-1,-1),'DV',8),('TEXTCOLOR',(1,0),(1,-1),GREY),('TEXTCOLOR',(4,0),(4,-1),GREY),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('LINEAFTER',(2,0),(2,-1),0.8,GREY,None,(2,2))]
    for k in range(5,len(rows),5):ts.append(('LINEABOVE',(0,k),(-1,k),0.6,colors.HexColor('#bbc')))
    t.setStyle(TableStyle(ts));st.append(t)
st.append(PageBreak())
st.append(Paragraph('Zo leer je het',H1))
for tp in D['tips']:
    st.append(Paragraph(md(tp['h']),H2))
    for p in tp['p']:st.append(Paragraph('• '+md(p),P))
st.append(Paragraph('Geheugensteuntjes',H2))
for w in W:
    if w.get('h'):st.append(Paragraph(f"<b>{md(w['fr'])}</b> ({md(w['nl'])}): {md(w['h'])}",P))
st.append(PageBreak())
random.seed(7);ws=W[:];random.shuffle(ws);A,B=ws[:20],ws[20:30]
st.append(Paragraph('Oefen-SO',H1))
st.append(Paragraph('Doe dit op papier, zonder te spieken. Nakijken met de antwoorden op de volgende bladzijde. Let op le/la/les en accenten. Cijfer ≈ 1 + 9 × (punten / 30).',P))
st.append(Paragraph('A. Vertaal in het Frans (20 punten)',H2))
t=Table([[f"{i+1}.",Paragraph(md(w['nl']),C),'_'*34] for i,w in enumerate(A)],colWidths=[9*mm,60*mm,95*mm],rowHeights=7.1*mm)
t.setStyle(TableStyle([('FONT',(0,0),(-1,-1),'DV',10),('VALIGN',(0,0),(-1,-1),'BOTTOM'),('TEXTCOLOR',(2,0),(2,-1),colors.HexColor('#99a'))]));st.append(t)
st.append(Paragraph('B. Vertaal in het Nederlands (10 punten)',H2))
t=Table([[f"{i+21}.",Paragraph('<b>'+md(w['fr'])+'</b>',C),'_'*34] for i,w in enumerate(B)],colWidths=[9*mm,60*mm,95*mm],rowHeights=7.1*mm)
t.setStyle(TableStyle([('FONT',(0,0),(-1,-1),'DV',10),('VALIGN',(0,0),(-1,-1),'BOTTOM'),('TEXTCOLOR',(2,0),(2,-1),colors.HexColor('#99a'))]));st.append(t)
st.append(PageBreak())
st.append(Paragraph('Antwoorden oefen-SO',H1))
rows=[[f"{i+1}.",Paragraph(md(w['nl']),C),Paragraph('<b>'+md(w['fr'])+'</b>',C)] for i,w in enumerate(A)]+[[f"{i+21}.",Paragraph('<b>'+md(w['fr'])+'</b>',C),Paragraph(md(w['nl']),C)] for i,w in enumerate(B)]
t=Table(rows,colWidths=[9*mm,70*mm,85*mm]);t.setStyle(TableStyle([('FONT',(0,0),(-1,-1),'DV',10),('LINEBELOW',(0,0),(-1,-1),0.3,colors.HexColor('#dde'))]));st.append(t)
def foot(c,d):
    c.setFont('DV',7.5);c.setFillColor(GREY);c.drawString(18*mm,10*mm,'Frans SO 1 · Vocabulaire A, B en E (boek p. 52-53)');c.drawRightString(192*mm,10*mm,str(d.page))
    c.setFillColor(BLUE);c.rect(0,A4[1]-4*mm,A4[0]/3,4*mm,fill=1,stroke=0);c.setFillColor(RED);c.rect(2*A4[0]/3,A4[1]-4*mm,A4[0]/3,4*mm,fill=1,stroke=0)
SimpleDocTemplate(out,pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=14*mm,bottomMargin=16*mm,title='Frans SO 1 · woordenlijst en oefen-SO').build(st,onFirstPage=foot,onLaterPages=foot)
