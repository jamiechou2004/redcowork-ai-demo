(() => {
  'use strict';
  const button = document.getElementById('mascot');
  const status = document.getElementById('mascot-status');
  let base = 'idle', timer = null, hovered = false, focused = false;
  const messages = {idle:'我在呢。点点我，碰个掌！', hover:'探个头，准备和你碰掌。', celebrate:'啪！为你做出的决定碰个掌。', comfort:'不合口味也没关系，我接住你的感受。'};
  function paint(value) {button.dataset.state=value;status.textContent=messages[value];}
  function rest() {paint(base === 'comfort' ? base : hovered || focused ? 'hover' : base);}
  function celebrate() {
    if (timer) return;
    paint('celebrate');
    timer=setTimeout(() => {timer=null;rest();},1400);
  }
  button.addEventListener('pointerenter',e => {if(e.pointerType==='mouse'){hovered=true;if(!timer)rest();}});
  button.addEventListener('pointerleave',() => {hovered=false;if(!timer)rest();});
  button.addEventListener('focus',() => {focused=true;if(!timer)rest();});
  button.addEventListener('blur',() => {focused=false;if(!timer)rest();});
  button.addEventListener('click',celebrate);
  window.Mascot={
    reset() {clearTimeout(timer);timer=null;base='idle';hovered=false;focused=false;paint(base);},
    feedback(value) {clearTimeout(timer);timer=null;base=value==='bad'?'comfort':'idle';if(value==='good')celebrate();else rest();}
  };
})();
