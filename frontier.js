'use strict';
// Continent, world and planet tournaments share one hub flow. Each tier opens after the previous title.
function makeTier(c){return{
 id:c.id,name:c.name,places:c.places,
 opponents(){return P.tiers[c.id].opponents},
 eligible(){const prev=P.tiers[c.id].after;return !!G.profile[`${prev}Entered`]&&G.profile[`${prev}Round`]===3},
 entered(){return G.profile[`${c.id}Entered`]},
 round(){return G.profile[`${c.id}Round`]},
 travel(){
  if(!this.eligible())return;
  if(!this.entered()){P.enterTier(G.profile,c.id);checkpoint(`${c.id}_intro`);transition(()=>this.intro())}
  else transition(()=>this.enter())
 },
 setup(){cancelScene();G.hub=c.id;G.scene=c.id;G.mode=c.id;G.stolen=false;G.flipPlayer=G.flipEnemy=0;G.hero={x:145,y:393,walk:0,facing:1};Village.hud()},
 intro(){
  if(!this.eligible()){c.previous().enter();return}
  P.enterTier(G.profile,c.id);this.setup();checkpoint(`${c.id}_intro`);say(c.intro,()=>this.enter())
 },
 enter(){
  if(!this.eligible()||!this.entered()){c.previous().enter();return}
  this.setup();G.state='explore';panels('explore-ui');checkpoint(c.id);if(Journeys.resume())return;this.updateInteract();$('game').focus({preventScroll:true})
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
  const p=G.profile,round=this.round(),content=$('facility-content');content.replaceChildren();$('facility-title').textContent=this.places.find(x=>x.id===id).name;$('facility-wallet').textContent=`${p.coins}원`;
  const paragraph=text=>{const node=document.createElement('p');node.textContent=text;content.append(node)};
  const button=(text,action)=>{const b=document.createElement('button');b.className='facility-choice';b.textContent=text;b.onclick=()=>{if(!G.paused&&G.state==='facility')action()};content.append(b)};
  if(id==='bus'){
   paragraph('다녀와도 이긴 경기와 상금은 그대로.');button(c.backLabel,()=>transition(()=>c.previous().enter()));
   if(round===3&&c.next)button(c.nextLabel,()=>c.next().travel())
  }else{
   const list=document.createElement('ol');list.className='bracket';
   this.opponents().forEach((opponent,i)=>{const row=document.createElement('li');row.className=i<round?'won':i===round?'current':'';row.textContent=`${opponent.title} · ${opponent.name}  ${i<round?'승리':i===round?'대기':'예정'} · ${opponent.prize}원`;list.append(row)});content.append(list);
   if(round===3){
    paragraph(c.champion);
    if(c.next)button(c.next().entered()?c.nextLabel:c.challengeLabel,()=>c.next().travel());
    button('우승 이야기 다시 보기',()=>this.rewardStory(false));
    button('전 챔피언과 연습 대결 · 보상 없음',()=>{checkpoint(c.id);G.opponent=this.opponents()[2];transition(()=>battle('sparring'))})
   }else button(`${this.opponents()[round].title}${J.canCompete(p,c.id)?' 출전':' · 이야기 먼저'}`,()=>this.startTournament())
  }
  if(id==='cup')Journeys.link(content);
  $('facility-close').onclick=()=>{if(!G.paused)this.close()};(content.querySelector('button')||$('facility-close')).focus({preventScroll:true})
 },
 startTournament(){
  if(!this.eligible()||!this.entered()||this.round()>=3)return;
  if(Journeys.gate(c.id))return;
  G.tournamentRound=this.round();G.opponent=this.opponents()[G.tournamentRound];checkpoint(c.id);
  say(c.lines[G.tournamentRound],()=>transition(()=>battle(`${c.id}_tournament`)))
 },
 finish(win){
  G.animation=null;
  if(!win){checkpoint(c.id);result('다음엔 읽어낼 수 있어.','이긴 경기와 상금은 그대로다.',`${c.name}장으로`,()=>transition(()=>this.enter()),[{value:G.stats.damage,label:'가한 피해'}]);return}
  const round=G.tournamentRound;if(!P.awardTier(G.profile,c.id,round))return;
  checkpoint(round===2?`${c.id}_reward`:c.id);Village.hud();
  result(round===2?c.winTitle:'다음 승부로.',`${G.opponent.name}에게 승리했다.`,round===2?'시상대로':`${c.name}장으로`,()=>round===2?this.rewardStory():transition(()=>this.enter()),[{value:`+${this.opponents()[round].prize}원`,label:'상금'},{value:round===2?c.ticket:`${round+1} / 3`,label:round===2?'획득':'승리'}])
 },
 rewardStory(first=true){
  if(!this.eligible()||this.round()!==3){this.enter();return}
  this.setup();G.hero.x=680;if(first)checkpoint(`${c.id}_reward`);
  say(c.reward,()=>{checkpoint(c.id);if(first)this.enter();else this.open('cup')})
 }
}}
const Continent=makeTier({id:'continent',name:'대륙 대회',
 places:[{id:'bus',name:'전국 대회행 기차',x:145},{id:'training',name:'대륙 훈련장',x:365},{id:'press',name:'대륙 공방',x:585},{id:'cup',name:'대륙 대회 접수',x:805}],
 previous:()=>National,next:()=>World,backLabel:'전국 대회장으로 돌아가기',nextLabel:'세계 대회장으로 이동',challengeLabel:'세계 대회에 도전',
 champion:'대륙 챔피언 · 세계 대회 출전권 획득',winTitle:'대륙을 뒤집었다!',ticket:'세계 대회 출전권',
 intro:[['통역사','대륙 딱지 선수권에 오신 걸 환영합니다!'],['나','말도 안 통하는데 딱지가 통할까?'],['아빠','딱 소리는 어디서나 똑같아.'],['대회 코치','여기부턴 오래 맞은 딱지는 힘이 빠져. 내구도가 줄수록 공격도 약해지지.'],['대회 코치','내구도 30% 아래면 한 방에 뒤집힐 수도 있어. 상대도 마찬가지니까 몰아붙일 땐 PERFECT를 노려.'],['공방 주인','공방에 융합기가 들어왔어. 딱지 세 장을 하나로 녹일 수 있지.']],
 lines:[
  [['사막 돌풍','홀수 턴엔 모래바람처럼 PERFECT로 몰아친다.'],['사막 돌풍','대신 그 턴엔 빈틈이 생겨 피해를 1.5배 받지. 짝수 턴엔 숨을 고르고.'],['나','맞으면서 같이 쳐야 하는구나.']],
  [['빙판 장인','두 턴은 미끄러지듯 막는다. 하지만 PERFECT는 얼음도 깬다.'],['빙판 장인','세 번째 턴엔 얼음이 갈라져서 빈틈이 생겨.'],['나','정타로 깨거나, 세 번째를 기다리거나.']],
  [['대륙 챔피언','방어, 보통, PERFECT, 단단한 방어, 빈틈. 다섯 턴이 한 바퀴다.'],['대륙 챔피언','네 번째 방어는 PERFECT만 뚫을 수 있다. 기억해 둬.'],['나','다섯 박자. 연습장에서 수천 번 친 리듬이야.']]
 ],
 reward:[['대륙 챔피언','대륙을 넘다니… 다음은 세계다.'],['나','세계…'],['대장','그러니까 말했잖아.'],['나','시 대회 결승 때 그 말, 진심이었어?'],['대장','당연하지. 다시 물을게. 너 한번 세계를 뒤집어보지 않을래?'],['접수원','대륙 우승! 세계 대회 출전권을 드립니다.']]
});
const World=makeTier({id:'world',name:'세계 대회',
 places:[{id:'bus',name:'대륙행 비행기',x:145},{id:'training',name:'세계 훈련장',x:365},{id:'press',name:'세계 공방',x:585},{id:'cup',name:'세계 대회 접수',x:805}],
 previous:()=>Continent,next:()=>Planet,backLabel:'대륙 대회장으로 돌아가기',nextLabel:'행성 대회장으로 이동',challengeLabel:'행성 대회에 도전',
 champion:'세계 챔피언 · 행성 대회 초대장 획득',winTitle:'세계를 뒤집었다!',ticket:'행성 대회 초대장',
 intro:[['대장','왔구나. 여기가 세계 딱지 선수권이야.'],['나','관중이 운동장 백 개는 되겠다.'],['대장','난 예선에서 떨어졌어. 그러니까 네가 가.'],['대장','그날 운동장에서 못 끝낸 승부는, 네가 세계를 뒤집으면 끝난 걸로 칠게.'],['접수원','공방은 +24까지, 훈련은 90회까지. 8강 접수는 오른쪽입니다.']],
 lines:[
  [['무대 위 쇼맨','첫 턴은 인사하며 막고, 두 번째는 PERFECT 쇼타임!'],['무대 위 쇼맨','세 번째 턴엔 박수 받느라 빈틈이 생기지.'],['나','쇼가 끝나는 순간을 노리자.']],
  [['종이 건축가','홀수 턴엔 설계대로 방어해. PERFECT만 뚫을 수 있지.'],['종이 건축가','짝수 턴엔 정확하게 PERFECT로 쌓아 올린다.'],['나','버티는 턴과 뚫는 턴을 나눠야겠어.']],
  [['세계 챔피언','융합 딱지를 쓰는 건 너만이 아니야.'],['세계 챔피언','방어, PERFECT, PERFECT, 빈틈. 내 방어는 PERFECT만 통한다.'],['대장','야! 지면 내가 다시 도전한다!'],['나','안 져. 이번엔 내가 뒤집을 차례야.']]
 ],
 reward:[['세계 챔피언','…세계가 뒤집혔군.'],['대장','봤지? 내 말이 맞았어.'],['나','그날 뒤집힌 건 내 딱지가 아니라 인생이었어.'],['아빠','그리고 오늘은 세계가 뒤집혔고.'],['수상한 방송','삐— 지구 대표 선수에게 알린다. 행성 대회 초대장을 보낸다.'],['나','…행성?']]
});
const Planet=makeTier({id:'planet',name:'행성 대회',
 places:[{id:'bus',name:'지구행 우주선',x:145},{id:'training',name:'무중력 훈련장',x:365},{id:'press',name:'우주 공방',x:585},{id:'cup',name:'행성 대회 접수',x:805}],
 previous:()=>World,next:null,backLabel:'세계 대회장으로 돌아가기',
 champion:'행성 챔피언 · 다음 무대 ???? (준비 중)',winTitle:'행성을 뒤집었다!',ticket:'???? 초대장',
 intro:[['우주 접수원','은하 딱지 연맹 행성 대회에 온 걸 환영한다, 지구인.'],['나','진짜 우주에 왔어…'],['대장','중력이 약해서 딱지가 붕 뜨네. 뒤집기 좋은 날씨다.'],['우주 접수원','공방은 +28, 훈련은 105회까지 허용한다. 준비되면 접수대로.']],
 lines:[
  [['화성 대표','화성 중력에선 홀수 턴에 힘이 빠져. 그땐 방어만 하지.'],['화성 대표','네 턴마다 한 번은 PERFECT, 또 한 번은 빈틈이다.'],['나','지구 딱지 맛을 보여줄게.']],
  [['달 기지 선수','난 거의 매 턴 PERFECT로 친다.'],['달 기지 선수','세 번째 턴마다 산소를 채우느라 빈틈이 생기지만.'],['나','두 턴 버티고, 세 번째에 승부수다.']],
  [['행성 챔피언','여섯 박자. 단단한 방어, PERFECT, 보통, 방어, PERFECT, 빈틈.'],['행성 챔피언','이 리듬을 끝까지 버틴 지구인은 없었다.'],['나','운동장에서 처음 졌을 때도, 다들 그렇게 말했어.']]
 ],
 reward:[['행성 챔피언','지구인… 아니, 우주 최강의 뒤집기다.'],['대장','이제 더 뒤집을 데가 남았나?'],['아빠','딱지 한 장으로 여기까지 왔구나.'],['???','축하한다. 다음 무대는… ????'],['나','????라니. 상관없어. 접고, 치고, 뒤집으면 되니까.']]
});
const Tiers={continent:Continent,world:World,planet:Planet};
