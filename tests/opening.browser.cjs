const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=process.env.ARTIFACT_DIR||'/tmp/ddakzizon-opening';fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],failed=[];page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
  await page.addInitScript(()=>{window.openingDraws=new Set();const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement)openingDraws.add(new URL(image.src).pathname);return draw.call(this,image,...args)}});
  const canvasPixel=()=>page.evaluate(async()=>{
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const canvas=document.getElementById('world');
   return Array.from(canvas.getContext('2d').getImageData(canvas.width*.5,canvas.height*.4,1,1).data);
  });
  let releaseClassroom;
  const classroom=new Promise(resolve=>{releaseClassroom=resolve});
  await page.route('**/backgrounds/classroom.png',async route=>{await classroom;await route.continue()});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{window.openingSounds=[];const play=sound;sound=(...args)=>{openingSounds.push(args[0]);play(...args)}});
  await page.locator('#minimum-new').click();assert.equal(await page.evaluate(()=>G.scene),'classroom');
  assert.equal(await page.evaluate(()=>G.mapZone),null);assert.equal(await page.evaluate(()=>Minimum.progress.opening),'classroom');
  try{
   assert.deepEqual(await canvasPixel(),[23,36,55,255],'slow classroom art must not show the legacy scene');
  }finally{releaseClassroom()}
  await page.evaluate(()=>GameArt.ready);
  await page.waitForFunction(()=>[...openingDraws].some(s=>s.endsWith('/classroom.png')));
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(100);await page.keyboard.up('ArrowRight');assert.equal(await page.evaluate(()=>G.state),'dialogue');
  const next=async()=>{if(!await page.evaluate(()=>G.dialogComplete))await page.locator('#next').click();await page.locator('#next').click()};
  assert.match(await page.locator('#line').getAttribute('aria-label'),/수업이 끝나는 종/);
  assert.equal(await page.evaluate(()=>openingSounds.filter(kind=>kind==='school-bell').length),1);
  await page.screenshot({path:path.join(dir,'classroom.png')});
  // Restarting the browser mid-dialogue keeps the opening rather than jumping outdoors.
  await page.reload();await page.locator('#minimum-load').click();assert.equal(await page.evaluate(()=>G.scene),'classroom');
  if(!await page.evaluate(()=>G.dialogComplete))await page.keyboard.press('Space');await page.keyboard.press('Space');
  assert.equal(await page.locator('#speaker').textContent(),'선생님');assert.match(await page.locator('#line').getAttribute('aria-label'),/차 조심, 도로 조심, 사람 조심/);
  assert.equal(await page.locator('#portrait').getAttribute('data-art-character'),'teacher');
  await next();assert.match(await page.locator('#line').getAttribute('aria-label'),/선생님이 교실 문을 열고/);
  assert(await page.locator('#next').isDisabled());
  await page.keyboard.press('Space');assert.match(await page.locator('#line').getAttribute('aria-label'),/선생님이 교실 문을 열고/);
  await page.waitForFunction(()=>[...openingDraws].some(s=>s.includes('/teacher/walk-')));
  await next();assert.equal(await page.locator('#speaker').textContent(),'민수');assert.match(await page.locator('#line').getAttribute('aria-label'),/딱지 어디서/);
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
  await page.keyboard.press('KeyE');assert.match(await page.locator('#line').getAttribute('aria-label'),/딱지 한 장씩 걸고/);
  await page.locator('#skip-dialogue').click();await page.waitForFunction(()=>G.state==='ready');
  // Repeated native clicks cannot replay the decision from the battle scene.
  await page.locator('#follow-friends').evaluate(el=>el.click());assert.equal(await page.evaluate(()=>G.scene),'battle');
  await page.keyboard.press('Escape');await page.locator('#return-title').click();assert(await page.locator('#story-choice').isHidden());
  await page.locator('#minimum-new').click();assert.equal(await page.evaluate(()=>G.scene),'classroom');
  await page.locator('#skip-dialogue').click();await page.waitForFunction(()=>G.state==='choice');assert.equal(await page.evaluate(()=>G.mapZone),null);
  // The full campaign uses the same opening and keeps its own classroom checkpoint.
  await page.keyboard.press('Escape');await page.locator('#return-title').click();
  await page.locator('#new-game').click();await page.locator('#name-confirm').click();
  assert(await page.evaluate(()=>G.state==='dialogue'&&G.scene==='classroom'),'the campaign starts directly in the classroom');
  assert.equal(await page.evaluate(()=>G.save.checkpoint),'classroom');
  assert.match(await page.locator('#inventory').textContent(),/신문지 딱지.*0원/);
  await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='dialogue'&&G.scene==='classroom');
  await page.locator('#skip').click();assert.equal(await page.evaluate(()=>G.save.checkpoint),'classroom_choice');
  await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='choice');
  assert(!(await page.evaluate(()=>[...openingDraws].some(src=>src.endsWith('/yard.png')))),'the yard must wait until the player follows');
  await page.keyboard.press('Space');await page.waitForFunction(()=>G.state==='dialogue'&&G.mapZone==='yard');
  assert.match(await page.locator('#line').getAttribute('aria-label'),/방향키/);
  await next();await next();assert.equal(await page.evaluate(()=>G.state),'explore');
  assert.equal(await page.evaluate(()=>G.hero.x),760);
  await page.keyboard.down('ArrowRight');try{await page.waitForFunction(()=>Exploration.nearest()?.id==='minsu')}finally{await page.keyboard.up('ArrowRight')}
  await page.keyboard.press('KeyE');await page.waitForFunction(()=>G.state==='dialogue');
  await page.locator('#skip').click();await page.waitForFunction(()=>G.state==='dialogue'&&G.scene==='battle');
  while(await page.evaluate(()=>G.state==='dialogue'))await next();
  await page.waitForFunction(()=>G.state==='ready');await page.keyboard.press('Space');
  await page.waitForFunction(()=>G.state==='dialogue'&&G.dialogue.some(line=>line[1].includes('가운데')));
  await page.evaluate(()=>localStorage.setItem(SAVE_KEY,JSON.stringify({version:3,checkpoint:'school',profile:P.fresh()})));
  await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='dialogue'&&G.mapZone==='yard');
  assert.equal(await page.evaluate(()=>G.hero.x),180,'old school saves resume outdoors');
  let releaseGazebo;
  const gazebo=new Promise(resolve=>{releaseGazebo=resolve});
  await page.route('**/panoramas/gazebo.png',async route=>{await gazebo;await route.continue()});
  try{
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#minimum-new').click();await page.locator('#skip-dialogue').click();
   await page.locator('#follow-friends').click();await page.waitForFunction(()=>G.state==='explore');
   assert.deepEqual(await canvasPixel(),[23,36,55,255],'slow yard art must not draw the old map after a quick skip');
  }finally{releaseGazebo()}
  await page.waitForFunction(()=>[...openingDraws].some(src=>src.endsWith('/panoramas/gazebo.png')));
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS school bell, teacher farewell and exit, ttakji conversation, classroom and choice saves in both modes, keyboard follow and yard tutorial, first battle and desktop bounds');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
