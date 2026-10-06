'use strict';
const motionToggle = document.getElementById('motion-toggle');
const motionAllowed = () => !reduceMotion.matches && root.dataset.motion !== 'paused';
try { if (localStorage.getItem('portfolio-motion') === 'paused') root.dataset.motion = 'paused'; } catch {}
function syncMotion() {
  const paused = !motionAllowed();
  motionToggle.textContent = paused ? 'Motion paused' : 'Pause motion';
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.disabled = reduceMotion.matches;
  motionToggle.title = reduceMotion.matches ? 'Reduced motion is enabled in your system settings' : paused ? 'Resume animated effects' : 'Pause animated effects';
}
motionToggle.addEventListener('click', () => {
  root.dataset.motion = root.dataset.motion === 'paused' ? 'running' : 'paused';
  try { localStorage.setItem('portfolio-motion', root.dataset.motion); } catch {}
  syncMotion(); updateScene();
});
reduceMotion.addEventListener('change', syncMotion);
syncMotion();
const cursorRing = document.querySelector('.cursor-ring');
let cursorFrame = 0;
document.addEventListener('pointermove', e => {
  if (!motionAllowed() || !finePointer.matches) return;
  const x=e.clientX, y=e.clientY;
  cancelAnimationFrame(cursorFrame);
  cursorFrame=requestAnimationFrame(() => {
    const over=!!e.target.closest('a,button,summary');
    cursorRing.classList.add('active');cursorRing.classList.toggle('over',over);
    const radius=over?26:14;
    cursorRing.style.transform=`translate(${x-radius}px,${y-radius}px)`;
  });
},{passive:true});
document.addEventListener('pointerout', e=>{if(!e.relatedTarget)cursorRing.classList.remove('active');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cursorRing.classList.remove('active');});
const timeline=document.querySelector('.experience-list');
let sceneFrame=0;
function updateScene(){
  sceneFrame=0;
  const progress=Math.min(1,Math.max(0,window.scrollY/hero.offsetHeight));
  hero.style.setProperty('--hero-shift',motionAllowed()?`${progress*100}px`:'0px');
  hero.style.setProperty('--hero-opacity',motionAllowed()?String(1-progress*.65):'1');
  const box=timeline.getBoundingClientRect();
  timeline.style.setProperty('--timeline-progress',`${Math.max(0,Math.min(100,(innerHeight*.7-box.top)/box.height*100))}%`);
}
window.addEventListener('scroll',()=>{if(!sceneFrame)sceneFrame=requestAnimationFrame(updateScene);},{passive:true});
window.addEventListener('resize',updateScene);updateScene();
