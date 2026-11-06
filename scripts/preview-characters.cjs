'use strict';
// Screenshot the real game PNGs at their export size using the development server.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1080}});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.evaluate(()=>GameArt.ready);
  await page.evaluate(()=>{
   const names={teacher:'선생님',father:'아빠',reception:'접수원',gyugyeok:'이규격',hangyeol:'한결',mujung:'무중',hero:'주인공',minsu:'민수',boss:'대장',champ:'챔피언',friend:'친구',neighbor:'앞집 아저씨',uncle:'탈모 아저씨',sprinter:'박자왕',folder:'접기 장인',globe:'세계 챔피언',alien:'외계인',alien_champ:'행성 챔피언'};
   const sheet=document.createElement('main');sheet.style='position:fixed;inset:0;background:#182c2d;z-index:999;color:#f3e4bf;padding:28px;font:16px monospace;overflow:auto';
   const title=document.createElement('h2');title.textContent='딱, 지존 · 64 × 64 픽셀 캐릭터';sheet.append(title);
   const note=document.createElement('p');note.textContent='대기 / 걷기 A / 걷기 B / 내려치기 · 64 × 64 PNG';sheet.append(note);
   const grid=document.createElement('div');grid.style='display:grid;grid-template-columns:repeat(3,1fr);gap:20px';
   for(const [who,label]of Object.entries(names)){
    const card=document.createElement('section');card.style='background:#263b3d;padding:14px;border:1px solid #48635b';
    const name=document.createElement('div');name.style='margin-bottom:14px';name.textContent=label;card.append(name);
    for(const pose of ['idle','walk-a','walk-b','attack']){const img=document.createElement('img');img.src=GameArt.manifest[`characters/${who}/${pose}`].src;img.alt=label+' '+pose;img.style='width:64px;height:64px;image-rendering:pixelated';card.append(img)}
    grid.append(card);
   }
   sheet.append(grid);document.body.append(sheet);
  });
  await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));
  await page.screenshot({path:path.join(__dirname,'../assets/art/characters-preview.png')});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
