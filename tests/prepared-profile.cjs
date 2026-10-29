const J=require('../journey-data.js');
module.exports=p=>{p.map.poster=true;p.journey={stages:Object.fromEntries(J.episodes.map(e=>[e.id,2])),pending:null};return p};
