const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),vm=require('node:vm');
const manifest=require('../assets/art/manifest.json');
test('all sixteen pixel backgrounds and seventeen props have native dimensions, limited colors and matching metadata',()=>{
 const scenes=Object.entries(manifest).filter(([k])=>!k.startsWith('characters/'));
 assert.equal(scenes.filter(([k])=>k.startsWith('backgrounds/')).length,16);assert.equal(scenes.filter(([k])=>k.startsWith('props/')).length,17);
 const hashes=new Set();
 for(const [key,entry]of scenes){
  const b=fs.readFileSync(path.join(__dirname,'..',entry.src)),back=key.startsWith('backgrounds/'),w=back?240:32,h=back?160:32;
  assert.equal(b.readUInt32BE(16),w,key);assert.equal(b.readUInt32BE(20),h,key);assert.equal(b[25],6,key);
  assert.deepEqual(entry.size,[w,h]);
  const chunks=[];for(let at=8;at<b.length;){const n=b.readUInt32BE(at);if(b.toString('ascii',at+4,at+8)==='IDAT')chunks.push(b.subarray(at+8,at+8+n));at+=n+12}
  const raw=zlib.inflateSync(Buffer.concat(chunks)),colors=new Set(),points=[];
  assert.equal(raw.length,h*(w*4+1));
  for(let y=0;y<h;y++){assert.equal(raw[y*(w*4+1)],0);for(let x=0;x<w;x++){
   const p=raw.subarray(y*(w*4+1)+1+x*4,y*(w*4+1)+5+x*4);assert([0,255].includes(p[3]),key);
   if(back)assert.equal(p[3],255,key+' is opaque');if(p[3]){colors.add(p.toString('hex'));points.push([x,y])}
  }}
  assert(colors.size<= (back?48:16),key+' has a limited palette');
  if(back){assert(Number.isInteger(entry.horizon)&&entry.horizon>0&&entry.horizon<h);assert.match(entry.sky,/^#[0-9a-f]{6}$/)}
  else assert.deepEqual(entry.bounds,[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0]))+1,Math.max(...points.map(p=>p[1]))+1],key);
  const hash=crypto.createHash('sha256').update(b).digest('hex');assert(!hashes.has(hash),key+' has its own image');hashes.add(hash);
 }
 const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../art-manifest.js'),'utf8'),sandbox);
 assert.deepEqual(JSON.parse(JSON.stringify(sandbox.window.ART_MANIFEST)),manifest);
});
