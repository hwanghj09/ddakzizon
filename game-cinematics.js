'use strict';
/* Opening rally, near-flip and chapter cards. */
// Shared campaign and short-demo opening rally and near-flip cinematics.
function openingRally(done){
 G.state='cinematic';G.round=3;panels('battle-hud');$('actions').hidden=true;$('timing').hidden=true;
 coach('몇 번이고 주고받았다. 이제 둘 다 마지막 한 수…');
 const frames=[['player-hit',65,100],['enemy-hit',65,64],['player-hit',12,64],['enemy-hit',12,12]];
 frames.forEach(([kind,enemy,hp],i)=>after(200+i*600,()=>{G.animation={kind,at:G.now,grade:'GOOD'};G.enemyHp=enemy;G.hp=hp;sound('hit');updateHealth()}));
 after(2650,()=>{G.animation=null;panels('battle-hud','combat-controls');done();coach('이번 한 번이면… 뒤집을 수 있어!')});
}
function nearMiss(done){
 G.state='resolving';G.animation={kind:'near-flip',at:G.now};panels('battle-hud');impact('조금만 더…!');coach('모서리가 들렸다… 거의 넘어간다!',1600);
 after(reducedMotion?650:1500,()=>{G.animation=null;impact('버텼다…');done()});
}
// The subtitle can appear after a pause (the prologue's small second line).
function card(kicker,title,subtitle,ms,done,subtitleDelay=0){G.state='cinematic';panels();$('chapter-card').hidden=false;$('card-kicker').textContent=kicker;$('card-title').textContent=title;$('card-subtitle').textContent=subtitleDelay?'':subtitle;if(subtitleDelay)after(subtitleDelay,()=>{$('card-subtitle').textContent=subtitle});after(ms,()=>{$('chapter-card').hidden=true;done()})}
