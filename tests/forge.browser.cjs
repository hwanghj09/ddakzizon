const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),P=require('../progression.js');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 const profile=require('./prepared-profile.cjs')(P.fresh());P.schoolReward(profile);for(let i=0;i<3;i++)P.award(profile,i);P.enterCity(profile);P.awardCity(profile,0);profile.coins=280;
 // Begin with an older city save, which has no refining data.
 delete profile.refining;
 await page.evaluate(profile=>localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint:'city',profile})),profile);
 const resume=async()=>{await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.scene==='city'&&G.state==='explore')};await resume();
 const walk=async(id)=>{await page.waitForFunction(()=>G.state==='explore');await page.evaluate(id=>City.open(id),id);await page.waitForFunction(()=>G.state==='facility')}; // Walking and entrances are covered in exploration.browser.cjs.

 const openForge=async()=>{await walk('press');await page.getByRole('button',{name:'제련소 · 형태 가공'}).click()};
 await openForge();await page.waitForFunction(()=>G.state==='dialogue');assert(await page.evaluate(()=>G.dialogue.some(line=>line[1].includes('90원'))));
 for(let i=0;i<20&&await page.evaluate(()=>G.state==='dialogue');i++)await page.locator('#next').click();
 await page.waitForFunction(()=>G.facility==='forge'&&G.state==='facility');assert.equal(await page.evaluate(()=>G.profile.coins),280);
 await resume();await openForge();assert.equal(await page.evaluate(()=>G.state),'facility');assert.equal(await page.evaluate(()=>G.profile.seen.forge),true);
 // Select and pay entirely with keyboard, after comparing the preview.
 await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>Forge.selected),'striker');
 assert((await page.locator('.forge-stats').textContent()).includes('20 → 28'));assert((await page.locator('.forge-stats').textContent()).includes('110 → 90'));
 await page.screenshot({path:path.join(artifacts,'forge-preview.png')});
 await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.id),'forge-apply');await page.keyboard.press('Space');
 assert.equal(await page.evaluate(()=>G.profile.coins),190);assert.equal(await page.evaluate(()=>P.formOf(G.profile)),'striker');
 await page.evaluate(()=>Forge.apply());assert.equal(await page.evaluate(()=>G.profile.coins),190,'Repeated purchase cannot charge twice');
 await resume();await openForge();assert.equal(await page.evaluate(()=>P.formOf(G.profile)),'striker');assert.equal(await page.evaluate(()=>G.profile.coins),190);
 await page.locator('[data-form="sturdy"]').click();await page.locator('#forge-apply').click();assert.equal(await page.evaluate(()=>G.profile.coins),100);
 for(const form of ['balanced','striker','sturdy']){await page.locator(`[data-form="${form}"]`).click();await page.locator('#forge-apply').click()}
 assert.equal(await page.evaluate(()=>G.profile.coins),100);assert.equal(await page.evaluate(()=>P.stats(G.profile).hp),145);
 // The inventory changes the item beneath the paused workshop without buying.
 await page.keyboard.press('KeyI');await page.locator('[data-item="hair"]').click();await page.locator('#equip-item').click();assert.equal(await page.evaluate(()=>G.facility),'forge');
 await page.evaluate(()=>{Forge.selected='striker';Forge.apply()});assert.equal(await page.evaluate(()=>G.profile.coins),100);assert.equal(await page.evaluate(()=>P.formOf(G.profile)),'balanced');
 await page.keyboard.press('KeyI');await page.locator('[data-form="striker"]').click();await page.locator('#forge-apply').click();assert.equal(await page.evaluate(()=>G.profile.coins),10);
 await page.keyboard.press('KeyI');assert((await page.locator('#item-detail').textContent()).includes('공격형'));assert((await page.locator('#item-detail').textContent()).includes('105'));
 await page.locator('[data-item="colored_paper"]').click();await page.locator('#equip-item').click();await page.keyboard.press('KeyI');
 await page.locator('[data-form="striker"]').click();assert(await page.locator('#forge-apply').isDisabled());assert((await page.locator('#forge-apply').textContent()).includes('잔액 부족'));assert.equal(await page.evaluate(()=>P.formOf(G.profile)),'balanced');
 await page.keyboard.press('KeyI');await page.locator('[data-item="hair"]').click();await page.locator('#equip-item').click();await page.keyboard.press('KeyI');
 await page.setViewportSize({width:1024,height:600});await page.locator('#forge-apply').scrollIntoViewIfNeeded();const box=await page.locator('#facility').boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=1024&&box.y+box.height<=600);await page.screenshot({path:path.join(artifacts,'forge-small-desktop.png')});await page.setViewportSize({width:1440,height:900});
 await page.getByRole('button',{name:'압축 공방으로',exact:true}).click();assert.equal(await page.evaluate(()=>G.facility),'press');assert((await page.locator('#facility-content').textContent()).includes('공격형'));await page.keyboard.press('KeyE');
 await walk('training');await page.evaluate(()=>{const original=update;update=dt=>original(dt*(G.state==='explore'?1:5));TtakjiRules.positionAt=()=>.35;Math.random=()=>.5});
 await page.getByRole('button',{name:'연습 대결 · 보상 없음',exact:true}).click();await page.waitForFunction(()=>G.state==='ready');assert.equal(await page.evaluate(()=>G.hp),105);
 assert((await page.locator('.health-card.player small').first().textContent()).includes('공격형'));
 await page.locator('#game').focus();await page.keyboard.press('KeyF');await page.keyboard.press('KeyC');await page.keyboard.press('KeyR');await page.keyboard.press('Space');await page.keyboard.press('Space');await page.waitForFunction(()=>G.state==='ready'&&G.round===2);
 assert.equal(await page.evaluate(()=>G.enemyMax-G.enemyHp),32,'Refined attack composes with wager and opponent defense');assert.equal(await page.evaluate(()=>G.hp),88,'Refined HP composes with guard');
 await page.evaluate(()=>{Forge.selected='sturdy';Forge.apply()});assert.equal(await page.evaluate(()=>P.formOf(G.profile)),'striker','Cannot refine during a battle');
 await page.keyboard.press('KeyI');assert(await page.locator('#equip-item').isDisabled());await page.keyboard.press('KeyI');
 await page.keyboard.press('Escape');await page.locator('#return-title').click();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='explore');
 assert.equal(await page.evaluate(()=>G.profile.coins),10);assert.equal(await page.evaluate(()=>P.formOf(G.profile,'newspaper')),'sturdy');assert.equal(await page.evaluate(()=>P.formOf(G.profile,'hair')),'striker');
 // Purchased forms still affect village battles, but refining happens in the city.
 await walk('bus');await page.getByRole('button',{name:'마을로 돌아가기',exact:true}).click();await page.waitForFunction(()=>G.scene==='village'&&G.state==='explore');assert.equal(await page.evaluate(()=>P.stats(G.profile).attack),36);await page.evaluate(()=>Forge.visit());assert.equal(await page.evaluate(()=>G.state),'explore');
 await page.keyboard.press('Escape');await page.locator('#return-title').click();await page.locator('#new-game').click();assert.equal(await page.evaluate(()=>P.formOf(G.profile)),'balanced');assert.equal(await page.evaluate(()=>G.profile.refining.hair.unlocked.length),1);
 assert.deepEqual(errors,[]);console.log('PASS refinery dialogue, legacy save, keyboard preview/purchase, free switching, per-item costs, reload, insufficient funds, paused inventory, battle stats/skills, travel, desktop bounds and new-game reset');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
