const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||undefined});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().includes('/assets/sprites/ttakji/')&&!r.ok())failed.push(r.url())});
 await page.addInitScript(()=>{window.spriteDraws=new Set();const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement&&image.src.includes('/assets/sprites/ttakji/'))spriteDraws.add(new URL(image.src).pathname);return draw.call(this,image,...args)}});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 const ids=await page.evaluate(()=>Object.keys(P.items));assert.equal(ids.length,46);
 await page.waitForFunction(()=>Object.keys(P.items).every(id=>['base','flipped','inventory','damaged'].every(s=>window.World.spriteReady(id,s)===true)));
 // Earn all trophies normally, then leave the last shop item for an actual UI purchase.
 await page.evaluate(()=>{cancelScene();G.profile=P.fresh();const p=G.profile;P.schoolReward(p);for(let i=0;i<3;i++)P.award(p,i);for(const [enter,award]of[[P.enterCity,P.awardCity],[P.enterProvince,P.awardProvince],[P.enterNational,P.awardNational]]){enter(p);for(let i=0;i<3;i++)award(p,i)}for(const id of ['continent','world','planet']){P.enterTier(p,id);for(let i=0;i<3;i++)P.awardTier(p,id,i)}p.coins=999999;for(const id of P.shopStock(p))if(id!=='magic_carpet')P.buy(p,id);P.fuse(p);P.takeTrophy();Planet.enter();Village.open('shop')});
 await page.getByRole('button',{name:/마법의 양탄자 딱지.*7000원/}).click();
 assert(await page.evaluate(()=>G.profile.owned.includes('magic_carpet')));
 await page.evaluate(()=>Planet.enter());await page.keyboard.press('KeyI');assert.equal(await page.locator('[data-item]').count(),46);
 for(const id of ids){await page.locator('[data-item="'+id+'"]').click();await page.waitForFunction(id=>{const img=document.querySelector('#item-detail .item-art');return img?.complete&&img.naturalWidth===256&&img.src.endsWith('ttakji_'+id+'_base.png')},id);if(!await page.locator('#equip-item').isDisabled())await page.locator('#equip-item').click();assert.equal(await page.evaluate(()=>G.profile.equipped),id);}
 const art=await page.locator('#item-detail .item-art').boundingBox(),body=await page.locator('#menu-body').boundingBox();assert(art.y>=body.y&&art.y+art.height<=body.y+body.height,'Selected art stays visible when scrolling the collection');
 const dir=process.env.ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'ddakzizon-checks');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'catalog-inventory.png')});
 await page.reload();await page.locator('#load-game').click();await page.waitForFunction(()=>G.scene==='planet'&&G.state==='explore');assert.equal(await page.evaluate(()=>G.profile.owned.length),46);assert.equal(await page.evaluate(()=>G.profile.equipped),ids.at(-1));
 // The exploration bus must reach the expanded campaign instead of showing a disabled placeholder.
 for(const [label,id]of[['대륙 대회 · 전국 우승','continent'],['세계 대회 · 대륙 우승','world'],['행성 대회 · 세계 우승','planet']]){await page.evaluate(()=>Exploration.bus());await page.getByRole('button',{name:label,exact:true}).click();await page.waitForFunction(id=>G.scene===id&&G.state==='explore',id);}
 // Observe the real canvas drawing each battle state for every material.
 for(const id of ids){for(const state of ['base','damaged','flipped']){
  await page.evaluate(({id,state})=>{cancelScene();G.hub='planet';G.mode='planet_tournament';G.scene='battle';G.state='ready';G.profile.equipped=id;G.opponent={...P.planetOpponents[0],material:id};G.hp=G.maxHp=100;G.enemyHp=G.enemyMax=100;G.now=Math.max(2000,G.now);G.flipPlayer=G.flipEnemy=0;G.stolen=false;if(state==='damaged'){G.hp=60;G.enemyHp=60}if(state==='flipped'){G.flipPlayer=G.flipEnemy=G.now-850}spriteDraws.clear()}, {id,state});
  await page.waitForFunction(({id,state})=>[...spriteDraws].some(src=>src.endsWith('/assets/sprites/ttakji/'+id+'/ttakji_'+id+'_'+state+'.png')),{id,state});
 }}
 await page.screenshot({path:path.join(dir,'catalog-battle.png')});assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log('PASS 46 playable types / 184 decoded images, shop purchase, every inventory preview/equip, reload and 138 canvas battle states without missing requests');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
