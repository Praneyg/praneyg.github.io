'use strict';
const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const syncTheme = () => {
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  themeButton.title = `Switch to ${dark ? 'light' : 'dark'} theme`;
  document.querySelector('meta[name="theme-color"]').content = dark ? '#09090c' : '#f7f6fa';
};
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('portfolio-theme-v2', root.dataset.theme); } catch {}
  syncTheme();
});
syncTheme();

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const closeMenu = () => { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); };
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

const openHashTarget = () => {
  let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement) target.open = true;
};
window.addEventListener('hashchange', openHashTarget);
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  const target = document.getElementById(link.getAttribute('href').slice(1));
  if (target instanceof HTMLDetailsElement) target.open = true;
}));
openHashTarget();

const filters = [...document.querySelectorAll('.filter')];
const papers = [...document.querySelectorAll('.paper')];
filters.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  document.querySelector('.paper-list').classList.toggle('filtered', selected !== 'all');
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  papers.forEach(paper => { paper.hidden = selected !== 'all' && paper.dataset.status !== selected; if (!paper.hidden) count++; });
  document.querySelector('.result-count').textContent = `Showing ${count} ${count === 1 ? 'paper' : 'papers'}`;
}));

let toastTimer;
const notify = message => {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
};
async function copyText(text, message) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const field = document.createElement('textarea');
      field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.append(field); field.select();
      const copied = document.execCommand('copy'); field.remove();
      if (!copied) throw new Error('Clipboard unavailable');
    }
    notify(message);
  } catch { notify('Copy unavailable in this browser. Please select and copy the text.'); }
}
document.querySelector('#copy-email').addEventListener('click', () => copyText('praneyygoyal@gmail.com', 'Email address copied'));

document.querySelectorAll('.copy-citation').forEach(button => button.addEventListener('click', () => copyText(button.dataset.citation, 'Citation copied')));
document.querySelector('#year').textContent = new Date().getFullYear();

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...navigation.querySelectorAll('a')];
let ticking = false;
function updateScroll() {
  const range = root.scrollHeight - window.innerHeight;
  document.querySelector('.reading-progress').style.width = `${range > 0 ? Math.min(100, window.scrollY / range * 100) : 0}%`;
  let active = 'home';
  sections.forEach(section => { if (section.getBoundingClientRect().top <= 160) active = section.id; });
  navLinks.forEach(link => { if (link.hash === `#${active}`) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current'); });
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();

document.querySelectorAll('[data-calibration]').forEach(button => button.addEventListener('click', () => {
  const overconfident = button.dataset.calibration === 'overconfident';
  document.querySelectorAll('[data-calibration]').forEach(control => {
    control.classList.toggle('selected', control === button);
    control.setAttribute('aria-pressed', String(control === button));
  });
  const points = overconfident ? [197, 169, 143, 117] : [175, 125, 75, 25];
  const path = `M48 225L134 ${points[0]}L220 ${points[1]}L306 ${points[2]}L392 ${points[3]}`;
  document.querySelector('#model-line').setAttribute('d', path);
  document.querySelector('#gap-fill').setAttribute('d', `${path}L392 25L48 225Z`);
  document.querySelectorAll('.chart-points circle').forEach((circle, i) => circle.setAttribute('cy', points[i]));
  document.querySelector('.lab-observation').textContent = overconfident
    ? 'The model sounds certain, but its accuracy falls short. This gap is the problem I study.'
    : 'For a calibrated model, stated confidence matches observed accuracy.';
  document.querySelector('#chart-desc').textContent = overconfident
    ? 'Illustrative overconfidence: model accuracy is lower than its predicted confidence across the curve.'
    : 'Illustrative calibration: model accuracy equals predicted confidence across the curve.';
}));

// Motion is progressive enhancement; content stays visible without JavaScript.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const avatarStage = document.querySelector('.avatar-stage');
const hero = document.querySelector('.hero');
let heroVisible = true;
new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; }).observe(hero);
hero.addEventListener('pointermove', event => {
  if (reduceMotion.matches || root.dataset.motion === 'paused' || !finePointer.matches) return;
  const box = hero.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width - .5;
  const y = (event.clientY - box.top) / box.height - .5;
  avatarStage.style.setProperty('--turn-x', `${x * 10}deg`);
  avatarStage.style.setProperty('--turn-y', `${-y * 5}deg`);
});
hero.addEventListener('pointerleave', () => {
  avatarStage.style.setProperty('--turn-x', '0deg');
  avatarStage.style.setProperty('--turn-y', '0deg');
});
let pointerFrame;
document.addEventListener('pointermove', event => {
  if (reduceMotion.matches || root.dataset.motion === 'paused' || !finePointer.matches) return;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => {
    root.style.setProperty('--mouse-x', `${event.clientX}px`);
    root.style.setProperty('--mouse-y', `${event.clientY}px`);
  });
}, {passive:true});
const roleText = document.querySelector('#rotating-role');
const researchRoles = [['TRUSTWORTHY', 'AI.'], ['MODEL', 'UNCERTAINTY.'], ['LLM', 'ROBUSTNESS.']];
let researchRoleIndex = 0;
setInterval(() => {
  if (reduceMotion.matches || root.dataset.motion === 'paused' || document.hidden || !heroVisible) return;
  roleText.classList.add('changing');
  setTimeout(() => {
    researchRoleIndex = (researchRoleIndex + 1) % researchRoles.length;
    const [first, second] = researchRoles[researchRoleIndex];
    roleText.replaceChildren(document.createTextNode(first), document.createElement('br'), document.createTextNode(second));
    roleText.classList.remove('changing');
  }, 230);
}, 4500);
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (!reduceMotion.matches && root.dataset.motion !== 'paused') entry.target.classList.add('reveal');
    revealObserver.unobserve(entry.target);
  });
}, {threshold: .1});
document.querySelectorAll('.section-heading, .focus-item, .experience-item, .paper, .toolkit').forEach(element => revealObserver.observe(element));
