'use strict';
/* Canvas, ttakji sprite cache, palette and drawing primitives. Shared through WorldKit. */
window.WorldKit=(()=>{
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
// Load the existing RGBA sprites once; scene rendering keeps running while they decode.
// Each material has four authored states; base is a fallback for failed requests.
const ttakjiSprites=Object.fromEntries(Object.keys(TtakjiProgression.items).map(material=>[material,
 Object.fromEntries(['base','flipped','inventory','damaged'].map(state=>{
  // Keepsake items (items[id].sprite) reuse another item's artwork.
  const dir=TtakjiProgression.items[material].sprite||material,image=new Image();image.src=`assets/sprites/ttakji/${dir}/ttakji_${dir}_${state}.png`;
  image.onerror=()=>{image.failed=true;if(state==='base')console.warn(`Ttakji sprite unavailable: ${material}/${state}`)};
  return [state,image];
 }))
]));
function ttakji(x,y,size,material='newspaper',state='base',angle=0,flipScale=1){
 let image=ttakjiSprites[material]?.[state];
 if(image?.failed)image=ttakjiSprites[material].base;
 if(!image?.complete||!image.naturalWidth)return false;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1,Math.max(.001,Math.abs(flipScale)));
 ctx.imageSmoothingEnabled=false;
 // The 32px tile keeps its original transparent margins (about 26px of artwork).
 const extent=size*32/26;ctx.drawImage(image,-extent/2,-extent/2,extent,extent);ctx.restore();return true;
}
// Shared palette: one dark ink outlines every shape so scenes read like a cartoon game.
const OUT='#1b1230',NAVY='#2b2d6e',YELLOW='#ffe14d',RED='#ff5a4e',BLUE='#3d9be9',WHITE='#ffffff';
const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
const box=(x,y,w,h,c,t=3)=>{rect(x-t,y-t,w+t*2,h+t*2,OUT);rect(x,y,w,h,c)};
function text(str,x,y,size=12,color=WHITE,align='left',weight=800,stroke){ctx.font=`${weight} ${size}px "Malgun Gothic",system-ui,sans-serif`;ctx.textAlign=align;if(stroke){ctx.lineJoin='round';ctx.lineWidth=Math.max(3,size/4);ctx.strokeStyle=stroke;ctx.strokeText(str,x,y)}ctx.fillStyle=color;ctx.fillText(str,x,y)}
function line(x1,y1,x2,y2,color=WHITE,w=2){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function circle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,Math.PI*2);ctx.fill()}
function ell(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function panel(x,y,w,h,r,fill,o=OUT,t=3){rr(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(t){ctx.lineWidth=t;ctx.strokeStyle=o;ctx.lineJoin='round';ctx.stroke()}}
function poly(points,fill,o=OUT,t=3){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(t){ctx.lineWidth=t;ctx.strokeStyle=o;ctx.lineJoin='round';ctx.stroke()}}
function grad(x,y,w,h,top,bottom){const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);ctx.fillStyle=g;ctx.fillRect(x,y,w,h)}
return {canvas,ctx,ttakjiSprites,ttakji,OUT,NAVY,YELLOW,RED,BLUE,WHITE,rect,box,text,line,circle,ell,rr,panel,poly,grad};
})();
