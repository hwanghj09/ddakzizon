const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');
const url=process.env.TEST_URL||'http://127.0.0.1:4173';
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 const errors=[];
 try{
  const p=await browser.newPage({viewport:{width:1280,height:800}});
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   window.invalidCanvasTransforms=[];
   const translate=CanvasRenderingContext2D.prototype.translate;
   CanvasRenderingContext2D.prototype.translate=function(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))invalidCanvasTransforms.push([String(x),String(y)]);return translate.call(this,x,y)};
  });
  const setup=async()=>{
   await p.evaluate(()=>{
    const original=update;update=dt=>original(dt*(G.state==='timing'?1:8));
    TtakjiRules.positionAt=()=>.5;Math.random=()=>.999;
   });
  };
  const reach=async state=>{await p.waitForFunction(s=>G.state===s,state)};
  const skip=async()=>{if(await p.evaluate(()=>G.state==='dialogue'))await p.locator('#skip-dialogue').click()};
  const stage=async expected=>assert.equal(await p.evaluate(()=>Minimum.progress.stage),expected);
  const reload=async expected=>{await p.reload();await setup();await p.locator('#minimum-load').click();await reach('explore');await stage(expected)};
  // Use real keyboard movement for the entire critical path, not teleportation.
  const walk=async x=>{
   const current=await p.evaluate(()=>G.hero.x);if(Math.abs(current-x)<25)return;
   const key=current<x?'ArrowRight':'ArrowLeft';await p.locator('#game').focus();await p.keyboard.down(key);
   try{await p.waitForFunction(({x,right})=>G.state!=='explore'||(right?G.hero.x>=x-20:G.hero.x<=x+20),{x,right:current<x})}
   finally{await p.keyboard.up(key)}
  };
  const at=async id=>{const x=await p.evaluate(id=>Exploration.objects().find(o=>o.id===id).x,id);await walk(x);await p.keyboard.press('KeyE')};
  const cross=async direction=>{
   const zone=await p.evaluate(()=>G.mapZone),key=direction==='left'?'ArrowLeft':'ArrowRight';
   await p.locator('#game').focus();await p.keyboard.down(key);
   try{await p.waitForFunction(z=>G.mapZone!==z,zone)}finally{await p.keyboard.up(key)}
   await reach('explore');
  };
  const hit=async()=>{await reach('ready');await p.locator('#attack').click();await reach('timing');await p.locator('#strike').click();await p.waitForFunction(()=>['ready','result','dialogue'].includes(G.state))};
  await p.goto(url);await setup();await p.locator('#minimum-new').click();await skip();await p.locator('#follow-friends').click();await reach('explore');
  await at('minsu');assert.match(await p.locator('#line').getAttribute('aria-label'),/딱지 한 장씩 걸고/);assert(await p.locator('#portrait').evaluate(el=>el.classList.contains('rival')));await skip();await reach('ready');
  await hit();assert.equal(await p.evaluate(()=>G.stats.turns),1);assert(await p.evaluate(()=>Number.isFinite(G.stolenAt)));await stage('lost');
  assert.equal(await p.evaluate(()=>G.mapZone),'home');assert.equal(await p.evaluate(()=>Minimum.progress.homeLesson),'pending');
  await p.reload();await setup();await p.locator('#minimum-load').click();await reach('dialogue');assert.equal(await p.evaluate(()=>G.mapZone),'home');
  await skip();await reach('facility');
  await p.keyboard.press('KeyI');assert.match(await p.locator('#menu-body').textContent(),/가방이 비었다/);await p.keyboard.press('KeyI');
  await p.getByRole('button',{name:'신문지 딱지 접고 강화하기',exact:true}).click();await reach('result');await stage('crafted');
  await reload('crafted');await p.keyboard.press('KeyI');assert.match(await p.locator('#menu-body').textContent(),/신문지 딱지 \+1 · 장착 중/);await p.keyboard.press('KeyI');
  await at('table');await skip();await stage('crafted');assert.equal(await p.evaluate(()=>G.profile.upgrades.newspaper),1);
  await at('target');await skip();await reach('ready');await p.evaluate(()=>TtakjiRules.positionAt=()=>0);
  await hit();await reach('result');await stage('practiced');assert.match(await p.locator('#result-text').textContent(),/빗나감/);
  await p.locator('#result-secondary').click();await reach('ready');await hit();await reach('result');await stage('practiced');
  await reload('practiced');await at('door');await reach('explore');
  for(const z of ['square','center','schoolfront']){await cross('right');assert.equal(await p.evaluate(()=>G.mapZone),z)}
  await at('gate');await reach('explore');await at('minsu');await skip();await reach('ready');
  // A rematch really can be lost. MISS hits do 12; the rival's GOOD counters do 22.
  await p.evaluate(()=>TtakjiRules.positionAt=()=>0);
  for(let i=0;i<6&&await p.evaluate(()=>G.state!=='result');i++)await hit();
  await reach('result');await stage('practiced');assert.match(await p.locator('#continue').textContent(),/즉시 재도전/);
  await p.locator('#continue').click();await reach('ready');await p.evaluate(()=>TtakjiRules.positionAt=()=>.5);
  await p.locator('#attack').click();await reach('timing');await p.keyboard.press('Escape');
  const now=await p.evaluate(()=>G.now);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>G.now),now);await p.locator('#resume').click();
  await p.locator('#strike').click();await reach('ready');assert.equal(await p.evaluate(()=>G.enemyHp),70);
  for(let i=0;i<4&&await p.evaluate(()=>G.state!=='result');i++)await hit();await reach('result');await stage('won');
  await reload('won');await at('gate');await reach('explore');await at('poster');await stage('poster');
  await p.locator('#facility-close').click();await at('poster');await stage('poster');await p.locator('#facility-close').click();
  await reload('poster');await cross('left');await at('lobby');await reach('explore');await at('reception');await skip();
  await p.getByRole('button',{name:'아직 준비할게요',exact:true}).click();await stage('poster');
  await at('reception');await skip();await p.getByRole('button',{name:'참가 신청 확인',exact:true}).click();await stage('registered');
  assert.equal(await p.locator('#minimum-bracket li').count(),3);assert.match(await p.locator('#facility-content').textContent(),/체험판 끝/);
  await p.screenshot({path:path.join(artifacts,'minimum-registration-desktop.png')});
  await reload('registered');await at('reception');assert.equal(await p.locator('#minimum-bracket li').count(),3);await stage('registered');
  assert.equal(await p.evaluate(()=>G.profile.coins),0);assert.equal(await p.evaluate(()=>localStorage.getItem(SAVE_KEY)),null);
  // Returning to title cancels scene work; the campaign keeps its own save.
  await p.keyboard.press('Escape');if(await p.evaluate(()=>!G.paused))await p.keyboard.press('Escape');await p.locator('#return-title').click();assert.equal(await p.evaluate(()=>Minimum.active),false);
  await p.locator('#new-game').click();assert.equal(await p.evaluate(()=>Minimum.active),false);await p.locator('#name-confirm').click();await p.waitForFunction(()=>localStorage.getItem(SAVE_KEY));
  assert(await p.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).checkpoint==='school'));
  assert.deepEqual(await p.evaluate(()=>invalidCanvasTransforms),[]);
  console.log('PASS minimum desktop: complete keyboard route, scripted loss, crafting, MISS practice/retry, fair loss/retry/win, pause, all event reloads, poster/registration idempotency and isolated saves');

  // Desktop is the sole supported platform; keep layout and controls usable
  // at the recommended size and in a smaller laptop window.
  assert.equal(await p.locator('#minimum-touch').count(),0);
  await p.evaluate(()=>title());await p.locator('#minimum-load').click();await reach('explore');
  for(const [width,height] of [[1440,900],[1280,720],[1024,600]]){
   await p.setViewportSize({width,height});await p.waitForFunction(()=>window.World.viewWidth()===960);
   await p.keyboard.press('KeyI');assert.equal(await p.evaluate(()=>GameMenu.view),'inventory');
   const menu=await p.locator('.game-menu').boundingBox();assert(menu.x>=0&&menu.y>=0&&menu.x+menu.width<=width+1&&menu.y+menu.height<=height+1);
   await p.keyboard.press('KeyI');await p.keyboard.press('KeyM');assert.equal(await p.evaluate(()=>GameMenu.view),'map');await p.keyboard.press('KeyM');
   await p.evaluate(()=>{Minimum.progress.stage='registered';Minimum.enter('lobby',700);Minimum.bracket()});
   const panel=await p.locator('#facility').boundingBox();assert(panel.x>=0&&panel.y>=0&&panel.x+panel.width<=width+1&&panel.y+panel.height<=height+1);
   await p.screenshot({path:path.join(artifacts,`minimum-pc-${width}.png`)});await p.locator('#facility-close').click();
  }
  await p.keyboard.press('Escape');await p.locator('[data-menu="controls"]').click();
  assert.doesNotMatch(await p.locator('#menu-body').textContent(),/휴대폰|터치/);
  await p.locator('[data-menu="settings"]').click();const sound=await p.evaluate(()=>G.sound);await p.locator('#menu-sound').click();assert.equal(await p.evaluate(()=>G.sound),!sound);
  await p.locator('#resume').click();await p.evaluate(()=>Minimum.battle('rematch'));await p.keyboard.press('Space');await reach('timing');
  await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>G.now);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>G.now),frozen);await p.locator('#resume').click();await p.keyboard.press('Space');
  await p.waitForFunction(()=>['ready','result'].includes(G.state));
  assert.deepEqual(errors,[]);console.log('PASS desktop-only controls, inventory/map/settings, PC menu/panel bounds at 1440/1280/1024, gauge pause and keyboard resume');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
