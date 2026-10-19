/* Reviewer orientation and observable task completion. No background notifications. */
window.Review=(()=>{
 const tests=[
 {text:'用一句吐槽开始',detail:'例：刚那家太吵了，想安静点，酒偏甜，人均两百',fill:'刚那家太吵了，想安静点，酒偏甜，人均两百'},
 {text:'换种说法再试',detail:'想找个能蹦迪的地方，越热闹越好',fill:'想找个能蹦迪的地方，越热闹越好'},
 {text:'把状态切到「放开玩」',detail:'在推荐卡里切换，看看排序和地图变化'},
 {text:'直接打字「太远了」',detail:'在推荐阶段发一句话，看看新的排序'},
 {text:'选一家出发，走到打卡',detail:'完成今晚的一个决定'}];
 const key='tonight-review-guide-v2',progressKey='tonight-review-tests-v2';
 const stages={context:['等待输入','可以打字、语音或点选提示。'],first:['等待输入','可以打字、语音或点选提示。'],complaint:['等待输入','可以打字、语音或点选提示。'],clarify:['AI · 听懂','吐槽 → 不要 / 想要 / 口味 / 预算。太模糊会追问，不会硬推荐。'],recap:['AI · 听懂','吐槽 → 不要 / 想要 / 口味 / 预算。太模糊会追问，不会硬推荐。'],mood:['只问一个问题','你此刻的状态决定距离和氛围的权重。'],recommend:['AI · 匹配 + 说服','偏好 + 此刻状态 + 候选笔记 → 三家排序 + 理由。只用笔记里的信息，冲突如实标出。'],departure:['闭环','愉悦来自「完成了一个决定」。推荐不合适时 3 天后回访（设计规划，当前 Demo 不会自动发送回访）。'],celebrate:['闭环','愉悦来自「完成了一个决定」。推荐不合适时 3 天后回访（设计规划，当前 Demo 不会自动发送回访）。'],feedback:['闭环','记下哪里不合适，帮助下一次更好地决定。'],end:['闭环','今晚的决定已完成，仍可继续选下一站。']};
 function create({fillDraft}){
 let done=[false,false,false,false,false];try{const v=JSON.parse(localStorage.getItem(progressKey)||'null');if(Array.isArray(v)&&v.length===5)done=v.map(x=>x===true);}catch{}
 const $=id=>document.getElementById(id),esc=Flow.escape;
 const list=(interactive=true)=>`<ol class="review-test-list">${tests.map((t,i)=>`<li class="${done[i]?'test-done':''}"><span class="test-number">${done[i]?'✓':i+1}</span><div><strong>${esc(t.text)}</strong><p>${esc(t.detail)}</p>${interactive&&t.fill?`<button class="fill-test" data-fill-test="${i}">填入</button>`:''}</div></li>`).join('')}</ol>`;
 const guide=document.createElement('dialog');guide.id='review-guide';guide.setAttribute('aria-labelledby','review-title');guide.innerHTML=`<div class="review-card"><span class="review-eyebrow">给评审的 3 分钟导览</span><h1 id="review-title">今晚去哪<span>第一家不满意的时候，<br>帮你定下一家</span></h1><div class="review-story"><h2>为什么做它</h2><p>那晚我们在深圳换了五个区，从南山到后海，最后店都关门了。小红书给了无数选择，却没帮我们做出选择。</p><h2>你要扮演谁</h2><p>你是一群朋友里负责拍板的人。晚上 10 点，你们刚从前海一家太吵的酒店酒吧出来，还想再坐坐，但收藏里十几家店每家都很好。</p></div><h2>建议做 5 个小测试</h2>${list(false)}<button class="primary" id="start-review">开始体验</button><button class="text-link" id="skip-review">跳过，直接看 Demo</button><p class="review-footnote">所有店铺与笔记为虚构示例</p></div>`;document.body.append(guide);
 const sheet=document.createElement('dialog');sheet.id='review-sheet';sheet.setAttribute('aria-labelledby','sheet-title');sheet.innerHTML='<div class="modal-head"><strong id="sheet-title"></strong><button id="close-tests" aria-label="关闭小测试">×</button></div><div id="sheet-tests"></div>';document.body.append(sheet);
 function showGuide(){if(!$('modal').open&&!guide.open)guide.showModal();}
 function closeGuide(){try{localStorage.setItem(key,'done');}catch{}guide.close();}
 $('start-review').onclick=closeGuide;$('skip-review').onclick=closeGuide;guide.addEventListener('cancel',()=>{try{localStorage.setItem(key,'done');}catch{}});
 $('close-tests').onclick=()=>sheet.close();$('mobile-tests').onclick=()=>sheet.showModal();
 function draw(){const count=done.filter(Boolean).length,label=`小测试 ${count}/5`,thanks=count===5?'<p class="test-thanks">感谢体验！完整设计思路见<a href="../docs/product-overview.html" target="_blank" rel="noopener">产品说明</a>。</p>':'';$('test-count').textContent=label;$('mobile-tests').textContent=label;$('sheet-title').textContent=label;const content=list()+thanks;$('desktop-tests').innerHTML=content;$('sheet-tests').innerHTML=content;}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-fill-test]');if(!b)return;fillDraft(tests[Number(b.dataset.fillTest)].fill);if(sheet.open)sheet.close();});
 function mark(index){if(done[index])return;done[index]=true;try{localStorage.setItem(progressKey,JSON.stringify(done));}catch{}draw();}
 function track(event){if(event.type==='input'&&['complaint','clarify','recap','recommend'].includes(event.stage)){if(Guidance.preferenceCount(event.intent)>0)mark(0);if(/蹦迪|热闹/.test(event.text)&&event.intent.want.includes('热闹'))mark(1);if(event.stage==='recommend'&&/太远/.test(event.text))mark(3);}if(event.type==='rerank'&&event.mood==='hype')mark(2);if(event.type==='checkin')mark(4);}
 let last='';function sync(stage,activity){const content=stages[stage]||stages.context;const id=stage+activity;if(id===last)return;last=id;$('ai-explainer').innerHTML=`<span class="explain-kicker">${activity==='正在理解…'||activity==='正在翻笔记…'?esc(activity):'此刻的任务'}</span><h3>${content[0]}</h3><p>${content[1]}</p>`;}
 draw();sync('context','');let seen=false;try{seen=localStorage.getItem(key)==='done';}catch{}if(!seen)showGuide();return{track,sync,showGuide,resetTests(){done=[false,false,false,false,false];try{localStorage.setItem(progressKey,JSON.stringify(done));}catch{}draw();}};
 }
 return {create};
})();
