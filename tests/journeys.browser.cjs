const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),P=require('../progression.js'),J=require('../journey-data.js');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 const profile=P.fresh();profile.map.phase='rematch';P.schoolReward(profile);profile.map.poster=true;
 await page.evaluate(profile=>localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint:'village',profile})),profile);
 const fast=async()=>page.evaluate(()=>{const original=update;update=dt=>original(dt*(G.state==='explore'?1:8));TtakjiRules.positionAt=()=>.5;Math.random=()=>.5});
 const dialogue=async()=>{for(let i=0;i<200;i++){const s=await page.evaluate(()=>G.state);if(s==='dialogue')await page.locator('#next').click();else if(['transition','cinematic'].includes(s))await page.waitForTimeout(50);else return}throw Error('Dialogue did not finish')};
 const resume=async()=>{await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>['explore','dialogue'].includes(G.state));await fast();await dialogue()};await resume();
 const hit=async(grade='PERFECT')=>{await page.waitForFunction(()=>G.state==='ready');await page.evaluate(grade=>TtakjiRules.positionAt=()=>grade==='BAD'?0:grade==='GOOD'?.4:.5,grade);await page.locator('#attack').click();await page.locator('#strike').click();await page.waitForFunction(()=>['ready','result','dialogue'].includes(G.state))};
 const finishFight=async(skipSkills=false)=>{for(let i=0;i<25&&await page.evaluate(()=>G.state!=='result');i++){
  if(await page.evaluate(()=>G.state==='dialogue')){await dialogue();continue}// Tournament win scenes play before the result screen.
  await page.waitForFunction(()=>['ready','result','dialogue'].includes(G.state));if(await page.evaluate(()=>G.state!=='ready'))continue;
  const d=await page.evaluate(()=>{const can=id=>G.skillSet.includes(id)&&TtakjiRules.canUse(G.cool,id);return {intent:P.intent(G.opponent.kind,G.round),goal:G.storyJob?.activity.goal,precise:can('precise'),smash:can('smash'),press:can('press'),hp:G.hp/G.maxHp,enemy:G.enemyHp/G.enemyMax}});
  const key=skipSkills?null:d.press&&(d.goal==='press'||d.hp<.35)?'KeyF':d.smash&&(d.goal==='smash'||d.intent.exposed||!d.intent.defending)?'KeyC':d.precise&&(d.goal==='precise'||d.enemy<.6)?'KeyR':null;
  if(!key){await hit();continue}
  await page.evaluate(()=>TtakjiRules.positionAt=()=>.5);await page.locator('#game').focus();await page.keyboard.press(key);
  if(key!=='KeyF'){assert.equal(await page.evaluate(()=>G.state),'timing');await page.locator('#strike').click()}
  await page.waitForFunction(()=>['ready','result','dialogue'].includes(G.state));
 }assert.equal(await page.evaluate(()=>G.state),'result');};
 // Side episodes are optional: registration and the first match never require them.
 await page.evaluate(()=>Village.open('cup'));await page.locator('#tournament-register').click();assert(await page.locator('#tournament-prep').isEnabled());assert.equal(await page.getByRole('button',{name:/이야기 먼저/}).count(),0);assert.equal(await page.evaluate(()=>G.profile.journey.stages.village_0||0),0);
 await page.locator('#facility-close').click();await page.evaluate(()=>Village.open('stories'));assert.equal(await page.evaluate(()=>G.facility),'stories');
 await page.screenshot({path:path.join(artifacts,'journey-notebook.png')});
 await page.keyboard.press('KeyJ');assert(await page.locator('#pause-screen').isVisible());assert.equal(await page.evaluate(()=>GameMenu.view),'journal');assert((await page.locator('#menu-body').textContent()).includes('같이 놀 사람'));await page.keyboard.press('KeyJ');
 // Accuracy matters; failure pays nothing and offers preparation/retry.
 await page.locator('#journey-start').click();await dialogue();await page.waitForFunction(()=>G.state==='ready');for(let i=0;i<5;i++)await hit('BAD');assert.equal(await page.evaluate(()=>G.profile.coins),80);assert.equal(await page.evaluate(()=>G.profile.journey.stages.village_0||0),0);assert(await page.locator('#result-secondary').isVisible());await page.locator('#continue').click();await dialogue();await page.waitForFunction(()=>G.state==='ready');
 await page.evaluate(()=>TtakjiRules.positionAt=()=>.5);await page.locator('#attack').click();await page.keyboard.press('Escape');const frozen=await page.evaluate(()=>G.now);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>G.now),frozen);await page.locator('#resume').click();await page.locator('#strike').click();await page.waitForFunction(()=>G.state==='ready');for(const grade of ['GOOD','BAD','GOOD','BAD'])await hit(grade);
 assert.equal(await page.evaluate(()=>G.profile.journey.stages.village_0),1);assert.equal(await page.evaluate(()=>G.profile.coins),90);assert.deepEqual(await page.evaluate(()=>G.profile.journey.pending),{id:'village_0',step:0});
 await resume();assert.equal(await page.evaluate(()=>G.facility),'stories');assert.equal(await page.evaluate(()=>G.profile.coins),90);assert.equal(await page.evaluate(()=>G.profile.journey.pending),null);
 const prepare=async()=>{
  await page.evaluate(()=>Village.hub().open('press'));if(await page.evaluate(()=>G.state==='dialogue')){await dialogue();return}// The village compressor opens after round 1.
  if(await page.evaluate(()=>G.profile.owned.includes('hair')&&G.profile.equipped!=='hair')){await page.keyboard.press('KeyI');await page.locator('[data-item="hair"]').click();await page.locator('#equip-item').click();await page.keyboard.press('KeyI')}
  for(let i=0;i<20;i++){const b=page.getByRole('button',{name:/압축하기/});if(await b.count()===0||await b.isDisabled())break;await b.click()}
  await page.locator('#facility-close').click();
 };
 // Every stage uses the common bracket → prep → start flow.
 const startMatch=async()=>{await page.evaluate(()=>Village.hub().open('cup'));await dialogue();if(await page.evaluate(()=>G.facility==='bracket')){await page.locator('#tournament-prep').click();await page.locator('#match-start').click()}else await page.getByRole('button',{name:/ 출전$/}).click();await dialogue();await page.waitForFunction(()=>G.state==='ready')};
 let activities=1,skillRetryTested=false;const TtakjiRulesNode=require('../rules.js');
 for(const region of Object.keys(J.regions)){
  for(const e of J.episodes.filter(e=>e.region===region)){
   for(let step=await page.evaluate(id=>G.profile.journey.stages[id]||0,e.id);step<2;step++){
    const goal=e.steps[step].goal;
    if(goal&&!skillRetryTested){
     // Winning without the promised skill is a retry, not a paid completion.
     skillRetryTested=true;await prepare();const coins=await page.evaluate(()=>G.profile.coins);await page.evaluate(id=>{Journeys.selected=id;Village.hub().open('stories')},e.id);await page.locator('#journey-start').click();await dialogue();await page.waitForFunction(()=>G.state==='ready');await finishFight(true);
     assert((await page.locator('#result-title').textContent()).includes('약속'));assert.equal(await page.evaluate(id=>G.profile.journey.stages[id]||0,e.id),step);assert.equal(await page.evaluate(()=>G.profile.coins),coins);await page.locator('#result-secondary').click();await page.waitForFunction(()=>G.state==='explore');
    }
    await prepare();await page.evaluate(id=>{Journeys.selected=id;Village.hub().open('stories')},e.id);await page.locator('#journey-start').click();await dialogue();await page.waitForFunction(()=>G.state==='ready');
    if(goal)assert((await page.locator('#turn-label').textContent()).includes(TtakjiRulesNode.skills[goal].name),'The objective names the new skill');
    if(e.steps[step].type==='drill'){for(let i=0;i<5;i++)await hit()}else await finishFight();
    assert.equal(await page.evaluate(id=>G.profile.journey.stages[id],e.id),step+1,`${e.id} step ${step} should complete with normally earned equipment`);activities++;
    await page.locator('#continue').click();await dialogue();assert.equal(await page.evaluate(()=>G.facility),'stories');assert.equal(await page.evaluate(()=>G.profile.journey.pending),null);
   }
   await prepare();await startMatch();await finishFight();assert.equal(await page.evaluate(field=>G.profile[field],J.regions[region].field),e.round+1,`${region} tournament remains winnable`);
   await page.locator('#continue').click();await dialogue();
   // The first planet title leads into the ending: 도윤's rematch (either result), credits, post-credits, then free play in the yard.
   if(await page.evaluate(()=>G.mode==='ending_match')){for(let i=0;i<40&&await page.evaluate(()=>['ready','timing','resolving','enemy'].includes(G.state));i++){if(await page.evaluate(()=>G.state==='ready'))await hit();else await page.waitForTimeout(50)}await dialogue();await page.waitForFunction(()=>G.state==='credits');await page.locator('#credits-skip').click();await dialogue();assert(await page.evaluate(()=>G.profile.story.ending))}
   if(await page.evaluate(()=>G.state==='facility'))await page.locator('#facility-close').click();await page.waitForFunction(()=>G.state==='explore');
  }
  if(region!=='planet'){
   await page.evaluate(()=>Village.hub().open('cup'));const next={village:'시',city:'도',province:'전국',national:'대륙',continent:'세계',world:'행성'}[region];await page.getByRole('button',{name:`${next} 대회에 도전`,exact:true}).click();await dialogue();await page.waitForFunction(()=>G.state==='explore');
  }
 }
 assert.equal(activities,42);assert.equal(await page.evaluate(()=>Object.values(G.profile.journey.stages).filter(n=>n===2).length),21);assert.equal(await page.evaluate(()=>G.profile.planetRound),3);
 // Story replay does not pay again; journal fits a smaller PC screen.
 const saved=await page.evaluate(()=>({coins:G.profile.coins,xp:G.profile.xp}));await page.evaluate(()=>National.open('stories'));await page.locator('#journey-start').click();await dialogue();assert.deepEqual(await page.evaluate(()=>({coins:G.profile.coins,xp:G.profile.xp})),saved);
 await page.setViewportSize({width:1024,height:600});await page.keyboard.press('KeyJ');const box=await page.locator('.game-menu').boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=1024&&box.y+box.height<=600);await page.screenshot({path:path.join(artifacts,'journey-complete.png')});await page.keyboard.press('KeyJ');
 await resume();assert.equal(await page.evaluate(()=>G.profile.planetRound),3);assert.equal(await page.evaluate(()=>Object.values(G.profile.journey.stages).filter(n=>n===2).length),21);
 await page.keyboard.press('Escape');await page.locator('#return-title').click();await page.locator('#new-game').click();await page.locator('#name-confirm').click();assert.equal(await page.evaluate(()=>Object.keys(G.profile.journey.stages).length),0);
 assert.deepEqual(errors,[]);console.log('PASS all 42 story activities and 21 tournament matches using earned upgrades; accuracy/skill failures (정밀 타격/강타/꾹 눌러 펴기 goals), gating, pending reward reload, pause, journal, replay and reset');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
