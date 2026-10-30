/* Match simulation for balance checks (spec 05 §7-11). Mirrors game.js: the player hits first, a flip roll follows every hit,
   the opponent moves with P.plan using the intent announced at the start of the player's turn, cooldowns tick on own turns. */
const R=require('../rules.js'),P=require('../progression.js');
// Seeded PRNG so the test is deterministic.
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const gauss=random=>Math.sqrt(-2*Math.log(1-random()))*Math.cos(2*Math.PI*random());
// Typical build when reaching each stage: about three quarters of the compression and training caps on the usual main ttakji.
const builds={province:{item:'hair',upgrades:9,xp:33},national:{item:'hair',upgrades:12,xp:45},continent:{item:'fusion',upgrades:15,xp:57},world:{item:'fusion',upgrades:18,xp:69},planet:{item:'fusion',upgrades:21,xp:78}};
const order=['city','province','national','continent','world','planet'];
// A profile that has won everything before `stage` round `round`, with the typical build.
function profile(stage,round,build=builds[stage]){
 const p=P.fresh();P.schoolReward(p);p.map.poster=true;P.enterVillage(p);for(let i=0;i<3;i++)P.completeMatch(p,'village',i);
 for(const id of order){const t=P.tournament(id);t.enter(p);const last=id===stage?round:3;for(let i=0;i<last;i++)P.completeMatch(p,id,i);if(id===stage)break}
 if(build.item==='fusion'&&!p.owned.includes('fusion')){p.owned.push('fusion');p.upgrades.fusion=0}
 p.equipped=build.item;p.upgrades[build.item]=Math.min(build.upgrades,P.upgradeLimit(p));p.xp=Math.min(build.xp,P.trainingLimit(p));return p;
}
// sigma: spread of the player's stop position around the gauge center (0.09 ≈ an average player at normal gauge speed).
function match(p,o,random,sigma=.09){
 const me=P.stats(p),foe=P.fighter(o),maxHp=me.hp,foeMax=foe.hp,skills=p.skills,cool=R.cooldowns(),foeCool=R.cooldowns();
 const spread=sigma/(o.gaugeScale||1);let hp=maxHp,foeHp=foeMax,heals=0,lastHeal=null;
 const roll=smash=>R.judge(Math.max(0,Math.min(1,.5+gauss(random)*spread)),R.zones(me.concentration,smash));
 for(let turn=1;turn<=80;turn++){
  const intended=P.foeIntent(o,turn,{self:foeHp/foeMax,other:hp/maxHp}),has=id=>skills.includes(id)&&R.canUse(cool,id);
  if(has('press')&&hp/maxHp<.35){R.use(cool,'press');hp=R.heal(hp,maxHp)}
  else{
   // Typical use: 강타 into an opening (or an unguarded turn while the opponent is healthy), 정밀 타격 to finish.
   const skill=has('smash')&&(intended.exposed||!intended.defending&&foeHp/foeMax>.5)?'smash':has('precise')&&foeHp/foeMax<=.5?'precise':null;
   if(skill)R.use(cool,skill);const grade=roll(skill==='smash');
   foeHp=R.hit(foeHp,R.damage(me,foe,grade,(skill?R.skills[skill].damage:1)*P.stance(intended,grade)));
   const chance=R.flipChance(foeHp,foeMax,foe.stability,skill==='precise'?R.skills.precise.flip:0);
   if(foeHp===0||random()<chance)return {win:true,turns:turn};
  }
  R.tick(foeCool);const move=P.plan(o,foe,foeCool,intended,{turn,self:foeHp/foeMax,other:hp/maxHp,heals,lastHeal},random());
  if(move.skill==='press'){R.use(foeCool,'press');foeHp=R.heal(foeHp,foeMax);heals++;lastHeal=turn}
  else{
   if(move.skill)R.use(foeCool,move.skill);hp=R.hit(hp,R.damage(foe,me,move.grade,move.skill?R.skills[move.skill].damage:1));
   const bonus=(move.skill==='precise'?R.skills.precise.flip:0)+(move.grade==='PERFECT'?o.perfectFlip||0:0);
   if(hp===0||random()<R.flipChance(hp,maxHp,me.stability,bonus))return {win:false,turns:turn};
  }
  R.tick(cool);
 }
 return {win:false,turns:80};
}
function rate(stage,round,{runs=4000,seed=7,sigma=.09,build}={}){
 const p=profile(stage,round,build),o=P.tournament(stage).opponents[round],random=rng(seed+round*101);let wins=0,turns=0;
 for(let i=0;i<runs;i++){const r=match(p,o,random,sigma);wins+=r.win;turns+=r.turns}
 return {stage,round,name:o.name,win:wins/runs,turns:turns/runs,player:P.stats(p)};
}
module.exports={rng,builds,profile,match,rate,order};
if(require.main===module){
 for(const sigma of [.06,.09,.13]){console.log(`sigma ${sigma}`);for(const stage of order.slice(1))for(let r=0;r<3;r++){const x=rate(stage,r,{sigma});console.log(`${stage.padEnd(10)} ${x.name.padEnd(10)} win ${(x.win*100).toFixed(1).padStart(5)}%  turns ${x.turns.toFixed(1)}  me hp ${x.player.hp} atk ${x.player.attack} str ${x.player.strength}`)}}
}
