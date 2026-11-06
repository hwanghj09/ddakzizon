const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=process.env.ARTIFACT_DIR||'/tmp/ddakzizon-intro';fs.mkdirSync(dir,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await p.evaluate(()=>GameArt.ready);
 await p.locator('#minimum-new').click();await p.locator('#skip-dialogue').click();await p.locator('#follow-friends').click();await p.waitForFunction(()=>G.state==='explore');
 await p.evaluate(()=>{G.hero.x=950;Exploration.updateInteract()});await p.keyboard.press('KeyE');await p.locator('#skip-dialogue').click();await p.waitForFunction(()=>G.state==='ready');
 assert.deepEqual(await p.evaluate(()=>[G.hp,G.enemyHp]),[12,12]);
 await p.evaluate(()=>{R.positionAt=()=>.5;window.storyFrames=[];const updateGame=update;update=dt=>{updateGame(dt);storyFrames.push({state:G.state,scene:G.scene,zone:G.mapZone,fade:Number(getComputedStyle(document.getElementById('curtain')).opacity)})}});
 await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>G.animation?.kind==='near-flip');assert.equal(await p.evaluate(()=>G.enemyHp),1);
 await p.waitForTimeout(650);await p.screenshot({path:path.join(dir,'almost-won.png')});await p.waitForFunction(()=>G.flipPlayer>0);assert.deepEqual(await p.evaluate(()=>[G.hp,G.enemyHp]),[1,1]);
 await p.waitForFunction(()=>G.mapZone==='home'&&G.state==='dialogue');assert.equal(await p.locator('#speaker').textContent(),'아빠');assert(await p.evaluate(()=>G.dialogue.some(([,line])=>line.includes('강화'))));
 assert(await p.evaluate(()=>storyFrames.some(f=>f.fade>.99)));assert.equal(await p.evaluate(()=>storyFrames.some(f=>f.state==='explore'&&f.zone==='yard')),false);
 assert.equal(await p.evaluate(()=>Minimum.saved.zone),'home');assert.equal(await p.evaluate(()=>Minimum.saved.homeLesson),'pending');await p.waitForFunction(()=>Number(getComputedStyle(document.getElementById('curtain')).opacity)===0);await p.screenshot({path:path.join(dir,'father-at-home.png')});
 // Reloading during the conversation returns to Dad, with no duplicated upgrade.
 await p.reload();await p.locator('#minimum-load').click();await p.waitForFunction(()=>G.state==='dialogue');assert.equal(await p.evaluate(()=>G.mapZone),'home');assert.equal(await p.locator('#speaker').textContent(),'아빠');await p.locator('#skip-dialogue').click();
 assert.match(await p.locator('#facility-content').textContent(),/20 → 23.*100 → 110/);await p.getByRole('button',{name:'신문지 딱지 접고 강화하기',exact:true}).click();await p.waitForFunction(()=>G.state==='result');assert.equal(await p.evaluate(()=>Minimum.progress.stage),'crafted');assert.equal(await p.evaluate(()=>G.profile.upgrades.newspaper),1);
 await p.reload();await p.locator('#minimum-load').click();await p.waitForFunction(()=>G.state==='explore');assert.equal(await p.evaluate(()=>G.profile.upgrades.newspaper),1);await p.evaluate(()=>Minimum.battle('practice'));assert.equal(await p.evaluate(()=>G.maxHp),110);
 assert.deepEqual(errors,[]);console.log('PASS close opening rally, nearly flipped enemy with 1 HP, last-counter loss at positive HP, full fade directly home, interrupted father dialogue recovery, real +1 attack/HP upgrade and no duplicates');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
