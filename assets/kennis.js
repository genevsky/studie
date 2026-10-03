/* Kennis-app: zaakvakken (biologie e.d.). Samenvatting, begrippen, opdrachten uit het boek, oefeningen per onderwerp, oefen-SO en bronnen. Leest window.EXAM (type 'kennis'). */
(function(){
'use strict';
const D=window.EXAM,M=D.meta;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sample=(a,n)=>shuffle(a).slice(0,n);
const view=$('#view');document.title=M.title;$('#brand').textContent=M.brand;$('#sub').textContent=M.sub;
let cleanup=()=>{},CUR='start';

/* ---- voortgang ---- */
const store={get(){try{return JSON.parse(localStorage.getItem('studie:'+M.id))||{}}catch(e){return{}}},set(v){try{localStorage.setItem('studie:'+M.id,JSON.stringify(v))}catch(e){}if(window.StudieSync)StudieSync.changed()}};
const DEF=()=>({xp:0,lb:{},exam:null,best:{},wrong:{},played:{}});
let S=Object.assign(DEF(),store.get());
if(S.exam==null&&M.examDate)S.exam=Math.floor(Date.parse(M.examDate)/864e5);
const DAYMS=864e5,today=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/DAYMS);
function mark(k,ok){const e=S.lb[k];S.lb[k]={b:ok?Math.min(4,(e?e.b:0)+1):0,d:today(),t:Date.now()};if(ok){if(S.wrong[k]>0)S.wrong[k]=-Date.now()}else S.wrong[k]=Date.now()}
const BEG=D.begrippen||[],OPD=D.opdrachten||[],DR=D.drills||[];
function ready(){const b=BEG.filter(x=>S.lb['b:'+x.t]&&S.lb['b:'+x.t].b>=1).length/(BEG.length||1),o=OPD.filter(x=>S.best['o:'+x.id]!=null).length/(OPD.length||1),dr=DR.filter(x=>S.best['d:'+x.id]!=null).reduce((a,x)=>a+S.best['d:'+x.id],0)/(DR.length||1),so=S.best.so||0;
  return{b,o,dr,so,pct:Math.round(100*(.2*b+.25*o+.25*dr+.3*so))}}
const save=()=>{const r=ready();S.pct=r.pct;S.stats={seen:OPD.filter(x=>S.best['o:'+x.id]!=null).length,total:OPD.length,unit:'opdrachten'};S.ts=Date.now();store.set(S)};
const LV=M.levels||[[0,'Beginner'],[80,'Leerling'],[220,'Kenner'],[400,'Expert'],[650,'Meester'],[950,'Kampioen']];
function lvl(){let i=0;LV.forEach((l,k)=>{if(S.xp>=l[0])i=k});const n=LV[i+1];return{i,name:LV[i][1],from:LV[i][0],next:n?n[0]:null}}
function header(){const L=lvl();$('#lvlName').textContent=L.name+' · '+S.xp+' XP';$('#lvlBar').style.width=(L.next?Math.min(100,100*(S.xp-L.from)/(L.next-L.from)):100)+'%'}
let tt;function toast(m){$$('.toast').forEach(e=>e.remove());const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.appendChild(e);clearTimeout(tt);tt=setTimeout(()=>e.remove(),2200)}
function addXP(n){const b=lvl().i;S.xp+=n;save();header();if(lvl().i>b)toast('Nieuw niveau: '+lvl().name+'!')}
function confetti(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const cols=['var(--sun)','var(--accent)','var(--good)','var(--bad)'];for(let i=0;i<46;i++){const e=document.createElement('i');e.className='cf';e.style.left=Math.random()*100+'vw';e.style.background=cols[i%4];e.style.animationDelay=Math.random()*.4+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}}
const grade=p=>Math.max(1,Math.round((1+9*p)*10)/10).toFixed(1).replace('.',',');
$('#strata').innerHTML=['#3BB273','#8BC34A','#F2B01E','#E07B39','#B0418F'].map(c=>`<i style="background:${c}"></i>`).join('');
const nrm=s=>String(s||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?,;:]+$/,'').replace(/\s+/g,' ');
const lev=(a,b)=>{const m=a.length,n=b.length;let p=[...Array(n+1).keys()];for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]};
const near=(a,list)=>{a=nrm(a);return list.map(nrm).some(w=>w===a||(w.length>5&&lev(w,a)<=1))};

/* ---- tabs ---- */
const ICON={start:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 leer:'<path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/>',
 opd:'<path d="M5 3h11l3 3v15H5z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
 oef:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 toets:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
 bron:'<path d="M4 4h7v16H4zM13 4h7v16h-7z"/>'};
const TABS=[['start','Start'],['leer','Leren'],['opd','Opdrachten'],['oef','Oefenen'],['toets','Toets'],['bron','Bronnen']];
$('#tabs').innerHTML=TABS.map(t=>`<button class="tab" data-tab="${t[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[t[0]]}</svg>${t[1]}</button>`).join('');
$$('.tab').forEach(b=>b.addEventListener('click',()=>go(b.dataset.tab)));
const V={};
function go(t,arg){CUR=t;cleanup();cleanup=()=>{};$$('.tab').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t?'page':'false'));V[t](arg);window.scrollTo(0,0);try{history.replaceState(null,'','#'+t)}catch(e){}}
const on=(sel,fn,root=view)=>$$(sel,root).forEach(e=>e.addEventListener('click',()=>fn(e)));
const play=g=>{S.played=S.played||{};S.played[g]=(S.played[g]||0)+1;save()};

/* ---- START ---- */
function planText(){const n=S.exam?S.exam-today():null;
  if(n==null)return 'Vul de datum van je SO in.';if(n<0)return 'De SO is geweest. Goed gedaan!';
  if(n===0)return 'Vandaag is de SO! Lees de samenvatting nog één keer en kijk naar de formule.';
  if(n===1)return 'Morgen is de SO. Maak de oefen-SO en lees bij elke fout het goede antwoord.';
  if(n<=3)return 'Nog '+n+' dagen. Elke dag: opdrachten uit het boek, één onderwerp oefenen en de begrippen.';
  return 'Nog '+n+' dagen. Begin met de samenvatting en de opdrachten uit het boek.'}
V.start=function(){const r=ready();
  view.innerHTML=`<section class="hero"><h1>Biologie: fotosynthese</h1><p>${esc(D.instructie)}</p></section>
  <section class="card stack"><div class="eyebrow">Vandaag</div><p><b>${esc(planText())}</b></p>
    <div class="btns" style="align-items:center"><label for="exam" class="small" style="flex:0 0 auto;font-weight:800">Datum van de SO</label><input type="date" id="exam" value="${S.exam?new Date(S.exam*DAYMS).toISOString().slice(0,10):''}" style="flex:1 1 160px;font:inherit;padding:10px 12px;border-radius:12px;border:2px solid var(--line);background:var(--surface);color:var(--ink)"></div></section>
  ${D.formule?`<section class="card formula"><div class="eyebrow">Onthoud dit</div><p class="fx">${esc(D.formule[0])} + ${esc(D.formule[1])} + ${esc(D.formule[2])} → ${esc(D.formule[3])} + ${esc(D.formule[4])}</p></section>`:''}
  <section class="stack"><h2>Jouw route</h2>
  ${[['1','Lees','Samenvatting en begrippen van basisstof 5 en 7, met de pagina’s uit je boek.',[['leer:sam','Samenvatting'],['leer:beg','Begrippen',1],['bron','Boekpagina’s',1]]],
     ['2','Opdrachten uit het boek','Precies de opdrachten van blz. 41-43 en 59-60, met antwoorden.',[['opd','Naar de opdrachten']]],
     ['3','Oefen per onderwerp',DR.map(d=>d.title).join(' · '),DR.map((d,i)=>['oef:'+d.id,d.title,i>0])],
     ['✓','Oefen-SO','20 vragen door elkaar, met cijfer.',[['toets:so','Start de oefen-SO']]]].map(t=>`
   <section class="card stack focus"><div class="fhead"><span class="fno">${t[0]}</span><div><h2>${t[1]}</h2><p class="small mut">${esc(t[2])}</p></div></div><div class="btns">${t[3].map(b=>`<button class="btn ${b[2]?'ghost':''}" data-act="${b[0]}">${esc(b[1])}</button>`).join('')}</div></section>`).join('')}</section>
  <section class="card ready"><div class="pct">${r.pct}<small>%</small></div><div class="stack" style="gap:8px"><b>Klaar voor de SO</b>
   <div class="mini"><div><span>Begrippen</span><span class="bar"><i style="width:${Math.round(r.b*100)}%"></i></span></div><div><span>Opdrachten</span><span class="bar"><i style="width:${Math.round(r.o*100)}%"></i></span></div><div><span>Onderwerpen</span><span class="bar"><i style="width:${Math.round(r.dr*100)}%"></i></span></div><div><span>Oefen-SO</span><span class="bar"><i style="width:${Math.round(r.so*100)}%"></i></span></div></div></div></section>`;
  on('[data-act]',e=>{const [t,x]=e.dataset.act.split(':');go(t,x)});
  $('#exam').addEventListener('change',e=>{const v=e.target.value;S.exam=v?Math.floor(Date.parse(v)/DAYMS):null;S.examT=Date.now();save();V.start()})};

/* ---- LEREN ---- */
let lTab='sam';
V.leer=function(arg){if(arg)lTab=arg;
  view.innerHTML=`<div class="seg">${[['sam','Samenvatting'],['beg','Begrippen'],['kaart','Kaartjes'],['doel','Leerdoelen']].map(x=>`<button data-l="${x[0]}" aria-pressed="${lTab===x[0]}">${x[1]}</button>`).join('')}</div><div id="lb" class="stack" style="margin-top:12px"></div>`;
  on('[data-l]',e=>{lTab=e.dataset.l;V.leer()});const b=$('#lb');
  if(lTab==='sam'){b.innerHTML=D.summary.map((s,i)=>`<details class="sum" ${i===0?'open':''}><summary><span>${esc(s.pages)}</span><b>${esc(s.title)}</b></summary><div class="body"><p class="one">${esc(s.one)}</p>${s.sections.map(x=>`<div><h4>${esc(x.h)}</h4><ul>${x.pts.map(p=>`<li>${md(p)}</li>`).join('')}</ul></div>`).join('')}</div></details>`).join('')+(D.tabel?tableHTML():'')}
  else if(lTab==='beg'){b.innerHTML=`<p class="small mut">Lees de omschrijving, zeg het begrip en tik om te kijken.</p>`+['5','7'].map(p=>`<div class="card stack"><h3>Basisstof ${p}</h3>${BEG.filter(x=>x.p===p).map(x=>`<details class="vq"><summary>${esc(x.d)}</summary><p><b>${esc(x.t)}</b></p></details>`).join('')}</div>`).join('')}
  else if(lTab==='doel'){b.innerHTML=`<div class="card stack"><h3>Leerdoelen uit je boek</h3>${D.leerdoelen.map(l=>`<p><b>${esc(l[0])}</b> ${esc(l[1])}</p>`).join('')}</div>`}
  else cards(b)};
function tableHTML(){const T=D.tabel;return `<div class="card stack"><h3>Tabel 1 · Grondstoffen van planten en dieren</h3><div class="tscroll"><table class="cmp"><tr>${T.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${T.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div></div>`}
function cards(b){let deck=shuffle(BEG),i=0,dir='d';
  const draw=()=>{if(i>=deck.length){b.innerHTML=`<div class="card stack" style="text-align:center"><div class="score">Klaar!</div><button class="btn" id="ag">Nog een keer</button></div>`;$('#ag').onclick=()=>cards(b);return}
    const x=deck[i];b.innerHTML=`<div class="seg"><button data-dir="d" aria-pressed="${dir==='d'}">Omschrijving → begrip</button><button data-dir="t" aria-pressed="${dir==='t'}">Begrip → omschrijving</button></div><div class="prog"><span>${i+1}/${deck.length}</span><span class="bar"><i style="width:${i/deck.length*100}%"></i></span></div>
    <div class="card3d" id="c3"><div class="in"><div class="face"><div class="hint">${dir==='d'?'Welk begrip?':'Wat betekent'}</div><div class="${dir==='d'?'txt':'big'}">${esc(dir==='d'?x.d:x.t)}</div><div class="sub">Tik om te draaien</div></div><div class="face back"><div class="hint">Antwoord</div><div class="${dir==='d'?'big':'txt'}">${esc(dir==='d'?x.t:x.d)}</div></div></div></div>
    <div class="btns" id="kb" style="visibility:hidden"><button class="btn bad" data-k="0">Nog niet</button><button class="btn good" data-k="1">Wist ik!</button></div>`;
    on('[data-dir]',e=>{dir=e.dataset.dir;draw()},b);$('#c3').onclick=()=>{$('#c3').classList.add('flipped');$('#kb').style.visibility='visible'};
    on('[data-k]',e=>{const ok=e.dataset.k==='1';mark('b:'+x.t,ok);if(ok)addXP(2);else deck.push(x);save();i++;draw()},b)};
  draw()}

/* ---- vraag-onderdelen (gedeeld) ---- */
/* elk onderdeel rendert in een container en roept done(score 0..1) aan */
function part(p,box,done,keyBase){
  const fb=(ok,html)=>{box.insertAdjacentHTML('beforeend',`<div class="fb ${ok===true?'good':ok===false?'bad':''}">${html}</div>`)};
  const chk=p.check?`<small class="mut">${esc(D.C||'Modelantwoord: check met je boek.')}</small>`:'';
  if(p.k==='mc'){const o=shuffle(p.opts.map((t,i)=>({t,i})));box.innerHTML=`<p class="q">${esc(p.q)}</p><div class="opts">${o.map((x,j)=>`<button class="opt" data-j="${j}">${esc(x.t)}</button>`).join('')}</div>`;
    on('.opt',e=>{const g=o[+e.dataset.j].i===p.a;$$('.opt',box).forEach((b,j)=>{b.disabled=true;if(o[j].i===p.a)b.classList.add('right')});if(!g)e.classList.add('wrong');fb(g,g?'Goed!':'Het goede antwoord: <b>'+esc(p.opts[p.a])+'</b>');done(g?1:0)},box);return}
  if(p.k==='tf'){box.innerHTML=`<p class="q">${esc(p.q)}</p><div class="btns"><button class="btn ghost" data-v="1">Juist</button><button class="btn ghost" data-v="0">Onjuist</button></div>`;
    on('[data-v]',e=>{const g=(e.dataset.v==='1')===p.a;$$('[data-v]',box).forEach(b=>b.disabled=true);fb(g,(g?'Goed! ':'Niet goed. ')+'<small>'+esc(p.why||'')+'</small>');done(g?1:0)},box);return}
  if(p.k==='yn'){box.innerHTML=`<p class="q">${p.l?'<b>'+p.l+'</b> ':''}${esc(p.q)}</p><div class="btns"><button class="btn ghost" data-v="ja">Ja</button><button class="btn ghost" data-v="nee">Nee</button></div>`;
    on('[data-v]',e=>{const g=e.dataset.v===p.a;$$('[data-v]',box).forEach(b=>b.disabled=true);fb(g,(g?'Goed! ':'Niet goed. ')+'<small>'+esc(p.why)+'</small>'+chk);done(g?1:0)},box);return}
  if(p.k==='pick'){box.innerHTML=`<p class="q">${p.l?'<b>'+p.l+'</b> ':''}${esc(p.q)} <span class="small mut">(kies er ${p.ok.length})</span></p><div class="chips">${shuffle(p.opts).map(o=>`<button class="chip" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><button class="btn" id="pk">Controleer</button>`;
    on('[data-o]',e=>{if($('#pk',box))e.classList.toggle('sel')},box);
    $('#pk',box).onclick=()=>{const sel=$$('[data-o].sel',box).map(b=>b.dataset.o);let good=0;$$('[data-o]',box).forEach(b=>{const ok=p.ok.includes(b.dataset.o),s=b.classList.contains('sel');b.disabled=true;if(ok)b.classList.add('pvok');if(s&&!ok)b.classList.add('pvno');if(ok&&s)good++});
      const wrongSel=sel.filter(x=>!p.ok.includes(x)).length,sc=Math.max(0,(good-wrongSel)/p.ok.length);$('#pk',box).remove();fb(sc===1,sc===1?'Helemaal goed!':'Het goede antwoord: <b>'+p.ok.map(esc).join(', ')+'</b>');done(sc)};return}
  if(p.k==='type'){box.innerHTML=`<p class="q">${p.l?'<b>'+p.l+'</b> ':''}${esc(p.q)}</p><div class="btns"><input type="text" class="ti" autocomplete="off" style="flex:1 1 160px"><button class="btn" id="tk">Controleer</button></div>`;
    const inp=$('.ti',box),ck=()=>{if(!$('#tk',box))return;const g=near(inp.value,p.a);inp.readOnly=true;$('#tk',box).remove();fb(g,(g?'Goed! ':'Het goede antwoord: ')+'<b>'+esc(p.show||p.a[0])+'</b>');done(g?1:0)};
    $('#tk',box).onclick=ck;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ck()}});return}
  if(p.k==='open'){box.innerHTML=`<p class="q">${p.l?'<b>'+p.l+'</b> ':''}${esc(p.q||'')}</p><textarea placeholder="Schrijf je antwoord (of zeg het hardop)"></textarea><button class="btn" id="sh">Toon wat erin moet staan</button>`;
    $('#sh',box).onclick=()=>{$('#sh',box).remove();$('textarea',box).readOnly=true;box.insertAdjacentHTML('beforeend',`<div class="quote"><b>Vink aan wat jij had${p.need<p.pts.length?` (${p.need} is genoeg)`:''}:</b>${p.pts.map((x,i)=>`<label class="chk"><input type="checkbox" data-p="${i}"><span>${esc(x)}</span></label>`).join('')}${chk}</div><button class="btn" id="okb">Klaar met nakijken</button>`);
      $('#okb',box).onclick=()=>{const n=$$('[data-p]:checked',box).length,sc=Math.min(n,p.need)/p.need;$('#okb',box).remove();$$('[data-p]',box).forEach(c=>c.disabled=true);fb(sc===1?true:sc>0?null:false,sc===1?'Helemaal goed!':sc>0?'Gedeeltelijk goed.':'Lees het antwoord goed door.');done(sc)}};return}
  if(p.k==='fill'){box.innerHTML=`<div class="stack">${p.items.map((it,i)=>`<div class="frow"><span>${i+1}. ${esc(it[0])}</span><select data-i="${i}"><option value="">kies…</option>${p.opts.map(o=>`<option>${esc(o)}</option>`).join('')}</select><span class="fres" id="fr${i}"></span></div>`).join('')}</div><button class="btn" id="fk">Controleer</button>`;
    $('#fk',box).onclick=()=>{let ok=0;$$('select',box).forEach(s=>{const it=p.items[+s.dataset.i],g=s.value===it[1];if(g)ok++;s.disabled=true;s.classList.add(g?'yok':'yno');$('#fr'+s.dataset.i,box).innerHTML=g?'✓':'✗ '+esc(it[1])});$('#fk',box).remove();fb(ok===p.items.length,ok+' van de '+p.items.length+' goed.');done(ok/p.items.length)};return}
  if(p.k==='sort'){const items=shuffle(p.items);let i=0,ok=0;
    const draw=()=>{if(i>=items.length){fb(ok===items.length,ok+' van de '+items.length+' goed.');return done(ok/items.length)}
      box.innerHTML=`<p class="q">${esc(p.q)}</p><div class="prog"><span>${i+1}/${items.length}</span><span class="bar"><i style="width:${i/items.length*100}%"></i></span><span>${ok} goed</span></div><div class="sortcard" style="text-align:center;font-size:1.3rem;font-weight:800">${esc(items[i][0])}</div><div class="opts two">${p.cats.map(c=>`<button class="opt" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
      on('[data-c]',e=>{const g=e.dataset.c===items[i][1];if(g)ok++;$$('[data-c]',box).forEach(b=>{b.disabled=true;if(b.dataset.c===items[i][1])b.classList.add('right')});if(!g)e.classList.add('wrong');setTimeout(()=>{i++;draw()},g?450:1300)},box)};
    draw();return}
  if(p.k==='order'){const items=p.items;let next=0,mist=0,pool=shuffle(items.map((t,i)=>({t,i})));
    const draw=()=>{box.innerHTML=`<p class="q">${esc(p.q)}</p><ol class="ordl" style="grid-template-columns:1fr">${items.map((t,i)=>`<li class="${i<next?'ok':i===next?'now':''}">${i<next?esc(t):'…'}</li>`).join('')}</ol><div class="opts">${pool.map(x=>`<button class="opt" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>`;
      on('[data-i]',e=>{if(+e.dataset.i===next){pool=pool.filter(x=>x.i!==next);next++;if(next===items.length){draw();fb(!mist,mist?mist+' keer mis.':'Foutloos!');return done(Math.max(0,1-mist*.2))}draw()}else{mist++;e.classList.add('shake','wrong');setTimeout(()=>e.classList.remove('shake','wrong'),500)}},box)};
    draw();return}
  if(p.k==='formula'){const F=D.formule,bank=shuffle(F);
    box.innerHTML=`<p class="q">Maak de formule van de fotosynthese af. Tik de woorden op de goede plek.</p><div class="fxb"><span class="slot" data-s="0"></span> + <span class="slot" data-s="1"></span> + <span class="slot" data-s="2"></span> → <span class="slot" data-s="3"></span> + <span class="slot" data-s="4"></span></div><div class="chips">${bank.map(w=>`<button class="chip" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div><div class="btns"><button class="btn ghost" id="fr">Opnieuw</button><button class="btn" id="fk">Controleer</button></div>`;
    let pos=0;on('[data-w]',e=>{if(pos>4||!$('#fk',box))return;$(`.slot[data-s="${pos}"]`,box).textContent=e.dataset.w;e.disabled=true;pos++},box);
    $('#fr',box).onclick=()=>{pos=0;$$('.slot',box).forEach(s=>{s.textContent='';s.className='slot'});$$('[data-w]',box).forEach(b=>b.disabled=false)};
    $('#fk',box).onclick=()=>{const v=$$('.slot',box).map(s=>s.textContent);const inSet=(a,b)=>a.slice().sort().join()===b.slice().sort().join();
      const g=inSet(v.slice(0,3),F.slice(0,3))&&inSet(v.slice(3),F.slice(3));$$('.slot',box).forEach((s,i)=>s.classList.add((i<3?F.slice(0,3):F.slice(3)).includes(s.textContent)?'yok':'yno'));$('#fk',box).remove();$('#fr',box).remove();
      fb(g,g?'Goed!':'Het is: <b>'+F.slice(0,3).join(' + ')+' → '+F.slice(3).join(' + ')+'</b>');done(g?1:0)};return}
  if(p.k==='web'){webPart(box,fb,done);return}
  if(p.k==='tabel'){tabelPart(box,fb,done);return}
  if(p.k==='class'){classPart(box,fb,done);return}
  if(p.k==='clothes'){clothesPart(box,fb,done);return}
}
/* woordweb (afbeelding 3, blz. 42) */
const WEB=[{id:'z',a:['zuurstof']},{id:'g',a:['glucose']},{id:'gr',a:['groei']},{id:'d1',a:['wortel','stengel','blad','vrucht'],grp:'deel'},{id:'d2',grp:'deel'},{id:'d3',grp:'deel'},{id:'d4',grp:'deel'},{id:'v',a:['voedsel']},{id:'m1',a:['mens','dier'],grp:'wie'},{id:'m2',grp:'wie'}];
function webPart(box,fb,done){const words=['blad','dier','glucose','groei','mens','stengel','voedsel','vrucht','wortel','zuurstof'];
  const sel=id=>`<select class="wsel" data-w="${id}"><option value=""></option>${words.map(w=>`<option>${w}</option>`).join('')}</select>`;
  box.innerHTML=`<p class="small mut">Kies in elk vakje het goede woord (afbeelding 3, blz. 42). Elk woord gebruik je één keer.</p>
  <div class="web">
   <div class="wn fix">fotosynthese</div><div class="wa">zorgt bij ↓</div><div class="wn fix">planten</div>
   <div class="wrow2"><div><div class="wa">voor ↓</div>${sel('z')}<div class="wa small">die nodig is voor ↓ mens en dier</div></div><div><div class="wa">voor ↓</div>${sel('g')}<div class="wa">die de ↓</div><div class="wn fix">plant</div><div class="wa">nodig heeft voor ↓</div>${sel('gr')}</div></div>
   <div class="wa">van ↓</div><div class="wrow5">${sel('d1')}${sel('d2')}${sel('d3')}${sel('d4')}<div class="wn fix">zaad</div></div>
   <div class="wa">worden gebruikt als ↓</div>${sel('v')}<div class="wa">voor ↓</div><div class="wrow2">${sel('m1')}${sel('m2')}</div></div><button class="btn" id="wk">Controleer</button>`;
  $('#wk',box).onclick=()=>{const v={};$$('.wsel',box).forEach(s=>v[s.dataset.w]=s.value);let ok=0;
    const grpOk=(ids,set)=>{const vals=ids.map(i=>v[i]);ids.forEach(i=>{const g=set.includes(v[i])&&vals.filter(x=>x===v[i]).length===1;$(`[data-w="${i}"]`,box).classList.add(g?'yok':'yno');if(g)ok++})};
    ['z','g','gr','v'].forEach(i=>{const g=WEB.find(x=>x.id===i).a.includes(v[i]);$(`[data-w="${i}"]`,box).classList.add(g?'yok':'yno');if(g)ok++});
    grpOk(['d1','d2','d3','d4'],['wortel','stengel','blad','vrucht']);grpOk(['m1','m2'],['mens','dier']);
    $$('.wsel',box).forEach(s=>s.disabled=true);$('#wk',box).remove();fb(ok===10,ok+' van de 10 goed.'+(ok<10?' <small>Planten zorgen voor zuurstof en glucose. Glucose heeft de plant nodig voor groei van wortel, stengel, blad, vrucht en zaad. Die worden gebruikt als voedsel voor mens en dier. Zuurstof is ook nodig voor mens en dier.</small>':''));done(ok/10)}}
function tabelPart(box,fb,done){const T=D.tabel;const rows=shuffle(T.rows).slice(0,5),useOpts=T.rows.map(r=>r[3]).filter((x,i,a)=>a.indexOf(x)===i);
  box.innerHTML=`<p class="q">Tabel 1: vul in. Komt de grondstof van een plant of een dier, en waarvoor wordt hij gebruikt?</p><div class="tscroll"><table class="vtab"><tr><th>Grondstof</th><th>Plant of dier?</th><th>Gebruikt voor</th></tr>${rows.map((r,i)=>`<tr><th>${esc(r[0])}<div class="small mut" style="font-weight:600">${esc(r[2])}</div></th><td><select data-r="${i}" data-c="1"><option value=""></option><option>plant</option><option>dier</option></select></td><td><select data-r="${i}" data-c="3"><option value=""></option>${useOpts.map(o=>`<option>${esc(o)}</option>`).join('')}</select></td></tr>`).join('')}</table></div><button class="btn" id="tk">Controleer</button>`;
  $('#tk',box).onclick=()=>{let ok=0,n=0;$$('select',box).forEach(s=>{const want=rows[+s.dataset.r][+s.dataset.c],g=s.value===want;n++;if(g)ok++;else s.insertAdjacentHTML('afterend',`<div class="tfix">${esc(want)}</div>`);s.classList.add(g?'yok':'yno');s.disabled=true});$('#tk',box).remove();fb(ok===n,ok+' van de '+n+' goed.');done(ok/n)}}
const STOF={katoen:['plant','nu'],linnen:['plant','nu'],bamboe:['plant','nu'],tencel:['plant','nu'],wol:['dier','nu'],zijde:['dier','nu'],leer:['dier','nu'],'polyester (kunststof)':['plant/dier','vroeger']};
function clothesPart(box,fb,done){const items=['Jas','Jurk','Korte broek','Overhemd','Spijkerbroek','Trui','T-shirt'];
  box.innerHTML=`<p class="small mut">Kijk op het label van je eigen kleding. Kies de grondstof en vul de rest in. Kunststof (zoals polyester) is gemaakt van aardolie: dat komt van planten en dieren van vroeger.</p><div class="tscroll"><table class="vtab"><tr><th>Kledingstuk</th><th>Grondstof</th><th>Plant of dier?</th><th>Vroeger of nu?</th></tr>${items.map((k,i)=>`<tr><th>${k}</th><td><select data-i="${i}" data-c="s"><option value=""></option>${Object.keys(STOF).map(o=>`<option>${o}</option>`).join('')}</select></td><td><select data-i="${i}" data-c="pd"><option value=""></option><option>plant</option><option>dier</option><option>plant/dier</option></select></td><td><select data-i="${i}" data-c="vn"><option value=""></option><option>nu</option><option>vroeger</option></select></td></tr>`).join('')}</table></div><button class="btn" id="ck">Controleer</button>`;
  $('#ck',box).onclick=()=>{let ok=0,n=0;items.forEach((k,i)=>{const s=$(`[data-i="${i}"][data-c="s"]`,box).value;if(!s)return;const w=STOF[s];[['pd',0],['vn',1]].forEach(([c,j])=>{const el=$(`[data-i="${i}"][data-c="${c}"]`,box);n++;const g=el.value===w[j]||(w[j]==='plant/dier'&&el.value!=='');if(g)ok++;else el.insertAdjacentHTML('afterend',`<div class="tfix">${w[j]}</div>`);el.classList.add(g?'yok':'yno')})});
    $$('select',box).forEach(s=>s.disabled=true);$('#ck',box).remove();if(!n){fb(false,'Kies eerst bij een paar kledingstukken de grondstof.');return done(0)}fb(ok===n,ok+' van de '+n+' goed.');done(ok/n)}}
function classPart(box,fb,done){box.innerHTML=`<p class="small mut">Kijk rond in je klaslokaal of je kamer. Schrijf minstens acht objecten op, waarvan ze gemaakt zijn, plant of dier, en of fotosynthese aan de basis heeft gestaan. Voorbeeld: <i>tafel – hout – plant – ja</i>; <i>stoel – plastic (aardolie) – planten/dieren van vroeger – ja</i>.</p><textarea style="min-height:150px" placeholder="object – grondstof – plant/dier – fotosynthese?"></textarea><button class="btn" id="ck">Klaar</button>`;
  $('#ck',box).onclick=()=>{const n=$('textarea',box).value.split('\n').filter(l=>l.trim()).length;$('#ck',box).remove();fb(n>=8,n>=8?'Top! Kijk bij elk object: is het van hout, papier, katoen, leer of plastic (aardolie)? Dan heeft fotosynthese aan de basis gestaan.':'Je hebt er '+n+'. Probeer er minstens 8.');done(n>=8?1:n/8)}}

/* ---- OPDRACHTEN ---- */
V.opd=function(arg){
  if(arg){const o=OPD.find(x=>x.id===arg);return runOpd(o)}
  view.innerHTML=`<h2>Opdrachten uit je boek</h2><p class="small mut">Dit zijn precies de opdrachten van basisstof 5 (blz. 41-43) en basisstof 7 (blz. 59-60).</p>`+['5','7'].map(bs=>`<h3 style="margin-top:14px">Basisstof ${bs}</h3><div class="games">${OPD.filter(o=>o.bs===bs).map(o=>{const b=S.best['o:'+o.id];return `<button class="gm" data-o="${o.id}"><em>${b==null?'Opdracht '+o.nr:b>=1?'✓ Opdracht '+o.nr+' · goed':'Opdracht '+o.nr+' · '+Math.round(b*100)+'%'}</em><span>${esc(o.q.length>110?o.q.slice(0,108)+'…':o.q)}</span></button>`}).join('')}</div>`).join('');
  on('[data-o]',e=>go('opd',e.dataset.o))};
function runOpd(o){const idx=OPD.indexOf(o);const scores=[];
  view.innerHTML=`<button class="back-link" id="bk">← Alle opdrachten</button><div class="card stack"><div class="eyebrow">Basisstof ${o.bs} · opdracht ${o.nr}</div><p><b>${esc(o.q)}</b></p>${o.parts.map((p,i)=>`<div class="part" id="pt${i}"></div>`).join('')}</div><div id="nxt"></div>`;
  $('#bk').onclick=()=>go('opd');
  o.parts.forEach((p,i)=>part(p,$('#pt'+i),sc=>{scores[i]=sc;if(scores.filter(x=>x!=null).length===o.parts.length){const avg=scores.reduce((a,b)=>a+b,0)/scores.length;S.best['o:'+o.id]=Math.max(S.best['o:'+o.id]||0,avg);addXP(Math.round(avg*6));if(avg===1)confetti();
    const nx=OPD[idx+1];$('#nxt').innerHTML=`<div class="btns" style="margin-top:12px">${nx?`<button class="btn" id="nb">Volgende opdracht</button>`:''}<button class="btn ghost" id="ab">Alle opdrachten</button></div>`;if(nx)$('#nb').onclick=()=>go('opd',nx.id);$('#ab').onclick=()=>go('opd')}}))}

/* ---- OEFENEN ---- */
V.oef=function(arg){
  if(arg){const d=DR.find(x=>x.id===arg);if(d)return runDrill(d)}
  view.innerHTML=`<h2>Oefenen per onderwerp</h2><div class="games">${DR.map(d=>{const b=S.best['d:'+d.id];return `<button class="gm" data-d="${d.id}"><em>${b==null?'Nog niet gedaan':'Beste: '+Math.round(b*100)+'%'}</em><b>${esc(d.title)}</b><span>${esc(d.sub)}</span></button>`}).join('')}
   <button class="gm" data-x="kaart"><em>Begrippen</em><b>Kaartjes</b><span>Omschrijving → begrip en andersom.</span></button></div>`;
  on('[data-d]',e=>go('oef',e.dataset.d));on('[data-x]',()=>go('leer','kaart'))};
function runDrill(d){const items=d.items.filter(x=>x.k!=='mc'&&x.k!=='tf').concat(shuffle(d.items.filter(x=>x.k==='mc'||x.k==='tf')));let i=0,tot=0;play('d:'+d.id);
  const draw=()=>{if(i>=items.length){const p=tot/items.length;S.best['d:'+d.id]=Math.max(S.best['d:'+d.id]||0,p);addXP(Math.round(p*10));if(p>=.9)confetti();
      view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">${esc(d.title)}</div><div class="score">${Math.round(p*100)}%</div><div class="btns"><button class="btn" id="ag">Nog een keer</button><button class="btn ghost" id="bk">Andere onderwerpen</button></div></div>`;$('#ag').onclick=()=>runDrill(d);$('#bk').onclick=()=>go('oef');return}
    view.innerHTML=`<button class="back-link" id="bk">← Stoppen</button><div class="prog"><span>${i+1}/${items.length}</span><span class="bar"><i style="width:${i/items.length*100}%"></i></span></div><div class="card stack"><div class="eyebrow">${esc(d.title)}</div><div id="pb"></div><div id="nx"></div></div>`;
    $('#bk').onclick=()=>go('oef');
    part(items[i],$('#pb'),sc=>{tot+=sc;$('#nx').innerHTML=`<button class="btn" id="nb" style="width:100%;margin-top:10px">${i+1<items.length?'Volgende':'Uitslag'}</button>`;$('#nb').onclick=()=>{i++;draw()};$('#nb').focus()})};
  draw()}

/* ---- TOETS ---- */
V.toets=function(arg){if(arg==='so')return so();
  view.innerHTML=`<h2>Toets</h2><div class="games"><button class="gm" data-t="so"><em>${S.best.so!=null?'Beste cijfer: '+grade(S.best.so):'Zoals de SO'}</em><b>Oefen-SO</b><span>20 vragen over basisstof 5 en 7 door elkaar: begrippen, de formule, eetbare delen, brandstoffen, grondstoffen en uitleg-vragen.</span></button></div>`;
  on('[data-t]',e=>go('toets',e.dataset.t))};
function so(){const bq=sample(BEG,4).map(b=>({k:'type',q:'Welk begrip hoort bij: '+b.d,a:[b.t],show:b.t,beg:b.t}));
  const all=k=>DR.flatMap(d=>d.items.filter(x=>x.k===k));
  const eet=DR.find(d=>d.id==='eet').items.find(x=>x.k==='sort');const eq=sample(eet.items,3).map(it=>({k:'mc',q:'Welk deel van de plant is '+it[0]+'?',opts:eet.cats,a:eet.cats.indexOf(it[1])}));
  const opens=sample(OPD.flatMap(o=>o.parts.filter(p=>p.k==='open'&&(p.q||o.parts.length===1)&&p.need<=2).map(p=>Object.assign({},p,{q:p.q||o.q,l:''}))),3);
  const qs=[{k:'formula'},...bq,...eq,...sample(all('mc'),6),...sample(all('tf'),2),...opens,{k:'pick',q:'Welke twee stoffen ontstaan bij fotosynthese?',opts:['glucose','koolstofdioxide','water','zuurstof'],ok:['glucose','zuurstof']}].slice(0,20);
  const order=[qs[0],...shuffle(qs.slice(1))];let i=0,tot=0;const miss=[];
  const draw=()=>{if(i>=order.length){const p=tot/order.length;S.best.so=Math.max(S.best.so||0,p);addXP(Math.round(p*20));save();if(p>=.8)confetti();
      view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">Oefen-SO</div><div class="score">${grade(p)}</div><p><b>${String(Math.round(tot*10)/10).replace('.',',')} van de ${order.length} punten.</b></p><p class="small mut">Cijfer ter indicatie: 1 + 9 × je score.</p></div>${miss.length?`<div class="card stack"><h3>Kijk hier nog eens naar</h3><ul class="tipl">${miss.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div>`:''}<div class="btns"><button class="btn" id="ag">Nieuwe oefen-SO</button><button class="btn ghost" id="sm">Samenvatting</button></div>`;
      $('#ag').onclick=so;$('#sm').onclick=()=>go('leer','sam');return}
    const q=order[i];view.innerHTML=`<button class="back-link" id="bk">← Stoppen</button><div class="prog"><span>${i+1}/${order.length}</span><span class="bar"><i style="width:${i/order.length*100}%"></i></span><span>${String(Math.round(tot*10)/10).replace('.',',')} pt</span></div><div class="card stack"><div id="pb"></div><div id="nx"></div></div>`;
    $('#bk').onclick=()=>go('toets');
    part(q,$('#pb'),sc=>{tot+=sc;if(q.beg)mark('b:'+q.beg,sc===1);if(sc<1)miss.push(q.q||'De formule van de fotosynthese');$('#nx').innerHTML=`<button class="btn" id="nb" style="width:100%;margin-top:10px">${i+1<order.length?'Volgende':'Uitslag'}</button>`;$('#nb').onclick=()=>{i++;draw()};$('#nb').focus()})};
  draw()}

/* ---- BRONNEN ---- */
V.bron=function(){const B=D.bronnen||[];
  view.innerHTML=`<h2>Bronnen</h2><p class="small mut">Alles wat je docent heeft opgegeven, om zelf terug te lezen.</p>
  <div class="seg">${B.map((b,i)=>`<button data-b="${i}">${esc(b.title.replace(/^Basisstof (\d) · /,'BS$1 · '))}</button>`).join('')}</div>
  <div class="stack" style="margin-top:12px">${B.map((b,i)=>`<section class="card stack" id="bron${i}"><h3>${esc(b.title)}</h3>${
    b.type==='text'?`<pre class="instr">${esc(D.instructieVerbatim||D.instructie)}</pre>`:
    b.type==='img'?`<a href="${b.src}" target="_blank" rel="noopener"><img class="page" loading="lazy" src="${b.src}" alt="${esc(b.title)}"></a><p class="small mut">Tik op de pagina om hem groot te openen.</p>`:
    b.type==='link'?`<p>${esc(b.note||'')}</p><a class="btn" href="${b.src}" target="_blank" rel="noopener">Open de website</a>`:
    `<a class="btn" href="${b.src}" target="_blank" rel="noopener">Open</a>`}</section>`).join('')}</div>`;
  on('[data-b]',e=>$('#bron'+e.dataset.b).scrollIntoView({behavior:'smooth'}))};

window.__studieReload=ids=>{if(!ids.includes(M.id))return;S=Object.assign(DEF(),store.get());header();if(CUR==='start')go('start')};
header();const h=(location.hash||'').slice(1);go(V[h]?h:'start');
})();
