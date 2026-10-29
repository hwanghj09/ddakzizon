// Run npm start first. TEST_URL and BROWSER_EXECUTABLE may override local defaults.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
  await page.locator('#new-game').click();await page.waitForFunction(()=>G.audio?.state==='running');
  const rendered=await page.evaluate(async()=>{
   cancelScene();const live=G.audio,results=[];
   try{
    for(const [kind,grade,muted,paused] of [['click'],['whoosh'],['hit','BAD'],['hit','GOOD'],['hit','PERFECT'],['perfect'],['fold'],['flip'],['win'],['lose'],['hit','GOOD',true],['hit','GOOD',false,true]]){
     G.audio=new OfflineAudioContext(1,48000,48000);G.sound=!muted;G.paused=!!paused;sound(kind,grade);
     const samples=(await G.audio.startRendering()).getChannelData(0);
     let energy=0,peak=0,tail=0,finite=true;
     for(let i=0;i<samples.length;i++){finite=finite&&Number.isFinite(samples[i]);energy+=samples[i]**2;peak=Math.max(peak,Math.abs(samples[i]));if(i>45600)tail=Math.max(tail,Math.abs(samples[i]))}
     results.push({kind,grade,muted,paused,rms:Math.sqrt(energy/samples.length),peak,tail,finite})
    }
   }finally{G.audio=live;G.sound=true;G.paused=false}
   return results
  });
  for(const effect of rendered){
   assert(effect.finite,`${effect.kind}: finite samples`);assert(effect.peak<1,`${effect.kind}: no clipping`);
   assert.equal(effect.tail,0,`${effect.kind}: ends within one second`);
   if(effect.muted||effect.paused)assert.equal(effect.rms,0,`${effect.kind}: silent while muted or paused`);
   else assert(effect.rms>.001,`${effect.kind}: audible output`)
  }
  const hits=rendered.filter(s=>s.kind==='hit'&&!s.muted&&!s.paused);
  assert(hits[1].rms>hits[0].rms*1.4);assert(hits[2].rms>hits[1].rms*1.2);
  await page.evaluate(()=>{
   window.audioEvents=[];const play=sound;sound=(kind,grade)=>{audioEvents.push([kind,grade]);play(kind,grade)};
   cancelScene();battle('rematch');G.enemyHp=1;R.positionAt=()=>.5
  });
  await page.locator('#attack').click();await page.locator('#strike').click();
  await page.waitForFunction(()=>G.state==='result');
  assert.deepEqual(await page.evaluate(()=>audioEvents.map(e=>e[0])),['click','whoosh','hit','perfect','flip','win']);
  assert.equal(await page.evaluate(()=>audioEvents.find(e=>e[0]==='hit')[1]),'PERFECT');
  await page.evaluate(()=>{audioEvents=[];cancelScene();battle('intro_battle');enemyTurn()});
  await page.waitForFunction(()=>audioEvents.some(e=>e[0]==='lose'));
  assert.deepEqual(await page.evaluate(()=>audioEvents.map(e=>e[0])),['whoosh','hit','flip','lose']);
  await page.evaluate(()=>{audioEvents=[];cancelScene();G.state='folding';G.fold=0;foldCorner(0)});
  assert.deepEqual(await page.evaluate(()=>audioEvents.map(e=>e[0])),['fold']);
  await page.locator('#pause').click();await page.waitForFunction(()=>G.audio.state==='suspended');
  await page.locator('[data-menu="settings"]').click();
  await page.locator('#menu-sound').click();await page.locator('#menu-sound').click();
  assert.equal(await page.evaluate(()=>G.audio.state),'suspended');
  await page.locator('#resume').click();await page.waitForFunction(()=>G.audio.state==='running');
  await page.locator('#sound').click();await page.waitForFunction(()=>G.audio.state==='suspended');
  await page.reload();assert.equal(await page.evaluate(()=>G.sound),false);
  await page.locator('#new-game').click();assert.equal(await page.evaluate(()=>G.audio),null);
  await page.waitForFunction(()=>!document.getElementById('hud').hidden);
  await page.locator('#sound').click();await page.waitForFunction(()=>G.audio?.state==='running');
  const fallback=await browser.newPage();fallback.on('pageerror',e=>errors.push(e.message));
  await fallback.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined});
  await fallback.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await fallback.locator('#new-game').click();
  await fallback.evaluate(()=>['click','whoosh','hit','perfect','fold','flip','win','lose'].forEach(kind=>sound(kind)));
  assert.equal(await fallback.evaluate(()=>G.audio),null);assert.deepEqual(errors,[]);
  console.log('PASS rendered effects, hit strength, combat/folding cues, mute persistence, pause/resume and missing Web Audio')
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
