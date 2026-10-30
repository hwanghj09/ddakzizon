// Run npm start first. Override TEST_URL, BROWSER_EXECUTABLE or ARTIFACT_DIR as needed.
const fs=require('node:fs'),path=require('node:path');
const artifacts=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(artifacts,{recursive:true});
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('seeded')){localStorage.setItem('ddakzizon.chapter1.v2',JSON.stringify({version:2,checkpoint:'complete'}));localStorage.setItem('seeded','yes')}});
 await p.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await p.locator('#load-game').click();
 await p.waitForFunction(()=>G.state==='dialogue');
 const dialogues=async()=>{for(let i=0;i<200;i++){const state=await p.evaluate(()=>G.state);if(state==='dialogue'){await p.locator('#next').click();await p.waitForTimeout(20)}else if(['transition','cinematic'].includes(state)){await p.waitForTimeout(120)}else return}throw Error('dialogue loop')};
 await dialogues();await p.waitForFunction(()=>G.scene==='village'&&G.state==='explore');assert.equal(await p.evaluate(()=>G.profile.name),'주인공','Old saves migrate to the default name');
 await p.evaluate(()=>{G.profile.map.poster=true;checkpoint('village')});
 assert.equal(await p.evaluate(()=>G.profile.coins),80);await p.screenshot({path:path.join(artifacts,'village-hub.png')});
 const visit=async(id)=>{await p.waitForFunction(()=>G.state==='explore');await p.evaluate(id=>Village.open(id),id);await p.waitForFunction(()=>['facility','dialogue'].includes(G.state))}; // Walking and entrances are covered in exploration.browser.cjs.
 const leave=async()=>{await p.locator('#facility-close').click()};
 await visit('house');await p.getByRole('button',{name:/색종이 딱지/}).click();assert.equal(await p.evaluate(()=>G.profile.equipped),'colored_paper');await leave();
 // The compressor is introduced after round 1, never required before.
 await visit('press');assert.equal(await p.evaluate(()=>G.state),'dialogue');assert(await p.evaluate(()=>G.dialogue[0][1].includes('1회전')));await dialogues();
 await p.evaluate(()=>{const realUpdate=update;update=dt=>realUpdate(dt*(G.state==='explore'?1:5));TtakjiRules.positionAt=()=>.5;Math.random=()=>.9}); // A high roll never passes a flip check (max 75%) and draws opponents' 빗나감, so only scripted turns hit hard.
 const attack=async()=>{await p.waitForFunction(()=>G.state==='ready');await p.locator('#attack').click();await p.locator('#strike').click();await p.waitForFunction(()=>['ready','result','dialogue'].includes(G.state))};
 await visit('training');await p.getByRole('button',{name:'타이밍 훈련 · 3번 치기'}).click();for(let i=0;i<3;i++)await attack();assert.equal(await p.evaluate(()=>G.profile.xp),1);assert.equal(await p.evaluate(()=>G.profile.coins),85);await p.locator('#continue').click();await p.waitForFunction(()=>G.state==='explore');
 // Registration, bracket with other entrants and a 성향 hint, prep screen, then each match.
 await p.evaluate(()=>{Exploration.enter('lobby',700);Exploration.interact()});await p.waitForFunction(()=>G.facility==='bracket');await p.locator('#tournament-register').click();assert.equal(await p.evaluate(()=>G.profile.villageEntered),true);
 assert((await p.locator('#next-opponent').textContent()).includes('앞집 아저씨'));assert((await p.locator('#next-opponent').textContent()).includes('방어는 높고'));assert((await p.locator('#bracket-board').textContent()).includes('하나 vs 세탁소 사장님 → 하나 승'));await p.screenshot({path:path.join(artifacts,'village-bracket.png')});
 const coins=[85+50,85+50+70,85+50+70+150];
 for(let round=0;round<3;round++){
  await p.waitForFunction(()=>G.facility==='bracket');await p.locator('#tournament-prep').click();await p.waitForFunction(()=>G.facility==='prep');
  assert((await p.locator('#prep-equipped').textContent()).includes('색종이 딱지'));assert((await p.locator('#facility-content').textContent()).includes(round===0?'아직 없음':'아직 없음'));
  await p.locator('#match-start').click();await p.waitForFunction(()=>G.state==='dialogue');
  if(round===0)assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('아, 아'))&&G.dialogue.some(l=>l[1].includes('사실 다 들렸어'))));
  if(round===1)assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('크레파스'))));
  if(round===2)assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('내 이름은 박태풍'))&&G.dialogue.some(l=>l[1].includes('현수막 좀 잡아'))));
  await dialogues();await p.waitForFunction(()=>G.state==='ready');
  if(round===0){assert(await p.locator('#skill-precise').isHidden(),'No skill before the village final');await p.locator('#game').focus();await p.keyboard.press('KeyF');assert.equal(await p.evaluate(()=>G.state),'ready')}
  for(let i=0;i<15&&await p.evaluate(()=>!['result','dialogue'].includes(G.state));i++)await attack();
  assert.equal(await p.evaluate(()=>G.profile.round),round+1,'Reward is granted with the match record, before the scene');assert.equal(await p.evaluate(()=>G.profile.coins),coins[round]);
  if(round===0)assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('잠을 못 잤는데'))));if(round===1)assert(await p.evaluate(()=>G.dialogue.some(l=>l[1].includes('잘 접은 건 기다려 주거든'))));
  await dialogues();await p.waitForFunction(()=>G.state==='result');const stats=await p.locator('#result-stats').textContent();assert(stats.includes(`+${[50,70,150][round]}원`)&&stats.includes('최초 보상'),stats);
  if(round===0)assert(stats.includes('압축기'));if(round===1)assert(stats.includes('색종이 재료 +1'));if(round===2){assert(stats.includes('정밀 타격')&&stats.includes('머리카락 딱지')&&stats.includes('표창장')&&stats.includes('시 대회 참가권'));assert.deepEqual(await p.evaluate(()=>G.profile.skills),['precise'],'Skill granted on the final result screen')}
  if(round<2){assert(await p.locator('#result-secondary').isVisible());assert.equal(await p.locator('#result-extra button').textContent(),'마을로')}
  await p.locator('#continue').click();
  if(round===0){await p.waitForFunction(()=>G.facility==='bracket');await leave();await p.waitForFunction(()=>G.state==='explore');
   // Between rounds 앞집 아저씨 and 하나 wait at the venue, not in the alley or square; the compressor is open but optional.
   assert(await p.evaluate(()=>Exploration.objects().some(o=>o.id==='neighbor')&&Exploration.objects().some(o=>o.id==='hana')));await p.evaluate(()=>Exploration.enter('alley',900));assert.equal(await p.evaluate(()=>Exploration.objects().some(o=>o.id==='neighbor')),false);await p.evaluate(()=>Exploration.enter('square',900));assert.equal(await p.evaluate(()=>Exploration.objects().some(o=>o.id==='hana')),false);
   await visit('press');assert.equal(await p.evaluate(()=>G.facility),'press');await leave();
   await p.reload();await p.evaluate(()=>{const realUpdate=update;update=dt=>realUpdate(dt*(G.state==='explore'?1:5));TtakjiRules.positionAt=()=>.5;Math.random=()=>.9});await p.locator('#load-game').click();await p.waitForFunction(()=>G.state==='explore');
   await p.evaluate(()=>{Exploration.enter('lobby',700);Exploration.interact()});await p.waitForFunction(()=>G.facility==='bracket');assert((await p.locator('#next-opponent').textContent()).includes('하나'))}
  else if(round===2){await p.waitForFunction(()=>G.state==='dialogue');assert(await p.evaluate(()=>['한 올 한 올','묻지 마라','물컵','너라도 도 대회에서 잘해라','힘만 세다고'].every(t=>G.dialogue.some(l=>l[1].includes(t)))));await dialogues();await p.waitForFunction(()=>G.state==='explore')}
 }
 assert.equal(await p.evaluate(()=>G.profile.coins),355);assert.equal(await p.evaluate(()=>G.profile.keepsakes.award),true);assert.equal(await p.evaluate(()=>G.profile.map.materials.colored_paper),1);
 // After the cup: neighbor back in the alley, 박태풍 moves from the center chair to the square and only explains.
 await p.evaluate(()=>Exploration.enter('center',1000));assert.equal(await p.evaluate(()=>Exploration.objects().some(o=>o.id==='uncle')),false);await p.evaluate(()=>Exploration.enter('alley',1150));assert(await p.evaluate(()=>Exploration.objects().some(o=>o.id==='neighbor')));
 await p.evaluate(()=>{Exploration.enter('square',980);Exploration.interact()});assert(await p.evaluate(()=>G.dialogue[0][0]==='박태풍'&&G.dialogue[0][1].includes('정밀 타격')));await dialogues();assert.deepEqual(await p.evaluate(()=>G.profile.skills),['precise']);
 await visit('house');await p.getByRole('button',{name:/머리카락 딱지/}).click();await p.screenshot({path:path.join(artifacts,'village-reward.png')});await leave();
 await p.reload();await p.locator('#load-game').click();await p.waitForFunction(()=>G.state==='explore');assert.equal(await p.evaluate(()=>G.profile.equipped),'hair');assert.equal(await p.evaluate(()=>G.profile.coins),355);
 await p.evaluate(()=>{const realUpdate=update;update=dt=>realUpdate(dt*(G.state==='explore'?1:5));TtakjiRules.positionAt=()=>.5;Math.random=()=>.9});
 // 자유 경기: smaller repeat reward, no first rewards again, no story scene.
 await p.evaluate(()=>{Exploration.enter('lobby',700);Exploration.interact()});await p.waitForFunction(()=>G.facility==='bracket');await p.locator('[data-replay="0"]').click();await p.waitForFunction(()=>G.facility==='prep');await p.locator('#match-start').click();await p.waitForFunction(()=>G.state==='ready');
 for(let i=0;i<15&&await p.evaluate(()=>G.state!=='result');i++)await attack();const repeat=await p.locator('#result-stats').textContent();assert(repeat.includes('+10원')&&repeat.includes('반복 보상')&&repeat.includes('수령 완료'),repeat);
 assert.equal(await p.evaluate(()=>G.profile.coins),365);assert.equal(await p.evaluate(()=>G.profile.round),3);assert.equal(await p.locator('#result-extra button').first().textContent(),'다시 하기');await p.locator('#continue').click();await p.waitForFunction(()=>G.facility==='bracket');await leave();
 // 표창장: asked whether to keep the original; the framed copy stays at home either way.
 await p.evaluate(()=>{Exploration.enter('home',420);Exploration.interact()});await p.getByRole('button',{name:/표창장 딱지 접기/}).click();await p.getByRole('button',{name:'원본은 보관하기'}).click();assert.equal(await p.evaluate(()=>G.profile.keepsakes.award),true);
 await p.getByRole('button',{name:/표창장 딱지 접기/}).click();await p.getByRole('button',{name:'원본으로 접기'}).click();assert(await p.evaluate(()=>G.profile.owned.includes('award_ttakji')&&!G.profile.keepsakes.award));await leave();assert(await p.evaluate(()=>Exploration.objects().some(o=>o.id==='frame')));
 await p.evaluate(()=>Exploration.enter('square',1550));
 await visit('training');await p.getByRole('button',{name:'연습 대결 · 보상 없음'}).click();await p.waitForFunction(()=>G.state==='ready');await p.locator('#game').focus();assert(await p.locator('#skill-precise').isEnabled());await p.keyboard.press('KeyR');assert(await p.evaluate(()=>G.state==='timing'&&G.skill==='precise'));await p.keyboard.press('Space');await p.waitForFunction(()=>G.state==='ready');assert.equal(await p.evaluate(()=>G.cool.precise),2,'Cooldown 3, ticked once at the start of the next own turn');assert(await p.locator('#skill-precise').isDisabled());assert((await p.locator('#skill-precise').textContent()).includes('2턴'));
 await p.keyboard.press('Escape');const now=await p.evaluate(()=>G.now);await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>G.now),now);await p.locator('#resume').click();
 assert.deepEqual(errors,[]);console.log('PASS migrated school ending, equipment, compressor after round 1, training, registration, bracket with other entrants, prep, 3-round cup with spec scenes, first vs repeat rewards, NPC placement, 표창장 keep/fold, reload and precise cooldown');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
