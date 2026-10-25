/* Wiskunde H2: generatoren voor steeds nieuwe oefensommen (leer.js, vraagtype 'gen'). Elke generator geeft een vraag terug. */
(function(){
'use strict';
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[R(0,a.length-1)];
const R0=(a,b)=>{let x=0;while(!x)x=R(a,b);return x};
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1};
const fr=(n,d=1)=>{if(d<0){n=-n;d=-d}const k=gcd(n,d);return{n:n/k,d:d/k}};
const add=(a,b)=>fr(a.n*b.d+b.n*a.d,a.d*b.d),sub=(a,b)=>fr(a.n*b.d-b.n*a.d,a.d*b.d),mul=(a,b)=>fr(a.n*b.n,a.d*b.d);
const ans=f=>f.d===1?String(f.n):f.n+'/'+f.d;
const neg=n=>n<0?'−'+(-n):String(n);
/* weergave als breuk of gemengd getal in boeknotatie: −2{1/3} */
const show=(f,mixed)=>{if(f.d===1)return neg(f.n);const s=f.n<0?'−':'',a=Math.abs(f.n),w=Math.floor(a/f.d);return mixed&&w?`${s}${w}{${a%f.d}/${f.d}}`:`${s}{${a}/${f.d}}`};
const mix=f=>{if(f.d===1)return neg(f.n);const a=Math.abs(f.n),w=Math.floor(a/f.d);return w?(f.n<0?'−':'')+w+' '+(a%f.d)+'/'+f.d:''};
const q=(expr,f)=>{const m=mix(f);return{k:'calc',q:'Bereken: '+expr,a:ans(f),x:m&&f.d!==1?`= ${show(f)} = ${show(f,true)}`:''}};
const D=[2,3,4,5,6,8,9,10,12];
const rf=(pos)=>{const d=pick(D);let n=R(1,d-1);const f=fr(n,d);return pos||Math.random()<.5?f:fr(-f.n,f.d)};

window.LEER_GEN={
  /* 2.1 rekenvolgorde met hele getallen */
  volgorde(){const t=R(1,6);let a,b,c,d,e,v;
    if(t===1){a=R(2,30);b=R(2,9);c=R(2,9);v=a+b*c;e=`${a} + ${b} · ${c}`}
    else if(t===2){b=R(2,9);c=R(2,9);a=b*c+R(1,40);v=a-b*c;e=`${a} − ${b} · ${c}`}
    else if(t===3){a=R(2,12);b=R(2,12);c=R(2,6);d=R(1,(a+b)*c-1);v=(a+b)*c-d;e=`(${a} + ${b}) · ${c} − ${d}`}
    else if(t===4){b=R(2,9);c=R(2,9);a=b*R(2,9);v=a/b*c;e=`${a} : ${b} · ${c}`}
    else if(t===5){d=R(2,6);const s=d*R(2,6);b=R(1,s-1);c=s-b;a=s/d+R(1,40);v=a-s/d;e=`${a} − (${b} + ${c}) : ${d}`}
    else{a=R(20,99);b=R(2,9);c=R(2,9);d=R(2,9);v=a-b*c+d;e=`${a} − ${b} · ${c} + ${d}`}
    return q(e,fr(v))},
  /* 2.2 breuken optellen en aftrekken (positief) */
  breuk_op(){let a=rf(true),b=rf(true);if(Math.random()<.35)a=add(a,fr(R(1,3)));const plus=Math.random()<.5;
    if(!plus&&sub(a,b).n<0)[a,b]=[b,a];return q(`${show(a,true)} ${plus?'+':'−'} ${show(b,true)}`,plus?add(a,b):sub(a,b))},
  /* 2.2 breuken vermenigvuldigen (ook gemengd en met een heel getal) */
  breuk_keer(){const t=R(1,3);let a=rf(true),b=rf(true);if(t===2)a=add(a,fr(R(1,2)));if(t===3){const n=b.d*R(1,6);return q(`${show(a)} · ${n}`,mul(a,fr(n)))}
    return q(`${show(a,true)} · ${show(b,true)}`,mul(a,b))},
  /* 2.3 optellen en aftrekken met negatieve getallen */
  neg_op(){const a=R0(-25,25),b=R0(-25,25),c=R0(-25,25),t=R(1,3);
    if(t===1)return q(`${neg(a)} + ${neg(b)}`,fr(a+b));if(t===2)return q(`${neg(a)} − ${neg(b)}`,fr(a-b));
    return q(`${neg(a)} − (${neg(b)} − ${neg(c)})`,fr(a-(b-c)))},
  /* 2.4 vermenigvuldigen en delen met negatieve getallen, met rekenvolgorde */
  neg_keer(){const t=R(1,4),a=R0(-12,12),b=R0(-9,9),c=R0(-9,9);
    if(t===1)return q(`${neg(a)} · ${neg(b)}`,fr(a*b));
    if(t===2){const p=a*b;return q(`${neg(p)} : ${neg(b)}`,fr(a))}
    if(t===3)return q(`${neg(a)} − ${neg(b)} · ${neg(c)}`,fr(a-b*c));
    const d=R0(-9,9);return q(`(${neg(a)} − ${neg(b)}) · ${neg(c)} + ${neg(d)}`,fr((a-b)*c+d))},
  /* 2.5 deelstreep: eerst teller en noemer apart */
  deelstreep(){const dv=R0(-9,9),qq=R0(-8,8),nv=dv*qq,a=R(-20,20),b=nv-a,c=R(-10,10),d=c-dv;
    const top=b<0?`${neg(a)} − ${-b}`:`${neg(a)} + ${b}`,bot=d<0?`${neg(c)} + ${-d}`:`${neg(c)} − ${d}`;
    return q(`{${top}/${bot}}`,fr(qq))},
  /* 2.5 negatieve breuken optellen, aftrekken en vermenigvuldigen */
  neg_breuk(){let a=rf(false),b=rf(false);if(Math.random()<.4)a=a.n<0?sub(a,fr(R(1,3))):add(a,fr(R(1,3)));const t=R(1,3);
    if(t===1)return q(`${show(a,true)} + ${show(b,true)}`,add(a,b));
    if(t===2)return q(`${show(a,true)} − ${show(fr(Math.abs(b.n),b.d),true)}`,sub(a,fr(Math.abs(b.n),b.d)));
    return q(`${show(a,true)} · ${show(b,true)}`,mul(a,b))},
  /* 2.3 vergelijken met <, > of = */
  vergelijk(){const t=R(1,2);let a,b;
    if(t===1){a=fr(R0(-60,60));b=fr(R0(-60,60))}else{const w=R(0,9),s=Math.random()<.7?-1:1;a=fr(s*(w*4+R(1,3)),4);b=fr(s*(w*5+R(1,4)),5)}
    const c=a.n*b.d-b.n*a.d;return{k:'mc',q:`Vul in: ${show(a,true)} … ${show(b,true)}`,opts:['<','>','='],a:c<0?0:c>0?1:2,x:'Op de getallenlijn ligt het grootste getal het meest naar rechts.'}}
};
})();
