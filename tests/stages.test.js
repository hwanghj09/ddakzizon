const test=require('node:test'),assert=require('node:assert/strict'),P=require('../progression.js'),R=require('../rules.js'),S=require('../story-data.js');
const order=['village','city','province','national','continent','world','planet'];
// A profile that has won every stage up to and including `last`.
const champion=last=>{const p=P.fresh();P.schoolReward(p);p.map.poster=true;for(const id of order){const t=P.tournament(id);assert(t.enter(p),id);for(let i=0;i<3;i++)assert(P.completeMatch(p,id,i),`${id} ${i}`);if(id===last)break}return p};

test('province → planet opponents, materials and prizes follow spec 05 §7-11',()=>{
 const table=Object.fromEntries(order.slice(2).map(id=>[id,P.tournament(id).opponents.map(o=>[o.name,o.title,o.material,o.prize])]));
 assert.deepEqual(table,{
  province:[['상자왕','1회전','cardboard',200],['최단단','준결승','iron',250],['윤서','결승','piano',600]],
  national:[['테이프 딱지 선수','1회전','tape',400],['공인 딱지 선수','준결승','certificate',500],['이규격','결승','encyclopedia',1200]],
  continent:[['마리','1회전','bread',800],['리오','준결승','copper',1000],['아라','결승','lego',2500]],
  world:[['미라','1회전','glass',1500],['연맹 추천 선수','준결승','semiconductor',2000],['한결','결승','diamond',5000]],
  planet:[['모서리 셋','1회전','quartz',3000],['반짝','준결승','shuriken',4000],['무중','결승','slime',10000]]});
 for(const id of order.slice(2))for(const o of P.tournament(id).opponents){assert(o.hint.length>15,o.name);assert(P.items[o.material],o.name);const d=P.fighter(o).profile;assert(Math.abs(d.reduce((a,b)=>a+b)-1)<1e-9)}
});
test('opponent traits match their descriptions',()=>{
 const [box,hard,yunseo]=P.provinceOpponents,[tape,official,rules]=P.nationalOpponents,[mari,rio]=P.continentOpponents,[mira,fed,hangyeol]=P.worldOpponents,[corner,sparkle,mujung]=P.planetOpponents,f=P.fighter;
 assert(f(hard).defense>f(box).defense&&f(hard).stability<f(yunseo).stability,'최단단: high defense, low stability');assert.equal(f(hard).stability,0);
 assert(yunseo.steady&&yunseo.skills.includes('precise'),'윤서: precise timing, no guaranteed comeback');
 assert(tape.skills.includes('press')&&tape.heals===2,'테이프 딱지 선수 heals');assert(rules.hidden,'이규격 hides the next move');
 assert(mari.stability>rio.stability&&rio.attack>mari.attack,'마리 endures, 리오 hits hard and flips easily');assert(f(rio).stability<=5);
 assert(f(mira).defense>f(fed).defense,'미라 is defensive');for(const o of [hangyeol,mujung])assert.deepEqual(o.skills,['precise','smash','press'],'Situational champions');
 assert(f(corner).stability>=30&&corner.attack<sparkle.attack,'모서리 셋: high stability, low attack');assert(sparkle.gaugeScale<1,'반짝: faster gauge');
});
test('stage intents: steady at low HP, hidden and non-periodic 이규격, situational guard when behind',()=>{
 const yunseo=P.provinceOpponents[2];assert.equal(P.foeIntent(yunseo,2,{self:.9,other:.9}).perfect,true);assert.equal(P.foeIntent(yunseo,2,{self:.2,other:.9}).perfect,false,'No scripted comeback when low');assert.equal(P.foeIntent(yunseo,2,{self:.2}).skill,null);
 const rules=P.nationalOpponents[2],moves=Array.from({length:14},(_,i)=>P.foeIntent(rules,i+1,{}));assert(moves.every(m=>m.hidden));
 const key=m=>m.defending?'g':m.perfect?'s':m.exposed?'o':'p',seq=moves.map(key).join('');for(const n of [1,2,3,4,5,6])assert.notEqual(seq.slice(0,7),seq.slice(n,n+7),`No cycle of ${n}`);assert.equal(seq.slice(0,7),seq.slice(7,14),'Still deterministic');
 const situational=P.worldOpponents[2];assert.equal(P.foeIntent(situational,1,{self:.3,other:.9}).defending,true);assert.equal(P.foeIntent(situational,1,{self:.9,other:.3}).defending,false);assert.equal(P.foeIntent(situational,2,{self:.9,other:.3}).perfect,true);
 assert.equal(P.intent('boxer',4).exposed,true);assert.equal(P.intent('glass',1).pierce,true);assert.equal(P.intent('reverse',1).perfect,true,'아라 opens with the strong turn');
});
test('the shared planner heals up to `heals` times, three turns apart, and never opens with a skill when calm',()=>{
 const tape=P.nationalOpponents[0],foe=P.fighter(tape),cool=R.cooldowns();
 assert.equal(P.plan(tape,foe,cool,{},{turn:1,self:.6,other:1,heals:0},0).skill,null,'Above healAt: attacks');
 assert.equal(P.plan(tape,foe,cool,{},{turn:2,self:.45,other:1,heals:0},0).skill,'press');
 assert.notEqual(P.plan(tape,foe,cool,{},{turn:3,self:.3,other:1,heals:1,lastHeal:2},0).skill,'press','Three turns apart');
 assert.equal(P.plan(tape,foe,cool,{},{turn:5,self:.3,other:1,heals:1,lastHeal:2},0).skill,'press','Second heal');
 assert.notEqual(P.plan(tape,foe,cool,{},{turn:9,self:.1,other:1,heals:2,lastHeal:5},0).skill,'press','Only twice');
 const uncle=P.opponents[2];assert.equal(P.plan(uncle,P.fighter(uncle),R.cooldowns(),{perfect:true},{turn:1,self:1,other:.4},0).skill,null,'박태풍 calm start');
 const hangyeol=P.worldOpponents[2],move=P.plan(hangyeol,P.fighter(hangyeol),R.cooldowns(),{perfect:true},{turn:2,self:.9,other:.9},.5);assert.deepEqual(move,{grade:'PERFECT',skill:'smash'});
});
test('rewards: refinery after the province, fusion after the national, trophies and titles accumulate',()=>{
 const province=champion('province');assert(P.refineryOpen(province));assert.equal(P.fusionOpen(province),false);assert(province.skills.includes('press'));
 for(const id of ['cardboard','iron','piano'])assert(province.owned.includes(id),`${id} trophy`);
 const national=champion('national');assert(P.fusionOpen(national));assert.deepEqual(P.titles(national),['village','city','province','national']);
 const planet=champion('planet');assert.equal(P.titles(planet).length,7);for(const o of [...P.continentOpponents,...P.worldOpponents,...P.planetOpponents])assert(planet.owned.includes(o.material),o.material);
 assert.equal(P.restore(JSON.parse(JSON.stringify(planet))).planetRound,3);
});
test('the 공인 딱지 is optional, free and only offered at the national stage',()=>{
 const province=champion('province');assert.equal(P.takeOfficial(province),false,'Not before the national');
 const p=champion('province');P.tournament('national').enter(p);assert.equal(p.owned.includes('official'),false,'Never forced');const coins=p.coins;
 assert(P.takeOfficial(p));assert.equal(P.takeOfficial(p),false);assert.equal(p.coins,coins,'Free');assert(p.owned.includes('official'));
 const r=P.restore(JSON.parse(JSON.stringify(p)));assert(r.owned.includes('official'));assert.equal(P.restore({...JSON.parse(JSON.stringify(p)),story:{official:false}}).owned.includes('official'),false);
 assert(P.stats(r,'official').attack<P.stats(r,'piano').attack,'Convenient, not stronger than the player\'s own');
});
test('national and continent brackets reveal 도윤\'s loss only after the player\'s own first match',()=>{
 const p=champion('province');P.tournament('national').enter(p);let b=P.bracket(p,'national'),doyun=b[0].matches.find(m=>m.b==='도윤');
 assert.equal(doyun.a,'공인 딱지 선수');assert.equal(doyun.status,'later');P.completeMatch(p,'national',0);b=P.bracket(p,'national');doyun=b[0].matches.find(m=>m.b==='도윤');assert.equal(doyun.status,'done');assert.equal(doyun.winner,'공인 딱지 선수');
 assert.equal(b[1].matches[0].b,'공인 딱지 선수','The player meets the same player in the semifinal');
 const c=champion('national');P.tournament('continent').enter(c);P.completeMatch(c,'continent',0);const lost=P.bracket(c,'continent')[0].matches.find(m=>m.b==='도윤');assert.equal(lost.status,'done');assert.notEqual(lost.winner,'도윤');
 assert(P.bracket(c,'continent')[0].matches.some(m=>m.a==='절대 뒤집히지 않는 자'));
});
test('the ending flag needs the planet title and survives a reload',()=>{
 const world=champion('world');assert.equal(P.finishEnding(world),false);
 const p=champion('planet');assert.equal(p.story.ending,false);assert(P.finishEnding(p));assert.equal(P.finishEnding(p),false);
 assert.equal(P.restore(JSON.parse(JSON.stringify(p))).story.ending,true);assert.equal(P.restore({...JSON.parse(JSON.stringify(p)),planetRound:2}).story.ending,false,'Tampered saves lose it');
});
test('stage and ending scenes carry the spec lines and are in the replay list',()=>{
 const all=Object.values(S.scenes).flatMap(s=>s.lines.map(l=>l.join(' '))).join('\n');
 for(const line of ['내 딱지는 절대 안 뒤집힌다!','무게부터 재겠습니다','좋은 딱지를 믿는 만큼 네 손도 믿어','잘했다. TV에 내 머리 정수리만 나왔다.','무조건 두껍거나 무거운 딱지는 아니다',
  '무료 수리','내가 익숙한 방식을 끝까지 믿지 못했어','접힌 선이 정확히 일치하지 않습니다','허용 오차 이내입니다','오차를 허용한다고요?','틀린 접기인 줄 알았는데, 다른 접기였군요','백지훈',
  '절대 뒤집어지지 않은 감자','절대 뒤집히지 않는 자','지정 소재와 형태만','그럼 내 딱지도 이제 못 쓰는 거야?','처음 널 만났을 때','경기 한 번으로 규정이 자동으로 바뀌지는 않습니다','그렇게 구겨진 걸로 여기까지 왔다고?','구겨진 게 아니라 역사가 접힌 거야.','오늘은 다음 수를 모르겠더라. 오랜만이야.','시험 운영','내가 쟤랑 학교에서 딱지 쳤어!','이겼어?','그건 중요한 게 아니야.',
  '그래서 내가 도 대회에서 잘하라고 했잖아.','도 다음이 행성이에요?','그건 삼각형인데?','우리 행성에서는 딱지가 먼저 생겼다.','다시 한 장만.',
  '어떻게 하면 제일 강한 딱지를 만들어요?','일단 접어 봐. 지면 다시 접고.','그럼 언제 이겨요?','그건 나도 계속 해 보는 중이야.','이제 너랑 끝내지 못한 승부, 한 판 더?','???? 대회','이번엔 내가 나간다.'])assert(all.includes(line),line);
 for(const id of ['province_letter','national_doyun_loss','continent_r1_win','world_r1_win','world_r2_win','world_award','planet_award','ending_yard','ending_rematch','ending_credits','ending_post'])assert(S.replayOrder.includes(id),id);
 for(const id of S.replayOrder)assert(S.scenes[id]?.title,id);assert.equal(new Set(S.replayOrder).size,S.replayOrder.length);
 assert(S.scenes.ending_credits.credits);assert(S.credits.some(([,name])=>name==='{name}'));for(const name of ['민수','도윤','하나','박태풍','백지훈','한결','무중'])assert(S.credits.some(([,n])=>n.includes(name)),name);
 assert(all.includes('{name}'),'Scenes use the hero name');
});
