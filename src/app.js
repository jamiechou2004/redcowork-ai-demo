(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const screens=['input','mood','recommend','departure','checkin'];
  const state={intent:null,mood:'chill',results:[],selected:null,seen:[],started:Date.now(),busy:false,run:0,record:null};
  function show(name){screens.forEach(s=>$(s+'-screen').hidden=s!==name);$('progress').innerHTML=screens.map((s,i)=>`<span class="${i<=screens.indexOf(name)?'active':''}"></span>`).join('');window.scrollTo(0,0);const heading=$(name+'-screen').querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
  function tags(items){return items.map(x=>`<span class="tag">${escape(x)}</span>`).join('');}
  function quick(){return [...$('quick-chips').querySelectorAll('[aria-pressed=true]')].map(x=>x.textContent);}
  function invalidate(){state.intent=null;$('understood').hidden=true;$('understand').textContent='就这些，帮我挑 →';}
  $('thought').addEventListener('input',invalidate);
  $('quick-chips').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true');invalidate();});
  $('example').onclick=()=>{$('thought').value=Samples.example;invalidate();};
  $('understand').onclick=async()=>{
    if(state.intent){$('intent-summary').innerHTML=tags([...state.intent.want,...state.intent.taste,...(state.intent.budget!==null?['人均 ¥'+state.intent.budget]:[])]);show('mood');return;}
    const text=$('thought').value.trim();if(!text&&!quick().length){$('input-error').textContent='先说一点你的感受，或选一个快捷补充。';return;}
    $('input-error').textContent='';$('understand').disabled=true;
    try{state.intent=await AI.understand(text,quick());$('understood').innerHTML='<div class="card-heading"><h2>我听懂了</h2><button id="edit-intent" class="text-btn">改一改</button></div>'+[['不要',state.intent.dislike],['想要',state.intent.want],['口味',state.intent.taste],['预算',state.intent.budget!==null?['人均 ¥'+state.intent.budget]:[]]].map(([label,values])=>`<div class="intent-row"><span>${label}</span><div>${values.length?tags(values):'<span class="muted">未提及 · 待确认</span>'}</div></div>`).join('')+'<p class="muted">离线规则初步理解，请核对后继续；未识别的细节不会自动纳入推荐。</p>';$('understood').hidden=false;$('understand').textContent='理解对了，继续 →';$('edit-intent').onclick=()=>{invalidate();$('thought').focus();};$('understood').scrollIntoView({behavior:'smooth',block:'nearest'});}catch(e){$('input-error').textContent=e.message;}finally{$('understand').disabled=false;}
  };
  document.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{state.mood=b.dataset.mood;document.querySelectorAll('[data-mood]').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',on);});});
  function dialog(title,html){$('dialog-title').textContent=title;$('dialog-content').innerHTML=html;$('detail-dialog').showModal();}
  $('close-dialog').onclick=()=>$('detail-dialog').close();
  $('home').onclick=e=>{e.preventDefault();state.run++;show('input');};
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function renderResults(){
    $('recommendations').innerHTML=state.results.map((b,i)=>`<article class="card bar-card ${b.id===state.selected?'selected':''}"><button class="bar-select" data-select="${b.id}" aria-expanded="${b.id===state.selected}"><span class="bar-heading"><strong>${escape(b.name)}</strong>${i===0?'<span class="pick">本批首选</span>':''}</span><span class="meta">${escape(b.area)} · 示例 ${b.distance}km · 人均 ¥${b.price}</span></button><div class="chips">${b.matchTags.map(t=>`<span class="tag ${t.ok?'match':'caution'}">${escape(t.label)}</span>`).join('')}</div>${b.id===state.selected?`<div class="reasons"><h3>为什么适合今晚的你 · 笔记依据</h3>${b.persuasion.reasons.map(r=>`<p>${escape(r)}</p>`).join('')}<blockquote class="quote">“${escape(b.persuasion.quote)}”<small>${escape(b.persuasion.source)}</small><button class="text-btn" data-note="${b.id}">看示例原笔记 ›</button></blockquote></div>`:`<p class="summary">${escape(b.notes[0].text)}</p>`}</article>`).join('');
    const selected=state.results.find(b=>b.id===state.selected);$('choose').textContent='就去「'+selected.name+'」';
  }
  function notes(bar){dialog(bar.name+' · 示例笔记',bar.notes.map(n=>`<div class="quote">${escape(n.text)}<small>${escape(n.source)}</small></div>`).join('')+'<p class="muted">虚构样本，不对应真实小红书笔记。</p>');}
  $('recommendations').onclick=e=>{const pick=e.target.closest('[data-select]'),note=e.target.closest('[data-note]');if(pick){state.selected=pick.dataset.select;renderResults();}if(note)notes(state.results.find(b=>b.id===note.dataset.note));};
  async function recommend(refresh=false){
    const run=++state.run;state.busy=true;show('recommend');$('loading').hidden=false;$('recommendations').innerHTML='';$('recommend-actions').hidden=true;$('recommend-error').hidden=true;
    let candidates=Samples.candidates.filter(b=>!refresh||!state.seen.includes(b.id));
    if(candidates.length<2){state.seen=[];candidates=Samples.candidates;}
    $('recommend-subtitle').textContent=`在 ${candidates.length} 家示例候选、${candidates.reduce((n,b)=>n+b.notes.length,0)} 段示例笔记中，为你找下一站。`;
    try{
      for(const step of ['正在读你的吐槽','正在翻 '+candidates.reduce((n,b)=>n+b.notes.length,0)+' 段示例笔记','正在按你此刻的状态排序']){$('loading-text').textContent=step;await pause(600);if(run!==state.run)return;}
      const matched=await AI.match(state.intent,state.mood,candidates);
      const results=await Promise.all(matched.map(async b=>({...b,persuasion:await AI.persuade(state.intent,b)})));
      if(run!==state.run)return;state.results=results;state.selected=results[0].id;state.seen.push(...results.map(b=>b.id));renderResults();$('recommend-actions').hidden=false;
    }catch(e){if(run===state.run){$('recommend-error-text').textContent=e.message||'生成失败，请再试一次。';$('recommend-error').hidden=false;}}
    finally{if(run===state.run){state.busy=false;$('loading').hidden=true;}}
  }
  $('recommend').onclick=()=>{state.seen=[];recommend();};
  $('skip').onclick=()=>{state.mood='chill';document.querySelectorAll('[data-mood]').forEach(b=>{const on=b.dataset.mood==='chill';b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});state.seen=[];recommend();};
  $('refresh').onclick=()=>recommend(true);$('retry').onclick=()=>recommend();$('revise').onclick=()=>show('input');
  const chosen=()=>state.results.find(b=>b.id===state.selected);
  $('choose').onclick=()=>{
    const b=chosen();state.record=null;$('departure-title').textContent='今晚，就去'+b.name+'。';
    const seconds=Math.max(1,Math.round((Date.now()-state.started)/1000));$('elapsed').textContent=`从吐槽到拍板，用了 ${Math.floor(seconds/60)} 分 ${seconds%60} 秒。`;
    $('chosen-card').innerHTML=`<div class="card"><div class="art" aria-hidden="true">${b.art}</div><h2>${escape(b.name)}</h2><p class="meta">${escape(b.area)} · 示例 ${b.distance}km · 人均 ¥${b.price}</p><div class="chips">${tags(b.tags.slice(0,3))}</div><p class="muted">到店前的小提醒：${escape(b.notes[2].text)}</p></div>`;show('departure');
  };
  $('notes').onclick=()=>notes(chosen());
  $('map').onclick=()=>dialog('导航尚未接入','<p>这是虚构店铺，不提供真实导航。正式版本需接入真实地址，并在出发前确认营业时间、价格和座位。</p>');
  $('share').onclick=()=>dialog('发给朋友 · 文案预览',`<p>今晚想去「${escape(chosen().name)}」，${escape(chosen().notes[0].text)}</p><p class="muted">演示文案，请自行复制；这里不会发送消息。店铺为虚构样本。</p>`);
  $('back-results').onclick=()=>show('recommend');
  show('input');
})();
