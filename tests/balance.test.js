const test=require('node:test'),assert=require('node:assert/strict'),Sim=require('./balance-sim.cjs');
// Seeded simulation of every province → planet match with a typically upgraded build (≈ 3/4 of the caps, average timing).
// Spec target: finals won about 55–75% of the time; earlier rounds a little easier but never automatic.
test('a typically upgraded player wins each final 55–75% and earlier rounds more often',()=>{
 for(const stage of ['province','national','continent','world','planet']){
  const [r1,sf,final]=[0,1,2].map(r=>Sim.rate(stage,r,{runs:3000}));
  assert(final.win>=.55&&final.win<=.75,`${stage} final ${final.name}: ${final.win}`);
  for(const x of [r1,sf])assert(x.win>=final.win-.02&&x.win<=.9,`${stage} ${x.name}: ${x.win}`);
 }
});
test('practice matters: an untrained, uncompressed build loses the province final more often',()=>{
 const typical=Sim.rate('province',2,{runs:3000}).win,raw=Sim.rate('province',2,{runs:3000,build:{item:'hair',upgrades:0,xp:0}}).win;
 assert(raw<typical-.15,`raw ${raw} vs typical ${typical}`);
});
test('the simulation is deterministic for a seed',()=>{assert.deepEqual(Sim.rate('world',2,{runs:500}),Sim.rate('world',2,{runs:500}))});
