// Run npm start first. Override TEST_URL, BROWSER_EXECUTABLE or ARTIFACT_DIR as needed.
const fs=require('node:fs'),path=require('node:path');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('seeded')){localStorage.setItem('ddakzizon.chapter1.v2',JSON.stringify({version:2,checkpoint:'complete'}));localStorage.setItem('seeded','yes')}});
 await p.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await p.locator('#load-game').click();
 await p.waitForFunction(()=>G.state==='dialogue');
 const dialogues=async()=>{for(let i=0;i<100;i++){const state=await p.evaluate(()=>G.state);if(state==='dialogue'){await p.locator('#next').click();await p.waitForTimeout(30)}else if(state==='transition'){await p.waitForTimeout(450)}else return}throw Error('dialogue loop')};
 await dialogues();await p.waitForFunction(()=>G.scene==='village'&&G.state==='explore');
 await p.evaluate(()=>{G.profile.map.poster=true;G.profile.journey.stages=Object.fromEntries(J.episodes.map(e=>[e.id,2]));checkpoint('village')}); // Combat regression starts after the story activities.
 assert.equal(await p.evaluate(()=>G.profile.coins),80);await p.screenshot({path:path.join(artifacts,'village-hub.png')});
 const visit=async(id)=>{await p.waitForFunction(()=>G.state==='explore');await p.evaluate(id=>Village.open(id),id);await p.waitForFunction(()=>G.state==='facility')}; // Walking and entrances are covered in exploration.browser.cjs.

 const leave=async()=>{await p.locator('#facility-close').click()};
 await visit('house');await p.getByRole('button',{name:/색종이 딱지/}).click();assert.equal(await p.evaluate(()=>G.profile.equipped),'colored_paper');await leave();
 await visit('press');await p.screenshot({path:path.join(artifacts,'village-press.png')});await p.getByRole('button',{name:/압축하기/}).click();assert.equal(await p.evaluate(()=>G.profile.coins),40);assert(await p.getByRole('button',{name:/잔액 부족/}).isDisabled());await leave();
 // Speed up simulation, preserving combat animations, callbacks and UI actions.
 await p.evaluate(()=>{const realUpdate=update;update=dt=>realUpdate(dt*(G.state==='explore'?1:5));TtakjiRules.positionAt=()=>.5;Math.random=()=>.5});
 const attack=async()=>{await p.waitForFunction(()=>G.state==='ready');await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>G.state==='ready'||G.state==='result')};
 await visit('training');await p.getByRole('button',{name:'타이밍 훈련 · 3번 치기'}).click();for(let i=0;i<3;i++)await attack();assert.equal(await p.evaluate(()=>G.profile.xp),1);assert.equal(await p.evaluate(()=>G.profile.coins),45);await p.locator('#continue').click();await p.waitForFunction(()=>G.state==='explore');
 for(let round=0;round<3;round++){
  await visit('cup');await p.getByRole('button',{name:/출전/}).click();await dialogues();await p.waitForFunction(()=>G.state==='ready');
  if(round===0){await p.locator('#game').focus();await p.keyboard.press('KeyF');assert.equal(await p.evaluate(()=>G.focusAvailable),false)}
  for(let i=0;i<15&&await p.evaluate(()=>G.state!=='result');i++)await attack();
  assert.equal(await p.evaluate(()=>G.profile.round),round+1);await p.locator('#continue').click();await dialogues();await p.waitForFunction(()=>G.state==='explore');
 }
 assert.equal(await p.evaluate(()=>G.profile.coins),245);assert(await p.evaluate(()=>G.profile.guardUnlocked));
 await visit('house');await p.getByRole('button',{name:/머리카락 딱지/}).click();await p.screenshot({path:path.join(artifacts,'village-reward.png')});await leave();
 await p.reload();await p.locator('#load-game').click();await p.waitForFunction(()=>G.state==='explore');assert.equal(await p.evaluate(()=>G.profile.equipped),'hair');assert.equal(await p.evaluate(()=>G.profile.coins),245);
 await visit('training');await p.getByRole('button',{name:'연습 대결 · 보상 없음'}).click();await p.waitForFunction(()=>G.state==='ready');await p.locator('#game').focus();await p.keyboard.press('KeyR');assert(await p.evaluate(()=>G.guarding));assert(await p.locator('#guard').isDisabled());
 await p.keyboard.press('Escape');const now=await p.evaluate(()=>G.now);await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>G.now),now);await p.locator('#resume').click();
 assert.deepEqual(errors,[]);console.log('PASS migrated school ending, village keyboard movement, equipment, compression, training, 3-round cup, prize, skill, reload and pause');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
