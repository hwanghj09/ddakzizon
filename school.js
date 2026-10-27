'use strict';
/* The school loop teaches the same paid upgrade rules used in later hubs. */
const School={
 usesGrowth(){return G.profile.homeUpgradeDone&&['practice','rematch'].includes(G.mode)},
 hud(){setInventory(`신문지 딱지 +${G.profile.upgrades.newspaper} · ${G.profile.coins}원`)},
 homeUpgrade(){
  cancelScene();G.scene='home';G.mode='home_upgrade';G.fold=4;G.foldAt=G.now-500;G.stolen=false;
  P.grantHomeAllowance(G.profile);checkpoint('home_upgrade');this.hud();
  if(G.profile.homeUpgradeDone){this.workbench();return}
  say([['아빠','딱지 잃었다며? 접기만 해서는 또 쉽게 뒤집힐 수 있어.'],['아빠','보강지를 넣고 이 압축기로 눌러보자. 재료비 40원은 아빠가 줄게.'],['아빠','지금 능력치랑 강화 후 능력치를 보고, 보강하고 압축하기를 골라봐.']],()=>this.workbench())
 },
 workbench(){
  G.state='home-upgrade';panels('home-workbench');this.hud();this.renderWorkbench();
  (G.profile.homeUpgradeDone?$('home-practice'):$('home-compress')).focus({preventScroll:true})
 },
 renderWorkbench(){
  const p=G.profile,done=p.homeUpgradeDone,s=P.stats(p,'newspaper'),before=done?{attack:s.attack-3,hp:s.hp-10}:s,after=done?s:{attack:s.attack+3,hp:s.hp+10};
  $('home-item-name').textContent=`신문지 딱지 +${p.upgrades.newspaper}`;
  const preview=$('home-stat-preview');preview.replaceChildren();
  for(const [label,key] of [['공격력','attack'],['내구도','hp']]){const row=document.createElement('div'),name=document.createElement('span'),value=document.createElement('strong');name.textContent=label;value.textContent=`${before[key]} → ${after[key]}`;row.append(name,value);preview.append(row)}
  $('home-wallet').textContent=`보유 ${p.coins}원${done?'':` · 재료비 ${P.cost(p)}원`}`;
  $('home-compress').hidden=done;$('home-compress').disabled=G.state==='home-pressing'||p.coins<P.cost(p);
  $('home-practice').hidden=!done||G.state==='home-pressing';
  $('home-upgrade-note').textContent=G.state==='home-pressing'?'꾹… 더 단단하게.':done?'강화 완료 · 같은 타이밍에도 더 강하게 친다.':'보강지를 넣고 납작하게 눌러보자.'
 },
 compress(){
  if(G.paused||G.state!=='home-upgrade'||!P.upgradeAtHome(G.profile))return;
  G.state='home-pressing';G.homePressAt=G.now;checkpoint('home_upgrade');sound('fold');this.hud();this.renderWorkbench();
  after(1200,()=>{sound('perfect');this.workbench()})
 },
 startPractice(){
  if(G.paused||G.state!=='home-upgrade'||!G.profile.homeUpgradeDone)return;
  checkpoint('practice');transition(practice)
 },
 configureBattle(){
  const s=P.stats(G.profile,'newspaper');G.hp=G.maxHp=s.hp;G.focusAvailable=true;
  document.querySelector('.health-card.player small').textContent=`신문지 딱지 +${G.profile.upgrades.newspaper}`;this.hud()
 },
 practiceIntro(){
  say([['아빠','자, 강화한 딱지로 세 번만 쳐보자.'],['아빠','F로 집중하면 다음 타이밍 게이지가 천천히 움직여. 한 경기에 한 번 쓸 수 있어.'],['아빠','집중한 다음 스페이스로 들고, 가운데서 한 번 더!']],()=>{panels('battle-hud','combat-controls');ready()})
 },
 offerPractice(){
  const button=$('result-secondary');button.hidden=false;button.textContent='집에서 더 연습하기';button.onclick=()=>{if(G.paused||G.state!=='result')return;checkpoint('practice');transition(practice)}
 }
};
$('home-compress').onclick=()=>School.compress();$('home-practice').onclick=()=>School.startPractice();
