'use strict';
/* 도 → 행성 대회 (spec 05 §7-11, 04 §7-11). Each stage is a walkable venue zone (exploration.js) whose 접수 desk opens the
   common Tournament flow; this file only adds travel, the venue intro and the title story. */
function makeStage(c){return{
 id:c.id,name:c.name,places:c.places,
 t(){return P.tournament(c.id)},
 eligible(){return this.t().open(G.profile)},
 entered(){return this.t().entered(G.profile)},
 round(){return G.profile[this.t().field]},
 opponents(){return this.t().opponents},
 travel(){
  if(!this.eligible())return;
  if(!this.entered()){this.t().enter(G.profile);checkpoint(`${c.id}_intro`);transition(()=>this.intro())}
  else transition(()=>this.enter())
 },
 setup(){cancelScene();G.mapZone=c.id;G.camera=0;G.hub=c.id;G.scene=c.id;G.mode=c.id;G.stolen=false;G.flipPlayer=G.flipEnemy=0;G.hero={x:145,y:440,walk:0,facing:1};Village.hud()},
 intro(){
  if(!this.eligible()){c.previous().enter();return}
  this.t().enter(G.profile);this.setup();checkpoint(`${c.id}_intro`);
  story(`${c.id}_intro`,()=>this.enter())
 },
 enter(){
  if(!this.eligible()||!this.entered()){c.previous().enter();return}
  Exploration.enter(c.id,G.profile.map.zone===c.id?G.profile.map.x:140);Journeys.resume()
 },
 close(){Village.close()},
 open(id){
  if(id==='stories'){Journeys.open();return}
  if(id==='forge'){Forge.open();return}
  if(id==='cup'){Tournament.open(c.id);return}
  if(id==='bus'){Tournament.select();return}
  Village.open(id)
 },
 // A one-off scene told at the venue (꾹 눌러 펴기 lesson); the checkpoint makes a reload replay it, never skip it.
 scene(id,checkpointId,first,done){this.setup();G.hero.x=650;if(first)checkpoint(checkpointId);story(id,()=>{checkpoint(c.id);this.enter();Tournament.open(c.id);if(done)done()})},
 // Title story. Rewards were granted on the result screen, so replays only tell the story.
 rewardStory(first=true){
  if(!P.tournamentWon(G.profile,c.id)){this.enter();return}
  this.setup();G.hero.x=680;if(first)checkpoint(`${c.id}_reward`);
  story(`${c.id}_award`,()=>{checkpoint(c.id);if(first&&c.after?.()) return;this.enter();if(!first)Tournament.open(c.id);else if(c.toast)after(300,()=>toast(c.toast))})
 }
}}
const Province=makeStage({id:'province',name:'도 대회',previous:()=>City,toast:'제련소가 문을 열었다! 광장과 공방에서 형태를 가공할 수 있다.',
 places:[{id:'bus',name:'시외 정류장'},{id:'training',name:'선수 대기실'},{id:'press',name:'압축 공방'},{id:'cup',name:'대회 접수'}]});
// 꾹 눌러 펴기 is taught by 상자왕 after the first province win (granted with the result, explained here).
Province.skillStory=(first=true)=>Province.scene('province_skill','province_skill',first);
const National=makeStage({id:'national',name:'전국 대회',previous:()=>Province,toast:'융합기가 열렸다! 광장 융합기에서 세 딱지를 하나로 녹일 수 있다.',
 places:[{id:'bus',name:'시외 정류장'},{id:'training',name:'선수 대기실'},{id:'press',name:'장비 준비실'},{id:'cup',name:'선수 접수'}]});
const Continent=makeStage({id:'continent',name:'대륙 대회',previous:()=>National,
 places:[{id:'bus',name:'시외 정류장'},{id:'training',name:'연습 매트'},{id:'press',name:'국제 공방'},{id:'cup',name:'선수 접수'}]});
const World=makeStage({id:'world',name:'세계 대회',previous:()=>Continent,
 places:[{id:'bus',name:'시외 정류장'},{id:'training',name:'선수 대기실'},{id:'press',name:'세계 공방'},{id:'cup',name:'선수 접수'}]});
// The planet title leads straight into the ending the first time (spec 04 §12).
const Planet=makeStage({id:'planet',name:'행성 대회',previous:()=>World,after:()=>{if(G.profile.story.ending)return false;Ending.start();return true},
 places:[{id:'bus',name:'귀환 셔틀'},{id:'training',name:'무중력 훈련장'},{id:'press',name:'우주 공방'},{id:'cup',name:'교류전 접수'}]});
const Stages={province:Province,national:National,continent:Continent,world:World,planet:Planet};
