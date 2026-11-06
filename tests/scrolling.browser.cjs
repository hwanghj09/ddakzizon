const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=process.env.ARTIFACT_DIR||'/tmp/ddakzizon-scrolling';fs.mkdirSync(dir,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.lastPanorama=null;const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...args){if(im instanceof HTMLImageElement&&im.src.includes('/panoramas/'))lastPanorama={src:im.src,x:args.length===4?args[0]:args[4],width:args.length===4?args[2]:args[6]};return draw.call(this,im,...args)}});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.evaluate(()=>GameArt.ready);
 await page.locator('#minimum-new').click();await page.locator('#skip-dialogue').click();await page.locator('#follow-friends').click();await page.waitForFunction(()=>G.state==='explore');
 await page.evaluate(()=>Minimum.enter('square',430));await page.waitForFunction(()=>Math.abs(G.camera)<1&&Number(getComputedStyle(document.getElementById('curtain')).opacity)===0);await page.screenshot({path:path.join(dir,'walk-left.png')});
 await page.locator('#game').focus();await page.keyboard.down('KeyD');try{await page.waitForFunction(()=>G.hero.x>=1180)}finally{await page.keyboard.up('KeyD')}
 await page.waitForFunction(()=>Math.abs(G.camera-(G.hero.x-480))<1);
 const moved=await page.evaluate(()=>({x:G.hero.x,camera:G.camera,draw:lastPanorama}));assert(moved.camera>650);assert.equal(moved.draw.x,-Math.round(moved.camera));assert.equal(moved.draw.width,2200);
 await page.screenshot({path:path.join(dir,'walk-right.png')});await page.keyboard.press('KeyI');const stopped=await page.evaluate(()=>G.camera);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>G.camera),stopped);await page.keyboard.press('KeyI');
 await page.reload();await page.locator('#minimum-load').click();await page.waitForFunction(()=>G.state==='explore');assert.equal(await page.evaluate(()=>G.mapZone),'square');assert(Math.abs(await page.evaluate(()=>G.hero.x)-moved.x)<2);assert(Math.abs(await page.evaluate(()=>G.camera)-(moved.x-480))<2);
 // Verify pixel-level translation, including shared floor coordinates and both edges.
 const shifts=await page.evaluate(()=>Object.entries(GameArt.manifest).filter(([k])=>k.startsWith('panoramas/')).map(([key,entry])=>{
  const render=camera=>{const c=document.createElement('canvas');c.width=960;c.height=600;GameArt.panorama(c.getContext('2d'),key.split('/')[1],camera);return c.getContext('2d').getImageData(0,0,960,600).data};
  const a=render(0),b=render(64),edge=render(entry.worldWidth-960);let mismatch=0,holes=0,changed=0;
  for(let y=0;y<600;y++)for(let x=0;x<896;x++){const ai=(y*960+x+64)*4,bi=(y*960+x)*4;for(let c=0;c<4;c++)if(a[ai+c]!==b[bi+c])mismatch++;if(a[bi]!==b[bi])changed++}
  for(let i=3;i<edge.length;i+=4)if(edge[i]!==255)holes++;
  return {key,mismatch,holes,changed};
 }));
 for(const s of shifts){assert.equal(s.mismatch,0,s.key+' moves exactly with world objects');assert.equal(s.holes,0,s.key+' covers right edge');assert(s.changed>1000,s.key+' reveals new scenery')}
 await page.evaluate(()=>{cancelScene();Minimum.active=false;G.profile=P.fresh();const p=G.profile;P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);for(const [enter,award]of[[P.enterCity,P.awardCity],[P.enterProvince,P.awardProvince],[P.enterNational,P.awardNational]]){enter(p);for(let i=0;i<3;i++)award(p,i)}for(const id of ['continent','world','planet']){P.enterTier(p,id);for(let i=0;i<3;i++)P.awardTier(p,id,i)}});
 for(const id of ['continent','world','planet']){
  await page.evaluate(id=>Tiers[id].enter(),id);await page.locator('#game').focus();await page.keyboard.down('ArrowRight');try{await page.waitForFunction(()=>G.hero.x>=700)}finally{await page.keyboard.up('ArrowRight')}
  await page.waitForFunction(()=>G.camera>180);assert(await page.evaluate(()=>G.hero.x<window.World.areaWidth()));assert((await page.evaluate(()=>lastPanorama.src)).endsWith('/'+id+'.png'));
  await page.keyboard.press('KeyE');await page.waitForFunction(()=>G.state==='dialogue'||G.state==='facility');
 }
 await page.setViewportSize({width:1024,height:600});await page.evaluate(()=>{cancelScene();Exploration.enter('alley',1700)});await page.waitForFunction(()=>lastPanorama?.src.endsWith('/alley.png'));assert.equal(await page.evaluate(()=>Math.round(G.camera)),840);
 assert.deepEqual(errors,[]);console.log('PASS real keyboard scrolling, 15 world-sized panoramas with exact 64px landmark/floor translation and no edge gaps, pause/save reload, 3 expanded frontier hubs and 1024px viewport');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
