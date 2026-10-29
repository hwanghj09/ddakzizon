const test=require('node:test'),assert=require('node:assert/strict'),P=require('../progression.js');
test('school reward is one-time and funds a useful first upgrade',()=>{const p=P.fresh();assert(P.schoolReward(p));assert.equal(P.schoolReward(p),false);assert.equal(p.coins,80);const before=P.stats(p);assert(P.upgrade(p));assert.equal(p.coins,40);assert.equal(P.stats(p).hp,before.hp+10);assert.equal(P.stats(p).attack,before.attack+3);assert.equal(P.upgrade(p),false);assert.equal(p.coins,40)});
test('equipment stats and upgrades belong to each owned ttakji',()=>{const p=P.fresh();assert.equal(P.equip(p,'hair'),false);P.schoolReward(p);P.upgrade(p);assert(P.equip(p,'colored_paper'));assert.equal(P.stats(p).hp,90);assert.equal(p.upgrades.colored_paper,0);P.equip(p,'newspaper');assert.equal(P.stats(p).hp,120)});
test('tournament awards only current round once and unlocks final reward',()=>{const p=P.fresh();P.schoolReward(p);assert.equal(P.award(p,2),false);assert(P.award(p,0));assert.equal(P.award(p,0),false);assert(P.award(p,1));assert(P.award(p,2));assert.equal(P.award(p,2),false);assert.equal(p.coins,280);assert.equal(p.round,3);assert(p.owned.includes('hair'));assert(p.guardUnlocked)});
test('three completed training sessions grow player, incomplete sessions do not pay',()=>{const p=P.fresh();assert.equal(P.train(p,['PERFECT']),false);for(let i=0;i<3;i++)P.train(p,['BAD','GOOD','PERFECT']);assert.equal(p.coins,15);assert.equal(P.level(p),1);assert.equal(P.stats(p).concentration,1);for(let i=0;i<30;i++)P.train(p,['BAD','BAD','BAD']);assert.equal(p.xp,15);assert.equal(P.level(p),5)});
test('saved profile preserves rewards, equipment and per-item upgrades',()=>{const p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.equip(p,'hair');P.upgrade(p);const loaded=P.restore(JSON.parse(JSON.stringify(p)));assert.deepEqual(loaded.owned,p.owned);assert.equal(loaded.coins,p.coins);assert.equal(loaded.equipped,'hair');assert.equal(P.stats(loaded).hp,135);assert(loaded.guardUnlocked)});
test('invalid saves cannot introduce unknown equipment or impossible levels',()=>{const p=P.restore({coins:-20,xp:Infinity,round:50,equipped:'hack',owned:['hack'],upgrades:{newspaper:100},guardUnlocked:true});assert.equal(p.coins,0);assert.equal(p.xp,0);assert.equal(p.round,0);assert.equal(p.equipped,'newspaper');assert.equal(p.guardUnlocked,false);assert.equal(p.upgrades.newspaper,5)});
test('training and compression improve damage; defensive skill halves incoming damage',()=>{assert.equal(P.damage(40,20),40);assert.equal(P.damage(40,30),60);assert.equal(P.damage(40,30,true),30)});

test('city entry requires village championship and raises growth caps once',()=>{const p=P.fresh();assert.equal(P.enterCity(p),false);P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);assert(P.enterCity(p));assert.equal(P.enterCity(p),false);assert.equal(P.upgradeLimit(p),8);assert.equal(P.trainingLimit(p),30);assert.equal(p.coins,280)});
test('city prizes advance independently and unlock wager once',()=>{const p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);assert.equal(P.awardCity(p,0),false);P.enterCity(p);assert.equal(P.awardCity(p,1),false);assert(P.awardCity(p,0));assert(p.powerUnlocked);assert.equal(P.awardCity(p,0),false);assert(P.awardCity(p,1));assert(P.awardCity(p,2));assert.equal(P.awardCity(p,2),false);assert.equal(p.coins,800);assert.equal(p.cityRound,3);assert.equal(p.round,3)});
test('old saves retain village progress while invalid city fields remain locked',()=>{const p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);delete p.cityEntered;delete p.cityRound;delete p.powerUnlocked;const restored=P.restore(p);assert.equal(restored.round,3);assert.equal(restored.cityRound,0);assert.equal(restored.cityEntered,false);assert.equal(restored.powerUnlocked,false);const invalid=P.restore({schoolReward:true,round:1,cityEntered:true,cityRound:3,powerUnlocked:true});assert.equal(invalid.cityEntered,false);assert.equal(invalid.cityRound,0);assert.equal(invalid.powerUnlocked,false)});
test('city growth persists without exceeding the new caps',()=>{const p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.enterCity(p);p.coins=5000;P.equip(p,'hair');for(let i=0;i<8;i++)assert(P.upgrade(p));assert.equal(P.upgrade(p),false);for(let i=0;i<40;i++)P.train(p,['GOOD','GOOD','GOOD']);const restored=P.restore(JSON.parse(JSON.stringify(p)));assert.equal(restored.upgrades.hair,8);assert.equal(restored.xp,30);assert.equal(P.level(restored),10);assert.equal(P.stats(restored).concentration,11)});
test('opponent intentions repeat on their announced turns',()=>{assert.equal(P.intent('sprinter',1).perfect,false);assert(P.intent('sprinter',2).perfect);assert(P.intent('folder',1).defending);assert(P.intent('folder',1).pierce);assert.equal(P.intent('folder',2).defending,false);assert(P.intent('boss',1).defending);assert.equal(P.intent('boss',2).perfect,false);assert(P.intent('boss',3).perfect);assert(P.intent('boss',4).defending)});
test('wager rewards accuracy but penalizes bad timing',()=>{assert.equal(P.wager('BAD',false),1);assert.equal(P.damage(10,20*P.wager('BAD',true)),5);assert.equal(P.damage(24,20*P.wager('GOOD',true)),36);assert.equal(P.damage(40,20*P.wager('PERFECT',true)),60)});

test('home lesson funds and charges a real upgrade once, including after reload',()=>{let p=P.fresh();assert.equal(P.upgradeAtHome(p),false);assert(P.grantHomeAllowance(p));assert.equal(p.coins,40);assert.equal(P.grantHomeAllowance(p),false);p=P.restore(JSON.parse(JSON.stringify(p)));assert.equal(P.grantHomeAllowance(p),false);const before=P.stats(p);assert(P.upgradeAtHome(p));assert.equal(p.coins,0);assert.equal(p.upgrades.newspaper,1);assert.equal(P.stats(p).attack,before.attack+3);assert.equal(P.stats(p).hp,before.hp+10);p=P.restore(p);assert.equal(P.upgradeAtHome(p),false);assert.equal(P.grantHomeAllowance(p),false);assert.equal(p.coins,0);assert.equal(p.upgrades.newspaper,1)});
test('home practice grows the player once and carries into the school rematch',()=>{const p=P.fresh();assert.equal(P.finishHomePractice(p,['GOOD','GOOD','GOOD']),false);P.grantHomeAllowance(p);P.upgradeAtHome(p);assert.equal(P.finishHomePractice(p,['GOOD']),false);assert(P.finishHomePractice(p,['BAD','GOOD','PERFECT']));assert.equal(p.xp,3);assert.equal(P.stats(p).attack,25);assert.equal(P.stats(p).hp,120);assert.equal(P.stats(p).concentration,1);assert.equal(P.damage(24,P.stats(p).attack),30);const loaded=P.restore(p);assert.equal(P.finishHomePractice(loaded,['GOOD','GOOD','GOOD']),false);assert.equal(loaded.xp,3);assert.equal(loaded.coins,0)});
test('advanced saves do not receive tutorial money and new profiles reset the lesson',()=>{const p=P.fresh();P.schoolReward(p);assert.equal(P.grantHomeAllowance(p),false);assert.equal(P.upgradeAtHome(p),false);assert.equal(p.coins,80);const old=P.restore({schoolReward:true,round:3,coins:200,equipped:'hair'});assert.equal(old.schoolReward,true);assert.equal(old.homeUpgradeDone,false);assert.equal(P.grantHomeAllowance(old),false);assert.equal(P.fresh().homeAllowance,false);assert.equal(P.fresh().homePracticeDone,false)});

test('refining unlocks at the city, charges once per item/form and allows free switching',()=>{
 const p=P.fresh();p.coins=1000;assert.equal(P.refine(p,'striker'),false);assert.equal(P.refineCost(p,'striker'),null);
 P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.enterCity(p);p.coins=180;
 assert(P.refine(p,'striker'));assert.equal(p.coins,90);assert.equal(P.refine(p,'striker'),false);assert.equal(p.coins,90);
 assert.equal(P.stats(p).attack,28);assert.equal(P.stats(p).hp,90);
 assert(P.refine(p,'sturdy'));assert.equal(p.coins,0);assert.equal(P.stats(p).attack,16);assert.equal(P.stats(p).hp,145);
 assert(P.refine(p,'balanced'));assert.equal(P.stats(p).attack,20);assert(P.refine(p,'striker'));assert.equal(p.coins,0);
 P.equip(p,'hair');assert.equal(P.formOf(p),'balanced');assert.equal(P.refineCost(p,'striker'),90);assert.equal(P.refine(p,'striker'),false);
 P.equip(p,'newspaper');assert.equal(P.formOf(p),'striker');assert.equal(P.damage(40,P.stats(p).attack),56);
});
test('refining composes with compression, player growth and per-item persistence',()=>{
 let p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.enterCity(p);P.equip(p,'hair');P.upgrade(p);p.xp=3;
 const before=P.stats(p);assert(P.refine(p,'sturdy'));p=P.restore(JSON.parse(JSON.stringify(p)));
 assert.equal(P.stats(p).attack,before.attack-4);assert.equal(P.stats(p).hp,before.hp+35);assert.equal(P.stats(p).concentration,before.concentration);
 assert.equal(p.upgrades.hair,1);assert.equal(p.coins,150);assert.equal(P.refineCost(p,'sturdy'),0);
 assert(P.refine(p,'balanced'));assert.deepEqual(P.stats(p),before);assert.equal(p.coins,150);
});
test('legacy and malformed saves normalize refining without granting unknown forms',()=>{
 const legacy=P.restore({schoolReward:true,round:3,cityEntered:true});assert.equal(P.formOf(legacy),'balanced');assert.deepEqual(legacy.refining.hair.unlocked,['balanced']);
 const forged={schoolReward:true,round:3,cityEntered:true,refining:{newspaper:{active:'striker',unlocked:['balanced','hack','sturdy','sturdy']},hair:{active:'hack',unlocked:'striker'}}};
 const p=P.restore(forged);assert.equal(P.formOf(p),'balanced');assert.deepEqual(p.refining.newspaper.unlocked,['balanced','sturdy']);assert.equal(P.formOf(p,'hair'),'balanced');
 assert.equal(P.refine(p,'__proto__'),false);assert.equal(P.refineCost(p,'striker','hack'),null);
 const locked=P.restore({...forged,cityEntered:false});assert.deepEqual(locked.refining.newspaper.unlocked,['balanced']);assert.equal(P.formOf(P.fresh()),'balanced');
});

test('province is gated by city championship and keeps three brackets independent',()=>{
 const p=P.fresh();assert.equal(P.enterProvince(p),false);P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.enterCity(p);
 for(let i=0;i<2;i++)P.awardCity(p,i);assert.equal(P.enterProvince(p),false);assert.equal(P.awardProvince(p,0),false);
 P.awardCity(p,2);assert(P.enterProvince(p));assert.equal(P.enterProvince(p),false);const before=p.coins;
 assert.equal(P.awardProvince(p,1),false);assert.equal(P.awardProvince(p,NaN),false);
 for(let i=0;i<3;i++){assert(P.awardProvince(p,i));assert.equal(P.awardProvince(p,i),false)}
 assert.equal(p.coins-before,940);assert.equal(p.round,3);assert.equal(p.cityRound,3);assert.equal(p.provinceRound,3);
});
test('province saves normalize prerequisites and preserve expanded growth and refining',()=>{
 const p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.enterCity(p);for(let i=0;i<3;i++)P.awardCity(p,i);P.enterProvince(p);p.coins=10000;
 P.equip(p,'hair');P.refine(p,'sturdy');for(let i=0;i<12;i++)assert(P.upgrade(p));assert.equal(P.upgrade(p),false);p.xp=45;
 const restored=P.restore(JSON.parse(JSON.stringify(p)));assert.equal(restored.upgrades.hair,12);assert.equal(restored.xp,45);assert.equal(P.level(restored),15);assert.equal(P.stats(restored).hp,280);assert.equal(P.stats(restored).attack,90);assert.equal(P.formOf(restored),'sturdy');
 const invalid=P.restore({...p,cityRound:2,provinceRound:3});assert.equal(invalid.provinceEntered,false);assert.equal(invalid.provinceRound,0);assert.equal(invalid.upgrades.hair,8);assert.equal(invalid.xp,30);
 const legacy=P.restore({...p,provinceEntered:undefined,provinceRound:undefined});assert.equal(legacy.provinceEntered,false);assert.equal(legacy.provinceRound,0);assert.equal(P.fresh().provinceEntered,false);
});
test('province opponents announce deterministic defense and strong/weak counter turns',()=>{
 for(let turn=1;turn<=6;turn++){
  assert(P.intent('wall',turn).defending);assert(P.intent('wall',turn).pierce);
  assert.equal(P.intent('offbeat',turn).perfect,turn%2===1);assert.equal(P.intent('offbeat',turn).weak,turn%2===0);
  assert.equal(P.intent('champion',turn).defending,turn%3===1);assert.equal(P.intent('champion',turn).perfect,turn%3===2);assert.equal(P.intent('champion',turn).weak,turn%3===0);assert.equal(P.intent('champion',turn).pierce,false);
 }
});

test('national entry and one-time rewards require the completed province bracket',()=>{
 const p=P.fresh();assert.equal(P.enterNational(p),false);P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.enterCity(p);for(let i=0;i<3;i++)P.awardCity(p,i);P.enterProvince(p);
 for(let i=0;i<2;i++)P.awardProvince(p,i);assert.equal(P.enterNational(p),false);assert.equal(P.awardNational(p,0),false);P.awardProvince(p,2);assert(P.enterNational(p));assert.equal(P.enterNational(p),false);
 const before=p.coins;assert.equal(P.awardNational(p,2),false);assert.equal(P.awardNational(p,NaN),false);for(let i=0;i<3;i++){assert(P.awardNational(p,i));assert.equal(P.awardNational(p,i),false)}
 assert.equal(p.coins-before,1550);assert.equal(p.provinceRound,3);assert.equal(p.nationalRound,3);
});
test('national saves preserve equipment and expanded caps while normalizing premature entry',()=>{
 const raw={schoolReward:true,round:3,cityEntered:true,cityRound:3,provinceEntered:true,provinceRound:3,nationalEntered:true,nationalRound:2,xp:100,upgrades:{hair:100},equipped:'hair',refining:{hair:{active:'striker',unlocked:['striker']}}};
 const p=P.restore(raw);assert.equal(p.xp,60);assert.equal(p.upgrades.hair,16);assert.equal(P.stats(p).attack,124);assert.equal(P.stats(p).hp,265);assert.equal(p.nationalRound,2);
 const locked=P.restore({...raw,provinceRound:2});assert.equal(locked.nationalEntered,false);assert.equal(locked.nationalRound,0);assert.equal(locked.upgrades.hair,12);assert.equal(locked.xp,45);
 const old=P.restore({...raw,nationalEntered:undefined,nationalRound:undefined});assert.equal(old.nationalEntered,false);assert.equal(P.fresh().nationalRound,0);
});
test('openings compose with timing, wager and defense without leaking into earlier opponents',()=>{
 const normal=P.intent('charger',1),opening=P.intent('charger',2);assert(normal.defending&&normal.weak);assert(opening.exposed&&opening.perfect);
 assert.equal(P.damage(24,66*P.openingMultiplier(normal),normal.defending),40);
 assert.equal(P.damage(40,66*P.wager('PERFECT',true)*P.openingMultiplier(opening)),297);
 assert.equal(P.damage(10,66*P.wager('BAD',true)*P.openingMultiplier(opening)),25);
 for(let t=1;t<=8;t++){assert.equal(P.intent('fortress',t).exposed,t%3===0);assert.equal(P.intent('national_champion',t).exposed,t%4===0);assert.equal(P.intent('national_champion',t).perfect,t%4===3);assert.equal(P.openingMultiplier(P.intent('boss',t)),1)}
});
const champion=()=>{const p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.enterCity(p);for(let i=0;i<3;i++)P.awardCity(p,i);P.enterProvince(p);for(let i=0;i<3;i++)P.awardProvince(p,i);P.enterNational(p);for(let i=0;i<3;i++)P.awardNational(p,i);return p};
test('continent, world and planet open in order and pay each round once',()=>{const p=champion();assert.equal(P.enterTier(p,'world'),false);assert(P.enterTier(p,'continent'));assert.equal(P.enterTier(p,'continent'),false);assert.equal(P.upgradeLimit(p),20);assert.equal(P.awardTier(p,'continent',1),false);const before=p.coins;for(let i=0;i<3;i++)assert(P.awardTier(p,'continent',i));assert.equal(p.coins,before+2600);assert(P.enterTier(p,'world'));for(let i=0;i<3;i++)P.awardTier(p,'world',i);assert(P.enterTier(p,'planet'));assert.equal(P.trainingLimit(p),105);assert.equal(P.enterTier(p,'galaxy'),false)});
test('fusion needs the continent and all three base ttakji, and keeps average compression',()=>{const p=champion();p.coins=5000;assert.equal(P.fuse(p),false);P.enterTier(p,'continent');p.upgrades.newspaper=10;p.upgrades.colored_paper=4;p.upgrades.hair=13;assert(P.fuse(p));assert.equal(p.coins,3500);assert.equal(p.upgrades.fusion,9);assert.equal(P.fuse(p),false);P.equip(p,'fusion');assert.equal(P.stats(p).concentration,P.level(p)+1);const restored=P.restore(JSON.parse(JSON.stringify(p)));assert(restored.owned.includes('fusion'));assert.equal(restored.equipped,'fusion');assert.equal(restored.continentRound,0)});
test('saves cannot skip tiers or keep fusion without the continent',()=>{const p=P.restore({schoolReward:true,round:3,continentEntered:true,continentRound:3,worldEntered:true,owned:['newspaper','fusion'],equipped:'fusion'});assert.equal(p.continentEntered,false);assert.equal(p.worldEntered,false);assert.equal(p.owned.includes('fusion'),false);assert.equal(p.equipped,'newspaper')});
test('achievements pay once, only when their goal is met, and survive a reload',()=>{const p=champion();const before=p.coins;assert.equal(P.claim(p,'continent'),false);assert(P.claimable(p).some(a=>a.id==='national'));assert(P.claim(p,'national'));assert.equal(P.claim(p,'national'),false);assert.equal(p.coins,before+500);assert.equal(P.claim(p,'nope'),false);const restored=P.restore(JSON.parse(JSON.stringify(p)));assert.equal(restored.claimed.national,true);assert.equal(P.claim(restored,'national'),false)});
test('beating a rival the first time wins their ttakji, which starts uncompressed',()=>{const p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);P.enterCity(p);assert.equal(P.cityOpponents[0].material,'l_folder');P.awardCity(p,0);assert(p.owned.includes('l_folder'));assert.equal(p.upgrades.l_folder,0);assert.equal(P.takeTrophy(),'l_folder');assert.equal(P.takeTrophy(),null);const restored=P.restore(JSON.parse(JSON.stringify(p)));assert(restored.owned.includes('l_folder'));assert.equal(restored.owned.includes('cardboard'),false)});
test('the shop stocks more ttakji as tiers open and each sells once',()=>{const p=P.fresh();assert.deepEqual(P.shopStock(p),[]);P.schoolReward(p);assert.deepEqual(P.shopStock(p),['wet_newspaper','mock_exam','workbook','ragged']);p.coins=70;assert.equal(P.buy(p,'mock_exam'),false);assert(P.buy(p,'wet_newspaper'));assert.equal(p.coins,10);assert.equal(P.buy(p,'wet_newspaper'),false);assert.equal(P.buy(p,'socks'),false);P.equip(p,'workbook');assert.equal(p.equipped,'newspaper');const restored=P.restore(JSON.parse(JSON.stringify(p)));assert(restored.owned.includes('wet_newspaper'))});
test('saves cannot claim rival or shop ttakji ahead of progress, and focus comes from the item',()=>{const p=P.restore({schoolReward:true,round:3,owned:['newspaper','uranium','socks','wet_newspaper'],equipped:'uranium'});assert.deepEqual(p.owned.filter(id=>['uranium','socks','wet_newspaper'].includes(id)),['wet_newspaper']);assert.equal(p.equipped,'newspaper');assert.equal(P.items.uranium.focus,2);assert(Object.keys(P.items).length>=40)});
