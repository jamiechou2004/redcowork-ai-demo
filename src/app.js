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
  const storageKey='tonight-checkins-v1';let history=[],storageOkay=true;
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))history=saved.filter(x=>x&&typeof x.id==='string'&&typeof x.date==='string'&&typeof x.bar==='string').slice(-100);}catch{storageOkay=false;}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(history.slice(-100)));}catch{storageOkay=false;}$('storage-status').textContent=storageOkay?'已保存在当前浏览器。':'浏览器存储不可用，本次记录仅在当前页面保留。';}
  function dateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  $('checkin').onclick=()=>{
    const now=new Date(),b=chosen();if(!state.record){state.record={id:String(Date.now())+'-'+Math.random().toString(36).slice(2),date:dateKey(now),bar:b.id,feedback:null};history.push(state.record);save();}
    const monday=new Date(now);monday.setDate(now.getDate()-(now.getDay()+6)%7);monday.setHours(0,0,0,0);
    $('week').innerHTML=['一','二','三','四','五','六','日'].map((day,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);const done=history.some(r=>r.date===dateKey(d));return `<div class="day ${done?'done':''}">周${day}<span aria-label="${dateKey(d)} ${done?'已打卡':'未打卡'}">${done?'✓':d.getDate()}</span></div>`;}).join('');
    const count=history.filter(r=>r.date>=dateKey(monday)&&r.date<=dateKey(now)).length;$('streak').textContent=`本周已果断决定 ${count} 次 · ${count>=3?'已解锁「不纠结」徽章':'再 '+(3-count)+' 次解锁「不纠结」徽章'}`;
    $('collection').innerHTML=`<small>YOUR NIGHT COLLECTION / ${String(history.length).padStart(2,'0')}</small><h2>${escape(b.name)}</h2><p>已存入本机「深圳夜晚地图」· 示例集卡</p>`;
    document.querySelectorAll('[data-feedback]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.feedback===state.record.feedback)));$('feedback-message').textContent='每一次反馈，都让下一次更有方向。';show('checkin');
  };
  $('feedback').onclick=e=>{const b=e.target.closest('[data-feedback]');if(!b||!state.record)return;state.record.feedback=b.dataset.feedback;save();document.querySelectorAll('[data-feedback]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('feedback-message').textContent=b.dataset.feedback==='bad'?'已记下这次不合口味。产品设想：3 天后回访并提供饮品券；本 Demo 尚未接入通知和发券。':'反馈已记录。正式接入个性化后，可用来调整下次推荐。';};
  $('finish').onclick=()=>{state.started=Date.now();state.record=null;state.results=[];state.seen=[];$('thought').value='';document.querySelectorAll('#quick-chips button').forEach(b=>b.setAttribute('aria-pressed','false'));invalidate();show('input');};
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;let recognition=null,recording=false;
  if(!Speech){$('voice').disabled=true;$('voice-status').textContent='当前浏览器不支持语音，请直接输入文字。';}
  else{
    $('voice-status').textContent='可点击语音输入；识别服务取决于浏览器和网络。';
    $('voice').onclick=()=>{
      if(recording){recognition.stop();return;}
      recognition=new Speech();recognition.lang='zh-CN';recognition.interimResults=false;
      recognition.onstart=()=>{recording=true;$('voice').classList.add('recording');$('voice').setAttribute('aria-label','停止语音输入');$('voice-status').textContent='正在听，点击按钮结束……';};
      recognition.onresult=e=>{$('thought').value+=Array.from(e.results).map(r=>r[0].transcript).join('');invalidate();$('voice-status').textContent='语音已转文字，请核对后继续。';};
      recognition.onerror=()=>{$('voice-status').textContent='语音暂不可用或权限未开启，请直接输入文字。';};
      recognition.onend=()=>{recording=false;$('voice').classList.remove('recording');$('voice').setAttribute('aria-label','开始语音输入');if($('voice-status').textContent.startsWith('正在听'))$('voice-status').textContent='录音已结束，可重新录制或输入文字。';};
      try{recognition.start();}catch{$('voice-status').textContent='语音启动失败，请直接输入文字。';}
    };
  }
  show('input');
})();
