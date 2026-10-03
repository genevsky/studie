import re,json,sys
def clean(t):
    t=t.replace('­','').replace('ﬁ','fi').replace('ﬂ','fl')
    return t
def blocks(txt,head):
    # split into sections starting with "Werkblad N" or "Antwoordblad N"
    out={}
    parts=re.split(r'\n(?=(?:%s) (\d+)\b[^\n]*\n)'%head,txt)
    for m in re.finditer(r'(?ms)^(%s) (\d+)\b([^\n]*)\n(.*?)(?=^(?:Werkblad|Antwoordblad) \d+\b|\Z)'%head,txt):
        out[int(m.group(2))]=(m.group(3).strip(),m.group(4))
    return out
NOISE=re.compile(r'^(© Alex Reuneker, 2016|\d+|Oefeningen werkwoordspelling, deel \d|Antwoordbladen|Werkbladen|[ivx]+)$')
def items(body):
    lines=[l.rstrip() for l in body.split('\n')]
    lines=[l for l in lines if l.strip() and not NOISE.match(l.strip())]
    its=[];cur=None
    for l in lines:
        m=re.match(r'^(\d{1,2})\. (.*)$',l.strip())
        if m and (cur is None or int(m.group(1))==cur[0]+1):
            if cur:its.append(cur)
            cur=[int(m.group(1)),[m.group(2)]]
        elif cur: cur[1].append(l.strip())
    if cur:its.append(cur)
    return its
def joinlines(ls):
    s=''
    for l in ls:
        if not s:s=l;continue
        if s.endswith('-') and not s.endswith(' -') and re.match(r'[a-zà-ÿ]',l):
            s=s[:-1]+l   # hyphen break
        else: s+=' '+l
    return re.sub(r'\s+',' ',s).strip()
def parse(fn,deel):
    txt=clean(open(fn).read())
    i=txt.index('\nWerkblad 1');j=txt.index('\nAntwoordblad 1')
    ws=blocks(txt[i:j],'Werkblad');an=blocks(txt[j:],'Antwoordblad')
    sheets=[]
    for n in sorted(ws):
        title,body=ws[n];ititle,abody=an[n]
        wi=items(body.split('\n',2)[-1] if 'Vul steeds' in body else body)
        ai=items(abody)
        assert len(wi)==16,(deel,n,len(wi));assert len(ai)==16,(deel,n,len(ai))
        Q=[]
        for (k,wl),(k2,al) in zip(wi,ai):
            ws_=joinlines(wl)
            m=re.match(r'^(.*)\(([^()]*)\)\s*$',ws_)
            sent,hint=m.group(1).strip(),m.group(2).strip()
            # answer: first line(s) until "(category)" then explanation
            at=joinlines(al)
            mm=re.match(r'^(.*?)\s*\(([^()]*(?:persoonsvorm|deelwoord|gebiedende|infinitief|bijvoeglijk|wijs|naamwoord|onregelmatig|origine)[^()]*)\)\s*(.*)$',at)
            if not mm: print('NOCAT',deel,n,k,at[:120]);continue
            asent,cat,expl=mm.group(1),mm.group(2),mm.group(3)
            segs=re.split(r'\s*\.{4,}\s*',sent)
            # find answers between segments
            ans=[];pos=0;ok=True;a2=asent
            def nz(x):return re.sub(r'\s+',' ',x).strip()
            pre=segs[0]
            if not a2.startswith(pre.rstrip()):
                ok=False
            rest=a2[len(pre.rstrip()):].lstrip() if ok else a2
            for sg in segs[1:]:
                sg2=sg.strip()
                if sg2:
                    # answer is up to the next occurrence of sg2 prefix (first 12 chars)
                    key=sg2[:min(len(sg2),14)]
                    idx=rest.find(key) if key[0] not in '.,;:!?’\'' else rest.find(key)
                    if idx<0: ok=False;break
                    ans.append(rest[:idx].strip());rest=rest[idx+len(sg2):].lstrip() if rest[idx:idx+len(sg2)]==sg2 else rest[idx:]
                else:
                    ans.append(rest.strip().rstrip('.!?'));rest=''
            if not ok or any(not a or len(a.split())>4 for a in ans):
                print('CHECK',deel,n,k,'|',sent[:90],'||',asent[:110],'=>',ans)
            Q.append({'n':k,'s':sent,'v':hint,'a':ans,'cat':cat,'x':expl})
        sheets.append({'id':f'{deel}-{n}','deel':deel,'nr':n,'title':title.strip('() ') ,'q':Q})
    return sheets
S=parse('wb1r.txt',1)+parse('wb2r.txt',2)
json.dump(S,open('sheets.json','w'),ensure_ascii=False,indent=1)
print(len(S),sum(len(s['q']) for s in S))
