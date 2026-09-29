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
const save=()=>{S.pct=ready().pct;S.ts=Date.now();store.set(S)};
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
 toets:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'};
const TABS=[['start','Start'],['leer','Woorden'],['kaart','Kaartjes'],['spel','Spellen'],['toets','Toets']];
$('#tabs').innerHTML=TABS.map(t=>`<button class="tab" data-tab="${t[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[t[0]]}</svg>${t[1]}</button>`).join('');
$$('.tab').forEach(b=>b.addEventListener('click',()=>go(b.dataset.tab)));
const V={};
function go(t){CUR=t;cleanup();cleanup=()=>{};if(TTS)try{speechSynthesis.cancel()}catch(e){}$$('.tab').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t?'page':'false'));V[t]();window.scrollTo(0,0);try{history.replaceState(null,'','#'+t)}catch(e){}}
const on=(sel,fn,root=view)=>$$(sel,root).forEach(e=>e.addEventListener('click',()=>fn(e)));
const listSeg=(cur,attr,extra=true)=>`<div class="seg">${D.lists.map(l=>`<button data-${attr}="${l.id}" aria-pressed="${cur===l.id}">${esc(l.id)}</button>`).join('')}${extra?`<button data-${attr}="all" aria-pressed="${cur==='all'}">Alles</button>`:''}${extra&&nWrong()?`<button data-${attr}="fout" aria-pressed="${cur==='fout'}">Mijn fouten (${nWrong()})</button>`:''}</div>`;

/* ---- START ---- */
function ready(){const f=W.filter(w=>mastered(kF(w))).length/W.length,n=W.filter(w=>mastered(kN(w))).length/W.length,q=S.best.oefen||0;return{f,n,q,pct:Math.round(100*(.3*f+.4*n+.3*q))}}
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
  <section class="stack"><h2>Jouw route</h2><div class="route">
    <button data-go="leer"><b>1. Luister en lees</b><span>De woorden per blokje van vijf</span></button>
    <button data-go="kaart"><b>2. Kaartjes</b><span>Beide kanten op, tot je ze kent</span></button>
    <button data-go="spel"><b>3. Spellen</b><span>Le of la, spelling en snelheid</span></button>
    <button data-go="toets"><b>4. Oefentoets</b><span>Typen zoals op de SO, met cijfer</span></button></div></section>`;
  on('[data-go]',e=>go(e.dataset.go));
  $('#exam').addEventListener('change',e=>{const v=e.target.value;S.exam=v?Math.floor(Date.parse(v)/DAYMS):null;S.examT=Date.now();save();V.start()})};

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
    ${hide?'<p class="small mut">Overhoor jezelf: zeg het antwoord hardop en tik dan op het vakje om te kijken.</p>':''}</div>
    ${L.blocks.map((bl,i)=>`<div class="card stack"><div class="eyebrow">Blokje ${i+1}</div><div class="wl">${bl.map(w=>`
      <div class="wr"><div class="wf ${hide==='fr'?'cov':''}" tabindex="0"><span>${esc(w.fr)}</span>${spk(w.fr)}</div><div class="wn ${hide==='nl'?'cov':''}" tabindex="0">${esc(w.nl)}</div></div>
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
    view.innerHTML=`${top}<div class="prog"><span>${i+1}/${deck.length}</span><div class="bar"><i style="width:${100*i/deck.length}%"></i></div><span>vak ${bx}</span></div>
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
   <button class="gm" data-g="koppel"><em>Rustig</em><b>Koppel</b><span>Zoek de paartjes Frans en Nederlands.</span></button>
   <button class="gm" data-g="lela"><em>Punten pakken</em><b>Le, la of les?</b><span>Kies het goede lidwoord. Dit kost vaak punten op de SO!</span></button>
   <button class="gm" data-g="spell"><em>Spelling</em><b>Letterbouwer</b><span>Bouw het Franse woord met letterblokjes, accenten inbegrepen.</span></button>
   <button class="gm" data-g="snel"><em>60 seconden</em><b>Snelle ronde</b><span>Hoeveel woorden haal jij in een minuut?</span></button>
   ${TTS?'<button class="gm" data-g="dictee"><em>Luisteren</em><b>Dictee</b><span>Luister naar het woord en typ het in het Frans.</span></button>':''}
  </div>`;
  on('[data-gl]',e=>{gList=e.dataset.gl;V.spel()});on('[data-g]',e=>G[e.dataset.g]())};
const back='<button class="back-link" id="bk">‹ Terug naar spellen</button>';
function endCard(title,sub){view.innerHTML=`<div class="card stack" style="text-align:center"><div class="score">${title}</div><p><b>${sub}</b></p><div class="btns" style="justify-content:center"><button class="btn" id="ag">Nog een keer</button><button class="btn ghost" id="bk2">Andere spellen</button></div></div>`;$('#bk2').onclick=()=>V.spel()}
const G={};
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

/* ---- TOETS ---- */
V.toets=function(){const b=S.best;
  view.innerHTML=`<h2>Toetsen</h2><p class="mut small">Hier typ je de antwoorden, net als op de SO. Accenten en le/la/les tellen mee. Een fout accent of lidwoord geeft hier een half punt; een spelfout is fout. Je docent kan strenger nakijken.</p><div class="games">
   <button class="gm" data-t="oefen"><em>Zoals de SO</em><b>Oefentoets</b><span>20 woorden uit A, B en E: 10 Nederlands → Frans en 10 Frans → Nederlands. Met cijfer.${b.oefen!=null?' Beste: '+grade(b.oefen):''}</span></button>
   ${D.lists.map(l=>`<button class="gm" data-t="L${l.id}"><em>Hele lijst</em><b>${esc(l.title)}</b><span>Alle ${byList(l.id).length} woorden, Nederlands → Frans.${b['L'+l.id]!=null?' Beste: '+grade(b['L'+l.id]):''}</span></button>`).join('')}
   ${nWrong()?`<button class="gm" data-t="fout"><em>Slim herhalen</em><b>Mijn fouten (${nWrong()})</b><span>Typ de woorden die je eerder fout had. Goed = van de lijst af.</span></button>`:''}
  </div>`;
  on('[data-t]',e=>{const t=e.dataset.t;
    if(t==='oefen'){const s=shuffle(W);quiz('Oefentoets','oefen',s.slice(0,10).map(w=>({w,d:'n'})).concat(s.slice(10,20).map(w=>({w,d:'f'}))))}
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
    $('#ag').onclick=()=>{if(key==='oefen'){const s=shuffle(W);quiz(title,key,s.slice(0,10).map(w=>({w,d:'n'})).concat(s.slice(10,20).map(w=>({w,d:'f'}))))}else if(key==='fout')quiz(title,key,shuffle(byList('fout')).map(w=>({w,d:'n'})));else quiz(title,key,shuffle(qs.map(x=>x.w)).map(w=>({w,d:'n'})))};
    $('#bk').onclick=()=>V.toets();const fo=$('#fo');if(fo)fo.onclick=()=>quiz('Mijn fouten','fout',shuffle(byList('fout')).map(w=>({w,d:'n'})))}
  draw()}

window.__studieReload=ids=>{if(!ids.includes(M.id))return;S=Object.assign({xp:0,lb:{},exam:null,best:{},wrong:{}},store.get());header();if(CUR==='start')go('start')};
header();const h=(location.hash||'').slice(1);go(V[h]?h:'start');
})();
