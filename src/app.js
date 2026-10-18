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
  show('input');
})();
