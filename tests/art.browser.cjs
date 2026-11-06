const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TEST_URL||'http://127.0.0.1:4173',dir=process.env.ARTIFACT_DIR||'/tmp/ddakzizon-checks';
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().includes('/assets/art/')&&!r.ok())failed.push(r.url())});
  await page.addInitScript(()=>{window.artDraws=new Set();const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement&&image.src.includes('/assets/art/'))artDraws.add(new URL(image.src).pathname);return draw.call(this,image,...args)}});
  let releaseClassroom,releaseRival;
  const classroom=new Promise(resolve=>{releaseClassroom=resolve}),rival=new Promise(resolve=>{releaseRival=resolve});
  await page.route('**/backgrounds/classroom.png',async route=>{await classroom;await route.continue()});
  await page.route('**/characters/minsu/idle.png',async route=>{await rival;await route.continue()});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  const titlePixel=()=>page.evaluate(async()=>{
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const canvas=document.getElementById('world');
   return Array.from(canvas.getContext('2d').getImageData(canvas.width*.8,canvas.height*.3,1,1).data);
  });
  try{
   assert.deepEqual(await titlePixel(),[23,36,55,255],'slow artwork must not draw the yard on the title');
   assert(await page.locator('#new-game').isEnabled(),'title controls work while art loads');
   releaseClassroom();await page.waitForFunction(()=>GameArt.loaded('backgrounds/classroom'));
   assert.deepEqual(await titlePixel(),[23,36,55,255],'the preview waits for its character sprite');
  }finally{releaseClassroom();releaseRival()}
  assert((await page.evaluate(()=>GameArt.ready)).every(Boolean));
  await page.waitForFunction(()=>[...artDraws].some(src=>src.endsWith('/backgrounds/classroom.png')));
  assert.notDeepEqual(await titlePixel(),[23,36,55,255],'the classroom title appears after loading');
  assert(!(await page.evaluate(()=>[...artDraws].some(src=>src.endsWith('/yard.png')))),'the title never draws the yard');
  const assets=await page.evaluate(()=>Object.entries(GameArt.manifest).map(([key,entry])=>{
   const im=GameArt.loaded(key),c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
   const data=ctx.getImageData(0,0,c.width,c.height).data;
   const corners=[3,(c.width-1)*4+3,((c.height-1)*c.width)*4+3,(c.width*c.height-1)*4+3].map(i=>data[i]);
   return {key,width:im.naturalWidth,height:im.naturalHeight,corners,bounds:entry.bounds,expected:entry.size};
  }));
  assert.equal(assets.length,120);
  for(const a of assets){const character=a.key.startsWith('characters/'),scene=a.key.startsWith('backgrounds/')||a.key.startsWith('panoramas/');assert.deepEqual([a.width,a.height],character?[64,64]:a.expected,a.key);if(!scene){assert.deepEqual(a.corners,[0,0,0,0],a.key+' has transparent margins');assert(character?a.bounds[0]>=4&&a.bounds[1]>=0&&a.bounds[2]<=60&&a.bounds[3]===60:a.bounds[0]>=1&&a.bounds[1]>=1&&a.bounds[2]<=31&&a.bounds[3]<=30,a.key+' fits its canvas')}}
  // Walking and attacks reuse a fixed feet anchor without resizing crouched poses.
  const alignment=await page.evaluate(()=>[...new Set(Object.keys(GameArt.manifest).filter(k=>k.startsWith('characters/')).map(k=>k.split('/')[1]))].map(who=>['idle','walk-a','walk-b','attack'].map(pose=>GameArt.manifest[`characters/${who}/${pose}`])));
  for(const frames of alignment){for(const frame of frames)assert.deepEqual(frame.anchor,[32,60]);assert(frames[3].bounds[3]-frames[3].bounds[1]<frames[0].bounds[3]-frames[0].bounds[1])}
  // Every tournament kind resolves to pixel art and uses its own attacking frame.
  const drawn=await page.evaluate(()=>{
   const kinds=['hero','rival',...['opponents','cityOpponents','provinceOpponents','nationalOpponents','continentOpponents','worldOpponents','planetOpponents'].flatMap(k=>TtakjiProgression[k].map(o=>o.sprite||o.kind))];
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),calls=[];
   const draw=ctx.drawImage.bind(ctx);ctx.drawImage=(im,...args)=>{calls.push({src:im.src,smooth:ctx.imageSmoothingEnabled,args});draw(im,...args)};
   return kinds.map(kind=>{const ok=GameArt.actor(ctx,128,240,kind,0,1,1,{kind:kind==='hero'?'player-hit':'enemy-hit',at:100},100,kind==='hero'?'player':'enemy');return {kind,ok,...calls.at(-1)}});
  });
  for(const d of drawn){assert(d.ok,d.kind);assert(d.src.endsWith('/attack.png'),d.kind);assert.equal(d.smooth,false);assert.deepEqual(d.args,[-48,-90,96,96],d.kind+' keeps its on-screen size and foot anchor')}
  await page.screenshot({path:path.join(dir,'art-title.png')});
  await page.locator('#minimum-new').click();await page.locator('#skip-dialogue').click();await page.locator('#follow-friends').click();
  await page.waitForFunction(()=>G.state==='explore');
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('curtain')).opacity==='0');
  for(const zone of ['yard','home','alley','square','center','lobby','schoolfront']){
   await page.evaluate(zone=>{Exploration.enter(zone,zone==='yard'?950:zone==='square'?870:zone==='lobby'?700:450);artDraws.clear()},zone);
   await page.waitForFunction(zone=>[...artDraws].some(s=>s.endsWith('/panoramas/'+(zone==='yard'?'gazebo':zone)+'.png'))&&[...artDraws].some(s=>s.includes('/characters/hero/')),zone);
   if(zone==='home'||zone==='lobby')await page.waitForFunction(who=>[...artDraws].some(s=>s.endsWith('/'+who+'/idle.png')),zone==='home'?'father':'reception');
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
  });assert.equal(mirror,0,'mirrored pixel contour stays exactly aligned');
  await page.evaluate(()=>{battle('rematch');G.animation={kind:'player-hit',at:G.now,grade:'GOOD'};artDraws.clear()});
  await page.waitForFunction(()=>[...artDraws].some(s=>s.endsWith('/hero/attack.png')));
  await page.evaluate(()=>{G.animation={kind:'enemy-hit',at:G.now,grade:'GOOD'};artDraws.clear()});
  await page.waitForFunction(()=>[...artDraws].some(s=>s.endsWith('/minsu/attack.png')));
  await page.screenshot({path:path.join(dir,'art-battle.png')});
  await page.evaluate(()=>say([['아빠','같은 캐릭터 그림을 사용하는 초상화.']],()=>{}));
  assert(await page.locator('#portrait').evaluate(el=>el.classList.contains('image-portrait')&&el.dataset.artCharacter==='father'&&el.style.backgroundImage.startsWith('url("data:image/png')));
  const portraitSize=await page.locator('#portrait').evaluate(async el=>{
   const portrait=new Image();portrait.src=el.style.backgroundImage.slice(5,-2);await portrait.decode();
   return [portrait.naturalWidth,portrait.naturalHeight];
  });assert.deepEqual(portraitSize,[48,48]);
  await page.screenshot({path:path.join(dir,'art-dialogue.png')});
  await page.locator('#skip-dialogue').click();
  // A missing background keeps the original canvas scene usable.
  const fallback=await page.evaluate(()=>{Exploration.enter('home',420);window.failedArtImage=GameArt.loaded('panoramas/home');failedArtImage.failed=true;artDraws.clear();const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;return GameArt.map(canvas.getContext('2d'),{})});assert.equal(fallback,false);
  await page.waitForFunction(()=>[...artDraws].some(s=>s.endsWith('/hero/idle.png')));
  await page.evaluate(()=>{failedArtImage.failed=false;delete window.failedArtImage});
  // The final opponents use their own sprites even when they share combat AI.
  for(const [hub,group,who]of [['national','nationalOpponents','gyugyeok'],['world','worldOpponents','hangyeol'],['planet','planetOpponents','mujung']]){
   await page.evaluate(([hub,group])=>{cancelScene();Minimum.active=false;G.profile=P.fresh();G.hub=hub;G.opponent=P[group][2];battle('sparring');G.animation={kind:'enemy-hit',at:G.now};artDraws.clear()},[hub,group]);
   await page.waitForFunction(who=>[...artDraws].some(s=>s.endsWith('/'+who+'/attack.png')),who);
  }
  // An unavailable pose still draws the character's native pixel idle sprite.
  assert(await page.evaluate(()=>{
   const frame=GameArt.loaded('characters/hero/walk-b'),c=document.createElement('canvas');c.width=c.height=256;
   try{frame.failed=true;artDraws.clear();return GameArt.actor(c.getContext('2d'),128,240,'hero',140)&&[...artDraws].some(s=>s.endsWith('/hero/idle.png'))}
   finally{frame.failed=false}
  }));
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS 72 64x64 character frames + 48 scene assets, dedicated NPCs and final opponents, fixed feet, walking, mirroring, pixel portraits and fallback');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
