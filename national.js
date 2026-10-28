'use strict';
const National={
 places:[{id:'bus',name:'도 대회행 버스',x:145},{id:'training',name:'대표 훈련장',x:365},{id:'press',name:'대표 공방',x:585},{id:'cup',name:'전국 대회 접수',x:805}],
 eligible(){return G.profile.provinceEntered&&G.profile.provinceRound===3},
 travel(){
  if(!this.eligible())return;
  if(!G.profile.nationalEntered){P.enterNational(G.profile);checkpoint('national_intro');transition(()=>this.intro())}
  else transition(()=>this.enter())
 },
 setup(){cancelScene();G.hub='national';G.scene='national';G.mode='national';G.stolen=false;G.flipPlayer=G.flipEnemy=0;G.hero={x:145,y:393,walk:0,facing:1};Village.hud()},
 intro(){
  if(!this.eligible()){Province.enter();return}
  P.enterNational(G.profile);this.setup();checkpoint('national_intro');
  say([['아빠','신문지 접던 손이 전국 대회까지 왔네.'],['나','아빠도 보러 왔어?'],['아빠','그럼. 끝까지 보고 갈 거야.'],['대회 코치','여기선 상대가 힘을 쓴 뒤 빈틈을 드러내. 그 턴엔 피해가 1.5배 들어간다.'],['대회 코치','말풍선을 보고 승부수를 걸어. 빈틈이 보여도 강한 반격은 조심하고.'],['접수원','공방은 +16까지, 훈련은 60회까지. 준비되면 8강 접수대로 오세요.']],()=>this.enter())
 },
 enter(){
  if(!this.eligible()||!G.profile.nationalEntered){Province.enter();return}
  this.setup();G.state='explore';panels('explore-ui');checkpoint('national');if(Journeys.resume())return;this.updateInteract();$('game').focus({preventScroll:true})
 },
 nearest:City.nearest,
 updateInteract:City.updateInteract,
 interact:City.interact,
 close:City.close,
 open(id){
  if(id==='stories'){Journeys.open();return}
  if(id==='forge'){Forge.open();return}
  if(['training','press'].includes(id)){Village.open(id);return}
  G.state='facility';G.facility=id;G.keys.clear();panels('facility');Village.hud();
  const p=G.profile,content=$('facility-content');content.replaceChildren();$('facility-title').textContent=this.places.find(x=>x.id===id).name;$('facility-wallet').textContent=`${p.coins}원`;
  const paragraph=text=>{const node=document.createElement('p');node.textContent=text;content.append(node)};
  const button=(text,action)=>{const b=document.createElement('button');b.className='facility-choice';b.textContent=text;b.onclick=()=>{if(!G.paused&&G.state==='facility')action()};content.append(b)};
  if(id==='bus'){
   paragraph('다녀와도 이긴 경기와 상금은 그대로.');button('도 대회장으로 돌아가기',()=>transition(()=>Province.enter()))
  }else{
   const list=document.createElement('ol');list.className='bracket';
   P.nationalOpponents.forEach((opponent,i)=>{const row=document.createElement('li');row.className=i<p.nationalRound?'won':i===p.nationalRound?'current':'';row.textContent=`${opponent.title} · ${opponent.name}  ${i<p.nationalRound?'승리':i===p.nationalRound?'대기':'예정'} · ${opponent.prize}원`;list.append(row)});content.append(list);
   if(p.nationalRound===3){
    paragraph('전국 챔피언 · 대륙 대회 출전권 획득');
    button('우승 이야기 다시 보기',()=>this.rewardStory(false));
    button('전 챔피언과 연습 대결 · 보상 없음',()=>{checkpoint('national');G.opponent=P.nationalOpponents[2];transition(()=>battle('sparring'))})
   }else button(`${P.nationalOpponents[p.nationalRound].title}${J.canCompete(p,'national')?' 출전':' · 이야기 먼저'}`,()=>this.startTournament())
  }
  if(id==='cup')Journeys.link(content);
  $('facility-close').onclick=()=>{if(!G.paused)this.close()};(content.querySelector('button')||$('facility-close')).focus({preventScroll:true})
 },
 startTournament(){
  if(!this.eligible()||!G.profile.nationalEntered||G.profile.nationalRound>=3)return;
  if(Journeys.gate('national'))return;
  G.tournamentRound=G.profile.nationalRound;G.opponent=P.nationalOpponents[G.tournamentRound];checkpoint('national');
  const lines=[
   [['한방 승부사','홀수 턴엔 방어하면서 BAD로 가볍게 친다. 힘을 모으는 거지.'],['한방 승부사','짝수 턴엔 PERFECT! 대신 내 딱지도 빈틈이 생겨 피해를 1.5배 받아.'],['나','공격할 기회와 버틸 때가 겹치는구나.']],
   [['종이 수비수','두 턴은 방어, 세 번째는 쉬어. 정타도 내 방어 앞에선 절반이야.'],['종이 수비수','쉬는 턴엔 BAD로 치고, 빈틈 때문에 피해도 1.5배 받지.'],['나','세 번째 턴에 승부수를 모아보자.']],
   [['전국 챔피언','방어, 보통 타격, PERFECT, 그리고 빈틈. 네 턴마다 반복한다.'],['전국 챔피언','빈틈에선 1.5배로 맞고 BAD로 반격해. 네가 그때까지 버틸 수 있을까?'],['나','처음엔 무서웠는데, 지금은 한번 해보고 싶어.']]
  ];say(lines[G.tournamentRound],()=>transition(()=>battle('national_tournament')))
 },
 finish(win){
  G.animation=null;
  if(!win){checkpoint('national');result('다음엔 읽어낼 수 있어.','이긴 경기와 상금은 그대로다.','전국 대회장으로',()=>transition(()=>this.enter()),[{value:G.stats.damage,label:'가한 피해'}]);return}
  const round=G.tournamentRound;if(!P.awardNational(G.profile,round))return;
  checkpoint(round===2?'national_reward':'national');Village.hud();
  result(round===2?'전국을 뒤집었다!':'다음 승부로.',`${G.opponent.name}에게 승리했다.`,round===2?'시상대로':'전국 대회장으로',()=>round===2?this.rewardStory():transition(()=>this.enter()),[{value:`+${P.nationalOpponents[round].prize}원`,label:'상금'},{value:round===2?'대륙 대회 출전권':`${round+1} / 3`,label:round===2?'획득':'승리'}])
 },
 rewardStory(first=true){
  if(!this.eligible()||G.profile.nationalRound!==3){this.enter();return}
  this.setup();G.hero.x=680;if(first)checkpoint('national_reward');
  say([['전국 챔피언','졌어. 이제 네가 우리나라 대표야.'],['나','내가… 전국에서 이겼다고?'],['아빠','응. 네 손으로 접고, 연습하고, 이긴 거야.'],['탈모 아저씨','내 머리카락도 전국구가 됐구나.'],['접수원','전국 대회 우승! 대륙 대회 출전권을 드립니다.'],['나','그날 뒤집힌 내 인생, 아직 한참 남았네.']],()=>{checkpoint('national');if(first)this.enter();else this.open('cup')})
 }
};
