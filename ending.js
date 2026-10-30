'use strict';
/* 엔딩 (spec 04 §12): school-yard bench → 도윤's rematch (either result ends well) → camera rises, the ttakji clash, fade →
   scrolling credits → post-credits invitation. The ending flag is saved right after the match, so it never replays by itself;
   the story replay list shows it again, and 도윤 stays in the yard for friendly rematches (free play). */
const Ending={
 rival:{name:'도윤',title:'운동장',hp:420,attack:46,material:'accordion_folder',kind:'doyun',skill:'master',skills:['precise','smash'],hint:'끝내지 못한 승부. 이겨도 져도 좋은 한 판.'},
 start(){
  const p=G.profile;if(!P.tournamentWon(p,'planet')){Village.enter();return}
  p.map.zone='yard';p.map.x=520;Exploration.enter('yard',520);checkpoint('ending');
  story('ending_yard',()=>story('ending_rematch',()=>transition(()=>this.match(false))))
 },
 match(friendly){G.endingFriendly=friendly;G.opponent=this.rival;G.match=null;battle('ending_match')},
 // After the ending: a friendly rematch with 도윤 any time. No reward, retry straight away.
 friendly(){checkpoint('village');transition(()=>this.match(true))},
 finish(win){
  G.animation=null;const p=G.profile;
  if(G.endingFriendly){checkpoint('village');result(win?'오늘도 뒤집었다.':'오늘은 도윤이 뒤집었다.','운동장 친선전 · 보상 없음. 승부는 계속된다.','운동장으로',()=>transition(()=>Exploration.enter('yard',600)),[{value:G.stats.damage,label:'가한 피해'}]);resultButton('한 판 더',()=>transition(()=>this.match(true)));return}
  // Either result finishes the story. The flag and a safe village checkpoint are saved before any scene.
  P.finishEnding(p);p.story.seen.ending_credits=true;p.map.zone='yard';p.map.x=520;checkpoint('village');
  story(win?'ending_win':'ending_loss',()=>this.sky())
 },
 // Camera rises over the yard, the two ttakji clash, the screen fades out.
 sky(done=()=>this.credits(()=>this.post())){
  cancelScene();G.scene='ending_sky';G.state='cinematic';G.endingAt=G.now;panels();
  after(2400,()=>{sound('hit','PERFECT');sound('flip')});after(3100,()=>$('curtain').classList.add('closed'));after(3700,()=>{$('curtain').classList.remove('closed');done()})
 },
 credits(done){
  cancelScene();G.state='credits';G.scene='ending_sky';G.endingAt=G.now-4000;panels();
  const roll=$('credits-roll'),box=$('credits'),el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n};
  roll.replaceChildren(el('h2','credits-title','딱, 지존'));
  for(const [role,name] of TtakjiStory.credits){const row=el('div','credits-row');row.append(el('small','',role),el('strong','',fillName(name)));roll.append(row)}
  roll.append(el('p','credits-end','끝 — 그리고, 다시 접기'));
  box.hidden=false;box.classList.toggle('static',reducedMotion);roll.style.animation='none';void roll.offsetWidth;roll.style.animation='';
  const finish=()=>{if(G.state!=='credits'||G.paused)return;box.hidden=true;roll.onanimationend=null;G.creditsDone=null;G.state='transition';done()};
  G.creditsDone=finish;roll.onanimationend=finish;const skip=$('credits-skip');skip.textContent=reducedMotion?'계속':'건너뛰기';skip.onclick=finish;skip.focus({preventScroll:true})
 },
 post(){story('ending_post',()=>transition(()=>{Exploration.enter('yard',520);toast('자유 경기 · 정류장에서 모든 대회를 다시 즐길 수 있다')}))},
 // 다시 보기: the ending scenes and credits without the match; progress is untouched.
 replay(done){const s=TtakjiStory.scenes;say([...s.ending_yard.lines,...s.ending_rematch.lines],()=>this.sky(()=>this.credits(()=>say(s.ending_post.lines,done,false,true))),false,true)}
};
