'use strict';
/* Home lesson: Dad explains reinforcement, the first completed fold grants +1 once,
   then free timing practice leads directly to the school rematch. */
const School={
 fatherLesson(){
  const p=G.profile;
  if(p.schoolReward||P.phases.indexOf(p.map.phase)>=P.phases.indexOf('folded')){practice();return}
  if(G.mapZone!=='home'||!Exploration.active())Exploration.enter('home',420);
  checkpoint('home');
  story('tutorial_father',home)
 },
 offerPractice(){
  const button=$('result-secondary');button.hidden=false;button.textContent='집에서 연습';button.onclick=()=>{if(G.paused||G.state!=='result')return;G.state='transition';checkpoint('practice');transition(practice)}
 }
};
const foldHints=['왼쪽 위 모서리를 안으로 접자.','오른쪽 아래를 겹쳐 단단하게.','오른쪽 위 모서리를 중앙으로.','마지막 모서리를 틈에 끼워 넣자.','됐다.'];
function home(){
 cancelScene();checkpoint('home');G.scene='home';G.mode='folding';G.fold=0;G.foldTry=0;G.foldMiss=0;G.foldAt=G.now;G.stolen=false;G.animation=null;panels();setInventory('◇ 신문지 한 장',false);
 story('tutorial_fold',()=>{G.state='folding';panels('fold-controls');renderFold()})
}
// Every corner button stays usable: a wrong corner still folds (slightly off) so the tutorial can always continue.
function renderFold(missed=false){
 $('fold-hint').textContent=missed&&G.fold<4?`조금 어긋났다. 괜찮아, 계속 접자. · ${foldHints[G.fold]}`:foldHints[G.fold];
 document.querySelectorAll('[data-fold]').forEach((b,i)=>{b.disabled=G.fold>=4;b.classList.toggle('ready',i===G.fold);b.classList.toggle('done',i<G.fold)})
}
function foldCorner(index){
 if(G.state!=='folding'||!Number.isInteger(index)||index<0||index>3||G.fold>=4)return;
 const missed=index!==G.fold;if(missed)G.foldMiss++;
 G.state='folding-busy';G.fold++;G.foldAt=G.now;sound('fold');renderFold(missed);
 after(450,()=>{
  if(G.fold<4){G.state='folding';document.querySelector(`[data-fold="${G.fold}"]`)?.focus({preventScroll:true});return}
  // A correct sequence succeeds immediately. Only an actual wrong corner needs another try.
  if(G.foldTry===0&&G.foldMiss>0){G.foldTry=1;say(TtakjiStory.scenes.tutorial_crooked.lines,()=>{G.fold=0;G.foldAt=G.now;G.state='folding';panels('fold-controls');renderFold();$('game').focus({preventScroll:true})},false,true);return}
  finishFold()
 })
}
function finishFold(){
 const p=G.profile;if(!p.schoolReward&&P.phases.indexOf(p.map.phase)<P.phases.indexOf('folded'))p.map.phase='folded';
 const reinforced=!p.schoolReward&&!p.story.seen.tutorial_upgrade_done,before=p.upgrades.newspaper;
 if(reinforced){p.upgrades.newspaper=Math.max(1,p.upgrades.newspaper);p.story.seen.tutorial_upgrade_done=true}
 setInventory(`◇ 신문지 딱지 +${p.upgrades.newspaper}`);checkpoint('practice');sound('perfect');
 result('다시, 한 장.',p.upgrades.newspaper>before?'아빠와 접힌 선을 눌러 첫 강화를 마쳤다. 공격 +3 · 내구 +10 · 방어 −1. 이제 표적에 연습해 보자.':'접기를 마쳤다. 이미 배운 첫 강화는 유지된다. 이제 표적에 연습해 보자.','연습하기 →',()=>transition(practice),[{value:`신문지 +${p.upgrades.newspaper}`,label:'완성'},{value:G.foldMiss?`${G.foldMiss}번 어긋남`:'반듯하게',label:'접기'}])
}
function practice(){cancelScene();G.practice=[];G.fold=4;setInventory('◇ 신문지 딱지 × 1');battle('practice')}
function practiceIntro(){const go=()=>{panels('battle-hud','combat-controls');ready()};if(G.profile.story.seen.tutorial_practice){go();return}story('tutorial_practice',go)}
// One attack with one gauge stop is the only required lesson; after it the rematch opens even if practice is abandoned.
function practiceHit(sock){
 const p=G.profile;if(!p.schoolReward&&P.phases.indexOf(p.map.phase)<P.phases.indexOf('rematch')){p.map.phase='rematch';checkpoint('rematch')}
 const next=()=>{if(G.practice.length<3){ready();return}flipDemo()};
 if(sock){after(900,()=>story('practice_sock',()=>{panels('battle-hud','combat-controls');checkpoint(G.checkpoint);next()}));return}
 after(1250,next)
}
function flipDemo(){G.flipEnemy=G.now;sound('flip');sound('win');impact('뒤집기!','PERFECT');after(1100,()=>say(TtakjiStory.scenes.practice_flip.lines,practiceComplete))}
function practiceComplete(){
 G.animation=null;const counts=g=>G.practice.filter(x=>x===g).length;if(!G.profile.schoolReward)checkpoint('rematch');sound('perfect');
 result('이제, 다시 한 판.','연습은 집 연습 표적에서 언제든 다시 할 수 있다. 학교로 가서 민수에게 다시 도전하자.','학교로 가기 →',()=>transition(()=>Exploration.enter('yard',760)),[{value:counts('PERFECT')+counts('GOOD'),label:'좋음 이상'},{value:counts('BAD'),label:'약한 타격'},{value:'뒤집기 성공',label:'마무리'}]);
 const again=$('result-secondary');again.hidden=false;again.textContent='한 번 더 연습';again.onclick=()=>{if(G.paused||G.state!=='result')return;G.state='transition';transition(practice)}
}
