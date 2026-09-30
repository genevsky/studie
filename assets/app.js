(function(){
'use strict';
const D=window.EXAM;const M=D.meta;
const TV=D.tijdvakken, HUE=[28,12,352,322,285,240,205,172,140,95];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sample=(a,n)=>shuffle(a).slice(0,n);
const view=$('#view');document.title=M.title;$('#brand').textContent=M.brand;$('#sub').textContent=M.sub;
let cleanup=()=>{},CUR='start';
let V_start,V_leer,V_kaart,V_spel,V_toets;

/* ---- voortgang (alleen in deze browser) ---- */
const store={get(){try{return JSON.parse(localStorage.getItem('studie:'+M.id))||{}}catch(e){return{}}},set(v){try{localStorage.setItem('studie:'+M.id,JSON.stringify(v))}catch(e){}if(window.StudieSync)StudieSync.changed()}};
let S=Object.assign({xp:0,lb:{},exam:null,best:{},chk:{}},store.get());
const save=()=>{try{S.pct=ready().pct;S.stats={seen:BEG.filter(b=>S.lb['b:'+b.t]).length+TV.filter(t=>S.lb['t:'+t.n]).length,total:BEG.length+TV.length,unit:'kaartjes'}}catch(e){}S.ts=Date.now();store.set(S)};
const BEG=D.begrippen.filter(b=>!b.x),EXT=D.begrippen.filter(b=>b.x);
const VR=(D.vragen||[]).map((v,i)=>Object.assign({k:'v:'+i},v));
/* ---- Leitner: kaartjes komen terug na 1, 3, 7 en 14 dagen ---- */
const DAYMS=864e5,INT=[0,1,3,7,14];
const today=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/DAYMS);
const isDue=k=>{const e=S.lb[k];return !e||e.d<=today()};
const mastered=k=>{const e=S.lb[k];return !!e&&e.b>=2};
function mark(k,ok,force){const e=S.lb[k],t0=today();
  if(ok){if(!force&&e&&e.d>t0)return;const b=Math.min(4,(e?e.b:0)+1);let d=t0+INT[b];if(S.exam&&S.exam>t0)d=Math.min(d,Math.max(t0,S.exam-1));S.lb[k]={b,d,t:Date.now()}}
  else S.lb[k]={b:0,d:t0,t:Date.now()};save()}

const LV=[[0,'Neanderthaler'],[80,'Verzamelaar'],[220,'Jager'],[400,'Boer'],[650,'Archeoloog'],[950,'Farao']];
function lvl(){let i=0;LV.forEach((l,k)=>{if(S.xp>=l[0])i=k});const n=LV[i+1];return{i,name:LV[i][1],from:LV[i][0],next:n?n[0]:null}}
function header(){const L=lvl();$('#lvlName').textContent=L.name+' · '+S.xp+' XP';$('#lvlBar').style.width=(L.next?Math.min(100,100*(S.xp-L.from)/(L.next-L.from)):100)+'%'}
let tt;function toast(m){$$('.toast').forEach(e=>e.remove());const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.appendChild(e);clearTimeout(tt);tt=setTimeout(()=>e.remove(),2200)}
function addXP(n){const b=lvl().i;S.xp+=n;save();header();if(lvl().i>b)toast('Nieuw niveau: '+lvl().name+'!')}
function confetti(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const cols=['var(--sun)','var(--accent)','var(--good)','var(--bad)'];for(let i=0;i<46;i++){const e=document.createElement('i');e.className='cf';e.style.left=Math.random()*100+'vw';e.style.background=cols[i%4];e.style.animationDelay=Math.random()*.5+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),3200)}}
const grade=p=>Math.max(1,Math.round((1+9*p)*10)/10).toFixed(1).replace('.',',');

$('#strata').innerHTML=HUE.map(h=>`<i style="background:hsl(${h} 60% var(--tvl))"></i>`).join('');

/* ---- tabs ---- */
const ICON={
 start:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 leer:'<path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/>',
 kaart:'<rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
 spel:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 toets:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'};
const TABS=[['start','Start'],['leer','Leren'],['kaart','Kaartjes'],['spel','Spellen'],['toets','Toets']];
$('#tabs').innerHTML=TABS.map(t=>`<button class="tab" data-tab="${t[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[t[0]]}</svg>${t[1]}</button>`).join('');
$$('.tab').forEach(b=>b.addEventListener('click',()=>go(b.dataset.tab)));
function go(t){CUR=t;cleanup();cleanup=()=>{};$$('.tab').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t?'page':'false'));V[t]();window.scrollTo(0,0);try{history.replaceState(null,'','#'+t)}catch(e){}}
const on=(sel,fn,root=view)=>$$(sel,root).forEach(e=>e.addEventListener('click',()=>fn(e)));

/* ---- START ---- */
const sc=k=>{const e=S.lb[k];return !e?0:e.b>=2?1:e.b===1?.5:.2};
const cnt=ks=>({seen:ks.filter(k=>S.lb[k]).length,sure:ks.filter(mastered).length,tot:ks.length,sc:ks.reduce((a,k)=>a+sc(k),0)/(ks.length||1)});
const played=g=>{const n=(S.played||{})[g];return n?`<span class="donel">✓ ${n}× gespeeld</span>`:''};
function ready(){const B=cnt(BEG.map(b=>'b:'+b.t)),T=cnt(TV.map(t=>'t:'+t.n)),Q=cnt(VR.map(v=>v.k)),q=S.best.oefen||0;return{B,T,Q,kn:B.sc,tk:T.sc,q,pct:Math.round(100*(VR.length?.3*B.sc+.2*T.sc+.25*Q.sc+.25*q:.4*B.sc+.3*T.sc+.3*q))}}
const CHK=["Leerpagina's gelezen: p. 17, 20-23, 29-32, 38-41 en 47-49","De begrippen van p. 60-61: bij de omschrijving het begrip kunnen noemen","De tien tijdvakken in de goede volgorde, zoals in je boek","Bij elk tijdvak de jaartallen (achterkant van het kaartje)","De tijdlijn van tijdvak 1 met de vijf jaartallen"];
function planText(){const n=S.exam?S.exam-today():null;
  if(n==null)return 'Vul hieronder de datum van je toets in. Dan zet de app je kaartjes slim verspreid over de dagen.';
  if(n<0)return 'De toets is geweest. Goed gedaan!';
  if(n===0)return 'Vandaag is de toets. Doe alleen 10 minuten de tijdvakken en de tijdlijn en ontspan daarna.';
  if(n===1)return 'Morgen is de toets. Doe de kaartjes die aan de beurt zijn, de tijdvakken en teken de tijdlijn uit je hoofd.';
  if(n<=4)return 'Nog '+n+' dagen. Doe alle kaartjes die aan de beurt zijn en één oefentoets.';
  return 'Nog '+n+' dagen. Doe elke dag een paar kaartjes, één spel en lees één paragraaf.'}
V_start=function(){
  const r=ready();const pc=p=>VR.filter(v=>v.p===p);
  const tile=(n,title,sub,btns,prog)=>`<section class="card stack focus"><div class="fhead"><span class="fno">${n}</span><div><h2>${title}</h2><p class="small mut">${sub}</p></div></div>${prog?`<p class="small"><b style="color:var(--good)">${prog}</b></p>`:''}<div class="btns">${btns}</div></section>`;
  const B=(act,label,ghost)=>`<button class="btn ${ghost?'ghost':''}" data-act="${act}">${label}</button>`;
  view.innerHTML=`
  <section class="hero"><h1>Toets geschiedenis: oefen deze 3 onderdelen</h1><p>Doe ze op volgorde. Klaar? Maak dan de oefentoets.</p></section>
  ${tile(1,'De vragen van 1.1 t/m 1.4','De 17 vragen uit de blauwe vakjes “Jouw leerdoelen” aan het begin van elke paragraaf. Lees de antwoorden en oefen ze dan.',
    B('leer:vr','Lees vragen en antwoorden',1)+B('toets:vraag','Oefen de vragen'),
    r.Q.seen?`${r.Q.seen} van de ${VR.length} geoefend, ${VR.filter(v=>S.lb[v.k]&&S.lb[v.k].b>=1).length} goed`:'')}
  ${tile(2,'Tijdlijn en tijdvakken','De tien tijdvakken met naam en jaartallen, en de vijf jaartallen van de tijdlijn van tijdvak 1.',
    B('leer:tv','Bekijk de tijdvakken',1)+B('spel:trein','Tijdvakkentrein')+B('spel:jaar','Welk tijdvak?')+B('spel:tl5','Tijdlijn bouwen'),
    r.T.seen||(S.played||{}).trein?`Tijdvakken: ${r.T.seen}/10 geoefend · Trein ${(S.played||{}).trein||0}× · Tijdlijn ${(S.played||{}).tl5||0}×`:'')}
  ${tile(3,'Begrippen (p. 60-61)','Op de toets krijg je de omschrijving en schrijf jij het begrip op.',
    B('leer:bg','Bekijk de begrippen',1)+B('kaart:beg','Kaartjes')+B('toets:typ','Typ het begrip'),
    r.B.seen?`${r.B.seen} van de ${BEG.length} geoefend, ${r.B.sure} zitten erin`:'')}
  ${tile('✓','Oefentoets','20 vragen door elkaar: begrippen, tijdvakken, tijdlijn en vragen uit de paragrafen. Met cijfer.',
    B('toets:oefen','Start de oefentoets'),S.best.oefen!=null?'Beste score: '+Math.round(S.best.oefen*100)+'%':'')}
  <section class="card ready"><div class="pct">${r.pct}<small>%</small></div><div class="stack" style="gap:8px"><b>Klaar voor de toets</b>
    <div class="mini"><div><span>Vragen</span><span class="bar"><i style="width:${Math.round(r.Q.sc*100)}%"></i></span></div>
    <div><span>Tijdvakken</span><span class="bar"><i style="width:${Math.round(r.tk*100)}%"></i></span></div>
    <div><span>Begrippen</span><span class="bar"><i style="width:${Math.round(r.kn*100)}%"></i></span></div>
    <div><span>Oefentoets</span><span class="bar"><i style="width:${Math.round(r.q*100)}%"></i></span></div></div></div></section>`;
  on('[data-act]',e=>{const [tab,x]=e.dataset.act.split(':');
    if(tab==='leer'){leerTab=x;go('leer')}
    else if(tab==='kaart'){K.deck=x;K.mode='exam';go('kaart')}
    else if(tab==='spel'){go('spel');const b=$(`[data-g="${x}"]`);if(b)b.click()}
    else if(tab==='toets'){go('toets');const b=$(`[data-t="${x}"]`);if(b)b.click()}});
};

/* ---- LEREN ---- */
let leerTab='vr';
V_leer=function(){
  view.innerHTML=`<div class="seg" id="seg">${[['vr','Vragen 1.1-1.4'],['tv','Tijdvakken'],['tl','Tijdlijn'],['bg','Begrippen'],['sam','Samenvatting']].map(x=>`<button data-l="${x[0]}" aria-pressed="${leerTab===x[0]}">${x[1]}</button>`).join('')}</div><div id="lbody" class="stack"></div>`;
  on('[data-l]',e=>{leerTab=e.dataset.l;V_leer()});
  const b=$('#lbody');
  if(leerTab==='vr'){
    b.innerHTML=`<p class="mut small">Dit zijn de vragen uit de blauwe vakjes “Jouw leerdoelen” aan het begin van elke paragraaf. Probeer eerst zelf het antwoord te zeggen en tik dan op de vraag.</p>`+['1.1','1.2','1.3','1.4'].map(p=>{const s0=D.summary.find(x=>x.id===p);return `<div class="card stack"><h3>${p} ${esc(s0?s0.title:'')}</h3>${VR.filter(v=>v.p===p).map(v=>`<details class="vq"><summary>${esc(v.q)}</summary><ul>${v.pts.map(x=>`<li>${md(x)}</li>`).join('')}</ul>${v.need<v.pts.length?`<p class="small mut">Noem er minstens ${v.need}.</p>`:''}</details>`).join('')}</div>`}).join('')+`<button class="btn" id="goq">Oefen de vragen</button>`;
    $('#goq').onclick=()=>{go('toets');$('[data-t="vraag"]').click()};
  }else if(leerTab==='bg'){
    b.innerHTML=`<p class="mut small">Op de toets krijg je de omschrijving. Lees de omschrijving, zeg het begrip en tik om te kijken.</p>`+['1.1','1.2','1.3','1.4'].map(p=>`<div class="card stack"><h3>Paragraaf ${p}</h3>${BEG.filter(x=>x.p===p).map(x=>`<details class="vq"><summary>${esc(x.d)}</summary><p><b>${esc(x.t)}</b>${x.h?`<br><span class="small mut">${esc(x.h)}</span>`:''}</p></details>`).join('')}</div>`).join('');
  }else if(leerTab==='sam'){
    b.innerHTML=D.summary.map((s,i)=>`<details class="sum" ${i===0?'open':''}><summary><span>Paragraaf ${s.id} · ${esc(s.pages)}</span><b>${esc(s.title)}</b></summary><div class="body">
      <p class="one">${esc(s.one)}</p><p class="small mut">${esc(s.key)}</p>
      ${s.sections.map(x=>`<div><h4>${esc(x.h)}</h4><ul>${x.pts.map(p=>`<li>${md(p)}</li>`).join('')}</ul></div>`).join('')}
      <details><summary style="cursor:pointer;font-weight:800;color:var(--accent)">Begrippen van deze paragraaf</summary><dl class="dl" style="margin-top:10px">${D.begrippen.filter(x=>x.p===s.id||(!x.x?false:false)).sort((a,b)=>(a.x?1:0)-(b.x?1:0)).map(x=>`<div><dt>${esc(x.t)}${x.x?'<span class="tag">extra</span>':''}</dt><dd>${esc(x.d)}${x.e&&!x.x?`<br><i>In gewone woorden: ${esc(x.e)}</i>`:''}</dd></div>`).join('')}</dl></details>
      <p class="one" style="background:color-mix(in srgb,var(--sun) 30%,transparent)"><b>Vertel het na.</b> ${esc(s.teach)}</p>
    </div></details>`).join('');
  }else if(leerTab==='tl'){
    const li=e=>`<li class="${e.g==='cut'?'cut':''}"><div class="lab"><span class="when">${esc(e.w)}</span>${esc(e.l)}</div></li>`;
    const core=D.timeline.filter(e=>e.core),more=D.timeline.filter(e=>!e.core);
    b.innerHTML=`<div class="card stack"><h3>De tijdlijn uit je boek</h3><p class="mut small">Dit staat op de tijdlijn van tijdvak 1 (bij de begrippen, p. 60-61). Let op: bij v.C. loopt het getal terug. 10.000 v.C. is dus ouder dan 9000 v.C.</p><ol class="tl">${core.map(li).join('')}</ol></div><button class="btn" id="gotl">Oefen: tijdlijn bouwen</button>`;$('#gotl').onclick=()=>{go('spel');$('[data-g="tl5"]').click()};
  }else if(leerTab==='tip'){
    b.innerHTML=`<div class="card stack"><h2>Ken je de leerdoelen?</h2><p class="mut small">Vink af als je het kunt uitleggen zonder in het boek te kijken.</p>${D.summary.map(s=>`<div><h4 style="color:var(--accent);margin-bottom:2px">Paragraaf ${s.id} · ${esc(s.title)}</h4>${D.leerdoelen[s.id].map((g,i)=>`<label class="chk"><input type="checkbox" data-g="${s.id}-${i}" ${S.chk['g'+s.id+i]?'checked':''}><span>${esc(g.replace('Je kunt ',''))}</span></label>`).join('')}</div>`).join('')}</div>
    <div class="card stack"><h2>Vergelijk: jager of boer</h2><div style="overflow-x:auto"><table class="cmp">${D.compare.map((r,i)=>`<tr>${r.map(c=>i===0?`<th>${esc(c)}</th>`:`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div></div>
    ${D.tips.map(t=>`<div class="card stack"><h3>${esc(t.h)}</h3><ul class="tipl">${t.p.map(p=>`<li>${md(p)}</li>`).join('')}</ul></div>`).join('')}`;
    $$('[data-g]',b).forEach(e=>e.addEventListener('change',()=>{const k=e.dataset.g.split('-');S.chk['g'+k[0]+k[1]]=e.checked;save()}));
  }else{
    const words=D.eezelsbrug.split(' ');
    b.innerHTML=`<p class="mut">Leer de tien tijdvakken in volgorde. Op het kaartje staat voorop de naam en achterop de jaartallen.</p>
    <div class="tvlist">${TV.map((t,i)=>`<div class="tvc" style="--h:${HUE[i]}"><div class="no">${t.n}</div><div><b>${esc(t.name)}</b><span class="y">${esc(t.yrs)}</span> <span class="tg">· ${esc(t.tag)}</span></div></div>`).join('')}</div>
    <div class="card stack"><div class="eyebrow">Ezelsbruggetje</div><p class="mn">${words.map(w=>`<b>${esc(w[0])}</b>${esc(w.slice(1))}`).join(' ')}</p>
    <div class="mnmap">${D.eezelsbrugUitleg.map((w,i)=>`<span>${esc(words[i][0])} = ${esc(w)}</span>`).join('')}</div></div>`;
  }
};

/* ---- KAARTJES ---- */
const K={deck:'beg',mode:'exam',para:'all',only:true,q:[],i:0,flip:false,seen:0,good:0};
function deckCards(){
  const bf=(b,ext)=>({k:'b:'+b.t,f:K.mode==='exam'?{txt:b.d,hint:ext?'Extra woord: welk begrip is dit?':'Welk begrip is dit?'}:{big:b.t,hint:'Wat betekent dit?'},
      b:K.mode==='exam'?{big:b.t,sub:b.e||'',tip:b.h}:{txt:b.d,sub:b.e||'',tip:b.h,big:''}});
  if(K.deck==='beg')return BEG.filter(b=>K.para==='all'||b.p===K.para).map(b=>bf(b,false));
  if(K.deck==='ext')return EXT.map(b=>bf(b,true));
  if(K.deck==='tv')return TV.map(t=>({k:'t:'+t.n,f:K.mode==='exam'?{big:t.name,sub:'Tijdvak '+t.n,hint:'Welke jaartallen?'}:{big:t.yrs,hint:'Welk tijdvak?'},b:K.mode==='exam'?{big:t.yrs,sub:t.emoji+' '+t.tag}:{big:t.name,sub:'Tijdvak '+t.n+' · '+t.tag}}));
  return D.weetjes.map(w=>({k:'w:'+w.q,f:{txt:w.q,hint:'Weet je het?'},b:{txt:w.a}}));
}
function kBuild(){const all=deckCards();K.q=shuffle(K.only?all.filter(c=>isDue(c.k)):all);K.i=0;K.flip=false;K.seen=0;K.good=0}
V_kaart=function(){kBuild();kDraw();
  const key=e=>{if(e.key===' '||e.key==='Enter'){if(!['BUTTON','INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();kFlip()}}else if(e.key==='ArrowRight'&&K.flip)kAnswer(true);else if(e.key==='ArrowLeft'&&K.flip)kAnswer(false)};
  document.addEventListener('keydown',key);cleanup=()=>document.removeEventListener('keydown',key)};
function kFlip(){const c=$('#c3');if(!c)return;K.flip=!K.flip;c.classList.toggle('flipped',K.flip);$('#kbtn').innerHTML=kButtons()}
function kButtons(){return K.flip?`<button class="btn bad" data-k="0">Nog oefenen</button><button class="btn good" data-k="1">Weet ik</button>`:`<button class="btn" data-k="f">Draai om</button>`}
function kAnswer(ok){const c=K.q[K.i];if(!c)return;mark(c.k,ok,true);if(ok){K.good++;addXP(2)}else if(!c._r){c._r=1;K.q.push(c)}K.i++;K.flip=false;kDraw()}
function face(o,cls){return `<div class="face ${cls}"><div class="hint">${esc(o.hint||'Antwoord')}</div>${o.big?`<div class="big">${esc(o.big)}</div>`:''}${o.txt?`<div class="txt">${esc(o.txt)}</div>`:''}${o.sub?`<div class="sub">${o.big?'In gewone woorden: ':''}${esc(o.sub)}</div>`:''}${o.tip?`<div class="tipline">Onthoud: ${esc(o.tip)}</div>`:''}</div>`}
function kDraw(){
  const modeLbl=(K.deck==='beg'||K.deck==='ext')?[['exam','Omschrijving → begrip'],['rev','Begrip → omschrijving']]:K.deck==='tv'?[['exam','Naam → jaartallen'],['rev','Jaartallen → naam']]:null;
  const all=deckCards(),dueN=all.filter(c=>isDue(c.k)).length,masN=all.filter(c=>mastered(c.k)).length;
  let h=`<div class="seg">${[['beg','Begrippen (32)'],['tv','Tijdvakken']].map(x=>`<button data-d="${x[0]}" aria-pressed="${K.deck===x[0]}">${x[1]}</button>`).join('')}</div>`;
  if(modeLbl)h+=`<div class="seg">${modeLbl.map(x=>`<button data-m="${x[0]}" aria-pressed="${K.mode===x[0]}">${x[1]}</button>`).join('')}</div>`;
  if(K.deck==='beg')h+=`<div class="seg">${['all','1.1','1.2','1.3','1.4'].map(p=>`<button data-p="${p}" aria-pressed="${K.para===p}">${p==='all'?'Alle paragrafen':'Par. '+p}</button>`).join('')}</div>`;
  if(K.deck==='ext')h+=`<p class="small mut">Deze woorden staan in de tekst, maar niet op de begrippenlijst van p. 60-61. Eerst de 32 begrippen leren.</p>`;
  h+=`<label class="chk" style="padding:0"><input type="checkbox" id="only" ${K.only?'checked':''}><span class="small">Alleen kaartjes die vandaag aan de beurt zijn (${dueN} van ${all.length}, ${all.filter(c=>S.lb[c.k]).length} geoefend, ${masN} zitten erin)</span></label>`;
  const c=K.q[K.i];
  if(!c){
    h+=`<div class="card stack" style="text-align:center"><h2>${K.q.length?'Stapel klaar!':'Voor vandaag ben je klaar met deze stapel'}</h2><p class="mut">${K.q.length?`Je kende ${K.good} van ${K.q.length} beurten. Kaartjes die je kent komen later terug: morgen, over 3, 7 en 14 dagen.`:'Alle kaartjes die aan de beurt waren zijn gedaan. Kom morgen terug, of oefen alles nog eens.'}</p><div class="btns"><button class="btn" id="again">${K.q.length?'Nog een ronde':'Alles nog eens oefenen'}</button><button class="btn ghost" id="reset">Voortgang wissen</button></div></div>`;
    if(K.q.length&&K.good>=K.q.length*.8)setTimeout(confetti,50);
  }else{
    h+=`<div class="prog"><span>${K.i+1} / ${K.q.length}</span><span class="bar"><i style="width:${100*K.i/K.q.length}%"></i></span></div>
    <div class="card3d ${K.flip?'flipped':''}" id="c3"><div class="in">${face(c.f,'front')}${face(c.b,'back')}</div></div>
    <div class="btns" id="kbtn">${kButtons()}</div><p class="small mut" style="text-align:center">Zeg eerst hardop je antwoord, draai dan om. Toetsenbord: spatie = omdraaien, pijltje rechts = weet ik, links = nog oefenen</p>`;
  }
  view.innerHTML=h;
  on('[data-d]',e=>{K.deck=e.dataset.d;K.mode='exam';kBuild();kDraw()});
  on('[data-m]',e=>{K.mode=e.dataset.m;kBuild();kDraw()});
  on('[data-p]',e=>{K.para=e.dataset.p;kBuild();kDraw()});
  const o=$('#only');if(o)o.addEventListener('change',()=>{K.only=o.checked;kBuild();kDraw()});
  const ag=$('#again');if(ag)ag.addEventListener('click',()=>{K.only=false;kBuild();kDraw()});
  const rs=$('#reset');if(rs)rs.addEventListener('click',()=>{all.forEach(c=>{delete S.lb[c.k]});save();K.only=true;kBuild();kDraw()});
  const c3=$('#c3');if(c3)c3.addEventListener('click',kFlip);
  const kb=$('#kbtn');if(kb)kb.addEventListener('click',e=>{const t=e.target.closest('[data-k]');if(!t)return;const v=t.dataset.k;if(v==='f')kFlip();else kAnswer(v==='1')});
}

/* ---- SPELLEN ---- */
V_spel=function(){
  view.innerHTML=`<h2>Spellen</h2><div class="games">
  <button class="gm" data-g="trein"><em>Tijdvakken</em><b>Tijdvakkentrein</b><span>Zet de tien tijdvakken in de goede volgorde.</span>${played('trein')}</button>
  <button class="gm" data-g="jaar"><em>Tijdvakken</em><b>Welk tijdvak?</b><span>Jaartallen erbij, naam eronder. En andersom.</span>${played('jaar')}</button>
  <button class="gm" data-g="tl5"><em>Tijdlijn</em><b>Tijdlijn bouwen</b><span>Zet de vijf gebeurtenissen van je boek op volgorde.</span>${played('tl5')}</button>
  <button class="gm" data-g="snel"><em>Begrippen</em><b>Snelle ronde</b><span>60 seconden. Zoveel mogelijk begrippen raden.</span>${played('snel')}</button>
  <button class="gm" data-g="koppel"><em>Begrippen</em><b>Koppel</b><span>Verbind elk begrip met de goede omschrijving.</span>${played('koppel')}</button></div>`;
  on('[data-g]',e=>{const g=e.dataset.g;S.played=S.played||{};S.played[g]=(S.played[g]||0)+1;save();G[g]()});
};
function gShell(title){view.innerHTML=`<button class="back-link" id="bk">← Alle spellen</button><h2>${title}</h2><div id="g" class="stack"></div>`;$('#bk').addEventListener('click',()=>go('spel'));return $('#g')}
function gEnd(box,txt,xp,again){addXP(xp);box.innerHTML=`<div class="card stack" style="text-align:center"><div class="score">${txt}</div><p class="mut">+${xp} XP</p><div class="btns"><button class="btn" id="ag">Nog een keer</button><button class="btn ghost" id="bk2">Andere spellen</button></div></div>`;$('#ag').addEventListener('click',again);$('#bk2').addEventListener('click',()=>go('spel'))}
const G={};
G.trein=function(){
  const box=gShell('Tijdvakkentrein');let next=0,mist=0,pool=shuffle(TV),bad=null;
  (function draw(){
    box.innerHTML=`<p class="mut">Tik de tijdvakken van oud naar nieuw. Fouten: <b>${mist}</b></p>
    <ol class="wagons">${TV.map((t,i)=>i<next?`<li class="wagon ok" style="--h:${HUE[i]}"><b>${t.n}. ${esc(t.name.replace('Tijd van ',''))}</b><small>${esc(t.yrs)}</small></li>`:`<li class="wagon ${i===next?'now':''}"><b>${i+1}</b><small>?</small></li>`).join('')}</ol>
    <div class="chips">${pool.map(t=>`<button class="chip ${bad===t.n?'shake':''}" data-n="${t.n}">${esc(t.name)}</button>`).join('')}</div>`;
    bad=null;
    on('[data-n]',e=>{const n=+e.dataset.n;if(n===next+1){pool=pool.filter(t=>t.n!==n);next++;addXP(2);if(next===10){gEnd(box,mist===0?'Foutloos!':mist+' fout'+(mist>1?'en':''),Math.max(5,25-mist*3),G.trein);if(!mist)confetti();return}}else{mist++;bad=n}draw()},box);
  })();
};
G.jaar=function(){
  const box=gShell('Welk tijdvak?');const qs=shuffle(TV).map((t,i)=>({t,rev:i%2===1}));let i=0,ok=0;
  (function draw(){
    const {t,rev}=qs[i];const others=sample(TV.filter(x=>x.n!==t.n),3);const opts=shuffle([t,...others]);
    box.innerHTML=`<div class="prog"><span>${i+1} / 10</span><span class="bar"><i style="width:${i*10}%"></i></span></div><div class="q">${rev?'Welke jaartallen horen bij <b>'+esc(t.name)+'</b>?':'Welk tijdvak is dit: <b>'+esc(t.yrs)+'</b>?'}</div><div class="opts">${opts.map(o=>`<button class="opt" data-n="${o.n}">${esc(rev?o.yrs:o.name)}</button>`).join('')}</div><div id="fb"></div>`;
    on('.opt',e=>{const good=+e.dataset.n===t.n;$$('.opt',box).forEach(b=>{b.disabled=true;if(+b.dataset.n===t.n)b.classList.add('right')});if(good){ok++;mark('t:'+t.n,true)}else{e.classList.add('wrong');mark('t:'+t.n,false)}
      $('#fb').innerHTML=`<div class="fb ${good?'good':'bad'}">${good?'Goed!':'Nee.'} ${esc(t.name)} · ${esc(t.yrs)}</div><button class="btn" id="nx" style="margin-top:10px;width:100%">${i===9?'Klaar':'Volgende'}</button>`;
      $('#nx').addEventListener('click',()=>{i++;if(i===10){gEnd(box,ok+' / 10',ok*3,G.jaar);if(ok>=9)confetti()}else draw()})},box);
  })();
};
G.tl5=()=>tlGame(5);G.tl10=()=>tlGame(10);
function tlGame(n){
  const box=gShell(n===5?'Tijdlijn bouwen':'Tijdlijn bouwen XL');
  const items=(n===5?D.timeline.filter(e=>e.core):D.timeline.filter(e=>e.y)).slice().sort((a,b)=>a.y-b.y);
  let next=0,mist=0,pool=shuffle(items),bad=null;
  (function draw(){
    box.innerHTML=`<p class="mut">Tik de gebeurtenissen van oud naar nieuw. Let op: bij v.C. loopt het getal terug, dus 10.000 v.C. komt vóór 9000 v.C. Fouten: <b>${mist}</b></p>
    <ol class="wagons" style="grid-template-columns:1fr">${items.map((e,i)=>i<next?`<li class="wagon ok" style="--h:${HUE[i%10]}"><b>${esc(e.w)}</b><small>${esc(e.l)}</small></li>`:`<li class="wagon ${i===next?'now':''}"><b>${i+1}</b><small>?</small></li>`).join('')}</ol>
    <div class="chips">${pool.map((e,i)=>`<button class="chip ${bad===e.y?'shake':''}" data-y="${e.y}">${esc(e.l.replace(/\. Begin van.*$/,''))}</button>`).join('')}</div>`;
    bad=null;
    on('[data-y]',b=>{const y=+b.dataset.y;if(y===items[next].y){pool=pool.filter(e=>e.y!==y);next++;addXP(2);if(next===items.length){gEnd(box,mist===0?'Foutloos!':mist+' fout'+(mist>1?'en':''),Math.max(5,20-mist*3),()=>tlGame(n));if(!mist)confetti();return}}else{mist++;bad=y}draw()},box);
  })();
}
G.snel=function(){
  const box=gShell('Snelle ronde');let left=60,ok=0,combo=0,tm;
  const B=shuffle(BEG);let bi=0;
  cleanup=()=>clearInterval(tm);
  function q(){const b=B[bi++%B.length];const pool=BEG.filter(x=>x.t!==b.t);const same=shuffle(pool.filter(x=>x.p===b.p)),rest=shuffle(pool.filter(x=>x.p!==b.p));return{b,opts:shuffle([b,...same.concat(rest).slice(0,3)])}}
  let cur=q();
  function draw(){box.innerHTML=`<div class="timer"><span id="tl">${left}s</span><span class="bar"><i id="tb" style="width:${left/.6}%"></i></span><span>${ok} goed${combo>1?' · x'+combo:''}</span></div><div class="quote">${esc(cur.b.d)}</div><div class="opts">${cur.opts.map(o=>`<button class="opt" data-t="${esc(o.t)}">${esc(o.t)}</button>`).join('')}</div>`;
    on('.opt',e=>{if(e.dataset.t===cur.b.t){ok++;combo++;mark('b:'+cur.b.t,true)}else{combo=0;mark('b:'+cur.b.t,false);toast('Het was: '+cur.b.t)}cur=q();draw()},box)}
  draw();
  tm=setInterval(()=>{left--;const a=$('#tl');if(a){a.textContent=left+'s';$('#tb').style.width=left/.6+'%'}if(left<=0){clearInterval(tm);const best=Math.max(S.best.snel||0,ok);S.best.snel=best;gEnd(box,ok+' goed',Math.min(40,ok*2),G.snel);box.insertAdjacentHTML('beforeend',`<p class="mut" style="text-align:center">Jouw record: ${best}</p>`);if(ok>=10)confetti()}},1000);
};
G.koppel=function(){
  const box=gShell('Koppel');const P=sample(BEG.filter(b=>b.d.length<110),6);let sel=null,done=0;
  const L=shuffle(P),R=shuffle(P);
  box.innerHTML=`<p class="mut">Tik een begrip en daarna de omschrijving die erbij hoort.</p><div class="pairs" id="pp">${L.map((b,i)=>`<button data-s="l" data-t="${esc(b.t)}"><b>${esc(b.t)}</b></button><button data-s="r" data-t="${esc(R[i].t)}">${esc(R[i].d)}</button>`).join('')}</div>`;
  const btns=$$('#pp button',box);
  btns.forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('done'))return;
    if(!sel||sel.dataset.s===b.dataset.s){btns.forEach(x=>x.classList.remove('sel'));b.classList.add('sel');sel=b;return}
    if(sel.dataset.t===b.dataset.t){[sel,b].forEach(x=>{x.classList.remove('sel');x.classList.add('done')});sel=null;done++;addXP(2);
      if(done===6){gEnd(box,'Alles gekoppeld!',10,G.koppel);confetti()}}
    else{const s=sel;sel=null;[s,b].forEach(x=>{x.classList.remove('sel');x.classList.add('shake');setTimeout(()=>x.classList.remove('shake'),400)})}}));
  /* de linker- en rechterkolom staan naast elkaar in dezelfde volgorde; daarom is de volgorde per rij gemengd */
};
G.jb=function(){
  const box=gShell('Jager of boer?');const Q=sample(D.sort,12);let i=0,ok=0;
  (function draw(){
    box.innerHTML=`<div class="prog"><span>${i+1} / 12</span><span class="bar"><i style="width:${i/12*100}%"></i></span></div><div class="sortcard" id="sc">${esc(Q[i].t)}</div>
    <div class="btns"><button class="btn ghost" data-s="j">Jager-verzamelaars</button><button class="btn ghost" data-s="b">Boeren</button></div>`;
    on('[data-s]',e=>{const good=e.dataset.s===Q[i].s;if(good)ok++;const sc=$('#sc');sc.classList.add(good?'ok':'no');sc.innerHTML=(good?'Goed! ':'Nee, dit hoort bij ')+(good?'':(Q[i].s==='j'?'jager-verzamelaars':'boeren'));$$('[data-s]',box).forEach(b=>b.disabled=true);
      setTimeout(()=>{i++;if(i===12){gEnd(box,ok+' / 12',ok*2,G.jb);if(ok>=11)confetti()}else draw()},good?550:1300)},box);
  })();
};

/* ---- TOETS ---- */
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
function lev(a,b){const m=[];for(let i=0;i<=a.length;i++){m[i]=[i]}for(let j=0;j<=b.length;j++)m[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return m[a.length][b.length]}
const ALT={samenleving:['maatschappij'],prehistorie:['voorgeschiedenis'],koninkrijk:['koninkrijken'],landbouwsamenleving:['landbouwmaatschappij'],staat:['staten'],nomade:['nomaden'],onderdaan:['onderdanen'],ambacht:['ambachten'],'samenleving van jager-verzamelaars':['jagerverzamelaarssamenleving','jagersverzamelaarssamenleving','samenlevingvanjagersenverzamelaars']};
function judge(ans,t){const n=norm(ans);if(!n)return 0;const c=[norm(t),...(ALT[t]||[]).map(norm)];if(c.includes(n))return 1;const d=Math.min(...c.map(x=>lev(n,x)));return d<=1&&n.length>=6?.5:0}
function qBegrip(b){const pool=BEG.filter(x=>x.t!==b.t);const opts=shuffle([b.t,...shuffle(pool.filter(x=>x.p===b.p)).concat(shuffle(pool.filter(x=>x.p!==b.p))).slice(0,3).map(x=>x.t)]);return{k:'mc',q:'Welk begrip hoort bij deze omschrijving?',quote:b.d,opts,a:opts.indexOf(b.t),why:'Het begrip is: '+b.t+'.',begrip:b.t}}
function qTv(){const t=TV[Math.floor(Math.random()*10)],rev=Math.random()<.5;const o=shuffle([t,...sample(TV.filter(x=>x.n!==t.n),3)]);return{k:'mc',q:rev?'Welke jaartallen horen bij "'+t.name+'"?':'Welk tijdvak hoort bij '+t.yrs+'?',opts:o.map(x=>rev?x.yrs:x.name),a:o.indexOf(t),why:t.name+' · '+t.yrs}}
function qMc(m){const o=shuffle(m.o.map((x,i)=>({x,i})));return{k:'mc',q:m.q,opts:o.map(z=>z.x),a:o.findIndex(z=>z.i===m.a),why:m.w}}
function qTl(){const core=D.timeline.filter(e=>e.core),e=core[Math.floor(Math.random()*core.length)],rev=Math.random()<.5;const o=shuffle(core.slice());
  return rev?{k:'mc',q:'Wanneer was dit? '+e.l,opts:o.map(x=>x.w),a:o.indexOf(e),why:e.w+': '+e.l}:{k:'mc',q:'Wat gebeurde er in '+e.w+'?',opts:o.map(x=>x.l),a:o.indexOf(e),why:e.w+': '+e.l}}
const vq=v=>({k:'open',o:v});
V_toets=function(){
  const best=k=>S.best[k]!=null?`Beste: ${Math.round(S.best[k]*100)}%`:'Nog niet gemaakt';
  view.innerHTML=`<h2>Toetsen</h2><div class="games">
  <button class="gm" data-t="vraag"><em>${best('vraag')}</em><b>Vragen 1.1 t/m 1.4</b><span>De 17 vragen van de leerdoelen. Zeg of schrijf je antwoord en kijk het zelf na.</span></button>
  <div class="btns">${['1.1','1.2','1.3','1.4'].map(p=>`<button class="btn ghost" data-t="vraag:${p}">Alleen ${p} (${VR.filter(v=>v.p===p).length})</button>`).join('')}</div>
  <button class="gm" data-t="typ"><em>${best('typ')}</em><b>Typ het begrip</b><span>Zoals op de toets: je krijgt de omschrijving en schrijft het begrip op.</span></button>
  <button class="gm" data-t="tvt"><em>${best('tvt')}</em><b>Tijdvakken en tijdlijn</b><span>12 vragen over de namen, de jaartallen en de tijdlijn.</span></button>
  <button class="gm" data-t="oefen"><em>${best('oefen')}</em><b>Oefentoets</b><span>20 vragen door elkaar: 8 begrippen, 8 tijdvakken en tijdlijn, 4 vragen uit de paragrafen. Met cijfer.</span></button></div>`;
  on('[data-t]',e=>{const t=e.dataset.t;
    if(t==='oefen')quiz('Oefentoets','oefen',[...shuffle([...sample(BEG,8).map(b=>({k:'typ',b})),qTv(),qTv(),qTv(),qTv(),qTv(),qTv(),qTl(),qTl()]),...sample(VR,4).map(vq)]);
    if(t==='tvt')quiz('Tijdvakken en tijdlijn','tvt',shuffle([...Array.from({length:8},qTv),qTl(),qTl(),qTl(),qTl()]));
    if(t==='vraag')quiz('Vragen 1.1 t/m 1.4','vraag',VR.map(vq));
    if(t.startsWith('vraag:')){const p=t.slice(6);quiz('Vragen '+p,'vraag'+p,VR.filter(v=>v.p===p).map(vq))}
    if(t==='typ')quiz('Typ het begrip','typ',sample(BEG,10).map(b=>({k:'typ',b})))});
};
function quiz(title,key,qs){
  let i=0,score=0;const miss=[];
  function draw(){
    const q=qs[i];
    let h=`<button class="back-link" id="bk">← Stoppen</button><div class="prog"><span>${i+1} / ${qs.length}</span><span class="bar"><i style="width:${i/qs.length*100}%"></i></span></div>`;
    if(q.k==='mc')h+=`<div class="q">${esc(q.q)}</div>${q.quote?`<div class="quote">${esc(q.quote)}</div>`:''}<div class="opts">${q.opts.map((o,j)=>`<button class="opt" data-j="${j}">${esc(o)}</button>`).join('')}</div><div id="fb"></div>`;
    else if(q.k==='open')h+=`<div class="q">${esc(q.o.q)}</div><textarea id="ta" placeholder="Schrijf je antwoord in eigen woorden (of zeg het hardop)"></textarea><button class="btn" id="show">Toon wat erin moet staan</button><div id="fb" class="stack"></div>`;
    else h+=`<div class="q">Welk begrip hoort bij deze omschrijving?</div><div class="quote">${esc(q.b.d)}</div><form id="f" class="stack"><input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Typ het begrip"><button class="btn" type="submit">Controleer</button></form><div id="fb"></div>`;
    view.innerHTML=h;$('#bk').addEventListener('click',()=>go('toets'));
    const next=()=>{i++;if(i===qs.length)end();else draw()};
    const nx=()=>{$('#fb').insertAdjacentHTML('beforeend',`<button class="btn" id="nx" style="margin-top:10px;width:100%">${i===qs.length-1?'Uitslag':'Volgende'}</button>`);$('#nx').addEventListener('click',next);$('#nx').focus()};
    if(q.k==='mc'){on('.opt',e=>{const j=+e.dataset.j,good=j===q.a;$$('.opt',view).forEach((b,x)=>{b.disabled=true;if(x===q.a)b.classList.add('right')});if(good)score++;else{e.classList.add('wrong');miss.push(q);if(q.begrip)mark('b:'+q.begrip,false)}
      $('#fb').innerHTML=`<div class="fb ${good?'good':'bad'}">${good?'Goed!':'Niet goed.'}<small>${esc(q.why)}</small></div>`;nx()})}
    else if(q.k==='open'){$('#show').addEventListener('click',()=>{$('#show').hidden=true;$('#ta').readOnly=true;
      $('#fb').innerHTML=`<div class="quote"><b>Vink aan wat jij had${q.o.need<q.o.pts.length?` (${q.o.need} van de ${q.o.pts.length} is genoeg)`:''}:</b>${q.o.pts.map((p,x)=>`<label class="chk"><input type="checkbox" data-p="${x}"><span>${esc(p)}</span></label>`).join('')}</div><button class="btn" id="ok">Klaar met nakijken</button>`;
      $('#ok').addEventListener('click',()=>{const n=$$('[data-p]:checked',view).length,r=Math.min(n,q.o.need)/q.o.need;score+=r;if(q.o.k)mark(q.o.k,r===1,true);if(r<1)miss.push({q:q.o.q,why:'Erin hoort: '+q.o.pts.join(' / ')});$('#ok').disabled=true;$('#fb').insertAdjacentHTML('beforeend',`<div class="fb ${r===1?'good':r>0?'good':'bad'}">${r===1?'Helemaal goed!':r>0?'Gedeeltelijk goed.':'Nog niet. Lees het antwoord goed door.'}</div>`);nx()})})}
    else{const inp=$('#ans');inp.focus();$('#f').addEventListener('submit',e=>{e.preventDefault();if($('#nx'))return;const r=judge(inp.value,q.b.t);score+=r;inp.disabled=true;$('#f button').disabled=true;
      if(r<1&&r===0)miss.push({q:'Omschrijving: '+q.b.d,why:'Antwoord: '+q.b.t});
      if(r===0)mark('b:'+q.b.t,false);else if(r===1)mark('b:'+q.b.t,true);
      $('#fb').innerHTML=`<div class="fb ${r===1?'good':r?'good':'bad'}">${r===1?'Goed!':r?'Bijna goed. Let op de spelling: ':'Niet goed. Het begrip is: '}${r===1?'':'<b>'+esc(q.b.t)+'</b>'}</div>`;nx()})}
  }
  function end(){
    const p=score/qs.length;S.best[key]=Math.max(S.best[key]||0,p);addXP(Math.round(score*4));save();
    view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">${esc(title)}</div><div class="score">${score%1?score.toFixed(1).replace('.',','):score} / ${qs.length}</div><p><b>Cijfer (ter indicatie): ${grade(p)}</b></p><p class="mut">${p>=.8?'Sterk gedaan!':p>=.55?'Goed op weg. Kijk hieronder wat je miste.':'Nog even oefenen met de kaartjes, dan lukt het.'}</p>
    <div class="btns"><button class="btn" id="again">Opnieuw</button><button class="btn ghost" id="kb">Naar kaartjes</button></div></div>
    ${miss.length?`<div class="card stack"><h3>Dit ging mis</h3><div class="miss">${miss.map(m=>`<div><b>${esc(m.q)}</b><br><span class="mut">${esc(m.quote?m.quote+' ':'')}${esc(m.why)}</span></div>`).join('')}</div></div>`:''}`;
    $('#again').addEventListener('click',()=>V_toets_start(key));$('#kb').addEventListener('click',()=>go('kaart'));
    if(p>=.8)confetti();
  }
  draw();
}
function V_toets_start(key){go('toets');const b=$(`[data-t="${key==='oefen'?'oefen':key}"]`);if(b)b.click()}

const V={start:()=>V_start(),leer:()=>V_leer(),kaart:()=>V_kaart(),spel:()=>V_spel(),toets:()=>V_toets()};
window.__studieReload=ids=>{if(!ids.includes(M.id))return;S=Object.assign({xp:0,lb:{},exam:null,best:{},chk:{}},store.get());header();if(CUR==='start')go('start')};
header();
let h0='start';try{const h=location.hash.slice(1);if(V[h])h0=h}catch(e){}
go(h0);
})();