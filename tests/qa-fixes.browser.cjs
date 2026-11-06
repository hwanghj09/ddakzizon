const assert=require('node:assert/strict'),{launch,champion}=require('./stage-helpers.cjs'),P=require('../progression.js'),J=require('../journey-data.js');
(async()=>{const h=await launch(),{page}=h;try{
 const p=P.fresh();P.schoolReward(p);p.xp=14;
 await h.seed(p,'village');await h.fast();await h.until(()=>G.state==='explore');
 await page.keyboard.press('KeyJ');await page.locator('.journey-entry').filter({hasText:J.byId('village_0').title}).click();await page.locator('#journey-start').click();await h.dialogue();for(let i=0;i<5;i++)await h.attack();
 assert.equal(await page.evaluate(()=>G.profile.xp),15);assert.match(await page.locator('#result-stats').textContent(),/\+1\s*훈련/);
 await page.locator('#continue').click();await h.dialogue();assert.match(await page.locator('#facility-content').textContent(),/현재 훈련 한도 도달/);await page.locator('#journey-start').click();await h.dialogue();await h.win();
 assert.equal(await page.evaluate(()=>G.profile.xp),15);assert.match(await page.locator('#result-stats').textContent(),/한도 도달/);assert.doesNotMatch(await page.locator('#result-stats').textContent(),/\+1훈련/);
 const coins=await page.evaluate(()=>G.profile.coins);await h.reload();await h.fast();await h.dialogue();assert.equal(await page.evaluate(()=>G.profile.coins),coins);assert.equal(await page.evaluate(()=>G.profile.xp),15);
 // Focus must stay inside the actual scroll viewport, including initial primary focus.
 for(const viewport of [{width:1280,height:720},{width:1024,height:600}]){
  await page.setViewportSize(viewport);await h.seed(champion('province',{item:'piano',upgrades:8,xp:45}),'province');await h.fast();await h.until(()=>G.state==='explore');await h.visit('cup');await page.locator('[data-replay="0"]').click();
  for(let i=0;i<5;i++){
   assert(await page.evaluate(()=>{const el=document.activeElement,c=$('facility-content'),r=el.getBoundingClientRect(),clip=c.getBoundingClientRect();return c.contains(el)?r.top>=clip.top-1&&r.bottom<=clip.bottom+1:r.top>=0&&r.bottom<=innerHeight}),'Focused action is visible '+JSON.stringify(viewport)+' step '+i);
   await page.keyboard.press('ArrowDown');
  }await h.shot(`fixed-prep-${viewport.width}.png`);await page.keyboard.press('KeyE');assert.equal(await h.state(),'explore');
 }
 // Keep the shared rival alias for Minsu, but render the past self as the hero (body and portrait).
 await page.setViewportSize({width:1280,height:720});await page.evaluate(()=>{G.opponent=J.byId('planet_2').steps[1].opponent;battle('story_battle');window.enemyArt=[];const draw=GameArt.actor;GameArt.actor=(...args)=>{if(args[9]==='enemy')enemyArt.push(args[3]);return draw(...args)}});await h.until(()=>enemyArt.includes('hero'));assert(!await page.evaluate(()=>enemyArt.includes('rival')));
 await page.evaluate(()=>say([['그날의 나','한 판만 더!']],()=>{}));assert.equal(await page.locator('#portrait').getAttribute('data-art-character'),'hero');
 // A lucky flip at healthy HP is explained without changing the underlying odds or damage rules.
 await page.evaluate(()=>{cancelScene();G.opponent=P.cityOpponents[2];battle('sparring');foePlan=()=>({grade:'PERFECT',skill:'precise'});Math.random=()=>0;enemyTurn()});await h.until(()=>G.state==='result');assert(await page.evaluate(()=>G.hp>0));assert.match(await page.locator('#result-text').textContent(),/종료 원인.*정밀 타격.*남은 내구/);
 // Existing completed saves retain the ending and all titles after the new home lesson is added.
 const done=champion('planet');P.finishEnding(done);done.journey.stages.continent_2=2;await h.seed(done,'village');await h.fast();await h.until(()=>G.state==='explore');assert(await page.evaluate(()=>G.profile.story.ending));assert.equal(await page.evaluate(()=>P.titles(G.profile).length),7);
 await page.evaluate(()=>{Exploration.enter('home',240);Exploration.interact()});assert.doesNotMatch(await page.locator('#line').getAttribute('aria-label'),/왜 지금은 안/);
 assert.deepEqual(h.errors,[]);console.log('PASS capped XP result and reload, visible initial/arrow focus at 1280 and 1024, past-self body/portrait, healthy-HP flip explanation, completed-save compatibility and updated photo');
}finally{await h.close()}})().catch(e=>{console.error(e);process.exitCode=1});
