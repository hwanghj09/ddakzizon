const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const manifest=require('../assets/art/manifest.json');
test('all twelve characters have four distinct native 16x16 opaque-pixel RGBA frames and fixed feet',()=>{
 const characters=Object.entries(manifest).filter(([key])=>key.startsWith('characters/'));
 assert.equal(characters.length,48);
 const all=new Set(),poses=new Map();
 for(const [key,entry]of characters){
  const bytes=fs.readFileSync(path.join(__dirname,'..',entry.src));
  assert.equal(bytes.readUInt32BE(16),16,key);assert.equal(bytes.readUInt32BE(20),16,key);
  assert.equal(bytes[24],8,key);assert.equal(bytes[25],6,key+' is RGBA');
  const chunks=[];for(let at=8;at<bytes.length;){const n=bytes.readUInt32BE(at);if(bytes.toString('ascii',at+4,at+8)==='IDAT')chunks.push(bytes.subarray(at+8,at+8+n));at+=n+12}
  const raw=zlib.inflateSync(Buffer.concat(chunks));assert.equal(raw.length,16*(1+16*4));
  const colors=new Set(),points=[];
  for(let y=0;y<16;y++){assert.equal(raw[y*65],0);for(let x=0;x<16;x++){
   const p=raw.subarray(y*65+1+x*4,y*65+5+x*4);assert([0,255].includes(p[3]),key+' has no blurred alpha');
   if(p[3]){points.push([x,y]);colors.add(p.toString('hex'))}
  }}
  assert(colors.size>=6&&colors.size<=16,key+' uses a small palette');
  const bounds=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0]))+1,Math.max(...points.map(p=>p[1]))+1];
  assert.deepEqual(entry.bounds,bounds,key);assert.deepEqual(entry.size,[16,16]);assert.deepEqual(entry.anchor,[8,15]);assert.equal(bounds[3],15,key+' shares the foot baseline');
  const hash=crypto.createHash('sha256').update(bytes).digest('hex');assert(!all.has(hash),key+' is an original frame');all.add(hash);
  const [,who,pose]=key.split('/');if(!poses.has(who))poses.set(who,[]);poses.get(who).push(pose);
 }
 assert.equal(poses.size,12);for(const [who,frames]of poses)assert.deepEqual(frames.sort(),['attack','idle','walk-a','walk-b'],who);
});
