/* Taal-app: werkwoordspelling en invuloefeningen. Leest window.EXAM (type 'taal'). */
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
const BL='█';
const FORMS=D.forms;

/* ---- alle zinnen ---- */
const ITEMS=[];D.sheets.forEach(s=>s.q.forEach(q=>{q.key='q:'+s.id+'-'+q.n;q.sheet=s;ITEMS.push(q)}));
const byKey={};ITEMS.forEach(q=>byKey[q.key]=q);

/* ---- voortgang ---- */
const store={get(){try{return JSON.parse(localStorage.getItem('studie:'+M.id))||{}}catch(e){return{}}},set(v){try{localStorage.setItem('studie:'+M.id,JSON.stringify(v))}catch(e){}if(window.StudieSync)StudieSync.changed()}};
const DEF=()=>({xp:0,lb:{},exam:null,best:{},wrong:{},played:{},slide:0});
let S=Object.assign(DEF(),store.get());
if(S.exam==null&&M.examDate)S.exam=Math.floor(Date.parse(M.examDate)/864e5);
const DAYMS=864e5,today=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/DAYMS);
function mark(k,ok){const e=S.lb[k];S.lb[k]={b:ok?Math.min(4,(e?e.b:0)+1):0,d:today(),t:Date.now()}}
const wrongAdd=k=>{S.wrong[k]=Date.now()},wrongDel=k=>{if(S.wrong[k]>0)S.wrong[k]=-Date.now()};
const nWrong=()=>Object.keys(S.wrong).filter(k=>S.wrong[k]>0&&byKey[k]).length;
function ready(){const good=ITEMS.filter(q=>S.lb[q.key]&&S.lb[q.key].b>=1).length,seen=ITEMS.filter(q=>S.lb[q.key]).length,sheets=D.sheets.filter(s=>S.best['ws:'+s.id]!=null).length,so=S.best.so||0;
  return{good,seen,sheets,so,pct:Math.round(100*(.55*good/ITEMS.length+.15*sheets/D.sheets.length+.3*so))}}
const save=()=>{const r=ready();S.pct=r.pct;S.stats={seen:r.seen,total:ITEMS.length,unit:'zinnen'};S.ts=Date.now();store.set(S)};

const LV=M.levels;
function lvl(){let i=0;LV.forEach((l,k)=>{if(S.xp>=l[0])i=k});const n=LV[i+1];return{i,name:LV[i][1],from:LV[i][0],next:n?n[0]:null}}
function header(){const L=lvl();$('#lvlName').textContent=L.name+' · '+S.xp+' XP';$('#lvlBar').style.width=(L.next?Math.min(100,100*(S.xp-L.from)/(L.next-L.from)):100)+'%'}
let tt;function toast(m){$$('.toast').forEach(e=>e.remove());const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.appendChild(e);clearTimeout(tt);tt=setTimeout(()=>e.remove(),2200)}
function addXP(n){const b=lvl().i;S.xp+=n;save();header();if(lvl().i>b)toast('Nieuw niveau: '+lvl().name+'!')}
function confetti(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const cols=['var(--sun)','var(--accent)','var(--good)','var(--bad)'];for(let i=0;i<46;i++){const e=document.createElement('i');e.className='cf';e.style.left=Math.random()*100+'vw';e.style.background=cols[i%4];e.style.animationDelay=Math.random()*.4+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}}
const grade=p=>Math.max(1,Math.round((1+9*p)*10)/10).toFixed(1).replace('.',',');
$('#strata').innerHTML=['#E8A33D','#D9534F','#5B8DEF','#3BB273','#8E6CEF'].map(c=>`<i style="background:${c}"></i>`).join('');

/* ---- nakijken ---- */
const nrm=s=>String(s||'').trim().replace(/[’‘`´]/g,"'").replace(/\s+/g,' ').replace(/[.,!?;:]+$/,'').toLowerCase();
const deacc=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'');
function judge(ans,want){const a=nrm(ans),w=(Array.isArray(want)?want:[want]).map(nrm);if(!a)return{ok:false,why:''};
  if(w.includes(a))return{ok:true};
  if(w.some(x=>deacc(x)===deacc(a)))return{ok:false,why:'Bijna! Let op het trema of accent (bijvoorbeeld ü in geüpdatet).'};
  const t=w.find(x=>x.replace(/[dt]+$/,'')===a.replace(/[dt]+$/,''));
  if(t){const end=t.match(/[dt]*$/)[0],mine=a.match(/[dt]*$/)[0];return{ok:false,why:`Let op de d/t aan het eind: het is -${end||'(geen d/t)'}, niet -${mine||'(geen d/t)'}.`}}
  return{ok:false,why:''}}

/* ---- tabs ---- */
const ICON={start:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 uitleg:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
 wb:'<path d="M5 3h11l3 3v15H5z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
 oef:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 toets:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'};
const TABS=[['start','Start'],['uitleg','Uitleg'],['wb','Werkbladen'],['oef','Oefenen'],['toets','Toets']];
$('#tabs').innerHTML=TABS.map(t=>`<button class="tab" data-tab="${t[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[t[0]]}</svg>${t[1]}</button>`).join('');
$$('.tab').forEach(b=>b.addEventListener('click',()=>go(b.dataset.tab)));
const V={};
function go(t,arg){CUR=t;cleanup();cleanup=()=>{};$$('.tab').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t?'page':'false'));V[t](arg);window.scrollTo(0,0);try{history.replaceState(null,'','#'+t)}catch(e){}}
const on=(sel,fn,root=view)=>$$(sel,root).forEach(e=>e.addEventListener('click',()=>fn(e)));
const played=g=>{const n=(S.played||{})[g];return n?`<span class="donel">✓ ${n}× gedaan</span>`:''};
const play=g=>{S.played=S.played||{};S.played[g]=(S.played[g]||0)+1;save()};

/* ---- START ---- */
function planText(){const n=S.exam?S.exam-today():null;
  if(n==null)return 'Vul de datum van je SO in.';if(n<0)return 'De SO is geweest. Goed gedaan!';
  if(n===0)return 'Vandaag is de SO! Kijk nog één keer naar het stappenplan en doe 10 zinnen “Stap voor stap”.';
  if(n===1)return 'Morgen is de SO. Maak de oefen-SO en verbeter daarna je fouten.';
  if(n<=3)return 'Nog '+n+' dagen. Elke dag: 2 werkbladen, 10 zinnen “Stap voor stap” en je fouten.';
  return 'Nog '+n+' dagen. Begin met de uitleg (PPT), maak daarna elke dag 2 werkbladen.'}
V.start=function(){const r=ready();
  view.innerHTML=`
  <section class="hero"><h1>Werkwoordspelling: word of wordt?</h1><p>${esc(D.instructie)}</p></section>
  <section class="card stack"><div class="eyebrow">Vandaag</div><p><b>${esc(planText())}</b></p>
    <div class="btns" style="align-items:center"><label for="exam" class="small" style="flex:0 0 auto;font-weight:800">Datum van de SO</label><input type="date" id="exam" value="${S.exam?new Date(S.exam*DAYMS).toISOString().slice(0,10):''}" style="flex:1 1 160px;font:inherit;padding:10px 12px;border-radius:12px;border:2px solid var(--line);background:var(--surface);color:var(--ink)"></div></section>
  <section class="stack"><h2>Jouw route</h2>
   ${[['1','Snap de regels','De PowerPoint van je docent, het schema en het stappenplan.',[['uitleg:ppt','Bekijk de PPT'],['uitleg:stap','Stappenplan',1],['uitleg:schema','Schema (handout)',1]]],
      ['2','Werkbladen Gespeld','Precies de werkbladen uit je oefenboekjes (deel 1 en 2), met antwoorden en uitleg.',[['wb','Naar de werkbladen']]],
      ['3','Oefen slim','Eerst de werkwoordsvorm bepalen, dan spellen. Plus de oefeningen uit de PPT.',[['oef:stap','Stap voor stap'],['oef:ppt','Oefening uit de PPT',1],['oef','Alle oefeningen',1]]],
      ['✓','Oefen-SO','20 zinnen door elkaar, met cijfer. Daarna je fouten verbeteren.',[['toets:so','Start de oefen-SO']]]].map(t=>`
    <section class="card stack focus"><div class="fhead"><span class="fno">${t[0]}</span><div><h2>${t[1]}</h2><p class="small mut">${t[2]}</p></div></div><div class="btns">${t[3].map(b=>`<button class="btn ${b[2]?'ghost':''}" data-act="${b[0]}">${b[1]}</button>`).join('')}</div></section>`).join('')}</section>
  <section class="card stack"><div class="eyebrow">Wat heb je al gedaan?</div>
    <div class="tally"><div><b>${r.sheets}/${D.sheets.length}</b><span>Werkbladen gemaakt</span><small>${D.sheets.filter(s=>(S.best['ws:'+s.id]||0)>=1).length} foutloos</small></div><div><b>${r.good}/${ITEMS.length}</b><span>Zinnen goed</span><small>${r.seen} geoefend</small></div><div><b>${S.best.so!=null?grade(S.best.so):'–'}</b><span>Beste oefen-SO</span><small>${nWrong()} bij je fouten</small></div></div></section>`;
  on('[data-act]',e=>{const [t,x]=e.dataset.act.split(':');go(t,x)});
  $('#exam').addEventListener('change',e=>{const v=e.target.value;S.exam=v?Math.floor(Date.parse(v)/DAYMS):null;S.examT=Date.now();save();V.start()})};

/* ---- UITLEG ---- */
let uTab='ppt';
V.uitleg=function(arg){if(arg)uTab=arg;
  view.innerHTML=`<div class="seg">${[['ppt','PowerPoint'],['stap','Stappenplan'],['schema','Schema (handout)']].map(x=>`<button data-u="${x[0]}" aria-pressed="${uTab===x[0]}">${x[1]}</button>`).join('')}</div><div id="ub" class="stack" style="margin-top:12px"></div>`;
  on('[data-u]',e=>{uTab=e.dataset.u;V.uitleg()});const b=$('#ub');
  if(uTab==='ppt'){let i=Math.min(S.slide||0,D.slides-1);const src=n=>`slides/s-${String(n+1).padStart(2,'0')}.jpg`;
    b.innerHTML=`<p class="small mut">De PowerPoint “Werkwoordspelling klas 1” van je docent. Blader met de pijltjes, veeg op je telefoon, of tik op een plaatje hieronder.</p>
    <div class="slidebox"><img id="sl" alt="Dia" src="${src(i)}"><button class="snav prev" id="sp" aria-label="Vorige dia">‹</button><button class="snav next" id="sn" aria-label="Volgende dia">›</button></div>
    <div class="prog"><span id="sc"></span><span class="bar"><i id="sbar"></i></span><a class="small" href="powerpoint.pdf" target="_blank" rel="noopener">PDF</a></div>
    <div class="thumbs">${Array.from({length:D.slides},(_,n)=>`<button data-s="${n}"><img loading="lazy" src="${src(n)}" alt="Dia ${n+1}"><span>${n+1}</span></button>`).join('')}</div>`;
    const show=n=>{i=Math.max(0,Math.min(D.slides-1,n));$('#sl').src=src(i);$('#sc').textContent='Dia '+(i+1)+' / '+D.slides;$('#sbar').style.width=(100*(i+1)/D.slides)+'%';$$('.thumbs button').forEach((t,k)=>t.classList.toggle('on',k===i));S.slide=i;try{store.set(S)}catch(e){}};
    $('#sp').onclick=()=>show(i-1);$('#sn').onclick=()=>show(i+1);on('[data-s]',e=>{show(+e.dataset.s);$('.slidebox').scrollIntoView({behavior:'smooth',block:'center'})},b);
    const key=e=>{if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)};document.addEventListener('keydown',key);
    let x0=null;const box=$('.slidebox');box.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});box.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)show(i+(dx<0?1:-1));x0=null});
    cleanup=()=>document.removeEventListener('keydown',key);show(i);play('ppt')}
  else if(uTab==='schema'){b.innerHTML=`<p class="small mut">Het samenvattende schema (stencil) van je docent.</p>${Array.from({length:D.schema},(_,n)=>`<img class="page" src="schema/p${n+1}.jpg" alt="Schema pagina ${n+1}">`).join('')}`}
  else{b.innerHTML=STAP;on('[data-go]',e=>{const [t,x]=e.dataset.go.split(':');go(t,x)},b)}};
const KOF='<b class="kof">’t ex-kofschip</b>';
const STAP=`
<div class="card stack"><div class="eyebrow">Stap 1</div><h2>Bepaal eerst de werkwoordsvorm</h2>
<p>Is het werkwoord de <b>persoonsvorm</b>? Doe de <b>tijdproef</b> (zet de zin in een andere tijd) of de <b>getalproef</b> (enkelvoud ↔ meervoud). Het werkwoord dat verandert, is de pv.</p>
<p>Geen persoonsvorm? Dan is het een van deze vormen:</p>
<ul class="tipl"><li><b>Voltooid deelwoord</b>: er staat een vorm van <i>hebben, zijn</i> of <i>worden</i> in de zin. <i>Ik heb gefietst.</i></li>
<li><b>Gebiedende wijs</b>: een bevel, geen onderwerp. <i>Meld je nu aan!</i></li>
<li><b>Infinitief</b>: het hele werkwoord, vaak na <i>te</i> of <i>aan het</i>. <i>Hij is aan het lachen.</i></li>
<li><b>Onvoltooid deelwoord</b>: iets is bezig, eindigt op -nd(e). <i>Hij liep fluitend naar huis.</i></li>
<li><b>Bijvoeglijk naamwoord</b>: zegt iets over een zelfstandig naamwoord. <i>De vergrote foto.</i></li></ul></div>
<div class="card stack"><div class="eyebrow">Stap 2</div><h2>Pas de regel toe</h2>
<table class="rules"><tr><th>Persoonsvorm t.t.</th><td><b>ik</b>: ik-vorm (ik download)<br><b>jij/je áchter de pv</b>: ik-vorm (download je?)<br><b>jij/u/hij/zij/het</b>: ik-vorm + t (hij downloadt)<br><b>wij/jullie/zij</b>: hele werkwoord (wij downloaden)<br><span class="mut small">Twijfel? Vervang door ‘lopen’ of ‘smurfen’: hoor je een t (hij loopt)? Schrijf dan ook een t.</span></td></tr>
<tr><th>Persoonsvorm v.t.</th><td><b>Zwak</b>: laatste letter van de stam in ${KOF}? → ik-vorm + <b>te(n)</b> (werkte). Anders → ik-vorm + <b>de(n)</b> (leerde).<br><b>Sterk</b>: de klank verandert. Schrijf het zoals je het hoort (lopen → liep).</td></tr>
<tr><th>Voltooid deelwoord</b></th><td><b>Zwak</b>: (ge/be/ver/ont/er) + ik-vorm + <b>t</b> als de laatste letter in ${KOF} zit (gefietst), anders + <b>d</b> (geleerd). Eén t of d!<br><b>Sterk</b>: eindigt op <b>-en</b> (gelopen, gezwommen).</td></tr>
<tr><th>Gebiedende wijs</th><td>Alleen de ik-vorm, geen t: <b>Meld</b> je aan! <b>Houd</b> het geheim!</td></tr>
<tr><th>Infinitief</th><td>Het hele werkwoord. Niet verwarren met de pv t.t. meervoud.</td></tr>
<tr><th>Onvoltooid deelwoord</th><td>Hele werkwoord + d: fluitend, nagelbijtend.</td></tr>
<tr><th>Bijvoeglijk naamwoord</th><td>Kijk naar het voltooid deelwoord. Op -d/-t → bn op <b>-e</b>, zo kort mogelijk: gejat → de <b>gejatte</b> fiets, verbrand → de <b>verbrande</b> lucifer.<br>Op -en → bn ook op <b>-en</b>: de <b>gebakken</b> vis.</td></tr></table></div>
<div class="card stack"><div class="eyebrow">’t ex-kofschip</div><h2>t, x, k, f, s, ch, p</h2>
<p>Kijk naar de <b>laatste letter van de stam</b> (hele werkwoord min -en). Staat die in <b>’t ex-kofschip</b> (of ’t sexy fokschaapje)? Dan gebruik je <b>t</b> (te/ten, gemaakt). Anders <b>d</b> (de/den, gespeeld).</p>
<p class="small">Let op: kijk naar de <b>stam</b>, niet de ik-vorm! Verhuizen → stam verhuiz → <b>z</b> zit er niet in → verhuisde, verhuisd. Verven → stam verv → verfde, geverfd.</p></div>
<div class="card stack"><div class="eyebrow">Let op</div><h2>Valkuilen</h2>
<ul class="tipl"><li><b>Onregelmatig</b>: hebben, kunnen, mogen, willen, zijn, zullen. Leer ze uit je hoofd (zie de tabel bij Oefenen).</li>
<li><b>Engelse werkwoorden</b> vervoeg je als zwakke Nederlandse werkwoorden: hij downloadt, hij gamet, hij racete, geüpdatet. De e en dubbele medeklinker blijven alleen als dat nodig is voor de uitspraak: ik like, ik app, ik chil.</li>
<li><b>Scheidbare werkwoorden</b>: ge in het midden: opgeblazen, afgeraden, nagekeken. Maar: gestofzuigd, gehandbald, geglimlacht.</li>
<li>Werkwoorden die al beginnen met <b>ge, be, ver, ont, er</b> krijgen geen extra ge: verhuisd, betaald.</li>
<li><b>Lijkt op een ander woord</b>: hij begeleidt (pv) ↔ hij heeft begeleid (vd). Bepaal altijd eerst de vorm!</li></ul></div>
<div class="btns"><button class="btn" data-go="oef:stap">Oefen: stap voor stap</button></div>`;

/* ---- invulzinnen (gedeeld) ---- */
function sentenceHTML(q,idx){let n=0;return esc(q.d).split(BL).map((p,i,a)=>i<a.length-1?p+`<input type="text" class="blank" data-q="${idx}" data-b="${n++}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Vul in">`:p).join('')}
function fillSheet(title,intro,qs,key,onDone){
  let list=qs.slice();
  function draw(){view.innerHTML=`<button class="back-link" id="bk">← Terug</button><h2>${esc(title)}</h2><p class="small mut">${esc(intro)}</p>
   <ol class="wsheet">${list.map((q,i)=>`<li><div class="wsent">${sentenceHTML(q,i)} <span class="vhint">(${esc(q.v)})</span></div><div class="wfb" id="f${i}"></div></li>`).join('')}</ol>
   <button class="btn" id="ck">Nakijken</button><div id="res"></div>`;
   $('#bk').onclick=()=>onDone&&onDone();$('#ck').onclick=check;
   $$('.blank').forEach((el,k,all)=>el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const nx=all[k+1];if(nx)nx.focus();else check()}}));
   const f=$('.blank');if(f)f.focus({preventScroll:true})}
  function check(){if(!$('#ck'))return;let ok=0;const wrong=[];
    list.forEach((q,i)=>{let good=true,why='';$$(`.blank[data-q="${i}"]`).forEach(el=>{const r=judge(el.value,q.a[+el.dataset.b]);el.classList.add(r.ok?'yok':'yno');el.readOnly=true;if(!r.ok){good=false;why=why||r.why}});
      if(q.key){mark(q.key,good);if(good)wrongDel(q.key);else wrongAdd(q.key)}
      if(good)ok++;else wrong.push(q);
      $('#f'+i).innerHTML=`<div class="${good?'okline':'noline'}">${good?'✓ Goed':'✗ Het goede antwoord: <b>'+q.a.map(esc).join(' … ')+'</b>'}${why?' <span class="small">'+esc(why)+'</span>':''}</div><details class="why"><summary>Uitleg${q.f&&FORMS[q.f]?' · '+esc(FORMS[q.f]):''}</summary><p>${esc(q.x)}</p></details>`});
    const p=ok/list.length;if(key){S.best[key]=Math.max(S.best[key]||0,p)}addXP(ok*2);save();if(p===1)confetti();
    $('#ck').remove();$('#res').innerHTML=`<div class="card stack" style="text-align:center"><div class="score">${ok} / ${list.length}</div><p><b>${p===1?'Alles goed!':p>=.75?'Goed bezig! Lees de uitleg bij je fouten.':'Lees de uitleg bij elke fout. Wat ging er mis: de vorm of de spelling?'}</b></p>
      <div class="btns">${wrong.length?'<button class="btn" id="fo">Alleen mijn fouten opnieuw</button>':''}<button class="btn ghost" id="ag">Opnieuw (alles)</button><button class="btn ghost" id="bk2">Terug</button></div></div>`;
    const fo=$('#fo');if(fo)fo.onclick=()=>{list=wrong;draw()};$('#ag').onclick=()=>{list=qs.slice();draw()};$('#bk2').onclick=()=>onDone&&onDone();
    $('#res').scrollIntoView({behavior:'smooth'})}
  draw()}

/* ---- WERKBLADEN ---- */
V.wb=function(arg){
  if(arg&&arg.startsWith('s')){const s=D.sheets.find(x=>x.id===arg.slice(1));play('ws');return fillSheet(s.name,'Vul steeds de juiste vorm van het werkwoord in. Als de tijd niet uit de zin blijkt en er niet achter staat, gebruik je de tegenwoordige tijd.',s.q,'ws:'+s.id,()=>go('wb'))}
  const tile=s=>{const b=S.best['ws:'+s.id];return `<button class="gm" data-s="${s.id}"><em>${b==null?'Nog niet gemaakt':b>=1?'✓ Foutloos':'Beste: '+Math.round(b*16)+'/16'}</em><b>Werkblad ${s.nr}</b><span>${s.title?esc(s.title[0].toUpperCase()+s.title.slice(1)):'16 zinnen, gemengd'}</span></button>`};
  view.innerHTML=`<h2>Werkbladen uit de oefenboekjes</h2><p class="small mut">Dit zijn precies de werkbladen uit “Oefeningen in werkwoordspelling” van Gespeld. Na het nakijken zie je bij elke zin de uitleg uit het antwoordblad.</p>
   <h3>Deel 2 <span class="mut small">(dit boekje noemt je docent)</span></h3><div class="games">${D.sheets.filter(s=>s.deel===2).map(tile).join('')}</div>
   <h3 style="margin-top:18px">Deel 1</h3><div class="games">${D.sheets.filter(s=>s.deel===1).map(tile).join('')}</div>`;
  on('[data-s]',e=>go('wb','s'+e.dataset.s))};

/* ---- OEFENEN ---- */
V.oef=function(arg){
  if(arg&&G[arg]){play(arg);return G[arg]()}
  view.innerHTML=`<h2>Oefenen</h2><div class="games">
   <button class="gm" data-g="stap"><em>Methode van je docent</em><b>Stap voor stap</b><span>1. Welke werkwoordsvorm is het? 2. Spel het werkwoord. Met zinnen uit de werkboekjes.</span>${played('stap')}</button>
   <button class="gm" data-g="ppt"><em>Uit de PPT</em><b>Oefening uit de PowerPoint</b><span>De oefenzinnen van dia 31 en 37, met de antwoorden van je docent.</span>${played('ppt')}</button>
   <button class="gm" data-g="kof"><em>Regel</em><b>’t ex-kofschip</b><span>Verleden tijd en voltooid deelwoord van zwakke werkwoorden: te of de, t of d?</span>${played('kof')}</button>
   <button class="gm" data-g="irr"><em>Uit je hoofd</em><b>Onregelmatige werkwoorden</b><span>Vul het schema in: hebben, kunnen, mogen, willen, zijn, zullen.</span>${played('irr')}</button>
   <button class="gm" data-g="eng"><em>Leenwoorden</em><b>Engelse werkwoorden</b><span>Vervoeg chillen, downloaden, gamen, racen, updaten en meer.</span>${played('eng')}</button>
   <button class="gm" data-g="pv"><em>Herkennen</em><b>Vind de persoonsvorm</b><span>Tik de persoonsvormen of infinitieven in de zin aan.</span>${played('pv')}</button></div>`;
  on('[data-g]',e=>go('oef',e.dataset.g))};
const G={};
const backOef=()=>go('oef');
G.ppt=()=>fillSheet('Oefening uit de PowerPoint','Bepaal eerst de werkwoordsvorm (onderstreep de pv’s in je hoofd) en spel dan het werkwoord.',D.ppt,'ppt',backOef);
let stapF='all';
G.stap=function(){
  const pool=ITEMS.filter(q=>q.a.length===1&&(stapF==='all'||q.f===stapF));let qs=shuffle(pool).slice(0,10),i=0,both=0;const opts=['pvtt','pvvt','vd','gw','bn','inf'];
  function draw(){if(i>=qs.length){addXP(both*3);if(both===qs.length)confetti();view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">Stap voor stap</div><div class="score">${both} / ${qs.length}</div><p><b>Zo vaak had je de vorm én de spelling goed.</b></p><div class="btns"><button class="btn" id="ag">Nog 10 zinnen</button><button class="btn ghost" id="bk">Andere oefening</button></div></div>`;$('#ag').onclick=G.stap;$('#bk').onclick=backOef;return}
    const q=qs[i];
    view.innerHTML=`<button class="back-link" id="bk">← Stoppen</button>
    <div class="seg">${[['all','Alles'],['pvtt','pv t.t.'],['pvvt','pv v.t.'],['vd','vd'],['gw','geb. wijs'],['bn','bijv. nw.']].map(x=>`<button data-f="${x[0]}" aria-pressed="${stapF===x[0]}">${x[1]}</button>`).join('')}</div>
    <div class="prog"><span>${i+1}/${qs.length}</span><span class="bar"><i style="width:${i/qs.length*100}%"></i></span><span>${both} goed</span></div>
    <div class="card stack"><div class="wsent big">${esc(q.d).replace(BL,'<span class="gap">…</span>')} <span class="vhint">(${esc(q.v)})</span></div>
     <div id="st1"><p class="small"><b>Stap 1.</b> Welke werkwoordsvorm moet op de puntjes?</p><div class="opts two">${opts.map(f=>`<button class="opt" data-o="${f}">${esc(FORMS[f])}</button>`).join('')}</div></div>
     <div id="st2"></div></div>`;
    $('#bk').onclick=backOef;on('[data-f]',e=>{stapF=e.dataset.f;G.stap()});
    let formOk=false;
    on('[data-o]',e=>{const right=e.dataset.o===q.f;formOk=right;$$('[data-o]').forEach(b=>{b.disabled=true;if(b.dataset.o===q.f)b.classList.add('right')});if(!right)e.classList.add('wrong');
      $('#st2').innerHTML=`<div class="fb ${right?'good':'bad'}">${right?'Goed!':'Het is: '+esc(FORMS[q.f])+'.'}</div><p class="small" style="margin-top:10px"><b>Stap 2.</b> Spel het werkwoord:</p><div class="btns"><input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(q.v.split(',')[0])}" style="flex:1 1 160px"><button class="btn" id="ck">Controleer</button></div><div id="fb2"></div>`;
      const inp=$('#ans');inp.focus();const ck=()=>{if(!$('#ck'))return;const r=judge(inp.value,q.a[0]);inp.readOnly=true;inp.classList.add(r.ok?'yok':'yno');mark(q.key,r.ok);if(r.ok)wrongDel(q.key);else wrongAdd(q.key);if(r.ok&&formOk)both++;save();$('#ck').remove();
        $('#fb2').innerHTML=`<div class="fb ${r.ok?'good':'bad'}">${r.ok?'Goed gespeld!':'Het is: <b>'+esc(q.a[0])+'</b>'}<small>${esc(r.why||'')} ${esc(q.x)}</small></div><button class="btn" id="nx" style="margin-top:10px;width:100%">Volgende</button>`;const nx=$('#nx');nx.onclick=()=>{i++;draw()};setTimeout(()=>nx.focus(),0)};
      $('#ck').onclick=ck;inp.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();ck()}})})}
  if(!pool.length){toast('Geen zinnen');return backOef()}draw()};
G.kof=function(){let qs=sample(D.kof,10),i=0,ok=0;
  function draw(){if(i>=qs.length){addXP(ok*2);if(ok===qs.length)confetti();view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">’t ex-kofschip</div><div class="score">${ok} / ${qs.length}</div><div class="btns"><button class="btn" id="ag">Nog een keer</button><button class="btn ghost" id="bk">Andere oefening</button></div></div>`;$('#ag').onclick=G.kof;$('#bk').onclick=backOef;return}
    const [inf,ik,vt,vd]=qs[i],stam=inf.replace(/en$/,''),last=stam.slice(-2)==='ch'?'ch':stam.slice(-1),inK='txkfsp'.includes(last)||last==='ch';
    view.innerHTML=`<button class="back-link" id="bk">← Stoppen</button><div class="prog"><span>${i+1}/${qs.length}</span><span class="bar"><i style="width:${i/qs.length*100}%"></i></span><span>${ok} goed</span></div>
     <div class="card stack" style="text-align:center"><div class="eyebrow">Zwak werkwoord</div><div class="q" style="font-size:1.6rem">${esc(inf)}</div>
     <div class="kofrow"><span>Gisteren ik</span><input type="text" id="a1" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
     <div class="kofrow"><span>Ik heb</span><input type="text" id="a2" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
     <button class="btn" id="ck">Controleer</button><div id="fb"></div></div>`;
    $('#bk').onclick=backOef;$('#a1').focus();$('#a1').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#a2').focus()}});$('#a2').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ck()}});
    const ck=()=>{if(!$('#ck'))return;const r1=judge($('#a1').value,vt),r2=judge($('#a2').value,vd);[['#a1',r1],['#a2',r2]].forEach(([s,r])=>{$(s).readOnly=true;$(s).classList.add(r.ok?'yok':'yno')});const g=r1.ok&&r2.ok;if(g)ok++;$('#ck').remove();
      $('#fb').innerHTML=`<div class="fb ${g?'good':'bad'}">${g?'Goed!':'Het is: ik <b>'+esc(vt)+'</b> · ik heb <b>'+esc(vd)+'</b>'}<small>Stam: <b>${esc(stam)}</b> → laatste letter <b>${esc(last)}</b> zit ${inK?'<b>wel</b> in ’t ex-kofschip → te / t':'<b>niet</b> in ’t ex-kofschip → de / d'}.${stam!==ik?' (Ik-vorm: '+esc(ik)+', maar kijk naar de stam!)':''}</small></div><button class="btn" id="nx" style="margin-top:10px;width:100%">Volgende</button>`;
      const nx=$('#nx');nx.onclick=()=>{i++;draw()};setTimeout(()=>nx.focus(),0)};$('#ck').onclick=ck}
  draw()};
function tableEx(title,intro,T,rowHead,colLabel){
  view.innerHTML=`<button class="back-link" id="bk">← Terug</button><h2>${esc(title)}</h2><p class="small mut">${esc(intro)}</p>
   <div class="tscroll"><table class="vtab"><tr><th>${esc(rowHead)}</th>${T.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>
   ${T.rows.map((r,i)=>`<tr><th>${esc(r[0])}</th>${r.slice(1).map((c,j)=>c?`<td><input type="text" class="tin" data-r="${i}" data-c="${j}" autocomplete="off" autocapitalize="off" spellcheck="false"></td>`:'<td class="mut">–</td>').join('')}</tr>`).join('')}</table></div>
   <button class="btn" id="ck">Nakijken</button><div id="res"></div>`;
  $('#bk').onclick=backOef;
  $('#ck').onclick=()=>{let ok=0,n=0;$$('.tin').forEach(el=>{const want=T.rows[+el.dataset.r][+el.dataset.c+1];const r=judge(el.value,want);n++;if(r.ok)ok++;else{el.title=want.join(' / ');el.insertAdjacentHTML('afterend',`<div class="tfix">${esc(want.join(' / '))}</div>`)}el.classList.add(r.ok?'yok':'yno');el.readOnly=true});
    addXP(ok);$('#ck').remove();if(ok===n)confetti();$('#res').innerHTML=`<div class="card stack" style="text-align:center"><div class="score">${ok} / ${n}</div><p><b>${ok===n?'Alles goed!':'Onder elk rood vakje staat het goede antwoord.'}</b></p><div class="btns"><button class="btn" id="ag">Opnieuw</button><button class="btn ghost" id="bk2">Andere oefening</button></div></div>`;$('#ag').onclick=()=>tableEx(title,intro,T,rowHead);$('#bk2').onclick=backOef};
  const all=$$('.tin');all.forEach((el,k)=>el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();(all[k+1]||$('#ck')).focus()}}))}
G.irr=()=>tableEx('Onregelmatige werkwoorden','Vul het schema in (zoals op dia 23 en 24 van de PPT). Bij twee goede vormen mag je er één kiezen, bijvoorbeeld wilde of wou.',D.irr,'');
G.eng=()=>tableEx('Engelse werkwoorden','Vervoeg de Engelse werkwoorden volgens de regels van de zwakke Nederlandse werkwoorden (dia 27 t/m 33). Let op het trema in geüpdatet en geüpgraded.',D.eng,'infinitief');
G.pv=function(){let i=0;const qs=D.pv;
  function draw(){if(i>=qs.length){addXP(5);view.innerHTML=`<div class="card stack" style="text-align:center"><div class="score">Klaar!</div><p><b>Gebruik de tijdproef of de getalproef, niet de vraagproef.</b></p><div class="btns"><button class="btn" id="ag">Opnieuw</button><button class="btn ghost" id="bk">Andere oefening</button></div></div>`;$('#ag').onclick=G.pv;$('#bk').onclick=backOef;return}
    const q=qs[i],words=q.s.split(' ');
    view.innerHTML=`<button class="back-link" id="bk">← Stoppen</button><div class="prog"><span>${i+1}/${qs.length}</span><span class="bar"><i style="width:${i/qs.length*100}%"></i></span></div>
     <div class="card stack"><p><b>Tik ${q.ask==='pv'?'alle persoonsvormen':'alle infinitieven'} aan.</b></p><div class="wtap">${words.map((w,k)=>`<button data-k="${k}">${esc(w)}</button>`).join(' ')}</div><button class="btn" id="ck">Controleer</button><div id="fb"></div></div>`;
    $('#bk').onclick=backOef;on('[data-k]',e=>{if($('#ck'))e.classList.toggle('sel')});
    $('#ck').onclick=()=>{const clean=w=>w.toLowerCase().replace(/[.,!?]/g,'');let good=true;$$('[data-k]').forEach(b=>{const isOk=q.ok.includes(clean(b.textContent)),sel=b.classList.contains('sel');if(isOk)b.classList.add('pvok');if(sel&&!isOk){b.classList.add('pvno');good=false}if(isOk&&!sel)good=false;b.disabled=true});
      $('#ck').remove();$('#fb').innerHTML=`<div class="fb ${good?'good':'bad'}">${good?'Helemaal goed!':'Kijk naar de groene woorden.'}<small>${esc(q.x)}</small></div><button class="btn" id="nx" style="margin-top:10px;width:100%">Volgende</button>`;$('#nx').onclick=()=>{i++;draw()}}}
  draw()};

/* ---- TOETS ---- */
V.toets=function(arg){
  if(arg==='so')return so();if(arg==='fout')return fouten();
  view.innerHTML=`<h2>Toets</h2><div class="games">
   <button class="gm" data-t="so"><em>${S.best.so!=null?'Beste cijfer: '+grade(S.best.so):'Zoals de SO'}</em><b>Oefen-SO</b><span>20 zinnen uit de werkboekjes, alle werkwoordsvormen door elkaar. Met cijfer.</span></button>
   ${nWrong()?`<button class="gm" data-t="fout"><em>Slim herhalen</em><b>Mijn fouten (${nWrong()})</b><span>Alle zinnen die je eerder fout had. Goed = van de lijst af.</span></button>`:''}</div>
   <p class="small mut" style="margin-top:12px">Tip: de SO duurt niet de hele les. Neem je leesboek, schrift en lesboek mee!</p>`;
  on('[data-t]',e=>go('toets',e.dataset.t))};
function so(){const pick=[];const want={pvtt:7,pvvt:5,vd:5,gw:1,bn:2};Object.entries(want).forEach(([f,n])=>pick.push(...sample(ITEMS.filter(q=>q.f===f),n)));
  const qs=shuffle(pick);let i=0,ok=0;const wrong=[];
  function draw(){if(i>=qs.length){const p=ok/qs.length;S.best.so=Math.max(S.best.so||0,p);addXP(ok*2);save();if(p>=.8)confetti();
      view.innerHTML=`<div class="card stack" style="text-align:center"><div class="eyebrow">Oefen-SO</div><div class="score">${grade(p)}</div><p><b>${ok} van de ${qs.length} goed.</b> ${p>=.8?'Top!':p>=.55?'Voldoende. Verbeter je fouten nog even.':'Lees het stappenplan nog eens en verbeter je fouten.'}</p><p class="small mut">Cijfer ter indicatie: 1 + 9 × je score.</p></div>
      ${wrong.length?`<div class="card stack"><h3>Dit ging mis</h3><div class="miss">${wrong.map(w=>`<div>${esc(w.q.d).replace(BL,'<b>'+esc(w.q.a[0])+'</b>')}<br><span class="small mut">Jij: ${esc(w.a||'(leeg)')} · ${esc(FORMS[w.q.f]||'')}</span></div>`).join('')}</div></div>`:''}
      <div class="btns"><button class="btn" id="ag">Nieuwe oefen-SO</button>${wrong.length?'<button class="btn ghost" id="fo">Verbeter mijn fouten</button>':''}</div>`;
      $('#ag').onclick=so;const fo=$('#fo');if(fo)fo.onclick=fouten;return}
    const q=qs[i];
    view.innerHTML=`<button class="back-link" id="bk">← Stoppen</button><div class="prog"><span>${i+1}/${qs.length}</span><span class="bar"><i style="width:${i/qs.length*100}%"></i></span><span>${ok} goed</span></div>
     <div class="card stack"><div class="wsent big">${sentenceHTML(q,0)} <span class="vhint">(${esc(q.v)})</span></div><button class="btn" id="ck">Controleer</button><div id="fb"></div></div>`;
    $('#bk').onclick=()=>go('toets');const inp=$('.blank');inp.focus();
    const ck=()=>{if(!$('#ck'))return;const r=judge(inp.value,q.a[0]);inp.readOnly=true;inp.classList.add(r.ok?'yok':'yno');mark(q.key,r.ok);if(r.ok){ok++;wrongDel(q.key)}else{wrongAdd(q.key);wrong.push({q,a:inp.value})}save();$('#ck').remove();
      $('#fb').innerHTML=`<div class="fb ${r.ok?'good':'bad'}">${r.ok?'Goed!':'Het is: <b>'+esc(q.a[0])+'</b>'}<small>${esc(r.why||'')} ${esc(q.x)}</small></div><button class="btn" id="nx" style="margin-top:10px;width:100%">${i+1<qs.length?'Volgende':'Uitslag'}</button>`;const nx=$('#nx');nx.onclick=()=>{i++;draw()};setTimeout(()=>nx.focus(),0)};
    $('#ck').onclick=ck;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ck()}})}
  draw()}
function fouten(){const qs=Object.keys(S.wrong).filter(k=>S.wrong[k]>0&&byKey[k]).map(k=>byKey[k]);if(!qs.length){toast('Geen fouten meer!');return go('toets')}
  fillSheet('Mijn fouten','Deze zinnen had je eerder fout. Goed = van de lijst af.',shuffle(qs).slice(0,16),null,()=>go('toets'))}

window.__studieReload=ids=>{if(!ids.includes(M.id))return;S=Object.assign(DEF(),store.get());header();if(CUR==='start')go('start')};
header();const h=(location.hash||'').slice(1);go(V[h]?h:'start');
})();
