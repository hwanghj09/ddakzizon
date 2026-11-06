'use strict';
/* A self-contained short story reusing the campaign's maps, rendering and clock.
   Its save key and provisional combat rules never change legacy campaign saves. */
const Minimum={
 key:'ddakzizon.minimum.v1',active:false,progress:null,saved:null,
 init(){
  try{this.saved=MinimumRules.restore(JSON.parse(localStorage.getItem(this.key)))}catch{/* Private mode or an invalid save: start normally. */}
  $('minimum-new').onclick=()=>this.start();$('minimum-load').onclick=()=>this.start(true);
  $('skip-dialogue').onclick=()=>{if(!this.active||G.paused||G.state!=='dialogue')return;G.state='transition';G.dialogDone()};
  // Exploration owns the shared world coordinates. Select this story's behavior
  // only while it is active; campaign functions remain available unchanged.
  for(const name of ['data','objects','phase','enter','save','objective','updateInteract','interact','map']){
   const campaign=Exploration[name];
   Exploration[name]=(...args)=>this.active?(name==='data'?this.zoneData(...args):this[name](...args)):campaign.apply(Exploration,args);
  }
  this.title();
 },
 title(){
  this.active=false;document.body.classList.remove('minimum-mode');
  $('minimum-load').hidden=!this.saved;$('minimum-help').hidden=true;
  $('timing-guide').hidden=true;
  $('gauge').setAttribute('aria-label','밝은 중앙 구간에서 멈추면 PERFECT');
 },
 start(resume=false){
  cancelScene();initAudio();sound('click');this.active=true;document.body.classList.add('minimum-mode');
  this.progress=resume&&this.saved?structuredClone(this.saved):MinimumRules.fresh();
  G.profile=P.fresh();G.fold=MinimumRules.atLeast(this.progress,'crafted')?4:0;
  G.profile.upgrades.newspaper=G.fold===4?1:0;
  G.flipPlayer=G.flipEnemy=0;G.stolen=false;G.practice=[];
  if(this.progress.opening!=='done'){this.opening();return}
  if(this.progress.stage==='lost'&&this.progress.homeLesson==='pending')this.enter('home',420);
  else this.enter(this.progress.zone,this.progress.x);
 },
 opening(){
  G.mapZone=null;G.scene='classroom';G.mode='minimum';this.hud();this.save();
  if(this.progress.opening==='choice'){this.openingChoice();return}
  classroomOpening(()=>this.openingChoice());
 },
 openingChoice(){
  this.progress.opening='choice';this.save();
  classroomChoice(()=>{
   this.progress.opening='done';this.progress.zone='yard';this.progress.x=760;this.save();
   transition(()=>this.enter('yard',760));
  });
 },
 zoneData(){const z=Exploration.zones[this.progress.zone];return this.progress.zone==='yard'?{...z,name:'운동장 정자',theme:'gazebo'}:z},
 phase(){return this.progress.stage==='school'?'school':MinimumRules.atLeast(this.progress,'won')?'campaign':MinimumRules.atLeast(this.progress,'practiced')?'rematch':'lost'},
 objects(){
  const objects=Exploration.zones[this.progress.zone].objects
   .filter(([id])=>id!=='doyun'||!MinimumRules.atLeast(this.progress,'won'))
   .map(([id,name,x,type])=>({id,name:id==='press'?'딱지 압축기 · 준비 중':id==='shop'?'종이 잡화점 · 준비 중':name,x,type}));
  if(this.progress.zone==='home')objects.push({id:'father',name:'아빠',x:560,type:'npc'});
  return objects;
 },
 enter(zone,x){
  if(!Object.hasOwn(MinimumRules.zones,zone))zone='yard';
  cancelScene();G.mapZone=zone;G.hub='village';G.scene='village';G.mode='minimum';G.state='explore';
  this.progress.opening='done';
  G.stolen=false;G.flipPlayer=G.flipEnemy=0;
  G.hero={x:Math.max(45,Math.min(MinimumRules.zones[zone]-45,x??180)),y:440,walk:0,facing:1};
  const view=window.World?.viewWidth?.()||960;
  G.camera=Math.max(0,Math.min(MinimumRules.zones[zone]-view,G.hero.x-view/2));
  this.progress.zone=zone;this.progress.x=G.hero.x;this.progress.visited[zone]=true;
  G.profile.map.zone=zone;G.profile.map.x=G.hero.x;
  panels('explore-ui');this.hud();this.save();this.updateInteract();toast(this.zoneData().name,'location');$('game').focus({preventScroll:true});
  if(zone==='home'&&this.progress.stage==='lost'&&this.progress.homeLesson==='pending')this.fatherLesson();
 },
 save(){
  if(!this.active)return;
  if(Exploration.active()){
   this.progress.zone=G.mapZone;this.progress.x=Math.round(G.hero.x);
   G.profile.map.zone=G.mapZone;G.profile.map.x=this.progress.x;
  }
  this.saved=structuredClone(this.progress);
  try{localStorage.setItem(this.key,JSON.stringify(this.saved));G.storageOK=true}catch{G.storageOK=false;toast('자동 저장을 사용할 수 없어요. 현재 플레이는 계속할 수 있어요.')}
 },
 complete(stage){if(MinimumRules.advance(this.progress,stage)){this.save();this.hud();return true}return false},
 hud(){setInventory(MinimumRules.owned(this.progress)?`신문지 딱지${MinimumRules.atLeast(this.progress,'crafted')?' +1':''} · 장착 중`:'빈 주머니',MinimumRules.owned(this.progress))},
 objective(){if(this.progress.opening!=='done')return ['yard',this.progress.opening==='choice'?'궁금한 마음에 친구들을 따라가자':'옆자리 친구들의 이야기를 들어 보자'];return {
  school:['yard','정자에 있는 민수에게 말을 걸자'],lost:['home','아빠에게 딱지 강화 방법을 배우자'],
  crafted:['home','집 연습 표적으로 타이밍을 연습하자'],practiced:['yard','민수에게 재대결을 신청하자'],
  won:['schoolfront','학교 앞 대회 포스터를 읽자'],poster:['lobby','주민센터 접수원에게 참가 신청하자'],
  registered:['lobby','접수 완료! 대진표를 확인하자']
 }[this.progress.stage]},
 updateInteract(){
  const o=Exploration.nearest(),[dest,goal]=this.objective();
  coach(o?`${o.name} · ${o.type==='door'?'들어가기':o.type==='npc'?'대화':'조사'} [E]`:'');
  $('map-location').textContent=this.zoneData().name;$('map-objective').textContent=goal;
  $('map-direction').textContent=this.progress.guidance?dest!==G.mapZone?Exploration.direction(dest):this.localDirection():'';
 },
 localDirection(){
  const id={school:'minsu',lost:'table',crafted:'target',practiced:'minsu',won:'poster',poster:'reception',registered:'bracket'}[this.progress.stage];
  const o=this.objects().find(o=>o.id===id);return o?`${o.x<G.hero.x?'←':'→'} ${o.name}${Math.abs(o.x-G.hero.x)<=100?' · E / 상호작용':''}`:'';
 },
 talk(lines,done=()=>this.back()){
  say(typeof lines==='string'?[['나',lines]]:lines,done);
 },
 back(){G.state='explore';panels('explore-ui');this.hud();this.updateInteract();$('game').focus({preventScroll:true})},
 menuPanel(title,lines,choices=[]){
  Exploration.menu(title,lines,choices);$('facility-wallet').textContent='짧은 체험판';
  $('facility-close').onclick=()=>{if(!G.paused)this.back()};
  ($('facility-content').querySelector('button:not(:disabled)')||$('facility-close')).focus({preventScroll:true});
 },
 interact(){
  if(G.paused||G.state!=='explore')return;
  const o=Exploration.nearest();if(!o)return;G.keys.clear();G.target=null;sound('click');
  const id=o.id,stage=this.progress.stage;
  if(o.type==='door'){
   const links={home:['alley',300],alley:['home',1100],lobby:['center',700],schoolfront:['yard',170],yard:['schoolfront',850]};
   if(id==='lobby'&&!MinimumRules.atLeast(this.progress,'poster')){this.talk([['접수 안내','학교 재대결에서 이긴 뒤, 학교 앞 포스터를 확인해 주세요.']]);return}
   const to=id==='lobby'?['lobby',160]:links[G.mapZone];if(to)Exploration.move(...to);return;
  }
  if(id==='minsu'){
   if(stage==='school')this.talk([
    ['민수','한 판 해 볼래? 서로 딱지 한 장씩 걸고, 뒤집히면 끝이야. 끝까지 버텨 보자!'],
    ['민수','공격 버튼이나 스페이스로 딱지를 들고, 게이지가 가운데에 왔을 때 다시 눌러. 가운데일수록 더 강해!'],
    ['민수','내구도가 낮을수록 잘 뒤집혀. 내구도가 남아 있어도 딱지가 뒤집히면 끝이야!']
   ],()=>transition(()=>this.battle('intro_battle')));
   else if(stage==='practiced')this.talk([['나','내가 직접 접고 연습했어. 다시 한 판 하자.'],['민수','좋아. 이번엔 진짜 승부다. 뒤집히는 쪽이 지는 거야!']],()=>transition(()=>this.battle('rematch')));
   else this.talk([['민수',MinimumRules.atLeast(this.progress,'won')?'도윤이는 이사 갔어. 학교 앞 포스터를 봐. 더 큰 무대가 기다릴 거야.':'집에서 새 딱지를 접고 표적에 연습해 봐. 준비되면 다시 붙자.']]);
   return;
  }
  if(id==='table'){
   if(stage==='lost'){if(this.progress.homeLesson!=='heard')this.fatherLesson();else this.workbench()}
   else this.talk(stage==='school'?'민수와 먼저 한 판 해 보자.':'아빠에게 배운 대로 보강지를 넣고 눌렀다. 강화 +1! 이제 표적에서 연습해 보자.');
   return;
  }
  if(id==='father'){
   if(stage==='lost'){if(this.progress.homeLesson!=='heard')this.fatherLesson();else this.workbench()}
   else this.talk([['아빠','잘 접는 것도, 손에 익히는 것도 실력이야. 표적에서 한 번 더 연습해 볼까?']]);
   return;
  }
  if(id==='target'){
   if(!MinimumRules.atLeast(this.progress,'crafted'))this.talk('먼저 식탁에서 새 신문지 딱지를 접자.');
   else this.talk([['아빠','공격으로 딱지를 들고, 게이지를 눌러 내려쳐 봐. 빗나가도 괜찮아. 한 번 해 보면 학교로 갈 수 있어.']],()=>transition(()=>this.battle('practice')));
   return;
  }
  if(id==='poster'){
   if(!MinimumRules.atLeast(this.progress,'won'))this.talk([['대회 포스터','마을 주민센터 컵 · 참가비 무료. 먼저 민수와의 재대결에서 이겨 자신감을 되찾자.']]);
   else{this.complete('poster');this.menuPanel('마을 대회 포스터',['주민센터 컵 · 참가비 무료','주민센터 안 접수원에게 참가를 신청하자.'],[['지도 보기',()=>pause('map')]])}
   return;
  }
  if(['reception','bracket'].includes(id)){
   if(stage==='registered'){this.bracket();return}
   if(stage!=='poster'){this.talk([['접수원','학교 앞 포스터를 확인하고 오면 참가 안내를 해 줄게.']]);return}
   this.talk([['접수원','주민센터 컵에 온 걸 환영해! 참가비는 무료야.'],['접수원','신문지 딱지 한 장이면 충분해. 참가 신청할래?']],()=>this.menuPanel('대회 참가 신청',['신문지 딱지 · 참가비 무료','접수하면 대진표를 확인할 수 있다.'],[
    ['참가 신청 확인',()=>{if(this.complete('registered'))sound('win');this.bracket()}],['아직 준비할게요',()=>this.back()]
   ]));return;
  }
  if(id==='bag'){pause('inventory');return}
  const notices={shop:'종이 잡화점 · 준비 중. 이번 여정은 집에 있는 신문 한 장이면 충분하다.',press:'압축기 · 준비 중. 강화는 다음 단계에서 연결한다.',forge:'제련소 · 공사 중.',training:'훈련장 · 준비 중. 우리 집 표적에서 무료로 연습하자.',fusion:'융합기 · 공사 중.',bus:'이후 지역은 다음 단계에서 열린다.',notice:'학교 재대결 승리 → 학교 앞 포스터 → 주민센터 접수. 참가비 무료.',bench:MinimumRules.atLeast(this.progress,'won')?'도윤이가 앉던 자리가 비었다. 더 큰 무대에서 다시 만나자.':'도윤이는 늘 이 벤치에서 경기를 지켜본다.',doyun:'민수와 한 판 해 봐. 난 여기서 보고 있을게.',neighbor:'집은 골목 안에 있어. 다시 접으면 다시 시작할 수 있지.',hana:'학교 앞 포스터에 마을 대회 소식이 있대.',uncle:'대회에 나가려고? 접수원은 주민센터 안에 있어.',board:'주민센터 컵 · 학교 앞 포스터에서 자세한 접수 안내를 확인하자.',photo:'아빠도 이 사진에서는 딱지를 들고 있다.',bed:'이번에는 꼭 뒤집고 말 거야.',spectator:'신문 한 장으로 시작하는 거지. 응원할게!'};
  this.talk([[o.type==='npc'?o.name:'나',notices[id]||'평범한 마을 풍경. 오늘도 딱지 이야기가 한창이다.']]);
 },
 bracket(){
  this.menuPanel('접수 완료 · 마을 주민센터 컵',['체험판 끝! 패배에서 다시 일어나 대회 접수까지 마쳤다.','대회 경기와 그 뒤의 모험은 타이틀의 ‘처음부터 시작’(전체 이야기)에서 즐길 수 있다.']);
  const list=document.createElement('ol');list.className='bracket';list.id='minimum-bracket';
  for(const [round,match] of MinimumRules.config.bracket){const li=document.createElement('li');li.textContent=`${round} · ${match}`;list.append(li)}
  $('facility-content').append(list);
 },
 battle(mode){
  cancelScene();this.save();G.scene='battle';G.mode=mode;G.state='ready';G.round=1;G.practice=[];
  G.hp=G.maxHp=MinimumRules.playerTile(this.progress).hp;G.enemyHp=G.enemyMax=MinimumRules.config.tile.hp;
  G.stats={perfect:0,damage:0,turns:0};G.flipPlayer=G.flipEnemy=0;G.stolen=false;
  G.focusAvailable=G.guardAvailable=G.powerAvailable=G.focused=false;
  // The campaign's skill buttons (정밀 타격·강타·꾹 눌러 펴기) do not exist in this short story.
  document.querySelectorAll('#actions .skill').forEach(b=>{b.hidden=true});$('player-name').textContent='나';
  document.querySelector('.health-card.player small').textContent='신문지 딱지';
  $('enemy-name').replaceChildren(document.createTextNode(mode==='practice'?'연습 표적':'민수'));
  const small=document.createElement('small');small.textContent='신문지 딱지';$('enemy-name').append(small);
  panels('battle-hud','combat-controls');this.hud();if(mode==='intro_battle')openingRally(()=>this.ready());else this.ready();
 },
 health(){
  $('player-hp').textContent=`${G.hp} / ${G.maxHp}`;$('enemy-hp').textContent=G.mode==='practice'?'연습용':`${G.enemyHp} / ${G.enemyMax}`;
  $('player-bar').style.width=`${100*G.hp/G.maxHp}%`;$('enemy-bar').style.width=`${100*G.enemyHp/G.enemyMax}%`;
  $('round-label').textContent=G.mode==='practice'?'타이밍 연습':G.mode==='intro_battle'?'마지막 한 수':`${G.round}라운드`;
 },
 ready(){
  G.state='ready';G.animation=null;$('actions').hidden=false;$('timing').hidden=true;$('attack').disabled=false;
  $('turn-label').textContent=G.mode==='practice'?'표적을 향해 한 번 쳐보자':'나의 차례';
  coach('');this.health();
 },
 startGauge(){
  if(G.state!=='ready'||G.paused)return;initAudio();sound('click');G.state='timing';
  G.gaugeStart=G.now;G.gaugeDuration=MinimumRules.config.timing.duration;
  $('actions').hidden=true;$('timing').hidden=false;$('needle').style.left='0%';
  $('turn-label').textContent='가운데에서 멈추자';$('timing-guide').hidden=false;
  $('timing-guide').textContent=`왕복 ${G.gaugeDuration/1000}초 · 완벽 ×1.3 · 좋음 ×1.1 · 보통 ×1 · 약한 타격 ×0.6`;
  $('gauge').setAttribute('aria-label','가운데부터 완벽, 좋음, 보통, 약한 타격. 공격 버튼이나 스페이스로 정지.');
 },
 strike(){
  if(G.state!=='timing'||G.paused)return;
  const grade=MinimumRules.judge(R.positionAt(G.now-G.gaugeStart,G.gaugeDuration));
  G.state='resolving';G.stats.turns++;if(grade==='PERFECT')G.stats.perfect++;
  $('timing').hidden=true;G.animation={kind:'player-hit',at:G.now,grade};sound('whoosh');
  after(360,()=>{
   const hit=MinimumRules.hit(G.enemyHp,grade,Math.random(),MinimumRules.playerTile(this.progress));
   if(G.mode==='intro_battle'){hit.hp=1;hit.damage=Math.max(0,G.enemyHp-1);hit.flipped=false}
   G.stats.damage+=hit.damage;
   sound('hit',grade==='MISS'?'BAD':grade);if(grade==='PERFECT')sound('perfect');
   impact(MinimumRules.config.labels[grade]+'!',grade==='MISS'?'BAD':grade);burst(650,342,grade);floatDamage(650,305,`−${hit.damage}`);
   if(G.mode==='practice'){
    G.practice=[grade];this.complete('practiced');
    after(950,()=>{
     G.animation=null;result('연습 완료',`${MinimumRules.config.labels[grade]} · 피해 ${hit.damage}. 약하게 쳐도 연습은 완료된다. 다시 해 보거나 학교로 가자.`, '연습 끝내기',()=>this.enter('home',720));
     this.secondary('다시 연습하기',()=>transition(()=>this.battle('practice')));
    });return;
   }
   G.enemyHp=hit.hp;this.health();
   after(950,()=>{
    if(G.mode==='intro_battle'){nearMiss(()=>this.enemyTurn())}
    else if(hit.flipped){G.flipEnemy=G.now;impact('뒤집기!','PERFECT');sound('flip');sound('win');after(900,()=>this.finish(true))}
    else this.enemyTurn();
   });
  });
 },
 enemyTurn(){
  G.state='enemy';G.animation={kind:'enemy-ready',at:G.now};$('turn-label').textContent='민수의 차례';
  after(650,()=>{
   G.animation={kind:'enemy-hit',at:G.now};sound('whoosh');
   after(360,()=>{
    const cfg=MinimumRules.config;
    const scripted=G.mode==='intro_battle',hit=MinimumRules.hit(G.hp,cfg.enemy.grade,Math.random(),cfg.tile,cfg.enemy.strength,MinimumRules.playerTile(this.progress));
    G.hp=scripted?1:hit.hp;sound('hit');burst(310,342,'GOOD');floatDamage(310,305,scripted?'한 끗 차이…':`−${hit.damage}`);this.health();
    if(scripted||hit.flipped){G.flipPlayer=G.now;impact(scripted?'아… 조금만 더!':'뒤집혔다!','BAD');sound('flip');sound('lose');after(1000,()=>this.finish(false))}
    else{impact('좋음!');after(950,()=>{G.round++;this.ready()})}
   });
  });
 },
 secondary(label,action){
  const b=$('result-secondary');b.hidden=false;b.textContent=label;
  b.onclick=()=>{if(!G.paused&&G.state==='result'){G.state='transition';action()}};
 },
 finish(win){
  G.animation=null;
  if(G.mode==='intro_battle'){
   this.complete('lost');G.stolen=true;G.stolenAt=G.now;this.hud();
   this.progress.zone='home';this.progress.x=420;this.progress.homeLesson='pending';this.save();
   transition(()=>this.enter('home',420),700);return;
  }
  if(win){
   this.complete('won');
   result('이번엔 내가 뒤집었다!',G.enemyHp>0?'내구도가 남았지만 민수의 딱지를 뒤집었다! 뒤집히면 승부는 끝이다.':'직접 접고 연습한 딱지로 민수에게 이겼다.','민수와 이야기하기',()=>this.talk([
    ['민수','네가 이겼어. 정말 많이 연습했구나.'],['나','이제 도윤이랑 붙을 거야.'],['민수','도윤이는 이사 갔어. 학교 앞 대회 포스터를 봐. 더 큰 무대에서 다시 만날 수 있을 거야.']
   ],()=>this.enter('yard',950)),[{value:G.stats.turns,label:'공격 횟수'},{value:G.stats.perfect,label:'완벽'}]);
  }else{
   this.save();result('아직 끝난 게 아니야.',G.hp>0?'내구도가 남아 있어도 딱지가 뒤집히면 진다. 바로 다시 도전하거나 집에서 더 연습해 보자.':'이번에는 민수가 이겼다. 바로 다시 도전하거나 집에서 더 연습할 수 있다.','즉시 재도전',()=>transition(()=>this.battle('rematch')));
   this.secondary('집에서 연습하기',()=>this.enter('home',720));
  }
 },
 fatherLesson(){
  this.talk([
   ['아빠','왔니? 오늘은 딱지 소리가 안 들리네. 무슨 일 있었어?'],
   ['나','거의 이겼는데… 민수 딱지가 딱 한 번만 더 넘어갔으면 됐는데.'],
   ['아빠','그만큼 잘 싸웠다는 거네. 네가 못해서 진 건 아닐 거야.'],
   ['나','마지막에 내 딱지가 먼저 뒤집혔어. 다음엔 꼭 이기고 싶어.'],
   ['아빠','그럼 이번엔 더 단단하게 만들어 보자. 이게 딱지 강화야.'],
   ['아빠','신문을 여러 겹 접고, 틈에 보강지를 한 장 넣은 다음 납작하게 꾹 눌러.'],
   ['아빠','그러면 공격력은 20에서 23, 내구도는 100에서 110이 돼. 같은 타이밍에도 더 세게 버티고 칠 수 있지.'],
   ['아빠','첫 재료는 아빠가 준비할게. 같이 접고 강화해 볼까?']
  ],()=>{this.progress.homeLesson='heard';this.save();this.workbench()});
 },
 workbench(){
  this.menuPanel('아빠와 함께 · 첫 딱지 강화',['신문 여러 겹 + 보강지 한 장 → 납작하게 압축','공격력 20 → 23 · 내구도 100 → 110','첫 강화 재료는 아빠가 준비했다. 비용 없음.'],[['신문지 딱지 접고 강화하기',()=>{
   if(!this.complete('crafted'))return;G.profile.upgrades.newspaper=1;G.fold=4;G.foldAt=G.now;sound('fold');this.hud();
   result('다시, 더 단단한 한 장.','아빠: 잘했어. 강화 +1! 이번엔 손에도 익혀 보자. 오른쪽 표적에서 연습해 봐.','표적에 연습하러 가기',()=>this.enter('home',420));
  }]]);
 },
 map(body){
  body.append(GameMenu.el('p','',this.objective()[1]));
  const row=GameMenu.el('div','map-route');
  for(const id of ['home','alley','square','center','schoolfront','yard']){
   const tile=GameMenu.el('div',`map-node${id===this.progress.zone?' current':''}`,`${id===this.progress.zone?'● ':''}${Exploration.zones[id].name}`);
   tile.append(GameMenu.el('small','',this.progress.visited[id]?'방문함':'아직 가보지 않은 곳'));row.append(tile);
  }
  body.append(row,GameMenu.el('p','','집 ↔ 골목 ↔ 광장 ↔ 주민센터 앞 ↔ 학교 앞 ↔ 운동장'),GameMenu.el('p','','주민센터 문 안쪽 → 접수 로비'));
 },
 menu(view){
  if(!['overview','inventory','map','settings','controls'].includes(view))view='overview';
  const m=GameMenu;m.view=view;$('menu-message').textContent='';
  $('menu-view-title').textContent={overview:'현재 여정',inventory:'인벤토리',map:'동네 지도',settings:'설정',controls:'조작 안내'}[view];
  document.querySelectorAll('[data-menu]').forEach(b=>{const selected=b.dataset.menu===view;b.classList.toggle('active',selected);if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  const body=$('menu-body');body.replaceChildren();
  if(view==='map')this.map(body);
  else if(view==='inventory'){
   if(MinimumRules.owned(this.progress)){
    const stats=MinimumRules.playerTile(this.progress),upgraded=MinimumRules.atLeast(this.progress,'crafted');
    const card=m.el('div','equipped-summary');card.append(m.icon('newspaper'),m.el('h4','',`신문지 딱지${upgraded?' +1':''} · 장착 중`));body.append(card);
    body.append(m.el('p','',`공격 ${stats.attack} · 내구도 ${stats.hp} · 방어 8 · 안정성 10`),m.el('p','',upgraded?'아빠와 보강지를 넣고 납작하게 압축한 딱지. 강화 +1.':'신문 한 장을 겹쳐 접은 딱지.'));
   }else body.append(m.el('h4','','가방이 비었다.'),m.el('p','','집 식탁에서 새 신문지 딱지를 접자.'));
  }else if(view==='settings'){
   const button=m.button(`게임 소리 · ${G.sound?'켜짐':'꺼짐'}`,()=>{toggleSound();this.menu('settings')});button.id='menu-sound';button.setAttribute('aria-pressed',String(G.sound));
   body.append(button,m.button(`목적지 안내 · ${this.progress.guidance?'켜짐':'꺼짐'}`,()=>{this.progress.guidance=!this.progress.guidance;this.save();this.menu('settings')}));
  }else if(view==='controls'){
   body.append(m.el('p','','이동: ← → 또는 A / D'),m.el('p','','대화·조사: E · 화면 버튼은 마우스로 선택'),m.el('p','','공격·게이지 정지: 스페이스 또는 공격 버튼'),m.el('p','','대화: 다음 / 스페이스 · 건너뛰기 버튼'),m.el('p','','인벤토리 I · 지도 M · 메뉴 Esc'),m.el('p','','완벽 1.3배 · 좋음 1.1배 · 보통 1배 · 약한 타격 0.6배. 스킬은 아직 배우지 않았다.'));
  }else{
   body.append(m.el('h4','',this.objective()[1]),m.el('p','','한 끗 차이의 첫 패배 → 집에서 아빠에게 첫 강화 배우기 → 연습과 재대결 → 마을 대회 접수.'),m.el('p','save-note',G.storageOK?'주요 사건과 멈춘 위치가 자동 저장된다.':'저장 공간에 접근할 수 없다. 현재 플레이는 계속할 수 있다.'));
   if(!G.storageOK)body.append(m.button('자동 저장 다시 시도',()=>{this.save();this.menu('overview')}));
  }
  document.querySelector(`[data-menu="${view}"]`)?.focus({preventScroll:true});
 },
 sync(){
  const exploring=this.active&&G.state==='explore';
  $('minimum-help').hidden=!exploring||G.paused;
  $('minimum-help').textContent='← → / A D 이동 · E 대화 · M 지도';
 }
};
window.Minimum=Minimum;
Minimum.init();
