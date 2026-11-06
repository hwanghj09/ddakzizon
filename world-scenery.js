'use strict';
/* Scenery pieces, the school, characters and paper ttakji. */
(()=>{const {canvas,ctx,ttakjiSprites,ttakji,OUT,NAVY,YELLOW,RED,BLUE,WHITE,rect,box,text,line,circle,ell,rr,panel,poly,grad}=WorldKit;

// --- Scenery pieces ---
function sky(h,top='#45b8ff',bottom='#c9f1ff'){grad(0,0,960,h,top,bottom)}
function sun(x,y,core=YELLOW){const p=Math.sin(G.now/900)*3;circle(x,y,48+p,'#fff3b055');circle(x,y,34,OUT);circle(x,y,31,core);circle(x-9,y-9,9,'#fff8c9')}
function cloud(x,y,s=1){for(const[bx,by,r]of[[0,0,16],[20,-10,20],[42,-2,16],[60,4,12]])circle(x+bx*s,y+by*s,r*s,WHITE);rect(x-4*s,y+2*s,72*s,13*s,WHITE);rect(x-4*s,y+12*s,72*s,4*s,'#d3eeff')}
function hills(y,a='#6fd36b',b='#55c35a'){for(let i=0;i<10;i++)circle(i*112-20,y+(i*37)%26,64+(i%3)*14,i%2?a:b)}
function tree(x,y,s=1){const cx=x+28*s,cy=y+22*s;ell(cx,y+95*s,32*s,7*s,'#00000026');box(x+21*s,y+36*s,14*s,59*s,'#9a5b2c',3);
 const blobs=[[0,0,34],[-22,14,24],[22,14,24],[0,-20,24]];for(const[bx,by,r]of blobs)circle(cx+bx*s,cy+by*s,r*s+3,OUT);for(const[bx,by,r]of blobs)circle(cx+bx*s,cy+by*s,r*s,'#3fbf4f');circle(cx+14*s,cy+18*s,12*s,'#2e9e44');circle(cx-9*s,cy-16*s,11*s,'#86e57f')}
function grassEdge(y){rect(0,y-3,960,3,OUT);rect(0,y,960,14,'#4cc95a');rect(0,y+10,960,4,'#2f9e44');for(let i=0;i<48;i++)rect(i*20+(i%3)*4,y-2,4,6,'#4cc95a')}

function school(){
 if(window.GameArt?.background(ctx,window.Minimum?.active?'gazebo':'yard',290))return;
 sky(290);sun(866,70);cloud(98+Math.sin(G.now/20000)*15,69);cloud(640+Math.sin(G.now/24000)*12,98,.75);cloud(345,40,.5);hills(250);
 // School building with a red roof and bright glass.
 box(175,114,620,150,'#fff1d0');rect(175,240,620,24,'#f4d6a2');poly([[158,116],[812,116],[790,90],[180,90]],RED);rect(190,95,590,4,'#ff8f85');
 for(let row=0;row<2;row++)for(let col=0;col<10;col++){const x=196+col*58,y=136+row*52;box(x,y,36,29,'#7fd3ff');rect(x,y+18,36,11,'#5ab8f0');rect(x+4,y+3,6,12,'#e9faff');rect(x+17,y,2,29,OUT);rect(x-3,y+30,42,4,'#e9b97a')}
 box(445,204,72,60,'#9a5b2c');rect(451,210,25,54,'#b8743a');rect(486,210,25,54,'#b8743a');rect(479,204,4,60,OUT);circle(472,238,3,YELLOW);circle(490,238,3,YELLOW);
 panel(396,58,170,36,8,NAVY);text('지존초등학교',481,83,16,YELLOW,'center',900);
 // Flagpole with a waving pennant.
 box(812,116,4,150,'#e5e7eb',2);const wave=Math.sin(G.now/300)*5;poly([[816,120],[858+wave,128],[816,142]],RED,OUT,2);
 // Fence, then the dirt yard.
 rect(0,248,960,7,OUT);rect(0,249,960,5,WHITE);rect(0,264,960,7,OUT);rect(0,265,960,5,WHITE);for(let x=22;x<950;x+=25){rect(x-2,240,7,42,OUT);rect(x,242,3,38,WHITE)}
 tree(46,179,1.1);tree(842,166,1.3);tree(910,193,.8);
 grassEdge(279);grad(0,293,960,307,'#ffc07a','#ec9a4f');
 // Chalk court.
 ctx.globalAlpha=.85;line(100,320,852,320,WHITE,3);line(100,320,20,510,WHITE,3);line(852,320,940,510,WHITE,3);line(20,510,940,510,WHITE,3);line(476,320,476,510,WHITE,3);ctx.strokeStyle=WHITE;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(477,413,92,44,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
 for(let i=0;i<65;i++){const x=(i*173+29)%960,y=299+(i*47)%210;rect(x,y,3+(i%3),2,'#d9803a88')}
 // Bench, bin and goal.
 box(47,262,100,8,'#ff9f1c');box(54,272,6,14,'#9a5b2c',2);box(134,272,6,14,'#9a5b2c',2);box(47,250,100,6,'#ff9f1c',2);
 box(833,286,22,26,BLUE);rect(831,282,26,5,OUT);
 for(const[x,y,w,h]of[[695,233,76,5],[695,233,5,52],[766,233,5,52]])box(x,y,w,h,WHITE,2);for(let i=0;i<7;i++)rect(702+i*10,238,1,45,'#ffffff99');for(let i=0;i<4;i++)rect(700,246+i*10,66,1,'#ffffff99');
}

// Clear colour identities with controlled highlights, rather than greyed fills.
const CHARACTER={outline:'#2b3440',light:'#eee6d4',accent:'#d2b862',shadow:'#1c314510',skinShadow:'#9b603814',blush:'#c57c6a30'};
const LOOKS={
 hero:{skin:'#e1b695',hair:'#514135',shirt:'#c96b5f',trim:'#e1dac8',pants:'#3d68a8',shoe:'#e1dac8',cap:'#3d68a8'},
 rival:{skin:'#e4b993',hair:'#be874c',shirt:'#499563',trim:'#347347',pants:'#4b535f',shoe:'#b6804c',spiky:true},
 boss:{skin:'#d2a17c',hair:'#30343c',shirt:'#8a64ac',trim:'#c7a953',pants:'#424355',shoe:'#3d424b',shades:true,band:'#bc6769'},
 champ:{skin:'#d2a17c',hair:'#30343c',shirt:'#c3a04a',trim:'#bc6769',pants:'#424355',shoe:'#e1dac8',shades:true,band:'#bc6769'},
 friend:{skin:'#e7c19f',hair:'#704a34',shirt:'#c9b356',trim:'#c78d9d',pants:'#c78d9d',shoe:'#e1dac8',tails:true},
 neighbor:{skin:'#d9ac85',hair:'#554536',shirt:'#4f8eae',trim:'#e1dac8',pants:'#665b4c',shoe:'#514436',glasses:true},
 uncle:{skin:'#d9ac85',hair:'#554536',shirt:'#bd9057',trim:'#956b43',pants:'#566878',shoe:'#514436',bald:true,mustache:true},
 sprinter:{skin:'#dfb18c',hair:'#30343c',shirt:'#c46672',trim:'#e1dac8',pants:'#c46672',shoe:'#c7ad5b',band:'#e1dac8'},
 folder:{skin:'#e1b695',hair:'#51415f',shirt:'#45958a',trim:'#36766d',pants:'#475b71',shoe:'#ddd8ca',beanie:'#8a73b3'},
 globe:{skin:'#d2a17c',hair:'#d5d4ce',shirt:'#4f8eae',trim:'#c7a953',pants:'#425b81',shoe:'#e1dac8',shades:true,band:'#c7a953'},
 alien:{skin:'#9cbe79',hair:'#567d4c',shirt:'#8a73b3',trim:'#c7a953',pants:'#48465e',shoe:'#ddd8ca',bald:true,antenna:true},
 alien_champ:{skin:'#9cbe79',hair:'#567d4c',shirt:'#c3a04a',trim:'#bc6769',pants:'#48465e',shoe:'#e1dac8',bald:true,antenna:true,shades:true}
};
function actor(x,y,kind='hero',walk=0,scaleActor=1,facing=1,role){
 if(kind==='situational'&&G.hub==='planet')kind='alien_champ';
 kind=({examinee:'folder',doyun:'boss',wall:'folder',offbeat:'sprinter',champion:'boss',charger:'sprinter',fortress:'folder',national_champion:'champ',gust:'sprinter',glacier:'folder',continent_champion:'champ',showman:'rival',architect:'folder',world_champion:'globe',martian:'alien',lunar:'alien',planet_champion:'alien_champ',boxer:'neighbor',compressed:'folder',timing:'sprinter',mender:'friend',official:'folder',regulator:'champ',endurance:'friend',striker:'sprinter',reverse:'champ',glass:'friend',federation:'folder',situational:'globe',triangle:'alien',sparkle:'alien'})[kind]||kind;const L=LOOKS[kind]||LOOKS.friend,f=facing>0?1:-1;
 if(window.GameArt?.actor(ctx,x,y,kind,walk,scaleActor,facing,G.animation,G.now,role))return;
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scaleActor,scaleActor);
 const bob=walk?Math.abs(Math.sin(walk/90))*3:Math.sin(G.now/500+x)*1.2,step=walk?Math.sin(walk/90)*6:0,liftL=Math.max(0,step)*.7,liftR=Math.max(0,-step)*.7,swing=step*.6;
 ell(0,1,22,6,'#25392b33');ctx.translate(0,-bob);
 const parts=[[-10,-20,8,18-liftL,L.skin],[2,-20,8,18-liftR,L.skin],[-12,-5-liftL,12,6,L.shoe],[0,-5-liftR,12,6,L.shoe],[-14,-24,28,9,L.pants],[-14,-46,28,26,L.shirt],[-21,-44+swing,7,18,L.shirt],[14,-44-swing,7,18,L.shirt],[-21,-28+swing,7,6,L.skin],[14,-28-swing,7,6,L.skin],[-20,-84,40,38,L.skin]];
 if(L.cap)parts.push([-21,-90,42,14,L.cap],[f>0?12:-32,-80,20,5,L.cap]);
 else if(L.beanie)parts.push([-21,-92,42,16,L.beanie],[-4,-99,8,7,CHARACTER.light]);
 else if(L.bald)parts.push([-21,-76,5,12,L.hair],[16,-76,5,12,L.hair]);
 else{parts.push([-21,-90,42,14,L.hair],[f>0?-21:15,-80,6,16,L.hair]);if(L.spiky)parts.push([-18,-97,8,9,L.hair],[-5,-100,9,11,L.hair],[8,-97,8,9,L.hair]);if(L.tails)parts.push([-29,-78,9,18,L.hair],[20,-78,9,18,L.hair])}
 for(const[px,py,w,h]of parts)rect(px-3,py-3,w+6,h+6,CHARACTER.outline);for(const[px,py,w,h,c]of parts)rect(px,py,w,h,c);
 // Small material shadows add volume without brightening the face or clothes.
 rect(14,-77,6,30,CHARACTER.skinShadow);rect(8,-42,6,18,CHARACTER.shadow);
 // Shirt trim, chest badge and face.
 rect(-14,-36,28,4,L.trim);rect(-5,-46,10,4,L.trim);if(kind==='hero')rect(3,-44,6,6,CHARACTER.accent);
 if(L.band)rect(-20,-80,40,5,L.band);if(L.antenna){rect(-2,-102,5,18,CHARACTER.outline);circle(0,-104,6,CHARACTER.outline);circle(0,-104,4,CHARACTER.accent)}
 const ex=f*4,blink=(G.now+x*37)%3400<130;
 if(L.shades){rect(-15+ex,-70,30,8,CHARACTER.outline);rect(-11+ex,-68,6,2,'#dbdce37a')}
 else if(blink){rect(-10+ex,-64,5,2,CHARACTER.outline);rect(5+ex,-64,5,2,CHARACTER.outline)}
 else{rect(-10+ex,-70,5,8,CHARACTER.outline);rect(5+ex,-70,5,8,CHARACTER.outline);rect(-9+ex,-69,2,2,CHARACTER.light);rect(6+ex,-69,2,2,CHARACTER.light)}
 if(L.glasses){ctx.strokeStyle=CHARACTER.outline;ctx.lineWidth=2;ctx.strokeRect(-13+ex,-72,11,11);ctx.strokeRect(2+ex,-72,11,11);rect(-2+ex,-67,4,2,CHARACTER.outline)}
 rect(-15+ex,-60,6,3,CHARACTER.blush);rect(10+ex,-60,6,3,CHARACTER.blush);
 if(L.mustache)rect(-7+ex,-58,15,4,L.hair);rect(-2+ex*1.3,-54,6,2,'#76584c');
 ctx.restore()
}
function npcGroup(){const bob=G.state==='title'?G.now:0;actor(722,349,'friend',0,.75,-1);if(G.mode!=='epilogue')actor(800,346,'boss',0,1.06,-1);actor(662,370,'rival',bob?Math.sin(bob/800)*10:0,.94,-1);paper(720,390,17,'red',.2,1);paper(692,385,15,'news',-.3,1)}
function drawExplore(){school();npcGroup();actor(G.hero.x,G.hero.y,'hero',G.hero.walk,1,G.hero.facing);if(G.state==='explore')speech(665,260)}
function speech(x,y){if(!G.coach||G.now>G.coachUntil)return;const size=13;ctx.font=`800 ${size}px "Malgun Gothic",system-ui,sans-serif`;const w=ctx.measureText(G.coach).width+34;ctx.save();ctx.translate(0,Math.sin(G.now/260)*1.5);
 rr(x-w/2+4,y-27,w,38,10);ctx.fillStyle='#1b123040';ctx.fill();panel(x-w/2,y-31,w,38,10,WHITE);poly([[x-9,y+5],[x+9,y+5],[x,y+17]],WHITE);rect(x-7,y+2,14,5,WHITE);text(G.coach,x,y-7,size,OUT,'center',800);ctx.restore()}
function paper(x,y,size,type='news',angle=.12,sy=.8,folds=4,spriteState='base',flipScale=1){if(ttakji(x,y,size,type==='red'?'colored_paper':type==='news'?'newspaper':type,spriteState,angle,flipScale))return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1,sy);const half=size/2;rect(-half+4,-half+5,size,size,'#1b123044');rect(-half,-half,size,size,type==='red'?'#ff6b4a':'#fff1d0');if(type==='news'){for(let i=0;i<6;i++){rect(-half+10,-half+12+i*(size-20)/6,size*.28,2,'#6b728066');rect(half*.1,-half+12+i*(size-20)/6,size*.3,2,'#6b728066')}}ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.strokeRect(-half,-half,size,size);if(folds>=1)line(-half,-half,half,half,OUT,2);if(folds>=2)line(half,-half,-half,half,OUT,2);ctx.restore()}

Object.assign(WorldKit,{sky,sun,cloud,hills,tree,grassEdge,school,CHARACTER,LOOKS,actor,npcGroup,drawExplore,speech,paper});
})();
