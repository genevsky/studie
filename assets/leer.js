/* Leer-app: sobere studie-app voor zaakvakken (biologie e.d.). Vier tabs: Vandaag (dagplan), Leren (kern per onderwerp), Oefenen (overhoren per onderwerp, fouten komen terug), Proefwerk (oefenproefwerk met cijfer). Leest window.EXAM (type 'leer'). */
(function(){
'use strict';
const D=window.EXAM,M=D.meta,T=D.topics;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* md: **vet**, *schuin* en {a/b} als staande breuk */
const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*([^*]+?)\*/g,'<i>$1</i>').replace(/\{([^{}\/]+)\/([^{}]+)\}/g,'<span class="fr"><i>$1</i><i>$2</i></span>');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const view=$('#view');document.title=M.title;$('#brand').textContent=M.brand;$('#sub').textContent=M.sub;
const TOETS=M.toets||'toets',LW=M.lidw||'de',HT=LW+' '+TOETS; /* lidw: 'het' proefwerk, 'de' toets */
let cleanup=()=>{},CUR='start';

/* ---- voortgang (zelfde vorm als de andere apps, zodat sync.js kan samenvoegen) ---- */
const store={get(){try{return JSON.parse(localStorage.getItem('studie:'+M.id))||{}}catch(e){return{}}},set(v){try{localStorage.setItem('studie:'+M.id,JSON.stringify(v))}catch(e){}if(window.StudieSync)StudieSync.changed()}};
const DEF=()=>({lb:{},best:{},wrong:{},tday:{},exam:null});
let S=Object.assign(DEF(),store.get());
const DAYMS=864e5,today=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/DAYMS);
if(S.exam==null&&M.examDate)S.exam=Math.floor(Date.parse(M.examDate)/DAYMS);
function mark(k,ok){const e=S.lb[k];S.lb[k]={b:ok?Math.min(4,(e?e.b:0)+1):0,d:today(),t:Date.now()};if(ok){if(S.wrong[k]>0)S.wrong[k]=-Date.now()}else S.wrong[k]=Date.now()}

/* elk onderwerp: begrippen worden typ-vragen, plus de vragen uit de data (papier-opdrachten tellen niet mee) */
const ITEMS={};T.forEach(t=>{ITEMS[t.id]=[...(t.beg||[]).map(b=>({k:'type',q:'Welk begrip hoort hierbij? '+b[1],a:[b[0]],show:b[0],key:t.id+':b:'+b[0],beg:1})),
  ...t.qs.map((q,i)=>Object.assign({key:t.id+':'+i},q))].map(q=>Object.assign(q,{tid:t.id}))});
const scored=id=>ITEMS[id].filter(q=>q.k!=='paper');
function mastery(id){const it=scored(id),seen=it.filter(q=>S.lb[q.key]).length,ok=it.filter(q=>S.lb[q.key]&&S.lb[q.key].b>=1).length;return{seen,ok,n:it.length,p:ok/it.length}}
function status(id){const m=mastery(id);return !m.seen?'new':m.p<.5?'red':m.p<.85?'amber':'green'}
const SLABEL={new:'nog niet geoefend',red:'nog veel fout',amber:'bijna',green:'zit erin'};
function ready(){const avg=T.reduce((a,t)=>a+mastery(t.id).p,0)/T.length;return Math.round(100*(.65*avg+.35*(S.best.pw||0)))}
const save=()=>{S.pct=ready();const all=T.flatMap(t=>scored(t.id));S.stats={seen:all.filter(q=>S.lb[q.key]).length,total:all.length,unit:'vragen'};S.ts=Date.now();store.set(S);header()};
function header(){$('#lvlName').textContent='Klaar: '+ready()+'%';$('#lvlBar').style.width=ready()+'%'}
const grade=p=>Math.max(1,Math.round((1+9*p)*10)/10).toFixed(1).replace('.',',');
/* NFC: accenten als één teken; alle soorten apostrof tellen als ' */
const nrm=s=>String(s||'').normalize('NFC').trim().toLowerCase().replace(/[’‘ʼ`´′]/g,"'").replace(/'\s+/g,"'").replace(/[.!?,;:]+$/,'').replace(/\s+/g,' ');
const nrmS=s=>nrm(s).replace(/[,.!?;:]/g,'').replace(/\s+/g,' ').trim(); /* streng: alleen leestekens tellen niet */
const deacc=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/œ/g,'oe');
/* breuken: '-1 1/18', '−19/18', '2,75', '7' -> {n,d,simple} of null */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a};
function frac(s){s=String(s).trim().replace(/[−–]/g,'-').replace(/\s+/g,' ').replace(/ ?\/ ?/g,'/');let m;
  if((m=s.match(/^(-?)(\d+)$/)))return{n:(m[1]?-1:1)*+m[2],d:1,simple:true};
  if((m=s.match(/^(-?)(\d+)[.,](\d+)$/))){const d=10**m[3].length,n=+m[2]*d+ +m[3];return{n:(m[1]?-1:1)*n,d,simple:true}}
  if((m=s.match(/^(-?)(\d+)\/(\d+)$/))&&+m[3])return{n:(m[1]?-1:1)*+m[2],d:+m[3],simple:gcd(+m[2],+m[3])===1||+m[2]===0};
  if((m=s.match(/^(-?)(\d+) (\d+)\/(\d+)$/))&&+m[4])return{n:(m[1]?-1:1)*(+m[2]*+m[4]+ +m[3]),d:+m[4],simple:gcd(+m[3],+m[4])===1&&+m[3]<+m[4]};
  return null}
const lev=(a,b)=>{const m=a.length,n=b.length;let p=[...Array(n+1).keys()];for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]};
const near=(a,list)=>{a=nrm(a).replace(/^(de|het|een) /,'');return list.map(w=>nrm(w).replace(/^(de|het|een) /,'')).some(w=>w===a||(w.length>5&&lev(w,a)<=1))};
const num=s=>parseFloat(String(s).replace(',','.').replace(/[^0-9.\-]/g,''));
$('#strata').innerHTML=['#3BB273','#8BC34A','#F2B01E','#E07B39','#B0418F'].map(c=>`<i style="background:${c}"></i>`).join('');

/* ---- tabs ---- */
const ICON={start:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 leer:'<path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/>',
 oef:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 pw:'<path d="M5 3h11l3 3v15H5z"/><path d="M9 11l2 2 4-4"/>'};
const TABS=[['start','Vandaag'],['leer','Leren'],['oef','Oefenen'],['pw',TOETS[0].toUpperCase()+TOETS.slice(1)]];
$('#tabs').innerHTML=TABS.map(t=>`<button class="tab" data-tab="${t[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[t[0]]}</svg>${t[1]}</button>`).join('');
$$('.tab').forEach(b=>b.addEventListener('click',()=>go(b.dataset.tab)));
const V={};
function go(t,arg){CUR=t;cleanup();cleanup=()=>{};const tab=t==='bron'?'leer':t;$$('.tab').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false'));V[t](arg);window.scrollTo(0,0);try{history.replaceState(null,'','#'+t+(arg?':'+arg:''))}catch(e){}}
const on=(sel,fn,root=view)=>$$(sel,root).forEach(e=>e.addEventListener('click',()=>fn(e)));
const act=()=>on('[data-go]',e=>{const [t,x]=e.dataset.go.split(':');go(t,x)});
const tname=t=>t.nav+' · '+t.title;
const dot=id=>`<i class="lr-dot ${status(id)}" title="${SLABEL[status(id)]}"></i>`;

/* ---- VANDAAG: dagplan. Nieuwe onderwerpen verdeeld over de dagen tot de dag vóór de toets; die dag: oefenproefwerk. ---- */
function plan(){const n=S.exam!=null?S.exam-today():null,started=t=>mastery(t.id).seen>0,isToday=k=>S.tday[k]===today();
  const fresh=T.filter(t=>!started(t)),doneT=T.filter(t=>isToday(t.id)),weak=T.filter(t=>started(t)&&status(t.id)!=='green'&&!isToday(t.id));
  const base={n,doneT,rep:weak.length>0&&!isToday('mix')};
  if(n==null)return Object.assign(base,{msg:'Vul de datum in. Dan maak ik een plan per dag.',topics:fresh.slice(0,2),pw:false});
  if(n<0)return Object.assign(base,{msg:HT[0].toUpperCase()+HT.slice(1)+' is geweest. Goed gedaan!',topics:[],rep:false,pw:false});
  if(n===0)return Object.assign(base,{msg:'Vandaag is '+HT+'. Lees alleen nog de kern van je rode en oranje onderwerpen.',topics:[],rep:false,pw:false,last:true});
  if(n===1)return Object.assign(base,{msg:'Morgen is '+HT+'. Maak het oefen'+TOETS+' en herhaal wat je fout had.',topics:fresh,rep:!isToday('mix'),pw:!isToday('pw')});
  /* nieuwe onderwerpen eerlijk verdeeld over de dagen vóór de laatste dag; wat vandaag al gedaan is telt mee */
  const per=Math.ceil((fresh.length+doneT.filter(t=>T.includes(t)).length)/(n-1)),left=Math.max(0,per-doneT.length);
  const topics=fresh.slice(0,left),pw=!fresh.length&&!isToday('pw');
  return Object.assign(base,{rep:base.rep||(!topics.length&&T.some(started)&&!isToday('mix')),msg:'Nog '+n+' dagen. '+(topics.length?'Vandaag: nieuwe stof leren en oefenen.':fresh.length?'Je nieuwe stof voor vandaag is af! Herhalen kan altijd.':'Alles is een keer geoefend. Nu herhalen en het oefen'+TOETS+'.'),topics,pw})}
V.start=function(){const P=plan();
  const step=(no,title,sub,btns)=>`<div class="lr-step"><span class="fno">${no}</span><div class="stack" style="gap:8px;flex:1"><div><b>${title}</b>${sub?`<p class="small mut">${sub}</p>`:''}</div><div class="btns">${btns}</div></div></div>`;
  let k=0;const steps=[...P.topics.map(t=>step(++k,esc(tname(t)),'Eerst de kern lezen, dan jezelf overhoren.',`<button class="btn ghost" data-go="leer:${t.id}">Lees</button><button class="btn" data-go="oef:${t.id}">Oefen</button>`)),
    P.rep?step(++k,'Herhalen','Vragen die je eerder fout had, door elkaar.',`<button class="btn" data-go="oef:mix">Herhaal</button>`):'',
    P.pw?step(++k,'Oefen'+TOETS,'30 vragen over alles, met cijfer.',`<button class="btn" data-go="pw:go">Start</button>`):'',
    P.doneT.length||S.tday.mix===today()||S.tday.pw===today()?`<p class="small lr-done">✓ Vandaag al gedaan: ${[...P.doneT.map(t=>esc(t.nav)),...(S.tday.mix===today()?['herhalen']:[]),...(S.tday.pw===today()?['oefen'+esc(TOETS)]:[])].join(', ')}</p>`:''].join('');
  view.innerHTML=`<section class="hero"><h1>${esc(M.title)}</h1><p>${esc(D.instructie)}</p></section>
  <section class="card stack"><div class="eyebrow">Vandaag</div><p><b>${esc(P.msg)}</b></p>${steps||(P.last?'<div class="btns"><button class="btn" data-go="leer">Naar de kern</button></div>':'')}</section>
  <section class="card stack"><div class="eyebrow">Hoe goed zit het erin?</div><div class="lr-grid">${T.map(t=>`<button class="lr-tile" data-go="leer:${t.id}">${dot(t.id)}<b>${esc(t.nav)}</b><span>${esc(t.title)}</span></button>`).join('')}</div>
   <p class="small mut"><i class="lr-dot green"></i> zit erin · <i class="lr-dot amber"></i> bijna · <i class="lr-dot red"></i> nog veel fout · <i class="lr-dot new"></i> nog niet geoefend</p></section>
  <section class="card stack"><div class="btns" style="align-items:center"><label for="exam" class="small" style="flex:0 0 auto;font-weight:800">Datum ${esc(TOETS)}</label><input type="date" id="exam" class="lr-date" value="${S.exam!=null?new Date(S.exam*DAYMS).toISOString().slice(0,10):''}"></div>
   ${D.extra?`<p class="small mut">${esc(D.extra)}</p>`:''}</section>`;
  act();$('#exam').addEventListener('change',e=>{const v=e.target.value;S.exam=v?Math.floor(Date.parse(v)/DAYMS):null;S.examT=Date.now();save();V.start()})};

/* ---- LEREN ---- */
V.leer=function(id){const t=T.find(x=>x.id===id);
  if(!t){view.innerHTML=`<h2>Leren</h2><p class="small mut">Per onderwerp: wat je moet kunnen, de kern uit de samenvatting van je boek en de belangrijkste afbeeldingen.</p>
    <div class="lr-list">${T.map(t=>`<button class="gm" data-go="leer:${t.id}"><em>${dot(t.id)} ${esc(t.pages)}</em><b>${esc(tname(t))}</b></button>`).join('')}</div>
    <div class="btns"><button class="btn ghost" data-go="bron">${esc(D.bronLabel||"Boekpagina’s en instructie")}</button></div>`;return act()}
  const i=T.indexOf(t),nx=T[i+1];
  view.innerHTML=`<button class="back-link" data-go="leer">← Alle onderwerpen</button>
  <section class="hero"><div class="eyebrow">${esc(t.nav)} · ${esc(t.pages)}</div><h1>${esc(t.title)}</h1></section>
  <section class="card stack"><div class="eyebrow">Dit moet je kunnen</div><ul class="tipl">${t.doelen.map(d=>`<li>${esc(d)}</li>`).join('')}</ul></section>
  <section class="card stack"><div class="eyebrow">De kern</div><ul class="lr-kern">${t.kern.map(p=>`<li>${md(p)}</li>`).join('')}</ul></section>
  ${(t.fig||[]).map(f=>`<figure class="card lr-fig"><a href="${esc(f[0])}" target="_blank" rel="noopener"><img src="${esc(f[0])}" alt="${esc(f[1])}" loading="lazy"></a><figcaption class="small mut">${esc(f[1])}</figcaption></figure>`).join('')}
  ${t.let&&t.let.length?`<section class="card stack lr-let"><div class="eyebrow">Let op</div><ul class="tipl">${t.let.map(p=>`<li>${md(p)}</li>`).join('')}</ul></section>`:''}
  <div class="btns"><button class="btn" data-go="oef:${t.id}">Oefen dit onderwerp</button>${t.bron&&t.bron.length?`<button class="btn ghost" data-go="bron:${t.id}">${esc(t.bronTitle||'Boek '+t.pages)}</button>`:''}</div>
  ${nx?`<button class="back-link" data-go="leer:${nx.id}">Volgende: ${esc(tname(nx))} →</button>`:''}`;
  act()};

/* ---- BRONNEN (via Leren) ---- */
/* bron-items: paginanummer (bronnen/pNN.jpg) of {src, cap}; D.bronnen.files: [{title, href, note}] */
const bitem=p=>typeof p==='number'?{src:'bronnen/p'+p+'.jpg',cap:'Blz. '+p}:p;
V.bron=function(id){const t=T.find(x=>x.id===id),B=D.bronnen||{},pages=(t?t.bron:B.pages||[]).map(bitem);
  view.innerHTML=`<button class="back-link" data-go="leer${t?':'+t.id:''}">← Terug</button><h2>${t?esc(t.bronTitle||'Boek '+t.pages):'Bronnen'}</h2>
  ${t?'':`<section class="card stack"><div class="eyebrow">Instructie van de docent</div><pre class="instr">${esc(D.instructieVerbatim||D.instructie)}</pre></section>`}
  ${!t&&B.files&&B.files.length?`<section class="card stack"><div class="eyebrow">Bestanden</div>${B.files.map(f=>`<div class="lr-row"><span>${esc(f.title)}${f.note?`<br><small class="mut">${esc(f.note)}</small>`:''}</span><a class="btn ghost lr-sm" href="${esc(f.href)}" target="_blank" rel="noopener">Open</a></div>`).join('')}</section>`:''}
  ${pages.map(p=>`<figure class="card lr-fig"><a href="${esc(p.src)}" target="_blank" rel="noopener"><img class="page" loading="lazy" src="${esc(p.src)}" alt="${esc(p.cap)}"></a><figcaption class="small mut">${esc(p.cap)}</figcaption></figure>`).join('')}`;
  act()};

/* vervoegingstabel uit D.tables; de rij die gevraagd werd is gemarkeerd */
const conjTable=(tab,row)=>{const T=D.tables[tab];return `<table class="lr-conj lr-show"><caption>${esc(T.title)}</caption>${T.rows.map((r,i)=>`<tr class="${i===row?'hl':''}"><th>${esc(r[0])}</th><td><b>${esc(r[1])}</b></td><td class="small mut">${esc(r[2])}</td></tr>`).join('')}</table>`};
const conjForms=r=>[r[1],...r[0].split(' / ').map(x=>x.endsWith("'")?x+r[1]:x+' '+r[1])];
/* accentknoppen bij vreemde-taalvragen: voegen de letter in op de plek van de cursor */
const ACC=`<div class="lr-acc" aria-label="Letters met accent">${['é','è','ê','ë','à','â','ç','î','ï','ô','û','ù','œ'].map(c=>`<button type="button" class="chip" data-ac="${c}">${c}</button>`).join('')}</div>`;
function accBar(box){let inp=$('.ti',box);$$('.ti',box).forEach(i=>i.addEventListener('focus',()=>inp=i));$$('[data-ac]',box).forEach(b=>{b.addEventListener('mousedown',e=>e.preventDefault());b.addEventListener('click',()=>{if(inp.readOnly)return;
  const a=inp.selectionStart??inp.value.length,z=inp.selectionEnd??a;inp.value=inp.value.slice(0,a)+b.dataset.ac+inp.value.slice(z);inp.focus();inp.setSelectionRange(a+1,a+1)})})}

/* ---- vraagtypes: elk rendert in box en roept done(score 0..1) aan ---- */
function part(p,box,done){
  /* gen: een verse som uit window.LEER_GEN (per module in gen.js) */
  if(p.k==='gen'){const g=window.LEER_GEN[p.g]();window.__lastGen=g;return part(Object.assign({bk:p.bk},g,{key:p.key}),box,done)}
  const T0=p.txt&&D.texts&&D.texts[p.txt],head=(T0?`<details class="lr-txt" ${p.txtOpen===false?'':'open'}><summary>Tekst: ${esc(T0.title)}</summary>${T0.src?`<p class="small mut">${esc(T0.src)}</p>`:''}${T0.body.map(x=>/^## /.test(x)?`<h4>${esc(x.slice(3))}</h4>`:`<p>${md(x)}</p>`).join('')}</details>`:'')+(p.ctx?`<div class="quote lr-ctx">${esc(p.ctx)}</div>`:'')+(p.img?`<a href="${esc(p.img)}" target="_blank" rel="noopener"><img class="lr-qimg" src="${esc(p.img)}" alt=""></a>`:'');
  const after=()=>(p.x?`<small>${md(p.x)}</small>`:'')+(p.check?`<small class="mut">${esc(D.C)}</small>`:'')+(p.bk?`<small class="mut">Boek: ${esc(p.bk)}</small>`:'');
  const fb=(ok,html)=>box.insertAdjacentHTML('beforeend',`<div class="fb ${ok===true?'good':ok===false?'bad':''}">${html}${after()}</div>`);
  const Q=`${head}<p class="q"><b>${md(p.q)}</b></p>`;
  if(p.k==='mc'){const o=(p.keep?x=>x:shuffle)(p.opts.map((t,i)=>({t,i}))); /* keep: vaste volgorde (le, la, l', les) */box.innerHTML=`${Q}<div class="opts">${o.map((x,j)=>`<button class="opt" data-j="${j}">${md(x.t)}</button>`).join('')}</div>`;
    on('.opt',e=>{const g=o[+e.dataset.j].i===p.a;$$('.opt',box).forEach((b,j)=>{b.disabled=true;if(o[j].i===p.a)b.classList.add('right')});if(!g)e.classList.add('wrong');fb(g,(g?'Goed!':'Het goede antwoord: <b>'+md(p.opts[p.a])+'</b>')+(!g&&p.xw?`<small>${md(p.xw)}</small>`:''));done(g?1:0)},box);return}
  if(p.k==='tf'){box.innerHTML=`${Q}<div class="btns"><button class="btn ghost" data-v="1">Juist</button><button class="btn ghost" data-v="0">Onjuist</button></div>`;
    on('[data-v]',e=>{const g=(e.dataset.v==='1')===p.a;$$('[data-v]',box).forEach(b=>b.disabled=true);fb(g,g?'Goed!':'Niet goed: de zin is '+(p.a?'juist':'onjuist')+'.');done(g?1:0)},box);return}
  if(p.k==='pick'){box.innerHTML=`${Q}<p class="small mut">Kies er ${p.ok.length}.</p><div class="chips">${shuffle(p.opts).map(o=>`<button class="chip" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><button class="btn" id="pk">Controleer</button>`;
    on('[data-o]',e=>{if($('#pk',box))e.classList.toggle('sel')},box);
    $('#pk',box).onclick=()=>{const sel=$$('[data-o].sel',box).map(b=>b.dataset.o);let good=0;$$('[data-o]',box).forEach(b=>{const ok=p.ok.includes(b.dataset.o),s=b.classList.contains('sel');b.disabled=true;if(ok)b.classList.add('pvok');if(s&&!ok)b.classList.add('pvno');if(ok&&s)good++});
      const sc=Math.max(0,(good-sel.filter(x=>!p.ok.includes(x)).length)/p.ok.length);$('#pk',box).remove();fb(sc===1,sc===1?'Helemaal goed!':'Het goede antwoord: <b>'+p.ok.map(esc).join(', ')+'</b>');done(sc)};return}
  if(p.k==='calc'){box.innerHTML=`${Q}<div class="btns"><input type="text" class="ti" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="bijv. 7/12" style="flex:1 1 160px"><button class="btn" id="tk">Controleer</button></div><p class="small mut">Breuk: 3/4 · gemengd getal: 2 1/3 · negatief: -5</p>`;
    const inp=$('.ti',box),A=frac(p.a),ck=()=>{if(!$('#tk',box)||!inp.value.trim())return;const v=frac(inp.value);
      if(!v){fb(false,'Dat kan ik niet lezen. Schrijf bijvoorbeeld 7/12, 2 1/3 of -5.');inp.focus();setTimeout(()=>$$('.fb',box).forEach(e=>e.remove()),2200);return}
      const eq=v.n*A.d===A.n*v.d,sc=eq?(v.simple?1:.5):0;inp.readOnly=true;$('#tk',box).remove();
      fb(sc===1?true:sc?null:false,(sc===1?'Goed! ':sc?'Goed gerekend, maar vereenvoudig nog: ':'Het goede antwoord: ')+'<b>'+esc(String(p.a).replace(/-/g,'−'))+'</b>');done(sc)};
    $('#tk',box).onclick=ck;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ck()}});return}
  if(p.k==='conj'){const T=D.tables[p.tab];
    box.innerHTML=`${Q}<table class="lr-conj">${T.rows.map((r,i)=>`<tr><th>${esc(r[0])}</th><td><input type="text" class="ti" data-r="${i}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(r[0])}"></td><td class="small mut">${esc(r[2])}</td></tr>`).join('')}</table>${ACC}<button class="btn" id="tk">Controleer</button>`;accBar(box);
    const ins=$$('.ti',box),ck=()=>{if(!$('#tk',box))return;let ok=0;
      ins.forEach((inp,i)=>{const r=T.rows[i],g=conjForms(r).some(w=>nrmS(w)===nrmS(inp.value));if(g)ok++;inp.readOnly=true;inp.classList.add(g?'yok':'yno');
        if(!g)inp.insertAdjacentHTML('afterend',`<div class="tfix">${esc(r[1])}</div>`)});
      $('#tk',box).remove();$$('[data-ac]',box).forEach(b=>b.disabled=true);fb(ok===T.rows.length,ok===T.rows.length?'De hele tabel goed!':ok+' van de '+T.rows.length+' goed. Schrijf de rode rijen nog een keer over.');done(ok/T.rows.length)};
    ins.forEach((inp,i)=>inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ins[i+1]?ins[i+1].focus():ck()}}));$('#tk',box).onclick=ck;return}
  if(p.k==='type'||p.k==='num'){box.innerHTML=`${Q}<div class="btns"><input type="text" class="ti" ${p.k==='num'?'inputmode="decimal"':''} autocomplete="off" autocapitalize="off" spellcheck="false" style="flex:1 1 160px">${p.unit?`<span class="lr-unit">${esc(p.unit)}</span>`:''}<button class="btn" id="tk">Controleer</button></div>${p.strict?ACC:''}`;
    if(p.strict)accBar(box);
    const inp=$('.ti',box),ck=()=>{if(!$('#tk',box)||!inp.value.trim())return;/* strict: accenten en lidwoord tellen mee (vreemde talen) */
      const g=p.k==='num'?Math.abs(num(inp.value)-p.a)<=(p.tol||0)+1e-9:p.strict?p.a.some(w=>nrmS(w)===nrmS(inp.value)):near(inp.value,p.a);
      const hint=!g&&p.strict?(p.a.some(w=>deacc(nrmS(w))===deacc(nrmS(inp.value)))?'Bijna! Let op de accenten. ':p.a.some(w=>nrmS(w).replace(/^(le |la |l'|les |un |une )/,'')===nrmS(inp.value))?'Vergeet het lidwoord niet. ':''):'';
      inp.readOnly=true;$('#tk',box).remove();
      fb(g,(g?'Goed! ':hint+'Het goede antwoord: ')+'<b>'+esc(p.k==='num'?String(p.a).replace('.',',')+' '+(p.unit||''):(p.show||p.a[0]))+'</b>'+(!g&&p.xw?`<small>${md(p.xw)}</small>`:''));
      if(!g&&p.tab&&D.tables)box.insertAdjacentHTML('beforeend',conjTable(p.tab,p.row));done(g?1:0)};
    $('#tk',box).onclick=ck;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ck()}});return}
  if(p.k==='open'){box.innerHTML=`${Q}<textarea placeholder="Schrijf je antwoord op (op het proefwerk moet je het ook opschrijven)"></textarea><button class="btn" id="sh">Kijk na</button>`;
    $('#sh',box).onclick=()=>{$('#sh',box).remove();$('textarea',box).readOnly=true;box.insertAdjacentHTML('beforeend',`<div class="quote"><b>Vink aan wat er in jouw antwoord stond${p.need<p.pts.length?` (${p.need} is genoeg)`:''}:</b>${p.pts.map((x,i)=>`<label class="chk"><input type="checkbox" data-p="${i}"><span>${esc(x)}</span></label>`).join('')}</div><button class="btn" id="okb">Klaar</button>`);
      $('#okb',box).onclick=()=>{const n=$$('[data-p]:checked',box).length,sc=Math.min(n,p.need)/p.need;$('#okb',box).remove();$$('[data-p]',box).forEach(c=>c.disabled=true);fb(sc===1?true:sc>0?null:false,sc===1?'Helemaal goed!':sc>0?'Gedeeltelijk goed.':'Lees het goede antwoord nog eens.');done(sc)}};return}
  if(p.k==='fill'){box.innerHTML=`${Q}<div class="stack">${p.items.map((it,i)=>`<div class="frow"><span>${md(it[0])}</span><select data-i="${i}"><option value="">kies…</option>${p.opts.map(o=>`<option>${esc(o)}</option>`).join('')}</select><span class="fres" id="fr${i}"></span></div>`).join('')}</div><button class="btn" id="fk">Controleer</button>`;
    $('#fk',box).onclick=()=>{let ok=0;$$('select',box).forEach(s=>{const it=p.items[+s.dataset.i],g=s.value===it[1];if(g)ok++;s.disabled=true;s.classList.add(g?'yok':'yno');$('#fr'+s.dataset.i,box).innerHTML=g?'✓':'✗ '+esc(it[1])});$('#fk',box).remove();fb(ok===p.items.length,ok+' van de '+p.items.length+' goed.');done(ok/p.items.length)};return}
  if(p.k==='sort'){const items=shuffle(p.items);let i=0,ok=0;const miss=[];
    const draw=()=>{if(i>=items.length){box.innerHTML=Q;fb(ok===items.length,ok+' van de '+items.length+' goed.'+(miss.length?'<br>'+miss.map(m=>esc(m[0])+' → <b>'+esc(m[1])+'</b>').join('<br>'):''));return done(ok/items.length)}
      box.innerHTML=`${Q}<div class="prog"><span>${i+1}/${items.length}</span><span class="bar"><i style="width:${i/items.length*100}%"></i></span></div><div class="sortcard">${esc(items[i][0])}</div><div class="opts ${p.cats.length===2?'two':''}">${p.cats.map(c=>`<button class="opt" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
      on('[data-c]',e=>{const g=e.dataset.c===items[i][1];if(g)ok++;else miss.push(items[i]);$$('[data-c]',box).forEach(b=>{b.disabled=true;if(b.dataset.c===items[i][1])b.classList.add('right')});if(!g)e.classList.add('wrong');setTimeout(()=>{i++;draw()},g?400:1300)},box)};
    draw();return}
  if(p.k==='order'){const items=p.items;let next=0,mist=0,pool=shuffle(items.map((t,i)=>({t,i})));
    const draw=()=>{box.innerHTML=`${Q}<p class="small mut">Tik ze in de goede volgorde aan.</p><ol class="ordl" style="grid-template-columns:1fr">${items.map((t,i)=>`<li class="${i<next?'ok':i===next?'now':''}">${i<next?md(t):'…'}</li>`).join('')}</ol><div class="opts">${pool.map(x=>`<button class="opt" data-i="${x.i}">${md(x.t)}</button>`).join('')}</div>`;
      on('[data-i]',e=>{if(+e.dataset.i===next){pool=pool.filter(x=>x.i!==next);next++;draw();if(next===items.length){fb(!mist,mist?mist+' keer mis.':'Foutloos!');done(Math.max(0,1-mist*.2))}}else{mist++;e.classList.add('shake','wrong');setTimeout(()=>e.classList.remove('shake','wrong'),500)}},box)};
    draw();return}
  if(p.k==='formula'){const L=p.left,R=p.right,bank=shuffle(L.concat(R)),n=L.length+R.length;
    box.innerHTML=`${Q}<div class="fxb">${L.map((_,i)=>`<span class="slot" data-s="${i}"></span>`).join(' + ')} → ${R.map((_,i)=>`<span class="slot" data-s="${L.length+i}"></span>`).join(' + ')}</div><div class="chips">${bank.map(w=>`<button class="chip" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div><div class="btns"><button class="btn ghost" id="fr">Opnieuw</button><button class="btn" id="fk">Controleer</button></div>`;
    let pos=0;on('[data-w]',e=>{if(pos>=n||!$('#fk',box))return;$(`.slot[data-s="${pos}"]`,box).textContent=e.dataset.w;e.disabled=true;pos++},box);
    $('#fr',box).onclick=()=>{pos=0;$$('.slot',box).forEach(s=>{s.textContent='';s.className='slot'});$$('[data-w]',box).forEach(b=>b.disabled=false)};
    $('#fk',box).onclick=()=>{const v=$$('.slot',box).map(s=>s.textContent),same=(a,b)=>a.slice().sort().join()===b.slice().sort().join(),g=same(v.slice(0,L.length),L)&&same(v.slice(L.length),R);
      $$('.slot',box).forEach((s,i)=>s.classList.add((i<L.length?L:R).includes(s.textContent)?'yok':'yno'));$('#fk',box).remove();$('#fr',box).remove();fb(g,g?'Goed!':'Het is: <b>'+esc(L.join(' + ')+' → '+R.join(' + '))+'</b>');done(g?1:0)};return}
  if(p.k==='paper'){box.innerHTML=`${Q}<p class="small mut">Pak papier en potlood. Klaar? Vink aan wat goed is.</p>${p.steps.map((x,i)=>`<label class="chk"><input type="checkbox" data-p="${i}"><span>${esc(x)}</span></label>`).join('')}<button class="btn" id="okb">Klaar</button>`;
    $('#okb',box).onclick=()=>{const n=$$('[data-p]:checked',box).length,sc=n/p.steps.length;$('#okb',box).remove();$$('[data-p]',box).forEach(c=>c.disabled=true);fb(sc===1?true:null,sc===1?'Netjes volgens de regels!':'Let bij de volgende tekening op de punten zonder vinkje.');done(sc)};return}
}

/* een reeks vragen afspelen; fout beantwoorde vragen komen aan het eind nog één keer terug (behalve in het proefwerk) */
function run(qs,{title,retry,onEnd}){let i=0,tot=0,first=qs.length;const res=[];
  const draw=()=>{if(i>=qs.length)return onEnd(tot/first,res);
    const q=qs[i],again=i>=first;window.__leerQ=q; /* voor de testscripts */
    view.innerHTML=`<button class="back-link" id="bk">← Stoppen</button><div class="prog"><span>${Math.min(i+1,first)}/${first}${again?' · nog een keer':''}</span><span class="bar"><i style="width:${Math.min(i,first)/first*100}%"></i></span></div>
      <div class="card stack"><div class="eyebrow">${esc(title)}${q.tid&&title!==tname(T.find(t=>t.id===q.tid))?' · '+esc(T.find(t=>t.id===q.tid).nav):''}</div><div id="pb" class="stack"></div><div id="nx"></div></div>`;
    $('#bk').onclick=()=>go(CUR==='pw'?'pw':'oef');
    part(q,$('#pb'),sc=>{if(!again){tot+=sc;res.push([q,sc]);if(q.key&&q.k!=='paper')mark(q.key,sc>=.99)}else if(sc>=.99&&q.key)mark(q.key,true);
      if(retry&&!again&&sc<.99&&q.k!=='paper')qs.push(q);save();
      $('#nx').innerHTML=`<button class="btn" id="nb" style="width:100%;margin-top:10px">${i+1<qs.length?'Volgende':'Klaar'}</button>`;$('#nb').onclick=()=>{i++;draw()};$('#nb').focus({preventScroll:true})})};
  draw()}

/* ---- OEFENEN ---- */
const prio=q=>{const e=S.lb[q.key];return !e?1:e.b===0?0:2+e.b+(today()-e.d>1?-1:0)};
function pickSession(items,max){return shuffle(items).sort((a,b)=>prio(a)-prio(b)).slice(0,max)}
V.oef=function(id){
  if(id==='mix'){const pool=T.filter(t=>mastery(t.id).seen).flatMap(t=>scored(t.id));
    if(!pool.length){view.innerHTML=`<div class="card stack"><p><b>Oefen eerst een onderwerp.</b> Daarna kun je hier herhalen.</p><button class="btn" data-go="oef">Naar de onderwerpen</button></div>`;return act()}
    return session('Herhalen',shuffle(pickSession(pool,12)),'mix')}
  const t=T.find(x=>x.id===id);if(t){const it=ITEMS[t.id],b=it.filter(q=>q.beg),r=it.filter(q=>!q.beg);
    /* begrippen en vragen door elkaar, zwakke en nieuwe eerst; papier-opdracht aan het eind */
    const qs=pickSession(b,4).concat(pickSession(r.filter(q=>q.k!=='paper'),t.n||10));const ordered=shuffle(qs).concat(r.filter(q=>q.k==='paper').slice(0,1));
    return session(tname(t),ordered,t.id)}
  view.innerHTML=`<h2>Oefenen</h2><p class="small mut">Overhoor jezelf. Wat je fout hebt, komt aan het eind en bij Herhalen terug.</p>
  <button class="gm lr-mix" data-go="oef:mix"><em>Door elkaar</em><b>Herhalen</b><span>Vragen uit alles wat je al geoefend hebt; je fouten eerst.</span></button>
  <div class="lr-list">${T.map(t=>{const m=mastery(t.id);return `<button class="gm" data-go="oef:${t.id}"><em>${dot(t.id)} ${m.seen?m.ok+' van '+m.n+' goed':SLABEL.new}</em><b>${esc(tname(t))}</b></button>`}).join('')}</div>`;
  act()};
function session(title,qs,tid){run(qs.slice(),{title,retry:true,onEnd:(p,res)=>{S.tday[tid]=today();S.best['o:'+tid]=Math.max(S.best['o:'+tid]||0,p);save();
  const wrong=res.filter(r=>r[1]<.99);
  view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">${esc(title)}</div><div class="score">${Math.round(p*100)}%</div><p class="small mut">${p>=.85?'Sterk! Herhaal dit over een paar dagen nog eens.':p>=.5?'Bijna. Lees de kern nog eens en oefen morgen opnieuw.':'Lees eerst de kern nog eens rustig, en oefen dan opnieuw.'}</p></div>
  ${wrong.length?`<div class="card stack"><h3>Dit had je fout</h3><ul class="tipl">${wrong.map(r=>`<li>${esc(r[0].q)}</li>`).join('')}</ul></div>`:''}
  <div class="btns"><button class="btn" data-go="start">Terug naar vandaag</button>${tid!=='mix'?`<button class="btn ghost" data-go="leer:${tid}">Kern lezen</button>`:''}<button class="btn ghost" data-go="oef">Ander onderwerp</button></div>`;act()}})}

/* ---- PROEFWERK: per onderwerp één begrip en twee vragen van verschillende soort, aangevuld tot 30, door elkaar ---- */
function exam(){const qs=[];T.forEach(t=>{const it=scored(t.id),b=shuffle(it.filter(q=>q.beg)),r=shuffle(it.filter(q=>!q.beg));
    if(b[0])qs.push(b[0]);const kinds=new Set();r.forEach(q=>{if(kinds.size<2&&!kinds.has(q.k)){kinds.add(q.k);qs.push(q)}})});
  const rest=shuffle(T.flatMap(t=>scored(t.id)).filter(q=>!qs.includes(q)));return shuffle(qs.concat(rest.slice(0,Math.max(0,30-qs.length))))}
V.pw=function(arg){
  if(arg==='go')return run(exam(),{title:'Oefen'+TOETS,retry:false,onEnd:(p,res)=>{S.best.pw=Math.max(S.best.pw||0,p);S.tday.pw=today();save();
    const per=T.map(t=>{const r=res.filter(x=>x[0].tid===t.id);return{t,p:r.length?r.reduce((a,x)=>a+x[1],0)/r.length:1}}).sort((a,b)=>a.p-b.p);
    view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">Oefen${esc(TOETS)}</div><div class="score">${grade(p)}</div><p class="small mut">${String(Math.round(p*res.length*10)/10).replace('.',',')} van de ${res.length} punten. Cijfer ter indicatie.</p></div>
    <div class="card stack"><h3>Per onderwerp</h3>${per.map(x=>`<div class="lr-row"><span>${esc(tname(x.t))}</span><b>${Math.round(x.p*100)}%</b>${x.p<1?`<button class="btn ghost lr-sm" data-go="leer:${x.t.id}">Kern</button>`:''}</div>`).join('')}</div>
    <div class="btns"><button class="btn" data-go="oef:mix">Herhaal je fouten</button><button class="btn ghost" data-go="pw:go">Nieuw oefen${esc(TOETS)}</button></div>`;act()}});
  view.innerHTML=`<h2>Oefen${esc(TOETS)}</h2><div class="card stack"><p>30 vragen over alle onderwerpen door elkaar, zoals op ${LW} echte ${esc(TOETS)}. Neem er de tijd voor (±30 minuten). Schrijf open antwoorden echt op en kijk ze daarna eerlijk na.</p>
  <p class="small mut">${S.best.pw!=null?'Je beste cijfer tot nu toe: <b>'+grade(S.best.pw)+'</b>. ':''}Tip: maak dit pas als je alle onderwerpen een keer geoefend hebt, en nog een keer op de dag vóór ${esc(HT)}.</p>
  <button class="btn" data-go="pw:go">Start</button></div>`;act()};

window.__studieReload=ids=>{if(!ids.includes(M.id))return;S=Object.assign(DEF(),store.get());header();if(CUR==='start')go('start')};
header();const [h,a]=(location.hash||'').slice(1).split(':');go(V[h]?h:'start',h==='pw'?undefined:a);
})();
