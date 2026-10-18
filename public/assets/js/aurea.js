// AUREA intro page: an animated preview of the platform (a dashboard that walks through four steps) and the offer lifecycle.
// Every property and figure here is an illustrative example, not an offering. The names are invented on purpose.

const EX = {
  belvedere: { floors: 5, bays: 5, arches: true, roof: 'cornice' },
  tigli: { floors: 4, bays: 4, arches: false, roof: 'pitched' },
  ginestra: { floors: 3, bays: 3, arches: true, roof: 'pitched' },
  glicine: { floors: 3, bays: 4, arches: false, roof: 'pitched' }
};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const eur = new Intl.NumberFormat(document.documentElement.lang === 'en' ? 'en-GB' : 'it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

// facade illustration, drawn from each property's floors, bays, arches and roof
function facade(p, wide) {
  const W = wide ? 640 : 400, Hh = wide ? 360 : 300, ground = Hh - 38;
  const bay = 40, fh = 36;
  const bw = p.bays * bay + 40, bh = p.floors * fh + 18;
  const x0 = (W - bw) / 2, y0 = ground - bh;
  let s = `<svg viewBox="0 0 ${W} ${Hh}" aria-hidden="true">`;
  const sk = [[0.02, 0.42], [0.09, 0.58], [0.15, 0.36], [0.2, 0.5], [0.7, 0.44], [0.76, 0.62], [0.83, 0.4], [0.89, 0.52], [0.95, 0.34]];
  sk.forEach(([fx, fhh], i) => { const w = W * 0.07; const h = Hh * fhh * 0.7; s += `<rect x="${fx * W}" y="${ground - h}" width="${w}" height="${h}" fill="#d6c3a0" opacity="${i % 2 ? 0.28 : 0.4}"/>`; });
  s += `<rect x="0" y="${ground}" width="${W}" height="${Hh - ground}" fill="#3b2d19" opacity="0.06"/>`;
  if (p.roof === 'pitched') s += `<polygon points="${x0 - 8},${y0 + 6} ${x0 + bw / 2},${y0 - 30} ${x0 + bw + 8},${y0 + 6}" fill="#8a6a2b" opacity="0.85"/>`;
  s += `<rect x="${x0}" y="${y0}" width="${bw}" height="${bh}" fill="#dcc9a6"/>`;
  s += `<rect x="${x0 + bw - 8}" y="${y0}" width="8" height="${bh}" fill="#c9b48c"/>`;
  s += `<rect x="${x0 - 4}" y="${y0}" width="${bw + 8}" height="9" fill="#b79144"/>`;
  for (let f = 1; f < p.floors; f++) {
    const yy = ground - (f + 1) * fh + 14;
    s += `<rect x="${x0}" y="${ground - f * fh - 1}" width="${bw}" height="2" fill="#3b2d19" opacity="0.12"/>`;
    for (let b = 0; b < p.bays; b++) {
      const wx = x0 + 20 + b * bay + 10;
      s += `<rect x="${wx - 6}" y="${yy}" width="5" height="22" fill="#b79144" opacity="0.85"/><rect x="${wx}" y="${yy}" width="16" height="22" fill="#4a3820"/><rect x="${wx + 17}" y="${yy}" width="5" height="22" fill="#b79144" opacity="0.85"/>`;
      if (f === 1 && p.floors > 3) s += `<rect x="${wx - 3}" y="${yy + 22}" width="22" height="3" fill="#725920"/>`;
    }
  }
  for (let b = 0; b < p.bays; b++) {
    const ax = x0 + 20 + b * bay + 7, ay = ground - 30;
    if (p.arches) s += `<path d="M${ax} ${ground} V${ay + 12} A11 11 0 0 1 ${ax + 22} ${ay + 12} V${ground} Z" fill="#4a3820"/>`;
    else if (b === Math.floor(p.bays / 2)) s += `<rect x="${ax + 2}" y="${ay + 2}" width="18" height="28" fill="#4a3820"/><rect x="${ax + 2}" y="${ay}" width="18" height="3" fill="#b79144"/>`;
    else s += `<rect x="${ax + 3}" y="${ay + 6}" width="16" height="16" fill="#4a3820"/>`;
  }
  s += `<rect x="${x0}" y="${ground - 34}" width="${bw}" height="2" fill="#3b2d19" opacity="0.15"/>`;
  return s + '</svg>';
}

for (const el of document.querySelectorAll('[data-facade]')) el.innerHTML = facade(EX[el.dataset.facade], 'wide' in el.dataset);

// demo: vertical tabs drive the dashboard views; it advances on its own while on screen until the visitor picks a step
const demo = document.querySelector('.demo-wrap');
if (demo) {
  const STEP_MS = 7000;
  const dash = demo.querySelector('.dash');
  const tabs = [...demo.querySelectorAll('[role="tab"]')];
  const views = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
  let cur = 0, auto = !reduce, visible = false, timer = 0, investRun = 0;

  const schedule = () => {
    clearTimeout(timer);
    const play = auto && visible;
    demo.classList.toggle('playing', play);
    if (play) timer = setTimeout(() => show(cur + 1), STEP_MS);
  };
  const runInvest = () => {
    const run = ++investRun, qty = document.getElementById('dQty'), tot = document.getElementById('dTot'), done = document.getElementById('dDone');
    const set = n => { qty.textContent = n; tot.textContent = eur.format(n * 100); };
    if (reduce) { set(10); done.hidden = false; return; }
    done.hidden = true; set(1);
    let n = 1;
    const live = () => run === investRun && cur === 2;
    const tick = () => {
      if (!live()) return;
      if (n < 10) { set(++n); setTimeout(tick, 150); }
      else setTimeout(() => { if (live()) done.hidden = false; }, 1500);
    };
    setTimeout(tick, 700);
  };
  function show(i, focus) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => {
      const on = k === cur;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      views[k].hidden = !on;
    });
    dash.dataset.nav = cur === 3 ? 1 : 0;
    if (focus) tabs[cur].focus();
    if (cur === 2) runInvest();
    schedule();
  }
  demo.querySelector('[role="tablist"]').addEventListener('click', e => {
    const t = e.target.closest('[role="tab"]');
    if (t) { auto = false; show(tabs.indexOf(t)); }
  });
  demo.querySelector('[role="tablist"]').addEventListener('keydown', e => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault(); auto = false; show(cur + d, true);
  });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; schedule(); }, { threshold: 0.35 }).observe(demo);
  show(0);
}

// offer lifecycle: the line fills and the phases appear when the timeline scrolls into view
const cycle = document.querySelector('.cycle');
if (cycle) {
  if (reduce) cycle.classList.add('in');
  else new IntersectionObserver(([en], ob) => { if (en.isIntersecting) { cycle.classList.add('in'); ob.disconnect(); } }, { threshold: 0.3 }).observe(cycle);
}
