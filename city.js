'use strict';
/* 시 대회 (spec 05 §6, 04 §6): school gym hub. Matches run through the common Tournament flow. */
const City={
 places:[{id:'bus',name:'마을행 버스',x:145},{id:'training',name:'시 훈련장',x:365},{id:'press',name:'딱지 공방',x:585},{id:'cup',name:'시 대회 접수',x:805}],
 travel(){
  if(G.profile.round!==3)return;
  if(!G.profile.cityEntered){P.enterCity(G.profile);checkpoint('city_intro');transition(()=>this.intro())}
  else transition(()=>this.enter())
 },
 setup(){cancelScene();G.mapZone='city';G.camera=0;G.hub='city';G.scene='city';G.mode='city';G.stolen=false;G.flipPlayer=G.flipEnemy=0;G.hero={x:145,y:393,walk:0,facing:1};Village.hud()},
 intro(){
  if(G.profile.round!==3){Village.enter();return}
  P.enterCity(G.profile);this.setup();checkpoint('city_intro');
  story('city_intro',()=>this.enter())
 },
 enter(){
  if(!G.profile.cityEntered||G.profile.round!==3){Village.enter();return}
  Exploration.enter('city',G.profile.map.zone==='city'?G.profile.map.x:140);if(Journeys.resume())return;this.updateInteract();$('game').focus({preventScroll:true})
 },
 nearest(){return this.places.find(p=>Math.hypot(G.hero.x-p.x,G.hero.y-365)<88)},
 updateInteract(){const place=this.nearest();coach(place?`${place.name} · E`:'다음 경기는 접수대에서!')},
 interact(){const place=this.nearest();if(!place)return;G.keys.clear();this.open(place.id)},
 close(){G.state='explore';panels('explore-ui');this.updateInteract();$('game').focus({preventScroll:true})},
 open(id){
  if(id==='stories'){Journeys.open();return}
  if(id==='forge'){Forge.open();return}
  if(['training','press'].includes(id)){Village.open(id);return}
  if(id==='cup'){Tournament.open('city');return}
  G.state='facility';G.facility=id;G.keys.clear();panels('facility');Village.hud();
  const p=G.profile,content=$('facility-content');content.replaceChildren();$('facility-title').textContent=this.places.find(x=>x.id===id).name;$('facility-wallet').textContent=`${p.coins}원`;
  const paragraph=text=>{const node=document.createElement('p');node.textContent=text;content.append(node)};
  const button=(text,action)=>{const b=document.createElement('button');b.className='facility-choice';b.textContent=text;b.onclick=()=>{if(!G.paused&&G.state==='facility')action()};content.append(b)};
  paragraph('집과 마을 압축기에 다녀와도 대회 기록은 남는다.');button('마을로 돌아가기',()=>transition(()=>Village.enter()));
  $('facility-close').onclick=()=>{if(!G.paused)this.close()};(content.querySelector('button')||$('facility-close')).focus({preventScroll:true})
 },
 // Back-compat entry: start the next city match (the reunion still plays first if it has not happened).
 startTournament(){
  const p=G.profile;if(p.round!==3||!p.cityEntered||p.cityRound>=3)return;
  if(!p.story.reunion){this.reunionStory(()=>Tournament.start('city',p.cityRound,false));return}
  Tournament.start('city',p.cityRound,false)
 },
 // Doyun returns the original newspaper ttakji. The keepsake is granted before the scene, so skipping keeps it.
 reunionStory(done){
  const p=G.profile;if(!p.cityEntered){Village.enter();return}
  const fresh=P.reunion(p);this.setup();G.hero.x=700;checkpoint('city_reunion');
  story('city_reunion',()=>{checkpoint('city');if(fresh)after(300,()=>toast('첫 신문지 딱지를 돌려받았다! 가방에서 장착할 수 있다.'));if(done)done();else this.enter()})
 },
 skillStory(first=true){
  this.setup();G.hero.x=650;if(first)checkpoint('city_skill');
  story('city_skill',()=>{checkpoint('city');if(first){this.enter();Tournament.open('city')}else Tournament.open('city')})
 },
 rewardStory(first=true){
  this.setup();G.hero.x=680;if(first)checkpoint('city_reward');
  story('city_award',()=>{checkpoint('city');if(first)this.enter();else{this.enter();Tournament.open('city')}})
 }
};
