'use strict';
(function(){
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');let width=960,height=600,scale=1,ox=0,oy=0,last=0;
// Load the existing RGBA sprites once; scene rendering keeps running while they decode.
// Each material has four authored states; base is a fallback for failed requests.
const ttakjiSprites=Object.fromEntries(Object.keys(TtakjiProgression.items).map(material=>[material,
 Object.fromEntries(['base','flipped','inventory','damaged'].map(state=>{
  // Keepsake items (items[id].sprite) reuse another item's artwork.
  const dir=TtakjiProgression.items[material].sprite||material,image=new Image();image.src=`assets/sprites/ttakji/${dir}/ttakji_${dir}_${state}.png`;
  image.onerror=()=>{image.failed=true;if(state==='base')console.warn(`Ttakji sprite unavailable: ${material}/${state}`)};
  return [state,image];
 }))
]));
function ttakji(x,y,size,material='newspaper',state='base',angle=0,flipScale=1){
 let image=ttakjiSprites[material]?.[state];
 if(image?.failed)image=ttakjiSprites[material].base;
 if(!image?.complete||!image.naturalWidth)return false;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1,Math.max(.001,Math.abs(flipScale)));
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 // The authored artwork occupies 204px of each 256px canvas. Preserve padding and aspect ratio.
 const extent=size*256/204;ctx.drawImage(image,-extent/2,-extent/2,extent,extent);ctx.restore();return true;
}
// Shared palette: one dark ink outlines every shape so scenes read like a cartoon game.
const OUT='#1b1230',NAVY='#2b2d6e',YELLOW='#ffe14d',RED='#ff5a4e',BLUE='#3d9be9',WHITE='#ffffff';
const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
const box=(x,y,w,h,c,t=3)=>{rect(x-t,y-t,w+t*2,h+t*2,OUT);rect(x,y,w,h,c)};
function text(str,x,y,size=12,color=WHITE,align='left',weight=800,stroke){ctx.font=`${weight} ${size}px "Malgun Gothic",system-ui,sans-serif`;ctx.textAlign=align;if(stroke){ctx.lineJoin='round';ctx.lineWidth=Math.max(3,size/4);ctx.strokeStyle=stroke;ctx.strokeText(str,x,y)}ctx.fillStyle=color;ctx.fillText(str,x,y)}
function line(x1,y1,x2,y2,color=WHITE,w=2){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function circle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,Math.PI*2);ctx.fill()}
function ell(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function panel(x,y,w,h,r,fill,o=OUT,t=3){rr(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(t){ctx.lineWidth=t;ctx.strokeStyle=o;ctx.lineJoin='round';ctx.stroke()}}
function poly(points,fill,o=OUT,t=3){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(t){ctx.lineWidth=t;ctx.strokeStyle=o;ctx.lineJoin='round';ctx.stroke()}}
function grad(x,y,w,h,top,bottom){const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);ctx.fillStyle=g;ctx.fillRect(x,y,w,h)}
function resize(){const b=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=b.width;height=b.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(width/960,height/600);ox=(width-960*scale)/2;oy=(height-600*scale)/2;ctx.imageSmoothingEnabled=false}
window.World={spriteReady(id,state){const image=ttakjiSprites[id]?.[state];return image?.failed?false:image?.naturalWidth?true:undefined},screenToWorld(x,y){const b=canvas.getBoundingClientRect();return{x:(x-b.left-ox)/scale,y:(y-b.top-oy)/scale}}};new ResizeObserver(resize).observe(canvas);window.addEventListener('resize',resize);

// --- Scenery pieces ---
function sky(h,top='#45b8ff',bottom='#c9f1ff'){grad(0,0,960,h,top,bottom)}
function sun(x,y,core=YELLOW){const p=Math.sin(G.now/900)*3;circle(x,y,48+p,'#fff3b055');circle(x,y,34,OUT);circle(x,y,31,core);circle(x-9,y-9,9,'#fff8c9')}
function cloud(x,y,s=1){for(const[bx,by,r]of[[0,0,16],[20,-10,20],[42,-2,16],[60,4,12]])circle(x+bx*s,y+by*s,r*s,WHITE);rect(x-4*s,y+2*s,72*s,13*s,WHITE);rect(x-4*s,y+12*s,72*s,4*s,'#d3eeff')}
function hills(y,a='#6fd36b',b='#55c35a'){for(let i=0;i<10;i++)circle(i*112-20,y+(i*37)%26,64+(i%3)*14,i%2?a:b)}
function tree(x,y,s=1){const cx=x+28*s,cy=y+22*s;ell(cx,y+95*s,32*s,7*s,'#00000026');box(x+21*s,y+36*s,14*s,59*s,'#9a5b2c',3);
 const blobs=[[0,0,34],[-22,14,24],[22,14,24],[0,-20,24]];for(const[bx,by,r]of blobs)circle(cx+bx*s,cy+by*s,r*s+3,OUT);for(const[bx,by,r]of blobs)circle(cx+bx*s,cy+by*s,r*s,'#3fbf4f');circle(cx+14*s,cy+18*s,12*s,'#2e9e44');circle(cx-9*s,cy-16*s,11*s,'#86e57f')}
function grassEdge(y){rect(0,y-3,960,3,OUT);rect(0,y,960,14,'#4cc95a');rect(0,y+10,960,4,'#2f9e44');for(let i=0;i<48;i++)rect(i*20+(i%3)*4,y-2,4,6,'#4cc95a')}

function school(){
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

// Chibi characters: an outline pass, then the fill pass, then face details.
const LOOKS={
 hero:{skin:'#ffd2a1',hair:'#2a1b14',shirt:RED,trim:WHITE,pants:'#2f5bd3',shoe:WHITE,cap:'#2f5bd3'},
 rival:{skin:'#ffd2a1',hair:'#ff8a1f',shirt:'#3cc464',trim:'#1f8a43',pants:'#3a3a5a',shoe:'#ff8a1f',spiky:true},
 boss:{skin:'#f0b98a',hair:'#1b1b2a',shirt:'#8e44e8',trim:YELLOW,pants:'#2a2240',shoe:'#1b1b2a',shades:true,band:'#ff3b5c'},
 champ:{skin:'#f0b98a',hair:'#1b1b2a',shirt:'#ffc21a',trim:'#ff3b5c',pants:'#2a2240',shoe:WHITE,shades:true,band:'#ff3b5c'},
 friend:{skin:'#ffd9b0',hair:'#6b3a1e',shirt:YELLOW,trim:'#ff7ab8',pants:'#ff7ab8',shoe:WHITE,tails:true},
 neighbor:{skin:'#f5c597',hair:'#4a3626',shirt:BLUE,trim:WHITE,pants:'#5a4a3a',shoe:'#3a2a1a',glasses:true},
 uncle:{skin:'#f5c597',hair:'#4a3626',shirt:'#e0923d',trim:'#9a5b2c',pants:'#4b5563',shoe:'#3a2a1a',bald:true,mustache:true},
 sprinter:{skin:'#f8c896',hair:'#1b1b2a',shirt:'#ff3b5c',trim:WHITE,pants:'#ff3b5c',shoe:YELLOW,band:WHITE},
 folder:{skin:'#ffd2a1',hair:'#3a2a50',shirt:'#20b2aa',trim:'#0e7f78',pants:'#334155',shoe:'#e2e8f0',beanie:'#7c5cff'},
 globe:{skin:'#f0b98a',hair:'#f5f5f5',shirt:BLUE,trim:YELLOW,pants:'#1f2a6e',shoe:WHITE,shades:true,band:YELLOW},
 alien:{skin:'#8be36b',hair:'#2e9e44',shirt:'#7c5cff',trim:YELLOW,pants:'#2a2240',shoe:'#e2e8f0',bald:true,antenna:true},
 alien_champ:{skin:'#8be36b',hair:'#2e9e44',shirt:'#ffc21a',trim:'#ff3b5c',pants:'#2a2240',shoe:WHITE,bald:true,antenna:true,shades:true}
};
function actor(x,y,kind='hero',walk=0,scaleActor=1,facing=1){
 kind=({examinee:'folder',doyun:'boss',wall:'folder',offbeat:'sprinter',champion:'boss',charger:'sprinter',fortress:'folder',national_champion:'champ',gust:'sprinter',glacier:'folder',continent_champion:'champ',showman:'rival',architect:'folder',world_champion:'globe',martian:'alien',lunar:'alien',planet_champion:'alien_champ',boxer:'neighbor',compressed:'folder',timing:'sprinter',mender:'friend',official:'folder',regulator:'champ',endurance:'friend',striker:'sprinter',reverse:'globe',glass:'friend',federation:'folder',situational:'globe',triangle:'alien',sparkle:'alien'})[kind]||kind;if(kind==='situational'&&G.hub==='planet')kind='alien_champ';const L=LOOKS[kind]||LOOKS.friend,f=facing>0?1:-1;
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scaleActor,scaleActor);
 const bob=walk?Math.abs(Math.sin(walk/90))*3:Math.sin(G.now/500+x)*1.2,step=walk?Math.sin(walk/90)*6:0,liftL=Math.max(0,step)*.7,liftR=Math.max(0,-step)*.7,swing=step*.6;
 ell(0,1,22,6,'#00000038');ctx.translate(0,-bob);
 const parts=[[-10,-20,8,18-liftL,L.skin],[2,-20,8,18-liftR,L.skin],[-12,-5-liftL,12,6,L.shoe],[0,-5-liftR,12,6,L.shoe],[-14,-24,28,9,L.pants],[-14,-46,28,26,L.shirt],[-21,-44+swing,7,18,L.shirt],[14,-44-swing,7,18,L.shirt],[-21,-28+swing,7,6,L.skin],[14,-28-swing,7,6,L.skin],[-20,-84,40,38,L.skin]];
 if(L.cap)parts.push([-21,-90,42,14,L.cap],[f>0?12:-32,-80,20,5,L.cap]);
 else if(L.beanie)parts.push([-21,-92,42,16,L.beanie],[-4,-99,8,7,WHITE]);
 else if(L.bald)parts.push([-21,-76,5,12,L.hair],[16,-76,5,12,L.hair]);
 else{parts.push([-21,-90,42,14,L.hair],[f>0?-21:15,-80,6,16,L.hair]);if(L.spiky)parts.push([-18,-97,8,9,L.hair],[-5,-100,9,11,L.hair],[8,-97,8,9,L.hair]);if(L.tails)parts.push([-29,-78,9,18,L.hair],[20,-78,9,18,L.hair])}
 for(const[px,py,w,h]of parts)rect(px-3,py-3,w+6,h+6,OUT);for(const[px,py,w,h,c]of parts)rect(px,py,w,h,c);
 // Shirt trim, chest badge and face.
 rect(-14,-36,28,4,L.trim);rect(-5,-46,10,4,L.trim);if(kind==='hero')rect(3,-44,6,6,YELLOW);
 if(L.band)rect(-20,-80,40,5,L.band);if(L.antenna){rect(-2,-102,5,18,OUT);circle(0,-104,6,OUT);circle(0,-104,4,YELLOW)}
 const ex=f*4,blink=(G.now+x*37)%3400<130;
 if(L.shades){rect(-15+ex,-70,30,8,OUT);rect(-11+ex,-68,6,2,'#ffffff88')}
 else if(blink){rect(-10+ex,-64,5,2,OUT);rect(5+ex,-64,5,2,OUT)}
 else{rect(-10+ex,-70,5,8,OUT);rect(5+ex,-70,5,8,OUT);rect(-9+ex,-69,2,2,WHITE);rect(6+ex,-69,2,2,WHITE)}
 if(L.glasses){ctx.strokeStyle=OUT;ctx.lineWidth=2;ctx.strokeRect(-13+ex,-72,11,11);ctx.strokeRect(2+ex,-72,11,11);rect(-2+ex,-67,4,2,OUT)}
 rect(-15+ex,-60,6,3,'#ff8a8a99');rect(10+ex,-60,6,3,'#ff8a8a99');
 if(L.mustache)rect(-7+ex,-58,15,4,L.hair);rect(-2+ex*1.3,-54,6,2,'#8a2b2b');
 ctx.restore()
}
function npcGroup(){const bob=G.state==='title'?G.now:0;actor(722,349,'friend',0,.75,-1);if(G.mode!=='epilogue')actor(800,346,'boss',0,1.06,-1);actor(662,370,'rival',bob?Math.sin(bob/800)*10:0,.94,-1);paper(720,390,17,'red',.2,1);paper(692,385,15,'news',-.3,1)}
function drawExplore(){school();npcGroup();actor(G.hero.x,G.hero.y,'hero',G.hero.walk,1,G.hero.facing);if(G.state==='explore')speech(665,260)}
function speech(x,y){if(!G.coach||G.now>G.coachUntil)return;const size=13;ctx.font=`800 ${size}px "Malgun Gothic",system-ui,sans-serif`;const w=ctx.measureText(G.coach).width+34;ctx.save();ctx.translate(0,Math.sin(G.now/260)*1.5);
 rr(x-w/2+4,y-27,w,38,10);ctx.fillStyle='#1b123040';ctx.fill();panel(x-w/2,y-31,w,38,10,WHITE);poly([[x-9,y+5],[x+9,y+5],[x,y+17]],WHITE);rect(x-7,y+2,14,5,WHITE);text(G.coach,x,y-7,size,OUT,'center',800);ctx.restore()}
function paper(x,y,size,type='news',angle=.12,sy=.8,folds=4,spriteState='base',flipScale=1){if(ttakji(x,y,size,type==='red'?'colored_paper':type==='news'?'newspaper':type,spriteState,angle,flipScale))return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1,sy);const half=size/2;rect(-half+4,-half+5,size,size,'#1b123044');rect(-half,-half,size,size,type==='red'?'#ff6b4a':'#fff1d0');if(type==='news'){for(let i=0;i<6;i++){rect(-half+10,-half+12+i*(size-20)/6,size*.28,2,'#6b728066');rect(half*.1,-half+12+i*(size-20)/6,size*.3,2,'#6b728066')}}ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.strokeRect(-half,-half,size,size);if(folds>=1)line(-half,-half,half,half,OUT,2);if(folds>=2)line(half,-half,-half,half,OUT,2);ctx.restore()}

function villageBackground(){
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
 grad(0,0,960,272,L.wall[0],L.wall[1]);if(id!=='continent')stars(40,140);
 ctx.fillStyle='#fff6c022';for(const k of[160,480,800]){ctx.beginPath();ctx.moveTo(k-14,0);ctx.lineTo(k+14,0);ctx.lineTo(k+130,272);ctx.lineTo(k-130,272);ctx.closePath();ctx.fill()}
 const skins=planet?['#8be36b','#ffd2a1','#7fd3ff']:['#ffd2a1','#f0b98a','#c98a5a'];
 for(let row=0;row<2;row++){rect(40,166+row*57,880,9,OUT);for(let i=0;i<17;i++){const x=78+i*50,y=150+row*57+Math.sin(G.now/220+i*1.7+row)*2;box(x-11,y+10,22,18,[RED,BLUE,'#3cc464',YELLOW][(i+row)%4],2);circle(x,y,10,OUT);circle(x,y,8,skins[i%3])}}
 panel(300,12,360,52,12,L.banner);text(L.title,480,47,24,WHITE,'center',900,OUT);
 rect(0,268,960,4,OUT);grad(0,272,960,328,planet?'#b9b4c9':'#f7c47e',planet?'#7a7396':'#d98a42');rect(0,272,960,5,'#ffffff88');for(let i=0;i<14;i++)rect(i*75,285,3,315,'#00000018');
}
function drawAdvert(){school();ctx.fillStyle='#1b123055';ctx.fillRect(0,0,960,600);panel(340,105,280,315,14,RED);panel(354,119,252,287,8,'#fff8e6',OUT,0);text('제1회',480,163,18,RED,'center',900);text('우리 마을',480,212,32,NAVY,'center',900);text('딱지 대회',480,260,40,WHITE,'center',900,OUT);paper(480,318,65,'red',Math.sin(G.now/500)*.08,1);text('우승 상금 120원',480,380,19,NAVY,'center',900)}
function drawBattle(){const practice=['practice','training','story_training'].includes(G.mode);
 if(practice){rect(0,0,960,275,'#ffe7c2');for(let i=0;i<24;i++)rect(i*40,0,18,275,'#ffdba8');box(35,95,266,180,'#7fd3ff');rect(35,215,266,60,'#5ab8f0');rect(166,95,4,180,OUT);rect(35,183,266,4,OUT);cloud(70,140,.6);panel(380,60,200,60,8,NAVY);text('연 습 장',480,99,22,YELLOW,'center',900);tree(822,160,1.4);rect(0,272,960,4,OUT);grad(0,276,960,324,'#f7c47e','#e09a50');for(let i=0;i<14;i++)rect(i*75,276,3,324,'#c9813f55')}
 else{if(G.mode==='ending_match')school();else if(Village.isBattle()){if(TIER_LOOK[G.hub])tierArena(G.hub);else MapRenderer.arena(ctx,{rect,text,line,actor},G.hub)}else school()}
 // Battle mat.
 ell(480,446,345,16,'#1b123033');panel(150,286,660,151,20,WHITE);panel(160,294,640,135,14,'#3d7bff',OUT,0);ctx.strokeStyle='#ffffffaa';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(480,361,96,42,0,0,Math.PI*2);ctx.stroke();line(480,296,480,427,'#ffffff77',3);rect(160,294,640,6,'#ffffff33');
 actor(125,347,'hero',0,1.1,1);if(!practice){actor(837,347,Village.isBattle()?G.opponent.kind:'rival',0,1.1,-1);if(G.mode==='intro_battle')actor(891,313,'boss',0,.85,-1)}let px=310,py=350,ex=650,ey=350,pa=-.16,ea=.15,ps=1,es=1;
if(G.animation){const t=(G.now-G.animation.at)/1000;const grade=G.animation.grade;const power=grade==='PERFECT'?1:grade==='GOOD'?.65:grade==='NORMAL'?.45:.3;if(G.animation.kind==='player-hit'){if(t<.36){const q=t/.36;px=310+Math.pow(q,2)*320;py=350-Math.sin(q*Math.PI)*95;pa=-.16-q*.7;ps=1+Math.sin(q*Math.PI)*.25}else if(t<.7){const q=(t-.36)/.34;px=630-(630-310)*q;py=350-55*Math.sin(q*Math.PI);ey-=Math.sin(q*Math.PI)*55*power;ea+=Math.sin(q*Math.PI*2)*.35*power}}else if(G.animation.kind==='enemy-ready'){ey-=Math.sin(Math.min(t/.75,1)*Math.PI/2)*35;ea-=.2*Math.min(t/.75,1)}else if(G.animation.kind==='enemy-hit'){if(t<.36){const q=t/.36;ex=650-Math.pow(q,2)*320;ey=315-Math.sin(q*Math.PI)*105;ea=.15+q*.8;es=1+Math.sin(q*Math.PI)*.35}else if(t<.7){const q=(t-.36)/.34;ex=330+320*q;ey=350-Math.sin(q*Math.PI)*50;py-=Math.sin(q*Math.PI)*25}}}
let psy=.76,esy=.76;if(G.flipPlayer){const t=Math.min((G.now-G.flipPlayer)/800,1);psy=Math.cos(t*Math.PI)*.76;py-=Math.sin(t*Math.PI)*95;pa+=t*.18}if(G.flipEnemy){const t=Math.min((G.now-G.flipEnemy)/800,1);esy=Math.cos(t*Math.PI)*.76;ey-=Math.sin(t*Math.PI)*95;ea-=t*.2}if(G.stolen){const t=Math.min((G.now-G.stolenAt)/900,1);px+=t*560;py-=t*90;ctx.globalAlpha=1-t}
 // Ground shadows under each ttakji sell the height of each throw.
 ell(px,402,46*(1-(350-py)/260),9,'#1b123044');ell(ex,402,46*(1-(350-ey)/260),9,'#1b123044');
 const playerSprite=G.flipPlayer&&psy<0?'flipped':G.hp<G.maxHp?'damaged':'base';paper(px,py,106*ps,Village.isBattle()?G.profile.equipped:'news',pa,1,4,playerSprite,Math.abs(psy)/.76);ctx.globalAlpha=1;const enemySprite=G.flipEnemy&&esy<0?'flipped':G.enemyHp<G.enemyMax?'damaged':'base';paper(ex,ey,106*es,Village.isBattle()?G.opponent.material:'red',ea,1,4,enemySprite,Math.abs(esy)/.76);if(G.mode!=='practice')speech(760,245);
}
function drawHome(){
 rect(0,0,960,280,'#ffe7c2');for(let i=0;i<24;i++)rect(i*40,0,18,280,'#ffdba8');
 // Window with curtains, bookshelf, notebook and mug.
 box(66,65,167,146,WHITE);grad(75,74,149,127,'#45b8ff','#c9f1ff');cloud(92,120,.5);rect(145,74,8,127,WHITE);rect(75,133,149,8,WHITE);box(56,208,188,8,'#b8743a');rect(46,56,24,160,'#ff7ab8');rect(230,56,24,160,'#ff7ab8');rect(46,56,208,8,'#e85d9a');
 box(690,110,178,150,'#9a5b2c');for(let i=0;i<2;i++){rect(690,170+i*70,178,7,'#6b3a1e');for(let j=0;j<7;j++)box(704+j*22,132+i*70-(j%2)*9,14,38+(j%2)*9,[RED,BLUE,YELLOW,'#3cc464','#a259ff'][(j+i*2)%5],2)}
 rect(0,276,960,4,OUT);grad(0,280,960,320,'#e9a560','#c97a37');for(let i=0;i<7;i++)rect(0,310+i*48,960,3,'#a85f2688');
 ell(480,332,268,80,OUT);ell(480,332,262,74,'#7c5cff');ell(480,332,220,58,'#9d84ff');
 box(95,342,76,60,WHITE);for(const[w,yy]of[[60,352],[60,366],[39,380]])rect(102,yy,w,3,'#7fb3ff');rect(95,342,6,60,RED);
 box(781,305,31,42,RED);rect(785,309,8,20,'#ffffff55');ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.strokeRect(812,314,10,18);
const x=480,y=280,size=190;if(G.fold===4&&G.now-G.foldAt>=450&&ttakji(x,y,size*(1-G.fold*.055),'newspaper','inventory'))return;ctx.save();ctx.translate(x,y);const t=Math.min((G.now-G.foldAt)/450,1),foldScale=1-G.fold*.055;ctx.scale(foldScale,foldScale);rect(-95+8,-95+9,190,190,'#1b123040');box(-95,-95,190,190,'#fff6e0');for(let i=0;i<10;i++){rect(-82,-80+i*17,68,3,'#6b728055');rect(9,-80+i*17,70,3,'#6b728055')}const triangles=[[[-95,-95],[95,-95],[0,0]],[[95,95],[-95,95],[0,0]],[[95,-95],[95,95],[0,0]],[[-95,95],[-95,-95],[0,0]]];for(let i=0;i<G.fold;i++){ctx.globalAlpha=i===G.fold-1?Math.min(1,t*2):1;poly(triangles[i],['#ffe9b8','#f5d68f','#ffe1a0','#f0c97a'][i])}ctx.globalAlpha=1;ctx.restore();if(G.state==='folding'){const spots=[[385,185],[575,375],[575,185],[385,375]],p=spots[G.fold];if(p){const pulse=1+Math.sin(G.now/200)*.12;ctx.save();ctx.translate(p[0],p[1]);ctx.scale(pulse,pulse);circle(0,0,26,'#ffe14d55');circle(0,0,19,OUT);circle(0,0,16,YELLOW);text(String(G.fold+1),0,6,17,OUT,'center',900);ctx.restore()}}}
// Ending: the camera rises from the school yard to the sky while the two ttakji meet (spec 04 §12).
function drawEndingSky(){const t=Math.min(1,Math.max(0,(G.now-G.endingAt)/2600)),ease=t*t*(3-2*t),lift=ease*430;
 sky(600,'#1f5fd1','#bfe9ff');for(let i=0;i<6;i++)cloud((i*190+G.now/60)%1100-120,40+i*70-lift*.25,.6+i%3*.2);
 ctx.save();ctx.translate(0,lift);school();actor(400,420,'hero',0,1,1);actor(560,420,'boss',0,1,-1);
 const meet=Math.min(1,Math.max(0,(G.now-G.endingAt-1700)/700));paper(430+meet*40,370-Math.sin(meet*Math.PI)*60,46,'news',-.2,1);paper(530-meet*40,370-Math.sin(meet*Math.PI)*60,46,'accordion_folder',.2,1);
 for(let i=0;i<4;i++)actor(120+i*45,330,'friend',0,.6,1);ctx.restore();
 if(G.state==='credits'){ctx.fillStyle='#1b1230d9';ctx.fillRect(0,0,960,600);stars(80,600)}}
function drawTitle(){school();npcGroup();actor(520,416,'hero',Math.sin(G.now/900)>0?30:0,1.5,1);paper(710,470,155,'news',-.22+Math.sin(G.now/700)*.04,.8);paper(818,420,103,'red',.18+Math.sin(G.now/800+1)*.05,.8)}
function frame(now){const dt=Math.min(now-last||16,50);last=now;if(!G.paused)update(dt);const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);rect(0,0,width,height,OUT);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);if(!reducedMotion&&G.shake>0.1)ctx.translate((Math.random()-.5)*G.shake,(Math.random()-.5)*G.shake);if(G.state==='title')drawTitle();else if(G.scene==='battle')drawBattle();else if(Exploration.active())MapRenderer.draw(ctx,{rect,text,line,tree,actor,paper});else if(G.scene==='home')drawHome();else if(G.scene==='village')drawVillage();else if(G.scene==='ending_sky')drawEndingSky();else if(G.scene==='advert')drawAdvert();else drawExplore();for(const p of G.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);const s=p.size+1;rect(p.x-2,p.y-2,s+4,s+4,OUT);rect(p.x,p.y,s,s,p.color)}ctx.globalAlpha=1;for(const p of G.floaters){const t=(G.now-p.at)/950;ctx.globalAlpha=Math.max(0,1-t);text(p.text,p.x,p.y-t*60,30,YELLOW,'center',900,OUT)}ctx.globalAlpha=1;if(G.flash>.005){ctx.fillStyle=`rgba(255,246,200,${G.flash})`;ctx.fillRect(0,0,960,600)}ctx.restore();requestAnimationFrame(frame)}
resize();requestAnimationFrame(frame);
})();
