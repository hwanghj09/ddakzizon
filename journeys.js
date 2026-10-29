'use strict';
const J=TtakjiJourneys;
const Journeys={
 selected:null,
 atHub(){return Object.hasOwn(J.regions,G.scene)&&G.hub===G.scene},
 objective(a){return a.type==='drill'?`5번 중 GOOD 이상 ${a.good}회${a.perfect?` · PERFECT ${a.perfect}회`:''}`:({focus:'집중(F)을 사용하고 승리',guard:'뿌리 버티기(R)를 사용하고 승리',power:'승부수(C) 타격 후 승리'}[a.goal]||'상대 딱지를 뒤집어 승리')},
 gate(region){if(J.canCompete(G.profile,region))return false;this.selected=J.current(G.profile,region)?.id;this.open();return true},
 link(content){
  const e=J.current(G.profile,G.hub),b=document.createElement('button');b.className='facility-choice';b.textContent=e&&G.profile.journey.stages[e.id]!==2?`이야기 · ${e.title}`:'이야기 수첩';b.onclick=()=>{if(!G.paused&&G.state==='facility'){this.selected=e?.id;this.open()}};content.append(b)
 },
 open(){
  if(!this.atHub())return;
  G.state='facility';G.facility='stories';G.keys.clear();panels('facility');Village.hud();
  const p=G.profile,content=$('facility-content');content.replaceChildren();$('facility-title').textContent=`${J.regions[G.hub].name} · 이야기 수첩`;$('facility-wallet').textContent=`${p.coins}원`;
  const episodes=J.episodes.filter(e=>e.region===G.hub),current=J.current(p,G.hub);
  if(!episodes.some(e=>e.id===this.selected))this.selected=current?.id||episodes[0].id;
  const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n};
  const list=node('div','journey-list','');
  for(const e of episodes){const stage=p.journey.stages[e.id]||0,available=J.available(p,e),b=node('button',`journey-entry${e.id===this.selected?' selected':''}`,`${e.round+1}. ${e.title} · ${stage===2?'완료':available?`${stage} / 2`:'이전 경기 후'}`);b.dataset.episode=e.id;b.setAttribute('aria-pressed',String(e.id===this.selected));b.onclick=()=>{if(G.paused)return;this.selected=e.id;this.open()};list.append(b)}content.append(list);
  const e=J.byId(this.selected),stage=p.journey.stages[e.id]||0;content.append(node('p','journey-summary',e.summary));
  const steps=node('ol','journey-steps','');e.steps.forEach((a,i)=>steps.append(node('li',i<stage?'done':i===stage?'current':'',`${i<stage?'✓ ':''}${a.title} · ${this.objective(a)}`)));content.append(steps);
  const available=J.available(p,e),button=node('button','menu-primary',stage===2?'지난 이야기 다시 읽기':available?`${stage+1}번째 이야기 시작`:'이전 대회 경기부터 마치자');button.id='journey-start';button.disabled=!available;
  button.onclick=()=>{if(G.paused||G.state!=='facility')return;if(stage===2)this.replay(e);else this.start(e.id)};content.append(button);
  if(stage<2&&available)content.append(node('p','',`과제마다 ${J.reward(e)}원 · 훈련 +1`));
  $('facility-close').onclick=()=>{if(!G.paused)Village.close()};if(!G.paused)(button.disabled?content.querySelector(`[data-episode="${this.selected}"]`):button).focus({preventScroll:true})
 },
 start(id){
  const e=J.byId(id),p=G.profile,step=p.journey.stages[id]||0;
  if(G.paused||!this.atHub()||!J.available(p,e)||step>=2||e.region!==G.hub)return;
  if(p.journey.pending){this.resume();return}
  const activity=e.steps[step];checkpoint(Village.hubCheckpoint());
  say(activity.lines,()=>transition(()=>{
   G.storyJob={id,step,activity};G.storyUsed={};G.practice=[];
   G.opponent=activity.type==='drill'?P.opponents[0]:activity.opponent;
   battle(activity.type==='drill'?'story_training':'story_battle');
  }))
 },
 ready(){const a=G.storyJob?.activity;if(!a)return;$('turn-label').textContent=a.type==='drill'?`${G.practice.length+1} / 5 · ${this.objective(a)}`:(a.goal&&G.storyUsed?.[a.goal]?'기술 사용 완료 · 승리하면 성공':this.objective(a))},
 drillComplete(){this.finish(J.passed(G.storyJob.activity,G.practice))},
 finish(won){
  const job=G.storyJob;if(!job)return;G.animation=null;const e=J.byId(job.id),success=won&&J.passed(job.activity,G.practice,G.storyUsed);
  G.storyJob=null;
  if(!success){checkpoint(Village.hubCheckpoint());result(won?'약속한 기술도 써보자.':'한 번 더 해보자.',this.objective(job.activity),'다시 도전',()=>{Village.hub().enter();this.start(job.id)},[{value:G.stats.damage,label:'가한 피해'}]);$('result-secondary').hidden=false;$('result-secondary').textContent='준비하고 돌아오기';$('result-secondary').onclick=()=>{if(!G.paused&&G.state==='result')transition(()=>Village.returnHub())};return}
  if(!J.complete(G.profile,job.id,job.step,P.trainingLimit(G.profile)))return;
  checkpoint(Village.hubCheckpoint());Village.hud();sound('win');
  result(job.step===1?'또 하나의 이야기.':'조금 더 가까워졌다.',job.activity.title,'이야기 계속',()=>this.ending(e,job.step),[{value:`+${J.reward(e)}원`,label:'보상'},{value:'+1',label:'훈련'}])
 },
 ending(e,step){
  cancelScene();G.hub=e.region;G.scene=e.region;G.mode=e.region;G.mapZone=e.region==='village'?'square':e.region;G.camera=0;G.hero={x:420,y:440,walk:0,facing:1};Village.hud();
  say(e.steps[step].ending,()=>{G.profile.journey.pending=null;checkpoint(e.region);this.selected=e.id;this.open()})
 },
 resume(){const pending=G.profile.journey.pending;if(!pending)return false;const e=J.byId(pending.id);if(!e)return false;this.ending(e,pending.step);return true},
 replay(e){say(e.steps.flatMap(a=>[...a.lines,...a.ending]),()=>this.open())}
};
