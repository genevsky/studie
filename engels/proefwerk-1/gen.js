/* Engels: verse getallen, rangtelwoorden en tijden (leer.js, vraagtype 'gen'). Brits-Engels: one hundred AND one. */
(function(){
'use strict';
const O=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const T=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function en(n){if(n<20)return O[n];if(n<100)return T[Math.floor(n/10)]+(n%10?'-'+O[n%10]:'');
  if(n<1000)return O[Math.floor(n/100)]+' hundred'+(n%100?' and '+en(n%100):'');
  return en(Math.floor(n/1000))+' thousand'+(n%1000?(n%1000<100?' and ':' ')+en(n%1000):'')}
const SP={one:'first',two:'second',three:'third',five:'fifth',eight:'eighth',nine:'ninth',twelve:'twelfth'};
function ord(n){const w=en(n),i=Math.max(w.lastIndexOf('-'),w.lastIndexOf(' '))+1,l=w.slice(i);
  return w.slice(0,i)+(SP[l]||(l.endsWith('y')?l.slice(0,-1)+'ieth':l+'th'))}
function abbr(n){const t=n%100;return n+((t>10&&t<14)?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th')}
const NLU=['','één','twee','drie','vier','vijf','zes','zeven','acht','negen','tien','elf','twaalf'];
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function tijd(h,m){const h2=h%12+1,H=O[h],H2=O[h2];
  const en_={0:H+" o'clock",5:'five past '+H,10:'ten past '+H,15:'a quarter past '+H,20:'twenty past '+H,25:'twenty-five past '+H,30:'half past '+H,
    35:'twenty-five to '+H2,40:'twenty to '+H2,45:'a quarter to '+H2,50:'ten to '+H2,55:'five to '+H2}[m];
  const nl={0:NLU[h]+' uur',5:'vijf over '+NLU[h],10:'tien over '+NLU[h],15:'kwart over '+NLU[h],20:'tien voor half '+NLU[h2],25:'vijf voor half '+NLU[h2],30:'half '+NLU[h2],
    35:'vijf over half '+NLU[h2],40:'tien over half '+NLU[h2],45:'kwart voor '+NLU[h2],50:'tien voor '+NLU[h2],55:'vijf voor '+NLU[h2]}[m];
  return {en:"It's "+en_,nl:'Het is '+nl+'.',dig:h+':'+String(m).padStart(2,'0')}}
function tijdAlts(e){const b=e.replace(/^It's /,''),out=["It's "+b,'It is '+b];if(b.startsWith('a quarter'))out.push("It's "+b.slice(2),'It is '+b.slice(2));return out}
window.LEER_EN={en,ord,abbr,tijd,tijdAlts};
window.LEER_GEN={
  schrijf(){const r=Math.random(),n=r<.7?R(21,99):r<.85?R(101,199):R(1001,1020),w=en(n);
    return{k:'type',strict:true,q:'Schrijf in het Engels: '+n,a:[w],show:w,
      xw:n>1000?'Na **thousand** komt **and** als er daarna nog een getal onder de 100 komt: one thousand **and** eleven.':n>100?'Na **hundred** komt **and**: one hundred **and** one.':'Tiental en eenheid met een **streepje**: thirty-two. Let op: **forty** (zonder u), **fifty**, **eighty**.'}},
  rang(){const n=R(1,31),w=ord(n);return{k:'type',strict:true,q:'Schrijf voluit in het Engels: '+abbr(n),a:[w],show:w,
    xw:'Let op: first, second, third, **fifth**, **eighth**, **ninth**, **twelfth**, twent**ieth**, twenty-**first**.'}},
  tijd(){const t=tijd(R(1,12),5*R(0,11));return{k:'type',strict:true,q:'Hoe zeg je in het Engels: '+t.nl+' ('+t.dig+')',a:tijdAlts(t.en),show:t.en+'.',
    xw:'Na **half** noem je in het Engels het uur dat al geweest is: half drie = **half past two**. Tien voor half drie = **twenty past two**.'}}
};
})();
