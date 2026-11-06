'use strict';
// Normalize every gameplay tile to an actual 32x32 limited-palette RGBA image.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{png}=require('./draw-characters.cjs'),P=require('../progression.js');
const root=path.join(__dirname,'..');
for(const id of Object.keys(P.items))for(const state of ['base','flipped','inventory','damaged']){
 const file=path.join(root,`assets/sprites/ttakji/${id}/ttakji_${id}_${state}.png`),bytes=fs.readFileSync(file);
 if(bytes.readUInt32BE(16)===32&&bytes.readUInt32BE(20)===32)continue;
 const raw=execFileSync('magick',[file,'-filter','point','-resize','32x32!','-channel','A','-threshold','50%','+channel','+dither','-colors','32','-depth','8','RGBA:-']);
 const pixels=Array.from({length:32},(_,y)=>Array.from({length:32},(_,x)=>[...raw.subarray((y*32+x)*4,(y*32+x+1)*4)]));fs.writeFileSync(file,png(pixels));
}
console.log('46 ttakji / 184 states use 32x32 RGBA pixel sprites');
