'use strict';
const Forge={
 selected:'balanced',item:null,
 available(){return (['city','province','national','continent','world','planet'].includes(G.scene)&&G.scene===G.hub&&G.profile.cityEntered)||(G.scene==='village'&&G.profile.provinceEntered)},
 visit(){
  if(!this.available()||G.paused||G.state!=='facility')return;
  this.item=null;
  if(G.profile.seen.forge){this.open();return}
  say([['공방 주인','압축은 단단하게, 제련은 성격을 바꾸는 거야.'],['공방 주인','공격형은 내구를 덜고 한 방을 키워. 수비형은 힘을 덜고 오래 버티지.'],['공방 주인','딱지마다 형태 하나를 처음 가공할 때 90원. 배워 둔 형태끼리 바꾸는 건 무료야.'],['공방 주인','방향키로 고르고 Enter. 바뀔 능력치를 보고 결정해. 기본형으로도 언제든 돌아갈 수 있어.']],()=>{G.profile.seen.forge=true;checkpoint(Village.hubCheckpoint());this.open()})
 },
 open(){
  if(!this.available())return;
  G.state='facility';G.facility='forge';G.keys.clear();panels('facility');Village.hud();
  const p=G.profile,id=p.equipped,current=P.formOf(p,id);
  if(this.item!==id){this.item=id;this.selected=current}
  $('facility-title').textContent='딱지 제련소';$('facility-wallet').textContent=`${p.coins}원`;
  const content=$('facility-content');content.replaceChildren();
  const el=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text!==undefined)node.textContent=text;return node};
  const summary=el('div','forge-summary'),image=el('img','');image.src=spriteSrc(id,'base');image.alt='';
  const copy=el('div','');copy.append(el('h3','',`${P.items[id].name} +${p.upgrades[id]}`),el('p','',`현재 · ${P.forms[current].name}`));summary.append(image,copy);content.append(summary);
  const choices=el('div','forge-forms');choices.setAttribute('role','group');choices.setAttribute('aria-label','제련 형태');
  for(const [form,data] of Object.entries(P.forms)){
   const button=el('button',`forge-form${this.selected===form?' selected':''}`);button.dataset.form=form;button.setAttribute('aria-pressed',String(this.selected===form));
   const signed=n=>n>0?`+${n}`:String(n);
   button.append(el('strong','',data.name),el('span','',form==='balanced'?'기본 능력치':`공격 ${signed(data.attack)} · 내구 ${signed(data.hp)}`),el('small','',current===form?'적용 중':p.refining[id].unlocked.includes(form)?'가공 완료':`첫 가공 ${data.cost}원`));
   button.onclick=()=>{if(G.paused||G.state!=='facility'||G.facility!=='forge')return;this.selected=form;this.open()};choices.append(button)
  }
  content.append(choices);
  const before=P.stats(p),after=P.stats(p,id,this.selected),preview=el('dl','forge-stats');preview.setAttribute('aria-live','polite');
  for(const [key,label] of [['attack','공격력'],['hp','최대 내구도']]){const row=el('div','');row.append(el('dt','',label),el('dd',after[key]>before[key]?'stat-up':after[key]<before[key]?'stat-down':'',`${before[key]} → ${after[key]}`));preview.append(row)}content.append(preview);
  const price=P.refineCost(p,this.selected),same=this.selected===current,poor=p.coins<price;
  const apply=el('button','menu-primary',same?'적용 중':price===0?`${P.forms[this.selected].name}으로 변경 · 무료`:`${P.forms[this.selected].name} 제련 · ${price}원${poor?' · 잔액 부족':''}`);apply.id='forge-apply';apply.disabled=same||poor;apply.onclick=()=>this.apply();content.append(apply);
  const note=el('p','forge-note');note.id='forge-note';note.setAttribute('role','status');content.append(note);
  const back=el('button','facility-choice','압축 공방으로');back.onclick=()=>{if(!G.paused&&G.state==='facility')Village.hub().open('press')};content.append(back);
  $('facility-close').onclick=()=>{if(!G.paused)Village.hub().close()};
  if(!G.paused)content.querySelector(`[data-form="${this.selected}"]`).focus({preventScroll:true})
 },
 apply(){
  if(!this.available()||G.paused||G.state!=='facility'||G.facility!=='forge')return;
  if(!P.refine(G.profile,this.selected))return;
  checkpoint(Village.hubCheckpoint());sound('fold');this.open();
  $('forge-note').textContent=`${P.forms[this.selected].name} 적용 완료`;
 }
};
