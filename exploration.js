'use strict';
/* Side-view locations use world coordinates; rendering and interaction share this data. */
const Exploration={
 zones:{
  home:{name:'우리 집',width:1280,theme:'home',objects:[['bed','침대',110,'inspect'],['photo','가족사진',240,'inspect'],['table','식탁 · 딱지 접기',420,'facility'],['target','연습 표적',720,'facility'],['bag','가방',960,'facility'],['door','골목으로',1180,'door']]},
  alley:{name:'주택 골목',width:1800,theme:'alley',right:'square',objects:[['bike','자전거',100,'inspect'],['home','우리 집',300,'door'],['mail','우편함',650,'inspect'],['plant','화분',900,'inspect'],['neighbor','앞집 아저씨',1150,'npc']]},
  square:{name:'중앙 광장',width:2200,theme:'square',left:'alley',right:'center',objects:[['shop','종이 잡화점',320,'facility'],['board','마을 게시판',750,'inspect'],['hana','하나',870,'npc'],['press','딱지 압축기',1150,'facility'],['training','훈련장',1550,'facility'],['forge','제련소',1800,'facility'],['fusion','융합기 공사장',1980,'inspect']]},
  center:{name:'주민센터 앞',width:1800,theme:'center',left:'square',right:'schoolfront',objects:[['notice','접수 안내판',380,'inspect'],['lobby','주민센터',700,'door'],['uncle','박태풍',1030,'npc'],['bus','시외 정류장',1300,'facility']]},
  lobby:{name:'주민센터 로비',width:1280,theme:'lobby',objects:[['exit','주민센터 밖으로',100,'door'],['bracket','대진표',390,'inspect'],['reception','접수원',700,'npc'],['spectator','응원하러 온 이웃',1030,'npc']]},
  schoolfront:{name:'학교 앞',width:1400,theme:'schoolfront',left:'center',objects:[['poster','대회 포스터',400,'inspect'],['gate','운동장',850,'door']]},
  yard:{name:'지존초 운동장',width:1600,theme:'yard',objects:[['gate','학교 밖으로',100,'door'],['bench','벤치',520,'inspect'],['minsu','민수',950,'npc'],['doyun','도윤',1130,'npc']]},
  city:{name:'시 대회 · 학교 체육관',width:1800,theme:'city',objects:[['bus','시외 정류장',140,'facility'],['training','몸풀기 매트',500,'facility'],['press','딱지 공방',850,'facility'],['cup','접수 부스',1200,'facility'],['score','수동 점수판',1530,'inspect']]},
  province:{name:'도 대회 · 압축 경기장',width:2000,theme:'province',objects:[['bus','시외 정류장',140,'facility'],['training','선수 대기실',550,'facility'],['press','압축 공방',980,'facility'],['cup','대회 접수',1400,'facility'],['machine','대형 압축기',1760,'inspect']]},
  national:{name:'전국 선수권 · 실내 체육관',width:2200,theme:'national',objects:[['bus','시외 정류장',140,'facility'],['training','선수 대기실',580,'facility'],['press','장비 준비실',1020,'facility'],['cup','선수 접수',1460,'facility'],['inspection','규격 측정 부스',1770,'inspect'],['broadcast','중계석',2020,'inspect']]}
 },
 active(){return G.mapZone&&G.scene===(['city','province','national'].includes(G.mapZone)?G.mapZone:'village')},
 data(){return this.zones[G.mapZone]},
 phase(){return G.profile.schoolReward?'campaign':G.profile.homePracticeDone?'rematch':G.profile.map.phase},
 objects(){return this.data().objects.filter(o=>!(o[0]==='doyun'&&this.phase()!=='school')&&!(o[0]==='uncle'&&G.profile.round===3)).map(([id,name,x,type])=>({id,name,x,type})).concat(G.mapZone==='square'&&G.profile.round===3?[{id:'uncle',name:'박태풍',x:980,type:'npc'}]:[])},
 nearest(){return this.objects().filter(o=>Math.abs(o.x-G.hero.x)<=100).sort((a,b)=>Math.abs(a.x-G.hero.x)-Math.abs(b.x-G.hero.x)||Number(b.type==='npc')-Number(a.type==='npc'))[0]},
 enter(zone,x){
  if(!this.zones[zone])zone='square';cancelScene();G.mapZone=zone;G.hub=['city','province','national'].includes(zone)?zone:'village';G.scene=G.hub;G.mode=G.hub;G.state='explore';G.stolen=false;G.flipPlayer=G.flipEnemy=0;
  G.hero={x:Math.max(45,Math.min(this.zones[zone].width-45,x??G.profile.map.x??160)),y:440,walk:0,facing:1};G.camera=Math.max(0,Math.min(this.data().width-960,G.hero.x-480));
  G.profile.map.zone=zone;G.profile.map.x=G.hero.x;G.profile.map.visited[zone]=true;panels('explore-ui');Village.hud();if(this.phase()==='lost')setInventory('빈 주머니',false);this.save();this.updateInteract();toast(this.data().name);$('game').focus({preventScroll:true});
 },
 save(){if(this.active()){G.profile.map.zone=G.mapZone;G.profile.map.x=Math.round(G.hero.x)}checkpoint(G.profile.schoolReward?Village.hubCheckpoint():'exploration')},
 move(zone,x){note(220,.09,'triangle',.025);transition(()=>this.enter(zone,x))},
 update(dt){const d=this.data(),dx=(G.keys.has('right')?1:0)-(G.keys.has('left')?1:0);if(dx){G.hero.x=Math.max(25,Math.min(d.width-25,G.hero.x+dx*220*dt/1000));G.hero.facing=dx;G.hero.walk+=dt;if(Math.floor(G.hero.walk/350)!==Math.floor((G.hero.walk-dt)/350))note(95,.035,'triangle',.018)}else G.hero.walk=0;G.hero.y=440;
  const camera=Math.max(0,Math.min(d.width-960,G.hero.x-480));G.camera+=(camera-G.camera)*(1-Math.exp(-dt/110));
  if(G.hero.x<=28&&dx<0&&d.left){this.move(d.left,this.zones[d.left].width-90);return}if(G.hero.x>=d.width-28&&dx>0&&d.right){this.move(d.right,90);return}
  if(!dx&&G.profile.map.x!==Math.round(G.hero.x))this.save();this.updateInteract();
 },
 objective(){const p=G.profile,phase=this.phase();if(phase==='school')return ['yard','민수에게 말을 걸자'];if(phase==='lost')return ['home','집 식탁에서 새 딱지를 접자'];if(phase==='rematch')return ['yard','민수에게 다시 도전하자'];if(!p.map.poster)return ['schoolfront','학교 앞 대회 포스터를 읽자'];const e=J.current(p,G.hub);if(e&&!J.canCompete(p,G.hub))return [G.hub==='village'?'square':G.hub,`${e.title} · 친구들과의 약속`];return [G.hub==='village'?(p.round===3?'center':'lobby'):G.hub,p.nationalRound===3?'새로운 무대를 기다리며':G.hub==='village'&&p.round===3?'정류장에서 시 대회로':'접수원에게 다음 경기를 신청하자']},
 updateInteract(){const o=this.nearest();coach(o?`${o.name} · ${o.type==='npc'?'대화':o.type==='door'?'들어가기':o.type==='inspect'?'조사':'이용'} [E]`:'');const [dest,goal]=this.objective();$('map-location').textContent=this.data().name;$('map-objective').textContent=goal;$('map-hud').hidden=false;$('map-direction').textContent=G.profile.map.guidance&&dest!==G.mapZone?this.direction(dest):''},
 direction(dest){const chain=['home','alley','square','center','schoolfront','yard'];const a=G.mapZone==='lobby'?3:chain.indexOf(G.mapZone),b=dest==='lobby'?3:chain.indexOf(dest);return `${b<a?'←':'→'} ${this.zones[dest].name}`},
 talk(name,line){say([[name,line]],()=>{G.state='explore';panels('explore-ui');this.updateInteract();$('game').focus({preventScroll:true})})},
 interact(){const o=this.nearest();if(!o)return;G.keys.clear();G.target=null;sound('click');const p=G.profile,id=o.id,zone=G.mapZone;
  const links={home:['alley',300],alley:['home',1100],lobby:['center',700],schoolfront:['yard',170],yard:['schoolfront',850]};
  if(o.type==='door'){const to=id==='lobby'?['lobby',160]:links[zone];if(to)this.move(...to);return}
  if(id==='minsu'){
   if(this.phase()==='school'||this.phase()==='rematch'){const rematch=this.phase()==='rematch';say(rematch?[['민수','다시 왔네? 딱지도 훨씬 단단해 보인다.'],['나','이번엔 직접 강화하고 연습했어. 다시 한 판 하자.']]:[['민수','여기까지 왔네! A, D나 좌우 방향키로 걷고, 가까이 오면 E나 스페이스로 말을 걸면 돼.'],['나','나도 한 판 할래!'],['민수','그럼 지면 딱지 주는 거다?']],()=>transition(()=>battle(rematch?'rematch':'intro_battle')));return}
   this.talk('민수',p.round===3?'우리 학교에서 마을 챔피언이 나왔다! 다음에도 응원할게.':this.phase()==='lost'?'…오늘은 그만하고 집에 가는 게 어때?':'도윤이는 이사 갔어. 그래도 난 여기 있으니까, 가끔 놀러 와.');return
  }
  if(id==='doyun'){this.talk('도윤','민수부터 이기고 와. 난 여기서 보고 있을게.');return}
  if(id==='neighbor'){this.talk(o.name,this.phase()==='school'?'이 시간에 어딜 그렇게 뛰어가니?':this.phase()==='lost'?'딱지 소리가 오늘은 안 들리네. 집에 가면 아빠가 계실 거야.':p.round?'오늘 연습은 해 지기 전까지만!':'경기장에서 보자. 화분엔 물만 주고 딱지는 주지 않는다.');return}
  if(id==='hana'){this.talk('하나',p.round>=2?'네가 이겼으니까 결승까지 응원할게!':'색종이는 접는 방향에 따라 표정이 달라져. 너도 대회 나갈 거지?');return}
  if(id==='uncle'){this.talk('박태풍',p.round===3?'R은 뿌리 버티기. 다음 반격 피해를 절반으로 줄인다. 네 공격 기회는 그대로야.':'평범한 지나가는 전설이다. 결승에서 보면 너무 놀라지 마라.');return}
  if(id==='table'){if(this.phase()==='lost'){home();return}this.craft();return}
  if(id==='bag'){pause('inventory');return}
  if(id==='target'){if(!p.schoolReward){this.talk('아빠','식탁에서 접고 압축한 다음, 같이 연습해 보자.');return}this.freePractice();return}
  if(id==='poster'||id==='board'){if(!p.schoolReward){this.talk('대회 포스터','주민센터 컵 · 참가비 무료. 먼저 학교에서 자신감을 되찾자.');return}p.map.poster=true;this.save();this.menu('마을 게시판',[this.objective()[1],'주민센터 컵 · 3경기 · 참가비 없음'],[['이야기 수첩',()=>Journeys.open()],['지도 보기',()=>pause('map')]]);return}
  if(id==='reception'||id==='bracket'||id==='cup'){if(!p.schoolReward||!p.map.poster){this.talk('접수원',p.schoolReward?'학교 앞 포스터를 읽고 오렴. 참가 일정이 적혀 있어.':'학교에서 한 판 이겨 보고 와. 접수비는 없으니 걱정 말고.');return}Village.hub().open('cup');return}
  if(id==='bus'){this.bus();return}
  if(id==='shop'){this.shop();return}
  if(id==='press'||id==='training'||id==='forge'){
   if(!p.schoolReward){this.talk('시설 안내','지금은 집에서 아빠와 접기와 강화를 먼저 배워 보자. 마을 대회 전에 다시 들러 줘.');return}
   if(id==='forge'){if(!p.provinceEntered){this.talk('공방 주인','도 대회 진출 뒤 이곳에서도 형태를 가공해 줄게. 지금은 공사 중이야.');return}Forge.open();return}
   if(id==='training'){this.training();return}Village.hub().open(id);return
  }
  const lines={bed:'잠은 안 오고, 딱지 뒤집히는 소리만 생각난다.',photo:p.round===3?'표창장은 복사해서 걸어 뒀다. 우승은 종이 한 장보다 오래 남으니까.':'아빠도 이 사진에서는 딱지를 들고 있다. 왜 지금은 안 치실까?',bike:'페달보다 손목이 빨라지는 날이 올까?',mail:'전기 요금 고지서. 이것까지 접으면 아빠가 뒤집힐 것 같다.',plant:'딱지가 자라지는 않는 것 같다.',bench:this.phase()==='school'?'도윤은 늘 이 벤치에서 경기를 지켜본다.':'도윤이 앉던 자리가 비었다. 그 딱지는 어디로 갔을까?',notice:'학교 재대결 승리 → 포스터 확인 → 안쪽 접수원에게 신청. 경기 사이에는 자유롭게 준비할 수 있다.',fusion:'융합기 설계 중 · 재료와 기능은 아직 연구 중이다.',spectator:'신문 한 장으로 온 동네가 모였네. 네 경기, 기대할게!',score:'점수판 뒤에서 사람이 숫자를 넘긴다. 전광판보다 손이 빠르다.',machine:'쾅! 소리만큼 거대한 압축기. 선수 경기장과는 안전하게 분리되어 있다.',inspection:'안전 검사 완료. 지금까지 쓰던 딱지도 출전할 수 있다.',broadcast:'전국으로 나가는 중계. 마이크 앞에서도 딱지 자랑은 멈추지 않는다.'};
  this.talk(o.name,lines[id]||'오늘도 딱지 이야기가 한창이다.');
 },
 menu(title,lines,choices){G.state='facility';G.facility='map';G.keys.clear();panels('facility');$('facility-title').textContent=title;$('facility-wallet').textContent=`${G.profile.coins}원`;const c=$('facility-content');c.replaceChildren();for(const t of lines){const p=document.createElement('p');p.textContent=t;c.append(p)}for(const [label,fn,disabled]of choices){const b=document.createElement('button');b.className='facility-choice';b.textContent=label;b.disabled=!!disabled;b.onclick=()=>{if(!G.paused&&G.state==='facility')fn()};c.append(b)}$('facility-close').onclick=()=>Village.close();c.querySelector('button:not(:disabled)')?.focus()},
 confirm(label,details,action,back){this.menu(label,details,[['확인',action],['취소',back]])},
 shop(){const p=G.profile;this.menu('종이 잡화점',['주인: 첫 재도전은 집에 있는 신문으로 충분해. 여긴 여분을 준비하는 곳이야.'],Object.entries({newspaper:['신문지',10],colored_paper:['색종이',20]}).map(([id,[name,cost]])=>[`${name} 1장 · ${cost}원 · 보유 ${p.map.materials[id]}장`,()=>this.confirm('구매 확인',[`${name} 1장 · ${cost}원`, `보유 ${p.coins} → ${p.coins-cost}원`],()=>{if(p.coins<cost)return;p.coins-=cost;p.map.materials[id]++;this.save();this.shop()},()=>this.shop()),p.coins<cost]))},
 craft(){const p=G.profile;this.menu('식탁 · 종이 보강',['종이 1장으로 해당 딱지의 다음 압축 비용을 대신한다. 이미 가진 딱지를 더 단단하게 접는다.'],Object.keys(p.map.materials).map(id=>{const cost=P.cost(p,id);return [`${P.items[id].name} 보강 · 재료 ${p.map.materials[id]}장`,()=>this.confirm('보강 확인',['종이 1장 사용 · 공격 +3 / 내구 +10'],()=>{if(!p.owned.includes(id)||!p.map.materials[id]||p.upgrades[id]>=P.upgradeLimit(p))return;p.map.materials[id]--;p.upgrades[id]++;this.save();sound('fold');this.craft()},()=>this.craft()),!p.owned.includes(id)||!p.map.materials[id]||cost===null||p.upgrades[id]>=P.upgradeLimit(p)]}))},
 training(){const p=G.profile;this.menu('훈련장',[`선수 Lv.${P.level(p)+1} · 훈련 ${p.xp}/${P.trainingLimit(p)}`],[['무료 타이밍 연습 · 보상 없음',()=>this.freePractice()],['선수 훈련 · 30원 / 훈련 +3',()=>this.confirm('선수 훈련 확인',['30원 · 타격 +2 / 집중 +1 (성장 한도까지)'],()=>{if(p.coins<30||p.xp>=P.trainingLimit(p))return;p.coins-=30;p.xp=Math.min(P.trainingLimit(p),p.xp+3);this.save();this.training()},()=>this.training()),p.coins<30||p.xp>=P.trainingLimit(p)],['친구들과의 약속',()=>Journeys.open()],['연습 대결',()=>Village.open('training')]])},
 freePractice(){G.mapPractice=true;G.practice=[];this.save();transition(()=>battle('training'))},
 bus(){const p=G.profile;this.menu('시외 정류장',['이동 요금 무료 · 열린 대회만 갈 수 있다.'],[['뒤집마을',()=>this.move('center',1300)],['시 대회 · 마을 우승',()=>City.travel(),p.round<3],['도 대회 · 시 우승',()=>Province.travel(),p.cityRound<3],['전국 대회 · 도 우승',()=>National.travel(),p.provinceRound<3],['대륙 대회 · 전국 우승',()=>Continent.travel(),p.nationalRound<3],['세계 대회 · 대륙 우승',()=>Tiers.world.travel(),p.continentRound<3],['행성 대회 · 세계 우승',()=>Planet.travel(),p.worldRound<3]])},
 map(body){const menu=GameMenu;body.append(menu.el('p','',this.objective()[1]));for(const ids of [['home','alley','square','center','schoolfront','yard'],['lobby'],['city','province','national']]){const row=menu.el('div','map-route');for(const id of ids){const z=this.zones[id],current=G.mapZone===id,b=menu.el('div',`map-node${current?' current':''}`,`${current?'● ':''}${z.name}`);b.append(menu.el('small','',G.profile.map.visited[id]?'방문함':'아직 가보지 않은 곳'));row.append(b)}body.append(row)}body.append(menu.el('p','','집 ↔ 골목 ↔ 광장 ↔ 주민센터 ↔ 학교 앞 ↔ 운동장 · 주민센터 문 안쪽은 접수 로비'));if(this.active())body.append(menu.el('p','',`이 구역: ${this.objects().map(o=>o.name).join(' · ')}`))}
};

window.Exploration=Exploration;
