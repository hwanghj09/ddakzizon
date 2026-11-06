'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1080}});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.evaluate(()=>GameArt.ready);
  await page.evaluate(()=>{
   const names={yard:'학교 운동장',home:'우리 집',alley:'주택 골목',square:'중앙 광장',center:'주민센터 앞',lobby:'주민센터 로비',schoolfront:'학교 앞',classroom:'교실',gazebo:'운동장 정자',city:'시 대회 · 체육관',province:'도 대회 · 압축 경기장',national:'전국 경기장',continent:'대륙 · 사막',world:'세계 · 야경',planet:'행성 · 달 기지',village:'마을 대회 광장'};
   const sheet=document.createElement('main');sheet.style='position:fixed;inset:0;background:#182c2d;z-index:999;color:#f3e4bf;padding:28px;font:16px monospace;overflow:auto';
   const title=document.createElement('h2');title.textContent='딱, 지존 · 픽셀 월드';sheet.append(title);
   const note=document.createElement('p');note.textContent='배경 16종 · 240 × 160 · 장면별 48색 이하 · 소품 17종도 픽셀로 교체';sheet.append(note);
   const grid=document.createElement('div');grid.style='display:grid;grid-template-columns:repeat(4,1fr);gap:16px';
   for(const [key,label]of Object.entries(names)){
    const card=document.createElement('section');card.style='background:#263b3d;padding:8px;border:1px solid #48635b';
    const img=document.createElement('img');img.src=GameArt.manifest['backgrounds/'+key].src;img.alt=label;img.style='width:100%;aspect-ratio:3/2;display:block;image-rendering:pixelated';card.append(img);
    const name=document.createElement('div');name.style='padding:10px 2px 3px;font-size:13px';name.textContent=label;card.append(name);grid.append(card);
   }
   sheet.append(grid);document.body.append(sheet);
  });
  await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));
  await page.screenshot({path:path.join(__dirname,'../assets/art/scenes-preview.png')});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
