'use strict';
/* Native pixel characters share a fixed foot anchor in every scene and portrait. */
window.GameArt=(()=>{
 const manifest=window.ART_MANIFEST||{},images={},portraits=new Map();
 const aliases={rival:'minsu',wall:'folder',offbeat:'sprinter',champion:'boss',charger:'sprinter',fortress:'folder',national_champion:'champ',gust:'sprinter',glacier:'folder',continent_champion:'champ',showman:'minsu',architect:'folder',world_champion:'globe',martian:'alien',lunar:'alien',planet_champion:'alien_champ'};
 const canonical=kind=>aliases[kind]||kind;
 const loaded=key=>{const image=images[key];return image?.complete&&image.naturalWidth&&!image.failed?image:null};
 const ready=Promise.all(Object.entries(manifest).map(([key,entry])=>new Promise(resolve=>{
  const image=new Image();images[key]=image;
  image.onload=()=>{refreshPortraits();resolve(true)};
  image.onerror=()=>{image.failed=true;console.warn('Game artwork unavailable: '+entry.src);resolve(false)};
  image.src=entry.src;
 })));
 function smooth(ctx){ctx.imageSmoothingEnabled=false}
 function background(ctx,theme,ground=402){
  const key='backgrounds/'+theme,image=loaded(key),entry=manifest[key];if(!image)return false;
  // Native landscape pixels keep their proportions and share the interaction lane.
  const pixel=4,horizon=entry.horizon,top=Math.round(ground-horizon*pixel),bottom=top+image.naturalHeight*pixel;
  ctx.save();smooth(ctx);ctx.beginPath();ctx.rect(0,0,960,600);ctx.clip();
  ctx.fillStyle=entry.sky;ctx.fillRect(0,0,960,600);
  ctx.drawImage(image,0,top,960,image.naturalHeight*pixel);
  // Extend the last clear floor strip for battle/home cameras without stretching.
  for(let y=bottom;y<600;y+=16)ctx.drawImage(image,0,image.naturalHeight-12,image.naturalWidth,4,0,y,960,16);
  ctx.restore();return true;
 }
 function prop(ctx,name,x,y,maxWidth=150,maxHeight=130,stretch=false){
  const key='props/'+name,image=loaded(key),b=manifest[key]?.bounds;if(!image||!b)return false;
  const sw=b[2]-b[0],sh=b[3]-b[1],ratio=Math.min(maxWidth/sw,maxHeight/sh);
  const width=stretch?maxWidth:sw*ratio,height=stretch?maxHeight:sh*ratio;
  ctx.save();smooth(ctx);ctx.drawImage(image,b[0],b[1],sw,sh,x-width/2,y-height,width,height);ctx.restore();return true;
 }
 function actor(ctx,x,y,kind,walk=0,scale=1,facing=1,animation=null,now=0,role=kind==='hero'?'player':canonical(kind)==='minsu'?'enemy':null){
  const who=canonical(kind),age=animation?now-animation.at:Infinity;
  const attack=age>=0&&age<620&&((role==='player'&&animation.kind==='player-hit')||(role==='enemy'&&animation.kind==='enemy-hit'));
  const pose=attack?'attack':walk?(Math.floor(walk/140)%2?'walk-b':'walk-a'):'idle';
  let key=`characters/${who}/${pose}`;if(!loaded(key))key=`characters/${who}/idle`;
  const image=loaded(key),idle=manifest[`characters/${who}/idle`];if(!image||!idle)return false;
  // Integer magnification and one common anchor prevent animation size/feet jitter.
  const pixel=Math.max(1,Math.round(7*scale)),[ax,ay]=idle.anchor;
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(facing<0?-1:1,1);smooth(ctx);
  ctx.fillStyle='#25392b30';ctx.fillRect(-3*pixel,0,6*pixel,pixel);
  ctx.drawImage(image,-ax*pixel,-ay*pixel,image.naturalWidth*pixel,image.naturalHeight*pixel);ctx.restore();return true;
 }
 function portrait(element,kind='hero'){
  if(!element)return;element.dataset.artCharacter=canonical(kind);
  const key=`characters/${canonical(kind)}/idle`,image=loaded(key),b=manifest[key]?.bounds;
  element.classList.remove('image-portrait');element.style.backgroundImage='';
  if(!image||!b)return;
  if(!portraits.has(key)){
   const tile=document.createElement('canvas');tile.width=tile.height=12;
   const c=tile.getContext('2d');smooth(c);
   // Same 12x12 head/shoulder crop for all 16x16 characters, including antennae.
   c.drawImage(image,2,0,12,12,0,0,12,12);
   portraits.set(key,tile.toDataURL());
  }
  element.style.backgroundImage=`url("${portraits.get(key)}")`;element.classList.add('image-portrait');
 }
 function refreshPortraits(){document.querySelectorAll('[data-art-character]').forEach(el=>portrait(el,el.dataset.artCharacter))}
 function map(ctx,a){
  const zone=Exploration.data(),theme=zone.theme;
  if(!background(ctx,theme))return false;
  const {text,actor:person,paper}=a,camera=G.camera||0,objects=Exploration.objects(),nearest=G.state==='explore'?Exploration.nearest():null;
  const npc={minsu:'rival',doyun:'boss',neighbor:'neighbor',hana:'friend',uncle:'uncle',reception:'folder',spectator:'friend'};
  const sign=(label,x,y,width=180,active=false)=>{
   ctx.save();ctx.fillStyle=active?'#173e42f2':'#f3ead8ed';ctx.strokeStyle=active?'#e4bd70':'#796a4b55';ctx.lineWidth=1;
   ctx.beginPath();ctx.roundRect(x-width/2,y,width,30,6);ctx.fill();ctx.stroke();
   text(label,x,y+20,12,active?'#f3dfb3':'#394d49','center',650);ctx.restore();
  };
  ctx.save();ctx.translate(-camera,0);
  // Scene props use the same coordinates as the interaction data.
  for(const o of objects){
   if(o.x<camera-200||o.x>camera+1160)continue;
   if(o.type==='npc'){
    if(o.id==='spectator')prop(ctx,'bench',o.x,407,145,60);
    person(o.x,407,npc[o.id]||'friend',0,.98,o.x<G.hero.x?1:-1);
    if(o.id==='reception')prop(ctx,'desk',o.x,407,170,67);
   }else{
    const asset=({home:'door',lobby:'door',exit:'door',mail:'mailbox',notice:'board',bracket:'board',poster:'board',photo:'photo',training:'target',forge:'press',fusion:'press',score:'board',machine:'press',inspection:'desk',broadcast:'desk',cup:'desk'})[o.id]||o.id;
    const sizes={door:[105,185],gate:[235,165],board:[150,165],bed:[160,70],table:[160,82],target:[105,132],bag:[65,78],bike:[155,120],mailbox:[75,110],plant:[80,105],shop:[245,205],press:[145,105],bench:[155,63],desk:[175,75],bus:[70,180]};
    const [w,h]=o.id==='photo'?[67,72]:sizes[asset]||[135,120];
    prop(ctx,asset,o.x,o.id==='photo'?280:407,w,h);
    if(o.id==='bus')prop(ctx,'bench',o.x+90,408,125,55);
   }
   sign(o.name,o.x,o.type==='npc'?258:o.id==='shop'?177:o.id==='photo'?169:215,Math.min(210,Math.max(92,o.name.length*12+24)));
   if(G.state==='explore'){
    const active=nearest?.id===o.id;
    ctx.fillStyle=active?'#e4bd70':'#f3ead8';ctx.beginPath();ctx.arc(o.x,o.type==='npc'?298:328,active?11:8,0,Math.PI*2);ctx.fill();
    text(active?'E':o.type==='npc'?'…':'·',o.x,o.type==='npc'?302:332,active?12:11,'#274340','center',800);
   }
  }
  if(theme==='yard'||theme==='gazebo')paper(1025,430,23,'red',.2);
  const left=zone.left,right=zone.right;
  if(left)sign('← '+Exploration.zones[left].name,130,488,195);
  if(right)sign(Exploration.zones[right].name+' →',zone.width-140,488,200);
  person(G.hero.x,440,'hero',G.hero.walk,1,G.hero.facing);
  if(nearest&&G.coach){const x=Math.max(camera+170,Math.min(camera+790,nearest.x));sign(G.coach,x,nearest.type==='npc'?210:256,Math.max(240,G.coach.length*11+24),true)}
  ctx.restore();return true;
 }
 function hub(ctx,theme,places,text){
  if(!background(ctx,theme,315))return false;
  for(const place of places){
   const asset=({bus:'bus',training:'target',press:'press',forge:'press',cup:'desk'})[place.id]||'board';
   prop(ctx,asset,place.x,320,asset==='bus'?65:135,110);
   ctx.fillStyle='#263b3deb';ctx.fillRect(Math.round(place.x-84),180,168,30);
   text(place.name,place.x,200,13,'#efe0b2','center',700);
  }
  return true;
 }
 return {manifest,ready,loaded,background,prop,actor,portrait,map,hub};
})();
