/* Shared fair rules. Intro defeat is deliberately handled by the intro event only. */
(function(root){
 const judge=position=>{const d=Math.abs(position-.5);return d<=.07?'PERFECT':d<=.20?'GOOD':'BAD'};
 const damage=grade=>({BAD:10,GOOD:24,PERFECT:40})[grade];
 const positionAt=(elapsed,duration=1500)=>{const t=((elapsed%duration)+duration)%duration/duration;return t<.5?t*2:(1-t)*2};
 const hit=(hp,grade)=>Math.max(0,hp-damage(grade));
 // A worn ttakji hits softer: attack falls to 75% as HP approaches zero.
 const strength=(hp,max)=>.75+.25*Math.max(0,Math.min(1,max>0?hp/max:0));
 // Below 30% HP a hit can flip the ttakji early; lower HP and better timing raise the chance (max 50%).
 const flipChance=(hp,max,grade)=>{if(hp<=0)return 1;const ratio=hp/max;if(ratio>=.3)return 0;return Math.round((.3-ratio)/.3*.5*({BAD:.3,GOOD:.7,PERFECT:1})[grade]*1000)/1000};
 const rules={judge,damage,positionAt,hit,strength,flipChance};
 if(typeof module!=='undefined')module.exports=rules;else root.TtakjiRules=rules;
})(globalThis);
