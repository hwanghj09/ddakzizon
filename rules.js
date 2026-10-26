/* Shared fair rules. Intro defeat is deliberately handled by the intro event only. */
(function(root){
 const judge=position=>{const d=Math.abs(position-.5);return d<=.07?'PERFECT':d<=.20?'GOOD':'BAD'};
 const damage=grade=>({BAD:10,GOOD:24,PERFECT:40})[grade];
 const positionAt=(elapsed,duration=1500)=>{const t=((elapsed%duration)+duration)%duration/duration;return t<.5?t*2:(1-t)*2};
 const hit=(hp,grade)=>Math.max(0,hp-damage(grade));
 const rules={judge,damage,positionAt,hit};
 if(typeof module!=='undefined')module.exports=rules;else root.TtakjiRules=rules;
})(globalThis);
