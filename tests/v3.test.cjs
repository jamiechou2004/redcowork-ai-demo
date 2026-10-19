const assert=require('node:assert/strict');const fs=require('node:fs'),vm=require('node:vm');const ctx=vm.createContext({window:{}});for(const f of ['samples.js','ai.js'])vm.runInContext(fs.readFileSync('src/'+f,'utf8'),ctx);const {AI,Samples}=ctx.window;
(async()=>{
 const unknown=await AI.understand('随便吧，不知道');assert(AI.needsClarification(unknown));
 assert(AI.needsClarification(await AI.understand('要安静又要热闹')));
 for(const option of ['安静聊天','热闹一点','想吃东西'])assert(!AI.needsClarification(AI.clarify(unknown,option)));
 const food=AI.clarify(unknown,'想吃东西');const choices=await AI.match(food,'chill',Samples.candidates);assert(choices[0].tags.includes('能吃东西'));assert.equal(choices.filter(c=>c.tags.includes('能吃东西')).length,2);
 assert((await AI.understand('适合 4 个人')).want.includes('适合 4 个人'));
 const quiet=await AI.understand('安静，预算150，不要甜酒');const noisy=Samples.candidates.filter(b=>b.tags.includes('热闹'));const ranked=await AI.match(quiet,'hype',noisy);assert(ranked.every(b=>b.matchTags.some(t=>t.label.includes('冲突'))));
 const neutral=await AI.understand('预算200');const a=await AI.match(neutral,'tired',Samples.candidates),b=await AI.match(neutral,'hype',Samples.candidates);assert.notEqual(a[0].id,b[0].id);
 const comparison=AI.compare(neutral,'tired',a[0],a[1]);assert(comparison.includes(a[1].name));assert(comparison.includes('未实时核验'));
 assert.equal(Samples.candidates.length,10);console.log('PASS: v3 clarification, food, group size, conflict labels, mood reorder and grounded comparison');
})().catch(e=>{console.error(e);process.exitCode=1});
