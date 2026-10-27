'use strict';
const P=TtakjiProgression;
const Village={
 places:[{id:'house',name:'우리 집',x:145},{id:'training',name:'연습장',x:365},{id:'press',name:'딱지 압축기',x:585},{id:'cup',name:'마을 대회',x:805}],
 isBattle(){return ['tournament','city_tournament','province_tournament','sparring','training'].includes(G.mode)},
 hub(){return G.hub==='province'?Province:G.hub==='city'?City:this},
 hubCheckpoint(){return ['city','province'].includes(G.hub)?G.hub:'village'},
 hubLabel(){return G.hub==='province'?'도 대회장으로':G.hub==='city'?'시 대회장으로':'마을로 돌아가기'},
 returnHub(){this.hub().enter()},
 hud(){const p=G.profile;setInventory(`${P.items[p.equipped].name} +${p.upgrades[p.equipped]} · ${p.coins}원`,false,false);$('inventory').classList.add('campaign-item');$('inventory').style.setProperty('--item-icon',`url('assets/sprites/ttakji/${p.equipped}/ttakji_${p.equipped}_inventory.png')`)},
 epilogue(){
  cancelScene();G.scene='school';G.mode='epilogue';G.hero={x:570,y:380,walk:0,facing:1};P.schoolReward(G.profile);checkpoint('complete');this.hud();
  say([['부하','알았어, 네 딱지 돌려줄게. 내 색종이 딱지도 가져가.'],['나','이제 너희 대장이랑 붙을 거야.'],['부하','걔? 어제 이사 갔는데.'],['나','…승부도 안 끝났는데?'],['나','잠깐, 저 광고는 뭐지?']],()=>{G.scene='advert';say([['대회 광고','제1회 우리 마을 딱지 대회! 참가비 무료. 우승 상금 120원.'],['나','학교 다음은 마을인가. 좋아, 한번 나가보자.'],['나','모아둔 용돈 80원. 집에서 배운 강화가 여기서도 도움이 되겠지.']],()=>transition(()=>this.enter(true)))})
 },
 enter(first=false){
  cancelScene();G.hub='village';G.scene='village';G.state='explore';G.mode='village';G.flipPlayer=G.flipEnemy=0;G.stolen=false;G.hero={x:145,y:393,walk:0,facing:1};panels('explore-ui');this.hud();checkpoint(this.hubCheckpoint());
  if(first)say([['앞집 아저씨','대회 나간다며? 난 1회전 상대다. 잘 부탁해.'],['앞집 아저씨','집에선 딱지를 고르고, 연습장에선 실력을 키워. 오른쪽 압축기도 써보고.'],['앞집 아저씨','방향키로 돌아다니다 문 앞에서 E. 준비되면 맨 오른쪽 대회장으로 와!'],['앞집 아저씨','가방은 I로 열어. 잠깐 쉴 땐 Esc로 메뉴를 켜고.']],()=>{G.state='explore';panels('explore-ui');this.updateInteract()});else this.updateInteract();$('game').focus({preventScroll:true})
 },
 nearest(){return this.places.find(p=>Math.hypot(G.hero.x-p.x,G.hero.y-365)<88)},
 updateInteract(){const place=this.nearest();coach(place?`${place.name} · E`:'준비됐으면 대회장으로 와!')},
 interact(){const place=this.nearest();if(!place)return;G.keys.clear();const p=G.profile;
  const greetings={house:[['나','오늘은 어떤 딱지로 나가볼까? 방향키로 고르고 Enter로 장착하자.']],training:[['앞집 아저씨','스페이스로 들어 올리고, 가운데서 다시 눌러. 세 번 치면 훈련 끝!'],['앞집 아저씨','세 번 훈련하면 타격과 집중이 늘어. 끝까지 하면 심부름값 5원도 줄게.']],press:[['압축기 주인','납작하게 눌러주면 공격력 3, 내구도 10이 올라가.'],['압축기 주인','장착한 딱지를 눌러줄게. 가격과 다음 능력치를 확인하고 골라.']],cup:[['접수원','앞집 아저씨, 유치원 친구, 그리고 결승 상대가 기다리고 있어.'],['접수원','경기마다 상금을 바로 줄게. 중간에 강화하고 와도 돼. 져도 이긴 경기는 인정해!']]};
  if(!p.seen[place.id]){p.seen[place.id]=true;checkpoint(this.hubCheckpoint());say(greetings[place.id],()=>this.open(place.id))}else this.open(place.id)
 },
 open(id){
  G.state='facility';G.facility=id;G.keys.clear();panels('facility');this.hud();const p=G.profile,stats=P.stats(p),content=$('facility-content');content.replaceChildren();$('facility-title').textContent=this.hub().places.find(x=>x.id===id).name;$('facility-wallet').textContent=`${p.coins}원`;
  const paragraph=text=>{const el=document.createElement('p');el.textContent=text;content.append(el)};
  const button=(label,action,disabled=false)=>{const b=document.createElement('button');b.className='facility-choice';b.textContent=label;b.disabled=disabled;b.onclick=()=>{if(!G.paused&&G.state==='facility')action()};content.append(b);return b};
  if(id==='house'){
   paragraph(`선수 Lv.${P.level(p)+1} · 타격 +${P.level(p)*2} · 집중 ${stats.concentration} · 훈련 ${p.xp}/${P.trainingLimit(p)}`);
   for(const item of p.owned){const s=P.stats(p,item);const b=button(`${P.items[item].name} +${p.upgrades[item]} · 공격 ${s.attack} / 내구 ${s.hp}${item===p.equipped?' · 장착 중':''}`,()=>{P.equip(p,item);checkpoint(this.hubCheckpoint());this.open(id)});b.classList.toggle('selected',item===p.equipped);const img=document.createElement('img');img.src=`assets/sprites/ttakji/${item}/ttakji_${item}_inventory.png`;img.alt='';b.prepend(img)}
   paragraph(P.items[p.equipped].description);if(p.guardUnlocked)paragraph('배운 기술 · 집중 / 뿌리 버티기');
  }else if(id==='press'){
   const price=P.cost(p);const img=document.createElement('img');img.className='press-preview';img.src=`assets/sprites/ttakji/${p.equipped}/ttakji_${p.equipped}_base.png`;img.alt=P.items[p.equipped].name;content.append(img);
   paragraph(`${P.items[p.equipped].name} +${p.upgrades[p.equipped]} · ${P.forms[P.formOf(p)].name}`);
   paragraph(price===null?`공격 ${stats.attack} · 내구 ${stats.hp} · 최대 강화`:`공격 ${stats.attack} → ${stats.attack+3} · 내구 ${stats.hp} → ${stats.hp+10}`);
   button(price===null?'최대 강화 완료':`압축하기 · ${price}원${p.coins<price?' · 잔액 부족':''}`,()=>{if(P.upgrade(p)){sound('fold');checkpoint(this.hubCheckpoint());this.open(id);toast('더 납작하고 단단해졌다!')}},price===null||p.coins<price);
   if(['city','province'].includes(G.hub))button('제련소 · 형태 가공',()=>Forge.visit());
  }else if(id==='training'){
   paragraph(`선수 Lv.${P.level(p)+1} · 훈련 ${p.xp}/${P.trainingLimit(p)}`);
   paragraph(p.xp===P.trainingLimit(p)?'현재 훈련 숙련 완료 · 타이밍 연습과 5원 보상은 계속 받을 수 있다.':`다음 성장까지 ${3-p.xp%3}회 · 타격 +2 / 집중 +1`);
   button('타이밍 훈련 · 3번 치기',()=>{checkpoint(this.hubCheckpoint());G.practice=[];transition(()=>battle('training'))});
   button('연습 대결 · 보상 없음',()=>{checkpoint(this.hubCheckpoint());G.opponent=G.hub==='province'?P.provinceOpponents[Math.min(p.provinceRound,2)]:G.hub==='city'?P.cityOpponents[Math.min(p.cityRound,2)]:P.opponents[p.guardUnlocked?2:0];transition(()=>battle('sparring'))});
  }else{
   const list=document.createElement('ol');list.className='bracket';for(let i=0;i<3;i++){const o=P.opponents[i],row=document.createElement('li');row.className=i<p.round?'won':i===p.round?'current':'';row.textContent=`${o.title} · ${o.name}  ${i<p.round?'승리':i===p.round?'대기':'예정'} · ${o.prize}원`;list.append(row)}content.append(list);
   if(p.round===3){paragraph('마을 챔피언 · 머리카락 딱지와 뿌리 버티기 획득');button(p.cityEntered?'시 대회장으로 이동':'시 대회에 도전',()=>City.travel());button('아저씨에게 기술 다시 듣기',()=>this.rewardStory(false))}
   else button(`${P.opponents[p.round].title} 출전`,()=>this.startTournament());
  }
  $('facility-close').onclick=()=>{if(!G.paused)this.close()};const first=content.querySelector('button:not(:disabled)');(first||$('facility-close')).focus({preventScroll:true})
 },
 close(){G.state='explore';panels('explore-ui');updateInteract();$('game').focus({preventScroll:true})},
 startTournament(){
  if(G.profile.round>=3)return;checkpoint(this.hubCheckpoint());G.tournamentRound=G.profile.round;G.opponent=P.opponents[G.tournamentRound];
  const lines=[[['앞집 아저씨','평소엔 양보하지만, 대회에선 안 봐준다!'],['앞집 아저씨','집중은 F. 쓸 차례를 잘 골라봐.']],[['유치원 친구','나 기억나? 오늘은 안 질 거야.'],['유치원 친구','짝수 턴에는 딱지를 눌러서 버틸 거야. 그땐 네 공격이 절반만 들어와!']],[['탈모 아저씨','머리숱은 잃었어도 승부 감각은 안 잃었다.'],['탈모 아저씨','세 번째 턴마다 강하게 친다. 그 전에 뒤집어 보든가!']]];
  say(lines[G.tournamentRound],()=>transition(()=>battle('tournament')))
 },
 configureBattle(mode){
  const s=P.stats(G.profile);G.hp=G.maxHp=s.hp;G.opponent=mode==='training'?P.opponents[0]:G.opponent;G.enemyHp=G.enemyMax=G.opponent.hp;G.guardAvailable=G.profile.guardUnlocked;G.guarding=false;G.powerAvailable=G.profile.powerUnlocked;G.powered=false;G.focusAvailable=true;this.hud();
  document.querySelector('.health-card.player small').textContent=`${P.items[G.profile.equipped].name}${P.formOf(G.profile)==='balanced'?'':' · '+P.forms[P.formOf(G.profile)].name}`;
  $('enemy-name').replaceChildren(document.createTextNode(mode==='training'?'연습 상대':G.opponent.name));const small=document.createElement('small');small.textContent=P.items[G.opponent.material].name;$('enemy-name').append(small)
 },
 ready(){
  $('guard').hidden=!G.profile.guardUnlocked;$('guard').disabled=!G.guardAvailable||G.guarding;
  $('power').hidden=!G.profile.powerUnlocked;$('power').disabled=!G.powerAvailable;$('power-count').textContent=G.powered?'준비':G.powerAvailable?'1 / 1':'0 / 1';
  if(G.mode==='training')$('turn-label').textContent=`훈련 ${G.practice.length+1} / 3`;
  else {const intent=P.intent(G.opponent.kind,G.round);if(intent.defending)coach(intent.pierce?'방어한다! PERFECT만 뚫을 수 있어!':'이번엔 방어! 들어오는 피해 절반!',0);else if(intent.perfect)coach('다음 반격은 PERFECT다!',0);else if(intent.weak)coach('이번 반격은 힘을 뺀다! BAD 타격!',0)}
 },
 guard(){if(G.state!=='ready'||!this.isBattle()||!G.guardAvailable||G.guarding)return;G.guardAvailable=false;G.guarding=true;sound('fold');$('guard').disabled=true;toast('다음 상대 공격 피해 50% 감소')},
 power(){if(G.state!=='ready'||!this.isBattle()||!G.powerAvailable)return;G.powerAvailable=false;G.powered=true;sound('click');ready();toast('승부수 · GOOD 이상 1.5배 / BAD 절반')},
 playerDamage(grade){
  const intent=P.intent(G.opponent.kind,G.round),defending=G.mode!=='training'&&intent.defending&&!(intent.pierce&&grade==='PERFECT');
  const damage=P.damage(R.damage(grade),P.stats(G.profile).attack*P.wager(grade,G.powered),defending);G.powered=false;return damage
 },
 enemyGrade(){const intent=P.intent(G.opponent.kind,G.round);if(intent.perfect)return 'PERFECT';if(intent.weak)return 'BAD';const n=Math.random();return n<.25?'BAD':n<.8?'GOOD':'PERFECT'},
 enemyDamage(grade){const damage=P.damage(R.damage(grade),G.opponent.attack,G.guarding);G.guarding=false;return damage},
 trainingComplete(){const before=P.level(G.profile);P.train(G.profile,G.practice);checkpoint(this.hubCheckpoint());this.hud();result('손에 감이 붙었다.',P.level(G.profile)>before?'타격 +2 · 집중 +1':'세 번 더, 조금 더 정확하게.',this.hubLabel(),()=>transition(()=>this.returnHub()),[{value:'+5원',label:'훈련 보상'},{value:`Lv.${P.level(G.profile)+1}`,label:'선수'}])},
 finish(win){
  if(G.mode==='province_tournament'){Province.finish(win);return}
  if(G.mode==='city_tournament'){City.finish(win);return}
  G.animation=null;if(G.mode==='sparring'){result(win?'연습도 실전처럼.':'한 번 더 연습하자.','상금 없는 연습 대결',this.hubLabel(),()=>transition(()=>this.returnHub()));return}
  if(!win){checkpoint(this.hubCheckpoint());result('다시 도전하면 돼.','이전 승리와 상금은 그대로다.',this.hubLabel(),()=>transition(()=>this.returnHub()),[{value:G.stats.damage,label:'가한 피해'}]);return}
  const round=G.tournamentRound;if(!P.award(G.profile,round))return;checkpoint(round===2?'village_reward':'village');this.hud();
  result(round===2?'마을을 뒤집었다!':'다음 상대, 나와!',`${G.opponent.name}에게 승리했다.`,round===2?'아저씨에게 다가가기':'마을로 돌아가기',()=>round===2?this.rewardStory(true):transition(()=>this.enter()),[{value:`+${P.opponents[round].prize}원`,label:'상금'},{value:round===2?'머리카락 딱지':`${round+1} / 3`,label:round===2?'우승 보상':'대회 승리'}])
 },
 rewardStory(first=true){G.hub='village';G.scene='village';G.mode='village';this.hud();G.hero={x:695,y:393,walk:0,facing:1};say([['탈모 아저씨','내가 졌다. 너라도 다음 대회에서 잘해라.'],['탈모 아저씨','이건 내 머리카락으로 보강한 딱지다. 소중하게 써라.'],['나','…그래서 머리가.'],['탈모 아저씨','그 얘기는 하지 말고. R을 누르면 뿌리 버티기다.'],['탈모 아저씨','한 경기에 한 번, 다음에 맞는 피해를 절반으로 줄여. 네 공격은 그대로 할 수 있고.'],['나','고마워요. 다음엔 시 대회다!']],()=>{checkpoint(this.hubCheckpoint());if(first)transition(()=>this.enter());else this.open('cup')})}
};
$('guard').onclick=()=>Village.guard();
$('power').onclick=()=>Village.power();
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||G.paused||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;
 if(e.code==='KeyC'&&G.state==='ready'){e.preventDefault();Village.power()}
 if(e.code==='KeyR'&&G.state==='ready'){e.preventDefault();Village.guard()}
 if(G.state!=='facility')return;
 if(e.code==='KeyE'){e.preventDefault();Village.close();return}
 if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.code)){
  e.preventDefault();const buttons=[...$('facility').querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement),step=['ArrowDown','ArrowRight'].includes(e.code)?1:-1;buttons[(i+step+buttons.length)%buttons.length].focus({preventScroll:true})
 }
});
