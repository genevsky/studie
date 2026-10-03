/* Woordjes-app: gedeelde motor voor vocabulaire-toetsen (talen). Leest window.EXAM. */
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

/* ---- woorden ---- */
const W=[];D.lists.forEach(l=>l.blocks.forEach((b,bi)=>b.forEach(w=>{w.list=l.id;w.block=bi;w.key=w.fr;W.push(w)})));
const byList=id=>id==='all'?W:id==='fout'?W.filter(w=>S.wrong[w.key]>0):W.filter(w=>w.list===id);
const ART=/^(le |la |les |l'|l’|un |une )/i;
const gender=w=>{const m=w.fr.match(/^(le|la|les|l'|l’) ?/i);return m?m[1].toLowerCase().replace('’',"'"):null};
const NOUNS=W.filter(w=>gender(w));

/* ---- voortgang (alleen in deze browser) ---- */
const store={get(){try{return JSON.parse(localStorage.getItem('studie:'+M.id))||{}}catch(e){return{}}},set(v){try{localStorage.setItem('studie:'+M.id,JSON.stringify(v))}catch(e){}if(window.StudieSync)StudieSync.changed()}};
let S=Object.assign({xp:0,lb:{},exam:null,best:{},wrong:{}},store.get());
const save=()=>{S.pct=ready().pct;S.stats={seen:W.filter(w=>S.lb[kF(w)]||S.lb[kN(w)]).length,total:W.length,unit:'woorden'};S.ts=Date.now();store.set(S)};
const DAYMS=864e5,INT=[0,1,3,7,14];
const today=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/DAYMS);
const isDue=k=>{const e=S.lb[k];return !e||e.d<=today()};
const mastered=k=>{const e=S.lb[k];return !!e&&e.b>=2};
function mark(k,ok){const e=S.lb[k],t0=today();
  if(ok){if(e&&e.d>t0)return;const b=Math.min(4,(e?e.b:0)+1);let d=t0+INT[b];if(S.exam&&S.exam>t0)d=Math.min(d,Math.max(t0+1,S.exam-1));S.lb[k]={b,d,t:Date.now()}}
  else S.lb[k]={b:0,d:t0,t:Date.now()};save()}
const kF=w=>'f:'+w.key,kN=w=>'n:'+w.key; /* f = Frans→NL, n = NL→Frans */
function wrongAdd(w){S.wrong[w.key]=Date.now()}
const nWrong=()=>Object.values(S.wrong).filter(v=>v>0).length;
function wrongDel(w){if(S.wrong[w.key]>0)S.wrong[w.key]=-Date.now()}

const LV=M.levels||[[0,'Beginner'],[80,'Leerling'],[220,'Kenner'],[400,'Expert'],[650,'Meester'],[950,'Kampioen']];
function lvl(){let i=0;LV.forEach((l,k)=>{if(S.xp>=l[0])i=k});const n=LV[i+1];return{i,name:LV[i][1],from:LV[i][0],next:n?n[0]:null}}
function header(){const L=lvl();$('#lvlName').textContent=L.name+' · '+S.xp+' XP';$('#lvlBar').style.width=(L.next?Math.min(100,100*(S.xp-L.from)/(L.next-L.from)):100)+'%'}
let tt;function toast(m){$$('.toast').forEach(e=>e.remove());const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.appendChild(e);clearTimeout(tt);tt=setTimeout(()=>e.remove(),2200)}
function addXP(n){const b=lvl().i;S.xp+=n;save();header();if(lvl().i>b)toast('Nieuw niveau: '+lvl().name+'!')}
function confetti(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const cols=['#1F4E9E','#D2343A','var(--sun)','var(--good)'];for(let i=0;i<46;i++){const e=document.createElement('i');e.className='cf';e.style.left=Math.random()*100+'vw';e.style.background=cols[i%4];e.style.animationDelay=Math.random()*.4+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}}
const grade=p=>Math.max(1,Math.round((1+9*p)*10)/10).toFixed(1).replace('.',',');
$('#strata').innerHTML='<i style="background:#1F4E9E"></i><i style="background:#F4F4F4"></i><i style="background:#D2343A"></i>';

/* ---- uitspraak ---- */
const TTS='speechSynthesis' in window;let VOICE=null;
function pickVoice(){if(!TTS)return;const vs=speechSynthesis.getVoices().filter(v=>/^fr/i.test(v.lang));VOICE=vs.find(v=>/fr-FR/i.test(v.lang))||vs[0]||null}
if(TTS){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function say(t){if(!TTS)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/\((e|s)\)/g,''));u.lang=M.lang||'fr-FR';if(VOICE)u.voice=VOICE;u.rate=.85;speechSynthesis.speak(u)}catch(e){}}
const spk=t=>TTS?`<button class="spk" data-say="${esc(t)}" aria-label="Uitspraak van ${esc(t)}">🔊</button>`:'';
view.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(b){e.stopPropagation();say(b.dataset.say)}},true);

/* ---- nakijken ---- */
const deacc=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/œ/g,'oe').replace(/æ/g,'ae');
const base=s=>String(s).toLowerCase().replace(/[’‘`´]/g,"'").replace(/\s*'\s*/g,"'").replace(/[?!.¿¡]+/g,'').replace(/\s+/g,' ').trim();
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=[...Array(n+1).keys()];for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
function frForms(w){const f=[w.fr].concat(w.fa||[]);if(/\(e\)/.test(w.fr))f.push(w.fr.replace('(e)',''),w.fr.replace('(e)','e'));return [...new Set(f.map(base))]}
/* NL → Frans: streng, zoals op de toets. Geeft {ok, half, why} */
function checkFr(ans,w){const a=base(ans).replace(/oe/g,m=>m);if(!a)return{ok:false,why:'leeg'};
  const F=frForms(w);const a2=a.replace(/oe/g,'œ');
  if(F.includes(a)||F.includes(a2))return{ok:true};
  const da=deacc(a);
  if(F.some(f=>deacc(f)===da))return{ok:false,half:true,why:'Bijna! Let op de accenten of tekens: '};
  const noArt=F.map(f=>f.replace(ART,''));
  if(ART.test(F[0])&&(noArt.includes(a)||noArt.some(f=>deacc(f)===da)))return{ok:false,half:true,why:'Bijna! Je vergat le/la/les: '};
  if(ART.test(F[0])&&ART.test(a)&&noArt.some(f=>deacc(f)===deacc(a.replace(ART,''))))return{ok:false,half:true,why:'Bijna! Verkeerd lidwoord: '};
  if(F.some(f=>deacc(f).length>=5&&lev(deacc(f),da)<=1))return{ok:false,near:true,why:'Bijna, maar een spelfout telt als fout: '};
  return{ok:false,why:'Het goede antwoord: '}}
const nlBase=s=>base(s).replace(/^we /,'wij ').replace(/^je /,'jij ').replace(/\(het\) ?/g,'').replace(/^(de|het|een) /,'').trim();
function nlForms(w){const f=[];String(w.nl).split(/,\s*/).forEach(p=>f.push(p));f.push(w.nl);(w.na||[]).forEach(p=>f.push(p));
  const out=new Set();f.forEach(p=>{out.add(base(p));out.add(nlBase(p));out.add(base(p).replace(/\(het\) ?/g,'het ').replace(/\s+/g,' ').trim())});return [...out]}
/* Frans → NL: vriendelijker (typefoutje mag) */
function checkNl(ans,w){const a=base(ans);if(!a)return{ok:false,why:'leeg'};const F=nlForms(w),b=nlBase(ans);
  if(F.includes(a)||F.includes(b))return{ok:true};
  if(F.some(f=>f.length>=4&&(lev(f,a)<=1||lev(f,b)<=1)))return{ok:true,typo:true};
  return{ok:false,why:'Het goede antwoord: '}}
const ACC=['é','è','ê','à','ç','ô','î','û','ù','œ','ë','ï',"'"];
const accBar=()=>`<div class="accbar" aria-label="Speciale tekens">${ACC.map(c=>`<button type="button" data-acc="${c}">${c}</button>`).join('')}</div>`;
function wireAcc(inp){$$('[data-acc]',view).forEach(b=>b.addEventListener('mousedown',e=>e.preventDefault()));$$('[data-acc]',view).forEach(b=>b.addEventListener('click',()=>{const c=b.dataset.acc,s=inp.selectionStart??inp.value.length,e=inp.selectionEnd??s;inp.value=inp.value.slice(0,s)+c+inp.value.slice(e);inp.focus();inp.setSelectionRange(s+1,s+1)}))}

/* ---- tabs ---- */
const ICON={start:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 leer:'<path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/>',
 kaart:'<rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
 spel:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 toets:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
 gram:'<path d="M4 19V5h9a4 4 0 0 1 0 8H4m9 0a3 3 0 0 1 0 6H4"/>'};
const TABS=[['start','Start'],['leer','Woorden'],['kaart','Kaartjes'],['spel','Spellen']].concat(D.grammar?[['gram','Grammaire']]:[]).concat([['toets','Toets']]);
$('#tabs').innerHTML=TABS.map(t=>`<button class="tab" data-tab="${t[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[t[0]]}</svg>${t[1]}</button>`).join('');
$$('.tab').forEach(b=>b.addEventListener('click',()=>go(b.dataset.tab)));
const V={};
function go(t){CUR=t;cleanup();cleanup=()=>{};if(TTS)try{speechSynthesis.cancel()}catch(e){}$$('.tab').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t?'page':'false'));V[t]();window.scrollTo(0,0);try{history.replaceState(null,'','#'+t)}catch(e){}}
const on=(sel,fn,root=view)=>$$(sel,root).forEach(e=>e.addEventListener('click',()=>fn(e)));
const listSeg=(cur,attr,extra=true)=>`<div class="seg">${D.lists.map(l=>`<button data-${attr}="${l.id}" aria-pressed="${cur===l.id}">${esc(l.id)}</button>`).join('')}${extra?`<button data-${attr}="all" aria-pressed="${cur==='all'}">Alles</button>`:''}${extra&&nWrong()?`<button data-${attr}="fout" aria-pressed="${cur==='fout'}">Mijn fouten (${nWrong()})</button>`:''}</div>`;

/* ---- START ---- */
const sc=k=>{const e=S.lb[k];return !e?0:e.b>=2?1:e.b===1?.5:.2};
const cnt=ks=>({seen:ks.filter(k=>S.lb[k]).length,sure:ks.filter(mastered).length,tot:ks.length,sc:ks.reduce((a,k)=>a+sc(k),0)/(ks.length||1)});
const dot=k=>{const e=S.lb[k];return `<i class="dt ${!e?'':e.b>=2?'ok':'l'}"></i>`};
const played=g=>{const n=(S.played||{})[g];return n?`<span class="donel">✓ ${n}× gespeeld</span>`:''};
function ready(){const F=cnt(W.map(kF)),N=cnt(W.map(kN)),q=S.best.oefen||0;return{F,N,q,f:F.sc,n:N.sc,pct:Math.round(100*(.3*F.sc+.4*N.sc+.3*q))}}
function planText(){const n=S.exam?S.exam-today():null;
  if(n==null)return 'Vul hieronder de datum van je SO in. Dan verdeelt de app je kaartjes slim over de dagen.';
  if(n<0)return 'De SO is geweest. Goed gedaan!';
  if(n===0)return 'Vandaag is de SO. Doe alleen nog 10 minuten je fouten en de kaartjes Nederlands → Frans.';
  if(n===1)return 'Morgen is de SO. Doe de oefentoets en oefen daarna je fouten tot ze goed gaan.';
  if(n<=3)return 'Nog '+n+' dagen. Elke dag: kaartjes die aan de beurt zijn (beide kanten op), één spel en de oefentoets.';
  return 'Nog '+n+' dagen. Leer elke dag een paar blokjes van vijf en herhaal wat aan de beurt is.'}
V.start=function(){const r=ready();const due=W.filter(w=>isDue(kF(w))||isDue(kN(w))).length;
  const msg=r.pct<25?'Je begint net. Kijk eerst de woorden door en luister naar de uitspraak.':r.pct<60?'Goed bezig! Blijf de kaartjes doen, vooral Nederlands → Frans.':r.pct<85?'Bijna klaar. Doe de oefentoets.':'Klaar voor de SO! Oefen alleen nog je fouten.';
  view.innerHTML=`
  <section class="hero"><h1>Bonjour! Klaar voor je SO Frans?</h1><p>${esc(D.instructie)}</p></section>
  <section class="card stack"><div class="eyebrow">Vandaag</div><p><b>${esc(planText())}</b></p>
    <div class="btns" style="align-items:center"><label for="exam" class="small" style="flex:0 0 auto;font-weight:800">Datum van de SO</label><input type="date" id="exam" value="${S.exam?new Date(S.exam*DAYMS).toISOString().slice(0,10):''}" style="flex:1 1 160px;font:inherit;padding:10px 12px;border-radius:12px;border:2px solid var(--line);background:var(--surface);color:var(--ink)"></div>
    <p class="small mut">Aan de beurt: ${due} van de ${W.length} woorden.</p>
    <div class="btns"><button class="btn" data-go="kaart">Naar de kaartjes</button></div></section>
  <section class="card ready"><div class="pct">${r.pct}<small>%</small></div><div class="stack" style="gap:8px"><b>${msg}</b>
    <div class="mini"><div><span>Frans → NL</span><span class="bar"><i style="width:${Math.round(r.f*100)}%"></i></span></div>
    <div><span>NL → Frans</span><span class="bar"><i style="width:${Math.round(r.n*100)}%"></i></span></div>
    <div><span>Oefentoets</span><span class="bar"><i style="width:${Math.round(r.q*100)}%"></i></span></div></div></div></section>
  <section class="card stack"><div class="eyebrow">Wat heb je al gedaan?</div>
    <div class="tally"><div><b>${r.F.seen}/${W.length}</b><span>Frans → NL geoefend</span><small>${r.F.sure} zitten erin</small></div><div><b>${r.N.seen}/${W.length}</b><span>NL → Frans geoefend</span><small>${r.N.sure} zitten erin</small></div><div><b>${S.best.oefen!=null?grade(S.best.oefen):'–'}</b><span>Beste oefentoets</span><small>${nWrong()} woorden bij je fouten</small></div></div>
    <p class="small mut">Een woord “zit erin” als je het op twee verschillende dagen goed had. Bij <b>Woorden</b> zie je per woord een bolletje: <i class="dt"></i> nog niet · <i class="dt l"></i> geoefend · <i class="dt ok"></i> zit erin.</p></section>
  <section class="stack"><h2>Jouw route</h2><div class="route">
    <button data-go="leer"><b>1. Luister en lees</b><span>De woorden per blokje van vijf</span></button>
    <button data-go="kaart"><b>2. Kaartjes</b><span>Beide kanten op, tot je ze kent</span></button>
    <button data-go="spel"><b>3. Spellen</b><span>Le of la, spelling en snelheid</span></button>
    <button data-go="toets"><b>4. Oefentoets</b><span>Typen zoals op de SO, met cijfer</span></button></div></section>
  ${CATS?`<section class="stack"><h2>Per onderwerp</h2><div class="games">${D.lists.filter(l=>l.cat!=='gram').map(l=>`<button class="gm" data-topic="${esc(l.id)}"><em>${{voc:'Vocabulaire',num:'Getallen',day:'Dagen',month:'Maanden'}[l.cat]||''}</em><b>${esc(l.title)}</b><span>${byList(l.id).length} woorden · ${byList(l.id).filter(w=>mastered(kN(w))).length} zitten erin</span></button>`).join('')}${D.grammar?`<button class="gm" data-topic="#gram"><em>Grammaire</em><b>Grammaire H: avoir</b><span>Uitleg, vervoegen, il/elle/ils/elles, invullen en vertalen.</span></button>`:''}</div></section>`:''}`;
  on('[data-topic]',e=>{const t=e.dataset.topic;if(t==='#gram'){go('gram');return}V_topic(t)});
  on('[data-go]',e=>go(e.dataset.go));
  $('#exam').addEventListener('change',e=>{const v=e.target.value;S.exam=v?Math.floor(Date.parse(v)/DAYMS):null;S.examT=Date.now();save();V.start()})};

function V_topic(id){const L=D.lists.find(l=>l.id===id);
  view.innerHTML=`<button class="back-link" id="bk">‹ Start</button><h2>${esc(L.title)}</h2><p class="small mut">${esc(L.sub||'')}</p><div class="games">
   <button class="gm" data-x="leer"><em>1. Leren</em><b>Bekijk en luister</b><span>De woorden met uitspraak en geheugensteuntjes.</span></button>
   <button class="gm" data-x="kaart"><em>2. Kaartjes</em><b>Nederlands → Frans</b><span>Oefen tot je ze kent.</span></button>
   ${L.ordered?'<button class="gm" data-x="order"><em>3. Spel</em><b>Op volgorde</b><span>Tik de Franse woorden in de goede volgorde.</span></button>':''}
   ${L.cat==='num'?'<button class="gm" data-x="som"><em>3. Spel</em><b>Rekensommen</b><span>Schrijf de uitkomst in het Frans.</span></button>':''}
   <button class="gm" data-x="spell"><em>Spelling</em><b>Letterbouwer</b><span>Bouw het woord met letterblokjes.</span></button>
   ${TTS?'<button class="gm" data-x="dictee"><em>Luisteren</em><b>Dictee</b><span>Hoor het woord en schrijf het op.</span></button>':''}
   <button class="gm" data-x="toets"><em>4. Toets</em><b>Toets: ${esc(L.title)}</b><span>Alle ${byList(id).length} woorden typen, met cijfer.</span>${S.best['L'+id]!=null?'<span class="donel">✓ Beste cijfer: '+grade(S.best['L'+id])+'</span>':''}</button></div>`;
  $('#bk').onclick=()=>go('start');
  on('[data-x]',e=>{const x=e.dataset.x;
    if(x==='leer'){lTab=id;go('leer')}else if(x==='kaart'){kList=id;kDir='n';kAll=false;go('kaart')}
    else if(x==='toets'){go('toets');quiz(L.title,'L'+id,shuffle(byList(id)).map(w=>({w,d:'n'})))}
    else{gList=id;go('spel');S.played=S.played||{};S.played[x]=(S.played[x]||0)+1;save();G[x]()}})}

/* ---- WOORDEN ---- */
let lTab=D.lists[0].id,hide='';
V.leer=function(){
  const tabs=D.lists.map(l=>[l.id,l.title]).concat([['tip','Tips']]);
  view.innerHTML=`<div class="seg">${tabs.map(t=>`<button data-l="${t[0]}" aria-pressed="${lTab===t[0]}">${esc(t[1])}</button>`).join('')}</div><div id="lb" class="stack"></div>`;
  on('[data-l]',e=>{lTab=e.dataset.l;V.leer()});const b=$('#lb');
  if(lTab==='tip'){b.innerHTML=D.tips.map(t=>`<div class="card stack"><h3>${esc(t.h)}</h3><ul class="tipl">${t.p.map(p=>`<li>${md(p)}</li>`).join('')}</ul></div>`).join('');return}
  const L=D.lists.find(l=>l.id===lTab);
  b.innerHTML=`<div class="card stack"><h2>${esc(L.title)}</h2><p class="mut small">${esc(L.sub)} · ${L.blocks.length} blokjes van vijf. Tik op 🔊 voor de uitspraak.</p>
    <div class="seg"><button data-h="" aria-pressed="${hide===''}">Alles zien</button><button data-h="fr" aria-pressed="${hide==='fr'}">Verstop Frans</button><button data-h="nl" aria-pressed="${hide==='nl'}">Verstop Nederlands</button></div>
    <p class="small mut">Bolletjes: <i class="dt"></i> nog niet · <i class="dt l"></i> geoefend · <i class="dt ok"></i> zit erin (links Frans → NL, rechts NL → Frans).</p>
    ${hide?'<p class="small mut">Overhoor jezelf: zeg het antwoord hardop en tik dan op het vakje om te kijken.</p>':''}</div>
    ${L.blocks.map((bl,i)=>`<div class="card stack"><div class="eyebrow">Blokje ${i+1}</div><div class="wl">${bl.map(w=>`
      <div class="wr"><span class="dts" title="links: Frans → NL, rechts: NL → Frans">${dot(kF(w))}${dot(kN(w))}</span><div class="wf ${hide==='fr'?'cov':''}" tabindex="0"><span>${esc(w.fr)}</span>${spk(w.fr)}</div><div class="wn ${hide==='nl'?'cov':''}" tabindex="0">${esc(w.nl)}</div></div>
      ${w.h?`<div class="wh">💡 ${md(w.h)}</div>`:''}`).join('')}</div></div>`).join('')}
    <button class="btn" data-go="kaart">Oefen ${esc(L.title)} met kaartjes</button>`;
  on('[data-h]',e=>{hide=e.dataset.h;V.leer()},b);
  $$('.cov',b).forEach(e=>{const f=()=>e.classList.remove('cov');e.addEventListener('click',f);e.addEventListener('keydown',k=>{if(k.key==='Enter'||k.key===' ')f()})});
  on('[data-go]',()=>{kList=lTab;go('kaart')},b)};

/* ---- KAARTJES ---- */
let kList='all',kDir='n',kAll=false;
V.kaart=function(){
  const dirKey=w=>kDir==='f'?kF(w):kN(w);
  const pool=byList(kList);let deck=pool.filter(w=>kAll||isDue(dirKey(w)));
  deck=deck.slice().sort((a,b)=>((S.lb[dirKey(a)]||{b:-1}).b-(S.lb[dirKey(b)]||{b:-1}).b)||(a.list+a.block).localeCompare(b.list+b.block));
  deck=deck.slice(0,15);
  let i=0,right=0;
  function draw(){
    const top=`${listSeg(kList,'kl')}<div class="seg"><button data-kd="f" aria-pressed="${kDir==='f'}">Frans → NL</button><button data-kd="n" aria-pressed="${kDir==='n'}">NL → Frans</button></div>`;
    if(!pool.length){view.innerHTML=top+'<div class="card"><p>Geen woorden in deze lijst. Mooi zo!</p></div>';wire();return}
    if(i>=deck.length){const m=pool.filter(w=>mastered(dirKey(w))).length;
      view.innerHTML=`${top}<div class="card stack" style="text-align:center"><div class="score">${m}/${pool.length}</div><p><b>${deck.length?'Rondje klaar! ':''}${m===pool.length?'Je kent ze allemaal deze kant op.':'Woorden die je kent komen later terug. Zo onthoud je ze het best.'}</b></p>
      <p class="small mut">${deck.length?right+' van de '+deck.length+' wist je.':'Er zijn nu geen kaartjes aan de beurt.'}</p>
      <div class="btns" style="justify-content:center">${pool.some(w=>isDue(dirKey(w)))?'<button class="btn" id="more">Volgend rondje</button>':''}<button class="btn ghost" id="again">Toch alles oefenen</button><button class="btn ghost" id="other">${kDir==='f'?'Nu NL → Frans':'Nu Frans → NL'}</button></div></div>`;
      wire();$('#again').onclick=()=>{kAll=true;V.kaart()};if($('#more'))$('#more').onclick=()=>V.kaart();$('#other').onclick=()=>{kDir=kDir==='f'?'n':'f';kAll=false;V.kaart()};return}
    const w=deck[i],front=kDir==='f'?w.fr:w.nl,back=kDir==='f'?w.nl:w.fr;const bx=(S.lb[dirKey(w)]||{b:0}).b;
    view.innerHTML=`${top}<p class="small mut">Deze stapel, ${kDir==='f'?'Frans → NL':'NL → Frans'}: ${cnt(pool.map(dirKey)).seen} van ${pool.length} geoefend, ${cnt(pool.map(dirKey)).sure} zitten erin.</p><div class="prog"><span>${i+1}/${deck.length}</span><div class="bar"><i style="width:${100*i/deck.length}%"></i></div><span>vak ${bx}</span></div>
     <div class="card3d" id="c3"><div class="in">
      <div class="face"><div class="hint">${kDir==='f'?'Wat betekent':'Hoe zeg je in het Frans'}</div><div class="big">${esc(front)}</div>${kDir==='f'?spk(w.fr):''}<div class="sub">Zeg het antwoord hardop en tik om te draaien</div></div>
      <div class="face back"><div class="hint">${kDir==='f'?'Nederlands':'Frans'}</div><div class="big">${esc(back)}</div>${spk(w.fr)}${w.h?`<div class="sub">💡 ${md(w.h)}</div>`:''}</div></div></div>
     <div class="btns" id="kb" style="visibility:hidden"><button class="btn bad" data-k="0">Nog niet</button><button class="btn good" data-k="1">Wist ik!</button></div>`;
    wire();
    $('#c3').onclick=()=>{$('#c3').classList.add('flipped');$('#kb').style.visibility='visible';if(kDir==='n')say(w.fr)};
    on('[data-k]',e=>{const ok=e.dataset.k==='1';mark(dirKey(w),ok);if(ok){right++;addXP(2)}else{wrongAdd(w);deck.push(w);save()}i++;draw()})}
  function wire(){on('[data-kl]',e=>{kList=e.dataset.kl;kAll=false;V.kaart()});on('[data-kd]',e=>{kDir=e.dataset.kd;kAll=false;V.kaart()})}
  draw()};

/* ---- SPELLEN ---- */
let gList='all';
V.spel=function(){
  view.innerHTML=`<h2>Spellen</h2>${listSeg(gList,'gl')}<div class="games">
   <button class="gm" data-g="koppel"><em>Rustig</em><b>Koppel</b><span>Zoek de paartjes Frans en Nederlands.</span>${played('koppel')}</button>
   <button class="gm" data-g="lela"><em>Punten pakken</em><b>Le, la of les?</b><span>Kies het goede lidwoord. Dit kost vaak punten op de SO!</span>${played('lela')}</button>
   <button class="gm" data-g="spell"><em>Spelling</em><b>Letterbouwer</b><span>Bouw het Franse woord met letterblokjes, accenten inbegrepen.</span>${played('spell')}</button>
   <button class="gm" data-g="snel"><em>60 seconden</em><b>Snelle ronde</b><span>Hoeveel woorden haal jij in een minuut?</span>${played('snel')}${S.best.snel?`<span class="donel">🏆 record ${S.best.snel}</span>`:''}</button>
   ${D.lists.some(l=>l.ordered)?'<button class="gm" data-g="order"><em>Volgorde</em><b>Op volgorde</b><span>Zet de dagen, maanden of getallen in de goede volgorde. In het Frans!</span>'+played('order')+'</button>':''}
   ${D.lists.some(l=>l.cat==='num')?'<button class="gm" data-g="som"><em>Getallen</em><b>Rekensommen</b><span>Reken uit en schrijf het antwoord in het Frans: sept + six = treize.</span>'+played('som')+'</button>':''}
   ${TTS?'<button class="gm" data-g="dictee"><em>Luisteren</em><b>Dictee</b><span>Luister naar het woord en typ het in het Frans.</span>'+played('dictee')+'</button>':''}
  </div>`;
  on('[data-gl]',e=>{gList=e.dataset.gl;V.spel()});on('[data-g]',e=>{const g=e.dataset.g;S.played=S.played||{};S.played[g]=(S.played[g]||0)+1;save();G[g]()})};
const back='<button class="back-link" id="bk">‹ Terug naar spellen</button>';
function endCard(title,sub){view.innerHTML=`<div class="card stack" style="text-align:center"><div class="score">${title}</div><p><b>${sub}</b></p><div class="btns" style="justify-content:center"><button class="btn" id="ag">Nog een keer</button><button class="btn ghost" id="bk2">Andere spellen</button></div></div>`;$('#bk2').onclick=()=>V.spel()}
const G={};
let ordList=null;
G.order=function(){const OL=D.lists.filter(l=>l.ordered);const L=OL.find(l=>l.id===gList)||OL.find(l=>l.id===ordList)||OL[0];ordList=L.id;
  const items=byList(L.id);let next=0,mist=0,pool=shuffle(items);
  function draw(){view.innerHTML=`${back}<h2>Op volgorde</h2><div class="seg">${OL.map(l=>`<button data-ol="${l.id}" aria-pressed="${l.id===L.id}">${esc(l.title)}</button>`).join('')}</div>
    <p class="small mut">Tik de Franse woorden in de goede volgorde. Fouten: <b>${mist}</b></p>
    <ol class="ordl">${items.map((w,i)=>`<li class="${i<next?'ok':i===next?'now':''}">${i<next?esc(w.fr):'…'}</li>`).join('')}</ol>
    <div class="chips">${pool.map(w=>`<button class="chip" data-w="${esc(w.key)}">${esc(w.fr)}</button>`).join('')}</div>`;
    $('#bk').onclick=()=>V.spel();on('[data-ol]',e=>{ordList=e.dataset.ol;gList='all';G.order()});
    on('[data-w]',e=>{const w=pool.find(x=>x.key===e.dataset.w);if(w===items[next]){say(w.fr);pool=pool.filter(x=>x!==w);next++;if(next===items.length){addXP(Math.max(4,12-mist*2));if(!mist)confetti();endCard(mist?mist+' fout'+(mist>1?'en':''):'Foutloos!',L.title+' op volgorde.');$('#ag').onclick=G.order;return}draw()}else{mist++;e.classList.add('shake');setTimeout(()=>e.classList.remove('shake'),400)}})}
  draw()};
G.som=function(){const N=byList(D.lists.find(l=>l.cat==='num').id);let i=0,ok=0;const qs=Array.from({length:10},()=>{let a,b,op;do{a=Math.floor(Math.random()*21);b=Math.floor(Math.random()*21);op=Math.random()<.6?'+':'−'}while(op==='+'?a+b>20:a-b<0);return{a,b,op,r:op==='+'?a+b:a-b}});
  function draw(){if(i>=qs.length){addXP(ok*2);if(ok===qs.length)confetti();endCard(ok+'/'+qs.length,'Getallen schrijven: goed geoefend!');$('#ag').onclick=G.som;return}
    const q=qs[i],w=N[q.r];view.innerHTML=`${back}<div class="prog"><span>${i+1}/${qs.length}</span><div class="bar"><i style="width:${100*i/qs.length}%"></i></div><span>${ok} goed</span></div>
    <div class="card stack" style="text-align:center"><div class="q" style="font-size:1.4rem">${esc(N[q.a].fr)} ${q.op==='+'?'plus':'moins'} ${esc(N[q.b].fr)} = ?</div><p class="small mut">${q.a} ${q.op} ${q.b} = ? Schrijf het antwoord in het Frans.</p>
    <input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="in het Frans">${accBar()}<button class="btn" id="ck">Nakijken</button><div id="fb"></div></div>`;
    $('#bk').onclick=()=>V.spel();const inp=$('#ans');wireAcc(inp);inp.focus();
    const ck=()=>{if(!$('#ck'))return;const r=checkFr(inp.value,w);if(r.ok)ok++;inp.disabled=true;$('#ck').remove();say(w.fr);
      $('#fb').innerHTML=`<div class="fb ${r.ok?'good':'bad'}">${r.ok?'Très bien!':esc(r.why==='leeg'?'Het goede antwoord: ':r.why)} <b>${q.r} = ${esc(w.fr)}</b></div><button class="btn" id="nx" style="margin-top:10px">Volgende</button>`;$('#nx').onclick=()=>{i++;draw()};$('#nx').focus()};
    $('#ck').onclick=ck;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(!inp.disabled)ck()}})}
  draw()};
G.koppel=function(){const pool=byList(gList);const set=sample(pool,Math.min(6,pool.length));let sel=null,done=0,miss=0;
  const L=shuffle(set.map(w=>({w,s:'fr'}))),R=shuffle(set.map(w=>({w,s:'nl'})));
  view.innerHTML=`${back}<h2>Koppel</h2><p class="mut small">Tik een Frans woord en dan de vertaling.</p><div class="pairs">${L.map((x,i)=>`<button data-p="${i}" data-s="fr">${esc(x.w.fr)}</button><button data-p="${i}" data-s="nl" data-r="${i}">${esc(R[i].w.nl)}</button>`).join('')}</div>`;
  $('#bk').onclick=()=>V.spel();
  $$('.pairs button').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('done'))return;const s=b.dataset.s,w=s==='fr'?L[+b.dataset.p].w:R[+b.dataset.r].w;
    if(!sel||sel.s===s){$$('.pairs .sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');sel={b,s,w};if(s==='fr')say(w.fr);return}
    if(sel.w===w){b.classList.add('done');sel.b.classList.add('done');sel.b.classList.remove('sel');sel=null;done++;addXP(1);if(done===set.length){addXP(3);confetti();setTimeout(()=>{endCard(miss===0?'Perfect!':'Klaar!',miss+' keer mis. '+(miss===0?'Knap!':''));$('#ag').onclick=G.koppel},700)}}
    else{b.classList.add('shake');sel.b.classList.add('shake');miss++;setTimeout(()=>$$('.shake').forEach(x=>x.classList.remove('shake')),400)}}))};
G.lela=function(){const pool=byList(gList).filter(w=>gender(w));if(!pool.length){toast('Geen woorden met le/la/les in deze keuze.');return V.spel()}const qs=shuffle(pool);let i=0,ok=0;
  function draw(){if(i>=qs.length){addXP(ok);if(ok===qs.length)confetti();endCard(ok+'/'+qs.length,'Tip: leer het lidwoord altijd mee met het woord.');$('#ag').onclick=G.lela;return}
    const w=qs[i],g=gender(w),rest=w.fr.replace(/^(le|la|les|l'|l’) ?/i,'');
    view.innerHTML=`${back}<div class="prog"><span>${i+1}/${qs.length}</span><div class="bar"><i style="width:${100*i/qs.length}%"></i></div><span>${ok} goed</span></div>
    <div class="card stack" style="text-align:center"><div class="eyebrow">${esc(w.nl)}</div><div class="q" style="font-size:1.9rem">… ${esc(rest)}</div>
    <div class="btns" style="justify-content:center">${['le','la','les'].map(x=>`<button class="btn ghost" data-a="${x}" style="min-width:80px">${x}</button>`).join('')}</div><div id="fb"></div></div>`;
    $('#bk').onclick=()=>V.spel();
    on('[data-a]',e=>{const r=e.dataset.a===g;if(r)ok++;say(w.fr);$$('[data-a]').forEach(b=>{b.disabled=true;if(b.dataset.a===g)b.className='btn good'});
      $('#fb').innerHTML=`<div class="fb ${r?'good':'bad'}">${r?'Goed!':'Het is'} <b>${esc(w.fr)}</b>${!r&&/^het /.test(w.nl)?'<small>Let op: een het-woord in het Nederlands zegt niets over le of la.</small>':''}</div><button class="btn" id="nx" style="margin-top:10px">Volgende</button>`;
      $('#nx').onclick=()=>{i++;draw()}})}
  draw()};
G.spell=function(){const qs=sample(byList(gList),8);let i=0,ok=0;
  function draw(){if(i>=qs.length){addXP(ok*2);if(ok===qs.length)confetti();endCard(ok+'/'+qs.length,'Spelling is de helft van het werk. Goed zo!');$('#ag').onclick=G.spell;return}
    const w=qs[i],target=((w.fa&&w.fa[0])||w.fr).replace(/[?!]/g,'').trim(),tiles=shuffle([...target].map((c,k)=>({c,k})));let built=[],tries=0;
    function paint(){view.innerHTML=`${back}<div class="prog"><span>${i+1}/${qs.length}</span><div class="bar"><i style="width:${100*i/qs.length}%"></i></div><span>${ok} goed</span></div>
      <div class="card stack" style="text-align:center"><div class="eyebrow">Bouw in het Frans</div><div class="q">${esc(w.nl)}</div>
      <div class="built">${built.map(t=>`<span>${t.c===' '?'&nbsp;':esc(t.c)}</span>`).join('')||'<span class="ph">tik de letters</span>'}</div>
      <div class="tiles">${tiles.map((t,k)=>`<button data-t="${k}" ${built.includes(t)?'disabled':''}>${t.c===' '?'␣':esc(t.c)}</button>`).join('')}</div>
      <div class="btns" style="justify-content:center"><button class="btn ghost" id="un">↩︎ Terug</button><button class="btn ghost" id="sk">Laat zien</button></div><div id="fb"></div></div>`;
      $('#bk').onclick=()=>V.spel();
      on('[data-t]',e=>{built.push(tiles[+e.dataset.t]);const s=built.map(t=>t.c).join('');
        if(s.length===target.length){if(s===target){ok++;say(w.fr);addXP(1);paint();$('#fb').innerHTML=`<div class="fb good">Très bien! ${esc(w.fr)}</div>`;setTimeout(()=>{i++;draw()},1100)}
          else{tries++;wrongAdd(w);save();paint();$('#fb').innerHTML=`<div class="fb bad">Nog niet goed. Tik ↩︎ en probeer opnieuw.</div>`}}else paint()});
      $('#un').onclick=()=>{built.pop();paint()};
      $('#sk').onclick=()=>{wrongAdd(w);save();say(w.fr);$('#fb').innerHTML=`<div class="fb bad">Het is <b>${esc(w.fr)}</b></div><button class="btn" id="nx" style="margin-top:10px">Volgende</button>`;$('#nx').onclick=()=>{i++;draw()}}}
    paint()}
  draw()};
G.snel=function(){const pool=byList(gList);if(pool.length<4){toast('Kies A, B, E of Alles: hier zijn te weinig woorden voor dit spel.');return V.spel()}let score=0,left=60,cur;
  function q(){const w=pool[Math.floor(Math.random()*pool.length)],d=Math.random()<.5?'f':'n';const others=sample(pool.filter(x=>x!==w&&x.fr!==w.fr&&x.nl!==w.nl),3);return{w,d,opts:shuffle([w].concat(others))}}
  function draw(){const{w,d,opts}=cur;view.innerHTML=`${back}<div class="timer"><span>⏱ ${left}s</span><div class="bar sun"><i style="width:${left/60*100}%"></i></div><span>${score} punten</span></div>
    <div class="card stack"><div class="q">${esc(d==='f'?w.fr:w.nl)}</div><div class="opts">${opts.map((o,k)=>`<button class="opt" data-o="${k}">${esc(d==='f'?o.nl:o.fr)}</button>`).join('')}</div></div>`;
    $('#bk').onclick=()=>V.spel();
    on('.opt',e=>{const o=cur.opts[+e.dataset.o];if(o===cur.w){score++}else{toast(cur.w.fr+' = '+cur.w.nl);wrongAdd(cur.w);save()}cur=q();draw()})}
  cur=q();draw();const t=setInterval(()=>{left--;if(left<=0){clearInterval(t);const best=S.best.snel||0;if(score>best){S.best.snel=score;save()}addXP(score);if(score>=15)confetti();endCard(score+' punten',score>best?'Nieuw record!':'Je record: '+best);$('#ag').onclick=G.snel;return}const ti=$('.timer span');if(ti){ti.textContent='⏱ '+left+'s';$('.timer i').style.width=left/60*100+'%'}},1000);
  cleanup=()=>clearInterval(t)};
G.dictee=function(){const qs=sample(byList(gList),8);let i=0,ok=0;
  function draw(){if(i>=qs.length){addXP(ok*2);if(ok===qs.length)confetti();endCard(ok+'/'+qs.length,'Luisteren en spellen: dubbel geoefend!');$('#ag').onclick=G.dictee;return}
    const w=qs[i];view.innerHTML=`${back}<div class="prog"><span>${i+1}/${qs.length}</span><div class="bar"><i style="width:${100*i/qs.length}%"></i></div><span>${ok} goed</span></div>
    <div class="card stack" style="text-align:center"><button class="btn" id="play" style="align-self:center;font-size:1.3rem">🔊 Luister</button><p class="small mut">Typ wat je hoort, in het Frans. Hulp nodig? Het betekent: <b>${esc(w.nl)}</b></p>
    <input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Typ het Franse woord">${accBar()}<button class="btn" id="ck">Nakijken</button><div id="fb"></div></div>`;
    $('#bk').onclick=()=>V.spel();const inp=$('#ans');wireAcc(inp);$('#play').onclick=()=>say(w.fr);setTimeout(()=>say(w.fr),300);
    const ck=()=>{const r=checkFr(inp.value,w);if(r.ok)ok++;else{wrongAdd(w);save()}inp.disabled=true;$('#ck').remove();
      $('#fb').innerHTML=`<div class="fb ${r.ok?'good':'bad'}">${r.ok?'Parfait!':esc(r.why==='leeg'?'Het goede antwoord: ':r.why)} <b>${esc(w.fr)}</b></div><button class="btn" id="nx" style="margin-top:10px">Volgende</button>`;$('#nx').onclick=()=>{i++;draw()};$('#nx').focus()};
    $('#ck').onclick=ck;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(!inp.disabled)ck()}})}
  draw()};

/* ---- GRAMMAIRE ---- */
let gTab='uitleg';
V.gram=function(){const Gm=D.grammar;
  view.innerHTML=`<div class="seg">${[['uitleg','Uitleg'],['vervoeg','Vervoeg avoir'],['pron','il, elle, ils, elles?'],['fill','Vul avoir in'],['vert','Vertaal']].map(x=>`<button data-gt="${x[0]}" aria-pressed="${gTab===x[0]}">${x[1]}</button>`).join('')}</div><div id="gb" class="stack" style="margin-top:12px"></div>`;
  on('[data-gt]',e=>{gTab=e.dataset.gt;V.gram()});const b=$('#gb');const pl=k=>{S.played=S.played||{};S.played[k]=(S.played[k]||0)+1;save()};
  if(gTab==='uitleg'){b.innerHTML=`<div class="card stack"><div class="eyebrow">Grammaire H</div><h2>Het persoonlijk voornaamwoord en avoir</h2><p>${esc(Gm.note)}</p>
    <table class="rules">${Gm.avoir.map(r=>`<tr><th>${esc(r[0])} <b style="color:var(--ink)">${esc(r[1])}</b> ${TTS?spk((r[0]==="j'"?"j'":r[0].split('/')[0]+' ')+r[1]):''}</th><td>${esc(r[2])}</td></tr>`).join('')}</table>
    <ul class="tipl"><li>Voor een klinker wordt <b>je</b> → <b>j’</b>: j’ai.</li><li><b>il</b> = hij (of een mannelijk woord: le chien → il), <b>elle</b> = zij (of een vrouwelijk woord: la famille → elle).</li><li><b>ils</b> = zij meervoud: jongens, of jongens én meisjes. <b>elles</b> = alleen meisjes.</li><li><b>vous</b> = jullie, en ook de beleefde vorm u.</li><li><b>on</b> = wij (spreektaal) of men: on a.</li></ul></div>
    <div class="btns"><button class="btn" data-gt2="vervoeg">Oefen: vervoeg avoir</button></div>`;on('[data-gt2]',e=>{gTab=e.dataset.gt2;V.gram()},b);return}
  if(gTab==='vervoeg'){let rows=Gm.avoir.slice(),mixed=false;
    const draw=()=>{b.innerHTML=`<div class="card stack"><h3>Vervoeg avoir</h3><p class="small mut">Schrijf de goede vorm van avoir.${mixed?' (door elkaar)':''}</p>
      <table class="vtab">${rows.map((r,i)=>`<tr><th style="width:90px">${esc(r[0])}</th><td><input type="text" class="tin" data-i="${i}" autocomplete="off" autocapitalize="off" spellcheck="false"></td><td class="small mut">${esc(r[2])}</td></tr>`).join('')}</table>
      <button class="btn" id="ck">Nakijken</button><div id="res"></div></div>`;
      const all=$$('.tin',b);all[0].focus();all.forEach((el,k)=>el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();(all[k+1]||$('#ck')).focus()}}));
      $('#ck').onclick=()=>{let ok=0;all.forEach(el=>{const want=rows[+el.dataset.i][1],g=nrmA(el.value)===want;if(g)ok++;else el.insertAdjacentHTML('afterend',`<div class="tfix">${esc(want)}</div>`);el.classList.add(g?'yok':'yno');el.readOnly=true});
        S.best['g:vervoeg']=Math.max(S.best['g:vervoeg']||0,ok/rows.length);addXP(ok);pl('g:vervoeg');if(ok===rows.length)confetti();$('#ck').remove();
        $('#res').innerHTML=`<div class="score" style="text-align:center">${ok}/${rows.length}</div><div class="btns"><button class="btn" id="mx">Nog eens, door elkaar</button><button class="btn ghost" id="or">Op volgorde</button></div>`;
        $('#mx').onclick=()=>{rows=shuffle(Gm.avoir);mixed=true;draw()};$('#or').onclick=()=>{rows=Gm.avoir.slice();mixed=false;draw()}}};
    draw();return}
  if(gTab==='pron'){const qs=sample(Gm.pron,10);let i=0,ok=0;const OPTS=['je','tu','il','elle','nous','vous','ils','elles'];
    const draw=()=>{if(i>=qs.length){S.best['g:pron']=Math.max(S.best['g:pron']||0,ok/qs.length);addXP(ok);pl('g:pron');if(ok===qs.length)confetti();b.innerHTML=`<div class="card stack" style="text-align:center"><div class="score">${ok}/${qs.length}</div><p><b>Eén naam: il of elle. Meer namen: ils of elles.</b></p><button class="btn" id="ag">Nog een keer</button></div>`;$('#ag').onclick=()=>V.gram();return}
      const q=qs[i],nl=/^(ik|jij|hij|wij|jullie)$/.test(q[0]);
      b.innerHTML=`<div class="prog"><span>${i+1}/${qs.length}</span><div class="bar"><i style="width:${100*i/qs.length}%"></i></div><span>${ok} goed</span></div><div class="card stack"><p class="small mut">${nl?'Wat is het Franse persoonlijk voornaamwoord?':'Door welk voornaamwoord vervang je dit?'}</p><div class="q">${esc(q[0])}</div><div class="opts two">${OPTS.map(o=>`<button class="opt" data-o="${o}">${o}</button>`).join('')}</div><div id="fb"></div></div>`;
      on('[data-o]',e=>{const g=e.dataset.o===q[1];if(g)ok++;$$('[data-o]',b).forEach(x=>{x.disabled=true;if(x.dataset.o===q[1])x.classList.add('right')});if(!g)e.classList.add('wrong');
        $('#fb').innerHTML=`<div class="fb ${g?'good':'bad'}">${g?'Goed!':'Het is: '+esc(q[1])}</div><button class="btn" id="nx" style="margin-top:10px;width:100%">Volgende</button>`;$('#nx').onclick=()=>{i++;draw()};$('#nx').focus()},b)};
    draw();return}
  if(gTab==='fill'){let list=shuffle(Gm.fill);
    const draw=()=>{b.innerHTML=`<div class="card stack"><h3>Vul de goede vorm van avoir in</h3><ol class="wsheet">${list.map((q,i)=>`<li><div class="wsent">${esc(q[0]).replace('█',`<input type="text" class="blank" data-i="${i}" autocomplete="off" autocapitalize="off" spellcheck="false">`)}</div><div class="wfb" id="gf${i}"></div></li>`).join('')}</ol><button class="btn" id="ck">Nakijken</button><div id="res"></div></div>`;
      const all=$$('.blank',b);all.forEach((el,k)=>el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();(all[k+1]||$('#ck')).focus()}}));
      $('#ck').onclick=()=>{let ok=0;const wrong=[];all.forEach(el=>{const q=list[+el.dataset.i],g=nrmA(el.value)===q[1];if(g)ok++;else wrong.push(q);el.classList.add(g?'yok':'yno');el.readOnly=true;$('#gf'+el.dataset.i).innerHTML=g?'<span class="okline">✓</span>':`<span class="noline">✗ ${esc(q[0].replace('█',q[1]))}</span>`});
        S.best['g:fill']=Math.max(S.best['g:fill']||0,ok/list.length);addXP(ok);pl('g:fill');if(ok===list.length)confetti();$('#ck').remove();
        $('#res').innerHTML=`<div class="score" style="text-align:center">${ok}/${list.length}</div><div class="btns">${wrong.length?'<button class="btn" id="fo">Alleen mijn fouten</button>':''}<button class="btn ghost" id="ag">Opnieuw</button></div>`;
        const fo=$('#fo');if(fo)fo.onclick=()=>{list=wrong;draw()};$('#ag').onclick=()=>{list=shuffle(Gm.fill);draw()};$('#res').scrollIntoView({behavior:'smooth'})}};
    draw();return}
  if(gTab==='vert'){const L=D.lists.find(l=>l.cat==='gram');b.innerHTML=`<div class="card stack"><h3>Vertaal: ik heb, jij hebt …</h3><p class="small mut">Je krijgt het Nederlands en typt het Frans, bijvoorbeeld ik heb → j’ai.</p><button class="btn" id="go">Start (${byList(L.id).length} vragen)</button></div>`;$('#go').onclick=()=>quiz(L.title,'L'+L.id,shuffle(byList(L.id)).map(w=>({w,d:'n'})))}};
const nrmA=s=>String(s||'').trim().toLowerCase().replace(/[’‘]/g,"'");

/* ---- TOETS ---- */
const CATS=D.lists.some(l=>l.cat);
function soSet(){if(!CATS){const s=shuffle(W);return s.slice(0,10).map(w=>({w,d:'n'})).concat(s.slice(10,20).map(w=>({w,d:'f'})))}
  const of=c=>shuffle(W.filter(w=>D.lists.find(l=>l.id===w.list).cat===c));const v=of('voc');
  return [...v.slice(0,5).map(w=>({w,d:'n'})),...v.slice(5,8).map(w=>({w,d:'f'})),...of('gram').slice(0,3).map(w=>({w,d:'n'})),...of('num').slice(0,4).map(w=>({w,d:'n'})),...of('day').slice(0,2).map(w=>({w,d:'n'})),...of('month').slice(0,3).map(w=>({w,d:'n'}))]}
V.toets=function(){const b=S.best;
  view.innerHTML=`<h2>Toetsen</h2><p class="mut small">Hier typ je de antwoorden, net als op de SO. Accenten en le/la/les tellen mee. Een fout accent of lidwoord geeft hier een half punt; een spelfout is fout. Je docent kan strenger nakijken.</p><div class="games">
   <button class="gm" data-t="oefen"><em>Zoals de SO</em><b>Oefentoets</b><span>${CATS?'20 vragen over alle onderwerpen: woorden, avoir, getallen, dagen en maanden. Met cijfer.':'20 woorden uit A, B en E: 10 Nederlands → Frans en 10 Frans → Nederlands. Met cijfer.'}</span>${b.oefen!=null?'<span class="donel">✓ Beste cijfer: '+grade(b.oefen)+'</span>':''}</button>
   ${D.lists.map(l=>`<button class="gm" data-t="L${l.id}"><em>${CATS?'Per onderwerp':'Hele lijst'}</em><b>${esc(l.title)}</b><span>Alle ${byList(l.id).length} woorden, Nederlands → Frans.</span>${b['L'+l.id]!=null?'<span class="donel">✓ Beste cijfer: '+grade(b['L'+l.id])+'</span>':''}</button>`).join('')}
   ${nWrong()?`<button class="gm" data-t="fout"><em>Slim herhalen</em><b>Mijn fouten (${nWrong()})</b><span>Typ de woorden die je eerder fout had. Goed = van de lijst af.</span></button>`:''}
  </div>`;
  on('[data-t]',e=>{const t=e.dataset.t;
    if(t==='oefen')quiz('Oefentoets','oefen',soSet())
    else if(t==='fout')quiz('Mijn fouten','fout',shuffle(byList('fout')).map(w=>({w,d:'n'})));
    else{const id=t.slice(1);quiz(D.lists.find(l=>l.id===id).title,t,shuffle(byList(id)).map(w=>({w,d:'n'})))}})};
function quiz(title,key,qs){let i=0,pts=0;const res=[];
  function draw(){if(i>=qs.length)return end();const{w,d}=qs[i];
    view.innerHTML=`<button class="back-link" id="bk">‹ Stoppen</button><div class="prog"><span>${i+1}/${qs.length}</span><div class="bar"><i style="width:${100*i/qs.length}%"></i></div><span>${String(pts).replace('.',',')} pt</span></div>
    <div class="card stack"><div class="eyebrow">${d==='n'?'Vertaal in het Frans':'Vertaal in het Nederlands'}</div><div class="q">${esc(d==='n'?w.nl:w.fr)}</div>
    <input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${d==='n'?'Frans, met le/la/les':'Nederlands'}">${d==='n'?accBar():''}<button class="btn" id="ck">Nakijken</button><div id="fb"></div></div>`;
    $('#bk').onclick=()=>V.toets();const inp=$('#ans');if(d==='n')wireAcc(inp);inp.focus();
    const ck=()=>{const r=d==='n'?checkFr(inp.value,w):checkNl(inp.value,w);const p=r.ok?1:r.half?.5:0;pts+=p;res.push({w,d,a:inp.value,p});
      mark(d==='n'?kN(w):kF(w),!!r.ok);if(r.ok){if(key==='fout')wrongDel(w)}else wrongAdd(w);save();
      inp.disabled=true;$('#ck').remove();const ans=d==='n'?w.fr:w.nl;
      $('#fb').innerHTML=`<div class="fb ${r.ok?'good':'bad'}">${r.ok?(r.typo?'Goed! (klein typfoutje) ':'Goed! '):esc(r.why==='leeg'?'Het goede antwoord: ':r.why)}<b>${esc(ans)}</b>${r.half?'<small>Half punt.</small>':''}</div><button class="btn" id="nx" style="margin-top:10px">${i+1<qs.length?'Volgende':'Uitslag'}</button>`;
      if(d==='n')say(w.fr);$('#nx').onclick=()=>{i++;draw()};$('#nx').focus()};
    $('#ck').onclick=ck;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(!inp.disabled)ck()}})}
  function end(){const p=qs.length?pts/qs.length:0;if(key!=='fout'&&(S.best[key]==null||p>S.best[key]))S.best[key]=p;save();addXP(Math.round(pts*2));if(p>=.8)confetti();
    const wrong=res.filter(r=>r.p<1);
    view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">${esc(title)}</div><div class="score">${key==='fout'?String(pts).replace('.',',')+'/'+qs.length:grade(p)}</div><p><b>${String(pts).replace('.',',')} van de ${qs.length} punten.</b> ${p>=.8?'Très bien!':p>=.55?'Voldoende! Oefen je fouten nog even.':'Oefen eerst de kaartjes en probeer het dan opnieuw.'}</p>
    ${key!=='fout'?'<p class="small mut">Dit cijfer is een indicatie: 1 + 9 × je score.</p>':''}</div>
    ${wrong.length?`<div class="card stack"><h3>Om nog te oefenen</h3><div class="miss">${wrong.map(r=>`<div><b>${esc(r.d==='n'?r.w.nl:r.w.fr)}</b> → ${esc(r.d==='n'?r.w.fr:r.w.nl)} ${spk(r.w.fr)}<br><span class="small mut">Jij: ${esc(r.a||'(leeg)')}${r.p?' · half punt':''}</span></div>`).join('')}</div></div>`:''}
    <div class="btns"><button class="btn" id="ag">Nog een keer</button>${nWrong()&&key!=='fout'?'<button class="btn ghost" id="fo">Oefen mijn fouten</button>':''}<button class="btn ghost" id="bk">Andere toetsen</button></div>`;
    $('#ag').onclick=()=>{if(key==='oefen'){quiz(title,key,soSet())}else if(key==='fout')quiz(title,key,shuffle(byList('fout')).map(w=>({w,d:'n'})));else quiz(title,key,shuffle(qs.map(x=>x.w)).map(w=>({w,d:'n'})))};
    $('#bk').onclick=()=>V.toets();const fo=$('#fo');if(fo)fo.onclick=()=>quiz('Mijn fouten','fout',shuffle(byList('fout')).map(w=>({w,d:'n'})))}
  draw()}

window.__studieReload=ids=>{if(!ids.includes(M.id))return;S=Object.assign({xp:0,lb:{},exam:null,best:{},wrong:{}},store.get());header();if(CUR==='start')go('start')};
header();const h=(location.hash||'').slice(1);go(V[h]?h:'start');
})();
