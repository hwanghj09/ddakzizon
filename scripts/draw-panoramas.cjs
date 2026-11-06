'use strict';
// Normalized ImageGen panorama atlases contain three 640x142 strips each.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{png}=require('./draw-characters.cjs');
const root=path.join(__dirname,'..'),out=path.join(root,'assets/art'),manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
const groups={outdoor:[['alley',1800],['square',2200],['center',1800]],indoor:[['home',1280],['lobby',1280],['city',1800]],school:[['yard',1600],['gazebo',1600],['schoolfront',1400]],arenas:[['province',2000],['national',2200],['village',1920]],frontier:[['continent',1920],['world',1920],['planet',1920]]};
for(const [group,locations]of Object.entries(groups))for(const [row,[theme,width]]of locations.entries()){
 const w=width/4,h=142,x=Math.floor((640-w)/2),source=path.join(out,'sources/panorama-'+group+'.png');
 const raw=execFileSync('magick',[source,'-crop',`${w}x${h}+${x}+${row*h}`,'+repage','+dither','-colors','48','-depth','8','RGBA:-'],{maxBuffer:1024*1024});
 const pixels=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>[...raw.subarray((y*w+x)*4,(y*w+x+1)*4)]));
 const file='panoramas/'+theme+'.png';fs.mkdirSync(path.join(out,'panoramas'),{recursive:true});fs.writeFileSync(path.join(out,file),png(pixels));
 const horizon=group==='indoor'?122:group==='arenas'?122:118;
 manifest['panoramas/'+theme]={src:'assets/art/'+file,size:[w,h],worldWidth:width,horizon,sky:'#'+pixels[0][Math.floor(w/2)].slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('')};
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(root,'art-manifest.js'),"'use strict';\nwindow.ART_MANIFEST="+JSON.stringify(manifest)+';\n');
console.log('Exported 15 unique world-width panoramas at native 4x scale');
