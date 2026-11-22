import { pick } from '/assets/js/join-pick.js';

// /join reward: after signup the visitor gets a "founding collector" card with a famous landmark, drawn on a canvas
// (gold line-and-fill art on the brand brown) so it can be saved or shared as a PNG. The landmark and the piece number
// come from a hash of the email, so the same person always gets the same card. It is a collectible with no intrinsic value: the card
// says (in a note under it on the page) that it is not a share of any property, has no value and is not affiliated with any landmark.
// Three classes with their own odds: real landmarks (public domain; no Italian or Greek monuments, whose images need
// permission for commercial use), legendary places, and space.

const W = 900, H = 1200;
// one look per rarity, all in the brand colours (cream, browns, golds):
// common gold on brown; uncommon bright gold on dark brown with a double frame; rare brown on cream;
// epic cream on gold; legendary gold foil on deep brown, with rays and sparkles.
// GOLD / DEEP are the art colours of the theme in use (setTheme), read by every drawing below.
export const THEMES = {
  common: { bg: ['#4f3c22', '#3b2d19', '#2a2012'], accent: '#b79144', deep: '#725920', ink: '#f7f1e5', rgb: '183, 145, 68', glow: '240, 214, 150', badge: 'soft' },
  uncommon: { bg: ['#5a4527', '#33261a', '#1c150b'], accent: '#d0b677', deep: '#8a6a2b', ink: '#f7f1e5', rgb: '208, 182, 119', glow: '245, 222, 165', badge: 'gold', double: true },
  rare: { bg: ['#fffaf0', '#f7f1e5', '#e6d7b8'], accent: '#3b2d19', deep: '#b79144', ink: '#3b2d19', rgb: '138, 106, 43', glow: '255, 255, 255', badge: 'brown', light: true },
  epic: { bg: ['#dcc387', '#b79144', '#8a6a2b'], accent: '#f7f1e5', deep: '#8a6a2b', ink: '#3b2d19', rgb: '59, 45, 25', glow: '255, 244, 214', badge: 'brown', light: true },
  legendary: { bg: ['#3b2d19', '#1f170c', '#0e0a05'], accent: '#d0b677', deep: '#725920', ink: '#f7f1e5', rgb: '208, 182, 119', glow: '240, 214, 150', badge: 'foil', foil: true }
};
let GOLD = THEMES.common.accent, DEEP = THEMES.common.deep;
export function setTheme(tier) { const t = THEMES[tier] || THEMES.common; GOLD = t.accent; DEEP = t.deep; return t; }
// gold foil: the brand golds in a band, for the legendary frame, badge and rule
export function foil(g, x0, y0, x1, y1) {
  const h = g.createLinearGradient(x0, y0, x1, y1);
  [['#f3dea4', 0], ['#b79144', 0.3], ['#725920', 0.5], ['#d0b677', 0.7], ['#a37e2d', 1]].forEach(([c, o]) => h.addColorStop(o, c));
  return h;
}
// the logo mark in any colour (the SVG is gold, which would vanish on the epic gold)
function tinted(img, color, size) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  x.drawImage(img, 0, 0, size, size); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, size, size);
  return c;
}

// each landmark draws in a 200 x 240 box, base on y = 236
export const ART = {
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
  colosseum(g) { // three arcaded tiers, the outer ring broken on the right
    shape(g, [[10, 236], [10, 80], [140, 70], [176, 96], [190, 150], [190, 236]]);
    g.fillStyle = DEEP;
    for (const [y, h] of [[196, 34], [148, 32], [104, 28]]) for (let x = 18; x < 180; x += 20) { if (y < 120 && x > 140) continue; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + 8); g.arc(x + 6, y + 8, 6, Math.PI, 0); g.lineTo(x + 12, y + h); g.fill(); }
    g.fillRect(10, 140, 180, 3); g.fillRect(10, 186, 180, 3); g.fillStyle = GOLD;
  },
  pisa(g) {
    g.fillRect(0, 228, 200, 8);
    g.save(); g.translate(100, 228); g.rotate(0.09);
    g.fillRect(-26, -190, 52, 190); g.fillRect(-20, -212, 40, 22); g.fillRect(-30, -4, 60, 6);
    g.fillStyle = DEEP; for (let y = -180; y < -10; y += 24) { g.fillRect(-28, y + 20, 56, 2); for (let x = -22; x < 22; x += 11) { g.beginPath(); g.moveTo(x, y + 18); g.lineTo(x, y + 6); g.arc(x + 4, y + 6, 4, Math.PI, 0); g.lineTo(x + 8, y + 18); g.fill(); } }
    for (let x = -16; x < 16; x += 9) g.fillRect(x, -206, 5, 12); g.restore(); g.fillStyle = GOLD;
  },
  duomo(g) { // Brunelleschi's dome on its drum, with Giotto's bell tower
    g.fillRect(10, 160, 120, 76); g.fillRect(30, 128, 80, 32);
    g.beginPath(); g.moveTo(30, 128); g.bezierCurveTo(30, 60, 110, 60, 110, 128); g.fill(); g.fillRect(64, 54, 12, 16); shape(g, [[62, 54], [78, 54], [70, 40]]);
    g.fillStyle = DEEP; for (const x of [50, 70, 90]) line(g, x, 128, 70 + (x - 70) * 0.25, 74, 2, DEEP); for (let x = 36; x < 108; x += 14) g.fillRect(x, 140, 6, 12); g.fillStyle = GOLD;
    g.fillRect(146, 70, 34, 166); g.fillRect(142, 62, 42, 8);
    g.fillStyle = DEEP; for (let y = 84; y < 220; y += 34) g.fillRect(156, y, 14, 20); g.beginPath(); g.moveTo(50, 236); g.lineTo(50, 200); g.arc(60, 200, 10, Math.PI, 0); g.lineTo(70, 236); g.fill(); g.fillStyle = GOLD;
  },
  pontevecchio(g) {
    g.fillStyle = DEEP; g.fillRect(0, 214, 200, 22); g.fillStyle = GOLD;
    g.fillRect(0, 150, 200, 40);
    for (const [x, w] of [[0, 30], [62, 76], [170, 30]]) { g.fillStyle = DEEP; g.beginPath(); g.moveTo(x, 236); g.lineTo(x, 214); g.quadraticCurveTo(x + w / 2, 168, x + w, 214); g.lineTo(x + w, 236); g.fill(); }
    g.fillStyle = GOLD; for (const [x, w] of [[30, 32], [138, 32]]) g.fillRect(x, 190, w, 46);
    for (let x = 2; x < 196; x += 22) { g.fillRect(x, 120 + (x % 3) * 6, 20, 32 - (x % 3) * 6); shape(g, [[x - 1, 120 + (x % 3) * 6], [x + 21, 120 + (x % 3) * 6], [x + 10, 110 + (x % 3) * 6]]); }
    g.fillRect(80, 96, 40, 30); g.fillStyle = DEEP; for (let x = 6; x < 196; x += 22) g.fillRect(x, 160, 8, 12); for (let x = 86; x < 116; x += 10) g.fillRect(x, 104, 6, 10); g.fillStyle = GOLD;
  },
  rialto(g) {
    g.fillStyle = DEEP; g.fillRect(0, 220, 200, 16); g.fillStyle = GOLD;
    g.beginPath(); g.moveTo(0, 220); g.quadraticCurveTo(100, 120, 200, 220); g.lineTo(200, 236); g.lineTo(170, 236); g.quadraticCurveTo(100, 160, 30, 236); g.lineTo(0, 236); g.fill();
    g.fillRect(70, 118, 60, 40); shape(g, [[64, 118], [136, 118], [100, 96]]);
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(90, 158); g.lineTo(90, 136); g.arc(100, 136, 10, Math.PI, 0); g.lineTo(110, 158); g.fill();
    for (const x of [30, 140]) for (let i = 0; i < 3; i++) g.fillRect(x + i * 10, 178 - (x < 100 ? i * 8 : (2 - i) * 8), 6, 10);
    g.fillStyle = GOLD;
  },
  parthenon(g) {
    g.fillRect(6, 210, 188, 10); g.fillRect(0, 220, 200, 16); g.fillRect(14, 112, 172, 12);
    shape(g, [[10, 112], [190, 112], [100, 78]]);
    for (let i = 0; i < 8; i++) g.fillRect(22 + i * 21, 124, 10, 86);
    g.fillStyle = DEEP; shape(g, [[34, 108], [166, 108], [100, 86]]); g.fillStyle = GOLD;
  },
  sagrada(g) {
    g.fillRect(20, 170, 160, 66);
    for (const [x, h, w] of [[34, 110, 16], [58, 140, 18], [82, 160, 18], [118, 160, 18], [142, 140, 18], [166, 110, 16], [100, 200, 22]]) {
      g.beginPath(); g.moveTo(x - w / 2, 170); g.lineTo(x - w / 2, 170 - h * 0.65); g.quadraticCurveTo(x - w / 2, 170 - h, x, 170 - h - 6); g.quadraticCurveTo(x + w / 2, 170 - h, x + w / 2, 170 - h * 0.65); g.lineTo(x + w / 2, 170); g.fill();
      g.beginPath(); g.arc(x, 170 - h - 8, 4, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = DEEP; for (const x of [58, 82, 118, 142]) for (let y = 120; y < 166; y += 12) g.fillRect(x - 2, y, 4, 7);
    g.beginPath(); g.moveTo(88, 236); g.lineTo(88, 200); g.quadraticCurveTo(100, 182, 112, 200); g.lineTo(112, 236); g.fill(); g.fillStyle = GOLD;
  },
  petra(g) { // the Treasury carved into the rock
    g.fillStyle = DEEP; shape(g, [[0, 236], [0, 60], [14, 30], [40, 18], [70, 26], [96, 10], [130, 20], [160, 8], [186, 30], [200, 64], [200, 236]]); g.fillStyle = GOLD;
    g.fillRect(30, 140, 140, 96); g.fillRect(26, 132, 148, 10); shape(g, [[26, 132], [70, 132], [48, 112]]); shape(g, [[130, 132], [174, 132], [152, 112]]);
    g.fillRect(36, 70, 26, 62); g.fillRect(138, 70, 26, 62); g.fillRect(84, 72, 32, 60); g.beginPath(); g.moveTo(80, 72); g.bezierCurveTo(80, 44, 120, 44, 120, 72); g.fill(); g.fillRect(98, 34, 4, 14);
    g.fillStyle = DEEP; for (let i = 0; i < 4; i++) g.fillRect(44 + i * 34 + (i > 1 ? 10 : 0), 150, 8, 86); g.fillRect(90, 186, 20, 50); g.fillStyle = GOLD;
  },
  machupicchu(g) {
    shape(g, [[70, 236], [128, 60], [142, 52], [156, 70], [200, 150], [200, 236]]);
    g.fillStyle = DEEP; shape(g, [[128, 60], [142, 52], [156, 70], [170, 120], [140, 100]]); g.fillStyle = GOLD;
    for (let i = 0; i < 6; i++) g.fillRect(0, 236 - i * 12 - 12, 120 - i * 14, 10);
    g.fillStyle = DEEP; for (const [x, y] of [[16, 210], [44, 198], [70, 186], [28, 174]]) { g.fillRect(x, y, 14, 10); shape(g, [[x - 2, y], [x + 16, y], [x + 7, y - 6]]); } g.fillStyle = GOLD;
  },
  neuschwanstein(g) {
    shape(g, [[0, 236], [40, 190], [100, 176], [170, 196], [200, 236]]);
    g.fillRect(56, 110, 70, 80); shape(g, [[52, 110], [130, 110], [92, 84]]);
    for (const [x, y, w, h] of [[40, 70, 16, 120], [132, 92, 18, 98], [104, 50, 14, 70], [150, 130, 14, 60]]) { g.fillRect(x, y, w, h); shape(g, [[x - 3, y], [x + w + 3, y], [x + w / 2, y - 26]]); }
    g.fillStyle = DEEP; for (let x = 62; x < 120; x += 12) { g.fillRect(x, 124, 6, 12); g.fillRect(x, 150, 6, 12); } g.fillStyle = GOLD;
  },
  chichen(g) { // El Castillo: nine terraces, a central stair and the temple on top
    for (let i = 0; i < 9; i++) g.fillRect(14 + i * 9, 222 - i * 15, 172 - i * 18, 14);
    g.fillRect(78, 72, 44, 28); g.fillRect(74, 66, 52, 8);
    g.fillStyle = DEEP; g.fillRect(90, 100, 20, 136); g.fillRect(84, 80, 8, 20); g.fillRect(108, 80, 8, 20);
    for (let y = 104; y < 234; y += 6) line(g, 90, y, 110, y, 1, GOLD); g.fillStyle = GOLD;
  },
  valhalla(g) { // the hall of the gods: a long hall roofed with shields, rays behind
    for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; line(g, 100, 130, 100 + Math.cos(a) * 96, 130 + Math.sin(a) * 96, 2, 'rgba(208, 182, 119, 0.45)'); }
    g.fillRect(14, 160, 172, 76); shape(g, [[6, 162], [100, 96], [194, 162]]);
    line(g, 100, 96, 84, 78, 4, GOLD); line(g, 100, 96, 116, 78, 4, GOLD);
    g.fillStyle = DEEP; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(34 + i * 22, 150 - Math.abs(3 - i) * 0 - (3 - Math.abs(3 - i)) * 12, 8, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.moveTo(86, 236); g.lineTo(86, 196); g.arc(100, 196, 14, Math.PI, 0); g.lineTo(114, 236); g.fill(); g.fillStyle = GOLD;
  },
  avalon(g) { // an island in the mist, with its apple tree
    g.fillStyle = DEEP; g.fillRect(0, 214, 200, 22); g.fillStyle = GOLD;
    g.beginPath(); g.ellipse(100, 214, 80, 18, 0, Math.PI, 0); g.fill();
    g.fillRect(96, 140, 8, 64);
    for (const [x, y, r] of [[100, 120, 34], [74, 136, 22], [126, 136, 22]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = DEEP; for (const [x, y] of [[90, 110], [112, 122], [80, 136], [124, 140], [102, 96]]) { g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(242, 230, 200, 0.55)'; for (const [y, w] of [[200, 180], [222, 150]]) g.fillRect(100 - w / 2, y, w, 4); g.fillStyle = GOLD;
  },
  cityz(g) { // ruins in the jungle
    g.fillRect(40, 140, 120, 96); g.fillRect(60, 110, 80, 30); g.fillRect(84, 86, 32, 24);
    g.fillStyle = DEEP; g.fillRect(90, 190, 20, 46); for (const x of [52, 136]) g.fillRect(x, 160, 12, 18); g.fillRect(70, 118, 60, 4); g.fillStyle = GOLD;
    for (const x of [8, 176, 192]) { g.fillRect(x, 120, 6, 116); for (let i = 0; i < 5; i++) { g.save(); g.translate(x + 3, 120); g.rotate(-1.2 + i * 0.6); g.beginPath(); g.ellipse(0, -20, 6, 22, 0, 0, Math.PI * 2); g.fill(); g.restore(); } }
    g.save(); g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 150); g.bezierCurveTo(60, 170, 70, 120, 96, 140); g.moveTo(160, 120); g.bezierCurveTo(140, 150, 150, 170, 126, 186); g.stroke(); g.restore();
  },
  olympusmons(g) { // a lodge on the tallest volcano in the solar system
    g.beginPath(); g.moveTo(0, 236); g.bezierCurveTo(40, 200, 70, 130, 100, 124); g.bezierCurveTo(130, 130, 160, 200, 200, 236); g.fill();
    g.fillStyle = DEEP; g.beginPath(); g.ellipse(100, 128, 22, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD;
    g.fillRect(126, 150, 24, 14); shape(g, [[122, 150], [154, 150], [138, 140]]); g.fillStyle = DEEP; g.fillRect(134, 154, 6, 10); g.fillStyle = GOLD;
    for (const [x, y] of [[30, 40], [70, 70], [160, 30], [180, 90], [120, 50]]) g.fillRect(x, y, 3, 3);
    g.beginPath(); g.arc(40, 90, 8, 0, Math.PI * 2); g.fill();
  },
  europa(g) { // an ice station, Jupiter filling the sky
    g.beginPath(); g.arc(130, 70, 56, 0, Math.PI * 2); g.fill();
    g.fillStyle = DEEP; for (const [y, h] of [[44, 8], [62, 6], [84, 10], [104, 5]]) g.fillRect(74, y, 112, h); g.beginPath(); g.ellipse(150, 90, 12, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD;
    g.fillStyle = '#f2e6c8'; g.beginPath(); g.moveTo(0, 236); g.lineTo(0, 196); g.bezierCurveTo(70, 186, 130, 200, 200, 188); g.lineTo(200, 236); g.fill();
    g.fillStyle = DEEP; line(g, 20, 220, 90, 206, 1.5, DEEP); line(g, 110, 226, 180, 204, 1.5, DEEP);
    g.fillStyle = GOLD; g.beginPath(); g.moveTo(40, 200); g.bezierCurveTo(40, 160, 96, 160, 96, 200); g.fill(); g.fillRect(96, 186, 36, 14); g.fillRect(132, 176, 18, 24);
    line(g, 141, 176, 141, 150, 2, GOLD); g.beginPath(); g.arc(141, 148, 5, 0, Math.PI * 2); g.fill();
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
// drawing families for the long list: a place in copy.js names one with `art` and passes options in `v`
export const FAMILY = {
  bridge(g, v) { // suspension bridge; v.tower: 'art' (Golden Gate), 'gothic' (Brooklyn), 'modern'
    g.fillStyle = DEEP; g.fillRect(0, 214, 200, 22); g.fillStyle = GOLD; g.fillRect(0, 170, 200, 8);
    for (const x of [52, 148]) {
      if (v.tower === 'gothic') { g.fillRect(x - 14, 70, 28, 150); g.fillStyle = DEEP; for (const dx of [-8, 2]) { g.beginPath(); g.moveTo(x + dx, 140); g.lineTo(x + dx, 100); g.arc(x + dx + 3, 100, 3, Math.PI, 0); g.lineTo(x + dx + 6, 140); g.fill(); } g.fillStyle = GOLD; }
      else { g.fillRect(x - 12, 60, 6, 160); g.fillRect(x + 6, 60, 6, 160); for (const y of [70, 110, 150]) g.fillRect(x - 12, y, 24, v.tower === 'art' ? 8 : 5); }
    }
    g.save(); g.strokeStyle = GOLD; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 120); g.quadraticCurveTo(26, 150, 46, 64); g.quadraticCurveTo(100, 176, 154, 64); g.quadraticCurveTo(174, 150, 200, 120); g.stroke();
    g.lineWidth = 1; for (let x = 8; x < 196; x += 8) { const y = x < 46 ? 120 + (x / 46) * -40 + 30 : x > 154 ? 120 + ((200 - x) / 46) * -40 + 30 : 64 + Math.pow((x - 100) / 54, 2) * 100 * 0.94; g.beginPath(); g.moveTo(x, Math.min(y, 168)); g.lineTo(x, 170); g.stroke(); } g.restore();
  },
  rowhouses(g, v) { // v.roof: 'victorian' | 'gable' | 'flat'; v.n houses
    const n = v.n || 5, w = 190 / n; g.fillRect(0, 226, 200, 10);
    for (let i = 0; i < n; i++) {
      const x = 5 + i * w, h = 110 + ((i * 37) % 3) * 14, top = 226 - h;
      g.fillStyle = i % 2 ? GOLD : '#e2c98e'; g.fillRect(x + 1, top, w - 2, h);
      if (v.roof === 'victorian') shape(g, [[x - 2, top + 2], [x + w / 2, top - 30], [x + w + 2, top + 2]]);
      else if (v.roof === 'gable') { shape(g, [[x + 1, top], [x + w / 2, top - 24], [x + w - 1, top]]); g.fillRect(x + w / 2 - 2, top - 30, 4, 8); }
      else g.fillRect(x, top - 6, w, 6);
      g.fillStyle = DEEP; for (let y = top + 14; y < 200; y += 28) { g.fillRect(x + w * 0.2, y, w * 0.22, 16); g.fillRect(x + w * 0.58, y, w * 0.22, 16); }
      g.fillRect(x + w * 0.38, 200, w * 0.24, 26); if (v.roof === 'victorian') { g.beginPath(); g.arc(x + w / 2, top - 4, 4, 0, Math.PI * 2); g.fill(); }
    } g.fillStyle = GOLD;
  },
  mountain(g, v) { // v.kind: 'peak' | 'twin' | 'flat' | 'rock' | 'dome' | 'cone'; v.snow
    const k = v.kind;
    const pts = k === 'flat' ? [[0, 236], [30, 120], [50, 104], [150, 104], [172, 124], [200, 236]]
      : k === 'rock' ? [[10, 236], [24, 170], [50, 150], [150, 146], [178, 166], [192, 236]]
      : k === 'dome' ? null : k === 'cone' ? [[0, 236], [80, 80], [120, 80], [200, 236]]
      : k === 'twin' ? [[0, 236], [60, 90], [90, 130], [130, 60], [200, 236]] : [[0, 236], [70, 130], [104, 30], [120, 70], [140, 110], [200, 236]];
    if (pts) shape(g, pts); else { g.beginPath(); g.moveTo(10, 236); g.lineTo(10, 140); g.bezierCurveTo(14, 50, 150, 40, 150, 120); g.lineTo(150, 236); g.fill(); }
    if (v.snow && pts) { g.fillStyle = '#f2e6c8'; const p = k === 'flat' ? [[30, 120], [50, 104], [150, 104], [172, 124], [150, 120], [120, 128], [90, 118], [60, 128]] : k === 'cone' ? [[80, 80], [120, 80], [136, 104], [114, 96], [100, 108], [86, 96], [64, 104]] : [[86, 72], [104, 30], [120, 70], [124, 84], [110, 78], [100, 92]]; shape(g, p); }
    if (k === 'cone') { g.fillStyle = 'rgba(242, 230, 200, 0.6)'; for (const [x, y, r] of [[100, 60, 12], [112, 44, 9], [94, 32, 7]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } }
    if (k === 'rock') { g.fillStyle = DEEP; for (let x = 40; x < 170; x += 22) line(g, x, 160, x + 6, 236, 1.5, DEEP); }
    g.fillStyle = DEEP; g.fillRect(0, 228, 200, 8); g.fillStyle = GOLD;
  },
  canyon(g, v) { // layered canyon walls, or mesas (Monument Valley)
    if (v.kind === 'mesa') { for (const [x, w, h] of [[10, 40, 110], [80, 26, 150], [140, 50, 96]]) { g.fillRect(x, 236 - h, w, h); shape(g, [[x - 14, 236], [x, 236 - h * 0.35], [x + w, 236 - h * 0.35], [x + w + 14, 236]]); } g.fillStyle = DEEP; g.fillRect(0, 228, 200, 8); g.fillStyle = GOLD; return; }
    for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? GOLD : '#e2c98e'; shape(g, [[0, 80 + i * 26], [40 + i * 6, 74 + i * 26], [70 + i * 8, 96 + i * 26], [80 + i * 8, 236], [0, 236]]); shape(g, [[200, 70 + i * 26], [160 - i * 6, 80 + i * 26], [130 - i * 8, 98 + i * 26], [120 - i * 8, 236], [200, 236]]); }
    g.fillStyle = DEEP; shape(g, [[80, 236], [96, 200], [104, 200], [120, 236]]); g.fillStyle = GOLD;
  },
  falls(g, v) { // v.kind: 'wide' | 'tall'
    if (v.kind === 'tall') { shape(g, [[40, 236], [60, 20], [140, 20], [160, 236]]); g.fillStyle = '#f2e6c8'; g.fillRect(94, 20, 12, 196); g.fillStyle = 'rgba(242, 230, 200, 0.6)'; g.beginPath(); g.ellipse(100, 222, 34, 10, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD; return; }
    g.fillRect(0, 70, 200, 26); g.fillStyle = '#f2e6c8'; for (let x = 4; x < 200; x += 12) g.fillRect(x, 96, 8, 104); g.fillStyle = 'rgba(242, 230, 200, 0.55)';
    for (const [x, r] of [[30, 22], [80, 28], [130, 24], [176, 20]]) { g.beginPath(); g.arc(x, 204, r, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = DEEP; g.fillRect(0, 214, 200, 22); g.fillStyle = GOLD;
  },
  lighthouse(g) {
    shape(g, [[0, 236], [20, 196], [70, 186], [130, 190], [180, 200], [200, 236]]);
    shape(g, [[84, 190], [116, 190], [110, 80], [90, 80]]); g.fillStyle = DEEP; for (const y of [104, 140, 172]) g.fillRect(84, y, 32, 12); g.fillStyle = GOLD;
    g.fillRect(84, 66, 32, 14); g.fillStyle = '#f2e6c8'; g.fillRect(90, 50, 20, 16); g.fillStyle = GOLD; shape(g, [[86, 50], [114, 50], [100, 36]]);
    g.fillStyle = 'rgba(242, 230, 200, 0.4)'; shape(g, [[110, 52], [200, 30], [200, 70]]); shape(g, [[90, 52], [0, 34], [0, 70]]); g.fillStyle = GOLD;
  },
  pagoda(g, v) { // v.tiers, v.round (Temple of Heaven)
    const n = v.tiers || 3; g.fillRect(30, 216, 140, 20);
    for (let i = 0; i < n; i++) {
      const y = 210 - i * (150 / n), w = 130 - i * (70 / n), h = 150 / n;
      g.fillRect(100 - w * 0.36, y - h + 14, w * 0.72, h - 14);
      if (v.round) { g.beginPath(); g.ellipse(100, y - h + 14, w / 2, 9, 0, Math.PI, 0); g.fill(); }
      else shape(g, [[100 - w / 2 - 8, y - h + 18], [100 - w * 0.36, y - h + 8], [100 + w * 0.36, y - h + 8], [100 + w / 2 + 8, y - h + 18]]);
      g.fillStyle = DEEP; for (let x = 100 - w * 0.3; x < 100 + w * 0.3; x += 12) g.fillRect(x, y - h + 22, 6, h - 22); g.fillStyle = GOLD;
    }
    g.fillRect(98, 210 - 150 - 20, 4, 26); g.beginPath(); g.arc(100, 210 - 150 - 22, 5, 0, Math.PI * 2); g.fill();
    if (v.water) { g.fillStyle = DEEP; g.fillRect(0, 228, 200, 8); g.fillStyle = GOLD; }
  },
  torii(g, v) {
    if (v.water) { g.fillStyle = DEEP; g.fillRect(0, 200, 200, 36); g.fillStyle = GOLD; }
    const gate = (x, s) => { g.save(); g.translate(x, 0); g.scale(s, 1);
      g.fillRect(-60, 210 - 150 * s, 10, 150 * s); g.fillRect(50, 210 - 150 * s, 10, 150 * s);
      shape(g, [[-80, 70 + (1 - s) * 100], [80, 70 + (1 - s) * 100], [74, 82 + (1 - s) * 100], [-74, 82 + (1 - s) * 100]]); g.fillRect(-66, 100 + (1 - s) * 100, 132, 8); g.restore(); };
    if (v.many) for (const [x, s] of [[100, 0.55], [100, 0.7], [100, 0.85]]) gate(x, s); gate(100, 1);
  },
  dome(g, v) { // v.minarets, v.cap: 'cross' | 'crescent' | 'statue'
    g.fillRect(30, 150, 140, 86); g.fillRect(56, 120, 88, 30);
    g.beginPath(); g.moveTo(56, 122); g.bezierCurveTo(56, 50, 144, 50, 144, 122); g.fill();
    for (const x of [44, 156]) { g.beginPath(); g.arc(x, 150, 16, Math.PI, 0); g.fill(); }
    g.fillRect(97, 48, 6, 20); if (v.cap === 'cross') { g.fillRect(94, 38, 12, 4); g.fillRect(98, 30, 4, 18); } else if (v.cap === 'crescent') { g.beginPath(); g.arc(100, 40, 6, 0, Math.PI * 2); g.fill(); } else { g.beginPath(); g.arc(100, 42, 5, 0, Math.PI * 2); g.fill(); }
    const m = v.minarets || 0; const xs = m >= 6 ? [6, 22, 178, 194, 30, 170] : m >= 4 ? [8, 26, 174, 192] : m === 2 ? [12, 188] : [];
    for (const x of xs) { g.fillRect(x - 3, 70, 6, 166); shape(g, [[x - 4, 70], [x + 4, 70], [x, 50]]); g.fillRect(x - 5, 110, 10, 4); }
    g.fillStyle = DEEP; for (let x = 40; x < 165; x += 16) g.fillRect(x, 170, 8, 20); g.fillRect(90, 196, 20, 40); for (let x = 62; x < 140; x += 14) g.fillRect(x, 128, 6, 14); g.fillStyle = GOLD;
  },
  gothic(g, v) { // twin towers (Notre-Dame), twin spires (Cologne) or many spires (Milan)
    g.fillRect(30, 120, 140, 116); shape(g, [[60, 120], [140, 120], [100, 90]]);
    const towers = v.kind === 'spires' ? [[44, 40], [156, 40]] : v.kind === 'many' ? [] : [[44, 66], [156, 66]];
    for (const [x, top] of towers) { g.fillRect(x - 18, top + 40, 36, 196 - top - 40); if (v.kind === 'spires') shape(g, [[x - 18, top + 40], [x + 18, top + 40], [x, top - 30]]); else g.fillRect(x - 20, top + 34, 40, 8); }
    if (v.kind === 'many') for (let i = 0; i < 11; i++) { const x = 30 + i * 14; g.fillRect(x - 2, 60 + Math.abs(5 - i) * 8, 4, 70); shape(g, [[x - 3, 60 + Math.abs(5 - i) * 8], [x + 3, 60 + Math.abs(5 - i) * 8], [x, 46 + Math.abs(5 - i) * 8]]); }
    g.fillStyle = DEEP; g.beginPath(); g.arc(100, 150, 18, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD; g.beginPath(); g.arc(100, 150, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = DEEP; for (const x of [44, 100, 156]) { g.beginPath(); g.moveTo(x - 10, 236); g.lineTo(x - 10, 200); g.arc(x, 200, 10, Math.PI, 0); g.lineTo(x + 10, 236); g.fill(); } g.fillStyle = GOLD;
  },
  castle(g, v) { // v.hill, v.spire (Mont-Saint-Michel), v.japanese (Himeji), v.clouds
    if (v.clouds) { g.fillStyle = '#f2e6c8'; for (const [x, y, r] of [[30, 210, 24], [62, 200, 30], [100, 210, 26], [140, 200, 30], [172, 210, 24]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } g.fillStyle = GOLD; }
    else if (v.hill) shape(g, [[0, 236], [30, 196], [70, 176], [130, 176], [170, 196], [200, 236]]); else g.fillRect(0, 226, 200, 10);
    if (v.japanese) { FAMILY.pagoda(g, { tiers: 4 }); return; }
    const base = v.hill || v.clouds ? 180 : 226;
    g.fillRect(40, base - 70, 120, 70); for (let x = 40; x < 160; x += 14) g.fillRect(x, base - 80, 8, 10);
    for (const x of [30, 150]) { g.fillRect(x, base - 100, 20, 100); shape(g, [[x - 4, base - 100], [x + 24, base - 100], [x + 10, base - 126]]); }
    if (v.spire) { g.fillRect(90, base - 120, 20, 50); shape(g, [[88, base - 120], [112, base - 120], [100, base - 186]]); }
    else { g.fillRect(84, base - 110, 32, 40); shape(g, [[80, base - 110], [120, base - 110], [100, base - 140]]); }
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(92, base); g.lineTo(92, base - 22); g.arc(100, base - 22, 8, Math.PI, 0); g.lineTo(108, base); g.fill(); for (const x of [56, 132]) g.fillRect(x, base - 50, 8, 14); g.fillStyle = GOLD;
  },
  hut(g, v) { // 'overwater' bungalow or 'tree' house
    if (v.kind === 'tree') {
      g.fillRect(90, 120, 20, 116); for (const [x, y, r] of [[70, 70, 40], [130, 70, 40], [100, 44, 40]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = DEEP; g.fillRect(60, 110, 80, 40); g.fillStyle = GOLD; g.fillRect(64, 114, 72, 32); shape(g, [[54, 114], [146, 114], [100, 88]]);
      g.fillStyle = DEEP; g.fillRect(92, 124, 16, 22); g.fillStyle = GOLD; line(g, 60, 150, 60, 236, 2, GOLD); line(g, 74, 150, 74, 236, 2, GOLD); for (let y = 160; y < 236; y += 12) line(g, 60, y, 74, y, 2, GOLD); return;
    }
    g.fillStyle = DEEP; g.fillRect(0, 196, 200, 40); g.fillStyle = GOLD;
    for (const [x, s] of [[60, 1], [150, 0.7]]) { g.save(); g.translate(x, 196); g.scale(s, s); for (const dx of [-30, -10, 10, 30]) g.fillRect(dx - 2, -10, 4, 40); g.fillRect(-40, -16, 80, 8); g.fillRect(-34, -60, 68, 44); shape(g, [[-48, -58], [48, -58], [0, -100]]); g.fillStyle = DEEP; g.fillRect(-8, -44, 16, 28); g.fillStyle = GOLD; g.restore(); }
    g.beginPath(); g.arc(170, 50, 16, 0, Math.PI * 2); g.fill();
  },
  igloo(g, v) {
    g.fillStyle = '#f2e6c8'; g.fillRect(0, 196, 200, 40); g.beginPath(); g.moveTo(30, 200); g.bezierCurveTo(30, 100, 170, 100, 170, 200); g.fill();
    g.fillStyle = DEEP; for (const y of [176, 152, 130]) line(g, 40, y, 160, y, 1.2, DEEP); for (let x = 44; x < 160; x += 18) line(g, x, 176, x + 4, 152, 1.2, DEEP);
    g.fillStyle = '#e2c98e'; g.beginPath(); g.moveTo(130, 200); g.lineTo(130, 174); g.arc(150, 174, 20, Math.PI, 0); g.lineTo(170, 200); g.fill(); g.fillStyle = DEEP; g.beginPath(); g.moveTo(138, 200); g.lineTo(138, 178); g.arc(150, 178, 12, Math.PI, 0); g.lineTo(162, 200); g.fill();
    g.fillStyle = GOLD; if (v.aurora) { g.save(); g.strokeStyle = 'rgba(208, 182, 119, 0.6)'; g.lineWidth = 6; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(0, 40 + i * 14); g.bezierCurveTo(60, 10 + i * 14, 120, 80 + i * 14, 200, 30 + i * 14); g.stroke(); } g.restore(); }
    else for (const [x, y] of [[30, 40], [80, 20], [150, 50], [180, 24], [110, 60]]) g.fillRect(x, y, 3, 3);
    if (v.penguin) { g.fillStyle = '#221a0e'; g.beginPath(); g.ellipse(190, 196, 8, 14, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f2e6c8'; g.beginPath(); g.ellipse(190, 199, 5, 9, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD; }
  },
  dunes(g, v) { // desert dunes, with an oasis or a UFO (v.ufo)
    g.beginPath(); g.arc(150, 54, 20, 0, Math.PI * 2); g.fill();
    for (const [y, c] of [[170, '#e2c98e'], [196, GOLD]]) { g.fillStyle = c; g.beginPath(); g.moveTo(0, 236); g.lineTo(0, y); g.bezierCurveTo(60, y - 40, 110, y + 30, 200, y - 20); g.lineTo(200, 236); g.fill(); }
    if (v.oasis) for (const x of [40, 60]) { g.fillStyle = DEEP; g.fillRect(x, 150, 5, 50); for (let i = 0; i < 5; i++) { g.save(); g.translate(x + 2, 150); g.rotate(-1.2 + i * 0.6); g.beginPath(); g.ellipse(0, -16, 5, 18, 0, 0, Math.PI * 2); g.fill(); g.restore(); } g.fillStyle = GOLD; }
    if (v.ufo) { g.fillStyle = GOLD; g.beginPath(); g.ellipse(80, 80, 40, 10, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(80, 74, 16, Math.PI, 0); g.fill(); g.fillStyle = 'rgba(242, 230, 200, 0.4)'; shape(g, [[66, 88], [94, 88], [118, 196], [42, 196]]); g.fillStyle = GOLD; }
    if (v.camel) { g.fillStyle = DEEP; g.beginPath(); g.ellipse(130, 176, 16, 8, 0, 0, Math.PI * 2); g.fill(); for (const x of [120, 138]) g.fillRect(x, 180, 3, 16); g.fillRect(144, 160, 4, 16); g.fillStyle = GOLD; }
  },
  tower(g, v) { // TV towers: v.kind 'sphere' (Berlin) or 'lattice' (Tokyo)
    g.fillRect(0, 228, 200, 8);
    if (v.kind === 'lattice') { shape(g, [[60, 228], [80, 228], [100, 130], [120, 228], [140, 228], [104, 60], [100, 20], [96, 60]]); g.fillStyle = DEEP; g.fillRect(84, 150, 32, 8); g.fillRect(92, 96, 16, 6); for (let y = 170; y < 226; y += 14) line(g, 70 + (228 - y) * 0.1, y, 130 - (228 - y) * 0.1, y, 1, DEEP); g.fillStyle = GOLD; return; }
    shape(g, [[90, 228], [110, 228], [104, 110], [96, 110]]); g.beginPath(); g.arc(100, 96, 24, 0, Math.PI * 2); g.fill(); g.fillRect(97, 30, 6, 50);
    g.fillStyle = DEEP; g.fillRect(76, 92, 48, 6); g.fillStyle = GOLD;
  },
  arch(g, v) { // 'gateway' parabola (St. Louis) or 'gate' (India Gate)
    if (v.kind === 'gateway') { g.save(); g.strokeStyle = GOLD; g.lineWidth = 10; g.beginPath(); g.moveTo(30, 230); g.bezierCurveTo(40, -40, 160, -40, 170, 230); g.stroke(); g.restore(); g.fillStyle = DEEP; g.fillRect(0, 228, 200, 8); g.fillStyle = GOLD; return; }
    g.fillRect(50, 70, 100, 166); g.fillRect(44, 60, 112, 12); g.fillRect(70, 44, 60, 16);
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(80, 236); g.lineTo(80, 130); g.arc(100, 130, 20, Math.PI, 0); g.lineTo(120, 236); g.fill(); g.fillStyle = GOLD;
  },
  whitehouses(g) { // Santorini: white houses and blue domes on the cliff
    shape(g, [[0, 236], [0, 120], [200, 170], [200, 236]]);
    g.fillStyle = '#f2e6c8'; for (const [x, y, w, h] of [[10, 96, 40, 30], [56, 108, 34, 28], [96, 120, 40, 30], [140, 132, 34, 28], [20, 136, 34, 24], [80, 150, 30, 22]]) g.fillRect(x, y, w, h);
    g.fillStyle = DEEP; for (const [x, y] of [[30, 96], [116, 120]]) { g.beginPath(); g.arc(x, y, 12, Math.PI, 0); g.fill(); g.fillRect(x - 1, y - 18, 2, 6); }
    for (const [x, y] of [[20, 106], [66, 116], [106, 130], [150, 140]]) g.fillRect(x, y, 6, 10); g.fillStyle = GOLD; g.beginPath(); g.arc(170, 50, 18, 0, Math.PI * 2); g.fill();
  },
  lake(g, v) { // Loch Ness: a ruined castle, the lake, and a famous neck
    g.fillStyle = DEEP; g.fillRect(0, 180, 200, 56); g.fillStyle = GOLD;
    shape(g, [[0, 180], [0, 120], [40, 100], [80, 140], [120, 110], [160, 130], [200, 100], [200, 180]]);
    g.fillRect(20, 120, 30, 60); for (let x = 20; x < 50; x += 8) g.fillRect(x, 114, 5, 6);
    g.save(); g.strokeStyle = GOLD; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(120, 210); g.bezierCurveTo(126, 170, 150, 160, 152, 186); g.stroke(); g.beginPath(); g.arc(170, 208, 12, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(196, 208, 10, Math.PI, 0); g.stroke(); g.restore();
    g.beginPath(); g.ellipse(156, 168, 10, 6, -0.4, 0, Math.PI * 2); g.fill();
  },
  workshop(g) { // Santa's workshop at the North Pole
    g.fillStyle = '#f2e6c8'; g.fillRect(0, 206, 200, 30); g.fillStyle = GOLD;
    g.fillRect(40, 140, 120, 66); shape(g, [[30, 142], [100, 90], [170, 142]]); g.fillStyle = '#f2e6c8'; shape(g, [[30, 142], [100, 90], [170, 142], [160, 146], [100, 100], [40, 146]]);
    g.fillStyle = DEEP; g.fillRect(88, 168, 24, 38); g.fillRect(54, 156, 20, 20); g.fillRect(126, 156, 20, 20); g.fillStyle = GOLD; g.fillRect(130, 96, 14, 30);
    g.fillRect(186, 120, 6, 86); for (let y = 124; y < 200; y += 14) { g.fillStyle = DEEP; g.fillRect(186, y, 6, 6); } g.fillStyle = GOLD; g.beginPath(); g.arc(189, 116, 6, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; line(g, 40, 40, 40 + Math.cos(a) * 14, 40 + Math.sin(a) * 14, 4, GOLD); }
  },
  cave(g) { // the Yeti's cave, high in the Himalaya
    shape(g, [[0, 236], [50, 90], [80, 120], [110, 50], [150, 110], [200, 236]]); g.fillStyle = '#f2e6c8'; shape(g, [[92, 76], [110, 50], [126, 74], [114, 70], [104, 82]]); shape(g, [[38, 108], [50, 90], [62, 106]]);
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(80, 236); g.lineTo(80, 196); g.bezierCurveTo(80, 160, 130, 160, 130, 196); g.lineTo(130, 236); g.fill();
    g.fillStyle = '#f2e6c8'; for (const [x, y] of [[60, 226], [48, 214], [40, 230], [30, 218]]) { g.beginPath(); g.ellipse(x, y, 4, 7, 0.3, 0, Math.PI * 2); g.fill(); } g.fillStyle = GOLD;
  },
  sea(g) { // the Bermuda Triangle: waves, a compass and a ship that is not there
    g.fillStyle = DEEP; g.fillRect(0, 150, 200, 86); g.fillStyle = GOLD;
    for (let i = 0; i < 4; i++) { g.save(); g.strokeStyle = 'rgba(208, 182, 119, 0.7)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 200; x += 5) g.lineTo(x, 166 + i * 18 + Math.sin(x / 10 + i) * 4); g.stroke(); g.restore(); }
    g.save(); g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.moveTo(100, 30); g.lineTo(170, 140); g.lineTo(30, 140); g.closePath(); g.stroke(); g.restore();
    shape(g, [[100, 60], [108, 92], [100, 124], [92, 92]]); g.fillStyle = DEEP; shape(g, [[100, 92], [108, 92], [100, 124], [92, 92]]); g.fillStyle = GOLD;
  },
  saturn(g, v) { // Saturn with its rings, and a hotel (or a station orbiting the Earth: v.earth)
    if (v.earth) { g.beginPath(); g.arc(100, 270, 140, Math.PI, 0); g.fill(); g.fillStyle = DEEP; shape(g, [[40, 170], [80, 150], [90, 180], [60, 200]]); g.fillStyle = GOLD; }
    else { g.beginPath(); g.arc(70, 80, 40, 0, Math.PI * 2); g.fill(); g.save(); g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.ellipse(70, 80, 70, 16, -0.3, 0, Math.PI * 2); g.stroke(); g.restore(); }
    const sx = v.earth ? 100 : 140, sy = v.earth ? 60 : 160;
    g.fillRect(sx - 40, sy - 4, 80, 8); g.fillRect(sx - 10, sy - 14, 20, 28); g.fillStyle = DEEP; for (const dx of [-60, 30]) g.fillRect(sx + dx, sy - 18, 30, 36); g.fillStyle = GOLD; for (const dx of [-60, 30]) for (let y = sy - 16; y < sy + 16; y += 8) g.fillRect(sx + dx + 2, y, 26, 2);
    for (const [x, y] of [[20, 20], [180, 30], [160, 90], [30, 200], [190, 210]]) g.fillRect(x, y, 3, 3);
  },
  stupa(g, v) { // bell-shaped stupa (Shwedagon), terraced (Borobudur), or prang towers (Wat Arun)
    if (v.kind === 'terraced') { for (let i = 0; i < 5; i++) g.fillRect(20 + i * 14, 226 - i * 18, 160 - i * 28, 18); g.beginPath(); g.arc(100, 136, 18, Math.PI, 0); g.fill(); g.fillRect(98, 102, 4, 20); for (const x of [60, 80, 120, 140]) { g.beginPath(); g.arc(x, 154, 7, Math.PI, 0); g.fill(); } return; }
    if (v.kind === 'prang') { g.fillRect(10, 222, 180, 14); for (const [x, h, w] of [[40, 90, 26], [100, 180, 40], [160, 90, 26]]) { shape(g, [[x - w / 2, 222], [x - w * 0.3, 222 - h * 0.7], [x, 222 - h], [x + w * 0.3, 222 - h * 0.7], [x + w / 2, 222]]); g.fillStyle = DEEP; for (let y = 222 - h * 0.6; y < 214; y += 14) g.fillRect(x - w * 0.36, y, w * 0.72, 3); g.fillStyle = GOLD; } return; }
    g.fillRect(30, 210, 140, 26); g.beginPath(); g.moveTo(50, 210); g.bezierCurveTo(50, 150, 90, 140, 100, 30); g.bezierCurveTo(110, 140, 150, 150, 150, 210); g.fill();
    g.fillStyle = DEEP; for (const y of [176, 160]) g.fillRect(56, y, 88, 3); g.fillStyle = GOLD;
  }
};
export function drawArt(g, lm) {
  g.save(); g.beginPath(); g.rect(-30, -30, 260, 266); g.clip(); // nothing spills below the base line
  if (lm.art) FAMILY[lm.art](g, lm.v || {}); else ART[lm.id](g);
  g.restore();
}
function shape(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
function line(g, x1, y1, x2, y2, w, c) { g.save(); g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore(); }


function round(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

export async function makeCard({ email, name, T, landmarks, rarities, logoSrc = '/assets/img/logo.svg' }) {
  const { lm, tier, piece, of } = pick(email, landmarks, rarities);
  await document.fonts.load('600 40px Montserrat').catch(() => {});
  const logo = new Image(); logo.src = logoSrc; await logo.decode().catch(() => {});

  const th = setTheme(tier), A = a => `rgba(${th.rgb}, ${a})`;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const bg = g.createRadialGradient(W / 2, 470, 60, W / 2, 600, 820);
  bg.addColorStop(0, th.bg[0]); bg.addColorStop(0.55, th.bg[1]); bg.addColorStop(1, th.bg[2]);
  round(g, 0, 0, W, H, 48); g.fillStyle = bg; g.fill();
  if (th.foil) { // legendary: gold rays behind the art and a few sparkles
    g.save(); g.translate(W / 2, 470);
    for (let i = 0; i < 24; i++) { g.rotate(Math.PI / 12); g.fillStyle = 'rgba(208, 182, 119, 0.07)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-30, -720); g.lineTo(30, -720); g.closePath(); g.fill(); }
    g.restore();
    let seed = Number(piece) * 7 + 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(243, 222, 164, ${0.25 + rnd() * 0.6})`; const x = 60 + rnd() * (W - 120), y = 160 + rnd() * 560, r = 1 + rnd() * 3; g.beginPath(); g.moveTo(x, y - r * 3); g.lineTo(x + r, y); g.lineTo(x, y + r * 3); g.lineTo(x - r, y); g.closePath(); g.fill(); }
  }
  g.strokeStyle = th.foil ? foil(g, 0, 0, W, H) : A(0.75); g.lineWidth = th.foil ? 8 : 3; round(g, 26, 26, W - 52, H - 52, 30); g.stroke();
  g.strokeStyle = th.foil ? foil(g, W, 0, 0, H) : A(th.double ? 0.75 : 0.25); g.lineWidth = th.double || th.foil ? 2.5 : 1.5; round(g, 42, 42, W - 84, H - 84, 22); g.stroke();
  if (th.double || th.foil) for (const [x, y] of [[42, 42], [W - 42, 42], [42, H - 42], [W - 42, H - 42]]) { // corner diamonds
    g.fillStyle = th.foil ? '#d0b677' : GOLD; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x + 12, y); g.lineTo(x, y + 12); g.lineTo(x - 12, y); g.closePath(); g.fill();
  }

  g.textBaseline = 'alphabetic';
  const mark = th.light ? th.ink : GOLD;
  if (logo.naturalWidth) g.drawImage(tinted(logo, mark, 128), 76, 74, 64, 64);
  g.fillStyle = mark; g.font = '600 22px Montserrat, system-ui, sans-serif'; g.letterSpacing = '6px';
  g.fillText('MYNTAS', 156, 104);
  g.font = '500 18px Montserrat, system-ui, sans-serif'; g.letterSpacing = '4px'; g.fillStyle = A(0.8);
  g.fillText(T.cardKicker.toUpperCase(), 156, 132);
  g.font = '600 18px Montserrat, system-ui, sans-serif'; g.letterSpacing = '3px';
  const label = `${T.cardType[lm.cls]} · ${T.cardRarity[tier]}`.toUpperCase(), tw = g.measureText(label).width + 36;
  round(g, W - 76 - tw, 80, tw, 44, 22);
  g.fillStyle = th.badge === 'foil' ? foil(g, W - 76 - tw, 80, W - 76, 124) : th.badge === 'gold' ? GOLD : th.badge === 'brown' ? '#3b2d19' : A(0.16); g.fill();
  g.strokeStyle = th.badge === 'brown' ? '#3b2d19' : A(0.7); g.lineWidth = 1.5; g.stroke();
  g.fillStyle = th.badge === 'soft' ? GOLD : th.badge === 'brown' ? '#f7f1e5' : '#2a2012'; g.textAlign = 'center'; g.fillText(label, W - 76 - tw / 2, 109); g.textAlign = 'left';

  const glow = g.createRadialGradient(W / 2, 470, 10, W / 2, 470, 300);
  glow.addColorStop(0, `rgba(${th.glow}, ${th.light ? 0.6 : 0.32})`); glow.addColorStop(1, `rgba(${th.glow}, 0)`);
  g.fillStyle = glow; g.fillRect(0, 160, W, 640);
  g.save(); g.translate(W / 2 - 200 * 1.9 / 2, 250); g.scale(1.9, 1.9); g.fillStyle = GOLD; drawArt(g, lm); g.restore();
  g.fillStyle = th.foil ? foil(g, 150, 0, W - 150, 0) : A(0.55); g.fillRect(150, 702, W - 300, th.foil ? 3 : 2);

  g.textAlign = 'center'; g.letterSpacing = '0px';
  g.fillStyle = th.ink; let fs = 56; g.font = `600 ${fs}px Montserrat, system-ui, sans-serif`;
  while (g.measureText(lm.name).width > W - 170 && fs > 30) { fs -= 2; g.font = `600 ${fs}px Montserrat, system-ui, sans-serif`; }
  g.fillText(lm.name, W / 2, 790);
  g.fillStyle = th.light ? A(0.95) : GOLD; let cs = 26; g.letterSpacing = '5px'; g.font = `500 ${cs}px Montserrat, system-ui, sans-serif`;
  while (g.measureText(lm.city.toUpperCase()).width > W - 170 && cs > 16) { cs -= 2; g.font = `500 ${cs}px Montserrat, system-ui, sans-serif`; }
  g.fillText(lm.city.toUpperCase(), W / 2, 834);

  g.letterSpacing = '0px';
  const row = (label, value, x, align) => {
    g.textAlign = align;
    g.fillStyle = A(0.85); g.font = '500 20px Montserrat, system-ui, sans-serif'; g.fillText(label.toUpperCase(), x, 960);
    g.fillStyle = th.ink; g.font = '600 30px Montserrat, system-ui, sans-serif'; g.fillText(value, x, 998);
  };
  row(T.cardPiece, `#${piece} / ${of}`, 100, 'left');
  row(T.cardHolder, name.slice(0, 24), W - 100, 'right');
  g.textAlign = 'left';
  setTheme('common');

  return { canvas: c, landmark: lm, tier, piece, of };
}


