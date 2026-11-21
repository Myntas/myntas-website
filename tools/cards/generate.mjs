// Regenerates the collector-card assets after editing the places in public/join/copy.js:
//   public/assets/img/cards/<id>-share.jpg (LinkedIn/X preview) and <id>-thumb.png (Apple Wallet thumbnail),
//   public/join/card/<id>/index.html (the share page each card links to).
// Run from the repo root:  npm i --no-save playwright && npx playwright install chromium && node tools/cards/generate.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve('public');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = req.url.split('?')[0];
  const file = p === '/gen.html' ? path.resolve('tools/cards/gen.html') : path.join(root, decodeURIComponent(p));
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(data); });
}).listen(0);
const port = server.address().port;

const { COPY, CONFIG } = await import(path.resolve('public/join/copy.js'));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:${port}/gen.html`);
await page.waitForFunction(() => window.out, null, { timeout: 300000 });
const out = await page.evaluate(() => window.out);
await browser.close(); server.close();

const imgDir = path.join(root, 'assets/img/cards');
fs.mkdirSync(imgDir, { recursive: true });
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
fs.rmSync(path.join(root, 'join/card'), { recursive: true, force: true });
for (const lm of CONFIG.landmarks) {
  const o = out[lm.id];
  fs.writeFileSync(path.join(imgDir, `${lm.id}-share.jpg`), Buffer.from(o.share.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(imgDir, `${lm.id}-thumb.png`), Buffer.from(o.thumb.split(',')[1], 'base64'));
  const [cls, rar] = COPY.en.cardClass[lm.cls];
  const t = esc(`Founding collector of ${lm.name} · Myntas`), d = esc(`${cls}, ${rar.toLowerCase()}. A Myntas collectible card. Join the waitlist and get yours.`);
  const img = `https://www.myntas.com/assets/img/cards/${lm.id}-share.jpg`, dir = path.join(root, 'join/card', lm.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title>
<meta name="description" content="${d}">
<meta name="robots" content="noindex">
<!-- share page for a collector card (generated from public/join/copy.js): networks read the preview, people go on to the waitlist -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Myntas">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="https://www.myntas.com/join/card/${lm.id}/">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0; url=/join/?src=card-share">
</head>
<body><p><a href="/join/?src=card-share">Join the Myntas waitlist</a></p></body>
</html>
`);
}
console.log(`${CONFIG.landmarks.length} cards written`);
