'use strict';
const Province={
 places:[{id:'bus',name:'시내행 버스',x:145},{id:'training',name:'도 훈련장',x:365},{id:'press',name:'선수 공방',x:585},{id:'cup',name:'도 대회 접수',x:805}],
 eligible(){return G.profile.cityEntered&&G.profile.cityRound===3},
 travel(){
  if(!this.eligible())return;
  if(!G.profile.provinceEntered){P.enterProvince(G.profile);checkpoint('province_intro');transition(()=>this.intro())}
  else transition(()=>this.enter())
 },
 setup(){cancelScene();G.hub='province';G.scene='province';G.mode='province';G.stolen=false;G.flipPlayer=G.flipEnemy=0;G.hero={x:145,y:393,walk:0,facing:1};Village.hud()},
 intro(){
  if(!this.eligible()){City.enter();return}
  P.enterProvince(G.profile);this.setup();checkpoint('province_intro');
  say([['대장','여기부터는 각 시에서 우승한 애들이 모여.'],['나','학교에선 한 판도 못 이겼는데… 멀리 왔네.'],['대장','강하게 치는 것만으론 안 돼. 상대가 언제 힘을 주는지 봐.'],['접수원','선수 공방에서는 +12까지, 훈련은 45회까지 가능합니다. 접수는 오른쪽입니다.']],()=>this.enter())
 },
 enter(){
  if(!this.eligible()||!G.profile.provinceEntered){City.enter();return}
  this.setup();G.state='explore';panels('explore-ui');checkpoint('province');if(Journeys.resume())return;this.updateInteract();$('game').focus({preventScroll:true})
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
   paragraph('다녀와도 이긴 경기와 상금은 그대로.');button('시 대회장으로 돌아가기',()=>transition(()=>City.enter()))
  }else{
   const list=document.createElement('ol');list.className='bracket';
   P.provinceOpponents.forEach((opponent,i)=>{const row=document.createElement('li');row.className=i<p.provinceRound?'won':i===p.provinceRound?'current':'';row.textContent=`${opponent.title} · ${opponent.name}  ${i<p.provinceRound?'승리':i===p.provinceRound?'대기':'예정'} · ${opponent.prize}원`;list.append(row)});content.append(list);
   if(p.provinceRound===3){
    paragraph('도 대회 챔피언 · 전국 대회 출전권 획득');
    button(p.nationalEntered?'전국 대회장으로 이동':'전국 대회에 도전',()=>National.travel());
    button('우승 이야기 다시 보기',()=>this.rewardStory(false));
    button('전 챔피언과 연습 대결 · 보상 없음',()=>{checkpoint('province');G.opponent=P.provinceOpponents[2];transition(()=>battle('sparring'))})
   }else button(`${P.provinceOpponents[p.provinceRound].title}${J.canCompete(p,'province')?' 출전':' · 이야기 먼저'}`,()=>this.startTournament())
  }
  if(id==='cup')Journeys.link(content);
  $('facility-close').onclick=()=>{if(!G.paused)this.close()};(content.querySelector('button')||$('facility-close')).focus({preventScroll:true})
 },
 startTournament(){
  if(!this.eligible()||!G.profile.provinceEntered||G.profile.provinceRound>=3)return;
  if(Journeys.gate('province'))return;
  G.tournamentRound=G.profile.provinceRound;G.opponent=P.provinceOpponents[G.tournamentRound];checkpoint('province');
  const lines=[
   [['철벽 선배','난 매 턴 방어한다. 어설픈 타격은 절반만 들어와.'],['철벽 선배','PERFECT면 뚫리겠지만, 매번 맞출 수 있겠어?'],['나','집중해서… 틈을 뚫자.']],
   [['엇박자 선수','홀수 턴엔 정타! 짝수 턴엔 힘을 빼고 BAD로 친다.'],['엇박자 선수','계속 세게만 치면 손이 아프거든.'],['나','강한 반격에 맞춰 버티기를 쓰면 되겠네.']],
   [['도 챔피언','첫 턴엔 방어, 둘째 턴엔 PERFECT, 셋째 턴엔 BAD. 이 순서로 반복이다.'],['도 챔피언','내 방어는 정타도 절반으로 막아. 승부수는 언제 걸 거지?'],['나','학교에서부터 배운 걸 전부 써볼게.']]
  ];say(lines[G.tournamentRound],()=>transition(()=>battle('province_tournament')))
 },
 finish(win){
  G.animation=null;
  if(!win){checkpoint('province');result('다음엔 읽어낼 수 있어.','이긴 경기와 상금은 그대로다.','도 대회장으로',()=>transition(()=>this.enter()),[{value:G.stats.damage,label:'가한 피해'}]);return}
  const round=G.tournamentRound;if(!P.awardProvince(G.profile,round))return;
  checkpoint(round===2?'province_reward':'province');Village.hud();
  result(round===2?'도를 뒤집었다!':'다음 승부로.',`${G.opponent.name}에게 승리했다.`,round===2?'시상대로':'도 대회장으로',()=>round===2?this.rewardStory():transition(()=>this.enter()),[{value:`+${P.provinceOpponents[round].prize}원`,label:'상금'},{value:round===2?'전국 대회 출전권':`${round+1} / 3`,label:round===2?'획득':'승리'}])
 },
 rewardStory(first=true){
  if(!this.eligible()||G.profile.provinceRound!==3){this.enter();return}
  this.setup();G.hero.x=680;if(first)checkpoint('province_reward');
  say([['도 챔피언','힘도 타이밍도… 내 수까지 읽었구나.'],['나','처음엔 학교에서 딱지 한 장 뺏긴 게 전부였는데.'],['대장','이젠 전국에서 네 이름을 듣겠네.'],['접수원','도 대회 우승! 전국 대회 출전권을 드립니다.'],['나','아빠한테 먼저 전화해야겠다. 이번엔 내가 뒤집었다고.']],()=>{checkpoint('province');if(first)this.enter();else this.open('cup')})
 }
};
