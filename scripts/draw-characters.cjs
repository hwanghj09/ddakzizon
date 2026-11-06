'use strict';
// Rasterize the pose geometry directly onto a native 32x32 pixel grid.
// Run with: node scripts/draw-characters.cjs (Node's standard library only).
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.join(__dirname,'..'),out=path.join(root,'assets/art');
const looks={
 hero:       {hair:['#334d6d','#658fb4'],coat:['#c95748','#913e41','#eb7760'],trim:'#f5ce75',pants:['#34465e','#516b8b'],skin:'peach',head:'cap',outfit:'varsity',build:0},
 minsu:      {hair:['#854c31','#bd7f47'],coat:['#4b9067','#326250','#77af71'],trim:'#ead99c',pants:['#3c4d5e','#5a6777'],skin:'peach',head:'spikes',outfit:'polo',build:-1},
 boss:       {hair:['#302f40','#57516c'],coat:['#78518d','#4c386b','#a078ae'],trim:'#e0b36b',pants:['#39364d','#565269'],skin:'tan',head:'shades',outfit:'track',build:2},
 champ:      {hair:['#352e43','#675470'],coat:['#d5a94e','#936633','#f1ca74'],trim:'#ab4959',pants:['#3d3c58','#5b5671'],skin:'tan',head:'crown',outfit:'sash',build:1},
 friend:     {hair:['#5d3840','#a16959'],coat:['#d6ac61','#9e6c47','#f1cf83'],trim:'#cf7697',pants:['#9e516b','#c7778d'],skin:'light',head:'tails',outfit:'hoodie',build:-2},
 neighbor:   {hair:['#553e38','#89624f'],coat:['#4f839e','#345775','#7ea8b8'],trim:'#e5dfc0',pants:['#51484b','#736366'],skin:'warm',head:'glasses',outfit:'vest',build:2},
 uncle:      {hair:['#664538','#a2734f'],coat:['#bc864e','#87583e','#dcab65'],trim:'#f1ca88',pants:['#415a6d','#5f7d8a'],skin:'warm',head:'bald',outfit:'apron',build:3},
 sprinter:   {hair:['#3c3548','#64516a'],coat:['#c34e70','#893b5c','#e78090'],trim:'#f3e3ba',pants:['#6d3c60','#99587b'],skin:'peach',head:'band',outfit:'jersey',build:-1},
 folder:     {hair:['#614465','#976d9a'],coat:['#4c9485','#31675f','#82b4a0'],trim:'#e3ce8d',pants:['#394c6c','#617394'],skin:'light',head:'beanie',outfit:'pockets',build:0},
 globe:      {hair:['#96a4ad','#e2dfcb'],coat:['#4d78b2','#354e7c','#79a3cd'],trim:'#e6bf6e',pants:['#3c466a','#5a6c96'],skin:'tan',head:'visor',outfit:'armor',build:1},
 alien:      {hair:['#537446','#86ad67'],coat:['#8868a7','#5c4780','#b794c7'],trim:'#e9c96e',pants:['#4a415d','#6f5c84'],skin:'alien',head:'antenna',outfit:'harness',build:-1},
 alien_champ:{hair:['#537446','#86ad67'],coat:['#d1a34b','#916232','#efcc74'],trim:'#bd5972',pants:['#463b57','#695575'],skin:'alien',head:'antenna-visor',outfit:'regalia',build:2},
 teacher:    {hair:['#4a324a','#87586d'],coat:['#9b5167','#68394f','#c47c84'],trim:'#a9cdb9',pants:['#454052','#706176'],skin:'light',head:'bun',outfit:'cardigan',build:0},
 father:     {hair:['#46404b','#9e8a7d'],coat:['#957246','#634d3c','#c69a64'],trim:'#c3d1c0',pants:['#415975','#66859b'],skin:'warm',head:'stubble',outfit:'workwear',build:3},
 reception:  {hair:['#393149','#735a80'],coat:['#487d79','#305256','#7baaa2'],trim:'#edbb72',pants:['#3d4c65','#626e82'],skin:'peach',head:'bob',outfit:'lanyard',build:-1},
 gyugyeok:   {hair:['#33495e','#7192a3'],coat:['#62769a','#3e4f72','#9fb0c7'],trim:'#d9bd78',pants:['#394059','#656d88'],skin:'tan',head:'examiner',outfit:'measure',build:0},
 hangyeol:   {hair:['#ac7852','#f3d89b'],coat:['#667bb2','#414e84','#9fa4d5'],trim:'#e493b3',pants:['#3f436c','#6277a1'],skin:'warm',head:'quiff',outfit:'laurel',build:2},
 mujung:     {hair:['#443867','#9a79bd'],coat:['#6c4b8b','#44325d','#9b75b5'],trim:'#ec98c0',pants:['#373c5c','#5e5c84'],skin:'cosmic',head:'astral',outfit:'orbit',build:3}
};
const skinTones={
 peach:['#f0b888','#c98663','#ffdaac'],
 light:['#f4c5a1','#cc9178','#ffe0bd'],
 warm:['#e6ad83','#b7775b','#ffd0a0'],
 tan:['#d9a07b','#a56c5a','#f5bd91'],
 alien:['#a8c97a','#729650','#d0e7a0'],
 cosmic:['#93d5d4','#56979e','#d0f0de']
};

// Pose geometry is measured in half-pixels. Each pose plants a shoe at final y=30.
const posesByName={
 idle:{body:[32,32],head:[31,6],farLeg:[27,24,60],nearLeg:[36,38,60],farArm:[19,39,18,46],nearArm:[44,39,45,46]},
 'walk-a':{body:[31,31],head:[31,5],farLeg:[26,19,57],nearLeg:[34,43,60],farArm:[44,37,47,40],nearArm:[20,39,16,44]},
 'walk-b':{body:[33,33],head:[34,7],farLeg:[36,43,57],nearLeg:[30,21,60],farArm:[20,40,19,45],nearArm:[45,38,49,39]},
 attack:{body:[33,37],head:[36,14],farLeg:[29,19,60],nearLeg:[37,43,60],farArm:[20,44,20,50],nearArm:[45,43,53,45]}
};
const poses=Object.keys(posesByName);

// Geometry uses half-pixel coordinates on the final grid; sample pixel centers,
// without resizing a bitmap or blending palette colors.
function brush(pixels,originX=0,originY=0){
 function fill(x,y,width,height,color){
  const left=Math.max(0,Math.ceil((x+originX)/2-.5)),right=Math.min(32,Math.ceil((x+originX+width)/2-.5));
  if(left>=right)return;
  for(let row=Math.max(0,Math.ceil((y+originY)/2-.5));row<Math.min(32,Math.ceil((y+originY+height)/2-.5));row++)pixels[row].fill(color,left,right);
 }
 function shape(vertices,color){
  vertices=vertices.map(([x,y])=>[(x+originX)/2,(y+originY)/2]);
  const top=Math.ceil(Math.min(...vertices.map(([,y])=>y))-.5);
  const bottom=Math.ceil(Math.max(...vertices.map(([,y])=>y))-.5);
  for(let y=top;y<bottom;y++){
   const scan=y+.5,cuts=[];
   for(let i=0;i<vertices.length;i++){
    const [x1,y1]=vertices[i],[x2,y2]=vertices[(i+1)%vertices.length];
    if((y1>scan)!==(y2>scan))cuts.push(x1+(scan-y1)*(x2-x1)/(y2-y1));
   }
   cuts.sort((a,b)=>a-b);
   for(let i=0;i+1<cuts.length;i+=2){
    const left=Math.ceil(cuts[i]-.5),right=Math.ceil(cuts[i+1]-.5);
    if(y>=0&&y<32&&right>0&&left<32)pixels[y].fill(color,Math.max(0,left),Math.min(32,right));
   }
  }
 }
 function line(x1,y1,x2,y2,width,color){
  const length=Math.hypot(x2-x1,y2-y1),x=(y2-y1)*width/(2*length),y=(x1-x2)*width/(2*length);
  shape([[x1+x,y1+y],[x2+x,y2+y],[x2-x,y2-y],[x1-x,y1-y]],color);
 }
 return {fill,shape,line};
}

function drawLeg(pixels,[hip,foot,bottom],top,near){
 const {fill,shape}=brush(pixels,foot,bottom),drift=hip-foot;
 shape([[drift-4,top-bottom],[drift+5,top-bottom],[4,-5],[-4,-5]],'ink');
 shape([[drift-2,top-bottom],[drift+3,top-bottom],[2,-5],[-2,-5]],near?'pantsLight':'pants');
 fill(-2,-7,4,2,'trim');
 shape([[-5,-6],[2,-6],[4,-4],[7,-4],[8,-2],[8,0],[-5,0],[-6,-2]],'ink');
 fill(-4,-4,7,2,near?'coatDark':'pants');
 fill(2,-3,4,1,near?'coatLight':'trim');
 fill(-4,-2,11,1,'cream');
}

function drawArm(pixels,sx,sy,[ex,ey,hx,hy],near){
 const {fill,line}=brush(pixels);
 line(sx,sy,ex,ey,8,'ink');line(ex,ey,hx,hy,7,'ink');
 fill(hx-3,hy-3,7,7,'ink');
 line(sx,sy,ex,ey,5,near?'coat':'coatDark');line(ex,ey,hx,hy,4,'skinDark');
 fill(hx-2,hy-2,5,5,'skin');
 fill(hx-1,hy-2,3,1,'skinLight');
}

function drawCoat(pixels,x,y,look){
 const {fill,shape,line}=brush(pixels,x,y),w=look.build;
 shape([[-9-w,0],[9+w,0],[13+w,4],[11+w,14],[8+w,19],[-8-w,19],[-11-w,15],[-13-w,4]],'ink');
 shape([[-8-w,2],[8+w,2],[11+w,5],[9+w,14],[7+w,17],[-7-w,17],[-9-w,14],[-11-w,5]],'coat');
 shape([[7,3],[11+w,5],[9+w,14],[7+w,17],[-7-w,17],[-8-w,15],[5,13]],'coatDark');
 fill(-8,3,8,2,'coatLight');
 fill(-3,0,7,3,'skinDark');
 shape([[-6,1],[-1,4],[4,2],[7,2],[4,6],[0,7],[-5,5]],'trim');

 switch(look.outfit){
  case 'varsity':
   fill(0,6,2,11,'coatDark');fill(0,7,1,8,'trim');
   fill(-8,11,5,2,'coatDark');fill(-8,10,4,1,'coatLight');
   fill(5,7,4,4,'cream');fill(6,8,2,2,'trim');
   break;
  case 'polo':
   fill(1,5,2,7,'coatDark');fill(1,6,1,1,'cream');fill(1,9,1,1,'cream');
   fill(5,8,5,4,'coatLight');fill(6,11,4,1,'coatDark');
   break;
  case 'track':
   line(-9,5,-4,16,2,'trim');line(-7,5,-2,15,1,'coatLight');
   fill(3,7,6,1,'cream');fill(4,8,3,2,'trim');
   break;
  case 'sash':
   line(-9,14,8,3,5,'coatDark');line(-9,13,8,2,3,'trim');
   fill(4,4,4,3,'cream');fill(5,5,2,2,'coatLight');
   break;
  case 'hoodie':
   fill(-4,4,1,7,'cream');fill(4,4,1,6,'cream');fill(-5,10,2,2,'trim');
   shape([[-6,12],[6,12],[8,15],[-8,15]],'coatDark');fill(-4,13,8,1,'coatLight');
   break;
  case 'vest':
   shape([[-10,3],[-6,3],[0,8],[6,4],[10,4],[8,9],[0,13],[-8,9]],'coatDark');
   fill(-1,8,2,7,'trim');fill(-1,10,2,1,'cream');fill(5,9,5,2,'coatLight');
   break;
  case 'apron':
   fill(-7,4,2,8,'pants');fill(6,4,2,8,'pants');
   shape([[-7,8],[7,8],[8,17],[-8,17]],'pantsLight');
   fill(-6,8,2,2,'cream');fill(5,8,2,2,'cream');fill(-3,12,7,3,'pants');
   break;
  case 'jersey':
   fill(-10,6,20,2,'trim');fill(-8,10,3,6,'coatDark');
   fill(-1,9,6,2,'cream');fill(2,11,2,2,'cream');fill(1,13,2,3,'cream');
   break;
  case 'pockets':
   fill(-7,7,6,6,'coatDark');fill(3,7,6,6,'coatDark');
   fill(-7,7,6,1,'coatLight');fill(3,7,6,1,'coatLight');fill(4,9,4,2,'cream');
   break;
  case 'armor':
   fill(-9,5,4,7,'cream');fill(6,5,4,7,'cream');
   shape([[-4,6],[5,6],[7,9],[3,14],[-3,14],[-6,10]],'coatDark');
   fill(-2,8,6,4,'trim');fill(0,8,2,2,'cream');
   break;
  case 'harness':
   line(-8,4,-3,14,2,'trim');line(8,4,3,14,2,'trim');
   fill(-3,10,7,5,'coatDark');fill(-1,11,3,2,'cream');
   break;
  case 'regalia':
   shape([[-9,6],[-3,4],[0,8],[5,4],[9,6],[7,12],[0,15],[-7,12]],'trim');
   shape([[0,7],[4,10],[0,14],[-4,10]],'cream');fill(-1,9,3,3,'coatDark');
   break;
  case 'cardigan':
   shape([[-6,3],[6,3],[2,15],[-1,15]],'cream');
   line(-7,4,-2,15,2,'coatLight');line(7,4,3,15,2,'coatDark');
   fill(6,6,3,3,'trim');fill(7,7,1,1,'cream');fill(-7,13,3,1,'coatDark');
   break;
  case 'workwear':
   fill(-10,7,19,1,'coatLight');fill(-1,5,2,12,'coatDark');fill(0,6,1,8,'trim');
   fill(-8,9,6,5,'coatDark');fill(4,9,5,5,'coatDark');
   fill(-8,9,6,1,'coatLight');fill(4,9,5,1,'coatLight');fill(-6,11,2,1,'cream');
   break;
  case 'lanyard':
   shape([[-8,3],[0,6],[8,3],[7,7],[0,10],[-7,7]],'cream');
   line(-4,5,1,11,1,'trim');line(4,5,1,11,1,'trim');
   fill(-2,10,7,6,'coatDark');fill(-1,11,5,4,'cream');fill(0,12,3,1,'trim');
   break;
  case 'measure':
   shape([[-10,4],[-4,3],[0,8],[4,3],[10,4],[5,12],[0,15],[-6,11]],'coatDark');
   fill(-3,4,7,2,'cream');fill(0,6,2,7,'trim');fill(5,8,5,3,'coatLight');
   fill(6,9,1,1,'cream');fill(8,9,1,1,'cream');
   break;
  case 'laurel':
   shape([[-9,4],[-2,5],[4,3],[10,4],[8,8],[-7,8]],'coatLight');
   shape([[4,6],[5,9],[8,10],[5,11],[4,14],[3,11],[0,10],[3,9]],'cream');
   fill(3,9,3,2,'trim');fill(-8,12,5,2,'trim');
   break;
  case 'orbit':
   shape([[-12,4],[-8,5],[-4,10],[0,12],[4,10],[8,5],[12,4],[10,12],[0,17],[-10,12]],'coatDark');
   shape([[0,7],[5,11],[0,15],[-5,11]],'trim');fill(-2,10,4,3,'skinLight');
   fill(-10,7,3,2,'coatLight');fill(8,7,3,2,'coatLight');
   break;
 }
}

function drawHead(pixels,x,y,look,attacking){
 const {fill,shape,line}=brush(pixels,x,y);
 const alien=look.skin==='alien'||look.skin==='cosmic';
 if(look.head==='tails'){
  shape([[-12,10],[-18,13],[-19,23],[-16,29],[-12,27],[-11,18]],'ink');
  shape([[-12,13],[-16,15],[-17,23],[-15,26],[-13,23]],'hair');
  fill(-16,17,3,2,'hairLight');fill(-17,13,5,2,'trim');
  shape([[10,12],[16,14],[17,22],[14,27],[11,26],[11,17]],'ink');
  fill(13,15,2,8,'hair');fill(13,14,3,2,'trim');
 }
 shape([[-13,8],[-8,3],[6,2],[12,5],[15,10],[16,19],[13,25],[8,28],[1,29],[-7,27],[-12,23],[-15,17],[-15,12]],'ink');
 shape([[-11,9],[-7,5],[6,4],[11,7],[13,11],[14,18],[11,24],[7,26],[1,27],[-6,25],[-10,22],[-13,16],[-13,13]],'skin');
 shape([[-12,13],[-8,15],[-8,21],[-3,24],[8,24],[12,22],[10,25],[7,27],[0,28],[-7,26],[-11,23],[-14,17]],'skinDark');
 shape([[-7,8],[7,6],[11,10],[7,10],[-4,12],[-6,17],[-9,17],[-10,13]],'skinLight');
 fill(-12,16,4,4,'skinDark');fill(-12,16,2,2,'skinLight');

 switch(look.head){
  case 'cap':
   shape([[-15,13],[-14,6],[-10,2],[3,1],[11,4],[14,10],[20,11],[20,14],[11,16],[1,14],[-9,15]],'ink');
   shape([[-13,12],[-12,7],[-8,4],[3,3],[10,6],[12,10],[4,11],[-9,13]],'hair');
   shape([[-10,7],[-6,5],[3,4],[7,6],[-1,7],[-6,9]],'hairLight');
   fill(1,6,4,3,'trim');fill(2,7,2,1,'cream');
   shape([[1,12],[12,11],[19,12],[18,13],[11,14],[5,14]],'hairLight');
   break;
  case 'spikes':
   shape([[-15,15],[-14,8],[-11,5],[-9,0],[-5,3],[-2,0],[2,3],[7,1],[8,5],[13,5],[16,10],[15,14],[10,11],[6,15],[4,12],[0,15],[-4,11],[-9,18]],'ink');
   shape([[-13,14],[-12,8],[-8,5],[-8,2],[-5,5],[-2,2],[2,5],[6,3],[6,7],[11,6],[14,10],[12,11],[9,9],[6,13],[4,10],[0,13],[-4,9],[-9,15]],'hair');
   line(-9,8,-2,5,2,'hairLight');fill(2,6,4,2,'hairLight');
   break;
  case 'shades':
   shape([[-15,16],[-14,8],[-10,4],[-5,3],[-2,1],[9,2],[13,5],[15,11],[7,10],[2,14],[-6,12],[-9,18]],'ink');
   shape([[-13,14],[-12,8],[-8,5],[-3,5],[0,3],[8,4],[12,7],[11,8],[5,7],[0,12],[-6,10],[-9,15]],'hair');
   line(-9,8,5,5,2,'hairLight');fill(-5,9,5,1,'hairLight');
   break;
  case 'crown':
   fill(-11,9,6,7,'hair');
   shape([[-15,0],[-9,0],[-8,5],[-4,5],[-2,0],[3,0],[5,5],[8,5],[10,0],[15,0],[13,13],[-13,13]],'ink');
   shape([[-13,2],[-11,2],[-9,7],[-3,7],[-1,2],[2,2],[4,7],[9,7],[11,2],[13,2],[11,11],[-11,11]],'coat');
   fill(-10,9,21,2,'coatLight');fill(-2,6,4,4,'trim');fill(-1,6,2,2,'cream');
   break;
  case 'tails':
   shape([[-15,15],[-14,8],[-10,3],[-3,1],[7,2],[12,5],[15,11],[13,15],[8,11],[3,13],[-1,10],[-6,15],[-9,18]],'ink');
   shape([[-13,14],[-12,8],[-8,5],[-2,3],[6,4],[10,7],[12,12],[8,9],[3,11],[-1,8],[-6,12],[-9,16]],'hair');
   line(-9,8,3,5,2,'hairLight');fill(-12,13,4,2,'trim');
   break;
  case 'glasses':
   shape([[-15,16],[-14,7],[-11,3],[-6,2],[7,2],[13,5],[15,10],[13,13],[7,11],[3,13],[-5,11],[-9,17]],'ink');
   shape([[-13,14],[-12,7],[-8,4],[7,4],[11,6],[13,10],[10,11],[6,9],[2,11],[-5,9],[-9,14]],'hair');
   line(-9,7,7,5,2,'hairLight');fill(-10,9,6,1,'hairLight');
   break;
  case 'bald':
   shape([[-15,14],[-14,9],[-11,9],[-10,15],[-7,17],[-7,22],[-12,21],[-15,18]],'hair');
   fill(-12,12,2,4,'hairLight');
   fill(-5,6,8,2,'skinLight');fill(3,7,3,1,'skinLight');
   break;
  case 'band':
   shape([[-14,11],[-13,5],[-9,5],[-7,1],[-2,3],[3,0],[6,4],[11,3],[15,7],[15,13],[-12,15]],'ink');
   shape([[-12,10],[-11,7],[-8,7],[-6,3],[-2,5],[3,2],[6,6],[10,5],[13,8],[13,11]],'hair');
   line(-8,8,5,6,2,'hairLight');
   shape([[-14,11],[15,10],[15,14],[-13,15],[-16,19],[-21,20],[-19,16],[-14,13]],'trim');
   fill(-10,13,22,1,'coat');
   break;
  case 'beanie':
   shape([[-15,14],[-14,7],[-10,3],[-4,2],[-3,0],[3,0],[4,2],[10,3],[14,8],[15,13],[-7,16]],'ink');
   shape([[-13,13],[-12,8],[-8,5],[-2,4],[8,5],[12,9],[13,12],[-7,14]],'hair');
   fill(-2,1,5,3,'cream');
   line(-12,12,12,11,3,'hairLight');fill(-9,11,1,3,'trim');fill(5,10,1,3,'trim');
   break;
  case 'visor':
   shape([[-15,15],[-14,6],[-8,1],[7,1],[13,5],[16,12],[14,15],[-13,17]],'ink');
   shape([[-13,14],[-12,7],[-7,3],[6,3],[11,6],[13,11],[11,13],[-12,15]],'hair');
   line(-10,7,8,4,2,'hairLight');fill(-9,9,4,2,'cream');fill(9,7,2,3,'trim');
   break;
  case 'bun':
   shape([[-11,8],[-17,7],[-19,3],[-17,0],[-12,0],[-8,3],[-8,8]],'ink');
   shape([[-12,7],[-16,6],[-17,3],[-15,2],[-12,2],[-10,4]],'hair');
   fill(-16,3,3,1,'hairLight');fill(-11,4,2,3,'trim');
   shape([[-15,17],[-14,8],[-10,4],[1,2],[11,5],[15,10],[15,14],[9,11],[3,9],[-2,12],[-8,13],[-11,19]],'ink');
   shape([[-13,16],[-12,8],[-8,5],[1,4],[10,7],[13,11],[9,9],[3,7],[-3,10],[-8,11],[-11,16]],'hair');
   line(-10,8,0,5,2,'hairLight');fill(-12,19,2,3,'trim');
   break;
  case 'stubble':
   shape([[-15,16],[-14,8],[-10,4],[-3,2],[7,2],[14,6],[15,11],[11,12],[5,10],[0,12],[-7,11],[-9,19]],'ink');
   shape([[-13,14],[-12,8],[-9,6],[-3,4],[7,4],[12,7],[13,10],[8,8],[0,10],[-7,9],[-9,16]],'hair');
   line(-12,8,-8,13,2,'hairLight');fill(1,5,6,1,'hairLight');
   shape([[-8,19],[-5,22],[0,24],[7,24],[12,21],[10,26],[3,28],[-6,25]],'hairLight');
   break;
  case 'bob':
   shape([[-17,12],[-15,5],[-9,1],[-2,0],[7,2],[14,6],[17,14],[17,23],[12,25],[12,18],[10,12],[4,9],[-1,11],[-7,15],[-8,23],[-15,25],[-17,21]],'ink');
   shape([[-15,12],[-13,6],[-8,3],[-2,2],[6,4],[12,7],[15,14],[15,22],[13,23],[13,15],[9,10],[4,7],[-2,9],[-8,13],[-10,22],[-14,23]],'hair');
   line(-12,8,-2,4,2,'hairLight');fill(-12,11,3,2,'trim');fill(-11,11,1,1,'cream');
   break;
  case 'examiner':
   shape([[-15,16],[-15,8],[-11,3],[-2,0],[8,1],[14,6],[15,13],[11,11],[6,8],[3,12],[-3,9],[-9,14],[-10,18]],'ink');
   shape([[-13,14],[-13,8],[-9,4],[-2,2],[7,3],[12,7],[13,10],[7,6],[3,10],[-3,7],[-9,12]],'hair');
   line(-9,8,-3,4,2,'hairLight');line(2,4,9,6,1,'hairLight');
   break;
  case 'quiff':
   shape([[-15,17],[-15,10],[-13,6],[-9,4],[-7,1],[1,0],[12,1],[10,5],[17,5],[15,10],[11,12],[5,10],[0,14],[-6,12],[-9,18]],'ink');
   shape([[-13,15],[-13,10],[-10,7],[-7,6],[-5,3],[1,2],[9,3],[7,7],[14,7],[11,10],[6,8],[0,12],[-6,10],[-9,15]],'hair');
   line(-10,9,3,4,2,'hairLight');line(0,8,11,7,2,'hairLight');
   fill(-7,16,2,2,'trim');
   break;
  case 'astral':
   shape([[-15,16],[-19,8],[-17,0],[-13,2],[-11,8],[-6,6],[-2,3],[3,4],[7,6],[11,2],[15,0],[17,6],[15,13],[11,12],[6,10],[2,12],[-4,10],[-10,13]],'ink');
   shape([[-15,13],[-17,8],[-16,3],[-14,4],[-12,10],[-7,8],[-2,5],[3,6],[7,8],[12,4],[14,3],[15,6],[13,11],[10,10],[6,8],[2,10],[-4,8],[-10,11]],'hair');
   fill(-15,5,2,2,'hairLight');fill(12,5,2,2,'hairLight');fill(-1,7,4,2,'trim');fill(0,6,2,1,'cream');
   break;
  default:
   line(-9,8,-14,3,3,'ink');line(9,7,12,2,3,'ink');
   fill(-16,1,5,4,'ink');fill(-15,2,3,2,'trim');fill(10,0,5,4,'ink');fill(11,1,3,2,'trim');
   fill(-8,7,7,2,'skinLight');fill(-12,12,2,2,'hairLight');fill(11,11,2,2,'hair');
   if(look.head==='antenna-visor'){fill(-8,10,21,3,'coatDark');fill(-5,10,16,1,'coatLight');fill(5,10,3,2,'trim')}
 }

 if(['shades','crown','visor','antenna-visor'].includes(look.head)){
  shape([[-7,14],[15,13],[15,17],[11,21],[5,20],[3,18],[0,21],[-5,20],[-7,18]],'ink');
  line(-4,16,1,15,1,'hairLight');line(7,16,12,15,1,look.head==='visor'?'trim':'hairLight');
  fill(7,17,2,1,'cream');
 }else if(look.head==='astral'){
  shape([[-8,13],[-2,14],[2,18],[-2,21],[-7,19]],'ink');
  shape([[6,16],[12,12],[15,14],[12,20],[7,21]],'ink');
  shape([[-7,15],[-2,16],[0,18],[-3,19],[-6,18]],'trim');
  shape([[7,17],[12,14],[13,15],[11,18],[7,19]],'trim');
  fill(-5,16,2,1,'cream');fill(10,15,2,1,'cream');
 }else{
  fill(-2,15,3,attacking?2:4,'ink');fill(8,14,3,attacking?2:4,'ink');
  if(!attacking){fill(-2,15,1,1,'cream');fill(8,14,1,1,'cream')}
  if(look.head==='glasses'||look.head==='examiner'){
   for(const eye of [-4,6]){
    fill(eye,13,7,1,'ink');fill(eye,19,7,1,'ink');
    fill(eye,14,1,5,'ink');fill(eye+6,14,1,5,'ink');
   }
   fill(3,16,3,1,'ink');
   if(look.head==='examiner'){fill(-3,14,3,1,'cream');fill(7,14,3,1,'cream')}
  }else if(alien){
   fill(-4,18,3,1,'hairLight');fill(9,18,3,1,'hairLight');
  }
 }
 fill(4,19,3,2,'skinDark');fill(4,19,2,1,'skinLight');
 if(look.head==='bald'){
  shape([[-3,22],[1,20],[4,21],[7,20],[10,22],[9,24],[4,23],[-2,24]],'hair');
 }else if(attacking)fill(2,23,6,2,'ink');
 else{
  fill(2,23,5,1,'skinDark');fill(3,23,3,1,'ink');
  fill(-7,20,3,1,'skinDark');
 }
 fill(0,25,6,1,'skinLight');
}

function drawing(who,pose){
 const look=looks[who],design=posesByName[pose],pixels=Array.from({length:32},()=>Array(32).fill(null));
 const [x,y]=design.body,[hx,hy]=design.head;
 const [hair,hairLight]=look.hair,[coat,coatDark,coatLight]=look.coat;
 const [pants,pantsLight]=look.pants,[skin,skinDark,skinLight]=skinTones[look.skin];
 const palette={ink:'#282b3a',cream:'#f7e9ca',hair,hairLight,coat,coatDark,coatLight,pants,pantsLight,skin,skinDark,skinLight,trim:look.trim};
 const nearShoulder=(9+look.build)*(pose==='walk-a'?-1:1);
 drawLeg(pixels,design.farLeg,y+12,false);
 drawLeg(pixels,design.nearLeg,y+12,true);
 drawArm(pixels,x-nearShoulder,y+4,design.farArm,false);
 drawCoat(pixels,x,y,look);
 drawArm(pixels,x+nearShoulder,y+4,design.nearArm,true);
 drawHead(pixels,hx,Math.max(0,hy-Math.max(0,look.build)),look,pose==='attack');
 if(look.head==='examiner'&&pose!=='attack'){
  const {fill}=brush(pixels,design.nearArm[2]+2,design.nearArm[3]);
  fill(0,-7,4,13,'ink');fill(1,-6,2,11,'trim');
  for(const tick of [-4,-1,2])fill(2,tick,1,1,'coatDark');
 }
 if(pose==='attack'){
  const {fill,shape}=brush(pixels,54,44);
  shape([[0,-3],[5,-4],[6,1],[1,4],[-1,2]],'ink');
  shape([[0,-2],[4,-3],[5,1],[1,3],[0,2]],'trim');
  fill(2,-1,2,1,'cream');fill(2,0,1,1,'coatDark');
 }
 const rgba=Object.fromEntries(Object.entries(palette).map(([name,hex])=>[name,[...Buffer.from(hex.slice(1),'hex'),255]]));
 return pixels.map(row=>row.map(color=>rgba[color]||[0,0,0,0]));
}
function crc32(data){let crc=0xffffffff;for(const b of data){crc^=b;for(let k=0;k<8;k++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1}return (crc^0xffffffff)>>>0}
function chunk(type,data){const tag=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([tag,data])));return Buffer.concat([len,tag,data,crc])}
function png(pixels){
 const header=Buffer.alloc(13);header.writeUInt32BE(pixels[0].length,0);header.writeUInt32BE(pixels.length,4);header[8]=8;header[9]=6;
 const bytes=Buffer.from(pixels.flatMap(row=>[0,...row.flat()]));
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(bytes)),chunk('IEND',Buffer.alloc(0))]);
}
function generate(){
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
 for(const who of Object.keys(looks))for(const pose of poses){
  const key=`characters/${who}/${pose}`,file=path.join(out,key+'.png');
  const pixels=drawing(who,pose);
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,png(pixels));
  const points=pixels.flatMap((row,y)=>row.flatMap((p,x)=>p[3]?[[x,y]]:[]));
  manifest[key]={src:`assets/art/${key}.png`,size:[32,32],bounds:[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0]))+1,Math.max(...points.map(p=>p[1]))+1],anchor:[16,30]};
 }
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(root,'art-manifest.js'),"'use strict';\nwindow.ART_MANIFEST="+JSON.stringify(manifest)+';\n');
 console.log(`Drew ${Object.keys(looks).length} characters / ${Object.keys(looks).length*poses.length} 32x32 RGBA frames`);
}
if(require.main===module)generate();
module.exports={looks,poses,drawing,png};
