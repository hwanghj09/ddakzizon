const assert=require('node:assert/strict'),{launch}=require('./stage-helpers.cjs'),P=require('../progression.js');
(async()=>{const h=await launch(),{page}=h;try{
 await h.fast();
 const reach=async predicate=>{for(let i=0;i<600;i++){
  if(await page.evaluate(predicate))return;
  const s=await h.state();if(s==='dialogue')await page.locator('#next').click();else if(s==='choice')await page.locator('#follow-friends').click();else await page.waitForTimeout(25)
 }throw Error('Unfinished school scene: '+await h.state())};
 const state=s=>reach(new Function('return G.state==='+JSON.stringify(s)));
 const at=async id=>{await page.evaluate(id=>{G.hero.x=Exploration.objects().find(o=>o.id===id).x;Exploration.interact()},id)};
 const fold=async keys=>{for(const key of keys){await state('folding');await page.locator('#game').focus();await page.keyboard.press(key)}};
 await page.locator('#new-game').click();await page.locator('#hero-name').fill('지존<이>');await page.locator('#name-confirm').click();await state('explore');assert.equal(await page.evaluate(()=>G.profile.name),'지존이');await at('minsu');await state('ready');
 assert.deepEqual(await page.evaluate(()=>[G.hp,G.enemyHp]),[12,12],'The opening rally leaves both on their last hit');
 await page.locator('#attack').click();await state('timing');await page.locator('#strike').click();await h.until(()=>G.animation?.kind==='near-flip');assert.equal(await page.evaluate(()=>G.enemyHp),1);await h.shot('fixed-almost-won.png');
 await reach(()=>G.mapZone==='home'&&G.state==='dialogue'&&G.dialogue[0][0]==='아빠');
 assert.deepEqual(await page.evaluate(()=>[G.hp,G.enemyHp]),[1,1]);assert.equal(await page.evaluate(()=>G.checkpoint),'home');assert(await page.evaluate(()=>G.dialogue.some(l=>l[1].includes('강화'))));await h.shot('fixed-father-lesson.png');
 // Reloading during the lesson preserves the destination and cannot grant the upgrade twice.
 await h.reload();await h.fast();await reach(()=>G.mapZone==='home'&&G.state==='dialogue');assert.equal(await page.evaluate(()=>G.dialogue[0][0]),'아빠');
 await state('folding');await fold(['Digit1','Digit2','Digit3','Digit4']);await state('result');assert.deepEqual(await page.evaluate(()=>[G.foldTry,G.profile.upgrades.newspaper,G.profile.coins]),[0,1,0]);assert(await page.evaluate(()=>G.profile.story.seen.tutorial_upgrade_done));assert.deepEqual(await page.evaluate(()=>{const s=P.stats(G.profile);return [s.attack,s.hp,s.defense]}),[23,110,7]);
 await h.reload();await h.fast();await state('ready');assert.equal(await page.evaluate(()=>G.profile.upgrades.newspaper),1);
 await h.attack();assert.equal(await page.evaluate(()=>G.state),'ready');assert(!await page.evaluate(()=>G.profile.story.seen.practice_sock),'A PERFECT does not hit the sock');await h.attack();await h.attack();await state('result');
 await page.locator('#continue').click();await state('explore');assert.equal(await page.evaluate(()=>G.mapZone),'yard','The school button reaches school');
 await at('minsu');await state('ready');await page.evaluate(()=>G.hp=1);await h.attack('BAD');await state('result');assert.match(await page.locator('#result-text').textContent(),/종료 원인.*뒤집힘/);assert.equal(await page.locator('#result-secondary').textContent(),'집에서 연습');
 await page.locator('#continue').click();await state('ready');await h.win();await state('result');assert.deepEqual(await page.evaluate(()=>[G.profile.coins,G.profile.upgrades.newspaper]),[80,1]);await page.locator('#continue').click();await state('explore');await h.reload();await h.fast();await state('explore');assert.equal(await page.evaluate(()=>G.profile.upgrades.newspaper),1);
 // A genuinely wrong corner still permits retry and completion.
 const legacy=P.fresh();legacy.map.phase='lost';legacy.upgrades.newspaper=1;await h.seed(legacy,'exploration');await h.fast();await state('folding');await fold(['Digit2','Digit2','Digit3','Digit4']);await h.until(()=>G.state==='dialogue');assert.equal(await page.evaluate(()=>G.foldMiss),1);await state('folding');await fold(['Digit1','Digit2','Digit3','Digit4']);await state('result');assert.equal(await page.evaluate(()=>G.profile.upgrades.newspaper),1,'Old +1 saves do not become +2');assert.match(await page.locator('#result-text').textContent(),/이미 배운 첫 강화는 유지/);
 assert.deepEqual(h.errors,[]);console.log('PASS full opening near-loss, fade home, Dad lesson, reload-safe first reinforcement, correct/wrong folds, honest practice grades, school destination, real rematch/retry, old +1 save');
}finally{await h.close()}})().catch(e=>{console.error(e);process.exitCode=1});
