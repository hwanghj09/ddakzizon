/* Persistent campaign rules; no DOM or clock dependencies. */
(function(root){
 const Journeys=typeof module!=='undefined'?require('./journey-data.js'):root.TtakjiJourneys;
 const Rules=typeof module!=='undefined'?require('./rules.js'):root.TtakjiRules;
 const timingGrades=['PERFECT','GOOD','NORMAL','BAD'];
 const items={
  newspaper:{name:'신문지 딱지',hp:100,attack:20,defense:8,stability:10,description:'잘 접은 한 장. 튼튼하고 균형 잡혔다.'},
  colored_paper:{name:'색종이 딱지',hp:90,attack:24,defense:5,stability:6,description:'가볍고 날렵하다. 내구도보다 한 방.'},
  hair:{name:'머리카락 딱지',hp:125,attack:28,defense:10,stability:14,focus:1,description:'한 올 한 올, 아저씨의 자존심. 집중 +1.'},
  fusion:{name:'융합 딱지',hp:165,attack:34,defense:16,stability:18,focus:1,description:'신문지, 색종이, 머리카락을 하나로 녹였다. 집중 +1.'},
  // Story keepsakes reuse an existing sprite set (sprite) instead of shipping new art.
  first_newspaper:{name:'첫 신문지 딱지',hp:100,attack:20,defense:8,stability:12,sprite:'newspaper',description:'도윤이 책 사이에 끼워 지켜 준 첫 딱지. 안쪽에 내 이름이 적혀 있다. 교체하지 않아도 되는 기념품.'},
  award_ttakji:{name:'마을 표창장 딱지',hp:110,attack:23,defense:10,stability:16,sprite:'certificate',description:'마을 대회 표창장을 접었다. 벽에는 복사본이 그대로 걸려 있다.'},
  // 전국 대회 후원사가 권하는 선택 장비 (spec 04 §8). 받지 않아도, 받고 안 써도 된다.
  official:{name:'공인 딱지',hp:200,attack:40,defense:20,stability:20,sprite:'uniform',description:'연맹 공인 규격 딱지. 무료 수리와 연습장 이용권이 딸려 온다. 편하지만, 꼭 써야 하는 건 아니다.'}
 };
 // Match data shared by the bracket, prep and result screens. hint = 성향 힌트, unlocks = 결과 화면 해금 안내.
 const opponents=[
  {name:'앞집 아저씨',title:'1회전',hp:70,attack:14,defense:18,stability:12,material:'cardboard',prize:50,kind:'neighbor',skill:'novice',hint:'묵직한 종이 박스 딱지. 방어는 높고 공격은 약하다. 꾸준히 쳐서 내구도를 깎자.',unlocks:['광장 압축기 안내 (강화는 선택)']},
  {name:'하나',title:'준결승',hp:90,attack:19,stability:16,material:'colored_paper',prize:70,kind:'friend',skill:'novice',hint:'균형형. 짝수 턴에는 딱지를 눌러 버틴다. 내구도가 낮아도 한 번에 끝나지 않는다.'},
  {name:'박태풍',title:'결승',hp:115,attack:22,material:'hair',prize:150,kind:'uncle',skill:'club',skills:['precise'],perfectFlip:.1,calmStart:true,hint:'노련한 타격. 세 번째 턴마다 정타가 오고, 타이밍이 좋을 때 뒤집기가 강하다.',unlocks:['표창장 (가방에 보관)','시 대회 참가권']}
 ];
 const cityOpponents=[
  {name:'서준',title:'지역구 예선 1',hp:120,attack:30,material:'l_folder',prize:100,kind:'sprinter',skill:'club',hint:'미끄러운 L자 파일 딱지. 짝수 턴에 세게 치지만 안정성이 낮아 잘 뒤집힌다.'},
  {name:'한별',title:'지역구 예선 2',hp:140,attack:27,material:'mock_exam',prize:120,kind:'examinee',skill:'club',hint:'방어와 공격을 번갈아 고른다. 홀수 턴에는 막아서 피해가 절반이다.'},
  {name:'도윤',title:'시 결승',hp:170,attack:32,material:'accordion_folder',prize:300,kind:'doyun',skill:'ace',skills:['precise'],hint:'방어, 정밀 타격, 정타를 섞어 쓴다. 스킬로 흐름을 끊자.',unlocks:['도 대회 참가권']}
 ];
 // Province → planet (spec 05 §7-11). Balance: tests/balance.test.js simulates a typically upgraded build per stage.
 // steady = no scripted comeback at low HP, hidden = the intent is not announced, heals/healAt = 꾹 눌러 펴기 uses and threshold,
 // gaugeScale = faster player gauge for this match unless the 게이지 속도 setting is 느리게.
 const provinceOpponents=[
  {name:'상자왕',title:'1회전',hp:180,attack:30,defense:22,stability:16,material:'cardboard',prize:200,kind:'boxer',skill:'ace',hint:'종이 박스 전문가. 홀수 턴엔 상자처럼 막고, 네 번째 턴마다 숨을 돌리며 빈틈(피해 1.5배)을 보인다.',unlocks:['꾹 눌러 펴기 (상자왕에게 배움)']},
  {name:'최단단',title:'준결승',hp:230,attack:40,defense:40,stability:0,material:'iron',prize:250,kind:'compressed',skill:'ace',skills:['smash'],hint:'압축 딱지. 방어가 아주 높지만 안정성이 0이라 내구도가 조금만 줄어도 잘 뒤집힌다. 첫 턴에 막고, 세 번째 턴마다 온 힘으로 내리찍다 빈틈을 보인다.'},
  {name:'윤서',title:'결승',hp:260,attack:36,defense:16,stability:16,material:'piano',prize:600,kind:'timing',skill:'master',skills:['precise','smash'],steady:true,hint:'정확한 타이밍. 네 박자로 방어 → 정밀 타격 → 보통 → 빈틈. 내구도가 낮아지면 정해진 정타 대신 평소대로 친다.',unlocks:['제련소 해금','전국 대회 참가권']}
 ];
 const nationalOpponents=[
  {name:'테이프 딱지 선수',title:'1회전',hp:300,attack:50,defense:18,stability:18,material:'tape',prize:400,kind:'mender',skill:'master',skills:['press'],heals:2,healAt:.5,hint:'회복형. 짝수 턴에는 막고, 내구도가 절반 아래로 내려가면 테이프를 감아 두 번까지 꾹 눌러 편다.'},
  {name:'공인 딱지 선수',title:'준결승',hp:320,attack:40,defense:22,stability:20,material:'certificate',prize:500,kind:'official',skill:'master',skills:['precise'],hint:'공인 딱지의 균형형. 방어 → 정타 → 힘 뺀 반격(빈틈) 세 박자를 정확히 지킨다.'},
  {name:'이규격',title:'결승',hp:360,attack:34,defense:22,stability:20,material:'encyclopedia',prize:1200,kind:'regulator',sprite:'gyugyeok',skill:'master',skills:['precise','smash'],hidden:true,hint:'규칙과 정확성. 매 턴 같은 준비 동작(자로 재기)을 하지만, 다음 수는 일정한 주기로 반복되지 않는다.',unlocks:['융합기 해금','대륙 대회 참가권']}
 ];
 const continentOpponents=[
  {name:'마리',title:'1회전',hp:380,attack:38,defense:24,stability:22,material:'bread',prize:800,kind:'endurance',skill:'master',hint:'식빵 무늬 종이 딱지. 회복 대신 버틴다. 홀수 턴엔 막고, 네 번째 턴마다 빈틈이 생긴다.'},
  {name:'리오',title:'준결승',hp:440,attack:68,defense:16,stability:4,material:'copper',prize:1000,kind:'striker',skill:'legend',skills:['smash'],hint:'구리색 종이 딱지. 짝수 턴마다 강타로 세게 치지만 그 턴엔 빈틈이 생기고, 안정성이 낮아 잘 뒤집힌다.'},
  {name:'아라',title:'결승',hp:500,attack:56,defense:26,stability:24,material:'lego',prize:2500,kind:'reverse',skill:'legend',skills:['precise','smash','press'],hint:'접는 방향을 바꾼 딱지. 먼저 정타를 치고(첫 박자), 막고, 보통, 빈틈 — 순서가 거꾸로다.',unlocks:['세계 대회 참가권']}
 ];
 const worldOpponents=[
  {name:'미라',title:'1회전',hp:500,attack:46,defense:36,stability:20,material:'glass',prize:1500,kind:'glass',skill:'legend',hint:'유리 모양의 투명 종이 딱지. 첫 턴은 단단히 막고(완벽만 뚫린다), 세 번째 턴마다 빈틈.'},
  {name:'연맹 추천 선수',title:'준결승',hp:540,attack:44,defense:26,stability:22,material:'semiconductor',prize:2000,kind:'federation',skill:'legend',skills:['precise','smash'],hint:'공인 딱지에 숙련된 균형형. 방어 → 정타 → 보통 → 빈틈 네 박자.'},
  {name:'한결',title:'결승',hp:640,attack:58,defense:36,stability:26,material:'diamond',prize:5000,kind:'situational',sprite:'hangyeol',skill:'legend',skills:['precise','smash','press'],hint:'세계 챔피언. 공격·정밀 타격·회복을 상황에 따라 고른다. 자기 내구도가 뒤지면 막고, 앞서면 몰아친다.',unlocks:['세계 우승 트로피','행성 교류전 초대장']}
 ];
 const planetOpponents=[
  {name:'모서리 셋',title:'1회전',hp:580,attack:36,defense:28,stability:32,material:'quartz',prize:3000,kind:'triangle',skill:'legend',hint:'삼각형 딱지. 안정성이 아주 높고 공격은 약하다. 막고 → 보통 → 빈틈 세 박자.'},
  {name:'반짝',title:'준결승',hp:640,attack:58,defense:28,stability:20,material:'shuriken',prize:4000,kind:'sparkle',skill:'legend',skills:['precise'],gaugeScale:.8,hint:'별무늬 딱지. 빠른 박자 — 이 경기는 게이지가 빨라진다(설정이 느리게면 그대로). 세 번째 턴마다 숨을 고르며 빈틈.'},
  {name:'무중',title:'결승',hp:720,attack:62,defense:36,stability:28,material:'slime',prize:10000,kind:'situational',sprite:'mujung',skill:'legend',skills:['precise','smash','press'],hint:'여러 기술을 상황에 따라 쓴다. 지금까지 배운 타이밍과 기술을 모두 써야 한다.',unlocks:['교류전 우승 장식']}
 ];
 // Catalog ttakji: rival trophies (won the first time their owner is beaten) and shop stock by tier.
 const trophy=(tier,round)=>({tier,round}),stock=(shop,price)=>({shop,price});
 for(const [id,name,hp,attack,defense,stability,focus,source,description] of [
  ['l_folder','L자 파일 딱지',120,30,6,4,0,trophy('city',0),'서준의 딱지. 매끈해서 손에서 빨리 떠난다.'],
  ['accordion_folder','아코디언 파일 딱지',135,28,9,10,1,trophy('city',2),'도윤의 딱지. 주름마다 박자가 접혀 있다. 집중 +1.'],
  ['cardboard','종이 박스 딱지',150,30,18,14,0,stock('city',240),'앞집 아저씨가 쓰던 묵직한 딱지. 두툼하고 고집스럽다.'],
  ['iron','철 딱지',190,30,24,22,0,trophy('province',1),'최단단의 압축 딱지. 접힌 선이 안 보일 만큼 눌렀다. 단단하지만 생각보다 잘 뒤집힌다.'],
  ['rubber','고무 딱지',160,36,22,10,0,stock('province',420),'튕기듯 엇갈려 들어간다. 압축 동호회의 인기 상품.'],
  ['copper','구리 딱지',170,38,16,14,0,trophy('continent',1),'리오의 구리색 종이 딱지. 칠수록 붉게 빛난다.'],
  ['shuriken','표창 딱지',150,46,8,6,0,trophy('planet',1),'반짝의 별무늬 딱지. 빛보다 먼저 손을 떠난다.'],
  ['encyclopedia','백과사전 딱지',220,34,30,12,0,trophy('national',2),'이규격의 딱지. 규정집을 통째로 외운 두꺼운 방패.'],
  ['certificate','표창장 딱지',190,42,18,16,1,trophy('national',1),'공인 딱지 선수의 딱지. 인증 도장 한 장의 자존심. 집중 +1.'],
  ['glass','유리 딱지',170,52,10,6,0,trophy('world',0),'미라의 유리 무늬 투명 종이 딱지. 보기엔 깨질 것 같지만 종이다.'],
  ['quartz','석영 딱지',240,42,34,20,0,trophy('planet',0),'모서리 셋의 수정 딱지. 모서리가 셋이라고 우긴다.'],
  ['wood','나무 딱지',230,48,26,24,1,stock('continent',1600),'얇게 깎은 나무 결 종이. 나이테만큼 버틴다. 집중 +1.'],
  ['fish_and_chips','피쉬앤칩스 딱지',210,54,14,12,0,stock('world',3200),'바삭한 소리로 관중을 홀린다. 기름은 묻지 않았다.'],
  ['semiconductor','반도체 딱지',240,52,26,20,1,trophy('world',1),'연맹 추천 선수의 딱지. 설계도처럼 정확하다. 집중 +1.'],
  ['diamond','다이아 딱지',280,56,44,22,1,trophy('world',2),'세계 챔피언 한결의 딱지. 다이아 무늬의 가장 단단한 한 장. 집중 +1.'],
  ['slime','슬라임 딱지',300,50,26,36,0,trophy('planet',2),'무중의 딱지. 어떤 기술도 흘려보낸다. 뒤집혀도 다시 흘러내린다.'],
  ['robot','로봇 딱지',260,62,34,22,1,stock('planet',6500),'달 기지 기념품. 계산된 정타. 집중 +1.'],
  ['uranium','우라늄 딱지',280,68,30,14,2,stock('planet',8000),'안전 검사를 통과한 모조품. 진짜 우라늄은 반입 금지다. 집중 +2.'],
  ['wet_newspaper','물 묻은 신문지 딱지',100,22,9,14,0,stock('village',60),'비 맞은 신문지. 무겁지만 잘 안 찢어진다.'],
  ['mock_exam','모의고사 종이 딱지',105,23,7,9,0,stock('village',80),'OMR 칸만큼 정확하게 접었다. 빨간 점수는 안쪽으로.'],
  ['workbook','풀다 남은 문제집 딱지',115,22,9,10,1,stock('village',90),'끝까지 못 푼 문제집. 집중 +1.'],
  ['socks','양말 딱지',125,28,8,8,0,stock('city',200),'짝 잃은 양말로 접었다. 의외로 푹신하다.'],
  ['tape','테이프 딱지',140,26,12,14,0,stock('city',220),'겹겹이 감아 붙였다. 끈질기다.'],
  ['clothes','옷 딱지',150,27,10,10,0,stock('city',260),'작아진 옷을 접었다. 넉넉한 내구.'],
  ['uniform','교복 딱지',170,32,14,12,0,stock('province',400),'단정하게 각 잡힌 교복.'],
  ['curtain','커튼 딱지',185,30,14,16,0,stock('province',450),'햇빛을 막던 커튼. 바람도 막는다.'],
  ['blanket','이불 딱지',210,28,16,26,0,stock('province',500),'포근하지만 무겁다. 잘 안 뒤집힌다.'],
  ['bread','식빵 딱지',200,38,14,14,0,stock('national',700),'식빵 무늬를 인쇄한 종이 딱지. 마리의 주 무기. 먹으면 안 된다.'],
  ['carrot','당근 딱지',180,44,12,10,0,stock('national',800),'아삭하고 날카롭다.'],
  ['donut','도넛 딱지',220,40,16,8,0,stock('national',900),'가운데 구멍으로 바람이 빠진다.'],
  ['kimchi_pancake','김치전 딱지',230,42,18,16,0,stock('national',1000),'비 오는 날의 필살기.'],
  ['liquid','액체 딱지',240,46,14,28,1,stock('continent',1500),'모양이 없어서 막기 어렵다. 집중 +1.'],
  ['computer','컴퓨터 딱지',250,50,24,18,0,stock('continent',1800),'부팅은 느려도 한 방은 빠르다.'],
  ['ai','AI 딱지',240,54,22,18,2,stock('continent',2500),'상대 박자를 학습한다. 집중 +2.'],
  ['diffuser','디퓨저 딱지',260,52,20,18,0,stock('world',3000),'좋은 향기에 상대가 방심한다.'],
  ['hunminjeongeum','훈민정음 해례본 딱지',280,58,30,24,2,stock('world',5000),'귀한 글자가 담긴 딱지. 집중 +2.'],
  ['ragged','거지 딱지',85,21,4,6,0,stock('village',70),'주워 모은 조각을 꿰맸다. 작아도 한 판은 버틴다.'],
  ['couple_gum','커플 딱지(껌딱지)',145,29,9,18,0,stock('city',280),'떨어지기 싫은 두 하트. 끈질기게 달라붙는다.'],
  ['piano','피아노 딱지',210,46,18,14,1,stock('national',1200),'건반처럼 정확한 타이밍. 집중 +1.'],
  ['lego','레고 딱지',250,48,30,16,0,stock('continent',2200),'알록달록한 돌기를 맞물려 접었다.'],
  ['saimdang','신사임당 딱지',270,56,28,22,1,stock('world',4500),'금빛 종이에 담긴 초상과 꽃무늬. 집중 +1.'],
  ['magic_carpet','마법의 양탄자 딱지',290,64,30,28,2,stock('planet',7000),'금실 문양 사이로 마법이 흐른다. 집중 +2.']
 ])items[id]={name,hp,attack,defense,stability,focus,source,description};
 const roundOf=(p,tier)=>tier==='village'?p.round:p[`${tier}Round`];
 const shopOpen=(p,tier)=>tier==='village'?p.schoolReward:!!p[`${tier}Entered`];
 // Rival trophies come from the opponent lists: beating a rival the first time wins the material they used.
 const trophyTiers={city:cityOpponents,province:provinceOpponents,national:nationalOpponents,continent:continentOpponents,world:worldOpponents,planet:planetOpponents};
 const trophyEarned=(p,id)=>Object.entries(trophyTiers).some(([tier,list])=>{const i=list.findIndex(o=>o.material===id);return i>=0&&roundOf(p,tier)>i});
 const earned=(p,id)=>{const s=items[id]?.source;if(s?.shop&&shopOpen(p,s.shop))return true;if(id==='first_newspaper')return p.story?.reunion===true;if(id==='award_ttakji')return p.keepsakes?.awardUsed===true;if(id==='official')return p.story?.official===true;return trophyEarned(p,id)};
 let lastTrophy=null;
 function grantTrophy(p,tier,round){const id=trophyTiers[tier]?.[round]?.material;if(id&&items[id]&&!p.owned.includes(id)){p.owned.push(id);p.upgrades[id]=0;lastTrophy=id}}
 const takeTrophy=()=>{const id=lastTrophy;lastTrophy=null;return id};
 const shopStock=p=>Object.keys(items).filter(id=>items[id].source?.shop&&shopOpen(p,items[id].source.shop)&&!p.owned.includes(id));
 function buy(p,id){if(!shopStock(p).includes(id)||p.coins<items[id].source.price)return false;p.coins-=items[id].source.price;p.owned.push(id);p.upgrades[id]=0;return true}
 const tiers={continent:{opponents:continentOpponents,after:'national'},world:{opponents:worldOpponents,after:'continent'},planet:{opponents:planetOpponents,after:'world'}};
 const cleared=(p,id)=>!!p[`${id}Entered`]&&p[`${id}Round`]===3,fusionOpen=p=>cleared(p,'national');
 // Stages after the village that have their own venue zone (and save fields xEntered/xRound).
 const stageIds=['city','province','national','continent','world','planet'];
 const forms={balanced:{name:'기본형',attack:0,hp:0,cost:0},striker:{name:'공격형',attack:8,hp:-20,cost:90},sturdy:{name:'수비형',attack:-4,hp:35,cost:90}};
 const freshRefining=()=>Object.fromEntries(Object.keys(items).map(id=>[id,{active:'balanced',unlocked:['balanced']}]));
 const upgradeLimit=p=>p.planetEntered?28:p.worldEntered?24:p.continentEntered?20:p.nationalEntered?16:p.provinceEntered?12:p.cityEntered?8:5;
 const trainingLimit=p=>p.planetEntered?105:p.worldEntered?90:p.continentEntered?75:p.nationalEntered?60:p.provinceEntered?45:p.cityEntered?30:15;
 // Hero name: letters, digits and single spaces only, at most 8 characters. Empty input falls back to the default.
 const DEFAULT_NAME='주인공',NAME_MAX=8;
 function sanitizeName(raw){if(typeof raw!=='string')return DEFAULT_NAME;const clean=Array.from(raw.normalize('NFC').replace(/[^\p{L}\p{N} ]/gu,'').replace(/ +/g,' ').trim()).slice(0,NAME_MAX).join('').trim();return clean||DEFAULT_NAME}
 // Tutorial phases: school (prologue) → lost (after the scripted loss) → folded (table) → rematch (practised once).
 const phases=['school','lost','folded','rematch'];
 const freshMap=()=>({zone:'yard',x:180,phase:'school',tournament:null,poster:false,guidance:true,visited:{},materials:{newspaper:0,colored_paper:0}});
 const fresh=()=>({name:DEFAULT_NAME,map:freshMap(),coins:0,owned:['newspaper'],equipped:'newspaper',upgrades:Object.fromEntries(Object.keys(items).map(id=>[id,0])),xp:0,journey:Journeys.fresh(),refining:freshRefining(),round:0,villageEntered:false,cityEntered:false,cityRound:0,provinceEntered:false,provinceRound:0,nationalEntered:false,nationalRound:0,continentEntered:false,continentRound:0,worldEntered:false,worldRound:0,planetEntered:false,planetRound:0,schoolReward:false,skills:[],seen:{},claimed:{},keepsakes:{scrap:false,award:false,awardUsed:false},story:{seen:{},reunion:false,official:false,ending:false}});
 const integer=(x,max)=>Number.isSafeInteger(x)?Math.max(0,Math.min(max,x)):0;
 function restore(raw){
  const p=fresh();if(!raw||typeof raw!=='object')return p;
  p.name=sanitizeName(raw.name);
  p.schoolReward=raw.schoolReward===true;p.round=p.schoolReward?integer(raw.round,3):0;
  p.owned=p.schoolReward?['newspaper','colored_paper']:['newspaper'];
  if(p.round===3)p.owned.push('hair');
  p.cityEntered=p.round===3&&raw.cityEntered===true;p.cityRound=p.cityEntered?integer(raw.cityRound,3):0;
  p.provinceEntered=p.cityRound===3&&raw.provinceEntered===true;p.provinceRound=p.provinceEntered?integer(raw.provinceRound,3):0;
  p.nationalEntered=p.provinceRound===3&&raw.nationalEntered===true;p.nationalRound=p.nationalEntered?integer(raw.nationalRound,3):0;
  for(const [id,tier] of Object.entries(tiers)){p[`${id}Entered`]=cleared(p,tier.after)&&raw[`${id}Entered`]===true;p[`${id}Round`]=p[`${id}Entered`]?integer(raw[`${id}Round`],3):0}
  // Keepsakes and one-time story events. Old saves that already won the village receive the 표창장 they never had.
  const k=raw.keepsakes||{},s=raw.story||{};
  p.keepsakes.awardUsed=p.round===3&&k.awardUsed===true;p.keepsakes.award=p.round===3&&!p.keepsakes.awardUsed;
  p.story.reunion=p.cityEntered&&s.reunion===true;
  // The 공인 딱지 is offered once the national tournament is entered; the ending flag needs the planet title.
  p.story.official=p.nationalEntered&&s.official===true;p.story.ending=cleared(p,'planet')&&s.ending===true;
  for(const [id,v] of Object.entries(s.seen&&typeof s.seen==='object'?s.seen:{}).slice(0,200))if(v===true&&/^[a-z0-9_]{1,40}$/.test(id))p.story.seen[id]=true;
  if(fusionOpen(p)&&Array.isArray(raw.owned)&&raw.owned.includes('fusion'))p.owned.push('fusion');
  for(const id of Array.isArray(raw.owned)?raw.owned:[])if(!p.owned.includes(id)&&earned(p,id))p.owned.push(id);
  for(const id of ['first_newspaper','award_ttakji','official'])if(!p.owned.includes(id)&&earned(p,id))p.owned.push(id);
  p.skills=earnedSkills(p);
  p.journey=Journeys.restore(raw.journey,p);
  const m=raw.map||{};const zones=['home','alley','square','center','lobby','schoolfront','yard',...stageIds];
  p.map.zone=zones.includes(m.zone)?m.zone:p.schoolReward?'square':'yard';
  if(stageIds.includes(p.map.zone)&&!p[p.map.zone+'Entered'])p.map.zone='square';
  p.map.x=Number.isFinite(m.x)?Math.max(45,Math.min(2155,m.x)):180;
  // v0.11 saves tracked the home lesson with separate flags; map them onto the phases.
  const legacy=raw.homePracticeDone===true?'rematch':raw.homeUpgradeDone===true?'folded':null;
  p.map.phase=phases.includes(m.phase)?m.phase:'school';if(legacy&&phases.indexOf(legacy)>phases.indexOf(p.map.phase))p.map.phase=legacy;
  p.map.poster=m.poster===true||(!raw.map&&p.schoolReward);p.map.guidance=m.guidance!==false;
  p.villageEntered=p.schoolReward&&p.map.poster&&(raw.villageEntered===true||p.round>0);
  // Reconnecting inside a tournament reopens its bracket after the last finished match.
  p.map.tournament=m.tournament==='village'&&p.villageEntered||stageIds.includes(m.tournament)&&p[`${m.tournament}Entered`]?m.tournament:null;
  p.keepsakes.scrap=k.scrap===true||p.schoolReward||p.map.phase!=='school';
  for(const z of zones)if(m.visited?.[z]===true)p.map.visited[z]=true;
  for(const id of ['newspaper','colored_paper'])p.map.materials[id]=integer(m.materials?.[id],999);

  p.equipped=p.owned.includes(raw.equipped)?raw.equipped:'newspaper';
  p.coins=integer(raw.coins,999999);p.xp=integer(raw.xp,trainingLimit(p));
  for(const id of p.owned)p.upgrades[id]=integer(raw.upgrades?.[id],upgradeLimit(p));
  if(p.cityEntered)for(const id of p.owned){const saved=raw.refining?.[id],entry=p.refining[id];for(const form of ['striker','sturdy'])if(Array.isArray(saved?.unlocked)&&saved.unlocked.includes(form))entry.unlocked.push(form);if(entry.unlocked.includes(saved?.active))entry.active=saved.active;}
  for(const id of ['house','training','press','cup','forge','mapControls'])p.seen[id]=raw.seen?.[id]===true;
  for(const a of achievements)if(raw.claimed?.[a.id]===true)p.claimed[a.id]=true;
  return p;
 }
 const level=p=>Math.min(trainingLimit(p)/3,Math.floor(p.xp/3));
 const formOf=(p,id=p.equipped)=>p.refining?.[id]?.active||'balanced';
 // Each press adds a layer: attack +3, HP +10, defense −1 (spec 02 §1 review rule). Player 힘 starts at 4.
 const press={attack:3,hp:10,defense:-1},baseStrength=4;
 function stats(p,id=p.equipped,form=formOf(p,id),upgrade=p.upgrades[id]||0){const item=items[id],bonus=forms[form]||forms.balanced;return{hp:item.hp+upgrade*press.hp+bonus.hp,attack:item.attack+upgrade*press.attack+bonus.attack,defense:Math.max(0,item.defense+upgrade*press.defense),stability:item.stability,strength:baseStrength+level(p)*2,concentration:level(p)+(item.focus||0)}}
 const nextStats=(p,id=p.equipped)=>stats(p,id,formOf(p,id),(p.upgrades[id]||0)+1);
 // Skills come from progress, so old saves (집중/뿌리 버티기/승부수 flags) map to 정밀 타격/강타/꾹 눌러 펴기 on restore.
 const earnedSkills=p=>[p.round===3&&'precise',p.cityRound>=1&&'smash',p.provinceRound>=1&&'press'].filter(Boolean);
 const hasSkill=(p,id)=>p.skills.includes(id);
 function learn(p,id){if(!hasSkill(p,id))p.skills.push(id)}
 // Opponent timing skill: chance of [PERFECT, GOOD, NORMAL, BAD].
 const profiles={novice:[.08,.27,.4,.25],club:[.12,.33,.37,.18],ace:[.18,.37,.33,.12],master:[.25,.4,.27,.08],legend:[.32,.4,.22,.06]};
 const schoolRival={name:'민수',hp:100,attack:18,material:'colored_paper',kind:'rival',skill:'novice'};
 function fighter(o){const item=items[o.material]||items.newspaper;return{hp:o.hp,attack:o.attack,strength:o.strength??baseStrength,defense:o.defense??item.defense,stability:o.stability??item.stability,profile:profiles[o.skill]||profiles.club,skills:Array.isArray(o.skills)?o.skills:[]}}
 // The refinery opens after the province title (spec 05 §2-3); forms bought earlier stay usable.
 const refineryOpen=p=>p.provinceEntered&&p.provinceRound===3;
 function refineCost(p,form,id=p.equipped){if(!refineryOpen(p)||!p.owned.includes(id)||!Object.hasOwn(forms,form))return null;return p.refining[id].unlocked.includes(form)?0:forms[form].cost}
 function refine(p,form){const price=refineCost(p,form);if(price===null||p.coins<price||formOf(p)===form)return false;const entry=p.refining[p.equipped];p.coins-=price;if(!entry.unlocked.includes(form))entry.unlocked.push(form);entry.active=form;return true}
 const cost=(p,id=p.equipped)=>p.upgrades[id]>=upgradeLimit(p)?null:40+p.upgrades[id]*30;
 function upgrade(p){const price=cost(p);if(price===null||p.coins<price)return false;p.coins-=price;p.upgrades[p.equipped]++;return true}
 function equip(p,id){if(!p.owned.includes(id))return false;p.equipped=id;return true}
 function schoolReward(p){if(p.schoolReward)return false;p.schoolReward=true;p.coins+=80;p.owned.push('colored_paper');return true}
 // Village rewards: R2 adds a 색종이 material, the final adds 머리카락 딱지, 정밀 타격 and the 표창장 keepsake.
 function enterVillage(p){if(!p.schoolReward||!p.map.poster||p.villageEntered)return false;p.villageEntered=true;return true}
 function award(p,round){if(!p.schoolReward||!Number.isInteger(round)||round!==p.round||round<0||round>=3)return false;p.villageEntered=true;p.coins=Math.min(999999,p.coins+opponents[round].prize);p.round++;if(round===1)p.map.materials.colored_paper=Math.min(999,p.map.materials.colored_paper+1);if(p.round===3){if(!p.owned.includes('hair'))p.owned.push('hair');learn(p,'precise');if(!p.keepsakes.awardUsed)p.keepsakes.award=true}return true}
 function train(p,grades){if(grades.length!==3||grades.some(g=>!timingGrades.includes(g)))return false;p.xp=Math.min(trainingLimit(p),p.xp+1);p.coins=Math.min(999999,p.coins+5);return true}
 function enterCity(p){if(p.round!==3||p.cityEntered)return false;p.cityEntered=true;return true}
 function awardCity(p,round){if(!p.cityEntered||p.round!==3||!Number.isInteger(round)||round!==p.cityRound||round<0||round>=cityOpponents.length)return false;p.coins=Math.min(999999,p.coins+cityOpponents[round].prize);p.cityRound++;learn(p,'smash');grantTrophy(p,'city',round);return true}
 function enterProvince(p){if(!p.cityEntered||p.cityRound!==3||p.provinceEntered)return false;p.provinceEntered=true;return true}
 function awardProvince(p,round){if(!p.provinceEntered||p.cityRound!==3||!Number.isInteger(round)||round!==p.provinceRound||round<0||round>=provinceOpponents.length)return false;p.coins=Math.min(999999,p.coins+provinceOpponents[round].prize);p.provinceRound++;learn(p,'press');grantTrophy(p,'province',round);return true}
 function enterNational(p){if(!p.provinceEntered||p.provinceRound!==3||p.nationalEntered)return false;p.nationalEntered=true;return true}
 function awardNational(p,round){if(!p.nationalEntered||p.provinceRound!==3||!Number.isInteger(round)||round!==p.nationalRound||round<0||round>=nationalOpponents.length)return false;p.coins=Math.min(999999,p.coins+nationalOpponents[round].prize);p.nationalRound++;grantTrophy(p,'national',round);return true}
 function enterTier(p,id){const tier=tiers[id];if(!tier||!cleared(p,tier.after)||p[`${id}Entered`])return false;p[`${id}Entered`]=true;return true}
 function awardTier(p,id,round){const tier=tiers[id];if(!tier||!p[`${id}Entered`]||!cleared(p,tier.after)||!Number.isInteger(round)||round!==p[`${id}Round`]||round<0||round>=3)return false;p.coins=Math.min(999999,p.coins+tier.opponents[round].prize);p[`${id}Round`]++;grantTrophy(p,id,round);return true}
 // The fusion machine melts the three base ttakji into one, keeping their average compression.
 // Spec 05 §2-3: the fusion machine opens with the national title.
 const fusionCost=1500,canFuse=p=>fusionOpen(p)&&!p.owned.includes('fusion')&&['newspaper','colored_paper','hair'].every(id=>p.owned.includes(id));
 function fuse(p){if(!canFuse(p)||p.coins<fusionCost)return false;p.coins-=fusionCost;p.owned.push('fusion');p.upgrades.fusion=Math.min(upgradeLimit(p),Math.floor((p.upgrades.newspaper+p.upgrades.colored_paper+p.upgrades.hair)/3));return true}
 // Common tournament registry (spec 05 §4, §12). Screens read only this data, so later stages plug in by adding an entry.
 // {id, stage, name, venue, field: profile key holding the next match index, opponents: match data, condition: locked text,
 //  open(p): may register, entered(p), enter(p), award(p,i): first-clear rewards (pays only the next match),
 //  firstReward: select-screen summary, others: four extra entrants that fill the 8-slot bracket}
 const repeatRate=.2,entrant=(name,material)=>({name,material});
 // sideAfter: the other entrants' matches of a round are revealed only after the player's own match of that round
 // (national: 도윤 loses to the 공인 딱지 선수 in a separate scene; continent: 도윤 is knocked out elsewhere).
 const tournaments=[
  {id:'village',stage:'마을 대회',name:'주민센터 컵',venue:'주민센터 앞 광장',field:'round',opponents,condition:'학교 재대결 승리 후 학교 앞 포스터 확인',open:p=>p.schoolReward&&p.map.poster,entered:p=>p.villageEntered,enter:p=>enterVillage(p),award:(p,i)=>award(p,i),firstReward:'150원 · 정밀 타격 · 머리카락 딱지 · 표창장 · 시 대회 참가권',others:[entrant('세탁소 사장님','wet_newspaper'),entrant('경비 아저씨','workbook'),entrant('분식집 이모','ragged'),entrant('반장 지우','mock_exam')]},
  {id:'city',stage:'시 대회',name:'지존시 딱지 대회',venue:'학교 체육관',field:'cityRound',opponents:cityOpponents,condition:'마을 대회 우승',open:p=>p.round===3,entered:p=>p.cityEntered,enter:p=>enterCity(p),award:(p,i)=>awardCity(p,i),firstReward:'300원 · 도 대회 참가권',others:[entrant('수학학원 민재','workbook'),entrant('태권도장 서아','tape'),entrant('편의점 형','socks'),entrant('옆 학교 회장','couple_gum')]},
  {id:'province',stage:'도 대회',name:'압축 챔피언십',venue:'시립 경기장',field:'provinceRound',opponents:provinceOpponents,condition:'시 대회 우승',open:p=>p.cityEntered&&p.cityRound===3,entered:p=>p.provinceEntered,enter:p=>enterProvince(p),award:(p,i)=>awardProvince(p,i),firstReward:'600원 · 제련소 해금 · 전국 대회 참가권',others:[entrant('두께왕 민철','blanket'),entrant('무게파 소희','curtain'),entrant('압축 동호회장','rubber'),entrant('공장 견학생 태오','uniform')]},
  {id:'national',stage:'전국 대회',name:'전국 딱지 선수권',venue:'대형 실내 체육관',field:'nationalRound',opponents:nationalOpponents,condition:'도 대회 우승',open:p=>p.provinceEntered&&p.provinceRound===3,entered:p=>p.nationalEntered,enter:p=>enterNational(p),award:(p,i)=>awardNational(p,i),firstReward:'1200원 · 융합기 해금 · 대륙 대회 참가권',sideAfter:true,others:[entrant('도윤','accordion_folder'),entrant('방송반 지수','workbook'),entrant('해설위원 아들 준호','clothes'),entrant('전국 2위 강산','kimchi_pancake')]},
  ...[['continent','대륙 대회','접기의 축제','국제 전시장','전국 대회 우승','2500원 · 세계 대회 참가권',true,[entrant('사막 돌풍','glass'),entrant('빙판 장인','quartz'),entrant('절대 뒤집히지 않는 자','iron'),entrant('도윤','accordion_folder')]],
   ['world','세계 대회','세계 딱지 선수권','원형 경기장','대륙 대회 우승','5000원 · 세계 우승 트로피 · 행성 교류전 초대장',false,[entrant('무대 위 쇼맨','fish_and_chips'),entrant('종이 건축가','semiconductor'),entrant('빙판 장인','quartz'),entrant('사막 돌풍','glass')]],
   ['planet','행성 대회','우주 딱지 교류전','우주 정거장','세계 대회 우승','10000원 · 교류전 우승 장식',false,[entrant('화성 대표','robot'),entrant('달 기지 선수','robot'),entrant('토성 고리 장인','magic_carpet'),entrant('혜성 소년','liquid')]]
  ].map(([id,stage,name,venue,condition,firstReward,sideAfter,others])=>({id,stage,name,venue,field:`${id}Round`,opponents:tiers[id].opponents,condition,open:p=>cleared(p,tiers[id].after),entered:p=>!!p[`${id}Entered`],enter:p=>enterTier(p,id),award:(p,i)=>awardTier(p,id,i),firstReward,sideAfter,others}))
 ];
 const tournament=id=>tournaments.find(t=>t.id===id);
 const tournamentWon=(p,id)=>{const t=tournament(id);return !!t&&t.entered(p)&&p[t.field]===t.opponents.length};
 const repeatPrize=(id,i)=>{const o=tournament(id)?.opponents[i];return o?Math.max(1,Math.round(o.prize*repeatRate)):0};
 // Every tournament result passes here. A first clear runs the stage's award, which only pays the next unplayed match,
 // so a repeated call cannot pay twice. After the title any match can be replayed as 자유 경기 for the smaller repeat prize.
 function completeMatch(p,id,index,replay=false){
  const t=tournament(id);if(!t||!Number.isInteger(index)||index<0||index>=t.opponents.length||!t.entered(p))return null;
  if(replay){if(!tournamentWon(p,id))return null;const coins=repeatPrize(id,index);p.coins=Math.min(999999,p.coins+coins);return {first:false,coins,items:[],skills:[],materials:{},unlocks:[]}}
  const before={coins:p.coins,owned:[...p.owned],skills:[...p.skills],materials:{...p.map.materials}};
  if(!t.award(p,index))return null;
  const materials={};for(const [k,v] of Object.entries(p.map.materials))if(v>before.materials[k])materials[k]=v-before.materials[k];
  return {first:true,coins:p.coins-before.coins,items:p.owned.filter(x=>!before.owned.includes(x)),skills:p.skills.filter(x=>!before.skills.includes(x)),materials,unlocks:t.opponents[index].unlocks||[]};
 }
 // Eight-slot bracket: slot 0 is the player and the scripted rivals win their side matches, so the story order always holds.
 function bracket(p,id){
  const t=tournament(id);if(!t?.others||t.opponents.length!==3)return null;
  const o=t.opponents,[a,b,c,d]=t.others,done=p[t.field];
  const side=(x,y,r)=>({a:x.name,b:y.name,winner:x.name,player:false,status:(t.sideAfter?r<done:r<=done)?'done':'later',method:(x.name.length+y.name.length+r)%2?'뒤집기':'판정승'});
  const me=r=>({a:'player',b:o[r].name,winner:r<done?'player':null,player:true,status:r<done?'won':r===done?'next':'later'});
  return [{title:o[0].title,matches:[me(0),side(o[1],a,0),side(o[2],b,0),side(c,d,0)]},{title:o[1].title,matches:[me(1),side(o[2],c,1)]},{title:o[2].title,matches:[me(2)]}];
 }
 // Titles won so far (house trophies, community-center banners) and the one-time 공인 딱지 offer / ending flag.
 const titles=p=>tournaments.filter(t=>tournamentWon(p,t.id)).map(t=>t.id);
 function takeOfficial(p){if(!p.nationalEntered||p.story.official)return false;p.story.official=true;if(!p.owned.includes('official')){p.owned.push('official');p.upgrades.official=0}return true}
 function finishEnding(p){if(!cleared(p,'planet')||p.story.ending)return false;p.story.ending=true;return true}
 // One-time story events: Doyun returns the original ttakji before the first city match; the 표창장 may be folded once.
 function reunion(p){if(!p.cityEntered||p.story.reunion)return false;p.story.reunion=true;if(!p.owned.includes('first_newspaper')){p.owned.push('first_newspaper');p.upgrades.first_newspaper=0}return true}
 function craftAward(p){if(!p.keepsakes.award||p.keepsakes.awardUsed)return false;p.keepsakes.award=false;p.keepsakes.awardUsed=true;if(!p.owned.includes('award_ttakji')){p.owned.push('award_ttakji');p.upgrades.award_ttakji=0}return true}
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
 // 이규격's moves: one fixed seven-step table, so the order never settles into a short, easy cycle.
 const regulatorMoves=['guard','strike','guard','open','strike','plain','open'];
 function intent(kind,turn,state={}){
  if(kind==='boxer')return {defending:turn%2===1,weak:turn%4===0,exposed:turn%4===0,perfect:false,pierce:false};
  if(kind==='compressed')return {defending:turn%3===1,perfect:turn%3===0,exposed:turn%3===0,pierce:false};
  if(kind==='timing')return {defending:turn%4===1,skill:turn%4===2?'precise':null,perfect:turn%4===2,weak:turn%4===0,exposed:turn%4===0,pierce:false};
  if(kind==='mender')return {defending:turn%2===0,perfect:false,pierce:false};
  if(kind==='official')return {defending:turn%3===1,perfect:turn%3===2,weak:turn%3===0,exposed:turn%3===0,pierce:false};
  if(kind==='regulator'){const m=regulatorMoves[(turn-1)%regulatorMoves.length];return {defending:m==='guard',perfect:m==='strike',weak:m==='open',exposed:m==='open',pierce:false}}
  if(kind==='endurance')return {defending:turn%2===1,weak:turn%4===0,exposed:turn%4===0,perfect:false,pierce:false};
  if(kind==='striker')return {defending:false,perfect:turn%2===0,exposed:turn%2===0,weak:false,pierce:false};
  if(kind==='reverse')return {perfect:turn%4===1,defending:turn%4===2,weak:turn%4===0,exposed:turn%4===0,pierce:false};
  if(kind==='glass')return {defending:turn%3===1,pierce:true,weak:turn%3===0,exposed:turn%3===0,perfect:false};
  if(kind==='federation')return {defending:turn%4===1,perfect:turn%4===2,weak:turn%4===0,exposed:turn%4===0,pierce:false};
  // 한결/무중: behind on HP → guard (every other turn); otherwise a strong turn every third, then an opening.
  if(kind==='situational'){const behind=(state.self??1)<(state.other??1)-.15;return {defending:behind&&turn%2===1,perfect:!behind&&turn%3===2,weak:turn%3===0,exposed:turn%3===0,pierce:false}}
  if(kind==='triangle')return {defending:turn%3===1,weak:turn%3===0,exposed:turn%3===0,perfect:false,pierce:false};
  if(kind==='sparkle')return {defending:false,perfect:turn%3!==0,weak:turn%3===0,exposed:turn%3===0,pierce:false};
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
  if(kind==='examinee')return {defending:turn%2===1,weak:turn%2===1,perfect:false,pierce:false};
  if(kind==='doyun')return {defending:turn%3===1,skill:turn%3===2?'precise':null,perfect:turn%3===0,pierce:false};
  const defending=(kind==='friend'&&turn%2===0)||(kind==='folder'&&turn%2===1)||(kind==='boss'&&turn%3===1);
  const perfect=(kind==='uncle'&&turn%3===0)||(kind==='sprinter'&&turn%2===0)||(kind==='boss'&&turn%3===0);
  return {defending,perfect,pierce:kind==='folder'};
 }
 // Scripted stances scale the player's hit: guarding halves it (only PERFECT breaks a piercing guard), an opening takes ×1.5.
 // The announced intent for this turn, with per-opponent rules: steady opponents drop their scripted strong turn at low HP.
 function foeIntent(o,turn,state={}){const base=intent(o?.kind,turn,state);if(o?.steady&&(state.self??1)<.35)return {...base,perfect:false,skill:null};return o?.hidden?{...base,hidden:true}:base}
 // Opponent move for one turn (pure, shared by the game and the balance simulation). state = {turn, self, other, heals, lastHeal}:
 // self/other are the opponent's and the player's HP ratios. 꾹 눌러 펴기 is used below healAt (default 35%), up to `heals` times,
 // three turns apart; 강타 goes on scripted strong turns and 정밀 타격 when the player is worn.
 function plan(o,foe,cool,intended,state,roll){
  const can=id=>foe.skills.includes(id)&&Rules.canUse(cool,id),heals=o?.heals||1;
  if(foe.skills.includes('press')&&(state.heals||0)<heals&&state.self<(o?.healAt||.35)&&(state.lastHeal==null||state.turn-state.lastHeal>=3))return {grade:null,skill:'press'};
  const scripted=intended.skill&&can(intended.skill)?intended.skill:null,calm=state.turn===1&&o?.calmStart;
  const skill=calm?null:scripted||(can('smash')&&intended.perfect?'smash':!intended.weak&&can('precise')&&state.other<=.5?'precise':null);
  return {grade:intended.perfect?'PERFECT':intended.weak?'BAD':Rules.draw(foe.profile,roll),skill};
 }
 const stance=(intent,grade)=>(intent.defending&&!(intent.pierce&&grade==='PERFECT')?.5:1)*(intent.exposed?1.5:1);
 const api={titles,takeOfficial,finishEnding,foeIntent,plan,fusionOpen,stageIds,regulatorMoves,shopStock,buy,takeTrophy,earned,achievements,claimable,claim,tiers,continentOpponents,worldOpponents,planetOpponents,enterTier,awardTier,fusionCost,canFuse,fuse,nationalOpponents,enterNational,awardNational,stance,press,nextStats,earnedSkills,hasSkill,profiles,schoolRival,fighter,provinceOpponents,enterProvince,awardProvince,forms,formOf,refineCost,refine,refineryOpen,items,tournaments,tournament,tournamentWon,repeatRate,repeatPrize,completeMatch,bracket,enterVillage,reunion,craftAward,sanitizeName,DEFAULT_NAME,NAME_MAX,phases,opponents,cityOpponents,upgradeLimit,trainingLimit,enterCity,awardCity,intent,fresh,restore,level,stats,cost,upgrade,equip,schoolReward,award,train};
 if(typeof module!=='undefined')module.exports=api;else root.TtakjiProgression=api;
})(globalThis);
