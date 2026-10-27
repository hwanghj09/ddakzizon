/* Persistent campaign rules; no DOM or clock dependencies. */
(function(root){
 const items={
  newspaper:{name:'신문지 딱지',hp:110,attack:20,description:'잘 접은 한 장. 튼튼하고 균형 잡혔다.'},
  colored_paper:{name:'색종이 딱지',hp:90,attack:24,description:'가볍고 날렵하다. 내구도보다 한 방.'},
  hair:{name:'머리카락 딱지',hp:125,attack:28,description:'한 올 한 올, 아저씨의 자존심. 집중 +1.'}
 };
 const opponents=[
  {name:'앞집 아저씨',title:'1회전',hp:80,attack:18,material:'newspaper',prize:30,kind:'neighbor'},
  {name:'유치원 친구',title:'준결승',hp:110,attack:21,material:'colored_paper',prize:50,kind:'friend'},
  {name:'탈모 아저씨',title:'결승',hp:150,attack:24,material:'hair',prize:120,kind:'uncle'}
 ];
 const cityOpponents=[
  {name:'박자왕',title:'1회전',hp:150,attack:26,material:'colored_paper',prize:80,kind:'sprinter'},
  {name:'접기 장인',title:'준결승',hp:190,attack:28,material:'newspaper',prize:140,kind:'folder'},
  {name:'대장',title:'결승',hp:230,attack:32,material:'colored_paper',prize:300,kind:'boss'}
 ];
 const provinceOpponents=[
  {name:'철벽 선배',title:'1회전',hp:260,attack:34,material:'newspaper',prize:180,kind:'wall'},
  {name:'엇박자 선수',title:'준결승',hp:280,attack:36,material:'colored_paper',prize:260,kind:'offbeat'},
  {name:'도 챔피언',title:'결승',hp:320,attack:40,material:'hair',prize:500,kind:'champion'}
 ];
 const forms={balanced:{name:'기본형',attack:0,hp:0,cost:0},striker:{name:'공격형',attack:8,hp:-20,cost:90},sturdy:{name:'수비형',attack:-4,hp:35,cost:90}};
 const freshRefining=()=>Object.fromEntries(Object.keys(items).map(id=>[id,{active:'balanced',unlocked:['balanced']}]));
 const upgradeLimit=p=>p.provinceEntered?12:p.cityEntered?8:5;
 const trainingLimit=p=>p.provinceEntered?45:p.cityEntered?30:15;
 const fresh=()=>({coins:0,owned:['newspaper'],equipped:'newspaper',upgrades:{newspaper:0,colored_paper:0,hair:0},xp:0,refining:freshRefining(),homeAllowance:false,homeUpgradeDone:false,homePracticeDone:false,round:0,cityEntered:false,cityRound:0,provinceEntered:false,provinceRound:0,powerUnlocked:false,schoolReward:false,guardUnlocked:false,seen:{}});
 const integer=(x,max)=>Number.isSafeInteger(x)?Math.max(0,Math.min(max,x)):0;
 function restore(raw){
  const p=fresh();if(!raw||typeof raw!=='object')return p;
  p.schoolReward=raw.schoolReward===true;p.round=p.schoolReward?integer(raw.round,3):0;
  p.owned=p.schoolReward?['newspaper','colored_paper']:['newspaper'];
  if(p.round===3)p.owned.push('hair');p.guardUnlocked=p.round===3;
  p.cityEntered=p.round===3&&raw.cityEntered===true;p.cityRound=p.cityEntered?integer(raw.cityRound,3):0;p.powerUnlocked=p.cityRound>=1;
  p.provinceEntered=p.cityRound===3&&raw.provinceEntered===true;p.provinceRound=p.provinceEntered?integer(raw.provinceRound,3):0;
  p.equipped=p.owned.includes(raw.equipped)?raw.equipped:'newspaper';
  p.coins=integer(raw.coins,999999);p.xp=integer(raw.xp,trainingLimit(p));
  for(const id of p.owned)p.upgrades[id]=integer(raw.upgrades?.[id],upgradeLimit(p));
  if(p.cityEntered)for(const id of p.owned){const saved=raw.refining?.[id],entry=p.refining[id];for(const form of ['striker','sturdy'])if(Array.isArray(saved?.unlocked)&&saved.unlocked.includes(form))entry.unlocked.push(form);if(entry.unlocked.includes(saved?.active))entry.active=saved.active;}
  p.homeUpgradeDone=raw.homeUpgradeDone===true&&p.upgrades.newspaper>=1;
  p.homeAllowance=raw.homeAllowance===true||p.homeUpgradeDone;
  p.homePracticeDone=raw.homePracticeDone===true&&p.homeUpgradeDone;
  for(const id of ['house','training','press','cup','forge'])p.seen[id]=raw.seen?.[id]===true;
  return p;
 }
 const level=p=>Math.min(trainingLimit(p)/3,Math.floor(p.xp/3));
 const formOf=(p,id=p.equipped)=>p.refining?.[id]?.active||'balanced';
 function stats(p,id=p.equipped,form=formOf(p,id)){const item=items[id],upgrade=p.upgrades[id]||0,bonus=forms[form]||forms.balanced;return{hp:item.hp+upgrade*10+bonus.hp,attack:item.attack+upgrade*3+level(p)*2+bonus.attack,concentration:level(p)+(id==='hair'?1:0)}}
 function refineCost(p,form,id=p.equipped){if(!p.cityEntered||!p.owned.includes(id)||!Object.hasOwn(forms,form))return null;return p.refining[id].unlocked.includes(form)?0:forms[form].cost}
 function refine(p,form){const price=refineCost(p,form);if(price===null||p.coins<price||formOf(p)===form)return false;const entry=p.refining[p.equipped];p.coins-=price;if(!entry.unlocked.includes(form))entry.unlocked.push(form);entry.active=form;return true}
 const cost=(p,id=p.equipped)=>p.upgrades[id]>=upgradeLimit(p)?null:40+p.upgrades[id]*30;
 function upgrade(p){const price=cost(p);if(price===null||p.coins<price)return false;p.coins-=price;p.upgrades[p.equipped]++;return true}
 function equip(p,id){if(!p.owned.includes(id))return false;p.equipped=id;return true}
 function schoolReward(p){if(p.schoolReward)return false;p.schoolReward=true;p.coins+=80;p.owned.push('colored_paper');return true}
 function award(p,round){if(round!==p.round||round<0||round>=3)return false;p.coins=Math.min(999999,p.coins+opponents[round].prize);p.round++;if(p.round===3){p.owned.push('hair');p.guardUnlocked=true}return true}
 function train(p,grades){if(grades.length!==3||grades.some(g=>!['BAD','GOOD','PERFECT'].includes(g)))return false;p.xp=Math.min(trainingLimit(p),p.xp+1);p.coins=Math.min(999999,p.coins+5);return true}
 function grantHomeAllowance(p){if(p.homeAllowance||p.schoolReward)return false;p.homeAllowance=true;p.coins=Math.min(999999,p.coins+40);return true}
 function upgradeAtHome(p){if(p.schoolReward||!p.homeAllowance||p.homeUpgradeDone||p.equipped!=='newspaper')return false;if(!upgrade(p))return false;p.homeUpgradeDone=true;return true}
 function finishHomePractice(p,grades){if(!p.homeUpgradeDone||p.homePracticeDone||grades.length!==3||grades.some(g=>!['BAD','GOOD','PERFECT'].includes(g)))return false;p.homePracticeDone=true;p.xp=Math.min(trainingLimit(p),p.xp+3);return true}
 function enterCity(p){if(p.round!==3||p.cityEntered)return false;p.cityEntered=true;return true}
 function awardCity(p,round){if(!p.cityEntered||p.round!==3||!Number.isInteger(round)||round!==p.cityRound||round<0||round>=cityOpponents.length)return false;p.coins=Math.min(999999,p.coins+cityOpponents[round].prize);p.cityRound++;p.powerUnlocked=true;return true}
 function enterProvince(p){if(!p.cityEntered||p.cityRound!==3||p.provinceEntered)return false;p.provinceEntered=true;return true}
 function awardProvince(p,round){if(!p.provinceEntered||p.cityRound!==3||!Number.isInteger(round)||round!==p.provinceRound||round<0||round>=provinceOpponents.length)return false;p.coins=Math.min(999999,p.coins+provinceOpponents[round].prize);p.provinceRound++;return true}
 function intent(kind,turn){
  if(kind==='wall')return {defending:true,perfect:false,pierce:true};
  if(kind==='offbeat')return {defending:false,perfect:turn%2===1,weak:turn%2===0,pierce:false};
  if(kind==='champion')return {defending:turn%3===1,perfect:turn%3===2,weak:turn%3===0,pierce:false};
  const defending=(kind==='friend'&&turn%2===0)||(kind==='folder'&&turn%2===1)||(kind==='boss'&&turn%3===1);
  const perfect=(kind==='uncle'&&turn%3===0)||(kind==='sprinter'&&turn%2===0)||(kind==='boss'&&turn%3===0);
  return {defending,perfect,pierce:kind==='folder'};
 }
 const wager=(grade,active)=>active?(grade==='BAD'?.5:1.5):1;
 const damage=(base,attack,defending=false)=>Math.max(1,Math.round(base*attack/20*(defending ? .5 : 1)));
 const api={provinceOpponents,enterProvince,awardProvince,forms,formOf,refineCost,refine,grantHomeAllowance,upgradeAtHome,finishHomePractice,items,opponents,cityOpponents,upgradeLimit,trainingLimit,enterCity,awardCity,intent,wager,fresh,restore,level,stats,cost,upgrade,equip,schoolReward,award,train,damage};
 if(typeof module!=='undefined')module.exports=api;else root.TtakjiProgression=api;
})(globalThis);
