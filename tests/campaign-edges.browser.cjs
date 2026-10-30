// Run npm start first. Override TEST_URL, BROWSER_EXECUTABLE or ARTIFACT_DIR as needed.
const fs=require('node:fs'),path=require('node:path');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
const {chromium}=require('playwright');const assert=require('node:assert/strict'),P=require('../progression.js');
(async()=>{const b=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().includes('/hair/'))requests.push(r.status())});
 const saved=require('./prepared-profile.cjs')(P.fresh());P.schoolReward(saved);P.award(saved,0);
 await p.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 await p.evaluate(profile=>localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint:'village',profile})),saved);await p.reload();await p.locator('#load-game').click();await p.waitForFunction(()=>G.state==='explore');
 const fast=async()=>p.evaluate(()=>{const real=update;update=dt=>real(dt*5);TtakjiRules.positionAt=()=>0;Math.random=()=>.5});await fast();
 const start=async()=>{await p.evaluate(()=>{Village.open('cup');Village.startTournament()});while(await p.evaluate(()=>G.state==='dialogue')){await p.locator('#next').click();await p.waitForTimeout(25)}await p.waitForFunction(()=>G.state==='ready')};
 await start();await p.evaluate(()=>G.hp=1);await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>G.state==='result');assert.equal(await p.evaluate(()=>G.profile.round),1);assert.equal(await p.evaluate(()=>G.profile.coins),130);
 assert.equal(await p.locator('#continue').textContent(),'재도전 →');assert.equal(await p.locator('#result-secondary').textContent(),'준비 화면');assert.equal(await p.locator('#result-extra button').textContent(),'마을로');assert((await p.locator('#result-text').textContent()).includes('이긴 경기와 상금은 그대로'));
 // Retry goes straight back into the same match (the intro scene was already seen); progress and money are unchanged.
 await p.locator('#continue').click();await p.waitForFunction(()=>G.state==='ready');assert.deepEqual(await p.evaluate(()=>[G.opponent.name,G.profile.round,G.profile.coins,G.match.index]),['하나',1,130,1]);
 // Reconnecting mid-tournament resumes at the bracket after the last finished match.
 await p.reload();await p.locator('#load-game').click();await p.waitForFunction(()=>G.state==='facility'&&G.facility==='bracket');assert((await p.locator('#next-opponent').textContent()).includes('하나'));assert.equal(await p.evaluate(()=>G.mapZone),'lobby');await fast();
 await p.locator('#tournament-prep').click();await p.waitForFunction(()=>G.facility==='prep');await p.locator('#match-start').click();await p.waitForFunction(()=>G.state==='ready');await p.locator('#attack').click();await p.locator('#strike').click();await p.keyboard.press('Escape');await p.locator('#return-title').click();await p.waitForTimeout(700);assert.equal(await p.evaluate(()=>G.state),'title');assert.equal(await p.evaluate(()=>G.tasks.length),0);assert.equal(await p.evaluate(()=>G.profile.round),1);
 // Resume at the reward checkpoint, preserving the already-awarded prize exactly once.
 for(let i=1;i<3;i++)P.award(saved,i);P.equip(saved,'hair');
 await p.evaluate(profile=>localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint:'village_reward',profile})),saved);await p.reload();await p.locator('#load-game').click();await p.waitForFunction(()=>G.state==='dialogue');
 while(await p.evaluate(()=>['dialogue','transition'].includes(G.state))){if(await p.evaluate(()=>G.state==='dialogue'))await p.locator('#next').click();await p.waitForTimeout(25)}await p.waitForFunction(()=>G.state==='explore');assert.equal(await p.evaluate(()=>G.profile.coins),350);assert.deepEqual(await p.evaluate(()=>G.profile.skills),['precise']);
 await p.evaluate(()=>{window.drawnHair=new Set();const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img,...args){if(img.src?.includes('/hair/'))drawnHair.add(img.src.split('/').pop());return draw.call(this,img,...args)};G.opponent=TtakjiProgression.opponents[2];battle('sparring');Math.random=()=>.5;TtakjiRules.positionAt=()=>0});
 await p.locator('#game').focus();assert(await p.locator('#skill-press').isHidden());await p.keyboard.press('KeyF');assert.equal(await p.evaluate(()=>G.state),'ready');await p.keyboard.press('KeyR');assert.equal(await p.evaluate(()=>G.gaugeDuration),1500);assert(await p.evaluate(()=>G.skill==='precise'&&G.zones.perfect===TtakjiRules.zones(1).perfect),'Hair focus +1 widens the zones');await p.locator('#strike').click();await p.waitForFunction(()=>G.state==='ready');assert.equal(await p.evaluate(()=>G.enemyMax-G.enemyHp),13,'Precise BAD: (28+4-5)*0.6*0.8');assert.equal(await p.evaluate(()=>G.maxHp-G.hp),21,'박태풍 NORMAL: (22+4-5)');assert.equal(await p.evaluate(()=>G.cool.precise),2);assert(await p.locator('#skill-precise').isDisabled());
 await p.screenshot({path:path.join(artifacts,'village-hair-battle.png')});
 await p.evaluate(()=>{G.hp=1});await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>G.flipPlayer>0);await p.waitForTimeout(850);
 for(const state of ['base','damaged','flipped'])assert(await p.evaluate(state=>drawnHair.has('ttakji_hair_'+state+'.png'),state),state+' not drawn');
 await p.waitForFunction(()=>G.state==='result');assert.equal(await p.evaluate(()=>G.profile.coins),350);
 assert(requests.length>=4&&requests.every(s=>s===200));assert.deepEqual(errors,[]);
 console.log('PASS tournament loss/retry buttons, retry keeps progress, reconnect resumes at bracket, cancellation, reward reload once, hair states, focus-widened zones, precise cooldown, no sparring reward');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
