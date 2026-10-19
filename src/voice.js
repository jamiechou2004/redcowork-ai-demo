/* Session-scoped speech input. Old callbacks can never mutate a newer draft. */
window.Voice={attach({button,input,toast,onStatus=()=>{},onDraft=()=>{}}){
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;let active=null;
 function reset(){button.classList.remove('recording');button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','开始语音输入');onStatus(false);}
 function cancel(){if(!active)return;const s=active;active=null;reset();try{s.abort();}catch{}toast('录音已取消，已有文字已保留。');}
 button.onclick=()=>{if(active){try{active.stop();}catch{cancel();}return;}if(!Speech){toast('当前浏览器不支持语音，请打字输入。');return;}
 const s=new Speech();active=s;s.lang='zh-CN';s.interimResults=false;let failed=false,received=false;
 s.onstart=()=>{if(active!==s)return;button.classList.add('recording');button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','完成语音输入');onStatus(true);};
 s.onresult=e=>{if(active!==s)return;for(let i=e.resultIndex||0;i<e.results.length;i++){if(e.results[i].isFinal!==false){input.value+=e.results[i][0].transcript;received=true;onDraft();}}};
 s.onerror=()=>{if(active===s)failed=true;};s.onend=()=>{if(active!==s)return;active=null;reset();toast(failed?'语音识别失败，已有文字已保留。':received?'语音已转文字，确认后发送。':'没有听清，请再试一次。');};
 try{s.start();}catch{active=null;reset();toast('无法启动录音，请检查麦克风权限。');}
 };return {cancel};
}};
