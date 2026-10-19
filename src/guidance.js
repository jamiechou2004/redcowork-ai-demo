/* Editable guidance data; independent of rendering and model selection. */
window.Guidance=(()=>{
 const groups=[
 {title:'① 刚那家哪里不对',items:['太吵了','太贵了','酒店风','人太多','太远了'],prefix:'刚那家',suffix:''},
 {title:'② 现在想要什么感觉',items:['安静能聊天','热闹一点','有现场音乐','想吃东西','能玩游戏'],prefix:'想找个',suffix:'的地方'},
 {title:'③ 口味',items:['酒偏甜','低度一点','有特调','不喝酒'],prefix:'',suffix:''},
 {title:'④ 预算和人数',items:['人均 100 内','人均 200 左右','预算无所谓','2 个人','4 个人'],prefix:'',suffix:''}];
 const exclusive=[['安静能聊天','热闹一点'],['人均 100 内','人均 200 左右','预算无所谓'],['2 个人','4 个人']];
 function toggle(selected,item){if(selected.includes(item))return selected.filter(x=>x!==item);const siblings=exclusive.find(g=>g.includes(item))||[];return [...selected.filter(x=>!siblings.includes(x)),item];}
 function sentence(selected){return groups.map(g=>{const words=g.items.filter(x=>selected.includes(x));if(!words.length)return '';const text=words.map(x=>x==='酒店风'?'太酒店风了':x==='人太多'?'人太多了':x).join('、');return g.prefix+text+g.suffix;}).filter(Boolean).join('，');}
 function syncDraft(current,previous,next){if(!current.trim()||current===previous)return next;if(previous&&current.includes(previous))return current.replace(previous,next).replace(/^，|，$/g,'');const oldParts=previous.split('，'),added=next.split('，').filter(x=>x&&!oldParts.includes(x)&&!current.includes(x));return [current,...added].filter(Boolean).join('，');}
 return {groups,toggle,sentence,syncDraft};
})();
