const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),P=require('../progression.js'),J=require('../journey-data.js');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 const profile=P.fresh();P.grantHomeAllowance(profile);P.upgradeAtHome(profile);P.finishHomePractice(profile,['GOOD','GOOD','GOOD']);P.schoolReward(profile);profile.map.poster=true;
 await page.evaluate(profile=>localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint:'village',profile})),profile);
 const fast=async()=>page.evaluate(()=>{const original=update;update=dt=>original(dt*(G.state==='explore'?1:8));TtakjiRules.positionAt=()=>.5;Math.random=()=>.5});
 const dialogue=async()=>{for(let i=0;i<100;i++){const s=await page.evaluate(()=>G.state);if(s==='dialogue')await page.locator('#next').click();else if(s==='transition')await page.waitForTimeout(50);else return}throw Error('Dialogue did not finish')};
 const resume=async()=>{await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>['explore','dialogue'].includes(G.state));await fast();await dialogue()};await resume();
 const hit=async(grade='PERFECT')=>{await page.waitForFunction(()=>G.state==='ready');await page.evaluate(grade=>TtakjiRules.positionAt=()=>grade==='BAD'?0:grade==='GOOD'?.35:.5,grade);await page.locator('#attack').click();await page.locator('#strike').click();await page.waitForFunction(()=>['ready','result'].includes(G.state))};
 const finishFight=async(skipSkills=false)=>{for(let i=0;i<25&&await page.evaluate(()=>G.state!=='result');i++){
  const data=await page.evaluate(()=>({intent:P.intent(G.opponent.kind,G.round),goal:G.storyJob?.activity.goal,focus:G.focusAvailable,guard:G.guardAvailable,power:G.powerAvailable,hp:G.hp,attack:G.opponent.attack}));await page.locator('#game').focus();
  if(!skipSkills){if(data.focus)await page.keyboard.press('KeyF');if(data.guard&&(data.goal==='guard'||data.intent.perfect||data.hp<data.attack*2))await page.keyboard.press('KeyR');if(data.power&&(data.goal==='power'||data.intent.exposed||(!data.intent.defending&&!['charger','fortress','national_champion'].includes(await page.evaluate(()=>G.opponent.kind)))))await page.keyboard.press('KeyC')}
  await hit();
 }assert.equal(await page.evaluate(()=>G.state),'result');};
 // A fresh campaign cannot jump directly into a tournament.
 await page.evaluate(()=>Village.open('cup'));assert.equal(await page.getByRole('button',{name:/ 출전$/}).count(),0);await page.getByRole('button',{name:'1회전 · 이야기 먼저'}).click();assert.equal(await page.evaluate(()=>G.facility),'stories');await page.evaluate(()=>Village.startTournament());assert.equal(await page.evaluate(()=>G.facility),'stories');
 await page.screenshot({path:path.join(artifacts,'journey-notebook.png')});
 await page.keyboard.press('KeyJ');assert(await page.locator('#pause-screen').isVisible());assert.equal(await page.evaluate(()=>GameMenu.view),'journal');assert((await page.locator('#menu-body').textContent()).includes('같이 놀 사람'));await page.keyboard.press('KeyJ');
 // Accuracy matters; failure pays nothing and offers preparation/retry.
 await page.locator('#journey-start').click();await dialogue();await page.waitForFunction(()=>G.state==='ready');for(let i=0;i<5;i++)await hit('BAD');assert.equal(await page.evaluate(()=>G.profile.coins),80);assert.equal(await page.evaluate(()=>G.profile.journey.stages.village_0||0),0);assert(await page.locator('#result-secondary').isVisible());await page.locator('#continue').click();await dialogue();await page.waitForFunction(()=>G.state==='ready');
 await page.evaluate(()=>TtakjiRules.positionAt=()=>.5);await page.locator('#attack').click();await page.keyboard.press('Escape');const frozen=await page.evaluate(()=>G.now);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>G.now),frozen);await page.locator('#resume').click();await page.locator('#strike').click();await page.waitForFunction(()=>G.state==='ready');for(const grade of ['GOOD','BAD','GOOD','BAD'])await hit(grade);
 assert.equal(await page.evaluate(()=>G.profile.journey.stages.village_0),1);assert.equal(await page.evaluate(()=>G.profile.coins),90);assert.deepEqual(await page.evaluate(()=>G.profile.journey.pending),{id:'village_0',step:0});
 await resume();assert.equal(await page.evaluate(()=>G.facility),'stories');assert.equal(await page.evaluate(()=>G.profile.coins),90);assert.equal(await page.evaluate(()=>G.profile.journey.pending),null);
 // Winning without a promised skill is a retry, not a paid completion.
 await page.locator('#journey-start').click();await dialogue();await page.waitForFunction(()=>G.state==='ready');await finishFight(true);assert((await page.locator('#result-title').textContent()).includes('약속'));assert.equal(await page.evaluate(()=>G.profile.journey.stages.village_0),1);assert.equal(await page.evaluate(()=>G.profile.coins),90);await page.locator('#result-secondary').click();await page.waitForFunction(()=>G.state==='explore');
 const prepare=async()=>{
  await page.evaluate(()=>Village.hub().open('press'));
  if(await page.evaluate(()=>G.profile.owned.includes('hair')&&G.profile.equipped!=='hair')){await page.keyboard.press('KeyI');await page.locator('[data-item="hair"]').click();await page.locator('#equip-item').click();await page.keyboard.press('KeyI')}
  for(let i=0;i<20;i++){const b=page.getByRole('button',{name:/압축하기/});if(await b.count()===0||await b.isDisabled())break;await b.click()}
  await page.locator('#facility-close').click();
 };
 let activities=1;
 for(const region of Object.keys(J.regions)){
  for(const e of J.episodes.filter(e=>e.region===region)){
   for(let step=await page.evaluate(id=>G.profile.journey.stages[id]||0,e.id);step<2;step++){
    await prepare();await page.evaluate(id=>{Journeys.selected=id;Village.hub().open('stories')},e.id);await page.locator('#journey-start').click();await dialogue();await page.waitForFunction(()=>G.state==='ready');
    if(e.steps[step].type==='drill'){for(let i=0;i<5;i++)await hit()}else await finishFight();
    assert.equal(await page.evaluate(id=>G.profile.journey.stages[id],e.id),step+1,`${e.id} step ${step} should complete with normally earned equipment`);activities++;
    await page.locator('#continue').click();await dialogue();assert.equal(await page.evaluate(()=>G.facility),'stories');assert.equal(await page.evaluate(()=>G.profile.journey.pending),null);
   }
   assert(await page.evaluate(region=>J.canCompete(G.profile,region),region));await prepare();await page.evaluate(()=>Village.hub().open('cup'));await page.getByRole('button',{name:/ 출전$/}).click();await dialogue();await page.waitForFunction(()=>G.state==='ready');await finishFight();assert.equal(await page.evaluate(field=>G.profile[field],J.regions[region].field),e.round+1,`${region} tournament remains winnable`);
   await page.locator('#continue').click();await dialogue();await page.waitForFunction(()=>G.state==='explore');
  }
  if(region!=='national'){
   await page.evaluate(()=>Village.hub().open('cup'));const next={village:'시',city:'도',province:'전국'}[region];await page.getByRole('button',{name:`${next} 대회에 도전`,exact:true}).click();await dialogue();await page.waitForFunction(()=>G.state==='explore');
  }
 }
 assert.equal(activities,24);assert.equal(await page.evaluate(()=>Object.values(G.profile.journey.stages).filter(n=>n===2).length),12);assert.equal(await page.evaluate(()=>G.profile.nationalRound),3);
 // Story replay does not pay again; journal fits a smaller PC screen.
 const saved=await page.evaluate(()=>({coins:G.profile.coins,xp:G.profile.xp}));await page.evaluate(()=>National.open('stories'));await page.locator('#journey-start').click();await dialogue();assert.deepEqual(await page.evaluate(()=>({coins:G.profile.coins,xp:G.profile.xp})),saved);
 await page.setViewportSize({width:1024,height:600});await page.keyboard.press('KeyJ');const box=await page.locator('.game-menu').boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=1024&&box.y+box.height<=600);await page.screenshot({path:path.join(artifacts,'journey-complete.png')});await page.keyboard.press('KeyJ');
 await resume();assert.equal(await page.evaluate(()=>G.profile.nationalRound),3);assert.equal(await page.evaluate(()=>Object.values(G.profile.journey.stages).filter(n=>n===2).length),12);
 await page.keyboard.press('Escape');await page.locator('#return-title').click();await page.locator('#new-game').click();assert.equal(await page.evaluate(()=>Object.keys(G.profile.journey.stages).length),0);
 assert.deepEqual(errors,[]);console.log('PASS all 24 story activities and 12 tournament matches using earned upgrades; accuracy/skill failures, gating, pending reward reload, pause, journal, replay and reset');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
