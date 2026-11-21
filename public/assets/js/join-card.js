// /join reward: after signup the visitor gets a "founding collector" card with a famous landmark, drawn on a canvas
// (gold line-and-fill art on the brand brown) so it can be saved or shared as a PNG. The landmark and the piece number
// come from a hash of the email, so the same person always gets the same card. It is a collectible for fun: the card
// itself says it is not a share of any property, has no value and is not affiliated with the landmark.
// Landmarks are public-domain monuments; Italian ones are left out (their images need permission for commercial use).

const GOLD = '#d0b677', DEEP = '#8a6a2b', W = 900, H = 1200;

// each landmark draws in a 200 x 240 box, base on y = 236
const ART = {
  liberty(g) { // Statue of Liberty: star-fort base, pedestal, robed figure, raised torch, crown, tablet
    g.fillRect(40, 214, 120, 22); g.fillRect(58, 196, 84, 18);
    g.fillRect(70, 150, 60, 46); g.fillRect(64, 146, 72, 6); g.fillRect(64, 190, 72, 6);
    shape(g, [[84, 146], [116, 146], [110, 100], [112, 70], [104, 58], [96, 58], [88, 70], [90, 100]]);
    shape(g, [[106, 74], [114, 66], [122, 24], [116, 22], [108, 60], [102, 68]]); // raised arm
    shape(g, [[112, 24], [126, 24], [122, 12], [119, 4], [116, 12]]); // torch and flame
    g.beginPath(); g.arc(100, 52, 8, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 7; i++) { const a = Math.PI * (1.08 + i * 0.14); line(g, 100 + Math.cos(a) * 8, 46 + Math.sin(a) * 6, 100 + Math.cos(a) * 17, 46 + Math.sin(a) * 15, 2.2, GOLD); }
    shape(g, [[86, 84], [78, 86], [80, 104], [88, 102]]); // tablet
    g.fillStyle = DEEP; for (const x of [78, 94, 110]) g.fillRect(x, 158, 12, 28); g.fillStyle = GOLD;
  },
  eiffel(g) {
    shape(g, [[28, 236], [52, 236], [74, 186], [126, 186], [148, 236], [172, 236], [124, 132], [112, 70], [104, 14], [96, 14], [88, 70], [76, 132]]);
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(62, 236); g.quadraticCurveTo(100, 176, 138, 236); g.fill();
    g.fillRect(70, 180, 60, 7); g.fillRect(82, 126, 36, 6); g.fillRect(91, 66, 18, 4);
    for (let y = 192; y < 230; y += 10) line(g, 50 + (236 - y) * 0.1, y, 150 - (236 - y) * 0.1, y, 1, DEEP);
    g.fillStyle = GOLD; g.fillRect(98, 2, 4, 14);
  },
  bigben(g) { // Elizabeth Tower
    g.fillRect(74, 96, 52, 140); g.fillRect(70, 86, 60, 12);
    shape(g, [[70, 86], [130, 86], [118, 54], [82, 54]]); shape(g, [[86, 54], [114, 54], [100, 6]]);
    g.fillStyle = DEEP; g.beginPath(); g.arc(100, 70, 13, 0, Math.PI * 2); g.fill();
    g.fillStyle = GOLD; g.beginPath(); g.arc(100, 70, 10, 0, Math.PI * 2); g.fill();
    line(g, 100, 70, 100, 62, 1.6, DEEP); line(g, 100, 70, 106, 72, 1.6, DEEP);
    g.fillStyle = DEEP; for (let y = 110; y < 228; y += 18) for (const x of [80, 96, 112]) g.fillRect(x, y, 8, 12);
  },
  towerbridge(g) {
    for (const x of [34, 126]) {
      g.fillRect(x, 70, 40, 166); shape(g, [[x - 4, 70], [x + 44, 70], [x + 20, 30]]);
      for (const dx of [0, 34]) { g.fillRect(x + dx, 52, 6, 20); shape(g, [[x + dx - 2, 52], [x + dx + 8, 52], [x + dx + 3, 40]]); }
      g.fillStyle = DEEP; g.fillRect(x + 12, 96, 16, 26); g.fillRect(x + 12, 140, 16, 26); g.fillStyle = GOLD;
    }
    g.fillRect(74, 84, 52, 8); g.fillRect(74, 96, 52, 5); g.fillRect(0, 176, 200, 10);
    line(g, 0, 176, 34, 140, 3, GOLD); line(g, 200, 176, 166, 140, 3, GOLD);
    g.fillStyle = DEEP; g.fillRect(0, 198, 200, 3); g.fillStyle = GOLD;
  },
  arc(g) { // Arc de Triomphe
    g.fillRect(36, 70, 128, 166); g.fillRect(30, 60, 140, 12); g.fillRect(34, 50, 132, 10);
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(80, 236); g.lineTo(80, 150); g.arc(100, 150, 20, Math.PI, 0); g.lineTo(120, 236); g.fill();
    g.fillRect(44, 160, 22, 40); g.fillRect(134, 160, 22, 40); g.fillRect(44, 92, 112, 6); g.fillRect(46, 104, 24, 36); g.fillRect(130, 104, 24, 36);
    g.fillStyle = GOLD;
  },
  brandenburg(g) {
    g.fillRect(14, 96, 172, 16); g.fillRect(20, 84, 160, 12); g.fillRect(70, 66, 60, 18);
    for (let i = 0; i < 6; i++) g.fillRect(22 + i * 30, 112, 9, 116);
    g.fillRect(12, 226, 176, 10);
    shape(g, [[86, 66], [92, 50], [100, 46], [108, 50], [114, 66]]); // quadriga
    line(g, 100, 46, 100, 30, 2.5, GOLD); g.beginPath(); g.arc(100, 28, 5, 0, Math.PI * 2); g.fill();
  },
  tajmahal(g) {
    g.fillRect(40, 140, 120, 86); g.fillRect(20, 226, 160, 10);
    g.beginPath(); g.moveTo(62, 140); g.bezierCurveTo(56, 92, 82, 70, 100, 58); g.bezierCurveTo(118, 70, 144, 92, 138, 140); g.fill();
    g.fillRect(98, 34, 4, 26);
    for (const x of [6, 186]) { g.fillRect(x, 96, 8, 130); g.beginPath(); g.arc(x + 4, 96, 7, Math.PI, 0); g.fill(); }
    for (const x of [48, 140]) { g.beginPath(); g.arc(x, 140, 10, Math.PI, 0); g.fill(); }
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(86, 226); g.lineTo(86, 178); g.quadraticCurveTo(100, 158, 114, 178); g.lineTo(114, 226); g.fill();
    for (const x of [52, 134]) { g.beginPath(); g.moveTo(x, 210); g.lineTo(x, 182); g.quadraticCurveTo(x + 7, 170, x + 14, 182); g.lineTo(x + 14, 210); g.fill(); }
    g.fillStyle = GOLD;
  },
  giza(g) {
    g.fillStyle = DEEP; shape(g, [[8, 236], [62, 156], [112, 236]]); g.fillStyle = GOLD;
    shape(g, [[56, 236], [126, 120], [196, 236]]); shape(g, [[0, 236], [34, 186], [70, 236]]);
    g.fillStyle = DEEP; shape(g, [[126, 120], [196, 236], [150, 236]]); g.fillStyle = GOLD;
    g.beginPath(); g.arc(170, 60, 14, 0, Math.PI * 2); g.fill();
  }
};
function shape(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
function line(g, x1, y1, x2, y2, w, c) { g.save(); g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore(); }

// FNV-1a: the same email always gives the same card
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

function round(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

export async function makeCard({ email, name, src, T, landmarks, logoSrc = '/assets/img/logo.svg' }) {
  const h = hash(email.toLowerCase());
  const lm = landmarks[h % landmarks.length];
  const piece = String((h >>> 8) % 1000 + 1).padStart(4, '0');
  await document.fonts.load('600 40px Montserrat').catch(() => {});
  const logo = new Image(); logo.src = logoSrc; await logo.decode().catch(() => {});

  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const bg = g.createRadialGradient(W / 2, 470, 60, W / 2, 600, 820);
  bg.addColorStop(0, '#5a4527'); bg.addColorStop(0.55, '#3b2d19'); bg.addColorStop(1, '#221a0e');
  round(g, 0, 0, W, H, 48); g.fillStyle = bg; g.fill();
  g.strokeStyle = 'rgba(215, 186, 120, 0.7)'; g.lineWidth = 3; round(g, 26, 26, W - 52, H - 52, 30); g.stroke();
  g.strokeStyle = 'rgba(215, 186, 120, 0.25)'; g.lineWidth = 1.5; round(g, 40, 40, W - 80, H - 80, 22); g.stroke();

  g.textBaseline = 'alphabetic'; g.fillStyle = GOLD;
  if (logo.naturalWidth) g.drawImage(logo, 76, 74, 64, 64);
  g.font = '600 22px Montserrat, system-ui, sans-serif'; g.letterSpacing = '6px';
  g.fillText('MYNTAS', 156, 104);
  g.font = '500 18px Montserrat, system-ui, sans-serif'; g.letterSpacing = '4px'; g.fillStyle = 'rgba(208, 182, 119, 0.75)';
  g.fillText(T.cardKicker.toUpperCase(), 156, 132);

  const glow = g.createRadialGradient(W / 2, 470, 10, W / 2, 470, 300);
  glow.addColorStop(0, 'rgba(240, 214, 150, 0.32)'); glow.addColorStop(1, 'rgba(240, 214, 150, 0)');
  g.fillStyle = glow; g.fillRect(0, 160, W, 640);
  g.save(); g.translate(W / 2 - 200 * 1.9 / 2, 250); g.scale(1.9, 1.9); g.fillStyle = GOLD; ART[lm.id](g); g.restore();
  g.fillStyle = 'rgba(208, 182, 119, 0.5)'; g.fillRect(150, 702, W - 300, 2);

  g.textAlign = 'center'; g.letterSpacing = '0px';
  g.fillStyle = '#f7f1e5'; g.font = '600 56px Montserrat, system-ui, sans-serif'; g.fillText(lm.name, W / 2, 790);
  g.fillStyle = GOLD; g.font = '500 26px Montserrat, system-ui, sans-serif'; g.letterSpacing = '5px'; g.fillText(lm.city.toUpperCase(), W / 2, 834);

  g.letterSpacing = '0px'; g.textAlign = 'left';
  const row = (label, value, y) => {
    g.fillStyle = 'rgba(208, 182, 119, 0.8)'; g.font = '500 20px Montserrat, system-ui, sans-serif'; g.fillText(label.toUpperCase(), 100, y);
    g.fillStyle = '#f7f1e5'; g.font = '600 30px Montserrat, system-ui, sans-serif'; g.fillText(value, 100, y + 38);
  };
  row(T.cardPiece, `#${piece} / 1000`, 900);
  row(T.cardHolder, name.slice(0, 26), 990);
  g.textAlign = 'right';
  g.fillStyle = 'rgba(208, 182, 119, 0.8)'; g.font = '500 20px Montserrat, system-ui, sans-serif'; g.fillText(T.cardEdition.toUpperCase(), W - 100, 900);
  g.fillStyle = '#f7f1e5'; g.font = '600 30px Montserrat, system-ui, sans-serif';
  g.fillText(src === 'web' ? T.cardOnline : src.split('-').map(w => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(' '), W - 100, 938);

  g.textAlign = 'center'; g.fillStyle = 'rgba(208, 182, 119, 0.7)'; g.font = '400 17px Montserrat, system-ui, sans-serif';
  wrap(g, T.cardDisclaimer, W / 2, 1092, W - 200, 24);
  return { canvas: c, landmark: lm, piece };
}

function wrap(g, text, x, y, max, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > max && line) { g.fillText(line, x, y); y += lh; line = w; } else line = t;
  }
  if (line) g.fillText(line, x, y);
}
