// Home, after the footer: 55 tokens drop into a glass jar when it scrolls into view, and the pointer pushes them around.
// A small 2D simulation (verlet circles with gravity, inside the jar walls), drawn on #jar. 55, like the palazzo.
const canvas = document.getElementById('jar');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = 55, G = 2400, STEP = 1 / 120;
  const logo = new Image();
  logo.src = '/assets/img/logo.svg';
  let W = 0, H = 0, dpr = 1, r = 20, J = null, sprite = null, running = false, dropped = false, last = 0, acc = 0;
  const coins = [];
  const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, on: false };

  function makeSprite() {
    const s = Math.ceil(r * 2 * dpr) + 4, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d'), R = (s - 4) / 2, m = s / 2;
    const fill = g.createRadialGradient(m - R * 0.35, m - R * 0.4, R * 0.1, m, m, R);
    fill.addColorStop(0, '#fffdf6'); fill.addColorStop(0.7, '#efe2c2'); fill.addColorStop(1, '#d6bd86');
    g.fillStyle = fill; g.beginPath(); g.arc(m, m, R, 0, Math.PI * 2); g.fill();
    g.lineWidth = Math.max(1.5, R * 0.09); g.strokeStyle = '#b79144';
    g.beginPath(); g.arc(m, m, R - g.lineWidth / 2, 0, Math.PI * 2); g.stroke();
    if (logo.complete && logo.naturalWidth) { const L = R * 1.45; g.drawImage(logo, m - L / 2, m - L / 2, L, L); }
    return c;
  }

  function layout() {
    const box = canvas.getBoundingClientRect(), oldW = W, oldH = H;
    W = box.width; H = box.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const jw = Math.min(W * 0.84, 420), jh = Math.min(H * 0.8, jw * 1.05);
    J = { l: (W - jw) / 2, r: (W + jw) / 2, t: H - jh - 18, b: H - 22, cr: jw * 0.16 };
    r = Math.sqrt((0.5 * jw * jh) / (N * Math.PI)); // the pile fills about two thirds of the jar
    if (oldW && coins.length) for (const c of coins) { c.x = (c.x / oldW) * W; c.px = c.x; c.y = H - ((oldH - c.y) / oldH) * H; c.py = c.y; }
    sprite = makeSprite();
  }

  function drop() {
    coins.length = 0;
    for (let i = 0; i < N; i++) {
      const x = J.l + r + Math.random() * (J.r - J.l - 2 * r), y = -r * 2 - i * r * 0.9;
      coins.push({ x, y, px: x + (Math.random() - 0.5) * 2, py: y - 4, a: Math.random() * Math.PI * 2 });
    }
  }

  function walls(c) {
    const { l, r: R, b, cr } = J;
    if (c.x < l + r) c.x = l + r;
    if (c.x > R - r) c.x = R - r;
    if (c.y > b - r) c.y = b - r;
    const cy = b - cr;
    if (c.y > cy) {
      const cx = c.x < l + cr ? l + cr : c.x > R - cr ? R - cr : null; // rounded bottom corners
      if (cx !== null) {
        const dx = c.x - cx, dy = c.y - cy, d = Math.hypot(dx, dy), lim = cr - r;
        if (d > lim) { c.x = cx + (dx / d) * lim; c.y = cy + (dy / d) * lim; }
      }
    }
  }

  function step() {
    for (const c of coins) {
      const vx = (c.x - c.px) * 0.992, vy = (c.y - c.py) * 0.992;
      c.px = c.x; c.py = c.y;
      c.x += vx; c.y += vy + G * STEP * STEP;
      c.a += vx / r;
    }
    if (pointer.on) {
      const R0 = r * 3.2;
      for (const c of coins) {
        const dx = c.x - pointer.x, dy = c.y - pointer.y, d = Math.hypot(dx, dy);
        if (d < R0 && d > 0.01) {
          const f = 1 - d / R0;
          c.x += (dx / d) * f * r * 0.14 + pointer.vx * f * 0.12;
          c.y += (dy / d) * f * r * 0.14 + pointer.vy * f * 0.12;
        }
      }
      pointer.vx *= 0.6; pointer.vy *= 0.6;
    }
    const D = 2 * r, D2 = D * D;
    for (let k = 0; k < 6; k++) {
      for (let i = 0; i < N; i++) {
        const a = coins[i];
        for (let j = i + 1; j < N; j++) {
          const b = coins[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
          if (d2 < D2 && d2 > 1e-6) {
            const d = Math.sqrt(d2), o = (D - d) / 2, nx = dx / d, ny = dy / d;
            a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
          }
        }
      }
      for (const c of coins) walls(c);
    }
  }

  function jarPath(p) {
    const { l, r: R, t, b, cr } = J;
    ctx.beginPath();
    ctx.moveTo(l - p, t);
    ctx.lineTo(l - p, b - cr);
    ctx.arcTo(l - p, b + p, l + cr, b + p, cr + p);
    ctx.lineTo(R - cr, b + p);
    ctx.arcTo(R + p, b + p, R + p, b - cr, cr + p);
    ctx.lineTo(R + p, t);
  }

  function draw() {
    const { l, r: R, t, b } = J, p = 7;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // shadow and glass body behind the tokens
    ctx.fillStyle = 'rgba(59, 45, 25, 0.10)';
    ctx.beginPath(); ctx.ellipse((l + R) / 2, b + p + 8, (R - l) * 0.55, 9, 0, 0, Math.PI * 2); ctx.fill();
    jarPath(p); ctx.closePath();
    ctx.fillStyle = 'rgba(255, 252, 244, 0.45)'; ctx.fill();
    for (const c of coins) {
      if (c.y < -r * 2) continue;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a);
      ctx.drawImage(sprite, -sprite.width / dpr / 2, -sprite.height / dpr / 2, sprite.width / dpr, sprite.height / dpr);
      ctx.restore();
    }
    // glass in front: outline, rim and highlights
    jarPath(p);
    ctx.strokeStyle = 'rgba(163, 126, 45, 0.45)'; ctx.lineWidth = 1.5; ctx.stroke();
    jarPath(1.5);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255, 252, 244, 0.6)'; ctx.strokeStyle = 'rgba(163, 126, 45, 0.5)';
    ctx.beginPath(); ctx.roundRect(l - p - 6, t - 12, R - l + 2 * p + 12, 14, 7); ctx.fill(); ctx.stroke();
    const hl = ctx.createLinearGradient(0, t, 0, b);
    hl.addColorStop(0, 'rgba(255, 255, 255, 0.55)'); hl.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hl;
    ctx.beginPath(); ctx.roundRect(l + 8, t + 12, Math.max(6, (R - l) * 0.05), (b - t) * 0.62, 6); ctx.fill();
    ctx.beginPath(); ctx.roundRect(R - 8 - (R - l) * 0.025, t + 18, Math.max(3, (R - l) * 0.025), (b - t) * 0.35, 4); ctx.fill();
  }

  function frame(now) {
    if (!running) return;
    acc += Math.min(0.05, (now - last) / 1000); last = now;
    while (acc >= STEP) { step(); acc -= STEP; }
    draw();
    requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true; last = performance.now(); acc = 0;
    requestAnimationFrame(frame);
  }

  layout();
  drop();
  if (reduce) { for (let i = 0; i < 900; i++) step(); dropped = true; } // already settled, no falling
  draw();
  logo.addEventListener('load', () => { sprite = makeSprite(); draw(); });
  new ResizeObserver(() => { layout(); draw(); }).observe(canvas);
  new IntersectionObserver(es => {
    const vis = es.some(e => e.isIntersecting);
    if (vis) { if (!dropped) { dropped = true; drop(); } start(); } else running = false;
  }, { threshold: 0.3 }).observe(canvas);

  const at = e => { const bx = canvas.getBoundingClientRect(); return [e.clientX - bx.left, e.clientY - bx.top]; };
  canvas.addEventListener('pointermove', e => {
    const [x, y] = at(e);
    if (pointer.on) { pointer.vx = x - pointer.x; pointer.vy = y - pointer.y; }
    pointer.x = x; pointer.y = y; pointer.on = true;
  });
  canvas.addEventListener('pointerdown', e => { const [x, y] = at(e); pointer.x = x; pointer.y = y; pointer.vx = pointer.vy = 0; pointer.on = true; });
  for (const ev of ['pointerleave', 'pointercancel', 'pointerup']) canvas.addEventListener(ev, e => { if (ev !== 'pointerup' || e.pointerType !== 'mouse') pointer.on = false; });
}
