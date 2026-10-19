const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({window:{}});
for(const file of ['samples.js','ai.js'])vm.runInContext(fs.readFileSync('src/'+file,'utf8'),context);
const {AI,Samples}=context.window;
(async()=>{
  const intent=await AI.understand(Samples.example,[]);
  assert.equal(intent.budget,200);assert(intent.dislike.includes('吵'));assert(intent.want.includes('安静'));assert(intent.taste.includes('酒偏甜'));
  assert.equal((await AI.understand('预算两百五十')).budget,250);
  assert.equal((await AI.understand('人均 0')).budget,0);
  assert.equal((await AI.understand('想坐一会')).budget,null);
  assert(!(await AI.understand('不要甜的酒')).taste.includes('酒偏甜'));
  const neutral={dislike:[],want:[],taste:[],budget:null,mood:null};
  const tired=await AI.match(neutral,'tired',Samples.candidates);
  const hype=await AI.match(neutral,'hype',Samples.candidates);
  assert(tired[0].distance<hype[0].distance,'mood changes distance ranking');
  const ranked=await AI.match(intent,'chill',Samples.candidates);
  assert.equal(ranked.length,3);assert.equal(new Set(ranked.map(b=>b.id)).size,3);
  for(const bar of ranked){const evidence=await AI.persuade(intent,bar);assert(bar.notes.some(n=>n.text===evidence.quote&&n.source===evidence.source));}
  const next=await AI.match(intent,'chill',Samples.candidates.filter(b=>!ranked.some(x=>x.id===b.id)));
  assert(next.every(b=>!ranked.some(x=>x.id===b.id)));
  const expensive=await AI.match({...neutral,budget:100},'chill',Samples.candidates);
  assert(expensive.every(b=>b.matchTags.some(t=>t.label.includes(b.price>100?'超预算':'预算内'))));
  await assert.rejects(()=>AI.match(intent,'chill',[]),/没找到够合适/);
  await assert.rejects(()=>AI.callModel([]),/尚未配置/);
  console.log('PASS: intent extraction, budgets, negation, mood weighting, ranking, evidence, pagination, budget warnings, insufficient candidates and unconfigured model.');
})().catch(e=>{console.error(e);process.exitCode=1;});
