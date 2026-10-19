/* Editable guidance data; independent of rendering and model selection. */
window.Guidance=(()=>{
 const groups=[
 {title:'① 刚那家哪里不对',items:['太吵了','太贵了','酒店风','人太多','太远了'],prefix:'刚那家',suffix:''},
 {title:'② 现在想要什么感觉',items:['安静能聊天','热闹一点','有现场音乐','想吃东西','能玩游戏'],prefix:'想找个',suffix:'的地方'},
 {title:'③ 口味',items:['酒偏甜','低度一点','有特调','不喝酒'],prefix:'',suffix:''},
 {title:'④ 预算和人数',items:['人均 100 内','人均 200 左右','预算无所谓','2 个人','4 个人'],prefix:'',suffix:''}];
 const exclusive=[['安静能聊天','热闹一点'],['人均 100 内','人均 200 左右','预算无所谓'],['2 个人','4 个人']];
 function toggle(selected,item){if(selected.includes(item))return selected.filter(x=>x!==item);const siblings=exclusive.find(g=>g.includes(item))||[];return [...selected.filter(x=>!siblings.includes(x)),item];}
 function sentence(selected,custom=[]){return groups.map((g,index)=>{const words=[...g.items.filter(x=>selected.includes(x)),...custom.filter(x=>x.group===index&&selected.includes(x.id)).map(x=>x.text)];if(!words.length)return '';const text=words.map(x=>x==='酒店风'?'太酒店风了':x==='人太多'?'人太多了':x).join('、');return g.prefix+text+g.suffix;}).filter(Boolean).join('，');}
 function syncDraft(current,previous,next){if(!current.trim()||current===previous)return next;if(previous&&current.includes(previous))return current.replace(previous,next).replace(/^，|，$/g,'');const oldParts=previous.split('，'),added=next.split('，').filter(x=>x&&!oldParts.includes(x)&&!current.includes(x));return [current,...added].filter(Boolean).join('，');}
 const completions={
 fun:{pattern:/好玩|有意思|嗨/,items:['热闹一点','有现场音乐','能玩游戏','适合一群人']},
 quiet:{pattern:/安静|聊天|吵/,items:['能好好聊天','灯光暗一点','人少一点']},
 food:{pattern:/吃|饿|夜宵/,items:['能吃正餐','小吃配酒','还在营业的']},
 drink:{pattern:/喝|酒|甜/,items:['酒偏甜','低度一点','有特调']},
 distance:{pattern:/近|远|累/,items:['走路能到','打车 10 分钟内','远点也行']},
 budget:{pattern:/钱|预算|便宜|人均/,items:['人均 100 内','人均 200 左右','预算无所谓']}
 };
 const placeholders=['比如：想找个安静能聊天的，人均两百','比如：刚那家太吵了，想换个氛围','比如：想吃点东西，离这里近一点'];
 function complete(text){const groups=Object.values(completions).filter(g=>g.pattern.test(text));return [...new Set(groups.flatMap(g=>g.items))].filter(x=>!text.includes(x)).slice(0,4);}
 function preferenceCount(intent){return new Set([...intent.want,...intent.dislike,...intent.taste]).size+(intent.budget===null?0:1);}
 function merge(previous,next,text=''){if(!previous)return next;const result={...next};for(const k of ['want','dislike','taste'])result[k]=[...new Set([...previous[k],...next[k]])];if(next.want.includes('热闹')&&!next.want.includes('安静'))result.want=result.want.filter(x=>!['安静','能聊天'].includes(x));if(next.want.includes('安静')&&!next.want.includes('热闹'))result.want=result.want.filter(x=>x!=='热闹');if(next.budget===null)result.budget=/预算无所谓/.test(text)?null:previous.budget;return result;}
 const clarifyItems=['热闹一点','有现场音乐','能玩游戏','安静聊天','想吃东西'];
 function toggleClarify(selected,item){let next=selected.includes(item)?selected.filter(x=>x!==item):[...selected,item];if(!selected.includes(item)&&['热闹一点','安静聊天'].includes(item))next=next.filter(x=>x===item||!['热闹一点','安静聊天'].includes(x));return next;}
 function selectionLabels(selected,custom=[]){return selected.map(id=>custom.find(x=>x.id===id)?.text||id);}
 function applyCustom(intent,custom,text){const result={...intent,dislike:[...intent.dislike],want:[...intent.want],taste:[...intent.taste]};for(const item of custom){if(!text.includes(item.text))continue;const field=item.group===0?'dislike':item.group===2?'taste':'want';if(item.group===3&&/人均|预算/.test(item.text)&&result.budget!==null)continue;if(!result[field].includes(item.text))result[field].push(item.text);}return result;}
 return {selectionLabels,applyCustom,groups,toggle,sentence,syncDraft,completions,placeholders,complete,preferenceCount,merge,clarifyItems,toggleClarify};
})();
