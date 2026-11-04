'use strict';
/* A single pixel-art renderer. Legacy illustrations stay in assets for save/catalog compatibility. */
window.GameArt=(()=>{
 const manifest=window.ART_MANIFEST||{},cache=new Map(),portraits=new Map(),portraitImages=new Map();
 const fontReady=document.fonts?Promise.all(['16px Jua','24px GamjaFlower','14px Galmuri11','700 14px Galmuri11'].map(font=>document.fonts.load(font))):Promise.resolve();
 fontReady.then(()=>{cache.clear();document.querySelectorAll('[data-art-character]').forEach(el=>portrait(el,el.dataset.artCharacter))});
 const C={ink:'#293442',deep:'#233745',sky:'#b7d4cb',mist:'#d7dfbc',cream:'#fff0c9',sand:'#dbb480',sandLight:'#e9c897',sandDark:'#b88b68',brick:'#c88168',roof:'#a65d50',roofLight:'#d08864',leaf:'#66866b',leafLight:'#94ac79',leafDark:'#476858',wood:'#8e6551',woodLight:'#ba8b62',glass:'#6f9994',blue:'#526e83',gold:'#e6b65f'};
 const looks={hero:['#364458','#cf765f','#536d86','#edbf8d'],rival:['#78513d','#71885b','#526078','#edbf8d'],minsu:['#78513d','#71885b','#526078','#edbf8d'],friend:['#73503e','#e0b971','#ab7077','#f0c69a'],neighbor:['#574839','#65918e','#77705e','#dcb184'],uncle:['#5f4b3a','#bd9363','#5c7180','#ddb289'],boss:['#353c4c','#8d7497','#4d5368','#ddb083'],champ:['#353c4c','#d3af63','#4d5368','#ddb083'],folder:['#796c91','#6d9b8c','#51627b','#e7ba8c'],sprinter:['#4b4350','#b86d77','#786276','#e7ba8c'],globe:['#b9b8a7','#6393a5','#4e6785','#d5a580'],alien:['#638578','#927a9b','#5d5878','#b0bf87'],alien_champ:['#638578','#d3af63','#5d5878','#b0bf87']};
 const canonical=k=>k==='minsu'?'rival':k;
 function paint(ctx){
  const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(0,Math.round(w)),Math.max(0,Math.round(h)))};
  const line=(x,y,x2,y2,c,w=2)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()};
  const poly=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()};
  const label=(s,x,y,size=12,color=C.cream)=>{ctx.font=`700 ${size}px Galmuri11,"Malgun Gothic",sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(s,x,y)};
  return {r,line,poly,label};
 }
 function surface(key,w,h,draw){if(!cache.has(key)){const c=document.createElement('canvas');c.width=w/2;c.height=h/2;const ctx=c.getContext('2d');ctx.scale(.5,.5);draw(ctx);cache.set(key,c)}return cache.get(key)}
 function blit(ctx,c,x=0,y=0,w=c.width*2,h=c.height*2){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(c,x,y,w,h);ctx.restore()}
 function tree(ctx,x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);const {r}=paint(ctx);
  r(-34,0,78,8,'#3d57442a');r(-6,-99,15,102,C.wood);r(-3,-96,5,96,C.woodLight);r(6,-72,15,7,C.wood);r(15,-98,6,30,C.wood);r(-21,-86,18,7,C.wood);
  const layers=[[-46,-144,78,50],[-64,-119,116,40],[-44,-91,90,24],[-27,-164,58,30],[-68,-105,24,24],[40,-123,22,32]];
  for(const [xx,yy,w,h]of layers)r(xx+3,yy+6,w,h,C.leafDark);
  for(const [xx,yy,w,h]of layers)r(xx,yy,w,h,C.leaf);
  for(const [xx,yy,w,h]of [[-28,-161,48,10],[-43,-142,65,12],[-59,-118,44,12],[3,-131,41,9],[-32,-96,35,7],[34,-117,19,7]])r(xx,yy,w,h,C.leafLight);
  r(-18,-139,8,6,'#b7c58a');r(-47,-115,7,5,'#b7c58a');r(13,-125,6,5,'#b7c58a');ctx.restore();
 }
 function bush(ctx,x,y,w=100){const {r}=paint(ctx);r(x,y-16,w,18,C.leafDark);for(let i=0;i<w;i+=14){r(x+i,y-25-i%3*3,20,17,C.leaf);r(x+i+2,y-25-i%3*3,12,4,C.leafLight)}r(x,y,w,4,'#466653')}
 function windowpane(ctx,x,y,w=52,h=52,lit=false){const {r}=paint(ctx);r(x-4,y-4,w+8,h+8,C.wood);r(x-1,y-1,w+2,h+2,C.cream);r(x+3,y+3,w-6,h-6,lit?'#e4c485':C.glass);r(x+5,y+5,w*.42,h*.45,lit?'#ffe2a4':'#a4c6b6');r(x+w/2-2,y,4,h,C.cream);r(x,y+h/2-2,w,4,C.cream);r(x-7,y+h+3,w+14,5,'#e5cba0');r(x-5,y+h+8,w+10,4,'#a58b6d')}
 function building(ctx,x,w,name,{y=190,h=212,wall='#e5c395',roof=C.roof,door=true,shop=false}={}){const {r,poly,label}=paint(ctx),left=x-w/2;
  r(left+12,400,w,12,'#5b584332');r(left,y,w,h,wall);r(left+w-14,y,14,h,'#ba9675');r(left,y+h-16,w,16,'#b99273');
  for(let yy=y+23;yy<y+h-20;yy+=36){for(let xx=left+8+(yy%2)*10;xx<left+w-20;xx+=62)r(xx,yy,22,2,'#b78b6b30')}
  poly([[left-20,y+4],[left-9,y-34],[left+w+9,y-34],[left+w+20,y+4]],C.wood);poly([[left-18,y-2],[left-5,y-31],[left+w+5,y-31],[left+w+17,y-2]],roof);
  r(left-2,y-29,w+4,5,C.roofLight);r(left-20,y+3,w+40,7,C.wood);r(left-12,y+10,w+24,5,'#f3d6a1');
  for(let xx=left;xx<left+w+5;xx+=19){r(xx,y-25,3,27,'#894e473d');r(xx+3,y-21,14,2,'#e0a07866')}
  if(name){const sw=Math.min(w-20,Math.max(110,name.length*16));r(x-sw/2-3,y+25,sw+6,34,C.wood);r(x-sw/2,y+27,sw,28,C.deep);r(x-sw/2+4,y+30,sw-8,2,'#788b7d');label(name,x,y+47,13,C.cream)}
  if(door){r(x-25,y+h-103,50,103,C.wood);r(x-20,y+h-98,40,98,'#697d72');r(x-16,y+h-94,32,54,'#91afa0');r(x-12,y+h-90,8,44,'#b9c8a8');r(x-19,y+h-36,38,4,'#53695e');r(x+10,y+h-22,4,4,C.gold);r(x-34,y+h-3,68,8,'#f0d2a1');r(x-39,y+h+5,78,6,'#aa8567')}
  if(w>220){windowpane(ctx,left+24,y+79,48,53);windowpane(ctx,left+w-72,y+79,48,53)}
  if(shop){for(let i=0;i<10;i++){r(left-9+i*(w+18)/10,y+62,(w+18)/10,26,i%2?'#f2d59c':'#779386');r(left-9+i*(w+18)/10,y+85,(w+18)/10,6,i%2?'#d7b77e':'#527567')}r(left+16,370,64,31,C.wood);r(left+21,373,54,5,C.woodLight);r(left+25,354,16,17,'#ead9ac');r(left+44,349,18,22,'#c1816e')}
 }
 function sky(ctx,theme,camera=0,w=960){const {r,poly}=paint(ctx),night=['national','world','planet'].includes(theme),desert=theme==='continent';
  r(0,0,w,600,night?'#25374e':desert?'#e3b18c':C.sky);r(0,125,w,210,night?'#344c5e':desert?'#edc397':'#cbdabb');
  if(night){for(let i=0;i<45;i++){const x=(i*173+31)%960,y=(i*43+23)%210;r(x,y,i%4?2:4,i%4?2:4,'#e6dcb1')}r(769,67,36,36,C.cream);r(781,63,32,26,'#25374e')}
  else{r(763,53,48,48,'#f8e7b0');r(755,61,64,32,'#f8e7b0');r(768,58,38,37,'#fff0c9');for(let i=0;i<5;i++){const x=(i*249+62-camera*.07)%1100-70,y=65+i%3*35;r(x,y,90,12,'#edf0d3');r(x+17,y-9,49,11,'#edf0d3');r(x+36,y-15,27,8,'#edf0d3')}}
  const colors=night?['#3d5862','#486568']:desert?['#c18f77','#ad8472']:['#9bb8a1','#829f89'];
  for(let j=0;j<2;j++)for(let i=-1;i<Math.ceil(w/205)+1;i++){const x=i*205-(camera*(.10+j*.08))%205;poly([[x,280],[x+20,225-j*25],[x+66,206-j*20],[x+90,182+j*20],[x+124,207],[x+157,215-j*20],[x+220,280]],colors[j])}
 }
 function ground(ctx,w,indoor=false,y=402,theme='yard'){const {r,line}=paint(ctx),night=['national','world','planet'].includes(theme);r(0,y,w,600-y,indoor?'#b69471':night?'#7e8b83':C.sand);r(0,y,w,7,indoor?'#dfc697':'#efdaa6');r(0,y+7,w,5,indoor?'#957458':'#ae976d');
  for(let i=0;i<w/5;i++){const x=(i*137+29)%w,yy=y+20+(i*53)%(580-y-20);r(x,yy,i%3+2,2,indoor?'#92745d35':i%3?'#a8845a40':'#f2dba650')}
  if(indoor){for(let x=0;x<w;x+=90){line(x,y+12,x+90,600,'#8b705a55',2);r(x,y+67,90,2,'#8b705a35')}r(0,580,w,20,'#665b4f');r(0,580,w,4,'#bda77b')}
  else{r(0,551,w,8,'#bca47b');r(0,559,w,29,'#8d9b7d');r(0,588,w,12,'#5b7567');for(let x=0;x<w;x+=48){r(x,559,2,28,'#647e69');r(x+4,562,35,3,'#c4c3a0')}for(let x=0;x<w;x+=26){r(x,549,4,7,C.leafDark);r(x+4,544,3,11,C.leaf);if(x%78===0){r(x+9,546,3,6,C.leaf);r(x+8,544,5,3,'#eed1a0')}}}
 }
 function schoolBuilding(ctx,x=480,w=690){const {r,label}=paint(ctx),left=x-w/2;building(ctx,x,w,'',{y:202,h:184,door:false});r(left+4,268,w-8,8,'#ba9e7f');r(left+4,344,w-8,7,'#ba9e7f');for(let i=0;i<Math.floor(w/75);i++){windowpane(ctx,left+20+i*75,218,46,42);windowpane(ctx,left+20+i*75,288,46,42)}r(x-46,296,92,90,C.wood);r(x-40,303,80,83,'#72867b');r(x-33,309,28,45,'#abc0a5');r(x+5,309,28,45,'#abc0a5');r(x-2,301,4,85,C.cream);r(x-52,382,104,7,'#f3d8a4');r(x-59,389,118,7,'#b59776');r(x-104,174,208,28,C.deep);r(x-100,177,200,2,'#869b8c');label('지 존 초 등 학 교',x,193,14,C.cream);r(x-16,139,32,29,'#e9d6ab');r(x-12,143,24,21,'#f9ebc6');r(x-1,146,2,9,C.wood);r(x-1,153,9,2,C.wood)}
 function fence(ctx,w,y=389){const {r}=paint(ctx);r(0,y-29,w,4,'#d7cca2');r(0,y-4,w,5,C.wood);for(let x=10;x<w;x+=24){r(x,y-34,5,34,'#708a75');r(x,y-34,2,34,'#b6c1a0')}r(0,y,w,11,'#b2ac88');r(0,y,w,3,'#ebd7a6')}
 function room(ctx,w,theme='home'){const {r,label}=paint(ctx),home=theme==='home';r(0,0,w,402,home?'#d6c09b':'#a6b5a3');r(0,89,w,5,'#f2dcaf');r(0,94,w,6,'#b09c7d');r(0,350,w,52,home?'#bd9677':'#7f9a8a');r(0,350,w,5,'#e1c79c');r(0,394,w,8,C.wood);for(let x=0;x<w;x+=240){r(x+8,100,3,244,'#9c8e7133');windowpane(ctx,x+87,154,100,91)}
  if(home){r(560,154,13,108,'#bb866f');r(669,154,13,108,'#bb866f');r(554,149,134,7,C.wood);r(875,270,125,7,C.wood);for(let i=0;i<6;i++)r(884+i*16,246-i%2*8,12,24+i%2*8,['#859782','#b7806c','#d5b16f'][i%3])}
  else{r(w/2-180,112,360,44,C.deep);r(w/2-175,116,350,2,'#8da08c');label(theme==='lobby'?'뒤집마을 · 딱지 대회 접수':'딱지 선수권 · 선수 로비',w/2,141,17,C.cream);for(let x=40;x<w;x+=180){r(x,161,9,188,'#6f897a');r(x+5,161,3,188,'#c9cbb0')}}
 }
 function landscape(ctx,theme,w=960,{map=false}={}){const {r,line,poly,label}=paint(ctx),indoor=['home','lobby','city','province','national'].includes(theme);sky(ctx,theme,0,w);if(indoor)room(ctx,w,theme);else{
   for(let x=0;x<w;x+=310){tree(ctx,x+40,355,.58);tree(ctx,x+180,358,.75)}
   if(theme==='yard'){schoolBuilding(ctx,map?790:510,map?1030:720);fence(ctx,w);for(const x of [65,1360])tree(ctx,x,400,1.12)}
   else if(theme==='alley'){building(ctx,300,290,'우리 집',{y:211,h:191});building(ctx,890,300,'',{y:225,h:177,wall:'#d7b28b'});building(ctx,1490,330,'',{y:187,h:215,wall:'#d2c4a1'});fence(ctx,w);for(const x of [520,1320])tree(ctx,x,401,.9);r(590,102,8,300,'#777c6d');r(576,141,38,7,C.wood);line(0,130,w,166,'#637667',2);line(0,145,w,181,'#637667',2)}
   else if(theme==='square'){building(ctx,320,290,'종이 잡화점',{y:201,h:201,shop:true,wall:'#e8c692'});building(ctx,1150,230,'딱지 공방',{y:233,h:169,wall:'#a4b5a2',roof:'#597a6b'});building(ctx,1550,230,'동네 훈련장',{y:210,h:192,wall:'#dbbf91',roof:'#6b8490'});building(ctx,1830,180,'제련소',{y:246,h:156,wall:'#a6afa1'});tree(ctx,590,403,1.1);bush(ctx,1910,403,230);line(100,174,2110,160,'#788a76',2);for(let i=0;i<26;i++)poly([[100+i*80,174],[122+i*80,174],[111+i*80,195]],['#c7836d','#dcc18b','#789a8b'][i%3])}
   else if(theme==='center'){building(ctx,700,430,'뒤집마을 주민센터',{y:173,h:229,wall:'#d7c8a2',roof:'#607e75'});r(570,243,260,35,'#b87960');label('한 장으로 시작하는 우리들의 승부',700,266,13,C.cream);for(const x of [100,1570])tree(ctx,x,401,1.13);bush(ctx,1050,402,180)}
   else if(theme==='schoolfront'){fence(ctx,w);schoolBuilding(ctx,890,610);tree(ctx,170,401,1.25);tree(ctx,1210,402,1.1)}
   else {schoolBuilding(ctx,480,650);fence(ctx,w)}
  }
  ground(ctx,w,indoor,402,theme);
  if(theme==='yard'){ctx.strokeStyle='#fae7b7';ctx.lineWidth=2;ctx.strokeRect(map?780:250,428,380,78);line(map?970:440,428,map?970:440,506,'#fae7b7',2);r(map?762:232,424,4,87,'#b7926d55')}
 }
 function background(ctx,theme,groundY=402){const source=surface('back:'+theme,960,600,c=>landscape(c,theme));
  if(groundY===402)blit(ctx,source);else{ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(source,0,0,480,201,0,groundY-402,960,402);const floor=surface('floor:'+theme,960,600,c=>ground(c,960,['home','lobby','city','province','national'].includes(theme),groundY,theme));blit(ctx,floor);ctx.restore()}return true;
 }
 function drawProp(ctx,name,x,y,w=120,h=120){ctx.save();ctx.translate(Math.round(x),Math.round(y));const {r,line,label,poly}=paint(ctx);const scale=Math.min(w/120,h/120);if(!['mat','door','gate','bench','table','desk','bed','shop'].includes(name))ctx.scale(scale,scale);
  if(name==='mat'){ctx.scale(w/660,h/151);r(-330,-151,660,151,'#867456');r(-330,-151,660,143,'#eee1b5');r(-323,-144,646,129,'#739789');r(-317,-138,634,117,'#5c8178');r(-313,-134,626,4,'#a2b5a0');r(-313,-25,626,4,'#a2b5a0');r(-2,-136,4,113,'#d8d8b3');ctx.strokeStyle='#e5dfb6';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-78,88,40,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++)r(-310+i*209,-142,8,125,'#bed0a010')}
  else if(name==='bench'){ctx.scale(w/150,h/60);for(const xx of [-53,44]){r(xx,-36,9,36,C.deep);r(xx-4,-4,17,4,C.deep)}for(let i=0;i<3;i++){r(-70,-58+i*10,140,8,C.wood);r(-68,-58+i*10,136,3,C.woodLight)}r(-76,-24,152,8,C.woodLight);r(-76,-16,152,4,C.wood);r(-70,-21,140,2,'#e0b67e')}
  else if(name==='door'){ctx.scale(w/86,h/164);r(-43,-164,86,164,C.wood);r(-36,-158,72,158,'#5c7a70');r(-30,-150,60,70,'#90aaa0');r(-25,-145,14,58,'#bed2b0');r(-31,-73,62,5,C.wood);r(23,-50,5,5,C.gold);r(-50,-5,100,7,'#dfc494')}
  else if(name==='gate'){ctx.scale(w/216,h/170);for(const xx of [-108,90]){r(xx,-160,18,160,'#adac91');r(xx-4,-168,26,10,'#e5d4a8');r(xx+3,-150,5,135,'#d4c6a2')}r(-89,-151,178,6,'#657f72');r(-89,-42,178,6,'#657f72');for(let xx=-83;xx<88;xx+=18)r(xx,-148,4,144,'#657f72');r(-89,-145,178,3,'#aec0a0');r(-3,-150,6,150,'#e5d6ad')}
  else if(['table','desk','bed'].includes(name)){ctx.scale(w/160,h/80);if(name==='bed'){r(-75,-50,150,40,'#e1c095');r(-75,-47,145,30,'#8e9f8a');r(-68,-45,45,25,'#f1dfba');r(-20,-46,88,8,'#b6c4a1');r(-77,-29,7,29,C.wood);r(67,-29,7,29,C.wood);r(-78,-55,156,7,C.wood)}else{r(-70,-44,10,44,C.wood);r(60,-44,10,44,C.wood);r(-82,-59,164,17,C.wood);r(-82,-64,164,7,C.woodLight);r(-78,-63,156,2,'#dfb67f');if(name==='desk'){r(-66,-40,132,28,'#ac825e');r(-29,-37,58,20,'#e6c58e');label('접수',0,-22,12,C.wood)}else{r(-20,-74,42,10,'#f0dfb5');for(let i=0;i<3;i++)r(-15,-72+i*3,30,1,'#a69d82')}}}
  else if(name==='board'){r(-45,-92,6,92,C.wood);r(39,-92,6,92,C.wood);r(-60,-124,120,93,C.wood);r(-55,-118,110,82,C.woodLight);r(-46,-109,49,58,'#f2ddb0');r(9,-108,34,36,'#d4c69b');for(let i=0;i<5;i++)r(-39,-96+i*8,33-i%2*9,2,'#aa8f70');r(-32,-106,5,5,'#bd7965');r(21,-105,5,5,C.gold);r(-66,-132,132,10,'#587a6c')}
  else if(name==='target'){r(-32,-50,8,50,C.wood);r(24,-50,8,50,C.wood);r(-43,-111,86,74,C.wood);r(-37,-105,74,62,'#e8c995');r(-25,-94,50,40,'#b97b62');r(-13,-83,26,18,'#efce94');r(-4,-78,8,8,'#6a7c64');r(-49,-115,98,6,C.woodLight)}
  else if(name==='plant'){r(-27,-40,54,35,'#a96f53');r(-31,-44,62,10,'#ce9770');r(-21,-29,42,3,'#c58c62');r(-4,-104,7,61,C.leafDark);for(const [xx,yy]of [[-28,-93],[2,-107],[-25,-67],[3,-79]]){r(xx,yy,27,11,C.leaf);r(xx+3,yy-5,20,8,C.leafLight)}}
  else if(name==='mailbox'){r(-5,-64,10,64,C.wood);r(-29,-113,58,47,'#af715c');r(-25,-110,50,10,'#d49a74');r(-21,-92,42,5,C.deep);r(-16,-77,32,4,'#e4c49b');r(25,-104,4,23,C.gold)}
  else if(name==='bike'){ctx.strokeStyle=C.deep;ctx.lineWidth=4;for(const xx of [-39,39]){ctx.beginPath();ctx.arc(xx,-23,21,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#acb79e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(xx,-23,16,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=C.deep;ctx.lineWidth=4}line(-39,-23,-15,-57,'#bd8163',4);line(-15,-57,7,-23,'#bd8163',4);line(-39,-23,7,-23,'#bd8163',4);line(7,-23,23,-62,'#bd8163',4);line(23,-62,39,-23,'#bd8163',4);r(-25,-63,25,5,C.deep);r(17,-70,20,4,C.deep)}
  else if(['press','machine','fusion'].includes(name)){r(-43,-6,86,6,C.deep);r(-37,-91,9,85,'#647d7c');r(28,-91,9,85,'#647d7c');r(-46,-104,92,14,'#91aaa0');r(-9,-89,18,40,'#b9c4ac');r(-31,-49,62,10,'#6b8c83');r(-43,-25,86,12,C.woodLight);r(38,-78,19,5,'#b97b62');r(51,-93,6,20,C.wood);r(-2,-27,22,4,'#ead6a4')}
  else if(name==='bag'){r(-25,-58,50,54,'#b37c5d');r(-21,-64,42,18,'#c9966d');r(-16,-41,32,23,'#d7ab7b');r(-12,-37,24,3,'#e6c38e');r(-15,-72,30,8,C.wood);r(-28,-51,5,37,C.wood);r(23,-51,5,37,C.wood);r(-4,-48,8,7,C.gold)}
  else if(name==='photo'){r(-33,-71,66,65,C.wood);r(-28,-66,56,55,'#e7c99f');r(-22,-60,44,43,'#96ad95');r(-15,-49,12,13,'#eac192');r(6,-50,12,14,'#d7ac83');r(-17,-36,17,14,'#bd7d69');r(3,-36,18,14,'#6c8b8b')}
  else if(name==='bus'){r(-4,-140,8,140,'#6e8073');r(-29,-149,58,62,'#f0d2a0');r(-23,-143,46,36,'#68897c');r(-17,-137,34,17,'#c6d5b2');r(-21,-117,42,5,C.wood);r(-14,-100,28,4,C.wood);r(-13,-131,4,4,C.deep);r(9,-131,4,4,C.deep)}
  else if(name==='shop'){building(ctx,0,w,'잡화점',{y:-h,h,shop:true})}
  ctx.restore();return true;
 }
 function prop(ctx,name,x,y,w=150,h=130){return drawProp(ctx,name,x,y,w,h)}
 function sprite(kind='hero',pose='idle',frame=0){kind=canonical(kind);return surface(`actor:${kind}:${pose}:${frame}`,80,104,ctx=>{
  const {r}=paint(ctx),[hair,shirt,pants,skin]=looks[kind]||looks.friend;ctx.translate(40,100);const step=pose==='walk'?(frame?4:-4):0,attack=pose==='attack',lean=attack?6:0;
  const block=(x,y,w,h,c)=>{r(x-2+lean,y-2,w+4,h+4,C.ink);r(x+lean,y,w,h,c)};
  block(-12,-24,10,18-Math.max(0,step),pants);block(3,-24,10,18+Math.min(0,step),pants);block(-15,-8-Math.max(0,step),15,6,'#e0cfab');block(2,-8+Math.min(0,step),16,6,'#e0cfab');r(-14,-3-Math.max(0,step),14,3,C.wood);r(3,-3+Math.min(0,step),14,3,C.wood);
  block(-16,-55,32,31,shirt);r(-14,-53,8,25,'#ffffff12');r(9,-50,5,25,'#263d4526');r(-10,-52,20,5,'#f0d6a5');r(-4,-47,8,13,'#e8c18d');r(-3,-47,6,8,shirt);r(-16,-29,32,4,pants);
  if(attack){block(-23,-47,9,23,shirt);block(14,-47,19,9,shirt);block(26,-47,10,9,skin)}else{block(-24,-52+step*.5,9,21,shirt);block(15,-52-step*.5,9,21,shirt);block(-23,-33+step*.5,8,9,skin);block(16,-33-step*.5,8,9,skin)}
  block(-18,-85,36,31,skin);r(-17,-62,34,7,'#d5a07b');r(-18,-81,4,15,'#f4cf9a');r(-13,-82,22,6,'#f6cf9b');r(16,-75,5,11,skin);
  if(kind==='hero'){block(-21,-91,42,12,hair);block(4,-81,24,5,hair);r(-17,-90,32,3,'#668197');r(-20,-80,7,10,hair);r(1,-88,6,5,'#d2b477')}
  else if(kind==='folder'){block(-21,-94,42,16,hair);r(-23,-82,46,5,'#9b8caa');r(-4,-99,8,5,'#e2cda8')}
  else if(kind==='uncle'){r(-21,-80,6,16,hair);r(15,-80,6,16,hair);r(-11,-87,22,5,'#ecc495')}
  else{block(-20,-91,40,13,hair);r(-21,-82,8,16,hair);r(14,-83,6,10,hair);if(kind==='rival'){r(-14,-97,9,7,hair);r(0,-99,9,9,hair);r(10,-95,8,5,hair)}if(kind==='friend'){block(-29,-81,8,24,hair);block(21,-81,8,24,hair)}}
  const eye=frame===2?2:5;r(-8,-73,4,eye,C.ink);r(8,-73,4,eye,C.ink);if(frame!==2){r(-8,-73,2,2,C.cream);r(8,-73,2,2,C.cream)}r(-12,-63,5,3,'#cd8b73');r(12,-63,5,3,'#cd8b73');r(1,-60,6,2,C.wood);
  if(['boss','champ','globe','alien_champ'].includes(kind)){r(-12,-76,28,7,C.ink);r(-8,-75,6,2,'#9eaba6')}if(kind==='neighbor'){r(-12,-77,12,10,C.ink);r(4,-77,12,10,C.ink);r(-10,-75,8,6,'#b3c6b1');r(6,-75,8,6,'#b3c6b1');r(0,-73,4,2,C.ink)}if(kind==='uncle')r(-5,-61,16,3,hair);
 })}
 function actor(ctx,x,y,kind='hero',walk=0,scale=1,facing=1,animation=null,now=0){const attack=animation&&((kind==='hero'&&animation.kind==='player-hit')||(['rival','minsu'].includes(kind)&&animation.kind==='enemy-hit'))&&now-animation.at<620;const pose=attack?'attack':walk?'walk':'idle',frame=walk?Math.floor(walk/125)%2:(now+x*17)%3700<120?2:0,im=sprite(kind,pose,frame);ctx.save();ctx.translate(Math.round(x/2)*2,Math.round(y/2)*2);ctx.scale(facing<0?-scale:scale,scale);ctx.fillStyle='#263f452b';ctx.fillRect(-23,-2,46,6);ctx.fillRect(-17,4,34,2);ctx.imageSmoothingEnabled=false;const bob=walk?(frame?0:2):0;ctx.drawImage(im,-40,-100-bob,80,104);ctx.restore();return true}
 function portrait(el,kind='hero'){
  if(!el)return;kind=canonical(kind);
  if(el.dataset.artCharacter!==kind){el.style.backgroundImage='';el.classList.remove('image-portrait');delete el.dataset.portraitStyle}
  el.dataset.artCharacter=kind;
  const usePortrait=()=>{if(el.dataset.artCharacter!==kind)return;el.style.backgroundImage=`url("${portraits.get(kind)}")`;el.dataset.portraitStyle='illustrated';el.classList.add('image-portrait')};
  if(portraits.has(kind)){usePortrait();return}
  if(!portraitImages.has(kind)){
   const image=new Image();
   const ready=new Promise(resolve=>{
    image.onload=()=>{
     const tile=document.createElement('canvas');tile.width=tile.height=192;const ctx=tile.getContext('2d');
     ctx.fillStyle='#eee4c8';ctx.fillRect(0,0,192,192);
     const wash=ctx.createRadialGradient(92,76,10,96,96,130);wash.addColorStop(0,'#fff8df');wash.addColorStop(1,'#d4dbb4');ctx.fillStyle=wash;ctx.fillRect(0,0,192,192);
     ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
     ctx.drawImage(image,63,5,134,134,0,0,192,192);portraits.set(kind,tile.toDataURL());resolve();
    };
    image.onerror=()=>{
     // A missing portrait keeps a readable, locally drawn character in the frame.
     const tile=document.createElement('canvas');tile.width=tile.height=192;const ctx=tile.getContext('2d');ctx.fillStyle='#e8dfbf';ctx.fillRect(0,0,192,192);ctx.drawImage(sprite(kind),6,0,29,30,0,0,192,192);portraits.set(kind,tile.toDataURL());resolve();
    };
    image.src=`assets/art/characters/${kind==='rival'?'minsu':Object.hasOwn(looks,kind)?kind:'friend'}/idle.png`;
   });
   portraitImages.set(kind,ready);
  }
  portraitImages.get(kind).then(usePortrait);
 }

 function map(ctx,a){const zone=Exploration.data();if(!zone)return false;const theme=zone.theme,w=zone.width,camera=Math.round((G.camera||0)/2)*2,objects=Exploration.objects(),near=G.state==='explore'?Exploration.nearest():null;
  const scene=surface('map:'+G.mapZone,w,600,c=>landscape(c,theme,w,{map:true}));blit(ctx,scene,-camera);
  const npc={minsu:'rival',doyun:'boss',neighbor:'neighbor',hana:'friend',uncle:'uncle',reception:'folder',spectator:'friend'};
  ctx.save();ctx.translate(-camera,0);
  for(const o of objects){if(o.x<camera-220||o.x>camera+1180)continue;if(o.type==='npc'){actor(ctx,o.x,430,npc[o.id]||'friend',0,.88,o.x<G.hero.x?1:-1,null,G.now);if(o.id==='reception')prop(ctx,'desk',o.x,440,170,75);if(o.id==='spectator')prop(ctx,'bench',o.x,428,140,60)}else{
   const name=({home:'door',lobby:'door',exit:'door',mail:'mailbox',notice:'board',bracket:'board',poster:'board',photo:'photo',training:'target',forge:'press',fusion:'press',score:'board',machine:'press',inspection:'desk',broadcast:'desk',cup:'desk'})[o.id]||o.id;
   const integrated=(theme==='alley'&&o.id==='home')||(theme==='center'&&o.id==='lobby')||(theme==='square'&&o.id==='shop');
   const size={door:[78,150],gate:[210,160],board:[113,137],bed:[160,75],table:[150,80],target:[94,129],bag:[68,84],bike:[126,106],mailbox:[63,105],plant:[75,115],press:[126,130],bench:[151,60],desk:[160,78],bus:[64,154],photo:[53,60]};const [pw,ph]=size[name]||[120,120];
   if(!integrated)prop(ctx,name,o.x,o.id==='photo'?279:theme==='home'?420:424,pw,ph);
  }
  const active=near?.id===o.id;if(o.type==='npc'){const {label}=paint(ctx);ctx.fillStyle='#243b43cf';const width=Math.max(40,o.name.length*12+16);ctx.fillRect(o.x-width/2,291,width,22);label(o.name,o.x,307,11,active?C.gold:C.cream)}
  if(active){const yy=o.type==='npc'?280:322,dy=Math.sin(G.now/230)*3;ctx.fillStyle=C.gold;ctx.fillRect(o.x-11,yy-22+dy,22,20);ctx.fillStyle=C.ink;ctx.font='800 12px monospace';ctx.textAlign='center';ctx.fillText('E',o.x,yy-7+dy);paint(ctx).poly([[o.x-4,yy-2+dy],[o.x+4,yy-2+dy],[o.x,yy+3+dy]],C.gold)}
  }
  actor(ctx,G.hero.x,440,'hero',G.hero.walk,1,G.hero.facing,null,G.now);
  const {label,r}=paint(ctx);for(const [id,x,arrow] of [[zone.left,86,'←'],[zone.right,w-86,'→']])if(id){r(x-76,493,152,29,'#334d4be6');r(x-72,496,144,2,'#8a9a77');label(`${arrow} ${Exploration.zones[id].name}`,x,512,12,C.cream)}
  ctx.restore();
  const prompt=document.getElementById('interaction-prompt');if(prompt){const value=near?`${near.name}|${near.type==='npc'?'이야기하기':near.type==='door'?'들어가기':near.type==='inspect'?'살펴보기':'이용하기'}`:'';if(prompt.dataset.value!==value){prompt.dataset.value=value;prompt.hidden=!near;if(near){prompt.querySelector('strong').textContent=near.name;prompt.querySelector('small').textContent=value.split('|')[1]}}}
  // Leaves cross the camera slowly; reduced motion leaves the scene still.
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){for(let i=0;i<7;i++){const x=(i*157+G.now/95)%1010-25,y=160+(i*71+G.now/160)%360;r(x,y,5,3,i%2?'#e5ca8b99':'#8ca57688')}}
  return true;
 }
 function title(ctx,now=0){if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)now=0;background(ctx,'yard');const {r,poly}=paint(ctx);r(0,402,960,149,'#dcb888');for(let i=0;i<75;i++)r((i*139)%960,412+(i*37)%133,3,2,i%3?'#b5926944':'#fae0a066');
  ctx.save();ctx.strokeStyle='#f6dfad';ctx.lineWidth=3;ctx.strokeRect(445,431,380,100);ctx.beginPath();ctx.ellipse(635,481,54,28,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  actor(ctx,560,461,'hero',0,1.45,1,null,now);actor(ctx,754,457,'rival',0,1.32,-1,null,now);actor(ctx,853,407,'friend',0,.74,-1,null,now);prop(ctx,'bench',850,421,125,50);folded(ctx,646,477,48,'newspaper',-.13);folded(ctx,700,488,42,'colored_paper',.19);
  for(let i=0;i<9;i++){const x=(i*137+now/150)%980,y=90+(i*67+now/300)%360;r(x,y,4,3,'#fff0c877')}
 }
 function folded(ctx,x,y,size,material='newspaper',angle=0,state='base',flip=1){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1,Math.max(.001,Math.abs(flip)));const {r,poly,line}=paint(ctx),h=size/2;const news=['newspaper','wet_newspaper','ragged','workbook','encyclopedia','certificate'].includes(material),gold=['diamond','copper','iron','uranium','quartz','glass'].includes(material),p= news?['#e7d6ac','#c5b78e','#f5e7c5','#a69e83']:gold?['#a4bcb5','#6f9391','#dce2c3','#526f74']:['#c97560','#dba867','#e9bf79','#9c604f'];
  r(-h+4,-h+6,size,size,'#273a4133');r(-h-2,-h-2,size+4,size+4,C.ink);r(-h,-h,size,size,state==='flipped'?p[1]:p[0]);poly([[-h,-h],[h,-h],[0,0]],p[2]);poly([[h,-h],[h,h],[0,0]],p[1]);poly([[h,h],[-h,h],[0,0]],p[0]);poly([[-h,h],[-h,-h],[0,0]],p[3]);
  if(news){ctx.save();ctx.globalAlpha=.45;for(let i=0;i<6;i++){r(-h+5,-h+5+i*size/8,size*.22,2,'#827d67');r(h*.2,h*.1+i*size/13,size*.23,2,'#827d67')}ctx.restore()}
  line(-h,-h,h,h,'#6c69564d',Math.max(1,size/60));line(h,-h,-h,h,'#6c69556e',Math.max(1,size/60));r(-h+2,-h+2,size-4,2,'#fff3ca77');if(state==='damaged'){line(h*.5,-h,h*.1,-h*.35,C.ink,2);line(h*.1,-h*.35,h*.25,0,C.ink,2)}ctx.restore();return true}
 function arena(ctx,region='village'){
  const theme=['continent','world','planet'].includes(region)?region:region==='national'?'national':'lobby';
  const scene=surface('arena:'+region,960,600,c=>{
   const {r,line,poly,label}=paint(c);sky(c,theme);
   const night=['world','planet','national'].includes(region);
   r(0,98,960,180,night?'#3d5360':'#a5afa0');
   for(const x of [35,280,675,920]){r(x,48,9,220,'#697f78');r(x+2,48,3,220,'#acbba0')}
   for(let row=0;row<2;row++){r(12,184+row*47,936,33,'#667c73');r(12,184+row*47,936,5,'#a7b399');for(let i=0;i<22;i++){
    const x=27+i*43,y=172+row*47;const shirt=['#b28570','#6f9190','#a6a177','#8a7d91'][i%4];
    r(x-9,y,19,15,shirt);r(x-7,y-17,15,17,'#e1b78b');r(x-8,y-19,17,6,i%3?'#5d5048':'#8b694d');r(x-2,y-10,2,2,C.ink);r(x+4,y-10,2,2,C.ink);
   }}
   r(290,47,380,60,C.wood);r(294,51,372,52,C.deep);r(300,55,360,2,'#839c8a');
   const names={village:'주민센터 컵',city:'지존시 지역구 예선',province:'도 딱지 선수권',national:'전국 딱지 선수권',continent:'대륙 딱지 선수권',world:'세계 딱지 선수권',planet:'은하 행성 대회'};
   label(names[region]||names.village,480,85,22,C.cream);
   for(let i=0;i<7;i++)poly([[320+i*48,110],[344+i*48,110],[332+i*48,132]],['#b77d67','#d5bb7d','#72988a'][i%3]);
   ground(c,960,true,278,theme);r(0,274,960,6,'#e9d6a6');
   for(const x of [26,911]){r(x,104,24,38,'#cfba83');r(x+4,108,16,24,C.cream);r(x+10,116,4,24,C.gold)}
   if(night){for(const x of [130,830]){poly([[x-5,0],[x+5,0],[x+94,272],[x-94,272]],'#f9e4b210');r(x-15,15,30,8,'#bcc7b0')}}
  });blit(ctx,scene);return true;
 }
 function hub(ctx,theme,places){
  const scene=surface('hub:'+theme,960,600,c=>{
   const {r,line,poly,label}=paint(c);sky(c,theme);ground(c,960,false,318,theme);
   if(theme==='continent'){for(let i=0;i<7;i++){const x=i*160;poly([[x-70,278],[x+15,153],[x+100,278]],'#a47f6d');poly([[x+1,176],[x+15,153],[x+31,176]],'#e8d8b3')}}
   if(theme==='world'||theme==='planet'){r(724,75,64,64,'#738f9e');r(716,83,80,48,'#738f9e');r(734,82,25,18,'#9bb5a3');r(762,107,27,13,'#9bb5a3');r(746,125,13,9,'#9bb5a3');line(698,126,808,96,'#d5c69b',4)}
   for(let i=0;i<places.length;i++){
    const place=places[i],x=place.x;
    if(i===0){prop(c,'bus',x,318,62,120);prop(c,'bench',x+64,319,100,42)}
    else building(c,x,158,place.name,{y:174,h:144,wall:['','#dac59b','#a6b4a2','#d5b58e'][i]||'#d5b58e',roof:theme==='planet'?'#7c6b86':theme==='world'?'#627f8c':'#a66f55'});
   }
   r(0,475,960,6,'#acb28c');for(let x=0;x<960;x+=80)r(x+12,510,34,3,'#e2cf9d88');
  });blit(ctx,scene);
  const tier=Tiers[theme],place=G.state==='explore'?tier.nearest():null;
  const prompt=document.getElementById('interaction-prompt');
  if(prompt){prompt.hidden=!place;if(place){const value=place.name+'|이용하기';if(prompt.dataset.value!==value){prompt.dataset.value=value;prompt.querySelector('strong').textContent=place.name;prompt.querySelector('small').textContent='이용하기'}}}
  if(G.state==='explore'){
   const round=tier.round(),opponent=tier.opponents()[round];
   for(const [id,value]of [['map-location',tier.name+' 경기장'],['map-objective',opponent?opponent.name+'에게 도전하자':tier.name+' 우승!'],['map-direction','공방과 훈련장에서 다음 승부를 준비하자']]){const el=document.getElementById(id);if(el&&el.textContent!==value)el.textContent=value}
  }
  return true;
 }
 return {manifest,ready:fontReady,loaded:()=>null,background,prop,actor,portrait,map,title,folded,arena,hub,style:'pixel-village',uiStyle:'illustrated-paper'};
})();
