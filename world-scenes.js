'use strict';
/* Full scenes: village, arenas, battle, home, ending, classroom and title. */
(()=>{const {canvas,ctx,ttakjiSprites,ttakji,OUT,NAVY,YELLOW,RED,BLUE,WHITE,rect,box,text,line,circle,ell,rr,panel,poly,grad,sky,sun,cloud,hills,tree,grassEdge,school,CHARACTER,LOOKS,actor,npcGroup,drawExplore,speech,paper}=WorldKit;
function villageBackground(){
 if(window.GameArt?.hub(ctx,'village',Village.places,text))return;
 sky(320,'#4fc3ff','#d4f4ff');sun(90,64);cloud(240+Math.sin(G.now/22000)*14,60);cloud(700,46,.8);cloud(480,92,.5);hills(232);
 grassEdge(296);grad(0,310,960,290,'#ffd08a','#f2a65a');rect(0,318,960,8,'#fff1cf');
 for(let i=0;i<24;i++){rect(i*42+2,458,32,16,OUT);rect(i*42+4,460,28,12,'#ffe2ad')}
 for(let i=0;i<26;i++)rect((i*149)%960,340+(i*37)%100,4,3,'#d9803a88');
 const walls=['#fff1d0','#d8f3ff','#ffe0ec','#fff6b8'],roofs=[RED,BLUE,'#a259ff','#ff9f1c'];
 Village.places.forEach((place,i)=>{const x=place.x-80;
  box(x,158,160,157,walls[i]);rect(x,294,160,21,'#00000014');
  poly([[x-14,162],[x+174,162],[x+150,128],[x+10,128]],roofs[i]);rect(x+16,134,128,4,'#ffffff55');
  panel(x+8,172,144,32,6,NAVY);text(place.name,place.x,195,15,YELLOW,'center',900);
  box(x+57,236,46,79,'#9a5b2c');rect(x+63,242,34,73,'#b8743a');circle(x+90,280,3,YELLOW);
  for(const[wx,ww]of[[13,33],[116,30]]){box(x+wx,222,ww,35,'#7fd3ff');rect(x+wx+4,225,7,14,'#e9faff');rect(x+wx,238,ww,3,OUT)}
  box(x+47,315,66,6,'#e5e1d8',2);
  if(i===2){box(x+15,264,30,48,'#9aa5b1');rect(x+19,270,22,6,RED);box(x+24,280,12,22,YELLOW,2)}
  if(i===3){line(x-10,112,x+170,112,OUT,2);for(let j=0;j<6;j++)poly([[x-6+j*30,112],[x+14+j*30,112],[x+4+j*30,128+Math.sin(G.now/300+j)*2]],[RED,YELLOW,BLUE][j%3],OUT,2)}
 });
 tree(16,226,.65);tree(905,225,.65);
}
function drawVillage(){villageBackground();actor(280,365,'neighbor',0,.95,-1);actor(835,393,'uncle',0,1.05,-1);actor(G.hero.x,G.hero.y,'hero',G.hero.walk,1,G.hero.facing);if(G.state==='explore'){const place=Village.nearest();speech(place?place.x:480,130)}}
// Continent, world and planet battle arenas: one layout, three palettes.
const TIER_LOOK={
 continent:{banner:'#ff9f1c',wall:['#5a2a1e','#a84a2a'],title:'접 기 의  축 제'},
 world:{banner:BLUE,wall:['#0f1a4a','#2f4fb8'],title:'세 계  딱 지  선 수 권'},
 planet:{banner:'#a259ff',wall:['#0b0620','#3a1a6e'],title:'우 주  딱 지  교 류 전'}
};
function stars(n,h){for(let i=0;i<n;i++){const x=(i*137)%960,y=(i*71)%h,s=i%5===0?3:2;ctx.globalAlpha=.5+.5*Math.abs(Math.sin(G.now/600+i));rect(x,y,s,s,i%7===0?YELLOW:WHITE)}ctx.globalAlpha=1}

function tierArena(id){const L=TIER_LOOK[id],planet=id==='planet';
 if(window.GameArt?.background(ctx,id,285)){text(L.title,480,70,22,WHITE,'center',900,OUT);return}
 grad(0,0,960,272,L.wall[0],L.wall[1]);if(id!=='continent')stars(40,140);
 ctx.fillStyle='#fff6c022';for(const k of[160,480,800]){ctx.beginPath();ctx.moveTo(k-14,0);ctx.lineTo(k+14,0);ctx.lineTo(k+130,272);ctx.lineTo(k-130,272);ctx.closePath();ctx.fill()}
 const skins=planet?[LOOKS.alien.skin,LOOKS.hero.skin,'#83a5bc']:[LOOKS.hero.skin,LOOKS.boss.skin,'#bd9475'];
 for(let row=0;row<2;row++){rect(40,166+row*57,880,9,OUT);for(let i=0;i<17;i++){const x=78+i*50,y=150+row*57+Math.sin(G.now/220+i*1.7+row)*2;box(x-11,y+10,22,18,[LOOKS.hero.shirt,LOOKS.neighbor.shirt,LOOKS.rival.shirt,LOOKS.friend.shirt][(i+row)%4],2);circle(x,y,10,OUT);circle(x,y,8,skins[i%3])}}
 panel(300,12,360,52,12,L.banner);text(L.title,480,47,24,WHITE,'center',900,OUT);
 rect(0,268,960,4,OUT);grad(0,272,960,328,planet?'#b9b4c9':'#f7c47e',planet?'#7a7396':'#d98a42');rect(0,272,960,5,'#ffffff88');for(let i=0;i<14;i++)rect(i*75,285,3,315,'#00000018');
}
function drawAdvert(){school();ctx.fillStyle='#1b123055';ctx.fillRect(0,0,960,600);panel(340,105,280,315,14,RED);panel(354,119,252,287,8,'#fff8e6',OUT,0);text('제1회',480,163,18,RED,'center',900);text('우리 마을',480,212,32,NAVY,'center',900);text('딱지 대회',480,260,40,WHITE,'center',900,OUT);paper(480,318,65,'red',Math.sin(G.now/500)*.08,1);text('우승 상금 120원',480,380,19,NAVY,'center',900)}
function drawBattle(){const practice=['practice','training','story_training'].includes(G.mode);
 if(practice){if(!window.GameArt?.background(ctx,'home',285)){rect(0,0,960,275,'#ffe7c2');for(let i=0;i<24;i++)rect(i*40,0,18,275,'#ffdba8');box(35,95,266,180,'#7fd3ff');rect(35,215,266,60,'#5ab8f0');rect(166,95,4,180,OUT);rect(35,183,266,4,OUT);cloud(70,140,.6);panel(380,60,200,60,8,NAVY);text('연 습 장',480,99,22,YELLOW,'center',900);tree(822,160,1.4);rect(0,272,960,4,OUT);grad(0,276,960,324,'#f7c47e','#e09a50');for(let i=0;i<14;i++)rect(i*75,276,3,324,'#c9813f55')}}
 else{if(G.mode==='ending_match')school();else if(Village.isBattle()){if(TIER_LOOK[G.hub])tierArena(G.hub);else MapRenderer.arena(ctx,{rect,text,line,actor},G.hub)}else school()}
 // Tournament mat with a center line and numbered sides.
 ell(480,442,335,12,'#17243740');panel(152,286,656,151,5,'#172437','#fff5d5',2);
 rect(162,296,636,131,'#365471');ctx.strokeStyle='#d9e6ec';ctx.lineWidth=2;
 ctx.strokeRect(169,303,622,117);ctx.beginPath();ctx.ellipse(480,362,84,43,0,0,Math.PI*2);ctx.stroke();
 line(480,303,480,420,'#d9e6ec',2);text('1',188,323,13,'#a9d7b7','center');text('2',772,323,13,'#ee9c75','center');
 actor(125,347,'hero',0,1.1,1,'player');
 if(!practice){
  const opponent=Village.isBattle()?G.opponent:null;
  actor(837,347,opponent?.sprite||opponent?.kind||'rival',0,1.1,-1,'enemy');
  if(G.mode==='intro_battle'&&!window.Minimum?.active)actor(891,313,'boss',0,.85,-1);
 }
 let px=310,py=350,ex=650,ey=350,pa=-.16,ea=.15,ps=1,es=1;
if(G.animation){const t=(G.now-G.animation.at)/1000;const grade=G.animation.grade;const power=grade==='PERFECT'?1:grade==='GOOD'?.65:grade==='NORMAL'?.45:.3;if(G.animation.kind==='player-hit'){if(t<.36){const q=t/.36;px=310+Math.pow(q,2)*320;py=350-Math.sin(q*Math.PI)*95;pa=-.16-q*.7;ps=1+Math.sin(q*Math.PI)*.25}else if(t<.7){const q=(t-.36)/.34;px=630-(630-310)*q;py=350-55*Math.sin(q*Math.PI);ey-=Math.sin(q*Math.PI)*55*power;ea+=Math.sin(q*Math.PI*2)*.35*power}}else if(G.animation.kind==='enemy-ready'){ey-=Math.sin(Math.min(t/.75,1)*Math.PI/2)*35;ea-=.2*Math.min(t/.75,1)}else if(G.animation.kind==='enemy-hit'){if(t<.36){const q=t/.36;ex=650-Math.pow(q,2)*320;ey=315-Math.sin(q*Math.PI)*105;ea=.15+q*.8;es=1+Math.sin(q*Math.PI)*.35}else if(t<.7){const q=(t-.36)/.34;ex=330+320*q;ey=350-Math.sin(q*Math.PI)*50;py-=Math.sin(q*Math.PI)*25}}}
let psy=.76,esy=.76;if(G.animation?.kind==='near-flip'&&!reducedMotion){const q=Math.min(1,(G.now-G.animation.at)/1500),lift=Math.sin(q*Math.PI);ey-=lift*60;ea+=lift*.7;ex+=Math.sin(q*Math.PI*4)*7;esy*=1-lift*.93}if(G.flipPlayer){const t=Math.min((G.now-G.flipPlayer)/800,1);psy=Math.cos(t*Math.PI)*.76;py-=Math.sin(t*Math.PI)*95;pa+=t*.18}if(G.flipEnemy){const t=Math.min((G.now-G.flipEnemy)/800,1);esy=Math.cos(t*Math.PI)*.76;ey-=Math.sin(t*Math.PI)*95;ea-=t*.2}if(G.stolen){const t=Math.min((G.now-G.stolenAt)/900,1);px+=t*560;py-=t*90;ctx.globalAlpha=1-t}
 // Ground shadows under each ttakji sell the height of each throw.
 ell(px,402,46*(1-(350-py)/260),9,'#1b123044');ell(ex,402,46*(1-(350-ey)/260),9,'#1b123044');
 const playerSprite=G.flipPlayer&&psy<0?'flipped':G.hp<G.maxHp?'damaged':'base';paper(px,py,106*ps,Village.isBattle()?G.profile.equipped:'news',pa,1,4,playerSprite,Math.abs(psy)/.76);ctx.globalAlpha=1;const enemySprite=G.flipEnemy&&esy<0?'flipped':G.enemyHp<G.enemyMax?'damaged':'base';paper(ex,ey,106*es,Village.isBattle()?G.opponent.material:window.Minimum?.active?'newspaper':'red',ea,1,4,enemySprite,Math.abs(esy)/.76);if(G.mode!=='practice')speech(760,245);
}

function drawHome(){
 const illustrated=window.GameArt?.background(ctx,'home',335);
 if(!illustrated){rect(0,0,960,280,'#ffe7c2');for(let i=0;i<24;i++)rect(i*40,0,18,280,'#ffdba8');
 // Window with curtains, bookshelf, notebook and mug.
 box(66,65,167,146,WHITE);grad(75,74,149,127,'#45b8ff','#c9f1ff');cloud(92,120,.5);rect(145,74,8,127,WHITE);rect(75,133,149,8,WHITE);box(56,208,188,8,'#b8743a');rect(46,56,24,160,'#ff7ab8');rect(230,56,24,160,'#ff7ab8');rect(46,56,208,8,'#e85d9a');
 box(690,110,178,150,'#9a5b2c');for(let i=0;i<2;i++){rect(690,170+i*70,178,7,'#6b3a1e');for(let j=0;j<7;j++)box(704+j*22,132+i*70-(j%2)*9,14,38+(j%2)*9,[RED,BLUE,YELLOW,'#3cc464','#a259ff'][(j+i*2)%5],2)}
 rect(0,276,960,4,OUT);grad(0,280,960,320,'#e9a560','#c97a37');for(let i=0;i<7;i++)rect(0,310+i*48,960,3,'#a85f2688');
 ell(480,332,268,80,OUT);ell(480,332,262,74,'#7c5cff');ell(480,332,220,58,'#9d84ff');
 box(95,342,76,60,WHITE);for(const[w,yy]of[[60,352],[60,366],[39,380]])rect(102,yy,w,3,'#7fb3ff');rect(95,342,6,60,RED);
 box(781,305,31,42,RED);rect(785,309,8,20,'#ffffff55');ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.strokeRect(812,314,10,18);
}
if(illustrated)GameArt.prop(ctx,'table',480,430,440,220);
const x=480,y=280,size=190;if(G.fold===4&&G.now-G.foldAt>=450&&ttakji(x,y,size*(1-G.fold*.055),'newspaper','inventory'))return;ctx.save();ctx.translate(x,y);const t=Math.min((G.now-G.foldAt)/450,1),foldScale=1-G.fold*.055;ctx.scale(foldScale,foldScale);rect(-95+8,-95+9,190,190,'#1b123040');box(-95,-95,190,190,'#fff6e0');for(let i=0;i<10;i++){rect(-82,-80+i*17,68,3,'#6b728055');rect(9,-80+i*17,70,3,'#6b728055')}const triangles=[[[-95,-95],[95,-95],[0,0]],[[95,95],[-95,95],[0,0]],[[95,-95],[95,95],[0,0]],[[-95,95],[-95,-95],[0,0]]];for(let i=0;i<G.fold;i++){ctx.globalAlpha=i===G.fold-1?Math.min(1,t*2):1;poly(triangles[i],['#ffe9b8','#f5d68f','#ffe1a0','#f0c97a'][i])}ctx.globalAlpha=1;ctx.restore();if(G.state==='folding'){const spots=[[385,185],[575,375],[575,185],[385,375]],p=spots[G.fold];if(p){const pulse=1+Math.sin(G.now/200)*.12;ctx.save();ctx.translate(p[0],p[1]);ctx.scale(pulse,pulse);circle(0,0,26,'#ffe14d55');circle(0,0,19,OUT);circle(0,0,16,YELLOW);text(String(G.fold+1),0,6,17,OUT,'center',900);ctx.restore()}}}
// Ending: the camera rises from the school yard to the sky while the two ttakji meet (spec 04 §12).
function drawEndingSky(){const t=Math.min(1,Math.max(0,(G.now-G.endingAt)/2600)),ease=t*t*(3-2*t),lift=ease*430;
 sky(600,'#1f5fd1','#bfe9ff');for(let i=0;i<6;i++)cloud((i*190+G.now/60)%1100-120,40+i*70-lift*.25,.6+i%3*.2);
 ctx.save();ctx.translate(0,lift);school();actor(400,420,'hero',0,1,1);actor(560,420,'boss',0,1,-1);
 const meet=Math.min(1,Math.max(0,(G.now-G.endingAt-1700)/700));paper(430+meet*40,370-Math.sin(meet*Math.PI)*60,46,'news',-.2,1);paper(530-meet*40,370-Math.sin(meet*Math.PI)*60,46,'accordion_folder',.2,1);
 for(let i=0;i<4;i++)actor(120+i*45,330,'friend',0,.6,1);ctx.restore();
 if(G.state==='credits'){ctx.fillStyle='#1b1230d9';ctx.fillRect(0,0,960,600);stars(80,600)}}
const classroomArt=['backgrounds/classroom','characters/hero/idle','characters/minsu/idle','characters/boss/idle','characters/teacher/idle','props/door'];
function drawClassroom(title=false){
 if(classroomArt.some(GameArt.loading)||!GameArt.background(ctx,'classroom',402))return;
 const teacherPresent=title||(G.state==='dialogue'&&G.dialogIndex<=classroomExitLine);
 const walking=!title&&teacherPresent&&G.dialogIndex===classroomExitLine?G.now-G.dialogStart:0;
 const doorOpen=walking>=classroomExitTime-220&&walking<classroomExitTime;
 if(doorOpen)box(891,235,66,110,'#223231',2);
 if(teacherPresent&&walking<classroomExitTime)GameArt.actor(ctx,666+258*walking/classroomExitTime,343,'teacher',walking,1.24,1);
 if(!doorOpen)GameArt.prop(ctx,'door',924,345,66,115);
 GameArt.actor(ctx,340,410,'hero',0,1.3,1);
 GameArt.actor(ctx,570,410,'minsu',0,1.2,1);
 GameArt.actor(ctx,705,410,'boss',0,1.2,-1);
 panel(388,53,184,46,7,'#f4ead7e8','#a68c6244',1);text('수업 끝',480,83,23,'#304b43','center',700);
}
Object.assign(WorldKit,{villageBackground,drawVillage,TIER_LOOK,stars,tierArena,drawAdvert,drawBattle,drawHome,drawEndingSky,drawClassroom});
})();
