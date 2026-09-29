/* Studiehub sync: voortgang delen tussen apparaten met een persoonlijke sync-code.
   Werkt offline-first: localStorage blijft de bron; online wordt samengevoegd (merge), niet overschreven. */
(function(){
'use strict';
const CFG=window.SYNC_CONFIG||{};
const ENABLED=!!(CFG.url&&CFG.key);
const LS=localStorage;
const CODEKEY='studie-sync:code',LASTKEY='studie-sync:last',ERRKEY='studie-sync:err';
const get=k=>{try{return LS.getItem(k)}catch(e){return null}},set=(k,v)=>{try{v==null?LS.removeItem(k):LS.setItem(k,v)}catch(e){}};
const appKeys=()=>{const out=[];try{for(let i=0;i<LS.length;i++){const k=LS.key(i);if(/^studie:[a-z0-9-]+$/i.test(k)&&k!=='studie:xp')out.push(k)}}catch(e){}return out};
const readApp=k=>{try{return JSON.parse(LS.getItem(k))}catch(e){return null}};

/* ---- samenvoegen ---- */
const num=x=>typeof x==='number'&&isFinite(x)?x:0;
function mergeLb(a,b){const o={};new Set([...Object.keys(a||{}),...Object.keys(b||{})]).forEach(k=>{const x=(a||{})[k],y=(b||{})[k];
  if(!x){o[k]=y;return}if(!y){o[k]=x;return}
  const tx=num(x.t),ty=num(y.t);o[k]=tx!==ty?(tx>ty?x:y):(num(x.b)!==num(y.b)?(num(x.b)>num(y.b)?x:y):(num(x.d)>=num(y.d)?x:y))});return o}
function mergeMax(a,b){const o=Object.assign({},a||{});Object.entries(b||{}).forEach(([k,v])=>{o[k]=o[k]==null?v:Math.max(num(o[k]),num(v))});return o}
function mergeOr(a,b){const o=Object.assign({},a||{});Object.entries(b||{}).forEach(([k,v])=>{o[k]=!!(o[k]||v)});return o}
/* wrong: waarde = tijdstip (positief = fout, negatief = weer goed); nieuwste wint */
function mergeStamp(a,b){const o=Object.assign({},a||{});Object.entries(b||{}).forEach(([k,v])=>{const w=o[k];o[k]=w==null||Math.abs(num(v))>Math.abs(num(w))?v:w});return o}
function mergeApp(a,b){if(!a)return b;if(!b)return a;const newer=num(a.ts)>=num(b.ts)?a:b,older=newer===a?b:a;
  const o=Object.assign({},older,newer);
  o.xp=Math.max(num(a.xp),num(b.xp));o.lb=mergeLb(a.lb,b.lb);o.best=mergeMax(a.best,b.best);
  if(a.chk||b.chk)o.chk=mergeOr(a.chk,b.chk);if(a.wrong||b.wrong)o.wrong=mergeStamp(a.wrong,b.wrong);
  const ea=num(a.examT),eb=num(b.examT);o.exam=ea||eb?(ea>=eb?a.exam:b.exam):(a.exam!=null?a.exam:b.exam);o.examT=Math.max(ea,eb)||undefined;
  if(a.played||b.played)o.played=mergeMax(a.played,b.played);
  o.pct=Math.max(num(a.pct),num(b.pct));if(a.stats||b.stats){const x=a.stats||{},y=b.stats||{};o.stats=Object.assign({},x,y,{seen:Math.max(num(x.seen),num(y.seen)),total:Math.max(num(x.total),num(y.total))})}
  o.ts=Math.max(num(a.ts),num(b.ts));return o}
function mergeDoc(local,remote){const apps=Object.assign({},(remote&&remote.apps)||{});Object.entries(local.apps).forEach(([id,s])=>{apps[id]=mergeApp(s,apps[id])});return{v:1,apps}}

/* ---- server ---- */
function hdr(){const h={'Content-Type':'application/json',apikey:CFG.key};if(!/^sb_/.test(CFG.key))h.Authorization='Bearer '+CFG.key;return h}
async function rpc(fn,body,keepalive){const r=await fetch(CFG.url.replace(/\/$/,'')+'/rest/v1/rpc/'+fn,{method:'POST',headers:hdr(),body:JSON.stringify(body),keepalive:!!keepalive});
  if(!r.ok)throw new Error('HTTP '+r.status);const t=await r.text();return t?JSON.parse(t):null}

const canon=x=>JSON.stringify(x,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((o,kk)=>(o[kk]=v[kk],o),{}):v);
/* ---- sync ---- */
let busy=null,again=false,timer=null;
const listeners=[];const emit=()=>listeners.forEach(f=>{try{f(status())}catch(e){}});
function localDoc(){const apps={};appKeys().forEach(k=>{const s=readApp(k);if(s)apps[k.slice(7)]=s});return{v:1,apps}}
async function syncNow(){const code=get(CODEKEY);if(!ENABLED||!code)return false;
  if(busy){again=true;return busy}
  busy=(async()=>{try{
    const remote=await rpc('get_progress',{p_code:code});const local=localDoc();const merged=mergeDoc(local,remote);
    const changedIds=[];Object.entries(merged.apps).forEach(([id,s])=>{let before=null;try{before=JSON.parse(LS.getItem('studie:'+id))}catch(e){}const after=JSON.stringify(s);if(canon(before)!==canon(s)){try{LS.setItem('studie:'+id,after)}catch(e){}changedIds.push(id)}});
    if(canon(remote)!==canon(merged))await rpc('save_progress',{p_code:code,p_data:merged});
    set(LASTKEY,String(Date.now()));set(ERRKEY,null);
    if(changedIds.length&&typeof window.__studieReload==='function')window.__studieReload(changedIds);
    return true}
  catch(e){set(ERRKEY,String(e&&e.message||e));return false}
  finally{busy=null;emit();if(again){again=false;setTimeout(syncNow,500)}}})();
  return busy}
function changed(){if(!ENABLED||!get(CODEKEY))return;clearTimeout(timer);timer=setTimeout(syncNow,4000)}
function flush(){if(!ENABLED||!get(CODEKEY))return;clearTimeout(timer);
  /* bij weggaan: alleen versturen als er niets op de server nieuwer kan zijn dan wat we hebben -> gewoon volledige sync proberen */
  syncNow()}
function status(){return{enabled:ENABLED,code:get(CODEKEY),last:+get(LASTKEY)||null,error:get(ERRKEY),busy:!!busy}}
const WORDS=['tijger','kaas','raket','panda','wolk','draak','appel','zebra','koala','pizza','ster','maan','vos','uil','taart','komeet','pinguin','kikker','ananas','vulkaan','robot','ridder','piraat','dolfijn','cactus','regenboog','mango','haai','orka','lama','egel','bever'];
function newCode(){const r=n=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n};return WORDS[r(WORDS.length)]+'-'+String(1000+r(9000))+'-'+WORDS[r(WORDS.length)]+'-'+String(10+r(90))}
const clean=c=>String(c||'').trim().toLowerCase().replace(/\s+/g,'-');
const valid=c=>/^[a-z0-9-]{8,40}$/.test(c);
async function setCode(c,mode){c=clean(c);
  if(!valid(c))throw new Error('Een code heeft minstens 8 tekens: alleen letters, cijfers en streepjes.');
  if(mode==='new'||mode==='join'){let ex;try{ex=await rpc('get_progress',{p_code:c})}catch(e){throw new Error('Kan de sync nu niet bereiken. Ben je online? Probeer het zo nog eens.')}
    if(mode==='new'&&ex!=null)throw new Error('Deze code is al in gebruik. Kies een andere. Is het jouw eigen code? Gebruik dan “Ik heb al een code”.');
    if(mode==='join'&&ex==null)throw new Error('Deze code bestaat nog niet. Controleer de spelling.')}
  set(CODEKEY,c);set(ERRKEY,null);emit();return syncNow()}
function forget(){set(CODEKEY,null);set(LASTKEY,null);set(ERRKEY,null);emit()}

window.StudieSync={enabled:ENABLED,status,syncNow,changed,setCode,newCode,forget,onChange:f=>listeners.push(f),_merge:{mergeApp,mergeDoc}};
if(ENABLED&&get(CODEKEY)){
  window.addEventListener('load',()=>syncNow());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();else syncNow()});
  window.addEventListener('online',()=>syncNow());
}
})();
