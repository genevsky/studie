/* Frans: verse getallen 0-100 (leer.js, vraagtype 'gen'). Traditionele spelling; de 1990-spelling (vingt-et-un) telt ook goed. */
(function(){
'use strict';
const U=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf','vingt'];
const T={20:'vingt',30:'trente',40:'quarante',50:'cinquante',60:'soixante'};
function fr(n){if(n<=20)return U[n];if(n===100)return 'cent';
  if(n<70){const t=Math.floor(n/10)*10,u=n%10;return u===0?T[t]:T[t]+(u===1?' et un':'-'+U[u])}
  if(n<80)return 'soixante'+(n===71?' et onze':'-'+U[n-60]);if(n===80)return 'quatre-vingts';return 'quatre-vingt-'+U[n-80]}
const R=()=>Math.floor(Math.random()*101);
window.LEER_FR=fr;
window.LEER_GEN={
  schrijf(){const n=R(),w=fr(n);return{k:'type',strict:true,q:'Schrijf in het Frans: '+n,a:w.includes(' et ')?[w,w.replace(/ /g,'-')]:[w],show:w,
    xw:n%10===1&&n>20&&n<80?'Bij een 1 (21-61, 71) schrijf je **et** zonder streepjes.':n===80?'**quatre-vingts** met s (alleen bij 80).':n>=70&&n<80?'70-79 = soixante + 10 t/m 19.':n>=90&&n<100?'90-99 = quatre-vingt + 10 t/m 19.':''}},
  lees(){const n=R();return{k:'num',q:'Welk getal is: '+fr(n),a:n,tol:0}}
};
})();
