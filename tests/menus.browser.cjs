// Run npm start first. TEST_URL and BROWSER_EXECUTABLE may override local defaults.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),P=require('../progression.js');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
  const profile=P.fresh();P.schoolReward(profile);for(let round=0;round<3;round++)P.award(profile,round);P.upgrade(profile);profile.xp=6;
  await page.evaluate(profile=>localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint:'village',profile})),profile);await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='explore');
  await page.locator('#game').focus();await page.keyboard.press('KeyI');assert(await page.locator('#pause-screen').isVisible());assert.equal(await page.locator('[data-item]').count(),3);
  const now=await page.evaluate(()=>G.now);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>G.now),now);assert(await page.locator('#hud').evaluate(el=>el.inert));
  await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>GameMenu.selected),'colored_paper');await page.locator('#equip-item').click();assert.equal(await page.evaluate(()=>G.profile.equipped),'colored_paper');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).profile.equipped),'colored_paper');assert((await page.locator('#inventory').textContent()).includes('색종이'));
  await page.locator('[data-item="hair"]').click();assert.equal(await page.locator('.stat-up').count(),3);await page.screenshot({path:path.join(artifacts,'inventory-menu.png')});
  // Tab is confined to the modal and Shift+Tab wraps back to the last action.
  await page.locator('#equip-item').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.menu),'overview');await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'equip-item');
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>GameMenu.view),'overview');await page.screenshot({path:path.join(artifacts,'game-menu.png')});
  await page.locator('[data-menu="player"]').click();assert((await page.locator('#menu-body').textContent()).includes('뿌리 버티기'));
  await page.locator('[data-menu="settings"]').click();await page.locator('#menu-sound').click();assert.equal(await page.evaluate(()=>G.sound),false);await page.locator('#menu-sound').click();assert.equal(await page.evaluate(()=>G.sound),true);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>G.audio?.state),'suspended');
  await page.locator('#menu-fullscreen').click();await page.waitForFunction(()=>Boolean(document.fullscreenElement));await page.locator('#menu-fullscreen').click();await page.waitForFunction(()=>!document.fullscreenElement);
  await page.locator('[data-menu="controls"]').click();assert((await page.locator('#menu-body').textContent()).includes('A D'));await page.locator('#resume').click();assert.equal(await page.evaluate(()=>G.paused),false);assert.equal(await page.locator('#world').evaluate(el=>el.inert),false);
  // Equipment changes refresh an underlying compression preview without changing scene.
  await page.evaluate(()=>Village.open('press'));await page.keyboard.press('KeyI');await page.locator('[data-item="hair"]').click();await page.locator('#equip-item').click();await page.keyboard.press('KeyI');assert.equal(await page.evaluate(()=>G.state),'facility');assert((await page.locator('#facility-content').textContent()).includes('머리카락'));await page.locator('#facility-close').click();
  await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='explore');assert.equal(await page.evaluate(()=>G.profile.equipped),'hair');
  // Opening the inventory mid-gauge freezes timing, prevents equipment changes, then resumes.
  await page.evaluate(()=>{G.opponent=P.opponents[0];battle('sparring')});await page.locator('#attack').click();await page.waitForTimeout(150);await page.keyboard.press('KeyI');const timing=await page.evaluate(()=>({now:G.now,start:G.gaugeStart}));await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>G.now),timing.now);await page.locator('[data-item="newspaper"]').click();assert(await page.locator('#equip-item').isDisabled());await page.keyboard.press('KeyI');assert.equal(await page.evaluate(()=>G.state),'timing');assert.equal(await page.evaluate(()=>G.gaugeStart),timing.start);
  await page.keyboard.press('Escape');await page.locator('#return-title').click();assert.equal(await page.evaluate(()=>G.tasks.length),0);assert.equal(await page.locator('#title-screen').evaluate(el=>el.inert),false);
  // The stolen/unfinished tutorial paper is not represented as an owned folded ttakji.
  await page.evaluate(()=>{G.profile=P.fresh();checkpoint('home');home()});await page.keyboard.press('KeyI');assert.equal(await page.locator('[data-item]').count(),0);assert(await page.locator('.inventory-empty').isVisible());await page.keyboard.press('KeyI');assert.equal(await page.evaluate(()=>G.state),'dialogue');
  // Settings and the inventory remain inside a smaller desktop viewport.
  await page.setViewportSize({width:1024,height:600});await page.evaluate(()=>{cancelScene();P.schoolReward(G.profile);Village.enter()});await page.keyboard.press('KeyI');await page.locator('[data-item="colored_paper"]').click();await page.locator('#equip-item').click();const box=await page.locator('.game-menu').boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=1024&&box.y+box.height<=600);
  assert.deepEqual(errors,[]);console.log('PASS inventory ownership, comparison, equipment persistence, facility preview, modal focus, pause/resume, battle lock, settings, empty bag and desktop bounds');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
