const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),P=require('../progression.js');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 const profile=require('./prepared-profile.cjs')(P.fresh());P.schoolReward(profile);for(let i=0;i<3;i++)P.award(profile,i);P.equip(profile,'hair');P.upgrade(profile);P.upgrade(profile);delete profile.cityEntered;delete profile.cityRound;delete profile.powerUnlocked;
 await page.evaluate(profile=>localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint:'village',profile})),profile);await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='explore');
 const dialogue=async()=>{for(let i=0;i<100;i++){const state=await page.evaluate(()=>G.state);if(state==='dialogue'){await page.locator('#next').click();await page.waitForTimeout(20)}else if(state==='transition')await page.waitForTimeout(100);else return}throw Error('dialogue did not finish')};
 const visit=async(id)=>{await page.waitForFunction(()=>G.state==='explore');await page.evaluate(id=>Village.hub().open(id),id);await page.waitForFunction(()=>G.state==='facility')}; // Walking and entrances are covered in exploration.browser.cjs.

 const fast=()=>page.evaluate(()=>{const original=update;update=dt=>original(dt*(G.state==='explore'?1:5));TtakjiRules.positionAt=()=>.5;Math.random=()=>.5});
 await visit('cup');await page.getByRole('button',{name:'시 대회에 도전'}).click();await page.waitForFunction(()=>G.state==='dialogue');assert.equal(await page.evaluate(()=>G.checkpoint),'city_intro');await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='dialogue');await dialogue();await page.waitForFunction(()=>G.scene==='city'&&G.state==='explore');
 assert.equal(await page.evaluate(()=>P.upgradeLimit(G.profile)),8);assert.equal(await page.evaluate(()=>P.trainingLimit(G.profile)),30);await page.screenshot({path:path.join(artifacts,'city-hub.png')});
 await visit('press');assert((await page.locator('#facility-content').textContent()).includes('머리카락'));await page.getByRole('button',{name:/압축하기/}).click();assert.equal(await page.evaluate(()=>G.profile.upgrades.hair),3);await page.locator('#facility-close').click();await fast();
 await visit('training');await page.getByRole('button',{name:'타이밍 훈련 · 3번 치기'}).click();
 const attack=async()=>{await page.waitForFunction(()=>G.state==='ready');await page.locator('#attack').click();await page.locator('#strike').click();await page.waitForFunction(()=>['ready','result'].includes(G.state))};
 for(let i=0;i<3;i++)await attack();await page.locator('#continue').click();await page.waitForFunction(()=>G.scene==='city'&&G.state==='explore');assert.equal(await page.evaluate(()=>G.profile.coins),75);
 for(let round=0;round<3;round++){
  await visit('cup');await page.screenshot({path:path.join(artifacts,`city-bracket-${round}.png`)});await page.getByRole('button',{name:/출전/}).click();await dialogue();await page.waitForFunction(()=>G.state==='ready');
  if(round===0)assert(await page.locator('#power').isHidden());else assert(await page.locator('#power').isVisible());
  for(let turn=0;turn<15&&await page.evaluate(()=>G.state!=='result');turn++){
   const current=await page.evaluate(()=>G.round);
   if(current===2){await page.locator('#game').focus();await page.keyboard.press('KeyF');if(round>0){await page.keyboard.press('KeyC');assert.equal(await page.evaluate(()=>G.powerAvailable),false);assert.equal(await page.evaluate(()=>G.powered),true)}}
   if(current===3){await page.locator('#game').focus();await page.keyboard.press('KeyR')}
   await attack();
   if(round===1&&current===1)assert.equal(await page.evaluate(()=>G.enemyMax-G.enemyHp),74,'PERFECT should bypass the folding master defense');
  }
  assert.equal(await page.evaluate(()=>G.profile.cityRound),round+1);assert.equal(await page.evaluate(()=>G.profile.round),3);
  if(round===0){assert.equal(await page.evaluate(()=>G.checkpoint),'city_skill');await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='dialogue');await dialogue();assert.equal(await page.evaluate(()=>G.profile.coins),155);await fast()}
  else if(round===2){assert.equal(await page.evaluate(()=>G.checkpoint),'city_reward');await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.state==='dialogue');assert(await page.evaluate(()=>G.dialogue.some(line=>line[1].includes('세계를 뒤집어'))));await dialogue();assert.equal(await page.evaluate(()=>G.profile.coins),595)}
  else{await page.locator('#continue').click();await dialogue()}
  await page.waitForFunction(()=>G.state==='explore'&&G.scene==='city');
  if(round===0){await visit('bus');await page.getByRole('button',{name:'마을로 돌아가기'}).click();await page.waitForFunction(()=>G.state==='explore'&&G.scene==='village');await visit('cup');await page.getByRole('button',{name:'시 대회장으로 이동'}).click();await page.waitForFunction(()=>G.state==='explore'&&G.scene==='city');assert.equal(await page.evaluate(()=>G.profile.cityRound),1)}
 }
 await page.keyboard.press('Escape');assert((await page.locator('#menu-body').textContent()).includes('시 대회 챔피언'));assert((await page.locator('#menu-body').textContent()).includes('도 대회 출전권'));await page.locator('[data-menu="player"]').click();assert((await page.locator('#menu-body').textContent()).includes('승부수'));await page.locator('#resume').click();
 await visit('cup');await page.getByRole('button',{name:'대장과 연습 대결 · 보상 없음'}).click();await page.waitForFunction(()=>G.state==='ready');await page.waitForTimeout(450);await page.screenshot({path:path.join(artifacts,'city-final-battle.png')});await page.keyboard.press('KeyI');await page.locator('[data-item="newspaper"]').click();assert(await page.locator('#equip-item').isDisabled());await page.keyboard.press('KeyI');await page.keyboard.press('Escape');await page.locator('#return-title').click();assert.equal(await page.evaluate(()=>G.tasks.length),0);
 assert.deepEqual(errors,[]);console.log('PASS legacy city unlock, intro/skill/final checkpoint reload, keyboard city facilities, growth, training return, 3-round championship, wager, PERFECT pierce, travel, rewards, menu and battle inventory lock');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
