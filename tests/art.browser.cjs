const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TEST_URL||'http://127.0.0.1:4173',dir=process.env.ARTIFACT_DIR||'/tmp/ddakzizon-checks';
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().includes('/assets/art/')&&!r.ok())failed.push(r.url())});
  await page.addInitScript(()=>{window.artDraws=new Set();const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement&&image.src.includes('/assets/art/'))artDraws.add(new URL(image.src).pathname);return draw.call(this,image,...args)}});
  await page.goto(base);assert((await page.evaluate(()=>GameArt.ready)).every(Boolean));
  const assets=await page.evaluate(()=>Object.entries(GameArt.manifest).map(([key,entry])=>{
   const im=GameArt.loaded(key),c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
   const data=ctx.getImageData(0,0,256,256).data;
   const corners=[3,255*4+3,(255*256)*4+3,(256*256-1)*4+3].map(i=>data[i]);
   return {key,width:im.naturalWidth,height:im.naturalHeight,corners,bounds:entry.bounds};
  }));
  assert.equal(assets.length,42);
  for(const a of assets){assert.equal(a.width,256,a.key);assert.equal(a.height,256,a.key);if(!a.key.startsWith('backgrounds/')){assert.deepEqual(a.corners,[0,0,0,0],a.key+' has transparent margins');assert(a.bounds[0]>=10&&a.bounds[1]>=10&&a.bounds[2]<=246&&a.bounds[3]<=242,a.key+' fits its canvas')}}
  // Walking and attacks reuse a fixed feet anchor without resizing crouched poses.
  const alignment=await page.evaluate(()=>['hero','minsu'].map(who=>['idle','walk-a','walk-b','attack'].map(pose=>GameArt.manifest[`characters/${who}/${pose}`])));
  for(const frames of alignment){for(const frame of frames)assert.deepEqual(frame.anchor,[128,240]);assert(frames[3].bounds[3]-frames[3].bounds[1]<frames[0].bounds[3]-frames[0].bounds[1])}
  await page.screenshot({path:path.join(dir,'art-title.png')});
  await page.locator('#minimum-new').click();await page.locator('#skip-dialogue').click();
  await page.waitForFunction(()=>G.state==='explore');
  for(const zone of ['yard','home','alley','square','center','lobby','schoolfront']){
   await page.evaluate(zone=>{Exploration.enter(zone,zone==='yard'?950:zone==='square'?870:zone==='lobby'?700:450);artDraws.clear()},zone);
   await page.waitForFunction(zone=>[...artDraws].some(s=>s.endsWith('/backgrounds/'+zone+'.png'))&&[...artDraws].some(s=>s.includes('/characters/hero/')),zone);
   assert(await page.evaluate(()=>[...artDraws].some(s=>s.includes('/props/'))));
   await page.screenshot({path:path.join(dir,'art-'+zone+'.png')});
  }
  await page.evaluate(()=>Exploration.enter('yard',700));
  const x=await page.evaluate(()=>G.hero.x);await page.keyboard.down('ArrowRight');
  await page.waitForFunction(()=>[...artDraws].some(s=>s.endsWith('/hero/walk-a.png'))&&[...artDraws].some(s=>s.endsWith('/hero/walk-b.png')));await page.keyboard.up('ArrowRight');
  assert(await page.evaluate(x=>G.hero.x>x,x));
  await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>G.hero.facing===-1);await page.keyboard.up('ArrowLeft');
  // Flip rendering really mirrors the image around the same anchor.
  const mirror=await page.evaluate(()=>{
   const canvases=[1,-1].map(f=>{const c=document.createElement('canvas');c.width=c.height=256;GameArt.actor(c.getContext('2d'),128,240,'hero',0,1,f);return c});
   const a=canvases[0].getContext('2d').getImageData(0,0,256,256).data,b=canvases[1].getContext('2d').getImageData(0,0,256,256).data;let max=0;
   for(let y=0;y<256;y++)for(let x=0;x<256;x++)max=Math.max(max,Math.abs(a[(y*256+x)*4+3]-b[(y*256+255-x)*4+3]));return max;
  });assert(mirror<=16,'mirrored alpha contour stays aligned within resampling tolerance');
  await page.evaluate(()=>{battle('rematch');G.animation={kind:'player-hit',at:G.now,grade:'GOOD'};artDraws.clear()});
  await page.waitForFunction(()=>[...artDraws].some(s=>s.endsWith('/hero/attack.png'))&&[...artDraws].some(s=>s.endsWith('/props/mat.png')));
  await page.evaluate(()=>{G.animation={kind:'enemy-hit',at:G.now,grade:'GOOD'};artDraws.clear()});
  await page.waitForFunction(()=>[...artDraws].some(s=>s.endsWith('/minsu/attack.png')));
  await page.screenshot({path:path.join(dir,'art-battle.png')});
  await page.evaluate(()=>say([['아빠','같은 캐릭터 그림을 사용하는 초상화.']],()=>{}));
  assert(await page.locator('#portrait').evaluate(el=>el.classList.contains('image-portrait')&&el.dataset.artCharacter==='neighbor'&&el.style.backgroundImage.startsWith('url("data:image/png')));
  await page.screenshot({path:path.join(dir,'art-dialogue.png')});
  await page.locator('#skip-dialogue').click();
  // A missing background keeps the original canvas scene usable.
  const fallback=await page.evaluate(()=>{Exploration.enter('home',420);window.failedArtImage=GameArt.loaded('backgrounds/home');failedArtImage.failed=true;artDraws.clear();const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;return GameArt.map(canvas.getContext('2d'),{})});assert.equal(fallback,false);
  await page.waitForFunction(()=>[...artDraws].some(s=>s.endsWith('/hero/idle.png')));
  await page.evaluate(()=>{failedArtImage.failed=false;delete window.failedArtImage});
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS 42 exact 256x256 PNGs, alpha margins, seven authored maps, real keyboard walk/facing, aligned attack frames, mirrored rendering, shared portrait and background fallback');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
