// /join reward: after signup the visitor gets a "founding collector" card with a famous landmark, drawn on a canvas
// (gold line-and-fill art on the brand brown) so it can be saved or shared as a PNG. The landmark and the piece number
// come from a hash of the email, so the same person always gets the same card. It is a collectible for fun: the card
// itself says it is not a share of any property, has no value and is not affiliated with any landmark.
// Three classes with their own odds: real landmarks (public domain; no Italian or Greek monuments, whose images need
// permission for commercial use), legendary places, and space.

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
  },
  stonehenge(g) {
    g.fillRect(0, 226, 200, 10);
    for (const [x, w, h] of [[14, 22, 80], [44, 20, 84], [96, 22, 92], [124, 20, 88], [168, 20, 70]]) g.fillRect(x, 226 - h, w, h);
    g.fillRect(40, 136, 32, 10); g.fillRect(92, 126, 56, 12);
    g.fillStyle = DEEP; g.fillRect(74, 196, 16, 30); g.fillRect(150, 206, 14, 20); g.fillStyle = GOLD;
  },
  greatwall(g) {
    g.beginPath(); g.moveTo(0, 210); g.bezierCurveTo(50, 150, 90, 200, 120, 150); g.bezierCurveTo(140, 118, 170, 130, 200, 110);
    g.lineTo(200, 128); g.bezierCurveTo(172, 146, 146, 136, 128, 168); g.bezierCurveTo(96, 222, 52, 172, 0, 230); g.fill();
    for (const [x, y] of [[40, 166], [120, 140], [186, 104]]) { g.fillRect(x - 10, y - 26, 20, 30); for (let i = 0; i < 3; i++) g.fillRect(x - 10 + i * 8, y - 32, 5, 6); }
    g.fillStyle = DEEP; shape(g, [[0, 236], [60, 200], [110, 236]]); shape(g, [[90, 236], [160, 190], [200, 214], [200, 236]]); g.fillStyle = GOLD;
  },
  fuji(g) {
    shape(g, [[0, 236], [72, 96], [86, 90], [100, 94], [114, 90], [128, 96], [200, 236]]);
    g.fillStyle = '#f2e6c8'; shape(g, [[72, 96], [86, 90], [100, 94], [114, 90], [128, 96], [146, 130], [128, 122], [114, 134], [100, 120], [86, 134], [72, 122], [54, 130]]);
    g.fillStyle = GOLD; g.beginPath(); g.arc(160, 50, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = DEEP; g.fillRect(0, 226, 200, 10); g.fillStyle = GOLD;
  },
  moai(g) {
    g.fillRect(0, 222, 200, 14);
    for (const [x, s] of [[30, 0.8], [100, 1], [160, 0.75]]) {
      g.save(); g.translate(x, 222); g.scale(s, s);
      shape(g, [[-22, 0], [-24, -60], [-20, -130], [-24, -160], [-14, -176], [14, -176], [22, -160], [26, -120], [22, -60], [22, 0]]);
      g.fillStyle = DEEP; g.fillRect(-16, -150, 32, 8); g.fillRect(-4, -142, 8, 34); g.fillRect(-12, -100, 24, 5); g.restore(); g.fillStyle = GOLD;
    }
  },
  windmill(g) {
    g.fillRect(0, 226, 200, 10);
    shape(g, [[76, 226], [88, 110], [112, 110], [124, 226]]); shape(g, [[84, 112], [100, 86], [116, 112]]);
    g.fillStyle = DEEP; g.fillRect(94, 196, 12, 30); g.fillStyle = GOLD;
    g.save(); g.translate(100, 104); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.fillRect(-4, -92, 8, 86); g.fillStyle = DEEP; for (let y = -88; y < -12; y += 10) g.fillRect(-12, y, 8, 6); g.fillStyle = GOLD; } g.restore();
    g.beginPath(); g.arc(100, 104, 7, 0, Math.PI * 2); g.fill();
  },
  angkor(g) {
    g.fillRect(6, 214, 188, 22); g.fillRect(20, 190, 160, 24);
    for (const [x, h, w] of [[30, 70, 26], [70, 96, 26], [100, 124, 32], [130, 96, 26], [170, 70, 26]]) {
      g.beginPath(); g.moveTo(x - w / 2, 190); g.bezierCurveTo(x - w / 2, 190 - h * 0.6, x - 4, 190 - h * 0.85, x, 190 - h); g.bezierCurveTo(x + 4, 190 - h * 0.85, x + w / 2, 190 - h * 0.6, x + w / 2, 190); g.fill();
    }
    g.fillStyle = DEEP; for (let x = 28; x < 180; x += 16) g.fillRect(x, 198, 8, 16); g.fillStyle = GOLD;
  },
  atlantis(g) { // a domed city of columns under the waves
    for (let i = 0; i < 3; i++) { g.save(); g.strokeStyle = GOLD; g.lineWidth = 2.5; g.beginPath(); for (let x = 0; x <= 200; x += 5) g.lineTo(x, 26 + i * 14 + Math.sin(x / 12 + i * 2) * 4); g.stroke(); g.restore(); }
    g.fillRect(10, 222, 180, 14); g.fillRect(30, 206, 140, 16);
    g.beginPath(); g.moveTo(54, 168); g.bezierCurveTo(54, 110, 146, 110, 146, 168); g.fill(); g.fillRect(98, 96, 4, 22);
    g.fillRect(46, 160, 108, 10); for (let i = 0; i < 6; i++) g.fillRect(52 + i * 18, 170, 8, 36);
    g.fillStyle = DEEP; for (const [x, y, r] of [[30, 120, 4], [170, 100, 5], [40, 80, 3], [160, 150, 3]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } g.fillStyle = GOLD;
  },
  eldorado(g) { // stepped golden temple under a sun
    for (let i = 0; i < 5; i++) g.fillRect(20 + i * 16, 220 - i * 26, 160 - i * 32, 18);
    g.fillRect(84, 88, 32, 28); shape(g, [[80, 88], [120, 88], [100, 70]]);
    g.fillStyle = DEEP; g.fillRect(94, 150, 12, 70); g.fillRect(94, 98, 12, 18); g.fillStyle = GOLD;
    g.beginPath(); g.arc(100, 34, 16, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(g, 100 + Math.cos(a) * 22, 34 + Math.sin(a) * 22, 100 + Math.cos(a) * 32, 34 + Math.sin(a) * 32, 2.5, GOLD); }
  },
  camelot(g) {
    g.fillRect(20, 150, 160, 86);
    for (const x of [20, 150]) { g.fillRect(x - 4, 110, 38, 126); shape(g, [[x - 8, 110], [x + 38, 110], [x + 15, 72]]); line(g, x + 15, 72, x + 15, 54, 2, GOLD); shape(g, [[x + 16, 54], [x + 32, 59], [x + 16, 64]]); }
    g.fillRect(78, 96, 44, 140); shape(g, [[72, 96], [128, 96], [100, 44]]); line(g, 100, 44, 100, 22, 2, GOLD); shape(g, [[101, 22], [122, 28], [101, 34]]);
    for (let x = 22; x < 180; x += 14) g.fillRect(x, 142, 8, 10);
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(88, 236); g.lineTo(88, 200); g.arc(100, 200, 12, Math.PI, 0); g.lineTo(112, 236); g.fill();
    for (const x of [30, 160]) g.fillRect(x, 130, 10, 18); g.fillRect(94, 120, 12, 22); g.fillStyle = GOLD;
  },
  olympus(g) { // a temple on a mountain above the clouds
    shape(g, [[0, 236], [60, 150], [84, 162], [100, 128], [118, 158], [140, 146], [200, 236]]);
    g.fillRect(70, 112, 60, 6); shape(g, [[66, 112], [134, 112], [100, 92]]); for (let i = 0; i < 5; i++) g.fillRect(73 + i * 12, 118, 6, 22); g.fillRect(68, 140, 64, 6);
    g.fillStyle = '#f2e6c8';
    for (const [x, y, r] of [[30, 186, 18], [52, 180, 22], [78, 190, 16], [130, 192, 16], [156, 182, 22], [180, 190, 16]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = GOLD;
  },
  mars(g) { // a dome house on Mars, the planet low on the horizon
    g.fillStyle = DEEP; g.beginPath(); g.arc(150, 70, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = GOLD; g.beginPath(); g.arc(150, 70, 34, -1.2, 1.9); g.fill();
    g.beginPath(); g.moveTo(0, 236); g.lineTo(0, 200); g.bezierCurveTo(60, 186, 140, 196, 200, 184); g.lineTo(200, 236); g.fill();
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(40, 200); g.bezierCurveTo(40, 130, 130, 130, 130, 200); g.fill();
    g.fillStyle = GOLD; g.save(); g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 200); g.bezierCurveTo(40, 130, 130, 130, 130, 200); g.stroke();
    g.beginPath(); g.moveTo(62, 170); g.bezierCurveTo(70, 150, 100, 150, 108, 170); g.stroke(); g.restore();
    g.fillRect(74, 176, 22, 24); g.fillRect(130, 186, 30, 14); line(g, 160, 186, 172, 150, 2, GOLD); g.beginPath(); g.arc(172, 148, 5, 0, Math.PI * 2); g.fill();
    for (const [x, y] of [[20, 30], [60, 60], [100, 20], [30, 110], [190, 130]]) g.fillRect(x, y, 3, 3);
  },
  moon(g) { // a base on the Moon, Earth in the sky
    g.beginPath(); g.arc(150, 56, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = DEEP; shape(g, [[136, 44], [150, 38], [158, 52], [146, 62]]); shape(g, [[154, 66], [166, 62], [168, 74]]); g.fillStyle = GOLD;
    g.beginPath(); g.moveTo(0, 236); g.lineTo(0, 204); g.bezierCurveTo(70, 196, 130, 208, 200, 198); g.lineTo(200, 236); g.fill();
    g.fillStyle = DEEP; for (const [x, y, r] of [[40, 220, 8], [150, 222, 10], [100, 228, 5]]) { g.beginPath(); g.ellipse(x, y, r, r / 3, 0, 0, Math.PI * 2); g.fill(); } g.fillStyle = GOLD;
    g.fillRect(40, 172, 70, 28); g.beginPath(); g.arc(75, 172, 20, Math.PI, 0); g.fill(); g.fillRect(110, 182, 40, 12); g.fillRect(150, 168, 26, 32);
    g.fillStyle = DEEP; for (const x of [52, 68, 84]) g.fillRect(x, 182, 10, 8); g.fillStyle = GOLD;
    line(g, 163, 168, 163, 140, 2, GOLD); shape(g, [[164, 140], [182, 146], [164, 152]]);
  }
};
function shape(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
function line(g, x1, y1, x2, y2, w, c) { g.save(); g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore(); }

// FNV-1a: the same email always gives the same card
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

function round(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

export async function makeCard({ email, name, src, T, landmarks, odds = {}, logoSrc = '/assets/img/logo.svg' }) {
  const h = hash(email.toLowerCase());
  // pick the class by its odds (% chance), then a place in that class
  let roll = h % 100, cls = 'landmark';
  for (const [k, p] of Object.entries(odds)) { if (roll < p) { cls = k; break; } roll -= p; }
  const pool = landmarks.filter(l => l.cls === cls).length ? landmarks.filter(l => l.cls === cls) : landmarks;
  const lm = pool[(h >>> 7) % pool.length];
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
  const [clsName, rarity] = (T.cardClass && T.cardClass[lm.cls]) || ['', ''];
  if (rarity) {
    g.font = '600 18px Montserrat, system-ui, sans-serif'; g.letterSpacing = '3px';
    const label = `${clsName} · ${rarity}`.toUpperCase(), tw = g.measureText(label).width + 36;
    round(g, W - 76 - tw, 80, tw, 44, 22);
    g.fillStyle = lm.cls === 'frontier' ? GOLD : lm.cls === 'legend' ? 'rgba(208, 182, 119, 0.35)' : 'rgba(208, 182, 119, 0.14)'; g.fill();
    g.strokeStyle = 'rgba(215, 186, 120, 0.7)'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = lm.cls === 'frontier' ? '#2a2012' : GOLD; g.textAlign = 'center'; g.fillText(label, W - 76 - tw / 2, 109); g.textAlign = 'left';
  }

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
