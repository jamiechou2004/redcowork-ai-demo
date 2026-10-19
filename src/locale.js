/* Optional English presentation, sharing the same state machine and ranking logic. */
window.Locale=(()=>{
 const en=new URLSearchParams(location.search).get('lang')==='en';
 const dict=window.EnglishStrings||{};
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp(Object.keys(dict).sort((a,b)=>b.length-a.length).map(escape).join('|'),'g');
 const text=value=>en?String(value??'').replace(pattern,key=>dict[key]):String(value??'');
 function normalize(value){
  let s=String(value??'');if(!en)return s;
  // Handle negation before positive keywords so “not quiet” never becomes “quiet”.
  s=s.replace(/\b(?:not|don't want|do not want|no)\s+(?:somewhere\s+)?quiet\b/gi,'不要安静 热闹');
  s=s.replace(/\b(?:not|don't want|do not want|no)\s+(?:somewhere\s+)?(?:lively|loud|noisy)\b/gi,'不要吵 安静');
  s=s.replace(/\b(?:not|don't want|do not want|no|less)\s+sweet(?:\s+drinks?)?\b/gi,'不要甜的酒');
  // Translate known option labels back to stable internal tags first.
  const labels=[...Guidance.groups.flatMap(g=>g.items),...Guidance.clarifyItems,'安静','热闹','能聊天','现场音乐','近一点','预算友好','适合 4 个人','适合 2 个人'];
  for(const label of labels.sort((a,b)=>text(b).length-text(a).length)){
   const v=text(label);if(v!==label)s=s.replace(new RegExp('\\b'+escape(v)+'\\b','gi'),label);
  }
  const rules=[[/\b(?:too loud|too noisy|can't (?:hear|talk)|cannot (?:hear|talk))\b/gi,'太吵了'],[/\b(?:quiet|quieter|peaceful)\b/gi,'安静'],[/\b(?:chat|talk|conversation)\b/gi,'聊天'],[/\b(?:dance|dancing|clubbing|club|lively|livelier|energetic)\b/gi,'热闹'],[/\b(?:live music|live band|gig)\b/gi,'现场音乐'],[/\b(?:hungry|food|eat|meal|snacks?)\b/gi,'吃东西'],[/\b(?:too far|closer|nearby|near me|walking distance|close by)\b/gi,'近一点'],[/\b(?:sweet|sweeter)\b/gi,'酒偏甜'],[/\b(?:too expensive|cheaper|lower budget|cheap|affordable)\b/gi,'预算友好'],[/\b(?:crowded|fewer people)\b/gi,'人少一点'],[/\b(?:games?|board games?)\b/gi,'能玩游戏'],[/\b(?:low alcohol|low abv)\b/gi,'低度一点'],[/\b(?:no alcohol|non-alcoholic|don't drink)\b/gi,'不喝酒'],[/\b(?:signature cocktails?)\b/gi,'有特调'],[/\b(?:dim lighting|dim lights?)\b/gi,'灯光暗一点'],[/\b(?:hotel bar|hotel-bar)\b/gi,'不要酒店风'],[/\b(?:no budget limit|unlimited budget|budget doesn't matter)\b/gi,'预算无所谓'],[/\b(?:four|4)\s*(?:people|of us|friends)\b/gi,'4 个人'],[/\b(?:two|2)\s*(?:people|of us|friends)\b/gi,'2 个人']];
  for(const [r,v]of rules)s=s.replace(r,v);
  s=s.replace(/(?:CNY|RMB|budget(?: of)?|under|around|up to)\s*(\d+)/gi,'预算$1').replace(/\b(\d+)\s*(?:each|per person|a head)\b/gi,'人均$1');
  return s;
 }
 const langLink=document.createElement('a');langLink.className='language-switch';const url=new URL(location.href);if(en)url.searchParams.delete('lang');else url.searchParams.set('lang','en');langLink.href=url.href;langLink.textContent=en?'中文':'EN';langLink.lang=en?'zh-CN':'en';langLink.setAttribute('aria-label',en?'Switch to Chinese':'Switch to English');document.querySelector('.topbar nav').prepend(langLink);
 if(!en)return {en,text,normalize};
 document.documentElement.lang='en';document.title='Where Tonight · Interactive prototype';
 const understand=AI.understand;AI.understand=(s,chips=[])=>understand(normalize(s),chips.map(normalize));
 Guidance.sentence=(selected,custom=[])=>Guidance.selectionLabels(selected,custom).map(text).join(', ');
 const merge=Guidance.merge;Guidance.merge=(a,b,s='')=>merge(a,b,normalize(s));
 const complete=Guidance.complete;Guidance.complete=s=>complete(normalize(s));
 const createReview=Review.create;Review.create=opts=>{const r=createReview(opts),track=r.track;r.track=e=>track(e.text?{...e,text:normalize(e.text)}:e);return r;};
 const recap=Conversation.recap;
 Conversation.recap=(intent,count)=>{const chip=(field,i,label)=>`<button class="intent-chip" data-intent-field="${field}" data-intent-index="${i}">${Flow.escape(text(label))}</button>`;const list=field=>intent[field].map((v,i)=>chip(field,i,v)).join(', ');return `Got it. I'll compare <strong>${count} places</strong> from your shortlist.${intent.want.length?' Looking for: '+list('want')+'.':''}${intent.taste.length?' Drink preferences: '+list('taste')+'.':''}${intent.budget!==null?' Budget per person: '+chip('budget',0,'¥'+intent.budget)+'.':''}${intent.dislike.length?' Avoid: '+list('dislike')+'.':''}`;};
 const candidate=Flow.candidate;Flow.candidate=(data,id)=>candidate({...data,tags:data.tags.map(normalize)},id);
 // Translate text nodes and accessible labels only; action IDs and data values stay untouched.
 function translate(root){
  if(root.nodeType===Node.TEXT_NODE){if(root.parentElement?.closest('script,style,.language-switch'))return;const v=text(root.nodeValue);if(v!==root.nodeValue)root.nodeValue=v;return;}
  if(root.nodeType!==Node.ELEMENT_NODE)return;
  if(root.matches('script,style,.language-switch'))return;
  for(const attr of ['placeholder','aria-label','alt','title'])if(root.hasAttribute(attr)){const v=text(root.getAttribute(attr));if(v!==root.getAttribute(attr))root.setAttribute(attr,v);}
  for(const child of root.childNodes)translate(child);
 }
 translate(document.body);
 new MutationObserver(records=>{for(const r of records){if(r.type==='childList')r.addedNodes.forEach(translate);else translate(r.target);}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','alt','title']});
 return {en,text,normalize};
})();
