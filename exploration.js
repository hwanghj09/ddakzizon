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
  national:{name:'전국 선수권 · 실내 체육관',width:2200,theme:'national',objects:[['bus','시외 정류장',140,'facility'],['training','선수 대기실',580,'facility'],['press','장비 준비실',1020,'facility'],['cup','선수 접수',1460,'facility'],['inspection','규격 측정 부스',1770,'inspect'],['broadcast','중계석',2020,'inspect']]},
  continent:{name:'대륙 대회 · 국제 전시장',width:2200,theme:'continent',objects:[['bus','시외 정류장',140,'facility'],['training','연습 매트',560,'facility'],['press','국제 공방',980,'facility'],['cup','선수 접수',1400,'facility'],['booth','접기 전시 부스',1760,'inspect'],['translator','번역 자막판',2040,'inspect']]},
  world:{name:'세계 대회 · 원형 경기장',width:2200,theme:'world',objects:[['bus','시외 정류장',140,'facility'],['training','선수 대기실',560,'facility'],['press','세계 공방',980,'facility'],['cup','선수 접수',1400,'facility'],['safety','안전 검사대',1760,'inspect'],['screen','대형 스크린',2040,'inspect']]},
  planet:{name:'행성 대회 · 우주 정거장',width:2200,theme:'planet',objects:[['bus','귀환 셔틀',140,'facility'],['training','무중력 훈련장',560,'facility'],['press','우주 공방',980,'facility'],['cup','교류전 접수',1400,'facility'],['starwindow','별이 보이는 창',1760,'inspect'],['interpreter','통역 장치',2040,'inspect']]}
 },
 active(){return G.mapZone&&G.scene===(P.stageIds.includes(G.mapZone)?G.mapZone:'village')},
 data(){return this.zones[G.mapZone]},
 phase(){return G.profile.schoolReward?'campaign':G.profile.map.phase},
 // The village cup runs from registration until the final is won; 앞집 아저씨 and 하나 wait at the venue meanwhile (spec 06 §6).
 cupLive(){const p=G.profile;return p.villageEntered&&p.round<3},
 objects(){
  const p=G.profile,live=this.cupLive(),titles=P.titles(p),hide=id=>(id==='doyun'&&this.phase()!=='school'&&!p.story.ending)||(id==='uncle'&&p.round===3&&G.mapZone==='center')||(['neighbor','hana'].includes(id)&&live&&!['lobby'].includes(G.mapZone));
  // House: the 표창장 frame after the village title and a shelf that gains a trophy per title (spec 06 §4-1). Yard after the ending: kids and 도윤.
  const extra={lobby:live?[['neighbor','앞집 아저씨',880,'npc'],['hana','하나',1180,'npc']]:[],square:p.round===3?[['uncle','박태풍',980,'npc']]:[],home:[...(p.round===3?[['frame','표창장 액자',353,'inspect']]:[]),...(titles.length?[['shelf','트로피 선반',845,'inspect']]:[])],yard:p.story.ending?[['kids','어린 참가자들',700,'npc']]:[]}[G.mapZone]||[];
  const label=(id,name)=>id==='forge'&&!P.refineryOpen(p)?'제련소 · 공사 중':id==='fusion'?(P.fusionOpen(p)?'융합기':name):name;
  return this.data().objects.concat(extra).filter(o=>!hide(o[0])).map(([id,name,x,type])=>({id,name:label(id,name),x,type:id==='fusion'&&P.fusionOpen(p)?'facility':type}))
 },
 nearest(){return this.objects().filter(o=>Math.abs(o.x-G.hero.x)<=100).sort((a,b)=>Math.abs(a.x-G.hero.x)-Math.abs(b.x-G.hero.x)||Number(b.type==='npc')-Number(a.type==='npc'))[0]},
 enter(zone,x){
  if(!this.zones[zone])zone='square';cancelScene();G.mapZone=zone;G.hub=P.stageIds.includes(zone)?zone:'village';G.scene=G.hub;G.mode=G.hub;G.state='explore';G.stolen=false;G.flipPlayer=G.flipEnemy=0;
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
 objective(){const p=G.profile,phase=this.phase();
  if(phase==='school')return ['yard','민수에게 말을 걸자'];if(phase==='lost')return ['home',G.mapZone==='home'?'식탁에서 새 딱지를 접자':'집으로 돌아가자'];if(phase==='folded')return ['home','연습 표적에서 연습하자'];if(phase==='rematch')return ['yard','학교에서 민수에게 다시 도전하자'];
  if(!p.map.poster)return ['schoolfront','학교 앞 게시판의 대회 포스터를 확인하자'];
  if(G.hub==='village'){if(!p.villageEntered)return ['lobby','주민센터에서 대회에 접수하자'];if(p.round<3)return ['lobby',p.round===1?'접수원에게 다음 경기를 신청하자 · 광장 압축기는 선택':'접수원에게 다음 경기를 신청하자'];if(p.story.ending)return ['yard','자유 경기 · 운동장의 도윤, 정류장의 모든 대회'];return ['center',p.cityRound===3?'정류장에서 다음 대회로':'정류장에서 시 대회로']}
  const t=P.tournament(G.hub),next=P.tournaments[P.tournaments.indexOf(t)+1];
  if(!P.tournamentWon(p,G.hub))return [G.hub,'접수처에서 다음 경기를 신청하자'];
  return [G.hub,next?(next.entered(p)?'자유 경기 · 정류장에서 어느 대회든 갈 수 있다':`정류장에서 ${next.stage}로`):p.story.ending?'자유 경기 · 다음 무대 ????':'운동장으로 돌아가자']},
 updateInteract(){const o=this.nearest();coach(o?`${o.name} · ${o.type==='npc'?'대화':o.type==='door'?'들어가기':o.type==='inspect'?'조사':'이용'} [E]`:'');const [dest,goal]=this.objective();$('map-location').textContent=this.data().name;$('map-objective').textContent=goal;$('map-hud').hidden=false;$('map-direction').textContent=G.profile.map.guidance&&dest!==G.mapZone?this.direction(dest):''},
 direction(dest){const chain=['home','alley','square','center','schoolfront','yard'];const a=G.mapZone==='lobby'?3:chain.indexOf(G.mapZone),b=dest==='lobby'?3:chain.indexOf(dest);return `${b<a?'←':'→'} ${this.zones[dest].name}`},
 talk(name,line){say([[name,line]],()=>{G.state='explore';panels('explore-ui');this.updateInteract();$('game').focus({preventScroll:true})},true)},
 interact(){const o=this.nearest();if(!o)return;G.keys.clear();G.target=null;sound('click');const p=G.profile,id=o.id,zone=G.mapZone;
  const links={home:['alley',300],alley:['home',1100],lobby:['center',700],schoolfront:['yard',170],yard:['schoolfront',850]};
  if(o.type==='door'){const to=id==='lobby'?['lobby',160]:links[zone];if(to)this.move(...to);return}
  if(id==='minsu'){
   if(this.phase()==='school'){story('prologue_bet',()=>transition(()=>battle('intro_battle')));return}
   if(this.phase()==='rematch'){story('rematch_intro',()=>transition(()=>battle('rematch')));return}
   if(p.story.ending){this.talk('민수','반 애들한테 다 말했어. 행성 챔피언이랑 학교에서 딱지 쳤다고! …이겼냐고는 묻지 마.');return}
   this.talk('민수',this.phase()==='lost'?'…오늘은 그만하고 집에 가. 내일 더 센 딱지 가져오면 다시 하자.':this.phase()==='folded'?'새로 접었어? 연습은 하고 와. 내일 보자.':p.cityRound===3?'도윤도 이겼다고? 나 반 애들한테 “내가 쟤랑 학교에서 딱지 쳤다”고 다 자랑했어!':p.round===3?'마을 챔피언! 시 대회도 응원하러 갈게. 도윤 만나면 안부 전해 줘.':p.round>0?'1회전 이겼다며! 역시 내 딱지를 뒤집은 애다. 관중석에서 제일 크게 응원할게!':'대회 나간다며? 반 애들한테 다 말해 놨어. 꼭 이겨!');return
  }
  if(id==='doyun'){if(p.story.ending){this.menu('도윤',['한 판 더? 이번엔 아무것도 안 걸고.'],[['친선전 · 보상 없음',()=>Ending.friendly()],['다음에',()=>Village.close()]]);return}this.talk('도윤','말보다 딱지가 먼저 뒤집히면 좋겠는데.');return}
  if(id==='kids'){this.talk('어린 참가자','말해 준 대로 접어 봤어요. 지면… 다시 접으면 되는 거죠?');return}
  if(id==='neighbor'){const phase=this.phase();this.talk(o.name,G.mapZone==='lobby'?(p.round===0?'경기장에서 보자고 했지? 첫 상대가 바로 나다.':'잠은 못 잤어도 응원은 한다. 오늘 연습은 해 지기 전까지만!'):phase==='school'?'이 시간에 어딜 그렇게 뛰어가니?':phase!=='campaign'?'딱지 소리가 오늘은 안 들리네.':p.round===3?'오늘 연습은 해 지기 전까지만!':'너 어제도 밤늦게 딱 쳤지? 경기장에서 보자.');return}
  if(id==='hana'){this.talk('하나',G.mapZone==='lobby'?(p.round===0?'나도 나가! 준결승에서 만나면 봐주지 않을 거야.':p.round===1?'다음 상대가 나야. 크레파스 기억하지?':'결승 응원할게! 급하게 치지 마.'):p.round===3?'결승 봤어. 기다릴 줄 알더라. 시 대회에서도 그렇게 해.':'색종이는 접는 방향에 따라 표정이 달라져. 너도 대회 나갈 거지?');return}
  // 정밀 타격 is granted on the final's result screen; here he only explains it.
  if(id==='uncle'){this.talk('박태풍',p.round===3?'R은 정밀 타격. 힘을 빼고 정확히 쳐서 뒤집기 확률을 15%p 올린다. 쓰고 나면 세 턴은 쉬어라. 기술은 이미 네 손에 있다.':'…나? 평범한 지나가는 전설이다.');return}
  if(id==='table'){if(this.phase()==='lost'){home();return}this.craft();return}
  if(id==='bag'){pause('inventory');return}
  if(id==='target'){if(!p.schoolReward){if(this.phase()==='lost'){this.talk('','먼저 식탁에서 딱지를 접자.');return}practice();return}this.freePractice();return}
  if(id==='poster'){if(!p.schoolReward){this.talk('대회 포스터','제1회 마을 딱지 대회 · 참가비 무료. 먼저 학교에서 자신감을 되찾자.');return}if(p.map.poster){this.posterMenu();return}story('poster',()=>this.posterMenu());return}
  if(id==='board'){const lines=[this.objective()[1],p.map.poster?'주민센터 컵 · 3경기 · 참가비 없음':'주민센터 컵 · 접수 준비 중'];this.menu('마을 게시판',lines,[['이야기 다시 보기',()=>this.replays()],['이야기 수첩',()=>Journeys.open()],['지도 보기',()=>pause('map')]]);return}
  if(id==='cup'&&G.hub!=='village'){Village.hub().open('cup');return}
  if(id==='fusion'&&P.fusionOpen(p)){Village.open('fusion');return}
  if(id==='reception'||id==='bracket'||id==='cup'){if(!p.schoolReward||!p.map.poster){this.talk('접수원',p.schoolReward?'학교 앞 포스터를 읽고 오렴. 참가 일정이 적혀 있어.':'학교에서 한 판 이겨 보고 와. 접수비는 없으니 걱정 말고.');return}Tournament.open('village');return}
  if(id==='bus'){Tournament.select();return}
  if(id==='shop'){this.shop();return}
  if(id==='press'||id==='training'||id==='forge'){
   if(!p.schoolReward){this.talk('시설 안내','지금은 집에서 접기와 연습을 먼저 해 보자. 마을 대회 때 다시 들러 줘.');return}
   if(id==='forge'){if(!P.refineryOpen(p)){this.talk('공방 주인','도 대회에서 우승하면 문을 열 거야. 지금은 공사 중이야.');return}Forge.open();return}
   if(id==='training'){this.training();return}Village.hub().open(id);return
  }
  const lines={bed:'잠은 안 오고, 딱지 뒤집히는 소리만 생각난다.',photo:'아빠도 이 사진에서는 딱지를 들고 있다. 왜 지금은 안 치실까?',shelf:this.shelf(),frame:p.keepsakes.awardUsed?'원본은 딱지로 접었지만, 복사본은 그대로 걸려 있다. 우승은 종이 한 장보다 오래 남으니까.':'마을 대회 표창장 복사본. 원본은 가방에 잘 보관하고 있다.',bike:'페달보다 손목이 빨라지는 날이 올까?',mail:'전기 요금 고지서. 이것까지 접으면 아빠가 뒤집힐 것 같다.',plant:'딱지가 자라지는 않는 것 같다.',bench:this.phase()==='school'?'도윤은 늘 이 벤치에서 경기를 지켜본다.':'딱지는 어디로 간 걸까?',notice:'학교 재대결 승리 → 포스터 확인 → 안쪽 접수원에게 신청. 경기 사이에는 자유롭게 준비할 수 있다.',fusion:'융합기 설계 중 · 재료와 기능은 아직 연구 중이다.',spectator:'신문 한 장으로 온 동네가 모였네. 네 경기, 기대할게!',score:'점수판 뒤에서 사람이 숫자를 넘긴다. 전광판보다 손이 빠르다.',machine:'쾅! 소리만큼 거대한 압축기. 선수 경기장과는 안전하게 분리되어 있다.',inspection:'안전 검사 완료. 지금까지 쓰던 딱지도 출전할 수 있다.',broadcast:'전국으로 나가는 중계. 마이크 앞에서도 딱지 자랑은 멈추지 않는다.',
   booth:'지역마다 접는 방향도, 모서리를 넣는 법도 다르다. 같은 딱지는 하나도 없다.',translator:'자막: “절대 뒤집어지지 않은 감자” → (수정) “절대 뒤집히지 않는 자”.',
   safety:'안전 검사 통과. 위험한 재료만 막는다. 모양과 종이는 저마다 다르다.',screen:p.worldRound===3?'시험 운영 공지: 안전 기준을 통과한 다양한 소재 허용.':'대형 스크린에 오늘의 대진표가 돈다.',
   starwindow:'창밖으로 지구가 보인다. 운동장은 너무 작아서 안 보인다.',interpreter:'통역 장치: “딱” 소리는 번역할 필요가 없습니다.'};
  this.talk(o.name,lines[id]||'오늘도 딱지 이야기가 한창이다.');
 },
 menu(title,lines,choices){G.state='facility';G.facility='map';G.keys.clear();panels('facility');$('facility-title').textContent=title;$('facility-wallet').textContent=`${G.profile.coins}원`;const c=$('facility-content');c.replaceChildren();for(const t of lines){const p=document.createElement('p');p.textContent=t;c.append(p)}for(const [label,fn,disabled]of choices){const b=document.createElement('button');b.className='facility-choice';b.textContent=label;b.disabled=!!disabled;b.onclick=()=>{if(!G.paused&&G.state==='facility')fn()};c.append(b)}$('facility-close').onclick=()=>Village.close();c.querySelector('button:not(:disabled)')?.focus()},
 confirm(label,details,action,back){this.menu(label,details,[['확인',action],['취소',back]])},
 shop(){const p=G.profile;this.menu('종이 잡화점',['주인: 첫 재도전은 집에 있는 신문으로 충분해. 여긴 여분을 준비하는 곳이야.'],Object.entries({newspaper:['신문지',10],colored_paper:['색종이',20]}).map(([id,[name,cost]])=>[`${name} 1장 · ${cost}원 · 보유 ${p.map.materials[id]}장`,()=>this.confirm('구매 확인',[`${name} 1장 · ${cost}원`, `보유 ${p.coins} → ${p.coins-cost}원`],()=>{if(p.coins<cost)return;p.coins-=cost;p.map.materials[id]++;this.save();this.shop()},()=>this.shop()),p.coins<cost]))},
 posterMenu(){const p=G.profile;this.menu('제1회 마을 딱지 대회',['우승 상품 · 상금과 표창장 · 참가자 모집 중','장소 · 주민센터 앞 (접수는 안쪽 로비)'],[[p.map.poster?'주민센터에서 접수하기 (목표)':'대회에 나가기',()=>{const first=!p.map.poster;p.map.poster=true;this.save();Village.close();if(first)toast('목표 · 주민센터에서 대회에 접수하자')}]])},
 // Seen main story scenes can be read again (spec 05 §2-3). Replays never touch progress.
 replays(){const seen=TtakjiStory.replayOrder.filter(id=>G.profile.story.seen[id]);this.menu('이야기 다시 보기',[seen.length?'다시 보고 싶은 장면을 고르자.':'아직 다시 볼 이야기가 없다.'],seen.map(id=>[TtakjiStory.scenes[id].title,()=>replayScene(id,()=>this.replays())]))},
 craft(){const p=G.profile;this.menu('식탁 · 종이 보강',['종이 1장으로 해당 딱지의 다음 압축 비용을 대신한다. 이미 가진 딱지를 더 단단하게 접는다.'],Object.keys(p.map.materials).map(id=>{const cost=P.cost(p,id);return [`${P.items[id].name} 보강 · 재료 ${p.map.materials[id]}장`,()=>this.confirm('보강 확인',['종이 1장 사용 · 겹 +1 · 공격 +3 / 내구 +10 / 방어 −1'],()=>{if(!p.owned.includes(id)||!p.map.materials[id]||p.upgrades[id]>=P.upgradeLimit(p))return;p.map.materials[id]--;p.upgrades[id]++;this.save();sound('fold');this.craft()},()=>this.craft()),!p.owned.includes(id)||!p.map.materials[id]||cost===null||p.upgrades[id]>=P.upgradeLimit(p)]}).concat(p.keepsakes.award?[['표창장 딱지 접기 · 표창장 1장',()=>this.menu('표창장 원본을 쓸까?',['표창장 원본을 재료로 접으면 원본은 사라진다.','벽 액자의 복사본은 그대로 남는다.'],[['원본으로 접기',()=>{if(P.craftAward(p)){this.save();sound('fold');toast('마을 표창장 딱지 완성! 가방에서 장착할 수 있다.')}this.craft()}],['원본은 보관하기',()=>this.craft()]])]]:[]))},
 training(){const p=G.profile;this.menu('훈련장',[`선수 Lv.${P.level(p)+1} · 훈련 ${p.xp}/${P.trainingLimit(p)}`],[['무료 타이밍 연습 · 보상 없음',()=>this.freePractice()],['선수 훈련 · 30원 / 훈련 +3',()=>this.confirm('선수 훈련 확인',['30원 · 힘 +2 / 집중력 +1 (성장 한도까지)'],()=>{if(p.coins<30||p.xp>=P.trainingLimit(p))return;p.coins-=30;p.xp=Math.min(P.trainingLimit(p),p.xp+3);this.save();this.training()},()=>this.training()),p.coins<30||p.xp>=P.trainingLimit(p)],['친구들과의 약속',()=>Journeys.open()],['연습 대결',()=>Village.open('training')]])},
 // Trophy shelf: one keepsake per title, in order.
 shelf(){const names={village:'마을 트로피(물컵 아님)',city:'시 대회 트로피',province:'압축 챔피언십 트로피',national:'전국 선수권 트로피',continent:'접기의 축제 트로피',world:'세계 우승 트로피',planet:'교류전 우승 장식'};return P.titles(G.profile).map(id=>names[id]).join(' · ')},
 freePractice(){G.mapPractice=true;G.practice=[];this.save();transition(()=>battle('training'))},
 map(body){const menu=GameMenu;body.append(menu.el('p','',this.objective()[1]));for(const ids of [['home','alley','square','center','schoolfront','yard'],['lobby'],['city','province','national'],['continent','world','planet']]){const row=menu.el('div','map-route');for(const id of ids){const z=this.zones[id],current=G.mapZone===id,b=menu.el('div',`map-node${current?' current':''}`,`${current?'● ':''}${z.name}`);b.append(menu.el('small','',G.profile.map.visited[id]?'방문함':'아직 가보지 않은 곳'));row.append(b)}body.append(row)}body.append(menu.el('p','','집 ↔ 골목 ↔ 광장 ↔ 주민센터 ↔ 학교 앞 ↔ 운동장 · 주민센터 문 안쪽은 접수 로비'));if(this.active())body.append(menu.el('p','',`이 구역: ${this.objects().map(o=>o.name).join(' · ')}`))}
};

window.Exploration=Exploration;
