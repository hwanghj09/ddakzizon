'use strict';
/* Title, naming, new game / resume, school exploration and dialogue. */
function title(){window.Minimum?.title();cancelScene();G.toastUntil=0;$('toast').classList.remove('visible');G.state='title';G.scene='classroom';G.hero={x:245,y:377,walk:0,facing:1};panels('title-screen');$('load-game').disabled=!G.save;$('title-settings').hidden=true;$('name-entry').hidden=true;if(G.audio&&!G.sound)G.audio.suspend().catch(()=>{})}
const heroName=()=>G.profile?.name||TtakjiProgression.DEFAULT_NAME,fillName=text=>String(text).replaceAll('{name}',heroName());
// New game first asks for the hero's name (spec 04 §2); the title screen stays underneath.
function openNaming(){$('title-settings').hidden=true;$('name-entry').hidden=false;const input=$('hero-name');input.value='';input.placeholder=TtakjiProgression.DEFAULT_NAME;input.focus({preventScroll:true})}
function closeNaming(){$('name-entry').hidden=true;$('new-game').focus({preventScroll:true})}
function confirmName(){if($('name-entry').hidden)return;const name=TtakjiProgression.sanitizeName($('hero-name').value);$('name-entry').hidden=true;startNewGame(name)}
function newGame(){initAudio();sound('click');openNaming()}
function startNewGame(name){cancelScene();G.mapZone=null;G.mapPractice=false;G.profile=TtakjiProgression.fresh();G.profile.name=TtakjiProgression.sanitizeName(name);G.hub='village';G.fold=0;G.practice=[];G.stolen=false;G.flipPlayer=0;G.flipEnemy=0;checkpoint('classroom');campaignClassroom()}
const classroomExitLine=2,classroomExitTime=950;
function classroomOpening(done,skippable=false){
 G.mapZone=null;G.scene='classroom';sound('school-bell');
 say([
  ['','딩동댕동—. 수업이 끝나는 종이 울렸다.'],
  ['선생님','자, 여러분. 언제나 차 조심, 도로 조심, 사람 조심하면서 집에 가세요~!'],
  ['','선생님이 교실 문을 열고 밖으로 나갔다.'],
  ['민수','야, 오늘 딱지 어디서 칠 거야?'],
  ['도윤','운동장 정자에서. 수업 끝났으니까 바로 가자.'],
  ['나','딱지…? 둘이 뭘 하는지 궁금해졌다.']
 ],done,false,skippable);
 $('game').focus({preventScroll:true});
}
function classroomChoice(follow){
 G.state='choice';G.keys.clear();G.target=null;panels('story-choice');
 const button=$('follow-friends');
 button.onclick=()=>{if(G.paused||G.state!=='choice')return;sound('click');follow()};
 button.focus({preventScroll:true});
}
function campaignClassroom(){G.mode='intro_battle';Village.hud();classroomOpening(campaignClassroomChoice,true)}
function campaignClassroomChoice(){
 G.mapZone=null;G.scene='classroom';G.mode='intro_battle';Village.hud();checkpoint('classroom_choice');
 classroomChoice(()=>{
  G.profile.map.x=760;checkpoint('school');
  transition(()=>card('','첫 번째 뒤집힘','',1500,()=>explore(false,760)));
 });
}
function resumeSave(){initAudio();cancelScene();const cp=G.save?.checkpoint||'school';G.profile=TtakjiProgression.restore(G.save?.profile);G.checkpoint=cp;G.fold=['classroom','classroom_choice','school'].includes(cp)?0:4;G.stolen=false;if(cp==='classroom'){campaignClassroom();return}if(cp==='classroom_choice'){campaignClassroomChoice();return}transition(()=>{if(!G.profile.schoolReward&&G.profile.map.phase==='lost'){School.fatherLesson();return}if(cp==='exploration')Exploration.enter(G.profile.map.zone,G.profile.map.x);else if(cp==='school')explore(false,G.profile.map.x);else if(cp==='home')School.fatherLesson();else if(cp==='home_upgrade'||cp==='practice')practice();else if(cp==='complete')Village.epilogue();else if(cp==='village')Village.enter();else if(cp==='tournament')Tournament.resume();else if(cp==='village_reward')Village.rewardStory(true);else if(cp==='city_intro')City.intro();else if(cp==='city_reunion')City.reunionStory();else if(cp==='city')City.enter();else if(cp==='city_skill')City.skillStory();else if(cp==='city_reward')City.rewardStory();else if(cp==='ending')Ending.start();else if(Stages[cp.split('_')[0]]){const stage=Stages[cp.split('_')[0]];if(cp.endsWith('_intro'))stage.intro();else if(cp.endsWith('_reward'))stage.rewardStory();else if(cp.endsWith('_skill'))stage.skillStory();else stage.enter()}else explore(true)})}
function explore(rematch,x=180){if(rematch)G.profile.map.phase='rematch';else if(!G.profile.schoolReward)G.profile.map.phase='school';Exploration.enter('yard',x);if(!rematch&&!G.profile.seen.mapControls){G.profile.seen.mapControls=true;Exploration.save();say([['민수','야, {name}! 같이 할래? A, D나 좌우 방향키로 이리 와!'],['민수','가까이 오면 E나 스페이스로 말을 걸어. 길이 궁금하면 M으로 지도를 봐.']],()=>{G.state='explore';panels('explore-ui');Exploration.updateInteract();$('game').focus({preventScroll:true})})}}
function nearRival(){return Math.hypot(G.hero.x-665,G.hero.y-365)<110}
function updateInteract(){if(Exploration.active()){Exploration.updateInteract();return;}if(G.scene==='city'){City.updateInteract();return;}if(G.scene==='village'){Village.updateInteract();return;}if(G.mode==='intro_battle')coach(nearRival()?'할 거면 E 눌러. 한 판 붙자!':'야, 너도 할래? 방향키나 WASD로 이리 와!');else coach(nearRival()?'E 눌러. 이번엔 좀 다르겠지?':'또 왔네? 이쪽이야!')}
function interact(){if(G.state==='explore'&&Exploration.active()){Exploration.interact();return;}if(G.state==='explore'&&G.scene==='city'){City.interact();return;}if(G.state==='explore'&&G.scene==='village'){Village.interact();return;}if(G.state!=='explore'||!nearRival())return;G.keys.clear();G.target=null;G.hero.facing=1;sound('click');if(G.mode==='intro_battle')story('prologue_bet',()=>transition(()=>battle('intro_battle')));else story('rematch_intro',()=>transition(()=>battle('rematch')))}
// Dialogue: '나' is shown as the hero's name and {name} is filled in. Skippable story scenes show 건너뛰기, which runs the
// same completion callback, so skipping never skips rewards or state changes.
function say(lines,done,closable=false,skippable=false){G.state='dialogue';G.dialogueSpeakers=lines.map(l=>l[0]);G.dialogue=lines.map(([speaker,line])=>[speaker==='나'?heroName():speaker,fillName(line)]);G.dialogIndex=0;G.dialogDone=done;G.dialogClosable=closable;G.dialogSkippable=skippable;$('skip').hidden=!skippable;G.keys.clear();G.target=null;panels('dialogue');renderDialogue()}
// Main story scenes are recorded as seen so they can be replayed (다시 보기) from the menu or the notice board.
function story(id,done){const scene=TtakjiStory.scenes[id];if(!scene){done();return}G.profile.story.seen[id]=true;say(scene.lines,done,false,true)}
// 다시 보기 from the menu or the notice board. The credits entry replays the whole ending (no match) and returns to the same spot.
function replayScene(id,done){const scene=TtakjiStory.scenes[id];if(scene.credits){const zone=G.mapZone,x=G.hero.x;Ending.replay(()=>transition(()=>Exploration.enter(zone,x)));return}say(scene.lines,done,false,true)}
function skipDialogue(){if(G.paused||G.state!=='dialogue'||!G.dialogSkippable)return;sound('click');G.state='transition';G.dialogDone()}
function renderDialogue(){const [speaker,line]=G.dialogue[G.dialogIndex],key=G.dialogueSpeakers?.[G.dialogIndex]??speaker;G.dialogStart=G.now;G.dialogComplete=false;G.dialogVisible='';
 const nextButton=$('next');
 nextButton.disabled=G.scene==='classroom'&&G.dialogIndex===classroomExitLine;
 if(nextButton.disabled)after(classroomExitTime,()=>{nextButton.disabled=false});
 $('speaker').textContent=speaker;$('line').textContent='';$('line').setAttribute('aria-label',line);$('portrait').className='portrait '+(key===''?'narration':({'선생님':'teacher','민수':'rival','도윤':'boss','앞집 아저씨':'neighbor','하나':'friend','박태풍':'uncle','서준':'sprinter','한별':'folder','사회자':'neighbor','대회 코치':'neighbor','아빠':'father','공방 주인':'folder','엇박자 선수':'sprinter','한방 승부사':'sprinter','종이 수비수':'folder','상자왕':'neighbor','최단단':'folder','윤서':'sprinter','심판':'neighbor','후원사 직원':'neighbor','테이프 딱지 선수':'friend','공인 딱지 선수':'folder','이규격':'gyugyeok','백지훈':'neighbor','접수원':'reception','통역사':'neighbor','마리':'friend','리오':'sprinter','아라':'champ','미라':'friend','연맹 추천 선수':'folder','한결':'hangyeol','옆 사람':'neighbor','우주 접수원':'alien','모서리 셋':'alien','반짝':'alien','무중':'mujung','어린 참가자':'friend','박자왕':'sprinter','사막 아이':'sprinter','빙판 제자':'folder','무대 위 쇼맨':'minsu','종이 건축가':'folder','달 기지 훈련생':'alien','화성 아이':'alien','화성 대표':'alien','그날의 나':'hero'}[key]||''));window.GameArt?.portrait($('portrait'),key===''?null:$('portrait').classList[1]||(key==='나'?'hero':'neighbor'))}
function next(){if(G.state!=='dialogue'||$('next').disabled)return;sound('click');if(!G.dialogComplete){G.dialogComplete=true;$('line').textContent=G.dialogue[G.dialogIndex][1];return}if(++G.dialogIndex<G.dialogue.length)renderDialogue();else{G.state='transition';G.dialogDone()}}
