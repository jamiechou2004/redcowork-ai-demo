const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/app.js','utf8');
const helpers=source.slice(source.indexOf('  let toastTimer;'),source.indexOf('  function show('));
const voice=source.slice(source.indexOf('  const Speech='),source.indexOf("  document.querySelectorAll('[data-demo]')"));
function setup(supported=true){
 const nodes={};for(const id of ['voice','voice-status','thought'])nodes[id]={textContent:'',value:id==='thought'?'原来的文字':'',attrs:{},classList:{values:new Set(),add(x){this.values.add(x)},remove(x){this.values.delete(x)}},setAttribute(k,v){this.attrs[k]=v}};
 let next=0;const timers=new Map(),sessions=[];
 class Speech{constructor(){sessions.push(this)}start(){this.onstart()}stop(){this.onend()}abort(){this.onerror?.({error:'aborted'});this.onend()}}
 const ctx=vm.createContext({window:supported?{SpeechRecognition:Speech}:{},$:id=>nodes[id],state:{screen:'input'},invalidate(){},setTimeout(fn){timers.set(++next,fn);return next},clearTimeout(id){timers.delete(id)}});
 vm.runInContext('let recognition=null,recording=false,discardSpeech=false;'+helpers+voice,ctx);
 return {nodes,sessions,run:c=>vm.runInContext(c,ctx),expire(){for(const [id,fn]of timers){timers.delete(id);fn()}},timers};
}
let t=setup();assert.equal(t.nodes['voice-status'].textContent,'');t.nodes.voice.onclick();let s=t.sessions[0];assert.equal(t.nodes['voice-status'].textContent,'');s.onresult({results:[[{transcript:'想安静一点'}]]});assert.equal(t.nodes['voice-status'].textContent,'');t.nodes.voice.onclick();assert.match(t.nodes['voice-status'].textContent,/已转文字/);assert.equal(t.nodes.thought.value,'原来的文字想安静一点');t.expire();assert.equal(t.nodes['voice-status'].textContent,'');t.run('stopVoice()');assert.equal(t.nodes['voice-status'].textContent,'');
t.nodes.voice.onclick();s=t.sessions[1];t.run('stopVoice()');assert.match(t.nodes['voice-status'].textContent,/取消/);t.expire();t.run('stopVoice()');assert.equal(t.nodes['voice-status'].textContent,'');t.nodes.voice.onclick();s.onend();s.onresult({results:[[{transcript:'过期结果'}]]});assert.equal(t.nodes.voice.attrs['aria-pressed'],'true');assert(!t.nodes.thought.value.includes('过期'));
t.sessions[2].onerror({error:'not-allowed'});t.sessions[2].onend();assert.match(t.nodes['voice-status'].textContent,/失败/);t.expire();assert.equal(t.nodes['voice-status'].textContent,'');
t=setup(false);assert.equal(t.nodes['voice-status'].textContent,'');t.nodes.voice.onclick();assert.match(t.nodes['voice-status'].textContent,/不支持/);t.expire();assert.equal(t.nodes['voice-status'].textContent,'');
console.log('PASS: completion-only voice toast, expiry, text retention, cancellation, stale callbacks, failure and unsupported browser');
