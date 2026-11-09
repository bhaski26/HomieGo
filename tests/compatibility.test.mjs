import test from 'node:test'; import assert from 'node:assert/strict';
const score=(a,b)=>{const budget=Math.max(0,100-Math.abs(a.budget-b.budget)/100); const food=a.food===b.food?100:65; const clean=a.clean===b.clean?100:70; return Math.round(.4*budget+.3*food+.3*clean)};
test('aligned preferences score highly',()=>assert.ok(score({budget:28000,food:'Vegetarian',clean:'Tidy'},{budget:28000,food:'Vegetarian',clean:'Tidy'})>95));
test('different preferences lower score',()=>assert.ok(score({budget:15000,food:'Vegan',clean:'Tidy'},{budget:40000,food:'Non-vegetarian',clean:'Relaxed'})<75));
