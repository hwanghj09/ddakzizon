const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TEST_URL||'http://127.0.0.1:4173',dir=process.env.ARTIFACT_DIR||'/tmp/ddakzizon-checks';
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[],legacy=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(!r.ok())failed.push(r.url());if(r.url().includes('/assets/art/'))legacy.push(r.url())});
  await page.goto(base);await page.evaluate(()=>GameArt.ready);
  assert.equal(await page.evaluate(()=>GameArt.style),'pixel-village');
  assert.equal(await page.evaluate(()=>GameArt.uiStyle),'illustrated-paper');
  assert(await page.evaluate(()=>document.fonts.check('16px Jua')&&document.fonts.check('24px GamjaFlower')),'local illustration UI fonts load');
  assert(await page.evaluate(()=>document.fonts.check('12px Galmuri11')),'bundled Korean pixel font loads');
  await page.screenshot({path:path.join(dir,'art-title.png')});
  await page.locator('#minimum-new').click();await page.locator('#skip-dialogue').click();await page.waitForFunction(()=>G.state==='explore');
  // Every part of a wide scrolling map must remain painted, including beyond x=960.
  for(const zone of ['yard','home','alley','square','center','lobby','schoolfront','city','province','national']){
   const coverage=await page.evaluate(zone=>{
    const z=Exploration.zones[zone];Exploration.enter(zone,z.width-490);
    const c=document.createElement('canvas');c.width=960;c.height=600;
    GameArt.map(c.getContext('2d'),{});
    const data=c.getContext('2d').getImageData(0,0,960,600).data;
    return [0,100,500,959].flatMap(x=>[10,150,390,590].map(y=>data[(y*960+x)*4+3]));
   },zone);
   assert(coverage.every(a=>a===255),zone+' has no unpainted sky or ground at the far end');
   await page.waitForTimeout(80);await page.screenshot({path:path.join(dir,'art-'+zone+'.png')});
  }
  // Changing from the village to a late-game hub must replace the objective and E prompt.
  for(const id of ['continent','world','planet']){
   const hud=await page.evaluate(id=>{
    const tier=Tiers[id];G.mapZone=null;G.scene=G.hub=id;G.state='explore';G.hero={x:tier.places[0].x,y:365,walk:0,facing:1};
    const c=document.createElement('canvas');c.width=960;c.height=600;GameArt.hub(c.getContext('2d'),id,tier.places);
    return {name:tier.name,place:tier.places[0].name,location:document.querySelector('#map-location').textContent,prompt:document.querySelector('#interaction-prompt strong').textContent,hidden:document.querySelector('#interaction-prompt').hidden};
   },id);
   assert(hud.location.startsWith(hud.name));assert.equal(hud.prompt,hud.place);assert.equal(hud.hidden,false);
  }
  await page.evaluate(()=>Exploration.enter('yard',700));const x=await page.evaluate(()=>G.hero.x);
  await page.keyboard.down('ArrowRight');await page.waitForFunction(x=>G.hero.x>x+40,x);await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>G.hero.facing===-1);await page.keyboard.up('ArrowLeft');
  // Rendered poses differ, stay within the same bounds, and keep the feet anchored.
  const poses=await page.evaluate(()=>['idle','walk-a','walk-b','attack','mirror'].map(pose=>{
   const c=document.createElement('canvas');c.width=256;c.height=256;
   GameArt.actor(c.getContext('2d'),128,220,'hero',pose==='walk-a'?10:pose==='walk-b'?140:0,1,pose==='mirror'?-1:1,pose==='attack'?{kind:'player-hit',at:100}:null,150);
   const a=c.getContext('2d').getImageData(0,0,256,256).data;let minX=256,maxX=0,minY=256,maxY=0,hash=0;
   for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4;if(a[i+3]){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);hash=(Math.imul(hash,31)+a[i]+a[i+1]+a[i+2])|0}}
   return {pose,minX,maxX,minY,maxY,hash};
  }));
  assert(new Set(poses.map(p=>p.hash)).size>=4,'walking, attack and facing visibly change the character');
  for(const p of poses){assert(p.minX>70&&p.maxX<190,p.pose+' fits the character frame');assert.equal(p.maxY,225,p.pose+' keeps the same ground anchor')}
  await page.evaluate(()=>battle('rematch'));await page.waitForTimeout(150);
  await page.locator('#attack').click();await page.waitForFunction(()=>G.state==='timing');
  await page.screenshot({path:path.join(dir,'art-battle.png')});
  await page.keyboard.press('Escape');const now=await page.evaluate(()=>G.now);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>G.now),now);await page.locator('#resume').click();await page.locator('#strike').click();
  await page.evaluate(()=>say([['아빠','한 장씩 접다 보면, 네 손에 맞는 딱지가 될 거야.']],()=>{}));
  await page.waitForFunction(()=>document.querySelector('#portrait').dataset.artCharacter==='neighbor'&&document.querySelector('#portrait').classList.contains('image-portrait')&&document.querySelector('#portrait').dataset.portraitStyle==='illustrated'&&document.querySelector('#portrait').style.backgroundImage.includes('data:image/png'));
  assert(await page.locator('#portrait').evaluate(el=>el.classList.contains('image-portrait')&&el.dataset.artCharacter==='neighbor'&&el.style.backgroundImage.startsWith('url("data:image/png')));
  await page.waitForTimeout(300);await page.screenshot({path:path.join(dir,'art-dialogue.png')});
  await page.locator('#skip-dialogue').click();
  for(const [width,height]of [[1280,720],[1024,600]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>Exploration.enter('yard',950));await page.waitForTimeout(100);
   for(const selector of ['#interaction-prompt','.explore-controls','.map-shortcut','#map-hud','.top-actions']){
    const b=await page.locator(selector).boundingBox();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=width+1&&b.y+b.height<=height+1,selector+' stays inside '+width+'x'+height);
   }
   await page.locator('.map-shortcut').click();assert.equal(await page.evaluate(()=>GameMenu.view),'map');await page.waitForTimeout(200);
   await page.screenshot({path:path.join(dir,`art-map-menu-${width}.png`)});await page.locator('#resume').click();
   await page.locator('.map-shortcut').focus();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>G.paused&&GameMenu.view==='map'),true);await page.locator('#resume').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'game');
  }
  // A delayed portrait for the previous speaker cannot replace the current speaker.
  await page.route('**/assets/art/characters/globe/idle.png',async route=>{await new Promise(resolve=>setTimeout(resolve,180));await route.continue()});
  const latePortrait=page.waitForResponse(r=>r.url().endsWith('/characters/globe/idle.png'));
  await page.evaluate(()=>{window.uiPortraitProbe=document.createElement('div');GameArt.portrait(uiPortraitProbe,'globe');GameArt.portrait(uiPortraitProbe,'friend')});
  await page.waitForFunction(()=>uiPortraitProbe.dataset.artCharacter==='friend'&&uiPortraitProbe.classList.contains('image-portrait'));
  const currentPortrait=await page.evaluate(()=>uiPortraitProbe.style.backgroundImage);
  await latePortrait;await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>uiPortraitProbe.style.backgroundImage),currentPortrait,'late image keeps the current speaker portrait');
  assert(legacy.every(url=>url.includes('/characters/')),'excluded background and prop PNGs stay unloaded; character art is used for illustrated portraits');assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS illustrated UI and pixel world: local handwritten fonts/portrait and async speaker switching, ten scrolling maps fully painted, real keyboard walking/facing, distinct anchored poses, shared portrait, battle timing/pause and PC HUD/map-button bounds');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
