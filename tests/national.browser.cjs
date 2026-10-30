const assert=require('node:assert/strict'),{launch,champion}=require('./stage-helpers.cjs');
(async()=>{const h=await launch(),{page}=h;try{
 const profile=champion('province',{upgrades:10,xp:36});await h.seed(profile,'province');await h.until(()=>G.state==='explore');await h.fast();
 await h.visit('cup');await page.locator('#tournament-next').click();let lines=await h.dialogue();assert(lines.some(l=>l.includes('무료 수리')));assert.equal(await page.evaluate(()=>G.checkpoint),'national');
 await h.until(()=>G.scene==='national'&&G.state==='explore');await h.fast();assert.equal(await page.evaluate(()=>P.upgradeLimit(G.profile)),16);await h.shot('national-hub.png');
 // 공인 딱지: optional and free. Matches can start without it; taking it is one button and it is never equipped for you.
 await h.visit('cup');assert(await page.locator('#take-official').isVisible());assert.equal(await page.evaluate(()=>G.profile.owned.includes('official')),false);
 let board=await h.bracket();assert(board.includes('공인 딱지 선수 vs 도윤 · 예정'),'도윤\'s match is not decided yet');
 const coins=await page.evaluate(()=>G.profile.coins),equipped=await page.evaluate(()=>G.profile.equipped);
 await page.locator('#take-official').click();await h.dialogue();await h.until(()=>G.facility==='bracket');assert(await page.evaluate(()=>G.profile.owned.includes('official')));assert.equal(await page.evaluate(()=>G.profile.coins),coins,'Free');assert.equal(await page.evaluate(()=>G.profile.equipped),equipped,'Never forced on');assert.equal(await page.locator('#take-official').count(),0);
 // Round 1: tape player heals; after the win 도윤 loses to the 공인 딱지 선수 in a separate scene and the bracket shows it.
 await page.locator('#tournament-prep').click();await page.locator('#match-start').click();lines=await h.dialogue();assert(lines.some(l=>l.startsWith('테이프 딱지 선수')));await h.until(()=>G.state==='ready');
 await page.evaluate(()=>{G.enemyHp=Math.round(G.enemyMax*.45)});await h.attack('BAD');await h.until(()=>G.state==='ready');assert.equal(await page.evaluate(()=>G.foeHeals),1,'Heals below half');
 await h.win();lines=await h.dialogue();assert(lines.some(l=>l.includes('내가 익숙한 방식을 끝까지 믿지 못했어')));
 await h.until(()=>G.state==='result');await page.locator('#continue').click();await h.until(()=>G.facility==='bracket');board=await h.bracket();assert(board.includes('공인 딱지 선수 vs 도윤 → 공인 딱지 선수 승'));
 assert((await page.locator('#next-opponent').textContent()).includes('공인 딱지 선수'));
 // Round 2 and the final: 이규격's ruler gag; his moves are not announced.
 await page.locator('#tournament-prep').click();await page.locator('#match-start').click();await h.dialogue();await h.win();await h.until(()=>G.state==='result');await page.locator('#continue').click();await h.until(()=>G.facility==='bracket');
 await page.locator('#tournament-prep').click();await page.locator('#match-start').click();lines=await h.dialogue();
 for(const t of ['접힌 선이 정확히 일치하지 않습니다','허용 오차 이내입니다','오차를 허용한다고요?','백지훈'])assert(lines.some(l=>l.includes(t)),t);
 await h.until(()=>G.state==='ready');assert((await page.evaluate(()=>G.coach)).includes('다음 수를 알 수 없다'),'이규격 hides his next move');await h.shot('national-final-battle.png');
 await h.win();assert.equal(await page.evaluate(()=>G.checkpoint),'national_reward');assert((await page.locator('#result-stats').textContent()).includes('융합기 해금'));
 await page.locator('#continue').click();lines=await h.dialogue();assert(lines.some(l=>l.includes('틀린 접기인 줄 알았는데, 다른 접기였군요')));
 await h.until(()=>G.scene==='national'&&G.state==='explore');assert(await page.evaluate(()=>P.fusionOpen(G.profile)));assert.equal(await page.evaluate(()=>G.profile.nationalRound),3);
 // Fusion machine opens after the national title (spec 05 §2-3) and keeps the average compression.
 await page.evaluate(()=>{G.profile.coins=5000});await h.visit('press');await page.getByRole('button',{name:'융합기',exact:true}).click();await page.getByRole('button',{name:/세 딱지를 하나로/}).click();
 assert(await page.evaluate(()=>G.profile.owned.includes('fusion')&&G.profile.equipped==='fusion'));
 // A weak build loses fairly and keeps earlier wins and the wallet.
 const weak=h.P.restore({...JSON.parse(JSON.stringify(profile)),nationalEntered:true,nationalRound:1,equipped:'colored_paper',xp:0,coins:77});await h.seed(weak,'national');await h.until(()=>G.state==='explore');await h.fast();
 await h.visit('cup');await page.locator('#tournament-prep').click();await page.locator('#match-start').click();await h.dialogue();await h.lose();await h.dialogue();
 assert.equal(await page.evaluate(()=>G.profile.nationalRound),1);assert.equal(await page.evaluate(()=>G.profile.coins),77);
 await page.locator('#result-secondary').click();await h.until(()=>G.facility==='prep');await page.locator('#facility-close').click();
 await h.reload();await h.until(()=>G.state==='explore');assert.equal(await page.evaluate(()=>G.hub),'national');
 // Tampered/incomplete province saves cannot enter.
 await h.seed({...profile,provinceRound:2,nationalEntered:true,nationalRound:3},'national');await h.until(()=>G.state==='explore');assert.equal(await page.evaluate(()=>G.scene),'province');await page.evaluate(()=>National.travel());assert.equal(await page.evaluate(()=>G.scene),'province');
 assert.deepEqual(h.errors,[]);console.log('PASS national: entry, optional free 공인 딱지, tape heals, 도윤\'s separate loss reflected in the bracket, ruler gag and hidden moves, award and fusion unlock, weak-build loss/retry/reload, gate');
}finally{await h.close()}})().catch(e=>{console.error(e);process.exit(1)});
