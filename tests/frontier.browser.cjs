const assert=require('node:assert/strict'),{launch,champion}=require('./stage-helpers.cjs');
(async()=>{const h=await launch(),{page}=h;try{
 const has=(lines,t)=>assert(lines.some(l=>l.includes(t)),t);
 const next=async()=>{await page.locator('#tournament-prep').click();await page.locator('#match-start').click();return h.dialogue()};
 // Each stage raises the caps; the test player trains and compresses to them (deterministic wins need a full build).
 const train=()=>page.evaluate(()=>{const p=G.profile;p.upgrades[p.equipped]=P.upgradeLimit(p);p.xp=P.trainingLimit(p)});
 const toBracket=async()=>{await h.until(()=>G.state==='result');await page.locator('#continue').click();await h.until(()=>G.facility==='bracket')};
 // National champion → continent. Intro: 도윤 on the same national team and the translator gag.
 const profile=champion('national',{item:'fusion',upgrades:14,xp:57});await h.seed(profile,'national');await h.until(()=>G.state==='explore');await h.fast();
 await h.visit('cup');await page.locator('#tournament-next').click();let lines=await h.dialogue();has(lines,'절대 뒤집어지지 않은 감자');has(lines,'절대 뒤집히지 않는 자');has(lines,'같은 국가 대표');
 await h.until(()=>G.scene==='continent'&&G.state==='explore');await h.fast();await train();assert.equal(await page.evaluate(()=>P.upgradeLimit(G.profile)),20);await h.shot('continent-hub.png');
 // Free practice match before the real one: the real opponent's data, no reward, no record.
 await h.visit('cup');const coins=await page.evaluate(()=>G.profile.coins);await page.locator('#tournament-practice').click();await h.until(()=>G.state==='ready');
 assert.equal(await page.evaluate(()=>[G.mode,G.opponent.name].join()),'sparring,마리');await h.win();assert.equal(await page.evaluate(()=>[G.profile.coins,G.profile.continentRound].join()),`${coins},0`);
 await page.locator('#continue').click();await h.until(()=>G.scene==='continent'&&G.state==='explore');await h.fast();
 // R1 마리, then 도윤 is knocked out elsewhere and helps prepare; the bracket shows it after the scene.
 await h.visit('cup');assert((await h.bracket()).includes('절대 뒤집히지 않는 자 vs 도윤 · 예정'));lines=await next();has(lines,'식빵 무늬');await h.win();lines=await h.dialogue();has(lines,'네 준비를 도울게');
 await toBracket();assert((await h.bracket()).includes('절대 뒤집히지 않는 자 vs 도윤 → 절대 뒤집히지 않는 자 승'));
 // R2 리오: flip rolls apply — a high roll never flips a healthy opponent, a low roll can flip before HP 0.
 lines=await next();has(lines,'구리색');await h.attack();assert.equal(await page.evaluate(()=>G.flipEnemy),0);assert(await page.evaluate(()=>G.enemyHp>0&&G.enemyHp<G.enemyMax));
 await page.evaluate(()=>{Math.random=()=>0});await h.attack('BAD');await h.until(()=>G.flipEnemy>0);assert(await page.evaluate(()=>G.enemyHp>0),'Flipped before HP 0 (안정성 4)');await toBracket();await h.fast();
 // Final 아라 and the award: exchange folds, then the new-standard announcement.
 lines=await next();has(lines,'접는 방향이 반대');await h.win();await page.locator('#continue').click();lines=await h.dialogue();has(lines,'서로의 접는 법을 바꿔');has(lines,'지정 소재와 형태만');has(lines,'안전 규정');
 await h.until(()=>G.scene==='continent'&&G.state==='explore');await h.fast();
 // World: the regulation arc. Equipment stays usable throughout.
 const equipped=await page.evaluate(()=>G.profile.equipped);await h.visit('cup');await page.locator('#tournament-next').click();lines=await h.dialogue();has(lines,'그럼 내 딱지도 이제 못 쓰는 거야?');has(lines,'처음 널 만났을 때');has(lines,'낡은 첫 딱지');
 await h.until(()=>G.scene==='world'&&G.state==='explore');await h.fast();await train();await h.shot('world-hub.png');
 await h.visit('cup');lines=await next();has(lines,'투명 종이');await h.win();lines=await h.dialogue();has(lines,'위험한 재료');await toBracket();
 lines=await next();has(lines,'공인 딱지만 십 년');await h.win();lines=await h.dialogue();has(lines,'시범 경기와 선수 대표 회의');has(lines,'자동으로 바뀌지는 않습니다');await toBracket();
 lines=await next();has(lines,'그렇게 구겨진 걸로 여기까지 왔다고?');has(lines,'구겨진 게 아니라 역사가 접힌 거야.');await h.until(()=>G.state==='ready');assert.equal(await page.evaluate(()=>G.profile.equipped),equipped,'Nothing became unusable');
 await h.win();await page.locator('#continue').click();lines=await h.dialogue();for(const t of ['오늘은 다음 수를 모르겠더라. 오랜만이야.','시험 운영','내가 쟤랑 학교에서 딱지 쳤어!','이겼어?','그건 중요한 게 아니야.','행성 딱지 교류전 초대장','그래서 내가 도 대회에서 잘하라고 했잖아.','도 다음이 행성이에요?'])has(lines,t);
 await h.until(()=>G.scene==='world'&&G.state==='explore');await h.fast();
 // Planet: exchange match with the same rules; 반짝's fast gauge respects the 느리게 setting.
 await h.visit('cup');await page.locator('#tournament-next').click();lines=await h.dialogue();has(lines,'정복전이 아니라 교류전');await h.until(()=>G.scene==='planet'&&G.state==='explore');await h.fast();await train();await h.shot('planet-hub.png');
 await h.visit('cup');lines=await next();has(lines,'그건 삼각형인데?');has(lines,'우리 행성에서는 딱지가 먼저 생겼다.');await h.win();lines=await h.dialogue();has(lines,'접는 법을 교환');await toBracket();
 await page.locator('#tournament-prep').click();assert((await page.locator('#facility-content').textContent()).includes('게이지가 평소보다 빠르다'));await page.locator('#match-start').click();await h.dialogue();await h.until(()=>G.state==='ready');
 await page.locator('#attack').click();assert.equal(await page.evaluate(()=>G.gaugeDuration),1200,'Normal 1500 ms × 0.8');await page.locator('#strike').click();await h.until(()=>['ready','result'].includes(G.state));
 await page.evaluate(()=>{G.settings.gaugeSpeed='slow'});await page.locator('#attack').click();assert.equal(await page.evaluate(()=>G.gaugeDuration),2200,'느리게 stays slow');await page.locator('#strike').click();
 await h.win();await toBracket();await page.evaluate(()=>{G.settings.gaugeSpeed='normal'});
 lines=await next();has(lines,'모두 내 기술을 따라 했다');await h.win();assert.equal(await page.evaluate(()=>G.checkpoint),'planet_reward');
 await page.locator('#continue').click();lines=await h.dialogue();has(lines,'다시 한 장만.');
 // The planet title leads into the ending (covered in ending.browser.cjs).
 assert.equal(await page.evaluate(()=>[G.checkpoint,G.mapZone].join()),'ending,yard');assert.equal(await page.evaluate(()=>P.titles(G.profile).length),7);
 // Achievements pay once.
 await page.evaluate(()=>{G.state='explore';panels('explore-ui')});await page.keyboard.press('Escape');await page.locator('[data-menu="achievements"]').click();const before=await page.evaluate(()=>G.profile.coins);
 await page.locator('[data-achievement="planet"]').click();assert.equal(await page.evaluate(()=>G.profile.coins),before+3000);assert.equal(await page.locator('[data-achievement="planet"]').count(),0);
 assert.deepEqual(h.errors,[]);console.log('PASS continent/world/planet: intros and gags, free practice match, 도윤 knocked out and helping, flip rolls, folds exchange, new-standard and regulation arc with equipment kept, 반짝 gauge vs setting, planet title into the ending, achievements');
}finally{await h.close()}})().catch(e=>{console.error(e);process.exit(1)});
