'use strict';
// ImageGen atlas -> separate low-resolution, limited-palette backgrounds.
// Props are drawn directly on a 32x32 grid, never sampled from old illustrations.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {png}=require('./draw-characters.cjs'),root=path.join(__dirname,'..'),out=path.join(root,'assets/art');
const names=['yard','home','alley','square','center','lobby','schoolfront','classroom','gazebo','city','province','national','continent','world','planet','village'];
const horizons=[121,125,128,126,124,121,124,132,122,121,120,122,121,120,116,121];
const source=path.join(out,'sources/world-atlas.png');
const [sourceWidth,sourceHeight]=execFileSync('magick',['identify','-format','%w %h',source],{encoding:'utf8'}).trim().split(' ').map(Number);
if(sourceWidth%4||sourceHeight%4)throw Error('The world atlas must contain an exact 4x4 grid');
const cellWidth=sourceWidth/4,cellHeight=sourceHeight/4;
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
function save(key,pixels,extra){
 const file=path.join(out,key+'.png');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,png(pixels));
 manifest[key]={src:`assets/art/${key}.png`,size:[pixels[0].length,pixels.length],...extra};
}
for(const [index,name]of names.entries()){
 const x=(index%4)*cellWidth,y=Math.floor(index/4)*cellHeight;
 const raw=execFileSync('magick',[source,'-crop',`${cellWidth}x${cellHeight}+${x}+${y}`,'+repage','-filter','point','-resize','240x160!','+dither','-colors','48','-depth','8','RGBA:-'],{maxBuffer:1024*1024});
 const pixels=Array.from({length:160},(_,y)=>Array.from({length:240},(_,x)=>[...raw.subarray((y*240+x)*4,(y*240+x+1)*4)]));
 const sky='#'+pixels[0][0].slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('');
 save('backgrounds/'+name,pixels,{horizon:horizons[index],sky});
}
const palette={ink:'#283b3d',deep:'#3d5553',wood:'#916342',woodDark:'#63482f',woodLight:'#be8b54',gold:'#e1b95d',cream:'#efe0b2',paper:'#fff0c7',teal:'#528a81',tealLight:'#81b4a0',blue:'#548596',glass:'#9ccdc3',green:'#547d4d',leaf:'#87a85e',red:'#bb6451',light:'#edb48b'};
function prop(name,draw){
 const pixels=Array.from({length:32},()=>Array.from({length:32},()=>[0,0,0,0]));
 const rect=(x,y,w,h,c)=>{const rgb=palette[c]||c,rgba=[...rgb.slice(1).match(/../g).map(h=>parseInt(h,16)),255];for(let yy=Math.max(0,y);yy<Math.min(32,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(32,x+w);xx++)pixels[yy][xx]=rgba};
 const box=(x,y,w,h,c)=>{rect(x,y,w,h,'ink');rect(x+1,y+1,w-2,h-2,c)};
 const line=(x,y,x2,y2,c)=>{const n=Math.max(Math.abs(x2-x),Math.abs(y2-y));for(let i=0;i<=n;i++)rect(Math.round(x+(x2-x)*i/(n||1)),Math.round(y+(y2-y)*i/(n||1)),1,1,c)};
 const disc=(cx,cy,r,c)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)rect(cx+x,cy+y,1,1,c)};
 draw({r:rect,b:box,l:line,d:disc});
 const points=pixels.flatMap((row,y)=>row.flatMap((p,x)=>p[3]?[[x,y]]:[]));
 const bounds=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0]))+1,Math.max(...points.map(p=>p[1]))+1];
 save('props/'+name,pixels,{bounds,anchor:[16,30]});
}
prop('bed',({r,b})=>{b(2,14,28,13,'wood');b(3,16,26,8,'cream');b(5,15,8,5,'paper');r(14,16,14,7,'teal');r(14,17,14,2,'tealLight');b(3,25,3,5,'woodDark');b(26,25,3,5,'woodDark')});
prop('table',({r,b})=>{b(5,17,4,13,'woodDark');b(23,17,4,13,'woodDark');b(2,12,28,7,'wood');r(4,13,24,2,'woodLight');b(10,9,12,4,'paper');r(12,10,6,1,'woodLight')});
prop('target',({r,b})=>{b(6,23,4,7,'woodDark');b(22,23,4,7,'woodDark');b(3,4,26,22,'wood');b(5,6,22,18,'cream');b(9,9,14,12,'red');b(13,12,6,6,'gold')});
prop('door',({r,b})=>{b(6,2,20,28,'woodDark');b(8,4,16,25,'wood');b(10,6,12,8,'glass');r(11,7,3,5,'paper');r(15,6,1,8,'woodDark');b(10,17,12,9,'woodLight');r(20,16,2,2,'gold')});
prop('board',({r,b})=>{b(6,20,3,10,'woodDark');b(23,20,3,10,'woodDark');b(2,6,28,20,'wood');b(4,8,24,16,'cream');r(3,4,26,2,'teal');for(const x of [6,17]){b(x,10,8,11,'paper');r(x+2,12,4,1,'red');for(let y=15;y<20;y+=2)r(x+2,y,4,1,'woodLight')}});
prop('bench',({r,b})=>{b(5,21,3,9,'deep');b(24,21,3,9,'deep');b(2,12,28,5,'wood');b(2,18,28,5,'wood');r(4,13,24,1,'woodLight');r(4,19,24,1,'woodLight');r(6,16,2,3,'deep');r(24,16,2,3,'deep')});
prop('mailbox',({r,b})=>{b(14,18,4,12,'woodDark');b(6,7,20,13,'red');r(8,8,16,2,'woodLight');r(9,12,14,2,'ink');b(21,4,3,9,'gold');r(22,4,5,3,'red')});
prop('plant',({r,b})=>{b(10,21,12,9,'wood');r(8,20,16,3,'woodLight');r(15,7,2,14,'deep');for(const [x,y]of [[9,7],[16,4],[5,12],[17,11],[10,16]]){b(x,y,9,5,'green');r(x+1,y+1,6,2,'leaf')}});
prop('bike',({r,b,l,d})=>{for(const x of [8,24]){d(x,23,6,'ink');d(x,23,4,'cream');d(x,23,3,'deep')}l(8,23,14,13,'gold');l(14,13,19,23,'gold');l(19,23,8,23,'gold');l(14,13,23,13,'gold');l(23,13,19,23,'gold');l(22,10,24,23,'red');r(20,8,6,2,'ink');r(11,11,6,2,'ink')});
prop('bag',({r,b})=>{b(11,5,10,6,'deep');b(6,9,20,21,'blue');r(8,11,16,4,'glass');b(9,21,14,7,'teal');r(12,18,8,1,'cream');r(10,23,12,1,'cream');r(7,15,2,12,'deep');r(23,15,2,12,'deep')});
prop('desk',({r,b})=>{b(3,14,26,16,'wood');r(5,16,22,3,'woodLight');b(1,12,30,4,'cream');b(19,7,7,5,'teal');b(6,10,9,2,'paper');r(14,22,4,3,'gold')});
prop('shop',({r,b})=>{b(3,10,26,20,'cream');b(14,18,9,12,'wood');b(6,17,6,7,'glass');b(5,3,22,7,'woodDark');r(7,5,18,3,'teal');b(1,10,30,7,'red');for(let x=3;x<29;x+=6)r(x,11,3,5,'cream');r(17,23,2,2,'gold')});
prop('gate',({r,b})=>{b(2,6,5,24,'wood');b(25,6,5,24,'wood');b(1,3,30,5,'teal');b(8,10,16,20,'deep');for(let x=10;x<24;x+=3)r(x,11,1,18,'tealLight');r(8,17,16,1,'tealLight')});
prop('press',({r,b})=>{b(4,7,4,23,'deep');b(24,7,4,23,'deep');b(2,5,28,5,'teal');b(13,10,6,10,'blue');b(8,20,16,4,'woodLight');b(2,26,28,4,'teal');b(13,1,6,4,'red');r(9,1,14,2,'red');r(10,24,12,2,'paper')});
prop('bus',({r,b})=>{b(14,8,4,22,'deep');b(5,2,22,12,'teal');b(7,4,18,8,'cream');b(11,5,10,6,'blue');r(12,6,8,2,'glass');r(10,26,12,4,'deep')});
prop('mat',({r,b,l})=>{b(2,10,28,16,'woodDark');b(3,11,26,14,'teal');r(5,13,22,10,'tealLight');for(const y of [14,22])r(6,y,20,1,'cream');r(15,13,1,10,'cream');l(10,15,10,21,'cream');l(21,15,21,21,'cream')});
prop('photo',({r,b})=>{b(4,4,24,24,'woodDark');b(6,6,20,20,'cream');r(8,8,16,16,'glass');for(const [x,hair,shirt]of [[10,'woodDark','red'],[18,'woodDark','blue']]){r(x,11,5,6,'light');r(x,10,5,2,hair);r(x+1,13,1,1,'ink');r(x+3,13,1,1,'ink');r(x-1,17,7,7,shirt)}});
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(root,'art-manifest.js'),"'use strict';\nwindow.ART_MANIFEST="+JSON.stringify(manifest)+';\n');
console.log('Exported 16 pixel backgrounds (240x160 / <=48 colors) and 17 pixel props (32x32)');
