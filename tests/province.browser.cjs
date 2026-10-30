const assert=require('node:assert/strict'),{launch,champion}=require('./stage-helpers.cjs');
(async()=>{const h=await launch(),{page,P}=h;try{
 // City champion → 도 대회 from the city bracket. The intro is checkpointed and survives a reload.
 const profile=champion('city',{upgrades:6,xp:24});await h.seed(profile,'city');await h.until(()=>G.state==='explore');await h.fast();
 await h.visit('cup');await page.locator('#tournament-next').click();await h.until(()=>G.state==='dialogue');assert.equal(await page.evaluate(()=>G.checkpoint),'province_intro');
 await h.reload();await h.until(()=>G.state==='dialogue');let lines=await h.dialogue();assert(lines.some(l=>l.includes('압축 챔피언십')));
 await h.until(()=>G.scene==='province'&&G.state==='explore');await h.fast();assert.equal(await page.evaluate(()=>P.upgradeLimit(G.profile)),12);await h.shot('province-hub.png');
 // Common bracket: next opponent with a hint, the other entrants, prep with the 공격형 / 방어형 choice (nothing forced).
 await h.visit('cup');assert.equal(await page.evaluate(()=>G.facility),'bracket');assert((await page.locator('#next-opponent').textContent()).includes('상자왕'));assert((await h.bracket()).includes('두께왕 민철'));
 await page.locator('#tournament-prep').click();await h.until(()=>G.facility==='prep');assert(await page.locator('#prep-choice').isVisible());
 const before=await page.evaluate(()=>G.profile.equipped);const defense=page.locator('#prep-choice button[data-form="defense"]');
 if(!await defense.isDisabled()){await defense.click();assert.notEqual(await page.evaluate(()=>G.profile.equipped),before,'One tap equips the 방어형 pick');await page.evaluate(id=>{P.equip(G.profile,id);Tournament.refresh()},before)}
 // Round 1: 박태풍's letter comes first, once. 상자왕 teaches 꾹 눌러 펴기 after the win.
 await page.locator('#match-start').click();lines=await h.dialogue();assert(lines.some(l=>l.includes('(편지)')),'Letter before the first match');assert(lines.some(l=>l.startsWith('상자왕')));
 await h.until(()=>G.state==='ready');assert((await page.evaluate(()=>G.coach)).includes('방어'),'상자왕 guards on odd turns');assert.equal(await page.evaluate(()=>G.foe.defense),22);
 await h.win();assert.equal(await page.evaluate(()=>G.profile.provinceRound),1);assert((await page.locator('#result-stats').textContent()).includes('꾹 눌러 펴기'));
 assert.equal(await page.evaluate(()=>G.checkpoint),'province_skill');await page.locator('#continue').click();lines=await h.dialogue();assert(lines.some(l=>l.includes('F를 누르면 꾹 눌러 펴기')));
 await h.until(()=>G.facility==='bracket');assert.deepEqual(await page.evaluate(()=>G.profile.skills),['precise','smash','press']);assert((await h.bracket()).includes('승리'));
 // Round 2: 최단단 — floor dent and weighing gag, then the 'strong ≠ thick' lesson.
 await page.locator('#tournament-prep').click();await page.locator('#match-start').click();lines=await h.dialogue();assert(lines.some(l=>l.includes('내 딱지는 절대 안 뒤집힌다!')));assert(lines.some(l=>l.includes('무게부터 재겠습니다')));assert(!lines.some(l=>l.includes('(편지)')),'The letter never repeats');
 await h.until(()=>G.state==='ready');assert.equal(await page.evaluate(()=>G.foe.stability),0);await h.win();lines=await h.dialogue();assert(lines.some(l=>l.includes('무조건 두껍거나 무거운 딱지는 아니다')));
 await h.until(()=>G.state==='result');await page.locator('#continue').click();await h.until(()=>G.facility==='bracket');
 // Final: a loss keeps progress and wallet and offers retry/prep; then the win and the award story (reload-safe).
 await page.locator('#tournament-prep').click();await page.locator('#match-start').click();lines=await h.dialogue();assert(lines.some(l=>l.includes('네 손은 얼마나 믿어')));
 const coins=await page.evaluate(()=>G.profile.coins);await h.lose();lines=await h.dialogue();assert(lines.some(l=>l.includes('타이밍은 딱지가')));
 assert.equal(await page.evaluate(()=>G.profile.provinceRound),2);assert.equal(await page.evaluate(()=>G.profile.coins),coins);assert.equal(await page.locator('#continue').textContent(),'재도전 →');assert(await page.locator('#result-secondary').isVisible());
 await page.locator('#continue').click();await h.until(()=>['ready','dialogue'].includes(G.state));assert.equal(await h.state(),'ready','Retry skips the seen intro');
 await h.win();assert.equal(await page.evaluate(()=>G.checkpoint),'province_reward');assert.equal(await page.evaluate(()=>G.profile.coins),coins+600);
 await h.reload();await h.until(()=>G.state==='dialogue');lines=await h.dialogue();for(const t of ['좋은 딱지를 믿는 만큼 네 손도 믿어','잘했다. TV에 내 머리 정수리만 나왔다.'])assert(lines.some(l=>l.includes(t)),t);
 await h.until(()=>G.scene==='province'&&G.state==='explore');assert.equal(await page.evaluate(()=>G.profile.coins),coins+600,'Reload never pays twice');assert(await page.evaluate(()=>P.refineryOpen(G.profile)));
 // After the title: free replays for the smaller repeat prize, the next stage, the menu line.
 await h.fast();await h.visit('cup');assert.equal(await page.locator('[data-replay]').count(),3);assert((await page.locator('#tournament-next').textContent()).includes('전국 대회에 도전'));
 const wallet=await page.evaluate(()=>G.profile.coins);await page.locator('[data-replay="0"]').click();await page.locator('#match-start').click();await h.until(()=>G.state==='ready');await h.win();
 assert.equal(await page.locator('#result-title').textContent(),'자유 경기 승리!');assert.equal(await page.evaluate(()=>G.profile.coins),wallet+40);await page.locator('#continue').click();await h.until(()=>G.facility==='bracket');
 await page.keyboard.press('Escape');await page.keyboard.press('Escape');const menu=await page.locator('#menu-body').textContent();assert(menu.includes('도 대회 챔피언'));assert(menu.includes('전국 대회 출전권'));await page.locator('#resume').click();
 // Tampered/incomplete city saves cannot enter; a new game starts clean.
 await h.seed({...profile,cityRound:2,provinceEntered:true,provinceRound:3},'province');await h.until(()=>G.state==='explore');assert.equal(await page.evaluate(()=>G.scene),'city');await page.evaluate(()=>Province.travel());assert.equal(await page.evaluate(()=>G.scene),'city');
 assert.deepEqual(h.errors,[]);console.log('PASS province: entry and intro reload, common bracket with entrants, 공격형/방어형 prep choice, letter once, 꾹 눌러 펴기 lesson, 최단단 gag and lesson, fair loss/retry, award reload without double pay, refinery, free replay, menu, gate');
}finally{await h.close()}})().catch(e=>{console.error(e);process.exit(1)});
