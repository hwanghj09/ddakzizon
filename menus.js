'use strict';
/* The overlay pauses the existing simulation; opening it never changes the scene. */
window.GameMenu={
 view:'overview', selected:null,
 setInert(value){for(const child of $('game').children)if(child.id!=='pause-screen')child.inert=value},
 release(){this.setInert(false);this.selected=null},
 owned(){return !G.profile.schoolReward&&(G.stolen||G.checkpoint==='home'||G.profile.map.phase==='lost')?[]:G.profile.owned},
 canEquip(){return G.profile.schoolReward&&['village',...P.stageIds].includes(G.scene)&&['explore','facility'].includes(G.state)},
 icon(id,state='inventory'){const img=spriteImg(document.createElement('img'),id,state);img.alt='';return img},
 el(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el},
 button(text,action,className='menu-secondary'){const b=this.el('button',className,text);b.onclick=action;return b},
 show(view='overview'){
  const names={map:'동네 지도',journal:'이야기 수첩',story:'이야기 다시 보기',achievements:'도전 과제',overview:'게임 현황',inventory:'인벤토리',player:'선수 · 스킬',settings:'설정',controls:'조작키'};
  if(!names[view])return;this.view=view;$('menu-view-title').textContent=names[view];$('menu-message').textContent='';
  document.querySelectorAll('[data-menu]').forEach(b=>{const active=b.dataset.menu===view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  const ready=P.claimable(G.profile).length,tab=document.querySelector('[data-menu="achievements"]');if(tab)tab.textContent=ready?`도전 과제 · ${ready}`:'도전 과제';
  const body=$('menu-body');body.replaceChildren();this[view](body);
  (view==='inventory'?body.querySelector('.item-slot.selected'):document.querySelector(`[data-menu="${view}"]`))?.focus({preventScroll:true})
 },
 map(body){Exploration.map(body)},
 overview(body){
  if(!G.storageOK)body.append(this.button('자동 저장 다시 시도',()=>{checkpoint(G.checkpoint);this.show('overview')}));
  const p=G.profile,owned=this.owned(),card=this.el('div','equipped-summary');
  if(owned.length){card.append(this.icon(p.equipped));const copy=this.el('div');copy.append(this.el('span','menu-eyebrow','장착 딱지'),this.el('h4','',P.items[p.equipped].name),this.el('p','',`강화 +${p.upgrades[p.equipped]} · ${P.forms[P.formOf(p)].name}`));card.append(copy)}else card.append(this.el('p','','지금은 가진 딱지가 없다.'));
  body.append(card);const progress=this.el('div','menu-progress');
  // The latest entered tournament decides the current journey line.
  const t=[...P.tournaments].reverse().find(x=>x.entered(p)),round=t?p[t.field]:0,won=t&&round===t.opponents.length,next=t&&P.tournaments[P.tournaments.indexOf(t)+1];
  const current=t?(won?Tournament.stages[t.id].champion:`${t.stage} · ${t.opponents[round].title}`):p.schoolReward?`마을 대회 · ${P.opponents[0].title}`:({school:'학교에서 첫 대결',lost:'집으로 돌아가기',folded:'지우개 표적 연습',rematch:'학교 재대결'}[p.map.phase]||'학교');
  progress.append(this.el('span','menu-eyebrow','현재 여정'),this.el('h4','',current));
  if(p.schoolReward)progress.append(this.el('p','',!t?'다음 상대 · 앞집 아저씨':!won?`다음 상대 · ${t.opponents[round].name}`:t.id==='village'?'다음 목표 · 시 대회':next?`${next.stage} 출전권 획득`:p.story.ending?'자유 경기 · 다음 무대 ????':'운동장으로 돌아가자'));body.append(progress);
  const metrics=this.el('div','menu-metrics');for(const [label,value] of [['보유금',`${p.coins}원`],['선수',`${heroName()} · Lv.${P.level(p)+1}`],['보유 딱지',`${owned.length}개`]]){const tile=this.el('div');tile.append(this.el('small','',label),this.el('strong','',value));metrics.append(tile)}body.append(metrics);
  body.append(this.el('p','save-note',G.storageOK?'획득·강화·진행은 자동 저장됩니다. 이어서 하기는 마지막 진행 지점부터 시작합니다.':'이 브라우저에서는 저장하지 못했습니다. 현재 플레이는 계속할 수 있습니다.'))
 },
 inventory(body){
  const owned=this.owned(),p=G.profile;
  if(!owned.includes(this.selected))this.selected=owned.includes(p.equipped)?p.equipped:owned[0];
  const meta=this.el('div','inventory-meta');meta.append(this.el('span','',`보유 ${owned.length}개`),this.el('strong','',`${p.coins}원`));body.append(meta);
  if(!owned.length){const empty=this.el('div','inventory-empty');empty.append(this.el('span','','◇'),this.el('h4','','가방이 비었다.'),this.el('p','','새 신문지 딱지를 접어 다시 시작하자.'));body.append(empty);return}
  const layout=this.el('div','inventory-layout'),grid=this.el('div','item-grid');grid.setAttribute('role','group');grid.setAttribute('aria-label','보유 딱지');
  for(const id of owned){const item=P.items[id],b=this.button('',()=>this.select(id),'item-slot');b.dataset.item=id;b.setAttribute('aria-label',`${item.name} +${p.upgrades[id]}${id===p.equipped?' 장착 중':''}`);b.setAttribute('aria-pressed',String(id===this.selected));b.classList.toggle('selected',id===this.selected);b.append(this.icon(id),this.el('span','item-name',item.name),this.el('small','item-level',`+${p.upgrades[id]}`));if(id===p.equipped)b.append(this.el('span','equipped-badge','장착'));grid.append(b)}
  for(let i=owned.length;i<6;i++){const slot=this.el('div','item-slot vacant');slot.setAttribute('aria-hidden','true');grid.append(slot)}
  const detail=this.el('div','item-detail');detail.id='item-detail';layout.append(grid,detail);
  // Keepsakes and materials sit above the collection so the sticky detail panel stays in view at the bottom of a long list.
  if(Object.values(p.map.materials).some(n=>n>0))body.append(this.el('p','',`보유 재료 · 신문지 ${p.map.materials.newspaper}장 / 색종이 ${p.map.materials.colored_paper}장`));this.keepsakes(body);body.append(layout);this.renderDetail()
 },
 select(id){this.selected=id;document.querySelectorAll('[data-item]').forEach(b=>{b.classList.toggle('selected',b.dataset.item===id);b.setAttribute('aria-pressed',String(b.dataset.item===id))});this.renderDetail()},
 renderDetail(){
  const id=this.selected,p=G.profile,item=P.items[id],stats=P.stats(p,id),equipped=P.stats(p),detail=$('item-detail');detail.replaceChildren();
  const art=this.icon(id,'base');art.className='item-art';detail.append(art,this.el('h4','',item.name),this.el('span','menu-eyebrow',`강화 +${p.upgrades[id]} / ${P.upgradeLimit(p)} · ${P.forms[P.formOf(p,id)].name}`),this.el('p','item-description',item.description));
  const list=this.el('dl','item-stats');for(const [key,label] of [['attack','공격력'],['defense','방어력'],['stability','안정성'],['hp','최대 내구도'],['concentration','집중력']]){const row=this.el('div'),value=this.el('dd','',String(stats[key])),delta=stats[key]-equipped[key];row.append(this.el('dt','',label));if(id!==p.equipped&&delta!==0)value.append(this.el('span',delta>0?'stat-up':'stat-down',` ${delta>0?'+':''}${delta}`));row.append(value);list.append(row)}detail.append(list);
  const can=this.canEquip();const b=this.button(id===p.equipped?'장착 중':can?'이 딱지 장착':'경기 밖에서 장착 가능',()=>this.equip(),'menu-primary');b.id='equip-item';b.disabled=id===p.equipped||!can;detail.append(b);
  if(!can)detail.append(this.el('p','item-restriction',G.scene==='battle'?'경기 중에는 딱지를 바꿀 수 없다.':'마을이나 대회장에서 딱지를 바꿀 수 있다.'))
 },
 equip(){
  const id=this.selected;if(!G.paused||!this.canEquip()||!P.equip(G.profile,id))return;
  checkpoint(Village.hubCheckpoint());Village.hud();
  // Keep the facility underneath current if its preview depends on equipment.
  if(G.state==='facility'){if(['bracket','prep'].includes(G.facility))Tournament.refresh();else if(!['map','select'].includes(G.facility))Village.hub().open(G.facility)}
  this.show('inventory');$('menu-message').textContent=`${P.items[id].name} 장착 완료`;sound('click')
 },
 journal(body){
  const p=G.profile,done=J.episodes.filter(e=>p.journey.stages[e.id]===2).length;
  body.append(this.el('p','',`완료한 이야기 ${done} / ${J.episodes.length}`));
  for(const [region,info] of Object.entries(J.regions)){
   const section=this.el('section','journal-region');section.append(this.el('h4','',info.name));
   for(const e of J.episodes.filter(e=>e.region===region)){
    const n=p.journey.stages[e.id]||0,available=J.available(p,e),b=this.button(`${e.title} · ${n===2?'완료':available?`${n} / 2`:'아직 만나지 못함'}`,()=>{if(!this.canEquip()||G.hub!==region)return;unpause();Journeys.selected=e.id;Journeys.open()},'journey-entry');
    b.disabled=!this.canEquip()||G.hub!==region||!available;section.append(b);
   }body.append(section);
  }
 },
 achievements(body){
  const p=G.profile,done=P.achievements.filter(a=>p.claimed[a.id]).length;
  body.append(this.el('p','',`달성 ${done} / ${P.achievements.length} · 조건을 채우면 보상을 받을 수 있다.`));
  for(const a of P.achievements){
   const claimed=!!p.claimed[a.id],ready=!claimed&&a.check(p),card=this.el('div',`skill-card${claimed||ready?'':' locked'}`),head=this.el('h4','',a.title);
   head.append(this.el('span','menu-eyebrow',claimed?'완료':`${a.reward}원`));card.append(head,this.el('p','',a.description));
   if(ready){const b=this.button(`보상 받기 · ${a.reward}원`,()=>{if(P.claim(G.profile,a.id)){checkpoint(G.checkpoint);if(G.profile.schoolReward)Village.hud();sound('win');this.show('achievements');$('menu-message').textContent=`${a.title} · ${a.reward}원 획득`}},'menu-primary');b.dataset.achievement=a.id;card.append(b)}
   body.append(card)
  }
 },
 player(body){
  const p=G.profile,s=P.stats(p),header=this.el('div','player-summary');header.append(this.el('span','player-avatar',''),this.el('h4','',`${heroName()} · 선수 Lv.${P.level(p)+1}`),this.el('p','',`힘 ${s.strength} · 집중력 ${s.concentration} · 타이밍 구간 +${Math.round((R.zones(s.concentration).normal/R.zones(0).normal-1)*100)}%`));body.append(header);
  const meter=this.el('progress');meter.max=P.trainingLimit(p);meter.value=p.xp;meter.setAttribute('aria-label','선수 훈련 성장');body.append(meter,this.el('p','',p.xp>=P.trainingLimit(p)?'현재 훈련 숙련 완료':`훈련 ${p.xp}/${P.trainingLimit(p)} · 다음 성장까지 ${3-p.xp%3}회`));
  for(const [id,desc,unlock] of [['precise','피해 0.8배, 이번 타격의 뒤집기 확률 +15%p. 쿨타임 3턴.','마을 대회 우승 시 박태풍에게 배움'],['smash','피해 1.4배, 타이밍 구간이 좁아진다. 쿨타임 3턴.','시 대회 첫 승리 후 코치에게 배움'],['press','최대 내구도의 15% 회복. 공격과 뒤집기 판정 없음. 경기당 1회.','도 대회 첫 승리 후 상자왕에게 배움']]){const unlocked=P.hasSkill(p,id),card=this.el('div',`skill-card${unlocked?'':' locked'}`),title=this.el('h4','',R.skills[id].name);title.append(this.el('kbd','',unlocked?R.skills[id].key:'잠김'));card.append(title,this.el('p','',unlocked?desc:unlock));body.append(card)}
 },
 // Story keepsakes are not ttakji: the newspaper scrap and the 표창장 (until it is folded into a ttakji).
 keepsakes(body){const k=G.profile.keepsakes,list=[k.scrap&&['신문 조각','첫 패배 때 주운 같은 신문의 남은 조각. 집 식탁 위에 있다.'],k.award&&['표창장','마을 대회 우승 표창장. 집 식탁에서 표창장 딱지 재료로 쓸 수 있다.'],...P.titles(G.profile).filter(id=>id!=='village').length?[['트로피',`집 선반에 ${P.titles(G.profile).length}개 · 경기 능력치에는 영향 없음`]]:[]].filter(Boolean);if(!list.length)return;const box=this.el('section','keepsakes');box.id='keepsakes';box.append(this.el('h4','','보관품'));for(const [name,desc] of list){const row=this.el('p');row.append(this.el('strong','',name),document.createTextNode(` · ${desc}`));box.append(row)}body.append(box)},
 // 다시 보기: seen main story scenes replay from the menu without touching progress.
 story(body){
  const seen=TtakjiStory.replayOrder.filter(id=>G.profile.story.seen[id]),can=this.canEquip()&&G.state==='explore';
  body.append(this.el('p','',seen.length?`본 장면 ${seen.length}개 · 마을 게시판에서도 다시 볼 수 있다.`:'아직 다시 볼 이야기가 없다.'));
  for(const id of seen){const b=this.button(TtakjiStory.scenes[id].title,()=>{if(!this.canEquip()||G.state!=='explore')return;unpause();replayScene(id,()=>{G.state='explore';panels('explore-ui');updateInteract();$('game').focus({preventScroll:true})})},'journey-entry');b.dataset.scene=id;b.disabled=!can;body.append(b)}
  if(seen.length&&!can)body.append(this.el('p','item-restriction','마을이나 대회장을 걷고 있을 때 다시 볼 수 있다.'))
 },
 settings(body){
  const soundButton=this.button('',()=>{toggleSound();this.show('settings')});soundButton.id='menu-sound';soundButton.setAttribute('aria-pressed',String(G.sound));soundButton.textContent=`게임 소리 · ${G.sound?'켜짐':'꺼짐'}`;
  const screen=this.button(document.fullscreenElement?'전체 화면 나가기':'전체 화면으로',async()=>{await $('fullscreen').onclick();if(G.paused&&this.view==='settings')this.show('settings')});screen.id='menu-fullscreen';body.append(soundButton,screen,this.button(`목적지 안내 · ${G.profile.map.guidance?'켜짐':'꺼짐'}`,()=>{G.profile.map.guidance=!G.profile.map.guidance;checkpoint(G.checkpoint);this.show('settings')}));settingsControls(body,()=>{const d=document.activeElement?.dataset;this.show('settings');if(d?.setting)$('menu-body').querySelector(`[data-setting="${d.setting}"][data-value="${d.value}"]`)?.focus({preventScroll:true})})
 },
 controls(body){
  const list=this.el('dl','controls-list');for(const [label,key] of [['이동','← → / A D'],['지도','M'],['대화 · 시설 이용','E'],['대화 넘기기 · 딱지 치기','Space'],['딱지 접기','1 · 2 · 3 · 4'],['정밀 타격 / 강타 / 꾹 눌러 펴기','R / C / F'],['터치 · 마우스 이동','화면 아래 ◀ ▶ · 상호작용'],['이야기 수첩','J'],['인벤토리','I'],['열린 창 닫기 · 메뉴','Esc'],['메뉴 선택 / 실행','방향키 · Tab / Enter']]){const row=this.el('div');row.append(this.el('dt','',label),this.el('dd','',key));list.append(row)}body.append(list)
 },
 keys(event){
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.code==='KeyM'&&G.state!=='title'){event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;if(!G.paused)pause('map');else if(this.view==='map')unpause();else this.show('map');return}
  if(event.code==='KeyJ'&&G.state!=='title'){event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;if(!G.paused)pause('journal');else if(this.view==='journal')unpause();else this.show('journal');return}
  if(event.code==='KeyI'&&G.state!=='title'){
   event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;
   if(!G.paused)pause('inventory');else if(this.view==='inventory')unpause();else this.show('inventory');return
  }
  if(!G.paused)return;
  // Own modal input before the scene listeners, including arrows used for movement.
  event.stopImmediatePropagation();
  if(event.code==='Escape'){event.preventDefault();if(event.repeat)return;if(this.view==='overview')unpause();else this.show('overview');return}
  const buttons=[...$('pause-screen').querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length);
  if(event.code==='Tab'){const i=buttons.indexOf(document.activeElement);if(event.shiftKey&&i<=0){event.preventDefault();buttons.at(-1)?.focus()}else if(!event.shiftKey&&(i===buttons.length-1||i<0)){event.preventDefault();buttons[0]?.focus()}return}
  if(event.code.startsWith('Arrow')){
   event.preventDefault();const active=document.activeElement;
   const slots=[...$('menu-body').querySelectorAll('[data-item]')];
   if(slots.includes(active)){
    const step=event.code==='ArrowRight'?1:event.code==='ArrowLeft'?-1:event.code==='ArrowDown'?2:-2;
    const index=(slots.indexOf(active)+step+slots.length)%slots.length;slots[index].focus();this.select(slots[index].dataset.item)
   }else{const step=['ArrowDown','ArrowRight'].includes(event.code)?1:-1;buttons[(buttons.indexOf(active)+step+buttons.length)%buttons.length]?.focus()}
  }
 }
};
for(const b of document.querySelectorAll('[data-menu]'))b.onclick=()=>GameMenu.show(b.dataset.menu);
$('menu-close').onclick=unpause;
$('open-inventory').onclick=()=>pause('inventory');
document.addEventListener('keydown',e=>GameMenu.keys(e),true);
