import re,json,difflib
exec(open('/home/claude/nl/parse.py').read().split("def parse(")[0])
B='█'
def tok(s):return re.findall(r"\S+",s)
def norm(w):return re.sub(r"[^\wà-ÿ]","",w.lower())
def parse(fn,deel,lay):
    txt=clean(open(fn).read());L=clean(open(lay).read())
    i=txt.index('\nWerkblad 1');j=txt.index('\nAntwoordblad 1')
    an=blocks(txt[j:],'Antwoordblad')
    LL='\n'.join(l.strip() for l in L.split('\n'))
    i2=LL.index('\nWerkblad 1');j2=LL.index('\nAntwoordblad 1')
    ws=blocks(re.sub(r'(?m)^©.*$','',LL[i2:j2]),'Werkblad')
    sheets=[];bad=0
    for n in sorted(ws):
        title,body=ws[n];_,abody=an[n]
        wi=items(body);ai=items(abody)
        assert len(wi)==16 and len(ai)==16,(deel,n,len(wi),len(ai))
        Q=[]
        for (k,wl),(k2,al) in zip(wi,ai):
            ws_=joinlines(wl)
            m=re.search(r'\(([^()]*)\)\s*$',ws_)
            if not m: print('NOHINT',deel,n,k,ws_[-80:]);bad+=1;continue
            hint=m.group(1).strip();sent=ws_[:m.start()].strip()
            sent=re.sub(r'\.{4,}',' '+B+' ',sent)
            wt=tok(sent);at=tok(joinlines(al))
            wn=[norm(w) if w!=B else B for w in wt];an_=[norm(w) for w in at]
            sm=difflib.SequenceMatcher(None,wn,an_,autojunk=False)
            # map: for each blank, take answer tokens in the gap aligned to it
            ops=sm.get_opcodes();ans=[];end=0
            for tag,i1,i2,j1,j2 in ops:
                if tag in('replace','insert','delete') and any(wn[x]==B for x in range(i1,i2)) :
                    # split gap tokens among blanks (usually 1)
                    seg=at[j1:j2]
                    # strip trailing/leading punctuation-only differences
                    ans.append(' '.join(seg))
                if tag=='equal': end=j2
                elif tag!='insert': end=max(end,j2)
            nb=wt.count(B)
            # sentence end in answer tokens: last equal block end
            eqs=[op for op in ops if op[0]=='equal'];lastEq=eqs[-1][4] if eqs else 0
            # if blank is last token(s) of sentence, gap may run into explanation: cut answer at first word
            if len(ans)!=nb: print('NB',deel,n,k,nb,ans,sent[:80]);bad+=1;continue
            fixed=[]
            for a in ans:
                w=a.split()
                fixed.append(a)
            aT=at[:lastEq];expl=' '.join(at[lastEq:])
            # handle blank at sentence end: answer swallowed explanation
            if wn[-1]==B or (len(wn)>1 and wn[-2]==B and not norm(wt[-1])):
                full=' '.join(at)
                a=fixed[-1].split();cut=[];
                for w in a:
                    cut.append(w)
                    if re.search(r'[.!?:;]$|[.!?]’$',w):break
                fixed[-1]=' '.join(cut);expl=' '.join(a[len(cut):])+(' '+expl if expl else '')
                aT=at[:lastEq]+cut
            # deel 1: category in parentheses at start of explanation
            cat='';mm=re.match(r'^\(([^()]{3,80})\)\s*(.*)$',expl.strip())
            if mm:cat,expl=mm.group(1),mm.group(2)
            fx=[re.sub(r'^[‘’\'"(]+|[.,;:!?’\'")]+$','',a) for a in fixed]
            if any(not a or len(a.split())>3 for a in fx): print('ANS?',deel,n,k,fx,'|',sent[:70]);bad+=1
            full=' '.join(aT);disp=full;ok2=True
            for a in fx:
                p=disp.find(a)
                if p<0: ok2=False;break
                disp=disp[:p]+B+disp[p+len(a):]
            if not ok2: print('DISP',deel,n,k,fx,full[:90]);bad+=1
            Q.append({'raw':joinlines(al),'d':disp,'n':k,'s':sent,'v':hint,'a':fx,'cat':cat,'x':expl.strip(),'full':' '.join(aT)})
        sheets.append({'id':f'{deel}-{n}','deel':deel,'nr':n,'title':title.strip('() '),'q':Q})
    return sheets,bad
S1,b1=parse('wb1r.txt',1,'wb1.txt');S2,b2=parse('wb2r.txt',2,'wb2.txt')
S=S1+S2;json.dump(S,open('sheets.json','w'),ensure_ascii=False,indent=1)
print(len(S),sum(len(s['q']) for s in S),'bad',b1+b2)
