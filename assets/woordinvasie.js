/* Woord-Invasie: klik op de alien met de goede vertaling. Leest window.EXAM (vocab-module). */
(function(){
'use strict';
const D=window.EXAM||{lists:[],meta:{}};const M=D.meta||{};
const LC=(M.lang||'fr').slice(0,2),LN={fr:['Frans','FRANSE'],en:['Engels','ENGELSE'],de:['Duits','DUITSE'],es:['Spaans','SPAANSE']}[LC]||['Frans','FRANSE'];
/* alle woorden van de toets: [vreemd woord, Nederlands, lijst-id] */
const WORDS={};(D.lists||[]).forEach(l=>{WORDS[l.id]=l.blocks.flat().map(w=>[w.fr,w.nl,l.id])});
const pool=()=>S.list==='all'||!WORDS[S.list]?Object.values(WORDS).flat():WORDS[S.list];
const BESTKEY='wi-best-'+(M.id||'x');
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
let W=640,H=640,dpr=1,SM=false;
const COL={void:'#080a17',phos:'#7CFFB2',amber:'#FFC24B',pink:'#FF5FA2',cyan:'#5FE3FF',lilac:'#B79CFF',ink:'#F3F1FF',dim:'#9AA0D6',line:'#2a2f63',bad:'#FF5F5F'};
const HUES=[COL.cyan,COL.pink,COL.amber,COL.lilac,COL.phos];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const stars=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),s:Math.random()*1.6+.4,tw:Math.random()*6}));
function fit(){W=Math.max(300,Math.min(640,stage.clientWidth||640));SM=W<500;H=Math.round(Math.min(SM?W*1.45:W*1.05,Math.max(440,innerHeight-150)));dpr=Math.min(2,window.devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
fit();

/* ---- teksten en lijsten uit de module ---- */
document.title='Woord-Invasie · '+(M.title||'');$('tag').textContent=(M.title||'').toUpperCase();$('back').textContent='‹ '+(M.title||'Terug');
$('lang1').textContent=LN[0];
$('sList').innerHTML='<option value="all">Alles voor de toets ('+Object.values(WORDS).flat().length+' woorden)</option>'+(D.lists||[]).map(l=>`<option value="${esc(l.id)}">${esc(l.title)} (${WORDS[l.id].length})</option>`).join('');
$('sDir').innerHTML=`<option value="fr">${LN[0]} woord, Nederlandse aliens</option><option value="nl">Nederlands woord, ${LN[0]}e aliens</option>`;
function showBest(){let b=0;try{b=+localStorage.getItem(BESTKEY)||0}catch(e){}$('best').textContent=b?'RECORD '+b:''}showBest();
/* ---- instellingen ---- */
const S={};const SPEEDS=['','heel rustig','rustig','normaal','snel','razendsnel'];
function readSettings(){S.list=$('sList').value;S.dir=$('sDir').value;S.n=+$('sN').value;S.speed=+$('sSpeed').value;S.ramp=+$('sRamp').value/100;S.lives=+$('sLives').value;S.words=+$('sWords').value;S.sound=$('sSound').checked;
  $('oN').textContent=S.n;$('oSpeed').textContent=SPEEDS[S.speed];$('oRamp').textContent=Math.round(S.ramp*100)+'%';$('oLives').textContent=S.lives;$('sWords').max=Math.ceil(pool().length/5)*5;if(+$('sWords').value>=pool().length)S.words=999;$('oWords').textContent=S.words>=pool().length?'alle '+pool().length:S.words;
  try{localStorage.setItem('wi-settings',JSON.stringify(S))}catch(e){}}
try{const o=JSON.parse(localStorage.getItem('wi-settings'));if(o){if(o.list&&(o.list==='all'||WORDS[o.list]))$('sList').value=o.list;$('sDir').value=o.dir;$('sN').value=o.n;$('sSpeed').value=o.speed;$('sRamp').value=Math.round(o.ramp*100);$('sLives').value=o.lives;$('sWords').value=o.words;$('sSound').checked=o.sound}}catch(e){}
try{const ql=new URLSearchParams(location.search).get('l');if(ql&&WORDS[ql])$('sList').value=ql}catch(e){}
document.querySelectorAll('.tweak input,.tweak select').forEach(el=>el.addEventListener('input',readSettings));readSettings();

/* ---- geluid ---- */
let AC=null;
function beep(f,d,type,vol,slide){if(!S.sound||!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(slide,AC.currentTime+d);g.gain.value=vol||.06;g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const SFX={shot:()=>beep(1200,.12,'sawtooth',.035,180),good:()=>{beep(523,.08);setTimeout(()=>beep(784,.08),80);setTimeout(()=>beep(1046,.16),160)},bad:()=>beep(160,.35,'sawtooth',.07,60),thrum:()=>beep(55,.08,'square',.025)};

/* ---- woorden ---- */
const label=s=>s.split(/,\s*/)[0];

/* ---- spel ---- */
let G=null,raf=0,last=0;
function newGame(){readSettings();fit();const p=pool();const order=[...p].sort(()=>Math.random()-.5).slice(0,Math.min(S.words,p.length));
  G={order,idx:0,score:0,combo:1,lives:S.lives,shots:0,hits:0,rts:[],missed:[],ang:-Math.PI/2,tAng:-Math.PI/2,lasers:[],parts:[],floats:[],rings:[],speedMul:1,over:false,shake:0,busy:false,inv:[],hurtT:0};nextWord()}
function spawnPos(i,n){/* rond de rand, gelijkmatig verdeeld, met een beetje toeval */const a=(i/n)*Math.PI*2+Math.random()*.5+G.idx;const R=Math.hypot(W,H)/2+30;return{x:W/2+Math.cos(a)*R,y:H/2+Math.sin(a)*R}}
function nextWord(){if(G.idx>=G.order.length||G.lives<=0)return endGame();
  const p=pool(),pair=G.order[G.idx];const ask=S.dir==='fr'?pair[0]:label(pair[1]),ans=S.dir==='fr'?label(pair[1]):pair[0];
  const others=p.filter(q=>q[2]===pair[2]&&q!==pair&&label(q[1])!==label(pair[1])&&q[0]!==pair[0]).sort(()=>Math.random()-.5).slice(0,S.n-1).map(q=>S.dir==='fr'?label(q[1]):q[0]);
  const opts=[ans,...others].sort(()=>Math.random()-.5);const base=(6+S.speed*5)*G.speedMul;
  const FT=SM?96:104,pts=[];
  for(const t of opts){let best=null,bd=-1;for(let k=0;k<40;k++){const x=40+Math.random()*(W-80),y=FT+30+Math.random()*(H-FT-80);
      let d=Math.min(...pts.map(p=>Math.hypot(p.x-x,p.y-y)),Math.hypot(x-W/2,y-H/2)*1.3);if(!pts.length)d=Math.min(d,1e9);if(d>bd){bd=d;best={x,y}}}pts.push(best)}
  G.inv=opts.map((t,i)=>{const a=Math.random()*Math.PI*2,sp=base*(.7+Math.random()*.6);
    return{t,ok:t===ans,x:pts[i].x,y:pts[i].y,head:a,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,sp,r:SM?17:20,col:HUES[i%HUES.length],kind:i%3,rot:Math.random()*6,vr:(Math.random()-.5)*1,alive:true,shakeT:0,pop:0}});
  G.ask=ask;G.ans=ans;G.pair=pair;G.t0=performance.now();G.busy=false;G.banner=G.idx===0?1.4:0}
function endGame(){G.over=true;cancelAnimationFrame(raf);hud();
  $('endTitle').textContent=G.lives>0?'ALLE WOORDEN GEHAD!':'GAME OVER';$('eScore').textContent=G.score;$('eAcc').textContent=G.shots?Math.round(100*G.hits/G.shots)+'%':'–';
  $('eRt').textContent=G.rts.length?(G.rts.reduce((a,b)=>a+b,0)/G.rts.length/1000).toFixed(1).replace('.',',')+'s':'–';
  $('eReview').innerHTML=G.missed.length?'<b>Nog even oefenen:</b><br>'+G.missed.map(p=>`${esc(p[0])} = <span>${esc(p[1])}</span>`).join('<br>'):'<b>Geen fouten. Knap!</b>';
  let b=0;try{b=+localStorage.getItem(BESTKEY)||0;if(G.score>b){localStorage.setItem(BESTKEY,G.score);if(b)$('endTitle').textContent='NIEUW RECORD!'}}catch(e){}showBest();
  $('ovEnd').hidden=false;$('bAgain').focus()}
function hud(){$('hScore').textContent=G.score;$('hCombo').textContent='x'+G.combo;$('hAcc').textContent=G.shots?Math.round(100*G.hits/G.shots)+'%':'–';$('hLives').textContent='♥'.repeat(Math.max(0,G.lives))+'·'.repeat(Math.max(0,S.lives-G.lives))}
function addMissed(){if(!G.missed.includes(G.pair))G.missed.push(G.pair)}

/* ---- klikken = richten en schieten ---- */
function toGame(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
stage.addEventListener('pointerdown',e=>{if(!G||G.over||!$('ovStart').hidden||G.busy)return;const p=toGame(e);
  /* kies de alien die het dichtst bij de klik zit (ruime marge, ook op het woord) */
  let best=null,bd=1e9;G.inv.forEach(v=>{if(!v.alive)return;const dx=p.x-v.x,dy=p.y-(v.y+v.r*.6);const d=Math.hypot(dx*.8,dy);if(d<bd){bd=d;best=v}});
  G.tAng=Math.atan2(p.y-H/2,p.x-W/2);G.shots++;SFX.shot();
  if(best&&bd<(SM?62:70)){G.lasers.push({x1:W/2,y1:H/2,v:best,life:.22});hit(best)}
  else{G.lasers.push({x1:W/2,y1:H/2,x2:p.x,y2:p.y,life:.18})}
  hud()});
function hit(v){if(v.ok){G.hits++;const rt=performance.now()-G.t0;G.rts.push(rt);const pts=(100+Math.round(200*Math.max(0,1-rt/8000)))*G.combo;G.score+=pts;G.combo=Math.min(5,G.combo+1);
    v.alive=false;boom(v.x,v.y,v.col,40);G.rings.push({x:v.x,y:v.y,r:4,life:.6,c:v.col});SFX.good();G.floats.push({x:v.x,y:v.y-20,t:'+'+pts,c:COL.phos,life:1.2});
    G.inv.forEach(o=>{if(o.alive){o.alive=false;boom(o.x,o.y,COL.dim,8)}});G.busy=true;G.idx++;G.speedMul*=1+S.ramp;hud();setTimeout(()=>{if(!G.over)nextWord()},750)}
  else{G.lives--;G.combo=1;v.shakeT=.4;G.shake=.3;SFX.bad();G.floats.push({x:v.x,y:v.y-20,t:'FOUT',c:COL.bad,life:1});addMissed();v.alive=false;boom(v.x,v.y,COL.bad,16);hud();if(G.lives<=0){G.busy=true;setTimeout(endGame,600)}}}
function boom(x,y,color,n){for(let i=0;i<(RM?6:n);i++){const a=Math.random()*Math.PI*2,s=50+Math.random()*200;G.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5+Math.random()*.5,c:color})}}

/* ---- update ---- */
function update(dt){
  if(G.banner>0)G.banner-=dt;
  let da=G.tAng-G.ang;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;G.ang+=da*Math.min(1,dt*14);
  const cx=W/2,cy=H/2,FT=SM?96:104;
  G.inv.forEach(v=>{if(!v.alive)return;
    /* rustig rondzwalken: de koers verandert langzaam en willekeurig */
    v.head+=(Math.random()-.5)*2.2*dt+Math.sin(performance.now()/1700+v.rot)*.25*dt;
    const sp=v.sp*(.85+.15*Math.sin(performance.now()/900+v.rot*3));let tx=Math.cos(v.head)*sp,ty=Math.sin(v.head)*sp;
    /* zachte wanden: blijf in beeld (en onder de vraagbalk) */
    const m=36;if(v.x<m)tx+=(m-v.x)*1.5;if(v.x>W-m)tx-=(v.x-(W-m))*1.5;if(v.y<FT+m)ty+=(FT+m-v.y)*1.5;if(v.y>H-m-14)ty-=(v.y-(H-m-14))*1.5;
    /* een beetje afstand houden van je schip */
    const dx=v.x-cx,dy=v.y-cy,d=Math.hypot(dx,dy)||1;if(d<90){tx+=dx/d*(90-d)*.8;ty+=dy/d*(90-d)*.8}
    v.vx+=(tx-v.vx)*Math.min(1,dt*1.5);v.vy+=(ty-v.vy)*Math.min(1,dt*1.5);v.head=Math.atan2(v.vy,v.vx)*.02+v.head*.98;
    v.x+=v.vx*dt;v.y+=v.vy*dt;v.rot+=v.vr*dt;if(v.shakeT>0)v.shakeT-=dt;if(v.pop<1)v.pop=Math.min(1,v.pop+dt*3)});
  /* aliens duwen elkaar een beetje weg, zodat woorden niet overlappen */
  const A=G.inv.filter(v=>v.alive);for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){const a=A[i],b=A[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,min=SM?92:110;if(d<min){const f=(min-d)/min*40*dt;a.vx-=dx/d*f;a.vy-=dy/d*f;b.vx+=dx/d*f;b.vy+=dy/d*f}}
  G.lasers.forEach(l=>l.life-=dt);G.lasers=G.lasers.filter(l=>l.life>0);
  G.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;p.life-=dt});G.parts=G.parts.filter(p=>p.life>0);
  G.rings.forEach(r=>{r.r+=160*dt;r.life-=dt});G.rings=G.rings.filter(r=>r.life>0);
  G.floats.forEach(f=>{f.y-=26*dt;f.life-=dt});G.floats=G.floats.filter(f=>f.life>0);
  if(G.shake>0)G.shake-=dt;if(G.hurtT>0)G.hurtT-=dt}

/* ---- tekenen (vectorstijl, zoals Asteroids) ---- */
function alien(v,t){const s=v.r;ctx.save();ctx.translate(v.x+(v.shakeT>0?(Math.random()-.5)*8:0),v.y);if(v.pop<1&&!RM)ctx.scale(v.pop,v.pop);ctx.strokeStyle=v.col;ctx.lineWidth=2;ctx.shadowColor=v.col;ctx.shadowBlur=RM?0:8;ctx.beginPath();
  if(v.kind===0){/* schotel */ctx.ellipse(0,2,s,s*.38,0,0,Math.PI*2);ctx.moveTo(-s*.5,-1);ctx.quadraticCurveTo(0,-s*.95,s*.5,-1);ctx.moveTo(-s*.25,s*.38);ctx.lineTo(-s*.35,s*.7);ctx.moveTo(s*.25,s*.38);ctx.lineTo(s*.35,s*.7)}
  else if(v.kind===1){/* kwal */ctx.arc(0,-2,s*.7,Math.PI,0);ctx.lineTo(s*.7,s*.25);for(let k=0;k<4;k++){const x=s*.7-k*s*.47;ctx.quadraticCurveTo(x-s*.12,s*(.7+.15*Math.sin(t*6+k)),x-s*.23,s*.25)}ctx.closePath();ctx.moveTo(-s*.25,-s*.2);ctx.arc(-s*.25,-s*.2,2,0,Math.PI*2);ctx.moveTo(s*.25,-s*.2);ctx.arc(s*.25,-s*.2,2,0,Math.PI*2)}
  else{/* draaiende kristal-alien */ctx.rotate(v.rot);for(let k=0;k<7;k++){const a=k/7*Math.PI*2,rr=s*(k%2?.6:1);k?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(rr,0)}ctx.closePath();ctx.moveTo(4,0);ctx.arc(0,0,4,0,Math.PI*2)}
  ctx.stroke();ctx.restore();
  /* woordlabel onder de alien, met donkere achtergrond voor leesbaarheid */
  const f=SM?15:17;ctx.font=`700 ${f}px "Pixelify Sans", sans-serif`;const tw=ctx.measureText(v.t).width;const lx=Math.max(tw/2+6,Math.min(W-tw/2-6,v.x)),ly=v.y+s+16;
  ctx.fillStyle='rgba(8,10,23,.78)';ctx.fillRect(lx-tw/2-5,ly-f+2,tw+10,f+6);ctx.fillStyle=COL.ink;ctx.textAlign='center';ctx.fillText(v.t,lx,ly+1)}
function ship(t){const cx=W/2,cy=H/2,s=SM?16:19;ctx.save();ctx.translate(cx,cy);
  /* schildring */ctx.strokeStyle=G.hurtT>0?COL.bad:'rgba(124,255,178,.18)';ctx.lineWidth=1;ctx.setLineDash([3,6]);ctx.beginPath();ctx.arc(0,0,s+14,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.rotate(G.ang+Math.PI/2);ctx.strokeStyle=G.hurtT>0&&((t*20|0)%2)?COL.bad:COL.phos;ctx.lineWidth=2.2;ctx.shadowColor=COL.phos;ctx.shadowBlur=RM?0:10;
  ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*.72,s*.8);ctx.lineTo(0,s*.45);ctx.lineTo(-s*.72,s*.8);ctx.closePath();ctx.stroke();ctx.restore()}
function draw(t){ctx.save();ctx.fillStyle=COL.void;ctx.fillRect(0,0,W,H);
  if(G.shake>0&&!RM)ctx.translate((Math.random()-.5)*12*G.shake,(Math.random()-.5)*12*G.shake);
  stars.forEach(s=>{ctx.fillStyle=`rgba(243,241,255,${RM?.5:.25+.35*Math.abs(Math.sin(t/900+s.tw))})`;ctx.fillRect(s.x*W,s.y*H,s.s,s.s)});
  G.rings.forEach(r=>{ctx.globalAlpha=Math.max(0,r.life/.6);ctx.strokeStyle=r.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.stroke()});ctx.globalAlpha=1;
  G.inv.forEach(v=>{if(v.alive)alien(v,t/1000)});
  G.lasers.forEach(l=>{const x2=l.v?l.v.x:l.x2,y2=l.v?l.v.y:l.y2;ctx.globalAlpha=Math.min(1,l.life*6);ctx.strokeStyle=l.v&&!l.v.ok?COL.bad:COL.ink;ctx.lineWidth=3;ctx.shadowColor=COL.cyan;ctx.shadowBlur=RM?0:12;ctx.beginPath();ctx.moveTo(l.x1,l.y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.shadowBlur=0});ctx.globalAlpha=1;
  ship(t);
  G.parts.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1;
  /* vraag bovenaan */
  ctx.fillStyle='rgba(18,22,51,.9)';ctx.fillRect(10,10,W-20,SM?74:82);ctx.strokeStyle=COL.line;ctx.lineWidth=2;ctx.strokeRect(10,10,W-20,SM?74:82);
  ctx.textAlign='center';ctx.fillStyle=COL.dim;ctx.font=(SM?8:11)+'px "Press Start 2P", monospace';ctx.fillText(S.dir==='fr'?'KLIK OP DE VERTALING VAN':'KLIK OP HET '+LN[1]+' WOORD VOOR',W/2,SM?30:34);
  ctx.fillStyle=COL.amber;let fs=SM?32:40;ctx.font=`700 ${fs}px "Pixelify Sans", sans-serif`;while(ctx.measureText(G.ask||'').width>W-70&&fs>18){fs-=2;ctx.font=`700 ${fs}px "Pixelify Sans", sans-serif`}ctx.fillText(G.ask||'',W/2,SM?70:80);
  ctx.textAlign='left';ctx.fillStyle=COL.dim;ctx.font='9px "Press Start 2P", monospace';ctx.fillText(Math.min(G.idx+1,G.order.length)+'/'+G.order.length,18,SM?78:86);
  ctx.textAlign='center';G.floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life);ctx.fillStyle=f.c;ctx.font=(SM?10:13)+'px "Press Start 2P", monospace';ctx.fillText(f.t,Math.max(90,Math.min(W-90,f.x)),f.y)});ctx.globalAlpha=1;
  if(G.banner>0){ctx.fillStyle=`rgba(255,194,75,${Math.min(1,G.banner)})`;ctx.font=(SM?12:16)+'px "Press Start 2P", monospace';ctx.fillText('KLIK OP DE GOEDE!',W/2,H/2+(SM?60:70))}
  if(!RM){ctx.fillStyle='rgba(0,0,0,.16)';for(let y=0;y<H;y+=3)ctx.fillRect(0,y,W,1)}
  ctx.restore()}
function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;update(dt);draw(t);if(!G.over)raf=requestAnimationFrame(loop)}

function start(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}$('ovStart').hidden=true;$('ovEnd').hidden=true;newGame();hud();cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop)}
$('bStart').onclick=start;$('bAgain').onclick=start;
addEventListener('resize',()=>{if(G&&G.over){fit();draw(0)}});
/* stilstaand voorbeeldbeeld achter het startscherm: aliens al in beeld */
readSettings();newGame();G.inv.forEach(v=>v.pop=1);G.over=true;draw(0);
window.__wi=()=>G;
document.fonts&&document.fonts.ready.then(()=>{if(!$('ovStart').hidden)draw(0)});
})();
