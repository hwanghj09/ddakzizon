/* Shared Playwright helpers for the stage browser tests (province → planet, ending). */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),P=require('../progression.js'),prepared=require('./prepared-profile.cjs');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
const order=['village','city','province','national','continent','world','planet'];
// A profile that has won every stage up to `last` (inclusive) through the real reward code, with a typical build.
function champion(last,{item='hair',upgrades=8,xp=30}={}){
 const p=prepared(P.fresh());P.schoolReward(p);P.enterVillage(p);
 for(const id of order){const t=P.tournament(id);t.enter(p);for(let i=0;i<3;i++)P.completeMatch(p,id,i);if(id===last)break}
 P.reunion(p);P.takeTrophy();if(item==='fusion'&&!p.owned.includes('fusion')){p.owned.push('fusion');p.upgrades.fusion=0}
 P.equip(p,item);p.upgrades[item]=Math.min(upgrades,P.upgradeLimit(p));p.xp=Math.min(xp,P.trainingLimit(p));return p;
}
async function launch(){
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 const h={browser,page,errors,P,artifacts,
  shot:name=>page.screenshot({path:path.join(artifacts,name)}),
  seed:async(profile,checkpoint)=>{await page.evaluate(({profile,checkpoint})=>localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint,profile})),{profile,checkpoint});await page.reload();await page.locator('#load-game').click()},
  reload:async()=>{await page.reload();await page.locator('#load-game').click()},
  // Faster clock outside walking; perfect timing; rolls of .99 never flip anyone early and make opponents roll 빗나감.
  fast:()=>page.evaluate(()=>{if(!window.__fast){window.__fast=true;const original=update;update=dt=>original(dt*(G.state==='explore'?1:6))}TtakjiRules.positionAt=()=>.5;Math.random=()=>.99}),
  state:()=>page.evaluate(()=>G.state),
  until:async(fn,arg)=>page.waitForFunction(fn,arg,{timeout:20000}),
  // Clicks through dialogue (and waits out transitions/cinematics) until something else is on screen. Returns all lines seen.
  dialogue:async()=>{const seen=[];for(let i=0;i<400;i++){const s=await page.evaluate(()=>({state:G.state,line:G.state==='dialogue'?G.dialogue[G.dialogIndex].join(': '):null}));if(s.state==='dialogue'){if(seen.at(-1)!==s.line)seen.push(s.line);await page.locator('#next').click()}else if(['transition','cinematic'].includes(s.state))await page.waitForTimeout(60);else return seen}throw Error('Unfinished dialogue')},
  visit:async id=>{await page.waitForFunction(()=>G.state==='explore');await page.evaluate(id=>Village.hub().open(id),id);await page.waitForFunction(()=>['facility','dialogue'].includes(G.state))},
  attack:async(grade='PERFECT')=>{await page.evaluate(grade=>{TtakjiRules.positionAt=()=>grade==='PERFECT'?.5:grade==='GOOD'?.35:0},grade);await page.waitForFunction(()=>G.state==='ready');await page.locator('#attack').click();await page.locator('#strike').click();await page.waitForFunction(()=>['ready','result','dialogue'].includes(G.state))},
  // Plays the current match to the end with perfect hits; returns at the result or the first post-match scene.
  win:async()=>{for(let t=1;t<=40;t++){await page.waitForFunction(()=>['ready','result','dialogue'].includes(G.state));if(await page.evaluate(()=>G.state)!=='ready')return t;await h.attack('PERFECT')}throw Error('Match did not end')},
  // Lose on purpose: one HP left, a missed hit, the opponent's counter ends it.
  lose:async()=>{await page.waitForFunction(()=>G.state==='ready');await page.evaluate(()=>{G.hp=1});await h.attack('BAD');await page.waitForFunction(()=>['result','dialogue'].includes(G.state))},
  bracket:()=>page.locator('#bracket-board').textContent(),
  close:()=>browser.close()
 };return h;
}
module.exports={launch,champion,order};
