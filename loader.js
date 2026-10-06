(() => {
  const root = document.documentElement;
  const overlay = document.querySelector('.page-loader');
  const bar = document.querySelector('#loader-bar');
  const percent = document.querySelector('#loader-percent');
  const start = performance.now();
  let dismissed = false;
  function finish() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(window.loaderFailsafe);
    const focused = overlay.contains(document.activeElement);
    root.classList.remove('is-loading');
    overlay.setAttribute('aria-hidden', 'true');
    if (focused) document.querySelector('.wordmark').focus({preventScroll:true});
  }
  document.querySelector('.loader-skip').addEventListener('click', finish);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') finish(); });
  const image = document.querySelector('.hero-avatar');
  const tasks = [new Promise(resolve => {
    if (image.complete) resolve();
    else { image.addEventListener('load',resolve,{once:true}); image.addEventListener('error',resolve,{once:true}); }
  }), document.fonts ? document.fonts.ready : Promise.resolve()];
  let loaded=0;
  Promise.allSettled(tasks.map(task=>Promise.resolve(task).finally(()=>{
    loaded++;
    const progress = Math.round(loaded / tasks.length * 100);
    bar.style.width = `${progress}%`;
    percent.textContent = `${progress}%`;
  }))).then(()=>{
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let paused=false;try{paused=localStorage.getItem('portfolio-motion')==='paused'}catch{}
    const minimum = reduced || paused ? 0 : 1100;
    setTimeout(finish,Math.max(0,minimum-(performance.now()-start)));
  });
  setTimeout(finish,4500);
})();
