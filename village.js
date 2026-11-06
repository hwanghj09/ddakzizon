'use strict';
const P=TtakjiProgression;
const Village={
 places:[{id:'house',name:'우리 집',x:145},{id:'training',name:'연습장',x:365},{id:'press',name:'딱지 압축기',x:585},{id:'cup',name:'마을 대회',x:805}],
 isBattle(){return G.mode?.endsWith('_tournament')||['tournament','sparring','training','story_battle','story_training','ending_match'].includes(G.mode)},
 hub(){return Stages[G.hub]||(G.hub==='city'?City:this)},
 hubCheckpoint(){return P.stageIds.includes(G.hub)?G.hub:'village'},
 hubLabel(){return P.stageIds.includes(G.hub)?`${P.tournament(G.hub).stage}장으로`:'마을로 돌아가기'},
 returnHub(){this.hub().enter()},
 hud(){const p=G.profile;setInventory(`${P.items[p.equipped].name} +${p.upgrades[p.equipped]} · ${p.coins}원`,false,false);$('inventory').classList.add('campaign-item');/* Absolute URL: a url() inside a custom property resolves against the stylesheet in css/. */$('inventory').style.setProperty('--item-icon',`url('${new URL(window.World?.spriteReady(p.equipped,'inventory')===false?spriteSrc(p.equipped,'base'):spriteSrc(p.equipped),document.baseURI).href}')`)},
 // Rematch won: Minsu hands over his ttakji and tells the news; the hero stays in the yard to look at the empty bench.
 epilogue(){
  cancelScene();G.scene='school';P.schoolReward(G.profile);checkpoint('complete');this.hud();
  story('rematch_win',()=>transition(()=>Exploration.enter('yard',600)))
 },
 enter(first=false){
  const m=G.profile.map;Exploration.enter(P.stageIds.includes(m.zone)?'center':m.zone,first?400:m.x);if(Journeys.resume())return;
 },
 nearest(){return this.places.find(p=>Math.hypot(G.hero.x-p.x,G.hero.y-365)<88)},
 updateInteract(){const place=this.nearest();coach(place?`${place.name} · E`:'준비됐으면 대회장으로 와!')},
 interact(){const place=this.nearest();if(!place)return;G.keys.clear();const p=G.profile;
  const greetings={house:[['나','오늘은 어떤 딱지로 나가볼까? 방향키로 고르고 Enter로 장착하자.']],training:[['앞집 아저씨','스페이스로 들어 올리고, 가운데서 다시 눌러. 세 번 치면 훈련 끝!'],['앞집 아저씨','세 번 훈련하면 힘과 집중력이 늘어. 끝까지 하면 심부름값 5원도 줄게.']],press:[['압축기 주인','한 번 누를 때마다 겹이 늘어. 공격력 3, 내구도 10이 오르고 방어력은 1 줄어.'],['압축기 주인','장착한 딱지를 눌러 줄게. 가격과 다음 능력치를 확인하고 골라. 강화는 선택이야.']],cup:[['접수원','주민센터 컵 접수처예요. 대진표를 보고, 준비가 되면 경기를 시작해요.']]};
  if(!p.seen[place.id]){p.seen[place.id]=true;checkpoint(this.hubCheckpoint());say(greetings[place.id],()=>this.open(place.id))}else this.open(place.id)
 },
 open(id){
  if(id==='stories'){Journeys.open();return}if(id==='forge'){Forge.open();return}
  if(id==='cup'&&G.hub==='village'){Tournament.open('village');return}
  if(id==='press'&&G.hub==='village'&&G.profile.round<1){Exploration.talk('압축기 주인','대회 1회전이 끝나면 안내해 줄게. 지금 딱지로도 충분히 이길 수 있어.');return}
  G.state='facility';G.facility=id;G.keys.clear();panels('facility');this.hud();const p=G.profile,stats=P.stats(p),content=$('facility-content');content.replaceChildren();$('facility-title').textContent=this.hub().places.find(x=>x.id===id)?.name||(id==='fusion'?'융합기':'딱지 가게');$('facility-wallet').textContent=`${p.coins}원`;
  const paragraph=text=>{const el=document.createElement('p');el.textContent=text;content.append(el)};
  const button=(label,action,disabled=false)=>{const b=document.createElement('button');b.className='facility-choice';b.textContent=label;b.disabled=disabled;b.onclick=()=>{if(!G.paused&&G.state==='facility')action()};content.append(b);return b};
  if(id==='house'){
   paragraph(`선수 Lv.${P.level(p)+1} · 힘 ${stats.strength} · 집중력 ${stats.concentration} · 훈련 ${p.xp}/${P.trainingLimit(p)}`);
   for(const item of p.owned){const s=P.stats(p,item);const b=button(`${P.items[item].name} +${p.upgrades[item]} · 공격 ${s.attack} / 방어 ${s.defense} / 안정 ${s.stability} / 내구 ${s.hp}${item===p.equipped?' · 장착 중':''}`,()=>{P.equip(p,item);checkpoint(this.hubCheckpoint());this.open(id)});b.classList.toggle('selected',item===p.equipped);const img=spriteImg(document.createElement('img'),item);img.alt='';b.prepend(img)}
   paragraph(P.items[p.equipped].description);if(p.skills.length)paragraph(`배운 기술 · ${p.skills.map(id=>R.skills[id].name).join(' / ')}`);
  }else if(id==='press'){
   const price=P.cost(p);const img=document.createElement('img');img.className='press-preview';img.src=spriteSrc(p.equipped,'base');img.alt=P.items[p.equipped].name;content.append(img);
   paragraph(`${P.items[p.equipped].name} +${p.upgrades[p.equipped]} · ${P.forms[P.formOf(p)].name}`);
   const next=P.nextStats(p);paragraph(price===null?`공격 ${stats.attack} · 방어 ${stats.defense} · 내구 ${stats.hp} · 최대 강화`:`겹 +${p.upgrades[p.equipped]} → +${p.upgrades[p.equipped]+1} · 공격 ${stats.attack} → ${next.attack} · 방어 ${stats.defense} → ${next.defense} · 내구 ${stats.hp} → ${next.hp}`);
   button(price===null?'최대 강화 완료':`압축하기 · ${price}원${p.coins<price?' · 잔액 부족':''}`,()=>{if(P.upgrade(p)){sound('fold');checkpoint(this.hubCheckpoint());this.open(id);toast('더 납작하고 단단해졌다!')}},price===null||p.coins<price);
   if(P.refineryOpen(p))button('제련소 · 형태 가공',()=>Forge.visit());else if(p.cityEntered)paragraph('제련소 · 공사 중 (도 대회 우승 후 개방)');
   button(`딱지 가게 · 새 딱지 ${P.shopStock(p).length}종`,()=>this.open('shop'));
   if(P.fusionOpen(p))button('융합기',()=>this.open('fusion'));
  }else if(id==='fusion'){
   paragraph(p.owned.includes('fusion')?'융합 딱지를 이미 만들었다. 압축은 공방에서 계속할 수 있다.':`신문지, 색종이, 머리카락 딱지를 하나로 녹인다. 압축 단계는 세 딱지의 평균을 이어받는다. ${P.fusionCost}원.`);
   if(!p.owned.includes('fusion'))button(P.canFuse(p)?`융합기 · 세 딱지를 하나로 · ${P.fusionCost}원${p.coins<P.fusionCost?' · 잔액 부족':''}`:'융합기 · 신문지, 색종이, 머리카락 딱지가 모두 필요',()=>{if(P.fuse(p)){P.equip(p,'fusion');sound('perfect');checkpoint(this.hubCheckpoint());this.open(id);toast('융합 딱지 완성! 바로 장착했다.')}},!P.canFuse(p)||p.coins<P.fusionCost);
   button('공방으로',()=>this.open('press'));
  }else if(id==='shop'){
   paragraph('대회를 올라갈수록 새 딱지가 들어온다. 산 딱지는 +0부터 다시 압축해야 한다.');
   const items=P.shopStock(p);if(!items.length)paragraph('지금 살 수 있는 딱지는 모두 모았다. 다음 대회에 가면 새 물건이 들어온다.');
   for(const item of items){const it=P.items[item],price=it.source.price;const b=button(`${it.name} · 공격 ${it.attack} / 방어 ${it.defense} / 안정 ${it.stability} / 내구 ${it.hp}${it.focus?` / 집중력 +${it.focus}`:''} · ${price}원`,()=>{if(P.buy(p,item)){sound('perfect');checkpoint(this.hubCheckpoint());this.open('shop');toast(`${it.name} 획득! 집이나 인벤토리에서 장착하자.`)}},p.coins<price);b.dataset.item=item;const img=spriteImg(document.createElement('img'),item);img.alt='';b.prepend(img)}
   button('공방으로 돌아가기',()=>this.open('press'));
  }else if(id==='training'){
   paragraph(`선수 Lv.${P.level(p)+1} · 훈련 ${p.xp}/${P.trainingLimit(p)}`);
   paragraph(p.xp===P.trainingLimit(p)?'현재 훈련 숙련 완료 · 타이밍 연습과 5원 보상은 계속 받을 수 있다.':`다음 성장까지 ${3-p.xp%3}회 · 힘 +2 / 집중력 +1`);
   button('타이밍 훈련 · 3번 치기',()=>{checkpoint(this.hubCheckpoint());G.practice=[];transition(()=>battle('training'))});
   button('연습 대결 · 보상 없음',()=>{checkpoint(this.hubCheckpoint());const t=P.tournament(G.hub);G.opponent=G.hub==='village'?P.opponents[p.round===3?2:0]:t.opponents[Math.min(p[t.field],2)];transition(()=>battle('sparring'))});
  }else{
   Tournament.open('village');return;
  }
  if(id==='training'||id==='cup')Journeys.link(content);
  $('facility-close').onclick=()=>{if(!G.paused)this.close()};const first=content.querySelector('button:not(:disabled)');(first||$('facility-close')).focus()
 },
 close(){G.state='explore';panels('explore-ui');updateInteract();$('game').focus()},
 // Back-compat entry used by tests and old buttons: start the next village match directly.
 startTournament(){if(G.profile.round>=3)return;if(!G.profile.map.poster){Exploration.talk('접수원','학교 앞 포스터를 먼저 확인해 줘.');return}P.enterVillage(G.profile);Tournament.start('village',G.profile.round,false)},
 configureBattle(mode){
  G.me=P.stats(G.profile);G.hp=G.maxHp=G.me.hp;G.opponent=mode==='training'?P.opponents[0]:G.opponent;G.foe=P.fighter(G.opponent);G.enemyHp=G.enemyMax=G.foe.hp;this.hud();
  document.querySelector('.health-card.player small').textContent=`${P.items[G.profile.equipped].name}${P.formOf(G.profile)==='balanced'?'':' · '+P.forms[P.formOf(G.profile)].name}`;
  $('enemy-name').replaceChildren(document.createTextNode(mode==='training'?'연습 상대':G.opponent.name));const small=document.createElement('small');small.textContent=P.items[G.opponent.material].name;$('enemy-name').append(small)
 },
 ready(){
  if(G.mode==='training')$('turn-label').textContent=`훈련 ${G.practice.length+1} / 3`;
  else {const intent=G.intent||{};if(intent.hidden)coach(`${G.opponent.name}이(가) 자로 각도를 잰다… 다음 수를 알 수 없다!`,0);else if(intent.skill&&G.foe.skills.includes(intent.skill)&&G.foeCool[intent.skill]>=0&&G.foeCool[intent.skill]<=1)coach(`${intent.defending?'방어하면서 ':''}다음 반격은 ${R.skills[intent.skill].name}!`,0);else if(intent.exposed)coach(intent.perfect?'빈틈! 피해 1.5배 · 반격은 완벽!':'빈틈! 피해 1.5배 · 반격은 약한 타격!',0);else if(intent.defending)coach(intent.pierce?'방어한다! 완벽만 뚫을 수 있어!':'이번엔 방어! 들어오는 피해 절반!',0);else if(intent.perfect)coach('다음 반격은 완벽이다!',0);else if(intent.weak)coach('이번 반격은 힘을 뺀다! 약한 타격 타격!',0)}
 },
 stance(grade){return G.mode==='training'?1:P.stance(G.intent||{},grade)},
 trainingComplete(){if(G.mapPractice){G.mapPractice=false;checkpoint(this.hubCheckpoint());result('손목을 풀었다.','무료 연습 · 재화와 능력치는 그대로다.','돌아가기',()=>transition(()=>this.returnHub()));return}const before=P.level(G.profile);P.train(G.profile,G.practice);checkpoint(this.hubCheckpoint());this.hud();result('손에 감이 붙었다.',P.level(G.profile)>before?'힘 +2 · 집중력 +1':'세 번 더, 조금 더 정확하게.',this.hubLabel(),()=>transition(()=>this.returnHub()),[{value:'+5원',label:'훈련 보상'},{value:`Lv.${P.level(G.profile)+1}`,label:'선수'}])},
 finish(win){
  if(['story_battle','story_training'].includes(G.mode)){Journeys.finish(win);return}
  if(G.mode==='ending_match'){Ending.finish(win);return}
  if(G.mode.endsWith('_tournament')||G.mode==='tournament'){Tournament.finish(win);return}
  G.animation=null;if(G.mode==='sparring'){result(win?'연습도 실전처럼.':'한 번 더 연습하자.','상금 없는 연습 대결',this.hubLabel(),()=>transition(()=>this.returnHub()));return}
 },
 // Final won: 박태풍 explains 정밀 타격 (already granted on the result screen) and the MC's 물컵 mix-up. Replays grant nothing.
 rewardStory(first=true){cancelScene();G.mapZone='lobby';G.camera=0;G.hub='village';G.scene='village';G.mode='village';this.hud();G.hero={x:600,y:440,walk:0,facing:1};if(first)checkpoint('village_reward');story('village_award',()=>{if(first){checkpoint('village');transition(()=>Exploration.enter('lobby',700))}else transition(()=>Tournament.open('village'))})}
};
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||G.paused||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;
 if(G.state!=='facility')return;
 if(e.code==='KeyE'){e.preventDefault();$('facility-close').click();return}
 if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.code)){
  e.preventDefault();const buttons=[...$('facility').querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement),step=['ArrowDown','ArrowRight'].includes(e.code)?1:-1;buttons[(i+step+buttons.length)%buttons.length].focus()
 }
});
