/* Persistent campaign rules; no DOM or clock dependencies. */
(function(root){
 const Journeys=typeof module!=='undefined'?require('./journey-data.js'):root.TtakjiJourneys;
 const items={
  newspaper:{name:'신문지 딱지',hp:110,attack:20,description:'잘 접은 한 장. 튼튼하고 균형 잡혔다.'},
  colored_paper:{name:'색종이 딱지',hp:90,attack:24,description:'가볍고 날렵하다. 내구도보다 한 방.'},
  hair:{name:'머리카락 딱지',hp:125,attack:28,focus:1,description:'한 올 한 올, 아저씨의 자존심. 집중 +1.'},
  fusion:{name:'융합 딱지',hp:165,attack:34,focus:1,description:'신문지, 색종이, 머리카락을 하나로 녹였다. 집중 +1.'}
 };
 const opponents=[
  {name:'앞집 아저씨',title:'1회전',hp:80,attack:18,material:'newspaper',prize:30,kind:'neighbor'},
  {name:'유치원 친구',title:'준결승',hp:110,attack:21,material:'colored_paper',prize:50,kind:'friend'},
  {name:'탈모 아저씨',title:'결승',hp:150,attack:24,material:'hair',prize:120,kind:'uncle'}
 ];
 const cityOpponents=[
  {name:'박자왕',title:'1회전',hp:150,attack:26,material:'l_folder',prize:80,kind:'sprinter'},
  {name:'접기 장인',title:'준결승',hp:190,attack:28,material:'accordion_folder',prize:140,kind:'folder'},
  {name:'대장',title:'결승',hp:230,attack:32,material:'cardboard',prize:300,kind:'boss'}
 ];
 const provinceOpponents=[
  {name:'철벽 선배',title:'1회전',hp:260,attack:34,material:'iron',prize:180,kind:'wall'},
  {name:'엇박자 선수',title:'준결승',hp:280,attack:36,material:'rubber',prize:260,kind:'offbeat'},
  {name:'도 챔피언',title:'결승',hp:320,attack:40,material:'copper',prize:500,kind:'champion'}
 ];
 const nationalOpponents=[
  {name:'한방 승부사',title:'8강',hp:380,attack:42,material:'shuriken',prize:300,kind:'charger'},
  {name:'종이 수비수',title:'준결승',hp:420,attack:44,material:'encyclopedia',prize:450,kind:'fortress'},
  {name:'전국 챔피언',title:'결승',hp:480,attack:48,material:'certificate',prize:800,kind:'national_champion'}
 ];
 // Beyond the national title, each tier unlocks after the previous one is won.
 const continentOpponents=[
  {name:'사막 돌풍',title:'8강',hp:560,attack:52,material:'glass',prize:600,kind:'gust'},
  {name:'빙판 장인',title:'준결승',hp:620,attack:55,material:'quartz',prize:800,kind:'glacier'},
  {name:'대륙 챔피언',title:'결승',hp:700,attack:58,material:'wood',prize:1200,kind:'continent_champion'}
 ];
 const worldOpponents=[
  {name:'무대 위 쇼맨',title:'8강',hp:780,attack:62,material:'fish_and_chips',prize:1500,kind:'showman'},
  {name:'종이 건축가',title:'준결승',hp:860,attack:65,material:'semiconductor',prize:2000,kind:'architect'},
  {name:'세계 챔피언',title:'결승',hp:950,attack:68,material:'diamond',prize:3000,kind:'world_champion'}
 ];
 const planetOpponents=[
  {name:'화성 대표',title:'8강',hp:1050,attack:72,material:'slime',prize:3500,kind:'martian'},
  {name:'달 기지 선수',title:'준결승',hp:1150,attack:75,material:'robot',prize:4500,kind:'lunar'},
  {name:'행성 챔피언',title:'결승',hp:1280,attack:78,material:'uranium',prize:6000,kind:'planet_champion'}
 ];
 // Catalog ttakji: rival trophies (won the first time their owner is beaten) and shop stock by tier.
 const trophy=(tier,round)=>({tier,round}),stock=(shop,price)=>({shop,price});
 for(const [id,name,hp,attack,focus,source,description] of [
  ['l_folder','L자 파일 딱지',120,30,0,trophy('city',0),'박자왕의 딱지. 매끈해서 손에서 빨리 떠난다.'],
  ['accordion_folder','아코디언 파일 딱지',135,28,1,trophy('city',1),'접기 장인의 딱지. 주름마다 박자가 접혀 있다. 집중 +1.'],
  ['cardboard','종이 박스 딱지',150,30,0,trophy('city',2),'대장이 쓰던 딱지. 두툼하고 고집스럽다.'],
  ['iron','철 딱지',190,30,0,trophy('province',0),'철벽 선배의 딱지. 쉽게 뒤집히지 않는다.'],
  ['rubber','고무 딱지',160,36,0,trophy('province',1),'엇박자 선수의 딱지. 튕기듯 엇갈려 들어간다.'],
  ['copper','구리 딱지',170,38,0,trophy('province',2),'도 챔피언의 딱지. 칠수록 붉게 빛난다.'],
  ['shuriken','표창 딱지',150,46,0,trophy('national',0),'한방 승부사의 딱지. 날카로운 한 방.'],
  ['encyclopedia','백과사전 딱지',220,34,0,trophy('national',1),'종이 수비수의 딱지. 두꺼운 지식의 방패.'],
  ['certificate','표창장 딱지',190,42,1,trophy('national',2),'전국 챔피언의 딱지. 상장 한 장의 자존심. 집중 +1.'],
  ['glass','유리 딱지',170,52,0,trophy('continent',0),'사막 돌풍의 딱지. 모래가 녹아 만든 날.'],
  ['quartz','석영 딱지',240,42,0,trophy('continent',1),'빙판 장인의 딱지. 차갑고 단단하다.'],
  ['wood','나무 딱지',230,48,1,trophy('continent',2),'대륙 챔피언의 딱지. 나이테만큼 버틴다. 집중 +1.'],
  ['fish_and_chips','피쉬앤칩스 딱지',210,54,0,trophy('world',0),'쇼맨의 딱지. 바삭한 소리로 관중을 홀린다.'],
  ['semiconductor','반도체 딱지',240,52,1,trophy('world',1),'종이 건축가의 딱지. 설계도처럼 정확하다. 집중 +1.'],
  ['diamond','다이아 딱지',280,56,1,trophy('world',2),'세계 챔피언의 딱지. 세상에서 가장 단단한 한 장. 집중 +1.'],
  ['slime','슬라임 딱지',300,50,0,trophy('planet',0),'화성 대표의 딱지. 뒤집혀도 다시 흘러내린다.'],
  ['robot','로봇 딱지',260,62,1,trophy('planet',1),'달 기지 선수의 딱지. 계산된 정타. 집중 +1.'],
  ['uranium','우라늄 딱지',280,68,2,trophy('planet',2),'행성 챔피언의 딱지. 다루기 위험할 만큼 강하다. 집중 +2.'],
  ['wet_newspaper','물 묻은 신문지 딱지',100,22,0,stock('village',60),'비 맞은 신문지. 무겁지만 잘 안 찢어진다.'],
  ['mock_exam','모의고사 종이 딱지',105,23,0,stock('village',80),'OMR 칸만큼 정확하게 접었다.'],
  ['workbook','풀다 남은 문제집 딱지',115,22,1,stock('village',90),'끝까지 못 푼 문제집. 집중 +1.'],
  ['socks','양말 딱지',125,28,0,stock('city',200),'짝 잃은 양말로 접었다. 의외로 푹신하다.'],
  ['tape','테이프 딱지',140,26,0,stock('city',220),'겹겹이 감아 붙였다. 끈질기다.'],
  ['clothes','옷 딱지',150,27,0,stock('city',260),'작아진 옷을 접었다. 넉넉한 내구.'],
  ['uniform','교복 딱지',170,32,0,stock('province',400),'단정하게 각 잡힌 교복.'],
  ['curtain','커튼 딱지',185,30,0,stock('province',450),'햇빛을 막던 커튼. 바람도 막는다.'],
  ['blanket','이불 딱지',210,28,0,stock('province',500),'포근하지만 무겁다. 잘 안 뒤집힌다.'],
  ['bread','식빵 딱지',200,38,0,stock('national',700),'갓 구운 식빵. 손이 자꾸 간다.'],
  ['carrot','당근 딱지',180,44,0,stock('national',800),'아삭하고 날카롭다.'],
  ['donut','도넛 딱지',220,40,0,stock('national',900),'가운데 구멍으로 바람이 빠진다.'],
  ['kimchi_pancake','김치전 딱지',230,42,0,stock('national',1000),'비 오는 날의 필살기.'],
  ['liquid','액체 딱지',240,46,1,stock('continent',1500),'모양이 없어서 막기 어렵다. 집중 +1.'],
  ['computer','컴퓨터 딱지',250,50,0,stock('continent',1800),'부팅은 느려도 한 방은 빠르다.'],
  ['ai','AI 딱지',240,54,2,stock('continent',2500),'상대 박자를 학습한다. 집중 +2.'],
  ['diffuser','디퓨저 딱지',260,52,0,stock('world',3000),'좋은 향기에 상대가 방심한다.'],
  ['hunminjeongeum','훈민정음 해례본 딱지',280,58,2,stock('world',5000),'귀한 글자가 담긴 딱지. 집중 +2.'],
  ['ragged','거지 딱지',85,21,0,stock('village',70),'주워 모은 조각을 꿰맸다. 작아도 한 판은 버틴다.'],
  ['couple_gum','커플 딱지(껌딱지)',145,29,0,stock('city',280),'떨어지기 싫은 두 하트. 끈질기게 달라붙는다.'],
  ['piano','피아노 딱지',210,46,1,stock('national',1200),'건반처럼 정확한 타이밍. 집중 +1.'],
  ['lego','레고 딱지',250,48,0,stock('continent',2200),'알록달록한 돌기를 맞물려 접었다.'],
  ['saimdang','신사임당 딱지',270,56,1,stock('world',4500),'금빛 종이에 담긴 초상과 꽃무늬. 집중 +1.'],
  ['magic_carpet','마법의 양탄자 딱지',290,64,2,stock('planet',7000),'금실 문양 사이로 마법이 흐른다. 집중 +2.']
 ])items[id]={name,hp,attack,focus,source,description};
 const roundOf=(p,tier)=>tier==='village'?p.round:p[`${tier}Round`];
 const shopOpen=(p,tier)=>tier==='village'?p.schoolReward:!!p[`${tier}Entered`];
 const earned=(p,id)=>{const s=items[id]?.source;if(!s)return false;return s.shop?shopOpen(p,s.shop):roundOf(p,s.tier)>s.round};
 let lastTrophy=null;
 function grantTrophy(p,tier,round){const id=Object.keys(items).find(k=>items[k].source?.tier===tier&&items[k].source.round===round);if(id&&!p.owned.includes(id)){p.owned.push(id);p.upgrades[id]=0;lastTrophy=id}}
 const takeTrophy=()=>{const id=lastTrophy;lastTrophy=null;return id};
 const shopStock=p=>Object.keys(items).filter(id=>items[id].source?.shop&&shopOpen(p,items[id].source.shop)&&!p.owned.includes(id));
 function buy(p,id){if(!shopStock(p).includes(id)||p.coins<items[id].source.price)return false;p.coins-=items[id].source.price;p.owned.push(id);p.upgrades[id]=0;return true}
 const tiers={continent:{opponents:continentOpponents,after:'national'},world:{opponents:worldOpponents,after:'continent'},planet:{opponents:planetOpponents,after:'world'}};
 const cleared=(p,id)=>!!p[`${id}Entered`]&&p[`${id}Round`]===3;
 const forms={balanced:{name:'기본형',attack:0,hp:0,cost:0},striker:{name:'공격형',attack:8,hp:-20,cost:90},sturdy:{name:'수비형',attack:-4,hp:35,cost:90}};
 const freshRefining=()=>Object.fromEntries(Object.keys(items).map(id=>[id,{active:'balanced',unlocked:['balanced']}]));
 const upgradeLimit=p=>p.planetEntered?28:p.worldEntered?24:p.continentEntered?20:p.nationalEntered?16:p.provinceEntered?12:p.cityEntered?8:5;
 const trainingLimit=p=>p.planetEntered?105:p.worldEntered?90:p.continentEntered?75:p.nationalEntered?60:p.provinceEntered?45:p.cityEntered?30:15;
 const freshMap=()=>({zone:'yard',x:180,phase:'school',poster:false,guidance:true,visited:{},materials:{newspaper:0,colored_paper:0}});
 const fresh=()=>({map:freshMap(),coins:0,owned:['newspaper'],equipped:'newspaper',upgrades:Object.fromEntries(Object.keys(items).map(id=>[id,0])),xp:0,journey:Journeys.fresh(),refining:freshRefining(),homeAllowance:false,homeUpgradeDone:false,homePracticeDone:false,round:0,cityEntered:false,cityRound:0,provinceEntered:false,provinceRound:0,nationalEntered:false,nationalRound:0,continentEntered:false,continentRound:0,worldEntered:false,worldRound:0,planetEntered:false,planetRound:0,powerUnlocked:false,schoolReward:false,guardUnlocked:false,seen:{},claimed:{}});
 const integer=(x,max)=>Number.isSafeInteger(x)?Math.max(0,Math.min(max,x)):0;
 function restore(raw){
  const p=fresh();if(!raw||typeof raw!=='object')return p;
  p.schoolReward=raw.schoolReward===true;p.round=p.schoolReward?integer(raw.round,3):0;
  p.owned=p.schoolReward?['newspaper','colored_paper']:['newspaper'];
  if(p.round===3)p.owned.push('hair');p.guardUnlocked=p.round===3;
  p.cityEntered=p.round===3&&raw.cityEntered===true;p.cityRound=p.cityEntered?integer(raw.cityRound,3):0;p.powerUnlocked=p.cityRound>=1;
  p.provinceEntered=p.cityRound===3&&raw.provinceEntered===true;p.provinceRound=p.provinceEntered?integer(raw.provinceRound,3):0;
  p.nationalEntered=p.provinceRound===3&&raw.nationalEntered===true;p.nationalRound=p.nationalEntered?integer(raw.nationalRound,3):0;
  for(const [id,tier] of Object.entries(tiers)){p[`${id}Entered`]=cleared(p,tier.after)&&raw[`${id}Entered`]===true;p[`${id}Round`]=p[`${id}Entered`]?integer(raw[`${id}Round`],3):0}
  if(p.continentEntered&&Array.isArray(raw.owned)&&raw.owned.includes('fusion'))p.owned.push('fusion');
  for(const id of Array.isArray(raw.owned)?raw.owned:[])if(!p.owned.includes(id)&&earned(p,id))p.owned.push(id);
  p.journey=Journeys.restore(raw.journey,p);
  const m=raw.map||{};const zones=['home','alley','square','center','lobby','schoolfront','yard','city','province','national'];
  p.map.zone=zones.includes(m.zone)?m.zone:p.schoolReward?'square':'yard';
  if(['city','province','national'].includes(p.map.zone)&&!p[p.map.zone+'Entered'])p.map.zone='square';
  p.map.x=Number.isFinite(m.x)?Math.max(45,Math.min(2155,m.x)):180;
  p.map.phase=['school','lost','rematch'].includes(m.phase)?m.phase:'school';p.map.poster=m.poster===true||(!raw.map&&p.schoolReward);p.map.guidance=m.guidance!==false;
  for(const z of zones)if(m.visited?.[z]===true)p.map.visited[z]=true;
  for(const id of ['newspaper','colored_paper'])p.map.materials[id]=integer(m.materials?.[id],999);

  p.equipped=p.owned.includes(raw.equipped)?raw.equipped:'newspaper';
  p.coins=integer(raw.coins,999999);p.xp=integer(raw.xp,trainingLimit(p));
  for(const id of p.owned)p.upgrades[id]=integer(raw.upgrades?.[id],upgradeLimit(p));
  if(p.cityEntered)for(const id of p.owned){const saved=raw.refining?.[id],entry=p.refining[id];for(const form of ['striker','sturdy'])if(Array.isArray(saved?.unlocked)&&saved.unlocked.includes(form))entry.unlocked.push(form);if(entry.unlocked.includes(saved?.active))entry.active=saved.active;}
  p.homeUpgradeDone=raw.homeUpgradeDone===true&&p.upgrades.newspaper>=1;
  p.homeAllowance=raw.homeAllowance===true||p.homeUpgradeDone;
  p.homePracticeDone=raw.homePracticeDone===true&&p.homeUpgradeDone;
  for(const id of ['house','training','press','cup','forge','mapControls'])p.seen[id]=raw.seen?.[id]===true;
  for(const a of achievements)if(raw.claimed?.[a.id]===true)p.claimed[a.id]=true;
  return p;
 }
 const level=p=>Math.min(trainingLimit(p)/3,Math.floor(p.xp/3));
 const formOf=(p,id=p.equipped)=>p.refining?.[id]?.active||'balanced';
 function stats(p,id=p.equipped,form=formOf(p,id)){const item=items[id],upgrade=p.upgrades[id]||0,bonus=forms[form]||forms.balanced;return{hp:item.hp+upgrade*10+bonus.hp,attack:item.attack+upgrade*3+level(p)*2+bonus.attack,concentration:level(p)+(item.focus||0)}}
 function refineCost(p,form,id=p.equipped){if(!p.cityEntered||!p.owned.includes(id)||!Object.hasOwn(forms,form))return null;return p.refining[id].unlocked.includes(form)?0:forms[form].cost}
 function refine(p,form){const price=refineCost(p,form);if(price===null||p.coins<price||formOf(p)===form)return false;const entry=p.refining[p.equipped];p.coins-=price;if(!entry.unlocked.includes(form))entry.unlocked.push(form);entry.active=form;return true}
 const cost=(p,id=p.equipped)=>p.upgrades[id]>=upgradeLimit(p)?null:40+p.upgrades[id]*30;
 function upgrade(p){const price=cost(p);if(price===null||p.coins<price)return false;p.coins-=price;p.upgrades[p.equipped]++;return true}
 function equip(p,id){if(!p.owned.includes(id))return false;p.equipped=id;return true}
 function schoolReward(p){if(p.schoolReward)return false;p.schoolReward=true;p.coins+=80;p.owned.push('colored_paper');return true}
 function award(p,round){if(round!==p.round||round<0||round>=3)return false;p.coins=Math.min(999999,p.coins+opponents[round].prize);p.round++;if(p.round===3){p.owned.push('hair');p.guardUnlocked=true}return true}
 function train(p,grades){if(grades.length!==3||grades.some(g=>!['BAD','GOOD','PERFECT'].includes(g)))return false;p.xp=Math.min(trainingLimit(p),p.xp+1);p.coins=Math.min(999999,p.coins+5);return true}
 function grantHomeAllowance(p){if(p.homeAllowance||p.schoolReward)return false;p.homeAllowance=true;p.coins=Math.min(999999,p.coins+40);return true}
 function upgradeAtHome(p){if(p.schoolReward||!p.homeAllowance||p.homeUpgradeDone||p.equipped!=='newspaper')return false;if(!upgrade(p))return false;p.homeUpgradeDone=true;return true}
 function finishHomePractice(p,grades){if(!p.homeUpgradeDone||p.homePracticeDone||grades.length!==3||grades.some(g=>!['BAD','GOOD','PERFECT'].includes(g)))return false;p.homePracticeDone=true;p.xp=Math.min(trainingLimit(p),p.xp+3);return true}
 function enterCity(p){if(p.round!==3||p.cityEntered)return false;p.cityEntered=true;return true}
 function awardCity(p,round){if(!p.cityEntered||p.round!==3||!Number.isInteger(round)||round!==p.cityRound||round<0||round>=cityOpponents.length)return false;p.coins=Math.min(999999,p.coins+cityOpponents[round].prize);p.cityRound++;p.powerUnlocked=true;grantTrophy(p,'city',round);return true}
 function enterProvince(p){if(!p.cityEntered||p.cityRound!==3||p.provinceEntered)return false;p.provinceEntered=true;return true}
 function awardProvince(p,round){if(!p.provinceEntered||p.cityRound!==3||!Number.isInteger(round)||round!==p.provinceRound||round<0||round>=provinceOpponents.length)return false;p.coins=Math.min(999999,p.coins+provinceOpponents[round].prize);p.provinceRound++;grantTrophy(p,'province',round);return true}
 function enterNational(p){if(!p.provinceEntered||p.provinceRound!==3||p.nationalEntered)return false;p.nationalEntered=true;return true}
 function awardNational(p,round){if(!p.nationalEntered||p.provinceRound!==3||!Number.isInteger(round)||round!==p.nationalRound||round<0||round>=nationalOpponents.length)return false;p.coins=Math.min(999999,p.coins+nationalOpponents[round].prize);p.nationalRound++;grantTrophy(p,'national',round);return true}
 function enterTier(p,id){const tier=tiers[id];if(!tier||!cleared(p,tier.after)||p[`${id}Entered`])return false;p[`${id}Entered`]=true;return true}
 function awardTier(p,id,round){const tier=tiers[id];if(!tier||!p[`${id}Entered`]||!cleared(p,tier.after)||!Number.isInteger(round)||round!==p[`${id}Round`]||round<0||round>=3)return false;p.coins=Math.min(999999,p.coins+tier.opponents[round].prize);p[`${id}Round`]++;grantTrophy(p,id,round);return true}
 // The fusion machine melts the three base ttakji into one, keeping their average compression.
 const fusionCost=1500,canFuse=p=>p.continentEntered&&!p.owned.includes('fusion')&&['newspaper','colored_paper','hair'].every(id=>p.owned.includes(id));
 function fuse(p){if(!canFuse(p)||p.coins<fusionCost)return false;p.coins-=fusionCost;p.owned.push('fusion');p.upgrades.fusion=Math.min(upgradeLimit(p),Math.floor((p.upgrades.newspaper+p.upgrades.colored_paper+p.upgrades.hair)/3));return true}
 // Achievements: long-term goals across the whole campaign, each paying coins once.
 const storiesDone=p=>Journeys.episodes.filter(e=>p.journey.stages[e.id]===2).length;
 const achievements=[
  {id:'first_win',title:'첫 승리',description:'마을 대회에서 처음 이기기',reward:30,check:p=>p.round>=1},
  {id:'village',title:'마을의 지존',description:'마을 대회 우승',reward:50,check:p=>p.round===3},
  {id:'city',title:'시의 지존',description:'시 대회 우승',reward:120,check:p=>p.cityRound===3},
  {id:'province',title:'도의 지존',description:'도 대회 우승',reward:250,check:p=>p.provinceRound===3},
  {id:'national',title:'전국의 지존',description:'전국 대회 우승',reward:500,check:p=>p.nationalRound===3},
  {id:'continent',title:'대륙의 지존',description:'대륙 대회 우승',reward:900,check:p=>p.continentRound===3},
  {id:'world',title:'세계의 지존',description:'세계 대회 우승',reward:1500,check:p=>p.worldRound===3},
  {id:'planet',title:'우주의 지존',description:'행성 대회 우승',reward:3000,check:p=>p.planetRound===3},
  {id:'press8',title:'납작의 길',description:'딱지 하나를 +8까지 압축',reward:100,check:p=>Object.values(p.upgrades).some(n=>n>=8)},
  {id:'press20',title:'종이보다 얇게',description:'딱지 하나를 +20까지 압축',reward:600,check:p=>Object.values(p.upgrades).some(n=>n>=20)},
  {id:'collector',title:'딱지 수집가',description:'딱지 10종 모으기',reward:300,check:p=>p.owned.length>=10},
  {id:'collector_all',title:'딱지 박물관',description:'모든 딱지 모으기',reward:5000,check:p=>p.owned.length===Object.keys(items).length},
  {id:'shopper',title:'단골손님',description:'딱지 가게에서 5장 사기',reward:250,check:p=>p.owned.filter(id=>items[id].source?.shop).length>=5},
  {id:'forms',title:'형태 장인',description:'한 딱지로 공격형과 수비형을 모두 익히기',reward:150,check:p=>Object.values(p.refining).some(r=>r.unlocked.length>=3)},
  {id:'level10',title:'손에 익은 박자',description:'선수 Lv.10 달성',reward:100,check:p=>level(p)>=9},
  {id:'level30',title:'박자의 달인',description:'선수 Lv.30 달성',reward:800,check:p=>level(p)>=29},
  {id:'stories10',title:'이야기꾼',description:'이야기 10개 완료',reward:200,check:p=>storiesDone(p)>=10},
  {id:'stories_all',title:'모두의 이야기',description:`이야기 ${Journeys.episodes.length}개 모두 완료`,reward:1500,check:p=>storiesDone(p)===Journeys.episodes.length},
  {id:'rich',title:'딱지 부자',description:'5000원 모으기',reward:300,check:p=>p.coins>=5000}
 ];
 const claimable=p=>achievements.filter(a=>!p.claimed?.[a.id]&&a.check(p));
 function claim(p,id){const a=achievements.find(x=>x.id===id);if(!a||p.claimed[id]||!a.check(p))return false;p.claimed[id]=true;p.coins=Math.min(999999,p.coins+a.reward);return true}
 const openingMultiplier=intent=>intent.exposed?1.5:1;
 function intent(kind,turn){
  if(kind==='charger')return {defending:turn%2===1,weak:turn%2===1,perfect:turn%2===0,exposed:turn%2===0,pierce:false};
  if(kind==='fortress')return {defending:turn%3!==0,weak:turn%3===0,perfect:false,exposed:turn%3===0,pierce:false};
  if(kind==='national_champion')return {defending:turn%4===1,weak:turn%4===0,perfect:turn%4===3,exposed:turn%4===0,pierce:false};
  if(kind==='gust')return {defending:false,perfect:turn%2===1,exposed:turn%2===1,weak:turn%2===0,pierce:false};
  if(kind==='glacier')return {defending:turn%3!==0,weak:turn%3===0,perfect:false,exposed:turn%3===0,pierce:true};
  if(kind==='continent_champion')return {defending:turn%5===1||turn%5===4,pierce:turn%5===4,perfect:turn%5===3,weak:turn%5===0,exposed:turn%5===0};
  if(kind==='showman')return {defending:turn%3===1,perfect:turn%3===2,weak:turn%3===0,exposed:turn%3===0,pierce:false};
  if(kind==='architect')return {defending:turn%2===1,perfect:turn%2===0,pierce:true};
  if(kind==='world_champion')return {defending:turn%4===1,pierce:true,perfect:turn%4===2||turn%4===3,weak:turn%4===0,exposed:turn%4===0};
  if(kind==='martian')return {defending:turn%2===1,weak:turn%2===1,perfect:turn%4===2,exposed:turn%4===0,pierce:false};
  if(kind==='lunar')return {defending:false,perfect:turn%3!==0,weak:turn%3===0,exposed:turn%3===0,pierce:false};
  if(kind==='planet_champion')return {defending:turn%6===1||turn%6===4,pierce:turn%6===1,perfect:turn%6===2||turn%6===5,weak:turn%6===0,exposed:turn%6===0};
  if(kind==='wall')return {defending:true,perfect:false,pierce:true};
  if(kind==='offbeat')return {defending:false,perfect:turn%2===1,weak:turn%2===0,pierce:false};
  if(kind==='champion')return {defending:turn%3===1,perfect:turn%3===2,weak:turn%3===0,pierce:false};
  const defending=(kind==='friend'&&turn%2===0)||(kind==='folder'&&turn%2===1)||(kind==='boss'&&turn%3===1);
  const perfect=(kind==='uncle'&&turn%3===0)||(kind==='sprinter'&&turn%2===0)||(kind==='boss'&&turn%3===0);
  return {defending,perfect,pierce:kind==='folder'};
 }
 const wager=(grade,active)=>active?(grade==='BAD'?.5:1.5):1;
 const damage=(base,attack,defending=false)=>Math.max(1,Math.round(base*attack/20*(defending ? .5 : 1)));
 const api={shopStock,buy,takeTrophy,earned,achievements,claimable,claim,tiers,continentOpponents,worldOpponents,planetOpponents,enterTier,awardTier,fusionCost,canFuse,fuse,nationalOpponents,enterNational,awardNational,openingMultiplier,provinceOpponents,enterProvince,awardProvince,forms,formOf,refineCost,refine,grantHomeAllowance,upgradeAtHome,finishHomePractice,items,opponents,cityOpponents,upgradeLimit,trainingLimit,enterCity,awardCity,intent,wager,fresh,restore,level,stats,cost,upgrade,equip,schoolReward,award,train,damage};
 if(typeof module!=='undefined')module.exports=api;else root.TtakjiProgression=api;
})(globalThis);
