/* Data helpers shared by the UI and dependency-free tests. */
window.Flow = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const split = value => [...new Set(value.split(/[,，、\n]/).map(x=>x.trim()).filter(Boolean))].slice(0,20);
  function number(value,max) {if(value.trim()==='')return null;const n=Number(value);if(!Number.isFinite(n)||n<0||n>max)throw new Error('请填写有效的非负数值。');return n;}
  function candidate(data,id) {
    const name=data.name.trim(),text=data.text.trim();if(!name||!text)throw new Error('请填写店名和原文片段。');
    let url='';if(data.url.trim()){const u=new URL(data.url);if(!['http:','https:'].includes(u.protocol))throw new Error('笔记链接需要以 http 或 https 开头。');url=u.href;}
    return {id,name:name.slice(0,60),area:data.area.trim()||'区域待确认',price:number(data.price,100000),distance:number(data.distance,10000),tags:data.tags,art:'◒',manual:true,notes:[{id:id+'-0',text:text.slice(0,1500),source:data.source.trim()||'用户手动提供 · 未独立核验',url}]};
  }
  function meta(b) {return [b.area,b.distance===null?'距离待确认':(b.manual?'填写距离 ':'示例 ')+b.distance+'km',b.price===null?'价格待确认':'人均 ¥'+b.price].join(' · ');}
  function nextBatch(pool,seen) {return pool.filter(b=>!seen.includes(b.id));}
  function saveRecord(history,record){if(!history.some(r=>r.id===record.id))history.push(record);return history.slice(-100);}
  return {escape,split,number,candidate,meta,nextBatch,saveRecord};
})();
