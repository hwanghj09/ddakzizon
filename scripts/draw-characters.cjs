'use strict';
// Native 16x16 pixel drawings. No resampling of the former illustrations.
// Run with: node scripts/draw-characters.cjs (Node's standard library only).
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.join(__dirname,'..'),out=path.join(root,'assets/art');
const poses=['idle','walk-a','walk-b','attack'];
const looks={
 hero:       {hair:'#354c70',shine:'#537fa6',shirt:'#ce6959',shade:'#934b4e',trim:'#f4dba5',pants:'#354c70',skin:'#efbc91',detail:'cap'},
 minsu:      {hair:'#915d39',shine:'#c08b4d',shirt:'#559465',shade:'#35604c',trim:'#d6d39a',pants:'#434f60',skin:'#efbc91',detail:'spikes'},
 boss:       {hair:'#30303f',shine:'#515064',shirt:'#89649e',shade:'#5e416e',trim:'#d7b25d',pants:'#414253',skin:'#d9a27b',detail:'shades'},
 champ:      {hair:'#30303f',shine:'#515064',shirt:'#d4ad52',shade:'#99753f',trim:'#a94e5d',pants:'#414253',skin:'#d9a27b',detail:'crown'},
 friend:     {hair:'#674435',shine:'#956344',shirt:'#d7b95e',shade:'#9b783f',trim:'#e5a2a6',pants:'#b97188',skin:'#f2c8a4',detail:'tails'},
 neighbor:   {hair:'#594437',shine:'#856148',shirt:'#568fa4',shade:'#365e77',trim:'#e8dec0',pants:'#605346',skin:'#e4b18a',detail:'glasses'},
 uncle:      {hair:'#684a37',shine:'#986944',shirt:'#c69a5b',shade:'#91673e',trim:'#f0d398',pants:'#4c637c',skin:'#e4b18a',detail:'bald'},
 sprinter:   {hair:'#30303f',shine:'#515064',shirt:'#c65f79',shade:'#903e5b',trim:'#eee4c6',pants:'#903e5b',skin:'#e8b58b',detail:'band'},
 folder:     {hair:'#61456c',shine:'#9877ae',shirt:'#4e9c91',shade:'#32665f',trim:'#d6d8b3',pants:'#415b72',skin:'#efbc91',detail:'beanie'},
 globe:      {hair:'#b8bab3',shine:'#eee8cd',shirt:'#527fba',shade:'#37517f',trim:'#dfbc60',pants:'#3a4568',skin:'#d9a27b',detail:'visor'},
 alien:      {hair:'#557744',shine:'#81a45f',shirt:'#9272b2',shade:'#5e4b81',trim:'#dfbc60',pants:'#45425b',skin:'#a6c77a',detail:'antenna'},
 alien_champ:{hair:'#557744',shine:'#81a45f',shirt:'#d5af51',shade:'#94703b',trim:'#b75968',pants:'#45425b',skin:'#a6c77a',detail:'antenna-visor'}
};
// Each row is drawn deliberately on the final pixel grid. Feet end at y=15.
const head=[
 '................',
 '.....HHHHHH.....',
 '....HhhhhHHH....',
 '....HSSSSSSH....',
 '....HSS#S#SH....',
 '....HSSSSSsH....',
 '.....SSsSSs.....',
 '......####......'
];
const bodies={
 idle:[
 '.....#TCTC#.....',
 '....#SCCCcS#....',
 '....#SCCCcS#....',
 '.....#CCCC#.....',
 '.....#PPPP#.....',
 '.....#P##P#.....',
 '.....#W##W#.....'
 ],
 'walk-a':[
 '.....#TCTC#.....',
 '....#SCCCc#.....',
 '....#SCCCcS#....',
 '.....#CCCCS#....',
 '.....#PPPP#.....',
 '....#PP##P#.....',
 '....#WW#.#W#....'
 ],
 'walk-b':[
 '.....#TCTC#.....',
 '.....#CCCcS#....',
 '....#SCCCcS#....',
 '....#SCCCC#.....',
 '.....#PPPP#.....',
 '.....#P##PP#....',
 '....#W#..#WW#...'
 ],
 attack:[
 '.....#TCCC#.....',
 '....#SCCCCS##...',
 '....#SCCCcSSST#.',
 '.....#PPPP####..',
 '....#PP##PP#....',
 '....#WW##WW#....'
 ]
};
function drawing(who,pose){
 const l=looks[who],rows=Array.from({length:16},()=>Array(16).fill('.'));
 const stamp=(pattern,y)=>pattern.forEach((row,j)=>[...row].forEach((p,x)=>{rows[y+j][x]=p}));
 const down=pose==='attack'?2:0;stamp(head,down);stamp(bodies[pose],pose==='attack'?9:8);
 const dot=(x,y,c)=>{rows[y+down][x]=c},bar=(x,y,n,c)=>{for(let i=0;i<n;i++)dot(x+i,y,c)};
 if(l.detail==='cap'){bar(5,1,6,'H');bar(5,2,7,'h');bar(8,3,5,'H');dot(7,2,'T')}
 if(l.detail==='spikes'){bar(6,0,2,'H');dot(9,0,'H');dot(11,1,'H')}
 if(l.detail==='shades'||l.detail==='visor'||l.detail==='antenna-visor'){
  bar(6,4,5,'#');dot(7,4,'W');if(l.detail==='visor')dot(9,4,'T');
 }
 if(l.detail==='crown'){bar(5,1,7,'C');for(const x of [5,8,11])dot(x,0,'C');bar(6,4,5,'#')}
 if(l.detail==='tails'){for(const x of [3,12]){dot(x,3,'T');dot(x,4,'H');dot(x,5,'h');dot(x,6,'H')}}
 if(l.detail==='glasses'){bar(6,4,5,'#');dot(7,4,'W');dot(9,4,'W');dot(6,5,'#');dot(8,5,'#');dot(10,5,'#')}
 if(l.detail==='bald'){bar(5,1,6,'#');bar(5,2,6,'S');bar(5,3,6,'S');bar(7,6,3,'H')}
 if(l.detail==='band'){bar(4,3,8,'T');dot(3,4,'T');dot(2,5,'T')}
 if(l.detail==='beanie'){bar(5,1,6,'h');bar(4,2,8,'H');bar(4,3,8,'h');dot(7,0,'W');dot(8,0,'W')}
 if(l.detail.startsWith('antenna')){bar(5,1,6,'S');bar(5,2,6,'S');dot(4,0,'T');dot(11,0,'T');dot(4,1,'H');dot(11,1,'H');dot(6,4,'#');dot(10,4,'#')}
 const palette={'.':[0,0,0,0],'#':'#263341',H:l.hair,h:l.shine,S:l.skin,s:l.detail.startsWith('antenna')?'#729455':'#c98b70',C:l.shirt,c:l.shade,T:l.trim,P:l.pants,W:'#f3e4bf'};
 return rows.map(row=>row.map(c=>typeof palette[c]==='string'?[...palette[c].slice(1).match(/../g).map(h=>parseInt(h,16)),255]:palette[c]));
}
function crc32(data){let crc=0xffffffff;for(const b of data){crc^=b;for(let k=0;k<8;k++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1}return (crc^0xffffffff)>>>0}
function chunk(type,data){const tag=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([tag,data])));return Buffer.concat([len,tag,data,crc])}
function png(pixels){
 const header=Buffer.alloc(13);header.writeUInt32BE(16,0);header.writeUInt32BE(16,4);header[8]=8;header[9]=6;
 const bytes=Buffer.from(pixels.flatMap(row=>[0,...row.flat()]));
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(bytes)),chunk('IEND',Buffer.alloc(0))]);
}
function generate(){
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
 for(const who of Object.keys(looks))for(const pose of poses){
  const key=`characters/${who}/${pose}`,pixels=drawing(who,pose),file=path.join(out,key+'.png');
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,png(pixels));
  const points=pixels.flatMap((row,y)=>row.flatMap((p,x)=>p[3]?[[x,y]]:[]));
  manifest[key]={src:`assets/art/${key}.png`,size:[16,16],bounds:[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0]))+1,Math.max(...points.map(p=>p[1]))+1],anchor:[8,15]};
 }
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(root,'art-manifest.js'),"'use strict';\nwindow.ART_MANIFEST="+JSON.stringify(manifest)+';\n');
 console.log(`Drew ${Object.keys(looks).length} characters / ${Object.keys(looks).length*poses.length} native 16x16 RGBA frames`);
}
if(require.main===module)generate();
module.exports={looks,poses,drawing,png};
