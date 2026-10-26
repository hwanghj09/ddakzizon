const test=require('node:test');const assert=require('node:assert/strict');const R=require('../rules.js');
test('timing needle returns through both ends and center',()=>{assert.equal(R.positionAt(0),0);assert.equal(R.positionAt(375),.5);assert.equal(R.positionAt(750),1);assert.equal(R.positionAt(1125),.5);assert.equal(R.positionAt(1500),0)});
test('accurate timing produces stronger damage',()=>{assert.equal(R.judge(.5),'PERFECT');assert.equal(R.judge(.35),'GOOD');assert.equal(R.judge(.1),'BAD');assert.ok(R.damage('PERFECT')>R.damage('GOOD'));assert.ok(R.damage('GOOD')>R.damage('BAD'))});
test('intro opponent survives even a perfect first hit',()=>assert.equal(R.hit(160,'PERFECT'),120));
test('fair battle can be won and health never goes negative',()=>{let hp=100;for(let i=0;i<3;i++)hp=R.hit(hp,'PERFECT');assert.equal(hp,0);assert.equal(R.hit(4,'BAD'),0)});
