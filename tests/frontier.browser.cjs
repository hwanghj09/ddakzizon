const {chromium}=require('playwright'),assert=require('node:assert');
(async()=>{
 const browser=await chromium.launch(),p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 const drain=async()=>{for(let i=0;i<60;i++){const s=await p.evaluate(()=>{if(G.state==='dialogue'){next();next()}return G.state});if(!['dialogue','transition'].includes(s))return s;await p.waitForTimeout(150)}};
 // A national champion save: the continent opens from the national cup desk.
 await p.evaluate(()=>{const q=P.fresh();P.schoolReward(q);for(let i=0;i<3;i++)P.award(q,i);P.enterCity(q);for(let i=0;i<3;i++)P.awardCity(q,i);P.enterProvince(q);for(let i=0;i<3;i++)P.awardProvince(q,i);P.enterNational(q);for(let i=0;i<3;i++)P.awardNational(q,i);q.coins=1600;q.upgrades={newspaper:12,colored_paper:9,hair:16,fusion:0};localStorage.setItem('ddakzizon.campaign.v3',JSON.stringify({version:3,checkpoint:'national',profile:q}))});
 await p.reload();await p.locator('#load-game').click();await drain();
 await p.evaluate(()=>National.open('cup'));await p.locator('.facility-choice',{hasText:'대륙 대회에 도전'}).click();await p.waitForTimeout(600);
 assert.equal(await p.evaluate(()=>G.checkpoint),'continent_intro');await drain();
 assert.deepEqual(await p.evaluate(()=>[G.scene,G.hub,G.profile.continentEntered,P.upgradeLimit(G.profile)]),['continent','continent',true,20]);
 // Fusion: costs 1500, keeps the average compression, equips the result.
 await p.evaluate(()=>Village.open('press'));await p.locator('.facility-choice',{hasText:'융합기'}).click();
 assert.deepEqual(await p.evaluate(()=>[G.profile.coins,G.profile.equipped,G.profile.upgrades.fusion]),[100,'fusion',12]);
 // Reload keeps the tier and the fused ttakji.
 await p.reload();await p.locator('#load-game').click();await drain();
 assert.deepEqual(await p.evaluate(()=>[G.scene,G.profile.owned.includes('fusion')]),['continent',true]);
 // Worn rules: a low-HP opponent can be flipped early; full-HP attacks are unchanged.
 await p.evaluate(()=>Continent.open('cup'));assert(await p.locator('.facility-choice',{hasText:'이야기 먼저'}).count());
 await p.evaluate(()=>{G.profile.journey.stages.continent_0=2;Continent.open('cup')});await p.locator('.facility-choice',{hasText:'8강 출전'}).click();await drain();await p.waitForTimeout(500);
 assert.equal(await p.evaluate(()=>G.mode),'continent_tournament');
 assert.equal(await p.evaluate(()=>Village.strength(G.hp,G.maxHp)),1);
 assert(await p.evaluate(()=>Village.strength(G.hp/2,G.maxHp))<1);
 assert.equal(await p.evaluate(()=>{const r=Math.random;Math.random=()=>0;const f=Village.earlyFlip(10,G.enemyMax,'PERFECT');Math.random=r;return f}),true);
 assert.equal(await p.evaluate(()=>Village.earlyFlip(G.enemyMax,G.enemyMax,'PERFECT')),false);
 // Winning all three rounds of each tier leads to the next one and finally the ???? teaser.
 await p.evaluate(()=>{for(const id of ['continent','world','planet']){P.enterTier(G.profile,id);for(let r=0;r<3;r++)P.awardTier(G.profile,id,r)}Planet.enter()});await drain();
 await p.evaluate(()=>Planet.open('cup'));assert(await p.locator('#facility-content').innerText().then(t=>t.includes('????')));
 // Achievements: the menu tab shows ready rewards and pays each one once.
 await p.keyboard.press('Escape');await p.locator('[data-menu="achievements"]').click();const coins=await p.evaluate(()=>G.profile.coins);
 await p.locator('[data-achievement="planet"]').click();assert.equal(await p.evaluate(()=>G.profile.coins),coins+3000);assert.equal(await p.locator('[data-achievement="planet"]').count(),0);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS continent entry and reload, fusion machine, worn-ttakji flip and attack rules, world and planet unlocks, ???? teaser, achievements');
})().catch(e=>{console.error(e);process.exit(1)});
