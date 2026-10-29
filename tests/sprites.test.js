const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),P=require('../progression.js');
const generated=require('../assets/sprites/ttakji/generation.json'),states=['base','flipped','inventory','damaged'];
test('all 45 requested ttakji and fusion have four distinct 256x256 RGBA PNGs',()=>{
 const ids=['newspaper','colored_paper','hair',...generated.items.map(x=>x.slug)];
 assert.equal(ids.length,45);assert.equal(Object.keys(P.items).length,46);
 for(const id of [...ids,'fusion']){assert(P.items[id],id+' must be playable');const hashes=new Set();
  for(const state of states){const bytes=fs.readFileSync(path.join(__dirname,'../assets/sprites/ttakji',id,'ttakji_'+id+'_'+state+'.png'));
   assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),id+'/'+state);
   assert.equal(bytes.readUInt32BE(16),256);assert.equal(bytes.readUInt32BE(20),256);assert.equal(bytes[25],6,'PNG must include RGBA');
   hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
  }assert.equal(hashes.size,4,id+' states must differ');
 }
});
test('every catalog item can be earned, equipped, upgraded and retained on reload',()=>{
 let p=P.fresh();P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);
 for(const [enter,award] of [[P.enterCity,P.awardCity],[P.enterProvince,P.awardProvince],[P.enterNational,P.awardNational]]){assert(enter(p));for(let i=0;i<3;i++)assert(award(p,i));}
 for(const id of ['continent','world','planet']){assert(P.enterTier(p,id));for(let i=0;i<3;i++)assert(P.awardTier(p,id,i));}
 p.coins=999999;for(const id of P.shopStock(p)){assert(P.buy(p,id),id);assert.equal(P.buy(p,id),false);}
 assert(P.fuse(p));assert.equal(p.owned.length,46);
 for(const id of p.owned){assert(P.equip(p,id));assert(P.upgrade(p));p=P.restore(JSON.parse(JSON.stringify(p)));assert.equal(p.equipped,id);assert.equal(p.upgrades[id],1);assert(P.stats(p).attack>0);}
 assert.equal(p.owned.length,46);assert(P.claimable(p).some(x=>x.id==='collector_all'));
});
test('special shop items respect progress and cannot be restored before their shop opens',()=>{
 const locked=P.restore({schoolReward:true,owned:['ragged','couple_gum','piano','lego','saimdang','magic_carpet'],equipped:'magic_carpet'});
 assert(locked.owned.includes('ragged'));for(const id of ['couple_gum','piano','lego','saimdang','magic_carpet']){assert(!locked.owned.includes(id));assert.equal(P.buy(locked,id),false);}
 assert.equal(locked.equipped,'newspaper');
});
