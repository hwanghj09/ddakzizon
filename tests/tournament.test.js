const test=require('node:test'),assert=require('node:assert/strict'),P=require('../progression.js'),S=require('../story-data.js');
const villageReady=()=>{const p=P.fresh();P.schoolReward(p);p.map.poster=true;return p};
const villageChampion=()=>{const p=villageReady();P.enterVillage(p);for(let i=0;i<3;i++)P.completeMatch(p,'village',i);return p};

test('hero name is sanitized to letters, digits and spaces, max 8, with a default',()=>{
 assert.equal(P.sanitizeName('  지존  '),'지존');assert.equal(P.sanitizeName('<b>철수</b>{name}'),'b철수bname');assert.equal(P.sanitizeName('가나다라마바사아자차'),'가나다라마바사아');
 assert.equal(P.sanitizeName('   '),P.DEFAULT_NAME);assert.equal(P.sanitizeName(42),P.DEFAULT_NAME);assert.equal(P.sanitizeName('a   b'),'a b');assert.equal(P.fresh().name,P.DEFAULT_NAME);
});
test('old saves without a name migrate to the default; saved names survive reload',()=>{
 assert.equal(P.restore({schoolReward:true,round:2}).name,P.DEFAULT_NAME);const p=P.fresh();p.name='민준';assert.equal(P.restore(JSON.parse(JSON.stringify(p))).name,'민준');assert.equal(P.restore({name:'<script>'}).name,'script');
});
test('tutorial phases restore in order and v0.11 home-lesson flags map onto them',()=>{
 for(const phase of P.phases){const p=P.fresh();p.map.phase=phase;assert.equal(P.restore(JSON.parse(JSON.stringify(p))).map.phase,phase)}
 assert.equal(P.restore({map:{phase:'lost'},homeUpgradeDone:true,upgrades:{newspaper:1}}).map.phase,'folded');
 assert.equal(P.restore({map:{phase:'lost'},homeUpgradeDone:true,homePracticeDone:true}).map.phase,'rematch');
 assert.equal(P.restore({map:{phase:'school'}}).keepsakes.scrap,false,'The scrap appears only after the prologue loss');assert.equal(P.restore({map:{phase:'lost'}}).keepsakes.scrap,true);
 assert.equal('homeAllowance' in P.fresh(),false,'The paid home upgrade is gone from the tutorial');
});
test('tournament registry: every stage has the common schema; village and city match the spec',()=>{
 assert.deepEqual(P.tournaments.map(t=>t.id),['village','city','province','national','continent','world','planet']);
 for(const t of P.tournaments){for(const k of ['stage','name','venue','field','condition','firstReward'])assert.equal(typeof t[k],'string',`${t.id}.${k}`);for(const f of ['open','entered','enter','award'])assert.equal(typeof t[f],'function');assert.equal(t.opponents.length,3);for(const o of t.opponents){assert(P.items[o.material],o.name);assert(o.prize>0)}}
 const v=P.tournament('village').opponents,c=P.tournament('city').opponents;
 assert.deepEqual(v.map(o=>[o.name,o.material,o.prize]),[['앞집 아저씨','cardboard',50],['하나','colored_paper',70],['박태풍','hair',150]]);
 assert(P.fighter(v[0]).defense>P.fighter(v[1]).defense&&v[0].attack<v[1].attack,'앞집 아저씨: high defense, low attack');assert(v[2].calmStart&&v[2].perfectFlip>0,'박태풍: no opening skill, strong flip on good timing');
 assert.deepEqual(c.map(o=>[o.name,o.material,o.prize]),[['서준','l_folder',100],['한별','mock_exam',120],['도윤','accordion_folder',300]]);
 assert(P.fighter(c[0]).stability<P.fighter(c[1]).stability&&c[0].attack>c[1].attack,'서준: high attack, low stability');
 for(let t=1;t<=6;t++){assert.equal(P.intent('examinee',t).defending,t%2===1,'한별 alternates defend/attack');assert.equal(P.intent('doyun',t).skill,t%3===2?'precise':null,'도윤 mixes in 정밀 타격')}
 for(const t of P.tournaments.slice(0,2))for(const o of t.opponents)assert(o.hint.length>10,'Bracket shows a 성향 hint');
});
test('registration needs the poster; first-clear rewards pay exactly once and progress keeps the last win',()=>{
 const p=P.fresh();P.schoolReward(p);assert.equal(P.tournament('village').open(p),false);assert.equal(P.enterVillage(p),false);assert.equal(P.completeMatch(p,'village',0),null);
 p.map.poster=true;assert(P.enterVillage(p));assert.equal(P.enterVillage(p),false);
 assert.equal(P.completeMatch(p,'village',1),null,'Cannot skip ahead');const first=P.completeMatch(p,'village',0);assert.equal(first.first,true);assert.equal(first.coins,50);assert.deepEqual(first.unlocks,['광장 압축기 안내 (강화는 선택)']);
 assert.equal(P.completeMatch(p,'village',0),null,'Same match twice pays nothing');assert.equal(p.coins,130);assert.equal(p.round,1);
 const reloaded=P.restore(JSON.parse(JSON.stringify(p)));assert.equal(reloaded.round,1);assert.equal(reloaded.villageEntered,true);assert.equal(P.completeMatch(reloaded,'village',0),null);
 const second=P.completeMatch(reloaded,'village',1);assert.deepEqual(second.materials,{colored_paper:1});const final=P.completeMatch(reloaded,'village',2);assert.deepEqual(final.items,['hair']);assert.deepEqual(final.skills,['precise']);assert.equal(final.coins,150);
 assert(P.tournamentWon(reloaded,'village'));
});
test('free replays after the title pay the smaller repeat prize and never repeat first rewards',()=>{
 const p=villageReady();P.enterVillage(p);assert.equal(P.completeMatch(p,'village',0,true),null,'No 자유 경기 before the title');
 for(let i=0;i<3;i++)P.completeMatch(p,'village',i);const coins=p.coins,owned=[...p.owned];
 for(let i=0;i<3;i++){const r=P.completeMatch(p,'village',i,true);assert.equal(r.first,false);assert.equal(r.coins,Math.round(P.tournament('village').opponents[i].prize*P.repeatRate));assert(r.coins<P.tournament('village').opponents[i].prize);assert.deepEqual(r.items,[])}
 assert.equal(p.coins,coins+10+14+30);assert.deepEqual(p.owned,owned);assert.equal(p.round,3);assert.equal(P.repeatPrize('city',2),60);
});
test('the bracket shows the player path and the other entrants\' results without contradicting the story',()=>{
 const p=villageReady();P.enterVillage(p);let b=P.bracket(p,'village');assert.equal(b.length,3);assert.equal(b[0].matches.length,4);assert.equal(b[0].matches[0].status,'next');assert.equal(b[0].matches[0].b,'앞집 아저씨');
 assert(b[0].matches.slice(1).every(m=>m.status==='done'&&m.winner===m.a),'First-round side matches are already decided');assert.equal(b[1].matches[1].status,'later');
 const winners=b[0].matches.slice(1).map(m=>m.winner);assert(winners.includes('하나')&&winners.includes('박태풍'));
 P.completeMatch(p,'village',0);b=P.bracket(p,'village');assert.equal(b[0].matches[0].status,'won');assert.equal(b[1].matches[0].status,'next');assert.equal(b[1].matches[0].b,'하나');assert.equal(b[1].matches[1].winner,'박태풍');
 assert.equal(P.bracket(p,'hack'),null,'Unknown stages have no bracket');
});
test('save keeps the open bracket only for an entered tournament',()=>{
 const p=villageReady();P.enterVillage(p);p.map.tournament='village';assert.equal(P.restore(JSON.parse(JSON.stringify(p))).map.tournament,'village');
 assert.equal(P.restore({...p,map:{...p.map,tournament:'city'}}).map.tournament,null);assert.equal(P.restore({...p,map:{...p.map,tournament:'hack'}}).map.tournament,null);
});
test('Doyun returns the first newspaper ttakji once, before the city matches, and it survives reload',()=>{
 const p=villageChampion();assert.equal(P.reunion(p),false,'Not before the city');P.enterCity(p);assert(P.reunion(p));assert.equal(P.reunion(p),false);assert(p.owned.includes('first_newspaper'));assert.equal(p.owned.filter(x=>x==='first_newspaper').length,1);
 assert(P.equip(p,'first_newspaper'));assert(P.stats(p).hp>0);const r=P.restore(JSON.parse(JSON.stringify(p)));assert(r.story.reunion);assert(r.owned.includes('first_newspaper'));assert.equal(r.equipped,'first_newspaper');
 assert.equal(P.restore({...JSON.parse(JSON.stringify(p)),story:{reunion:false}}).owned.includes('first_newspaper'),false,'The keepsake needs the reunion record');assert.equal(P.items.first_newspaper.sprite,'newspaper');
});
test('the 표창장 is a keepsake that may be folded once into a ttakji; legacy champions receive it',()=>{
 const p=villageChampion();assert.equal(p.keepsakes.award,true);assert(P.craftAward(p));assert.equal(P.craftAward(p),false);assert.equal(p.keepsakes.award,false);assert(p.owned.includes('award_ttakji'));
 const r=P.restore(JSON.parse(JSON.stringify(p)));assert.equal(r.keepsakes.awardUsed,true);assert.equal(r.keepsakes.award,false);assert(r.owned.includes('award_ttakji'));
 assert.equal(P.restore({schoolReward:true,round:3}).keepsakes.award,true);assert.equal(P.restore({schoolReward:true,round:2}).keepsakes.award,false);assert.equal(P.restore({schoolReward:true,round:2,keepsakes:{awardUsed:true}}).owned.includes('award_ttakji'),false);
});
test('story scenes carry the spec lines, use the cast names and only replay titled scenes',()=>{
 const all=Object.values(S.scenes).flatMap(s=>s.lines.map(l=>l.join(' '))).join('\n');
 for(const line of ['이기면 내 딱지 줄게. 대신 지면 네 딱지는 내 거다?','말보다 딱지가 먼저 뒤집히면 좋겠는데.','약속했지? 이 딱지는 이제 내 거!','한 판만 더!','내일. 네가 더 센 딱지를 가져오면.','잃어버리면 곤란하잖아.','그건 딱지야, 종이비행기야?','표적이 조금 움직였나?','지우개는 움직이지 않았다.','신문지면 어제랑 똑같잖아?','신문지는 같아. 접은 사람이 달라졌지.','어제보다 훨씬 납작해졌네. 네 딱지 말이야.','사실 다 들렸어.','한 시간만 연습해라.','크레파스','잘 접은 건 기다려 주거든.','현수막 좀 잡아 주세요!','힘만 세다고 다 뒤집히는 건 아니야.','한 올 한 올','이거… 얼마나 걸렸어요?','묻지 마라.','너라도 도 대회에서 잘해라.','물컵','신문지는 구시대의 유물이야','내 딱지! 왜 가져갔어?','그건 엄마가 적은 거야.','너 한번 세계를 뒤집어보지 않을래?','일단 네 딱지부터 뒤집었는데?','그래서 더 큰 걸 뒤집으러 가자는 거지.','아, 아'])assert(all.includes(line),line);
 assert(!/부하|탈모 아저씨|유치원 친구/.test(all),'Old placeholder names are gone');
 for(const id of S.replayOrder)assert(S.scenes[id]?.title,id);assert.deepEqual(Object.keys(S.introReaction).sort(),['BAD','GOOD','NORMAL','PERFECT']);
});
