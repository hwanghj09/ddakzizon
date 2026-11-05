const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=process.env.ARTIFACT_DIR||'/tmp/ddakzizon-scenes';fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
  await page.addInitScript(()=>{window.backgroundDraws=new Set();const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...args){if(im instanceof HTMLImageElement&&im.src.includes('/backgrounds/'))backgroundDraws.add(im.src.split('/').at(-1));return draw.call(this,im,...args)}});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');assert((await page.evaluate(()=>GameArt.ready)).every(Boolean));
  const shot=async name=>{await page.waitForFunction(()=>getComputedStyle(document.getElementById('curtain')).opacity==='0');await page.screenshot({path:path.join(dir,name+'.png')})};
  await page.locator('#minimum-new').click();await shot('classroom');await page.locator('#skip-dialogue').click();await page.locator('#follow-friends').click();
  await page.waitForFunction(()=>G.state==='explore');await shot('gazebo');
  await page.evaluate(()=>{cancelScene();Minimum.active=false;document.body.classList.remove('minimum-mode');G.profile=P.fresh();const p=G.profile;P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);for(const [enter,award]of[[P.enterCity,P.awardCity],[P.enterProvince,P.awardProvince],[P.enterNational,P.awardNational]]){enter(p);for(let i=0;i<3;i++)award(p,i)}for(const id of ['continent','world','planet']){P.enterTier(p,id);for(let i=0;i<3;i++)P.awardTier(p,id,i)}});
  for(const zone of ['yard','home','alley','square','center','lobby','schoolfront','city','province','national']){
   await page.evaluate(z=>{backgroundDraws.clear();Exploration.enter(z,Exploration.zones[z].width/2)},zone);
   await page.waitForFunction(z=>backgroundDraws.has(z+'.png'),zone);await shot(zone);
  }
  for(const id of ['continent','world','planet']){
   await page.evaluate(id=>{backgroundDraws.clear();Tiers[id].enter()},id);
   await page.waitForFunction(id=>G.state==='explore'&&backgroundDraws.has(id+'.png'),id);await shot(id);
   // Actual interaction, not just a backdrop: open a facility with the keyboard.
   await page.evaluate(()=>{G.hero.x=365;G.hero.y=393;G.keys.clear()});await page.keyboard.press('KeyE');
   await page.waitForFunction(()=>['dialogue','facility'].includes(G.state));
   await page.evaluate(id=>{cancelScene();G.hub=id;G.opponent=P.tiers[id].opponents[0];battle(id+'_tournament');backgroundDraws.clear()},id);
   await page.waitForFunction(id=>backgroundDraws.has(id+'.png'),id);await shot(id+'-battle');
  }
  await page.evaluate(()=>{cancelScene();G.mapZone=null;G.scene=G.hub='village';G.state='explore';G.mode='village';G.hero={x:480,y:393,walk:0,facing:1};panels('explore-ui');backgroundDraws.clear()});
  await page.waitForFunction(()=>backgroundDraws.has('village.png'));await shot('village');
  // Every camera height paints the full viewport, including the floor extension.
  const coverage=await page.evaluate(()=>Object.keys(GameArt.manifest).filter(k=>k.startsWith('backgrounds/')).flatMap(key=>[285,315,335,402].map(ground=>{
   const c=document.createElement('canvas');c.width=960;c.height=600;const ctx=c.getContext('2d');GameArt.background(ctx,key.split('/')[1],ground);
   const data=ctx.getImageData(0,0,960,600).data;let holes=0;for(let i=3;i<data.length;i+=4)if(data[i]!==255)holes++;return {key,ground,holes};
  })));
  for(const c of coverage)assert.equal(c.holes,0,c.key+' '+c.ground+' has no floor gaps');
  await page.setViewportSize({width:1024,height:600});await page.evaluate(()=>Exploration.enter('square',870));await page.keyboard.press('KeyI');assert(await page.locator('#pause-screen').isVisible());await page.keyboard.press('KeyI');assert.equal(await page.evaluate(()=>G.paused),false);await shot('small-desktop');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS all 16 backgrounds in real scenes, 3 frontier hubs/arenas and keyboard facilities, 64 full camera/floor coverage checks, 1024px inventory/pause and no failed requests');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
