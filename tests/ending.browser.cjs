const assert=require('node:assert/strict'),{launch,champion}=require('./stage-helpers.cjs'),P=require('../progression.js');
(async()=>{const h=await launch(),{page}=h;try{
 const has=(lines,t)=>assert(lines.some(l=>l.includes(t)),t);
 // Prepared profile: world champion with the planet semifinal won and a full build, named 지존.
 const p=champion('world',{item:'fusion',upgrades:28,xp:105});p.name='지존';P.tournament('planet').enter(p);P.completeMatch(p,'planet',0);P.completeMatch(p,'planet',1);P.takeTrophy();p.upgrades.fusion=P.upgradeLimit(p);p.xp=P.trainingLimit(p);
 await h.seed(p,'planet');await h.until(()=>G.scene==='planet'&&G.state==='explore');await h.fast();
 // Planet final → award → the yard bench: the kids' question and 도윤's challenge.
 await h.visit('cup');await page.locator('#tournament-prep').click();await page.locator('#match-start').click();await h.dialogue();await h.win();await page.locator('#continue').click();
 let lines=await h.dialogue();has(lines,'다시 한 장만.');for(const t of ['어떻게 하면 제일 강한 딱지를 만들어요?','일단 접어 봐. 지면 다시 접고.','그럼 언제 이겨요?','그건 나도 계속 해 보는 중이야.','이제 너랑 끝내지 못한 승부, 한 판 더?'])has(lines,t);
 assert(lines.some(l=>l.startsWith('지존: ')),'The hero speaks with the chosen name');
 // Reloading mid-ending (before the match) restarts the ending, not a tournament.
 await h.until(()=>G.state==='ready');assert.equal(await page.evaluate(()=>[G.mode,G.opponent.name,G.checkpoint].join()),'ending_match,도윤,ending');
 await h.reload();lines=await h.dialogue();has(lines,'어떻게 하면 제일 강한 딱지를 만들어요?');await h.until(()=>G.state==='ready');await h.fast();await h.shot('ending-match.png');
 // Unforced: here the player loses on purpose and the story still ends well.
 const coins=await page.evaluate(()=>G.profile.coins);await h.lose();assert.equal(await page.evaluate(()=>[G.profile.story.ending,G.checkpoint].join()),'true,village','Flag saved before the scene');
 lines=await h.dialogue();has(lines,'이번엔 내가 뒤집었다.');
 // Camera rises, the ttakji clash, fade, then credits with the cast and the hero's name.
 await h.until(()=>G.scene==='ending_sky');await h.until(()=>G.state==='credits');assert(await page.locator('#credits').isVisible());const roll=await page.locator('#credits-roll').textContent();
 for(const t of ['지존','민수','도윤','하나','박태풍','백지훈','한결','무중','딱지를 접은 모든 사람'])assert(roll.includes(t),t);await h.shot('ending-credits.png');
 await page.locator('#credits-skip').click();lines=await h.dialogue();has(lines,'???? 대회');has(lines,'이번엔 내가 나간다.');
 await h.until(()=>G.state==='explore'&&G.mapZone==='yard');assert.equal(await page.locator('#credits').isHidden(),true);assert.equal(await page.evaluate(()=>G.profile.coins),coins,'The ending match pays nothing');
 // Free play: reload lands in the village, the ending never repeats by itself; 도윤 offers friendly rematches with retry.
 await h.reload();await h.until(()=>G.state==='explore');assert.equal(await page.evaluate(()=>[G.mapZone,G.profile.story.ending].join()),'yard,true');await h.fast();
 assert((await page.locator('#map-objective').textContent()).includes('자유 경기'));
 await page.evaluate(()=>{G.hero.x=1130;Exploration.interact()});await h.until(()=>G.state==='facility');await page.getByRole('button',{name:'친선전 · 보상 없음'}).click();await h.until(()=>G.state==='ready');
 assert.equal(await page.evaluate(()=>G.mode),'ending_match');await h.win();assert((await page.locator('#result-text').textContent()).includes('보상 없음'));assert.equal(await page.evaluate(()=>G.profile.coins),coins);
 await page.getByRole('button',{name:'한 판 더'}).click();await h.until(()=>G.state==='ready');await h.win();await page.locator('#continue').click();await h.until(()=>G.state==='explore'&&G.mapZone==='yard');
 // The house shows every title; the bus offers every stage again.
 await page.evaluate(()=>Exploration.enter('home',845));assert(await page.evaluate(()=>Exploration.objects().some(o=>o.id==='shelf')));await page.evaluate(()=>Exploration.interact());assert((await page.locator('#line').getAttribute('aria-label')).includes('교류전 우승 장식'));await h.shot('home-trophies.png');
 await page.locator('#next').click();await page.locator('#next').click();await h.until(()=>G.state==='explore');
 await page.evaluate(()=>Tournament.select());assert((await page.locator('#facility-content').textContent()).includes('자유 경기'));assert.equal(await page.locator('[data-tournament]:disabled').count(),0);await page.locator('#facility-close').click();
 // 다시 보기: the credits entry replays the ending without the match and returns to the same spot; progress is untouched.
 await page.evaluate(()=>Exploration.enter('square',750));await h.until(()=>G.state==='explore');await page.keyboard.press('Escape');await page.locator('[data-menu="story"]').click();
 const entries=await page.locator('[data-scene]').evaluateAll(b=>b.map(x=>x.dataset.scene));for(const id of ['planet_final_intro','planet_award','ending_yard','ending_rematch','ending_credits','ending_post'])assert(entries.includes(id),id);
 await page.locator('[data-scene="ending_credits"]').click();lines=await h.dialogue();has(lines,'일단 접어 봐.');await h.until(()=>G.state==='credits');await page.locator('#credits-skip').click();lines=await h.dialogue();has(lines,'이번엔 내가 나간다.');
 await h.until(()=>G.state==='explore'&&G.mapZone==='square');assert.equal(await page.evaluate(()=>G.profile.coins),coins);assert.equal(await page.evaluate(()=>G.checkpoint),'village');
 // The other result: a fresh run of the ending at its checkpoint, won this time.
 const q=JSON.parse(JSON.stringify(p));P.completeMatch(q,'planet',2);await h.seed(q,'ending');lines=await h.dialogue();has(lines,'한 판 더?');await h.until(()=>G.state==='ready');await h.fast();await h.win();
 lines=await h.dialogue();has(lines,'다시 접어서 돌아오네');await h.until(()=>G.state==='credits');await page.locator('#credits-skip').click();await h.dialogue();await h.until(()=>G.state==='explore');assert.equal(await page.evaluate(()=>G.profile.story.ending),true);
 assert.deepEqual(h.errors,[]);console.log('PASS ending: planet final → yard bench lines with the hero name, reload mid-ending, unforced rematch (loss and win both end well), camera/clash/fade, credits cast, post-credits, saved flag, free play with friendly retry, trophies at home, bus free play, ending replay from the story list');
}finally{await h.close()}})().catch(e=>{console.error(e);process.exit(1)});
