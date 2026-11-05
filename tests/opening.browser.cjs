const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=process.env.ARTIFACT_DIR||'/tmp/ddakzizon-opening';fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],failed=[];page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
  await page.addInitScript(()=>{window.openingDraws=new Set();const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement)openingDraws.add(new URL(image.src).pathname);return draw.call(this,image,...args)}});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.evaluate(()=>GameArt.ready);
  await page.locator('#minimum-new').click();assert.equal(await page.evaluate(()=>G.scene),'classroom');
  assert.equal(await page.evaluate(()=>G.mapZone),null);assert.equal(await page.evaluate(()=>Minimum.progress.opening),'classroom');
  await page.waitForFunction(()=>[...openingDraws].some(s=>s.endsWith('/classroom.png')));
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(100);await page.keyboard.up('ArrowRight');assert.equal(await page.evaluate(()=>G.state),'dialogue');
  const next=async()=>{if(!await page.evaluate(()=>G.dialogComplete))await page.locator('#next').click();await page.locator('#next').click()};
  assert.match(await page.locator('#line').getAttribute('aria-label'),/마지막 수업이 끝났다/);
  await page.screenshot({path:path.join(dir,'classroom.png')});
  // Restarting the browser mid-dialogue keeps the opening rather than jumping outdoors.
  await page.reload();await page.locator('#minimum-load').click();assert.equal(await page.evaluate(()=>G.scene),'classroom');
  if(!await page.evaluate(()=>G.dialogComplete))await page.keyboard.press('Space');await page.keyboard.press('Space');assert.equal(await page.locator('#speaker').textContent(),'민수');assert.match(await page.locator('#line').getAttribute('aria-label'),/딱지 어디서/);
  assert.equal(await page.locator('#portrait').getAttribute('data-art-character'),'minsu');
  await next();assert.equal(await page.locator('#speaker').textContent(),'도윤');assert.match(await page.locator('#line').getAttribute('aria-label'),/정자에서/);
  assert.equal(await page.locator('#portrait').getAttribute('data-art-character'),'boss');
  await next();assert.match(await page.locator('#line').getAttribute('aria-label'),/궁금해졌다/);await next();
  await page.waitForFunction(()=>G.state==='choice');assert.equal(await page.locator('#story-choice button').count(),1);
  const choice=page.getByRole('button',{name:'관심이 생겨서 따라간다',exact:true});assert(await choice.isVisible());assert(await page.locator('#facility').isHidden());
  await page.keyboard.press('Escape');await choice.evaluate(el=>el.click());assert.equal(await page.evaluate(()=>Minimum.progress.opening),'choice');
  await page.locator('#resume').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'follow-friends');
  for(const [width,height]of [[1440,900],[1280,720],[1024,600]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(350);const box=await page.locator('#story-choice').boundingBox();
   assert(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1);
   await page.screenshot({path:path.join(dir,`choice-${width}.png`)});
  }
  await page.reload();await page.locator('#minimum-load').click();await page.waitForFunction(()=>G.state==='choice');assert.equal(await page.evaluate(()=>G.scene),'classroom');
  await page.keyboard.press('Space');await page.waitForFunction(()=>G.state==='explore');assert.equal(await page.evaluate(()=>Minimum.progress.opening),'done');
  assert.equal(await page.evaluate(()=>G.mapZone),'yard');assert.match(await page.locator('#map-location').textContent(),/정자/);
  await page.waitForFunction(()=>[...openingDraws].some(s=>s.endsWith('/gazebo.png')));await page.waitForTimeout(350);
  await page.screenshot({path:path.join(dir,'followed-to-gazebo.png')});
  await page.reload();await page.locator('#minimum-load').click();await page.waitForFunction(()=>G.state==='explore');assert(await page.locator('#story-choice').isHidden());
  await page.keyboard.down('ArrowRight');try{await page.waitForFunction(()=>Exploration.nearest()?.id==='minsu')}finally{await page.keyboard.up('ArrowRight')}
  await page.keyboard.press('KeyE');assert.match(await page.locator('#line').getAttribute('aria-label'),/이야기상 패배/);
  await page.locator('#skip-dialogue').click();await page.waitForFunction(()=>G.state==='ready');
  // Repeated native clicks cannot replay the decision from the battle scene.
  await page.locator('#follow-friends').evaluate(el=>el.click());assert.equal(await page.evaluate(()=>G.scene),'battle');
  await page.keyboard.press('Escape');await page.locator('#return-title').click();assert(await page.locator('#story-choice').isHidden());
  await page.locator('#minimum-new').click();assert.equal(await page.evaluate(()=>G.scene),'classroom');
  await page.locator('#skip-dialogue').click();await page.waitForFunction(()=>G.state==='choice');assert.equal(await page.evaluate(()=>G.mapZone),null);
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS classroom dialogue order, explicit choice, pause guard/focus, Space activation, reload before/after choice, fresh restart, gazebo art/first battle and 1440/1280/1024 bounds');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
