const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.TEST_URL||'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 const errors=[];
 try{
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
  await p.evaluate(()=>localStorage.setItem('ddakzizon.minimum.v1','{broken JSON'));
  await p.reload();assert(await p.locator('#minimum-load').isHidden());
  await p.locator('#minimum-new').click();await p.locator('#skip-dialogue').click();
  assert.equal(await p.evaluate(()=>Minimum.progress.stage),'school');
  // Entering the center early never skips the school or poster prerequisites.
  await p.evaluate(()=>Minimum.enter('center',700));await p.keyboard.press('KeyE');
  assert.equal(await p.evaluate(()=>G.state),'dialogue');assert.match(await p.locator('#line').getAttribute('aria-label'),/포스터/);
  await p.locator('#skip-dialogue').click();assert.equal(await p.evaluate(()=>G.mapZone),'center');
  // Saves hold completed events, never transient combat timers or half attacks.
  await p.evaluate(()=>{Minimum.progress.stage='crafted';Minimum.enter('home',720);Minimum.battle('practice')});
  await p.locator('#attack').click();await p.keyboard.press('KeyF');assert.equal(await p.evaluate(()=>G.focused),false);
  await p.locator('#strike').click();await p.keyboard.press('Escape');await p.locator('#return-title').click();
  await p.waitForTimeout(500);assert.equal(await p.evaluate(()=>G.state),'title');assert.equal(await p.evaluate(()=>G.tasks.length),0);
  await p.reload();await p.locator('#minimum-load').click();
  assert.equal(await p.evaluate(()=>Minimum.progress.stage),'crafted');assert.equal(await p.evaluate(()=>G.state),'explore');
  // After impact the event is saved even if the result screen has not appeared.
  await p.evaluate(()=>Minimum.battle('practice'));await p.locator('#attack').click();await p.locator('#strike').click();
  await p.waitForFunction(()=>Minimum.progress.stage==='practiced');await p.reload();await p.locator('#minimum-load').click();
  assert.equal(await p.evaluate(()=>Minimum.progress.stage),'practiced');
  await p.evaluate(()=>Minimum.battle('rematch'));await p.locator('#attack').click();await p.locator('#strike').click();
  await p.waitForFunction(()=>G.state==='enemy');await p.keyboard.press('Escape');await p.locator('#return-title').click();
  await p.waitForTimeout(1500);assert.equal(await p.evaluate(()=>G.state),'title');assert.equal(await p.evaluate(()=>G.tasks.length),0);
  // Starting/reloading a short story does not replace an existing campaign save.
  await p.locator('#new-game').click();const legacy=await p.evaluate(()=>localStorage.getItem(SAVE_KEY));
  await p.evaluate(()=>title());await p.locator('#minimum-load').click();await p.evaluate(()=>Minimum.save());
  assert.equal(await p.evaluate(()=>localStorage.getItem(SAVE_KEY)),legacy);
  await p.evaluate(()=>title());await p.locator('#minimum-new').click();assert.equal(await p.evaluate(()=>Minimum.progress.stage),'school');
  assert.equal(await p.evaluate(()=>localStorage.getItem(SAVE_KEY)),legacy);

  // Positive HP is not a win guarantee: announce probability flips explicitly.
  // Control only RNG/timing, then drive both outcomes through the attack UI.
  await p.evaluate(()=>{Minimum.progress.stage='practiced';Minimum.enter('yard',950);Minimum.battle('rematch');TtakjiRules.positionAt=()=>.5;Math.random=()=>0});
  await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>G.flipEnemy>0);
  assert.match(await p.locator('#impact').textContent(),/뒤집기/);await p.waitForFunction(()=>G.state==='result');
  assert(await p.evaluate(()=>G.enemyHp>0));assert.match(await p.locator('#result-text').textContent(),/내구도가 남았지만/);
  await p.evaluate(()=>{Minimum.progress.stage='practiced';Minimum.enter('yard',950);Minimum.battle('rematch');Math.random=()=>.999});
  await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>G.state==='enemy');await p.evaluate(()=>Math.random=()=>0);
  await p.waitForFunction(()=>G.flipPlayer>0);assert.match(await p.locator('#impact').textContent(),/뒤집혔다/);await p.waitForFunction(()=>G.state==='result');
  assert(await p.evaluate(()=>G.hp>0));assert.match(await p.locator('#result-text').textContent(),/내구도가 남아 있어도/);

  // A denied storage API is a supported offline session, not a JS crash.
  const blocked=await browser.newContext();await blocked.addInitScript(()=>{
   window.restoreStorage={get:Storage.prototype.getItem,set:Storage.prototype.setItem};
   Storage.prototype.getItem=()=>{throw new DOMException('Storage blocked','SecurityError')};
   Storage.prototype.setItem=()=>{throw new DOMException('Storage blocked','SecurityError')};
  });
  const q=await blocked.newPage();q.on('pageerror',e=>errors.push(e.message));await q.goto(url);await q.locator('#minimum-new').click();await q.locator('#skip-dialogue').click();
  assert.equal(await q.evaluate(()=>G.storageOK),false);await q.locator('#pause').click();assert.match(await q.locator('#menu-body').textContent(),/저장 공간에 접근/);
  await q.evaluate(()=>{Storage.prototype.getItem=restoreStorage.get;Storage.prototype.setItem=restoreStorage.set});
  await q.getByRole('button',{name:'자동 저장 다시 시도',exact:true}).click();assert.equal(await q.evaluate(()=>G.storageOK),true);
  await q.locator('#resume').click();await q.locator('#pause').click();await q.locator('#return-title').click();assert(await q.locator('#minimum-load').isVisible());
  await blocked.close();assert.deepEqual(errors,[]);
  console.log('PASS minimum edges: corrupted/blocked/recovered storage, entry gates, checkpoint at impact, interrupted attacks, cancellation, isolated campaign saves, fresh-story reset and positive-HP flip feedback');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
