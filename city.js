'use strict';
const City={
 places:[{id:'bus',name:'마을행 버스',x:145},{id:'training',name:'시 훈련장',x:365},{id:'press',name:'딱지 공방',x:585},{id:'cup',name:'시 대회 접수',x:805}],
 travel(){
  if(G.profile.round!==3)return;
  if(!G.profile.cityEntered){P.enterCity(G.profile);checkpoint('city_intro');transition(()=>this.intro())}
  else transition(()=>this.enter())
 },
 setup(){cancelScene();G.hub='city';G.scene='city';G.mode='city';G.stolen=false;G.flipPlayer=G.flipEnemy=0;G.hero={x:145,y:393,walk:0,facing:1};Village.hud()},
 intro(){
  if(G.profile.round!==3){Village.enter();return}
  P.enterCity(G.profile);this.setup();checkpoint('city_intro');
  say([['접수원','마을 우승자구나. 시 대회에 온 걸 환영해!'],['접수원','접수는 맨 오른쪽. 경기 사이에는 마을에 다녀와도 돼.'],['접수원','이곳 공방에선 딱지를 여덟 번까지 압축해 줘. 제련소에선 공격형이나 수비형으로 가공할 수도 있어.'],['나','운동장보다 훨씬 크네… 그래도 뒤집으면 되는 거잖아.']],()=>this.enter())
 },
 enter(){
  if(!G.profile.cityEntered||G.profile.round!==3){Village.enter();return}
  this.setup();G.state='explore';panels('explore-ui');checkpoint('city');if(Journeys.resume())return;this.updateInteract();$('game').focus({preventScroll:true})
 },
 nearest(){return this.places.find(p=>Math.hypot(G.hero.x-p.x,G.hero.y-365)<88)},
 updateInteract(){const place=this.nearest();coach(place?`${place.name} · E`:'다음 경기는 접수대에서!')},
 interact(){const place=this.nearest();if(!place)return;G.keys.clear();this.open(place.id)},
 close(){G.state='explore';panels('explore-ui');this.updateInteract();$('game').focus({preventScroll:true})},
 open(id){
  if(id==='stories'){Journeys.open();return}
  if(id==='forge'){Forge.open();return}
  if(['training','press'].includes(id)){Village.open(id);return}
  G.state='facility';G.facility=id;G.keys.clear();panels('facility');Village.hud();
  const p=G.profile,content=$('facility-content');content.replaceChildren();$('facility-title').textContent=this.places.find(x=>x.id===id).name;$('facility-wallet').textContent=`${p.coins}원`;
  const paragraph=text=>{const node=document.createElement('p');node.textContent=text;content.append(node)};
  const button=(text,action)=>{const b=document.createElement('button');b.className='facility-choice';b.textContent=text;b.onclick=()=>{if(!G.paused&&G.state==='facility')action()};content.append(b)};
  if(id==='bus'){
   paragraph('집과 마을 압축기에 다녀와도 대회 기록은 남는다.');button('마을로 돌아가기',()=>transition(()=>Village.enter()))
  }else{
   const list=document.createElement('ol');list.className='bracket';
   P.cityOpponents.forEach((opponent,i)=>{const row=document.createElement('li');row.className=i<p.cityRound?'won':i===p.cityRound?'current':'';row.textContent=`${opponent.title} · ${opponent.name}  ${i<p.cityRound?'승리':i===p.cityRound?'대기':'예정'} · ${opponent.prize}원`;list.append(row)});content.append(list);
   if(p.cityRound===3){paragraph('시 대회 챔피언 · 도 대회 출전권 획득');button(p.provinceEntered?'도 대회장으로 이동':'도 대회에 도전',()=>Province.travel());button('대장과 다시 이야기하기',()=>this.rewardStory(false));button('대장과 연습 대결 · 보상 없음',()=>{checkpoint('city');G.opponent=P.cityOpponents[2];transition(()=>battle('sparring'))})}
   else button(`${P.cityOpponents[p.cityRound].title}${J.canCompete(p,'city')?' 출전':' · 이야기 먼저'}`,()=>this.startTournament());
   if(p.powerUnlocked)button('코치에게 승부수 다시 듣기',()=>this.skillStory(false))
  }
  if(id==='cup')Journeys.link(content);
  $('facility-close').onclick=()=>{if(!G.paused)this.close()};(content.querySelector('button')||$('facility-close')).focus({preventScroll:true})
 },
 startTournament(){
  if(G.profile.round!==3||!G.profile.cityEntered||G.profile.cityRound>=3)return;
  if(Journeys.gate('city'))return;
  G.tournamentRound=G.profile.cityRound;G.opponent=P.cityOpponents[G.tournamentRound];checkpoint('city');
  const dialogue=[
   [['박자왕','두 번째, 네 번째… 짝수 턴엔 무조건 정타다!'],['박자왕','버틸 타이밍을 잘 골라봐.'],['나','아저씨한테 배운 기술을 써볼까.']],
   [['접기 장인','홀수 턴엔 접힌 면을 눌러서 방어한다.'],['접기 장인','평범한 타격은 절반만 들어와. PERFECT라면 내 방어도 뚫겠지만.'],['나','집중하고… 승부수를 걸어볼까.']],
   [['나','너… 그때 우리 학교 대장?'],['대장','네가 여기까지 왔다고? 딱지 돌려달라고 울던 애가?'],['나','이번엔 정식으로 붙자.'],['대장','좋아. 방어, 공격, 강타. 세 턴마다 반복한다.'],['대장','내 수를 읽어도 이길 수 있을지는 두고 보자.']]
  ];say(dialogue[G.tournamentRound],()=>transition(()=>battle('city_tournament')))
 },
 finish(win){
  G.animation=null;
  if(!win){checkpoint('city');result('아직 끝나지 않았다.','이긴 경기와 상금은 그대로다.','시 대회장으로',()=>transition(()=>this.enter()),[{value:G.stats.damage,label:'가한 피해'}]);return}
  const round=G.tournamentRound;if(!P.awardCity(G.profile,round))return;
  checkpoint(round===2?'city_reward':round===0?'city_skill':'city');Village.hud();
  result(round===2?'시를 뒤집었다!':'한 단계 더 올라갔다.',`${G.opponent.name}에게 승리했다.`,round===2?'대장에게 다가가기':round===0?'코치에게 다가가기':'시 대회장으로',()=>round===2?this.rewardStory():round===0?this.skillStory():transition(()=>this.enter()),[{value:`+${P.cityOpponents[round].prize}원`,label:'상금'},{value:round===2?'도 대회 출전권':round===0?'승부수':`${round+1} / 3`,label:round===1?'승리':'획득'}])
 },
 skillStory(first=true){
  this.setup();G.hero.x=650;if(first)checkpoint('city_skill');
  say([['대회 코치','한 방을 더 세게 치는 법, 배워볼래?'],['대회 코치','C를 누르면 다음 공격에 승부수를 걸어. 한 경기에 한 번이다.'],['대회 코치','GOOD나 PERFECT면 피해가 1.5배. BAD면 오히려 절반이야.'],['대회 코치','F로 집중한 다음 써도 돼. 네 타이밍을 믿을 때 걸어.']],()=>{checkpoint('city');if(first)this.enter();else this.open('cup')})
 },
 rewardStory(first=true){
  this.setup();G.hero.x=680;if(first)checkpoint('city_reward');
  say([['대장','…내가 졌네. 이제 진짜 잘 치는구나.'],['나','그때 못 끝낸 승부, 이제 끝났다.'],['대장','너 한번 세계를 뒤집어보지 않을래'],['나','세계? 일단 도 대회부터 뒤집고.'],['접수원','축하합니다! 시 대회 우승 상금과 도 대회 출전권을 받으세요.']],()=>{checkpoint('city');if(first)this.enter();else this.open('cup')})
 }
};
