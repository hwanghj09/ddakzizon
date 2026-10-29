const test=require('node:test'),assert=require('node:assert/strict'),J=require('../journey-data.js'),P=require('../progression.js');
test('twenty-one chapters supply forty-two playable activities with usable objectives',()=>{
 assert.equal(J.episodes.length,21);assert.equal(new Set(J.episodes.map(e=>e.id)).size,21);let count=0;
 for(const e of J.episodes){assert.equal(e.steps.length,2);for(const a of e.steps){count++;assert(a.lines.length>=3);assert(a.ending.length>=2);assert(['drill','duel'].includes(a.type));if(a.type==='duel'){assert(a.opponent.hp>0);assert(P.items[a.opponent.material])}else{assert(a.good<=5);assert(a.perfect<=a.good)}}}assert.equal(count,42);
});
test('chapters gate the next match and do not unlock a future region or round',()=>{
 const p=P.fresh();assert.equal(J.available(p,J.byId('village_0')),false);P.schoolReward(p);assert(J.available(p,J.byId('village_0')));assert.equal(J.available(p,J.byId('village_1')),false);assert.equal(J.available(p,J.byId('city_0')),false);assert.equal(J.canCompete(p,'village'),false);
 assert.equal(J.complete(p,'village_0',1,15),false);assert.equal(J.complete(p,'city_0',0,15),false);assert(J.complete(p,'village_0',0,15));assert.equal(J.canCompete(p,'village'),false);p.journey.pending=null;assert(J.complete(p,'village_0',1,15));assert.equal(J.canCompete(p,'village'),false);p.journey.pending=null;assert(J.canCompete(p,'village'));P.award(p,0);assert.equal(J.canCompete(p,'village'),false);
});
test('rewards and pending endings survive reload once without repeating an encounter',()=>{
 let p=P.fresh();P.schoolReward(p);assert(J.complete(p,'village_0',0,15));assert.equal(p.coins,90);assert.equal(p.xp,1);assert.equal(J.complete(p,'village_0',0,15),false);assert.equal(J.complete(p,'village_0',1,15),false);
 p=P.restore(JSON.parse(JSON.stringify(p)));assert.deepEqual(p.journey.pending,{id:'village_0',step:0});assert.equal(p.journey.stages.village_0,1);assert.equal(p.coins,90);p.journey.pending=null;assert(J.complete(p,'village_0',1,15));assert.equal(p.coins,100);assert.equal(p.xp,2);p.journey.pending=null;assert.equal(J.complete(p,'village_0',1,15),false);
});
test('legacy migration keeps tournament wins and makes new stories playable without granting rewards',()=>{
 const p=P.restore({schoolReward:true,round:3,cityEntered:true,cityRound:1,coins:77,xp:2});assert.equal(p.round,3);assert.equal(p.cityRound,1);assert.equal(p.journey.stages.village_2,0);assert.equal(p.journey.stages.city_0,0);assert(J.available(p,J.byId('village_2')));assert.equal(p.journey.stages.city_1,0);assert.equal(p.journey.stages.province_0,0);assert.equal(p.coins,77);assert.equal(p.xp,2);
 const bad=P.restore({...p,journey:{stages:{city_1:-3,city_2:NaN},pending:{id:'hack',step:100}}});assert.equal(bad.journey.stages.city_1,0);assert.equal(bad.journey.stages.city_2,0);assert.equal(bad.journey.pending,null);
});
test('drills require accuracy and duels require the promised skill',()=>{
 const drill=J.byId('village_2').steps[0];assert.equal(J.passed(drill,['GOOD','GOOD','GOOD','BAD','BAD']),false);assert(J.passed(drill,['PERFECT','GOOD','GOOD','BAD','BAD']));assert.equal(J.passed(drill,['PERFECT']),false);
 const duel=J.byId('city_1').steps[0];assert.equal(J.passed(duel,[],{}),false);assert(J.passed(duel,[],{power:true}));
});
