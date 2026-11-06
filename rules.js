/* Shared fair combat rules (spec 03 §2). Intro defeat is deliberately handled by the intro event only. */
(function(root){
 const grades=['PERFECT','GOOD','NORMAL','BAD'];
 const labels={PERFECT:'완벽',GOOD:'좋음',NORMAL:'보통',BAD:'약한 타격'};
 const timing={PERFECT:1.3,GOOD:1.1,NORMAL:1,BAD:.6};
 const skills={
  precise:{name:'정밀 타격',key:'R',damage:.8,flip:.15,cooldown:3},
  smash:{name:'강타',key:'C',damage:1.4,zone:.6,cooldown:3},
  press:{name:'꾹 눌러 펴기',key:'F',heal:.15,once:true}
 };
 // Half-widths around the gauge center. Focus widens every zone (up to +50%); 강타 narrows them.
 const base={perfect:.05,good:.12,normal:.24},focusWiden=.025,maxWiden=.5;
 const zones=(focus=0,smash=false)=>{const k=(1+Math.min(maxWiden,Math.max(0,focus)*focusWiden))*(smash?skills.smash.zone:1);return {perfect:base.perfect*k,good:base.good*k,normal:Math.min(.5,base.normal*k)}};
 const judge=(position,z=zones())=>{const d=Math.abs(position-.5);return d<=z.perfect?'PERFECT':d<=z.good?'GOOD':d<=z.normal?'NORMAL':'BAD'};
 const positionAt=(elapsed,duration=1500)=>{const t=((elapsed%duration)+duration)%duration/duration;return t<.5?t*2:(1-t)*2};
 // pace halves every hit for both sides so a match lasts several exchanges (finals ≈ 4 turns instead of ≈ 2) and skills come off cooldown.
 const pace=.5;
 const damage=(attacker,defender,grade,multiplier=1)=>Math.max(1,Math.round((attacker.attack+(attacker.strength||0)-(defender.defense||0)*.5)*timing[grade]*multiplier*pace));
 const hit=(hp,amount)=>Math.max(0,hp-amount);
 const heal=(hp,max,ratio=skills.press.heal)=>Math.min(max,hp+Math.round(max*ratio));
 // 7% + 60% × (lost HP)^1.5 − stability × 0.5%p + skill bonus, clamped to 3..75%. The curve stays low while a ttakji is
 // healthy and climbs as it wears down, so early lucky flips are rare. HP 0 always flips.
 const flipChance=(hp,max,stability=0,bonus=0)=>{if(hp<=0)return 1;const lost=1-Math.max(0,Math.min(1,hp/max)),raw=.07+.6*Math.pow(lost,1.5)-stability*.005+bonus;return Math.round(Math.max(.03,Math.min(.75,raw))*1000)/1000};
 // Opponent timing comes from a distribution [PERFECT, GOOD, NORMAL, BAD].
 const draw=(dist,roll)=>{let sum=0;for(let i=0;i<grades.length;i++){sum+=dist[i]||0;if(roll<sum)return grades[i]}return 'BAD'};
 const cooldowns=()=>({precise:0,smash:0,press:0});
 const canUse=(c,id)=>Object.hasOwn(skills,id)&&c[id]===0;
 const use=(c,id)=>{if(!canUse(c,id))return false;c[id]=skills[id].once?-1:skills[id].cooldown;return true};
 const tick=c=>{for(const id of Object.keys(skills))if(c[id]>0)c[id]--;return c};
 const rules={grades,labels,timing,skills,pace,zones,judge,positionAt,damage,hit,heal,flipChance,draw,cooldowns,canUse,use,tick};
 if(typeof module!=='undefined')module.exports=rules;else root.TtakjiRules=rules;
})(globalThis);
