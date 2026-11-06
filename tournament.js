'use strict';
/* Common tournament flow (spec 05 §4, §12): 대회 선택 → 접수 → 대진표 → 준비 → 경기 → 결과.
   Screens are built from P.tournaments; the per-stage hooks below only add story scenes and where to walk back to.
   intro[i] may list several scenes (played once each, in order); win/loss scenes play on the first result only. */
// Hooks shared by the venue-zone stages (province → planet, stages.js).
const venueStage=(id,extra)=>({mode:`${id}_tournament`,checkpoint:id,leave:`${P.tournament(id).stage}장으로`,venue:()=>Stages[id].enter(),training:()=>Exploration.enter(id,Exploration.zones[id].objects.find(o=>o[0]==='training')[2]),
 intro:[`${id}_r1_intro`,`${id}_r2_intro`,`${id}_final_intro`],finalLabel:'시상식으로 →',final:()=>Stages[id].rewardStory(true),replayFinal:()=>Stages[id].rewardStory(false),...extra});
const Tournament={
 view:null,
 stages:{
  village:{mode:'tournament',checkpoint:'village',leave:'마을로',venue:()=>Exploration.enter('lobby',700),training:()=>Exploration.enter('square',1150),
   intro:['village_r1_intro','village_r2_intro','village_final_intro'],win:['village_r1_win','village_r2_win',null],finalLabel:'시상식으로 →',final:()=>Village.rewardStory(true),champion:'마을 챔피언',replayFinal:()=>Village.rewardStory(false)},
  city:{mode:'city_tournament',checkpoint:'city',leave:'시 대회장으로',venue:()=>City.enter(),training:()=>Exploration.enter('city',500),
   intro:['city_r1_intro','city_r2_intro','city_final_intro'],win:['city_r1_win',null,null],loss:[null,null,'city_final_loss'],finalLabel:'도윤에게 다가가기 →',final:()=>City.rewardStory(),champion:'시 대회 챔피언',replayFinal:()=>City.rewardStory(false),
   // 강타 is taught by the coach after the first city win (phase 1 timing).
   afterWin:[{label:'코치에게 다가가기 →',checkpoint:'city_skill',run:()=>City.skillStory(true)},null,null],
   // Doyun's corridor reunion happens once, before the first city match, whatever the results.
   before:()=>{if(G.profile.story.reunion)return false;City.reunionStory(()=>Tournament.open('city'));return true}},
  // 박태풍's letter comes before the first match; 상자왕 teaches 꾹 눌러 펴기 after it. Prep stresses 공격형 vs 방어형 (no forced pick).
  province:venueStage('province',{intro:[['province_letter','province_r1_intro'],'province_r2_intro','province_final_intro'],win:[null,'province_r2_win',null],loss:[null,null,'province_final_loss'],champion:'도 대회 챔피언',prepChoice:true,
   afterWin:[{label:'상자왕에게 다가가기 →',checkpoint:'province_skill',run:()=>Province.skillStory(true)},null,null]}),
  // 도윤 loses to the 공인 딱지 선수 in a separate scene after the first match; the bracket reveals it at the same time.
  national:venueStage('national',{win:['national_doyun_loss',null,null],champion:'전국 챔피언',official:true}),
  // A free practice match (no reward) shows each new opponent's traits before the real one (spec 04 §9).
  continent:venueStage('continent',{win:['continent_r1_win',null,null],champion:'대륙 챔피언',practice:true}),
  world:venueStage('world',{win:['world_r1_win','world_r2_win',null],loss:[null,null,'world_final_loss'],champion:'세계 챔피언'}),
  planet:venueStage('planet',{win:['planet_r1_win',null,null],loss:[null,null,'planet_final_loss'],champion:'행성 교류전 우승',finalLabel:'우승식으로 →'})
 },
 // How to reach each stage from a bracket or the 정류장.
 travel(id){if(id==='village')Exploration.move('lobby',160);else if(id==='city')City.travel();else Stages[id]?.travel()},
 el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n},
 frame(title,facility){
  G.state='facility';G.facility=facility;G.keys.clear();panels('facility');Village.hud();
  $('facility-title').textContent=title;$('facility-wallet').textContent=`${G.profile.coins}원`;const content=$('facility-content');content.replaceChildren();
  $('facility-close').onclick=()=>{if(!G.paused)this.leave()};return content
 },
 button(content,label,action,{disabled=false,primary=false,id}={}){const b=this.el('button',primary?'menu-primary':'facility-choice',label);b.disabled=disabled;if(id)b.id=id;b.onclick=()=>{if(!G.paused&&G.state==='facility')action()};content.append(b);return b},
 focus(content){(content.querySelector('.menu-primary:not(:disabled)')||content.querySelector('button:not(:disabled)')||$('facility-close')).focus()},
 refresh(){const v=this.view;if(!v)return;if(v.kind==='prep')this.prep(v.id,v.index,v.replay);else if(v.kind==='bracket')this.open(v.id)},
 // Leaving the bracket returns to the venue lane; reconnecting then starts in the village/venue again.
 leave(){const id=this.view?.id;this.view=null;G.profile.map.tournament=null;Village.hub().close();checkpoint(this.stages[id]?.checkpoint||Village.hubCheckpoint())},
 resume(){
  const id=G.profile.map.tournament,s=this.stages[id];if(!s){Village.enter();return}
  if(id==='village')Exploration.enter('lobby',700);else Exploration.enter(id,G.profile.map.zone===id?G.profile.map.x:1200);
  this.open(id)
 },
 // Bracket screen: registration, current round, next opponent with a 성향 hint, own results and the other matches.
 open(id){
  const p=G.profile,t=P.tournament(id),s=this.stages[id];if(!t||!s)return;
  if(t.entered(p)&&s.before?.())return;
  this.view={kind:'bracket',id};const content=this.frame(`${t.stage} · ${t.name}`,'bracket');
  if(!t.entered(p)){
   content.append(this.el('p','',`장소 · ${t.venue} · 경기 ${t.opponents.length}회 · 참가비 없음`),this.el('p','',`최초 우승 보상 · ${t.firstReward}`));
   if(!t.open(p)){content.append(this.el('p','tournament-locked',`참가 조건 · ${t.condition}`));this.focus(content);return}
   this.button(content,'참가 접수하기',()=>{if(t.enter(p)){p.map.tournament=id;checkpoint('tournament');sound('click')}this.open(id)},{primary:true,id:'tournament-register'});this.focus(content);return
  }
  p.map.tournament=id;checkpoint('tournament');
  const round=p[t.field],won=round===t.opponents.length;
  const head=this.el('div','tournament-head');head.append(this.el('span','menu-eyebrow',`${t.venue} · ${won?'우승':`${t.opponents[round].title} 진행 중`}`));
  if(!won){const o=t.opponents[round],card=this.el('div','opponent-card');card.id='next-opponent';const img=spriteImg(this.el('img'),o.material);img.alt='';card.append(img);const copy=this.el('div');copy.append(this.el('strong','',`다음 상대 · ${o.name}`),this.el('small','',`${P.items[o.material].name} · 상금 ${o.prize}원`),this.el('p','opponent-hint',`성향 · ${o.hint}`));card.append(copy);head.append(card)}
  else head.append(this.el('p','',`${s.champion} · 자유 경기는 반복 보상(최초 상금의 ${Math.round(P.repeatRate*100)}%)만 준다.`));
  content.append(head);
  const rounds=P.bracket(p,id),board=this.el('div','bracket-board');board.id='bracket-board';
  (rounds||t.opponents.map((o,i)=>({title:o.title,matches:[{a:'player',b:o.name,player:true,status:i<round?'won':i===round?'next':'later'}]}))).forEach(r=>{
   const col=this.el('section','bracket-round');col.append(this.el('h4','',r.title));
   for(const m of r.matches){const row=this.el('div',`bracket-match ${m.player?'mine':'other'} ${m.status}`);
    if(m.player)row.textContent=`${heroName()} vs ${m.b} · ${m.status==='won'?'승리':m.status==='next'?'다음 경기':'예정'}`;
    else row.textContent=m.status==='done'?`${m.a} vs ${m.b} → ${m.winner} 승 (${m.method})`:`${m.a} vs ${m.b} · 예정`;
    col.append(row)}
   board.append(col)});
  if(!won){
   this.button(content,'준비 화면 →',()=>this.prep(id,round,false),{primary:true,id:'tournament-prep'});
   if(s.practice)this.button(content,`무료 연습전 · ${t.opponents[round].name} 특성 확인 · 보상 없음`,()=>this.practice(id,round),{id:'tournament-practice'});
  }else{
   t.opponents.forEach((o,i)=>{const b=this.button(content,`자유 경기 · ${o.title} ${o.name} · 반복 보상 ${P.repeatPrize(id,i)}원`,()=>this.prep(id,i,true));b.dataset.replay=String(i)});
   this.button(content,'우승 이야기 다시 보기',()=>s.replayFinal());
   const next=P.tournaments[P.tournaments.indexOf(t)+1];
   if(next)this.button(content,next.entered(p)?`${next.stage}장으로 이동`:`${next.stage}에 도전`,()=>this.travel(next.id),{id:'tournament-next'});
   else if(!p.story.ending)this.button(content,'운동장으로 돌아가기 (엔딩)',()=>Ending.start(),{id:'tournament-ending'});
  }
  content.append(board);
  // 전국 대회: the 공인 딱지 is optional equipment, offered for free and never required (spec 04 §8, 05 §8).
  if(s.official&&!p.story.official)this.button(content,'공인 딱지 받기 · 무료 · 선택',()=>{P.takeOfficial(p);checkpoint('tournament');story('national_official',()=>{toast('공인 딱지를 받았다. 써도 되고 안 써도 된다.');this.open(id)})},{id:'take-official'});
  Journeys.link(content);this.focus(content)
 },
 // 무료 연습전: the real next opponent's data in a sparring match. No reward, no record.
 practice(id,index){const t=P.tournament(id),s=this.stages[id];if(!t?.entered(G.profile))return;this.view=null;G.profile.map.tournament=null;checkpoint(s.checkpoint);G.opponent=t.opponents[index];transition(()=>battle('sparring'))},
 // Prep screen: equipped ttakji, stats, skills, change ttakji, go train/upgrade, 경기 시작 or 뒤로.
 prep(id,index,replay=false){
  const p=G.profile,t=P.tournament(id),s=this.stages[id];if(!t?.entered(p))return;
  if(replay?!P.tournamentWon(p,id):index!==p[t.field])return;
  this.view={kind:'prep',id,index,replay};const o=t.opponents[index],st=P.stats(p),content=this.frame(`경기 준비 · ${o.title}${replay?' (자유 경기)':''}`,'prep');
  const card=this.el('div','equipped-summary');const img=spriteImg(this.el('img'),p.equipped);img.alt='';card.append(img);const copy=this.el('div');copy.append(this.el('span','menu-eyebrow','장착 딱지'),this.el('h4','',`${P.items[p.equipped].name} +${p.upgrades[p.equipped]}`),this.el('p','',`공격 ${st.attack} · 방어 ${st.defense} · 안정 ${st.stability} · 내구 ${st.hp} · 힘 ${st.strength} · 집중력 ${st.concentration}`));card.append(copy);card.id='prep-equipped';content.append(card);
  content.append(this.el('p','',p.skills.length?`사용할 수 있는 기술 · ${p.skills.map(k=>`${R.skills[k].name}(${R.skills[k].key})`).join(' / ')}`:'사용할 수 있는 기술 · 아직 없음 (내려치기만 사용)'));
  content.append(this.el('p','opponent-hint',`상대 · ${o.name} (${P.items[o.material].name}) — ${o.hint}`));
  if(o.gaugeScale)content.append(this.el('p','opponent-hint',G.settings.gaugeSpeed==='slow'?'게이지 속도 설정이 느리게라 이 경기도 느린 게이지 그대로다.':'이 경기는 게이지가 평소보다 빠르다. 설정에서 게이지 속도를 느리게 하면 그대로 유지된다.'));
  if(s.prepChoice)this.choice(content,id,index,replay);
  this.button(content,'경기 시작',()=>this.start(id,index,replay),{primary:true,id:'match-start'});
  this.button(content,'딱지 바꾸기',()=>pause('inventory'));
  this.button(content,'강화·훈련하러 가기',()=>{this.view=null;p.map.tournament=null;checkpoint(s.checkpoint);transition(s.training)});
  this.button(content,'뒤로',()=>this.open(id));
  this.focus(content)
 },
 // 도 대회 prep (spec 04 §7): the strongest owned 공격형 and 방어형 ttakji side by side, one tap to equip. Nothing is forced.
 choice(content,id,index,replay){
  // 방어형 ranks by defense, stability and HP only; subtracting attack made upgraded ttakji lose to an unupgraded keepsake.
  const p=G.profile,score=(id,k)=>{const s=P.stats(p,id);return k==='attack'?s.attack*2-s.defense:s.defense*2+s.stability+s.hp/10};
  const pick=k=>[...p.owned].sort((a,b)=>score(b,k)-score(a,k))[0];
  const box=this.el('section','prep-choice');box.id='prep-choice';box.append(this.el('p','',`공격형과 방어형 중 골라 보자. 두껍다고 강한 건 아니다. 정답은 없다.`));
  for(const [k,label] of [['attack','공격형'],['defense','방어형']]){const item=pick(k),s=P.stats(p,item);const b=this.button(box,`${label} · ${P.items[item].name} +${p.upgrades[item]} · 공격 ${s.attack} / 방어 ${s.defense} / 안정 ${s.stability} / 내구 ${s.hp}${item===p.equipped?' · 장착 중':''}`,()=>{if(P.equip(p,item)){checkpoint('tournament');Village.hud();sound('click');this.prep(id,index,replay)}},{disabled:item===p.equipped});b.dataset.form=k;const img=spriteImg(this.el('img'),item);img.alt='';b.prepend(img)}
  content.append(box)
 },
 start(id,index,replay=false){
  const p=G.profile,t=P.tournament(id),s=this.stages[id];if(!t||!s||!t.entered(p))return;
  if(replay?!P.tournamentWon(p,id):index!==p[t.field])return;
  this.view=null;p.map.tournament=id;checkpoint('tournament');
  const go=()=>{G.match={id,index,replay};G.tournamentRound=index;G.opponent=t.opponents[index];transition(()=>battle(s.mode))};
  const scenes=replay?[]:[].concat(s.intro?.[index]||[]).filter(scene=>!p.story.seen[scene]);
  const play=i=>i<scenes.length?story(scenes[i],()=>play(i+1)):go();play(0)
 },
 hint(o){return `${o.hint} 준비 화면에서 딱지를 바꾸거나 강화하고 다시 도전할 수 있다.`},
 // Result screen. Rewards are granted by P.completeMatch together with the match record, then saved, before any scene.
 finish(win){
  const m=G.match;G.match=null;G.animation=null;
  if(!m){result(win?'승리':'패배','대회 기록 밖의 경기다.',Village.hubLabel(),()=>transition(()=>Village.returnHub()));return}
  const p=G.profile,t=P.tournament(m.id),s=this.stages[m.id],o=t.opponents[m.index],final=m.index===t.opponents.length-1;
  const leave=()=>resultButton(s.leave,()=>{p.map.tournament=null;checkpoint(s.checkpoint);transition(s.venue)});
  if(!win){
   checkpoint('tournament');
   const show=()=>{result('아직 끝나지 않았다.',`${o.name}에게 졌다. ${this.hint(o)} 이긴 경기와 상금은 그대로다.`,'재도전 →',()=>transition(()=>this.start(m.id,m.index,m.replay)),[{value:G.stats.damage,label:'가한 피해'},{value:G.stats.perfect,label:'완벽'}]);
    const prep=$('result-secondary');prep.hidden=false;prep.textContent='준비 화면';prep.onclick=()=>{if(G.paused||G.state!=='result')return;G.state='transition';transition(()=>{s.venue();this.prep(m.id,m.index,m.replay)})};leave()};
   const scene=!m.replay&&s.loss?.[m.index];if(scene)say(TtakjiStory.scenes[scene].lines,show,false,true);else show();return
  }
  const reward=P.completeMatch(p,m.id,m.index,m.replay);
  if(!reward){checkpoint('tournament');result('승리!','이 경기 보상은 이미 받았다.','대진표로',()=>transition(()=>{s.venue();this.open(m.id)}));return}
  Village.hud();
  const stats=[{value:`+${reward.coins}원`,label:reward.first?'최초 보상':'반복 보상',kind:reward.first?'first-reward':'repeat-reward'}];
  if(!reward.first)stats.push({value:'수령 완료',label:'최초 보상'});
  for(const id of reward.items)stats.push({value:P.items[id].name,label:'획득'});
  for(const id of reward.skills)stats.push({value:R.skills[id].name,label:'기술 습득'});
  for(const [id,n] of Object.entries(reward.materials))stats.push({value:`${P.items[id].name.replace(' 딱지','')} 재료 +${n}`,label:'재료'});
  // Skip unlock notes that repeat a skill listed above, and drop a trailing '해금' that the label already says.
  for(const u of reward.unlocks)if(!reward.skills.some(id=>u.startsWith(R.skills[id].name)))stats.push({value:u.replace(/ 해금$/,''),label:'해금'});
  // Trophies (상대 딱지) are listed by result() itself.
  const after=reward.first&&final?{label:s.finalLabel,checkpoint:`${m.id}_reward`,run:s.final}:reward.first&&s.afterWin?.[m.index]||null;
  checkpoint(after?.checkpoint||'tournament');
  const show=()=>{
   const title=reward.first?(final?`${t.stage}에서 우승했다!`:'다음 상대, 나와!'):'자유 경기 승리!';
   result(title,`${o.name}에게 이겼다.${reward.first?'':' 반복 보상은 최초 상금보다 작다.'}`,after?after.label:reward.first?'다음 경기 →':'대진표로',()=>transition(()=>{if(after){after.run();return}s.venue();this.open(m.id)}),stats);
   if(!after&&reward.first){const prep=$('result-secondary');prep.hidden=false;prep.textContent='준비 화면';prep.onclick=()=>{if(G.paused||G.state!=='result')return;G.state='transition';transition(()=>{s.venue();this.prep(m.id,m.index+1,false)})}}
   if(!reward.first)resultButton('다시 하기',()=>transition(()=>this.start(m.id,m.index,true)));
   if(!after)leave()
  };
  const scene=reward.first&&s.win?.[m.index];if(scene)story(scene,show);else show()
 },
 // 대회 선택 (정류장): every stage from the registry with conditions, match count, first-clear reward and progress.
 select(){
  const p=G.profile;this.view=null;const content=this.frame('시외 정류장 · 대회 선택','select');$('facility-close').onclick=()=>{if(!G.paused)Village.close()};
  content.append(this.el('p','',p.story.ending?'자유 경기 · 우승한 대회는 언제든 다시 할 수 있다. 이동 요금 무료.':'이동 요금 무료 · 열린 대회만 갈 수 있다.'));
  if(G.mapZone!=='center')this.button(content,'뒤집마을로 돌아가기 · 주민센터 앞',()=>Exploration.move('center',1300));
  for(const t of P.tournaments){
   const open=t.entered(p)||t.open(p),round=p[t.field],progress=!t.entered(p)?'미접수':round===t.opponents.length?'우승':`${round} / ${t.opponents.length} 승`;
   const b=this.button(content,`${t.stage} · ${t.name}${open?` · ${progress}`:` · 잠김 — ${t.condition}`}`,()=>this.travel(t.id),{disabled:!open});b.dataset.tournament=t.id;
   b.title=`${t.venue} · 경기 ${t.opponents.length}회 · 최초 우승 보상 ${t.firstReward}`;
   content.append(this.el('small','tournament-meta',`${t.venue} · 경기 ${t.opponents.length}회 · 참가 조건 ${t.condition} · 최초 우승 보상 ${t.firstReward}`))
  }
  this.focus(content)
 }
};
