/* Minimum playable version: provisional design data and save rules, without DOM. */
(function(root){
 'use strict';
 const stages=['school','lost','crafted','practiced','won','poster','registered'];
 const zones={yard:1600,schoolfront:1400,center:1800,lobby:1280,square:2200,alley:1800,home:1280};
 const config={
  tile:{hp:100,attack:20,defense:8,stability:10},
  player:{strength:4},enemy:{name:'민수',strength:4,grade:'GOOD'},
  timing:{duration:1800,perfect:.07,good:.20,normal:.35},
  multipliers:{PERFECT:1.3,GOOD:1.1,NORMAL:1,MISS:.6},
  labels:{PERFECT:'완벽',GOOD:'좋음',NORMAL:'보통',MISS:'빗나감'},
  bracket:[['1회전','나 vs 앞집 아저씨'],['1회전','유치원 친구 vs 마을 선수'],['결승','1회전 승자끼리 대결']]
 };
 function fresh(){return {version:1,stage:'school',zone:'yard',x:180,visited:{yard:true},guidance:true}}
 function restore(raw){
  if(!raw||raw.version!==1||!stages.includes(raw.stage))return null;
  const p=fresh();p.stage=raw.stage;p.zone=Object.hasOwn(zones,raw.zone)?raw.zone:'yard';
  p.x=Number.isFinite(raw.x)?Math.max(45,Math.min(zones[p.zone]-45,raw.x)):180;
  p.guidance=raw.guidance!==false;
  for(const zone of Object.keys(zones))if(raw.visited?.[zone]===true)p.visited[zone]=true;
  p.visited[p.zone]=true;return p;
 }
 const atLeast=(p,stage)=>stages.indexOf(p.stage)>=stages.indexOf(stage);
 function advance(p,stage){if(stages.indexOf(stage)!==stages.indexOf(p.stage)+1)return false;p.stage=stage;return true}
 const owned=p=>p.stage==='school'||atLeast(p,'crafted');
 const judge=position=>{const d=Math.abs(position-.5);return d<=config.timing.perfect?'PERFECT':d<=config.timing.good?'GOOD':d<=config.timing.normal?'NORMAL':'MISS'};
 function damage(grade,attacker=config.tile,strength=config.player.strength,defender=config.tile){return Math.max(1,Math.round((attacker.attack+strength-defender.defense*.5)*(config.multipliers[grade]??1)))}
 function flipChance(hp,max=config.tile.hp,stability=config.tile.stability){return hp<=0?1:Math.max(.05,Math.min(.75,.10+.60*(1-hp/max)-stability*.005))}
 function hit(hp,grade,roll=Math.random(),attacker=config.tile,strength=config.player.strength,defender=config.tile){
  const amount=damage(grade,attacker,strength,defender),remaining=Math.max(0,hp-amount),flipped=remaining===0||roll<flipChance(remaining,defender.hp,defender.stability);
  return {damage:amount,hp:remaining,flipped};
 }
 const api={config,stages,zones,fresh,restore,atLeast,advance,owned,judge,damage,flipChance,hit};
 if(typeof module!=='undefined')module.exports=api;else root.MinimumRules=api;
})(globalThis);
