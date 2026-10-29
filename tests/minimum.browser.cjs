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
  await p.goto(url);await setup();await p.locator('#minimum-new').click();await skip();await reach('explore');
  await at('minsu');assert.match(await p.locator('#line').getAttribute('aria-label'),/이야기상 패배/);assert(await p.locator('#portrait').evaluate(el=>el.classList.contains('rival')));await skip();await reach('ready');
  await hit();assert.equal(await p.evaluate(()=>G.stats.turns),1);assert(await p.evaluate(()=>Number.isFinite(G.stolenAt)));await p.waitForTimeout(100);assert.deepEqual(await p.evaluate(()=>invalidCanvasTransforms),[]);await skip();await reach('explore');await stage('lost');
  await reload('lost');assert.equal(await p.evaluate(()=>G.mapZone),'yard');
  await p.keyboard.press('KeyI');assert.match(await p.locator('#menu-body').textContent(),/가방이 비었다/);await p.keyboard.press('KeyI');
  await at('gate');await reach('explore');assert.equal(await p.evaluate(()=>G.mapZone),'schoolfront');
  for(const z of ['center','square','alley']){await cross('left');assert.equal(await p.evaluate(()=>G.mapZone),z)}
  await at('home');await reach('explore');assert.equal(await p.evaluate(()=>G.mapZone),'home');
  await at('table');await p.getByRole('button',{name:'신문지 딱지 접기',exact:true}).click();await reach('result');await stage('crafted');
  await reload('crafted');await p.keyboard.press('KeyI');assert.match(await p.locator('#menu-body').textContent(),/신문지 딱지 · 장착 중/);await p.keyboard.press('KeyI');
  await at('table');await skip();await stage('crafted');assert.equal(await p.evaluate(()=>G.profile.upgrades.newspaper),0);
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
  await p.locator('#strike').click();await reach('ready');assert.equal(await p.evaluate(()=>G.enemyHp),74);
  for(let i=0;i<4&&await p.evaluate(()=>G.state!=='result');i++)await hit();await reach('result');await stage('won');
  await reload('won');await at('gate');await reach('explore');await at('poster');await stage('poster');
  await p.locator('#facility-close').click();await at('poster');await stage('poster');await p.locator('#facility-close').click();
  await reload('poster');await cross('left');await at('lobby');await reach('explore');await at('reception');await skip();
  await p.getByRole('button',{name:'아직 준비할게요',exact:true}).click();await stage('poster');
  await at('reception');await skip();await p.getByRole('button',{name:'참가 신청 확인',exact:true}).click();await stage('registered');
  assert.equal(await p.locator('#minimum-bracket li').count(),3);assert.match(await p.locator('#facility-content').textContent(),/최소 플레이 버전 완료/);
  await p.screenshot({path:path.join(artifacts,'minimum-registration-desktop.png')});
  await reload('registered');await at('reception');assert.equal(await p.locator('#minimum-bracket li').count(),3);await stage('registered');
  assert.equal(await p.evaluate(()=>G.profile.coins),0);assert.equal(await p.evaluate(()=>localStorage.getItem(SAVE_KEY)),null);
  // Returning to title cancels scene work; the campaign keeps its own save.
  await p.keyboard.press('Escape');await p.locator('#return-title').click();assert.equal(await p.evaluate(()=>Minimum.active),false);
  await p.locator('#new-game').click();assert.equal(await p.evaluate(()=>Minimum.active),false);
  assert(await p.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).checkpoint==='school'));
  assert.deepEqual(await p.evaluate(()=>invalidCanvasTransforms),[]);
  console.log('PASS minimum desktop: complete keyboard route, scripted loss, crafting, MISS practice/retry, fair loss/retry/win, pause, all event reloads, poster/registration idempotency and isolated saves');

  // Mobile portrait and landscape: actual touch, movement cancellation, menus,
  // combat and registration use the same DOM controls with no hidden keyboard step.
  const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const t=await mobile.newPage();t.on('pageerror',e=>errors.push(e.message));await t.goto(url);
  await t.locator('#minimum-new').tap();await t.locator('#skip-dialogue').tap();
  await t.waitForFunction(()=>window.World.viewWidth()===560);
  // The closer portrait camera must keep the hero visible at both map edges,
  // including after rotating while a facility/menu has paused exploration.
  for(const zone of ['home','yard'])for(const edge of ['left','right']){
   await t.evaluate(({zone,edge})=>Minimum.enter(zone,edge==='left'?45:MinimumRules.zones[zone]-45),{zone,edge});
   assert(await t.evaluate(()=>G.hero.x-G.camera>=0&&G.hero.x-G.camera<=window.World.viewWidth()));
  }
  await t.setViewportSize({width:844,height:390});await t.waitForFunction(()=>window.World.viewWidth()===960);
  assert(await t.evaluate(()=>G.hero.x-G.camera>=0&&G.hero.x-G.camera<=960));
  await t.setViewportSize({width:390,height:844});await t.waitForFunction(()=>window.World.viewWidth()===560);
  await t.evaluate(()=>Minimum.enter('yard',180));
  const button=t.locator('[data-move="right"]');const box=await button.boundingBox();assert(box&&box.width>=44&&box.height>=44);
  const touch=await mobile.newCDPSession(t);const start=await t.evaluate(()=>G.hero.x);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});
  await t.waitForTimeout(250);await touch.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  const end=await t.evaluate(()=>G.hero.x);assert(end>start);await t.waitForTimeout(120);assert.equal(await t.evaluate(()=>G.hero.x),end);
  await t.evaluate(()=>{Minimum.enter('yard',950)});await t.locator('#touch-interact').tap();await t.locator('#skip-dialogue').tap();await t.waitForFunction(()=>G.state==='ready');
  await t.locator('#attack').tap();await t.locator('#pause').tap();const frozen=await t.evaluate(()=>G.now);await t.waitForTimeout(100);assert.equal(await t.evaluate(()=>G.now),frozen);
  await t.locator('[data-menu="settings"]').tap();await t.locator('#menu-sound').tap();assert.equal(await t.evaluate(()=>G.sound),false);await t.locator('#resume').tap();
  await t.locator('#strike').tap();await t.waitForFunction(()=>G.state==='dialogue');await t.locator('#skip-dialogue').tap();await t.waitForFunction(()=>G.state==='explore');
  await t.evaluate(()=>{Minimum.progress.stage='practiced';Minimum.enter('yard',950);Minimum.battle('rematch');TtakjiRules.positionAt=()=>0;Math.random=()=>.999;const u=update;update=dt=>u(dt*12)});
  for(let i=0;i<6&&await t.evaluate(()=>G.state!=='result');i++){await t.waitForFunction(()=>G.state==='ready');await t.locator('#attack').tap();await t.locator('#strike').tap();await t.waitForFunction(()=>['ready','result'].includes(G.state))}
  await t.locator('#result-secondary').tap();await t.waitForFunction(()=>G.state==='explore');assert.equal(await t.evaluate(()=>G.mapZone),'home');
  await t.evaluate(()=>{Minimum.progress.stage='poster';Minimum.enter('lobby',700)});await t.locator('#touch-interact').tap();await t.locator('#skip-dialogue').tap();await t.getByRole('button',{name:'참가 신청 확인',exact:true}).tap();
  const bounded=async selector=>{const b=await t.locator(selector).boundingBox();const v=t.viewportSize();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=v.width+1&&b.y+b.height<=v.height+1,`${selector} outside viewport: ${JSON.stringify(b)}`)};
  await bounded('#facility');await t.screenshot({path:path.join(artifacts,'minimum-mobile-registration.png')});
  await t.locator('#pause').tap();await bounded('.game-menu');await t.locator('[data-menu="inventory"]').tap();await t.screenshot({path:path.join(artifacts,'minimum-mobile-inventory.png')});await t.locator('#resume').tap();
  await t.setViewportSize({width:844,height:390});await bounded('#facility');await t.locator('#facility-close').tap();await t.evaluate(()=>Minimum.battle('rematch'));await bounded('#combat-controls');await t.locator('#attack').tap();await bounded('#strike');
  await t.screenshot({path:path.join(artifacts,'minimum-mobile-landscape.png')});
  await mobile.close();
  assert.deepEqual(errors,[]);console.log('PASS minimum touch: portrait/landscape, movement/cancel, talk, attack/stop, pause/settings/inventory, loss/home-practice, registration, viewport bounds and no JS errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
