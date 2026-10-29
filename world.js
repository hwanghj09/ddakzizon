'use strict';
(function(){
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');let width=960,height=600,scale=1,ox=0,oy=0,last=0;
// Load the existing RGBA sprites once; scene rendering keeps running while they decode.
const ttakjiSprites=Object.fromEntries(['newspaper','colored_paper','hair'].map(material=>[material,
 Object.fromEntries(['base','flipped','inventory','damaged'].map(state=>{
  const image=new Image();image.src=`assets/sprites/ttakji/${material}/ttakji_${material}_${state}.png`;
  image.onerror=()=>console.warn(`Ttakji sprite unavailable: ${material}/${state}`);
  return [state,image];
 }))
]));
function ttakji(x,y,size,material='newspaper',state='base',angle=0,flipScale=1){
 const image=ttakjiSprites[material]?.[state];
 if(!image?.complete||!image.naturalWidth)return false;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1,Math.max(.001,Math.abs(flipScale)));
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 // The authored artwork occupies 204px of each 256px canvas. Preserve padding and aspect ratio.
 const extent=size*256/204;ctx.drawImage(image,-extent/2,-extent/2,extent,extent);ctx.restore();return true;
}
const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
function text(str,x,y,size=12,color='#fff0d0',align='left',weight=700){ctx.fillStyle=color;ctx.font=`${weight} ${size}px "Malgun Gothic",system-ui,sans-serif`;ctx.textAlign=align;ctx.fillText(str,x,y)}
function line(x1,y1,x2,y2,color='#e2d4a7',w=2){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function resize(){const b=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=b.width;height=b.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(width/960,height/600);ox=(width-960*scale)/2;oy=(height-600*scale)/2;ctx.imageSmoothingEnabled=false}
window.World={screenToWorld(x,y){const b=canvas.getBoundingClientRect();return{x:(x-b.left-ox)/scale,y:(y-b.top-oy)/scale}}};new ResizeObserver(resize).observe(canvas);window.addEventListener('resize',resize);
function cloud(x,y,s=1){rect(x,y,74*s,11*s,'#e2dfba');rect(x+15*s,y-9*s,39*s,10*s,'#e2dfba')}
function tree(x,y,s=1){rect(x+22*s,y+36*s,12*s,59*s,'#6e7560');rect(x-5*s,y+6*s,68*s,53*s,'#567a67');rect(x+3*s,y-11*s,51*s,44*s,'#6b8c6b');rect(x+3*s,y-11*s,20*s,30*s,'#86a078');rect(x+42*s,y+18*s,14*s,38*s,'#416858');rect(x+20*s,y+94*s,35*s,5*s,'#8c967071')}
function school(){rect(0,0,960,600,'#bbaa7c');rect(0,0,960,255,'#9fbbb2');rect(0,225,960,42,'#6e927b');cloud(98+Math.sin(G.now/20000)*15,69);cloud(668+Math.sin(G.now/24000)*12,93,.7);cloud(355,32,.45);for(let i=0;i<12;i++)rect(i*86-20,210-(i%3)*16,90,57,['#6e927b','#7b9b7e','#628975'][i%3]);rect(175,111,620,151,'#cec8a3');rect(165,99,640,13,'#ede2b8');rect(181,117,608,8,'#b1ad90');for(let row=0;row<2;row++)for(let col=0;col<10;col++){const x=196+col*58,y=138+row*54;rect(x+3,y+4,39,32,'#a7ac95');rect(x,y,36,29,'#58777b');rect(x+3,y+3,12,23,'#83a19d');rect(x+17,y,2,29,'#d0ccb0');rect(x-2,y+30,40,4,'#b2b394')}rect(445,202,72,63,'#7e8d7c');rect(451,210,28,55,'#42646a');rect(484,210,27,55,'#42646a');rect(443,260,78,7,'#b4b09a');rect(429,265,106,5,'#b4b09a');rect(409,88,145,29,'#526e65');text('지 존 초 등 학 교',481,107,11,'#e5e1ba','center');for(let x=22;x<950;x+=25){rect(x,244,3,35,'#9ba78b');rect(x,250,22,2,'#aab599');rect(x,266,22,2,'#aab599')}rect(0,280,960,7,'#8f9979');rect(0,287,960,313,'#c6b283');rect(0,287,960,12,'#b29e73');rect(0,520,960,80,'#b3a17d');tree(46,179,1.1);tree(842,166,1.3);tree(910,193,.8);
// Chalk court and quiet playground details.
line(100,320,852,320,'#e5d7ac',2);line(100,320,20,510,'#e5d7ac',2);line(852,320,940,510,'#e5d7ac',2);line(20,510,940,510,'#e5d7ac',2);line(476,320,476,510,'#e5d7ac',2);ctx.strokeStyle='#e5d7ac';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(477,413,92,44,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<65;i++){const x=(i*173+29)%960,y=299+(i*47)%210;rect(x,y,2+(i%3),1,'#a9936966')}
rect(47,273,100,7,'#71836b');rect(54,280,6,18,'#61725e');rect(130,280,6,18,'#61725e');rect(47,259,100,9,'#829174');rect(833,287,22,25,'#536f64');rect(831,283,26,5,'#8ba083');
// Goal and a pennant, all intentionally made from simple rectangles.
rect(695,233,76,4,'#e7ddbd');rect(695,233,4,50,'#e7ddbd');rect(767,233,4,50,'#e7ddbd');for(let i=0;i<7;i++)rect(701+i*10,238,1,44,'#d2d2ac88');for(let i=0;i<4;i++)rect(699,244+i*10,70,1,'#d2d2ac88');rect(813,116,3,144,'#9cae9d');rect(816,118,37+Math.sin(G.now/400)*3,22,'#e6dabe');rect(827,125,12,8,'#ba6c51');
}
function actor(x,y,kind='hero',walk=0,scaleActor=1,facing=1){kind=({wall:'folder',offbeat:'sprinter',champion:'boss',charger:'sprinter',fortress:'folder',national_champion:'boss'})[kind]||kind;ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scaleActor,scaleActor);const bob=walk?Math.sin(walk/90)*2:Math.sin(G.now/700+x)*.7,step=walk?Math.sin(walk/90)*6:0;rect(-16,0,37,6,'#68725a44');ctx.translate(0,-bob);const skin=kind==='boss'?'#d9b082':'#edc598',shirt=kind==='hero'?'#688f99':kind==='rival'?'#c77457':kind==='boss'?'#8a9162':kind==='uncle'?'#a78b60':kind==='neighbor'?'#6c899e':kind==='sprinter'?'#b87969':kind==='folder'?'#7b93a1':'#baab7b';rect(-12,-22,9,22+step,'#384c52');rect(4,-22,9,22-step,'#384c52');rect(-14,-3+step,14,5,'#eee1ba');rect(3,-3-step,14,5,'#eee1ba');rect(-19,-53,37,35,shirt);rect(9,-53,9,35,kind==='hero'?'#456d7a':kind==='rival'?'#a0523d':'#67784d');rect(-23,-49,6,26,shirt);rect(18,-49,6,26,shirt);rect(-23,-25,6,7,skin);rect(18,-25,6,7,skin);rect(-14,-78,29,27,skin);rect(-15,-85,30,11,'#303e3e');rect(-15,-78,6,10,'#303e3e');rect(10,-78,6,9,'#303e3e');rect(facing>0?6:-9,-67,3,3,'#344344');rect(-2,-53,8,5,'#dfbb8f');if(kind==='uncle'){rect(-14,-85,28,14,skin);rect(-15,-78,4,10,'#303e3e');rect(12,-78,4,10,'#303e3e')}if(kind==='hero'){rect(-16,-48,4,30,'#e4d8b9');rect(12,-48,3,30,'#dfd3ae');rect(-8,-40,15,3,'#b3cdba')}if(kind==='boss'){rect(-14,-72,28,7,'#354944');rect(-1,-72,2,7,'#d9b082')}ctx.restore()}
function npcGroup(){const bob=G.state==='title'?G.now:0;actor(722,349,'friend',0,.75,-1);if(G.mode!=='epilogue')actor(800,346,'boss',0,1.06,-1);actor(662,370,'rival',bob?Math.sin(bob/800)*10:0,.94,-1);paper(720,390,17,'red',.2,1);paper(692,385,15,'news',-.3,1)}
function drawExplore(){school();npcGroup();actor(G.hero.x,G.hero.y,'hero',G.hero.walk,1,G.hero.facing);if(G.state==='explore')speech(665,260)}
function speech(x,y){if(!G.coach||G.now>G.coachUntil)return;const size=12;ctx.font=`600 ${size}px \"Malgun Gothic\",system-ui,sans-serif`;const w=ctx.measureText(G.coach).width+30;rect(x-w/2,y-30,w,37,'#172c30f5');rect(x-5,y+7,10,8,'#172c30f5');text(G.coach,x,y-6,size,'#f7e6be','center',600)}
function paper(x,y,size,type='news',angle=.12,sy=.8,folds=4,spriteState='base',flipScale=1){if(ttakji(x,y,size,type==='red'?'colored_paper':type==='news'?'newspaper':type,spriteState,angle,flipScale))return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1,sy);const half=size/2;rect(-half+4,-half+5,size,size,type==='red'?'#85543f':'#8c8871');rect(-half,-half,size,size,type==='red'?'#d47a57':'#e2d1a8');rect(-half+3,-half+3,size-6,size-6,type==='red'?'#e28e65':'#e9dbb6');if(type==='news'){for(let i=0;i<6;i++){rect(-half+10,-half+12+i*(size-20)/6,size*.28,2,'#8f8d7866');rect(half*.1,-half+12+i*(size-20)/6,size*.3,2,'#8f8d7866')}}ctx.lineWidth=2;ctx.strokeStyle=type==='red'?'#a45d43':'#a39775';ctx.strokeRect(-half,-half,size,size);if(folds>=1)line(-half,-half,half,half,ctx.strokeStyle,2);if(folds>=2)line(half,-half,-half,half,ctx.strokeStyle,2);if(folds>=3){ctx.fillStyle=type==='red'?'#b9664b44':'#a99c7844';ctx.beginPath();ctx.moveTo(-half,-half);ctx.lineTo(0,0);ctx.lineTo(-half,half);ctx.fill()}rect(-half+2,-half+2,size-4,2,'#fff3cf77');ctx.restore()}
function villageBackground(){
 rect(0,0,960,600,'#acc3b1');cloud(75,70);cloud(680,58,.8);rect(0,205,960,105,'#7d9c7a');
 for(let i=0;i<11;i++)rect(i*95,195-(i%3)*15,100,110,['#829e79','#718e70','#94ab80'][i%3]);
 rect(0,310,960,290,'#c6b087');rect(0,318,960,10,'#dfc99f');rect(0,450,960,150,'#ad9c7a');
 const colors=['#d3c39a','#9aaf9b','#8caaa5','#b79878'];
 Village.places.forEach((place,i)=>{const x=place.x-80;rect(x,156,160,159,colors[i]);rect(x-8,145,176,18,['#7e7764','#587c69','#4a7273','#a6654e'][i]);rect(x+8,175,144,30,'#284342');text(place.name,place.x,195,15,'#f4dfad','center');rect(x+57,236,46,79,'#455e56');rect(x+63,242,34,73,'#344b49');rect(x+86,277,4,4,'#efcd82');rect(x+13,224,33,35,'#a8c9b6');rect(x+118,224,28,35,'#a8c9b6');rect(x+47,315,66,8,'#dcd0a5');
 if(i===2){rect(x+15,264,30,49,'#4d6669');rect(x+18,269,24,6,'#a9b6a5');rect(x+24,277,12,21,'#d6bd85')}
 if(i===3){for(let j=0;j<6;j++){rect(x-6+j*30,112+(j%2)*7,20,18,j%2?'#e4c77f':'#c87f62')}rect(x-10,107,180,3,'#5e7669')}
 });
 for(let i=0;i<26;i++)rect((i*149)%960,340+(i*37)%100,3,2,'#a38d6855');
 tree(16,226,.65);tree(905,225,.65);rect(32,474,896,3,'#d9c79e');
}
function drawVillage(){villageBackground();actor(280,365,'neighbor',0,.95,-1);actor(835,393,'uncle',0,1.05,-1);actor(G.hero.x,G.hero.y,'hero',G.hero.walk,1,G.hero.facing);if(G.state==='explore'){const place=Village.nearest();speech(place?place.x:480,130)}}
function citySkyline(province=false,national=false){
 rect(0,0,960,600,'#95b4bd');cloud(75,54,.7);cloud(690,38,1.1);
 for(let i=0;i<10;i++){const x=i*108-20,h=95+(i*31)%105,y=250-h;rect(x,y,87,h,['#8b9fa1','#7e969c','#a4b1aa'][i%3]);rect(x,y-5,87,5,'#bcc8bb');for(let r=0;r<Math.floor(h/26)-1;r++)for(let c=0;c<3;c++)rect(x+12+c*23,y+13+r*26,12,13,'#c2d1bf')}
 if(province){rect(0,80,960,175,'#9daea1');for(let i=0;i<9;i++){const x=i*120-30;rect(x,150-(i%3)*25,135,105+(i%3)*25,'#78928a');rect(x+20,130-(i%3)*25,90,30,'#78928a')}rect(330,78,300,158,'#c3c6b0');rect(318,66,324,18,national?'#ad8e50':'#6a7f77');rect(360,92,240,30,'#506f70');text(national?'전국 딱지 경기장':'도 체육회관',480,114,19,'#e9dfbb','center')}
 rect(0,255,960,345,'#b8b4a2');rect(0,310,960,15,'#dbd4b6');rect(0,450,960,150,'#87988e');
 for(let i=0;i<14;i++)rect(i*80,477,42,4,'#d8d0ad');
}
function cityHub(province=false,national=false){
 citySkyline(province,national);
 (national?National:province?Province:City).places.forEach((place,i)=>{const x=place.x-80;
  if(i===0){rect(x,181,160,34,'#294e5a');text(place.name,place.x,204,14,'#f2dfac','center');rect(x+15,215,5,108,'#567470');rect(x+139,215,5,108,'#567470');rect(x+27,280,100,9,'#6b8374');rect(x+31,289,6,28,'#4e6f65');rect(x+115,289,6,28,'#4e6f65');rect(x+52,234,50,30,'#d8ceac');text('무료',place.x,255,13,'#2c4c50','center')}
  else{rect(x,146,160,169,['#c1b89b','#9daea2','#a5aaa1','#b9ae92'][i]);rect(x-8,132,176,17,i===3?'#a96652':'#547b80');rect(x+8,162,144,30,'#264850');text(place.name,place.x,183,14,'#f1e0b7','center');rect(x+56,235,48,80,'#3f6062');rect(x+63,243,34,72,'#315056');rect(x+88,282,4,5,'#e7cd8a');for(const offset of [14,118]){rect(x+offset,210,28,37,'#c9d1b9');rect(x+offset+3,213,22,31,'#70989b')}
   if(i===3){rect(x+16,98,128,28,'#c2a35b');text(national?'전국 대회':province?'도 대회':'시 대회',place.x,118,15,'#263e43','center');for(let j=0;j<5;j++)rect(x+5+j*33,72+(j%2)*4,22,15,j%2?'#dfca88':'#b87d62')}
  }
 });
 tree(10,218,.65);tree(909,216,.65);line(22,325,936,325,'#e5d9b8',2);
}
function drawCity(){cityHub();actor(285,371,'neighbor',0,.96,1);actor(852,380,G.profile.cityRound===3?'boss':'folder',0,1,-1);actor(G.hero.x,G.hero.y,'hero',G.hero.walk,1,G.hero.facing);if(G.state==='explore'){const place=City.nearest();speech(place?place.x:480,115)}}
function drawProvince(){cityHub(true);actor(285,371,'boss',0,.96,1);actor(852,380,'champion',0,1,-1);actor(G.hero.x,G.hero.y,'hero',G.hero.walk,1,G.hero.facing);if(G.state==='explore'){const place=Province.nearest();speech(place?place.x:480,115)}}
function drawNational(){cityHub(true,true);actor(285,371,'neighbor',0,.96,1);actor(852,380,'national_champion',0,1,-1);actor(G.hero.x,G.hero.y,'hero',G.hero.walk,1,G.hero.facing);if(G.state==='explore'){const place=National.nearest();speech(place?place.x:480,115)}}
function cityArena(province=false,national=false){
 citySkyline(province,national);rect(30,95,900,175,'#527a80');rect(45,112,870,143,'#93aba4');
 rect(315,76,330,48,national?'#78633f':'#294a53');text(national?'전 국  딱 지  대 회':province?'도 대 표  선 발 전':'지 존 시  딱 지 대회',480,106,23,'#f1db9d','center');
 for(let row=0;row<2;row++){rect(55,160+row*57,850,7,'#5c7d76');for(let i=0;i<17;i++){const x=70+i*50,y=147+row*57;rect(x,y,17,18,['#e6c392','#d0b48b','#dcb894'][i%3]);rect(x-3,y+18,23,22,['#7e8f6d','#ae7962','#698b9c'][i%3]);rect(x,y-4,17,6,'#3d4d4b')}}
 rect(0,270,960,180,'#bdb49a');rect(0,275,960,5,'#e4d1a2');for(let i=0;i<14;i++)rect(i*75,285,42,2,'#9b9c86');
}
function drawAdvert(){school();rect(340,105,280,315,'#5f796b');rect(352,117,256,289,'#eddbab');text('제1회',480,161,17,'#536d5c','center');text('우리 마을',480,212,32,'#284342','center');text('딱지 대회',480,258,36,'#a45d43','center');paper(480,316,65,'red',0,1);text('우승 상금 120원',480,377,18,'#284342','center')}
function drawBattle(){if(['practice','training','story_training'].includes(G.mode)){rect(0,0,960,600,'#93a695');rect(0,0,960,270,'#9cb9b0');rect(35,95,266,184,'#c4c6a3');rect(20,88,296,16,'#748678');rect(58,132,90,80,'#526f70');rect(63,137,80,70,'#94b3a6');rect(100,134,5,75,'#d4d4af');rect(197,151,65,127,'#7d9381');tree(822,160,1.4);rect(0,275,960,325,'#bfa67d');for(let i=0;i<14;i++)rect(i*75,276,4,40,'#9e9b7d');rect(0,288,960,4,'#dcceaa');rect(0,309,960,4,'#dcceaa')}else{if(Village.isBattle()){MapRenderer.arena(ctx,{rect,text,line,actor},G.hub)}else school();ctx.fillStyle='#28413b1c';ctx.fillRect(0,0,960,600)}
rect(150,286,660,151,'#a8946a');rect(157,291,646,142,'#c7b181');line(160,432,803,432,'#e9dab0',3);actor(125,347,'hero',0,1.1,1);if(!['practice','training','story_training'].includes(G.mode)){actor(837,347,Village.isBattle()?G.opponent.kind:'rival',0,1.1,-1);if(!Village.isBattle())actor(891,313,'boss',0,.85,-1)}let px=310,py=350,ex=650,ey=350,pa=-.16,ea=.15,ps=1,es=1;
if(G.animation){const t=(G.now-G.animation.at)/1000;const grade=G.animation.grade;const power=grade==='PERFECT'?1:grade==='GOOD'?.65:.3;if(G.animation.kind==='player-hit'){if(t<.36){const q=t/.36;px=310+Math.pow(q,2)*320;py=350-Math.sin(q*Math.PI)*95;pa=-.16-q*.7;ps=1+Math.sin(q*Math.PI)*.25}else if(t<.7){const q=(t-.36)/.34;px=630-(630-310)*q;py=350-55*Math.sin(q*Math.PI);ey-=Math.sin(q*Math.PI)*55*power;ea+=Math.sin(q*Math.PI*2)*.35*power}}else if(G.animation.kind==='enemy-ready'){ey-=Math.sin(Math.min(t/.75,1)*Math.PI/2)*35;ea-=.2*Math.min(t/.75,1)}else if(G.animation.kind==='enemy-hit'){if(t<.36){const q=t/.36;ex=650-Math.pow(q,2)*320;ey=315-Math.sin(q*Math.PI)*105;ea=.15+q*.8;es=1+Math.sin(q*Math.PI)*.35}else if(t<.7){const q=(t-.36)/.34;ex=330+320*q;ey=350-Math.sin(q*Math.PI)*50;py-=Math.sin(q*Math.PI)*25}}}
let psy=.76,esy=.76;if(G.flipPlayer){const t=Math.min((G.now-G.flipPlayer)/800,1);psy=Math.cos(t*Math.PI)*.76;py-=Math.sin(t*Math.PI)*95;pa+=t*.18}if(G.flipEnemy){const t=Math.min((G.now-G.flipEnemy)/800,1);esy=Math.cos(t*Math.PI)*.76;ey-=Math.sin(t*Math.PI)*95;ea-=t*.2}if(G.stolen){const t=Math.min((G.now-G.stolenAt)/900,1);px+=t*560;py-=t*90;ctx.globalAlpha=1-t}const playerSprite=G.flipPlayer&&psy<0?'flipped':G.hp<G.maxHp?'damaged':'base';paper(px,py,106*ps,Village.isBattle()?G.profile.equipped:'news',pa,1,4,playerSprite,Math.abs(psy)/.76);ctx.globalAlpha=1;const enemySprite=G.flipEnemy&&esy<0?'flipped':G.enemyHp<G.enemyMax?'damaged':'base';paper(ex,ey,106*es,Village.isBattle()?G.opponent.material:'red',ea,1,4,enemySprite,Math.abs(esy)/.76);if(G.mode!=='practice')speech(760,245);
}
function drawHomeWorkbench(){
 const pressing=G.state==='home-pressing',t=pressing?Math.min(1,(G.now-G.homePressAt)/1200):0;
 const press=pressing?Math.sin(t*Math.PI):0;
 rect(135,357,355,19,'#776d57');rect(151,376,19,90,'#6c6e59');rect(455,376,19,90,'#6c6e59');
 rect(187,196,18,157,'#4f7171');rect(407,196,18,157,'#4f7171');rect(184,188,245,24,'#54787a');
 rect(196,345,220,12,'#a4b1a0');
 ttakji(307,302,153,'newspaper','base',0,1-press*.16);
 rect(297,208,20,36+press*58,'#b5beaa');rect(213,240+press*58,185,17,'#78938b');rect(213,240+press*58,185,4,'#c7ceae');
 rect(288,178,38,10,'#b38a5e');rect(295,164,24,15,'#b38a5e');
 actor(102,433,'hero',0,1,1);actor(508,427,'neighbor',0,1.1,-1);
}
function drawHome(){rect(0,0,960,600,'#738982');rect(0,0,960,290,'#8b9c8f');rect(66,65,167,146,'#d6cba9');rect(75,74,149,127,'#a7c7b7');rect(145,74,8,127,'#d6cba9');rect(75,133,149,8,'#d6cba9');rect(60,208,180,8,'#bdb896');rect(690,110,178,150,'#668177');for(let i=0;i<2;i++){rect(687,170+i*70,184,7,'#c0baa0');for(let j=0;j<7;j++)rect(702+j*21,132+i*70-(j%2)*9,14,38+(j%2)*9,['#b5c2a1','#bd966e','#dfc99e'][j%3])}rect(0,277,960,323,'#b89c72');rect(0,277,960,10,'#dfc49a');for(let i=0;i<7;i++)rect(0,310+i*48,960,2,'#aa8b6544');rect(95,342,76,60,'#e2d6b3');rect(102,351,60,4,'#a7a68c');rect(102,365,60,3,'#a7a68c');rect(102,378,39,3,'#a7a68c');rect(781,305,31,42,'#c4c7a4');rect(785,302,23,7,'#6c8073');rect(812,312,11,22,'#b8bb9b');
if(G.mode==='home_upgrade'){drawHomeWorkbench();return}
const x=480,y=280,size=190;if(G.fold===4&&G.now-G.foldAt>=450&&ttakji(x,y,size*(1-G.fold*.055),'newspaper','inventory'))return;ctx.save();ctx.translate(x,y);const t=Math.min((G.now-G.foldAt)/450,1),foldScale=1-G.fold*.055;ctx.scale(foldScale,foldScale);rect(-95+7,-95+8,190,190,'#6d725544');rect(-95,-95,190,190,'#e6d7b5');for(let i=0;i<10;i++){rect(-82,-80+i*17,68,3,'#918e7566');rect(9,-80+i*17,70,3,'#918e7566')}const triangles=[[[-95,-95],[95,-95],[0,0]],[[95,95],[-95,95],[0,0]],[[95,-95],[95,95],[0,0]],[[-95,95],[-95,-95],[0,0]]];for(let i=0;i<G.fold;i++){ctx.globalAlpha=i===G.fold-1?Math.min(1,t*2):1;ctx.fillStyle=['#e7dbbb','#c9bd99','#e0d1ac','#d5c6a1'][i];ctx.strokeStyle='#9b9275';ctx.lineWidth=2;ctx.beginPath();triangles[i].forEach((p,j)=>j?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.stroke()}ctx.globalAlpha=1;ctx.restore();if(G.state==='folding'){const spots=[[385,185],[575,375],[575,185],[385,375]],p=spots[G.fold];if(p){const pulse=1+Math.sin(G.now/200)*.09;ctx.save();ctx.translate(p[0],p[1]);ctx.scale(pulse,pulse);rect(-15,-15,30,30,'#f2c879');text(String(G.fold+1),0,5,15,'#24413c','center');ctx.restore()}}}
function drawTitle(){school();npcGroup();actor(520,416,'hero',Math.sin(G.now/900)>0?30:0,1.5,1);paper(710,470,155,'news',-.22,.8);paper(818,420,103,'red',.18,.8);ctx.fillStyle='#14303c22';ctx.fillRect(0,0,960,600)}
function frame(now){const dt=Math.min(now-last||16,50);last=now;if(!G.paused)update(dt);const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);rect(0,0,width,height,G.scene==='home'?'#586f68':'#2c4846');ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);if(!reducedMotion&&G.shake>0.1)ctx.translate((Math.random()-.5)*G.shake,(Math.random()-.5)*G.shake);if(G.state==='title')drawTitle();else if(G.scene==='battle')drawBattle();else if(Exploration.active())MapRenderer.draw(ctx,{rect,text,line,tree,actor,paper});else if(G.scene==='home')drawHome();else if(G.scene==='village')drawVillage();else if(G.scene==='city')drawCity();else if(G.scene==='province')drawProvince();else if(G.scene==='national')drawNational();else if(G.scene==='advert')drawAdvert();else drawExplore();for(const p of G.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);rect(p.x,p.y,p.size,p.size,p.color)}ctx.globalAlpha=1;for(const p of G.floaters){const t=(G.now-p.at)/950;ctx.globalAlpha=1-t;text(p.text,p.x,p.y-t*60,27,'#fff3d2','center',900)}ctx.globalAlpha=1;if(G.flash>.005){ctx.fillStyle=`rgba(255,238,185,${G.flash})`;ctx.fillRect(0,0,960,600)}ctx.restore();requestAnimationFrame(frame)}
resize();requestAnimationFrame(frame);
})();
