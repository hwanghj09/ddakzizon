const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../minimum-rules.js');

test('minimum timing uses all four displayed grades and the proposed damage formula',()=>{
 for(const [position,grade,damage] of [[.5,'PERFECT',26],[.35,'GOOD',22],[.2,'NORMAL',20],[0,'MISS',12]]){
  assert.equal(M.judge(position),grade);assert.equal(M.damage(grade),damage);
 }
 assert.equal(M.damage('MISS',{attack:0},0,{defense:100}),1);
});
test('flip chance follows HP/stability, clamps at 5–75%, and guarantees a flip at zero HP',()=>{
 assert.equal(M.flipChance(100),.05);assert(Math.abs(M.flipChance(50)-.35)<1e-12);
 assert(Math.abs(M.flipChance(10)-.59)<1e-12);assert.equal(M.flipChance(100,100,100),.05);
 assert.equal(M.flipChance(1,100,-100),.75);assert.equal(M.flipChance(0),1);
 assert.deepEqual(M.hit(20,'GOOD',.999),{damage:22,hp:0,flipped:true});
 assert.equal(M.hit(100,'MISS',.1).flipped,true);
 assert.equal(M.hit(100,'MISS',.999).flipped,false);
 assert.equal(M.hit(100,'GOOD',.999,M.config.tile,10).damage,29);
});
test('story events advance in order once and cannot skip prerequisites or replay registration',()=>{
 const p=M.fresh();assert.equal(M.advance(p,'registered'),false);
 assert.equal(M.owned(p),true);
 for(const stage of M.stages.slice(1)){
  assert.equal(M.advance(p,stage),true);assert.equal(M.advance(p,stage),false);
  assert.equal(M.owned(p),stage!=='lost');
 }
 assert.equal(p.stage,'registered');
});
test('minimum saves validate version/stage, sanitize positions and stay independent of campaign data',()=>{
 assert.equal(M.restore(null),null);assert.equal(M.restore({version:3,stage:'won'}),null);
 assert.equal(M.restore({version:1,stage:'broken'}),null);
 const restored=M.restore({version:1,stage:'crafted',zone:'planet',x:Infinity,visited:{home:true,planet:true},coins:9999});
 assert.equal(restored.zone,'yard');assert.equal(restored.x,180);assert.equal(restored.visited.home,true);
 assert.equal(restored.visited.planet,undefined);assert.equal(restored.coins,undefined);
 assert.equal(M.restore({version:1,stage:'lost',zone:'home',x:999999}).x,1235);
 assert.equal(M.restore({version:1,stage:'lost',zone:'home',x:-10}).x,45);
 for(const stage of M.stages){const p=M.fresh();p.stage=stage;assert.deepEqual(M.restore(JSON.parse(JSON.stringify(p))),p)}
});
