'use strict';
/* Layered procedural scenery: no external artwork or fonts required. */
const MapRenderer={
 arena(ctx,a,region){
  const {rect:r,text:t,line:l,actor}=a,village=region==='village',city=region==='city',province=region==='province',national=region==='national';
  r(0,0,960,600,national?'#193542':province?'#879a91':city?'#c1c7ad':'#a8bdb0');
  r(0,270,960,330,village?'#b5aa87':'#a49c81');
  if(village){r(245,90,470,180,'#c7c9ae');r(232,78,496,18,'#688a7e');for(let i=0;i<5;i++){r(270+i*85,140,60,70,'#769995');r(275+i*85,145,22,60,'#a1bdb0')}r(240,115,480,40,'#a76d51');t(G.profile.round===2?'주민센터 컵 · 결승':'세계로 가는 첫걸음',480,142,22,'#f5e2b6','center');for(let i=0;i<(G.profile.round===2?10:6);i++)actor(215+i*57,267,'friend',0,.65,i%2?1:-1)}
  else{
   for(let x=20;x<960;x+=150){r(x,80,12,190,province?'#4a6869':'#708d85');if(province){l(x,90,x+138,250,'#52716f',6);l(x,250,x+138,90,'#52716f',6)}else{r(x+25,120,90,90,national?'#5c8a90':'#a3bdb0')}}
   for(let row=0;row<(national?3:2);row++){r(40,155+row*42,880,6,'#4b706c');for(let i=0;i<18;i++)actor(60+i*49,154+row*42,'friend',0,.4,i%2?1:-1)}
   r(290,65,380,55,national?'#102c39':'#335a5b');t(national?'전국 딱지 선수권':province?'압축 챔피언십':'지존시 · 지역구 예선',480,101,24,'#f0dd9d','center');
   if(national){r(37,75,168,52,'#102c39');t('LIVE  •  전국 중계',121,106,15,'#d6b883','center');r(745,72,175,60,'#102c39');t('선수권 FINAL',832,108,16,'#9dcac7','center')}
   if(city){r(32,81,170,63,'#47645d');t('수동 점수판',117,104,13,'#eee0b9','center');t(`${G.round}  :  ${G.round}`,117,132,21,'#eed68e','center')}
   if(province){for(const x of [45,805]){r(x,95,15,155,'#486a68');r(x+90,95,15,155,'#486a68');r(x,95,105,18,'#6d8b80');r(x+45,112,15,65,'#adb8a4');r(x+15,177,80,16,'#6d8b80')}}
  }
  r(20,272,920,6,'#e0cda0');for(let x=0;x<960;x+=80)l(x,280,x+65,600,'#787e6a44',1);
 },
 draw(ctx,a){
  const {rect:r,text:t,line:l,tree,actor,paper}=a,z=Exploration.data(),theme=z.theme,w=z.width,camera=G.camera||0,p=G.profile;
  const indoor=['home','lobby','city','province','national'].includes(theme),night=theme==='national';
  r(0,0,960,600,night?'#182c3a':indoor?'#b8b59c':'#b5cfc7');
  if(!indoor){
   r(0,165,960,150,'#90af94');for(let i=0;i<15;i++){const x=i*110-(camera*.22)%110;r(x,155-i%3*19,94,165,['#86a894','#95b19b','#74998b'][i%3]);r(x+13,171-i%3*19,22,11,'#bed0b5')}
   for(let i=0;i<5;i++){const x=i*280-(camera*.12)%280;r(x,92+i%2*22,95,10,'#e7e7c8');r(x+18,82+i%2*22,50,12,'#e7e7c8')}
  }
  ctx.save();ctx.translate(-camera,0);
  r(0,402,w,198,indoor?'#baa27b':theme==='yard'?'#c7b080':'#858e86');r(0,403,w,8,'#e6d5ad');r(0,463,w,137,indoor?'#9c896c':theme==='yard'?'#b59c74':'#626f6b');
  for(let x=0;x<w;x+=96){l(x,411,x,461,'#c0b89c66',1);if(indoor)l(x,463,x+70,600,'#706f5c44',1);else r(x+20,515,45,3,'#c4c5ab')}
  const sign=(name,x,y,width=180,color='#254b4d')=>{r(x-width/2,y,width,35,color);r(x-width/2+4,y+4,width-8,1,'#d4dec755');t(name,x,y+23,14,'#f7e6bd','center')};
  const door=(x,y=300)=>{r(x-30,y,60,105,'#65796d');r(x-25,y+5,50,100,'#354f4d');r(x+13,y+60,4,4,'#e5bd67');r(x-37,402,74,9,'#d6c9a6')};
  const window=(x,y,ww=65,hh=65)=>{r(x-4,y-4,ww+8,hh+8,'#e3d5b0');r(x,y,ww,hh,'#759b9c');r(x+4,y+4,ww/2-6,hh-8,'#a4c6be');r(x+ww/2,y,3,hh,'#e4d6b4')};
  const building=(x,width,name,color='#cbbf99',roof='#5a7a71',y=200)=>{r(x-width/2+9,y+12,width,202,'#405f5833');r(x-width/2,y,width,402-y,color);r(x-width/2-10,y-16,width+20,20,roof);r(x-width/2,y+5,width,8,'#f0dfb755');sign(name,x,y+20,Math.min(width-20,210));door(x);if(width>200){window(x-width/2+20,y+83,42,55);window(x+width/2-62,y+83,42,55)}};
  const bench=x=>{r(x-55,365,110,8,'#986f4f');r(x-55,344,110,16,'#ac8960');r(x-44,373,8,30,'#48665e');r(x+37,373,8,30,'#48665e')};
  const board=(x,name)=>{r(x-53,280,7,124,'#566f68');r(x+47,280,7,124,'#566f68');r(x-70,235,140,104,'#8a7d5b');r(x-75,224,150,14,'#456e86');r(x-58,245,116,79,'#eee0b9');t(name,x,267,13,'#31514d','center');for(let i=0;i<4;i++)r(x-43,280+i*9,86-i%2*25,3,'#9b9c7a')};
  const target=x=>{r(x-35,350,70,55,'#65796b');r(x-29,354,58,45,'#e9d6a5');r(x-19,364,38,25,'#b66f55');r(x-9,370,18,13,'#edcf80')};
  if(theme==='home'){
   r(0,95,w,307,'#a8b6a0');r(0,101,w,8,'#d6d4b1');window(570,155,160,115);r(52,325,125,75,'#80745b');r(45,310,140,40,'#d7c9a3');r(50,310,40,25,'#eee3c6');r(233,200,75,67,'#776448');r(239,206,63,55,'#e5d7b0');actor(254,252,'hero',0,.35);actor(282,252,'neighbor',0,.4);
   if(p.round===3){r(320,200,67,80,'#8a7043');r(326,206,55,68,'#e9dbac');t('표창장',353,230,11,'#4e6357','center');r(342,241,22,22,'#c1a051')}
   const trophies=Number(p.cityRound===3)+Number(p.provinceRound===3)+Number(p.nationalRound===3);for(let i=0;i<trophies;i++){r(790+i*45,227,25,22,'#ddbb65');r(801+i*45,249,4,18,'#e5ca7d');r(794+i*45,267,20,4,'#a38549')}r(780,276,160,7,'#746f53');
   r(358,335,132,14,'#896e4e');r(370,349,9,53,'#7c6d51');r(468,349,9,53,'#7c6d51');r(392,324,65,9,'#ece0c0');for(let i=0;i<4;i++)r(398,326+i,40,1,'#989b83');r(505,360,35,42,'#8c7c58');target(720);r(944,363,36,40,'#b88657');r(950,357,22,8,'#7a674c');door(1180);sign('집으로 돌아온 한 장',430,112,260);
  }else if(theme==='alley'){
   for(let x=0;x<w;x+=280){r(x,293,270,110,'#b6b69a');r(x-2,284,275,12,'#798c7b');for(let y=310;y<400;y+=25)l(x,y,x+270,y,'#949e8677',2)}
   building(300,280,'우리 집','#c8c2a1','#68877c',180);building(930,300,'앞집','#d1bc98','#a77e5d',210);r(609,130,12,273,'#707d73');l(0,134,w,163,'#4f6862',2);l(0,148,w,177,'#4f6862',1);r(633,326,36,28,'#a96350');r(648,354,5,50,'#586c60');r(644,334,21,3,'#e9d7a8');
   r(877,369,46,34,'#a87856');tree(880,310,.43);for(const x of [80,122]){ctx.strokeStyle='#465e59';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,386,19,0,Math.PI*2);ctx.stroke()}l(80,386,102,356,'#b88758',4);l(102,356,122,386,'#b88758',4);l(80,386,122,386,'#b88758',3);
  }else if(theme==='square'){
   building(320,300,'종이 잡화점','#dfc48b','#aa8e59',210);for(let i=0;i<10;i++)r(160+i*32,271,32,29,i%2?'#f1d896':'#c39c57');board(750,'주민센터 컵');bench(875);building(1150,230,'압축기 작업대','#98aaa0','#5e7c75',240);r(1075,320,16,83,'#49656a');r(1210,320,16,83,'#49656a');r(1080,321,140,12,'#91aca1');r(1136,294,15,37,'#b96b51');r(1115,290,58,8,'#c97454');building(1550,260,'훈련장','#b3bc9c','#627e6c',215);target(1480);building(1800,190,'제련소','#9ba7a0','#697e78',240);r(1920,317,150,80,'#849087');for(let i=0;i<5;i++)r(1930+i*27,334,17,13,i%2?'#4f625b':'#e2c878');sign('융합기 · 공사 중',1980,285,155);tree(550,272,1.2);
  }else if(theme==='center'){
   building(700,390,'뒤집마을 주민센터','#c2c8b1','#547c7c',153);window(535,234,75,42);window(790,234,75,42);sign(p.round===3?'우리 마을 챔피언 탄생!':'세계로 가는 첫걸음',700,112,390,p.round===3?'#a07843':'#a76651');board(380,'참가 안내');bench(1040);r(1215,256,190,15,'#587c79');r(1222,271,7,133,'#536f6b');r(1390,271,7,133,'#536f6b');bench(1310);sign('시외 정류장',1310,216,190);r(1345,286,40,52,'#e8dbb7');t('무료',1365,317,12,'#456259','center');
   for(let i=0;i<(p.round===3?7:p.round+2);i++)actor(820+i*43,399,'friend',0,.63,i%2?1:-1);
  }else if(theme==='schoolfront'||theme==='yard'){
   for(let x=0;x<w;x+=250){r(x,246,230,158,'#b9bca0');r(x,236,230,13,'#637e74')}
   if(theme==='schoolfront'){board(400,'마을 딱지 대회');r(740,218,24,187,'#65867b');r(938,218,24,187,'#65867b');r(735,201,232,22,'#54766f');sign('지존초등학교',850,158,230);for(let i=0;i<7;i++)r(768+i*24,292,5,110,'#8e9b87');tree(1180,270,1.4)}else{
    r(200,145,1100,205,'#cbd0ad');r(185,128,1130,20,'#6d9183');for(let i=0;i<13;i++){window(225+i*80,184,51,44);window(225+i*80,260,51,44)}sign('지 존 초 등 학 교',740,112,240);bench(520);door(100);r(790,413,370,42,'#d4bc89');l(790,414,1160,414,'#f5e7bd',3);l(790,456,1160,456,'#f5e7bd',3);l(790,414,790,456,'#f5e7bd',3);l(1160,414,1160,456,'#f5e7bd',3);paper(1010,425,22,'red',.2);tree(1390,260,1.5);
   }
  }else{
   const steel=theme==='province',led=theme==='national';r(0,110,w,290,led?'#304c58':steel?'#92a49b':'#c3c6ac');for(let x=30;x<w;x+=180){r(x,115,12,285,steel?'#5e7775':'#81998b');if(steel){l(x,150,x+175,340,'#607c77',7);l(x,340,x+175,150,'#607c77',7)}else window(x+35,165,100,80)}
   if(theme==='lobby'){sign('주민센터 컵 · 선수 접수',700,150,330);door(100);board(390,'대진표');r(615,348,170,54,'#907a56');r(615,343,170,9,'#d0b68a');bench(1030)}else{
    sign(led?'전국 딱지 선수권':steel?'압축 챔피언십':'지존시 지역구 예선',w/2,112,430,led?'#182f3c':'#476c68');
    for(const o of z.objects){if(['bus','training','press','cup'].includes(o[0])){sign(o[1],o[2],280,180);if(o[0]==='bus')door(o[2]);else if(o[0]==='training'){r(o[2]-70,380,140,23,'#648f83');target(o[2])}else {r(o[2]-65,357,130,46,'#7e8270');r(o[2]-70,348,140,12,'#d3c099')}}}
    if(led){r(1725,293,110,110,'#68838b');r(1742,309,76,55,'#172e39');t('검사 완료',1780,342,12,'#bbd9b2','center');r(1960,337,130,66,'#435e68');r(1980,315,40,22,'#1c3946');r(2030,315,40,22,'#1c3946');sign('LIVE',2020,272,105,'#9f5c4e')}
    else if(steel){r(1690,202,22,200,'#567470');r(1830,202,22,200,'#567470');r(1690,202,162,25,'#728f86');r(1764,226,18,74,'#b3c0ac');r(1715,298,115,20,'#6f8e84');sign('안전선 밖에서 관람',1770,155,200)}else board(1530,'수동 점수판');
   }
  }
  for(const o of Exploration.objects()){
   if(o.type==='npc')actor(o.x,438,({minsu:'rival',doyun:'boss',neighbor:'neighbor',hana:'friend',uncle:'uncle',reception:'folder',spectator:'friend'})[o.id],0,.95,o.x<G.hero.x?1:-1);
   if(G.state==='explore'){const near=Exploration.nearest()?.id===o.id;r(o.x-9,326,18,18,near?'#e9c77c':'#345f5677');t(o.type==='npc'?'…':o.type==='door'?'↗':'·',o.x,340,14,near?'#294d49':'#e7dcba','center')}
  }
  if(z.left){sign('← '+Exploration.zones[z.left].name,130,463,200);r(125,498,6,40,'#455f54')}if(z.right){sign(Exploration.zones[z.right].name+' →',w-140,463,210);r(w-145,498,6,40,'#455f54')}
  actor(G.hero.x,440,'hero',G.hero.walk,1,G.hero.facing);
  const nearest=G.state==='explore'?Exploration.nearest():null;if(nearest){const x=Math.max(camera+170,Math.min(camera+790,nearest.x));sign(G.coach,x,235,Math.max(240,G.coach.length*10+24),'#1c3a3bef')}
  ctx.restore();
  // Foreground curb remains separate from the walkable lane.
  r(0,578,960,22,indoor?'#5b6659':'#435e55');r(0,578,960,3,'#91a18b');
 }
};
