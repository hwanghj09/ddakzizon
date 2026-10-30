const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 const fast=()=>p.evaluate(()=>{const original=update;window.testSpeed=6;update=dt=>original(dt*(G.state==='explore'?1:testSpeed));TtakjiRules.positionAt=()=>.35;Math.random=()=>.35});await fast();
 const reach=async(target)=>{for(let i=0;i<300;i++){const state=await p.evaluate(()=>G.state);if(state===target)return;if(state==='dialogue')await p.locator('#next').click();else await p.waitForTimeout(30)}throw Error('Did not reach '+target+'; '+await p.evaluate(()=>G.state))};
 const talkToMinsu=async()=>{await p.evaluate(()=>Exploration.enter('yard',840));await p.locator('#game').focus();await p.keyboard.down('ArrowRight');await p.waitForFunction(()=>G.hero.x>870);await p.keyboard.up('ArrowRight');await p.keyboard.press('KeyE')};
 const attack=async()=>{await p.waitForFunction(()=>G.state==='ready');await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>['ready','result','dialogue'].includes(G.state))};
 // Name entry: sanitized, used for '나' lines and the battle HUD.
 await p.locator('#new-game').click();assert(await p.locator('#name-entry').isVisible());await p.locator('#hero-name').fill('지존<이>');await p.keyboard.press('Enter');await reach('explore');
 assert.equal(await p.evaluate(()=>G.profile.name),'지존이');assert.equal(await p.evaluate(()=>G.mapZone),'yard');
 // Prologue: bet lines, Doyun on the bench, then the one scripted loss with a grade-matched reaction.
 await talkToMinsu();await p.waitForFunction(()=>G.state==='dialogue');assert(await p.evaluate(()=>G.dialogue[0][1].includes('수업이 끝난 오후')||G.dialogue.some(l=>l[1].includes('이기면 내 딱지 줄게'))));assert(await p.evaluate(()=>G.dialogue.some(l=>l[0]==='지존이'&&l[1].includes('한 번에 뒤집어'))));assert(await p.evaluate(()=>G.dialogue.some(l=>l[0]==='도윤'&&l[1].includes('말보다 딱지가'))));
 await reach('ready');assert.equal(await p.evaluate(()=>G.enemyMax),100);assert.equal(await p.locator('#player-name').textContent(),'지존이');
 await p.keyboard.press('Space');await p.waitForFunction(()=>G.state==='dialogue');assert(await p.evaluate(()=>G.dialogue.some(line=>line[1].includes('가운데'))));await reach('timing');await p.keyboard.press('Space');await p.waitForFunction(()=>G.state==='dialogue');
 assert.equal(await p.evaluate(()=>G.enemyHp),78,'NORMAL hit: (20+4-5*0.5)*1.0');assert(await p.evaluate(()=>G.dialogue[0][1].includes('그냥 툭 쳤네')),'Intro reaction matches the NORMAL grade');assert.equal(await p.evaluate(()=>G.flipEnemy),0);
 for(let i=0;i<60&&!await p.evaluate(()=>G.state==='dialogue'&&G.dialogue.some(l=>l[1].includes('약속했지')));i++){if(await p.evaluate(()=>G.state==='dialogue'))await p.locator('#next').click();await p.waitForTimeout(40)}
 assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('잃어버리면 곤란하잖아'))),'Doyun keeps the ttakji safe');assert.equal(await p.evaluate(()=>G.profile.map.phase),'lost','The loss is saved before the scene');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).profile.keepsakes.scrap),true);
 await reach('cinematic');await p.waitForFunction(()=>$('card-subtitle').textContent.includes('신문지 딱지도 뒤집혔다'));assert((await p.locator('#card-title').textContent()).includes('인생이다'));
 await reach('explore');assert.equal(await p.evaluate(()=>Exploration.phase()),'lost');assert.equal(await p.evaluate(()=>Exploration.objective()[1]),'집으로 돌아가자');
 // The forced loss happens only once: Minsu now just talks, also after a reload.
 await talkToMinsu();await p.waitForFunction(()=>G.state==='dialogue');assert.equal(await p.evaluate(()=>G.dialogue.length),1);await reach('explore');assert.notEqual(await p.evaluate(()=>G.scene),'battle');
 await p.reload();await fast();await p.locator('#load-game').click();await reach('explore');assert.equal(await p.evaluate(()=>[G.mapZone,Exploration.phase(),G.profile.name].join()),'yard,lost,지존이');
 await talkToMinsu();await reach('explore');assert.notEqual(await p.evaluate(()=>G.scene),'battle');
 // Home: the scrap is on the table; folding may go wrong and still continues; no paid upgrade and no stat change.
 await p.evaluate(()=>{Exploration.enter('home',420);Exploration.interact()});await p.waitForFunction(()=>G.state==='dialogue');assert(await p.locator('#skip').isVisible(),'Story scenes can be skipped');await reach('folding');assert.equal(await p.evaluate(()=>G.checkpoint),'home');
 await p.keyboard.press('KeyI');assert.equal(await p.locator('[data-item]').count(),0);await p.keyboard.press('KeyI');
 for(const key of ['Digit2','Digit2','Digit3','Digit4']){await p.waitForFunction(()=>G.state==='folding');await p.locator('#game').focus();await p.keyboard.press(key)}
 await p.waitForFunction(()=>G.state==='dialogue');assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('그건 딱지야, 종이비행기야?'))));assert(await p.evaluate(()=>G.foldMiss>=1));await reach('folding');
 for(let i=1;i<=4;i++){await p.waitForFunction(()=>G.state==='folding');await p.locator('#game').focus();await p.keyboard.press('Digit'+i)}await reach('result');
 assert.equal(await p.evaluate(()=>G.checkpoint),'practice');assert.deepEqual(await p.evaluate(()=>[G.profile.coins,G.profile.upgrades.newspaper,G.profile.xp,G.profile.map.phase]),[0,0,0,'folded']);assert.equal(await p.locator('#home-compress').count(),0,'No paid home compress step');
 // Practice: eraser target, first strike hits a sock, one attack + gauge stop unlocks the rematch, ends with a flip demo.
 await p.locator('#continue').click();await reach('ready');assert((await p.locator('#enemy-name').textContent()).includes('지우개'));await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>G.state==='dialogue');
 assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('표적이 조금 움직였나?'))&&G.dialogue.some(l=>l[1].includes('지우개는 움직이지 않았다'))));assert.equal(await p.evaluate(()=>G.profile.map.phase),'rematch');assert.equal(await p.evaluate(()=>G.checkpoint),'rematch');
 await reach('ready');await p.evaluate(()=>TtakjiRules.positionAt=()=>0);await attack();await attack();await p.waitForFunction(()=>G.state==='dialogue');assert(await p.evaluate(()=>G.flipEnemy>0),'Flip demo plays even after misses');await reach('result');
 assert.deepEqual(await p.evaluate(()=>[G.profile.xp,G.profile.upgrades.newspaper,G.profile.coins]),[0,0,0],'Practice never changes stats');assert(await p.locator('#result-secondary').isVisible(),'Practice is repeatable');
 await p.locator('#result-secondary').click();await reach('ready');assert.equal(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('표적이 조금'))&&G.state==='dialogue'),false);await p.evaluate(()=>TtakjiRules.positionAt=()=>.35);for(let i=0;i<3;i++){await attack();if(await p.evaluate(()=>G.state==='dialogue'))await reach('result')}await reach('result');
 await p.locator('#continue').click();await reach('explore');assert.equal(await p.evaluate(()=>G.mapZone),'home');assert.equal(await p.evaluate(()=>Exploration.objective()[1]),'학교에서 민수에게 다시 도전하자');
 // Rematch: real result. A loss shows the hint with immediate retry or home practice.
 await talkToMinsu();await p.waitForFunction(()=>G.state==='dialogue');assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('신문지면 어제랑 똑같잖아?'))&&G.dialogue.some(l=>l[1].includes('접은 사람이 달라졌지'))));await reach('ready');
 assert.equal(await p.evaluate(()=>G.maxHp),100);await p.evaluate(()=>{G.hp=1;TtakjiRules.positionAt=()=>0});await attack();await reach('result');
 assert((await p.locator('#result-text').textContent()).includes('접힌 선을 한 번 더 눌러 볼까?'));assert.equal(await p.locator('#continue').textContent(),'재도전 →');assert.equal(await p.locator('#result-secondary').textContent(),'집에서 연습');assert.equal(await p.evaluate(()=>G.profile.schoolReward),false);
 await p.locator('#continue').click();await reach('ready');assert.deepEqual(await p.evaluate(()=>[G.mode,G.hp]),['rematch',100]);
 await p.evaluate(()=>TtakjiRules.positionAt=()=>.5);await attack();assert.equal(await p.evaluate(()=>G.enemyHp),72,'PERFECT: (24-2.5)*1.3');assert.equal(await p.evaluate(()=>G.hp),80,'Rival GOOD: (18+4-4)*1.1');await attack();await reach('result');
 assert.equal(await p.evaluate(()=>G.checkpoint),'complete');assert.equal(await p.evaluate(()=>G.profile.coins),80);await p.screenshot({path:path.join(artifacts,'school-rematch-won.png')});
 // Skipping the scene keeps its rewards and state changes; the empty bench can be examined.
 await p.locator('#continue').click();await p.waitForFunction(()=>G.state==='dialogue');assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('어제보다 훨씬 납작해졌네'))&&G.dialogue.some(l=>l[1].includes('오늘 아침에 이사 갔어'))));
 await p.locator('#skip').click();await reach('explore');assert.equal(await p.evaluate(()=>G.mapZone),'yard');assert(await p.evaluate(()=>G.profile.schoolReward&&G.profile.owned.includes('colored_paper')&&G.profile.story.seen.rematch_win));
 await p.evaluate(()=>{G.hero.x=520;Exploration.interact()});assert(await p.evaluate(()=>G.dialogue[0][1].includes('딱지는 어디로 간 걸까?')));await reach('explore');
 assert.equal(await p.evaluate(()=>Exploration.objective()[1]),'학교 앞 게시판의 대회 포스터를 확인하자');await talkToMinsu();assert(await p.evaluate(()=>G.dialogue[0][1].includes('대회')));await reach('explore');
 await p.reload();await p.locator('#load-game').click();await p.waitForFunction(()=>G.state==='explore');assert.deepEqual(await p.evaluate(()=>[G.profile.name,G.profile.coins,G.profile.schoolReward]),['지존이',80,true]);
 assert.deepEqual(errors,[]);console.log('PASS name entry, prologue bet/once-only scripted loss/grade reaction/Doyun keeps the ttakji/scrap, home folding with failure, free practice with sock gag and flip demo, rematch loss hint + retry + win, skip keeps rewards, empty bench, reload');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
